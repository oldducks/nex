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
interface BannerImage {
    url: string;
    position: { x: number; y: number };
    scale?: number;
    display_position?: 'top' | 'bottom';
    height?: string;
    link_url?: string;
}
interface WebsiteLink { label: string; url: string; position?: string; }
interface VideoConfig { url: string; autoplay: boolean; link_url?: string; link_enabled: boolean; enabled: boolean; }

interface FeatureConfig {
    catalog?: boolean;
    leads?: boolean;
    namecard?: boolean;
    'landing-pages'?: boolean;
    analytics?: boolean;
    profile?: boolean;
    referrals?: boolean;
    video?: boolean;
}

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
    banners: BannerImage[];
    // Links
    websites: WebsiteLink[];
    social_links_json: any[];
    // About
    about_me: string;
    interests: string[];
    // Video
    video_config: VideoConfig | null;
    subscription_tier?: string;
    feature_config?: FeatureConfig;
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
        banner_height?: string;
        banner_position?: 'top' | 'bottom';
        show_lead_form?: boolean;
        show_contact_info?: boolean;
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
    subscription_tier: 'free',
    feature_config: {},
    layout_config: {
        sections: ['banner', 'profile', 'info', 'about', 'social', 'contact'],
        profile_position: 'center',
        theme: 'light',
        display_theme: 'light',
        primary_color: '#6366F1',
        background_color: '#09090b',
        font_family: 'Inter',
        card_style: 'glass',
        show_lead_form: true,
        show_contact_info: true
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
        banners: 'โคเวอร์',
        websiteLinks: 'ลิงก์เว็บไซต์',
        aboutMePlaceholder: 'แนะนำตัวเอง...',
        interests: 'ความสนใจ / งานอดิเรก',
        interestsPlaceholder: 'เช่น ชอบกินเกาลัด, ชอบขี่จักรยาน',
        socialLinks: 'Social Links',
        themeCustomization: 'การตกแต่ง (Theme)',
        qrCodeDescription: 'QR Code นี้จะลิงก์ไปที่หน้า Public Profile ของคุณ',
        qrCodeHint: 'QR Code จะแสดงอัตโนมัติในหน้า Public Profile',
        leadGeneration: 'ระบบเก็บข้อมูล (Lead Generation)',
        showContactForm: 'แสดงฟอร์มติดต่อ',
        contactSettings: 'ตั้งค่าการติดต่อ (Contact Settings)',
        showContactInfo: 'แสดงข้อมูลติดต่อ (เบอร์/อีเมล)',
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
        leadGeneration: 'Lead Generation System',
        showContactForm: 'Show Contact Form',
        contactSettings: 'Contact Settings',
        showContactInfo: 'Show Contact Details',
    }
};

