import { DatabaseInterface } from './interfaces/databaseinterface';
import { SQLiteAdapter } from './adapters/sqlite';
import { PostgresAdapter } from './adapters/postgresql';

// Factory to return the appropriate database adapter based on the user's choice
export class DatabaseService {
    private db: DatabaseInterface;

    constructor(usePostgres: boolean, dbPathOrConnectionString: string) {
        if (usePostgres) {
            this.db = new PostgresAdapter(dbPathOrConnectionString); // connectionString for Postgres
        } else {
            this.db = new SQLiteAdapter(dbPathOrConnectionString); // Path to SQLite file
        }
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

    async delete(table: string): Promise<void> {
        this.db.delete(table);
    }

    async close(): Promise<void> {
        this.db.close();
    }
}

/*

// In your application
import { DatabaseService } from './databaseService';

// Create a database service instance (e.g., using SQLite or PostgreSQL)
const dbService = new DatabaseService(false, 'path/to/database.sqlite');  // false for SQLite
dbService.connect();

// Insert a new record
dbService.insert('users', { name: 'John Doe', email: 'john.doe@example.com' });

// Query data
const users = dbService.query('SELECT * FROM users');
console.log(users);

// Close the connection
dbService.close();

*/