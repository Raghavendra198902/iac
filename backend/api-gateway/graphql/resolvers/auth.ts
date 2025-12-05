import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PostgresDataSource } from '../datasources/PostgresDataSource';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRATION = '24h';
const JWT_REFRESH_EXPIRATION = '7d';

export const authResolvers = {
  Query: {
    me: async (
      _: any,
      __: any,
      { user, dataSources }: any
    ) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      return await dataSources.postgres.getUser(user.id);
    },

    user: async (
      _: any,
      { id }: { id: string },
      { user, dataSources }: { user: any; dataSources: { postgres: PostgresDataSource } }
    ) => {
      if (!user) {
        throw new Error('Not authenticated');
      }
      // Only admins can view other users
      if (user.role !== 'admin' && user.id !== id) {
        throw new Error('Not authorized');
      }
      return await dataSources.postgres.getUser(id);
    },

    auditLogs: async (
      _: any,
      args: {
        userId?: string;
        resourceType?: string;
        limit?: number;
      },
      { user, dataSources }: any
    ) => {
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Non-admins can only see their own logs
      const userId = user.role === 'admin' ? args.userId : user.id;

      return await dataSources.postgres.listAuditLogs(
        userId,
        args.resourceType,
        args.limit || 50
      );
    },
  },

  Mutation: {
    signup: async (
      _: any,
      { input }: any,
      { dataSources }: { dataSources: { postgres: PostgresDataSource } }
    ) => {
      // Check if user exists
      const existingUser = await dataSources.postgres.getUserByEmail(input.email);
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Create user
      const user = await dataSources.postgres.createUser({
        email: input.email,
        username: input.username,
        passwordHash,
        role: input.role || 'user',
        permissions: {},
      });

      // Generate tokens
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRATION }
      );

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      return {
        token,
        refreshToken,
        user,
        expiresAt: expiresAt.toISOString(),
      };
    },

    login: async (
      _: any,
      { email, password }: { email: string; password: string },
      { dataSources }: { dataSources: { postgres: PostgresDataSource } }
    ) => {
      // Find user
      const user = await dataSources.postgres.getUserByEmail(email);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        throw new Error('Invalid credentials');
      }

      // Update last login
      await dataSources.postgres.updateLastLogin(user.id);

      // Generate tokens
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRATION }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        JWT_REFRESH_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRATION }
      );

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      // Create audit log
      await dataSources.postgres.createAuditLog({
        userId: user.id,
        action: 'LOGIN',
        resourceType: 'user',
        resourceId: user.id,
      });

      return {
        token,
        refreshToken,
        user,
        expiresAt: expiresAt.toISOString(),
      };
    },

    refreshToken: async (
      _: any,
      { token }: { token: string },
      { dataSources }: { dataSources: { postgres: PostgresDataSource } }
    ) => {
      try {
        // Verify refresh token
        const decoded: any = jwt.verify(token, JWT_REFRESH_SECRET);

        // Get user
        const user = await dataSources.postgres.getUser(decoded.id);
        if (!user) {
          throw new Error('User not found');
        }

        // Generate new tokens
        const newToken = jwt.sign(
          { id: user.id, email: user.email, role: user.role },
          JWT_SECRET,
          { expiresIn: JWT_EXPIRATION }
        );

        const newRefreshToken = jwt.sign(
          { id: user.id },
          JWT_REFRESH_SECRET,
          { expiresIn: JWT_REFRESH_EXPIRATION }
        );

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        return {
          token: newToken,
          refreshToken: newRefreshToken,
          user,
          expiresAt: expiresAt.toISOString(),
        };
      } catch (error) {
        throw new Error('Invalid refresh token');
      }
    },
  },

  User: {
    lastLogin: (parent: any) => parent.last_login,
    createdAt: (parent: any) => parent.created_at,
    updatedAt: (parent: any) => parent.updated_at,
  },

  AuditLog: {
    userId: (parent: any) => parent.user_id,
    resourceType: (parent: any) => parent.resource_type,
    resourceId: (parent: any) => parent.resource_id,
    ipAddress: (parent: any) => parent.ip_address,
    userAgent: (parent: any) => parent.user_agent,
    user: async (
      parent: any,
      _: any,
      { dataSources }: { dataSources: { postgres: PostgresDataSource } }
    ) => {
      if (!parent.user_id) return null;
      return await dataSources.postgres.getUser(parent.user_id);
    },
  },
};

// JWT verification middleware
export const verifyToken = (token: string): any => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};
