"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  ExternalLink,
  FileText,
  Plus,
  QrCode as QrIcon,
  Share2,
  ToggleLeft,
  ToggleRight,
  Trash2,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { Toast, type ToastType } from "@/components/Toast";
import ManageTopBar from "@/components/ManageTopBar";
import { QrCodeImage } from "@/components/QrCode";
import { QrCodeDownloadActions } from "@/components/QrCodeDownloadActions";

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
  submission_count?: number;
}

export default function FormsManagePageV2() {
  const router = useRouter();
  const token = Cookies.get("token");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nexsolution.cloud";

  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [deletingForm, setDeletingForm] = useState<FormItem | null>(null);
  const [renamingForm, setRenamingForm] = useState<FormItem | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [renameSaving, setRenameSaving] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
    isVisible: boolean;
  }>({ message: "", type: "info", isVisible: false });
  const [expandedPanel, setExpandedPanel] = useState<{ formId: number | null; type: "qr" | "share" | null }>({
    formId: null,
    type: null,
  });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type, isVisible: true });
  };

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
      showToast("โหลดฟอร์มไม่สำเร็จ", "error");
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
        showToast("สร้างฟอร์มไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", "error");
        return;
      }

      setCreateName("");
      setCreateDescription("");
      setShowCreatePanel(false);
      await loadForms();
      showToast("สร้างฟอร์มสำเร็จ", "success");
    } catch (e) {
      console.error(e);
      showToast("เกิดข้อผิดพลาดระหว่างสร้างฟอร์ม", "error");
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
      if (!res.ok) {
        showToast("อัปเดตสถานะฟอร์มไม่สำเร็จ", "error");
        return;
      }
      await loadForms();
      showToast(form.is_active ? "ปิดการใช้งานฟอร์มแล้ว" : "เปิดใช้งานฟอร์มแล้ว", "success");
    } catch (e) {
      console.error(e);
      showToast("อัปเดตสถานะฟอร์มไม่สำเร็จ", "error");
    }
  };

  const deleteForm = async (form: FormItem) => {
    try {
      const res = await fetch(`${API_URL}/forms/${form.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        showToast("ลบฟอร์มไม่สำเร็จ กรุณาลองใหม่", "error");
        return;
      }
      setDeletingForm(null);
      await loadForms();
      showToast("ลบฟอร์มสำเร็จ", "success");
    } catch (e) {
      console.error(e);
      showToast("ลบฟอร์มไม่สำเร็จ กรุณาลองใหม่", "error");
    }
  };

  const openRenameForm = (form: FormItem) => {
    setRenamingForm(form);
    setRenameValue(form.name);
  };

  const renameForm = async () => {
    if (!renamingForm || !renameValue.trim()) return;
    try {
      setRenameSaving(true);
      const res = await fetch(`${API_URL}/forms/${renamingForm.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: renameValue.trim() }),
      });
      if (!res.ok) {
        showToast("แก้ชื่อฟอร์มไม่สำเร็จ", "error");
        return;
      }
      setRenamingForm(null);
      setRenameValue("");
      await loadForms();
      showToast("แก้ชื่อฟอร์มสำเร็จ", "success");
    } catch (e) {
      console.error(e);
      showToast("แก้ชื่อฟอร์มไม่สำเร็จ", "error");
    } finally {
      setRenameSaving(false);
    }
  };

  const getPublicFormUrl = (formId: number) => `${SITE_URL}/forms/${formId}`;

  if (!token) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#F97316]" size={32} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#EEF0FF] text-[#0F172A] pb-20 font-sans">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_32%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.34),transparent_40%)]" />
      </div>

      <ManageTopBar
        backHref="/manage/control"
        subtitle="NEX FORMS"
        title="จัดการแบบฟอร์มของคุณ"
      />

      <main className="relative z-10 max-w-3xl mx-auto px-4 md:px-6 mt-6 md:mt-8">
        <div className="mb-6 md:mb-8">
          <button
            type="button"
            onClick={() => {
              setShowCreatePanel(true);
              setCreateName("");
              setCreateDescription("");
            }}
            className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#F97316] px-7 py-4 text-xl font-black text-white shadow-[0_20px_45px_-20px_rgba(249,115,22,0.85)] transition-all hover:bg-[#EA580C]"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/18 ring-1 ring-white/22">
              <Plus size={22} strokeWidth={3} />
            </span>
            <span>สร้างแบบฟอร์มใหม่</span>
          </button>
        </div>

        {showCreatePanel ? (
          <form
            onSubmit={handleCreateQuickForm}
            className="mb-6 space-y-4 rounded-3xl border border-[#D9E1F2] bg-white p-4 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.16)] md:p-5"
          >
            <div className="space-y-2">
              <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8]">ชื่อฟอร์ม</label>
              <input
                className="w-full rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                placeholder="ตั้งชื่อฟอร์มของคุณ"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8]">คำอธิบาย</label>
              <input
                className="w-full rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                placeholder="ไม่ใส่ก็ได้"
                value={createDescription}
                onChange={(e) => setCreateDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowCreatePanel(false)}
                className="flex-1 rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm font-black text-[#64748B]"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={creating || !createName.trim()}
                className="flex-[2] inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#F97316] px-5 py-3 text-sm font-black text-white transition-all hover:bg-[#EA580C] disabled:opacity-60"
              >
                {creating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                สร้างฟอร์ม
              </button>
            </div>
          </form>
        ) : null}

        <section className="rounded-3xl border border-[#D9E1F2] bg-white p-4 md:p-6 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.16)]">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">
                Your Forms
              </div>
              <h2 className="text-2xl font-black tracking-tight text-[#050579]">แบบฟอร์มทั้งหมดของคุณ</h2>
            </div>
            <div className="inline-flex items-center self-start rounded-full border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-2 text-xs font-black text-[#64748B]">
              ทั้งหมด {forms.length} ฟอร์ม
            </div>
          </div>

          {forms.length === 0 ? (
            <div className="mt-5 rounded-[28px] border border-dashed border-[#D9E1F2] bg-[#F8FAFF] px-6 py-16 text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white border border-[#E2E8F0]">
                <FileText size={34} className="text-[#CBD5E1]" />
              </div>
              <h3 className="mb-3 text-2xl font-black tracking-tight text-[#050579]">ยังไม่มีฟอร์มในระบบ</h3>
              <p className="mx-auto max-w-sm text-sm font-medium text-[#64748B]">
                เริ่มจากปุ่มสร้างใหม่ด้านบน แล้วระบบจะสร้างฟอร์มพื้นฐานให้คุณทันที
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              {forms.map((form) => {
                const shareUrl = getPublicFormUrl(form.id);
                const isQrExpanded = expandedPanel.formId === form.id && expandedPanel.type === "qr";
                const isShareExpanded = expandedPanel.formId === form.id && expandedPanel.type === "share";

                return (
                  <div key={form.id} className="overflow-hidden rounded-[28px] border border-[#C7D2E5] bg-[#F3F6FF] shadow-[0_18px_36px_-28px_rgba(15,23,42,0.14)]">
                    <div className="px-3.5 py-3.5">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 bg-[#F0FDF4] rounded-xl flex items-center justify-center text-[#16A34A] shadow-inner shrink-0">
                          <FileText size={20} strokeWidth={2.4} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <Link
                                href={`/manage/forms/${form.id}`}
                                className="line-clamp-2 text-lg font-black tracking-tight text-[#050579] hover:text-[#1D4ED8] sm:text-xl"
                              >
                                {form.name}
                              </Link>
                              <div className="mt-1 text-sm font-semibold text-[#94A3B8]">
                                <span className="inline-block whitespace-nowrap text-[11px] leading-none">
                                  {(form.submission_count ?? 0).toLocaleString("th-TH")} submissions •{" "}
                                  {new Date(form.created_at).toLocaleDateString("th-TH")}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleActive(form)}
                              className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${
                                form.is_active
                                  ? "border-[#DCFCE7] bg-[#F0FDF4] text-[#16A34A]"
                                  : "border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]"
                              }`}
                            >
                              <span className="inline-flex items-center gap-1">
                                {form.is_active ? <ToggleRight size={12} /> : <ToggleLeft size={12} />}
                                {form.is_active ? "Active" : "Draft"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 border-t border-[#DEE7F7] pt-3 space-y-1.5">
                        <Link
                          href={`/manage/forms/${form.id}`}
                          className="w-full flex items-center justify-between rounded-2xl border border-[#D1DBEF] bg-white/92 px-4 py-2.5 text-[#0F172A] transition hover:border-[#B9C9E6]"
                        >
                          <span className="text-sm font-semibold">จัดการฟอร์ม</span>
                          <ChevronDown size={16} className="rotate-[-90deg] text-[#475569]" />
                        </Link>
                        <a
                          href={shareUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full flex items-center justify-between rounded-2xl border border-[#D1DBEF] bg-white/92 px-4 py-2.5 text-[#0F172A] transition hover:border-[#B9C9E6]"
                        >
                          <span className="flex items-center gap-2 text-sm font-semibold">
                            <ExternalLink size={16} className="text-[#050579]" />
                            ดูหน้าสาธารณะ
                          </span>
                          <ChevronDown size={16} className="rotate-[-90deg] text-[#475569]" />
                        </a>
                      </div>

                      <div className="mt-2.5 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_48px] gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedPanel(isQrExpanded ? { formId: null, type: null } : { formId: form.id, type: "qr" })
                          }
                          className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                            isQrExpanded
                              ? "border-[#BCCBE8] bg-white text-[#050579]"
                              : "border-[#D1DBEF] bg-[#EEF4FF] text-[#64748B] hover:border-[#BCCBE8]"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <QrIcon size={16} />
                            QR
                          </span>
                          {isQrExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setExpandedPanel(
                              isShareExpanded ? { formId: null, type: null } : { formId: form.id, type: "share" },
                            )
                          }
                          className={`flex items-center justify-between rounded-2xl border px-3 py-3 text-sm font-semibold transition ${
                            isShareExpanded
                              ? "border-[#BCCBE8] bg-white text-[#050579]"
                              : "border-[#D1DBEF] bg-[#EEF4FF] text-[#64748B] hover:border-[#BCCBE8]"
                          }`}
                          >
                            <span className="flex items-center gap-2">
                              <Share2 size={15} />
                              แชร์
                            </span>
                            {isShareExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingForm(form)}
                          className="flex items-center justify-center rounded-2xl border border-[#F6D5BF] bg-white/92 text-red-500 transition hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {isQrExpanded ? (
                        <div className="mt-3 rounded-2xl border border-[#D1DBEF] bg-[#F7FAFF] p-4 text-center">
                          <div className="mx-auto mb-3 w-fit rounded-2xl border border-[#E2E8F0] bg-white p-3 shadow-sm">
                            <QrCodeImage url={shareUrl} size={150} />
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">สแกนเพื่อเปิดฟอร์มนี้</p>
                          <QrCodeDownloadActions
                            qrValue={shareUrl}
                            fileBaseName={`form-${form.id}`}
                            titleLine="QR Code"
                            nameLine={form.name}
                            bottomLabel="URL"
                            bottomLine={shareUrl}
                            className="mt-4"
                          />
                        </div>
                      ) : null}

                      {isShareExpanded ? (
                        <div className="mt-3 rounded-2xl border border-[#D1DBEF] bg-[#F7FAFF] px-4 py-3">
                          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
                            <Share2 size={14} />
                            <span>แชร์และข้อมูลเพิ่มเติม</span>
                          </div>
                          <p className="truncate text-sm font-semibold text-[#050579]">/forms/{form.id}</p>
                          {form.description ? (
                            <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{form.description}</p>
                          ) : null}

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <a
                              href={shareUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-2xl border border-[#D9E1F2] bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#050579]"
                            >
                              <ExternalLink size={14} />
                              เปิดหน้าฟอร์ม
                            </a>
                            <button
                              type="button"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(shareUrl);
                                  showToast("คัดลอกลิงก์แล้ว!", "success");
                                } catch {
                                  showToast("คัดลอกลิงก์ไม่สำเร็จ", "error");
                                }
                              }}
                              className="inline-flex items-center gap-2 rounded-2xl border border-[#D9E1F2] bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#050579]"
                            >
                              <Copy size={14} />
                              คัดลอกลิงก์
                            </button>
                            <button
                              type="button"
                              onClick={() => openRenameForm(form)}
                              className="inline-flex items-center gap-2 rounded-2xl border border-[#D9E1F2] bg-white px-3 py-2 text-[11px] font-black uppercase tracking-[0.14em] text-[#64748B]"
                            >
                              แก้ชื่อฟอร์ม
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {deletingForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#050579]/40 backdrop-blur-md" onClick={() => setDeletingForm(null)} />
          <div className="bg-white border border-[#FECACA] rounded-[32px] p-8 w-full max-w-md relative z-10 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626] mb-5">
              <Trash2 size={26} />
            </div>
            <h2 className="text-2xl font-black text-[#991B1B] mb-2">ยืนยันการลบฟอร์ม</h2>
            <p className="text-[#7F1D1D] text-sm leading-relaxed mb-2">คุณกำลังจะลบฟอร์มนี้:</p>
            <p className="font-bold text-[#0F172A] mb-6 break-words">{deletingForm.name}</p>
            <p className="text-[#B91C1C] text-sm font-semibold mb-8">
              หากมีหน้า Landing Page ที่เลือกฟอร์มนี้อยู่ ควรเปลี่ยนไปใช้ฟอร์มอื่นก่อน
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setDeletingForm(null)}
                className="flex-1 py-4 rounded-2xl border border-[#D9E1F2] font-black text-xs uppercase tracking-widest text-[#64748B] hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => deleteForm(deletingForm)}
                className="flex-[2] bg-[#DC2626] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md hover:bg-[#B91C1C] transition-all"
              >
                ยืนยันลบ
              </button>
            </div>
          </div>
        </div>
      )}

      {renamingForm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#050579]/40 backdrop-blur-md" onClick={() => setRenamingForm(null)} />
          <div className="bg-white border border-[#D9E1F2] rounded-[32px] p-8 w-full max-w-md relative z-10 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-[#FFF1E8] border border-[#F6D5BF] flex items-center justify-center text-[#F97316] mb-5">
              <FileText size={24} />
            </div>
            <h2 className="text-2xl font-black text-[#050579] mb-2">แก้ชื่อฟอร์ม</h2>
            <p className="text-[#64748B] text-sm mb-6 font-medium">
              เปลี่ยนชื่อฟอร์มจากหน้านี้ได้เลย โดยไม่ต้องเข้าไปหน้าแก้ไขภายใน
            </p>
            <div className="space-y-2">
              <label className="ml-1 block text-[10px] font-black uppercase tracking-[0.2em] text-[#94A3B8]">ชื่อฟอร์ม</label>
              <input
                className="w-full rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-3 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                placeholder="ตั้งชื่อฟอร์ม"
              />
            </div>
            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={() => setRenamingForm(null)}
                className="flex-1 py-4 rounded-2xl border border-[#D9E1F2] font-black text-xs uppercase tracking-widest text-[#64748B] hover:bg-gray-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={renameForm}
                disabled={renameSaving || !renameValue.trim()}
                className="flex-[2] bg-[#F97316] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md hover:bg-[#EA580C] transition-all disabled:opacity-60"
              >
                {renameSaving ? "กำลังบันทึก..." : "บันทึกชื่อ"}
              </button>
            </div>
          </div>
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
