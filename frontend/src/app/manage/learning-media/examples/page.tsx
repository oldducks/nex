"use client";

import Link from "next/link";
import Cookies from "js-cookie";
import { ArrowRight, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import ManageTopBar from "@/components/ManageTopBar";
import {
  LEARNING_MEDIA_EXAMPLES,
  mergeLearningMediaExamples,
  type LearningMediaExample,
  type LearningMediaExampleOverride,
} from "@/features/learning-media/example-shops";

type ToastState = {
  message: string;
  type: "success" | "error" | "info";
};

type MeProfile = {
  user?: {
    role?: string;
  } | null;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function LearningMediaExamplesPage() {
  const [expandedDescriptions, setExpandedDescriptions] = useState<Record<string, boolean>>({});
  const [items, setItems] = useState<LearningMediaExample[]>(LEARNING_MEDIA_EXAMPLES);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [editingItem, setEditingItem] = useState<LearningMediaExample | null>(null);
  const [formState, setFormState] = useState<LearningMediaExampleOverride>({
    title: "",
    category: "",
    description: "",
    thumbnailUrl: "",
    livePreviewUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const token = Cookies.get("token");

  const toggleDescription = (slug: string) => {
    setExpandedDescriptions((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!token) return;

    const loadData = async () => {
      try {
        const [profileRes, overridesRes] = await Promise.all([
          fetch(`${API_URL}/profile/me`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/admin/settings/learning-media/examples`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (profileRes.ok) {
          const profileData: MeProfile = await profileRes.json();
          setIsSuperAdmin(profileData.user?.role === "super_admin");
        }

        if (overridesRes.ok) {
          const data = (await overridesRes.json()) as Record<string, LearningMediaExampleOverride>;
          setItems(mergeLearningMediaExamples(data));
        }
      } catch (error) {
        console.error(error);
      }
    };

    void loadData();
  }, [token]);

  const openEditModal = (item: LearningMediaExample) => {
    setEditingItem(item);
    setFormState({
      title: item.title,
      category: item.category,
      description: item.description,
      thumbnailUrl: item.thumbnailUrl,
      livePreviewUrl: item.livePreviewUrl || "",
    });
  };

  const closeEditModal = () => {
    setEditingItem(null);
    setFormState({
      title: "",
      category: "",
      description: "",
      thumbnailUrl: "",
      livePreviewUrl: "",
    });
  };

  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingItem || !token) return;

    setSaving(true);
    try {
      const response = await fetch(
        `${API_URL}/admin/settings/learning-media/examples/${editingItem.slug}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formState),
        }
      );

      if (!response.ok) {
        throw new Error("บันทึกข้อมูลตัวอย่างไม่สำเร็จ");
      }

      const nextOverrides = (await response.json()) as Record<string, LearningMediaExampleOverride>;
      setItems(mergeLearningMediaExamples(nextOverrides));
      setToast({ message: "บันทึกตัวอย่างเรียบร้อยแล้ว", type: "success" });
      closeEditModal();
    } catch (error) {
      console.error(error);
      setToast({ message: "บันทึกข้อมูลตัวอย่างไม่สำเร็จ", type: "error" });
    } finally {
      setSaving(false);
    }
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
          {isSuperAdmin ? (
            <div className="mt-3 rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] px-3 py-2 text-xs font-bold text-[#64748B]">
              โหมดผู้ดูแล: แก้ข้อความ รูป และ URL ของตัวอย่างได้จากปุ่มดินสอในแต่ละการ์ด
            </div>
          ) : null}
        </section>

        <section className="mt-4 space-y-3">
          {items.map((item) => (
            <article key={item.slug} className="overflow-hidden rounded-[20px] border border-[#D9E1F2] bg-white">
              <div className="relative h-36 overflow-hidden bg-gradient-to-br from-[#F6F8FF] to-[#EEF0FF]">
                <img src={item.thumbnailUrl} alt={item.title} className="h-full w-full object-cover" loading="lazy" />
                {isSuperAdmin ? (
                  <button
                    type="button"
                    onClick={() => openEditModal(item)}
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#050579] shadow-sm"
                    title="แก้ไขข้อมูลตัวอย่าง"
                  >
                    <Pencil size={16} />
                  </button>
                ) : null}
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

      {editingItem ? (
        <div className="fixed inset-0 z-50 flex items-end bg-[#0F172A]/40 p-4 sm:items-center sm:justify-center">
          <div className="w-full max-w-lg rounded-[28px] border border-[#D9E1F2] bg-white p-5 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.35)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-black uppercase tracking-[0.14em] text-[#94A3B8]">Admin Edit</div>
                <h2 className="mt-1 text-lg font-black text-[#050579]">{editingItem.title}</h2>
              </div>
              <button
                type="button"
                onClick={closeEditModal}
                className="rounded-full border border-[#D9E1F2] px-3 py-1 text-xs font-bold text-[#64748B]"
              >
                ปิด
              </button>
            </div>

            <form className="mt-4 space-y-3" onSubmit={saveEdit}>
              <label className="block">
                <div className="mb-1 text-xs font-black text-[#64748B]">ชื่อ</div>
                <input
                  value={formState.title || ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-2xl border border-[#D9E1F2] px-4 py-3 text-sm outline-none"
                />
              </label>

              <label className="block">
                <div className="mb-1 text-xs font-black text-[#64748B]">หมวดหมู่</div>
                <input
                  value={formState.category || ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, category: event.target.value }))}
                  className="w-full rounded-2xl border border-[#D9E1F2] px-4 py-3 text-sm outline-none"
                />
              </label>

              <label className="block">
                <div className="mb-1 text-xs font-black text-[#64748B]">ข้อความ</div>
                <textarea
                  rows={5}
                  value={formState.description || ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, description: event.target.value }))}
                  className="w-full rounded-2xl border border-[#D9E1F2] px-4 py-3 text-sm outline-none"
                />
              </label>

              <label className="block">
                <div className="mb-1 text-xs font-black text-[#64748B]">URL รูปปก</div>
                <input
                  value={formState.thumbnailUrl || ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, thumbnailUrl: event.target.value }))}
                  className="w-full rounded-2xl border border-[#D9E1F2] px-4 py-3 text-sm outline-none"
                />
              </label>

              <label className="block">
                <div className="mb-1 text-xs font-black text-[#64748B]">URL ปลายทาง</div>
                <input
                  value={formState.livePreviewUrl || ""}
                  onChange={(event) => setFormState((prev) => ({ ...prev, livePreviewUrl: event.target.value }))}
                  className="w-full rounded-2xl border border-[#D9E1F2] px-4 py-3 text-sm outline-none"
                />
              </label>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-2xl bg-[#F97316] px-4 py-3 text-sm font-black text-white disabled:opacity-60"
              >
                {saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div className="fixed bottom-4 left-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm font-bold text-[#0F172A] shadow-[0_20px_40px_-24px_rgba(15,23,42,0.28)]">
          {toast.message}
        </div>
      ) : null}
    </div>
  );
}
