"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  Users, Mail, Phone, Briefcase, Calendar, 
  ChevronRight, ArrowLeft, MoreHorizontal, CheckCircle, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

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

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    fetchLeads();
  }, [token, router]);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setLeads(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await fetch(`/api/leads/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setLeads(leads.map(l => l.id === id ? { ...l, is_read: true } : l));
    } catch (error) {}
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Header */}
      <header className="border-b border-foreground/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/manage/control-center" className="w-10 h-10 rounded-xl hover:bg-foreground/5 flex items-center justify-center transition-all group">
              <ArrowLeft size={18} className="text-foreground/40 group-hover:text-foreground transition-colors" />
            </Link>
            <h1 className="font-bold text-xl tracking-tight flex items-center gap-2">
              <Users size={20} className="text-primary" /> รายชื่อติดต่อ <span className="text-foreground/20 font-normal hidden sm:inline">(Leads)</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-foreground/30 bg-foreground/5 px-3 py-1.5 rounded-lg hidden md:block">
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
                className="text-[10px] font-black uppercase tracking-widest text-foreground bg-foreground/10 px-3 py-1.5 rounded-lg hover:bg-foreground/20 transition-colors"
              >
                ดาวน์โหลด CSV
              </button>
            )}
            <div className="h-6 w-px bg-foreground/10 mx-1 hidden sm:block" />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h2 className="text-4xl font-black mb-3 tracking-tighter">ลูกค้าที่สนใจ</h2>
          <p className="text-foreground/50 text-lg">รายชื่อลูกค้าที่กรอกข้อมูลติดต่อจากหน้าโปรไฟล์ของคุณ</p>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-foreground/5 rounded-[24px] animate-pulse" />
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-32 bg-foreground/5 border-2 border-dashed border-foreground/10 rounded-[40px] glass-card">
            <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-8">
               <Mail size={40} className="text-foreground/10" />
            </div>
            <h3 className="text-2xl font-black text-foreground/40 mb-3 tracking-tight">ยังไม่มีข้อมูลติดต่อกลับ</h3>
            <p className="text-foreground/20 font-medium max-w-sm mx-auto">ลองแชร์โปรไฟล์ของคุณไปที่โซเชียลต่างๆ เพื่อเริ่มเก็บข้อมูลลูกค้าที่สนใจ</p>
          </div>
        ) : (
          <div className="space-y-6">
            {leads.map((lead) => (
              <div 
                key={lead.id}
                onClick={() => !lead.is_read && markAsRead(lead.id)}
                className={`group relative bg-card-bg border ${lead.is_read ? 'border-foreground/5' : 'border-primary/30'} p-8 rounded-[32px] transition-all hover:bg-foreground/[0.02] cursor-pointer hover:border-primary/20 hover:-translate-y-1 shadow-xl hover:shadow-primary/5 active:scale-[0.99] glass-card`}
              >
                {!lead.is_read && (
                  <div className="absolute top-8 left-3 w-2 h-2 bg-primary rounded-full shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] animate-pulse" />
                )}
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                  <div className="flex items-start gap-6">
                     <div className="w-16 h-16 rounded-[20px] bg-foreground/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-inner">
                        <UserIcon name={lead.name} />
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <h4 className="font-black text-2xl tracking-tight">{lead.name}</h4>
                          {lead.is_read && <CheckCircle size={18} className="text-primary opacity-50" />}
                        </div>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                           <span className="flex items-center gap-2 text-foreground/50 font-medium hover:text-foreground transition-colors"><Mail size={14} className="text-primary/50" /> {lead.email}</span>
                           <span className="flex items-center gap-2 text-foreground/50 font-medium hover:text-foreground transition-colors"><Phone size={14} className="text-primary/50" /> {lead.phone}</span>
                           {lead.occupation && (
                             <span className="flex items-center gap-2 text-primary font-bold bg-primary/10 px-3 py-1 rounded-lg"><Briefcase size={14} /> {lead.occupation}</span>
                           )}
                        </div>
                     </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                     <div className="flex items-center gap-2 text-[10px] font-black text-foreground/30 uppercase tracking-[0.15em] bg-foreground/5 px-4 py-2 rounded-xl">
                        <Calendar size={12} /> {new Date(lead.created_at).toLocaleDateString('th-TH', { 
                          day: 'numeric', month: 'long', year: 'numeric'
                        })}
                     </div>
                     {lead.source_type === 'landing_page' ? (
                       <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase tracking-widest bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                         Landing: {lead.source_url || 'Unknown'}
                       </div>
                     ) : (
                       <div className="flex items-center gap-2 text-[9px] font-black text-foreground/40 uppercase tracking-widest bg-foreground/5 px-3 py-1.5 rounded-lg border border-foreground/10">
                         Source: Profile
                       </div>
                     )}
                  </div>
                </div>

                {lead.message && (
                  <div className="mt-8 pt-8 border-t border-foreground/5">
                    <div className="text-[10px] font-black uppercase tracking-widest text-foreground/20 mb-3 ml-1">ข้อความจากลูกค้า:</div>
                    <p className="text-foreground/60 text-base leading-relaxed italic bg-foreground/[0.02] p-6 rounded-2xl border border-foreground/5">
                      "{lead.message}"
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
    'bg-blue-500', 'bg-emerald-500', 'bg-indigo-500', 
    'bg-purple-500', 'bg-rose-500', 'bg-amber-500'
  ];
  const colorIndex = name.length % colors.length;
  return (
    <div className={`w-full h-full rounded-[18px] flex items-center justify-center text-white font-black text-2xl ${colors[colorIndex]} shadow-lg`}>
       {initial}
    </div>
  );
}
