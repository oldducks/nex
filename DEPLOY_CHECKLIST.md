# NEX Deploy Safety Checklist

ใช้เอกสารนี้ก่อน deploy ทุกครั้ง เพื่อลดความเสี่ยงหน้าพัง/asset หาย

## 1) Branch Safety
- ทำงานบน `feature/*` เท่านั้น
- ห้าม deploy ตรงจาก branch งาน
- เตรียม branch ปล่อยจริง: `release/prod-stable`
- ย้ายงานที่ต้องปล่อยด้วย `cherry-pick` เท่านั้น

## 2) Build Safety
- `frontend` ต้อง build ผ่าน
- `backend` ต้อง build ผ่าน (ถ้ามีการเปลี่ยน backend)

## 3) Critical Route Smoke Test
ต้องเปิดได้ทุกหน้าและไม่มี 4xx/5xx:
- `/`
- `/start`
- `/nex-control-your-future-preview`
- `/what-is-nex-preview`
- `/nex-digital-asset-partner-preview`
- `/enterprise-mos-preview`
- `/login`
- `/forgot-password`
- `/reset-password`

## 4) Critical Asset Check
ไฟล์สำคัญต้องมีใน `frontend/public`:
- `nex-control-your-future-preview/1.jpg`
- `nex-control-your-future-preview/preview-video.mp4`
- `what-is-nex-preview/1.jpg`
- `what-is-nex-preview/preview-video-v2.mp4`
- `nex-digital-asset-partner-preview/1.jpg`
- `nex-digital-asset-partner-preview/preview-video.mp4`
- `enterprise-mos-preview/1.jpg`
- `enterprise-mos-preview/preview-video.mp4`

## 5) Deploy Command
- `docker compose up -d --build api web`
- ตรวจสถานะหลังขึ้น: `docker compose ps`

## 6) Post Deploy Verify
- Hard refresh และทดสอบหน้า critical อีก 1 รอบ
- เปิด DevTools และเช็กว่าไม่มี `404` ของรูป/วิดีโอหลัก

## 7) Tag Stable Point
- ถ้าผ่านทั้งหมด ให้ติด tag ทันที:
- `git tag -a prod-YYYYMMDD-N -m "stable release"`
- `git push origin prod-YYYYMMDD-N`

## 8) Hotfix Rule
- งานด่วนให้แตก branch `hotfix/*`
- แก้เฉพาะจุด
- หลังปล่อย ให้ merge/cherry-pick กลับทุก branch ที่เกี่ยวข้อง

## Recommended Quick Run
- ใช้สคริปต์ตรวจอัตโนมัติ:
- `bash scripts/predeploy-critical-check.sh`
