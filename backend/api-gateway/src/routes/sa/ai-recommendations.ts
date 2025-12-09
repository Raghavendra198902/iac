/**
 * SA AI Recommendations Routes
 * Endpoints for AI-powered architecture recommendations
 */

import { Router } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { authMiddleware } from '../../middleware/auth';
import { requirePermission } from '../../middleware/permissions';
import { query } from '../../utils/database';
import { logger } from '../../utils/logger';

const router = Router();

router.use(authMiddleware);

/**
 * @route POST /api/sa/ai-recommendations/analyze
 * @desc Analyze architecture and provide AI recommendations
 * @access SA (tenant scope)
 */
router.post(
  '/analyze',
  requirePermission('ai-recommendation', 'create', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { blueprintId, analysisType } = req.body;

      if (!blueprintId || !analysisType) {
        return res.status(400).json({
          success: false,
          error: 'Blueprint ID and analysis type are required',
        });
      }

      // Get blueprint
      const blueprintResult = await query(
        `SELECT * FROM blueprints WHERE id = $1 AND tenant_id = $2`,
        [blueprintId, req.user!.tenantId]
      );

      if (blueprintResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Blueprint not found',
        });
      }

      const blueprint = blueprintResult.rows[0];

      // Mock AI analysis (in production, this would call AI engine)
      const recommendations = [
        {
          type: 'performance',
          title: 'Consider using auto-scaling',
          description: 'Auto-scaling can improve performance during peak loads',
          impact: 'high',
          effort: 'medium',
        },
        {
          type: 'cost',
          title: 'Use reserved instances',
          description: 'Reserved instances can reduce costs by up to 40%',
          impact: 'high',
          effort: 'low',
        },
        {
          type: 'security',
          title: 'Enable encryption at rest',
          description: 'Encrypt sensitive data for compliance',
          impact: 'critical',
          effort: 'low',
        },
      ];

      // Store analysis
      const analysisResult = await query(
        `INSERT INTO ai_analyses 
          (blueprint_id, analysis_type, recommendations, status, created_by, tenant_id)
        VALUES ($1, $2, $3, 'completed', $4, $5)
        RETURNING *`,
        [
          blueprintId,
          analysisType,
          JSON.stringify(recommendations),
          req.user!.email,
          req.user!.tenantId,
        ]
      );

      logger.info(`AI analysis completed for blueprint ${blueprintId}`);

      res.status(201).json({
        success: true,
        message: 'Analysis completed successfully',
        data: {
          ...analysisResult.rows[0],
          recommendations,
        },
      });
    } catch (error: any) {
      logger.error('Error analyzing architecture:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze architecture',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/sa/ai-recommendations/optimize
 * @desc Get AI optimization suggestions
 * @access SA (tenant scope)
 */
router.post(
  '/optimize',
  requirePermission('ai-recommendation', 'create', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { blueprintId, optimizationGoals } = req.body;

      if (!blueprintId || !optimizationGoals) {
        return res.status(400).json({
          success: false,
          error: 'Blueprint ID and optimization goals are required',
        });
      }

      // Get blueprint
      const blueprintResult = await query(
        `SELECT * FROM blueprints WHERE id = $1 AND tenant_id = $2`,
        [blueprintId, req.user!.tenantId]
      );

      if (blueprintResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Blueprint not found',
        });
      }

      // Mock optimization (in production, this would call AI optimization engine)
      const optimizations = {
        current_cost: 1200.00,
        optimized_cost: 850.00,
        savings: 350.00,
        savings_percentage: 29.17,
        recommendations: [
          {
            component: 'compute',
            current: 't3.large',
            recommended: 't3.medium',
            savings: 150.00,
          },
          {
            component: 'storage',
            current: 'gp3 500GB',
            recommended: 'gp3 300GB with lifecycle',
            savings: 80.00,
          },
          {
            component: 'database',
            current: 'db.r5.xlarge',
            recommended: 'db.r5.large',
            savings: 120.00,
          },
        ],
      };

      // Store optimization
      const optimizationResult = await query(
        `INSERT INTO ai_optimizations 
          (blueprint_id, goals, current_cost, optimized_cost, savings, recommendations, created_by, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          blueprintId,
          JSON.stringify(optimizationGoals),
          optimizations.current_cost,
          optimizations.optimized_cost,
          optimizations.savings,
          JSON.stringify(optimizations.recommendations),
          req.user!.email,
          req.user!.tenantId,
        ]
      );

      logger.info(`Optimization completed for blueprint ${blueprintId}`);

      res.json({
        success: true,
        data: {
          ...optimizationResult.rows[0],
          ...optimizations,
        },
      });
    } catch (error: any) {
      logger.error('Error optimizing blueprint:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to optimize blueprint',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/sa/ai-recommendations/compare
 * @desc Compare multiple architecture alternatives
 * @access SA (tenant scope)
 */
router.post(
  '/compare',
  requirePermission('ai-recommendation', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { blueprintIds, criteria } = req.body;

      if (!blueprintIds || !Array.isArray(blueprintIds) || blueprintIds.length < 2) {
        return res.status(400).json({
          success: false,
          error: 'At least 2 blueprint IDs are required for comparison',
        });
      }

      // Get blueprints
      const blueprintsResult = await query(
        `SELECT * FROM blueprints 
         WHERE id = ANY($1) AND tenant_id = $2
         ORDER BY created_at DESC`,
        [blueprintIds, req.user!.tenantId]
      );

      if (blueprintsResult.rows.length < 2) {
        return res.status(404).json({
          success: false,
          error: 'Not enough blueprints found for comparison',
        });
      }

      // Mock comparison (in production, this would call AI comparison engine)
      const comparison = {
        blueprints: blueprintsResult.rows.map((bp, idx) => ({
          id: bp.id,
          name: bp.name,
          scores: {
            cost: 85 - (idx * 10),
            performance: 90 - (idx * 5),
            security: 95 - (idx * 8),
            scalability: 88 - (idx * 7),
            maintainability: 82 - (idx * 6),
          },
          overall_score: 88 - (idx * 7),
        })),
        recommendation: blueprintsResult.rows[0].id,
        reasoning: 'Blueprint 1 provides the best balance of cost, performance, and security',
      };

      // Store comparison
      const comparisonResult = await query(
        `INSERT INTO ai_comparisons 
          (blueprint_ids, criteria, comparison_data, recommended_blueprint_id, created_by, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          blueprintIds,
          JSON.stringify(criteria || {}),
          JSON.stringify(comparison),
          comparison.recommendation,
          req.user!.email,
          req.user!.tenantId,
        ]
      );

      logger.info(`Comparison completed for blueprints: ${blueprintIds.join(', ')}`);

      res.json({
        success: true,
        data: {
          ...comparisonResult.rows[0],
          comparison,
        },
      });
    } catch (error: any) {
      logger.error('Error comparing blueprints:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to compare blueprints',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/sa/ai-recommendations/:id/feedback
 * @desc Provide feedback on AI recommendation
 * @access SA (tenant scope)
 */
router.post(
  '/:id/feedback',
  requirePermission('ai-recommendation', 'update', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { rating, comments, implemented } = req.body;

      if (rating === undefined) {
        return res.status(400).json({
          success: false,
          error: 'Rating is required',
        });
      }

      // Check if recommendation exists
      const recResult = await query(
        `SELECT id FROM ai_analyses WHERE id = $1 AND tenant_id = $2`,
        [id, req.user!.tenantId]
      );

      if (recResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Recommendation not found',
        });
      }

      // Store feedback
      const feedbackResult = await query(
        `INSERT INTO ai_feedback 
          (recommendation_id, rating, comments, implemented, provided_by, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          id,
          rating,
          comments || '',
          implemented || false,
          req.user!.email,
          req.user!.tenantId,
        ]
      );

      logger.info(`Feedback provided for recommendation ${id} by ${req.user!.email}`);

      res.json({
        success: true,
        message: 'Feedback recorded successfully',
        data: feedbackResult.rows[0],
      });
    } catch (error: any) {
      logger.error('Error recording feedback:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to record feedback',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/sa/ai-recommendations/history
 * @desc Get AI recommendation history
 * @access SA (tenant scope)
 */
router.get(
  '/history',
  requirePermission('ai-recommendation', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { blueprintId, type, limit = 50 } = req.query;

      let queryText = `
        SELECT 
          aa.*,
          b.name as blueprint_name,
          COUNT(af.id) as feedback_count
        FROM ai_analyses aa
        LEFT JOIN blueprints b ON aa.blueprint_id = b.id
        LEFT JOIN ai_feedback af ON aa.id = af.recommendation_id
        WHERE aa.tenant_id = $1
      `;
      const queryParams: any[] = [req.user!.tenantId];
      let paramIndex = 2;

      if (blueprintId) {
        queryText += ` AND aa.blueprint_id = $${paramIndex}`;
        queryParams.push(blueprintId);
        paramIndex++;
      }

      if (type) {
        queryText += ` AND aa.analysis_type = $${paramIndex}`;
        queryParams.push(type);
        paramIndex++;
      }

      queryText += ` GROUP BY aa.id, b.name ORDER BY aa.created_at DESC LIMIT $${paramIndex}`;
      queryParams.push(Number(limit));

      const result = await query(queryText, queryParams);

      const history = result.rows.map(row => ({
        ...row,
        recommendations: typeof row.recommendations === 'string' 
          ? JSON.parse(row.recommendations) 
          : row.recommendations,
        feedback_count: parseInt(row.feedback_count) || 0,
      }));

      logger.info(`Fetched ${history.length} AI recommendation history items`);

      res.json({
        success: true,
        data: history,
        count: history.length,
      });
    } catch (error: any) {
      logger.error('Error fetching history:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch history',
        details: error.message,
      });
    }
  }
);

/**
 * @route GET /api/sa/ai-recommendations/trends
 * @desc Get AI recommendation trends and insights
 * @access SA (tenant scope)
 */
router.get(
  '/trends',
  requirePermission('ai-recommendation', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      // Get recommendation type distribution
      const typeDistResult = await query(
        `SELECT 
          analysis_type,
          COUNT(*) as count
        FROM ai_analyses
        WHERE tenant_id = $1
        GROUP BY analysis_type
        ORDER BY count DESC`,
        [req.user!.tenantId]
      );

      // Get implementation rate
      const implementationResult = await query(
        `SELECT 
          COUNT(*) as total_recommendations,
          COUNT(CASE WHEN af.implemented = true THEN 1 END) as implemented_count
        FROM ai_analyses aa
        LEFT JOIN ai_feedback af ON aa.id = af.recommendation_id
        WHERE aa.tenant_id = $1`,
        [req.user!.tenantId]
      );

      // Get average ratings
      const ratingsResult = await query(
        `SELECT 
          AVG(rating) as avg_rating,
          COUNT(*) as rating_count
        FROM ai_feedback
        WHERE tenant_id = $1`,
        [req.user!.tenantId]
      );

      // Get monthly trend
      const monthlyTrendResult = await query(
        `SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as analysis_count
        FROM ai_analyses
        WHERE tenant_id = $1 AND created_at >= NOW() - INTERVAL '6 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC`,
        [req.user!.tenantId]
      );

      const trends = {
        type_distribution: typeDistResult.rows,
        implementation_stats: implementationResult.rows[0],
        rating_stats: ratingsResult.rows[0],
        monthly_trend: monthlyTrendResult.rows,
      };

      logger.info('Fetched AI recommendation trends');

      res.json({
        success: true,
        data: trends,
      });
    } catch (error: any) {
      logger.error('Error fetching trends:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to fetch trends',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/sa/ai-recommendations/predict-cost
 * @desc Predict future costs using AI
 * @access SA (tenant scope)
 */
router.post(
  '/predict-cost',
  requirePermission('ai-recommendation', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { blueprintId, timeHorizon, growthRate } = req.body;

      if (!blueprintId || !timeHorizon) {
        return res.status(400).json({
          success: false,
          error: 'Blueprint ID and time horizon are required',
        });
      }

      // Get blueprint
      const blueprintResult = await query(
        `SELECT * FROM blueprints WHERE id = $1 AND tenant_id = $2`,
        [blueprintId, req.user!.tenantId]
      );

      if (blueprintResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Blueprint not found',
        });
      }

      // Mock cost prediction (in production, this would call AI prediction engine)
      const prediction = {
        blueprint_id: blueprintId,
        time_horizon: timeHorizon,
        growth_rate: growthRate || 0.10,
        current_monthly_cost: 850.00,
        predictions: [
          { month: 1, predicted_cost: 893.50, confidence: 0.95 },
          { month: 3, predicted_cost: 978.20, confidence: 0.90 },
          { month: 6, predicted_cost: 1095.30, confidence: 0.85 },
          { month: 12, predicted_cost: 1342.80, confidence: 0.75 },
        ],
      };

      // Store prediction
      const predictionResult = await query(
        `INSERT INTO ai_cost_predictions 
          (blueprint_id, time_horizon, growth_rate, predictions, created_by, tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *`,
        [
          blueprintId,
          timeHorizon,
          growthRate || 0.10,
          JSON.stringify(prediction.predictions),
          req.user!.email,
          req.user!.tenantId,
        ]
      );

      logger.info(`Cost prediction completed for blueprint ${blueprintId}`);

      res.json({
        success: true,
        data: {
          ...predictionResult.rows[0],
          ...prediction,
        },
      });
    } catch (error: any) {
      logger.error('Error predicting cost:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to predict cost',
        details: error.message,
      });
    }
  }
);

