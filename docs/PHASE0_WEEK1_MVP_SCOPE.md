# Phase 0 Week 1.1: MVP Scope Definition

## 📋 Overview
กำหนดขอบเขต MVP (Minimum Viable Product) สำหรับ NEX Solution ตาม Blueprint

**Goal**: สร้าง Flow ครบ: Ad/QR → NEX Page → NEX Form → Lead

---

## 🎯 MVP Modules (โมดูลหลักที่ต้องทำใน MVP)

### 1. NEX Page (Landing Page Builder) - **CORE FLAGSHIP**
**Priority**: ⭐⭐⭐ (Highest)

#### MVP Features (ต้องมี):
- ✅ สร้างหน้า Landing Page ใหม่
- ✅ Page Builder แบบ Block-based (Drag & Drop)
- ✅ Basic Blocks: Hero, Text, Image, CTA Button
- ✅ Publish/Unpublish หน้า
- ✅ Public URL Generation
- ✅ Responsive Design (Desktop + Mobile)
- ✅ Preview Mode
- ✅ SEO Basic (Title, Description, Meta Tags)

#### Phase 2+ Features (ตัดออกจาก MVP):
- ❌ AI-assisted section generation
- ❌ AI copy variants (A/B testing)
- ❌ Advanced templates (ทำแค่ 3-5 templates พื้นฐาน)
- ❌ Scheduled visibility (ทำแค่ on/off)
- ❌ Advanced analytics (ทำแค่ view count)

---

### 2. NEX Form (Lead Form Builder)
**Priority**: ⭐⭐⭐ (Highest)

#### MVP Features (ต้องมี):
- ✅ สร้างฟอร์มใหม่
- ✅ Field Types: Text, Email, Phone, Dropdown, Textarea
- ✅ Required Field Validation
- ✅ Form Embedding ใน Landing Page
- ✅ Form Submission Storage
- ✅ Submission List View
- ✅ Export CSV
- ✅ Thank You Message
- ✅ Auto Tag Source (UTM, Referrer)

#### Phase 2+ Features (ตัดออกจาก MVP):
- ❌ Conditional Logic
- ❌ AI summarize submission
- ❌ Auto push to CRM/Sheet/LINE
- ❌ Multi-step Forms
- ❌ File Upload Field

---

### 3. NEX Code (QR Generator)
**Priority**: ⭐⭐ (High)

#### MVP Features (ต้องมี):
- ✅ Generate Static QR Code
- ✅ QR for Landing Page
- ✅ QR for Form
- ✅ QR for External Link
- ✅ Download PNG/SVG
- ✅ Save QR to Dashboard
- ✅ QR List Management

#### Phase 2+ Features (ตัดออกจาก MVP):
- ❌ Dynamic QR (เปลี่ยนปลายทางได้)
- ❌ Campaign QR Tracking
- ❌ Bulk QR Generation
- ❌ QR Analytics

---

### 4. NEX Create Lite (Creative Builder)
**Priority**: ⭐ (Medium - Optional for MVP)

#### MVP Features (ถ้ามีเวลา):
- ✅ 5-10 Basic Templates
- ✅ Replace Text/Image
- ✅ Export Image (PNG/JPG)
- ✅ Basic Image Editor (Crop, Resize)

#### Phase 2+ Features (ตัดออกจาก MVP):
- ❌ AI Image Generation
- ❌ AI Copy Suggestion (อาจทำแค่ basic)
- ❌ Auto Resize (FB/IG/TikTok)
- ❌ Brand Kit
- ❌ Advanced Editor

---

## 🔄 Core Flow (Flow หลักที่ต้องครบ)

### Flow 1: Landing Page → Form → Lead
```
1. User สร้าง Landing Page
2. User สร้าง Form
3. User ฝัง Form ใน Landing Page
4. User Publish Landing Page
5. Visitor เข้าหน้า Landing Page
6. Visitor กรอก Form
7. System บันทึก Lead
8. User ดู Leads ใน Dashboard
```

### Flow 2: QR Code → Landing Page/Form
```
1. User สร้าง QR Code สำหรับ Landing Page หรือ Form
2. User Download QR Code
3. User แชร์ QR Code (Print, Digital)
4. Visitor สแกน QR Code
5. Visitor ไปที่ Landing Page หรือ Form
6. (ต่อด้วย Flow 1)
```

---

## 📊 Feature Matrix

| Module | MVP | Phase 2 | Phase 3 |
|--------|-----|---------|---------|
| **NEX Page** | Basic Builder, Publish, SEO | AI Features, Templates | Advanced Analytics |
| **NEX Form** | Basic Fields, Validation, Export | Conditional Logic, CRM | AI Summarize |
| **NEX Code** | Static QR, Download | Dynamic QR, Tracking | Bulk, Analytics |
| **NEX Create** | Basic Templates, Export | AI Generation | Full Editor |

---

## ✅ MVP Success Criteria

### Functional Requirements:
- [ ] User สามารถสร้าง Landing Page ได้ภายใน 10 นาที
- [ ] User สามารถสร้าง Form ได้ภายใน 5 นาที
- [ ] User สามารถสร้าง QR Code ได้ภายใน 2 นาที
- [ ] Form Submission ถูกบันทึกและแสดงใน Dashboard
- [ ] Landing Page แสดงผลได้ทั้ง Desktop และ Mobile

### Technical Requirements:
- [ ] Page Load Time < 3 seconds
- [ ] Form Submission Response < 1 second
- [ ] QR Generation < 500ms
- [ ] System Uptime > 99%

### Business Requirements:
- [ ] User สามารถสร้าง Flow ครบ: Ad → Landing → Form → Lead
- [ ] User สามารถ Export Leads เป็น CSV
- [ ] User สามารถ Track View Count พื้นฐาน

---

## 🚫 Out of Scope (ตัดออกจาก MVP)

### Features ที่ตัดออก:
1. **NEX Card** (Digital Business Card) - มีอยู่แล้วในระบบเดิม
2. **NEX Book** (Catalog) - มีอยู่แล้วในระบบเดิม
3. **Advanced AI Features** - ทำแค่ basic (ถ้ามีเวลา)
4. **CRM Integration** - Phase 2+
5. **Team Collaboration** - Phase 3+
6. **White-label** - Phase 3+
7. **Advanced Analytics** - Phase 2+
8. **Multi-language** - Phase 2+ (ทำแค่ TH/EN)

---

## 📝 Notes
- MVP เน้น "ขายได้จริงก่อน" - ต้องทำให้ Flow ครบก่อน
- ฟีเจอร์ที่ตัดออกสามารถเพิ่มใน Phase 2-3 ได้
- เน้นความเสถียรและใช้งานง่ายมากกว่าฟีเจอร์เยอะ

---

**Status**: ✅ Completed
**Date**: 2026-03-05
**Next**: Week 1.2 - Define User Flow
