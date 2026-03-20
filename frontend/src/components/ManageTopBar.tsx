"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LogoInline } from "@/components/Logo";
import type { ReactNode } from "react";

interface ManageTopBarProps {
  backHref: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function ManageTopBar({ backHref, title, subtitle, actions }: ManageTopBarProps) {
  return (
    <nav className="sticky top-0 z-50 border-b border-[#D9E1F2] bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link
            href={backHref}
            className="flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-[#F6F8FF] group"
            title="ย้อนกลับ"
          >
            <ArrowLeft size={20} className="text-[#64748B] transition-all group-hover:text-[#050579]" />
          </Link>
          <LogoInline size="lg" className="hidden sm:flex" href="/manage/control-center" />
          <div className="mx-2 hidden h-6 w-px bg-[#D9E1F2] sm:block" />
          <div className="min-w-0">
            {subtitle ? (
              <div className="mb-0.5 text-[10px] font-black uppercase leading-none tracking-[0.18em] text-[#94A3B8]">
                {subtitle}
              </div>
            ) : null}
            <div className="truncate text-sm font-bold text-[#050579]">{title}</div>
          </div>
        </div>

        {actions ? <div className="flex items-center gap-2 sm:gap-4">{actions}</div> : null}
      </div>
    </nav>
  );
}
