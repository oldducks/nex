import Image from "next/image";

const valueProps = [
  {
    title: "สร้างเร็วขึ้น",
    detail: "AI ช่วยทำภาพและคอนเทนต์ ทำให้เริ่มต้นงานได้เร็วขึ้น",
  },
  {
    title: "ขายง่ายขึ้น",
    detail: "Landing + Form + QR + Contact flow ช่วยเชื่อมการขายให้ต่อเนื่องขึ้น",
  },
  {
    title: "ติดตามได้ดีขึ้น",
    detail: "เก็บข้อมูลและ lead capture ได้ดีขึ้นจากโครงสร้างเดียวกัน",
  },
  {
    title: "ประหยัดต้นทุนขึ้น",
    detail: "ไม่ต้องจ้างหลายเจ้าหรือใช้หลายเครื่องมือแยกกัน",
  },
];

const productSuite = [
  { title: "NEX Create", detail: "สร้างสื่อและภาพโฆษณา" },
  { title: "NEX Card", detail: "นามบัตรดิจิทัล" },
  { title: "NEX Book", detail: "e-Catalog / e-Book" },
  { title: "NEX Form", detail: "ฟอร์มเก็บข้อมูล / ออเดอร์" },
  { title: "NEX Code", detail: "QR Code Generator" },
  { title: "NEX Page", detail: "Landing Page Builder" },
];

const coreProblems = [
  "ทำคอนเทนต์ไม่ทัน หรือไม่มีทีมกราฟิก",
  "ลูกค้ามาจากหลายช่องทางแล้วข้อมูลกระจัดกระจาย",
  "ไม่มี Landing Page ที่สวยและปรับเร็ว",
  "เก็บ lead แล้วไม่ตามต่อ",
  "ไม่มีข้อมูลวิเคราะห์เพื่อปรับแคมเปญ",
];

const targetSegments = [
  "ธุรกิจที่ใช้ Facebook / LINE / IG / TikTok",
  "ธุรกิจบริการ / ร้านค้า / ตัวแทนขาย",
  "อสังหา / โรงงานขนาดเล็ก",
  "ทีมที่ต้องการลิงก์ / QR / หน้าแนะนำสินค้าใช้ง่าย",
];

export default function EnterprisePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#EEF0FF] text-[#0F172A]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.18),transparent_34%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.45),transparent_42%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_26%),linear-gradient(180deg,#f6f8ff_0%,#eef0ff_52%,#e7edff_100%)]" />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 py-10 sm:py-14">
        <div className="mb-8 flex justify-center">
          <div className="relative h-24 w-full max-w-[280px] overflow-visible sm:h-28 sm:max-w-[340px]">
            <Image
              src="/nex_logo_nobg.png"
              alt="NEX Solution"
              fill
              className="pointer-events-none object-contain scale-[1.6]"
              priority
              unoptimized
            />
          </div>
        </div>

        <section className="mx-auto max-w-4xl text-center">
          <p className="mb-3 inline-block rounded-full border border-[#D9E1F2] bg-white/80 px-4 py-1 text-xs font-bold tracking-widest text-[#050579]">
            NEX SOLUTION OVERVIEW
          </p>
          <h1 className="text-3xl font-black leading-tight text-[#050579] sm:text-5xl">
            NEX Solution คือแพลตฟอร์มเครื่องมือ
            <span className="block bg-gradient-to-r from-[#050579] via-[#2563EB] to-[#F97316] bg-clip-text text-transparent">
              การตลาดและการขายดิจิทัลสำหรับ SME
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-[#475569] sm:text-base">
            ช่วยให้ธุรกิจสร้างสื่อ รับลูกค้า เก็บข้อมูล ติดตามผล และปิดการขายได้ในระบบเดียว
            หรือเชื่อมกันเป็น ecosystem โดยเป็นการ rebuild จาก vision เดิมให้ใช้งานได้จริงในยุค AI
          </p>
        </section>

        <section className="mt-12 rounded-3xl border border-[#D9E1F2] bg-white/92 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.22)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#475569]">Value Proposition</p>
          <h2 className="mt-3 text-2xl font-black text-[#050579] sm:text-3xl">
            NEX Solution ช่วยให้ธุรกิจได้อะไร
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {valueProps.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-[#E8ECFF] bg-[#F8FAFF] p-5"
              >
                <h3 className="text-lg font-extrabold text-[#050579]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#475569]">Product Suite</p>
            <h2 className="mt-3 text-2xl font-black text-[#050579] sm:text-3xl">
              กลุ่มผลิตภัณฑ์หลักของ NEX Solution
            </h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {productSuite.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-[#D9E1F2] bg-white/92 p-5 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.22)]"
              >
                <h3 className="text-lg font-extrabold text-[#050579]">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#475569]">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-[#D9E1F2] bg-white/92 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.22)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#475569]">Core Problem</p>
            <h2 className="mt-3 text-2xl font-black text-[#050579] sm:text-3xl">
              ปัญหาหลักที่ NEX ช่วยแก้
            </h2>
            <div className="mt-6 space-y-3">
              {coreProblems.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#E8ECFF] bg-[#F8FAFF] px-4 py-4 text-sm leading-7 text-[#475569]"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[#D9E1F2] bg-[linear-gradient(120deg,rgba(255,255,255,0.96)_0%,rgba(232,236,255,0.98)_100%)] p-6 shadow-[0_24px_60px_-40px_rgba(5,5,121,0.28)] sm:p-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#475569]">Target Segments</p>
            <h2 className="mt-3 text-2xl font-black text-[#050579]">
              เหมาะกับธุรกิจแบบไหน
            </h2>
            <div className="mt-6 space-y-3">
              {targetSegments.map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[#E8ECFF] bg-white px-4 py-4 text-sm leading-7 text-[#475569]"
                >
                  {item}
                </div>
              ))}
            </div>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href="https://nexsolution.cloud/what-is-nex"
                className="inline-flex items-center justify-center rounded-full bg-[#F97316] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[#EA580C]"
              >
                NEX คืออะไร
              </a>
              <a
                href="https://nexsolution.cloud/"
                className="inline-flex items-center justify-center rounded-full border border-[#D9E1F2] bg-white px-6 py-3 text-sm font-bold text-[#050579] transition hover:bg-[#F6F8FF]"
              >
                กลับหน้าแรก
              </a>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
