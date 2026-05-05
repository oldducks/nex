"use client";

import { useEffect, useRef, useState } from 'react';
import { getEmbedUrl, isEmbedableVideo } from '@/lib/videoUtils';

interface VideoEmbedProps {
  url: string;
  autoplay?: boolean;
}

export function VideoEmbed({ url, autoplay = false }: VideoEmbedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  // Helper to get full URL
  const getFullUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads')) return `${API_URL}${path}`;
    return path;
  };

  if (!url) return null;

  // Check if URL is YouTube or Vimeo
  const isEmbedable = isEmbedableVideo(url);
  
  if (!isEmbedable) {
    // Direct video file
    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black">
          <video
              ref={videoRef}
              src={getFullUrl(url)}
              autoPlay={false}
              muted={false}
              loop
              playsInline
              controls={true}
              className="w-full h-full object-cover"
          />
      </div>
    );
  }

  const embedUrl = getEmbedUrl(url);
  if (!embedUrl) return null;

  // Add autoplay params for YouTube/Vimeo - Force to 0 for sound
  const finalUrl = embedUrl.includes('?') 
    ? `${embedUrl}&autoplay=0&mute=0`
    : `${embedUrl}?autoplay=0&mute=0`;

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
      <iframe
        src={finalUrl}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
}
