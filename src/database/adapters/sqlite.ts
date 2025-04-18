import { DatabaseInterface } from '../interfaces/databaseinterface.js';
import fs from 'fs';
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';

interface DBMap {
    [userId: string]: Database;
}

export class SQLiteAdapter implements DatabaseInterface {
    private dbMap: DBMap = {};
    private basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
        if (!fs.existsSync(basePath)) {
            fs.mkdirSync(basePath, { recursive: true });
        }
    }

    private async getDb(userId: string): Promise<Database> {
        if (this.dbMap[userId]) return this.dbMap[userId];

        const dbPath = this.basePath + `/${userId}.sqlite`;
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });

        this.dbMap[userId] = db;
        return db;
    }

    async connect(userId: string): Promise<void> {
        await this.getDb(userId); // Ensures DB is opened
    }

    async create(userId: string): Promise<void> {
        // Get user's db file
        const db = await this.getDb(userId);
        // Create user ratings table
        await db.exec(`
      CREATE TABLE IF NOT EXISTS ${userId}.ratings (
        timestamp INTEGER NOT NULL,
        uri TEXT NOT NULL,
        name TEXT NOT NULL,
        theme TEXT NOT NULL,
        rating INTEGER NOT NULL
      )
    `);
        // todo: create user settings table
        await db.exec(`
      CREATE TABLE IF NOT EXISTS ${userId}.settings (
      )
    `);
    }

    async insert<T extends object>(userId: string, data: T): Promise<void> {
        const db = await this.getDb(userId);
        const keys = Object.keys(data);
        const values = Object.values(data);
        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO ${userId} (${keys.join(', ')}) VALUES (${placeholders})`;
        await db.run(sql, values);
    }

    // todo: rewrite many query functions for different queries rather than a single one
    async query<T extends object>(userId: string, sql: string, params: any[] = []): Promise<T[]> {
        const db = await this.getDb(userId);
        return db.all<T[]>(sql, params);
    }

    // note: Probably never used (maybe for cleanup function or server transfer?)
    async delete(userId: string): Promise<void> {
        const db = await this.getDb(userId);
        // todo: Delete db
    }

    async close(userId?: string): Promise<void> {
        if (userId && this.dbMap[userId]) {
            await this.dbMap[userId].close();
            delete this.dbMap[userId];
        } else {
            for (const id of Object.keys(this.dbMap)) {
                await this.dbMap[id].close();
            }
            this.dbMap = {};
        }
    }
}