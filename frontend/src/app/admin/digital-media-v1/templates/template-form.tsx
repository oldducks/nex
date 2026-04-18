"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";

type FieldType = "text" | "textarea" | "image" | "select" | "color";
type MediaType = "image" | "video";

interface Category {
  id: number;
  name: string;
  slug?: string;
}

interface FieldForm {
  id?: number;
  field_key: string;
  field_label: string;
  field_type: FieldType;
  placeholder: string;
  help_text: string;
  is_required: boolean;
  default_value: string;
  options_json_text: string;
  sort_order: number;
}

interface TemplatePayload {
  name: string;
  slug: string;
  category_id: number;
  category_name?: string;
  description: string;
  cover_image_url: string;
  preview_video_url: string;
  media_type: MediaType;
  enable_product_replace: boolean;
  product_mask_url: string;
  prompt_template: string;
  negative_prompt: string;
  style_preset: string;
  aspect_ratio: "1:1" | "4:5" | "9:16";
  status: "draft" | "active" | "inactive";
  sort_order: number;
  fields: FieldForm[];
}

interface TemplateFormProps {
  mode: "create" | "edit";
  templateId?: number;
}

interface AdminTemplateFieldResponse {
  id: number;
  field_key: string;
  field_label: string;
  field_type: FieldType;
  placeholder?: string;
  help_text?: string;
  is_required?: boolean;
  default_value?: string;
  options_json?: Array<{ label: string; value: string }>;
  sort_order?: number;
}

interface AdminTemplateResponse {
  name: string;
  slug: string;
  category_id: number;
  description?: string;
  cover_image_url?: string;
  preview_video_url?: string;
  media_type?: MediaType;
  enable_product_replace?: boolean;
  product_mask_url?: string;
  prompt_template: string;
  negative_prompt?: string;
  style_preset?: string;
  aspect_ratio?: "1:1" | "4:5" | "9:16";
  status?: "draft" | "active" | "inactive";
  sort_order?: number;
  fields?: AdminTemplateFieldResponse[];
}

const emptyField = (sortOrder: number): FieldForm => ({
  field_key: "",
  field_label: "",
  field_type: "text",
  placeholder: "",
  help_text: "",
  is_required: false,
  default_value: "",
  options_json_text: "[]",
  sort_order: sortOrder,
});

const initialForm: TemplatePayload = {
  name: "",
  slug: "",
  category_id: 0,
  description: "",
  cover_image_url: "",
  preview_video_url: "",
  media_type: "image",
  enable_product_replace: false,
  product_mask_url: "",
  prompt_template: "",
  negative_prompt: "",
  style_preset: "standard",
  aspect_ratio: "1:1",
  status: "draft",
  sort_order: 0,
  fields: [emptyField(1)],
};

const normalizeFieldKey = (fieldKey: string) =>
  String(fieldKey || "")
    .trim()
    .replace(/^\{+/, "")
    .replace(/\}+$/, "")
    .trim();

const getDefaultOptionsByField = (fieldKey: string, fieldType: FieldType) => {
  const normalizedKey = normalizeFieldKey(fieldKey);
  if (fieldType === "select" && normalizedKey === "aspect_ratio") {
    return [
      { label: "1:1", value: "1:1" },
      { label: "4:5", value: "4:5" },
      { label: "9:16", value: "9:16" },
    ];
  }
  return [];
};

type AutoMaskBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const detectAutoMaskBox = (imageData: ImageData, width: number, height: number): AutoMaskBox => {
  const data = imageData.data;
  const luminance = new Float32Array(width * height);

  for (let i = 0, p = 0; i < luminance.length; i += 1, p += 4) {
    luminance[i] = data[p] * 0.2126 + data[p + 1] * 0.7152 + data[p + 2] * 0.0722;
  }

  const colScore = new Float32Array(width);
  const rowScore = new Float32Array(height);

  const roiXStart = Math.floor(width * 0.1);
  const roiXEnd = Math.ceil(width * 0.9);
  const roiYStart = Math.floor(height * 0.14);
  const roiYEnd = Math.ceil(height * 0.94);

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      if (x < roiXStart || x > roiXEnd || y < roiYStart || y > roiYEnd) continue;

      const idx = y * width + x;
      const gx =
        -luminance[idx - width - 1] -
        2 * luminance[idx - 1] -
        luminance[idx + width - 1] +
        luminance[idx - width + 1] +
        2 * luminance[idx + 1] +
        luminance[idx + width + 1];
      const gy =
        luminance[idx - width - 1] +
        2 * luminance[idx - width] +
        luminance[idx - width + 1] -
        luminance[idx + width - 1] -
        2 * luminance[idx + width] -
        luminance[idx + width + 1];

      const magnitude = Math.sqrt(gx * gx + gy * gy);
      if (magnitude < 24) continue;

      const centerWeightX = 1 - Math.abs(x / width - 0.5) * 1.15;
      const centerWeightY = 1 - Math.abs(y / height - 0.56) * 1.1;
      const weight = Math.max(0.1, centerWeightX) * Math.max(0.1, centerWeightY);
      const score = magnitude * weight;
      colScore[x] += score;
      rowScore[y] += score;
    }
  }

  const smooth = (arr: Float32Array, radius = 3) => {
    const result = new Float32Array(arr.length);
    for (let i = 0; i < arr.length; i += 1) {
      let total = 0;
      let count = 0;
      for (let j = Math.max(0, i - radius); j <= Math.min(arr.length - 1, i + radius); j += 1) {
        total += arr[j];
        count += 1;
      }
      result[i] = count > 0 ? total / count : 0;
    }
    return result;
  };

  const colSmooth = smooth(colScore, 4);
  const rowSmooth = smooth(rowScore, 4);

  const findPeak = (arr: Float32Array, start: number, end: number) => {
    let peakIndex = start;
    let peakValue = -1;
    for (let i = start; i <= end; i += 1) {
      if (arr[i] > peakValue) {
        peakValue = arr[i];
        peakIndex = i;
      }
    }
    return { peakIndex, peakValue: Math.max(0, peakValue) };
  };

  const colPeak = findPeak(colSmooth, roiXStart, roiXEnd);
  const rowPeak = findPeak(rowSmooth, roiYStart, roiYEnd);

  if (colPeak.peakValue <= 0 || rowPeak.peakValue <= 0) {
    const fallbackWidth = Math.round(width * 0.42);
    const fallbackHeight = Math.round(height * 0.68);
    return {
      x: Math.round((width - fallbackWidth) / 2),
      y: Math.round((height - fallbackHeight) / 2),
      width: fallbackWidth,
      height: fallbackHeight,
    };
  }

  const expandRange = (
    arr: Float32Array,
    peakIndex: number,
    peakValue: number,
    minIndex: number,
    maxIndex: number,
    thresholdRatio: number,
  ) => {
    const threshold = peakValue * thresholdRatio;
    let start = peakIndex;
    let end = peakIndex;
    while (start > minIndex && arr[start] >= threshold) start -= 1;
    while (end < maxIndex && arr[end] >= threshold) end += 1;
    return { start, end };
  };

  const colRange = expandRange(colSmooth, colPeak.peakIndex, colPeak.peakValue, roiXStart, roiXEnd, 0.3);
  const rowRange = expandRange(rowSmooth, rowPeak.peakIndex, rowPeak.peakValue, roiYStart, roiYEnd, 0.32);

  let detectedWidth = Math.max(1, colRange.end - colRange.start);
  let detectedHeight = Math.max(1, rowRange.end - rowRange.start);
  let x = colRange.start;
  let y = rowRange.start;

  const minWidth = Math.round(width * 0.24);
  const maxWidth = Math.round(width * 0.62);
  const minHeight = Math.round(height * 0.5);
  const maxHeight = Math.round(height * 0.84);

  detectedWidth = clamp(detectedWidth, minWidth, maxWidth);
  detectedHeight = clamp(detectedHeight, minHeight, maxHeight);

  x = clamp(Math.round(colPeak.peakIndex - detectedWidth / 2), 0, width - detectedWidth);
  y = clamp(Math.round(rowPeak.peakIndex - detectedHeight / 2), 0, height - detectedHeight);

  const padX = Math.round(detectedWidth * 0.14);
  const padYTop = Math.round(detectedHeight * 0.32);
  const padYBottom = Math.round(detectedHeight * 0.18);

  let finalX = clamp(x - padX, 0, width - 1);
  let finalY = clamp(y - padYTop, 0, height - 1);
  let finalW = clamp(detectedWidth + padX * 2, 1, width - finalX);
  let finalH = clamp(detectedHeight + padYTop + padYBottom, 1, height - finalY);

  // Force a tall "product slot" so old product is fully covered.
  const minTallHeight = Math.round(height * 0.62);
  if (finalH < minTallHeight) {
    const grow = minTallHeight - finalH;
    finalY = clamp(finalY - Math.round(grow * 0.55), 0, height - 1);
    finalH = clamp(finalH + grow, 1, height - finalY);
  }

  // Keep mask centered and avoid dropping too low (which leaves old top product untouched).
  const maxTop = Math.round(height * 0.22);
  if (finalY > maxTop) {
    const shiftUp = finalY - maxTop;
    finalY = maxTop;
    finalH = clamp(finalH + shiftUp, 1, height - finalY);
  }

  // Keep product slot portrait-like.
  const minPortraitWidth = Math.round(width * 0.24);
  const maxPortraitWidth = Math.round(width * 0.5);
  finalW = clamp(finalW, minPortraitWidth, maxPortraitWidth);
  finalX = clamp(Math.round(colPeak.peakIndex - finalW / 2), 0, width - finalW);

  return {
    x: finalX,
    y: finalY,
    width: finalW,
    height: finalH,
  };
};

