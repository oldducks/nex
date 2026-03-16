'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import Cookies from 'js-cookie';
import {
    Settings, Save, X, Move, Type, Palette, Video,
    Image as ImageIcon, Layout, Undo2, Redo2, Eye, EyeOff
} from 'lucide-react';

// Types for layout configuration
interface LayoutConfig {
    sections?: string[];
    profile_position?: 'left' | 'center' | 'right' | 'overlay';
    theme?: string;
    display_theme?: 'dark' | 'light';
    primary_color?: string;
    background_color?: string;
    font_family?: string;
    card_style?: 'glass' | 'solid' | 'outline';
    video_url?: string;
    show_gallery?: boolean;
    show_lead_form?: boolean;
}

interface ThemeConfig {
    mode?: 'light' | 'dark';
    backgroundColor?: string;
    backgroundGradient?: string;
    fontFamily?: string;
    fontSize?: 'small' | 'medium' | 'large';
    textColor?: string;
    accentColor?: string;
}

interface ProfileData {
    user_id: number;
    uid: string;
    url_prefix: string;
    layout_config?: LayoutConfig;
    theme_config?: ThemeConfig;
    [key: string]: any;
}

interface LayoutEditorContextType {
    isEditing: boolean;
    isOwner: boolean;
    editedConfig: LayoutConfig;
    editedTheme: ThemeConfig;
    hasChanges: boolean;
    setProfilePosition: (pos: 'left' | 'center' | 'right' | 'overlay') => void;
    setDisplayTheme: (mode: 'dark' | 'light') => void;
    setPrimaryColor: (color: string) => void;
    setFontFamily: (font: string) => void;
    setCardStyle: (style: 'glass' | 'solid' | 'outline') => void;
    setVideoUrl: (url: string) => void;
    toggleGallery: (show: boolean) => void;
    toggleLeadForm: (show: boolean) => void;
    toggleEditing: () => void;
    saveChanges: () => Promise<void>;
    discardChanges: () => void;
}

const LayoutEditorContext = createContext<LayoutEditorContextType | null>(null);

export function useLayoutEditor() {
    const context = useContext(LayoutEditorContext);
    if (!context) {
        throw new Error('useLayoutEditor must be used within LayoutEditorProvider');
    }
    return context;
}

// Font options
const FONT_OPTIONS = [
    { name: 'Inter', label: 'Inter' },
    { name: 'Roboto', label: 'Roboto' },
    { name: 'Poppins', label: 'Poppins' },
    { name: 'Montserrat', label: 'Montserrat' },
    { name: 'Playfair Display', label: 'Playfair' },
    { name: 'Kanit', label: 'Kanit (Thai)' },
    { name: 'Prompt', label: 'Prompt (Thai)' },
    { name: 'Mitr', label: 'Mitr (Thai)' },
];

// Color presets
const COLOR_PRESETS = [
    '#6366F1', // Indigo
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#14B8A6', // Teal
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#10B981', // Emerald
    '#3B82F6', // Blue
];

interface LayoutEditorProviderProps {
    children: ReactNode;
    profileData: ProfileData;
    userId: number;
}

