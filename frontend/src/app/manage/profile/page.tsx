"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { ArrowLeft, Copy, CreditCard, Loader2, Lock, Save, User, Phone, Mail, Building2, Briefcase, FileText, Image as ImageIcon, Upload, Trash2 } from "lucide-react";
import { Toast, type ToastType } from "@/components/Toast";

type I18nField = { lang: string; value: string };
type ContactField = { label: string; value: string };
type ImageWithPosition = { url: string; position: { x: number; y: number }; scale?: number; objectPosition?: string; link_url?: string };

type MeProfileResponse = {
  uid?: string;
  url_prefix?: string;
  about_me?: string;
  names_i18n?: I18nField[];
  positions_i18n?: I18nField[];
  companies_i18n?: I18nField[];
  phones?: ContactField[];
  emails?: ContactField[];
  profile_pic_url?: string;
  profile_pic_position?: { x: number; y: number; scale: number };
  logo?: ImageWithPosition | null;
  backgrounds?: ImageWithPosition[];
  subscription_tier?: string;
  feature_config?: Record<string, boolean>;
  user?: {
    role?: string;
  };
};

type FormState = {
  nameTh: string;
  nameEn: string;
  positionTh: string;
  companyTh: string;
  phone: string;
  email: string;
  aboutMe: string;
};

const EMPTY_FORM: FormState = {
  nameTh: "",
  nameEn: "",
  positionTh: "",
  companyTh: "",
  phone: "",
  email: "",
  aboutMe: "",
};

function getFieldByLang(fields: I18nField[] | undefined, lang: string): string {
  if (!fields || !fields.length) return "";
  return fields.find((item) => item.lang === lang)?.value || "";
}

function upsertI18n(fields: I18nField[] | undefined, lang: string, value: string): I18nField[] {
  const list = Array.isArray(fields) ? [...fields] : [];
  const index = list.findIndex((item) => item.lang === lang);
  if (index >= 0) {
    list[index] = { ...list[index], value };
    return list;
  }
  return [...list, { lang, value }];
}

