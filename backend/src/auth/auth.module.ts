import { Module, forwardRef, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { LineAuthService } from './strategies/line.strategy';
import { ReferralsModule } from '../referrals/referrals.module';
import { ReferralMiddleware } from './referral.middleware';

// Conditionally provide OAuth strategies only if credentials exist
const googleProvider = {
  provide: GoogleStrategy,
  useFactory: (configService: ConfigService) => {
    const clientId = configService.get('GOOGLE_CLIENT_ID');
    if (clientId) {
      return new GoogleStrategy(configService);
    }
    return null; // Skip if not configured
  },
  inject: [ConfigService],
};

const facebookProvider = {
  provide: FacebookStrategy,
  useFactory: (configService: ConfigService) => {
    const appId = configService.get('FACEBOOK_APP_ID');
    if (appId) {
      return new FacebookStrategy(configService);
    }
    return null; // Skip if not configured
  },
  inject: [ConfigService],
};

@Module({
  imports: [
    UsersModule,
    PassportModule,
    ConfigModule,
    forwardRef(() => ReferralsModule),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'secretKey',
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  providers: [
    AuthService,
    JwtStrategy,
    googleProvider,
    facebookProvider,
    LineAuthService,
    ReferralMiddleware,
  ],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ReferralMiddleware)
      .forRoutes('auth');
  }
}
