'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Loader2,
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  User,
  Smartphone
} from 'lucide-react';

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [fromCard, setFromCard] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const validations = [
    { label: 'ความยาวอย่างน้อย 4 ตัวอักษร', isValid: password.length >= 4 },
    { label: 'ใช้ได้เฉพาะตัวอักษรอังกฤษหรือตัวเลข (A-Z, a-z, 0-9)', isValid: /^[A-Za-z0-9]*$/.test(password) },
  ];

  const isPasswordValid = validations.every(v => v.isValid);

  useEffect(() => {
    const ref = searchParams.get('ref');
    if (ref) setReferralCode(ref);
    // Where the visitor came from (the card they were viewing) — validate as an
    // internal "prefix/uid" path to avoid open-redirect via a crafted `from` param.
    const from = searchParams.get('from');
    if (from && /^[A-Za-z0-9_-]+\/[A-Za-z0-9_-]+$/.test(from)) setFromCard(from);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email && !phoneNumber) return setError('กรุณากรอกอีเมลหรือเบอร์โทรศัพท์อย่างใดอย่างหนึ่ง');
    if (phoneNumber && !/^[0-9+\-\s()]+$/.test(phoneNumber)) return setError('รูปแบบเบอร์โทรศัพท์ไม่ถูกต้อง');
    if (!password || !fullName) return setError('กรุณากรอกข้อมูลให้ครบถ้วน');
    if (!isPasswordValid) return setError('กรุณากรอกรหัสผ่านให้ตรงตามเงื่อนไขที่กำหนด');
    if (password !== confirmPassword) return setError('รหัสผ่านไม่ตรงกัน');

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          email: email || undefined, 
          password, 
          fullName,
          phoneNumber: phoneNumber || undefined,
          referralCode: referralCode || undefined 
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'การลงทะเบียนล้มเหลว');
      
      // Successfully registered and logged in (via cookies)
      router.push('/manage/control');
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook' | 'line') => {
    const url = referralCode 
      ? `${API_URL}/auth/${provider}?ref=${referralCode}`
      : `${API_URL}/auth/${provider}`;
    window.location.href = url;
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#EEF0FF] text-[#0F172A] flex items-center justify-center p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.12),transparent_30%),linear-gradient(180deg,#f6f8ff_0%,#eef0ff_100%)]" />
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link
            href={fromCard ? `/${fromCard}` : '/login'}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#64748B] transition-colors hover:text-[#050579]"
          >
            <ArrowLeft size={16} /> {fromCard ? 'กลับไปหน้านามบัตร' : 'กลับไปเข้าสู่ระบบ'}
          </Link>
        </div>
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 text-2xl font-black text-[#050579]">
            <div className="relative w-10 h-10 overflow-hidden rounded-xl bg-white p-1">
              <Image src="/nex_logo_nobg.png" alt="NEX" fill className="object-contain" unoptimized />
            </div>
            <span className="tracking-tighter">NEX SOLUTION<span className="text-[#F97316]">.</span></span>
          </Link>
        </div>

        <div className="bg-white border border-[#D9E1F2] rounded-[32px] p-8 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)]">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black mb-2 text-[#050579]">สมัครสมาชิกใหม่</h1>
          </div>

          {referralCode && (
            <div className="bg-[#FFF7ED] border border-[#FDBA74] rounded-2xl p-4 mb-6 flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-xs font-bold text-[#C2410C] uppercase tracking-widest">ผู้แนะนำ: {referralCode}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600 text-xs font-bold">
                ⚠️ {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-4">
              {/* Full Name */}
              <div className="relative">
                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  className="w-full bg-white border border-[#D9E1F2] rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-[#050579] focus:ring-4 focus:ring-[#E8ECFF] transition-all placeholder:text-[#94A3B8]" 
                  placeholder="ชื่อ - นามสกุล" 
                  required
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  className="w-full bg-white border border-[#D9E1F2] rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-[#050579] focus:ring-4 focus:ring-[#E8ECFF] transition-all placeholder:text-[#94A3B8]" 
                  placeholder="อีเมล" 
                />
              </div>

              {/* Phone Number */}
              <div className="relative">
                <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input 
                  type="text" 
                  value={phoneNumber} 
                  onChange={(e) => setPhoneNumber(e.target.value)} 
                  className="w-full bg-white border border-[#D9E1F2] rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-[#050579] focus:ring-4 focus:ring-[#E8ECFF] transition-all placeholder:text-[#94A3B8]" 
                  placeholder="เบอร์โทรศัพท์" 
                />
              </div>
              <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider">กรอกอีเมลหรือเบอร์โทรศัพท์อย่างใดอย่างหนึ่ง</p>

              {/* Password */}
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="w-full bg-white border border-[#D9E1F2] rounded-2xl py-3.5 pl-12 pr-12 outline-none focus:border-[#050579] focus:ring-4 focus:ring-[#E8ECFF] transition-all placeholder:text-[#94A3B8]" 
                  placeholder="รหัสผ่าน" 
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#050579] transition-colors">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Password conditions */}
              <div className="px-1 py-1 grid grid-cols-1 gap-1.5 text-[10px] font-bold">
                {validations.map((v, i) => (
                  <div key={i} className={`flex items-center gap-2 transition-colors duration-300 ${v.isValid ? 'text-green-600' : 'text-[#94A3B8]'}`}>
                    {v.isValid ? <CheckCircle2 size={12} className="flex-shrink-0" /> : <Circle size={12} className="flex-shrink-0" />}
                    <span className="uppercase tracking-wider">{v.label}</span>
                  </div>
                ))}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B]" />
                <input 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  className="w-full bg-white border border-[#D9E1F2] rounded-2xl py-3.5 pl-12 pr-12 outline-none focus:border-[#050579] focus:ring-4 focus:ring-[#E8ECFF] transition-all placeholder:text-[#94A3B8]" 
                  placeholder="ยืนยันรหัสผ่านอีกครั้ง" 
                  required
                />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#050579] transition-colors">
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={loading || !isPasswordValid || password !== confirmPassword} 
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:grayscale"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : <>สร้างบัญชี <ArrowRight size={20} /></>}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-[#64748B]">
            มีบัญชีผู้ใช้อยู่แล้ว? <Link href="/login" className="text-[#050579] font-bold hover:underline">เข้าสู่ระบบ</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#EEF0FF] text-[#050579] flex items-center justify-center"><Loader2 size={32} className="animate-spin text-[#F97316]" /></div>}>
      <RegisterContent />
    </Suspense>
  );
}
