'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';
import { Toast, type ToastType } from './Toast';

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
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '',
        type: 'info',
        isVisible: false,
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const token = Cookies.get('token');

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const handleFileSelect = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const remainingSlots = maxImages - images.length;
        if (remainingSlots <= 0) {
            showToast(`สามารถอัพโหลดได้สูงสุด ${maxImages} รูป`, 'error');
            return;
        }

        const filesToUpload = Array.from(files).slice(0, remainingSlots);
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

        setUploading(true);
        const newUrls: string[] = [];

        try {
            let rejectedCount = 0;
            for (const file of filesToUpload) {
                if (!allowedTypes.includes(file.type)) {
                    showToast(`ไฟล์ ${file.name} ไม่ใช่รูปภาพที่รองรับ (jpg, png, gif, webp)`, 'error');
                    rejectedCount += 1;
                    continue;
                }
                if (file.size > 5 * 1024 * 1024) {
                    showToast(`ไฟล์ ${file.name} มีขนาดเกิน 5MB`, 'error');
                    rejectedCount += 1;
                    continue;
                }

                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch(`${API_URL}/uploads/image`, {
                    method: 'POST',
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData
                });

                if (!res.ok) throw new Error('Upload failed');

                const data = await res.json();
                let imageUrl = data.url;

                if (data.jobId) {
                    imageUrl = await new Promise((resolve, reject) => {
                        const interval = setInterval(async () => {
                            try {
                                const jobRes = await fetch(`${API_URL}/uploads/job/${data.jobId}`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                if (!jobRes.ok) return;
                                const status = await jobRes.json();
                                if (status.state === 'completed' && status.result) {
                                    clearInterval(interval);
                                    resolve(status.result.url);
                                } else if (status.state === 'failed') {
                                    clearInterval(interval);
                                    reject(new Error(status.failedReason || 'Image processing failed'));
                                }
                            } catch (err) {
                                console.error('Polling error:', err);
                            }
                        }, 1000);
                    });
                }
                
                if (imageUrl) {
                    newUrls.push(imageUrl);
                }
            }

            if (newUrls.length > 0) {
                onChange([...images, ...newUrls]);
                showToast(`อัปโหลดรูปสำเร็จ ${newUrls.length} รูป`, 'success');
            } else if (rejectedCount > 0) {
                showToast('ไม่มีไฟล์ที่อัปโหลดได้ กรุณาตรวจสอบชนิดไฟล์และขนาดอีกครั้ง', 'error');
            }
        } catch (error) {
            console.error('Upload error:', error);
            showToast('อัพโหลดรูปไม่สำเร็จ กรุณาลองใหม่', 'error');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
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
                            {img ? (
                                <img
                                    src={(() => {
                                        if (!img) return '';
                                        if (typeof img !== 'string') return '';

                                        if (img.startsWith('http')) {
                                            // Handle localhost fallback if API_URL is production
                                            if (img.includes('localhost:') && API_URL.includes('nexsolution.cloud')) {
                                                try {
                                                    const parsedUrl = new URL(img);
                                                    if (parsedUrl.pathname.startsWith('/uploads')) {
                                                        return `${API_URL}${parsedUrl.pathname}`;
                                                    }
                                                } catch {}
                                            }
                                            return img;
                                        }
                                        
                                        // Handle relative paths
                                        if (img.startsWith('/')) return `${API_URL}${img}`;
                                        return `${API_URL}/${img}`;
                                    })()}
                                    alt={`Product ${index + 1}`}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=Product+${index + 1}&background=random`;
                                    }}
                                />
                            ) : (
                                <div className="w-full h-full bg-foreground/5 flex items-center justify-center">
                                    <ImageIcon className="text-foreground/20" />
                                </div>
                            )}
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
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
            />
        </div>
    );
}
