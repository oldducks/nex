'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface ProductImageUploadProps {
    images: string[];
    onChange: (images: string[]) => void;
    maxImages?: number;
}

export default function ProductImageUpload({
    images,
    onChange,
    maxImages = 5
}: ProductImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const token = Cookies.get('token');

    const handleFileSelect = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const remainingSlots = maxImages - images.length;
        if (remainingSlots <= 0) {
            alert(`สามารถอัพโหลดได้สูงสุด ${maxImages} รูป`);
            return;
        }

        const filesToUpload = Array.from(files).slice(0, remainingSlots);
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        for (const file of filesToUpload) {
            if (!allowedTypes.includes(file.type)) {
                alert(`ไฟล์ ${file.name} ไม่ใช่รูปภาพที่รองรับ (jpg, png, gif, webp)`);
                continue;
            }
            if (file.size > 5 * 1024 * 1024) {
                alert(`ไฟล์ ${file.name} มีขนาดเกิน 5MB`);
                continue;
            }

            setUploading(true);
            try {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch(`${API_URL}/uploads/image`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                });

                if (!res.ok) throw new Error('Upload failed');

                const data = await res.json();
                const imageUrl = `${API_URL}${data.url}`;
                onChange([...images, imageUrl]);
            } catch (error) {
                console.error('Upload error:', error);
                alert('อัพโหลดรูปไม่สำเร็จ กรุณาลองใหม่');
            } finally {
                setUploading(false);
            }
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onChange(newImages);
    };

    return (
        <div className="space-y-3">
            <label className="block text-sm font-medium text-foreground/70">
                รูปสินค้า ({images.length}/{maxImages})
            </label>

            {/* Image Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                    {images.map((img, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                            <img
                                src={img}
                                alt={`Product ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X size={14} />
                            </button>
                            {index === 0 && (
                                <span className="absolute bottom-1 left-1 text-xs bg-primary text-white px-1.5 py-0.5 rounded">
                                    หลัก
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Area */}
            {images.length < maxImages && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`
                        border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
                        ${dragOver
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50 hover:bg-foreground/5'
                        }
                        ${uploading ? 'pointer-events-none opacity-50' : ''}
                    `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        multiple
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                    />

                    {uploading ? (
                        <div className="flex flex-col items-center gap-2 py-2">
                            <Loader2 size={24} className="animate-spin text-primary" />
                            <span className="text-sm text-foreground/60">กำลังอัพโหลด...</span>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-2 py-2">
                            <div className="p-2 rounded-full bg-primary/10">
                                <Upload size={20} className="text-primary" />
                            </div>
                            <div className="text-sm">
                                <span className="text-primary font-medium">คลิกเลือก</span>
                                <span className="text-foreground/60"> หรือลากไฟล์มาวาง</span>
                            </div>
                            <span className="text-xs text-foreground/40">
                                JPG, PNG, GIF, WebP (สูงสุด 5MB)
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
