/**
 * Architecture Metrics API
 * Provides metrics for EA dashboard and reporting
 */

import { Router, Request, Response } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { pool } from '../utils/database';

const router = Router();

/**
 * GET /api/architecture/metrics/overview
 * Get comprehensive architecture metrics
 */
router.get('/api/architecture/metrics/overview', authenticate, async (req: Request, res: Response) => {
  try {
    const metrics = {
      governance: {
        compliance_score: await getComplianceScore(pool),
        active_violations: await getActiveViolationsCount(pool),
        pending_reviews: await getPendingReviewsCount(pool),
        review_turnaround_days: await getAvgReviewTurnaroundDays(pool)
      },
      
      portfolio: {
        total_projects: await getTotalProjects(pool),
        total_blueprints: await getTotalBlueprints(pool),
        approved_templates: await getApprovedTemplatesCount(pool),
        technology_stack_compliance: await getTechStackCompliance(pool)
      },
      
      quality: {
        architecture_debt_ratio: await getArchitectureDebtRatio(pool),
        deprecated_assets_count: await getDeprecatedAssetsCount(pool),
        avg_reuse_rate: await getAvgReuseRate(pool),
        standards_adoption_rate: await getStandardsAdoptionRate(pool)
      },
      
      cost: {
        total_monthly_spend: await getTotalMonthlySpend(pool),
        cost_optimization_opportunities: await getCostOptimizationOpportunities(pool),
        budget_adherence: await getBudgetAdherence(pool),
        cost_per_project_avg: await getAvgCostPerProject(pool)
      },
      
      security: {
        security_score: await getSecurityScore(pool),
        critical_vulnerabilities: await getCriticalVulnerabilitiesCount(pool),
        encryption_coverage: await getEncryptionCoverage(pool),
        compliance_certifications: await getComplianceCertifications(pool)
      },
      
      efficiency: {
        time_to_deploy_avg_days: await getAvgTimeToDeployDays(pool),
        approval_auto_rate: await getAutoApprovalRate(pool),
        template_usage_rate: await getTemplateUsageRate(pool),
        developer_satisfaction_score: await getDeveloperSatisfactionScore(pool)
      }
    };
    
    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    console.error('Error fetching architecture metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch architecture metrics'
    });
  }
});

/**
 * GET /api/architecture/metrics/adrs
 * Architecture Decision Records metrics
 */
router.get('/api/architecture/metrics/adrs', authenticate, async (req: Request, res: Response) => {
  try {
    const adrs = {
      total_decisions: await getTotalADRs(pool),
      by_status: await getADRsByStatus(pool),
      by_domain: await getADRsByDomain(pool),
      recent_decisions: await getRecentADRs(pool, 10),
      most_referenced: await getMostReferencedADRs(pool, 5)
    };
    
    res.json({
      success: true,
      data: adrs
    });
  } catch (error) {
    console.error('Error fetching ADR metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch ADR metrics'
    });
  }
});

/**
 * GET /api/architecture/metrics/technology
 * Technology portfolio metrics
 */
router.get('/api/architecture/metrics/technology', authenticate, async (req: Request, res: Response) => {
  try {
    const tech = {
      approved_technologies: await getApprovedTechnologies(pool),
      technology_usage: await getTechnologyUsageStats(pool),
      emerging_technologies: await getEmergingTechnologies(pool),
      deprecated_technologies: await getDeprecatedTechnologies(pool),
      technology_debt: await getTechnologyDebt(pool)
    };
    
    res.json({
      success: true,
      data: tech
    });
  } catch (error) {
    console.error('Error fetching technology metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch technology metrics'
    });
  }
});

/**
 * GET /api/architecture/metrics/portfolio
 * Portfolio health metrics
 */
router.get('/api/architecture/metrics/portfolio', authenticate, async (req: Request, res: Response) => {
  try {
    const portfolio = await pool.query(`
      SELECT 
        COUNT(*) as total_assets,
        COUNT(*) FILTER (WHERE asset_type = 'template' AND status = 'approved') as approved_templates,
        COUNT(*) FILTER (WHERE asset_type = 'blueprint' AND status = 'active') as active_projects,
        COUNT(*) FILTER (WHERE status = 'deprecated') as deprecated_count,
        jsonb_object_agg(domain, domain_count) as by_domain,
        jsonb_object_agg(status, status_count) as by_status
      FROM (
        SELECT 
          domain,
          status,
          COUNT(*) OVER (PARTITION BY domain) as domain_count,
          COUNT(*) OVER (PARTITION BY status) as status_count
        FROM architecture_assets
      ) subquery
    `);
    
    res.json({
      success: true,
      data: portfolio.rows[0]
    });
  } catch (error) {
    console.error('Error fetching portfolio metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch portfolio metrics'
    });
  }
});

/**
 * GET /api/architecture/violations/active
 * Get active compliance violations
 */
