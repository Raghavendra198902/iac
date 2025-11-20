import { v4 as uuidv4 } from 'uuid';
import { logger } from './utils/logger';
import { DeploymentState, StateBackup } from './types';

export class StateManager {
  private states: Map<string, DeploymentState>;
  private backups: Map<string, StateBackup[]>;
  private locks: Map<string, any>;

  constructor() {
    this.states = new Map();
    this.backups = new Map();
    this.locks = new Map();
  }

  async saveState(deploymentId: string, state: DeploymentState): Promise<void> {
    // Create backup of existing state
    const existingState = this.states.get(deploymentId);
    if (existingState) {
      await this.createBackup(deploymentId, existingState);
    }

    // Increment version
    const newVersion = existingState ? existingState.version + 1 : 1;
    state.version = newVersion;
    state.lastModified = new Date();

    // Save new state
    this.states.set(deploymentId, state);

    logger.info('State saved', {
      deploymentId,
      version: newVersion,
      resourceCount: state.resources.length
    });
  }

  async getState(deploymentId: string): Promise<DeploymentState | undefined> {
    return this.states.get(deploymentId);
  }

  async getStateVersion(
    deploymentId: string,
    version?: number
  ): Promise<DeploymentState | undefined> {
    if (!version) {
      return this.states.get(deploymentId);
    }

    const backups = this.backups.get(deploymentId) || [];
    const backup = backups.find(b => b.version === version);
    return backup?.state;
  }

  async getStateHistory(
    deploymentId: string,
    limit: number
  ): Promise<StateBackup[]> {
    const backups = this.backups.get(deploymentId) || [];
    return backups
      .sort((a, b) => b.version - a.version)
      .slice(0, limit);
  }

  async lockState(
    deploymentId: string,
    operation: string,
    who: string
  ): Promise<string> {
    const state = this.states.get(deploymentId);
    if (!state) {
      throw new Error('State not found');
    }

    if (state.locked) {
      throw new Error('State is already locked');
    }

    const lockId = uuidv4();
    const lockInfo = {
      id: lockId,
      operation,
      who,
      version: '1.0',
      created: new Date()
    };

    state.locked = true;
    state.lockInfo = lockInfo;

    this.locks.set(deploymentId, lockInfo);

    logger.info('State locked', {
      deploymentId,
      lockId,
      operation,
      who
    });

    return lockId;
  }

  async unlockState(deploymentId: string, lockId: string): Promise<void> {
    const state = this.states.get(deploymentId);
    if (!state) {
      throw new Error('State not found');
    }

    if (!state.locked) {
      throw new Error('State is not locked');
    }

    if (state.lockInfo?.id !== lockId) {
      throw new Error('Invalid lock ID');
    }

    state.locked = false;
    state.lockInfo = undefined;

    this.locks.delete(deploymentId);

    logger.info('State unlocked', { deploymentId, lockId });
  }

  private async createBackup(
    deploymentId: string,
    state: DeploymentState
  ): Promise<void> {
    const backup: StateBackup = {
      id: uuidv4(),
      deploymentId,
      version: state.version,
      state: JSON.parse(JSON.stringify(state)), // Deep copy
      createdAt: new Date()
    };

    const backups = this.backups.get(deploymentId) || [];
    backups.push(backup);

    // Keep only last 10 backups
    if (backups.length > 10) {
      backups.shift();
    }

    this.backups.set(deploymentId, backups);

    logger.info('State backup created', {
      deploymentId,
      version: state.version,
      backupCount: backups.length
    });
  }

  async deleteState(deploymentId: string): Promise<void> {
    this.states.delete(deploymentId);
    this.backups.delete(deploymentId);
    this.locks.delete(deploymentId);

    logger.info('State deleted', { deploymentId });
  }
}
