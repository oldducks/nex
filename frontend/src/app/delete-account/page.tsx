import React from 'react';
import Link from 'next/link';

export default function DeleteAccountPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-neutral-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 border-b border-neutral-700 pb-4">
            ลบบัญชีผู้ใช้ (Delete Account)
          </h1>

          <div className="space-y-8 text-neutral-300 leading-relaxed">
            <section>
              <p className="mb-4">ปรับปรุงล่าสุด: 31 มีนาคม 2026</p>
              <p>
                หน้านี้อธิบายวิธีที่ผู้ใช้งานสามารถร้องขอลบบัญชีและข้อมูลที่เกี่ยวข้องกับบริการ
                <strong className="text-white"> nexsolution.cloud </strong>
                สำหรับการใช้งานบนเว็บและ Android app
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. วิธีขอลบบัญชี</h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>ส่งคำขอลบบัญชีมาที่อีเมลฝ่ายสนับสนุนด้านล่าง</li>
                <li>ระบุข้อมูลที่ใช้ยืนยันบัญชี เช่น อีเมลที่ใช้สมัคร หรือชื่อบัญชีผู้ใช้</li>
                <li>ทีมงานจะตรวจสอบคำขอและดำเนินการลบบัญชีตามขั้นตอนภายใน</li>
              </ol>
              <p className="mt-4">
                อีเมลสำหรับคำขอ:
                <span className="ml-2 text-white font-medium">support@dpattown.com</span>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. ข้อมูลที่จะถูกลบ</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>ข้อมูลบัญชีผู้ใช้</li>
                <li>ข้อมูลโปรไฟล์ที่ผู้ใช้บันทึกไว้ในระบบ</li>
                <li>ข้อมูลคอนเทนต์ที่ผู้ใช้สร้างในระบบ เช่น profile, catalog, landing page และ QR-related content</li>
                <li>ไฟล์สื่อที่ผู้ใช้อัปโหลด ซึ่งเกี่ยวข้องกับบัญชีนั้นตามนโยบายภายในระบบ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. ข้อมูลที่อาจยังคงถูกเก็บไว้ชั่วคราว</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>บันทึกระบบ (system logs) และข้อมูลสำรองที่จำเป็นต่อความปลอดภัยและการตรวจสอบย้อนหลัง</li>
                <li>ข้อมูลที่จำเป็นต่อการปฏิบัติตามกฎหมายหรือข้อกำหนดทางบัญชี/ภาษี (ถ้ามี)</li>
              </ul>
              <p className="mt-4">
                ข้อมูลประเภทนี้อาจถูกเก็บไว้ต่อในช่วงเวลาที่จำเป็นตามเหตุผลด้านกฎหมาย ความปลอดภัย
                หรือการกู้คืนระบบ ก่อนจะถูกลบตามรอบการจัดการข้อมูลของระบบ
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. ระยะเวลาดำเนินการ</h2>
              <p>
                หลังจากได้รับคำขอและยืนยันตัวตนเรียบร้อย ทีมงานจะดำเนินการลบบัญชีภายในระยะเวลาที่เหมาะสมตามกระบวนการภายใน
                โดยอาจมีระยะเวลาการคงเก็บบางข้อมูลไว้ชั่วคราวตามข้อกำหนดด้านกฎหมาย ความปลอดภัย หรือการสำรองข้อมูล
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. ติดต่อทีมงาน</h2>
              <p>
                หากคุณต้องการลบบัญชีหรือมีคำถามเพิ่มเติมเกี่ยวกับการจัดการข้อมูล โปรดติดต่อ:
              </p>
              <p className="mt-2 text-white font-medium">Email: support@dpattown.com</p>
              <p className="mt-4">
                อ่านข้อมูลเพิ่มเติมเกี่ยวกับการจัดการข้อมูลได้ที่{' '}
                <Link href="/privacy" className="text-cyan-300 hover:text-cyan-200 underline">
                  Privacy Policy
                </Link>
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-neutral-700 text-center text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} dpattown.com. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
