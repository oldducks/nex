"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  ArrowLeft, Save, Plus, Trash2, GripVertical, 
  Type, Image as ImageIcon, Video, MousePointer2,
  Settings, Eye, Globe, QrCode as QrIcon, 
  ChevronUp, ChevronDown, CheckCircle, Smartphone, 
  Monitor, Layout, Sparkles, MessageSquare, Share2, ExternalLink, Loader2, Link as LinkIcon, Bold, Italic, AlignLeft, AlignCenter, AlignRight, Maximize2, Minimize2, MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import { QrCodeImage } from '../../../../components/QrCode';
import { VideoUpload } from '@/components/VideoUpload';
import { Toast, ToastType } from '@/components/Toast';
import { getEmbedUrl } from '@/lib/videoUtils';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud';

interface VideoConfig {
    url: string;
    autoplay: boolean;
    link_url?: string;
    link_enabled: boolean;
    enabled: boolean;
}

interface Block {
    id: string;
    type: 'text' | 'image' | 'video' | 'button' | 'form';
    content: any;
}

interface LandingPage {
    id: number;
    title: string;
    slug: string;
    description: string;
    content_blocks: Block[];
    is_published: boolean;
    theme_config: any;
    seo_metadata: any;
}

const resolveUploadedImageUrl = async (jobId: string, token?: string): Promise<string> => {
    const maxAttempts = 40;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const statusRes = await fetch(`${API_URL}/uploads/job/${jobId}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        if (!statusRes.ok) {
            throw new Error('Failed to check upload status');
        }

        const status = await statusRes.json();
        if (status.state === 'completed') {
            let url = status?.result?.url;
            if (!url) throw new Error('Upload finished but URL missing');
            if (url.startsWith('http://') || url.startsWith('https://')) {
                return url;
            }
            if (url.startsWith('/api/')) {
                url = url.substring(4);
            }
            return `${API_URL}${url}`;
        }

        if (status.state === 'failed') {
            throw new Error(status?.failedReason || 'Upload processing failed');
        }

        await new Promise((resolve) => setTimeout(resolve, 800));
    }

    throw new Error('Upload timed out');
};

function ImageBlockEditor({
    block,
    onUpdate,
}: {
    block: Block,
    onUpdate: (content: any) => void,
}) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const token = Cookies.get('token');

    const handleUpload = async (file: File) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('รองรับเฉพาะไฟล์ JPG, PNG, GIF, และ WebP');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('ไฟล์มีขนาดเกิน 5MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        try {
            const res = await fetch(`${API_URL}/uploads/image`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Upload failed (${res.status}): ${errorText.substring(0, 100)}`);
            }

            const data = await res.json();
            const imageUrl = data?.jobId
                ? await resolveUploadedImageUrl(String(data.jobId), token)
                : data?.url;

            if (!imageUrl) {
                throw new Error('Upload completed but no image URL returned');
            }

            onUpdate({ ...block.content, url: imageUrl });
        } catch (error) {
            console.error('Image upload error:', error);
            alert(error instanceof Error ? error.message : 'อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await handleUpload(file);
        }
    };

    const previewUrl = typeof block.content.url === 'string' ? block.content.url : '';

    return (
        <div style={{ border: '2px dashed #D9E1F2', borderRadius: '16px', padding: '2rem', textAlign: 'center' }}>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileChange}
                style={{ display: 'none' }}
            />

            <button
                type="button"
                onClick={() => !uploading && fileInputRef.current?.click()}
                style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    cursor: uploading ? 'default' : 'pointer',
                    padding: '1.5rem 1rem',
                    borderRadius: '12px',
                    color: '#94A3B8',
                    opacity: uploading ? 0.7 : 1,
                }}
            >
                {uploading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <Loader2 size={40} style={{ color: '#6366F1', animation: 'spin 1s linear infinite' }} />
                        <p style={{ color: '#6366F1', fontWeight: 700, margin: 0 }}>กำลังอัปโหลดรูปภาพ...</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                        <ImageIcon size={48} style={{ color: '#94A3B8' }} />
                        <p style={{ color: '#94A3B8', fontWeight: 700, margin: 0 }}>คลิกเพื่ออัปโหลดรูปภาพ</p>
                        <p style={{ color: '#CBD5E1', fontSize: '13px', margin: 0 }}>JPG, PNG, GIF, WebP สูงสุด 5MB</p>
                    </div>
                )}
            </button>

            <input
                type="text"
                style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #D9E1F2',
                    borderRadius: '8px',
                    marginTop: '1rem',
                    fontSize: '14px'
                }}
                value={previewUrl}
                onChange={e => onUpdate({ ...block.content, url: e.target.value })}
                placeholder="URL รูปภาพ"
            />

            <input
                type="text"
                style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #D9E1F2',
                    borderRadius: '8px',
                    marginTop: '0.75rem',
                    fontSize: '14px'
                }}
                value={block.content.link || ''}
                onChange={e => onUpdate({ ...block.content, link: e.target.value })}
                placeholder="ลิงก์เมื่อกดรูปภาพ (ไม่บังคับ)"
            />

            {previewUrl && (
                <img src={previewUrl} alt="Preview" style={{ width: '100%', marginTop: '1rem', borderRadius: '8px' }} />
            )}
        </div>
    );
}

