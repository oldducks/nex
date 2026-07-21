import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { User, DEFAULT_FEATURE_CONFIG_LOCKED } from './entities/user.entity';
import { Profile } from '../profiles/entities/profile.entity';
import { Catalog } from '../catalogs/entities/catalog.entity';
import { LandingPage } from '../landing-pages/entities/landing-page.entity';

jest.mock('bcrypt');

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

function createMockRepo(): MockRepo {
  return {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
}

describe('UsersService', () => {
  let service: UsersService;
  let repo: MockRepo<User>;

  beforeEach(async () => {
    repo = createMockRepo();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repo,
        },
        { provide: getRepositoryToken(Profile), useValue: createMockRepo() },
        { provide: getRepositoryToken(Catalog), useValue: createMockRepo() },
        { provide: getRepositoryToken(LandingPage), useValue: createMockRepo() },
        { provide: DataSource, useValue: { transaction: jest.fn() } },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('createSelfRegisteredUser', () => {
    it('should create user with locked feature config and hashed password', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      (repo.create as jest.Mock).mockImplementation((data) => data);
      (repo.save as jest.Mock).mockImplementation((data) => ({
        id: 1,
        ...data,
      }));

      const result = await service.createSelfRegisteredUser('user@example.com', 'Password123!', undefined);

      expect(bcrypt.hash).toHaveBeenCalledWith('Password123!', 10);
      expect(repo.create).toHaveBeenCalled();
      expect(result.email).toBe('user@example.com');
      expect(result.password_hash).toBe('hashed-password');
      expect(result.feature_config).toEqual(DEFAULT_FEATURE_CONFIG_LOCKED);
      expect(result.is_active).toBe(true);
    });
  });

  describe('getResolvedFeatureConfig', () => {
    it('should return the locked config when input is null/empty', () => {
      expect(service.getResolvedFeatureConfig(null as any)).toEqual(DEFAULT_FEATURE_CONFIG_LOCKED);
      expect(service.getResolvedFeatureConfig({})).toEqual(DEFAULT_FEATURE_CONFIG_LOCKED);
    });

    it('should fill missing keys with false, except profile which is always on', () => {
      const partialConfig = { catalog: true, leads: false };
      const resolved = service.getResolvedFeatureConfig(partialConfig as any);

      expect(resolved.catalog).toBe(true);
      expect(resolved.leads).toBe(false);
      expect(resolved.namecard).toBe(false);
      expect(resolved['landing-pages']).toBe(false);
      expect(resolved.analytics).toBe(false);
      expect(resolved.profile).toBe(true);
      expect(resolved.referrals).toBe(false);
    });
  });
});

