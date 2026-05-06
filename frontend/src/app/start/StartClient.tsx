'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Product = 'card' | 'catalog' | 'salepage';

interface StartClientProps {
  initialRef: string;
}

export default function StartClient({ initialRef }: StartClientProps) {
  const [activeProduct, setActiveProduct] = useState<Product>('card');
  const catalogVideoRef = useRef<HTMLVideoElement>(null);
  const [catalogPlaying, setCatalogPlaying] = useState(false);
  const salepageVideoRef = useRef<HTMLVideoElement>(null);
  const [salepagePlaying, setSalepagePlaying] = useState(false);

  useEffect(() => {
    fetch('/api/analytics/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'VIEW_LANDING_PAGE',
        metadata: {
          page: 'start',
          ref: initialRef,
        },
      }),
    }).catch(() => {});
  }, []);

  return (
    <div className="font-sans bg-[#EEF0FF] text-[#0F172A] overflow-x-hidden min-h-screen">
      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E7EB] shadow-sm">
        <div className="max-w-[1080px] mx-auto px-6 flex items-center justify-between h-[60px]">
          <Link href="/" className="flex items-center">
            <Image
              src="/nex-logo-current-transparent.png"
              alt="NEX Solution"
              width={100}
              height={36}
              className="object-contain"
              priority
            />
          </Link>
          <div className="flex items-center gap-2">
            <a
              href="#products"
              className="hidden sm:block text-[14px] text-[#475569] px-[14px] py-[6px] rounded-lg hover:text-[#050579] hover:bg-[#EEF0FF] transition-all"
            >
              ผลิตภัณฑ์
            </a>
            <a
              href="#compare"
              className="hidden sm:block text-[14px] text-[#475569] px-[14px] py-[6px] rounded-lg hover:text-[#050579] hover:bg-[#EEF0FF] transition-all"
            >
              เปรียบเทียบ
            </a>
            <a
              href="#pricing"
              className="hidden sm:block text-[14px] text-[#475569] px-[14px] py-[6px] rounded-lg hover:text-[#050579] hover:bg-[#EEF0FF] transition-all"
            >
              ราคา
            </a>
            <a
              href="#contact"
              className="hidden sm:block text-[14px] text-[#475569] px-[14px] py-[6px] rounded-lg hover:text-[#050579] hover:bg-[#EEF0FF] transition-all"
            >
              ติดต่อ
            </a>
            <Link
              href="/start/examples"
              className="hidden sm:block text-[14px] text-[#475569] px-[14px] py-[6px] rounded-lg hover:text-[#050579] hover:bg-[#EEF0FF] transition-all"
            >
              ตัวอย่าง
            </Link>
            <Link
              href="/start/enterprise"
              className="hidden sm:block text-[14px] text-[#475569] px-[14px] py-[6px] rounded-lg hover:text-[#050579] hover:bg-[#EEF0FF] transition-all"
            >
              ลูกค้าองค์กร
            </Link>
            <Link
              href="/login"
              className="hidden sm:block text-[14px] text-[#050579] px-4 py-[7px] rounded-lg border border-[#D9E1F2] hover:border-[#050579] transition-all"
            >
              เข้าสู่ระบบ
            </Link>
            <Link
              href="/register"
              className="text-[14px] font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white px-5 py-2 rounded-lg transition-all"
            >
              เริ่มต้นฟรี
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="pt-[120px] pb-20 px-6 relative overflow-hidden"
        style={{
          background:
            'linear-gradient(155deg, #03034F 0%, #050579 55%, #1010C0 100%)',
        }}
      >
        <div
          className="absolute -top-[150px] -right-[150px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse, rgba(249,115,22,.12) 0%, transparent 70%)',
          }}
        />
        <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          {/* Left */}
          <div>
            <div className="inline-flex items-center gap-2 bg-[#84CC16]/12 border border-[#84CC16]/30 text-[#BEF264] text-xs font-bold tracking-wider px-[14px] py-[5px] rounded-full mb-5">
              <span className="w-[6px] h-[6px] rounded-full bg-[#84CC16] animate-pulse" />
              มากกว่าตามบัตรดิจิทัล · ครบจบที่เดียว
            </div>
            <h1 className="text-[clamp(28px,4vw,48px)] font-bold text-white leading-[1.5] mb-4">
              บริการทั่วไปให้แค่ นามบัตร
              <em className="not-italic text-[#F97316] block mt-2">NEX ให้คุณ ขายได้จริง</em>
            </h1>
            <p className="text-[15px] text-white/72 leading-relaxed mb-7 max-w-[460px]">
              NEX Digital ID · NEX Catalog · NEX Sale Page
              <br />
              3 เครื่องมือที่ทำงานร่วมกัน — ตั้งแต่แนะนำตัว ถึงปิดการขาย ในระบบเดียว
            </p>
            <div className="flex gap-[10px] flex-wrap mb-8">
              <Link
                href="/register"
                className="bg-[#F97316] hover:bg-[#EA580C] text-white px-7 py-[13px] rounded-[10px] text-[15px] font-semibold transition-all shadow-[0_4px_20px_rgba(249,115,22,.35)] hover:-translate-y-px"
              >
                เริ่มต้นใช้งานฟรี →
              </Link>
              <a
                href="#products"
                className="bg-transparent text-white px-6 py-[13px] rounded-[10px] text-[15px] font-medium border border-white/30 hover:border-white/60 transition-all"
              >
                ดูตัวอย่างสินค้า
              </a>
            </div>
            <p className="text-xs text-white/45">
              <span className="text-[#BEF264]">✓ ฟรี</span> · ไม่ต้องผูกบัตรเครดิต
              · ตั้งต้นได้ใน 5 นาที
            </p>
          </div>

          {/* Right – VS Box (desktop only) */}
          <div
            className="hidden md:block rounded-[20px] p-5 backdrop-blur-sm border border-[#F97316]/40"
            style={{
              background: 'rgba(255,255,255,0.08)',
              boxShadow: '0 0 40px rgba(249,115,22,0.15), 0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            {/* orange top accent */}
            <div className="h-[3px] rounded-full mb-4" style={{ background: 'linear-gradient(90deg,transparent,#F97316,transparent)' }} />
            <div className="flex gap-[10px] mb-[10px] items-stretch">
              {/* Them */}
              <div className="flex-1 rounded-[10px] p-[14px] px-4 bg-white/8 border border-white/20">
                <div className="text-[11px] font-bold tracking-wider text-white/60 mb-2">
                  ตามบัตรดิจิทัลทั่วไป
                </div>
                {[
                  ['✓', 'ตามบัตรดิจิทัล'],
                  ['✓', 'QR Code'],
                  ['✗', 'Catalog สินค้า', true],
                  ['✗', 'Sale Page', true],
                  ['✗', 'Lead Form', true],
                  ['✗', 'Analytics', true],
                  ['✗', 'AI สร้างสื่อ', true],
                ].map(([icon, label, faded]) => (
                  <div
                    key={String(label)}
                    className={`flex items-center gap-[7px] text-xs mb-[5px] ${faded ? 'opacity-40' : ''} text-white/70`}
                  >
                    <span className="text-[11px]">{icon}</span>
                    {label}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center text-white/50 text-[12px] font-bold px-[2px]">
                VS
              </div>
              {/* Us */}
              <div
                className="flex-1 rounded-[10px] p-[14px] px-4 border border-[#F97316]/60"
                style={{ background: 'rgba(249,115,22,0.15)' }}
              >
                <div className="text-[11px] font-bold tracking-wider text-[#F97316] mb-2">
                  NEX Solution
                </div>
                {[
                  ['✓', 'NEX Digital ID'],
                  ['✓', 'QR Code + vCard'],
                  ['✓', 'NEX Catalog', '#BEF264'],
                  ['✓', 'NEX Sale Page', '#BEF264'],
                  ['✓', 'Lead Form', '#BEF264'],
                  ['✓', 'Analytics', '#BEF264'],
                  ['✓', 'AI สร้างสื่อ', '#BEF264'],
                ].map(([icon, label, color]) => (
                  <div
                    key={String(label)}
                    className="flex items-center gap-[7px] text-xs mb-[5px] text-white"
                  >
                    <span
                      className="text-[11px]"
                      style={color ? { color: String(color) } : undefined}
                    >
                      {icon}
                    </span>
                    {label}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center text-[12px] text-white/70 pt-[10px] border-t border-white/15">
              NEX มีมากกว่าบริการทั่วไปถึง{' '}
              <strong className="text-[#F97316]">5 ฟีเจอร์</strong>{' '}
              — ในราคาที่ยืดหยุ่นกว่า
            </div>
          </div>
        </div>
      </section>

      {/* ── PROOF BAR ── */}
      <div className="bg-white border-t border-b border-[#D9E1F2] py-[18px] px-6">
        <div className="max-w-[1080px] mx-auto flex justify-center gap-12 flex-wrap">
          {[
            { num: '500', unit: '+', label: 'ผู้ใช้งาน' },
            { num: '3', unit: ' ผลิตภัณฑ์', label: 'ทำงานร่วมกัน' },
            { num: '5', unit: ' นาที', label: 'ตั้งต้นให้สำเร็จ' },
            { num: '฿0', unit: '', label: 'เริ่มต้น' },
          ].map(({ num, unit, label }) => (
            <div key={label} className="text-center">
              <div className="text-[22px] font-bold text-[#050579]">
                {num}
                <span className="text-[#F97316]">{unit}</span>
              </div>
              <div className="text-[11px] text-[#64748B] mt-[2px]">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── PRODUCT SHOWCASE ── */}
      <section id="products" className="py-20 bg-[#F6F8FF]">
        <div className="max-w-[1080px] mx-auto px-6">
          <div className="text-center mb-4">
            <h2 className="text-[clamp(22px,3.5vw,36px)] font-bold text-[#050579] leading-[1.5]">
              เลือกดูผลิตภัณฑ์แต่ละอย่าง
              <em className="not-italic text-[#F97316] block mt-2">ที่คุณต้องการ</em>
            </h2>
            <p className="text-[15px] text-[#475569] max-w-[540px] mx-auto mt-[10px] leading-relaxed">
              ใช้แต่ละตัวเดี่ยวๆ หรือจะใช้ทั้ง 3 ร่วมกันเพื่อ workflow
              ที่สมบูรณ์
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-10 mb-8 sm:justify-center sm:flex-wrap">
            {(
              [
                { id: 'card', icon: '🪪', label: 'NEX Digital ID', badge: 'มีทั่วไป', badgeStyle: {} },
                {
                  id: 'catalog',
                  icon: '📖',
                  label: 'NEX Catalog',
                  badge: 'เฉพาะ NEX ✦',
                  badgeStyle: { background: '#DBEAFE', color: '#1D4ED8' },
                },
                {
                  id: 'salepage',
                  icon: '🛒',
                  label: 'NEX Sale Page',
                  badge: 'เฉพาะ NEX ✦',
                  badgeStyle: { background: '#DBEAFE', color: '#1D4ED8' },
                },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveProduct(tab.id)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-5 py-[10px] rounded-[10px] border-[1.5px] text-[12px] sm:text-[14px] font-semibold transition-all ${
                  activeProduct === tab.id
                    ? 'bg-[#050579] border-[#050579] text-white'
                    : 'bg-white border-[#94A3B8] text-[#475569] hover:border-[#050579] hover:text-[#050579]'
                }`}
              >
                <span className="text-base sm:text-lg">{tab.icon}</span>
                <span className="truncate">{tab.label}</span>
                <span
                  className={`hidden sm:inline-block text-[10px] font-bold rounded px-[6px] py-[1px] ${
                    activeProduct === tab.id
                      ? 'bg-white/20 text-[#BEF264]'
                      : 'bg-[#DCFCE7] text-[#16A34A]'
                  }`}
                  style={activeProduct === tab.id ? {} : tab.badgeStyle}
                >
                  {tab.badge}
                </span>
              </button>
            ))}
            <Link
              href="/start/examples"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-5 py-[10px] rounded-[10px] border-[1.5px] text-[12px] sm:text-[14px] font-semibold transition-all bg-white border-[#94A3B8] text-[#475569] hover:border-[#F97316] hover:text-[#F97316]"
            >
              <span className="text-base sm:text-lg">🎯</span>
              <span className="truncate">ตัวอย่าง</span>
              <span className="hidden sm:inline-block text-[10px] font-bold rounded px-[6px] py-[1px] bg-[#FFF7ED] text-[#F97316]">Use Cases</span>
            </Link>
          </div>

          {/* Panel: NEX Digital ID */}
          {activeProduct === 'card' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-[6px] text-[11px] font-bold tracking-wider px-3 py-1 rounded-full mb-4 bg-[#E8ECFF] text-[#050579] border border-[#D9E1F2]">
                  🪪 NEX Digital ID
                </div>
                <h3 className="text-[clamp(22px,3vw,30px)] font-bold text-[#050579] mb-[10px] leading-[1.5]">
                  นามบัตรดิจิทัล
                  <em className="not-italic text-[#F97316] block mt-2">
                    ที่ลูกค้าบันทึกได้ทันที
                  </em>
                </h3>
                <p className="text-[14px] text-[#475569] leading-relaxed mb-5">
                  ส่งลิงค์เดียว – ลูกค้าเห็นชื่อ ตำแหน่ง social links ทั้งหมด
                  แตะปุ่มเดียวบันทึกถึงเบอร์เข้า contacts ได้เลย ไม่ต้องพิมพ์
                </p>
                <div className="flex flex-col gap-[10px] mb-6">
                  {[
                    { icon: '🔗', title: 'ลิงค์ส่วนตัว', desc: 'nexsolution.cloud/nex/ชื่อคุณ – จำง่าย แชร์ได้ทุกที่' },
                    { icon: '📱', title: 'vCard Download', desc: 'ลูกค้าแตะ 1 ครั้ง บันทึกเบอร์เข้า contacts ทันที' },
                    { icon: '🏷️', title: 'QR Code พร้อมใช้', desc: 'ส่งต่อไปได้ทันที พิมพ์ลงนามบัตรกระดาษหรือ standee ได้' },
                    { icon: '📊', title: 'Analytics', desc: 'เห็นว่าใครเปิด กี่ครั้ง มาจากไหน (Pro)' },
                  ].map(({ icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-[10px]">
                      <div className="w-6 h-6 rounded-[6px] bg-[#EEF0FF] flex items-center justify-center text-[13px] shrink-0 mt-[2px]">
                        {icon}
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-[#0F172A] mb-[1px]">
                          {title}
                        </div>
                        <div className="text-xs text-[#64748B]">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-[#FEFCE8] border border-[#FDE68A] rounded-[10px] p-3 px-4 flex gap-2 items-start mb-5">
                  <span className="text-base shrink-0">⚡</span>
                  <p className="text-xs text-[#92400E] leading-snug">
                    <strong>NEX vs ตามบัตรดิจิทัลทั่วไป:</strong>{' '}
                    ทั้งคู่มีนามบัตรดิจิทัล แต่ NEX มี Analytics, ลิงค์ส่วนตัว
                    และเชื่อมต่อกัน Catalog + Sale Page ได้ – บริการทั่วไปใช้ได้แต่ standalone card เท่านั้น
                  </p>
                </div>
                <Link
                  href="/register"
                  className="inline-block bg-[#F97316] hover:bg-[#EA580C] text-white text-[14px] font-semibold px-6 py-3 rounded-[10px] transition-all"
                >
                  สร้าง NEX Digital ID ฟรี →
                </Link>
              </div>
              {/* Phone Screenshot */}
              <div className="flex flex-col items-center">
                <div className="relative w-[240px] rounded-[28px] overflow-hidden shadow-[0_30px_80px_rgba(5,5,121,.20)] border border-[#E5E7EB]">
                  <Image
                    src="/example-digital-id.png"
                    alt="ตัวอย่าง NEX Digital ID"
                    width={240}
                    height={536}
                    className="w-full h-auto object-cover"
                  />
                </div>
                <p className="text-center text-[11px] text-[#64748B] mt-3">
                  ตัวอย่าง: NEX Digital ID สำหรับฟรีแลนซ์
                </p>
              </div>
            </div>
          )}

          {/* Panel: NEX Catalog */}
          {activeProduct === 'catalog' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-[6px] text-[11px] font-bold tracking-wider px-3 py-1 rounded-full mb-4 bg-[#E8ECFF] text-[#050579] border border-[#D9E1F2]">
                  📖 NEX Catalog
                </div>
                <h3 className="text-[clamp(22px,3vw,30px)] font-bold text-[#050579] mb-[10px] leading-[1.5]">
                  Catalog สินค้าดิจิทัล
                  <em className="not-italic text-[#F97316] block mt-2">
                    เฉพาะ NEX – NEX มีเพียงเจ้าเดียว
                  </em>
                </h3>
                <p className="text-[14px] text-[#475569] leading-relaxed mb-5">
                  เลิก PDF ที่ส่ง LINE แล้วหาย – NEX Catalog เปิดได้บนเบราว์เซอร์
                  ทันที แชร์ผ่าน QR ดาวน์โหลด PDF และดู flipbook ได้
                </p>
                <div className="flex flex-col gap-[10px] mb-6">
                  {[
                    { icon: '📄', title: 'Flipbook Viewer', desc: 'ลูกค้าเปิดบนมือถือ เลือกดูสินค้าได้ทันที ไม่ต้องดาวน์โหลด' },
                    { icon: '📥', title: 'Export PDF', desc: 'ส่งออกเป็น PDF ได้เลยคลิกเดียว สำหรับส่งอีเมลหรือพริ้นท์' },
                    { icon: '🔗', title: 'QR + Share Link', desc: 'แชร์ catalog ผ่าน LINE / IG / Facebook ได้ทันที' },
                    { icon: '✏️', title: 'แก้ไขง่าย', desc: 'อัปเดตราคาหรือสินค้า – ลิงค์เดิมยังใช้ได้ ไม่ต้องส่งใหม่' },
                  ].map(({ icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-[10px]">
                      <div className="w-6 h-6 rounded-[6px] bg-[#EEF0FF] flex items-center justify-center text-[13px] shrink-0 mt-[2px]">
                        {icon}
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-[#0F172A] mb-[1px]">{title}</div>
                        <div className="text-xs text-[#64748B]">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[10px] p-3 px-4 flex gap-2 items-start mb-5">
                  <span className="text-base shrink-0">📌</span>
                  <p className="text-xs text-[#1E3A8A] leading-snug">
                    <strong>ทุกวันนี้ บริการทั่วไปไม่มี:</strong> ร้านค้า SME
                    ส่ง PDF catalog ผ่าน LINE แล้วลูกค้าหา file ไม่เจอ – NEX
                    Catalog แก้ปัญหานี้ด้วยลิงค์ที่เปิดได้ตลอดเวลา
                  </p>
                </div>
                <Link
                  href="/register"
                  className="inline-block bg-[#F97316] hover:bg-[#EA580C] text-white text-[14px] font-semibold px-6 py-3 rounded-[10px] transition-all"
                >
                  สร้าง NEX Catalog ฟรี →
                </Link>
              </div>
              {/* Catalog Video */}
              <div className="flex flex-col items-center">
                <div className="relative w-full rounded-[16px] overflow-hidden shadow-[0_30px_80px_rgba(5,5,121,.20)] border border-[#E5E7EB] bg-black">
                  <video
                    ref={catalogVideoRef}
                    src="/catalog-demo.mp4"
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-auto block"
                    onPlay={() => setCatalogPlaying(true)}
                    onPause={() => setCatalogPlaying(false)}
                  />
                  {!catalogPlaying && (
                    <button
                      onClick={() => { catalogVideoRef.current?.play(); setCatalogPlaying(true); }}
                      aria-label="Play video"
                      className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all group"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white shadow-lg flex items-center justify-center transition-all">
                        <svg className="w-7 h-7 text-[#050579] ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </button>
                  )}
                </div>
                <p className="text-center text-[11px] text-[#64748B] mt-3">
                  ตัวอย่าง: NEX Catalog สำหรับร้านเออร์กิ้ออร์
                </p>
              </div>
            </div>
          )}

          {/* Panel: NEX Sale Page */}
          {activeProduct === 'salepage' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
              <div>
                <div className="inline-flex items-center gap-[6px] text-[11px] font-bold tracking-wider px-3 py-1 rounded-full mb-4 bg-[#E8ECFF] text-[#050579] border border-[#D9E1F2]">
                  🛒 NEX Sale Page
                </div>
                <h3 className="text-[clamp(22px,3vw,30px)] font-bold text-[#050579] mb-[10px] leading-[1.5]">
                  หน้าขายกระบวนการ
                  <em className="not-italic text-[#F97316] block mt-2">
                    สร้างเอง ไม่ต้องเขียนโค้ด
                  </em>
                </h3>
                <p className="text-[14px] text-[#475569] leading-relaxed mb-5">
                  สร้างหน้าขาย landing page สำหรับโปรโมชัน สินค้า หรือบริการ
                  มี CTA, ฟอร์มรับ lead และ analytics ในหน้าเดียว –
                  บริการทั่วไปไม่มีสิ่งนี้
                </p>
                <div className="flex flex-col gap-[10px] mb-6">
                  {[
                    { icon: '🏗️', title: 'Block Builder', desc: 'ลาก-วาง section ได้ ไม่ต้องเขียนโค้ด มี template สำเร็จรูป' },
                    { icon: '📋', title: 'ฟอร์มรับ Lead ในตัว', desc: 'ลูกค้ากรอกชื่อ-เบอร์เข้าหน้าเดียวกัน export CSV ได้' },
                    { icon: '📈', title: 'Conversion Analytics', desc: 'เห็นว่าใครเข้ามา ใครกรอกฟอร์ม conversion rate คือเท่าไร' },
                    { icon: '🔗', title: 'Custom URL + UTM', desc: 'ติดตาม traffic จาก Facebook / LINE / TikTok แยกกันได้' },
                  ].map(({ icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-[10px]">
                      <div className="w-6 h-6 rounded-[6px] bg-[#EEF0FF] flex items-center justify-center text-[13px] shrink-0 mt-[2px]">
                        {icon}
                      </div>
                      <div>
                        <div className="text-[14px] font-semibold text-[#0F172A] mb-[1px]">{title}</div>
                        <div className="text-xs text-[#64748B]">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[10px] p-3 px-4 flex gap-2 items-start mb-5">
                  <span className="text-base shrink-0">🛠</span>
                  <p className="text-xs text-[#1E3A8A] leading-snug">
                    <strong>ทุกวันนี้ บริการทั่วไปไม่มี:</strong> Sales team
                    ที่ต้องการปิดการขายด้วยหน้า landing เฉพาะโปรโมชัน – NEX Sale
                    Page ทำเสร็จภายใน 30 นาที โดยไม่ต้องขึ้นทีม IT
                  </p>
                </div>
                <Link
                  href="/register"
                  className="inline-block bg-[#F97316] hover:bg-[#EA580C] text-white text-[14px] font-semibold px-6 py-3 rounded-[10px] transition-all"
                >
                  สร้าง NEX Sale Page ฟรี →
                </Link>
              </div>
              {/* Sale Page Video */}
              <div className="flex flex-col items-center">
                <div className="relative w-[240px] rounded-[16px] overflow-hidden shadow-[0_30px_80px_rgba(5,5,121,.20)] border border-[#E5E7EB] bg-black">
                  <video
                    ref={salepageVideoRef}
                    src="/salepage-demo.mp4"
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-auto block"
                    onPlay={() => setSalepagePlaying(true)}
                    onPause={() => setSalepagePlaying(false)}
                  />
                  {!salepagePlaying && (
                    <button
                      onClick={() => { salepageVideoRef.current?.play(); setSalepagePlaying(true); }}
                      aria-label="Play video"
                      className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-all group"
                    >
                      <div className="w-16 h-16 rounded-full bg-white/90 group-hover:bg-white shadow-lg flex items-center justify-center transition-all">
                        <svg className="w-7 h-7 text-[#050579] ml-1" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </button>
                  )}
                </div>
                <p className="text-center text-[11px] text-[#64748B] mt-3">
                  ตัวอย่าง: NEX Sale Page สำหรับตัวแทนประกัน
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section id="compare" className="py-20 bg-[#EEF0FF]">
        <div className="max-w-[1080px] mx-auto px-6">
          <h2 className="text-[clamp(22px,3.5vw,36px)] font-bold text-[#050579] mb-2">
            NEX vs บริการนามบัตรทั่วไป
          </h2>
          <p className="text-[14px] text-[#475569] mb-0">
            เปรียบเทียบกับบริการตามบัตรดิจิทัล Basic ทั่วไปในตลาด
          </p>
          <div className="mt-10 overflow-hidden rounded-[16px] border border-[#D9E1F2]">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="p-4 px-5 text-left text-[13px] font-normal text-white/60 text-[12px] bg-[#03034F]">
                    ฟีเจอร์
                  </th>
                  <th className="p-4 px-5 text-left text-[13px] font-bold bg-[#050579] text-white hidden sm:table-cell">
                    ตามบัตรดิจิทัลทั่วไป
                  </th>
                  <th className="p-4 px-5 text-left text-[13px] font-bold bg-[#F97316] text-white">
                    NEX Solution
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'นามบัตรดิจิทัล (Digital Card)', them: '✓', us: '✓' },
                  { feature: 'QR Code', them: '✓', us: '✓' },
                  { feature: 'vCard / บันทึกเบอร์ทันที', them: 'บางเจ้าเท่านั้น', us: '✓ ทุกแพลน', usGreen: true },
                  { feature: 'Catalog สินค้า (NEX Catalog)', them: '✗', us: '✓', usGreen: true },
                  { feature: 'Sale Page / Landing Page', them: '✗', us: '✓', usGreen: true },
                  { feature: 'ฟอร์มรับ Lead + Export CSV', them: '✗', us: '✓', usGreen: true },
                  { feature: 'Analytics Dashboard', them: '✗', us: '✓ (Pro)', usGreen: true },
                  { feature: 'AI สร้างสื่อการขาย', them: '✗', us: '✓ (Pro)', usGreen: true },
                  {
                    feature: 'ผูกกับ Provider / ล็อคอิน',
                    them: 'ผูกกับ provider หรือล็อคอิน',
                    themRed: true,
                    us: 'ไม่จำกัด ใช้ได้เลย',
                    usGreen: true,
                  },
                ].map(({ feature, them, us, themRed, usGreen }) => (
                  <tr key={feature}>
                    <td className="p-3 px-4 sm:p-[13px] sm:px-5 text-[12px] sm:text-[13px] font-medium text-[#0F172A] bg-[#FAFBFF] border-b border-[#D9E1F2] leading-snug">
                      {feature}
                    </td>
                    <td className="p-[13px] px-5 text-[13px] border-b border-[#D9E1F2] bg-white text-[#475569] hidden sm:table-cell">
                      {them === '✓' ? (
                        <span className="text-[#16A34A] font-bold text-[15px]">✓</span>
                      ) : them === '✗' ? (
                        <span className="text-[#CBD5E1] text-[15px]">✗</span>
                      ) : (
                        <span className={`text-[13px] font-semibold ${themRed ? 'text-[#DC2626]' : 'text-[#F59E0B]'}`}>
                          {them}
                        </span>
                      )}
                    </td>
                    <td className="p-3 px-4 sm:p-[13px] sm:px-5 text-[13px] border-b border-[#D9E1F2] bg-[#FFF9F5]">
                      {us === '✓' || us?.startsWith('✓') ? (
                        <span className={`font-bold ${usGreen ? 'text-[#16A34A]' : 'text-[#16A34A]'} text-[15px]`}>
                          {us.length > 1 ? (
                            <span className="text-[13px]">{us}</span>
                          ) : (
                            us
                          )}
                        </span>
                      ) : (
                        <span className={`text-[13px] font-semibold ${usGreen ? 'text-[#16A34A]' : ''}`}>
                          {us}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      {/* ── NEX PARTNER PROGRAM ── */}
      <section id="pricing" className="py-20 bg-[#F6F8FF]">
        <div className="max-w-[860px] mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-block bg-[#F97316] text-white text-[11px] font-bold tracking-widest uppercase px-5 py-[6px] rounded-full mb-6">
              NEX PARTNER PROGRAM
            </div>
            <h2 className="text-[clamp(24px,3.5vw,38px)] font-bold text-[#050579] leading-[1.5] mb-4">
              คุณมีคอนเนคชัน
              <br />
              มาสร้าง<span className="text-[#F97316]">รายได้</span>ด้วยกัน
            </h2>
            <p className="text-[#475569] text-[15px] leading-[1.8] max-w-[480px] mx-auto">
              ไม่ต้องสต๊อกสินค้า ไม่ต้องลงทุนล่วงหน้า
              <br />
              แนะนำ NEX ให้ลูกค้าคุณ — รับค่าคอมมิชชั่นทุกครั้งที่ปิดการขาย
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              {
                icon: (
                  <svg className="w-6 h-6 text-[#050579]/60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                  </svg>
                ),
                title: 'Recurring',
                titleSub: 'รายเดือน',
                titleColor: 'text-[#F97316]',
                desc: 'รับค่าคอมต่อเนื่องทุกเดือน ตลอดอายุสมาชิก',
              },
              {
                icon: (
                  <svg className="w-6 h-6 text-[#050579]/60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                  </svg>
                ),
                title: 'ไม่จำกัด',
                titleSub: 'ยอด',
                titleColor: 'text-[#F97316]',
                desc: 'ขายได้เท่าไหร่ ได้เท่านั้น ไม่มี cap',
              },
              {
                icon: (
                  <svg className="w-6 h-6 text-[#050579]/60" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: 'Free',
                titleSub: 'เริ่มต้น',
                titleColor: 'text-[#050579]',
                desc: 'ไม่มีค่าสมัคร ไม่ต้องลงทุนล่วงหน้าใดๆ',
              },
            ].map(({ icon, title, titleSub, titleColor, desc }) => (
              <div key={title} className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 text-center hover:shadow-md transition-all">
                <div className="w-12 h-12 rounded-[12px] bg-[#EEF0FF] flex items-center justify-center mx-auto mb-4">
                  {icon}
                </div>
                <div className="text-[20px] font-bold text-[#050579] leading-tight mb-1">
                  {title} <span className={`text-[16px] font-semibold ${titleColor}`}>{titleSub}</span>
                </div>
                <p className="text-[13px] text-[#64748B] leading-[1.7]">{desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-[#050579] rounded-[16px] p-6 flex gap-5 items-start mb-10">
            <div className="w-12 h-12 rounded-[12px] bg-[#F97316]/20 flex items-center justify-center shrink-0">
              <svg className="w-6 h-6 text-[#F97316]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-[15px] mb-2">ทำไม NEX ขายง่าย?</div>
              <p className="text-white/70 text-[13px] leading-[1.7]">
                ลูกค้า SME ทุกเจ้าต้องการสิ่งที่ NEX ทำให้ — ทำสื่อ ดึง Lead สร้างหน้าขาย
                <br />
                ราคาเริ่มต้น <span className="text-[#F97316] font-semibold">฿1,500/ปี</span> ตัดสินใจง่าย ไม่ต้องโน้มน้าวนาน
              </p>
            </div>
          </div>

          <div className="mb-10">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex-1 h-[1px] bg-[#D9E1F2]" />
              <span className="text-[12px] text-[#94A3B8] font-semibold tracking-wide uppercase whitespace-nowrap">เริ่มต้นง่าย 3 ขั้นตอน</span>
              <div className="flex-1 h-[1px] bg-[#D9E1F2]" />
            </div>
            <div className="grid grid-cols-3 gap-6 text-center">
              {[
                { num: 1, title: 'สมัครเป็น', sub: 'NEX Partner ฟรี' },
                { num: 2, title: 'รับลิงก์ส่วนตัว', sub: '+ คู่มือการขาย' },
                { num: 3, title: 'แนะนำลูกค้า', sub: 'รับค่าคอมทันที' },
              ].map(({ num, title, sub }) => (
                <div key={num}>
                  <div className="w-10 h-10 rounded-full bg-[#050579] text-white font-bold text-[15px] flex items-center justify-center mx-auto mb-3">
                    {num}
                  </div>
                  <div className="text-[13px] font-semibold text-[#0F172A]">{title}</div>
                  <div className="text-[12px] text-[#64748B] mt-[2px]">{sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Link
              href="/register"
              className="inline-block bg-[#F97316] hover:bg-[#EA580C] text-white text-[14px] font-bold px-8 py-3 rounded-[10px] transition-all shadow-[0_4px_16px_rgba(249,115,22,.30)] mb-4"
            >
              สมัครเป็น NEX Partner ฟรี
            </Link>
            <p className="text-[13px] text-[#64748B]">
              มีคำถามก่อนสมัคร?{' '}
              <a href="#contact" className="text-[#050579] font-semibold hover:underline">
                ติดต่อทีมงาน
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-[#050579] py-20 px-6 text-center">
        <h2 className="text-[clamp(24px,4vw,38px)] font-bold text-white mb-3">
          เริ่มต้นใช้งานฟรี
          <br />
          ไม่ต้อง
          <em className="not-italic text-[#F97316]">ผูกบัตรเครดิต</em>
        </h2>
        <p className="text-white/70 text-[15px] mb-[30px]">
          สมัครด้วย email หรือ Google – ตั้งต้นให้สำเร็จใน 5 นาที
        </p>
        <div className="flex justify-center gap-3 flex-wrap">
          <Link
            href="/register"
            className="bg-[#F97316] hover:bg-[#EA580C] text-white text-[16px] font-semibold px-9 py-[14px] rounded-[10px] transition-all"
          >
            เริ่มต้นใช้งานฟรี →
          </Link>
          <a
            href="#products"
            className="bg-transparent text-white text-[15px] font-medium px-[26px] py-[13px] rounded-[10px] border border-white/35 hover:border-white/70 transition-all"
          >
            ดูรายละเอียดเพิ่มเติม
          </a>
        </div>
        <p className="mt-[14px] text-[12px] text-white/35">
          ไม่มีสัญญาผูกมัด · ไม่ต้องส่งบัตรเครดิต · ยกเลิกได้ทุกเมื่อ
        </p>
      </section>

      {/* ── CONTACT LINE ── */}
      <section id="contact" className="py-14 bg-[#EEF0FF]">
        <div className="max-w-[360px] mx-auto px-6 text-center">
          <p className="text-[12px] font-bold tracking-widest text-[#050579]/50 uppercase mb-2">ติดต่อเรา</p>
          <h2 className="text-[22px] font-bold text-[#050579] mb-8">พูดคุยกับเราผ่าน LINE</h2>
          <div className="bg-white rounded-[20px] border border-[#D9E1F2] p-7 shadow-sm flex flex-col items-center gap-5">
            {/* QR */}
            <div className="w-[160px] h-[160px] rounded-[14px] overflow-hidden border border-[#E5E7EB]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://qr-official.line.me/gs/M_481aokit_GW.png?oat_content=qr"
                alt="LINE QR @481aokit"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Info */}
            <div className="flex flex-col items-center gap-1">
              <p className="text-[12px] text-[#94A3B8]">สแกน QR หรือกดปุ่มด้านล่าง</p>
              <div className="flex items-center gap-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <rect width="24" height="24" rx="6" fill="#06C755"/>
                  <path d="M12 4C7.58 4 4 7.13 4 11c0 2.42 1.38 4.56 3.5 5.9-.15.54-.56 1.94-.64 2.24-.1.37.14.36.29.26.12-.08 1.85-1.22 2.6-1.72.71.1 1.44.15 2.25.15 4.42 0 8-3.13 8-7S16.42 4 12 4Z" fill="white"/>
                </svg>
                <span className="text-[16px] font-bold text-[#06C755]">@481aokit</span>
              </div>
            </div>
            {/* CTA */}
            <a
              href="https://lin.ee/UiiKvZf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-[13px] rounded-[10px] text-[15px] font-bold text-white transition-all hover:opacity-90 shadow-[0_4px_16px_rgba(6,199,85,.30)]"
              style={{ background: '#06C755' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 4C7.58 4 4 7.13 4 11c0 2.42 1.38 4.56 3.5 5.9-.15.54-.56 1.94-.64 2.24-.1.37.14.36.29.26.12-.08 1.85-1.22 2.6-1.72.71.1 1.44.15 2.25.15 4.42 0 8-3.13 8-7S16.42 4 12 4Z" fill="white"/>
              </svg>
              เพิ่มเพื่อนใน LINE
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-[#03034F] border-t border-white/8 py-[18px] px-6 text-center text-white/40 text-xs">
        © NEX Solution. All rights reserved. บริษัท คราม อินเทลลิเจนท์ เอไอ จำกัด
        KHRAM INTELLIGENT AI Co., Ltd.
      </footer>
    </div>
  );
}
