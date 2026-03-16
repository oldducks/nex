# NEX Color Standard v1

เอกสารมาตรฐานสีสำหรับเว็บไซต์ **nexsolution.cloud**  
เวอร์ชันนี้ใช้เป็น 기준กลางสำหรับทีมออกแบบและทีมพัฒนา เพื่อให้ทุกหน้าของเว็บไซต์มีทิศทางเดียวกัน สม่ำเสมอ และขยายต่อได้ง่าย

---

## 1) เป้าหมายของเอกสาร

เอกสารนี้ใช้เพื่อกำหนดมาตรฐานด้านสีของแบรนด์ NEX ให้สามารถนำไปใช้ได้เหมือนกันทุกหน้า ทั้งในงานออกแบบ UX/UI, landing page, dashboard, component library และงานพัฒนา front-end

เป้าหมายหลักคือ:
- ทำให้ทุกหน้าของเว็บใช้ภาษา visual เดียวกัน
- ลดปัญหาการใช้สีไม่สม่ำเสมอ
- ทำให้ designer และ developer อ้างอิงชุดเดียวกัน
- รองรับการขยายไปสู่ design system ในอนาคต

---

## 2) Brand Color Direction

แนวทางสีของ NEX ต้องสะท้อนภาพลักษณ์ดังนี้:
- Premium
- Trustworthy
- Corporate Tech
- Modern Business Platform
- Clear and Action-Oriented

โครงสร้างสัดส่วนสีหลัก:
- **Primary Blue = 70%**
- **Accent Orange = 20%**
- **Support Green = 10%**

---

## 3) Core Brand Palette

### 3.1 Primary Brand
- **Primary / Brand Main:** `#050579`
- **Primary Hover:** `#07079A`
- **Primary Dark:** `#03034F`
- **Primary Soft Background:** `#EEF0FF`

การใช้งาน:
- Navbar
- Headline สำคัญ
- Brand section
- Primary button บางกรณี
- Link สำคัญ
- Key visual elements

---

### 3.2 Accent Orange
- **Accent Orange Main:** `#F97316`
- **Accent Orange Hover:** `#EA580C`
- **Accent Orange Soft:** `#FFF7ED`

การใช้งาน:
- Primary CTA
- Highlight button
- Promotional badge
- Conversion-focused element
- จุดที่ต้องการดึงสายตา

---

### 3.3 Support Green
- **Support Green Main:** `#84CC16`
- **Support Green Hover:** `#65A30D`
- **Support Green Soft:** `#F7FEE7`

การใช้งาน:
- Success state
- Positive status
- Growth metric
- Approved / completed status
- Accent รองใน infographic หรือ data block

> หมายเหตุ: สีเขียวนี้ไม่ควรใช้เป็นสีเด่นหลักของหน้า แต่ใช้เพื่อสนับสนุนข้อมูลเชิงบวกเท่านั้น

---

## 4) Neutral Palette

### 4.1 Background and Surface
- **Background Main:** `#F8FAFC`
- **Surface / Card:** `#FFFFFF`
- **Surface Alt:** `#F1F5F9`

### 4.2 Text Colors
- **Text Primary:** `#0F172A`
- **Text Secondary:** `#475569`
- **Text Muted:** `#94A3B8`
- **Text on Dark:** `#FFFFFF`

### 4.3 Border Colors
- **Border Default:** `#E2E8F0`
- **Border Strong:** `#CBD5E1`

---

## 5) Semantic Colors

- **Success:** `#16A34A`
- **Warning:** `#F59E0B`
- **Error:** `#DC2626`
- **Info:** `#0EA5E9`

การใช้งาน:
- form validation
- alert
- toast
- status label
- dashboard indicator

---

## 6) Color Usage Rules

### 6.1 สัดส่วนการใช้สี

ให้ยึดหลักโดยประมาณดังนี้:
- **70%** = Primary brand tone / neutral structure
- **20%** = Accent orange สำหรับ action
- **10%** = Support green สำหรับ positive support

### 6.2 หลักการใช้งาน

#### ใช้ `#050579` เมื่อ:
- ต้องการสื่อความน่าเชื่อถือ
- เป็นส่วนของ brand identity
- เป็น headline หรือ key section
- ใช้กับ navbar หรือ footer หลัก

#### ใช้ `#F97316` เมื่อ:
- ต้องการให้ผู้ใช้กด action
- ใช้กับ CTA button
- ใช้เป็น highlight สำคัญ
- ใช้กับ active state บางจุด

#### ใช้ `#84CC16` เมื่อ:
- แสดง success
- แสดงผลลัพธ์เชิงบวก
- เน้นตัวเลข growth, conversion, completed
- ใช้เป็น badge สนับสนุน

