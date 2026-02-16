import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-neutral-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 border-b border-neutral-700 pb-4">
            นโยบายความเป็นส่วนตัว (Privacy Policy)
          </h1>
          
          <div className="space-y-8 text-neutral-300 leading-relaxed">
            <section>
              <p className="mb-4">
                ปรับปรุงล่าสุด: 11 กุมภาพันธ์ 2026
              </p>
              <p>
                ยินดีต้อนรับสู่ <strong>namecard.dpattown.com</strong> ("เรา", "พวกเรา", หรือ "ของเรา") เราให้ความสำคัญกับความเป็นส่วนตัวของคุณและมุ่งมั่นที่จะปกป้องข้อมูลส่วนบุคคลของคุณอย่างเต็มที่ นโยบายความเป็นส่วนตัวนี้จะอธิบายถึงวิธีการที่เราเก็บรวบรวม ใช้ เปิดเผย และรักษาความปลอดภัยของข้อมูลของคุณเมื่อคุณใช้บริการแพลตฟอร์ม Digital Business Card และ Catalog ของเรา
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. ข้อมูลที่เราเก็บรวบรวม</h2>
              <p className="mb-4">เราอาจเก็บรวบรวมข้อมูลประเภทต่างๆ ดังนี้:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-white">ข้อมูลส่วนบุคคล (Personal Data):</strong> เช่น ชื่อ, นามสกุล, อีเมล, เบอร์โทรศัพท์, ข้อมูลการติดต่อทางธุรกิจ, และข้อมูลอื่น ๆ ที่คุณระบุในโปรไฟล์นามบัตรดิจิทัลของคุณ
                </li>
                <li>
                  <strong className="text-white">ข้อมูลการใช้งาน (Usage Data):</strong> เช่น ข้อมูลเกี่ยวกับอุปกรณ์ที่คุณใช้เข้าถึงเว็บไซต์, IP address, ประเภทของเบราว์เซอร์, หน้าที่คุณเยี่ยมชม, เวลาที่ใช้ในหน้าต่างๆ และข้อมูลการโต้ตอบอื่นๆ
                </li>
                <li>
                  <strong className="text-white">ข้อมูลเนื้อหา (Content Data):</strong> ข้อมูลที่คุณอัปโหลดลงในระบบ เช่น รูปภาพโปรไฟล์, รูปภาพสินค้า, วิดีโอ, และข้อมูลใน Catalog ของคุณ
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. วิธีการใช้ข้อมูลของคุณ</h2>
              <p className="mb-4">เราใช้ข้อมูลที่เก็บรวบรวมเพื่อวัตถุประสงค์ต่อไปนี้:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>เพื่อให้บริการและบำรุงรักษาแพลตฟอร์ม Digital Business Card และ Catalog</li>
                <li>เพื่อจัดการบัญชีผู้ใช้งานของคุณและการลงทะเบียน</li>
                <li>เพื่อติดต่อสื่อสารกับคุณ เกี่ยวกับการเปลี่ยนแปลงบริการ หรือข้อมูลข่าวสาร</li>
                <li>เพื่อวิเคราะห์และปรับปรุงประสิทธิภาพของบริการ</li>
                <li>เพื่อตรวจจับ ป้องกัน และแก้ไขปัญหาทางเทคนิค</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. การเปิดเผยข้อมูล (Data Disclosure)</h2>
              <p className="mb-4">
                เราจะไม่ขายข้อมูลส่วนบุคคลของคุณให้กับบุคคลที่สาม อย่างไรก็ตาม เราอาจแบ่งปันข้อมูลของคุณในกรณีต่อไปนี้:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong className="text-white">ผู้ให้บริการ:</strong> เราอาจแบ่งปันข้อมูลกับผู้ให้บริการภายนอกที่ช่วยเราในการดำเนินการเว็บไซต์ (เช่น ผู้ให้บริการโฮสติ้ง, บริการวิเคราะห์ข้อมูล) โดยบุคคลเหล่านี้มีหน้าที่รักษาความลับของข้อมูล
                </li>
                <li>
                  <strong className="text-white">ข้อกำหนดทางกฎหมาย:</strong> หากมีความจำเป็นต้องปฏิบัติตามกฎหมาย หรือการร้องขอจากหน่วยงานรัฐที่มีอำนาจ
                </li>
                <li>
                  <strong className="text-white">ข้อมูลสาธารณะ:</strong> ข้อมูลที่คุณเลือกที่จะเปิดเผยในนามบัตรดิจิทัลหรือ Catalog ของคุณ จะถือเป็นข้อมูลสาธารณะที่ผู้อื่นสามารถเข้าถึงได้ผ่านลิงก์ของคุณ
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. ความปลอดภัยของข้อมูล (Data Security)</h2>
              <p>
                ความปลอดภัยของข้อมูลของคุณมีความสำคัญต่อเรา เราใช้มาตรฐานความปลอดภัยทางเทคนิคและการบริหารจัดการที่เหมาะสมเพื่อปกป้องข้อมูลส่วนบุคคลของคุณจากการเข้าถึง การใช้ หรือการเปิดเผยโดยไม่ได้รับอนุญาต อย่างไรก็ตาม โปรดทราบว่าไม่มีวิธีการส่งข้อมูลผ่านอินเทอร์เน็ตหรือวิธีการจัดเก็บข้อมูลอิเล็กทรอนิกส์ใดที่มีความปลอดภัย 100%
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. คุกกี้ (Cookies)</h2>
              <p>
                เราใช้คุกกี้และเทคโนโลยีการติดตามที่คล้ายคลึงกันเพื่อติดตามกิจกรรมบนบริการของเราและเก็บข้อมูลบางอย่าง คุกกี้เป็นไฟล์ข้อมูลขนาดเล็กที่อาจมีตัวระบุที่ไม่ซ้ำกัน คุณสามารถตั้งค่าเบราว์เซอร์ของคุณให้ปฏิเสธคุกกี้ทั้งหมดหรือระบุเมื่อมีการส่งคุกกี้ได้
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. สิทธิของคุณ (Your Rights)</h2>
              <p className="mb-4">ภายใต้กฎหมายคุ้มครองข้อมูลส่วนบุคคล คุณมีสิทธิในการ:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>เข้าถึง อัปเดต หรือลบข้อมูลที่เรามีเกี่ยวกับคุณ</li>
                <li>แก้ไขข้อมูลที่ไม่ถูกต้อง</li>
                <li>คัดค้านการประมวลผลข้อมูลของคุณ</li>
                <li>ร้องขอสำเนาข้อมูลของคุณ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. การเปลี่ยนแปลงนโยบายความเป็นส่วนตัว</h2>
              <p>
                เราอาจปรับปรุงนโยบายความเป็นส่วนตัวของเราเป็นครั้งคราว เราจะแจ้งให้คุณทราบถึงการเปลี่ยนแปลงใดๆ โดยการโพสต์นโยบายความเป็นส่วนตัวฉบับใหม่ในหน้านี้ แนะนำให้คุณตรวจสอบนโยบายความเป็นส่วนตัวนี้เป็นระยะๆ เพื่อดูการเปลี่ยนแปลง
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. ติดต่อเรา</h2>
              <p>
                หากคุณมีคำถามใดๆ เกี่ยวกับนโยบายความเป็นส่วนตัวนี้ โปรดติดต่อเราได้ที่:
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
