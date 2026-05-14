"use client";

import { useState, useRef } from 'react';
import { Upload, X, Play, Link2, Settings, Loader2, ExternalLink } from 'lucide-react';
import Cookies from 'js-cookie';
import { Toast, type ToastType } from './Toast';

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
    const CHUNK_SIZE = 8 * 1024 * 1024;
    const LARGE_VIDEO_THRESHOLD = 100 * 1024 * 1024;
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');
    const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
        message: '',
        type: 'info',
        isVisible: false,
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = Cookies.get('token');

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type, isVisible: true });
    };
    
    console.log('VideoUpload token:', token ? 'exists' : 'missing');

    const handleUrlSubmit = () => {
        const urlInput = document.getElementById('video-url-input') as HTMLInputElement;
        const url = urlInput?.value?.trim();
        
        if (!url) {
            showToast('กรุณาใส่ URL วิดีโอ', 'error');
            return;
        }

        // Basic URL validation
        try {
            new URL(url);
        } catch {
            showToast('กรุณาใส่ URL ที่ถูกต้อง (เช่น https://example.com/video.mp4)', 'error');
            return;
        }

        onChange({
            url: url,
            autoplay: value?.autoplay ?? false,
            link_url: value?.link_url ?? '',
            link_enabled: value?.link_enabled ?? false,
            enabled: true
        });
        
        if (urlInput) {
            urlInput.value = '';
        }
        showToast('เพิ่มวิดีโอจากลิงก์สำเร็จ', 'success');
    };

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
                    showToast('อัปโหลดและประมวลผลวิดีโอสำเร็จ', 'success');
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
                    showToast(`ประมวลผลวิดีโอไม่สำเร็จ: ${status.failedReason || 'Unknown error'}`, 'error');
                } else {
                    const backendProgress = typeof status.progress === 'number' ? status.progress : 0;
                    setProgress(Math.max(70, Math.min(100, 70 + Math.round(backendProgress * 0.3))));
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 1500);
    };

    const uploadFileToSignedUrl = async (signedUrl: string, file: File) => {
        await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', signedUrl, true);
            xhr.setRequestHeader('Content-Type', file.type);

            xhr.upload.onprogress = (event) => {
                if (!event.lengthComputable) return;
                const uploadPercent = Math.round((event.loaded / event.total) * 65);
                setProgress(Math.min(65, Math.max(1, uploadPercent)));
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    setProgress(70);
                    resolve();
                } else {
                    reject(new Error(`Direct upload failed: ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error('Direct upload network error'));
            xhr.onabort = () => reject(new Error('Direct upload aborted'));
            xhr.send(file);
        });
    };

    const uploadViaR2Direct = async (file: File) => {
        const initRes = await fetch(`${API_URL}/uploads/video/direct/init`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                fileName: file.name,
                contentType: file.type,
                fileSize: file.size,
            }),
        });

        if (!initRes.ok) {
            throw new Error(`Init direct upload failed: ${initRes.status}`);
        }

        const initData = await initRes.json();
        if (!initData?.uploadUrl || !initData?.objectKey) {
            throw new Error('Direct upload init missing upload URL');
        }

        await uploadFileToSignedUrl(initData.uploadUrl, file);

        const completeRes = await fetch(`${API_URL}/uploads/video/direct/complete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                objectKey: initData.objectKey,
            }),
        });

        if (!completeRes.ok) {
            const completeError = await completeRes.text();
            throw new Error(`Complete direct upload failed: ${completeRes.status} - ${completeError}`);
        }

        const completeData = await completeRes.json();
        if (!completeData?.jobId) {
            throw new Error('Direct upload complete missing job id');
        }

        pollJobStatus(String(completeData.jobId));
    };

    const uploadViaLegacyApi = async (file: File) => {
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
            throw new Error(`Upload failed: ${res.status} - ${errorText}`);
        }

        const data = await res.json();
        if (data.jobId) {
            setProgress(70);
            pollJobStatus(data.jobId);
            return;
        }

        setUploading(false);
        onChange({
            url: data.url,
            autoplay: value?.autoplay ?? false,
            link_url: value?.link_url ?? '',
            link_enabled: value?.link_enabled ?? false,
            enabled: true
        });
        showToast('อัปโหลดวิดีโอสำเร็จ', 'success');
    };

    const uploadViaChunkedApi = async (file: File) => {
        const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

        const initRes = await fetch(`${API_URL}/uploads/video/chunked/init`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
                fileName: file.name,
                contentType: file.type,
                fileSize: file.size,
                totalChunks,
            }),
        });

        if (!initRes.ok) {
            const errorText = await initRes.text();
            throw new Error(`Init chunked upload failed: ${initRes.status} - ${errorText}`);
        }

        const initData = await initRes.json();
        if (!initData?.uploadId) {
            throw new Error('Chunked upload init missing upload id');
        }

        const uploadId = String(initData.uploadId);
        for (let index = 0; index < totalChunks; index += 1) {
            const start = index * CHUNK_SIZE;
            const end = Math.min(file.size, start + CHUNK_SIZE);
            const chunk = file.slice(start, end);
            const formData = new FormData();
            formData.append('chunk', chunk, `${file.name}.part${index}`);
            formData.append('index', String(index));

            const chunkRes = await fetch(`${API_URL}/uploads/video/chunked/${uploadId}/chunk`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            if (!chunkRes.ok) {
                const errorText = await chunkRes.text();
                throw new Error(`Chunk upload failed at part ${index + 1}/${totalChunks}: ${chunkRes.status} - ${errorText}`);
            }

            const uploadPercent = Math.round(((index + 1) / totalChunks) * 65);
            setProgress(Math.min(65, Math.max(1, uploadPercent)));
        }

        const completeRes = await fetch(`${API_URL}/uploads/video/chunked/${uploadId}/complete`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!completeRes.ok) {
            const errorText = await completeRes.text();
            throw new Error(`Complete chunked upload failed: ${completeRes.status} - ${errorText}`);
        }

        const completeData = await completeRes.json();
        if (!completeData?.jobId) {
            throw new Error('Chunked upload complete missing job id');
        }

        setProgress(70);
        pollJobStatus(String(completeData.jobId));
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        if (!allowedTypes.includes(file.type)) {
            showToast('กรุณาเลือกไฟล์วิดีโอ (mp4, webm, ogg, mov)', 'error');
            return;
        }

        // Validate file size (200MB)
        if (file.size > 200 * 1024 * 1024) {
            showToast('ไฟล์วิดีโอต้องมีขนาดไม่เกิน 200MB', 'error');
            return;
        }

        setUploading(true);
        setProgress(0);
        console.log(`Uploading video: ${file.name}, Type: ${file.type}, Size: ${file.size}`);
        console.log(`API_URL: ${API_URL}, Token: ${token ? 'exists' : 'missing'}`);

        try {
            if (file.size > LARGE_VIDEO_THRESHOLD) {
                showToast('ไฟล์ใหญ่มาก ระบบจะอัปโหลดแบบแบ่งส่วนเพื่อให้เสถียรกว่าเดิม', 'info');
                await uploadViaChunkedApi(file);
            } else {
                console.log('Sending direct upload request to R2...');
                await uploadViaR2Direct(file);
            }
        } catch (error: unknown) {
            console.error('Upload error:', error);
            try {
                if (file.size > LARGE_VIDEO_THRESHOLD) {
                    throw error;
                }
                showToast('กำลังสลับไปใช้โหมดอัปโหลดแบบแบ่งส่วน...', 'info');
                setProgress(5);
                await uploadViaChunkedApi(file);
            } catch (fallbackError: unknown) {
                console.error('Fallback upload error:', fallbackError);
                try {
                    showToast('กำลังสลับไปใช้โหมดอัปโหลดสำรองสุดท้าย...', 'info');
                    setProgress(5);
                    await uploadViaLegacyApi(file);
                } catch (legacyError: unknown) {
                    console.error('Legacy upload error:', legacyError);
                    const message = legacyError instanceof Error ? legacyError.message : 'กรุณาลองใหม่';
                    showToast(`อัพโหลดวิดีโอไม่สำเร็จ: ${message}`, 'error');
                    setUploading(false);
                }
            }
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
        if (url.startsWith('/api')) return url;
        return `${API_URL}${url}`;
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Upload Area */}
            {!value?.url ? (
                <div className="space-y-4">
                    {/* Mode Toggle */}
                    <div className="flex bg-foreground/5 rounded-xl p-1">
                        <button
                            onClick={() => setInputMode('upload')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                                inputMode === 'upload' 
                                    ? 'bg-primary text-white' 
                                    : 'text-foreground/60 hover:text-foreground'
                            }`}
                        >
                            <Upload size={16} className="inline mr-2" />
                            อัปโหลดไฟล์
                        </button>
                        <button
                            onClick={() => setInputMode('url')}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                                inputMode === 'url' 
                                    ? 'bg-primary text-white' 
                                    : 'text-foreground/60 hover:text-foreground'
                            }`}
                        >
                            <Link2 size={16} className="inline mr-2" />
                            ใส่ลิงก์
                        </button>
                    </div>

                    {/* Upload Mode */}
                    {inputMode === 'upload' ? (
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
                                        {progress < 70 ? 'กำลังอัปโหลดวิดีโอแบบแบ่งส่วน/ตรงขึ้นระบบ...' : 'กำลังประมวลผลวิดีโอบนเซิร์ฟเวอร์...'}
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
                                        <p className="text-xs text-[#64748B] mt-1 font-semibold">ไฟล์ใหญ่จะสลับเป็นโหมดอัปโหลดแบบแบ่งส่วนอัตโนมัติ เพื่อลดปัญหาเกิน 100MB</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* URL Mode */
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-primary/50 bg-primary/5 rounded-2xl p-8">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                        <Link2 className="text-white" size={36} />
                                    </div>
                                    <div className="w-full space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-foreground/70 mb-2">
                                                ใส่ URL วิดีโอ
                                            </label>
                                            <input
                                                id="video-url-input"
                                                type="url"
                                                placeholder="https://example.com/video.mp4"
                                                className="w-full bg-background border border-foreground/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                                            />
                                        </div>
                                        <button
                                            onClick={handleUrlSubmit}
                                            className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors"
                                        >
                                            <Play size={16} className="inline mr-2" />
                                            เพิ่มวิดีโอ
                                        </button>
                                    </div>
                                    <p className="text-xs text-foreground/50 mt-2">
                                        รองรับวิดีโอจาก YouTube, Vimeo, หรือ URL ตรงๆ
                                    </p>
                                </div>
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
            <Toast
                message={toast.message}
                type={toast.type}
                isVisible={toast.isVisible}
                onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
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
        if (url.startsWith('/api')) return url;
        return `${API_URL}${url}`;
    };

    const videoElement = (
        <video
            src={getFullUrl(config.url)}
            autoPlay={false}
            muted={false}
            loop
            playsInline
            controls={true}
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
