'use client';

import { ReactNode } from 'react';
import { LayoutEditorProvider } from './LayoutEditor';
import { LiveStyleInjector } from './LiveStyleInjector';

interface ProfilePageClientProps {
    children: ReactNode;
    profileData: {
        user_id: number;
        uid: string;
        url_prefix: string;
        layout_config?: any;
        theme_config?: any;
        [key: string]: any;
    };
}

export function ProfilePageClient({ children, profileData }: ProfilePageClientProps) {
    return (
        <LayoutEditorProvider
            profileData={profileData}
            userId={profileData.user_id}
        >
            <LiveStyleInjector />
            {children}
        </LayoutEditorProvider>
    );
}
