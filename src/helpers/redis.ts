require('dotenv').config();

import { createClient } from 'redis';
import { Context, MiddlewareFn } from 'telegraf';

const { REDIS_HOST, REDIS_PORT } = process.env;

console.log('host port', REDIS_HOST, REDIS_PORT);

// ---

type SessionValue = Record<string, unknown> | null;
type InstanceRedisSession = InstanceType<typeof RedisSession>;

export type ContextWithSession = Context & {
    session: {
        get: () => Awaited<ReturnType<InstanceRedisSession['getSession']>>;
        set: (newValue: SessionValue) => void;
    };
};

// ---

export class RedisSession {
    readonly redisClient;

    constructor () {
        this.redisClient = createClient({
            url: `redis://${REDIS_HOST}:${REDIS_PORT}`,
        });

        this.redisClient.on('error', (err) => console.log('RedisSession -> Error', err));
        this.redisClient.connect();
    }
  
    getSession = async (key: string): Promise<SessionValue> => {
        try {
            const data = await this.redisClient.get(key);

            if (!data || typeof data !== 'object') {
                return null;
            }

            return JSON.parse(data);
        }
        catch (err) {
            throw err;
        }
    };
  
    clearSession = async (key: string) => {
        try {
            await this.redisClient.del(key);
        }
        catch (err){
            throw err;
        }
    };
  
    saveSession = async <T extends SessionValue>(key: string, value: T) => {
        try {
            if (!value || Object.keys(value).length === 0) {
                return this.clearSession(key);
            }
              
            await this.redisClient.set(key, JSON.stringify(value));
        }
        catch (err) {
            throw err;
        }
    };

    getSessionKey = (ctx: Context) => {
        return ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`;
    };
  
    middleware (): MiddlewareFn<ContextWithSession> {
        return async (ctx, next) => {
            const key = this.getSessionKey(ctx);

            if (!key) {
              return next();
            }

            let session = await this.getSession(key) || {};

            ctx.session = {
                get: function () { return session; },
                set: function (newValue) { session = Object.assign(session, newValue); }
            };

            return await next().then(() => this.saveSession(key, session));
        };
    }
}
