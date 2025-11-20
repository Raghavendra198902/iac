import { v4 as uuidv4 } from 'uuid';
import cron from 'node-cron';
import logger from './utils/logger';
import { Budget, BudgetAlert } from './types';

export class BudgetManager {
  private budgets: Map<string, Budget> = new Map();
  private cronJobs: Map<string, cron.ScheduledTask> = new Map();

  constructor() {
    // Start budget monitoring job (runs every hour)
    this.startBudgetMonitoring();
  }

  async createBudget(budgetData: Omit<Budget, 'budgetId' | 'currentSpend' | 'lastUpdated' | 'status'>): Promise<Budget> {
    const budgetId = uuidv4();

    const budget: Budget = {
      ...budgetData,
      budgetId,
      currentSpend: 0,
      lastUpdated: new Date(),
      status: 'active'
    };

    this.budgets.set(budgetId, budget);
    
    logger.info('Budget created', {
      budgetId,
      name: budget.name,
      amount: budget.amount,
      period: budget.period
    });

    return budget;
  }

  async getBudget(budgetId: string): Promise<Budget | undefined> {
    return this.budgets.get(budgetId);
  }

  async listBudgets(filters?: {
    blueprintId?: string;
    environment?: string;
    status?: Budget['status'];
  }): Promise<Budget[]> {
    let budgets = Array.from(this.budgets.values());

    if (filters?.blueprintId) {
      budgets = budgets.filter(b => b.blueprintId === filters.blueprintId);
    }

    if (filters?.environment) {
      budgets = budgets.filter(b => b.environment === filters.environment);
    }

    if (filters?.status) {
      budgets = budgets.filter(b => b.status === filters.status);
    }

    return budgets;
  }

  async updateBudget(budgetId: string, updates: Partial<Budget>): Promise<Budget | null> {
    const budget = this.budgets.get(budgetId);
    
    if (!budget) {
      return null;
    }

    const updatedBudget: Budget = {
      ...budget,
      ...updates,
      budgetId, // ensure ID doesn't change
      lastUpdated: new Date()
    };

    this.budgets.set(budgetId, updatedBudget);
    
    logger.info('Budget updated', { budgetId });

    return updatedBudget;
  }

  async deleteBudget(budgetId: string): Promise<void> {
    this.budgets.delete(budgetId);
    
    // Stop any associated cron job
    const cronJob = this.cronJobs.get(budgetId);
    if (cronJob) {
      cronJob.stop();
      this.cronJobs.delete(budgetId);
    }

    logger.info('Budget deleted', { budgetId });
  }

  async updateBudgetSpend(budgetId: string, amount: number): Promise<void> {
    const budget = this.budgets.get(budgetId);
    
    if (!budget) {
      logger.warn('Budget not found for spend update', { budgetId });
      return;
    }

    budget.currentSpend = amount;
    budget.lastUpdated = new Date();

    // Check budget status
    const utilizationPercentage = (budget.currentSpend / budget.amount) * 100;

    if (utilizationPercentage >= 100) {
      budget.status = 'exceeded';
    } else if (utilizationPercentage >= 90) {
      budget.status = 'warning';
    } else {
      budget.status = 'active';
    }

    // Check alert thresholds
    for (const alert of budget.alerts) {
      const shouldAlert = utilizationPercentage >= alert.threshold && !alert.notified;
      
      if (shouldAlert) {
        await this.triggerBudgetAlert(budget, alert, utilizationPercentage);
        alert.notified = true;
        alert.lastNotification = new Date();
      }
    }

    this.budgets.set(budgetId, budget);

    logger.info('Budget spend updated', {
      budgetId,
      currentSpend: budget.currentSpend,
      utilization: `${utilizationPercentage.toFixed(2)}%`,
      status: budget.status
    });
  }

  private async triggerBudgetAlert(budget: Budget, alert: BudgetAlert, utilizationPercentage: number): Promise<void> {
    logger.warn('Budget alert triggered', {
      budgetId: budget.budgetId,
      budgetName: budget.name,
      threshold: alert.threshold,
      utilization: utilizationPercentage,
      currentSpend: budget.currentSpend,
      budgetAmount: budget.amount
    });

    // In production, this would send notifications via email, Slack, etc.
    // For now, just log the alert
    
    for (const recipient of alert.recipients) {
      logger.info('Sending budget alert notification', {
        recipient,
        budgetName: budget.name,
        message: `Budget ${budget.name} has reached ${utilizationPercentage.toFixed(2)}% of allocated amount`
      });
    }
  }

  private startBudgetMonitoring(): void {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
      logger.info('Running budget monitoring job');
      
      for (const budget of this.budgets.values()) {
        if (budget.status !== 'active' && budget.status !== 'warning') {
          continue;
        }

        // In production, this would fetch actual costs from cloud providers
        // For now, we'll skip automatic updates
        logger.debug('Checking budget', {
          budgetId: budget.budgetId,
          name: budget.name,
          currentSpend: budget.currentSpend,
          amount: budget.amount
        });
      }
    });

    logger.info('Budget monitoring cron job started');
  }

  getBudgetUtilization(budgetId: string): number | null {
    const budget = this.budgets.get(budgetId);
    
    if (!budget) {
      return null;
    }

    return (budget.currentSpend / budget.amount) * 100;
  }

  async resetBudgetPeriod(budgetId: string): Promise<void> {
    const budget = this.budgets.get(budgetId);
    
    if (!budget) {
      throw new Error('Budget not found');
    }

    // Reset current spend and alert notifications
    budget.currentSpend = 0;
    budget.status = 'active';
    budget.lastUpdated = new Date();

    for (const alert of budget.alerts) {
      alert.notified = false;
      alert.lastNotification = undefined;
    }

    this.budgets.set(budgetId, budget);

    logger.info('Budget period reset', { budgetId, name: budget.name });
  }
}
