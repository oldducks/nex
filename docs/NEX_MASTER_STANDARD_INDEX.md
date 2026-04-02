# NEX MASTER STANDARD INDEX

## 1) Purpose
ไฟล์นี้เป็นสารบัญกลางและกติกากลางของชุดมาตรฐาน NEX
ใช้เพื่อบอกว่า:
- เอกสารไหนเป็น active source of truth
- เอกสารไหนเป็น draft / archive
- ลำดับการอ่านเป็นอย่างไร
- หากเอกสารขัดกัน ต้องยึดอะไร
- agent และทีมงานต้องใช้งานอย่างไร

---

## 2) Current Active Source of Truth

### A. Foundation / Umbrella Standards
1. `NEX_UX_UI_STANDARD_V2.md`
2. `NEX_BRAND_GUIDELINE_V2.md`
3. `NEX_COLOR_SYSTEM_V2.md`
4. `NEX_UI_RULES_V1.md`
5. `NEX_TAILWIND_TOKENS_V2.md`

### B. Mobile-First / Build Standards
6. `NEX_MOBILE_WEB_STANDARD_v1.md`
7. `NEX_PAGE_TYPE_STANDARD_v1.md`
8. `NEX_COMPONENT_STANDARD_v1.md`
9. `NEX_CONTENT_DENSITY_STANDARD_v1.md`
10. `NEX_MOBILE_QA_CHECKLIST_v1.md`

### C. Implementation Governance
11. `NEX_AGENT_IMPLEMENTATION_PROTOCOL_v2.md`
12. `NEX_PAGE_BRIEF_TEMPLATE.md`
13. `NEX_PAGE_DECISION_LOG.md`

---

## 3) Document Roles

### `NEX_UX_UI_STANDARD_V2.md`
Umbrella standard ระดับสูงของ UX/UI ทั้งระบบ

### `NEX_BRAND_GUIDELINE_V2.md`
คุมแบรนด์, tone, visual character, CTA hierarchy, landing direction

### `NEX_COLOR_SYSTEM_V2.md`
คุม color system หลักของโครงการปัจจุบัน  
ใช้เป็น active source of truth ด้านสี

### `NEX_UI_RULES_V1.md`
quick rules / shorthand rules สำหรับใช้งานหน้างานและ implementation

### `NEX_TAILWIND_TOKENS_V2.md`
implementation tokens สำหรับ front-end / design token mapping

### `NEX_MOBILE_WEB_STANDARD_v1.md`
กฎ mobile-first หลักสำหรับทุกหน้าใหม่

### `NEX_PAGE_TYPE_STANDARD_v1.md`
บังคับให้กำหนด page type ก่อนออกแบบหรือ build

### `NEX_COMPONENT_STANDARD_v1.md`
คุมพฤติกรรมและบทบาทของ component ที่ใช้ซ้ำ

### `NEX_CONTENT_DENSITY_STANDARD_v1.md`
คุมความหนาแน่นของข้อมูลให้เหมาะกับ mobile-first

### `NEX_MOBILE_QA_CHECKLIST_v1.md`
เช็กลิสต์ก่อนอนุมัติหน้าใหม่

### `NEX_AGENT_IMPLEMENTATION_PROTOCOL_v2.md`
กติกาการทำงานของ agent:
- page-by-page only
- new route first
- no direct overwrite
- respect page-specific override

### `NEX_PAGE_BRIEF_TEMPLATE.md`
แม่แบบกำหนดโจทย์รายหน้า

### `NEX_PAGE_DECISION_LOG.md`
บันทึก exception / owner-approved decision ของแต่ละหน้า

---

## 4) Archive / Deprecated / Non-Primary Documents

### `NEX_COLOR_STANDARD_V1.md`
Status: Deprecated / Archive Reference  
เหตุผล:
- ถูกแทนที่โดย `NEX_COLOR_SYSTEM_V2.md`
- หากขัดกัน ให้ยึด `NEX_COLOR_SYSTEM_V2.md`

### `NEX_SOLUTION_BLUEPRINT_REV0.md`
Status: Concept / Blueprint / Background  
เหตุผล:
- ใช้สำหรับ product vision, history, business framing
- ไม่ใช่ active visual implementation standard
- หากมี color/visual direction ขัดกับชุด active ให้ยึดชุด active เสมอ

---

## 5) Required Reading Order

### For strategy / understanding
1. `NEX_MASTER_STANDARD_INDEX.md`
2. `NEX_UX_UI_STANDARD_V2.md`
3. `NEX_BRAND_GUIDELINE_V2.md`
4. `NEX_COLOR_SYSTEM_V2.md`
5. `NEX_UI_RULES_V1.md`
6. `NEX_TAILWIND_TOKENS_V2.md`

