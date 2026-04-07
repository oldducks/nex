import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_INTERCEPTOR, APP_FILTER, APP_GUARD } from '@nestjs/core';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
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
import { FormsModule } from './forms/forms.module';
import { Form } from './forms/entities/form.entity';
import { FormSubmission } from './forms/entities/form-submission.entity';
import { QRCode } from './qr-codes/entities/qr-code.entity';
import { QrCodesModule } from './qr-codes/qr-codes.module';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import { AuditLoggingInterceptor } from './common/interceptors/audit-logging.interceptor';
import { StructuredLogger } from './common/logging/structured-logger';
import { CreateLiteModule } from './create-lite/create-lite.module';
import { PdpaModule } from './pdpa/pdpa.module';
import { ConsentLog } from './pdpa/entities/consent-log.entity';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { AdminSettingsModule } from './admin-settings/admin-settings.module';
import { AdminSetting } from './admin-settings/entities/admin-setting.entity';

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
        entities: [
          User,
          Profile,
          Catalog,
          Product,
          Lead,
          Order,
          AnalyticsLog,
          LandingPage,
          Referral,
          Form,
          FormSubmission,
          QRCode,
          ConsentLog,
          AdminSetting,
        ],
        synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
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
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
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
    FormsModule,
    QrCodesModule,
    CreateLiteModule,
    PdpaModule,
    AdminSettingsModule,
  ],
  controllers: [],
  providers: [
    StructuredLogger,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggingMiddleware).forRoutes('*');
  }
}
