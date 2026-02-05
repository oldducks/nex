import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { Lead } from './entities/lead.entity';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Lead]),
        UsersModule,
    ],
    controllers: [LeadsController],
    providers: [LeadsService],
    exports: [LeadsService],
})
export class LeadsModule { }
