'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Nfc,
  QrCode,
  Smartphone,
  IdCard,
  LayoutGrid,
  Megaphone,
  Check,
  X,
  Upload,
  ShieldCheck,
  ClipboardCheck,
  Truck,
  Link2,
} from 'lucide-react';
import { MarketingPageTracker } from '@/components/MarketingPageTracker';
import { logMarketingAnalyticsEvent } from '@/lib/marketingAnalytics';

// Same LINE account as the live sales page (#contact).
const LINE_URL = 'https://lin.ee/UiiKvZf';

// Analytics: the marketing log only accepts PAGE_VIEW / VIDEO_* event types
// (Postgres enum), so distinct interactions are separated by page_key instead
// of a new event type. This needs no backend change; surfacing these keys in
// the admin dashboard is a later, separate step.
function trackLineClick(location: string) {
  void logMarketingAnalyticsEvent({
    pageKey: 'card-preview-cta-line',
    eventType: 'PAGE_VIEW',
    metadata: { location },
  });
}

export default function CardPreviewClient() {
  const examplesRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = examplesRef.current;
    if (!node) return;

    let logged = false;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !logged) {
            logged = true;
            void logMarketingAnalyticsEvent({
              pageKey: 'card-preview-view-examples',
              eventType: 'PAGE_VIEW',
            });
            observer.disconnect();
          }
        }
      },
      { threshold: 0.4 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <main className="min-h-screen bg-white text-[#0F172A]">
      <MarketingPageTracker pageKey="card-preview" />

      {/* Navbar / brand */}
      <header className="sticky top-0 z-40 border-b border-[#E7EAF6] bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
          <div className="flex items-center gap-2">
            <Image
              src="/nex-logo-current-transparent.png"
              alt="NEX"
              width={92}
              height={30}
              className="h-7 w-auto object-contain"
              priority
            />
            <span className="hidden text-sm font-medium text-[#64748B] sm:inline">
              Smart Business Card
            </span>
          </div>
          <a
            href={LINE_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackLineClick('navbar')}
            className="rounded-lg bg-[#050579] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-[#07079A]"
          >
            สั่งทำบัตร
          </a>
        </div>
      </header>

      {/* 1. Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#050579] to-[#0A0A5E] text-white">
        {/* Ambient glows so the flat navy has depth */}
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#F97316]/10 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-[#4F6DF5]/20 blur-[110px]" />
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 sm:py-14 lg:grid-cols-2 lg:gap-14">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
              <Nfc size={14} /> บัตร NFC จริง + QR Code
            </div>
            <h1 className="text-[clamp(28px,5vw,46px)] font-bold leading-[1.35]">
              นามบัตรจริงที่แตะแล้ว
              <span className="mt-2 block text-[#F97316]">ลูกค้าเห็นสินค้าคุณทันที</span>
            </h1>
            <p className="mt-5 max-w-[480px] text-[15px] leading-relaxed text-white/75">
              พร้อม NFC และ QR Code เชื่อม Digital ID, Catalog และ Sale Page
              ตั้งแต่แนะนำตัว นำเสนอสินค้า ไปจนถึงรับข้อมูลลูกค้า
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={LINE_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackLineClick('hero')}
                className="rounded-[10px] bg-[#F97316] px-7 py-[13px] text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(249,115,22,.35)] transition-all hover:-translate-y-px hover:bg-[#EA580C]"
              >
                สั่งทำบัตร NEX →
              </a>
              <a
                href="#examples"
                className="rounded-[10px] border border-white/30 px-6 py-[13px] text-[15px] font-medium text-white transition-all hover:border-white/60"
              >
                ดูตัวอย่างการใช้งาน
              </a>
            </div>
            <p className="mt-6 text-xs text-white/55">
              <span className="text-[#BEF264]">✓</span> แตะ NFC หรือสแกน QR ได้โดยไม่ต้องติดตั้งแอป
            </p>
          </div>

          {/* Hero image — holding a NEX card, phone showing the Digital ID */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Soft glow behind the photo so it sits into the background */}
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[105%] w-[135%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(96,130,255,0.35),rgba(249,115,22,0.08)_55%,transparent_75%)] blur-2xl" />
            <div className="relative aspect-[3/4] w-[300px] overflow-hidden rounded-[24px] shadow-[0_30px_80px_rgba(0,0,0,.5)] ring-1 ring-white/10 sm:w-[360px] lg:w-[420px]">
              <Image
                src="/card-preview/hero-tap.webp"
                alt="ถือบัตร NEX แล้วหน้า Digital ID เปิดบนมือถือทันที"
                fill
                sizes="(max-width: 640px) 300px, (max-width: 1024px) 360px, 420px"
                className="object-cover"
                quality={92}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. What happens on tap — 3 steps */}
      <section className="bg-[#EEF0FF] py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center text-[clamp(22px,3.5vw,32px)] font-bold text-[#050579]">
            แตะครั้งเดียว เปิดโลกธุรกิจของคุณ
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <Nfc size={26} />,
                title: 'แตะ หรือ สแกน',
                desc: 'แตะบัตร NFC กับโทรศัพท์ หรือสแกน QR Code บนบัตร',
              },
              {
                icon: <Smartphone size={26} />,
                title: 'เปิดทันที',
                desc: 'หน้า Digital ID เปิดบนมือถือทันที ไม่ต้องติดตั้งแอป',
              },
              {
                icon: <IdCard size={26} />,
                title: 'บันทึก หรือ ซื้อ',
                desc: 'ลูกค้าบันทึกเบอร์ ดูสินค้า หรือส่งข้อความถึงคุณได้เลย',
              },
            ].map((step, i) => (
              <div
                key={step.title}
                className="relative rounded-2xl border border-[#E7EAF6] bg-white p-6 text-center"
              >
                <span className="absolute right-4 top-4 text-3xl font-bold text-[#EEF0FF]">
                  {i + 1}
                </span>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EEF0FF] text-[#050579]">
                  {step.icon}
                </div>
                <h3 className="mt-4 text-lg font-bold text-[#050579]">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Three tools = the innovation */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-5">
          <div className="text-center">
            <h2 className="text-[clamp(22px,3.5vw,32px)] font-bold text-[#050579]">
              หนึ่งบัตร เชื่อม 3 เครื่องมือธุรกิจ
            </h2>
            <p className="mx-auto mt-3 max-w-[520px] text-sm text-[#475569]">
              บัตรจริงคือจุดเริ่มต้น หัวใจที่ทำให้ NEX ต่าง คือเครื่องมือ 3 อย่างที่ทำงานร่วมกัน
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: <IdCard size={22} />,
                name: 'NEX Digital ID',
                desc: 'แนะนำตัว รวมช่องทางติดต่อ ลูกค้าบันทึกเบอร์ได้ทันที',
                img: '/example-digital-id.png',
              },
              {
                icon: <LayoutGrid size={22} />,
                name: 'NEX Catalog',
                desc: 'โชว์สินค้า บริการ หรือผลงาน อัปเดตเองได้ตลอด',
                img: '/card-preview/catalog-example.png',
              },
              {
                icon: <Megaphone size={22} />,
                name: 'NEX Sale Page',
                desc: 'นำเสนอข้อเสนอ และรับข้อมูลลูกค้าที่สนใจเป็น Lead',
                img: '/card-preview/salepage-example.webp',
              },
            ].map((tool) => (
              <div
                key={tool.name}
                className="overflow-hidden rounded-2xl border border-[#E7EAF6] bg-white"
              >
                {/* Phone-frame screenshot per tool */}
                <div className="flex justify-center bg-[#F6F8FF] px-5 pt-5">
                  <div className="relative aspect-[9/14] w-[210px] overflow-hidden rounded-t-2xl border-[5px] border-b-0 border-[#050579]/10 bg-white sm:w-[230px]">
                    <Image
                      src={tool.img}
                      alt={tool.name}
                      fill
                      sizes="150px"
                      className="object-cover object-top"
                    />
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-[#050579]">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EEF0FF]">
                      {tool.icon}
                    </span>
                    <h3 className="text-base font-bold">{tool.name}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#475569]">{tool.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Comparison vs generic NFC cards */}
      <section className="bg-[#EEF0FF] py-16">
        <div className="mx-auto max-w-4xl px-5">
          <h2 className="text-center text-[clamp(22px,3.5vw,32px)] font-bold text-[#050579]">
            ต่างจากบัตร NFC ทั่วไปอย่างไร
          </h2>
          <div className="mt-8 overflow-x-auto rounded-xl shadow-[0_16px_40px_rgba(5,5,121,.15)]">
            <table className="w-full min-w-[440px] border-collapse overflow-hidden rounded-xl bg-white text-sm">
              <thead>
                <tr className="bg-[#050579] text-white">
                  <th className="p-4 text-left font-semibold">ความสามารถ</th>
                  <th className="p-4 text-center font-medium">บัตร NFC ทั่วไป</th>
                  <th className="p-4 text-center font-semibold">NEX Card</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { f: 'แตะแล้วเปิดหน้าเว็บ', generic: true, nex: true },
                  { f: 'Catalog สินค้า / ผลงาน', generic: false, nex: true },
                  { f: 'Sale Page + เก็บ Lead', generic: false, nex: true },
                  { f: 'Analytics วัดผล', generic: false, nex: true },
                  { f: 'ระบบดูแล / อัปเดตให้ตลอด', generic: false, nex: true },
                ].map((row, i) => (
                  <tr key={row.f} className={i % 2 ? 'bg-[#F6F8FF]' : 'bg-white'}>
                    <td className="p-4 font-medium text-[#0F172A]">{row.f}</td>
                    <td className="p-4 text-center">
                      {row.generic ? (
                        <Check className="mx-auto text-[#94A3B8]" size={18} />
                      ) : (
                        <X className="mx-auto text-[#CBD5E1]" size={18} />
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <Check className="mx-auto text-[#16A34A]" size={20} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-[#64748B]">
            บัตร NFC ทั่วไปให้หน้าเว็บรวมลิงก์ แต่ไม่มีระบบ Catalog และ Sale Page ในตัว
          </p>
        </div>
      </section>

      {/* 5. Individual vs Organization */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center text-[clamp(22px,3.5vw,32px)] font-bold text-[#050579]">
            ใช้ได้ทั้งบุคคลและองค์กร
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-[#E7EAF6] bg-white p-7">
              <h3 className="text-lg font-bold text-[#050579]">สำหรับบุคคล</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#475569]">
                นามบัตรอัจฉริยะใบเดียว ครบทั้ง Digital ID, Catalog และ Sale Page
                เริ่มต้นจากบัตรใบเดียว
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[#334155]">
                <li className="flex gap-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-[#16A34A]" /> แนะนำตัว + เก็บเบอร์ทันที
                </li>
                <li className="flex gap-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-[#16A34A]" /> โชว์สินค้า / ผลงาน
                </li>
                <li className="flex gap-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-[#16A34A]" /> รับ Lead จากหน้าขาย
                </li>
              </ul>
            </div>
            <div className="rounded-2xl border-2 border-[#050579] bg-[#050579] p-7 text-white">
              <div className="mb-2 inline-block rounded-full bg-[#F97316] px-3 py-0.5 text-xs font-semibold">
                บัตรพนักงานอัจฉริยะ
              </div>
              <h3 className="text-lg font-bold">สำหรับองค์กร</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/75">
                บัตรพนักงานที่เป็นนามบัตร + Catalog + Sale Page ในตัว
                พนักงานพกใบเดียว ดูน่าเชื่อถือและพรีเมียม แตะแล้วแนะนำตัวและเสนอสินค้าได้ทันที
              </p>
              <ul className="mt-4 space-y-2 text-sm text-white/85">
                <li className="flex gap-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-[#BEF264]" /> บัตรเป็นขององค์กร เปิด/ปิดได้
                </li>
                <li className="flex gap-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-[#BEF264]" /> Catalog / Sale Page ของบริษัท
                </li>
                <li className="flex gap-2">
                  <Check size={16} className="mt-0.5 shrink-0 text-[#BEF264]" /> พนักงานไม่ต้องสมัครเอง
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Use cases by profession — tracked for scroll */}
      <section id="examples" ref={examplesRef} className="scroll-mt-16 bg-[#EEF0FF] py-16">
        <div className="mx-auto max-w-6xl px-5">
          <h2 className="text-center text-[clamp(22px,3.5vw,32px)] font-bold text-[#050579]">
            ตัวอย่างการใช้จริง
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                role: 'เซล B2B',
                desc: 'แตะบัตรให้ลูกค้า → ดู Catalog สินค้าองค์กร → กรอกฟอร์มขอใบเสนอราคา',
              },
              {
                role: 'ตัวแทนประกัน / การเงิน',
                desc: 'แสดงบัตรพนักงานเพื่อความน่าเชื่อถือ → แนะนำตัว → นัดคุยผ่าน Sale Page',
              },
              {
                role: 'เจ้าของร้าน',
                desc: 'แตะบัตร → เปิดเมนู/สินค้า → ลูกค้าทักไลน์สั่งซื้อได้ทันที',
              },
            ].map((c) => (
              <div key={c.role} className="rounded-2xl border border-[#E7EAF6] bg-white p-6">
                <h3 className="text-base font-bold text-[#050579]">{c.role}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. How to order */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-5">
          <h2 className="text-center text-[clamp(22px,3.5vw,32px)] font-bold text-[#050579]">
            ขั้นตอนสั่งทำ
          </h2>
          <p className="mt-3 text-center text-sm text-[#64748B]">
            คุณออกแบบและส่งไฟล์พร้อมผลิตมา — NEX ดูแลตั้งแต่ตรวจไฟล์จนถึงเชื่อมระบบ
          </p>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: <Upload size={20} />, t: '1. ส่งไฟล์', d: 'ส่งไฟล์บัตรที่ออกแบบเองผ่าน LINE หรือฟอร์ม' },
              { icon: <ShieldCheck size={20} />, t: '2. ตรวจ + เชื่อม', d: 'NEX ตรวจไฟล์ และเชื่อม QR / ตั้งค่า NFC' },
              { icon: <ClipboardCheck size={20} />, t: '3. ยืนยัน Proof', d: 'ส่ง Proof ให้ยืนยันก่อนผลิตจริง' },
              { icon: <Truck size={20} />, t: '4. ผลิต + จัดส่ง', d: 'ชำระเงิน ผลิต และจัดส่งถึงมือคุณ' },
              { icon: <Link2 size={20} />, t: '5. ผูกบัตรกับระบบ', d: 'เชื่อมบัตรเข้ากับ Digital ID พร้อมใช้งาน' },
              { icon: <QrCode size={20} />, t: 'QR สำรอง', d: 'มือถือที่ไม่มี NFC ยังสแกน QR ได้เสมอ' },
            ].map((s) => (
              <div key={s.t} className="flex gap-3 rounded-xl border border-[#E7EAF6] bg-white p-5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EEF0FF] text-[#050579]">
                  {s.icon}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[#050579]">{s.t}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-[#475569]">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-[#94A3B8]">
            * แพ็กเกจพื้นฐานไม่รวมบริการออกแบบใหม่ ลูกค้าส่งไฟล์พร้อมผลิต
          </p>
        </div>
      </section>

      {/* 8. Pricing (placeholder) */}
      <section className="bg-[#EEF0FF] py-16">
        <div className="mx-auto max-w-4xl px-5">
          <h2 className="text-center text-[clamp(22px,3.5vw,32px)] font-bold text-[#050579]">
            แพ็กเกจและราคา
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {[
              { name: 'บุคคล', note: 'ค่าทำบัตร + ระบบปีแรก (ก้อนเดียว)' },
              { name: 'องค์กร', note: 'ราคาต่อใบ + ค่าระบบต่อผู้ใช้ต่อปี' },
            ].map((p) => (
              <div key={p.name} className="rounded-2xl border border-[#D9E1F2] bg-white p-7 text-center">
                <h3 className="text-lg font-bold text-[#050579]">{p.name}</h3>
                <div className="my-4 rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFF] py-6 text-sm text-[#94A3B8]">
                  ราคา (placeholder)
                  <br />
                  รอคำนวณต้นทุนจริง
                </div>
                <p className="text-xs text-[#64748B]">{p.note}</p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-[520px] text-center text-sm font-medium text-[#050579]">
            แม้ไม่ต่ออายุ บัตรจริงยังใช้งานได้ และหน้า Digital ID พื้นฐานยังเปิดได้ตามเงื่อนไขบริการ
          </p>
        </div>
      </section>

      {/* 9. FAQ + final CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-center text-[clamp(22px,3.5vw,32px)] font-bold text-[#050579]">
            คำถามที่พบบ่อย
          </h2>
          <div className="mt-8 space-y-3">
            {[
              {
                q: 'มือถือไม่มี NFC ใช้ได้ไหม?',
                a: 'ได้ ทุกบัตรมี QR Code ให้สแกนเป็นทางเลือกเสมอ',
              },
              {
                q: 'ต้องออกแบบบัตรเองไหม?',
                a: 'ใช่ แพ็กเกจพื้นฐานให้ลูกค้าส่งไฟล์ที่ออกแบบพร้อมผลิต NEX ดูแลการเชื่อม QR/NFC และระบบ',
              },
              {
                q: 'ถ้าไม่ต่ออายุจะเป็นอย่างไร?',
                a: 'บัตรจริงยังใช้เป็นนามบัตร/บัตรพนักงานได้ และหน้า Digital ID พื้นฐานยังเปิดได้ตามเงื่อนไขบริการ',
              },
              {
                q: 'องค์กรสั่งหลายใบได้ไหม?',
                a: 'ได้ องค์กรเป็นเจ้าของบัตร เปิด/ปิด/เปลี่ยนปลายทางได้ พนักงานไม่ต้องสมัครเอง',
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-[#E7EAF6] bg-white p-5"
              >
                <summary className="cursor-pointer list-none text-sm font-semibold text-[#050579]">
                  {item.q}
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-[#475569]">{item.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-[#050579] px-6 py-10 text-center text-white">
            <h3 className="text-[clamp(20px,3vw,28px)] font-bold">พร้อมทำบัตร NEX ของคุณแล้ว?</h3>
            <p className="mt-2 text-sm text-white/70">พูดคุยและสั่งทำผ่าน LINE ได้เลย</p>
            <a
              href={LINE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackLineClick('footer')}
              className="mt-6 inline-block rounded-[10px] bg-[#F97316] px-8 py-[13px] text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(249,115,22,.35)] transition-all hover:-translate-y-px hover:bg-[#EA580C]"
            >
              คุยกับเราผ่าน LINE →
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E7EAF6] py-8 text-center text-xs text-[#94A3B8]">
        © NEX Solution · หน้านี้เป็น Preview สำหรับพิจารณาภายใน
        <div className="mt-2">
          <Link href="/" className="underline hover:text-[#64748B]">
            กลับหน้าหลัก
          </Link>
        </div>
      </footer>
    </main>
  );
}
