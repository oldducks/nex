"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  ArrowLeft, Save, Plus, Trash2, GripVertical, 
  Type, Image as ImageIcon, Video, MousePointer2,
  Settings, Eye, Globe, QrCode as QrIcon, 
  ChevronUp, ChevronDown, CheckCircle, Smartphone, 
  Monitor, Layout, Sparkles, MessageSquare, Share2, ExternalLink, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { QrCodeImage } from '../../../../components/QrCode';
import { ThemeToggle } from '@/components/ThemeToggle';

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
    const [activeTab, setActiveTab] = useState<'content' | 'design' | 'seo'>('content');
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://namecard.dpattown.com';
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
                setPage({
                    ...data,
                    content_blocks: data.content_blocks || [],
                    theme_config: data.theme_config || { primary_color: '#6366F1', bg_color: '#000000', font_family: 'Inter' },
                });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const savePage = async () => {
        if (!page) return;
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/landing-pages/${id}`, {
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
                setPage(updated);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const addBlock = (type: Block['type']) => {
        if (!page) return;
        const newBlock: Block = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            content: type === 'text' ? { title: 'หัวข้อใหม่', body: 'เริ่มเขียนข้อความสื่อสารกับลูกค้าของคุณที่นี่...' } :
                     type === 'image' ? { url: '' } :
                     type === 'video' ? { url: '' } :
                     type === 'button' ? { label: 'คลิกเพื่อดูรายละเอียด', url: '' } :
                     { url: '' } // form
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

    if (loading) return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>
    );
    if (!page) return <div>ไม่พบข้อมูลหน้านี้</div>;

    const publicUrl = `${SITE_URL}/lp/${page.slug}`;

    return (
        <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden transition-colors duration-500">
            {/* Top Editor Bar */}
            <header className="h-16 border-b border-foreground/5 bg-background/50 backdrop-blur-xl flex items-center justify-between px-6 shrink-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/manage/landing-pages" className="w-10 h-10 rounded-xl hover:bg-foreground/5 flex items-center justify-center transition-all group">
                        <ArrowLeft size={18} className="text-foreground/40 group-hover:text-foreground transition-all" />
                    </Link>
                    <div className="h-6 w-[1px] bg-foreground/10 mx-2"></div>
                    <div className="hidden sm:block">
                        <input 
                            className="bg-transparent font-black text-sm focus:outline-none border-b border-transparent focus:border-primary px-1 transition-all"
                            value={page.title}
                            onChange={e => setPage({...page, title: e.target.value})}
                        />
                        <div className="text-[10px] text-foreground/30 font-black uppercase tracking-widest mt-0.5 ml-1">SLUG: /lp/{page.slug}</div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-foreground/5 rounded-xl p-1 border border-foreground/5">
                        <button 
                            onClick={() => setPreviewMode('desktop')}
                            className={`p-2 rounded-lg transition-all ${previewMode === 'desktop' ? 'bg-background text-foreground shadow-sm' : 'text-foreground/30 hover:text-foreground/60'}`}
                        >
                            <Monitor size={18} />
                        </button>
                        <button 
                            onClick={() => setPreviewMode('mobile')}
                            className={`p-2 rounded-lg transition-all ${previewMode === 'mobile' ? 'bg-background text-foreground shadow-sm' : 'text-foreground/30 hover:text-foreground/60'}`}
                        >
                            <Smartphone size={18} />
                        </button>
                    </div>

                    <div className="h-6 w-[1px] bg-foreground/10 mx-1 hidden sm:block"></div>
                    
                    <ThemeToggle />

                    <button 
                        onClick={savePage}
                        disabled={saving}
                        className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-95"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={18} />}
                        <span className="hidden md:inline">บันทึกวอร์คโฟลว์</span>
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">
                {/* Left Toolbar (Blocks) */}
                <aside className="w-80 border-r border-foreground/5 bg-card-bg flex flex-col overflow-hidden shrink-0 transition-colors duration-500">
                    <div className="flex border-b border-foreground/5">
                        <button onClick={() => setActiveTab('content')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'content' ? 'text-primary bg-primary/5 border-b-2 border-primary' : 'text-foreground/30 hover:text-foreground/60'}`}>เนื้อหา</button>
                        <button onClick={() => setActiveTab('design')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'design' ? 'text-primary bg-primary/5 border-b-2 border-primary' : 'text-foreground/30 hover:text-foreground/60'}`}>ดีไซน์</button>
                        <button onClick={() => setActiveTab('seo')} className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'seo' ? 'text-primary bg-primary/5 border-b-2 border-primary' : 'text-foreground/30 hover:text-foreground/60'}`}>การแชร์</button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {activeTab === 'content' && (
                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
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
                                    <h4 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
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
                                            <div className="text-center py-6 text-[10px] font-bold text-foreground/20 uppercase tracking-widest border-2 border-dashed border-foreground/5 rounded-2xl">
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
                                    <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">สีหลักแคมเปญ (Primary)</label>
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
                                    <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">ฉากหลัง (Backdrop)</label>
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

                        {activeTab === 'seo' && (
                            <div className="space-y-10 text-center pt-10">
                                <div className="p-6 bg-white rounded-[40px] inline-block shadow-2xl shadow-primary/20 hover:scale-105 transition-transform duration-500">
                                    <QrCodeImage url={publicUrl} size={150} />
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-black tracking-tighter">แชร์สู่สาธารณะ</h3>
                                        <p className="text-xs font-medium text-foreground/40 leading-relaxed px-4">ระบบสร้าง QR Code ของหน้าโปรโมชั่นนี้ให้โดยอัตโนมัติ คุณสามารถนำไปใช้ในโบร์ชัวร์หรือสื่อออนไลน์ได้ทันที</p>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 gap-3 px-2">
                                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${publicUrl}`} target="_blank" className="bg-blue-600 text-white py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 shadow-xl shadow-blue-600/20">
                                            <Share2 size={18} /> share to facebook
                                        </a>
                                        <button 
                                            onClick={() => {navigator.clipboard.writeText(publicUrl); alert('ลิ้งก์ถูกคัดลอกลงในคลิปบอร์ดแล้ว!');}}
                                            className="bg-foreground text-background py-4 rounded-2xl flex items-center justify-center gap-3 text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-foreground/5"
                                        >
                                            <Globe size={18} /> print url link
                                        </button>
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
                                            onUpdate={(content) => updateBlockContent(block.id, content)}
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
                            <h4 className="font-black text-2xl tracking-[0.5em] uppercase">Built with Namecard.ai</h4>
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
function RenderBlock({ block, theme, isEditing, onUpdate }: { block: Block, theme: any, isEditing: boolean, onUpdate: (content: any) => void }) {
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
                            <textarea 
                                className="w-full bg-foreground/5 rounded-2xl px-6 py-4 text-xl text-foreground/50 leading-relaxed focus:outline-none border-2 border-transparent focus:border-primary/20 h-48 resize-none transition-all font-medium"
                                value={block.content.body}
                                onChange={e => onUpdate({...block.content, body: e.target.value})}
                            />
                        </div>
                    ) : (
                        <>
                            <h2 className="text-5xl md:text-8xl font-black tracking-tighter mb-10 leading-[0.9]">{block.content.title}</h2>
                            <p className="text-xl md:text-2xl opacity-60 leading-relaxed max-w-2xl whitespace-pre-wrap font-medium">{block.content.body}</p>
                        </>
                    )}
                </div>
            );
        case 'image':
            return (
                <div className="max-w-5xl mx-auto">
                    {isEditing ? (
                        <div className="p-12 bg-foreground/5 border-2 border-dashed border-foreground/10 rounded-[40px] text-center space-y-6">
                            <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto text-foreground/20">
                                <ImageIcon size={40} />
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Paste External Image Link</p>
                                <input 
                                    className="w-full bg-background border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-mono tracking-tighter transition-all"
                                    placeholder="https://images.unsplash.com/..."
                                    value={block.content.url}
                                    onChange={e => onUpdate({ url: e.target.value })}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-[48px] overflow-hidden shadow-3xl border border-foreground/5">
                            <img src={block.content.url || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80'} className="w-full h-auto" alt="Campaign Content" />
                        </div>
                    )}
                </div>
            );
        case 'video':
            return (
                <div className="max-w-4xl mx-auto">
                    {isEditing ? (
                        <div className="p-12 bg-foreground/5 border-2 border-dashed border-foreground/10 rounded-[40px] text-center space-y-6">
                            <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto text-foreground/20">
                                <Video size={40} />
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Paste Video Link (YouTube/Vimeo)</p>
                                <input 
                                    className="w-full bg-background border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-mono tracking-tighter transition-all"
                                    placeholder="https://www.youtube.com/watch?v=..."
                                    value={block.content.url}
                                    onChange={e => onUpdate({ url: e.target.value })}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="aspect-video rounded-[48px] overflow-hidden bg-black/40 border border-foreground/10 shadow-3xl">
                             <iframe 
                                className="w-full h-full"
                                src={block.content.url?.replace('watch?v=', 'embed/')} 
                                title="Video content"
                                frameBorder="0" 
                                allowFullScreen
                             ></iframe>
                        </div>
                    )}
                </div>
            );
        case 'button':
            return (
                <div className="text-center py-12">
                    {isEditing ? (
                        <div className="max-w-md mx-auto space-y-6 bg-foreground/5 p-10 rounded-[40px] border border-foreground/5 shadow-inner">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-widest ml-1 text-left">ข้อความบนปุ่ม</label>
                                <input 
                                    className="w-full bg-background border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 text-lg font-black tracking-tight transition-all"
                                    placeholder="เช่น 'สมัครเลย'"
                                    value={block.content.label}
                                    onChange={e => onUpdate({...block.content, label: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-widest ml-1 text-left">ลิงก์ปลายทาง</label>
                                <input 
                                    className="w-full bg-background border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-mono transition-all"
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
                        <div className="p-12 bg-foreground/5 border-2 border-dashed border-foreground/10 rounded-[40px] text-center space-y-6">
                            <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto text-foreground/20">
                                <MessageSquare size={40} />
                            </div>
                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/30">Form Submission Link</p>
                                <input 
                                    className="w-full bg-background border border-foreground/10 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 text-xs font-mono tracking-tighter transition-all"
                                    placeholder="https://forms.gle/..."
                                    value={block.content.url}
                                    onChange={e => onUpdate({ url: e.target.value })}
                                />
                            </div>
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
