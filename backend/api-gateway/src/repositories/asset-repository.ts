import { Pool, QueryResult } from 'pg';

export interface ProjectAsset {
  id: number;
  projectId: string;
  assetType: string;
  assetId: string;
  assetName: string;
  assetDescription?: string;
  environment?: string;
  linkedStepId?: string;
  linkedDate: Date;
  linkedBy?: string;
  status: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface AssetSummary {
  projectId: string;
  projectName: string;
  totalAssets: number;
  serverCount: number;
  networkCount: number;
  storageCount: number;
  applicationCount: number;
  databaseCount: number;
  activeAssets: number;
  productionAssets: number;
}

export class AssetRepository {
  constructor(private pool: Pool) {}

  async getProjectAssets(projectId: string): Promise<ProjectAsset[]> {
    const query = `
      SELECT 
        id, project_id, asset_type, asset_id, asset_name, asset_description,
        environment, linked_step_id, linked_date, linked_by, status, metadata,
        created_at, updated_at
      FROM project_assets
      WHERE project_id = $1
      ORDER BY asset_type, asset_name
    `;

    const result: QueryResult = await this.pool.query(query, [projectId]);
    return result.rows.map(this.mapAsset);
  }

  async getProjectAssetSummary(projectId?: string): Promise<AssetSummary[]> {
    let query = `
      SELECT 
        project_id, project_name, total_assets, server_count, network_count,
        storage_count, application_count, database_count, active_assets, production_assets
      FROM project_asset_summary
    `;
    
    const params: any[] = [];
    if (projectId) {
      query += ' WHERE project_id = $1';
      params.push(projectId);
    }
    
    query += ' ORDER BY project_name';

    const result: QueryResult = await this.pool.query(query, params);
    return result.rows.map(row => ({
      projectId: row.project_id,
      projectName: row.project_name,
      totalAssets: parseInt(row.total_assets),
      serverCount: parseInt(row.server_count),
      networkCount: parseInt(row.network_count),
      storageCount: parseInt(row.storage_count),
      applicationCount: parseInt(row.application_count),
      databaseCount: parseInt(row.database_count),
      activeAssets: parseInt(row.active_assets),
      productionAssets: parseInt(row.production_assets),
    }));
  }

  async getStepAssets(projectId: string, stepId: string): Promise<ProjectAsset[]> {
    const query = `
      SELECT 
        id, project_id, asset_type, asset_id, asset_name, asset_description,
        environment, linked_step_id, linked_date, linked_by, status, metadata,
        created_at, updated_at
      FROM project_assets
      WHERE project_id = $1 AND linked_step_id = $2
      ORDER BY asset_type, asset_name
    `;

    const result: QueryResult = await this.pool.query(query, [projectId, stepId]);
    return result.rows.map(this.mapAsset);
  }

  async linkAssetToProject(asset: Partial<ProjectAsset>): Promise<ProjectAsset> {
    const query = `
      INSERT INTO project_assets 
        (project_id, asset_type, asset_id, asset_name, asset_description, 
         environment, linked_step_id, linked_by, status, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;

    const values = [
      asset.projectId,
      asset.assetType,
      asset.assetId,
      asset.assetName,
      asset.assetDescription || null,
      asset.environment || 'development',
      asset.linkedStepId || null,
      asset.linkedBy || 'System',
      asset.status || 'active',
      asset.metadata ? JSON.stringify(asset.metadata) : null,
    ];

    const result: QueryResult = await this.pool.query(query, values);
    return this.mapAsset(result.rows[0]);
  }

  async updateAssetStatus(assetId: number, status: string): Promise<void> {
    const query = `
      UPDATE project_assets 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    await this.pool.query(query, [status, assetId]);
  }

  async deleteAsset(assetId: number): Promise<void> {
    const query = 'DELETE FROM project_assets WHERE id = $1';
    await this.pool.query(query, [assetId]);
  }

  private mapAsset(row: any): ProjectAsset {
    return {
      id: row.id,
      projectId: row.project_id,
      assetType: row.asset_type,
      assetId: row.asset_id,
      assetName: row.asset_name,
      assetDescription: row.asset_description,
      environment: row.environment,
      linkedStepId: row.linked_step_id,
      linkedDate: row.linked_date,
      linkedBy: row.linked_by,
      status: row.status,
      metadata: row.metadata,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
