# CONTROL2_V2 Prompt Template

ใช้ template นี้เป็นต้นแบบสำหรับสร้างหน้าใหม่ โดยอิง pattern จาก `https://nexsolution.cloud/manage/control2-v2`

---

## Prompt (Copy/Paste)

งานนี้ให้ทำเฉพาะ 1 หน้าเท่านั้น: `[PAGE_NAME]`

ก่อนเริ่ม:
1. อ่าน `docs/NEX_MASTER_STANDARD_INDEX.md`
2. อ่าน standards ตาม reading order
3. อ่าน page brief และ decision log ของหน้านี้ก่อน

ข้อกำหนดหลัก:
- Mobile-first ก่อน desktop
- ห้ามแก้ route เดิมโดยตรง
- ต้องสร้างหน้าใหม่บน test route ก่อน
- ห้ามขยาย scope ไปหน้าอื่น
- ห้าม hard-code สี/สไตล์นอกมาตรฐาน
- ถ้ามี page-specific approved decision ห้าม revert

ข้อมูลหน้านี้:
- Existing route: `[EXISTING_ROUTE]`
- New test route: `[NEW_TEST_ROUTE]`
- Page type: `[PAGE_TYPE]`
- Page objective: `[OBJECTIVE]`
- Primary CTA: `[PRIMARY_CTA]`

สิ่งที่ต้องส่งกลับก่อน build:
- page type
- page objective
- primary CTA
- mobile-first problem summary
- proposed mobile structure
- existing route
- new test route
- in-scope / out-of-scope

แนวทาง UI (อิง control2-v2):
1. Header card สรุปสถานะผู้ใช้/แผนสมาชิกแบบอ่านเร็ว
2. Primary CTA เด่น 1 จุดใน first viewport
3. เมนูรองแยกเป็นกลุ่ม (เช่น core / growth / settings)
4. เมนูที่ยังไม่ปลดล็อกต้องแสดงสถานะ Locked และกดไม่ได้
5. ปุ่ม utility สำคัญ (เช่น logout) วางท้ายหน้า
6. ใช้สีตาม NEX role เท่านั้น (navy/orange/neutral)

กติกา feature lock:
- อ่าน `role`, `subscription_tier`, `feature_config` จาก `/profile/me`
- ถ้า admin หรือ premium = ใช้ได้ทั้งหมด
- user ทั่วไป = เช็กตาม `feature_config`
- ถ้าไม่มี config ให้ fallback ตามกติกาหน้านั้น (เช่น profile-only)

หลัง build:
1. รัน lint เฉพาะไฟล์ที่แก้
2. deploy เฉพาะ service ที่เกี่ยวข้อง
3. ส่ง QA summary ตาม `docs/NEX_MOBILE_QA_CHECKLIST_v1.md`
4. รายงานเฉพาะสิ่งที่เปลี่ยนในหน้านี้
5. ระบุสิ่งที่ยังต้องขอ approval ก่อน replace ของเดิม

---

## Quick Fill Example

- `[PAGE_NAME]`: Manage Leads Hub
- `[EXISTING_ROUTE]`: `/manage/leads`
- `[NEW_TEST_ROUTE]`: `/manage/leads-v2`
- `[PAGE_TYPE]`: Dashboard / Control Hub
- `[OBJECTIVE]`: ให้ผู้ใช้ดูและจัดการ lead ได้เร็วบนมือถือ
- `[PRIMARY_CTA]`: เพิ่มลีดใหม่
