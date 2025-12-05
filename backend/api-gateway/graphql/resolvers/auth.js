"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.authResolvers = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
const JWT_EXPIRATION = '24h';
const JWT_REFRESH_EXPIRATION = '7d';
exports.authResolvers = {
    Query: {
        me: async (_, __, { user, dataSources }) => {
            if (!user) {
                throw new Error('Not authenticated');
            }
            return await dataSources.postgres.getUser(user.id);
        },
        user: async (_, { id }, { user, dataSources }) => {
            if (!user) {
                throw new Error('Not authenticated');
            }
            // Only admins can view other users
            if (user.role !== 'admin' && user.id !== id) {
                throw new Error('Not authorized');
            }
            return await dataSources.postgres.getUser(id);
        },
        auditLogs: async (_, args, { user, dataSources }) => {
            if (!user) {
                throw new Error('Not authenticated');
            }
            // Non-admins can only see their own logs
            const userId = user.role === 'admin' ? args.userId : user.id;
            return await dataSources.postgres.listAuditLogs(userId, args.resourceType, args.limit || 50);
        },
    },
    Mutation: {
        signup: async (_, { input }, { dataSources }) => {
            // Check if user exists
            const existingUser = await dataSources.postgres.getUserByEmail(input.email);
            if (existingUser) {
                throw new Error('User already exists');
            }
            // Hash password
            const passwordHash = await bcryptjs_1.default.hash(input.password, 10);
            // Create user
            const user = await dataSources.postgres.createUser({
                email: input.email,
                username: input.username,
                passwordHash,
                role: input.role || 'user',
                permissions: {},
            });
            // Generate tokens
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
            const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRATION });
            const expiresAt = new Date();
            expiresAt.setHours(expiresAt.getHours() + 24);
            return {
                token,
                refreshToken,
                user,
                expiresAt: expiresAt.toISOString(),
            };
        },
        login: async (_, { email, password }, { dataSources }) => {
            // Find user
            const user = await dataSources.postgres.getUserByEmail(email);
            if (!user) {
                throw new Error('Invalid credentials');
            }
            // Verify password
            const validPassword = await bcryptjs_1.default.compare(password, user.password_hash);
            if (!validPassword) {
                throw new Error('Invalid credentials');
            }
            // Update last login
            await dataSources.postgres.updateLastLogin(user.id);
            // Generate tokens
            const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
            const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRATION });
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
        refreshToken: async (_, { token }, { dataSources }) => {
            try {
                // Verify refresh token
                const decoded = jsonwebtoken_1.default.verify(token, JWT_REFRESH_SECRET);
                // Get user
                const user = await dataSources.postgres.getUser(decoded.id);
                if (!user) {
                    throw new Error('User not found');
                }
                // Generate new tokens
                const newToken = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
                const newRefreshToken = jsonwebtoken_1.default.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRATION });
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + 24);
                return {
                    token: newToken,
                    refreshToken: newRefreshToken,
                    user,
                    expiresAt: expiresAt.toISOString(),
                };
            }
            catch (error) {
                throw new Error('Invalid refresh token');
            }
        },
    },
    User: {
        lastLogin: (parent) => parent.last_login,
        createdAt: (parent) => parent.created_at,
        updatedAt: (parent) => parent.updated_at,
    },
    AuditLog: {
        userId: (parent) => parent.user_id,
        resourceType: (parent) => parent.resource_type,
        resourceId: (parent) => parent.resource_id,
        ipAddress: (parent) => parent.ip_address,
        userAgent: (parent) => parent.user_agent,
        user: async (parent, _, { dataSources }) => {
            if (!parent.user_id)
                return null;
            return await dataSources.postgres.getUser(parent.user_id);
        },
    },
};
// JWT verification middleware
const verifyToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, JWT_SECRET);
    }
    catch (error) {
        return null;
    }
};
exports.verifyToken = verifyToken;
//# sourceMappingURL=auth.js.map