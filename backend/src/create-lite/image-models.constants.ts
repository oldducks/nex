export const ALLOWED_IMAGE_MODELS = [
  'gemini-2.5-flash-image',
  'gemini-2.5-flash-image-preview',
  'gemini-3.1-flash-image-preview',
  'imagen-3.0-generate-002',
] as const;

export const DEFAULT_IMAGE_MODEL = 'gemini-2.5-flash-image';
export const DEFAULT_IMAGE_EDIT_MODEL = 'gemini-2.5-flash-image';

const LEGACY_IMAGE_MODEL_ALIASES = new Set<string>([]);

export function normalizeImageModel(model?: string | null): string {
  const value = typeof model === 'string' ? model.trim() : '';
  if (!value) return '';
  if (LEGACY_IMAGE_MODEL_ALIASES.has(value)) {
    return DEFAULT_IMAGE_MODEL;
  }
  return value;
}

export function isAllowedImageModel(model?: string | null): boolean {
  const normalized = normalizeImageModel(model);
  return Boolean(normalized) && (ALLOWED_IMAGE_MODELS as readonly string[]).includes(normalized);
}

export function resolveAllowedImageModel(model?: string | null, fallback: string = DEFAULT_IMAGE_MODEL): string {
  const normalized = normalizeImageModel(model);
  if (isAllowedImageModel(normalized)) {
    return normalized;
  }
  return fallback;
}
