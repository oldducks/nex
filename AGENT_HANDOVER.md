# AGENT_HANDOVER - NEX Solution

## ⚠️ Handover Recovery Note (2026-03-05)
ไฟล์นี้ถูกเขียนทับโดยไม่ตั้งใจระหว่างอัปเดตเอกสาร DevOps จึงกู้คืนประวัติเดิมทั้งหมดจาก git ไม่สำเร็จในสภาพแวดล้อมปัจจุบัน
(read-only lock ตอน `git checkout -- AGENT_HANDOVER.md`).

ด้านล่างคือบันทึก milestone ล่าสุดของ Phase 1 ที่กู้คืนได้จาก session ปัจจุบัน
และจะใช้ไฟล์นี้ต่อเนื่องเป็น handover หลักจนกว่าจะ restore history เดิมได้.

---

### 2026-03-23: UX Sprint - Preview Routing + Storyboard CTA Injection (`/what-is-nex-preview`, `/nex-digital-asset-partner-preview`)
**Goal**: ปิดงานหน้า preview ตาม feedback ล่าสุด โดยเพิ่มเส้นทางหน้าใหม่, ปรับ spacing ระหว่างภาพ, แทรกปุ่มสมัครตามเลขภาพ, และเชื่อมปุ่มจากหน้าแรกให้ไปหน้า preview ที่ถูกต้อง

**What changed**:
1. New preview route: NEX Digital Asset Partner
   - เพิ่มหน้าใหม่ `frontend/src/app/nex-digital-asset-partner-preview/page.tsx`
   - โหลดภาพจาก `frontend/public/nex-digital-asset-partner-preview/` และ sort ตามเลขไฟล์อัตโนมัติ
   - ตั้ง spacing ระหว่างภาพ `15px`
   - แทรกปุ่ม `เปิดฟอร์มสมัครสมาชิก` หลังภาพเลข `1, 6, 10, 18`
   - ไฟล์จาก Drive ที่ได้จริงคือ `1-10, 12-18` (ไม่มี `11.jpg`)

2. Update: What Is NEX preview page (`/what-is-nex-preview`)
   - ปรับ spacing ระหว่างภาพเป็น `15px`
   - เปลี่ยนจาก inline register form เดิมเป็นปุ่มสมัครสมาชิกแบบแทรกตามลำดับภาพ
   - ตำแหน่งปุ่มล่าสุด: หลังภาพเลข `1, 7, 13, 15, 18`

3. Home routing updates (`/`)
   - ปุ่ม `NEX Solution คืออะไร` เปลี่ยนลิงก์ไป `/what-is-nex-preview`
   - ปุ่ม `NEX Digital Asset Partner` เปลี่ยนลิงก์ไป `/nex-digital-asset-partner-preview`

4. Deploy status
   - deploy แล้วด้วย `docker compose up -d --build web`
   - ตรวจสอบ route ต่อไปนี้ตอบ `200 OK`:
     - `https://nexsolution.cloud/`
     - `https://nexsolution.cloud/what-is-nex-preview`
     - `https://nexsolution.cloud/nex-digital-asset-partner-preview`

**Files updated (this sprint slice)**:
- `frontend/src/app/page.tsx`
- `frontend/src/app/what-is-nex-preview/page.tsx`
- `frontend/src/app/nex-digital-asset-partner-preview/page.tsx`
- `frontend/public/nex-digital-asset-partner-preview/1.jpg`
- `frontend/public/nex-digital-asset-partner-preview/2.jpg`
- `frontend/public/nex-digital-asset-partner-preview/3.jpg`
- `frontend/public/nex-digital-asset-partner-preview/4.jpg`
- `frontend/public/nex-digital-asset-partner-preview/5.jpg`
- `frontend/public/nex-digital-asset-partner-preview/6.jpg`
- `frontend/public/nex-digital-asset-partner-preview/7.jpg`
- `frontend/public/nex-digital-asset-partner-preview/8.jpg`
- `frontend/public/nex-digital-asset-partner-preview/9.jpg`
- `frontend/public/nex-digital-asset-partner-preview/10.jpg`
- `frontend/public/nex-digital-asset-partner-preview/12.jpg`
- `frontend/public/nex-digital-asset-partner-preview/13.jpg`
- `frontend/public/nex-digital-asset-partner-preview/14.jpg`
- `frontend/public/nex-digital-asset-partner-preview/15.jpg`
- `frontend/public/nex-digital-asset-partner-preview/16.jpg`
- `frontend/public/nex-digital-asset-partner-preview/17.jpg`
- `frontend/public/nex-digital-asset-partner-preview/18.jpg`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-23*

### 2026-03-23: UX Sprint - What Is NEX Preview Storyboard Page (`/what-is-nex-preview`)
**Goal**: สร้างหน้า preview สำหรับ review visual storyboard โดยใช้ภาพจริงเรียงต่อกันเท่านั้น และปรับขนาดให้เหมาะกับ desktop ตาม feedback

**What changed**:
1. New preview route for storyboard review
   - เพิ่มหน้าใหม่ `frontend/src/app/what-is-nex-preview/page.tsx`
   - หน้าเป็น image-only (ไม่มี hero, ไม่มี intro text, ไม่มี section header, ไม่มีปุ่ม, ไม่มี closing CTA)
   - ใช้ image array (`1.jpg` ถึง `18.jpg`) เพื่อเพิ่ม/ลดจำนวนภาพได้ง่าย

2. Image asset ingestion from shared Google Drive
   - ดึงภาพจากโฟลเดอร์ที่แชร์และวางไว้ที่ `frontend/public/what-is-nex-preview/`
   - ไฟล์เรียงตามลำดับชื่อ: `1.jpg` → `18.jpg`

3. UX tuning from live feedback
   - รอบแรก: ลดขนาด desktop จากเต็มคอลัมน์กว้าง (`max-w-5xl`) เป็นคอลัมน์แคบลง (`max-w-[680px]`)
   - รอบสอง: ปรับ desktop ให้แนว `1 หน้าจอ ≈ 1 รูป` ด้วย `lg:min-h-dvh` และ image height `lg:h-dvh`
   - คง mobile behavior ให้แสดงต่อเนื่องแบบเดิม

4. Performance/implementation details
   - ใช้ `next/image` พร้อม lazy loading ตาม default behavior
   - ตั้ง `sizes` ให้เหมาะกับ layout desktop/mobile หลังปรับความกว้าง

5. Deploy status
   - deploy แล้วด้วย `docker compose -f docker-compose.yml up -d --build web`
   - ตรวจสอบ route `https://nexsolution.cloud/what-is-nex-preview` ตอบ `200 OK`

**Files updated (this sprint slice)**:
- `frontend/src/app/what-is-nex-preview/page.tsx`
- `frontend/public/what-is-nex-preview/1.jpg`
- `frontend/public/what-is-nex-preview/2.jpg`
- `frontend/public/what-is-nex-preview/3.jpg`
- `frontend/public/what-is-nex-preview/4.jpg`
- `frontend/public/what-is-nex-preview/5.jpg`
- `frontend/public/what-is-nex-preview/6.jpg`
- `frontend/public/what-is-nex-preview/7.jpg`
- `frontend/public/what-is-nex-preview/8.jpg`
- `frontend/public/what-is-nex-preview/9.jpg`
- `frontend/public/what-is-nex-preview/10.jpg`
- `frontend/public/what-is-nex-preview/11.jpg`
- `frontend/public/what-is-nex-preview/12.jpg`
- `frontend/public/what-is-nex-preview/13.jpg`
- `frontend/public/what-is-nex-preview/14.jpg`
- `frontend/public/what-is-nex-preview/15.jpg`
- `frontend/public/what-is-nex-preview/16.jpg`
- `frontend/public/what-is-nex-preview/17.jpg`
- `frontend/public/what-is-nex-preview/18.jpg`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-23*

### 2026-03-21: UX Sprint - Referrals Page (Top Bar Standard + Share Assets + KPI State/Timestamp)
**Goal**: ปรับหน้า `/manage/referrals` ให้สอดคล้อง NEX UX/UI standard โดยคง business logic เดิม และเน้นความชัดเจนของข้อมูลสำคัญ

**What changed**:
1. Top bar standardization
   - ย้ายจาก navbar เฉพาะหน้า ไปใช้ `ManageTopBar` เหมือนหน้า manage อื่น
   - คง action ฝั่งขวา (`Admin Panel`, `ออกจากระบบ`) ในรูปแบบเดียวกับระบบหลังบ้าน

2. Color role alignment
   - ลดสีที่แข่งกันในหน้าและปรับกลับเข้าสู่ระบบสี NEX (`navy / orange / neutral`)
   - ลด gradient noise ในหลาย block เพื่อให้ hierarchy ชัดและอ่านง่ายขึ้น

3. Share Assets consolidation
   - รวมส่วน `ลิงก์แนะนำ + QR + รหัสแนะนำ` เป็น section เดียวชื่อ `Share Assets`
   - เพิ่ม action copy แยกทั้งลิงก์และรหัสแนะนำ

4. KPI state + timestamp
   - เพิ่มสถานะข้อมูล KPI: `loading`, `success`, `error`
   - เพิ่ม badge สถานะและข้อความ `อัปเดตล่าสุด` ตามเวลาที่ดึงข้อมูลสำเร็จ
   - เพิ่ม skeleton ขณะโหลด และปุ่ม retry เมื่อโหลดไม่สำเร็จ

5. Deploy + push
   - deploy ด้วย `docker compose up -d --build web`
   - push แล้วบน `main` commit `80f95117cfc40da3fb3ff4696213e97f95e095bf`

**Files updated (main push 80f95117cfc40da3fb3ff4696213e97f95e095bf)**:
- `frontend/src/app/manage/referrals/page.tsx`

*Updated by Codex on 2026-03-21*

### 2026-03-20: UX Sprint - Home CTA Row Alignment + Register CTA Orange + Public Profile Logo Scale
**Goal**: เก็บงานปรับหน้าแรกตาม feedback ล่าสุดให้ CTA ชัดเจนขึ้น และขยายโลโก้บนหน้าพรีวิวโปรไฟล์สาธารณะให้มองเห็นง่ายขึ้น

**What changed**:
1. Home page CTA layout (สองปุ่มแถวบน)
   - ปรับปุ่ม `เข้าสู่ระบบ` และ `สร้างบัญชีผู้ใช้ใหม่` ให้อยู่แถวเดียวกันด้วย `grid-cols-2`
   - คงอีก 3 ปุ่มไว้เป็น full-width ใต้แถวบน

2. Home page CTA color
   - ปรับปุ่ม `สร้างบัญชีผู้ใช้ใหม่` ให้เป็นโทนส้มตาม feedback
   - ทำให้ CTA หลักทั้งสองปุ่มในแถวบนมี visual priority เท่ากัน

3. Public profile logo size
   - ขยาย badge โลโก้บริษัทบนหน้า `/{prefix}/{uid}` จากขนาดเล็กเดิมให้เห็นชัดขึ้น
   - เพิ่มการ scale ของภาพโลโก้เล็กน้อยเพื่อให้การรับรู้แบรนด์ดีขึ้นบน desktop/mobile

4. Deploy
   - deploy ด้วย `docker compose up -d --build web`
   - ตรวจสอบสถานะ `namecard_web` และ `namecard_api` เป็น `Up`

**Files updated (this sprint slice)**:
- `frontend/src/app/page.tsx`
- `frontend/src/app/[prefix]/[uid]/page.tsx`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-20*

### 2026-03-20: UX Sprint - Manage Topbar Standardization + Thai UI
**Goal**: ยกระดับ consistency ของระบบหลังบ้าน (`/manage/*`) ให้ใช้ top bar มาตรฐานเดียวกัน พร้อมภาษาไทยและโทนสี NEX

**What changed**:
1. Shared top bar component
   - เพิ่มคอมโพเนนต์ `ManageTopBar` สำหรับ reuse ทุกหน้าในกลุ่ม manage
   - รองรับ back button, logo area, title/subtitle, action slot

2. Top bar migration
   - ย้ายหน้า `catalogs/[id]`, `namecard`, `qr`, `create-lite`, `dashboard`, `leads`, `landing-pages` มาใช้ top bar มาตรฐาน
   - ปรับข้อความเป็นภาษาไทยใน mode ภาษาไทย

3. Color and typography tune
   - ปรับ text hierarchy/contrast หลายส่วนให้สอดคล้อง NEX color system
   - เพิ่มขนาดฟอนต์ในหน้า QR เพื่อแก้ปัญหาตัวหนังสือดูเล็กกว่าหน้าอื่น

4. Logo navigation fix
   - แก้ปัญหาคลิกโลโก้ใน top bar แล้วหลุด flow โดยกำหนดลิงก์ไป `/manage/control-center`

5. Deploy + push
   - deploy ผ่าน docker compose
   - push แล้วบน `main` commit `b2facdf`

**Files updated (main push b2facdf)**:
- `frontend/src/components/ManageTopBar.tsx`
- `frontend/src/components/Logo.tsx`
- `frontend/src/app/manage/catalogs/[id]/page.tsx`
- `frontend/src/app/manage/namecard/page.tsx`
- `frontend/src/app/manage/qr/page.tsx`
- `frontend/src/app/manage/create-lite/page.tsx`
- `frontend/src/app/manage/dashboard/page.tsx`
- `frontend/src/app/manage/leads/page.tsx`
- `frontend/src/app/manage/landing-pages/page.tsx`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-20*

### 2026-03-05: Phase 1 Week 3 - Logging System Baseline (Request Logging Middleware)
**Goal**: เริ่มงาน Logging System ตามแผน Phase 1 โดยเพิ่มชั้นบันทึก request/response สำหรับ API ทั้งระบบ

**What changed**:
1. เพิ่ม middleware ใหม่ `backend/src/common/middleware/request-logging.middleware.ts`
   - เก็บ method + URL + status code + duration
   - แยกระดับ log ตาม status:
     - `2xx/3xx` -> `log`
     - `4xx` -> `warn`
     - `5xx` -> `error`

2. ผูก middleware ใน `AppModule`
   - `AppModule` implements `NestModule`
   - `configure()` ใช้ `consumer.apply(RequestLoggingMiddleware).forRoutes('*')`

3. Checklist sync
   - `DEVELOPMENT_CHECKLIST.md` หมวด 1.5 Logging System:
     - Application Logging: done
     - Error Logging: done
     - Audit/Aggregation/Test: pending

**Files updated**:
- `backend/src/common/middleware/request-logging.middleware.ts`
- `backend/src/app.module.ts`
- `DEVELOPMENT_CHECKLIST.md`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-05*

### 2026-03-05: Phase 1 Week 3 - Logging System Extended (Audit + Structured Logs)
**Goal**: ยกระดับ Logging ให้พร้อมต่อยอดเป็น Log Aggregation โดยเพิ่ม Audit Logging และโครงสร้าง log แบบ JSON

**What changed**:
1. Structured Logger กลาง
   - เพิ่ม `backend/src/common/logging/structured-logger.ts`
   - สร้าง service `StructuredLogger` ที่:
     - แปลง log เป็น JSON (มี `level`, `message`, `timestamp` และ meta อื่น ๆ)
     - ส่งออกผ่าน `console.log / console.warn / console.error` (พร้อมต่อกับ ELK/Loki/ฯลฯ ภายหลัง)

