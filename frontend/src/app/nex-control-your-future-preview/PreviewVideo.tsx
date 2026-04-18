'use client';

import { Play } from 'lucide-react';
import { useRef, useState } from 'react';

interface PreviewVideoProps {
  src: string;
  className?: string;
}

export default function PreviewVideo({ src, className }: PreviewVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasStarted, setHasStarted] = useState(false);

  const handlePlayClick = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
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
        controls={hasStarted}
        playsInline
        preload="metadata"
        className={className}
        onPlay={() => setHasStarted(true)}
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
