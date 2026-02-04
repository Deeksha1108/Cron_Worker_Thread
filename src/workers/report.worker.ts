import { parentPort, workerData } from 'worker_threads';

function generateReport(date: string) {
  if (Math.random() < 0.5) {
    throw new Error('Random worker failure');
  }
  
  // yeh intentionally lgaya h (forcefully fail k liye)
  // if (workerData.forceFail) {
  //   throw new Error('Controlled failure');
  // }

  let total = 0;
  for (let i = 0; i < 1e8; i++) {
    total += i;
  }
  return {
    status: 'SUCCESS',
    generatedAt: date,
    result: total,
  };
}

try {
  const result = generateReport(workerData.generatedAt);
  parentPort?.postMessage(result);
} catch (err) {
  parentPort?.postMessage({
    status: 'FAILED',
    error: err.message,
    generatedAt: workerData.generatedAt,
  });
}
