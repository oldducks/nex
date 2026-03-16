"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Eye,
  EyeOff,
  LayoutTemplate,
  Loader2,
  ShieldCheck,
  X,
} from "lucide-react";

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

export default function LandingPage() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginData, setLoginData] = useState({ email: "", password: "" });

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

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#EFF6FF] text-[#0F172A]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.22),transparent_34%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.45),transparent_42%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#eef6ff_48%,#e0f2fe_100%)]" />
      </div>

      <div className="pointer-events-none absolute left-[-8rem] top-16 h-80 w-80 rounded-full bg-sky-300/25 blur-[120px]" />
      <div className="pointer-events-none absolute right-[-6rem] top-32 h-72 w-72 rounded-full bg-sky-200/30 blur-[110px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-[28rem] max-w-5xl rounded-full bg-white/35 blur-[120px]" />

      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-5 sm:px-8 sm:pb-20 sm:pt-8">
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
              <span className="rounded-full border border-[#CBD5E1] bg-white/80 px-3 py-1 text-xs font-semibold text-[#475569]">
                Premium
              </span>
              <span className="rounded-full border border-[#CBD5E1] bg-white/80 px-3 py-1 text-xs font-semibold text-[#475569]">
                Business-ready
              </span>
              <span className="rounded-full border border-[#CBD5E1] bg-white/80 px-3 py-1 text-xs font-semibold text-[#475569]">
                Trust-focused
              </span>
            </div>
          </div>
        </header>

        <section className="grid gap-8 pb-8 pt-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] lg:items-start lg:pt-8">
          <div className="max-w-3xl">
            <p className="inline-flex rounded-full border border-[#CBD5E1] bg-white/80 px-4 py-2 text-[11px] font-black uppercase tracking-[0.24em] text-[#050579]">
              Modern Platform For Business Growth
            </p>
            <h1 className="mt-5 text-4xl font-black leading-[1.05] text-[#050579] sm:text-5xl lg:text-6xl">
              สร้างตัวตนธุรกิจ
              <span className="mt-2 block text-[#0F172A]">
                ให้ดูน่าเชื่อถือ พร้อมใช้งาน และพร้อมเติบโต
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[#475569] sm:text-lg">
              NEX ช่วยให้ธุรกิจนำเสนอข้อมูลสำคัญได้อย่างเป็นระบบ ผ่านนามบัตรดิจิทัล แคตตาล็อก
              หน้าแคมเปญ และเครื่องมือที่ออกแบบมาเพื่อการใช้งานจริงในเชิงพาณิชย์
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => setIsLoginModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F97316] px-6 py-4 text-base font-bold text-white transition hover:bg-[#EA580C]"
              >
                เข้าสู่ระบบ
                <ArrowRight size={18} />
              </button>
              <a
                href="https://nexsolution.cloud/what-is-nex"
                className="inline-flex items-center justify-center rounded-2xl border border-[#CBD5E1] bg-white px-6 py-4 text-base font-bold text-[#050579] transition hover:border-[#050579] hover:bg-[#EEF2FF]"
              >
                ดูรายละเอียดแพลตฟอร์ม
              </a>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {valuePoints.map(({ icon: Icon, title, description }) => (
                <article
                  key={title}
                  className="rounded-[24px] border border-[#E2E8F0] bg-white/90 p-5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.35)]"
                >
                  <div className="mb-4 inline-flex rounded-2xl bg-[#EEF2FF] p-3 text-[#050579]">
                    <Icon size={22} />
                  </div>
                  <h2 className="text-lg font-extrabold text-[#0F172A]">{title}</h2>
                  <p className="mt-2 text-sm leading-7 text-[#475569]">{description}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-5">
            <div className="overflow-hidden rounded-[28px] border border-[#E2E8F0] bg-[#050579] text-white shadow-[0_30px_80px_-40px_rgba(5,5,121,0.55)]">
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
                          ? "bg-[#F97316] text-white hover:bg-[#EA580C]"
                          : "border border-white/15 bg-white/8 text-white hover:bg-white/14"
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
                          ? "bg-[#F97316] text-white hover:bg-[#EA580C]"
                          : "border border-white/15 bg-white/8 text-white hover:bg-white/14"
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

            <div className="rounded-[28px] border border-[#E2E8F0] bg-white p-6 shadow-[0_20px_50px_-35px_rgba(15,23,42,0.3)]">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#475569]">Why NEX</p>
              <h2 className="mt-2 text-2xl font-black text-[#050579]">โครงสร้างที่ชัดเจน ใช้งานได้จริง</h2>
              <div className="mt-5 space-y-4">
                {trustPoints.map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="mt-0.5 rounded-full bg-[#F7FEE7] p-1 text-[#65A30D]">
                      <CheckCircle2 size={16} />
                    </div>
                    <p className="text-sm leading-7 text-[#475569]">{point}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="rounded-[32px] border border-[#E2E8F0] bg-white p-6 shadow-[0_25px_60px_-40px_rgba(15,23,42,0.35)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#475569]">Platform Direction</p>
            <h2 className="mt-3 text-3xl font-black text-[#050579]">
              ทุกหน้าควรพาผู้ใช้ไปสู่การตัดสินใจที่ชัดเจน
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-[#475569]">
              หน้าแรกของ NEX ถูกวางให้สื่อสารคุณค่าอย่างตรงประเด็น ลด visual noise และจัดลำดับ CTA
              ให้เด่นเฉพาะจุดสำคัญ เพื่อให้ผู้ใช้เข้าใจแพลตฟอร์มและเลือกการดำเนินการต่อได้เร็วขึ้น
            </p>
          </div>

          <div className="rounded-[32px] border border-[#E2E8F0] bg-[#EEF2FF] p-6 shadow-[0_25px_60px_-45px_rgba(5,5,121,0.35)]">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#475569]">Primary CTA</p>
            <div className="mt-3 text-3xl font-black text-[#050579]">พร้อมเริ่มใช้งาน?</div>
            <p className="mt-3 text-sm leading-7 text-[#475569]">
              เข้าสู่ระบบเพื่อจัดการเครื่องมือธุรกิจของคุณจากศูนย์ควบคุมเดียว
            </p>
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(true)}
              className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[#F97316] px-5 py-4 text-base font-bold text-white transition hover:bg-[#EA580C]"
            >
              เข้าสู่ระบบ NEX
            </button>
          </div>
        </section>
      </div>

      {isLoginModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/45 px-4 backdrop-blur-sm"
          onClick={() => setIsLoginModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-[28px] border border-[#E2E8F0] bg-white p-6 text-[#0F172A] shadow-[0_30px_100px_-45px_rgba(15,23,42,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#E2E8F0] bg-white text-[#475569] transition hover:bg-[#F8FAFC]"
            >
              <X size={16} />
            </button>

            <div className="mb-5 text-center">
              <h3 className="text-3xl font-black text-[#050579]">เข้าสู่ระบบ</h3>
              <p className="mt-1 text-sm text-[#64748B]">ยินดีต้อนรับกลับสู่ NEX Platform</p>
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
                className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-bold text-[#0F172A] transition hover:bg-[#F8FAFC]"
              >
                ดำเนินการด้วย Google
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("line")}
                className="w-full rounded-xl border border-[#D9F99D] bg-[#F7FEE7] px-4 py-3 text-sm font-bold text-[#3F6212] transition hover:bg-[#ECFCCB]"
              >
                ดำเนินการด้วย LINE
              </button>
            </div>

            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E2E8F0]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#94A3B8]">หรือ</span>
              <div className="h-px flex-1 bg-[#E2E8F0]" />
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={loginData.email}
                onChange={(e) => setLoginData((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#050579] focus:outline-none focus:ring-4 focus:ring-[#EEF2FF]"
                placeholder="อีเมล"
              />
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-xl border border-[#E2E8F0] bg-white px-4 py-3 pr-11 text-[#0F172A] placeholder:text-[#94A3B8] focus:border-[#050579] focus:outline-none focus:ring-4 focus:ring-[#EEF2FF]"
                  placeholder="รหัสผ่าน"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] transition hover:text-[#050579]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full rounded-xl bg-[#F97316] px-4 py-3 text-base font-black text-white transition hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-70"
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
          </div>
        </div>
      )}
    </main>
  );
}
