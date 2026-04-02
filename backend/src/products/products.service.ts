import { BadRequestException, Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { CatalogsService } from '../catalogs/catalogs.service';
import { extname, join } from 'path';
import { promises as fsp } from 'fs';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductsService {
  private readonly maxImageDownloadBytes = 10 * 1024 * 1024; // 10MB per image
  private readonly imageDownloadTimeoutMs = 15000;

  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private catalogsService: CatalogsService,
  ) { }

  async create(user_id: number, createProductDto: CreateProductDto) {
    // Verify catalog belongs to user
    await this.catalogsService.findOne(createProductDto.catalog_id, user_id);

    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async findAll(catalog_id: number, user_id: number) {
    // Verify catalog ownership
    await this.catalogsService.findOne(catalog_id, user_id);

    return this.productsRepository.find({
      where: { catalog_id },
      order: { order: 'ASC', id: 'DESC' },
    });
  }

  async findOne(id: number, user_id: number) {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['catalog'],
    });

    if (!product) throw new NotFoundException('Product not found');
    if (product.catalog.user_id !== user_id) throw new ForbiddenException('Access denied');

    return product;
  }

  async update(id: number, user_id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id, user_id);
    this.productsRepository.merge(product, updateProductDto);
    return this.productsRepository.save(product);
  }

  async remove(id: number, user_id: number) {
    const product = await this.findOne(id, user_id);
    return this.productsRepository.remove(product);
  }

  async importCsv(user_id: number, catalog_id: number, file: Express.Multer.File) {
    await this.catalogsService.findOne(catalog_id, user_id);

    const originalName = file.originalname?.toLowerCase() || '';
    const mimeType = file.mimetype?.toLowerCase() || '';
    const isCsv =
      originalName.endsWith('.csv') ||
      mimeType.includes('csv') ||
      mimeType === 'application/vnd.ms-excel';

    if (!isCsv) {
      throw new BadRequestException('Only CSV files are allowed');
    }

    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('CSV file is empty');
    }

    const content = file.buffer.toString('utf8').replace(/^\uFEFF/, '').trim();
    if (!content) {
      throw new BadRequestException('CSV file is empty');
    }

    const rows = this.parseCsv(content);
    if (rows.length === 0) {
      throw new BadRequestException('CSV file has no rows');
    }

    const hasNameColumn = ['name', 'product_name', 'data']
      .some((column) => Object.prototype.hasOwnProperty.call(rows[0], column));
    if (!hasNameColumn) {
      throw new BadRequestException('CSV must include one of "name", "product_name", or "data" columns');
    }

    const productsToCreate: Product[] = [];
    let skipped = 0;

    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const rawName = this.pick(row, ['name', 'product_name', 'data']).trim();
      const name = rawName.slice(0, 100).trim();
      if (!name) {
        skipped += 1;
        continue;
      }

      const rawBrand = this.pick(row, ['brand', 'product_brand', 'manufacturer']).trim();
      const brand = rawBrand ? rawBrand.slice(0, 100) : '';

      const primaryImage = this.pick(row, ['image', 'image_url', 'image1']).trim();
      const image2 = this.pick(row, ['image2']).trim();
      const image3 = this.pick(row, ['image3']).trim();
      const image4 = this.pick(row, ['image4']).trim();
      const image5 = this.pick(row, ['image5']).trim();
      const sourceImages = [primaryImage, image2, image3, image4, image5].filter(Boolean);
      const images = await this.downloadAndStoreImages(sourceImages, catalog_id);

      const rawDescription = this.pick(row, ['description', 'desc', 'data']).trim();
      const description = rawDescription ? rawDescription.slice(0, 255) : '';
      const priceRaw = this.pick(row, ['price', 'product_price']).trim();
      const parsedPrice = this.parseNumber(priceRaw);
      const website = this.pick(row, ['web_scraper_start_url', 'website']).trim();
      const orderForm = this.pick(row, ['order_form', 'order_url']).trim();
      const facebook = this.pick(row, ['facebook', 'facebook_url']).trim();
      const orderRaw = this.pick(row, ['web_scraper_order', 'order', 'sort_order']).trim();

      const interactiveLinks: Record<string, string> = {};
      if (website) interactiveLinks.website = website;
      if (orderForm) interactiveLinks.order_form = orderForm;
      if (facebook) interactiveLinks.facebook = facebook;

      const product = this.productsRepository.create({
        catalog_id,
        name,
        brand: brand || undefined,
        description: description || undefined,
        price: parsedPrice ?? 0,
        images_json: images,
        order: this.parseOrderValue(orderRaw, index + 1),
        interactive_links: Object.keys(interactiveLinks).length > 0 ? interactiveLinks : undefined,
      });

      productsToCreate.push(product);
    }

    if (productsToCreate.length === 0) {
      throw new BadRequestException('No valid rows to import');
    }

    const saved = await this.productsRepository.save(productsToCreate);
    return {
      imported: saved.length,
      skipped,
      totalRows: rows.length,
    };
  }

  private parseCsv(content: string): Array<Record<string, string>> {
    const matrix: string[][] = [];
    let row: string[] = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < content.length; i += 1) {
      const char = content[i];

      if (char === '"') {
        if (inQuotes && content[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }

      if (char === ',' && !inQuotes) {
        row.push(field);
        field = '';
        continue;
      }

      if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && content[i + 1] === '\n') {
          i += 1;
        }
        row.push(field);
        field = '';
        const hasValue = row.some((value) => value.trim() !== '');
        if (hasValue) {
          matrix.push(row);
        }
        row = [];
        continue;
      }

      field += char;
    }

    if (field !== '' || row.length > 0) {
      row.push(field);
      const hasValue = row.some((value) => value.trim() !== '');
      if (hasValue) {
        matrix.push(row);
      }
    }

    if (matrix.length === 0) {
      return [];
    }

    const headers = matrix[0].map((header) => header.trim().toLowerCase());
    const rows = matrix.slice(1);

    return rows.map((values) => {
      const record: Record<string, string> = {};
      headers.forEach((header, index) => {
        record[header] = (values[index] ?? '').trim();
      });
      return record;
    });
  }

  private pick(row: Record<string, string>, keys: string[]): string {
    for (const key of keys) {
      const value = row[key];
      if (value !== undefined && value !== null) {
        return value;
      }
    }
    return '';
  }

  private parseNumber(value: string): number | undefined {
    if (!value) return undefined;
    const normalized = value.replace(/,/g, '').trim();
    if (!normalized) return undefined;

    // Supports values like "฿34,990", "33900", or "฿33,900 - ฿41,900" (uses first numeric value).
    const numericMatch = normalized.match(/-?\d+(?:\.\d+)?/);
    if (!numericMatch) return undefined;

    const parsed = Number(numericMatch[0]);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private parseOrderValue(raw: string, fallback: number): number {
    if (!raw) return fallback;

    const direct = Number(raw.trim());
    if (Number.isInteger(direct)) return direct;

    const match = raw.match(/(\d+)(?!.*\d)/);
    if (!match) return fallback;

    const parsed = Number(match[1]);
    return Number.isInteger(parsed) ? parsed : fallback;
  }

  private async downloadAndStoreImages(urls: string[], catalogId: number): Promise<string[]> {
    const results: string[] = [];
    for (const url of urls) {
      if (!url) continue;
      const localPath = await this.downloadAndStoreImage(url, catalogId);
      results.push(localPath);
    }
    return results;
  }

  private async downloadAndStoreImage(url: string, catalogId: number): Promise<string> {
    if (url.startsWith('/uploads/')) return url;

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return url;
    }

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return url;
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.imageDownloadTimeoutMs);
      let response: Response;
      try {
        response = await fetch(parsedUrl.toString(), {
          redirect: 'follow',
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        return url;
      }

      const contentLengthHeader = response.headers.get('content-length');
      const contentLength = contentLengthHeader ? Number(contentLengthHeader) : 0;
      if (Number.isFinite(contentLength) && contentLength > this.maxImageDownloadBytes) {
        return url;
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      if (buffer.length === 0 || buffer.length > this.maxImageDownloadBytes) {
        return url;
      }

      const extension = this.resolveImageExtension(parsedUrl.pathname, response.headers.get('content-type'));
      const folder = join(process.cwd(), 'uploads', 'imported', `catalog-${catalogId}`);
      await fsp.mkdir(folder, { recursive: true });

      const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;
      const filePath = join(folder, filename);
      await fsp.writeFile(filePath, buffer);

      return `/uploads/imported/catalog-${catalogId}/${filename}`;
    } catch {
      return url;
    }
  }

  private resolveImageExtension(pathname: string, contentTypeRaw: string | null): string {
    const fromPath = extname(pathname).toLowerCase();
    if (this.isAllowedImageExtension(fromPath)) {
      return fromPath;
    }

    const contentType = (contentTypeRaw || '').split(';')[0].trim().toLowerCase();
    switch (contentType) {
      case 'image/jpeg':
        return '.jpg';
      case 'image/png':
        return '.png';
      case 'image/webp':
        return '.webp';
      case 'image/gif':
        return '.gif';
      case 'image/avif':
        return '.avif';
      case 'image/bmp':
        return '.bmp';
      default:
        return '.jpg';
    }
  }

  private isAllowedImageExtension(extension: string): boolean {
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif', '.bmp'].includes(extension);
  }
}
