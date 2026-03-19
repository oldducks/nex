'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Loader2, Move, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface ImageCropperProps {
    imageUrl: string;
    onPositionChange: (position: { x: number; y: number; scale: number }) => void;
    initialPosition?: { x: number; y: number; scale: number };
    aspectRatio?: number;
    className?: string;
}

export function ImageCropper({
    imageUrl,
    onPositionChange,
    initialPosition = { x: 50, y: 50, scale: 1 },
    aspectRatio = 1,
    className = ''
}: ImageCropperProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });

    // Handle mouse/touch drag start
    const handleDragStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        setIsDragging(true);
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setStartPos({ x: clientX - position.x, y: clientY - position.y });
    }, [position]);

    // Handle drag move
    const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

        const newX = Math.max(0, Math.min(100, clientX - startPos.x));
        const newY = Math.max(0, Math.min(100, clientY - startPos.y));

        setPosition(p => ({ ...p, x: newX, y: newY }));
    }, [isDragging, startPos]);

    // Handle drag end
    const handleDragEnd = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            onPositionChange(position);
        }
    }, [isDragging, position, onPositionChange]);

    // Add global event listeners for drag
    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchmove', handleDragMove);
            window.addEventListener('touchend', handleDragEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleDragMove);
            window.removeEventListener('mouseup', handleDragEnd);
            window.removeEventListener('touchmove', handleDragMove);
            window.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, handleDragMove, handleDragEnd]);

    // Zoom controls
    const handleZoom = (delta: number) => {
        setPosition(p => {
            const newScale = Math.max(0.5, Math.min(3, p.scale + delta));
            const newPos = { ...p, scale: newScale };
            onPositionChange(newPos);
            return newPos;
        });
    };

    // Reset position
    const handleReset = () => {
        const resetPos = { x: 50, y: 50, scale: 1 };
        setPosition(resetPos);
        onPositionChange(resetPos);
    };

    // Generate object-position CSS value
    const objectPosition = `${position.x}% ${position.y}%`;

    return (
        <div className={`relative ${className}`}>
            {/* Preview container */}
            <div
                ref={containerRef}
                className="relative w-full overflow-hidden bg-zinc-800 rounded-2xl cursor-move"
                style={{ aspectRatio: aspectRatio }}
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
            >
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt="Profile"
                        className="w-full h-full transition-transform select-none pointer-events-none"
                        style={{
                            objectFit: 'cover',
                            objectPosition: objectPosition,
                            transform: `scale(${position.scale})`,
                        }}
                        draggable={false}
                        onError={(e) => {
                            console.error('Image failed to load:', imageUrl);
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No image
                    </div>
                )}

                {/* Drag indicator */}
                {isDragging && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Move size={32} className="text-white animate-pulse" />
                    </div>
                )}

                {/* Grid overlay for positioning reference */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3">
                        {[...Array(9)].map((_, i) => (
                            <div key={i} className="border border-white/30" />
                        ))}
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3 mt-3">
                <button
                    type="button"
                    onClick={() => handleZoom(-0.1)}
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                    title="Zoom Out"
                >
                    <ZoomOut size={18} className="text-white" />
                </button>
                <span className="text-xs text-gray-400 w-12 text-center">
                    {Math.round(position.scale * 100)}%
                </span>
                <button
                    type="button"
                    onClick={() => handleZoom(0.1)}
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                    title="Zoom In"
                >
                    <ZoomIn size={18} className="text-white" />
                </button>
                <button
                    type="button"
                    onClick={handleReset}
                    className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors ml-2"
                    title="Reset"
                >
                    <RotateCcw size={18} className="text-white" />
                </button>
            </div>

            {/* Instructions */}
            <p className="text-xs text-gray-500 text-center mt-2">
                🖱️ ลากเพื่อปรับตำแหน่ง | Drag to adjust position
            </p>
        </div>
    );
}

// Utility to convert position to CSS object-position string
export function positionToObjectPosition(pos: { x: number; y: number }): string {
    return `${pos.x}% ${pos.y}%`;
}
