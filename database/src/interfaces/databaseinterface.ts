export interface DatabaseInterface {
    connect(): Promise<void>;
    query<T extends object>(sql: string, params?: any[]): Promise<T[]>;
    insert<T extends object>(table: string, data: T): Promise<void>;
    create(table: string): Promise<void>;
    delete(table: string): Promise<void>;
    close(): Promise<void>;
}