'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Loader2, UserPlus, Mail, Lock, ArrowRight, Sparkles, Gift } from 'lucide-react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setReferralCode(ref);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) return setError('กรุณากรอกอีเมลและรหัสผ่าน');
    if (password !== confirmPassword) return setError('รหัสผ่านไม่ตรงกัน');
    if (password.length < 8) return setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, referralCode: referralCode || undefined }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'การลงทะเบียนล้มเหลว');
      router.push('/manage/control-center');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'line') => {
    window.location.href = `${API_URL}/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold">
            <div className="relative w-10 h-10 overflow-hidden rounded-lg">
              <Image src="/nex_logo_nobg.png" alt="NEX" fill className="object-contain" unoptimized />
            </div>
            <span style={{ color: "#050579" }}>NEX<span style={{ color: "#F97316" }}>.</span></span>
          </Link>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <UserPlus size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2">สมัครสมาชิก</h1>
            <p className="text-gray-400 text-sm">สร้างบัญชีใหม่เพื่อเริ่มใช้งาน</p>
          </div>

          {referralCode && <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6 text-sm">มีรหัสแนะนำ!</div>}

          <div className="space-y-3 mb-6">
            <button onClick={() => handleSocialLogin('google')} className="w-full py-3 px-4 bg-white/5 border border-white/10 rounded-xl">ดำเนินการด้วย Google</button>
            <button onClick={() => handleSocialLogin('line')} className="w-full py-3 px-4 bg-[#00B900]/10 border border-[#00B900]/20 rounded-xl text-[#00B900]">ดำเนินการด้วย LINE</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">{error}</div>}
            <div className="relative"><Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4" placeholder="your@email.com" /></div>
            <div className="relative"><Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" /><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4" placeholder="••••••••" /></div>
            <div className="relative"><Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" /><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4" placeholder="••••••••" /></div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-primary to-secondary rounded-xl font-bold flex items-center justify-center gap-2">{loading ? <Loader2 size={20} className="animate-spin" /> : <>สมัครสมาชิก<ArrowRight size={20} /></>}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center"><Loader2 size={32} className="animate-spin text-primary" /></div>}>
      <RegisterContent />
    </Suspense>
  );
}
