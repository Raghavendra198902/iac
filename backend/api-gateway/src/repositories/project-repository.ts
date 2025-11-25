import { Pool } from 'pg';

export interface WorkflowProject {
  id: string;
  name: string;
  description: string;
  createdDate: string;
  targetDate: string;
  status: 'active' | 'completed' | 'on-hold';
  progress: number;
  createdBy: string;
  workflowSteps: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  stepNumber: number;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  ownerTeam: string;
  assignee: string;
  completedDate?: string;
  route: string;
  notes?: string;
}

export class ProjectRepository {
  constructor(private pool: Pool) {}

  async getAllProjects(): Promise<WorkflowProject[]> {
    const projectsQuery = `
      SELECT 
        id, name, description, 
        created_date as "createdDate", 
        target_date as "targetDate",
        status, progress, created_by as "createdBy"
      FROM workflow_projects
      ORDER BY created_date DESC
    `;

    const stepsQuery = `
      SELECT 
        step_id as id, 
        title, 
        description,
        step_number as "stepNumber",
        status, 
        owner_team as "ownerTeam",
        assignee, 
        completed_date as "completedDate",
        route,
        notes,
        project_id as "projectId"
      FROM project_workflow_steps
      ORDER BY project_id, step_number
    `;

    const [projectsResult, stepsResult] = await Promise.all([
      this.pool.query(projectsQuery),
      this.pool.query(stepsQuery),
    ]);

    const stepsMap = new Map<string, WorkflowStep[]>();
    stepsResult.rows.forEach((step) => {
      const projectId = step.projectId;
      delete step.projectId;
      
      if (!stepsMap.has(projectId)) {
        stepsMap.set(projectId, []);
      }
      stepsMap.get(projectId)!.push(step);
    });

    return projectsResult.rows.map((project) => ({
      ...project,
      workflowSteps: stepsMap.get(project.id) || [],
    }));
  }

  async getProjectById(id: string): Promise<WorkflowProject | null> {
    const projectQuery = `
      SELECT 
        id, name, description, 
        created_date as "createdDate", 
        target_date as "targetDate",
        status, progress, created_by as "createdBy"
      FROM workflow_projects
      WHERE id = $1
    `;

    const stepsQuery = `
      SELECT 
        step_id as id, 
        title, 
        description,
        step_number as "stepNumber",
        status, 
        owner_team as "ownerTeam",
        assignee, 
        completed_date as "completedDate",
        route,
        notes
      FROM project_workflow_steps
      WHERE project_id = $1
      ORDER BY step_number
    `;

    const [projectResult, stepsResult] = await Promise.all([
      this.pool.query(projectQuery, [id]),
      this.pool.query(stepsQuery, [id]),
    ]);

    if (projectResult.rows.length === 0) {
      return null;
    }

    return {
      ...projectResult.rows[0],
      workflowSteps: stepsResult.rows,
    };
  }

  async createProject(project: Omit<WorkflowProject, 'workflowSteps'>): Promise<WorkflowProject> {
    const query = `
      INSERT INTO workflow_projects (
        id, name, description, created_date, target_date, status, progress, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING 
        id, name, description,
        created_date as "createdDate",
        target_date as "targetDate",
        status, progress, created_by as "createdBy"
    `;

    const values = [
      project.id,
      project.name,
      project.description,
      project.createdDate,
      project.targetDate,
      project.status,
      project.progress,
      project.createdBy,
    ];

    const result = await this.pool.query(query, values);

    // Create default workflow steps
    const defaultSteps = [
      { id: 'ea-project', number: 1, title: 'EA - Create Project & Architecture', description: 'Define project scope, create HLD and SA', route: '/ea/repository?doc=sa', team: 'Enterprise Architecture Team' },
      { id: 'sa-lld', number: 2, title: 'SA - Create LLD & CI Configuration', description: 'Create LLD and fetch CI configuration from CMDB', route: '/ea/repository?doc=lld', team: 'Solution Architecture Team' },
      { id: 'cmdb-config', number: 3, title: 'CMDB - Configuration Items', description: 'Identify and map infrastructure assets', route: '/cmdb', team: 'Infrastructure Team' },
      { id: 'pm-budget', number: 4, title: 'PM - Budget & Resource Assignment', description: 'Create project budget and assign team members', route: '/pm/roadmap', team: 'Project Management Team' },
      { id: 'se-implementation', number: 5, title: 'SE - Implementation Flow & Playbooks', description: 'Create implementation workflow and playbooks', route: '/se/projects', team: 'Software Engineering Team' },
      { id: 'agent-deployment', number: 6, title: 'Agent - Execute Playbooks', description: 'Deploy agents and run automation playbooks', route: '/agents/downloads', team: 'DevOps Team' },
    ];

    const stepsQuery = `
      INSERT INTO project_workflow_steps (
        project_id, step_id, step_number, title, description, status, owner_team, assignee, route
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;

    for (const step of defaultSteps) {
      await this.pool.query(stepsQuery, [
        project.id,
        step.id,
        step.number,
        step.title,
        step.description,
        'pending',
        step.team,
        'Not Assigned',
        step.route,
      ]);
    }

    return this.getProjectById(project.id) as Promise<WorkflowProject>;
  }

  async updateProjectProgress(id: string, progress: number): Promise<void> {
    const query = `
      UPDATE workflow_projects
      SET progress = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    await this.pool.query(query, [progress, id]);
  }

  async updateProjectStatus(id: string, status: string): Promise<void> {
    const query = `
      UPDATE workflow_projects
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    await this.pool.query(query, [status, id]);
  }

  async updateWorkflowStep(
    projectId: string,
    stepId: string,
    updates: {
      status?: string;
      assignee?: string;
      completedDate?: string;
      notes?: string;
    }
  ): Promise<void> {
    const setClauses: string[] = ['updated_at = CURRENT_TIMESTAMP'];
    const values: any[] = [];
    let paramCount = 1;

    if (updates.status) {
      setClauses.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }
    if (updates.assignee) {
      setClauses.push(`assignee = $${paramCount++}`);
      values.push(updates.assignee);
    }
    if (updates.completedDate) {
      setClauses.push(`completed_date = $${paramCount++}`);
      values.push(updates.completedDate);
    }
    if (updates.notes !== undefined) {
      setClauses.push(`notes = $${paramCount++}`);
      values.push(updates.notes);
    }

    values.push(projectId, stepId);

    const query = `
      UPDATE project_workflow_steps
      SET ${setClauses.join(', ')}
      WHERE project_id = $${paramCount++} AND step_id = $${paramCount}
    `;

    await this.pool.query(query, values);
  }

  async getProjectStats(): Promise<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    onHoldProjects: number;
  }> {
    const query = `
      SELECT 
        COUNT(*) as "totalProjects",
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as "activeProjects",
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as "completedProjects",
        SUM(CASE WHEN status = 'on-hold' THEN 1 ELSE 0 END) as "onHoldProjects"
      FROM workflow_projects
    `;

    const result = await this.pool.query(query);
    return result.rows[0];
  }
}
