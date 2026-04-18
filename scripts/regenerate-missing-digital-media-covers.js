#!/usr/bin/env node

const path = require('path');

async function bootstrap() {
  require('/app/node_modules/reflect-metadata');
  const { NestFactory } = require('/app/node_modules/@nestjs/core');
  const { AppModule } = require('/app/dist/app.module');
  const { DigitalMediaService } = require('/app/dist/digital-media/digital-media.service');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['error', 'warn'] });

  try {
    const digitalMediaService = app.get(DigitalMediaService);
    const templateRepository = digitalMediaService.templateRepository;

    const targetId = Number(process.argv[2] || 0);

    const templates = await templateRepository.find({
      relations: ['fields', 'category'],
      order: { id: 'ASC', fields: { sort_order: 'ASC', id: 'ASC' } },
    });

    const missingCoverTemplates = templates.filter((template) => {
      if (targetId && template.id !== targetId) return false;
      return !String(template.cover_image_url || '').trim();
    });

    if (missingCoverTemplates.length === 0) {
      console.log(targetId ? `Template ${targetId} already has a cover or was not found.` : 'No templates missing covers.');
      return;
    }

    console.log(`Found ${missingCoverTemplates.length} templates without covers.`);

    for (const template of missingCoverTemplates) {
      console.log(`Generating cover for #${template.id} ${template.slug}...`);

      try {
        const result = await digitalMediaService.generateMockupPreview({
          name: template.name,
          slug: template.slug,
          category_id: template.category_id,
          category_name: template.category?.name || '',
          description: template.description || '',
          cover_image_url: template.cover_image_url || '',
          enable_product_replace: Boolean(template.enable_product_replace),
          product_mask_url: template.product_mask_url || '',
          prompt_template: template.prompt_template,
          negative_prompt: template.negative_prompt || '',
          style_preset: template.style_preset || 'standard',
          aspect_ratio: template.aspect_ratio || '1:1',
          status: template.status || 'draft',
          sort_order: template.sort_order || 0,
          fields: (template.fields || []).map((field) => ({
            id: field.id,
            field_key: field.field_key,
            field_label: field.field_label,
            field_type: field.field_type,
            placeholder: field.placeholder || '',
            help_text: field.help_text || '',
            is_required: Boolean(field.is_required),
            default_value: field.default_value || '',
            options_json: field.options_json || [],
            sort_order: field.sort_order || 0,
          })),
        });

        if (!result?.output_image_url) {
          throw new Error('No output_image_url returned');
        }

        await templateRepository.update(
          { id: template.id },
          {
            cover_image_url: result.output_image_url,
          },
        );

        console.log(`Saved cover for #${template.id} ${template.slug}`);
      } catch (error) {
        console.error(
          `Failed for #${template.id} ${template.slug}: ${error instanceof Error ? error.message : 'unknown error'}`,
        );
      }
    }
  } finally {
    void app.close().catch(() => undefined);
  }
}

bootstrap()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
