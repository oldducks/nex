/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Image as ImageIcon,
  Layout,
  Loader2,
  MapPin,
  Monitor,
  MousePointer2,
  Plus,
  Save,
  Settings2,
  Smartphone,
  Trash2,
  Type,
  Video,
  MessageSquare,
} from "lucide-react";
import { VideoUpload } from "@/components/VideoUpload";
import { Toast, type ToastType } from "@/components/Toast";
import { getEmbedUrl, isEmbedableVideo } from "@/lib/videoUtils";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nexsolution.cloud";

type PreviewMode = "mobile" | "desktop";

interface Block {
  id: string;
  type: "text" | "image" | "video" | "button" | "form" | "location";
  content: any;
}

interface LandingPage {
  id: number;
  title: string;
  slug: string;
  description: string;
  content_blocks: Block[];
  is_published: boolean;
  theme_config: any;
  seo_metadata: any;
}

const sanitizeSlug = (value: string): string =>
  value
    .trim()
    .replace(/[^a-zA-Z0-9ก-๙\u0E00-\u0E7F]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .toLowerCase();

const resolveUploadedImageUrl = async (jobId: string, token?: string): Promise<string> => {
  const maxAttempts = 40;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const statusRes = await fetch(`${API_URL}/uploads/job/${jobId}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });

    if (!statusRes.ok) {
      throw new Error("Failed to check upload status");
    }

    const status = await statusRes.json();
    if (status.state === "completed") {
      let url = status?.result?.url;
      if (!url) throw new Error("Upload finished but URL missing");
      if (url.startsWith("http://") || url.startsWith("https://")) return url;
      if (url.startsWith("/api/")) url = url.substring(4);
      return `${API_URL}${url}`;
    }

    if (status.state === "failed") {
      throw new Error(status?.failedReason || "Upload processing failed");
    }

    await new Promise((resolve) => setTimeout(resolve, 800));
  }

  throw new Error("Upload timed out");
};

function ImageBlockEditor({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate: (content: any) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = Cookies.get("token");

  const handleUpload = async (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("รองรับเฉพาะไฟล์ JPG, PNG, GIF, และ WebP");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("ไฟล์มีขนาดเกิน 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    try {
      const res = await fetch(`${API_URL}/uploads/image`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Upload failed (${res.status}): ${errorText.substring(0, 100)}`);
      }

      const data = await res.json();
      const imageUrl = data?.jobId
        ? await resolveUploadedImageUrl(String(data.jobId), token)
        : data?.url;

      if (!imageUrl) {
        throw new Error("Upload completed but no image URL returned");
      }

      onUpdate({ ...block.content, url: imageUrl });
    } catch (error) {
      alert(error instanceof Error ? error.message : "อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3 rounded-2xl border border-dashed border-[#D9E1F2] bg-white p-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleUpload(file);
        }}
        className="hidden"
      />

      <button
        type="button"
        onClick={() => !uploading && fileInputRef.current?.click()}
        className="flex min-h-36 w-full flex-col items-center justify-center rounded-2xl border border-[#E5ECFA] bg-[#F8FAFF] px-4 text-center"
      >
        {uploading ? (
          <>
            <Loader2 className="mb-3 animate-spin text-[#F97316]" size={30} />
            <p className="font-bold text-[#050579]">กำลังอัปโหลดรูปภาพ...</p>
          </>
        ) : (
          <>
            <ImageIcon className="mb-3 text-[#94A3B8]" size={34} />
            <p className="font-bold text-[#050579]">กดเพื่ออัปโหลดรูปภาพ</p>
            <p className="mt-1 text-xs text-[#94A3B8]">JPG, PNG, GIF, WebP สูงสุด 5MB</p>
          </>
        )}
      </button>

      <input
        value={block.content.url || ""}
        onChange={(e) => onUpdate({ ...block.content, url: e.target.value })}
        placeholder="URL รูปภาพ"
        className="h-11 w-full rounded-xl border border-[#D9E1F2] bg-white px-4 text-sm text-[#0F172A] outline-none"
      />

      <input
        value={block.content.link || ""}
        onChange={(e) => onUpdate({ ...block.content, link: e.target.value })}
        placeholder="ลิงก์เมื่อกดรูปภาพ (ไม่บังคับ)"
        className="h-11 w-full rounded-xl border border-[#D9E1F2] bg-white px-4 text-sm text-[#0F172A] outline-none"
      />
    </div>
  );
}

