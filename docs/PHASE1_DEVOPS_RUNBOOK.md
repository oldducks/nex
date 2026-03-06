# Phase 1 DevOps Runbook (Backup, Restore, CI/CD)

## Overview
เอกสารนี้เป็น runbook สำหรับงานสำรองข้อมูล, กู้คืนข้อมูล และ CI/CD baseline ใน Phase 1

## Scripts
- Backup script: `scripts/backup.sh`
- Restore script: `scripts/restore.sh`

## 1) Run Backup Manually

```bash
cd /root/nex\ namecard
./scripts/backup.sh
```

### Optional: Custom retention days

```bash
cd /root/nex\ namecard
RETENTION_DAYS=30 ./scripts/backup.sh
```

## 2) Backup Output Locations

- DB backups: `backups/db/*.sql`
- Upload backups: `backups/uploads/*.tar.gz`

## 3) Restore Database

```bash
cd /root/nex\ namecard
./scripts/restore.sh backups/db/namecard_platform_YYYY-MM-DD_HHMMSS.sql
```

## 4) Cron Schedule Recommendation

### Daily backup at 02:30

```bash
30 2 * * * cd /root/nex\ namecard && ./scripts/backup.sh >> /root/nex\ namecard/backups/backup.log 2>&1
```

### Verify cron

```bash
crontab -l
```

## 5) Safety Notes

- รัน restore เฉพาะตอน maintenance window
- ทดสอบ restore กับ staging ก่อน restore production
- เก็บ backup ไว้นอกเครื่อง (offsite) อย่างน้อย 1 ชุด
- ตรวจสอบขนาดไฟล์ backup ทุกวัน

## 6) CI/CD Baseline (GitHub Actions)

Workflow file:
- `.github/workflows/ci-cd.yml`

Pipeline behavior:
- On `pull_request` to `main`:
  - Backend checks: `npm ci` + `npm run lint` + `npm run build`
  - Backend tests: `npm run test --if-present`
  - Frontend checks: `npm ci` + `npm run lint` + `npm run build`
  - Frontend tests: `npm run test --if-present`
- On `push` to `main`:
  - Run all checks + tests above
  - Deploy job via SSH (auto, gated by all jobs)

Required GitHub Secrets:
- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`

Deploy command executed on server:
```bash
cd /root/nex\ namecard
git pull origin main
docker compose -f docker-compose.yml up -d --build web api
docker image prune -f
```

## 7) Quick Validation Checklist

- [ ] backup script run success
- [ ] SQL file generated
- [ ] uploads archive generated
- [ ] retention cleanup works
- [ ] restore command tested on staging
- [ ] CI workflow passes on PR
- [ ] test jobs pass on PR
- [ ] Deploy job works on push main

---
Updated by Codex on 2026-03-05