/**
 * @route POST /api/sa/ai-recommendations/risk-analysis
 * @desc Analyze risks in architecture using AI
 * @access SA (tenant scope)
 */
router.post(
  '/risk-analysis',
  requirePermission('ai-recommendation', 'read', 'tenant'),
  async (req: AuthRequest, res) => {
    try {
      const { blueprintId } = req.body;

      if (!blueprintId) {
        return res.status(400).json({
          success: false,
          error: 'Blueprint ID is required',
        });
      }

      // Get blueprint
      const blueprintResult = await query(
        `SELECT * FROM blueprints WHERE id = $1 AND tenant_id = $2`,
        [blueprintId, req.user!.tenantId]
      );

      if (blueprintResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Blueprint not found',
        });
      }

      // Mock risk analysis (in production, this would call AI risk engine)
      const risks = [
        {
          category: 'security',
          risk: 'Exposed database endpoint',
          severity: 'high',
          probability: 0.65,
          impact: 'data breach',
          mitigation: 'Use VPC and security groups',
        },
        {
          category: 'availability',
          risk: 'Single point of failure',
          severity: 'medium',
          probability: 0.40,
          impact: 'service downtime',
          mitigation: 'Implement multi-AZ deployment',
        },
        {
          category: 'performance',
          risk: 'Insufficient capacity',
          severity: 'medium',
          probability: 0.55,
          impact: 'slow response times',
          mitigation: 'Enable auto-scaling',
        },
      ];

      const overallRiskScore = 
        risks.reduce((sum, r) => sum + (r.probability * (r.severity === 'high' ? 3 : r.severity === 'medium' ? 2 : 1)), 0) / risks.length;

      // Store risk analysis
      const riskResult = await query(
        `INSERT INTO ai_risk_analyses 
          (blueprint_id, risks, overall_risk_score, created_by, tenant_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          blueprintId,
          JSON.stringify(risks),
          overallRiskScore,
          req.user!.email,
          req.user!.tenantId,
        ]
      );

      logger.info(`Risk analysis completed for blueprint ${blueprintId}`);

      res.json({
        success: true,
        data: {
          ...riskResult.rows[0],
          risks,
          overall_risk_score: overallRiskScore,
        },
      });
    } catch (error: any) {
      logger.error('Error analyzing risks:', { error });
      res.status(500).json({
        success: false,
        error: 'Failed to analyze risks',
        details: error.message,
      });
    }
  }
);

export default router;