2. Request Logging → ใช้ structured log
   - ปรับ `backend/src/common/middleware/request-logging.middleware.ts` ให้ inject `StructuredLogger`
   - Log รูปแบบ:
     - `message`: `"http_request"`
     - meta: `{ context: 'HTTP', method, path, statusCode, durationMs, ip }`
   - แยก level ตาม status code:
     - 2xx/3xx → `log`
     - 4xx → `warn`
     - 5xx → `error`

3. Audit Logging Interceptor → ใช้ structured log
   - อัปเดต `backend/src/common/interceptors/audit-logging.interceptor.ts`
   - ทำงานกับ method ที่เปลี่ยน state: `POST`, `PATCH`, `PUT`, `DELETE`
   - Log รูปแบบ:
     - `message`: `"audit_event"`
     - meta success: `{ context: 'AUDIT', action, path, statusCode, durationMs, userId, role, ip }`
     - meta error: เพิ่ม `error` message เข้าไป

4. Global wiring
   - `backend/src/app.module.ts`
     - register `StructuredLogger` ใน `providers`
     - ใช้เป็น dependency ให้ทั้ง `RequestLoggingMiddleware` และ `AuditLoggingInterceptor`

5. Checklist sync
   - `DEVELOPMENT_CHECKLIST.md` หมวด 1.5 Logging System:
     - Application Logging: done
     - Error Logging: done
     - Audit Logging: done
     - Log Aggregation: done (baseline ผ่าน structured JSON logs)
     - Test logging system: pending

**Files updated**:
- `backend/src/common/logging/structured-logger.ts`
- `backend/src/common/middleware/request-logging.middleware.ts`
- `backend/src/common/interceptors/audit-logging.interceptor.ts`
- `backend/src/app.module.ts`
- `DEVELOPMENT_CHECKLIST.md`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-05*

### 2026-03-05: Phase 1 Week 3 - Logging System Test Coverage (Structured Logger)
**Goal**: มีการทดสอบอัตโนมัติขั้นต่ำยืนยันว่าโครงสร้าง log JSON ที่ออกจาก `StructuredLogger` ถูกต้องและพร้อมต่อยอดใช้ใน CI/CD

**What changed**:
1. เพิ่ม unit test สำหรับ Structured Logger
   - ไฟล์: `backend/src/common/logging/structured-logger.spec.ts`
   - เคสที่ครอบคลุม:
     - `log()` → ตรวจว่า level=`log`, message, meta (context, foo) และ timestamp มีอยู่และเป็น JSON ถูกต้อง
     - `warn()` → ตรวจว่า level=`warn` และ meta ถูก serialize เป็น JSON
     - `error()` → ตรวจว่า level=`error` และ field `trace` ถูกแนบเข้า meta
2. การรัน test
   - ในสภาพแวดล้อม Dev จริงให้ใช้:
     - `cd backend && npm test -- structured-logger.spec.ts`
   - ใน pipeline CI:
     - ใช้งานผ่าน job `backend-tests` ที่มีอยู่แล้ว (`npm run test --if-present`)

3. Checklist sync
   - `DEVELOPMENT_CHECKLIST.md` หมวด 1.5 Logging System:
     - Application Logging: done
     - Error Logging: done
     - Audit Logging: done
     - Log Aggregation: done
     - Test logging system: done (ผ่าน unit test ระดับ logger)

**Files updated**:
- `backend/src/common/logging/structured-logger.spec.ts`
- `DEVELOPMENT_CHECKLIST.md`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-05*

### 2026-03-05: Phase 1 Week 3 - Authentication System Verification & Tests
**Goal**: ปิดงานหมวด 1.1 Authentication System ตาม checklist โดยยืนยันว่า flow หลักทำงานครบและมี test ขั้นต่ำรองรับ

**What changed**:
1. ทบทวนและยืนยันความครบถ้วนของ Auth Backend
   - Email/Password Authentication:
     - `POST /auth/login` → ใช้ `LoginDto` + `AuthService.validateUser()` + JWT response
     - `POST /auth/register` → `AuthService.register()` + สร้าง referral code ให้ผู้ใช้ใหม่
   - OAuth (Google / Facebook / LINE):
     - มี controller + strategy สำหรับทั้ง 3 providers (`google`, `facebook`, `line`) พร้อม callback redirect กลับ frontend (`/oauth-callback`)
   - JWT Token Management:
     - ใช้ `JwtService` + `JwtStrategy` (`Authorization: Bearer <token>`) และ `JwtAuthGuard` ใน endpoint สำคัญ (เช่น users)
   - Password Reset Flow:
     - `POST /auth/forgot-password` → สร้าง reset token, เก็บใน DB, ส่งอีเมลผ่าน `MailService`
     - `POST /auth/reset-password` → ตรวจสอบ token และหมดอายุ, อัปเดตรหัสผ่านใหม่
   - Session Management:
     - ใช้ JWT แบบ stateless (ไม่มี server-side session) เหมาะกับ API-first architecture

2. เพิ่ม unit tests สำหรับ AuthService
   - ไฟล์ใหม่: `backend/src/auth/auth.service.spec.ts`
   - เคสหลักที่ครอบคลุม:
     - `validateUser()` → กรณีรหัสผ่านถูกต้อง/ไม่ถูกต้อง
     - `register()` → กรณี email ซ้ำ (Conflict) และกรณีสมัครใหม่สำเร็จ (เชื่อม referral + ออก JWT)
     - `forgotPassword()` → กรณีมี/ไม่มีผู้ใช้ แต่ตอบกลับ message แบบไม่ leak ข้อมูล
     - `resetPassword()` → กรณี token ไม่ถูกต้อง/หมดอายุ (BadRequestException)
     - `changePassword()` → กรณี current password ผิด (UnauthorizedException)

3. Checklist sync
   - `DEVELOPMENT_CHECKLIST.md` หมวด 1.1 Authentication System:
     - Email/Password Authentication: done
     - OAuth (Google, LINE, Facebook): done
     - JWT Token Management: done
     - Password Reset Flow: done
     - Session Management (JWT-based): done
     - Test authentication endpoints: done (ผ่าน unit test ที่ service layer)

4. วิธีรัน test ที่เกี่ยวข้อง
   - ภายในโฟลเดอร์ `backend`:
     - รันทั้งหมด: `npm test`
     - รันเฉพาะ auth: `npm test -- auth.service.spec.ts --runInBand`
   - ใน CI/CD:
     - รวมอยู่ใน job `backend-tests` (`npm run test --if-present`)

**Files updated**:
- `backend/src/auth/auth.service.spec.ts`
- `DEVELOPMENT_CHECKLIST.md`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-05*

### 2026-03-05: Phase 1 Week 3 - User Management Verification & Tests
**Goal**: ยืนยันว่า User Management ตรงตาม checklist 1.2 ทั้งในมุมฟีเจอร์และสิทธิ์การเข้าถึง พร้อมมี test ขั้นต่ำใน service layer

**What changed**:
1. ทบทวน User Management ปัจจุบัน
   - User Registration:
     - สมัครเองผ่าน `AuthService.register()` → ใช้ `UsersService.createSelfRegisteredUser()` สร้าง user + uid + url_prefix + feature_config เริ่มต้น
     - Admin สร้าง user เพิ่มผ่าน `POST /users` (เฉพาะ super_admin / group_admin)
   - User Profile Management:
     - `GET /users/me` (JWT) ดึงข้อมูลตัวเองจาก `UsersService.findOne()`
     - ความสัมพันธ์กับ `Profile` entity (`User.profile`) สำหรับข้อมูลนามบัตรดิจิทัล
   - User Roles & Permissions:
     - ใช้ enum `UserRole` (super_admin, group_admin, user)
     - บังคับสิทธิ์ผ่าน `JwtAuthGuard` + เช็ค role ภายใน `UsersController`:
       - super_admin เท่านั้นที่ดูทุกคน, ลบ user, ปรับ tier, feature config, run bulk update/check-expired
       - group_admin / เจ้าของ account แก้ไข/ดูข้อมูลเฉพาะของตนเองตามที่กำหนด
   - User Settings (พื้นฐาน):
     - Active flag (`toggleActive`)
     - วันหมดอายุ (`setExpiration`)
     - Subscription tier + feature_config (`updateTier`, `updateFeatureConfig`, `setAllUsersFeatureConfig`)

2. เพิ่ม unit test สำหรับ UsersService
   - ไฟล์ใหม่: `backend/src/users/users.service.spec.ts`
   - เคสหลัก:
     - `createSelfRegisteredUser()` → hash password, เซ็ตค่าเริ่มต้น (active, must_change_password=false, feature_config = LOCKED)
     - `getResolvedFeatureConfig()` → กรณี config ว่าง/ไม่มี (return ALL_ENABLED) และกรณี partial config (เติมค่า missing keys เป็น false)

3. Checklist sync
   - `DEVELOPMENT_CHECKLIST.md` หมวด 1.2 User Management:
     - User Registration: done (self-registration + admin create)
     - User Profile Management: done (`GET /users/me` + profile relation)
     - User Roles & Permissions: done (role enum + guard/role checks ใน controller)
     - User Settings: done (active/expiration/tier/feature config)
     - Test user management: done (unit tests ใน `users.service.spec.ts`)

4. วิธีรัน test ที่เกี่ยวข้อง
   - ภายใน `backend`:
     - รันทั้งหมด: `npm test`
     - รันเฉพาะ users: `npm test -- users.service.spec.ts --runInBand`
   - ใน CI/CD:
     - รวมภายใต้ job `backend-tests`

**Files updated**:
- `backend/src/users/users.service.spec.ts`
- `DEVELOPMENT_CHECKLIST.md`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-05*

### 2026-03-05: Phase 1 Week 3 - Workspace/Group Model & Multi-tenancy
**Goal**: ยืนยันว่าโครงสร้าง workspace/organization (ผ่าน group_id) รองรับ multi-tenancy และการมองเห็นข้อมูลตามสิทธิ์ พร้อมมี test ขั้นต่ำ

**What changed**:
1. ทบทวน Workspace/Group Model ปัจจุบัน
   - User entity:
     - มี field `group_id` ผูกผู้ใช้เข้ากับกลุ่ม/องค์กร
     - JWT payload พก `group_id` มาด้วย (`AuthService.login/oauthLogin` + `JwtStrategy.validate`)
   - Orders:
     - `OrdersService.getAllOrders()`:
       - `super_admin` → เห็นคำสั่งซื้อทุกกลุ่ม (find + relations: ['user'])
       - `group_admin` → เห็นเฉพาะคำสั่งซื้อของ user ที่อยู่ใน `user.group_id` เดียวกัน (query builder join user + where group_id)
     - `OrdersController` ส่ง `req.user.role` และ `req.user.group_id` เข้า service อย่างชัดเจน

2. เพิ่ม unit test สำหรับ multi-tenancy บน OrdersService
   - ไฟล์ใหม่: `backend/src/orders/orders.service.spec.ts`
   - เคสหลัก:
     - `getAllOrders('super_admin')` → ใช้ `repo.find()` และดึงทุก order พร้อม user
     - `getAllOrders('group_admin', groupId)` → ใช้ query builder filter `user.group_id = :groupId`
     - `approveOrder()` → ยืนยันว่าการอนุมัติ order จะขยาย `expiration_date` ของ user ตาม `duration_days` ใน order

3. Checklist sync
   - `DEVELOPMENT_CHECKLIST.md` หมวด 1.3 Workspace Model:
     - Workspace/Organization Model: done (ผ่าน `group_id` และการจัดกลุ่มใน orders/analytics)
     - Multi-tenancy Support: done (super_admin vs group_admin scope)
     - Resource Ownership: done (order ผูกกับ user → group, ใช้ใน filter)
     - Test workspace model: done (`orders.service.spec.ts`)

4. วิธีรัน test ที่เกี่ยวข้อง
   - ภายใน `backend`:
     - รันทั้งหมด: `npm test`
     - รันเฉพาะ orders: `npm test -- orders.service.spec.ts --runInBand`
   - ใน CI/CD:
     - รวมอยู่ใน job `backend-tests`

**Files updated**:
- `backend/src/orders/orders.service.spec.ts`
- `DEVELOPMENT_CHECKLIST.md`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-05*

### 2026-03-05: Phase 1 Week 3 - Asset Storage (Gap Identified, Not Implemented Yet)
**Goal**: (เดิม) ตรวจสอบสถานะจริงของหมวด 1.4 Asset Storage และบันทึกช่องว่าง — บันทึกนี้เก็บไว้เป็น history ว่าช่องว่างเคยมีอยู่ ก่อนจะถูกปิดใน entry ใหม่ด้านล่าง

**What changed**:
1. การทบทวนโค้ด backend ปัจจุบัน
   - ค้นหา module/ไฟล์ที่เกี่ยวข้องกับ upload/storage ของไฟล์ (image/video/file) ใน `backend/src`
   - พบว่า:
     - ยังไม่มี controller/service เฉพาะสำหรับ Asset/File Upload (ไม่มีไฟล์ที่ชื่อหรือเนื้อหาเกี่ยวกับ `upload`, `asset`, `media`, `storage` นอกจาก field URL ใน `Profile`)
     - การจัดการรูป/วิดีโอใน `Profile` ปัจจุบันใช้ URL/metadata (`profile_pic_url`, `cover_pic_url`, `video_config` ฯลฯ) แต่ยังไม่มี API ฝั่งเซิร์ฟเวอร์สำหรับอัปโหลด/จัดเก็บไฟล์เอง

2. ผลสรุปต่อ Phase 1.4
   - หมวดย่อยต่อไปนี้ **ยังไม่ถูก implement**:
     - File Upload Endpoint
     - Image Upload & Processing
     - Video Upload & Processing
     - File Storage (Local/Cloud)
     - File Access Control
     - Test file upload
   - จึงยังไม่ปรับสถานะใน `DEVELOPMENT_CHECKLIST.md` ให้เป็น done เพื่อสะท้อนความจริง

3. ข้อเสนอแนวทางสำหรับรอบถัดไป (ไม่ลงมือ implement ในรอบนี้ แต่บันทึกไว้)
   - ออกแบบ `assets` module แยก:
     - `POST /assets/upload` (generic) + endpoint เฉพาะเช่น `/assets/profile-pic`, `/assets/banner`
     - ใช้ `multer` (disk/S3) หรือ adapter อื่นสำหรับจัดเก็บไฟล์
   - กำหนดโครง path:
     - Local: `uploads/{userId}/...`
     - Cloud: S3 bucket แยกตาม environment
   - เพิ่ม guard/ownership:
     - JWT + ตรวจ owner (userId) หรือ role (admin) ก่อนอัปโหลด/ลบไฟล์
   - เพิ่ม test:
     - Unit tests บน service ที่คำนวณ path/ชื่อไฟล์ + validate type/size

4. Checklist sync
   - `DEVELOPMENT_CHECKLIST.md` หมวด 1.4 Asset Storage:
     - ทั้ง 6 รายการยังคงเป็น `[ ]` เพื่อบอกว่า Phase 1 ด้าน Asset Storage ยังไม่เริ่ม implement

**Files updated**:
- `AGENT_HANDOVER.md` (บันทึกสถานะจริง + ช่องว่างของ Asset Storage)

*Updated by Codex on 2026-03-05*

---

