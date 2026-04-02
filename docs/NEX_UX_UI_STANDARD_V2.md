# NEX UX/UI Standard v2

เอกสารนี้เป็นมาตรฐานกลางสำหรับออกแบบและพัฒนา interface ของ NEX ให้ทุกหน้ามีทิศทางเดียวกัน ใช้งานจริงได้ และต่อยอดเป็น design system ได้ง่าย โดยอิงจาก direction ล่าสุดของแบรนด์: **soft blue-based UI**, **premium business-tech**, และ **minimal gateway-first landing experience**

## 1. เป้าหมายของมาตรฐาน

- ทำให้ทุกหน้าของ NEX สื่อภาพลักษณ์เดียวกัน
- ลดการออกแบบที่สวยแต่ไม่ช่วยให้ผู้ใช้ตัดสินใจ
- ทำให้ designer และ developer ใช้มาตรฐานเดียวกัน
- ทำให้หน้า marketing, product, dashboard และ form อยู่ในระบบเดียวกัน
- ทำให้หน้าแรกของ NEX สามารถคงความเรียบ ชัด และพรีเมียมได้โดยไม่ต้องใส่องค์ประกอบมากเกินจำเป็น

## 2. Brand Experience ที่ต้องรักษา

NEX ต้องให้ความรู้สึกดังนี้:

- Professional
- Trustworthy
- Modern
- Premium
- Focused
- Business-ready
- Clear

สิ่งสำคัญคือความรู้สึก **"เป็นระบบ, น่าเชื่อถือ, เรียบแต่มีระดับ"** ต้องมาก่อนความหวือหวา

## 3. UX Principles

### 3.1 Clear First
- ทุกหน้าต้องตอบให้ได้ว่าหน้านี้มีไว้ทำอะไร
- ผู้ใช้ต้องเห็น next action ภายในไม่กี่วินาที
- ข้อความต้องเน้นผลลัพธ์ ไม่ใช่คำที่กว้างเกินไป

### 3.2 One Section, One Job
- แต่ละ section ควรตอบคำถามเดียว
- อย่าใส่หลาย message หลักไว้ใน block เดียว
- ถ้า section มีทั้งขาย, อธิบาย, และปิดการขายพร้อมกัน แปลว่า section นั้นกว้างเกินไป

### 3.3 CTA Hierarchy
- 1 section มี primary CTA เด่นได้ 1 ตัว
- CTA รองต้องไม่แย่งสายตาจาก CTA หลัก
- CTA ต้องใช้คำกริยาที่ชัด เช่น `เข้าสู่ระบบ`, `ดูรายละเอียด`, `เริ่มต้นใช้งาน`

### 3.4 Visual Noise Control
- ลด element ที่ไม่มีผลต่อการตัดสินใจ
- ใช้สีและเงาเพื่อสร้าง hierarchy ไม่ใช่ตกแต่งทุกจุด
- หลีกเลี่ยง card หลายสไตล์ในหน้าเดียวโดยไม่มีเหตุผล

### 3.5 Premium Restraint
- ความพรีเมียมของ NEX ต้องมาจากความนิ่ง ความคม และความชัด ไม่ใช่การใส่ effect เยอะ
- ใช้ gradient, glow, blur ได้ แต่ต้องน้อยและมีเหตุผล
- หาก element ใดไม่ช่วยให้แบรนด์ดูชัดขึ้นหรือช่วยให้ตัดสินใจง่ายขึ้น ให้ตัดออก

## 4. Page Structure Standard

### 4.1 Gateway Landing Page
ใช้สำหรับหน้าแรกหรือหน้าทางเข้าแบบเรียบของ NEX

โครงสร้างแนะนำ:
1. Centered logo
2. Primary navigation choices
3. Minimal support link หรือ footer

หลักการ:
- มี logo หรือ wordmark อยู่กึ่งกลางอย่างชัดเจน
- มี action choices หลักไม่เกิน 4 รายการ
- มี primary highlight ได้ 1 action
- ใช้ข้อความปุ่มสั้น ชัด และสแกนได้เร็ว
- ไม่ใส่ข้อความอธิบายยาว
- ไม่ใส่ element ที่ไม่ช่วยการตัดสินใจ
- ต้องใช้งานบนมือถือได้ดีเป็นลำดับแรก

