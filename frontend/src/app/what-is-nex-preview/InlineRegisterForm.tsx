'use client';

import { useState } from 'react';
import { Eye, EyeOff, Loader2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function InlineRegisterForm() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const validations = [
    { label: 'ความยาวอย่างน้อย 8 ตัวอักษร', isValid: password.length >= 8 },
    { label: 'มีตัวอักษรพิมพ์เล็ก (a-z)', isValid: /[a-z]/.test(password) },
    { label: 'มีตัวอักษรพิมพ์ใหญ่ (A-Z)', isValid: /[A-Z]/.test(password) },
    { label: 'มีตัวเลข (0-9)', isValid: /[0-9]/.test(password) },
    { label: 'มีสัญลักษณ์พิเศษ', isValid: /[\W_]/.test(password) },
  ];

  const isPasswordValid = validations.every(v => v.isValid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) return setError('กรุณากรอกอีเมลและรหัสผ่าน');
    if (!isPasswordValid) return setError('กรุณากรอกรหัสผ่านให้ตรงตามเงื่อนไขที่กำหนด');
    if (password !== confirmPassword) return setError('รหัสผ่านไม่ตรงกัน');

    setLoading(true);
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('ref') || undefined;

      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, referralCode }),
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
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('ref');
      const url = referralCode 
        ? `${API_URL}/auth/${provider}?ref=${referralCode}`
        : `${API_URL}/auth/${provider}`;
      window.location.href = url;
  };

  return (
    <div className="w-full flex justify-center bg-[#EEF0FF] px-4 py-8">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="w-full max-w-sm rounded-[24px] bg-[#F97316] py-5 px-6 text-center text-[17px] font-black text-white shadow-[0_8px_30px_rgb(249,115,22,0.3)] hover:scale-105 transition-transform"
        >
          เปิดฟอร์มสมัครสมาชิก
        </button>
      ) : (
        <div className="w-full max-w-md relative bg-white rounded-[32px] border border-[#D9E1F2] p-8 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.22)] animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <X size={20} />
          </button>

          <div className="text-center mb-8 pt-2">
            <h2 className="text-3xl font-black text-[#050579] mb-2 tracking-tight">สมัครสมาชิก</h2>
            <p className="text-[#64748B] text-[15px]">สร้างบัญชีใหม่เพื่อเริ่มใช้งาน</p>
          </div>

          <div className="space-y-4 mb-8">
            <button 
              onClick={() => handleSocialLogin('google')} 
              className="w-full py-4 px-4 bg-white border border-[#D9E1F2] rounded-[16px] font-bold text-[#0F172A] hover:bg-gray-50 transition-colors focus:ring-4 focus:ring-gray-100 flex items-center justify-center gap-2"
            >
              ดำเนินการด้วย Google
            </button>
            <button 
              onClick={() => handleSocialLogin('line')} 
              className="w-full py-4 px-4 bg-[#EEFBEF] border border-[#CFE9D6] rounded-[16px] font-bold text-[#16A34A] hover:bg-[#E2F7E4] transition-colors focus:ring-4 focus:ring-[#CFE9D6]/50 flex items-center justify-center gap-2"
            >
              ดำเนินการด้วย LINE
            </button>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="h-[2px] flex-1 bg-[#EEF0FF]"></div>
            <span className="text-[14px] font-bold text-[#94A3B8]">หรือ</span>
            <div className="h-[2px] flex-1 bg-[#EEF0FF]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="bg-red-500/10 border border-red-500/20 rounded-[16px] p-4 text-red-500 text-[14px] font-medium text-center">{error}</div>}
            
            <div className="relative">
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full border border-[#D9E1F2] rounded-[16px] py-4 px-5 text-[16px] outline-none focus:border-[#050579]/50 focus:ring-4 focus:ring-[#EEF0FF] transition-all placeholder:text-[#94A3B8]" 
                placeholder="อีเมล" 
              />
            </div>

            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full border border-[#D9E1F2] rounded-[16px] py-4 pl-5 pr-14 text-[16px] outline-none focus:border-[#050579]/50 focus:ring-4 focus:ring-[#EEF0FF] transition-all placeholder:text-[#94A3B8]" 
                placeholder="รหัสผ่าน" 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#050579] transition-colors"
              >
                {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>

            {password && (
              <div className="px-3 pt-1 grid grid-cols-1 gap-2 text-[12px] text-[#94A3B8] font-medium">
                {validations.map((v, i) => (
                  <div key={i} className={`flex items-center gap-2 transition-colors ${v.isValid ? 'text-green-500' : ''}`}>
                    <div className={`h-1.5 w-1.5 rounded-full ${v.isValid ? 'bg-green-500' : 'bg-[#D9E1F2]'}`} />
                    <span>{v.label}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="relative pt-1">
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className="w-full border border-[#D9E1F2] rounded-[16px] py-4 pl-5 pr-14 text-[16px] outline-none focus:border-[#050579]/50 focus:ring-4 focus:ring-[#EEF0FF] transition-all placeholder:text-[#94A3B8]" 
                placeholder="ยืนยันรหัสผ่าน" 
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
                className="absolute right-5 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#050579] transition-colors"
                style={{ marginTop: '2px' }}
              >
                {showConfirmPassword ? <EyeOff size={22} /> : <Eye size={22} />}
              </button>
            </div>
            
            <button 
              type="submit" 
              disabled={loading} 
              className="mt-4 w-full py-[18px] bg-[#F97316] text-white rounded-[16px] text-[18px] font-black tracking-tight hover:opacity-90 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:hover:scale-100 focus:ring-4 focus:ring-[#F97316]/20"
            >
              {loading ? <Loader2 size={24} className="animate-spin mx-auto" /> : 'สมัครสมาชิก'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