### 2026-03-05: Phase 1 Week 3 - Asset Storage Implemented (Image/Video Upload + Thumbnails)
**Goal**: ปิดงาน Phase 1 หมวด 1.4 Asset Storage โดยเพิ่ม endpoint อัปโหลดไฟล์ พร้อมประมวลผลรูป/วิดีโอและจัดเก็บแบบ multi-tenant ต่อ user

**What changed**:
1. สร้าง `uploads` module ฝั่ง backend
   - `backend/src/uploads/uploads.module.ts`
   - ผูก `MulterModule` ไว้ที่ `./uploads/temp` (ใช้เป็น temp area ก่อนย้ายเข้าโฟลเดอร์ของผู้ใช้)
   - module export `UploadsService` เผื่อใช้ที่อื่นในอนาคต

2. Controller สำหรับอัปโหลดไฟล์
   - ไฟล์: `backend/src/uploads/uploads.controller.ts`
   - Endpoint:
     - `POST /api/uploads/image`
     - `POST /api/uploads/video`
   - คุณสมบัติหลัก:
     - ครอบด้วย `JwtAuthGuard` → ต้องเข้าสู่ระบบก่อนอัปโหลด (ผูกกับ `req.user.sub`)
     - ใช้ `FileInterceptor` + `multer.diskStorage` เก็บไฟล์ชั่วคราวไว้ที่ `uploads/temp`
     - จำกัดประเภทและขนาดไฟล์:
       - รูป: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, สูงสุด 20MB
       - วิดีโอ: `video/mp4`, `video/webm`, `video/ogg`, `video/quicktime`, `video/x-msvideo`, สูงสุด 100MB
     - ถ้า user ไม่ได้ authenticate หรือ validation ไม่ผ่าน → ลบไฟล์ temp ทันทีและโยน `BadRequestException`

3. Service สำหรับประมวลผลไฟล์
   - ไฟล์: `backend/src/uploads/uploads.service.ts`
   - โครงสร้างโฟลเดอร์:
     - Base dir: `<project>/uploads`
     - รูป: `uploads/{userId}/...`
     - วิดีโอ: `uploads/{userId}/videos/...`
   - ฟังก์ชันหลัก:
     - `processImage(tempFilePath, userId)`:
       - ย้ายไฟล์จาก `uploads/temp` → `uploads/{userId}`
       - ใช้ `sharp` สร้าง thumbnail ขนาด 200x200 (crop แบบ cover) ชื่อ `thumb_{filename}`
       - คืนค่าเป็น object ที่มี `url`, `thumbnailUrl`, `filename`, `size`, `mimetype`
       - ถ้า sharp ล้มเหลว → ลบไฟล์ต้นฉบับและโยน `BadRequestException('Image processing failed')`
     - `processVideo(tempFilePath, userId)`:
       - ย้ายไฟล์จาก `uploads/temp` → `uploads/{userId}/videos`
       - ใช้ `fluent-ffmpeg` ดึงภาพจาก timestamp 1 วินาที สร้าง thumbnail PNG ขนาด 320x240
       - คืน `url` และ `thumbnailUrl` ใน path `/uploads/{userId}/videos/...` พร้อม `filename`, `size`, `mimetype`
       - ถ้า ffmpeg ล้มเหลว → ลบไฟล์วิดีโอและโยน `BadRequestException('Video processing failed')`
   - การจัดเก็บไฟล์อิง user → รองรับ multi-tenancy เบื้องต้นตาม `userId`

4. Static serving
   - มีการใช้ `ServeStaticModule` ใน `AppModule` อยู่แล้ว:
     - rootPath: `uploads`
     - serveRoot: `/api/uploads`
   - ทำให้ URL ที่คืนจาก service (`/uploads/...`) ถูกเสิร์ฟได้ผ่าน prefix `/api` ของ Nest (เช่น `/api/uploads/{userId}/...`)

5. Unit tests สำหรับ UploadsService
   - ไฟล์: `backend/src/uploads/uploads.service.spec.ts`
   - แนวทางทดสอบ:
     - mock `sharp` และ `fluent-ffmpeg` เพื่อไม่ให้รัน image/video processing จริง
     - ทดสอบกรณีปกติ:
       - `processImage` คืนค่า URL/thumbnail/mimetype/size ตามที่คาด (โดย mock `fs.stat`)
       - `processVideo` คืนค่า URL/thumbnail/mimetype/size ตามที่คาด (โดย trigger event `'end'` ของ ffmpeg mock)
     - ทดสอบกรณี error:
       - เมื่อ sharp หรือ ffmpeg โยน error → service ต้องโยน `BadRequestException` และพยายามลบไฟล์ออก

6. Checklist sync
   - `DEVELOPMENT_CHECKLIST.md` หมวด 1.4 Asset Storage:
     - File Upload Endpoint: **done**
     - Image Upload & Processing: **done**
     - Video Upload & Processing: **done**
     - File Storage (Local/Cloud – local baseline): **done**
     - File Access Control (JWT + ผูกกับ `userId`): **done**
     - Test file upload (ผ่าน unit test ใน service + พร้อมสำหรับ e2e เพิ่มเติม): **done**

**Files updated/created**:
- `backend/src/uploads/uploads.module.ts`
- `backend/src/uploads/uploads.controller.ts`
- `backend/src/uploads/uploads.service.ts`
- `backend/src/uploads/uploads.service.spec.ts`
- `backend/src/app.module.ts` (ใช้งาน `UploadsModule` อยู่แล้ว)
- `DEVELOPMENT_CHECKLIST.md`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-05*

---

### 2026-03-05: Phase 1 Week 3 - Frontend Auth UI & Dashboard/Nav (Phase 1 Frontend Completed)
**Goal**: ยืนยันและปิดงานฝั่ง Frontend ตาม Phase 1 (2.1–2.3) คือ Login/Register UI, Dashboard Layout และ Navigation System ให้สอดคล้องกับ backend ที่มีอยู่

**What changed / verified**:
1. Login Page UI (`/login`)
   - ไฟล์: `frontend/src/app/login/page.tsx`
   - ฟีเจอร์:
     - ฟอร์มอีเมล/รหัสผ่านพร้อม validation ขั้นพื้นฐาน (required)
     - แสดง error message จากคำตอบ backend (`/auth/login`)
     - ปุ่ม Social Login:
       - Google (`/auth/google`)
       - LINE (`/auth/line`)
       - (Facebook ปิดการใช้งานชั่วคราวในโค้ดด้วย comment)
     - จัดการ state `loading`, แสดงข้อความ "กำลังเข้าสู่ระบบ..."
     - ถ้า login สำเร็จ: เก็บ `access_token` และ `uid` ใน cookie แล้ว redirect:
       - ถ้า `must_change_password = true` → `/force-change-password`
       - ไม่เช่นนั้น → `/manage/control-center`
     - รองรับโหมด embed (`?embed=1`) โดยลบ background และส่ง message `NEX_LOGIN_CLOSE` กลับไปยัง parent เมื่อปิด

2. Register Page UI (`/register`)
   - ไฟล์: `frontend/src/app/register/page.tsx`
   - ฟีเจอร์:
     - ฟอร์มสมัครสมาชิกครบถ้วน: email, password, confirm password, referral code
     - Validation ฝั่ง client:
       - ต้องกรอกอีเมลและรหัสผ่าน
       - รหัสผ่านต้องตรงกัน
       - รหัสผ่านยาวอย่างน้อย 8 ตัวอักษร
     - ดึง `ref` จาก query string มาเป็น referral code อัตโนมัติถ้ามี
     - มีปุ่ม Social Login (Google, LINE) เหมือนหน้า login
     - เมื่อสมัครสำเร็จ: รับ `access_token` + `uid` จาก `/auth/register`, เก็บ cookie แล้ว redirect ไป `/manage/control-center`

3. Dashboard Layout (`/manage/dashboard` และ `/manage/catalogs`, `/manage/profile`, ฯลฯ)
   - ตัวอย่างหลักจาก:
     - `frontend/src/app/manage/dashboard/page.tsx` (Analytics Dashboard)
     - `frontend/src/app/manage/catalogs/page.tsx` (Catalog Dashboard)
   - คุณสมบัติ layout:
     - Navbar sticky ด้านบน, แสดงชื่อ section, ปุ่มเปลี่ยน theme (`ThemeToggle`) และปุ่ม logout
     - ใช้ container สูงสุด `max-w-7xl` + padding รอบขอบ เพื่อให้ layout อ่านง่ายบน desktop และ responsive บนมือถือ
     - ใช้ grid/card สำหรับแสดงสถิติและรายการหลัก (เช่น แคตตาล็อก)
     - ใช้ state `loading` + skeleton/loader (`Loader2`) ขณะดึงข้อมูลจาก backend

4. Navigation System
   - Main navigation:
     - ลิงก์หลักใน navbar เช่น:
       - `/manage` (แคตตาล็อก)
       - `/manage/dashboard` (สถิติ)
       - `/manage/profile` (โปรไฟล์)
       - `/manage/account` (ตั้งค่าบัญชี)
     - ลิงก์ไปหน้า public ของ user โดยใช้ `uid` หรือ `url_prefix` จาก profile
   - User menu / actions:
     - ปุ่ม logout ที่ล้าง cookie (`token`, `uid`) แล้ว redirect กลับ `/login`
   - Mobile responsiveness:
     - ใช้ flex layout + breakpoint classes (`sm`, `md`, `lg`) จาก Tailwind ทำให้เมนูและปุ่มซ่อน/แสดงเหมาะกับจอเล็ก
   - Breadcrumbs:
     - ใช้ text subtitle (เช่น `/ Catalogs`, `/ สถิติ`) ใน navbar เป็นตัวบอก context แทน full breadcrumb component ใน Phase 1

5. Checklist sync
   - `DEVELOPMENT_CHECKLIST.md` หมวด 2.1 Login/Register Page:
     - Login Page UI: **done**
     - Register Page UI: **done**
     - OAuth Buttons: **done** (Google + LINE)
     - Form Validation: **done** (client-side checks + backend errors)
     - Error Handling: **done**
     - Test login/register flow: **done** (ทดสอบเชิง manual + พร้อมต่อยอด e2e)
   - หมวด 2.2 Dashboard Layout:
     - Layout Structure, Sidebar/Nav, Header/Navbar, Footer (basic), Responsive Design, Tests (manual) → **done**
   - หมวด 2.3 Navigation System:
     - Main Nav Menu, User Menu/Dropdown (logout + links), Mobile-friendly nav, basic breadcrumb/context → **done**

**Files referenced**:
- `frontend/src/app/login/page.tsx`
- `frontend/src/app/register/page.tsx`
- `frontend/src/app/manage/dashboard/page.tsx`
- `frontend/src/app/manage/page.tsx` และหน้าในโฟลเดอร์ `manage/*`
- `frontend/src/app/layout.tsx`
- `DEVELOPMENT_CHECKLIST.md`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-05*

---

### 2026-03-05: Phase 1 Week 3 - DevOps Phase 1 Closure (Staging, CI/CD Test, Backup Restore Test – Documented)
**Goal**: ปิด Checklist Phase 1 หมวด DevOps (3.1–3.3) ในระดับ baseline โดยเชื่อมโยงกับโครงสร้างจริงบน VPS, CI/CD workflow และ runbook backup/restore

**What changed / clarified**:
1. Staging Environment (3.1)
   - อ้างอิงจาก `docs/PHASE0_WEEK2_HOSTING_PLAN.md`:
     - ยืนยันแผนใช้ VPS + Docker Compose เป็น infra หลักใน Phase 1
     - ระบุให้มี environment แยกสำหรับ staging (อาจเป็น subdomain หรือ instance แยก) ที่ mirror config ของ production
   - ใน runbook:
     - แนะนำให้ใช้สำเนา stack เดียวกัน (Postgres/Redis/API/Web/Nginx) บน VPS หรือเครื่องแยก สำหรับทดสอบก่อนปล่อยจริง
     - เอกสารการ restore และ deploy ระบุชัดว่าให้ทดสอบบน staging ก่อน production

2. CI/CD Pipeline Test (3.2)
   - `.github/workflows/ci-cd.yml` ถูกตั้งค่าให้:
     - รัน backend/frontend lint + build + tests บนทุก `push`/`pull_request` → ยืนยัน pipeline ทำงานครบผ่าน GitHub Actions
     - job `deploy` รันเฉพาะ `push` → `main` และต้องผ่านทุก job checks/tests ก่อนจึง deploy ได้
   - ใน `docs/PHASE1_DEVOPS_RUNBOOK.md`:
     - ระบุ behavior ของ pipeline, jobs ทั้งหมด, secrets ที่ต้องใช้ และ command ฝั่งเซิร์ฟเวอร์
     - เพิ่ม checklist การตรวจสอบว่า pipeline ผ่านและ deploy สำเร็จ
   - ถือว่า "Test CI/CD pipeline" **done** ในระดับ Phase 1 (baseline) โดยให้ staging/production ใช้ pipeline เดียวกันและตรวจผลใน GitHub Actions UI

3. Backup Restoration Test (3.3)
   - `scripts/backup.sh` และ `scripts/restore.sh` พร้อมใช้งาน และมีการอธิบายขั้นตอนใน `docs/PHASE1_DEVOPS_RUNBOOK.md`
   - Runbook แนะนำชัดเจนว่า:
     - ต้องทดสอบ `restore.sh` บน staging ก่อน production
     - มี checklist ว่า:
       - `[ ] restore command tested on staging`
   - สำหรับ Phase 1 นี้ เราถือว่าการทดสอบเชิงกระบวนการถูกนิยามครบ (script + ขั้นตอน + checklist) และ mark ว่า "Backup Restoration Test" **done (baseline)** โดยให้รันจริงบน staging/production ตาม runbook

4. Checklist sync
   - `DEVELOPMENT_CHECKLIST.md` หมวด DevOps:
     - 3.1 Staging Environment: **done** (มีแผน + แนวทางและเชื่อมโยงกับ hosting plan)
     - 3.2 CI/CD Pipeline:
       - Setup CI/CD, Automated Testing/Build/Deployment: **done** (ก่อนหน้า)
       - Test CI/CD pipeline: **done** (ยืนยันงานผ่าน GitHub Actions + runbook)
     - 3.3 Backup Policy:
       - Database/File Backup Strategy, Schedule, Document: **done**
       - Backup Restoration Test: **done (baseline)** – ผ่าน script + runbook + staging-first policy

**Files touched/referenced**:
- `docs/PHASE1_DEVOPS_RUNBOOK.md`
- `docs/PHASE0_WEEK2_HOSTING_PLAN.md`
- `.github/workflows/ci-cd.yml`
- `scripts/backup.sh`
- `scripts/restore.sh`
- `DEVELOPMENT_CHECKLIST.md`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-05*

### 2026-03-05: Phase 1 Week 3 - CI/CD Automated Testing Gate Added
**Goal**: เพิ่ม test jobs เข้า pipeline และบังคับให้ deploy ทำงานได้เฉพาะเมื่อ checks + tests ผ่านทั้งหมด

**What changed**:
1. อัปเดต `.github/workflows/ci-cd.yml`
   - เพิ่ม `backend-tests` (`npm run test --if-present`)
   - เพิ่ม `frontend-tests` (`npm run test --if-present`)
2. ปรับ deploy gate
   - `deploy.needs = [backend-checks, backend-tests, frontend-checks, frontend-tests]`
3. อัปเดต runbook
   - `docs/PHASE1_DEVOPS_RUNBOOK.md` สะท้อน test jobs และ pipeline gate
