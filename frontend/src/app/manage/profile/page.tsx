"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import Image from 'next/image';
import {
    User, Save, Plus, Trash2, GripVertical, ExternalLink, ArrowLeft,
    Facebook, Instagram, Twitter, Linkedin, Youtube, Globe, Mail, Phone,
    MessageCircle, Github, Upload, X, Building2, Briefcase, Heart,
    Image as ImageIcon, Loader2, ChevronUp, ChevronDown, QrCode, CreditCard,
    Palette, Type, LayoutTemplate, Lock, Eye, EyeOff, Settings, Check
} from 'lucide-react';
import { QrCodeImage } from '../../../components/QrCode';
import { ImageCropper } from '../../../components/ImageCropper';
import { ThemeToggle } from '@/components/ThemeToggle';
import { VideoUpload } from '@/components/VideoUpload';
import { Video } from 'lucide-react';

// Social icons mapping
const SOCIAL_ICONS: Record<string, any> = {
    facebook: Facebook, instagram: Instagram, twitter: Twitter,
    linkedin: Linkedin, youtube: Youtube, website: Globe,
    email: Mail, phone: Phone, line: MessageCircle, github: Github,
};

const SOCIAL_OPTIONS = [
    { value: 'facebook', label: 'Facebook', color: '#1877F2' },
    { value: 'instagram', label: 'Instagram', color: '#E4405F' },
    { value: 'twitter', label: 'Twitter / X', color: '#1DA1F2' },
    { value: 'linkedin', label: 'LinkedIn', color: '#0A66C2' },
    { value: 'youtube', label: 'YouTube', color: '#FF0000' },
    { value: 'line', label: 'LINE', color: '#00C300' },
    { value: 'github', label: 'GitHub', color: '#333333' },
    { value: 'website', label: 'Website', color: '#6366F1' },
    { value: 'email', label: 'Email', color: '#EA4335' },
    { value: 'phone', label: 'Phone', color: '#22C55E' },
];

const LANGUAGES = [
    { code: 'th', label: 'ไทย', flag: '🇹🇭' },
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
];

interface I18nField { lang: string; value: string; }
interface ContactField { label: string; value: string; }
interface ImageWithPosition { url: string; position: { x: number; y: number }; scale?: number; }
interface WebsiteLink { label: string; url: string; position?: string; }
interface VideoConfig { url: string; autoplay: boolean; link_url?: string; link_enabled: boolean; enabled: boolean; }

interface Profile {
    // Multi-language
    names_i18n: I18nField[];
    positions_i18n: I18nField[];
    companies_i18n: I18nField[];
    // Contacts
    emails: ContactField[];
    phones: ContactField[];
    url_prefix?: string;
    // Images
    profile_pic_url: string;
    profile_pic_position: { x: number; y: number; scale: number };
    logo: ImageWithPosition | null;
    backgrounds: ImageWithPosition[];
    banners: ImageWithPosition[];
    // Links
    websites: WebsiteLink[];
    social_links_json: any[];
    // About
    about_me: string;
    interests: string[];
    // Video
    video_config: VideoConfig | null;
    // Layout
    layout_config: {
        sections: string[];
        profile_position: 'left' | 'center' | 'right' | 'overlay';
        theme: string;
        display_theme?: 'dark' | 'light';
        primary_color?: string;
        background_color?: string;
        font_family?: string;
        card_style?: 'glass' | 'solid' | 'outline';
    };
}

const defaultProfile: Profile = {
    names_i18n: [{ lang: 'th', value: '' }, { lang: 'en', value: '' }],
    positions_i18n: [{ lang: 'th', value: '' }, { lang: 'en', value: '' }],
    companies_i18n: [{ lang: 'th', value: '' }, { lang: 'en', value: '' }],
    emails: [{ label: 'Work', value: '' }],
    phones: [{ label: 'Mobile', value: '' }],
    profile_pic_url: '',
    profile_pic_position: { x: 50, y: 50, scale: 1 },
    logo: null,
    backgrounds: [],
    banners: [],
    websites: [],
    social_links_json: [],
    about_me: '',
    interests: [],
    video_config: null,
    layout_config: {
        sections: ['banner', 'profile', 'info', 'about', 'social', 'contact'],
        profile_position: 'center',
        theme: 'dark',
        display_theme: 'dark',
        primary_color: '#6366F1',
        background_color: '#09090b',
        font_family: 'Inter',
        card_style: 'glass'
    }
};

