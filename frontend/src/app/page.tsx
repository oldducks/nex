"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  Eye,
  EyeOff,
  LayoutTemplate,
  Loader2,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

type QuickAction = {
  label: string;
  href?: string;
  primary?: boolean;
  tone?: "navy" | "orange";
  isLoginModal?: boolean;
  isRegisterModal?: boolean;
};

const quickActions: QuickAction[] = [
  { label: "เข้าสู่ระบบ", primary: true, tone: "orange", isLoginModal: true },
  { label: "สมัครเป็น NEX Digital Agent", tone: "navy", isRegisterModal: true },
  { label: "NEX คืออะไร", href: "/what-is-nex", tone: "navy" },
  { label: "โซลูชันสำหรับองค์กร", href: "/enterprise", tone: "navy" },
];

const trustPoints = [
  {
    icon: ShieldCheck,
    title: "ดูน่าเชื่อถือทันที",
    description: "รวมข้อมูลธุรกิจให้เป็นระเบียบ แชร์ง่าย และพร้อมใช้งานต่อหน้าลูกค้า",
  },
  {
    icon: LayoutTemplate,
    title: "มีเครื่องมือขายในระบบเดียว",
    description: "จัดการ namecard, catalog, form และ landing page โดยไม่ต้องกระโดดหลายระบบ",
  },
  {
    icon: BriefcaseBusiness,
    title: "เหมาะทั้งรายบุคคลและทีม",
    description: "ใช้ได้ตั้งแต่เจ้าของกิจการ ตัวแทนขาย ไปจนถึงทีมงานในองค์กร",
  },
];

const proofStats = [
  { value: "4", label: "เครื่องมือหลัก", note: "Namecard, Catalog, Form, Landing Page" },
  { value: "1", label: "ศูนย์ควบคุมเดียว", note: "จัดการข้อมูลธุรกิจจากหน้าเดียว" },
  { value: "24/7", label: "พร้อมแชร์เสมอ", note: "ลิงก์เดียวใช้ได้ทุกเวลาและทุกช่องทาง" },
];

const audienceGroups = [
  {
    icon: Sparkles,
    title: "เจ้าของธุรกิจ",
    description: "สร้างตัวตนออนไลน์ที่สื่อสารความน่าเชื่อถือได้เร็วขึ้น",
  },
  {
    icon: BadgeCheck,
    title: "ฝ่ายขายและตัวแทน",
    description: "มีหน้าแนะนำตัวและเครื่องมือปิดการขายที่ทีมใช้มาตรฐานเดียวกันได้",
  },
  {
    icon: Building2,
    title: "องค์กร",
    description: "คุมภาพลักษณ์ดิจิทัลของหลายผู้ใช้งานให้เป็นระบบมากขึ้น",
  },
];

function ActionButton({
  item,
  onLogin,
  onRegister,
}: {
  item: QuickAction;
  onLogin: () => void;
  onRegister: () => void;
}) {
  const className = `group w-full rounded-[24px] px-6 py-5 text-left text-base font-bold ${
    item.tone === "orange"
      ? "bg-[#F97316] text-white shadow-[0_22px_45px_-30px_rgba(249,115,22,0.8)] hover:bg-[#EA580C]"
      : "border border-[#D9E1F2] bg-[#050579] text-white shadow-[0_24px_50px_-38px_rgba(5,5,121,0.55)] hover:bg-[#07079A]"
  }`;

  const content = (
    <span className="flex items-center justify-between gap-3">
      <span>{item.label}</span>
      <ArrowRight size={18} className="shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
    </span>
  );

  if (item.isLoginModal) {
    return (
      <button type="button" onClick={onLogin} className={className}>
        {content}
      </button>
    );
  }

  if (item.isRegisterModal) {
    return (
      <button type="button" onClick={onRegister} className={className}>
        {content}
      </button>
    );
  }

  if (!item.href) return null;

  return item.href.startsWith("http") ? (
    <a href={item.href} className={className}>
      {content}
    </a>
  ) : (
    <Link href={item.href} className={className}>
      {content}
    </Link>
  );
}

