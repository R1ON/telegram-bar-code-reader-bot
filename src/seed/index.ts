import os from 'os';
import path from 'path';
import glob from 'glob';
import { PrismaClient, BarCode } from '@prisma/client';
import createWorker from './worker';

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

    const worker = createWorker(files.slice(start, end));
    workers.push(worker);
  }

  console.log(workers);
}

function getCsvFiles() {
  const pathToCsvFiles = path.resolve(process.cwd(), 'barcode_data');
  return glob.sync(`${pathToCsvFiles}/*.csv`);
}
