import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DrizzleService.name);
  public db: NodePgDatabase<typeof schema>;
  private pool: Pool;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    const connectionString = this.configService.get<string>('DATABASE_URL');

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    this.pool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    // Log pool errors (connection drops, unexpected errors)
    this.pool.on('error', (err) => {
      this.logger.error(`Database pool error: ${err.message}`, err.stack);
    });

    // Test connection on startup
    try {
      const client = await this.pool.connect();
      client.release();
      this.logger.debug('Database connection established successfully');
    } catch (error) {
      this.logger.error(
        `Failed to connect to database: ${error.message}`,
        error.stack,
      );
      throw error;
    }

    this.db = drizzle(this.pool, { schema });
  }

  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.end();
      this.logger.debug('Database pool closed');
    }
  }
}
