"use client";

import { TouchEvent, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  Loader2,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  AlertCircle,
  X,
} from "lucide-react";
import Link from "next/link";

type FieldType = "text" | "email" | "phone" | "dropdown" | "textarea" | "checkbox";

interface FormFieldConfig {
  id: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface AgentHandoverConfig {
  email: { enabled: boolean; address: string };
  line: { enabled: boolean; userId: string };
  whatsapp: { enabled: boolean; phoneNumber: string };
  facebook: { enabled: boolean; pageId: string };
  copy_link: { enabled: boolean };
  webhook: { enabled: boolean; url: string };
}

interface FormItem {
  id: number;
  name: string;
  description?: string;
  fields: FormFieldConfig[];
  is_active: boolean;
  agent_handover_config?: AgentHandoverConfig;
  created_at: string;
  submission_count?: number;
}

interface MeProfile {
  subscription_tier?: string;
}

const FIELD_TYPE_LABEL: Record<FieldType, string> = {
  text: "ข้อความ",
  email: "อีเมล",
  phone: "เบอร์โทร",
  dropdown: "ตัวเลือก",
  textarea: "ข้อความยาว",
  checkbox: "Checkbox",
};

const getFieldPreset = (type: FieldType): Pick<FormFieldConfig, "label" | "placeholder" | "required" | "options"> => ({
  label:
    type === "text"
      ? "ข้อความสั้น"
      : type === "email"
      ? "อีเมล"
      : type === "phone"
      ? "เบอร์โทรศัพท์"
      : type === "dropdown"
      ? "ตัวเลือก"
      : type === "textarea"
      ? "ข้อความยาว"
      : "ยอมรับเงื่อนไข",
  placeholder:
    type === "textarea"
      ? "พิมพ์ข้อความเพิ่มเติม..."
      : type === "text"
      ? "กรอกข้อความ"
      : type === "email"
      ? "you@example.com"
      : type === "phone"
      ? "08x-xxx-xxxx"
      : undefined,
  required: false,
  options: type === "dropdown" ? ["ตัวเลือกที่ 1", "ตัวเลือกที่ 2"] : undefined,
});



export default function FormBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;

