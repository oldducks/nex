"use client";

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

interface LeadFormProps {
  ownerId: number;
}

export function LeadForm({ ownerId }: LeadFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    occupation: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api'}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          owner_id: ownerId,
          ...formData,
          pdpa_consent: true,
          consent_timestamp: new Date().toISOString(),
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
    <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
         ฝากข้อมูลติดต่อกลับ
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-bold uppercase tracking-wider">ชื่อ-นามสกุล</label>
          <input
            required
            type="text"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
            placeholder="สมชาย ใจดี"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-bold uppercase tracking-wider">อาชีพ / บริษัท</label>
          <input
            type="text"
            value={formData.occupation}
            onChange={e => setFormData(prev => ({ ...prev, occupation: e.target.value }))}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
            placeholder="CEO @ Company"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-bold uppercase tracking-wider">อีเมล</label>
          <input
            required
            type="email"
            value={formData.email}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
            placeholder="example@mail.com"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1.5 font-bold uppercase tracking-wider">เบอร์โทรศัพท์</label>
          <input
            required
            type="tel"
            value={formData.phone}
            onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors"
            placeholder="081-XXX-XXXX"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-xs text-gray-500 mb-1.5 font-bold uppercase tracking-wider">ข้อความเพิ่มเติม</label>
        <textarea
          rows={3}
          value={formData.message}
          onChange={e => setFormData(prev => ({ ...prev, message: e.target.value }))}
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-colors resize-none"
          placeholder="ระบุรายละเอียดที่ต้องการสอบถาม..."
        />
      </div>

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="w-full bg-primary hover:bg-primary-light text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
      >
        {status === 'submitting' ? (
          'กำลังส่งข้อมูล...'
        ) : (
          <>
            ส่งข้อมูลติดต่อกลับ <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
          </>
        )}
      </button>

      <p className="mt-4 text-[10px] text-gray-500 text-center">
        * การส่งข้อมูลนี้ถือว่าคุณยอมรับนโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)
      </p>
    </form>
  );
}
