"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Cookies from 'js-cookie';
import {
  LogOut, BookOpen, CreditCard, ArrowRight,
  Users, BarChart3, ShieldCheck,
  Smartphone, UserCircle, QrCode, Layout, Image as ImageIcon, Loader2, Lock, Gift,
  CheckCircle, XCircle, Crown, Zap, Star, Copy, ExternalLink, Check, Eye, Share2, Settings
} from 'lucide-react';
import { QrCodeImage } from '@/components/QrCode';
import Link from 'next/link';

interface FeatureConfig {
  catalog: boolean;
  leads: boolean;
  namecard: boolean;
  'landing-pages': boolean;
  analytics: boolean;
  profile: boolean;
  referrals: boolean;
}

type FeatureTone = 'navy' | 'orange' | 'green' | 'blue';

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
    tone: 'navy' as FeatureTone,
    tags: ['Real-time', 'ธีม', 'vCard']
  },
  {
    id: 'catalog',
    title: 'แคตตาล็อกสินค้า',
    description: 'สร้างแคตตาล็อกสินค้าออนไลน์ และเลือกรูปแบบการแสดงผลแบบพรีเมียม เพื่อส่งต่อให้ลูกค้า',
    icon: BookOpen,
    href: '/manage',
    tone: 'orange' as FeatureTone,
    tags: ['PDF Book', 'แคตตาล็อก']
  },
  {
    id: 'landing-pages',
    title: 'หน้าเซลล์เพจ (Landing Pages)',
    description: 'สร้างหน้าแคมเปญการตลาดแบบครบวงจร รองรับระบบลากวาง (Drag & Drop) และฟอร์มโต้ตอบ',
    icon: Layout,
    href: '/manage/landing-pages',
    tone: 'navy' as FeatureTone,
    tags: ['แคมเปญ', 'ลากวาง']
  },
  {
    id: 'leads',
    title: 'ระบบรายชื่อลูกค้า (Leads)',
    description: 'ดูรายชื่อลูกค้าที่สนใจติดต่อกลับจากหน้าโปรไฟล์ของคุณ พร้อมข้อมูลเบอร์โทร สังกัด และอาชีพ',
    icon: Users,
    href: '/manage/leads',
    tone: 'green' as FeatureTone,
    tags: ['ข้อมูลลูกค้า', 'ใหม่']
  },
  {
    id: 'analytics',
    title: 'สถิติและการวิเคราะห์',
    description: 'วิเคราะห์ยอดผู้เข้าชมโปรไฟล์ สถิติการแชร์ และพฤติกรรมการคลิกของลูกค้าแบบละเอียด',
    icon: BarChart3,
    href: '/manage/dashboard',
    tone: 'blue' as FeatureTone,
    tags: ['ข้อมูลเชิงลึก', 'ยอดชม']
  },
  {
    id: 'namecard',
    title: 'ดีไซน์นามบัตร',
    description: 'ออกแบบนามบัตรกระดาษจำลอง ใส่ QR Code และโลโก้ ดาวน์โหลดเป็นไฟล์ภาพสำหรับสั่งพิมพ์',
    icon: CreditCard,
    href: '/manage/namecard',
    tone: 'navy' as FeatureTone,
    tags: ['ไฟล์ภาพ PNG', 'เลย์เอาท์']
  },
  {
    id: 'qr-custom',
    title: 'สร้าง QR แบบกำหนดเอง',
    description: 'ทดลองเลือกสีพื้นหลัง/ลาย QR และวางโลโก้ตรงกลาง เพื่อใช้กับเพจและฟอร์มของคุณ',
    icon: QrCode,
    href: '/manage/qr',
    tone: 'blue' as FeatureTone,
    tags: ['Custom QR', 'โลโก้กลาง']
  },
  {
    id: 'create-lite',
    title: 'NEX Create Lite',
    description: 'เลือกเทมเพลตงานกราฟิกสำหรับโพสต์ขายสินค้า โปรโมชัน และกิจกรรม พร้อมใช้งานทันที',
    icon: ImageIcon,
    href: '/manage/create-lite',
    tone: 'orange' as FeatureTone,
    tags: ['Templates', 'Creative']
  },
  {
    id: 'referrals',
    title: 'ระบบแนะนำสมาชิก',
    description: 'แชร์ลิงก์แนะนำเพื่อนและรับค่าคอมมิชชั่น 10% ต่อเนื่องสูงสุด 10 ชั้น',
    icon: Gift,
    href: '/manage/referrals',
    tone: 'green' as FeatureTone,
    tags: ['คอมมิชชั่น', 'แนะนำเพื่อน']
  },
];

