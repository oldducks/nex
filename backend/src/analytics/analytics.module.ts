import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AnalyticsLog } from './entities/analytics-log.entity';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([AnalyticsLog]),
        forwardRef(() => UsersModule)
    ],
    controllers: [AnalyticsController],
    providers: [AnalyticsService],
    exports: [AnalyticsService]
})
export class AnalyticsModule { }

