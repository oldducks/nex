"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  ArrowRight,
  BadgeHelp,
  BarChart3,
  BookOpen,
  CreditCard,
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

const PRIMARY_ITEM_ID = "profile";

const MENU_ITEMS: MenuItem[] = [
  { id: "profile", label: "นามบัตรดิจิทัล", href: "/manage/profile", icon: Smartphone, featureKey: "profile" },
  { id: "catalog", label: "อี แคตตาล็อค", href: "/manage", icon: BookOpen, featureKey: "catalog" },
  { id: "landing-pages", label: "หน้าร้านออนไลน์", href: "/manage/landing-pages", icon: Layout, featureKey: "landing-pages" },
  { id: "qr", label: "สร้าง QR Code", href: "/manage/qr", icon: QrCode, featureKey: "profile" },
  { id: "forms", label: "ฟอร์มบันทึกข้อมูล", href: "/manage/forms", icon: FileText, featureKey: "leads" },
  { id: "referrals", label: "พันธมิตรธุรกิจ", href: "/manage/referrals", icon: Gift, featureKey: "referrals" },
  { id: "analytics", label: "ข้อมูลสรุป", href: "/manage/dashboard", icon: BarChart3, featureKey: "analytics" },
  { id: "ai", label: "สร้างงานด้วย AI", href: "/manage/ai", icon: Zap, featureKey: "ai" },
  { id: "learning", label: "คู่มือการใช้งาน", href: "/manage/learning", icon: UserCircle, featureKey: "learning" },
  { id: "design", label: "ออกแบบกราฟิก", href: "/manage/create-lite", icon: ImageIcon, featureKey: "catalog" },
  { id: "namecard", label: "ออกแบบนามบัตร", href: "/manage/namecard", icon: CreditCard, featureKey: "namecard" },
  { id: "upgrade-plan", label: "อัปเกรดแพ็กเกจ", href: "/manage/upgrade-plan", icon: Crown },
  { id: "leads", label: "ข้อมูลจากแบบฟอร์ม", href: "/manage/leads", icon: Users, featureKey: "leads" },
  { id: "account", label: "ตั้งค่าบัญชี", href: "/manage/account", icon: Settings },
  { id: "control-center", label: "ศูนย์ควบคุมเดิม", href: "/manage/control-center", icon: BadgeHelp },
];

const CORE_IDS = new Set(["catalog", "landing-pages", "qr", "forms"]);
const GROWTH_IDS = new Set(["referrals", "analytics", "ai", "learning"]);

export default function Control2V2Page() {
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

  const { primaryItem, coreItems, growthItems, settingItems } = useMemo(() => {
    const primaryItem = MENU_ITEMS.find((item) => item.id === PRIMARY_ITEM_ID) ?? MENU_ITEMS[0];
    const secondaryItems = MENU_ITEMS.filter((item) => item.id !== PRIMARY_ITEM_ID);

    return {
      primaryItem,
      coreItems: secondaryItems.filter((item) => CORE_IDS.has(item.id)),
      growthItems: secondaryItems.filter((item) => GROWTH_IDS.has(item.id)),
      settingItems: secondaryItems.filter((item) => !CORE_IDS.has(item.id) && !GROWTH_IDS.has(item.id)),
    };
  }, []);

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

    // Fallback for old accounts without config: keep profile-only entry available.
    return item.featureKey === "profile";
  };

  const handleLogout = () => {
    Cookies.remove("token");
    router.push(withPrefix("/login"));
  };
  const PrimaryIcon = primaryItem.icon;

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EEF0FF] text-[#0F172A] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#050579]" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EEF0FF] text-[#0F172A]">
      <section className="mx-auto w-full max-w-md px-4 pb-8 pt-5">
        <header className="rounded-3xl border border-[#D9E1F2] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#475569]">NEX Control</p>
          <h1 className="mt-2 text-xl font-bold text-[#050579]">ศูนย์ควบคุมการใช้งาน</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#475569]">
            สถานะตอนนี้ : {planLabel} Plan {isPremium || isAdmin ? "(ใช้งานได้ครบ)" : "(ฟังก์ชันการใช้งานบางส่วนถูกจำกัด)"}
          </p>
        </header>

        <section className="mt-4 rounded-3xl border border-[#F6D5BF] bg-white p-4 shadow-[0_18px_36px_-30px_rgba(249,115,22,0.55)]">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9A3412]">Primary Action</p>
          <Link
            href={withPrefix(primaryItem.href)}
            className="mt-2 flex items-center justify-between rounded-2xl bg-[#F97316] px-4 py-4 text-white"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                <PrimaryIcon size={20} />
              </span>
              <span>
                <span className="block text-sm font-semibold">เริ่มจากเมนูหลัก</span>
                <span className="block text-base font-bold leading-tight">{primaryItem.label}</span>
              </span>
            </span>
            <ArrowRight size={18} />
          </Link>
        </section>

        <MenuGroup title="เครื่องมือหลัก" items={coreItems} withPrefix={withPrefix} isFeatureEnabled={isFeatureEnabled} />
        <MenuGroup title="การเติบโตและวิเคราะห์" items={growthItems} withPrefix={withPrefix} isFeatureEnabled={isFeatureEnabled} />
        <MenuGroup title="การตั้งค่าและเมนูเพิ่มเติม" items={settingItems} withPrefix={withPrefix} isFeatureEnabled={isFeatureEnabled} />

        <div className="mt-6">
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

function MenuGroup({
  title,
  items,
  withPrefix,
  isFeatureEnabled,
}: {
  title: string;
  items: MenuItem[];
  withPrefix: (path: string) => string;
  isFeatureEnabled: (item: MenuItem) => boolean;
}) {
  if (!items.length) return null;

  return (
    <section className="mt-4 rounded-3xl border border-[#D9E1F2] bg-white p-4">
      <h2 className="text-sm font-bold text-[#050579]">{title}</h2>
      <div className="mt-3 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          const enabled = isFeatureEnabled(item);

          if (!enabled) {
            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] px-3 py-3 opacity-80"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#94A3B8]">
                    <Icon size={18} />
                  </span>
                  <span className="text-sm font-semibold text-[#64748B]">{item.label}</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-[#F6D5BF] bg-[#FFF1E8] px-2 py-1 text-[10px] font-bold text-[#C2410C]">
                  <Lock size={12} />
                  Locked
                </span>
              </div>
            );
          }

          return (
            <Link
              key={item.id}
              href={withPrefix(item.href)}
              className="flex items-center justify-between rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-3 transition hover:border-[#C7D2E5]"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#050579]">
                  <Icon size={18} />
                </span>
                <span className="text-sm font-semibold text-[#0F172A]">{item.label}</span>
              </span>
              <ArrowRight size={16} className="text-[#475569]" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
