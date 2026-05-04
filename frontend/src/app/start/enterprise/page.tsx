import { Metadata } from 'next';
import EnterpriseClient from './EnterpriseClient';

export const metadata: Metadata = {
  title: 'ลูกค้าองค์กร – NEX Enterprise Sales Network',
  description:
    'เปลี่ยนพนักงานทุกคนให้เป็นทีมขาย ติดตามยอด คำนวณค่าคอมอัตโนมัติ — NEX Enterprise Sales Network',
  openGraph: {
    title: 'ลูกค้าองค์กร – NEX Solution',
    description: 'ระบบ Sales Network สำหรับองค์กร ติดตามยอด คำนวณค่าคอม ไม่ต้องจ้างเซลส์เพิ่ม',
    url: 'https://nexsolution.cloud/start/enterprise',
  },
};

export default function EnterprisePage() {
  return <EnterpriseClient />;
}
