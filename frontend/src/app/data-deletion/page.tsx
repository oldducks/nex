import React from 'react';

export default function DataDeletionPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-neutral-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 border-b border-neutral-700 pb-4">
            คำแนะนำในการลบข้อมูลผู้ใช้ (Data Deletion Instructions)
          </h1>
          
          <div className="space-y-8 text-neutral-300 leading-relaxed">
            <section>
              <p className="mb-4">
                ตามนโยบายของระบบปฏิบัติการและกฎหมายคุ้มครองข้อมูลส่วนบุคคล ผู้ใช้งานมีสิทธิ์ที่จะร้องขอให้ลบข้อมูลส่วนบุคคลของตนออกจากระบบของเราได้ตลอดเวลา
              </p>
              <p>
                หากคุณต้องการลบข้อมูลบัญชีและข้อมูลส่วนบุคคลทั้งหมดของคุณออกจากแอพพลิเคชัน <strong>Digital Business Card (nexsolution.cloud)</strong> โปรดปฏิบัติตามขั้นตอนดังต่อไปนี้:
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">วิธีที่ 1: ลบผ่านเว็บไซต์ (ด้วยตนเอง)</h2>
              <ol className="list-decimal pl-6 space-y-4">
                <li>
                  <strong className="text-white">เข้าสู่ระบบ:</strong> ไปที่หน้า <a href="/login" className="text-blue-400 hover:text-blue-300 underline">เข้าสู่ระบบ</a> ด้วยอีเมลและรหัสผ่านของคุณ
                </li>
                <li>
                  <strong className="text-white">ไปที่การตั้งค่า:</strong> คลิกที่รูปโปรไฟล์ของคุณและเลือกเมนู "ตั้งค่าบัญชี" (Account Settings) หรือไปที่หน้าจัดการโปรไฟล์
                </li>
                <li>
                  <strong className="text-white">ดำเนินการลบข้อมูล:</strong>
                  <ul className="list-disc pl-6 mt-2 space-y-1">
                    <li>เลื่อนลงไปที่ส่วน "การจัดการข้อมูล" หรือ "ขั้นสูง"</li>
                    <li>กดปุ่ม <span className="text-red-400 font-medium">"ลบบัญชีผู้ใช้" (Delete Account)</span></li>
                    <li>ยืนยันการลบข้อมูลโดยการพิมพ์รหัสผ่านของคุณอีกครั้ง</li>
                  </ul>
                </li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">วิธีที่ 2: ส่งคำร้องขอทางเรา (Manual Request)</h2>
              <p className="mb-4">
                หากคุณไม่สามารถเข้าถึงบัญชีได้ หรือต้องการให้ทีมงานดำเนินการให้ คุณสามารถส่งคำร้องขอลบข้อมูลได้ผ่านช่องทางดังนี้:
              </p>
              <div className="bg-neutral-700/50 p-6 rounded-lg border border-neutral-600">
                <p className="mb-2"><strong className="text-white">ส่งอีเมลไปที่:</strong> <a href="mailto:support@dpattown.com" className="text-blue-400 hover:text-blue-300">support@dpattown.com</a></p>
                <p className="mb-2"><strong className="text-white">หัวข้ออีเมล:</strong> ร้องขอลบข้อมูลบัญชีผู้ใช้ (Request for Account Deletion)</p>
                <p><strong className="text-white">รายละเอียดที่ต้องระบุ:</strong></p>
                <ul className="list-disc pl-6 mt-1 space-y-1 text-sm">
                  <li>อีเมลที่ลงทะเบียนไว้กับระบบ</li>
                  <li>ชื่อ-นามสกุล ของเจ้าของบัญชี</li>
                  <li>เหตุผลในการขอลบข้อมูล (ไม่บังคับ)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">ข้อมูลที่จะถูกลบ</h2>
              <p className="mb-4">เมื่อการดำเนินการเสร็จสิ้น ข้อมูลต่อไปนี้จะถูกลบออกจากระบบอย่างถาวรและไม่สามารถกู้คืนได้:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>ข้อมูลโปรไฟล์ส่วนตัว (ชื่อ, การติดต่อ, รูปภาพ)</li>
                <li>Digital Business Card และ URL ของคุณ</li>
                <li>Catalog สินค้าและข้อมูลสินค้าทั้งหมด</li>
                <li>Landing Pages ที่คุณสร้าง</li>
                <li>ประวัติการใช้งานและการตั้งค่าทั้งหมด</li>
              </ul>
              <p className="mt-4 text-yellow-500/90 bg-yellow-900/20 p-4 rounded border border-yellow-700/50 text-sm">
                <strong>หมายเหตุ:</strong> ระบบอาจเก็บข้อมูลบางส่วนไว้ตามระยะเวลาที่กฎหมายกำหนดเพื่อวัตถุประสงค์ทางบัญชีและภาษี (ถ้ามีธุรกรรมทางการเงิน)
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">ระยะเวลาดำเนินการ</h2>
              <p>
                สำหรับการลบผ่านเว็บไซต์ ข้อมูลจะถูกลบออกจากระบบทันที สำหรับการส่งคำร้องขอทางอีเมล ทีมงานจะดำเนินการตรวจสอบและลบข้อมูลของคุณภายใน <strong>7-14 วันทำการ</strong> หลังจากได้รับคำร้องขอที่ถูกต้องและยืนยันตัวตนเรียบร้อยแล้ว
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">ติดต่อสอบถาม</h2>
              <p>
                หากมีข้อสงสัยเพิ่มเติมเกี่ยวกับกระบวนการลบข้อมูล สามารถติดต่อเราได้ที่:
              </p>
              <p className="mt-2 text-white font-medium">
                Email: support@dpattown.com
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
