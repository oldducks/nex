'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';

function OAuthCallbackShell({
    status,
    title,
    message,
}: {
    status: 'loading' | 'success' | 'error';
    title: string;
    message: string;
}) {
    const iconClassName =
        status === 'success'
            ? 'text-[#16A34A]'
            : status === 'error'
              ? 'text-[#DC2626]'
              : 'text-[#F97316]';

    const Icon = status === 'success' ? CheckCircle2 : status === 'error' ? XCircle : Loader2;

    return (
        <div className="relative min-h-screen overflow-hidden bg-[#EEF0FF] text-[#0F172A]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(96,165,250,0.16),transparent_34%),radial-gradient(circle_at_top_center,rgba(191,219,254,0.4),transparent_42%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.08),transparent_26%),linear-gradient(180deg,#f6f8ff_0%,#eef0ff_55%,#e7edff_100%)]" />
            <div className="pointer-events-none absolute left-[-7rem] top-20 h-72 w-72 rounded-full bg-sky-300/20 blur-[110px]" />
            <div className="pointer-events-none absolute right-[-5rem] top-28 h-64 w-64 rounded-full bg-orange-200/25 blur-[100px]" />

            <div className="relative mx-auto flex min-h-screen max-w-7xl items-center justify-center px-5 py-10 sm:px-8">
                <div className="w-full max-w-lg rounded-[32px] border border-[#D9E1F2] bg-white/92 p-8 text-center shadow-[0_30px_90px_-48px_rgba(15,23,42,0.35)] backdrop-blur-sm sm:p-10">
                    <div className="flex justify-center">
                        <Logo
                            size="lg"
                            showText={false}
                            asLink={false}
                            className="justify-center scale-[2]"
                        />
                    </div>

                    <div className="mx-auto mt-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#F6F8FF]">
                        <Icon
                            size={44}
                            className={`${iconClassName} ${status === 'loading' ? 'animate-spin' : ''}`}
                        />
                    </div>

                    <h1 className="mt-6 text-3xl font-black tracking-tight text-[#050579]">{title}</h1>
                    <p className="mt-3 text-base leading-7 text-[#475569]">{message}</p>

                    <div className="mt-6 rounded-2xl border border-[#D9E1F2] bg-[#F6F8FF] px-4 py-3 text-sm text-[#64748B]">
                        {status === 'error'
                            ? 'ระบบจะพาคุณกลับไปยังหน้าเข้าสู่ระบบอัตโนมัติ'
                            : 'กรุณารอสักครู่ ระบบกำลังพาคุณไปยังหน้าถัดไป'}
                    </div>
                </div>
            </div>
        </div>
    );
}

function OAuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get('error');
    const oauthStatus = searchParams.get('status');

    const status: 'loading' | 'success' | 'error' = error
        ? 'error'
        : oauthStatus === 'success'
          ? 'success'
          : oauthStatus
            ? 'error'
            : 'loading';

    const message =
        status === 'success'
            ? 'เข้าสู่ระบบสำเร็จ! กำลังนำคุณไปยังหน้าหลัก...'
            : status === 'error'
              ? error
                  ? 'การเข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง'
                  : 'ไม่พบสถานะการเข้าสู่ระบบ'
              : 'รอสักครู่ ระบบกำลังตรวจสอบข้อมูลการเข้าสู่ระบบของคุณ';

    useEffect(() => {
        if (!error && !oauthStatus) {
            return;
        }

        if (error) {
            setTimeout(() => router.push('/login'), 3000);
            return;
        }

        if (oauthStatus === 'success') {
            setTimeout(() => router.push('/manage/control'), 1200);
            return;
        }

        setTimeout(() => router.push('/login'), 3000);
    }, [oauthStatus, error, router]);

    return (
        <OAuthCallbackShell
            status={status}
            title={
                status === 'loading'
                    ? 'กำลังเข้าสู่ระบบ'
                    : status === 'success'
                      ? 'เข้าสู่ระบบสำเร็จ'
                      : 'เกิดข้อผิดพลาด'
            }
            message={message}
        />
    );
}

export default function OAuthCallbackPage() {
    return (
        <Suspense fallback={
            <OAuthCallbackShell
                status="loading"
                title="กำลังเข้าสู่ระบบ"
                message="รอสักครู่ ระบบกำลังตรวจสอบข้อมูลการเข้าสู่ระบบของคุณ"
            />
        }>
            <OAuthCallbackContent />
        </Suspense>
    );
}
