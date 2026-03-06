"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  LogOut, Globe, BookOpen, CreditCard, ArrowRight,
  Users, BarChart3, ShieldCheck, Mail,
  Smartphone, UserCircle, QrCode, Layout, Video, Image as ImageIcon, Loader2, Lock, Gift,
  CheckCircle, XCircle, Crown, Zap, Star, Copy, ExternalLink, Check, Eye, Share2
} from 'lucide-react';
import { QrCodeImage } from '@/components/QrCode';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

interface FeatureConfig {
  catalog: boolean;
  leads: boolean;
  namecard: boolean;
  'landing-pages': boolean;
  analytics: boolean;
  profile: boolean;
  referrals: boolean;
}

interface UserData {
  id: number;
  email: string;
  role: string;
  subscription_tier: string;
  max_cards: number;
  expiration_date: string;
  uid: string;
  url_prefix: string;
  referral_code?: string;
  feature_config?: FeatureConfig;
}

// Map FEATURE_LIST IDs to feature_config keys
const FEATURE_CONFIG_MAP: Record<string, keyof FeatureConfig> = {
  'landing': 'profile',
  'leads': 'leads',
  'catalog': 'catalog',
  'namecard': 'namecard',
  'landing-pages': 'landing-pages',
  'analytics': 'analytics',
  'referrals': 'referrals',
};

const FEATURE_LIST = [
  {
    id: 'landing',
    title: 'นามบัตรดิจิทัล',
    description: 'จัดการ Profile นามบัตรดิจิทัล แก้ไขข้อมูลแบบ Real-time เพิ่มลิงก์โซเชียล และธีมส่วนตัว',
    icon: Smartphone,
    href: '/manage/profile',
    gradient: 'from-blue-500 to-indigo-600',
    tags: ['Real-time', 'ธีม', 'vCard']
  },
  {
    id: 'catalog',
    title: 'แคตตาล็อกสินค้า',
    description: 'สร้างแคตตาล็อกสินค้าออนไลน์ และเลือกรูปแบบการแสดงผลแบบพรีเมียม เพื่อส่งต่อให้ลูกค้า',
    icon: BookOpen,
    href: '/manage',
    gradient: 'from-orange-500 to-rose-600',
    tags: ['PDF Book', 'แคตตาล็อก']
  },
  {
    id: 'landing-pages',
    title: 'หน้าเซลล์เพจ (Landing Pages)',
    description: 'สร้างหน้าแคมเปญการตลาดแบบครบวงจร รองรับระบบลากวาง (Drag & Drop) และฟอร์มโต้ตอบ',
    icon: Layout,
    href: '/manage/landing-pages',
    gradient: 'from-fuchsia-600 to-rose-500',
    tags: ['แคมเปญ', 'ลากวาง']
  },
  {
    id: 'leads',
    title: 'ระบบรายชื่อลูกค้า (Leads)',
    description: 'ดูรายชื่อลูกค้าที่สนใจติดต่อกลับจากหน้าโปรไฟล์ของคุณ พร้อมข้อมูลเบอร์โทร สังกัด และอาชีพ',
    icon: Users,
    href: '/manage/leads',
    gradient: 'from-emerald-500 to-teal-600',
    tags: ['ข้อมูลลูกค้า', 'ใหม่']
  },
  {
    id: 'analytics',
    title: 'สถิติและการวิเคราะห์',
    description: 'วิเคราะห์ยอดผู้เข้าชมโปรไฟล์ สถิติการแชร์ และพฤติกรรมการคลิกของลูกค้าแบบละเอียด',
    icon: BarChart3,
    href: '/manage/dashboard',
    gradient: 'from-amber-500 to-yellow-600',
    tags: ['ข้อมูลเชิงลึก', 'ยอดชม']
  },
  {
    id: 'namecard',
    title: 'ดีไซน์นามบัตร',
    description: 'ออกแบบนามบัตรกระดาษจำลอง ใส่ QR Code และโลโก้ ดาวน์โหลดเป็นไฟล์ภาพสำหรับสั่งพิมพ์',
    icon: CreditCard,
    href: '/manage/namecard',
    gradient: 'from-purple-500 to-pink-600',
    tags: ['ไฟล์ภาพ PNG', 'เลย์เอาท์']
  },
  {
    id: 'qr-custom',
    title: 'สร้าง QR แบบกำหนดเอง',
    description: 'ทดลองเลือกสีพื้นหลัง/ลาย QR และวางโลโก้ตรงกลาง เพื่อใช้กับเพจและฟอร์มของคุณ',
    icon: QrCode,
    href: '/manage/qr',
    gradient: 'from-sky-500 to-cyan-500',
    tags: ['Custom QR', 'โลโก้กลาง']
  },
  {
    id: 'create-lite',
    title: 'NEX Create Lite',
    description: 'เลือกเทมเพลตงานกราฟิกสำหรับโพสต์ขายสินค้า โปรโมชัน และกิจกรรม พร้อมใช้งานทันที',
    icon: ImageIcon,
    href: '/manage/create-lite',
    gradient: 'from-violet-500 to-indigo-600',
    tags: ['Templates', 'Creative']
  },
  {
    id: 'referrals',
    title: 'ระบบแนะนำสมาชิก',
    description: 'แชร์ลิงก์แนะนำเพื่อนและรับค่าคอมมิชชั่น 10% ต่อเนื่องสูงสุด 10 ชั้น',
    icon: Gift,
    href: '/manage/referrals',
    gradient: 'from-pink-500 to-rose-600',
    tags: ['คอมมิชชั่น', 'แนะนำเพื่อน']
  },
];

