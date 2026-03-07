## DEVELOPMENT_CHECKLIST — NEX Solution

เอกสารนี้สรุป **สถานะงานพัฒนา** แบบ checklist โดยอ้างอิง milestone ล่าสุดใน `AGENT_HANDOVER.md`

> หมายเหตุ: หากต้องการดูรายละเอียดการเปลี่ยนแปลง/ไฟล์ที่เกี่ยวข้อง ให้เปิด `AGENT_HANDOVER.md`

---

### Phase 1 — Core Infrastructure (Week 3–4)

#### 1.1 Authentication System
- [x] Email/Password Authentication
- [x] OAuth (Google / LINE / Facebook)
- [x] JWT Token Management
- [x] Password Reset Flow (email)
- [x] Session Management (httpOnly cookie + JWT fallback)
- [x] Tests (AuthService unit tests)

#### 1.2 User Management
- [x] User Registration (self + admin create)
- [x] User Profile Management (`/users/me` + profile relation)
- [x] User Roles & Permissions (guards + role checks)
- [x] User Settings (active/expiration/tier/feature_config)
- [x] Tests (UsersService unit tests)
- [x] Authorization hardening (protect `/users/:id`, prevent mass assignment)

#### 1.3 Workspace / Group Model (Multi-tenancy)
- [x] Workspace/Organization model via `group_id`
- [x] Multi-tenant scoping (super_admin vs group_admin) บน orders/analytics
- [x] Tests (OrdersService multi-tenancy tests)

#### 1.4 Asset Storage (Local baseline)
- [x] File Upload Endpoint (image/video)
- [x] Background Image Processing (WebP compression + progress tracking)
- [x] Background Video Processing (720p H.264 + progress tracking)
- [x] File Storage (local)
- [x] Auto-Cleanup Job (Midnight cron) with Telegram notifications
- [x] Tests (UploadsService + UploadsProcessor worker)

#### 1.5 Logging System
- [x] Request logging middleware (duration/status/level)
- [x] Structured JSON logger
- [x] Audit logging interceptor (state-changing methods)
- [x] Log aggregation baseline (structured logs ready)
- [x] Tests (StructuredLogger unit tests)

#### 1.6 API Protection Baseline
- [x] Global rate limiting (`@nestjs/throttler`) enabled
- [x] Public forms endpoint throttled (read + submit)
- [x] Public QR download endpoint throttled

#### 2.4 Frontend Runtime Conventions
- [x] Next.js middleware convention migrated to `proxy.ts`
- [x] Build warning for deprecated middleware resolved

#### 3.x DevOps (Phase 1 Baseline)
- [x] Staging Environment plan + runbook
- [x] CI/CD pipeline (lint/build + deploy gate)
- [x] Automated tests gate in pipeline
- [x] Backup policy (scripts + runbook)
- [x] Backup restoration test (baseline: documented + staging-first policy)

---

### Phase 2 — NEX Page (Landing Page Builder) (Week 5–7)

#### 5.x Page Builder v1
- [x] Create new page + slug + CRUD
- [x] Basic sections via `content_blocks`
- [x] Hero/Text/Image/CTA blocks baseline
- [x] Reorder blocks (drag & drop / UI)
- [x] Live upload progress UI for images & videos
- [x] Save draft (autosave debounce)

#### 6.x Publish System
- [x] Publish/Unpublish + public URL
- [x] SEO basic (metadata editor + OG/Twitter tags on public page)
- [x] Responsive + preview mode

#### 7.x Form Integration (Landing Page)
- [x] Embed form block (external + internal)
- [x] Internal form submission saves to leads (`POST /contact/:uid`)
- [x] Thank-you message
- [x] Redirect after submit (configurable delay)
- [x] Export leads to CSV (API + UI)
- [x] View tracking (VIEW_LANDING_PAGE)
- [x] View count display in dashboard (per-page)

---

### Phase 3 — NEX Form (Lead Form Builder) (Week 8)

- [x] Public form API (`GET /public/forms/:id`)
- [x] Public form page (`/forms/[id]`) render field types (text/email/phone/textarea/dropdown/checkbox)
- [x] Client-side validation (required + basic email)
- [x] Submit public form (`POST /public/forms/:id/submit`)

---

### Phase 4 — NEX Code (QR Generator) (Week 9)

- [x] Link QR to Landing Page (selector + targetUrl auto fill)
- [x] Link QR to Form (selector + targetUrl auto fill)
- [x] Public QR download endpoint + redirect
- [x] Scan tracking (increment scan_count + log analytics `SCAN_QR`)
- [x] Test QR for page (baseline via unit tests on service/controller)
- [x] Test QR for form (baseline via unit tests on service/controller)
- [x] Test QR saving/management (baseline via unit tests on service)

---

### Phase 5 — NEX Create Lite (Week 10)

- [x] Templates list endpoint (backend) + UI selection (frontend)
- [x] Advanced editor (replace text/image, undo/redo, variants)
- [x] Export image (PNG/JPG)
- [x] AI copy suggestion (Completed with Text & Button blocks)

---

### Phase 6 — Polish & Beta Launch (Week 11–12)

- [x] Improve loading speed (Implemented SSR with generateMetadata for Landing Pages)
- [x] Error handling polish (Implemented premium Toast system and better save feedback)
- [x] UX improvement pass (Completed for Analytics Dashboard and Landing Page Editor)
- [x] Basic analytics dashboard polish (Completed with gradients & premium cards)
- [x] PDPA Consent Management (Backend entities + Frontend Cookie Banner)
- [x] Secret Management (Moved Telegram tokens to .env)
- [x] URL Infrastructure Clean-up (Removed /app prefix for better SEO and shorter links)
