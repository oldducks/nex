import { Injectable, NotFoundException } from '@nestjs/common';

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

  generateCopySuggestion(input: CreateLiteCopyInput): CreateLiteCopyResult {
    const template = input.templateId ? this.templates.find(t => t.id === input.templateId) : null;
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
        {
          title: `ดีลลับ! ${baseTitle || 'ห้ามพลาด'}`,
          subtitle: `${baseSubtitle || 'สิทธิพิเศษสำหรับสมาชิก'} NEX Solution`,
          cta: baseCta || 'ดูดีลลับ',
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
        {
          title: `ยกระดับภาพลักษณ์ด้วย ${baseTitle || 'ผลิตภัณฑ์ของเรา'}`,
          subtitle: `ดีไซน์มินิมอล ${baseSubtitle || 'ตอบโจทย์ทุกไลฟ์สไตล์'}`,
          cta: baseCta || 'จองตอนนี้',
        },
      ],
      event: [
        {
          title: `เตรียมตัวพบกับ ${baseTitle || 'อีเวนต์สุดพิเศษ'}`,
          subtitle: `สอนสดโดยผู้เชี่ยวชาญ ${baseSubtitle || 'เน้นลงมือทำจริง'}`,
          cta: baseCta || 'ลงทะเบียนฟรี',
        },
        {
          title: `Networking Day: ${baseTitle || 'พบปะนักธุรกิจ'}`,
          subtitle: `ขยายโอกาสทางธุรกิจ ${baseSubtitle || 'และสร้างพาร์ทเนอร์'}`,
          cta: baseCta || 'เข้าร่วมกลุ่ม',
        },
        {
          title: `โอกาสสุดท้าย! ${baseTitle || 'จองบัตรด่วน'}`,
          subtitle: `${baseSubtitle || 'ก่อนที่นั่งจะเต็ม'} (เหลือเพียง 5 ที่สุดท้าย)`,
          cta: baseCta || 'จองเลย',
        },
      ],
      social: [
        {
          title: baseTitle || 'เปลี่ยนมุมมองชีวิต',
          subtitle: baseSubtitle || 'ความสำเร็จเริ่มต้นจากความกล้าที่จะแตกต่าง',
          cta: baseCta || 'อ่านต่อ',
        },
        {
          title: baseTitle || 'แชร์เทคนิคทำธุรกิจ',
          subtitle: baseSubtitle || 'สรุป 5 ขั้นตอนสู่เป้าหมายที่วัดผลได้จริง',
          cta: baseCta || 'บันทึกโพสต์',
        },
        {
          title: baseTitle || 'Lifestyle of NEX',
          subtitle: baseSubtitle || 'เบื้องหลังการทำงานและแรงบันดาลใจรายวัน',
          cta: baseCta || 'ติดตามเรา',
        },
      ],
    };

    const categoryOptions = options[category] || options.social;
    const randomIndex = Math.floor(Math.random() * categoryOptions.length);
    
    return categoryOptions[randomIndex];
  }
}
