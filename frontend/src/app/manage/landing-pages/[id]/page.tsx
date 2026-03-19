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

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud';
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
        if (!page) return;
        setSaving(true);
        try {
            const endpoint = options?.draft
                ? `${API_URL}/landing-pages/${id}/draft`
                : `${API_URL}/landing-pages/${id}`;

            const res = await fetch(endpoint, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: page.title,
                    slug: page.slug,
                    description: page.description,
                    content_blocks: page.content_blocks,
                    theme_config: page.theme_config,
                    seo_metadata: page.seo_metadata,
                    is_published: page.is_published
                })
            });
            if (res.ok) {
                const updated = await res.json();
                setPage({
                    ...updated,
                    content_blocks: updated.content_blocks || [],
                    theme_config: updated.theme_config || page.theme_config,
                });
                if (!options?.silent) {
                    setSaveStatus({ type: 'success', message: 'บันทึกเรียบร้อยแล้ว' });
                    showToast('บันทึกข้อมูลหน้าแคมเปญเรียบร้อยแล้ว', 'success');
                    setTimeout(() => setSaveStatus({ type: null, message: '' }), 3000);
                }
            } else {
                const errData = await res.json();
                if (!options?.silent) {
                    if (errData.message === 'Slug already exists') {
                        setSaveStatus({ type: 'error', message: 'ไม่สามารถบันทึกได้: URL (Slug) นี้ถูกใช้ไปแล้ว' });
                        showToast('URL นี้ถูกใช้ไปแล้ว กรุณาเปลี่ยนใหม่', 'error');
                    } else {
                        setSaveStatus({ type: 'error', message: 'เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่' });
                        showToast('เกิดข้อผิดพลาดในการบันทึก', 'error');
                    }
                    setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
                }
            }
        } catch (error) {
            console.error(error);
            if (!options?.silent) {
                setSaveStatus({ type: 'error', message: 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้' });
                showToast('ไม่สามารถติดต่อเซิร์ฟเวอร์ได้', 'error');
                setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
            }
        } finally {
            setSaving(false);
        }
    };

    const savePage = async () => {
        await doSave();
    };

    // Auto-save draft (เมื่อมีการแก้ไข content/theme/seo)
    useEffect(() => {
        if (!page || !hasLoadedRef.current) return;
        if (loading) return;

        if (autoSaveTimeoutRef.current) {
            clearTimeout(autoSaveTimeoutRef.current);
        }

        autoSaveTimeoutRef.current = setTimeout(async () => {
            setAutoSaving(true);
            try {
                await doSave({ silent: true });
            } finally {
                setAutoSaving(false);
            }
        }, 3000); // หน่วง 3 วินาทีหลังหยุดพิมพ์

        return () => {
            if (autoSaveTimeoutRef.current) {
                clearTimeout(autoSaveTimeoutRef.current);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page]);

    const addBlock = (type: Block['type']) => {
        if (!page) return;
        const newBlock: Block = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: type === 'text' ? { title: 'หัวข้อใหม่', body: 'เริ่มเขียนข้อความสื่อสารกับลูกค้าของคุณที่นี่...' } :
                     type === 'image' ? { url: '' } :
                     type === 'video' ? { url: '', video_config: null, source_type: 'embed' } :
                     type === 'button' ? { label: 'คลิกเพื่อดูรายละเอียด', url: '' } :
                     { mode: 'external', url: '', thank_you_message: 'ขอบคุณที่สนใจ ทีมงานจะติดต่อกลับโดยเร็วที่สุด' } // form
        };
        setPage({ ...page, content_blocks: [...page.content_blocks, newBlock] });
        setActiveBlockId(newBlock.id);
    };

    const removeBlock = (blockId: string) => {
        if (!page) return;
        setPage({ ...page, content_blocks: page.content_blocks.filter(b => b.id !== blockId) });
    };

    const moveBlock = (index: number, direction: 'up' | 'down') => {
        if (!page) return;
        const newBlocks = [...page.content_blocks];
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= newBlocks.length) return;
        [newBlocks[index], newBlocks[newIndex]] = [newBlocks[newIndex], newBlocks[index]];
        setPage({ ...page, content_blocks: newBlocks });
    };

    const updateBlockContent = (blockId: string, content: any) => {
        if (!page) return;
        setPage({
            ...page,
            content_blocks: page.content_blocks.map(b => b.id === blockId ? { ...b, content } : b)
        });
    };

    const handleAiSuggestCopy = async (blockId: string) => {
        if (!page || !token) return;
        const block = page.content_blocks.find(b => b.id === blockId);
        if (!block || (block.type !== 'text' && block.type !== 'button')) return;

        setAiLoading(prev => ({ ...prev, [blockId]: true }));
        try {
            const body: any = {};
            if (block.type === 'text') {
                body.title = block.content.title;
                body.subtitle = block.content.body;
            } else if (block.type === 'button') {
                body.cta = block.content.label;
                body.title = page.title;
            }

            const res = await fetch(`${API_URL}/create-lite/ai-copy`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                const data = await res.json();
                if (block.type === 'button') {
                    updateBlockContent(blockId, {
                        ...block.content,
                        label: data.cta || block.content.label,
                    });
                } else {
                    updateBlockContent(blockId, {
                        ...block.content,
                        title: data.title || block.content.title,
                        body: data.subtitle || block.content.body,
                    });
                }
            }
        } catch (error) {
            console.error('AI Suggestion failed', error);
        } finally {
            setAiLoading(prev => ({ ...prev, [blockId]: false }));
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#F97316]" size={32} />
        </div>
    );
    if (!page) return <div>ไม่พบข้อมูลหน้านี้</div>;

    const publicUrl = `${SITE_URL}/lp/${page.slug}`;

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-[#EEF0FF] text-[#0F172A] transition-colors duration-500">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_32%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.34),transparent_40%),linear-gradient(180deg,#f8faff_0%,#eef0ff_50%,#e8eeff_100%)]" />
                <div className="absolute left-[-7rem] top-10 h-80 w-80 rounded-full bg-sky-300/16 blur-[120px]" />
                <div className="absolute right-[-6rem] top-24 h-72 w-72 rounded-full bg-[#050579]/8 blur-[120px]" />
            </div>
            {/* Top Editor Bar */}
            <header className="z-50 mx-4 mt-4 flex h-20 shrink-0 items-center justify-between rounded-[28px] border border-[#D9E1F2] bg-white/84 px-5 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:mx-6">
                <div className="flex items-center gap-4">
                    <Link href="/manage/landing-pages" className="group flex h-10 w-10 items-center justify-center rounded-xl border border-[#D9E1F2] bg-[#F6F8FF] transition-all hover:bg-white">
                        <ArrowLeft size={18} className="text-[#64748B] group-hover:text-[#050579] transition-all" />
                    </Link>
                    <div className="mx-2 hidden h-6 w-[1px] bg-[#D9E1F2] sm:block"></div>
                    <div className="hidden sm:block">
                        <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#64748B]">Landing Page Editor</div>
                        <input 
                            className="bg-transparent font-black text-sm text-[#050579] focus:outline-none border-b border-transparent focus:border-[#F97316] px-1 transition-all"
                            value={page.title}
                            onChange={e => setPage({...page, title: e.target.value})}
                        />
                        <div className="flex items-center gap-2 mt-0.5 ml-1">
                            <div className="text-[10px] text-foreground/50 font-black uppercase tracking-widest">SLUG: /lp/{page.slug}</div>
                            <a 
                                href={publicUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#050579] hover:text-[#F97316] transition-colors bg-[#F6F8FF] px-2 py-0.5 rounded-md border border-[#D9E1F2]"
                            >
                                <ExternalLink size={10} />
                                ดูหน้าเว็บ (Live)
                            </a>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex rounded-xl border border-[#D9E1F2] bg-[#F6F8FF] p-1">
                        <button 
                            onClick={() => setPreviewMode('desktop')}
                            className={`p-2 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-white text-[#050579] shadow-sm' : 'text-[#94A3B8] hover:text-[#475569]'}`}
                        >
                            <Monitor size={18} />
                        </button>
                        <button 
                            onClick={() => setPreviewMode('mobile')}
                            className={`p-2 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-white text-[#050579] shadow-sm' : 'text-[#94A3B8] hover:text-[#475569]'}`}
                        >
                            <Smartphone size={18} />
                        </button>
                    </div>

                    <div className="mx-1 hidden h-6 w-[1px] bg-[#D9E1F2] sm:block"></div>

                    <div className="flex flex-col items-end gap-1">
                        <button 
                            onClick={savePage}
                            disabled={saving}
                            className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50 ${
                                saveStatus.type === 'success' ? 'bg-emerald-500 shadow-emerald-500/20' : 
                                saveStatus.type === 'error' ? 'bg-red-500 shadow-red-500/20' : 
                                'bg-[#F97316] shadow-[0_18px_40px_-26px_rgba(249,115,22,0.45)] hover:bg-[#EA580C]'
                            }`}
                        >
                            {saving ? <Loader2 className="animate-spin" size={16} /> : 
                             saveStatus.type === 'success' ? <CheckCircle size={18} /> :
                             saveStatus.type === 'error' ? <Trash2 size={18} /> : // Using Trash2 as an 'X' icon briefly or just Save
                             <Save size={18} />}
                            <span className="hidden md:inline">
                                {saveStatus.type === 'success' ? 'บันทึกสำเร็จ' : 
                                 saveStatus.type === 'error' ? 'ล้มเหลว' : 
                                 'บันทึกหน้าแคมเปญ'}
                            </span>
                        </button>
                        <span className={`text-xs font-medium transition-colors ${saveStatus.type === 'error' ? 'text-red-500' : saveStatus.type === 'success' ? 'text-emerald-500' : 'text-[#64748B]'}`}>
                            {saveStatus.message || (autoSaving ? 'กำลังบันทึกอัตโนมัติ...' : 'ระบบจะบันทึกอัตโนมัติระหว่างแก้ไข')}
                        </span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Toolbar (Blocks) */}
                <aside className="w-80 border-r border-foreground/5 bg-card-bg flex flex-col overflow-hidden shrink-0 transition-colors duration-500">
                    <div className="flex border-b border-foreground/5">
                        <button onClick={() => setActiveTab('content')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'content' ? 'text-primary bg-primary/5 border-b-2 border-primary' : 'text-foreground/50 hover:text-foreground/80'}`}>เนื้อหา</button>
                        <button onClick={() => setActiveTab('design')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'design' ? 'text-primary bg-primary/5 border-b-2 border-primary' : 'text-foreground/50 hover:text-foreground/80'}`}>ดีไซน์</button>
                        <button onClick={() => setActiveTab('seo')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'seo' ? 'text-primary bg-primary/5 border-b-2 border-primary' : 'text-foreground/50 hover:text-foreground/80'}`}>การแชร์</button>
                        <button onClick={() => setActiveTab('settings')} className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'settings' ? 'text-primary bg-primary/5 border-b-2 border-primary' : 'text-foreground/50 hover:text-foreground/80'}`}>ตั้งค่า</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {activeTab === 'content' && (
                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-6 flex items-center gap-2">
                                        <Plus size={14} className="text-primary" /> เพิ่มคอมโพเนนต์
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <BlockTypeButton icon={Type} label="ข้อความ" onClick={() => addBlock('text')} />
                                        <BlockTypeButton icon={ImageIcon} label="รูปภาพ" onClick={() => addBlock('image')} />
                                        <BlockTypeButton icon={Video} label="วิดีโอ" onClick={() => addBlock('video')} />
                                        <BlockTypeButton icon={MousePointer2} label="ปุ่มกด" onClick={() => addBlock('button')} />
                                        <BlockTypeButton icon={MessageSquare} label="แบบฟอร์ม" onClick={() => addBlock('form')} />
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-foreground/5">
                                    <h4 className="text-xs font-bold text-foreground/50 uppercase tracking-wider mb-6 flex items-center gap-2">
                                        <GripVertical size={14} className="text-primary" /> ลำดับโครงสร้าง
                                    </h4>
                                    <div className="space-y-3">
                                        {page.content_blocks.map((block, idx) => (
                                            <div 
                                                key={block.id} 
                                                onClick={() => setActiveBlockId(block.id)}
                                                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${activeBlockId === block.id ? 'bg-primary/5 border-primary shadow-lg shadow-primary/5' : 'bg-foreground/5 border-transparent hover:border-foreground/10'}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeBlockId === block.id ? 'bg-primary text-white' : 'bg-foreground/10 text-foreground/40'}`}>
                                                        {block.type === 'text' && <Type size={14} />}
                                                        {block.type === 'image' && <ImageIcon size={14} />}
                                                        {block.type === 'video' && <Video size={14} />}
                                                        {block.type === 'button' && <MousePointer2 size={14} />}
                                                        {block.type === 'form' && <MessageSquare size={14} />}
                                                    </div>
                                                    <span className="text-xs font-black uppercase tracking-widest text-foreground/60">{block.type}</span>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => {e.stopPropagation(); moveBlock(idx, 'up');}} className="p-1.5 hover:bg-foreground/10 rounded-lg text-foreground/40 hover:text-foreground transition-all"><ChevronUp size={14} /></button>
                                                    <button onClick={(e) => {e.stopPropagation(); moveBlock(idx, 'down');}} className="p-1.5 hover:bg-foreground/10 rounded-lg text-foreground/40 hover:text-foreground transition-all"><ChevronDown size={14} /></button>
                                                    <button onClick={(e) => {e.stopPropagation(); removeBlock(block.id);}} className="p-1.5 hover:bg-red-500/10 rounded-lg text-foreground/40 hover:text-red-500 transition-all"><Trash2 size={14} /></button>
                                                </div>
                                            </div>
                                        ))}
                                        {page.content_blocks.length === 0 && (
                                            <div className="text-center py-6 text-xs font-bold text-foreground/30 uppercase tracking-widest border-2 border-dashed border-foreground/10 rounded-2xl">
                                                ยังไม่มีคอนเทนต์
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'design' && (
                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-foreground/60 ml-1">สีหลักแคมเปญ (Primary)</label>
                                    <div className="flex items-center gap-4 bg-foreground/5 p-4 rounded-2xl border border-foreground/5">
                                        <input 
                                            type="color" 
                                            className="w-10 h-10 rounded-xl bg-transparent border-none cursor-pointer overflow-hidden sr-only"
                                            id="primary-color-input"
                                            value={page.theme_config.primary_color}
                                            onChange={e => setPage({...page, theme_config: {...page.theme_config, primary_color: e.target.value}})}
                                        />
                                        <label htmlFor="primary-color-input" className="w-10 h-10 rounded-xl border border-foreground/10 cursor-pointer shadow-lg" style={{ backgroundColor: page.theme_config.primary_color }} />
                                        <input 
                                            type="text"
                                            value={page.theme_config.primary_color}
                                            onChange={e => setPage({...page, theme_config: {...page.theme_config, primary_color: e.target.value}})}
                                            className="flex-1 bg-transparent border-none text-xs font-black uppercase tracking-widest focus:ring-0 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-sm font-bold text-foreground/60 ml-1">ฉากหลัง (Backdrop)</label>
                                    <div className="grid grid-cols-5 gap-3">
                                        {['#000000', '#0f172a', '#1e1b4b', '#450a0a', '#ffffff'].map(c => (
                                            <button 
                                                key={c}
                                                onClick={() => setPage({...page, theme_config: {...page.theme_config, bg_color: c}})}
                                                className={`h-10 w-full rounded-xl border-2 transition-all shadow-sm ${page.theme_config.bg_color === c ? 'border-primary scale-110 shadow-primary/20 ring-4 ring-primary/10' : 'border-background hover:scale-105'}`}
                                                style={{ backgroundColor: c }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'seo' && page && (
                            <div className="space-y-10 pt-6">
                                {/* SEO Metadata Editor */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-foreground/60 mb-2 ml-1">
                                            URL Slug (ตัวอย่าง: nexsolution.cloud/lp/your-slug)
                                        </label>
                                        <div className="flex items-center bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-4 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                            <span className="text-foreground/30 text-xs font-bold mr-1">/lp/</span>
                                            <input
                                                className="w-full bg-transparent border-none focus:outline-none focus:ring-0 font-bold p-0"
                                                placeholder="your-slug"
                                                value={page.slug}
                                                onChange={(e) =>
                                                    setPage({
                                                        ...page,
                                                        slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                                                    })
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-foreground/60 mb-2 ml-1">
                                            SEO Title
                                        </label>
                                        <input
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold"
                                            placeholder={page.title}
                                            value={page.seo_metadata?.title || ''}
                                            onChange={(e) =>
                                                setPage({
                                                    ...page,
                                                    seo_metadata: {
                                                        ...(page.seo_metadata || {}),
                                                        title: e.target.value,
                                                    },
                                                })
                                            }
                                        />
                                        <p className="text-[11px] text-foreground/40 mt-1 ml-1">
                                            ถ้าเว้นว่างไว้ ระบบจะใช้ชื่อแคมเปญเป็น SEO Title ให้อัตโนมัติ
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-foreground/60 mb-2 ml-1">
                                            SEO Description
                                        </label>
                                        <textarea
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm min-h-[100px]"
                                            placeholder={page.description || 'ข้อความสั้น ๆ เพื่ออธิบายหน้าโปรโมชั่นนี้'}
                                            value={page.seo_metadata?.description || ''}
                                            onChange={(e) =>
                                                setPage({
                                                    ...page,
                                                    seo_metadata: {
                                                        ...(page.seo_metadata || {}),
                                                        description: e.target.value,
                                                    },
                                                })
                                            }
                                        />
                                        <p className="text-[11px] text-foreground/40 mt-1 ml-1">
                                            แนะนำ 80–160 ตัวอักษร เพื่อให้แสดงผลสวยงามในผลการค้นหา
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-foreground/60 mb-2 ml-1">
                                            Keywords (comma separated)
                                        </label>
                                        <input
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                            placeholder="promotion, nex, namecard, campaign"
                                            value={page.seo_metadata?.keywords || ''}
                                            onChange={(e) =>
                                                setPage({
                                                    ...page,
                                                    seo_metadata: {
                                                        ...(page.seo_metadata || {}),
                                                        keywords: e.target.value,
                                                    },
                                                })
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-foreground/60 mb-2 ml-1">
                                            OG Image URL (รูปสำหรับแชร์บนโซเชียล)
                                        </label>
                                        <input
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                                            placeholder="https://..."
                                            value={page.seo_metadata?.og_image || ''}
                                            onChange={(e) =>
                                                setPage({
                                                    ...page,
                                                    seo_metadata: {
                                                        ...(page.seo_metadata || {}),
                                                        og_image: e.target.value,
                                                    },
                                                })
                                            }
                                        />
                                        <p className="text-[11px] text-foreground/40 mt-1 ml-1">
                                            แนะนำรูปแนวนอนอย่างน้อย 1200x630px
                                        </p>
                                    </div>
                                </div>

                                {/* Share & QR section */}
                                <div className="space-y-8 text-center pt-4">
                                    <div className="p-6 bg-white rounded-[40px] inline-block shadow-2xl shadow-primary/20 hover:scale-105 transition-transform duration-500">
                                        <QrCodeImage url={publicUrl} size={150} />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-xl font-black tracking-tighter">แชร์สู่สาธารณะ</h3>
                                        <p className="text-xs font-medium text-foreground/40 leading-relaxed px-4">
                                            ระบบสร้าง QR Code และลิงก์สาธารณะให้โดยอัตโนมัติ คุณสามารถนำไปแปะในโบรชัวร์ โพสต์ หรือโฆษณาได้ทันที
                                        </p>
                                        <div className="grid grid-cols-1 gap-3 px-2">
                                            <a
                                                href={`https://www.facebook.com/sharer/sharer.php?u=${publicUrl}`}
                                                target="_blank"
                                                className="bg-blue-600 text-white py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-blue-600/20"
                                            >
                                                <Share2 size={18} /> share to facebook
                                            </a>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(publicUrl);
                                                    showToast('คัดลอกลิงก์ลงในคลิปบอร์ดแล้ว', 'success');
                                                }}
                                                className="bg-foreground text-background py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-foreground/5"
                                            >
                                                <Globe size={18} /> copy url
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && page && (
                            <div className="space-y-8 pt-6">
                                {/* Contact Settings */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-6">
                                        <MessageCircle size={18} className="text-primary" />
                                        <h3 className="text-sm font-black uppercase tracking-widest text-foreground/70">การติดต่อ</h3>
                                    </div>
                                    
                                    {/* Show Lead Form */}
                                    <div className="flex items-center justify-between bg-foreground/5 p-4 rounded-2xl border border-foreground/5">
                                        <div>
                                            <h4 className="font-bold text-sm mb-1">แสดงแบบฟอร์มติดต่อ</h4>
                                            <p className="text-xs text-foreground/50">อนุญาตให้ผู้เยี่ยมชมส่งข้อความติดต่อได้</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={page.theme_config?.show_lead_form !== false}
                                                onChange={(e) => setPage({
                                                    ...page,
                                                    theme_config: {
                                                        ...page.theme_config,
                                                        show_lead_form: e.target.checked
                                                    }
                                                })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                    
                                    {/* Show Contact Info */}
                                    <div className="flex items-center justify-between bg-foreground/5 p-4 rounded-2xl border border-foreground/5">
                                        <div>
                                            <h4 className="font-bold text-sm mb-1">แสดงข้อมูลติดต่อ</h4>
                                            <p className="text-xs text-foreground/50">แสดงอีเมล, เบอร์โทร บนหน้าแคมเปญ</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                checked={page.theme_config?.show_contact_info !== false}
                                                onChange={(e) => setPage({
                                                    ...page,
                                                    theme_config: {
                                                        ...page.theme_config,
                                                        show_contact_info: e.target.checked
                                                    }
                                                })}
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Preview / Editor Area */}
                <main className="flex-1 bg-background/80 flex items-center justify-center p-4 md:p-12 overflow-y-auto custom-scrollbar relative">
                    {/* Background decoration */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
                    
                    <div className={`transition-all duration-700 ease-in-out bg-black shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-foreground/5 relative overflow-y-auto custom-scrollbar ${previewMode === 'mobile' ? 'w-[375px] h-[760px] rounded-[56px] ring-[12px] ring-foreground/5' : 'w-full h-full max-w-5xl rounded-[40px]'}`} 
                         style={{ backgroundColor: page.theme_config.bg_color, color: page.theme_config.bg_color === '#ffffff' ? '#000' : '#fff' }}>
                        
                        {/* Fake Mobile Status Bar */}
                        {previewMode === 'mobile' && (
                            <div className="sticky top-0 h-10 w-full bg-black/40 backdrop-blur-md flex items-center justify-center z-10">
                                <div className="w-24 h-6 bg-background/20 rounded-full border border-foreground/5" />
                            </div>
                        )}

                        <div className="p-12 md:p-24 space-y-20">
                            {page.content_blocks.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-20 select-none animate-pulse">
                                    <Sparkles size={80} className="mb-8" />
                                    <h3 className="text-5xl font-black tracking-tighter mb-4">WORKSPACE</h3>
                                    <p className="max-w-md mx-auto text-xl font-medium">เริ่มต้นสร้างความประทับใจโดยการเลือกคอมโพเนนต์ทางด้านซ้าย</p>
                                </div>
                            ) : (
                                page.content_blocks.map(block => (
                                    <div 
                                        key={block.id} 
                                        id={block.id}
                                        onClick={(e) => {e.stopPropagation(); setActiveBlockId(block.id);}}
                                        className={`group relative transition-all duration-500 rounded-3xl ${activeBlockId === block.id ? 'ring-4 ring-primary ring-offset-[12px] ring-offset-transparent' : 'hover:ring-2 hover:ring-foreground/10 hover:ring-offset-8 hover:ring-offset-transparent'}`}
                                    >
                                        <RenderBlock 
                                            block={block} 
                                            theme={page.theme_config} 
                                            isEditing={activeBlockId === block.id}
                                            aiLoading={aiLoading[block.id] || false}
                                            onUpdate={(content) => updateBlockContent(block.id, content)}
                                            onAiSuggest={() => handleAiSuggestCopy(block.id)}
                                        />
                                        
                                        {/* Block Label */}
                                        <div className={`absolute -top-12 left-0 bg-primary text-white text-[10px] font-black px-4 py-2 rounded-xl transition-all duration-500 shadow-xl shadow-primary/20 ${activeBlockId === block.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                                EDITING: {block.type.toUpperCase()}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Footer decorative */}
                        <div className="py-20 text-center opacity-10">
                            <h4 className="font-black text-2xl tracking-[0.5em] uppercase">Built with NEX Solution</h4>
                        </div>
                    </div>
                </main>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(var(--primary-rgb), 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(var(--primary-rgb), 0.2);
                }
            `}</style>
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
            className="flex flex-col items-center justify-center p-5 bg-foreground/5 border border-foreground/5 rounded-[24px] hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-1 transition-all group active:scale-95 shadow-sm"
        >
            <div className="w-10 h-10 rounded-xl bg-foreground/5 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
                <Icon size={22} className="text-foreground/30 group-hover:text-primary transition-colors" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40 group-hover:text-foreground">{label}</span>
        </button>
    );
}

// Keep RenderBlock as is but ensure it uses dynamic styles for editing inputs
interface FormSummary {
    id: number;
    name: string;
    description?: string;
    is_active: boolean;
    created_at: string;
}

function RenderBlock({ block, theme, isEditing, aiLoading, onUpdate, onAiSuggest }: { block: Block, theme: any, isEditing: boolean, aiLoading: boolean, onUpdate: (content: any) => void, onAiSuggest: () => void }) {
    const [uploadingImage, setUploadingImage] = useState(false);
    const [imageProgress, setImageProgress] = useState(0);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    // แบบฟอร์มที่สร้างไว้ในระบบ (ใช้กับโหมด internal form)
    const [forms, setForms] = useState<FormSummary[] | null>(null);
    const [formsLoading, setFormsLoading] = useState(false);
    const [formsError, setFormsError] = useState<string | null>(null);

    useEffect(() => {
        if (block.type !== 'form') return;
        if (block.content?.mode !== 'internal') return;
        if (forms !== null || formsLoading) return;

        const token = Cookies.get('token');
        if (!token) return;

        const load = async () => {
            try {
                setFormsLoading(true);
                setFormsError(null);
                const res = await fetch(`${API_URL}/forms`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) {
                    throw new Error('โหลดรายการฟอร์มไม่สำเร็จ');
                }
                const data = await res.json();
                setForms(data);
            } catch (e: any) {
                console.error(e);
                setFormsError(e?.message || 'ไม่สามารถดึงข้อมูลฟอร์มได้');
            } finally {
                setFormsLoading(false);
            }
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [block.type, block.content?.mode]);

    const pollImageStatus = async (jobId: string) => {
        const token = Cookies.get('token');
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_URL}/uploads/job/${jobId}`, {
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                });
                if (!res.ok) return;
                const status = await res.json();
                
                if (status.state === 'completed' && status.result) {
                    clearInterval(interval);
                    setUploadingImage(false);
                    setImageProgress(100);
                    onUpdate({
                        ...(block.content || {}),
                        url: status.result.url,
                    });
                } else if (status.state === 'failed') {
                    clearInterval(interval);
                    setUploadingImage(false);
                    alert(`ประมวลผลรูปภาพไม่สำเร็จ: ${status.failedReason || 'Unknown error'}`);
                } else {
                    setImageProgress(status.progress || 0);
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        }, 1000);
    };

    const handleImageUpload = async (file: File) => {
        if (!file) return;
        setUploadingImage(true);
        setImageProgress(0);
        try {
            const token = Cookies.get('token');
            const formData = new FormData();
            formData.append('file', file);
            const res = await fetch(`${API_URL}/uploads/image`, {
                method: 'POST',
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                body: formData,
            });
            if (!res.ok) {
                alert('อัปโหลดรูปภาพไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
                setUploadingImage(false);
                return;
            }
            const data = await res.json();
            if (data.jobId) {
                pollImageStatus(data.jobId);
            } else {
                setUploadingImage(false);
                onUpdate({
                    ...(block.content || {}),
                    url: data.url,
                });
            }
        } catch (e) {
            console.error(e);
            alert('เกิดข้อผิดพลาดระหว่างอัปโหลดรูปภาพ');
            setUploadingImage(false);
        }
    };

    const applyTextFormat = (format: 'bold' | 'italic' | 'link') => {
        if (!block.content?.body) return;
        const textarea = document.getElementById(`text-body-${block.id}`) as HTMLTextAreaElement | null;
        if (!textarea) return;
        const { selectionStart, selectionEnd, value } = textarea;
        const selected = value.substring(selectionStart, selectionEnd) || 'ข้อความ';

        let prefix = '';
        let suffix = '';
        if (format === 'bold') {
            prefix = '**';
            suffix = '**';
        } else if (format === 'italic') {
            prefix = '*';
            suffix = '*';
        } else if (format === 'link') {
            prefix = '[';
            suffix = '](https://)';
        }

        const newBody =
            value.substring(0, selectionStart) +
            prefix +
            selected +
            suffix +
            value.substring(selectionEnd);

        onUpdate({
            ...block.content,
            body: newBody,
        });

        // restore selection roughly around new text
        setTimeout(() => {
            textarea.focus();
            const offsetStart = selectionStart + prefix.length;
            const offsetEnd = offsetStart + selected.length;
            textarea.setSelectionRange(offsetStart, offsetEnd);
        }, 0);
    };

    switch (block.type) {
        case 'text':
            return (
                <div className="max-w-3xl mx-auto text-center md:text-left">
                    {isEditing ? (
                        <div className="space-y-6">
                            <input 
                                className="w-full bg-foreground/5 rounded-2xl px-6 py-4 text-5xl md:text-7xl font-black tracking-tighter focus:outline-none border-2 border-transparent focus:border-primary/20 transition-all font-sans"
                                value={block.content.title}
                                onChange={e => onUpdate({...block.content, title: e.target.value})}
                                style={{ color: theme.bg_color === '#ffffff' ? '#000' : '#fff' }}
                            />
                            <div className="bg-foreground/5 rounded-2xl border border-foreground/10">
                                <div className="flex items-center justify-between px-4 py-2 border-b border-foreground/10 text-foreground/40">
                                     <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => applyTextFormat('bold')}
                                            className="p-1.5 rounded-md hover:bg-foreground/10"
                                            title="ตัวหนา (**ข้อความ**)"
                                        >
                                            <Bold size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => applyTextFormat('italic')}
                                            className="p-1.5 rounded-md hover:bg-foreground/10"
                                            title="ตัวเอียง (*ข้อความ*)"
                                        >
                                            <Italic size={14} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => applyTextFormat('link')}
                                            className="p-1.5 rounded-md hover:bg-foreground/10"
                                            title="ลิงก์ [ข้อความ](https://)"
                                        >
                                            <LinkIcon size={14} />
                                        </button>
                                        <div className="h-4 w-[1px] bg-foreground/10 mx-1" />
                                        <button
                                            type="button"
                                            onClick={onAiSuggest}
                                            disabled={aiLoading}
                                            className="flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all font-black text-[10px] uppercase tracking-wider"
                                        >
                                            {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                            AI Suggest
                                        </button>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-[0.25em]">
                                        รองรับ Markdown พื้นฐาน
                                    </span>
                                </div>
                                <textarea 
                                    id={`text-body-${block.id}`}
                                    className="w-full bg-transparent px-6 py-4 text-xl text-foreground/70 leading-relaxed focus:outline-none h-48 resize-none transition-all font-medium"
                                    value={block.content.body}
                                    onChange={e => onUpdate({...block.content, body: e.target.value})}
                                    placeholder="พิมพ์ข้อความ แล้วใช้ **ตัวหนา**, *ตัวเอียง* หรือ [ลิงก์](https://...) ได้"
                                />
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-10 leading-[0.9]">{block.content.title}</h2>
                            <p className="text-xl md:text-2xl opacity-60 leading-relaxed max-w-2xl whitespace-pre-wrap font-medium">
                                {block.content.body}
                            </p>
                        </>
                    )}
                </div>
            );
        case 'image':
            return (
                <div className="max-w-5xl mx-auto">
                    {isEditing ? (
                        <div className="p-8 bg-white border-2 border-dashed border-gray-200 rounded-[32px] text-center space-y-6 shadow-lg">
                            {/* Show preview if image exists */}
                            {block.content.url ? (
                                <div className="relative">
                                    <img 
                                        src={block.content.url} 
                                        alt="Preview" 
                                        className="w-full h-auto rounded-2xl shadow-lg max-h-[400px] object-contain bg-gray-100"
                                    />
                                    <button
                                        onClick={() => onUpdate({ ...(block.content || {}), url: '' })}
                                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all"
                                        title="ลบรูป"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                        <ImageIcon size={32} className="text-gray-400" />
                                    </div>
                                    <p className="text-base font-bold text-gray-700">อัปโหลดรูปภาพ หรือวางลิงก์รูปภาพภายนอก</p>
                                </>
                            )}
                            
                            <div className="flex flex-col md:flex-row gap-3">
                                <label className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gray-100 cursor-pointer border border-gray-300 hover:border-primary hover:bg-primary/5 transition-all text-sm font-bold text-gray-700">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleImageUpload(file);
                                        }}
                                    />
                                    {uploadingImage ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="flex items-center gap-2">
                                                <Loader2 size={16} className="animate-spin" /> 
                                                <span className="text-sm font-bold">{imageProgress}%</span>
                                            </div>
                                            <div className="w-20 bg-gray-300 h-1 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-primary transition-all duration-300"
                                                    style={{ width: `${imageProgress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <ImageIcon size={18} className="text-gray-500" /> เลือกรูปจากเครื่อง
                                        </>
                                    )}
                                </label>
                                <input 
                                    className="flex-[2] bg-gray-50 border border-gray-300 rounded-2xl px-6 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all text-gray-700 placeholder:text-gray-400"
                                    placeholder="https://images.unsplash.com/..."
                                    value={block.content.url || ''}
                                    onChange={e => onUpdate({ ...(block.content || {}), url: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left pt-4 border-t border-gray-200">
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 ml-1">
                                        การจัดวาง
                                    </label>
                                    <div className="inline-flex rounded-xl bg-gray-100 border border-gray-300 p-1">
                                        <button
                                            type="button"
                                            onClick={() => onUpdate({ ...(block.content || {}), align: 'left' })}
                                            className={`p-2 rounded-lg ${(!block.content.align || block.content.align === 'left') ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <AlignLeft size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onUpdate({ ...(block.content || {}), align: 'center' })}
                                            className={`p-2 rounded-lg ${block.content.align === 'center' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <AlignCenter size={16} />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onUpdate({ ...(block.content || {}), align: 'right' })}
                                            className={`p-2 rounded-lg ${block.content.align === 'right' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            <AlignRight size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 ml-1">
                                        ขนาดรูป
                                    </label>
                                    <div className="inline-flex rounded-xl bg-gray-100 border border-gray-300 p-1">
                                        <button
                                            type="button"
                                            onClick={() => onUpdate({ ...(block.content || {}), size: 'small' })}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-bold ${block.content.size === 'small' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            S
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onUpdate({ ...(block.content || {}), size: 'medium' })}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-bold ${!block.content.size || block.content.size === 'medium' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            M
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => onUpdate({ ...(block.content || {}), size: 'large' })}
                                            className={`px-3 py-1.5 rounded-lg text-sm font-bold ${block.content.size === 'large' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                        >
                                            L
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-bold text-gray-700 ml-1">
                                        ลิงก์เมื่อคลิกที่รูป (ไม่บังคับ)
                                    </label>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-gray-700 placeholder:text-gray-400"
                                        placeholder="https://..."
                                        value={block.content.link || ''}
                                        onChange={e => onUpdate({ ...(block.content || {}), link: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div
                            className={`
                                rounded-[48px] overflow-hidden shadow-3xl border border-foreground/5
                                ${block.content.align === 'left' ? 'mx-0 mr-auto' : ''}
                                ${block.content.align === 'right' ? 'ml-auto mr-0' : ''}
                                ${!block.content.align || block.content.align === 'center' ? 'mx-auto' : ''}
                                ${block.content.size === 'small' ? 'max-w-md' : ''}
                                ${block.content.size === 'medium' || !block.content.size ? 'max-w-3xl' : ''}
                                ${block.content.size === 'large' ? 'max-w-5xl' : ''}
                            `}
                        >
                            {block.content.link ? (
                                <a href={block.content.link} target="_blank" rel="noopener noreferrer">
                                    <img src={block.content.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80'} className="w-full h-auto" alt="Campaign Content" />
                                </a>
                            ) : (
                                <img src={block.content.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80'} className="w-full h-auto" alt="Campaign Content" />
                            )}
                        </div>
                    )}
                </div>
            );
        case 'video':
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
            const sourceType = block.content.source_type || 'embed';
            const videoConfig = block.content.video_config as VideoConfig | null;

            return (
                <div className="max-w-4xl mx-auto">
                    {isEditing ? (
                        <div className="p-8 bg-white border-2 border-dashed border-gray-200 rounded-[32px] space-y-6 shadow-lg">
                            {/* Show preview if video exists */}
                            {sourceType === 'embed' && block.content.url ? (
                                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100">
                                    <iframe
                                        className="w-full h-full"
                                        src={getEmbedUrl(block.content.url)}
                                        title="Video preview"
                                        frameBorder="0"
                                        allowFullScreen
                                    />
                                </div>
                            ) : sourceType === 'upload' && videoConfig?.url ? (
                                <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100">
                                    <video
                                        src={videoConfig.url.startsWith('http') ? videoConfig.url : videoConfig.url.startsWith('/api') ? videoConfig.url : `${API_URL}${videoConfig.url}`}
                                        controls
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ) : null}
                            
                            {/* Source Type Toggle */}
                            <div className="flex justify-center gap-2 p-1 bg-gray-100 rounded-xl w-fit mx-auto">
                                <button
                                    onClick={() => onUpdate({ ...block.content, source_type: 'embed' })}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${sourceType === 'embed' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    YouTube/Vimeo
                                </button>
                                <button
                                    onClick={() => onUpdate({ ...block.content, source_type: 'upload' })}
                                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${sourceType === 'upload' ? 'bg-primary text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    อัพโหลดวิดีโอ
                                </button>
                            </div>

                            {sourceType === 'embed' ? (
                                <div className="space-y-4 text-center">
                                    {!block.content.url && (
                                        <>
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                                                <Video size={32} className="text-gray-400" />
                                            </div>
                                            <p className="text-base font-bold text-gray-700">Paste Video Link (YouTube/Vimeo)</p>
                                        </>
                                    )}
                                    <input
                                        className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all text-gray-700 placeholder:text-gray-400"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={block.content.url || ''}
                                        onChange={e => onUpdate({ ...block.content, url: e.target.value })}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <p className="text-base font-bold text-gray-700 text-center">อัพโหลดวิดีโอพร้อมตั้งค่า Autoplay และ Link</p>
                                    <VideoUpload
                                        value={videoConfig}
                                        onChange={(config) => onUpdate({ ...block.content, video_config: config })}
                                    />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="aspect-video rounded-[48px] overflow-hidden bg-black/40 border border-foreground/10 shadow-3xl">
                            {sourceType === 'upload' && videoConfig?.url ? (
                                videoConfig.link_enabled && videoConfig.link_url ? (
                                    <a href={videoConfig.link_url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative group">
                                        <video
                                            src={videoConfig.url.startsWith('http') ? videoConfig.url : videoConfig.url.startsWith('/api') ? videoConfig.url : `${API_URL}${videoConfig.url}`}
                                            autoPlay={videoConfig.autoplay}
                                            muted={videoConfig.autoplay}
                                            loop
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                            <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-black px-4 py-2 rounded-full text-sm font-bold transition-opacity">คลิกเพื่อเปิดลิงก์</span>
                                        </div>
                                    </a>
                                ) : (
                                    <video
                                        src={videoConfig.url.startsWith('http') ? videoConfig.url : videoConfig.url.startsWith('/api') ? videoConfig.url : `${API_URL}${videoConfig.url}`}
                                        autoPlay={videoConfig.autoplay}
                                        muted={videoConfig.autoplay}
                                        loop
                                        playsInline
                                        controls
                                        className="w-full h-full object-cover"
                                    />
                                )
                            ) : (
                                <iframe
                                    className="w-full h-full"
                                    src={getEmbedUrl(block.content.url)}
                                    title="Video content"
                                    frameBorder="0"
                                    allowFullScreen
                                />
                            )}
                        </div>
                    )}
                </div>
            );
        case 'button':
            return (
                <div className="text-center py-12">
                    {isEditing ? (
                        <div className="max-w-md mx-auto space-y-6 bg-white p-8 rounded-[32px] border border-gray-200 shadow-lg">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="block text-sm font-bold text-gray-700 text-left">ข้อความบนปุ่ม</label>
                                    <button
                                        type="button"
                                        onClick={onAiSuggest}
                                        disabled={aiLoading}
                                        className="flex items-center gap-1.5 px-2 py-1 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all font-bold text-xs"
                                    >
                                        {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                        AI Suggest
                                    </button>
                                </div>
                                <input 
                                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-lg font-bold tracking-tight transition-all text-gray-700 placeholder:text-gray-400"
                                    placeholder="เช่น 'สมัครเลย'"
                                    value={block.content.label}
                                    onChange={e => onUpdate({...block.content, label: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700 ml-1 text-left">ลิงก์ปลายทาง</label>
                                <input 
                                    className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all text-gray-700 placeholder:text-gray-400"
                                    placeholder="https://..."
                                    value={block.content.url}
                                    onChange={e => onUpdate({...block.content, url: e.target.value})}
                                />
                            </div>
                        </div>
                    ) : (
                        <a 
                            href={block.content.url} 
                            target="_blank"
                            className="inline-block px-14 py-6 rounded-[24px] font-black text-2xl shadow-3xl hover:scale-105 active:scale-95 transition-all uppercase tracking-tighter border border-white/10"
                            style={{ backgroundColor: theme.primary_color, color: '#fff', boxShadow: `0 25px 50px -12px ${theme.primary_color}40` }}
                        >
                            {block.content.label}
                        </a>
                    )}
                </div>
            );
        case 'form':
            return (
                <div className="max-w-2xl mx-auto">
                    {isEditing ? (
                        <div className="p-8 bg-white border-2 border-dashed border-gray-200 rounded-[32px] text-left space-y-6 shadow-lg">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare size={32} className="text-gray-400" />
                            </div>

                            {/* Mode toggle */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-gray-700 ml-1">
                                    โหมดฟอร์ม
                                </label>
                                <div className="inline-flex rounded-2xl bg-gray-100 border border-gray-300 p-1">
                                    <button
                                        type="button"
                                        onClick={() => onUpdate({ ...block.content, mode: 'external' })}
                                        className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                                            !block.content.mode || block.content.mode === 'external'
                                                ? 'bg-primary text-white'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        ลิงก์ฟอร์มภายนอก
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onUpdate({ ...block.content, mode: 'internal' })}
                                        className={`px-4 py-2 text-sm font-bold rounded-xl transition-all ${
                                            block.content.mode === 'internal'
                                                ? 'bg-primary text-white'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        ฟอร์มเก็บ Leads ในระบบ
                                    </button>
                                </div>
                                <div className="mt-3 p-4 bg-gray-100 rounded-xl border border-gray-200">
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        <span className="font-bold">โหมดลิงก์ภายนอก:</span> ใช้ Google Forms หรือ Form tool อื่น ๆ
                                    </p>
                                    <p className="text-sm text-gray-700 leading-relaxed mt-1">
                                        <span className="font-bold">โหมดฟอร์มในระบบ:</span> ใช้ฟอร์มมาตรฐานของ NEX และบันทึกลงเมนู Leads
                                    </p>
                                </div>
                            </div>

                            {/* External form config */}
                            {(!block.content.mode || block.content.mode === 'external') && (
                                <div className="space-y-3">
                                    <label className="block text-sm font-bold text-gray-700 ml-1">
                                        Form Submission Link (ภายนอก)
                                    </label>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all text-gray-700 placeholder:text-gray-400"
                                        placeholder="https://forms.gle/..."
                                        value={block.content.url || ''}
                                        onChange={(e) => onUpdate({ ...block.content, url: e.target.value })}
                                    />
                                </div>
                            )}

                            {/* Internal form config */}
                            {block.content.mode === 'internal' && (
                                <div className="space-y-5">
                                    {/* Form selection from system */}
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-700 ml-1">
                                            เลือกฟอร์มจากระบบ (Form Selection)
                                        </label>
                                        {formsLoading ? (
                                            <div className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-sm text-gray-500 flex items-center justify-between">
                                                <span>กำลังโหลดรายการฟอร์ม...</span>
                                                <Loader2 className="animate-spin" size={16} />
                                            </div>
                                        ) : formsError ? (
                                            <div className="w-full bg-red-500/5 border border-red-500/30 rounded-2xl px-4 py-3 text-xs text-red-400">
                                                {formsError}
                                            </div>
                                        ) : forms && forms.length > 0 ? (
                                            <select
                                                className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary text-gray-700"
                                                value={block.content.form_id ? String(block.content.form_id) : ''}
                                                onChange={(e) => {
                                                    const value = e.target.value;
                                                    if (!value) {
                                                        onUpdate({
                                                            ...block.content,
                                                            form_id: undefined,
                                                            form_name: undefined,
                                                        });
                                                        return;
                                                    }
                                                    const selected = forms.find((f) => String(f.id) === value);
                                                    onUpdate({
                                                        ...block.content,
                                                        form_id: Number(value),
                                                        form_name: selected?.name || '',
                                                    });
                                                }}
                                            >
                                                <option value="">-- เลือกฟอร์มที่จะใช้กับบล็อกนี้ --</option>
                                                {forms.map((form) => (
                                                    <option key={form.id} value={form.id}>
                                                        {form.name} {form.is_active ? '' : '(ปิดการใช้งาน)'}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="w-full bg-gray-50 border border-gray-300 rounded-2xl px-4 py-4 text-sm flex flex-col gap-2">
                                                <span className="text-gray-500">ยังไม่มีฟอร์มในระบบ</span>
                                                <Link
                                                    href="/manage/forms"
                                                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-primary hover:text-primary/80"
                                                    target="_blank"
                                                >
                                                    ไปสร้างฟอร์มใหม่ที่หน้า Manage Forms
                                                    <ExternalLink size={14} />
                                                </Link>
                                            </div>
                                        )}
                                        <p className="text-[11px] text-foreground/40 ml-1">
                                            ระบบจะใช้ฟอร์มนี้ร่วมกับช่องมาตรฐาน (ชื่อ, อีเมล, โทรศัพท์ ฯลฯ) เพื่อส่งข้อมูลเข้าเมนู Leads
                                        </p>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">
                                            ข้อความขอบคุณหลังส่งฟอร์ม (Thank You Message)
                                        </label>
                                        <textarea
                                            className="w-full bg-background border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm min-h-[80px] transition-all"
                                            placeholder="ขอบคุณที่สนใจ ทีมงานจะติดต่อกลับโดยเร็วที่สุด"
                                            value={block.content.thank_you_message || ''}
                                            onChange={(e) => onUpdate({ ...block.content, thank_you_message: e.target.value })}
                                        />
                                        <p className="text-[11px] text-foreground/40 ml-1">
                                            ข้อความนี้จะแสดงบนหน้า Landing Page หลังจากลูกค้ากรอกฟอร์มสำเร็จ
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">
                                                Redirect URL หลังส่งฟอร์มสำเร็จ (ไม่บังคับ)
                                            </label>
                                            <input
                                                className="w-full bg-background border border-foreground/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="https://your-thank-you-page..."
                                                value={block.content.redirect_url || ''}
                                                onChange={(e) => onUpdate({ ...block.content, redirect_url: e.target.value })}
                                            />
                                            <p className="text-[11px] text-foreground/40 ml-1">
                                                ถ้ากรอก ระบบจะพาผู้ใช้ไปยังหน้านี้หลังจากแสดงข้อความขอบคุณแล้ว
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">
                                                หน่วงเวลารีไดเรกต์ (วินาที)
                                            </label>
                                            <input
                                                type="number"
                                                min={0}
                                                max={60}
                                                className="w-full bg-background border border-foreground/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                placeholder="3"
                                                value={block.content.redirect_delay ?? ''}
                                                onChange={(e) =>
                                                    onUpdate({
                                                        ...block.content,
                                                        redirect_delay: e.target.value === '' ? undefined : Number(e.target.value),
                                                    })
                                                }
                                            />
                                            <p className="text-[11px] text-foreground/40 ml-1">
                                                ระยะเวลาที่จะแสดงข้อความขอบคุณก่อนจะพาไปยังหน้าปลายทาง (ค่าแนะนำ 2–5 วินาที)
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-foreground/[0.03] border border-foreground/10 p-16 rounded-[48px] text-center backdrop-blur-3xl shadow-3xl">
                            <h3 className="text-4xl font-black mb-6 tracking-tighter">ติดต่อสอบถามข้อมูลเพิ่มเติม</h3>
                            <p className="opacity-40 text-lg mb-12 font-medium">กรุณากรอกข้อมูลเพื่อให้ทีมงานของเราติดต่อกลับโดยเร็วที่สุด</p>
                            <a
                                href={block.content.url}
                                target="_blank"
                                className="inline-flex items-center gap-4 px-12 py-5 bg-white text-black font-black rounded-[24px] hover:bg-primary hover:text-white transition-all text-lg shadow-xl"
                            >
                                Open Submission Form <ExternalLink size={24} />
                            </a>
                        </div>
                    )}
                </div>
            );
        default:
            return null;
    }
}
