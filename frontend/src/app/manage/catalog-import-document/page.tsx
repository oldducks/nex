"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Cookies from "js-cookie";
import { ArrowDown, ArrowLeft, ArrowUp, Image as ImageIcon, Loader2, Pencil, Upload, X } from "lucide-react";
import { Toast, type ToastType } from "@/components/Toast";

interface ImportPageItem {
  id: string;
  file: File;
  previewUrl: string;
}

interface ExistingDocumentPage {
  id: number;
  name: string;
  imageUrl: string;
  order?: number;
}

interface ExistingDocumentCatalog {
  id: number;
  title: string;
  description?: string;
  layout_config?: {
    catalog_mode?: string;
    [key: string]: unknown;
  } | null;
}

interface MeProfile {
  subscription_tier?: string;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const PDF_MIME_TYPE = "application/pdf";
const MAX_PDF_PAGES = 40;
const PDF_RENDER_SCALE = 1.8;

interface PdfJsLike {
  version: string;
  GlobalWorkerOptions: { workerSrc: string };
  getDocument: (options: { data: ArrayBuffer }) => {
    promise: Promise<{
      numPages: number;
      getPage: (pageNumber: number) => Promise<{
        getViewport: (params: { scale: number }) => {
          width: number;
          height: number;
          [key: string]: unknown;
        };
        render: (params: {
          canvasContext: CanvasRenderingContext2D;
          viewport: {
            width: number;
            height: number;
            [key: string]: unknown;
          };
        }) => { promise: Promise<void> };
      }>;
      destroy?: () => void;
      cleanup?: () => void;
    }>;
  };
}

export default function CatalogImportDocumentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = Cookies.get("token");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  const queryCatalogId = Number(searchParams.get("catalog_id") || "0");
  const isExistingDocumentMode = Number.isInteger(queryCatalogId) && queryCatalogId > 0;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pages, setPages] = useState<ImportPageItem[]>([]);
  const [existingCatalog, setExistingCatalog] = useState<ExistingDocumentCatalog | null>(null);
  const [existingDocumentPages, setExistingDocumentPages] = useState<ExistingDocumentPage[]>([]);
  const [loadingExistingCatalog, setLoadingExistingCatalog] = useState(false);
  const [updatingExistingPages, setUpdatingExistingPages] = useState(false);
  const [savingCatalogMeta, setSavingCatalogMeta] = useState(false);
  const [currentPlanLabel, setCurrentPlanLabel] = useState("แผนพื้นฐาน");
  const [isMetaEditorOpen, setIsMetaEditorOpen] = useState(!isExistingDocumentMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConvertingPdf, setIsConvertingPdf] = useState(false);
  const [progressLabel, setProgressLabel] = useState("");
  const [recentUploadSummary, setRecentUploadSummary] = useState("");
  const infoSectionRef = useRef<HTMLElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: "",
    type: "info",
    isVisible: false,
  });

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type, isVisible: true });
  };

  const resolvePlanLabel = (tier?: string) => (tier === "premium" ? "แผนพรีเมียม" : "แผนพื้นฐาน");

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [router, token]);

  useEffect(() => {
    setIsMetaEditorOpen(!isExistingDocumentMode);
  }, [isExistingDocumentMode]);

  useEffect(() => {
    if (!token) return;
    const loadProfile = async () => {
      try {
        const profileRes = await fetch(`${API_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) return;
        const profileData = (await profileRes.json()) as MeProfile;
        setCurrentPlanLabel(resolvePlanLabel(profileData.subscription_tier));
      } catch {
        setCurrentPlanLabel("แผนพื้นฐาน");
      }
    };
    void loadProfile();
  }, [API_URL, token]);

  useEffect(() => {
    if (!token || !isExistingDocumentMode) return;

    const loadCatalog = async () => {
      try {
        setLoadingExistingCatalog(true);

        const [catalogRes, productsRes] = await Promise.all([
          fetch(`${API_URL}/catalogs/user/${queryCatalogId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/products?catalog_id=${queryCatalogId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!catalogRes.ok) {
          throw new Error("โหลดแคตตาล็อกเอกสารไม่สำเร็จ");
        }
        const catalogData = (await catalogRes.json()) as ExistingDocumentCatalog;

        if (catalogData.layout_config?.catalog_mode !== "document_book") {
          throw new Error("แคตตาล็อกนี้ไม่ใช่โหมดเอกสาร");
        }

        setExistingCatalog(catalogData);
        setTitle(catalogData.title || "");
        setDescription(catalogData.description || "");

        if (productsRes.ok) {
          const products = (await productsRes.json()) as Array<{
            id: number;
            name?: string;
            images_json?: string[];
            order?: number;
          }>;

          const mappedPages = products
            .slice()
            .sort((a, b) => (a.order || 0) - (b.order || 0) || a.id - b.id)
            .map((item, index) => ({
              id: item.id,
              name: item.name || `หน้า ${index + 1}`,
              imageUrl: String(item.images_json?.[0] || ""),
              order: item.order || index + 1,
            }));
          setExistingDocumentPages(mappedPages);
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "โหลดแคตตาล็อกเอกสารไม่สำเร็จ";
        showToast(message, "error");
      } finally {
        setLoadingExistingCatalog(false);
      }
    };

    void loadCatalog();
  }, [API_URL, isExistingDocumentMode, queryCatalogId, token]);

  useEffect(() => {
    return () => {
      for (const page of pages) {
        URL.revokeObjectURL(page.previewUrl);
      }
    };
  }, [pages]);

  const canSubmit = useMemo(
    () =>
      (isExistingDocumentMode || title.trim().length > 0) &&
      pages.length > 0 &&
      !isSubmitting &&
      !isConvertingPdf &&
      !loadingExistingCatalog,
    [isExistingDocumentMode, title, pages.length, isSubmitting, isConvertingPdf, loadingExistingCatalog],
  );

  const submitButtonLabel = useMemo(() => {
    if (isExistingDocumentMode) {
      return pages.length > 0 ? "ยืนยันเพิ่มหน้าที่เลือก" : "กรุณาเพิ่มไฟล์ก่อน";
    }
    return "เริ่มนำเข้าแคตตาล็อกเอกสาร";
  }, [isExistingDocumentMode, pages.length]);

  const fileToImportPage = (file: File): ImportPageItem => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    file,
    previewUrl: URL.createObjectURL(file),
  });

  const isPdfFile = (file: File) =>
    file.type === PDF_MIME_TYPE || file.name.toLowerCase().endsWith(".pdf");

  const getImageUrl = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads")) return `${API_URL}${url}`;
    return url;
  };

  const convertPdfToImagePages = async (file: File): Promise<ImportPageItem[]> => {
    const pdfjs = (await import("pdfjs-dist/build/pdf.mjs")) as unknown as PdfJsLike;
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
    const documentProxy = await loadingTask.promise;

    const totalPages = Math.min(documentProxy.numPages, MAX_PDF_PAGES);
    const baseName = file.name.replace(/\.pdf$/i, "") || "document";
    const converted: ImportPageItem[] = [];

    for (let pageNo = 1; pageNo <= totalPages; pageNo += 1) {
      setProgressLabel(`กำลังแปลง PDF หน้า ${pageNo}/${totalPages}...`);
      const page = await documentProxy.getPage(pageNo);
      const viewport = page.getViewport({ scale: PDF_RENDER_SCALE });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("ไม่สามารถสร้าง canvas เพื่อแปลง PDF");
      }

      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/webp", 0.9);
      });

      if (!blob) {
        throw new Error(`ไม่สามารถแปลง PDF หน้า ${pageNo} ได้`);
      }

      const imageFile = new File([blob], `${baseName}-page-${String(pageNo).padStart(2, "0")}.webp`, {
        type: "image/webp",
      });
      converted.push(fileToImportPage(imageFile));
    }

    documentProxy.cleanup?.();
    documentProxy.destroy?.();
    return converted;
  };

  const onPickFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(event.target.files || []);
    if (!picked.length) return;

    try {
      const importedPages: ImportPageItem[] = [];
      const pdfFiles = picked.filter((file) => isPdfFile(file));
      if (pdfFiles.length > 0) {
        setIsConvertingPdf(true);
      }

      for (const file of picked) {
        if (isPdfFile(file)) {
          const pdfPages = await convertPdfToImagePages(file);
          importedPages.push(...pdfPages);
          if (pdfPages.length >= MAX_PDF_PAGES) {
            showToast(`ไฟล์ ${file.name} แปลงสูงสุด ${MAX_PDF_PAGES} หน้า`, "info");
          }
          continue;
        }

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
          showToast(`ไฟล์ ${file.name} ไม่รองรับ (รองรับ jpg, png, webp, gif, pdf)`, "error");
          continue;
        }
        if (file.size > 20 * 1024 * 1024) {
          showToast(`ไฟล์ ${file.name} มีขนาดเกิน 20MB`, "error");
          continue;
        }
        importedPages.push(fileToImportPage(file));
      }

      if (importedPages.length > 0) {
        setPages((prev) => [...prev, ...importedPages]);
        setRecentUploadSummary(`เพิ่มไฟล์เข้าเตรียมอัปโหลดแล้ว ${importedPages.length} หน้า`);
        showToast(`เพิ่มไฟล์แล้ว ${importedPages.length} หน้า`, "success");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "แปลงไฟล์ PDF ไม่สำเร็จ";
      showToast(message, "error");
    } finally {
      setIsConvertingPdf(false);
      setProgressLabel("");
      event.target.value = "";
    }
  };

  const movePage = (index: number, direction: -1 | 1) => {
    setPages((prev) => {
      const nextIndex = index + direction;
      if (nextIndex < 0 || nextIndex >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(index, 1);
      copy.splice(nextIndex, 0, item);
      return copy;
    });
  };

  const removePage = (id: string) => {
    setPages((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((item) => item.id !== id);
    });
  };

  const persistExistingPageOrder = async (nextPages: ExistingDocumentPage[]) => {
    if (!token || !nextPages.length) return;

    setUpdatingExistingPages(true);
    try {
      await Promise.all(
        nextPages.map((page, index) =>
          fetch(`${API_URL}/products/${page.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ order: index + 1 }),
          }).then(async (res) => {
            if (!res.ok) {
              const errorData = await res.json().catch(() => null);
              throw new Error(errorData?.message || "อัปเดตลำดับหน้าไม่สำเร็จ");
            }
          }),
        ),
      );

      setExistingDocumentPages(
        nextPages.map((item, index) => ({
          ...item,
          order: index + 1,
        })),
      );
      showToast("อัปเดตลำดับหน้าแล้ว", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "อัปเดตลำดับหน้าไม่สำเร็จ";
      showToast(message, "error");
    } finally {
      setUpdatingExistingPages(false);
    }
  };

  const moveExistingPage = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= existingDocumentPages.length) return;

    const reordered = [...existingDocumentPages];
    const [target] = reordered.splice(index, 1);
    reordered.splice(nextIndex, 0, target);
    await persistExistingPageOrder(reordered);
  };

  const deleteExistingPage = async (pageId: number) => {
    if (!token) return;
    setUpdatingExistingPages(true);
    try {
      const deleteRes = await fetch(`${API_URL}/products/${pageId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!deleteRes.ok) {
        const errorData = await deleteRes.json().catch(() => null);
        throw new Error(errorData?.message || "ลบหน้าไม่สำเร็จ");
      }

      const remaining = existingDocumentPages.filter((page) => page.id !== pageId);
      if (remaining.length > 0) {
        await Promise.all(
          remaining.map((page, index) =>
            fetch(`${API_URL}/products/${page.id}`, {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ order: index + 1 }),
            }),
          ),
        );
      }

      setExistingDocumentPages(
        remaining.map((item, index) => ({
          ...item,
          order: index + 1,
        })),
      );
      showToast("ลบหน้าเอกสารแล้ว", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "ลบหน้าไม่สำเร็จ";
      showToast(message, "error");
    } finally {
      setUpdatingExistingPages(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(`${API_URL}/uploads/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(text || "อัปโหลดภาพไม่สำเร็จ");
    }

    const data = await res.json();
    if (data?.url) return String(data.url);

    if (!data?.jobId) {
      throw new Error("ไม่พบ URL ภาพที่อัปโหลด");
    }

    const startedAt = Date.now();
    while (Date.now() - startedAt < 90_000) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const statusRes = await fetch(`${API_URL}/uploads/job/${data.jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!statusRes.ok) continue;
      const status = await statusRes.json();
      if (status.state === "completed" && status.result?.url) {
        return String(status.result.url);
      }
      if (status.state === "failed") {
        throw new Error(status.failedReason || "ประมวลผลภาพไม่สำเร็จ");
      }
    }

    throw new Error("อัปโหลดภาพใช้เวลานานเกินไป กรุณาลองใหม่");
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      setIsSubmitting(true);
      let catalogId = queryCatalogId;

      if (!isExistingDocumentMode) {
        setProgressLabel("กำลังสร้างแคตตาล็อกเอกสาร...");

        const createCatalogRes = await fetch(`${API_URL}/catalogs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            layout_config: {
              catalog_mode: "document_book",
              hide_product_name: true,
              hide_product_price: true,
            },
          }),
        });

        if (!createCatalogRes.ok) {
          const errorData = await createCatalogRes.json().catch(() => null);
          throw new Error(errorData?.message || "สร้างแคตตาล็อกไม่สำเร็จ");
        }

        const createdCatalog = await createCatalogRes.json();
        catalogId = Number(createdCatalog?.id);
        if (!catalogId) {
          throw new Error("ไม่พบรหัสแคตตาล็อกหลังสร้าง");
        }
      }

      const baseOrder = isExistingDocumentMode ? existingDocumentPages.length : 0;
      const createdExistingPages: ExistingDocumentPage[] = [];
      for (let index = 0; index < pages.length; index += 1) {
        const page = pages[index];
        const pageNo = baseOrder + index + 1;
        setProgressLabel(`กำลังอัปโหลดหน้า ${pageNo}/${pages.length}...`);
        const imageUrl = await uploadImage(page.file);

        const createProductRes = await fetch(`${API_URL}/products`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            catalog_id: catalogId,
            name: `หน้า ${pageNo}`,
            description: "",
            price: 0,
            images_json: [imageUrl],
            order: pageNo,
          }),
        });

        if (!createProductRes.ok) {
          const errorData = await createProductRes.json().catch(() => null);
          throw new Error(errorData?.message || `สร้างหน้าที่ ${pageNo} ไม่สำเร็จ`);
        }

        const createdProduct = await createProductRes.json().catch(() => null);
        if (isExistingDocumentMode) {
          const createdId = Number(createdProduct?.id);
          if (createdId > 0) {
            createdExistingPages.push({
              id: createdId,
              name: String(createdProduct?.name || `หน้า ${pageNo}`),
              imageUrl: String(createdProduct?.images_json?.[0] || imageUrl),
              order: pageNo,
            });
          }
        }
      }

      if (isExistingDocumentMode && createdExistingPages.length > 0) {
        setExistingDocumentPages((prev) => [...prev, ...createdExistingPages].sort((a, b) => (a.order || 0) - (b.order || 0)));
        setRecentUploadSummary(`เพิ่มเข้าเล่มสำเร็จ ${createdExistingPages.length} หน้า`);
      }

      showToast(
        isExistingDocumentMode ? `เพิ่มหน้าเอกสารสำเร็จ ${pages.length} หน้า` : "นำเข้าแคตตาล็อกเอกสารสำเร็จ",
        "success",
      );
      setPages([]);
      if (!isExistingDocumentMode) {
        router.push(`/manage/catalog-import-document?catalog_id=${catalogId}`);
        router.refresh();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "นำเข้าแคตตาล็อกเอกสารไม่สำเร็จ";
      showToast(message, "error");
    } finally {
      setIsSubmitting(false);
      setProgressLabel("");
    }
  };

  const handleSaveCatalogMeta = async () => {
    if (!isExistingDocumentMode || !queryCatalogId || !token) return;

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      showToast("กรุณาระบุชื่อแคตตาล็อก", "error");
      return;
    }

    try {
      setSavingCatalogMeta(true);
      const saveRes = await fetch(`${API_URL}/catalogs/${queryCatalogId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: trimmedTitle,
          description: description.trim(),
        }),
      });

      if (!saveRes.ok) {
        const errorData = await saveRes.json().catch(() => null);
        throw new Error(errorData?.message || "บันทึกข้อมูลแคตตาล็อกไม่สำเร็จ");
      }

      setExistingCatalog((prev) =>
        prev
          ? {
              ...prev,
              title: trimmedTitle,
              description: description.trim(),
            }
          : prev,
      );
      showToast("บันทึกชื่อและคำอธิบายแล้ว", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "บันทึกข้อมูลแคตตาล็อกไม่สำเร็จ";
      showToast(message, "error");
    } finally {
      setSavingCatalogMeta(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#EEF0FF] pb-20 text-[#0F172A]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_32%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.34),transparent_40%)]" />
      </div>

      <header className="sticky top-0 z-40 border-b border-[#D9E1F2] bg-white/85 backdrop-blur-md">
        <div className="relative mx-auto flex h-24 w-full max-w-md items-center px-4 md:max-w-5xl md:px-6">
          <Link
            href="/manage"
            className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-[#F6F8FF] group md:left-6"
            title="ย้อนกลับ"
          >
            <ArrowLeft size={20} className="text-[#64748B] transition-all group-hover:text-[#050579]" />
          </Link>
          <div className="mx-auto flex min-w-0 flex-col items-center text-center">
            <p className="mb-0.5 text-[11px] font-black uppercase leading-none tracking-[0.18em] text-[#94A3B8]">NEX Catalog</p>
            <div className="flex max-w-[250px] items-center justify-center gap-2 md:max-w-xl">
              <h1 className="truncate text-lg font-black text-[#050579]">
                {isExistingDocumentMode ? existingCatalog?.title || title || "Catalog" : "นำเข้าแคตตาล็อกเอกสาร"}
              </h1>
              {isExistingDocumentMode ? (
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
                      titleInputRef.current?.focus();
                    }, 120);
                  }}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#D9E1F2] bg-[#F6F8FF] text-[#64748B] transition-colors hover:border-[#BCCBE8] hover:text-[#050579]"
                  title={isMetaEditorOpen ? "ซ่อนการแก้ไข" : "แก้ชื่อแคตตาล็อก"}
                >
                  <Pencil size={14} />
                </button>
              ) : null}
            </div>
            <div className="mt-2 inline-flex items-center rounded-full border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-1 text-xs font-bold text-[#64748B]">
              <span className="mr-1.5 text-[#94A3B8]">แผนปัจจุบัน</span>
              <span className="text-[#050579]">{currentPlanLabel}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto mt-6 w-full max-w-md space-y-4 px-4 pb-8 md:max-w-5xl md:px-6">
        {!isExistingDocumentMode || isMetaEditorOpen ? (
          <section
            ref={infoSectionRef}
            className="rounded-3xl border border-[#D9E1F2] bg-white p-4 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.16)] md:p-6"
          >
          <h2 className="text-xl font-black text-[#050579]">ข้อมูลแคตตาล็อก</h2>
          <p className="mt-2 text-sm leading-6 text-[#64748B]">
            โหมดนี้เหมาะกับเอกสารหลายหน้าและเปิดดูแบบ Book View โดยซ่อนชื่อและราคาอัตโนมัติ
          </p>

          {loadingExistingCatalog ? (
            <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#D1DBEF] bg-[#F8FAFF] px-3 py-2 text-xs font-bold text-[#475569]">
              <Loader2 size={14} className="animate-spin" />
              กำลังโหลดข้อมูลแคตตาล็อก...
            </div>
          ) : (
            <div className="mt-4 space-y-4">
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.15em] text-[#94A3B8]">
                ชื่อแคตตาล็อกเอกสาร
              </label>
              <input
                ref={titleInputRef}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="เช่น โบรชัวร์บ้านเดี่ยว 2026"
                className="h-12 w-full rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 text-sm font-semibold text-[#0F172A] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#BCCBE8] focus:ring-2 focus:ring-[#050579]/10"
              />
            </div>
            <div>
              <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.15em] text-[#94A3B8]">
                คำอธิบาย (ไม่บังคับ)
              </label>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="รายละเอียดเพิ่มเติมของแคตตาล็อกเอกสารนี้"
                className="h-24 w-full resize-none rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-3 text-sm font-medium text-[#0F172A] outline-none transition-all placeholder:text-[#94A3B8] focus:border-[#BCCBE8] focus:ring-2 focus:ring-[#050579]/10"
              />
            </div>
            {isExistingDocumentMode ? (
              <button
                type="button"
                onClick={handleSaveCatalogMeta}
                disabled={savingCatalogMeta || loadingExistingCatalog}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#D1DBEF] bg-[#F8FAFF] px-4 py-2.5 text-sm font-black text-[#334155] transition hover:bg-[#EEF4FF] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingCatalogMeta ? <Loader2 size={16} className="animate-spin" /> : null}
                {savingCatalogMeta ? "กำลังบันทึก..." : "บันทึกข้อมูลแคตตาล็อก"}
              </button>
            ) : null}
            </div>
          )}
          </section>
        ) : null}

        <section className="rounded-3xl border border-[#D9E1F2] bg-white p-4 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.16)] md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#050579]">หน้าเอกสาร</h2>
              <p className="mt-1 text-sm text-[#64748B]">เพิ่มไฟล์ภาพหรือ PDF ก่อน แล้วค่อยยืนยันเพิ่มหน้า</p>
            </div>
            <label className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-2xl border border-[#EA580C] bg-[#F97316] px-4 py-2.5 text-sm font-black text-white shadow-[0_18px_35px_-22px_rgba(249,115,22,0.9)] transition hover:bg-[#EA580C]">
              <Upload size={16} />
              เพิ่มไฟล์ (ภาพ/PDF)
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,application/pdf,.pdf"
                multiple
                onChange={onPickFiles}
                className="hidden"
              />
            </label>
          </div>
          {isConvertingPdf ? (
            <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#D1DBEF] bg-[#F8FAFF] px-3 py-2 text-xs font-bold text-[#475569]">
              <Loader2 size={14} className="animate-spin" />
              {progressLabel || "กำลังแปลง PDF..."}
            </div>
          ) : null}
          {recentUploadSummary ? (
            <div className="mt-3 rounded-xl border border-[#FED7AA] bg-[#FFF7ED] px-3 py-2 text-xs font-bold text-[#9A3412]">
              {recentUploadSummary}
            </div>
          ) : null}

          {pages.length === 0 ? (
            <div className="mt-4 rounded-2xl border-2 border-dashed border-[#D9E1F2] bg-[#F9FBFF] px-5 py-8 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#EEF4FF]">
                <ImageIcon size={22} className="text-[#94A3B8]" />
              </div>
              <p className="text-sm font-semibold text-[#64748B]">ยังไม่มีหน้าที่นำเข้า</p>
            </div>
          ) : (
            <div className="mt-4 space-y-2">
              {pages.map((page, index) => (
                <div
                  key={page.id}
                  className="grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-2"
                >
                  <div className="h-[60px] w-[76px] overflow-hidden rounded-xl border border-[#D9E1F2] bg-white">
                    <img src={page.previewUrl} alt={`preview ${index + 1}`} className="h-full w-full object-cover" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-black text-[#050579]">หน้า {index + 1}</p>
                    <p className="truncate text-xs font-medium text-[#64748B]">{page.file.name}</p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => movePage(index, -1)}
                      disabled={index === 0}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D1DBEF] bg-white text-[#475569] transition hover:bg-[#EEF4FF] disabled:opacity-40"
                      title="เลื่อนขึ้น"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => movePage(index, 1)}
                      disabled={index === pages.length - 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D1DBEF] bg-white text-[#475569] transition hover:bg-[#EEF4FF] disabled:opacity-40"
                      title="เลื่อนลง"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removePage(page.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#F6D5BF] bg-white text-[#DC2626] transition hover:bg-[#FEF2F2]"
                      title="ลบหน้า"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {isExistingDocumentMode && existingDocumentPages.length > 0 ? (
          <section className="rounded-3xl border border-[#D9E1F2] bg-white p-4 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.16)] md:p-6">
            <h2 className="text-xl font-black text-[#050579]">หน้าที่มีอยู่ในเล่ม</h2>
            <p className="mt-1 text-sm text-[#64748B]">จัดการลำดับหน้า และลบหน้าที่ไม่ใช้ได้จากตรงนี้</p>
            {updatingExistingPages ? (
              <div className="mt-3 inline-flex items-center gap-2 rounded-xl border border-[#D1DBEF] bg-[#F8FAFF] px-3 py-2 text-xs font-bold text-[#475569]">
                <Loader2 size={14} className="animate-spin" />
                กำลังอัปเดตหน้าในเล่ม...
              </div>
            ) : null}
            <div className="mt-4 space-y-2">
              {existingDocumentPages.map((page, index) => (
                <div
                  key={page.id}
                  className="grid grid-cols-[76px_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-2"
                >
                  <div className="h-[60px] w-[76px] overflow-hidden rounded-xl border border-[#D9E1F2] bg-white">
                    {page.imageUrl ? (
                      <img src={getImageUrl(page.imageUrl)} alt={page.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[#94A3B8]">
                        <ImageIcon size={14} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-black text-[#050579]">หน้า {index + 1}</p>
                    <p className="truncate text-xs font-medium text-[#64748B]">{page.name}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void moveExistingPage(index, -1)}
                      disabled={index === 0 || updatingExistingPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D1DBEF] bg-white text-[#475569] transition hover:bg-[#EEF4FF] disabled:opacity-40"
                      title="เลื่อนขึ้น"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void moveExistingPage(index, 1)}
                      disabled={index === existingDocumentPages.length - 1 || updatingExistingPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D1DBEF] bg-white text-[#475569] transition hover:bg-[#EEF4FF] disabled:opacity-40"
                      title="เลื่อนลง"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void deleteExistingPage(page.id)}
                      disabled={updatingExistingPages}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#F6D5BF] bg-white text-[#DC2626] transition hover:bg-[#FEF2F2] disabled:opacity-40"
                      title="ลบหน้า"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="rounded-3xl border border-[#D9E1F2] bg-white p-4 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.16)] md:p-6">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#F97316] px-5 py-3 text-sm font-black text-white shadow-[0_20px_45px_-20px_rgba(249,115,22,0.8)] transition-all hover:bg-[#EA580C] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            {isSubmitting ? progressLabel || "กำลังนำเข้า..." : submitButtonLabel}
          </button>
          {isExistingDocumentMode ? (
            <p className="mt-2 text-center text-xs font-semibold text-[#64748B]">
              {pages.length > 0
                ? `พร้อมเพิ่ม ${pages.length} หน้า กดยืนยันได้เลย`
                : 'เริ่มจากปุ่ม "เพิ่มไฟล์ (ภาพ/PDF)" ด้านบน'}
            </p>
          ) : null}
          {isExistingDocumentMode && existingCatalog ? (
            <Link
              href={`/catalog/${existingCatalog.id}?view=book`}
              target="_blank"
              className="mt-2 inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-[#D1DBEF] bg-white px-4 py-2.5 text-sm font-bold text-[#334155] transition hover:bg-[#F8FAFF]"
            >
              เปิด Book View
            </Link>
          ) : null}
        </section>
      </main>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </div>
  );
}