function AuthModal({
  title,
  subtitle,
  isOpen,
  onClose,
  error,
  children,
}: {
  title: string;
  subtitle: string;
  isOpen: boolean;
  onClose: () => void;
  error: string;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/45 px-4 py-6 backdrop-blur-sm" onClick={onClose}>
      <div
        className="surface-panel relative w-full max-w-md rounded-[28px] bg-white p-6 text-[#0F172A] shadow-[0_30px_100px_-45px_rgba(15,23,42,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#D9E1F2] bg-white text-[#475569] hover:bg-[#F6F8FF]"
          aria-label="Close modal"
        >
          <X size={16} />
        </button>

        <div className="mb-5 text-center">
          <h3 className="text-3xl font-black text-[#050579]">{title}</h3>
          <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {children}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsLoginModalOpen(false);
        setIsRegisterModalOpen(false);
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
        body: JSON.stringify(loginData),
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError("");

    if (!registerData.email || !registerData.password) {
      setRegisterError("กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setRegisterError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (registerData.password.length < 8) {
      setRegisterError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setIsRegisterSubmitting(true);

    try {
      const res = await fetch(`${apiUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: registerData.email,
          password: registerData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "การลงทะเบียนล้มเหลว");

      window.location.href = "/manage/control-center";
    } catch (error: unknown) {
      setRegisterError(error instanceof Error ? error.message : "เกิดข้อผิดพลาด กรุณาลองใหม่");
      setIsRegisterSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#EEF0FF] text-[#0F172A]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_34%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.45),transparent_42%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_26%),linear-gradient(180deg,#f6f8ff_0%,#eef0ff_50%,#e7edff_100%)]" />
      </div>
      <div className="pointer-events-none absolute left-[-8rem] top-16 h-80 w-80 rounded-full bg-sky-300/20 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-6rem] top-32 h-72 w-72 rounded-full bg-sky-200/25 blur-[110px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[28rem] max-w-5xl rounded-full bg-white/35 blur-[120px]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 pb-8 pt-5 sm:px-8 sm:pb-10 sm:pt-8">
        <nav className="surface-panel mb-8 flex flex-col gap-4 rounded-[28px] border border-white/70 bg-white/75 px-5 py-4 backdrop-blur xl:flex-row xl:items-center xl:justify-between">
          <Link href="/" className="flex items-center gap-3 text-[#050579]">
            <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-[#D9E1F2] bg-white">
              <Image src="/nex_logo_nobg.png" alt="NEX" fill className="object-contain p-1.5" unoptimized />
            </div>
            <div>
              <div className="text-sm font-black uppercase tracking-[0.2em]">NEX Solution</div>
              <div className="text-xs text-[#64748B]">Digital business platform</div>
            </div>
          </Link>

          <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-[#475569]">
            <a href="#value" className="rounded-full px-3 py-2 hover:bg-white/80 hover:text-[#050579]">
              จุดเด่น
            </a>
            <a href="#audience" className="rounded-full px-3 py-2 hover:bg-white/80 hover:text-[#050579]">
              เหมาะกับใคร
            </a>
            <a href="#actions" className="rounded-full px-3 py-2 hover:bg-white/80 hover:text-[#050579]">
              เริ่มใช้งาน
            </a>
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="rounded-full bg-[#F97316] px-4 py-2 text-white hover:bg-[#EA580C]"
            >
              เข้าสู่ระบบ
            </button>
          </div>
        </nav>

        <section className="grid flex-1 content-center gap-8 py-4 lg:min-h-[calc(100vh-14rem)] lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:items-center lg:gap-12 lg:py-8">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-[#CBD5E1] bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#050579]">
              Platform For Digital Business Presence
            </p>
            <h1 className="mt-5 text-5xl font-black tracking-[-0.06em] text-[#050579] sm:text-6xl lg:text-7xl">
              แพลตฟอร์มที่ทำให้ธุรกิจของคุณดูพร้อมขายมากขึ้นตั้งแต่ลิงก์แรก
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#475569] sm:text-lg">
              NEX ช่วยจัดการตัวตนดิจิทัลของธุรกิจให้อยู่ในระบบเดียว ตั้งแต่นามบัตรดิจิทัล แคตตาล็อก ฟอร์ม
              และหน้าแคมเปญ เพื่อให้คุณแชร์ข้อมูลได้ง่าย อ่านง่าย และดูน่าเชื่อถือขึ้นทุกจุดสัมผัส
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setIsRegisterModalOpen(true)}
                className="rounded-full bg-[#F97316] px-6 py-3 text-sm font-black text-white shadow-[0_20px_40px_-26px_rgba(249,115,22,0.8)] hover:bg-[#EA580C]"
              >
                เริ่มสร้างบัญชี
              </button>
              <Link
                href="/what-is-nex"
                className="rounded-full border border-[#CBD5E1] bg-white/80 px-6 py-3 text-sm font-black text-[#050579] hover:border-[#94A3B8] hover:bg-white"
              >
                ดูภาพรวมแพลตฟอร์ม
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {proofStats.map((item) => (
                <div key={item.label} className="surface-panel rounded-[24px] px-5 py-5">
                  <div className="text-3xl font-black text-[#050579]">{item.value}</div>
                  <div className="mt-2 text-sm font-bold text-[#0F172A]">{item.label}</div>
                  <div className="mt-1 text-sm leading-6 text-[#64748B]">{item.note}</div>
                </div>
              ))}
            </div>
          </div>

          <div id="actions" className="section-shell rounded-[32px]">
            <div className="surface-panel rounded-[32px] border border-white/80 bg-white/80 p-6 sm:p-8">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F97316]">Quick Start</p>
                  <h2 className="mt-3 text-3xl font-black text-[#050579]">เลือกเส้นทางที่ตรงกับเป้าหมายของคุณ</h2>
                </div>
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-[#D9E1F2] bg-white">
                  <Image src="/nex_logo_nobg.png" alt="NEX Solution" fill className="object-contain p-1.5" unoptimized />
                </div>
              </div>

              <p className="mb-6 text-sm leading-7 text-[#64748B]">
                เริ่มจากเข้าสู่ระบบ สมัครใช้งาน หรือดูข้อมูลผลิตภัณฑ์ให้ครบก่อนตัดสินใจได้จากหน้าเดียว
              </p>

              <div className="grid gap-4">
                {quickActions.map((item) => (
                  <ActionButton
                    key={item.label}
                    item={item}
                    onLogin={() => setIsLoginModalOpen(true)}
                    onRegister={() => setIsRegisterModalOpen(true)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="value" className="section-shell rounded-[36px] py-4 lg:py-5">
          <div className="surface-panel rounded-[36px] px-6 py-8 sm:px-8 sm:py-10">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F97316]">Why NEX</p>
              <h2 className="mt-3 text-3xl font-black text-[#050579] sm:text-4xl">
                ออกแบบให้ conversion และความน่าเชื่อถือเดินไปด้วยกัน
              </h2>
              <p className="mt-4 text-base leading-8 text-[#475569]">
                หน้าแรกนี้ต้องพาคนเข้าใจเร็วว่าแพลตฟอร์มทำอะไร เหมาะกับใคร และควรคลิกอะไรต่อ โดยไม่ทำให้ข้อมูลแน่นเกินไป
              </p>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {trustPoints.map((point) => (
                <article key={point.title} className="rounded-[28px] border border-[#D9E1F2] bg-white/80 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#EEF4FF] text-[#050579]">
                    <point.icon size={22} />
                  </div>
                  <h3 className="mt-5 text-2xl font-black text-[#0F172A]">{point.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#64748B]">{point.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="audience" className="py-4 lg:py-5">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
            <div className="surface-panel rounded-[32px] px-6 py-8 sm:px-8">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F97316]">Built For</p>
              <h2 className="mt-3 text-3xl font-black text-[#050579] sm:text-4xl">ใช้ได้ตั้งแต่คนขายเดี่ยวไปจนถึงทีมองค์กร</h2>
              <p className="mt-4 text-base leading-8 text-[#475569]">
                ถ้าคุณต้องการหน้าแนะนำธุรกิจที่ดูเป็นมืออาชีพ พร้อมแชร์ข้อมูลและต่อยอดการขายได้ NEX ถูกวางมาให้ทำหน้าที่นั้น
              </p>
            </div>

            <div className="grid gap-4">
              {audienceGroups.map((group) => (
                <article key={group.title} className="surface-panel rounded-[28px] px-6 py-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#050579] text-white">
                      <group.icon size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#0F172A]">{group.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-[#64748B]">{group.description}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <footer className="mt-auto pt-6 text-center text-sm leading-7 text-[#64748B]">
          <p>© NEX Solution. All rights reserved. บริษัท คราม อินเทลลิเจนท์ เอไอ จำกัด KHRAM INTELLIGENT AI Co., Ltd.</p>
        </footer>
      </div>

      <AuthModal
        title="เข้าสู่ระบบ"
        subtitle="ยินดีต้อนรับกลับสู่ NEX Platform"
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        error={loginError}
      >
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="w-full rounded-xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm font-bold text-[#0F172A] hover:bg-[#F6F8FF]"
          >
            ดำเนินการด้วย Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin("line")}
            className="w-full rounded-xl border border-[#D9F99D] bg-[#F7FEE7] px-4 py-3 text-sm font-bold text-[#3F6212] hover:bg-[#ECFCCB]"
          >
            ดำเนินการด้วย LINE
          </button>
        </div>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#D9E1F2]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">หรือ</span>
          <div className="h-px flex-1 bg-[#D9E1F2]" />
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={loginData.email}
            onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full rounded-xl border border-[#D9E1F2] bg-white px-4 py-3 text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#050579] focus:outline-none focus:ring-4 focus:ring-[#E8ECFF]"
            placeholder="อีเมล"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={loginData.password}
              onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-xl border border-[#D9E1F2] bg-white px-4 py-3 pr-11 text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#050579] focus:outline-none focus:ring-4 focus:ring-[#E8ECFF]"
              placeholder="รหัสผ่าน"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#050579]"
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 w-full rounded-xl bg-[#F97316] px-4 py-3 text-base font-black text-white hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-70"
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
          <Link href="/forgot-password" className="text-[#050579] hover:text-[#07079A]">
            ลืมรหัสผ่านใช่หรือไม่?
          </Link>
        </div>
      </AuthModal>

      <AuthModal
        title="สมัครสมาชิก"
        subtitle="สร้างบัญชีใหม่เพื่อเริ่มใช้งาน"
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        error={registerError}
      >
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => handleSocialLogin("google")}
            className="w-full rounded-xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm font-bold text-[#0F172A] hover:bg-[#F6F8FF]"
          >
            ดำเนินการด้วย Google
          </button>
          <button
            type="button"
            onClick={() => handleSocialLogin("line")}
            className="w-full rounded-xl border border-[#D9F99D] bg-[#F7FEE7] px-4 py-3 text-sm font-bold text-[#3F6212] hover:bg-[#ECFCCB]"
          >
            ดำเนินการด้วย LINE
          </button>
        </div>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#D9E1F2]" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">หรือ</span>
          <div className="h-px flex-1 bg-[#D9E1F2]" />
        </div>

        <form onSubmit={handleRegisterSubmit} className="space-y-3">
          <input
            type="email"
            required
            value={registerData.email}
            onChange={(e) => setRegisterData((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full rounded-xl border border-[#D9E1F2] bg-white px-4 py-3 text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#050579] focus:outline-none focus:ring-4 focus:ring-[#E8ECFF]"
            placeholder="อีเมล"
          />
          <div className="relative">
            <input
              type={showRegisterPassword ? "text" : "password"}
              required
              value={registerData.password}
              onChange={(e) => setRegisterData((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-xl border border-[#D9E1F2] bg-white px-4 py-3 pr-11 text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#050579] focus:outline-none focus:ring-4 focus:ring-[#E8ECFF]"
              placeholder="รหัสผ่านอย่างน้อย 8 ตัวอักษร"
            />
            <button
              type="button"
              onClick={() => setShowRegisterPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#050579]"
              aria-label="Toggle register password visibility"
            >
              {showRegisterPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="relative">
            <input
              type={showRegisterConfirmPassword ? "text" : "password"}
              required
              value={registerData.confirmPassword}
              onChange={(e) => setRegisterData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              className="w-full rounded-xl border border-[#D9E1F2] bg-white px-4 py-3 pr-11 text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#050579] focus:outline-none focus:ring-4 focus:ring-[#E8ECFF]"
              placeholder="ยืนยันรหัสผ่าน"
            />
            <button
              type="button"
              onClick={() => setShowRegisterConfirmPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#050579]"
              aria-label="Toggle confirm password visibility"
            >
              {showRegisterConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={isRegisterSubmitting}
            className="mt-1 w-full rounded-xl bg-[#F97316] px-4 py-3 text-base font-black text-white hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isRegisterSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                กำลังสมัครสมาชิก...
              </span>
            ) : (
              "สมัครสมาชิก"
            )}
          </button>
        </form>
      </AuthModal>
    </main>
  );
}