const UI_TEXT = {
    th: {
        save: 'บันทึก',
        viewPublic: 'ดูนามบัตร',
        theme: 'การตกแต่ง (Theme)',
        colorMode: 'โหมดสี (Color Mode)',
        light: 'สว่าง',
        dark: 'มืด',
        primaryColor: 'สีหลัก (Primary Color)',
        font: 'แบบอักษร (Font)',
        name: 'ชื่อ-นามสกุล',
        position: 'ตำแหน่ง',
        company: 'บริษัท/องค์กร',
        email: 'อีเมล',
        phone: 'เบอร์โทรศัพท์',
        profilePic: 'รูปโปรไฟล์',
        upload: 'อัปโหลดรูป',
        aboutMe: 'เกี่ยวกับฉัน',
        social: 'โซเชียลมีเดีย',
        qrCode: 'QR Code สำหรับแชร์',
        add: 'เพิ่ม',
        header: 'แก้ไขโปรไฟล์',
        back: 'กลับ',
        downloadVcf: 'ดาวน์โหลด VCF',
        copyLink: 'คัดลอกลิงก์',
        uploadImage: 'อัปโหลดรูป',
        profilePosition: 'ตำแหน่งในหน้า Profile',
        left: 'ซ้าย',
        center: 'กลาง',
        right: 'ขวา',
        overlay: 'ทับ Banner',
        companyLogo: 'โลโก้บริษัท',
        uploadLogo: 'อัปโหลดโลโก้',
        backgroundImages: 'ภาพพื้นหลัง',
        max10Images: 'สูงสุด 10 รูป',
        banners: 'แบนเนอร์',
        websiteLinks: 'ลิงก์เว็บไซต์',
        aboutMePlaceholder: 'แนะนำตัวเอง...',
        interests: 'ความสนใจ / งานอดิเรก',
        interestsPlaceholder: 'เช่น ชอบกินเกาลัด, ชอบขี่จักรยาน',
        socialLinks: 'Social Links',
        themeCustomization: 'การตกแต่ง (Theme)',
        qrCodeDescription: 'QR Code นี้จะลิงก์ไปที่หน้า Public Profile ของคุณ',
        qrCodeHint: 'QR Code จะแสดงอัตโนมัติในหน้า Public Profile',
    },
    en: {
        save: 'Save',
        viewPublic: 'View Public',
        theme: 'Theme & Appearance',
        colorMode: 'Color Mode',
        light: 'Light',
        dark: 'Dark',
        primaryColor: 'Primary Color',
        font: 'Font Family',
        name: 'Name',
        position: 'Position',
        company: 'Company',
        email: 'Email',
        phone: 'Phone',
        profilePic: 'Profile Picture',
        upload: 'Upload Photo',
        aboutMe: 'About Me',
        social: 'Social Links',
        qrCode: 'Share QR Code',
        add: 'Add',
        header: 'Edit Profile',
        back: 'Back',
        downloadVcf: 'Download VCF',
        copyLink: 'Copy Link',
        uploadImage: 'Upload Photo',
        profilePosition: 'Profile Picture Position',
        left: 'Left',
        center: 'Center',
        right: 'Right',
        overlay: 'Overlay Banner',
        companyLogo: 'Company Logo',
        uploadLogo: 'Upload Logo',
        backgroundImages: 'Background Images',
        max10Images: 'Max 10 Images',
        banners: 'Banners',
        websiteLinks: 'Website Links',
        aboutMePlaceholder: 'Introduce yourself...',
        interests: 'Interests / Hobbies',
        interestsPlaceholder: 'e.g. Coding, cycling',
        socialLinks: 'Social Links',
        themeCustomization: 'Theme & Appearance',
        qrCodeDescription: 'This QR Code links to your public profile',
        qrCodeHint: 'QR Code automatically appears on your public profile',
    }
};

