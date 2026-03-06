# Phase 0 Week 2.1: Tech Stack Selection

## 📋 Overview
เลือกและกำหนดเทคโนโลยีที่ใช้ใน NEX Solution

**Status**: ✅ **Mostly Decided** (ตรวจสอบจาก codebase ปัจจุบัน)

---

## 🎯 Tech Stack Decisions

### Frontend Framework
**Choice**: ✅ **Next.js 16.1.6**

**Rationale**:
- Server-Side Rendering (SSR) สำหรับ SEO
- API Routes สำหรับ backend integration
- File-based routing
- Built-in optimization
- TypeScript support

**Current Setup**:
- Next.js 16.1.6
- React 19.2.3
- TypeScript 5
- Tailwind CSS 4

**Dependencies**:
- `framer-motion` - Animation
- `lucide-react` - Icons
- `js-cookie` - Cookie management
- `recharts` - Charts/Analytics
- `html2canvas` - Image export

---

### Backend Framework
**Choice**: ✅ **NestJS 11**

**Rationale**:
- Modular architecture
- TypeScript-first
- Built-in dependency injection
- Excellent for large-scale applications
- Strong ecosystem

**Current Setup**:
- NestJS 11.0.1
- TypeScript 5.7.3
- Express (via @nestjs/platform-express)

**Key Modules**:
- `@nestjs/typeorm` - Database ORM
- `@nestjs/jwt` - Authentication
- `@nestjs/passport` - OAuth
- `@nestjs/bullmq` - Queue management
- `@nestjs/config` - Configuration

---

### Database
**Choice**: ✅ **PostgreSQL 15**

**Rationale**:
- Relational database สำหรับ structured data
- ACID compliance
- JSON support สำหรับ flexible data
- Excellent performance
- Strong ecosystem

**Current Setup**:
- PostgreSQL 15-alpine (Docker)
- TypeORM 0.3.28 (ORM)
- Connection pooling

**Database Name**: `namecard_platform`

---

### Cache & Queue
**Choice**: ✅ **Redis**

**Rationale**:
- Fast in-memory cache
- Queue management (BullMQ)
- Session storage
- Real-time features support

**Current Setup**:
- Redis Alpine (Docker)
- BullMQ 5.67.2 (Queue)
- @nestjs/bullmq (NestJS integration)

---

### File Storage
**Choice**: ⚠️ **Local Storage (Current) / Cloud Storage (Recommended)**

**Current Setup**:
- Local file storage (`./uploads`)
- Sharp 0.33.5 (Image processing)
- Fluent FFmpeg (Video processing)

**Recommendation for Production**:
- **Option 1**: AWS S3 + CloudFront
- **Option 2**: Google Cloud Storage
- **Option 3**: DigitalOcean Spaces
- **Option 4**: Cloudflare R2

**Decision**: ใช้ Local Storage ใน MVP, Migrate to Cloud Storage ใน Phase 2

---

### Authentication
**Choice**: ✅ **JWT + Passport**

**Current Setup**:
- JWT (JSON Web Tokens)
- Passport.js
- OAuth Providers:
  - Google OAuth 2.0
  - Facebook OAuth
  - LINE OAuth
- Bcrypt (Password hashing)

---

### Image Processing
**Choice**: ✅ **Sharp**

**Current Setup**:
- Sharp 0.33.5
- Image optimization
- Resize, crop, format conversion

---

### Video Processing
**Choice**: ✅ **FFmpeg**

**Current Setup**:
- Fluent FFmpeg 2.1.3
- Video conversion
- Thumbnail generation

---

### QR Code Generation
**Choice**: ⚠️ **To Be Decided**

**Options**:
- `qrcode` (npm) - Simple, lightweight
- `qrcode-generator` - More features
- `node-qr-image` - Image output

**Decision**: ใช้ `qrcode` + `sharp` สำหรับ MVP

---

### PDF Generation
**Choice**: ⚠️ **To Be Decided**

**Options**:
- Puppeteer (already in dependencies) - HTML to PDF
- PDFKit - Programmatic PDF
- jsPDF - Client-side PDF

**Decision**: ใช้ Puppeteer สำหรับ HTML to PDF (ถ้าต้องการ)

---

### Email Service
**Choice**: ✅ **Nodemailer**

**Current Setup**:
- Nodemailer 6.9.15
- SMTP configuration
- Password reset emails

**SMTP Provider**: Gmail (current) / SendGrid / AWS SES (recommended for production)

---

### API Documentation
**Choice**: ⚠️ **To Be Implemented**

