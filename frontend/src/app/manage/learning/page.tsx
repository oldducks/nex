"use client";

import ManageTopBar from "@/components/ManageTopBar";
import { Hammer, Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LearningCenterPage() {
  return (
    <div className="min-h-screen bg-[#EEF0FF] selection:bg-[#F97316]/20">
      <ManageTopBar 
        backHref="/manage/control" 
        title="Nex Center" 
        subtitle="ศูนย์การเรียนรู้"
      />

      <main className="mx-auto max-w-4xl px-6 py-20 md:py-32">
        <div className="relative overflow-hidden rounded-[48px] border border-white bg-white/60 p-12 text-center shadow-[0_45px_100px_-40px_rgba(15,23,42,0.15)] backdrop-blur-xl md:p-20">
          <div className="relative z-10">
            <div className="mx-auto mb-10 flex h-28 w-28 items-center justify-center rounded-[38px] bg-white shadow-[0_20px_45px_-15px_rgba(15,23,42,0.1)] transition-transform hover:scale-105 duration-500">
               <div className="relative">
                  <Hammer size={52} className="text-[#F97316] animate-bounce duration-[2000s]" />
                  <Sparkles size={24} className="absolute -top-4 -right-4 text-[#050579] animate-pulse" />
               </div>
            </div>

            <h1 className="mb-6 text-4xl font-black tracking-tight text-[#050579] md:text-5xl">Coming Soon</h1>
            <p className="mx-auto mb-12 max-w-lg text-lg font-bold leading-relaxed text-[#475569] md:text-xl">
              <span className="text-[#F97316]">&ldquo;กำลังจะมาในเร็วนี้ๆ&rdquo;</span><br/>
              เตรียมพบกับศูนย์รวมความรู้ เทคนิคการใช้เครื่องมือ NEX และกลยุทธ์การตลาดแบบมืออาชีพเพื่อยกระดับธุรกิจของคุณ
            </p>

            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-3 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-8 py-4 text-[#050579]">
                 <Loader2 size={24} className="animate-spin" />
                 <span className="text-sm font-black uppercase tracking-[0.2em]">Under Development</span>
              </div>
              
              <Link 
                href="/manage/control"
                className="group flex items-center gap-2 text-sm font-black uppercase tracking-widest text-[#64748B] transition-colors hover:text-[#050579]"
              >
                <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
                กลับไปยังหน้าควบคุม
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
