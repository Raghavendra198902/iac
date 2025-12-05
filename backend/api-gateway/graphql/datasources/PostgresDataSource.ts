import { Pool, PoolClient } from 'pg';
import { DataSource } from 'apollo-datasource';

export interface InfrastructureRow {
  id: string;
  name: string;
  provider: string;
  region: string;
  status: string;
  template_id?: string;
  config: any;
  tags: string[];
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ComputeResourceRow {
  id: string;
  infrastructure_id: string;
  instance_type: string;
  instance_id?: string;
  cpu_cores: number;
  memory_gb: number;
  disk_gb: number;
  status: string;
  ip_address?: string;
  private_ip?: string;
  availability_zone?: string;
  metadata?: any;
  created_at: Date;
  updated_at: Date;
}

export interface DeploymentRow {
  id: string;
  infrastructure_id: string;
  name: string;
  namespace: string;
  replicas: number;
  desired_replicas: number;
  available_replicas: number;
  status: string;
  image: string;
  image_tag: string;
  env_vars?: any;
  resources?: any;
  created_at: Date;
  updated_at: Date;
}

export interface UserRow {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  role: string;
  permissions: any;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface AuditLogRow {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: any;
  ip_address?: string;
  user_agent?: string;
  timestamp: Date;
}

export class PostgresDataSource extends DataSource {
  private pool: Pool;

