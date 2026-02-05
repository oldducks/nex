import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { CatalogsService } from './catalogs.service';
import { CatalogsController } from './catalogs.controller';
import { Catalog } from './entities/catalog.entity';
import { PdfProcessor } from '../worker/pdf.processor'; // Ensure this path is correct or module import
// Processor should ideally be in a WorkerModule, but for simplicity here:
// Actually, let's create a WorkerModule or just import it here if we want the processor to be part of the app context.
// Valid approach: Register Queue here.

@Module({
  imports: [
    TypeOrmModule.forFeature([Catalog]),
    BullModule.registerQueue({
      name: 'pdf-generation',
    }),
  ],
  controllers: [CatalogsController],
  providers: [CatalogsService, PdfProcessor],
  exports: [CatalogsService],
})
export class CatalogsModule { }