export function LayoutEditorProvider({ children, profileData, userId }: LayoutEditorProviderProps) {
    const [isOwner, setIsOwner] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedConfig, setEditedConfig] = useState<LayoutConfig>(profileData.layout_config || {});
    const [editedTheme, setEditedTheme] = useState<ThemeConfig>(profileData.theme_config || {});
    const [originalConfig] = useState(profileData.layout_config || {});
    const [originalTheme] = useState(profileData.theme_config || {});
    const [saving, setSaving] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    // Check if user is owner
    useEffect(() => {
        const token = Cookies.get('token');
        if (token) {
            try {
                // Decode JWT manually (base64)
                const payload = token.split('.')[1];
                const decoded = JSON.parse(atob(payload));
                setIsOwner(decoded.sub === userId || decoded.uid === profileData.uid);
            } catch {
                setIsOwner(false);
            }
        }
    }, [userId, profileData.uid]);

    const hasChanges = JSON.stringify(editedConfig) !== JSON.stringify(originalConfig) ||
        JSON.stringify(editedTheme) !== JSON.stringify(originalTheme);

    const setProfilePosition = (pos: 'left' | 'center' | 'right' | 'overlay') => {
        setEditedConfig(prev => ({ ...prev, profile_position: pos }));
    };

    const setDisplayTheme = (mode: 'dark' | 'light') => {
        setEditedConfig(prev => ({ ...prev, display_theme: mode }));
    };

    const setPrimaryColor = (color: string) => {
        setEditedConfig(prev => ({ ...prev, primary_color: color }));
    };

    const setFontFamily = (font: string) => {
        setEditedConfig(prev => ({ ...prev, font_family: font }));
    };

    const setCardStyle = (style: 'glass' | 'solid' | 'outline') => {
        setEditedConfig(prev => ({ ...prev, card_style: style }));
    };

    const setVideoUrl = (url: string) => {
        setEditedConfig(prev => ({ ...prev, video_url: url }));
    };

    const toggleGallery = (show: boolean) => {
        setEditedConfig(prev => ({ ...prev, show_gallery: show }));
    };

    const toggleLeadForm = (show: boolean) => {
        setEditedConfig(prev => ({ ...prev, show_lead_form: show }));
    };

    const toggleEditing = () => setIsEditing(prev => !prev);

    const saveChanges = async () => {
        setSaving(true);
        const token = Cookies.get('token');
        try {
            const res = await fetch(`${API_URL}/profiles/${profileData.uid}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    layout_config: editedConfig,
                    theme_config: editedTheme,
                }),
            });
            if (res.ok) {
                window.location.reload();
            }
        } catch (error) {
            console.error('Failed to save:', error);
        } finally {
            setSaving(false);
        }
    };

    const discardChanges = () => {
        setEditedConfig(originalConfig);
        setEditedTheme(originalTheme);
        setIsEditing(false);
    };

    return (
        <LayoutEditorContext.Provider value={{
            isEditing,
            isOwner,
            editedConfig,
            editedTheme,
            hasChanges,
            setProfilePosition,
            setDisplayTheme,
            setPrimaryColor,
            setFontFamily,
            setCardStyle,
            setVideoUrl,
            toggleGallery,
            toggleLeadForm,
            toggleEditing,
            saveChanges,
            discardChanges,
        }}>
            {children}
            {isOwner && <LayoutEditorToolbar saving={saving} />}
        </LayoutEditorContext.Provider>
    );
}

// Floating Toolbar Component
function LayoutEditorToolbar({ saving }: { saving: boolean }) {
    const editor = useLayoutEditor();
    const [showPanel, setShowPanel] = useState(false);
    const [activeTab, setActiveTab] = useState<'layout' | 'theme' | 'colors' | 'fonts' | 'media'>('layout');

    if (!editor.isOwner) return null;

    return (
        <>
            {/* Edit Toggle Button */}
            <button
                onClick={() => {
                    editor.toggleEditing();
                    setShowPanel(!showPanel);
                }}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-2xl flex items-center justify-center transition-all ${editor.isEditing
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20'
                    }`}
            >
                {editor.isEditing ? <X size={24} /> : <Settings size={24} />}
            </button>

            {/* Editor Panel */}
            {editor.isEditing && (
                <div className="fixed bottom-24 right-6 z-50 w-80 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-3">
                        <h3 className="text-white font-bold text-lg">แก้ไขหน้าโปรไฟล์</h3>
                        <p className="text-white/70 text-xs">ปรับแต่งตามต้องการ</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        {[
                            { id: 'layout', label: 'เลย์เอาท์', icon: Layout },
                            { id: 'media', label: 'สื่อ', icon: Video },
                            { id: 'colors', label: 'สี', icon: Palette },
                            { id: 'fonts', label: 'ฟอนต์', icon: Type },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex-1 py-3 text-xs font-medium transition-colors ${activeTab === tab.id
                                    ? 'text-purple-400 border-b-2 border-purple-400'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <tab.icon size={16} className="mx-auto mb-1" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Panel Content */}
                    <div className="p-4 max-h-80 overflow-y-auto">
                        {activeTab === 'layout' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-medium mb-2 block">ตำแหน่งรูปโปรไฟล์</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {(['left', 'center', 'right', 'overlay'] as const).map((pos) => (
                                            <button
                                                key={pos}
                                                onClick={() => editor.setProfilePosition(pos)}
                                                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${editor.editedConfig.profile_position === pos
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                {pos === 'left' ? 'ซ้าย' : pos === 'center' ? 'กลาง' : pos === 'right' ? 'ขวา' : 'ซ้อน'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-400 font-medium mb-2 block">สไตล์การ์ด</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {(['glass', 'solid', 'outline'] as const).map((style) => (
                                            <button
                                                key={style}
                                                onClick={() => editor.setCardStyle(style)}
                                                className={`py-2 px-3 rounded-lg text-xs font-medium transition-all ${editor.editedConfig.card_style === style
                                                    ? 'bg-purple-600 text-white'
                                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                {style === 'glass' ? 'กระจก' : style === 'solid' ? 'ทึบ' : 'ขอบ'}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <span className="text-xs text-gray-400 font-medium group-hover:text-white transition-colors">แสดงแบบฟอร์มติดต่อกลับ</span>
                                        <div className="relative inline-flex items-center">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={editor.editedConfig.show_lead_form ?? true}
                                                onChange={(e) => editor.toggleLeadForm(e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeTab === 'media' && (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-xs text-gray-400 font-medium mb-2 block">วิดีโอฝัง (YouTube/Vimeo)</label>
                                    <input 
                                        type="text"
                                        placeholder="https://www.youtube.com/watch?v=..."
                                        value={editor.editedConfig.video_url || ''}
                                        onChange={(e) => editor.setVideoUrl(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors"
                                    />
                                    <p className="text-[10px] text-gray-500 mt-1 italic">* เว้นว่างไว้หากไม่ต้องการแสดง</p>
                                </div>

                                <div className="pt-4 border-t border-white/5">
                                    <label className="flex items-center justify-between cursor-pointer group">
                                        <div className="flex items-center gap-2">
                                            <ImageIcon size={14} className="text-gray-500" />
                                            <span className="text-xs text-gray-400 font-medium group-hover:text-white transition-colors">แสดงแกลเลอรี่รูปภาพ</span>
                                        </div>
                                        <div className="relative inline-flex items-center">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer"
                                                checked={editor.editedConfig.show_gallery ?? false}
                                                onChange={(e) => editor.toggleGallery(e.target.checked)}
                                            />
                                            <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        )}

                        {activeTab === 'theme' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-medium mb-2 block">โหมดสี</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={() => editor.setDisplayTheme('dark')}
                                            className={`py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${editor.editedConfig.display_theme === 'dark'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <EyeOff size={16} /> มืด
                                        </button>
                                        <button
                                            onClick={() => editor.setDisplayTheme('light')}
                                            className={`py-3 rounded-lg flex items-center justify-center gap-2 transition-all ${editor.editedConfig.display_theme !== 'dark'
                                                ? 'bg-purple-600 text-white'
                                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                                }`}
                                        >
                                            <Eye size={16} /> สว่าง
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'colors' && (
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-400 font-medium mb-2 block">สีหลัก</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {COLOR_PRESETS.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => editor.setPrimaryColor(color)}
                                                className={`w-full aspect-square rounded-lg transition-all ${editor.editedConfig.primary_color === color
                                                    ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-900'
                                                    : 'hover:scale-110'
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                    <input
                                        type="color"
                                        value={editor.editedConfig.primary_color || '#6366F1'}
                                        onChange={(e) => editor.setPrimaryColor(e.target.value)}
                                        className="w-full h-10 mt-2 rounded-lg cursor-pointer"
                                    />
                                </div>
                            </div>
                        )}

                        {activeTab === 'fonts' && (
                            <div className="space-y-2">
                                {FONT_OPTIONS.map((font) => (
                                    <button
                                        key={font.name}
                                        onClick={() => editor.setFontFamily(font.name)}
                                        className={`w-full py-3 px-4 rounded-lg text-left transition-all ${editor.editedConfig.font_family === font.name
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white/5 text-gray-300 hover:bg-white/10'
                                            }`}
                                        style={{ fontFamily: font.name }}
                                    >
                                        {font.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    {editor.hasChanges && (
                        <div className="flex gap-2 p-4 border-t border-white/10">
                            <button
                                onClick={editor.discardChanges}
                                className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg font-medium transition-colors"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={editor.saveChanges}
                                disabled={saving}
                                className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? 'กำลังบันทึก...' : <><Save size={16} /> บันทึก</>}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}