export default function ProfileEditorV2() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingSection, setUploadingSection] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uid, setUid] = useState('');
    const [profile, setProfile] = useState<Profile>(defaultProfile);
    const [newInterest, setNewInterest] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadTarget, setUploadTarget] = useState<string>('profile');
    const [lang, setLang] = useState<'th' | 'en'>('th');
    const t = UI_TEXT[lang];

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = Cookies.get('token');

    useEffect(() => {
        if (!token) { router.push('/login'); return; }
        setUid(Cookies.get('uid') || '');
        fetchProfile();
    }, [token]);

    const fetchProfile = async () => {
        try {
            const res = await fetch(`${API_URL}/profile/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                // Update UID from API response (in case it changed)
                if (data.uid) {
                    setUid(data.uid);
                    Cookies.set('uid', data.uid);
                    if (data.url_prefix) Cookies.set('url_prefix', data.url_prefix);
                }
                setProfile({
                    url_prefix: data.url_prefix || '',
                    names_i18n: data.names_i18n?.length ? data.names_i18n : (data.full_name ? [{ lang: 'th', value: data.full_name }, { lang: 'en', value: '' }] : defaultProfile.names_i18n),
                    positions_i18n: data.positions_i18n?.length ? data.positions_i18n : (data.position ? [{ lang: 'th', value: data.position }, { lang: 'en', value: '' }] : defaultProfile.positions_i18n),
                    companies_i18n: data.companies_i18n?.length ? data.companies_i18n : (data.company_name ? [{ lang: 'th', value: data.company_name }, { lang: 'en', value: '' }] : defaultProfile.companies_i18n),
                    emails: data.emails?.length ? data.emails : defaultProfile.emails,
                    phones: data.phones?.length ? data.phones : (data.mobile ? [{ label: 'Mobile', value: data.mobile }] : defaultProfile.phones),
                    profile_pic_url: data.profile_pic_url || '',
                    profile_pic_position: data.profile_pic_position || defaultProfile.profile_pic_position,
                    logo: data.logo || null,
                    backgrounds: data.backgrounds || [],
                    banners: data.banners || [],
                    websites: data.websites || [],
                    social_links_json: data.social_links_json || [],
                    about_me: data.about_me || '',
                    interests: data.interests || [],
                    video_config: data.video_config || null,
                    layout_config: data.layout_config || defaultProfile.layout_config,
                });
            }
        } catch (error) { console.error('Failed to fetch profile:', error); }
        finally { setLoading(false); }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`${API_URL}/profile/me`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(profile)
            });
            if (res.ok) { alert('บันทึกสำเร็จ!'); }
            else { 
                const error = await res.json();
                alert('บันทึกไม่สำเร็จ: ' + (error.message || 'Error saving profile')); 
            }
        } catch (error) { console.error(error); alert('Error saving profile'); }
        finally { setSaving(false); }
    };

    const uploadImage = async (file: File, target: string) => {
        setUploading(true);
        setUploadingSection(target);
        const formData = new FormData();
        formData.append('file', file);
        try {
            console.log(`Uploading file for target: ${target}`);
            const res = await fetch(`${API_URL}/uploads/image`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                console.log('Upload success:', data);
                const imageUrl = `${API_URL}${data.url}`;

                if (target === 'profile') {
                    setProfile(p => ({ ...p, profile_pic_url: imageUrl }));
                } else if (target === 'logo') {
                    setProfile(p => ({ ...p, logo: { url: imageUrl, position: { x: 0, y: 0 } } }));
                } else if (target === 'background' || target === 'backgrounds') {
                    setProfile(p => {
                        const backgrounds = p.backgrounds || [];
                        const newBackgrounds = [...backgrounds, { url: imageUrl, position: { x: 0, y: 0 } }];
                        console.log('Updated backgrounds:', newBackgrounds);
                        return { ...p, backgrounds: newBackgrounds };
                    });
                } else if (target === 'banner' || target === 'banners') {
                    setProfile(p => {
                        const banners = p.banners || [];
                        const newBanners = [...banners, { url: imageUrl, position: { x: 0, y: 0 }, scale: 1 }];
                        console.log('Updated banners:', newBanners);
                        return { ...p, banners: newBanners };
                    });
                }
            } else {
                const errorText = await res.text();
                console.error(`Upload failed with status ${res.status}:`, errorText);
                alert(`Upload failed (${res.status}): ${errorText.substring(0, 100)}`);
            }
        } catch (error) { 
            console.error('Upload error:', error);
            alert('Error uploading image. Please try again.');
        } finally { 
            setUploading(false);
            setUploadingSection(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            console.log('File selected:', file.name, 'Target:', uploadTarget);
            uploadImage(file, uploadTarget);
        }
    };

    const triggerUpload = (target: string) => {
        console.log('Triggering upload for:', target);
        setUploadTarget(target);
        setTimeout(() => fileInputRef.current?.click(), 0);
    };

    // Multi-field helpers
    const addI18n = (field: 'names_i18n' | 'positions_i18n' | 'companies_i18n') => {
        const usedLangs = profile[field].map(f => f.lang);
        const nextLang = LANGUAGES.find(l => !usedLangs.includes(l.code));
        if (nextLang) {
            setProfile(p => ({ ...p, [field]: [...p[field], { lang: nextLang.code, value: '' }] }));
        }
    };

    const removeI18n = (field: 'names_i18n' | 'positions_i18n' | 'companies_i18n', index: number) => {
        setProfile(p => ({ ...p, [field]: p[field].filter((_, i) => i !== index) }));
    };

    const updateI18n = (field: 'names_i18n' | 'positions_i18n' | 'companies_i18n', index: number, value: string) => {
        setProfile(p => ({
            ...p,
            [field]: p[field].map((item, i) => i === index ? { ...item, value } : item)
        }));
    };

    // Contact helpers
    const addContact = (field: 'emails' | 'phones') => {
        setProfile(p => ({ ...p, [field]: [...p[field], { label: '', value: '' }] }));
    };

    const removeContact = (field: 'emails' | 'phones', index: number) => {
        setProfile(p => ({ ...p, [field]: p[field].filter((_, i) => i !== index) }));
    };

    const updateContact = (field: 'emails' | 'phones', index: number, key: 'label' | 'value', val: string) => {
        setProfile(p => ({
            ...p,
            [field]: p[field].map((item, i) => i === index ? { ...item, [key]: val } : item)
        }));
    };

    // Image helpers
    const removeImage = (field: 'backgrounds' | 'banners', index: number) => {
        setProfile(p => ({ ...p, [field]: p[field].filter((_, i) => i !== index) }));
    };

    // Website helpers
    const addWebsite = () => {
        setProfile(p => ({ ...p, websites: [...p.websites, { label: '', url: '' }] }));
    };

    const removeWebsite = (index: number) => {
        setProfile(p => ({ ...p, websites: p.websites.filter((_, i) => i !== index) }));
    };

    // Interest helpers
    const addInterest = () => {
        if (newInterest.trim()) {
            setProfile(p => ({ ...p, interests: [...p.interests, newInterest.trim()] }));
            setNewInterest('');
        }
    };

    const removeInterest = (index: number) => {
        setProfile(p => ({ ...p, interests: p.interests.filter((_, i) => i !== index) }));
    };

    // Profile position
    const setProfilePosition = (pos: 'left' | 'center' | 'right' | 'overlay') => {
        setProfile(p => ({ ...p, layout_config: { ...p.layout_config, profile_position: pos } }));
    };

    const updateTheme = (key: string, value: any) => {
        setProfile(p => ({
            ...p,
            layout_config: { ...p.layout_config, [key]: value }
        }));
    };

    if (loading) return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
            {/* Hidden file input */}
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

            {/* Navbar */}
            <header className="border-b border-foreground/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/manage/control-center')} className="w-10 h-10 rounded-xl hover:bg-foreground/5 flex items-center justify-center transition-all group">
                            <ArrowLeft size={20} className="text-foreground/40 group-hover:text-foreground transition-all" />
                        </button>
                        <h1 className="text-xl font-black tracking-tight hidden sm:block">{t.header}</h1>
                    </div>
                    
                    <div className="flex gap-2 md:gap-4 items-center">
                        {/* Language Switcher */}
                        <div className="flex bg-foreground/5 rounded-xl p-1">
                            <button onClick={() => setLang('th')} className={`w-10 h-8 rounded-lg text-xs font-black transition-all ${lang === 'th' ? 'bg-background text-foreground shadow-sm' : 'text-foreground/30 hover:text-foreground/60'}`}>TH</button>
                            <button onClick={() => setLang('en')} className={`w-10 h-8 rounded-lg text-xs font-black transition-all ${lang === 'en' ? 'bg-background text-foreground shadow-sm' : 'text-foreground/30 hover:text-foreground/60'}`}>EN</button>
                        </div>

                        <div className="h-6 w-px bg-foreground/10 mx-1 hidden sm:block" />
                        
                        <ThemeToggle />

                        <Link href={`/${profile.url_prefix || 'p'}/${uid}`} target="_blank" className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 text-foreground transition-all font-bold text-sm">
                            <ExternalLink size={18} />
                            <span>{t.viewPublic}</span>
                        </Link>
                        <Link href={`/${profile.url_prefix || 'p'}/${uid}`} target="_blank" className="md:hidden p-2.5 rounded-xl bg-foreground/5 hover:bg-foreground/10 transition-all text-foreground/60 hover:text-foreground">
                            <ExternalLink size={20} />
                        </Link>
                        
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-white transition-all font-black text-sm shadow-lg shadow-primary/20 disabled:opacity-50 disabled:scale-95 active:scale-95"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            <span className="hidden md:inline">{saving ? (lang === 'th' ? 'กำลังบันทึก...' : 'Saving...') : t.save}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
                {/* Names */}
                <Section title={t.name} icon={<User size={22} className="text-primary" />} onAdd={() => addI18n('names_i18n')} canAdd={profile.names_i18n.length < LANGUAGES.length}>
                    <div className="space-y-4">
                        {profile.names_i18n.map((item, i) => (
                            <I18nInput key={i} item={item} languages={LANGUAGES} onChange={(v) => updateI18n('names_i18n', i, v)} onRemove={profile.names_i18n.length > 1 ? () => removeI18n('names_i18n', i) : undefined} />
                        ))}
                    </div>
                </Section>

                {/* Positions */}
                <Section title={t.position} icon={<Briefcase size={22} className="text-primary" />} onAdd={() => addI18n('positions_i18n')} canAdd={profile.positions_i18n.length < LANGUAGES.length}>
                    <div className="space-y-4">
                        {profile.positions_i18n.map((item, i) => (
                            <I18nInput key={i} item={item} languages={LANGUAGES} onChange={(v) => updateI18n('positions_i18n', i, v)} onRemove={profile.positions_i18n.length > 1 ? () => removeI18n('positions_i18n', i) : undefined} />
                        ))}
                    </div>
                </Section>

                {/* Companies */}
                <Section title={t.company} icon={<Building2 size={22} className="text-primary" />} onAdd={() => addI18n('companies_i18n')} canAdd={profile.companies_i18n.length < LANGUAGES.length}>
                    <div className="space-y-4">
                        {profile.companies_i18n.map((item, i) => (
                            <I18nInput key={i} item={item} languages={LANGUAGES} onChange={(v) => updateI18n('companies_i18n', i, v)} onRemove={profile.companies_i18n.length > 1 ? () => removeI18n('companies_i18n', i) : undefined} />
                        ))}
                    </div>
                </Section>

                {/* Emails */}
                <Section title={t.email} icon={<Mail size={22} className="text-primary" />} onAdd={() => addContact('emails')} canAdd={profile.emails.length < 10}>
                    <div className="space-y-4">
                        {profile.emails.map((item, i) => (
                            <ContactInput key={i} item={item} placeholder="email@example.com" onLabelChange={(v) => updateContact('emails', i, 'label', v)} onValueChange={(v) => updateContact('emails', i, 'value', v)} onRemove={profile.emails.length > 1 ? () => removeContact('emails', i) : undefined} />
                        ))}
                    </div>
                </Section>

                {/* Phones */}
                <Section title={t.phone} icon={<Phone size={22} className="text-primary" />} onAdd={() => addContact('phones')} canAdd={profile.phones.length < 10}>
                    <div className="space-y-4">
                        {profile.phones.map((item, i) => (
                            <ContactInput key={i} item={item} placeholder="08x-xxx-xxxx" onLabelChange={(v) => updateContact('phones', i, 'label', v)} onValueChange={(v) => updateContact('phones', i, 'value', v)} onRemove={profile.phones.length > 1 ? () => removeContact('phones', i) : undefined} />
                        ))}
                    </div>
                </Section>

                {/* Profile Picture */}
                <Section title={t.profilePic} icon={<ImageIcon size={22} className="text-primary" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Image Cropper */}
                        <div className="flex justify-center md:justify-start">
                            {profile.profile_pic_url ? (
                                <div className="p-4 bg-foreground/5 rounded-[40px] border border-foreground/5 shadow-inner">
                                    <ImageCropper
                                        imageUrl={profile.profile_pic_url}
                                        initialPosition={profile.profile_pic_position}
                                        onPositionChange={(pos) => setProfile(p => ({ ...p, profile_pic_position: pos }))}
                                        aspectRatio={1}
                                        className="w-56 h-56 rounded-[32px] overflow-hidden"
                                    />
                                </div>
                            ) : (
                                <div className="w-56 h-56 rounded-[40px] bg-foreground/5 border-2 border-dashed border-foreground/10 flex flex-col items-center justify-center gap-3">
                                    <User size={64} className="text-foreground/10" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-foreground/20">ยังไม่มีรูปโปรไฟล์</span>
                                </div>
                            )}
                        </div>

                        {/* Upload and Options */}
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <button onClick={() => triggerUpload('profile')} disabled={uploading} className="bg-primary hover:bg-primary/90 text-white px-6 py-3.5 rounded-2xl font-black text-sm flex items-center gap-3 w-full justify-center shadow-lg shadow-primary/20 transition-all active:scale-95">
                                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} {t.uploadImage}
                                </button>
                                <p className="text-[10px] font-black uppercase tracking-widest text-foreground/20 text-center">PNG, JPG, WEBP (Maximum 5MB)</p>
                            </div>

                            {/* Layout Position */}
                            <div className="space-y-4">
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.15em] ml-1">{t.profilePosition}</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { id: 'left', label: t.left },
                                        { id: 'center', label: t.center },
                                        { id: 'right', label: t.right },
                                        { id: 'overlay', label: t.overlay }
                                    ].map(pos => (
                                        <button key={pos.id} onClick={() => setProfilePosition(pos.id as any)} className={`px-4 py-3 rounded-xl text-xs font-bold transition-all border-2 ${profile.layout_config.profile_position === pos.id ? 'border-primary bg-primary/5 text-primary shadow-inner' : 'border-transparent bg-foreground/5 text-foreground/40 hover:bg-foreground/10'}`}>
                                            {pos.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Logo */}
                <Section title={t.companyLogo} icon={<Building2 size={22} className="text-primary" />}>
                    <div className="flex items-center gap-8">
                        <div className="w-28 h-28 rounded-[24px] bg-foreground/5 border border-foreground/10 overflow-hidden flex items-center justify-center p-4 group hover:border-primary/30 transition-colors">
                            {profile.logo?.url ? (
                                <img src={profile.logo.url} alt="Logo" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <Building2 size={40} className="text-foreground/10" />
                            )}
                        </div>
                        <div className="space-y-2">
                             <button onClick={() => triggerUpload('logo')} disabled={uploading} className="bg-foreground text-background hover:opacity-90 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95">
                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} {t.uploadLogo}
                            </button>
                            <p className="text-[10px] font-medium text-foreground/30 px-1">โลโก้จะแสดงที่มุมขวาบนของโปรไฟล์</p>
                        </div>
                    </div>
                </Section>

                {/* Backgrounds */}
                <Section title={t.backgroundImages} icon={<ImageIcon size={22} className="text-primary" />} onAdd={profile.backgrounds?.length < 10 ? () => triggerUpload('background') : undefined} canAdd={profile.backgrounds?.length < 10}>
                    <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-6 ml-1">{t.max10Images}</div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {profile.backgrounds?.map((bg, i) => (
                            <div key={i} className="relative group aspect-[4/3] rounded-2xl overflow-hidden border border-foreground/10">
                                <img src={bg.url} alt={`BG ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => removeImage('backgrounds', i)} className="bg-red-500 text-white p-2 rounded-xl hover:scale-110 transition-transform">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {profile.backgrounds?.length < 10 && (
                            <button 
                                onClick={() => triggerUpload('background')} 
                                disabled={uploading}
                                className={`aspect-[4/3] rounded-2xl border-2 border-dashed border-foreground/10 flex flex-col items-center justify-center gap-2 hover:bg-foreground/5 transition-all text-foreground/20 hover:text-primary ${uploadingSection === 'background' ? 'animate-pulse bg-primary/5' : ''}`}
                            >
                                {uploadingSection === 'background' ? <Loader2 size={24} className="animate-spin text-primary" /> : <Plus size={24} />}
                                <span className="text-[9px] font-black uppercase tracking-widest">{uploadingSection === 'background' ? 'กำลังส่งข้อมูล...' : 'เพิ่มรูป'}</span>
                            </button>
                        )}
                    </div>
                </Section>

                {/* Banners */}
                <Section title={t.banners} icon={<ImageIcon size={22} className="text-primary" />} onAdd={profile.banners.length < 10 ? () => triggerUpload('banner') : undefined} canAdd={profile.banners.length < 10}>
                    <div className="text-[10px] font-black text-foreground/30 uppercase tracking-widest mb-6 ml-1">{t.max10Images}</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {profile.banners.map((bn, i) => (
                            <div key={i} className="relative group h-40 rounded-[32px] overflow-hidden border border-foreground/10">
                                <img src={bn.url} alt={`Banner ${i}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                     <button onClick={() => removeImage('banners', i)} className="bg-red-500 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-xs font-black uppercase tracking-widest hover:scale-105 transition-transform">
                                        <Trash2 size={16} /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                         {profile.banners.length < 10 && (
                            <button 
                                onClick={() => triggerUpload('banner')} 
                                disabled={uploading}
                                className={`h-40 rounded-[32px] border-2 border-dashed border-foreground/10 flex flex-col items-center justify-center gap-3 hover:bg-foreground/5 transition-all text-foreground/20 hover:text-primary ${uploadingSection === 'banner' ? 'animate-pulse bg-primary/5' : ''}`}
                            >
                                {uploadingSection === 'banner' ? <Loader2 size={32} className="animate-spin text-primary" /> : <Plus size={32} />}
                                <span className="text-[10px] font-black uppercase tracking-widest">{uploadingSection === 'banner' ? 'กำลังอัปโหลดแบนเนอร์...' : 'เพิ่มแบนเนอร์ใหม่'}</span>
                            </button>
                        )}
                    </div>
                </Section>

                {/* Video */}
                <Section title="วิดีโอแนะนำ" icon={<Video size={22} className="text-primary" />}>
                    <div className="space-y-4">
                        <p className="text-sm text-foreground/60 mb-6">อัพโหลดวิดีโอแนะนำตัวเองหรือผลงาน สามารถตั้งค่าเล่นอัตโนมัติและแนบลิงก์ได้</p>
                        <VideoUpload
                            value={profile.video_config}
                            onChange={(config) => setProfile(p => ({ ...p, video_config: config }))}
                        />
                    </div>
                </Section>

                {/* Websites */}
                <Section title={t.websiteLinks} icon={<Globe size={22} className="text-primary" />} onAdd={addWebsite} canAdd={profile.websites.length < 10}>
                    <div className="space-y-4">
                        {profile.websites.map((item, i) => (
                            <div key={i} className="flex items-center gap-4 group p-2 rounded-2xl hover:bg-foreground/[0.02] transition-colors border border-transparent hover:border-foreground/5">
                                <input type="text" placeholder="ชื่อหัวข้อ (เช่น Portfolio, Website)" value={item.label} onChange={e => setProfile(p => ({ ...p, websites: p.websites.map((w, j) => j === i ? { ...w, label: e.target.value } : w) }))} className="w-1/3 bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                                <input type="url" placeholder="URL (เช่น https://...)" value={item.url} onChange={e => setProfile(p => ({ ...p, websites: p.websites.map((w, j) => j === i ? { ...w, url: e.target.value } : w) }))} className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                                <button onClick={() => removeWebsite(i)} className="text-foreground/20 hover:text-red-500 p-2 transform group-hover:scale-110 transition-all"><Trash2 size={20} /></button>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* About Me */}
                <Section title={t.aboutMe} icon={<Heart size={22} className="text-primary" />}>
                    <textarea value={profile.about_me} onChange={e => setProfile(p => ({ ...p, about_me: e.target.value }))} placeholder={t.aboutMePlaceholder} className="w-full bg-foreground/5 border border-foreground/10 rounded-[24px] px-6 py-5 h-48 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-foreground/20 text-lg leading-relaxed" />
                </Section>

                {/* Interests */}
                <Section title={t.interests} icon={<Heart size={22} className="text-primary" />}>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {profile.interests.map((tag, i) => (
                            <span key={i} className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform cursor-default border border-primary/20">
                                {tag}
                                <button onClick={() => removeInterest(i)} className="p-1 hover:bg-primary/20 rounded-md transition-colors"><X size={12} /></button>
                            </span>
                        ))}
                        {profile.interests.length === 0 && <span className="text-foreground/20 text-sm font-medium ml-1">ยังไม่มีความสนใจที่เลือก</span>}
                    </div>
                    <div className="flex gap-3 max-w-md">
                        <input type="text" value={newInterest} onChange={e => setNewInterest(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addInterest())} placeholder={t.interestsPlaceholder} className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                        <button onClick={addInterest} className="bg-foreground text-background font-black uppercase tracking-widest px-6 py-3 rounded-xl text-[10px] hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-foreground/5">เพิ่ม</button>
                    </div>
                </Section>

                {/* Social Links */}
                <Section title={t.socialLinks} icon={<Globe size={22} className="text-primary" />} onAdd={() => setProfile(p => ({ ...p, social_links_json: [...p.social_links_json, { platform: 'website', url: '' }] }))} canAdd={profile.social_links_json.length < 20}>
                    <div className="space-y-4">
                        {profile.social_links_json.map((link, i) => {
                            const IconComponent = SOCIAL_ICONS[link.platform] || Globe;
                            const option = SOCIAL_OPTIONS.find(o => o.value === link.platform);
                            return (
                                <div key={i} className="flex items-center gap-4 group p-2 rounded-2xl hover:bg-foreground/[0.02] transition-colors border border-transparent hover:border-foreground/5">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 shrink-0" style={{ backgroundColor: option?.color || 'var(--primary)' }}>
                                        <IconComponent size={24} className="text-white" />
                                    </div>
                                    <select value={link.platform} onChange={e => setProfile(p => ({ ...p, social_links_json: p.social_links_json.map((l, j) => j === i ? { ...l, platform: e.target.value } : l) }))} className="bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
                                        {SOCIAL_OPTIONS.map(opt => <option key={opt.value} value={opt.value} className="bg-background text-foreground">{opt.label}</option>)}
                                    </select>
                                    <input type="url" placeholder="ใส่ชื่อผู้ใช้หรือลิงก์ URL..." value={link.url} onChange={e => setProfile(p => ({ ...p, social_links_json: p.social_links_json.map((l, j) => j === i ? { ...l, url: e.target.value } : l) }))} className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
                                    <button onClick={() => setProfile(p => ({ ...p, social_links_json: p.social_links_json.filter((_, j) => j !== i) }))} className="text-foreground/20 hover:text-red-500 p-2 transform group-hover:scale-110 transition-all"><Trash2 size={20} /></button>
                                </div>
                            );
                        })}
                    </div>
                </Section>

                {/* Theme Customization */}
                <Section title={t.themeCustomization} icon={<Palette size={22} className="text-primary" />}>
                    {/* Theme Mode */}
                    <div className="mb-10 space-y-4">
                        <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">{t.colorMode} (Public Profile Only)</label>
                        <div className="flex bg-foreground/5 p-1.5 rounded-2xl w-fit border border-foreground/5 gap-1.5">
                            <button onClick={() => updateTheme('display_theme', 'light')} className={`px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2 transition-all ${profile.layout_config.display_theme === 'light' ? 'bg-background text-foreground shadow-xl scale-105' : 'text-foreground/30 hover:text-foreground/60'}`}>
                                ☀️ {t.light}
                            </button>
                            <button onClick={() => updateTheme('display_theme', 'dark')} className={`px-6 py-3 rounded-xl text-sm font-black flex items-center gap-2 transition-all ${profile.layout_config.display_theme !== 'light' ? 'bg-background text-foreground shadow-xl scale-105' : 'text-foreground/30 hover:text-foreground/60'}`}>
                                🌙 {t.dark}
                            </button>
                        </div>
                    </div>

                    {/* Primary Color */}
                    <div className="mb-10 space-y-4">
                        <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">{t.primaryColor}</label>
                        <div className="flex flex-wrap gap-4 mb-6">
                            {['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => updateTheme('primary_color', color)}
                                    className={`w-12 h-12 rounded-[18px] border-4 transition-all hover:scale-110 shadow-lg ${profile.layout_config.primary_color === color ? 'border-primary scale-110 ring-4 ring-primary/20' : 'border-background shadow-foreground/5'}`}
                                    style={{ backgroundColor: color }}
                                >
                                    {profile.layout_config.primary_color === color && <Check className="text-white mx-auto" size={24} />}
                                </button>
                            ))}
                        </div>
                        <div className="flex items-center gap-4 bg-foreground/5 p-4 rounded-2xl border border-foreground/5 w-fit">
                            <input
                                type="color"
                                value={profile.layout_config.primary_color || '#6366F1'}
                                onChange={e => updateTheme('primary_color', e.target.value)}
                                className="h-10 w-10 rounded-xl cursor-pointer bg-transparent border-none overflow-hidden"
                            />
                            <input
                                type="text"
                                value={profile.layout_config.primary_color || '#6366F1'}
                                onChange={e => updateTheme('primary_color', e.target.value)}
                                className="bg-background border border-foreground/10 rounded-lg px-4 py-2 text-xs font-black uppercase w-32 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all tracking-widest"
                            />
                        </div>
                    </div>

                    {/* Font */}
                    <div className="space-y-4">
                        <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">{t.font}</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {['Inter', 'Kanit', 'Sarabun', 'Roboto', 'Playfair Display'].map(font => (
                                <button
                                    key={font}
                                    onClick={() => updateTheme('font_family', font)}
                                    className={`px-5 py-4 rounded-2xl border-2 text-sm font-bold transition-all ${profile.layout_config.font_family === font ? 'border-primary bg-primary/5 text-primary shadow-inner scale-105' : 'border-foreground/5 bg-foreground/5 text-foreground/40 hover:bg-foreground/10 hover:border-foreground/20'}`}
                                    style={{ fontFamily: font }}
                                >
                                    {font}
                                </button>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* QR Code Section */}
                <Section title={t.qrCode} icon={<QrCode size={22} className="text-primary" />}>
                    <div className="flex flex-col md:flex-row items-center gap-10 bg-foreground/[0.02] p-8 rounded-[40px] border border-foreground/5 group">
                        <div className="bg-white p-4 rounded-[32px] shadow-2xl group-hover:rotate-6 transition-transform duration-500">
                             <QrCodeImage url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://namecard.dpattown.com'}/${profile.url_prefix || 'p'}/${uid}`} size={160} />
                        </div>
                        <div className="space-y-6 flex-1 text-center md:text-left">
                            <h4 className="text-2xl font-black tracking-tight">{t.qrCodeDescription}</h4>
                            <div className="bg-foreground/5 p-4 rounded-2xl font-mono text-[11px] text-primary break-all border border-foreground/5">
                                {`${process.env.NEXT_PUBLIC_SITE_URL || 'https://namecard.dpattown.com'}/${profile.url_prefix || 'p'}/${uid}`}
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <button onClick={() => {
                                    navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://namecard.dpattown.com'}/${profile.url_prefix || 'p'}/${uid}`);
                                    alert('คัดลอกลิงก์แล้ว!');
                                }} className="px-6 py-2.5 bg-foreground text-background rounded-xl text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all">Copy Link</button>
                                <p className="text-[10px] font-bold text-foreground/30 flex items-center gap-2">💡 {t.qrCodeHint}</p>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Account Settings Moved to /manage/account */}
            </main>
            
            <footer className="py-20 text-center opacity-20 text-[10px] font-black uppercase tracking-[0.3em]">
                NAMECARD.AI © 2024 • THE PREMIUM DIGITAL EXPERIENCE
            </footer>
        </div>
    );
}

// Section component
function Section({ title, icon, children, onAdd, canAdd = true }: { title: string; icon: React.ReactNode; children: React.ReactNode; onAdd?: () => void; canAdd?: boolean }) {
    return (
        <section className="bg-card-bg border border-glass-border rounded-[40px] p-10 glass-card">
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-2xl font-black flex items-center gap-4 tracking-tighter">{icon} {title}</h2>
                {onAdd && canAdd && (
                    <button onClick={onAdd} className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/10 transition-all active:scale-95">
                        <Plus size={18} /> {UI_TEXT['th'].add}
                    </button>
                )}
            </div>
            {children}
        </section>
    );
}

// I18n input component
function I18nInput({ item, languages, onChange, onRemove }: { item: I18nField; languages: typeof LANGUAGES; onChange: (v: string) => void; onRemove?: () => void }) {
    const lang = languages.find(l => l.code === item.lang);
    return (
        <div className="flex items-center gap-4 group">
            <div className="w-28 flex items-center gap-2 text-xs font-black text-foreground/30 uppercase tracking-widest shrink-0">
                <span className="text-lg">{lang?.flag}</span> {lang?.code}
            </div>
            <input type="text" value={item.value} onChange={e => onChange(e.target.value)} className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl px-5 py-3.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
            {onRemove && <button onClick={onRemove} className="text-foreground/10 hover:text-red-500 p-2 transform group-hover:scale-110 transition-all"><Trash2 size={20} /></button>}
        </div>
    );
}

// Contact input component
function ContactInput({ item, placeholder, onLabelChange, onValueChange, onRemove }: { item: ContactField; placeholder: string; onLabelChange: (v: string) => void; onValueChange: (v: string) => void; onRemove?: () => void }) {
    return (
        <div className="flex items-center gap-4 group">
            <input type="text" placeholder="หัวข้อ" value={item.label} onChange={e => onLabelChange(e.target.value)} className="w-28 bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3.5 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
            <input type="text" placeholder={placeholder} value={item.value} onChange={e => onValueChange(e.target.value)} className="flex-1 bg-foreground/5 border border-foreground/10 rounded-xl px-5 py-3.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
            {onRemove && <button onClick={onRemove} className="text-foreground/10 hover:text-red-500 p-2 transform group-hover:scale-110 transition-all"><Trash2 size={20} /></button>}
        </div>
    );
}

// Password change form component
function PasswordChangeForm({ token }: { token: string | undefined }) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPasswords, setShowPasswords] = useState(false);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        // Validation
        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' });
            return;
        }
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'รหัสผ่านใหม่ไม่ตรงกัน' });
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });

            if (res.ok) {
                setMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านสำเร็จแล้ว' });
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                const error = await res.json();
                setMessage({ type: 'error', text: error.message || 'รหัสผ่านปัจจุบันไม่ถูกต้อง' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
            {message && (
                <div className={`p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${message.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    {message.text}
                </div>
            )}
            
            <div className="space-y-2">
                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-widest ml-1">รหัสผ่านปัจจุบัน</label>
                <div className="relative">
                    <input
                        type={showPasswords ? "text" : "password"}
                        value={currentPassword}
                        onChange={e => setCurrentPassword(e.target.value)}
                        required
                        className="w-full bg-background border border-foreground/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    <button type="button" onClick={() => setShowPasswords(!showPasswords)} className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/20 hover:text-foreground">
                        {showPasswords ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>
            </div>

            <div className="space-y-2">
                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-widest ml-1">รหัสผ่านใหม่</label>
                <input
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    className="w-full bg-background border border-foreground/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-widest ml-1">ยืนยันรหัสผ่านใหม่</label>
                <input
                    type={showPasswords ? "text" : "password"}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-background border border-foreground/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-xs hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'บันทึกการเปลี่ยนรหัสผ่าน'}
            </button>
        </form>
    );
}
