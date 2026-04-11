/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import {
  ArrowLeft,
  Bold,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Image as ImageIcon,
  Italic,
  Loader2,
  MapPin,
  MousePointer2,
  Plus,
  Save,
  Settings2,
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
const TEXT_FONT_OPTIONS = ["Arial", "Georgia", "Tahoma", "Verdana", "Trebuchet MS", "Times New Roman", "Courier New"];

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

interface FormOption {
  id: number;
  name: string;
  submission_count?: number;
}

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

function getDefaultBlockContent(type: Block["type"]) {
  if (type === "text") {
    return {
      title: "",
      body: "",
      title_style: {
        color: "#050579",
        fontSize: 32,
        fontFamily: "Arial",
        fontWeight: 900,
        fontStyle: "normal",
      },
      body_style: {
        color: "#475569",
        fontSize: 16,
        fontFamily: "Arial",
        fontWeight: 400,
        fontStyle: "normal",
      },
    };
  }
  if (type === "image") return { url: "", link: "" };
  if (type === "video") return { url: "", autoplay: false };
  if (type === "button") return { text: "", link: "" };
  if (type === "location") return { title: "ที่ตั้งของเรา", address: "", embed_url: "", map_url: "" };
  return { title: "ติดต่อเรา", description: "", mode: "internal", form_id: "", external_url: "" };
}

function TextStyleControls({
  label,
  value,
  onChange,
}: {
  label: string;
  value: any;
  onChange: (next: any) => void;
}) {
  const style = {
    color: value?.color || "#0F172A",
    fontSize: Number(value?.fontSize || 16),
    fontFamily: value?.fontFamily || "Arial",
    fontWeight: Number(value?.fontWeight || 400),
    fontStyle: value?.fontStyle === "italic" ? "italic" : "normal",
  };

  return (
    <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-3">
      <div className="mb-3 text-[10px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">{label}</div>

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-2">
          <span className="block text-[11px] font-black uppercase tracking-[0.12em] text-[#64748B]">สีตัวอักษร</span>
          <input
            type="color"
            value={style.color}
            onChange={(e) => onChange({ ...style, color: e.target.value })}
            className="h-11 w-full rounded-xl border border-[#D9E1F2] bg-white px-2"
          />
        </label>

        <label className="space-y-2">
          <span className="block text-[11px] font-black uppercase tracking-[0.12em] text-[#64748B]">ฟอนต์</span>
          <select
            value={style.fontFamily}
            onChange={(e) => onChange({ ...style, fontFamily: e.target.value })}
            className="h-11 w-full rounded-xl border border-[#D9E1F2] bg-white px-3 text-sm font-bold text-[#0F172A] outline-none"
          >
            {TEXT_FONT_OPTIONS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-3 grid grid-cols-[1fr_auto_auto] gap-3 items-end">
        <label className="space-y-2">
          <span className="block text-[11px] font-black uppercase tracking-[0.12em] text-[#64748B]">
            ขนาดตัวอักษร {style.fontSize}px
          </span>
          <input
            type="range"
            min={12}
            max={72}
            value={style.fontSize}
            onChange={(e) => onChange({ ...style, fontSize: Number(e.target.value) })}
            className="h-11 w-full accent-[#050579]"
          />
        </label>

        <button
          type="button"
          onClick={() => onChange({ ...style, fontWeight: style.fontWeight >= 700 ? 400 : 800 })}
          className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
            style.fontWeight >= 700
              ? "border-[#F97316] bg-[#FFF7ED] text-[#F97316]"
              : "border-[#D9E1F2] bg-white text-[#64748B]"
          }`}
        >
          <Bold size={16} />
        </button>

        <button
          type="button"
          onClick={() => onChange({ ...style, fontStyle: style.fontStyle === "italic" ? "normal" : "italic" })}
          className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
            style.fontStyle === "italic"
              ? "border-[#F97316] bg-[#FFF7ED] text-[#F97316]"
              : "border-[#D9E1F2] bg-white text-[#64748B]"
          }`}
        >
          <Italic size={16} />
        </button>
      </div>
    </div>
  );
}