const TONE_STYLES: Record<FeatureTone, {
  iconWrap: string;
  iconColor: string;
  softBg: string;
  border: string;
  text: string;
  glow: string;
  chip: string;
  action: string;
  hoverBorder: string;
}> = {
  navy: {
    iconWrap: 'bg-[#EEF2FF]',
    iconColor: 'text-[#050579]',
    softBg: 'bg-[#F6F8FF]',
    border: 'border-[#D9E1F2]',
    text: 'text-[#050579]',
    glow: 'bg-[radial-gradient(circle,rgba(5,5,121,0.12),transparent_68%)]',
    chip: 'border-[#E7ECF7] bg-[#F6F8FF] text-[#64748B]',
    action: 'text-[#050579]',
    hoverBorder: 'hover:border-[#C7D2E5]',
  },
  orange: {
    iconWrap: 'bg-[#FFF1E8]',
    iconColor: 'text-[#F97316]',
    softBg: 'bg-[#FFF7F1]',
    border: 'border-[#F6D5BF]',
    text: 'text-[#C2410C]',
    glow: 'bg-[radial-gradient(circle,rgba(249,115,22,0.14),transparent_68%)]',
    chip: 'border-[#FCE1D1] bg-[#FFF7F1] text-[#9A3412]',
    action: 'text-[#C2410C]',
    hoverBorder: 'hover:border-[#F0C5A7]',
  },
  green: {
    iconWrap: 'bg-[#EEFBEF]',
    iconColor: 'text-[#16A34A]',
    softBg: 'bg-[#F3FCF5]',
    border: 'border-[#CFE9D6]',
    text: 'text-[#166534]',
    glow: 'bg-[radial-gradient(circle,rgba(22,163,74,0.14),transparent_68%)]',
    chip: 'border-[#DCEFE0] bg-[#F3FCF5] text-[#166534]',
    action: 'text-[#166534]',
    hoverBorder: 'hover:border-[#B8DFC2]',
  },
  blue: {
    iconWrap: 'bg-[#EAF4FF]',
    iconColor: 'text-[#2563EB]',
    softBg: 'bg-[#F4F8FF]',
    border: 'border-[#D6E4FF]',
    text: 'text-[#1D4ED8]',
    glow: 'bg-[radial-gradient(circle,rgba(37,99,235,0.14),transparent_68%)]',
    chip: 'border-[#DDEAFF] bg-[#F4F8FF] text-[#1D4ED8]',
    action: 'text-[#1D4ED8]',
    hoverBorder: 'hover:border-[#C3D7FF]',
  },
};

// Keep section reversible while simplifying page information density.
const SHOW_FEATURE_STATUS_SECTION = false;