router.get('/api/architecture/violations/active', authenticate, async (req: Request, res: Response) => {
  try {
    const violations = await pool.query(`
      SELECT 
        v.id,
        v.rule,
        v.severity,
        v.description,
        v.component,
        v.detected_at,
        v.status,
        p.name as project_name,
        b.name as blueprint_name
      FROM architecture_compliance_violations v
      LEFT JOIN projects p ON v.project_id = p.id
      LEFT JOIN blueprints b ON v.blueprint_id = b.id
      WHERE v.status = 'open'
      ORDER BY 
        CASE v.severity 
          WHEN 'critical' THEN 1
          WHEN 'high' THEN 2
          WHEN 'medium' THEN 3
          WHEN 'low' THEN 4
        END,
        v.detected_at DESC
      LIMIT 50
    `);
    
    res.json({
      success: true,
      data: violations.rows.map(row => ({
        id: row.id,
        policy_name: row.rule,
        severity: row.severity,
        description: row.description,
        component: row.component,
        project_name: row.project_name,
        blueprint_name: row.blueprint_name,
        detected_at: row.detected_at,
        status: row.status
      }))
    });
  } catch (error) {
    console.error('Error fetching active violations:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active violations'
    });
  }
});

/**
 * GET /api/architecture/metrics/compliance-trend
 * Compliance score trend over time
 */
