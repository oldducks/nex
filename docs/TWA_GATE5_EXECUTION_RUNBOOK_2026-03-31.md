# TWA Gate 5 Execution Runbook (While Waiting for Google Verification)

Date: 2026-03-31 (UTC)  
Project: `nexsolution.cloud` -> Android app (`cloud.nexsolution.app`)  
Scope lock: single-origin only (`nexsolution.cloud`), no rewrite, no strategy change

## 1) Current Blocker
- External blocker only:
  - Google Play Developer account identity verification is pending.
  - Contact phone verification and Internal testing publish are blocked until Google clears account verification.

## 2) Immediate Sequence Once Google Verification Passes
1. Verify contact phone number in Play Console.
2. Upload AAB from:
   - `/root/twa-test/app-release-bundle.aab`
3. Create Internal testing release.
4. Add internal testers and publish Internal track.
5. Run smoke test matrix on Android:
   - login
   - `manage/profile`
   - `manage/catalogs/[id]`
   - `manage/landing-pages`
   - `manage/qr`
6. Collect exit evidence and close Gate 5.

## 3) Verified Build Artifacts Snapshot
- Bubblewrap workspace:
  - `/root/twa-test`
- Current artifacts:
  - `/root/twa-test/app-release-bundle.aab`
  - `/root/twa-test/app-release-signed.apk`
  - `/root/twa-test/twa-manifest.json`

## 4) Parallel Work Allowed While Waiting (Path 2)
### A. Play Listing Content Cleanup
- Confirm title, short description, full description are final and consistent.
- Confirm privacy policy URL used in listing:
  - `https://nexsolution.cloud/privacy`

### B. Screenshot Preparation Pack
- Capture target set:
  - login/home
  - profile management
  - catalog detail
  - landing page management
  - QR management
- Capture policy:
  - no browser URL bar in shots
  - no personal customer data
  - no clipped UI controls

### C. Data Safety Final Confirmation
- Re-validate drafted responses with backend/privacy owner before submission.
- Keep conservative mapping unless a stronger legal/data basis is provided.

## 5) Done in This Round
- Prepared execution runbook for Gate 5 transition.
- Confirmed release artifacts exist in `/root/twa-test`.
- Kept scope/signing/package/origin unchanged.

## 6) Not Done Yet (Blocked by Google)
- Contact phone verification in Play Console.
- Internal testing release publication.
- Internal testing evidence collection and Gate 5 close.
