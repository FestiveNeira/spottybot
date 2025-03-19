import { DatabaseInterface } from './interfaces/databaseinterface';
import { SQLiteAdapter } from './adapters/sqlite';
import { PostgresAdapter } from './adapters/postgresql';

// Factory to return the appropriate database adapter based on the user's choice
export class DatabaseService {
    private db: DatabaseInterface;

    constructor(usePostgres: boolean, dbPathOrConnectionString: string) {
        if (usePostgres) {
            this.db = new PostgresAdapter(dbPathOrConnectionString); // Connection String for Postgres
        } else {
            this.db = new SQLiteAdapter(dbPathOrConnectionString); // Path to SQLite file
        }
    }

    // Not sure if I should do this, but we'll leave it for now
    async swapdb(usePostgres: boolean, dbPathOrConnectionString: string) {
        await this.close();
        if (usePostgres) {
            this.db = new PostgresAdapter(dbPathOrConnectionString); // Connection String for Postgres
        } else {
            this.db = new SQLiteAdapter(dbPathOrConnectionString); // Path to SQLite file
        }
        await this.connect();
    }

    async connect(): Promise<void> {
        this.db.connect();
    }

    async query<T extends object>(sql: string, params?: any[]): Promise<T[]> {
        return this.db.query(sql, params);
    }

    async insert<T extends object>(table: string, data: T): Promise<void> {
        this.db.insert(table, data);
    }

    async create(table: string): Promise<void> {
        this.db.create(table);
    }

    async delete(table: string): Promise<void> {
        this.db.delete(table);
    }

    async close(): Promise<void> {
        this.db.close();
    }
}