import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './entities/lead.entity';
import { CreateLeadDto } from './dto/create-lead.dto';

@Injectable()
export class LeadsService {
    constructor(
        @InjectRepository(Lead)
        private leadsRepository: Repository<Lead>,
    ) { }

    async create(ownerId: number, createLeadDto: CreateLeadDto) {
        if (!createLeadDto.pdpa_consent) {
            throw new BadRequestException('PDPA consent is required');
        }

        const lead = this.leadsRepository.create({
            ...createLeadDto,
            owner_id: ownerId,
            consent_timestamp: new Date(),
        });

        return this.leadsRepository.save(lead);
    }

    async findAllByOwner(ownerId: number) {
        return this.leadsRepository.find({
            where: { owner_id: ownerId },
            order: { created_at: 'DESC' },
        });
    }

    async markAsRead(id: number, ownerId: number) {
        const lead = await this.leadsRepository.findOne({
            where: { id, owner_id: ownerId },
        });

        if (!lead) {
            throw new BadRequestException('Lead not found');
        }

        lead.is_read = true;
        return this.leadsRepository.save(lead);
    }

    async getUnreadCount(ownerId: number) {
        return this.leadsRepository.count({
            where: { owner_id: ownerId, is_read: false },
        });
    }
}