### For implementation
7. `NEX_MOBILE_WEB_STANDARD_v1.md`
8. `NEX_PAGE_TYPE_STANDARD_v1.md`
9. `NEX_COMPONENT_STANDARD_v1.md`
10. `NEX_CONTENT_DENSITY_STANDARD_v1.md`
11. `NEX_MOBILE_QA_CHECKLIST_v1.md`
12. `NEX_AGENT_IMPLEMENTATION_PROTOCOL_v2.md`

### For page-specific work
13. relevant page brief
14. relevant page decision log

---

## 6) Authority Order
If documents conflict, use this order:

1. explicit owner instruction in current task
2. approved page-specific brief
3. approved page-specific decision log
4. `NEX_AGENT_IMPLEMENTATION_PROTOCOL_v2.md`
5. `NEX_PAGE_TYPE_STANDARD_v1.md`
6. `NEX_UX_UI_STANDARD_V2.md`
7. `NEX_COMPONENT_STANDARD_v1.md`
8. `NEX_MOBILE_WEB_STANDARD_v1.md`
9. `NEX_COLOR_SYSTEM_V2.md`
10. `NEX_TAILWIND_TOKENS_V2.md`
11. `NEX_BRAND_GUIDELINE_V2.md`
12. `NEX_UI_RULES_V1.md`
13. archive / deprecated / concept documents

Important:
- page-specific approved decisions override global standard for that page
- archive documents must never be used as primary implementation guidance

---

## 7) Mobile-First Policy
สำหรับหน้าใหม่ทุกหน้า:
- เริ่มจาก mobile layout ก่อน
- ออกแบบตาม page type ก่อน
- ใช้ soft blue / light public base เป็นค่าเริ่มต้นสำหรับ public pages
- อนุญาต navy-heavy ได้ใน public gateway เมื่อ hierarchy ยังชัด
- logged-in dashboard ใช้ branded/darker section ได้ตามบทบาท แต่ไม่ควรทึบทั้งหน้าแบบ flat grid

---

## 8) Page-by-Page Implementation Policy
- ทำเฉพาะหน้าที่ถูกสั่ง
- ห้ามขยาย scope ไปหน้าอื่นเอง
- ห้ามแก้ route เดิมโดยตรง
- ต้องสร้าง URL ใหม่ก่อนเพื่อทดสอบ
- QA ผ่านแล้วค่อยเสนอ replace route เดิม

---

## 9) Owner Manual Adjustment Policy
ถ้า owner ปรับของจริงเอง:
- อย่า revert อัตโนมัติ
- ต้องเช็ก page brief และ decision log ก่อน
- ถ้ายังไม่ได้ sync กลับเข้า global standard ให้ถือเป็น page-specific override ชั่วคราว
- หาก pattern นี้เกิดซ้ำหลายหน้า ค่อยพิจารณายกกลับเข้า standard กลาง

---

## 10) Active / Draft / Archive Policy
### Active
ใช้งานจริงและอ้างอิงได้โดยตรง

### Draft
อยู่ระหว่างปรับปรุง แต่ยังไม่ใช่ source หลักจนกว่าจะประกาศ

### Archive / Deprecated
เก็บไว้เพื่ออ้างอิงย้อนหลังเท่านั้น  
ห้ามใช้เป็น source หลักของการ implement ใหม่

---

## 11) Required Output from Agent
ก่อนขออนุมัติ replace route เดิม agent ควรส่งอย่างน้อย:
- target page
- existing route
- new route
- page type
- mobile-first summary
- standards used
- page-specific decisions followed
- in-scope / out-of-scope
- QA result
- unresolved conflicts if any

---

## 12) Short Summary
ให้ใช้ชุดเอกสารนี้แบบนี้:
- ใช้ `NEX_UX_UI_STANDARD_V2.md` เป็น umbrella
- ใช้ `NEX_COLOR_SYSTEM_V2.md` เป็น source หลักด้านสี
- ใช้ `NEX_MOBILE_WEB_STANDARD_v1.md` + `NEX_PAGE_TYPE_STANDARD_v1.md` เป็นแกน mobile-first implementation
- ใช้ `NEX_AGENT_IMPLEMENTATION_PROTOCOL_v2.md` คุมวิธีทำงาน
- ใช้ `NEX_PAGE_BRIEF_TEMPLATE.md` + `NEX_PAGE_DECISION_LOG.md` คุมรายหน้า
- อย่าใช้เอกสาร archive/concept เป็นมาตรฐาน build โดยตรง
