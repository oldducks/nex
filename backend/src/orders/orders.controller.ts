import { Controller, Get, Post, Body, Param, Patch, UseGuards, Request } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, RejectOrderDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    // Public - get available packages
    @Get('packages')
    getPackages() {
        return this.ordersService.getPackages();
    }

    // Protected - create order (user)
    @UseGuards(JwtAuthGuard)
    @Post()
    async createOrder(@Request() req, @Body() createOrderDto: CreateOrderDto) {
        return this.ordersService.createOrder(req.user.sub, createOrderDto);
    }

    // Protected - get my orders (user)
    @UseGuards(JwtAuthGuard)
    @Get('my')
    async getMyOrders(@Request() req) {
        return this.ordersService.getMyOrders(req.user.sub);
    }

    // Admin - get all pending orders
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.GROUP_ADMIN)
    @Get('pending')
    async getPendingOrders(@Request() req) {
        return this.ordersService.getPendingOrders(req.user.role, req.user.group_id);
    }

    // Admin - get all orders
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.GROUP_ADMIN)
    @Get('all')
    async getAllOrders(@Request() req) {
        return this.ordersService.getAllOrders(req.user.role, req.user.group_id);
    }

    // Admin - approve order
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.GROUP_ADMIN)
    @Patch(':id/approve')
    async approveOrder(@Param('id') id: string, @Request() req) {
        return this.ordersService.approveOrder(+id, req.user.sub);
    }

    // Admin - reject order
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.SUPER_ADMIN, UserRole.GROUP_ADMIN)
    @Patch(':id/reject')
    async rejectOrder(@Param('id') id: string, @Request() req, @Body() rejectDto: RejectOrderDto) {
        return this.ordersService.rejectOrder(+id, req.user.sub, rejectDto);
    }
}
