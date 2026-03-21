"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  LogOut,
  Users,
  ShieldCheck,
  Smartphone,
  Loader2,
  Gift,
  Crown,
  Copy,
  ExternalLink,
  Check,
  Eye,
  Share2,
  TrendingUp,
  Users2,
  DollarSign,
} from 'lucide-react';
import { QrCodeImage } from '@/components/QrCode';
import Link from 'next/link';
import ManageTopBar from '@/components/ManageTopBar';

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
}

interface ReferralStats {
  totalReferrals: number;
  directReferrals: number;
  totalCommission: number;
  pendingCommission: number;
}

type StatsStatus = 'loading' | 'success' | 'error';

export default function ReferralsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [leadCount, setLeadCount] = useState(0);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [statsStatus, setStatsStatus] = useState<StatsStatus>('loading');
  const [statsUpdatedAt, setStatsUpdatedAt] = useState<string | null>(null);
  const token = Cookies.get('token');
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const statusMeta: Record<StatsStatus, { label: string; className: string }> = {
    loading: {
      label: 'กำลังโหลด',
      className: 'border-[#D9E1F2] bg-[#F6F8FF] text-[#64748B]',
    },
    success: {
      label: 'พร้อมใช้งาน',
      className: 'border-[#CFE9D6] bg-[#F3FCF5] text-[#15803D]',
    },
    error: {
      label: 'โหลดไม่สำเร็จ',
      className: 'border-[#F3C3C3] bg-[#FEF2F2] text-[#B91C1C]',
    },
  };

  const getProfileUrl = () => {
    if (!user?.url_prefix || !user?.uid) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nexsolution.cloud';
    return `${baseUrl}/${user.url_prefix}/${user.uid}`;
  };

  const getReferralShareUrl = () => {
    if (!user?.referral_code) return '';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nexsolution.cloud';
    return `${baseUrl}/register?ref=${user.referral_code}`;
  };

  const handleCopyReferral = async () => {
    const url = getReferralShareUrl();
    if (!url) return;

    await navigator.clipboard.writeText(url);
    setCopiedReferral(true);
    setTimeout(() => setCopiedReferral(false), 2000);
  };

  const handleOpenReferralLink = () => {
    const url = getReferralShareUrl();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleCopyReferralCode = async () => {
    if (!user?.referral_code) return;

    await navigator.clipboard.writeText(user.referral_code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleOpenProfile = () => {
    const url = getProfileUrl();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('uid');
    router.push('/');
  };

  const fetchReferralStats = useCallback(() => {
    if (!token) return;
    fetch(`${API_URL}/referrals/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (
          typeof data?.totalReferrals === 'number' &&
          typeof data?.directReferrals === 'number' &&
          typeof data?.totalCommission === 'number' &&
          typeof data?.pendingCommission === 'number'
        ) {
          setReferralStats(data);
          setStatsStatus('success');
          setStatsUpdatedAt(
            new Date().toLocaleString('th-TH', {
              dateStyle: 'medium',
              timeStyle: 'short',
            }),
          );
          return;
        }
        throw new Error('Invalid referral stats response');
      })
      .catch((err) => {
        console.error('Failed to fetch referral stats:', err);
        setReferralStats(null);
        setStatsStatus('error');
      });
  }, [API_URL, token]);

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch(`${API_URL}/leads/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.count === 'number') {
          setLeadCount(data.count);
        }
      })
      .catch((err) => console.error('Failed to fetch leads count:', err));

    fetchReferralStats();
  }, [API_URL, fetchReferralStats, router, token]);

  if (!token) return null;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF0FF]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-[#050579]" size={48} />
          <p className="font-medium text-[#475569]">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#EEF0FF] text-[#0F172A] selection:bg-[#F97316]/20">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.14),transparent_34%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.28),transparent_42%),linear-gradient(180deg,#f6f8ff_0%,#eef0ff_55%,#e8eeff_100%)]" />

      <ManageTopBar
        backHref="/manage/control-center"
        subtitle="ระบบบริหารการแนะนำ"
        title="ระบบแนะนำสมาชิก"
        actions={(
          <>
            {user?.role === 'super_admin' && (
              <Link
                href="/admin/dashboard"
                className="hidden items-center gap-2 rounded-full border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-[#475569] transition-colors hover:border-[#C7D2E5] hover:bg-white hover:text-[#050579] md:flex"
              >
                <ShieldCheck size={16} /> Admin Panel
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="group flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-3.5 transition-colors hover:border-[#F3C3C3] hover:bg-[#FEF2F2]"
            >
              <LogOut size={18} className="text-[#64748B] transition-colors group-hover:text-[#DC2626]" />
              <span className="hidden text-sm font-bold text-[#475569] transition-colors group-hover:text-[#B91C1C] sm:inline">ออกจากระบบ</span>
            </button>
          </>
        )}
      />

      <main className="mx-auto max-w-7xl px-6 py-8 md:py-10">
        <div className="mb-10 rounded-[32px] border border-[#D9E1F2] bg-white/92 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.16)] backdrop-blur-sm md:p-8">
          <div className="flex flex-col items-start justify-between gap-6 xl:flex-row xl:items-end">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`rounded-full border px-4 py-1.5 text-[10px] font-black uppercase tracking-widest ${
                    user?.subscription_tier === 'premium'
                      ? 'border-[#F6D5BF] bg-[#FFF1E8] text-[#F97316]'
                      : 'border-[#D9E1F2] bg-[#F6F8FF] text-[#050579]'
                  }`}
                >
                  {user?.subscription_tier || 'Free'} Plan
                </span>
                {user?.subscription_tier === 'premium' && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#F6D5BF] bg-[#FFF1E8] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#C2410C]">
                    <Crown size={12} /> Premium
                  </span>
                )}
              </div>

              <div className="text-sm font-medium text-[#64748B]">{user?.email}</div>
              <h1 className="text-3xl font-black tracking-tight text-[#050579] md:text-4xl">แชร์ลิงก์และติดตามค่าคอมมิชชัน</h1>
              <p className="max-w-2xl text-sm leading-7 text-[#475569] md:text-base">
                ใช้ลิงก์แนะนำของคุณเพื่อชวนเพื่อนสมัคร แล้วติดตามจำนวนผู้สมัครและยอดค่าคอมมิชชันได้จากหน้านี้
              </p>
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
                  <div className="text-sm font-black leading-tight text-[#050579]">โชว์นามบัตร</div>
                </div>
              </button>

              <div className="flex min-h-[88px] min-w-[190px] items-center gap-3 rounded-[24px] border border-[#D9E1F2] bg-white px-4 py-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#050579]">
                  <Smartphone size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">บัตรของฉัน</div>
                  <div className="text-xl font-black tabular-nums leading-tight text-[#050579]">1 / {user?.max_cards || 1}</div>
                </div>
              </div>

              <div className="flex min-h-[88px] min-w-[190px] items-center gap-3 rounded-[24px] border border-[#D9E1F2] bg-white px-4 py-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#050579]">
                  <Users size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">รายชื่อลูกค้า</div>
                  <div className="text-xl font-black tabular-nums leading-tight text-[#050579]">{leadCount > 0 ? leadCount : '--'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section className="mb-10">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black tracking-tight text-[#050579]">ภาพรวมการแนะนำ</h2>
            <span className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${statusMeta[statsStatus].className}`}>
              {statusMeta[statsStatus].label}
            </span>
          </div>
          <p className="mb-5 text-xs font-medium text-[#64748B]">
            อัปเดตล่าสุด: {statsUpdatedAt || 'ยังไม่มีข้อมูลล่าสุด'}
          </p>

          {statsStatus === 'loading' && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="animate-pulse rounded-[24px] border border-[#D9E1F2] bg-white p-6">
                  <div className="mb-4 h-12 w-12 rounded-xl bg-[#EEF2FF]" />
                  <div className="mb-2 h-8 w-16 rounded bg-[#E2E8F0]" />
                  <div className="h-4 w-24 rounded bg-[#E2E8F0]" />
                </div>
              ))}
            </div>
          )}

          {statsStatus === 'error' && (
            <div className="rounded-[24px] border border-[#F3C3C3] bg-[#FEF2F2] p-6">
              <p className="text-sm font-semibold text-[#B91C1C]">โหลดข้อมูลสถิติไม่สำเร็จ กรุณาลองใหม่อีกครั้ง</p>
              <button
                onClick={() => {
                  setStatsStatus('loading');
                  fetchReferralStats();
                }}
                className="mt-3 inline-flex items-center justify-center rounded-xl border border-[#F3C3C3] bg-white px-4 py-2 text-sm font-bold text-[#B91C1C] transition-colors hover:bg-[#FFF1F2]"
              >
                โหลดข้อมูลอีกครั้ง
              </button>
            </div>
          )}

          {statsStatus === 'success' && referralStats && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              <div className="rounded-[24px] border border-[#D9E1F2] bg-white p-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#050579]">
                    <Users2 size={24} />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">ทั้งหมด</div>
                </div>
                <div className="text-2xl font-black text-[#050579]">{referralStats.totalReferrals}</div>
                <div className="text-sm text-[#475569]">คนที่แนะนำ</div>
              </div>

              <div className="rounded-[24px] border border-[#D9E1F2] bg-white p-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF2FF] text-[#050579]">
                    <TrendingUp size={24} />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">โดยตรง</div>
                </div>
                <div className="text-2xl font-black text-[#050579]">{referralStats.directReferrals}</div>
                <div className="text-sm text-[#475569]">แนะนำโดยตรง</div>
              </div>

              <div className="rounded-[24px] border border-[#F6D5BF] bg-white p-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF1E8] text-[#F97316]">
                    <DollarSign size={24} />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">สะสม</div>
                </div>
                <div className="text-2xl font-black text-[#C2410C]">฿{referralStats.totalCommission.toFixed(2)}</div>
                <div className="text-sm text-[#475569]">ค่าคอมมิชชันทั้งหมด</div>
              </div>

              <div className="rounded-[24px] border border-[#D9E1F2] bg-white p-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#F6F8FF] text-[#475569]">
                    <Gift size={24} />
                  </div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">รอจ่าย</div>
                </div>
                <div className="text-2xl font-black text-[#050579]">฿{referralStats.pendingCommission.toFixed(2)}</div>
                <div className="text-sm text-[#475569]">ค่าคอมมิชชันรอจ่าย</div>
              </div>
            </div>
          )}
        </section>

        <div className="mb-10 rounded-[32px] border border-[#D9E1F2] bg-[#F6F8FF] p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.16)]">
          <div className="mb-6">
            <h2 className="mb-2 text-3xl font-black tracking-tight text-[#050579]">Share Assets</h2>
            <p className="text-base text-[#475569]">รวมลิงก์แชร์, รหัสแนะนำ และ QR Code ไว้ในที่เดียว</p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="space-y-5">
              <div className="rounded-2xl border border-[#D9E1F2] bg-white p-5">
                <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#64748B]">ลิงก์แนะนำ</div>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 font-mono text-sm text-[#334155]">
                  <span className="block truncate">{getReferralShareUrl() || 'ยังไม่มีลิงก์แนะนำ'}</span>
                </div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <button
                    onClick={handleCopyReferral}
                    disabled={!user?.referral_code}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F97316] px-5 py-2.5 text-sm font-black text-white transition-colors hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {copiedReferral ? <Check size={16} /> : <Copy size={16} />}
                    {copiedReferral ? 'คัดลอกลิงก์แล้ว!' : 'คัดลอกลิงก์'}
                  </button>
                  <button
                    onClick={handleOpenReferralLink}
                    disabled={!user?.referral_code}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D9E1F2] bg-white px-5 py-2.5 text-sm font-bold text-[#050579] transition-colors hover:bg-[#EEF0FF] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ExternalLink size={16} /> เปิดหน้าลงทะเบียน
                  </button>
                </div>
              </div>

              <div className="rounded-2xl border border-[#D9E1F2] bg-white p-5">
                <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#64748B]">รหัสแนะนำ</div>
                <div className="rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 text-center">
                  <div className="font-mono text-3xl font-black tracking-widest text-[#050579]">{user?.referral_code || 'กำลังสร้างรหัส...'}</div>
                </div>
                {user?.referral_code ? (
                  <div className="mt-3">
                    <button
                      onClick={handleCopyReferralCode}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D9E1F2] bg-white px-5 py-2.5 text-sm font-bold text-[#050579] transition-colors hover:bg-[#EEF0FF]"
                    >
                      {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                      {copiedCode ? 'คัดลอกรหัสแล้ว!' : 'คัดลอกรหัส'}
                    </button>
                  </div>
                ) : (
                  <div className="mt-3">
                    <button className="inline-flex items-center gap-2 rounded-xl bg-[#F97316] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#EA580C]">
                      <Gift size={16} /> สร้างรหัสแนะนำ
                    </button>
                  </div>
                )}
              </div>
            </div>

            {user?.referral_code && (
              <div className="flex flex-col items-center gap-3 rounded-2xl border border-[#D9E1F2] bg-white p-5">
                <div className="rounded-xl border border-[#E2E8F0] bg-white p-3">
                  <QrCodeImage url={getReferralShareUrl()} size={150} />
                </div>
                <p className="text-sm font-medium text-[#64748B]">สแกน QR Code เพื่อแชร์</p>
              </div>
            )}
          </div>
        </div>

        <div className="mb-10 rounded-[24px] border border-[#D9E1F2] bg-white p-8 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
          <h3 className="mb-8 text-center text-2xl font-black text-[#050579]">วิธีการทำงาน</h3>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#050579]">
                <Share2 size={32} />
              </div>
              <h4 className="mb-2 text-lg font-black text-[#050579]">1. แชร์ลิงก์</h4>
              <p className="text-[#475569]">แชร์ลิงก์หรือ QR Code ให้เพื่อนของคุณ</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEFBEF] text-[#16A34A]">
                <Users size={32} />
              </div>
              <h4 className="mb-2 text-lg font-black text-[#050579]">2. เพื่อนสมัคร</h4>
              <p className="text-[#475569]">เพื่อนของคุณสมัครใช้งานผ่านลิงก์ของคุณ</p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFF1E8] text-[#F97316]">
                <DollarSign size={32} />
              </div>
              <h4 className="mb-2 text-lg font-black text-[#050579]">3. รับค่าคอมมิชชัน</h4>
              <p className="text-[#475569]">รับค่าคอมมิชชัน 10% จากค่าสมัครของเพื่อน</p>
            </div>
          </div>
        </div>

        <div className="mb-10 rounded-[24px] border border-[#D9E1F2] bg-white p-8 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)]">
          <h3 className="mb-8 text-center text-2xl font-black text-[#050579]">ระดับค่าคอมมิชชัน</h3>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-[#D9E1F2] bg-[#F6F8FF] p-6">
              <div className="mb-4 text-center">
                <div className="text-3xl font-black text-[#F97316]">10%</div>
                <div className="text-sm text-[#64748B]">ระดับ 1</div>
              </div>
              <p className="text-center text-sm text-[#475569]">แนะนำโดยตรง</p>
            </div>

            <div className="rounded-xl border border-[#D9E1F2] bg-[#F6F8FF] p-6">
              <div className="mb-4 text-center">
                <div className="text-3xl font-black text-[#050579]">10%</div>
                <div className="text-sm text-[#64748B]">ระดับ 2-10</div>
              </div>
              <p className="text-center text-sm text-[#475569]">แนะนำอ้อมทาง</p>
            </div>

            <div className="rounded-xl border border-[#F6D5BF] bg-[#FFF7F1] p-6">
              <div className="mb-4 text-center">
                <div className="text-3xl font-black text-[#C2410C]">10 ชั้น</div>
                <div className="text-sm text-[#9A3412]">สูงสุด</div>
              </div>
              <p className="text-center text-sm text-[#7C2D12]">รับค่าคอมมิชชันจากทุกชั้น</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
