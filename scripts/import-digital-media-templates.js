#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
function loadPgClient() {
  const candidates = [
    path.resolve(__dirname, '../backend/node_modules/pg'),
    '/app/node_modules/pg',
    'pg',
  ];

  for (const candidate of candidates) {
    try {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      return require(candidate).Client;
    } catch (error) {
      if (candidate === candidates[candidates.length - 1]) {
        throw error;
      }
    }
  }

  throw new Error('Unable to load pg client');
}

const Client = loadPgClient();

function slugify(input, fallback = 'template') {
  const value = String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 180);

  return value || fallback;
}

function slugifyWithoutFallback(input) {
  return String(input || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-')
    .slice(0, 180);
}

function parseCsv(content) {
  const rows = [];
  let row = [];
  let value = '';
  let inQuotes = false;

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i];
    const next = content[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(value);
      value = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') {
        i += 1;
      }

      if (value.length > 0 || row.length > 0) {
        row.push(value);
        rows.push(row);
        row = [];
        value = '';
      }
      continue;
    }

    value += char;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  if (rows.length === 0) {
    return [];
  }

  const headers = rows[0].map((item) => item.trim());
  return rows.slice(1).filter((items) => items.some((item) => String(item || '').trim())).map((items) => {
    const entry = {};
    headers.forEach((header, index) => {
      entry[header] = items[index] ?? '';
    });
    return entry;
  });
}

function defaultOptionsForField(field) {
  const key = String(field.field_key || '').replace(/^\{+|\}+$/g, '').trim();
  if (field.field_type === 'select' && key === 'aspect_ratio') {
    return [
      { label: '1:1', value: '1:1' },
      { label: '4:5', value: '4:5' },
      { label: '9:16', value: '9:16' },
    ];
  }
  return [];
}

async function ensureCategory(client, name) {
  const trimmedName = String(name || '').trim();
  if (!trimmedName) {
    throw new Error('CSV row is missing category/category_name');
  }

  const slugCandidate = slugifyWithoutFallback(trimmedName);
  const existing = await client.query(
    `SELECT id, name, slug
     FROM categories
     WHERE LOWER(name) = LOWER($1)
     ORDER BY id ASC
     LIMIT 1`,
    [trimmedName],
  );

  if (existing.rows[0]) {
    return existing.rows[0];
  }

  if (slugCandidate) {
    const existingBySlug = await client.query(
      `SELECT id, name, slug
       FROM categories
       WHERE slug = $1
       ORDER BY id ASC
       LIMIT 1`,
      [slugCandidate],
    );

    if (existingBySlug.rows[0]) {
      return existingBySlug.rows[0];
    }
  }

  const baseSlug = slugCandidate || 'category';
  let candidate = baseSlug;
  let suffix = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const duplicate = await client.query('SELECT id FROM categories WHERE slug = $1 LIMIT 1', [candidate]);
    if (!duplicate.rows[0]) {
      break;
    }
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const nextSortOrderResult = await client.query('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort_order FROM categories');
  const sortOrder = Number(nextSortOrderResult.rows[0]?.next_sort_order || 1);

  const created = await client.query(
    `INSERT INTO categories (name, slug, sort_order, is_active)
     VALUES ($1, $2, $3, TRUE)
     RETURNING id, name, slug`,
    [trimmedName, candidate, sortOrder],
  );

  return created.rows[0];
}

