"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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
const PREMIUM_PACKAGE = "premium";
const PREMIUM_PRICE = 1500;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

type SubmitResponse = {
  order?: {
    id: number;
    slip_url?: string;
  };
  notifications?: {
    emailSent?: boolean;
    lineSent?: boolean;
  };
};

export default function UpgradePlanPage() {
  const router = useRouter();
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

    setLoading(false);
  }, [router]);

  useEffect(() => {
    if (!slipFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(slipFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
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
      setErrorMessage('กรุณาเลือกไฟล์สลิปก่อนส่งข้อมูล');
      return;
    }

    setSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    setNotifySummary([]);

    try {
      const formData = new FormData();
      formData.append("package_name", PREMIUM_PACKAGE);
      formData.append("file", slipFile);

      const response = await fetch(`${API_URL}/orders/upgrade-with-slip`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF0FF] text-[#050579]">
        <Loader2 className="animate-spin" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A]">
      <ManageTopBar backHref="/manage/control" title="อัปเกรดแพ็กเกจ" subtitle="Upgrade Plan" />

      <main className="mx-auto w-full max-w-3xl px-4 py-6 md:px-6 md:py-10">
        <section className="rounded-[28px] border border-[#D9E1F2] bg-white p-5 shadow-[0_24px_60px_-42px_rgba(5,5,121,0.2)] md:p-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1E8] text-[#F97316]">
              <Crown size={24} />
            </span>
            <div>
              <h1 className="text-xl font-black tracking-tight text-[#050579] md:text-2xl">อัปเกรดแพ็กเกจ NEX Solution</h1>
              <p className="mt-2 text-sm font-semibold text-[#475569]">ชำระเงินแล้วอัปโหลดสลิปจากหน้านี้ได้ทันที</p>
              <p className="mt-1 text-lg font-black text-[#F97316]">ค่าอัปเกรด Premium Plan: {PREMIUM_PRICE.toLocaleString("th-TH")} บาท</p>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-[28px] border border-[#D9E1F2] bg-white p-5 md:p-8">
          <h2 className="text-base font-black text-[#050579] md:text-lg">ข้อมูลชำระเงิน</h2>

          <div className="mt-5 space-y-4">
            <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-3.5 md:p-4">
              <div className="flex items-center gap-2 text-xs font-black text-[#050579] md:text-sm">
                <Landmark size={16} />
                1. โอนเงินเข้าบัญชี ธ.กรุงศรีอยุธยา
              </div>
              <div className="mt-2.5 space-y-1.5 text-xs text-[#334155] md:text-sm">
                <p>เลขบัญชี: <span className="font-black text-[#050579]">{BANK_ACCOUNT}</span></p>
                <p>ชื่อบัญชี: <span className="font-black text-[#050579]">{COMPANY_NAME}</span></p>
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

            <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-3.5 md:p-4">
              <div className="flex items-center gap-2 text-xs font-black text-[#050579] md:text-sm">
                <MessageCircle size={16} />
                2. หากระบบ LINE อัตโนมัติมีปัญหา สามารถส่งซ้ำที่ LINE OA ได้
              </div>
              <p className="mt-2 text-xs text-[#334155] md:text-sm">
                ส่ง slip ที่ไลน์{" "}
                <button
                  type="button"
                  onClick={openLineChat}
                  className="text-[13px] font-black text-[#050579] underline underline-offset-2 md:text-sm"
                >
                  {LINE_ID}
                </button>
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={openLineChat}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D9E1F2] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#050579] transition-colors hover:bg-[#EEF2FF]"
                >
                  <MessageCircle size={13} />
                  เปิด LINE
                </button>
                <button
                  type="button"
                  onClick={() => copy(LINE_ID)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#D9E1F2] bg-white px-2.5 py-1.5 text-[11px] font-bold text-[#475569] transition-colors hover:bg-[#EEF2FF]"
                >
                  <Copy size={13} />
                  คัดลอก LINE ID
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-[32px] border border-[#F6D5BF] bg-white shadow-[0_28px_70px_-42px_rgba(249,115,22,0.28)]">
          <div className="bg-[linear-gradient(135deg,#FFF7ED_0%,#FFFFFF_58%,#EEF4FF_100%)] p-5 md:p-8">
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FFF1E8] text-[#F97316] shadow-[0_14px_30px_-18px_rgba(249,115,22,0.7)]">
                <Upload size={20} />
              </span>
              <div>
                <h2 className="text-xl font-black tracking-tight text-[#050579]">อัปโหลดสลิปและส่งแจ้งอัตโนมัติ</h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#475569]">
                  เมื่อกดส่ง ระบบจะสร้างคำขออัปเกรดและพยายามส่งข้อมูลสลิปเข้าอีเมลและ LINE อัตโนมัติให้ทันที
                </p>
              </div>
            </div>

            <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
              <div className="rounded-[28px] border border-[#D9E1F2] bg-white/90 p-4 shadow-[0_24px_50px_-38px_rgba(5,5,121,0.24)] backdrop-blur md:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <label htmlFor="slip-upload" className="block text-sm font-black text-[#050579]">
                      เลือกไฟล์สลิป
                    </label>
                    <p className="mt-1 text-xs text-[#64748B]">รองรับ JPG, PNG, WEBP ขนาดไม่เกิน 10MB</p>
                  </div>
                  <span className="rounded-full bg-[#FFF7ED] px-3 py-1 text-[11px] font-bold text-[#EA580C]">
                    ขั้นตอนสุดท้าย
                  </span>
                </div>

                <label
                  htmlFor="slip-upload"
                  className="mt-4 block cursor-pointer rounded-[24px] border-2 border-dashed border-[#CBD5F5] bg-[linear-gradient(180deg,#F8FAFF_0%,#EEF4FF_100%)] p-5 transition hover:border-[#F97316] hover:bg-[linear-gradient(180deg,#FFF7ED_0%,#EEF4FF_100%)]"
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#050579] shadow-[0_16px_30px_-20px_rgba(5,5,121,0.45)]">
                      <Upload size={24} />
                    </span>
                    <p className="mt-4 text-base font-black text-[#050579]">
                      {slipFile ? "เปลี่ยนไฟล์สลิป" : "แตะเพื่อเลือกไฟล์สลิป"}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[#64748B]">
                      {slipFile ? "ตรวจชื่อไฟล์ด้านล่างก่อนกดส่งได้เลย" : "แนะนำภาพคมชัด อ่านยอดและวันเวลาได้ชัดเจน"}
                    </p>
                    <span className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#050579] px-4 py-2 text-xs font-black text-white">
                      {slipFile ? "เลือกไฟล์ใหม่" : "เลือกไฟล์จากเครื่อง"}
                    </span>
                  </div>
                </label>
                <input
                  id="slip-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleFileChange}
                  className="sr-only"
                />

                <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFF] px-4 py-3">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">Selected file</p>
                    <p className="mt-1 truncate text-sm font-bold text-[#050579]">
                      {slipFile?.name || "ยังไม่ได้เลือกไฟล์"}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-white px-3 py-1 text-[11px] font-bold text-[#475569]">
                    {slipFile ? `${Math.max(1, Math.round(slipFile.size / 1024))} KB` : "No file"}
                  </span>
                </div>

                {isImageReady && previewUrl ? (
                  <div className="mt-4 overflow-hidden rounded-[24px] border border-[#D9E1F2] bg-white p-3">
                    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[20px] bg-[#F6F8FF]">
                      <Image src={previewUrl} alt="Slip preview" fill className="object-contain" unoptimized />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="min-w-0 truncate text-xs font-semibold text-[#64748B]">{slipFile?.name}</p>
                      <span className="shrink-0 rounded-full bg-[#EEF2FF] px-3 py-1 text-[11px] font-bold text-[#050579]">
                        พร้อมส่ง
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>

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
                className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-[24px] bg-[linear-gradient(135deg,#F97316_0%,#EA580C_100%)] px-5 py-3 text-sm font-black text-white shadow-[0_22px_44px_-24px_rgba(234,88,12,0.9)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
              >
                {submitting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                {submitting ? "กำลังส่งสลิป..." : "ส่งสลิปและแจ้งอัตโนมัติ"}
              </button>
            </form>
          </div>
        </section>

        <section className="mt-4 rounded-[28px] border border-[#D9E1F2] bg-white p-5 text-center md:p-8">
          <h2 className="text-base font-black text-[#050579] md:text-lg">QR Code สำหรับ LINE {LINE_ID}</h2>
          <p className="mt-2 text-xs text-[#64748B] md:text-sm">สแกนเพื่อเปิดแชทและส่งสลิปสำรองได้ทันที</p>
          <div className="mt-4 flex justify-center">
            <QrCodeImage
              url={LINE_URL}
              size={180}
              fgColor="#050579"
              bgColor="#FFFFFF"
              className="border border-[#D9E1F2]"
            />
          </div>
        </section>
      </main>
    </div>
  );
}
