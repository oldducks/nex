import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';

@Controller()
export class LeadsController {
    constructor(
        private readonly leadsService: LeadsService,
        private readonly usersService: UsersService,
    ) { }

    // Public endpoint - anyone can submit a contact form
    @Post('contact/:uid')
    async submitContact(@Param('uid') uid: string, @Body() createLeadDto: CreateLeadDto) {
        // Find the user by their public UID
        const owner = await this.usersService.findOneByUid(uid);
        if (!owner) {
            throw new Error('Profile not found');
        }

        // Check if owner has leads feature enabled
        const config = await this.usersService.getFeatureConfig(owner.id);
        if (!config.leads) {
            // If feature is disabled, we might still want to capture it but not show to user?
            // Or just block it. For now let's just create it but it won't be visible to user.
            // Actually better to block if we want to be strict.
        }

        const lead = await this.leadsService.create(owner.id, createLeadDto);
        return { message: 'Your message has been sent successfully!' };
    }

    // Protected - get all leads for logged-in user
    @UseGuards(JwtAuthGuard)
    @Get('leads')
    async getMyLeads(@Request() req) {
        const config = await this.usersService.getFeatureConfig(req.user.sub);
        if (!config.leads) {
            throw new ForbiddenException('ฟีเจอร์ระบบรายชื่อลูกค้า (Leads) ยังไม่ถูกเปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบเพื่ออัพเกรด');
        }
        return this.leadsService.findAllByOwner(req.user.sub);
    }

    // Protected - mark lead as read
    @UseGuards(JwtAuthGuard)
    @Patch('leads/:id/read')
    async markAsRead(@Param('id') id: string, @Request() req) {
        const config = await this.usersService.getFeatureConfig(req.user.sub);
        if (!config.leads) {
            throw new ForbiddenException('Feature restricted');
        }
        return this.leadsService.markAsRead(+id, req.user.sub);
    }

    // Protected - get unread count
    @UseGuards(JwtAuthGuard)
    @Get('leads/unread-count')
    async getUnreadCount(@Request() req) {
        const config = await this.usersService.getFeatureConfig(req.user.sub);
        if (!config.leads) {
            return { count: 0 };
        }
        const count = await this.leadsService.getUnreadCount(req.user.sub);
        return { count };
    }
}
