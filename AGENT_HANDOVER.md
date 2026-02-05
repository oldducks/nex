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

---

## 📂 Key Files & Directories

### Backend (`/backend`)
- `src/landing-pages`: ระบบจัดการ Landing Page ทั้งหมด (Entity, Service, Controller)
- `src/catalogs`: ระบบแคตตาล็อกดิจิทัล
- `src/leads`: ระบบจัดการรายชื่อลูกค้า

### Frontend (`/frontend`)
- `src/app/lp/[slug]`: หน้าเรียกดูเซลล์เพจสาธารณะ (Public Campaign Viewer)
- `src/app/manage/landing-pages`: ระบบจัดการหน้าเซลล์เพจ (Campaign Management)
- `src/app/manage/landing-pages/[id]`: ตัวแก้ไขเนื้อหา (Landing Page Editor)

---

## ⚙️ URL Structures
- **Profile**: `/{prefix}/{uid}`
- **Catalog**: `/catalog/{slug_or_id}`
- **Landing Page**: `/lp/{slug}`

---
*Updated by Antigravity on 2026-02-05*
