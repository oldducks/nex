import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AdminSettingsService } from '../admin-settings/admin-settings.service';
import { readFile } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';
import { GoogleAuth } from 'google-auth-library';

export interface CreateLiteTemplate {
  id: string;
  name: string;
  category: 'promotion' | 'product' | 'event' | 'social';
  description: string;
  width: number;
  height: number;
  previewGradient: string;
  previewImage?: string;
  defaultTexts: {
    title: string;
    subtitle: string;
    cta?: string;
  };
}

export interface CreateLiteCopyInput {
  templateId?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
}

export interface CreateLiteCopyResult {
  title: string;
  subtitle: string;
  cta: string;
}

export interface CreateLiteImageInput {
  prompt?: string;
  templateId?: string;
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  brandName?: string;
  ratio?: '1:1' | '4:5' | '9:16';
}

export interface CreateLiteReplaceProductInput {
  prompt: string;
  ratio?: '1:1' | '4:5' | '9:16';
  baseImageUrl: string;
  productImageUrl: string;
}

export interface CreateLiteReferenceImageInput {
  prompt: string;
  ratio?: '1:1' | '4:5' | '9:16';
  referenceImageUrl: string;
}

type ProxyImageRuntimeConfig = {
  connection_mode: 'cloud_run_proxy';
  provider_url: string;
  project_id: string;
  location: string;
  model: string;
  auth_mode: 'proxy';
  api_key?: string;
};

type DirectImageRuntimeConfig = {
  connection_mode: 'api_key';
  provider_url: string;
  project_id: string;
  location: string;
  model: string;
  auth_mode: 'api_key' | 'adc';
  api_key?: string;
};

type GoogleImageRuntimeConfig = ProxyImageRuntimeConfig | DirectImageRuntimeConfig;

@Injectable()
export class CreateLiteService {
  private readonly logger = new Logger(CreateLiteService.name);
  private readonly imageRetryAttempts = Number(process.env.AI_IMAGE_RETRY_ATTEMPTS || 3);
  private readonly imageRetryBaseDelayMs = Number(process.env.AI_IMAGE_RETRY_BASE_DELAY_MS || 5000);
  private readonly imageRequestTimeoutMs = Number(process.env.AI_IMAGE_REQUEST_TIMEOUT_MS || 240000);
  constructor(private readonly adminSettingsService: AdminSettingsService) {}

  // Template storage baseline (Phase 5.1): เก็บเป็น in-app library ก่อน
  private readonly templates: CreateLiteTemplate[] = [
    {
      id: 'promo-flash-sale',
      name: 'Flash Sale',
      category: 'promotion',
      description: 'เหมาะกับโปรโมชันลดราคาแบบเร่งด่วน',
      width: 1080,
      height: 1080,
      previewGradient: 'from-rose-500 to-orange-500',
      previewImage: '/digital-media/templates/promo-flash-sale-template.png',
      defaultTexts: { title: 'FLASH SALE', subtitle: 'ลดสูงสุด 50%', cta: 'ซื้อเลย' },
    },
    {
      id: 'promo-new-arrival',
      name: 'New Arrival',
      category: 'promotion',
      description: 'เปิดตัวสินค้าใหม่แบบพรีเมียม',
      width: 1080,
      height: 1080,
      previewGradient: 'from-violet-500 to-fuchsia-500',
      defaultTexts: { title: 'NEW ARRIVAL', subtitle: 'คอลเลกชันล่าสุด', cta: 'ดูสินค้า' },
    },
    {
      id: 'product-highlight',
      name: 'Product Highlight',
      category: 'product',
      description: 'เน้นจุดเด่นสินค้าชัดเจน อ่านง่าย',
      width: 1080,
      height: 1080,
      previewGradient: 'from-cyan-500 to-blue-600',
      defaultTexts: { title: 'สินค้าแนะนำ', subtitle: 'คุณภาพที่ลูกค้าวางใจ', cta: 'สั่งซื้อทันที' },
    },
    {
      id: 'product-spec',
      name: 'Product Spec Card',
      category: 'product',
      description: 'เลย์เอาต์สำหรับสรุปสเปกและคุณสมบัติ',
      width: 1080,
      height: 1080,
      previewGradient: 'from-sky-500 to-indigo-600',
      defaultTexts: { title: 'รายละเอียดสินค้า', subtitle: 'ครบทุกฟังก์ชันสำคัญ' },
    },
    {
      id: 'event-webinar',
      name: 'Webinar Invite',
      category: 'event',
      description: 'ชวนลงทะเบียนงานสัมมนา/เวิร์กช็อป',
      width: 1080,
      height: 1350,
      previewGradient: 'from-emerald-500 to-teal-600',
      defaultTexts: { title: 'ลงทะเบียน Webinar', subtitle: 'จำนวนจำกัด', cta: 'สำรองที่นั่ง' },
    },
    {
      id: 'event-grand-opening',
      name: 'Grand Opening',
      category: 'event',
      description: 'โปรโมตงานเปิดร้านหรือเปิดตัวสาขา',
      width: 1080,
      height: 1350,
      previewGradient: 'from-amber-500 to-red-500',
      defaultTexts: { title: 'GRAND OPENING', subtitle: 'พบกันวันเสาร์นี้', cta: 'ดูแผนที่' },
    },
    {
      id: 'social-testimonial',
      name: 'Customer Testimonial',
      category: 'social',
      description: 'เลย์เอาต์รีวิวลูกค้าเพื่อเพิ่มความน่าเชื่อถือ',
      width: 1080,
      height: 1080,
      previewGradient: 'from-indigo-500 to-purple-600',
      defaultTexts: { title: 'เสียงจากลูกค้า', subtitle: 'รีวิวจริง ใช้จริง' },
    },
    {
      id: 'social-quote',
      name: 'Motivation Quote',
      category: 'social',
      description: 'เทมเพลตโพสต์คำคมสำหรับ engagement',
      width: 1080,
      height: 1080,
      previewGradient: 'from-slate-600 to-slate-800',
      defaultTexts: { title: 'Inspire Every Day', subtitle: 'เริ่มวันนี้ให้ดีที่สุด' },
    },
  ];

