import { DigitalMediaTemplateField } from '../entities/template-field.entity';

const TEMPLATE_TOKEN_REGEX = /\{([a-zA-Z0-9_\-]+)\}/g;

function normalizeFieldKey(fieldKey: unknown): string {
  return String(fieldKey ?? '')
    .trim()
    .replace(/^\{+/, '')
    .replace(/\}+$/, '')
    .trim();
}

function sanitizeValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value).replace(/\s+/g, ' ').trim();
    } catch {
      return '';
    }
  }
  return String(value)
    .replace(/[\u0000-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function buildPromptFromTemplate(
  promptTemplate: string,
  userInput: Record<string, any>,
  fields: DigitalMediaTemplateField[],
): string {
  const valueMap = new Map<string, string>();
  const normalizedInput = new Map<string, string>();

  for (const [rawKey, rawValue] of Object.entries(userInput || {})) {
    normalizedInput.set(normalizeFieldKey(rawKey), sanitizeValue(rawValue));
  }

  for (const field of fields) {
    const normalizedKey = normalizeFieldKey(field.field_key);
    const rawValue =
      userInput[field.field_key] ??
      userInput[normalizedKey] ??
      normalizedInput.get(normalizedKey) ??
      field.default_value ??
      '';
    valueMap.set(normalizedKey, sanitizeValue(rawValue));
  }

  return promptTemplate.replace(TEMPLATE_TOKEN_REGEX, (_, token: string) => {
    return valueMap.get(normalizeFieldKey(token)) ?? '';
  });
}

export function validateRequiredFields(
  input: Record<string, any>,
  fields: DigitalMediaTemplateField[],
): string[] {
  const missing: string[] = [];
  const normalizedInput = new Map<string, string>();

  for (const [rawKey, rawValue] of Object.entries(input || {})) {
    normalizedInput.set(normalizeFieldKey(rawKey), sanitizeValue(rawValue));
  }

  for (const field of fields) {
    if (!field.is_required) continue;
    const normalizedKey = normalizeFieldKey(field.field_key);
    const raw = input[field.field_key] ?? input[normalizedKey] ?? normalizedInput.get(normalizedKey);
    const normalized = sanitizeValue(raw);
    if (!normalized) {
      missing.push(field.field_label || field.field_key);
    }
  }
  return missing;
}
