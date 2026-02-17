import { Module } from '@nestjs/common';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bullmq';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProfilesModule } from './profiles/profiles.module';
import { CatalogsModule } from './catalogs/catalogs.module';
import { ProductsModule } from './products/products.module';
import { LeadsModule } from './leads/leads.module';
import { OrdersModule } from './orders/orders.module';
import { UploadsModule } from './uploads/uploads.module';
import { User } from './users/entities/user.entity';
import { Profile } from './profiles/entities/profile.entity';
import { Catalog } from './catalogs/entities/catalog.entity';
import { Product } from './products/entities/product.entity';
import { Lead } from './leads/entities/lead.entity';
import { Order } from './orders/entities/order.entity';
import { AnalyticsModule } from './analytics/analytics.module';
import { AnalyticsLog } from './analytics/entities/analytics-log.entity';
import { MailModule } from './mail/mail.module';
import { LandingPagesModule } from './landing-pages/landing-pages.module';
import { LandingPage } from './landing-pages/entities/landing-page.entity';
import { ReferralsModule } from './referrals/referrals.module';
import { Referral } from './referrals/entities/referral.entity';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/api/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        entities: [User, Profile, Catalog, Product, Lead, Order, AnalyticsLog, LandingPage, Referral],
        synchronize: true, // Dev only
      }),
    }),
    BullModule.forRootAsync({
      useFactory: () => ({
        connection: {
          host: process.env.REDIS_HOST || 'namecard_redis',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
      }),
    }),
    UsersModule,
    AuthModule,
    ProfilesModule,
    CatalogsModule,
    ProductsModule,
    LeadsModule,
    OrdersModule,
    UploadsModule,
    AnalyticsModule,
    MailModule,
    LandingPagesModule,
    ReferralsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
