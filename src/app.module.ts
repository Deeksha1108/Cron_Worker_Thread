import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './cron/cron.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // cron system enable
    DatabaseModule,
    CronModule,               // humara cron logic
  ],
})
export class AppModule {}
