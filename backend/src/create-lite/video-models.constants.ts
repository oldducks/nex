export const ALLOWED_VIDEO_MODELS = [
  'veo-3.1-generate-001',
  'veo-3.1-fast-generate-001',
  'veo-3.1-lite-generate-001',
  'veo-3.1-generate-preview',
] as const;

export const DEFAULT_VIDEO_MODEL = 'veo-3.1-generate-preview';

export function normalizeVideoModel(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function isAllowedVideoModel(model: string): boolean {
  return (ALLOWED_VIDEO_MODELS as readonly string[]).includes(model);
}
