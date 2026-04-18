"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Check,
  ChevronRight,
  Copy,
  Download,
  Gift,
  Loader2,
  Lock,
  LogOut,
  QrCode,
  Smartphone,
  Users,
} from "lucide-react";
import { QrCodeImage } from "@/components/QrCode";

type MeResponse = {
  subscription_tier?: string;
  feature_config?: Record<string, boolean>;
  email?: string;
  user?: {
    role?: string;
    email?: string;
  };
};

type ReferralStats = {
  referralCode?: string | null;
  totalReferrals: number;
  directReferrals: number;
  totalCommission: number;
  pendingCommission: number;
};

type ReferralTreeNode = {
  id: number;
  level: number;
  referredUser?: {
    id?: number;
    email?: string;
    uid?: string;
    profilePic?: string;
    subscription_tier?: string;
  };
  commission: number | string;
  status: string;
  createdAt: string | Date;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const PAGE_BG = "bg-[#EEF0FF]";
const SURFACE = "bg-white border border-[#D9E1F2]";
const MUTED_SURFACE = "bg-[#F6F8FF] border border-[#D9E1F2]";
const TEXT_PRIMARY = "text-[#050579]";
const TEXT_BODY = "text-[#0F172A]";
const TEXT_SECONDARY = "text-[#475569]";
const TEXT_MUTED = "text-[#64748B]";
const CTA_PRIMARY = "bg-[#F97316] text-white hover:bg-[#EA580C]";

export default function ReferralsV2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [me, setMe] = useState<MeResponse | null>(null);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [tree, setTree] = useState<ReferralTreeNode[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  const token = Cookies.get("token");

  const isAdmin = me?.user?.role === "super_admin" || me?.user?.role === "group_admin";
  const isPremium = me?.subscription_tier === "premium";
  const referralEnabled = useMemo(() => {
    if (isAdmin || isPremium) return true;

    const configValue = me?.feature_config?.referrals;
    if (typeof configValue === "boolean") return configValue;

    return false;
  }, [isAdmin, isPremium, me?.feature_config]);

  const planLabel = isAdmin ? "Admin" : isPremium ? "Premium" : "Free";
  const referralCode = stats?.referralCode ?? null;
  const referralUrl =
    referralCode && typeof window !== "undefined"
      ? `${window.location.origin}/register?ref=${referralCode}`
      : "";

  const loadReferralData = useCallback(
    async (accessToken: string) => {
      setRefreshing(true);
      try {
        const [statsRes, treeRes] = await Promise.all([
          fetch(`${API_URL}/referrals/stats`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
          fetch(`${API_URL}/referrals/tree`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          }),
        ]);

        if (statsRes.ok) {
          const statsData = (await statsRes.json()) as ReferralStats;
          setStats(statsData);
        }

        if (treeRes.ok) {
          const treeData = (await treeRes.json()) as ReferralTreeNode[];
          const sorted = [...treeData].sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          setTree(sorted);
        }
      } catch (error) {
        console.error("Referral data fetch failed:", error);
      } finally {
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (!token) {
      router.replace("/login");
      return;
    }

    let mounted = true;

    const loadPage = async () => {
      try {
        const meRes = await fetch(`${API_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!meRes.ok) {
          if (meRes.status === 401) router.replace("/login");
          return;
        }

        const meData = (await meRes.json()) as MeResponse;
        if (!mounted) return;
        setMe(meData);

        const admin = meData.user?.role === "super_admin" || meData.user?.role === "group_admin";
        const premium = meData.subscription_tier === "premium";
        const configValue = meData.feature_config?.referrals;
        const enabled = admin || premium || configValue === true;

        if (!enabled) {
          setStats(null);
          setTree([]);
          return;
        }

        await loadReferralData(token);
      } catch (error) {
        console.error("Profile fetch failed:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadPage();

    return () => {
      mounted = false;
    };
  }, [loadReferralData, router, token]);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("uid");
    router.push("/login");
  };

  const copyToClipboard = async () => {
    if (!referralUrl) return;

    try {
      await navigator.clipboard.writeText(referralUrl);
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  const downloadQrCode = () => {
    const canvas = document.getElementById("referral-qr-canvas-v2") as HTMLCanvasElement | null;
    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "nex-referral-qr.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (!token) return null;

  if (loading) {
    return (
      <main className={`flex min-h-screen items-center justify-center ${PAGE_BG} ${TEXT_BODY}`}>
        <div className="text-center">
          <Loader2 size={28} className={`mx-auto animate-spin ${TEXT_PRIMARY}`} />
          <p className={`mt-3 text-sm font-semibold ${TEXT_SECONDARY}`}>กำลังเตรียมหน้าพันธมิตรธุรกิจ</p>
        </div>
      </main>
    );
  }

  return (
    <main className={`min-h-screen ${PAGE_BG} ${TEXT_BODY}`}>
      <section className="mx-auto w-full max-w-md px-4 pb-8 pt-5 md:max-w-5xl md:px-6">
        <header className={`rounded-[28px] p-5 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.35)] ${SURFACE}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-[0.12em] ${TEXT_MUTED}`}>Referral Control</p>
              <h1 className={`mt-2 text-2xl font-black leading-tight ${TEXT_PRIMARY}`}>พันธมิตรธุรกิจ</h1>
              <p className={`mt-2 text-sm leading-relaxed ${TEXT_SECONDARY}`}>
                แชร์ลิงก์แนะนำสมาชิกและติดตามผลการสมัครจากมือถือได้แบบอ่านเร็ว
              </p>
            </div>

            <span className="inline-flex rounded-full bg-[#EEF0FF] px-3 py-1 text-[11px] font-bold text-[#050579]">
              {planLabel} Plan
            </span>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <StatusPill
              label="สถานะการใช้งาน"
              value={referralEnabled ? "พร้อมใช้งาน" : "Locked"}
              tone={referralEnabled ? "navy" : "orange"}
            />
            <StatusPill label="ผู้สมัครตรง" value={`${stats?.directReferrals ?? 0} คน`} tone="navy" />
            <StatusPill label="รหัสแนะนำ" value={referralCode || "---"} tone="neutral" mono />
          </div>
        </header>

        {referralEnabled ? (
          <>
            <section className={`mt-4 rounded-[28px] p-4 shadow-[0_18px_36px_-30px_rgba(249,115,22,0.45)] ${SURFACE}`}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#9A3412]">Primary Action</p>
                  <h2 className={`mt-2 text-lg font-black ${TEXT_PRIMARY}`}>คัดลอกลิงก์แนะนำสมาชิก</h2>
                  <p className={`mt-2 text-sm leading-relaxed ${TEXT_SECONDARY}`}>
                    ส่งลิงก์นี้ให้คนที่ต้องการสมัคร เพื่อให้ระบบนับเข้าโค้ดของคุณทันที
                  </p>
                </div>
                {refreshing ? <Loader2 size={18} className="animate-spin text-[#F97316]" /> : null}
              </div>

              <div className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-relaxed break-all ${MUTED_SURFACE} ${TEXT_BODY}`}>
                {referralUrl || "ยังไม่พบลิงก์แนะนำสมาชิก"}
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  disabled={!referralUrl}
                  className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${CTA_PRIMARY}`}
                >
                  {copiedLink ? <Check size={18} /> : <Copy size={18} />}
                  {copiedLink ? "คัดลอกแล้ว" : "คัดลอกลิงก์แนะนำ"}
                </button>

                <button
                  type="button"
                  onClick={downloadQrCode}
                  disabled={!referralUrl}
                  className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${MUTED_SURFACE} ${TEXT_PRIMARY}`}
                >
                  <Download size={18} />
                  ดาวน์โหลด QR
                </button>
              </div>
            </section>

            <section className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
              <div className={`rounded-[28px] p-4 ${SURFACE}`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF0FF] text-[#050579]">
                    <Gift size={20} />
                  </span>
                  <div>
                    <h2 className={`text-base font-black ${TEXT_PRIMARY}`}>ภาพรวมผลลัพธ์</h2>
                    <p className={`text-sm ${TEXT_SECONDARY}`}>สรุปตัวเลขสำคัญสำหรับการชวนสมาชิก</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <MetricCard label="ผู้สมัครทั้งหมด" value={`${stats?.totalReferrals ?? 0} คน`} />
                  <MetricCard label="ผู้สมัครตรง" value={`${stats?.directReferrals ?? 0} คน`} />
                  <MetricCard label="ค่าคอมมิชชันรวม" value={formatCurrency(stats?.totalCommission ?? 0)} />
                  <MetricCard label="รอดำเนินการ" value={formatCurrency(stats?.pendingCommission ?? 0)} />
                </div>
              </div>

              <div className={`rounded-[28px] p-4 ${SURFACE}`}>
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFF1E8] text-[#F97316]">
                    <QrCode size={20} />
                  </span>
                  <div>
                    <h2 className={`text-base font-black ${TEXT_PRIMARY}`}>QR สำหรับแชร์</h2>
                    <p className={`text-sm ${TEXT_SECONDARY}`}>ให้คนสแกนเพื่อไปหน้าสมัครพร้อมโค้ดของคุณ</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center rounded-[24px] border border-[#D9E1F2] bg-[#F6F8FF] p-4">
                  <div className="rounded-[24px] border border-[#D9E1F2] bg-white p-3">
                    <QrCodeImage id="referral-qr-canvas-v2" useCanvas={true} url={referralUrl} size={168} />
                  </div>
                </div>
              </div>
            </section>

            <section className={`mt-4 rounded-[28px] p-4 ${SURFACE}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className={`text-base font-black ${TEXT_PRIMARY}`}>รายชื่อผู้สมัคร</h2>
                  <p className={`mt-1 text-sm ${TEXT_SECONDARY}`}>
                    แสดงเป็นการ์ดเพื่ออ่านง่ายบนมือถือ แทนตารางกว้างของหน้าเดิม
                  </p>
                </div>
                <span className={`rounded-full bg-[#F6F8FF] px-3 py-1 text-[11px] font-semibold ${TEXT_MUTED}`}>
                  {tree.length} รายการ
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {tree.length ? (
                  tree.map((item, index) => (
                    <article key={item.id} className={`rounded-2xl p-4 ${MUTED_SURFACE}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold uppercase tracking-[0.08em] ${TEXT_MUTED}`}>
                            ผู้สมัครลำดับ {index + 1}
                          </p>
                          <h3 className={`mt-1 truncate text-sm font-bold ${TEXT_PRIMARY}`}>
                            {item.referredUser?.email || "Unknown User"}
                          </h3>
                          <p className={`mt-1 text-xs ${TEXT_SECONDARY}`}>UID: {item.referredUser?.uid || "---"}</p>
                        </div>

                        <span className={getTierBadgeClass(item.referredUser?.subscription_tier)}>
                          {item.referredUser?.subscription_tier || "free"}
                        </span>
                      </div>

                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        <InfoCell label="ระดับ" value={`ชั้น ${item.level}`} />
                        <InfoCell label="สถานะ" value={formatStatus(item.status)} />
                        <InfoCell label="คอมมิชชัน" value={formatCurrency(Number(item.commission) || 0)} />
                      </div>

                      <div className={`mt-3 text-xs ${TEXT_MUTED}`}>สมัครเมื่อ {formatDate(item.createdAt)}</div>
                    </article>
                  ))
                ) : (
                  <div className={`rounded-2xl p-5 text-center ${MUTED_SURFACE}`}>
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#050579]">
                      <Users size={20} />
                    </div>
                    <h3 className={`mt-3 text-sm font-bold ${TEXT_PRIMARY}`}>ยังไม่มีผู้สมัครในขณะนี้</h3>
                    <p className={`mt-2 text-sm ${TEXT_SECONDARY}`}>
                      เริ่มจากคัดลอกลิงก์แนะนำด้านบน แล้วส่งให้คนที่ต้องการสมัคร
                    </p>
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <section className={`mt-4 rounded-[28px] p-5 ${SURFACE}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF1E8] text-[#F97316]">
              <Lock size={20} />
            </div>
            <h2 className={`mt-4 text-lg font-black ${TEXT_PRIMARY}`}>ฟีเจอร์นี้ยังไม่เปิดใช้งาน</h2>
            <p className={`mt-2 text-sm leading-relaxed ${TEXT_SECONDARY}`}>
              ระบบตรวจจาก `role`, `subscription_tier` และ `feature_config` แล้วพบว่าบัญชีนี้ยังไม่ปลดล็อกเมนู Referral
            </p>

            <div className="mt-4 space-y-3">
              <div className={`rounded-2xl p-4 ${MUTED_SURFACE}`}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className={`text-sm font-bold ${TEXT_PRIMARY}`}>สถานะปัจจุบัน</p>
                    <p className={`mt-1 text-sm ${TEXT_SECONDARY}`}>บัญชีทั่วไปจะเปิดได้ตาม `feature_config.referrals` เท่านั้น</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1E8] px-3 py-1 text-[11px] font-bold text-[#C2410C]">
                    <Lock size={12} />
                    Locked
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/manage/control-center")}
                className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-sm font-bold transition ${MUTED_SURFACE} ${TEXT_PRIMARY}`}
              >
                <span className="flex items-center gap-2">
                  <Smartphone size={16} />
                  กลับไปดูเมนูจัดการอื่น
                </span>
                <ChevronRight size={16} />
              </button>
            </div>
          </section>
        )}

        <section className={`mt-4 rounded-[28px] p-4 ${SURFACE}`}>
          <h2 className={`text-sm font-bold ${TEXT_PRIMARY}`}>เมนูรอง</h2>
          <div className="mt-3 grid gap-3">
            <SecondaryMenuCard
              title="Core"
              description="นามบัตรและเครื่องมือหลักสำหรับการเริ่มใช้งาน"
              href="/manage/profile"
            />
            <SecondaryMenuCard
              title="Growth"
              description="ข้อมูลสรุปและเครื่องมือขยายผลทางธุรกิจ"
              href={referralEnabled ? "/manage/dashboard" : undefined}
              locked={!referralEnabled}
            />
            <SecondaryMenuCard
              title="Settings"
              description="ตั้งค่าบัญชีและการใช้งานเพิ่มเติม"
              href="/manage/account"
            />
          </div>
        </section>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleLogout}
            className={`flex w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold ${MUTED_SURFACE} ${TEXT_PRIMARY}`}
          >
            <LogOut size={16} />
            ออกจากระบบ
          </button>
        </div>
      </section>
    </main>
  );
}

function StatusPill({
  label,
  value,
  tone,
  mono = false,
}: {
  label: string;
  value: string;
  tone: "navy" | "orange" | "neutral";
  mono?: boolean;
}) {
  const toneClass =
    tone === "orange"
      ? "bg-[#FFF1E8] text-[#C2410C]"
      : tone === "navy"
        ? "bg-[#EEF0FF] text-[#050579]"
        : "bg-[#F6F8FF] text-[#475569]";

  return (
    <div className={`rounded-2xl px-4 py-3 ${toneClass}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em]">{label}</p>
      <p className={`mt-1 text-sm font-bold ${mono ? "font-mono tracking-[0.16em]" : ""}`}>{value}</p>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className={`rounded-2xl p-4 ${MUTED_SURFACE}`}>
      <p className={`text-xs font-semibold uppercase tracking-[0.08em] ${TEXT_MUTED}`}>{label}</p>
      <p className={`mt-2 text-lg font-black ${TEXT_PRIMARY}`}>{value}</p>
    </div>
  );
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#D9E1F2] bg-white px-3 py-2">
      <p className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${TEXT_MUTED}`}>{label}</p>
      <p className={`mt-1 text-sm font-bold ${TEXT_PRIMARY}`}>{value}</p>
    </div>
  );
}

function SecondaryMenuCard({
  title,
  description,
  href,
  locked = false,
}: {
  title: string;
  description: string;
  href?: string;
  locked?: boolean;
}) {
  if (locked || !href) {
    return (
      <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${MUTED_SURFACE}`}>
        <div>
          <p className={`text-sm font-bold ${TEXT_PRIMARY}`}>{title}</p>
          <p className={`mt-1 text-sm ${TEXT_SECONDARY}`}>{description}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF1E8] px-3 py-1 text-[11px] font-bold text-[#C2410C]">
          <Lock size={12} />
          Locked
        </span>
      </div>
    );
  }

  return (
    <Link href={href} className={`flex items-center justify-between rounded-2xl px-4 py-3 transition ${MUTED_SURFACE}`}>
      <div>
        <p className={`text-sm font-bold ${TEXT_PRIMARY}`}>{title}</p>
        <p className={`mt-1 text-sm ${TEXT_SECONDARY}`}>{description}</p>
      </div>
      <ChevronRight size={16} className="text-[#64748B]" />
    </Link>
  );
}

function getTierBadgeClass(tier?: string) {
  if (tier === "premium") {
    return "inline-flex items-center gap-1 rounded-full bg-[#FFF1E8] px-3 py-1 text-[11px] font-bold uppercase text-[#C2410C]";
  }

  return "inline-flex items-center gap-1 rounded-full bg-[#EEF0FF] px-3 py-1 text-[11px] font-bold uppercase text-[#050579]";
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | Date) {
  try {
    return new Date(value).toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

function formatStatus(status: string) {
  if (status === "confirmed") return "ยืนยันแล้ว";
  if (status === "paid") return "จ่ายแล้ว";
  if (status === "pending") return "รอดำเนินการ";
  return status || "-";
}
