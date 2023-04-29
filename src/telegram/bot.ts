import { Telegraf, Markup } from 'telegraf';
import https from 'https';
import fs from 'fs';
import path from 'path';
import imageSize from 'image-size';
import { configService } from '../helpers/config-service';
import { TelegramSession } from './session';
import type { ContextWithSession } from './session/types';

import { MultiFormatReader, BarcodeFormat, BrowserMultiFormatReader, DecodeHintType, RGBLuminanceSource, BinaryBitmap, HybridBinarizer } from '@zxing/library';
import barcodeReader from 'javascript-barcode-reader';
// @ts-ignore
// import Quagga from 'quagga';
import jpeg from 'jpeg-js';

// @ts-ignore
import getPixels from 'get-pixels';

// @ts-ignore
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

    // console.log(file);
    // console.log(ctx);

    // return;
    
    const url = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${file.file_path}`;

    

    // TODO: получив картинку, подрубить парсер, который проанализирует ее и вытащит barcode
    https.get(url, (response) => {
        let data: any[] = [];
        response.on('data', (chunk) => {
            data.push(chunk);
        });
        response.on('end', () => {
            const buffer = Buffer.concat(data);
            const int32Array = new Int32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / Int32Array.BYTES_PER_ELEMENT);
            const result = Buffer.concat(data);
            const decodedImage = jpeg.decode(result);

            console.log(decodedImage);

            const { width, height } = imageSize(result);

            if (!width || !height) {
                console.error('Ширина или высота не найдены');
                return;
            }

            // const buff2 = fs.readFileSync(path.resolve(__dirname, ));

            Quagga.decodeSingle({
                src: buffer,
                numOfWorkers: 0,
                inputStream: {
                    mime: "image/jpeg",
                    size: 800,
                    area: {
                        top: "10%",
                        right: "5%",
                        left: "5%",
                        bottom: "10%"
                    }
                },
                decoder: {
                    readers: ["ean_reader"] // List of active readers
                },
            }, function(result) {
                if(result.codeResult) {
                    console.log("result", result.codeResult.code);
                } else {
                    console.log("not detected");
                }
            });
        


            // barcodeReader({
            //     /* Image file Path || {data: Uint8ClampedArray, width, height} || HTML5 Canvas ImageData */
            //     image: { width, height, data: new Uint8ClampedArray(result) },
            //     barcode: 'codabar',
            //     barcodeType: 'industrial',
            //     options: {    
            //       // useAdaptiveThreshold: true // for images with sahded portions
            //       // singlePass: true
            //     }
            //   })
            //     .then(code => {
            //       console.log('CODE', code)
            //     })
            //     .catch(err => {
            //       console.log('ERR', err)
            //     })

            // const hints = new Map();
            // const formats = [
            //     BarcodeFormat.CODE_128,
            //     BarcodeFormat.DATA_MATRIX,
            //     BarcodeFormat.QR_CODE
            // ];
            // hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
            // hints.set(DecodeHintType.TRY_HARDER, true);

            // const reader = new MultiFormatReader();
            
            // const luminanceSource = new RGBLuminanceSource(int32Array, width, height);
            // const binaryBitmap = new BinaryBitmap(new HybridBinarizer(luminanceSource));

            // const value = reader.decode(binaryBitmap, hints);
            // console.log(value)
        });
        // response.pipe(fs.createWriteStream('photo.jpg'));
    });
}
