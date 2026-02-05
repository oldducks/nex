import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LandingPagesService } from './landing-pages.service';
import { LandingPagesController } from './landing-pages.controller';
import { LandingPage } from './entities/landing-page.entity';

@Module({
    imports: [TypeOrmModule.forFeature([LandingPage])],
    providers: [LandingPagesService],
    controllers: [LandingPagesController],
    exports: [LandingPagesService],
})
export class LandingPagesModule {}
