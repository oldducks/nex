import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, FeatureConfig, DEFAULT_FEATURE_CONFIG_ALL_ENABLED, DEFAULT_FEATURE_CONFIG_LOCKED } from './entities/user.entity';
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
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password_hash: hashedPassword,
    });
    return this.usersRepository.save(user);
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
    return this.usersRepository.find({
      select: ['id', 'uid', 'email', 'role', 'group_id', 'is_active', 'expiration_date', 'created_at'],
      order: { created_at: 'DESC' }
    });
  }

  async setExpiration(id: number, expirationDate: Date | null) {
    await this.usersRepository.update(id, { expiration_date: expirationDate as any });
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
    if (!user) return DEFAULT_FEATURE_CONFIG_ALL_ENABLED;
    return this.getResolvedFeatureConfig(user.feature_config);
  }

  // Helper: resolve feature config with defaults for backward compatibility
  getResolvedFeatureConfig(config: Record<string, any> | null | undefined): FeatureConfig {
    // If config is empty or null, treat as all features enabled (backward compatibility)
    if (!config || Object.keys(config).length === 0) {
      return DEFAULT_FEATURE_CONFIG_ALL_ENABLED;
    }
    // Fill in any missing keys with true (backward compatibility)
    return {
      catalog: config.catalog ?? true,
      leads: config.leads ?? true,
      namecard: config.namecard ?? true,
      'landing-pages': config['landing-pages'] ?? true,
      analytics: config.analytics ?? true,
      profile: config.profile ?? true,
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
  async createSelfRegisteredUser(email: string, password: string, referralCode?: string) {
    const uid = nanoid(10);
    const urlPrefix = nanoid(5).toLowerCase();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = this.usersRepository.create({
      email,
      password_hash: hashedPassword,
      uid,
      url_prefix: urlPrefix,
      is_active: true,
      must_change_password: false,
      feature_config: DEFAULT_FEATURE_CONFIG_LOCKED, // All features locked for new self-registered users
    });

    return this.usersRepository.save(user);
  }
}
