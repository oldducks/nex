import { Metadata } from 'next';
import StartClient from '../start/StartClient';

export const metadata: Metadata = {
  title: 'NEX Solution – 3 เครื่องมือครบจบที่เดียว',
  description:
    'NEX Digital ID · NEX Catalog · NEX Sale Page — 3 เครื่องมือที่ช่วยให้ธุรกิจแนะนำตัว แชร์สินค้า และปิดการขายได้จริง เริ่มต้นฟรี',
  openGraph: {
    title: 'NEX Solution – 3 เครื่องมือครบจบที่เดียว',
    description: 'ครบจบที่เดียว เริ่มต้นฟรี',
    url: 'https://nexsolution.cloud/solution',
  },
};

export default async function SolutionPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const sp = await searchParams;
  const ref = sp?.ref ?? 'direct';
  return <StartClient initialRef={ref} />;
}
