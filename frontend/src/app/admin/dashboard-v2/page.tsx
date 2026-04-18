'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Save,
  ServerCog,
  ShieldAlert,
  Users,
} from 'lucide-react';

type DashboardData = {
  totalUsers: number;
  activeUsers: number;
};

type AiImageSettings = {
  provider: 'vertex';
  project_id: string;
  location: string;
  model: string;
  video_model?: string;
  service_account_email: string;
  has_service_account: boolean;
  is_enabled: boolean;
  updated_at: string | null;
};

type TestResult = {
  ok: boolean;
  provider: 'vertex';
  checks: string[];
};

const AI_IMAGE_MODELS = [
  { value: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image (Recommended)' },
  { value: 'gemini-3.1-flash-image-preview', label: 'Gemini 3.1 Flash Image Preview (Pro)' },
  { value: 'gemini-2.5-flash-image-preview', label: 'Gemini 2.5 Flash Image Preview' },
  { value: 'imagen-3.0-generate-002', label: 'Imagen 3.0 Generate 002' },
];

const AI_VIDEO_MODELS = [
  { value: '', label: 'Use Default / Fallback' },
  { value: 'veo-3.1-generate-001', label: 'Veo 3.1 Generate 001' },
  { value: 'veo-3.1-fast-generate-001', label: 'Veo 3.1 Fast Generate 001' },
  { value: 'veo-3.1-lite-generate-001', label: 'Veo 3.1 Lite Generate 001' },
  { value: 'veo-3.1-generate-preview', label: 'Veo 3.1 Generate Preview' },
];

const shellStyle = {
  ['--background' as string]: '#EEF0FF',
  ['--foreground' as string]: '#0F172A',
  ['--primary' as string]: '#050579',
  ['--accent' as string]: '#F97316',
};

export default function AdminDashboardV2Page() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [settings, setSettings] = useState<AiImageSettings | null>(null);

  const [projectId, setProjectId] = useState('');
  const [location, setLocation] = useState('asia-southeast1');
  const [model, setModel] = useState('gemini-2.5-flash-image');
  const [videoModel, setVideoModel] = useState('');
  const [serviceAccountJson, setServiceAccountJson] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);

  const [saveLoading, setSaveLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      router.replace('/login');
      return;
    }

    const load = async () => {
      try {
        setLoading(true);

        const profileRes = await fetch(`${API_URL}/profile/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!profileRes.ok) {
          router.replace('/login');
          return;
        }

        const profile = await profileRes.json();
        if (profile?.user?.role !== 'super_admin') {
          setAuthorized(false);
          return;
        }

        setAuthorized(true);

        const [dashboardRes, settingsRes] = await Promise.all([
          fetch(`${API_URL}/users/admin/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/admin/settings/ai-image`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (dashboardRes.ok) {
          const dashboard = await dashboardRes.json();
          setDashboardData({
            totalUsers: Number(dashboard?.totalUsers || 0),
            activeUsers: Number(dashboard?.activeUsers || 0),
          });
        }

        if (settingsRes.ok) {
          const aiSettings = (await settingsRes.json()) as AiImageSettings;
          setSettings(aiSettings);
          setProjectId(aiSettings.project_id || '');
          setLocation(aiSettings.location || 'asia-southeast1');
          setModel(aiSettings.model || 'gemini-2.5-flash-image');
          setVideoModel(aiSettings.video_model || '');
          setIsEnabled(Boolean(aiSettings.is_enabled));
        }
      } catch {
        setError('โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [API_URL, router]);

  const updatedAtLabel = useMemo(() => {
    if (!settings?.updated_at) return '-';
    return new Date(settings.updated_at).toLocaleString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [settings?.updated_at]);

  const handleSave = async () => {
    const token = Cookies.get('token');
    if (!token) return;

    setSaveLoading(true);
    setError(null);
    setMessage(null);

    try {
      const payload: Record<string, unknown> = {
        provider: 'vertex',
        project_id: projectId,
        location,
        model,
        video_model: videoModel,
        is_enabled: isEnabled,
      };

      if (serviceAccountJson.trim()) {
        payload.service_account_json = serviceAccountJson.trim();
      }

      const res = await fetch(`${API_URL}/admin/settings/ai-image`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('save failed');
      }

      const updated = (await res.json()) as AiImageSettings;
      setSettings(updated);
      setModel(updated.model || 'gemini-2.5-flash-image');
      setVideoModel(updated.video_model || '');
      setServiceAccountJson('');
      setMessage('บันทึกการตั้งค่า Vertex API แล้ว');
    } catch {
      setError('บันทึกไม่สำเร็จ กรุณาตรวจข้อมูลแล้วลองอีกครั้ง');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleTestConnection = async () => {
    const token = Cookies.get('token');
    if (!token) return;

    setTestLoading(true);
    setError(null);
    setMessage(null);
    setTestResult(null);

    try {
      const res = await fetch(`${API_URL}/admin/settings/ai-image/test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        throw new Error('test failed');
      }

      const result = (await res.json()) as TestResult;
      setTestResult(result);
      if (result.ok) {
        setMessage('ทดสอบการตั้งค่าสำเร็จ พร้อมใช้งาน');
      }
    } catch {
      setError('ทดสอบการตั้งค่าไม่สำเร็จ');
    } finally {
      setTestLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#EEF0FF] text-[#0F172A] flex items-center justify-center" style={shellStyle}>
        <Loader2 size={28} className="animate-spin text-[#050579]" />
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-[#EEF0FF] text-[#0F172A] flex items-center justify-center p-6" style={shellStyle}>
        <section className="w-full max-w-md rounded-3xl border border-[#D9E1F2] bg-white p-6 text-center shadow-[0_24px_60px_-40px_rgba(5,5,121,0.35)]">
          <ShieldAlert className="mx-auto text-[#B91C1C]" size={34} />
          <h1 className="mt-3 text-xl font-black text-[#050579]">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="mt-1 text-sm text-[#475569]">หน้านี้สำหรับ Super Admin เท่านั้น</p>
          <button
            onClick={() => router.push('/manage/profile')}
            className="mt-5 inline-flex items-center justify-center rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-2 text-sm font-semibold text-[#050579]"
          >
            กลับหน้าโปรไฟล์
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#EEF0FF] text-[#0F172A]" style={shellStyle}>
      <section className="mx-auto w-full max-w-5xl px-4 pb-10 pt-5 sm:px-6">
        <header className="mb-4 rounded-3xl border border-[#D9E1F2] bg-white p-4 shadow-[0_24px_60px_-40px_rgba(5,5,121,0.35)] sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/dashboard"
                className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] text-[#050579]"
                title="กลับหน้าเดิม"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#64748B]">Admin Console</p>
                <h1 className="text-xl font-black text-[#050579]">Dashboard V2</h1>
              </div>
            </div>
            <Link
              href="/admin/secret-create"
              className="inline-flex items-center justify-center rounded-2xl bg-[#F97316] px-4 py-2 text-sm font-bold text-white hover:bg-[#EA580C]"
            >
              สร้างผู้ใช้ใหม่
            </Link>
          </div>
        </header>

        <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <article className="rounded-3xl border border-[#D9E1F2] bg-white p-4 shadow-[0_24px_60px_-40px_rgba(5,5,121,0.3)]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#64748B]">ผู้ใช้ทั้งหมด</p>
            <p className="mt-1 text-3xl font-black text-[#050579]">{dashboardData?.totalUsers || 0}</p>
          </article>
          <article className="rounded-3xl border border-[#D9E1F2] bg-white p-4 shadow-[0_24px_60px_-40px_rgba(5,5,121,0.3)]">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#64748B]">บัญชีที่ใช้งาน</p>
            <p className="mt-1 text-3xl font-black text-[#050579]">{dashboardData?.activeUsers || 0}</p>
          </article>
        </section>

        <section className="rounded-3xl border border-[#D9E1F2] bg-white p-4 shadow-[0_24px_60px_-40px_rgba(5,5,121,0.3)] sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-black text-[#050579]">
                <ServerCog size={18} />
                ตั้งค่า API สร้างรูป
              </h2>
              <p className="mt-1 text-sm text-[#475569]">Provider: Google Vertex AI</p>
            </div>
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${isEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
              {isEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-bold text-[#334155]">Project ID</span>
              <input
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-2xl border border-[#D9E1F2] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#050579]/30 focus:ring-2 focus:ring-[#050579]/10"
                placeholder="เช่น nex-solution-prod"
              />
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-bold text-[#334155]">Region (location)</span>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-2xl border border-[#D9E1F2] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#050579]/30 focus:ring-2 focus:ring-[#050579]/10"
                placeholder="เช่น asia-southeast1"
              />
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-xs font-bold text-[#334155]">Image Model</span>
                <select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full rounded-2xl border border-[#D9E1F2] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#050579]/30 focus:ring-2 focus:ring-[#050579]/10"
                >
                  {AI_IMAGE_MODELS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-[#64748B]">
                  ใช้กับงานสร้างและแก้ภาพ
                </p>
              </label>

              <label className="block">
                <span className="mb-1 block text-xs font-bold text-[#334155]">Video Model</span>
                <select
                  value={videoModel}
                  onChange={(e) => setVideoModel(e.target.value)}
                  className="w-full rounded-2xl border border-[#D9E1F2] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#050579]/30 focus:ring-2 focus:ring-[#050579]/10"
                >
                  {AI_VIDEO_MODELS.map((option) => (
                    <option key={option.value || 'default'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-[#64748B]">
                  ใช้กับงานสร้างวิดีโอ ถ้าเลือก Default จะใช้ fallback ของระบบ
                </p>
              </label>
            </div>

            <label className="block">
              <span className="mb-1 block text-xs font-bold text-[#334155]">Service Account JSON</span>
              <textarea
                value={serviceAccountJson}
                onChange={(e) => setServiceAccountJson(e.target.value)}
                className="min-h-[120px] w-full resize-y rounded-2xl border border-[#D9E1F2] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:border-[#050579]/30 focus:ring-2 focus:ring-[#050579]/10"
                placeholder="วาง JSON ทั้งก้อนที่นี่ (ระบบจะเข้ารหัสก่อนบันทึก)"
              />
              <p className="mt-1 text-xs text-[#64748B]">
                สถานะล่าสุด: {settings?.has_service_account ? `มีไฟล์แล้ว (${settings.service_account_email || 'ไม่พบ email'})` : 'ยังไม่มีไฟล์'}
              </p>
            </label>

            <label className="inline-flex items-center gap-2 rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] px-3 py-2.5">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="h-4 w-4 rounded border-[#CBD5E1] text-[#050579] focus:ring-[#050579]/30"
              />
              <span className="text-sm font-semibold text-[#1E293B]">เปิดใช้งาน Vertex provider</span>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-2.5 text-sm font-bold text-[#050579] disabled:opacity-60"
            >
              {testLoading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              ทดสอบการตั้งค่า
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saveLoading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F97316] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#EA580C] disabled:opacity-60"
            >
              {saveLoading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              บันทึก
            </button>

            <span className="text-xs text-[#64748B]">อัปเดตล่าสุด: {updatedAtLabel}</span>
          </div>

          {message ? (
            <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-medium text-emerald-700">
              <p className="inline-flex items-center gap-2"><CheckCircle2 size={15} />{message}</p>
            </div>
          ) : null}

          {error ? (
            <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">{error}</div>
          ) : null}

          {testResult ? (
            <div className={`mt-3 rounded-2xl border p-3 text-sm ${testResult.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
              <p className="font-bold">ผลทดสอบ: {testResult.ok ? 'พร้อมใช้งาน' : 'ต้องแก้ไขข้อมูลก่อนใช้งาน'}</p>
              <ul className="mt-1 list-disc pl-5">
                {testResult.checks.map((line, idx) => (
                  <li key={`check-${idx}`}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>

        <section className="mt-4 rounded-3xl border border-[#D9E1F2] bg-white p-4 shadow-[0_24px_60px_-40px_rgba(5,5,121,0.25)]">
          <h3 className="flex items-center gap-2 text-base font-black text-[#050579]"><Users size={16} />จัดการผู้ใช้ขั้นสูง</h3>
          <p className="mt-1 text-sm text-[#475569]">งานจัดการผู้ใช้เชิงลึกยังใช้งานได้ที่หน้าเดิม</p>
          <Link
            href="/admin/dashboard"
            className="mt-3 inline-flex items-center justify-center rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-2 text-sm font-semibold text-[#050579]"
          >
            เปิดหน้า Admin Dashboard เดิม
          </Link>
        </section>
      </section>
    </main>
  );
}
