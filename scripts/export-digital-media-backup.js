#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

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

function csvEscape(value) {
  const stringValue = String(value ?? '');
  if (/[",\n\r]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

function tsvEscape(value) {
  return String(value ?? '').replace(/\t/g, ' ').replace(/\r?\n/g, ' ');
}

function parseDataUrl(dataUrl) {
  const match = String(dataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Unsupported cover_image_url format. Expected base64 data URL.');
  }

  const mimeType = match[1];
  const base64 = match[2];
  const extensionMap = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/webp': 'webp',
  };

  return {
    buffer: Buffer.from(base64, 'base64'),
    extension: extensionMap[mimeType] || 'bin',
  };
}

async function main() {
  const explicitDate = process.argv[2];
  const today = new Date().toISOString().slice(0, 10);
  const exportDate = explicitDate || today;

  const projectRoot = path.resolve(__dirname, '..');
  const exportDir = path.join(projectRoot, 'exports', `digital-media-backup-${exportDate}`);
  const csvDir = path.join(exportDir, 'csv');
  const coversDir = path.join(exportDir, 'covers');
  const metadataDir = path.join(exportDir, 'metadata');
  const archivePath = path.join(projectRoot, 'exports', `digital-media-backup-${exportDate}.tar.gz`);

  fs.rmSync(exportDir, { recursive: true, force: true });
  fs.mkdirSync(csvDir, { recursive: true });
  fs.mkdirSync(coversDir, { recursive: true });
  fs.mkdirSync(metadataDir, { recursive: true });

  const client = new Client({
    connectionString:
      process.env.DATABASE_URL || 'postgres://admin:secure_password@127.0.0.1:5432/namecard_platform',
  });

  await client.connect();

  try {
    const csvFiles = fs
      .readdirSync(__dirname)
      .filter((file) => file.endsWith('-templates.csv'))
      .sort((left, right) => left.localeCompare(right));

    const templateNames = [];
    for (const file of csvFiles) {
      const csvContent = fs.readFileSync(path.join(__dirname, file), 'utf8');
      const rows = parseCsv(csvContent);
      rows.forEach((row) => {
        const name = String(row.name || '').trim();
        if (name) {
          templateNames.push(name);
        }
      });
    }

    const templateResult = await client.query(
      `SELECT
         t.id,
         t.slug,
         t.name,
         t.category_id,
         c.name AS category_name,
         t.cover_image_url
       FROM templates t
       JOIN categories c ON c.id = t.category_id
       WHERE COALESCE(TRIM(t.cover_image_url), '') <> ''
         AND LOWER(t.name) = ANY($1::text[])
       ORDER BY t.id ASC`,
      [templateNames.map((name) => name.toLowerCase())],
    );

    const templates = templateResult.rows;

    if (templates.length !== templateNames.length) {
      throw new Error(`Expected ${templateNames.length} imported templates but found ${templates.length} with covers in database.`);
    }

    const templateCsvLines = [
      'id,slug,name,category_name,cover_len',
      ...templates.map((template) =>
        [
          template.id,
          csvEscape(template.slug),
          csvEscape(template.name),
          csvEscape(template.category_name),
          String(template.cover_image_url.length),
        ].join(','),
      ),
      `(${templates.length} rows)`,
      '',
    ];
    fs.writeFileSync(path.join(metadataDir, 'templates.csv'), templateCsvLines.join('\n'), 'utf8');

    const coverTsvLines = [
      'id\tslug\tname\tcategory_id\tcover_image_url',
      ...templates.map((template) =>
        [
          template.id,
          tsvEscape(template.slug),
          tsvEscape(template.name),
          template.category_id,
          tsvEscape(template.cover_image_url),
        ].join('\t'),
      ),
      `(${templates.length} rows)`,
      '',
    ];
    fs.writeFileSync(path.join(metadataDir, 'covers.tsv'), coverTsvLines.join('\n'), 'utf8');

    for (const template of templates) {
      const parsed = parseDataUrl(template.cover_image_url);
      const fileName = `${String(template.id).padStart(2, '0')}-${template.slug}.${parsed.extension}`;
      fs.writeFileSync(path.join(coversDir, fileName), parsed.buffer);
    }

    for (const file of csvFiles) {
      fs.copyFileSync(path.join(__dirname, file), path.join(csvDir, file));
    }

    fs.rmSync(archivePath, { force: true });
    execFileSync('tar', ['-czf', archivePath, '-C', path.dirname(exportDir), path.basename(exportDir)], {
      stdio: 'inherit',
    });

    console.log(`Exported ${templates.length} templates to ${path.relative(projectRoot, exportDir)}`);
    console.log(`Archive: ${path.relative(projectRoot, archivePath)}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
