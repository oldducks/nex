'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function EnterpriseClient() {
  return (
    <div className="font-sans bg-[#EEF0FF] text-[#0F172A] overflow-x-hidden min-h-screen">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E5E7EB] shadow-sm">
        <div className="max-w-[1080px] mx-auto px-6 flex items-center justify-between h-[60px]">
          <Link href="/" className="flex items-center">
            <Image src="/nex-logo-current-transparent.png" alt="NEX Solution" width={100} height={36} className="object-contain" priority />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/start#products" className="hidden sm:block text-[14px] text-[#475569] px-[14px] py-[6px] rounded-lg hover:text-[#050579] hover:bg-[#EEF0FF] transition-all">ผลิตภัณฑ์</Link>
            <Link href="/start#compare" className="hidden sm:block text-[14px] text-[#475569] px-[14px] py-[6px] rounded-lg hover:text-[#050579] hover:bg-[#EEF0FF] transition-all">เปรียบเทียบ</Link>
            <Link href="/start#pricing" className="hidden sm:block text-[14px] text-[#475569] px-[14px] py-[6px] rounded-lg hover:text-[#050579] hover:bg-[#EEF0FF] transition-all">ราคา</Link>
            <Link href="/start#contact" className="hidden sm:block text-[14px] text-[#475569] px-[14px] py-[6px] rounded-lg hover:text-[#050579] hover:bg-[#EEF0FF] transition-all">ติดต่อ</Link>
            <Link href="/start/examples" className="hidden sm:block text-[14px] text-[#475569] px-[14px] py-[6px] rounded-lg hover:text-[#050579] hover:bg-[#EEF0FF] transition-all">ตัวอย่าง</Link>
            <Link href="/start/enterprise" className="hidden sm:block text-[14px] text-[#050579] font-semibold px-[14px] py-[6px] rounded-lg bg-[#EEF0FF] transition-all">ลูกค้าองค์กร</Link>
            <Link href="/login" className="hidden sm:block text-[14px] text-[#050579] px-4 py-[7px] rounded-lg border border-[#D9E1F2] hover:border-[#050579] transition-all">เข้าสู่ระบบ</Link>
            <Link href="/register" className="text-[14px] font-semibold bg-[#F97316] hover:bg-[#EA580C] text-white px-5 py-2 rounded-lg transition-all">เริ่มต้นฟรี</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="pt-[100px] pb-8 px-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(155deg, #03034F 0%, #050579 55%, #1010C0 100%)' }}
      >
        {/* background glow */}
        <div className="absolute -top-[100px] -right-[100px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(249,115,22,.12) 0%, transparent 65%)' }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(255,255,255,.04) 0%, transparent 70%)' }} />

        <div className="max-w-[700px] mx-auto text-center">
          {/* badge */}
          <div className="inline-flex items-center gap-2 bg-[#7C3AED]/20 border border-[#7C3AED]/35 text-[#C4B5FD] text-xs font-bold tracking-wider px-[14px] py-[6px] rounded-full mb-4">
            <span className="w-[6px] h-[6px] rounded-full bg-[#A78BFA] animate-pulse" />
            NEX Enterprise Sales Network
          </div>

          {/* heading — fix line-height for Thai */}
          <h1 className="text-[clamp(28px,4vw,46px)] font-bold text-white mb-4" style={{ lineHeight: 1.45 }}>
            เปลี่ยนพนักงานของคุณ
            <em className="not-italic text-[#F97316] block" style={{ marginTop: '0.15em' }}>
              ให้เป็นทีมขายได้วันนี้
            </em>
          </h1>

          <p className="text-[15px] text-white/70 leading-[1.7] max-w-[480px] mx-auto mb-6">
            ให้พนักงานทุกคนมีลิงค์ขายของตัวเอง ติดตามผลได้ และคำนวณค่าคอมอย่างเป็นระบบ — ไม่ต้องจ้างเซลส์เพิ่ม
          </p>

          {/* CTA buttons */}
          <div className="flex gap-3 justify-center flex-wrap mb-8">
            <Link href="/start#contact"
              className="bg-[#F97316] hover:bg-[#EA580C] text-white text-[14px] font-semibold px-7 py-3 rounded-[10px] transition-all shadow-[0_4px_20px_rgba(249,115,22,.35)]">
              ขอเดโมสำหรับองค์กร
            </Link>
            <a href="#how"
              className="border border-white/30 text-white/90 text-[14px] px-7 py-3 rounded-[10px] hover:border-white/60 hover:text-white transition-all backdrop-blur-sm">
              ดูวิธีการทำงาน
            </a>
          </div>

          {/* Flow diagram — improved contrast */}
          <div className="flex items-center justify-center flex-wrap gap-y-3">
            {[
              { icon: '🏢', label: 'บริษัท' },
              { icon: '👤', label: 'พนักงาน' },
              { icon: '🔗', label: 'Link/QR' },
              { icon: '👥', label: 'ลูกค้า' },
              { icon: '💰', label: 'ค่าคอม', highlight: true },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex items-center">
                <div className={`flex flex-col items-center justify-center rounded-[12px] border px-5 py-3 min-w-[72px] text-center transition-all
                  ${step.highlight
                    ? 'border-green-400/60 bg-green-500/20 shadow-[0_0_16px_rgba(74,222,128,.15)]'
                    : 'border-white/30 bg-white/15 shadow-[0_2px_8px_rgba(0,0,0,.2)]'
                  }`}>
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center mb-2
                    ${step.highlight ? 'bg-green-500/25' : 'bg-white/20'}`}>
                    <span className="text-[18px] leading-none">{step.icon}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-white tracking-wide">{step.label}</span>
                </div>
                {i < arr.length - 1 && (
                  <span className="text-white/50 mx-2 text-base font-light">→</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="bg-[#050579]">
        <div className="max-w-[800px] mx-auto grid grid-cols-3 gap-[1px] bg-[#1a1a8a]">
          {[
            { num: '3x', label: 'โอกาสขายเพิ่มขึ้น' },
            { num: '100%', label: 'ติดตามยอดทุก Lead' },
            { num: '฿0', label: 'ค่าจ้างเซลส์เพิ่ม' },
          ].map(({ num, label }) => (
            <div key={label} className="bg-[#050579] py-6 text-center">
              <div className="text-[28px] font-bold text-[#F97316]">{num}</div>
              <div className="text-[11px] text-white/60 mt-1 tracking-wide">{label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-6 py-16 space-y-16">

        {/* ── PAIN POINTS ── */}
        <div>
          <div className="text-center text-[11px] font-bold text-[#F97316] uppercase tracking-widest mb-3">ปัญหาที่พบบ่อย</div>
          <h2 className="text-center text-[clamp(20px,2.5vw,28px)] font-bold text-[#050579] leading-[1.5] mb-7">
            องค์กรของคุณมีสิ่งเหล่านี้<br /> เป็นอุปสรรคสำคัญอยู่ไหม?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: '😶', title: 'ไม่รู้ว่าใครส่งลูกค้ามา', desc: 'พนักงานส่งข้อมูลกันเองมือ ไม่มีระบบยืนยันว่ายอดขายมาจากใคร' },
              { icon: '💸', title: 'ค่าคอมไม่ถูกต้อง', desc: 'ไม่มีหลักฐานที่ชัดเจน ทำให้เกิดข้อถกเถียงเรื่องค่าคอมในทีม' },
              { icon: '🧩', title: 'ระบบกระจัดกระจาย', desc: 'ใช้ LINE, spreadsheet, คาดเดา ไม่มีแหล่งข้อมูลเดียวที่เชื่อถือได้' },
              { icon: '😞', title: 'พนักงานขายไม่เต็มที่', desc: 'ไม่รู้ว่าตัวเองช่วยสร้างยอดขายได้เท่าไร ทำให้ไม่อยากช่วยขาย' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="bg-white rounded-[14px] border border-[#E2E8F0] p-5 hover:border-[#D9E1F2] hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-[10px] bg-[#EEF0FF] flex items-center justify-center text-[20px] mb-4">{icon}</div>
                <div className="text-[14px] font-semibold text-[#050579] mb-2">{title}</div>
                <div className="text-[13px] text-[#64748B] leading-[1.7]">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── HOW IT WORKS ── */}
        <div id="how" className="rounded-[20px] bg-[#050579] p-8 shadow-[0_20px_60px_rgba(5,5,121,.18)]">
          <div className="text-center text-[11px] font-bold text-[#F97316] uppercase tracking-widest mb-3">วิธีการทำงาน</div>
          <h2 className="text-center text-[22px] font-bold text-white mb-8 leading-[1.5]">เริ่มได้ภายใน 15 นาที</h2>
          <div className="flex flex-col">
            {[
              { title: 'บริษัทสร้าง NEX Sale Page', desc: 'อัปโหลดข้อมูลสินค้า รูปภาพ ราคา และตั้งค่าค่าคอม', tag: '~10 นาที' },
              { title: 'ระบบสร้างลิงค์เฉพาะให้พนักงานทุกคน', desc: 'nexsolution.cloud/co/product?ref=somchai พร้อม QR Code พิมพ์ได้ทันที', tag: null },
              { title: 'พนักงานแชร์ตามช่องทางตนเอง', desc: 'LINE, Facebook, TikTok, QR หน้าร้าน, นามออนไลน์ ใช้ได้ทุกที่', tag: null },
              { title: 'ลูกค้ากรอกฟอร์มหรือสั่งซื้อ', desc: 'ระบบบันทึกที่มาอัตโนมัติ ผูกกับพนักงานโดยอัตโนมัติ', tag: null },
              { title: 'แอดมินอนุมัติและคำนวณค่าคอม', desc: 'เห็นยอด Lead / ยอดขาย / ค่าคอมรอจ่าย พร้อมอนุมัติผ่าน Dashboard', tag: 'โปร่งใส ตรวจสอบได้ทุกขั้นตอน' },
            ].map((step, i) => (
              <div key={i} className={`flex gap-5 items-start py-5 ${i < 4 ? 'border-b border-white/[0.10]' : ''}`}>
                <div className="w-9 h-9 rounded-full bg-[#F97316] flex items-center justify-center text-white text-[13px] font-bold shrink-0 mt-[2px] shadow-[0_2px_8px_rgba(249,115,22,.35)]">
                  {i + 1}
                </div>
                <div className="flex-1">
                  <div className="text-white text-[14px] font-semibold mb-1 leading-[1.5]">{step.title}</div>
                  <div className="text-white/60 text-[13px] leading-[1.7]">{step.desc}</div>
                  {step.tag && (
                    <span className="inline-block mt-2 bg-green-500/15 border border-green-500/20 text-green-400 text-[11px] px-3 py-[3px] rounded-full">{step.tag}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── LINK DEMO ── */}
        <div>
          <div className="text-center text-[11px] font-bold text-[#F97316] uppercase tracking-widest mb-3">ลิงค์ส่วนตัวของพนักงาน</div>
          <h2 className="text-center text-[clamp(20px,2.5vw,28px)] font-bold text-[#050579] leading-[1.5] mb-2">แชร์ได้ทุกช่องทาง ติดตามยอดได้ทุก Lead</h2>
          <p className="text-center text-[13px] text-[#64748B] leading-[1.7] mb-6">พนักงานแต่ละคนได้รับลิงค์เฉพาะตัว — ลูกค้ากดจากที่ไหนก็รู้ว่าใครส่งมา</p>

          {/* URL Bar mockup */}
          <div className="rounded-[14px] border border-[#E2E8F0] overflow-hidden shadow-[0_8px_30px_rgba(5,5,121,.08)] mb-4">
            <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-4 py-3 flex items-center gap-3">
              <div className="flex gap-[6px]">
                <span className="w-[11px] h-[11px] rounded-full bg-red-300" />
                <span className="w-[11px] h-[11px] rounded-full bg-yellow-300" />
                <span className="w-[11px] h-[11px] rounded-full bg-green-300" />
              </div>
              <div className="flex-1 flex items-center gap-2 bg-white rounded-[8px] border border-[#E2E8F0] px-3 py-[6px]">
                <svg className="w-3 h-3 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z" />
                </svg>
                <span className="text-[12px] text-[#475569] font-mono truncate">
                  nexsolution.cloud/co/<span className="text-[#050579] font-semibold">abc-realty</span>?ref=<span className="text-[#F97316] font-semibold">somchai</span>
                </span>
              </div>
            </div>
            <div className="bg-white px-5 py-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-[10px] bg-[#EEF0FF] flex items-center justify-center shrink-0 text-2xl">
                  🏠
                </div>
                <div className="flex-1">
                  <div className="text-[14px] font-bold text-[#050579] mb-1">ABC Realty — คอนโด ใจกลางเมือง</div>
                  <div className="text-[12px] text-[#94A3B8] mb-3 leading-relaxed">เริ่มต้น ฿2.9 ล้าน · ฟรีค่าโอน · รับส่วนลดพิเศษวันนี้</div>
                  <div className="flex gap-2 flex-wrap">
                    <span className="bg-[#F97316] text-white text-[11px] font-semibold px-4 py-2 rounded-[8px]">ลงทะเบียนรับข้อมูล</span>
                    <span className="border border-[#E2E8F0] text-[#475569] text-[11px] px-4 py-2 rounded-[8px]">ดูโครงการ</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-[#F1F5F9] flex items-center gap-2">
                <span className="w-[6px] h-[6px] rounded-full bg-[#F97316] shrink-0" />
                <span className="text-[11px] text-[#94A3B8]">ลิงค์นี้ติดตามโดย <span className="font-semibold text-[#050579]">สมชาย วงศ์ดี</span> · ฝ่ายขาย</span>
              </div>
            </div>
          </div>

          {/* Channel chips */}
          <div className="bg-white rounded-[14px] border border-[#E2E8F0] px-5 py-5">
            <div className="text-[11px] text-[#94A3B8] font-semibold mb-4 uppercase tracking-wide">แชร์ได้ผ่านทุกช่องทาง</div>
            <div className="flex flex-wrap gap-2">
              {[
                { icon: '💬', label: 'LINE', color: 'bg-green-50 border-green-200 text-green-700' },
                { icon: '📘', label: 'Facebook', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                { icon: '🎵', label: 'TikTok', color: 'bg-slate-50 border-slate-200 text-slate-700' },
                { icon: '📱', label: 'Instagram', color: 'bg-pink-50 border-pink-200 text-pink-700' },
                { icon: '🖨️', label: 'QR Code พิมพ์ได้', color: 'bg-[#EEF0FF] border-[#D9E1F2] text-[#050579]' },
                { icon: '🪪', label: 'นามออนไลน์ NEX', color: 'bg-orange-50 border-orange-200 text-orange-700' },
                { icon: '📧', label: 'Email / SMS', color: 'bg-slate-50 border-slate-200 text-slate-600' },
              ].map(({ icon, label, color }) => (
                <span key={label} className={`flex items-center gap-2 rounded-[10px] border px-4 py-2 text-[12px] font-medium ${color}`}>
                  <span>{icon}</span>
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── DASHBOARD MOCKUP ── */}
        <div>
          <div className="text-center text-[11px] font-bold text-[#F97316] uppercase tracking-widest mb-3">Dashboard องค์กร</div>
          <h2 className="text-center text-[clamp(20px,2.5vw,28px)] font-bold text-[#050579] leading-[1.5] mb-2">เห็นทุกอย่างที่เดียว</h2>
          <p className="text-center text-[13px] text-[#64748B] leading-[1.7] mb-6">ผู้บริหารเห็นว่าใครช่วยสร้างยอดขาย ใครรอจ่ายค่าคอม ใน real-time</p>
          <div className="rounded-[16px] border border-[#E2E8F0] overflow-hidden shadow-[0_20px_60px_rgba(5,5,121,.10)]">
            <div className="bg-[#050579] px-5 py-4 flex items-center justify-between">
              <span className="text-white text-[13px] font-semibold">NEX Enterprise Dashboard — บริษัท ABC อสังหา จำกัด</span>
              <span className="bg-green-500/20 text-green-400 text-[10px] px-3 py-[3px] rounded-full font-semibold">● Live</span>
            </div>
            <div className="grid grid-cols-4 gap-[1px] bg-[#F1F5F9]">
              {[
                { val: '24', label: 'พนักงานที่แชร์', color: '' },
                { val: '1,847', label: 'คลิกทั้งหมด', color: '' },
                { val: '138', label: 'Lead ที่ได้', color: 'text-[#F97316]' },
                { val: '฿24,500', label: 'ค่าคอมรอจ่าย', color: 'text-green-600' },
              ].map(({ val, label, color }) => (
                <div key={label} className="bg-white py-5 text-center">
                  <div className={`text-[20px] font-bold ${color || 'text-[#050579]'}`}>{val}</div>
                  <div className="text-[10px] text-[#94A3B8] mt-1">{label}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-5 px-5 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              {['พนักงาน', 'คลิก', 'Lead', 'ค่าคอม', 'สถานะ'].map((col) => (
                <span key={col} className="text-[11px] text-[#94A3B8] font-semibold">{col}</span>
              ))}
            </div>
            {[
              { name: 'สมชาย วงศ์ดี', dept: 'ฝ่ายขาย', clicks: '420', leads: '38', commission: '฿7,600', status: 'รออนุมัติ', statusCls: 'bg-yellow-100 text-yellow-700' },
              { name: 'กิตติ รักษ์ดี', dept: 'Customer Service', clicks: '318', leads: '27', commission: '฿5,400', status: 'อนุมัติแล้ว', statusCls: 'bg-green-100 text-green-700' },
              { name: 'วิทัย แสงดี', dept: 'การตลาด', clicks: '241', leads: '19', commission: '฿3,800', status: 'อนุมัติแล้ว', statusCls: 'bg-green-100 text-green-700' },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-5 px-5 py-4 border-b border-[#F1F5F9] items-center last:border-b-0 hover:bg-[#FAFBFF] transition-colors">
                <div>
                  <div className="text-[13px] font-semibold text-[#050579]">{row.name}</div>
                  <div className="text-[11px] text-[#94A3B8] mt-[2px]">{row.dept}</div>
                </div>
                <span className="text-[12px] text-[#334155]">{row.clicks}</span>
                <span className="text-[12px] text-[#334155]">{row.leads}</span>
                <span className="text-[12px] text-[#F97316] font-semibold">{row.commission}</span>
                <span className={`text-[11px] px-2 py-[3px] rounded-full font-medium inline-block ${row.statusCls}`}>{row.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── BENEFITS ── */}
        <div>
          <div className="text-center text-[11px] font-bold text-[#F97316] uppercase tracking-widest mb-3">ประโยชน์ที่ได้รับ</div>
          <h2 className="text-center text-[clamp(20px,2.5vw,28px)] font-bold text-[#050579] leading-[1.5] mb-7">ทุกฝ่ายได้ประโยชน์</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { who: 'สำหรับบริษัท', bg: 'bg-blue-50 border-blue-100', whoColor: 'text-blue-700', dotColor: 'bg-blue-300', points: ['เพิ่มโอกาสขายโดยไม่ต้องจ้างเซลส์เพิ่ม', 'ลด Cost per Lead', 'ข้อมูลโปร่งใส ตรวจสอบได้'] },
              { who: 'สำหรับพนักงาน', bg: 'bg-orange-50 border-orange-100', whoColor: 'text-orange-700', dotColor: 'bg-orange-300', points: ['มีโอกาสสร้างรายได้เสริม', 'เห็นยอดตัวเองใน real-time', 'รู้สึกว่าช่วยบริษัทได้จริง'] },
              { who: 'สำหรับผู้บริหาร', bg: 'bg-green-50 border-green-100', whoColor: 'text-green-700', dotColor: 'bg-green-300', points: ['เห็นข้อมูลจริงว่าใครสร้างยอด', 'จัดการค่าคอมได้เป็นระบบ', 'ลดข้อถกเถียงในทีม'] },
            ].map(({ who, bg, whoColor, dotColor, points }) => (
              <div key={who} className={`rounded-[14px] border p-5 ${bg}`}>
                <div className={`text-[11px] font-bold uppercase tracking-wider mb-4 ${whoColor}`}>{who}</div>
                <ul className="space-y-3">
                  {points.map((pt) => (
                    <li key={pt} className="text-[13px] text-[#334155] leading-[1.6] flex gap-2 items-start">
                      <span className={`w-[5px] h-[5px] rounded-full ${dotColor} mt-[7px] shrink-0`} />
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* ── USE CASES ── */}
        <div>
          <div className="text-center text-[11px] font-bold text-[#F97316] uppercase tracking-widest mb-3">เหมาะกับธุรกิจ</div>
          <h2 className="text-center text-[clamp(20px,2.5vw,28px)] font-bold text-[#050579] leading-[1.5] mb-6">ใช้ได้กับทุกอุตสาหกรรม</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { label: '🏠 อสังหาริมทรัพย์', highlight: true },
              { label: '🚗 รถยนต์', highlight: true },
              { label: '🏥 คลินิก / สุขภาพ', highlight: true },
              { label: '📚 คอร์สเรียน', highlight: false },
              { label: '🤝 ประกันภัย', highlight: false },
              { label: '📦 สินค้า B2B', highlight: false },
              { label: '🪟 แฟรนไชส์', highlight: false },
              { label: '👔 ตัวแทนจำหน่าย', highlight: false },
              { label: '🏬 ร้านค้าหลายสาขา', highlight: false },
            ].map(({ label, highlight }) => (
              <span key={label} className={`rounded-[10px] border px-4 py-2 text-[13px] font-medium transition-all
                ${highlight
                  ? 'border-[#F97316] text-[#F97316] bg-orange-50'
                  : 'border-[#E2E8F0] text-[#334155] bg-white hover:border-[#D9E1F2]'
                }`}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* ── WARNING ── */}
        <div className="bg-amber-50 border border-amber-200 border-l-[3px] border-l-amber-400 rounded-[10px] px-5 py-4">
          <div className="text-[12px] font-bold text-amber-800 mb-1">หมายเหตุ</div>
          <div className="text-[13px] text-amber-700 leading-[1.7]">
            ฟีเจอร์ติดตามยอดและคำนวณค่าคอมพร้อมใช้งานแล้ว — ระบบจ่ายเงินอัตโนมัติ (Payout) จะเปิดให้ใช้ในเร็วๆ นี้
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="rounded-[20px] bg-[#050579] p-10 text-center shadow-[0_20px_60px_rgba(5,5,121,.20)]">
          <div className="text-[11px] text-white/50 mb-4 uppercase tracking-widest">เริ่มต้นวันนี้</div>
          <h2 className="text-[clamp(22px,3vw,34px)] font-bold text-white mb-4" style={{ lineHeight: 1.55 }}>
            เปลี่ยนพนักงานของคุณ
            <em className="not-italic text-[#F97316] block" style={{ marginTop: '0.25em' }}>ให้เป็นโอกาสขายของคุณ</em>
          </h2>
          <p className="text-white/60 text-[14px] leading-[1.7] mb-8 max-w-[400px] mx-auto">
            ให้ NEX ช่วยให้ทุกการแชร์ กลายเป็นโอกาสที่ติดตามผลได้
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/start#contact"
              className="bg-[#F97316] hover:bg-[#EA580C] text-white text-[14px] font-bold px-8 py-4 rounded-[10px] transition-all shadow-[0_4px_20px_rgba(249,115,22,.40)]">
              ขอเดโมสำหรับองค์กร
            </Link>
            <Link href="/start"
              className="border border-white/25 text-white/80 hover:border-white hover:text-white text-[14px] px-8 py-4 rounded-[10px] transition-all">
              ดูผลิตภัณฑ์ทั้งหมด
            </Link>
          </div>
        </div>

      </div>

      {/* ── FOOTER ── */}
      <footer className="bg-[#03034F] border-t border-white/8 py-5 px-6 text-center text-white/40 text-xs tracking-wide">
        © NEX Solution. All rights reserved. บริษัท คราม อินเทลลิเจนท์ เอไอ จำกัด
      </footer>
    </div>
  );
}
