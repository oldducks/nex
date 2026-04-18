import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, FeatureConfig, DEFAULT_FEATURE_CONFIG_ALL_ENABLED, DEFAULT_FEATURE_CONFIG_LOCKED, UserRole } from './entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateFeatureConfigDto } from './dto/update-feature-config.dto';
import * as bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';

export interface OAuthUserData {
  provider: 'google' | 'facebook' | 'line';
  providerId: string;
  email?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  referralCode?: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
  ) { }

  private async generateUniqueValue(field: 'uid' | 'url_prefix' | 'referral_code', length: number, uppercase = false): Promise<string> {
    while (true) {
      const rawValue = nanoid(length);
      const value = uppercase ? rawValue.toUpperCase() : rawValue.toLowerCase();
      const existing = await this.usersRepository.findOne({ where: { [field]: value } as any, select: ['id'] });
      if (!existing) {
        return value;
      }
    }
  }

  async create(createUserDto: CreateUserDto) {
    const normalizedEmail = createUserDto.email?.trim().toLowerCase();
    const normalizedPhone = createUserDto.phoneNumber?.trim();

    if (!normalizedEmail && !normalizedPhone) {
      throw new BadRequestException('กรุณากรอกอีเมลหรือเบอร์โทรศัพท์อย่างใดอย่างหนึ่ง');
    }

    if (normalizedEmail) {
      const existingEmail = await this.findOneByEmail(normalizedEmail);
      if (existingEmail) {
        throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว');
      }
    }

    if (normalizedPhone) {
      const existingPhone = await this.findOneByPhone(normalizedPhone);
      if (existingPhone) {
        throw new ConflictException('เบอร์โทรศัพท์นี้ถูกใช้งานแล้ว');
      }
    }

    const uid = createUserDto.uid?.trim() || await this.generateUniqueValue('uid', 10, false);
    const urlPrefix = await this.generateUniqueValue('url_prefix', 5, false);
    const referralCode = await this.generateUniqueValue('referral_code', 8, true);
    const phoneDigits = normalizedPhone ? this.normalizePhone(normalizedPhone) : '';
    const fallbackEmail = phoneDigits ? `phone_${phoneDigits}@phone.local` : `${uid}@phone.local`;
    const resolvedEmail = normalizedEmail || fallbackEmail;
    const resolvedName = createUserDto.fullName?.trim() || (normalizedPhone ? `User ${normalizedPhone}` : resolvedEmail.split('@')[0]);
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      email: resolvedEmail,
      password_hash: hashedPassword,
      uid,
      url_prefix: urlPrefix,
      role: createUserDto.role || UserRole.USER,
      group_id: createUserDto.group_id ? parseInt(createUserDto.group_id, 10) : undefined,
      is_active: true,
      must_change_password: false,
      feature_config: DEFAULT_FEATURE_CONFIG_LOCKED,
      expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      referral_code: referralCode,
    });
    const savedUser = await this.usersRepository.save(user);

    const profile = this.profilesRepository.create({
      user_id: savedUser.id,
      full_name: resolvedName,
      mobile: normalizedPhone,
      email_contact: normalizedEmail,
      names_i18n: [{ lang: 'th', value: resolvedName }],
      emails: normalizedEmail ? [{ label: 'Email', value: normalizedEmail }] : [],
      phones: normalizedPhone ? [{ label: 'Phone', value: normalizedPhone }] : [],
    } as Partial<Profile>);
    await this.profilesRepository.save(profile);

    return savedUser;
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: number) {
    return this.usersRepository.findOneBy({ id });
  }

  findOneByEmail(email: string) {
    return this.usersRepository.findOneBy({ email });
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  private getPhoneCandidates(phone: string): string[] {
    const normalized = this.normalizePhone(phone);
    if (!normalized) return [];

    const candidates = new Set<string>([normalized]);

    if (normalized.startsWith('66') && normalized.length >= 11) {
      candidates.add(`0${normalized.slice(2)}`);
    }

    if (normalized.startsWith('0') && normalized.length >= 9) {
      candidates.add(`66${normalized.slice(1)}`);
    }

    return Array.from(candidates);
  }

  async findOneByPhone(phone: string) {
    const candidates = this.getPhoneCandidates(phone);
    if (candidates.length === 0) return null;

    return this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profile', 'profile')
      .where(`regexp_replace(coalesce(profile.mobile, ''), '\\D', '', 'g') IN (:...candidates)`, { candidates })
      .getOne();
  }

  async findOneByEmailOrPhone(identifier: string) {
    const trimmed = identifier.trim();
    if (!trimmed) return null;

    if (trimmed.includes('@')) {
      return this.findOneByEmail(trimmed.toLowerCase());
    }

    const byPhone = await this.findOneByPhone(trimmed);
    if (byPhone) return byPhone;

    return this.findOneByEmail(trimmed.toLowerCase());
  }

  async findOneByUid(uid: string) {
    const user = await this.usersRepository.findOne({
      where: { uid },
      relations: ['profile'],
    });

    if (!user) {
      return null;
    }

    if (!user.profile) {
      // Return minimal user info if profile not created yet
      return {
        id: user.id,
        uid: user.uid,
        email: user.email,
        is_active: user.is_active,
        expiration_date: user.expiration_date,
        feature_config: user.feature_config,
        profile: null
      }
    }

    return {
      id: user.id,
      uid: user.uid,
      email: user.email,
      is_active: user.is_active,
      expiration_date: user.expiration_date,
      feature_config: user.feature_config,
      ...user.profile
    };
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.usersRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  remove(id: number) {
    return this.usersRepository.delete(id);
  }

  findByResetToken(token: string) {
    return this.usersRepository.findOne({
      where: { reset_token: token },
    });
  }

  async setResetToken(userId: number, token: string, expires: Date) {
    await this.usersRepository.update(userId, {
      reset_token: token,
      reset_token_expires: expires,
    });
  }

  async updatePassword(userId: number, hashedPassword: string) {
    await this.usersRepository.update(userId, {
      password_hash: hashedPassword,
      reset_token: undefined as any,
      reset_token_expires: undefined as any,
    });
  }

  async toggleActive(id: number) {
    const user = await this.findOne(id);
    if (!user) return null;
    await this.usersRepository.update(id, { is_active: !user.is_active });
    return this.findOne(id);
  }

  async findAllWithDetails() {
    const users = await this.usersRepository
      .createQueryBuilder('user')
      .leftJoin('user.profile', 'profile')
      .select([
        'user.id',
        'user.uid',
        'user.email',
        'user.role',
        'user.group_id',
        'user.is_active',
        'user.expiration_date',
        'user.created_at',
        'user.subscription_tier',
        'user.feature_config',
        'profile.mobile',
        'profile.full_name',
        'profile.names_i18n',
      ])
      .orderBy('user.created_at', 'DESC')
      .getMany();

    return users.map((user) => ({
      ...user,
      mobile: user.profile?.mobile || null,
      full_name:
        user.profile?.names_i18n?.find((item: any) => item?.lang === 'th' && item?.value?.trim())?.value?.trim() ||
        user.profile?.names_i18n?.find((item: any) => item?.value?.trim())?.value?.trim() ||
        user.profile?.full_name ||
        null,
    }));
  }

  async getExecutiveUsersSummary(days: number) {
    const now = new Date();
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - Math.max(0, days - 1));

    const [totalUsers, activeUsers, premiumUsers, freeUsers, newUsersInPeriod, newUsersDailyRaw] = await Promise.all([
      this.usersRepository.count(),
      this.usersRepository.count({ where: { is_active: true } }),
      this.usersRepository.count({ where: { subscription_tier: 'premium' } }),
      this.usersRepository.count({ where: { subscription_tier: 'free' } }),
      this.usersRepository
        .createQueryBuilder('u')
        .where('u.created_at >= :startDate', { startDate })
        .getCount(),
      this.usersRepository
        .createQueryBuilder('u')
        .select("TO_CHAR(u.created_at::date, 'YYYY-MM-DD')", 'date')
        .addSelect('COUNT(u.id)', 'count')
        .where('u.created_at >= :startDate', { startDate })
        .andWhere('u.created_at <= :now', { now })
        .groupBy('u.created_at::date')
        .orderBy('u.created_at::date', 'ASC')
        .getRawMany<{ date: string; count: string }>(),
    ]);

    return {
      totalUsers,
      activeUsers,
      premiumUsers,
      freeUsers,
      newUsersInPeriod,
      newUsersDaily: newUsersDailyRaw.map((item) => ({
        date: item.date,
        count: Number(item.count || 0),
      })),
    };
  }

  async setExpiration(id: number, expirationDate: Date | null) {
    await this.usersRepository.update(id, { expiration_date: expirationDate as any });
    return this.findOne(id);
  }

  async updateTier(id: number, tier: string) {
    const user = await this.findOne(id);
    if (!user) return null;

    const data: Partial<User> = { subscription_tier: tier };

    // If upgrading to premium, enable all features
    if (tier === 'premium') {
      data.feature_config = DEFAULT_FEATURE_CONFIG_ALL_ENABLED as any;
    } 
    // If downgrading to free, reset to locked config (only profile enabled)
    else if (tier === 'free') {
      data.feature_config = DEFAULT_FEATURE_CONFIG_LOCKED as any;
    }

    await this.usersRepository.update(id, data);
    return this.findOne(id);
  }

  async updateRole(id: number, role: string) {
    const user = await this.findOne(id);
    if (!user) return null;

    if (!Object.values(UserRole).includes(role as UserRole)) {
        throw new BadRequestException('Invalid user role');
    }

    await this.usersRepository.update(id, { role: role as UserRole });
    return this.findOne(id);
  }

  async disableExpiredUsers() {
    const now = new Date();
    const result = await this.usersRepository
      .createQueryBuilder()
      .update()
      .set({ is_active: false })
      .where('expiration_date IS NOT NULL')
      .andWhere('expiration_date < :now', { now })
      .andWhere('is_active = true')
      .execute();
    return { disabledCount: result.affected || 0 };
  }

  async clearMustChangePassword(id: number) {
    await this.usersRepository.update(id, { must_change_password: false });
  }

  // Feature Config Management
  async updateFeatureConfig(userId: number, featureConfigDto: UpdateFeatureConfigDto) {
    const user = await this.findOne(userId);
    if (!user) return null;

    // Merge with existing config (or default if empty)
    const currentConfig = this.getResolvedFeatureConfig(user.feature_config);
    const updatedConfig = { ...currentConfig, ...featureConfigDto };

    await this.usersRepository.update(userId, { feature_config: updatedConfig as any });
    return this.findOne(userId);
  }

  async getFeatureConfig(userId: number): Promise<FeatureConfig> {
    const user = await this.findOne(userId);
    if (!user) return DEFAULT_FEATURE_CONFIG_LOCKED;
    
    // Admins and Premium users always have all features enabled
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.GROUP_ADMIN || user.subscription_tier === 'premium') {
      return DEFAULT_FEATURE_CONFIG_ALL_ENABLED;
    }

    return this.getResolvedFeatureConfig(user.feature_config);
  }

  // Helper: resolve feature config with defaults for backward compatibility
  getResolvedFeatureConfig(config: Record<string, any> | null | undefined): FeatureConfig {
    // If config is empty or null, treat as all features enabled (backward compatibility for old users)
    // or use LOCKED config for new ones.
    // Note: In a real system, we might want to check when the user was created.
    if (!config || Object.keys(config).length === 0) {
      return DEFAULT_FEATURE_CONFIG_LOCKED;
    }

    // Fill in any missing keys, defaulting to false if not found (since it's now explicit)
    return {
      catalog: config.catalog ?? false,
      leads: config.leads ?? false,
      namecard: config.namecard ?? false,
      'landing-pages': config['landing-pages'] ?? false,
      analytics: config.analytics ?? false,
      profile: config.profile ?? false,
      referrals: config.referrals ?? false,
    };
  }

  // Bulk update feature config for all users (admin migration)
  async setAllUsersFeatureConfig(config: FeatureConfig) {
    const result = await this.usersRepository.update({}, { feature_config: config as any });
    return { updatedCount: result.affected || 0 };
  }

  // OAuth Methods
  async findByProviderId(provider: 'google' | 'facebook' | 'line', providerId: string) {
    const whereClause: Record<string, string> = {};
    whereClause[`${provider}_id`] = providerId;
    return this.usersRepository.findOne({ where: whereClause });
  }

  async createOAuthUser(data: OAuthUserData) {
    const uid = nanoid(10);
    const urlPrefix = nanoid(5).toLowerCase();
    const displayName = data.displayName || data.firstName || data.email?.split('@')[0] || 'User';

    const userData: Partial<User> = {
      email: data.email || `${data.provider}_${data.providerId}@oauth.local`,
      uid,
      url_prefix: urlPrefix,
      is_active: true,
      must_change_password: false, // OAuth users don't need to change password
      feature_config: DEFAULT_FEATURE_CONFIG_LOCKED, // All features locked for new OAuth users
      expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expiration in 30 days
    };

    // Set the provider ID
    if (data.provider === 'google') userData.google_id = data.providerId;
    if (data.provider === 'facebook') userData.facebook_id = data.providerId;
    if (data.provider === 'line') userData.line_id = data.providerId;

    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  async linkOAuthProvider(userId: number, provider: 'google' | 'facebook' | 'line', providerId: string) {
    const updateData: Record<string, string> = {};
    updateData[`${provider}_id`] = providerId;
    await this.usersRepository.update(userId, updateData);
    return this.findOne(userId);
  }

  // Self-registration (email/password)
  async createSelfRegisteredUser(email: string | undefined, password: string, fullName?: string, phoneNumber?: string, referralCode?: string) {
    const uid = nanoid(10);
    const urlPrefix = nanoid(5).toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);
    const phoneDigits = phoneNumber ? this.normalizePhone(phoneNumber) : '';
    const fallbackEmail = phoneDigits ? `phone_${phoneDigits}@phone.local` : `${uid}@phone.local`;
    const resolvedEmail = email?.trim().toLowerCase() || fallbackEmail;
    const resolvedName = fullName?.trim() || (phoneNumber ? `User ${phoneNumber}` : resolvedEmail.split('@')[0]);

    const user = this.usersRepository.create({
      email: resolvedEmail,
      password_hash: hashedPassword,
      uid,
      url_prefix: urlPrefix,
      is_active: true,
      must_change_password: false,
      feature_config: DEFAULT_FEATURE_CONFIG_LOCKED, // All features locked for new self-registered users
      expiration_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expiration in 30 days
    });

    const savedUser = await this.usersRepository.save(user);

    // Create associated profile
    const profile = this.profilesRepository.create({
      user_id: savedUser.id,
      full_name: resolvedName,
      mobile: phoneNumber,
    });
    await this.profilesRepository.save(profile);

    return savedUser;
  }
}
