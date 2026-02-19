"use client";

import { useEffect, useRef, useState } from 'react';

interface VideoEmbedProps {
  url: string;
  autoplay?: boolean;
}

export function VideoEmbed({ url, autoplay = false }: VideoEmbedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Use Intersection Observer for scroll-based autoplay
  useEffect(() => {
    // Only set up observer if autoplay is enabled and it's a direct file (videoRef exists)
    if (!autoplay || !videoRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            videoRef.current?.play().catch(e => console.log('Autoplay blocked:', e));
            setIsPlaying(true);
          } else {
            videoRef.current?.pause();
            setIsPlaying(false);
          }
        });
      },
      { threshold: 0.5 } // 50% visible
    );

    observer.observe(videoRef.current);

    return () => {
      observer.disconnect();
    };
  }, [autoplay, url]);

  if (!url) return null;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  // Helper to get full URL
  const getFullUrl = (path: string) => {
    if (path.startsWith('http')) return path;
    if (path.startsWith('/uploads')) return `${API_URL}${path}`;
    return path;
  };

  let embedUrl = "";
  let isDirectFile = false;
  
  // YouTube 
  const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
  if (ytMatch) {
    const id = ytMatch[1].split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${id}?autoplay=${autoplay ? 1 : 0}&mute=${autoplay ? 1 : 0}`;
  } else {
      // Vimeo
      const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(.+)/);
      if (vimeoMatch) {
        embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=${autoplay ? 1 : 0}&muted=${autoplay ? 1 : 0}`;
      } else {
        // Assume direct file if not YouTube/Vimeo
        isDirectFile = true;
      }
  }

  if (isDirectFile) {
      return (
        <div className="relative w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black">
            <video
                ref={videoRef}
                src={getFullUrl(url)}
                muted={autoplay} // Required for autoplay
                loop
                playsInline
                controls
                className="w-full h-full object-cover"
            />
        </div>
      );
  }

  if (!embedUrl) return null;

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl bg-black">
      <iframe
        src={embedUrl}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
  );
}
