/**
 * Architecture Asset Management
 * CMDB stores architecture artifacts and relationships
 */

import logger from './utils/logger';

export interface ArchitectureAsset {
  id: string;
  asset_type: 'blueprint' | 'template' | 'pattern' | 'standard' | 'adr' | 'component' | 'service';
  name: string;
  description: string;
  version: string;
  status: 'draft' | 'approved' | 'deprecated' | 'retired';
  
  // Architecture classification
  domain: 'business' | 'application' | 'data' | 'technology' | 'security' | 'integration';
  layer: 'strategy' | 'capability' | 'logical' | 'physical' | 'implementation';
  
  // Governance
  owner: string;
  steward: string;
  approved_by: string[];
  approval_date: Date;
  review_date: Date;
  
  // Relationships
  depends_on: string[];
  related_to: string[];
  implements: string[];  // Which ADRs or standards
  used_by: string[];     // Which projects or blueprints
  
  // Metadata
  tags: Record<string, string>;
  documentation_url: string;
  source_repository: string;
  
  // Metrics
  usage_count: number;
  last_used: Date;
  health_score: number;
  
  // Additional data
  asset_data: any;
}

export interface DependencyGraph {
  root: ArchitectureAsset;
  dependencies: ArchitectureAsset[];
  dependents: ArchitectureAsset[];
  depth: number;
}

export interface ImpactAnalysis {
  directly_affected: ArchitectureAsset[];
  indirectly_affected: ArchitectureAsset[];
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  recommended_actions: string[];
}

export interface PortfolioHealth {
  total_assets: number;
  by_status: Record<string, number>;
  by_domain: Record<string, number>;
  deprecated_count: number;
  avg_health_score: number;
  underutilized: ArchitectureAsset[];
  needs_review: ArchitectureAsset[];
}

export class ArchitectureRepository {
  private db: any;
  
  constructor(db: any) {
    this.db = db;
  }
  
  /**
   * Register new architecture asset
   */
  async registerAsset(asset: ArchitectureAsset): Promise<void> {
    await this.db.query(
      `INSERT INTO architecture_assets (
        id, asset_type, name, description, version, status,
        domain, layer, owner_id, steward_id, approved_by,
        approval_date, review_date, depends_on, related_to,
        implements, used_by, tags, documentation_url, source_repository,
        usage_count, last_used_at, health_score, asset_data
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19, $20, $21, $22, $23, $24
      )`,
      [
        asset.id,
        asset.asset_type,
        asset.name,
        asset.description,
        asset.version,
        asset.status,
        asset.domain,
        asset.layer,
        asset.owner,
        asset.steward,
        JSON.stringify(asset.approved_by),
        asset.approval_date,
        asset.review_date,
        JSON.stringify(asset.depends_on),
        JSON.stringify(asset.related_to),
        JSON.stringify(asset.implements),
        JSON.stringify(asset.used_by),
        JSON.stringify(asset.tags),
        asset.documentation_url,
        asset.source_repository,
        asset.usage_count,
        asset.last_used,
        asset.health_score,
        JSON.stringify(asset.asset_data)
      ]
    );
    
    await this.updateDependencyGraph(asset);
    await this.indexForSearch(asset);
  }
  
  /**
   * Query architecture repository
   */
  async findAssets(criteria: {
    domain?: string;
    layer?: string;
    status?: string;
    asset_type?: string;
    tags?: Record<string, string>;
  }): Promise<ArchitectureAsset[]> {
    let query = 'SELECT * FROM architecture_assets WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;
    
    if (criteria.domain) {
      query += ` AND domain = $${paramIndex}`;
      params.push(criteria.domain);
      paramIndex++;
    }
    
    if (criteria.layer) {
      query += ` AND layer = $${paramIndex}`;
      params.push(criteria.layer);
      paramIndex++;
    }
    
    if (criteria.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(criteria.status);
      paramIndex++;
    }
    
    if (criteria.asset_type) {
      query += ` AND asset_type = $${paramIndex}`;
      params.push(criteria.asset_type);
      paramIndex++;
    }
    
    if (criteria.tags) {
      query += ` AND tags @> $${paramIndex}::jsonb`;
      params.push(JSON.stringify(criteria.tags));
      paramIndex++;
    }
    
    const result = await this.db.query(query, params);
    return result.rows.map(this.mapRowToAsset);
  }
  