async function ensureUniqueTemplateSlug(client, name, existingId) {
  const baseSlug = slugify(name, 'template');
  let candidate = baseSlug;
  let suffix = 2;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const duplicate = await client.query('SELECT id FROM templates WHERE slug = $1 LIMIT 1', [candidate]);
    if (!duplicate.rows[0] || Number(duplicate.rows[0].id) === Number(existingId)) {
      return candidate;
    }
    candidate = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function upsertTemplate(client, row) {
  const name = String(row.name || '').trim();
  if (!name) {
    throw new Error('CSV row is missing template name');
  }

  const categoryName = String(row.category_name || row.category || '').trim();
  const category = await ensureCategory(client, categoryName);
  const existing = await client.query('SELECT id, slug FROM templates WHERE LOWER(name) = LOWER($1) LIMIT 1', [name]);
  const templateId = existing.rows[0]?.id;
  const slug = await ensureUniqueTemplateSlug(client, name, templateId);

  const payload = {
    name,
    slug,
    categoryId: category.id,
    description: String(row.description || '').trim(),
    coverImageUrl: String(row.cover_image_url || '').trim(),
    promptTemplate: String(row.prompt_template || '').trim(),
    negativePrompt: String(row.negative_prompt || '').trim(),
    stylePreset: String(row.style_preset || '').trim() || 'standard',
    aspectRatio: String(row.aspect_ratio || '').trim() || '1:1',
    status: String(row.status || '').trim() || 'active',
  };

  let finalId;
  if (templateId) {
    const currentTemplate = await client.query('SELECT cover_image_url FROM templates WHERE id = $1 LIMIT 1', [templateId]);
    const preservedCoverImageUrl =
      payload.coverImageUrl || String(currentTemplate.rows[0]?.cover_image_url || '').trim();

    const updated = await client.query(
      `UPDATE templates
       SET name = $1,
           slug = $2,
           category_id = $3,
           description = $4,
           cover_image_url = $5,
           prompt_template = $6,
           negative_prompt = $7,
           style_preset = $8,
           aspect_ratio = $9,
           status = $10,
           updated_at = NOW()
       WHERE id = $11
       RETURNING id, slug`,
      [
        payload.name,
        payload.slug,
        payload.categoryId,
        payload.description,
        preservedCoverImageUrl,
        payload.promptTemplate,
        payload.negativePrompt,
        payload.stylePreset,
        payload.aspectRatio,
        payload.status,
        templateId,
      ],
    );
    finalId = updated.rows[0].id;
  } else {
    const nextSortOrderResult = await client.query('SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_sort_order FROM templates');
    const sortOrder = Number(nextSortOrderResult.rows[0]?.next_sort_order || 1);
    const inserted = await client.query(
      `INSERT INTO templates (
         name, slug, category_id, description, cover_image_url, enable_product_replace, product_mask_url,
         prompt_template, negative_prompt, style_preset, aspect_ratio, status, sort_order
       ) VALUES ($1, $2, $3, $4, $5, FALSE, '', $6, $7, $8, $9, $10, $11)
       RETURNING id, slug`,
      [
        payload.name,
        payload.slug,
        payload.categoryId,
        payload.description,
        payload.coverImageUrl,
        payload.promptTemplate,
        payload.negativePrompt,
        payload.stylePreset,
        payload.aspectRatio,
        payload.status,
        sortOrder,
      ],
    );
    finalId = inserted.rows[0].id;
  }

  const fields = JSON.parse(String(row.fields_json || '[]'));
  await client.query('DELETE FROM template_fields WHERE template_id = $1', [finalId]);

  for (let index = 0; index < fields.length; index += 1) {
    const field = fields[index];
    await client.query(
      `INSERT INTO template_fields (
         template_id, field_key, field_label, field_type, placeholder, help_text,
         is_required, default_value, options_json, sort_order
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)`,
      [
        finalId,
        String(field.field_key || '').replace(/^\{+|\}+$/g, '').trim(),
        String(field.field_label || '').trim(),
        String(field.field_type || 'text').trim(),
        String(field.placeholder || '').trim(),
        String(field.help_text || '').trim(),
        Boolean(field.is_required),
        String(field.default_value || '').trim(),
        JSON.stringify(
          Array.isArray(field.options_json) && field.options_json.length > 0
            ? field.options_json
            : defaultOptionsForField(field),
        ),
        Number(field.sort_order || index + 1),
      ],
    );
  }

  return { id: finalId, slug, category: category.name };
}

async function main() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    throw new Error('Usage: node scripts/import-digital-media-templates.js <csv-file>');
  }

  const resolvedPath = path.resolve(process.cwd(), inputPath);
  const csvContent = fs.readFileSync(resolvedPath, 'utf8');
  const rows = parseCsv(csvContent);

  if (rows.length === 0) {
    throw new Error(`No CSV rows found in ${resolvedPath}`);
  }

  const client = new Client({
    connectionString:
      process.env.DATABASE_URL || 'postgres://admin:secure_password@127.0.0.1:5432/namecard_platform',
  });

  await client.connect();
  try {
    await client.query('BEGIN');
    const results = [];
    for (const row of rows) {
      // eslint-disable-next-line no-await-in-loop
      const result = await upsertTemplate(client, row);
      results.push(result);
    }
    await client.query('COMMIT');

    console.log(`Imported ${results.length} templates from ${path.basename(resolvedPath)}`);
    results.forEach((item) => {
      console.log(`- ${item.slug} (${item.category})`);
    });
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
