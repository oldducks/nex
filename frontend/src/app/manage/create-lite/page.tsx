"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import Link from "next/link";
import html2canvas from "html2canvas";
import {
  ArrowLeft,
  Loader2,
  Sparkles,
  CheckCircle2,
  Type,
  Image as ImageIcon,
  RotateCcw,
  Download,
  Shield,
  Undo2,
  Redo2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

type TemplateCategory = "promotion" | "product" | "event" | "social";
type ExportFormat = "png" | "jpg";
type ExportPresetId = "square" | "portrait" | "landscape";
type TextAlign = "left" | "center" | "right";
type ModalType = "confirm" | "prompt" | "alert";

interface CreateLiteTemplate {
  id: string;
  name: string;
  category: TemplateCategory;
  description: string;
  width: number;
  height: number;
  previewGradient: string;
  defaultTexts: {
    title: string;
    subtitle: string;
    cta?: string;
  };
}

interface EditorState {
  title: string;
  subtitle: string;
  cta: string;
  imageDataUrl: string | null;
  imageScale: number;
  imageX: number;
  imageY: number;
  textSize: number;
  textWeight: number;
  textAlign: TextAlign;
}

interface ExportPreset {
  id: ExportPresetId;
  label: string;
  width: number;
  height: number;
}

interface SavedVariant {
  id: string;
  name: string;
  createdAt: string;
  state: EditorState;
}

interface UiModalState {
  open: boolean;
  type: ModalType;
  title: string;
  message: string;
  inputValue: string;
  confirmText: string;
  cancelText: string;
  onResolve: (value: boolean | string | null) => void;
}

function generateLocalAiCopy(template: CreateLiteTemplate, current: EditorState): Pick<EditorState, 'title' | 'subtitle' | 'cta'> {
  const baseTitle = current.title.trim() || template.defaultTexts.title;
  const baseSubtitle = current.subtitle.trim() || template.defaultTexts.subtitle;
  const baseCta = current.cta.trim() || template.defaultTexts.cta || '';

  switch (template.category) {
    case "promotion":
      return {
        title: `โปรแรง ${baseTitle || "วันนี้เท่านั้น"}`,
        subtitle: `${baseSubtitle || "รีบจองก่อนของหมด"} · สินค้ามีจำนวนจำกัด`,
        cta: baseCta || "แชตสั่งตอนนี้",
      };
    case "product":
      return {
        title: `${baseTitle || "สินค้าขายดี"} ที่ลูกค้ากลับมาซ้ำ`,
        subtitle: `${baseSubtitle || "เกรดพรีเมียม ใช้งานจริง รีวิวแน่น"}`,
        cta: baseCta || "ขอดูรายละเอียด",
      };
    case "event":
      return {
        title: `${baseTitle || "จองที่นั่งด่วน"} ก่อนเต็ม`,
        subtitle: `${baseSubtitle || "เหมาะสำหรับเจ้าของธุรกิจที่อยากอัปสกิล"} · สอนสดแบบจัดเต็ม`,
        cta: baseCta || "ลงทะเบียนเข้าร่วม",
      };
    case "social":
    default:
      return {
        title: baseTitle || "เปลี่ยนวันนี้ให้ดีกว่าเมื่อวาน",
        subtitle:
          baseSubtitle ||
          "โพสต์เก็บบนเพจเพื่อสร้างความน่าเชื่อถือ และเล่าเรื่องราวตัวตนของแบรนด์",
        cta: baseCta || "",
      };
  }
}

const categoryLabels: Record<TemplateCategory, string> = {
  promotion: "Promotion",
  product: "Product",
  event: "Event",
  social: "Social",
};

const exportPresets: ExportPreset[] = [
  { id: "square", label: "Square 1080x1080", width: 1080, height: 1080 },
  { id: "portrait", label: "Portrait 1080x1350", width: 1080, height: 1350 },
  { id: "landscape", label: "Landscape 1200x628", width: 1200, height: 628 },
];

const templatePresetLocks: Record<string, ExportPresetId[]> = {
  "event-webinar": ["portrait"],
  "event-grand-opening": ["portrait"],
  "social-quote": ["square", "portrait"],
};

const defaultEditorState: EditorState = {
  title: "",
  subtitle: "",
  cta: "",
  imageDataUrl: null,
  imageScale: 100,
  imageX: 50,
  imageY: 45,
  textSize: 100,
  textWeight: 800,
  textAlign: "left",
};

const defaultModalState: UiModalState = {
  open: false,
  type: "alert",
  title: "",
  message: "",
  inputValue: "",
  confirmText: "ตกลง",
  cancelText: "ยกเลิก",
  onResolve: () => undefined,
};

export default function CreateLitePage() {
  const router = useRouter();
  const token = Cookies.get("token");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const previewRef = useRef<HTMLDivElement | null>(null);
  const modalInputRef = useRef<HTMLInputElement | null>(null);
  const modalConfirmBtnRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedRef = useRef<HTMLElement | null>(null);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<CreateLiteTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | "all">("all");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [editor, setEditor] = useState<EditorState>(defaultEditorState);
  const [exporting, setExporting] = useState(false);
  const [selectedPresetId, setSelectedPresetId] = useState<ExportPresetId>("square");
  const [showSafeZone, setShowSafeZone] = useState(true);
  const [historyPast, setHistoryPast] = useState<EditorState[]>([]);
  const [historyFuture, setHistoryFuture] = useState<EditorState[]>([]);
  const [variants, setVariants] = useState<SavedVariant[]>([]);
  const [variantName, setVariantName] = useState("");
  const [variantSearch, setVariantSearch] = useState("");
  const [modal, setModal] = useState<UiModalState>(defaultModalState);
  const [aiLoading, setAiLoading] = useState(false);

  const selectedTemplate = useMemo(
    () => templates.find((item) => item.id === selectedTemplateId) || null,
    [templates, selectedTemplateId]
  );

  const allowedPresetIds = useMemo(() => {
    if (!selectedTemplate) return exportPresets.map((item) => item.id);
    return templatePresetLocks[selectedTemplate.id] || exportPresets.map((item) => item.id);
  }, [selectedTemplate]);

  const selectedPreset = useMemo(
    () => exportPresets.find((preset) => preset.id === selectedPresetId) || exportPresets[0],
    [selectedPresetId]
  );

  const filteredVariants = useMemo(() => {
    const keyword = variantSearch.trim().toLowerCase();
    if (!keyword) return variants;
    return variants.filter((item) => item.name.toLowerCase().includes(keyword));
  }, [variants, variantSearch]);

  const canUndo = historyPast.length > 0;
  const canRedo = historyFuture.length > 0;

  const getDraftKey = (templateId: string) => `nex-create-lite:draft:${templateId}`;
  const getVariantsKey = (templateId: string) => `nex-create-lite:variants:${templateId}`;

  const openModal = (config: Omit<UiModalState, "open">) => {
    previousFocusedRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setModal({ ...config, open: true });
  };

  const closeModal = (value: boolean | string | null) => {
    modal.onResolve(value);
    setModal(defaultModalState);

    window.setTimeout(() => {
      previousFocusedRef.current?.focus();
      previousFocusedRef.current = null;
    }, 0);
  };

  const showConfirm = (title: string, message: string) =>
    new Promise<boolean>((resolve) => {
      openModal({
        type: "confirm",
        title,
        message,
        inputValue: "",
        confirmText: "ยืนยัน",
        cancelText: "ยกเลิก",
        onResolve: (value) => resolve(Boolean(value)),
      });
    });

  const showPrompt = (title: string, message: string, initial = "") =>
    new Promise<string | null>((resolve) => {
      openModal({
        type: "prompt",
        title,
        message,
        inputValue: initial,
        confirmText: "บันทึก",
        cancelText: "ยกเลิก",
        onResolve: (value) => resolve(typeof value === "string" ? value : null),
      });
    });

  const showAlert = (title: string, message: string) =>
    new Promise<void>((resolve) => {
      openModal({
        type: "alert",
        title,
        message,
        inputValue: "",
        confirmText: "ตกลง",
        cancelText: "",
        onResolve: () => resolve(),
      });
    });

  useEffect(() => {
    if (!modal.open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (modal.type === "alert") closeModal(true);
        else closeModal(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);

    const focusTimeout = window.setTimeout(() => {
      if (modal.type === "prompt") {
        modalInputRef.current?.focus();
        modalInputRef.current?.select();
      } else {
        modalConfirmBtnRef.current?.focus();
      }
    }, 10);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimeout);
    };
  }, [modal]);

  const applyEditorPatch = (patch: Partial<EditorState>) => {
    setHistoryPast((prev) => [...prev, editor]);
    setHistoryFuture([]);
    setEditor((prev) => ({ ...prev, ...patch }));
  };

  const handleUndo = () => {
    if (!canUndo) return;
    const previous = historyPast[historyPast.length - 1];
    setHistoryPast((prev) => prev.slice(0, -1));
    setHistoryFuture((prev) => [editor, ...prev]);
    setEditor(previous);
  };

  const handleRedo = () => {
    if (!canRedo) return;
    const next = historyFuture[0];
    setHistoryFuture((prev) => prev.slice(1));
    setHistoryPast((prev) => [...prev, editor]);
    setEditor(next);
  };

  const handleAiSuggestCopy = async () => {
    if (!selectedTemplate || !token) return;
    setAiLoading(true);
    try {
      const res = await fetch(`${API_URL}/create-lite/ai-copy`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          title: editor.title,
          subtitle: editor.subtitle,
          cta: editor.cta,
        }),
      });

      if (!res.ok) {
        throw new Error("AI copy API failed");
      }

      const data: { title?: string; subtitle?: string; cta?: string } = await res.json();
      applyEditorPatch({
        title: data.title ?? editor.title,
        subtitle: data.subtitle ?? editor.subtitle,
        cta: data.cta ?? editor.cta,
      });
    } catch {
      const fallback = generateLocalAiCopy(selectedTemplate, editor);
      applyEditorPatch(fallback);
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    setCheckingAuth(false);
  }, [token, router]);

  useEffect(() => {
    if (!token || checkingAuth) return;

    const loadTemplates = async () => {
      try {
        setLoading(true);
        const query = selectedCategory === "all" ? "" : `?category=${selectedCategory}`;
        const res = await fetch(`${API_URL}/create-lite/templates${query}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("โหลดเทมเพลตไม่สำเร็จ");
        const data = await res.json();
        setTemplates(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [API_URL, token, checkingAuth, selectedCategory]);

  useEffect(() => {
    if (!selectedTemplate) {
      setEditor(defaultEditorState);
      setHistoryPast([]);
      setHistoryFuture([]);
      return;
    }

    const baseState: EditorState = {
      title: selectedTemplate.defaultTexts.title,
      subtitle: selectedTemplate.defaultTexts.subtitle,
      cta: selectedTemplate.defaultTexts.cta || "",
      imageDataUrl: null,
      imageScale: 100,
      imageX: 50,
      imageY: 45,
      textSize: 100,
      textWeight: 800,
      textAlign: "left",
    };

    try {
      const raw = window.localStorage.getItem(getDraftKey(selectedTemplate.id));
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<EditorState>;
        setEditor({ ...baseState, ...parsed });
      } else {
        setEditor(baseState);
      }

      const rawVariants = window.localStorage.getItem(getVariantsKey(selectedTemplate.id));
      if (rawVariants) {
        const parsedVariants = JSON.parse(rawVariants) as SavedVariant[];
        setVariants(parsedVariants);
      } else {
        setVariants([]);
      }
    } catch {
      setEditor(baseState);
      setVariants([]);
    }

    setVariantName("");
    setHistoryPast([]);
    setHistoryFuture([]);
  }, [selectedTemplate]);

  useEffect(() => {
    if (!allowedPresetIds.includes(selectedPresetId)) {
      setSelectedPresetId(allowedPresetIds[0]);
    }
  }, [allowedPresetIds, selectedPresetId]);

  const persistVariants = (nextVariants: SavedVariant[]) => {
    setVariants(nextVariants);
    if (!selectedTemplate) return;
    try {
      window.localStorage.setItem(getVariantsKey(selectedTemplate.id), JSON.stringify(nextVariants));
    } catch {
      // ignore
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => applyEditorPatch({ imageDataUrl: reader.result as string });
    reader.readAsDataURL(file);
  };

  const resetImage = () => {
    applyEditorPatch({ imageDataUrl: null, imageScale: 100, imageX: 50, imageY: 45 });
  };

  const handleResetDraft = () => {
    if (!selectedTemplate) return;

    const baseState: EditorState = {
      title: selectedTemplate.defaultTexts.title,
      subtitle: selectedTemplate.defaultTexts.subtitle,
      cta: selectedTemplate.defaultTexts.cta || "",
      imageDataUrl: null,
      imageScale: 100,
      imageX: 50,
      imageY: 45,
      textSize: 100,
      textWeight: 800,
      textAlign: "left",
    };

    try {
      window.localStorage.removeItem(getDraftKey(selectedTemplate.id));
    } catch {
      // ignore localStorage delete errors
    }

    setEditor(baseState);
    setHistoryPast([]);
    setHistoryFuture([]);
  };

  const handleSaveVariant = () => {
    if (!selectedTemplate) return;

    const name = variantName.trim() || `Variant ${variants.length + 1}`;
    const nextVariants: SavedVariant[] = [
      { id: `${Date.now()}`, name, createdAt: new Date().toISOString(), state: editor },
      ...variants,
    ].slice(0, 20);

    persistVariants(nextVariants);
    setVariantName("");
  };

  const handleLoadVariant = (variantId: string) => {
    const found = variants.find((item) => item.id === variantId);
    if (!found) return;
    setHistoryPast((prev) => [...prev, editor]);
    setHistoryFuture([]);
    setEditor(found.state);
  };

  const handleDeleteVariant = async (variantId: string) => {
    const current = variants.find((item) => item.id === variantId);
    if (!current) return;

    const confirmed = await showConfirm("ยืนยันการลบ", `ต้องการลบ Variant \"${current.name}\" ใช่หรือไม่?`);
    if (!confirmed) return;

    const nextVariants = variants.filter((item) => item.id !== variantId);
    persistVariants(nextVariants);
  };

  const handleRenameVariant = async (variantId: string) => {
    const current = variants.find((item) => item.id === variantId);
    if (!current) return;

    const nextName = (await showPrompt("เปลี่ยนชื่อ Variant", "ตั้งชื่อใหม่ให้ Variant", current.name))?.trim();
    if (!nextName) return;

    const nextVariants = variants.map((item) => (item.id === variantId ? { ...item, name: nextName } : item));
    persistVariants(nextVariants);
  };

  const handleDuplicateVariant = (variantId: string) => {
    const current = variants.find((item) => item.id === variantId);
    if (!current) return;

    const duplicated: SavedVariant = {
      id: `${Date.now()}`,
      name: `${current.name} (copy)`,
      createdAt: new Date().toISOString(),
      state: current.state,
    };

    persistVariants([duplicated, ...variants].slice(0, 20));
  };

  const handleExportVariantsJson = () => {
    if (!selectedTemplate || variants.length === 0) return;

    const payload = {
      templateId: selectedTemplate.id,
      exportedAt: new Date().toISOString(),
      variants,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedTemplate.id}-variants.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportVariantsJson = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!selectedTemplate) return;

    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as { variants?: SavedVariant[] };

      if (!Array.isArray(parsed.variants)) {
        await showAlert("นำเข้าไม่สำเร็จ", "ไฟล์ไม่ถูกต้อง: ไม่พบรายการ variants");
        return;
      }

      const sanitized: SavedVariant[] = parsed.variants
        .filter((item) => item && typeof item.name === "string" && item.state)
        .map((item) => ({
          id: item.id || `${Date.now()}-${Math.random()}`,
          name: item.name,
          createdAt: item.createdAt || new Date().toISOString(),
          state: { ...defaultEditorState, ...item.state },
        }));

      persistVariants([...sanitized, ...variants].slice(0, 20));
    } catch {
      await showAlert("นำเข้าไม่สำเร็จ", "ไม่สามารถนำเข้าไฟล์ JSON ได้");
    } finally {
      event.target.value = "";
    }
  };

  useEffect(() => {
    if (!selectedTemplate) return;
    try {
      window.localStorage.setItem(getDraftKey(selectedTemplate.id), JSON.stringify(editor));
    } catch {
      // ignore
    }
  }, [editor, selectedTemplate]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const isModifier = event.metaKey || event.ctrlKey;
      if (!isModifier) return;

      const key = event.key.toLowerCase();
      if (key === "z" && !event.shiftKey) {
        event.preventDefault();
        handleUndo();
      }

      if ((key === "z" && event.shiftKey) || key === "y") {
        event.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleUndo, handleRedo]);

  const waitForPreviewReady = async () => {
    const element = previewRef.current;
    if (!element) return;

    const images = Array.from(element.querySelectorAll("img"));
    await Promise.all(
      images.map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
              return;
            }
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    );

    if (document.fonts?.ready) await document.fonts.ready;
  };

  const getExportFilename = (format: ExportFormat) => {
    const templateName = (selectedTemplate?.id || "creative").replace(/[^a-zA-Z0-9-_]/g, "-");
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    return `${templateName}_${selectedPreset.width}x${selectedPreset.height}_${ts}.${format}`;
  };

  const handleExportImage = async (format: ExportFormat) => {
    if (!previewRef.current || !selectedTemplate) return;

    try {
      setExporting(true);
      await waitForPreviewReady();

      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });

      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = selectedPreset.width;
      exportCanvas.height = selectedPreset.height;
      const ctx = exportCanvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(canvas, 0, 0, selectedPreset.width, selectedPreset.height);

      const mime = format === "png" ? "image/png" : "image/jpeg";
      const quality = format === "png" ? 1 : 0.92;
      const dataUrl = exportCanvas.toDataURL(mime, quality);

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = getExportFilename(format);
      a.click();
    } catch (err) {
      console.error("export failed", err);
    } finally {
      setExporting(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={28} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-foreground/10 bg-background/70 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/manage/control-center" className="w-10 h-10 rounded-xl hover:bg-foreground/5 flex items-center justify-center">
              <ArrowLeft size={18} className="text-foreground/50" />
            </Link>
            <div>
              <h1 className="font-black tracking-tight">NEX Create Lite</h1>
              <p className="text-xs text-foreground/50">Advanced Editor + Export</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <section className="rounded-3xl border border-foreground/10 bg-foreground/5 p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-xl font-black mb-1">เลือกเทมเพลตสำหรับงานสร้างสื่อ</h2>
              <p className="text-sm text-foreground/60">รองรับ layout lock + text style + undo/redo แล้ว</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setSelectedCategory("all")} className={`px-3 py-2 rounded-xl text-xs font-bold border ${selectedCategory === "all" ? "bg-primary text-white border-primary" : "border-foreground/15 hover:border-primary/40"}`}>ทั้งหมด</button>
              {Object.entries(categoryLabels).map(([key, label]) => (
                <button key={key} onClick={() => setSelectedCategory(key as TemplateCategory)} className={`px-3 py-2 rounded-xl text-xs font-bold border ${selectedCategory === key ? "bg-primary text-white border-primary" : "border-foreground/15 hover:border-primary/40"}`}>{label}</button>
              ))}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="py-14 flex justify-center"><Loader2 className="animate-spin text-primary" size={26} /></div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {templates.map((template) => (
              <button key={template.id} type="button" onClick={() => setSelectedTemplateId(template.id)} className={`text-left rounded-3xl border p-4 transition-all hover:-translate-y-0.5 ${selectedTemplateId === template.id ? "border-primary bg-primary/5" : "border-foreground/10 bg-foreground/5 hover:border-primary/30"}`}>
                <div className={`h-36 rounded-2xl bg-gradient-to-br ${template.previewGradient} mb-4 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute left-3 bottom-3 text-white">
                    <p className="text-sm font-black tracking-wide">{template.defaultTexts.title}</p>
                    <p className="text-xs opacity-90">{template.defaultTexts.subtitle}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="font-bold text-sm">{template.name}</p>
                  <span className="text-[10px] px-2 py-1 rounded-lg bg-foreground/10 text-foreground/70 uppercase tracking-wider">{categoryLabels[template.category]}</span>
                </div>
                <p className="text-xs text-foreground/60 mb-2">{template.description}</p>
              </button>
            ))}
          </section>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-6">
          <div className="rounded-3xl border border-foreground/10 bg-card p-6 space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <h3 className="font-black">Editor Controls</h3>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleAiSuggestCopy}
                  disabled={!selectedTemplate || aiLoading}
                  className="inline-flex items-center gap-1 px-3 py-2 text-xs rounded-lg border border-primary/40 bg-primary/5 text-primary font-bold disabled:opacity-50"
                >
                  <Sparkles size={13} />
                  {aiLoading ? "กำลังแนะนำ..." : "AI แนะนำข้อความ"}
                </button>
                <button type="button" onClick={handleUndo} disabled={!canUndo} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-foreground/20 disabled:opacity-40"><Undo2 size={12} /> Undo</button>
                <button type="button" onClick={handleRedo} disabled={!canRedo} className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-lg border border-foreground/20 disabled:opacity-40"><Redo2 size={12} /> Redo</button>
              </div>
            </div>

            {!selectedTemplate ? (
              <p className="text-sm text-foreground/50">ยังไม่ได้เลือกเทมเพลต</p>
            ) : (
              <>
                <div className="space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 flex items-center gap-2"><Type size={13} /> Text Editor</p>
                  <input className="w-full bg-background border border-foreground/15 rounded-xl px-3 py-2 text-sm" value={editor.title} onChange={(e) => applyEditorPatch({ title: e.target.value })} />
                  <input className="w-full bg-background border border-foreground/15 rounded-xl px-3 py-2 text-sm" value={editor.subtitle} onChange={(e) => applyEditorPatch({ subtitle: e.target.value })} />
                  <input className="w-full bg-background border border-foreground/15 rounded-xl px-3 py-2 text-sm" placeholder="CTA" value={editor.cta} onChange={(e) => applyEditorPatch({ cta: e.target.value })} />
                </div>

                <div className="pt-2 border-t border-foreground/10 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 flex items-center gap-2"><ImageIcon size={13} /> Image Replace</p>
                  <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-dashed border-foreground/30 text-xs cursor-pointer hover:border-primary/40">
                    <ImageIcon size={13} /> อัปโหลดรูปแทนที่
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <input type="range" min={50} max={180} value={editor.imageScale} onChange={(e) => applyEditorPatch({ imageScale: Number(e.target.value) })} />
                    <input type="range" min={0} max={100} value={editor.imageX} onChange={(e) => applyEditorPatch({ imageX: Number(e.target.value) })} />
                    <input type="range" min={0} max={100} value={editor.imageY} onChange={(e) => applyEditorPatch({ imageY: Number(e.target.value) })} />
                  </div>
                  <button type="button" onClick={resetImage} className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-xl border border-foreground/15 hover:border-primary/40"><RotateCcw size={13} /> รีเซ็ตรูป</button>
                </div>

                <div className="pt-2 border-t border-foreground/10 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-foreground/50 flex items-center gap-2"><Download size={13} /> Export Settings</p>

                  <div className="flex flex-wrap gap-2">
                    {exportPresets.map((preset) => {
                      const disabled = !allowedPresetIds.includes(preset.id);
                      return (
                        <button key={preset.id} type="button" disabled={disabled} onClick={() => setSelectedPresetId(preset.id)} className={`px-3 py-2 rounded-xl text-xs font-bold border disabled:opacity-40 ${selectedPresetId === preset.id ? "bg-primary text-white border-primary" : "border-foreground/15 hover:border-primary/40"}`}>{preset.label}</button>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => setShowSafeZone((prev) => !prev)} className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-xl border border-foreground/15 hover:border-primary/40"><Shield size={13} /> {showSafeZone ? "ซ่อน" : "แสดง"} Safe-zone guide</button>
                    <button type="button" onClick={handleResetDraft} className="inline-flex items-center gap-2 text-xs px-3 py-2 rounded-xl border border-red-300/40 text-red-500 hover:border-red-400/60">ล้าง Draft</button>
                  </div>

                  <div className="space-y-2 rounded-xl border border-foreground/10 p-3 bg-foreground/5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-foreground/50">Save as New Variant</p>
                    <div className="flex gap-2">
                      <input value={variantName} onChange={(e) => setVariantName(e.target.value)} placeholder="เช่น โปรโมชันสีเข้ม" className="flex-1 bg-background border border-foreground/15 rounded-lg px-2.5 py-2 text-xs" />
                      <button type="button" onClick={handleSaveVariant} className="px-3 py-2 rounded-lg text-xs font-bold bg-foreground text-background">Save</button>
                    </div>

                    <div className="flex gap-2">
                      <input value={variantSearch} onChange={(e) => setVariantSearch(e.target.value)} placeholder="ค้นหา variant" className="flex-1 bg-background border border-foreground/15 rounded-lg px-2.5 py-2 text-xs" />
                      <button type="button" onClick={handleExportVariantsJson} disabled={variants.length === 0} className="px-3 py-2 rounded-lg text-xs font-bold border border-foreground/20 disabled:opacity-40">Export JSON</button>
                      <label className="px-3 py-2 rounded-lg text-xs font-bold border border-foreground/20 cursor-pointer hover:border-primary/40">Import JSON<input type="file" accept="application/json" className="hidden" onChange={handleImportVariantsJson} /></label>
                    </div>

                    {filteredVariants.length > 0 ? (
                      <div className="max-h-40 overflow-auto space-y-1.5">
                        {filteredVariants.map((variant) => (
                          <div key={variant.id} className="w-full text-left px-2.5 py-2 rounded-lg border border-foreground/10 text-xs">
                            <button type="button" onClick={() => handleLoadVariant(variant.id)} className="w-full text-left hover:text-primary">
                              <div className="font-semibold truncate">{variant.name}</div>
                              <div className="text-[10px] text-foreground/45">{new Date(variant.createdAt).toLocaleString()}</div>
                            </button>
                            <div className="mt-2 flex gap-1.5">
                              <button type="button" onClick={() => handleLoadVariant(variant.id)} className="px-2 py-1 rounded border border-foreground/15 text-[10px] font-semibold">Load</button>
                              <button type="button" onClick={() => handleRenameVariant(variant.id)} className="px-2 py-1 rounded border border-foreground/15 text-[10px] font-semibold">Rename</button>
                              <button type="button" onClick={() => handleDuplicateVariant(variant.id)} className="px-2 py-1 rounded border border-foreground/15 text-[10px] font-semibold">Duplicate</button>
                              <button type="button" onClick={() => handleDeleteVariant(variant.id)} className="px-2 py-1 rounded border border-red-300/40 text-red-500 text-[10px] font-semibold">Delete</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[11px] text-foreground/45">ไม่พบ variant ที่ค้นหา</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button type="button" disabled={exporting} onClick={() => handleExportImage("png")} className="px-3 py-2 rounded-xl text-xs font-bold bg-primary text-white disabled:opacity-60">Export PNG</button>
                    <button type="button" disabled={exporting} onClick={() => handleExportImage("jpg")} className="px-3 py-2 rounded-xl text-xs font-bold border border-foreground/20 hover:border-primary/40 disabled:opacity-60">Export JPG</button>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="rounded-3xl border border-foreground/10 bg-card p-6">
            <div className="flex items-center gap-2 mb-4"><CheckCircle2 size={16} className="text-emerald-500" /><h3 className="font-black">Live Preview</h3></div>
            {!selectedTemplate ? (
              <p className="text-sm text-foreground/50">เลือกเทมเพลตก่อนเพื่อดูตัวอย่าง</p>
            ) : (
              <div className="space-y-3">
                <div className="w-full rounded-2xl overflow-hidden bg-foreground/5 border border-foreground/10 p-3">
                  <div ref={previewRef} className={`w-full bg-gradient-to-br ${selectedTemplate.previewGradient} relative overflow-hidden`} style={{ aspectRatio: `${selectedPreset.width} / ${selectedPreset.height}` }}>
                    {editor.imageDataUrl && (
                      <div className="absolute w-[42%] aspect-square rounded-xl overflow-hidden border border-white/30" style={{ left: `${editor.imageX}%`, top: `${editor.imageY}%`, transform: `translate(-50%, -50%) scale(${editor.imageScale / 100})` }}>
                        <img src={editor.imageDataUrl} alt="Uploaded" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/25" />
                    {showSafeZone && <div className="absolute inset-[6%] border border-dashed border-white/50 pointer-events-none" />}
                    <div className={`absolute left-[6%] right-[6%] bottom-[6%] text-white z-10 ${editor.textAlign === "center" ? "text-center" : editor.textAlign === "right" ? "text-right" : "text-left"}`}>
                      <p className="leading-tight break-words" style={{ fontSize: `calc(clamp(14px, 3vw, 28px) * ${editor.textSize / 100})`, fontWeight: editor.textWeight }}>{editor.title || "(ไม่มี Title)"}</p>
                      <p className="opacity-90 mt-1 break-words" style={{ fontSize: `calc(clamp(10px, 1.4vw, 16px) * ${editor.textSize / 100})`, fontWeight: Math.max(400, editor.textWeight - 200) }}>{editor.subtitle || "(ไม่มี Subtitle)"}</p>
                      {editor.cta ? <span className="inline-block mt-3 text-[clamp(9px,1vw,13px)] px-3 py-1 rounded-full bg-white/20 border border-white/25 font-semibold">{editor.cta}</span> : null}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {modal.open && (
        <div
          className="fixed inset-0 z-[100] bg-black/45 backdrop-blur-[1px] flex items-center justify-center p-4 transition-opacity duration-200 animate-in fade-in"
          onClick={() => (modal.type === "alert" ? closeModal(true) : closeModal(false))}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-foreground/15 bg-card p-5 space-y-4 shadow-2xl transition-all duration-200 animate-in zoom-in-95 slide-in-from-bottom-2"
            onClick={(event) => event.stopPropagation()}
          >
            <h4 className="font-black text-base">{modal.title}</h4>
            <p className="text-sm text-foreground/70">{modal.message}</p>
            {modal.type === "prompt" && (
              <input
                value={modal.inputValue}
                onChange={(e) => setModal((prev) => ({ ...prev, inputValue: e.target.value }))}
                className="w-full bg-background border border-foreground/20 rounded-xl px-3 py-2 text-sm"
                autoFocus
              />
            )}
            <div className="flex justify-end gap-2 pt-1">
              {modal.type !== "alert" && (
                <button type="button" onClick={() => closeModal(false)} className="px-3 py-2 rounded-xl text-xs font-bold border border-foreground/20">
                  {modal.cancelText || "ยกเลิก"}
                </button>
              )}
              <button
                type="button"
                onClick={() => closeModal(modal.type === "prompt" ? modal.inputValue : true)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-primary text-white"
              >
                {modal.confirmText || "ตกลง"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
