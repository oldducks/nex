"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { ArrowLeft, Loader2, Pencil, Plus, Search, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Field {
  id: number;
}

interface TemplateItem {
  id: number;
  name: string;
  slug: string;
  cover_image_url?: string;
  preview_video_url?: string;
  media_type?: "image" | "video";
  aspect_ratio: string;
  status: "draft" | "active" | "inactive";
  updated_at: string;
  category: Category | null;
  fields?: Field[];
}

export default function AdminTemplateManagerPage() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const token = Cookies.get("token");

  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [mediaType, setMediaType] = useState<"all" | "image" | "video">("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchAll = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [templateRes, categoryRes] = await Promise.all([
        fetch(`${API_URL}/admin/digital-media/templates`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/admin/digital-media/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (templateRes.ok) {
        const data = (await templateRes.json()) as TemplateItem[];
        setTemplates(data || []);
      }

      if (categoryRes.ok) {
        const data = (await categoryRes.json()) as Category[];
        setCategories(data || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return templates.filter((item) => {
      const categoryMatch = categoryId === "all" || String(item.category?.id || "") === categoryId;
      if (!categoryMatch) return false;
      const mediaMatch = mediaType === "all" || (item.media_type || "image") === mediaType;
      if (!mediaMatch) return false;
      if (!keyword) return true;
      return [item.name, item.slug, item.category?.name || ""].join(" ").toLowerCase().includes(keyword);
    });
  }, [templates, search, categoryId, mediaType]);

  const toggleStatus = async (id: number) => {
    if (!token) return;
    setActionLoading(id);
    try {
      const res = await fetch(`${API_URL}/admin/digital-media/templates/${id}/toggle`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchAll();
      }
    } finally {
      setActionLoading(null);
    }
  };

  const deleteTemplate = async (id: number) => {
    if (!token) return;
    const ok = window.confirm("ยืนยันลบเทมเพลตนี้?");
    if (!ok) return;

    setActionLoading(id);
    try {
      const res = await fetch(`${API_URL}/admin/digital-media/templates/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchAll();
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF0FF] p-4 text-[#0F172A] sm:p-6">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#64748B]">Admin Digital Media</p>
            <h1 className="text-2xl font-black text-[#050579]">Template Manager</h1>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-xl border border-[#D9E1F2] bg-white px-4 py-2.5 text-sm font-black text-[#050579] transition hover:border-[#050579]/20 hover:bg-[#F8FAFF]"
            >
              <ArrowLeft size={16} />
              กลับหน้า Dashboard
            </Link>
            <Link
              href="/admin/digital-media-v1/templates/new"
              className="inline-flex items-center gap-2 rounded-xl bg-[#F97316] px-4 py-2.5 text-sm font-black text-white transition hover:bg-[#EA580C]"
            >
              <Plus size={16} />
              สร้างเทมเพลตใหม่
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-[#D9E1F2] bg-white p-3">
          <div className="flex flex-col gap-2 md:flex-row">
            <label className="relative w-full md:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ค้นหา template"
                className="w-full rounded-xl border border-[#D9E1F2] py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#050579]/20"
              />
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="rounded-xl border border-[#D9E1F2] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#050579]/20"
            >
              <option value="all">ทุกหมวดหมู่</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>
                  {category.name}
                </option>
              ))}
            </select>
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as "all" | "image" | "video")}
              className="rounded-xl border border-[#D9E1F2] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#050579]/20"
            >
              <option value="all">ทุกชนิด</option>
              <option value="image">image</option>
              <option value="video">video</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-[#D9E1F2] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[940px]">
              <thead className="bg-[#F8FAFF]">
                <tr className="text-left text-xs uppercase text-[#64748B]">
                  <th className="px-4 py-3">ภาพ</th>
                  <th className="px-4 py-3">ชื่อ Template</th>
                  <th className="px-4 py-3">หมวดหมู่</th>
                  <th className="px-4 py-3">ชนิด</th>
                  <th className="px-4 py-3">สถานะ</th>
                  <th className="px-4 py-3">Ratio</th>
                  <th className="px-4 py-3">Fields</th>
                  <th className="px-4 py-3">อัปเดตล่าสุด</th>
                  <th className="px-4 py-3 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center">
                      <Loader2 className="mx-auto animate-spin text-[#050579]" size={22} />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-[#64748B]">
                      ไม่พบ template
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="border-t border-[#EEF0FF] text-sm">
                      <td className="px-4 py-3 align-top">
                        <div className="h-12 w-12 overflow-hidden rounded-lg border border-[#D9E1F2] bg-[#F8FAFF]">
                          {item.cover_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.cover_image_url} alt={item.name} className="h-full w-full object-cover" />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="font-bold text-[#050579]">{item.name}</p>
                        <p className="text-xs text-[#64748B]">{item.slug}</p>
                      </td>
                      <td className="px-4 py-3 align-top">{item.category?.name || "-"}</td>
                      <td className="px-4 py-3 align-top">
                        <span className={`rounded-full px-2 py-1 text-xs font-bold ${(item.media_type || "image") === "video" ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700"}`}>
                          {(item.media_type || "image").toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-bold ${
                            item.status === "active"
                              ? "bg-green-100 text-green-700"
                              : item.status === "draft"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top">{item.aspect_ratio}</td>
                      <td className="px-4 py-3 align-top">{item.fields?.length || 0}</td>
                      <td className="px-4 py-3 align-top text-xs text-[#64748B]">
                        {new Date(item.updated_at).toLocaleString("th-TH")}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/digital-media-v1/templates/${item.id}/edit`}
                            className="rounded-lg border border-[#D9E1F2] bg-white p-2 text-[#2563EB]"
                            title="แก้ไข"
                          >
                            <Pencil size={14} />
                          </Link>
                          <button
                            type="button"
                            disabled={actionLoading === item.id}
                            onClick={() => toggleStatus(item.id)}
                            className="rounded-lg border border-[#D9E1F2] bg-white p-2 text-[#475569]"
                            title="เปิด/ปิด"
                          >
                            {item.status === "active" ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          </button>
                          <button
                            type="button"
                            disabled={actionLoading === item.id}
                            onClick={() => deleteTemplate(item.id)}
                            className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-2 text-[#DC2626]"
                            title="ลบ"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
