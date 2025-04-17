// todo: totally doesn't fit with the interface rn
import { DatabaseInterface } from '../interfaces/databaseinterface.js';
import pg from 'pg';

const { Pool } = pg;

export class PostgresAdapter implements DatabaseInterface {
    private pool: pg.Pool;

    constructor(connectionString: string) {
        this.pool = new Pool({ connectionString });
    }

    private async ensureSchema(userId: string): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query(`CREATE SCHEMA IF NOT EXISTS "${userId}"`);
            await client.query(`
        CREATE TABLE IF NOT EXISTS "${userId}".ratings (
          timestamp BIGINT NOT NULL,
          uri TEXT NOT NULL,
          name TEXT NOT NULL,
          theme TEXT NOT NULL,
          rating INTEGER NOT NULL
        )
      `);
        } finally {
            client.release();
        }
    }

    async connect(userId: string): Promise<void> {
    }

    async create(userId: string): Promise<void> {
        // Create user schema (separates sections of the db by user)
        await this.pool.query(`CREATE SCHEMA IF NOT EXISTS "${userId}"`);
        // Create user ratings table
        await this.pool.query(`
          CREATE TABLE IF NOT EXISTS "${userId}".ratings (
            timestamp BIGINT NOT NULL,
            uri TEXT NOT NULL,
            name TEXT NOT NULL,
            theme TEXT NOT NULL,
            rating INTEGER NOT NULL
          )
        `);
        // todo: create user settings table
        await this.pool.query(`
          CREATE TABLE IF NOT EXISTS "${userId}".settings (
          )
        `);
    }

    async insert<T extends object>(userId: string, data: T): Promise<void> {
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const sql = `INSERT INTO "${userId}".ratings (${keys.join(', ')}) VALUES (${placeholders})`;
        await this.pool.query(sql, values);
    }

    // todo: rewrite many query functions for different queries rather than a single one
    async query<T extends object>(userId: string, sql: string, params: any[] = []): Promise<T[]> {
        // The sql must reference the correct schema, or be rewritten by calling code
        return (await this.pool.query<T>(sql, params)).rows;
    }

    // note: Probably never used (maybe for cleanup function or server transfer?)
    async delete(userId: string): Promise<void> {
        await this.pool.query(`DROP SCHEMA IF EXISTS "${userId}" CASCADE`);
    }

    async close(): Promise<void> {
        await this.pool.end();
    }
}