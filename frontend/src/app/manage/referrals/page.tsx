"use client";

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  LogOut,
  Loader2,
  Copy,
  Check,
  Smartphone,
  Crown,
  Users,
  Download,
} from 'lucide-react';
import ManageTopBar from '@/components/ManageTopBar';
import { QrCodeImage } from '@/components/QrCode';
import { QrCodeDownloadActions } from '@/components/QrCodeDownloadActions';

interface UserData {
  id: number;
  email: string;
  role: string;
  subscription_tier: string;
  max_cards: number;
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

interface ReferralTreeNode {
  id: number;
  level: number;
  referredUser?: {
    id: number;
    email: string;
    uid: string;
    profilePic?: string;
    subscription_tier?: string;
  };
  commission: number | string;
  status: string;
  createdAt: string | Date;
}

export default function ReferralsPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [tree, setTree] = useState<ReferralTreeNode[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  
  const token = Cookies.get('token');
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const fetchData = useCallback(() => {
    if (!token) return;
    
    // Stats
    fetch(`${API_URL}/referrals/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.totalReferrals === 'number') {
          setStats(data);
        }
      })
      .catch((err) => console.error('Stats fetch failed:', err));

    // Tree
    fetch(`${API_URL}/referrals/tree`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const sorted = [...data].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          setTree(sorted);
        }
      })
      .catch(err => console.error('Tree fetch failed:', err));
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
        fetchData();
      })
      .catch((err) => {
        console.error('User fetch failed:', err);
        setLoading(false);
      });

    const intervalId = setInterval(fetchData, 60000); 
    return () => clearInterval(intervalId);
  }, [API_URL, fetchData, router, token]);

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

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('uid');
    router.push('/');
  };

  const referralUrl = user?.referral_code 
    ? typeof window !== 'undefined' ? `${window.location.origin}/register?ref=${user.referral_code}` : '' 
    : '';

  const downloadQrCode = () => {
    const canvas = document.getElementById('referral-qr-canvas') as HTMLCanvasElement;
    if (canvas) {
      const pngUrl = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      downloadLink.download = 'nex-referral-qr.png';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

  const copyToClipboard = async () => {
    if (!referralUrl) return;
    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const getProfilePic = (pic?: string) => {
    if (!pic) return null;
    if (pic.startsWith('http') || pic.startsWith('/')) return pic;
    return `${API_URL}/uploads/profiles/${pic}`;
  };

  const getInitials = (email: string) => {
    return email[0].toUpperCase();
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#EEF0FF] text-[#0F172A]">
      <ManageTopBar
        backHref="/manage/control-center"
        subtitle="Referral Program"
        title="Nex Team"
        actions={(
          <button
            onClick={handleLogout}
            className="group flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 transition-all hover:border-[#F3C3C3] hover:bg-[#FEF2F2]"
          >
            <LogOut size={18} className="text-[#64748B] group-hover:text-[#DC2626]" />
            <span className="hidden text-sm font-bold text-[#475569] group-hover:text-[#B91C1C] sm:inline">ออกจากระบบ</span>
          </button>
        )}
      />

      <main className="mx-auto max-w-7xl px-6 py-8 md:py-10">
        {/* Header Summary section */}
        <div className="mb-10 rounded-[32px] border border-[#D9E1F2] bg-white/90 p-6 shadow-sm backdrop-blur-sm md:p-8">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <span className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#050579]">
                     {user?.subscription_tier || 'Free'} Plan
                   </span>
                   {user?.subscription_tier === 'premium' && (
                     <span className="flex items-center gap-1 rounded-full bg-[#FFF1E8] px-3 py-1 text-[10px] font-black uppercase tracking-widest text-[#C2410C]">
                       <Crown size={12} /> Premium
                     </span>
                   )}
                 </div>
                 <h1 className="text-3xl font-black tracking-tight text-[#050579] md:text-3xl leading-tight">จำนวนพันธมิตรธุรกิจ</h1>
              </div>

              <div className="grid grid-cols-1 gap-4">
                 <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFC] p-4 min-w-[200px]">
                    <div className="text-[10px] font-black uppercase tracking-widest text-[#64748B] mb-1">จำนวนผู้สมัครจากลิงก์</div>
                    <div className="text-3xl font-black text-[#050579]">{stats?.directReferrals || 0} คน</div>
                 </div>
              </div>
           </div>
        </div>

        {/* 1. Referrals Table */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black tracking-tight text-[#050579]">รายชื่อผู้สมัคร</h2>
            <div className="flex items-center gap-2">
               <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">REAL-TIME</span>
            </div>
          </div>
          
          <div className="rounded-[32px] border border-[#D9E1F2] bg-white overflow-hidden shadow-sm">
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-[#F8FAFC]">
                         <th className="py-4 px-4 text-center text-[10px] font-black uppercase tracking-widest text-[#64748B]">ลำดับ</th>
                         <th className="py-4 px-4 text-center text-[10px] font-black uppercase tracking-widest text-[#64748B]">รูปโปรไฟล์</th>
                         <th className="py-4 px-8 text-left text-[10px] font-black uppercase tracking-widest text-[#64748B]">ผู้สมัคร</th>
                         <th className="py-4 px-8 text-center text-[10px] font-black uppercase tracking-widest text-[#050579]">ชุดที่สมัคร</th>
                         <th className="py-4 px-8 text-center text-[10px] font-black uppercase tracking-widest text-[#050579]">วันที่สมัคร</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-[#F1F5F9]">
                      {tree.length > 0 ? (
                        tree.map((item, index) => (
                          <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors">
                             <td className="py-4 px-4 text-center text-sm font-bold text-[#64748B]">{index + 1}</td>
                             <td className="py-4 px-4">
                                <div className="mx-auto h-10 w-10 flex-shrink-0 relative overflow-hidden rounded-full border border-gray-100 bg-gray-50">
                                   {item.referredUser?.profilePic ? (
                                     <img 
                                        src={getProfilePic(item.referredUser.profilePic)!} 
                                        alt={item.referredUser?.email}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${item.referredUser?.email || "U"}`;
                                        }}
                                     />
                                   ) : (
                                     <div className="flex h-full w-full items-center justify-center bg-indigo-50 text-indigo-500 font-black text-xs">
                                       {getInitials(item.referredUser?.email || 'U')}
                                     </div>
                                   )}
                                </div>
                             </td>
                             <td className="py-4 px-8">
                                <div className="flex flex-col min-w-[200px]">
                                   <span className="text-sm font-bold text-[#050579]">{item.referredUser?.email || 'Unknown User'}</span>
                                   <span className="text-[10px] text-[#94A3B8]">UID: {item.referredUser?.uid || '---'}</span>
                                </div>
                             </td>
                              <td className="py-4 px-8 text-center">
                                 <span className={`inline-flex rounded-lg px-2.5 py-1 text-[10px] font-black uppercase ${item.referredUser?.subscription_tier === 'premium' ? 'bg-orange-100 text-[#F97316]' : 'bg-[#EEF2FF] text-[#050579]'}`}>
                                   {item.referredUser?.subscription_tier || 'Free'}
                                 </span>
                              </td>
                             <td className="py-4 px-8 text-center text-[11px] font-semibold text-[#64748B] tabular-nums">
                                {(() => {
                                   if (!item.createdAt) return '-';
                                   try {
                                      const d = new Date(item.createdAt);
                                      return d.toLocaleDateString('th-TH', { 
                                         day: '2-digit', 
                                         month: 'short', 
                                         year: '2-digit',
                                         hour: '2-digit',
                                         minute: '2-digit'
                                      });
                                   } catch { return '-'; }
                                })()}
                             </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-20 text-center">
                             <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F8FAFC] text-[#CBD5E1] mb-2">
                                <Users size={32} />
                             </div>
                             <p className="text-sm font-bold text-[#64748B]">ยังไม่มีผู้สมัครในขณะนี้</p>
                          </td>
                        </tr>
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* 2. Link & QR Section */}
        <div className="mb-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
           {/* Referral Link & Code */}
           <div className="lg:col-span-8 rounded-[32px] border border-[#D9E1F2] bg-white p-8 text-[#0F172A] relative overflow-hidden group shadow-sm">
              <div className="absolute top-0 right-0 -m-8 h-48 w-48 rounded-full bg-[#EEF2FF] blur-3xl" />
              <div className="relative z-10">
                 <h3 className="text-2xl font-black mb-6 text-[#050579]">แบ่งปันลิงก์</h3>
                 <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-3">
                       <div className="flex-1 rounded-xl bg-[#F8FAFF] p-4 font-mono text-sm break-all border border-[#D9E1F2] self-center text-[#334155]">
                          {referralUrl || 'Loading link...'}
                       </div>
                       <button
                         onClick={copyToClipboard}
                         className="flex items-center justify-center gap-2 rounded-xl bg-[#F97316] px-8 py-4 font-black text-white hover:bg-[#EA580C] transition-all transform hover:scale-102"
                       >
                         {copiedLink ? <Check size={20} /> : <Copy size={20} />}
                         {copiedLink ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}
                       </button>
                    </div>
                    
                    <div className="flex items-center gap-6 py-5 px-6 rounded-2xl bg-[#F8FAFF] border border-[#D9E1F2]">
                       <div className="h-12 w-12 rounded-full bg-white border border-[#E2E8F0] flex items-center justify-center text-[#F97316]">
                          <Smartphone size={24} />
                       </div>
                       <div>
                          <div className="text-[10px] font-bold uppercase tracking-widest text-[#64748B] mb-1">ID สำหรับการกรอกสมัคร</div>
                          <div className="text-2xl font-black tracking-[0.2em] text-[#050579]">{user?.referral_code || '---'}</div>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           {/* QR Code */}
           <div className="lg:col-span-4 rounded-[32px] border border-[#D9E1F2] bg-white p-8 flex flex-col items-center justify-center text-center shadow-sm">
              <h3 className="text-lg font-black text-[#050579] mb-4">สแกนรหัสเพื่อไปสมัคร</h3>
              <div className="w-full max-w-[280px] rounded-[28px] border border-[#D9E1F2] bg-[#F8FAFF] p-5 shadow-[0_18px_34px_-24px_rgba(15,23,42,0.24)]">
                 <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#94A3B8]">QR Code</div>
                 <div className="rounded-3xl border border-[#E2E8F0] bg-white p-3 transition-transform duration-300 hover:scale-105">
                 <QrCodeImage id="referral-qr-canvas" useCanvas={true} url={referralUrl} size={160} />
                 </div>
                 <div className="mt-3 text-xs font-semibold text-[#050579]">{user?.referral_code || 'Referral QR'}</div>
                 <div className="mt-1 break-all text-[11px] leading-5 text-[#64748B]">{referralUrl}</div>
                 <QrCodeDownloadActions
                   qrValue={referralUrl}
                   fileBaseName={`referral-${user?.referral_code || 'qr'}`}
                   titleLine="QR Code"
                   nameLine={user?.referral_code || 'Referral QR'}
                   bottomLabel="URL"
                   bottomLine={referralUrl}
                   buttonLabel="กดเพื่อ download qr code ลงในโทรศัพท์"
                   className="mt-4"
                 />
              </div>
           </div>
        </div>

      </main>
      
      <div className="h-20" />
    </div>
  );
}
