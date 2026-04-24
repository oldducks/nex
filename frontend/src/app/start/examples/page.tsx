import { Metadata } from 'next';
import ExamplesClient from './ExamplesClient';

export const metadata: Metadata = {
  title: 'ตัวอย่างการใช้งานจริง – NEX Solution',
  description:
    'ดูตัวอย่างจริงของ NEX Digital ID, NEX Catalog และ NEX Sale Page จากธุรกิจที่ใช้งานอยู่วันนี้',
  openGraph: {
    title: 'ตัวอย่างการใช้งานจริง – NEX Solution',
    description: 'เห็นของจริงก่อนตัดสินใจ — 3 ผลิตภัณฑ์ NEX Solution',
    url: 'https://nexsolution.cloud/start/examples',
  },
};

export default function ExamplesPage() {
  return <ExamplesClient />;
}
