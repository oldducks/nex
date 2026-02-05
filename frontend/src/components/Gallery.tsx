"use client";

import { useState } from 'react';
import { Maximize2, X } from 'lucide-react';

interface GalleryProps {
  images: string[];
}

export function Gallery({ images }: GalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!images || images.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold flex items-center gap-2">
         ผลงานและรูปภาพ
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((img, i) => (
          <div 
            key={i} 
            onClick={() => setSelectedImage(img)}
            className="group relative aspect-square rounded-xl overflow-hidden cursor-pointer border border-white/5"
          >
            <img 
              src={img} 
              alt={`Gallery ${i}`} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 size={24} className="text-white translate-y-4 group-hover:translate-y-0 transition-transform" />
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-300">
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors"
          >
            <X size={24} />
          </button>
          <img 
            src={selectedImage} 
            alt="Expanded" 
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-in zoom-in duration-300" 
          />
        </div>
      )}
    </div>
  );
}
