import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PdpaService } from './pdpa.service';
import { PdpaController } from './pdpa.controller';
import { ConsentLog } from './entities/consent-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConsentLog])],
  controllers: [PdpaController],
  providers: [PdpaService],
  exports: [PdpaService],
})
export class PdpaModule {}
