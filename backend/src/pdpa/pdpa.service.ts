import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConsentLog } from './entities/consent-log.entity';
import { CreateConsentDto } from './dto/create-consent.dto';

@Injectable()
export class PdpaService {
  constructor(
    @InjectRepository(ConsentLog)
    private consentRepository: Repository<ConsentLog>,
  ) {}

  async create(dto: CreateConsentDto, ip: string, userAgent: string) {
    const log = this.consentRepository.create({
      ...dto,
      ip_address: ip,
      user_agent: userAgent,
    });
    return await this.consentRepository.save(log);
  }
}
