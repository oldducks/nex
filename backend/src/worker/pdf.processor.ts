import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Catalog } from '../catalogs/entities/catalog.entity';

@Processor('pdf-generation')
export class PdfProcessor extends WorkerHost {
  constructor(
    @InjectRepository(Catalog)
    private catalogsRepository: Repository<Catalog>,
  ) {
    super();
    console.log('PdfProcessor initialized independently');
  }

  async process(job: Job<{ catalogId: number; userId: number }>) {
    console.log(`[PdfProcessor] Received job ${job.id} name: ${job.name}`);
    const { catalogId, userId } = job.data;
    console.log(`Processing PDF for catalog ${catalogId}...`);

    try {
      // 1. Fetch Catalog Data
      const catalog = await this.catalogsRepository.findOne({
        where: { id: catalogId, user_id: userId },
        relations: ['products'],
      });

      if (!catalog) throw new Error('Catalog not found');

      // 2. Generate HTML (Simple Template)
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #333; text-align: center; }
            .product { border-bottom: 1px solid #ddd; padding: 20px 0; display: flex; gap: 20px; }
            .product img { width: 100px; height: 100px; object-fit: cover; border-radius: 8px; }
            .details { flex-grow: 1; }
            .price { font-weight: bold; color: #007bff; font-size: 1.2em; }
          </style>
        </head>
        <body>
          <h1>${catalog.title}</h1>
          <p>${catalog.description || ''}</p>
          <hr/>
          ${catalog.products.map(p => `
            <div class="product">
              ${p.images_json?.[0] ? `<img src="${p.images_json[0]}" />` : ''}
              <div class="details">
                <h3>${p.name}</h3>
                <p>${p.description || ''}</p>
                <div class="price">฿${p.price}</div>
              </div>
            </div>
          `).join('')}
        </body>
        </html>
      `;

      // 3. Launch Puppeteer
      const browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent);

      const fileName = `catalog_${catalogId}_${Date.now()}.pdf`;
      const uploadDir = path.join(process.cwd(), 'uploads');
      const filePath = path.join(uploadDir, fileName);

      // Ensure directory exists
      if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

      await page.pdf({ path: filePath, format: 'A4' });
      await browser.close();

      // 4. Update Database
      // In production, upload to S3 here. For now, use local path served by static file middleware or nginx
      catalog.pdf_url = `/uploads/${fileName}`;
      await this.catalogsRepository.save(catalog);

      console.log(`PDF Generated: ${filePath}`);
      return { success: true, path: filePath };
    } catch (error) {
      console.error('PDF Generation Failed:', error);
      throw error;
    }
  }
}
