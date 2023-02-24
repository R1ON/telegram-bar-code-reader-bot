import { PrismaClient } from './generated';

// ---

export const sqlite = new PrismaClient();
export * from './generated';
