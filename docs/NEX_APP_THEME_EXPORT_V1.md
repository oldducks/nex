# NEX App Theme Export v1

เอกสารนี้คือชุด theme สำหรับนำไปใช้กับแอปใหม่ให้หน้าตาอยู่ในระบบเดียวกับ NEX ปัจจุบัน โดยยึด `NEX_COLOR_SYSTEM_V2.md` เป็น source of truth หลัก

## 1) Canonical Brand Palette

### Brand
- Brand Navy: `#050579`
- Brand Navy Hover: `#07079A`
- Brand Navy Dark: `#03034F`

### Accent
- Primary CTA Orange: `#F97316`
- Primary CTA Orange Hover: `#EA580C`

### Support
- Support Green: `#84CC16`
- Support Green Hover: `#65A30D`

### Background and Surface
- Page Background: `#EEF0FF`
- Page Background Alt: `#F6F8FF`
- App/Home Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Surface Alt: `#E8ECFF`
- Surface Soft: `#EEF2FF`
- Surface Muted: `#FCFDFF`

### Border
- Border: `#D9E1F2`
- Border Light: `#E2E8F0`
- Border Strong: `#CBD5E1`
- Divider: `#C7D2E5`

### Text
- Text Primary: `#0F172A`
- Text Secondary: `#475569`
- Text Muted: `#64748B`
- Text On Dark: `#FFFFFF`

### Semantic
- Success: `#16A34A`
- Warning: `#F59E0B`
- Error: `#DC2626`
- Info: `#2563EB`

## 2) Usage Ratio

- Brand Navy: 70%
- Orange Accent: 20%
- Green Support: 10%

ใช้ navy เป็นแกนของ brand และ hierarchy, ใช้ orange เฉพาะ action สำคัญที่สุด, ใช้ green เฉพาะ success/positive/growth support

## 3) CSS Variables

```css
:root {
  --nex-brand: #050579;
  --nex-brand-hover: #07079A;
  --nex-brand-dark: #03034F;

  --nex-cta: #F97316;
  --nex-cta-hover: #EA580C;
  --nex-cta-soft: #FFF7ED;

  --nex-support: #84CC16;
  --nex-support-hover: #65A30D;
  --nex-support-soft: #F7FEE7;

  --nex-page-bg: #EEF0FF;
  --nex-page-bg-alt: #F6F8FF;
  --nex-app-bg: #F8FAFC;
  --nex-surface: #FFFFFF;
  --nex-surface-alt: #E8ECFF;
  --nex-surface-soft: #EEF2FF;
  --nex-surface-muted: #FCFDFF;

  --nex-border: #D9E1F2;
  --nex-border-light: #E2E8F0;
  --nex-border-strong: #CBD5E1;
  --nex-divider: #C7D2E5;

  --nex-text-primary: #0F172A;
  --nex-text-secondary: #475569;
  --nex-text-muted: #64748B;
  --nex-text-on-dark: #FFFFFF;

  --nex-success: #16A34A;
  --nex-warning: #F59E0B;
  --nex-error: #DC2626;
  --nex-info: #2563EB;
}
```

## 4) Tailwind Extend

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        nex: {
          brand: {
            DEFAULT: "#050579",
            hover: "#07079A",
            dark: "#03034F",
          },
          accent: {
            orange: "#F97316",
            orangeHover: "#EA580C",
            green: "#84CC16",
            greenHover: "#65A30D",
          },
          neutral: {
            bg: "#EEF0FF",
            bgAlt: "#F6F8FF",
            appBg: "#F8FAFC",
            surface: "#FFFFFF",
            surfaceAlt: "#E8ECFF",
            surfaceSoft: "#EEF2FF",
            surfaceMuted: "#FCFDFF",
            border: "#D9E1F2",
            borderLight: "#E2E8F0",
            borderStrong: "#CBD5E1",
            divider: "#C7D2E5",
          },
          text: {
            primary: "#0F172A",
            secondary: "#475569",
            muted: "#64748B",
            onDark: "#FFFFFF",
          },
          semantic: {
            success: "#16A34A",
            warning: "#F59E0B",
            error: "#DC2626",
            info: "#2563EB",
          },
        },
      },
    },
  },
};
```

## 5) Button Mapping

- Primary CTA: background `#F97316`, hover `#EA580C`, text `#FFFFFF`
- Secondary CTA: background `#050579`, hover `#07079A`, text `#FFFFFF`
- Outline CTA: border/text `#050579`, hover background `#E8ECFF`
- Success action/badge: background `#84CC16`, hover `#65A30D`

Rule: ใน 1 section ควรมี primary CTA สีส้มเด่นที่สุดเพียง 1 จุด

## 6) Layout Mapping

- Public page background: `#EEF0FF` หรือ `#F6F8FF`
- Dashboard/app background: `#F8FAFC`
- Card/form/input surface: `#FFFFFF`
- Brand panel/navbar: `#050579`
- Standard border: `#D9E1F2`
- Main heading/body text: `#0F172A`
- Secondary/helper text: `#475569` / `#64748B`

## 7) Typography

จากแอปปัจจุบัน:
- Body/UI font: `Prompt`
- Display/headline font: `Montserrat`
- Thai fallback: `Noto Sans Thai`, `Segoe UI`, `system-ui`, `sans-serif`

แนะนำ:
- ใช้ `Prompt` กับข้อความไทยและ UI ทั้งหมด
- ใช้ `Montserrat` เฉพาะ headline/brand/display ที่เป็นภาษาอังกฤษหรือ mixed brand text

## 8) Related Source Documents

อ่านตามลำดับนี้เมื่อนำ theme ไปใช้กับแอปใหม่:
1. `docs/NEX_MASTER_STANDARD_INDEX.md`
2. `docs/NEX_UX_UI_STANDARD_V2.md`
3. `docs/NEX_BRAND_GUIDELINE_V2.md`
4. `docs/NEX_COLOR_SYSTEM_V2.md`
5. `docs/NEX_TAILWIND_TOKENS_V2.md`
6. `docs/NEX_COMPONENT_STANDARD_v1.md`
7. `docs/NEX_MOBILE_WEB_STANDARD_v1.md`
8. `docs/NEX_MOBILE_QA_CHECKLIST_v1.md`

## 9) Important Note About Legacy Runtime Themes

`frontend/src/app/globals.css` ยังมี runtime themes หลายชุด เช่น light, dark, pastel, midnight และ brand-cog ซึ่งบางชุดใช้ cyan/gold จาก concept เดิม

สำหรับแอปใหม่ ให้ยึดชุด Brand System v2 ในเอกสารนี้ก่อนเสมอ เว้นแต่ owner ระบุชัดว่าต้องการธีมโลโก้แบบ midnight/cyan/gold

