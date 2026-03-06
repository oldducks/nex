# Phase 0 Week 2.2: Database Schema

## 📋 Overview
ออกแบบโครงสร้างฐานข้อมูล (Database Schema) สำหรับ NEX Solution MVP

**Database**: PostgreSQL 15
**ORM**: TypeORM 0.3.28

---

## 🗄️ Database Schema Overview

### Core Tables (Existing)
1. **users** - ผู้ใช้
2. **profiles** - โปรไฟล์/นามบัตรดิจิทัล
3. **landing_pages** - หน้า Landing Page
4. **catalogs** - แคตตาล็อกสินค้า
5. **products** - สินค้า
6. **leads** - ข้อมูลลูกค้า
7. **analytics_logs** - สถิติการใช้งาน
8. **referrals** - ระบบแนะนำสมาชิก
9. **orders** - คำสั่งซื้อ

### New Tables (MVP)
10. **forms** - ฟอร์ม
11. **form_fields** - ฟิลด์ของฟอร์ม
12. **form_submissions** - ข้อมูลที่ส่งมาจากฟอร์ม
13. **qr_codes** - QR Codes
14. **subscriptions** - สมัครสมาชิก/Plan

---

## 📊 Entity Relationship Diagram (ERD)

```
users (1) ──< (many) landing_pages
users (1) ──< (many) forms
users (1) ──< (many) qr_codes
users (1) ──< (many) leads
users (1) ──< (many) form_submissions
users (1) ──< (1) profiles
users (1) ──< (1) subscriptions

forms (1) ──< (many) form_fields
forms (1) ──< (many) form_submissions

landing_pages (1) ──< (many) analytics_logs
forms (1) ──< (many) analytics_logs
qr_codes (1) ──< (many) analytics_logs
```

---

## 📝 Table Definitions

### 1. users (Existing - Enhanced)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    uid VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user', -- 'super_admin', 'group_admin', 'user'
    group_id INTEGER,
    feature_config JSONB DEFAULT '{}', -- Feature flags
    referral_code VARCHAR(50) UNIQUE,
    referred_by INTEGER REFERENCES users(id),
    subscription_plan VARCHAR(50) DEFAULT 'free', -- 'free', 'basic', 'premium'
    subscription_status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'expired'
    subscription_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_uid ON users(uid);
