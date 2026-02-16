"use client";

import { useState, useRef } from 'react';
import { Upload, X, Play, Link2, Settings, Loader2, ExternalLink } from 'lucide-react';
import Cookies from 'js-cookie';

interface VideoConfig {
    url: string;
    autoplay: boolean;
    link_url?: string;
    link_enabled: boolean;
    enabled: boolean;
}

interface VideoUploadProps {
    value: VideoConfig | null;
    onChange: (config: VideoConfig | null) => void;
    className?: string;
}

export function VideoUpload({ value, onChange, className = '' }: VideoUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = Cookies.get('token');

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
            alert('กรุณาเลือกไฟล์วิดีโอ (mp4, webm, ogg, mov)');
            return;
        }

        // Validate file size (100MB)
        if (file.size > 100 * 1024 * 1024) {
            alert('ไฟล์วิดีโอต้องมีขนาดไม่เกิน 100MB');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`${API_URL}/uploads/video`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                throw new Error('Upload failed');
            }

            const data = await res.json();
            onChange({
                url: data.url,
                autoplay: value?.autoplay ?? false,
                link_url: value?.link_url ?? '',
                link_enabled: value?.link_enabled ?? false,
                enabled: true
            });
        } catch (error) {
            console.error('Upload error:', error);
            alert('อัพโหลดวิดีโอไม่สำเร็จ กรุณาลองใหม่');
        } finally {
            setUploading(false);
        }
    };

    const handleRemove = () => {
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const updateConfig = (updates: Partial<VideoConfig>) => {
        if (value) {
            onChange({ ...value, ...updates });
        }
    };

    const getFullUrl = (url: string) => {
        if (url.startsWith('http')) return url;
        return `${API_URL}${url}`;
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Upload Area */}
            {!value?.url ? (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-foreground/20 rounded-2xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                >
                    {uploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-primary" size={32} />
                            <p className="text-foreground/60">กำลังอัพโหลดวิดีโอ...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                <Upload className="text-primary" size={24} />
                            </div>
                            <div>
                                <p className="font-medium text-foreground">คลิกเพื่ออัพโหลดวิดีโอ</p>
                                <p className="text-sm text-foreground/50 mt-1">MP4, WebM, OGG (สูงสุด 100MB)</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Video Preview */}
                    <div className="relative rounded-2xl overflow-hidden bg-black">
                        <video
                            src={getFullUrl(value.url)}
                            controls
                            className="w-full max-h-[300px] object-contain"
                        />
                        <button
                            onClick={handleRemove}
                            className="absolute top-3 right-3 p-2 bg-red-500/90 hover:bg-red-500 text-white rounded-full transition-colors"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Toggle Enable */}
                    <div className="flex items-center justify-between p-4 bg-foreground/5 rounded-xl">
                        <div className="flex items-center gap-3">
                            <Play size={20} className="text-primary" />
                            <span className="font-medium">แสดงวิดีโอ</span>
                        </div>
                        <button
                            onClick={() => updateConfig({ enabled: !value.enabled })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                                value.enabled ? 'bg-primary' : 'bg-foreground/20'
                            }`}
                        >
                            <div
                                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                    value.enabled ? 'left-7' : 'left-1'
                                }`}
                            />
                        </button>
                    </div>

                    {/* Settings Toggle */}
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="flex items-center gap-2 text-sm text-foreground/60 hover:text-foreground transition-colors"
                    >
                        <Settings size={16} />
                        <span>ตั้งค่าเพิ่มเติม</span>
                    </button>

                    {/* Settings Panel */}
                    {showSettings && (
                        <div className="space-y-4 p-4 bg-foreground/5 rounded-xl border border-foreground/10">
                            {/* Autoplay Toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">เล่นอัตโนมัติ</p>
                                    <p className="text-xs text-foreground/50">เปิดวิดีโอเล่นทันทีเมื่อเข้าหน้า</p>
                                </div>
                                <button
                                    onClick={() => updateConfig({ autoplay: !value.autoplay })}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${
                                        value.autoplay ? 'bg-primary' : 'bg-foreground/20'
                                    }`}
                                >
                                    <div
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                            value.autoplay ? 'left-7' : 'left-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            <div className="h-px bg-foreground/10" />

                            {/* Link Toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">ลิงก์เมื่อกดวิดีโอ</p>
                                    <p className="text-xs text-foreground/50">เปิดลิงก์เมื่อคลิกที่วิดีโอ</p>
                                </div>
                                <button
                                    onClick={() => updateConfig({ link_enabled: !value.link_enabled })}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${
                                        value.link_enabled ? 'bg-primary' : 'bg-foreground/20'
                                    }`}
                                >
                                    <div
                                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                                            value.link_enabled ? 'left-7' : 'left-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {/* Link URL Input */}
                            {value.link_enabled && (
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest">
                                        URL ปลายทาง
                                    </label>
                                    <div className="relative">
                                        <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/30" size={18} />
                                        <input
                                            type="url"
                                            value={value.link_url || ''}
                                            onChange={(e) => updateConfig({ link_url: e.target.value })}
                                            placeholder="https://example.com"
                                            className="w-full bg-background border border-foreground/10 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime"
                onChange={handleFileSelect}
                className="hidden"
            />
        </div>
    );
}

// Video Player component for public display
interface VideoPlayerProps {
    config: VideoConfig;
    className?: string;
}

export function VideoPlayer({ config, className = '' }: VideoPlayerProps) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    if (!config?.enabled || !config?.url) {
        return null;
    }

    const getFullUrl = (url: string) => {
        if (url.startsWith('http')) return url;
        return `${API_URL}${url}`;
    };

    const videoElement = (
        <video
            src={getFullUrl(config.url)}
            autoPlay={config.autoplay}
            muted={config.autoplay} // Muted required for autoplay
            loop
            playsInline
            controls={!config.link_enabled}
            className={`w-full rounded-2xl ${className}`}
        />
    );

    if (config.link_enabled && config.link_url) {
        return (
            <a
                href={config.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block relative group cursor-pointer"
            >
                {videoElement}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-2xl flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 px-4 py-2 rounded-full flex items-center gap-2 text-sm font-medium text-gray-800">
                        <ExternalLink size={16} />
                        เปิดลิงก์
                    </div>
                </div>
            </a>
        );
    }

    return videoElement;
}
