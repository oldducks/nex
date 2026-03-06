"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  ArrowLeft,
  Calendar,
  FileSpreadsheet,
  Loader2,
  Filter,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

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
      {/* Header */}
      <header className="border-b border-foreground/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href={`/manage/forms/${formId}`}
              className="w-10 h-10 rounded-xl hover:bg-foreground/5 flex items-center justify-center transition-all group"
            >
              <ArrowLeft
                size={18}
                className="text-foreground/40 group-hover:text-foreground transition-colors"
              />
            </Link>
            <h1 className="font-bold text-xl tracking-tight flex items-center gap-2">
              <FileSpreadsheet size={20} className="text-primary" /> ข้อมูลที่ส่งมา{" "}
              <span className="text-foreground/20 font-normal hidden sm:inline">
                (Form Submissions)
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {submissions.length > 0 && (
              <button
                onClick={handleDownloadCsv}
                disabled={downloading}
                className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-foreground bg-foreground/10 px-3 py-2 rounded-xl hover:bg-foreground/20 disabled:opacity-60 transition-all"
              >
                {downloading ? (
                  <Loader2 className="animate-spin" size={14} />
                ) : (
                  <FileSpreadsheet size={14} />
                )}
                ดาวน์โหลด CSV
              </button>
            )}
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight">
              รายการข้อมูลที่ลูกค้าส่งมา
            </h2>
            <p className="text-foreground/50 text-sm">
              ใช้ดูข้อความล่าสุดจากลูกค้า และดาวน์โหลดเป็น CSV เพื่อไปวิเคราะห์ต่อ
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/30" size={14} />
              <input
                className="pl-8 pr-3 py-2 bg-background border border-foreground/10 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                className="bg-card-bg border border-foreground/5 rounded-[28px] p-6 flex flex-col gap-4 hover:border-primary/30 transition-all"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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

