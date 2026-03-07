import { Controller, Post, Body, Req } from '@nestjs/common';
import { PdpaService } from './pdpa.service';
import { CreateConsentDto } from './dto/create-consent.dto';
import type { Request } from 'express';

@Controller('public/pdpa')
export class PdpaController {
  constructor(private readonly pdpaService: PdpaService) {}

  @Post('consent')
  async recordConsent(@Body() dto: CreateConsentDto, @Req() req: Request) {
    const ip = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    return this.pdpaService.create(dto, ip, userAgent);
  }
}