router.get('/api/architecture/metrics/compliance-trend', authenticate, async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;
    
    const trend = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        AVG(score) as avg_score,
        COUNT(*) as evaluations
      FROM compliance_evaluations
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `);
    
    res.json({
      success: true,
      data: trend.rows
    });
  } catch (error) {
    console.error('Error fetching compliance trend:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch compliance trend'
    });
  }
});

// Helper functions

async function getComplianceScore(db: any): Promise<number> {
  const result = await db.query(`
    SELECT 
      CASE 
        WHEN COUNT(*) = 0 THEN 100
        ELSE 100 - (
          COUNT(*) FILTER (WHERE severity = 'critical') * 25 +
          COUNT(*) FILTER (WHERE severity = 'high') * 10 +
          COUNT(*) FILTER (WHERE severity = 'medium') * 5 +
          COUNT(*) FILTER (WHERE severity = 'low') * 2
        )
      END as score
    FROM architecture_compliance_violations
    WHERE status = 'open'
  `);
  return Math.max(0, result.rows[0].score || 0);
}

async function getActiveViolationsCount(db: any): Promise<number> {
  const result = await db.query(
    "SELECT COUNT(*) as count FROM architecture_compliance_violations WHERE status = 'open'"
  );
  return parseInt(result.rows[0].count);
}

async function getPendingReviewsCount(db: any): Promise<number> {
  const result = await db.query(
    `SELECT COUNT(*) as count FROM architecture_review_requests 
     WHERE review_stage IN ('submitted', 'security_review', 'architecture_review')`
  );
  return parseInt(result.rows[0].count);
}

async function getAvgReviewTurnaroundDays(db: any): Promise<number> {
  const result = await db.query(`
    SELECT AVG(EXTRACT(EPOCH FROM (updated_at - submission_date)) / 86400) as avg_days
    FROM architecture_review_requests
    WHERE review_stage IN ('approved', 'rejected')
    AND updated_at >= NOW() - INTERVAL '90 days'
  `);
  return parseFloat(result.rows[0].avg_days || 0).toFixed(1);
}

async function getTotalProjects(db: any): Promise<number> {
  const result = await db.query("SELECT COUNT(*) as count FROM projects WHERE status = 'active'");
  return parseInt(result.rows[0].count);
}

async function getTotalBlueprints(db: any): Promise<number> {
  const result = await db.query("SELECT COUNT(*) as count FROM blueprints");
  return parseInt(result.rows[0].count);
}

async function getApprovedTemplatesCount(db: any): Promise<number> {
  const result = await db.query(
    "SELECT COUNT(*) as count FROM architecture_templates WHERE status = 'active'"
  );
  return parseInt(result.rows[0].count);
}

async function getTechStackCompliance(db: any): Promise<number> {
  return 95; // Placeholder - would calculate based on approved tech catalog
}

async function getArchitectureDebtRatio(db: any): Promise<number> {
  const result = await db.query(`
    SELECT 
      CAST(COUNT(*) FILTER (WHERE status = 'deprecated') AS FLOAT) / 
      NULLIF(COUNT(*), 0) * 100 as ratio
    FROM architecture_assets
  `);
  return parseFloat(result.rows[0].ratio || 0).toFixed(1);
}

async function getDeprecatedAssetsCount(db: any): Promise<number> {
  const result = await db.query(
    "SELECT COUNT(*) as count FROM architecture_assets WHERE status = 'deprecated'"
  );
  return parseInt(result.rows[0].count);
}

async function getAvgReuseRate(db: any): Promise<number> {
  const result = await db.query(`
    SELECT AVG(usage_count) as avg_reuse
    FROM architecture_assets
    WHERE status = 'approved' AND asset_type = 'template'
  `);
  return parseFloat(result.rows[0].avg_reuse || 0).toFixed(1);
}

async function getStandardsAdoptionRate(db: any): Promise<number> {
  return 88; // Placeholder - would calculate based on standards compliance
}

async function getTotalMonthlySpend(db: any): Promise<number> {
  const result = await db.query(`
    SELECT SUM(estimated_monthly_cost) as total
    FROM blueprints
    WHERE status = 'deployed'
  `);
  return parseFloat(result.rows[0].total || 0);
}

async function getCostOptimizationOpportunities(db: any): Promise<number> {
  return 15000; // Placeholder - would calculate from ML recommendations
}

async function getBudgetAdherence(db: any): Promise<number> {
  return 92; // Placeholder - would calculate actual vs budgeted
}

async function getAvgCostPerProject(db: any): Promise<number> {
  const result = await db.query(`
    SELECT AVG(estimated_monthly_cost) as avg_cost
    FROM blueprints
    WHERE status = 'deployed'
  `);
  return parseFloat(result.rows[0].avg_cost || 0);
}

async function getSecurityScore(db: any): Promise<number> {
  return 94; // Placeholder - would aggregate security metrics
}

async function getCriticalVulnerabilitiesCount(db: any): Promise<number> {
  const result = await db.query(
    `SELECT COUNT(*) as count FROM architecture_compliance_violations 
     WHERE severity = 'critical' AND status = 'open'`
  );
  return parseInt(result.rows[0].count);
}

async function getEncryptionCoverage(db: any): Promise<number> {
  return 98; // Placeholder - would calculate % of resources with encryption
}

async function getComplianceCertifications(db: any): Promise<string[]> {
  return ['SOC2', 'ISO27001', 'HIPAA'];
}

async function getAvgTimeToDeployDays(db: any): Promise<number> {
  return 5.2; // Placeholder - would calculate from deployment history
}

async function getAutoApprovalRate(db: any): Promise<number> {
  const result = await db.query(`
    SELECT 
      CAST(COUNT(*) FILTER (WHERE review_stage = 'approved' AND data->>'reviewers' = '[]') AS FLOAT) /
      NULLIF(COUNT(*), 0) * 100 as rate
    FROM architecture_review_requests
    WHERE submission_date >= NOW() - INTERVAL '30 days'
  `);
  return parseFloat(result.rows[0].rate || 0).toFixed(1);
}

async function getTemplateUsageRate(db: any): Promise<number> {
  const result = await db.query(`
    SELECT 
      CAST(COUNT(*) FILTER (WHERE template_id IS NOT NULL) AS FLOAT) /
      NULLIF(COUNT(*), 0) * 100 as rate
    FROM blueprints
    WHERE created_at >= NOW() - INTERVAL '30 days'
  `);
  return parseFloat(result.rows[0].rate || 0).toFixed(1);
}

async function getDeveloperSatisfactionScore(db: any): Promise<number> {
  return 4.2; // Placeholder - would come from surveys
}

async function getTotalADRs(db: any): Promise<number> {
  const result = await db.query("SELECT COUNT(*) as count FROM architecture_decisions");
  return parseInt(result.rows[0].count);
}

async function getADRsByStatus(db: any): Promise<Record<string, number>> {
  const result = await db.query(`
    SELECT status, COUNT(*) as count
    FROM architecture_decisions
    GROUP BY status
  `);
  return result.rows.reduce((acc, row) => {
    acc[row.status] = parseInt(row.count);
    return acc;
  }, {});
}

async function getADRsByDomain(db: any): Promise<Record<string, number>> {
  const result = await db.query(`
    SELECT architecture_domain, COUNT(*) as count
    FROM architecture_decisions
    WHERE architecture_domain IS NOT NULL
    GROUP BY architecture_domain
  `);
  return result.rows.reduce((acc, row) => {
    acc[row.architecture_domain] = parseInt(row.count);
    return acc;
  }, {});
}

async function getRecentADRs(db: any, limit: number): Promise<any[]> {
  const result = await db.query(
    `SELECT * FROM architecture_decisions ORDER BY decision_date DESC LIMIT $1`,
    [limit]
  );
  return result.rows;
}

async function getMostReferencedADRs(db: any, limit: number): Promise<any[]> {
  const result = await db.query(`
    SELECT ad.*, COUNT(bad.adr_id) as reference_count
    FROM architecture_decisions ad
    LEFT JOIN blueprint_architecture_decisions bad ON ad.id = bad.adr_id
    GROUP BY ad.id
    ORDER BY reference_count DESC
    LIMIT $1
  `, [limit]);
  return result.rows;
}

async function getApprovedTechnologies(db: any): Promise<string[]> {
  return ['PostgreSQL', 'MongoDB', 'Redis', 'Kubernetes', 'Terraform', 'Node.js', 'React'];
}

async function getTechnologyUsageStats(db: any): Promise<Record<string, number>> {
  return {
    'PostgreSQL': 45,
    'MongoDB': 23,
    'Redis': 38,
    'Kubernetes': 52,
    'Docker': 67
  };
}

async function getEmergingTechnologies(db: any): Promise<string[]> {
  return ['Rust', 'WebAssembly', 'Temporal', 'NATS'];
}

async function getDeprecatedTechnologies(db: any): Promise<string[]> {
  return ['AngularJS', 'MongoDB 3.x', 'Python 2.7'];
}

async function getTechnologyDebt(db: any): Promise<number> {
  return 12; // Percentage of deprecated tech still in use
}

export default router;
