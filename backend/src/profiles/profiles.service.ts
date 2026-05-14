import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './entities/profile.entity';
import { DEFAULT_FEATURE_CONFIG_ALL_ENABLED, DEFAULT_FEATURE_CONFIG_LOCKED, User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  private isExpired(user: User | null | undefined): boolean {
    if (!user) return false;
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.GROUP_ADMIN) return false;
    if (!user.expiration_date) return false;
    return new Date(user.expiration_date).getTime() < Date.now();
  }

  private getEffectiveSubscriptionTier(user: User | null | undefined): string {
    if (!user) return 'free';
    if (this.isExpired(user)) return 'free';
    return user.subscription_tier || 'free';
  }

  private getEffectiveFeatureConfig(user: User | null | undefined): Record<string, any> {
    if (!user) return DEFAULT_FEATURE_CONFIG_LOCKED;
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.GROUP_ADMIN) {
      return DEFAULT_FEATURE_CONFIG_ALL_ENABLED;
    }
    if (this.isExpired(user)) {
      return DEFAULT_FEATURE_CONFIG_LOCKED;
    }
    return {
      ...DEFAULT_FEATURE_CONFIG_LOCKED,
      ...(user.feature_config || {}),
      profile: true,
    };
  }

  async create(user_id: number, createProfileDto: CreateProfileDto) {
    const profile = this.profilesRepository.create({
      user_id,
      ...createProfileDto,
    });
    return this.profilesRepository.save(profile);
  }

  async findOneByUid(uid: string) {
    const user = await this.usersRepository.findOne({
      where: { uid },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Return combined object for frontend convenience
    // But technically we should return profile and let frontend combine
    // However, the spec says GET /profile/:uid returns profile + design + social_links
    // Since Profile entity has these, and we join user to check UID.

    // In TypeORM OneToOne, we fetch User and access user.profile
    if (!user.profile) {
      // Return minimal user info if profile not created yet, or throw?
      // Let's return user info with null profile fields for safety
      return {
        uid: user.uid,
        url_prefix: user.url_prefix,
        is_active: user.is_active,
        expiration_date: user.expiration_date,
        subscription_tier: this.getEffectiveSubscriptionTier(user),
        feature_config: this.getEffectiveFeatureConfig(user),
        referral_code: user.referral_code,
        profile: null
      }
    }

    return {
      uid: user.uid,
      url_prefix: user.url_prefix,
      is_active: user.is_active,
      expiration_date: user.expiration_date,
      subscription_tier: this.getEffectiveSubscriptionTier(user),
      feature_config: this.getEffectiveFeatureConfig(user),
      referral_code: user.referral_code,
      ...user.profile
    };
  }

  async findByUserId(user_id: number) {
    // Get profile with user to include UID
    const profile = await this.profilesRepository.findOne({
      where: { user_id },
      relations: ['user']
    });

    if (!profile) {
      // Get user to return UID even if no profile
      const user = await this.usersRepository.findOneBy({ id: user_id });
      return {
        uid: user?.uid || '',
        url_prefix: user?.url_prefix,
        expiration_date: user?.expiration_date,
        subscription_tier: this.getEffectiveSubscriptionTier(user),
        feature_config: this.getEffectiveFeatureConfig(user),
        full_name: '',
        position: '',
        company_name: '',
        profile_pic_url: '',
        bio: '',
        social_links_json: [],
        email: user?.email || '',
        user: user ? { role: user.role } : null
      };
    }

    return {
      uid: profile.user?.uid || '',
      url_prefix: profile.user?.url_prefix,
      expiration_date: profile.user?.expiration_date,
      subscription_tier: this.getEffectiveSubscriptionTier(profile.user),
      feature_config: this.getEffectiveFeatureConfig(profile.user),
      ...profile,
      email: profile.user?.email || '',
      user: profile.user ? { role: profile.user.role, email: profile.user.email } : null
    };
  }

  async update(user_id: number, updateProfileDto: UpdateProfileDto) {
    // Check if profile exists, if not create it
    let profile = await this.profilesRepository.findOneBy({ user_id });
    if (!profile) {
      profile = this.profilesRepository.create({ user_id, ...updateProfileDto });
      return this.profilesRepository.save(profile);
    }
    await this.profilesRepository.update(user_id, updateProfileDto);
    return this.profilesRepository.findOneBy({ user_id });
  }
}
