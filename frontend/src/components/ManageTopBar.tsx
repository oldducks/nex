"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Cookies from "js-cookie";
import type { ReactNode } from "react";

interface ManageTopBarProps {
  backHref: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function ManageTopBar({ backHref, title, subtitle, actions }: ManageTopBarProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const token = Cookies.get("token");
  const [currentPlanLabel, setCurrentPlanLabel] = useState("แผนพื้นฐาน");

  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        setCurrentPlanLabel(data?.subscription_tier === "premium" ? "แผนพรีเมียม" : "แผนพื้นฐาน");
      } catch (error) {
        console.error("โหลดข้อมูลแผนไม่สำเร็จ", error);
      }
    };

    void loadCurrentUser();
  }, [API_URL, token]);

  return (
    <nav className="sticky top-0 z-50 border-b border-[#D9E1F2] bg-white/85 backdrop-blur-md">
      <div className="relative mx-auto flex h-24 w-full max-w-md items-center px-4 md:max-w-5xl md:px-6">
        <div className="absolute left-4 md:left-6">
          <Link
            href={backHref}
            className="group flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-[#F6F8FF]"
            title="ย้อนกลับ"
          >
            <ArrowLeft size={20} className="text-[#64748B] transition-all group-hover:text-[#050579]" />
          </Link>
        </div>

        <div className="mx-auto flex min-w-0 flex-col items-center text-center">
          {subtitle ? (
            <div className="mb-0.5 text-[11px] font-black uppercase leading-none tracking-[0.18em] text-[#94A3B8]">
              {subtitle}
            </div>
          ) : null}
          <div className="truncate text-base font-black text-[#050579]">{title}</div>
          <div className="mt-2 inline-flex items-center rounded-full border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-1 text-xs font-bold text-[#64748B]">
            <span className="mr-1.5 text-[#94A3B8]">แผนปัจจุบัน</span>
            <span className="text-[#050579]">{currentPlanLabel}</span>
          </div>
        </div>

        {actions ? (
          <div className="absolute right-4 flex items-center gap-2 sm:gap-4 md:right-6">{actions}</div>
        ) : null}
      </div>
    </nav>
  );
}
