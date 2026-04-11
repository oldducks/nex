'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Link from 'next/link';
import {
    Users, UserPlus, Eye, Download, Trash2, ToggleLeft, ToggleRight,
    Loader2, ShieldAlert, LogIn, AlertTriangle, CheckCircle, XCircle,
    Calendar, Edit3, RefreshCw, Settings2,
    BookOpen, BarChart3, Smartphone, Layout, UserCircle, ListChecks, ServerCog, Save, Search, Pencil, Plus
} from 'lucide-react';

interface UserStats {
    viewCount: number;
    downloadVcf: number;
    viewCatalog: number;
    downloadPdf: number;
    lastActivity: string | null;
}

interface FeatureConfig {
    catalog: boolean;
    leads: boolean;
    namecard: boolean;
    'landing-pages': boolean;
    analytics: boolean;
    profile: boolean;
    referrals: boolean;
}

const FEATURE_LABELS: Record<keyof FeatureConfig, { label: string; icon: React.ReactNode; description: string }> = {
    catalog: { label: 'Interactive Catalog', icon: <BookOpen size={14} />, description: 'สร้างและจัดการแคตตาล็อกสินค้าออนไลน์' },
    leads: { label: 'Capture Leads', icon: <Users size={14} />, description: 'ระบบรวบรวมรายชื่อผู้ติดต่อจากหน้าโปรไฟล์' },
    namecard: { label: 'Digital Namecard', icon: <Smartphone size={14} />, description: 'ระบบออกแบบนามบัตรและ QR Code สำหรับพิมพ์' },
    'landing-pages': { label: 'Landing Pages', icon: <Layout size={14} />, description: 'สร้างหน้าเซลล์เพจและแคมเปญการตลาด' },
    analytics: { label: 'Advanced Analytics', icon: <BarChart3 size={14} />, description: 'ระบบวิเคราะห์สถิติผู้เข้าชมเชิงลึก' },
    profile: { label: 'Digital Profile', icon: <UserCircle size={14} />, description: 'ระบบแก้ไขข้อมูลโปรไฟล์หลัก (นามบัตรดิจิทัล)' },
    referrals: { label: 'Referral System', icon: <Users size={14} />, description: 'ระบบแนะนำสมาชิกและรับค่าคอมมิชชั่น' },
};

const DEFAULT_FEATURE_CONFIG: FeatureConfig = {
    catalog: true,
    leads: true,
    namecard: true,
    'landing-pages': true,
    analytics: true,
    profile: true,
    referrals: true,
};

interface DashboardUser {
    id: number;
    uid: string;
    email: string;
    full_name?: string | null;
    mobile?: string | null;
    role: 'super_admin' | 'group_admin' | 'user';
    group_id: number | null;
    is_active: boolean;
    expiration_date: string | null;
    created_at: string;
    stats: UserStats;
    subscription_tier: 'free' | 'premium';
    feature_config?: FeatureConfig;
}

interface DashboardData {
    totalUsers: number;
    activeUsers: number;
    users: DashboardUser[];
}

interface ExecutiveReportDaily {
    date: string;
    newUsers: number;
    loginSuccess: number;
    viewProfile: number;
    viewCatalog: number;
    downloadVcf: number;
    downloadPdf: number;
    viewLandingPage: number;
}

interface ExecutiveReport {
    period?: 'weekly' | 'monthly';
    days: number;
    generatedAt: string;
    summary: {
        totalUsers: number;
        activeUsers: number;
        premiumUsers: number;
        freeUsers: number;
        newUsersInPeriod: number;
        activeUsersInPeriod: number;
        loginSuccessInPeriod: number;
        viewProfileInPeriod: number;
        viewCatalogInPeriod: number;
        downloadVcfInPeriod: number;
        downloadPdfInPeriod: number;
        viewLandingPageInPeriod: number;
    };
    daily: ExecutiveReportDaily[];
}

interface AiImageSettings {
    provider: 'vertex';
    connection_mode?: 'cloud_run_proxy' | 'api_key';
    provider_url?: string;
    account_label?: string;
    promotion_ends_at?: string | null;
    note?: string;
    project_id: string;
    location: string;
    model: string;
    video_model?: string;
    has_api_key: boolean;
    has_adc?: boolean;
    auth_mode?: 'api_key' | 'adc' | 'unconfigured';
    api_key_masked: string;
    is_enabled: boolean;
    last_test_status?: 'connected' | 'failed' | null;
    last_tested_at?: string | null;
    last_test_message?: string;
    updated_at: string | null;
}

interface AiImageTestResult {
    ok: boolean;
    provider: 'vertex';
    checks: string[];
}

interface TemplateCategory {
    id: number;
    name: string;
    slug: string;
}

interface TemplateField {
    id: number;
}

interface AdminTemplateItem {
    id: number;
    name: string;
    slug: string;
    cover_image_url?: string;
    aspect_ratio: string;
    status: 'draft' | 'active' | 'inactive';
    updated_at: string;
    category: TemplateCategory | null;
    fields?: TemplateField[];
}

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

