import csv from 'csv-parser';
import fs from 'fs';
import os from 'os';
import path from 'path';
import glob from 'glob';
import { Worker } from 'worker_threads';
import { PrismaClient, BarCode } from '@prisma/client';

// ---

const prisma = new PrismaClient();

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// ---

const MAX_DATA_SIZE = 100_000;

type BarCodeData = Omit<BarCode, 'id'>;

type CsvKeys = 'ID' | 'UPCEAN' | 'Name' | 'CategoryID' | 'CategoryName' | 'BrandId' | 'BandName';
type CsvData = Record<CsvKeys, string>;

async function main() {
  console.log('Seed has been started...');

  const files = getCsvFiles();
  const numCpus = os.cpus().length;
  const numWorkers = Math.min(numCpus, files.length);

  console.log(`Number of workers: ${numWorkers}`);

  const workers: any[] = [];

  for (let i = 0; i < numWorkers; i++) {
    const start = Math.floor((i / numWorkers) * files.length);
    const end = Math.floor(((i + 1) / numWorkers) * files.length);

    // const worker = new Worker(__filename, {
    //   workerData: {
    //     files: files.slice(start, end),
    //   },
    // });

    const worker = files.slice(start, end);

    // worker.on('error', (err) => {
    //   console.error(`Worker ${worker.threadId} error:`, err);
    // });

    // worker.on('exit', () => {
    //   console.log(`Worker ${worker.threadId} finished processing files.`);
    // });

    workers.push(worker);
  }

  console.log(workers);

  // for (const file of files) {
  //   console.log(`SEED FOR FILE: ${file}`);

  //   const stream = fs
  //     .createReadStream(file)
  //     .pipe(csv({ separator: '\t' }));

  //   const data: BarCodeData[] = [];

  //   for await (const _row of stream) {
  //     const row = _row as CsvData;

  //     data.push({ code: row.UPCEAN, productName: row.Name });
      
  //     if (data.length >= MAX_DATA_SIZE) {
  //       await prisma.barCode.createMany({ data });
  //       data.length = 0;
  //     }
  //   }

  //   if (data.length > 0) {
  //     await prisma.barCode.createMany({ data });
  //   }
  // }

  // await prisma.$disconnect();
}

function getCsvFiles() {
  const pathToCsvFiles = path.resolve(process.cwd(), 'barcode_data');
  return glob.sync(`${pathToCsvFiles}/*.csv`);
}
