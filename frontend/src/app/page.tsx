"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2, X } from "lucide-react";

const quickActions = [
  { label: "เข้าสู่ระบบ", href: "/login", primary: true, isLoginModal: true },
  { label: "NEX Solution คืออะไร", href: "https://nexsolution.cloud/what-is-nex" },
  { label: "NEX Digital Asset Partner", href: "/register", isRegisterModal: true },
  { label: "โซลูชันสำหรับองค์กร", href: "https://nexsolution.cloud/enterprise" },
];

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

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 pb-10 pt-5 sm:px-8 sm:pb-12 sm:pt-8">
        <div className="flex flex-1 items-center justify-center">
          <section className="w-full max-w-md pt-8 text-center sm:pt-10">
            <div className="mx-auto w-full max-w-sm">
              <div className="relative mx-auto h-[150px] w-full overflow-visible sm:h-[200px] lg:h-[224px]">
                <Image
                  src="/nex_logo_nobg.png"
                  alt="NEX Solution"
                  fill
                  className="pointer-events-none object-contain scale-[1.3] sm:scale-[2.1] lg:scale-[2.8] drop-shadow-[0_28px_90px_rgba(59,130,246,0.18)]"
                  priority
                  unoptimized
                />
              </div>
            </div>

            <div className="mt-14 grid gap-4 sm:mt-16">
              {quickActions.map((item) =>
                item.isLoginModal ? (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setIsLoginModalOpen(true)}
                    className={`w-full rounded-[24px] px-6 py-5 text-left text-base font-bold transition ${
                      item.primary
                        ? "bg-[#F97316] text-white shadow-[0_22px_45px_-30px_rgba(249,115,22,0.8)] hover:bg-[#EA580C]"
                        : "border border-[#D9E1F2] bg-[#050579] text-white shadow-[0_24px_50px_-38px_rgba(5,5,121,0.55)] hover:bg-[#07079A]"
                    }`}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span>{item.label}</span>
                      <ArrowRight size={18} className="shrink-0" />
                    </span>
                  </button>
                ) : item.isRegisterModal ? (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setIsRegisterModalOpen(true)}
                    className={`w-full rounded-[24px] px-6 py-5 text-left text-base font-bold transition ${
                      item.primary
                        ? "bg-[#F97316] text-white shadow-[0_22px_45px_-30px_rgba(249,115,22,0.8)] hover:bg-[#EA580C]"
                        : "border border-[#D9E1F2] bg-[#050579] text-white shadow-[0_24px_50px_-38px_rgba(5,5,121,0.55)] hover:bg-[#07079A]"
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
                    className={`block w-full rounded-[24px] px-6 py-5 text-left text-base font-bold transition ${
                      item.primary
                        ? "bg-[#F97316] text-white shadow-[0_22px_45px_-30px_rgba(249,115,22,0.8)] hover:bg-[#EA580C]"
                        : "border border-[#D9E1F2] bg-[#050579] text-white shadow-[0_24px_50px_-38px_rgba(5,5,121,0.55)] hover:bg-[#07079A]"
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
          </section>
        </div>

        <footer className="pt-6 text-center text-sm leading-7 text-[#64748B]">
          © NEX Solution. All rights reserved. บริษัท คราม อินเทลลิเจนท์ เอไอ จำกัด KHRAM
          INTELLIGENT AI Co., Ltd.
        </footer>
      </div>

      {isLoginModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/45 px-4 backdrop-blur-sm"
          onClick={() => setIsLoginModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-[28px] border border-[#D9E1F2] bg-white p-6 text-[#0F172A] shadow-[0_30px_100px_-45px_rgba(15,23,42,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#D9E1F2] bg-white text-[#475569] transition hover:bg-[#F6F8FF]"
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
                className="w-full rounded-xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm font-bold text-[#0F172A] transition hover:bg-[#F6F8FF]"
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

      {isRegisterModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A]/45 px-4 backdrop-blur-sm"
          onClick={() => setIsRegisterModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-[28px] border border-[#D9E1F2] bg-white p-6 text-[#0F172A] shadow-[0_30px_100px_-45px_rgba(15,23,42,0.5)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setIsRegisterModalOpen(false)}
              className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-[#D9E1F2] bg-white text-[#475569] transition hover:bg-[#F6F8FF]"
            >
              <X size={16} />
            </button>

            <div className="mb-5 text-center">
              <h3 className="text-3xl font-black text-[#050579]">สมัครสมาชิก</h3>
              <p className="mt-1 text-sm text-[#64748B]">สร้างบัญชีใหม่เพื่อเริ่มใช้งาน</p>
            </div>

            {registerError && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-700">
                {registerError}
              </div>
            )}

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                className="w-full rounded-xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm font-bold text-[#0F172A] transition hover:bg-[#F6F8FF]"
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
                  placeholder="รหัสผ่าน"
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] transition hover:text-[#050579]"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] transition hover:text-[#050579]"
                >
                  {showRegisterConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button
                type="submit"
                disabled={isRegisterSubmitting}
                className="mt-1 w-full rounded-xl bg-[#F97316] px-4 py-3 text-base font-black text-white transition hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-70"
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
          </div>
        </div>
      )}
    </main>
  );
}
