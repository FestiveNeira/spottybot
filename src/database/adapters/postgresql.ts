// todo: totally doesn't fit with the interface rn
import { DatabaseInterface } from '../types/databaseinterface.js';
import { Rating } from '../types/rating.js';
import pg from 'pg';

const { Pool } = pg;

export class PostgresAdapter implements DatabaseInterface {
    private pool: pg.Pool;

    constructor(connectionString: string) {
        this.pool = new Pool({ connectionString });
    }

    // Make sure all the tables exist for the user
    private async ensureSchema(userId: string): Promise<void> {
        const client = await this.pool.connect();
        try {
            await client.query(`CREATE SCHEMA IF NOT EXISTS "${userId}"`);
            await client.query(`
        CREATE TABLE IF NOT EXISTS "${userId}".ratings (
          timestamp BIGINT NOT NULL, -- When the rating was made
          uri TEXT NOT NULL,  -- Spotify URI of the song that was rated
          name TEXT NOT NULL, -- Name of the song that was rated
          theme TEXT NOT NULL,  -- Theme that the song was rated in
          rating INTEGER NOT NULL -- Rating value
        )
      `);
        } finally {
            client.release();
        }
    }

    async connect(userId: string): Promise<void> {
        // TODO(jruth) what is this for
    }

    // creates initial user schema and tables
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

    // Insert a new rating into the user's ratings table
    async insertRating(userId: string, rating: Rating): Promise<void> {
        const keys = Object.keys(rating);
        const values = Object.values(rating); 
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        const sql = `INSERT INTO "${userId}".ratings (${keys.join(', ')}) VALUES (${placeholders})`;
        await this.pool.query(sql, values);

        // TODO(jruth): handle errors, maybe return something?
    }

    // note: Probably never used (maybe for cleanup function or server transfer?)
    // TODO(jruth): confirm this is needed
    async delete(userId: string): Promise<void> {
        await this.pool.query(`DROP SCHEMA IF EXISTS "${userId}" CASCADE`);
    }

    // TODO(jruth): confirm needed
    async close(): Promise<void> {
        await this.pool.end();
    }
}