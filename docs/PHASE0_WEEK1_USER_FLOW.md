# Phase 0 Week 1.2: User Flow Definition

## 📋 Overview
กำหนดเส้นทางการใช้งานผู้ใช้ (User Flow) สำหรับ NEX Solution MVP

---

## 👤 User Personas

### 1. Business Owner (เจ้าของธุรกิจ)
- **Goal**: ต้องการลูกค้าเพิ่ม แต่ไม่มีเวลาทำระบบ
- **Tech Level**: ปานกลาง
- **Pain Point**: ไม่มีทีมเทคนิค, ต้องการผลลัพธ์เร็ว

### 2. Marketing Admin (แอดมินการตลาด)
- **Goal**: ทำโพสต์/ฟอร์ม/หน้าโปรโมตหลายอย่าง ไม่ทัน
- **Tech Level**: สูง
- **Pain Point**: ต้องทำหลายอย่าง, ต้องการเครื่องมือที่เร็ว

### 3. Sales Team (ทีมขาย)
- **Goal**: ต้องการลิงก์/QR/หน้าแนะนำสินค้าใช้ง่าย
- **Tech Level**: ปานกลาง-ต่ำ
- **Pain Point**: ต้องการแชร์ง่าย, ติดตามผลได้

---

## 🔄 Core User Flows

### Flow 1: Create Landing Page with Form

```
Step 1: Login/Register
├─ User เข้าสู่ระบบ
├─ Redirect to Dashboard
└─ See "Create Landing Page" button

Step 2: Create Landing Page
├─ Click "Create Landing Page"
├─ Enter Page Name
├─ Choose Template (optional)
├─ Redirect to Page Builder
└─ See empty page with "+ Add Block" button

Step 3: Build Page
├─ Add Hero Block
│  ├─ Enter Title, Subtitle
│  ├─ Add CTA Button
│  └─ Upload Background Image (optional)
├─ Add Text Block
│  └─ Enter Content
├─ Add Image Block
│  └─ Upload Image
├─ Add CTA Button Block
│  └─ Enter Button Text & Link
└─ Reorder Blocks (Drag & Drop)

Step 4: Add Form to Page
├─ Create Form (or select existing)
│  ├─ Enter Form Name
│  ├─ Add Fields (Text, Email, Phone, etc.)
│  ├─ Set Required Fields
│  └─ Save Form
├─ Add Form Block to Landing Page
│  └─ Select Form to embed
└─ Configure Thank You Message

Step 5: Configure SEO
├─ Enter Page Title
├─ Enter Meta Description
├─ Enter Keywords (optional)
└─ Preview Meta Tags

Step 6: Publish
├─ Click "Publish" button
├─ System generates Public URL
├─ Show QR Code (optional)
└─ Copy URL/QR to share

Step 7: Share & Track
├─ Share URL/QR via Social Media, Print, etc.
├─ Visitors view Landing Page
├─ Visitors fill Form
└─ System tracks Views & Submissions
```

---

### Flow 2: Create Form Standalone

```
Step 1: Create Form
├─ Click "Create Form" in Dashboard
├─ Enter Form Name
└─ Redirect to Form Builder

Step 2: Add Fields
├─ Add Text Field
│  ├─ Enter Label
│  ├─ Set Placeholder
│  └─ Set Required (Yes/No)
├─ Add Email Field
│  ├─ Enter Label
│  └─ Set Required (Yes/No)
├─ Add Phone Field
│  ├─ Enter Label
│  └─ Set Required (Yes/No)
├─ Add Dropdown Field
│  ├─ Enter Label
│  ├─ Add Options
│  └─ Set Required (Yes/No)
└─ Add Textarea Field
   ├─ Enter Label
   └─ Set Required (Yes/No)

Step 3: Configure Form
├─ Set Thank You Message
├─ Set Redirect URL (optional)
└─ Enable Auto Tag Source

Step 4: Save & Get Link
├─ Click "Save Form"
├─ System generates Form URL
├─ Show QR Code (optional)
└─ Copy URL/QR to share

Step 5: View Submissions
├─ Go to Dashboard → Forms
├─ Click on Form
├─ See Submission List
└─ Export CSV
```

---

### Flow 3: Create QR Code

