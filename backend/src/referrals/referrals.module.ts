import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReferralsService } from './referrals.service';
import { ReferralsController } from './referrals.controller';
import { Referral } from './entities/referral.entity';
import { User } from '../users/entities/user.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Referral, User])],
    providers: [ReferralsService],
    controllers: [ReferralsController],
    exports: [ReferralsService],
})
export class ReferralsModule { }