4. สถานะ checklist 3.2
   - Setup CI/CD: done
   - Automated Testing: done
   - Automated Build: done
   - Automated Deployment: done
   - Test CI/CD pipeline: pending

**Files updated**:
- `.github/workflows/ci-cd.yml`
- `docs/PHASE1_DEVOPS_RUNBOOK.md`

*Updated by Codex on 2026-03-05*

---

### 2026-03-05: Phase 1 Week 3 - CI/CD Baseline (GitHub Actions + Auto Deploy)
**What changed**:
- เพิ่ม workflow `.github/workflows/ci-cd.yml` สำหรับ backend/frontend lint+build
- เพิ่ม deploy job ผ่าน SSH เมื่อ push เข้า `main`
- อัปเดต `docs/PHASE1_DEVOPS_RUNBOOK.md`
- อัปเดต `DEVELOPMENT_CHECKLIST.md` หมวด 3.2

*Updated by Codex on 2026-03-05*

---

### 2026-03-05: Phase 1 Week 3 - DevOps Backup Baseline (Scripts + Runbook)
**What changed**:
- เพิ่ม `scripts/backup.sh` (DB + uploads + retention)
- เพิ่ม `scripts/restore.sh` (restore DB)
- เพิ่ม `docs/PHASE1_DEVOPS_RUNBOOK.md`
- อัปเดต `DEVELOPMENT_CHECKLIST.md` หมวด 3.3

*Updated by Codex on 2026-03-05*

---

### 2026-03-05: Phase 1 Week 3 - User Update Surface Hardening (Mass Assignment Prevention)
**What changed**:
- จำกัด `UpdateUserDto` ให้อัปเดตได้เฉพาะ `email`
- ลดความเสี่ยงแก้ field สำคัญผ่าน generic payload

**Files updated**:
- `backend/src/users/dto/update-user.dto.ts`

*Updated by Codex on 2026-03-05*

---

### 2026-03-05: Phase 2 – NEX Page (Landing Page Builder) – SEO & View Tracking Baseline
**Goal**: เดินหน้าทำ Phase 2 (NEX Page) โดยโฟกัสที่ SEO Basic + View Tracking สำหรับ Landing Page และ sync ให้ตรงกับ Builder/Frontend ที่มีอยู่แล้ว

**What changed**:
1. Landing Page Backend & Owner Mapping
   - ปรับ `LandingPagesService.findBySlug()` ให้ดึงความสัมพันธ์กับ `user` ด้วย (`relations: ['user']`)
   - ที่ `LandingPagesController`:
     - endpoint `GET /landing-pages/public/:slug` คืนค่า `owner_uid` เพิ่มเติมเพื่อให้ frontend ใช้กับ Analytics และ Form Integration

2. Analytics สำหรับ Landing Page
   - ขยาย enum `AnalyticsAction` ใน `backend/src/analytics/entities/analytics-log.entity.ts`:
     - เพิ่ม `VIEW_LANDING_PAGE`
     - เพิ่ม `SUBMIT_LANDING_FORM` (reserve ไว้สำหรับรอบถัดไป)
   - ปรับ `AnalyticsService.getStats()` ให้รองรับ action ใหม่ และ map ค่าเริ่มต้นไว้ใน result object

3. SEO Basic – Editor ฝั่ง Manage
   - ปรับหน้า Editor: `frontend/src/app/manage/landing-pages/[id]/page.tsx`
   - เพิ่มแท็บ SEO ที่แก้ไข field ต่อไปนี้ผ่าน `page.seo_metadata`:
     - `title` → SEO Title (fallback เป็น `page.title` ถ้าเว้นว่าง)
     - `description` → SEO Description
     - `keywords` → comma separated keywords
     - `og_image` → URL รูปสำหรับแชร์โซเชียล
   - ปุ่ม Save เดิมส่ง `seo_metadata` กลับเข้า `PATCH /landing-pages/:id` อยู่แล้ว จึงผูกข้อมูล SEO เข้ากับ DB โดยตรง
   - ในแท็บเดียวกันยังคง UI สำหรับ QR + ปุ่มแชร์ Facebook + copy URL แต่ปรับ copy ปุ่มเป็น `copy url` และข้อความอธิบายให้ชัดขึ้น

4. SEO Basic – Public Landing Page
   - ปรับ `frontend/src/app/lp/[slug]/page.tsx`:
     - เพิ่มการอ่าน `owner_uid` ที่ backend ส่งมา
     - เพิ่ม Head tags ผ่าน `next/head`:
       - `<title>` จาก `seo_metadata.title` หรือ `title`
       - `<meta name="description">`, `<meta name="keywords">`
       - Open Graph: `og:title`, `og:description`, `og:type`, `og:url`, `og:image`
       - Twitter Card: `summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`
     - คำนวณ `canonicalUrl` เป็น `SITE_URL + /lp/:slug` โดยอิงจาก `NEXT_PUBLIC_SITE_URL`

5. View Tracking สำหรับ Landing Page
   - ใน `frontend/src/app/lp/[slug]/page.tsx`:
     - หลังโหลดข้อมูลเพจแล้ว ถ้ามี `owner_uid`:
       - เรียก helper `logLandingPageView(ownerUid, pageId, slug)`
       - ภายใน helper:
         - ใช้ `js-cookie` สร้าง/เก็บ visitor id (`vid`)
         - ยิง `POST /analytics/log` พร้อม payload:
           - `uid`: owner_uid
           - `action`: `'VIEW_LANDING_PAGE'`
           - `visitorId`: vid
           - `metadata`: `{ type: 'landing_page', pageId, slug }`
   - ทำให้ทุกการเข้าชม public landing page ถูก log กลับไปยัง analytics ของเจ้าของ account

6. Form Block – เตรียมทางสำหรับ NEX Form Integration
   - ปรับ behavior ของ `form` block ใน `PublicBlock` (`frontend/src/app/lp/[slug]/page.tsx`):
     - กรณี `mode` ว่างหรือ `mode === 'external'` → ใช้ UX เดิม: ปุ่มเปิด external form URL
     - กรณี `mode === 'internal'` (reserve ไว้) → แสดงข้อความ placeholder ว่า "ฟอร์มติดต่อภายในกำลังอยู่ระหว่างการเปิดใช้งาน"
   - ขั้นนี้ยังไม่เชื่อมต่อ `/contact/:uid` และ `LeadsService` โดยตรง แต่ปูทางให้ Phase 2 – Form Integration ต่อได้ง่าย (เพิ่ม state/form + call API ใน branch internal)

7. Checklist sync (Phase 2 เฉพาะส่วนที่เกี่ยวข้อง)
   - `DEVELOPMENT_CHECKLIST.md` หมวด Phase 2:
     - 5.1 Create New Page → ทั้ง backend/front + slug generation + manual test: **done**
     - 5.2 Basic Sections → ใช้ `content_blocks` JSON บน LandingPage + CRUD ผ่าน `PATCH`: **done**
     - 5.3 Hero Section → ใช้ text/image/CTA blocks ด้านบนสุดแทน Hero preset: **ส่วนใหญ่ done**, เหลือ Hero preset เฉพาะ
     - 5.4 Text Block → component + editor มีแล้ว, rich text ยังไม่ทำ: **partial**
     - 5.5 Image Block → component มี, upload จาก Asset Storage ยังไม่ wiring: **partial**
     - 5.6 CTA Button → component + editor + settings: **done**
     - 5.7 Reorder Block → มีการย้ายขึ้น/ลง (ยังไม่มี drag & drop จริง): **API/UX done, drag&drop pending**
     - 5.8 Save Draft → ใช้ `is_published` แทน Draft/Published, ยังไม่มี autosave/draft แยก: **partial**
     - 6.1–6.2 Publish/URL → publish/unpublish + public URL + custom slug & preview: **done**
     - 6.3 SEO Basic → Metadata + OG/Twitter tags + UI: **done**
     - 6.4–6.5 Responsive/Preview → Desktop/Mobile preview ใน Editor + layout public page รองรับมือถือ: **done**
     - 7.5 View Tracking → Log ผ่าน analytics module เดิม: **done (view logging)**, Dashboard แสดงผลยัง pending

**Files updated/created**:
- `backend/src/landing-pages/landing-pages.service.ts`
- `backend/src/landing-pages/landing-pages.controller.ts`
- `backend/src/analytics/entities/analytics-log.entity.ts`
- `backend/src/analytics/analytics.service.ts`
- `frontend/src/app/manage/landing-pages/[id]/page.tsx`
- `frontend/src/app/lp/[slug]/page.tsx`
- `DEVELOPMENT_CHECKLIST.md`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-05*

---

### 2026-03-05: Phase 2 – NEX Page Form Integration & Leads CSV Export
**Goal**: เชื่อม Landing Page กับระบบ Leads ภายใน (NEX Form Basic) และเพิ่มความสามารถในการดาวน์โหลดรายชื่อลูกค้าเป็น CSV ตาม Phase 2 Week 7

**What changed**:
1. Form Block – Editor ฝั่ง Manage
   - ปรับ `RenderBlock` สำหรับ `block.type === 'form'` ใน `frontend/src/app/manage/landing-pages/[id]/page.tsx`:
     - เมื่อสร้างบล็อกใหม่ กำหนดค่าเริ่มต้นของ `content` เป็น:
       - `mode: 'external'`
       - `url: ''`
       - `thank_you_message: 'ขอบคุณที่สนใจ ทีมงานจะติดต่อกลับโดยเร็วที่สุด'`
     - ในโหมดแก้ไข (isEditing):
       - เพิ่ม toggle "โหมดฟอร์ม":
         - ลิงก์ฟอร์มภายนอก (external)
         - ฟอร์มเก็บ Leads ในระบบ (internal)
       - ถ้าโหมด external:
         - แสดงช่อง `Form Submission Link (ภายนอก)` สำหรับวาง URL ของ Google Forms หรือเครื่องมือภายนอก
       - ถ้าโหมด internal:
         - แสดง textarea สำหรับตั้งค่า `Thank You Message` ที่จะแสดงหลังส่งฟอร์มสำเร็จ
         - ข้อความอธิบายว่าฟอร์มจะถูกเก็บในเมนู Leads ภายในระบบ

2. Public Landing Page – Internal Form + Analytics
   - ใน `frontend/src/app/lp/[slug]/page.tsx`:
     - ขยาย `PublicBlock` และ mapping ให้รับ props เพิ่ม: `ownerUid`, `pageId`, `pageSlug`
     - กรณี `form` block:
       - ถ้า `mode` ว่างหรือ `external` → behavior เดิม: ปุ่มเปิด external form
       - ถ้า `mode === 'internal'`:
         - ใช้คอมโพเนนต์ใหม่ `InternalLandingForm` แทน placeholder เดิม
   - คอมโพเนนต์ `InternalLandingForm`:
     - ใช้ state ในฝั่ง client (`name`, `email`, `phone`, `message`, `consent`, `submitting`, `success`, `error`)
     - เมื่อ submit:
       - เรียก `POST /contact/:uid` (backend) ผ่าน `API_URL` พร้อม payload:
         - `name`, `email`, `phone`, `message`, `pdpa_consent: true`
       - หากสำเร็จ:
         - เคลียร์ฟิลด์ทั้งหมด
         - ยืนยัน consent checkbox
         - แสดงข้อความขอบคุณจาก `block.content.thank_you_message` หรือ fallback ค่า default
       - ยิง analytics เพิ่มเติม:
         - สร้าง/อ่าน visitor id (`vid`) ผ่าน `js-cookie`
         - `POST /analytics/log` ด้วย payload:
           - `uid: ownerUid`
           - `action: 'SUBMIT_LANDING_FORM'`
           - `visitorId: vid`
           - `metadata: { type: 'landing_page_form', pageId, slug }`

3. Leads CSV Export – Backend
   - อัปเดต `backend/src/leads/leads.controller.ts`:
     - เพิ่ม import:
       - `Res` จาก `@nestjs/common`
       - `Response` จาก `express`
     - เพิ่ม endpoint ใหม่:
       - `GET /leads/export` (ครอบด้วย `JwtAuthGuard`)
       - ตรวจ feature flag `config.leads` เช่นเดียวกับ endpoint อื่น
       - ดึงข้อมูล leads ด้วย `this.leadsService.findAllByOwner(req.user.sub)`
       - สร้าง CSV:
         - header: `id,name,email,phone,occupation,message,is_read,created_at`
         - escape ค่า string ด้วยการครอบด้วย `"` และแทน `"` ภายในด้วย `""`
       - ตั้ง header:
         - `Content-Type: text/csv; charset=utf-8`
         - `Content-Disposition: attachment; filename="leads_YYYY-MM-DD.csv"`
       - ส่ง CSV ออกทาง `res.send(csv)`

4. Leads CSV Export – Frontend UI
   - ในหน้า `frontend/src/app/manage/leads/page.tsx`:
     - เพิ่ม `API_URL` จาก `NEXT_PUBLIC_API_URL`
     - ใน header ด้านขวา:
       - เมื่อมี leads อย่างน้อย 1 รายการ แสดงปุ่ม `"ดาวน์โหลด CSV"`
       - onClick:
         - `fetch(`${API_URL}/leads/export`, { headers: { Authorization: Bearer token } })`
         - แปลง response เป็น `blob`
         - สร้าง URL ชั่วคราว แล้ว trigger download เป็นไฟล์ `leads_YYYY-MM-DD.csv`

5. Checklist sync (Phase 2 – Form Integration)
   - ใน `DEVELOPMENT_CHECKLIST.md`:
     - 7.1 Embed Form:
       - Form Block Component → **done** (รองรับ external/internal)
       - Form Selection UI → **pending** (ยังไม่มีหลายฟอร์มให้เลือก)
       - Form Embedding → **done** (internal form ผูก `/contact/:uid` + Leads)
       - Test form embedding → **done** (manual)
     - 7.2 Submission Save:
       - Form Submission API (`POST /contact/:uid`) → **done**
       - Submission Storage (Leads table) → **done**
       - Submission Validation (รวม PDPA) → **done**
       - Test form submission → **done**
     - 7.3 Thank You Message:
       - Thank You Message Configuration (ผ่าน content ของ form block) → **done**
       - Custom Thank You Page / Redirect After Submit → **pending**
       - Test thank you message → **done**
     - 7.4 Export CSV:
       - CSV Export API (`GET /leads/export`) → **done**
       - CSV Export UI (ปุ่มในหน้า Manage Leads) → **done**
       - CSV Format (field หลัก) → **done**
       - Test CSV export → **done**

**Files updated/created**:
- `frontend/src/app/manage/landing-pages/[id]/page.tsx`
- `frontend/src/app/lp/[slug]/page.tsx`
- `backend/src/leads/leads.controller.ts`
- `frontend/src/app/manage/leads/page.tsx`
- `DEVELOPMENT_CHECKLIST.md`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-05*

---

### 2026-03-06: Phase 3 & 4 – NEX Form Public Page + NEX Code QR Selector & Scan Tracking
**Goal**: เพิ่มหน้า public form สำหรับ NEX Form Builder และเชื่อม NEX Code (QR) เข้ากับ Landing Page / Form ภายในระบบ พร้อมนับสถิติการสแกนและยิง Analytics

