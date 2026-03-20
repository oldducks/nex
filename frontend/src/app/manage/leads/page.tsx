"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  Mail, Phone, Briefcase, Calendar, 
  CheckCircle
} from 'lucide-react';
import ManageTopBar from '@/components/ManageTopBar';

interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string;
  occupation: string;
  message: string;
  is_read: boolean;
  created_at: string;
  source_type?: string;
  source_id?: number;
  source_url?: string;
}

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get('token');
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  async function fetchLeads() {
    try {
      const res = await fetch('/api/leads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLeads(data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    fetchLeads();
  }, [token, router]);

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/leads/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setLeads(leads.map(l => l.id === id ? { ...l, is_read: true } : l));
    } catch {}
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A]">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.14),transparent_34%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.28),transparent_42%),linear-gradient(180deg,#f6f8ff_0%,#eef0ff_55%,#e8eeff_100%)]" />
      <ManageTopBar
        backHref="/manage/control-center"
        subtitle="ระบบบริหารลูกค้าเป้าหมาย"
        title="รายชื่อติดต่อ"
        actions={(
          <>
            <div className="hidden rounded-xl border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-[#64748B] md:block">
              ทั้งหมด {leads.length} รายชื่อ
            </div>
            {leads.length > 0 && (
              <button
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_URL}/leads/export`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) return;
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                    window.URL.revokeObjectURL(url);
                  } catch (e) {
                    // ignore error for now
                  }
                }}
                className="rounded-xl bg-[#F97316] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-[#EA580C]"
              >
                ดาวน์โหลด CSV
              </button>
            )}
          </>
        )}
      />

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="mb-3 text-4xl font-black tracking-tighter text-[#050579]">ลูกค้าที่สนใจ</h2>
          <p className="text-lg text-[#475569]">รายชื่อลูกค้าที่กรอกข้อมูลติดต่อจากหน้าโปรไฟล์ของคุณ</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 rounded-[24px] border border-[#E7ECF7] bg-white/70 animate-pulse" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="rounded-[40px] border-2 border-dashed border-[#D9E1F2] bg-white/80 py-32 text-center shadow-[0_24px_60px_-40px_rgba(15,23,42,0.16)]">
            <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#F6F8FF]">
               <Mail size={40} className="text-[#94A3B8]" />
            </div>
            <h3 className="mb-3 text-2xl font-black tracking-tight text-[#050579]">ยังไม่มีข้อมูลติดต่อกลับ</h3>
            <p className="mx-auto max-w-sm font-medium text-[#64748B]">ลองแชร์โปรไฟล์ของคุณไปที่โซเชียลต่างๆ เพื่อเริ่มเก็บข้อมูลลูกค้าที่สนใจ</p>
          </div>
        ) : (
          <div className="space-y-6">
            {leads.map((lead) => (
              <div 
                key={lead.id}
                onClick={() => !lead.is_read && markAsRead(lead.id)}
                className={`group relative cursor-pointer rounded-[32px] border bg-white p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-1 active:scale-[0.99] ${lead.is_read ? 'border-[#D9E1F2]' : 'border-[#F6D5BF]'}`}
              >
                {!lead.is_read && (
                  <div className="absolute left-3 top-8 h-2 w-2 rounded-full bg-[#F97316] shadow-[0_0_15px_rgba(249,115,22,0.45)] animate-pulse" />
                )}
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                  <div className="flex items-start gap-6">
                     <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[20px] bg-[#F6F8FF] shadow-inner transition-transform duration-500 group-hover:scale-105">
                        <UserIcon name={lead.name} />
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <h4 className="text-2xl font-black tracking-tight text-[#050579]">{lead.name}</h4>
                          {lead.is_read && <CheckCircle size={18} className="text-[#16A34A] opacity-70" />}
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                           <span className="flex items-center gap-2 font-medium text-[#475569] transition-colors hover:text-[#0F172A]"><Mail size={14} className="text-[#050579]/60" /> {lead.email}</span>
                           <span className="flex items-center gap-2 font-medium text-[#475569] transition-colors hover:text-[#0F172A]"><Phone size={14} className="text-[#050579]/60" /> {lead.phone}</span>
                           {lead.occupation && (
                             <span className="flex items-center gap-2 rounded-lg bg-[#EEF2FF] px-3 py-1 font-bold text-[#050579]"><Briefcase size={14} /> {lead.occupation}</span>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                     <div className="flex items-center gap-2 rounded-xl border border-[#E7ECF7] bg-[#F6F8FF] px-4 py-2 text-[10px] font-black uppercase tracking-[0.15em] text-[#64748B]">
                        <Calendar size={12} /> {new Date(lead.created_at).toLocaleDateString('th-TH', { 
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                     </div>
                     {lead.source_type === 'landing_page' ? (
                       <div className="flex items-center gap-2 rounded-lg border border-[#D6E4FF] bg-[#F4F8FF] px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#2563EB]">
                         Landing: {lead.source_url || 'Unknown'}
                       </div>
                     ) : (
                       <div className="flex items-center gap-2 rounded-lg border border-[#E7ECF7] bg-[#F6F8FF] px-3 py-1.5 text-[9px] font-black uppercase tracking-widest text-[#64748B]">
                         Source: Profile
                       </div>
                     )}
                  </div>
                </div>

                {lead.message && (
                  <div className="mt-8 border-t border-[#E7ECF7] pt-8">
                    <div className="mb-3 ml-1 text-[10px] font-black uppercase tracking-widest text-[#64748B]">ข้อความจากลูกค้า:</div>
                    <p className="rounded-2xl border border-[#E7ECF7] bg-[#F8FAFF] p-6 text-base italic leading-relaxed text-[#475569]">
                      &ldquo;{lead.message}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function UserIcon({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  const colors = [
    'bg-[#050579]', 'bg-[#16A34A]', 'bg-[#2563EB]',
    'bg-[#F97316]', 'bg-[#1D4ED8]', 'bg-[#0F766E]'
  ];
  const colorIndex = name.length % colors.length;
  return (
    <div className={`w-full h-full rounded-[18px] flex items-center justify-center text-white font-black text-2xl ${colors[colorIndex]} shadow-lg`}>
       {initial}
    </div>
  );
}
