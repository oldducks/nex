"use client";

import { useState } from "react";
import { Mail, ArrowLeft, Send, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setMessage("");

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
            const res = await fetch(`${API_URL}/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = (await res.json()) as { message?: string };

            if (!res.ok) {
                throw new Error(data.message || "Failed to send reset email");
            }

            setMessage("หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านให้แล้ว กรุณาตรวจสอบอีเมลของคุณ");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A]">
            <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
                <section className="w-full rounded-[28px] border border-[#D9E1F2] bg-white p-5 shadow-[0_24px_60px_-42px_rgba(5,5,121,0.2)] md:p-7">
                    <Link
                        href="/login"
                        className="inline-flex items-center gap-2 text-sm font-semibold text-[#475569] transition-colors hover:text-[#050579]"
                    >
                        <ArrowLeft size={18} />
                        กลับไปหน้าเข้าสู่ระบบ
                    </Link>

                    <div className="mt-6">
                        <h1 className="text-2xl font-black tracking-tight text-[#050579]">ลืมรหัสผ่าน</h1>
                        <p className="mt-2 text-sm leading-relaxed text-[#475569]">กรอกอีเมลเพื่อรับลิงก์สำหรับตั้งรหัสผ่านใหม่</p>
                    </div>

                    {message ? (
                        <div className="mt-5 rounded-2xl border border-[#BCE2C4] bg-[#F2FBF4] px-4 py-3 text-sm font-semibold text-[#166534]">
                            {message}
                        </div>
                    ) : null}

                    {error ? (
                        <div className="mt-5 rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm font-semibold text-[#B91C1C]">
                            {error}
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                        <div>
                            <label htmlFor="email" className="mb-2 block text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">
                                อีเมล
                            </label>
                            <div className="relative">
                                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={18} />
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="h-12 w-full rounded-xl border border-[#D9E1F2] bg-white pl-11 pr-4 text-sm text-[#0F172A] outline-none transition focus:border-[#A7B7E6] focus:ring-2 focus:ring-[#EEF0FF]"
                                    placeholder="name@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#F97316] px-4 text-sm font-bold text-white transition hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    กำลังส่งลิงก์...
                                </>
                            ) : (
                                <>
                                    <Send size={18} />
                                    ส่งลิงก์รีเซ็ตรหัสผ่าน
                                </>
                            )}
                        </button>
                    </form>
                </section>
            </main>
            <footer className="px-4 pb-6 text-center text-xs font-medium text-[#64748B]">
                © NEX Solution. All rights reserved. บริษัท คราม อินเทลลิเจนท์ เอไอ จำกัด KHRAM INTELLIGENT AI Co., Ltd.
            </footer>
        </div>
    );
}
