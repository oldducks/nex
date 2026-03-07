import Image from 'next/image';

const coreFeatures = [
  {
    title: 'Digital Business Card ที่แชร์ได้ทันที',
    detail:
      'สร้างโปรไฟล์นามบัตรดิจิทัลแบบมืออาชีพ รองรับลิงก์เฉพาะตัวและ QR Code เพื่อให้ลูกค้าเข้าถึงข้อมูลติดต่อได้ทันที',
  },
  {
    title: 'Interactive Catalog & Product Management',
    detail:
      'สร้างแคตตาล็อกสินค้า เพิ่ม/แก้ไขสินค้า อัปโหลดรูปหลายภาพ และแชร์ลิงก์สาธารณะได้อย่างรวดเร็ว',
  },
  {
    title: 'Landing Pages สำหรับแคมเปญการตลาด',
    detail:
      'รองรับการสร้างหน้าแคมเปญหลายหน้าเพื่อเก็บลีดและนำลูกค้าเข้าสู่ funnel ได้อย่างมีระบบ',
  },
  {
    title: 'Lead Generation พร้อมฟอร์มติดต่อ',
    detail:
      'เก็บข้อมูลลูกค้าเข้าในระบบจากหน้า public profile และ landing page เพื่อติดตามโอกาสการขายได้ทันที',
  },
  {
    title: 'Analytics Dashboard',
    detail:
      'ดูสถิติการเข้าชม โปรไฟล์ที่ถูกเปิด และกิจกรรมของผู้สนใจ เพื่อนำข้อมูลมาปรับกลยุทธ์การขาย',
  },
  {
    title: 'Referral System & Growth Engine',
    detail:
      'ทุกบัญชีมี referral code อัตโนมัติ รองรับการแนะนำสมาชิกและขยายเครือข่ายตัวแทนอย่างเป็นระบบ',
  },
];

export default function WhatIsNexPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030818] text-[#eaf6ff]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(0,210,255,0.22),transparent_42%),radial-gradient(circle_at_88%_18%,rgba(253,187,45,0.18),transparent_45%),radial-gradient(circle_at_50%_95%,rgba(58,123,213,0.14),transparent_46%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(128deg,rgba(3,8,24,0.96)_0%,rgba(9,17,42,0.92)_48%,rgba(6,12,32,0.96)_100%)]" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(0,210,255,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(0,210,255,0.4)_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-10 sm:py-14">
        <div className="mb-8 flex justify-center">
          <div className="relative h-24 w-full max-w-[280px] sm:h-28 sm:max-w-[340px]">
            <Image src="/nex_logo_nobg.png" alt="NEX Solution" fill className="object-contain" priority unoptimized />
          </div>
        </div>

        <section className="mx-auto max-w-4xl text-center">
          <p className="mb-3 inline-block rounded-full border border-cyan-200/50 bg-cyan-200/10 px-4 py-1 text-xs font-bold tracking-widest text-cyan-100">
            WHAT IS NEX
          </p>
          <h1 className="text-3xl font-black leading-tight sm:text-5xl">
            NEX คือแพลตฟอร์ม
            <span className="block bg-gradient-to-r from-cyan-400 via-yellow-300 to-cyan-200 bg-clip-text text-transparent">
              Digital Agent + Sales Infrastructure
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-blue-100/90 sm:text-base">
            NEX ถูกออกแบบเพื่อช่วยธุรกิจและตัวแทนขายสร้างตัวตนดิจิทัล จัดการสินค้า สร้างแคมเปญการตลาด
            และปิดการขายด้วยข้อมูลจริงจากระบบเดียว
          </p>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coreFeatures.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-cyan-200/20 bg-[linear-gradient(165deg,rgba(14,37,92,0.62)_0%,rgba(8,20,56,0.8)_100%)] p-5 backdrop-blur"
            >
              <h2 className="mb-2 text-lg font-extrabold text-cyan-100">{feature.title}</h2>
              <p className="text-sm leading-relaxed text-blue-100/80">{feature.detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-3xl border border-cyan-100/30 bg-[linear-gradient(120deg,rgba(20,200,212,0.2)_0%,rgba(250,204,21,0.18)_55%,rgba(20,200,212,0.2)_100%)] p-6 text-center sm:p-8">
          <h3 className="text-2xl font-black text-white sm:text-3xl">พร้อมเริ่มใช้งาน NEX แล้วหรือยัง?</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-blue-50/90 sm:text-base">
            เข้าสู่ระบบเพื่อเริ่มสร้างนามบัตรดิจิทัล แคตตาล็อก และหน้าแคมเปญของคุณได้ทันที
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://nexsolution.cloud/login"
              className="rounded-full border border-cyan-200/70 bg-[linear-gradient(90deg,rgba(0,210,255,0.45)_0%,rgba(253,187,45,0.42)_55%,rgba(0,210,255,0.4)_100%)] px-6 py-3 text-sm font-extrabold text-white shadow-[0_10px_28px_rgba(0,210,255,0.35)] transition hover:brightness-110"
            >
              เข้าสู่ระบบ
            </a>
            <a
              href="https://nexsolution.cloud/"
              className="rounded-full border border-white/35 bg-white/5 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              กลับหน้าแรก
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