export default function ControlCenterPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [leadCount, setLeadCount] = useState(0);
  const [isLeadsLoading, setIsLeadsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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
    return `${baseUrl}/register?ref=${user.referral_code}`;
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
      })
      .catch(() => null)
      .finally(() => setIsUserLoading(false));

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
      .catch(err => console.error('Failed to fetch leads count:', err))
      .finally(() => setIsLeadsLoading(false));

  }, [token, router]);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('uid');
    router.push('/');
  };

  if (!token) return null;

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-[#EEF0FF] text-[#0F172A] selection:bg-[#F97316]/20"
      style={{ fontFamily: "var(--font-sans), 'Sarabun', sans-serif" }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_32%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.34),transparent_40%),linear-gradient(180deg,#f8faff_0%,#eef0ff_50%,#e8eeff_100%)]" />
        <div className="absolute left-[-7rem] top-10 h-80 w-80 rounded-full bg-sky-300/16 blur-[120px]" />
        <div className="absolute right-[-6rem] top-28 h-72 w-72 rounded-full bg-[#050579]/8 blur-[120px]" />
        <div className="absolute inset-x-0 top-0 mx-auto h-[24rem] max-w-6xl rounded-full bg-white/32 blur-[120px]" />
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/28 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-sm rounded-[28px] border border-[#D9E1F2] bg-white p-6 shadow-[0_30px_90px_-48px_rgba(15,23,42,0.3)] animate-in fade-in zoom-in-95 duration-200">
            <h3 className="mb-4 text-center text-xl font-black text-[#050579]">ยืนยันการออกจากระบบ</h3>
            <p className="mb-6 text-center text-sm text-[#475569]">คุณได้กดปุ่มย้อนกลับ ต้องการออกจากระบบหรือไม่?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] py-3 text-sm font-bold text-[#0F172A] transition-colors hover:bg-[#EEF0FF]"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleLogout}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#DC2626] py-3 text-sm font-bold text-white transition-colors hover:bg-[#B91C1C]"
              >
                <LogOut size={16} /> ออกจากระบบ
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Navbar */}
      <nav className="sticky top-0 z-50 px-4 pt-4 sm:px-6">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between rounded-[28px] border border-[#D9E1F2] bg-white/84 px-5 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.28)] backdrop-blur-2xl">
          <Link href="/" className="flex items-center gap-4">
            <div className="relative h-14 w-20 sm:h-16 sm:w-24">
              <Image
                src="/nex_logo_nobg.png"
                alt="NEX Solution"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#64748B]">NEX Solution</div>
              <div className="text-sm font-semibold text-[#050579]">Control Center</div>
            </div>
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
             {user?.role === 'super_admin' && (
               <Link href="/admin/dashboard" className="hidden items-center gap-2 rounded-full border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#475569] transition-colors hover:border-[#C7D2E5] hover:bg-white hover:text-[#050579] md:flex">
                 <ShieldCheck size={16} /> Admin Panel
               </Link>
             )}
             <button onClick={() => setShowLogoutConfirm(true)} className="group flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-3.5 transition-colors hover:border-[#F3C3C3] hover:bg-[#FEF2F2]">
               <LogOut size={18} className="text-[#64748B] transition-colors group-hover:text-[#DC2626]" />
               <span className="hidden text-sm font-bold text-[#475569] transition-colors group-hover:text-[#B91C1C] sm:inline">ออกจากระบบ</span>
             </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-6 py-8 md:py-10">
        
        {/* User Summary Header */}
        <div className="relative mb-12 overflow-hidden rounded-[36px] border border-[#D9E1F2] bg-white/92 p-6 shadow-[0_34px_100px_-54px_rgba(15,23,42,0.28)] backdrop-blur-sm md:p-8">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(5,5,121,0.06),transparent_32%)]" />
          <div className="relative flex flex-col items-start justify-between gap-8 xl:flex-row xl:items-end">
            <div className="max-w-2xl space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className={`rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                  user?.subscription_tier === 'premium'
                    ? 'border-[#F6D5BF] bg-[#FFF1E8] text-[#F97316]'
                    : 'border-[#D9E1F2] bg-[#F6F8FF] text-[#050579]'
                }`}>
                  {user?.subscription_tier || 'Free'} Plan
                </span>
                <span className="rounded-full border border-[#D9E1F2] bg-white/80 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#64748B]">
                  {getFeatureCounts().enabled} เครื่องมือพร้อมใช้งาน
                </span>
              </div>
              <div>
                <div className="mb-2 text-sm font-medium text-[#64748B]">{user?.email}</div>
                <h1 className="text-3xl font-black tracking-tight text-[#050579] md:text-4xl">Control Center</h1>
                <p className="mt-3 max-w-xl text-sm leading-7 text-[#475569] md:text-base">
                  จัดการโปรไฟล์ ลิงก์ขาย ระบบรายชื่อลูกค้า และเครื่องมือดิจิทัลทั้งหมดจากหน้าควบคุมเดียว
                </p>
              </div>
            </div>

            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3 xl:w-auto">
              <button
                onClick={handleOpenProfile}
                disabled={!user?.uid || !user?.url_prefix}
                className="flex min-h-[88px] min-w-[190px] items-center gap-3 rounded-[24px] border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-4 text-left text-[#0F172A] transition-colors hover:border-[#C7D2E5] hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#050579]">
                  <Eye size={20} />
                </div>
                <div className="text-left">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">โปรไฟล์</div>
                  <div className="text-sm font-black leading-tight text-[#050579]">ดูหน้าโปรไฟล์</div>
                </div>
              </button>
              <div className="group flex min-h-[88px] min-w-[190px] items-center gap-3 rounded-[24px] border border-[#F6D5BF] bg-[#FFF7F1] px-4 py-4 transition-colors hover:bg-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF1E8] text-[#F97316] transition-transform group-hover:scale-105">
                  <Smartphone size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">บัตรของฉัน</div>
                  <div className="text-xl font-black tabular-nums leading-tight text-[#C2410C]">1 / {user?.max_cards || 1}</div>
                  <div className="mt-1 text-xs text-[#78716C]">จำนวนบัตรที่ใช้งานได้</div>
                </div>
              </div>
              <div className="group flex min-h-[88px] min-w-[190px] items-center gap-3 rounded-[24px] border border-[#CFE9D6] bg-[#F3FCF5] px-4 py-4 transition-colors hover:bg-white">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEFBEF] text-[#16A34A] transition-transform group-hover:scale-105">
                  <Users size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">รายชื่อลูกค้า</div>
                  {isLeadsLoading ? (
                    <div className="mt-1 h-6 w-10 animate-pulse rounded-md bg-[#E2E8F0]" />
                  ) : (
                    <div className={`text-xl font-black tabular-nums leading-tight ${leadCount > 0 ? 'text-[#166534]' : 'text-[#94A3B8]'}`}>{leadCount > 0 ? leadCount : '--'}</div>
                  )}
                  <div className="mt-1 text-xs text-[#64748B]">รายการใหม่ที่ยังไม่ได้อ่าน</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Sections */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {FEATURE_LIST.map((feature) => {
            // Check if feature is enabled (default to true for backward compatibility)
            const configKey = FEATURE_CONFIG_MAP[feature.id];
            const isEnabled = !user?.feature_config || user.feature_config[configKey] !== false;

            if (!isEnabled) {
              // Locked feature card
              return (
                <div
                  key={feature.id}
                  className="group relative overflow-hidden rounded-[28px] border border-[#D9E1F2] bg-white p-6 shadow-[0_24px_70px_-45px_rgba(15,23,42,0.2)]"
                >
                  {/* Lock Overlay */}
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/82 backdrop-blur-sm">
                    <div className="text-center px-6">
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#F6D5BF] bg-[#FFF1E8]">
                        <Lock size={28} className="text-[#F97316]" />
                      </div>
                      <p className="mb-1 text-sm font-bold text-[#0F172A]">ฟีเจอร์นี้ถูกล็อค</p>
                      <p className="mb-4 text-xs text-[#64748B]">อัพเกรดเป็น Premium หรือติดต่อผู้ดูแลระบบ</p>
                      <button
                        onClick={() => setShowUpgradeModal(true)}
                        className="rounded-2xl bg-[#F97316] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#EA580C]"
                      >
                        <Crown size={14} className="inline mr-2 -mt-0.5" />
                        ปลดล็อคเลย
                      </button>
                    </div>
                  </div>

                  {/* Feature Icon */}
                  <div className="flex items-start gap-4">
                    <div className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl grayscale opacity-60 ${TONE_STYLES[feature.tone].iconWrap} ${TONE_STYLES[feature.tone].iconColor}`}>
                      <feature.icon size={24} />
                    </div>
                    <div className="min-w-0">
                      <div className="flex gap-2 mb-2">
                        {feature.tags.map(tag => (
                          <span key={tag} className={`rounded-xl border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${TONE_STYLES[feature.tone].chip}`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h2 className="mb-2 text-2xl font-black tracking-tight text-[#94A3B8]">
                        {feature.title}
                      </h2>
                      <p className="line-clamp-2 text-sm leading-relaxed text-[#94A3B8]">
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
                  className="group relative cursor-pointer overflow-hidden rounded-[32px] border border-[#D9E1F2] bg-white p-7 shadow-[0_34px_90px_-50px_rgba(15,23,42,0.24)] transition-all duration-500 hover:-translate-y-1 hover:border-[#C7D2E5] hover:shadow-[0_40px_95px_-54px_rgba(15,23,42,0.2)] active:scale-[0.99] md:col-span-2 xl:col-span-2"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(5,5,121,0.06),transparent_30%)]" />
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-[1fr_132px]">
                    <div className="relative min-w-0">
                      <div className="mb-5 flex items-start gap-4">
                        <div className={`inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-[22px] ${TONE_STYLES[feature.tone].iconWrap} ${TONE_STYLES[feature.tone].iconColor}`}>
                          <feature.icon size={28} />
                        </div>
                        <div className="min-w-0">
                          <div className="mb-3 flex flex-wrap gap-2">
                            {feature.tags.map(tag => (
                              <span key={tag} className={`rounded-xl border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${TONE_STYLES[feature.tone].chip}`}>
                                {tag}
                              </span>
                            ))}
                          </div>
                          <h2 className="mb-2 text-[2rem] font-black tracking-tight text-[#050579]">
                            {feature.title}
                          </h2>
                          <p className="max-w-2xl text-base leading-7 text-[#475569]">
                            {feature.description}
                          </p>
                        </div>
                      </div>

                      {/* Profile URL */}
                      <div className="mb-4 rounded-[22px] border border-[#E7ECF7] bg-[#F6F8FF] p-4">
                        <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">ลิงก์โปรไฟล์ของคุณ</p>
                        {isUserLoading ? (
                          <div className="h-4 w-full max-w-[24rem] animate-pulse rounded bg-[#E2E8F0]" />
                        ) : (
                          <p className="truncate font-mono text-sm text-[#475569]">{profileUrl || 'ยังไม่พบลิงก์โปรไฟล์'}</p>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl();
                          }}
                          className="flex items-center gap-2 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-3.5 py-2.5 text-xs font-bold text-[#0F172A] transition-colors hover:bg-white"
                        >
                          {copied ? <Check size={14} className="text-[#16A34A]" /> : <Copy size={14} />}
                          {copied ? 'คัดลอกแล้ว!' : 'คัดลอก URL'}
                        </button>
                        <a
                          href={profileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-3.5 py-2.5 text-xs font-bold text-[#0F172A] transition-colors hover:bg-white"
                        >
                          <ExternalLink size={14} />
                          ดูหน้าโปรไฟล์
                        </a>
                        <Link
                          href={feature.href}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 rounded-2xl bg-[#F97316] px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#EA580C]"
                        >
                          <ArrowRight size={14} />
                          แก้ไขโปรไฟล์
                        </Link>
                      </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="relative sm:justify-self-end">
                      <div className="rounded-[24px] border border-[#D9E1F2] bg-white p-3 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)]">
                        <div className="mb-2 text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#64748B]">
                          Scan Profile
                        </div>
                        {isUserLoading ? (
                          <div className="h-[120px] w-[120px] animate-pulse rounded-xl bg-[#E2E8F0]" />
                        ) : profileUrl ? (
                          <QrCodeImage url={profileUrl} size={120} />
                        ) : (
                          <div className="flex h-[120px] w-[120px] items-center justify-center rounded-xl border border-dashed border-[#D9E1F2] text-center text-[10px] font-bold text-[#94A3B8]">
                            ยังไม่มี QR
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Decorative accent */}
                  <div className={`absolute bottom-0 right-0 h-28 w-28 ${TONE_STYLES[feature.tone].glow} opacity-40 transition-opacity group-hover:opacity-60`} />
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
                  className="group relative cursor-pointer overflow-hidden rounded-[28px] border border-[#D9E1F2] bg-white p-6 shadow-[0_28px_70px_-44px_rgba(15,23,42,0.22)] transition-all duration-500 hover:-translate-y-1 hover:border-[#B8DFC2] hover:shadow-[0_34px_80px_-48px_rgba(15,23,42,0.18)] active:scale-[0.99] xl:col-span-2"
                >
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(22,163,74,0.08),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(5,5,121,0.05),transparent_30%)]" />
                  <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-[1fr_120px] sm:items-start">
                    <div className="min-w-0">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${TONE_STYLES[feature.tone].iconWrap} ${TONE_STYLES[feature.tone].iconColor}`}>
                          <feature.icon size={24} />
                        </div>
                        <div className="min-w-0">
                          <div className="flex gap-2 mb-2">
                            {feature.tags.map(tag => (
                              <span key={tag} className={`rounded-xl border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${TONE_STYLES[feature.tone].chip}`}>
                                {tag}
                              </span>
                            ))}
                          </div>
                          <h2 className="mb-2 text-2xl font-black tracking-tight text-[#050579]">
                            {feature.title}
                          </h2>
                          <p className="line-clamp-2 text-sm leading-relaxed text-[#475569]">
                            {feature.description}
                          </p>
                        </div>
                      </div>

                      {/* Referral code & link */}
                      <div className="space-y-3">
                        <div className="rounded-[22px] border border-[#E7ECF7] bg-[#F6F8FF] p-3.5">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                            รหัสแนะนำของคุณ
                          </p>
                          <p className="text-base font-mono tracking-widest text-[#0F172A]">
                            {user?.referral_code || 'ยังไม่มีรหัสแนะนำ — กดจัดการเพื่อสร้าง'}
                          </p>
                        </div>
                        <div className="rounded-[22px] border border-[#E7ECF7] bg-[#F6F8FF] p-3.5">
                          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-[#64748B]">
                            ลิงก์สำหรับแชร์สมัครสมาชิก
                          </p>
                          {isUserLoading ? (
                            <div className="h-3.5 w-full max-w-[22rem] animate-pulse rounded bg-[#E2E8F0]" />
                          ) : (
                            <p className="truncate font-mono text-xs text-[#475569]">
                              {referralUrl || 'ยังไม่มีลิงก์แนะนำ'}
                            </p>
                          )}
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
                          className="flex items-center gap-2 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-2 text-xs font-bold text-[#0F172A] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {copiedReferral ? <Check size={14} className="text-[#16A34A]" /> : <Copy size={14} />}
                          {copiedReferral ? 'คัดลอกลิงก์แล้ว!' : 'คัดลอกลิงก์'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenReferralLink();
                          }}
                          disabled={!hasCode}
                          className="flex items-center gap-2 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-2 text-xs font-bold text-[#0F172A] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <ExternalLink size={14} />
                          เปิดหน้าลงทะเบียน
                        </button>
                        <Link
                          href={feature.href}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-2 rounded-2xl bg-[#F97316] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#EA580C]"
                        >
                          <ArrowRight size={14} />
                          จัดการระบบแนะนำ
                        </Link>
                      </div>
                    </div>

                    {/* QR Code Section */}
                    <div className="sm:justify-self-end flex flex-col items-center gap-2 rounded-[22px] border border-[#D9E1F2] bg-white p-3 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)]">
                        <div className="text-center text-[10px] font-black uppercase tracking-[0.16em] text-[#64748B]">
                          Referral QR
                        </div>
                        {isUserLoading ? (
                          <div className="h-[104px] w-[104px] animate-pulse rounded-xl bg-[#E2E8F0]" />
                        ) : referralUrl ? (
                          <QrCodeImage url={referralUrl} size={104} />
                        ) : (
                          <div className="flex h-[104px] w-[104px] items-center justify-center rounded-xl border border-dashed border-[#D9E1F2] text-center text-[10px] font-bold text-[#94A3B8]">
                            ไม่มี QR
                          </div>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyReferral();
                          }}
                          disabled={!hasCode}
                          className="flex items-center gap-1 rounded-xl border border-[#D9E1F2] bg-[#F6F8FF] px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#0F172A] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Share2 size={12} />
                          แชร์ QR
                        </button>
                      </div>
                  </div>

                  {/* Decorative accent */}
                  <div className={`absolute bottom-0 right-0 h-28 w-28 ${TONE_STYLES[feature.tone].glow} opacity-40 transition-opacity group-hover:opacity-60`} />
                </div>
              );
            }

            // Enabled feature card (other features)
            return (
              <Link
                key={feature.id}
                href={feature.href}
                className={`group relative overflow-hidden rounded-[28px] border bg-white p-5 shadow-[0_18px_46px_-34px_rgba(15,23,42,0.14)] transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.99] ${TONE_STYLES[feature.tone].border} ${TONE_STYLES[feature.tone].hoverBorder} hover:shadow-[0_24px_56px_-38px_rgba(15,23,42,0.16)]`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Feature Icon */}
                  <div className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${TONE_STYLES[feature.tone].iconWrap} ${TONE_STYLES[feature.tone].iconColor}`}>
                    <feature.icon size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Tags */}
                    <div className="mb-2 flex flex-wrap gap-2">
                      {feature.tags.map(tag => (
                        <span key={tag} className={`rounded-xl border px-2.5 py-1 text-[10px] font-black uppercase tracking-widest ${TONE_STYLES[feature.tone].chip}`}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h2 className={`mb-2 text-[1.7rem] font-black leading-tight tracking-tight text-[#050579] transition-colors ${TONE_STYLES[feature.tone].text}`}>
                      {feature.title}
                    </h2>
                    <p className="mb-3 line-clamp-2 text-sm leading-6 text-[#475569] transition-colors group-hover:text-[#334155]">
                      {feature.description}
                    </p>
                    <div className={`flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] ${TONE_STYLES[feature.tone].action}`}>
                      เริ่มเข้าใช้งาน <ArrowRight size={16} className={TONE_STYLES[feature.tone].iconColor} />
                    </div>
                  </div>
                </div>
                {/* Decorative accent */}
                <div className={`absolute bottom-0 right-0 h-24 w-24 opacity-0 transition-opacity duration-500 group-hover:opacity-50 ${TONE_STYLES[feature.tone].glow}`} />
              </Link>
            );
          })}

          {/* Upgrade Card */}
          <div className="group relative flex flex-col justify-center overflow-hidden rounded-[28px] border border-[#D9E1F2] bg-white p-6 text-center shadow-[0_18px_46px_-34px_rgba(15,23,42,0.14)] xl:col-span-1">
             <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(5,5,121,0.05),transparent_30%)]" />

             <div className="relative z-10">
               <div className="mb-4 flex justify-center">
                 <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#F6D5BF] bg-[#FFF7F1] transition-transform group-hover:scale-105">
                   <Crown size={22} className="text-[#F97316]" />
                 </div>
               </div>

               {/* Feature Count */}
               <div className="mb-4 flex justify-center gap-5">
                 <div className="text-center">
                   <div className="text-xl font-black text-[#050579]">{getFeatureCounts().enabled}</div>
                   <div className="text-[10px] uppercase tracking-widest text-[#64748B]">ใช้งานได้</div>
                 </div>
                 <div className="w-px bg-[#D9E1F2]" />
                 <div className="text-center">
                   <div className="text-xl font-black text-[#F97316]">{getFeatureCounts().locked}</div>
                   <div className="text-[10px] uppercase tracking-widest text-[#64748B]">ถูกล็อค</div>
                 </div>
               </div>

               <h3 className="mb-2 text-lg font-black tracking-tight text-[#050579]">
                 {user?.subscription_tier === 'premium' ? 'Premium Member' : 'อัพเกรดเป็น Premium'}
               </h3>
               <p className="mb-5 text-sm leading-6 text-[#64748B]">
                 {user?.subscription_tier === 'premium'
                   ? 'คุณเป็นสมาชิก Premium แล้ว! เข้าถึงทุกฟีเจอร์ได้เต็มที่'
                   : 'ปลดล็อคทุกฟีเจอร์ ใช้งานแคตตาล็อกไม่จำกัด ไม่มีลายน้ำ'}
               </p>

               {user?.subscription_tier !== 'premium' && (
                 <button
                   onClick={() => setShowUpgradeModal(true)}
                   className="mx-auto flex w-full max-w-[220px] items-center justify-center gap-2 rounded-2xl bg-[#F97316] py-3 text-sm font-black uppercase tracking-wider text-white transition-colors hover:bg-[#EA580C]"
                 >
                   <Zap size={16} />
                   อัพเกรดตอนนี้
                 </button>
               )}

               {user?.subscription_tier === 'premium' && (
                 <div className="flex items-center justify-center gap-2 text-[#16A34A]">
                   <CheckCircle size={20} />
                   <span className="font-bold">Active Premium</span>
                 </div>
               )}
             </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="mt-14 grid grid-cols-1 gap-5 px-2 md:grid-cols-2">
           <div className="group rounded-[28px] border border-[#D9E1F2] bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.18)] transition-colors hover:border-[#C7D2E5]">
              <h3 className="mb-4 flex items-center gap-2.5 text-lg font-black tracking-tight text-[#050579]">
                <Smartphone size={20} className="text-[#050579]" /> แชร์โปรไฟล์อย่างรวดเร็ว
              </h3>
              <div className="mt-2 flex flex-col gap-4 lg:flex-row">
                  <div className="flex-grow space-y-3">
                    <div className="ml-1 text-xs font-black uppercase tracking-widest text-[#64748B]">โปรไฟล์สาธารณะของคุณ</div>
                    <div className="flex items-center justify-between rounded-2xl border border-[#E7ECF7] bg-[#F6F8FF] p-3.5 font-mono text-xs text-[#050579] transition-colors group-hover:bg-white">
                       <span className="truncate mr-4">{user ? `nexsolution.cloud/${user.url_prefix || 'p'}/${user.uid}` : 'กำลังโหลด...'}</span>
                       <Link href={user ? `/${user.url_prefix || 'p'}/${user.uid}` : '#'} className="whitespace-nowrap rounded-xl bg-[#050579] px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#07079A]">
                         เปิดดูหน้าเว็บ
                       </Link>
                    </div>
                  </div>
                  <div className="flex shrink-0 self-center items-center justify-center rounded-[22px] border border-[#D9E1F2] bg-white p-3 shadow-[0_18px_40px_-32px_rgba(15,23,42,0.25)] transition-transform group-hover:scale-105">
                     {user?.uid && user?.url_prefix ? (
                       <QrCodeImage url={getProfileUrl()} size={96} />
                     ) : (
                       <QrCode size={72} className="text-black" />
                     )}
                  </div>
              </div>
           </div>

           <div className="group rounded-[28px] border border-[#D9E1F2] bg-white p-6 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.18)] transition-colors hover:border-[#C7D2E5]">
              <h3 className="mb-4 flex items-center gap-2.5 text-lg font-black tracking-tight text-[#050579]">
                <BarChart3 size={20} className="text-[#2563EB]" /> ภาพรวมการใช้งาน
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="rounded-[20px] border border-[#D6E4FF] bg-[#F4F8FF] p-4 text-center transition-colors group-hover:bg-white">
                    <div className="text-2xl font-black tabular-nums text-[#1D4ED8]">0</div>
                    <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-[#64748B]">ยอดเข้าชมวันนี้</div>
                 </div>
                 <div className="rounded-[20px] border border-[#CFE9D6] bg-[#F3FCF5] p-4 text-center transition-colors group-hover:bg-white">
                    {isLeadsLoading ? (
                      <div className="mx-auto h-8 w-12 animate-pulse rounded-md bg-[#DDEFE2]" />
                    ) : (
                      <div className={`text-2xl font-black tabular-nums ${leadCount > 0 ? 'text-[#166534]' : 'text-[#94A3B8]'}`}>{leadCount > 0 ? leadCount : '--'}</div>
                    )}
                    <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-[#64748B]">รายชื่อใหม่</div>
                 </div>
              </div>
              <Link href="/manage/dashboard" className="mt-6 block w-full text-center text-xs font-black uppercase tracking-widest text-[#64748B] underline decoration-[#D9E1F2] underline-offset-8 transition-all hover:text-[#050579] hover:decoration-[#F97316]/40">
                ดูรายงานแบบเต็ม
              </Link>
           </div>
        </div>

        {/* Feature Status Section (toggleable for quick rollback) */}
        {SHOW_FEATURE_STATUS_SECTION && (
          <div className="mt-16 rounded-[32px] border border-[#D9E1F2] bg-white/92 p-8 shadow-[0_28px_70px_-44px_rgba(15,23,42,0.18)] md:p-10">
            <h3 className="mb-8 flex items-center gap-3 text-xl font-black tracking-tight text-[#050579]">
              <Star size={24} className="text-[#F97316]" /> สถานะฟีเจอร์ของคุณ
            </h3>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-7">
              {FEATURE_LIST.map((feature) => {
                const configKey = FEATURE_CONFIG_MAP[feature.id];
                const isEnabled = !user?.feature_config || user.feature_config[configKey] !== false;
                return (
                  <div
                    key={feature.id}
                    className={`rounded-2xl border p-4 text-center transition-all ${
                      isEnabled
                        ? 'border-[#CFE9D6] bg-[#F3FCF5]'
                        : 'border-[#E7ECF7] bg-[#F6F8FF]'
                    }`}
                  >
                    <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${
                      isEnabled ? 'bg-[#EEFBEF]' : 'bg-[#EEF2FF]'
                    }`}>
                      {isEnabled ? (
                        <CheckCircle size={20} className="text-[#16A34A]" />
                      ) : (
                        <Lock size={18} className="text-[#94A3B8]" />
                      )}
                    </div>
                    <p className={`truncate text-xs font-bold ${isEnabled ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>
                      {feature.title.split(' ')[0]}
                    </p>
                  </div>
                );
              })}
            </div>
            {getFeatureCounts().locked > 0 && (
              <div className="mt-8 text-center">
                <p className="mb-4 text-sm text-[#475569]">
                  คุณมี {getFeatureCounts().locked} ฟีเจอร์ที่ยังถูกล็อค
                </p>
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="rounded-2xl bg-[#F97316] px-8 py-3 font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#EA580C]"
                >
                  <Crown size={16} className="inline mr-2 -mt-0.5" />
                  ปลดล็อคทั้งหมด
                </button>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F172A]/32 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-lg rounded-[32px] border border-[#D9E1F2] bg-white p-8 shadow-[0_34px_100px_-48px_rgba(15,23,42,0.32)] animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#D9E1F2] bg-[#F6F8FF] transition-colors hover:bg-[#EEF0FF]"
            >
              <XCircle size={20} className="text-[#64748B]" />
            </button>

            {/* Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] border border-[#F6D5BF] bg-[#FFF1E8] shadow-[0_18px_40px_-24px_rgba(249,115,22,0.18)]">
                <Crown size={40} className="text-[#F97316]" />
              </div>
              <h3 className="mb-2 text-2xl font-black tracking-tight text-[#050579]">อัพเกรดเป็น Premium</h3>
              <p className="text-sm text-[#475569]">ปลดล็อคทุกฟีเจอร์และใช้งานได้เต็มที่ไม่มีข้อจำกัด</p>
            </div>

            {/* Features List */}
            <div className="mb-8 space-y-2">
              {[
                'ปลดล็อคทุกฟีเจอร์ทันที',
                'สร้างแคตตาล็อกได้ไม่จำกัด',
                'ไม่มีลายน้ำบนหน้าโปรไฟล์',
                'สถิติและการวิเคราะห์เชิงลึก',
                'ระบบ Landing Pages แบบลากวาง',
                'ระบบแนะนำสมาชิกและคอมมิชชั่น',
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl border border-[#DCEFE0] bg-[#F3FCF5] p-3">
                  <CheckCircle size={18} className="shrink-0 text-[#16A34A]" />
                  <span className="text-sm font-bold text-[#0F172A]">{item}</span>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="mb-8 rounded-[28px] border border-[#F6D5BF] bg-[#FFF7F1] p-6 text-center">
              <div className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#F97316]">ราคาพิเศษช่วงแนะนำ</div>
              <div className="text-4xl font-black text-[#C2410C]">฿299<span className="ml-1 text-lg font-bold text-[#64748B]">/เดือน</span></div>
              <div className="mt-2 text-[10px] font-black uppercase tracking-widest text-[#64748B]">หรือ ฿2,499/ปี (ประหยัดกว่า 30%)</div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="flex-1 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] py-4 text-sm font-black uppercase tracking-widest text-[#0F172A] transition-colors hover:bg-[#EEF0FF]"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleUpgradeRequest}
                disabled={upgradeLoading}
                className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-[#F97316] py-4 text-sm font-black uppercase tracking-widest text-white transition-colors hover:bg-[#EA580C] disabled:opacity-50"
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
              <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[#64748B]">
                มีคำถามเพิ่มเติม?
              </p>
              <a href="mailto:support@nexsolution.cloud" className="text-sm font-black tracking-tight text-[#050579] hover:underline">
                   support@nexsolution.cloud
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Quick Access Control Menu (Moved as requested) */}
      <div className="fixed bottom-6 left-1/2 z-[60] w-[calc(100%-64px)] max-w-md -translate-x-1/2 animate-in slide-in-from-bottom-5 duration-500 md:hidden">
        <div className="overflow-hidden rounded-[30px] border border-[#D9E1F2] bg-white/84 p-2.5 shadow-[0_16px_36px_-24px_rgba(15,23,42,0.18)] ring-1 ring-[#E7ECF7]/70 backdrop-blur-lg">
          <div className="flex items-center justify-around px-2">
            <Link 
              href="/manage/dashboard" 
              className="group flex flex-col items-center gap-1 px-3 py-1.5 text-[#64748B] transition-all hover:text-[#050579]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F6F8FF] transition-all group-hover:bg-[#EEF2FF] group-hover:text-[#050579]">
                <BarChart3 size={18} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80 group-hover:opacity-100">สถิติ</span>
            </Link>

            <Link 
              href="/manage/profile" 
              className="group flex flex-col items-center gap-1 px-3 py-1.5 text-[#64748B] transition-all hover:text-[#050579]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F6F8FF] transition-all group-hover:bg-[#EEF2FF] group-hover:text-[#050579]">
                <UserCircle size={18} />
              </div>
              <span className="text-[10px] uppercase font-black tracking-widest opacity-80 group-hover:opacity-100">แก้ไขโปรไฟล์</span>
            </Link>

            <Link 
              href={getProfileUrl()} 
              target="_blank"
              className="group flex flex-col items-center gap-1 px-3 py-1.5 text-[#64748B] transition-all hover:text-[#F97316]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#FFF7F1] transition-all group-hover:bg-[#FFF1E8] group-hover:text-[#F97316]">
                <ExternalLink size={18} />
              </div>
              <span className="text-[10px] uppercase font-black tracking-widest opacity-80 group-hover:opacity-100">ดูเว็บ</span>
            </Link>

            <Link 
              href="/manage/account" 
              className="group flex flex-col items-center gap-1 px-3 py-1.5 text-[#64748B] transition-all hover:text-[#050579]"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#F6F8FF] transition-all group-hover:bg-[#EEF2FF] group-hover:text-[#050579]">
                <Settings size={18} />
              </div>
              <span className="text-[10px] uppercase font-black tracking-widest opacity-80 group-hover:opacity-100">บัญชี</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Spacer for bottom menu on mobile */}
      <div className="h-24 md:hidden" />

    </div>
  );
}
