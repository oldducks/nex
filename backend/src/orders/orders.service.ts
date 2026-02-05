import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto, RejectOrderDto } from './dto/order.dto';
import { UsersService } from '../users/users.service';

// Package configuration (could be moved to config/database)
export const PACKAGES = [
    { name: 'basic', display: 'Basic', price: 299, duration_days: 30 },
    { name: 'standard', display: 'Standard', price: 799, duration_days: 90 },
    { name: 'premium', display: 'Premium', price: 1499, duration_days: 365 },
];

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private ordersRepository: Repository<Order>,
        private usersService: UsersService,
    ) { }

    getPackages() {
        return PACKAGES;
    }

    async createOrder(userId: number, createOrderDto: CreateOrderDto) {
        const packageConfig = PACKAGES.find(p => p.name === createOrderDto.package_name);
        if (!packageConfig) {
            throw new BadRequestException('Invalid package name');
        }

        const order = this.ordersRepository.create({
            user_id: userId,
            package_name: packageConfig.name,
            amount: packageConfig.price,
            duration_days: packageConfig.duration_days,
            slip_url: createOrderDto.slip_url,
            status: OrderStatus.PENDING,
        });

        return this.ordersRepository.save(order);
    }

    async getMyOrders(userId: number) {
        return this.ordersRepository.find({
            where: { user_id: userId },
            order: { created_at: 'DESC' },
        });
    }

    async getAllOrders(adminRole: string, adminGroupId?: number) {
        // Super admin sees all, group admin sees their group
        if (adminRole === 'super_admin') {
            return this.ordersRepository.find({
                relations: ['user'],
                order: { created_at: 'DESC' },
            });
        } else if (adminRole === 'group_admin' && adminGroupId) {
            return this.ordersRepository.createQueryBuilder('order')
                .innerJoinAndSelect('order.user', 'user')
                .where('user.group_id = :groupId', { groupId: adminGroupId })
                .orderBy('order.created_at', 'DESC')
                .getMany();
        }
        throw new ForbiddenException('Access denied');
    }

    async getPendingOrders(adminRole: string, adminGroupId?: number) {
        const orders = await this.getAllOrders(adminRole, adminGroupId);
        return orders.filter(o => o.status === OrderStatus.PENDING);
    }

    async approveOrder(orderId: number, adminId: number) {
        const order = await this.ordersRepository.findOne({
            where: { id: orderId },
            relations: ['user'],
        });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException('Order is not pending');
        }

        // Update order status
        order.status = OrderStatus.APPROVED;
        order.approved_by = adminId;
        order.approved_at = new Date();
        await this.ordersRepository.save(order);

        // Extend user's expiration date
        const user = order.user;
        const currentExpiry = user.expiration_date ? new Date(user.expiration_date) : new Date();
        const newExpiry = new Date(currentExpiry);
        newExpiry.setDate(newExpiry.getDate() + order.duration_days);

        await this.usersService.update(user.id, { expiration_date: newExpiry } as any);

        return { message: 'Order approved, user expiration extended', order };
    }

    async rejectOrder(orderId: number, adminId: number, rejectDto: RejectOrderDto) {
        const order = await this.ordersRepository.findOneBy({ id: orderId });

        if (!order) {
            throw new NotFoundException('Order not found');
        }

        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException('Order is not pending');
        }

        order.status = OrderStatus.REJECTED;
        order.reject_reason = rejectDto.reason;
        order.approved_by = adminId;
        order.approved_at = new Date();

        return this.ordersRepository.save(order);
    }
}
