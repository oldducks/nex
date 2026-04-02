# NEX_PAGE_DECISION_LOG.md

Purpose: บันทึกการตัดสินใจเฉพาะหน้า เพื่อป้องกันไม่ให้ agent หรือทีมงานยึด global standard แล้วแก้กลับสิ่งที่ได้รับการอนุมัติแล้ว

---

## วิธีใช้

ใช้ไฟล์นี้เมื่อ:
- มีการปรับหน้าแล้ว แต่ยังไม่ได้แก้ global standard
- มีข้อยกเว้นเฉพาะหน้าที่ต้องเก็บไว้
- owner ปรับหน้าเองแล้วต้องการให้รอบถัดไป agent ยึดตามของจริง
- มีการตัดสินใจด้าน UX/UI ที่เฉพาะเจาะจงกับหน้านั้น

หลักการ:
- 1 decision = 1 entry
- ใช้ภาษาสั้น ชัด ตรวจสอบได้
- ต้องระบุสถานะว่า approved หรือ draft
- หาก decision สำคัญมาก ควรสะท้อนกลับไปที่ page brief ของหน้านั้นด้วย

---

## Entry Template

### Decision ID
- ID:
- Date:
- Page Name:
- Route:
- Page Type:
- Status: Draft / Approved / Deprecated

### Context
- งานที่กำลังทำ:
- ปัญหาหรือเหตุผลที่ต้องตัดสินใจ:

### Decision
- สิ่งที่ตัดสินใจเปลี่ยน:
- สิ่งที่คงเดิม:
- สิ่งที่ห้าม agent เปลี่ยนกลับ:

### Reason
- เหตุผลเชิง UX/UI:
- เหตุผลเชิงธุรกิจ/การใช้งาน:
- เหตุผลเชิง mobile-first:

### Impact
- กระทบ component ใดบ้าง:
- กระทบเฉพาะหน้านี้ หรือหลายหน้า:
- ต้องอัปเดต standard กลางหรือไม่:

### Owner Approval
- Approved by:
- Approval note:

---

## Decision Entries

### Decision ID
- ID: SAMPLE-001
- Date: YYYY-MM-DD
- Page Name: Sample Page
- Route: /sample/page-v2
- Page Type: Marketing Landing
- Status: Approved

### Context
- งานที่กำลังทำ: ปรับหน้าให้เป็น mobile-first
- ปัญหาหรือเหตุผลที่ต้องตัดสินใจ: hero เดิมสูงเกินไปและ CTA ไปอยู่ลึกเกินจอแรกบนมือถือ

### Decision
- สิ่งที่ตัดสินใจเปลี่ยน: ลดความสูง hero และย้าย primary CTA ขึ้นมาใน first viewport
- สิ่งที่คงเดิม: theme, typography role, CTA text เดิม
- สิ่งที่ห้าม agent เปลี่ยนกลับ: ห้ามดัน CTA ลงไปหลัง section อื่นโดยอิง layout เดิม

### Reason
- เหตุผลเชิง UX/UI: ทำให้ผู้ใช้เข้าใจและกด action ได้เร็วขึ้น
- เหตุผลเชิงธุรกิจ/การใช้งาน: ช่วยลด friction ก่อนการเริ่มใช้งาน
- เหตุผลเชิง mobile-first: viewport มือถือมีพื้นที่จำกัด ต้อง prioritize CTA

### Impact
- กระทบ component ใดบ้าง: hero, button group, section spacing
- กระทบเฉพาะหน้านี้ หรือหลายหน้า: เฉพาะหน้านี้
- ต้องอัปเดต standard กลางหรือไม่: ไม่จำเป็นในตอนนี้

### Owner Approval
- Approved by: Owner
- Approval note: ใช้เป็นข้อยกเว้นเฉพาะหน้า
