"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Check,
  Copy,
  Download,
  Eye,
  Link2,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  QrCode,
  Share2,
  Smartphone,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { QrCodeImage } from "@/components/QrCode";
import { QrCodeDownloadActions } from "@/components/QrCodeDownloadActions";
import { PublicShareModal } from "@/components/PublicProfileFooterActions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserData {
  id: number;
  email: string;
  role: string;
  subscription_tier: string;
  referral_code?: string;
}

interface ReferralStats {
  totalReferrals: number;
  directReferrals: number;
  totalCommission: number;
  pendingCommission: number;
}

interface ReferralTreeNode {
  id: number;
  level: number;
  referredUser?: {
    id: number;
    email: string;
    uid: string;
    profilePic?: string;
    fullName?: string;
    phone?: string;
    subscription_tier?: string;
  };
  commission: number | string;
  status: string;
  createdAt: string | Date;
}

interface CentralPartnerTemplate {
  landingPageId: number;
  pitch: string;
  page?: { id: number; title: string; slug: string; is_published: boolean } | null;
}

interface CentralPartnerShareSettings {
  templates: CentralPartnerTemplate[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BG = "bg-[#EEF0FF]";
const SURFACE = "bg-white border border-[#D9E1F2]";
const MUTED = "bg-[#F6F8FF] border border-[#D9E1F2]";
const NAVY = "text-[#050579]";
const SECONDARY = "text-[#475569]";
const MUTED_TEXT = "text-[#64748B]";
const CTA = "bg-[#F97316] hover:bg-[#EA580C] text-white";

// ─── Helper ───────────────────────────────────────────────────────────────────

function fmtDate(v: string | Date) {
  try {
    return new Date(v).toLocaleDateString("th-TH", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "-";
  }
}

function fmtStatus(s: string) {
  if (s === "confirmed") return "ยืนยันแล้ว";
  if (s === "paid") return "ชำระแล้ว";
  if (s === "pending") return "รอดำเนินการ";
  return s || "-";
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function ReferralsPage() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [tree, setTree] = useState<ReferralTreeNode[]>([]);
  const [templates, setTemplates] = useState<CentralPartnerTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [pitchDraft, setPitchDraft] = useState("");
  const [savingPitch, setSavingPitch] = useState(false);
  const [editingPitchId, setEditingPitchId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<"short" | number | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareTemplateId, setShareTemplateId] = useState<number | null>(null);
  const [creatingTemplate, setCreatingTemplate] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const token = isClient ? Cookies.get("token") : undefined;
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  useEffect(() => setIsClient(true), []);

  const isAdmin = user?.role === "super_admin" || user?.role === "group_admin";

  const selectedTemplate =
    templates.find((t) => t.landingPageId === selectedTemplateId) ||
    templates[0] ||
    null;

  const getUrl = (template: CentralPartnerTemplate | null, referralCode?: string) => {
    const code = referralCode || user?.referral_code;
    if (!template || !code || typeof window === "undefined") return "";
    const slug = template.page?.slug || String(template.landingPageId);
    return `${window.location.origin}/lp/${encodeURIComponent(slug)}?ref=${encodeURIComponent(code)}`;
  };

  const getShortUrl = (referralCode?: string) => {
    const code = referralCode || user?.referral_code;
    if (!code || typeof window === "undefined") return "";
    return `${window.location.origin}/r/${code}`;
  };

  const referralUrl = getUrl(selectedTemplate);
  const shortUrl = getShortUrl();
  const shareModalTemplate =
    templates.find((t) => t.landingPageId === shareTemplateId) || selectedTemplate || null;

  const loadData = useCallback(
    async (accessToken: string) => {
      setRefreshing(true);
      try {
        const reqs: Promise<Response>[] = [
          fetch(`${API}/referrals/stats`, { headers: { Authorization: `Bearer ${accessToken}` } }),
          fetch(`${API}/referrals/tree`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        ];

        const isAdminRole =
          user?.role === "super_admin" || user?.role === "group_admin";
        if (isAdminRole) {
          reqs.push(
            fetch(`${API}/admin/settings/central-partner-share`, {
              headers: { Authorization: `Bearer ${accessToken}` },
            }),
          );
        }

        const [statsRes, treeRes, shareRes] = await Promise.all(reqs);

        if (statsRes?.ok) {
          const d = (await statsRes.json()) as ReferralStats;
          setStats(d);
        }

        if (treeRes?.ok) {
          const d = (await treeRes.json()) as ReferralTreeNode[];
          setTree([...d].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        }

        if (shareRes?.ok) {
          const d = (await shareRes.json()) as CentralPartnerShareSettings;
          if (Array.isArray(d?.templates)) {
            setTemplates(d.templates);
            setSelectedTemplateId((cur) =>
              cur && d.templates.some((t) => t.landingPageId === cur)
                ? cur
                : (d.templates[0]?.landingPageId ?? null),
            );
          }
        }
      } finally {
        setRefreshing(false);
      }
    },
    [API, user?.role],
  );

  useEffect(() => {
    if (!isClient) return;
    if (!token) { router.replace("/login"); return; }

    let mounted = true;
    fetch(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d: UserData) => {
        if (!mounted) return;
        setUser(d);
        setLoading(false);
        loadData(token);
      })
      .catch(() => { if (mounted) setLoading(false); });

    return () => { mounted = false; };
  }, [isClient, token, API, router, loadData]);

  // Update pitch draft when selected template changes
  useEffect(() => {
    if (editingPitchId === null) {
      setPitchDraft(selectedTemplate?.pitch || "");
    }
  }, [selectedTemplate, editingPitchId]);

  const copy = async (type: "short" | number, text: string) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopiedId(type);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const savePitch = async (templateId: number) => {
    if (!token || !isAdmin) return;
    setSavingPitch(true);
    try {
      const res = await fetch(
        `${API}/admin/settings/central-partner-share/templates/${templateId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ pitch: pitchDraft.trim() }),
        },
      );
      if (!res.ok) throw new Error();
      const d = (await res.json()) as CentralPartnerShareSettings;
      if (Array.isArray(d.templates)) setTemplates(d.templates);
      setEditingPitchId(null);
    } catch {
      alert("บันทึกคำโปรยไม่สำเร็จ");
    } finally {
      setSavingPitch(false);
    }
  };

  const createTemplate = async () => {
    if (!token || !isAdmin) return;
    setCreatingTemplate(true);
    try {
      const res = await fetch(`${API}/admin/settings/central-partner-share/templates`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: `Salespage ส่วนกลาง ${templates.length + 1}` }),
      });
      if (!res.ok) throw new Error();
      const d = (await res.json()) as CentralPartnerShareSettings;
      if (Array.isArray(d.templates)) {
        setTemplates(d.templates);
        setSelectedTemplateId(d.templates[0]?.landingPageId ?? null);
      }
    } catch {
      alert("สร้าง Salespage ส่วนกลางไม่สำเร็จ");
    } finally {
      setCreatingTemplate(false);
    }
  };

  const deleteTemplate = async (landingPageId: number) => {
    if (!confirm("ยืนยันลบ Salespage ส่วนกลางนี้?")) return;
    setDeletingId(landingPageId);
    try {
      const res = await fetch(
        `${API}/admin/settings/central-partner-share/templates/${landingPageId}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error();
      const d = (await res.json()) as CentralPartnerShareSettings;
      if (Array.isArray(d.templates)) {
        setTemplates(d.templates);
        setSelectedTemplateId((cur) =>
          cur && d.templates.some((t) => t.landingPageId === cur)
            ? cur
            : (d.templates[0]?.landingPageId ?? null),
        );
      }
    } catch {
      alert("ลบไม่สำเร็จ");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isClient || loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${BG}`}>
        <Loader2 className="animate-spin text-[#050579]" size={36} />
      </div>
    );
  }

  if (!token) return null;

  const handleLogout = () => { Cookies.remove("token"); Cookies.remove("uid"); router.push("/"); };

  return (
    <div className={`min-h-screen ${BG} pb-16`}>
      {/* Top bar */}
      <header className={`sticky top-0 z-20 border-b ${SURFACE} px-4 py-3 flex items-center justify-between gap-3`}>
        <div>
          <p className={`text-[10px] font-semibold uppercase tracking-widest ${MUTED_TEXT}`}>Referral Program</p>
          <h1 className={`text-base font-black ${NAVY}`}>พันธมิตรธุรกิจ</h1>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className={`flex items-center gap-1.5 rounded-xl border ${MUTED} px-3 py-2 text-xs font-bold ${NAVY}`}
        >
          <LogOut size={14} />
          ออก
        </button>
      </header>

      <main className="mx-auto w-full max-w-md px-4 py-4 space-y-3">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard label="ผู้สมัครตรง" value={`${stats?.directReferrals ?? 0} คน`} />
          <StatCard label="รหัสแนะนำ" value={user?.referral_code || "---"} mono />
        </div>

        {/* ─── Short URL block (most prominent) ─────────────────────── */}
        {shortUrl ? (
          <div className={`rounded-[24px] ${SURFACE} overflow-hidden`}>
            <div className="px-4 pt-4 pb-1 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#EEF0FF]">
                <Link2 size={16} className={NAVY} />
              </span>
              <div>
                <p className={`text-xs font-black uppercase tracking-wider ${NAVY}`}>Short Link</p>
                <p className={`text-[10px] ${MUTED_TEXT}`}>ลิ้งค์สั้นสำหรับแบ่งปัน</p>
              </div>
            </div>
            <div className="px-4 pb-4 space-y-2 mt-3">
              <div className={`rounded-2xl border border-[#C7D7FF] bg-[#EEF0FF] px-4 py-3`}>
                <p className={`text-sm font-black ${NAVY} break-all tracking-wide`}>{shortUrl}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => copy("short", shortUrl)}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition ${
                    copiedId === "short" ? "bg-green-500 text-white" : CTA
                  }`}
                >
                  {copiedId === "short" ? <Check size={15} /> : <Copy size={15} />}
                  {copiedId === "short" ? "คัดลอกแล้ว!" : "คัดลอก Short Link"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ url: shortUrl, title: "ลิงก์แนะนำสมาชิก NEX" });
                    } else {
                      copy("short", shortUrl);
                    }
                  }}
                  className={`flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black ${MUTED} ${NAVY}`}
                >
                  <Share2 size={15} />
                  แชร์
                </button>
              </div>
              {referralUrl && (
                <div className="pt-1">
                  <p className={`text-[10px] font-semibold uppercase tracking-widest ${MUTED_TEXT} mb-1.5`}>Full Link (สำหรับ Salespage)</p>
                  <div className={`rounded-2xl ${MUTED} px-3 py-2 flex items-center gap-2`}>
                    <p className={`flex-1 text-[11px] break-all ${SECONDARY}`}>{referralUrl}</p>
                    <button
                      type="button"
                      onClick={() => copy(selectedTemplate?.landingPageId ?? -1, referralUrl)}
                      className="shrink-0"
                    >
                      {copiedId === selectedTemplate?.landingPageId ? (
                        <Check size={14} className="text-green-500" />
                      ) : (
                        <Copy size={14} className={MUTED_TEXT} />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}

        {/* ─── Admin: Salespage templates ─────────────────────────────── */}
        {isAdmin && (
          <div className={`rounded-[24px] ${SURFACE} overflow-hidden`}>
            <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-2 border-b border-[#EEF0FF]">
              <div>
                <p className={`text-xs font-black uppercase tracking-wider ${NAVY}`}>Salespage ส่วนกลาง</p>
                <p className={`text-[10px] ${MUTED_TEXT} mt-0.5`}>admin แก้ไขคำโปรยได้ที่นี่</p>
              </div>
              <button
                type="button"
                onClick={createTemplate}
                disabled={creatingTemplate}
                className={`flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-black transition ${CTA} disabled:opacity-60`}
              >
                {creatingTemplate ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                สร้างใหม่
              </button>
            </div>

            <div className="divide-y divide-[#EEF0FF]">
              {templates.map((tpl) => {
                const tplUrl = getUrl(tpl);
                const isSelected = tpl.landingPageId === selectedTemplateId;
                const isEditing = editingPitchId === tpl.landingPageId;

                return (
                  <div key={tpl.landingPageId} className={`p-4 space-y-3 ${isSelected ? "bg-[#FFF7ED]" : ""}`}>
                    {/* Template header */}
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedTemplateId(tpl.landingPageId)}
                        className="min-w-0 text-left"
                      >
                        <p className={`text-sm font-black ${NAVY}`}>
                          {tpl.page?.title || `Salespage #${tpl.landingPageId}`}
                        </p>
                        <p className={`text-[11px] ${MUTED_TEXT}`}>/lp/{tpl.page?.slug || tpl.landingPageId}</p>
                      </button>
                      {isSelected && (
                        <span className="rounded-full bg-[#FFF1E8] px-2.5 py-1 text-[10px] font-black text-[#C2410C] shrink-0">
                          ใช้กับ QR
                        </span>
                      )}
                    </div>

                    {/* ── Pitch / Tagline editor ── */}
                    <div className={`rounded-2xl ${MUTED} p-3 space-y-2`}>
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-[10px] font-black uppercase tracking-widest ${MUTED_TEXT}`}>
                          คำโปรย (Tagline)
                        </p>
                        {isEditing ? (
                          <button
                            type="button"
                            onClick={() => setEditingPitchId(null)}
                            className={`text-[11px] font-semibold ${MUTED_TEXT}`}
                          >
                            <X size={14} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setPitchDraft(tpl.pitch || "");
                              setEditingPitchId(tpl.landingPageId);
                            }}
                            className={`flex items-center gap-1 rounded-lg border border-[#D9E1F2] bg-white px-2.5 py-1 text-[11px] font-bold ${NAVY}`}
                          >
                            <Pencil size={11} />
                            แก้ไข
                          </button>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={pitchDraft}
                            onChange={(e) => setPitchDraft(e.target.value)}
                            rows={4}
                            maxLength={500}
                            className="w-full rounded-xl border border-[#D9E1F2] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#F97316]"
                            placeholder="ใส่คำโปรยสำหรับ Salespage นี้..."
                            autoFocus
                          />
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-[10px] ${MUTED_TEXT}`}>{pitchDraft.length}/500</span>
                            <button
                              type="button"
                              onClick={() => savePitch(tpl.landingPageId)}
                              disabled={savingPitch}
                              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-black transition ${CTA} disabled:opacity-60`}
                            >
                              {savingPitch ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                              บันทึกคำโปรย
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className={`text-sm leading-relaxed whitespace-pre-line ${tpl.pitch ? "text-[#334155]" : MUTED_TEXT}`}>
                          {tpl.pitch?.trim() || "ยังไม่ได้ตั้งคำโปรย — กด แก้ไข เพื่อเพิ่ม"}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => copy(tpl.landingPageId, tplUrl)}
                        disabled={!tplUrl}
                        className={`flex min-h-10 items-center justify-center gap-1.5 rounded-2xl text-xs font-black transition disabled:opacity-40 ${
                          copiedId === tpl.landingPageId ? "bg-green-100 text-green-700" : `${CTA}`
                        }`}
                      >
                        {copiedId === tpl.landingPageId ? <Check size={14} /> : <Copy size={14} />}
                        {copiedId === tpl.landingPageId ? "คัดลอกแล้ว" : "คัดลอก"}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShareTemplateId(tpl.landingPageId); setShowShareModal(true); }}
                        disabled={!tplUrl}
                        className={`flex min-h-10 items-center justify-center gap-1.5 rounded-2xl text-xs font-black ${MUTED} ${NAVY} disabled:opacity-40`}
                      >
                        <Share2 size={14} />
                        แชร์
                      </button>
                      <button
                        type="button"
                        onClick={() => window.open(tplUrl, "_blank")}
                        disabled={!tplUrl}
                        className={`flex min-h-10 items-center justify-center gap-1.5 rounded-2xl text-xs font-black ${MUTED} ${NAVY} disabled:opacity-40`}
                      >
                        <Eye size={14} />
                        ดูเนื้อหา
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTemplateId(tpl.landingPageId)}
                        className={`flex min-h-10 items-center justify-center gap-1.5 rounded-2xl text-xs font-black transition ${
                          isSelected
                            ? "border border-[#F97316] bg-[#FFF1E8] text-[#C2410C]"
                            : `${MUTED} ${NAVY}`
                        }`}
                      >
                        <Smartphone size={14} />
                        {isSelected ? "เลือกอยู่" : "ใช้กับ QR"}
                      </button>
                    </div>

                    {/* Edit page + Delete */}
                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => router.push(`/manage/landing-pages/${tpl.landingPageId}`)}
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-2xl border border-[#D9E1F2] bg-white py-2 text-xs font-bold ${NAVY}`}
                      >
                        <Pencil size={13} />
                        แก้ไขหน้า
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTemplate(tpl.landingPageId)}
                        disabled={deletingId === tpl.landingPageId}
                        className="flex items-center justify-center gap-1 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 disabled:opacity-60"
                      >
                        {deletingId === tpl.landingPageId ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    </div>
                  </div>
                );
              })}

