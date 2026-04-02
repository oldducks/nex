"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  LayoutTemplate,
  Loader2,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { homePreviewTheme } from "@/content/home-preview-theme";

const quickActions = [
  { label: "เข้าสู่ระบบ", href: "/login", primary: true, isLoginModal: true },
  { label: "NEX คืออะไร", href: "https://nexsolution.cloud/what-is-nex" },
  { label: "สมัครสมาชิกเป็น NEX Digital Agent", href: "https://nexsolution.cloud/register" },
  { label: "โซลูชันสำหรับองค์กร", href: "https://nexsolution.cloud/manage" },
];

const valuePoints = [
  {
    icon: ShieldCheck,
    title: "ภาพลักษณ์ที่น่าเชื่อถือ",
    description: "ยกระดับการนำเสนอธุรกิจด้วยหน้าโปรไฟล์และโครงสร้างข้อมูลที่ดูเป็นมืออาชีพ",
  },
  {
    icon: LayoutTemplate,
    title: "เครื่องมือที่ใช้งานได้จริง",
    description: "จัดการนามบัตรดิจิทัล แคตตาล็อก และหน้าแคมเปญได้จากระบบเดียว",
  },
  {
    icon: BarChart3,
    title: "รองรับการเติบโต",
    description: "ต่อยอดการขายและติดตามผลลัพธ์จากการใช้งานจริงได้ง่ายขึ้น",
  },
];

const trustPoints = [
  "เหมาะสำหรับบุคคล ทีมขาย และองค์กร",
  "เน้นโครงสร้างที่ชัดเจน อ่านง่าย และพร้อมใช้งานจริง",
  "ออกแบบให้ conversion และความน่าเชื่อถือเดินไปด้วยกัน",
];

const proofStats = [
  { value: "4", label: "เครื่องมือหลักในแพลตฟอร์ม", note: "Namecard, Catalog, Campaign, Control Center" },
  { value: "3", label: "กลุ่มผู้ใช้หลัก", note: "บุคคล, ทีมขาย, องค์กร" },
  { value: "1", label: "ศูนย์ควบคุมเดียว", note: "ลดความกระจัดกระจายของข้อมูลและ workflow" },
];

const userPaths = [
  {
    icon: BriefcaseBusiness,
    title: "สำหรับเจ้าของธุรกิจและผู้ขาย",
    description: "สร้างตัวตนออนไลน์ที่ดูน่าเชื่อถือ พร้อมแชร์ข้อมูลสำคัญให้ลูกค้าเข้าถึงได้ทันที",
  },
  {
    icon: Users,
    title: "สำหรับทีมขายและตัวแทน",
    description: "ทำให้ทีมใช้มาตรฐานเดียวกัน ทั้งโปรไฟล์การขาย แคตตาล็อก และหน้าปิดการขาย",
  },
  {
    icon: Building2,
    title: "สำหรับองค์กร",
    description: "จัดการภาพลักษณ์ดิจิทัลและการเข้าถึงข้อมูลของหลายผู้ใช้งานได้เป็นระบบมากขึ้น",
  },
];

const journeySteps = [
  {
    step: "01",
    title: "กำหนดตัวตนธุรกิจ",
    description: "เริ่มจากนามบัตรดิจิทัลหรือหน้าโปรไฟล์ที่สื่อสารข้อมูลหลักอย่างกระชับ",
  },
  {
    step: "02",
    title: "ต่อยอดด้วยเครื่องมือขาย",
    description: "เพิ่มแคตตาล็อก หน้าแคมเปญ หรือฟอร์มเก็บ lead ตามบริบทการใช้งานจริง",
  },
  {
    step: "03",
    title: "ติดตามและปรับปรุง",
    description: "ดูผลลัพธ์จากศูนย์ควบคุม แล้วค่อยปรับสิ่งที่ช่วยให้ conversion ดีขึ้น",
  },
];

