'use client';

import { useEffect, useRef } from 'react';
import { logMarketingAnalyticsEvent } from '@/lib/marketingAnalytics';

interface MarketingPageTrackerProps {
  pageKey: string;
  metadata?: Record<string, any>;
}

export function MarketingPageTracker({ pageKey, metadata }: MarketingPageTrackerProps) {
  const hasLogged = useRef(false);

  useEffect(() => {
    if (hasLogged.current) return;
    hasLogged.current = true;
    void logMarketingAnalyticsEvent({
      pageKey,
      eventType: 'PAGE_VIEW',
      metadata,
    });
  }, [metadata, pageKey]);

  return null;
}
