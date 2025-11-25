/**
 * Software Engineer API Routes
 * Manages implementation tasks, code reviews, and architecture questions
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';

const router = Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://dharma_admin:dharma_secure_2024@localhost:5432/iac_dharma'
});

// ============================================================================
// Implementation Tasks
// ============================================================================

/**
 * POST /api/se/tasks
 * Create implementation task
 */
router.post('/tasks', async (req: Request, res: Response) => {
  try {
    const {
      title, task_type, technical_spec_id, project_id, component_name,
      description, acceptance_criteria, technical_requirements,
      estimated_hours, complexity, assigned_to, due_date
    } = req.body;

    const result = await pool.query(`
      INSERT INTO se_implementation_tasks (
        task_number, title, task_type, technical_spec_id, project_id,
        component_name, description, acceptance_criteria,
        technical_requirements, estimated_hours, complexity,
        assigned_to, due_date, created_by
      ) VALUES (
        CONCAT('TASK-', LPAD(CAST(COALESCE((
          SELECT MAX(CAST(SUBSTRING(task_number FROM 6) AS INTEGER))
          FROM se_implementation_tasks
        ), 0) + 1 AS TEXT), 5, '0')),
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
      )
      RETURNING *
    `, [
      title, task_type, technical_spec_id, project_id, component_name,
      description, acceptance_criteria, technical_requirements,
      estimated_hours, complexity, assigned_to, due_date,
      req.body.user_id || '00000000-0000-0000-0000-000000000000'
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create task', message: error.message });
  }
});

/**
 * GET /api/se/tasks
 * List implementation tasks
 */
router.get('/tasks', async (req: Request, res: Response) => {
  try {
    const { status, assigned_to, project_id, task_type } = req.query;

    let query = 'SELECT * FROM se_implementation_tasks WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (assigned_to) {
      query += ` AND assigned_to = $${paramIndex++}`;
      params.push(assigned_to);
    }

    if (project_id) {
      query += ` AND project_id = $${paramIndex++}`;
      params.push(project_id);
    }

    if (task_type) {
      query += ` AND task_type = $${paramIndex++}`;
      params.push(task_type);
    }

    query += ' ORDER BY due_date NULLS LAST, created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch tasks', message: error.message });
  }
});

/**
 * GET /api/se/tasks/:taskNumber
 * Get specific task
 */
