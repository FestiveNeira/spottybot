import { DatabaseInterface } from './interfaces/databaseinterface.js';
import { SQLiteAdapter } from './adapters/sqlite.js';
import { PostgresAdapter } from './adapters/postgresql.js';

// Factory for making DatabaseInterface instances
export  class DatabaseFactory {
    // if you're trying to make one of these, you're doing it wrong
    private constructor() {
        throw new Error('DatabaseFactory constructor is private. Use DatabaseFactory.NewDatabase() instead.');
    } 

    /**
        Factory method to create a new database instance

        usePostgres: true for Postgres, false for SQLite

        TODO(jruth) does this need to be async? 
    */
    static NewDatabase(usePostgres: boolean = false, dbPathOrConnectionString: string /* = path/to/database.sqlite*/): DatabaseInterface {
        if (usePostgres) {
           return new PostgresAdapter(dbPathOrConnectionString); // Connection String for Postgres
        } else {
            return new SQLiteAdapter(dbPathOrConnectionString); // Path to SQLite file
        }
    }
}