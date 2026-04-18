import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateLiteModule } from '../create-lite/create-lite.module';
import { DigitalMediaAdminController } from './digital-media.admin.controller';
import { DigitalMediaController } from './digital-media.controller';
import { DigitalMediaService } from './digital-media.service';
import { DigitalMediaCategory } from './entities/category.entity';
import { DigitalMediaGenerationJob } from './entities/generation-job.entity';
import { DigitalMediaTemplateField } from './entities/template-field.entity';
import { DigitalMediaTemplate } from './entities/template.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DigitalMediaCategory,
      DigitalMediaTemplate,
      DigitalMediaTemplateField,
      DigitalMediaGenerationJob,
    ]),
    CreateLiteModule,
  ],
  controllers: [DigitalMediaController, DigitalMediaAdminController],
  providers: [DigitalMediaService],
  exports: [DigitalMediaService],
})
export class DigitalMediaModule {}
