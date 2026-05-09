import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { UploadsProcessor } from './uploads.processor';
import { R2StorageService } from './r2-storage.service';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads/temp',
    }),
    BullModule.registerQueue({
      name: 'upload-processing',
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [UploadsController],
  providers: [UploadsService, UploadsProcessor, R2StorageService],
  exports: [UploadsService, R2StorageService],
})
export class UploadsModule {}