export default function SuperAdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'users' | 'reports' | 'api' | 'templates'>('users');
    const [searchTerm, setSearchTerm] = useState('');
    const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'premium'>('all');
    const [activityFilter, setActivityFilter] = useState<'all' | 'latest_desc' | 'latest_asc' | 'no_activity'>('all');
    const [rowsPerPage, setRowsPerPage] = useState<10 | 50 | 100>(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [detailUserId, setDetailUserId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
    const [toggleConfirm, setToggleConfirm] = useState<number | null>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);
    const [editExpiration, setEditExpiration] = useState<{ userId: number; date: string } | null>(null);
    const [editFeatures, setEditFeatures] = useState<{ userId: number; config: FeatureConfig } | null>(null);
    const [aiSettings, setAiSettings] = useState<AiImageSettings | null>(null);
    const [connectionMode, setConnectionMode] = useState<'cloud_run_proxy' | 'api_key'>('cloud_run_proxy');
    const [providerUrl, setProviderUrl] = useState('');
    const [accountLabel, setAccountLabel] = useState('');
    const [promotionEndsAt, setPromotionEndsAt] = useState('');
    const [providerNote, setProviderNote] = useState('');
    const [projectId, setProjectId] = useState('');
    const [location, setLocation] = useState('asia-southeast1');
    const [model, setModel] = useState('gemini-2.5-flash-image');
    const [videoModel, setVideoModel] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [clearStoredApiKey, setClearStoredApiKey] = useState(false);
    const [isEnabled, setIsEnabled] = useState(false);
    const [aiSaveLoading, setAiSaveLoading] = useState(false);
    const [aiTestLoading, setAiTestLoading] = useState(false);
    const [aiMessage, setAiMessage] = useState<string | null>(null);
    const [aiError, setAiError] = useState<string | null>(null);
    const [aiTestResult, setAiTestResult] = useState<AiImageTestResult | null>(null);
    const [templateLoading, setTemplateLoading] = useState(false);
    const [templateActionLoading, setTemplateActionLoading] = useState<number | null>(null);
    const [templates, setTemplates] = useState<AdminTemplateItem[]>([]);
    const [templateCategories, setTemplateCategories] = useState<TemplateCategory[]>([]);
    const [templateSearch, setTemplateSearch] = useState('');
    const [templateCategoryId, setTemplateCategoryId] = useState('all');
    const [reportPeriod, setReportPeriod] = useState<'weekly' | 'monthly'>('weekly');
    const [executiveReport, setExecutiveReport] = useState<ExecutiveReport | null>(null);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState<string | null>(null);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    // Check authorization and fetch data
    useEffect(() => {
        const fetchData = async () => {
            const token = Cookies.get('token');
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                // Check if user is super_admin first
                const profileRes = await fetch(`${API_URL}/profile/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    if (profileData.user?.role !== 'super_admin') {
                        setLoading(false);
                        return;
                    }
                    setAuthorized(true);
                }

                // Fetch admin dashboard data + AI settings
                const [dashboardRes, aiSettingsRes] = await Promise.all([
                    fetch(`${API_URL}/users/admin/dashboard`, {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    fetch(`${API_URL}/admin/settings/ai-image`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                if (dashboardRes.ok) {
                    const data = await dashboardRes.json();
                    setDashboardData(data);
                }

                if (aiSettingsRes.ok) {
                    const data = await aiSettingsRes.json() as AiImageSettings;
                    setAiSettings(data);
                    setConnectionMode(data.connection_mode || 'cloud_run_proxy');
                    setProviderUrl(data.provider_url || '');
                    setAccountLabel(data.account_label || '');
                    setPromotionEndsAt(data.promotion_ends_at ? data.promotion_ends_at.split('T')[0] : '');
                    setProviderNote(data.note || '');
                    setProjectId(data.project_id || '');
                    setLocation(data.location || 'asia-southeast1');
                    setModel(data.model || 'gemini-2.5-flash-image');
                    setVideoModel(data.video_model || '');
                    setIsEnabled(Boolean(data.is_enabled));
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
            setLoading(false);
        };
        fetchData();
    }, [API_URL]);

    const toggleUserActive = async (userId: number) => {
        setActionLoading(userId);
        const token = Cookies.get('token');
        try {
            const res = await fetch(`${API_URL}/users/${userId}/toggle-active`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const updated = await res.json();
                setDashboardData(prev => prev ? {
                    ...prev,
                    users: prev.users.map(u => u.id === userId ? { ...u, is_active: updated.is_active } : u),
                    activeUsers: prev.users.filter(u => u.id === userId ? updated.is_active : u.is_active).length
                } : null);
            }
        } catch (error) {
            console.error('Toggle failed:', error);
        }
        setActionLoading(null);
    };

    const deleteUser = async (userId: number) => {
        setActionLoading(userId);
        const token = Cookies.get('token');
        try {
            const res = await fetch(`${API_URL}/users/${userId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                setDashboardData(prev => prev ? {
                    ...prev,
                    totalUsers: prev.totalUsers - 1,
                    users: prev.users.filter(u => u.id !== userId)
                } : null);
            }
        } catch (error) {
            console.error('Delete failed:', error);
        }
        setDeleteConfirm(null);
        setActionLoading(null);
    };

    const updateExpiration = async (userId: number, date: string | null) => {
        setActionLoading(userId);
        const token = Cookies.get('token');
        try {
            const res = await fetch(`${API_URL}/users/${userId}/expiration`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ expiration_date: date })
            });
            if (res.ok) {
                setDashboardData(prev => prev ? {
                    ...prev,
                    users: prev.users.map(u => u.id === userId ? { ...u, expiration_date: date } : u)
                } : null);
            }
        } catch (error) {
            console.error('Update expiration failed:', error);
        }
        setEditExpiration(null);
        setActionLoading(null);
    };

    const checkExpiredUsers = async () => {
        const token = Cookies.get('token');
        try {
            const res = await fetch(`${API_URL}/users/check-expired`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const result = await res.json();
                alert(`ปิดการใช้งาน ${result.disabledCount} บัญชีที่หมดอายุ`);
                // Refresh data
                window.location.reload();
            }
        } catch (error) {
            console.error('Check expired failed:', error);
        }
    };

    const updateFeatureConfig = async (userId: number, config: FeatureConfig) => {
        setActionLoading(userId);
        const token = Cookies.get('token');
        try {
            const res = await fetch(`${API_URL}/users/${userId}/feature-config`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(config)
            });
            if (res.ok) {
                const updated = await res.json();
                setDashboardData(prev => prev ? {
                    ...prev,
                    users: prev.users.map(u => u.id === userId ? { ...u, feature_config: updated.feature_config } : u)
                } : null);
            }
        } catch (error) {
            console.error('Update feature config failed:', error);
        }
        setEditFeatures(null);
        setActionLoading(null);
    };

    const updateUserTier = async (userId: number, tier: string) => {
        setActionLoading(userId);
        const token = Cookies.get('token');
        try {
            const res = await fetch(`${API_URL}/users/${userId}/tier`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ tier })
            });
            if (res.ok) {
                const updated = await res.json();
                setDashboardData(prev => prev ? {
                    ...prev,
                    users: prev.users.map(u => u.id === userId ? { 
                        ...u, 
                        subscription_tier: updated.subscription_tier,
                        feature_config: updated.feature_config || u.feature_config
                    } : u)
                } : null);
            }
        } catch (error) {
            console.error('Update tier failed:', error);
        }
        setActionLoading(null);
    };

    const updateUserRole = async (userId: number, role: string) => {
        setActionLoading(userId);
        const token = Cookies.get('token');
        try {
            const res = await fetch(`${API_URL}/users/${userId}/role`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ role })
            });
            if (res.ok) {
                const updated = await res.json();
                setDashboardData(prev => prev ? {
                    ...prev,
                    users: prev.users.map(u => u.id === userId ? { 
                        ...u, 
                        role: updated.role
                    } : u)
                } : null);
            }
        } catch (error) {
            console.error('Update role failed:', error);
        }
        setActionLoading(null);
    };

    const saveAiSettings = async () => {
        const token = Cookies.get('token');
        if (!token) return;

        setAiSaveLoading(true);
        setAiError(null);
        setAiMessage(null);
        try {
            const payload: Record<string, unknown> = {
                provider: 'vertex',
                connection_mode: connectionMode,
                provider_url: providerUrl,
                account_label: accountLabel,
                promotion_ends_at: promotionEndsAt || null,
                note: providerNote,
                project_id: projectId,
                location,
                model,
                video_model: videoModel,
                is_enabled: isEnabled,
            };
            if (connectionMode === 'api_key' && (clearStoredApiKey || apiKey.trim())) {
                payload.api_key = apiKey.trim();
            }

            const res = await fetch(`${API_URL}/admin/settings/ai-image`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                throw new Error('save ai settings failed');
            }

            const updated = await res.json() as AiImageSettings;
            setAiSettings(updated);
            setModel(updated.model || 'gemini-2.5-flash-image');
            setVideoModel(updated.video_model || '');
            setApiKey('');
            setClearStoredApiKey(false);
            setAiMessage('บันทึกการตั้งค่า Vertex provider แล้ว');
        } catch (error) {
            console.error('Save AI settings failed:', error);
            setAiError('บันทึกไม่สำเร็จ กรุณาตรวจข้อมูลแล้วลองอีกครั้ง');
        }
        setAiSaveLoading(false);
    };

    const testAiSettings = async () => {
        const token = Cookies.get('token');
        if (!token) return;

        setAiTestLoading(true);
        setAiError(null);
        setAiMessage(null);
        setAiTestResult(null);
        try {
            const res = await fetch(`${API_URL}/admin/settings/ai-image/test`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) {
                throw new Error('test ai settings failed');
            }

            const result = await res.json() as AiImageTestResult;
            setAiTestResult(result);
            const settingsRes = await fetch(`${API_URL}/admin/settings/ai-image`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (settingsRes.ok) {
                const refreshed = await settingsRes.json() as AiImageSettings;
                setAiSettings(refreshed);
                setModel(refreshed.model || 'gemini-2.5-flash-image');
                setVideoModel(refreshed.video_model || '');
            }
            if (result.ok) {
                setAiMessage('ทดสอบการตั้งค่าสำเร็จ พร้อมใช้งาน');
            }
        } catch (error) {
            console.error('Test AI settings failed:', error);
            setAiError('ทดสอบการตั้งค่าไม่สำเร็จ');
        }
        setAiTestLoading(false);
    };

    const fetchTemplateData = useCallback(async () => {
        const token = Cookies.get('token');
        if (!token) return;

        setTemplateLoading(true);
        try {
            const [templateRes, categoryRes] = await Promise.all([
                fetch(`${API_URL}/admin/digital-media/templates`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                fetch(`${API_URL}/admin/digital-media/categories`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            if (templateRes.ok) {
                const data = await templateRes.json() as AdminTemplateItem[];
                setTemplates(data || []);
            }
            if (categoryRes.ok) {
                const data = await categoryRes.json() as TemplateCategory[];
                setTemplateCategories(data || []);
            }
        } catch (error) {
            console.error('Fetch template data failed:', error);
        }
        setTemplateLoading(false);
    }, [API_URL]);

    const fetchExecutiveReport = useCallback(async (period: 'weekly' | 'monthly') => {
        const token = Cookies.get('token');
        if (!token) return;
        setReportLoading(true);
        setReportError(null);
        try {
            const res = await fetch(`${API_URL}/users/admin/executive-report?period=${period}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setExecutiveReport(data);
                setReportError(null);
            } else {
                setExecutiveReport(null);
                const body = await res.json().catch(() => ({}));
                setReportError(body?.message || 'โหลดข้อมูลรายงานไม่สำเร็จ');
            }
        } catch (error) {
            console.error('Failed to fetch executive report:', error);
            setExecutiveReport(null);
            setReportError('เชื่อมต่อข้อมูลรายงานไม่สำเร็จ');
        } finally {
            setReportLoading(false);
        }
    }, [API_URL]);

    const toggleTemplateStatus = async (templateId: number) => {
        const token = Cookies.get('token');
        if (!token) return;
        setTemplateActionLoading(templateId);
        try {
            const res = await fetch(`${API_URL}/admin/digital-media/templates/${templateId}/toggle`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                await fetchTemplateData();
            }
        } catch (error) {
            console.error('Toggle template failed:', error);
        }
        setTemplateActionLoading(null);
    };

    const removeTemplate = async (templateId: number) => {
        const token = Cookies.get('token');
        if (!token) return;
        const ok = window.confirm('ยืนยันลบเทมเพลตนี้?');
        if (!ok) return;

        setTemplateActionLoading(templateId);
        try {
            const res = await fetch(`${API_URL}/admin/digital-media/templates/${templateId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                await fetchTemplateData();
            }
        } catch (error) {
            console.error('Delete template failed:', error);
        }
        setTemplateActionLoading(null);
    };

    const getResolvedFeatureConfig = (user: DashboardUser): FeatureConfig => {
        // Admins and Premium users always have all features enabled
        if (user.role === 'super_admin' || user.role === 'group_admin' || user.subscription_tier === 'premium') {
            return DEFAULT_FEATURE_CONFIG;
        }

        const config = user.feature_config;
        if (!config || Object.keys(config).length === 0) {
            // Default for Free users is only 'profile' enabled
            return {
                catalog: false,
                leads: false,
                namecard: false,
                'landing-pages': false,
                analytics: false,
                profile: true,
                referrals: false,
            };
        }

        return {
            catalog: config.catalog ?? false,
            leads: config.leads ?? false,
            namecard: config.namecard ?? false,
            'landing-pages': config['landing-pages'] ?? false,
            analytics: config.analytics ?? false,
            profile: config.profile ?? false,
            referrals: config.referrals ?? false,
        };
    };

    const countEnabledFeatures = (user: DashboardUser): number => {
        const resolved = getResolvedFeatureConfig(user);
        return Object.values(resolved).filter(Boolean).length;
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('th-TH', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const formatDateTime = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleString('th-TH', {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const aiUpdatedAtLabel = formatDateTime(aiSettings?.updated_at || null);
    const aiLastCheckedAtLabel = formatDateTime(aiSettings?.last_tested_at || null);
    const aiConnectionStatusLabel = aiSettings?.last_test_status === 'connected'
        ? 'Connected'
        : aiSettings?.last_test_status === 'failed'
            ? 'Failed'
            : 'Not checked';

    const getDaysRemaining = (dateStr: string | null): { days: number; text: string; color: string } | null => {
        if (!dateStr) return null;
        const now = new Date();
        const exp = new Date(dateStr);
        const diff = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diff < 0) return { days: diff, text: `หมดอายุ ${Math.abs(diff)} วัน`, color: 'text-red-400' };
        if (diff === 0) return { days: 0, text: 'หมดอายุวันนี้!', color: 'text-red-400' };
        if (diff <= 7) return { days: diff, text: `เหลือ ${diff} วัน`, color: 'text-yellow-400' };
        if (diff <= 30) return { days: diff, text: `เหลือ ${diff} วัน`, color: 'text-orange-400' };
        return { days: diff, text: `เหลือ ${diff} วัน`, color: 'text-green-400' };
    };
    const promotionRemaining = getDaysRemaining(promotionEndsAt || null);

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'super_admin': return <span className="px-2 py-1 text-xs font-bold bg-purple-500/20 text-purple-400 rounded-full">🔑 Super Admin</span>;
            case 'group_admin': return <span className="px-2 py-1 text-xs font-bold bg-blue-500/20 text-blue-400 rounded-full">👥 Group Admin</span>;
            default: return <span className="px-2 py-1 text-xs font-bold bg-[#F1F5F9] text-[#64748B] rounded-full">👤 User</span>;
        }
    };

    const splitName = (fullName?: string | null): { firstName: string; lastName: string } => {
        const normalized = (fullName || '').trim().replace(/\s+/g, ' ');
        if (!normalized) {
            return { firstName: '-', lastName: '-' };
        }
        const [firstName, ...rest] = normalized.split(' ');
        const lastName = rest.join(' ').trim();
        return { firstName: firstName || '-', lastName: lastName || '-' };
    };

    const filteredUsers = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        const base = (dashboardData?.users || []).filter((user) => {
            const nameParts = splitName(user.full_name);
            const fullNameLabel = [nameParts.firstName, nameParts.lastName]
                .filter((part) => part && part !== '-')
                .join(' ')
                .trim();
            const matchesKeyword = !keyword || (
                user.uid?.toLowerCase().includes(keyword) ||
                (user.email || '').toLowerCase().includes(keyword) ||
                (user.mobile || '').toLowerCase().includes(keyword) ||
                fullNameLabel.toLowerCase().includes(keyword)
            );
            const matchesTier = tierFilter === 'all' || user.subscription_tier === tierFilter;
            return matchesKeyword && matchesTier;
        });

        if (activityFilter === 'no_activity') {
            return base.filter((user) => !user.stats.lastActivity);
        }

        if (activityFilter === 'latest_desc' || activityFilter === 'latest_asc') {
            return base
                .slice()
                .sort((a, b) => {
                    const aTime = a.stats.lastActivity ? new Date(a.stats.lastActivity).getTime() : -1;
                    const bTime = b.stats.lastActivity ? new Date(b.stats.lastActivity).getTime() : -1;
                    return activityFilter === 'latest_desc' ? bTime - aTime : aTime - bTime;
                });
        }

        return base;
    }, [dashboardData?.users, searchTerm, tierFilter, activityFilter]);

    const filteredTemplates = useMemo(() => {
        const keyword = templateSearch.trim().toLowerCase();
        return templates.filter((item) => {
            const categoryMatch = templateCategoryId === 'all' || String(item.category?.id || '') === templateCategoryId;
            if (!categoryMatch) return false;
            if (!keyword) return true;
            return [item.name, item.slug, item.category?.name || ''].join(' ').toLowerCase().includes(keyword);
        });
    }, [templates, templateSearch, templateCategoryId]);

    const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));
    const safeCurrentPage = Math.min(currentPage, totalPages);
    const startIndex = (safeCurrentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const pagedUsers = filteredUsers.slice(startIndex, endIndex);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, tierFilter, activityFilter, rowsPerPage]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    useEffect(() => {
        if (activeTab === 'templates' && authorized && templates.length === 0 && !templateLoading) {
            fetchTemplateData();
        }
    }, [activeTab, authorized, templates.length, templateLoading, fetchTemplateData]);

    useEffect(() => {
        if (activeTab !== 'reports') return;
        void fetchExecutiveReport(reportPeriod);
    }, [activeTab, reportPeriod, fetchExecutiveReport]);

    const maxDailyActivity = useMemo(() => {
        if (!executiveReport?.daily?.length) return 1;
        return Math.max(
            1,
            ...executiveReport.daily.map((item) =>
                item.loginSuccess + item.viewCatalog + item.viewProfile + item.downloadPdf + item.downloadVcf + item.newUsers,
            ),
        );
    }, [executiveReport]);
    const maxDailyNewUsers = useMemo(() => {
        if (!executiveReport?.daily?.length) return 1;
        return Math.max(1, ...executiveReport.daily.map((item) => item.newUsers));
    }, [executiveReport]);
    const detailUser = (dashboardData?.users || []).find((user) => user.id === detailUserId) || null;
    const toggleConfirmUser = (dashboardData?.users || []).find((user) => user.id === toggleConfirm) || null;

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    // Not logged in
    if (!Cookies.get('token')) {
        return (
            <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A] flex items-center justify-center p-6">
                <div className="text-center">
                    <LogIn size={64} className="text-[#94A3B8] mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">กรุณาเข้าสู่ระบบ</h1>
                    <button onClick={() => router.push('/login')} className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-3 px-8 rounded-xl">
                        ไปหน้าเข้าสู่ระบบ
                    </button>
                </div>
            </div>
        );
    }

    // Not authorized
    if (!authorized) {
        return (
            <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A] flex items-center justify-center p-6">
                <div className="text-center">
                    <ShieldAlert size={64} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-2">ไม่มีสิทธิ์เข้าถึง</h1>
                    <p className="text-[#64748B] mb-6">หน้านี้สำหรับ Super Admin เท่านั้น</p>
                    <button onClick={() => router.push('/manage/profile')} className="border border-[#D9E1F2] bg-white text-[#050579] font-bold py-3 px-8 rounded-xl hover:bg-[#F8FAFF]">
                        กลับหน้าโปรไฟล์
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#EEF0FF] text-[#0F172A] p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Users size={32} className="text-primary" />
                            Super Admin Dashboard
                        </h1>
                        <p className="text-[#64748B] mt-1">จัดการผู้ใช้ทั้งหมดในระบบ</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={checkExpiredUsers}
                            className="bg-white border border-[#D9E1F2] hover:bg-[#F8FAFF] text-[#050579] font-medium py-3 px-5 rounded-xl flex items-center gap-2 transition-all"
                            title="ปิดบัญชีที่หมดอายุ"
                        >
                            <RefreshCw size={18} /> ตรวจหมดอายุ
                        </button>
                        <Link
                            href="/admin/secret-create"
                            className="bg-[#F97316] hover:bg-[#EA580C] text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all"
                        >
                            <UserPlus size={20} /> สร้างผู้ใช้ใหม่
                        </Link>
                    </div>
                </div>

                <div className="mb-6 flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`rounded-xl px-4 py-2 text-sm font-bold transition-all ${activeTab === 'users'
                            ? 'bg-[#050579] text-white'
                            : 'bg-white border border-[#D9E1F2] text-[#334155] hover:bg-[#F8FAFF]'
                            }`}
                    >
                        ผู้ใช้ทั้งหมด
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${activeTab === 'reports'
                            ? 'bg-[#050579] text-white'
                            : 'bg-white border border-[#D9E1F2] text-[#334155] hover:bg-[#F8FAFF]'
                            }`}
                    >
                        <BarChart3 size={14} />
                        รายงานผู้บริหาร
                    </button>
                    <button
                        onClick={() => setActiveTab('api')}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${activeTab === 'api'
                            ? 'bg-[#050579] text-white'
                            : 'bg-white border border-[#D9E1F2] text-[#334155] hover:bg-[#F8FAFF]'
                            }`}
                    >
                        <ServerCog size={14} />
                        ตั้งค่า Vertex Provider
                    </button>
                    <button
                        onClick={() => setActiveTab('templates')}
                        className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all ${activeTab === 'templates'
                            ? 'bg-[#050579] text-white'
                            : 'bg-white border border-[#D9E1F2] text-[#334155] hover:bg-[#F8FAFF]'
                            }`}
                    >
                        <Layout size={14} />
                        จัดการเทมเพลต
                    </button>
                </div>

                {activeTab === 'users' ? (
                    <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border border-[#D9E1F2] rounded-2xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                <Users size={24} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="text-[#64748B] text-sm">ผู้ใช้ทั้งหมด</p>
                                <p className="text-2xl font-bold">{dashboardData?.totalUsers || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-[#D9E1F2] rounded-2xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                                <CheckCircle size={24} className="text-green-400" />
                            </div>
                            <div>
                                <p className="text-[#64748B] text-sm">ใช้งานอยู่</p>
                                <p className="text-2xl font-bold">{dashboardData?.activeUsers || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-[#D9E1F2] rounded-2xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                <Eye size={24} className="text-purple-400" />
                            </div>
                            <div>
                                <p className="text-[#64748B] text-sm">การเข้าชมรวม</p>
                                <p className="text-2xl font-bold">{dashboardData?.users.reduce((sum, u) => sum + u.stats.viewCount, 0) || 0}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white border border-[#D9E1F2] rounded-2xl p-6">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center">
                                <Download size={24} className="text-pink-400" />
                            </div>
                            <div>
                                <p className="text-[#64748B] text-sm">ดาวน์โหลดรวม</p>
                                <p className="text-2xl font-bold">{dashboardData?.users.reduce((sum, u) => sum + u.stats.downloadVcf + u.stats.downloadPdf, 0) || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white border border-[#D9E1F2] rounded-2xl overflow-hidden">
                    <div className="p-4 border-b border-[#D9E1F2]">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <h2 className="text-lg font-bold">รายชื่อผู้ใช้</h2>
                            <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row">
                                <select
                                    value={tierFilter}
                                    onChange={(e) => setTierFilter(e.target.value as 'all' | 'free' | 'premium')}
                                    className="w-full md:w-[160px] rounded-xl border border-[#D9E1F2] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#050579]/20"
                                >
                                    <option value="all">ทุกแพ็กเกจ</option>
                                    <option value="free">Free Plan</option>
                                    <option value="premium">Premium</option>
                                </select>
                                <select
                                    value={activityFilter}
                                    onChange={(e) => setActivityFilter(e.target.value as 'all' | 'latest_desc' | 'latest_asc' | 'no_activity')}
                                    className="w-full md:w-[190px] rounded-xl border border-[#D9E1F2] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#050579]/20"
                                >
                                    <option value="all">กิจกรรม: ทั้งหมด</option>
                                    <option value="latest_desc">ล่าสุด → เก่าสุด</option>
                                    <option value="latest_asc">เก่าสุด → ล่าสุด</option>
                                    <option value="no_activity">ยังไม่มีกิจกรรม</option>
                                </select>
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="ค้นหา รหัส / ชื่อ / อีเมล / เบอร์โทร"
                                    className="w-full md:w-[320px] rounded-xl border border-[#D9E1F2] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#050579]/20"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1020px] table-fixed">
                            <colgroup>
                                <col style={{ width: 200 }} />
                                <col style={{ width: 220 }} />
                                <col style={{ width: 130 }} />
                                <col style={{ width: 130 }} />
                                <col style={{ width: 110 }} />
                                <col style={{ width: 170 }} />
                                <col style={{ width: 190 }} />
                                <col style={{ width: 150 }} />
                            </colgroup>
                            <thead className="bg-[#F8FAFF]">
                                <tr>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#64748B] uppercase whitespace-nowrap">รหัส</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#64748B] uppercase whitespace-nowrap">ชื่อ</th>
                                    <th className="px-4 py-2.5 text-center text-[11px] font-medium text-[#64748B] uppercase whitespace-nowrap">แพ็กเกจ</th>
                                    <th className="px-4 py-2.5 text-center text-[11px] font-medium text-[#64748B] uppercase whitespace-nowrap">สิทธิ์</th>
                                    <th className="px-4 py-2.5 text-center text-[11px] font-medium text-[#64748B] uppercase whitespace-nowrap">สถานะ</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#64748B] uppercase whitespace-nowrap">วันหมดอายุ</th>
                                    <th className="px-4 py-2.5 text-left text-[11px] font-medium text-[#64748B] uppercase whitespace-nowrap">ใช้งานล่าสุด</th>
                                    <th className="px-4 py-2.5 text-center text-[11px] font-medium text-[#64748B] uppercase whitespace-nowrap">จัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {pagedUsers.map(user => {
                                    const nameParts = splitName(user.full_name);
                                    const fullNameLabel = [nameParts.firstName, nameParts.lastName]
                                        .filter((part) => part && part !== '-')
                                        .join(' ')
                                        .trim() || '-';
                                    return (
                                    <tr key={user.id} className={`hover:bg-[#F8FAFF] ${!user.is_active ? 'opacity-50' : ''}`}>
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={() => setDetailUserId(user.id)}
                                                className="text-left"
                                                title="ดูรายละเอียดผู้ใช้"
                                            >
                                                <p className="font-bold text-sm text-[#050579] whitespace-nowrap hover:underline">{user.uid}</p>
                                                <p className="text-[11px] text-[#64748B]">คลิกเพื่อดูรายละเอียด</p>
                                            </button>
                                        </td>
                                        <td className="px-4 py-3">
                                            <p className="text-sm font-semibold text-[#0F172A] truncate">{fullNameLabel}</p>
                                            <p className="text-xs text-[#64748B] truncate">{user.email || '-'}</p>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <button
                                              onClick={() => updateUserTier(user.id, user.subscription_tier === 'premium' ? 'free' : 'premium')}
                                              disabled={actionLoading === user.id}
                                              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                                                user.subscription_tier === 'premium'
                                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50 hover:bg-amber-500/30'
                                                  : 'bg-[#EEF2FF] text-[#475569] border border-[#D9E1F2] hover:bg-[#E2E8F0]'
                                              }`}
                                            >
                                              {user.subscription_tier === 'premium' ? '★ Premium' : 'Free Plan'}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <select
                                                value={user.role}
                                                onChange={(e) => updateUserRole(user.id, e.target.value)}
                                                disabled={actionLoading === user.id}
                                                className={`px-2 py-1 outline-none rounded-md text-[10px] font-black uppercase tracking-widest transition-all border ${
                                                    user.role === 'super_admin' ? 'bg-purple-500/10 text-purple-600 border-purple-500/30 hover:bg-purple-500/20' : 
                                                    user.role === 'group_admin' ? 'bg-blue-500/10 text-blue-600 border-blue-500/30 hover:bg-blue-500/20' : 
                                                    'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                                                }`}
                                            >
                                                <option value="user">User</option>
                                                <option value="group_admin">Group Admin</option>
                                                <option value="super_admin">Super Admin</option>
                                            </select>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {user.is_active ? (
                                                <span className="inline-flex items-center gap-1 text-green-400 text-xs">
                                                    <CheckCircle size={14} /> ใช้งาน
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-red-400 text-xs">
                                                    <XCircle size={14} /> ปิด
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-xs">
                                            <div className="flex flex-col">
                                                {user.expiration_date ? (
                                                    <>
                                                        <span className={new Date(user.expiration_date) < new Date() ? 'text-red-500' : 'text-[#64748B]'}>
                                                            {formatDate(user.expiration_date)}
                                                        </span>
                                                        {getDaysRemaining(user.expiration_date) && (
                                                            <span className={`text-xs font-medium ${getDaysRemaining(user.expiration_date)!.color}`}>
                                                                {getDaysRemaining(user.expiration_date)!.text}
                                                            </span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-[#94A3B8]">ไม่จำกัด</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-[#64748B]">
                                            {user.stats.lastActivity ? (
                                                <span className="font-medium text-[#334155]">{formatDateTime(user.stats.lastActivity)}</span>
                                            ) : (
                                                <span className="text-[#94A3B8]">ยังไม่มีข้อมูล</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => setEditFeatures({
                                                        userId: user.id,
                                                        config: getResolvedFeatureConfig(user)
                                                    })}
                                                    className="p-2 rounded-lg bg-[#EEF2FF] text-[#050579] hover:bg-[#E0E7FF] transition-colors"
                                                    title={`จัดการฟีเจอร์ (${countEnabledFeatures(user)}/7)`}
                                                >
                                                    <Settings2 size={14} />
                                                </button>
                                                <button
                                                    onClick={() => setEditExpiration({ userId: user.id, date: user.expiration_date ? user.expiration_date.split('T')[0] : '' })}
                                                    className="p-2 rounded-lg bg-[#E0F2FE] text-[#0369A1] hover:bg-[#BAE6FD] transition-colors"
                                                    title="แก้ไขวันหมดอายุ"
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                                {/* Toggle Active */}
                                                <button
                                                    onClick={() => setToggleConfirm(user.id)}
                                                    disabled={actionLoading === user.id}
                                                    className={`p-2 rounded-lg transition-colors ${user.is_active ? 'bg-[#DCFCE7] text-[#166534] hover:bg-[#BBF7D0]' : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'}`}
                                                    title={user.is_active ? 'ปิดการใช้งาน' : 'เปิดการใช้งาน'}
                                                >
                                                    {actionLoading === user.id ? <Loader2 size={16} className="animate-spin" /> : (user.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />)}
                                                </button>
                                                {/* Delete */}
                                                <button
                                                    onClick={() => setDeleteConfirm(user.id)}
                                                    disabled={actionLoading === user.id}
                                                    className="p-2 rounded-lg bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FECACA] transition-colors"
                                                    title="ลบผู้ใช้"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex flex-col gap-3 border-t border-[#D9E1F2] px-4 py-3 md:flex-row md:items-center md:justify-between">
                        <p className="text-xs text-[#64748B]">
                            แสดง {filteredUsers.length === 0 ? 0 : startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} จาก {filteredUsers.length} รายชื่อ
                        </p>
                        <div className="flex items-center gap-2">
                            <select
                                value={rowsPerPage}
                                onChange={(e) => setRowsPerPage(Number(e.target.value) as 10 | 50 | 100)}
                                className="rounded-lg border border-[#D9E1F2] bg-white px-3 py-1.5 text-sm text-[#334155] outline-none focus:ring-2 focus:ring-[#050579]/20"
                                title="จำนวนรายการต่อหน้า"
                            >
                                <option value={10}>10 รายชื่อ</option>
                                <option value={50}>50 รายชื่อ</option>
                                <option value={100}>100 รายชื่อ</option>
                            </select>
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                disabled={safeCurrentPage === 1}
                                className="rounded-lg border border-[#D9E1F2] bg-white px-3 py-1.5 text-sm text-[#334155] hover:bg-[#F8FAFF] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                ก่อนหน้า
                            </button>
                            <span className="text-sm font-medium text-[#334155]">
                                หน้า {safeCurrentPage} / {totalPages}
                            </span>
                            <button
                                type="button"
                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                disabled={safeCurrentPage === totalPages}
                                className="rounded-lg border border-[#D9E1F2] bg-white px-3 py-1.5 text-sm text-[#334155] hover:bg-[#F8FAFF] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                ถัดไป
                            </button>
                        </div>
                    </div>
                </div>
                </>
                ) : activeTab === 'reports' ? (
                    <div className="space-y-4">
                        <div className="bg-white border border-[#D9E1F2] rounded-2xl p-4 md:p-5">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <BarChart3 size={18} className="text-indigo-500" />
                                        รายงานผู้บริหาร
                                    </h2>
                                    <p className="text-sm text-[#64748B] mt-1">สรุปภาพรวมการเติบโตและการใช้งานระบบสำหรับการตัดสินใจเชิงธุรกิจ</p>
                                </div>
                                <div className="inline-flex rounded-xl border border-[#D9E1F2] bg-[#F8FAFF] p-1">
                                    <button
                                        type="button"
                                        onClick={() => setReportPeriod('weekly')}
                                        className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${reportPeriod === 'weekly' ? 'bg-[#050579] text-white' : 'text-[#334155]'}`}
                                    >
                                        7 วัน
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setReportPeriod('monthly')}
                                        className={`rounded-lg px-3 py-1.5 text-sm font-bold transition ${reportPeriod === 'monthly' ? 'bg-[#050579] text-white' : 'text-[#334155]'}`}
                                    >
                                        30 วัน
                                    </button>
                                </div>
                            </div>
                        </div>

                        {reportLoading ? (
                            <div className="bg-white border border-[#D9E1F2] rounded-2xl p-10 text-center">
                                <Loader2 className="mx-auto animate-spin text-[#050579]" size={24} />
                                <p className="mt-3 text-sm text-[#64748B]">กำลังโหลดรายงาน...</p>
                            </div>
                        ) : executiveReport ? (
                            <>
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    <div className="bg-white border border-[#D9E1F2] rounded-2xl p-4">
                                        <p className="text-xs text-[#64748B]">ผู้ใช้ใหม่ ({executiveReport.days} วัน)</p>
                                        <p className="mt-1 text-2xl font-black text-[#050579]">{executiveReport.summary.newUsersInPeriod}</p>
                                    </div>
                                    <div className="bg-white border border-[#D9E1F2] rounded-2xl p-4">
                                        <p className="text-xs text-[#64748B]">ล็อกอินสำเร็จ ({executiveReport.days} วัน)</p>
                                        <p className="mt-1 text-2xl font-black text-[#050579]">{executiveReport.summary.loginSuccessInPeriod}</p>
                                    </div>
                                    <div className="bg-white border border-[#D9E1F2] rounded-2xl p-4">
                                        <p className="text-xs text-[#64748B]">ผู้ใช้ที่มี activity ({executiveReport.days} วัน)</p>
                                        <p className="mt-1 text-2xl font-black text-[#050579]">{executiveReport.summary.activeUsersInPeriod}</p>
                                    </div>
                                    <div className="bg-white border border-[#D9E1F2] rounded-2xl p-4">
                                        <p className="text-xs text-[#64748B]">Premium / Free</p>
                                        <p className="mt-1 text-2xl font-black text-[#050579]">{executiveReport.summary.premiumUsers} / {executiveReport.summary.freeUsers}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                    <div className="bg-white border border-[#D9E1F2] rounded-2xl p-4 md:p-5">
                                        <h3 className="text-base font-bold text-[#0F172A] mb-1">กราฟผู้ใช้ใหม่รายวัน</h3>
                                        <p className="text-xs text-[#64748B] mb-4">จำนวนผู้ใช้ที่สมัครใหม่ในแต่ละวัน</p>
                                        <div className="h-64 overflow-x-auto rounded-xl border border-[#EEF0FF] bg-[#FAFBFF] p-3">
                                            <div className="flex h-full min-w-[720px] items-end gap-2">
                                                {executiveReport.daily.map((row) => {
                                                    const barHeight = row.newUsers === 0 ? 6 : Math.max(12, Math.round((row.newUsers / maxDailyNewUsers) * 100));
                                                    return (
                                                        <div key={`new-${row.date}`} className="flex flex-1 min-w-[42px] flex-col items-center gap-1">
                                                            <span className="text-[10px] font-bold text-[#334155]">{row.newUsers}</span>
                                                            <div
                                                                className="w-full rounded-t-md bg-[#4F46E5] transition-all"
                                                                style={{ height: `${barHeight}%` }}
                                                                title={`${new Date(row.date).toLocaleDateString('th-TH')}: ${row.newUsers} คน`}
                                                            />
                                                            <span className="text-[10px] text-[#64748B]">{new Date(row.date).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' })}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white border border-[#D9E1F2] rounded-2xl p-4 md:p-5">
                                        <h3 className="text-base font-bold text-[#0F172A] mb-1">กราฟกิจกรรมรายวัน</h3>
                                        <p className="text-xs text-[#64748B] mb-4">รวม Login, View, Download ต่อวัน</p>
                                        <div className="h-64 overflow-x-auto rounded-xl border border-[#EEF0FF] bg-[#FAFBFF] p-3">
                                            <div className="flex h-full min-w-[720px] items-end gap-2">
                                                {executiveReport.daily.map((row) => {
                                                    const dailyTotal = row.loginSuccess + row.viewProfile + row.viewCatalog + row.downloadPdf + row.downloadVcf + row.viewLandingPage;
                                                    const barHeight = dailyTotal === 0 ? 6 : Math.max(12, Math.round((dailyTotal / maxDailyActivity) * 100));
                                                    return (
                                                        <div key={`act-${row.date}`} className="flex flex-1 min-w-[42px] flex-col items-center gap-1">
                                                            <span className="text-[10px] font-bold text-[#334155]">{dailyTotal}</span>
                                                            <div
                                                                className="w-full rounded-t-md bg-[#16A34A] transition-all"
                                                                style={{ height: `${barHeight}%` }}
                                                                title={`${new Date(row.date).toLocaleDateString('th-TH')}: ${dailyTotal} กิจกรรม`}
                                                            />
                                                            <span className="text-[10px] text-[#64748B]">{new Date(row.date).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' })}</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white border border-[#D9E1F2] rounded-2xl p-8 text-center text-[#64748B] text-sm">
                                {reportError || 'ยังไม่มีข้อมูลรายงาน'}
                            </div>
                        )}
                    </div>
                ) : activeTab === 'api' ? (
                    <div className="bg-white border border-[#D9E1F2] rounded-2xl p-5 md:p-6">
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <ServerCog size={18} className="text-indigo-400" />
                                    ตั้งค่า Cloud Run / Vertex AI
                                </h2>
                                <p className="text-sm text-[#64748B] mt-1">ใช้สำหรับเปลี่ยน Cloud Run proxy หรือบัญชี Google ที่เชื่อมกับ Vertex AI โดยไม่ต้องแก้โค้ด</p>
                                <p className="text-xs text-[#64748B] mt-1">
                                    Production แนะนำให้ใช้ Cloud Run Proxy: Hostinger → Cloud Run → Vertex AI
                                </p>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${isEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#E2E8F0] text-[#475569]'}`}>
                                    {isEnabled ? 'Enabled' : 'Disabled'}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    aiSettings?.last_test_status === 'connected'
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : aiSettings?.last_test_status === 'failed'
                                            ? 'bg-red-50 text-red-700'
                                            : 'bg-slate-100 text-slate-600'
                                }`}>
                                    {aiConnectionStatusLabel}
                                </span>
                            </div>
                        </div>

                        <div className="mb-4 rounded-2xl border border-[#D9E1F2] bg-[#F8FAFF] p-3 text-xs text-[#475569]">
                            <p className="font-bold text-[#334155]">สถานะล่าสุด</p>
                            <p className="mt-1">ตรวจล่าสุด: {aiLastCheckedAtLabel}</p>
                            <p className="mt-1">ข้อความ: {aiSettings?.last_test_message || '-'}</p>
                        </div>

                        <div className="space-y-4">
                            <label className="block">
                                <span className="text-xs font-bold text-[#334155]">Connection Mode</span>
                                <div className="mt-1 grid grid-cols-1 gap-2 md:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => setConnectionMode('cloud_run_proxy')}
                                        className={`rounded-xl border px-3 py-3 text-left transition-all ${
                                            connectionMode === 'cloud_run_proxy'
                                                ? 'border-[#050579] bg-[#050579] text-white'
                                                : 'border-[#D9E1F2] bg-white text-[#334155] hover:bg-[#F8FAFF]'
                                        }`}
                                    >
                                        <p className="text-sm font-bold">Cloud Run Proxy (แนะนำ)</p>
                                        <p className={`mt-1 text-xs ${connectionMode === 'cloud_run_proxy' ? 'text-white/80' : 'text-[#64748B]'}`}>
                                            ใช้ URL ของ Cloud Run เป็นตัวกลางเรียก Vertex AI
                                        </p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setConnectionMode('api_key')}
                                        className={`rounded-xl border px-3 py-3 text-left transition-all ${
                                            connectionMode === 'api_key'
                                                ? 'border-[#050579] bg-[#050579] text-white'
                                                : 'border-[#D9E1F2] bg-white text-[#334155] hover:bg-[#F8FAFF]'
                                        }`}
                                    >
                                        <p className="text-sm font-bold">Direct API Key</p>
                                        <p className={`mt-1 text-xs ${connectionMode === 'api_key' ? 'text-white/80' : 'text-[#64748B]'}`}>
                                            ใช้เฉพาะ legacy/testing ไม่ใช่ค่าแนะนำสำหรับ production
                                        </p>
                                    </button>
                                </div>
                            </label>

                            <label className="block">
                                <span className="text-xs font-bold text-[#334155]">ชื่อบัญชี / รอบโปรโมชัน</span>
                                <input
                                    value={accountLabel}
                                    onChange={(e) => setAccountLabel(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-[#D9E1F2] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#050579]/20"
                                    placeholder="เช่น Google Promo Account #1"
                                />
                                <p className="mt-1 text-xs text-[#64748B]">ใช้จำง่ายเวลาต้องเปลี่ยนบัญชี Google หรือ Cloud Run หลังหมดสิทธิพิเศษ</p>
                            </label>

                            {connectionMode === 'cloud_run_proxy' ? (
                                <label className="block">
                                    <span className="text-xs font-bold text-[#334155]">Provider URL</span>
                                    <input
                                        value={providerUrl}
                                        onChange={(e) => setProviderUrl(e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-[#D9E1F2] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#050579]/20"
                                        placeholder="https://your-cloud-run-service.run.app"
                                    />
                                    <p className="mt-1 text-xs text-[#64748B]">URL ของ Cloud Run proxy ที่ Hostinger backend จะเรียกต่อไปยัง Vertex AI</p>
                                </label>
                            ) : (
                                <>
                                    <label className="block">
                                        <span className="text-xs font-bold text-[#334155]">Project ID</span>
                                        <input
                                            value={projectId}
                                            onChange={(e) => setProjectId(e.target.value)}
                                            className="mt-1 w-full rounded-xl border border-[#D9E1F2] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#050579]/20"
                                            placeholder="เช่น nex-solution-prod"
                                        />
                                        <p className="mt-1 text-xs text-[#64748B]">ใช้เฉพาะโหมด Direct API Key / legacy testing</p>
                                    </label>

                                    <label className="block">
                                        <span className="text-xs font-bold text-[#334155]">API Key (Legacy / Testing)</span>
                                        <input
                                            type="password"
                                            value={apiKey}
                                            onChange={(e) => {
                                                setApiKey(e.target.value);
                                                if (clearStoredApiKey) setClearStoredApiKey(false);
                                            }}
                                            className="mt-1 w-full rounded-xl border border-[#D9E1F2] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#050579]/20"
                                            placeholder="เช่น AIza..."
                                        />
                                        <p className="mt-1 text-xs text-[#64748B]">
                                            สถานะล่าสุด: {aiSettings?.has_api_key
                                                ? `มี API Key แล้ว (${aiSettings.api_key_masked || 'xxxx'})`
                                                : aiSettings?.auth_mode === 'adc'
                                                    ? 'ไม่ได้เก็บ API Key ในระบบ กำลังใช้ ADC / service account'
                                                    : 'ยังไม่มี API Key'}
                                        </p>
                                        {aiSettings?.has_api_key ? (
                                            <label className="mt-2 inline-flex items-center gap-2 text-xs text-[#475569]">
                                                <input
                                                    type="checkbox"
                                                    checked={clearStoredApiKey}
                                                    onChange={(e) => setClearStoredApiKey(e.target.checked)}
                                                    className="h-4 w-4 rounded border-[#CBD5E1] bg-white text-[#050579]"
                                                />
                                                ลบ API Key ที่บันทึกไว้
                                            </label>
                                        ) : null}
                                    </label>
                                </>
                            )}

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <label className="block">
                                    <span className="text-xs font-bold text-[#334155]">Region</span>
                                    <input
                                        value={location}
                                        onChange={(e) => setLocation(e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-[#D9E1F2] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#050579]/20"
                                        placeholder="เช่น asia-southeast1"
                                    />
                                    <p className="mt-1 text-xs text-[#64748B]">ควรตรงกับ region ที่ Cloud Run / Vertex ใช้</p>
                                </label>

                                <label className="block">
                                    <span className="text-xs font-bold text-[#334155]">วันหมดสิทธิพิเศษ</span>
                                    <input
                                        type="date"
                                        value={promotionEndsAt}
                                        onChange={(e) => setPromotionEndsAt(e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-[#D9E1F2] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#050579]/20"
                                    />
                                    <p className={`mt-1 text-xs ${promotionRemaining && promotionRemaining.days <= 14 ? 'font-bold text-amber-600' : 'text-[#64748B]'}`}>
                                        {promotionRemaining ? `แจ้งเตือน: ${promotionRemaining.text}` : 'ใช้เตือนก่อนเปลี่ยนบัญชี/Cloud Run รอบถัดไป'}
                                    </p>
                                </label>
                            </div>

                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <label className="block">
                                    <span className="text-xs font-bold text-[#334155]">Image Model</span>
                                    <select
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-[#D9E1F2] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#050579]/20"
                                    >
                                        {AI_IMAGE_MODELS.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-[#64748B]">
                                        ใช้สำหรับงานสร้าง/แก้ภาพเท่านั้น
                                    </p>
                                </label>

                                <label className="block">
                                    <span className="text-xs font-bold text-[#334155]">Video Model</span>
                                    <select
                                        value={videoModel}
                                        onChange={(e) => setVideoModel(e.target.value)}
                                        className="mt-1 w-full rounded-xl border border-[#D9E1F2] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#050579]/20"
                                    >
                                        {AI_VIDEO_MODELS.map((option) => (
                                            <option key={option.value || 'default'} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="mt-1 text-xs text-[#64748B]">
                                        ใช้สำหรับงานวิดีโอเท่านั้น ถ้าเลือก Default ระบบจะใช้ fallback runtime อัตโนมัติ
                                    </p>
                                </label>
                            </div>

                            <label className="block">
                                <span className="text-xs font-bold text-[#334155]">Note</span>
                                <input
                                    value={providerNote}
                                    onChange={(e) => setProviderNote(e.target.value)}
                                    className="mt-1 w-full rounded-xl border border-[#D9E1F2] bg-white px-3 py-2.5 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-[#050579]/20"
                                    placeholder="เช่น เปลี่ยน account หลังครบ 3 เดือน หรือ URL สำรองอยู่ที่..."
                                />
                                <p className="mt-1 text-xs text-[#64748B]">ใช้จดข้อมูลสำหรับ admin ไม่ส่งต่อไปยัง Vertex</p>
                            </label>

                            <label className="inline-flex items-center gap-2 rounded-xl border border-[#D9E1F2] bg-[#F8FAFF] px-3 py-2.5">
                                <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    onChange={(e) => setIsEnabled(e.target.checked)}
                                    className="h-4 w-4 rounded border-[#CBD5E1] bg-white text-[#050579]"
                                />
                                <span className="text-sm font-semibold text-[#334155]">เปิดใช้งาน provider นี้</span>
                            </label>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-2">
                            <button
                                type="button"
                                onClick={testAiSettings}
                                disabled={aiTestLoading}
                                className="inline-flex items-center gap-2 rounded-xl bg-white border border-[#D9E1F2] hover:bg-[#F8FAFF] px-4 py-2.5 text-sm font-bold text-[#050579] disabled:opacity-60"
                            >
                                {aiTestLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                                Test Connection
                            </button>
                            <button
                                type="button"
                                onClick={saveAiSettings}
                                disabled={aiSaveLoading}
                                className="inline-flex items-center gap-2 rounded-xl bg-[#F97316] hover:bg-[#EA580C] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                            >
                                {aiSaveLoading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                บันทึก
                            </button>
                            <span className="text-xs text-[#64748B]">อัปเดตล่าสุด: {aiUpdatedAtLabel}</span>
                        </div>

                        {aiMessage ? (
                            <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
                                {aiMessage}
                            </div>
                        ) : null}

                        {aiError ? (
                            <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {aiError}
                            </div>
                        ) : null}

                        {aiTestResult ? (
                            <div className={`mt-3 rounded-xl border p-3 text-sm ${aiTestResult.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                                <p className="font-bold">ผลทดสอบ: {aiTestResult.ok ? 'พร้อมใช้งาน' : 'ต้องแก้ไขข้อมูลก่อนใช้งาน'}</p>
                                <ul className="list-disc pl-5 mt-1">
                                    {aiTestResult.checks.map((line, idx) => (
                                        <li key={`ai-check-${idx}`}>{line}</li>
                                    ))}
                                </ul>
                            </div>
                        ) : null}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white border border-[#D9E1F2] rounded-2xl p-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <h2 className="text-lg font-bold flex items-center gap-2">
                                        <Layout size={18} className="text-indigo-400" />
                                        จัดการเทมเพลต Digital Media
                                    </h2>
                                    <p className="text-sm text-[#64748B] mt-1">จัดการ template และ field schema ได้ในแท็บนี้ทันที</p>
                                </div>
                                <Link
                                    href="/admin/digital-media-v1/templates/new"
                                    className="inline-flex items-center gap-2 rounded-xl bg-[#F97316] px-4 py-2.5 text-sm font-bold text-white"
                                >
                                    <Plus size={14} />
                                    สร้างเทมเพลตใหม่
                                </Link>
                            </div>
                            <div className="mt-3 flex flex-col gap-2 md:flex-row">
                                <label className="relative w-full md:max-w-sm">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" size={16} />
                                    <input
                                        value={templateSearch}
                                        onChange={(e) => setTemplateSearch(e.target.value)}
                                        placeholder="ค้นหา template"
                                        className="w-full rounded-xl border border-[#D9E1F2] py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#050579]/20"
                                    />
                                </label>
                                <select
                                    value={templateCategoryId}
                                    onChange={(e) => setTemplateCategoryId(e.target.value)}
                                    className="rounded-xl border border-[#D9E1F2] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#050579]/20"
                                >
                                    <option value="all">ทุกหมวดหมู่</option>
                                    {templateCategories.map((category) => (
                                        <option key={category.id} value={String(category.id)}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="overflow-hidden rounded-2xl border border-[#D9E1F2] bg-white">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[940px]">
                                    <thead className="bg-[#F8FAFF]">
                                        <tr className="text-left text-xs uppercase text-[#64748B]">
                                            <th className="px-4 py-3">ภาพ</th>
                                            <th className="px-4 py-3">ชื่อ Template</th>
                                            <th className="px-4 py-3">หมวดหมู่</th>
                                            <th className="px-4 py-3">สถานะ</th>
                                            <th className="px-4 py-3">Ratio</th>
                                            <th className="px-4 py-3">Fields</th>
                                            <th className="px-4 py-3">อัปเดตล่าสุด</th>
                                            <th className="px-4 py-3 text-center">จัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {templateLoading ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-10 text-center">
                                                    <Loader2 className="mx-auto animate-spin text-[#050579]" size={22} />
                                                </td>
                                            </tr>
                                        ) : filteredTemplates.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-10 text-center text-sm text-[#64748B]">
                                                    ไม่พบ template
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredTemplates.map((item) => (
                                                <tr key={item.id} className="border-t border-[#EEF0FF] text-sm">
                                                    <td className="px-4 py-3 align-top">
                                                        <div className="h-12 w-12 overflow-hidden rounded-lg border border-[#D9E1F2] bg-[#F8FAFF]">
                                                            {item.cover_image_url ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={item.cover_image_url} alt={item.name} className="h-full w-full object-cover" />
                                                            ) : null}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <p className="font-bold text-[#050579]">{item.name}</p>
                                                        <p className="text-xs text-[#64748B]">{item.slug}</p>
                                                    </td>
                                                    <td className="px-4 py-3 align-top">{item.category?.name || '-'}</td>
                                                    <td className="px-4 py-3 align-top">
                                                        <span
                                                            className={`rounded-full px-2 py-1 text-xs font-bold ${
                                                                item.status === 'active'
                                                                    ? 'bg-green-100 text-green-700'
                                                                    : item.status === 'draft'
                                                                        ? 'bg-amber-100 text-amber-700'
                                                                        : 'bg-slate-100 text-slate-600'
                                                            }`}
                                                        >
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 align-top">{item.aspect_ratio}</td>
                                                    <td className="px-4 py-3 align-top">{item.fields?.length || 0}</td>
                                                    <td className="px-4 py-3 align-top text-xs text-[#64748B]">
                                                        {new Date(item.updated_at).toLocaleString('th-TH')}
                                                    </td>
                                                    <td className="px-4 py-3 align-top">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <Link
                                                                href={`/admin/digital-media-v1/templates/${item.id}/edit`}
                                                                className="rounded-lg border border-[#D9E1F2] bg-white p-2 text-[#2563EB]"
                                                                title="แก้ไข"
                                                            >
                                                                <Pencil size={14} />
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                disabled={templateActionLoading === item.id}
                                                                onClick={() => toggleTemplateStatus(item.id)}
                                                                className="rounded-lg border border-[#D9E1F2] bg-white p-2 text-[#475569]"
                                                                title="เปิด/ปิด"
                                                            >
                                                                {item.status === 'active' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={templateActionLoading === item.id}
                                                                onClick={() => removeTemplate(item.id)}
                                                                className="rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-2 text-[#DC2626]"
                                                                title="ลบ"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Detail Modal */}
                {activeTab === 'users' && detailUser && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0F172A]/60 p-4 md:items-center">
                        <div className="my-4 w-full max-w-2xl rounded-2xl border border-[#D9E1F2] bg-white">
                            <div className="flex items-center justify-between border-b border-[#D9E1F2] px-5 py-4">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">รายละเอียดผู้ใช้</p>
                                    <h3 className="text-lg font-bold text-[#0F172A]">{detailUser.uid}</h3>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setDetailUserId(null)}
                                    className="rounded-lg border border-[#D9E1F2] bg-white px-3 py-1.5 text-sm font-medium text-[#334155] hover:bg-[#F8FAFF]"
                                >
                                    ปิด
                                </button>
                            </div>
                            <div className="max-h-[75vh] space-y-4 overflow-y-auto p-5">
                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl bg-[#F8FAFF] p-3">
                                        <p className="text-xs text-[#64748B]">รหัส</p>
                                        <p className="font-semibold text-[#0F172A]">{detailUser.uid}</p>
                                    </div>
                                    <div className="rounded-xl bg-[#F8FAFF] p-3">
                                        <p className="text-xs text-[#64748B]">ชื่อ</p>
                                        <p className="font-semibold text-[#0F172A]">{detailUser.full_name || '-'}</p>
                                    </div>
                                    <div className="rounded-xl bg-[#F8FAFF] p-3 sm:col-span-2">
                                        <p className="text-xs text-[#64748B]">อีเมล</p>
                                        <p className="font-semibold text-[#0F172A] break-all">{detailUser.email || '-'}</p>
                                    </div>
                                    <div className="rounded-xl bg-[#F8FAFF] p-3">
                                        <p className="text-xs text-[#64748B]">เบอร์โทร</p>
                                        <p className="font-semibold text-[#0F172A]">{detailUser.mobile || '-'}</p>
                                    </div>
                                    <div className="rounded-xl bg-[#F8FAFF] p-3">
                                        <p className="text-xs text-[#64748B]">บทบาท</p>
                                        <div className="pt-1">{getRoleBadge(detailUser.role)}</div>
                                    </div>
                                    <div className="rounded-xl bg-[#F8FAFF] p-3">
                                        <p className="text-xs text-[#64748B]">แพ็กเกจ</p>
                                        <p className="font-semibold text-[#0F172A] uppercase">{detailUser.subscription_tier}</p>
                                    </div>
                                    <div className="rounded-xl bg-[#F8FAFF] p-3">
                                        <p className="text-xs text-[#64748B]">สถานะ</p>
                                        <p className={`font-semibold ${detailUser.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                            {detailUser.is_active ? 'ใช้งาน' : 'ปิดการใช้งาน'}
                                        </p>
                                    </div>
                                    <div className="rounded-xl bg-[#F8FAFF] p-3">
                                        <p className="text-xs text-[#64748B]">ฟีเจอร์ที่เปิด</p>
                                        <p className="font-semibold text-[#0F172A]">{countEnabledFeatures(detailUser)}/7</p>
                                    </div>
                                    <div className="rounded-xl bg-[#F8FAFF] p-3">
                                        <p className="text-xs text-[#64748B]">Group ID</p>
                                        <p className="font-semibold text-[#0F172A]">{detailUser.group_id ?? '-'}</p>
                                    </div>
                                    <div className="rounded-xl bg-[#F8FAFF] p-3">
                                        <p className="text-xs text-[#64748B]">วันสร้างบัญชี</p>
                                        <p className="font-semibold text-[#0F172A]">{formatDateTime(detailUser.created_at)}</p>
                                    </div>
                                    <div className="rounded-xl bg-[#F8FAFF] p-3">
                                        <p className="text-xs text-[#64748B]">กิจกรรมล่าสุด</p>
                                        <p className="font-semibold text-[#0F172A]">{formatDateTime(detailUser.stats.lastActivity)}</p>
                                    </div>
                                    <div className="rounded-xl bg-[#F8FAFF] p-3">
                                        <p className="text-xs text-[#64748B]">วันหมดอายุ</p>
                                        <p className="font-semibold text-[#0F172A]">{detailUser.expiration_date ? formatDate(detailUser.expiration_date) : 'ไม่จำกัด'}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
                                    <div className="rounded-xl border border-[#D9E1F2] p-3 text-center">
                                        <p className="text-xs text-[#64748B]">เข้าชม</p>
                                        <p className="text-lg font-bold text-purple-500">{detailUser.stats.viewCount}</p>
                                    </div>
                                    <div className="rounded-xl border border-[#D9E1F2] p-3 text-center">
                                        <p className="text-xs text-[#64748B]">ดาวน์โหลดนามบัตร</p>
                                        <p className="text-lg font-bold text-pink-500">{detailUser.stats.downloadVcf}</p>
                                    </div>
                                    <div className="rounded-xl border border-[#D9E1F2] p-3 text-center">
                                        <p className="text-xs text-[#64748B]">เข้าชมแคตตาล็อก</p>
                                        <p className="text-lg font-bold text-indigo-500">{detailUser.stats.viewCatalog}</p>
                                    </div>
                                    <div className="rounded-xl border border-[#D9E1F2] p-3 text-center">
                                        <p className="text-xs text-[#64748B]">ดาวน์โหลด PDF</p>
                                        <p className="text-lg font-bold text-emerald-500">{detailUser.stats.downloadPdf}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {activeTab === 'users' && deleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0F172A]/60 p-4 md:items-center">
                        <div className="bg-white border border-[#D9E1F2] rounded-2xl p-6 max-w-md w-full">
                            <div className="text-center mb-6">
                                <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">ยืนยันการลบ</h3>
                                <p className="text-[#64748B]">คุณต้องการลบผู้ใช้นี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 border border-[#D9E1F2] bg-white hover:bg-[#F8FAFF] py-3 rounded-xl font-medium text-[#334155]"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={() => deleteUser(deleteConfirm)}
                                    disabled={actionLoading === deleteConfirm}
                                    className="flex-1 bg-red-500 hover:bg-red-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    {actionLoading === deleteConfirm ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                                    ลบผู้ใช้
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toggle Confirmation Modal */}
                {activeTab === 'users' && toggleConfirmUser && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0F172A]/60 p-4 md:items-center">
                        <div className="w-full max-w-md rounded-2xl border border-[#D9E1F2] bg-white p-6">
                            <div className="text-center mb-6">
                                <AlertTriangle size={44} className="mx-auto mb-3 text-amber-500" />
                                <h3 className="text-xl font-bold mb-2">ยืนยันการเปลี่ยนสถานะ</h3>
                                <p className="text-[#64748B] text-sm">
                                    คุณต้องการ
                                    {toggleConfirmUser.is_active ? ' ปิดการใช้งาน' : ' เปิดการใช้งาน'}
                                    บัญชี <span className="font-semibold text-[#0F172A]">{toggleConfirmUser.uid}</span> ใช่หรือไม่?
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setToggleConfirm(null)}
                                    className="flex-1 rounded-xl border border-[#D9E1F2] bg-white py-3 font-medium text-[#334155] hover:bg-[#F8FAFF]"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={async () => {
                                        await toggleUserActive(toggleConfirmUser.id);
                                        setToggleConfirm(null);
                                    }}
                                    disabled={actionLoading === toggleConfirmUser.id}
                                    className="flex-1 rounded-xl bg-[#050579] py-3 font-bold text-white hover:bg-[#02025f] disabled:opacity-60"
                                >
                                    {actionLoading === toggleConfirmUser.id ? (
                                        <span className="inline-flex items-center gap-2">
                                            <Loader2 size={16} className="animate-spin" />
                                            กำลังบันทึก
                                        </span>
                                    ) : (
                                        'ยืนยัน'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Expiration Modal */}
                {activeTab === 'users' && editExpiration && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0F172A]/60 p-4 md:items-center">
                        <div className="bg-white border border-[#D9E1F2] rounded-2xl p-6 max-w-md w-full">
                            <div className="text-center mb-6">
                                <Calendar size={48} className="text-blue-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">แก้ไขวันหมดอายุ</h3>
                                <p className="text-[#64748B] text-sm">เลือกวันหมดอายุใหม่ (รูปแบบ dd/mm/yyyy) หรือเว้นว่างเพื่อไม่จำกัด</p>
                            </div>
                            
                            {/* Quick Select Buttons */}
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                <button 
                                    onClick={() => {
                                        const d = new Date();
                                        d.setMonth(d.getMonth() + 1);
                                        setEditExpiration({ ...editExpiration, date: d.toISOString().split('T')[0] });
                                    }}
                                    className="px-3 py-2 border border-[#D9E1F2] bg-[#F8FAFF] hover:bg-white rounded-xl text-xs font-medium transition-all text-[#334155]"
                                >
                                    + 1 เดือน
                                </button>
                                <button 
                                    onClick={() => {
                                        const d = new Date();
                                        d.setFullYear(d.getFullYear() + 1);
                                        setEditExpiration({ ...editExpiration, date: d.toISOString().split('T')[0] });
                                    }}
                                    className="px-3 py-2 border border-[#D9E1F2] bg-[#F8FAFF] hover:bg-white rounded-xl text-xs font-medium transition-all text-[#334155]"
                                >
                                    + 1 ปี
                                </button>
                                <button 
                                    onClick={() => {
                                        const d = new Date();
                                        d.setFullYear(d.getFullYear() + 5);
                                        setEditExpiration({ ...editExpiration, date: d.toISOString().split('T')[0] });
                                    }}
                                    className="px-3 py-2 border border-[#D9E1F2] bg-[#F8FAFF] hover:bg-white rounded-xl text-xs font-medium transition-all text-[#334155]"
                                >
                                    + 5 ปี
                                </button>
                                <button 
                                    onClick={() => setEditExpiration({ ...editExpiration, date: '' })}
                                    className="px-3 py-2 border border-[#D9E1F2] bg-[#F8FAFF] hover:bg-white rounded-xl text-xs font-medium transition-all text-[#334155]"
                                >
                                    ไม่จำกัด
                                </button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-[#64748B] uppercase tracking-widest mb-2 ml-1">เลือกวันที่เจาะจง</label>
                                <input
                                    type="date"
                                    value={editExpiration.date}
                                    onChange={(e) => setEditExpiration({ ...editExpiration, date: e.target.value })}
                                    className="w-full bg-white border border-[#D9E1F2] rounded-xl px-4 py-3 text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#050579]/20"
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditExpiration(null)}
                                    className="flex-1 border border-[#D9E1F2] bg-white hover:bg-[#F8FAFF] py-3 rounded-xl font-medium text-[#334155]"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={() => updateExpiration(editExpiration.userId, editExpiration.date || null)}
                                    disabled={actionLoading === editExpiration.userId}
                                    className="flex-[2] bg-[#050579] hover:bg-[#02025f] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {actionLoading === editExpiration.userId ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                                    บันทึกวันหมดอายุ
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Features Modal */}
                {activeTab === 'users' && editFeatures && (
                    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#0F172A]/60 p-4 md:items-center">
                        <div className="my-4 max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-[#D9E1F2] bg-white p-6">
                            <div className="text-center mb-6">
                                <ListChecks size={48} className="text-indigo-400 mx-auto mb-4" />
                                <h3 className="text-xl font-bold mb-2">จัดการฟีเจอร์</h3>
                                <p className="text-[#64748B]">เลือกฟีเจอร์ที่ต้องการเปิด/ปิดสำหรับผู้ใช้นี้</p>
                            </div>
                            <div className="space-y-3 mb-6">
                                {(Object.keys(FEATURE_LABELS) as Array<keyof FeatureConfig>).map((key) => (
                                    <label
                                        key={key}
                                        className={`flex items-start justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                                            editFeatures.config[key]
                                                ? 'bg-indigo-500/10 border-indigo-500/40 shadow-sm'
                                                : 'bg-[#F8FAFF] border-[#D9E1F2] hover:bg-white'
                                        }`}
                                    >
                                        <div className="flex gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                                                editFeatures.config[key] ? 'bg-[#050579] text-white' : 'bg-[#F8FAFF] text-[#64748B]'
                                            }`}>
                                                {FEATURE_LABELS[key].icon}
                                            </div>
                                            <div>
                                                <p className={`font-bold text-sm ${editFeatures.config[key] ? 'text-white' : 'text-[#64748B]'}`}>
                                                    {FEATURE_LABELS[key].label}
                                                </p>
                                                <p className="text-xs text-[#64748B] mt-0.5">
                                                    {FEATURE_LABELS[key].description}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="pt-1">
                                            <input
                                                type="checkbox"
                                                checked={editFeatures.config[key]}
                                                onChange={(e) => setEditFeatures({
                                                    ...editFeatures,
                                                    config: { ...editFeatures.config, [key]: e.target.checked }
                                                })}
                                                className="w-5 h-5 rounded-lg border-[#CBD5E1] bg-white text-[#050579] focus:ring-[#050579]/30 focus:ring-offset-0 transition-all"
                                            />
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <div className="flex gap-3 mb-4">
                                <button
                                    onClick={() => setEditFeatures({
                                        ...editFeatures,
                                        config: { catalog: true, leads: true, namecard: true, 'landing-pages': true, analytics: true, profile: true, referrals: true }
                                    })}
                                    className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 rounded-xl text-sm font-medium"
                                >
                                    เปิดทั้งหมด
                                </button>
                                <button
                                    onClick={() => setEditFeatures({
                                        ...editFeatures,
                                        config: { catalog: false, leads: false, namecard: false, 'landing-pages': false, analytics: false, profile: false, referrals: false }
                                    })}
                                    className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded-xl text-sm font-medium"
                                >
                                    ปิดทั้งหมด
                                </button>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setEditFeatures(null)}
                                    className="flex-1 border border-[#D9E1F2] bg-white hover:bg-[#F8FAFF] py-3 rounded-xl font-medium text-[#334155]"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    onClick={() => updateFeatureConfig(editFeatures.userId, editFeatures.config)}
                                    disabled={actionLoading === editFeatures.userId}
                                    className="flex-1 bg-[#050579] hover:bg-[#02025f] text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                                >
                                    {actionLoading === editFeatures.userId ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                                    บันทึก
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