CREATE INDEX idx_users_referral_code ON users(referral_code);
CREATE INDEX idx_users_subscription_plan ON users(subscription_plan);
```

**TypeORM Entity**: `User`
- ✅ Already exists
- ⚠️ Need to add: `subscription_plan`, `subscription_status`, `subscription_expires_at`

---

### 2. landing_pages (Existing)

```sql
CREATE TABLE landing_pages (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    content_blocks JSONB DEFAULT '[]', -- Array of blocks
    is_published BOOLEAN DEFAULT true,
    theme_config JSONB,
    seo_metadata JSONB, -- { title, description, keywords, og_image }
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_landing_pages_user_id ON landing_pages(user_id);
CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX idx_landing_pages_is_published ON landing_pages(is_published);
```

**TypeORM Entity**: `LandingPage`
- ✅ Already exists
- ⚠️ Need to add: `view_count`

---

### 3. forms (NEW - MVP)

```sql
CREATE TABLE forms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    thank_you_message TEXT,
    redirect_url VARCHAR(500),
    auto_tag_source BOOLEAN DEFAULT true,
    submission_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_forms_user_id ON forms(user_id);
CREATE INDEX idx_forms_slug ON forms(slug);
```

**TypeORM Entity**: `Form` (to be created)

---

### 4. form_fields (NEW - MVP)

```sql
CREATE TABLE form_fields (
    id SERIAL PRIMARY KEY,
    form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    field_type VARCHAR(50) NOT NULL, -- 'text', 'email', 'phone', 'dropdown', 'textarea'
    label VARCHAR(255) NOT NULL,
    placeholder VARCHAR(255),
    options JSONB, -- For dropdown: ['option1', 'option2']
    is_required BOOLEAN DEFAULT false,
    validation_rules JSONB, -- { min, max, pattern }
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_form_fields_form_id ON form_fields(form_id);
CREATE INDEX idx_form_fields_display_order ON form_fields(display_order);
```

**TypeORM Entity**: `FormField` (to be created)

---

### 5. form_submissions (NEW - MVP)

```sql
CREATE TABLE form_submissions (
    id SERIAL PRIMARY KEY,
    form_id INTEGER NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id), -- Form owner
    submission_data JSONB NOT NULL, -- { field_id: value }
    source VARCHAR(255), -- UTM source
    referrer VARCHAR(500), -- Referrer URL
    user_agent TEXT,
    ip_address VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_user_id ON form_submissions(user_id);
CREATE INDEX idx_form_submissions_created_at ON form_submissions(created_at);
CREATE INDEX idx_form_submissions_is_read ON form_submissions(is_read);
```

**TypeORM Entity**: `FormSubmission` (to be created)

---

### 6. qr_codes (NEW - MVP)

```sql
CREATE TABLE qr_codes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    qr_type VARCHAR(50) NOT NULL, -- 'landing_page', 'form', 'external_url'
    target_id INTEGER, -- landing_page_id or form_id (if applicable)
    target_url VARCHAR(500) NOT NULL, -- Final URL
    qr_data TEXT NOT NULL, -- QR code data
    size VARCHAR(20) DEFAULT 'medium', -- 'small', 'medium', 'large'
    scan_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX idx_qr_codes_qr_type ON qr_codes(qr_type);
CREATE INDEX idx_qr_codes_target_id ON qr_codes(target_id);
```

**TypeORM Entity**: `QRCode` (to be created)

---

### 7. leads (Existing - Enhanced)

```sql
CREATE TABLE leads (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    occupation VARCHAR(255),
    message TEXT,
    source VARCHAR(255), -- UTM source
    referrer VARCHAR(500),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_is_read ON leads(is_read);
CREATE INDEX idx_leads_created_at ON leads(created_at);
```

**TypeORM Entity**: `Lead`
- ✅ Already exists
- ✅ Has all needed fields

---

### 8. analytics_logs (Existing - Enhanced)

```sql
CREATE TABLE analytics_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    uid VARCHAR(50), -- Profile/Page owner UID
    action VARCHAR(50) NOT NULL, -- 'VIEW_PROFILE', 'VIEW_LANDING_PAGE', 'VIEW_FORM', 'SCAN_QR'
    resource_type VARCHAR(50), -- 'profile', 'landing_page', 'form', 'qr_code'
    resource_id INTEGER,
    visitor_id VARCHAR(255),
    ip_address VARCHAR(50),
    user_agent TEXT,
    referrer VARCHAR(500),
    source VARCHAR(255), -- UTM source
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_logs_user_id ON analytics_logs(user_id);
CREATE INDEX idx_analytics_logs_uid ON analytics_logs(uid);
CREATE INDEX idx_analytics_logs_action ON analytics_logs(action);
CREATE INDEX idx_analytics_logs_created_at ON analytics_logs(created_at);
```

**TypeORM Entity**: `AnalyticsLog`
- ✅ Already exists
- ✅ Has all needed fields

---

### 9. subscriptions (NEW - MVP)

```sql
CREATE TABLE subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL, -- 'free', 'basic', 'premium'
    status VARCHAR(50) NOT NULL, -- 'active', 'cancelled', 'expired', 'trial'
    current_period_start TIMESTAMP,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN DEFAULT false,
    payment_method VARCHAR(50), -- 'card', 'bank_transfer', 'promptpay'
    payment_provider VARCHAR(50), -- 'stripe', 'paypal', 'manual'
    payment_provider_id VARCHAR(255), -- External payment ID
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan ON subscriptions(plan);
```

**TypeORM Entity**: `Subscription` (to be created)

---

## 🔗 Relationships

### One-to-Many:
- `users` → `landing_pages`
- `users` → `forms`
- `users` → `qr_codes`
- `users` → `leads`
- `users` → `form_submissions`
- `forms` → `form_fields`
- `forms` → `form_submissions`

### One-to-One:
- `users` → `profiles`
- `users` → `subscriptions`

---

## 📊 Data Types

### JSONB Usage:
- `users.feature_config` - Feature flags
- `landing_pages.content_blocks` - Page blocks
- `landing_pages.theme_config` - Theme settings
- `landing_pages.seo_metadata` - SEO data
- `form_fields.options` - Dropdown options
- `form_fields.validation_rules` - Validation rules
- `form_submissions.submission_data` - Form data
- `analytics_logs.metadata` - Additional analytics data

### Enums:
- `users.role`: 'super_admin', 'group_admin', 'user'
- `users.subscription_plan`: 'free', 'basic', 'premium'
- `users.subscription_status`: 'active', 'cancelled', 'expired'
- `form_fields.field_type`: 'text', 'email', 'phone', 'dropdown', 'textarea'
- `qr_codes.qr_type`: 'landing_page', 'form', 'external_url'
- `qr_codes.size`: 'small', 'medium', 'large'
- `subscriptions.plan`: 'free', 'basic', 'premium'
- `subscriptions.status`: 'active', 'cancelled', 'expired', 'trial'

---

## 🔍 Indexes

### Performance Indexes:
- All foreign keys indexed
- Frequently queried columns indexed
- Composite indexes for common queries

### Example Queries:
```sql
-- Get user's landing pages
SELECT * FROM landing_pages WHERE user_id = ? AND is_published = true;

-- Get form submissions
SELECT * FROM form_submissions WHERE form_id = ? ORDER BY created_at DESC;

-- Get QR codes by user
SELECT * FROM qr_codes WHERE user_id = ? ORDER BY created_at DESC;

-- Get analytics for landing page
SELECT * FROM analytics_logs WHERE resource_type = 'landing_page' AND resource_id = ?;
```

---

## 🔐 Security Considerations

### Data Protection:
- Passwords: Hashed with bcrypt
- Sensitive data: Encrypted at rest
- PII: Protected according to GDPR

### Access Control:
- Row-level security via user_id
- Foreign key constraints for data integrity
- Soft deletes (if needed) via `deleted_at` column

---

## 📈 Scalability

### Partitioning (Future):
- `analytics_logs` - Partition by month
- `form_submissions` - Partition by month (if large volume)

### Archiving (Future):
- Old analytics logs → Archive table
- Old form submissions → Archive table

---

## 🚀 Migration Strategy

### Phase 1 (MVP):
1. Create new tables: `forms`, `form_fields`, `form_submissions`, `qr_codes`, `subscriptions`
2. Add columns to existing tables: `users.subscription_*`, `landing_pages.view_count`
3. Create indexes
4. Add foreign key constraints

### Phase 2+:
1. Add analytics partitioning
2. Add archiving tables
3. Add performance optimizations

---

## 📝 Notes

### TypeORM Migrations:
- Use TypeORM migrations for schema changes
- Version control all migrations
- Test migrations on staging first

### Backup Strategy:
- Daily backups
- Point-in-time recovery
- Backup retention: 30 days

---

**Status**: ✅ Completed
**Date**: 2026-03-05
**Next**: Week 2.3 - API Structure
