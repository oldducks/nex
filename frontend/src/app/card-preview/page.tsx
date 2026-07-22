import { Metadata } from 'next';
import CardPreviewClient from './CardPreviewClient';

export const metadata: Metadata = {
  title: 'NEX Card – Smart Business Card (Preview)',
  description:
    'นามบัตรจริงที่แตะแล้ว ลูกค้าเห็นสินค้าคุณทันที — บัตร NFC จริง เชื่อม NEX Digital ID, Catalog และ Sale Page',
  // Preview page: keep it out of search results until the real launch.
  robots: { index: false, follow: false },
};

export default function CardPreviewPage() {
  return <CardPreviewClient />;
}