export function TemplateForm({ mode, templateId }: TemplateFormProps) {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const token = Cookies.get("token");

  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<TemplatePayload>(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverUploadError, setCoverUploadError] = useState<string | null>(null);
  const [maskUploading, setMaskUploading] = useState(false);
  const [maskUploadError, setMaskUploadError] = useState<string | null>(null);
  const [maskGenerateError, setMaskGenerateError] = useState<string | null>(null);
  const [maskGenerateSuccess, setMaskGenerateSuccess] = useState<string | null>(null);
  const [maskGenerating, setMaskGenerating] = useState(false);
  const [mockupGenerating, setMockupGenerating] = useState(false);
  const [mockupError, setMockupError] = useState<string | null>(null);
  const [mockupSuccess, setMockupSuccess] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [expandedAdvancedFields, setExpandedAdvancedFields] = useState<number[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const categoryRes = await fetch(`${API_URL}/admin/digital-media/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (categoryRes.ok) {
          const categoryData = (await categoryRes.json()) as Category[];
          setCategories(categoryData || []);

          if (mode === "create" && categoryData.length > 0) {
            setForm((prev) => ({ ...prev, category_id: categoryData[0].id }));
          }
        }

        if (mode === "edit" && templateId) {
          const templateRes = await fetch(`${API_URL}/admin/digital-media/templates/${templateId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!templateRes.ok) throw new Error("โหลด template ไม่สำเร็จ");

          const templateData = (await templateRes.json()) as AdminTemplateResponse;
          setForm({
            name: templateData.name || "",
            slug: templateData.slug || "",
            category_id: templateData.category_id || 0,
            description: templateData.description || "",
            cover_image_url: templateData.cover_image_url || "",
            preview_video_url: templateData.preview_video_url || "",
            media_type: templateData.media_type || "image",
            enable_product_replace: Boolean(templateData.enable_product_replace),
            product_mask_url: templateData.product_mask_url || "",
            prompt_template: templateData.prompt_template || "",
            negative_prompt: templateData.negative_prompt || "",
            style_preset: templateData.style_preset || "standard",
            aspect_ratio: templateData.aspect_ratio || "1:1",
            status: templateData.status || "draft",
            sort_order: templateData.sort_order || 0,
            fields: (templateData.fields || []).map((field, index: number) => ({
              id: field.id,
              field_key: normalizeFieldKey(field.field_key || ""),
              field_label: field.field_label || "",
              field_type: field.field_type || "text",
              placeholder: field.placeholder || "",
              help_text: field.help_text || "",
              is_required: Boolean(field.is_required),
              default_value: field.default_value || "",
              options_json_text: JSON.stringify(
                (field.options_json && field.options_json.length > 0
                  ? field.options_json
                  : getDefaultOptionsByField(field.field_key || "", field.field_type || "text")),
                null,
                2,
              ),
              sort_order: field.sort_order ?? index + 1,
            })),
          });
        }
      } catch (loadError) {
        console.error(loadError);
        setError("โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [API_URL, mode, templateId, token]);

  const parseOptions = (raw: string) => {
    try {
      const parsed = JSON.parse(raw || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((item) => item && typeof item.label === "string" && typeof item.value === "string")
        .map((item) => ({ label: item.label, value: item.value }));
    } catch {
      return [];
    }
  };

  const schemaPreview = useMemo(
    () =>
      form.fields.map((field) => ({
        field_key: normalizeFieldKey(field.field_key),
        field_label: field.field_label,
        field_type: field.field_type,
        placeholder: field.placeholder,
        help_text: field.help_text,
        is_required: field.is_required,
        default_value: field.default_value,
        options_json: parseOptions(field.options_json_text),
        sort_order: field.sort_order,
      })),
    [form.fields],
  );

  const setField = <K extends keyof TemplatePayload>(key: K, value: TemplatePayload[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const createCategory = async () => {
    if (!token) return;

    const name = newCategoryName.trim();
    if (!name) {
      setCategoryError("กรุณากรอกชื่อหมวดหมู่");
      return;
    }

    setCreatingCategory(true);
    setCategoryError(null);

    try {
      const res = await fetch(`${API_URL}/admin/digital-media/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "create category failed");
      }

      const created = (await res.json()) as Category;
      setCategories((prev) => {
        const exists = prev.some((item) => item.id === created.id);
        if (exists) return prev;
        return [...prev, created];
      });
      setField("category_id", created.id);
      setNewCategoryName("");
    } catch (createError) {
      console.error(createError);
      setCategoryError("เพิ่มหมวดหมู่ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setCreatingCategory(false);
    }
  };

  const setFieldRow = <K extends keyof FieldForm>(index: number, key: K, value: FieldForm[K]) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, [key]: value } : field,
      ),
    }));
  };

  const addField = () => {
    setForm((prev) => ({
      ...prev,
      fields: [...prev.fields, emptyField(prev.fields.length + 1)],
    }));
  };

  const removeField = (index: number) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, fieldIndex) => fieldIndex !== index),
    }));
    setExpandedAdvancedFields((prev) =>
      prev
        .filter((fieldIndex) => fieldIndex !== index)
        .map((fieldIndex) => (fieldIndex > index ? fieldIndex - 1 : fieldIndex)),
    );
  };

  const toggleAdvancedField = (index: number) => {
    setExpandedAdvancedFields((prev) =>
      prev.includes(index) ? prev.filter((item) => item !== index) : [...prev, index],
    );
  };

  const validate = () => {
    if (!form.name.trim()) return "กรุณากรอกชื่อ template";
    if (!form.category_id) return "กรุณาเลือกหมวดหมู่";
    if (!form.prompt_template.trim()) return "กรุณากรอก prompt template";

    for (const field of form.fields) {
      if (!normalizeFieldKey(field.field_key)) return "field_key ห้ามว่าง";
      if (!field.field_label.trim()) return "field_label ห้ามว่าง";
      if (
        field.field_type === "select" &&
        parseOptions(field.options_json_text).length === 0 &&
        getDefaultOptionsByField(field.field_key, field.field_type).length === 0
      ) {
        return `field ${field.field_key || "select"} ต้องมี options_json`; 
      }
    }

    return null;
  };

  const buildTemplatePayload = () => ({
    ...form,
    category_name:
      categories.find((category) => category.id === form.category_id)?.name || form.category_name || "",
    fields: form.fields.map((field, index) => ({
      id: field.id,
      field_key: normalizeFieldKey(field.field_key),
      field_label: field.field_label.trim(),
      field_type: field.field_type,
      placeholder: field.placeholder.trim(),
      help_text: field.help_text.trim(),
      is_required: field.is_required,
      default_value: field.default_value,
      options_json:
        parseOptions(field.options_json_text).length > 0
          ? parseOptions(field.options_json_text)
          : getDefaultOptionsByField(field.field_key, field.field_type),
      sort_order: field.sort_order || index + 1,
    })),
  });

  const save = async () => {
    if (!token) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSaving(true);

    const payload = buildTemplatePayload();

    try {
      const endpoint =
        mode === "edit" && templateId
          ? `${API_URL}/admin/digital-media/templates/${templateId}`
          : `${API_URL}/admin/digital-media/templates`;

      const method = mode === "edit" ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "บันทึกไม่สำเร็จ");
      }

      router.push("/admin/digital-media-v1/templates");
    } catch (saveError) {
      console.error(saveError);
      setError("บันทึกไม่สำเร็จ กรุณาตรวจข้อมูล");
    } finally {
      setSaving(false);
    }
  };

  const generateMockupPreview = async () => {
    if (!token) return;

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setMockupError(null);
    setMockupSuccess(null);
    setMockupGenerating(true);

    try {
      const res = await fetch(`${API_URL}/admin/digital-media/templates/mockup-preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(buildTemplatePayload()),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "สร้าง mockup preview ไม่สำเร็จ");
      }

      const data = (await res.json()) as { output_image_url?: string };
      if (!data.output_image_url) {
        throw new Error("mockup preview ไม่ได้ส่งรูปกลับมา");
      }

      setField("cover_image_url", data.output_image_url);
      setMockupSuccess("สร้าง mockup preview แล้ว กำลังสร้าง mask อัตโนมัติ...");
      await generateMaskFromCover(data.output_image_url);
    } catch (previewError) {
      console.error(previewError);
      const message =
        previewError instanceof Error && previewError.message
          ? previewError.message
          : "สร้าง mockup preview ไม่สำเร็จ กรุณาลองใหม่";
      setMockupError(message.slice(0, 360));
    } finally {
      setMockupGenerating(false);
    }
  };

  const uploadImageFile = async (file: File) => {
    if (!token) return "";
    const body = new FormData();
    body.append("file", file);

    const res = await fetch(`${API_URL}/digital-media/upload-image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body,
    });
    if (!res.ok) {
      throw new Error("upload failed");
    }

    const data = (await res.json()) as { url?: string };
    if (!data.url) {
      throw new Error("missing image url");
    }
    return data.url;
  };

  const uploadCoverImage = async (file: File) => {
    if (!token) return;
    setCoverUploadError(null);
    setCoverUploading(true);
    try {
      const imageUrl = await uploadImageFile(file);
      setField("cover_image_url", imageUrl);
    } catch (uploadError) {
      console.error(uploadError);
      setCoverUploadError("อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setCoverUploading(false);
    }
  };

  const uploadMaskImage = async (file: File) => {
    if (!token) return;
    setMaskUploadError(null);
    setMaskGenerateError(null);
    setMaskGenerateSuccess(null);
    setMaskUploading(true);
    try {
      const imageUrl = await uploadImageFile(file);
      setField("product_mask_url", imageUrl);
    } catch (uploadError) {
      console.error(uploadError);
      setMaskUploadError("อัปโหลด mask ไม่สำเร็จ กรุณาลองใหม่");
    } finally {
      setMaskUploading(false);
    }
  };

  const generateMaskFromCover = async (sourceImageUrl?: string) => {
    const imageUrl = sourceImageUrl || form.cover_image_url;
    if (!imageUrl) {
      setMaskGenerateError("กรุณามีรูป mockup/template ก่อนสร้าง mask");
      return;
    }

    setMaskGenerateError(null);
    setMaskGenerateSuccess(null);
    setMaskGenerating(true);

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("cannot load cover image"));
        img.src = imageUrl;
      });

      const fullWidth = image.naturalWidth || image.width || 1024;
      const fullHeight = image.naturalHeight || image.height || 1024;

      const analysisScale = Math.min(1, 640 / Math.max(fullWidth, fullHeight));
      const analysisWidth = Math.max(64, Math.round(fullWidth * analysisScale));
      const analysisHeight = Math.max(64, Math.round(fullHeight * analysisScale));

      const analysisCanvas = document.createElement("canvas");
      analysisCanvas.width = analysisWidth;
      analysisCanvas.height = analysisHeight;
      const analysisCtx = analysisCanvas.getContext("2d", { willReadFrequently: true });
      if (!analysisCtx) {
        throw new Error("analysis canvas context unavailable");
      }
      analysisCtx.drawImage(image, 0, 0, analysisWidth, analysisHeight);

      const analysisImageData = analysisCtx.getImageData(0, 0, analysisWidth, analysisHeight);
      const autoBox = detectAutoMaskBox(analysisImageData, analysisWidth, analysisHeight);

      const scaleX = fullWidth / analysisWidth;
      const scaleY = fullHeight / analysisHeight;

      const maskX = Math.round(autoBox.x * scaleX);
      const maskY = Math.round(autoBox.y * scaleY);
      const maskWidth = Math.round(autoBox.width * scaleX);
      const maskHeight = Math.round(autoBox.height * scaleY);

      const canvas = document.createElement("canvas");
      canvas.width = fullWidth;
      canvas.height = fullHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("canvas context unavailable");
      }

      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const radius = Math.round(Math.min(maskWidth, maskHeight) * 0.05);

      // Draw feathered edge: multiple passes with expanding outline at decreasing opacity
      const featherRadius = Math.round(Math.min(maskWidth, maskHeight) * 0.025);
      const featherSteps = Math.max(4, Math.min(12, featherRadius));

      const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
        const clampedR = Math.min(r, Math.floor(w / 2), Math.floor(h / 2));
        ctx.beginPath();
        ctx.moveTo(x + clampedR, y);
        ctx.lineTo(x + w - clampedR, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + clampedR);
        ctx.lineTo(x + w, y + h - clampedR);
        ctx.quadraticCurveTo(x + w, y + h, x + w - clampedR, y + h);
        ctx.lineTo(x + clampedR, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - clampedR);
        ctx.lineTo(x, y + clampedR);
        ctx.quadraticCurveTo(x, y, x + clampedR, y);
        ctx.closePath();
      };

      // Feather passes: outer → inner with increasing opacity
      for (let step = featherSteps; step >= 1; step -= 1) {
        const expand = Math.round((step / featherSteps) * featherRadius);
        const alpha = Math.round(((featherSteps - step + 1) / (featherSteps + 1)) * 180);
        const hex = alpha.toString(16).padStart(2, "0");
        ctx.fillStyle = `#FFFFFF${hex}`;
        drawRoundedRect(
          Math.max(0, maskX - expand),
          Math.max(0, maskY - expand),
          Math.min(fullWidth - Math.max(0, maskX - expand), maskWidth + expand * 2),
          Math.min(fullHeight - Math.max(0, maskY - expand), maskHeight + expand * 2),
          radius + expand,
        );
        ctx.fill();
      }

      // Core mask: solid white
      ctx.fillStyle = "#FFFFFF";
      drawRoundedRect(maskX, maskY, maskWidth, maskHeight, radius);
      ctx.fill();

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (value) => {
            if (value) resolve(value);
            else reject(new Error("cannot create mask blob"));
          },
          "image/png",
          1,
        );
      });

      const file = new File([blob], `mask-${Date.now()}.png`, { type: "image/png" });
      const maskUrl = await uploadImageFile(file);
      setField("product_mask_url", maskUrl);
      setMaskGenerateSuccess("สร้าง mask อัตโนมัติแล้ว สามารถกดบันทึกเทมเพลตได้");
    } catch (maskError) {
      console.error(maskError);
      setMaskGenerateError("สร้าง mask อัตโนมัติไม่สำเร็จ กรุณาอัปโหลดไฟล์ mask ด้วยตนเอง");
    } finally {
      setMaskGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEF0FF] p-6">
        <div className="flex min-h-[40vh] items-center justify-center">
          <Loader2 className="animate-spin text-[#050579]" size={26} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EEF0FF] p-4 text-[#0F172A] sm:p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#64748B]">Admin Digital Media</p>
            <h1 className="text-2xl font-black text-[#050579]">
              {mode === "edit" ? "แก้ไข Template" : "สร้าง Template ใหม่"}
            </h1>
          </div>
          <Link
            href="/admin/digital-media-v1/templates"
            className="rounded-xl border border-[#D9E1F2] bg-white px-4 py-2 text-sm font-bold text-[#334155]"
          >
            กลับรายการ
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border border-[#D9E1F2] bg-white p-4">
              <h2 className="text-base font-black text-[#050579]">รูปเทมเพลต (Cover)</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-[180px_1fr]">
                <div className="h-[180px] overflow-hidden rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF]">
                  {form.media_type === "video" && form.preview_video_url ? (
                    <video src={form.preview_video_url} poster={form.cover_image_url || undefined} muted loop autoPlay playsInline className="h-full w-full object-cover" />
                  ) : form.cover_image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.cover_image_url} alt={form.name || "template cover"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs font-semibold text-[#94A3B8]">
                      ยังไม่มีรูป
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#D9E1F2] bg-white px-3 py-2 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFF]">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            void uploadCoverImage(file);
                          }
                          e.currentTarget.value = "";
                        }}
                      />
                      {coverUploading ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-[#050579]" />
                          กำลังอัปโหลด...
                        </>
                      ) : (
                        "อัปโหลดรูปเทมเพลต"
                      )}
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        void generateMockupPreview();
                      }}
                      disabled={mockupGenerating}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#C7D2FE] bg-[#EEF2FF] px-3 py-2 text-sm font-semibold text-[#3730A3] hover:bg-[#E0E7FF] disabled:opacity-60"
                    >
                      {mockupGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      {mockupGenerating ? "กำลังสร้าง mockup..." : "Generate Mockup Preview"}
                    </button>
                  </div>
                  <p className="text-xs text-[#64748B]">รูปนี้จะแสดงในหน้า Template Manager และหน้าเลือกเทมเพลตฝั่งผู้ใช้ (วิดีโอใช้เป็น poster ได้)</p>
                  {coverUploadError ? <p className="text-xs text-[#B91C1C]">{coverUploadError}</p> : null}
                  {mockupError ? <p className="text-xs text-[#B91C1C]">{mockupError}</p> : null}
                  {mockupSuccess ? <p className="text-xs text-[#047857]">{mockupSuccess}</p> : null}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-[#D9E1F2] bg-white p-4">
              <h2 className="text-base font-black text-[#050579]">ตั้งค่าแทนสินค้า (Replace Product)</h2>
              <label className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[#334155]">
                <input
                  type="checkbox"
                  checked={form.enable_product_replace}
                  onChange={(e) => setField("enable_product_replace", e.target.checked)}
                />
                เปิดโหมดแทนสินค้าจากรูปที่ผู้ใช้อัปโหลด
              </label>

              {form.enable_product_replace ? (
                <div className="mt-3 space-y-2 rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-4">
                  <p className="text-sm font-semibold text-[#334155]">
                    Flow ปัจจุบันจะส่ง `template + product + mask(ถ้ามี)` เพื่อบังคับจุดแก้ไขสินค้าให้คงเลย์เอาต์ template
                  </p>
                  <p className="text-xs text-[#64748B]">
                    หลักการ mask: พื้นที่สีขาว = อนุญาตให้แทนสินค้า, สีดำ = พื้นที่ที่ต้องคงเดิม
                  </p>
                  <div className="mt-2 grid gap-3 md:grid-cols-2">
                    <div className="overflow-hidden rounded-xl border border-[#D9E1F2] bg-white">
                      <p className="border-b border-[#E2E8F0] px-3 py-2 text-xs font-bold text-[#475569]">Mockup / Template</p>
                      <div className="h-[180px] bg-[#F8FAFF]">
                        {form.cover_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={form.cover_image_url} alt="template preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-semibold text-[#94A3B8]">ยังไม่มีรูปเทมเพลต</div>
                        )}
                      </div>
                    </div>
                    <div className="overflow-hidden rounded-xl border border-[#D9E1F2] bg-white">
                      <p className="border-b border-[#E2E8F0] px-3 py-2 text-xs font-bold text-[#475569]">Mask Preview</p>
                      <div className="h-[180px] bg-[#F8FAFF]">
                        {form.product_mask_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={form.product_mask_url} alt="mask preview" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs font-semibold text-[#94A3B8]">ยังไม่มี mask</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        void generateMaskFromCover();
                      }}
                      disabled={maskGenerating}
                      className="inline-flex items-center gap-2 rounded-xl border border-[#C7D2FE] bg-[#EEF2FF] px-3 py-2 text-sm font-semibold text-[#3730A3] hover:bg-[#E0E7FF] disabled:opacity-60"
                    >
                      {maskGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      {maskGenerating ? "กำลังสร้าง mask..." : "Generate Mask"}
                    </button>
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#D9E1F2] bg-white px-3 py-2 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFF]">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            void uploadMaskImage(file);
                          }
                          e.currentTarget.value = "";
                        }}
                      />
                      {maskUploading ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-[#050579]" />
                          กำลังอัปโหลด mask...
                        </>
                      ) : (
                        "อัปโหลด Mask"
                      )}
                    </label>
                  </div>
                  <input
                    value={form.product_mask_url}
                    onChange={(e) => setField("product_mask_url", e.target.value)}
                    placeholder="Mask URL (ระบบจะใช้ค่านี้ตอน replace product)"
                    className="w-full rounded-xl border border-[#D9E1F2] px-3 py-2 text-sm"
                  />
                  {maskUploadError ? <p className="text-xs text-[#B91C1C]">{maskUploadError}</p> : null}
                  {maskGenerateError ? <p className="text-xs text-[#B91C1C]">{maskGenerateError}</p> : null}
                  {maskGenerateSuccess ? <p className="text-xs text-[#047857]">{maskGenerateSuccess}</p> : null}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-[#D9E1F2] bg-white p-4">
              <h2 className="text-base font-black text-[#050579]">ข้อมูล Template</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-[#64748B]">name</span>
                  <input value={form.name} onChange={(e) => setField("name", e.target.value)} className="w-full rounded-xl border border-[#D9E1F2] px-3 py-2 text-sm" />
                </label>
                <div className="rounded-xl border border-dashed border-[#D9E1F2] bg-[#F8FAFF] px-3 py-3 text-sm text-[#64748B]">
                  ระบบจะสร้าง `slug` ให้อัตโนมัติจากชื่อเทมเพลต และกันชื่อซ้ำให้เอง
                </div>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-xs font-bold text-[#64748B]">category</span>
                  <select value={form.category_id} onChange={(e) => setField("category_id", Number(e.target.value))} className="w-full rounded-xl border border-[#D9E1F2] px-3 py-2 text-sm">
                    <option value={0}>เลือกหมวดหมู่</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="เพิ่มหมวดใหม่ เช่น เครื่องดื่มสุขภาพ"
                      className="flex-1 rounded-xl border border-[#D9E1F2] px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        void createCategory();
                      }}
                      disabled={creatingCategory}
                      className="rounded-xl border border-[#D9E1F2] bg-white px-3 py-2 text-sm font-semibold text-[#334155] hover:bg-[#F8FAFF] disabled:opacity-60"
                    >
                      {creatingCategory ? "กำลังเพิ่ม..." : "เพิ่มหมวด"}
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-[#94A3B8]">ถ้า import จาก CSV ในอนาคต สามารถส่ง `category_name` มาได้ ระบบจะหา/สร้างหมวดให้อัตโนมัติ</p>
                  {categoryError ? <p className="mt-1 text-xs text-[#B91C1C]">{categoryError}</p> : null}
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-[#64748B]">media_type</span>
                  <select value={form.media_type} onChange={(e) => setField("media_type", e.target.value as MediaType)} className="w-full rounded-xl border border-[#D9E1F2] px-3 py-2 text-sm">
                    <option value="image">image</option>
                    <option value="video">video</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-[#64748B]">preview_video_url</span>
                  <input value={form.preview_video_url} onChange={(e) => setField("preview_video_url", e.target.value)} className="w-full rounded-xl border border-[#D9E1F2] px-3 py-2 text-sm" />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-xs font-bold text-[#64748B]">description</span>
                  <textarea value={form.description} onChange={(e) => setField("description", e.target.value)} className="min-h-[80px] w-full rounded-xl border border-[#D9E1F2] px-3 py-2 text-sm" />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-xs font-bold text-[#64748B]">cover_image_url</span>
                  <input value={form.cover_image_url} onChange={(e) => setField("cover_image_url", e.target.value)} className="w-full rounded-xl border border-[#D9E1F2] px-3 py-2 text-sm" />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-xs font-bold text-[#64748B]">prompt_template</span>
                  <textarea value={form.prompt_template} onChange={(e) => setField("prompt_template", e.target.value)} className="min-h-[120px] w-full rounded-xl border border-[#D9E1F2] px-3 py-2 text-sm" />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-xs font-bold text-[#64748B]">negative_prompt</span>
                  <textarea value={form.negative_prompt} onChange={(e) => setField("negative_prompt", e.target.value)} className="min-h-[80px] w-full rounded-xl border border-[#D9E1F2] px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-[#64748B]">style_preset</span>
                  <input value={form.style_preset} onChange={(e) => setField("style_preset", e.target.value)} className="w-full rounded-xl border border-[#D9E1F2] px-3 py-2 text-sm" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-[#64748B]">aspect_ratio</span>
                  <select value={form.aspect_ratio} onChange={(e) => setField("aspect_ratio", e.target.value as "1:1" | "4:5" | "9:16")} className="w-full rounded-xl border border-[#D9E1F2] px-3 py-2 text-sm">
                    <option value="1:1">1:1</option>
                    <option value="4:5">4:5</option>
                    <option value="9:16">9:16</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-[#64748B]">status</span>
                  <select value={form.status} onChange={(e) => setField("status", e.target.value as "draft" | "active" | "inactive")} className="w-full rounded-xl border border-[#D9E1F2] px-3 py-2 text-sm">
                    <option value="draft">draft</option>
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-bold text-[#64748B]">sort_order</span>
                  <input type="number" value={form.sort_order} onChange={(e) => setField("sort_order", Number(e.target.value || 0))} className="w-full rounded-xl border border-[#D9E1F2] px-3 py-2 text-sm" />
                </label>
              </div>
            </div>

            <div className="rounded-2xl border border-[#D9E1F2] bg-white p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-[#050579]">Template Fields Builder</h2>
                <button type="button" onClick={addField} className="inline-flex items-center gap-1 rounded-lg border border-[#D9E1F2] bg-white px-2.5 py-1.5 text-xs font-bold text-[#334155]">
                  <Plus size={14} /> เพิ่ม field
                </button>
              </div>

              <div className="mt-3 space-y-3">
                {form.fields.map((field, index) => (
                  <div key={`${field.id || "new"}-${index}`} className="rounded-xl border border-[#E2E8F0] p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-bold text-[#334155]">Field #{index + 1}</p>
                      <button type="button" onClick={() => removeField(index)} className="rounded-md border border-[#FECACA] bg-[#FEF2F2] p-1.5 text-[#DC2626]">
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="grid gap-2 md:grid-cols-2">
                      <label className="block">
                        <span className="mb-1 block text-[11px] font-bold text-[#64748B]">ตัวแปรใน prompt</span>
                        <input
                          placeholder="เช่น brand_name"
                          value={field.field_key}
                          onChange={(e) => setFieldRow(index, "field_key", e.target.value)}
                          className="w-full rounded-lg border border-[#D9E1F2] px-3 py-2 text-sm"
                        />
                        <p className="mt-1 text-[11px] text-[#94A3B8]">ใช้ใน prompt แบบ {"{brand_name}"}</p>
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-[11px] font-bold text-[#64748B]">ชื่อช่องที่ผู้ใช้เห็น</span>
                        <input
                          placeholder="เช่น ชื่อแบรนด์"
                          value={field.field_label}
                          onChange={(e) => setFieldRow(index, "field_label", e.target.value)}
                          className="w-full rounded-lg border border-[#D9E1F2] px-3 py-2 text-sm"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-[11px] font-bold text-[#64748B]">ชนิดข้อมูล</span>
                        <select
                          value={field.field_type}
                          onChange={(e) => setFieldRow(index, "field_type", e.target.value as FieldType)}
                          className="w-full rounded-lg border border-[#D9E1F2] px-3 py-2 text-sm"
                        >
                          <option value="text">text</option>
                          <option value="textarea">textarea</option>
                          <option value="image">image</option>
                          <option value="select">select</option>
                          <option value="color">color</option>
                        </select>
                      </label>

                      <label className="block">
                        <span className="mb-1 block text-[11px] font-bold text-[#64748B]">ค่าเริ่มต้น (ไม่บังคับ)</span>
                        <input
                          placeholder="เช่น #050579 หรือ ข้อความเริ่มต้น"
                          value={field.default_value}
                          onChange={(e) => setFieldRow(index, "default_value", e.target.value)}
                          className="w-full rounded-lg border border-[#D9E1F2] px-3 py-2 text-sm"
                        />
                      </label>

                      <label className="inline-flex items-center gap-2 text-xs font-bold text-[#475569] md:col-span-2">
                        <input type="checkbox" checked={field.is_required} onChange={(e) => setFieldRow(index, "is_required", e.target.checked)} />
                        บังคับกรอก
                      </label>
                    </div>

                    <div className="mt-2 border-t border-[#E2E8F0] pt-2">
                      <button
                        type="button"
                        onClick={() => toggleAdvancedField(index)}
                        className="text-xs font-bold text-[#475569] underline decoration-dotted underline-offset-2"
                      >
                        {expandedAdvancedFields.includes(index) ? "ซ่อนตั้งค่าเพิ่มเติม" : "ตั้งค่าเพิ่มเติม"}
                      </button>

                      {expandedAdvancedFields.includes(index) ? (
                        <div className="mt-2 grid gap-2 md:grid-cols-2">
                          <label className="block">
                            <span className="mb-1 block text-[11px] font-bold text-[#64748B]">placeholder</span>
                            <input
                              placeholder="ข้อความตัวอย่างในช่องกรอก"
                              value={field.placeholder}
                              onChange={(e) => setFieldRow(index, "placeholder", e.target.value)}
                              className="w-full rounded-lg border border-[#D9E1F2] px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="block">
                            <span className="mb-1 block text-[11px] font-bold text-[#64748B]">sort_order</span>
                            <input
                              placeholder="ลำดับ"
                              type="number"
                              value={field.sort_order}
                              onChange={(e) => setFieldRow(index, "sort_order", Number(e.target.value || 0))}
                              className="w-full rounded-lg border border-[#D9E1F2] px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="block md:col-span-2">
                            <span className="mb-1 block text-[11px] font-bold text-[#64748B]">help_text</span>
                            <input
                              placeholder="คำอธิบายสั้นใต้ช่องกรอก"
                              value={field.help_text}
                              onChange={(e) => setFieldRow(index, "help_text", e.target.value)}
                              className="w-full rounded-lg border border-[#D9E1F2] px-3 py-2 text-sm"
                            />
                          </label>
                          {field.field_type === "select" ? (
                            <label className="block md:col-span-2">
                              <span className="mb-1 block text-[11px] font-bold text-[#64748B]">options_json</span>
                              <textarea
                                placeholder='[{"label":"1:1","value":"1:1"}]'
                                value={field.options_json_text}
                                onChange={(e) => setFieldRow(index, "options_json_text", e.target.value)}
                                className="min-h-[80px] w-full rounded-lg border border-[#D9E1F2] px-3 py-2 text-sm"
                              />
                            </label>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {error ? <p className="rounded-xl border border-[#FECACA] bg-[#FEF2F2] px-3 py-2 text-sm text-[#B91C1C]">{error}</p> : null}

            <div className="sticky bottom-0 z-20 rounded-2xl border border-[#D9E1F2] bg-white p-3">
              <button type="button" onClick={save} disabled={saving} className="w-full rounded-xl bg-[#F97316] px-4 py-3 text-sm font-black text-white disabled:opacity-60">
                {saving ? "กำลังบันทึก..." : "บันทึกเทมเพลต"}
              </button>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#D9E1F2] bg-white p-4">
              <h3 className="text-sm font-black text-[#050579]">Preview Data (Field Schema JSON)</h3>
              <pre className="mt-3 max-h-[520px] overflow-auto rounded-xl bg-[#0F172A] p-3 text-[11px] text-[#E2E8F0]">
{JSON.stringify(schemaPreview, null, 2)}
              </pre>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
