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

        this.repository.merge(page, dto);
        return this.repository.save(page);
    }

    async remove(id: number, userId: number) {
        const result = await this.repository.delete({ id, user_id: userId });
        if (result.affected === 0) throw new NotFoundException('Landing Page not found');
        return { success: true };
    }
}
