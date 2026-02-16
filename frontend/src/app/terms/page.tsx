import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-200 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-neutral-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 md:p-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 border-b border-neutral-700 pb-4">
            ข้อกำหนดการใช้บริการ (Terms of Service)
          </h1>
          
          <div className="space-y-8 text-neutral-300 leading-relaxed">
            <section>
              <p className="mb-4">
                ปรับปรุงล่าสุด: 11 กุมภาพันธ์ 2026
              </p>
              <p>
                ยินดีต้อนรับสู่ <strong>namecard.dpattown.com</strong> ("เรา", "พวกเรา", หรือ "ของเรา") การเข้าถึงและการใช้บริการนี้อยู่ภายใต้ข้อกำหนดและเงื่อนไขดังต่อไปนี้ โปรดอ่านข้อกำหนดเหล่านี้อย่างละเอียดก่อนใช้บริการ หากคุณไม่ยอมรับข้อกำหนดเหล่านี้ โปรดอย่าใช้บริการของเรา
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. การยอมรับข้อกำหนด</h2>
              <p>
                การเข้าถึงหรือใช้งานเว็บไซต์นี้ หรือการสมัครสมาชิกบริการของเรา ถือว่าคุณได้ยอมรับและตกลงที่จะผูกพันตามข้อกำหนดการใช้บริการนี้ รวมถึงนโยบายความเป็นส่วนตัวของเรา
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. บัญชีผู้ใช้งาน</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>คุณต้องให้ข้อมูลที่ถูกต้อง ครบถ้วน และเป็นปัจจุบันในการสร้างบัญชี</li>
                <li>คุณมีหน้าที่รับผิดชอบในการรักษาความปลอดภัยของรหัสผ่านและบัญชีของคุณ</li>
                <li>คุณต้องรับผิดชอบต่อกิจกรรมทั้งหมดที่เกิดขึ้นภายใต้บัญชีของคุณ</li>
                <li>เราขอสงวนสิทธิ์ในการระงับหรือยกเลิกบัญชีของคุณ หากพบการละเมิดข้อกำหนดเหล่านี้</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. การใช้งานที่เหมาะสม</h2>
              <p className="mb-4">คุณตกลงที่จะไม่ใช้บริการในลักษณะดังต่อไปนี้:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>การกระทำที่ผิดกฎหมาย ละเมิดสิทธิของผู้อื่น หรือเป็นการหลอกลวง</li>
                <li>การเผยแพร่เนื้อหาที่ไม่เหมาะสม อนาจาร หรือสร้างความเกลียดชัง</li>
                <li>การพยายามเข้าถึงระบบโดยไม่ได้รับอนุญาต หรือรบกวนการทำงานของระบบ</li>
                <li>การใช้บริการเพื่อส่งสแปม หรือการสื่อสารที่ไม่พึงประสงค์อื่นๆ</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. เนื้อหาของผู้ใช้</h2>
              <p>
                บริการของเราอนุญาตให้คุณโพสต์ เชื่อมโยง จัดเก็บ แบ่งปัน และสร้างเนื้อหาบางอย่างได้ คุณต้องรับผิดชอบต่อเนื้อหาที่คุณโพสต์บนบริการ รวมถึงความถูกต้องตามกฎหมาย ความน่าเชื่อถือ และความเหมาะสมของเนื้อหานั้น
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. ทรัพย์สินทางปัญญา</h2>
              <p>
                บริการและเนื้อหาต้นฉบับ (ไม่รวมเนื้อหาที่ผู้ใช้ให้มา) คุณลักษณะ และฟังก์ชันการทำงาน เป็นทรัพย์สินของ namecard.dpattown.com และได้รับการคุ้มครองโดยกฎหมายลิขสิทธิ์
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. การจำกัดความรับผิด</h2>
              <p>
                ไม่ว่าในกรณีใด เราจะไม่รับผิดชอบต่อความเสียหายใดๆ (รวมถึงแต่ไม่จำกัดเพียง ความเสียหายจากการสูญเสียข้อมูลหรือกำไร หรือเนื่องจากการหยุดชะงักทางธุรกิจ) ที่เกิดขึ้นจากการใช้หรือความไม่สามารถใช้บริการของเรา
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. การเปลี่ยนแปลงบริการและข้อกำหนด</h2>
              <p>
                เราขอสงวนสิทธิ์ในการเปลี่ยนแปลง แก้ไข หรือยกเลิกบริการ (หรือส่วนใดส่วนหนึ่ง) ได้ตลอดเวลาโดยไม่ต้องแจ้งให้ทราบล่วงหน้า นอกจากนี้ เราอาจแก้ไขข้อกำหนดเหล่านี้เป็นครั้งคราว และการใช้บริการต่อไปของคุณหลังจากการแก้ไขใดๆ จะถือว่าคุณยอมรับการเปลี่ยนแปลงเหล่านั้น
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. กฎหมายที่ใช้บังคับ</h2>
              <p>
                ข้อกำหนดเหล่านี้จะอยู่ภายใต้และตีความตามกฎหมายของประเทศไทย โดยไม่คำนึงถึงหลักการขัดกันของกฎหมาย
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. ติดต่อเรา</h2>
              <p>
                หากคุณมีคำถามใดๆ เกี่ยวกับข้อกำหนดเหล่านี้ โปรดติดต่อเราได้ที่:
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
