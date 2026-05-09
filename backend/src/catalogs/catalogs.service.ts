import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { CreateCatalogDto } from './dto/create-catalog.dto';
import { UpdateCatalogDto } from './dto/update-catalog.dto';
import { Catalog } from './entities/catalog.entity';
import { User, UserRole } from '../users/entities/user.entity';

@Injectable()
export class CatalogsService {
  constructor(
    @InjectRepository(Catalog)
    private catalogsRepository: Repository<Catalog>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectQueue('pdf-generation') private pdfQueue: Queue,
  ) { }

  async create(user_id: number, createCatalogDto: CreateCatalogDto) {
    const user = await this.usersRepository.findOneBy({ id: user_id });
    const isAdmin = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.GROUP_ADMIN;
    const hasUnlimitedCatalogs = user?.feature_config?.unlimited_catalogs === true;

    if (!isAdmin && !hasUnlimitedCatalogs) {
      const existingCount = await this.catalogsRepository.count({ where: { user_id } });
      if (existingCount >= 1) {
        throw new ConflictException('ต้องการสร้างเพิ่มกรุณาติดต่อแอดมิน');
      }
    }

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

    const user = await this.usersRepository.findOneBy({ id: catalog.user_id });
    return {
      ...catalog,
      owner_uid: user?.uid || null,
      referral_code: user?.referral_code || null,
    };
  }

  async findOnePublic(id: number) {
    const catalog = await this.catalogsRepository.findOne({
      where: { id, is_active: true },
      relations: ['products'],
    });
    if (!catalog) throw new NotFoundException('Catalog not found');

    const user = await this.usersRepository.findOneBy({ id: catalog.user_id });
    return {
      ...catalog,
      owner_uid: user?.uid || null,
      referral_code: user?.referral_code || null,
    };
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

  async generatePublicPdf(id: number): Promise<{ buffer: Buffer; fileName: string }> {
    const catalog = await this.catalogsRepository.findOne({
      where: { id, is_active: true },
      relations: ['products'],
    });
    if (!catalog) throw new NotFoundException('Catalog not found');

    const sortedProducts = (catalog.products || [])
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id);

    const toInlineImage = async (url?: string): Promise<string> => {
      if (!url) return '';
      try {
        if (/^https?:\/\//i.test(url)) {
          const response = await fetch(url);
          if (!response.ok) return '';
          const buffer = Buffer.from(await response.arrayBuffer());
          const contentType = response.headers.get('content-type') || 'image/jpeg';
          return `data:${contentType};base64,${buffer.toString('base64')}`;
        }

        const normalized = url
          .replace(/^https?:\/\/[^/]+/i, '')
          .replace(/^\/api\/uploads\//, '/uploads/');

        const relPath = normalized.startsWith('/') ? normalized.substring(1) : normalized;
        const fullPath = path.join(process.cwd(), relPath);
        if (!fs.existsSync(fullPath)) return '';
        const imageBuffer = fs.readFileSync(fullPath);
        const ext = path.extname(fullPath).replace('.', '').toLowerCase() || 'png';
        const mimeType = ext === 'jpg' ? 'jpeg' : ext;
        return `data:image/${mimeType};base64,${imageBuffer.toString('base64')}`;
      } catch {
        return '';
      }
    };

    const coverImage = await toInlineImage(sortedProducts[0]?.images_json?.[0]);
    const pagePayloads = await Promise.all(
      sortedProducts.map(async (product, index) => ({
        product,
        index,
        imageSrc: await toInlineImage(product.images_json?.[0]),
      })),
    );

    const pagesHtml = pagePayloads
      .map(({ product, index, imageSrc }) => {
            const rawPrice = Number(product.price ?? 0);
            const priceLabel = Number.isFinite(rawPrice)
              ? `฿${rawPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '';
            return `
          <section class="catalog-page">
            <header class="page-header">
              <h2>${this.escapeHtml(product.name || `หน้า ${index + 1}`)}</h2>
              ${priceLabel ? `<div class="page-price">${this.escapeHtml(priceLabel)}</div>` : ''}
            </header>
            <main class="page-body">
              ${
                imageSrc
                  ? `<img src="${imageSrc}" alt="${this.escapeHtml(product.name || `page ${index + 1}`)}" />`
                  : `<div class="no-image">No image</div>`
              }
            </main>
          </section>
        `;
      })
      .join('');

    const html = `
      <!doctype html>
      <html>
      <head>
        <meta charset="utf-8" />
        <style>
          @page { size: A4; margin: 16mm; }
          * { box-sizing: border-box; }
          body { margin: 0; font-family: Arial, sans-serif; color: #111827; }
          .cover {
            page-break-after: always;
            min-height: 260mm;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            gap: 12px;
            text-align: center;
          }
          .cover h1 { margin: 0; font-size: 34px; }
          .cover p { margin: 0; color: #475569; font-size: 15px; }
          .cover img { max-width: 85%; max-height: 180mm; object-fit: contain; border-radius: 12px; }
          .catalog-page {
            page-break-after: always;
            min-height: 260mm;
            display: flex;
            flex-direction: column;
          }
          .catalog-page:last-child { page-break-after: auto; }
          .page-header h2 { margin: 0 0 10px 0; font-size: 20px; }
          .page-price {
            display: inline-block;
            margin-bottom: 10px;
            padding: 6px 12px;
            border-radius: 999px;
            background: #050579;
            color: #ffffff;
            font-size: 14px;
            font-weight: 700;
          }
          .page-body {
            flex: 1;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            padding: 10px;
          }
          .page-body img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
          .no-image { color: #94a3b8; font-size: 14px; }
        </style>
      </head>
      <body>
        <section class="cover">
          <h1>${this.escapeHtml(catalog.title || 'Catalog')}</h1>
          <p>${this.escapeHtml(catalog.description || '')}</p>
          ${coverImage ? `<img src="${coverImage}" alt="cover" />` : ''}
        </section>
        ${pagesHtml}
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
      });
      const fileName = `${(catalog.title || 'catalog').replace(/[^\w\u0E00-\u0E7F-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'catalog'}.pdf`;
      return { buffer: Buffer.from(pdf), fileName };
    } finally {
      await browser.close();
    }
  }

  private escapeHtml(value: string): string {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
