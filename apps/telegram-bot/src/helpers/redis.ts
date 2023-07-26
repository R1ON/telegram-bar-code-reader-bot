import { createClient } from 'redis';
import { configService } from './config-service';

// ---

const REDIS_HOST = configService.get('REDIS_HOST');
const REDIS_PORT = configService.get('REDIS_PORT');

console.log(REDIS_HOST, REDIS_PORT);

export type SessionValue = Record<string, unknown> | null;

// ---

export class RedisSession {
    readonly redisClient;

    constructor () {
        console.log('НУУУУУУУУУУУУУУУУ', REDIS_HOST, REDIS_PORT);
        console.log(configService.get('REDIS_HOST'))
        console.log(process.env.REDIS_HOST);
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
}
