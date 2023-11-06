import type { Context, MiddlewareFn } from 'telegraf';
import type { ContextWithSession } from './types';

import { RedisSession  } from '../../helpers/redis';

// ---

export class TelegramSession extends RedisSession {
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
