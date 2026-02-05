import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
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

        const lead = await this.leadsService.create(owner.id, createLeadDto);

        // TODO: Send email notification to owner
        console.log(`[EMAIL] New lead for ${owner.email}: ${createLeadDto.name}`);

        return { message: 'Your message has been sent successfully!' };
    }

    // Protected - get all leads for logged-in user
    @UseGuards(JwtAuthGuard)
    @Get('leads')
    async getMyLeads(@Request() req) {
        return this.leadsService.findAllByOwner(req.user.sub);
    }

    // Protected - mark lead as read
    @UseGuards(JwtAuthGuard)
    @Patch('leads/:id/read')
    async markAsRead(@Param('id') id: string, @Request() req) {
        return this.leadsService.markAsRead(+id, req.user.sub);
    }

    // Protected - get unread count
    @UseGuards(JwtAuthGuard)
    @Get('leads/unread-count')
    async getUnreadCount(@Request() req) {
        const count = await this.leadsService.getUnreadCount(req.user.sub);
        return { count };
    }
}
