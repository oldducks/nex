import { BadRequestException, ForbiddenException, Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Form } from './entities/form.entity';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { FormSubmission } from './entities/form-submission.entity';
import { LeadsService } from '../leads/leads.service';

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Form)
    private readonly formsRepository: Repository<Form>,
    @InjectRepository(FormSubmission)
    private readonly submissionsRepository: Repository<FormSubmission>,
    @Inject(forwardRef(() => LeadsService))
    private readonly leadsService: LeadsService,
  ) {}

  async create(ownerId: number, dto: CreateFormDto) {
    const form = this.formsRepository.create({
      owner_id: ownerId,
      ...dto,
    });
    return this.formsRepository.save(form);
  }

  async findAll(ownerId: number) {
    return this.formsRepository.find({
      where: { owner_id: ownerId },
      order: { created_at: 'DESC' },
    });
  }

  /**
   * Public read-only access for a form definition.
   * ใช้สำหรับหน้า public form (ไม่ต้องล็อกอิน) เช่นจาก QR Code
   */
  async getPublicForm(id: number) {
    const form = await this.formsRepository.findOne({
      where: { id, is_active: true },
    });
    if (!form) {
      throw new NotFoundException('Form not found or inactive');
    }

    // ซ่อน owner_id ออกจากผลลัพธ์ public เพื่อความปลอดภัย
    const { owner_id, ...rest } = form as any;
    return rest;
  }

  async findOne(id: number, ownerId: number) {
    const form = await this.formsRepository.findOne({ where: { id } });
    if (!form) {
      throw new NotFoundException('Form not found');
    }
    if (form.owner_id !== ownerId) {
      throw new ForbiddenException('You do not have access to this form');
    }
    return form;
  }

  async update(id: number, ownerId: number, dto: UpdateFormDto) {
    const form = await this.findOne(id, ownerId);
    this.formsRepository.merge(form, dto);
    return this.formsRepository.save(form);
  }

  async remove(id: number, ownerId: number) {
    const form = await this.findOne(id, ownerId);
    await this.formsRepository.remove(form);
    return { success: true };
  }

  // ---------- Submissions ----------

  async createSubmissionPublic(formId: number, payload: { data: Record<string, any>; source?: any }) {
    // 如果 data 为空对象，则认为是无效提交，直接抛出错误，避免产生空记录
    if (!payload.data || Object.keys(payload.data).length === 0) {
      throw new BadRequestException('Submission data cannot be empty');
    }

    const form = await this.formsRepository.findOne({ where: { id: formId, is_active: true } });
    if (!form) {
      throw new NotFoundException('Form not found or inactive');
    }

    const submission = this.submissionsRepository.create({
      form_id: form.id,
      owner_id: form.owner_id,
      data: payload.data,
      source: payload.source || null,
    });
    await this.submissionsRepository.save(submission);

    // บันทึกลงในระบบ Leads ของ Platform
    try {
      // พยายามแมพข้อมูลจาก data เข้าสู่โครงสร้าง Lead
      const data = payload.data || {};
      const leadData: any = {
        name: data.name || data.fullname || data.customer_name || '',
        email: data.email || data.customer_email || '',
        phone: data.phone || data.telephone || data.tel || '',
        occupation: data.occupation || data.company || '',
        message: JSON.stringify(data), // เก็บข้อมูลทั้งหมดไว้ใน message ในรูปแบบ JSON
        pdpa_consent: true,
        source_type: 'form',
        source_id: form.id,
        source_url: payload.source?.referrer || '',
      };

      await this.leadsService.create(form.owner_id, leadData);
    } catch (error) {
      console.error('Failed to sync form submission to leads:', error);
      // ไม่ throw error เพื่อไม่ให้การส่งฟอร์มหลักล้มเหลว
    }

    return { success: true };
  }

  async listSubmissions(formId: number, ownerId: number) {
    // ensure ownership
    await this.findOne(formId, ownerId);
    return this.submissionsRepository.find({
      where: { form_id: formId, owner_id: ownerId },
      order: { created_at: 'DESC' },
    });
  }

  async getSubmissionsCsv(formId: number, ownerId: number): Promise<string> {
    const submissions = await this.listSubmissions(formId, ownerId);
    const header = ['id', 'created_at', 'data', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'referrer'];

    const rows = submissions.map((s) => {
      const src = s.source || {};
      return [
        s.id,
        s.created_at ? new Date(s.created_at).toISOString() : '',
        `"${JSON.stringify(s.data || {}).replace(/"/g, '""')}"`,
        `"${(src.utm_source || '').replace(/"/g, '""')}"`,
        `"${(src.utm_medium || '').replace(/"/g, '""')}"`,
        `"${(src.utm_campaign || '').replace(/"/g, '""')}"`,
        `"${(src.utm_content || '').replace(/"/g, '""')}"`,
        `"${(src.referrer || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    return [header.join(','), ...rows].join('\n');
  }
}

