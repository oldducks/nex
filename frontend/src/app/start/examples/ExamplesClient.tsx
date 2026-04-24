'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function ExamplesClient() {
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
            <Link
              href="/start"
              className="hidden sm:block text-[14px] text-[#475569] px-[14px] py-[6px] rounded-lg hover:text-[#050579] hover:bg-[#EEF0FF] transition-all"
            >
              ← กลับหน้าหลัก
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
        className="pt-[100px] pb-14 px-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(155deg, #03034F 0%, #050579 55%, #1010C0 100%)' }}
      >
        <div
          className="absolute -top-[120px] -right-[120px] w-[400px] h-[400px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,.10) 0%, transparent 70%)' }}
        />
        <div className="max-w-[700px] mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-[#F97316]/12 border border-[#F97316]/30 text-[#FED7AA] text-xs font-bold tracking-wider px-[14px] py-[5px] rounded-full mb-5">
            <span className="w-[6px] h-[6px] rounded-full bg-[#F97316] animate-pulse" />
            ตัวอย่างการใช้งานจริง · Use Cases
          </div>
          <h1 className="text-[clamp(26px,4vw,44px)] font-bold text-white leading-tight mb-4">
            เห็นของจริง
            <br />
            <em className="not-italic text-[#F97316]">ก่อนตัดสินใจ</em>
          </h1>
          <p className="text-[15px] text-white/70 leading-relaxed max-w-[480px] mx-auto">
            3 ผลิตภัณฑ์ใน NEX Solution — นี่คือตัวอย่างจริงที่ธุรกิจไทยใช้อยู่วันนี้
          </p>
        </div>
      </section>

      {/* ── SECTION 1: NEX Digital ID ── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          {/* Phone Mockup — LEFT */}
          <div className="flex flex-col items-center">
            <div
              className="w-[240px] rounded-[36px] p-[10px] shadow-[0_30px_80px_rgba(5,5,121,.25),0_0_0_1px_rgba(255,255,255,.08)]"
              style={{ background: '#1C1C2E' }}
            >
              <div className="rounded-[28px] overflow-hidden bg-white">
                <div className="h-7 flex items-center justify-center" style={{ background: '#1C1C2E' }}>
                  <div className="w-[60px] h-4 rounded-b-[10px]" style={{ background: '#1C1C2E' }} />
                </div>
                <div className="p-[18px] px-[14px]">
                  <div className="flex items-center gap-[10px] mb-[14px]">
                    <div
                      className="w-[46px] h-[46px] rounded-full flex items-center justify-center text-lg shrink-0"
                      style={{ background: 'linear-gradient(135deg,#050579,#2563EB)' }}
                    >
                      👩
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-[#0F172A]">รตี อัครเกร</div>
                      <div className="text-[10px] text-[#64748B]">Property Consultant</div>
                      <div className="text-[10px] text-[#F97316] font-medium">Real Estate · Bangkok</div>
                    </div>
                  </div>
                  <div className="h-px bg-[#E5E7EB] my-[10px]" />
                  <div className="flex gap-[5px] flex-wrap mb-[10px]">
                    {['📞 โทร', '💬 LINE', '🏠 โครงการ', '📸 IG'].map((c) => (
                      <span key={c} className="bg-[#F1F5F9] rounded-[5px] px-[7px] py-1 text-[9px] text-[#475569]">{c}</span>
                    ))}
                  </div>
                  <div className="flex gap-[5px]">
                    <button className="flex-1 bg-[#F97316] text-white border-none rounded-[7px] py-[7px] text-[10px] font-bold">บันทึกเบอร์</button>
                    <button className="flex-1 bg-[#F1F5F9] text-[#475569] border-none rounded-[7px] py-[7px] text-[10px]">QR Code</button>
                  </div>
                  <div className="mt-[10px] text-center">
                    <div className="w-[56px] h-[56px] mx-auto mb-1 rounded-[4px]" style={{ background: 'repeating-conic-gradient(#1C1C2E 0% 25%, #fff 0% 50%) 0 0 / 6px 6px' }} />
                    <div className="text-[9px] text-[#94A3B8]">nexsolution.cloud/rat01/ratteeakr01</div>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-center text-[12px] text-[#64748B] mt-4 max-w-[220px]">
              ตัวอย่างจริง: NEX Digital ID ของตัวแทนอสังหาฯ
            </p>
          </div>

          {/* Content — RIGHT */}
          <div>
            <div className="inline-flex items-center gap-[6px] text-[11px] font-bold tracking-wider px-3 py-1 rounded-full mb-4 bg-[#E8ECFF] text-[#050579] border border-[#D9E1F2]">
              🪪 NEX Digital ID · ตัวอย่างที่ 1
            </div>
            <h2 className="text-[clamp(22px,3vw,32px)] font-bold text-[#050579] mb-3 leading-tight">
              นามบัตรดิจิทัล
              <br />
              <em className="not-italic text-[#F97316]">ที่ลูกค้าบันทึกได้ทันที</em>
            </h2>
            <p className="text-[14px] text-[#475569] leading-relaxed mb-6">
              คุณรตี — ตัวแทนขายอสังหาริมทรัพย์ ที่ต้องแนะนำตัวกับลูกค้าใหม่ทุกวัน
              เดิมต้องพิมพ์นามบัตรกระดาษและส่งไลน์แยก ตอนนี้ส่งลิงค์เดียว
              ลูกค้าบันทึกเบอร์เข้า contacts ได้ทันที ไม่ต้องพิมพ์เอง
            </p>
            <div className="flex flex-col gap-[10px] mb-7">
              {[
                { icon: '📱', title: 'ลิงค์ส่วนตัว', desc: 'nexsolution.cloud/rat01/ratteeakr01 — จำง่าย แชร์ใน LINE ได้ทันที' },
                { icon: '💾', title: 'vCard Download', desc: 'ลูกค้าแตะ "บันทึกเบอร์" — บันทึกเข้า contacts โดยไม่ต้องพิมพ์' },
                { icon: '📊', title: 'รู้ว่าใครเปิด', desc: 'เห็น analytics ว่ามีคนเปิดกี่ครั้ง มาจาก LINE หรือ Facebook' },
                { icon: '🖼️', title: 'QR Code พร้อมแชร์', desc: 'พิมพ์ลงนามบัตรกระดาษหรือ standee ได้เลย' },
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
            <div className="flex flex-wrap gap-3">
              <a
                href="https://nexsolution.cloud/rat01/ratteeakr01"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#050579] hover:bg-[#03034F] text-white text-[14px] font-semibold px-6 py-3 rounded-[10px] transition-all"
              >
                🔗 ดูตัวอย่างจริง
              </a>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 border-[1.5px] border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white text-[14px] font-semibold px-6 py-3 rounded-[10px] transition-all"
              >
                สร้างของคุณเอง →
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* ── SECTION 2: NEX Catalog ── */}
      <section className="py-16 px-6 bg-[#EEF0FF]">
        <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          {/* Browser Mockup — LEFT */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[340px]">
              <div className="bg-[#2D3748] rounded-[14px_14px_0_0] p-2 pb-0 shadow-[0_30px_80px_rgba(5,5,121,.20)]">
                <div className="bg-white rounded-[8px_8px_0_0] overflow-hidden">
                  <div className="bg-[#F1F5F9] px-[10px] py-[6px] flex gap-[5px] items-center border-b border-[#E5E7EB]">
                    <span className="w-[7px] h-[7px] rounded-full bg-[#FF5F57] inline-block" />
                    <span className="w-[7px] h-[7px] rounded-full bg-[#FFBC2E] inline-block mx-[3px]" />
                    <span className="w-[7px] h-[7px] rounded-full bg-[#28C840] inline-block mr-[6px]" />
                    <span className="text-[9px] text-[#94A3B8] font-mono bg-white rounded px-2 py-[2px] flex-1 truncate">
                      nexsolution.cloud/catalog/5?view=book
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="bg-[#050579] text-white px-3 py-2 -mx-3 -mt-3 mb-[10px] flex justify-between items-center">
                      <div className="text-[11px] font-bold">📦 Product Catalog 2025</div>
                      <div className="bg-[#F97316] text-[8px] px-[6px] py-[2px] rounded font-bold">Flipbook</div>
                    </div>
                    <div className="grid grid-cols-3 gap-[6px] mb-2">
                      {[
                        { bg: '#EEF0FF', icon: '🛋️', name: 'สินค้า A', price: '฿12,900' },
                        { bg: '#FFF7ED', icon: '🎁', name: 'สินค้า B', price: '฿3,500' },
                        { bg: '#F0FDF4', icon: '⭐', name: 'สินค้า C', price: '฿18,500' },
                      ].map(({ bg, icon, name, price }) => (
                        <div key={name} className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[5px] overflow-hidden">
                          <div className="h-10 flex items-center justify-center text-lg" style={{ background: bg }}>{icon}</div>
                          <div className="text-[8px] text-[#374151] p-[3px_4px] font-semibold">{name}</div>
                          <div className="text-[8px] text-[#F97316] px-1 pb-[3px] font-bold">{price}</div>
                        </div>
                      ))}
                    </div>
                    <button className="bg-[#050579] text-white border-none rounded px-2 py-1 text-[8px] font-bold block mx-auto">
                      📖 ดู Flipbook / Download PDF
                    </button>
                  </div>
                </div>
                <div className="bg-[#3D4A5C] h-[14px] rounded-[0_0_6px_6px]" />
              </div>
              <div className="w-[40%] h-2 bg-[#4A5568] mx-auto rounded-b-lg" />
            </div>
            <p className="text-center text-[12px] text-[#64748B] mt-4 max-w-[260px]">
              ตัวอย่างจริง: NEX Catalog แบบ Flipbook
            </p>
          </div>

          {/* Content — RIGHT */}
          <div>
            <div className="inline-flex items-center gap-[6px] text-[11px] font-bold tracking-wider px-3 py-1 rounded-full mb-4 bg-[#E8ECFF] text-[#050579] border border-[#D9E1F2]">
              📖 NEX Catalog · ตัวอย่างที่ 2
            </div>
            <h2 className="text-[clamp(22px,3vw,32px)] font-bold text-[#050579] mb-3 leading-tight">
              Catalog สินค้าดิจิทัล
              <br />
              <em className="not-italic text-[#F97316]">ลูกค้าเปิดได้ตลอดเวลา</em>
            </h2>
            <p className="text-[14px] text-[#475569] leading-relaxed mb-6">
              เจ้าของธุรกิจที่มีสินค้าหลายหมวด — เดิมส่ง PDF ผ่าน LINE แล้วลูกค้าหาไฟล์ไม่เจอ
              ตอนนี้แชร์ลิงค์เดียว ลูกค้าเปิดดู flipbook ได้บนมือถือ ดาวน์โหลด PDF
              หรือส่งต่อผ่าน QR ได้ทันที
            </p>
            <div className="flex flex-col gap-[10px] mb-7">
              {[
                { icon: '📄', title: 'Flipbook Viewer', desc: 'เปิดบนมือถือได้ทันที ไม่ต้องดาวน์โหลด ไม่ต้อง login' },
                { icon: '📥', title: 'Download PDF', desc: 'ลูกค้าโหลด PDF ได้เลย สำหรับส่งต่อหรือพริ้นท์' },
                { icon: '✏️', title: 'อัปเดตง่าย', desc: 'แก้ราคา เพิ่มสินค้า — ลิงค์เดิมยังใช้ได้ ไม่ต้องส่งใหม่' },
                { icon: '🔗', title: 'QR + Share Link', desc: 'แชร์ผ่าน LINE / IG / Facebook ได้ทันที' },
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
            <div className="flex flex-wrap gap-3">
              <a
                href="https://nexsolution.cloud/catalog/5?view=book"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#050579] hover:bg-[#03034F] text-white text-[14px] font-semibold px-6 py-3 rounded-[10px] transition-all"
              >
                🔗 ดูตัวอย่างจริง
              </a>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 border-[1.5px] border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white text-[14px] font-semibold px-6 py-3 rounded-[10px] transition-all"
              >
                สร้างของคุณเอง →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION 3: NEX Sale Page ── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          {/* Sale Page Mockup — LEFT */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-[280px] bg-white rounded-[16px] overflow-hidden shadow-[0_20px_60px_rgba(5,5,121,.15)] border border-[#D9E1F2]">
              <div className="p-4" style={{ background: 'linear-gradient(135deg,#050579,#1D1DB8)' }}>
                <div className="inline-block text-[8px] bg-[#F97316] text-white px-[7px] py-[2px] rounded font-bold mb-[6px]">
                  🔥 โปรพิเศษ
                </div>
                <div className="text-[13px] font-bold text-white mb-[3px]">
                  Sale Page ของคุณ<br />
                  พร้อมรับ Lead ทันที
                </div>
                <div className="text-[10px] text-white/80">
                  สร้างเอง · ไม่ต้องโค้ด · มี Analytics
                </div>
                <button className="mt-[10px] bg-[#F97316] text-white border-none rounded-[6px] px-[14px] py-[6px] text-[10px] font-bold">
                  รับโปรโมชันพิเศษ
                </button>
              </div>
              <div className="p-3">
                <div className="flex gap-[6px] mb-[10px]">
                  {[
                    { icon: '✅', txt: 'ฟอร์ม Lead' },
                    { icon: '📊', txt: 'Analytics' },
                    { icon: '🔗', txt: 'Custom URL' },
                  ].map(({ icon, txt }) => (
                    <div key={txt} className="flex-1 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[6px] p-[7px] text-center">
                      <div className="text-sm mb-[3px]">{icon}</div>
                      <div className="text-[8px] text-[#475569]">{txt}</div>
                    </div>
                  ))}
                </div>
                <div className="bg-[#F8FAFC] rounded-[6px] p-2">
                  <div className="text-[9px] font-bold text-[#050579] mb-[6px]">กรอกข้อมูลรับราคาทันที</div>
                  {['ชื่อ-นามสกุล', 'เบอร์โทรศัพท์'].map((ph) => (
                    <div key={ph} className="bg-white border border-[#E5E7EB] rounded px-2 py-[5px] text-[9px] text-[#94A3B8] mb-[5px]">
                      {ph}
                    </div>
                  ))}
                  <button className="w-full bg-[#F97316] text-white border-none rounded py-[6px] text-[9px] font-bold">
                    ส่งข้อมูล →
                  </button>
                </div>
              </div>
            </div>
            <p className="text-center text-[12px] text-[#64748B] mt-4 max-w-[220px]">
              ตัวอย่างจริง: NEX Sale Page สำหรับ Sales Agent
            </p>
          </div>

          {/* Content — RIGHT */}
          <div>
            <div className="inline-flex items-center gap-[6px] text-[11px] font-bold tracking-wider px-3 py-1 rounded-full mb-4 bg-[#E8ECFF] text-[#050579] border border-[#D9E1F2]">
              🛒 NEX Sale Page · ตัวอย่างที่ 3
            </div>
            <h2 className="text-[clamp(22px,3vw,32px)] font-bold text-[#050579] mb-3 leading-tight">
              หน้าขายพร้อมรับ Lead
              <br />
              <em className="not-italic text-[#F97316]">สร้างเองใน 30 นาที</em>
            </h2>
            <p className="text-[14px] text-[#475569] leading-relaxed mb-6">
              Sales agent ที่ต้องการ landing page เฉพาะแต่ละโปรโมชัน — ไม่มีทีม IT
              ไม่มีเว็บไซต์ ก็สร้างได้ มีฟอร์มรับ lead ในตัว เห็น analytics ว่าใครกรอก
              และ conversion rate คือเท่าไร
            </p>
            <div className="flex flex-col gap-[10px] mb-7">
              {[
                { icon: '🏗️', title: 'สร้างง่ายไม่ต้องโค้ด', desc: 'เลือก template — กรอกข้อมูล — ได้หน้าขายใน 30 นาที' },
                { icon: '📋', title: 'ฟอร์มรับ Lead ในตัว', desc: 'ลูกค้ากรอกชื่อ-เบอร์ในหน้าเดียวกัน export CSV ได้' },
                { icon: '📈', title: 'Conversion Analytics', desc: 'เห็น traffic, กี่คนกรอกฟอร์ม, conversion rate' },
                { icon: '🔗', title: 'Custom URL + UTM', desc: 'แยก traffic จาก Facebook / LINE / TikTok ได้ชัดเจน' },
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
            <div className="flex flex-wrap gap-3">
              <a
                href="https://nexsolution.cloud/lp/28"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#050579] hover:bg-[#03034F] text-white text-[14px] font-semibold px-6 py-3 rounded-[10px] transition-all"
              >
                🔗 ดูตัวอย่างจริง
              </a>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 border-[1.5px] border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white text-[14px] font-semibold px-6 py-3 rounded-[10px] transition-all"
              >
                สร้างของคุณเอง →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BOTTOM ── */}
      <section
        className="py-16 px-6 text-center"
        style={{ background: 'linear-gradient(155deg, #03034F 0%, #050579 100%)' }}
      >
        <div className="max-w-[560px] mx-auto">
          <h2 className="text-[clamp(22px,3.5vw,36px)] font-bold text-white mb-4">
            พร้อมสร้างของคุณเอง?
          </h2>
          <p className="text-[15px] text-white/70 mb-8">
            ตั้งต้นฟรี ใน 5 นาที ไม่ต้องใส่บัตรเครดิต
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-[#F97316] hover:bg-[#EA580C] text-white px-8 py-4 rounded-[10px] text-[16px] font-bold transition-all shadow-[0_4px_20px_rgba(249,115,22,.35)]"
            >
              เริ่มต้นฟรี →
            </Link>
            <Link
              href="/start"
              className="border border-white/30 text-white/80 hover:border-white hover:text-white px-8 py-4 rounded-[10px] text-[16px] font-semibold transition-all"
            >
              ← ดูรายละเอียดผลิตภัณฑ์
            </Link>
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
