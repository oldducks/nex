'use client';

import { useEffect, useRef } from 'react';
import Cookies from 'js-cookie';

interface AnalyticsTrackerProps {
    uid: string;
}

export function AnalyticsTracker({ uid }: AnalyticsTrackerProps) {
    const hasLogged = useRef(false);

    useEffect(() => {
        if (hasLogged.current) return;

        const logView = async () => {
            let vid = Cookies.get('vid');
            if (!vid) {
                vid = Math.random().toString(36).substring(2) + Date.now().toString(36);
                Cookies.set('vid', vid, { expires: 365 });
            }

            try {
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                await fetch(`${API_URL}/analytics/log`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        uid,
                        action: 'VIEW_PROFILE',
                        visitorId: vid
                    })
                });
                hasLogged.current = true;
            } catch (err) {
                console.error('Analytics error:', err);
            }
        };

        logView();
    }, [uid]);

    return null;
}
