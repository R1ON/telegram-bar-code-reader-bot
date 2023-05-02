import { Bot } from './bot';

// ---

async function init() {
    const botInstance = new Bot();

    botInstance.init();


    // await redisClient.flushAll();

    // await redisClient.set('key', 'value');
    // await redisClient.set('key2', '{"hello": "world"}');
    // const value = await redisClient.get('key');
    // console.log('value', value);
    // await redisClient.disconnect();
}

init();
