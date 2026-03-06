import { redirect, notFound } from 'next/navigation';
import { getProfile } from '../../../lib/api';

export default async function LegacyProfileRedirectPage({ params }: { params: Promise<{ uid: string }> }) {
  const { uid } = await params;
  const data = await getProfile(uid);

  if (!data) {
    notFound();
  }

  const prefix = data.url_prefix || 'p';
  redirect(`/${prefix}/${uid}`);
}
