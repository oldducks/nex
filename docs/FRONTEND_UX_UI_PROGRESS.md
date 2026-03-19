# Frontend UX/UI Progress

อัปเดตล่าสุด: 2026-03-19
เจ้าของงาน: Codex + User
สถานะรวม: เริ่มจัดแผนและใช้ไฟล์นี้เป็นตัวติดตามงานรายหน้า

## วิธีใช้
- อัปเดตไฟล์นี้ทุกครั้งเมื่อเริ่มหรือจบงานแต่ละหน้า
- ถ้าหน้ายากหรือข้อมูลยังไม่พอ ให้เปลี่ยนสถานะเป็น `blocked` หรือ `skipped`
- ถ้าข้ามไว้ก่อน ให้ใส่เหตุผลสั้น ๆ ในคอลัมน์หมายเหตุ แล้วค่อยย้อนกลับมา
- ให้มองจำนวนงานคงเหลือจากหัวข้อ `Summary` เป็นหลัก

## Status Key
- `done` = ทำเสร็จและตรวจแล้วในระดับที่ใช้งานต่อได้
- `in_progress` = กำลังทำ
- `pending` = ยังไม่เริ่ม
- `blocked` = ติด dependency, ข้อมูลไม่พอ, หรือเสี่ยงเกินกว่าจะเดา
- `skipped` = ตั้งใจข้ามก่อนและจะกลับมาเก็บภายหลัง

## Summary
- ทั้งหมด: 31 หน้า/จุดงาน
- done: 2
- in_progress: 0
- pending: 29
- blocked: 0
- skipped: 0

## Foundation

| Area | File | Status | Priority | งานที่ต้องทำ | หมายเหตุ |
|---|---|---|---|---|---|
| Global styles | `frontend/src/app/globals.css` | done | P0 | วาง base theme, focus state, motion, surface utility | ทำแล้วในรอบล่าสุด |
| Root layout | `frontend/src/app/layout.tsx` | pending | P1 | ตรวจ shared shell, metadata, theme bootstrapping, global background behavior | เก็บหลังจาก public pages ชัดแล้ว |

## Public Marketing

| Area | File | Status | Priority | งานที่ต้องทำ | หมายเหตุ |
|---|---|---|---|---|---|
| Main landing | `frontend/src/app/page.tsx` | done | P0 | ปรับ hero, CTA hierarchy, section spacing, modal entry flow, mobile readability | รีดีไซน์หน้าแรกและคง modal auth flow |
| Home preview | `frontend/src/app/home-preview/page.tsx` | pending | P0 | ตรวจ visual direction, copy hierarchy, section rhythm, CTA flow | มีธีมชัด แต่ยังไม่ได้ review ปิดงาน |
| What is NEX | `frontend/src/app/what-is-nex/page.tsx` | pending | P1 | ปรับ readability, content grouping, CTA ปลายหน้า | ควรสอดคล้องกับ landing |
| Enterprise | `frontend/src/app/enterprise/page.tsx` | pending | P1 | ปรับ trust section, pricing/contact CTA, mobile layout | ใช้ปิดการขาย B2B |

## Auth

| Area | File | Status | Priority | งานที่ต้องทำ | หมายเหตุ |
|---|---|---|---|---|---|
| Login | `frontend/src/app/login/page.tsx` | pending | P0 | ปรับ form clarity, error state, social login prominence, mobile spacing | กระทบ conversion |
| Register | `frontend/src/app/register/page.tsx` | pending | P0 | ปรับ form order, password guidance, CTA clarity | ควรเข้าคู่กับ login |
| Forgot password | `frontend/src/app/forgot-password/page.tsx` | pending | P1 | ปรับ message clarity และ submit feedback | งานเก็บ flow |
| Reset password | `frontend/src/app/reset-password/page.tsx` | pending | P1 | ปรับ state handling และ confirmation UX | งานเก็บ flow |
| Force change password | `frontend/src/app/force-change-password/page.tsx` | pending | P1 | ลด friction และทำ state ให้ชัด | ใช้หลัง login บางกรณี |
| OAuth callback | `frontend/src/app/oauth-callback/page.tsx` | pending | P1 | ตรวจ loading/fail/success states ให้ชัด | งาน polish flow |

## Legal / Static

| Area | File | Status | Priority | งานที่ต้องทำ | หมายเหตุ |
|---|---|---|---|---|---|
| Privacy | `frontend/src/app/privacy/page.tsx` | pending | P3 | ปรับ typography และ content width | ทำท้ายได้ |
| Terms | `frontend/src/app/terms/page.tsx` | pending | P3 | ปรับ readability และ heading hierarchy | ทำท้ายได้ |
| Data deletion | `frontend/src/app/data-deletion/page.tsx` | pending | P3 | ปรับ content structure และ link clarity | ทำท้ายได้ |

## Public Product Pages

