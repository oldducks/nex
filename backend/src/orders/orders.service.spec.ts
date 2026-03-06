import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdersService, PACKAGES } from './orders.service';
import { Order, OrderStatus } from './entities/order.entity';
import { UsersService } from '../users/users.service';

type MockRepo<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

function createMockRepo(): MockRepo {
  return {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    update: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
}

describe('OrdersService (Workspace/Group Awareness)', () => {
  let service: OrdersService;
  let repo: MockRepo<Order>;
  let usersService: { update: jest.Mock };

  beforeEach(async () => {
    repo = createMockRepo();
    usersService = {
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: repo },
        { provide: UsersService, useValue: usersService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  describe('getAllOrders (multi-tenant visibility)', () => {
    it('should return all orders for super_admin', async () => {
      const fakeOrders = [{ id: 1 }, { id: 2 }];
      (repo.find as jest.Mock).mockResolvedValue(fakeOrders);

      const result = await service.getAllOrders('super_admin');

      expect(repo.find).toHaveBeenCalledWith({
        relations: ['user'],
        order: { created_at: 'DESC' },
      });
      expect(result).toBe(fakeOrders);
    });

    it('should filter by group_id for group_admin', async () => {
      const qb: any = {
        innerJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([{ id: 1 }]),
      };
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.getAllOrders('group_admin', 10);

      expect(repo.createQueryBuilder).toHaveBeenCalledWith('order');
      expect(qb.innerJoinAndSelect).toHaveBeenCalledWith('order.user', 'user');
      expect(qb.where).toHaveBeenCalledWith('user.group_id = :groupId', { groupId: 10 });
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('approveOrder (extends user expiration)', () => {
    it('should extend expiration based on package duration', async () => {
      const now = new Date('2024-01-01T00:00:00.000Z');
      const existingExpiry = new Date('2024-01-10T00:00:00.000Z');
      const order: any = {
        id: 1,
        status: OrderStatus.PENDING,
        duration_days: 30,
        user: {
          id: 99,
          expiration_date: existingExpiry,
        },
      };

      (repo.findOne as jest.Mock).mockResolvedValue(order);
      (repo.save as jest.Mock).mockImplementation(async (o) => o);

      // Freeze Date via spy if needed, but logic uses existingExpiry as base,
      // so we only assert relative extension.
      await service.approveOrder(1, 1000);

      expect(repo.save).toHaveBeenCalled();
      const [, updatePayload] = usersService.update.mock.calls[0];
      const newExpiry: Date = (updatePayload as any).expiration_date;
      const diffMs = newExpiry.getTime() - existingExpiry.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      expect(Math.round(diffDays)).toBe(30);
    });
  });
});

