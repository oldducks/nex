import React from 'react';
import Image from 'next/image';
import InlineRegisterForm from './InlineRegisterForm';

const storyboardImages = Array.from({ length: 18 }, (_, index) => {
  const frameNumber = index + 1;

  return {
    src: `/what-is-nex-preview/${frameNumber}.jpg`,
    alt: `What is NEX preview frame ${frameNumber}`,
  };
});

export default function WhatIsNexPreviewPage() {
  return (
    <main className="bg-[#EEF0FF]">
      <div className="mx-auto w-full max-w-[680px] px-0 sm:px-2">
        <div className="flex flex-col gap-0">
          {storyboardImages.map((image, index) => (
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
              {index === 0 && <InlineRegisterForm />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </main>
  );
}
