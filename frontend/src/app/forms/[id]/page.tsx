"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";

interface FormFieldConfig {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
}

interface PublicForm {
  id: number;
  name: string;
  description?: string;
  fields: FormFieldConfig[];
}

export default function PublicFormPage() {
  const params = useParams();
  const formId = params.id as string;

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  const [formConfig, setFormConfig] = useState<PublicForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [values, setValues] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        const res = await fetch(`${API_URL}/public/forms/${formId}`);
        if (!res.ok) {
          setFormConfig(null);
          return;
        }
        const data = await res.json();
        setFormConfig(data);

        // เตรียมค่าเริ่มต้นของฟิลด์ (เช่น checkbox=false)
        if (data.fields && Array.isArray(data.fields)) {
          const initial: Record<string, any> = {};
          data.fields.forEach((f: FormFieldConfig) => {
            if (f.type === "checkbox") {
              initial[f.id] = false;
            } else {
              initial[f.id] = "";
            }
          });
          setValues(initial);
        }
      } catch (e) {
        console.error("โหลดฟอร์มไม่สำเร็จ", e);
        setFormConfig(null);
      } finally {
        setLoading(false);
      }
    };

    fetchForm();
  }, [API_URL, formId]);

  const handleChange = (fieldId: string, value: any) => {
    setValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }));
  };

  const validate = (): boolean => {
    if (!formConfig) return false;
    for (const field of formConfig.fields || []) {
      const v = values[field.id];
      if (field.required) {
        if (field.type === "checkbox") {
          if (!v) {
            setError(`กรุณายืนยัน "${field.label}"`);
            return false;
          }
        } else if (v === undefined || v === null || String(v).trim() === "") {
          setError(`กรุณากรอก "${field.label}" ให้ครบถ้วน`);
          return false;
        }
      }
      if (field.type === "email" && v) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(v))) {
          setError("รูปแบบอีเมลไม่ถูกต้อง");
          return false;
        }
      }
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formConfig) return;
    if (!validate()) return;

    try {
      setSubmitting(true);
      setError(null);
      setSuccess(false);

      const res = await fetch(`${API_URL}/public/forms/${formId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: values,
        }),
      });

      if (!res.ok) {
        throw new Error("ส่งฟอร์มไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "เกิดข้อผิดพลาดระหว่างส่งฟอร์ม");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (!formConfig) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
          <AlertCircle className="text-foreground/40" size={28} />
        </div>
        <h1 className="text-2xl font-bold mb-2">ไม่พบแบบฟอร์ม</h1>
        <p className="text-foreground/50 text-sm mb-6 max-w-sm">
          ฟอร์มนี้อาจถูกปิดการใช้งาน หรือลบออกจากระบบแล้ว
        </p>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          กลับหน้าก่อนหน้า
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-card-bg border border-foreground/5 rounded-[32px] p-8 shadow-2xl glass-card">
        <div className="mb-6">
          <h1 className="text-2xl font-black tracking-tight mb-2">
            {formConfig.name}
          </h1>
          {formConfig.description && (
            <p className="text-sm text-foreground/60">
              {formConfig.description}
            </p>
          )}
        </div>

        {success ? (
          <div className="flex flex-col items-center text-center py-10">
            <CheckCircle2 className="text-emerald-400 mb-3" size={36} />
            <h2 className="text-lg font-semibold mb-1">
              ส่งข้อมูลเรียบร้อยแล้ว
            </h2>
            <p className="text-sm text-foreground/60 mb-6">
              ขอบคุณที่กรอกข้อมูล ทีมงานจะติดต่อกลับโดยเร็วที่สุด
            </p>
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                // รีเซ็ตค่าในฟอร์ม
                const reset: Record<string, any> = {};
                formConfig.fields.forEach((f) => {
                  reset[f.id] = f.type === "checkbox" ? false : "";
                });
                setValues(reset);
              }}
              className="px-4 py-2 rounded-xl border border-foreground/10 text-xs font-semibold hover:border-primary/40 hover:text-primary transition-colors"
            >
              กรอกใหม่อีกครั้ง
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {formConfig.fields?.map((field) => (
              <div key={field.id} className="space-y-1">
                {field.type !== "checkbox" && (
                  <label className="block text-xs font-semibold text-foreground/70">
                    {field.label}
                    {field.required && (
                      <span className="text-red-400 ml-0.5">*</span>
                    )}
                  </label>
                )}
                {renderField(field, values[field.id], handleChange)}
              </div>
            ))}

            {error && (
              <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                <AlertCircle size={14} />
                <span>{error}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white px-4 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-primary/30 active:scale-95 transition-all"
            >
              {submitting && <Loader2 className="animate-spin" size={16} />}
              ส่งข้อมูล
            </button>

            <p className="mt-4 text-[10px] text-foreground/40 text-center">
              ฟอร์มนี้สร้างด้วย{" "}
              <Link
                href="/"
                className="font-semibold text-primary hover:text-primary/80"
              >
                NEX Solution
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function renderField(
  field: FormFieldConfig,
  value: any,
  onChange: (id: string, value: any) => void,
) {
  const commonInputClass =
    "w-full bg-background border border-foreground/10 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20";

  switch (field.type) {
    case "textarea":
      return (
        <textarea
          className={`${commonInputClass} min-h-[90px]`}
          placeholder={field.placeholder}
          value={value || ""}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      );
    case "dropdown":
      return (
        <select
          className={commonInputClass}
          value={value || ""}
          onChange={(e) => onChange(field.id, e.target.value)}
        >
          <option value="">-- กรุณาเลือก --</option>
          {field.options?.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    case "checkbox":
      return (
        <label className="flex items-start gap-2 text-xs text-foreground/70 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 w-4 h-4 rounded border border-foreground/20 text-primary focus:ring-primary/40"
            checked={!!value}
            onChange={(e) => onChange(field.id, e.target.checked)}
          />
          <span>
            {field.label}
            {field.required && <span className="text-red-400 ml-0.5">*</span>}
          </span>
        </label>
      );
    default:
      // text / email / phone
      const inputType =
        field.type === "email"
          ? "email"
          : field.type === "phone"
          ? "tel"
          : "text";
      return (
        <input
          type={inputType}
          className={commonInputClass}
          placeholder={field.placeholder}
          value={value || ""}
          onChange={(e) => onChange(field.id, e.target.value)}
        />
      );
  }
}

