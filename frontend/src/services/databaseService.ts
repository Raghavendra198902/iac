import { apiClient } from '../lib/advancedApiClient';

export interface DatabaseStats {
  totalConnections: number;
  activeConnections: number;
  idleConnections: number;
  maxConnections: number;
  databaseSize: string;
  tableCount: number;
  indexCount: number;
  cacheHitRatio: number;
  transactionsPerSecond: number;
}

export interface TableInfo {
  tableName: string;
  rowCount: number;
  tableSize: string;
  indexSize: string;
  totalSize: string;
  lastVacuum: string;
  lastAnalyze: string;
}

export interface QueryPerformance {
  query: string;
  calls: number;
  totalTime: number;
  meanTime: number;
  minTime: number;
  maxTime: number;
}

export interface DatabaseHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  version: string;
  replicationStatus: string;
  locks: number;
  deadlocks: number;
  lastCheckpoint: string;
}

class DatabaseService {
  // Get database statistics
  async getStats(): Promise<DatabaseStats> {
    return apiClient.get('/api/database/stats');
  }

  // Get table information
  async getTables(): Promise<TableInfo[]> {
    return apiClient.get('/api/database/tables');
  }

  // Get query performance metrics
  async getQueryPerformance(limit: number = 20): Promise<QueryPerformance[]> {
    return apiClient.get('/api/database/query-performance', {
      params: { limit },
    });
  }

  // Get database health
  async getHealth(): Promise<DatabaseHealth> {
    return apiClient.get('/api/database/health');
  }

  // Execute custom query (admin only)
  async executeQuery(query: string): Promise<any[]> {
    return apiClient.post('/api/database/query', { query });
  }

  // Optimize table
  async optimizeTable(tableName: string): Promise<{ message: string }> {
    return apiClient.post(`/api/database/tables/${tableName}/optimize`);
  }

  // Vacuum analyze
  async vacuumAnalyze(tableName?: string): Promise<{ message: string }> {
    return apiClient.post('/api/database/vacuum', { tableName });
  }

  // Get slow queries
  async getSlowQueries(threshold: number = 1000): Promise<QueryPerformance[]> {
    return apiClient.get('/api/database/slow-queries', {
      params: { threshold },
    });
  }

  // Get connection info
  async getConnections(): Promise<any[]> {
    return apiClient.get('/api/database/connections');
  }

  // Kill connection
  async killConnection(pid: number): Promise<{ message: string }> {
    return apiClient.delete(`/api/database/connections/${pid}`);
  }

  // Backup database
  async createBackup(): Promise<{ backupId: string; filename: string; size: string }> {
    return apiClient.post('/api/database/backup');
  }

  // List backups
  async listBackups(): Promise<any[]> {
    return apiClient.get('/api/database/backups');
  }

  // Restore backup
  async restoreBackup(backupId: string): Promise<{ message: string }> {
    return apiClient.post(`/api/database/backups/${backupId}/restore`);
  }

  // Get table schema
  async getTableSchema(tableName: string): Promise<any> {
    return apiClient.get(`/api/database/tables/${tableName}/schema`);
  }

  // Get index usage
  async getIndexUsage(tableName?: string): Promise<any[]> {
    return apiClient.get('/api/database/indexes', {
      params: { tableName },
    });
  }

  // Reindex table
  async reindexTable(tableName: string): Promise<{ message: string }> {
    return apiClient.post(`/api/database/tables/${tableName}/reindex`);
  }
}

export const databaseService = new DatabaseService();
export default databaseService;