function LocationBlockEditor({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate: (content: any) => void;
}) {
  return (
    <div className="space-y-3 rounded-2xl border border-[#D9E1F2] bg-white p-4">
      <textarea
        value={block.content.embed_url || ""}
        onChange={(e) => {
          let val = e.target.value;
          const match = val.match(/src="([^"]+)"/);
          if (match) val = match[1];
          onUpdate({ ...block.content, embed_url: val });
        }}
        placeholder="วาง Google Maps Embed URL หรือ iframe"
        className="min-h-24 w-full rounded-xl border border-[#D9E1F2] bg-[#F8FAFF] px-4 py-3 text-sm text-[#0F172A] outline-none"
      />
      <input
        value={block.content.address || ""}
        onChange={(e) => onUpdate({ ...block.content, address: e.target.value })}
        placeholder="ชื่อสถานที่ / ที่อยู่"
        className="h-11 w-full rounded-xl border border-[#D9E1F2] bg-white px-4 text-sm text-[#0F172A] outline-none"
      />
      <input
        value={block.content.map_url || ""}
        onChange={(e) => onUpdate({ ...block.content, map_url: e.target.value })}
        placeholder="ลิงก์ Google Maps โดยตรง"
        className="h-11 w-full rounded-xl border border-[#D9E1F2] bg-white px-4 text-sm text-[#0F172A] outline-none"
      />
    </div>
  );
}

function BlockTypeButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: any;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-28 flex-col items-center justify-center rounded-2xl border border-[#D9E1F2] bg-white px-3 py-4 text-center shadow-[0_12px_30px_-24px_rgba(5,5,121,0.24)] transition-all active:scale-[0.98]"
    >
      <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EEF2FF] text-[#4F46E5]">
        <Icon size={22} />
      </span>
      <span className="text-sm font-bold text-[#050579]">{label}</span>
    </button>
  );
}

