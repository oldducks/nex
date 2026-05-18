'use client';

import Cookies from 'js-cookie';

export type MarketingAnalyticsEvent =
  | 'PAGE_VIEW'
  | 'VIDEO_IMPRESSION'
  | 'VIDEO_PLAY'
  | 'VIDEO_AUTOPLAY'
  | 'VIDEO_COMPLETE';

interface LogMarketingAnalyticsEventInput {
  pageKey: string;
  eventType: MarketingAnalyticsEvent;
  videoKey?: string;
  metadata?: Record<string, any>;
}

export function getOrCreateMarketingVisitorId(): string {
  let visitorId = Cookies.get('vid');
  if (!visitorId) {
    visitorId = Math.random().toString(36).slice(2) + Date.now().toString(36);
    Cookies.set('vid', visitorId, { expires: 365 });
  }
  return visitorId;
}

export async function logMarketingAnalyticsEvent(input: LogMarketingAnalyticsEventInput) {
  const visitorId = getOrCreateMarketingVisitorId();

  try {
    await fetch('/api/analytics/marketing/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pageKey: input.pageKey,
        eventType: input.eventType,
        visitorId,
        videoKey: input.videoKey,
        metadata: input.metadata,
      }),
      keepalive: true,
    });
  } catch (error) {
    console.error('Marketing analytics error:', error);
  }
}
