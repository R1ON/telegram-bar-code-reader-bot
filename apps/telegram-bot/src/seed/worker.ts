import { Worker } from 'worker_threads';
import path from 'path';
import { WorkerStatus } from './constants';

function createWorker(csvFiles: string[]) {
  return new Promise<void>((resolve, reject) => {
    const pathToWorkerBody = path.resolve(__dirname, 'saveCsvDataToDB.ts');

    const worker = new Worker(pathToWorkerBody, {
      workerData: csvFiles,
      execArgv: ["--require", "ts-node/register"],
    });

    worker.on('message', (message) => {
      if (message === WorkerStatus.SUCCESS) {
        resolve();
      }
      console.log(`Received message from worker: ${message}`);
    });

    worker.on('error', (error) => {
      reject(error);
    });

    worker.on('exit', (code) => {
      if (code === WorkerStatus.SUCCESS) {
        return resolve();
      }

      reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
}

export default createWorker;
