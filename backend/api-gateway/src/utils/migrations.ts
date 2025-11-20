import { query } from './database';
import { logger } from './logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Run database migrations
 */
export async function runMigrations(): Promise<void> {
  logger.info('Running database migrations...');
  
  try {
    // Create migrations table if it doesn't exist
    await query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    // Get list of executed migrations
    const executedResult = await query<{ filename: string }>(
      'SELECT filename FROM schema_migrations ORDER BY id'
    );
    const executedMigrations = new Set(executedResult.rows.map(r => r.filename));

    // Get migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    if (!fs.existsSync(migrationsDir)) {
      logger.warn('Migrations directory not found', { path: migrationsDir });
      return;
    }

    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    let executedCount = 0;

    for (const file of files) {
      if (executedMigrations.has(file)) {
        logger.debug('Migration already executed', { file });
        continue;
      }

      logger.info('Executing migration', { file });
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      try {
        await query(sql);
        await query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file]
        );
        logger.info('Migration completed', { file });
        executedCount++;
      } catch (error: any) {
        logger.error('Migration failed', { file, error: error.message });
        throw error;
      }
    }

    if (executedCount === 0) {
      logger.info('No new migrations to execute');
    } else {
      logger.info('Migrations completed', { count: executedCount });
    }
  } catch (error: any) {
    logger.error('Migration runner failed', { error: error.message });
    throw error;
  }
}
