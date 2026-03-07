"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Loader2, X } from 'lucide-react';

const quickActions = [
  { label: 'เข้าสู่ระบบ', href: '/login', primary: true, isLoginModal: true },
  { label: 'NEX คืออะไร', href: 'https://nexsolution.cloud/what-is-nex' },
  { label: 'สมัครสมาชิกเป็น NEX Digital Agent', href: 'https://nexsolution.cloud/register' },
  { label: 'โซลูชันสำหรับองค์กร', href: 'https://nexsolution.cloud/manage' },
];


export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsLoginModalOpen(false);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  const handleSocialLogin = (provider: 'google' | 'line') => {
    window.location.href = `${apiUrl}/auth/${provider}`;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError('');

    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(loginData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'เข้าสู่ระบบไม่สำเร็จ');


      if (data.must_change_password) {
        window.location.href = '/force-change-password';
        return;
      }
      window.location.href = '/manage/control-center';
    } catch (error: any) {
      setLoginError(error?.message || 'เข้าสู่ระบบไม่สำเร็จ');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030818] text-[#f6f2ea]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(0,210,255,0.18),transparent_38%),radial-gradient(circle_at_86%_16%,rgba(253,187,45,0.14),transparent_40%),radial-gradient(circle_at_50%_95%,rgba(58,123,213,0.12),transparent_44%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(3,8,24,0.98)_0%,rgba(9,17,42,0.95)_45%,rgba(6,12,32,0.98)_100%)]" />
      </div>

      <div className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-cyan-400/10 blur-[90px]" />
      <div className="pointer-events-none absolute -right-24 top-40 h-72 w-72 rounded-full bg-amber-200/5 blur-[95px]" />

      <div className="relative mx-auto w-full max-w-6xl px-6 pt-4 pb-4 sm:pt-6 sm:pb-6">
        <header className="mb-4 flex justify-center sm:mb-5">
          <div className="relative h-[448px] w-full max-w-[1280px] sm:h-[640px]">
            <Image
              src="/nex_logo_nobg.png"
              alt="NEX Solution"
              fill
              className="object-contain drop-shadow-[0_20px_50px_rgba(0,210,255,0.3)]"
              priority
              unoptimized
            />
          </div>
        </header>

        <section className="mx-auto mb-6 max-w-4xl text-center sm:mb-8">
          <p className="mb-4 inline-flex items-center rounded-full border border-cyan-400/30 bg-cyan-400/5 px-6 py-2 text-[10px] font-black tracking-[0.3em] text-cyan-200 uppercase sm:text-xs font-display">
            NEX PREMIUM DIGITAL AGENT PLATFORM
          </p>
          <h1 className="text-4xl font-black leading-[1.1] text-white sm:text-6xl font-display">
            สร้างตัวตนทางธุรกิจที่แข็งแกร่ง
            <span className="block mt-2 bg-gradient-to-r from-cyan-400 via-blue-200 to-amber-200 bg-clip-text text-transparent">
              ด้วยเครื่องมือดิจิทัลที่ใช้งานง่าย
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-relaxed text-[#f3e8d2]/90 sm:text-base">
            แพลตฟอร์มดิจิทัลที่ช่วยให้ธุรกิจของคุณสร้างความน่าเชื่อถือและเพิ่มยอดขาย
            ด้วยนามบัตรดิจิทัล แคตตาล็อกสินค้า หน้าแคมเปญ และระบบวิเคราะห์ที่ใช้งานได้จริง
          </p>
        </section>


        <section className="mx-auto mb-12 max-w-2xl space-y-5">
          {quickActions.map((item) => (
            <div key={item.label} className="w-full">
              {item.isLoginModal ? (
                <button
                  type="button"
                  onClick={() => setIsLoginModalOpen(true)}
                  className={`group relative w-full overflow-hidden rounded-2xl border px-8 py-4.5 text-center text-base font-black transition-all duration-500 hover:scale-[1.02] active:scale-95 sm:text-lg font-display ${
                    item.primary
                      ? 'border-cyan-400/50 bg-[linear-gradient(90deg,#00d2ff_0%,#3a7bd5_50%,#fdbb2d_100%)] bg-[length:200%_auto] bg-left text-[#030818] shadow-[0_20px_40px_-10px_rgba(0,210,255,0.4)] hover:bg-right'
                      : 'border-white/10 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                </button>
              ) : (
                <a
                  href={item.href}
                  className={`group relative block w-full overflow-hidden rounded-2xl border px-8 py-4.5 text-center text-base font-black transition-all duration-500 hover:scale-[1.02] active:scale-95 sm:text-lg font-display ${
                    item.primary
                      ? 'border-cyan-400/50 bg-[linear-gradient(90deg,#00d2ff_0%,#3a7bd5_50%,#fdbb2d_100%)] bg-[length:200%_auto] bg-left text-[#030818] shadow-[0_20px_40px_-10px_rgba(0,210,255,0.4)] hover:bg-right'
                      : 'border-white/10 bg-white/5 text-white backdrop-blur-md hover:bg-white/10 hover:border-white/20'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                </a>
              )}
            </div>
          ))}
        </section>

      </div>

      {isLoginModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 px-4 backdrop-blur-md"
          onClick={() => setIsLoginModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-[28px] border border-amber-100/35 bg-[linear-gradient(180deg,rgba(24,14,36,0.97)_0%,rgba(15,10,28,0.97)_100%)] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.68)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-cyan-100/35 bg-black/50 text-white hover:bg-black/70"
            >
              <X size={16} />
            </button>

            <div className="mb-5 text-center">
              <h3 className="text-3xl font-black text-cyan-50">เข้าสู่ระบบ</h3>
              <p className="mt-1 text-sm text-blue-100/75">ยินดีต้อนรับกลับสู่ NEX Platform</p>
            </div>

            {loginError && (
              <div className="mb-4 rounded-xl border border-red-300/40 bg-red-500/15 px-3 py-2 text-center text-sm text-red-100">
                {loginError}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="w-full rounded-xl border border-cyan-100/30 bg-white/10 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/15"
              >
                ดำเนินการด้วย Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin('line')}
                className="w-full rounded-xl border border-emerald-200/35 bg-emerald-500/20 px-4 py-3 text-sm font-bold text-emerald-100 transition hover:bg-emerald-500/25"
              >
                ดำเนินการด้วย LINE
              </button>
            </div>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-cyan-100/25" />
              <span className="text-xs font-bold uppercase tracking-widest text-cyan-100/50">หรือ</span>
              <div className="h-px flex-1 bg-cyan-100/25" />
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={loginData.email}
                onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-xl border border-cyan-100/30 bg-white/10 px-4 py-3 text-white placeholder:text-cyan-100/40 focus:outline-none focus:ring-2 focus:ring-cyan-200/30"
                placeholder="อีเมล"
              />
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-xl border border-cyan-100/30 bg-white/10 px-4 py-3 pr-11 text-white placeholder:text-cyan-100/40 focus:outline-none focus:ring-2 focus:ring-cyan-200/30"
                  placeholder="รหัสผ่าน"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-cyan-100/60 hover:text-cyan-50"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full rounded-xl border border-cyan-200/55 bg-[linear-gradient(90deg,rgba(20,200,212,0.9)_0%,rgba(250,204,21,0.85)_55%,rgba(20,200,212,0.9)_100%)] px-4 py-3 text-base font-black text-[#07263d] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    กำลังเข้าสู่ระบบ...
                  </span>
                ) : (
                  'เข้าสู่ระบบ'
                )}
              </button>
            </form>

            <div className="mt-4 text-center text-sm">
              <a href="/forgot-password" className="text-cyan-200 hover:text-cyan-100">
                ลืมรหัสผ่านใช่หรือไม่?
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
