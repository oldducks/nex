# Phase 0 Week 2.4: Hosting Plan

## 📋 Overview
กำหนดแผนโฮสติ้ง (Hosting Plan) สำหรับ NEX Solution

**Current Setup**: Docker Compose on VPS
**Production Target**: Scalable cloud infrastructure

---

## 🏗️ Current Infrastructure

### Current Setup:
- **VPS**: Linux server
- **Containerization**: Docker + Docker Compose
- **Reverse Proxy**: Nginx
- **SSL/TLS**: Certbot (Let's Encrypt)
- **Domain**: nexsolution.cloud

### Services Running:
- PostgreSQL 15 (Database)
- Redis Alpine (Cache/Queue)
- NestJS API (Backend)
- Next.js Web (Frontend)
- Nginx (Reverse Proxy)

---

## 🎯 Production Infrastructure Plan

### Option 1: VPS + Docker (Current - MVP)
**Cost**: ~฿500-1,000/เดือน

**Pros**:
- Low cost
- Full control
- Simple setup

**Cons**:
- Manual scaling
- Single point of failure
- Manual backups

**Suitable for**: MVP, Small scale (< 1,000 users)

---

### Option 2: Cloud Platform (Recommended for Scale)
**Cost**: ~฿2,000-5,000/เดือน

#### 2.1 DigitalOcean
**Services**:
- App Platform (Frontend/Backend)
- Managed PostgreSQL
- Managed Redis
- Spaces (Object Storage)
- Load Balancer

**Cost Estimate**:
- App Platform: $12-25/month
- Managed PostgreSQL: $15-30/month
- Managed Redis: $15/month
- Spaces: $5/month
- **Total**: ~$50-75/month (฿1,750-2,625)

**Pros**:
- Easy scaling
- Managed services
- Good documentation
- Predictable pricing

---

#### 2.2 AWS
**Services**:
- EC2 (Compute)
- RDS PostgreSQL
- ElastiCache Redis
- S3 (Storage)
- CloudFront (CDN)
- Route 53 (DNS)

**Cost Estimate**:
- EC2: $20-50/month
- RDS: $30-60/month
- ElastiCache: $15/month
- S3: $5-10/month
- **Total**: ~$70-135/month (฿2,450-4,725)

**Pros**:
- Enterprise-grade
- Global infrastructure
- Many services

**Cons**:
- Complex pricing
- Steeper learning curve

---

#### 2.3 Google Cloud Platform
**Services**:
- Cloud Run (Serverless)
- Cloud SQL PostgreSQL
- Memorystore Redis
- Cloud Storage
- Cloud CDN

**Cost Estimate**:
- Cloud Run: $20-40/month
- Cloud SQL: $30-60/month
- Memorystore: $15/month
- Cloud Storage: $5/month
- **Total**: ~$70-120/month (฿2,450-4,200)

---

#### 2.4 Vercel + Railway/Render
**Services**:
- Vercel (Frontend - Next.js)
- Railway/Render (Backend)
- Supabase (Database)
- Upstash (Redis)

**Cost Estimate**:
- Vercel: $20/month (Pro)
- Railway: $20-40/month
- Supabase: $25/month
- Upstash: $10/month
- **Total**: ~$75-95/month (฿2,625-3,325)

**Pros**:
- Optimized for Next.js
- Easy deployment
- Good developer experience

---

## 📊 Infrastructure Comparison

| Provider | Monthly Cost | Scalability | Ease of Use | Recommendation |
|----------|-------------|-------------|-------------|----------------|
| **VPS + Docker** | ฿500-1,000 | ⭐⭐ | ⭐⭐⭐ | MVP |
| **DigitalOcean** | ฿1,750-2,625 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Recommended |
| **AWS** | ฿2,450-4,725 | ⭐⭐⭐⭐⭐ | ⭐⭐ | Enterprise |
| **GCP** | ฿2,450-4,200 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | Enterprise |
| **Vercel + Railway** | ฿2,625-3,325 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Next.js Optimized |

---

## 🚀 Recommended Setup (Phase 1 - MVP)

### Current Setup (Keep for MVP):
- **VPS**: Continue using current VPS
- **Docker Compose**: Keep current setup
- **Nginx**: Keep reverse proxy
- **Backup**: Setup automated backups

### Improvements for MVP:
1. **Automated Backups**:
   - Daily database backups
   - Weekly full system backups
   - Backup retention: 30 days

2. **Monitoring**:
   - Uptime monitoring (UptimeRobot)
   - Basic logging
   - Error tracking (Sentry)

3. **SSL/TLS**:
   - Keep Certbot
   - Auto-renewal

---

## 📈 Migration Plan (Phase 2+)

### When to Migrate:
- **User Count**: > 1,000 active users
- **Traffic**: > 100,000 requests/day
- **Revenue**: > ฿50,000/month

### Migration Steps:
1. **Choose Cloud Provider**: DigitalOcean (recommended)
2. **Setup Staging Environment**: Test migration
3. **Migrate Database**: PostgreSQL dump/restore
4. **Migrate Files**: Upload to cloud storage
5. **Deploy Services**: Deploy to cloud
6. **DNS Migration**: Update DNS records
7. **Monitor**: Watch for issues
8. **Rollback Plan**: Keep old VPS for 1 week

---

## 🔒 Security Considerations

### Current:
- ✅ HTTPS/SSL
- ✅ Firewall rules
- ✅ Docker isolation
- ⚠️ Need: Regular security updates

### Recommended:
- **WAF**: Cloudflare (free tier)
- **DDoS Protection**: Cloudflare
- **Backup Encryption**: Encrypt backups
- **Access Control**: SSH keys only
- **Regular Updates**: Automated security updates

---

## 💾 Backup Strategy

### Database Backups:
- **Frequency**: Daily
- **Retention**: 30 days
- **Location**: Local + Cloud (S3/Spaces)
- **Format**: PostgreSQL dump

### File Backups:
- **Frequency**: Daily
- **Retention**: 30 days
- **Location**: Cloud storage
- **Format**: Compressed archive

### Backup Automation:
```bash
# Daily database backup
0 2 * * * pg_dump -U admin namecard_platform > /backups/db_$(date +\%Y\%m\%d).sql

# Weekly full backup
0 3 * * 0 tar -czf /backups/full_$(date +\%Y\%m\%d).tar.gz /app/uploads /backups/db_*.sql
```

---

## 📊 Monitoring & Logging

### Monitoring Tools:
- **Uptime**: UptimeRobot (free)
- **Performance**: New Relic / Datadog (paid)
- **Errors**: Sentry (free tier available)
- **Logs**: Winston (application) + system logs

### Key Metrics:
- **Uptime**: > 99.5%
- **Response Time**: < 500ms (p95)
- **Error Rate**: < 0.1%
- **CPU Usage**: < 70%
- **Memory Usage**: < 80%
- **Disk Usage**: < 80%

---

## 🔄 CI/CD Pipeline

### Current:
- ⚠️ Manual deployment

### Recommended (GitHub Actions):
```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to server
        run: |
          ssh user@server "cd /app && git pull && docker-compose up -d --build"
```

---

## 💰 Cost Breakdown (MVP)

### Current VPS Setup:
- **VPS**: ฿500-1,000/เดือน
- **Domain**: ฿300/ปี (~฿25/เดือน)
- **SSL**: ฟรี (Let's Encrypt)
- **Total**: ~฿525-1,025/เดือน

### Cloud Setup (Phase 2):
- **DigitalOcean**: ฿1,750-2,625/เดือน
- **Domain**: ฿300/ปี (~฿25/เดือน)
- **Monitoring**: ฿0-500/เดือน
- **Total**: ~฿1,775-3,150/เดือน

---

## 📝 Implementation Checklist

### MVP (Current):
- [x] VPS setup
- [x] Docker Compose
- [x] Nginx reverse proxy
- [x] SSL/TLS
- [ ] Automated backups
- [ ] Basic monitoring
- [ ] Error tracking

### Phase 2 (Scale):
- [ ] Choose cloud provider
- [ ] Setup staging environment
- [ ] Migrate to cloud
- [ ] Setup advanced monitoring
- [ ] Setup CI/CD
- [ ] Load balancing
- [ ] CDN setup

---

## 🎯 Recommendations

### For MVP (Now):
1. ✅ Keep current VPS setup
2. ⚠️ Add automated backups
3. ⚠️ Add basic monitoring
4. ⚠️ Add error tracking

### For Phase 2 (Scale):
1. Migrate to DigitalOcean (recommended)
2. Use managed services (PostgreSQL, Redis)
3. Setup CI/CD pipeline
4. Add CDN (Cloudflare)
5. Setup advanced monitoring

---

**Status**: ✅ Completed
**Date**: 2026-03-05
**Next**: Week 2.5 - AI Integration Plan
