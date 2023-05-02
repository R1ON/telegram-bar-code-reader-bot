const { parentPort, workerData, threadId } = require('worker_threads');

import fs from 'fs';
import csv from 'csv-parser';
import { WorkerStatus, MAX_DATA_SIZE, NECESSARY_CATEGORIES } from './constants';
import { mongo, BarCode } from '../../prisma/mongo';

// ---

function logger(fileIndex: number) {
  const workerId = threadId.toString().padStart(2, '0');
  console.log(`Worker: ${workerId}. File ${fileIndex} / ${workerData.length}`);
}

// ---

type BarCodeData = Omit<BarCode, 'id'>;

type CsvKeys = 'ID' | 'UPCEAN' | 'Name' | 'CategoryID' | 'CategoryName' | 'BrandId' | 'BandName';
type CsvData = Record<CsvKeys, string>;

async function saveCsvToDB() {
  for (let i = 0; i < workerData.length; i++) {
    const file = workerData[i];

    if (!file) {
        console.error('Файл не найден', threadId, file, i, workerData);
        continue;
    }

    logger(i + 1);

    const stream = fs
      .createReadStream(file)
      .pipe(csv({ separator: '\t' }));

    const data: BarCodeData[] = [];

    for await (const _row of stream) {
      const row = _row as CsvData;

      if (!NECESSARY_CATEGORIES.test(row.CategoryName)) {
        continue;
      }

      data.push({ c: row.UPCEAN, n: row.Name });
      
      if (data.length >= MAX_DATA_SIZE) {
        await mongo.barCode.createMany({ data });
        data.length = 0;
      }
    }

    if (data.length > 0) {
      await mongo.barCode.createMany({ data });
      data.length = 0;
    }
  }

  await mongo.$disconnect();
  parentPort.postMessage(WorkerStatus.SUCCESS);
}

saveCsvToDB();
