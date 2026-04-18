"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { QrCodeImage } from "@/components/QrCode";
import { Loader2, Upload, Calendar, Trash2, Download, ArrowLeft, ChevronDown } from "lucide-react";

interface QrFormState {
  name: string;
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
  fg_color?: string;
  bg_color?: string;
  logo_data?: string;
  created_at: string;
}

interface UserPlanData {
  subscription_tier?: string;
}

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

export default function ManageQrPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const token = Cookies.get("token");

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [form, setForm] = useState<QrFormState>({
    name: "",
    targetUrl: "",
    foregroundColor: "#000000",
    backgroundColor: "#FFFFFF",
  });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [urlFieldError, setUrlFieldError] = useState(false);
  const [showUrlToast, setShowUrlToast] = useState(false);
  const [qrList, setQrList] = useState<SavedQrItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [me, setMe] = useState<UserPlanData | null>(null);
  const [deletingQrId, setDeletingQrId] = useState<number | null>(null);
  const [showTargetHelp, setShowTargetHelp] = useState(false);
  const [previewConfig, setPreviewConfig] = useState<{
    url: string;
    fgColor: string;
    bgColor: string;
    logoDataUrl?: string;
  } | null>(null);
  const [exportConfig, setExportConfig] = useState<SavedQrItem | null>(null);

  const exampleTargets = [
    "https://facebook.com/nexsolution.cloud",
    "https://instagram.com/nexsolution.cloud",
    "https://nexsolution.cloud",
    "0895546652",
    "123-4-56789-0",
    "https://maps.google.com/?q=NEX+Solution",
  ];

  useEffect(() => {
    if (exportConfig) {
      const timer = setTimeout(() => {
        const canvas = document.getElementById("qr-export-canvas") as HTMLCanvasElement | null;
        if (canvas) {
          try {
            const outputCanvas = document.createElement("canvas");
            outputCanvas.width = 1500;
            outputCanvas.height = 1900;
            const context = outputCanvas.getContext("2d");

            if (!context) {
              throw new Error("ไม่สามารถเตรียมภาพสำหรับดาวน์โหลดได้");
            }

            context.fillStyle = "#eef2ff";
            context.fillRect(0, 0, outputCanvas.width, outputCanvas.height);

            context.save();
            context.shadowColor = "rgba(15, 23, 42, 0.16)";
            context.shadowBlur = 48;
            context.shadowOffsetY = 18;
            roundedRect(context, 90, 90, 1320, 1720, 58);
            context.fillStyle = "#ffffff";
            context.fill();
            context.restore();

            context.textAlign = "center";
            context.fillStyle = "#64748b";
            context.font = "600 42px sans-serif";
            context.fillText("QR Code", outputCanvas.width / 2, 210);

            context.fillStyle = "#0f172a";
            context.font = "700 68px sans-serif";
            context.fillText(exportConfig.name || "Untitled QR", outputCanvas.width / 2, 300);

            roundedRect(context, 210, 390, 1080, 1080, 48);
            context.fillStyle = "#f8fafc";
            context.fill();
            context.strokeStyle = "#dbe4ff";
            context.lineWidth = 6;
            context.stroke();

            context.drawImage(canvas, 300, 480, 900, 900);

            const url = outputCanvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.href = url;
            link.download = `QR_${exportConfig.name.replace(/\s+/g, "_") || exportConfig.id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (err) {
            console.error("Export failed", err);
          }
        }
        setExportConfig(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [exportConfig]);

  useEffect(() => {
    if (!showUrlToast) return;
    const timer = setTimeout(() => setShowUrlToast(false), 5000);
    return () => clearTimeout(timer);
  }, [showUrlToast]);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    setCheckingAuth(false);
    void loadQrList();
    void loadCurrentUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, token]);

  const loadQrList = async () => {
    try {
      setListLoading(true);
      const res = await fetch(`${API_URL}/qr-codes`, {
        headers: { Authorization: `Bearer ${token}` },
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

  const updateForm = (patch: Partial<QrFormState>) => {
    setForm((prev) => ({ ...prev, ...patch }));
  };

  const loadCurrentUser = async () => {
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setMe(data);
    } catch (e) {
      console.error("โหลดข้อมูลแผนผู้ใช้ไม่สำเร็จ", e);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    try {
      const reader = new FileReader();
      reader.onload = () => {
        updateForm({ logoDataUrl: reader.result as string });
        setUploadingLogo(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("Failed to read logo file", err);
      setUploadingLogo(false);
    }
  };

  const getFinalUrl = () => form.targetUrl.trim();

  const handleGeneratePreview = () => {
    const finalUrl = getFinalUrl();
    if (!finalUrl) {
      setUrlFieldError(true);
      setShowUrlToast(true);
      return;
    }
    setUrlFieldError(false);
    setError(null);
    setPreviewConfig({
      url: finalUrl,
      fgColor: form.foregroundColor,
      bgColor: form.backgroundColor,
      logoDataUrl: form.logoDataUrl,
    });
  };

  const buildFallbackQrName = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return `QR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    }
    const compact = trimmed
      .replace(/^https?:\/\//i, "")
      .replace(/^www\./i, "")
      .replace(/[?#].*$/, "")
      .slice(0, 80);
    return compact || `QR-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  };

  const getQrTypeLabel = (qrType: string) => {
    if (qrType === "external_url") return "ลิงก์ภายนอก";
    if (qrType === "landing_page") return "หน้าแลนดิ้งเพจ";
    if (qrType === "form") return "ฟอร์มเก็บลีด";
    if (qrType === "profile") return "นามบัตรดิจิทัล";
    if (qrType === "catalog") return "แคตตาล็อก";
    if (qrType === "referral") return "ระบบแนะนำ";
    return qrType;
  };

  const handleSaveQr = async () => {
    setError(null);
    setSuccess(null);
    const finalUrl = getFinalUrl();
    if (!finalUrl) {
      setUrlFieldError(true);
      setError("กรุณาระบุ URL ปลายทางก่อนบันทึก QR");
      return;
    }
    setUrlFieldError(false);
    try {
      setSaving(true);
      const resolvedName = form.name.trim() || buildFallbackQrName(finalUrl);
      const res = await fetch(`${API_URL}/qr-codes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: resolvedName,
          qr_type: "external_url",
          target_url: finalUrl,
          size: "medium",
          fg_color: form.foregroundColor,
          bg_color: form.backgroundColor,
          logo_data: form.logoDataUrl,
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
    try {
      await fetch(`${API_URL}/qr-codes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeletingQrId(null);
      setSuccess("ลบ QR สำเร็จแล้ว");
      await loadQrList();
    } catch (e) {
      console.error("ลบ QR ไม่สำเร็จ", e);
      setError("ลบ QR ไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  const handleDownloadQrImage = (qr: SavedQrItem) => {
    setExportConfig(qr);
  };

  const currentPlanLabel = me?.subscription_tier === "premium" ? "แผนพรีเมียม" : "แผนพื้นฐาน";

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF0FF] text-[#0F172A]">
        <Loader2 className="animate-spin text-[#050579]" size={32} />
      </div>
    );
  }

  return (
    <div className="qr-manage-page relative min-h-screen bg-[#EEF0FF] pb-20 text-[#0F172A]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_32%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.34),transparent_40%)]" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-[#D9E1F2] bg-white/85 backdrop-blur-md">
        <div className="relative mx-auto flex h-24 w-full max-w-md items-center px-4 md:max-w-5xl md:px-6">
          <Link
            href="/manage/control-center"
            className="group absolute left-4 flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-[#F6F8FF] md:left-6"
            title="ย้อนกลับ"
          >
            <ArrowLeft size={20} className="text-[#64748B] transition-all group-hover:text-[#050579]" />
          </Link>

          <div className="mx-auto flex min-w-0 flex-col items-center text-center">
            <div className="mb-0.5 text-[11px] font-black uppercase leading-none tracking-[0.18em] text-[#94A3B8]">
              NEX QR CODE
            </div>
            <div className="text-base font-black text-[#050579]">ปรับเปลี่ยนลิ้งเป็น QR ในแบบคุณ</div>
            <div className="mt-2 inline-flex items-center rounded-full border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-1 text-xs font-bold text-[#64748B]">
              <span className="mr-1.5 text-[#94A3B8]">แผนปัจจุบัน</span>
              <span className="text-[#050579]">{currentPlanLabel}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 pb-28 pt-6 sm:px-6 sm:pb-10 sm:pt-10">
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
          <div className="order-2 space-y-6 lg:order-1">
            <div className="rounded-[28px] border border-[#D9E1F2] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-7">
              <div className="space-y-2">
                <label className="ml-1 block text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">
                  ชื่อคิวอาร์โค้ดในระบบ (ไม่ตั้งก็ได้)
                </label>
                <input
                  className="w-full rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-3 text-sm focus:border-[#050579]/30 focus:outline-none focus:ring-2 focus:ring-[#050579]/20"
                  placeholder="ตั้งชื่อ qr code"
                  value={form.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-[#D9E1F2] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-7">
              <div className="space-y-2">
                <label className="ml-1 block text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">
                  URL ปลายทางที่จะฝังใน QR
                </label>
                <input
                  className={`w-full rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 ${
                    urlFieldError
                      ? "border border-[#DC2626] bg-[#FFF5F5] focus:border-[#DC2626] focus:ring-[#DC2626]/20"
                      : "border border-[#D9E1F2] bg-[#F6F8FF] focus:border-[#050579]/30 focus:ring-[#050579]/20"
                  }`}
                  placeholder="เช่น https://facebook.com/nexsolution หรือ 0895546652"
                  value={form.targetUrl}
                  onChange={(e) => {
                    updateForm({ targetUrl: e.target.value });
                    if (e.target.value.trim()) {
                      setUrlFieldError(false);
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowTargetHelp((prev) => !prev)}
                  className="ml-1 mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#64748B] transition-colors hover:text-[#050579]"
                >
                  {showTargetHelp ? "ซ่อนรายละเอียด" : "คลิกขยายเพื่อดูตัวอย่าง url ที่แปลง qr code ได้"}
                  <ChevronDown size={14} className={`transition-transform ${showTargetHelp ? "rotate-180" : ""}`} />
                </button>
                {showTargetHelp ? (
                  <div className="ml-1 mt-3 rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] px-4 py-3 text-xs leading-6 text-[#64748B]">
                    <div className="mb-3">
                      ใช้ได้กับ Facebook, Instagram, เว็บไซต์, เลขบัญชี, เบอร์โทร, ข้อความสั้น, LINE, Google Maps และ Wi-Fi
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {exampleTargets.map((example) => (
                        <button
                          key={example}
                          type="button"
                          onClick={() => updateForm({ targetUrl: example })}
                          className="rounded-full border border-[#D9E1F2] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#475569] transition-colors hover:border-[#050579]/30 hover:text-[#050579]"
                        >
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="rounded-[28px] border border-[#D9E1F2] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-7">
              <div className="mb-5">
                <h3 className="text-lg font-black text-[#050579] sm:text-xl">สีและโลโก้</h3>
                <p className="mt-1 text-xs leading-6 text-[#64748B] sm:text-sm">
                  ปรับสีลาย QR กับพื้นหลังให้เข้ากับงานของคุณ และเพิ่มโลโก้ตรงกลางถ้าต้องการ
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="ml-1 block text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">
                    สีลายคิวอาร์โค้ด
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.foregroundColor}
                      onChange={(e) => updateForm({ foregroundColor: e.target.value })}
                      className="h-12 w-12 cursor-pointer rounded-xl border border-[#D9E1F2] bg-transparent"
                    />
                    <input
                      className="flex-1 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-2 text-sm focus:border-[#050579]/30 focus:outline-none focus:ring-2 focus:ring-[#050579]/20"
                      value={form.foregroundColor}
                      onChange={(e) => updateForm({ foregroundColor: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="ml-1 block text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">
                    สีพื้นหลัง
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.backgroundColor}
                      onChange={(e) => updateForm({ backgroundColor: e.target.value })}
                      className="h-12 w-12 cursor-pointer rounded-xl border border-[#D9E1F2] bg-transparent"
                    />
                    <input
                      className="flex-1 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-2 text-sm focus:border-[#050579]/30 focus:outline-none focus:ring-2 focus:ring-[#050579]/20"
                      value={form.backgroundColor}
                      onChange={(e) => updateForm({ backgroundColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <label className="ml-1 block text-xs font-black uppercase tracking-[0.12em] text-[#64748B]">
                  โลโก้ตรงกลาง QR (ไม่บังคับ)
                </label>
                <div className="flex flex-wrap items-center gap-3">
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-dashed border-[#D9E1F2] px-4 py-2 text-sm text-[#475569] transition-all hover:border-[#050579]/40 hover:text-[#050579]">
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
                  {form.logoDataUrl ? (
                    <button
                      type="button"
                      onClick={() => updateForm({ logoDataUrl: undefined })}
                      className="inline-flex items-center gap-2 rounded-2xl border border-[#FECACA] px-4 py-2 text-sm font-semibold text-[#DC2626] transition-colors hover:bg-[#FEF2F2]"
                    >
                      <Trash2 size={14} />
                      ลบโลโก้
                    </button>
                  ) : null}
                </div>
              </div>
            </div>

            {(error || success) && (
              <div className="rounded-[24px] border border-[#D9E1F2] bg-white px-5 py-4 text-sm shadow-[0_18px_60px_rgba(15,23,42,0.06)]">
                {error && <p className="text-[#DC2626]">{error}</p>}
                {success && <p className="text-[#16A34A]">{success}</p>}
              </div>
            )}
          </div>

          <div className="order-1 lg:order-2 lg:sticky lg:top-6">
            <div className="rounded-[28px] border border-[#D9E1F2] bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-7">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-black text-[#050579] sm:text-xl">ตัวอย่างคิวอาร์โค้ด</h3>
                  <p className="mt-1 text-xs leading-6 text-[#64748B] sm:text-sm">
                    ลองกดดูตัวอย่างก่อนบันทึก เพื่อเช็กสีและความคมชัดบนมือถือ
                  </p>
                </div>
                <div className="rounded-full bg-[#EEF2FF] px-3 py-1 text-[11px] font-bold text-[#050579]">
                  Preview
                </div>
              </div>

              <div
                className="relative flex min-h-[320px] items-center justify-center rounded-[28px] border border-[#E2E8F0] p-4 shadow-inner sm:min-h-[360px] sm:p-6"
                style={{ backgroundColor: previewConfig?.bgColor || "#FFFFFF" }}
              >
                {previewConfig ? (
                    <QrCodeImage
                      url={previewConfig.url}
                    size={220}
                    fgColor={previewConfig.fgColor}
                    bgColor={previewConfig.bgColor}
                    logoDataUrl={previewConfig.logoDataUrl}
                  />
                ) : (
                  <div className="flex h-[220px] w-[220px] items-center justify-center rounded-[28px] border-2 border-dashed border-[#D9E1F2] px-6 text-center text-sm text-[#64748B]">
                    กดปุ่ม “generate QR code” เพื่อตรวจสอบก่อนบันทึก
                  </div>
                )}
              </div>

              <div className="mt-5 hidden gap-3 sm:flex">
                <button
                  type="button"
                  onClick={handleGeneratePreview}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#050579] px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#050579] transition-all hover:bg-[#050579]/5"
                >
                  generate QR code
                </button>
                <button
                  type="button"
                  onClick={handleSaveQr}
                  disabled={saving}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-[#F97316] px-6 py-3 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_18px_40px_rgba(249,115,22,0.45)] transition-colors hover:bg-[#EA580C] disabled:opacity-60"
                >
                  {saving ? <Loader2 className="animate-spin" size={16} /> : null}
                  บันทึก QR นี้
                </button>
              </div>
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
            <div className="rounded-2xl border border-dashed border-[#D9E1F2] bg-white px-6 py-8 text-center text-sm text-[#64748B]">
              ยังไม่มี QR ที่ถูกบันทึกไว้ ลองตั้งค่าแล้วกด “บันทึก QR นี้” ดูนะครับ
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {qrList.map((qr) => (
                <div
                  key={qr.id}
                  className="rounded-[24px] border border-[#D9E1F2] bg-white p-4 sm:p-5"
                >
                  <div className="flex gap-4">
                    <div className="shrink-0">
                      <QrCodeImage
                        url={qr.target_url}
                        size={88}
                        fgColor={qr.fg_color}
                        bgColor={qr.bg_color}
                        logoDataUrl={qr.logo_data}
                      />
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate text-sm font-semibold">{qr.name}</div>
                        <button
                          type="button"
                          onClick={() => setDeletingQrId(qr.id)}
                          className="text-[#64748B] transition-colors hover:text-[#DC2626]"
                          title="ลบ QR นี้"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] sm:text-sm">
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
                      <div className="truncate text-sm text-[#475569]">{qr.target_url}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => handleDownloadQrImage(qr)}
                      className="inline-flex items-center gap-1 rounded-xl border border-[#D9E1F2] bg-[#F6F8FF] px-2 py-1 text-xs text-[#475569] transition-all hover:border-[#050579]/40 hover:text-[#050579]"
                    >
                      <Download size={10} />
                      ดาวน์โหลดภาพ QR
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D9E1F2] bg-white/95 px-4 py-3 backdrop-blur sm:hidden">
          <div className="mx-auto flex max-w-6xl gap-3">
            <button
              type="button"
              onClick={handleGeneratePreview}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-[#050579] px-4 py-3 text-sm font-black text-[#050579] transition-colors hover:bg-[#EEF2FF]"
            >
              generate QR code
            </button>
            <button
              type="button"
              onClick={handleSaveQr}
              disabled={saving}
              className="inline-flex flex-[1.2] items-center justify-center gap-2 rounded-2xl bg-[#F97316] px-4 py-3 text-sm font-black text-white shadow-[0_18px_40px_rgba(249,115,22,0.35)] transition-colors hover:bg-[#EA580C] disabled:opacity-60"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : null}
              บันทึก QR นี้
            </button>
          </div>
        </div>

        {showUrlToast ? (
          <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4 sm:bottom-6">
            <div className="rounded-2xl bg-[#DC2626] px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(220,38,38,0.35)]">
              กรุณากรอก url ก่อน gen qr code
            </div>
          </div>
        ) : null}

        {deletingQrId !== null && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-[#050579]/40 backdrop-blur-md"
              onClick={() => setDeletingQrId(null)}
            />
            <div className="relative z-10 w-full max-w-md rounded-[32px] border border-[#FECACA] bg-white p-8 shadow-2xl">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]">
                <Trash2 size={24} />
              </div>
              <h2 className="mb-2 text-2xl font-black text-[#991B1B]">ยืนยันการลบ QR</h2>
              <p className="mb-8 text-sm font-medium leading-relaxed text-[#7F1D1D]">
                การลบนี้ไม่สามารถย้อนกลับได้ และลิงก์ดาวน์โหลดของ QR นี้จะใช้งานต่อไม่ได้
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingQrId(null)}
                  className="flex-1 rounded-2xl border border-[#D9E1F2] px-5 py-3 text-sm font-black text-[#64748B] transition-colors hover:bg-[#F8FAFF]"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteQr(deletingQrId)}
                  className="flex-1 rounded-2xl bg-[#DC2626] px-5 py-3 text-sm font-black text-white transition-colors hover:bg-[#B91C1C]"
                >
                  ยืนยันลบ
                </button>
              </div>
            </div>
          </div>
        )}

        <div
          style={{
            position: "absolute",
            left: "-9999px",
            top: "-9999px",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          {exportConfig && (
            <QrCodeImage
              id="qr-export-canvas"
              url={exportConfig.target_url}
              size={1024}
              fgColor={exportConfig.fg_color}
              bgColor={exportConfig.bg_color}
              logoDataUrl={exportConfig.logo_data}
              useCanvas={true}
            />
          )}
        </div>
      </main>
    </div>
  );
}
