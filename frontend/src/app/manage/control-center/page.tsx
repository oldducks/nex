"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { 
  LogOut, Globe, BookOpen, CreditCard, ArrowRight, 
  Users, BarChart3, ShieldCheck, Mail, Sparkles,
  Smartphone, UserCircle, QrCode, Layout, Video, Image as ImageIcon, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/ThemeToggle';

interface UserData {
  id: number;
  email: string;
  role: string;
  subscription_tier: string;
  max_cards: number;
  expiration_date: string;
  uid: string;
}

const FEATURE_LIST = [
  {
    id: 'landing',
    title: 'แก้ไขนามบัตรดิจิทัล',
    description: 'จัดการ Profile นามบัตรดิจิทัล แก้ไขข้อมูลแบบ Real-time เพิ่มลิงก์โซเชียล และธีมส่วนตัว',
    icon: Smartphone,
    href: '/manage/profile',
    gradient: 'from-blue-500 to-indigo-600',
    tags: ['Real-time', 'ธีม', 'vCard']
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
    id: 'catalog',
    title: 'แคตตาล็อกสินค้า',
    description: 'สร้างแคตตาล็อกสินค้าออนไลน์ และเลือกรูปแบบการแสดงผลแบบพรีเมียม เพื่อส่งต่อให้ลูกค้า',
    icon: BookOpen,
    href: '/manage',
    gradient: 'from-orange-500 to-rose-600',
    tags: ['PDF Book', 'แคตตาล็อก']
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
    id: 'landing-pages',
    title: 'หน้าเซลล์เพจ (Landing Pages)',
    description: 'สร้างหน้าแคมเปญการตลาดแบบครบวงจร รองรับระบบลากวาง (Drag & Drop) และฟอร์มโต้ตอบ',
    icon: Layout,
    href: '/manage/landing-pages',
    gradient: 'from-fuchsia-600 to-rose-500',
    tags: ['แคมเปญ', 'ลากวาง']
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
];

export default function ControlCenterPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get('token');

  useEffect(() => {
    if (!token) {
      router.push('/login');
      return;
    }

    fetch('/api/users/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token, router]);

  const handleLogout = () => {
    Cookies.remove('token');
    Cookies.remove('uid');
    router.push('/login');
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500 selection:bg-primary/30">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -z-10 animate-pulse opacity-50" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[120px] -z-10 opacity-50" />

      {/* Navbar */}
      <nav className="border-b border-foreground/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-primary to-secondary rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
              <Sparkles size={18} className="text-white" />
            </div>
            NAMECARD<span className="text-primary">.AI</span>
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
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        
        {/* User Summary Header */}
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8 mb-20 px-2">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                user?.subscription_tier === 'premium' 
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' 
                : 'bg-primary/10 text-primary border border-primary/20'
              }`}>
                {user?.subscription_tier || 'Free'} Plan
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-foreground/10" />
              <span className="text-foreground/40 text-sm font-medium">{user?.email}</span>
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[0.9]">
              ยินดีต้อนรับกลับมา,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-secondary animate-gradient-x p-1">
                ศูนย์ควบคุมของคุณ
              </span>
            </h1>
            <p className="text-foreground/50 max-w-lg text-lg leading-relaxed">
              จัดการนามบัตรดิจิทัล แคตตาล็อกสินค้า และดูข้อมูลลูกค้าที่รวบรวมได้จากที่นี่ที่เดียว
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-[24px] flex items-center gap-5 min-w-[200px] hover:border-primary/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Smartphone size={28} className="text-primary" />
              </div>
              <div>
                <div className="text-[10px] text-foreground/30 uppercase font-black tracking-widest mb-1">บัตรของฉัน</div>
                <div className="text-2xl font-black tabular-nums">1 / {user?.max_cards || 1}</div>
              </div>
            </div>
            <div className="bg-foreground/5 border border-foreground/10 p-6 rounded-[24px] flex items-center gap-5 min-w-[200px] hover:border-secondary/30 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users size={28} className="text-secondary" />
              </div>
              <div>
                <div className="text-[10px] text-foreground/30 uppercase font-black tracking-widest mb-1">รายชื่อลูกค้า</div>
                <div className="text-2xl font-black tabular-nums">--</div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURE_LIST.map((feature) => (
            <Link
              key={feature.id}
              href={feature.href}
              className="group relative bg-card-bg border border-foreground/5 p-10 rounded-[40px] overflow-hidden
                         hover:border-primary/30 transition-all duration-500 hover:-translate-y-3 shadow-2xl hover:shadow-primary/5 active:scale-[0.98] glass-card"
            >
              {/* Feature Icon */}
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl 
                                bg-gradient-to-br ${feature.gradient} mb-10 shadow-2xl group-hover:scale-110 transition-transform duration-500`}>
                <feature.icon size={36} className="text-white" />
              </div>

              {/* Tags */}
              <div className="flex gap-2 mb-6">
                {feature.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 rounded-lg bg-foreground/5 text-[10px] text-foreground/40 font-black uppercase tracking-widest">
                    {tag}
                  </span>
                ))}
              </div>

              <h2 className="text-3xl font-black mb-4 group-hover:text-primary transition-colors tracking-tight">
                {feature.title}
              </h2>
              <p className="text-foreground/50 text-base leading-relaxed mb-10 group-hover:text-foreground/70 transition-colors">
                {feature.description}
              </p>

              <div className="flex items-center gap-3 text-foreground text-sm font-black opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-4 group-hover:translate-x-0 uppercase tracking-widest">
                เริ่มเข้าใช้งาน <ArrowRight size={20} className="text-primary" />
              </div>

              {/* Decorative accent */}
              <div className={`absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-[80px] transition-opacity duration-700`} />
            </Link>
          ))}

          {/* Upgrade Card */}
          <div className="group relative bg-foreground text-background border border-foreground/10 p-10 rounded-[40px] overflow-hidden flex flex-col justify-center text-center shadow-2xl shadow-foreground/5">
             <div className="mb-8 flex justify-center">
               <div className="w-20 h-20 rounded-full bg-background/10 flex items-center justify-center border border-background/20 group-hover:rotate-12 transition-transform">
                 <Sparkles size={40} className="text-primary" />
               </div>
             </div>
             <h3 className="text-2xl font-black mb-3 uppercase tracking-tighter">Premium Upgrade</h3>
             <p className="text-background/60 text-sm mb-10 px-4 leading-relaxed">ปลดล็อกการสร้างแคตตาล็อกไม่จำกัด และลบลายน้ำบนโปรไฟล์ของคุณ</p>
             <button className="w-full py-5 bg-primary text-white rounded-[20px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20">
               Upgrade Now
             </button>
          </div>
        </div>

        {/* Status Section */}
        <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-10 px-2">
           <div className="p-10 rounded-[40px] bg-foreground/5 border border-foreground/10 hover:border-primary/20 transition-colors group">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tight">
                <Smartphone size={24} className="text-primary" /> Quick Share
              </h3>
              <div className="flex flex-col lg:flex-row gap-8 mt-4">
                  <div className="flex-grow space-y-4">
                    <div className="text-xs text-foreground/30 font-black uppercase tracking-widest ml-1">โปรไฟล์สาธารณะของคุณ</div>
                    <div className="p-5 rounded-2xl bg-foreground/5 border border-foreground/5 font-mono text-sm text-primary flex items-center justify-between group-hover:bg-foreground/10 transition-colors">
                       <span className="truncate mr-4">{user ? `namecard.dpattown.com/${user.uid}` : 'กำลังโหลด...'}</span>
                       <Link href={user ? `/p/${user.uid}` : '#'} className="text-[10px] font-black uppercase tracking-widest bg-foreground text-background whitespace-nowrap px-4 py-2 rounded-xl hover:opacity-90 transition-all active:scale-95">
                         Go Public
                       </Link>
                    </div>
                  </div>
                  <div className="w-32 h-32 bg-white p-3 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform shrink-0 self-center">
                     <QrCode size={100} className="text-black" />
                  </div>
              </div>
           </div>

           <div className="p-10 rounded-[40px] bg-foreground/5 border border-foreground/10 hover:border-secondary/20 transition-colors group">
              <h3 className="text-xl font-black mb-8 flex items-center gap-3 tracking-tight">
                <BarChart3 size={24} className="text-secondary" /> Activity Snap
              </h3>
              <div className="grid grid-cols-2 gap-6">
                 <div className="p-6 rounded-[24px] bg-foreground/5 border border-foreground/5 text-center group-hover:bg-foreground/10 transition-colors">
                    <div className="text-3xl font-black text-foreground tabular-nums">0</div>
                    <div className="text-[10px] text-foreground/30 uppercase font-black tracking-widest mt-2">Today Views</div>
                 </div>
                 <div className="p-6 rounded-[24px] bg-foreground/5 border border-foreground/5 text-center group-hover:bg-foreground/10 transition-colors">
                    <div className="text-3xl font-black text-foreground tabular-nums">0</div>
                    <div className="text-[10px] text-foreground/30 uppercase font-black tracking-widest mt-2">Leads Recieved</div>
                 </div>
              </div>
              <Link href="/manage/dashboard" className="block w-full text-center mt-10 text-xs font-black uppercase tracking-widest text-foreground/30 hover:text-primary transition-all underline underline-offset-8 decoration-foreground/10 hover:decoration-primary/30">
                View Full Analytics Report
              </Link>
           </div>
        </div>

      </main>

      <style jsx global>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
      `}</style>
    </div>
  );
}
