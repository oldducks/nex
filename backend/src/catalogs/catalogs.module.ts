import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { CatalogsService } from './catalogs.service';
import { CatalogsController } from './catalogs.controller';
import { Catalog } from './entities/catalog.entity';
import { PdfProcessor } from '../worker/pdf.processor';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Catalog]),
    UsersModule,
    BullModule.registerQueue({
      name: 'pdf-generation',
    }),
  ],
  controllers: [CatalogsController],
  providers: [CatalogsService, PdfProcessor],
  exports: [CatalogsService],
})
export class CatalogsModule { }
