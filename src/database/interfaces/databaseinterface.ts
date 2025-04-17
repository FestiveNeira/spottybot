export interface DatabaseInterface {
    connect(userId: string): Promise<void>;
    query<T extends object>(userId: string, sql: string, params?: any[]): Promise<T[]>;
    insert<T extends object>(userId: string, data: T): Promise<void>;
    create(userId: string): Promise<void>;
    delete(userId: string): Promise<void>;
    close(userId: string): Promise<void>;
}