export default function ProfileV2Page() {
  const router = useRouter();
  const pathname = usePathname();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "/api";
  const v2Prefix = pathname?.startsWith("/v2") ? "/v2" : "";
  const loginPath = `${v2Prefix}/login`;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingProfileImage, setUploadingProfileImage] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBackground, setUploadingBackground] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [profile, setProfile] = useState<MeProfileResponse | null>(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [profilePicPosition, setProfilePicPosition] = useState<{ x: number; y: number; scale: number }>({ x: 50, y: 50, scale: 1 });
  const [logo, setLogo] = useState<ImageWithPosition | null>(null);
  const [backgrounds, setBackgrounds] = useState<ImageWithPosition[]>([]);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: "",
    type: "info",
    isVisible: false,
  });
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const backgroundInputRef = useRef<HTMLInputElement | null>(null);
  const profileImageInputRef = useRef<HTMLInputElement | null>(null);
  const previewFrameRef = useRef<HTMLDivElement | null>(null);
  const pointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const panStartRef = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const pinchStartRef = useRef<{ dist: number; scale: number } | null>(null);
  const formStartRef = useRef<HTMLDivElement | null>(null);

  const showToast = (message: string, type: ToastType = "info") => {
    setToast({ message, type, isVisible: true });
  };

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.replace(loginPath);
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${apiUrl}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          if (res.status === 401) router.replace(loginPath);
          return;
        }

        const data = (await res.json()) as MeProfileResponse;
        setProfile(data);
        setProfileImageUrl(data.profile_pic_url || "");
        setProfilePicPosition(data.profile_pic_position || { x: 50, y: 50, scale: 1 });
        setLogo(data.logo || null);
        setBackgrounds(data.backgrounds || []);
        setForm({
          nameTh: getFieldByLang(data.names_i18n, "th"),
          nameEn: getFieldByLang(data.names_i18n, "en"),
          positionTh: getFieldByLang(data.positions_i18n, "th"),
          companyTh: getFieldByLang(data.companies_i18n, "th"),
          phone: data.phones?.[0]?.value || "",
          email: data.emails?.[0]?.value || "",
          aboutMe: data.about_me || "",
        });
      } catch {
        showToast("โหลดข้อมูลไม่สำเร็จ", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [apiUrl, loginPath, router]);

  const getAssetUrl = (url?: string) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/api")) return url;
    return `${apiUrl}${url}`;
  };

  const isAdmin = profile?.user?.role === "super_admin" || profile?.user?.role === "group_admin";
  const isPremium = profile?.subscription_tier === "premium";
  const currentPlanLabel = isPremium ? "แผนพรีเมียม" : "แผนพื้นฐาน";

  const isProfileUnlocked = useMemo(() => {
    if (isAdmin || isPremium) return true;
    const config = profile?.feature_config;
    if (config && typeof config.profile === "boolean") {
      return config.profile;
    }
    return true;
  }, [isAdmin, isPremium, profile?.feature_config]);

  const isNewUser = useMemo(() => {
    const hasBasicText =
      form.nameTh.trim() ||
      form.nameEn.trim() ||
      form.positionTh.trim() ||
      form.companyTh.trim() ||
      form.phone.trim() ||
      form.email.trim() ||
      form.aboutMe.trim();

    return !hasBasicText && !profileImageUrl && !logo?.url && !backgrounds[0]?.url;
  }, [backgrounds, form, logo, profileImageUrl]);

  const shouldShowProfileForm = !isNewUser || showProfileForm;

  const publicPath = profile?.uid ? `${profile.url_prefix || "p"}/${profile.uid}` : "";
  const publicUrl = publicPath
    ? `${typeof window !== "undefined" ? window.location.origin : "https://nexsolution.cloud"}/${publicPath}`
    : "";

  const uploadLogoImage = async (file: File) => {
    const token = Cookies.get("token");
    if (!token) {
      router.replace(loginPath);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast("รองรับเฉพาะไฟล์รูปภาพ jpg, png, gif, webp", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("ไฟล์มีขนาดเกิน 5MB", "error");
      return;
    }

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${apiUrl}/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("อัปโหลดโลโก้ไม่สำเร็จ");
      }

      const data = await res.json();
      let imageUrl = data.url as string | undefined;

      if (data.jobId) {
        imageUrl = await new Promise<string>((resolve, reject) => {
          const started = Date.now();
          const interval = setInterval(async () => {
            try {
              const jobRes = await fetch(`${apiUrl}/uploads/job/${data.jobId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!jobRes.ok) return;
              const status = await jobRes.json();

              if (status.state === "completed" && status.result?.url) {
                clearInterval(interval);
                resolve(status.result.url);
                return;
              }

              if (status.state === "failed") {
                clearInterval(interval);
                reject(new Error(status.failedReason || "ประมวลผลรูปโลโก้ไม่สำเร็จ"));
                return;
              }

              if (Date.now() - started > 60_000) {
                clearInterval(interval);
                reject(new Error("อัปโหลดโลโก้ใช้เวลานานเกินไป กรุณาลองใหม่"));
              }
            } catch {
              // keep polling
            }
          }, 1000);
        });
      }

      if (!imageUrl) {
        throw new Error("ไม่พบ URL รูปหลังอัปโหลด");
      }

      setLogo({
        url: imageUrl,
        position: logo?.position || { x: 50, y: 50 },
        scale: logo?.scale || 1,
      });
      showToast("อัปโหลดโลโก้สำเร็จ", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "อัปโหลดโลโก้ไม่สำเร็จ";
      showToast(message, "error");
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  };

  const uploadProfileImage = async (file: File) => {
    const token = Cookies.get("token");
    if (!token) {
      router.replace(loginPath);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast("รองรับเฉพาะไฟล์รูปภาพ jpg, png, gif, webp", "error");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("ไฟล์มีขนาดเกิน 5MB", "error");
      return;
    }

    setUploadingProfileImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${apiUrl}/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("อัปโหลดรูปโปรไฟล์ไม่สำเร็จ");
      }

      const data = await res.json();
      let imageUrl = data.url as string | undefined;

      if (data.jobId) {
        imageUrl = await new Promise<string>((resolve, reject) => {
          const started = Date.now();
          const interval = setInterval(async () => {
            try {
              const jobRes = await fetch(`${apiUrl}/uploads/job/${data.jobId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!jobRes.ok) return;
              const status = await jobRes.json();

              if (status.state === "completed" && status.result?.url) {
                clearInterval(interval);
                resolve(status.result.url);
                return;
              }

              if (status.state === "failed") {
                clearInterval(interval);
                reject(new Error(status.failedReason || "ประมวลผลรูปโปรไฟล์ไม่สำเร็จ"));
                return;
              }

              if (Date.now() - started > 60_000) {
                clearInterval(interval);
                reject(new Error("อัปโหลดรูปโปรไฟล์ใช้เวลานานเกินไป กรุณาลองใหม่"));
              }
            } catch {
              // keep polling
            }
          }, 1000);
        });
      }

      if (!imageUrl) {
        throw new Error("ไม่พบ URL รูปหลังอัปโหลด");
      }

      setProfileImageUrl(imageUrl);
      showToast("อัปโหลดรูปโปรไฟล์สำเร็จ", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "อัปโหลดรูปโปรไฟล์ไม่สำเร็จ";
      showToast(message, "error");
    } finally {
      setUploadingProfileImage(false);
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = "";
      }
    }
  };

  const uploadBackgroundImage = async (file: File) => {
    const token = Cookies.get("token");
    if (!token) {
      router.replace(loginPath);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      showToast("รองรับเฉพาะไฟล์รูปภาพ jpg, png, gif, webp", "error");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      showToast("ไฟล์พื้นหลังมีขนาดเกิน 8MB", "error");
      return;
    }

    setUploadingBackground(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`${apiUrl}/uploads/image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        throw new Error("อัปโหลดพื้นหลังไม่สำเร็จ");
      }

      const data = await res.json();
      let imageUrl = data.url as string | undefined;

      if (data.jobId) {
        imageUrl = await new Promise<string>((resolve, reject) => {
          const started = Date.now();
          const interval = setInterval(async () => {
            try {
              const jobRes = await fetch(`${apiUrl}/uploads/job/${data.jobId}`, {
                headers: { Authorization: `Bearer ${token}` },
              });

              if (!jobRes.ok) return;
              const status = await jobRes.json();

              if (status.state === "completed" && status.result?.url) {
                clearInterval(interval);
                resolve(status.result.url);
                return;
              }

              if (status.state === "failed") {
                clearInterval(interval);
                reject(new Error(status.failedReason || "ประมวลผลภาพพื้นหลังไม่สำเร็จ"));
                return;
              }

              if (Date.now() - started > 60_000) {
                clearInterval(interval);
                reject(new Error("อัปโหลดพื้นหลังใช้เวลานานเกินไป กรุณาลองใหม่"));
              }
            } catch {
              // keep polling
            }
          }, 1000);
        });
      }

      if (!imageUrl) {
        throw new Error("ไม่พบ URL รูปหลังอัปโหลด");
      }

      setBackgrounds([
        {
          url: imageUrl,
          position: backgrounds[0]?.position || { x: 50, y: 50 },
          scale: backgrounds[0]?.scale || 1,
        },
      ]);
      showToast("อัปโหลดพื้นหลังสำเร็จ", "success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "อัปโหลดพื้นหลังไม่สำเร็จ";
      showToast(message, "error");
    } finally {
      setUploadingBackground(false);
      if (backgroundInputRef.current) {
        backgroundInputRef.current.value = "";
      }
    }
  };

  const copyPublicUrl = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      showToast("คัดลอกลิงก์แล้ว", "success");
    } catch {
      showToast("คัดลอกลิงก์ไม่สำเร็จ", "error");
    }
  };

  useEffect(() => {
    if (!isNewUser) {
      setShowProfileForm(true);
    }
  }, [isNewUser]);

  // Wheel-to-zoom on the profile-image preview (needs a non-passive listener).
  useEffect(() => {
    const el = previewFrameRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!isProfileUnlocked || uploadingProfileImage) return;
      e.preventDefault();
      setProfilePicPosition((p) => ({
        ...p,
        scale: Math.min(3, Math.max(1, p.scale - e.deltaY * 0.0015)),
      }));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [isProfileUnlocked, uploadingProfileImage, profileImageUrl]);

  const handleCreateDigitalNamecard = () => {
    if (isNewUser) {
      setShowProfileForm(true);
      requestAnimationFrame(() => {
        formStartRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }

    showToast("คุณได้มีนามบัตรดิจิทัลแล้ว", "info");
  };

  const onSave = async () => {
    if (!isProfileUnlocked) {
      showToast("บัญชีนี้ยังไม่ปลดล็อกฟีเจอร์โปรไฟล์", "error");
      return;
    }

    const token = Cookies.get("token");
    if (!token) {
      router.replace(loginPath);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        names_i18n: upsertI18n(upsertI18n(profile?.names_i18n, "th", form.nameTh), "en", form.nameEn),
        positions_i18n: upsertI18n(profile?.positions_i18n, "th", form.positionTh),
        companies_i18n: upsertI18n(profile?.companies_i18n, "th", form.companyTh),
        phones: [{ label: "Mobile", value: form.phone }],
        emails: [{ label: "Work", value: form.email }],
        about_me: form.aboutMe,
        profile_pic_url: profileImageUrl,
        profile_pic_position: profilePicPosition,
        logo,
        backgrounds,
      };

      const res = await fetch(`${apiUrl}/profile/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        if (res.status === 401) router.replace(loginPath);
        throw new Error("save-failed");
      }

      const updated = (await res.json()) as MeProfileResponse;
      setProfile((prev) => ({ ...prev, ...updated }));
      setProfileImageUrl(updated.profile_pic_url || "");
      setProfilePicPosition(updated.profile_pic_position || { x: 50, y: 50, scale: 1 });
      setLogo(updated.logo || null);
      setBackgrounds(updated.backgrounds || []);
      showToast("บันทึกข้อมูลเรียบร้อย", "success");
    } catch {
      showToast("บันทึกข้อมูลไม่สำเร็จ", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EEF0FF] text-[#0F172A] flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-[#050579]" />
      </main>
    );
  }

  const clampPct = (v: number) => Math.min(100, Math.max(0, v));
  const clampScale = (v: number) => Math.min(3, Math.max(1, v));
  const canEditImage = isProfileUnlocked && !uploadingProfileImage;

  const handleImagePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canEditImage) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointersRef.current.size === 2) {
      const [a, b] = [...pointersRef.current.values()];
      pinchStartRef.current = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: profilePicPosition.scale };
      panStartRef.current = null;
    } else {
      panStartRef.current = { px: e.clientX, py: e.clientY, x: profilePicPosition.x, y: profilePicPosition.y };
    }
  };

  const handleImagePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canEditImage || !pointersRef.current.has(e.pointerId)) return;
    pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const rect = previewFrameRef.current?.getBoundingClientRect();
    if (!rect) return;
    if (pointersRef.current.size >= 2 && pinchStartRef.current) {
      const [a, b] = [...pointersRef.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      const scale = clampScale(pinchStartRef.current.scale * (dist / (pinchStartRef.current.dist || 1)));
      setProfilePicPosition((p) => ({ ...p, scale }));
    } else if (panStartRef.current) {
      const dx = e.clientX - panStartRef.current.px;
      const dy = e.clientY - panStartRef.current.py;
      setProfilePicPosition((p) => ({
        ...p,
        x: clampPct(panStartRef.current!.x - (dx / rect.width) * 100),
        y: clampPct(panStartRef.current!.y - (dy / rect.height) * 100),
      }));
    }
  };

  const handleImagePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    pointersRef.current.delete(e.pointerId);
    if (pointersRef.current.size < 2) pinchStartRef.current = null;
    if (pointersRef.current.size === 1) {
      const [only] = [...pointersRef.current.values()];
      panStartRef.current = { px: only.x, py: only.y, x: profilePicPosition.x, y: profilePicPosition.y };
    } else if (pointersRef.current.size === 0) {
      panStartRef.current = null;
    }
  };

  return (
    <main className="min-h-screen bg-[#EEF0FF] text-[#0F172A]">
      <nav className="sticky top-0 z-50 border-b border-[#D9E1F2] bg-white/85 backdrop-blur-md">
        <div className="relative mx-auto flex h-24 w-full max-w-md items-center px-4">
          <Link
            href="/manage/control"
            className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-[#F6F8FF] group"
            title="ย้อนกลับ"
          >
            <ArrowLeft size={20} className="text-[#64748B] transition-all group-hover:text-[#050579]" />
          </Link>

          <div className="mx-auto flex min-w-0 flex-col items-center text-center">
            <div className="mb-0.5 text-[11px] font-black uppercase leading-none tracking-[0.18em] text-[#94A3B8]">
              NEX PROFILE
            </div>
            <div className="text-base font-black text-[#050579]">จัดการข้อมูลในนามบัตรดิจิทัลของคุณ</div>
            <div className="mt-2 inline-flex items-center rounded-full border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-1 text-xs font-bold text-[#64748B]">
              <span className="mr-1.5 text-[#94A3B8]">แผนปัจจุบัน</span>
              <span className="text-[#050579]">{currentPlanLabel}</span>
            </div>
          </div>
        </div>
      </nav>

      <section className="mx-auto w-full max-w-md px-4 pb-8 pt-5">
        {isNewUser && (
          <button
            type="button"
            onClick={handleCreateDigitalNamecard}
            className="mb-4 flex min-h-14 w-full items-center justify-between rounded-2xl bg-[#F97316] px-7 py-4 text-lg font-black text-white shadow-[0_20px_45px_-20px_rgba(249,115,22,0.85)] transition-all hover:bg-[#EA580C] active:scale-95"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/18 ring-1 ring-white/22">
                <CreditCard size={20} />
              </span>
              <span className="block text-xl font-black text-white">สร้างนามบัตรดิจิทัล</span>
            </span>
          </button>
        )}

        {shouldShowProfileForm && (
          <>
            <div ref={formStartRef} />
            <section className="mt-4 rounded-3xl border border-[#F6D5BF] bg-white p-4 shadow-[0_18px_36px_-30px_rgba(249,115,22,0.55)]">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={publicPath ? `/${publicPath}?preview=1` : `${v2Prefix}/manage/profile`}
                  className="rounded-xl border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-2 text-center text-xs font-semibold text-[#475569]"
                >
                  ดูนามบัตร
                </Link>
                <button
                  type="button"
                  onClick={copyPublicUrl}
                  className="rounded-xl border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-2 text-center text-xs font-semibold text-[#475569]"
                >
                  <span className="inline-flex items-center gap-1"><Copy size={13} /> คัดลอกลิงก์</span>
                </button>
              </div>
            </section>

            {!isProfileUnlocked && (
              <section className="mt-4 rounded-3xl border border-[#F6D5BF] bg-[#FFF1E8] p-4 text-[#9A3412]">
                <div className="flex items-start gap-2">
                  <Lock size={16} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">ฟีเจอร์โปรไฟล์ถูกล็อก</p>
                    <p className="text-xs opacity-80">บัญชีนี้ยังไม่ปลดล็อก จึงไม่สามารถบันทึกการแก้ไขได้</p>
                  </div>
                </div>
              </section>
            )}

            <FormSection title="ข้อมูลหลัก" icon={<User size={16} />}>
              <Input label="ชื่อ-นามสกุล (ไทย)" value={form.nameTh} onChange={(value) => setForm((prev) => ({ ...prev, nameTh: value }))} disabled={!isProfileUnlocked} />
              <Input label="ชื่อ-นามสกุล (English)" value={form.nameEn} onChange={(value) => setForm((prev) => ({ ...prev, nameEn: value }))} disabled={!isProfileUnlocked} />
              <Input label="ตำแหน่ง" value={form.positionTh} onChange={(value) => setForm((prev) => ({ ...prev, positionTh: value }))} disabled={!isProfileUnlocked} icon={<Briefcase size={14} />} />
              <Input label="บริษัท/องค์กร" value={form.companyTh} onChange={(value) => setForm((prev) => ({ ...prev, companyTh: value }))} disabled={!isProfileUnlocked} icon={<Building2 size={14} />} />
            </FormSection>

            <FormSection title="รูปโปรไฟล์" icon={<ImageIcon size={16} />}>
              <div className="space-y-3">
                <input
                  ref={profileImageInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void uploadProfileImage(file);
                    }
                  }}
                />

                {profileImageUrl ? (
                  <div className="overflow-hidden rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF]">
                    {/* Live preview — drag to move, pinch / scroll to zoom */}
                    <div className="flex flex-col items-center bg-white p-4">
                      <div
                        ref={previewFrameRef}
                        onPointerDown={handleImagePointerDown}
                        onPointerMove={handleImagePointerMove}
                        onPointerUp={handleImagePointerUp}
                        onPointerCancel={handleImagePointerUp}
                        className={`relative aspect-square w-full max-w-[16rem] touch-none select-none overflow-hidden rounded-2xl border border-[#D9E1F2] bg-[#EEF0FF] ${canEditImage ? "cursor-grab active:cursor-grabbing" : ""}`}
                      >
                        <img
                          src={getAssetUrl(profileImageUrl)}
                          alt="Profile"
                          draggable={false}
                          className="pointer-events-none h-full w-full select-none object-cover"
                          style={{
                            objectPosition: `${profilePicPosition.x}% ${profilePicPosition.y}%`,
                            transform: `scale(${profilePicPosition.scale})`,
                          }}
                        />
                        {uploadingProfileImage && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/75 backdrop-blur-sm">
                            <Loader2 size={26} className="animate-spin text-[#050579]" />
                            <span className="text-xs font-bold text-[#050579]">กำลังอัปโหลด...</span>
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-center text-[11px] text-[#94A3B8]">
                        ลากรูปเพื่อจัดตำแหน่ง · ใช้สองนิ้วบีบเพื่อซูม
                      </p>
                    </div>

                    {/* Zoom buttons (desktop) + reset */}
                    <div className="flex items-center justify-center gap-2 border-t border-[#D9E1F2] bg-[#F8FAFF] px-4 py-3">
                      <button
                        type="button"
                        disabled={!canEditImage}
                        onClick={() => setProfilePicPosition((p) => ({ ...p, scale: clampScale(p.scale - 0.15) }))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D9E1F2] bg-white text-lg font-bold text-[#475569] disabled:opacity-50"
                        aria-label="ซูมออก"
                      >
                        −
                      </button>
                      <button
                        type="button"
                        disabled={!canEditImage}
                        onClick={() => setProfilePicPosition((p) => ({ ...p, scale: clampScale(p.scale + 0.15) }))}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#D9E1F2] bg-white text-lg font-bold text-[#475569] disabled:opacity-50"
                        aria-label="ซูมเข้า"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        disabled={!canEditImage}
                        onClick={() => setProfilePicPosition({ x: 50, y: 50, scale: 1 })}
                        className="ml-1 rounded-lg border border-[#D9E1F2] bg-white px-3 py-1.5 text-xs font-semibold text-[#64748B] transition-colors hover:text-[#050579] disabled:opacity-50"
                      >
                        รีเซ็ต
                      </button>
                    </div>

                    <div className="flex gap-2 border-t border-[#D9E1F2] p-3">
                      <button
                        type="button"
                        disabled={!isProfileUnlocked || uploadingProfileImage}
                        onClick={() => profileImageInputRef.current?.click()}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#D9E1F2] bg-white px-3 py-2 text-xs font-bold text-[#475569] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {uploadingProfileImage ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                        {uploadingProfileImage ? "กำลังอัปโหลด..." : "เปลี่ยนรูป"}
                      </button>
                      <button
                        type="button"
                        disabled={!isProfileUnlocked || uploadingProfileImage}
                        onClick={() => setProfileImageUrl("")}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#F3C3C3] bg-[#FEF2F2] px-3 py-2 text-xs font-bold text-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 size={14} />
                        ลบรูป
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={!isProfileUnlocked || uploadingProfileImage}
                    onClick={() => profileImageInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFF] px-4 py-6 text-sm font-semibold text-[#475569] transition hover:border-[#F97316] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {uploadingProfileImage ? <Loader2 size={18} className="animate-spin text-[#050579]" /> : <Upload size={18} className="text-[#050579]" />}
                    {uploadingProfileImage ? "กำลังอัปโหลดรูปโปรไฟล์..." : "อัปโหลดรูปโปรไฟล์"}
                  </button>
                )}
                <p className="text-xs text-[#94A3B8]">รองรับไฟล์ jpg, png, gif, webp ขนาดไม่เกิน 5MB</p>
              </div>
            </FormSection>

            <FormSection title="การติดต่อ" icon={<Phone size={16} />}>
              <Input label="เบอร์โทรศัพท์" value={form.phone} onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))} disabled={!isProfileUnlocked} icon={<Phone size={14} />} />
              <Input label="อีเมล" value={form.email} onChange={(value) => setForm((prev) => ({ ...prev, email: value }))} disabled={!isProfileUnlocked} icon={<Mail size={14} />} />
            </FormSection>

            <FormSection title="เกี่ยวกับฉัน" icon={<FileText size={16} />}>
              <label className="block text-xs font-semibold text-[#475569]">แนะนำตัว</label>
              <textarea
                value={form.aboutMe}
                onChange={(event) => setForm((prev) => ({ ...prev, aboutMe: event.target.value }))}
                disabled={!isProfileUnlocked}
                rows={5}
                className="mt-1 w-full rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-2 text-sm text-[#0F172A] outline-none focus:border-[#C7D2E5] disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="แนะนำธุรกิจหรือความเชี่ยวชาญของคุณ"
              />
            </FormSection>

            <FormSection title="โลโก้" icon={<ImageIcon size={16} />}>
              <div className="space-y-3">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void uploadLogoImage(file);
                    }
                  }}
                />

                {logo?.url ? (
                  <div className="overflow-hidden rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF]">
                    <div className="flex items-center justify-center bg-white p-4">
                      <img src={getAssetUrl(logo.url)} alt="Logo" className="max-h-28 w-auto object-contain" />
                    </div>
                    <div className="flex gap-2 border-t border-[#D9E1F2] p-3">
                      <button
                        type="button"
                        disabled={!isProfileUnlocked || uploadingLogo}
                        onClick={() => logoInputRef.current?.click()}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#D9E1F2] bg-white px-3 py-2 text-xs font-bold text-[#475569] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Upload size={14} />
                        เปลี่ยนโลโก้
                      </button>
                      <button
                        type="button"
                        disabled={!isProfileUnlocked || uploadingLogo}
                        onClick={() => setLogo(null)}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#F3C3C3] bg-[#FEF2F2] px-3 py-2 text-xs font-bold text-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 size={14} />
                        ลบโลโก้
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={!isProfileUnlocked || uploadingLogo}
                    onClick={() => logoInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFF] px-4 py-6 text-sm font-semibold text-[#475569] transition hover:border-[#F97316] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {uploadingLogo ? <Loader2 size={18} className="animate-spin text-[#050579]" /> : <Upload size={18} className="text-[#050579]" />}
                    {uploadingLogo ? "กำลังอัปโหลดโลโก้..." : "อัปโหลดโลโก้"}
                  </button>
                )}
                <p className="text-xs text-[#94A3B8]">รองรับไฟล์ jpg, png, gif, webp ขนาดไม่เกิน 5MB</p>
              </div>
            </FormSection>

            <FormSection title="แบคกราวด์" icon={<ImageIcon size={16} />}>
              <div className="space-y-3">
                <input
                  ref={backgroundInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                      void uploadBackgroundImage(file);
                    }
                  }}
                />

                {backgrounds[0]?.url ? (
                  <div className="overflow-hidden rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF]">
                    <div className="relative aspect-[16/9] bg-white">
                      <img src={getAssetUrl(backgrounds[0].url)} alt="Background preview" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/5 to-transparent" />
                      <div className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#050579]">
                        Background Preview
                      </div>
                    </div>
                    <div className="flex gap-2 border-t border-[#D9E1F2] p-3">
                      <button
                        type="button"
                        disabled={!isProfileUnlocked || uploadingBackground}
                        onClick={() => backgroundInputRef.current?.click()}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#D9E1F2] bg-white px-3 py-2 text-xs font-bold text-[#475569] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Upload size={14} />
                        เปลี่ยนพื้นหลัง
                      </button>
                      <button
                        type="button"
                        disabled={!isProfileUnlocked || uploadingBackground}
                        onClick={() => setBackgrounds([])}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#F3C3C3] bg-[#FEF2F2] px-3 py-2 text-xs font-bold text-[#B91C1C] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Trash2 size={14} />
                        ลบพื้นหลัง
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={!isProfileUnlocked || uploadingBackground}
                    onClick={() => backgroundInputRef.current?.click()}
                    className="flex w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-[#CBD5E1] bg-[#F8FAFF] px-4 py-6 text-sm font-semibold text-[#475569] transition hover:border-[#F97316] hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {uploadingBackground ? <Loader2 size={18} className="animate-spin text-[#050579]" /> : <Upload size={18} className="text-[#050579]" />}
                    {uploadingBackground ? "กำลังอัปโหลดพื้นหลัง..." : "อัปโหลดแบคกราวด์"}
                  </button>
                )}
                <p className="text-xs text-[#94A3B8]">ภาพนี้จะถูกใช้เป็นฉากหลังของหน้า public profile รองรับไฟล์ไม่เกิน 8MB</p>
              </div>
            </FormSection>

            <div className="h-28" />
          </>
        )}
      </section>

      {!isNewUser && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#D9E1F2] bg-white/92 px-4 pb-[calc(env(safe-area-inset-bottom,0px)+14px)] pt-3 shadow-[0_-18px_40px_-28px_rgba(15,23,42,0.28)] backdrop-blur-md">
          <div className="mx-auto w-full max-w-md">
            <button
              type="button"
              onClick={onSave}
              disabled={saving || !isProfileUnlocked}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#F97316] px-4 py-4 font-black text-white shadow-[0_18px_36px_-24px_rgba(249,115,22,0.85)] transition-all hover:bg-[#EA580C] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-55"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              {saving ? "กำลังบันทึก..." : "บันทึกข้อมูล"}
            </button>
          </div>
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast((prev) => ({ ...prev, isVisible: false }))}
      />
    </main>
  );
}

function FormSection({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-4 rounded-3xl border border-[#D9E1F2] bg-white p-4">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-[#050579]">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#F6F8FF] text-[#475569]">{icon}</span>
        {title}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Input({
  label,
  value,
  onChange,
  disabled,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-[#475569]">{label}</span>
      <div className="mt-1 flex items-center gap-2 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-3 py-2 focus-within:border-[#C7D2E5]">
        {icon ? <span className="text-[#64748B]">{icon}</span> : null}
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="w-full bg-transparent text-sm text-[#0F172A] outline-none disabled:cursor-not-allowed disabled:opacity-60"
        />
      </div>
    </label>
  );
}