function normalizeUrl(value?: unknown): string | null {
  if (typeof value !== "string") return null;
  let trimmed = value.trim();
  if (!trimmed) return null;
  if (
    !trimmed.startsWith("http://") &&
    !trimmed.startsWith("https://") &&
    !trimmed.startsWith("mailto:") &&
    !trimmed.startsWith("tel:") &&
    !trimmed.startsWith("/") &&
    !trimmed.startsWith("#")
  ) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

function renderBlockSummary(block: Block) {
  switch (block.type) {
    case "text":
      return block.content.title || "ยังไม่ได้ใส่หัวข้อ";
    case "image":
      return block.content.url ? "เพิ่มรูปภาพแล้ว" : "ยังไม่ได้เพิ่มรูปภาพ";
    case "video":
      return block.content.url ? "เพิ่มวิดีโอแล้ว" : "ยังไม่ได้เพิ่มวิดีโอ";
    case "button":
      return block.content.text || "ยังไม่ได้ตั้งค่าปุ่ม";
    case "form":
      return block.content.title || "ฟอร์มติดต่อ";
    case "location":
      return block.content.address || "ยังไม่ได้ตั้งค่าที่ตั้ง";
    default:
      return "Section";
  }
}

function renderBlockLabel(type: Block["type"]) {
  switch (type) {
    case "text":
      return "ข้อความ";
    case "image":
      return "รูปภาพ";
    case "video":
      return "วิดีโอ";
    case "button":
      return "ปุ่ม";
    case "form":
      return "ฟอร์ม";
    case "location":
      return "ที่ตั้ง";
    default:
      return "Section";
  }
}

function renderBlockIcon(type: Block["type"]) {
  switch (type) {
    case "text":
      return Type;
    case "image":
      return ImageIcon;
    case "video":
      return Video;
    case "button":
      return MousePointer2;
    case "form":
      return MessageSquare;
    case "location":
      return MapPin;
    default:
      return Layout;
  }
}

function RenderBlockEditor({
  block,
  onUpdate,
}: {
  block: Block;
  onUpdate: (content: any) => void;
}) {
  switch (block.type) {
    case "text":
      return (
        <div className="space-y-3 rounded-2xl border border-[#D9E1F2] bg-white p-4">
          <input
            value={block.content.title || ""}
            onChange={(e) => onUpdate({ ...block.content, title: e.target.value })}
            placeholder="หัวข้อ"
            className="h-12 w-full rounded-xl border border-[#D9E1F2] bg-white px-4 text-base font-bold text-[#050579] outline-none"
          />
          <textarea
            value={block.content.body || ""}
            onChange={(e) => onUpdate({ ...block.content, body: e.target.value })}
            placeholder="เนื้อหา"
            className="min-h-28 w-full rounded-xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm text-[#0F172A] outline-none"
          />
        </div>
      );
    case "image":
      return <ImageBlockEditor block={block} onUpdate={onUpdate} />;
    case "video":
      return (
        <div className="rounded-2xl border border-[#D9E1F2] bg-white p-4">
          <VideoUpload
            value={{
              url: block.content.url,
              autoplay: block.content.autoplay,
              enabled: true,
              link_enabled: false,
              link_url: "",
            }}
            onChange={(config) =>
              onUpdate({
                ...block.content,
                url: config?.url || "",
                autoplay: config?.autoplay || false,
              })
            }
          />
        </div>
      );
    case "button":
      return (
        <div className="space-y-3 rounded-2xl border border-[#D9E1F2] bg-white p-4">
          <input
            value={block.content.text || ""}
            onChange={(e) => onUpdate({ ...block.content, text: e.target.value })}
            placeholder="ข้อความปุ่ม"
            className="h-11 w-full rounded-xl border border-[#D9E1F2] bg-white px-4 text-sm text-[#0F172A] outline-none"
          />
          <input
            value={block.content.link || ""}
            onChange={(e) => onUpdate({ ...block.content, link: e.target.value })}
            placeholder="ลิงก์ปลายทาง"
            className="h-11 w-full rounded-xl border border-[#D9E1F2] bg-white px-4 text-sm text-[#0F172A] outline-none"
          />
        </div>
      );
    case "form":
      return (
        <div className="space-y-3 rounded-2xl border border-[#D9E1F2] bg-white p-4">
          <input
            value={block.content.title || ""}
            onChange={(e) => onUpdate({ ...block.content, title: e.target.value })}
            placeholder="หัวข้อฟอร์ม"
            className="h-11 w-full rounded-xl border border-[#D9E1F2] bg-white px-4 text-sm text-[#0F172A] outline-none"
          />
          <textarea
            value={block.content.description || ""}
            onChange={(e) => onUpdate({ ...block.content, description: e.target.value })}
            placeholder="คำอธิบายฟอร์ม"
            className="min-h-24 w-full rounded-xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm text-[#0F172A] outline-none"
          />
        </div>
      );
    case "location":
      return <LocationBlockEditor block={block} onUpdate={onUpdate} />;
    default:
      return null;
  }
}

function RenderPreviewBlock({
  block,
  theme,
}: {
  block: Block;
  theme: any;
}) {
  const primary = theme?.primary_color || "#4F46E5";

  switch (block.type) {
    case "text":
      return (
        <section className="px-5 py-8 text-center">
          <h2 className="text-[32px] font-black leading-tight text-[var(--primary)]" style={{ ["--primary" as any]: primary }}>
            {block.content.title || "หัวข้อ"}
          </h2>
          <p className="mt-4 whitespace-pre-wrap text-base leading-7 text-[#475569]">
            {block.content.body || "เนื้อหา"}
          </p>
        </section>
      );
    case "image":
      return block.content.url ? (
        <section className="px-5 py-6">
          {normalizeUrl(block.content.link) ? (
            <a href={normalizeUrl(block.content.link)!} target="_blank" rel="noopener noreferrer">
              <img src={block.content.url} alt="Preview" className="w-full rounded-2xl object-cover" />
            </a>
          ) : (
            <img src={block.content.url} alt="Preview" className="w-full rounded-2xl object-cover" />
          )}
        </section>
      ) : null;
    case "video": {
      const url = block.content.url;
      if (!url) return null;
      const isEmbed = isEmbedableVideo(url);
      const embedUrl = isEmbed ? getEmbedUrl(url) : "";
      const videoUrl = url.startsWith("http") ? url : `${API_URL}${url}`;

      return (
        <section className="px-5 py-6">
          {isEmbed ? (
            <div className="relative overflow-hidden rounded-2xl pt-[56.25%]">
              <iframe
                src={embedUrl}
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen
              />
            </div>
          ) : (
            <video
              src={videoUrl}
              controls
              className="w-full rounded-2xl"
            />
          )}
        </section>
      );
    }
    case "button": {
      const url = normalizeUrl(block.content.link) || normalizeUrl(block.content.url);
      return (
        <section className="px-5 py-6 text-center">
          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex rounded-2xl px-6 py-4 text-base font-bold text-white shadow-[0_18px_40px_-24px_rgba(5,5,121,0.45)]"
              style={{ backgroundColor: primary }}
            >
              {block.content.text || "ดูรายละเอียด"}
            </a>
          ) : (
            <div
              className="inline-flex rounded-2xl px-6 py-4 text-base font-bold text-white opacity-80"
              style={{ backgroundColor: primary }}
            >
              {block.content.text || "ดูรายละเอียด"}
            </div>
          )}
        </section>
      );
    }
    case "form":
      return (
        <section className="px-5 py-8">
          <div className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFF] p-5">
            <h3 className="text-center text-2xl font-black text-[var(--primary)]" style={{ ["--primary" as any]: primary }}>
              {block.content.title || "ติดต่อเรา"}
            </h3>
            <p className="mt-2 text-center text-sm leading-6 text-[#64748B]">
              {block.content.description || "กรอกข้อมูลเพื่อติดต่อกลับ"}
            </p>
            <div className="mt-5 space-y-3">
              <input placeholder="ชื่อ" className="h-12 w-full rounded-xl border border-[#D9E1F2] bg-white px-4 text-sm" />
              <input placeholder="อีเมล" className="h-12 w-full rounded-xl border border-[#D9E1F2] bg-white px-4 text-sm" />
              <textarea placeholder="ข้อความ" className="min-h-28 w-full rounded-xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm" />
            </div>
          </div>
        </section>
      );
    case "location":
      return (
        <section className="px-5 py-6">
          <div className="overflow-hidden rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF]">
            {block.content.embed_url ? (
              <iframe
                src={block.content.embed_url}
                width="100%"
                height="260"
                style={{ border: 0 }}
                loading="lazy"
              />
            ) : (
              <div className="flex h-52 flex-col items-center justify-center text-[#94A3B8]">
                <MapPin className="mb-3" size={34} />
                <p className="font-semibold">ยังไม่ได้ตั้งค่าแผนที่</p>
              </div>
            )}
          </div>
          {(block.content.address || block.content.map_url) && (
            <div className="mt-4 text-center">
              {block.content.address ? (
                <p className="text-base font-bold text-[#0F172A]">{block.content.address}</p>
              ) : null}
              {block.content.map_url ? (
                <a
                  href={block.content.map_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex rounded-2xl px-5 py-3 text-sm font-bold text-white"
                  style={{ backgroundColor: primary }}
                >
                  เปิดการนำทาง
                </a>
              ) : null}
            </div>
          )}
        </section>
      );
    default:
      return null;
  }
}

