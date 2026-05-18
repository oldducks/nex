import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSetting } from './entities/admin-setting.entity';
import { AdminSettingsService } from './admin-settings.service';
import { AdminSettingsController } from './admin-settings.controller';
import { LandingPagesModule } from '../landing-pages/landing-pages.module';
import { LandingPage } from '../landing-pages/entities/landing-page.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AdminSetting, LandingPage]), LandingPagesModule],
  controllers: [AdminSettingsController],
  providers: [AdminSettingsService],
  exports: [AdminSettingsService],
})
export class AdminSettingsModule {}
