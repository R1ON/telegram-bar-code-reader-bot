import { Telegraf } from 'telegraf';
import https from 'https';
import imageSize from 'image-size';
import { configService } from '../helpers/config-service';
import { TelegramSession } from './session';
import type { ContextWithSession } from './session/types';

import Quagga from '@ericblade/quagga2';

// ---

const TELEGRAM_BOT_TOKEN = configService.get('TELEGRAM_BOT_TOKEN');


export class Bot {
    private _bot;

    constructor() {
        const session = new TelegramSession();
        const bot = new Telegraf<ContextWithSession>(TELEGRAM_BOT_TOKEN);

        bot.use(session);

        this._bot = bot;
    }

    init = () => {
        // this._bot.start((ctx) => {
        //     ctx.reply('👋 Привет! Пришли штрих-код и я найду твой отзыв');
        // });

        this._bot.command('start', (ctx) => {
            const link = `https://bar-code-reader-bot.web.app?user_id=${ctx.from.id}`;
            const message = `Выполните действие по ссылке: <a href="${link}">ссылка</a>`;
            ctx.replyWithHTML(message);
          });
    
        this._bot.on('message', async (ctx) => {
            console.log('message');
            if ('document' in ctx.update.message) {
                const document = ctx.update.message.document;

                if (!document.mime_type?.match(/^image/)) {
                    return ctx.reply('Мне нужна картинка 👺');
                }

                return downloadFile(document.file_id, ctx);
            }
            
            if ('photo' in ctx.update.message) {
                const photoInfo = ctx.update.message.photo.at(-1);
    
                if (!photoInfo) {
                    return ctx.reply('Что-то пошло не так 🙁');
                }
    
                return downloadFile(photoInfo.file_id, ctx);
            }

            console.log('message finished');
        });

        this._bot.launch();
    }
}

// TODO: вынести в отдельный файл
async function downloadFile<T extends ContextWithSession>(fileId: string, ctx: T) {
    const file = await ctx.telegram.getFile(fileId);

    console.log(file);
    
    const url = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    https.get(url, (response) => {
        let data: any[] = [];
        response.on('data', (chunk) => {
            data.push(chunk);
        });
        response.on('end', () => {
            const buffer = Buffer.concat(data);

            const { width, height, ...other } = imageSize(buffer);
            console.log(other);

            if (!width || !height) {
                console.error('Ширина или высота не найдены');
                return;
            }

            Quagga.decodeSingle({
                src: buffer,
                numOfWorkers: 0, // was disabled by library author
                inputStream: {
                    type: 'ImageStream',
                    mime: "image/jpeg",
                    size: 800,
                    constraints: { width, height },
                    area: {
                        top: "10%",
                        right: "5%",
                        left: "5%",
                        bottom: "10%"
                    },
                },
                decoder: {
                    readers: ["ean_reader"],
                },
            }, (result) => {
                // console.log('result common', result);
                if(result?.codeResult) {
                    console.log("result", result.codeResult.code);
                } else {
                    console.log("not detected");
                }
            });
        });
    });
}
