"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  BarChart3,
  BookOpen,
  Crown,
  FileText,
  Gift,
  Image as ImageIcon,
  Layout,
  Lock,
  Loader2,
  LogOut,
  QrCode,
  Settings,
  Smartphone,
  UserCircle,
  Users,
  Zap,
} from "lucide-react";

type MeResponse = {
  subscription_tier?: string;
  feature_config?: Record<string, boolean>;
  user?: {
    role?: string;
  };
};

type MenuItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  featureKey?: keyof FeatureConfig;
};

type FeatureConfig = {
  catalog: boolean;
  leads: boolean;
  namecard: boolean;
  "landing-pages": boolean;
  analytics: boolean;
  profile: boolean;
  referrals: boolean;
  learning?: boolean;
  ai?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  { id: "profile", label: "นามบัตรดิจิทัล", href: "/manage/profile", icon: Smartphone, featureKey: "profile" },
  { id: "catalog", label: "อี แคตตาล็อค", href: "/manage", icon: BookOpen, featureKey: "catalog" },
  { id: "landing-pages", label: "หน้าร้านออนไลน์", href: "/manage/landing-pages", icon: Layout, featureKey: "landing-pages" },
  { id: "qr", label: "สร้าง QR Code", href: "/manage/qr", icon: QrCode, featureKey: "profile" },
  { id: "forms", label: "ฟอร์มบันทึกข้อมูล", href: "/manage/forms", icon: FileText },
  { id: "design", label: "ออกแบบกราฟิก", href: "/manage/create-lite", icon: ImageIcon, featureKey: "catalog" },
  { id: "leads", label: "ข้อมูลจากแบบฟอร์ม", href: "/manage/leads", icon: Users, featureKey: "leads" },
  { id: "referrals", label: "พันธมิตรธุรกิจ", href: "/manage/referrals", icon: Gift, featureKey: "referrals" },
  { id: "learning", label: "คู่มือการใช้งาน", href: "/manage/learning", icon: UserCircle, featureKey: "learning" },
  { id: "analytics", label: "ข้อมูลสรุป", href: "/manage/dashboard", icon: BarChart3, featureKey: "analytics" },
  { id: "ai", label: "สร้างงานด้วย AI", href: "/manage/digital-media-v1", icon: Zap, featureKey: "ai" },
  { id: "upgrade-plan", label: "อัปเกรดแพ็กเกจ", href: "/manage/upgrade-plan", icon: Crown },
  { id: "account", label: "ตั้งค่าบัญชี", href: "/manage/account", icon: Settings },
];

export default function Control2Page() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<MeResponse | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  const v2Prefix = pathname?.startsWith("/v2") ? "/v2" : "";
  const withPrefix = (path: string) => `${v2Prefix}${path}`;
  const loginPath = `${v2Prefix}/login`;

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.replace(loginPath);
      return;
    }

    const fetchMe = async () => {
      try {
        const res = await fetch(`${apiUrl}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          if (res.status === 401) router.replace(loginPath);
          setLoading(false);
          return;
        }
        const data = (await res.json()) as MeResponse;
        setMe(data);
      } catch {
        // Keep screen usable even when profile endpoint fails.
      } finally {
        setLoading(false);
      }
    };

    fetchMe();
  }, [apiUrl, loginPath, router]);

  const visibleMenus = useMemo(() => MENU_ITEMS, []);

  const isAdmin = me?.user?.role === "super_admin" || me?.user?.role === "group_admin";
  const isPremium = me?.subscription_tier === "premium";
  const planLabel = isAdmin ? "Admin" : isPremium ? "Premium" : "Free";

  const isFeatureEnabled = (item: MenuItem): boolean => {
    if (!item.featureKey) return true;
    if (isAdmin || isPremium) return true;

    const config = me?.feature_config;
    if (config && typeof config[item.featureKey] === "boolean") {
      return config[item.featureKey] === true;
    }

    return item.featureKey === "profile";
  };

  const handleLogout = () => {
    Cookies.remove("token");
    router.push(loginPath);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EEF0FF] text-[#0F172A] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#050579]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EEF0FF] text-[#0F172A]">
      <section className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-8 pt-5">
        <header className="mb-4 rounded-[24px] border border-[#D9E1F2] bg-white px-4 py-4 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.35)]">
          <div className="mx-auto flex w-full justify-center">
            <img
              src="/nex_logo_nobg.png"
              alt="NEX Solution"
              className="h-[64px] w-auto object-contain"
            />
          </div>
          <p className="mt-3 text-center text-xs font-semibold text-[#475569]">
            สถานะตอนนี้ : {planLabel} Plan {isPremium || isAdmin ? "(ใช้งานได้ครบ)" : "(ฟังก์ชันการใช้งานบางส่วนถูกจำกัด)"}
          </p>
        </header>

        <div className="rounded-[28px] border border-[#D9E1F2] bg-white p-5 shadow-[0_24px_60px_-40px_rgba(5,5,121,0.2)]">
          <div className="grid grid-cols-3 gap-x-3 gap-y-4">
            {visibleMenus.map((item) => {
              const Icon = item.icon;
              const enabled = isFeatureEnabled(item);

              if (!enabled) {
                return (
                  <div key={item.id} className="flex flex-col items-center gap-2 rounded-2xl p-2 opacity-75">
                    <span className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF]">
                      <Icon size={29} className="text-[#94A3B8]" />
                      <span className="absolute -right-1 -top-1 inline-flex h-5 w-5 items-center justify-center rounded-full border border-[#F6D5BF] bg-[#FFF1E8] text-[#C2410C]">
                        <Lock size={11} />
                      </span>
                    </span>
                    <span
                      className={`text-center font-semibold leading-tight text-[#64748B] ${item.id === "leads" ? "whitespace-nowrap text-[11px]" : "text-[12px]"}`}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.id}
                  href={withPrefix(item.href)}
                  className="group flex flex-col items-center gap-2 rounded-2xl p-2 transition-transform duration-150 hover:-translate-y-0.5"
                >
                  <span className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] shadow-[0_14px_24px_-18px_rgba(5,5,121,0.35)]">
                    <Icon size={29} className="text-[#050579]" />
                  </span>
                  <span
                    className={`text-center font-semibold leading-tight text-[#0F172A] ${item.id === "leads" ? "whitespace-nowrap text-[11px]" : "text-[12px]"}`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-auto pt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#DC2626]/25 bg-white px-4 py-3 text-sm font-bold text-[#B91C1C]"
          >
            <LogOut size={16} />
            ออกจากระบบ
          </button>
        </div>
      </section>
    </main>
  );
}