const footerLinks = [
  { label: "What is NEX", href: "/what-is-nex" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Data Deletion", href: "/data-deletion" },
];

const themeVars: CSSProperties = {
  ["--brand" as string]: homePreviewTheme.brand,
  ["--brand-hover" as string]: homePreviewTheme.brandHover,
  ["--brand-dark" as string]: homePreviewTheme.brandDark,
  ["--cta" as string]: homePreviewTheme.cta,
  ["--cta-hover" as string]: homePreviewTheme.ctaHover,
  ["--cta-soft" as string]: homePreviewTheme.ctaSoft,
  ["--support" as string]: homePreviewTheme.support,
  ["--support-hover" as string]: homePreviewTheme.supportHover,
  ["--support-soft" as string]: homePreviewTheme.supportSoft,
  ["--bg-page" as string]: homePreviewTheme.pageBackground,
  ["--bg-gradient" as string]: homePreviewTheme.pageGradient,
  ["--glow-left" as string]: homePreviewTheme.glowLeft,
  ["--glow-right" as string]: homePreviewTheme.glowRight,
  ["--glow-center" as string]: homePreviewTheme.glowCenter,
  ["--surface" as string]: homePreviewTheme.surface,
  ["--surface-alt" as string]: homePreviewTheme.surfaceAlt,
  ["--surface-muted" as string]: homePreviewTheme.surfaceMuted,
  ["--border" as string]: homePreviewTheme.border,
  ["--border-strong" as string]: homePreviewTheme.borderStrong,
  ["--text-primary" as string]: homePreviewTheme.textPrimary,
  ["--text-secondary" as string]: homePreviewTheme.textSecondary,
  ["--text-muted" as string]: homePreviewTheme.textMuted,
  ["--text-on-dark" as string]: homePreviewTheme.textOnDark,
  ["--overlay" as string]: homePreviewTheme.overlay,
  ["--white-tint" as string]: homePreviewTheme.whiteTint,
  ["--white-border" as string]: homePreviewTheme.whiteBorder,
};

export default function HomePreviewPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginData, setLoginData] = useState({ identifier: "", password: "" });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLoginModalOpen(false);
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const handleSocialLogin = (provider: "google" | "line") => {
    window.location.href = `${apiUrl}/auth/${provider}`;
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoginError("");

    try {
      const res = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ identifier: loginData.identifier, password: loginData.password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "เข้าสู่ระบบไม่สำเร็จ");

      if (data.must_change_password) {
        window.location.href = "/force-change-password";
        return;
      }

      window.location.href = "/manage/control-center";
    } catch (error: unknown) {
      setLoginError(error instanceof Error ? error.message : "เข้าสู่ระบบไม่สำเร็จ");
      setIsSubmitting(false);
    }
  };

  return (
    <main
      style={themeVars}
      className="relative min-h-screen overflow-hidden bg-[var(--bg-page)] text-[var(--text-primary)]"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[image:var(--bg-gradient)]" />
      </div>

      <div className="pointer-events-none absolute left-[-8rem] top-16 h-80 w-80 rounded-full bg-[var(--glow-left)] blur-[120px]" />
      <div className="pointer-events-none absolute right-[-6rem] top-32 h-72 w-72 rounded-full bg-[var(--glow-right)] blur-[110px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[28rem] max-w-5xl rounded-full bg-[var(--glow-center)] blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-5 sm:px-8 sm:pb-20 sm:pt-8">
        <nav className="mb-8 flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/75 px-5 py-4 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.45)] backdrop-blur xl:flex-row xl:items-center xl:justify-between">
          <Link href="/" className="flex items-center gap-3 text-[var(--brand)]">
            <div className="relative h-10 w-10 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]">
              <Image src="/nex_logo_nobg.png" alt="NEX" fill className="object-contain p-1.5" unoptimized />
            </div>
            <div>
              <div className="text-sm font-black uppercase tracking-[0.18em]">NEX Solution</div>
              <div className="text-xs text-[var(--text-muted)]">Digital business platform</div>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
            <a href="#value" className="rounded-full px-3 py-2 transition hover:bg-[var(--surface-alt)] hover:text-[var(--brand)]">
              จุดเด่น
            </a>
            <a href="#audience" className="rounded-full px-3 py-2 transition hover:bg-[var(--surface-alt)] hover:text-[var(--brand)]">
              เหมาะกับใคร
            </a>
            <a href="#workflow" className="rounded-full px-3 py-2 transition hover:bg-[var(--surface-alt)] hover:text-[var(--brand)]">
              วิธีใช้งาน
            </a>
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="rounded-full bg-[var(--cta)] px-4 py-2 text-white transition hover:bg-[var(--cta-hover)]"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </nav>

        <header className="pb-4 pt-2 text-center sm:pb-6 sm:pt-4">
          <div className="mx-auto max-w-5xl">
            <div className="relative mx-auto h-[260px] w-full max-w-[860px] sm:h-[380px] lg:h-[500px] lg:max-w-[1120px]">
              <Image
                src="/nex_logo_nobg.png"
                alt="NEX Solution"
                fill
                className="object-contain drop-shadow-[0_28px_90px_rgba(59,130,246,0.22)]"
                priority
                unoptimized
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:mt-4">
              <span className="rounded-full border border-[var(--border-strong)] bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                Premium
              </span>
              <span className="rounded-full border border-[var(--border-strong)] bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                Business-ready
              </span>
              <span className="rounded-full border border-[var(--border-strong)] bg-white/80 px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
                Trust-focused
              </span>
            </div>
          </div>
        </header>

        <section className="grid gap-8 pb-8 pt-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] lg:items-start lg:pt-8">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-[var(--border-strong)] bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[var(--brand)]">
              Modern Platform For Business Growth
            </p>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] text-[var(--brand)] sm:text-5xl lg:text-6xl">
              สร้างตัวตนธุรกิจ
              <span className="mt-2 block text-[var(--text-primary)]">
                ให้ดูน่าเชื่อถือ พร้อมใช้งาน และพร้อมเติบโต
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--text-secondary)] sm:text-lg">
              NEX ช่วยให้ธุรกิจนำเสนอข้อมูลสำคัญได้อย่างเป็นระบบ ผ่านนามบัตรดิจิทัล แคตตาล็อก
              หน้าแคมเปญ และเครื่องมือที่ออกแบบมาเพื่อการใช้งานจริงในเชิงพาณิชย์
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[var(--cta)] px-6 py-4 text-base font-bold text-white transition hover:bg-[var(--cta-hover)]"
              >
                เข้าสู่ระบบ
                <ArrowRight size={18} />
              </button>
              <a
                href="https://nexsolution.cloud/what-is-nex"
                className="inline-flex items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-6 py-4 text-base font-bold text-[var(--brand)] transition hover:border-[var(--brand)] hover:bg-[var(--surface-alt)]"
              >
                ดูรายละเอียดแพลตฟอร์ม
              </a>
            </div>

            <div id="value" className="mt-10 grid gap-4 sm:grid-cols-3">
              {valuePoints.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="rounded-[24px] border border-[var(--border)] bg-white/90 p-5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.35)]"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-[var(--surface-alt)] p-3 text-[var(--brand)]">
                    <Icon size={22} />
                  </div>
                  <h2 className="text-lg font-extrabold text-[var(--text-primary)]">{title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{description}</p>
                </article>
              ))}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {proofStats.map((item) => (
                <article
                  key={item.label}
                  className="rounded-[24px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[0_20px_45px_-35px_rgba(59,130,246,0.2)]"
                >
                  <div className="text-3xl font-black text-[var(--brand)]">{item.value}</div>
                  <h2 className="mt-2 text-sm font-extrabold text-[var(--text-primary)]">{item.label}</h2>
                  <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{item.note}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="overflow-hidden rounded-[28px] border border-[var(--border)] bg-[var(--brand)] text-[var(--text-on-dark)] shadow-[0_30px_80px_-40px_rgba(5,5,121,0.55)]">
              <div className="border-b border-white/10 px-6 py-5">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Quick Access</p>
                <h2 className="mt-2 text-2xl font-black">เริ่มต้นจากสิ่งที่คุณต้องการ</h2>
                <p className="mt-2 text-sm leading-7 text-white/75">
                  เลือกเส้นทางการใช้งานที่ตรงกับบทบาทของคุณได้ทันทีจากปุ่มด้านล่าง
                </p>
              </div>

              <div className="space-y-3 px-5 py-5">
                {quickActions.map((item) =>
                  item.isLoginModal ? (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => setIsLoginModalOpen(true)}
                      className={`w-full rounded-2xl px-5 py-4 text-left text-sm font-bold transition sm:text-base ${
                        item.primary
                          ? "bg-[var(--cta)] text-white hover:bg-[var(--cta-hover)]"
                          : "border border-[var(--white-border)] bg-[var(--white-tint)] text-white hover:bg-white/14"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span>{item.label}</span>
                        <ArrowRight size={18} className="shrink-0" />
                      </span>
                    </button>
                  ) : (
                    <a
                      key={item.label}
                      href={item.href}
                      className={`block w-full rounded-2xl px-5 py-4 text-left text-sm font-bold transition sm:text-base ${
                        item.primary
                          ? "bg-[var(--cta)] text-white hover:bg-[var(--cta-hover)]"
                          : "border border-[var(--white-border)] bg-[var(--white-tint)] text-white hover:bg-white/14"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span>{item.label}</span>
                        <ArrowRight size={18} className="shrink-0" />
                      </span>
                    </a>
                  ),
                )}
              </div>
            </div>

            <div className="rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.3)]">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Why NEX</p>
              <h2 className="mt-2 text-2xl font-black text-[var(--brand)]">โครงสร้างที่ชัดเจน ใช้งานได้จริง</h2>
              <div className="mt-5 space-y-4">
                {trustPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-[var(--support-soft)] p-1 text-[var(--support-hover)]">
                      <CheckCircle2 size={16} />
                    </div>
                    <p className="text-sm leading-7 text-[var(--text-secondary)]">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.35)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Platform Direction</p>
            <h2 className="mt-3 text-3xl font-black text-[var(--brand)]">
              ทุกหน้าควรพาผู้ใช้ไปสู่การตัดสินใจที่ชัดเจน
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[var(--text-secondary)]">
              หน้าแรกของ NEX ถูกวางให้สื่อสารคุณค่าอย่างตรงประเด็น ลด visual noise และจัดลำดับ CTA
              ให้เด่นเฉพาะจุดสำคัญ เพื่อให้ผู้ใช้เข้าใจแพลตฟอร์มและเลือกการดำเนินการต่อได้เร็วขึ้น
            </p>
          </div>

          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface-alt)] p-6 shadow-[0_25px_60px_-45px_rgba(5,5,121,0.28)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Primary CTA</p>
            <div className="mt-3 text-3xl font-black text-[var(--brand)]">พร้อมเริ่มใช้งาน?</div>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              เข้าสู่ระบบเพื่อจัดการเครื่องมือธุรกิจของคุณจากศูนย์ควบคุมเดียว
            </p>
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[var(--cta)] px-5 py-4 text-base font-bold text-white transition hover:bg-[var(--cta-hover)]"
            >
              เข้าสู่ระบบ NEX
            </button>
          </div>
        </section>

        <section
          id="audience"
          className="mt-6 rounded-[32px] border border-[var(--border)] bg-white/90 p-6 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.25)] sm:p-8"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">Use Cases</p>
            <h2 className="mt-3 text-3xl font-black text-[var(--brand)]">NEX ถูกออกแบบให้ตรงกับบริบทการใช้งานจริง</h2>
            <p className="mt-4 text-base leading-8 text-[var(--text-secondary)]">
              หน้าแรกไม่ควรพูดกว้างเกินไปจนผู้ใช้ไม่แน่ใจว่าระบบนี้เกี่ยวกับตัวเองอย่างไร ส่วนนี้จึงทำหน้าที่
              แปลคุณค่าของแพลตฟอร์มให้ตรงกับบทบาทของผู้ใช้แต่ละกลุ่ม
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {userPaths.map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-muted)] p-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.25)]"
              >
                <div className="inline-flex rounded-2xl bg-[var(--surface-alt)] p-3 text-[var(--brand)]">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 text-xl font-black text-[var(--text-primary)]">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="workflow"
          className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]"
        >
          <div className="rounded-[32px] border border-[var(--border)] bg-[var(--brand)] p-6 text-white shadow-[0_30px_80px_-45px_rgba(5,5,121,0.6)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70">Working Flow</p>
            <h2 className="mt-3 text-3xl font-black">เริ่มต้นง่าย แต่ขยายต่อได้เป็นระบบ</h2>
            <div className="mt-8 space-y-4">
              {journeySteps.map((item) => (
                <article
                  key={item.step}
                  className="rounded-[24px] border border-white/10 bg-white/8 p-5 backdrop-blur"
                >
                  <div className="text-xs font-black uppercase tracking-[0.24em] text-[#FDBA74]">{item.step}</div>
                  <h3 className="mt-2 text-xl font-black">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/75">{item.description}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.3)] sm:p-8">
            <div className="inline-flex rounded-full border border-[#FED7AA] bg-[var(--cta-soft)] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#C2410C]">
              <Sparkles size={14} className="mr-1.5" />
              UX Focus
            </div>
            <h2 className="mt-4 text-2xl font-black text-[var(--brand)]">จบหน้าด้วย action ที่ชัด</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
              ผู้ใช้ที่พร้อมเริ่มควรเห็นทางไปต่อทันที ส่วนผู้ใช้ที่ยังประเมินอยู่ควรมีลิงก์ไปอ่านข้อมูลเพิ่มโดยไม่แย่งความเด่นของ CTA หลัก
            </p>
            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--cta)] px-5 py-4 text-base font-bold text-white transition hover:bg-[var(--cta-hover)]"
              >
                เข้าสู่ Control Center
                <ArrowRight size={18} />
              </button>
              <Link
                href="/what-is-nex"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-[var(--border-strong)] bg-[var(--surface)] px-5 py-4 text-base font-bold text-[var(--brand)] transition hover:border-[var(--brand)] hover:bg-[var(--surface-alt)]"
              >
                อ่านภาพรวมของ NEX
              </Link>
            </div>
          </aside>
        </section>

        <footer className="mt-6 rounded-[32px] border border-[var(--border)] bg-white/85 px-6 py-6 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.25)] sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-sm font-black uppercase tracking-[0.18em] text-[var(--brand)]">NEX Solution</div>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-muted)]">
                Digital business platform ที่วางโครงสร้างให้ธุรกิจสื่อสารตัวตน เครื่องมือขาย และ conversion path ได้ชัดเจนขึ้น
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm font-semibold text-[var(--text-secondary)]">
              {footerLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-full border border-[var(--border)] px-4 py-2 transition hover:border-[var(--border-strong)] hover:bg-[var(--bg-page)] hover:text-[var(--brand)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </footer>
      </div>

      {isLoginModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] px-4 backdrop-blur-sm"
          onClick={() => setIsLoginModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-[28px] border border-[var(--border)] bg-[var(--surface)] p-6 text-[var(--text-primary)] shadow-[0_30px_100px_-45px_rgba(15,23,42,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] transition hover:bg-[var(--bg-page)]"
            >
              <X size={16} />
            </button>

            <div className="mb-5 text-center">
              <h3 className="text-3xl font-black text-[var(--brand)]">เข้าสู่ระบบ</h3>
              <p className="mt-1 text-sm text-[var(--text-muted)]">ยินดีต้อนรับกลับสู่ NEX Platform</p>
            </div>

            {loginError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700">
                {loginError}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm font-bold text-[var(--text-primary)] transition hover:bg-[var(--bg-page)]"
              >
                ดำเนินการด้วย Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("line")}
                className="w-full rounded-xl border border-[#D9F99D] bg-[var(--support-soft)] px-4 py-3 text-sm font-bold text-[#3F6212] transition hover:bg-[#ECFCCB]"
              >
                ดำเนินการด้วย LINE
              </button>
            </div>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-[var(--border)]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">หรือ</span>
              <div className="h-px flex-1 bg-[var(--border)]" />
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <input
                type="text"
                required
                value={loginData.identifier}
                onChange={(e) => setLoginData((prev) => ({ ...prev, identifier: e.target.value }))}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--text-primary)] placeholder:text-[#94A3B8] focus:border-[var(--brand)] focus:outline-none focus:ring-4 focus:ring-[var(--surface-alt)]"
                placeholder="อีเมลหรือเบอร์โทรศัพท์"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 pr-11 text-[var(--text-primary)] placeholder:text-[#94A3B8] focus:border-[var(--brand)] focus:outline-none focus:ring-4 focus:ring-[var(--surface-alt)]"
                  placeholder="รหัสผ่าน"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-[var(--brand)]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full rounded-xl bg-[var(--cta)] px-4 py-3 text-base font-black text-white transition hover:bg-[var(--cta-hover)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    กำลังเข้าสู่ระบบ...
                  </span>
                ) : (
                  "เข้าสู่ระบบ"
                )}
              </button>
            </form>

            <div className="mt-4 text-center text-sm">
              <Link href="/forgot-password" className="text-[var(--brand)] hover:text-[var(--brand-hover)]">
                ลืมรหัสผ่านใช่หรือไม่?
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