function RenderBlockEditor({
  block,
  forms,
  onUpdate,
}: {
  block: Block;
  forms: FormOption[];
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
          <TextStyleControls
            label="รูปแบบหัวข้อ"
            value={block.content.title_style}
            onChange={(next) => onUpdate({ ...block.content, title_style: next })}
          />
          <TextStyleControls
            label="รูปแบบเนื้อหา"
            value={block.content.body_style}
            onChange={(next) => onUpdate({ ...block.content, body_style: next })}
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-3">
              <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">โหมดฟอร์ม</div>
              <select
                value={block.content.mode || "internal"}
                onChange={(e) =>
                  onUpdate({
                    ...block.content,
                    mode: e.target.value,
                    form_id: e.target.value === "internal" ? block.content.form_id || "" : "",
                  })
                }
                className="h-11 w-full rounded-xl border border-[#D9E1F2] bg-white px-4 text-sm font-bold text-[#0F172A] outline-none"
              >
                <option value="internal">ฟอร์มในระบบ NEX</option>
                <option value="external">ลิงก์ฟอร์มภายนอก</option>
              </select>
            </div>

            {block.content.mode !== "external" ? (
              <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-3">
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">เลือกฟอร์มจากระบบ</div>
                <select
                  value={block.content.form_id || ""}
                  onChange={(e) => onUpdate({ ...block.content, mode: "internal", form_id: e.target.value })}
                  className="h-11 w-full rounded-xl border border-[#D9E1F2] bg-white px-4 text-sm font-bold text-[#0F172A] outline-none"
                >
                  <option value="">เลือกฟอร์มที่ต้องการใช้</option>
                  {forms.map((form) => (
                    <option key={form.id} value={form.id}>
                      {form.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-3">
                <div className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">ลิงก์ฟอร์มภายนอก</div>
                <input
                  value={block.content.external_url || ""}
                  onChange={(e) => onUpdate({ ...block.content, mode: "external", external_url: e.target.value })}
                  placeholder="https://docs.google.com/forms/..."
                  className="h-11 w-full rounded-xl border border-[#D9E1F2] bg-white px-4 text-sm text-[#0F172A] outline-none"
                />
              </div>
            )}
          </div>
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
          {block.content.mode !== "external" ? (
            <p className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] px-4 py-3 text-xs text-[#64748B]">
              ถ้าเลือกฟอร์มในระบบ ลูกค้าจะกรอกข้อมูลแล้วถูกบันทึกเข้าระบบ leads และ submissions ของคุณโดยตรง
            </p>
          ) : null}
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
      const titleStyle = {
        color: block.content.title_style?.color || primary,
        fontSize: `${block.content.title_style?.fontSize || 32}px`,
        fontFamily: block.content.title_style?.fontFamily || "Arial",
        fontWeight: block.content.title_style?.fontWeight || 900,
        fontStyle: block.content.title_style?.fontStyle || "normal",
      };
      const bodyStyle = {
        color: block.content.body_style?.color || "#475569",
        fontSize: `${block.content.body_style?.fontSize || 16}px`,
        fontFamily: block.content.body_style?.fontFamily || "Arial",
        fontWeight: block.content.body_style?.fontWeight || 400,
        fontStyle: block.content.body_style?.fontStyle || "normal",
      };
      return (
        <section className="px-5 py-8 text-center">
          <h2 className="leading-tight" style={titleStyle}>
            {block.content.title || "หัวข้อ"}
          </h2>
          <p className="mt-4 whitespace-pre-wrap leading-7" style={bodyStyle}>
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
  const [forms, setForms] = useState<FormOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
        const [pageRes, formsRes] = await Promise.all([
          fetch(`${API_URL}/landing-pages/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/forms`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!pageRes.ok) throw new Error("fetch failed");
        const data = await pageRes.json();
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
        if (formsRes.ok) {
          setForms(await formsRes.json());
        }
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
      content: getDefaultBlockContent(type),
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

  const changeBlockType = (blockId: string, nextType: Block["type"]) => {
    if (!page) return;
    const targetBlock = page.content_blocks.find((block) => block.id === blockId);
    if (!targetBlock || targetBlock.type === nextType) return;

    const currentContent = JSON.stringify(targetBlock.content || {});
    const defaultCurrentContent = JSON.stringify(getDefaultBlockContent(targetBlock.type));
    const hasUserContent = currentContent !== defaultCurrentContent;
    if (hasUserContent) {
      const confirmed = window.confirm("การเปลี่ยนประเภท section จะล้างข้อมูลเดิมของ section นี้ ต้องการดำเนินการต่อหรือไม่?");
      if (!confirmed) return;
    }

    setPage({
      ...page,
      content_blocks: page.content_blocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              type: nextType,
              content: getDefaultBlockContent(nextType),
            }
          : block,
      ),
    });
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

  const publicUrl = `${SITE_URL}/lp/${page.id}`;

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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">ข้อมูลหน้า</div>
              <h1 className="mt-1 text-xl font-black leading-tight text-[#050579]">ตั้งค่าพื้นฐานของ Sale Page</h1>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
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
              return (
                <article
                  key={block.id}
                  className="rounded-3xl border border-[#D9E1F2] bg-[#F6F8FF] p-4"
                >
                  <div className="min-w-0">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-xs font-black uppercase tracking-[0.16em] text-[#94A3B8]">
                          section {index + 1}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                        <select
                          value={block.type}
                          onChange={(e) => changeBlockType(block.id, e.target.value as Block["type"])}
                          className="h-10 min-w-0 max-w-full rounded-xl border border-[#D9E1F2] bg-white px-3 text-xs font-bold text-[#050579] outline-none sm:max-w-[180px]"
                        >
                          <option value="text">ข้อความ</option>
                          <option value="image">รูปภาพ</option>
                          <option value="video">วิดีโอ</option>
                          <option value="button">ปุ่ม</option>
                          <option value="form">ฟอร์ม</option>
                          <option value="location">ที่ตั้ง</option>
                        </select>
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

                  <div className="mt-4">
                    <RenderBlockEditor
                      block={block}
                      forms={forms}
                      onUpdate={(content) => updateBlockContent(block.id, content)}
                    />
                  </div>

                  <div className="mt-4 rounded-2xl border border-[#D9E1F2] bg-white p-3">
                    <div className="mb-3">
                      <div>
                        <div className="text-[11px] font-black uppercase tracking-[0.16em] text-[#94A3B8]">
                          Preview
                        </div>
                        <div className="mt-1 text-sm font-bold text-[#050579]">ตัวอย่าง section นี้</div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <div className="w-full max-w-[375px] overflow-hidden rounded-[24px] border border-[#D9E1F2] bg-white shadow-[0_20px_40px_-28px_rgba(15,23,42,0.35)]">
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
