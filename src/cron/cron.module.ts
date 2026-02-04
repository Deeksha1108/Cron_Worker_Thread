import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { ReportLog } from 'src/database/entities/report-log.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([ReportLog])],
  providers: [CronService],
})
export class CronModule {}
