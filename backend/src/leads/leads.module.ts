import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeadsController } from './leads.controller';
import { LeadsService } from './leads.service';
import { Lead } from './entities/lead.entity';
import { UsersModule } from '../users/users.module';
import { FormsModule } from '../forms/forms.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Lead]),
        UsersModule,
        forwardRef(() => FormsModule),
    ],
    controllers: [LeadsController],
    providers: [LeadsService],
    exports: [LeadsService],
})
export class LeadsModule { }
