'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

function OAuthCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const error = searchParams.get('error');
        const oauthStatus = searchParams.get('status');

        if (error) {
            setStatus('error');
            setMessage('การเข้าสู่ระบบล้มเหลว กรุณาลองใหม่อีกครั้ง');
            setTimeout(() => router.push('/login'), 3000);
            return;
        }

        if (oauthStatus === 'success') {
            setStatus('success');
            setMessage('เข้าสู่ระบบสำเร็จ! กำลังนำคุณไปยังหน้าหลัก...');
            setTimeout(() => router.push('/manage/control-center'), 1200);
            return;
        }

        setStatus('error');
        setMessage('ไม่พบสถานะการเข้าสู่ระบบ');
        setTimeout(() => router.push('/login'), 3000);
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
            <div className="text-center p-8 max-w-md">
                {status === 'loading' && (
                    <>
                        <Loader2 size={64} className="animate-spin text-primary mx-auto mb-6" />
                        <h1 className="text-2xl font-bold mb-2">กำลังเข้าสู่ระบบ</h1>
                        <p className="text-gray-400">รอสักครู่...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold mb-2">เข้าสู่ระบบสำเร็จ!</h1>
                        <p className="text-gray-400">{message}</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <XCircle size={64} className="text-red-500 mx-auto mb-6" />
                        <h1 className="text-2xl font-bold mb-2">เกิดข้อผิดพลาด</h1>
                        <p className="text-gray-400">{message}</p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function OAuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
                <Loader2 size={64} className="animate-spin text-primary" />
            </div>
        }>
            <OAuthCallbackContent />
        </Suspense>
    );
}
