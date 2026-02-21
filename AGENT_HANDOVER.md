# AGENT_HANDOVER - Digital Business Card & Catalog Platform

## 📌 Project Overview
แพลตฟอร์มสำหรับสร้าง **Digital Business Card**, **Interactive Digital Catalog** และ **Premium Landing Pages** ที่รองรับการจัดการแคมเปญการตลาดดิจิทัลครบจบในที่เดียว

- **Repository Directory**: `/root/33-name-card-Demo--and-antigravity`
- **Main URL**: [https://namecard.dpattown.com](https://namecard.dpattown.com)

---

## 🚀 Key Features & Implementation Status

### 1. Digital Business Card (VCF & Profile)
- **Random URL Prefix**: ความปลอดภัยระดับสูงด้วย URL เฉพาะตัว
- **Real-time Editor**: ปรับแต่งสี ฟอนต์ และเลย์เอาท์ได้ทันที
- **Lead Generation**: แบบฟอร์มเก็บข้อมูลลูกค้า (ชื่อ, อีเมล, อาชีพ)

### 2. Interactive Digital Catalog
- **Self-Production System**: ระบบผลิตเนื้อหาแคตตาล็อกออนไลน์ ใช้งานง่าย
- **Interactive Links**: ใส่ลิงก์ไปยังเว็บไซต์, แบบฟอร์มสั่งซื้อ (Order Form) ได้
- **Design Tools**: Industry Templates (Jewelry, Beauty) และ Custom Stickers
- **iCode (QR Code)**: ระบบแชร์ผ่าน QR Code ที่สแกนแล้วเข้าถึงได้ทันที

### 3. Campaign & Landing Pages (NEW) 🌟
- **Landing Page Manager**: ระบบจัดการหน้าเซลล์เพจแบบครบวงจร สร้างได้ไม่จำกัดจำนวน
- **Drag & Drop Editor**: แก้ไขเนื้อหาแบบ Block Based (Text, Image, Video, Button, Form)
- **Preview Mode**: จำลองการแสดงผลทั้งแบบ Desktop และ Mobile แบบ Real-time
- **Visibility Control**: เปิด-ปิดการมองเห็นหน้าแคมเปญได้ทันที (Scheduled/Timed Promotions)
- **Automatic QR Code**: ระบบสร้าง QR Code แยกรายหน้าแคมเปญอัตโนมัติ
- **Social Sharing**: ปุ่มแชร์ไปยัง Facebook, Twitter เพื่อเพิ่มการเข้าถึงกลุ่มเป้าหมาย

### 4. Analytics & Control Center
- **Premium Dashboard**: หน้า Command Center สรุปสถิติและสถานะสมาชิก
- **Activity Snap**: ติดตามยอดผู้ชมโปรไฟล์และรายการ Leads ล่าสุด

### 5. Demo Accounts & Global Theme (NEW) 🎨
- **Demo Users**: `demo3@example.com` (Consultant) and `demo4@example.com` (Artist) with pre-populated bilingual data (TH/EN).
- **Global Theme System**: ระบบเปลี่ยนธีมสี (Light/Dark/Pastel/Midnight) ที่มีผลทั้งเว็บไซต์ รวมถึงหน้า Profile ของผู้ใช้
- **Bilingual Support**: รองรับการแสดงผลภาษาไทยและอังกฤษในหน้า Profile และ Catalog

---

## 🔧 Recent Updates

### 2026-02-07: Theme Persistence Fix
**ปัญหา**: Theme ที่เลือกไว้ที่หน้าแรกไม่ follow ไปหน้าอื่น (เกิด flash ของ default theme)

**สาเหตุ**: `data-theme` attribute บน `<html>` ไม่ถูกตั้งจนกว่า React จะ hydrate

**การแก้ไข**:
1. **`frontend/src/app/layout.tsx`**: เพิ่ม inline script ที่ทำงานทันทีก่อน React hydrate
   ```tsx
   const themeScript = `
   (function() {
     try {
       const theme = localStorage.getItem('theme') || 'dark';
       document.documentElement.setAttribute('data-theme', theme);
     } catch (e) {}
   })();
   `;
   ```
   และเพิ่ม `suppressHydrationWarning` บน `<html>` tag

2. **`frontend/src/components/ThemeProvider.tsx`**: แก้ไขให้ `ThemeContext.Provider` wrap children เสมอ แม้ยังไม่ mounted เพื่อให้ `useTheme()` hook ทำงานได้ถูกต้องตอน prerender

**ผลลัพธ์**: Theme จะ persist ข้ามหน้าและไม่มี flash ของ default theme อีกต่อไป

### 2026-02-07: Default Language Change
**การแก้ไข**: เปลี่ยน default language ของหน้าแรกจาก English เป็น Thai

**ไฟล์ที่แก้ไข**: `frontend/src/app/page.tsx`
```tsx
// Before
const [lang, setLang] = useState<Language>('en');

// After
const [lang, setLang] = useState<Language>('th');
```

### 2026-02-07: Video Upload Feature (NEW)
**Feature ใหม่**: เพิ่มความสามารถอัพโหลดวิดีโอพร้อมตั้งค่า Autoplay และ Link ใน 3 เมนู

**ความสามารถ**:
- อัพโหลดวิดีโอได้ (MP4, WebM, OGG สูงสุด 100MB)
- ตั้งค่าเล่นอัตโนมัติ (Autoplay) เมื่อเปิดหน้า
- แนบลิงก์ URL เมื่อกดที่วิดีโอ
- เปิด/ปิด การแสดงวิดีโอได้

**ไฟล์ที่แก้ไข**:

**Backend:**
- `backend/src/uploads/uploads.controller.ts`: เพิ่ม `POST /uploads/video` endpoint
- `backend/src/profiles/entities/profile.entity.ts`: เพิ่ม `video_config` field
- `backend/src/profiles/types/profile.types.ts`: เพิ่ม `VideoConfig` interface
- `backend/src/catalogs/entities/catalog.entity.ts`: เพิ่ม `video_config` field

**Frontend:**
- `frontend/src/components/VideoUpload.tsx`: Component ใหม่สำหรับอัพโหลดและตั้งค่าวิดีโอ
- `frontend/src/app/manage/profile/page.tsx`: เพิ่ม Video section
- `frontend/src/app/manage/catalogs/[id]/page.tsx`: เพิ่ม Video section ใน Settings modal
- `frontend/src/app/manage/landing-pages/[id]/page.tsx`: อัพเกรด Video block ให้รองรับ Upload + Settings

**VideoConfig Interface:**
```typescript
interface VideoConfig {
    url: string;           // URL ของวิดีโอ
    autoplay: boolean;     // เล่นอัตโนมัติ
    link_url?: string;     // URL ปลายทางเมื่อกด
    link_enabled: boolean; // เปิดใช้งานลิงก์
    enabled: boolean;      // เปิดแสดงวิดีโอ
}
```

### 2026-02-08: Product Image Upload Feature (NEW)
**Feature ใหม่**: เพิ่มความสามารถอัพโหลดรูปสินค้าในหน้าเพิ่มสินค้า

**ความสามารถ**:
- อัพโหลดรูปได้หลายรูปพร้อมกัน (สูงสุด 5 รูปต่อสินค้า)
- Drag & Drop หรือคลิกเลือกไฟล์
- แสดง Preview รูปที่อัพโหลดแล้ว
- ลบรูปแต่ละรูปได้
- รองรับ JPG, PNG, GIF, WebP (สูงสุด 5MB ต่อไฟล์)
- รูปแรกจะแสดงเป็น "หลัก" ในหน้า Catalog

**ไฟล์ที่เพิ่ม/แก้ไข**:
- `frontend/src/components/ProductImageUpload.tsx`: Component ใหม่สำหรับอัพโหลดรูปสินค้า
- `frontend/src/app/manage/catalogs/[id]/page.tsx`: อัพเดท Product Modal ให้ใช้ ProductImageUpload แทน URL input

**ProductImageUpload Props:**
```typescript
interface ProductImageUploadProps {
    images: string[];                    // Array ของ URL รูปภาพ
    onChange: (images: string[]) => void; // Callback เมื่อมีการเปลี่ยนแปลง
    maxImages?: number;                   // จำนวนรูปสูงสุด (default: 5)
}
```

### 2026-02-08: Demo Products Data
**เพิ่ม Demo สินค้า**: สร้างสินค้าตัวอย่าง 30 รายการใน 3 Catalogs

**Catalog 1: Summer Collection 2026 (เครื่องประดับ)**
- 10 รายการ: แหวนเพชร, สร้อยคอไข่มุก, กำไลทอง, ต่างหูเพชร ฯลฯ
- ราคา: 12,500 - 75,000 บาท

**Catalog 2: Winter Collection 2026 (เครื่องสำอาง)**
- 10 รายการ: ลิปสติก, แป้งฝุ่น, เซรั่ม, ครีมกันแดด ฯลฯ
- ราคา: 590 - 2,490 บาท

**Catalog 3: Spring Collection 2026 (แฟชั่น)**
- 10 รายการ: เสื้อเชิ้ต, กางเกง, กระเป๋า, รองเท้า ฯลฯ
- ราคา: 690 - 2,490 บาท

### 2026-02-08: Flipbook / Book View Feature (NEW)
**Feature ใหม่**: เพิ่มโหมดดู Catalog แบบหนังสือ (Flipbook) พร้อม Animation พลิกหน้า

**ความสามารถ**:
- แสดง Catalog แบบหนังสือเปิดอ่าน 2 หน้าคู่
- Animation พลิกหน้าจากขวาไปซ้าย (เหมือนอ่านหนังสือ)
- หน้าปก (Cover) แสดงชื่อ Catalog และจำนวนสินค้า
- สินค้าแต่ละชิ้นเป็น 1 หน้า พร้อมรูปและปุ่ม Order
- Navigation: คลิกที่หน้าซ้าย/ขวา หรือใช้ปุ่ม
- Page Indicator แสดงตำแหน่งหน้าปัจจุบัน
- ปุ่มสลับกลับไป Grid View

**ไฟล์ที่เพิ่ม/แก้ไข**:
- `frontend/src/components/Flipbook.tsx`: Component ใหม่สำหรับ Flipbook view
- `frontend/src/app/catalog/[slug]/page.tsx`: เพิ่มปุ่ม "Book View" และ integration กับ Flipbook

**วิธีใช้งาน**:
1. เข้าหน้า Catalog สาธารณะ เช่น `/catalog/2`
2. กดปุ่ม "Book View" ที่ header
3. พลิกหน้าด้วยการคลิกหรือใช้ปุ่ม ← →
4. กดปุ่ม "Grid View" เพื่อกลับมาดูแบบ Grid

### 2026-02-08: Flipbook Enhanced - Clickable Images & Better Animation
**ปรับปรุง Flipbook**:

**1. Clickable Product Images**:
- คลิกที่รูปสินค้าเพื่อไปยังหน้าสั่งซื้อ (order_form หรือ website)
- Hover effect แสดงปุ่ม "สั่งซื้อเลย" พร้อม icon
- มี indicator มุมขวาบนแสดงว่าคลิกได้
- ปุ่ม "สั่งซื้อสินค้า" ด้านล่างรูป

**2. Realistic Page Flip Animation**:
- ใช้ requestAnimationFrame แทน CSS animation เพื่อความ smooth
- easeInOutCubic easing function สำหรับการเคลื่อนไหวธรรมชาติ
- เงาแบบ dynamic ที่เปลี่ยนตามมุมพลิก
- Paper texture pattern บนหน้ากระดาษ
- Page edge effect ขอบหน้ากระดาษ
- สันหนังสือ (spine) ที่สมจริง
- เงาใต้หนังสือ

### 2026-02-08: Flipbook Social Share Feature (NEW)
**Feature ใหม่**: เพิ่มปุ่มแชร์ Social Media ที่ด้านล่าง Flipbook

**Social Media ที่รองรับ**:
- **Facebook** - เปิด Share Dialog โดยตรง
- **Messenger** - เปิด Messenger Share
- **Instagram** - คัดลอกลิงก์แล้วแจ้งให้วางใน Story/DM
- **Line** - เปิด Line Share Dialog
- **TikTok** - คัดลอกลิงก์แล้วแจ้งให้วางใน TikTok
- **WhatsApp** - เปิด WhatsApp พร้อมข้อความ
- **Copy Link** - คัดลอกลิงก์ไปยัง Clipboard (มี feedback สีเขียว)

**ไฟล์ที่แก้ไข**:
- `frontend/src/components/Flipbook.tsx`: เพิ่ม Social Icons และ Share functions
- `frontend/src/app/catalog/[slug]/page.tsx`: ส่ง shareUrl และ shareTitle ไปยัง Flipbook

**UI Design**:
- ปุ่มแชร์อยู่ใต้ปุ่ม Navigation
- แต่ละปุ่มมีสีของ Brand (hover เปลี่ยนเป็นสีเต็ม)
- ปุ่ม Copy Link มี feedback เปลี่ยนเป็นสีเขียวเมื่อคัดลอกสำเร็จ

### 2026-02-08: Edit Product Feature (NEW)
**Feature ใหม่**: เพิ่มความสามารถแก้ไขสินค้าแต่ละรายการในหน้าจัดการ Catalog

**ความสามารถ**:
- ปุ่มแก้ไข (Pencil icon) ข้างปุ่มลบในแต่ละสินค้า
- Modal แก้ไขข้อมูลสินค้า: ชื่อ, คำอธิบาย, ราคา, รูปภาพ
- แก้ไข Interactive Links: Website, Order Form, Facebook
- รูปภาพใช้ ProductImageUpload component (อัพโหลดได้หลายรูป)

**ไฟล์ที่แก้ไข**:
- `frontend/src/app/manage/catalogs/[id]/page.tsx`: เพิ่ม state, functions, และ modal สำหรับแก้ไขสินค้า

**Functions ที่เพิ่ม**:
```typescript
const [editingProduct, setEditingProduct] = useState<Product | null>(null);
const [editProduct, setEditProduct] = useState({...});
const openEditModal = (product: Product) => {...};
const closeEditModal = () => {...};
const updateProduct = async (e: React.FormEvent) => {...};
```

### 2026-02-08: Edit Catalog Feature (NEW)
**Feature ใหม่**: เพิ่มความสามารถแก้ไขชื่อและคำอธิบาย Catalog จากหน้า /manage

**ความสามารถ**:
- ปุ่มแก้ไข (Pencil icon) ในแต่ละ Catalog card
- Modal แก้ไขข้อมูล Catalog: หัวข้อ และ คำอธิบาย
- อัพเดทข้อมูลผ่าน PATCH API

**ไฟล์ที่แก้ไข**:
- `frontend/src/app/manage/page.tsx`: เพิ่ม state, functions, และ modal สำหรับแก้ไข Catalog

**Functions ที่เพิ่ม**:
```typescript
const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
const [editCatalog, setEditCatalog] = useState({ title: '', description: '' });
const openEditModal = (catalog: Catalog) => {...};
const closeEditModal = () => {...};
const updateCatalog = async (e: React.FormEvent) => {...};
```

---

### 2026-02-11: Privacy Policy Page (NEW)
**Feature ใหม่**: เพิ่มหน้าแสดงนโยบายความเป็นส่วนตัว (Privacy Policy)
**URL**: `/privacy`
**รายละเอียด**:
- สร้างหน้า Privacy Policy ตามมาตรฐาน
- แสดงข้อมูลการเก็บรวบรวม, การใช้งาน, และการเปิดเผยข้อมูล
- รองรับ Responsive Design (Mobile/Desktop)
- Theme: Dark Mode (Neutral styles)

**ไฟล์ที่เพิ่ม**:
- `frontend/src/app/privacy/page.tsx`

### 2026-02-11: Terms of Service Page (NEW)
**Feature ใหม่**: เพิ่มหน้าข้อกำหนดการใช้บริการ (Terms of Service)
**URL**: `/terms`
**รายละเอียด**:
- สร้างหน้า Terms of Service ตามมาตรฐาน
- แสดงข้อกำหนดการใช้งาน, บัญชีผู้ใช้, ลิขสิทธิ์, และข้อจำกัดความรับผิดชอบ
- รองรับ Responsive Design (Mobile/Desktop)
- Theme: Dark Mode (Neutral styles)

**ไฟล์ที่เพิ่ม**:
- `frontend/src/app/terms/page.tsx`

### 2026-02-11: App Icon Update
**Update**: เปลี่ยน App Icon ใหม่
**รายละเอียด**:
- เปลี่ยนรูป Icon หลักของแอพเป็นดีไซน์ใหม่ "White Triangle in Black Circle"
- สไตล์ Minimalist, Clean, High Contrast

---

### 2026-02-11: Data Deletion Page (NEW)
**Feature ใหม่**: เพิ่มหน้าคำแนะนำการลบข้อมูลผู้ใช้ (Data Deletion Instructions)
**URL**: `/data-deletion`
**รายละเอียด**:
- สร้างหน้า Data Deletion ตามมาตรฐาน
- แสดงข้อมูลขั้นตอนการลบข้อมูล (ผ่านเว็บไซต์/Manual Request)
- รองรับ Responsive Design (Mobile/Desktop)
- Theme: Dark Mode (Neutral styles)

**ไฟล์ที่เพิ่ม**:
- `frontend/src/app/data-deletion/page.tsx`

---

### 2026-02-16: Feature Control System Enhancement (NEW)
**Feature ใหม่**: ปรับปรุงระบบควบคุมฟีเจอร์ให้ผู้ใช้ใหม่เข้าถึงได้เฉพาะ "แก้ไขนามบัตรดิจิทัล"

**รายละเอียด**:
- ผู้ใช้ใหม่ (self-registered / OAuth) จะได้รับ feature_config แบบ LOCKED
- เฉพาะ `profile: true` เท่านั้นที่เปิดให้ใช้งาน
- ฟีเจอร์อื่นๆ ต้องได้รับการปลดล็อคจาก Super Admin หรืออัพเกรดเป็น Premium
- เพิ่ม `referrals` เข้าไปใน feature_config system (รวม 7 ฟีเจอร์)

**Feature Config Interface**:
```typescript
interface FeatureConfig {
  catalog: boolean;      // แคตตาล็อกสินค้า
  leads: boolean;        // ระบบรายชื่อลูกค้า
  namecard: boolean;     // ดีไซน์นามบัตร
  'landing-pages': boolean; // หน้าเซลล์เพจ
  analytics: boolean;    // สถิติและการวิเคราะห์
  profile: boolean;      // แก้ไขนามบัตรดิจิทัล (default: true)
  referrals: boolean;    // ระบบแนะนำสมาชิก
}
```

**Default Configs**:
- `DEFAULT_FEATURE_CONFIG_LOCKED`: เฉพาะ profile เปิด (สำหรับ user ใหม่)
- `DEFAULT_FEATURE_CONFIG_ALL_ENABLED`: ทุก feature เปิด (สำหรับ premium/existing users)

**Control Center UI Updates**:
- แสดงสถานะ feature (ใช้งานได้/ถูกล็อค) แบบ visual
- Locked feature cards แสดง overlay พร้อมปุ่ม "ปลดล็อคเลย"
- Upgrade Card แสดงจำนวน feature ที่เปิด/ล็อค
- Premium Upgrade Modal พร้อมรายการ benefits และราคา

**Admin Dashboard Updates**:
- เพิ่ม referrals ในระบบจัดการ feature
- แสดง 7 features แทน 6
- ปุ่ม "เปิดทั้งหมด" / "ปิดทั้งหมด" รวม referrals

**ไฟล์ที่แก้ไข**:
- `backend/src/users/entities/user.entity.ts`: เพิ่ม referrals ใน FeatureConfig
- `backend/src/users/dto/update-feature-config.dto.ts`: เพิ่ม referrals field
- `backend/src/users/users.service.ts`: เพิ่ม referrals ใน getResolvedFeatureConfig
- `frontend/src/app/manage/control-center/page.tsx`: UI ใหม่สำหรับ feature management
- `frontend/src/app/admin/dashboard/page.tsx`: เพิ่ม referrals ใน feature labels

---


### 2026-02-17: Profile & Account Enhancements
**การปรับปรุงระบบ Profile และ Account Settings** เพื่อแยกการทำงานให้ชัดเจนและเพิ่มลูกเล่นให้กับหน้า Public Profile

**New Features & Enhancements**:
1.  **Resolved Background Image Issue**: แก้ไขปัญหาภาพพื้นหลัง (Background Image) ไม่แสดงผลในหน้า Public Profile
2.  **Video Configuration Support**: เพิ่มการรองรับการตั้งค่าวิดีโอ (Video Config) ในหน้า Public Profile (Autoplay, Link)
3.  **Advanced Company Display Logic**: ปรับปรุงการแสดงผลชื่อบริษัทให้แสดงทุกชื่อที่มี (ทั้ง TH/EN) แทนที่จะเลือกเพียงชื่อเดียว
4.  **Dedicated Account Settings Page**: ย้ายส่วนการจัดการบัญชี (UID, เปลี่ยนรหัสผ่าน) ไปยังหน้าใหม่ `/manage/account` เพื่อลดความซับซ้อนของหน้าแก้ไขโปรไฟล์
5.  **Dashboard Navigation Update**: เพิ่มเมนู "ตั้งค่าบัญชี" (Account Settings) ใน Navbar ของ Dashboard

**Files Updated**:
- `frontend/src/app/[prefix]/[uid]/page.tsx`: เพิ่ม logic การแสดง background image และ video config
- `frontend/src/app/manage/profile/page.tsx`: ลบส่วน Account Settings ออก
- `frontend/src/app/manage/account/page.tsx`: สร้างหน้าใหม่สำหรับ Account Settings
- `frontend/src/app/manage/page.tsx`: เพิ่มลิงก์ไปยังหน้า Account Settings

---

*Updated by Antigravity on 2026-02-17*

### 2026-02-18: Video Playback Fix
**ปัญหา**: วิดีโอที่อัพโหลดผ่านหน้าจัดการโปรไฟล์ (`/manage/profile`) ไม่แสดงผลในหน้า Public Profile (`/p/[uid]`)
**สาเหตุ**: Component `VideoEmbed` เดิมรองรับเฉพาะ YouTube/Vimeo ทำให้วิดีโอที่อัพโหลดเอง (Direct Upload) ไม่แสดงผลเพราะ URL เป็น Relative Path
**การแก้ไข**:
- ปรับปรุง `frontend/src/components/VideoEmbed.tsx` ให้รองรับ Direct Video File (MP4, WebM)
- เพิ่ม logic ตรวจสอบ path และ prepend `NEXT_PUBLIC_API_URL` สำหรับไฟล์ที่อยู่ใน `/uploads/`
- เพิ่ม fallback ให้ใช้ HTML5 `<video>` player เมื่อ URL ไม่ใช่ YouTube/Vimeo

**Files Updated**:
- `frontend/src/components/VideoEmbed.tsx`: เพิ่มการรองรับ direct file playback

---


### 2026-02-18: UI Improvements & Smart Video Autoplay
**ปัญหา**:
1. สีข้อความในหน้า Public Profile กลืนไปกับพื้นหลังทำให้อ่านยาก
2. ผู้ต้องการให้วิดีโอเล่นอัตโนมัติเมื่อเลื่อนลงมาเจอ (Scroll-based Autoplay)

**การแก้ไข**:
1. **Text Contrast**:
   - ปรับ Overlay ของ Background ให้เข้มขึ้น (Gradient Black)
   - เพิ่ม `drop-shadow` และ `backdrop-blur` ให้กับ Text และ Container ต่างๆ
   - เปลี่ยนสีข้อความจาก Gray เป็น White/Light Gray เพื่อให้ตัดกับพื้นหลัง
2. **Video Autoplay**:
   - ใช้ `IntersectionObserver` ใน `VideoEmbed.tsx`
   - เมื่อวิดีโอ (Direct File) เข้าสู่ Viewport (50%) จะเล่นอัตโนมัติ (ถ้าเปิด setting autoplay)
   - เมื่อออกจาก Viewport จะหยุดเล่นชั่วคราว

**Files Updated**:
- `frontend/src/app/[prefix]/[uid]/page.tsx`: ปรับ styling เพื่อเพิ่ม contrast
- `frontend/src/components/VideoEmbed.tsx`: เพิ่ม logic play/pause ตามการ scroll

---


### 2026-02-18: Lead Generation System Fixes
**ปัญหา**:
1. แบบฟอร์มติดต่อกลับ (`LeadForm`) ในหน้า Public Profile ใช้งานไม่ได้จริง (ส่งข้อมูลไม่เข้า Backend)
2. ผู้ต้องการเปิด/ปิดการแสดงผลแบบฟอร์มติดต่อกลับได้
3. ต้องการเก็บข้อมูล "อาชีพ/บริษัท" (`occupation`) เพิ่มเติม

**การแก้ไข**:
1. **Backend**:
   - เพิ่ม field `occupation` ใน `CreateLeadDto` เพื่อรองรับข้อมูลอาชีพ
2. **Frontend (Public Profile)**:
   - แก้ไข `LeadForm` ให้ยิง API ไปที่ `/api/contact/:uid` แทน `/api/leads` (ซึ่งผิด)
   - ส่ง `occupation` ไปพร้อมกับข้อมูลอื่นๆ
3. **Frontend (Manage Profile)**:
   - เพิ่ม Toggle "Show Contact Form" (แสดงฟอร์มติดต่อ) ในหน้าแก้ไขโปรไฟล์
   - เพิ่ม Toggle "Show Contact Info" (แสดงข้อมูลติดต่อ เบอร์/อีเมล) ในหน้าแก้ไขโปรไฟล์
   - เชื่อมต่อกับค่า `layout_config.show_lead_form` และ `layout_config.show_contact_info`

**Files Updated**:
- `backend/src/leads/dto/create-lead.dto.ts`: เพิ่ม `occupation`
- `backend/src/profiles/types/profile.types.ts`: เพิ่ม field ใน `LayoutConfig`
- `frontend/src/components/LeadForm.tsx`: แก้ไข endpoint และเพิ่ม field
- `frontend/src/app/[prefix]/[uid]/page.tsx`: ส่ง `uid` ให้ `LeadForm`, เช็ค config `show_lead_form`, เช็ค config `show_contact_info`
- `frontend/src/app/manage/profile/page.tsx`: เพิ่ม UI Toggle สำหรับ Show/Hide Form และ Contact Info

---

*Updated by Antigravity on 2026-02-18*

### 2026-02-18: Lead Generation & Contact Info Visibility (Verified)
**Status**: Implemented & Ready for Deployment
**User Request**:
1. Make the contact form on public profiles work (send data to `/manage/leads`).
2. Add a toggle to hide "Contact Information" on public profiles.

**Implementation Details**:
1. **Lead Generation System**:
   - **Frontend**: `LeadForm` component updated to send `occupation` field and post to `/api/contact/:uid`.
   - **Backend**: `LeadsController` listens on `/contact/:uid`, validates user, checks feature flags, and saves data via `LeadsService`.
   - **Database**: `Lead` entity includes `occupation` column.
   
2. **Profile Visibility Controls**:
   - **Manage Profile**: Added toggles for:
     - "Show Contact Form" (`show_lead_form`)
     - "Show Contact Info" (`show_contact_info`) - hides email/phone section.
   - **Public Profile**: Updated logic to respect these flags in `layout_config`.
   - **Lead Form UI**: 
     - Improved readability with higher contrast text and inputs.
     - Added collapsible/expandable functionality (default collapsed) with a "Contact Us" header.

**Action Required**:
- **Deploy**: Run `docker-compose up -d --build` to apply changes.
- **Verify**: Check `https://namecard.dpattown.com/2f265/admin_01_10bbe`. The contact form should start collapsed and expand when clicked. Text inside should be clear and readable.

### 2026-02-18: Lead Count & Direct Hide Form (NEW)
**Feature Updates**:
1.  **Control Center Lead Count**: Fixed the "Leads Recieved" count in `/manage/control-center` to display the actual number of unread leads.
    - **Frontend**: Added fetch logic to `/api/leads/unread-count`.
2.  **Direct Hide Form**: Added a "Hide" button on the public profile's lead form, visible only to the profile owner.
    - **Frontend**: `LeadForm` checks if the logged-in user is the owner (`cookie.uid === targetUid`). If so, a "Hide" icon appears. Clicking it updates the profile config and reloads the page.

**Files Updated**:
- `frontend/src/app/manage/control-center/page.tsx`: Added lead count fetch.
- `frontend/src/components/LeadForm.tsx`: Added owner check and hide functionality.

### 2026-02-18: Lead Form Visual Update (Clean Text)
**Feature Updates**:
1.  **High Contrast UI**: Significantly clearer text labels and inputs for the Lead Form on dark backgrounds.
    - **Labels**: White, drop-shadowed text.
    - **Inputs**: Darker background with reduced opacity (`bg-black/50`), clearer borders, and brighter placeholder text.
    - **Button**: Gradient primary button with shadow.

**Files Updated**:
- `frontend/src/components/LeadForm.tsx`: CSS/Tailwind updates for better visibility.

---

### 2026-02-20: Branding & Landing Page Optimization
**Feature Updates**:
1.  **New Branding Integration**:
    - Replaced the old logo with the new official NAMECARD.AI logo.
    - Updated `frontend/src/app/layout.tsx` metadata (Title: `NAMECARD.AI | Digital Business Card Platform`).
    - Matched the overall page colors to the logo (Navy + Orange scheme).
2.  **Layout & UI Refinements**:
    - Increased Navbar height (to `h-20`) to accommodate the larger logo.
    - Enlarged the logo in the phone mockup (using `scale(1.3)`).
    - Swapped the banner and avatar images in the mockup to be more contextually correct.
    - Fixed spacing and layout alignment on the landing page.
3.  **Theme Persistence**:
    - Defaulted the site to Light Mode as per the new branding design.

**Files Updated**:
- `frontend/src/app/layout.tsx`: Metadata and default theme updates.
- `frontend/src/app/page.tsx`: Landing page layout, mockup images, and styling.
- `frontend/src/components/Navbar.tsx`: Navbar size and logo integration.

---

### 2026-02-21: Profile UI Optimization
**Feature Updates**:
1.  **Avatar Enlargement**:
    - Increased profile avatar size in the landing page mockup from `w-24` to `w-32`.
    - Adjusted vertical spacing (`padding-top`) to maintain layout balance.
2.  **Branding Persistence**:
    - Finalized the integration of official logo and secondary assets (`favicon.ico`, `logo-ai.jpg`).
3.  **Deployment & Sync**:
    - Successfully deployed to production using `docker compose`.
    - Synchronized all local changes to GitHub `main` branch.

**Files Updated**:
- `frontend/src/app/page.tsx`: Avatar size and padding adjustments.
- `AGENT_HANDOVER.md`: Updated project logs.

*Updated by Antigravity on 2026-02-21*

---

### 2026-02-21: Landing, Login, Control Center & Public Profile Light Theme Refinements
**Feature Updates**:
1. **Landing Page Cleanup**:
   - Removed Theme Toggle from Landing page navbar (hide only, not delete system).
   - Adjusted mockup avatar crop/scale so face and head are visible more naturally.
2. **Login UX Improvements**:
   - Added close button (`X`) at top-right of login card.
   - Close behavior: go back if history exists, otherwise redirect to `/`.
   - Removed Theme Toggle from Login page.
3. **Control Center UI/UX Optimization**:
   - Matched branding with Landing page (logo + font tone).
   - Compacted hero/header area (removed long subtitle and welcome headline on request).
   - Added quick action button **"โชว์นามบัตร"** and tuned size to align with side stat boxes.
   - Changed logout flow to redirect to Landing page (`/`) after sign out.
   - Reordered feature cards per request:
     1) นามบัตรดิจิทัล  
     2) หน้าเซลล์เพจ  
     3) แคตตาล็อก  
     4) ระบบรายชื่อลูกค้า  
     5) สถิติและการวิเคราะห์  
     6) ดีไซน์นามบัตร
   - Updated card title from **"แก้ไขนามบัตรดิจิทัล"** to **"นามบัตรดิจิทัล"**.
   - Made "นามบัตรดิจิทัล" card fully clickable (same behavior as other cards) and added matching hover/active effects.
   - Updated "โชว์นามบัตร" button style to neutral in normal state and orange on press/active.
4. **Public Profile Apple Light Theme Alignment**:
   - Reworked profile page light-mode surfaces/texts to align with Landing page tone.
   - Replaced hardcoded dark/white blocks with theme-aware `background/foreground` styling in key sections (about/contact/website/QR/footer) for better readability and brand consistency.

**Files Updated**:
- `frontend/src/app/page.tsx`
- `frontend/src/app/login/page.tsx`
- `frontend/src/app/manage/control-center/page.tsx`
- `frontend/src/app/[prefix]/[uid]/page.tsx`
- `AGENT_HANDOVER.md`

**Deployment**:
- Applied and verified via `docker compose up -d --build` (services `web`, `api`, `postgres`, `redis` running).

*Updated by Codex on 2026-02-21*