  findAll(category?: string) {
    if (!category) {
      return this.templates;
    }
    return this.templates.filter((template) => template.category === category);
  }

  findOne(id: string) {
    const template = this.templates.find((item) => item.id === id);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return template;
  }

  async generateCopySuggestion(input: CreateLiteCopyInput): Promise<CreateLiteCopyResult> {
    const fallback = this.generateLocalCopySuggestion(input);

    try {
      const ai = await this.generateWithAiProvider(input, fallback);
      if (ai) return ai;
    } catch (error) {
      this.logger.warn(`AI provider failed, fallback to local suggestion: ${error instanceof Error ? error.message : 'unknown'}`);
    }

    return fallback;
  }

  private async generateWithAiProvider(
    input: CreateLiteCopyInput,
    fallback: CreateLiteCopyResult,
  ): Promise<CreateLiteCopyResult | null> {
    if (process.env.OPENAI_API_KEY) {
      try {
        const result = await this.generateWithOpenAi(input, fallback);
        if (result) return result;
      } catch (error) {
        this.logger.warn(`OpenAI failed: ${error instanceof Error ? error.message : 'unknown'}`);
      }
    }

    if (process.env.GOOGLE_API_KEY) {
      try {
        const result = await this.generateWithGemini(input, fallback);
        if (result) return result;
      } catch (error) {
        this.logger.warn(`Gemini failed: ${error instanceof Error ? error.message : 'unknown'}`);
      }
    }

    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const result = await this.generateWithAnthropic(input, fallback);
        if (result) return result;
      } catch (error) {
        this.logger.warn(`Anthropic failed: ${error instanceof Error ? error.message : 'unknown'}`);
      }
    }

    return null;
  }

  private buildPrompt(input: CreateLiteCopyInput, fallback: CreateLiteCopyResult) {
    return [
      'You are a Thai marketing copywriter for social media creative posts.',
      'Generate concise Thai copy in JSON format only with keys: title, subtitle, cta.',
      'Keep tone premium, direct, conversion-focused, no markdown.',
      `Context templateId: ${input.templateId || 'n/a'}`,
      `Input title: ${input.title || ''}`,
      `Input subtitle: ${input.subtitle || ''}`,
      `Input cta: ${input.cta || ''}`,
      `Fallback title: ${fallback.title}`,
      `Fallback subtitle: ${fallback.subtitle}`,
      `Fallback cta: ${fallback.cta}`,
      'Return valid JSON only.',
    ].join('\n');
  }

  private async generateWithOpenAi(input: CreateLiteCopyInput, fallback: CreateLiteCopyResult) {
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const prompt = this.buildPrompt(input, fallback);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        messages: [
          { role: 'system', content: 'Return JSON only.' },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI error ${response.status}`);
    }

    const data: any = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    return this.parseAiResult(text);
  }

  private async generateWithGemini(input: CreateLiteCopyInput, fallback: CreateLiteCopyResult) {
    const model = process.env.GOOGLE_MODEL || 'gemini-1.5-flash';
    const prompt = this.buildPrompt(input, fallback);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7 },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini error ${response.status}`);
    }

    const data: any = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    return this.parseAiResult(text);
  }

  private async generateWithAnthropic(input: CreateLiteCopyInput, fallback: CreateLiteCopyResult) {
    const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
    const prompt = this.buildPrompt(input, fallback);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: 300,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic error ${response.status}`);
    }

    const data: any = await response.json();
    const text = data?.content?.[0]?.text;
    return this.parseAiResult(text);
  }

  private parseAiResult(raw: string | undefined): CreateLiteCopyResult | null {
    if (!raw) return null;

    try {
      const cleaned = raw.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (!parsed?.title || !parsed?.subtitle) return null;
      return {
        title: String(parsed.title).trim(),
        subtitle: String(parsed.subtitle).trim(),
        cta: String(parsed.cta || '').trim(),
      };
    } catch {
      return null;
    }
  }

  private generateLocalCopySuggestion(input: CreateLiteCopyInput): CreateLiteCopyResult {
    const template = input.templateId ? this.templates.find((t) => t.id === input.templateId) : null;
    const category = template?.category || 'social';

    const baseTitle = (input.title || '').trim();
    const baseSubtitle = (input.subtitle || '').trim();
    const baseCta = (input.cta || '').trim();

    const options = {
      promotion: [
        {
          title: `โปรแรง! ${baseTitle || 'ลดกระหน่ำ'}`,
          subtitle: `${baseSubtitle || 'คุ้มที่สุดในรอบปี'} · สินค้ามีจำนวนจำกัด`,
          cta: baseCta || 'ช้อปเลย',
        },
        {
          title: `${baseTitle || 'Flash Sale'} ทะลุพิกัด`,
          subtitle: `ลดสูงสุด 70% ${baseSubtitle || 'เฉพาะวันนี้เท่านั้น'}`,
          cta: baseCta || 'รับสิทธิ์ด่วน',
        },
      ],
      product: [
        {
          title: `${baseTitle || 'นวัตกรรมใหม่'} เพื่อคุณ`,
          subtitle: `${baseSubtitle || 'สัมผัสความพรีเมียม'} ที่คุณคู่ควร`,
          cta: baseCta || 'ดูรายละเอียด',
        },
        {
          title: `${baseTitle || 'สินค้าขายดี'} ตลอดกาล`,
          subtitle: `${baseSubtitle || 'การันตีด้วยยอดขาย'} และรีวิว 5 ดาว`,
          cta: baseCta || 'ซื้อซ้ำที่นี่',
        },
      ],
      event: [
        {
          title: `เตรียมตัวพบกับ ${baseTitle || 'อีเวนต์สุดพิเศษ'}`,
          subtitle: `สอนสดโดยผู้เชี่ยวชาญ ${baseSubtitle || 'เน้นลงมือทำจริง'}`,
          cta: baseCta || 'ลงทะเบียนฟรี',
        },
      ],
      social: [
        {
          title: baseTitle || 'เปลี่ยนมุมมองชีวิต',
          subtitle: baseSubtitle || 'ความสำเร็จเริ่มต้นจากความกล้าที่จะแตกต่าง',
          cta: baseCta || 'อ่านต่อ',
        },
      ],
    };

    const categoryOptions = options[category] || options.social;
    const randomIndex = Math.floor(Math.random() * categoryOptions.length);
    return categoryOptions[randomIndex];
  }

  async generateImageFromPrompt(input: CreateLiteImageInput): Promise<{ imageDataUrl: string; promptUsed: string; model: string }> {
    const runtime = await this.getGoogleImageRuntimeConfig();

    const prompt = this.buildImagePrompt(input);
    const aspectRatio = input.ratio || '1:1';
    const sampleCount = 1;

    if (runtime.connection_mode === 'cloud_run_proxy') {
      const requestId = this.createRequestId();
      const endpoint = this.buildProxyGenerateImageEndpoint(runtime.provider_url);
      this.logger.log(
        `AI image provider mode=cloud_run_proxy proxy=${this.safeLogUrl(endpoint)} model=${runtime.model} requestId=${requestId}`,
      );

      const response = await this.fetchImageWithRetry(
        endpoint,
        this.buildProxyRequestInit(
          {
            prompt,
            aspectRatio,
            sampleCount,
            model: runtime.model,
          },
          requestId,
        ),
        `proxy:${runtime.model}:${requestId}`,
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new BadRequestException(`Cloud Run image proxy failed (${response.status}): ${errorText || 'unknown error'}`);
      }

      const data: any = await response.json();
      const base64 = this.pickProxyImageBase64(data);
      if (!base64) {
        throw new BadRequestException('Cloud Run proxy ไม่ได้ส่งรูปกลับมา');
      }

      return {
        imageDataUrl: `data:image/png;base64,${base64}`,
        promptUsed: prompt,
        model: runtime.model,
      };
    }

    if (this.isGeminiImageModel(runtime.model)) {
      const modelLocation = runtime.model.toLowerCase().includes('image') ? 'global' : runtime.location;
      const endpoint = this.buildVertexGenerateContentEndpoint(runtime, modelLocation);
      const response = await this.fetchImageWithRetry(
        endpoint,
        await this.buildVertexRequestInit(runtime, {
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: [
                    `Target aspect ratio: ${aspectRatio}.`,
                    'Create one polished commercial image based on the following direction.',
                    prompt,
                  ].join(' '),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.4,
            responseModalities: ['TEXT', 'IMAGE'],
          },
        }),
        `prompt-only:${runtime.model}`,
      );

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        throw new BadRequestException(`Vertex Gemini generate failed (${response.status}): ${errorText || 'unknown error'}`);
      }

      const data: any = await response.json();
      const base64 = this.pickGenerateContentImageBase64(data);
      if (!base64) {
        throw new BadRequestException('Gemini ไม่ได้ส่งรูปกลับมาสำหรับ prompt-only generation');
      }

      return {
        imageDataUrl: `data:image/png;base64,${base64}`,
        promptUsed: prompt,
        model: runtime.model,
      };
    }

    const endpoint = this.buildVertexPredictEndpoint(runtime);
    const response = await this.fetchImageWithRetry(
      endpoint,
      await this.buildVertexRequestInit(runtime, {
        instances: [{ prompt }],
        parameters: {
          sampleCount,
          aspectRatio,
          personGeneration: 'allow_adult',
        },
      }),
      `predict:${runtime.model}`,
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new BadRequestException(`Vertex generate failed (${response.status}): ${errorText || 'unknown error'}`);
    }

    const data: any = await response.json();
    const base64 = this.pickImageBase64(data);
    if (!base64) {
      throw new BadRequestException('Vertex ไม่ได้ส่งรูปกลับมา');
    }

    return {
      imageDataUrl: `data:image/png;base64,${base64}`,
      promptUsed: prompt,
      model: runtime.model,
    };
  }

  async generateImageWithProductReplace(
    input: CreateLiteReplaceProductInput,
  ): Promise<{ imageDataUrl: string; promptUsed: string; model: string }> {
    const runtime = this.ensureDirectImageRuntime(await this.getGoogleImageRuntimeConfig({ imageEdit: true }));
    const [baseImage, productImage] = await Promise.all([
      this.resolveImageToInlineData(input.baseImageUrl),
      this.resolveImageToInlineData(input.productImageUrl),
    ]);

    const modelLocation = runtime.model.toLowerCase().includes('image') ? 'global' : runtime.location;
    const endpoint = this.buildVertexGenerateContentEndpoint(runtime, modelLocation);
    const response = await this.fetchImageWithRetry(
      endpoint,
      await this.buildVertexRequestInit(runtime, {
        contents: [
          {
            role: 'user',
            parts: [
              {
                inline_data: {
                  mime_type: baseImage.mimeType,
                  data: baseImage.data,
                },
              },
              {
                inline_data: {
                  mime_type: productImage.mimeType,
                  data: productImage.data,
                },
              },
              {
                text: this.buildTwoImageEditPrompt(input.prompt, input.ratio),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
      `product-replace:${runtime.model}`,
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new BadRequestException(`Vertex Gemini image edit failed (${response.status}): ${errorText || 'unknown error'}`);
    }

    const data: any = await response.json();
    const base64 = this.pickGenerateContentImageBase64(data);
    if (!base64) {
      throw new BadRequestException('Gemini ไม่ได้ส่งรูปกลับมา');
    }

    return {
      imageDataUrl: `data:image/png;base64,${base64}`,
      promptUsed: input.prompt,
      model: runtime.model,
    };
  }

  async generateImageWithReferenceImage(
    input: CreateLiteReferenceImageInput,
  ): Promise<{ imageDataUrl: string; promptUsed: string; model: string }> {
    const runtime = this.ensureDirectImageRuntime(await this.getGoogleImageRuntimeConfig({ imageEdit: true }));
    const [referenceImage, faceFocusedReferenceImage] = await Promise.all([
      this.resolveImageToInlineData(input.referenceImageUrl),
      this.resolveFaceFocusedInlineData(input.referenceImageUrl),
    ]);

    const modelLocation = runtime.model.toLowerCase().includes('image') ? 'global' : runtime.location;
    const endpoint = this.buildVertexGenerateContentEndpoint(runtime, modelLocation);
    const response = await this.fetchImageWithRetry(
      endpoint,
      await this.buildVertexRequestInit(runtime, {
        contents: [
          {
            role: 'user',
            parts: [
              {
                inline_data: {
                  mime_type: referenceImage.mimeType,
                  data: referenceImage.data,
                },
              },
              {
                inline_data: {
                  mime_type: faceFocusedReferenceImage.mimeType,
                  data: faceFocusedReferenceImage.data,
                },
              },
              {
                text: this.buildReferenceImageEditPrompt(input.prompt, input.ratio),
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseModalities: ['TEXT', 'IMAGE'],
        },
      }),
      `reference-image:${runtime.model}`,
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      throw new BadRequestException(`Vertex Gemini reference image failed (${response.status}): ${errorText || 'unknown error'}`);
    }

    const data: any = await response.json();
    const base64 = this.pickGenerateContentImageBase64(data);
    if (!base64) {
      throw new BadRequestException('Gemini ไม่ได้ส่งรูปกลับมาสำหรับ reference image flow');
    }

    return {
      imageDataUrl: `data:image/png;base64,${base64}`,
      promptUsed: input.prompt,
      model: runtime.model,
    };
  }

  private buildImagePrompt(input: CreateLiteImageInput): string {
    const custom = (input.prompt || '').trim();
    if (custom) return custom;

    const parts = [
      `Create a premium marketing image for template ${input.templateId || 'general'}.`,
      `Main headline: ${input.headline || '-'}.`,
      `Subheadline: ${input.subheadline || '-'}.`,
      `CTA text: ${input.ctaText || '-'}.`,
      `Brand: ${input.brandName || '-'}.`,
      `Aspect ratio: ${input.ratio || '1:1'}.`,
      'Style: high-end ad composition, clean typography, cinematic lighting, clear focal hierarchy.',
    ];
    return parts.join(' ');
  }

  private buildTwoImageEditPrompt(prompt: string, ratio?: '1:1' | '4:5' | '9:16'): string {
    return [
      'Use the first image as the base marketing template and preserve its composition, text blocks, background, and overall layout as much as possible.',
      'Use the second image as the exact product reference to insert into the design.',
      'The product in the final image must match the uploaded product photo as closely as possible.',
      'Preserve the product packaging design, colors, logo, proportions, text, and visible branding from the second image.',
      'Do not recolor the product, do not turn it metallic or golden, and do not replace the branding with a different product design.',
      'Replace or integrate only the product area in the template with the uploaded product naturally.',
      'Keep the template identity intact and make the result look like a finished ad creative.',
      'Do not add unrelated objects or redesign the whole poster.',
      `Target aspect ratio: ${ratio || '1:1'}. Preserve the template aspect ratio if possible.`,
      `Creative direction: ${prompt}`,
    ].join(' ');
  }

  private buildReferenceImageEditPrompt(prompt: string, ratio?: '1:1' | '4:5' | '9:16') {
    return [
      'Use the first uploaded image as the full real-person identity reference.',
      'Use the second uploaded image as a tighter face-focused reference of the same person.',
      'This is the same real person, not a similar-looking person.',
      'Identity preservation is the highest priority and is more important than background, wardrobe, pose, camera style, or composition.',
      'Preserve the person identity only, not the original photo composition.',
      'Do not simply restage or copy the original reference photo.',
      'You must create a new image based on the requested scene, wardrobe, and pose.',
      'Change the background, environment, framing, body position, and shot composition according to the creative direction.',
      'It is allowed and expected to change the original pose, camera angle, crop, and body posture.',
      'Keep the same person, but do not keep the original studio background or original full-body portrait layout unless explicitly requested.',
      'Preserve the same face, facial structure, eyes, eyelids, eyebrows, nose shape, mouth shape, smile pattern, jawline, cheek shape, forehead, hairline, hairstyle, skin tone, age impression, and overall recognizable appearance as closely as possible.',
      'Do not beautify, idealize, age-shift, face-swap, or reinterpret the person.',
      'Do not generate a different person even if the requested scene or styling conflicts with the reference.',
      'Keep the face highly recognizable to someone who knows the real person from the uploaded reference photo.',
      'Maintain realistic skin texture and natural facial proportions.',
      'Single main person only. No extra people. No text.',
      'If the body or pose must change, keep the face identity unchanged first.',
      `Target aspect ratio: ${ratio || '1:1'}.`,
      `Creative direction: ${prompt}`,
    ].join(' ');
  }

  private pickImageBase64(data: any): string | null {
    const candidates: Array<unknown> = [];

    if (Array.isArray(data?.predictions)) {
      for (const item of data.predictions) {
        candidates.push(item?.bytesBase64Encoded);
        candidates.push(item?.image?.bytesBase64Encoded);
        candidates.push(item?.images?.[0]?.bytesBase64Encoded);
      }
    }

    for (const value of candidates) {
      if (typeof value === 'string' && value.trim()) return value.trim();
      if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) return value[0].trim();
    }

    return null;
  }

  private pickProxyImageBase64(data: any): string | null {
    const candidates: Array<unknown> = [
      data?.bytesBase64Encoded,
      data?.image?.bytesBase64Encoded,
      data?.image?.data,
      data?.data,
    ];

    if (Array.isArray(data?.images)) {
      for (const item of data.images) {
        candidates.push(item?.bytesBase64Encoded);
        candidates.push(item?.image?.bytesBase64Encoded);
        candidates.push(item?.data);
        candidates.push(item?.base64);
      }
    }

    if (Array.isArray(data?.predictions)) {
      for (const item of data.predictions) {
        candidates.push(item?.bytesBase64Encoded);
        candidates.push(item?.image?.bytesBase64Encoded);
        candidates.push(item?.images?.[0]?.bytesBase64Encoded);
      }
    }

    for (const value of candidates) {
      if (typeof value === 'string' && value.trim()) return value.trim();
      if (Array.isArray(value) && typeof value[0] === 'string' && value[0].trim()) return value[0].trim();
    }

    return null;
  }

  private pickGenerateContentImageBase64(data: any): string | null {
    const candidates: Array<unknown> = [];
    const parts = data?.candidates?.[0]?.content?.parts;

    if (Array.isArray(parts)) {
      for (const part of parts) {
        candidates.push(part?.inlineData?.data);
        candidates.push(part?.inline_data?.data);
      }
    }

    for (const value of candidates) {
      if (typeof value === 'string' && value.trim()) return value.trim();
    }

    return null;
  }

  private async getGoogleImageRuntimeConfig(options?: { imageEdit?: boolean }): Promise<GoogleImageRuntimeConfig> {
    const runtime = await this.adminSettingsService.getAiImageRuntimeConfig();
    const apiKey = runtime.api_key || process.env.GOOGLE_API_KEY || '';
    const requestedModel = runtime.model || process.env.GOOGLE_IMAGE_MODEL || process.env.GOOGLE_MODEL || '';
    const model = options?.imageEdit
      ? this.resolveImageEditModel(requestedModel)
      : requestedModel || 'gemini-3.1-flash-image-preview';
    const isEnabled = runtime.is_enabled || Boolean(process.env.GOOGLE_API_KEY);
    const connectionMode = runtime.connection_mode || 'api_key';

    if (!isEnabled) {
      throw new BadRequestException('ยังไม่ได้เปิดใช้งาน AI image provider');
    }

    if (connectionMode === 'cloud_run_proxy' && !options?.imageEdit) {
      if (!runtime.provider_url?.trim()) {
        throw new BadRequestException('ยังไม่ได้ตั้งค่า Provider URL สำหรับ Cloud Run proxy');
      }

      this.buildProxyGenerateImageEndpoint(runtime.provider_url);
      return {
        connection_mode: 'cloud_run_proxy',
        provider_url: runtime.provider_url,
        project_id: runtime.project_id,
        location: runtime.location || 'asia-southeast1',
        model,
        auth_mode: 'proxy',
      };
    }

    if (!runtime.project_id) {
      throw new BadRequestException('ยังไม่ได้ตั้งค่า Project ID สำหรับ Vertex AI');
    }

    if (apiKey) {
      return {
        connection_mode: 'api_key',
        provider_url: runtime.provider_url,
        project_id: runtime.project_id,
        location: runtime.location || 'global',
        model,
        auth_mode: 'api_key',
        api_key: apiKey,
      };
    }

    const accessToken = await this.getGoogleAccessToken().catch(() => '');
    if (!accessToken) {
      throw new BadRequestException('ยังไม่ได้ตั้งค่า Google API Key และไม่พบ Application Default Credentials (ADC)');
    }

    return {
      connection_mode: 'api_key',
      provider_url: runtime.provider_url,
      project_id: runtime.project_id,
      location: runtime.location || 'global',
      model,
      auth_mode: 'adc',
    };
  }

  private buildVertexGenerateContentEndpoint(
    runtime: { project_id: string; model: string; auth_mode: 'api_key' | 'adc'; api_key?: string },
    modelLocation: string,
  ) {
    const base = `https://aiplatform.googleapis.com/v1/projects/${encodeURIComponent(runtime.project_id)}/locations/${encodeURIComponent(modelLocation)}/publishers/google/models/${encodeURIComponent(runtime.model)}:generateContent`;
    return runtime.auth_mode === 'api_key' && runtime.api_key
      ? `${base}?key=${encodeURIComponent(runtime.api_key)}`
      : base;
  }

  private buildVertexPredictEndpoint(runtime: {
    project_id: string;
    location: string;
    model: string;
    auth_mode: 'api_key' | 'adc';
    api_key?: string;
  }) {
    const base = `https://${runtime.location}-aiplatform.googleapis.com/v1/projects/${encodeURIComponent(runtime.project_id)}/locations/${encodeURIComponent(runtime.location)}/publishers/google/models/${encodeURIComponent(runtime.model)}:predict`;
    return runtime.auth_mode === 'api_key' && runtime.api_key
      ? `${base}?key=${encodeURIComponent(runtime.api_key)}`
      : base;
  }

  private buildProxyGenerateImageEndpoint(providerUrl: string) {
    try {
      const endpoint = new URL(`${providerUrl.trim().replace(/\/+$/, '')}/generate-image`);
      if (!['http:', 'https:'].includes(endpoint.protocol)) {
        throw new Error('invalid protocol');
      }
      return endpoint.toString();
    } catch {
      throw new BadRequestException('Provider URL ของ Cloud Run proxy ไม่ถูกต้อง');
    }
  }

  private buildProxyRequestInit(
    payload: { prompt: string; aspectRatio: string; sampleCount: number; model: string },
    requestId: string,
  ): RequestInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-NEX-Request-Id': requestId,
    };
    const proxySecret = process.env.NEX_VERTEX_PROXY_SECRET?.trim();
    if (proxySecret) {
      headers['X-NEX-PROXY-SECRET'] = proxySecret;
    }

    return {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    };
  }

  private resolveImageEditModel(requestedModel: string) {
    if (this.isGeminiImageModel(requestedModel)) {
      return requestedModel;
    }

    const editModel = process.env.GOOGLE_IMAGE_EDIT_MODEL || process.env.GOOGLE_IMAGE_MODEL || '';
    if (this.isGeminiImageModel(editModel)) {
      return editModel;
    }

    return 'gemini-3.1-flash-image-preview';
  }

  private isGeminiImageModel(model: string) {
    return model.toLowerCase().includes('gemini');
  }

  private safeLogUrl(rawUrl: string) {
    try {
      const url = new URL(rawUrl);
      return `${url.origin}${url.pathname}`;
    } catch {
      return 'invalid-url';
    }
  }

  private createRequestId() {
    return `img_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private ensureDirectImageRuntime(runtime: GoogleImageRuntimeConfig): DirectImageRuntimeConfig {
    if (runtime.auth_mode === 'proxy') {
      throw new BadRequestException('Cloud Run proxy ยังไม่รองรับ image-edit flow');
    }

    return runtime;
  }

  private async buildVertexRequestInit(
    runtime: { auth_mode: 'api_key' | 'adc' },
    payload: Record<string, any>,
  ): Promise<RequestInit> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (runtime.auth_mode === 'adc') {
      headers.Authorization = `Bearer ${await this.getGoogleAccessToken()}`;
    }

    return {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    };
  }

  private async getGoogleAccessToken(): Promise<string> {
    const client = await this.createGoogleAuth().getClient();
    const token = await client.getAccessToken();
    const accessToken = typeof token === 'string' ? token : token?.token;

    if (!accessToken) {
      throw new BadRequestException('ไม่สามารถดึง access token จาก Application Default Credentials (ADC) ได้');
    }

    return accessToken;
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
      this.logger.warn('GOOGLE_SERVICE_ACCOUNT_JSON is not valid JSON, fallback to default ADC');
      return new GoogleAuth({ scopes });
    }
  }

  private inferMimeTypeFromSource(source: string, fallback = 'image/png') {
    const lower = source.toLowerCase();
    if (lower.includes('.jpg') || lower.includes('.jpeg')) return 'image/jpeg';
    if (lower.includes('.webp')) return 'image/webp';
    if (lower.includes('.gif')) return 'image/gif';
    if (lower.includes('.png')) return 'image/png';
    return fallback;
  }

  private async resolveImageToBuffer(source: string): Promise<{ buffer: Buffer; mimeType: string }> {
    const raw = (source || '').trim();
    if (!raw) {
      throw new BadRequestException('ไม่พบไฟล์รูปอ้างอิงที่ต้องใช้สำหรับสร้างภาพ');
    }

    if (raw.startsWith('data:image/')) {
      const [header, data] = raw.split(',', 2);
      const mimeMatch = header.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64$/);
      if (!mimeMatch || !data) {
        throw new BadRequestException('data image ไม่ถูกต้อง');
      }
      return {
        buffer: Buffer.from(data, 'base64'),
        mimeType: mimeMatch[1],
      };
    }

    if (raw.startsWith('/api/uploads/')) {
      const relative = raw.replace('/api/uploads/', '');
      const filePath = join(process.cwd(), 'uploads', relative);
      return {
        buffer: await readFile(filePath),
        mimeType: this.inferMimeTypeFromSource(filePath),
      };
    }

    const candidates: string[] = [];
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      candidates.push(raw);
    } else if (raw.startsWith('/')) {
      candidates.push(`http://web:3000${raw}`);
      candidates.push(`http://localhost:3000${raw}`);
      if (process.env.PUBLIC_APP_URL) {
        candidates.push(`${process.env.PUBLIC_APP_URL.replace(/\/$/, '')}${raw}`);
      }
      candidates.push(`https://nexsolution.cloud${raw}`);
    }

    for (const url of candidates) {
      try {
        const res = await fetch(url);
        if (!res.ok) continue;
        const arr = await res.arrayBuffer();
        const contentType = res.headers.get('content-type') || this.inferMimeTypeFromSource(url);
        return {
          buffer: Buffer.from(arr),
          mimeType: contentType.split(';')[0]?.trim() || 'image/png',
        };
      } catch (error) {
        this.logger.warn(`fetch image failed: ${url} (${error instanceof Error ? error.message : 'unknown'})`);
      }
    }

    throw new BadRequestException(`ไม่สามารถอ่านรูปจาก source: ${raw}`);
  }

  private async resolveImageToInlineData(source: string): Promise<{ data: string; mimeType: string }> {
    const { buffer, mimeType } = await this.resolveImageToBuffer(source);
    return { data: buffer.toString('base64'), mimeType };
  }

  private async resolveFaceFocusedInlineData(source: string): Promise<{ data: string; mimeType: string }> {
    const { buffer } = await this.resolveImageToBuffer(source);
    const focused = await this.createFaceFocusedReference(buffer);
    return {
      data: focused.toString('base64'),
      mimeType: 'image/png',
    };
  }

  private async createFaceFocusedReference(source: Buffer): Promise<Buffer> {
    const image = sharp(source, { failOn: 'none' }).rotate();
    const metadata = await image.metadata();
    const width = metadata.width || 0;
    const height = metadata.height || 0;

    if (!width || !height) {
      return image.png().toBuffer();
    }

    const cropWidth = Math.max(320, Math.min(width, Math.round(width * 0.72)));
    const cropHeight = Math.max(320, Math.min(height, Math.round(height * 0.72)));
    const left = Math.max(0, Math.round((width - cropWidth) / 2));
    const preferredTop = Math.round(height * 0.08);
    const maxTop = Math.max(0, height - cropHeight);
    const top = Math.min(maxTop, Math.max(0, preferredTop));

    return sharp(source, { failOn: 'none' })
      .rotate()
      .extract({
        left,
        top,
        width: Math.min(cropWidth, width - left),
        height: Math.min(cropHeight, height - top),
      })
      .resize(1024, 1024, {
        fit: 'cover',
        position: 'center',
      })
      .png()
      .toBuffer();
  }

  private async resolveImageToBase64(source: string): Promise<string> {
    const { data } = await this.resolveImageToInlineData(source);
    return data;
  }

  private async fetchImageWithRetry(url: string, init: RequestInit, operationLabel: string): Promise<Response> {
    let lastResponse: Response | null = null;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= this.imageRetryAttempts; attempt += 1) {
      try {
        const response = await fetch(url, {
          ...init,
          signal: AbortSignal.timeout(this.imageRequestTimeoutMs),
        });

        if (!this.shouldRetryImageResponse(response.status) || attempt === this.imageRetryAttempts) {
          return response;
        }

        lastResponse = response;
        const delayMs = this.getRetryDelayMs(attempt, response);
        this.logger.warn(
          `AI image request retrying (${operationLabel}) after status ${response.status}. Attempt ${attempt}/${this.imageRetryAttempts}, waiting ${delayMs}ms`,
        );
        await this.sleep(delayMs);
      } catch (error) {
        lastError = error;
        if (attempt === this.imageRetryAttempts) {
          break;
        }

        const delayMs = this.getRetryDelayMs(attempt);
        this.logger.warn(
          `AI image request network retry (${operationLabel}). Attempt ${attempt}/${this.imageRetryAttempts}, waiting ${delayMs}ms: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
        await this.sleep(delayMs);
      }
    }

    if (lastResponse) {
      return lastResponse;
    }

    throw lastError instanceof Error ? lastError : new Error(`AI image request failed: ${operationLabel}`);
  }

  private shouldRetryImageResponse(status: number) {
    return status === 429 || status === 500 || status === 502 || status === 503 || status === 504;
  }

  private getRetryDelayMs(attempt: number, response?: Response) {
    const retryAfter = response?.headers?.get('retry-after');
    const parsedRetryAfter = retryAfter ? Number(retryAfter) : NaN;
    if (Number.isFinite(parsedRetryAfter) && parsedRetryAfter > 0) {
      return parsedRetryAfter * 1000;
    }

    return this.imageRetryBaseDelayMs * Math.max(1, 2 ** (attempt - 1));
  }

  private sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