### 4.2 Full Marketing Landing Page
ใช้ในกรณีที่ NEX ต้องการหน้าขายหรืออธิบายสินค้าแบบเต็ม

โครงสร้างแนะนำ:
1. Hero
2. Core value / problem-solution
3. Proof / trust / use case
4. Workflow หรือ feature explanation
5. Closing CTA
6. Footer

### 4.3 Product หรือ Dashboard Page
โครงสร้างแนะนำ:
1. Page title + context
2. Key action area
3. Primary content
4. Supporting content
5. Status / feedback / help

## 5. Content Hierarchy

### H1
- ใช้ 1 ครั้งต่อหน้า
- ต้องสื่อคุณค่าหลักของหน้า
- ไม่ใช้คำกว้างแบบไม่มีความหมาย เช่น `Welcome`, `Dashboard` เดี่ยวๆ

### H2
- ใช้แบ่ง section สำคัญ
- แต่ละหัวข้อควรช่วยให้ผู้ใช้ scan หน้าได้

### H3
- ใช้กับ card, feature block, mini section

### Body Copy
- ข้อความสั้น กระชับ และเน้นผลลัพธ์
- ย่อหน้าแนะนำไม่ควรยาวเกินจำเป็น
- ถ้ามีหลายบรรทัด ควรอ่าน scan ได้เร็ว

### Gateway Copy Rule
- ใน gateway landing page ให้ใช้ข้อความน้อยที่สุด
- หลีกเลี่ยง subtitle ยาว
- ใช้เฉพาะ label/action ที่ผู้ใช้ตัดสินใจได้ทันที

## 6. Layout and Spacing

### Container
- หน้า public ใช้ max width ชัดเจน เช่น `max-w-7xl`
- content text block ไม่ควรกว้างเกินจนอ่านยาก

### Spacing
- section spacing ต้องสม่ำเสมอทั้งเว็บไซต์
- card padding ต้องมี pattern กลาง
- หลีกเลี่ยงหน้าแน่นเกินไปหรือโล่งเกินไปแบบไม่มีจังหวะ

### Grid
- ใช้ grid ที่ predictable
- mobile ต้อง stack ได้ดี
- desktop ต้องไม่เกิด block ที่แย่งกันเด่นโดยไม่จำเป็น

### Gateway Layout Rule
- หน้า gateway ต้องมีพื้นที่หายใจมาก
- logo และ action block ต้องจัดวางให้อ่านจบเร็ว
- ไม่ใช้หลายคอลัมน์โดยไม่จำเป็น
- บนมือถือควรเรียงเป็น stacked actions เป็นหลัก

## 7.1 Footer and Company Identity Standard

ใช้กับหน้า public หลักที่มี footer หรือ closing line โดยเฉพาะ home gateway, login และหน้าสาธารณะที่เป็นทางเข้าแบรนด์

หลักการ:
- footer ต้องเรียบ สั้น และไม่แย่งความเด่นจาก CTA หลัก
- ใช้เป็น closing identity ของแบรนด์ ไม่ใช่พื้นที่ใส่ข้อความขาย
- สามารถอยู่ในรูปแบบ single-line หรือ wrapped line ได้ตามพื้นที่หน้าจอ
- บนมือถือให้ยอม wrap ได้ แต่ต้องยังอ่านต่อเนื่องและไม่แตกเป็นหลายบล็อก

ข้อความมาตรฐานที่แนะนำ:
- `© NEX Solution. All rights reserved. บริษัท คราม อินเทลลิเจนท์ เอไอ จำกัด KHRAM INTELLIGENT AI Co., Ltd.`

ข้อกำหนดการใช้งาน:
- ถ้าหน้าเป็น public brand-facing page และมี footer ให้ใช้ข้อความมาตรฐานเดียวกัน
- ถ้าพื้นที่จำกัดมาก สามารถย่อเหลือ `© NEX Solution. All rights reserved.` ได้เฉพาะกรณีที่ต้องการ minimal footer จริง ๆ และมีเหตุผลด้าน layout
- หลีกเลี่ยงการใช้ข้อความ footer คนละเวอร์ชันระหว่างหน้า home, login, privacy และหน้า public อื่น
- ถ้าจะเปลี่ยนชื่อบริษัทหรือ legal naming ให้แก้เป็น policy กลางก่อน แล้วค่อยอัปเดตทุกหน้าให้ตรงกัน

