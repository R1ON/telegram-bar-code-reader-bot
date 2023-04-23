require('dotenv').config();

import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';
import { RedisSession, type ContextWithSession } from '../helpers/redis';

const { TELEGRAM_BOT_API } = process.env;

const session = new RedisSession();

async function init() {
    if (!TELEGRAM_BOT_API) {
        console.error('Telegram bot api not found in .env file');
        process.exit(-1);
    }

    // await session.redisClient.flushAll();

    // await redisClient.connect();
    console.log('start');
    const bot = new Telegraf<ContextWithSession>(TELEGRAM_BOT_API);
    bot.use(session);
    bot.start((ctx) => {
        // console.log('/start CTX', ctx);
        ctx.reply('Welcome')
        ctx.session.set({key: 'meow'});
        ctx.session.get();
        ctx.session.set({value2: 'test'});
    });
    bot.launch();

    // await redisClient.flushAll();

    // await redisClient.set('key', 'value');
    // await redisClient.set('key2', '{"hello": "world"}');
    // const value = await redisClient.get('key');
    // console.log('value', value);
    // await redisClient.disconnect();
}

init();
