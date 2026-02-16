import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { Catalog } from './entities/catalog.entity';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectRepository(Catalog)
    private catalogsRepository: Repository<Catalog>,
    @InjectQueue('pdf-generation') private pdfQueue: Queue,
  ) { }

  create(user_id: number, createCatalogDto: CreateCatalogDto) {
    const catalog = this.catalogsRepository.create({
      user_id,
      ...createCatalogDto,
    });
    return this.catalogsRepository.save(catalog);
  }

  findAll(user_id: number) {
    return this.catalogsRepository.find({
      where: { user_id },
      relations: ['products'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: number, user_id: number) {
    const catalog = await this.catalogsRepository.findOne({
      where: { id, user_id },
      relations: ['products'],
    });
    if (!catalog) throw new NotFoundException('Catalog not found');
    return catalog;
  }

  async findBySlug(slug: string) {
    const catalog = await this.catalogsRepository.findOne({
      where: { custom_slug: slug, is_active: true },
      relations: ['products'],
    });
    if (!catalog) throw new NotFoundException('Catalog not found');
    return catalog;
  }

  async findOnePublic(id: number) {
    const catalog = await this.catalogsRepository.findOne({
      where: { id, is_active: true },
      relations: ['products'],
    });
    if (!catalog) throw new NotFoundException('Catalog not found');
    return catalog;
  }

  async findByUserId(user_id: number) {
    return this.catalogsRepository.find({
      where: { user_id, is_active: true },
      relations: ['products'],
      order: { created_at: 'DESC' },
    });
  }

  async update(id: number, user_id: number, updateCatalogDto: UpdateCatalogDto) {
    const catalog = await this.findOne(id, user_id);
    this.catalogsRepository.merge(catalog, updateCatalogDto);
    return this.catalogsRepository.save(catalog);
  }

  async remove(id: number, user_id: number) {
    const result = await this.catalogsRepository.delete({ id, user_id });
    if (result.affected === 0) throw new NotFoundException('Catalog not found');
    return result;
  }

  async generatePdf(id: number, user_id: number) {
    const catalog = await this.findOne(id, user_id);
    await this.pdfQueue.add('generate', {
      catalogId: catalog.id,
      userId: user_id,
    });
    return { message: 'PDF generation started', catalogId: catalog.id };
  }
}
