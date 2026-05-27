"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  CheckCircle2,
  Copy,
  Crown,
  Landmark,
  Loader2,
  MessageCircle,
  Upload,
} from "lucide-react";
import ManageTopBar from "@/components/ManageTopBar";
import { QrCodeImage } from "@/components/QrCode";

const BANK_ACCOUNT = "650-150-4213";
const COMPANY_NAME = "บจก. คราม อินเทลลิเจนท์ เอไอ";
const LINE_ID = "@001khlbm";
const LINE_URL = "https://line.me/R/ti/p/%40001khlbm";
const LINE_APP_URL = "line://ti/p/@001khlbm";

const PLANS: Record<string, { label: string; price: number; unit: string; package_name: string; badge?: string }> = {
  "premium-monthly": { label: "รายเดือน", price: 199, unit: "บาท/เดือน", package_name: "premium-monthly" },
  "premium-yearly": { label: "รายปี", price: 1500, unit: "บาท/ปี", badge: "ประหยัด 888 บาท", package_name: "premium" },
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

type SubmitResponse = {
  order?: { id: number; slip_url?: string };
  notifications?: { emailSent?: boolean; lineSent?: boolean };
};

export default function UpgradePlanPaymentPage() {
  const router = useRouter();
  const params = useParams();
  const planId = params.planId as string;
  const plan = PLANS[planId];

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [notifySummary, setNotifySummary] = useState<string[]>([]);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.replace("/login");
      return;
    }
    if (!plan) {
      router.replace("/manage/upgrade-plan");
      return;
    }
    setLoading(false);
  }, [router, plan]);

  useEffect(() => {
    if (!slipFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(slipFile);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [slipFile]);

  const isImageReady = useMemo(() => Boolean(slipFile && previewUrl), [previewUrl, slipFile]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      window.alert("คัดลอกข้อมูลเรียบร้อยแล้ว");
    } catch {
      window.alert("คัดลอกไม่สำเร็จ กรุณาลองอีกครั้ง");
    }
  };

  const openLineChat = () => {
    const isMobile = /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
    if (!isMobile) {
      window.open(LINE_URL, "_blank", "noopener,noreferrer");
      return;
    }
    window.location.href = LINE_APP_URL;
    window.setTimeout(() => {
      window.location.href = LINE_URL;
    }, 900);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setErrorMessage("");
    setSuccessMessage("");
    setNotifySummary([]);

    if (!file) {
      setSlipFile(null);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setSlipFile(null);
      setErrorMessage("อัปโหลดได้เฉพาะไฟล์ JPG, PNG หรือ WEBP เท่านั้น");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSlipFile(null);
      setErrorMessage("ไฟล์ต้องมีขนาดไม่เกิน 10MB");
      return;
    }

    setSlipFile(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const token = Cookies.get("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    if (!slipFile) {
      setErrorMessage("กรุณาเลือกไฟล์สลิปก่อนส่งข้อมูล");
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    setNotifySummary([]);

    try {
      const formData = new FormData();
      formData.append("package_name", plan.package_name);
      formData.append("file", slipFile);

      const response = await fetch(`${API_URL}/orders/upgrade-with-slip`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = (await response.json()) as SubmitResponse & { message?: string };

      if (!response.ok) {
        throw new Error(data.message || "ไม่สามารถส่งสลิปได้ กรุณาลองใหม่อีกครั้ง");
      }

      const summary: string[] = [];
      if (data.notifications?.emailSent) {
        summary.push("ส่งเข้าอีเมลแอดมินอัตโนมัติแล้ว");
      } else {
        summary.push("บันทึกคำขอแล้ว แต่ยังส่งอีเมลไม่สำเร็จ");
      }
      if (data.notifications?.lineSent) {
        summary.push("ส่งเข้า LINE อัตโนมัติแล้ว");
      } else {
        summary.push("LINE อัตโนมัติยังไม่พร้อม จึงคงปุ่มส่ง LINE แบบ manual ไว้");
      }

      setSuccessMessage(`ส่งสลิปเรียบร้อยแล้ว เลขคำขอ #${data.order?.id ?? "-"}`);
      setNotifySummary(summary);
      setSlipFile(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการส่งสลิป");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !plan) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF0FF] text-[#050579]">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A]">
      <ManageTopBar backHref="/manage/upgrade-plan" title={`เปิดใช้งานทุกระบบ ${plan.label}`} subtitle="Premium Plan" />

      <main className="mx-auto w-full max-w-md px-4 py-6 md:px-6 md:py-10">
        {/* Plan summary */}
        <section className="rounded-[28px] border-2 border-[#F97316] bg-[#FFF7ED] p-5 shadow-[0_24px_60px_-42px_rgba(5,5,121,0.15)] md:p-6">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1E8] text-[#F97316]">
              <Crown size={24} />
            </span>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-black tracking-tight text-[#050579]">
                เปิดใช้งานทุกระบบ {plan.label}
              </h2>
              {plan.badge && (
                <span className="mt-1 inline-block rounded-full bg-[#F97316] px-2.5 py-0.5 text-[10px] font-black text-white">
                  {plan.badge}
                </span>
              )}
            </div>
            <p className="shrink-0 text-right text-[#F97316]">
              <span className="text-2xl font-black">{plan.price.toLocaleString("th-TH")}</span>
              <br />
              <span className="text-xs font-bold text-[#64748B]">{plan.unit}</span>
            </p>
          </div>
        </section>

        {/* ข้อมูลชำระเงิน */}
        <section className="mt-4 rounded-[28px] border border-[#D9E1F2] bg-white p-5 shadow-[0_24px_60px_-42px_rgba(5,5,121,0.15)] md:p-6">
          <h3 className="text-base font-black text-[#050579]">ข้อมูลชำระเงิน</h3>
          <div className="mt-4 rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-3.5 md:p-4">
            <div className="flex items-center gap-2 text-xs font-black text-[#050579] md:text-sm">
              <Landmark size={16} />
              โอนเงินเข้าบัญชี ธ.กรุงศรีอยุธยา
            </div>
            <div className="mt-2.5 space-y-1.5 text-xs text-[#334155] md:text-sm">
              <p>เลขบัญชี: <span className="font-black text-[#050579]">{BANK_ACCOUNT}</span></p>
              <p>ชื่อบัญชี: <span className="font-black text-[#050579]">{COMPANY_NAME}</span></p>
              <p>ยอดโอน: <span className="font-black text-[#F97316]">{plan.price.toLocaleString("th-TH")} บาท</span></p>
            </div>
            <button
              type="button"
              onClick={() => copy(BANK_ACCOUNT)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#D9E1F2] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#475569] transition-colors hover:bg-[#EEF2FF]"
            >
              <Copy size={13} />
              คัดลอกเลขบัญชี
            </button>
          </div>
        </section>

        {/* อัปโหลดสลิป */}
        <section className="mt-4 rounded-[28px] border border-[#D9E1F2] bg-[linear-gradient(135deg,#FFF7ED_0%,#FFFFFF_58%,#EEF4FF_100%)] p-5 shadow-[0_24px_60px_-42px_rgba(5,5,121,0.15)] md:p-6">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1E8] text-[#F97316]">
              <Upload size={18} />
            </span>
            <div>
              <h3 className="text-base font-black text-[#050579]">อัปโหลดสลิปและส่งแจ้งอัตโนมัติ</h3>
              <p className="mt-1 text-xs text-[#475569]">
                เมื่อกดส่ง ระบบจะสร้างคำขอและส่งสลิปเข้าอีเมล + LINE อัตโนมัติ
              </p>
            </div>
          </div>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <label
              htmlFor="slip-upload"
              className="block cursor-pointer rounded-[20px] border-2 border-dashed border-[#CBD5F5] bg-[linear-gradient(180deg,#F8FAFF_0%,#EEF4FF_100%)] p-5 transition hover:border-[#F97316] hover:bg-[linear-gradient(180deg,#FFF7ED_0%,#EEF4FF_100%)]"
            >
              <div className="flex flex-col items-center justify-center text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#050579] shadow-[0_12px_24px_-16px_rgba(5,5,121,0.4)]">
                  <Upload size={22} />
                </span>
                <p className="mt-3 text-sm font-black text-[#050579]">
                  {slipFile ? "เปลี่ยนไฟล์สลิป" : "แตะเพื่อเลือกไฟล์สลิป"}
                </p>
                <p className="mt-1 text-xs text-[#64748B]">JPG, PNG, WEBP ไม่เกิน 10MB</p>
              </div>
            </label>
            <input
              id="slip-upload"
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="sr-only"
            />

            {slipFile && (
              <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#050579]">{slipFile.name}</p>
                  <p className="text-[11px] text-[#94A3B8]">{Math.max(1, Math.round(slipFile.size / 1024))} KB</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#EEF2FF] px-3 py-1 text-[11px] font-bold text-[#050579]">
                  พร้อมส่ง
                </span>
              </div>
            )}

            {isImageReady && previewUrl ? (
              <div className="overflow-hidden rounded-[20px] border border-[#D9E1F2] bg-white p-3">
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-[#F6F8FF]">
                  <Image src={previewUrl} alt="Slip preview" fill className="object-contain" unoptimized />
                </div>
              </div>
            ) : null}

            {errorMessage ? (
              <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm font-semibold text-[#B91C1C]">
                {errorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-2xl border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3 text-sm text-[#166534]">
                <div className="flex items-start gap-2">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-bold">{successMessage}</p>
                    {notifySummary.length ? (
                      <div className="mt-2 space-y-1 text-xs font-semibold">
                        {notifySummary.map((item) => (
                          <p key={item}>{item}</p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting || !slipFile}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[20px] bg-[linear-gradient(135deg,#F97316_0%,#EA580C_100%)] px-5 py-3 text-sm font-black text-white shadow-[0_18px_36px_-20px_rgba(234,88,12,0.8)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
            >
              {submitting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
              {submitting ? "กำลังส่งสลิป..." : "ส่งสลิปและแจ้งอัตโนมัติ"}
            </button>
          </form>
        </section>

        {/* LINE QR Code */}
        <section className="mt-4 rounded-[28px] border border-[#D9E1F2] bg-white p-5 shadow-[0_24px_60px_-42px_rgba(5,5,121,0.15)] md:p-6">
          <div className="flex flex-col items-center text-center">
            <h3 className="text-sm font-black text-[#050579]">LINE {LINE_ID}</h3>
            <p className="mt-1 text-xs text-[#64748B]">สแกนเพื่อส่งสลิปสำรอง หรือสอบถามข้อมูล</p>
            <div className="mt-3">
              <QrCodeImage
                url={LINE_URL}
                size={140}
                fgColor="#050579"
                bgColor="#FFFFFF"
                className="border border-[#D9E1F2]"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={openLineChat}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D9E1F2] bg-white px-3 py-1.5 text-[11px] font-bold text-[#050579] transition-colors hover:bg-[#EEF2FF]"
              >
                <MessageCircle size={13} />
                เปิด LINE
              </button>
              <button
                type="button"
                onClick={() => copy(LINE_ID)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#D9E1F2] bg-white px-3 py-1.5 text-[11px] font-bold text-[#475569] transition-colors hover:bg-[#EEF2FF]"
              >
                <Copy size={13} />
                คัดลอก LINE ID
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