export default function LandingPageEditorV2() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const id = params.id as string;
  const token = Cookies.get("token");
  const lastSavedSnapshotRef = useRef("");
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const listPath = pathname?.startsWith("/manage/landing-pages-v2")
    ? "/manage/landing-pages-v2"
    : "/manage/landing-pages";

  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("mobile");
  const [showSettings, setShowSettings] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: "success" | "error" | null; message: string }>({
    type: null,
    message: "",
  });
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchPage = async () => {
      try {
        const res = await fetch(`${API_URL}/landing-pages/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        const normalized = {
          ...data,
          content_blocks: data.content_blocks || [],
          theme_config: data.theme_config || {
            primary_color: "#4F46E5",
            bg_color: "#FFFFFF",
            font_family: "Inter",
          },
        };
        setPage(normalized);
        lastSavedSnapshotRef.current = JSON.stringify(normalized);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void fetchPage();
  }, [id, router, token]);

  const doSave = async (options?: { silent?: boolean }) => {
    if (!page) return;

    try {
      setSaving(true);
      if (!options?.silent) setSaveStatus({ type: null, message: "" });

      const payload = {
        title: page.title,
        slug: page.slug,
        description: page.description,
        content_blocks: page.content_blocks,
        is_published: page.is_published,
        theme_config: page.theme_config,
        seo_metadata: page.seo_metadata,
      };

      const res = await fetch(`${API_URL}/landing-pages/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "save failed");
      }

      const updated = await res.json();
      const normalized = {
        ...updated,
        content_blocks: updated.content_blocks || [],
        theme_config: updated.theme_config || {
          primary_color: "#4F46E5",
          bg_color: "#FFFFFF",
          font_family: "Inter",
        },
      };
      setPage(normalized);
      lastSavedSnapshotRef.current = JSON.stringify(normalized);
      if (!options?.silent) {
        setSaveStatus({ type: "success", message: "บันทึกสำเร็จ" });
        setTimeout(() => setSaveStatus({ type: null, message: "" }), 2500);
      }
    } catch (error: any) {
      if (!options?.silent) {
        setSaveStatus({ type: "error", message: `บันทึกไม่สำเร็จ: ${error?.message || "unknown error"}` });
      }
    } finally {
      setSaving(false);
      setAutoSaving(false);
    }
  };

  useEffect(() => {
    if (!page || loading) return;
    const snapshot = JSON.stringify(page);
    if (snapshot === lastSavedSnapshotRef.current) return;

    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    setAutoSaving(true);
    autoSaveTimeoutRef.current = setTimeout(() => {
      void doSave({ silent: true });
    }, 1200);

    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, loading]);

  const addBlock = (type: Block["type"]) => {
    if (!page) return;
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      content:
        type === "text"
          ? { title: "", body: "" }
          : type === "image"
            ? { url: "", link: "" }
            : type === "video"
              ? { url: "", autoplay: false }
              : type === "button"
                ? { text: "", link: "" }
                : type === "location"
                  ? { title: "ที่ตั้งของเรา", address: "", embed_url: "", map_url: "" }
                  : { title: "ติดต่อเรา", description: "" },
    };
    setPage({ ...page, content_blocks: [...page.content_blocks, newBlock] });
  };

  const updateBlockContent = (blockId: string, content: any) => {
    if (!page) return;
    setPage({
      ...page,
      content_blocks: page.content_blocks.map((block) =>
        block.id === blockId ? { ...block, content } : block,
      ),
    });
  };

  const removeBlock = (blockId: string) => {
    if (!page) return;
    setPage({
      ...page,
      content_blocks: page.content_blocks.filter((block) => block.id !== blockId),
    });
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (!page) return;
    const blocks = [...page.content_blocks];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;
    [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];
    setPage({ ...page, content_blocks: blocks });
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#EEF0FF] text-[#0F172A]">
        <Loader2 className="animate-spin text-[#F97316]" size={32} />
      </div>
    );
  }

  if (!page) {
    return <div className="p-6 text-sm text-[#0F172A]">ไม่พบข้อมูลหน้านี้</div>;
  }

  const publicUrl = `${SITE_URL}/lp/${encodeURIComponent(page.slug)}`;

  return (
    <div className="relative min-h-screen bg-[#EEF0FF] pb-28 text-[#0F172A]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_32%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.34),transparent_40%)]" />
      </div>

      <nav className="sticky top-0 z-50 border-b border-[#D9E1F2] bg-white/85 backdrop-blur-md">
        <div className="relative mx-auto flex h-20 w-full max-w-md items-center px-4">
          <Link
            href={listPath}
            className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-xl text-[#64748B] transition-all hover:bg-[#F6F8FF] hover:text-[#050579]"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="mx-auto text-center">
            <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">
              NEX Sale Page Builder
            </div>
            <div className="mt-0.5 text-sm font-bold text-[#050579]">สร้างหน้าแบบเลือก section ทีละส่วน</div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto mt-6 w-full max-w-md px-4">
        <section className="rounded-3xl border border-[#D9E1F2] bg-white p-4 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.16)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">ข้อมูลหน้า</div>
              <h1 className="mt-1 text-xl font-black text-[#050579]">ตั้งค่าพื้นฐานของ Sale Page</h1>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#D9E1F2] bg-white px-4 text-sm font-black text-[#050579] shadow-[0_18px_40px_-30px_rgba(5,5,121,0.16)]"
              >
                <ExternalLink size={16} />
                <span>ดูหน้าจริง</span>
              </a>
              <button
                type="button"
                onClick={() => void doSave()}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#F97316] px-4 text-sm font-black text-white shadow-[0_18px_40px_-24px_rgba(249,115,22,0.72)] disabled:opacity-60"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                <span>บันทึก</span>
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <input
              value={page.title}
              onChange={(e) => setPage({ ...page, title: e.target.value })}
              placeholder="ชื่อหน้า"
              className="h-12 w-full rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] px-4 text-base font-bold text-[#050579] outline-none"
            />
            <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] px-4 py-3">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">ลิงก์ร้าน</div>
              <div className="mt-1 flex items-center gap-1 text-sm font-semibold text-[#64748B]">
                <span className="shrink-0 text-[#94A3B8]">/lp/</span>
                <input
                  value={page.slug}
                  onChange={(e) => setPage({ ...page, slug: sanitizeSlug(e.target.value) })}
                  className="min-w-0 flex-1 bg-transparent font-bold text-[#050579] outline-none"
                />
              </div>
            </div>
            <textarea
              value={page.description || ""}
              onChange={(e) => setPage({ ...page, description: e.target.value })}
              placeholder="คำอธิบายสั้น ๆ ของหน้า"
              className="min-h-24 w-full rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] px-4 py-3 text-sm text-[#0F172A] outline-none"
            />
            <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] px-4 py-3 text-sm font-semibold text-[#64748B]">
              {saveStatus.message || (autoSaving ? "กำลังบันทึกอัตโนมัติ..." : "ระบบจะบันทึกอัตโนมัติระหว่างแก้ไข")}
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-[#D9E1F2] bg-white p-4 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.16)]">
          <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">Sections</div>
          <h2 className="mt-1 text-xl font-black text-[#050579]">สร้างหน้าโดยเลือก section ทีละส่วน</h2>
          <p className="mt-2 text-sm leading-6 text-[#64748B]">
            เลือกประเภท section จาก 6 ปุ่มเดิม แล้วกรอกข้อมูลและดูตัวอย่างของ section นั้นได้ใน card เดียวกัน
          </p>

          <div className="mt-4 space-y-4">
            {page.content_blocks.map((block, index) => {
              const Icon = renderBlockIcon(block.type);
              return (
                <article
                  key={block.id}
                  className="rounded-3xl border border-[#D9E1F2] bg-[#F6F8FF] p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[#4F46E5]">
                      <Icon size={22} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-xs font-black uppercase tracking-[0.16em] text-[#94A3B8]">
                            section {index + 1}
                          </div>
                          <h3 className="mt-1 text-lg font-black text-[#050579]">{renderBlockLabel(block.type)}</h3>
                          <p className="mt-1 text-sm text-[#64748B]">{renderBlockSummary(block)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => moveBlock(index, "up")}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D9E1F2] bg-white text-[#64748B]"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBlock(index, "down")}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#D9E1F2] bg-white text-[#64748B]"
                          >
                            <ChevronDown size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeBlock(block.id)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FECACA] bg-white text-[#EF4444]"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <RenderBlockEditor
                      block={block}
                      onUpdate={(content) => updateBlockContent(block.id, content)}
                    />
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#D9E1F2] bg-white p-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">
                          Preview
                        </div>
                        <div className="mt-1 text-sm font-bold text-[#050579]">ตัวอย่าง section นี้</div>
                      </div>
                      <div className="flex items-center gap-2 rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-1">
                        <button
                          type="button"
                          onClick={() => setPreviewMode("mobile")}
                          className={`flex h-9 w-9 items-center justify-center rounded-xl ${previewMode === "mobile" ? "bg-white text-[#050579]" : "text-[#94A3B8]"}`}
                        >
                          <Smartphone size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPreviewMode("desktop")}
                          className={`flex h-9 w-9 items-center justify-center rounded-xl ${previewMode === "desktop" ? "bg-white text-[#050579]" : "text-[#94A3B8]"}`}
                        >
                          <Monitor size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <div
                        className={`overflow-hidden rounded-[24px] border border-[#D9E1F2] bg-white shadow-[0_20px_40px_-28px_rgba(15,23,42,0.35)] ${previewMode === "mobile" ? "w-full max-w-[375px]" : "w-full"}`}
                      >
                        <RenderPreviewBlock block={block} theme={page.theme_config} />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}

            <div className="rounded-3xl border border-dashed border-[#D9E1F2] bg-[#F8FAFF] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#F97316]">
                  <Plus size={22} />
                </div>
                <div>
                  <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">เพิ่ม section</div>
                  <h3 className="mt-1 text-base font-black text-[#050579]">
                    {page.content_blocks.length === 0 ? "เลือก section แรกของคุณ" : "เพิ่ม section ถัดไป"}
                  </h3>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <BlockTypeButton icon={Type} label="ข้อความ" onClick={() => addBlock("text")} />
                <BlockTypeButton icon={ImageIcon} label="รูปภาพ" onClick={() => addBlock("image")} />
                <BlockTypeButton icon={Video} label="วิดีโอ" onClick={() => addBlock("video")} />
                <BlockTypeButton icon={MousePointer2} label="ปุ่ม" onClick={() => addBlock("button")} />
                <BlockTypeButton icon={MessageSquare} label="ฟอร์ม" onClick={() => addBlock("form")} />
                <BlockTypeButton icon={MapPin} label="ที่ตั้ง" onClick={() => addBlock("location")} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-[#D9E1F2] bg-white p-4 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.16)]">
          <button
            type="button"
            onClick={() => setShowSettings((prev) => !prev)}
            className="flex w-full items-center justify-between gap-3 text-left"
          >
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">Settings</div>
              <h2 className="mt-1 text-lg font-black text-[#050579]">สถานะการเผยแพร่และธีม</h2>
            </div>
            <Settings2 className="shrink-0 text-[#64748B]" size={18} />
          </button>

          {showSettings ? (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-4">
                <div className="text-sm font-bold text-[#050579]">สถานะการเผยแพร่</div>
                <button
                  type="button"
                  onClick={() => setPage({ ...page, is_published: !page.is_published })}
                  className={`mt-3 inline-flex h-11 items-center rounded-2xl px-4 text-sm font-black text-white ${page.is_published ? "bg-[#10B981]" : "bg-[#EF4444]"}`}
                >
                  {page.is_published ? "เผยแพร่แล้ว" : "ยังไม่เผยแพร่"}
                </button>
              </div>

              <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-4">
                <div className="text-sm font-bold text-[#050579]">สีหลัก</div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {["#4F46E5", "#F97316", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#14B8A6", "#F59E0B"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setPage({
                          ...page,
                          theme_config: { ...page.theme_config, primary_color: color },
                        })
                      }
                      className={`h-10 rounded-xl border ${page.theme_config?.primary_color === color ? "border-[#050579]" : "border-white/0"}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </main>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
}
