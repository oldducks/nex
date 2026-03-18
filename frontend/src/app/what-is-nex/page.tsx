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
    <main className="relative min-h-screen overflow-hidden bg-[#EEF0FF] text-[#0F172A]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(96,165,250,0.18),transparent_42%),radial-gradient(circle_at_88%_18%,rgba(249,115,22,0.08),transparent_42%),radial-gradient(circle_at_50%_95%,rgba(191,219,254,0.35),transparent_48%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#f6f8ff_0%,#eef0ff_52%,#e7edff_100%)]" />
        <div className="absolute inset-0 opacity-[0.28] [background-image:linear-gradient(rgba(5,5,121,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(5,5,121,0.06)_1px,transparent_1px)] [background-size:32px_32px]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-10 sm:py-14">
        <div className="mb-8 flex justify-center">
          <div className="relative h-24 w-full max-w-[280px] overflow-visible sm:h-28 sm:max-w-[340px]">
            <Image
              src="/nex_logo_nobg.png"
              alt="NEX Solution"
              fill
              className="pointer-events-none object-contain scale-[1.9]"
              priority
              unoptimized
            />
          </div>
        </div>

        <section className="mx-auto max-w-4xl text-center">
          <p className="mb-3 inline-block rounded-full border border-[#D9E1F2] bg-white/80 px-4 py-1 text-xs font-bold tracking-widest text-[#050579]">
            WHAT IS NEX
          </p>
          <h1 className="text-3xl font-black leading-tight text-[#050579] sm:text-5xl">
            NEX คือแพลตฟอร์ม
            <span className="block bg-gradient-to-r from-[#050579] via-[#2563EB] to-[#F97316] bg-clip-text text-transparent">
              Digital Agent + Sales Infrastructure
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-[#475569] sm:text-base">
            NEX ถูกออกแบบเพื่อช่วยธุรกิจและตัวแทนขายสร้างตัวตนดิจิทัล จัดการสินค้า สร้างแคมเปญการตลาด
            และปิดการขายด้วยข้อมูลจริงจากระบบเดียว
          </p>
        </section>

        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {coreFeatures.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-[#D9E1F2] bg-white/92 p-5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.22)] backdrop-blur"
            >
              <h2 className="mb-2 text-lg font-extrabold text-[#050579]">{feature.title}</h2>
              <p className="text-sm leading-relaxed text-[#475569]">{feature.detail}</p>
            </article>
          ))}
        </section>

        <section className="mt-12 rounded-3xl border border-[#D9E1F2] bg-[linear-gradient(120deg,rgba(255,255,255,0.96)_0%,rgba(232,236,255,0.98)_100%)] p-6 text-center shadow-[0_24px_60px_-40px_rgba(5,5,121,0.28)] sm:p-8">
          <h3 className="text-2xl font-black text-[#050579] sm:text-3xl">พร้อมเริ่มใช้งาน NEX แล้วหรือยัง?</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-[#475569] sm:text-base">
            เข้าสู่ระบบเพื่อเริ่มสร้างนามบัตรดิจิทัล แคตตาล็อก และหน้าแคมเปญของคุณได้ทันที
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://nexsolution.cloud/login"
              className="rounded-full bg-[#F97316] px-6 py-3 text-sm font-extrabold text-white shadow-[0_16px_30px_-20px_rgba(249,115,22,0.8)] transition hover:bg-[#EA580C]"
            >
              เข้าสู่ระบบ
            </a>
            <a
              href="https://nexsolution.cloud/"
              className="rounded-full border border-[#D9E1F2] bg-white px-6 py-3 text-sm font-bold text-[#050579] transition hover:bg-[#F6F8FF]"
            >
              กลับหน้าแรก
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
