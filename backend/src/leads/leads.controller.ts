import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request, ForbiddenException, Res } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from '../users/users.service';
import { Response } from 'express';

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

    // Protected - export leads as CSV
    @UseGuards(JwtAuthGuard)
    @Get('leads/export')
    async exportLeadsCsv(@Request() req, @Res() res: Response) {
        const config = await this.usersService.getFeatureConfig(req.user.sub);
        if (!config.leads) {
            throw new ForbiddenException('ฟีเจอร์ระบบรายชื่อลูกค้า (Leads) ยังไม่ถูกเปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบเพื่ออัพเกรด');
        }
        const leads = await this.leadsService.findAllByOwner(req.user.sub);

        const header = ['id', 'name', 'email', 'phone', 'occupation', 'message', 'source_type', 'source_url', 'is_read', 'created_at'];
        const rows = leads.map((l: any) => [
            l.id,
            `"${(l.name || '').replace(/"/g, '""')}"`,
            `"${(l.email || '').replace(/"/g, '""')}"`,
            `"${(l.phone || '').replace(/"/g, '""')}"`,
            `"${(l.occupation || '').replace(/"/g, '""')}"`,
            `"${(l.message || '').replace(/"/g, '""')}"`,
            `"${(l.source_type || 'profile').replace(/"/g, '""')}"`,
            `"${(l.source_url || '').replace(/"/g, '""')}"`,
            l.is_read ? '1' : '0',
            l.created_at ? new Date(l.created_at).toISOString() : '',
        ].map(val => (val === null || val === undefined) ? '' : val).join(','));

        // Add BOM for Excel UTF-8 support
        const csv = '\uFEFF' + [header.join(','), ...rows].join('\n');

        const filename = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(csv);
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
