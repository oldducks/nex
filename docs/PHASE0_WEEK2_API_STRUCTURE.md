# Phase 0 Week 2.3: API Structure

## 📋 Overview
ออกแบบโครงสร้าง API (API Structure) สำหรับ NEX Solution MVP

**Framework**: NestJS 11
**API Style**: RESTful API
**Documentation**: Swagger/OpenAPI (to be implemented)

---

## 🎯 API Design Principles

### RESTful Conventions:
- Use HTTP methods: GET, POST, PUT, PATCH, DELETE
- Use resource-based URLs
- Use proper HTTP status codes
- Use consistent response format

### Response Format:
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message",
  "meta": { ... } // Pagination, etc.
}
```

### Error Format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

---

## 🔐 Authentication

### Base URL:
```
/api/auth
```

### Endpoints:

#### POST `/api/auth/register`
Register new user
```json
Request: {
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe"
}
Response: {
  "success": true,
  "data": {
    "access_token": "jwt_token",
    "user": { ... }
  }
}
```

#### POST `/api/auth/login`
Login user
```json
Request: {
  "email": "user@example.com",
  "password": "password123"
}
Response: {
  "success": true,
  "data": {
    "access_token": "jwt_token",
    "uid": "user_uid",
    "user": { ... }
  }
}
```

#### POST `/api/auth/logout`
Logout user (invalidate token)

#### GET `/api/auth/me`
Get current user info
```json
Response: {
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "role": "user",
    "subscription_plan": "free",
    ...
  }
}
```

#### POST `/api/auth/forgot-password`
Request password reset
```json
Request: {
  "email": "user@example.com"
}
```

#### POST `/api/auth/reset-password`
Reset password with token
```json
Request: {
  "token": "reset_token",
  "password": "new_password"
}
```

#### OAuth Endpoints:
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/line` - LINE OAuth
- `GET /api/auth/line/callback` - LINE OAuth callback
- `GET /api/auth/facebook` - Facebook OAuth
- `GET /api/auth/facebook/callback` - Facebook OAuth callback

---

## 📄 Landing Pages API

### Base URL:
```
/api/landing-pages
```

### Endpoints:

#### GET `/api/landing-pages`
Get user's landing pages
```json
Query: {
  "page": 1,
  "limit": 10,
  "is_published": true
}
Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "My Landing Page",
      "slug": "my-landing-page",
      "is_published": true,
      "view_count": 100,
      "created_at": "2026-03-05T00:00:00Z"
    }
  ],
  "meta": {
    "total": 10,
    "page": 1,
    "limit": 10
  }
}
```

#### POST `/api/landing-pages`
Create new landing page
```json
Request: {
  "title": "My Landing Page",
  "description": "Description",
  "content_blocks": [],
  "seo_metadata": {
    "title": "SEO Title",
    "description": "SEO Description"
  }
}
Response: {
  "success": true,
  "data": {
    "id": 1,
    "slug": "my-landing-page",
    ...
  }
}
```

#### GET `/api/landing-pages/:id`
Get landing page by ID

#### PATCH `/api/landing-pages/:id`
Update landing page
```json
Request: {
  "title": "Updated Title",
  "content_blocks": [ ... ],
  "is_published": true
}
```

#### DELETE `/api/landing-pages/:id`
Delete landing page

#### POST `/api/landing-pages/:id/publish`
Publish landing page

#### POST `/api/landing-pages/:id/unpublish`
Unpublish landing page

#### GET `/api/landing-pages/public/:slug`
Get public landing page (no auth required)
```json
Response: {
  "success": true,
  "data": {
    "title": "My Landing Page",
    "content_blocks": [ ... ],
    "theme_config": { ... },
    "seo_metadata": { ... }
  }
}
```

#### POST `/api/landing-pages/:id/track-view`
Track page view (no auth required)
```json
Request: {
  "visitor_id": "visitor_123",
  "referrer": "https://google.com",
  "source": "google"
}
```

---

## 📝 Forms API

### Base URL:
```
/api/forms
```

### Endpoints:

#### GET `/api/forms`
Get user's forms
```json
Query: {
  "page": 1,
  "limit": 10
}
Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Contact Form",
      "slug": "contact-form",
      "submission_count": 50,
      "created_at": "2026-03-05T00:00:00Z"
    }
  ]
}
```