              {templates.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <p className={`text-sm ${MUTED_TEXT}`}>ยังไม่มี Salespage ส่วนกลาง</p>
                  <p className={`text-xs ${MUTED_TEXT} mt-1`}>กด "สร้างใหม่" ด้านบนเพื่อเพิ่ม</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── QR Code ────────────────────────────────────────────────── */}
        {referralUrl && (
          <div className={`rounded-[24px] ${SURFACE} p-4`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF1E8]">
                <QrCode size={18} className="text-[#F97316]" />
              </span>
              <div>
                <p className={`text-xs font-black uppercase tracking-wider ${NAVY}`}>QR สำหรับแชร์</p>
                <p className={`text-[10px] ${MUTED_TEXT}`}>สแกนเพื่อไปหน้าสมัครพร้อมโค้ดของคุณ</p>
              </div>
              {refreshing && <Loader2 size={14} className="animate-spin text-[#F97316] ml-auto" />}
            </div>
            <div className="flex justify-center">
              <div className={`rounded-[24px] ${MUTED} p-3 w-fit`}>
                <div className="rounded-2xl border border-[#D9E1F2] bg-white p-3">
                  <QrCodeImage id="referral-qr-canvas" useCanvas url={referralUrl} size={180} />
                </div>
                <p className={`mt-2 text-center text-xs font-black ${NAVY}`}>{user?.referral_code}</p>
              </div>
            </div>
            <div className="mt-3">
              <QrCodeDownloadActions
                qrValue={referralUrl}
                fileBaseName={`referral-${user?.referral_code || "qr"}`}
                titleLine="QR Code"
                nameLine={user?.referral_code || "Referral QR"}
                bottomLabel="URL"
                bottomLine={referralUrl}
                buttonLabel="ดาวน์โหลด QR Code"
              />
            </div>
          </div>
        )}

