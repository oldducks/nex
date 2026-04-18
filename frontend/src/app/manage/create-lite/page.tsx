"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

export default function CreateLitePage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-[#EEF0FF] pb-20 font-sans text-[#0F172A]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_32%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.34),transparent_40%)]" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-[#D9E1F2] bg-white/85 backdrop-blur-md">
        <div className="relative mx-auto flex h-24 w-full max-w-md items-center px-4 md:max-w-2xl">
          <Link
            href="/manage/control-center"
            className="absolute left-6 flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-[#F6F8FF] group"
            title="ย้อนกลับ"
          >
            <ArrowLeft size={20} className="text-[#64748B] transition-all group-hover:text-[#050579]" />
          </Link>

          <div className="mx-auto flex min-w-0 flex-col items-center text-center">
            <div className="mb-0.5 text-[11px] font-black uppercase leading-none tracking-[0.18em] text-[#94A3B8]">
              NEX CREATE LITE
            </div>
            <div className="text-base font-black text-[#050579]">
              สร้างงานกราฟิกของคุณ
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto mt-6 w-full max-w-md px-4 pb-8 md:max-w-2xl">
        <div className="mb-8 flex justify-center">
          <button
            type="button"
            onClick={() => router.push("/manage/create-lite-v2")}
            className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#F97316] px-7 py-4 text-lg font-black text-white shadow-[0_20px_45px_-20px_rgba(249,115,22,0.85)] transition-all hover:bg-[#EA580C] active:scale-95"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/18 ring-1 ring-white/22">
              <Plus size={22} strokeWidth={3} />
            </span>
            <span>สร้างงานใหม่</span>
          </button>
        </div>
      </main>
    </div>
  );
}
