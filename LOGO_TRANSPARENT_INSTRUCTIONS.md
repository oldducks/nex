# คำแนะนำการทำให้โลโก้มีพื้นหลังใส

## สถานะปัจจุบัน
โลโก้ปัจจุบัน (`nex-logo-current.png`) ยังไม่มีพื้นหลังใส (RGB format)

## วิธีทำให้โลโก้มีพื้นหลังใส

### วิธีที่ 1: ใช้เครื่องมือออนไลน์ (แนะนำ - ง่ายที่สุด)
1. ไปที่ https://www.remove.bg/ หรือ https://photopea.com/
2. อัปโหลดไฟล์ `frontend/public/nex-logo-current.png`
3. ดาวน์โหลดไฟล์ที่พื้นหลังใสแล้ว
4. บันทึกเป็น `frontend/public/nex-logo-current-transparent.png`

### วิธีที่ 2: ใช้ ImageMagick (ถ้ามีติดตั้ง)
```bash
cd "/root/nex namecard"
./make-logo-transparent.sh
```

### วิธีที่ 3: ใช้ Python + Pillow
```bash
cd "/root/nex namecard"
pip install Pillow
python3 make_logo_transparent.py
```

## หลังจากสร้างไฟล์แล้ว
โค้ดจะใช้ไฟล์ `nex-logo-current-transparent.png` อัตโนมัติ และมี fallback ไปยังไฟล์เดิมถ้าไฟล์ใหม่ไม่มี

## ตรวจสอบผลลัพธ์
หลังจาก rebuild Docker container แล้ว ตรวจสอบที่:
- https://nexsolution.cloud/

โลโก้ควรมีพื้นหลังใสและดูดีขึ้นบนพื้นหลังเข้ม
