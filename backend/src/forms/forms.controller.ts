import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Res } from '@nestjs/common';
import { FormsService } from './forms.service';
import { CreateFormDto } from './dto/create-form.dto';
import { UpdateFormDto } from './dto/update-form.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';

@UseGuards(JwtAuthGuard)
@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  create(@Request() req, @Body() dto: CreateFormDto) {
    return this.formsService.create(req.user.sub, dto);
  }

  @Get()
  findAll(@Request() req) {
    return this.formsService.findAll(req.user.sub);
  }

  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.formsService.findOne(+id, req.user.sub);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() dto: UpdateFormDto) {
    return this.formsService.update(+id, req.user.sub, dto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.formsService.remove(+id, req.user.sub);
  }

  // ----- Submissions (protected owner endpoints) -----

  @Get(':id/submissions')
  listSubmissions(@Request() req, @Param('id') id: string) {
    return this.formsService.listSubmissions(+id, req.user.sub);
  }

  @Get(':id/submissions/export')
  async exportSubmissions(@Request() req, @Param('id') id: string, @Res() res: Response) {
    const csv = await this.formsService.getSubmissionsCsv(+id, req.user.sub);
    const filename = `form_${id}_submissions_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }
}

