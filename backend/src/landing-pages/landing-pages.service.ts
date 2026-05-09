import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandingPage } from './entities/landing-page.entity';
import { CreateLandingPageDto, UpdateLandingPageDto } from './dto/landing-page.dto';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class LandingPagesService {
    private readonly maxMediaBlocksPerType = 20;
    private readonly referralTemplatePageId = 42;

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

    private getFirstValue(list: unknown): string {
        if (!Array.isArray(list)) return '';
        const found = list.find((item) => typeof item?.value === 'string' && item.value.trim().length > 0);
        return typeof found?.value === 'string' ? found.value.trim() : '';
    }

    private getSocialLink(profile: any, ...platforms: string[]): string {
        const links = Array.isArray(profile?.social_links_json) ? profile.social_links_json : [];
        const normalizedPlatforms = platforms.map((platform) => platform.trim().toLowerCase());
        const found = links.find((item: any) => {
            const platform = String(item?.platform || item?.type || '').trim().toLowerCase();
            return platform && normalizedPlatforms.includes(platform) && typeof item?.url === 'string' && item.url.trim().length > 0;
        });

        return typeof found?.url === 'string' ? found.url.trim() : '';
    }

    private getWebsiteLink(profile: any): string {
        const websites = Array.isArray(profile?.websites) ? profile.websites : [];
        const found = websites.find((item: any) => typeof item?.url === 'string' && item.url.trim().length > 0);
        if (typeof found?.url === 'string') return found.url.trim();
        if (typeof profile?.website === 'string' && profile.website.trim().length > 0) return profile.website.trim();
        return this.getSocialLink(profile, 'website');
    }

    private buildReferralContactContent(user: User): Record<string, string> {
        const profile = (user as any).profile || {};
        const displayName =
            typeof profile?.full_name === 'string' && profile.full_name.trim().length > 0
                ? profile.full_name.trim()
                : this.getFirstValue(profile?.names_i18n) || user.email || 'เจ้าของลิงก์นี้';

        return {
            title: 'ช่องทางติดต่อ',
            description: `ติดต่อ ${displayName} ได้จากช่องทางด้านล่าง`,
            line: this.getSocialLink(profile, 'line') || (typeof profile?.line_id === 'string' ? profile.line_id.trim() : ''),
            facebook: this.getSocialLink(profile, 'facebook', 'fb'),
            phone: this.getFirstValue(profile?.phones) || (typeof profile?.mobile === 'string' ? profile.mobile.trim() : ''),
            whatsapp: this.getSocialLink(profile, 'whatsapp'),
            telegram: this.getSocialLink(profile, 'telegram'),
            discord: this.getSocialLink(profile, 'discord'),
            x: this.getSocialLink(profile, 'x', 'twitter'),
            instagram: this.getSocialLink(profile, 'instagram'),
            tiktok: this.getSocialLink(profile, 'tiktok'),
            youtube: this.getSocialLink(profile, 'youtube'),
            linkedin: this.getSocialLink(profile, 'linkedin'),
            website: this.getWebsiteLink(profile),
            email: this.getFirstValue(profile?.emails) || (typeof profile?.email_contact === 'string' ? profile.email_contact.trim() : user.email || ''),
        };
    }

    private appendReferralCodeToUrl(rawUrl: string, referralCode: string): string {
        const trimmedUrl = rawUrl.trim();
        if (!trimmedUrl) return rawUrl;

        const relativeMatch = trimmedUrl.match(/^(\/[^?#]*)(\?[^#]*)?(#.*)?$/);
        if (relativeMatch) {
            const params = new URLSearchParams(relativeMatch[2] || '');
            params.set('ref', referralCode);
            const query = params.toString();
            return `${relativeMatch[1]}${query ? `?${query}` : ''}${relativeMatch[3] || ''}`;
        }

        try {
            const parsed = new URL(trimmedUrl);
            const allowedHosts = new Set(['nexsolution.cloud', 'www.nexsolution.cloud']);
            if (!allowedHosts.has(parsed.hostname)) return rawUrl;
            parsed.searchParams.set('ref', referralCode);
            return parsed.toString();
        } catch {
            return rawUrl;
        }
    }

    private applyReferralCodeToBlockLinks(block: any, referralCode: string): any {
        if (!block || typeof block !== 'object' || !block.content || typeof block.content !== 'object') {
            return block;
        }

        const nextContent = { ...block.content };
        const linkFields = ['link', 'external_url'];
        for (const field of linkFields) {
            if (typeof nextContent[field] === 'string' && nextContent[field].trim().length > 0) {
                nextContent[field] = this.appendReferralCodeToUrl(nextContent[field], referralCode);
            }
        }

        return {
            ...block,
            content: nextContent,
        };
    }

    private async buildReferralTemplatePage(page: LandingPage, referralCode: string): Promise<LandingPage> {
        if (page.id !== this.referralTemplatePageId || !referralCode?.trim()) {
            return page;
        }

        const normalizedReferralCode = referralCode.trim().toUpperCase();
        const referrer = await this.usersRepository.findOne({
            where: { referral_code: normalizedReferralCode },
            relations: ['profile'],
        });

        if (!referrer) {
            return page;
        }

        const clonedBlocks = Array.isArray(page.content_blocks)
            ? JSON.parse(JSON.stringify(page.content_blocks))
            : [];

        const transformedBlocks = clonedBlocks.map((block: any) => this.applyReferralCodeToBlockLinks(block, normalizedReferralCode));
        const dynamicContactBlock = {
            id: `referral-contact-${normalizedReferralCode}`,
            type: 'contact',
            content: this.buildReferralContactContent(referrer),
        };

        const existingContactIndex = transformedBlocks.findIndex((block: any) => block?.type === 'contact');
        if (existingContactIndex >= 0) {
            transformedBlocks[existingContactIndex] = dynamicContactBlock;
        } else {
            transformedBlocks.push(dynamicContactBlock);
        }

        return {
            ...page,
            content_blocks: transformedBlocks,
            referral_code: normalizedReferralCode,
        } as LandingPage;
    }

    async create(userId: number, dto: CreateLandingPageDto) {
        const user = await this.usersRepository.findOneBy({ id: userId });
        const isAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.GROUP_ADMIN;
        const hasUnlimitedLandingPages = user?.feature_config?.unlimited_landing_pages === true;

        const existingCount = await this.repository.count({ where: { user_id: userId } });
        if (!isAdmin && !hasUnlimitedLandingPages && existingCount >= 1) {
            throw new ConflictException('ต้องการสร้างเพิ่มกรุณาติดต่อแอดมิน');
        }

        // Check landing page limit (max 10 per user)
        if (!hasUnlimitedLandingPages && existingCount >= 10) {
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
        const user = await this.usersRepository.findOneBy({ id: userId });
        const isAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.GROUP_ADMIN;
        const where = isAdmin ? { id } : { id, user_id: userId };
        const page = await this.repository.findOne({ where });
        if (!page) throw new NotFoundException('Landing Page not found');
        return page;
    }

    async findBySlug(slug: string, referralCode?: string) {
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
        return this.buildReferralTemplatePage(page, referralCode || '');
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
        const user = await this.usersRepository.findOneBy({ id: userId });
        const isAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.GROUP_ADMIN;
        const result = await this.repository.delete(isAdmin ? { id } : { id, user_id: userId });
        if (result.affected === 0) throw new NotFoundException('Landing Page not found');
        return { success: true };
    }
}
