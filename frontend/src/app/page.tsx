"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Globe, Zap, Shield, BarChart3, Share2, CheckCircle, Phone, Mail } from 'lucide-react';
import { dictionary, Language } from '@/lib/i18n';
import { ThemeToggle } from '@/components/ThemeToggle';

// --- Demo Card Data ---
const DEMO_PROFILE = {
  name: "ณัฐพงษ์ สุริยะ",
  nameEn: "Natthaphong Suriya",
  title: "Chief Digital Officer",
  company: "TechVenture Asia",
  phone: "+66 89-123-4567",
  email: "natthaphong@techventure.co.th",
  tags: ["FinTech", "AI Strategy", "Digital Transformation"],
  avatarColor: "from-blue-600 to-indigo-700",
};

// --- Stats ---
const STATS = [
  { value: "12,000+", label: "ผู้ใช้งาน" },
  { value: "3.2M", label: "การแชร์" },
  { value: "98%", label: "ความพึงพอใจ" },
];

export default function LandingPage() {
  const [lang, setLang] = useState<Language>('th');
  const t = dictionary[lang];

  return (
    <main className="min-h-screen bg-background text-foreground relative overflow-x-hidden transition-colors duration-500" style={{ fontFamily: "'Plus Jakarta Sans', 'Sarabun', sans-serif" }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Sarabun:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Ambient Background */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      {/* ═══════════ NAVBAR ═══════════ */}
      <nav className="sticky top-0 z-50 border-b border-foreground/5 backdrop-blur-xl bg-background/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <img
              src="/logo-namecard-ai.png"
              alt="NAMECARD.AI"
              className="h-12 w-auto object-contain"
              style={{ maxWidth: '260px' }}
            />
          </div>

          {/* Nav Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setLang(lang === 'en' ? 'th' : 'en')}
              className="text-sm font-medium text-foreground/60 hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-foreground/5"
            >
              <Globe size={14} />
              {lang === 'en' ? 'TH' : 'EN'}
            </button>
            <Link
              href="/login"
              className="bg-primary text-white text-sm font-bold px-5 py-2 rounded-full hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
            >
              {t.nav.login}
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════ HERO — SPLIT LAYOUT ═══════════ */}
      <section className="max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

        {/* LEFT — Copy */}
        <div className="order-2 lg:order-1 flex flex-col gap-6">
          {/* Badge */}
          <div className="inline-flex w-fit items-center gap-2 bg-primary/10 border border-primary/20 text-primary text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest">
            <Zap size={12} />
            {lang === 'th' ? 'แพลตฟอร์ม AI พลัง #1 ในไทย' : '#1 AI-Powered Platform in Thailand'}
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight">
            {lang === 'th' ? (
              <>
                นามบัตรดิจิทัล<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">พลัง AI</span>
                <br />สำหรับมืออาชีพ
              </>
            ) : (
              <>
                AI-Powered<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Digital Business</span>
                <br />Card Platform
              </>
            )}
          </h1>

          {/* Subheadline */}
          <p className="text-base md:text-lg text-foreground/60 leading-relaxed max-w-lg">
            {t.hero.description}
          </p>

          {/* Value Props */}
          <ul className="flex flex-col gap-2.5 text-sm">
            {[
              lang === 'th' ? 'แชร์ผ่าน QR Code, NFC หรือลิงก์ได้ทันที' : 'Share via QR Code, NFC or link instantly',
              lang === 'th' ? 'ติดตามสถิติแบบ Real-time' : 'Track analytics in real-time',
              lang === 'th' ? 'ไม่ต้องติดตั้งแอป เปิดได้ทุกอุปกรณ์' : 'No app install needed — works everywhere',
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-2.5 text-foreground/70">
                <CheckCircle size={16} className="text-primary flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold text-base px-7 py-3.5 rounded-full transition-all shadow-lg shadow-primary/25 hover:scale-105"
            >
              {t.hero.get_started} <ArrowRight size={18} />
            </Link>
            <Link
              href="/2f265/admin_01_10bbe"
              target="_blank"
              className="inline-flex items-center gap-2 bg-foreground/5 hover:bg-foreground/10 text-foreground font-semibold text-base px-7 py-3.5 rounded-full border border-foreground/10 transition-all hover:scale-105"
            >
              <Globe size={16} />
              {lang === 'th' ? 'ดูตัวอย่างจริง' : 'Live Demo'}
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-8 pt-4 border-t border-foreground/8 mt-2">
            {STATS.map((s) => (
              <div key={s.label}>
                <div className="text-xl font-extrabold text-primary">{s.value}</div>
                <div className="text-xs text-foreground/50 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Live Demo Card Preview */}
        <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[340px]">
            {/* Glow */}
            <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full -z-10 scale-75 opacity-60" />

            {/* Phone Frame */}
            <div className="relative bg-zinc-900 rounded-[40px] p-2 shadow-2xl shadow-black/50 ring-1 ring-white/10">
              <div className="bg-black rounded-[34px] overflow-hidden">

                {/* Status Bar */}
                <div className="bg-zinc-950 px-6 py-2 flex justify-between items-center">
                  <span className="text-white text-xs font-medium">9:41</span>
                  <div className="w-28 h-5 bg-black rounded-full mx-auto absolute left-1/2 -translate-x-1/2" />
                  <div className="flex gap-1 items-center">
                    <div className="w-4 h-2.5 rounded-sm border border-white/60 relative">
                      <div className="absolute inset-0.5 bg-white/80 rounded-sm" style={{ width: '70%' }} />
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 min-h-[520px] flex flex-col">

                  {/* Banner / Avatar Area */}
                  <div className={`bg-gradient-to-br ${DEMO_PROFILE.avatarColor} h-44 relative flex items-end`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent" />
                    {/* Avatar */}
                    <div className="relative mx-auto mb-[-32px] w-20 h-20 rounded-2xl bg-white/10 backdrop-blur border-2 border-white/30 flex items-center justify-center text-2xl font-extrabold text-white shadow-xl">
                      {DEMO_PROFILE.name.charAt(0)}
                    </div>
                  </div>

                  {/* Profile Info */}
                  <div className="flex flex-col items-center text-center px-5 pt-12 pb-4 gap-1">
                    <h2 className="text-base font-bold text-white leading-tight">{DEMO_PROFILE.name}</h2>
                    <p className="text-[11px] text-white/60">{DEMO_PROFILE.nameEn}</p>
                    <p className="text-[12px] font-semibold text-primary mt-0.5">{DEMO_PROFILE.title}</p>
                    <p className="text-[11px] text-white/50">{DEMO_PROFILE.company}</p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5 justify-center mt-2">
                      {DEMO_PROFILE.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/20">{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* Contact actions */}
                  <div className="px-5 flex flex-col gap-2 mt-1 pb-4">
                    <a className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5 border border-white/8 hover:bg-white/10 transition-colors cursor-default">
                      <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <Phone size={14} className="text-green-400" />
                      </div>
                      <div className="text-left">
                        <div className="text-[9px] text-white/40 uppercase font-bold">Mobile</div>
                        <div className="text-[11px] text-white font-medium">{DEMO_PROFILE.phone}</div>
                      </div>
                    </a>
                    <a className="flex items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5 border border-white/8 hover:bg-white/10 transition-colors cursor-default">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                        <Mail size={14} className="text-blue-400" />
                      </div>
                      <div className="text-left">
                        <div className="text-[9px] text-white/40 uppercase font-bold">Email</div>
                        <div className="text-[11px] text-white font-medium">{DEMO_PROFILE.email}</div>
                      </div>
                    </a>

                    {/* Save Contact CTA */}
                    <button className="mt-1 w-full bg-primary text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-default">
                      <Share2 size={13} />
                      {lang === 'th' ? 'บันทึกผู้ติดต่อ' : 'Save Contact'}
                    </button>
                  </div>

                  {/* Footer brand */}
                  <div className="text-center pb-4 text-[9px] text-white/20 font-medium tracking-widest">
                    POWERED BY NAMECARD.AI
                  </div>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -right-4 top-1/3 bg-primary/90 backdrop-blur text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg shadow-primary/30 flex items-center gap-1.5 ring-1 ring-white/20">
              <div className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
              {lang === 'th' ? 'ตัวอย่างจริง' : 'Live Preview'}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-foreground/5">
        <div className="text-center mb-14">
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-3">
            {lang === 'th' ? 'ทำไมต้องเลือกเรา' : 'Why Choose Us'}
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {lang === 'th' ? 'ครบจบในที่เดียว' : 'Everything in One Place'}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: <Zap size={22} className="text-yellow-400" />, bg: "bg-yellow-400/10", title: lang === 'th' ? 'แชร์ได้ทันที' : 'Instant Share', desc: lang === 'th' ? 'QR Code, NFC, Link พร้อมใช้งานทันที' : 'QR, NFC, Link — ready in seconds' },
            { icon: <Shield size={22} className="text-green-400" />, bg: "bg-green-400/10", title: lang === 'th' ? 'ปลอดภัยสูง' : 'Secure', desc: lang === 'th' ? 'เข้ารหัสระดับธนาคาร รองรับองค์กร' : 'Bank-grade encryption for enterprise' },
            { icon: <BarChart3 size={22} className="text-blue-400" />, bg: "bg-blue-400/10", title: lang === 'th' ? 'วิเคราะห์ข้อมูล' : 'Analytics', desc: lang === 'th' ? 'ดูสถิติผู้เข้าชมแบบ Real-time' : 'Real-time visitor & lead tracking' },
            { icon: <Globe size={22} className="text-purple-400" />, bg: "bg-purple-400/10", title: lang === 'th' ? 'รองรับทุกภาษา' : 'Multilingual', desc: lang === 'th' ? 'ไทย-อังกฤษ AI แปลภาษาอัตโนมัติ' : 'TH-EN AI translation built-in' },
          ].map((f, i) => (
            <div key={i} className="bg-foreground/3 hover:bg-foreground/5 border border-foreground/8 rounded-2xl p-6 transition-all hover:shadow-lg hover:shadow-primary/5 group">
              <div className={`w-11 h-11 rounded-xl ${f.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {f.icon}
              </div>
              <h3 className="font-bold text-base mb-1.5">{f.title}</h3>
              <p className="text-foreground/55 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA BANNER ═══════════ */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="relative overflow-hidden bg-gradient-to-r from-primary/90 to-secondary rounded-3xl px-8 py-12 text-center text-white shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 0.5px, transparent 0.5px), radial-gradient(circle at 80% 50%, white 0.5px, transparent 0.5px)', backgroundSize: '30px 30px' }} />
          <h2 className="text-2xl md:text-3xl font-extrabold mb-3 relative">
            {lang === 'th' ? 'พร้อมสร้างนามบัตรดิจิทัลของคุณ?' : 'Ready to go digital?'}
          </h2>
          <p className="text-white/80 mb-7 text-sm md:text-base relative">
            {lang === 'th' ? 'เริ่มต้นฟรี ไม่ต้องใส่บัตรเครดิต ติดตั้งใน 3 นาที' : 'Start free — no credit card needed. Up in 3 minutes.'}
          </p>
          <Link
            href="/login"
            className="relative inline-flex items-center gap-2 bg-white text-primary font-extrabold px-8 py-3.5 rounded-full hover:scale-105 transition-all shadow-lg text-sm"
          >
            {t.hero.get_started} <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-foreground/5 py-8 text-center text-foreground/35 text-sm">
        © {new Date().getFullYear()} NAMECARD.AI — {t.footer}
      </footer>
    </main>
  );
}
