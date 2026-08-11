import { Metadata } from 'next';
import CardPreviewClient from './card-preview/CardPreviewClient';

export const metadata: Metadata = {
  title: 'NEX Card – นามบัตรจริงที่แตะแล้ว ลูกค้าเห็นสินค้าคุณทันที',
  description:
    'บัตร NFC จริง เชื่อม NEX Digital ID, Catalog และ Sale Page — ตั้งแต่แนะนำตัว นำเสนอสินค้า ไปจนถึงรับข้อมูลลูกค้า ในบัตรใบเดียว',
  openGraph: {
    title: 'NEX Card – นามบัตรจริงที่แตะแล้ว ลูกค้าเห็นสินค้าคุณทันที',
    description: 'บัตร NFC จริง เชื่อม Digital ID, Catalog และ Sale Page ในบัตรใบเดียว',
    url: 'https://nexsolution.cloud',
  },
};

export default function HomePage() {
  return <CardPreviewClient />;
}
