import { Module } from '@nestjs/common';
import { CreateLiteService } from './create-lite.service';
import { CreateLiteController } from './create-lite.controller';

@Module({
  controllers: [CreateLiteController],
  providers: [CreateLiteService],
  exports: [CreateLiteService],
})
export class CreateLiteModule {}
