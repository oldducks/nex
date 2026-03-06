import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormSubmissionDto } from './dto/create-form-submission.dto';
import { Request } from 'express';

@Controller('public/forms')
export class FormsPublicController {
  constructor(private readonly formsService: FormsService) {}

  // Public endpoint to fetch form definition for rendering (no auth)
  @Get(':id')
  getPublic(@Param('id') id: string) {
    return this.formsService.getPublicForm(+id);
  }

  // Public endpoint for submitting form data by form id
  @Post(':id/submit')
  submit(@Param('id') id: string, @Body() dto: CreateFormSubmissionDto, @Req() req: Request) {
    // 从 HTTP Referer 自动解析 UTM 参数，实现自动打标签（Auto Tagging）逻辑
    const referer = (req.headers.referer as string) || '';

    let utmFromReferer: Partial<CreateFormSubmissionDto['source']> = {};
    if (referer) {
      try {
        // 使用 URL 对象解析查询字符串，提取 utm_* 参数
        const url = new URL(referer);
        const params = url.searchParams;
        utmFromReferer = {
          utm_source: params.get('utm_source') || undefined,
          utm_medium: params.get('utm_medium') || undefined,
          utm_campaign: params.get('utm_campaign') || undefined,
          utm_content: params.get('utm_content') || undefined,
          // referrer 字段优先保留 body 中传入的值，否则回退到 HTTP Referer
          referrer: undefined,
        };
      } catch {
        // 如果 Referer 不是合法 URL，则忽略解析错误，继续处理
      }
    }

    // 合并来源信息：body 中显式传入的 source 优先，其次是从 Referer 推断的 utm
    const mergedSource = {
      ...(utmFromReferer || {}),
      ...(dto.source || {}),
      referrer: dto.source?.referrer || referer || undefined,
    };

    return this.formsService.createSubmissionPublic(+id, {
      data: dto.data,
      source: Object.keys(mergedSource).length > 0 ? mergedSource : undefined,
    });
  }
}

