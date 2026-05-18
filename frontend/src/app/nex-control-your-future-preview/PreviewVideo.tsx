'use client';

import { Play } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { logMarketingAnalyticsEvent } from '@/lib/marketingAnalytics';

interface PreviewVideoProps {
  src: string;
  className?: string;
  pageKey: string;
  videoKey?: string;
  autoPlay?: boolean;
}

export default function PreviewVideo({
  src,
  className,
  pageKey,
  videoKey = 'hero-preview',
  autoPlay = false,
}: PreviewVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const hasLoggedImpression = useRef(false);
  const startModeRef = useRef<'manual' | 'autoplay' | 'unknown'>(autoPlay ? 'autoplay' : 'unknown');

  useEffect(() => {
    if (hasLoggedImpression.current) return;
    hasLoggedImpression.current = true;
    void logMarketingAnalyticsEvent({
      pageKey,
      eventType: 'VIDEO_IMPRESSION',
      videoKey,
    });
  }, [pageKey, videoKey]);

  const handlePlayClick = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      startModeRef.current = 'manual';
      setHasStarted(true);
      await video.play();
    } catch {
      setHasStarted(false);
    }
  };

  return (
    <div className="relative">
      <video
        ref={videoRef}
        src={src}
        autoPlay={autoPlay}
        muted={autoPlay}
        controls={hasStarted}
        playsInline
        preload="metadata"
        className={className}
        onPlay={() => {
          setHasStarted(true);
          const eventType = startModeRef.current === 'autoplay' ? 'VIDEO_AUTOPLAY' : 'VIDEO_PLAY';
          startModeRef.current = 'unknown';
          void logMarketingAnalyticsEvent({
            pageKey,
            eventType,
            videoKey,
          });
        }}
        onEnded={() => {
          void logMarketingAnalyticsEvent({
            pageKey,
            eventType: 'VIDEO_COMPLETE',
            videoKey,
          });
        }}
      >
        Your browser does not support the video tag.
      </video>

      {!hasStarted && (
        <button
          type="button"
          aria-label="Play video"
          onClick={handlePlayClick}
          className="absolute inset-0 z-10 flex items-center justify-center bg-transparent"
        >
          <span className="flex h-24 w-24 items-center justify-center rounded-full bg-white/90 text-[#111827] shadow-[0_12px_40px_rgba(15,23,42,0.28)] transition hover:scale-105">
            <Play className="ml-1 h-10 w-10 fill-current" />
          </span>
        </button>
      )}
    </div>
  );
}
