# NEX_PAGE_BRIEF_TEMPLATE.md

Purpose: แม่แบบสำหรับกำหนดโจทย์รายหน้าให้ชัดก่อนสั่ง agent ทำงาน ใช้ควบคุม scope, page type, CTA, mobile logic และข้อห้ามเฉพาะหน้านั้น

---

## 1) Basic Info
- Page Name:
- Existing Route:
- New Test Route:
- Owner:
- Status: Draft / Active / Approved

---

## 2) Page Objective
- หน้านี้มีไว้เพื่ออะไร:
- business goal หลัก:
- user action หลักที่ต้องการ:
- success criteria ของหน้านี้:

ตัวอย่าง success criteria:
- ผู้ใช้เข้าใจหน้าภายใน 3–5 วินาที
- primary CTA เห็นได้เร็วบนมือถือ
- อ่าน flow หลักได้โดยไม่สับสน

---

## 3) Page Type
- Page Type: Gateway / Marketing Landing / Explainer / Product Page / Dashboard / Form / Login / Register / Other
- เหตุผลที่จัดเป็น page type นี้:
- ห้ามตีความเป็น page type อื่น:

---

## 4) Scope of Work
### In Scope
- สิ่งที่ให้ทำ:
- component ที่ต้องปรับ:
- section ที่เกี่ยวข้อง:
- responsive/mobile behavior ที่ต้องแก้:

### Out of Scope
- สิ่งที่ห้ามแก้:
- route เดิมที่ห้ามแตะ:
- business logic / auth / database / integration ที่ห้ามแตะ:

หลักสำคัญ:
- ทำเฉพาะหน้านี้เท่านั้น
- ห้ามขยาย scope ไปหน้าอื่นเอง

---

## 5) Mobile-First Intent
- mobile problem ปัจจุบันคืออะไร:
- first viewport ต้องสื่ออะไร:
- primary CTA คืออะไร:
- secondary CTA คืออะไร:
- section order บนมือถือควรเป็นอย่างไร:
- มี sticky CTA หรือไม่:

---

## 6) Content Strategy
- headline หลัก:
- supporting message:
- tone:
- content density ที่ต้องการ: light / medium / dense
- ส่วนไหนต้องสั้นมาก:
- ส่วนไหนอธิบายเพิ่มได้:

---

## 7) Visual Direction
- background style:
- surface/card style:
- CTA emphasis:
- section ที่ใช้ navy-heavy ได้:
- section ที่ต้องคุมไม่ให้มืดเกินไป:
- icon/image direction:

---

## 8) Component Plan
- Navbar:
- Hero / Header:
- Card:
- Form:
- CTA Block:
- Footer:
- Other:

ระบุได้ว่าตัวไหน:
- ใช้จากมาตรฐานเดิม
- ปรับ variant
- อนุญาตเป็น exception เฉพาะหน้า

---

## 9) Approved Exceptions
- decision log ที่เกี่ยวข้อง:
- สิ่งที่เป็น exception จาก global standard:
- สิ่งที่ agent ห้าม revert:

---

## 10) Implementation Rule
- ห้ามแก้ route เดิมโดยตรง
- ให้สร้างหน้าใหม่บน test route ก่อน
- ให้เริ่มจาก mobile layout ก่อนเสมอ
- เมื่อผ่าน QA แล้วค่อยเสนอแผนแทนที่ของเดิม
- หากพบความขัดแย้งกับ global standard ให้ยึด page brief นี้ก่อน หากมี owner approval ชัดเจน

---

## 11) QA Acceptance
- หน้านี้ต้องผ่าน checklist ใดบ้าง:
- จุดที่เจ้าของจะใช้ตัดสินผ่าน/ไม่ผ่าน:
- screenshot หรือ comparison ที่ต้องแนบ:

---

## 12) Handoff Note for Agent
- ให้สรุปความเข้าใจของหน้านี้ก่อนลงมือ
- ให้เสนอ mobile structure ก่อน build
- ให้รายงานเฉพาะสิ่งที่เปลี่ยนในหน้านี้
- ห้ามแก้หน้าอื่นแม้จะเห็น pattern คล้ายกัน
- หาก owner ปรับของจริงเพิ่มภายหลัง ต้องตรวจ decision log ก่อนทำรอบถัดไป
