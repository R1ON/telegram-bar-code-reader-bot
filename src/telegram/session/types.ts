import type { Context } from 'telegraf';
import { RedisSession, type SessionValue } from '../../helpers/redis';

type InstanceRedisSession = InstanceType<typeof RedisSession>;

export type ContextWithSession = Context & {
    session: {
        get: () => Awaited<ReturnType<InstanceRedisSession['getSession']>>;
        set: (newValue: SessionValue) => void;
    };
};
