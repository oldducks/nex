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
    const [progress, setProgress] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = Cookies.get('token');

    const pollJobStatus = async (jobId: string) => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_URL}/uploads/job/${jobId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!res.ok) return;
                const status = await res.json();
                
                if (status.state === 'completed' && status.result) {
                    clearInterval(interval);
                    setUploading(false);
                    setProgress(100);
                    onChange({
                        url: status.result.url,
                        autoplay: value?.autoplay ?? false,
                        link_url: value?.link_url ?? '',
                        link_enabled: value?.link_enabled ?? false,
                        enabled: true
                    });
                } else if (status.state === 'failed') {
                    clearInterval(interval);
                    setUploading(false);
                    alert(`ประมวลผลวิดีโอไม่สำเร็จ: ${status.failedReason || 'Unknown error'}`);
                } else {
                    setProgress(status.progress || 0);
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 1500);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
            alert('กรุณาเลือกไฟล์วิดีโอ (mp4, webm, ogg, mov)');
            return;
        }

        // Validate file size (200MB)
        if (file.size > 200 * 1024 * 1024) {
            alert('ไฟล์วิดีโอต้องมีขนาดไม่เกิน 200MB');
            return;
        }

        setUploading(true);
        setProgress(0);
        console.log(`Uploading video: ${file.name}, Type: ${file.type}, Size: ${file.size}`);

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
                const errorText = await res.text();
                throw new Error(`Upload failed: ${res.statusText}`);
            }

            const data = await res.json();
            if (data.jobId) {
                pollJobStatus(data.jobId);
            } else {
                setUploading(false);
                onChange({
                    url: data.url,
                    autoplay: value?.autoplay ?? false,
                    link_url: value?.link_url ?? '',
                    link_enabled: value?.link_enabled ?? false,
                    enabled: true
                });
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(`อัพโหลดวิดีโอไม่สำเร็จ: ${error.message || 'กรุณาลองใหม่'}`);
            setUploading(false);
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
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
        } else {
            onChange({ url: '', autoplay: false, link_enabled: false, enabled: true, ...updates });
        }
    };

    const getFullUrl = (url?: string) => {
        if (!url || typeof url !== 'string') return '';
        if (url.startsWith('http')) return url;
        return `${API_URL}${url}`;
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Upload Area */}
            {!value?.url ? (
                <div
                    onClick={() => !uploading && fileInputRef.current?.click()}
                    className={`border-[3px] border-dashed border-primary/50 bg-primary/5 rounded-2xl p-10 text-center transition-all ${uploading ? 'cursor-default opacity-80' : 'cursor-pointer hover:border-primary hover:bg-primary/10 hover:-translate-y-1 hover:shadow-xl'}`}
                >
                    {uploading ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative w-20 h-20">
                                <Loader2 className="animate-spin text-primary absolute inset-0" size={80} />
                                <div className="absolute inset-0 flex items-center justify-center text-xs font-black">
                                    {progress}%
                                </div>
                            </div>
                            <div className="w-full max-w-[250px] bg-foreground/10 h-2 rounded-full overflow-hidden">
                                <div 
                                    className="h-full bg-primary transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-primary italic font-mono">
                                กำลังอัพโหลดและบีบอัดวิดีโอ...
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                <Upload className="text-white" size={36} />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-primary uppercase tracking-wider">คลิกที่นี่เพื่ออัพโหลดวิดีโอ</h3>
                                <p className="text-sm text-foreground/60 mt-2 font-medium">รองรับ MP4, WebM, OGG (สูงสุด 200MB)</p>
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

    const getFullUrl = (url?: string) => {
        if (!url || typeof url !== 'string') return '';
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