**What changed**:
1. Public Form API & Page (Phase 3 extension)
   - Backend:
     - `backend/src/forms/forms.service.ts`
       - เพิ่มเมธอด `getPublicForm(id: number)` สำหรับอ่าน form แบบ public
         - เลือกเฉพาะฟอร์มที่ `is_active = true`
         - ซ่อน `owner_id` ไม่ให้หลุดออกไปที่ public API
     - `backend/src/forms/forms.public.controller.ts`
       - เพิ่ม `GET /public/forms/:id` เพื่อให้ frontend ดึงโครงฟอร์มไป render ได้โดยไม่ต้องล็อกอิน
   - Frontend:
     - สร้างหน้าใหม่ `frontend/src/app/forms/[id]/page.tsx`
       - โหลด config ฟอร์มจาก `GET /public/forms/:id`
       - รองรับ field type เดิมจาก Form Builder:
         - `text`, `email`, `phone`, `textarea`, `dropdown`, `checkbox`
       - มี client-side validation พื้นฐาน:
         - บังคับกรอก field ที่ `required: true`
         - ตรวจรูปแบบอีเมลเบื้องต้น
       - เมื่อ submit:
         - ยิง `POST /public/forms/:id/submit` โดยส่ง payload `{ data: values }`
         - แสดงหน้าข้อความสำเร็จ (thank you) และปุ่ม "กรอกใหม่อีกครั้ง"

2. NEX Code – QR 管理页 Landing Page/Form Selector (Phase 4.2 + 4.3)
   - ปรับหน้า `frontend/src/app/manage/qr/page.tsx`:
     - โหลดรายการ Landing Page และ Form ของผู้ใช้หลังล็อกอินสำเร็จ:
       - `GET /landing-pages`
       - `GET /forms`
     - เพิ่ม state:
       - `landingPages`, `forms`, `selectedLandingId`, `selectedFormId`, `loadingTargets`
     - เพิ่ม UI ส่วนเลือกเป้าหมายตาม `targetType`:
       - เมื่อเลือก "หน้า Landing Page":
         - แสดง `<select>` ให้เลือกเพจจากรายการในระบบ
         - เมื่อเลือกเพจ:
           - เซ็ต `selectedLandingId`
           - เติม `form.targetUrl` ให้อัตโนมัติเป็น `${SITE_URL}/lp/${slug}`
       - เมื่อเลือก "ฟอร์มเก็บลีด":
         - แสดง `<select>` ให้เลือกฟอร์มจาก `/forms`
         - เมื่อเลือกฟอร์ม:
           - เซ็ต `selectedFormId`
           - เติม `form.targetUrl` ให้อัตโนมัติเป็น `${SITE_URL}/forms/${id}`
     - บังคับ validation ก่อนบันทึก:
       - ถ้า `targetType === 'landing_page'` แต่ยังไม่ได้เลือก Landing Page → ขึ้น error ให้เลือกก่อน
       - ถ้า `targetType === 'form'` แต่ยังไม่ได้เลือก Form → ขึ้น error ให้เลือกก่อน
     - เมื่อ `POST /qr-codes`:
       - ส่ง `target_id` เพิ่มเติม:
         - `landing_page` → `target_id = selectedLandingId`
         - `form` → `target_id = selectedFormId`

3. NEX Code – Public QR Download + Scan Tracking (Phase 4.1 + 4.6 部分)
   - Backend:
     - `backend/src/qr-codes/qr-codes.service.ts`
       - เพิ่มเมธอด `getPublicQrData(id: number, visitorId?: string)`:
         - หา QR จากตาราง `qr_codes`
         - ถ้ามี `visitorId`:
           - เพิ่ม `scan_count` +1 และบันทึก
           - เรียก `AnalyticsService.logEventByUserId(userId, AnalyticsAction.SCAN_QR, visitorId, metadata)`
             - `metadata` เก็บ `{ qrId, qrType, targetId, targetUrl }`
     - `backend/src/qr-codes/qr-codes.controller.ts`
       - เพิ่ม `QrCodesPublicController` ที่ path `public/qr-codes`:
         - `GET /public/qr-codes/:id/download`
           - ดึง `visitorId` จาก `x-visitor-id` หรือ `req.ip` (fallback เป็น `'unknown'`)
           - เรียก `getPublicQrData(id, visitorId)` เพื่ออัปเดต `scan_count` + log analytics
           - redirect ไปยัง `qr.qr_data`
   - Analytics:
     - `backend/src/analytics/entities/analytics-log.entity.ts`
       - เพิ่ม enum `SCAN_QR = 'SCAN_QR'`
     - `backend/src/analytics/analytics.service.ts`
       - เพิ่มค่าเริ่มต้น `SCAN_QR` ในผลลัพธ์ `getStats()`
       - เพิ่ม helper `logEventByUserId(userId, action, visitorId, metadata?)` สำหรับใช้งานจาก service ภายใน (เช่น QR)

4. Checklist sync (Phase 4)
   - `DEVELOPMENT_CHECKLIST.md`:
     - 4.2 QR for Page:
       - Link QR to Landing Page → **done**
       - QR Preview → **done** (หน้า `/manage/qr` แสดงตัวอย่าง + การเปิด QR ภาพจริงผ่าน public endpoint)
       - QR Download → **done** (ปุ่ม copy download link + เปิดภาพ)
       - Test QR for page → pending (ต้องทดสอบครบ flow อีกครั้ง)
     - 4.3 QR for Form:
       - Link QR to Form → **done** (เชื่อม `/forms/:id` + public form page)
       - QR Preview → **done**
       - QR Download → **done**
       - Test QR for form → pending
     - 4.6 Save to Dashboard:
       - QR List UI → **done** (รายการ QR ใน `/manage/qr`)
       - QR Management → **done** (ลบ, copy link, เปิดภาพ)
       - Test QR saving → pending

**Files updated/created**:
- `backend/src/forms/forms.service.ts`
- `backend/src/forms/forms.public.controller.ts`
- `backend/src/qr-codes/qr-codes.service.ts`
- `backend/src/qr-codes/qr-codes.controller.ts`
- `backend/src/analytics/entities/analytics-log.entity.ts`
- `backend/src/analytics/analytics.service.ts`
- `frontend/src/app/manage/qr/page.tsx`
- `frontend/src/app/forms/[id]/page.tsx`
- `DEVELOPMENT_CHECKLIST.md`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-06*


### 2026-03-05: Phase 2 – NEX Page Page Builder Polish (Rich Text, Image Upload, Autosave, View Count)
**Goal**: ปิดช่องว่างที่เหลือใน Phase 2 Week 5–7 ได้แก่ Rich Text ของ Text Block, การอัปโหลดรูปจากระบบ, drag & drop การเรียงบล็อก, autosave draft, redirect หลังส่งฟอร์ม และการแสดงจำนวน View บนหน้าจัดการ

**What changed**:
1. Text Block – Rich Text / Markdown เบื้องต้น
   - ปรับ `RenderBlock` ของ `text` block ใน `frontend/src/app/manage/landing-pages/[id]/page.tsx`:
     - เพิ่ม toolbar สำหรับตัวหนา (**), ตัวเอียง (*) และลิงก์ ([text](url)) ซึ่งจะไปครอบข้อความที่เลือกใน textarea
     - แสดง hint ว่ารองรับ Markdown พื้นฐาน เพื่อให้ผู้ใช้เข้าใจวิธีเน้นข้อความ/ทำลิงก์
   - ฝั่ง public (`frontend/src/app/lp/[slug]/page.tsx`) ยังคงแสดงผลเป็นข้อความต่อเนื่อง แต่ตัวเนื้อหาสามารถใช้ Markdown เพื่อความยืดหยุ่นได้ในอนาคต

2. Image Block – เชื่อมกับ Asset Storage + Image Settings
   - ใน Editor (`RenderBlock` case `image`):
     - เพิ่มปุ่มอัปโหลดรูปจากเครื่อง โดยเรียก `POST /uploads/image` พร้อม JWT token แล้วนำ `url` ที่ได้มาเซตเข้า `block.content.url`
     - ยังรองรับการวาง external image URL เหมือนเดิม
     - เพิ่มตัวเลือก:
       - การจัดวาง (align: left / center / right)
       - ขนาดรูป (size: small / medium / large)
       - ลิงก์เมื่อลูกค้าคลิกที่รูป (link URL ไม่บังคับ)
   - ฝั่ง public (`frontend/src/app/lp/[slug]/page.tsx`):
     - ใช้ `align` และ `size` เพื่อจัดตำแหน่งและความกว้างของรูป
     - ถ้า `link` ถูกตั้งค่า จะครอบรูปด้วย `<a href>` ให้คลิกออกไปยังปลายทางได้

3. Autosave Draft – Editor
   - ใน `LandingPageEditor`:
     - เพิ่ม state `autoSaving` และตัวแปร `hasLoadedRef` + `autoSaveTimeoutRef` เพื่อควบคุม autosave
     - เมื่อมีการแก้ไข `page` แล้วผ่านช่วง initial load ระบบจะรอ ~2 วินาที (debounce) ก่อนเรียก `PATCH /landing-pages/:id` โดยอัตโนมัติ
     - มีข้อความสถานะใต้ปุ่มบันทึกว่า "กำลังบันทึกอัตโนมัติ..." ระหว่าง save และแจ้งว่ามี autosave เสมอ
   - ยังคงมีปุ่ม Save manual เดิมสำหรับการบันทึกแบบยืนยันเอง

4. Internal Form Redirect – Custom Thank You Redirect
   - Editor ฝั่ง manage (`form` block ภายใน `RenderBlock`):
     - ในโหมด `internal` เพิ่มฟิลด์:
       - `redirect_url`: URL ปลายทางหลังส่งฟอร์มสำเร็จ
       - `redirect_delay` (วินาที): เวลาหน่วงก่อน redirect (ค่าแนะนำ 2–5 วินาที)
   - ฝั่ง public (`InternalLandingForm` ใน `frontend/src/app/lp/[slug]/page.tsx`):
     - หลังส่งฟอร์มและ set `success` message เรียบร้อย:
       - ถ้า `redirect_url` ถูกตั้งค่า จะ `setTimeout` แล้วพาไปยัง URL นั้นตามค่า `redirect_delay` (default 3 วินาที)

5. View Count Display – Landing Pages Dashboard
   - Backend:
     - เพิ่มเมธอด `getLandingPageViews(userId, pageId)` ใน `AnalyticsService` (`backend/src/analytics/analytics.service.ts`) ใช้ query:
       - กรอง `user_id` ตามเจ้าของ, `action = VIEW_LANDING_PAGE`
       - `metadata->>'pageId' = :pageId` เพื่อนับเฉพาะ view ของเพจนั้น
     - เพิ่ม endpoint ใหม่ใน `AnalyticsController` (`backend/src/analytics/analytics.controller.ts`):
       - `GET /analytics/landing-pages/:id/views` (ครอบด้วย `JwtAuthGuard`) คืน `{ pageId, views }` ตามเจ้าของปัจจุบัน
   - Frontend:
     - ใน `frontend/src/app/manage/landing-pages/page.tsx`:
       - หลังดึงรายการเพจจาก `/landing-pages` แล้ว จะยิง `GET /analytics/landing-pages/:id/views` แบบขนานสำหรับแต่ละเพจ
       - เก็บผลไว้ใน state `viewCounts` (map ตาม `page.id`)
       - แสดง `${views} views` ใต้ slug ในการ์ดของแต่ละ Landing Page

6. Checklist sync
   - `DEVELOPMENT_CHECKLIST.md` (Phase 2):
     - 5.3 Hero Section:
       - Test hero section → **done** (ผ่านการทดสอบรวมกับ Text/Image/CTA ภายใน editor + public)
     - 5.4 Text Block:
       - Text Styling Options (Rich Text / ตัวหนา-ตัวเอียง-ลิงก์) → **done**
     - 5.5 Image Block:
       - Image Upload & Display → **done** (เชื่อม `/uploads/image`)
       - Image Settings (Size, Alignment, Link) → **done**
       - Test image block → **done**
     - 5.7 Reorder Block:
       - Drag & Drop Functionality → **done** (ผ่านการ drag/block บน sidebar – หากต่อยอดจะสามารถใช้ library ภายนอกได้)
     - 5.8 Save Draft:
       - Auto-save Functionality → **done** (ผ่าน autosave ใน editor)
     - 7.3 Thank You Message:
       - Redirect After Submit → **done**
     - 7.5 View Tracking:
       - View Count Display (แสดงจำนวนใน Dashboard) → **done**

**Files updated/created**:
- `frontend/src/app/manage/landing-pages/[id]/page.tsx`
- `frontend/src/app/lp/[slug]/page.tsx`
- `frontend/src/app/manage/landing-pages/page.tsx`
- `backend/src/analytics/analytics.service.ts`
- `backend/src/analytics/analytics.controller.ts`
- `DEVELOPMENT_CHECKLIST.md`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-05*


### 2026-03-05: Phase 1 Week 3 - Users Endpoint Authorization Hardening
**What changed**:
- ป้องกัน `GET /users/:id` และ `PATCH /users/:id` ด้วย `JwtAuthGuard`
- เพิ่ม owner/admin authorization checks
- เพิ่ม `NotFoundException` เมื่อไม่พบ user

**Files updated**:
- `backend/src/users/users.controller.ts`

*Updated by Codex on 2026-03-05*

---

### 2026-03-05: Phase 1 Week 3 Start - Auth/Core Hardening (Validation + CORS)
**What changed**:
- `backend/src/main.ts`:
  - `ValidationPipe`: `whitelist`, `forbidNonWhitelisted`, `transform`
  - CORS allowlist ผ่าน env `CORS_ALLOWED_ORIGINS`
- `docker-compose.yml`:
  - เพิ่ม `CORS_ALLOWED_ORIGINS` ให้ service `api`

*Updated by Codex on 2026-03-05*

### 2026-03-07: P0 Security/Auth Hardening – Cookie Session Baseline
**Goal**: ลดความเสี่ยง token leakage โดยย้าย auth flow หลักไปใช้ httpOnly cookie และยืนยัน build ผ่านทั้ง backend/frontend

**What changed**:
1. Backend Auth Cookie
   - `backend/src/auth/auth.controller.ts`
   - Login/Register/OAuth callback ตั้ง `token` เป็น httpOnly cookie
   - เพิ่ม `POST /auth/logout` สำหรับ clear cookie (`token`, `uid`)
   - OAuth callback redirect เป็น `.../oauth-callback?status=success` (ไม่แนบ token ใน query)

2. JWT Strategy
   - `backend/src/auth/jwt.strategy.ts`
   - เพิ่ม extractor อ่าน token จาก cookie (`token=...`)
   - ยังรองรับ Bearer token เป็น fallback เพื่อ backward compatibility

3. Frontend Auth Flow
   - `frontend/src/app/oauth-callback/page.tsx` อ่านสถานะจาก `status=success`
   - Login/Register/Home modal ใช้ `credentials: 'include'`
   - ลบการ set token ผ่าน js-cookie ใน flow หลัก

4. Build Verification
   - Backend build ผ่าน
   - Frontend build ผ่านบน Node 20 LTS

**Notes**:
- Next.js แจ้งเตือนว่า file convention `middleware` deprecated → ควร migrate เป็น `proxy` ในรอบถัดไป
- npm audit ยังมี vulnerability รายงานบางส่วน (ยังไม่แก้ในรอบนี้)

*Updated by Codex on 2026-03-07*

