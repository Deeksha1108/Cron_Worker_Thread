import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Worker } from 'worker_threads';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as path from 'path';
import { ReportLog } from '../database/entities/report-log.entity';

const MAX_RETRY = 3;

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(ReportLog)
    private readonly reportRepo: Repository<ReportLog>,
  ) {}

  @Cron('*/1 * * * *')
  async handleCron() {
    console.log('Cron triggered');

    const log: ReportLog = await this.reportRepo.save({
      status: 'RETRYING',
      generatedAt: new Date().toISOString(),
      result: '0',
      retryCount: 0,
    });

    this.runWorker(log.id);
  }

  async runWorker(logId: number) {
    const workerPath = path.join(
      __dirname,
      '..',
      'workers',
      'report.worker.js',
    );

    const worker = new Worker(workerPath, {
      workerData: {
        logId,
        generatedAt: new Date().toISOString(),
      },
    });

    worker.on('message', async (data) => {
      if (data.status === 'SUCCESS') {
        await this.reportRepo.update(logId, {
          status: 'SUCCESS',
          result: data.result,
        });
        console.log('Job completed');
      } else {
        await this.retryOrFail(logId);
      }
    });

    worker.on('error', async () => {
      await this.retryOrFail(logId);
    });
  }

  async retryOrFail(logId: number) {
    const log = await this.reportRepo.findOneBy({ id: logId });
    // NULL SAFETY CHECK
    if (!log) {
      console.error(`ReportLog not found for id: ${logId}`);
      return;
    }

    if (log.retryCount < MAX_RETRY) {
      console.log(`Retrying job (${log.retryCount + 1})`);

      await this.reportRepo.update(logId, {
        retryCount: log.retryCount + 1,
        status: 'RETRYING',
      });

      this.runWorker(logId);
    } else {
      console.log('Max retries reached');
      await this.reportRepo.update(logId, {
        status: 'FAILED',
      });
    }
  }
}
