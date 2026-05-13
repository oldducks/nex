import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Referral, ReferralStatus } from './entities/referral.entity';
import { User } from '../users/entities/user.entity';
import { nanoid } from 'nanoid';

const MAX_REFERRAL_LEVELS = 10;
const BASE_COMMISSION_RATE = 10; // 10%

@Injectable()
export class ReferralsService {
    constructor(
        @InjectRepository(Referral)
        private referralsRepository: Repository<Referral>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) { }

    // Generate unique 8-character referral code
    async generateReferralCode(): Promise<string> {
        let code: string;
        let exists = true;

        while (exists) {
            code = nanoid(8).toUpperCase();
            const existingUser = await this.usersRepository.findOne({ where: { referral_code: code } });
            exists = !!existingUser;
        }

        return code!;
    }

    // Get or generate referral code for user
    async getOrCreateReferralCode(userId: number): Promise<string> {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user) throw new Error('User not found');

        if (user.referral_code) {
            return user.referral_code;
        }

        const code = await this.generateReferralCode();
        await this.usersRepository.update(userId, { referral_code: code });
        return code;
    }

    // Validate referral code
    async validateReferralCode(code: string): Promise<{ valid: boolean; referrer?: { id: number; email: string } }> {
        const user = await this.usersRepository.findOne({
            where: { referral_code: code.toUpperCase() },
            select: ['id', 'email'],
        });

        if (!user) {
            return { valid: false };
        }

        return { valid: true, referrer: { id: user.id, email: user.email } };
    }

    // Process referral when a new user registers
    async processReferral(newUserId: number, referralCode: string, registrationFee: number = 0): Promise<void> {
        // Find the referrer by code
        const referrer = await this.usersRepository.findOne({
            where: { referral_code: referralCode.toUpperCase() },
        });

        if (!referrer) return;

        // Set referred_by on the new user
        await this.usersRepository.update(newUserId, { referred_by: referrer.id });

        // Create referral chain (multi-level)
        let currentReferrerId = referrer.id;
        let currentFee = registrationFee;
        let level = 1;

        while (currentReferrerId && level <= MAX_REFERRAL_LEVELS) {
            const commission = currentFee > 0 ? currentFee * (BASE_COMMISSION_RATE / 100) : 0;
            const actualCommission = commission >= 0.01 ? commission : 0;

            // Create referral record
            const referral = this.referralsRepository.create({
                referrer_id: currentReferrerId,
                referred_id: newUserId,
                level,
                commission_amount: actualCommission,
                commission_rate: BASE_COMMISSION_RATE,
                registration_fee: level === 1 ? registrationFee : 0,
                status: registrationFee > 0 ? ReferralStatus.CONFIRMED : ReferralStatus.PENDING,
            } as Partial<Referral>);
            await this.referralsRepository.save(referral);

            // Move up the chain
            const currentReferrer = await this.usersRepository.findOne({ where: { id: currentReferrerId } });
            if (!currentReferrer?.referred_by) break;

            currentReferrerId = currentReferrer.referred_by;
            currentFee = actualCommission; // Next level gets commission of commission
            level++;
        }
    }

    // Get referral stats for a user
    async getReferralStats(userId: number) {
        // Direct referrals count
        const directCount = await this.referralsRepository.count({
            where: { referrer_id: userId, level: 1 },
        });

        // Total referrals (all levels)
        const totalCount = await this.referralsRepository.count({
            where: { referrer_id: userId },
        });

        // Total commission earned
        const { totalCommission } = await this.referralsRepository
            .createQueryBuilder('referral')
            .select('SUM(referral.commission_amount)', 'totalCommission')
            .where('referral.referrer_id = :userId', { userId })
            .andWhere('referral.status IN (:...statuses)', { statuses: [ReferralStatus.CONFIRMED, ReferralStatus.PAID] })
            .getRawOne();

        // Pending commission
        const { pendingCommission } = await this.referralsRepository
            .createQueryBuilder('referral')
            .select('SUM(referral.commission_amount)', 'pendingCommission')
            .where('referral.referrer_id = :userId', { userId })
            .andWhere('referral.status = :status', { status: ReferralStatus.PENDING })
            .getRawOne();

        // Get user's referral code
        const user = await this.usersRepository.findOne({ where: { id: userId } });

        return {
            referralCode: user?.referral_code || null,
            directReferrals: directCount,
            totalReferrals: totalCount,
            totalCommission: parseFloat(totalCommission) || 0,
            pendingCommission: parseFloat(pendingCommission) || 0,
        };
    }

    // Get referral tree for a user
    async getReferralTree(userId: number) {
        const referrals = await this.referralsRepository.find({
            where: { referrer_id: userId },
            relations: ['referred', 'referred.profile'],
            order: { level: 'ASC', created_at: 'DESC' },
        });

        return referrals.map(ref => ({
            id: ref.id,
            level: ref.level,
            referredUser: {
                id: ref.referred?.id,
                email: ref.referred?.email,
                uid: ref.referred?.uid,
                profilePic: ref.referred?.profile?.profile_pic_url,
                fullName:
                    ref.referred?.profile?.full_name ||
                    ref.referred?.email?.split('@')[0] ||
                    '',
                phone:
                    ref.referred?.profile?.mobile ||
                    ref.referred?.profile?.phones?.find((item) => typeof item?.value === 'string' && item.value.trim().length > 0)?.value ||
                    '',
                subscription_tier: ref.referred?.subscription_tier || 'free',
            },
            commission: typeof ref.commission_amount === 'string' ? parseFloat(ref.commission_amount) : ref.commission_amount,
            status: ref.status,
            createdAt: ref.created_at,
        }));
    }

    // Get who referred this user
    async getMyReferrer(userId: number) {
        const user = await this.usersRepository.findOne({ where: { id: userId } });
        if (!user?.referred_by) return null;

        const referrer = await this.usersRepository.findOne({
            where: { id: user.referred_by },
            select: ['id', 'email', 'uid'],
        });

        return referrer;
    }

    // Generate referral codes for all existing users who don't have one
    async generateCodesForExistingUsers() {
        const usersWithoutCode = await this.usersRepository.find({
            where: { referral_code: null as any },
        });

        let count = 0;
        for (const user of usersWithoutCode) {
            const code = await this.generateReferralCode();
            await this.usersRepository.update(user.id, { referral_code: code });
            count++;
        }

        return { generatedCount: count };
    }

    // Admin: Get all referrals
    async getAllReferrals(page: number = 1, limit: number = 50) {
        const [referrals, total] = await this.referralsRepository.findAndCount({
            relations: ['referrer', 'referred'],
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });

        return {
            referrals: referrals.map(ref => ({
                id: ref.id,
                referrer: { id: ref.referrer?.id, email: ref.referrer?.email },
                referred: { id: ref.referred?.id, email: ref.referred?.email },
                level: ref.level,
                commission: ref.commission_amount,
                status: ref.status,
                createdAt: ref.created_at,
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit),
        };
    }
}