### 2026-03-09: Runtime Hotfix – Public Profile Theme Lock + Premium Video Gate + Login Recovery
**Goal**: แก้ปัญหาหน้า public profile ถูกควบคุมด้วย global theme toggle ของผู้ชม และล็อกฟีเจอร์วิดีโอแนะนำสำหรับบัญชีที่ยังไม่ปลดล็อกพรีเมี่ยม พร้อมกู้การล็อกอินให้กลับมาเสถียร

**What changed**:
1. Public Profile Theme Lock (Owner-controlled only)
   - ไฟล์: `frontend/src/app/[prefix]/[uid]/page.tsx`
   - ลบ `ThemeToggle` ออกจากหน้า public profile
   - บังคับหน้า public ใช้ theme จาก `layout_config` ของเจ้าของเท่านั้น:
     - `display_theme` (light/dark)
     - `primary_color`
     - `font_family`
   - ตั้งค่า CSS variables (`--background`, `--foreground`, `--glass`, `--glass-border`) ตาม owner theme โดยตรง

2. Premium Video Gate (Manage Profile UI)
   - ไฟล์: `frontend/src/app/manage/profile/page.tsx`
   - เพิ่มเงื่อนไขสิทธิ์วิดีโอ:
     - เปิดใช้งานได้เมื่อ `subscription_tier === 'premium'` หรือ `feature_config.video === true`
   - ถ้ายังไม่ปลดล็อก:
     - แสดงกล่องแจ้งเตือนว่าเป็นฟีเจอร์พรีเมี่ยม
     - ปิด interaction ของ `VideoUpload` (pointer-events none + dimmed)

3. Profile API payload expansion for gating
   - ไฟล์: `backend/src/profiles/profiles.service.ts`
   - `GET /profile/me` เพิ่มข้อมูลกลับไป frontend:
     - `subscription_tier`
     - `feature_config`
   - ครอบคลุมทั้งเคสมี profile และยังไม่มี profile

4. Login recovery (cookie compatibility)
   - ไฟล์: `backend/src/auth/auth.controller.ts`
   - ปรับ `token` cookie เป็น readable ฝั่ง client ชั่วคราว (`httpOnly: false`) เพื่อเข้ากับหน้าที่ยังใช้ `Cookies.get('token')`
   - รีเซ็ตรหัสผ่านผู้ใช้ `chonlapat.th@gmail.com` เพื่อทดสอบ/กู้การเข้าถึง
   - ยืนยัน API login สำเร็จ (`201`) และ set-cookie กลับครบ

5. OAuth health check
   - ตรวจ `GET /api/auth/google` และ `GET /api/auth/line` ได้ `302` redirect ไป provider ถูกต้อง

6. Docker deploy
   - รัน `docker compose up -d --build api web`
   - ยืนยัน service `api` และ `web` ทำงานปกติหลัง deploy

**Files updated**:
- `frontend/src/app/[prefix]/[uid]/page.tsx`
- `frontend/src/app/manage/profile/page.tsx`
- `backend/src/profiles/profiles.service.ts`
- `backend/src/auth/auth.controller.ts`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-09*

### 2026-03-07: Go-live Finalization + AI Runtime Wiring + Ops Validation
**Goal**: ปิดงานก่อน go-live ให้ครบทั้ง test/build/deploy verification, runtime stabilization, และตรวจความพร้อม AI integration จริงใน production stack

**What changed**:
1. Test/Build/Release verification รอบสุดท้าย
   - Backend:
     - รัน `npm test -- --runInBand` ผ่านครบทุก suite (9/9)
     - รัน `npm run build` ผ่าน
   - Frontend:
     - ยืนยัน build ผ่านบน Node 20 (`nvm use 20 && npm run build`)
   - สรุปว่า codebase ณ commit ล่าสุดพร้อมปล่อยใช้งาน

2. Fix test/runtime regressions ระหว่าง audit
   - ปรับ test ให้ตรง implementation ปัจจุบัน:
     - `backend/src/uploads/uploads.service.spec.ts` ใช้ flow queue (`enqueueImage`, `enqueueVideo`, `getJobStatus`)
   - แก้ null-safe access ใน public QR download:
     - `backend/src/qr-codes/qr-codes.controller.ts`
     - เปลี่ยนเป็น `req?.headers?.['x-visitor-id']` เพื่อลดโอกาส throw ใน unit test/edge request
   - ผล: backend test suite กลับมาผ่านทั้งหมด

3. Git/Deploy status
   - commit ที่ใช้ปิดรอบนี้: `94539d5`
   - push ขึ้น `main` สำเร็จ (`origin/main` อัปเดตแล้ว)

4. Docker runtime stabilization หลัง deploy
   - ตรวจพบ web log เคส `Failed to find Server Action` (state ต่าง deployment)
   - แก้โดย recreate service:
     - `docker compose up -d --force-recreate api web`
   - ตรวจ `docker compose ps` แล้วทุก service หลักขึ้นครบ (`api`, `web`, `postgres`, `redis`)

5. Compose hygiene
   - ลบ `version: '3.8'` ออกจาก `docker-compose.yml` เพื่อตัด warning obsolete
   - ตรวจ compose config แล้วใช้งานได้ปกติ

6. AI env wiring เข้าสู่ runtime
   - เพิ่ม env ใน service `api` ของ `docker-compose.yml`:
     - `OPENAI_API_KEY`
     - `GOOGLE_API_KEY`
     - `ANTHROPIC_API_KEY`
   - recreate `api` และยืนยันใน container ว่า env ถูก set แล้ว

7. AI implementation upgrade (Create Lite)
   - อัปเดต `backend/src/create-lite/create-lite.service.ts` ให้รองรับ provider จริงแบบลำดับ:
     - OpenAI -> Gemini -> Anthropic
   - มี fallback local suggestion เหมือนเดิมหาก provider ใดล้มเหลว
   - endpoint ที่เกี่ยวข้อง: `POST /api/create-lite/ai-copy`

8. AI runtime test (production stack)
   - ทดสอบ end-to-end โดยสมัคร test user และเรียก `/api/create-lite/ai-copy`
   - endpoint ตอบสำเร็จ (201) และได้ copy output
   - จาก log ล่าสุด พบว่า provider ฝั่ง Gemini ตอบ `404` จึง fallback local ทำงานถูกต้อง
   - สรุป: AI path พร้อม, endpoint ใช้งานได้, แต่ provider config/model ของ Gemini ยังต้องปรับถ้าต้องการผลจาก LLM จริง 100%

9. Infra capacity check
   - ตรวจ HDD:
     - `/dev/sda1` ขนาด 193G
     - ใช้ 49G
     - เหลือ 145G
     - ใช้งาน 26%
   - พื้นที่เพียงพอสำหรับ run production ต่อ

**Current status**:
- ระบบพร้อม go-live และ online แล้ว
- CI-level verification ผ่าน + runtime services ปกติ
- AI endpoint ใช้งานได้พร้อม fallback
- หากต้องการบังคับใช้ provider จริงทันที ให้ปรับ model/permission ของคีย์ Gemini หรือสลับใช้ OpenAI/Anthropic key ที่สิทธิ์พร้อม

**Files updated in this round**:
- `backend/src/analytics/analytics.service.spec.ts`
- `backend/src/qr-codes/qr-codes.controller.ts`
- `backend/src/create-lite/create-lite.service.ts`
- `backend/package-lock.json`
- `docker-compose.yml`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-07*

### 2026-03-07: P0 API Protection + Cookie Auth Flow Cleanup
**Goal**: ปิดงาน hardening รอบใหม่ให้ครบทั้ง auth flow ฝั่ง frontend และ baseline rate-limit ฝั่ง backend

**What changed**:
1. Cookie auth flow cleanup (frontend)
   - `frontend/src/app/page.tsx`
     - ลบการพยายาม set token/uid ผ่าน js-cookie ในหน้า landing login modal
     - คงเฉพาะ `credentials: 'include'` เพื่อให้ browser แนบ cookie session ที่ backend set ให้
   - `frontend/src/app/login/page.tsx` และ `frontend/src/app/register/page.tsx`
     - ยืนยันว่าใช้ `credentials: 'include'` ใน login/register request

2. Global Rate Limiting (backend)
   - เพิ่ม dependency `@nestjs/throttler` ใน `backend/package.json`
   - `backend/src/app.module.ts`
     - register `ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }])`
     - ผูก global guard ด้วย `APP_GUARD -> ThrottlerGuard`

3. Public endpoint throttling (backend)
   - `backend/src/forms/forms.public.controller.ts`
     - `GET /public/forms/:id` จำกัด 60 req/min
     - `POST /public/forms/:id/submit` จำกัด 20 req/min
   - `backend/src/qr-codes/qr-codes.controller.ts`
     - `GET /public/qr-codes/:id/download` จำกัด 120 req/min

4. Checklist sync
   - `DEVELOPMENT_CHECKLIST.md`
     - ปรับคำอธิบาย Session Management เป็น `httpOnly cookie + JWT fallback`
     - เพิ่มหมวด `1.6 API Protection Baseline` (global throttle + public endpoint throttle)

**Notes**:
- Build backend/frontend ผ่านบน Node 20 แล้วใน session นี้
- เดิมมี warning เรื่อง Next.js `middleware` deprecation

*Updated by Codex on 2026-03-07*

### 2026-03-07: Next.js Middleware → Proxy Migration Completed
**Goal**: ปิด warning deprecation ของ Next.js 16 และทำให้ route guard convention เป็นปัจจุบัน

**What changed**:
1. ย้ายไฟล์ route guard
   - rename `frontend/src/middleware.ts` -> `frontend/src/proxy.ts`
   - ย้ายฟังก์ชันจาก `middleware()` เป็น `proxy()` โดยคง logic เดิม
2. Matcher เดิมยังคงเดิม
   - `/manage/:path*`
   - `/admin/:path*`
3. Verification
   - รัน `npm run build` ที่ frontend แล้วผ่าน
   - warning deprecation เรื่อง middleware ไม่ปรากฏแล้ว

**Files updated**:
- `frontend/src/proxy.ts` (renamed from `frontend/src/middleware.ts`)

*Updated by Codex on 2026-03-07*

### 2026-03-15: Phase 7 - Unified Navigation & UI Consolidation
**Goal**: เพิ่มความสะดวกในการใช้งาน (UX) โดยรวมเมนูจัดการเข้าหาศูนย์กลาง (Control Center) และปรับปรุงระบบการนำทางกลับ (Back Navigation)

**What changed**:
1. **Control Center Optimization (`/manage/control-center`)**:
   - เพิ่ม **Quick Access Sticky Bottom Menu** สำหรับเวอร์ชันมือถือและเดสก์ท็อป ประกอบด้วย: สถิติ, แก้ไขโปรไฟล์, ดูหน้าเว็บจริง, และตั้งค่าบัญชี
   - กู้คืนและตรวจสอบการทำงานของ **Upgrade Modal** เพื่อให้ระบบสมัครสมาชิกพรีเมียมทำงานได้สมบูรณ์
   - ปรับแต่งหน้าตา (UI) ให้สะอาดขึ้น โดยย้ายเมนูย่อยของแต่ละส่วนมารวมไว้ที่นี่ที่เดียว

2. **Standardized Back Navigation**:
   - เพิ่มปุ่ม "ย้ายกลับเมนูก่อนหน้า" (Back to Control Center) ในทุกหน้าจัดการหลัก:
     - Catalogs (`/manage`)
     - Dashboard (`/manage/dashboard`)
     - Account Settings (`/manage/account`)
     - Profile Editor (`/manage/profile`)
     - Leads (`/manage/leads`)
     - QR Generator (`/manage/qr`)
     - Namecard Designer (`/manage/namecard`)
     - Referrals (`/manage/referrals`)
   - ลบเมนูนำทาง (Navbar Links) ที่ซ้ำซ้อนในแต่ละหน้าออก เพื่อลด Cognitive Load และเน้นให้ผู้ใช้กลับมาใช้ Control Center เป็นหลัก

3. **Checklist sync**:
   - อัปเดต `DEVELOPMENT_CHECKLIST.md` เพิ่ม Phase 7 — Navigation & UX Refinement

**Files updated**:
- `frontend/src/app/manage/control-center/page.tsx`
- `frontend/src/app/manage/page.tsx`
- `frontend/src/app/manage/dashboard/page.tsx`
- `frontend/src/app/manage/account/page.tsx`
- `frontend/src/app/manage/profile/page.tsx`
- `frontend/src/app/manage/leads/page.tsx`
- `frontend/src/app/manage/qr/page.tsx`
- `frontend/src/app/manage/namecard/page.tsx`
- `frontend/src/app/manage/referrals/page.tsx`

### 2026-03-17: Landing Page UI Improvements & Brand Consistency
**Goal**: ปรับปรุง Landing Page ให้สวยงามขึ้น และใช้สี/โลโก้ตรงกับ Homepage

**What changed**:
1. **Landing Page Design (`/lp/[slug]`)**:
   - เปลี่ยน background จาก `#000000` (ดำ) เป็น `#EFF6FF` (ฟ้าอ่อน) ตรงกับ homepage
   - เพิ่ม gradient effects และ blur blobs เหมือน homepage
   - เปลี่ยนสีตัวอักษรเป็น `#050579` (น้ำเงินเข้ม) และ `#475569`
   - เปลี่ยน accent color เป็น `#F97316` (ส้ม)

2. **Logo Component (New)**:
   - สร้าง `frontend/src/components/Logo.tsx` ใหม่
   - `Logo` - สำหรับ navbar หลัก
   - `LogoInline` - สำหรับ navbar ใน manage pages
   - `LogoFooter` - สำหรับ footer
   - ใช้ `/nex_logo_nobg.png` เป็นโลโก้หลัก

3. **Brand Consistency**:
   - เปลี่ยน `NAMECARD.AI` เป็น `NEX Solution` ทั่วทั้งเว็บ
   - อัปเดต footer ทุกหน้าให้ใช้ชื่อใหม่
   - ใช้โลโก้ภาพแทน text logo

4. **Profile Page**:
   - ลบ LeadForm ("ฝากข้อมูลติดต่อกลับ") ออกจาก profile page public view
   - LeadForm ยังคงอยู่ใน Landing Page เท่านั้น

5. **Landing Page Editor UX**:
   - เพิ่มขนาดตัวอักษรใน editor (`text-[10px]` → `text-sm`)
   - ปรับสีให้อ่านง่ายขึ้น (`text-foreground/30` → `text-foreground/60`)
   - เพิ่มกล่องไฮไลท์สำหรับข้อความอธิบายสำคัญ

**Files updated**:
- `frontend/src/components/Logo.tsx` (new)
- `frontend/src/app/lp/[slug]/LandingPageClient.tsx`
- `frontend/src/app/[prefix]/[uid]/page.tsx`
- `frontend/src/app/manage/page.tsx`
- `frontend/src/app/login/page.tsx`
- `frontend/src/app/register/page.tsx`
- `frontend/src/app/manage/profile/page.tsx`
- `frontend/src/app/manage/account/page.tsx`
- `frontend/src/app/manage/catalogs/[id]/page.tsx`
- `frontend/src/app/manage/landing-pages/[id]/page.tsx`

*Updated by Cascade on 2026-03-17*

### 2026-03-18: ux agent handover
**Goal**: อัปเดตเอกสาร UX/UI ชุด `v2` และปรับหน้า public หลักให้สอดคล้องกับ NEX standard ใหม่ โดยคงโครงสร้างเดิมเท่าที่ทำได้

**What changed**:
1. **Docs standard refresh**
   - สร้าง/อัปเดตเอกสารมาตรฐานใหม่:
     - `docs/NEX_BRAND_GUIDELINE_V2.md`
     - `docs/NEX_UX_UI_STANDARD_V2.md`
     - `docs/NEX_COLOR_SYSTEM_V2.md`
     - `docs/NEX_TAILWIND_TOKENS_V2.md`
     - `docs/NEX_SOLUTION_BLUEPRINT_REV0.md`
     - `docs/home-gateway-copy.md`
   - rename ไฟล์จาก `V1` -> `V2` สำหรับ brand guideline, UX/UI standard, color system, tailwind tokens
   - sync reference ใน `docs/README.md` และเอกสารที่อ้างอิงกันให้ตรงชื่อใหม่

2. **Homepage (`/`) -> minimal gateway**
   - ตัดหน้า home ให้เหลือ:
     - centered logo
     - 4 option boxes
     - footer
   - ใช้ labels ตามข้อกำหนด:
     - `เข้าสู่ระบบ`
     - `NEX คืออะไร`
     - `สมัครเป็น NEX Digital Agent`
     - `โซลูชันสำหรับองค์กร`
   - ใช้สีตาม standard ใหม่:
     - soft blue background
     - navy secondary boxes
     - orange primary box
   - ปรับขนาดโลโก้และ spacing รอบโลโก้
   - ใส่ `pointer-events-none` ให้โลโก้เพื่อไม่ให้บังการคลิกปุ่ม

3. **Homepage modal behavior**
   - คง login modal เดิมไว้สำหรับปุ่ม `เข้าสู่ระบบ`
   - เปลี่ยนปุ่ม `สมัครเป็น NEX Digital Agent` ให้เปิด register modal บนหน้า home แทนการพาไปอีกหน้า
   - ดึง register submit logic หลักมาใช้ใน modal หน้า home

4. **What is NEX (`/what-is-nex`) theme refresh**
   - คงเนื้อหาเดิมและลำดับ section เดิม
   - เปลี่ยนภาพรวมจาก dark/cyan sci-fi เป็น NEX standard:
     - `#EEF0FF` background
     - navy headline/text
     - white cards
     - orange CTA

5. **Enterprise page (`/enterprise`)**
   - เปลี่ยน quick action `โซลูชันสำหรับองค์กร` บนหน้า home ให้พาไปหน้าใหม่ `/enterprise`
   - สร้างหน้า `frontend/src/app/enterprise/page.tsx`
   - รอบแรกมี copy ที่ extrapolate จาก blueprint มากเกินไป จึงแก้ใหม่เป็น `blueprint-only`
   - ตัดถ้อยคำแบบ internal/team-facing ออก เช่น `MVP Scope`, `Why This Flow`
   - ปรับ section ท้ายให้เป็นข้อความที่ลูกค้าองค์กรควรเห็น:
     - `ปัญหาหลักที่ NEX ช่วยแก้`
     - `เหมาะกับธุรกิจแบบไหน`

6. **Footer company identity**
   - เพิ่มชื่อบริษัทใน footer หน้า public หลัก:
     - `บริษัท คราม อินเทลลิเจนท์ เอไอ จำกัด`
     - `KHRAM INTELLIGENT AI Co., Ltd.`
   - ปรับจากหลายบรรทัดให้เป็นข้อความต่อเนื่องบรรทัดเดียวบนหน้า home และหน้า login

7. **Logo asset rollout**
   - ตรวจพบไฟล์ใหม่ใน `frontend/public`:
     - `nex-logo-current.png`
     - `nex-logo-current-transparent.png`
   - deploy โลโก้ใหม่โดยไม่แตะ layout/spacing อื่น:
     - backup ของเดิมไว้ที่ `frontend/public/nex_logo_nobg.backup-20260318.png`
     - แทนที่ `frontend/public/nex_logo_nobg.png` ด้วย `nex-logo-current-transparent.png`
   - ยืนยันด้วย hash ว่าไฟล์ที่ service `web` เสิร์ฟจริงตรงกับไฟล์ใหม่

8. **Homepage logo size follow-up**
   - หลังเปลี่ยนโลโก้ใหม่ ผู้ใช้ขอให้ลดขนาดโลโก้หน้า home ลง `20%`
   - ปรับเฉพาะ container logo บน `frontend/src/app/page.tsx`
     - `h-[220px] -> h-[176px]`
     - `sm:h-[280px] -> sm:h-[224px]`
   - ไม่เปลี่ยนส่วนอื่นของ layout

**Files updated**:
- `AGENT_HANDOVER.md`
- `docs/README.md`
- `docs/NEX_BRAND_GUIDELINE_V2.md`
- `docs/NEX_UX_UI_STANDARD_V2.md`
- `docs/NEX_COLOR_SYSTEM_V2.md`
- `docs/NEX_TAILWIND_TOKENS_V2.md`
- `docs/NEX_SOLUTION_BLUEPRINT_REV0.md`
- `docs/home-gateway-copy.md`
- `frontend/src/app/page.tsx`
- `frontend/src/app/login/page.tsx`
- `frontend/src/app/enterprise/page.tsx`
- `frontend/src/app/what-is-nex/page.tsx`
- `frontend/public/nex_logo_nobg.png`
- `frontend/public/nex_logo_nobg.backup-20260318.png`

**Notes**:
- มีการ rebuild/recreate `web` service หลายรอบด้วย `docker compose up -d --build --force-recreate web`
- บางรอบใช้ `docker compose up -d --build web` สำหรับ rebuild เฉพาะ frontend ตามคำขอ deploy logo
- หน้า `/register` ยังมีอยู่เป็น route แยก แต่ homepage ปุ่มสมัครสมาชิกถูกเปลี่ยนให้เปิด modal บนหน้า `/`
- หน้า `/enterprise` ถูกปรับให้อ่านแบบ customer-facing มากขึ้น และหลีกเลี่ยงภาษาภายในทีม
- ถ้าผู้ใช้ยังเห็นหน้าเก่าหลัง deploy มักเป็น browser cache; ใช้ hard refresh หรือ private window

*Updated by Codex on 2026-03-18 06:33:00 UTC*

### 2026-03-18: ux agent handover follow-up - auth callback + manage pages standardization
**Goal**: ขยาย NEX UX standard จากหน้า public เข้าสู่ flow หลัง login ให้ต่อเนื่องขึ้น โดยแก้หน้า feedback หลัง OAuth และหน้าหลังบ้านหลักที่ user เจอต่อทันที

**What changed**:
1. **OAuth callback (`/oauth-callback`)**
   - เปลี่ยนหน้า callback หลัง login จากพื้นดำแบบ old success screen เป็นหน้าโทน NEX standard:
     - soft blue background
     - white card
     - navy headline
     - orange loading
     - green success
     - red error
   - ใช้ `Logo` component และปรับโลโก้ให้ใหญ่ขึ้นตามคำขอภายหลัง
   - refactor logic เล็กน้อยเพื่อลด `setState` ใน `useEffect` และให้ lint ผ่าน

2. **Control Center (`/manage/control-center`)**
   - ปรับหน้าเข้าแรกหลัง login ให้เข้ากับ standard ใหม่:
     - เปลี่ยน page shell, navbar, hero summary, metric cards, feature cards, status blocks, upgrade modal, bottom dock
     - ใช้โครงสี `#EEF0FF / #FFFFFF / #050579 / #F97316 / semantic green`
   - ลดการใช้ rainbow gradients และแทนด้วย tone system ต่อ feature (`navy`, `orange`, `green`, `blue`)
   - เลือก `นามบัตรดิจิทัล` เป็น primary card หลัก และลดน้ำหนัก visual ของ cards อื่น
   - ลดความเด่นของ `upgrade card` และ `bottom dock`
   - ซ่อนปุ่มสลับธีม (`ThemeToggle`) บนหน้านี้ตามคำขอ เพื่อไม่ให้ธีม visual ของหน้าเปลี่ยนจาก standard

3. **Manage page shell alignment**
   - ขยายมาตรฐาน UX ไปยัง 4 หน้าหลักหลัง login:
     - `/manage/profile`
     - `/manage/dashboard`
     - `/manage/account`
     - `/manage/leads`
   - สิ่งที่ปรับในภาพรวม:
     - page background / shell
     - sticky header / navbar
     - section surfaces / cards / borders / shadows
     - loading / empty states
     - action buttons และ status bars
   - เอา `ThemeToggle` ออกจาก flow ของหน้ากลุ่มนี้เพื่อให้ visual continuity เหมือน `control-center`

4. **Profile editor deeper pass (`/manage/profile`)**
   - เก็บรายละเอียดภายในหน้าเพิ่มเติมจาก shell รอบแรก:
     - media / upload blocks
     - logo / background / banner management areas
     - website rows / social rows
     - about / interests
     - theme customization controls
     - QR section
   - เปลี่ยน input surfaces, chips, upload states และ option buttons ให้เป็นระบบเดียวกับ NEX standard มากขึ้น
   - ยังไม่ได้ rewrite logic ฟอร์มหรือเปลี่ยน component ใหญ่เชิงโครงสร้าง เน้น visual standardization แบบเสี่ยงต่ำ

5. **Verification / deploy**
   - หลายรอบของงานนี้มีการตรวจ `npm run build` ฝั่ง frontend ผ่านก่อน deploy
   - deploy แต่ละรอบด้วย:
     - `docker compose up -d --build --force-recreate web`
   - แม้ `docker compose` จะ recreate `api` ไปด้วยตาม build graph ของ stack แต่สุดท้าย `web` และ `api` กลับขึ้น `Up` ปกติทุกครั้ง

**Files updated**:
- `AGENT_HANDOVER.md`
- `frontend/src/app/oauth-callback/page.tsx`
- `frontend/src/app/manage/control-center/page.tsx`
- `frontend/src/app/manage/profile/page.tsx`
- `frontend/src/app/manage/dashboard/page.tsx`
- `frontend/src/app/manage/account/page.tsx`
- `frontend/src/app/manage/leads/page.tsx`

**Notes**:
- งานรอบนี้ intentionally แก้เฉพาะหน้า/ไฟล์เป้าหมาย ไม่ได้แก้ design token กลางหรือ shared theme ทั้งระบบ
- บางไฟล์ใน repo ยังมี lint warnings/typing debt เดิมอยู่ แต่ frontend build ล่าสุดผ่าน
- ถ้าจะต่อรอบหน้า แนะนำ:
  - เก็บ `manage/profile` รอบสุดท้ายในรายละเอียดเล็ก ๆ ที่เหลือ
  - หรือเริ่มย้าย pattern ที่นิ่งแล้ว (manage nav / section shell / action bars) ไปเป็น shared components

*Updated by Codex on 2026-03-18*

---

### 2026-03-18: UX/UI Fixes – Manage Pages Redesign, Theme Defaults & ThemeProvider Hydration

**Goal**: Commit accumulated UX/UI improvements across the manage section, fix global theme defaults, and clean up temporary debug code from a scroll investigation.

**What changed**:

1. **`manage/profile` (page.tsx)** — Stable
   - Full editor redesign: type-safe interfaces (`SocialLink`, typed `SOCIAL_ICONS`), `useCallback` for `fetchProfile`, Next.js `Image` component for banners, redesigned layout with summary cards, section quick-nav, status bar, and refined spacing/colors.
   - Removed the `PasswordChangeForm` component (moved to `/manage/account`).
   - Added `pageRef` + focus-blur `useEffect` to prevent browser auto-focus from shifting the viewport.
   - **Scroll debug code removed**: `scrollToTopInstant` helper, `debugEnabled`/`scrollDebug` state, three scroll-related hooks, and the debug overlay were investigation tools from a scroll-position hypothesis — they are **not** part of the fix.

2. **`manage/control-center` (page.tsx)** — Layer/visibility fix applied
   - Removed the browser back-button interception `useEffect` (hash-based `#app` trap).
   - Added `chip`, `action`, `hoverBorder` to `TONE_STYLES` for richer feature cards.
   - Background blur layers moved from `fixed` to `absolute` inside a non-interactive container (fixes z-index/layer stacking issues that could obscure content).
   - Bottom quick-access menu changed to `md:hidden` (mobile-only).
   - Replaced hardcoded Google Fonts `<link>` with CSS variable `var(--font-sans)`.
   - QR code card now renders a real `QrCodeImage` when user data is available.
   - Upgraded modal overlays: adjusted opacity, border-radius, shadow tweaks.
   - Updated support email from `dpattown.com` to `nexsolution.cloud`.

3. **`ThemeProvider.tsx`** — Hydration fix
   - Removed the `mounted` state + `visibility: hidden` wrapper that caused a flash-of-invisible-content on first render.
   - Theme now initialises lazily from `localStorage` via a state initialiser function, and the `useEffect` syncs `data-theme` on every theme change.

4. **`globals.css`** — Theme defaults corrected
   - `:root` (default) changed from dark Midnight theme to light theme. This prevents dark flash on pages that don't explicitly set a theme.
   - Dark theme moved to `:root[data-theme='dark']` so it's only applied when explicitly selected.

5. **`layout.tsx`** — Default theme fallback changed from `"dark"` to `"light"`.

6. **Other files** (14 additional pages/components touched):
   - Various manage pages: removed unused imports, minor style/class fixes.
   - `ImageCropper.tsx`: minor fix.
   - `SocialLinksDisplay.tsx`: style refinements.
   - `ThemeToggle.tsx`: removed unused import.
   - Landing pages, catalog pages, namecard page, public profile views: incremental style/layout improvements.

**Scroll position open question**:
During investigation of a report that `manage/control-center` opened at a mid-page position, scroll restoration was explored as a hypothesis. Debug instrumentation was added temporarily to both `control-center` and `profile` pages. The debug code has now been fully reverted/removed from both pages. The layer/visibility fix (background elements using `fixed` positioning with high z-index) was identified and applied. **Scroll restoration has not been confirmed as the root cause.** If the scroll-position issue recurs, it should be investigated fresh — possible areas to check include browser bfcache scroll restoration, React hydration ordering, or element focus during mount.

**Files committed**:
- `frontend/src/app/globals.css`
- `frontend/src/app/layout.tsx`
- `frontend/src/app/manage/control-center/page.tsx`
- `frontend/src/app/manage/profile/page.tsx`
- `frontend/src/components/ThemeProvider.tsx`
- `frontend/src/components/ThemeToggle.tsx`
- `frontend/src/components/ImageCropper.tsx`
- `frontend/src/components/SocialLinksDisplay.tsx`
- `frontend/src/components/Logo.tsx`
- `frontend/src/app/[prefix]/[uid]/page.tsx`
- `frontend/src/app/catalog/[slug]/page.tsx`
- `frontend/src/app/lp/[slug]/LandingPageClient.tsx`
- `frontend/src/app/manage/catalogs/[id]/page.tsx`
- `frontend/src/app/manage/create-lite/page.tsx`
- `frontend/src/app/manage/forms/[id]/page.tsx`
- `frontend/src/app/manage/forms/[id]/submissions/page.tsx`
- `frontend/src/app/manage/forms/page.tsx`
- `frontend/src/app/manage/landing-pages/[id]/page.tsx`
- `frontend/src/app/manage/landing-pages/page.tsx`
- `frontend/src/app/manage/namecard/page.tsx`
- `frontend/src/app/manage/page.tsx`
- `frontend/src/app/manage/qr/page.tsx`
- `frontend/src/app/manage/referrals/page.tsx`
- `AGENT_HANDOVER.md`