## 7. Color Usage Standard

อิงจากมาตรฐานสีล่าสุดของ NEX:

- Brand Navy: `#050579`
- Accent Orange: `#F97316`
- Support Green: `#84CC16`
- Text Primary: `#0F172A`
- Text Secondary: `#475569`
- Border: `#D9E1F2`
- Surface: `#FFFFFF`
- Background Main: `#EEF0FF`
- Background Alt: `#F6F8FF`

หลักการใช้งาน:
- Navy ใช้กับ brand, structure, headline, key surfaces
- Orange ใช้กับ primary CTA และ action สำคัญ
- Green ใช้กับ success หรือ positive support
- White ใช้กับ card, content surface, input area
- Soft blue ใช้เป็นพื้นหลังหลักของหน้า public และ landing

ข้อห้าม:
- อย่าใช้ orange หลายจุดจน CTA แข่งกันเอง
- อย่าใช้ green เป็นสีหลักของหน้า
- อย่าใช้สีเข้มหลาย section ติดกันจนหน้าอึดอัด
- อย่าใช้พื้นขาวล้วนทั้งหน้าเป็นค่าเริ่มต้นของ public UI ถ้าไม่มีเหตุผลเฉพาะ

## 8. Button Standard

### Primary Button
- ใช้กับ action หลักที่สุดของหน้านั้น
- สีหลัก: orange
- ต้องเห็นเด่นชัดที่สุดใน area นั้น

### Secondary Button
- ใช้กับ action รอง
- ใช้ navy หรือ outline ตามบริบท

### Tertiary Action
- ใช้ text link หรือ ghost button
- สำหรับ action รองมาก เช่น อ่านเพิ่ม

มาตรฐานข้อความบนปุ่ม:
- ใช้คำกริยา
- สั้นและชัด
- หลีกเลี่ยงคำยาวหรือกำกวม

### Gateway Button Rule
- ใน minimal gateway page ให้มีปุ่มเด่นด้วย accent color ได้เพียง 1 ปุ่ม
- ปุ่มอื่นควรใช้ navy, outline หรือ subdued style
- ปุ่มทั้งหมดต้องมีขนาดกดง่ายบนมือถือ

## 9. Card Standard

- card พื้นขาวเป็นค่าเริ่มต้น
- card ควรอยู่บน soft blue หรือ light brand-tinted background ในหน้าสาธารณะ
- ใช้ border อ่อนหรือ shadow เบา
- radius ต้องสม่ำเสมอ
- title ใน card ต้องเด่นกว่า body เสมอ
- อย่าใส่ badge, icon, shadow, gradient พร้อมกันทุกใบถ้าไม่จำเป็น

## 10. Form Standard

### Form UX
- label ต้องชัดเจน
- placeholder เป็นตัวช่วย ไม่ใช่ตัวแทน label
- field spacing ต้องคงที่
- error ต้องบอกสิ่งที่ต้องแก้

### Form UI
- default border ต้องอ่านง่าย
- focus state ต้องเด่นพอ
- error ใช้แดง
- success ใช้เขียว
- submit button หลักใช้ orange

### Login / Register / Lead Form
- ใช้ single-column เป็นหลัก
- ไม่ใส่ลิงก์เยอะจนรบกวน conversion
- social login ต้องไม่แย่ง hierarchy จาก form หลักแบบไร้เหตุผล

## 11. Navigation Standard

- navigation ต้องช่วยให้ผู้ใช้เข้าใจทางเลือกหลัก
- จำนวน action เด่นใน top nav ควรจำกัด
- CTA บน nav ควรมีได้ 1 ตัวเด่น
- บน mobile ต้องกดง่ายและไม่แน่นเกินไป