| Area | File | Status | Priority | งานที่ต้องทำ | หมายเหตุ |
|---|---|---|---|---|---|
| Public profile | `frontend/src/app/[prefix]/[uid]/page.tsx` | pending | P0 | ตรวจการอ่านข้อมูล, CTA/share/contact flow, mobile rendering | หน้าใช้งานจริงของลูกค้า |
| Legacy profile redirect | `frontend/src/app/p/[uid]/page.tsx` | pending | P3 | ตรวจ redirect UX และ fallback | งานเล็ก |
| Public catalog | `frontend/src/app/catalog/[slug]/page.tsx` | pending | P1 | ปรับ product scanability, cover, CTA, media presentation | มีผลต่อ conversion |
| Public form | `frontend/src/app/forms/[id]/page.tsx` | pending | P1 | ปรับ form completion rate, error/success state | สำคัญต่อ lead capture |
| Public landing page | `frontend/src/app/lp/[slug]/page.tsx` | pending | P1 | ตรวจ rendering shell และ section consistency | ขึ้นกับ data-driven layout |

## Manage Core

| Area | File | Status | Priority | งานที่ต้องทำ | หมายเหตุ |
|---|---|---|---|---|---|
| Manage home | `frontend/src/app/manage/page.tsx` | pending | P1 | จัด dashboard entry, nav clarity, card hierarchy | ไฟล์ใหญ่ ควรทำเป็นเฟส |
| Control center | `frontend/src/app/manage/control-center/page.tsx` | pending | P0 | ตรวจ information density, quick actions, state visibility | ศูนย์กลางหลัก |
| Analytics dashboard | `frontend/src/app/manage/dashboard/page.tsx` | pending | P1 | ปรับ chart readability และ summary cards | ต้องเช็ก data states |
| Profile editor | `frontend/src/app/manage/profile/page.tsx` | pending | P0 | ตรวจ editor flow, section grouping, sticky actions, mobile form UX | จุดใช้งานหนัก |
| Namecard editor | `frontend/src/app/manage/namecard/page.tsx` | pending | P1 | ปรับ preview/editor relationship | ควรตามหลัง profile |
| Account settings | `frontend/src/app/manage/account/page.tsx` | pending | P1 | ปรับ settings clarity และ destructive action states | งานระบบ |

## Manage Growth Tools

| Area | File | Status | Priority | งานที่ต้องทำ | หมายเหตุ |
|---|---|---|---|---|---|
| Landing pages list | `frontend/src/app/manage/landing-pages/page.tsx` | pending | P1 | ปรับ list actions, creation flow, filtering | มี CRUD หลาย state |
| Landing page editor | `frontend/src/app/manage/landing-pages/[id]/page.tsx` | pending | P0 | ปรับ editor IA, side panels, save/publish visibility | ไฟล์ใหญ่และซับซ้อน |
| Forms list | `frontend/src/app/manage/forms/page.tsx` | pending | P1 | ปรับ overview, empty state, actions | ควรคู่กับ builder |
| Form builder | `frontend/src/app/manage/forms/[id]/page.tsx` | pending | P0 | ปรับ builder UX, field controls, save state, preview flow | งานยาก |
| Form submissions | `frontend/src/app/manage/forms/[id]/submissions/page.tsx` | pending | P1 | ปรับ table readability และ filter flow | เก็บหลัง builder |
| Catalog editor | `frontend/src/app/manage/catalogs/[id]/page.tsx` | pending | P0 | ปรับ product management flow, preview, asset handling | งานยาก |
| QR manager | `frontend/src/app/manage/qr/page.tsx` | pending | P1 | ปรับ generation flow และ destination clarity | งานกลาง |
| Leads | `frontend/src/app/manage/leads/page.tsx` | pending | P1 | ปรับ table density, status scanability, action flow | data-heavy |
| Referrals | `frontend/src/app/manage/referrals/page.tsx` | pending | P2 | ปรับ hierarchy และ reward/status visibility | ทำหลัง core |
| Lite creator | `frontend/src/app/manage/create-lite/page.tsx` | pending | P2 | ตรวจ flow และ positioning ในระบบ | ความสำคัญรอง |

## Admin

| Area | File | Status | Priority | งานที่ต้องทำ | หมายเหตุ |
|---|---|---|---|---|---|
| Admin dashboard | `frontend/src/app/admin/dashboard/page.tsx` | pending | P3 | ปรับ readability และ density | ทำท้ายได้ |
| Secret create | `frontend/src/app/admin/secret-create/page.tsx` | pending | P3 | ปรับ form clarity และ admin safety cues | ทำท้ายได้ |

## Suggested Execution Order
1. `page.tsx`
2. `home-preview/page.tsx`
3. `login/page.tsx`
4. `register/page.tsx`
5. `manage/control-center/page.tsx`
6. `manage/profile/page.tsx`
7. `manage/namecard/page.tsx`
8. `manage/forms/[id]/page.tsx`
9. `manage/catalogs/[id]/page.tsx`
10. `manage/landing-pages/[id]/page.tsx`
11. เก็บงานหน้ารองที่เหลือ

## Update Log
- 2026-03-19: สร้างไฟล์ติดตามงาน UX/UI รายหน้าและตั้ง baseline สถานะเริ่มต้น
- 2026-03-19: เริ่มงาน `frontend/src/app/page.tsx` และอัปเดตสถานะเป็น `in_progress`
- 2026-03-19: ปิดงาน `frontend/src/app/page.tsx` เป็น `done` หลังรีดีไซน์หน้าแรกและผ่าน lint เฉพาะไฟล์