router.get('/tasks/:taskNumber', async (req: Request, res: Response) => {
  try {
    const { taskNumber } = req.params;

    const taskResult = await pool.query(
      'SELECT * FROM se_implementation_tasks WHERE task_number = $1',
      [taskNumber]
    );

    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Get code reviews
    const reviewsResult = await pool.query(
      'SELECT * FROM se_code_reviews WHERE task_id = $1 ORDER BY review_date DESC',
      [taskResult.rows[0].id]
    );

    res.json({
      ...taskResult.rows[0],
      reviews: reviewsResult.rows
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch task', message: error.message });
  }
});

/**
 * PUT /api/se/tasks/:taskNumber/status
 * Update task status
 */
router.put('/tasks/:taskNumber/status', async (req: Request, res: Response) => {
  try {
    const { taskNumber } = req.params;
    const { status, blocked_reason, actual_hours } = req.body;

    const updates: string[] = ['status = $1'];
    const values: any[] = [status];
    let paramIndex = 2;

    if (blocked_reason) {
      updates.push(`blocked_reason = $${paramIndex++}`);
      values.push(blocked_reason);
    }

    if (actual_hours) {
      updates.push(`actual_hours = $${paramIndex++}`);
      values.push(actual_hours);
    }

    if (status === 'in_progress' && !req.body.start_date) {
      updates.push('start_date = CURRENT_DATE');
    }

    if (status === 'done' && !req.body.completion_date) {
      updates.push('completion_date = CURRENT_DATE');
    }

    values.push(taskNumber);

    const result = await pool.query(
      `UPDATE se_implementation_tasks SET ${updates.join(', ')} 
       WHERE task_number = $${paramIndex} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update task', message: error.message });
  }
});

/**
 * PUT /api/se/tasks/:taskNumber/assign
 * Assign task to engineer
 */
router.put('/tasks/:taskNumber/assign', async (req: Request, res: Response) => {
  try {
    const { taskNumber } = req.params;
    const { assigned_to } = req.body;

    const result = await pool.query(
      `UPDATE se_implementation_tasks SET assigned_to = $1 
       WHERE task_number = $2 RETURNING *`,
      [assigned_to, taskNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to assign task', message: error.message });
  }
});

/**
 * GET /api/se/tasks/my-tasks/:userId
 * Get tasks assigned to specific user
 */
router.get('/tasks/my-tasks/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const result = await pool.query(`
      SELECT * FROM se_implementation_tasks 
      WHERE assigned_to = $1 AND status NOT IN ('done', 'cancelled')
      ORDER BY due_date NULLS LAST, priority_score DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch tasks', message: error.message });
  }
});

// ============================================================================
// Code Reviews
// ============================================================================

/**
 * POST /api/se/reviews
 * Submit code review
 */
router.post('/reviews', async (req: Request, res: Response) => {
  try {
    const {
      task_id, reviewer_id, review_duration_minutes, code_quality_score,
      follows_standards, follows_patterns, architecture_feedback,
      design_feedback, implementation_feedback, testing_feedback,
      documentation_feedback, critical_issues, major_issues, minor_issues,
      suggestions, lines_of_code_reviewed, files_reviewed, decision,
      decision_rationale
    } = req.body;

    // Get review number for this task
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM se_code_reviews WHERE task_id = $1',
      [task_id]
    );
    const review_number = parseInt(countResult.rows[0].count) + 1;

    const issues_count = (critical_issues?.length || 0) + (major_issues?.length || 0) + (minor_issues?.length || 0);

    const result = await pool.query(`
      INSERT INTO se_code_reviews (
        task_id, review_number, reviewer_id, review_duration_minutes,
        code_quality_score, follows_standards, follows_patterns,
        architecture_feedback, design_feedback, implementation_feedback,
        testing_feedback, documentation_feedback, critical_issues,
        major_issues, minor_issues, suggestions, lines_of_code_reviewed,
        files_reviewed, issues_count, decision, decision_rationale,
        requires_re_review
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20, $21, $22
      )
      RETURNING *
    `, [
      task_id, review_number, reviewer_id, review_duration_minutes,
      code_quality_score, follows_standards, follows_patterns,
      architecture_feedback, design_feedback, implementation_feedback,
      testing_feedback, documentation_feedback, critical_issues,
      major_issues, minor_issues, suggestions, lines_of_code_reviewed,
      files_reviewed, issues_count, decision, decision_rationale,
      decision === 'needs_revision'
    ]);

    // Update task status if approved
    if (decision === 'approved') {
      await pool.query(
        `UPDATE se_implementation_tasks 
         SET code_review_status = 'approved', reviewed_by = $1
         WHERE id = $2`,
        [reviewer_id, task_id]
      );
    }

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create review', message: error.message });
  }
});

/**
 * GET /api/se/reviews/pending
 * Get tasks pending code review
 */
router.get('/reviews/pending', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(`
      SELECT t.*, u.name as assigned_to_name
      FROM se_implementation_tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE t.status = 'code_review'
      ORDER BY t.updated_at DESC
    `);

    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch pending reviews', message: error.message });
  }
});

/**
 * GET /api/se/reviews/stats
 * Get code review statistics
 */
router.get('/reviews/stats', async (req: Request, res: Response) => {
  try {
    const { days = 30 } = req.query;

    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_reviews,
        AVG(code_quality_score) as avg_quality_score,
        AVG(review_duration_minutes) as avg_duration_minutes,
        COUNT(CASE WHEN decision = 'approved' THEN 1 END) as approved_count,
        COUNT(CASE WHEN decision = 'needs_revision' THEN 1 END) as revision_count,
        SUM(issues_count) as total_issues,
        AVG(lines_of_code_reviewed) as avg_loc_reviewed
      FROM se_code_reviews
      WHERE review_date >= CURRENT_DATE - INTERVAL '${days} days'
    `);

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch review stats', message: error.message });
  }
});

// ============================================================================
// Architecture Questions
// ============================================================================

/**
 * POST /api/se/questions
 * Ask architecture question
 */
router.post('/questions', async (req: Request, res: Response) => {
  try {
    const {
      question_title, question_text, question_category, project_id,
      task_id, component_name, technologies_involved, code_snippet,
      error_message, context_information, what_tried, expected_outcome,
      actual_outcome, priority, is_blocking
    } = req.body;

    const result = await pool.query(`
      INSERT INTO se_architecture_questions (
        question_number, question_title, question_text, question_category,
        project_id, task_id, component_name, technologies_involved,
        code_snippet, error_message, context_information, what_tried,
        expected_outcome, actual_outcome, priority, is_blocking, asked_by
      ) VALUES (
        CONCAT('Q-', LPAD(CAST(COALESCE((
          SELECT MAX(CAST(SUBSTRING(question_number FROM 3) AS INTEGER))
          FROM se_architecture_questions
        ), 0) + 1 AS TEXT), 5, '0')),
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
      )
      RETURNING *
    `, [
      question_title, question_text, question_category, project_id,
      task_id, component_name, technologies_involved, code_snippet,
      error_message, context_information, what_tried, expected_outcome,
      actual_outcome, priority, is_blocking,
      req.body.user_id || '00000000-0000-0000-0000-000000000000'
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create question', message: error.message });
  }
});

/**
 * GET /api/se/questions
 * List architecture questions
 */
router.get('/questions', async (req: Request, res: Response) => {
  try {
    const { status, category, priority, is_blocking } = req.query;

    let query = 'SELECT * FROM se_architecture_questions WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex++}`;
      params.push(status);
    }

    if (category) {
      query += ` AND question_category = $${paramIndex++}`;
      params.push(category);
    }

    if (priority) {
      query += ` AND priority = $${paramIndex++}`;
      params.push(priority);
    }

    if (is_blocking !== undefined) {
      query += ` AND is_blocking = $${paramIndex++}`;
      params.push(is_blocking === 'true');
    }

    query += ' ORDER BY is_blocking DESC, priority DESC, created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch questions', message: error.message });
  }
});

