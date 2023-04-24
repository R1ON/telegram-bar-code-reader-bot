import { Telegraf, Markup } from 'telegraf';
import https from 'https';
import fs from 'fs';
import { configService } from '../helpers/config-service';
import { TelegramSession } from './session';
import type { ContextWithSession } from './session/types';

import { MultiFormatReader, BarcodeFormat } from '@zxing/library';

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
        this._bot.start((ctx) => {
            ctx.reply('👋 Привет! Пришли штрих-код и я найду твой отзыв');
        });
    
        this._bot.on('message', async (ctx) => {
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
        });

        this._bot.launch();
    }
}

// TODO: вынести в отдельный файл
async function downloadFile<T extends ContextWithSession>(fileId: string, ctx: T) {
    const file = await ctx.telegram.getFile(fileId);
    
    const url = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    

    // TODO: получив картинку, подрубить парсер, который проанализирует ее и вытащит barcode
    https.get(url, (response) => {
        let data: any[] = [];
        response.on('data', (chunk) => {
            data.push(chunk);
        });
        response.on('end', () => {
            const result = Buffer.concat(data);

            // const hints = new Map();
            // const formats = [BarcodeFormat.QR_CODE, BarcodeFormat.DATA_MATRIX/*, ...*/];

            // hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);

            // const reader = new MultiFormatReader();

            // const luminanceSource = new RGBLuminanceSource(imgByteArray, imgWidth, imgHeight);
            // const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

            // reader.decode(binaryBitmap, hints);
            // doSomethingWithFile(resultFile);
        });
        // response.pipe(fs.createWriteStream('photo.jpg'));
    });
}
