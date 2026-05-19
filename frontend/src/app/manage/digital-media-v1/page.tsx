"use client";

import { ChangeEvent, CSSProperties, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { ArrowLeft, CheckCircle2, ChevronDown, ChevronUp, Download, Image as ImageIcon, Loader2, Plus, Search, Sparkles, Trash2, Upload, User, Video } from "lucide-react";

interface TemplateCategory {
  id: number;
  name: string;
  slug: string;
}

type MediaType = "image" | "video";
type VideoRatio = "9:16" | "16:9";
type VideoResolution = "720p" | "1080p";
type ImageRatio = "1:1" | "4:5" | "9:16" | "16:9";
type ImageMode = "template" | "prompt";

interface CharacterProfile {
  id: string;
  gender: "female" | "male";
  voiceStyle: string;
}

const CHARACTERS_KEY = "nex_video_characters";
const VIDEO_SETTINGS_KEY = "nex_video_settings";

const VOICE_PRESETS = [
  { label: "มืออาชีพ / นักนำเสนอ", value: "professional presenter, clear and confident, measured speaking pace" },
  { label: "สดใส / กระตือรือร้น", value: "energetic and enthusiastic, upbeat and expressive delivery" },
  { label: "นักข่าว / ทางการ", value: "news anchor style, formal and authoritative, precise diction" },
  { label: "อบอุ่น / เป็นกันเอง", value: "warm and friendly conversational tone, relatable and approachable" },
  { label: "บรรยาย / เล่าเรื่อง", value: "storytelling narrator, engaging and expressive, smooth delivery" },
  { label: "ขายสินค้า / โฆษณา", value: "persuasive sales style, enthusiastic, clear call-to-action emphasis" },
] as const;

interface GalleryTemplate {
  id: number;
  name: string;
  slug: string;
  description: string;
  cover_image_url: string;
  cover_thumb_url?: string | null;
  preview_video_url?: string | null;
  media_type?: MediaType;
  category: TemplateCategory | null;
  aspect_ratio: string;
  status: "draft" | "active" | "inactive";
}

interface DailyQuotaStatus {
  limit: number;
  used: number;
  remaining: number | null;
  unlimited: boolean;
}

const featureVars: CSSProperties = {
  ["--background" as string]: "#EEF0FF",
  ["--foreground" as string]: "#0F172A",
  ["--primary" as string]: "#050579",
  ["--secondary" as string]: "#475569",
  ["--accent" as string]: "#F97316",
  ["--glass-border" as string]: "rgba(5, 5, 121, 0.10)",
  ["--glow" as string]: "rgba(249, 115, 22, 0.18)",
};

const fallbackGradients = ["from-blue-500 to-indigo-600", "from-cyan-500 to-blue-500", "from-violet-500 to-fuchsia-500", "from-emerald-500 to-teal-600", "from-slate-500 to-slate-700"];

export default function DigitalMediaLibraryPage() {
  const router = useRouter();
  const token = Cookies.get("token");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<"super_admin" | "group_admin" | "user" | null>(null);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<GalleryTemplate[]>([]);
  const [mediaMode, setMediaMode] = useState<MediaType>("image");
  const [imageMode, setImageMode] = useState<ImageMode>("template");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [thumbFallbackIds, setThumbFallbackIds] = useState<number[]>([]);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageAspectRatio, setImageAspectRatio] = useState<ImageRatio>("1:1");
  const [imageReferenceUrls, setImageReferenceUrls] = useState<string[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageGenerating, setImageGenerating] = useState(false);
  const [imageGenerationJobId, setImageGenerationJobId] = useState<number | null>(null);
  const [imageOutputUrl, setImageOutputUrl] = useState<string | null>(null);
  const [imageStatusText, setImageStatusText] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [videoReferenceImageUrl, setVideoReferenceImageUrl] = useState("");
  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoAspectRatio, setVideoAspectRatio] = useState<VideoRatio>("9:16");
  const [videoResolution, setVideoResolution] = useState<VideoResolution>("720p");
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [videoGenerationJobId, setVideoGenerationJobId] = useState<number | null>(null);
  const [videoOutputUrl, setVideoOutputUrl] = useState<string | null>(null);
  const [videoStatusText, setVideoStatusText] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [dailyQuota, setDailyQuota] = useState<DailyQuotaStatus | null>(null);

  const [characters, setCharacters] = useState<CharacterProfile[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string | null>(null);
  const [showCharacterPanel, setShowCharacterPanel] = useState(false);
  const [showNewCharacterForm, setShowNewCharacterForm] = useState(false);
  const [newCharacterGender, setNewCharacterGender] = useState<"female" | "male">("female");
  const [newCharacterVoiceStyle, setNewCharacterVoiceStyle] = useState<string>(VOICE_PRESETS[0].value);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CHARACTERS_KEY);
      if (stored) setCharacters(JSON.parse(stored) as CharacterProfile[]);
    } catch {}
    try {
      const settings = localStorage.getItem(VIDEO_SETTINGS_KEY);
      if (settings) {
        const parsed = JSON.parse(settings) as { characterId?: string; resolution?: string; aspectRatio?: string };
        if (parsed.characterId) setSelectedCharacterId(parsed.characterId);
        if (parsed.resolution === "1080p" || parsed.resolution === "720p") setVideoResolution(parsed.resolution);
        if (parsed.aspectRatio === "16:9" || parsed.aspectRatio === "9:16") setVideoAspectRatio(parsed.aspectRatio);
      }
    } catch {}
  }, []);

  const saveCharacters = (updated: CharacterProfile[]) => {
    setCharacters(updated);
    localStorage.setItem(CHARACTERS_KEY, JSON.stringify(updated));
  };

  const saveVideoSettings = (patch: { characterId?: string | null; resolution?: string; aspectRatio?: string }) => {
    try {
      const current = JSON.parse(localStorage.getItem(VIDEO_SETTINGS_KEY) || "{}") as Record<string, string>;
      const updated = { ...current, ...patch };
      if (patch.characterId === null) delete updated.characterId;
      localStorage.setItem(VIDEO_SETTINGS_KEY, JSON.stringify(updated));
    } catch {}
  };

  const handleAddCharacter = () => {
    const newChar: CharacterProfile = {
      id: Date.now().toString(),
      gender: newCharacterGender,
      voiceStyle: newCharacterVoiceStyle,
    };
    saveCharacters([...characters, newChar]);
    setNewCharacterGender("female");
    setNewCharacterVoiceStyle(VOICE_PRESETS[0].value);
    setShowNewCharacterForm(false);
  };

  const handleDeleteCharacter = (id: string) => {
    saveCharacters(characters.filter((c) => c.id !== id));
    if (selectedCharacterId === id) {
      setSelectedCharacterId(null);
      saveVideoSettings({ characterId: null });
    }
  };

  const buildVideoPrompt = () => {
    const char = characters.find((c) => c.id === selectedCharacterId);
    if (!char) return videoPrompt.trim();
    const genderText = char.gender === "female" ? "Thai female voice" : "Thai male voice";
    return `${genderText}, ${char.voiceStyle}. ${videoPrompt.trim()}`;
  };

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    const loadMe = async () => {
      try {
        const res = await fetch(`${API_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!res.ok) {
          if (res.status === 401) {
            router.push("/login");
            return;
          }
          throw new Error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ");
        }

        const data = (await res.json()) as {
          user?: {
            role?: "super_admin" | "group_admin" | "user";
          };
        };

        setCurrentUserRole(data.user?.role || "user");
      } catch (error) {
        console.error(error);
        setCurrentUserRole("user");
      } finally {
        setCheckingAuth(false);
      }
    };

    void loadMe();
  }, [API_URL, router, token]);

  useEffect(() => {
    setSelectedCategory("all");
    setSelectedTemplateId(null);
    setThumbFallbackIds([]);
    setSearchQuery("");
    if (mediaMode === "image") {
      setImageMode("template");
    }
  }, [mediaMode]);

  useEffect(() => {
    if (!token || checkingAuth || mediaMode !== "image") return;

    const loadTemplates = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/digital-media/templates?include_details=0&media_type=image`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("โหลดเทมเพลตไม่สำเร็จ");
        const data = (await res.json()) as GalleryTemplate[];
        setTemplates(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    void loadTemplates();
  }, [API_URL, checkingAuth, token, mediaMode]);

  useEffect(() => {
    if (!token || checkingAuth) return;

    const loadQuota = async () => {
      try {
        const res = await fetch(`${API_URL}/digital-media/daily-quota`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });
        if (!res.ok) throw new Error("โหลดโควตารายวันไม่สำเร็จ");
        const data = (await res.json()) as DailyQuotaStatus;
        setDailyQuota(data);
      } catch (error) {
        console.error(error);
      }
    };

    void loadQuota();
  }, [API_URL, checkingAuth, token]);

  const categories = useMemo(() => {
    const map = new Map<string, string>();
    for (const template of templates) {
      if (template.category?.slug && template.category?.name) {
        map.set(template.category.slug, template.category.name);
      }
    }
    return [{ slug: "all", name: "ทั้งหมด" }, ...Array.from(map.entries()).map(([slug, name]) => ({ slug, name }))];
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    return templates.filter((template) => {
      const categoryMatch = selectedCategory === "all" || template.category?.slug === selectedCategory;
      if (!categoryMatch) return false;
      if (!keyword) return true;
      return [template.name, template.description, template.category?.name || ""].join(" ").toLowerCase().includes(keyword);
    });
  }, [searchQuery, selectedCategory, templates]);

  const groupedTemplates = useMemo(() => {
    const groups = new Map<string, { categoryLabel: string; items: GalleryTemplate[] }>();
    for (const template of filteredTemplates) {
      const slug = template.category?.slug || "uncategorized";
      const categoryLabel = template.category?.name || "อื่น ๆ";
      if (!groups.has(slug)) groups.set(slug, { categoryLabel, items: [] });
      groups.get(slug)?.items.push(template);
    }
    return Array.from(groups.entries()).map(([slug, value]) => ({ slug, ...value }));
  }, [filteredTemplates]);

  const selectedTemplate = useMemo(() => templates.find((template) => template.id === selectedTemplateId) || null, [selectedTemplateId, templates]);

  const ratioStyle = videoAspectRatio === "16:9" ? { aspectRatio: "16 / 9" } : { aspectRatio: "9 / 16" };
  const videoFrameClassName =
    videoAspectRatio === "16:9"
      ? "mx-auto w-full max-w-[760px]"
      : "mx-auto w-full max-w-[360px] sm:max-w-[400px]";
  const isSuperAdmin = currentUserRole === "super_admin";
  const isAdmin = currentUserRole === "super_admin" || currentUserRole === "group_admin";
  const isUnlimited = dailyQuota?.unlimited || isAdmin;
  const noQuotaRemaining = !isUnlimited && dailyQuota !== null && (dailyQuota.remaining ?? 0) <= 0;

  const handleVideoReferenceUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setVideoUploading(true);
      setVideoError(null);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${API_URL}/digital-media/upload-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "อัปโหลดรูปไม่สำเร็จ");
      }

      const data = (await res.json()) as { url: string };
      setVideoReferenceImageUrl(data.url || "");
    } catch (error) {
      console.error(error);
      setVideoError("อัปโหลดรูปอ้างอิงไม่สำเร็จ");
    } finally {
      setVideoUploading(false);
    }
  };

  const handleImageReferenceUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;
    if (imageReferenceUrls.length >= 6) {
      setImageError("อัปโหลดได้สูงสุด 6 รูป");
      return;
    }

    try {
      setImageUploading(true);
      setImageError(null);
      const remaining = Math.max(0, 6 - imageReferenceUrls.length);
      const selected = files.slice(0, remaining);

      const uploaded: string[] = [];
      for (const file of selected) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`${API_URL}/digital-media/upload-image`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "อัปโหลดรูปไม่สำเร็จ");
        }

        const data = (await res.json()) as { url: string };
        if (data.url) uploaded.push(data.url);
      }

      if (uploaded.length > 0) {
        setImageReferenceUrls((prev) => [...prev, ...uploaded].slice(0, 6));
      }
    } catch (error) {
      console.error(error);
      setImageError("อัปโหลดรูปอ้างอิงไม่สำเร็จ");
    } finally {
      setImageUploading(false);
      event.currentTarget.value = "";
    }
  };

  useEffect(() => {
    if (!videoGenerationJobId || !token) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/digital-media/jobs/${videoGenerationJobId}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("โหลดสถานะการสร้างวิดีโอไม่สำเร็จ");
        }

        const data = (await res.json()) as {
          status?: "pending" | "success" | "failed";
          output_video_url?: string;
          error_message?: string;
        };

        if (cancelled) return;

        if (data.status === "success" && data.output_video_url) {
          setVideoOutputUrl(data.output_video_url);
          setVideoStatusText("สร้างวิดีโอสำเร็จแล้ว");
          setVideoError(null);
          setVideoGenerationJobId(null);
          setVideoGenerating(false);
          return;
        }

        if (data.status === "failed") {
          setVideoStatusText(null);
          setVideoError(data.error_message || "สร้างวิดีโอไม่สำเร็จ");
          setVideoGenerationJobId(null);
          setVideoGenerating(false);
          return;
        }

        setVideoStatusText("กำลังสร้างวิดีโอ 8 วินาที อาจใช้เวลาสักครู่ ระบบจะอัปเดตผลลัพธ์อัตโนมัติ");
        timeoutId = setTimeout(() => {
          void poll();
        }, 3000);
      } catch (error) {
        console.error(error);
        if (cancelled) return;
        setVideoStatusText(null);
        setVideoError("เช็กสถานะการสร้างวิดีโอไม่สำเร็จ กรุณาลองใหม่");
        setVideoGenerationJobId(null);
        setVideoGenerating(false);
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [API_URL, token, videoGenerationJobId]);

  useEffect(() => {
    if (!imageGenerationJobId || !token) return;

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const res = await fetch(`${API_URL}/digital-media/jobs/${imageGenerationJobId}`, {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("โหลดสถานะการสร้างภาพไม่สำเร็จ");
        }

        const data = (await res.json()) as {
          status?: "pending" | "success" | "failed";
          output_image_url?: string;
          error_message?: string;
        };

        if (cancelled) return;

        if (data.status === "success" && data.output_image_url) {
          setImageOutputUrl(data.output_image_url);
          setImageStatusText("สร้างภาพสำเร็จแล้ว");
          setImageError(null);
          setImageGenerationJobId(null);
          setImageGenerating(false);
          return;
        }

        if (data.status === "failed") {
          setImageStatusText(null);
          setImageError(data.error_message || "สร้างภาพไม่สำเร็จ");
          setImageGenerationJobId(null);
          setImageGenerating(false);
          return;
        }

        setImageStatusText("กำลังสร้างภาพจาก prompt ระบบจะอัปเดตผลลัพธ์อัตโนมัติ");
        timeoutId = setTimeout(() => {
          void poll();
        }, 3000);
      } catch (error) {
        console.error(error);
        if (cancelled) return;
        setImageStatusText(null);
        setImageError("เช็กสถานะการสร้างภาพไม่สำเร็จ กรุณาลองใหม่");
        setImageGenerationJobId(null);
        setImageGenerating(false);
      }
    };

    void poll();

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [API_URL, imageGenerationJobId, token]);

  const handleGenerateVideo = async () => {
    if (!isAdmin) {
      setVideoError("Coming soon");
      return;
    }

    if (!videoReferenceImageUrl.trim()) {
      setVideoError("กรุณาอัปโหลดรูปอ้างอิงก่อน");
      return;
    }
    if (!videoPrompt.trim()) {
      setVideoError("กรุณากรอกบทพูดหรือ Prompt");
      return;
    }

    try {
      setVideoGenerating(true);
      setVideoGenerationJobId(null);
      setVideoError(null);
      setVideoOutputUrl(null);
      setVideoStatusText("กำลังส่งงานสร้างวิดีโอ 8 วินาที");

      const controller = new AbortController();
      const kickoffTimeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${API_URL}/digital-media/video/generate-async`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reference_image_url: videoReferenceImageUrl,
          prompt: buildVideoPrompt(),
          aspect_ratio: videoAspectRatio,
          resolution: videoResolution,
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(kickoffTimeout));

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "สร้างวิดีโอไม่สำเร็จ");
      }

      const data = (await res.json()) as { job_id?: number };
      if (!data.job_id) {
        throw new Error("ระบบไม่ได้ส่ง job กลับมา");
      }

      setDailyQuota((prev) =>
        prev && !prev.unlimited
          ? { ...prev, used: prev.used + 1, remaining: Math.max(0, (prev.remaining ?? 0) - 1) }
          : prev,
      );
      setVideoGenerationJobId(data.job_id);
      setVideoStatusText("กำลังสร้างวิดีโอ 8 วินาที อาจใช้เวลาสักครู่ ระบบจะอัปเดตผลลัพธ์อัตโนมัติ");
    } catch (error) {
      console.error(error);
      setVideoStatusText(null);
      setVideoError(
        error instanceof Error && error.name === "AbortError"
          ? "เริ่มงานวิดีโอช้ากว่าปกติ กรุณาลองใหม่อีกครั้ง"
          : error instanceof Error
            ? error.message
            : "สร้างวิดีโอไม่สำเร็จ",
      );
      setVideoGenerating(false);
    }
  };

  const handleSaveVideo = () => {
    if (!videoOutputUrl) return;
    const link = document.createElement("a");
    link.href = videoOutputUrl;
    link.download = `video-${Date.now()}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGeneratePromptImage = async () => {
    if (!imagePrompt.trim()) {
      setImageError("กรุณากรอก Prompt");
      return;
    }

    try {
      setImageGenerating(true);
      setImageGenerationJobId(null);
      setImageError(null);
      setImageOutputUrl(null);
      setImageStatusText("กำลังส่งงานสร้างภาพจาก prompt");

      const controller = new AbortController();
      const kickoffTimeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(`${API_URL}/digital-media/image/generate-async`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          reference_image_urls: imageReferenceUrls,
          aspect_ratio: imageAspectRatio,
        }),
        signal: controller.signal,
      }).finally(() => clearTimeout(kickoffTimeout));

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "สร้างภาพไม่สำเร็จ");
      }

      const data = (await res.json()) as { job_id?: number };
      if (!data.job_id) {
        throw new Error("ระบบไม่ได้ส่ง job กลับมา");
      }

      setDailyQuota((prev) =>
        prev && !prev.unlimited
          ? { ...prev, used: prev.used + 1, remaining: Math.max(0, (prev.remaining ?? 0) - 1) }
          : prev,
      );
      setImageGenerationJobId(data.job_id);
      setImageStatusText("กำลังสร้างภาพจาก prompt ระบบจะอัปเดตผลลัพธ์อัตโนมัติ");
    } catch (error) {
      console.error(error);
      setImageStatusText(null);
      setImageError(
        error instanceof Error && error.name === "AbortError"
          ? "เริ่มงานภาพช้ากว่าปกติ กรุณาลองใหม่อีกครั้ง"
          : error instanceof Error
            ? error.message
            : "สร้างภาพไม่สำเร็จ",
      );
      setImageGenerating(false);
    }
  };

  const handleRemoveImageReference = (index: number) => {
    setImageReferenceUrls((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveGeneratedImage = () => {
    if (!imageOutputUrl) return;
    const link = document.createElement("a");
    link.href = imageOutputUrl;
    link.download = `image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
      <header className="sticky top-0 z-40 border-b border-foreground/10 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4 sm:px-6">
          <Link href="/manage/control" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-foreground/10 bg-white text-foreground/65 transition-all hover:border-primary/30 hover:text-primary">
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground/40">NEX Digital Media</p>
            <h1 className="truncate text-base font-black text-foreground sm:text-lg">คลังเทมเพลตพร้อมใช้</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-4 sm:px-6 sm:py-6">
        <section className="pb-28 pt-1">
          <div className="mb-4 rounded-[28px] border border-foreground/10 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground/40">Daily Usage</p>
                <h2 className="mt-1 text-base font-black text-foreground">กำหนดการใช้งานต่อวัน</h2>
                <p className="mt-1 text-sm text-foreground/60">
                  {isUnlimited
                    ? "บัญชี admin สร้างงานได้ไม่จำกัดจำนวน"
                    : `บัญชีทั่วไปสร้างงาน AI ได้สูงสุดวันละ ${dailyQuota?.limit ?? 3} งาน ระบบจะรีเซ็ตให้อัตโนมัติในวันถัดไป`}
                </p>
              </div>
              <div className={`rounded-2xl px-4 py-3 text-sm font-black ${isUnlimited ? "bg-[#EEF2FF] text-[#050579]" : noQuotaRemaining ? "bg-[#FFF1E8] text-[#C2410C]" : "bg-[#F8FAFC] text-[#0F172A]"}`}>
                {isUnlimited
                  ? "Admin Unlimited"
                  : `${dailyQuota?.used ?? 0}/${dailyQuota?.limit ?? 3} งานวันนี้${dailyQuota ? ` เหลือ ${dailyQuota.remaining ?? 0}` : ""}`}
              </div>
            </div>
          </div>

          {isAdmin ? (
            <div className="mb-3 inline-flex rounded-2xl border border-foreground/10 bg-white p-1">
              <button type="button" onClick={() => setMediaMode("image")} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${mediaMode === "image" ? "bg-primary text-white" : "text-foreground/70"}`}>
                <ImageIcon size={15} /> รูปภาพ
              </button>
              <button type="button" onClick={() => setMediaMode("video")} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition ${mediaMode === "video" ? "bg-primary text-white" : "text-foreground/70"}`}>
                <Video size={15} /> วิดีโอ
              </button>
            </div>
          ) : (
            <div className="mb-3 inline-flex items-center gap-2 rounded-2xl border border-foreground/10 bg-white px-4 py-3 text-sm font-black text-primary">
              <ImageIcon size={16} />
              สร้างได้เฉพาะรูปภาพ
            </div>
          )}

          <div className="space-y-4">
            {isAdmin && mediaMode === "video" ? (
              <div className="space-y-4">
                <div className="rounded-[28px] border border-[var(--glass-border)] bg-white p-5">
                  <h3 className="text-lg font-black text-foreground">สร้างวิดีโอ AI</h3>
                  <p className="mt-1 text-sm text-foreground/60">อัปโหลดรูปอ้างอิง + ใส่บทพูด + เลือก Character → ระบบจะรักษาหน้าตาและเสียงให้สม่ำเสมอ</p>

                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-foreground/45">รูปอ้างอิง *</p>
                      {videoReferenceImageUrl ? (
                        <div className="relative inline-block">
                          <img src={videoReferenceImageUrl} alt="reference" className="h-32 w-auto rounded-2xl border border-foreground/10 object-cover" />
                          <button type="button" onClick={() => setVideoReferenceImageUrl("")} className="absolute right-1.5 top-1.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white">
                            ลบ
                          </button>
                        </div>
                      ) : (
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-foreground/10 bg-background px-4 py-2.5 text-sm font-bold text-foreground/70">
                          <Upload size={15} />{videoUploading ? "กำลังอัปโหลด..." : "อัปโหลดรูป"}
                          <input type="file" accept="image/*" className="hidden" onChange={handleVideoReferenceUpload} />
                        </label>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-foreground/45">อัตราส่วน</p>
                        <select value={videoAspectRatio} onChange={(e) => { setVideoAspectRatio(e.target.value as VideoRatio); saveVideoSettings({ aspectRatio: e.target.value }); }} className="w-full rounded-2xl border border-foreground/10 bg-white px-4 py-3 text-sm font-semibold text-foreground outline-none">
                          <option value="9:16">9:16 (Portrait)</option>
                          <option value="16:9">16:9 (Landscape)</option>
                        </select>
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-foreground/45">ความละเอียด</p>
                        <select value={videoResolution} onChange={(e) => { setVideoResolution(e.target.value as VideoResolution); saveVideoSettings({ resolution: e.target.value }); }} className="w-full rounded-2xl border border-foreground/10 bg-white px-4 py-3 text-sm font-semibold text-foreground outline-none">
                          <option value="720p">720p (เร็วกว่า)</option>
                          <option value="1080p">1080p (ชัดกว่า)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => setShowCharacterPanel((v) => !v)}
                        className="mb-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-foreground/45 hover:text-primary transition"
                      >
                        <User size={13} />
                        Character (Ingredients)
                        {showCharacterPanel ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                        {selectedCharacterId && <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-[10px] text-white normal-case tracking-normal">ใช้งานอยู่</span>}
                      </button>

                      {showCharacterPanel && (
                        <div className="rounded-2xl border border-foreground/10 bg-[#F8FAFC] p-3 space-y-2">
                          <p className="text-xs text-foreground/55">เลือก Character เพื่อรักษาหน้าตา + เสียงให้สม่ำเสมอในทุกคลิป</p>

                          {characters.length > 0 && (
                            <div className="space-y-1.5">
                              <button
                                type="button"
                                onClick={() => { setSelectedCharacterId(null); saveVideoSettings({ characterId: null }); }}
                                className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${!selectedCharacterId ? "border-primary bg-primary/5 font-bold text-primary" : "border-foreground/10 bg-white text-foreground/70"}`}
                              >
                                ไม่ใช้ Character
                              </button>
                              {characters.map((char) => (
                                <div key={char.id} className={`flex items-start gap-2 rounded-xl border px-3 py-2 transition ${selectedCharacterId === char.id ? "border-primary bg-primary/5" : "border-foreground/10 bg-white"}`}>
                                  <button type="button" onClick={() => { const next = char.id === selectedCharacterId ? null : char.id; setSelectedCharacterId(next); saveVideoSettings({ characterId: next }); }} className="flex-1 text-left">
                                    <p className={`text-sm font-bold ${selectedCharacterId === char.id ? "text-primary" : "text-foreground"}`}>
                                      {char.gender === "female" ? "หญิง" : "ชาย"} — {VOICE_PRESETS.find((p) => p.value === char.voiceStyle)?.label ?? char.voiceStyle}
                                    </p>
                                  </button>
                                  <button type="button" onClick={() => handleDeleteCharacter(char.id)} className="shrink-0 text-foreground/30 hover:text-red-500 transition">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}

                          {showNewCharacterForm ? (
                            <div className="rounded-xl border border-foreground/10 bg-white p-3 space-y-2">
                              <div>
                                <p className="mb-1 text-xs font-bold text-foreground/50">เพศ</p>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setNewCharacterGender("female")}
                                    className={`flex-1 rounded-xl border py-2 text-sm font-bold transition ${newCharacterGender === "female" ? "border-primary bg-primary text-white" : "border-foreground/10 text-foreground/60"}`}
                                  >
                                    หญิง
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setNewCharacterGender("male")}
                                    className={`flex-1 rounded-xl border py-2 text-sm font-bold transition ${newCharacterGender === "male" ? "border-primary bg-primary text-white" : "border-foreground/10 text-foreground/60"}`}
                                  >
                                    ชาย
                                  </button>
                                </div>
                              </div>
                              <div>
                                <p className="mb-1 text-xs font-bold text-foreground/50">Style เสียง</p>
                                <select
                                  value={newCharacterVoiceStyle}
                                  onChange={(e) => setNewCharacterVoiceStyle(e.target.value)}
                                  className="w-full rounded-xl border border-foreground/10 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
                                >
                                  {VOICE_PRESETS.map((p) => (
                                    <option key={p.value} value={p.value}>{p.label}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex gap-2">
                                <button type="button" onClick={handleAddCharacter} className="flex-1 rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white">บันทึก</button>
                                <button type="button" onClick={() => setShowNewCharacterForm(false)} className="rounded-xl border border-foreground/10 px-3 py-2 text-sm text-foreground/60">ยกเลิก</button>
                              </div>
                            </div>
                          ) : (
                            <button type="button" onClick={() => setShowNewCharacterForm(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-dashed border-foreground/20 px-3 py-2 text-xs font-bold text-foreground/50 hover:border-primary/40 hover:text-primary transition">
                              <Plus size={12} /> เพิ่ม Character ใหม่
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-foreground/45">บทพูด / Prompt *</p>
                      <textarea
                        value={videoPrompt}
                        onChange={(e) => setVideoPrompt(e.target.value)}
                        placeholder="พิมพ์บทพูดหรือ prompt เช่น นักนำเสนอกล่าวถึงโปรโมชั่นพิเศษ พร้อมท่าทางมืออาชีพ"
                        className="w-full min-h-[120px] rounded-2xl border border-foreground/10 bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/15"
                      />
                      {selectedCharacterId && (
                        <p className="mt-1 text-xs text-primary/70">Character description จะถูกเพิ่มต่อท้าย prompt อัตโนมัติ</p>
                      )}
                    </div>

                    <button type="button" onClick={handleGenerateVideo} disabled={videoGenerating || videoUploading || noQuotaRemaining} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-black text-white shadow-lg shadow-[var(--glow)] disabled:opacity-60">
                      {videoGenerating ? <Loader2 size={15} className="animate-spin" /> : <Video size={15} />}
                      {videoGenerating ? "กำลังสร้างวิดีโอ..." : `สร้างวิดีโอ ${videoResolution}`}
                    </button>

                    {noQuotaRemaining ? <p className="text-sm font-semibold text-[#C2410C]">วันนี้คุณใช้สิทธิ์สร้างงานครบแล้ว กรุณาลองใหม่พรุ่งนี้</p> : null}
                    {videoStatusText ? <p className="text-sm text-[#050579]">{videoStatusText}</p> : null}
                    {videoError ? <p className="text-sm text-red-500">{videoError}</p> : null}
                  </div>
                </div>

                {videoOutputUrl ? (
                  <div className="rounded-[28px] border border-[var(--glass-border)] bg-white p-5">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-base font-black text-foreground">ผลลัพธ์วิดีโอ</p>
                      <button type="button" onClick={handleSaveVideo} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-bold text-white">
                        <Download size={14} /> ดาวน์โหลด
                      </button>
                    </div>
                    <div className={`mx-auto overflow-hidden rounded-2xl border border-foreground/10 bg-black ${videoFrameClassName}`} style={ratioStyle}>
                      <video src={videoOutputUrl} controls playsInline className="h-full w-full object-cover" />
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
              <div className="inline-flex rounded-2xl border border-foreground/10 bg-white p-1">
                <button type="button" onClick={() => setImageMode("template")} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${imageMode === "template" ? "bg-primary text-white" : "text-foreground/70"}`}>
                  <ImageIcon size={15} /> เทมเพลต
                </button>
                <button type="button" onClick={() => setImageMode("prompt")} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${imageMode === "prompt" ? "bg-primary text-white" : "text-foreground/70"}`}>
                  <Sparkles size={15} /> Prompt รูปภาพ
                </button>
              </div>

              {imageMode === "prompt" ? (
                <div className="space-y-4">
                  <div className="rounded-[28px] border border-[var(--glass-border)] bg-white p-5">
                    <h3 className="text-lg font-black text-foreground">สร้างรูปภาพจาก Prompt</h3>
                    <p className="mt-1 text-sm text-foreground/60">ไม่ใช้เทมเพลต: อัปโหลดรูปอ้างอิงหลายรูป + ใส่ prompt + เลือกอัตราส่วน</p>

                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-foreground/45">รูปอ้างอิง (หลายรูป)</p>
                        <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-foreground/10 bg-background px-4 py-2.5 text-sm font-bold text-foreground/70">
                          <Upload size={15} />{imageUploading ? "กำลังอัปโหลด..." : "อัปโหลดรูปอ้างอิง"}
                          <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageReferenceUpload} />
                        </label>
                        <p className="mt-1 text-xs text-foreground/45">สูงสุด 6 รูป</p>

                        {imageReferenceUrls.length > 0 ? (
                          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                            {imageReferenceUrls.map((url, index) => (
                              <div key={`${url}-${index}`} className="relative overflow-hidden rounded-xl border border-foreground/10 bg-background/40">
                                <img src={url} alt={`reference-${index + 1}`} className="h-28 w-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveImageReference(index)}
                                  className="absolute right-1.5 top-1.5 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white"
                                >
                                  ลบ
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-foreground/45">Prompt *</p>
                        <textarea
                          value={imagePrompt}
                          onChange={(event) => setImagePrompt(event.target.value)}
                          placeholder="พิมพ์ prompt ตามต้องการ เช่น Replace product in center with uploaded product and keep scene unchanged"
                          className="w-full min-h-[120px] rounded-2xl border border-foreground/10 bg-white px-4 py-3 text-sm text-foreground outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/15"
                        />
                      </div>

                      <div>
                        <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-foreground/45">อัตราส่วน</p>
                        <select value={imageAspectRatio} onChange={(event) => setImageAspectRatio((event.target.value as ImageRatio) || "1:1")} className="w-full rounded-2xl border border-foreground/10 bg-white px-4 py-3 text-sm font-semibold text-foreground outline-none">
                          <option value="1:1">1:1</option>
                          <option value="4:5">4:5</option>
                          <option value="9:16">9:16</option>
                          <option value="16:9">16:9</option>
                        </select>
                      </div>

                      <button type="button" onClick={handleGeneratePromptImage} disabled={imageGenerating || imageUploading || noQuotaRemaining} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-black text-white shadow-lg shadow-[var(--glow)] disabled:opacity-60">
                        {imageGenerating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} {imageGenerating ? "กำลังสร้างภาพ..." : "สร้างภาพ"}
                      </button>

                      {noQuotaRemaining ? <p className="text-sm font-semibold text-[#C2410C]">วันนี้คุณใช้สิทธิ์สร้างงานครบแล้ว กรุณาลองใหม่พรุ่งนี้</p> : null}
                      {imageStatusText ? <p className="text-sm text-[#050579]">{imageStatusText}</p> : null}
                      {imageError ? <p className="text-sm text-red-500">{imageError}</p> : null}
                    </div>
                  </div>

                  {imageOutputUrl ? (
                    <div className="rounded-[28px] border border-[var(--glass-border)] bg-white p-5">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <p className="text-base font-black text-foreground">ผลลัพธ์ภาพ</p>
                        <button type="button" onClick={handleSaveGeneratedImage} className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2 text-sm font-bold text-white">
                          <Download size={14} /> ดาวน์โหลด
                        </button>
                      </div>
                      <div className="mx-auto w-full max-w-[520px] overflow-hidden rounded-2xl border border-foreground/10 bg-white p-2">
                        <img src={imageOutputUrl} alt="Generated image output" className="h-auto w-full rounded-xl object-contain" />
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <label className="relative block">
                    <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground/35" size={18} />
                    <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="ค้นหาเทมเพลต" className="w-full rounded-2xl border border-foreground/10 bg-white py-3 pl-12 pr-4 text-sm text-foreground outline-none focus:border-primary/30 focus:ring-2 focus:ring-primary/15" />
                  </label>

                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {categories.map((category) => (
                      <button key={category.slug} type="button" onClick={() => setSelectedCategory(category.slug)} className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold ${selectedCategory === category.slug ? "border-primary bg-primary text-white" : "border-foreground/10 bg-white text-foreground/70"}`}>
                        {category.name}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-4 pt-4">
                    {loading ? (
                      <div className="flex min-h-[260px] items-center justify-center rounded-[28px] border border-[var(--glass-border)] bg-white">
                        <Loader2 className="animate-spin text-primary" size={26} />
                      </div>
                    ) : groupedTemplates.length === 0 ? (
                      <div className="rounded-[28px] border border-[var(--glass-border)] bg-white px-5 py-10 text-center">
                        <p className="text-base font-bold text-foreground/65">ไม่พบเทมเพลตที่ตรงกับการค้นหา</p>
                      </div>
                    ) : (
                      groupedTemplates.map((group) => (
                        <section key={group.slug} className="space-y-1.5">
                          <div className="flex items-center justify-between px-1">
                            <p className="text-lg font-black text-foreground">{group.categoryLabel}</p>
                            <span className="text-sm font-semibold text-foreground/40">{group.items.length}</span>
                          </div>

                          <div className="-mr-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto overflow-y-hidden pb-1 pr-4 [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-foreground/30">
                            {group.items.map((template, index) => {
                              const isActive = selectedTemplateId === template.id;
                              return (
                                <button key={template.id} type="button" onClick={() => setSelectedTemplateId(template.id)} className={`relative block w-[42vw] min-w-[136px] max-w-[152px] shrink-0 snap-start overflow-hidden rounded-[26px] border text-left transition-all sm:w-[156px] sm:max-w-none sm:min-w-0 ${isActive ? "border-primary shadow-lg shadow-primary/10" : "border-[var(--glass-border)]"}`}>
                                  <div className={`relative aspect-square overflow-hidden bg-gradient-to-br ${fallbackGradients[index % fallbackGradients.length]}`}>
                                    {template.cover_image_url ? (
                                      <img
                                        src={!thumbFallbackIds.includes(template.id) && template.cover_thumb_url ? template.cover_thumb_url : template.cover_image_url}
                                        alt={`${template.name} preview`}
                                        loading="lazy"
                                        decoding="async"
                                        onError={() => {
                                          if (template.cover_thumb_url && !thumbFallbackIds.includes(template.id)) {
                                            setThumbFallbackIds((prev) => [...prev, template.id]);
                                          }
                                        }}
                                        className="absolute inset-0 h-full w-full object-cover"
                                      />
                                    ) : null}

                                    {isActive ? (
                                      <div className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                                        <CheckCircle2 size={16} />
                                      </div>
                                    ) : null}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        </section>
                      ))
                    )}
                  </div>
                </>
              )}
            </>
          )}
          </div>
        </section>
      </main>

      {imageMode === "template" && selectedTemplate ? (
        <div className="sticky bottom-0 z-30 border-t border-foreground/10 bg-background/95 px-4 py-3 backdrop-blur-xl sm:px-6">
          <div className="mx-auto flex max-w-3xl flex-col">
            <Link href={`/manage/digital-media-v1/templates/${selectedTemplate.slug}`} className="inline-flex items-center justify-center rounded-2xl bg-accent px-4 py-3 text-sm font-black text-white shadow-lg shadow-[var(--glow)] transition-all hover:opacity-95">
              ใช้เทมเพลตนี้
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
