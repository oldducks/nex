import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandingPage } from './entities/landing-page.entity';
import { CreateLandingPageDto, UpdateLandingPageDto } from './dto/landing-page.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class LandingPagesService {
    private readonly maxMediaBlocksPerType = 20;

    constructor(
        @InjectRepository(LandingPage)
        private repository: Repository<LandingPage>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    private sanitizeSlug(value: string): string {
        return value
            .trim()
            .replace(/[^a-zA-Z0-9ก-๙\u0E00-\u0E7F]+/gu, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-{2,}/g, '-')
            .toLowerCase();
    }

    private generateFallbackSlug(): string {
        const now = new Date();
        const datePart = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
        const randomPart = Math.random().toString(36).slice(2, 8);
        return `lp-${datePart}-${randomPart}`;
    }

    private async makeUniqueSlug(slug: string, excludeId?: number): Promise<string> {
        let proposedSlug = slug;
        let finalSlug = proposedSlug;
        let counter = 1;
        
        while (true) {
            const query = this.repository.createQueryBuilder('page')
                .where('page.slug = :slug', { slug: finalSlug });
            
            if (excludeId) {
                query.andWhere('page.id != :id', { id: excludeId });
            }
            
            const existing = await query.getOne();
            if (!existing) return finalSlug;
            
            // If already ends with -N, increment N
            finalSlug = `${proposedSlug}-${counter}`;
            counter++;
            
            if (counter > 100) {
              // Extra safety factor if many collisions
              return `${proposedSlug}-${Math.random().toString(36).slice(2, 7)}`;
            }
        }
    }

    async create(userId: number, dto: CreateLandingPageDto) {
        const user = await this.usersRepository.findOneBy({ id: userId });
        const isAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.GROUP_ADMIN;

        const existingCount = await this.repository.count({ where: { user_id: userId } });
        if (!isAdmin && existingCount >= 1) {
            throw new ConflictException('ต้องการสร้างเพิ่มกรุณาติดต่อแอดมิน');
        }

        // Check landing page limit (max 10 per user)
        if (existingCount >= 10) {
            throw new ConflictException('คุณสร้าง Landing Page ครบ 10 หน้าแล้ว ไม่สามารถสร้างเพิ่มได้');
        }

        const normalizedSlug = this.sanitizeSlug(dto.slug || '');
        const baseSlug = normalizedSlug || this.generateFallbackSlug();
        
        // Ensure uniqueness
        const uniqueSlug = await this.makeUniqueSlug(baseSlug);

        const page = this.repository.create({
            user_id: userId,
            ...dto,
            slug: uniqueSlug,
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
        const decodedSlug = decodeURIComponent(slug);
        const isNumericLookup = /^\d+$/.test(decodedSlug);
        const where = isNumericLookup
            ? ({ id: Number(decodedSlug), is_published: true } as const)
            : ({ slug: decodedSlug, is_published: true } as const);

        const page = await this.repository.findOne({
            where,
            relations: ['user'],
        });
        if (!page) throw new NotFoundException('Landing Page not found');
        return page;
    }

    async update(id: number, userId: number, dto: UpdateLandingPageDto) {
        const page = await this.findOne(id, userId);
        
        if (dto.slug && dto.slug !== page.slug) {
            const normalizedSlug = this.sanitizeSlug(dto.slug);
            const baseSlug = normalizedSlug || this.generateFallbackSlug();
            dto.slug = await this.makeUniqueSlug(baseSlug, id);
        }

        // Check image and video limits (max 20 each per landing page)
        if (dto.content_blocks) {
            const imageBlocks = dto.content_blocks.filter((b: any) => b.type === 'image');
            const videoBlocks = dto.content_blocks.filter((b: any) => b.type === 'video');
            
            if (imageBlocks.length > this.maxMediaBlocksPerType) {
                throw new ConflictException(`จำกัดรูปภาพไม่เกิน ${this.maxMediaBlocksPerType} รูปต่อ Landing Page`);
            }
            if (videoBlocks.length > this.maxMediaBlocksPerType) {
                throw new ConflictException(`จำกัดวิดีโอไม่เกิน ${this.maxMediaBlocksPerType} วิดีโอต่อ Landing Page`);
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
