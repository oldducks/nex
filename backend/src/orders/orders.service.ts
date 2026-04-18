import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { CreateOrderDto, RejectOrderDto } from './dto/order.dto';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { promises as fsp } from 'fs';

// Package configuration (could be moved to config/database)
export const PACKAGES = [
  { name: 'basic', display: 'Basic', price: 299, duration_days: 30 },
  { name: 'standard', display: 'Standard', price: 799, duration_days: 90 },
  { name: 'premium', display: 'Premium', price: 1499, duration_days: 365 },
];

type LineQuotaSnapshot = {
  limit: number | null;
  used: number;
  remaining: number | null;
  recipientCount: number;
  estimatedAfterSend: number;
  canSend: boolean;
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    private usersService: UsersService,
    private mailService: MailService,
  ) {}

  getPackages() {
    return PACKAGES;
  }

  async createOrder(userId: number, createOrderDto: CreateOrderDto) {
    const packageConfig = PACKAGES.find(
      (p) => p.name === createOrderDto.package_name,
    );
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

  async createUpgradeOrderWithSlip(
    userId: number,
    createOrderDto: CreateOrderDto,
    file?: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('Slip file is required');
    }

    const packageConfig = PACKAGES.find(
      (p) => p.name === createOrderDto.package_name,
    );
    if (!packageConfig) {
      await this.safeDeleteFile(file.path);
      throw new BadRequestException('Invalid package name');
    }

    const user = await this.usersService.findOne(userId);
    if (!user) {
      await this.safeDeleteFile(file.path);
      throw new NotFoundException('User not found');
    }

    const slipRelativeUrl = `/api/uploads/payment-slips/${file.filename}`;
    const order = this.ordersRepository.create({
      user_id: userId,
      package_name: packageConfig.name,
      amount: packageConfig.price,
      duration_days: packageConfig.duration_days,
      slip_url: slipRelativeUrl,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.ordersRepository.save(order);
    const slipPublicUrl = this.toPublicUrl(slipRelativeUrl);

    const [emailSent, lineNotification] = await Promise.all([
      this.mailService.sendUpgradeSlipNotification({
        packageDisplayName: packageConfig.display,
        amount: packageConfig.price,
        userEmail: user.email,
        userId: user.id,
        orderId: savedOrder.id,
        slipUrl: slipPublicUrl,
        submittedAt: savedOrder.created_at,
      }),
      this.sendLineUpgradeNotification({
        packageDisplayName: packageConfig.display,
        amount: packageConfig.price,
        userEmail: user.email,
        userId: user.id,
        orderId: savedOrder.id,
        slipUrl: slipPublicUrl,
        submittedAt: savedOrder.created_at,
      }),
    ]);

    return {
      order: savedOrder,
      notifications: {
        emailSent,
        lineSent: lineNotification.lineSent,
      },
      lineQuota: lineNotification.lineQuota,
    };
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
      return this.ordersRepository
        .createQueryBuilder('order')
        .innerJoinAndSelect('order.user', 'user')
        .where('user.group_id = :groupId', { groupId: adminGroupId })
        .orderBy('order.created_at', 'DESC')
        .getMany();
    }
    throw new ForbiddenException('Access denied');
  }

  async getPendingOrders(adminRole: string, adminGroupId?: number) {
    const orders = await this.getAllOrders(adminRole, adminGroupId);
    return orders.filter((o) => o.status === OrderStatus.PENDING);
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
    const currentExpiry = user.expiration_date
      ? new Date(user.expiration_date)
      : new Date();
    const newExpiry = new Date(currentExpiry);
    newExpiry.setDate(newExpiry.getDate() + order.duration_days);

    await this.usersService.setExpiration(user.id, newExpiry);

    return { message: 'Order approved, user expiration extended', order };
  }

  async rejectOrder(
    orderId: number,
    adminId: number,
    rejectDto: RejectOrderDto,
  ) {
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

  private toPublicUrl(relativeUrl?: string) {
    if (!relativeUrl) return undefined;

    const apiUrl =
      process.env.API_URL ||
      process.env.FRONTEND_URL ||
      'http://localhost:4000/api';
    const normalizedBase = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

    if (
      relativeUrl.startsWith('http://') ||
      relativeUrl.startsWith('https://')
    ) {
      return relativeUrl;
    }

    if (relativeUrl.startsWith('/api/')) {
      const rootBase = normalizedBase.endsWith('/api')
        ? normalizedBase.slice(0, -4)
        : normalizedBase;
      return `${rootBase}${relativeUrl}`;
    }

    return `${normalizedBase}${relativeUrl.startsWith('/') ? '' : '/'}${relativeUrl}`;
  }

  private async sendLineUpgradeNotification(payload: {
    packageDisplayName: string;
    amount: number;
    userEmail: string;
    userId: number;
    orderId: number;
    slipUrl?: string;
    submittedAt: Date;
  }) {
    const channelAccessToken =
      process.env.LINE_MESSAGING_API_CHANNEL_ACCESS_TOKEN;
    const target = process.env.LINE_UPGRADE_NOTIFY_TO;

    if (!channelAccessToken || !target) {
      this.logger.warn(
        'LINE auto notification skipped: missing LINE_MESSAGING_API_CHANNEL_ACCESS_TOKEN or LINE_UPGRADE_NOTIFY_TO',
      );
      return {
        lineSent: false,
        lineQuota: null,
      };
    }

    const lineQuota = await this.getLineQuotaSnapshot(
      channelAccessToken,
      target,
    );
    if (lineQuota && !lineQuota.canSend) {
      this.logger.warn(
        `LINE auto notification skipped: quota exceeded (${lineQuota.used}/${lineQuota.limit ?? 'unknown'})`,
      );
      return {
        lineSent: false,
        lineQuota,
      };
    }

    const submittedAt = payload.submittedAt.toLocaleString('th-TH', {
      dateStyle: 'medium',
      timeStyle: 'short',
      timeZone: 'Asia/Bangkok',
    });

    const textLines = [
      'มีการอัปโหลดสลิปอัปเกรดแพ็กเกจใหม่',
      `Order ID: #${payload.orderId}`,
      `User ID: ${payload.userId}`,
      `Email: ${payload.userEmail}`,
      `Package: ${payload.packageDisplayName}`,
      `Amount: ${payload.amount.toLocaleString('th-TH')} บาท`,
      `Submitted: ${submittedAt}`,
      lineQuota
        ? `LINE quota: ใช้ไป ${lineQuota.used} / ${lineQuota.limit ?? 'ไม่จำกัด'}${lineQuota.remaining !== null ? ` (เหลือ ${lineQuota.remaining})` : ''}`
        : undefined,
      payload.slipUrl ? `Slip: ${payload.slipUrl}` : undefined,
    ].filter(Boolean);
    const lineMessageText = textLines.join('\n');

    try {
      const textSent = await this.pushLineMessages(channelAccessToken, target, [
        {
          type: 'text',
          text: lineMessageText,
        },
      ]);

      if (!textSent) {
        return {
          lineSent: false,
          lineQuota,
        };
      }

      if (this.canSendSlipImageToLine(payload.slipUrl)) {
        const imageSent = await this.pushLineMessages(
          channelAccessToken,
          target,
          [
            {
              type: 'image',
              originalContentUrl: payload.slipUrl!,
              previewImageUrl: payload.slipUrl!,
            },
          ],
        );

        if (!imageSent) {
          this.logger.warn(
            `LINE slip image push failed for order ${payload.orderId}, but text notification was sent successfully`,
          );
        }
      }

      return {
        lineSent: true,
        lineQuota,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown LINE notification error';
      this.logger.error(`LINE notification failed: ${message}`);
      return {
        lineSent: false,
        lineQuota,
      };
    }
  }

  private async pushLineMessages(
    channelAccessToken: string,
    target: string,
    messages: Array<Record<string, string>>,
  ) {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${channelAccessToken}`,
      },
      body: JSON.stringify({
        to: target,
        messages,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`LINE notification failed: ${response.status} ${body}`);
      return false;
    }

    return true;
  }

  private canSendSlipImageToLine(slipUrl?: string) {
    if (!slipUrl || !slipUrl.startsWith('https://')) {
      return false;
    }

    const normalizedUrl = slipUrl.toLowerCase();
    return (
      normalizedUrl.endsWith('.jpg') ||
      normalizedUrl.endsWith('.jpeg') ||
      normalizedUrl.endsWith('.png')
    );
  }

  private async getLineQuotaSnapshot(
    channelAccessToken: string,
    target: string,
  ): Promise<LineQuotaSnapshot | null> {
    try {
      const [quotaRes, consumptionRes, recipientCount] = await Promise.all([
        fetch('https://api.line.me/v2/bot/message/quota', {
          headers: {
            Authorization: `Bearer ${channelAccessToken}`,
          },
        }),
        fetch('https://api.line.me/v2/bot/message/quota/consumption', {
          headers: {
            Authorization: `Bearer ${channelAccessToken}`,
          },
        }),
        this.getLineRecipientCount(channelAccessToken, target),
      ]);

      if (!quotaRes.ok || !consumptionRes.ok) {
        const quotaBody = quotaRes.ok ? '' : await quotaRes.text();
        const consumptionBody = consumptionRes.ok
          ? ''
          : await consumptionRes.text();
        this.logger.warn(
          `LINE quota lookup failed: quota=${quotaRes.status} ${quotaBody} consumption=${consumptionRes.status} ${consumptionBody}`,
        );
        return null;
      }

      const quotaData = (await quotaRes.json()) as {
        type?: 'none' | 'limited';
        value?: number;
      };
      const consumptionData = (await consumptionRes.json()) as {
        totalUsage?: number;
      };

      const used = consumptionData.totalUsage ?? 0;
      const limit =
        quotaData.type === 'limited' ? (quotaData.value ?? null) : null;
      const estimatedAfterSend = used + recipientCount;
      const remaining = limit !== null ? Math.max(limit - used, 0) : null;
      const canSend = limit === null ? true : estimatedAfterSend <= limit;

      return {
        limit,
        used,
        remaining,
        recipientCount,
        estimatedAfterSend,
        canSend,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown LINE quota lookup error';
      this.logger.warn(`LINE quota lookup failed: ${message}`);
      return null;
    }
  }

  private async getLineRecipientCount(
    channelAccessToken: string,
    target: string,
  ): Promise<number> {
    const targetType = target.charAt(0).toUpperCase();

    if (targetType === 'U') {
      return 1;
    }

    const endpoint =
      targetType === 'C'
        ? `https://api.line.me/v2/bot/group/${target}/members/count`
        : targetType === 'R'
          ? `https://api.line.me/v2/bot/room/${target}/members/count`
          : null;

    if (!endpoint) {
      return 1;
    }

    try {
      const response = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${channelAccessToken}`,
        },
      });

      if (!response.ok) {
        const body = await response.text();
        this.logger.warn(
          `LINE recipient count lookup failed: ${response.status} ${body}`,
        );
        return 1;
      }

      const data = (await response.json()) as { count?: number };
      return data.count && data.count > 0 ? data.count : 1;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unknown LINE recipient count lookup error';
      this.logger.warn(`LINE recipient count lookup failed: ${message}`);
      return 1;
    }
  }

  private async safeDeleteFile(filePath?: string) {
    if (!filePath) return;
    await fsp.unlink(filePath).catch(() => undefined);
  }
}
