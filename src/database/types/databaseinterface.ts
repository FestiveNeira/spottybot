// TODO(jruth): i feel like this kind of thinking is an import cycle waiting to happen. alas.
import { Rating } from './rating.js'; 

export interface DatabaseInterface {
    connect(userId: string): Promise<void>;
    query<T extends object>(userId: string, sql: string, params?: any[]): Promise<T[]>;
    insertRating(userId: string, rating: Rating): Promise<void>;
    create(userId: string): Promise<void>;
    delete(userId: string): Promise<void>;
    close(userId: string): Promise<void>;
}