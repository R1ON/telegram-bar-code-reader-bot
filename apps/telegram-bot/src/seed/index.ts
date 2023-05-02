import os from 'os';
import path from 'path';
import glob from 'glob';
import createWorker from './worker';

// ---

function getCsvFiles() {
  const pathToCsvFiles = path.resolve(process.cwd(), 'barcode_data');
  return glob.sync(`${pathToCsvFiles}/*.csv`);
}

function parseCsv() {
  const files = getCsvFiles();
  const cpusCount = os.cpus().length;
  const workersCount = Math.min(cpusCount, files.length);

  console.log(`Number of workers: ${workersCount}`);

  const grouppedFiled: string[][] = [];

  for (let i = 0; i < workersCount; i++) {
    const start = Math.floor((i / workersCount) * files.length);
    const end = Math.floor(((i + 1) / workersCount) * files.length);

    grouppedFiled.push(files.slice(start, end));
  }

  return grouppedFiled;
}

function startSeed() {
  console.log('Seed has been started...');

  const grouppedFiles = parseCsv();

  const workers: Promise<void>[] = [];

  grouppedFiles.forEach((files) => {
    workers.push(createWorker(files));
  });

  Promise.all(workers);
}

startSeed();
