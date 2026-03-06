"use client";

import { useState, useEffect } from 'react';
import { Send, CheckCircle2, ChevronDown, MessageSquare, EyeOff, Loader2 } from 'lucide-react';
import Cookies from 'js-cookie';

interface LeadFormProps {
  targetUid: string;
}

export function LeadForm({ targetUid }: LeadFormProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    occupation: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  useEffect(() => {
    const myUid = Cookies.get('uid');
    // Check if the current user is the owner of the profile
    if (myUid && myUid === targetUid) {
      setIsOwner(true);
    }
  }, [targetUid]);

  const handleHideForm = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent accordion toggle
    if (!confirm('คุณต้องการซ่อนฟอร์มนี้จากหน้าโปรไฟล์ใช่หรือไม่?\n(คุณสามารถเปิดใหม่ได้ที่เมนู "แก้ไขนามบัตร")')) return;

    setIsHiding(true);
    try {
      const token = Cookies.get('token');
      if (!token) return;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

      // 1. Get current profile to preserve other settings
      const meRes = await fetch(`${apiUrl}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!meRes.ok) throw new Error('Failed to fetch profile');
      const meData = await meRes.json();

      const newLayoutConfig = {
        ...(meData.layout_config || {}),
        show_lead_form: false
      };

      // 2. Update profile
      const updateRes = await fetch(`${apiUrl}/profile/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ layout_config: newLayoutConfig })
      });

      if (updateRes.ok) {
        window.location.reload();
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการซ่อนฟอร์ม โปรดลองใหม่อีกครั้ง');
      setIsHiding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/contact/${targetUid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pdpa_consent: true,
          source_type: 'profile',
          source_url: window.location.pathname,
        }),
      });

      if (res.ok) {
        setStatus('success');
        setFormData({ name: '', email: '', phone: '', occupation: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={32} className="text-white" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">ส่งข้อมูลสำเร็จ!</h3>
        <p className="text-emerald-400/80 text-sm">เราได้รับข้อมูลของคุณแล้ว และจะติดต่อกลับโดยเร็วที่สุด</p>
        <button 
          onClick={() => setStatus('idle')}
          className="mt-6 text-sm text-emerald-500 hover:text-emerald-400 font-medium transition-colors"
        >
          ส่งข้อความอีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-3xl overflow-hidden transition-all duration-300 shadow-2xl">
      {/* Header / Toggle */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 md:p-8 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5"
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors shadow-lg ${isExpanded ? 'bg-primary text-white shadow-primary/30' : 'bg-white/10 text-white shadow-black/20'}`}>
            <MessageSquare size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white drop-shadow-md tracking-tight">ฝากข้อมูลติดต่อกลับ</h3>
            <p className="text-sm text-white/70 font-medium">สอบถามข้อมูลเพิ่มเติมหรือสนใจร่วมงาน</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Owner Hide Button */}
          {isOwner && (
            <button
              onClick={handleHideForm}
              disabled={isHiding}
              className="p-3 rounded-full hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors tooltip tooltip-left z-10"
              title="ซ่อนฟอร์มนี้ (เฉพาะเจ้าของ)"
            >
              {isHiding ? <Loader2 className="animate-spin" size={20} /> : <EyeOff size={20} />}
            </button>
          )}
          
          <div className={`transition-transform duration-300 p-2 rounded-full bg-white/5 ${isExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown size={24} className="text-white" />
          </div>
        </div>
      </div>

      {/* Form Content - Expandable */}
      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[800px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <form onSubmit={handleSubmit} className="p-6 md:p-8 pt-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-white drop-shadow-sm uppercase tracking-wider ml-1">
                ชื่อ-นามสกุล <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-black/80 border border-white/30 rounded-2xl px-5 py-4 text-base text-white font-medium placeholder:text-white/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all shadow-inner backdrop-blur-sm"
                placeholder="สมชาย ใจดี"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-white drop-shadow-sm uppercase tracking-wider ml-1">
                อาชีพ / บริษัท
              </label>
              <input
                type="text"
                value={formData.occupation}
                onChange={e => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
                className="w-full bg-black/80 border border-white/30 rounded-2xl px-5 py-4 text-base text-white font-medium placeholder:text-white/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all shadow-inner backdrop-blur-sm"
                placeholder="CEO @ Company"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-white drop-shadow-sm uppercase tracking-wider ml-1">
                อีเมล <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="email"
                value={formData.email}
                onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-black/80 border border-white/30 rounded-2xl px-5 py-4 text-base text-white font-medium placeholder:text-white/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all shadow-inner backdrop-blur-sm"
                placeholder="example@mail.com"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-bold text-white drop-shadow-sm uppercase tracking-wider ml-1">
                เบอร์โทรศัพท์ <span className="text-red-400">*</span>
              </label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                className="w-full bg-black/80 border border-white/30 rounded-2xl px-5 py-4 text-base text-white font-medium placeholder:text-white/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all shadow-inner backdrop-blur-sm"
                placeholder="081-XXX-XXXX"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-bold text-white drop-shadow-sm uppercase tracking-wider ml-1">
              ข้อความเพิ่มเติม
            </label>
            <textarea
              rows={4}
              value={formData.message}
              onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
              className="w-full bg-black/80 border border-white/30 rounded-2xl px-5 py-4 text-base text-white font-medium placeholder:text-white/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all resize-none shadow-inner backdrop-blur-sm min-h-[120px]"
              placeholder="ระบุรายละเอียดที่ต้องการสอบถาม..."
            />
          </div>

          <button
            type="submit"
            disabled={status === 'submitting'}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:to-primary text-white font-black text-lg py-5 rounded-2xl transition-all flex items-center justify-center gap-3 group disabled:opacity-50 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            {status === 'submitting' ? (
              <>
                <Loader2 size={24} className="animate-spin" />
                กำลังส่งข้อมูล...
              </>
            ) : (
              <>
                ส่งข้อมูลติดต่อกลับ <Send size={24} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
          </button>

          <p className="mt-4 text-xs text-white/50 text-center font-medium">
            * การส่งข้อมูลนี้ถือว่าคุณยอมรับนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)
          </p>
        </form>
      </div>
    </div>
  );
}
