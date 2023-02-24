import { PrismaClient as MongoClient } from './generated';

// ---

export const mongo = new MongoClient();
export * from './generated';
