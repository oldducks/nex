import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { ReferralsService } from '../referrals/referrals.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let usersService: {
    findOneByEmail: jest.Mock;
    createSelfRegisteredUser: jest.Mock;
    setResetToken: jest.Mock;
    findByResetToken: jest.Mock;
    updatePassword: jest.Mock;
    clearMustChangePassword: jest.Mock;
    findOne: jest.Mock;
    findOneByEmailOrPhone: jest.Mock;
    findOneByPhone: jest.Mock;
    findByProviderId: jest.Mock;
    createOAuthUser: jest.Mock;
    linkOAuthProvider: jest.Mock;
  };
  let mailService: { sendPasswordResetEmail: jest.Mock };
  let referralsService: { getOrCreateReferralCode: jest.Mock; processReferral: jest.Mock };
  let jwtService: { sign: jest.Mock };

  beforeEach(async () => {
    usersService = {
      findOneByEmail: jest.fn(),
      createSelfRegisteredUser: jest.fn(),
      setResetToken: jest.fn(),
      findByResetToken: jest.fn(),
      updatePassword: jest.fn(),
      clearMustChangePassword: jest.fn(),
      findOne: jest.fn(),
      findOneByEmailOrPhone: jest.fn(),
      findOneByPhone: jest.fn(),
      findByProviderId: jest.fn(),
      createOAuthUser: jest.fn(),
      linkOAuthProvider: jest.fn(),
    };

    mailService = {
      sendPasswordResetEmail: jest.fn(),
    };

    referralsService = {
      getOrCreateReferralCode: jest.fn(),
      processReferral: jest.fn(),
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('signed-jwt'),
    };

    (bcrypt.compare as jest.Mock).mockReset();
    (bcrypt.hash as jest.Mock).mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: MailService, useValue: mailService },
        { provide: ReferralsService, useValue: referralsService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('validateUser', () => {
    it('should return user without password_hash when credentials are valid', async () => {
      usersService.findOneByEmailOrPhone.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        password_hash: 'hashed',
        role: 'user',
        uid: 'UID123',
        group_id: null,
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');

      expect(usersService.findOneByEmailOrPhone).toHaveBeenCalledWith('test@example.com');
      expect(result).toMatchObject({
        id: 1,
        email: 'test@example.com',
        role: 'user',
        uid: 'UID123',
      });
      expect((result as any).password_hash).toBeUndefined();
    });

    it('should return null when user is not found or password is invalid', async () => {
      usersService.findOneByEmailOrPhone.mockResolvedValue(null);

      const result = await service.validateUser('notfound@example.com', 'password');

      expect(result).toBeNull();
    });
  });

  describe('register', () => {
    it('should throw ConflictException when email already exists', async () => {
      usersService.findOneByEmail.mockResolvedValue({ id: 1, email: 'test@example.com' });

      await expect(
        service.register('test@example.com', undefined, 'Password123!'),
      ).rejects.toBeInstanceOf(ConflictException);
    });

    it('should create user, generate referral code and return login payload', async () => {
      const createdUser = { id: 1, email: 'new@example.com', uid: 'UID123', role: 'user', group_id: null };
      usersService.findOneByEmail
        .mockResolvedValueOnce(null); // initial conflict check
      usersService.createSelfRegisteredUser.mockResolvedValue(createdUser);
      referralsService.getOrCreateReferralCode.mockResolvedValue({ code: 'REF123' });

      const result = await service.register(
        'new@example.com',
        undefined,
        'Password123!',
        undefined,
        'REFCODE',
      );

      expect(usersService.createSelfRegisteredUser).toHaveBeenCalledWith(
        'new@example.com',
        'Password123!',
        undefined,
        undefined,
        'REFCODE',
      );
      expect(referralsService.getOrCreateReferralCode).toHaveBeenCalledWith(createdUser.id);
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: createdUser.email,
        sub: createdUser.id,
        role: createdUser.role,
        uid: createdUser.uid,
        group_id: createdUser.group_id,
      });
      expect(result).toMatchObject({
        access_token: 'signed-jwt',
        uid: 'UID123',
      });
    });
  });

  describe('forgotPassword', () => {
    it('should send reset email when user exists', async () => {
      usersService.findOneByEmail.mockResolvedValue({ id: 1, email: 'test@example.com' });

      const result = await service.forgotPassword('test@example.com');

      expect(usersService.setResetToken).toHaveBeenCalled();
      expect(mailService.sendPasswordResetEmail).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'หากอีเมลนี้มีอยู่ในระบบ ลิงก์รีเซ็ตรหัสผ่านได้ถูกส่งไปแล้ว',
      });
    });

    it('should not throw and not send email when user does not exist', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);

      const result = await service.forgotPassword('missing@example.com');

      expect(usersService.setResetToken).not.toHaveBeenCalled();
      expect(mailService.sendPasswordResetEmail).not.toHaveBeenCalled();
      expect(result).toEqual({
        message: 'หากอีเมลนี้มีอยู่ในระบบ ลิงก์รีเซ็ตรหัสผ่านได้ถูกส่งไปแล้ว',
      });
    });
  });

  describe('resetPassword', () => {
    it('should throw BadRequestException when token is invalid', async () => {
      usersService.findByResetToken.mockResolvedValue(null);

      await expect(service.resetPassword('invalid-token', 'NewPassword123!')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when token is expired', async () => {
      usersService.findByResetToken.mockResolvedValue({
        id: 1,
        reset_token_expires: new Date(Date.now() - 1000),
      });

      await expect(service.resetPassword('expired-token', 'NewPassword123!')).rejects.toBeInstanceOf(
        BadRequestException,
      );
    });
  });

  describe('changePassword', () => {
    it('should throw UnauthorizedException when current password is incorrect', async () => {
      usersService.findOne.mockResolvedValue({
        id: 1,
        password_hash: 'hashed',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.changePassword(1, 'WrongPassword', 'NewPassword123!'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});

