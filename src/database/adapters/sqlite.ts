import { DatabaseInterface } from '../interfaces/databaseinterface.js';
import Database from 'better-sqlite3';

export class SQLiteAdapter implements DatabaseInterface {
    private db: Database.Database | null = null;

    constructor(private dbPath: string) {}

    async connect(): Promise<void> {
        if (this.db) return; // If already connected, do nothing
        this.db = new Database(this.dbPath, { verbose: console.log });
    }

    async query<T extends object>(sql: string, params: any[] = []): Promise<T[]> {
        if (!this.db) throw new Error('Database not connected');
        const stmt = this.db.prepare(sql);
        return stmt.all(...params) as T[]
    }

    async insert<T extends object>(table: string, data: T): Promise<void> {
        if (!this.db) throw new Error('Database not connected');
        const columns = Object.keys(data).join(', ');
        const placeholders = Object.keys(data).map(() => '?').join(', ');
        const values = Object.values(data);
        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        this.db.prepare(sql).run(...values);
    }

    async create(table: string): Promise<void> {
        if (!this.db) throw new Error('Database not connected');
        // Type definitions may have to change especially timestamp, but this is a placeholder for now
        const sql = `CREATE TABLE IF NOT EXISTS ${table} (timestamp INTEGER NOT NULL, uri TEXT NOT NULL, name TEXT NOT NULL, theme TEXT NOT NULL, rating INTEGER NOT NULL)`;
        this.db.prepare(sql).run();
    }

    async delete(table: string): Promise<void> {
        if (!this.db) throw new Error('Database not connected');
        const sql = `DROP TABLE ${table}`;
        this.db.prepare(sql).run();
    }

    async close(): Promise<void> {
        if (this.db) {
            this.db.close();
        }
    }
}