  const token = Cookies.get("token");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://nexsolution.cloud";
  const [form, setForm] = useState<FormItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFieldIds, setExpandedFieldIds] = useState<string[]>([]);
  const [editingFieldIndex, setEditingFieldIndex] = useState<number | null>(null);
  const [fieldEditorSnapshot, setFieldEditorSnapshot] = useState<string | null>(null);
  const [sheetTouchStartY, setSheetTouchStartY] = useState<number | null>(null);
  const [sheetTouchDeltaY, setSheetTouchDeltaY] = useState(0);
  const [isMetaEditorOpen, setIsMetaEditorOpen] = useState(false);
  const [currentPlanLabel, setCurrentPlanLabel] = useState("แผนพื้นฐาน");
  const infoSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, formId]);

  useEffect(() => {
    if (!token) return;
    const loadProfile = async () => {
      try {
        const profileRes = await fetch(`${API_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) return;
        const profileData = (await profileRes.json()) as MeProfile;
        setCurrentPlanLabel(profileData.subscription_tier === "premium" ? "แผนพรีเมียม" : "แผนพื้นฐาน");
      } catch {
        setCurrentPlanLabel("แผนพื้นฐาน");
      }
    };
    void loadProfile();
  }, [API_URL, token]);

  const loadForm = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/forms/${formId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) {
        throw new Error("ไม่พบฟอร์มนี้");
      }
      const data = await res.json();
      
      const defaultHandover: AgentHandoverConfig = {
        email: { enabled: false, address: "" },
        line: { enabled: false, userId: "" },
        whatsapp: { enabled: false, phoneNumber: "" },
        facebook: { enabled: false, pageId: "" },
        copy_link: { enabled: false },
        webhook: { enabled: false, url: "" },
      };

      setForm({
        ...data,
        // Keep persisted sections so owners can continue editing existing forms.
        // Fallback to empty only when backend has no field data.
        fields: Array.isArray(data.fields) ? data.fields : [],
        agent_handover_config: data.agent_handover_config || defaultHandover,
      });
      setExpandedFieldIds([]);
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "ไม่สามารถโหลดฟอร์มได้");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (index: number, patch: Partial<FormFieldConfig>) => {
    if (!form) return;
    const next = [...form.fields];
    next[index] = {
      ...next[index],
      ...patch,
    };
    setForm({ ...form, fields: next });
  };

  const getFieldSnapshot = (field?: FormFieldConfig | null) => {
    if (!field) return null;
    return JSON.stringify(field);
  };

  const openFieldEditor = (index: number) => {
    if (!form?.fields[index]) return;
    setEditingFieldIndex(index);
    setFieldEditorSnapshot(getFieldSnapshot(form.fields[index]));
    setSheetTouchStartY(null);
    setSheetTouchDeltaY(0);
  };

  const addField = (type: FieldType) => {
    if (!form) return;
    const idBase = type === "dropdown" ? "option" : type;
    const preset = getFieldPreset(type);
    const newField: FormFieldConfig = {
      id: `${idBase}_${Date.now()}`,
      type,
      ...preset,
    };
    const nextFields = [...form.fields, newField];
    setForm({ ...form, fields: nextFields });
  };

  const removeField = (index: number) => {
    if (!form) return;
    const next = [...form.fields];
    next.splice(index, 1);
    setForm({ ...form, fields: next });
  };

  const confirmRemoveField = (index: number) => {
    if (!form) return;
    const field = form.fields[index];
    const fieldName = field?.label?.trim() || `ช่องที่ ${index + 1}`;
    const confirmed = window.confirm(`ต้องการลบ "${fieldName}" ใช่หรือไม่?`);
    if (!confirmed) return;
    removeField(index);
    if (editingFieldIndex === index) {
      closeFieldEditor();
    }
  };

  const moveField = (index: number, direction: "up" | "down") => {
    if (!form) return;
    const next = [...form.fields];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= next.length) return;
    const tmp = next[index];
    next[index] = next[target];
    next[target] = tmp;
    setForm({ ...form, fields: next });
  };

  const updateDropdownOptions = (index: number, raw: string) => {
    const options = raw
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    updateField(index, { options });
  };

  const updateDropdownOptionCount = (index: number, raw: string) => {
    const nextCount = Math.max(1, Number.parseInt(raw || "1", 10) || 1);
    const currentOptions = form?.fields[index]?.options || [];
    const nextOptions = Array.from({ length: nextCount }, (_, optionIndex) => {
      return currentOptions[optionIndex] || `ตัวเลือกที่ ${optionIndex + 1}`;
    });
    updateField(index, { options: nextOptions });
  };

  const updateSingleDropdownOption = (index: number, optionIndex: number, value: string) => {
    const currentOptions = [...(form?.fields[index]?.options || [])];
    currentOptions[optionIndex] = value;
    updateField(index, { options: currentOptions });
  };

  const toggleFieldExpanded = (fieldId: string) => {
    setExpandedFieldIds((prev) =>
      prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId],
    );
  };

  const expandAllFields = () => {
    if (!form) return;
    setExpandedFieldIds(form.fields.map((field) => field.id));
  };

  const collapseAllFields = () => {
    setExpandedFieldIds([]);
  };

  const closeFieldEditor = () => {
    setEditingFieldIndex(null);
    setFieldEditorSnapshot(null);
    setSheetTouchStartY(null);
    setSheetTouchDeltaY(0);
  };

  const requestCloseFieldEditor = () => {
    if (editingFieldIndex === null || !form?.fields[editingFieldIndex]) {
      closeFieldEditor();
      return true;
    }
    const currentSnapshot = getFieldSnapshot(form.fields[editingFieldIndex]);
    const hasUnsavedFieldChanges =
      fieldEditorSnapshot !== null && currentSnapshot !== fieldEditorSnapshot;
    if (hasUnsavedFieldChanges) {
      const confirmed = window.confirm("มีการแก้ไขที่ยังไม่กดบันทึก ต้องการปิดหรือไม่?");
      if (!confirmed) {
        setSheetTouchStartY(null);
        setSheetTouchDeltaY(0);
        return false;
      }
    }
    closeFieldEditor();
    return true;
  };

  const saveAndCloseFieldEditor = () => {
    closeFieldEditor();
  };

  const handleSheetTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setSheetTouchStartY(event.touches[0]?.clientY ?? null);
    setSheetTouchDeltaY(0);
  };

  const handleSheetTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (sheetTouchStartY === null) return;
    const currentY = event.touches[0]?.clientY ?? sheetTouchStartY;
    setSheetTouchDeltaY(Math.max(0, currentY - sheetTouchStartY));
  };

  const handleSheetTouchEnd = () => {
    if (sheetTouchDeltaY > 90) {
      requestCloseFieldEditor();
      return;
    }
    setSheetTouchStartY(null);
    setSheetTouchDeltaY(0);
  };



  const validateBeforeSave = (): string | null => {
    if (!form) return "ไม่พบข้อมูลฟอร์ม";
    if (!form.name.trim()) return "กรุณากรอกชื่อฟอร์ม";
    for (const f of form.fields) {
      if (!f.id.trim()) return "บางช่องยังไม่มี Field ID";
      if (!f.label.trim()) return `ช่อง ${f.id} ยังไม่มี Label`;
      if (!f.type) return `ช่อง ${f.id} ยังไม่ได้เลือกประเภท`;
      if (f.type === "dropdown" && (!f.options || f.options.length === 0)) {
        return `ช่อง ${f.label} (dropdown) ต้องมีอย่างน้อย 1 ตัวเลือก`;
      }
    }
    return null;
  };

  const saveForm = async () => {
    if (!form) return;
    const validationError = validateBeforeSave();
    if (validationError) {
      setError(validationError);
      return;
    }
    try {
      setSaving(true);
      setError(null);
      const res = await fetch(`${API_URL}/forms/${form.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description || undefined,
          fields: form.fields,
          agent_handover_config: form.agent_handover_config,
        }),
      });
      if (!res.ok) {
        throw new Error("บันทึกฟอร์มไม่สำเร็จ");
      }
      await loadForm();
    } catch (e: any) {
      console.error(e);
      setError(e?.message || "เกิดข้อผิดพลาดระหว่างบันทึก");
    } finally {
      setSaving(false);
    }
  };

  const updateHandover = (
    key: keyof AgentHandoverConfig,
    patch: any
  ) => {
    if (!form || !form.agent_handover_config) return;
    setForm({
      ...form,
      agent_handover_config: {
        ...form.agent_handover_config,
        [key]: {
          ...form.agent_handover_config[key],
          ...patch,
        },
      },
    });
  };

  if (!token) return null;

  if (loading || !form) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <header className="sticky top-0 z-40 border-b border-[#D9E1F2] bg-white/85 backdrop-blur-md">
        <div className="relative mx-auto flex h-24 w-full max-w-md items-center px-4 md:max-w-6xl md:px-6">
          <Link
            href="/manage/forms"
            className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-[#F6F8FF] group md:left-6"
            title="ย้อนกลับ"
          >
            <ArrowLeft size={20} className="text-[#64748B] transition-all group-hover:text-[#050579]" />
          </Link>
          <div className="mx-auto flex min-w-0 flex-col items-center text-center">
            <p className="mb-0.5 text-[11px] font-black uppercase leading-none tracking-[0.18em] text-[#94A3B8]">NEX FORMS</p>
            <div className="flex max-w-[260px] items-center justify-center gap-2 md:max-w-xl">
              <h1 className="truncate text-lg font-black text-[#050579]">{form.name || "แก้ไขโครงฟอร์ม"}</h1>
              <button
                type="button"
                onClick={() => {
                  if (isMetaEditorOpen) {
                    setIsMetaEditorOpen(false);
                    return;
                  }
                  setIsMetaEditorOpen(true);
                  setTimeout(() => {
                    infoSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    const targetInput = document.querySelector<HTMLInputElement>("[data-form-name-input]");
                    targetInput?.focus();
                  }, 120);
                }}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#D9E1F2] bg-[#F6F8FF] text-[#64748B] transition-colors hover:border-[#BCCBE8] hover:text-[#050579]"
                title={isMetaEditorOpen ? "ซ่อนการแก้ไข" : "แก้ชื่อฟอร์ม"}
              >
                <Pencil size={14} />
              </button>
            </div>
            <div className="mt-2 inline-flex items-center rounded-full border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-1 text-xs font-bold text-[#64748B]">
              <span className="mr-1.5 text-[#94A3B8]">แผนปัจจุบัน</span>
              <span className="text-[#050579]">{currentPlanLabel}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-6 pb-10 md:px-6 md:space-y-10 md:py-10">
        {/* Form meta */}
        {isMetaEditorOpen ? (
        <>
        <section ref={infoSectionRef} className="hidden grid-cols-1 items-start gap-8 md:grid">
          <div className="rounded-[28px] border border-foreground/5 bg-foreground/5/40 p-5 glass-card space-y-5 md:rounded-[32px] md:p-8">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">
                ชื่อฟอร์ม
              </label>
              <input
                data-form-name-input
                className="w-full bg-background border border-foreground/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">
                คำอธิบาย (ไม่บังคับ)
              </label>
              <textarea
                className="w-full bg-background border border-foreground/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                value={form.description || ""}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
            {error && (
              <div className="mt-2 flex items-start gap-2 text-xs text-red-400 bg-red-500/5 border border-red-500/40 rounded-2xl px-4 py-3">
                <AlertCircle size={14} className="mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-foreground/5 bg-foreground/5/40 p-5 glass-card space-y-5 md:hidden">
            <div className="rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3">
              <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">
                ข้อมูลฟอร์ม
              </div>
              <div className="mt-2 text-base font-black text-[#050579]">
                แก้ชื่อและคำอธิบายตรงนี้ได้เลย
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">
                ชื่อฟอร์ม
              </label>
              <input
                data-form-name-input
                className="w-full bg-background border border-foreground/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">
                คำอธิบาย (ไม่บังคับ)
              </label>
              <textarea
                className="w-full bg-background border border-foreground/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                value={form.description || ""}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            {error ? (
              <div className="mt-2 flex items-start gap-2 rounded-2xl border border-red-500/40 bg-red-500/5 px-4 py-3 text-xs text-red-400">
                <AlertCircle size={14} className="mt-0.5" />
                <span>{error}</span>
              </div>
            ) : null}
          </section>
          </>
        ) : null}

        {/* Agent Handover Configuration - Hidden as requested */}
        {/* <section className="space-y-6">
          ... (hidden content) ...
        </section> */}

        {/* Section picker only */}
        <section className="rounded-3xl border border-[#D9E1F2] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.16)] md:p-6">
          <div className="text-[11px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">SECTIONS</div>
          <h2 className="mt-2 text-3xl font-black tracking-tight text-[#050579] md:text-4xl">สร้างฟอร์มโดยเลือก section ทีละส่วน</h2>
          <p className="mt-3 text-sm leading-relaxed text-[#64748B]">
            เลือกประเภท section ด้านล่าง ระบบจะเพิ่มเข้าฟอร์มให้ตามที่คุณเลือก
          </p>

          {form.fields.length > 0 ? (
            <div className="mt-5 space-y-4">
              {form.fields.map((field, index) => (
                <div key={field.id} className="rounded-[28px] border border-[#D9E1F2] bg-[#F8FAFF] p-4 md:p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div className="text-[11px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">SECTION {index + 1}</div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => moveField(index, "up")}
                        disabled={index === 0}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D1DBEF] bg-white text-[#64748B] disabled:opacity-40"
                      >
                        <ArrowUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveField(index, "down")}
                        disabled={index === form.fields.length - 1}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D1DBEF] bg-white text-[#64748B] disabled:opacity-40"
                      >
                        <ArrowDown size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => confirmRemoveField(index)}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#FECACA] bg-white text-[#DC2626]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#94A3B8]">ประเภท section</label>
                      <select
                        value={field.type}
                        onChange={(e) => {
                          const nextType = e.target.value as FieldType;
                          const preset = getFieldPreset(nextType);
                          updateField(index, { type: nextType, ...preset });
                        }}
                        className="h-12 w-full rounded-2xl border border-[#D9E1F2] bg-white px-4 text-sm font-black text-[#050579] outline-none focus:ring-2 focus:ring-[#050579]/10"
                      >
                        {(
                          [
                            "text",
                            "email",
                            "phone",
                            "textarea",
                            "dropdown",
                            "checkbox",
                          ] as FieldType[]
                        ).map((type) => (
                          <option key={type} value={type}>
                            {FIELD_TYPE_LABEL[type]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#94A3B8]">หัวข้อ</label>
                      <input
                        value={field.label}
                        onChange={(e) => updateField(index, { label: e.target.value })}
                        className="h-12 w-full rounded-2xl border border-[#D9E1F2] bg-white px-4 text-sm font-semibold text-[#0F172A] outline-none focus:ring-2 focus:ring-[#050579]/10"
                        placeholder="หัวข้อ section"
                      />
                    </div>

                    {field.type !== "checkbox" ? (
                      <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#94A3B8]">ตัวอย่างข้อความ</label>
                        {field.type === "textarea" ? (
                          <textarea
                            value={field.placeholder || ""}
                            onChange={(e) => updateField(index, { placeholder: e.target.value })}
                            className="min-h-[120px] w-full rounded-2xl border border-[#D9E1F2] bg-white px-4 py-3 text-sm font-semibold text-[#0F172A] outline-none focus:ring-2 focus:ring-[#050579]/10"
                            placeholder="เนื้อหา"
                          />
                        ) : (
                          <input
                            value={field.placeholder || ""}
                            onChange={(e) => updateField(index, { placeholder: e.target.value })}
                            className="h-12 w-full rounded-2xl border border-[#D9E1F2] bg-white px-4 text-sm font-semibold text-[#0F172A] outline-none focus:ring-2 focus:ring-[#050579]/10"
                            placeholder="ตัวอย่างข้อความ"
                          />
                        )}
                      </div>
                    ) : null}

                    {field.type === "dropdown" ? (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-[#94A3B8]">ตัวเลือก</label>
                        {(field.options || []).map((option, optionIndex) => (
                          <input
                            key={`${field.id}-option-${optionIndex}`}
                            value={option}
                            onChange={(e) => updateSingleDropdownOption(index, optionIndex, e.target.value)}
                            className="h-11 w-full rounded-2xl border border-[#D9E1F2] bg-white px-4 text-sm font-semibold text-[#0F172A] outline-none focus:ring-2 focus:ring-[#050579]/10"
                            placeholder={`ตัวเลือกที่ ${optionIndex + 1}`}
                          />
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const nextOptions = [...(field.options || []), `ตัวเลือกที่ ${(field.options?.length || 0) + 1}`];
                            updateField(index, { options: nextOptions });
                          }}
                          className="w-full rounded-2xl border border-[#D9E1F2] bg-white px-4 py-2.5 text-sm font-black text-[#64748B]"
                        >
                          เพิ่มตัวเลือก
                        </button>
                      </div>
                    ) : null}

                    <label className="flex items-center gap-2 rounded-xl border border-[#D9E1F2] bg-white px-3 py-2.5">
                      <input
                        type="checkbox"
                        checked={field.required}
                        onChange={(e) => updateField(index, { required: e.target.checked })}
                        className="h-4 w-4 rounded border-[#CBD5E1] text-[#F97316] focus:ring-[#F97316]"
                      />
                      <span className="text-sm font-bold text-[#0F172A]">บังคับ</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          <div className="mt-5 rounded-[28px] border border-dashed border-[#D9E1F2] bg-[#F8FAFF] p-4 md:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-black uppercase tracking-[0.14em] text-[#94A3B8]">เพิ่ม Section</div>
                <div className="truncate text-lg font-black text-[#050579]">
                  {form.fields.length > 0 ? "เลือก section ถัดไป" : "เลือก section แรกของคุณ"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <QuickAddFieldButton label="ข้อความ" onClick={() => addField("text")} />
              <QuickAddFieldButton label="อีเมล" onClick={() => addField("email")} />
              <QuickAddFieldButton label="เบอร์โทร" onClick={() => addField("phone")} />
              <QuickAddFieldButton label="ข้อความยาว" onClick={() => addField("textarea")} />
              <QuickAddFieldButton label="ตัวเลือก" onClick={() => addField("dropdown")} />
              <QuickAddFieldButton label="Checkbox" onClick={() => addField("checkbox")} />
            </div>

            {form.fields.length > 0 ? (
              <button
                type="button"
                onClick={() => setForm({ ...form, fields: [] })}
                className="mt-4 w-full rounded-2xl border border-[#FECACA] bg-white px-4 py-3 text-sm font-black text-[#DC2626] transition-colors hover:bg-[#FFF5F5]"
              >
                ล้าง section ทั้งหมด
              </button>
            ) : null}

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <a
                href={`${SITE_URL}/forms/${form.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-[#D9E1F2] bg-white px-4 text-sm font-black text-[#050579] transition-colors hover:bg-[#F8FAFF]"
              >
                ดูหน้าจริง
              </a>
              <button
                type="button"
                onClick={saveForm}
                disabled={saving}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#F97316] px-4 text-sm font-black text-white shadow-[0_18px_36px_-24px_rgba(249,115,22,0.85)] transition-all hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-55"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : null}
                {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
              </button>
            </div>
          </div>
        </section>
      </main>

      {editingFieldIndex !== null && form?.fields[editingFieldIndex] ? (
        <div
          className="fixed inset-0 z-[90] flex items-end bg-black/45 backdrop-blur-sm md:hidden"
          onClick={requestCloseFieldEditor}
        >
          <div
            className="flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-[32px] border border-[#D9E1F2] bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            onTouchStart={handleSheetTouchStart}
            onTouchMove={handleSheetTouchMove}
            onTouchEnd={handleSheetTouchEnd}
            style={{
              transform: `translateY(${sheetTouchDeltaY}px)`,
              transition: sheetTouchStartY === null ? "transform 180ms ease-out" : "none",
            }}
          >
            <div className="sticky top-0 z-10 border-b border-[#E2E8F0] bg-white px-4 pb-4 pt-3">
              <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-[#D9E1F2]" />
              <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={requestCloseFieldEditor}
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] text-[#64748B]"
                  aria-label="ย้อนกลับ"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.18em] text-[#94A3B8]">
                    Field {editingFieldIndex + 1}
                  </div>
                  <div className="mt-1 text-lg font-black text-[#050579]">
                    {form.fields[editingFieldIndex].label || `ช่องที่ ${editingFieldIndex + 1}`}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={requestCloseFieldEditor}
                className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] text-[#64748B]"
                aria-label="ปิด"
              >
                <X size={18} />
              </button>
              </div>
            </div>

            <div className="border-b border-[#EEF2FF] bg-white px-4 pb-4">
              <div className="rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] px-4 py-3 text-sm text-[#64748B]">
                แก้ทีละช่องได้จากหน้านี้เลย ไม่ต้องเลื่อนยาวทั้งหน้า
              </div>
            </div>

            <div className="overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom,0px)+16px)] pt-4">
              <FieldEditorFields
                field={form.fields[editingFieldIndex]}
                index={editingFieldIndex}
                updateField={updateField}
                updateDropdownOptionCount={updateDropdownOptionCount}
                updateSingleDropdownOption={updateSingleDropdownOption}
              />
              <button
                type="button"
                onClick={() => confirmRemoveField(editingFieldIndex)}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#FECACA] bg-[#FFF5F5] px-4 py-3 text-sm font-black text-[#DC2626]"
              >
                <Trash2 size={16} />
                ลบช่องนี้
              </button>
              <button
                type="button"
                onClick={saveAndCloseFieldEditor}
                className="mt-3 flex w-full items-center justify-center rounded-2xl bg-[#F97316] px-4 py-3 text-sm font-black text-white shadow-[0_18px_36px_-24px_rgba(249,115,22,0.85)] transition-all hover:bg-[#EA580C]"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FieldEditorFields({
  field,
  index,
  updateField,
  updateDropdownOptionCount,
  updateSingleDropdownOption,
}: {
  field: FormFieldConfig;
  index: number;
  updateField: (index: number, patch: Partial<FormFieldConfig>) => void;
  updateDropdownOptionCount: (index: number, raw: string) => void;
  updateSingleDropdownOption: (index: number, optionIndex: number, value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground/40">
          ชื่อช่องที่แสดงบนฟอร์ม
        </label>
        <input
          className="w-full rounded-xl border border-foreground/10 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={field.label}
          onChange={(e) => updateField(index, { label: e.target.value })}
        />
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground/40">
          การบังคับกรอก
        </label>
        <label className="flex items-center gap-3 rounded-xl border border-[#D9E1F2] bg-white px-4 py-3">
          <input
            type="checkbox"
            checked={field.required}
            onChange={(e) => updateField(index, { required: e.target.checked })}
            className="h-5 w-5 rounded border-[#CBD5E1] text-[#F97316] focus:ring-[#F97316]"
          />
          <span className="text-sm font-bold text-[#0F172A]">
            {field.required ? "บังคับ" : "ไม่บังคับ"}
          </span>
        </label>
      </div>

      {field.type === "dropdown" ? (
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-[0.18em] text-foreground/40">
              จำนวนตัวเลือก
            </label>
            <input
              type="number"
              min={1}
              value={Math.max(1, field.options?.length || 1)}
              onChange={(e) => updateDropdownOptionCount(index, e.target.value)}
              className="w-full rounded-xl border border-foreground/10 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-2">
            {(field.options || ["ตัวเลือกที่ 1"]).map((option, optionIndex) => (
              <input
                key={`${field.id}-mobile-option-${optionIndex}`}
                value={option}
                onChange={(e) =>
                  updateSingleDropdownOption(index, optionIndex, e.target.value)
                }
                className="w-full rounded-xl border border-foreground/10 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder={`ตัวเลือกที่ ${optionIndex + 1}`}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function HandoverCard({
  icon,
  title,
  description,
  enabled,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (val: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={`p-6 rounded-[28px] border transition-all ${
        enabled
          ? "border-primary/30 bg-primary/5 shadow-lg shadow-primary/5"
          : "border-foreground/5 bg-foreground/5/40"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              enabled ? "bg-primary text-white" : "bg-foreground/10 text-foreground/40"
            }`}
          >
            {icon}
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight">{title}</h4>
            <p className="text-[10px] text-foreground/40 font-medium">
              {description}
            </p>
          </div>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            enabled ? "bg-primary" : "bg-foreground/20"
          }`}
        >
          <div
            className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-transform ${
              enabled ? "left-6" : "left-1"
            }`}
          />
        </button>
      </div>
      {enabled && children}
    </div>
  );
}

function FieldTypeButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 py-2 rounded-2xl border border-foreground/10 bg-foreground/5 text-[11px] font-black uppercase tracking-[0.18em] text-foreground/60 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all"
    >
      <Plus size={12} className="inline-block mr-1" />
      {label}
    </button>
  );
}

function QuickAddFieldButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center gap-2 rounded-2xl border border-[#D9E1F2] bg-white px-4 py-4 text-sm font-black text-[#050579] shadow-sm transition-all active:scale-[0.98]"
    >
      <Plus size={16} />
      {label}
    </button>
  );
}
