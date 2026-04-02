import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { json, urlencoded } from 'express';
import session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const rawAllowedOrigins = process.env.CORS_ALLOWED_ORIGINS || process.env.FRONTEND_URL || 'http://localhost:3000';
  const allowedOrigins = rawAllowedOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  });
  
  // Add session middleware
  app.use(
    session({
      secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }),
  );
  
  // Increase body size limits for general requests
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb', extended: true }));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
