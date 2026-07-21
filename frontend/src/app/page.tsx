import { Metadata } from 'next';
import StartClient from './start/StartClient';

export const metadata: Metadata = {
  title: 'NEX Solution – มากกว่าตามบัตรดิจิทัล',
  description:
    'NEX Card, NEX Catalog, NEX Sale Page – 3 เครื่องมือที่ช่วยให้ธุรกิจของคุณขายได้จริง ตั้งต้นฟรีใน 5 นาที เริ่มต้นฟรี',
  openGraph: {
    title: 'NEX Solution – มากกว่าตามบัตรดิจิทัล',
    description: 'ครบจบที่เดียว ตั้งต้นฟรีใน 5 นาที เริ่มต้นฟรี',
    url: 'https://nexsolution.cloud',
  },
};

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const sp = await searchParams;
  const ref = sp?.ref ?? 'direct';
  return <StartClient initialRef={ref} />;
}
