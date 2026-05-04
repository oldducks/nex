import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Catalog } from '../catalogs/entities/catalog.entity';
import { LandingPage } from '../landing-pages/entities/landing-page.entity';
import { AnalyticsModule } from '../analytics/analytics.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Catalog, LandingPage]),
    forwardRef(() => AnalyticsModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule { }
