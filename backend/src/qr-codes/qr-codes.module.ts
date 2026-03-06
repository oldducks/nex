import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QrCodesService } from './qr-codes.service';
import { QrCodesController, QrCodesPublicController } from './qr-codes.controller';
import { QRCode } from './entities/qr-code.entity';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QRCode]),
    AnalyticsModule,
  ],
  controllers: [QrCodesController, QrCodesPublicController],
  providers: [QrCodesService],
  exports: [QrCodesService],
})
export class QrCodesModule {}