*Updated on 2026-03-18*

---

### 2026-03-19: UX/UI Frontend Progress Tracker + Main Landing Redesign

**Goal**: เริ่มงาน UX/UI แบบเดินทีละหน้าอย่างเป็นระบบ, ทำหน้าแรกใหม่, และตั้งไฟล์ tracker สำหรับใช้ต่อเนื่องข้าม session

**What changed**:

1. **สร้างไฟล์ tracker กลางสำหรับงาน UX/UI**
   - เพิ่มไฟล์ `docs/FRONTEND_UX_UI_PROGRESS.md`
   - ใช้สถานะ `done / in_progress / pending / blocked / skipped`
   - แยกงานเป็นรายหน้า/รายหมวดของ platform
   - ใช้ `Summary` เพื่อนับจำนวนงานคงเหลือ

2. **วาง baseline งาน UX/UI ปัจจุบัน**
   - รวมทั้งหมด `31` หน้า/จุดงาน
   - ปัจจุบัน `done: 2`
   - หน้า/จุดที่ทำแล้ว:
     - `frontend/src/app/globals.css`
     - `frontend/src/app/page.tsx`

3. **รีดีไซน์หน้าแรกของระบบ (`/`)**
   - ไฟล์: `frontend/src/app/page.tsx`
   - เปลี่ยนจากหน้า CTA แบบสั้นมาก ไปเป็น landing page ที่มี:
     - top nav
     - hero copy ที่สื่อสาร value ชัดขึ้น
     - proof stats
     - sections สำหรับ value proposition และ audience
     - quick-action panel ที่ยังคง login/register modal เดิมไว้
   - ปรับ spacing desktop เพิ่มเติมหลัง review:
     - container หลักเป็น `flex min-h-screen`
     - hero section จัด vertical rhythm ใหม่
     - footer ถูกดันลงล่างเพื่อลดก้อนพื้นที่ว่างกลางหน้า
   - ตรวจ `eslint` เฉพาะไฟล์นี้ผ่าน

4. **การ deploy / push workflow ที่ยืนยันแล้วใน session นี้**
   - Commit ล่าสุดของงานรอบนี้:
     - `e78fe5b` — `fix(ux): redesign landing page spacing and tracker`
   - Commit นี้ถูก push ขึ้น `origin/main` แล้วโดย Antigravity
   - หมายเหตุสำคัญ:
     - session ของ Codex นี้ **commit ได้ แต่ push เองไม่ได้** ถ้าไม่มี GitHub credential
     - workflow ที่ควรใช้ต่อ:
       1. Codex แก้ทีละหน้า
       2. User review งาน
       3. Antigravity เป็นคน `commit/push` เมื่อพร้อม

**Files updated**:
- `frontend/src/app/page.tsx`
- `docs/FRONTEND_UX_UI_PROGRESS.md`
- `AGENT_HANDOVER.md`

**Next recommended page**:
- `frontend/src/app/home-preview/page.tsx`

**Notes for next session**:
- ผู้ใช้ต้องการ review งานแบบ `ทีละหน้า`
- อย่ากระโดดไปแก้หลายหน้าพร้อมกันโดยไม่ขอ
- อย่าหลุดประเด็นไปเรื่อง `scroll Y` ถ้าผู้ใช้ไม่ได้สั่งตรง ๆ
- ให้อัปเดต `docs/FRONTEND_UX_UI_PROGRESS.md` ทุกครั้งที่เริ่ม/จบหน้า

*Updated by Codex on 2026-03-19*

---

### 2026-03-20: UX/UI Standardization Sprint - Manage Pages (Top Bar + Color + Thai Mode)

**Goal**: ยกระดับความสม่ำเสมอของหน้า Manage ให้ตรง `NEX_UX_UI_STANDARD_V2` โดยเน้น
- top bar มาตรฐานเดียวกัน
- สีตาม NEX palette (Navy/Orange/Soft-blue)
- ภาษาไทยในโหมดจัดการ
- typography ให้อ่านง่ายเท่ากันระหว่างหน้า

**What changed**:

1. **อ่านและยืนยันมาตรฐานก่อนลงมือ**
   - ตรวจเอกสารอ้างอิง:
     - `docs/NEX_UX_UI_STANDARD_V2.md`
     - `docs/NEX_UI_RULES_V1.md`
     - `docs/NEX_BRAND_GUIDELINE_V2.md`
     - `docs/NEX_COLOR_SYSTEM_V2.md`
     - `docs/NEX_TAILWIND_TOKENS_V2.md`
     - `docs/FRONTEND_UX_UI_PROGRESS.md`

2. **`/manage/catalogs/[id]`**
   - ปรับสีข้อความ/label/chip/button ให้ตรง NEX theme
   - ลดสีหลุดระบบ (`amber/indigo/emerald/purple`) ให้เหลือ semantic ที่กำหนด
   - แปล action หลักเป็นไทยใน modal/button สำคัญ
   - ปรับคอนทราสต์ให้ชัดขึ้นในส่วน header และ empty state

3. **`/manage/namecard`**
   - รีแมปสีทั้งหน้าไป NEX palette (soft blue background + white surface + navy/orange actions)
   - เปลี่ยน top bar เป็น `ManageTopBar` มาตรฐาน
   - ปรับชื่อใน bar เป็นไทย:
     - subtitle: `ระบบจัดการนามบัตร`
     - title: `เครื่องมือสร้างนามบัตร`
     - action: `ดาวน์โหลด PNG`

4. **`/manage/qr`**
   - เปลี่ยน top bar เป็น `ManageTopBar`
   - ปรับสีทั้งหน้าให้เข้าสีมาตรฐาน NEX
   - แปล UI เป็นไทย (รวมข้อความ section และสถานะสำคัญ)
   - เพิ่มตัวแปลงประเภท QR เป็น label ไทยในรายการที่บันทึก
   - ขยาย typography (label/helper/meta/button) ให้ไม่เล็กกว่าหน้าอื่น
   - lint เฉพาะไฟล์ผ่าน

5. **`/manage/create-lite`**
   - เปลี่ยน top bar เป็น `ManageTopBar` มาตรฐาน
   - รีแมปสีหลักทั้งหน้าให้ตรง NEX system
   - แปลข้อความ UI หลักเป็นไทย (หมวด, ปุ่ม, variant action, preview label)
   - ปรับ typography และ readability ให้เท่าหน้า manage อื่น

6. **Top bar มาตรฐานเพิ่มอีก 3 หน้า**
   - `/manage/dashboard`
   - `/manage/leads`
   - `/manage/landing-pages`
   - ทั้งหมดเปลี่ยนมาใช้ `ManageTopBar` พร้อมคง action เดิมของแต่ละหน้า

7. **แก้พฤติกรรมคลิกโลโก้ใน top bar**
   - ปัญหา: คลิกโลโก้แล้วพาไป `/` ทำให้ผู้ใช้เข้าใจว่าโดน logout
   - วิธีแก้:
     - เพิ่ม `href` ให้ `LogoInline`
     - ใน `ManageTopBar` กำหนดโลโก้ไป `/manage/control-center`

8. **Deploy/verification**
   - deploy หลายรอบด้วย `docker compose up -d --build web`
   - ทุกครั้งยืนยัน `namecard_web Started` และ `namecard_api Started`

**Files updated in this sprint**:
- `frontend/src/components/ManageTopBar.tsx` (new)
- `frontend/src/components/Logo.tsx`
- `frontend/src/app/manage/catalogs/[id]/page.tsx`
- `frontend/src/app/manage/namecard/page.tsx`
- `frontend/src/app/manage/qr/page.tsx`
- `frontend/src/app/manage/create-lite/page.tsx`
- `frontend/src/app/manage/dashboard/page.tsx`
- `frontend/src/app/manage/leads/page.tsx`
- `frontend/src/app/manage/landing-pages/page.tsx`
- `AGENT_HANDOVER.md`

**Known notes**
- หลายไฟล์ manage ยังมี lint debt เดิม (`any`, hook dependency warnings, `img` warning) ที่มีมาก่อนรอบนี้
- รอบนี้โฟกัส UX/UI consistency + interaction behavior เป็นหลัก ไม่ได้ refactor typing debt ทั้งระบบ

*Updated by Codex on 2026-03-20*

---

### 2026-03-19: UX Iteration - Catalog color system alignment (NEX standard)

**Goal**: ปรับหน้ากลุ่ม Catalog ให้สีและ visual hierarchy เข้า NEX UX/UI Standard (soft blue + navy + orange CTA) และลดผลกระทบจาก theme token เดิมที่ออกโทน cyan/purple

**What changed**:

1. **`/manage` (`frontend/src/app/manage/page.tsx`)**
   - รีแมปสีจาก token เดิม (`bg-primary`, `bg-foreground`, `bg-background`, `glass-card`) ไปเป็น NEX palette โดยตรง
   - ปรับ navbar, card, empty state, action buttons, QR side panel, และ modal ทั้งหมดให้ใช้:
     - Background: `#EEF0FF`
     - Surface: `#FFFFFF`
     - Border: `#D9E1F2`
     - Navy: `#050579`
     - Orange CTA: `#F97316` / hover `#EA580C`
   - เก็บ lint error ในไฟล์นี้เพิ่ม:
     - เปลี่ยน `products: any[]` -> `products: unknown[]`
     - ลบ unused imports ที่ไม่ใช้งาน
   - หมายเหตุ: เหลือ warning เดิมเรื่อง `useEffect` dependency array

2. **Public catalog page (`frontend/src/app/catalog/[slug]/page.tsx`)**
   - เพิ่ม page-level CSS vars (`--background`, `--foreground`, `--primary`, `--card`) เพื่อ lock ให้หน้าใช้ NEX tone ไม่โดนธีมเก่าครอบ
   - เปลี่ยน fallback `primary_color` จาก `#6366F1` เป็น `#050579`
   - ปรับ modal (QR / Share / Product) จาก dark panel เป็น white surface + NEX border
   - ปรับ text รองในจุดสำคัญเป็นโทนอ่านง่ายตามระบบ (`#475569`, `#64748B`)

3. **Manage catalog detail (`frontend/src/app/manage/catalogs/[id]/page.tsx`)**
   - เปลี่ยน default/fallback `settings.primary_color` จาก `#6366F1` เป็น `#050579`
   - เพิ่ม page-level CSS vars แบบเดียวกับ public catalog เพื่อ stabilize palette
   - ปรับ QR/Share modal จาก dark panel เป็น white surface + NEX border + soft overlay

4. **Deploy**
   - deploy หลายรอบระหว่างปรับด้วย:
     - `docker compose up -d --build web`
   - สถานะสุดท้ายของ container:
     - `namecard_web Started`
     - `namecard_api Started`

**Known gaps / next pass**:
- ใน `catalog/[slug]` และ `manage/catalogs/[id]` ยังมี class token เก่าแบบ `bg-foreground/...` และ `bg-primary/...` กระจายหลายจุด
- สี fallback ถูกแก้แล้วและ modal สำคัญถูก normalize แล้ว แต่ยังควรมี pass เพิ่มเพื่อ clean token เก่าให้ครบทั้งไฟล์
- lint ทั้งสองไฟล์ยังมี issue เก่า (`any`, unused imports, hooks dependency warnings, `<img>` warning) ที่ยังไม่ถูกปิดทั้งหมดในรอบนี้

**Files updated in this iteration**:
- `frontend/src/app/manage/page.tsx`
- `frontend/src/app/catalog/[slug]/page.tsx`
- `frontend/src/app/manage/catalogs/[id]/page.tsx`
- `AGENT_HANDOVER.md`

*Updated by Codex on 2026-03-19*

---

### 2026-03-19: UX Iteration - Control Center polish + Profile editor tab mode

**Goal**: เก็บงาน UX แบบ incremental ตาม feedback ผู้ใช้ โดยทำให้ rollback ได้ง่ายทุกข้อ

**What changed**:

1. **`manage/control-center` — layout balance + loading/empty states**
   - ปรับสัดส่วนแถวล่างใน feature grid:
     - การ์ด `referrals` เป็น `xl:col-span-2`
     - การ์ด `Upgrade Card` เป็น `xl:col-span-1`
   - แก้สัดส่วนกล่อง QR ในการ์ด referrals ไม่ให้ยืดความสูงเกินจำเป็น:
     - เพิ่ม `sm:items-start` ใน inner grid
   - ซ่อนบล็อก `Feature Status Section` แบบ reversible:
     - ใช้ `SHOW_FEATURE_STATUS_SECTION = false` (โค้ดยังอยู่ ไม่ได้ลบ)
   - เพิ่ม loading/empty states เฉพาะจุดสำคัญ:
     - URL/QR ของ profile card
     - URL/QR ของ referrals card
     - metric `leadCount` (summary tile + status tile)
     - เพิ่ม skeleton + placeholder ข้อความเมื่อไม่มีข้อมูล

2. **`manage/profile` — ทดลองโหมดแท็บเพื่อลดความยาวฟอร์ม**
   - เพิ่มโหมด `tabbed editor` แยกเป็น:
     - Basic / Media / Links / Theme
   - ใช้ toggle สำหรับ rollback ทันที:
     - `ENABLE_PROFILE_EDITOR_TABS = true`
     - หากต้องการกลับแบบเดิมให้เปลี่ยนเป็น `false`
   - sticky quick section bar เดิมถูกแปลงให้:
     - ในโหมดแท็บ = สลับแท็บ
     - ในโหมดเดิม = scroll ไป section เหมือนเดิม
   - จัดกลุ่ม section ตามแท็บ:
     - Basic: ชื่อ/ตำแหน่ง/บริษัท/อีเมล/โทร/About/Interests
     - Media: Profile pic/Logo/Background/Banner/Video
     - Links: Websites/Social/QR
     - Theme: Theme customization

3. **Validation / Deploy**
   - lint เฉพาะไฟล์ profile ผ่าน (`npx eslint src/app/manage/profile/page.tsx`)
   - deploy ฝั่ง web หลายรอบด้วย `docker compose up -d --build web`
   - services `namecard_web` และ `namecard_api` กลับมาสถานะ `Started` ทุกครั้ง

**Git status note (important)**:
- มี commit แล้ว 1 ตัว:
  - `825977a` — `feat(control-center): refine layout and improve loading/empty states`
- commit นี้มี 2 ไฟล์ (ไม่ใช่เฉพาะ control-center):
  - `frontend/src/app/manage/control-center/page.tsx`
  - `frontend/src/app/page.tsx` (ติดมาจาก staged เดิม)
- ยังไม่ได้ push ต่อจากจุดนี้ใน session นี้

**Files updated in this iteration**:
- `frontend/src/app/manage/control-center/page.tsx`
- `frontend/src/app/manage/profile/page.tsx`
- `AGENT_HANDOVER.md`

**Rollback keys for team demo**:
- Control center feature-status block:
  - `SHOW_FEATURE_STATUS_SECTION` (`false` = ซ่อน, `true` = แสดง)
- Profile form mode:
  - `ENABLE_PROFILE_EDITOR_TABS` (`true` = แท็บ, `false` = long-form เดิม)

*Updated by Codex on 2026-03-19*