#### POST `/api/forms`
Create new form
```json
Request: {
  "name": "Contact Form",
  "description": "Contact us form",
  "thank_you_message": "Thank you for your submission!",
  "redirect_url": "https://example.com/thank-you",
  "auto_tag_source": true,
  "fields": [
    {
      "field_type": "text",
      "label": "Full Name",
      "is_required": true
    },
    {
      "field_type": "email",
      "label": "Email",
      "is_required": true
    }
  ]
}
Response: {
  "success": true,
  "data": {
    "id": 1,
    "slug": "contact-form",
    ...
  }
}
```

#### GET `/api/forms/:id`
Get form by ID (with fields)

#### PATCH `/api/forms/:id`
Update form

#### DELETE `/api/forms/:id`
Delete form

#### GET `/api/forms/:id/submissions`
Get form submissions
```json
Query: {
  "page": 1,
  "limit": 20,
  "is_read": false
}
Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "submission_data": {
        "full_name": "John Doe",
        "email": "john@example.com"
      },
      "source": "google",
      "referrer": "https://google.com",
      "created_at": "2026-03-05T00:00:00Z"
    }
  ],
  "meta": {
    "total": 50,
    "unread": 10
  }
}
```

#### POST `/api/forms/:id/submissions`
Submit form (no auth required)
```json
Request: {
  "submission_data": {
    "field_1": "John Doe",
    "field_2": "john@example.com"
  },
  "source": "google",
  "referrer": "https://google.com"
}
Response: {
  "success": true,
  "message": "Thank you for your submission!"
}
```

#### GET `/api/forms/:id/submissions/export`
Export submissions as CSV
```json
Query: {
  "format": "csv",
  "start_date": "2026-01-01",
  "end_date": "2026-03-05"
}
Response: CSV file download
```

#### GET `/api/forms/public/:slug`
Get public form (no auth required)

---

## 🔲 QR Codes API

### Base URL:
```
/api/qr-codes
```

### Endpoints:

#### GET `/api/qr-codes`
Get user's QR codes
```json
Query: {
  "page": 1,
  "limit": 10,
  "qr_type": "landing_page"
}
Response: {
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Landing Page QR",
      "qr_type": "landing_page",
      "target_url": "https://nexsolution.cloud/lp/my-page",
      "scan_count": 25,
      "created_at": "2026-03-05T00:00:00Z"
    }
  ]
}
```

#### POST `/api/qr-codes`
Create new QR code
```json
Request: {
  "name": "Landing Page QR",
  "qr_type": "landing_page", // 'landing_page', 'form', 'external_url'
  "target_id": 1, // landing_page_id or form_id
  "target_url": "https://nexsolution.cloud/lp/my-page", // For external_url
  "size": "medium" // 'small', 'medium', 'large'
}
Response: {
  "success": true,
  "data": {
    "id": 1,
    "qr_data": "data:image/png;base64,...",
    "qr_url": "https://nexsolution.cloud/qr/abc123",
    ...
  }
}
```

#### GET `/api/qr-codes/:id`
Get QR code by ID

#### PATCH `/api/qr-codes/:id`
Update QR code

#### DELETE `/api/qr-codes/:id`
Delete QR code

#### GET `/api/qr-codes/:id/download`
Download QR code image
```json
Query: {
  "format": "png", // 'png', 'svg'
  "size": "large"
}
Response: Image file download
```

#### POST `/api/qr-codes/:id/track-scan`
Track QR scan (no auth required)
```json
Request: {
  "visitor_id": "visitor_123",
  "source": "print"
}
```

---

## 📊 Analytics API

### Base URL:
```
/api/analytics
```

### Endpoints:

#### POST `/api/analytics/log`
Log analytics event (no auth required)
```json
Request: {
  "uid": "user_uid",
  "action": "VIEW_LANDING_PAGE",
  "resource_type": "landing_page",
  "resource_id": 1,
  "visitor_id": "visitor_123",
  "source": "google",
  "referrer": "https://google.com"
}
```

#### GET `/api/analytics/stats`
Get analytics statistics
```json
Query: {
  "uid": "user_uid",
  "period": "30days", // '7days', '30days', '90days', 'all'
  "resource_type": "landing_page",
  "resource_id": 1
}
Response: {
  "success": true,
  "data": {
    "total_views": 1000,
    "unique_visitors": 500,
    "conversion_rate": 5.5,
    "sources": {
      "google": 400,
      "direct": 300,
      "facebook": 200,
      "other": 100
    },
    "daily_stats": [
      {
        "date": "2026-03-05",
        "views": 50,
        "submissions": 5
      }
    ]
  }
}
```