```
Step 1: Create QR Code
├─ Click "Create QR Code" in Dashboard
└─ Choose QR Type:
   ├─ For Landing Page
   ├─ For Form
   └─ For External Link

Step 2: Configure QR
├─ If Landing Page: Select Page
├─ If Form: Select Form
├─ If External Link: Enter URL
└─ Set QR Size (Small/Medium/Large)

Step 3: Generate & Download
├─ Click "Generate QR"
├─ Preview QR Code
├─ Download PNG/SVG
└─ Save to Dashboard (optional)

Step 4: Use QR Code
├─ Print QR Code
├─ Use in Digital Marketing
└─ Track Scans (Phase 2+)
```

---

### Flow 4: Visitor Journey (Landing Page → Form Submission)

```
Step 1: Visitor Arrives
├─ Visitor clicks link or scans QR
├─ System tracks View (UTM, Referrer)
└─ Landing Page loads

Step 2: Visitor Browses
├─ Visitor scrolls through page
├─ Sees Hero, Content, Images
└─ Reaches Form section

Step 3: Visitor Fills Form
├─ Visitor enters information
├─ System validates required fields
└─ Visitor clicks "Submit"

Step 4: Submission Processed
├─ System saves submission
├─ System tags source (UTM, Referrer)
├─ Show Thank You Message
└─ Redirect (if configured)

Step 5: Owner Notified (Optional)
├─ System sends notification (Phase 2+)
└─ Owner sees new submission in Dashboard
```

---

### Flow 5: View Analytics & Leads

```
Step 1: Access Dashboard
├─ User logs in
└─ Redirect to Dashboard

Step 2: View Overview
├─ See Total Landing Pages
├─ See Total Forms
├─ See Total QR Codes
├─ See Total Leads
└─ See Recent Activity

Step 3: View Landing Page Stats
├─ Click on Landing Page
├─ See View Count
├─ See Form Submissions (if has form)
└─ See Performance Chart (Phase 2+)

Step 4: View Form Submissions
├─ Click on Form
├─ See Submission List
│  ├─ Name, Email, Phone
│  ├─ Submission Date
│  ├─ Source (UTM, Referrer)
│  └─ View Details
└─ Export CSV

Step 5: Export Data
├─ Click "Export CSV"
├─ Download file
└─ Use in CRM/Spreadsheet
```

---

## 🎯 Key User Actions

### Primary Actions (ทำบ่อย):
1. **Create Landing Page** - สร้างหน้าโปรโมต
2. **Add Form to Page** - ฝังฟอร์มในหน้า
3. **Publish Page** - เผยแพร่หน้า
4. **View Leads** - ดูข้อมูลลูกค้า
5. **Export CSV** - ดาวน์โหลดข้อมูล

### Secondary Actions (ทำบ้าง):
1. **Create Standalone Form** - สร้างฟอร์มแยก
2. **Create QR Code** - สร้าง QR Code
3. **Edit Page** - แก้ไขหน้า
4. **Unpublish Page** - ปิดหน้า

### Rare Actions (ทำไม่บ่อย):
1. **Delete Page/Form** - ลบหน้า/ฟอร์ม
2. **Configure SEO** - ตั้งค่า SEO
3. **View Analytics** - ดูสถิติ

---

## 📱 Device Support

### Desktop (Primary)
- Full Page Builder
- All Features Available
- Best Experience

### Tablet (Secondary)
- Page Builder (Simplified)
- View Dashboard
- Limited Editing

### Mobile (View Only)
- View Dashboard
- View Submissions
- View Analytics
- **No Page Builder** (Phase 2+)

---

## 🔐 Access Control

### Public Access:
- View Published Landing Pages
- Submit Forms
- View Public QR Codes

### Authenticated Access:
- Create/Edit Landing Pages
- Create/Edit Forms
- Create QR Codes
- View Analytics
- Export Data

### Admin Access:
- All User Features
- User Management
- System Settings
- Advanced Analytics

---

## 📝 Notes
- Flow เน้นความง่ายและเร็ว
- ลดขั้นตอนที่ไม่จำเป็น
- ให้ Feedback ชัดเจนทุกขั้นตอน
- Support Keyboard Shortcuts (Phase 2+)

---

**Status**: ✅ Completed
**Date**: 2026-03-05
**Next**: Week 1.3 - Permission Model
