"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Image as ImageIcon,
  Loader2,
  Package,
  Plus,
  Search,
  Share2,
  Trash2,
  Upload,
} from "lucide-react";
import { QrCodeImage } from "@/components/QrCode";
import { QrCodeDownloadActions } from "@/components/QrCodeDownloadActions";
import { Toast, type ToastType } from "@/components/Toast";

interface Catalog {
  id: number;
  title: string;
  description: string;
  pdf_url?: string;
  layout_config?: {
    brand_logo?: string;
    catalog_mode?: string;
    [key: string]: unknown;
  } | null;
  created_at: string;
  products: Array<{
    id: number;
    name?: string;
    images_json?: string[];
  }>;
}

interface MeProfile {
  subscription_tier?: string;
  feature_config?: Record<string, boolean>;
  user?: {
    role?: string;
  } | null;
}

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LineIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

const formatCatalogDate = (value: string) => new Date(value).toLocaleDateString("th-TH");

export default function CatalogManageV3Page() {
  const router = useRouter();
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [currentPlanLabel, setCurrentPlanLabel] = useState("แผนพื้นฐาน");
  const [expandedPanel, setExpandedPanel] = useState<{ catalogId: number | null; type: "share" | null }>({
    catalogId: null,
    type: null,
  });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newCatalog, setNewCatalog] = useState({ title: "", description: "", brand_logo: "" });
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
  const [editCatalog, setEditCatalog] = useState({ title: "", description: "", brand_logo: "" });
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [deletingCatalog, setDeletingCatalog] = useState<Catalog | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [uploadingLogoTarget, setUploadingLogoTarget] = useState<"create" | "edit" | null>(null);
  const createLogoInputRef = useRef<HTMLInputElement | null>(null);
  const editLogoInputRef = useRef<HTMLInputElement | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: "",
    type: "info",
    isVisible: false,
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasUnlimitedCatalogs, setHasUnlimitedCatalogs] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nexsolution.cloud";
  const token = Cookies.get("token");

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type, isVisible: true });
  };

  const resolvePlanLabel = (tier?: string) => {
    if (tier === "premium") return "แผนพรีเมียม";
    return "แผนพื้นฐาน";
  };

  const openCreateCatalogModal = () => {
    if (!isAdmin && !hasUnlimitedCatalogs && catalogs.length >= 1) {
      showToast("ต้องการสร้างเพิ่มกรุณาติดต่อแอดมิน", "error");
      return;
    }

    setShowModal(true);
  };

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    void fetchCatalogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const getImageUrl = (url: string | undefined) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads")) return `${API_URL}${url}`;
    return url;
  };

  const getCatalogUrl = (catalogId: number) => `${SITE_URL}/catalog/${catalogId}`;

  const filteredCatalogs = useMemo(
    () =>
      catalogs.filter(
        (catalog) =>
          catalog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          catalog.description?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [catalogs, searchQuery],
  );

  const getCatalogCardImage = (catalog: Catalog) => {
    const firstProductImage = catalog.products?.find((product) => product.images_json?.[0])?.images_json?.[0];
    if (firstProductImage) return getImageUrl(firstProductImage);
    if (catalog.layout_config?.brand_logo) return getImageUrl(catalog.layout_config.brand_logo);
    return "";
  };

  const uploadLogoImage = async (file: File, target: "create" | "edit") => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast("รองรับเฉพาะไฟล์รูปภาพ jpg, png, gif, webp", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("ไฟล์มีขนาดเกิน 5MB", "error");
      return;
    }

    setUploadingLogoTarget(target);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("อัปโหลดโลโก้ไม่สำเร็จ");

      const data = await res.json();
      let imageUrl = data.url as string | undefined;

      if (data.jobId) {
        imageUrl = await new Promise<string>((resolve, reject) => {
          const started = Date.now();
          const interval = setInterval(async () => {
            try {
              const jobRes = await fetch(`${API_URL}/uploads/job/${data.jobId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!jobRes.ok) return;
              const status = await jobRes.json();
              if (status.state === "completed" && status.result?.url) {
                clearInterval(interval);
                resolve(status.result.url);
                return;
              }
              if (status.state === "failed") {
                clearInterval(interval);
                reject(new Error(status.failedReason || "ประมวลผลรูปโลโก้ไม่สำเร็จ"));
                return;
              }
              if (Date.now() - started > 60_000) {
                clearInterval(interval);
                reject(new Error("อัปโหลดโลโก้ใช้เวลานานเกินไป กรุณาลองใหม่"));
              }
            } catch {
              // keep polling
            }
          }, 1000);
        });
      }

      if (!imageUrl) throw new Error("ไม่พบ URL รูปหลังอัปโหลด");

      if (target === "create") {
        setNewCatalog((prev) => ({ ...prev, brand_logo: imageUrl || "" }));
      } else {
        setEditCatalog((prev) => ({ ...prev, brand_logo: imageUrl || "" }));
      }
      showToast("อัปโหลดโลโก้สำเร็จ", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "อัปโหลดโลโก้ไม่สำเร็จ";
      showToast(message, "error");
    } finally {
      setUploadingLogoTarget(null);
      if (target === "create" && createLogoInputRef.current) createLogoInputRef.current.value = "";
      if (target === "edit" && editLogoInputRef.current) editLogoInputRef.current.value = "";
    }
  };

  const fetchCatalogs = async () => {
    try {
      const profileRes = await fetch(`${API_URL}/profile/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (profileRes.ok) {
        const profileData: MeProfile = await profileRes.json();
        setCurrentPlanLabel(resolvePlanLabel(profileData.subscription_tier));
        setIsAdmin(
          profileData.user?.role === "super_admin" || profileData.user?.role === "group_admin",
        );
        setHasUnlimitedCatalogs(profileData.feature_config?.unlimited_catalogs === true);
      }

      const res = await fetch(`${API_URL}/catalogs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCatalogs(await res.json());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin && !hasUnlimitedCatalogs && catalogs.length >= 1) {
      showToast("ต้องการสร้างเพิ่มกรุณาติดต่อแอดมิน", "error");
      setShowModal(false);
      return;
    }

    try {
      const payload: Record<string, unknown> = {
        title: newCatalog.title,
        description: newCatalog.description,
      };
      if (newCatalog.brand_logo) payload.layout_config = { brand_logo: newCatalog.brand_logo };

      const res = await fetch(`${API_URL}/catalogs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        setNewCatalog({ title: "", description: "", brand_logo: "" });
        void fetchCatalogs();
      } else {
        const errorData = await res.json().catch(() => null);
        showToast(errorData?.message || "ต้องการสร้างเพิ่มกรุณาติดต่อแอดมิน", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("สร้างแคตตาล็อกไม่สำเร็จ กรุณาลองใหม่", "error");
    }
  };

  const closeEditModal = () => {
    setEditingCatalog(null);
    setEditCatalog({ title: "", description: "", brand_logo: "" });
  };

  const updateCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCatalog) return;
    try {
      const nextLayoutConfig: Record<string, unknown> = {
        ...(editingCatalog.layout_config || {}),
      };
      if (editCatalog.brand_logo) nextLayoutConfig.brand_logo = editCatalog.brand_logo;
      else delete nextLayoutConfig.brand_logo;

      const res = await fetch(`${API_URL}/catalogs/${editingCatalog.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editCatalog.title,
          description: editCatalog.description,
          layout_config: nextLayoutConfig,
        }),
      });
      if (res.ok) {
        closeEditModal();
        void fetchCatalogs();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const openDeleteModal = (catalog: Catalog) => {
    setDeletingCatalog(catalog);
  };

  const closeDeleteModal = () => {
    if (!deleting) setDeletingCatalog(null);
  };

  const deleteCatalog = async () => {
    if (!deletingCatalog) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/catalogs/${deletingCatalog.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        throw new Error(error?.message || "ไม่สามารถลบแคตตาล็อกได้");
      }
      setDeletingCatalog(null);
      void fetchCatalogs();
    } catch (error) {
      const message = error instanceof Error ? error.message : "ไม่สามารถลบแคตตาล็อกได้";
      showToast(message, "error");
    } finally {
      setDeleting(false);
    }
  };

  const copyLink = async (catalogId: number) => {
    try {
      await navigator.clipboard.writeText(getCatalogUrl(catalogId));
      setCopiedId(catalogId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const shareToFacebook = (catalogId: number) => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getCatalogUrl(catalogId))}`,
      "_blank",
      "width=600,height=400",
    );
  };

  const shareToLine = (catalogId: number) => {
    window.open(
      `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(getCatalogUrl(catalogId))}`,
      "_blank",
      "width=600,height=400",
    );
  };

  const shareToWhatsApp = (catalogId: number, title: string) => {
    window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${getCatalogUrl(catalogId)}`)}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF0FF] text-[#0F172A]">
        <Loader2 className="animate-spin text-[#F97316]" size={32} />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#EEF0FF] pb-20 text-[#0F172A]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_32%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.34),transparent_40%)]" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-[#D9E1F2] bg-white/85 backdrop-blur-md">
        <div className="relative mx-auto flex h-24 w-full max-w-md items-center px-4 md:max-w-5xl md:px-6">
          <Link
            href="/manage/control"
            className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-[#F6F8FF] group md:left-6"
            title="ย้อนกลับ"
          >
            <ArrowLeft size={20} className="text-[#64748B] transition-all group-hover:text-[#050579]" />
          </Link>

          <div className="mx-auto flex min-w-0 flex-col items-center text-center">
            <div className="mb-0.5 text-[11px] font-black uppercase leading-none tracking-[0.18em] text-[#94A3B8]">
              NEX Catalog
            </div>
            <div className="text-base font-black text-[#050579]">แคตตาล็อกสินค้าของคุณ</div>
            <div className="mt-2 inline-flex items-center rounded-full border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-1 text-xs font-bold text-[#64748B]">
              <span className="mr-1.5 text-[#94A3B8]">แผนปัจจุบัน</span>
              <span className="text-[#050579]">{currentPlanLabel}</span>
            </div>
          </div>

        </div>
      </nav>

      <main className="relative z-10 mx-auto mt-6 w-full max-w-md px-4 pb-8 md:max-w-5xl md:px-6">
        <div className="mb-6 flex justify-center">
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <button
              onClick={openCreateCatalogModal}
              className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#F97316] px-7 py-4 text-lg font-black text-white shadow-[0_20px_45px_-20px_rgba(249,115,22,0.85)] transition-all hover:bg-[#EA580C] active:scale-95 md:w-auto"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/18 ring-1 ring-white/22">
                <Plus size={22} strokeWidth={3} />
              </span>
              <span>สร้างแคตตาล็อกใหม่</span>
            </button>

            <Link
              href="/manage/catalog-import-document"
              className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border border-[#D1DBEF] bg-white px-6 py-4 text-sm font-black text-[#334155] transition-all hover:border-[#BCCBE8] hover:bg-[#F8FAFF] md:w-auto"
            >
              <Upload size={18} />
              <span>นำเข้าแคตตาล็อกเอกสาร</span>
            </Link>
          </div>
        </div>

        <section className="rounded-3xl border border-[#D9E1F2] bg-white p-4 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.16)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-xl font-black leading-tight text-[#050579] md:text-2xl">จัดการแคตตาล็อกสินค้า</h1>
              <p className="mt-2 text-sm leading-6 text-[#64748B]">
                จัดการรายการสินค้า แชร์ลิงก์ และติดตามความพร้อมของแคตตาล็อกจากพื้นที่เดียวกัน
              </p>
            </div>

            <div className="rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-3 md:min-w-[320px]">
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">
                ค้นหาแคตตาล็อก
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="ค้นหาชื่อแคตตาล็อก..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 w-full rounded-2xl border border-[#D9E1F2] bg-white pl-11 pr-4 text-sm font-semibold text-[#0F172A] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#D1DBEF] focus:ring-2 focus:ring-[#F97316]/15"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
              </div>
            </div>
          </div>

          {catalogs.length === 0 ? (
            <section className="mt-5 rounded-[28px] border-2 border-dashed border-[#D9E1F2] bg-[#F9FBFF] px-6 py-14 text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[#F0F5FF]">
                <Package size={34} className="text-[#94A3B8]" />
              </div>
              <h2 className="text-2xl font-black text-[#050579]">ยังไม่มีแคตตาล็อก</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#64748B]">
                เริ่มสร้างแคตตาล็อกแรกของคุณเพื่อเพิ่มรายการสินค้าและแชร์กับลูกค้าได้ทันที
              </p>
              <button
                onClick={openCreateCatalogModal}
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#F97316] px-6 py-3 text-sm font-black text-white shadow-[0_18px_40px_-26px_rgba(249,115,22,0.45)] transition-colors hover:bg-[#EA580C]"
              >
                สร้างแคตตาล็อกตอนนี้
              </button>
              <Link
                href="/manage/catalog-import-document"
                className="mt-2 inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#D1DBEF] bg-white px-5 py-2.5 text-sm font-bold text-[#475569] transition-colors hover:bg-[#F8FAFF]"
              >
                นำเข้าแคตตาล็อกเอกสาร
              </Link>
            </section>
          ) : filteredCatalogs.length === 0 ? (
            <section className="mt-5 rounded-[28px] border border-[#D9E1F2] bg-[#F9FBFF] px-6 py-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#EEF4FF]">
                <Search size={24} className="text-[#94A3B8]" />
              </div>
              <h2 className="text-xl font-black text-[#050579]">ไม่พบแคตตาล็อกที่ค้นหา</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#64748B]">
                ลองเปลี่ยนคำค้นหา หรือเคลียร์ข้อความเพื่อดูรายการทั้งหมดอีกครั้ง
              </p>
            </section>
          ) : (
            <div className="mt-5 space-y-4">
              {filteredCatalogs.map((catalog) => {
                const expandedType = expandedPanel.catalogId === catalog.id ? expandedPanel.type : null;
                const isShareExpanded = expandedType === "share";
                const cardImage = getCatalogCardImage(catalog);
                const isDocumentCatalog = catalog.layout_config?.catalog_mode === "document_book";
                return (
                  <article
                    key={catalog.id}
                    className="overflow-hidden rounded-[28px] border border-[#C7D2E5] bg-[#F3F6FF] shadow-[0_18px_36px_-28px_rgba(15,23,42,0.14)]"
                  >
                    <div className="px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[#D9E1F2] bg-white text-[#050579] shadow-[0_10px_24px_-20px_rgba(5,5,121,0.22)]">
                          {cardImage ? (
                            <img
                              src={cardImage}
                              alt={`Catalog cover ${catalog.title}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <FileText size={20} />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h2 className="line-clamp-2 text-xl font-bold leading-tight text-[#050579]">{catalog.title}</h2>
                              <div className="mt-1 text-sm font-semibold text-[#94A3B8]">
                                {(catalog.products?.length || 0).toLocaleString("th-TH")} สินค้า • {formatCatalogDate(catalog.created_at)}
                              </div>
                              {catalog.description ? (
                                <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#64748B]">{catalog.description}</p>
                              ) : (
                                <p className="mt-2 text-sm font-medium text-[#94A3B8]">ยังไม่มีคำอธิบาย</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-[#DEE7F7] pt-4">
                        <div className="grid gap-2 md:grid-cols-2">
                          <Link
                            href={isDocumentCatalog ? `/manage/catalog-import-document?catalog_id=${catalog.id}` : `/manage/catalogs/${catalog.id}`}
                            className="flex items-center justify-between rounded-2xl bg-[#050579] px-4 py-3 text-sm font-black text-white transition-colors hover:bg-[#07079A]"
                          >
                            <span>{isDocumentCatalog ? "จัดการหน้าเอกสาร" : "จัดการสินค้า"}</span>
                            <ExternalLink size={16} />
                          </Link>
                          <Link
                            href={`/catalog/${catalog.id}?view=book`}
                            target="_blank"
                            className="flex items-center justify-between rounded-2xl border border-[#D1DBEF] bg-white/92 px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:border-[#B9C9E6]"
                          >
                            <span className="flex items-center gap-2">
                              <ExternalLink size={16} className="text-[#050579]" />
                              ดูหน้าสาธารณะ
                            </span>
                            <ExternalLink size={16} className="text-[#475569]" />
                          </Link>
                        </div>

                        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_56px] gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedPanel(
                                isShareExpanded ? { catalogId: null, type: null } : { catalogId: catalog.id, type: "share" },
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
                            onClick={() => openDeleteModal(catalog)}
                            className="flex items-center justify-center rounded-2xl border border-[#F6D5BF] bg-white/92 text-[#DC2626] transition hover:bg-[#FEF2F2]"
                            title="ลบแคตตาล็อก"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {isShareExpanded && (
                      <div className="border-t border-[#DEE7F7] bg-[#EDF4FF] px-4 py-4">
                        <div className="rounded-2xl border border-[#D1DBEF] bg-[#F7FAFF] px-4 py-3">
                          <div className="mb-2 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#94A3B8]">
                            <Share2 size={14} />
                            <span>แชร์และข้อมูลเพิ่มเติม</span>
                          </div>
                          <p className="break-all text-sm font-semibold text-[#050579]">{getCatalogUrl(catalog.id)}</p>
                          {catalog.description ? (
                            <p className="mt-2 text-sm leading-relaxed text-[#64748B]">{catalog.description}</p>
                          ) : null}
                        </div>

                        <div className="mt-3 rounded-2xl border border-[#D1DBEF] bg-[#F7FAFF] p-4 text-center">
                          <div className="mx-auto w-full max-w-[250px] rounded-[28px] border border-[#D9E1F2] bg-white p-4 shadow-sm">
                            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#94A3B8]">QR Code</div>
                            <QrCodeImage url={getCatalogUrl(catalog.id)} size={150} />
                            <div className="mt-3 text-sm font-semibold text-[#050579]">{catalog.title}</div>
                            <div className="mt-1 break-all text-[11px] leading-5 text-[#64748B]">{getCatalogUrl(catalog.id)}</div>
                            <QrCodeDownloadActions
                              qrValue={getCatalogUrl(catalog.id)}
                              fileBaseName={`catalog-${catalog.id}`}
                              titleLine="QR Code"
                              nameLine={catalog.title}
                              bottomLabel="URL"
                              bottomLine={getCatalogUrl(catalog.id)}
                              className="mt-4"
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-center gap-2.5">
                          <button
                            onClick={() => shareToFacebook(catalog.id)}
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1877F2]/10 text-[#1877F2] transition-all hover:bg-[#1877F2] hover:text-white"
                            title="แชร์ไป Facebook"
                          >
                            <FacebookIcon />
                          </button>
                          <button
                            onClick={() => shareToLine(catalog.id)}
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#00B900]/10 text-[#00B900] transition-all hover:bg-[#00B900] hover:text-white"
                            title="แชร์ไป Line"
                          >
                            <LineIcon />
                          </button>
                          <button
                            onClick={() => shareToWhatsApp(catalog.id, catalog.title)}
                            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#25D366]/10 text-[#25D366] transition-all hover:bg-[#25D366] hover:text-white"
                            title="แชร์ไป WhatsApp"
                          >
                            <WhatsAppIcon />
                          </button>
                          <button
                            onClick={() => copyLink(catalog.id)}
                            className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
                              copiedId === catalog.id
                                ? "bg-[#16A34A] text-white"
                                : "bg-[#E5E7EB] text-[#64748B] hover:bg-[#050579] hover:text-white"
                            }`}
                            title="คัดลอกลิงก์"
                          >
                            {copiedId === catalog.id ? <Check size={18} /> : <Copy size={16} />}
                          </button>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
          <div className="absolute inset-0 bg-[#050579]/40 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-[28px] border border-[#D9E1F2] bg-white p-5 shadow-2xl sm:rounded-[32px] sm:p-8">
            <h2 className="mb-2 text-2xl font-black leading-tight text-[#050579] sm:text-2xl">สร้างแคตตาล็อกใหม่</h2>
            <p className="mb-6 text-sm font-medium leading-7 text-[#64748B] sm:mb-8">เริ่มต้นพื้นที่นำเสนอสินค้าของคุณในธีมมาตรฐานเดียวกับระบบจัดการ NEX</p>
            <form onSubmit={createCatalog} className="space-y-5 sm:space-y-6">
              <div className="space-y-2">
                <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#64748B]">หัวข้อแคตตาล็อก</label>
                <input
                  required
                  className="w-full rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-4 text-base font-bold text-[#050579] outline-none transition-all placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#F97316]/20"
                  value={newCatalog.title}
                  placeholder="เช่น คอลเลกชันฤดูร้อน 2024"
                  onChange={(e) => setNewCatalog({ ...newCatalog, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#64748B]">คำอธิบาย</label>
                <textarea
                  className="h-36 w-full resize-none rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-4 font-medium text-[#0F172A] outline-none transition-all placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#F97316]/20"
                  value={newCatalog.description}
                  placeholder="เพิ่มรายละเอียดเกี่ยวกับแคตตาล็อกนี้..."
                  onChange={(e) => setNewCatalog({ ...newCatalog, description: e.target.value })}
                />
              </div>
              <div className="flex gap-3 pt-3 sm:gap-4 sm:pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-2xl border border-[#D9E1F2] py-4 text-xs font-black uppercase tracking-widest text-[#64748B] transition-colors hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button className="flex-[1.8] rounded-2xl bg-[#F97316] py-4 text-xs font-black uppercase tracking-widest text-white shadow-md transition-all hover:bg-[#EA580C] active:scale-95">
                  สร้างแคตตาล็อก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingCatalog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#050579]/40 backdrop-blur-md" onClick={closeEditModal} />
          <div className="relative z-10 w-full max-w-md rounded-[32px] border border-[#D9E1F2] bg-white p-8 shadow-2xl">
            <h2 className="mb-2 text-2xl font-black text-[#050579]">แก้ไขแคตตาล็อก</h2>
            <p className="mb-8 text-sm font-medium text-[#64748B]">อัปเดตข้อมูลหลักของแคตตาล็อกโดยคงรูปแบบการใช้งานเดิมของระบบไว้</p>
            <form onSubmit={updateCatalog} className="space-y-6">
              <div className="space-y-2">
                <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#64748B]">หัวข้อแคตตาล็อก</label>
                <input
                  required
                  className="w-full rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-3.5 text-base font-bold text-[#050579] outline-none transition-all placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#F97316]/20"
                  value={editCatalog.title}
                  onChange={(e) => setEditCatalog({ ...editCatalog, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#64748B]">คำอธิบาย</label>
                <textarea
                  className="h-32 w-full resize-none rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-4 font-medium text-[#0F172A] outline-none transition-all placeholder:text-[#94A3B8] focus:ring-2 focus:ring-[#F97316]/20"
                  value={editCatalog.description}
                  onChange={(e) => setEditCatalog({ ...editCatalog, description: e.target.value })}
                />
              </div>
              <div className="space-y-3">
                <label className="ml-1 block text-[10px] font-black uppercase tracking-widest text-[#64748B]">โลโก้แบรนด์สินค้า</label>
                <input
                  ref={editLogoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadLogoImage(file, "edit");
                  }}
                />
                <div className="flex items-center gap-3">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF]">
                    {editCatalog.brand_logo ? (
                      <img src={getImageUrl(editCatalog.brand_logo)} alt="Brand logo preview" className="h-full w-full object-contain" />
                    ) : (
                      <ImageIcon size={24} className="text-[#94A3B8]" />
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => editLogoInputRef.current?.click()}
                      disabled={uploadingLogoTarget === "edit"}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-2 text-sm font-bold text-[#334155] transition-colors hover:bg-white disabled:opacity-60"
                    >
                      {uploadingLogoTarget === "edit" ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                      {uploadingLogoTarget === "edit" ? "กำลังอัปโหลด..." : "อัปโหลดโลโก้"}
                    </button>
                    {editCatalog.brand_logo && (
                      <button
                        type="button"
                        onClick={() => setEditCatalog((prev) => ({ ...prev, brand_logo: "" }))}
                        disabled={uploadingLogoTarget === "edit"}
                        className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm font-bold text-[#B91C1C] transition-colors hover:bg-[#FEE2E2] disabled:opacity-60"
                      >
                        ลบรูป
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-[#94A3B8]">รองรับ JPG, PNG, GIF, WebP ขนาดไม่เกิน 5MB</p>
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 rounded-2xl border border-[#D9E1F2] py-4 text-xs font-black uppercase tracking-widest text-[#64748B] transition-colors hover:bg-gray-50"
                >
                  ยกเลิก
                </button>
                <button className="flex-[2] rounded-2xl bg-[#F97316] py-4 text-xs font-black uppercase tracking-widest text-white shadow-md transition-all hover:bg-[#EA580C] active:scale-95">
                  บันทึกการแก้ไข
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deletingCatalog && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#050579]/40 backdrop-blur-md" onClick={closeDeleteModal} />
          <div className="relative z-10 w-full max-w-md rounded-[32px] border border-[#FECACA] bg-white p-8 shadow-2xl">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FECACA] bg-[#FEF2F2] text-[#DC2626]">
              <AlertTriangle size={28} />
            </div>
            <h2 className="mb-2 text-2xl font-black text-[#991B1B]">ยืนยันการลบแคตตาล็อก</h2>
            <p className="mb-2 text-sm leading-relaxed text-[#7F1D1D]">คุณกำลังจะลบแคตตาล็อกนี้:</p>
            <p className="mb-6 break-words font-bold text-[#0F172A]">{deletingCatalog.title}</p>
            <p className="mb-8 text-sm font-semibold text-[#B91C1C]">
              การลบนี้ไม่สามารถย้อนกลับได้ และสินค้าภายในแคตตาล็อกจะถูกลบทั้งหมด
            </p>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 rounded-2xl border border-[#D9E1F2] py-4 text-xs font-black uppercase tracking-widest text-[#64748B] transition-colors hover:bg-gray-50 disabled:opacity-60"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={deleteCatalog}
                disabled={deleting}
                className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-[#DC2626] py-4 text-xs font-black uppercase tracking-widest text-white shadow-md transition-colors hover:bg-[#B91C1C] disabled:opacity-60"
              >
                {deleting ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                {deleting ? "กำลังลบ..." : "ยืนยันลบแคตตาล็อก"}
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
