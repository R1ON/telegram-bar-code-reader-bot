import { Worker } from 'worker_threads';

function createWorker(csvFiles: string[]) {
  return new Promise<void>((resolve, reject) => {
    const worker = new Worker(__filename, { workerData: csvFiles });

    worker.on('message', (message) => {
      console.log(message);
    });

    worker.on('error', (error) => {
      reject(error);
    });

    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker stopped with exit code ${code}`));
      } else {
        resolve();
      }
    });
  });
}

export default createWorker;
