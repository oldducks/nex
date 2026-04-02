import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QRCode } from './entities/qr-code.entity';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';
import { AnalyticsService } from '../analytics/analytics.service';
import { AnalyticsAction } from '../analytics/entities/analytics-log.entity';

@Injectable()
export class QrCodesService {
  constructor(
    @InjectRepository(QRCode)
    private readonly qrRepository: Repository<QRCode>,
    private readonly analyticsService: AnalyticsService,
  ) {}

  // 根据 ownerId 创建新的 QR 记录，并生成对应的 qr_data URL
  async create(ownerId: number, dto: CreateQrCodeDto) {
    const size = dto.size || 'medium';
    const fg = dto.fg_color || '#000000';
    const bg = dto.bg_color || '#FFFFFF';

    // 目前先使用 qrserver.com 的图片 URL 作为 qr_data，未来可以切换为自托管生成
    const qrDataUrl = this.buildQrDataUrl(dto.target_url, size, 'png', fg, bg);

    const entity = this.qrRepository.create({
      user_id: ownerId,
      name: dto.name,
      qr_type: dto.qr_type,
      target_id: dto.target_id ?? null,
      target_url: dto.target_url,
      size,
      fg_color: fg,
      bg_color: bg,
      logo_data: dto.logo_data,
      qr_data: qrDataUrl,
    });

    return this.qrRepository.save(entity);
  }

  // 查询当前用户的所有 QR（可选过滤 qr_type）
  async findAll(ownerId: number, qrType?: string) {
    const where: any = { user_id: ownerId };
    if (qrType) {
      where.qr_type = qrType;
    }
    return this.qrRepository.find({
      where,
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number, ownerId: number) {
    const qr = await this.qrRepository.findOne({ where: { id } });
    if (!qr) {
      throw new NotFoundException('QR code not found');
    }
    if (qr.user_id !== ownerId) {
      throw new ForbiddenException('You do not have access to this QR code');
    }
    return qr;
  }

  async update(id: number, ownerId: number, dto: UpdateQrCodeDto) {
    const qr = await this.findOne(id, ownerId);

    // 如果 target_url 或 size 发生变化，需要重新计算 qr_data
    if (dto.target_url || dto.size || dto.fg_color || dto.bg_color) {
      const nextUrl = dto.target_url ?? qr.target_url;
      const nextSize = dto.size ?? qr.size ?? 'medium';
      const nextFg = dto.fg_color ?? qr.fg_color ?? '#000000';
      const nextBg = dto.bg_color ?? qr.bg_color ?? '#FFFFFF';
      qr.qr_data = this.buildQrDataUrl(nextUrl, nextSize, 'png', nextFg, nextBg);
      qr.target_url = nextUrl;
      qr.size = nextSize;
      qr.fg_color = nextFg;
      qr.bg_color = nextBg;
    }

    if (dto.logo_data) {
        qr.logo_data = dto.logo_data;
    }

    Object.assign(qr, {
      name: dto.name ?? qr.name,
      qr_type: dto.qr_type ?? qr.qr_type,
      target_id: dto.target_id ?? qr.target_id,
    });

    return this.qrRepository.save(qr);
  }

  async remove(id: number, ownerId: number) {
    const qr = await this.findOne(id, ownerId);
    await this.qrRepository.remove(qr);
    return { success: true };
  }

  /**
   * 公共下载逻辑：返回 qr 实体本身，并在有 visitorId 时记录一次扫描 + analytics log
   */
  async getPublicQrData(id: number, visitorId?: string) {
    const qr = await this.qrRepository.findOne({ where: { id } });
    if (!qr) {
      throw new NotFoundException('QR code not found');
    }

    // 如果有 visitorId，认为这是一次有效的“扫码/查看”事件
    if (visitorId) {
      qr.scan_count = (qr.scan_count || 0) + 1;
      await this.qrRepository.save(qr);

      // 记录 Analytics 日志，用สำหรับแดชบอร์ดในอนาคต
      await this.analyticsService.logEventByUserId(
        qr.user_id,
        AnalyticsAction.SCAN_QR,
        visitorId,
        {
          qrId: qr.id,
          qrType: qr.qr_type,
          targetId: qr.target_id ?? null,
          targetUrl: qr.target_url,
        },
      );
    }

    return qr;
  }

  buildQrDataUrl(targetUrl: string, size: string = 'medium', format: 'png' | 'svg' = 'png', fgColor: string = '#000000', bgColor: string = '#FFFFFF') {
    const pixelSize = this.mapSizeToPixels(size);
    const encoded = encodeURIComponent(targetUrl);
    // Remove # for api.qrserver.com
    const fg = fgColor.replace('#', '');
    const bg = bgColor.replace('#', '');
    return `https://api.qrserver.com/v1/create-qr-code/?size=${pixelSize}x${pixelSize}&data=${encoded}&format=${format}&margin=10&color=${fg}&bgcolor=${bg}`;
  }

  // 简单映射 size → 像素尺寸
  private mapSizeToPixels(size: string): number {
    switch (size) {
      case 'small':
        return 160;
      case 'large':
        return 400;
      case 'medium':
      default:
        return 250;
    }
  }
}