---

## 👤 Users API

### Base URL:
```
/api/users
```

### Endpoints:

#### GET `/api/users/me`
Get current user profile

#### PATCH `/api/users/me`
Update user profile
```json
Request: {
  "full_name": "John Doe",
  "email": "newemail@example.com"
}
```

#### GET `/api/users/me/subscription`
Get user subscription info
```json
Response: {
  "success": true,
  "data": {
    "plan": "basic",
    "status": "active",
    "current_period_end": "2026-04-05T00:00:00Z",
    "limits": {
      "landing_pages": 10,
      "forms": 10,
      "qr_codes": 50,
      "leads_per_month": 500
    },
    "usage": {
      "landing_pages": 5,
      "forms": 3,
      "qr_codes": 10,
      "leads_this_month": 150
    }
  }
}
```

#### POST `/api/users/me/subscription/upgrade`
Upgrade subscription
```json
Request: {
  "plan": "premium",
  "payment_method": "card"
}
```

---

## 📁 File Upload API

### Base URL:
```
/api/uploads
```

### Endpoints:

#### POST `/api/uploads/image`
Upload image
```json
Request: FormData {
  "file": File,
  "folder": "landing-pages" // Optional
}
Response: {
  "success": true,
  "data": {
    "url": "https://nexsolution.cloud/uploads/image_123.jpg",
    "filename": "image_123.jpg",
    "size": 102400,
    "mime_type": "image/jpeg"
  }
}
```

#### POST `/api/uploads/video`
Upload video
```json
Request: FormData {
  "file": File
}
Response: {
  "success": true,
  "data": {
    "url": "https://nexsolution.cloud/uploads/video_123.mp4",
    "filename": "video_123.mp4",
    "size": 5242880,
    "mime_type": "video/mp4"
  }
}
```

---

## 🔒 Authorization

### Protected Routes:
- All routes under `/api/*` require authentication (except public routes)
- Use JWT Bearer token in Authorization header
- Format: `Authorization: Bearer <token>`

### Public Routes (No Auth):
- `GET /api/landing-pages/public/:slug`
- `POST /api/forms/:id/submissions`
- `GET /api/forms/public/:slug`
- `POST /api/analytics/log`
- `POST /api/qr-codes/:id/track-scan`

### Role-Based Access:
- `User`: Can access own resources
- `Admin`: Can access all resources
- `Super Admin`: Full system access

---

## 📊 Rate Limiting

### Limits:
- **Public API**: 100 requests/minute
- **Authenticated API**: 1000 requests/minute
- **File Upload**: 10 uploads/minute

### Headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1646400000
```

---

## 📝 API Versioning

### Current Version:
- `v1` (default, no prefix needed)

### Future Versions:
- `/api/v2/*` (when breaking changes needed)

---

## 🔍 Error Codes

### Common Error Codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

### Custom Error Codes:
- `SUBSCRIPTION_LIMIT_EXCEEDED` - Plan limit reached
- `RESOURCE_NOT_FOUND` - Resource doesn't exist
- `VALIDATION_ERROR` - Input validation failed
- `UNAUTHORIZED_ACCESS` - No permission to access

---

## 📚 API Documentation

### Swagger/OpenAPI:
- **URL**: `/api/docs` (to be implemented)
- **Format**: OpenAPI 3.0
- **Features**: Interactive API explorer, Request/Response examples

---

## 🚀 Implementation Notes

### NestJS Structure:
```
backend/src/
├── auth/          # Authentication module
├── landing-pages/ # Landing pages module
├── forms/         # Forms module (NEW)
├── qr-codes/      # QR codes module (NEW)
├── analytics/     # Analytics module
├── users/         # Users module
└── uploads/       # File upload module
```

### Each Module Contains:
- `*.controller.ts` - API endpoints
- `*.service.ts` - Business logic
- `*.module.ts` - Module definition
- `dto/*.dto.ts` - Data transfer objects
- `entities/*.entity.ts` - Database entities

---

**Status**: ✅ Completed
**Date**: 2026-03-05
**Next**: Week 2.4 - Hosting Plan
