import React from 'react';
import Image from 'next/image';

const storyboardImages = Array.from({ length: 18 }, (_, index) => {
  const frameNumber = index + 1;

  return {
    order: frameNumber,
    src: `/what-is-nex-preview/${frameNumber}.jpg`,
    alt: `What is NEX preview frame ${frameNumber}`,
  };
});

const REGISTER_BUTTON_AFTER = new Set([1, 7, 13, 15, 18]);

export default function WhatIsNexPreviewPage() {
  return (
    <main className="bg-[#EEF0FF]">
      <div className="mx-auto w-full max-w-[680px] px-0 sm:px-2">
        <div className="flex flex-col gap-[15px]">
          {storyboardImages.map((image) => (
            <React.Fragment key={image.src}>
              <section className="relative overflow-hidden lg:flex lg:min-h-dvh lg:items-center lg:justify-center">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={0}
                  height={0}
                  sizes="(max-width: 1024px) 100vw, 680px"
                  className="h-auto w-full lg:h-dvh lg:w-auto lg:max-w-full"
                />
              </section>
              {REGISTER_BUTTON_AFTER.has(image.order) && (
                <section className="px-4 py-5">
                  <a
                    href="/register"
                    className="mx-auto flex w-full max-w-sm items-center justify-center rounded-[22px] bg-[#F97316] px-6 py-4 text-center text-[17px] font-black text-white shadow-[0_10px_30px_rgba(249,115,22,0.32)] transition hover:scale-[1.02] hover:bg-[#EA580C]"
                  >
                    เปิดฟอร์มสมัครสมาชิก
                  </a>
                </section>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </main>
  );
}
