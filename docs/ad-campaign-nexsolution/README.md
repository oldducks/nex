# NEX Solution Ad Campaign

ชุดภาพโฆษณา NEX Solution แบบ 16:9 อ้างอิงสไตล์จากตัวอย่างที่ให้มา:
พื้นหลัง dark tech, headline ใหญ่, feature bullets, product screenshot และ CTA ชัดเจน

## Output

| File | Language | Size |
|---|---|---|
| `output/nexsolution-ad-th-16x9.jpg` | Thai | 1920x1080 |
| `output/nexsolution-ad-en-16x9.jpg` | English | 1920x1080 |
| `output/thai/nexsolution-ad-thai.jpg` | Thai separated file | 1920x1080 |
| `output/english/nexsolution-ad-english.jpg` | English separated file | 1920x1080 |

## Source

- `source-screenshots/` เก็บ screenshot ที่ดึงจาก Google Drive folder
- `create_ads.py` ใช้ regenerate ภาพใหม่ได้

## Regenerate

```bash
python3 docs/ad-campaign-nexsolution/create_ads.py
```

## Main Copy

Thai:

- Headline: NEX Solution
- Subhead: เครื่องมือดิจิทัลครบในที่เดียว
- CTA: เริ่มใช้ฟรี • nexsolution.cloud

English:

- Headline: NEX Solution
- Subhead: All-in-one digital toolkit
- CTA: Start free • nexsolution.cloud
