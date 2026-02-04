import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportLog } from './entities/report-log.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'admin',
      database: 'cron_worker_thread',
      entities: [ReportLog],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule {}