---

## 7) UI Application Standard

### 7.1 Buttons

#### Primary Button
- Background: `#F97316`
- Text: `#FFFFFF`
- Hover: `#EA580C`

#### Secondary Button
- Background: `#050579`
- Text: `#FFFFFF`
- Hover: `#07079A`

#### Outline Button
- Border: `#050579`
- Text: `#050579`
- Hover Background: `#EEF0FF`

---

### 7.2 Links
- Default: `#050579`
- Hover: `#07079A`
- Active / Highlighted CTA link: `#F97316`

---

### 7.3 Cards
- Card Background: `#FFFFFF`
- Border: `#E2E8F0`
- Title: `#0F172A`
- Supporting text: `#475569`
- Highlight badge: `#F97316` หรือ `#84CC16` ตามบริบท

---

### 7.4 Sections

#### Hero Section
- Background: `#FFFFFF` หรือ gradient จาก `#EEF0FF`
- Heading: `#050579`
- Primary CTA: `#F97316`
- Secondary CTA: `#050579`

#### Trust / Brand Section
- ใช้ `#050579` เป็นแกนหลัก
- พื้นหลังอาจใช้ `#EEF0FF` หรือขาว

#### Metrics / Success Section
- ใช้เขียว `#84CC16` สำหรับตัวเลขหรือ status เชิงบวก
- ใช้อย่างจำกัด ไม่แทน primary brand

---

## 8) Do / Don't

### Do
- ใช้ `#050579` เป็น brand anchor ทุกหน้า
- ใช้ `#F97316` กับ CTA หลักเพื่อสร้าง conversion
- ใช้ `#84CC16` เฉพาะจุดที่เป็น positive support
- ใช้ neutral palette คุมความเรียบร้อยและอ่านง่าย
- รักษาความสม่ำเสมอของสีปุ่ม, link, section และ state

### Don't
- อย่าใช้เขียวเป็นสีหลักของหน้า
- อย่าใช้ส้มกระจายหลายจุดจน CTA แข่งกันเอง
- อย่าใช้ primary blue เป็นพื้นหลังเข้มทุก section เพราะจะทำให้เว็บหนักเกินไป
- อย่าใช้หลายเฉดของน้ำเงินหรือส้มแบบไม่มีมาตรฐานกลาง
- อย่าให้แต่ละหน้าเลือกสีเองนอก system

---

## 9) Recommended Tailwind Tokens

```js
colors: {
  brand: {
    DEFAULT: '#050579',
    hover: '#07079A',
    dark: '#03034F',
    soft: '#EEF0FF',
  },
  accent: {
    orange: '#F97316',
    'orange-hover': '#EA580C',
    'orange-soft': '#FFF7ED',
    green: '#84CC16',
    'green-hover': '#65A30D',
    'green-soft': '#F7FEE7',
  },
  neutral: {
    bg: '#F8FAFC',
    surface: '#FFFFFF',
    'surface-alt': '#F1F5F9',
    text: '#0F172A',
    'text-secondary': '#475569',
    muted: '#94A3B8',
    border: '#E2E8F0',
    'border-strong': '#CBD5E1',
  },
  semantic: {
    success: '#16A34A',
    warning: '#F59E0B',
    error: '#DC2626',
    info: '#0EA5E9',
  },
}
```

---

## 10) เวอร์ชันแนะนำสำหรับใช้งานจริง

### Brand Core
- `#050579`

### CTA Core
- `#F97316`

### Support Positive
- `#84CC16`

### Background
- `#F8FAFC`
- `#FFFFFF`

### Text
- `#0F172A`
- `#475569`

### Border
- `#E2E8F0`

---

## 11) สรุปการนำไปใช้

NEX ควรใช้สีน้ำเงินเข้มเป็นแกนแบรนด์ เพื่อสร้างความรู้สึกน่าเชื่อถือและจริงจังในฐานะแพลตฟอร์มธุรกิจ  
สีส้มทำหน้าที่เป็นแรงขับด้าน conversion และ action  
สีเขียวทำหน้าที่สนับสนุนผลลัพธ์เชิงบวก ไม่ใช่เป็นแกนหลักของ visual system

ดังนั้นมาตรฐานสีของ NEX ในเวอร์ชันนี้คือ:
- **Primary:** `#050579`
- **CTA Accent:** `#F97316`
- **Support Green:** `#84CC16`

เอกสารนี้ควรใช้เป็นฐานสำหรับการต่อยอดไปยัง:
- Design System v1
- Component Library
- Landing Page Guideline
- Dashboard UI Standard
- Front-end Token System
