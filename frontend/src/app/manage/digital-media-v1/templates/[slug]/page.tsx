"use client";

import { ChangeEvent, CSSProperties, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { AlertCircle, ArrowLeft, Copy, Download, Image as ImageIcon, Loader2, Sparkles, Upload, Video } from "lucide-react";

interface TemplateCategory {
  id: number;
  name: string;
  slug: string;
}

type FieldType = "text" | "textarea" | "image" | "select" | "color";
type AspectRatio = "1:1" | "4:5" | "9:16" | "16:9";
type MediaType = "image" | "video";

interface TemplateField {
  id: number;
  field_key: string;
  field_label: string;
  field_type: FieldType;
  placeholder: string;
  help_text: string;
  is_required: boolean;
  default_value: string;
  options_json: Array<{ label: string; value: string }>;
  sort_order: number;
}

interface DetailTemplate {
  id: number;
  name: string;
  slug: string;
  description: string;
  cover_image_url: string;
  enable_product_replace: boolean;
  product_mask_url: string;
  category: TemplateCategory | null;
  style_preset: string;
  aspect_ratio: AspectRatio;
  media_type?: MediaType;
  status: "draft" | "active" | "inactive";
  fields: TemplateField[];
}

interface GenerationJobResponse {
  job_id: number;
  status: "pending" | "success" | "failed";
  output_image_url?: string;
  output_video_url?: string;
  error_message?: string;
}

const featureVars: CSSProperties = {
  ["--background" as string]: "#EEF0FF",
  ["--foreground" as string]: "#0F172A",
  ["--primary" as string]: "#050579",
  ["--secondary" as string]: "#475569",
  ["--accent" as string]: "#F97316",
  ["--glass" as string]: "rgba(255, 255, 255, 0.92)",
  ["--glass-border" as string]: "rgba(5, 5, 121, 0.08)",
  ["--card-bg" as string]: "rgba(255, 255, 255, 0.96)",
  ["--glow" as string]: "rgba(249, 115, 22, 0.18)",
};

const shellClass = "surface-panel rounded-[28px] border border-foreground/10 bg-background/75";
const inputClass =
  "w-full rounded-2xl border border-foreground/10 bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/15";
const selectClass = `${inputClass} appearance-none`;
const labelClass = "mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-foreground/45";

export default function DigitalMediaTemplateDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const token = Cookies.get("token");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<DetailTemplate | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationJobId, setGenerationJobId] = useState<number | null>(null);
  const [generationStatusText, setGenerationStatusText] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null);
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationSuccess, setGenerationSuccess] = useState<string | null>(null);
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatio>("9:16");

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    setCheckingAuth(false);
  }, [router, token]);

  useEffect(() => {
    if (!token || checkingAuth || !slug) return;

    const loadTemplate = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/digital-media/templates/${slug}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("โหลด template ไม่สำเร็จ");

        const data = (await res.json()) as DetailTemplate;
        const mediaType: MediaType = data.media_type || "image";
        setTemplate(data);
        setGeneratedImage(null);
        setGeneratedVideo(null);
        setGeneratedPrompt(null);
        setGenerationError(null);
        setGenerationSuccess(null);
        setGenerationJobId(null);
        setGenerationStatusText(null);

        const defaults: Record<string, string> = {};
        for (const field of data.fields || []) {
          defaults[field.field_key] = field.default_value || "";
        }

        if (mediaType === "video") {
          defaults.reference_image_url = defaults.reference_image_url || defaults.reference_image || "";
          defaults.video_prompt = defaults.video_prompt || defaults.prompt || "";
          setSelectedAspectRatio(data.aspect_ratio === "16:9" || data.aspect_ratio === "9:16" ? data.aspect_ratio : "9:16");
        } else {
          const initialAspectRatio = data.aspect_ratio === "4:5" || data.aspect_ratio === "9:16" || data.aspect_ratio === "16:9" ? data.aspect_ratio : "1:1";
          defaults.aspect_ratio = defaults.aspect_ratio || initialAspectRatio;
          setSelectedAspectRatio(defaults.aspect_ratio as AspectRatio);
        }

        setForm(defaults);
      } catch (error) {
        console.error(error);
        setTemplate(null);
      } finally {
        setLoading(false);
      }
    };

    void loadTemplate();
  }, [API_URL, checkingAuth, slug, token]);

  const sortedFields = useMemo(
    () => [...(template?.fields || [])].sort((a, b) => a.sort_order - b.sort_order || a.id - b.id),
    [template?.fields],
  );

  const mediaType: MediaType = (template?.media_type || "image") as MediaType;
  const isVideoTemplate = mediaType === "video";

  const previewRatio = selectedAspectRatio;
  const ratioStyle =
    previewRatio === "16:9"
      ? { aspectRatio: "16 / 9" }
      : previewRatio === "4:5"
        ? { aspectRatio: "4 / 5" }
        : previewRatio === "9:16"
          ? { aspectRatio: "9 / 16" }
          : { aspectRatio: "1 / 1" };

  const updateField = (fieldKey: string, value: string) => {
    setForm((prev) => ({ ...prev, [fieldKey]: value }));
    if (fieldKey === "aspect_ratio" && (value === "1:1" || value === "4:5" || value === "9:16" || value === "16:9")) {
      setSelectedAspectRatio(value as AspectRatio);
    }
    setErrors((prev) => ({ ...prev, [fieldKey]: "" }));
  };

  const handleImageUpload = (fieldKey: string) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const upload = async () => {
      try {
        setUploadingFields((prev) => ({ ...prev, [fieldKey]: true }));
        setErrors((prev) => ({ ...prev, [fieldKey]: "" }));

        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${API_URL}/digital-media/upload-image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "อัปโหลดรูปไม่สำเร็จ");
        }

        const data = (await res.json()) as { url: string };
        updateField(fieldKey, data.url);
      } catch (error) {
        console.error(error);
        setErrors((prev) => ({ ...prev, [fieldKey]: "อัปโหลดรูปไม่สำเร็จ" }));
      } finally {
        setUploadingFields((prev) => ({ ...prev, [fieldKey]: false }));
      }
    };

    void upload();
  };

  const validateForm = () => {
    if (!template) return false;

    const nextErrors: Record<string, string> = {};

    if (isVideoTemplate) {
      if (!(form.reference_image_url || "").trim()) {
        nextErrors.reference_image_url = "กรุณาอัปโหลดรูปอ้างอิง";
      }
      if (!(form.video_prompt || "").trim()) {
        nextErrors.video_prompt = "กรุณากรอกบทพูดหรือ Prompt";
      }
    } else {
      for (const field of sortedFields) {
        if (!field.is_required) continue;
        const value = (form[field.field_key] || "").trim();
        if (!value) {
          nextErrors[field.field_key] = `กรุณากรอก ${field.field_label}`;
        }
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  useEffect(() => {
    if (!generationJobId || !token) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/digital-media/jobs/${generationJobId}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("โหลดสถานะการสร้างไม่สำเร็จ");
        }

        const data = (await res.json()) as GenerationJobResponse;
        if (cancelled) return;

        if (data.status === "success") {
          if (isVideoTemplate && data.output_video_url) {
            setGeneratedVideo(data.output_video_url);
            setGeneratedImage(null);
            setGenerationSuccess("สร้างวิดีโอสำเร็จแล้ว");
            setGenerationError(null);
            setGenerationStatusText(null);
            setGenerationJobId(null);
            setIsGenerating(false);
            return;
          }

          if (!isVideoTemplate && data.output_image_url) {
            setGeneratedImage(data.output_image_url);
            setGeneratedVideo(null);
            setGenerationSuccess("สร้างภาพสำเร็จแล้ว");
            setGenerationError(null);
            setGenerationStatusText(null);
            setGenerationJobId(null);
            setIsGenerating(false);
            return;
          }
        }

        if (data.status === "failed") {
          setGeneratedImage(null);
          setGeneratedVideo(null);
          setGenerationSuccess(null);
          setGenerationError(data.error_message || "สร้างไม่สำเร็จ กรุณาลองใหม่");
          setGenerationStatusText(null);
          setGenerationJobId(null);
          setIsGenerating(false);
          return;
        }

        setGenerationStatusText(
          isVideoTemplate
            ? "กำลังสร้างวิดีโอ 8 วินาที อาจใช้เวลาสักครู่ ระบบจะอัปเดตผลลัพธ์อัตโนมัติ"
            : "กำลังสร้างภาพ อาจใช้ 1-2 นาที ระบบจะอัปเดตผลลัพธ์ให้อัตโนมัติ",
        );
        timeoutId = setTimeout(() => {
          void poll();
        }, 3000);
      } catch (error) {
        console.error(error);
        if (cancelled) return;
        setGenerationError("เช็กสถานะการสร้างไม่สำเร็จ กรุณาลองใหม่");
        setGenerationStatusText(null);
        setGenerationJobId(null);
        setIsGenerating(false);
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [API_URL, generationJobId, isVideoTemplate, token]);

  const buildImagePromptFromTemplate = () => {
    if (!template) return "";

    const valueLines = sortedFields
      .map((field) => {
        const value = (form[field.field_key] || "").trim();
        if (!value) return null;
        return `- ${field.field_label}: ${value}`;
      })
      .filter(Boolean)
      .join("\n");

    const ratioText =
      selectedAspectRatio === "16:9"
        ? "16:9"
        : selectedAspectRatio === "4:5"
          ? "4:5"
          : selectedAspectRatio === "9:16"
            ? "9:16"
            : "1:1";

    return [
      `Use this template as the creative direction: "${template.name}".`,
      template.description ? `Template description: ${template.description}` : null,
      template.style_preset ? `Style preset: ${template.style_preset}` : null,
      `Target aspect ratio: ${ratioText}.`,
      "",
      "Use the following input values:",
      valueLines || "- (no field values provided)",
      "",
      "Output requirements:",
      "- Create one polished marketing image.",
      "- Keep composition and visual hierarchy aligned with the template direction.",
      "- Use provided image URL fields as reference/product images when available.",
      "- Preserve provided text as the main copy on artwork.",
    ]
      .filter(Boolean)
      .join("\n");
  };

  const handleCopyPrompt = async () => {
    if (!generatedPrompt) return;

    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setGenerationSuccess("คัดลอก Prompt แล้ว");
      setGenerationError(null);
    } catch (error) {
      console.error(error);
      setGenerationError("คัดลอก Prompt ไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  const handlePrimaryAction = async () => {
    if (!template) return;
    if (!validateForm()) return;

    if (!isVideoTemplate) {
      const promptText = buildImagePromptFromTemplate();
      setGeneratedPrompt(promptText);
      setGeneratedImage(null);
      setGeneratedVideo(null);
      setGenerationJobId(null);
      setGenerationStatusText(null);
      setGenerationError(null);
      setGenerationSuccess("สร้าง Prompt สำเร็จแล้ว");
      setIsGenerating(false);
      return;
    }

    try {
      const inputPayload = isVideoTemplate
        ? {
            reference_image_url: (form.reference_image_url || "").trim(),
            video_prompt: (form.video_prompt || "").trim(),
            prompt: (form.video_prompt || "").trim(),
          }
        : form;

      const targetAspectRatio = isVideoTemplate ? (selectedAspectRatio === "16:9" ? "16:9" : "9:16") : (selectedAspectRatio === "4:5" || selectedAspectRatio === "9:16" || selectedAspectRatio === "16:9" ? selectedAspectRatio : "1:1");

      setIsGenerating(true);
      setGenerationJobId(null);
      setGeneratedImage(null);
      setGeneratedVideo(null);
      setGeneratedPrompt(null);
      setGenerationError(null);
      setGenerationSuccess(null);
      setGenerationStatusText(
        isVideoTemplate ? "กำลังส่งงานสร้างวิดีโอ 8 วินาที" : "กำลังส่งงานสร้างภาพ อาจใช้ 1-2 นาที",
      );

      const controller = new AbortController();
      const kickoffTimeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${API_URL}/digital-media/generate-async`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          template_slug: template.slug,
          input: inputPayload,
          aspect_ratio: targetAspectRatio,
          prompt_override: isVideoTemplate ? (form.video_prompt || "").trim() : undefined,
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(kickoffTimeout));

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "สร้างไม่สำเร็จ");
      }

      const data = (await res.json()) as GenerationJobResponse;
      setGenerationJobId(data.job_id);
      setGenerationStatusText(
        isVideoTemplate
          ? "กำลังสร้างวิดีโอ 8 วินาที อาจใช้เวลาสักครู่ ระบบจะอัปเดตผลลัพธ์อัตโนมัติ"
          : "กำลังสร้างภาพ อาจใช้ 1-2 นาที ระบบจะอัปเดตผลลัพธ์ให้อัตโนมัติ",
      );
    } catch (error) {
      console.error(error);
      setGeneratedImage(null);
      setGeneratedVideo(null);
      setGenerationJobId(null);
      setGenerationStatusText(null);
      setGenerationError(
        error instanceof Error && error.name === "AbortError"
          ? "เริ่มงานช้ากว่าปกติ กรุณาลองใหม่อีกครั้ง"
          : "สร้างไม่สำเร็จ กรุณาตรวจ API และลองใหม่",
      );
      setIsGenerating(false);
    }
  };

  const handleDownloadGeneratedImage = async () => {
    if (!generatedImage) return;

    try {
      const link = document.createElement("a");
      link.href = generatedImage;
      link.download = `${template?.slug || "digital-media"}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      setGenerationError("ดาวน์โหลดรูปไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  const handleDownloadGeneratedVideo = async () => {
    if (!generatedVideo) return;

    try {
      const link = document.createElement("a");
      link.href = generatedVideo;
      link.download = `${template?.slug || "digital-media"}-${Date.now()}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
      setGenerationError("บันทึกวิดีโอไม่สำเร็จ กรุณาลองใหม่");
    }
  };

  const renderField = (field: TemplateField) => {
    if (field.field_type === "image") {
      return (
        <label key={field.id} className="block">
          <span className={labelClass}>
            {field.field_label}
            {field.is_required ? " *" : ""}
          </span>
          <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-foreground/15 bg-white p-4">
            <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-sm font-semibold text-foreground/70">
              <Upload size={15} />
              {uploadingFields[field.field_key] ? "กำลังอัปโหลด..." : "อัปโหลดรูป"}
              <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload(field.field_key)} />
            </label>
            {form[field.field_key] ? (
              <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-background/50 p-3">
                <img
                  src={form[field.field_key]}
                  alt={`${field.field_label} preview`}
                  className="h-52 w-full rounded-xl object-contain sm:h-64"
                />
              </div>
            ) : null}
          </div>
          {field.help_text ? <p className="mt-2 text-xs text-foreground/50">{field.help_text}</p> : null}
          {errors[field.field_key] ? <p className="mt-2 text-sm text-red-500">{errors[field.field_key]}</p> : null}
        </label>
      );
    }

    if (field.field_type === "textarea") {
      return (
        <label key={field.id} className="block">
          <span className={labelClass}>
            {field.field_label}
            {field.is_required ? " *" : ""}
          </span>
          <textarea
            value={form[field.field_key] || ""}
            onChange={(event) => updateField(field.field_key, event.target.value)}
            className={`${inputClass} min-h-[96px] resize-none`}
            placeholder={field.placeholder || ""}
          />
          {field.help_text ? <p className="mt-2 text-xs text-foreground/50">{field.help_text}</p> : null}
          {errors[field.field_key] ? <p className="mt-2 text-sm text-red-500">{errors[field.field_key]}</p> : null}
        </label>
      );
    }

    if (field.field_type === "select") {
      const options = Array.isArray(field.options_json) ? field.options_json : [];
      return (
        <label key={field.id} className="block">
          <span className={labelClass}>
            {field.field_label}
            {field.is_required ? " *" : ""}
          </span>
          <select
            value={form[field.field_key] || ""}
            onChange={(event) => updateField(field.field_key, event.target.value)}
            className={selectClass}
          >
            <option value="">เลือก</option>
            {options.map((option, index) => (
              <option key={`${field.id}-${index}`} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {field.help_text ? <p className="mt-2 text-xs text-foreground/50">{field.help_text}</p> : null}
          {errors[field.field_key] ? <p className="mt-2 text-sm text-red-500">{errors[field.field_key]}</p> : null}
        </label>
      );
    }

    if (field.field_type === "color") {
      return (
        <label key={field.id} className="block">
          <span className={labelClass}>
            {field.field_label}
            {field.is_required ? " *" : ""}
          </span>
          <div className="flex items-center gap-3 rounded-2xl border border-foreground/10 bg-white px-4 py-3">
            <input
              type="color"
              value={form[field.field_key] || "#050579"}
              onChange={(event) => updateField(field.field_key, event.target.value)}
              className="h-9 w-12 cursor-pointer rounded border border-foreground/10 bg-white"
            />
            <input
              type="text"
              value={form[field.field_key] || ""}
              onChange={(event) => updateField(field.field_key, event.target.value)}
              className="w-full text-sm text-foreground outline-none"
              placeholder="#050579"
            />
          </div>
          {field.help_text ? <p className="mt-2 text-xs text-foreground/50">{field.help_text}</p> : null}
          {errors[field.field_key] ? <p className="mt-2 text-sm text-red-500">{errors[field.field_key]}</p> : null}
        </label>
      );
    }

    return (
      <label key={field.id} className="block">
        <span className={labelClass}>
          {field.field_label}
          {field.is_required ? " *" : ""}
        </span>
        <input
          value={form[field.field_key] || ""}
          onChange={(event) => updateField(field.field_key, event.target.value)}
          className={inputClass}
          placeholder={field.placeholder || ""}
        />
        {field.help_text ? <p className="mt-2 text-xs text-foreground/50">{field.help_text}</p> : null}
        {errors[field.field_key] ? <p className="mt-2 text-sm text-red-500">{errors[field.field_key]}</p> : null}
      </label>
    );
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background text-foreground" style={featureVars}>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={28} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground" style={featureVars}>
      <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/manage/digital-media-v1"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-foreground/10 bg-white text-foreground/65 transition-all hover:border-primary/30 hover:text-primary"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground/40">NEX Digital Media</p>
              <h1 className="truncate text-base font-black text-primary sm:text-lg">Template Detail</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-5 sm:px-6 sm:py-6">
        {loading ? (
          <div className={`${shellClass} flex min-h-[320px] items-center justify-center p-6`}>
            <Loader2 className="animate-spin text-primary" size={28} />
          </div>
        ) : !template ? (
          <div className={`${shellClass} p-6 text-center`}>
            <AlertCircle className="mx-auto text-primary/50" size={26} />
            <p className="mt-3 text-base font-bold text-foreground/70">ไม่พบ template ที่ต้องการ</p>
            <Link
              href="/manage/digital-media-v1"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary"
            >
              กลับไปเลือก template
            </Link>
          </div>
        ) : (
          <div className="space-y-5 pb-28">
            <section className={`${shellClass} overflow-hidden p-5 sm:p-6`}>
              <div className="space-y-4">
                <div className="mx-auto w-full max-w-[340px]">
                  <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-indigo-500 to-blue-600" style={ratioStyle}>
                    {template.cover_image_url ? (
                      <img src={template.cover_image_url} alt={`${template.name} template preview`} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-white/90">
                        {isVideoTemplate ? <Video size={34} /> : <ImageIcon size={34} />}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[22px] border border-foreground/10 bg-white px-4 py-3">
                  <p className="text-center text-2xl font-black text-primary">{template.name}</p>
                  <p className="mt-1 text-center text-sm text-foreground/65">
                    {template.description || (isVideoTemplate ? "อัปโหลดรูปอ้างอิงและใส่บทพูดเพื่อสร้างวิดีโอ" : "กรอกข้อมูลแล้วสร้าง Prompt เพื่อคัดลอกไปใช้ภายนอก")}
                  </p>
                </div>
              </div>
            </section>

            <section className={`${shellClass} p-5 sm:p-6`}>
              <div className="mb-4">
                <h3 className="text-lg font-black text-primary">{isVideoTemplate ? "ตั้งค่าวิดีโอ" : "กรอกข้อมูล"}</h3>
                <p className="mt-1 text-sm text-foreground/65">
                  {isVideoTemplate ? "Image to Video: รูปอ้างอิง + บทพูด + อัตราส่วน (8 วินาทีคงที่)" : "กรอกข้อมูลตามฟอร์ม แล้วระบบจะสร้าง Prompt ให้คัดลอก"}
                </p>
              </div>

              {isVideoTemplate ? (
                <div className="space-y-4">
                  <label className="block">
                    <span className={labelClass}>รูปอ้างอิง *</span>
                    <div className="flex flex-col gap-3 rounded-2xl border border-dashed border-foreground/15 bg-white p-4">
                      <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-foreground/10 bg-background px-4 py-3 text-sm font-semibold text-foreground/70">
                        <Upload size={15} />
                        {uploadingFields.reference_image_url ? "กำลังอัปโหลด..." : "อัปโหลดรูปอ้างอิง"}
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload("reference_image_url")} />
                      </label>
                      {form.reference_image_url ? (
                        <div className="overflow-hidden rounded-2xl border border-foreground/10 bg-background/50 p-3">
                          <img src={form.reference_image_url} alt="Reference preview" className="h-52 w-full rounded-xl object-contain sm:h-64" />
                        </div>
                      ) : null}
                    </div>
                    {errors.reference_image_url ? <p className="mt-2 text-sm text-red-500">{errors.reference_image_url}</p> : null}
                  </label>

                  <label className="block">
                    <span className={labelClass}>บทพูด / Prompt *</span>
                    <textarea
                      value={form.video_prompt || ""}
                      onChange={(event) => updateField("video_prompt", event.target.value)}
                      className={`${inputClass} min-h-[110px] resize-none`}
                      placeholder="เช่น ผู้หญิงยิ้มและพูดว่า สวัสดีค่ะ วันนี้เรามาแนะนำโครงการบ้านรุ่นใหม่..."
                    />
                    {errors.video_prompt ? <p className="mt-2 text-sm text-red-500">{errors.video_prompt}</p> : null}
                  </label>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className={labelClass}>อัตราส่วนวิดีโอ</span>
                      <select
                        value={selectedAspectRatio === "16:9" ? "16:9" : "9:16"}
                        onChange={(event) => setSelectedAspectRatio(event.target.value === "16:9" ? "16:9" : "9:16")}
                        className={selectClass}
                      >
                        <option value="9:16">9:16 (แนะนำสำหรับมือถือ)</option>
                        <option value="16:9">16:9</option>
                      </select>
                    </label>

                    <div className="block">
                      <span className={labelClass}>ความยาววิดีโอ</span>
                      <div className="rounded-2xl border border-foreground/10 bg-white px-4 py-3 text-sm font-semibold text-foreground/70">8 วินาที (คงที่)</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">{sortedFields.map((field) => renderField(field))}</div>
              )}
            </section>

            {generatedPrompt ? (
              <section className={`${shellClass} p-5 sm:p-6`}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-primary">Prompt ที่สร้างล่าสุด</h3>
                    <p className="mt-1 text-sm text-foreground/65">คัดลอกแล้วนำไปวางในแพลตฟอร์มอื่นเพื่อสร้างภาพต่อได้ทันที</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyPrompt}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-primary/15 bg-primary px-4 py-2.5 text-sm font-black text-white"
                  >
                    <Copy size={15} />
                    คัดลอก Prompt
                  </button>
                </div>
                <textarea value={generatedPrompt} readOnly className={`${inputClass} min-h-[260px] resize-y font-mono text-xs leading-6`} />
              </section>
            ) : null}

            {generatedImage || generatedVideo ? (
              <section className={`${shellClass} p-5 sm:p-6`}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-black text-primary">ผลลัพธ์ที่สร้างล่าสุด</h3>
                    <p className="mt-1 text-sm text-foreground/65">
                      {generatedVideo ? "ถ้าคลิปถูกต้องแล้ว สามารถบันทึกได้ทันที" : "ถ้าภาพนี้ถูกต้องแล้ว สามารถดาวน์โหลดลงเครื่องได้ทันที"}
                    </p>
                  </div>
                  {generatedVideo ? (
                    <button
                      type="button"
                      onClick={handleDownloadGeneratedVideo}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-primary/15 bg-primary px-4 py-2.5 text-sm font-black text-white"
                    >
                      <Download size={15} />
                      บันทึกคลิป
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDownloadGeneratedImage}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl border border-primary/15 bg-primary px-4 py-2.5 text-sm font-black text-white"
                    >
                      <Download size={15} />
                      ดาวน์โหลด
                    </button>
                  )}
                </div>

                <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-[22px] border border-foreground/10 bg-white p-3">
                  <div className="overflow-hidden rounded-[18px] border border-foreground/10" style={ratioStyle}>
                    {generatedVideo ? (
                      <video src={generatedVideo} controls playsInline className="h-full w-full object-cover" />
                    ) : generatedImage ? (
                      <img src={generatedImage} alt="Generated output preview" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                </div>
              </section>
            ) : null}
          </div>
        )}
      </main>

      {template ? (
        <div className="sticky bottom-0 z-30 border-t border-foreground/10 bg-background/95 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="mx-auto flex max-w-3xl flex-col">
            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={isGenerating}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-black text-white shadow-lg shadow-[var(--glow)] transition-all hover:opacity-95 disabled:opacity-60"
            >
              {isGenerating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
              {isGenerating
                ? isVideoTemplate
                  ? "กำลังสร้างวิดีโอ..."
                  : "กำลังสร้าง Prompt..."
                : isVideoTemplate
                  ? "สร้างวิดีโอจากข้อมูลนี้"
                  : "สร้าง Prompt จากข้อมูลนี้"}
            </button>
            {generationSuccess ? <p className="mt-2 text-sm text-green-600">{generationSuccess}</p> : null}
            {generationStatusText ? <p className="mt-2 text-sm text-[#050579]">{generationStatusText}</p> : null}
            {generationError ? <p className="mt-2 text-sm text-red-500">{generationError}</p> : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
