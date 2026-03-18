import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandingPage } from './entities/landing-page.entity';
import { CreateLandingPageDto, UpdateLandingPageDto } from './dto/landing-page.dto';

@Injectable()
export class LandingPagesService {
    constructor(
        @InjectRepository(LandingPage)
        private repository: Repository<LandingPage>,
    ) {}

    async create(userId: number, dto: CreateLandingPageDto) {
        // Check landing page limit (max 10 per user)
        const existingCount = await this.repository.count({ where: { user_id: userId } });
        if (existingCount >= 10) {
            throw new ConflictException('คุณสร้าง Landing Page ครบ 10 หน้าแล้ว ไม่สามารถสร้างเพิ่มได้');
        }

        const existing = await this.repository.findOne({ where: { slug: dto.slug } });
        if (existing) throw new ConflictException('Slug already exists');

        const page = this.repository.create({
            user_id: userId,
            ...dto,
        });
        return this.repository.save(page);
    }

    async findAll(userId: number) {
        return this.repository.find({
            where: { user_id: userId },
            order: { created_at: 'DESC' },
        });
    }

    async findOne(id: number, userId: number) {
        const page = await this.repository.findOne({ where: { id, user_id: userId } });
        if (!page) throw new NotFoundException('Landing Page not found');
        return page;
    }

    async findBySlug(slug: string) {
        const page = await this.repository.findOne({
            where: { slug, is_published: true },
            relations: ['user'],
        });
        if (!page) throw new NotFoundException('Landing Page not found');
        return page;
    }

    async update(id: number, userId: number, dto: UpdateLandingPageDto) {
        const page = await this.findOne(id, userId);
        
        if (dto.slug && dto.slug !== page.slug) {
            const existing = await this.repository.findOne({ where: { slug: dto.slug } });
            if (existing) throw new ConflictException('Slug already exists');
        }

        // Check image and video limits (max 10 each per landing page)
        if (dto.content_blocks) {
            const imageBlocks = dto.content_blocks.filter((b: any) => b.type === 'image');
            const videoBlocks = dto.content_blocks.filter((b: any) => b.type === 'video');
            
            if (imageBlocks.length > 10) {
                throw new ConflictException('จำกัดรูปภาพไม่เกิน 10 รูปต่อ Landing Page');
            }
            if (videoBlocks.length > 10) {
                throw new ConflictException('จำกัดวิดีโอไม่เกิน 10 วิดีโอต่อ Landing Page');
            }
        }

        this.repository.merge(page, dto);
        return this.repository.save(page);
    }

    async remove(id: number, userId: number) {
        const result = await this.repository.delete({ id, user_id: userId });
        if (result.affected === 0) throw new NotFoundException('Landing Page not found');
        return { success: true };
    }
}
