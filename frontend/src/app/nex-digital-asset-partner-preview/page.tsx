import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import Image from 'next/image';
import Link from 'next/link';
import PreviewVideo from './PreviewVideo';
import { MarketingPageTracker } from '@/components/MarketingPageTracker';

const IMAGE_DIR = join(process.cwd(), 'public', 'nex-digital-asset-partner-preview');

function getNumericOrder(filename: string): number {
  const match = filename.match(/(\d+)/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

const REGISTER_BUTTON_AFTER = new Set([1, 6, 10, 18]);

async function getPreviewImages() {
  const files = await readdir(IMAGE_DIR);

  return files
    .filter((file) => /\.(jpg|jpeg|png|webp)$/i.test(file))
    .sort((a, b) => {
      const aNum = getNumericOrder(a);
      const bNum = getNumericOrder(b);

      if (aNum !== bNum) return aNum - bNum;
      return a.localeCompare(b);
    })
    .map((file) => ({
      order: getNumericOrder(file),
      src: `/nex-digital-asset-partner-preview/${file}`,
      alt: `NEX Digital Asset Partner preview ${file}`,
    }));
}

export default async function NexDigitalAssetPartnerPreviewPage() {
  const images = await getPreviewImages();

  return (
    <main className="bg-[#EEF0FF] pt-[15px]">
      <MarketingPageTracker pageKey="nex-digital-asset-partner-preview" />
      <div className="mx-auto w-full max-w-[680px] px-[10px] sm:px-[24px] lg:px-[40px]">
        <div className="flex flex-col gap-[15px]">
          {images.map((image) => (
            <div key={image.src} className="flex flex-col gap-[15px]">
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
              {image.order === 1 && (
                <section className="relative overflow-hidden pt-2 lg:flex lg:min-h-dvh lg:items-center lg:justify-center">
                  <div className="w-full overflow-hidden bg-black lg:w-auto">
                    <PreviewVideo
                      src="/nex-digital-asset-partner-preview/preview-video.mp4"
                      pageKey="nex-digital-asset-partner-preview"
                      videoKey="hero-preview"
                      className="block h-auto w-full lg:h-dvh lg:w-auto lg:max-w-full"
                    />
                  </div>
                </section>
              )}
              {REGISTER_BUTTON_AFTER.has(image.order) && (
                <section className="px-4 py-5">
                  <Link
                    href="/register"
                    className="mx-auto flex w-full max-w-sm items-center justify-center rounded-[22px] bg-[#F97316] px-6 py-4 text-center text-[17px] font-black text-white shadow-[0_10px_30px_rgba(249,115,22,0.32)] transition hover:scale-[1.02] hover:bg-[#EA580C]"
                  >
                    ทดลองใช้ระบบฟรี
                  </Link>
                </section>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
