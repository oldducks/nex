"use client";

interface VideoEmbedProps {
  url: string;
}

export function VideoEmbed({ url }: VideoEmbedProps) {
  if (!url) return null;

  let embedUrl = "";
  
  // YouTube 
  const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(.+)/);
  if (ytMatch) {
    const id = ytMatch[1].split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${id}`;
  }

  // Vimeo
  const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(.+)/);
  if (vimeoMatch) {
    embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
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
