"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  ArrowLeft,
  Loader2,
  ListChecks,
  GripVertical,
  Trash2,
  Plus,
  AlertCircle,
  Mail,
  MessageCircle,
  Facebook,
  Link as LinkIcon,
  Webhook,
  Copy,
  Check,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

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
}

export default function FormBuilderPage() {
  const router = useRouter();
  const params = useParams();
  const formId = params.id as string;

  const token = Cookies.get("token");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [form, setForm] = useState<FormItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }
    loadForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, formId]);

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
        fields: data.fields || [],
        agent_handover_config: data.agent_handover_config || defaultHandover,
      });
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

  const addField = (type: FieldType) => {
    if (!form) return;
    const idBase = type === "dropdown" ? "option" : type;
    const newField: FormFieldConfig = {
      id: `${idBase}_${Date.now()}`,
      type,
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
      required: type !== "checkbox",
      options: type === "dropdown" ? ["ตัวเลือกที่ 1", "ตัวเลือกที่ 2"] : undefined,
    };
    setForm({ ...form, fields: [...form.fields, newField] });
  };

  const removeField = (index: number) => {
    if (!form) return;
    const next = [...form.fields];
    next.splice(index, 1);
    setForm({ ...form, fields: next });
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

  const [copied, setCopied] = useState(false);
  const handleCopyLink = () => {
    const link = `${window.location.origin}/lp/form/${formId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
      {/* Header */}
      <header className="border-b border-foreground/5 bg-background/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/manage/forms"
              className="w-10 h-10 rounded-xl hover:bg-foreground/5 flex items-center justify-center transition-all group"
            >
              <ArrowLeft
                size={18}
                className="text-foreground/40 group-hover:text-foreground transition-colors"
              />
            </Link>
            <h1 className="font-bold text-xl tracking-tight flex items-center gap-2">
              <ListChecks size={20} className="text-primary" /> แก้ไขโครงฟอร์ม
              <span className="text-foreground/20 font-normal hidden sm:inline">
                (Field Builder)
              </span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={saveForm}
              disabled={saving}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/30 active:scale-95 transition-all"
            >
              {saving ? <Loader2 className="animate-spin" size={16} /> : null}
              บันทึกโครงฟอร์ม
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        {/* Form meta */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-8 items-start">
          <div className="p-8 rounded-[32px] border border-foreground/5 bg-foreground/5/40 glass-card space-y-5">
            <div className="space-y-2">
              <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] ml-1">
                ชื่อฟอร์ม
              </label>
              <input
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

          <div className="p-6 rounded-[32px] border border-foreground/5 bg-foreground/5/40 glass-card text-sm space-y-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-foreground/40">
              หมายเหตุการใช้งาน
            </h3>
            <ul className="list-disc list-inside space-y-1 text-foreground/60 text-xs">
              <li>Field ID ใช้สำหรับอ้างอิงในระบบและ export CSV</li>
              <li>ประเภท Email / Phone จะใช้ช่วยตรวจรูปแบบข้อมูลฝั่ง frontend</li>
              <li>
                ช่องที่ติ๊ก Required จะต้องกรอกก่อนส่งฟอร์ม
              </li>
              <li>
                Dropdown ให้กรอกตัวเลือกทีละบรรทัด ระบบจะบันทึกเป็นรายการตัวเลือก
              </li>
            </ul>
            <div className="pt-3 border-t border-foreground/10 flex items-center justify-between gap-2">
              <span className="text-[11px] text-foreground/40">
                ดูข้อมูลที่ลูกค้าส่งมาจากฟอร์มนี้
              </span>
              <Link
                href={`/manage/forms/${formId}/submissions`}
                className="text-[11px] font-black uppercase tracking-[0.2em] text-primary hover:text-primary/80"
              >
                เปิดรายการ Submissions →
              </Link>
            </div>
          </div>
        </section>

        {/* Agent Handover Configuration - Hidden as requested */}
        {/* <section className="space-y-6">
          ... (hidden content) ...
        </section> */}

        {/* Fields editor */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-black tracking-tight">
              ช่องในฟอร์ม (Field Types)
            </h2>
            <div className="flex gap-2 flex-wrap">
              <FieldTypeButton label="ข้อความ" onClick={() => addField("text")} />
              <FieldTypeButton label="อีเมล" onClick={() => addField("email")} />
              <FieldTypeButton label="เบอร์โทร" onClick={() => addField("phone")} />
              <FieldTypeButton
                label="ข้อความยาว"
                onClick={() => addField("textarea")}
              />
              <FieldTypeButton
                label="ตัวเลือก (Dropdown)"
                onClick={() => addField("dropdown")}
              />
              <FieldTypeButton
                label="Checkbox"
                onClick={() => addField("checkbox")}
              />
            </div>
          </div>

          {form.fields.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-foreground/10 rounded-[40px] bg-foreground/5 glass-card text-sm text-foreground/40">
              ยังไม่มีช่องในฟอร์ม เริ่มเพิ่มช่องจากด้านบนได้เลย
            </div>
          ) : (
            <div className="space-y-4">
              {form.fields.map((field, index) => (
                <div
                  key={field.id}
                  className="group bg-card-bg border border-foreground/5 rounded-[28px] p-5 flex flex-col gap-4 md:flex-row md:items-start md:gap-6 hover:border-primary/30 transition-all"
                >
                  <div className="flex flex-col items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => moveField(index, "up")}
                      className="p-1.5 rounded-full hover:bg-foreground/10 text-foreground/30 hover:text-foreground transition-colors"
                    >
                      <GripVertical size={16} />
                    </button>
                    <span className="text-[10px] text-foreground/30 font-mono">
                      {index + 1}
                    </span>
                  </div>

                  <div className="flex-1 space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.9fr] gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.18em]">
                          Label แสดงบนฟอร์ม
                        </label>
                        <input
                          className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={field.label}
                          onChange={(e) =>
                            updateField(index, { label: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.18em]">
                          Field ID
                        </label>
                        <input
                          className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={field.id}
                          onChange={(e) =>
                            updateField(index, { id: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[0.9fr_0.9fr_auto] gap-3 items-end">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.18em]">
                          ประเภทข้อมูล (Field Type)
                        </label>
                        <select
                          className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={field.type}
                          onChange={(e) =>
                            updateField(index, {
                              type: e.target.value as FieldType,
                            })
                          }
                        >
                          <option value="text">ข้อความสั้น (Text)</option>
                          <option value="email">อีเมล (Email)</option>
                          <option value="phone">เบอร์โทรศัพท์ (Phone)</option>
                          <option value="textarea">ข้อความยาว (Textarea)</option>
                          <option value="dropdown">ตัวเลือก (Dropdown)</option>
                          <option value="checkbox">Checkbox</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.18em]">
                          Placeholder (ข้อความตัวอย่าง)
                        </label>
                        <input
                          className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                          value={field.placeholder || ""}
                          onChange={(e) =>
                            updateField(index, {
                              placeholder: e.target.value,
                            })
                          }
                          disabled={field.type === "checkbox"}
                        />
                      </div>

                      <div className="flex flex-col gap-1 items-start">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.18em]">
                          Required
                        </label>
                        <button
                          type="button"
                          onClick={() =>
                            updateField(index, { required: !field.required })
                          }
                          className={`px-3 py-2 rounded-xl text-[11px] font-bold border transition-all ${
                            field.required
                              ? "bg-primary text-white border-primary/60"
                              : "bg-background text-foreground/50 border-foreground/10"
                          }`}
                        >
                          {field.required ? "ต้องกรอก" : "ไม่บังคับ"}
                        </button>
                      </div>
                    </div>

                    {field.type === "dropdown" && (
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.18em]">
                          ตัวเลือกของ Dropdown (หนึ่งบรรทัดต่อหนึ่งตัวเลือก)
                        </label>
                        <textarea
                          className="w-full bg-background border border-foreground/10 rounded-xl px-3 py-2.5 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
                          value={(field.options || []).join("\n")}
                          onChange={(e) =>
                            updateDropdownOptions(index, e.target.value)
                          }
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <button
                      type="button"
                      onClick={() => removeField(index)}
                      className="p-2 rounded-xl text-foreground/30 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
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

