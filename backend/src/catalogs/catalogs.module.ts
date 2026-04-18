import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { CatalogsService } from './catalogs.service';
import { CatalogsController } from './catalogs.controller';
import { Catalog } from './entities/catalog.entity';
import { PdfProcessor } from '../worker/pdf.processor';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Catalog, User]),
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
