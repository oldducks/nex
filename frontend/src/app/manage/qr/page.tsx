"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { QrCodeImage } from "@/components/QrCode";
import ManageTopBar from "@/components/ManageTopBar";
import {
  Loader2,
  Upload,
  Droplets,
  Link as LinkIcon,
  Globe,
  Calendar,
  Trash2,
  Download,
  Copy,
} from "lucide-react";

type QrTargetType = "landing_page" | "form" | "external_url";

interface QrFormState {
  name: string;
  targetType: QrTargetType;
  targetUrl: string;
  foregroundColor: string;
  backgroundColor: string;
  logoDataUrl?: string;
}

interface SavedQrItem {
  id: number;
  name: string;
  qr_type: string;
  target_url: string;
  size: string;
  scan_count: number;
  qr_data: string;
  created_at: string;
}

interface LandingPageOption {
  id: number;
  title: string;
  slug: string;
  is_published: boolean;
}

interface FormOption {
  id: number;
  name: string;
  is_active: boolean;
}

export default function ManageQrPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nexsolution.cloud";
  const token = Cookies.get("token");
  const [form, setForm] = useState<QrFormState>({
    name: "",
    targetType: "external_url",
    targetUrl: "",
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [qrList, setQrList] = useState<SavedQrItem[]>([]);
  const [listLoading, setListLoading] = useState(false);

  const [landingPages, setLandingPages] = useState<LandingPageOption[]>([]);
  const [forms, setForms] = useState<FormOption[]>([]);
  const [loadingTargets, setLoadingTargets] = useState(false);
  const [selectedLandingId, setSelectedLandingId] = useState<number | null>(null);
  const [selectedFormId, setSelectedFormId] = useState<number | null>(null);
  const nexPageVars = {
    "--background": "#EEF0FF",
    "--foreground": "#0F172A",
    "--primary": "#050579",
    "--glass-border": "rgba(15,23,42,0.08)",
    "--card-bg": "#FFFFFF",
  } as React.CSSProperties;

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    setCheckingAuth(false);
    loadQrList();
    loadTargets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, token]);

  const loadQrList = async () => {
    try {
      setListLoading(true);
      const res = await fetch(`${API_URL}/qr-codes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) return;
      const data = await res.json();
      setQrList(data);
    } catch (e) {
      console.error("โหลดรายการ QR ไม่สำเร็จ", e);
    } finally {
      setListLoading(false);
    }
  };

  const loadTargets = async () => {
    if (!token) return;
    try {
      setLoadingTargets(true);
      const [lpRes, formRes] = await Promise.all([
        fetch(`${API_URL}/landing-pages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_URL}/forms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (lpRes.ok) {
        const pages = await lpRes.json();
        setLandingPages(pages);
      }
      if (formRes.ok) {
        const fs = await formRes.json();
        setForms(fs);
      }
    } catch (e) {
      console.error("โหลดรายการแลนดิ้งเพจและฟอร์มไม่สำเร็จ", e);
    } finally {
      setLoadingTargets(false);
    }
  };

  const updateForm = (patch: Partial<QrFormState>) => {
    setForm((prev) => ({
      ...prev,
      ...patch,
    }));
  };

  const setTargetType = (type: QrTargetType) => {
    setError(null);
    updateForm({ targetType: type });
    if (type === "external_url") {
      setSelectedLandingId(null);
      setSelectedFormId(null);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        updateForm({ logoDataUrl: result });
        setUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Failed to read logo file", err);
      setUploadingLogo(false);
    }
  };

  const getFinalUrl = () => {
    return form.targetUrl.trim();
  };

  const getQrTypeLabel = (qrType: string) => {
    if (qrType === "external_url") return "ลิงก์ภายนอก";
    if (qrType === "landing_page") return "หน้าแลนดิ้งเพจ";
    if (qrType === "form") return "ฟอร์มเก็บลีด";
    return qrType;
  };

  const handleSaveQr = async () => {
    setError(null);
    setSuccess(null);
    if (form.targetType === "landing_page" && !selectedLandingId) {
      setError("กรุณาเลือกหน้าแลนดิ้งเพจที่ต้องการใช้กับ QR นี้");
      return;
    }
    if (form.targetType === "form" && !selectedFormId) {
      setError("กรุณาเลือกฟอร์มที่ต้องการใช้กับ QR นี้");
      return;
    }

    const finalUrl = getFinalUrl();
    if (!form.name.trim()) {
      setError("กรุณากรอกชื่อ QR เพื่อใช้อ้างอิงในระบบ");
      return;
    }
    if (!finalUrl) {
      setError("กรุณาระบุ URL ปลายทางก่อนบันทึก QR");
      return;
    }
    try {
      setSaving(true);
      const targetId =
        form.targetType === "landing_page"
          ? selectedLandingId || undefined
          : form.targetType === "form"
          ? selectedFormId || undefined
          : undefined;
      const res = await fetch(`${API_URL}/qr-codes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          qr_type: form.targetType,
          target_url: finalUrl,
          target_id: targetId,
          size: "medium",
        }),
      });
      if (!res.ok) {
        throw new Error("บันทึก QR ไม่สำเร็จ");
      }
      setSuccess("บันทึก QR สำเร็จแล้ว");
      await loadQrList();
    } catch (e: unknown) {
      console.error(e);
      const message = e instanceof Error ? e.message : "เกิดข้อผิดพลาดระหว่างบันทึก QR";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQr = async (id: number) => {
    if (!window.confirm("ต้องการลบ QR นี้หรือไม่?")) return;
    try {
      await fetch(`${API_URL}/qr-codes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      await loadQrList();
    } catch (e) {
      console.error("ลบ QR ไม่สำเร็จ", e);
    }
  };

  const handleCopyDownloadLink = async (id: number, format: "png" | "svg" = "png") => {
    try {
      const siteUrl =
        typeof window !== "undefined"
          ? window.location.origin.replace(/\/app$/, "")
          : "https://nexsolution.cloud";
      const url = `${siteUrl}/api/public/qr-codes/${id}/download?format=${format}`;
      await navigator.clipboard.writeText(url);
      setSuccess(`คัดลอกลิงก์ดาวน์โหลด QR (${format.toUpperCase()}) แล้ว`);
    } catch (e) {
      console.error("คัดลอกลิงก์ไม่สำเร็จ", e);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#050579]" size={32} />
      </div>
    );
  }

  const finalUrl = getFinalUrl();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500" style={nexPageVars}>
      <ManageTopBar
        backHref="/manage/control-center"
        subtitle="ระบบจัดการคิวอาร์โค้ด"
        title="สร้างคิวอาร์โค้ดแบบกำหนดเอง"
      />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-10 items-start">
          <div className="p-8 rounded-[32px] border border-[#D9E1F2] bg-white glass-card space-y-8">
            <div>
              <h2 className="text-2xl font-black tracking-tight mb-1 text-[#050579]">
                ตั้งค่าคิวอาร์โค้ดของคุณ
              </h2>
              <p className="text-sm text-[#475569]">
                เลือกประเภทลิงก์ สี และอัปโหลดโลโก้ เพื่อดูตัวอย่าง QR
                ก่อนนำไปใช้งานจริง
              </p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-[#64748B] uppercase tracking-[0.12em] ml-1">
                ชื่อคิวอาร์โค้ดในระบบ (เพื่อให้คุณจำได้)
              </label>
              <input
                className="w-full bg-[#F6F8FF] border border-[#D9E1F2] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050579]/20 focus:border-[#050579]/30"
                placeholder="เช่น QR หน้าโปรโมชันเดือนนี้"
                value={form.name}
                onChange={(e) => updateForm({ name: e.target.value })}
              />
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-black text-[#64748B] uppercase tracking-[0.12em] ml-1">
                ประเภทปลายทาง
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTargetType("external_url")}
                  className={`px-4 py-3 rounded-2xl text-sm border text-left flex items-center gap-3 transition-all ${
                    form.targetType === "external_url"
                      ? "border-[#050579]/40 bg-[#050579]/10 text-[#050579]"
                      : "border-[#D9E1F2] hover:border-[#050579]/30 text-[#0F172A]"
                  }`}
                >
                  <LinkIcon size={16} />
                  <div>
                    <div className="font-semibold">ลิงก์ภายนอก</div>
                    <div className="text-sm text-[#64748B] leading-snug">
                      วาง URL เอง เช่น เว็บไซต์ หรือหน้าโปรโมชัน
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType("landing_page")}
                  className={`px-4 py-3 rounded-2xl text-sm border text-left flex items-center gap-3 transition-all ${
                    form.targetType === "landing_page"
                      ? "border-[#050579]/40 bg-[#050579]/10 text-[#050579]"
                      : "border-[#D9E1F2] hover:border-[#050579]/30 text-[#0F172A]"
                  }`}
                >
                  <Globe size={16} />
                  <div>
                    <div className="font-semibold">หน้าแลนดิ้งเพจ</div>
                    <div className="text-sm text-[#64748B] leading-snug">
                      ใช้งานกับหน้าที่สร้างไว้ในระบบ
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setTargetType("form")}
                  className={`px-4 py-3 rounded-2xl text-sm border text-left flex items-center gap-3 transition-all ${
                    form.targetType === "form"
                      ? "border-[#050579]/40 bg-[#050579]/10 text-[#050579]"
                      : "border-[#D9E1F2] hover:border-[#050579]/30 text-[#0F172A]"
                  }`}
                >
                  <Droplets size={16} />
                  <div>
                    <div className="font-semibold">ฟอร์มเก็บลีด</div>
                    <div className="text-sm text-[#64748B] leading-snug">
                      ใช้งานกับฟอร์มที่สร้างไว้ในระบบ
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {form.targetType === "landing_page" && (
              <div className="space-y-2">
                <label className="block text-xs font-black text-[#64748B] uppercase tracking-[0.12em] ml-1">
                  เลือกหน้าแลนดิ้งเพจในระบบ
                </label>
                {loadingTargets ? (
                  <div className="flex items-center gap-2 text-sm text-[#475569] ml-1">
                    <Loader2 className="animate-spin" size={14} />
                    <span>กำลังโหลดรายการเพจ...</span>
                  </div>
                ) : landingPages.length === 0 ? (
                  <p className="text-sm text-[#64748B] ml-1">
                    ยังไม่มีหน้าแลนดิ้งเพจในระบบ ไปสร้างได้ที่เมนู{" "}
                    <span className="font-semibold">จัดการหน้าแลนดิ้งเพจ</span>{" "}
                    ก่อน แล้วกลับมาสร้าง QR อีกครั้ง
                  </p>
                ) : (
                  <select
                    className="w-full bg-[#F6F8FF] border border-[#D9E1F2] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#050579]/20 focus:border-[#050579]/30"
                    value={selectedLandingId ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const id = value ? Number(value) : null;
                      setSelectedLandingId(id);
                      if (id) {
                        const page = landingPages.find((p) => p.id === id);
                        if (page) {
                          updateForm({
                            targetUrl: `${SITE_URL}/lp/${page.slug}`,
                          });
                        }
                      }
                    }}
                  >
                    <option value="">-- เลือกหน้าแลนดิ้งเพจ --</option>
                    {landingPages.map((page) => (
                      <option key={page.id} value={page.id}>
                        {page.title} {page.is_published ? "" : "(ยังไม่เผยแพร่)"}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {form.targetType === "form" && (
              <div className="space-y-2">
                <label className="block text-xs font-black text-[#64748B] uppercase tracking-[0.12em] ml-1">
                  เลือกฟอร์มในระบบ
                </label>
                {loadingTargets ? (
                  <div className="flex items-center gap-2 text-sm text-[#475569] ml-1">
                    <Loader2 className="animate-spin" size={14} />
                    <span>กำลังโหลดรายการฟอร์ม...</span>
                  </div>
                ) : forms.length === 0 ? (
                  <p className="text-sm text-[#64748B] ml-1">
                    ยังไม่มีฟอร์มในระบบ ไปสร้างได้ที่เมนู{" "}
                    <span className="font-semibold">จัดการแบบฟอร์ม</span> ก่อน
                    แล้วกลับมาสร้าง QR อีกครั้ง
                  </p>
                ) : (
                  <select
                    className="w-full bg-[#F6F8FF] border border-[#D9E1F2] rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#050579]/20 focus:border-[#050579]/30"
                    value={selectedFormId ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const id = value ? Number(value) : null;
                      setSelectedFormId(id);
                      if (id) {
                        updateForm({
                          targetUrl: `${SITE_URL}/forms/${id}`,
                        });
                      }
                    }}
                  >
                    <option value="">-- เลือกฟอร์มที่ต้องการ --</option>
                    {forms.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} {f.is_active ? "" : "(ปิดการใช้งานอยู่)"}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-black text-[#64748B] uppercase tracking-[0.12em] ml-1">
                URL ปลายทางที่จะฝังใน QR
              </label>
              <input
                className="w-full bg-[#F6F8FF] border border-[#D9E1F2] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#050579]/20 focus:border-[#050579]/30"
                placeholder="เช่น https://nexsolution.cloud/lp/your-campaign"
                value={form.targetUrl}
                onChange={(e) => updateForm({ targetUrl: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-xs font-black text-[#64748B] uppercase tracking-[0.12em] ml-1">
                  สีลายคิวอาร์โค้ด
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.foregroundColor}
                    onChange={(e) =>
                      updateForm({ foregroundColor: e.target.value })
                    }
                    className="w-12 h-10 rounded-xl border border-[#D9E1F2] bg-transparent cursor-pointer"
                  />
                  <input
                    className="flex-1 bg-[#F6F8FF] border border-[#D9E1F2] rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#050579]/20 focus:border-[#050579]/30"
                    value={form.foregroundColor}
                    onChange={(e) =>
                      updateForm({ foregroundColor: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-xs font-black text-[#64748B] uppercase tracking-[0.12em] ml-1">
                  สีพื้นหลัง
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.backgroundColor}
                    onChange={(e) =>
                      updateForm({ backgroundColor: e.target.value })
                    }
                    className="w-12 h-10 rounded-xl border border-[#D9E1F2] bg-transparent cursor-pointer"
                  />
                  <input
                    className="flex-1 bg-[#F6F8FF] border border-[#D9E1F2] rounded-2xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#050579]/20 focus:border-[#050579]/30"
                    value={form.backgroundColor}
                    onChange={(e) =>
                      updateForm({ backgroundColor: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-[#64748B] uppercase tracking-[0.12em] ml-1">
                โลโก้ตรงกลาง QR (ไม่บังคับ)
              </label>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl border border-dashed border-[#D9E1F2] text-sm text-[#475569] cursor-pointer hover:border-[#050579]/40 hover:text-[#050579] transition-all">
                  <Upload size={14} />
                  {uploadingLogo
                    ? "กำลังอัปโหลด..."
                    : form.logoDataUrl
                    ? "เปลี่ยนโลโก้"
                    : "อัปโหลดโลโก้ (PNG โปร่งใสจะดีที่สุด)"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                  />
                </label>
              </div>
            </div>

            {(error || success) && (
              <div className="text-sm mt-2 ml-1">
                {error && <p className="text-[#DC2626]">{error}</p>}
                {success && <p className="text-[#16A34A]">{success}</p>}
              </div>
            )}

            <div className="pt-4">
              <button
                type="button"
                onClick={handleSaveQr}
                disabled={saving}
                className="inline-flex items-center gap-2 bg-[#F97316] hover:bg-[#EA580C] disabled:opacity-60 text-white px-6 py-2.5 rounded-2xl font-black text-sm uppercase tracking-[0.12em] shadow-[0_18px_40px_-26px_rgba(249,115,22,0.55)] active:scale-95 transition-colors"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : null}
                บันทึก QR นี้
              </button>
            </div>
          </div>

          <div className="p-8 rounded-[32px] border border-[#D9E1F2] bg-white glass-card flex flex-col items-center gap-6">
            <h3 className="text-base font-black uppercase tracking-[0.12em] text-[#64748B]">
              ตัวอย่างคิวอาร์โค้ด
            </h3>

            <div
              className="relative inline-flex items-center justify-center rounded-3xl p-4 shadow-2xl"
              style={{ backgroundColor: form.backgroundColor || "#FFFFFF" }}
            >
              {finalUrl ? (
                <QrCodeImage url={finalUrl} size={220} />
              ) : (
                <div className="w-[220px] h-[220px] rounded-2xl border-2 border-dashed border-[#D9E1F2] flex items-center justify-center text-sm text-[#64748B] text-center px-6">
                  วาง URL ปลายทางเพื่อดูตัวอย่าง QR ที่นี่
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black uppercase tracking-[0.12em] text-[#64748B]">
              รายการ QR ที่บันทึกไว้
            </h2>
          </div>
          {listLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="animate-spin text-primary" size={24} />
            </div>
          ) : qrList.length === 0 ? (
            <div className="border border-dashed border-[#D9E1F2] rounded-2xl py-8 px-6 text-center text-sm text-[#64748B] bg-white">
              ยังไม่มี QR ที่ถูกบันทึกไว้ ลองตั้งค่าแล้วกด “บันทึก QR นี้” ดูนะครับ
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {qrList.map((qr) => (
                <div
                  key={qr.id}
                  className="border border-[#D9E1F2] rounded-2xl p-4 flex gap-4 items-center bg-white"
                >
                  <div className="hidden sm:block">
                    <QrCodeImage url={qr.target_url} size={96} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-semibold text-sm truncate">
                        {qr.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteQr(qr.id)}
                        className="text-[#64748B] hover:text-[#DC2626] transition-colors"
                        title="ลบ QR นี้"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="text-sm text-[#64748B] flex items-center gap-2">
                      <span className="tracking-[0.08em]">{getQrTypeLabel(qr.qr_type)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={10} />
                        {new Date(qr.created_at).toLocaleDateString("th-TH", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span>•</span>
                      <span>สแกน {qr.scan_count} ครั้ง</span>
                    </div>
                    <div className="text-sm text-[#475569] truncate">
                      {qr.target_url}
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleCopyDownloadLink(qr.id, "png")}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-xl border border-[#D9E1F2] text-xs text-[#475569] hover:border-[#050579]/40 hover:text-[#050579] transition-all"
                      >
                        <Copy size={10} />
                        คัดลอกลิงก์ PNG
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCopyDownloadLink(qr.id, "svg")}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-xl border border-[#D9E1F2] text-xs text-[#475569] hover:border-[#050579]/40 hover:text-[#050579] transition-all"
                      >
                        <Copy size={10} />
                        คัดลอกลิงก์ SVG
                      </button>
                      <a
                        href={`/api/public/qr-codes/${qr.id}/download?inline=1&format=png`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-xl border border-[#D9E1F2] text-xs text-[#475569] hover:border-[#050579]/40 hover:text-[#050579] transition-all"
                      >
                        <Download size={10} />
                        เปิดดูภาพ QR
                      </a>
                    </div>
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
