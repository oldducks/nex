"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { ArrowRight, Copy, Loader2, Lock, Save, User, Phone, Mail, Building2, Briefcase, FileText } from "lucide-react";
import { Toast, type ToastType } from "@/components/Toast";

type I18nField = { lang: string; value: string };
type ContactField = { label: string; value: string };

type MeProfileResponse = {
  uid?: string;
  url_prefix?: string;
  about_me?: string;
  names_i18n?: I18nField[];
  positions_i18n?: I18nField[];
  companies_i18n?: I18nField[];
  phones?: ContactField[];
  emails?: ContactField[];
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
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [profile, setProfile] = useState<MeProfileResponse | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType; isVisible: boolean }>({
    message: "",
    type: "info",
    isVisible: false,
  });

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

  const isAdmin = profile?.user?.role === "super_admin" || profile?.user?.role === "group_admin";
  const isPremium = profile?.subscription_tier === "premium";
  const planLabel = isAdmin ? "Admin" : isPremium ? "Premium" : "Free";

  const isProfileUnlocked = useMemo(() => {
    if (isAdmin || isPremium) return true;
    const config = profile?.feature_config;
    if (config && typeof config.profile === "boolean") {
      return config.profile;
    }
    return true;
  }, [isAdmin, isPremium, profile?.feature_config]);

  const publicPath = profile?.uid ? `${profile.url_prefix || "p"}/${profile.uid}` : "";
  const publicUrl = publicPath
    ? `${typeof window !== "undefined" ? window.location.origin : "https://nexsolution.cloud"}/${publicPath}`
    : "";

  const copyPublicUrl = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
      showToast("คัดลอกลิงก์แล้ว", "success");
    } catch {
      showToast("คัดลอกลิงก์ไม่สำเร็จ", "error");
    }
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

  return (
    <main className="min-h-screen bg-[#EEF0FF] text-[#0F172A]">
      <section className="mx-auto w-full max-w-md px-4 pb-8 pt-5">
        <header className="rounded-3xl border border-[#D9E1F2] bg-white p-5 shadow-[0_18px_40px_-30px_rgba(5,5,121,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#475569]">NEX Profile v2</p>
          <h1 className="mt-2 text-xl font-bold text-[#050579]">แก้ไขโปรไฟล์</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#475569]">
            สถานะตอนนี้ : {planLabel} Plan {isProfileUnlocked ? "(ปลดล็อกแล้ว)" : "(ยังไม่ปลดล็อก)"}
          </p>
        </header>

        <section className="mt-4 rounded-3xl border border-[#F6D5BF] bg-white p-4 shadow-[0_18px_36px_-30px_rgba(249,115,22,0.55)]">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9A3412]">Primary Action</p>
          <button
            type="button"
            onClick={onSave}
            disabled={saving || !isProfileUnlocked}
            className="mt-2 flex w-full items-center justify-between rounded-2xl bg-[#F97316] px-4 py-4 text-white disabled:cursor-not-allowed disabled:opacity-55"
          >
            <span className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              </span>
              <span>
                <span className="block text-sm font-semibold">บันทึกข้อมูลโปรไฟล์</span>
                <span className="block text-base font-bold leading-tight">{saving ? "กำลังบันทึก..." : "บันทึกการเปลี่ยนแปลง"}</span>
              </span>
            </span>
            <ArrowRight size={18} />
          </button>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Link
              href={publicPath ? `/${publicPath}` : `${v2Prefix}/manage/profile`}
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
      </section>

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
