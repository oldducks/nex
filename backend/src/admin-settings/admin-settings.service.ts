import { BadRequestException, Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';
import { GoogleAuth } from 'google-auth-library';
import { AdminSetting } from './entities/admin-setting.entity';
import { LandingPage } from '../landing-pages/entities/landing-page.entity';
import { UpdateAiImageSettingsDto } from './dto/update-ai-image-settings.dto';
import {
  DEFAULT_IMAGE_MODEL,
  isAllowedImageModel,
  normalizeImageModel,
  resolveAllowedImageModel,
} from '../create-lite/image-models.constants';
import { ALLOWED_VIDEO_MODELS, isAllowedVideoModel, normalizeVideoModel } from '../create-lite/video-models.constants';

type AiImageSettingsPayload = {
  provider: 'vertex';
  connection_mode: 'cloud_run_proxy' | 'api_key';
  provider_url: string;
  account_label: string;
  promotion_ends_at: string | null;
  note: string;
  project_id: string;
  location: string;
  model: string;
  video_model: string;
  api_key_encrypted: string | null;
  api_key_masked: string;
  is_enabled: boolean;
  last_test_status: 'connected' | 'failed' | null;
  last_tested_at: string | null;
  last_test_message: string;
};

type PublicAiImageSettings = {
  provider: 'vertex';
  connection_mode: 'cloud_run_proxy' | 'api_key';
  provider_url: string;
  account_label: string;
  promotion_ends_at: string | null;
  note: string;
  project_id: string;
  location: string;
  model: string;
  video_model: string;
  has_api_key: boolean;
  has_adc: boolean;
  auth_mode: 'api_key' | 'adc' | 'unconfigured';
  api_key_masked: string;
  is_enabled: boolean;
  last_test_status: 'connected' | 'failed' | null;
  last_tested_at: string | null;
  last_test_message: string;
  updated_at: Date | null;
};

type LearningMediaExampleOverride = {
  title?: string;
  category?: string;
  description?: string;
  thumbnailUrl?: string;
  livePreviewUrl?: string;
};

type CentralPartnerShareSettings = {
  templates: Array<{
    landingPageId: number;
    pitch: string;
    page?: {
      id: number;
      title: string;
      slug: string;
      is_published: boolean;
      updated_at: Date;
    } | null;
  }>;
};

const AI_IMAGE_KEY = 'ai_image_config';
const LEARNING_MEDIA_EXAMPLES_KEY = 'learning_media_examples_overrides';
const CENTRAL_PARTNER_SHARE_KEY = 'central_partner_share_settings';
const DEFAULT_CENTRAL_PARTNER_PITCH =
  'แนะนำระบบ NEX Solution ที่ช่วยคุณสร้าง Sale Page, E-Catalog, QR Code และเครื่องมือปิดการขายได้ในลิงก์เดียว ใช้งานง่ายบนมือถือ พร้อมระบบหลังบ้านที่พร้อมต่อยอดธุรกิจทันที สนใจดูตัวอย่างและเริ่มใช้งาน คลิกที่ลิงก์นี้ได้เลย';
const DEFAULT_CENTRAL_PARTNER_PAGE_ID = 42;

export type AiImageRuntimeConfig = {
  connection_mode: 'cloud_run_proxy' | 'api_key';
  provider_url: string;
  account_label: string;
  promotion_ends_at: string | null;
  note: string;
  project_id: string;
  location: string;
  model: string;
  video_model: string;
  api_key: string;
  is_enabled: boolean;
};

@Injectable()
export class AdminSettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(AdminSetting)
    private readonly settingsRepository: Repository<AdminSetting>,
    @InjectRepository(LandingPage)
    private readonly landingPagesRepository: Repository<LandingPage>,
  ) {}

  async onModuleInit() {
    await this.settingsRepository.query(`
      CREATE TABLE IF NOT EXISTS admin_settings (
        id SERIAL PRIMARY KEY,
        setting_key VARCHAR(120) UNIQUE NOT NULL,
        payload JSONB NOT NULL DEFAULT '{}'::jsonb,
        updated_by INT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }

  async getAiImageSettings(): Promise<PublicAiImageSettings> {
    const entity = await this.settingsRepository.findOne({ where: { setting_key: AI_IMAGE_KEY } });
    const payload = this.toPayload(entity?.payload);
    return this.toPublicSettings(payload, entity?.updated_at || null);
  }

  async updateAiImageSettings(dto: UpdateAiImageSettingsDto, userId: number): Promise<PublicAiImageSettings> {
    const current = await this.settingsRepository.findOne({ where: { setting_key: AI_IMAGE_KEY } });
    const currentPayload = this.toPayload(current?.payload);
    const nextApiKey =
      dto.api_key !== undefined
        ? this.normalizeApiKey(dto.api_key)
        : null;

    const nextPayload: AiImageSettingsPayload = {
      ...currentPayload,
      provider: 'vertex',
      connection_mode: dto.connection_mode !== undefined ? dto.connection_mode : currentPayload.connection_mode,
      provider_url: dto.provider_url !== undefined ? dto.provider_url.trim() : currentPayload.provider_url,
      account_label: dto.account_label !== undefined ? dto.account_label.trim() : currentPayload.account_label,
      promotion_ends_at:
        dto.promotion_ends_at !== undefined
          ? dto.promotion_ends_at.trim() || null
          : currentPayload.promotion_ends_at,
      note: dto.note !== undefined ? dto.note.trim() : currentPayload.note,
      project_id: dto.project_id !== undefined ? dto.project_id.trim() : currentPayload.project_id,
      location: dto.location !== undefined ? dto.location.trim() : currentPayload.location,
      model: dto.model !== undefined ? normalizeImageModel(dto.model) : currentPayload.model,
      video_model: dto.video_model !== undefined ? normalizeVideoModel(dto.video_model) : currentPayload.video_model,
      is_enabled: dto.is_enabled !== undefined ? Boolean(dto.is_enabled) : currentPayload.is_enabled,
      api_key_encrypted:
        dto.api_key !== undefined
          ? nextApiKey?.encrypted ?? null
          : currentPayload.api_key_encrypted,
      api_key_masked:
        dto.api_key !== undefined
          ? nextApiKey?.masked ?? ''
          : currentPayload.api_key_masked,
    };

    this.validateOptionalImageModel(nextPayload.model);
    this.validateOptionalVideoModel(nextPayload.video_model);

    const saved = await this.settingsRepository.save({
      id: current?.id,
      setting_key: AI_IMAGE_KEY,
      payload: nextPayload,
      updated_by: userId,
    });

    return this.toPublicSettings(nextPayload, saved.updated_at);
  }

  async testAiImageSettings(): Promise<{ ok: boolean; provider: 'vertex'; checks: string[] }> {
    const entity = await this.settingsRepository.findOne({ where: { setting_key: AI_IMAGE_KEY } });
    const payload = this.toPayload(entity?.payload);
    const checks: string[] = [];
    const hasAdc = await this.hasApplicationDefaultCredentials();

    if (payload.connection_mode === 'cloud_run_proxy' && !payload.provider_url) {
      checks.push('กรุณาตั้งค่า Provider URL ของ Cloud Run proxy');
    }
    if (!payload.location) checks.push('กรุณาตั้งค่า Region (location)');
    if (!payload.model) checks.push('กรุณาตั้งค่า Model');
    if (payload.video_model && !isAllowedVideoModel(payload.video_model)) {
      checks.push(`Video model ไม่รองรับ: ${payload.video_model}`);
    }
    if (payload.connection_mode === 'api_key' && !payload.api_key_encrypted && !hasAdc) {
      checks.push('โหมด Direct API Key ต้องมี API Key หรือ ADC สำหรับทดสอบ');
    }

    const ok = checks.length === 0;
    const testMessage = checks.length
      ? checks.join(' | ')
      : payload.connection_mode === 'cloud_run_proxy'
        ? 'พร้อมใช้งานผ่าน Cloud Run proxy'
        : payload.api_key_encrypted
          ? 'พร้อมใช้งานผ่าน API Key'
          : 'พร้อมใช้งานผ่าน ADC / service account';

    await this.settingsRepository.save({
      id: entity?.id,
      setting_key: AI_IMAGE_KEY,
      payload: {
        ...payload,
        last_test_status: ok ? 'connected' : 'failed',
        last_tested_at: new Date().toISOString(),
        last_test_message: testMessage,
      },
      updated_by: entity?.updated_by ?? null,
    });

    return {
      ok,
      provider: 'vertex',
      checks: checks.length ? checks : [testMessage],
    };
  }

  async getAiImageRuntimeConfig(): Promise<AiImageRuntimeConfig> {
    const entity = await this.settingsRepository.findOne({ where: { setting_key: AI_IMAGE_KEY } });
    const payload = this.toPayload(entity?.payload);

    return {
      connection_mode: payload.connection_mode,
      provider_url: payload.provider_url,
      account_label: payload.account_label,
      promotion_ends_at: payload.promotion_ends_at,
      note: payload.note,
      project_id: payload.project_id,
      location: payload.location,
      model: payload.model,
      video_model: payload.video_model,
      api_key: payload.api_key_encrypted ? this.decrypt(payload.api_key_encrypted) : '',
      is_enabled: payload.is_enabled,
    };
  }

  async getLearningMediaExampleOverrides(): Promise<Record<string, LearningMediaExampleOverride>> {
    const entity = await this.settingsRepository.findOne({
      where: { setting_key: LEARNING_MEDIA_EXAMPLES_KEY },
    });

    if (!entity?.payload || typeof entity.payload !== 'object' || Array.isArray(entity.payload)) {
      return {};
    }

    return entity.payload as Record<string, LearningMediaExampleOverride>;
  }

  async updateLearningMediaExampleOverride(
    slug: string,
    payload: LearningMediaExampleOverride,
    userId: number,
  ): Promise<Record<string, LearningMediaExampleOverride>> {
    const current = await this.settingsRepository.findOne({
      where: { setting_key: LEARNING_MEDIA_EXAMPLES_KEY },
    });

    const currentPayload =
      current?.payload && typeof current.payload === 'object' && !Array.isArray(current.payload)
        ? (current.payload as Record<string, LearningMediaExampleOverride>)
        : {};

    const nextOverride: LearningMediaExampleOverride = {
      ...(payload.title !== undefined ? { title: payload.title.trim() } : {}),
      ...(payload.category !== undefined ? { category: payload.category.trim() } : {}),
      ...(payload.description !== undefined ? { description: payload.description.trim() } : {}),
      ...(payload.thumbnailUrl !== undefined ? { thumbnailUrl: payload.thumbnailUrl.trim() } : {}),
      ...(payload.livePreviewUrl !== undefined ? { livePreviewUrl: payload.livePreviewUrl.trim() } : {}),
    };

    const nextPayload = {
      ...currentPayload,
      [slug]: {
        ...(currentPayload[slug] || {}),
        ...nextOverride,
      },
    };

    await this.settingsRepository.save({
      id: current?.id,
      setting_key: LEARNING_MEDIA_EXAMPLES_KEY,
      payload: nextPayload,
      updated_by: userId,
    });

    return nextPayload;
  }

  async getCentralPartnerShareSettings(): Promise<CentralPartnerShareSettings> {
    const entity = await this.settingsRepository.findOne({
      where: { setting_key: CENTRAL_PARTNER_SHARE_KEY },
    });
    const templates = await this.buildCentralPartnerTemplateSettings(entity?.payload);
    return { templates };
  }

  async updateCentralPartnerShareSettings(
    payload: { pitch?: string },
    userId: number,
  ): Promise<CentralPartnerShareSettings> {
    const current = await this.settingsRepository.findOne({
      where: { setting_key: CENTRAL_PARTNER_SHARE_KEY },
    });

    const currentTemplates = this.normalizeCentralPartnerTemplates(current?.payload);
    const targetTemplateId =
      currentTemplates[0]?.landingPageId ?? DEFAULT_CENTRAL_PARTNER_PAGE_ID;
    const updatedTemplates = this.upsertCentralPartnerTemplate(
      currentTemplates,
      targetTemplateId,
      payload.pitch?.trim() || DEFAULT_CENTRAL_PARTNER_PITCH,
    );

    const saved = await this.settingsRepository.save({
      id: current?.id,
      setting_key: CENTRAL_PARTNER_SHARE_KEY,
      payload: {
        templates: updatedTemplates,
      },
      updated_by: userId,
    });

    return {
      templates: await this.buildCentralPartnerTemplateSettings(saved.payload),
    };
  }

  async addCentralPartnerTemplate(
    landingPageId: number,
    pitch: string,
    userId: number,
  ): Promise<CentralPartnerShareSettings> {
    const current = await this.settingsRepository.findOne({
      where: { setting_key: CENTRAL_PARTNER_SHARE_KEY },
    });

    const currentTemplates = this.normalizeCentralPartnerTemplates(current?.payload);
    const nextTemplates = this.upsertCentralPartnerTemplate(
      currentTemplates,
      landingPageId,
      pitch.trim() || DEFAULT_CENTRAL_PARTNER_PITCH,
    );

    const saved = await this.settingsRepository.save({
      id: current?.id,
      setting_key: CENTRAL_PARTNER_SHARE_KEY,
      payload: { templates: nextTemplates },
      updated_by: userId,
    });

    return {
      templates: await this.buildCentralPartnerTemplateSettings(saved.payload),
    };
  }

  async updateCentralPartnerTemplatePitch(
    landingPageId: number,
    pitch: string,
    userId: number,
  ): Promise<CentralPartnerShareSettings> {
    const current = await this.settingsRepository.findOne({
      where: { setting_key: CENTRAL_PARTNER_SHARE_KEY },
    });

    const currentTemplates = this.normalizeCentralPartnerTemplates(current?.payload);
    const nextTemplates = this.upsertCentralPartnerTemplate(
      currentTemplates,
      landingPageId,
      pitch.trim() || DEFAULT_CENTRAL_PARTNER_PITCH,
    );

    const saved = await this.settingsRepository.save({
      id: current?.id,
      setting_key: CENTRAL_PARTNER_SHARE_KEY,
      payload: { templates: nextTemplates },
      updated_by: userId,
    });

    return {
      templates: await this.buildCentralPartnerTemplateSettings(saved.payload),
    };
  }

  async removeCentralPartnerTemplate(
    landingPageId: number,
    userId: number,
  ): Promise<CentralPartnerShareSettings> {
    const current = await this.settingsRepository.findOne({
      where: { setting_key: CENTRAL_PARTNER_SHARE_KEY },
    });

    const currentTemplates = this.normalizeCentralPartnerTemplates(current?.payload);
    const nextTemplates = currentTemplates.filter((template) => template.landingPageId !== landingPageId);

    const saved = await this.settingsRepository.save({
      id: current?.id,
      setting_key: CENTRAL_PARTNER_SHARE_KEY,
      payload: { templates: nextTemplates },
      updated_by: userId,
    });

    return {
      templates: await this.buildCentralPartnerTemplateSettings(saved.payload),
    };
  }

  private normalizeCentralPartnerTemplates(raw: Record<string, any> | undefined | null) {
    const normalizedRaw =
      raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};

    const templatesSource = Array.isArray(normalizedRaw.templates)
      ? normalizedRaw.templates
      : [
          {
            landingPageId: DEFAULT_CENTRAL_PARTNER_PAGE_ID,
            pitch:
              typeof normalizedRaw.pitch === 'string' && normalizedRaw.pitch.trim().length > 0
                ? normalizedRaw.pitch.trim()
                : DEFAULT_CENTRAL_PARTNER_PITCH,
          },
        ];

    const uniqueTemplates = new Map<number, { landingPageId: number; pitch: string }>();
    for (const template of templatesSource) {
      const landingPageId = Number(template?.landingPageId);
      if (!Number.isFinite(landingPageId) || landingPageId <= 0) continue;
      const pitch =
        typeof template?.pitch === 'string' && template.pitch.trim().length > 0
          ? template.pitch.trim()
          : DEFAULT_CENTRAL_PARTNER_PITCH;
      uniqueTemplates.set(landingPageId, { landingPageId, pitch });
    }

    return Array.from(uniqueTemplates.values());
  }

  private upsertCentralPartnerTemplate(
    templates: Array<{ landingPageId: number; pitch: string }>,
    landingPageId: number,
    pitch: string,
  ) {
    const filtered = templates.filter((template) => template.landingPageId !== landingPageId);
    return [{ landingPageId, pitch }, ...filtered];
  }

  private async buildCentralPartnerTemplateSettings(
    raw: Record<string, any> | undefined | null,
  ): Promise<CentralPartnerShareSettings['templates']> {
    const templates = this.normalizeCentralPartnerTemplates(raw);
    const ids = templates.map((template) => template.landingPageId);
    if (ids.length === 0) return [];

    const pages = await this.landingPagesRepository.find({
      where: { id: In(ids) },
    });
    const pageMap = new Map(pages.map((page) => [page.id, page]));

    return templates.map((template) => {
      const page = pageMap.get(template.landingPageId);
      return {
        landingPageId: template.landingPageId,
        pitch: template.pitch,
        page: page
          ? {
              id: page.id,
              title: page.title,
              slug: page.slug,
              is_published: page.is_published,
              updated_at: page.updated_at,
            }
          : null,
      };
    });
  }

  private toPayload(raw: Record<string, any> | undefined | null): AiImageSettingsPayload {
    return {
      provider: 'vertex',
      connection_mode:
        raw?.connection_mode === 'api_key' || raw?.connection_mode === 'cloud_run_proxy'
          ? raw.connection_mode
          : 'cloud_run_proxy',
      provider_url: typeof raw?.provider_url === 'string' ? raw.provider_url : '',
      account_label: typeof raw?.account_label === 'string' ? raw.account_label : '',
      promotion_ends_at: typeof raw?.promotion_ends_at === 'string' ? raw.promotion_ends_at : null,
      note: typeof raw?.note === 'string' ? raw.note : '',
      project_id: typeof raw?.project_id === 'string' ? raw.project_id : '',
      location: typeof raw?.location === 'string' ? raw.location : 'asia-southeast1',
      model: resolveAllowedImageModel(raw?.model, DEFAULT_IMAGE_MODEL),
      video_model: typeof raw?.video_model === 'string' ? normalizeVideoModel(raw.video_model) : '',
      api_key_encrypted: typeof raw?.api_key_encrypted === 'string' ? raw.api_key_encrypted : null,
      api_key_masked: typeof raw?.api_key_masked === 'string' ? raw.api_key_masked : '',
      is_enabled: typeof raw?.is_enabled === 'boolean' ? raw.is_enabled : false,
      last_test_status:
        raw?.last_test_status === 'connected' || raw?.last_test_status === 'failed'
          ? raw.last_test_status
          : null,
      last_tested_at: typeof raw?.last_tested_at === 'string' ? raw.last_tested_at : null,
      last_test_message: typeof raw?.last_test_message === 'string' ? raw.last_test_message : '',
    };
  }

  private async toPublicSettings(payload: AiImageSettingsPayload, updatedAt: Date | null): Promise<PublicAiImageSettings> {
    const hasAdc = await this.hasApplicationDefaultCredentials();
    const authMode = payload.api_key_encrypted ? 'api_key' : hasAdc ? 'adc' : 'unconfigured';

    return {
      provider: 'vertex',
      connection_mode: payload.connection_mode,
      provider_url: payload.provider_url,
      account_label: payload.account_label,
      promotion_ends_at: payload.promotion_ends_at,
      note: payload.note,
      project_id: payload.project_id,
      location: payload.location,
      model: payload.model,
      video_model: payload.video_model,
      has_api_key: Boolean(payload.api_key_encrypted),
      has_adc: hasAdc,
      auth_mode: authMode,
      api_key_masked: payload.api_key_masked,
      is_enabled: payload.is_enabled,
      last_test_status: payload.last_test_status,
      last_tested_at: payload.last_tested_at,
      last_test_message: payload.last_test_message,
      updated_at: updatedAt,
    };
  }

  private validateOptionalImageModel(model: string) {
    if (!model) {
      return;
    }

    if (isAllowedImageModel(model)) {
      return;
    }

    throw new BadRequestException(
      `Unsupported image model "${model}". Allowed values: ${DEFAULT_IMAGE_MODEL}, gemini-2.5-flash-image-preview, imagen-3.0-generate-002`,
    );
  }

  private validateOptionalVideoModel(model: string) {
    if (!model) {
      return;
    }

    if (!isAllowedVideoModel(model)) {
      throw new BadRequestException(
        `Unsupported video model "${model}". Allowed values: ${ALLOWED_VIDEO_MODELS.join(', ')}`,
      );
    }
  }

  private async hasApplicationDefaultCredentials(): Promise<boolean> {
    try {
      const client = await this.createGoogleAuth().getClient();
      const token = await client.getAccessToken();
      const accessToken = typeof token === 'string' ? token : token?.token;
      return Boolean(accessToken);
    } catch {
      return false;
    }
  }

  private normalizeApiKey(raw: string): { encrypted: string | null; masked: string } {
    const cleaned = raw.trim();
    if (!cleaned) {
      return { encrypted: null, masked: '' };
    }
    return {
      encrypted: this.encrypt(cleaned),
      masked: this.maskApiKey(cleaned),
    };
  }

  private maskApiKey(raw: string): string {
    const first4 = raw.slice(0, 4);
    return first4 ? `${first4}xxxx` : 'xxxx';
  }

  private getEncryptionKey(): Buffer {
    const secret =
      process.env.SETTINGS_ENCRYPTION_KEY ||
      process.env.JWT_SECRET ||
      'nex-admin-settings-fallback-key-change-in-production';
    return createHash('sha256').update(secret).digest();
  }

  private encrypt(plainText: string): string {
    const iv = randomBytes(12);
    const key = this.getEncryptionKey();
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return `v1:${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted.toString('base64')}`;
  }

  private decrypt(payload: string): string {
    const [version, ivB64, tagB64, dataB64] = payload.split(':');
    if (version !== 'v1' || !ivB64 || !tagB64 || !dataB64) {
      throw new Error('invalid payload');
    }

    const key = this.getEncryptionKey();
    const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(ivB64, 'base64'));
    decipher.setAuthTag(Buffer.from(tagB64, 'base64'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataB64, 'base64')),
      decipher.final(),
    ]);

    return decrypted.toString('utf8');
  }

  private createGoogleAuth(): GoogleAuth {
    const scopes = ['https://www.googleapis.com/auth/cloud-platform'];
    const rawCredentials = process.env.GOOGLE_SERVICE_ACCOUNT_JSON?.trim();

    if (!rawCredentials) {
      return new GoogleAuth({ scopes });
    }

    try {
      return new GoogleAuth({
        scopes,
        credentials: JSON.parse(rawCredentials),
      });
    } catch {
      return new GoogleAuth({ scopes });
    }
  }
}
