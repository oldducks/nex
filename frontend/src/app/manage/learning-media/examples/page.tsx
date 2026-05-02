"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import ManageTopBar from "@/components/ManageTopBar";
import { LEARNING_MEDIA_EXAMPLES } from "@/features/learning-media/example-shops";

export default function LearningMediaExamplesPage() {
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});

  const toggleDescription = (slug: string) => {
    setExpandedDescriptions((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  return (
    <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A]">
      <ManageTopBar backHref="/manage/learning-media" title="ตัวอย่างร้านค้า" subtitle="Learning Media" />

      <main className="mx-auto w-full max-w-md px-4 py-5">
        <section className="rounded-[24px] border border-[#D9E1F2] bg-white p-4 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.2)]">
          <h1 className="text-xl font-black text-[#050579]">ตัวอย่างร้านค้า</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#475569]">
            เลือกตัวอย่างธุรกิจที่ใกล้เคียงกับคุณ เพื่อใช้เป็นแนวทางวางโครงหน้าขายของตัวเอง
          </p>
        </section>

        <section className="mt-4 space-y-3">
          {LEARNING_MEDIA_EXAMPLES.map((item) => (
            <article key={item.slug} className="overflow-hidden rounded-[20px] border border-[#D9E1F2] bg-white">
              <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#F6F8FF] to-[#EEF0FF]">
                <img src={item.thumbnailUrl} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
              </div>

              <div className="p-4">
                <p className="text-xs font-semibold text-[#64748B]">{item.category}</p>
                <h2 className="mt-1 text-base font-black text-[#050579]">{item.title}</h2>
                <p
                  className={`mt-2 text-sm leading-relaxed text-[#475569] ${expandedDescriptions[item.slug] ? "" : "line-clamp-2"}`}
                >
                  {item.description}
                </p>
                {item.description.length > 50 ? (
                  <button
                    type="button"
                    onClick={() => toggleDescription(item.slug)}
                    className="mt-1 text-xs font-bold text-[#050579] underline underline-offset-2"
                  >
                    {expandedDescriptions[item.slug] ? "ย่อ" : "ดูเพิ่ม"}
                  </button>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.tags.map((tag) => (
                    <span
                      key={`${item.slug}-${tag}`}
                      className="rounded-full border border-[#D9E1F2] bg-[#F8FAFF] px-2 py-1 text-[10px] font-semibold text-[#475569]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  href={item.livePreviewUrl || `/manage/learning-media/examples/${item.slug}`}
                  target={item.livePreviewUrl ? "_blank" : undefined}
                  rel={item.livePreviewUrl ? "noopener noreferrer" : undefined}
                  className="mt-4 inline-flex items-center gap-1 rounded-xl bg-[#050579] px-3 py-2 text-xs font-bold text-white"
                >
                  ดูตัวอย่าง
                  <ArrowRight size={14} />
                </Link>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
