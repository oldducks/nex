"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Upload } from "lucide-react";

type QuickAction = {
  label: string;
  href: string;
  primary?: boolean;
};

const quickActions = [
  { label: "NEX Control Your Future", href: "/nex-control-your-future-preview" },
  { label: "NEX Solution เครื่องมือการตลาด", href: "/what-is-nex-preview" },
  { label: "NEX Digital Asset สินทรัพย์ดิจิทัล", href: "/nex-digital-asset-partner-preview" },
  { label: "NEX MOS โซลูชั่นสำหรับองค์กร", href: "https://nexsolution.cloud/enterprise-mos-preview" },
  { label: "เข้าสู่ระบบ", href: "/login", primary: true },
] satisfies QuickAction[];

export default function LandingPage() {
  const [currentBackground, setCurrentBackground] = useState("/background01.jpg");

  const handleBackgroundUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setCurrentBackground(result);
        console.log('Background uploaded successfully!');
      };
      reader.readAsDataURL(file);
    } else {
      console.log('Please select a valid image file');
    }
  };

  return (
    <main 
      className="relative min-h-screen overflow-hidden text-white"
      style={{
        backgroundImage: `url(${currentBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative'
      }}
    >
      {/* Overlay สำหรับให้ข้อความอ่านง่าย */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)',
          pointerEvents: 'none'
        }}
      />
      
      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 pb-10 pt-5 sm:px-8 sm:pb-12 sm:pt-8">
        <div className="flex flex-1 items-center justify-center">
          <section className="w-full max-w-md pt-8 text-center sm:pt-10">
            <div className="mx-auto w-full max-w-sm">
              <div className="relative mx-auto h-[150px] w-full overflow-visible sm:h-[200px] lg:h-[224px]">
                {/* สี่เหลี่ยมโปร่งแสงหลังโลโก้แบบภาพตัวอย่าง - ขนาดปรับได้ responsive */}
                <div 
                  className="absolute left-1/2 top-1/2 z-[8] w-[calc(100vw-40px)] max-w-[385px] h-[295px] sm:w-[950px] sm:h-[400px] sm:max-w-none -translate-x-1/2 -translate-y-1/2 rounded-[20px] border border-white/10 backdrop-blur-[8px] shadow-[0_8px_32px_rgba(59,130,246,0.1),inset_0_1px_0_rgba(255,255,255,0.2)]"
                  style={{
                    background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.04) 0%, rgba(147, 197, 253, 0.06) 50%, rgba(219, 234, 254, 0.03) 100%)',
                  }}
                />
                {/* เพิ่มแสงเรืองแสง - ขนาดตามสี่เหลี่ยม responsive */}
                <div 
                  className="absolute left-1/2 top-1/2 z-[7] w-[calc(100vw-20px)] max-w-[435px] h-[315px] sm:w-[1000px] sm:h-[420px] sm:max-w-none -translate-x-1/2 -translate-y-1/2 blur-[20px]"
                  style={{
                    background: 'radial-gradient(ellipse at center, rgba(147, 197, 253, 0.4) 0%, transparent 70%)',
                  }}
                />
                <Image
                  src="/nex_logo_nobg.png"
                  alt="NEX Solution"
                  fill
                  className="pointer-events-none object-contain scale-[1.3] sm:scale-[2.1] lg:scale-[2.8] drop-shadow-[0_28px_90px_rgba(59,130,246,0.18)]"
                  style={{ zIndex: 20 }}
                  priority
                  unoptimized
                />
              </div>
            </div>

            <div className="mt-32 grid gap-4 sm:mt-36">
              {quickActions.map((item) => {
                const actionLabel = item.label?.trim() || "เมนู";
                return (
                  <a
                    key={`${actionLabel}-${item.href}`}
                    href={item.href}
                    className={`relative flex h-[72px] w-full items-center justify-center rounded-[24px] border px-6 text-center font-bold text-white transition ${
                      item.primary
                        ? "border-[#d9e1f2] bg-[#F97316] text-base shadow-[0_22px_45px_-30px_rgba(249,115,22,0.8)] hover:bg-[#EA580C]"
                        : "border-[#D9E1F2] bg-[#050579] text-base shadow-[0_24px_50px_-38px_rgba(5,5,121,0.55)] hover:bg-[#07079A]"
                    }`}
                  >
                    <span className="relative flex items-center justify-center gap-3">
                      <span className={item.primary ? "text-lg sm:text-[1.2rem]" : undefined}>
                        {actionLabel}
                      </span>
                      <ArrowRight
                        size={18}
                        className="absolute right-0 top-1/2 shrink-0 -translate-y-1/2"
                      />
                    </span>
                  </a>
                );
              })}
            </div>
          </section>
        </div>

        <footer className="pt-6 text-center text-sm leading-7 text-[#64748B]">
          © NEX Solution. All rights reserved. บริษัท คราม อินเทลลิเจนท์ เอไอ จำกัด KHRAM
          INTELLIGENT AI Co., Ltd.
        </footer>
      </div>
    </main>
  );
}
