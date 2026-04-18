import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { OrdersService } from './orders.service';
import { CreateOrderDto, RejectOrderDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

type AuthenticatedRequest = {
  user: {
    sub: number;
    role: string;
    group_id?: number;
  };
};

const paymentSlipPath = join(process.cwd(), 'uploads', 'payment-slips');

const ensurePaymentSlipDir = () => {
  if (!existsSync(paymentSlipPath)) {
    mkdirSync(paymentSlipPath, { recursive: true });
  }
};

const paymentSlipStorage = diskStorage({
  destination: (req, file, cb) => {
    ensurePaymentSlipDir();
    cb(null, paymentSlipPath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = extname(file.originalname).toLowerCase();
    cb(null, `slip-${timestamp}-${randomStr}${ext}`);
  },
});

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // Public - get available packages
  @Get('packages')
  getPackages() {
    return this.ordersService.getPackages();
  }

  // Protected - create order (user)
  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(
    @Request() req: AuthenticatedRequest,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    return this.ordersService.createOrder(req.user.sub, createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upgrade-with-slip')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: paymentSlipStorage,
      limits: {
        fileSize: 10 * 1024 * 1024,
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only jpg, png, and webp files are allowed'), false);
        }
      },
    }),
  )
  async createUpgradeOrderWithSlip(
    @Request() req: AuthenticatedRequest,
    @Body() createOrderDto: CreateOrderDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.ordersService.createUpgradeOrderWithSlip(
      req.user.sub,
      createOrderDto,
      file,
    );
  }

  // Protected - get my orders (user)
  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMyOrders(@Request() req: AuthenticatedRequest) {
    return this.ordersService.getMyOrders(req.user.sub);
  }

  // Admin - get all pending orders
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.GROUP_ADMIN)
  @Get('pending')
  async getPendingOrders(@Request() req: AuthenticatedRequest) {
    return this.ordersService.getPendingOrders(
      req.user.role,
      req.user.group_id,
    );
  }

  // Admin - get all orders
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.GROUP_ADMIN)
  @Get('all')
  async getAllOrders(@Request() req: AuthenticatedRequest) {
    return this.ordersService.getAllOrders(req.user.role, req.user.group_id);
  }

  // Admin - approve order
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.GROUP_ADMIN)
  @Patch(':id/approve')
  async approveOrder(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.ordersService.approveOrder(+id, req.user.sub);
  }

  // Admin - reject order
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SUPER_ADMIN, UserRole.GROUP_ADMIN)
  @Patch(':id/reject')
  async rejectOrder(
    @Param('id') id: string,
    @Request() req: AuthenticatedRequest,
    @Body() rejectDto: RejectOrderDto,
  ) {
    return this.ordersService.rejectOrder(+id, req.user.sub, rejectDto);
  }
}
