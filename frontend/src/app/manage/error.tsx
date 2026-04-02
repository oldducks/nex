"use client";

import { AlertTriangle, RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

export default function ManageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Manage route error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A] flex items-center justify-center px-6">
      <div className="w-full max-w-lg rounded-[32px] border border-[#FECACA] bg-white shadow-[0_30px_80px_-45px_rgba(15,23,42,0.3)] p-8">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#DC2626]">
          <AlertTriangle size={30} />
        </div>

        <div className="mb-3 inline-flex rounded-full border border-[#FECACA] bg-[#FEF2F2] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#B91C1C]">
          Manage Error
        </div>

        <h1 className="text-2xl font-black tracking-tight text-[#991B1B]">
          หน้านี้มีปัญหาระหว่างโหลดข้อมูล
        </h1>
        <p className="mt-3 text-sm font-medium leading-relaxed text-[#7F1D1D]">
          คุณสามารถลองโหลดใหม่ได้ทันที หรือกลับไปที่ศูนย์ควบคุมก่อนแล้วค่อยเข้ามาอีกครั้ง
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#050579] px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#07079A]"
          >
            <RefreshCw size={16} />
            ลองใหม่
          </button>
          <Link
            href="/manage/control-center"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] px-5 py-3 text-sm font-black text-[#0F172A] transition-colors hover:bg-white"
          >
            <ArrowLeft size={16} />
            กลับไปหน้าเมนู
          </Link>
        </div>

        {error?.digest ? (
          <p className="mt-6 text-xs text-[#94A3B8]">Ref: {error.digest}</p>
        ) : null}
      </div>
    </div>
  );
}