export default function ProfileEditorV2() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [uploadingSection, setUploadingSection] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uid, setUid] = useState('');
    const [profile, setProfile] = useState<Profile>(defaultProfile);
    const [newInterest, setNewInterest] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadTarget, setUploadTarget] = useState<string>('profile');
    const [lang, setLang] = useState<'th' | 'en'>('th');
    const t = UI_TEXT[lang];
    const hasPremiumVideo = profile.subscription_tier === 'premium' || profile.feature_config?.video === true;
    const initialProfileSnapshotRef = useRef('');
    const [isDirty, setIsDirty] = useState(false);

    const quickSections = [
        { id: 'sec-basic', label: lang === 'th' ? 'ข้อมูลหลัก' : 'Basic' },
        { id: 'sec-media', label: lang === 'th' ? 'รูป/วิดีโอ' : 'Media' },
        { id: 'sec-links', label: lang === 'th' ? 'ลิงก์' : 'Links' },
        { id: 'sec-theme', label: lang === 'th' ? 'ธีม' : 'Theme' },
    ];

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const token = Cookies.get('token');

    useEffect(() => {
        if (!token) { router.push('/login'); return; }
        setUid(Cookies.get('uid') || '');
        fetchProfile();
    }, [token]);

    const fetchProfile = async () => {
        try {
            setLoadError('');
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
                const nextProfile = {
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
                    subscription_tier: data.subscription_tier || 'free',
                    feature_config: data.feature_config || {},
                    layout_config: data.layout_config || defaultProfile.layout_config,
                };
                setProfile(nextProfile);
                initialProfileSnapshotRef.current = JSON.stringify(nextProfile);
                setIsDirty(false);
            } else {
                const text = await res.text();
                setLoadError(`โหลดข้อมูลไม่สำเร็จ (${res.status})`);
                console.error('Failed to fetch profile:', text);
            }
        } catch (error) {
            console.error('Failed to fetch profile:', error);
            setLoadError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่');
        }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (!initialProfileSnapshotRef.current) return;
        setIsDirty(JSON.stringify(profile) !== initialProfileSnapshotRef.current);
    }, [profile]);

    const scrollToSection = (id: string) => {
        const target = document.getElementById(id);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { url_prefix, subscription_tier, feature_config, ...savePayload } = profile;
            savePayload.layout_config = {
                ...(savePayload.layout_config || {}),
                profile_position: 'center',
            };
            savePayload.backgrounds = Array.isArray(savePayload.backgrounds) && savePayload.backgrounds.length > 0
                ? [savePayload.backgrounds[0]]
                : [];
            const normalizedBanners = Array.isArray(savePayload.banners) ? savePayload.banners : [];
            const topBanner = normalizedBanners.find((b: any) => (b.display_position || 'top') === 'top');
            const bottomBanner = normalizedBanners.find((b: any) => b.display_position === 'bottom');
            savePayload.banners = [topBanner, bottomBanner].filter((b): b is BannerImage => Boolean(b));
            const res = await fetch(`${API_URL}/profile/me`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(savePayload)
            });
            if (res.ok) {
                alert('บันทึกสำเร็จ!');
                await fetchProfile();
            }
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

        const resolveImageUrlFromJob = async (jobId: string): Promise<string> => {
            const maxAttempts = 40;
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                const statusRes = await fetch(`${API_URL}/uploads/job/${jobId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!statusRes.ok) {
                    throw new Error('Failed to check upload status');
                }

                const status = await statusRes.json();
                if (status.state === 'completed') {
                    const url = status?.result?.url;
                    if (!url) throw new Error('Upload finished but URL missing');
                    // Fix: Handle both absolute and relative URLs from API
                    if (url.startsWith('http://') || url.startsWith('https://')) {
                        return url;
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

        try {
            const res = await fetch(`${API_URL}/uploads/image`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Upload failed (${res.status}): ${errorText.substring(0, 100)}`);
            }

            const data = await res.json();
            const jobId = data?.jobId;
            if (!jobId) {
                throw new Error('Upload job id not returned');
            }

            const imageUrl = await resolveImageUrlFromJob(String(jobId));

            if (target === 'profile') {
                setProfile(p => ({ ...p, profile_pic_url: imageUrl }));
            } else if (target === 'logo') {
                setProfile(p => ({ ...p, logo: { url: imageUrl, position: { x: 0, y: 0 } } }));
            } else if (target === 'background' || target === 'backgrounds') {
                setProfile(p => {
                    const backgrounds = p.backgrounds || [];
                    return { ...p, backgrounds: [...backgrounds, { url: imageUrl, position: { x: 0, y: 0 } }] };
                });
            } else if (target === 'banner' || target === 'banners') {
                setProfile(p => {
                    const banners = p.banners || [];
                    if (banners.length >= 2) {
                        alert(lang === 'th' ? 'โคเวอร์ได้สูงสุด 2 รูป (บน 1, ล่าง 1)' : 'Maximum 2 banners (top 1, bottom 1)');
                        return p;
                    }

                    const hasTop = banners.some((b) => (b.display_position || 'top') === 'top');
                    const nextPosition: 'top' | 'bottom' = hasTop ? 'bottom' : 'top';

                    const newBanners: BannerImage[] = [...banners, {
                        url: imageUrl,
                        position: { x: 0, y: 0 },
                        scale: 1,
                        display_position: nextPosition,
                        height: '320px'
                    }];
                    return { ...p, banners: newBanners };
                });
            }
        } catch (error: any) {
            console.error('Upload error:', error);
            alert(error?.message || 'Error uploading image. Please try again.');
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
    const updateTheme = (key: string, value: any) => {
        setProfile(p => ({
            ...p,
            layout_config: { ...p.layout_config, [key]: value }
        }));
    };

    if (loading) return (
        <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A] flex items-center justify-center">
            <Loader2 className="animate-spin text-[#F97316]" size={32} />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A]">
            <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.14),transparent_34%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.3),transparent_42%),linear-gradient(180deg,#f6f8ff_0%,#eef0ff_55%,#e8eeff_100%)]" />
            {/* Hidden file input */}
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />

            {/* Navbar */}
            <header className="sticky top-0 z-50 border-b border-[#D9E1F2] bg-white/82 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.push('/manage/control-center')} className="group flex h-10 w-10 items-center justify-center rounded-xl border border-[#D9E1F2] bg-[#F6F8FF] transition-colors hover:bg-white">
                            <ArrowLeft size={20} className="text-[#64748B] transition-all group-hover:text-[#050579]" />
                        </button>
                        <h1 className="hidden text-xl font-black tracking-tight text-[#050579] sm:block">{t.header}</h1>
                    </div>
                    
                    <div className="flex gap-2 md:gap-4 items-center">
                        {/* Language Switcher */}
                        <div className="flex rounded-xl border border-[#D9E1F2] bg-[#F6F8FF] p-1">
                            <button onClick={() => setLang('th')} className={`h-8 w-10 rounded-lg text-xs font-black transition-all ${lang === 'th' ? 'bg-white text-[#050579] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}>TH</button>
                            <button onClick={() => setLang('en')} className={`h-8 w-10 rounded-lg text-xs font-black transition-all ${lang === 'en' ? 'bg-white text-[#050579] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}>EN</button>
                        </div>

                        <Link href={`/${profile.url_prefix || 'p'}/${uid}`} target="_blank" className="hidden items-center gap-2 rounded-xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-2.5 text-sm font-bold text-[#0F172A] transition-colors hover:bg-white md:flex">
                            <Eye size={18} />
                            <span>{t.viewPublic}</span>
                        </Link>
                        <Link href={`/${profile.url_prefix || 'p'}/${uid}`} target="_blank" className="rounded-xl border border-[#D9E1F2] bg-[#F6F8FF] p-2.5 text-[#64748B] transition-colors hover:bg-white hover:text-[#0F172A] md:hidden" title="ดูหน้าโปรไฟล์">
                            <Eye size={20} />
                        </Link>
                        
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="flex items-center gap-2 rounded-xl bg-[#F97316] px-6 py-2.5 text-sm font-black text-white shadow-[0_18px_40px_-26px_rgba(249,115,22,0.45)] transition-colors hover:bg-[#EA580C] disabled:scale-95 disabled:opacity-50 active:scale-95"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            <span className="hidden md:inline">{saving ? (lang === 'th' ? 'กำลังบันทึก...' : 'Saving...') : t.save}</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
                <div className="sticky top-20 z-40 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#D9E1F2] bg-white/88 px-4 py-3 backdrop-blur">
                    <div className="flex items-center gap-2 text-xs font-bold text-[#475569]">
                        <span className={`inline-block h-2.5 w-2.5 rounded-full ${loadError ? 'bg-red-500' : isDirty ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                        {loadError
                            ? loadError
                            : isDirty
                                ? (lang === 'th' ? 'มีการเปลี่ยนแปลงที่ยังไม่บันทึก' : 'Unsaved changes')
                                : (lang === 'th' ? 'บันทึกล่าสุดเรียบร้อย' : 'All changes saved')}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {quickSections.map((s) => (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => scrollToSection(s.id)}
                                className="rounded-lg border border-[#D9E1F2] px-3 py-1.5 text-xs transition hover:border-[#F6D5BF] hover:text-[#F97316]"
                            >
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-6 lg:gap-8">
                    <aside className="sticky top-40 hidden h-fit rounded-2xl border border-[#D9E1F2] bg-white/88 p-3 backdrop-blur lg:block">
                        <div className="px-2 pb-2 text-[10px] font-black uppercase tracking-widest text-[#64748B]">Quick Nav</div>
                        <div className="space-y-1">
                            {quickSections.map((s) => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => scrollToSection(s.id)}
                                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#475569] transition hover:bg-[#F6F8FF] hover:text-[#050579]"
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>
                    </aside>
                    <div className="space-y-8 sm:space-y-10">
                {/* Names */}
                <Section sectionId="sec-basic" title={t.name} icon={<User size={22} className="text-[#050579]" />} onAdd={() => addI18n('names_i18n')} canAdd={profile.names_i18n.length < LANGUAGES.length}>
                    <div className="space-y-4">
                        {profile.names_i18n.map((item, i) => (
                            <I18nInput key={i} item={item} languages={LANGUAGES} onChange={(v) => updateI18n('names_i18n', i, v)} onRemove={profile.names_i18n.length > 1 ? () => removeI18n('names_i18n', i) : undefined} />
                        ))}
                    </div>
                </Section>

                {/* Positions */}
                <Section title={t.position} icon={<Briefcase size={22} className="text-[#050579]" />} onAdd={() => addI18n('positions_i18n')} canAdd={profile.positions_i18n.length < LANGUAGES.length}>
                    <div className="space-y-4">
                        {profile.positions_i18n.map((item, i) => (
                            <I18nInput key={i} item={item} languages={LANGUAGES} onChange={(v) => updateI18n('positions_i18n', i, v)} onRemove={profile.positions_i18n.length > 1 ? () => removeI18n('positions_i18n', i) : undefined} />
                        ))}
                    </div>
                </Section>

                {/* Companies */}
                <Section title={t.company} icon={<Building2 size={22} className="text-[#050579]" />} onAdd={() => addI18n('companies_i18n')} canAdd={profile.companies_i18n.length < LANGUAGES.length}>
                    <div className="space-y-4">
                        {profile.companies_i18n.map((item, i) => (
                            <I18nInput key={i} item={item} languages={LANGUAGES} onChange={(v) => updateI18n('companies_i18n', i, v)} onRemove={profile.companies_i18n.length > 1 ? () => removeI18n('companies_i18n', i) : undefined} />
                        ))}
                    </div>
                </Section>

                {/* Emails */}
                <Section title={t.email} icon={<Mail size={22} className="text-[#050579]" />} onAdd={() => addContact('emails')} canAdd={profile.emails.length < 10}>
                    <div className="space-y-4">
                        {profile.emails.map((item, i) => (
                            <ContactInput key={i} item={item} placeholder="email@example.com" onLabelChange={(v) => updateContact('emails', i, 'label', v)} onValueChange={(v) => updateContact('emails', i, 'value', v)} onRemove={profile.emails.length > 1 ? () => removeContact('emails', i) : undefined} />
                        ))}
                    </div>
                </Section>

                {/* Phones */}
                <Section title={t.phone} icon={<Phone size={22} className="text-[#050579]" />} onAdd={() => addContact('phones')} canAdd={profile.phones.length < 10}>
                    <div className="space-y-4">
                        {profile.phones.map((item, i) => (
                            <ContactInput key={i} item={item} placeholder="08x-xxx-xxxx" onLabelChange={(v) => updateContact('phones', i, 'label', v)} onValueChange={(v) => updateContact('phones', i, 'value', v)} onRemove={profile.phones.length > 1 ? () => removeContact('phones', i) : undefined} />
                        ))}
                    </div>
                </Section>

                {/* Profile Picture */}
                <Section sectionId="sec-media" title={t.profilePic} icon={<ImageIcon size={22} className="text-[#050579]" />}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        {/* Image Cropper */}
                        <div className="flex justify-center md:justify-start">
                            {profile.profile_pic_url ? (
                                <div className="rounded-[40px] border border-[#D9E1F2] bg-[#F8FAFF] p-4 shadow-inner">
                                    <ImageCropper
                                        imageUrl={profile.profile_pic_url}
                                        initialPosition={profile.profile_pic_position}
                                        onPositionChange={(pos) => setProfile(p => ({ ...p, profile_pic_position: pos }))}
                                        aspectRatio={1}
                                        className="w-56 h-56 rounded-[32px] overflow-hidden"
                                    />
                                </div>
                            ) : (
                                <div className="flex h-56 w-56 flex-col items-center justify-center gap-3 rounded-[40px] border-2 border-dashed border-[#D9E1F2] bg-[#F8FAFF]">
                                    <User size={64} className="text-[#CBD5E1]" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">ยังไม่มีรูปโปรไฟล์</span>
                                </div>
                            )}
                        </div>

                        {/* Upload and Options */}
                        <div className="space-y-8">
                            <div className="space-y-3">
                                <button onClick={() => triggerUpload('profile')} disabled={uploading} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-[#F97316] px-6 py-3.5 text-sm font-black text-white shadow-[0_18px_40px_-24px_rgba(249,115,22,0.42)] transition-colors hover:bg-[#EA580C] active:scale-95">
                                    {uploading ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />} {t.uploadImage}
                                </button>
                                <p className="text-center text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">PNG, JPG, WEBP (Maximum 5MB)</p>
                            </div>

                        </div>
                    </div>
                </Section>

                {/* Logo */}
                <Section title={t.companyLogo} icon={<Building2 size={22} className="text-[#050579]" />}>
                    <div className="flex items-center gap-8">
                        <div className="group flex h-28 w-28 items-center justify-center overflow-hidden rounded-[24px] border border-[#D9E1F2] bg-[#F8FAFF] p-4 transition-colors hover:border-[#F6D5BF]">
                            {profile.logo?.url ? (
                                <img src={profile.logo.url} alt="Logo" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                                <Building2 size={40} className="text-[#CBD5E1]" />
                            )}
                        </div>
                        <div className="space-y-2">
                             <button onClick={() => triggerUpload('logo')} disabled={uploading} className="flex items-center gap-2 rounded-xl border border-[#D9E1F2] bg-[#F6F8FF] px-6 py-3 text-xs font-black uppercase tracking-widest text-[#0F172A] transition-colors hover:bg-white active:scale-95">
                                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} {t.uploadLogo}
                            </button>
                            <p className="px-1 text-[10px] font-medium text-[#94A3B8]">โลโก้จะแสดงที่มุมขวาบนของโปรไฟล์</p>
                        </div>
                    </div>
                </Section>

                {/* Backgrounds */}
                <Section title={t.backgroundImages} icon={<ImageIcon size={22} className="text-[#050579]" />}>
                    <div className="mb-6 ml-1 text-[10px] font-black uppercase tracking-widest text-[#64748B]">ใช้ได้ 1 รูป</div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {profile.backgrounds?.[0] ? (
                            <div className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#D9E1F2]">
                                <img src={profile.backgrounds[0].url} alt="Background" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => setProfile(p => ({ ...p, backgrounds: [] }))} className="bg-red-500 text-white p-2 rounded-xl hover:scale-110 transition-transform">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => triggerUpload('background')}
                                disabled={uploading}
                                className={`flex aspect-[4/3] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[#D9E1F2] text-[#94A3B8] transition-all hover:bg-[#F8FAFF] hover:text-[#F97316] ${uploadingSection === 'background' ? 'animate-pulse bg-[#FFF7F1]' : ''}`}
                            >
                                {uploadingSection === 'background' ? <Loader2 size={24} className="animate-spin text-[#F97316]" /> : <Plus size={24} />}
                                <span className="text-[9px] font-black uppercase tracking-widest">{uploadingSection === 'background' ? 'กำลังส่งข้อมูล...' : 'เพิ่มรูป'}</span>
                            </button>
                        )}
                    </div>
                </Section>

                {/* Banners */}
                <Section title={t.banners} icon={<ImageIcon size={22} className="text-[#050579]" />} onAdd={profile.banners.length < 2 ? () => triggerUpload('banner') : undefined} canAdd={profile.banners.length < 2}>
                    <div className="mb-6 ml-1 text-[10px] font-black uppercase tracking-widest text-[#64748B]">
                        {lang === 'th' ? 'สูงสุด 2 รูป (บน 1, ล่าง 1)' : 'Max 2 banners (top 1, bottom 1)'}
                    </div>

                    <div className="space-y-6">
                        {profile.banners.map((bn, i) => (
                            <div key={i} className="overflow-hidden rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF]">
                                {/* Banner Preview */}
                                <div className="relative h-32 overflow-hidden">
                                    <img src={bn.url} alt={`Banner ${i + 1}`} className="w-full h-full object-cover" />
                                    <div className="absolute top-2 left-2 bg-black/60 text-white px-2 py-1 rounded-lg text-xs font-bold">
                                        #{i + 1}
                                    </div>
                                    <div className="absolute top-2 right-2 flex gap-2">
                                        <span className={`rounded-lg px-2 py-1 text-xs font-bold text-white ${bn.display_position === 'bottom' ? 'bg-[#F97316]' : 'bg-[#2563EB]'}`}>
                                            {bn.display_position === 'bottom' ? '🔽 ล่าง' : '🔼 บน'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => removeImage('banners', i)}
                                        className="absolute bottom-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                {/* Banner Settings */}
                                <div className="p-4 space-y-4">
                                    {/* Position */}
                                    <div className="flex items-center gap-3">
                                        <span className="w-16 text-xs font-bold text-[#64748B]">{lang === 'th' ? 'ตำแหน่ง' : 'Position'}</span>
                                        <div className="flex gap-2 flex-1">
                                            {[
                                                { value: 'top', label: lang === 'th' ? '🔼 บน' : '🔼 Top' },
                                                { value: 'bottom', label: lang === 'th' ? '🔽 ล่าง' : '🔽 Bottom' },
                                            ].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => {
                                                        const newBanners = [...profile.banners];
                                                        newBanners[i] = { ...newBanners[i], display_position: opt.value as 'top' | 'bottom' };
                                                        setProfile(p => ({ ...p, banners: newBanners }));
                                                    }}
                                                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                                                        (bn.display_position || 'top') === opt.value
                                                            ? 'bg-[#050579] text-white'
                                                            : 'bg-white text-[#64748B] hover:bg-[#F6F8FF]'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Height */}
                                    <div className="flex items-center gap-3">
                                        <span className="w-16 text-xs font-bold text-[#64748B]">{lang === 'th' ? 'ความสูง' : 'Height'}</span>
                                        <div className="flex gap-1 flex-1 flex-wrap">
                                            {[
                                                { value: '200px', label: 'S' },
                                                { value: '280px', label: 'M' },
                                                { value: '360px', label: 'L' },
                                                { value: '450px', label: 'XL' },
                                            ].map(opt => (
                                                <button
                                                    key={opt.value}
                                                    onClick={() => {
                                                        const newBanners = [...profile.banners];
                                                        newBanners[i] = { ...newBanners[i], height: opt.value };
                                                        setProfile(p => ({ ...p, banners: newBanners }));
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                                        (bn.height || '320px') === opt.value
                                                            ? 'bg-[#050579] text-white'
                                                            : 'bg-white text-[#64748B] hover:bg-[#F6F8FF]'
                                                    }`}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Link URL */}
                                    <div className="flex items-center gap-3">
                                        <span className="w-16 text-xs font-bold text-[#64748B]">{lang === 'th' ? 'ลิงก์' : 'Link'}</span>
                                        <input
                                            type="url"
                                            value={bn.link_url || ''}
                                            onChange={(e) => {
                                                const newBanners = [...profile.banners];
                                                newBanners[i] = { ...newBanners[i], link_url: e.target.value };
                                                setProfile(p => ({ ...p, banners: newBanners }));
                                            }}
                                            placeholder={lang === 'th' ? 'https://example.com (คลิกโคเวอร์แล้วเปิด)' : 'https://example.com (Click to open)'}
                                            className="flex-1 rounded-lg border border-[#D9E1F2] bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Add Banner Button */}
                        {profile.banners.length < 2 && (
                            <button
                                onClick={() => triggerUpload('banner')}
                                disabled={uploading}
                                className={`flex h-32 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#D9E1F2] text-[#94A3B8] transition-all hover:bg-[#F8FAFF] hover:text-[#F97316] ${uploadingSection === 'banner' ? 'animate-pulse bg-[#FFF7F1]' : ''}`}
                            >
                                {uploadingSection === 'banner' ? <Loader2 size={32} className="animate-spin text-[#F97316]" /> : <Plus size={32} />}
                                <span className="text-[10px] font-black uppercase tracking-widest">{uploadingSection === 'banner' ? 'กำลังอัปโหลด...' : 'เพิ่มโคเวอร์'}</span>
                            </button>
                        )}
                    </div>
                </Section>

                {/* Video */}
                <Section title="วิดีโอแนะนำ" icon={<Video size={22} className="text-[#050579]" />}>
                    <div className="space-y-4">
                        <p className="mb-6 text-sm text-[#475569]">อัพโหลดวิดีโอแนะนำตัวเองหรือผลงาน สามารถตั้งค่าเล่นอัตโนมัติและแนบลิงก์ได้</p>

                        {!hasPremiumVideo && (
                            <div className="rounded-2xl border border-[#F6D5BF] bg-[#FFF7F1] p-4 text-sm text-[#C2410C]">
                                ฟีเจอร์วิดีโอแนะนำสำหรับบัญชีพรีเมี่ยมเท่านั้น กรุณาอัปเกรดเพื่อปลดล็อคการใช้งาน
                            </div>
                        )}

                        <div className={!hasPremiumVideo ? 'pointer-events-none opacity-50 select-none' : ''}>
                            <VideoUpload
                                value={profile.video_config}
                                onChange={(config) => {
                                    if (!hasPremiumVideo) return;
                                    setProfile(p => ({ ...p, video_config: config }));
                                }}
                            />
                        </div>
                    </div>
                </Section>

                {/* Websites */}
                <Section sectionId="sec-links" title={t.websiteLinks} icon={<Globe size={22} className="text-[#050579]" />} onAdd={addWebsite} canAdd={profile.websites.length < 10}>
                    <div className="space-y-4">
                        {profile.websites.map((item, i) => (
                            <div key={i} className="group flex items-center gap-4 rounded-2xl border border-[#E7ECF7] bg-[#F8FAFF] p-3 transition-colors hover:bg-white">
                                <input type="text" placeholder="ชื่อหัวข้อ (เช่น Portfolio, Website)" value={item.label} onChange={e => setProfile(p => ({ ...p, websites: p.websites.map((w, j) => j === i ? { ...w, label: e.target.value } : w) }))} className="w-1/3 rounded-xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]/20" />
                                <input type="url" placeholder="URL (เช่น https://...)" value={item.url} onChange={e => setProfile(p => ({ ...p, websites: p.websites.map((w, j) => j === i ? { ...w, url: e.target.value } : w) }))} className="flex-1 rounded-xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]/20" />
                                <button onClick={() => removeWebsite(i)} className="p-2 text-[#CBD5E1] transition-all group-hover:scale-110 hover:text-red-500"><Trash2 size={20} /></button>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* About Me */}
                <Section title={t.aboutMe} icon={<Heart size={22} className="text-[#050579]" />}>
                    <textarea value={profile.about_me} onChange={e => setProfile(p => ({ ...p, about_me: e.target.value }))} placeholder={t.aboutMePlaceholder} className="min-h-[200px] w-full resize-y rounded-[24px] border border-[#D9E1F2] bg-[#F8FAFF] px-4 py-4 text-base leading-relaxed text-[#0F172A] transition-all placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 md:min-h-[250px] md:px-6 md:py-5 md:text-lg" />
                </Section>

                {/* Interests */}
                <Section title={t.interests} icon={<Heart size={22} className="text-[#050579]" />}>
                    <div className="flex flex-wrap gap-2 mb-6">
                        {profile.interests.map((tag, i) => (
                            <span key={i} className="flex cursor-default items-center gap-2 rounded-xl border border-[#F6D5BF] bg-[#FFF7F1] px-4 py-2 text-xs font-black uppercase tracking-widest text-[#C2410C] transition-transform hover:scale-105">
                                {tag}
                                <button onClick={() => removeInterest(i)} className="rounded-md p-1 transition-colors hover:bg-[#FFF1E8]"><X size={12} /></button>
                            </span>
                        ))}
                        {profile.interests.length === 0 && <span className="ml-1 text-sm font-medium text-[#94A3B8]">ยังไม่มีความสนใจที่เลือก</span>}
                    </div>
                    <div className="flex gap-3 max-w-md">
                        <input type="text" value={newInterest} onChange={e => setNewInterest(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addInterest())} placeholder={t.interestsPlaceholder} className="flex-1 rounded-xl border border-[#D9E1F2] bg-[#F8FAFF] px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]/20" />
                        <button onClick={addInterest} className="rounded-xl bg-[#F97316] px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-[0_14px_30px_-18px_rgba(249,115,22,0.42)] transition-colors hover:bg-[#EA580C] active:scale-95">เพิ่ม</button>
                    </div>
                </Section>

                {/* Social Links */}
                <Section title={t.socialLinks} icon={<Globe size={22} className="text-[#050579]" />} onAdd={() => setProfile(p => ({ ...p, social_links_json: [...p.social_links_json, { platform: 'website', url: '' }] }))} canAdd={profile.social_links_json.length < 20}>
                    <div className="space-y-4">
                        {profile.social_links_json.map((link, i) => {
                            const IconComponent = SOCIAL_ICONS[link.platform] || Globe;
                            const option = SOCIAL_OPTIONS.find(o => o.value === link.platform);
                            return (
                                <div key={i} className="group flex flex-col gap-3 rounded-2xl border border-[#E7ECF7] bg-[#F8FAFF] p-3 transition-colors hover:bg-white sm:flex-row sm:items-center sm:gap-4 sm:p-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg shrink-0" style={{ backgroundColor: option?.color || 'var(--primary)' }}>
                                            <IconComponent size={20} className="text-white sm:hidden" />
                                            <IconComponent size={24} className="text-white hidden sm:block" />
                                        </div>
                                        <select value={link.platform} onChange={e => setProfile(p => ({ ...p, social_links_json: p.social_links_json.map((l, j) => j === i ? { ...l, platform: e.target.value } : l) }))} className="flex-1 rounded-xl border border-[#D9E1F2] bg-white px-3 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 sm:flex-none sm:px-4 sm:py-3">
                                            {SOCIAL_OPTIONS.map(opt => <option key={opt.value} value={opt.value} className="bg-background text-foreground">{opt.label}</option>)}
                                        </select>
                                        <button onClick={() => setProfile(p => ({ ...p, social_links_json: p.social_links_json.filter((_, j) => j !== i) }))} className="p-2 text-[#94A3B8] hover:text-red-500 sm:hidden"><Trash2 size={18} /></button>
                                    </div>
                                    <input type="url" placeholder="ใส่ชื่อผู้ใช้หรือลิงก์ URL..." value={link.url} onChange={e => setProfile(p => ({ ...p, social_links_json: p.social_links_json.map((l, j) => j === i ? { ...l, url: e.target.value } : l) }))} className="flex-1 rounded-xl border border-[#D9E1F2] bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 sm:py-3" />
                                    <button onClick={() => setProfile(p => ({ ...p, social_links_json: p.social_links_json.filter((_, j) => j !== i) }))} className="hidden p-2 text-[#CBD5E1] transition-all group-hover:scale-110 hover:text-red-500 sm:block"><Trash2 size={20} /></button>
                                </div>
                            );
                        })}
                    </div>
                </Section>

                {/* Theme Customization */}
                <Section sectionId="sec-theme" title={t.themeCustomization} icon={<Palette size={22} className="text-[#050579]" />}>
                    {/* Theme Mode */}
                    <div className="mb-10 space-y-4">
                        <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B]">{t.colorMode} (Public Profile Only)</label>
                        <div className="flex w-fit gap-1.5 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] p-1.5">
                            <button onClick={() => updateTheme('display_theme', 'light')} className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black transition-all ${profile.layout_config.display_theme !== 'dark' ? 'scale-105 bg-white text-[#050579] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}>
                                ☀️ {t.light}
                            </button>
                            <button onClick={() => updateTheme('display_theme', 'dark')} className={`flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black transition-all ${profile.layout_config.display_theme === 'dark' ? 'scale-105 bg-white text-[#050579] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'}`}>
                                🌙 {t.dark}
                            </button>
                        </div>
                    </div>

                    {/* Primary Color */}
                    <div className="mb-10 space-y-4">
                        <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B]">{t.primaryColor}</label>
                        <div className="flex flex-wrap gap-4 mb-6">
                            {['#6366F1', '#EC4899', '#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'].map(color => (
                                <button
                                    key={color}
                                    onClick={() => updateTheme('primary_color', color)}
                                    className={`h-12 w-12 rounded-[18px] border-4 shadow-lg transition-all hover:scale-110 ${profile.layout_config.primary_color === color ? 'scale-110 border-[#050579] ring-4 ring-[#EEF2FF]' : 'border-white shadow-slate-200/40'}`}
                                    style={{ backgroundColor: color }}
                                >
                                    {profile.layout_config.primary_color === color && <Check className="text-white mx-auto" size={24} />}
                                </button>
                            ))}
                        </div>
                        <div className="flex w-fit items-center gap-4 rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-4">
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
                                className="w-32 rounded-lg border border-[#D9E1F2] bg-white px-4 py-2 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                            />
                        </div>
                    </div>

                    {/* Font */}
                    <div className="space-y-4">
                        <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.2em] text-[#64748B]">{t.font}</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {['Inter', 'Kanit', 'Sarabun', 'Roboto', 'Playfair Display'].map(font => (
                                <button
                                    key={font}
                                    onClick={() => updateTheme('font_family', font)}
                                    className={`rounded-2xl border-2 px-5 py-4 text-sm font-bold transition-all ${profile.layout_config.font_family === font ? 'scale-105 border-[#F6D5BF] bg-[#FFF7F1] text-[#C2410C] shadow-inner' : 'border-[#E7ECF7] bg-[#F8FAFF] text-[#64748B] hover:border-[#D9E1F2] hover:bg-white'}`}
                                    style={{ fontFamily: font }}
                                >
                                    {font}
                                </button>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* QR Code Section */}
                <Section title={t.qrCode} icon={<QrCode size={22} className="text-[#050579]" />}>
                    <div className="group flex flex-col items-center gap-10 rounded-[40px] border border-[#E7ECF7] bg-[#F8FAFF] p-8 md:flex-row">
                        <div className="rounded-[32px] bg-white p-4 shadow-[0_22px_50px_-32px_rgba(15,23,42,0.22)] transition-transform duration-500 group-hover:rotate-3">
                             <QrCodeImage url={`${process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud'}/${profile.url_prefix || 'p'}/${uid}`} size={160} />
                        </div>
                        <div className="space-y-6 flex-1 text-center md:text-left">
                            <h4 className="text-2xl font-black tracking-tight text-[#050579]">{t.qrCodeDescription}</h4>
                            <div className="break-all rounded-2xl border border-[#D9E1F2] bg-white p-4 font-mono text-[11px] text-[#050579]">
                                {`${process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud'}/${profile.url_prefix || 'p'}/${uid}`}
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <button onClick={() => {
                                    navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_SITE_URL || 'https://nexsolution.cloud'}/${profile.url_prefix || 'p'}/${uid}`);
                                    alert('คัดลอกลิงก์แล้ว!');
                                }} className="rounded-xl bg-[#F97316] px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#EA580C] active:scale-95">Copy Link</button>
                                <p className="flex items-center gap-2 text-[10px] font-bold text-[#64748B]">💡 {t.qrCodeHint}</p>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Account Settings Moved to /manage/account */}
                    </div>
                </div>
            </main>
            
            <footer className="py-20 text-center text-[10px] font-black uppercase tracking-[0.3em] text-[#94A3B8]">
                NEX Solution © 2024 • THE PREMIUM DIGITAL EXPERIENCE
            </footer>
        </div>
    );
}

// Section component
function Section({ sectionId, title, icon, children, onAdd, canAdd = true }: { sectionId?: string; title: string; icon: React.ReactNode; children: React.ReactNode; onAdd?: () => void; canAdd?: boolean }) {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <section id={sectionId} className="scroll-mt-36 rounded-[32px] border border-[#D9E1F2] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.16)] md:p-8">
            <div className="flex flex-wrap justify-between items-center gap-3 mb-5 md:mb-6">
                <button
                    type="button"
                    onClick={() => setCollapsed((prev) => !prev)}
                    className="flex items-center gap-3 text-left"
                >
                    <h2 className="flex items-center gap-3 text-xl font-black tracking-tighter text-[#050579] md:text-2xl">{icon} {title}</h2>
                    {collapsed ? <ChevronDown size={18} className="text-[#94A3B8]" /> : <ChevronUp size={18} className="text-[#94A3B8]" />}
                </button>
                <div className="flex items-center gap-2">
                    {onAdd && canAdd && !collapsed && (
                        <button onClick={onAdd} className="flex items-center gap-2 rounded-xl bg-[#F97316] px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#EA580C] active:scale-95">
                            <Plus size={16} /> {UI_TEXT['th'].add}
                        </button>
                    )}
                </div>
            </div>
            {!collapsed && children}
        </section>
    );
}

// I18n input component
function I18nInput({ item, languages, onChange, onRemove }: { item: I18nField; languages: typeof LANGUAGES; onChange: (v: string) => void; onRemove?: () => void }) {
    const lang = languages.find(l => l.code === item.lang);
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 group">
            <div className="flex items-center justify-between sm:justify-start">
                <div className="w-20 shrink-0 items-center gap-2 text-xs font-black uppercase tracking-widest text-[#64748B] sm:w-28">
                    <span className="text-lg">{lang?.flag}</span> {lang?.code}
                </div>
                {onRemove && <button onClick={onRemove} className="p-2 text-[#94A3B8] hover:text-red-500 sm:hidden"><Trash2 size={18} /></button>}
            </div>
            <input type="text" value={item.value} onChange={e => onChange(e.target.value)} className="flex-1 rounded-xl border border-[#D9E1F2] bg-[#F8FAFF] px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 sm:px-5 sm:py-3.5" />
            {onRemove && <button onClick={onRemove} className="hidden p-2 text-[#CBD5E1] transition-all group-hover:scale-110 hover:text-red-500 sm:block"><Trash2 size={20} /></button>}
        </div>
    );
}

// Contact input component
function ContactInput({ item, placeholder, onLabelChange, onValueChange, onRemove }: { item: ContactField; placeholder: string; onLabelChange: (v: string) => void; onValueChange: (v: string) => void; onRemove?: () => void }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 group">
            <div className="flex items-center gap-2">
                <input type="text" placeholder="หัวข้อ" value={item.label} onChange={e => onLabelChange(e.target.value)} className="w-24 rounded-xl border border-[#D9E1F2] bg-[#F8FAFF] px-3 py-3 text-xs font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 sm:w-28 sm:px-4 sm:py-3.5" />
                {onRemove && <button onClick={onRemove} className="p-2 text-[#94A3B8] hover:text-red-500 sm:hidden"><Trash2 size={18} /></button>}
            </div>
            <input type="text" placeholder={placeholder} value={item.value} onChange={e => onValueChange(e.target.value)} className="flex-1 rounded-xl border border-[#D9E1F2] bg-[#F8FAFF] px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-[#F97316]/20 sm:px-5 sm:py-3.5" />
            {onRemove && <button onClick={onRemove} className="hidden p-2 text-[#CBD5E1] transition-all group-hover:scale-110 hover:text-red-500 sm:block"><Trash2 size={20} /></button>}
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
