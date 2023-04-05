import { createClient } from 'redis';
import { Telegraf } from 'telegraf';
import { message } from 'telegraf/filters';

require('dotenv').config();

const TELEGRAM_BOT_API = process.env.TELEGRAM_BOT_API;

const client = createClient({
    database: 1,
    
});



client.on('error', err => console.log('Redis Client Error', err));

// TODO: https://github.com/telegraf/telegraf-session-redis/blob/develop/lib/session.js

async function init() {
    if (!TELEGRAM_BOT_API) {
        console.error('Telegram bot api not found in .env file');
        process.exit(-1);
    }

    // await client.connect();
    console.log('teste');
    const bot = new Telegraf(TELEGRAM_BOT_API);
    bot.use();
    bot.start((ctx) => ctx.reply('Welcome'));
    bot.launch();
    // await client.flushAll();

    // await client.set('key', 'value');
    // await client.set('key2', '{"hello": "world"}');
    // const value = await client.get('key');
    // console.log('value', value);
    // await client.disconnect();
}

init();