**Options**:
- Swagger/OpenAPI (recommended)
- Postman Collection
- API Blueprint

**Decision**: ใช้ Swagger/OpenAPI สำหรับ API documentation

---

### Testing
**Choice**: ✅ **Jest**

**Current Setup**:
- Jest 30.0.0
- Supertest (E2E testing)
- ts-jest (TypeScript support)

---

### Code Quality
**Choice**: ✅ **ESLint + Prettier**

**Current Setup**:
- ESLint 9.18.0
- Prettier 3.4.2
- TypeScript ESLint

---

## 🚀 Deployment & Infrastructure

### Containerization
**Choice**: ✅ **Docker + Docker Compose**

**Current Setup**:
- Docker Compose 3.8
- Multi-container setup:
  - PostgreSQL container
  - Redis container
  - Backend API container
  - Frontend Web container

---

### Reverse Proxy
**Choice**: ✅ **Nginx** (Current)

**Current Setup**:
- Nginx reverse proxy
- SSL/TLS (Certbot)
- Domain: nexsolution.cloud

**Recommendation**: Keep Nginx for production

---

### CI/CD
**Choice**: ⚠️ **To Be Implemented**

**Options**:
- GitHub Actions (recommended)
- GitLab CI
- Jenkins

**Decision**: ใช้ GitHub Actions สำหรับ CI/CD

---

### Monitoring & Logging
**Choice**: ⚠️ **To Be Implemented**

**Options**:
- Application Logging: Winston / Pino
- Error Tracking: Sentry
- Performance: New Relic / Datadog
- Uptime: UptimeRobot

**Decision**: ใช้ Winston สำหรับ logging, Sentry สำหรับ error tracking

---

## 📦 Package Management

### Backend
- **Package Manager**: npm
- **Node Version**: 18+ (recommended)

### Frontend
- **Package Manager**: npm
- **Node Version**: 18+ (recommended)

---

## 🔧 Development Tools

### Version Control
- **Git** + GitHub/GitLab

### IDE Recommendations
- **VS Code** (recommended)
- **WebStorm**
- **Cursor** (AI-powered)

### Database Tools
- **pgAdmin** (PostgreSQL)
- **DBeaver** (Universal)
- **TablePlus** (Modern UI)

---

## 📊 Tech Stack Summary

| Category | Technology | Version | Status |
|----------|-----------|---------|--------|
| **Frontend** | Next.js | 16.1.6 | ✅ Decided |
| **Frontend UI** | React | 19.2.3 | ✅ Decided |
| **Frontend Styling** | Tailwind CSS | 4 | ✅ Decided |
| **Backend** | NestJS | 11.0.1 | ✅ Decided |
| **Database** | PostgreSQL | 15 | ✅ Decided |
| **ORM** | TypeORM | 0.3.28 | ✅ Decided |
| **Cache/Queue** | Redis | Alpine | ✅ Decided |
| **Queue Library** | BullMQ | 5.67.2 | ✅ Decided |
| **Auth** | JWT + Passport | - | ✅ Decided |
| **File Storage** | Local (MVP) | - | ⚠️ To Migrate |
| **Image Processing** | Sharp | 0.33.5 | ✅ Decided |
| **Video Processing** | FFmpeg | 2.1.3 | ✅ Decided |
| **Email** | Nodemailer | 6.9.15 | ✅ Decided |
| **Testing** | Jest | 30.0.0 | ✅ Decided |
| **Container** | Docker | - | ✅ Decided |
| **Reverse Proxy** | Nginx | - | ✅ Decided |
| **CI/CD** | GitHub Actions | - | ⚠️ To Implement |
| **Monitoring** | Winston + Sentry | - | ⚠️ To Implement |
| **API Docs** | Swagger | - | ⚠️ To Implement |
| **QR Code** | qrcode | - | ⚠️ To Add |

---

## 🎯 Next Steps

### Immediate (Week 2):
1. ✅ Document current tech stack
2. ⚠️ Add QR Code library
3. ⚠️ Setup Swagger/OpenAPI
4. ⚠️ Plan cloud storage migration

### Phase 1 (MVP):
1. Implement QR Code generation
2. Setup API documentation
3. Setup basic logging
4. Setup CI/CD pipeline

### Phase 2+:
1. Migrate to cloud storage
2. Setup error tracking (Sentry)
3. Setup performance monitoring
4. Setup advanced logging

---

**Status**: ✅ Completed
**Date**: 2026-03-05
**Next**: Week 2.2 - Database Schema