### Gateway Navigation Rule
- ถ้าใช้หน้า gateway เป็นหน้าแรก อาจไม่จำเป็นต้องมี top navigation เต็มรูปแบบ
- ให้ใช้ action choices เป็น navigation หลักแทนได้
- ต้องคงความชัดเจนและไม่ทำให้ผู้ใช้สงสัยว่าควรกดอะไรต่อ

## 12. Responsive Standard

### Mobile
- CTA ต้องกดง่าย
- content ต้อง stack เป็นลำดับที่เหมาะกับการตัดสินใจ
- อย่าใช้ text block ยาวเกินจอ

### Tablet
- ต้องยังคง hierarchy เดิม ไม่ใช่แค่ย่อ desktop ลงมา

### Desktop
- ใช้พื้นที่เพื่อช่วย scan ข้อมูลเร็วขึ้น
- อย่ากระจาย focus ไปหลายจุดพร้อมกัน

## 13. Accessibility Baseline

- text กับ background ต้องมี contrast เพียงพอ
- ปุ่มและ link ต้องมี hover/focus state
- form field ต้องเข้าถึงผ่าน keyboard ได้
- modal ต้องปิดได้ง่ายและไม่ทำให้ผู้ใช้หลงทาง
- icon ที่มีผลต่อการใช้งานต้องมี text support หรือ label ที่ชัด

## 14. Motion and Visual Effects

- motion ใช้เพื่อ reinforce hierarchy
- หลีกเลี่ยง animation ที่ทำให้หน้าโหลดช้าหรือรบกวนการอ่าน
- blur, glow, gradient ใช้ได้ แต่ต้องไม่กระทบ readability
- ถ้า effect ไม่ช่วย comprehension ให้ตัดออก

## 15. Writing Standard for UI

- ใช้ภาษากระชับ ตรงประเด็น
- หลีกเลี่ยงคำโฆษณาเกินจริง
- เน้นผลลัพธ์และความชัดเจน
- ถ้าปุ่มหรือหัวข้อดูสวยแต่ไม่บอก action ให้แก้

ตัวอย่างที่ควรใช้:
- `เข้าสู่ระบบ`
- `ดูรายละเอียดแพลตฟอร์ม`
- `เริ่มสร้างโปรไฟล์ธุรกิจ`
- `จัดการจาก Control Center`
- `สมัครเป็น Agent`
- `สำหรับองค์กร`

## 16. QA Checklist ก่อนส่งงาน

- หน้าแรกมี H1 ชัดเจนหรือไม่
- แต่ละ section มีหน้าที่เดียวหรือไม่
- CTA หลักของหน้าเด่นพอหรือไม่
- CTA รองแย่งความเด่นเกินไปหรือไม่
- ใช้สีตามระบบ NEX หรือไม่
- ใช้พื้นหลัง soft blue ตามมาตรฐานของ public UI หรือไม่
- spacing และ radius สม่ำเสมอหรือไม่
- mobile อ่านง่ายและกดง่ายหรือไม่
- form ใช้งานผ่าน keyboard ได้หรือไม่
- contrast ผ่านขั้นต่ำหรือไม่
- footer หรือ closing state ทำให้หน้า "จบงาน" หรือยัง

## 17. แนวทางใช้งานร่วมกันระหว่าง Designer และ Developer

- Designer ต้องอ้างอิงเอกสารนี้ก่อนส่ง mockup
- Developer ต้องยึด hierarchy เดิม ไม่ตีความ CTA ใหม่เอง
- ถ้าต้องแตกต่างจากมาตรฐาน ต้องมีเหตุผลเชิง product หรือ conversion
- เมื่อสร้าง component ใหม่ ควรคิดว่ามันจะถูกใช้ซ้ำได้หรือไม่
- หากมีการแก้ theme ให้แก้ผ่าน token หรือ theme layer ก่อน ไม่แก้แบบ hard-code รายจุด

## 18. เอกสารที่ควรอ้างอิงร่วม

- `docs/NEX_BRAND_GUIDELINE_V2.md`
- `docs/NEX_COLOR_SYSTEM_V2.md`
- `docs/NEX_UI_RULES_V1.md`
- `docs/NEX_TAILWIND_TOKENS_V2.md`

เอกสารนี้ทำหน้าที่เป็นตัวกลางระหว่าง brand direction, UI rule และ implementation standard
