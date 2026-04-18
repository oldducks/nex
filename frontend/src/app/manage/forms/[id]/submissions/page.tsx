"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Calendar,
  FileSpreadsheet,
  Loader2,
  Filter,
} from "lucide-react";
import Link from "next/link";
import ManageTopBar from "@/components/ManageTopBar";

interface FormSubmission {
  id: number;
  data: Record<string, any>;
  source?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    referrer?: string;
  };
  created_at: string;
}

export default function FormSubmissionsPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;

  const token = Cookies.get("token");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [filterText, setFilterText] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, formId]);

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/forms/${formId}/submissions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("โหลดรายการ submission ไม่สำเร็จ");
      }
      const data = await res.json();
      setSubmissions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = async () => {
    try {
      setDownloading(true);
      const res = await fetch(
        `${API_URL}/forms/${formId}/submissions/export`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (!res.ok) return;
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `form_${formId}_submissions_${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  if (!token) return null;

  const filtered = submissions.filter((s) => {
    if (!filterText.trim()) return true;
    const text = JSON.stringify(s.data || {}).toLowerCase();
    return text.includes(filterText.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <ManageTopBar
        backHref={`/manage/forms/${formId}`}
        subtitle="NEX FORMS"
        title="ข้อมูลที่ส่งมาจากฟอร์ม"
        actions={
          submissions.length > 0 ? (
            <button
              onClick={handleDownloadCsv}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#F97316] px-4 py-2 text-[11px] font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-[#F97316]/25 transition-all disabled:opacity-60"
            >
              {downloading ? <Loader2 className="animate-spin" size={14} /> : <FileSpreadsheet size={14} />}
              CSV
            </button>
          ) : null
        }
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6 md:py-10 md:space-y-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight">
              รายการข้อมูลที่ลูกค้าส่งมา
            </h2>
            <p className="text-foreground/50 text-sm">
              ใช้ดูข้อความล่าสุดจากลูกค้า และดาวน์โหลดเป็น CSV เพื่อไปวิเคราะห์ต่อ
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-auto">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={14} />
              <input
                className="w-full rounded-xl border border-foreground/10 bg-background py-2 pl-8 pr-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 md:w-[260px]"
                placeholder="ค้นหาในข้อมูลที่ลูกค้ากรอก..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 border-2 border-dashed border-foreground/10 rounded-[40px] bg-foreground/5 glass-card">
            <div className="w-20 h-20 bg-foreground/5 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileSpreadsheet size={32} className="text-foreground/10" />
            </div>
            <h3 className="text-xl font-black mb-2 tracking-tight">
              ยังไม่มีข้อมูลที่ถูกส่งมาผ่านฟอร์มนี้
            </h3>
            <p className="text-foreground/30 text-sm max-w-md mx-auto">
              แชร์หน้า Landing Page ที่ฝังฟอร์มนี้ หรือเชื่อม endpoint
              public/forms/:id/submit จากเว็บไซต์ของคุณเพื่อเริ่มเก็บข้อมูล
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="rounded-[24px] border border-foreground/5 bg-card-bg p-4 transition-all hover:border-primary/30 md:rounded-[28px] md:p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-[11px] text-foreground/40 uppercase tracking-[0.18em]">
                    <span className="font-black bg-foreground/5 px-2.5 py-1 rounded-lg">
                      #{s.id}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(s.created_at).toLocaleString("th-TH", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  {s.source && (
                    <div className="text-[10px] text-foreground/40">
                      {s.source.utm_source && (
                        <span className="mr-2">
                          utm_source:{" "}
                          <span className="font-semibold text-foreground/60">
                            {s.source.utm_source}
                          </span>
                        </span>
                      )}
                      {s.source.referrer && (
                        <span>
                          referrer:{" "}
                          <span className="font-semibold text-foreground/60">
                            {s.source.referrer}
                          </span>
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2 md:gap-4">
                  {Object.entries(s.data || {}).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-foreground/5 rounded-2xl px-4 py-3 border border-foreground/5"
                    >
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground/40 mb-1">
                        {key}
                      </div>
                      <div className="text-foreground/80 break-words">
                        {String(value)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
