/**
 * Convert YouTube/Vimeo URL to embed URL
 * Supports:
 * - youtube.com/watch?v=VIDEO_ID
 * - youtu.be/VIDEO_ID
 * - youtube.com/embed/VIDEO_ID
 * - youtube.com/shorts/VIDEO_ID
 * - vimeo.com/VIDEO_ID
 */
export function getEmbedUrl(url: string | undefined | null): string {
  if (!url) return '';

  // YouTube patterns
  const ytPatterns = [
    // Standard watch URL: youtube.com/watch?v=VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
    // Short URL: youtu.be/VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
    // Embed URL (already correct): youtube.com/embed/VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/,
    // Shorts: youtube.com/shorts/VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/,
    // Live: youtube.com/live/VIDEO_ID
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/live\/([a-zA-Z0-9_-]+)/,
  ];

  for (const pattern of ytPatterns) {
    const match = url.match(pattern);
    if (match) {
      return `https://www.youtube.com/embed/${match[1]}?feature=oembed&autoplay=0&mute=0`;
    }
  }

  // Vimeo pattern
  const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Return original URL if no match (might be direct video file)
  return url;
}

/**
 * Check if URL is a YouTube or Vimeo URL
 */
export function isEmbedableVideo(url: string | undefined | null): boolean {
  if (!url) return false;
  
  const patterns = [
    /(?:https?:\/\/)?(?:www\.)?youtube\.com/,
    /(?:https?:\/\/)?(?:www\.)?youtu\.be/,
    /(?:https?:\/\/)?(?:www\.)?vimeo\.com/,
  ];
  
  return patterns.some(pattern => pattern.test(url));
}
