import { DatabaseInterface } from '../interfaces/databaseinterface';
import { Client } from 'pg';

export class PostgresAdapter implements DatabaseInterface {
    private client: Client | null = null;

    constructor(private connectionString: string) {}

    async connect(): Promise<void> {
        if (this.client) return Promise.resolve(); // If already connected, do nothing
        this.client = new Client({ connectionString: this.connectionString });
        await this.client.connect();
    }

    async query<T extends object>(sql: string, params: any[] = []): Promise<T[]> {
        if (!this.client) throw new Error('Database not connected');
        const res = await this.client.query(sql, params);
        return res.rows as T[];
    }

    async insert<T extends object>(table: string, data: T): Promise<void> {
        if (!this.client) throw new Error('Database not connected');
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
        const values = Object.values(data);
        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        await this.client.query(sql, values);
    }

    async delete(table: string): Promise<void> {
        if (!this.client) throw new Error('Database not connected');
        const sql = `DROP TABLE ${table}`;
        await this.client.query(sql);
    }

    async close(): Promise<void> {
        if (this.client) {
            await this.client.end();
        }
    }
}