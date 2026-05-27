"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { ChevronRight, Crown, Loader2 } from "lucide-react";
import ManageTopBar from "@/components/ManageTopBar";

const PLANS = [
  { id: "premium-monthly", label: "รายเดือน", price: 199, unit: "บาท/เดือน" },
  { id: "premium-yearly", label: "รายปี", price: 1500, unit: "บาท/ปี", badge: "ประหยัด 888 บาท" },
];

export default function UpgradePlanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF0FF] text-[#050579]">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A]">
      <ManageTopBar backHref="/manage/control" title="เปิดใช้งานทุกระบบ" subtitle="Premium Plan" />

      <main className="mx-auto w-full max-w-md px-4 py-6 md:px-6 md:py-10">
        <div className="space-y-4">
          {PLANS.map((plan) => (
            <Link
              key={plan.id}
              href={`/manage/upgrade-plan/${plan.id}`}
              className="group flex items-center gap-4 rounded-[28px] border-2 border-[#D9E1F2] bg-white p-5 shadow-[0_24px_60px_-42px_rgba(5,5,121,0.15)] transition-all hover:border-[#F97316] hover:bg-[#FFF7ED] md:p-6"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#EEF0FF] text-[#050579] transition group-hover:bg-[#FFF1E8] group-hover:text-[#F97316]">
                <Crown size={24} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black tracking-tight text-[#050579]">
                    เปิดใช้งานทุกระบบ {plan.label}
                  </h2>
                  {plan.badge && (
                    <span className="rounded-full bg-[#F97316] px-2.5 py-0.5 text-[10px] font-black text-white">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-[#475569]">ชำระเงินแล้วอัปโหลดสลิปได้ทันที</p>
              </div>
              <div className="flex items-center gap-2">
                <p className="shrink-0 text-right text-[#050579]">
                  <span className="text-2xl font-black">{plan.price.toLocaleString("th-TH")}</span>
                  <br />
                  <span className="text-xs font-bold text-[#64748B]">{plan.unit}</span>
                </p>
                <ChevronRight size={20} className="shrink-0 text-[#94A3B8] transition group-hover:text-[#F97316]" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
