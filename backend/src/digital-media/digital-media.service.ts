import { BadRequestException, Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { createHash } from 'crypto';
import { existsSync, mkdirSync } from 'fs';
import { promises as fsPromises } from 'fs';
import { join } from 'path';
import sharp from 'sharp';
import { CreateLiteService } from '../create-lite/create-lite.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateTemplateDto } from './dto/create-template.dto';
import { GenerateFromTemplateDto } from './dto/generate-from-template.dto';
import { UpdateTemplateDto } from './dto/update-template.dto';
import { UpsertTemplateFieldDto } from './dto/upsert-template-field.dto';
import { DigitalMediaCategory } from './entities/category.entity';
import { DigitalMediaGenerationJob } from './entities/generation-job.entity';
import { DigitalMediaTemplateField } from './entities/template-field.entity';
import { DigitalMediaTemplate } from './entities/template.entity';
import { buildPromptFromTemplate, validateRequiredFields } from './utils/prompt-template.util';

const digitalMediaUploadPath = join(process.cwd(), 'uploads', 'digital-media');
const COVER_MAX_EDGE = 1600;
const COVER_WEBP_QUALITY = 80;
const COVER_THUMB_MAX_EDGE = 420;
const COVER_THUMB_WEBP_QUALITY = 72;
const PRODUCT_IMAGE_FIELD_KEYS = new Set([
  'product_image',
  'ref_product',
  'product',
  'item_image',
  'product_photo',
  'product_ref',
]);

const REFERENCE_IMAGE_FIELD_KEYS = new Set([
  'reference_image',
  'reference_image_url',
  'ref_image',
  'person_image',
  'face_image',
  'source_image',
]);

const DIGITAL_MEDIA_DAILY_LIMIT = 3;

type RequesterContext = {
  userId?: number | null;
  role?: string | null;
};


@Injectable()
export class DigitalMediaService implements OnModuleInit {
  private readonly logger = new Logger(DigitalMediaService.name);

  constructor(
    @InjectRepository(DigitalMediaCategory)
    private readonly categoryRepository: Repository<DigitalMediaCategory>,
    @InjectRepository(DigitalMediaTemplate)
    private readonly templateRepository: Repository<DigitalMediaTemplate>,
    @InjectRepository(DigitalMediaTemplateField)
    private readonly fieldRepository: Repository<DigitalMediaTemplateField>,
    @InjectRepository(DigitalMediaGenerationJob)
    private readonly jobRepository: Repository<DigitalMediaGenerationJob>,
    private readonly createLiteService: CreateLiteService,
  ) {}

  async onModuleInit() {
    await this.ensureTables();
    await this.seedDefaults();
  }

  async getCategories(activeOnly = true) {
    return this.categoryRepository.find({
      where: activeOnly ? { is_active: true } : {},
      order: { sort_order: 'ASC', id: 'ASC' },
    });
  }

  async getDailyQuotaStatus(requester: RequesterContext) {
    const unlimited = this.isUnlimitedRequester(requester);
    const used = unlimited || !requester.userId ? 0 : await this.getTodayUsageCount(requester.userId);
    return {
      limit: DIGITAL_MEDIA_DAILY_LIMIT,
      used,
      remaining: unlimited ? null : Math.max(0, DIGITAL_MEDIA_DAILY_LIMIT - used),
      unlimited,
    };
  }

  async createCategory(dto: CreateCategoryDto) {
    const name = dto.name?.trim();
    if (!name) {
      throw new BadRequestException('กรุณากรอกชื่อหมวดหมู่');
    }

    const existingByName = await this.categoryRepository
      .createQueryBuilder('category')
      .where('LOWER(category.name) = :name', { name: name.toLowerCase() })
      .getOne();

    if (existingByName) {
      return existingByName;
    }

    const slug = await this.generateAvailableCategorySlug(dto.slug || name);
    const sortOrder = dto.sort_order ?? (await this.getNextCategorySortOrder());

    const created = await this.categoryRepository.save(
      this.categoryRepository.create({
        name,
        slug,
        sort_order: sortOrder,
        is_active: dto.is_active ?? true,
      }),
    );

    return created;
  }

  async listPublicTemplates(
    query: { category?: string; search?: string; media_type?: 'image' | 'video' },
    options?: { includeDetails?: boolean },
  ) {
    const includeDetails = options?.includeDetails === true;
    const qb = this.templateRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.category', 'category')
      .where('template.status = :status', { status: 'active' })
      .orderBy('template.sort_order', 'ASC')
      .addOrderBy('template.id', 'ASC');

    if (!includeDetails) {
      // Keep list payload lightweight for library page: no heavy prompt/fields columns.
      qb.select([
        'template.id',
        'template.name',
        'template.slug',
        'template.description',
        'template.cover_image_url',
        'template.media_type',
        'template.preview_video_url',
        'template.aspect_ratio',
        'template.status',
        'template.sort_order',
        'category.id',
        'category.name',
        'category.slug',
      ]);
    } else {
      qb.leftJoinAndSelect('template.fields', 'fields')
        .addOrderBy('fields.sort_order', 'ASC')
        .addOrderBy('fields.id', 'ASC');
    }

    if (query.category) {
      qb.andWhere('category.slug = :category', { category: query.category });
    }

    if (query.media_type && ['image', 'video'].includes(query.media_type)) {
      qb.andWhere('template.media_type = :media_type', { media_type: query.media_type });
    }

    if (query.search?.trim()) {
      qb.andWhere('(LOWER(template.name) LIKE :q OR LOWER(template.description) LIKE :q)', {
        q: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    const templates = await qb.getMany();
    if (includeDetails) {
      return templates.map((template) => this.toPublicTemplate(template));
    }

    const summarized = await Promise.all(
      templates.map((template) => this.toPublicTemplateSummaryAsync(template)),
    );
    return summarized;
  }

  async getPublicTemplateBySlug(slug: string) {
    const template = await this.templateRepository.findOne({
      where: { slug, status: 'active' },
      relations: ['fields', 'category'],
      order: { fields: { sort_order: 'ASC', id: 'ASC' } },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return this.toPublicTemplate(template);
  }

  async listAdminTemplates(query: { category_id?: number; search?: string; media_type?: 'image' | 'video' }) {
    const qb = this.templateRepository
      .createQueryBuilder('template')
      .leftJoinAndSelect('template.category', 'category')
      .leftJoinAndSelect('template.fields', 'fields')
      .orderBy('template.sort_order', 'ASC')
      .addOrderBy('template.updated_at', 'DESC')
      .addOrderBy('fields.sort_order', 'ASC')
      .addOrderBy('fields.id', 'ASC');

    if (query.category_id) {
      qb.andWhere('template.category_id = :category_id', { category_id: query.category_id });
    }

    if (query.media_type && ['image', 'video'].includes(query.media_type)) {
      qb.andWhere('template.media_type = :media_type', { media_type: query.media_type });
    }

    if (query.search?.trim()) {
      qb.andWhere('(LOWER(template.name) LIKE :q OR LOWER(template.slug) LIKE :q)', {
        q: `%${query.search.trim().toLowerCase()}%`,
      });
    }

    return qb.getMany();
  }

  async getAdminTemplateById(id: number) {
    const template = await this.templateRepository.findOne({
      where: { id },
      relations: ['fields', 'category'],
      order: { fields: { sort_order: 'ASC', id: 'ASC' } },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    return template;
  }

  async createTemplate(dto: CreateTemplateDto) {
    const slug = await this.generateAvailableSlug(dto.slug || dto.name);
    const categoryId = await this.resolveCategoryId(dto);

    const created = await this.templateRepository.save(
      this.templateRepository.create({
        name: dto.name.trim(),
        slug,
        category_id: categoryId,
        description: dto.description?.trim() || '',
        cover_image_url: dto.cover_image_url?.trim() || '',
        media_type: dto.media_type || 'image',
        preview_video_url: dto.preview_video_url?.trim() || '',
        enable_product_replace: Boolean(dto.enable_product_replace),
        product_mask_url: dto.product_mask_url?.trim() || '',
        prompt_template: dto.prompt_template,
        negative_prompt: dto.negative_prompt?.trim() || '',
        style_preset: dto.style_preset?.trim() || 'standard',
        aspect_ratio: dto.aspect_ratio || '1:1',
        status: dto.status || 'draft',
        sort_order: dto.sort_order || 0,
      }),
    );

    if (dto.fields?.length) {
      await this.replaceTemplateFields(created.id, dto.fields);
    }

    return this.getAdminTemplateById(created.id);
  }

  async updateTemplate(id: number, dto: UpdateTemplateDto) {
    const template = await this.getAdminTemplateById(id);

    if (dto.slug && dto.slug !== template.slug) {
      await this.ensureSlugAvailable(dto.slug, id);
    }

    const categoryId =
      dto.category_id !== undefined || dto.category_name !== undefined
        ? await this.resolveCategoryId(dto)
        : template.category_id;

    // Avoid spreading relation-loaded entity (e.g. `category`) back into save payload,
    // because relation objects can override scalar foreign keys like `category_id`.
    await this.templateRepository.save({
      id: template.id,
      name: dto.name !== undefined ? dto.name.trim() : template.name,
      slug: dto.slug !== undefined ? dto.slug.trim() : template.slug,
      category_id: categoryId,
      description: dto.description !== undefined ? dto.description.trim() : template.description,
      cover_image_url: dto.cover_image_url !== undefined ? dto.cover_image_url.trim() : template.cover_image_url,
      media_type: dto.media_type !== undefined ? dto.media_type : template.media_type,
      preview_video_url: dto.preview_video_url !== undefined ? dto.preview_video_url.trim() : template.preview_video_url,
      enable_product_replace:
        dto.enable_product_replace !== undefined ? Boolean(dto.enable_product_replace) : template.enable_product_replace,
      product_mask_url: dto.product_mask_url !== undefined ? dto.product_mask_url.trim() : template.product_mask_url,
      prompt_template: dto.prompt_template !== undefined ? dto.prompt_template : template.prompt_template,
      negative_prompt: dto.negative_prompt !== undefined ? dto.negative_prompt.trim() : template.negative_prompt,
      style_preset: dto.style_preset !== undefined ? dto.style_preset.trim() : template.style_preset,
      aspect_ratio: dto.aspect_ratio !== undefined ? dto.aspect_ratio : template.aspect_ratio,
      status: dto.status !== undefined ? dto.status : template.status,
      sort_order: dto.sort_order !== undefined ? dto.sort_order : template.sort_order,
    });

    if (dto.fields) {
      await this.replaceTemplateFields(id, dto.fields);
    }

    return this.getAdminTemplateById(id);
  }

  async removeTemplate(id: number) {
    await this.getAdminTemplateById(id);
    await this.templateRepository.delete({ id });
    return { success: true };
  }

  async toggleTemplate(id: number) {
    const template = await this.getAdminTemplateById(id);
    const nextStatus = template.status === 'active' ? 'inactive' : 'active';
    await this.templateRepository.update({ id }, { status: nextStatus });
    return this.getAdminTemplateById(id);
  }

  async addTemplateField(templateId: number, dto: UpsertTemplateFieldDto) {
    await this.getAdminTemplateById(templateId);

    const field = this.fieldRepository.create({
      template_id: templateId,
      field_key: dto.field_key.trim(),
      field_label: dto.field_label.trim(),
      field_type: dto.field_type,
      placeholder: dto.placeholder?.trim() || '',
      help_text: dto.help_text?.trim() || '',
      is_required: Boolean(dto.is_required),
      default_value: dto.default_value?.trim() || '',
      options_json: this.normalizeOptions(dto.options_json),
      sort_order: dto.sort_order || 0,
    });

    await this.fieldRepository.save(field);
    return this.getAdminTemplateById(templateId);
  }

  async updateTemplateField(fieldId: number, dto: UpsertTemplateFieldDto) {
    const field = await this.fieldRepository.findOne({ where: { id: fieldId } });
    if (!field) throw new NotFoundException('Field not found');

    await this.fieldRepository.save({
      ...field,
      field_key: dto.field_key !== undefined ? dto.field_key.trim() : field.field_key,
      field_label: dto.field_label !== undefined ? dto.field_label.trim() : field.field_label,
      field_type: dto.field_type !== undefined ? dto.field_type : field.field_type,
      placeholder: dto.placeholder !== undefined ? dto.placeholder.trim() : field.placeholder,
      help_text: dto.help_text !== undefined ? dto.help_text.trim() : field.help_text,
      is_required: dto.is_required !== undefined ? Boolean(dto.is_required) : field.is_required,
      default_value: dto.default_value !== undefined ? dto.default_value.trim() : field.default_value,
      options_json: dto.options_json !== undefined ? this.normalizeOptions(dto.options_json) : field.options_json,
      sort_order: dto.sort_order !== undefined ? dto.sort_order : field.sort_order,
    });

    return this.getAdminTemplateById(field.template_id);
  }

  async removeTemplateField(fieldId: number) {
    const field = await this.fieldRepository.findOne({ where: { id: fieldId } });
    if (!field) throw new NotFoundException('Field not found');

    await this.fieldRepository.delete({ id: fieldId });
    return this.getAdminTemplateById(field.template_id);
  }


  async generateFromTemplate(dto: GenerateFromTemplateDto, requester: RequesterContext = {}) {
    await this.assertWithinDailyQuota(requester);
    const { job, template, finalPrompt, finalNegativePrompt, aspectRatio } = await this.createGenerationJob(dto, requester.userId);

    try {
      const generated = await this.runGenerationJob(job.id, template, dto, finalPrompt, aspectRatio);
      const mediaType = (template.media_type || 'image') as 'image' | 'video';
      return {
        job_id: job.id,
        status: 'success',
        media_type: mediaType,
        output_image_url: mediaType === 'image' ? generated.output_image_url : '',
        output_video_url: mediaType === 'video' ? generated.output_video_url : '',
        final_prompt: finalPrompt,
        final_negative_prompt: finalNegativePrompt,
        aspect_ratio: aspectRatio,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'generate failed';
      throw new BadRequestException(message);
    }
  }

  async startGenerateFromTemplate(dto: GenerateFromTemplateDto, requester: RequesterContext = {}) {
    await this.assertWithinDailyQuota(requester);
    const { job, template, finalPrompt, finalNegativePrompt, aspectRatio } = await this.createGenerationJob(dto, requester.userId);

    void this.runGenerationJob(job.id, template, dto, finalPrompt, aspectRatio).catch((error) => {
      this.logger.error(
        `digital media async generation failed (job ${job.id}): ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    });

    return {
      job_id: job.id,
      status: 'pending',
      media_type: (template.media_type || 'image') as 'image' | 'video',
      final_prompt: finalPrompt,
      final_negative_prompt: finalNegativePrompt,
      aspect_ratio: aspectRatio,
      message: 'queued',
    };
  }

  async getGenerationJob(jobId: number) {
    const job = await this.jobRepository.findOne({ where: { id: jobId } });
    if (!job) {
      throw new NotFoundException('Generation job not found');
    }

    return {
      job_id: job.id,
      status: job.status,
      output_image_url: job.output_image_url || '',
      output_video_url: job.output_video_url || '',
      error_message: job.error_message || '',
      final_prompt: job.final_prompt,
      final_negative_prompt: job.final_negative_prompt,
      aspect_ratio: job.aspect_ratio,
      created_at: job.created_at,
      updated_at: job.updated_at,
    };
  }

  async generateMockupPreview(dto: CreateTemplateDto) {
    const fields = (dto.fields || []).map((field, index) => ({
      ...field,
      field_key: this.normalizeFieldKey(field.field_key),
      field_label: field.field_label?.trim() || field.field_key,
      sort_order: field.sort_order ?? index + 1,
      default_value: field.default_value?.trim() || '',
      placeholder: field.placeholder?.trim() || '',
      help_text: field.help_text?.trim() || '',
      options_json: this.normalizeOptions(field.options_json),
    }));

    if (!dto.name?.trim()) {
      throw new BadRequestException('กรุณากรอกชื่อ template ก่อนสร้าง mockup');
    }

    if (!dto.prompt_template?.trim()) {
      throw new BadRequestException('กรุณากรอก prompt template ก่อนสร้าง mockup');
    }

    const mockupInput = this.buildMockupInput({
      name: dto.name.trim(),
      description: dto.description?.trim() || '',
      aspect_ratio: dto.aspect_ratio || '1:1',
      category_name: dto.category_name?.trim()
        ? dto.category_name.trim()
        : dto.category_id
          ? (await this.categoryRepository.findOne({ where: { id: dto.category_id } }))?.name || ''
          : '',
      fields,
    });

    const finalPrompt = buildPromptFromTemplate(dto.prompt_template, mockupInput, fields as any);
    const generated = await this.createLiteService.generateImageFromPrompt({
      prompt: finalPrompt,
      templateId: this.slugify(dto.name) || 'template-mockup',
      ratio: (dto.aspect_ratio || '1:1') as '1:1' | '4:5' | '9:16',
    });

    return {
      output_image_url: generated.imageDataUrl,
      final_prompt: finalPrompt,
      mockup_input: mockupInput,
    };
  }


  async generateVideoDirect(input: {
    reference_image_url: string;
    prompt: string;
    aspect_ratio?: '9:16' | '16:9';
  }, requester: RequesterContext = {}) {
    await this.assertWithinDailyQuota(requester);
    const normalized = this.normalizeDirectVideoInput(input);
    const result = await this.generateDirectVideoOutput(normalized);

    return {
      status: 'success',
      output_video_url: result.output_video_url,
      aspect_ratio: normalized.aspect_ratio,
      duration_seconds: 8,
      model: result.model,
    };
  }

  async startGenerateVideoDirect(input: {
    reference_image_url: string;
    prompt: string;
    aspect_ratio?: '9:16' | '16:9';
  }, requester: RequesterContext = {}) {
    await this.assertWithinDailyQuota(requester);
    const normalized = this.normalizeDirectVideoInput(input);
    const directVideoTemplateId = await this.getDirectVideoJobTemplateId();
    const job = await this.jobRepository.save(
      this.jobRepository.create({
        user_id: requester.userId || null,
        template_id: directVideoTemplateId,
        user_input_json: {
          reference_image_url: normalized.reference_image_url,
          prompt: normalized.prompt,
        },
        final_prompt: normalized.prompt,
        final_negative_prompt: '',
        aspect_ratio: normalized.aspect_ratio,
        status: 'pending',
        output_image_url: '',
        output_video_url: '',
        error_message: '',
      }),
    );

    void this.runDirectVideoJob(job.id, normalized).catch((error) => {
      this.logger.error(
        `digital media async direct video failed (job ${job.id}): ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    });

    return {
      job_id: job.id,
      status: 'pending',
      media_type: 'video' as const,
      aspect_ratio: normalized.aspect_ratio,
      final_prompt: normalized.prompt,
      message: 'queued',
    };
  }

  async startGenerateImageDirect(input: {
    prompt: string;
    reference_image_urls?: string[];
    aspect_ratio?: '1:1' | '4:5' | '9:16' | '16:9';
  }, requester: RequesterContext = {}) {
    await this.assertWithinDailyQuota(requester);
    const normalized = this.normalizeDirectImageInput(input);
    const directImageTemplateId = await this.getDirectVideoJobTemplateId();
    const job = await this.jobRepository.save(
      this.jobRepository.create({
        user_id: requester.userId || null,
        template_id: directImageTemplateId,
        user_input_json: {
          prompt: normalized.prompt,
          reference_image_urls: normalized.reference_image_urls,
        },
        final_prompt: normalized.prompt,
        final_negative_prompt: '',
        aspect_ratio: normalized.aspect_ratio,
        status: 'pending',
        output_image_url: '',
        output_video_url: '',
        error_message: '',
      }),
    );

    void this.runDirectImageJob(job.id, normalized).catch((error) => {
      this.logger.error(
        `digital media async direct image failed (job ${job.id}): ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    });

    return {
      job_id: job.id,
      status: 'pending',
      media_type: 'image' as const,
      aspect_ratio: normalized.aspect_ratio,
      final_prompt: normalized.prompt,
      message: 'queued',
    };
  }

  private async getDirectVideoJobTemplateId(): Promise<number> {
    const template = await this.templateRepository.findOne({
      where: {},
      order: { id: 'ASC' },
      select: { id: true },
    });

    if (!template?.id) {
      throw new BadRequestException('ยังไม่มี template ในระบบสำหรับอ้างอิงการสร้าง video job');
    }

    return template.id;
  }

  private normalizeDirectVideoInput(input: {
    reference_image_url: string;
    prompt: string;
    aspect_ratio?: '9:16' | '16:9';
  }): {
    reference_image_url: string;
    prompt: string;
    aspect_ratio: '9:16' | '16:9';
  } {
    const reference_image_url = String(input.reference_image_url || '').trim();
    const prompt = String(input.prompt || '').trim();
    const aspect_ratio = input.aspect_ratio === '16:9' ? '16:9' : '9:16';

    if (!reference_image_url) {
      throw new BadRequestException('กรุณาอัปโหลดรูปอ้างอิงก่อนสร้างวิดีโอ');
    }
    if (!prompt) {
      throw new BadRequestException('กรุณากรอกบทพูดหรือ Prompt ก่อนสร้างวิดีโอ');
    }

    return {
      reference_image_url,
      prompt,
      aspect_ratio,
    };
  }

  private normalizeDirectImageInput(input: {
    prompt: string;
    reference_image_urls?: string[];
    aspect_ratio?: '1:1' | '4:5' | '9:16' | '16:9';
  }): {
    prompt: string;
    reference_image_urls: string[];
    aspect_ratio: '1:1' | '4:5' | '9:16' | '16:9';
  } {
    const prompt = String(input.prompt || '').trim();
    const reference_image_urls = Array.isArray(input.reference_image_urls)
      ? input.reference_image_urls
          .map((value) => String(value || '').trim())
          .filter(Boolean)
          .slice(0, 6)
      : [];
    const aspect_ratio = input.aspect_ratio === '4:5' || input.aspect_ratio === '9:16' || input.aspect_ratio === '16:9'
      ? input.aspect_ratio
      : '1:1';

    if (!prompt) {
      throw new BadRequestException('กรุณากรอก prompt');
    }

    return {
      prompt,
      reference_image_urls,
      aspect_ratio,
    };
  }

  private async generateDirectVideoOutput(input: {
    reference_image_url: string;
    prompt: string;
    aspect_ratio: '9:16' | '16:9';
  }) {
    const generated = await this.createLiteService.generateVideoFromReferenceImage({
      prompt: input.prompt,
      ratio: input.aspect_ratio,
      referenceImageUrl: input.reference_image_url,
      durationSeconds: 8,
    });

    const output_video_url = await this.persistGeneratedVideoBase64(generated.videoBase64, generated.mimeType);

    return {
      output_video_url,
      model: generated.model,
    };
  }

  private async runDirectVideoJob(
    jobId: number,
    input: {
      reference_image_url: string;
      prompt: string;
      aspect_ratio: '9:16' | '16:9';
    },
  ) {
    try {
      const result = await this.generateDirectVideoOutput(input);
      await this.jobRepository.update(
        { id: jobId },
        {
          status: 'success',
          output_image_url: '',
          output_video_url: result.output_video_url,
          error_message: '',
        },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'generate failed';
      await this.jobRepository.update(
        { id: jobId },
        {
          status: 'failed',
          output_image_url: '',
          output_video_url: '',
          error_message: message,
        },
      );
      throw error;
    }
  }

  private async runDirectImageJob(
    jobId: number,
    input: {
      prompt: string;
      reference_image_urls: string[];
      aspect_ratio: '1:1' | '4:5' | '9:16' | '16:9';
    },
  ) {
    try {
      const result = await this.createLiteService.generateImageFromDirectPrompt({
        prompt: input.prompt,
        ratio: input.aspect_ratio,
        referenceImageUrls: input.reference_image_urls,
      });

      await this.jobRepository.update(
        { id: jobId },
        {
          status: 'success',
          output_image_url: result.imageDataUrl,
          output_video_url: '',
          error_message: '',
        },
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'generate failed';
      await this.jobRepository.update(
        { id: jobId },
        {
          status: 'failed',
          output_image_url: '',
          output_video_url: '',
          error_message: message,
        },
      );
      throw error;
    }
  }

  private async createGenerationJob(dto: GenerateFromTemplateDto, userId?: number | null) {
    const template = await this.templateRepository.findOne({
      where: { slug: dto.template_slug, status: 'active' },
      relations: ['fields'],
      order: { fields: { sort_order: 'ASC', id: 'ASC' } },
    });

    if (!template) {
      throw new NotFoundException('Template not found');
    }

    const mediaType = (template.media_type || 'image') as 'image' | 'video';
    const input = dto.input || {};

    let finalPrompt = dto.prompt_override?.trim()
      ? dto.prompt_override.trim()
      : buildPromptFromTemplate(template.prompt_template, input, template.fields || []);

    if (mediaType === 'video') {
      const promptCandidates = [
        input.video_prompt,
        input.prompt,
        input.script,
        input.speech_script,
      ];
      const promptFromInput = promptCandidates.find((value) => typeof value === 'string' && value.trim()) as
        | string
        | undefined;
      if (promptFromInput?.trim()) {
        finalPrompt = promptFromInput.trim();
      }
    }

    const finalNegativePrompt = template.negative_prompt || '';

    const aspectRatio =
      mediaType === 'video'
        ? dto.aspect_ratio === '16:9' || dto.aspect_ratio === '9:16'
          ? dto.aspect_ratio
          : template.aspect_ratio === '16:9' || template.aspect_ratio === '9:16'
            ? template.aspect_ratio
            : '9:16'
        : dto.aspect_ratio || template.aspect_ratio || '1:1';

    if (mediaType === 'image') {
      const missingRequired = validateRequiredFields(input, template.fields || []);
      if (missingRequired.length > 0) {
        throw new BadRequestException(`กรอกข้อมูลไม่ครบ: ${missingRequired.join(', ')}`);
      }
    } else {
      const referenceImageUrl = this.extractVideoReferenceImageUrl(input, template.fields || []);
      if (!referenceImageUrl) {
        throw new BadRequestException('กรุณาอัปโหลดรูปอ้างอิงก่อนสร้างวิดีโอ');
      }
      if (!finalPrompt?.trim()) {
        throw new BadRequestException('กรุณากรอกบทพูดหรือ Prompt ก่อนสร้างวิดีโอ');
      }
    }

    const job = await this.jobRepository.save(
      this.jobRepository.create({
        user_id: userId || null,
        template_id: template.id,
        user_input_json: input,
        final_prompt: finalPrompt,
        final_negative_prompt: finalNegativePrompt,
        aspect_ratio: aspectRatio,
        status: 'pending',
      }),
    );

    return {
      job,
      template,
      mediaType,
      finalPrompt,
      finalNegativePrompt,
      aspectRatio,
    };
  }

  private async runGenerationJob(
    jobId: number,
    template: DigitalMediaTemplate,
    dto: GenerateFromTemplateDto,
    finalPrompt: string,
    aspectRatio: string,
  ): Promise<{ output_image_url: string; output_video_url: string }> {
    try {
      const mediaType = (template.media_type || 'image') as 'image' | 'video';

      if (mediaType === 'video') {
        const referenceImageUrl = this.extractVideoReferenceImageUrl(dto.input || {}, template.fields || []);
        if (!referenceImageUrl) {
          throw new BadRequestException('กรุณาอัปโหลดรูปอ้างอิงก่อนสร้างวิดีโอ');
        }

        const generated = await this.createLiteService.generateVideoFromReferenceImage({
          prompt: finalPrompt,
          ratio: aspectRatio === '16:9' ? '16:9' : '9:16',
          referenceImageUrl,
          durationSeconds: 8,
        });

        const outputVideoUrl = await this.persistGeneratedVideoBase64(generated.videoBase64, generated.mimeType);
        await this.jobRepository.update(
          { id: jobId },
          {
            status: 'success',
            output_image_url: '',
            output_video_url: outputVideoUrl,
            error_message: '',
          },
        );

        return {
          output_image_url: '',
          output_video_url: outputVideoUrl,
        };
      }

      const imageFields = (template.fields || []).filter((field) => field.field_type === 'image');
      const preferredProductImage = this.extractProductImageUrl(dto.input || {}, template.fields || []);
      const firstImageValue = imageFields
        .map((field) => (dto.input || {})[field.field_key])
        .find((value) => typeof value === 'string' && value.trim());
      const productImageField = imageFields.find((field) => PRODUCT_IMAGE_FIELD_KEYS.has(this.normalizeFieldKey(field.field_key)));
      const referenceImageField = imageFields.find((field) =>
        REFERENCE_IMAGE_FIELD_KEYS.has(this.normalizeFieldKey(field.field_key)),
      );
      const referenceImageUrl = referenceImageField
        ? (dto.input || {})[referenceImageField.field_key] || (dto.input || {})[this.normalizeFieldKey(referenceImageField.field_key)]
        : '';
      const productImageUrl =
        typeof preferredProductImage === 'string' && preferredProductImage.trim()
          ? preferredProductImage.trim()
          : typeof firstImageValue === 'string'
            ? firstImageValue.trim()
            : '';

      const shouldPreferProductReplace = template.enable_product_replace || Boolean(productImageField);
      const useReplaceProductFlow =
        shouldPreferProductReplace &&
        Boolean(template.cover_image_url?.trim()) &&
        Boolean(productImageUrl);

      const generated = useReplaceProductFlow
        ? await this.createLiteService.generateImageWithProductReplace({
            prompt: finalPrompt,
            ratio: aspectRatio as '1:1' | '4:5' | '9:16',
            baseImageUrl: template.cover_image_url,
            productImageUrl,
            maskImageUrl: template.product_mask_url?.trim() || undefined,
          })
        : typeof referenceImageUrl === 'string' && referenceImageUrl.trim()
          ? await this.createLiteService.generateImageWithReferenceImage({
              prompt: finalPrompt,
              ratio: aspectRatio as '1:1' | '4:5' | '9:16',
              referenceImageUrl: referenceImageUrl.trim(),
            })
          : await this.createLiteService.generateImageFromPrompt({
              prompt: finalPrompt,
              templateId: template.slug,
              ratio: aspectRatio as '1:1' | '4:5' | '9:16',
            });

      await this.jobRepository.update(
        { id: jobId },
        {
          status: 'success',
          output_image_url: generated.imageDataUrl,
          output_video_url: '',
          error_message: '',
        },
      );

      return {
        output_image_url: generated.imageDataUrl,
        output_video_url: '',
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'generate failed';
      await this.jobRepository.update(
        { id: jobId },
        {
          status: 'failed',
          error_message: message,
        },
      );
      throw error instanceof BadRequestException ? error : new BadRequestException(message);
    }
  }

  private extractProductImageUrl(
    input: Record<string, any>,
    fields: DigitalMediaTemplateField[],
  ): string {
    const directCandidates = [
      input.product_image,
      input.ref_product,
      input.product,
      input.item_image,
      input.product_photo,
      input.product_ref,
    ];

    const direct = directCandidates.find((value) => typeof value === 'string' && value.trim());
    if (typeof direct === 'string' && direct.trim()) {
      return direct.trim();
    }

    const imageField = (fields || []).find((field) => {
      if (field.field_type !== 'image') return false;
      return PRODUCT_IMAGE_FIELD_KEYS.has(this.normalizeFieldKey(field.field_key));
    });

    if (!imageField) return '';

    const value = input[imageField.field_key] || input[this.normalizeFieldKey(imageField.field_key)];
    return typeof value === 'string' ? value.trim() : '';
  }

  private extractVideoReferenceImageUrl(
    input: Record<string, any>,
    fields: DigitalMediaTemplateField[],
  ): string {
    const directCandidates = [
      input.reference_image,
      input.reference_image_url,
      input.ref_image,
      input.source_image,
      input.image,
      input.photo,
      input.person_image,
    ];

    const direct = directCandidates.find((value) => typeof value === 'string' && value.trim());
    if (typeof direct === 'string' && direct.trim()) {
      return direct.trim();
    }

    const imageField = (fields || []).find((field) => {
      if (field.field_type !== 'image') return false;
      const key = this.normalizeFieldKey(field.field_key);
      return ['reference_image', 'reference_image_url', 'ref_image', 'person_image', 'source_image'].includes(key);
    });

    if (!imageField) return '';

    const value = input[imageField.field_key] || input[this.normalizeFieldKey(imageField.field_key)];
    return typeof value === 'string' ? value.trim() : '';
  }

  private async persistGeneratedVideoBase64(videoBase64: string, mimeType?: string): Promise<string> {
    const cleaned = String(videoBase64 || '').trim();
    if (!cleaned) {
      throw new BadRequestException('ไม่พบข้อมูลวิดีโอจาก Veo');
    }

    const normalizedMime = (mimeType || 'video/mp4').toLowerCase();
    const extension = normalizedMime.includes('quicktime') ? 'mov' : 'mp4';

    this.ensureDigitalMediaUploadDir();
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 9);
    const filename = `dm-video-${timestamp}-${random}.${extension}`;
    const filePath = join(digitalMediaUploadPath, filename);

    await fsPromises.writeFile(filePath, Buffer.from(cleaned, 'base64'));
    return `/api/uploads/digital-media/${filename}`;
  }
  private normalizeOptions(raw?: Array<{ label: string; value: string }>) {
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((item) => item && typeof item.label === 'string' && typeof item.value === 'string')
      .map((item) => ({ label: item.label.trim(), value: item.value.trim() }))
      .filter((item) => item.label && item.value);
  }

  private normalizeFieldKey(fieldKey: string) {
    return String(fieldKey || '')
      .trim()
      .replace(/^\{+/, '')
      .replace(/\}+$/, '')
      .trim();
  }

  private async ensureSlugAvailable(slug: string, excludeId?: number) {
    const current = await this.templateRepository.findOne({ where: { slug: slug.trim() } });
    if (current && current.id !== excludeId) {
      throw new BadRequestException('slug นี้ถูกใช้งานแล้ว');
    }
  }

  private slugify(input: string) {
    return String(input || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-{2,}/g, '-')
      .slice(0, 180);
  }

  private async generateAvailableSlug(source: string, excludeId?: number) {
    const base = this.slugify(source) || 'template';

    let candidate = base;
    let suffix = 2;

    while (true) {
      const current = await this.templateRepository.findOne({ where: { slug: candidate } });
      if (!current || current.id === excludeId) {
        return candidate;
      }
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
  }

  private async generateAvailableCategorySlug(source: string, excludeId?: number) {
    const rawBase = this.slugify(source);
    const base = rawBase || 'category';

    let candidate = base;
    let suffix = 2;

    while (true) {
      const current = await this.categoryRepository.findOne({ where: { slug: candidate } });
      if (!current || current.id === excludeId) {
        return candidate;
      }
      candidate = `${base}-${suffix}`;
      suffix += 1;
    }
  }

  private async getNextCategorySortOrder() {
    const lastCategory = await this.categoryRepository.find({
      order: { sort_order: 'DESC', id: 'DESC' },
      take: 1,
    });
    return (lastCategory[0]?.sort_order ?? 0) + 1;
  }

  private buildMockupInput(input: {
    name: string;
    description: string;
    aspect_ratio: string;
    category_name: string;
    fields: Array<{
      field_key: string;
      field_label: string;
      field_type: string;
      default_value?: string;
      placeholder?: string;
      options_json?: Array<{ label: string; value: string }>;
    }>;
  }) {
    const brandSeed = input.name.trim() || 'Brand';
    const categorySeed = input.category_name.trim() || 'สินค้า';
    const descriptionSeed = input.description.trim();
    const values: Record<string, string> = {};

    for (const field of input.fields) {
      const key = this.normalizeFieldKey(field.field_key);
      if (!key) continue;

      const normalizedLabel = `${field.field_label || ''} ${field.placeholder || ''}`.toLowerCase();
      let value = field.default_value?.trim() || '';

      if (!value) {
        if (field.field_type === 'image') {
          value = `a premium ${categorySeed} product packshot for ${brandSeed}, clean commercial packaging, realistic hero product`;
        } else if (key === 'brand' || normalizedLabel.includes('แบรนด์')) {
          value = brandSeed;
        } else if (key === 'headline' || normalizedLabel.includes('ข้อความหลัก')) {
          value = `${brandSeed} สดชื่น ดื่มง่ายทุกวัน`;
        } else if (key === 'subheadline' || normalizedLabel.includes('ข้อความรอง')) {
          value = descriptionSeed || `${categorySeed} ที่ดูทันสมัย ดื่มง่าย และเหมาะกับคอนเทนต์โซเชียล`;
        } else if (key === 'price' || normalizedLabel.includes('ราคา')) {
          value = '฿49';
        } else if (key === 'promotion' || normalizedLabel.includes('โปรโมชัน') || normalizedLabel.includes('ส่วนลด')) {
          value = 'ซื้อ 1 แถม 1';
        } else if (key === 'aspect_ratio' || normalizedLabel.includes('อัตราส่วน')) {
          value = input.aspect_ratio;
        } else if (field.field_type === 'select') {
          value = field.options_json?.[0]?.value || input.aspect_ratio;
        } else {
          value = field.placeholder?.trim() || field.field_label?.trim() || '';
        }
      }

      values[key] = value;
    }

    if (!values.brand) values.brand = brandSeed;
    if (!values.headline) values.headline = `${brandSeed} สดชื่นแบบเฮลท์ตี้`;
    if (!values.subheadline) values.subheadline = descriptionSeed || `${categorySeed} สำหรับทำภาพ mockup preview`;
    if (!values.price) values.price = '฿49';
    if (!values.promotion) values.promotion = 'ส่งฟรีวันนี้';
    if (!values.aspect_ratio) values.aspect_ratio = input.aspect_ratio;

    const firstImageField = input.fields.find((field) => field.field_type === 'image');
    if (firstImageField) {
      const imageKey = this.normalizeFieldKey(firstImageField.field_key);
      if (imageKey && !values[imageKey]) {
        values[imageKey] = `a premium ${categorySeed} product packshot for ${brandSeed}, clean commercial packaging, realistic hero product`;
      }
    }

    return values;
  }

  private async ensureCategoryExists(categoryId: number) {
    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
    if (!category) throw new BadRequestException('ไม่พบหมวดหมู่ที่เลือก');
  }

  private async resolveCategoryId(input: { category_id?: number; category_name?: string }) {
    if (input.category_id) {
      await this.ensureCategoryExists(input.category_id);
      return input.category_id;
    }

    const categoryName = input.category_name?.trim();
    if (!categoryName) {
      throw new BadRequestException('กรุณาเลือกหรือสร้างหมวดหมู่');
    }

    const slugCandidate = this.slugify(categoryName);
    const existing = await this.categoryRepository
      .createQueryBuilder('category')
      .where('LOWER(category.name) = :name', { name: categoryName.toLowerCase() })
      .getOne();

    if (!existing && slugCandidate) {
      const existingBySlug = await this.categoryRepository.findOne({ where: { slug: slugCandidate } });
      if (existingBySlug) {
        return existingBySlug.id;
      }
    }

    if (existing) {
      return existing.id;
    }

    const created = await this.createCategory({ name: categoryName });
    return created.id;
  }

  private async replaceTemplateFields(templateId: number, fields: UpsertTemplateFieldDto[]) {
    await this.fieldRepository.delete({ template_id: templateId });

    if (!fields.length) return;

    const rows = fields.map((field, index) =>
      this.fieldRepository.create({
        template_id: templateId,
        field_key: this.normalizeFieldKey(field.field_key),
        field_label: field.field_label.trim(),
        field_type: field.field_type,
        placeholder: field.placeholder?.trim() || '',
        help_text: field.help_text?.trim() || '',
        is_required: Boolean(field.is_required),
        default_value: field.default_value?.trim() || '',
        options_json: this.normalizeOptions(field.options_json),
        sort_order: field.sort_order ?? index,
      }),
    );

    await this.fieldRepository.save(rows);
  }

  private toPublicTemplate(template: DigitalMediaTemplate) {
    const coverThumbUrl = this.toDigitalMediaThumbUrl(template.cover_image_url);
    return {
      id: template.id,
      name: template.name,
      slug: template.slug,
      description: template.description,
      cover_image_url: template.cover_image_url,
      cover_thumb_url: coverThumbUrl,
      media_type: template.media_type || 'image',
      preview_video_url: template.preview_video_url || '',
      enable_product_replace: Boolean(template.enable_product_replace),
      product_mask_url: template.product_mask_url,
      category: template.category
        ? {
            id: template.category.id,
            name: template.category.name,
            slug: template.category.slug,
          }
        : null,
      style_preset: template.style_preset,
      aspect_ratio: template.aspect_ratio,
      status: template.status,
      sort_order: template.sort_order,
      prompt_template: template.prompt_template,
      negative_prompt: template.negative_prompt,
      fields: (template.fields || [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order || a.id - b.id)
        .map((field) => ({
          id: field.id,
          field_key: field.field_key,
          field_label: field.field_label,
          field_type: field.field_type,
          placeholder: field.placeholder,
          help_text: field.help_text,
          is_required: field.is_required,
          default_value: field.default_value,
          options_json: field.options_json || [],
          sort_order: field.sort_order,
        })),
    };
  }

  private toPublicTemplateSummary(template: DigitalMediaTemplate) {
    const coverThumbUrl = this.toDigitalMediaThumbUrl(template.cover_image_url);
    return {
      id: template.id,
      name: template.name,
      slug: template.slug,
      description: template.description,
      cover_image_url: template.cover_image_url,
      cover_thumb_url: coverThumbUrl,
      media_type: template.media_type || 'image',
      preview_video_url: template.preview_video_url || '',
      category: template.category
        ? {
            id: template.category.id,
            name: template.category.name,
            slug: template.category.slug,
          }
        : null,
      aspect_ratio: template.aspect_ratio,
      status: template.status,
      sort_order: template.sort_order,
    };
  }

  private async toPublicTemplateSummaryAsync(template: DigitalMediaTemplate) {
    const normalizedCover = await this.normalizeSummaryCoverUrls(template.cover_image_url);
    return {
      id: template.id,
      name: template.name,
      slug: template.slug,
      description: template.description,
      cover_image_url: normalizedCover.cover_image_url,
      cover_thumb_url: normalizedCover.cover_thumb_url,
      media_type: template.media_type || 'image',
      preview_video_url: template.preview_video_url || '',
      category: template.category
        ? {
            id: template.category.id,
            name: template.category.name,
            slug: template.category.slug,
          }
        : null,
      aspect_ratio: template.aspect_ratio,
      status: template.status,
      sort_order: template.sort_order,
    };
  }

  private toDigitalMediaThumbUrl(url: string): string | null {
    if (!url || typeof url !== 'string') return null;
    const marker = '/digital-media/';
    const idx = url.lastIndexOf(marker);
    if (idx < 0) return null;
    const filename = url.slice(idx + marker.length);
    if (!filename) return null;
    const dotIdx = filename.lastIndexOf('.');
    if (dotIdx <= 0) return null;
    const base = filename.slice(0, dotIdx);
    const ext = filename.slice(dotIdx + 1).toLowerCase();
    if (ext === 'gif') return null;
    return `${url.slice(0, idx + marker.length)}${base}-thumb.webp`;
  }

  private ensureDigitalMediaUploadDir() {
    if (!existsSync(digitalMediaUploadPath)) {
      mkdirSync(digitalMediaUploadPath, { recursive: true });
    }
  }

  private async normalizeSummaryCoverUrls(rawUrl: string): Promise<{
    cover_image_url: string;
    cover_thumb_url: string | null;
  }> {
    const original = String(rawUrl || '').trim();
    if (!original) {
      return { cover_image_url: '', cover_thumb_url: null };
    }

    const existingThumb = this.toDigitalMediaThumbUrl(original);
    if (existingThumb) {
      return { cover_image_url: original, cover_thumb_url: existingThumb };
    }

    if (!this.isDataImageUrl(original)) {
      return { cover_image_url: original, cover_thumb_url: null };
    }

    const persisted = await this.persistDataUrlCoverAsWebp(original);
    if (!persisted) {
      return { cover_image_url: original, cover_thumb_url: null };
    }

    return {
      cover_image_url: persisted.coverImageUrl,
      cover_thumb_url: persisted.coverThumbUrl,
    };
  }

  private isDataImageUrl(value: string) {
    return /^data:image\/[a-z0-9.+-]+;base64,/i.test(String(value || '').trim());
  }

  private async persistDataUrlCoverAsWebp(dataUrl: string): Promise<{
    coverImageUrl: string;
    coverThumbUrl: string;
  } | null> {
    try {
      const match = dataUrl.match(/^data:image\/[a-z0-9.+-]+;base64,(.+)$/i);
      if (!match?.[1]) return null;

      const imageBuffer = Buffer.from(match[1], 'base64');
      if (!imageBuffer.length) return null;

      this.ensureDigitalMediaUploadDir();
      const hash = createHash('sha1').update(dataUrl).digest('hex').slice(0, 20);
      const baseName = `tpl-cover-${hash}`;
      const coverFilename = `${baseName}.webp`;
      const thumbFilename = `${baseName}-thumb.webp`;
      const coverPath = join(digitalMediaUploadPath, coverFilename);
      const thumbPath = join(digitalMediaUploadPath, thumbFilename);

      const [coverExists, thumbExists] = await Promise.all([
        fsPromises
          .access(coverPath)
          .then(() => true)
          .catch(() => false),
        fsPromises
          .access(thumbPath)
          .then(() => true)
          .catch(() => false),
      ]);

      if (!coverExists) {
        await sharp(imageBuffer, { failOn: 'none' })
          .rotate()
          .resize({
            width: COVER_MAX_EDGE,
            height: COVER_MAX_EDGE,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: COVER_WEBP_QUALITY, effort: 4 })
          .toFile(coverPath);
      }

      if (!thumbExists) {
        await sharp(imageBuffer, { failOn: 'none' })
          .rotate()
          .resize({
            width: COVER_THUMB_MAX_EDGE,
            height: COVER_THUMB_MAX_EDGE,
            fit: 'inside',
            withoutEnlargement: true,
          })
          .webp({ quality: COVER_THUMB_WEBP_QUALITY, effort: 4 })
          .toFile(thumbPath);
      }

      return {
        coverImageUrl: `/api/uploads/digital-media/${coverFilename}`,
        coverThumbUrl: `/api/uploads/digital-media/${thumbFilename}`,
      };
    } catch (error) {
      this.logger.warn(
        `Failed to persist data-url cover as webp: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      return null;
    }
  }

  private async ensureTables() {
    await this.categoryRepository.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        slug VARCHAR(150) UNIQUE NOT NULL,
        sort_order INT NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await this.templateRepository.query(`
      CREATE TABLE IF NOT EXISTS templates (
        id SERIAL PRIMARY KEY,
        name VARCHAR(180) NOT NULL,
        slug VARCHAR(180) UNIQUE NOT NULL,
        category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        description TEXT NOT NULL DEFAULT '',
        cover_image_url TEXT NOT NULL DEFAULT '',
        media_type VARCHAR(16) NOT NULL DEFAULT 'image',
        preview_video_url TEXT NOT NULL DEFAULT '',
        enable_product_replace BOOLEAN NOT NULL DEFAULT FALSE,
        product_mask_url TEXT NOT NULL DEFAULT '',
        prompt_template TEXT NOT NULL,
        negative_prompt TEXT NOT NULL DEFAULT '',
        style_preset VARCHAR(120) NOT NULL DEFAULT 'standard',
        aspect_ratio VARCHAR(10) NOT NULL DEFAULT '1:1',
        status VARCHAR(16) NOT NULL DEFAULT 'draft',
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await this.templateRepository.query(`
      ALTER TABLE templates
      ADD COLUMN IF NOT EXISTS enable_product_replace BOOLEAN NOT NULL DEFAULT FALSE;
    `);

    await this.templateRepository.query(`
      ALTER TABLE templates
      ADD COLUMN IF NOT EXISTS product_mask_url TEXT NOT NULL DEFAULT '';
    `);

    await this.templateRepository.query(`
      ALTER TABLE templates
      ADD COLUMN IF NOT EXISTS media_type VARCHAR(16) NOT NULL DEFAULT 'image';
    `);

    await this.templateRepository.query(`
      ALTER TABLE templates
      ADD COLUMN IF NOT EXISTS preview_video_url TEXT NOT NULL DEFAULT '';
    `);

    await this.fieldRepository.query(`
      CREATE TABLE IF NOT EXISTS template_fields (
        id SERIAL PRIMARY KEY,
        template_id INT NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
        field_key VARCHAR(120) NOT NULL,
        field_label VARCHAR(180) NOT NULL,
        field_type VARCHAR(30) NOT NULL,
        placeholder VARCHAR(220) NOT NULL DEFAULT '',
        help_text TEXT NOT NULL DEFAULT '',
        is_required BOOLEAN NOT NULL DEFAULT FALSE,
        default_value TEXT NOT NULL DEFAULT '',
        options_json JSONB NOT NULL DEFAULT '[]'::jsonb,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);


    await this.jobRepository.query(`
      CREATE TABLE IF NOT EXISTS generation_jobs (
        id SERIAL PRIMARY KEY,
        template_id INT NOT NULL REFERENCES templates(id) ON DELETE RESTRICT,
        user_input_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        final_prompt TEXT NOT NULL,
        final_negative_prompt TEXT NOT NULL DEFAULT '',
        aspect_ratio VARCHAR(10) NOT NULL DEFAULT '1:1',
        status VARCHAR(16) NOT NULL DEFAULT 'pending',
        output_image_url TEXT NOT NULL DEFAULT '',
        output_video_url TEXT NOT NULL DEFAULT '',
        error_message TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    await this.jobRepository.query(`
      ALTER TABLE generation_jobs
      ADD COLUMN IF NOT EXISTS output_video_url TEXT NOT NULL DEFAULT '';
    `);

    await this.jobRepository.query(`
      ALTER TABLE generation_jobs
      ADD COLUMN IF NOT EXISTS user_id INT NULL;
    `);
  }

  private isUnlimitedRequester(requester: RequesterContext) {
    return requester.role === 'super_admin' || requester.role === 'group_admin';
  }

  private getBangkokDayRange() {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Bangkok',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = formatter.formatToParts(new Date());
    const year = parts.find((part) => part.type === 'year')?.value || '1970';
    const month = parts.find((part) => part.type === 'month')?.value || '01';
    const day = parts.find((part) => part.type === 'day')?.value || '01';

    return {
      start: new Date(`${year}-${month}-${day}T00:00:00+07:00`),
      end: new Date(`${year}-${month}-${day}T23:59:59.999+07:00`),
    };
  }

  private async getTodayUsageCount(userId: number) {
    const { start, end } = this.getBangkokDayRange();
    return this.jobRepository.count({
      where: {
        user_id: userId,
        created_at: Between(start, end),
      },
    });
  }

  private async assertWithinDailyQuota(requester: RequesterContext) {
    if (!requester.userId || this.isUnlimitedRequester(requester)) {
      return;
    }

    const used = await this.getTodayUsageCount(requester.userId);
    if (used >= DIGITAL_MEDIA_DAILY_LIMIT) {
      throw new BadRequestException(`วันนี้คุณสร้างงานครบ ${DIGITAL_MEDIA_DAILY_LIMIT} งานแล้ว กรุณาลองใหม่พรุ่งนี้`);
    }
  }

  private async seedDefaults() {
    const categoryCount = await this.categoryRepository.count();
    if (categoryCount === 0) {
      await this.categoryRepository.save([
        this.categoryRepository.create({ name: 'โปรโมชั่น', slug: 'promotion', sort_order: 1, is_active: true }),
        this.categoryRepository.create({ name: 'สินค้าและแบรนด์', slug: 'product', sort_order: 2, is_active: true }),
        this.categoryRepository.create({ name: 'อีเวนต์และเปิดตัว', slug: 'event', sort_order: 3, is_active: true }),
      ]);
    }

    const templateCount = await this.templateRepository.count();
    if (templateCount > 0) return;

    const categories = await this.categoryRepository.find();
    const promotion = categories.find((item) => item.slug === 'promotion');
    const product = categories.find((item) => item.slug === 'product');

    if (!promotion || !product) return;

    const promotionTemplate = await this.templateRepository.save(
      this.templateRepository.create({
        name: 'โปรโมชันลดราคา',
        slug: 'promo-flash-sale',
        category_id: promotion.id,
        description: 'เทมเพลตสำหรับแคมเปญลดราคาแบบเร่งยอดขาย',
        cover_image_url: '/digital-media/templates/promo-flash-sale-template.png',
        prompt_template:
          'Create a modern promotional poster using the template background and layout. Insert the uploaded product image {product_image} as the main product. Keep the uploaded product appearance faithful to the original photo, including packaging colors, logo, shape, and branding. Do not recolor or redesign the product. Keep the existing Thai headline styling and overall promotional atmosphere. Clean layout for mobile.',
        negative_prompt: '',
        style_preset: 'promo-clean',
        aspect_ratio: '1:1',
        status: 'active',
        sort_order: 1,
      }),
    );

    const productTemplate = await this.templateRepository.save(
      this.templateRepository.create({
        name: 'สินค้าแนะนำ',
        slug: 'product-highlight',
        category_id: product.id,
        description: 'เทมเพลตเน้นสินค้าและรายละเอียดเด่น',
        cover_image_url: '',
        prompt_template:
          'Create a product highlight image for {title}. Show key details: {detail}. Focus on clean commercial presentation. Product image reference: {product_image}. Use accent color {accent_color}.',
        negative_prompt: '',
        style_preset: 'product-clean',
        aspect_ratio: '1:1',
        status: 'active',
        sort_order: 2,
      }),
    );

    await this.fieldRepository.save([
      this.fieldRepository.create({
        template_id: promotionTemplate.id,
        field_key: 'headline',
        field_label: 'หัวข้อหลัก',
        field_type: 'text',
        placeholder: 'เช่น Flash Sale',
        is_required: true,
        sort_order: 1,
      }),
      this.fieldRepository.create({
        template_id: promotionTemplate.id,
        field_key: 'subheadline',
        field_label: 'ข้อความรอง',
        field_type: 'textarea',
        placeholder: 'เช่น ลดสูงสุด 50%',
        is_required: true,
        sort_order: 2,
      }),
      this.fieldRepository.create({
        template_id: promotionTemplate.id,
        field_key: 'product_image',
        field_label: 'รูปสินค้า',
        field_type: 'image',
        is_required: true,
        sort_order: 3,
      }),
      this.fieldRepository.create({
        template_id: promotionTemplate.id,
        field_key: 'logo',
        field_label: 'โลโก้',
        field_type: 'image',
        is_required: false,
        sort_order: 4,
      }),
      this.fieldRepository.create({
        template_id: promotionTemplate.id,
        field_key: 'brand_color',
        field_label: 'สีแบรนด์',
        field_type: 'color',
        default_value: '#050579',
        is_required: false,
        sort_order: 5,
      }),
      this.fieldRepository.create({
        template_id: productTemplate.id,
        field_key: 'title',
        field_label: 'ชื่อสินค้า',
        field_type: 'text',
        is_required: true,
        sort_order: 1,
      }),
      this.fieldRepository.create({
        template_id: productTemplate.id,
        field_key: 'detail',
        field_label: 'รายละเอียดสินค้า',
        field_type: 'textarea',
        is_required: true,
        sort_order: 2,
      }),
      this.fieldRepository.create({
        template_id: productTemplate.id,
        field_key: 'product_image',
        field_label: 'รูปสินค้า',
        field_type: 'image',
        is_required: true,
        sort_order: 3,
      }),
      this.fieldRepository.create({
        template_id: productTemplate.id,
        field_key: 'accent_color',
        field_label: 'สีเน้น',
        field_type: 'color',
        is_required: false,
        default_value: '#0EA5E9',
        sort_order: 4,
      }),
    ]);
  }
}