        {/* ─── Member list ─────────────────────────────────────────────── */}
        <div className={`rounded-[24px] ${SURFACE} overflow-hidden`}>
          <div className="px-4 py-3 border-b border-[#EEF0FF] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={16} className={NAVY} />
              <p className={`text-xs font-black uppercase tracking-wider ${NAVY}`}>รายชื่อผู้สมัคร</p>
            </div>
            <span className={`rounded-full ${MUTED} px-2.5 py-1 text-[10px] font-bold ${MUTED_TEXT}`}>
              {tree.length} คน
            </span>
          </div>

          <div className="divide-y divide-[#F1F5F9]">
            {tree.length > 0 ? (
              tree.map((item, i) => (
                <div key={item.id} className="px-4 py-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-black ${MUTED_TEXT}`}>#{i + 1}</span>
                        <p className={`text-sm font-bold ${NAVY} truncate`}>
                          {item.referredUser?.fullName || item.referredUser?.email?.split("@")[0] || "Unknown"}
                        </p>
                      </div>
                      {item.referredUser?.phone ? (
                        <p className={`text-xs ${SECONDARY} mt-0.5`}>{item.referredUser.phone}</p>
                      ) : null}
                      {item.referredUser?.email ? (
                        <p className={`text-xs ${MUTED_TEXT} truncate`}>{item.referredUser.email}</p>
                      ) : null}
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                      item.referredUser?.subscription_tier === "premium"
                        ? "bg-[#FFF1E8] text-[#C2410C]"
                        : "bg-[#EEF0FF] text-[#050579]"
                    }`}>
                      {item.referredUser?.subscription_tier || "free"}
                    </span>
                  </div>
                  <div className="mt-2 flex gap-2 flex-wrap">
                    <span className={`rounded-lg ${MUTED} px-2 py-1 text-[10px] font-semibold ${MUTED_TEXT}`}>
                      ชั้น {item.level}
                    </span>
                    <span className={`rounded-lg ${MUTED} px-2 py-1 text-[10px] font-semibold ${MUTED_TEXT}`}>
                      {fmtStatus(item.status)}
                    </span>
                    <span className={`rounded-lg ${MUTED} px-2 py-1 text-[10px] font-semibold ${MUTED_TEXT}`}>
                      {fmtDate(item.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <Users size={32} className="mx-auto text-[#CBD5E1] mb-2" />
                <p className={`text-sm font-bold ${SECONDARY}`}>ยังไม่มีผู้สมัคร</p>
                <p className={`text-xs ${MUTED_TEXT} mt-1`}>แชร์ Short Link ด้านบนเพื่อเริ่มชวนสมาชิก</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <PublicShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        url={getUrl(shareModalTemplate)}
        title="ลิงก์แนะนำสมาชิก NEX"
        shareText={shareModalTemplate?.pitch || ""}
      />
    </div>
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function StatCard({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ${MUTED}`}>
      <p className={`text-[10px] font-semibold uppercase tracking-widest ${MUTED_TEXT}`}>{label}</p>
      <p className={`mt-1 text-lg font-black ${NAVY} ${mono ? "font-mono tracking-widest" : ""}`}>{value}</p>
    </div>
  );
}
