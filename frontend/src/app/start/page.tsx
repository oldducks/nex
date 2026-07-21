import { permanentRedirect } from 'next/navigation';

export default async function StartPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const sp = await searchParams;
  const ref = sp?.ref;
  permanentRedirect(ref ? `/?ref=${encodeURIComponent(ref)}` : '/');
}