  constructor(config: any) {
    super();
    this.pool = new Pool({
      host: config.host || 'localhost',
      port: config.port || 5433,
      database: config.database || 'iac_v3',
      user: config.user || 'postgres',
      password: config.password || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }

  async initialize(config: any): Promise<void> {
    // Test connection
    try {
      const client = await this.pool.connect();
      console.log('✓ Connected to PostgreSQL');
      client.release();
    } catch (error) {
      console.error('✗ Failed to connect to PostgreSQL:', error);
      throw error;
    }
  }

  // ========================================================================
  // Infrastructure Operations
  // ========================================================================

  async getInfrastructure(id: string): Promise<InfrastructureRow | null> {
    const query = 'SELECT * FROM infrastructures WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async listInfrastructures(
    provider?: string,
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ infrastructures: InfrastructureRow[]; totalCount: number }> {
    let query = 'SELECT * FROM infrastructures WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (provider) {
      query += ` AND provider = $${paramIndex}`;
      params.push(provider);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const [dataResult, countResult] = await Promise.all([
      this.pool.query(query, params),
      this.pool.query('SELECT COUNT(*) FROM infrastructures WHERE 1=1' + 
        (provider ? ' AND provider = $1' : '') + 
        (status ? ` AND status = $${provider ? 2 : 1}` : ''),
        params.slice(0, -2)
      )
    ]);

    return {
      infrastructures: dataResult.rows,
      totalCount: parseInt(countResult.rows[0].count)
    };
  }

  async createInfrastructure(data: {
    name: string;
    provider: string;
    region: string;
    templateId?: string;
    config: any;
    tags: string[];
    createdBy?: string;
  }): Promise<InfrastructureRow> {
    const query = `
      INSERT INTO infrastructures (name, provider, region, template_id, config, tags, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await this.pool.query(query, [
      data.name,
      data.provider,
      data.region,
      data.templateId,
      data.config,
      data.tags,
      data.createdBy
    ]);
    return result.rows[0];
  }

  async updateInfrastructure(
    id: string,
    data: Partial<{
      name: string;
      region: string;
      config: any;
      tags: string[];
      status: string;
    }>
  ): Promise<InfrastructureRow | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      return this.getInfrastructure(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE infrastructures
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteInfrastructure(id: string): Promise<boolean> {
    const query = 'DELETE FROM infrastructures WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rowCount > 0;
  }

  // ========================================================================
  // Compute Resource Operations
  // ========================================================================

  async getComputeResource(id: string): Promise<ComputeResourceRow | null> {
    const query = 'SELECT * FROM compute_resources WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getComputeResourcesByInfrastructure(
    infrastructureId: string
  ): Promise<ComputeResourceRow[]> {
    const query = `
      SELECT * FROM compute_resources 
      WHERE infrastructure_id = $1 
      ORDER BY created_at DESC
    `;
    const result = await this.pool.query(query, [infrastructureId]);
    return result.rows;
  }

  // ========================================================================
  // Deployment Operations
  // ========================================================================

  async getDeployment(id: string): Promise<DeploymentRow | null> {
    const query = 'SELECT * FROM deployments WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async listDeployments(
    infrastructureId?: string,
    status?: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ deployments: DeploymentRow[]; totalCount: number }> {
    let query = 'SELECT * FROM deployments WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (infrastructureId) {
      query += ` AND infrastructure_id = $${paramIndex}`;
      params.push(infrastructureId);
      paramIndex++;
    }

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const [dataResult, countResult] = await Promise.all([
      this.pool.query(query, params),
      this.pool.query('SELECT COUNT(*) FROM deployments WHERE 1=1' +
        (infrastructureId ? ' AND infrastructure_id = $1' : '') +
        (status ? ` AND status = $${infrastructureId ? 2 : 1}` : ''),
        params.slice(0, -2)
      )
    ]);

    return {
      deployments: dataResult.rows,
      totalCount: parseInt(countResult.rows[0].count)
    };
  }

  async createDeployment(data: {
    infrastructureId: string;
    name: string;
    namespace: string;
    replicas: number;
    image: string;
    imageTag: string;
    envVars?: any;
    resources?: any;
  }): Promise<DeploymentRow> {
    const query = `
      INSERT INTO deployments (
        infrastructure_id, name, namespace, replicas, desired_replicas,
        available_replicas, image, image_tag, env_vars, resources
      )
      VALUES ($1, $2, $3, $4, $4, 0, $5, $6, $7, $8)
      RETURNING *
    `;
    const result = await this.pool.query(query, [
      data.infrastructureId,
      data.name,
      data.namespace,
      data.replicas,
      data.image,
      data.imageTag,
      data.envVars,
      data.resources
    ]);
    return result.rows[0];
  }

  async scaleDeployment(id: string, replicas: number): Promise<DeploymentRow | null> {
    const query = `
      UPDATE deployments
      SET desired_replicas = $1, updated_at = NOW()
      WHERE id = $2
      RETURNING *
    `;
    const result = await this.pool.query(query, [replicas, id]);
    return result.rows[0] || null;
  }

  async deleteDeployment(id: string): Promise<boolean> {
    const query = 'DELETE FROM deployments WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rowCount > 0;
  }

  // ========================================================================
  // User Operations
  // ========================================================================

  async getUser(id: string): Promise<UserRow | null> {
    const query = 'SELECT * FROM users WHERE id = $1';
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async getUserByEmail(email: string): Promise<UserRow | null> {
    const query = 'SELECT * FROM users WHERE email = $1';
    const result = await this.pool.query(query, [email]);
    return result.rows[0] || null;
  }

  async createUser(data: {
    email: string;
    username: string;
    passwordHash: string;
    role: string;
    permissions?: any;
  }): Promise<UserRow> {
    const query = `
      INSERT INTO users (email, username, password_hash, role, permissions)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await this.pool.query(query, [
      data.email,
      data.username,
      data.passwordHash,
      data.role,
      data.permissions || {}
    ]);
    return result.rows[0];
  }

  async updateLastLogin(userId: string): Promise<void> {
    const query = 'UPDATE users SET last_login = NOW() WHERE id = $1';
    await this.pool.query(query, [userId]);
  }

  // ========================================================================
  // Audit Log Operations
  // ========================================================================

  async createAuditLog(data: {
    userId?: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<AuditLogRow> {
    const query = `
      INSERT INTO audit_logs (
        user_id, action, resource_type, resource_id, details, ip_address, user_agent
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const result = await this.pool.query(query, [
      data.userId,
      data.action,
      data.resourceType,
      data.resourceId,
      data.details,
      data.ipAddress,
      data.userAgent
    ]);
    return result.rows[0];
  }

  async listAuditLogs(
    userId?: string,
    resourceType?: string,
    limit: number = 50
  ): Promise<AuditLogRow[]> {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (userId) {
      query += ` AND user_id = $${paramIndex}`;
      params.push(userId);
      paramIndex++;
    }

    if (resourceType) {
      query += ` AND resource_type = $${paramIndex}`;
      params.push(resourceType);
      paramIndex++;
    }

    query += ` ORDER BY timestamp DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}
