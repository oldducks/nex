import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandingPagesService } from './landing-pages.service';
import { LandingPagesController } from './landing-pages.controller';
import { LandingPage } from './entities/landing-page.entity';
import { User } from '../users/entities/user.entity';
import { AdminSetting } from '../admin-settings/entities/admin-setting.entity';

@Module({
    imports: [TypeOrmModule.forFeature([LandingPage, User, AdminSetting])],
    providers: [LandingPagesService],
    controllers: [LandingPagesController],
    exports: [LandingPagesService],
})
export class LandingPagesModule {}
