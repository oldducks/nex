import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

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
}
