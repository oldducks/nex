const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// Use internal container name when running on server side (SSR) inside Docker
const INTERNAL_API_URL = process.env.INTERNAL_API_URL || 'http://namecard_api:4000/api';

const getBaseUrl = () => {
    if (typeof window === 'undefined') {
        return INTERNAL_API_URL;
    }
    return API_URL;
};

export async function getProfile(uid: string) {
    const res = await fetch(`${getBaseUrl()}/profile/${uid}`, { cache: 'no-store' });
    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch profile');
    }
    return res.json();
}

export async function getCatalogsByUserId(userId: number) {
    const res = await fetch(`${getBaseUrl()}/catalogs/user-public/${userId}`, { cache: 'no-store' });
    if (!res.ok) {
        return [];
    }
    return res.json();
}
