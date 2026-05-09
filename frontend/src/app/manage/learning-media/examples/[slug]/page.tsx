"use client";

import Link from "next/link";
import Cookies from "js-cookie";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";
import ManageTopBar from "@/components/ManageTopBar";
import {
  getLearningMediaExampleBySlug,
  type LearningMediaExample,
  type LearningMediaExampleOverride,
} from "@/features/learning-media/example-shops";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function LearningMediaExampleDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const token = Cookies.get("token");
  const [item, setItem] = useState<LearningMediaExample | null>(() => getLearningMediaExampleBySlug(slug) || null);

  useEffect(() => {
    if (!slug || !token) return;

    const loadOverride = async () => {
      try {
        const response = await fetch(`${API_URL}/admin/settings/learning-media/examples`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) return;
        const overrides = (await response.json()) as Record<string, LearningMediaExampleOverride>;
        setItem(getLearningMediaExampleBySlug(slug, overrides) || null);
      } catch (error) {
        console.error(error);
      }
    };

    void loadOverride();
  }, [slug, token]);

  if (!item) {
    return (
      <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A]">
        <ManageTopBar backHref="/manage/learning-media/examples" title="ไม่พบตัวอย่าง" subtitle="Learning Media" />
        <main className="mx-auto w-full max-w-md px-4 py-5">
          <section className="rounded-[24px] border border-[#D9E1F2] bg-white p-4">
            <p className="text-sm font-bold text-[#475569]">ไม่พบข้อมูลตัวอย่างนี้</p>
          </section>
        </main>
      </div>
    );
  }

  const landingPageBuilderHref = "/manage/landing-pages-v2";
  const canCreateFromExample = true;

  return (
    <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A]">
      <ManageTopBar backHref="/manage/learning-media/examples" title={item.title} subtitle="Learning Media" />

      <main className="mx-auto w-full max-w-md px-4 py-5">
        <section className="overflow-hidden rounded-[24px] border border-[#D9E1F2] bg-white shadow-[0_18px_40px_-30px_rgba(5,5,121,0.2)]">
          <div className="relative h-44 overflow-hidden bg-gradient-to-br from-[#F6F8FF] to-[#EEF0FF]">
            <img src={item.thumbnailUrl} alt={item.title} className="h-full w-full object-cover" />
          </div>

          <div className="p-4">
            <p className="text-xs font-semibold text-[#64748B]">{item.category}</p>
            <h1 className="mt-1 text-xl font-black text-[#050579]">{item.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-[#475569]">{item.description}</p>
          </div>
        </section>

        <section className="mt-4 rounded-[20px] border border-[#D9E1F2] bg-white p-4">
          <h2 className="text-base font-black text-[#050579]">เหมาะกับการใช้งานแบบไหน</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#475569]">{item.suggestedUseCase}</p>
        </section>

        <section className="mt-4 space-y-3">
          {item.contentSections.map((section) => (
            <article key={section.title} className="rounded-[20px] border border-[#D9E1F2] bg-white p-4">
              <h3 className="text-sm font-black text-[#050579]">{section.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#475569]">{section.body}</p>
            </article>
          ))}
        </section>

        <section className="mt-5 pb-6">
          {item.livePreviewUrl ? (
            <Link
              href={item.livePreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm font-bold text-[#050579]"
            >
              ดูตัวอย่างหน้าจริง
              <ExternalLink size={16} />
            </Link>
          ) : null}

          {canCreateFromExample ? (
            <Link
              href={landingPageBuilderHref}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-[#F97316] px-4 py-3 text-sm font-bold text-white"
            >
              ใช้เป็นแนวทางสร้างหน้าของฉัน
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex w-full items-center justify-center rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] px-4 py-3 text-sm font-bold text-[#64748B]"
            >
              เร็ว ๆ นี้
            </button>
          )}
        </section>
      </main>
    </div>
  );
}
