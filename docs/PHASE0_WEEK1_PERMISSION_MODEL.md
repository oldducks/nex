# Phase 0 Week 1.3: Permission Model

## 📋 Overview
กำหนดโมเดลสิทธิ์การใช้งาน (Permission Model) สำหรับ NEX Solution

---

## 👥 User Roles

### 1. Guest (ผู้เยี่ยมชม)
**Description**: ผู้ใช้ที่ไม่ได้เข้าสู่ระบบ

**Permissions**:
- ✅ View Published Landing Pages
- ✅ Submit Forms (on published pages)
- ✅ View Public QR Codes
- ❌ Create/Edit Content
- ❌ View Analytics
- ❌ Access Dashboard

**Use Cases**:
- Visitor ที่เข้ามาดู Landing Page
- Visitor ที่กรอก Form

---

### 2. User (ผู้ใช้ทั่วไป)
**Description**: ผู้ใช้ที่สมัครสมาชิกและเข้าสู่ระบบแล้ว

**Permissions**:
- ✅ Create Landing Pages (limited by plan)
- ✅ Edit Own Landing Pages
- ✅ Delete Own Landing Pages
- ✅ Publish/Unpublish Own Landing Pages
- ✅ Create Forms (limited by plan)
- ✅ Edit Own Forms
- ✅ Delete Own Forms
- ✅ Create QR Codes (limited by plan)
- ✅ View Own Analytics
- ✅ View Own Form Submissions
- ✅ Export Own Data (CSV)
- ✅ Manage Own Profile
- ❌ View Other Users' Content
- ❌ Manage Other Users
- ❌ Access Admin Features

**Limits (by Plan)**:
- **Free Plan**: 3 Landing Pages, 3 Forms, 10 QR Codes, 100 Leads/month
- **Basic Plan**: 10 Landing Pages, 10 Forms, 50 QR Codes, 500 Leads/month
- **Premium Plan**: Unlimited Landing Pages, Unlimited Forms, Unlimited QR Codes, Unlimited Leads

**Use Cases**:
- Business Owner ที่สร้าง Landing Page
- Marketing Admin ที่จัดการแคมเปญ
- Sales Team ที่สร้าง QR Codes

---

### 3. Admin (ผู้ดูแลระบบ)
**Description**: ผู้ดูแลระบบที่มีสิทธิ์เต็ม

**Permissions**:
- ✅ All User Permissions
- ✅ View All Users' Content
- ✅ Manage All Users
- ✅ View System Analytics
- ✅ Manage System Settings
- ✅ Manage Feature Flags
- ✅ Access Admin Dashboard
- ✅ Manage Plans & Pricing
- ✅ View System Logs

**Use Cases**:
- System Administrator
- Support Team
- Product Manager

---

### 4. Super Admin (ผู้ดูแลระบบสูงสุด)
**Description**: ผู้ดูแลระบบระดับสูงสุด

**Permissions**:
- ✅ All Admin Permissions
- ✅ Manage Admin Users
- ✅ Manage System Configuration
- ✅ Access Database
- ✅ Manage Backups
- ✅ Manage Integrations

**Use Cases**:
- CTO
- Technical Lead
- DevOps Team

---

## 🔐 Feature Flags

### Feature Access Control
ใช้ Feature Flags เพื่อควบคุมการเข้าถึงฟีเจอร์ตาม Plan

#### Feature: Landing Pages
- **Free**: 3 pages
- **Basic**: 10 pages
- **Premium**: Unlimited

#### Feature: Forms
- **Free**: 3 forms
- **Basic**: 10 forms
- **Premium**: Unlimited

#### Feature: QR Codes
- **Free**: 10 QR codes
- **Basic**: 50 QR codes
- **Premium**: Unlimited

#### Feature: Leads/Submissions
- **Free**: 100/month
- **Basic**: 500/month
- **Premium**: Unlimited

#### Feature: Analytics
- **Free**: Basic (View Count only)
- **Basic**: Standard (Views + Submissions)
- **Premium**: Advanced (Full Analytics)

#### Feature: Export
- **Free**: CSV Export (limited)
- **Basic**: CSV Export (unlimited)
- **Premium**: CSV + API Export

#### Feature: Custom Domain
- **Free**: ❌
- **Basic**: ❌
- **Premium**: ✅

#### Feature: White Label
- **Free**: ❌
- **Basic**: ❌
- **Premium**: ✅ (Phase 3+)

---

## 🔒 Resource Ownership

### Ownership Rules:
1. **User owns their content**:
   - Landing Pages created by user
   - Forms created by user
   - QR Codes created by user
   - Submissions from their forms

2. **Access Control**:
   - Users can only view/edit their own content
   - Admins can view/edit all content
   - Public can only view published content

3. **Deletion Rules**:
   - Users can delete their own content
   - Admins can delete any content
   - Deletion is soft delete (can restore)

---

## 🛡️ Security & Privacy

### Data Privacy:
- **User Data**: Only accessible by user and admins
- **Form Submissions**: Only accessible by form owner
- **Analytics**: Aggregated data only (no personal info)

### Access Control:
- **Authentication Required**: All dashboard features
- **JWT Tokens**: For API access
- **Role-Based Access**: Enforced at API level
- **Rate Limiting**: Prevent abuse

### Data Protection:
- **Encryption**: Sensitive data encrypted at rest
- **HTTPS**: All communications encrypted
- **GDPR Compliance**: User can request data deletion
- **Backup**: Regular backups with retention policy

---

## 📊 Permission Matrix

| Feature | Guest | User (Free) | User (Basic) | User (Premium) | Admin | Super Admin |
|---------|-------|-------------|-------------|----------------|-------|-------------|
| View Published Pages | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit Forms | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Create Landing Pages | ❌ | ✅ (3) | ✅ (10) | ✅ (∞) | ✅ (∞) | ✅ (∞) |
| Create Forms | ❌ | ✅ (3) | ✅ (10) | ✅ (∞) | ✅ (∞) | ✅ (∞) |
| Create QR Codes | ❌ | ✅ (10) | ✅ (50) | ✅ (∞) | ✅ (∞) | ✅ (∞) |
| View Analytics | ❌ | ✅ (Basic) | ✅ (Standard) | ✅ (Advanced) | ✅ (All) | ✅ (All) |
| Export Data | ❌ | ✅ (Limited) | ✅ (Unlimited) | ✅ (Unlimited) | ✅ (All) | ✅ (All) |
| Manage Users | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| System Settings | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 🔄 Role Assignment

### Default Role:
- New users are assigned **User (Free)** role by default

### Role Upgrade:
- Users can upgrade plan (Free → Basic → Premium)
- Upgrade is managed through payment system
- Role changes immediately after payment

### Admin Assignment:
- Admins are assigned manually by Super Admin
- Admin role cannot be self-assigned
- Admin access is logged and audited

---

## 📝 Implementation Notes

### Backend:
- Use Role-Based Access Control (RBAC)
- Implement Guards for route protection
- Check permissions at service level
- Log all permission checks

### Frontend:
- Show/hide features based on role
- Disable actions user cannot perform
- Show upgrade prompts for premium features
- Display current plan limits

### Database:
- Store user roles in `users` table
- Store plan limits in `subscriptions` table
- Store feature flags in `feature_config` table

---

**Status**: ✅ Completed
**Date**: 2026-03-05
**Next**: Week 1.4 - Pricing Draft
