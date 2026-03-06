"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  FileText,
  Plus,
  ArrowLeft,
  Calendar,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

interface FormFieldConfig {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface FormItem {
  id: number;
  name: string;
  description?: string;
  fields: FormFieldConfig[];
  is_active: boolean;
  created_at: string;
}

export default function FormsManagePage() {
  const router = useRouter();
  const token = Cookies.get("token");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadForms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const loadForms = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/forms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("โหลดรายการฟอร์มไม่สำเร็จ");
      }
      const data = await res.json();
      setForms(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuickForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createName.trim()) return;

    try {
      setCreating(true);

      const defaultFields: FormFieldConfig[] = [
        {
          id: "name",
          type: "text",
          label: "ชื่อ-นามสกุล",
          placeholder: "กรอกชื่อ-นามสกุลของคุณ",
          required: true,
        },
        {
          id: "email",
          type: "email",
          label: "อีเมล",
          placeholder: "you@example.com",
          required: true,
        },
        {
          id: "phone",
          type: "phone",
          label: "เบอร์โทรศัพท์",
          placeholder: "08x-xxx-xxxx",
          required: true,
        },
        {
          id: "message",
          type: "textarea",
          label: "ข้อความเพิ่มเติม",
          placeholder: "เล่าให้เราฟังสั้น ๆ ว่าคุณสนใจอะไร",
          required: false,
        },
        {
          id: "pdpa_consent",
          type: "checkbox",
          label: "ฉันยินยอมให้จัดเก็บและใช้ข้อมูลตามนโยบายความเป็นส่วนตัว",
          required: true,
        },
      ];

      const res = await fetch(`${API_URL}/forms`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: createName.trim(),
          description: createDescription.trim() || undefined,
          fields: defaultFields,
          is_active: true,
        }),
      });

      if (!res.ok) {
        alert("สร้างฟอร์มไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
        return;
      }

      setCreateName("");
      setCreateDescription("");
      await loadForms();
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาดระหว่างสร้างฟอร์ม");
    } finally {
      setCreating(false);
    }
  };

  const toggleActive = async (form: FormItem) => {
    try {
      const res = await fetch(`${API_URL}/forms/${form.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !form.is_active }),
      });
      if (!res.ok) return;
      await loadForms();
    } catch (e) {
      console.error(e);
    }
  };

  const deleteForm = async (form: FormItem) => {
    if (
      !confirm(
        `คุณแน่ใจหรือไม่ว่าต้องการลบฟอร์ม "${form.name}"?\nหากมีหน้า Landing Page ที่เลือกฟอร์มนี้อยู่ ควรเปลี่ยนไปใช้ฟอร์มอื่นก่อน`,
      )
    )
      return;
    try {
      const res = await fetch(`${API_URL}/forms/${form.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return;
      await loadForms();
    } catch (e) {
      console.error(e);
    }
  };

  if (!token) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Header */}
      <header className="border-b border-foreground/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/manage/control-center"
              className="w-10 h-10 rounded-xl hover:bg-foreground/5 flex items-center justify-center transition-all group"
            >
              <ArrowLeft
                size={18}
                className="text-foreground/40 group-hover:text-foreground transition-colors"
              />
            </Link>
            <h1 className="font-bold text-xl tracking-tight flex items-center gap-2">
              <FileText size={20} className="text-primary" /> จัดการแบบฟอร์ม{" "}
              <span className="text-foreground/20 font-normal hidden sm:inline">
                (NEX Forms)
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-foreground/30 bg-foreground/5 px-3 py-1.5 rounded-lg hidden md:block">
              ทั้งหมด {forms.length} ฟอร์ม
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Create quick form */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-start">
          <div className="p-8 rounded-[32px] border border-foreground/5 bg-foreground/5/40 glass-card space-y-6">
            <h2 className="text-2xl font-black tracking-tight mb-2">
              ฟอร์มเก็บ Leads มาตรฐาน
            </h2>
            <p className="text-foreground/50 text-sm mb-4">
              สร้างฟอร์มมาตรฐานที่มีช่อง ชื่อ, อีเมล, เบอร์โทร, ข้อความ และ
              PDPA ในคลิกเดียว แล้วนำไปใช้ซ้ำได้กับหลาย Landing Page
            </p>
            <form onSubmit={handleCreateQuickForm} className="space-y-4">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">
                  ชื่อฟอร์ม
                </label>
                <input
                  className="w-full bg-background border border-foreground/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="เช่น ฟอร์มเก็บ Leads แคมเปญยิงแอด Facebook"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">
                  คำอธิบาย (ไม่บังคับ)
                </label>
                <textarea
                  className="w-full bg-background border border-foreground/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                  placeholder="ระบุว่าใช้ฟอร์มนี้กับแคมเปญไหน หรือช่องทางไหน"
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={creating || !createName.trim()}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/30 active:scale-95 transition-all"
              >
                {creating ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Plus size={16} />
                )}
                สร้างฟอร์มมาตรฐาน
              </button>
            </form>
          </div>

          <div className="p-6 rounded-[32px] border border-foreground/5 bg-foreground/5/40 glass-card text-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/40">
              วิธีใช้งานร่วมกับ Landing Page
            </h3>
            <ol className="list-decimal list-inside space-y-2 text-foreground/60">
              <li>สร้างฟอร์มจากด้านซ้ายมือ (หรือใช้ฟอร์มที่มีอยู่แล้ว)</li>
              <li>
                ไปที่หน้า <span className="font-semibold">Landing Page Editor</span>{" "}
                แล้วเพิ่มบล็อกประเภท <span className="font-semibold">ฟอร์ม</span>
              </li>
              <li>เลือกโหมด “ฟอร์มเก็บ Leads ในระบบ”</li>
              <li>เลือกฟอร์มที่ต้องการใช้จากรายการฟอร์มในระบบ</li>
            </ol>
            <p className="text-[11px] text-foreground/40">
              ในอนาคต คุณจะสามารถปรับช่องฟอร์มแต่ละช่องได้ละเอียดมากขึ้นใน
              NEX Form Builder (Phase 3)
            </p>
          </div>
        </section>

        {/* Forms list */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight">
              ฟอร์มทั้งหมดของคุณ
            </h2>
          </div>

          {forms.length === 0 ? (
            <div className="text-center py-24 border-2 border-dashed border-foreground/10 rounded-[40px] bg-foreground/5 glass-card">
              <div className="w-24 h-24 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-8">
                <FileText size={40} className="text-foreground/10" />
              </div>
              <h3 className="text-2xl font-black mb-3 tracking-tight">
                ยังไม่มีฟอร์มในระบบ
              </h3>
              <p className="text-foreground/30 max-w-sm mx-auto mb-6 font-medium">
                เริ่มสร้างฟอร์มมาตรฐานด้านบน แล้วนำไปใช้ซ้ำได้กับ Landing Page
                หลายหน้า
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {forms.map((form) => (
                <div
                  key={form.id}
                  className="group relative bg-card-bg border border-foreground/5 p-7 rounded-[32px] transition-all hover:border-primary/30 hover:-translate-y-1 shadow-xl glass-card"
                >
                  <div className="flex items-start justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-black tracking-tight group-hover:text-primary transition-colors">
                          {form.name}
                        </h3>
                        <p className="text-[11px] text-foreground/40 mt-1">
                          สร้างเมื่อ{" "}
                          {new Date(form.created_at).toLocaleDateString(
                            "th-TH",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(form)}
                        className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-all ${
                          form.is_active
                            ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                            : "border-foreground/10 text-foreground/40 bg-foreground/5 hover:bg-foreground/10"
                        }`}
                      >
                        {form.is_active ? (
                          <>
                            <ToggleRight size={16} /> เปิดอยู่
                          </>
                        ) : (
                          <>
                            <ToggleLeft size={16} /> ปิดอยู่
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => deleteForm(form)}
                        className="p-2 rounded-xl border border-foreground/10 text-foreground/30 hover:text-red-400 hover:border-red-500/40 hover:bg-red-500/5 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {form.description && (
                    <p className="text-sm text-foreground/60 mb-4 line-clamp-2">
                      {form.description}
                    </p>
                  )}

                <div className="mt-4 pt-4 border-t border-foreground/5 text-[11px] text-foreground/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar size={12} />
                      <span>
                        ช่องทั้งหมด{" "}
                        <span className="font-bold text-foreground/60">
                          {form.fields?.length || 0}
                        </span>
                      </span>
                    </div>
                    <Link
                      href={`/manage/forms/${form.id}`}
                      className="text-[11px] text-primary font-black uppercase tracking-[0.2em] hover:text-primary/80"
                    >
                      แก้ไขโครงฟอร์ม →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

