import { Injectable, Logger, NotFoundException } from '@nestjs/common';

export interface CreateLiteTemplate {
  id: string;
  name: string;
  category: 'promotion' | 'product' | 'event' | 'social';
  description: string;
  width: number;
  height: number;
  previewGradient: string;
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

@Injectable()
export class CreateLiteService {
  private readonly logger = new Logger(CreateLiteService.name);

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
      const result = await this.generateWithOpenAi(input, fallback);
      if (result) return result;
    }

    if (process.env.GOOGLE_API_KEY) {
      const result = await this.generateWithGemini(input, fallback);
      if (result) return result;
    }

    if (process.env.ANTHROPIC_API_KEY) {
      const result = await this.generateWithAnthropic(input, fallback);
      if (result) return result;
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
}
