import { Loader2, Sparkles } from 'lucide-react';

export default function ManageLoading() {
  return (
    <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A] flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-[32px] border border-[#D9E1F2] bg-white/90 backdrop-blur-xl shadow-[0_30px_80px_-45px_rgba(15,23,42,0.3)] p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#050579]">
          <Loader2 size={30} className="animate-spin" />
        </div>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#E2E8F0] bg-[#F8FAFF] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#64748B]">
          <Sparkles size={12} />
          NEX Workspace
        </div>
        <h1 className="text-2xl font-black tracking-tight text-[#050579]">
          กำลังเตรียมหน้าจัดการ
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-[#475569]">
          โปรดรอสักครู่ ระบบกำลังโหลดข้อมูลและเครื่องมือที่คุณต้องใช้
        </p>
      </div>
    </div>
  );
}