/**
 * GET /api/se/questions/:questionNumber
 * Get specific question
 */
router.get('/questions/:questionNumber', async (req: Request, res: Response) => {
  try {
    const { questionNumber } = req.params;

    const result = await pool.query(
      'SELECT * FROM se_architecture_questions WHERE question_number = $1',
      [questionNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Increment views
    await pool.query(
      'UPDATE se_architecture_questions SET views_count = views_count + 1 WHERE question_number = $1',
      [questionNumber]
    );

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch question', message: error.message });
  }
});

/**
 * POST /api/se/questions/:questionNumber/answer
 * Answer architecture question
 */
router.post('/questions/:questionNumber/answer', async (req: Request, res: Response) => {
  try {
    const { questionNumber } = req.params;
    const { answer_text, resolution_approach, related_documentation, answered_by } = req.body;

    const result = await pool.query(
      `UPDATE se_architecture_questions 
       SET answer_text = $1, resolution_approach = $2, related_documentation = $3,
           answered_by = $4, answered_at = CURRENT_TIMESTAMP, status = 'answered'
       WHERE question_number = $5 RETURNING *`,
      [answer_text, resolution_approach, related_documentation, answered_by, questionNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json({ message: 'Question answered', question: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to answer question', message: error.message });
  }
});

/**
 * POST /api/se/questions/:questionNumber/helpful
 * Mark answer as helpful
 */
router.post('/questions/:questionNumber/helpful', async (req: Request, res: Response) => {
  try {
    const { questionNumber } = req.params;

    const result = await pool.query(
      `UPDATE se_architecture_questions 
       SET helpful_votes = helpful_votes + 1, answer_helpful = true
       WHERE question_number = $1 RETURNING *`,
      [questionNumber]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update question', message: error.message });
  }
});

/**
 * GET /api/se/dashboard
 * Software Engineer dashboard metrics
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM se_dashboard');
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch dashboard', message: error.message });
  }
});

/**
 * GET /api/se/my-dashboard/:userId
 * Personal dashboard for engineer
 */
router.get('/my-dashboard/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const tasksResult = await pool.query(`
      SELECT 
        COUNT(*) as total_tasks,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress,
        COUNT(CASE WHEN status = 'blocked' THEN 1 END) as blocked,
        COUNT(CASE WHEN status = 'done' THEN 1 END) as completed,
        AVG(CASE WHEN actual_hours IS NOT NULL AND estimated_hours > 0 
            THEN (actual_hours / estimated_hours * 100) END) as avg_estimate_accuracy
      FROM se_implementation_tasks
      WHERE assigned_to = $1
        AND created_at >= CURRENT_DATE - INTERVAL '30 days'
    `, [userId]);

    const questionsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_questions,
        COUNT(CASE WHEN status = 'open' THEN 1 END) as open_questions,
        COUNT(CASE WHEN status = 'answered' THEN 1 END) as answered_questions
      FROM se_architecture_questions
      WHERE asked_by = $1
    `, [userId]);

    res.json({
      tasks: tasksResult.rows[0],
      questions: questionsResult.rows[0]
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch personal dashboard', message: error.message });
  }
});

export default router;