export default function LandingPageEditor() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [page, setPage] = useState<LandingPage | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [autoSaving, setAutoSaving] = useState(false);
    const hasLoadedRef = useRef(false);
    const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [activeTab, setActiveTab] = useState<'content' | 'design' | 'seo' | 'settings'>('content');
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState<Record<string, boolean>>({});
    const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
    const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({ message: '', type: 'info', isVisible: false });

    const showToast = (message: string, type: ToastType = 'info') => {
        setToast({ message, type, isVisible: true });
    };

    const token = Cookies.get('token');

    useEffect(() => {
        if (!token) {
            router.push('/login');
            return;
        }
        fetchPage();
    }, [token, id]);

    const fetchPage = async () => {
        try {
            const res = await fetch(`${API_URL}/landing-pages/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                const normalized = {
                    ...data,
                    content_blocks: data.content_blocks || [],
                    theme_config: data.theme_config || { primary_color: '#6366F1', bg_color: '#000000', font_family: 'Inter' },
                };
                setPage(normalized);
                hasLoadedRef.current = true;
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const doSave = async (options?: { draft?: boolean, silent?: boolean }) => {
        if (!page || !hasLoadedRef.current) return;
        
        try {
            setSaving(true);
            if (!options?.silent) {
                setSaveStatus({ type: null, message: '' });
            }
            
            // Prepare data for API - only send allowed fields
            const dataToSend = {
                title: page.title,
                slug: page.slug,
                description: page.description,
                content_blocks: page.content_blocks,
                is_published: page.is_published,
                theme_config: page.theme_config,
                seo_metadata: page.seo_metadata
            };
            
            console.log('Data to send:', dataToSend);
            
            const res = await fetch(`${API_URL}/landing-pages/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(dataToSend)
            });
            
            console.log('Response status:', res.status);
            console.log('Response ok:', res.ok);
            
            if (res.ok) {
                const updated = await res.json();
                console.log('Updated page:', updated);
                setPage(updated);
                if (!options?.silent) {
                    setSaveStatus({ type: 'success', message: 'บันทึกสำเร็จ' });
                    setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
                }
            } else {
                const errorText = await res.text();
                console.error('Save error response:', errorText);
                throw new Error(`Save failed: ${res.status} - ${errorText}`);
            }
        } catch (err: any) {
            console.error('Save error:', err);
            if (!options?.silent) {
                setSaveStatus({ type: 'error', message: `บันทึกไม่สำเร็จ: ${err.message}` });
                setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
            }
        } finally {
            setSaving(false);
        }
    };

    const savePage = () => doSave();

    const addBlock = (type: Block['type']) => {
        if (!page) return;
        const newBlock: Block = {
            id: Date.now().toString(),
            type,
            content: type === 'text' ? { title: 'หัวข้อ', body: 'เนื้อหา' } : 
                   type === 'image' ? { url: '', link: '' } :
                   type === 'video' ? { url: '', autoplay: false } :
                   type === 'button' ? { text: 'ปุ่ม', link: '', style: 'primary' } :
                   { title: 'ฟอร์ม', fields: [] }
        };
        setPage({...page, content_blocks: [...page.content_blocks, newBlock]});
        setActiveBlockId(newBlock.id);
    };

    const removeBlock = (blockId: string) => {
        if (!page) return;
        setPage({...page, content_blocks: page.content_blocks.filter(b => b.id !== blockId)});
        if (activeBlockId === blockId) setActiveBlockId(null);
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (!page) return;
        const blocks = [...page.content_blocks];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < blocks.length) {
            [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];
            setPage({...page, content_blocks: blocks});
        }
    };

    const updateBlockContent = (blockId: string, content: any) => {
        if (!page) return;
        setPage({...page, content_blocks: page.content_blocks.map(b => 
            b.id === blockId ? {...b, content} : b
        )});
    };

    const handleAiSuggestCopy = async (blockId: string) => {
        setAiLoading({...aiLoading, [blockId]: true});
        try {
            // AI logic here
            showToast('AI suggestion coming soon!', 'info');
        } catch (err) {
            showToast('AI suggestion failed', 'error');
        } finally {
            setAiLoading({...aiLoading, [blockId]: false});
        }
    };

    if (loading) return (
        <div style={{ minHeight: '100vh', backgroundColor: '#EEF0FF', color: '#0F172A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Loader2 style={{ animation: 'spin 1s linear infinite', color: '#F97316' }} size={32} />
        </div>
    );
    if (!page) return <div>ไม่พบข้อมูลหน้านี้</div>;

    const publicUrl = `${SITE_URL}/lp/${page.slug}`;

    return (
        <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', overflow: 'hidden', backgroundColor: '#EEF0FF', color: '#0F172A' }}>
            {/* Background decorations */}
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 0 }}>
                <div style={{ 
                    position: 'absolute', 
                    inset: 0, 
                    background: 'radial-gradient(circle at top left, rgba(96,165,250,0.16), transparent 32%), radial-gradient(circle at top center, rgba(191,219,254,0.34), transparent 40%), linear-gradient(180deg, #f8faff 0%, #eef0ff 50%, #e8eeff 100%)'
                }} />
                <div style={{ 
                    position: 'absolute', 
                    left: '-7rem', 
                    top: '10rem', 
                    width: '20rem', 
                    height: '20rem', 
                    borderRadius: '9999px', 
                    backgroundColor: 'rgba(125, 211, 252, 0.16)', 
                    filter: 'blur(120px)' 
                }} />
                <div style={{ 
                    position: 'absolute', 
                    right: '-6rem', 
                    top: '24rem', 
                    width: '18rem', 
                    height: '18rem', 
                    borderRadius: '9999px', 
                    backgroundColor: 'rgba(5, 5, 121, 0.08)', 
                    filter: 'blur(120px)' 
                }} />
            </div>

            {/* Top Editor Bar */}
            <header style={{ 
                position: 'relative', 
                zIndex: 50, 
                margin: '1rem', 
                marginTop: '1rem', 
                height: '5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderRadius: '28px',
                border: '1px solid #D9E1F2',
                backgroundColor: 'rgba(255,255,255,0.84)',
                padding: '0 1.25rem',
                boxShadow: '0 22px 60px -42px rgba(15,23,42,0.28)',
                backdropFilter: 'blur(24px)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Link href="/manage/landing-pages" style={{ 
                        display: 'flex', 
                        height: '2.5rem', 
                        width: '2.5rem', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        borderRadius: '12px', 
                        border: '1px solid #D9E1F2', 
                        backgroundColor: '#F6F8FF',
                        textDecoration: 'none'
                    }}>
                        <ArrowLeft size={18} style={{ color: '#64748B' }} />
                    </Link>
                    <div style={{ height: '1.5rem', width: '1px', backgroundColor: '#D9E1F2', margin: '0 0.5rem' }}></div>
                    <div style={{ display: 'none' }} className="sm:block">
                        <div style={{ fontSize: '11px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#64748B' }}>NEX Sale Page Editor</div>
                        <input 
                            style={{
                                backgroundColor: 'transparent',
                                fontWeight: 900,
                                fontSize: '14px',
                                color: '#050579',
                                outline: 'none',
                                borderBottom: '1px solid transparent',
                                borderBottomColor: '#F97316',
                                paddingLeft: '4px'
                            }}
                            value={page.title}
                            onChange={e => setPage({...page, title: e.target.value})}
                        />
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px', marginLeft: '4px' }}>
                            <div style={{ fontSize: '10px', color: 'rgba(100,116,139,0.5)', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em' }}>SLUG: /lp/{page.slug}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', borderRadius: '12px', border: '1px solid #D9E1F2', backgroundColor: '#F6F8FF', padding: '4px' }}>
                        <button 
                            onClick={() => setPreviewMode('desktop')}
                            style={{
                                padding: '8px',
                                borderRadius: '8px',
                                backgroundColor: previewMode === 'desktop' ? 'white' : 'transparent',
                                color: previewMode === 'desktop' ? '#050579' : '#94A3B8',
                                boxShadow: previewMode === 'desktop' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <Monitor size={18} />
                        </button>
                        <button 
                            onClick={() => setPreviewMode('mobile')}
                            style={{
                                padding: '8px',
                                borderRadius: '8px',
                                backgroundColor: previewMode === 'mobile' ? 'white' : 'transparent',
                                color: previewMode === 'mobile' ? '#050579' : '#94A3B8',
                                boxShadow: previewMode === 'mobile' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            <Smartphone size={18} />
                        </button>
                    </div>

                    <div style={{ height: '1.5rem', width: '1px', backgroundColor: '#D9E1F2', margin: '0 4px' }}></div>

                    <a 
                        href={publicUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{
                            padding: '10px 20px',
                            borderRadius: '12px',
                            fontWeight: 900,
                            fontSize: '11px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: '#FFFFFF',
                            color: '#050579',
                            border: '1px solid #D9E1F2',
                            cursor: 'pointer',
                            textDecoration: 'none',
                            boxShadow: '0 4px 12px -4px rgba(0,0,0,0.1)'
                        }}
                    >
                        <Globe size={18} style={{ color: '#F97316' }} />
                        <span style={{ display: 'none' }} className="lg:inline">ดูหน้าสาธารณะ (Live)</span>
                        <ExternalLink size={14} style={{ opacity: 0.5 }} />
                    </a>

                    <div style={{ height: '1.5rem', width: '1px', backgroundColor: '#D9E1F2', margin: '0 4px' }}></div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <button 
                            onClick={savePage}
                            disabled={saving}
                            style={{
                                padding: '10px 24px',
                                borderRadius: '12px',
                                fontWeight: 900,
                                fontSize: '12px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 18px 40px -26px rgba(249,115,22,0.45)',
                                border: 'none',
                                cursor: 'pointer',
                                transform: 'scale(1)',
                                opacity: saving ? 0.5 : 1,
                                backgroundColor: saveStatus.type === 'success' ? '#10b981' : 
                                               saveStatus.type === 'error' ? '#ef4444' : 
                                               '#F97316'
                            }}
                        >
                            {saving ? <Loader2 className="animate-spin" size={16} /> : 
                             saveStatus.type === 'success' ? <CheckCircle size={18} /> :
                             saveStatus.type === 'error' ? <Trash2 size={18} /> :
                             <Save size={18} />}
                            <span style={{ display: 'none' }} className="md:inline">
                                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                            </span>
                        </button>
                        <span style={{ 
                            fontSize: '12px', 
                            fontWeight: 500, 
                            color: saveStatus.type === 'error' ? '#ef4444' : 
                                   saveStatus.type === 'success' ? '#10b981' : 
                                   '#64748B' 
                        }}>
                            {saveStatus.message || (autoSaving ? 'กำลังบันทึกอัตโนมัติ...' : 'ระบบจะบันทึกอัตโนมัติระหว่างแก้ไข')}
                        </span>
                    </div>
                </div>
            </header>

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', zIndex: 10 }}>
                {/* Left Toolbar (Blocks) */}
                <aside style={{ 
                    width: '320px', 
                    borderRight: '1px solid rgba(0,0,0,0.05)', 
                    backgroundColor: 'white', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    overflow: 'hidden', 
                    flexShrink: 0 
                }}>
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                        <button 
                            onClick={() => setActiveTab('content')} 
                            style={{ 
                                flex: 1, 
                                padding: '1rem 0', 
                                fontSize: '12px', 
                                fontWeight: 900, 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.1em',
                                backgroundColor: activeTab === 'content' ? 'rgba(99,102,241,0.05)' : 'transparent',
                                borderBottom: activeTab === 'content' ? '2px solid #6366F1' : 'none',
                                color: activeTab === 'content' ? '#6366F1' : 'rgba(0,0,0,0.5)',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >เนื้อหา</button>
                        <button 
                            onClick={() => setActiveTab('design')} 
                            style={{ 
                                flex: 1, 
                                padding: '1rem 0', 
                                fontSize: '12px', 
                                fontWeight: 900, 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.1em',
                                backgroundColor: activeTab === 'design' ? 'rgba(99,102,241,0.05)' : 'transparent',
                                borderBottom: activeTab === 'design' ? '2px solid #6366F1' : 'none',
                                color: activeTab === 'design' ? '#6366F1' : 'rgba(0,0,0,0.5)',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >ดีไซน์</button>
                        <button 
                            onClick={() => setActiveTab('seo')} 
                            style={{ 
                                flex: 1, 
                                padding: '1rem 0', 
                                fontSize: '12px', 
                                fontWeight: 900, 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.1em',
                                backgroundColor: activeTab === 'seo' ? 'rgba(99,102,241,0.05)' : 'transparent',
                                borderBottom: activeTab === 'seo' ? '2px solid #6366F1' : 'none',
                                color: activeTab === 'seo' ? '#6366F1' : 'rgba(0,0,0,0.5)',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >การแชร์</button>
                        <button 
                            onClick={() => setActiveTab('settings')} 
                            style={{ 
                                flex: 1, 
                                padding: '1rem 0', 
                                fontSize: '12px', 
                                fontWeight: 900, 
                                textTransform: 'uppercase', 
                                letterSpacing: '0.1em',
                                backgroundColor: activeTab === 'settings' ? 'rgba(99,102,241,0.05)' : 'transparent',
                                borderBottom: activeTab === 'settings' ? '2px solid #6366F1' : 'none',
                                color: activeTab === 'settings' ? '#6366F1' : 'rgba(0,0,0,0.5)',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >ตั้งค่า</button>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', gap: '2rem', display: 'flex', flexDirection: 'column' }}>
                        {activeTab === 'content' && (
                            <>
                                <div>
                                    <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Plus size={14} style={{ color: '#6366F1' }} /> เพิ่มคอมโพเนนต์
                                    </h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <BlockTypeButton icon={Type} label="ข้อความ" onClick={() => addBlock('text')} />
                                        <BlockTypeButton icon={ImageIcon} label="รูปภาพ" onClick={() => addBlock('image')} />
                                        <BlockTypeButton icon={Video} label="วิดีโอ" onClick={() => addBlock('video')} />
                                        <BlockTypeButton icon={MousePointer2} label="ปุ่ม" onClick={() => addBlock('button')} />
                                        <BlockTypeButton icon={MessageSquare} label="ฟอร์ม" onClick={() => addBlock('form')} />
                                    </div>
                                </div>

                                <div style={{ paddingTop: '2rem', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                                    <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <GripVertical size={14} style={{ color: '#6366F1' }} /> ลำดับโครงสร้าง
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {page.content_blocks.map((block, idx) => (
                                            <div 
                                                key={block.id} 
                                                onClick={() => setActiveBlockId(block.id)}
                                                style={{
                                                    padding: '1rem',
                                                    borderRadius: '16px',
                                                    border: '1px solid transparent',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    backgroundColor: activeBlockId === block.id ? 'rgba(99,102,241,0.05)' : 'rgba(0,0,0,0.05)',
                                                    borderColor: activeBlockId === block.id ? '#6366F1' : 'transparent',
                                                    boxShadow: activeBlockId === block.id ? '0 10px 25px -5px rgba(99,102,241,0.25)' : 'none'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{ 
                                                        width: '32px', 
                                                        height: '32px', 
                                                        borderRadius: '8px', 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'center',
                                                        backgroundColor: activeBlockId === block.id ? '#6366F1' : 'rgba(0,0,0,0.1)',
                                                        color: activeBlockId === block.id ? 'white' : 'rgba(0,0,0,0.4)'
                                                    }}>
                                                        {block.type === 'text' && <Type size={14} />}
                                                        {block.type === 'image' && <ImageIcon size={14} />}
                                                        {block.type === 'video' && <Video size={14} />}
                                                        {block.type === 'button' && <MousePointer2 size={14} />}
                                                        {block.type === 'form' && <MessageSquare size={14} />}
                                                    </div>
                                                    <span style={{ fontSize: '12px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.6)' }}>{block.type}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <button onClick={(e) => {e.stopPropagation(); moveBlock(idx, 'up');}} style={{ padding: '6px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '8px', color: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer' }}><ChevronUp size={14} /></button>
                                                    <button onClick={(e) => {e.stopPropagation(); moveBlock(idx, 'down');}} style={{ padding: '6px', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: '8px', color: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer' }}><ChevronDown size={14} /></button>
                                                    <button onClick={(e) => {e.stopPropagation(); removeBlock(block.id);}} style={{ padding: '6px', backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: '8px', color: 'rgba(0,0,0,0.4)', border: 'none', cursor: 'pointer' }}><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                        {page.content_blocks.length === 0 && (
                                            <div style={{ textAlign: 'center', padding: '1.5rem', fontSize: '12px', fontWeight: 'bold', color: 'rgba(0,0,0,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', border: '2px dashed rgba(0,0,0,0.1)', borderRadius: '16px' }}>
                                                ยังไม่มีคอนเทนต์
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                        
                        {activeTab === 'design' && (
                            <div>
                                <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>ธีมและสี</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>สีหลัก</label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                                            {['#6366F1', '#F97316', '#10B981', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F59E0B'].map(c => (
                                                <button 
                                                    key={c}
                                                    onClick={() => setPage({...page, theme_config: {...page.theme_config, primary_color: c}})}
                                                    style={{ 
                                                        height: '40px', 
                                                        borderRadius: '8px', 
                                                        border: page.theme_config.primary_color === c ? '2px solid black' : '1px solid rgba(0,0,0,0.1)',
                                                        backgroundColor: c,
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'seo' && (
                            <div>
                                <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>การแชร์</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>QR Code</label>
                                        <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'center' }}>
                                            <QrCodeImage url={publicUrl} size={150} />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>แชร์ลิงก์</label>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <a
                                                href={`https://www.facebook.com/sharer/sharer.php?u=${publicUrl}`}
                                                target="_blank"
                                                style={{
                                                    backgroundColor: '#1877F2',
                                                    color: 'white',
                                                    padding: '1rem',
                                                    borderRadius: '16px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '12px',
                                                    fontSize: '12px',
                                                    fontWeight: 900,
                                                    textTransform: 'uppercase',
                                                    letterSpacing: '0.1em',
                                                    textDecoration: 'none',
                                                    flex: 1
                                                }}
                                            >
                                                <Share2 size={18} /> share to facebook
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div>
                                <h4 style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>ตั้งค่า</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>สถานะการเผยแพร่</label>
                                        <button
                                            onClick={() => setPage({...page, is_published: !page.is_published})}
                                            style={{
                                                padding: '12px 24px',
                                                borderRadius: '12px',
                                                fontWeight: 900,
                                                fontSize: '12px',
                                                textTransform: 'uppercase',
                                                letterSpacing: '0.1em',
                                                border: 'none',
                                                cursor: 'pointer',
                                                backgroundColor: page.is_published ? '#10B981' : '#EF4444',
                                                color: 'white'
                                            }}
                                        >
                                            {page.is_published ? 'เผยแพร่แล้ว' : 'ยังไม่เผยแพร่'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Editor Area */}
                <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                    <div style={{ 
                        flex: 1, 
                        overflow: 'auto', 
                        padding: '2rem',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'flex-start'
                    }}>
                        <div style={{
                            width: previewMode === 'desktop' ? '100%' : '375px',
                            maxWidth: previewMode === 'desktop' ? '1200px' : '375px',
                            height: previewMode === 'desktop' ? 'auto' : '667px',
                            backgroundColor: 'white',
                            borderRadius: '24px',
                            border: '1px solid rgba(0,0,0,0.1)',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                            overflow: 'hidden',
                            display: 'flex',
                            flexDirection: 'column'
                        }}>
                            {page.content_blocks.map((block) => (
                                <div key={block.id} style={{ position: 'relative' }}>
                                    <RenderBlock 
                                        block={block} 
                                        theme={page.theme_config} 
                                        isEditing={activeBlockId === block.id}
                                        aiLoading={aiLoading[block.id] || false}
                                        onUpdate={(content) => updateBlockContent(block.id, content)}
                                        onAiSuggest={() => handleAiSuggestCopy(block.id)}
                                    />
                                    
                                    {/* Block Label */}
                                    {activeBlockId === block.id && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '-48px',
                                            left: 0,
                                            backgroundColor: '#6366F1',
                                            color: 'white',
                                            fontSize: '10px',
                                            fontWeight: 900,
                                            padding: '8px 16px',
                                            borderRadius: '12px',
                                            boxShadow: '0 10px 25px -5px rgba(99,102,241,0.25)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px'
                                        }}>
                                            <div style={{ width: '8px', height: '8px', backgroundColor: 'white', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                                            EDITING: {block.type.toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            ))}
                            {page.content_blocks.length === 0 && (
                                <div style={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    height: '400px',
                                    color: 'rgba(0,0,0,0.3)',
                                    fontSize: '14px',
                                    fontWeight: 'bold',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em'
                                }}>
                                    <Layout size={48} style={{ marginBottom: '1rem' }} />
                                    เริ่มเพิ่มคอนเทนต์จากด้านซ้าย
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>

            <Toast 
                message={toast.message} 
                type={toast.type} 
                isVisible={toast.isVisible} 
                onClose={() => setToast({ ...toast, isVisible: false })} 
            />
        </div>
    );
}

function BlockTypeButton({ icon: Icon, label, onClick }: { icon: any, label: string, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1.25rem',
                backgroundColor: 'rgba(0,0,0,0.05)',
                border: '1px solid rgba(0,0,0,0.05)',
                borderRadius: '24px',
                cursor: 'pointer',
                transform: 'scale(1)',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
        >
            <div style={{ 
                width: '40px', 
                height: '40px', 
                borderRadius: '12px', 
                backgroundColor: '#6366F1', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: '12px'
            }}>
                <Icon size={22} style={{ color: 'white' }} />
            </div>
            <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(0,0,0,0.8)' }}>{label}</span>
        </button>
    );
}

// Keep RenderBlock as is but ensure it uses dynamic styles for editing inputs
interface FormSummary {
    id: number;
    name: string;
    description?: string;
    is_active: boolean;
}

function RenderBlock({ block, theme, isEditing, aiLoading, onUpdate, onAiSuggest }: {
    block: Block,
    theme: any,
    isEditing: boolean,
    aiLoading: boolean,
    onUpdate: (content: any) => void,
    onAiSuggest: () => void
}) {
    const primary = theme.primary_color || '#6366F1';
    const bg = theme.bg_color || '#000000';
    
    switch (block.type) {
        case 'text':
            return (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                    {isEditing ? (
                        <>
                            <input
                                style={{
                                    fontSize: 'clamp(2rem, 5vw, 4rem)',
                                    fontWeight: 900,
                                    letterSpacing: '-0.025em',
                                    marginBottom: '1.5rem',
                                    lineHeight: 1.1,
                                    color: primary,
                                    border: 'none',
                                    outline: 'none',
                                    backgroundColor: 'transparent',
                                    textAlign: 'center',
                                    width: '100%'
                                }}
                                value={block.content.title}
                                onChange={e => onUpdate({...block.content, title: e.target.value})}
                                placeholder="หัวข้อ"
                            />
                            <textarea
                                style={{
                                    fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
                                    lineHeight: 1.625,
                                    whiteSpace: 'pre-wrap',
                                    fontWeight: 500,
                                    width: '100%',
                                    border: 'none',
                                    outline: 'none',
                                    backgroundColor: 'transparent',
                                    textAlign: 'center',
                                    color: '#475569',
                                    minHeight: '100px',
                                    resize: 'vertical'
                                }}
                                value={block.content.body}
                                onChange={e => onUpdate({...block.content, body: e.target.value})}
                                placeholder="เนื้อหา"
                            />
                        </>
                    ) : (
                        <>
                            <h2 style={{ 
                                fontSize: 'clamp(2rem, 5vw, 4.5rem)',
                                fontWeight: 900,
                                letterSpacing: '-0.025em',
                                marginBottom: '1.5rem',
                                lineHeight: 1.1,
                                color: primary
                            }}>
                                {block.content.title}
                            </h2>
                            <p style={{
                                fontSize: 'clamp(1.125rem, 2.5vw, 1.5rem)',
                                lineHeight: 1.625,
                                whiteSpace: 'pre-wrap',
                                fontWeight: 500,
                                color: '#475569'
                            }}>
                                {block.content.body}
                            </p>
                        </>
                    )}
                </div>
            );
            
        case 'image':
            return (
                <div style={{ padding: '2rem' }}>
                    {isEditing ? (
                        <ImageBlockEditor block={block} onUpdate={onUpdate} />
                    ) : (
                        block.content.url && (
                            block.content.link ? (
                                <a href={block.content.link} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
                                    <img src={block.content.url} alt="Campaign visual" style={{ width: '100%', height: 'auto', display: 'block' }} />
                                </a>
                            ) : (
                                <img src={block.content.url} alt="Campaign visual" style={{ width: '100%', height: 'auto', display: 'block' }} />
                            )
                        )
                    )}
                </div>
            );
            
        case 'video':
            return (
                <div style={{ padding: '2rem' }}>
                    {isEditing ? (
                        <VideoUpload
                            value={{ url: block.content.url, autoplay: block.content.autoplay, enabled: true, link_enabled: false, link_url: '' }}
                            onChange={(config) => onUpdate({...block.content, url: config?.url || '', autoplay: config?.autoplay || false})}
                        />
                    ) : (
                        block.content.url && (
                            <video
                                src={block.content.url.startsWith('http') ? block.content.url : block.content.url.startsWith('/api') ? block.content.url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${block.content.url}`}
                                autoPlay={block.content.autoplay}
                                muted={block.content.autoplay}
                                loop
                                playsInline
                                controls={!block.content.autoplay}
                                style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                        )
                    )}
                </div>
            );
            
        case 'button':
            return (
                <div style={{ padding: '2rem', textAlign: 'center' }}>
                    {isEditing ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                            <input
                                type="text"
                                style={{
                                    padding: '12px 24px',
                                    border: '1px solid #D9E1F2',
                                    borderRadius: '12px',
                                    fontSize: '16px',
                                    fontWeight: 900,
                                    textAlign: 'center',
                                    width: 'auto'
                                }}
                                value={block.content.text}
                                onChange={e => onUpdate({...block.content, text: e.target.value})}
                                placeholder="ข้อความปุ่ม"
                            />
                            <input
                                type="text"
                                style={{
                                    padding: '12px',
                                    border: '1px solid #D9E1F2',
                                    borderRadius: '8px',
                                    fontSize: '14px',
                                    width: '300px'
                                }}
                                value={block.content.link}
                                onChange={e => onUpdate({...block.content, link: e.target.value})}
                                placeholder="ลิงก์"
                            />
                        </div>
                    ) : (
                        <a 
                            href={block.content.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'inline-block',
                                padding: '16px 32px',
                                backgroundColor: primary,
                                color: 'white',
                                borderRadius: '12px',
                                fontWeight: 900,
                                fontSize: '16px',
                                textDecoration: 'none',
                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.25)'
                            }}
                        >
                            {block.content.text}
                        </a>
                    )}
                </div>
            );
            
        case 'form':
            return (
                <div style={{ padding: '2rem' }}>
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 900, color: primary, marginBottom: '1rem' }}>
                            {block.content.title || 'ติดต่อเรา'}
                        </h3>
                        <p style={{ color: '#64748B', lineHeight: 1.6 }}>
                            {block.content.description || 'กรุณากรอกข้อมูลเพื่อติดต่อกลับ'}
                        </p>
                    </div>
                    
                    <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="ชื่อ"
                            style={{
                                padding: '16px',
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                fontSize: '16px'
                            }}
                        />
                        <input
                            type="email"
                            placeholder="อีเมล"
                            style={{
                                padding: '16px',
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                fontSize: '16px'
                            }}
                        />
                        <textarea
                            placeholder="ข้อความ"
                            rows={4}
                            style={{
                                padding: '16px',
                                border: '1px solid #E2E8F0',
                                borderRadius: '12px',
                                fontSize: '16px',
                                resize: 'vertical'
                            }}
                        />
                        <button
                            type="submit"
                            style={{
                                padding: '16px 32px',
                                backgroundColor: primary,
                                color: 'white',
                                borderRadius: '12px',
                                fontWeight: 900,
                                fontSize: '16px',
                                border: 'none',
                                cursor: 'pointer'
                            }}
                        >
                            ส่งข้อมูล
                        </button>
                    </form>
                </div>
            );
            
        default:
            return <div>Unknown block type</div>;
    }
}
