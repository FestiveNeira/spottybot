import { DatabaseFactory } from './databaseservice.js';

// Not sure what path will be yet
const sqlitepath = 'path/to/database.sqlite';

// Create a database instance (SQLite or PostgreSQL) 
const database =  DatabaseFactory.NewDatabase(false, sqlitepath);

// Backend code related to talking to the database goes here