export default function ControlCenterPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [leadCount, setLeadCount] = useState(0);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const token = Cookies.get('token');

  // Generate profile URL
  const getProfileUrl = () => {
    if (!user?.url_prefix || !user?.uid) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nexsolution.cloud';
    return `${baseUrl}/${user.url_prefix}/${user.uid}`;
  };

  const handleCopyUrl = async () => {
    const url = getProfileUrl();
    if (url) {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Generate referral share URL
  const getReferralShareUrl = () => {
    if (!user?.referral_code) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nexsolution.cloud';
    // Register page is served under /app basePath in this deployment
    return `${baseUrl}/app/register?ref=${user.referral_code}`;
  };

  const handleCopyReferral = async () => {
    const url = getReferralShareUrl();
    if (url) {
      await navigator.clipboard.writeText(url);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
    }
  };

  const handleOpenReferralLink = () => {
    const url = getReferralShareUrl();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleOpenProfile = () => {
    const url = getProfileUrl();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Count enabled/locked features
  const getFeatureCounts = () => {
    if (!user?.feature_config) return { enabled: 7, locked: 0 };
    const config = user.feature_config;
    let enabled = 0;
    let locked = 0;
    Object.values(FEATURE_CONFIG_MAP).forEach(key => {
      if (config[key] !== false) enabled++;
      else locked++;
    });
    return { enabled, locked };
  };

  const handleUpgradeRequest = async () => {
    setUpgradeLoading(true);
    // Simulate API call - in real system this would initiate payment
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert('ระบบจะติดต่อกลับเพื่อดำเนินการอัพเกรดครับ กรุณารอสักครู่');
    setUpgradeLoading(false);
    setShowUpgradeModal(false);
  };

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    // Fetch user profile
    fetch('/api/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Fetch lead count
    fetch('/api/leads/unread-count', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (typeof data.count === 'number') {
          setLeadCount(data.count);
        }
      })
      .catch(err => console.error('Failed to fetch leads count:', err));

  }, [token, router]);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('uid');
    router.push('/');
  };

  if (!token) return null;

  return (
    <div
      className="min-h-screen bg-background text-foreground transition-colors duration-500 selection:bg-primary/30"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Sarabun', sans-serif" }}
    >
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Sarabun:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Background Glow */}
      <div className="fixed top-[-120px] left-[8%] w-[420px] h-[420px] bg-primary/12 rounded-full blur-[120px] -z-10 opacity-45" />
      <div className="fixed bottom-[-160px] right-[6%] w-[460px] h-[460px] bg-secondary/12 rounded-full blur-[130px] -z-10 opacity-40" />

      {/* Navbar */}
      <nav className="border-b border-foreground/10 bg-background/75 backdrop-blur-2xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/app/nex_logo_nobg.png"
              alt="NEX Solution"
              style={{ height: '52px', width: 'auto', display: 'block' }}
            />
          </Link>
          
          <div className="flex items-center gap-4">
             {user?.role === 'super_admin' && (
               <Link href="/admin/dashboard" className="text-xs font-bold text-foreground/40 hover:text-foreground flex items-center gap-2 transition-colors uppercase tracking-widest hidden md:flex">
                 <ShieldCheck size={16} /> Admin Panel
               </Link>
             )}
             <div className="h-6 w-px bg-foreground/10 mx-2 hidden md:block" />
             <ThemeToggle />
             <button onClick={handleLogout} className="w-10 h-10 rounded-xl bg-foreground/5 hover:bg-red-500/10 flex items-center justify-center transition-all group">
               <LogOut size={18} className="text-foreground/40 group-hover:text-red-500 transition-colors" />
             </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        
        {/* User Summary Header */}
        <div className="mb-12 rounded-[28px] border border-foreground/10 bg-card-bg/70 p-6 md:p-7 shadow-xl">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  user?.subscription_tier === 'premium'
                    ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    : 'bg-primary/10 text-primary border border-primary/20'
                }`}>
                  {user?.subscription_tier || 'Free'} Plan
                </span>
                <div className="w-1.5 h-1.5 rounded-full bg-foreground/10" />
                <span className="text-foreground/45 text-sm font-medium">{user?.email}</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black tracking-tight">Control Center</h1>
                <p className="text-sm text-foreground/55 mt-1">จัดการเครื่องมือขายดิจิทัลของคุณจากหน้าควบคุมเดียว</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
              <button
                onClick={handleOpenProfile}
                disabled={!user?.uid || !user?.url_prefix}
                className="h-fit self-start bg-foreground/5 border border-foreground/10 text-foreground/70 px-4 py-2.5 rounded-xl flex items-center gap-3 min-w-[170px] min-h-[60px] hover:bg-foreground/10 active:bg-primary/10 active:border-primary/30 active:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center">
                  <Eye size={20} />
                </div>
                <div className="text-left">
                  <div className="text-[9px] uppercase font-black tracking-widest opacity-70">โปรไฟล์</div>
                  <div className="text-sm font-black leading-tight">โชว์นามบัตร</div>
                </div>
              </button>
              <div className="h-fit self-start bg-foreground/5 border border-foreground/10 px-4 py-2.5 rounded-xl flex items-center gap-3 min-w-[170px] hover:border-primary/30 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Smartphone size={20} className="text-primary" />
                </div>
                <div>
                  <div className="text-[9px] text-foreground/30 uppercase font-black tracking-widest">บัตรของฉัน</div>
                  <div className="text-xl font-black tabular-nums leading-tight">1 / {user?.max_cards || 1}</div>
                </div>
              </div>
              <div className="h-fit self-start bg-foreground/5 border border-foreground/10 px-4 py-2.5 rounded-xl flex items-center gap-3 min-w-[170px] hover:border-secondary/30 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Users size={20} className="text-secondary" />
                </div>
                <div>
                  <div className="text-[9px] text-foreground/30 uppercase font-black tracking-widest">รายชื่อลูกค้า</div>
                  <div className="text-xl font-black tabular-nums leading-tight">{leadCount > 0 ? leadCount : '--'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {FEATURE_LIST.map((feature) => {
            // Check if feature is enabled (default to true for backward compatibility)
            const configKey = FEATURE_CONFIG_MAP[feature.id];
            const isEnabled = !user?.feature_config || user.feature_config[configKey] !== false;

            if (!isEnabled) {
              // Locked feature card
              return (
                <div
                  key={feature.id}
                  className="group relative bg-card-bg border border-foreground/5 p-6 rounded-[28px] overflow-hidden shadow-xl"
                >
                  {/* Lock Overlay */}
                  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="text-center px-6">
                      <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
                        <Lock size={28} className="text-amber-500" />
                      </div>
                      <p className="text-foreground/60 text-sm font-bold mb-1">ฟีเจอร์นี้ถูกล็อค</p>
                      <p className="text-foreground/40 text-xs mb-4">อัพเกรดเป็น Premium หรือติดต่อผู้ดูแลระบบ</p>
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-amber-500/20"
                      >
                        <Crown size={14} className="inline mr-2 -mt-0.5" />
                        ปลดล็อคเลย
                      </button>
                    </div>
                  </div>

                  {/* Feature Icon */}
                  <div className="flex items-start gap-4">
                    <div className={`shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-2xl
                                      bg-gradient-to-br ${feature.gradient} shadow-xl grayscale opacity-50`}>
                      <feature.icon size={24} className="text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex gap-2 mb-2">
                        {feature.tags.map(tag => (
                          <span key={tag} className="px-2.5 py-1 rounded-lg bg-foreground/5 text-[10px] text-foreground/40 font-black uppercase tracking-widest">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-2xl font-black mb-2 tracking-tight text-foreground/30">
                        {feature.title}
                      </h2>
                      <p className="text-foreground/25 text-sm leading-relaxed line-clamp-2">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            }

            // Special card for "แก้ไขนามบัตรดิจิทัล" with QR code and quick actions
            if (feature.id === 'landing') {
              const profileUrl = getProfileUrl();
              return (
                <div
                  key={feature.id}
                  onClick={() => router.push(feature.href)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(feature.href);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="group relative bg-card-bg border border-foreground/5 p-6 rounded-[28px] overflow-hidden shadow-2xl glass-card hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-primary/5 active:scale-[0.99] cursor-pointer"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-5">
                    <div className="min-w-0">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-2xl
                                          bg-gradient-to-br ${feature.gradient} shadow-xl`}>
                          <feature.icon size={24} className="text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex gap-2 mb-2">
                            {feature.tags.map(tag => (
                              <span key={tag} className="px-2.5 py-1 rounded-lg bg-foreground/5 text-[10px] text-foreground/40 font-black uppercase tracking-widest">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <h2 className="text-2xl font-black mb-2 tracking-tight group-hover:text-primary transition-colors">
                            {feature.title}
                          </h2>
                          <p className="text-foreground/55 text-sm leading-relaxed line-clamp-2 group-hover:text-foreground/70 transition-colors">
                            {feature.description}
                          </p>
                        </div>
                      </div>

                      {/* Profile URL */}
                      <div className="bg-foreground/5 rounded-xl p-3 mb-3">
                        <p className="text-[10px] text-foreground/40 uppercase font-bold tracking-widest mb-1">ลิงก์โปรไฟล์ของคุณ</p>
                        <p className="text-xs text-foreground/70 truncate font-mono">{profileUrl || 'กำลังโหลด...'}</p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl();
                          }}
                          className="flex items-center gap-2 px-3 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-xl text-xs font-bold transition-colors"
                        >
                          {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          {copied ? 'คัดลอกแล้ว!' : 'คัดลอก URL'}
                        </button>
                        <a
                          href={profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 px-3 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-xl text-xs font-bold transition-colors"
                        >
                          <ExternalLink size={14} />
                          ดูหน้าโปรไฟล์
                        </a>
                        <Link
                          href={feature.href}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 px-3 py-2 bg-primary text-white hover:bg-primary/90 rounded-xl text-xs font-bold transition-colors"
                        >
                          <ArrowRight size={14} />
                          แก้ไขโปรไฟล์
                        </Link>
                      </div>
                    </div>

                    {/* QR Code Section */}
                    {profileUrl && (
                      <div className="sm:justify-self-end">
                        <QrCodeImage url={profileUrl} size={112} />
                      </div>
                    )}
                  </div>

                  {/* Decorative accent */}
                  <div className={`absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-br ${feature.gradient} opacity-10 group-hover:opacity-20 blur-[70px] transition-opacity`} />
                </div>
              );
            }

            // Special card for referrals with QR & share, similar to digital business card
            if (feature.id === 'referrals') {
              const referralUrl = getReferralShareUrl();
              const hasCode = Boolean(user?.referral_code);
              return (
                <div
                  key={feature.id}
                  onClick={() => router.push(feature.href)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      router.push(feature.href);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className="group relative bg-card-bg border border-foreground/5 p-6 rounded-[28px] overflow-hidden shadow-2xl glass-card hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 hover:shadow-primary/5 active:scale-[0.99] cursor-pointer"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_120px] gap-5">
                    <div className="min-w-0">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-2xl
                                          bg-gradient-to-br ${feature.gradient} shadow-xl`}>
                          <feature.icon size={24} className="text-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex gap-2 mb-2">
                            {feature.tags.map(tag => (
                              <span key={tag} className="px-2.5 py-1 rounded-lg bg-foreground/5 text-[10px] text-foreground/40 font-black uppercase tracking-widest">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <h2 className="text-2xl font-black mb-2 tracking-tight group-hover:text-primary transition-colors">
                            {feature.title}
                          </h2>
                          <p className="text-foreground/55 text-sm leading-relaxed line-clamp-2 group-hover:text-foreground/70 transition-colors">
                            {feature.description}
                          </p>
                        </div>
                      </div>

                      {/* Referral code & link */}
                      <div className="space-y-3">
                        <div className="bg-foreground/5 rounded-xl p-3">
                          <p className="text-[10px] text-foreground/40 uppercase font-bold tracking-widest mb-1">
                            รหัสแนะนำของคุณ
                          </p>
                          <p className="text-base font-mono text-foreground/80 tracking-widest">
                            {user?.referral_code || 'ยังไม่มีรหัสแนะนำ — กดจัดการเพื่อสร้าง'}
                          </p>
                        </div>
                        <div className="bg-foreground/5 rounded-xl p-3">
                          <p className="text-[10px] text-foreground/40 uppercase font-bold tracking-widest mb-1">
                            ลิงก์สำหรับแชร์สมัครสมาชิก
                          </p>
                          <p className="text-xs text-foreground/70 truncate font-mono">
                            {referralUrl || 'กำลังโหลด...'}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyReferral();
                          }}
                          disabled={!hasCode}
                          className="flex items-center gap-2 px-3 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {copiedReferral ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                          {copiedReferral ? 'คัดลอกลิงก์แล้ว!' : 'คัดลอกลิงก์'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenReferralLink();
                          }}
                          disabled={!hasCode}
                          className="flex items-center gap-2 px-3 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ExternalLink size={14} />
                          เปิดหน้าลงทะเบียน
                        </button>
                        <Link
                          href={feature.href}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 px-3 py-2 bg-primary text-white hover:bg-primary/90 rounded-xl text-xs font-bold transition-colors"
                        >
                          <ArrowRight size={14} />
                          จัดการระบบแนะนำ
                        </Link>
                      </div>
                    </div>

                    {/* QR Code Section */}
                    {referralUrl && (
                      <div className="sm:justify-self-end flex flex-col items-center gap-2">
                        <QrCodeImage url={referralUrl} size={112} />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyReferral();
                          }}
                          disabled={!hasCode}
                          className="flex items-center gap-1 px-2 py-1.5 bg-foreground/5 hover:bg-foreground/10 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Share2 size={12} />
                          แชร์ QR
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Decorative accent */}
                  <div className={`absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-br ${feature.gradient} opacity-10 group-hover:opacity-20 blur-[70px] transition-opacity`} />
                </div>
              );
            }

            // Enabled feature card (other features)
            return (
              <Link
                key={feature.id}
                href={feature.href}
                className="group relative bg-card-bg border border-foreground/5 p-6 rounded-[28px] overflow-hidden
                           hover:border-primary/30 transition-all duration-500 hover:-translate-y-1 shadow-2xl hover:shadow-primary/5 active:scale-[0.99] glass-card"
              >
                <div className="flex items-start gap-4">
                  {/* Feature Icon */}
                  <div className={`shrink-0 inline-flex items-center justify-center w-14 h-14 rounded-2xl
                                    bg-gradient-to-br ${feature.gradient} shadow-xl group-hover:scale-105 transition-transform duration-300`}>
                    <feature.icon size={24} className="text-white" />
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Tags */}
                    <div className="flex gap-2 mb-2">
                      {feature.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 rounded-lg bg-foreground/5 text-[10px] text-foreground/40 font-black uppercase tracking-widest">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h2 className="text-2xl font-black mb-2 group-hover:text-primary transition-colors tracking-tight">
                      {feature.title}
                    </h2>
                    <p className="text-foreground/55 text-sm leading-relaxed line-clamp-2 mb-3 group-hover:text-foreground/70 transition-colors">
                      {feature.description}
                    </p>
                    <div className="flex items-center gap-2 text-foreground/70 text-xs font-black uppercase tracking-widest">
                      เริ่มเข้าใช้งาน <ArrowRight size={16} className="text-primary" />
                    </div>
                  </div>
                </div>
                {/* Decorative accent */}
                <div className={`absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-[70px] transition-opacity duration-500`} />
              </Link>
            );
          })}

          {/* Upgrade Card */}
          <div className="group relative bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white p-6 rounded-[28px] overflow-hidden flex flex-col justify-center text-center shadow-2xl">
             {/* Decorative elements */}
             <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
             <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />

             <div className="relative z-10">
               <div className="mb-4 flex justify-center">
                 <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30 group-hover:scale-105 transition-transform">
                   <Crown size={28} className="text-white" />
                 </div>
               </div>

               {/* Feature Count */}
               <div className="flex justify-center gap-5 mb-4">
                 <div className="text-center">
                   <div className="text-2xl font-black">{getFeatureCounts().enabled}</div>
                   <div className="text-[10px] uppercase tracking-widest text-white/70">ใช้งานได้</div>
                 </div>
                 <div className="w-px bg-white/20" />
                 <div className="text-center">
                   <div className="text-2xl font-black">{getFeatureCounts().locked}</div>
                   <div className="text-[10px] uppercase tracking-widest text-white/70">ถูกล็อค</div>
                 </div>
               </div>

               <h3 className="text-xl font-black mb-2 uppercase tracking-tight">
                 {user?.subscription_tier === 'premium' ? 'Premium Member' : 'อัพเกรดเป็น Premium'}
               </h3>
               <p className="text-white/85 text-sm mb-5 leading-relaxed">
                 {user?.subscription_tier === 'premium'
                   ? 'คุณเป็นสมาชิก Premium แล้ว! เข้าถึงทุกฟีเจอร์ได้เต็มที่'
                   : 'ปลดล็อคทุกฟีเจอร์ ใช้งานแคตตาล็อกไม่จำกัด ไม่มีลายน้ำ'}
               </p>

               {user?.subscription_tier !== 'premium' && (
                 <button
                   onClick={() => setShowUpgradeModal(true)}
                   className="w-full py-3.5 bg-white text-amber-600 rounded-xl text-sm font-black uppercase tracking-wider hover:scale-[1.01] active:scale-[0.99] transition-all shadow-lg flex items-center justify-center gap-2"
                 >
                   <Zap size={16} />
                   Upgrade Now
                 </button>
               )}

               {user?.subscription_tier === 'premium' && (
                 <div className="flex items-center justify-center gap-2 text-white/90">
                   <CheckCircle size={20} />
                   <span className="font-bold">Active Premium</span>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-5 px-2">
           <div className="p-6 rounded-[28px] bg-foreground/5 border border-foreground/10 hover:border-primary/20 transition-colors group">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2.5 tracking-tight">
                <Smartphone size={20} className="text-primary" /> Quick Share
              </h3>
              <div className="flex flex-col lg:flex-row gap-4 mt-2">
                  <div className="flex-grow space-y-3">
                    <div className="text-xs text-foreground/30 font-black uppercase tracking-widest ml-1">โปรไฟล์สาธารณะของคุณ</div>
                    <div className="p-3.5 rounded-2xl bg-foreground/5 border border-foreground/5 font-mono text-xs text-primary flex items-center justify-between group-hover:bg-foreground/10 transition-colors">
                       <span className="truncate mr-4">{user ? `nexsolution.cloud/app/${user.url_prefix || 'p'}/${user.uid}` : 'กำลังโหลด...'}</span>
                       <Link href={user ? `/${user.url_prefix || 'p'}/${user.uid}` : '#'} className="text-[10px] font-black uppercase tracking-widest bg-foreground text-background whitespace-nowrap px-4 py-2 rounded-xl hover:opacity-90 transition-all active:scale-95">
                         Go Public
                       </Link>
                    </div>
                  </div>
                  <div className="w-24 h-24 bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform shrink-0 self-center">
                     <QrCode size={72} className="text-black" />
                  </div>
              </div>
           </div>

           <div className="p-6 rounded-[28px] bg-foreground/5 border border-foreground/10 hover:border-secondary/20 transition-colors group">
              <h3 className="text-lg font-black mb-4 flex items-center gap-2.5 tracking-tight">
                <BarChart3 size={20} className="text-secondary" /> Activity Snap
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-[20px] bg-foreground/5 border border-foreground/5 text-center group-hover:bg-foreground/10 transition-colors">
                    <div className="text-2xl font-black text-foreground tabular-nums">0</div>
                    <div className="text-[10px] text-foreground/30 uppercase font-black tracking-widest mt-2">Today Views</div>
                 </div>
                 <div className="p-4 rounded-[20px] bg-foreground/5 border border-foreground/5 text-center group-hover:bg-foreground/10 transition-colors">
                    <div className="text-2xl font-black text-foreground tabular-nums">{leadCount > 0 ? leadCount : '--'}</div>
                    <div className="text-[10px] text-foreground/30 uppercase font-black tracking-widest mt-2">Leads Recieved</div>
                 </div>
              </div>
              <Link href="/manage/dashboard" className="block w-full text-center mt-6 text-xs font-black uppercase tracking-widest text-foreground/30 hover:text-primary transition-all underline underline-offset-8 decoration-foreground/10 hover:decoration-primary/30">
                View Full Analytics Report
              </Link>
           </div>
        </div>

        {/* Feature Status Section */}
        <div className="mt-16 p-8 md:p-10 rounded-[32px] bg-card-bg/70 border border-foreground/10 shadow-xl">
          <h3 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tight">
            <Star size={24} className="text-amber-500" /> สถานะฟีเจอร์ของคุณ
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {FEATURE_LIST.map((feature) => {
              const configKey = FEATURE_CONFIG_MAP[feature.id];
              const isEnabled = !user?.feature_config || user.feature_config[configKey] !== false;
              return (
                <div
                  key={feature.id}
                  className={`p-4 rounded-2xl border text-center transition-all ${
                    isEnabled
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-foreground/5 border-foreground/10'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                    isEnabled ? 'bg-green-500/20' : 'bg-foreground/10'
                  }`}>
                    {isEnabled ? (
                      <CheckCircle size={20} className="text-green-500" />
                    ) : (
                      <Lock size={18} className="text-foreground/40" />
                    )}
                  </div>
                  <p className={`text-xs font-bold truncate ${isEnabled ? 'text-foreground' : 'text-foreground/40'}`}>
                    {feature.title.split(' ')[0]}
                  </p>
                </div>
              );
            })}
          </div>
          {getFeatureCounts().locked > 0 && (
            <div className="mt-8 text-center">
              <p className="text-foreground/50 text-sm mb-4">
                คุณมี {getFeatureCounts().locked} ฟีเจอร์ที่ยังถูกล็อค
              </p>
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-transform shadow-lg shadow-amber-500/20"
              >
                <Crown size={16} className="inline mr-2 -mt-0.5" />
                ปลดล็อคทั้งหมด
              </button>
            </div>
          )}
        </div>

      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background border border-foreground/10 rounded-[32px] p-8 max-w-lg w-full shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-amber-500/30">
                <Crown size={40} className="text-white" />
              </div>
              <h3 className="text-2xl font-black mb-2">อัพเกรดเป็น Premium</h3>
              <p className="text-foreground/50">ปลดล็อคทุกฟีเจอร์และใช้งานได้เต็มที่</p>
            </div>

            {/* Features List */}
            <div className="space-y-3 mb-8">
              {[
                'ปลดล็อคทุกฟีเจอร์ทันที',
                'สร้างแคตตาล็อกได้ไม่จำกัด',
                'ไม่มีลายน้ำบนหน้าโปรไฟล์',
                'สถิติและการวิเคราะห์เชิงลึก',
                'ระบบ Landing Pages แบบลากวาง',
                'ระบบแนะนำสมาชิกและคอมมิชชั่น',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-foreground/5">
                  <CheckCircle size={18} className="text-green-500 shrink-0" />
                  <span className="text-sm font-medium">{item}</span>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="text-center mb-8 p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20">
              <div className="text-[10px] uppercase tracking-widest text-foreground/50 mb-2">ราคาพิเศษ</div>
              <div className="text-4xl font-black text-amber-500">฿299<span className="text-lg text-foreground/40">/เดือน</span></div>
              <div className="text-xs text-foreground/50 mt-2">หรือ ฿2,499/ปี (ประหยัด 30%)</div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 py-4 bg-foreground/10 rounded-2xl font-bold hover:bg-foreground/20 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleUpgradeRequest}
                disabled={upgradeLoading}
                className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {upgradeLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <Zap size={20} />
                    อัพเกรดเลย
                  </>
                )}
              </button>
            </div>

            {/* Contact Admin Option */}
            <div className="mt-6 text-center">
              <p className="text-foreground/40 text-xs">
                หรือติดต่อผู้ดูแลระบบเพื่อขอปลดล็อคฟีเจอร์เฉพาะ
              </p>
              <a href="mailto:support@dpattown.com" className="text-primary text-sm font-medium hover:underline">
                support@dpattown.com
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
