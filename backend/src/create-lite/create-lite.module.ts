import { Module } from '@nestjs/common';
import { CreateLiteService } from './create-lite.service';
import { CreateLiteController } from './create-lite.controller';
import { AdminSettingsModule } from '../admin-settings/admin-settings.module';

@Module({
  imports: [AdminSettingsModule],
  controllers: [CreateLiteController],
  providers: [CreateLiteService],
  exports: [CreateLiteService],
})
export class CreateLiteModule {}
