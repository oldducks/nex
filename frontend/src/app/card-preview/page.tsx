import { redirect } from 'next/navigation';

// The NEX Card landing is now the site root; keep the old preview URL working.
export default function CardPreviewPage() {
  redirect('/');
}