  /**
   * Get asset by ID
   */
  async getAsset(assetId: string): Promise<ArchitectureAsset> {
    const result = await this.db.query(
      'SELECT * FROM architecture_assets WHERE id = $1',
      [assetId]
    );
    
    if (result.rows.length === 0) {
      throw new Error(`Asset ${assetId} not found`);
    }
    
    return this.mapRowToAsset(result.rows[0]);
  }
  
  /**
   * Update asset
   */
  async updateAsset(assetId: string, updates: Partial<ArchitectureAsset>): Promise<void> {
    const fields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        params.push(typeof value === 'object' ? JSON.stringify(value) : value);
        paramIndex++;
      }
    });
    
    if (fields.length === 0) return;
    
    fields.push('updated_at = NOW()');
    params.push(assetId);
    
    await this.db.query(
      `UPDATE architecture_assets SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
      params
    );
  }
  
  /**
   * Get dependency graph
   */
  async getDependencyGraph(assetId: string): Promise<DependencyGraph> {
    const asset = await this.getAsset(assetId);
    const dependencies = await this.resolveDependencies(asset.depends_on);
    const dependents = await this.findDependents(assetId);
    
    return {
      root: asset,
      dependencies,
      dependents,
      depth: this.calculateGraphDepth(dependencies)
    };
  }
  
  /**
   * Impact analysis
   */
  async analyzeImpact(assetId: string, changeType: string): Promise<ImpactAnalysis> {
    const graph = await this.getDependencyGraph(assetId);
    const affected = graph.dependents;
    
    const directlyAffected = affected.filter(a => a.depends_on.includes(assetId));
    const indirectlyAffected = affected.filter(a => !a.depends_on.includes(assetId));
    
    return {
      directly_affected: directlyAffected,
      indirectly_affected: indirectlyAffected,
      risk_level: this.calculateRisk(affected.length, changeType),
      recommended_actions: this.generateRecommendations(affected, changeType)
    };
  }
  
  /**
   * Portfolio health monitoring
   */
  async assessPortfolioHealth(): Promise<PortfolioHealth> {
    const assets = await this.getAllAssets();
    
    const byStatus: Record<string, number> = {};
    const byDomain: Record<string, number> = {};
    
    assets.forEach(asset => {
      byStatus[asset.status] = (byStatus[asset.status] || 0) + 1;
      byDomain[asset.domain] = (byDomain[asset.domain] || 0) + 1;
    });
    
    const deprecated = assets.filter(a => a.status === 'deprecated');
    const healthScores = assets.map(a => a.health_score || 0);
    const avgHealthScore = healthScores.reduce((a, b) => a + b, 0) / healthScores.length;
    
    const underutilized = assets.filter(a => 
      a.usage_count < 5 && a.status === 'approved'
    );
    
    const needsReview = assets.filter(a => 
      a.review_date && new Date(a.review_date) < new Date()
    );
    
    return {
      total_assets: assets.length,
      by_status: byStatus,
      by_domain: byDomain,
      deprecated_count: deprecated.length,
      avg_health_score: avgHealthScore,
      underutilized,
      needs_review: needsReview
    };
  }
  
  /**
   * Record asset usage
   */
  async recordUsage(assetId: string): Promise<void> {
    await this.db.query(
      `UPDATE architecture_assets 
       SET usage_count = usage_count + 1, last_used_at = NOW()
       WHERE id = $1`,
      [assetId]
    );
  }
  
  /**
   * Calculate health score
   */
  async calculateHealthScore(assetId: string): Promise<number> {
    const asset = await this.getAsset(assetId);
    let score = 100;
    
    // Deduct points for issues
    if (asset.status === 'deprecated') score -= 50;
    if (asset.status === 'draft') score -= 30;
    
    // Usage score
    if (asset.usage_count < 5) score -= 10;
    
    // Review freshness
    const daysSinceReview = asset.review_date ? 
      Math.floor((Date.now() - new Date(asset.review_date).getTime()) / (1000 * 60 * 60 * 24)) : 
      365;
    if (daysSinceReview > 180) score -= 20;
    if (daysSinceReview > 365) score -= 30;
    
    // Documentation
    if (!asset.documentation_url) score -= 10;
    
    score = Math.max(0, Math.min(100, score));
    
    await this.updateAsset(assetId, { health_score: score });
    
    return score;
  }
  
  /**
   * Link assets (create relationship)
   */
  async linkAssets(
    sourceId: string,
    targetId: string,
    relationship: 'depends_on' | 'related_to' | 'implements' | 'used_by'
  ): Promise<void> {
    const source = await this.getAsset(sourceId);
    
    if (!source[relationship].includes(targetId)) {
      source[relationship].push(targetId);
      await this.updateAsset(sourceId, { [relationship]: source[relationship] });
    }
  }
  
  // Private helper methods
  
  private async updateDependencyGraph(asset: ArchitectureAsset): Promise<void> {
    // Update reverse dependencies
    for (const depId of asset.depends_on) {
      const dep = await this.getAsset(depId);
      if (!dep.used_by.includes(asset.id)) {
        await this.linkAssets(depId, asset.id, 'used_by');
      }
    }
  }
  
  private async indexForSearch(asset: ArchitectureAsset): Promise<void> {
    // Would integrate with search engine (Elasticsearch, etc.)
    logger.info(`Indexing asset ${asset.id} for search`);
  }
  
  private async resolveDependencies(dependencyIds: string[]): Promise<ArchitectureAsset[]> {
    if (dependencyIds.length === 0) return [];
    
    const placeholders = dependencyIds.map((_, i) => `$${i + 1}`).join(',');
    const result = await this.db.query(
      `SELECT * FROM architecture_assets WHERE id IN (${placeholders})`,
      dependencyIds
    );
    
    return result.rows.map(this.mapRowToAsset);
  }
  
  private async findDependents(assetId: string): Promise<ArchitectureAsset[]> {
    const result = await this.db.query(
      `SELECT * FROM architecture_assets WHERE used_by @> $1::jsonb`,
      [JSON.stringify([assetId])]
    );
    
    return result.rows.map(this.mapRowToAsset);
  }
  
  private calculateGraphDepth(dependencies: ArchitectureAsset[]): number {
    // Simple depth calculation - could be recursive for multi-level
    return dependencies.length > 0 ? 1 : 0;
  }
  
  private calculateRisk(affectedCount: number, changeType: string): 'low' | 'medium' | 'high' | 'critical' {
    if (changeType === 'breaking' || affectedCount > 10) return 'critical';
    if (affectedCount > 5) return 'high';
    if (affectedCount > 2) return 'medium';
    return 'low';
  }
  
  private generateRecommendations(affected: ArchitectureAsset[], changeType: string): string[] {
    const recommendations: string[] = [];
    
    if (affected.length > 0) {
      recommendations.push(`Notify ${affected.length} dependent asset owners`);
      recommendations.push('Schedule impact assessment meeting');
    }
    
    if (changeType === 'breaking') {
      recommendations.push('Create migration guide');
      recommendations.push('Provide deprecation timeline');
      recommendations.push('Consider backward compatibility');
    }
    
    if (affected.length > 5) {
      recommendations.push('Phase the rollout');
      recommendations.push('Implement feature flags');
    }
    
    return recommendations;
  }
  
  private async getAllAssets(): Promise<ArchitectureAsset[]> {
    const result = await this.db.query('SELECT * FROM architecture_assets');
    return result.rows.map(this.mapRowToAsset);
  }
  
  private mapRowToAsset(row: any): ArchitectureAsset {
    return {
      id: row.id,
      asset_type: row.asset_type,
      name: row.name,
      description: row.description,
      version: row.version,
      status: row.status,
      domain: row.domain,
      layer: row.layer,
      owner: row.owner_id,
      steward: row.steward_id,
      approved_by: JSON.parse(row.approved_by || '[]'),
      approval_date: row.approval_date,
      review_date: row.review_date,
      depends_on: JSON.parse(row.depends_on || '[]'),
      related_to: JSON.parse(row.related_to || '[]'),
      implements: JSON.parse(row.implements || '[]'),
      used_by: JSON.parse(row.used_by || '[]'),
      tags: JSON.parse(row.tags || '{}'),
      documentation_url: row.documentation_url,
      source_repository: row.source_repository,
      usage_count: row.usage_count || 0,
      last_used: row.last_used_at,
      health_score: row.health_score || 0,
      asset_data: JSON.parse(row.asset_data || '{}')
    };
  }
}

export default ArchitectureRepository;
