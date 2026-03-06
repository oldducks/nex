import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';
import { UploadsProcessor } from './uploads.processor';

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
  providers: [UploadsService, UploadsProcessor],
  exports: [UploadsService],
})
export class UploadsModule {}

