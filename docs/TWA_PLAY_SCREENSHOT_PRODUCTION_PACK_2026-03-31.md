# TWA Play Screenshot Production Pack

Date: 2026-03-31 (UTC)  
Project: `nexsolution.cloud` -> Android TWA (`cloud.nexsolution.app`)

## 1) Purpose
- Prepare Play Console screenshots so they can be uploaded immediately when account verification is cleared.
- Keep screenshot scope aligned with TWA v1 (single-origin `nexsolution.cloud` only).

## 2) Capture Rules (Must Follow)
- Use current TWA Android build (verified fullscreen mode).
- No browser URL bar visible.
- No real customer/private personal data.
- Avoid broken responsive states where action is blocked.
- Keep text readable at Play screenshot size.

## 3) Required Screenshot Set (Primary 5)
1. Login / home entry  
   - Route: `/login` or entry screen after app open  
   - Must show: clear sign-in/start flow
2. Profile management  
   - Route: `/manage/profile`  
   - Must show: editable profile controls
3. Catalog management  
   - Route: `/manage/catalogs/[id]`  
   - Must show: product/catalog management actions
4. Landing page management  
   - Route: `/manage/landing-pages`  
   - Must show: list/manage capability
5. QR management  
   - Route: `/manage/qr`  
   - Must show: QR workflow context

Optional 6th:
- Public-facing output
  - Route: `/[prefix]/[uid]` or equivalent clean public result

## 4) Capture Tracking Table
| # | Screen | Route | Status | File Name (proposed) | Notes |
|---|---|---|---|---|---|
| 1 | Login/Home | `/login` | Pending | `01-login-home.png` | |
| 2 | Profile | `/manage/profile` | Pending | `02-manage-profile.png` | |
| 3 | Catalog | `/manage/catalogs/[id]` | Pending | `03-manage-catalog.png` | |
| 4 | Landing Pages | `/manage/landing-pages` | Pending | `04-manage-landing-pages.png` | |
| 5 | QR | `/manage/qr` | Pending | `05-manage-qr.png` | |
| 6 | Public Output (optional) | `/[prefix]/[uid]` | Optional | `06-public-output.png` | |

## 5) Suggested Local Output Folder
- Store finalized files at:
  - `/root/twa-test/play-assets/screenshots/`

## 6) Upload Readiness Checklist
- [ ] 5 primary screenshots captured
- [ ] all screenshots reviewed against capture rules
- [ ] file names normalized and ordered
- [ ] final set approved by Project Owner
- [ ] files uploaded in Play Console listing

## 7) Notes
- This pack is preparation-only and does not change TWA architecture.
- It is intended to reduce Gate 5 execution time once Google verification clears.
