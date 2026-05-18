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
  Eye,
  Pencil,
  Plus,
  Share2,
  Trash2,
} from 'lucide-react';
import ManageTopBar from '@/components/ManageTopBar';
import { QrCodeImage } from '@/components/QrCode';
import { QrCodeDownloadActions } from '@/components/QrCodeDownloadActions';
import { PublicShareModal } from '@/components/PublicProfileFooterActions';

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
    fullName?: string;
    phone?: string;
    subscription_tier?: string;
  };
  commission: number | string;
  status: string;
  createdAt: string | Date;
}

interface CentralPartnerTemplate {
  landingPageId: number;
  pitch: string;
  page?: {
    id: number;
    title: string;
    slug: string;
    is_published: boolean;
    updated_at: string;
  } | null;
}

interface CentralPartnerShareSettings {
  templates: CentralPartnerTemplate[];
}

export default function ReferralsPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [tree, setTree] = useState<ReferralTreeNode[]>([]);
  const [copiedTemplateId, setCopiedTemplateId] = useState<number | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTemplateId, setShareTemplateId] = useState<number | null>(null);
  const [sharePitch, setSharePitch] = useState('');
  const [sharePitchDraft, setSharePitchDraft] = useState('');
  const [savingSharePitch, setSavingSharePitch] = useState(false);
  const [centralTemplates, setCentralTemplates] = useState<CentralPartnerTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState<number | null>(null);
  
  const token = isClient ? Cookies.get('token') : undefined;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    setIsClient(true);
  }, []);

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

    fetch(`${API_URL}/admin/settings/central-partner-share`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then((data: CentralPartnerShareSettings) => {
        if (Array.isArray(data?.templates)) {
          setCentralTemplates(data.templates);
          setSelectedTemplateId((current) => {
            if (current && data.templates.some((item) => item.landingPageId === current)) {
              return current;
            }
            return data.templates[0]?.landingPageId ?? null;
          });
        }
      })
      .catch((err) => console.error('Share pitch fetch failed:', err));
  }, [API_URL, token]);

  useEffect(() => {
    if (!isClient) return;

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
  }, [API_URL, fetchData, isClient, router, token]);

  const selectedTemplate =
    centralTemplates.find((item) => item.landingPageId === selectedTemplateId) ||
    centralTemplates[0] ||
    null;

  useEffect(() => {
    const nextPitch = selectedTemplate?.pitch || '';
    setSharePitch(nextPitch);
    setSharePitchDraft(nextPitch);
  }, [selectedTemplate]);

  const referralUrl = user?.referral_code 
    ? typeof window !== 'undefined' && selectedTemplate
      ? `${window.location.origin}/lp/${encodeURIComponent(selectedTemplate.page?.slug || String(selectedTemplate.landingPageId))}?ref=${encodeURIComponent(user.referral_code)}`
      : ''
    : '';

  const shareModalTemplate =
    centralTemplates.find((item) => item.landingPageId === shareTemplateId) || selectedTemplate || null;

  const getReferralUrlForTemplate = (template: CentralPartnerTemplate | null) => {
    if (!template || !user?.referral_code || typeof window === 'undefined') return '';
    return `${window.location.origin}/lp/${encodeURIComponent(template.page?.slug || String(template.landingPageId))}?ref=${encodeURIComponent(user.referral_code)}`;
  };

  if (!isClient || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF0FF]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 animate-spin text-[#050579]" size={48} />
          <p className="font-medium text-[#475569]">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (!token) return null;

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('uid');
    router.push('/');
  };

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

  const copyToClipboard = async (template?: CentralPartnerTemplate | null) => {
    const targetTemplate = template || selectedTemplate;
    const targetUrl = getReferralUrlForTemplate(targetTemplate);
    if (!targetUrl) return;
    try {
      const targetPitch = template ? template.pitch : sharePitch;
      const shareMessage = targetPitch.trim() ? `${targetPitch.trim()}\n${targetUrl}` : targetUrl;
      await navigator.clipboard.writeText(shareMessage);
      setCopiedTemplateId(targetTemplate?.landingPageId ?? null);
      setTimeout(() => setCopiedTemplateId(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const openPreview = (template?: CentralPartnerTemplate | null) => {
    const targetUrl = getReferralUrlForTemplate(template || selectedTemplate);
    if (!targetUrl) return;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const shareReferralLink = (template?: CentralPartnerTemplate | null) => {
    const targetTemplate = template || selectedTemplate;
    const targetUrl = getReferralUrlForTemplate(targetTemplate);
    if (!targetUrl) return;
    setShareTemplateId(targetTemplate?.landingPageId ?? null);
    setShowShareModal(true);
  };

  const saveSharePitch = async () => {
    if (!sharePitchDraft.trim() || !selectedTemplate) return;
    setSavingSharePitch(true);
    try {
      const res = await fetch(`${API_URL}/admin/settings/central-partner-share/templates/${selectedTemplate.landingPageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ pitch: sharePitchDraft }),
      });

      if (!res.ok) {
        throw new Error('save failed');
      }

      const data = await res.json() as CentralPartnerShareSettings;
      if (Array.isArray(data.templates)) {
        setCentralTemplates(data.templates);
      }
    } catch (error) {
      console.error('Save share pitch failed:', error);
    } finally {
      setSavingSharePitch(false);
    }
  };

  const createCentralTemplate = async () => {
    setCreatingTemplate(true);
    try {
      const res = await fetch(`${API_URL}/admin/settings/central-partner-share/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: `Salespage ส่วนกลาง ${centralTemplates.length + 1}`,
          pitch: sharePitchDraft.trim() || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('create failed');
      }

      const data = await res.json() as CentralPartnerShareSettings;
      if (Array.isArray(data.templates)) {
        setCentralTemplates(data.templates);
        setSelectedTemplateId(data.templates[0]?.landingPageId ?? null);
      }
    } catch (error) {
      console.error('Create central template failed:', error);
      window.alert('สร้าง Salespage ส่วนกลางไม่สำเร็จ');
    } finally {
      setCreatingTemplate(false);
    }
  };

  const deleteCentralTemplate = async (landingPageId: number) => {
    const confirmed = window.confirm('ยืนยันลบ Salespage ส่วนกลางนี้?');
    if (!confirmed) return;

    setDeletingTemplateId(landingPageId);
    try {
      const res = await fetch(`${API_URL}/admin/settings/central-partner-share/templates/${landingPageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('delete failed');
      }

      const data = await res.json() as CentralPartnerShareSettings;
      if (Array.isArray(data.templates)) {
        setCentralTemplates(data.templates);
        setSelectedTemplateId((current) => {
          if (current && data.templates.some((item) => item.landingPageId === current)) {
            return current;
          }
          return data.templates[0]?.landingPageId ?? null;
        });
      }
    } catch (error) {
      console.error('Delete central template failed:', error);
      window.alert('ลบ Salespage ส่วนกลางไม่สำเร็จ');
    } finally {
      setDeletingTemplateId(null);
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
        backHref="/manage/control"
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
                                   <span className="text-sm font-bold text-[#050579]">{item.referredUser?.fullName || item.referredUser?.email || 'Unknown User'}</span>
                                   <span className="text-xs text-[#475569]">{item.referredUser?.phone || '-'}</span>
                                   <span className="text-[10px] text-[#94A3B8]">{item.referredUser?.email || '-'}</span>
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
                 {user?.role === 'super_admin' || user?.role === 'group_admin' ? (
                   <div className="mb-5 space-y-3">
                     <div className="flex flex-wrap items-center gap-3">
                       <button
                         onClick={createCentralTemplate}
                         disabled={creatingTemplate}
                         className="inline-flex items-center gap-2 rounded-xl bg-[#F97316] px-4 py-3 text-sm font-black text-white transition-all hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-60"
                       >
                         {creatingTemplate ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                         {creatingTemplate ? 'กำลังสร้าง...' : 'สร้าง Salespage ส่วนกลาง'}
                       </button>
                       <span className="text-xs font-bold text-[#64748B]">
                         สร้างได้ไม่จำกัด ตอนนี้มี {centralTemplates.length} อัน
                       </span>
                     </div>

                     <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                       {centralTemplates.map((template) => {
                         const isSelected = template.landingPageId === selectedTemplate?.landingPageId;
                         const templateReferralUrl = getReferralUrlForTemplate(template);
                         const isCopied = copiedTemplateId === template.landingPageId;
                         return (
                           <div
                             key={template.landingPageId}
                             className={`rounded-2xl border p-4 transition ${isSelected ? 'border-[#F97316] bg-[#FFF7ED]' : 'border-[#D9E1F2] bg-[#F8FAFF]'}`}
                           >
                             <button
                               type="button"
                               onClick={() => setSelectedTemplateId(template.landingPageId)}
                               className="w-full text-left"
                             >
                               <div className="text-sm font-black text-[#050579]">
                                 {template.page?.title || `Salespage #${template.landingPageId}`}
                               </div>
                               <div className="mt-1 text-xs text-[#64748B]">
                                 /lp/{template.page?.slug || template.landingPageId}
                               </div>
                             </button>
                             <div className="mt-3 rounded-xl border border-[#D9E1F2] bg-white/80 p-3">
                               <div className="text-[10px] font-black uppercase tracking-widest text-[#64748B]">
                                 คำโปรยของ salespage นี้
                               </div>
                               <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[#334155]">
                                 {template.pitch?.trim() || 'ยังไม่ได้ตั้งคำโปรย'}
                               </p>
                             </div>
                             <div className="mt-3 rounded-xl border border-[#D9E1F2] bg-white/80 p-3 font-mono text-xs break-all text-[#334155]">
                               {templateReferralUrl || 'ยังไม่พบลิงก์ของ Salespage นี้'}
                             </div>
                             <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                               <button
                                 onClick={() => copyToClipboard(template)}
                                 disabled={!templateReferralUrl}
                                 className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F97316] px-3 py-3 text-xs font-black text-white transition hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-50"
                               >
                                 {isCopied ? <Check size={14} /> : <Copy size={14} />}
                                 {isCopied ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}
                               </button>
                               <button
                                 onClick={() => shareReferralLink(template)}
                                 disabled={!templateReferralUrl}
                                 className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D9E1F2] bg-white px-3 py-3 text-xs font-black text-[#050579] disabled:cursor-not-allowed disabled:opacity-50"
                               >
                                 <Share2 size={14} />
                                 แชร์
                               </button>
                               <button
                                 onClick={() => openPreview(template)}
                                 disabled={!templateReferralUrl}
                                 className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D9E1F2] bg-white px-3 py-3 text-xs font-black text-[#050579] disabled:cursor-not-allowed disabled:opacity-50"
                               >
                                 <Eye size={14} />
                                 ดูเนื้อหา
                               </button>
                               <button
                                 onClick={() => setSelectedTemplateId(template.landingPageId)}
                                 className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-xs font-black transition ${
                                   isSelected
                                     ? 'border border-[#F97316] bg-[#FFF1E8] text-[#C2410C]'
                                     : 'border border-[#D9E1F2] bg-white text-[#050579]'
                                 }`}
                               >
                                 <Smartphone size={14} />
                                 {isSelected ? 'กำลังใช้กับ QR' : 'เลือกอันนี้'}
                               </button>
                             </div>
                             <div className="mt-3 flex flex-wrap gap-2">
                               <button
                                 onClick={() => router.push(`/manage/landing-pages/${template.landingPageId}`)}
                                 className="inline-flex items-center gap-1 rounded-xl border border-[#D9E1F2] bg-white px-3 py-2 text-xs font-black text-[#050579]"
                               >
                                 <Pencil size={14} />
                                 แก้หน้า
                               </button>
                               <button
                                 onClick={() => deleteCentralTemplate(template.landingPageId)}
                                 disabled={deletingTemplateId === template.landingPageId}
                                 className="inline-flex items-center gap-1 rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-xs font-black text-[#DC2626] disabled:opacity-60"
                               >
                                 {deletingTemplateId === template.landingPageId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                 ลบ
                               </button>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 ) : null}
                 <div className="space-y-6">
                    <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-4">
                      <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#64748B]">เลือก Salespage ส่วนกลาง</div>
                      {selectedTemplate ? (
                        <div>
                          <div className="text-base font-black text-[#050579]">{selectedTemplate.page?.title || `Salespage #${selectedTemplate.landingPageId}`}</div>
                          <div className="mt-1 text-xs text-[#64748B]">/lp/{selectedTemplate.page?.slug || selectedTemplate.landingPageId}</div>
                          <div className="mt-2 text-[11px] font-bold text-[#C2410C]">QR ด้านขวาและปุ่มด้านล่างจะอ้างอิงจาก Salespage นี้</div>
                        </div>
                      ) : (
                        <div className="text-sm text-[#64748B]">ยังไม่มี Salespage ส่วนกลางให้ใช้งาน</div>
                      )}
                    </div>

                    <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-4">
                       <div className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#64748B]">คำโปรยพร้อมลิงก์เวลานำไปแชร์</div>
                       {user?.role === 'super_admin' || user?.role === 'group_admin' ? (
                         <div className="space-y-3">
                           <textarea
                             value={sharePitchDraft}
                             onChange={(event) => setSharePitchDraft(event.target.value)}
                             rows={5}
                             className="w-full rounded-xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm text-[#0F172A] outline-none"
                             placeholder="ใส่คำโปรยสำหรับ Salespage ส่วนกลางที่เลือก"
                           />
                           <button
                             onClick={saveSharePitch}
                             disabled={savingSharePitch || !sharePitchDraft.trim() || !selectedTemplate}
                             className="inline-flex items-center justify-center rounded-xl bg-[#F97316] px-5 py-3 text-sm font-black text-white transition hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-60"
                           >
                             {savingSharePitch ? 'กำลังบันทึก...' : 'บันทึกคำโปรย'}
                           </button>
                         </div>
                       ) : (
                         <p className="text-sm leading-7 text-[#334155] whitespace-pre-line">{sharePitch || '-'}</p>
                       )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                       <div className="flex-1 rounded-xl bg-[#F8FAFF] p-4 font-mono text-sm break-all border border-[#D9E1F2] self-center text-[#334155]">
                          {referralUrl || 'Loading link...'}
                       </div>
                       <button
                         onClick={() => copyToClipboard(selectedTemplate)}
                         disabled={!referralUrl}
                         className="flex items-center justify-center gap-2 rounded-xl bg-[#F97316] px-8 py-4 font-black text-white hover:bg-[#EA580C] transition-all transform hover:scale-102"
                       >
                         {copiedTemplateId === selectedTemplate?.landingPageId ? <Check size={20} /> : <Copy size={20} />}
                         {copiedTemplateId === selectedTemplate?.landingPageId ? 'คัดลอกแล้ว' : 'คัดลอกลิงก์'}
                       </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                       <button
                         onClick={() => shareReferralLink(selectedTemplate)}
                         disabled={!referralUrl}
                         className="flex items-center justify-center gap-2 rounded-xl border border-[#D9E1F2] bg-white px-6 py-4 font-black text-[#050579] transition-all hover:bg-[#F8FAFF] disabled:cursor-not-allowed disabled:opacity-50"
                       >
                         <Share2 size={18} />
                         แชร์
                       </button>
                       <button
                         onClick={() => openPreview(selectedTemplate)}
                         disabled={!referralUrl}
                         className="flex items-center justify-center gap-2 rounded-xl border border-[#D9E1F2] bg-white px-6 py-4 font-black text-[#050579] transition-all hover:bg-[#F8FAFF] disabled:cursor-not-allowed disabled:opacity-50"
                       >
                         <Eye size={18} />
                         ดูเนื้อหา
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
                 <div className="mt-1 break-all text-[11px] leading-5 text-[#64748B]">{referralUrl || 'ยังไม่พบลิงก์จาก Salespage ส่วนกลาง'}</div>
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
      
      <PublicShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={getReferralUrlForTemplate(shareModalTemplate)}
        title="ลิงก์แนะนำสมาชิก NEX"
        shareText={shareModalTemplate?.pitch || sharePitch}
      />

      <div className="h-20" />
    </div>
  );
}
