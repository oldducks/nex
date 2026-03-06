import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Res,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { QrCodesService } from './qr-codes.service';
import { CreateQrCodeDto } from './dto/create-qr-code.dto';
import { UpdateQrCodeDto } from './dto/update-qr-code.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest, Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('qr-codes')
export class QrCodesController {
  constructor(private readonly qrCodesService: QrCodesService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateQrCodeDto) {
    return this.qrCodesService.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Request() req, @Query('qr_type') qrType?: string) {
    return this.qrCodesService.findAll(req.user.sub, qrType);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.qrCodesService.findOne(+id, req.user.sub);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateQrCodeDto) {
    return this.qrCodesService.update(+id, req.user.sub, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.qrCodesService.remove(+id, req.user.sub);
  }
}

@Controller('public/qr-codes')
export class QrCodesPublicController {
  constructor(private readonly qrCodesService: QrCodesService) {}

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @Res() res: Response,
    @Query('inline') inline?: string,
    @Query('format') format: 'png' | 'svg' = 'png',
    @Query('size') size?: string,
    @Req() req?: ExpressRequest,
  ) {
    if (format !== 'png' && format !== 'svg') {
      throw new BadRequestException('format must be png or svg');
    }

    if (size && !['small', 'medium', 'large'].includes(size)) {
      throw new BadRequestException('size must be small, medium or large');
    }

    const visitorId = (req?.headers['x-visitor-id'] as string) || req?.ip || 'unknown';

    const qr = await this.qrCodesService.getPublicQrData(+id, visitorId);
    const downloadSize = size || qr.size || 'medium';
    const imageUrl = this.qrCodesService.buildQrDataUrl(qr.target_url, downloadSize, format);

    if (inline === '1') {
      res.redirect(imageUrl);
      return;
    }

    const contentType = format === 'svg' ? 'image/svg+xml' : 'image/png';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="qr_${qr.id}.${format}"`);
    res.redirect(imageUrl);
  }
}
