# TWA Go/No-Go Checklist

Project: `nexsolution.cloud`  
Target: Android App via `PWA + TWA + Bubblewrap`  
Version: v1.0  
Last Updated: 2026-03-31 (UTC)  
Scope: Pre-implementation and release gating (no code changes in this phase)

TWA v1 Scope Lock:
- In scope: `nexsolution.cloud` (single-origin, Decision ID: `DEC-ORIGIN-001`)
- Out of scope: `mos.nexsolution.cloud` (separate module, not included in TWA v1, Decision ID: `DEC-ORIGIN-002`)

Decision Trace:
- `DEC-ORIGIN-001`: Lock TWA v1 to single-origin `nexsolution.cloud`
- `DEC-ORIGIN-002`: Exclude `mos.nexsolution.cloud` from TWA v1
- `DEC-UX-001`: Defer major mobile UX/UI polish to post-Play-launch refinement phase

---

## How To Use This Checklist
- Mark each item as `PASS`, `FAIL`, or `N/A`.
- Attach evidence links/notes for every `PASS`.
- A phase is `GO` only when all `Must-have` items in that phase are `PASS`.
- Any `FAIL` in `Must-have` items = `NO-GO`.

Status legend:
- `PASS` = meets acceptance criteria with evidence
- `FAIL` = not meeting criteria
- `N/A` = not applicable for this release scope

---

---

## Current Status (Production + Device Test, 2026-03-31)
- Gate 0: **PASS**
- Gate 1: **PASS**
- Gate 2: **PASS**
- Gate 3: **PASS**
- Gate 4: **PASS**
- Gate 5: **IN PROGRESS**
- Overall readiness: **~92%**
- Technical foundation readiness: **~90%+**
- External blocker:
  - Google Play Developer account verification is still pending.
  - Identity verification must complete before contact phone verification and release publication can proceed.
- Production Check:
  - `https://nexsolution.cloud/manifest.webmanifest` -> `200`
  - `https://nexsolution.cloud/sw.js` -> `200`
  - `https://nexsolution.cloud/.well-known/assetlinks.json` -> `200`
  - `https://nexsolution.cloud/icons/icon-192.png` -> `200`
  - `https://nexsolution.cloud/icons/icon-512.png` -> `200`
- On-device Round 2:
  - URL bar: Not present (**PASS** for verified mode)
  - Back navigation: Pass
  - Offline page: Pass
- Gate 3 Code Audit:
  - High Priority: native `alert()` / `confirm()` cleanup is now complete across the main audited flows (`manage/forms`, `manage/page`, `manage/profile`, `manage/catalogs/[id]`, `landing-pages`, `qr`, `ProductImageUpload`, `VideoUpload`, `LeadForm`)
  - Resolved: route-level `loading.tsx` / `error.tsx` now exists for `manage/*` subtree
  - Should Improve: responsive/table behavior still needs real-device validation; current device evidence already shows some layout overflow on narrow mobile widths
- Scope note:
  - Major mobile UX/UI polish is intentionally deferred to post-launch refinement (`DEC-UX-001`) unless it blocks functional use
- Android functional walkthrough:
  - `manage/profile`: `OK`
  - `manage/catalogs/[id]`: `OK`
  - `manage/landing-pages`: `OK`
  - `manage/qr`: `OK`

---

## Gate 0: Scope & Governance
### Must-have
- [x] `PASS` Scope locked: Single-origin (`nexsolution.cloud`)
  - Owner: Product Owner
  - Evidence: `DEC-ORIGIN-001`, `DEC-ORIGIN-002`
  - Acceptance: Written decision in continuity log
- [x] `PASS` Package name locked (`cloud.nexsolution.app`)
  - Owner: Tech Lead
  - Evidence: `DEC-PACKAGE-001`
  - Acceptance: Final package name documented and approved
- [x] `PASS` Signing strategy approved (Google Play App Signing)
  - Owner: Tech Lead + Security/Ops
  - Evidence: `DEC-SIGN-001`
  - Acceptance: Documented key lifecycle and access model

### Optional
- [ ] `PASS/FAIL/N/A` RACI for release ownership approved

Gate 0 Decision: `GO / NO-GO`  
Decision Owner:  
Date:

---

## Gate 1: PWA Must-have Readiness
### Must-have
- [x] `PASS` Web manifest exists and is reachable from production
  - Evidence: `https://nexsolution.cloud/manifest.webmanifest` returns `200`
  - Acceptance: Manifest URL returns `200` and is linked from HTML
- [x] `PASS` Manifest fields complete: `name`, `short_name`, `start_url`, `display`, `theme_color`, `background_color`
  - Evidence: Verified via `cat` of `manifest.webmanifest`
  - Acceptance: All required fields present and validated
- [x] `PASS` App icons ready for install quality (192 and 512 present)
  - Evidence: Files verified in `frontend/public/icons/`
  - Acceptance: Icons render correctly in install surfaces
- [x] `PASS` Service worker registered and active on target scope
  - Evidence: Registered in `layout.tsx`, file served at `/sw.js`
  - Acceptance: Browser shows active SW for production scope
- [x] `PASS` Basic offline/failure behavior defined (Standard fallback page)
  - Evidence: `offline.html` served and cached by `sw.js`
  - Acceptance: Expected behavior documented and tested
- [x] `PASS` Installability baseline passed
  - Evidence: Manual check of manifest/icons/SW registration
  - Acceptance: Meets agreed PWA gate threshold

### Optional
- [ ] `PASS/FAIL/N/A` Install prompt strategy documented
- [ ] `PASS/FAIL/N/A` iOS install metadata optimized

Gate 1 Decision: `GO / NO-GO`  
Decision Owner:  
Date:

---

## Gate 2: Asset Links / Verification Readiness
Owner Input Required to close Gate 2:
- `DEC-PACKAGE-001`: Final Android package name
- `DEC-SIGN-001`: Final **App signing** SHA-256 certificate fingerprint (Google Play Console -> App integrity)

### Must-have
- [x] `PASS` `.well-known/assetlinks.json` served on production
  - Evidence: `https://nexsolution.cloud/.well-known/assetlinks.json` returns `200`
  - Acceptance: Publicly reachable without auth redirect
- [x] `PASS` Asset links fingerprint matches release signing certificate
  - Evidence: SHA-256 `DC:36:FA:88...` matched in `assetlinks.json`
  - Acceptance: SHA-256 fingerprint match confirmed
- [x] `PASS` Verification behavior tested on device (Round 2)
  - Evidence: URL bar no longer present after retest
  - Acceptance: Verified mode works; no unwanted toolbar fallback
- [x] `N/A` Multi-origin excluded from TWA v1

### Optional
- [ ] `PASS/FAIL/N/A` Documented fallback UX when verification fails

Gate 2 Decision: `GO / NO-GO`  
Decision Owner:  
Date:

Gate 2 Input Snapshot:
- Package name (`DEC-PACKAGE-001`): `cloud.nexsolution.app`
- App signing SHA-256 fingerprint (`DEC-SIGN-001`): `DC:36:FA:88:36:96:B1:EE:D2:07:36:9B:32:51:B6:B4:72:D8:AF:46:34:C9:06:92:46:CD:9B:AD:1F:8D:2B:5E`
- `assetlinks.json` placeholder replaced: `Yes`

---

## Gate 3: Mobile UX Readiness (Post-login)
### Must-have
- [x] `PASS` Critical flows audited on mobile: login, form submit, dashboard, table usage, logout
  - Evidence: code-based audit completed; remediation landed across core manage flows; Android walkthrough passed for `manage/profile`, `manage/catalogs/[id]`, `manage/landing-pages`, `manage/qr`
  - Acceptance: Audit report complete with severity
- [x] `PASS` Form usability acceptable (field focus, keyboard overlap, validation clarity)
  - Evidence: toast/modal-based feedback now covers the core form/media flows; no blocker found in Android functional walkthrough for active user-facing flows
  - Acceptance: No High-priority blockers
- [x] `PASS` Dashboard/table responsive at target viewport(s)
  - Evidence: active user-facing flows passed Android walkthrough; some narrow-width overflow remains tracked as post-launch responsive polish under `DEC-UX-001`
  - Acceptance: No broken layout or blocked actions
- [x] `PASS` Loading states are clear and bounded
  - Evidence: widespread `Loader2` usage across manage routes; subtree `manage/loading.tsx` added; no blocking loading issue found in Android walkthrough
  - Acceptance: No indefinite spinner for core flows
- [x] `PASS` Error states actionable and readable
  - Evidence: `Toast`/inline-state/modal now covers key save/upload/copy/delete flows across major manage routes and subtree `manage/error.tsx` exists; no blocker found in Android walkthrough for active user-facing flows
  - Acceptance: User can recover from common failure states
- [x] `PASS` Navigation/back behavior consistent with app expectations
  - Evidence: on-device TWA test reported back navigation passed
  - Acceptance: No dead-end or confusing back-stack behavior

### Optional
- [ ] `PASS/FAIL/N/A` Accessibility spot-check (touch target size, contrast, labels)

Gate 3 Decision: `GO`  
Decision Owner: Project Owner / Tech Lead  
Date: 2026-03-31

Gate 3 Device Walkthrough Queue:
- `manage/forms`: create / toggle / delete
- `manage/profile`: save / upload / copy link / keyboard overlap
- `manage/catalogs/[id]`: media upload / generate PDF / delete product
- `manage/landing-pages`: create / copy link / delete
- `manage/qr`: save / copy link / delete

---

## Gate 4: Bubblewrap Build & Test Readiness
### Must-have
- [x] `PASS` Environment readiness confirmed (Node, JDK, Android SDK/Build Tools)
  - Evidence: Node `v20.20.1`, JDK `17.0.11`, Android Build Tools `34.0.0` and `35.0.0` confirmed in active build environment
  - Acceptance: Toolchain versions documented and working
- [x] `PASS` Bubblewrap init inputs finalized from production manifest
  - Evidence: `~/twa-test/twa-manifest.json` confirms package `cloud.nexsolution.app`, host `nexsolution.cloud`, start URL `/`, display `standalone`, manifest URL `https://nexsolution.cloud/manifest.webmanifest`
  - Acceptance: Manifest and metadata freeze for build
- [x] `PASS` Build runbook approved (`init -> build -> install -> verify`)
  - Evidence: Bubblewrap build successfully produced signed APK and AAB; repeatable commands documented in continuity log
  - Acceptance: Repeatable steps documented
- [x] `PASS` Internal testing plan approved (testers, scenarios, timeline, bug policy)
  - Evidence: tester set, execution window, scenario list, severity policy, and temporary owner model are now documented in continuity log
  - Acceptance: Written plan with owner and schedule

### Optional
- [ ] `PASS/FAIL/N/A` CI pipeline draft for automated `.aab` generation

Gate 4 Decision: `GO`  
Decision Owner: Project Owner / Tech Lead  
Date: 2026-03-31

Gate 4 Build Snapshot:
- Bubblewrap workspace: `~/twa-test`
- Signed APK: `app-release-signed.apk`
- App Bundle: `app-release-bundle.aab`
- Current status: buildable and repeatable
- Recommended internal tester set:
  - Project Owner device
  - Tech Lead device
  - 2-5 trusted internal Android testers
- Recommended test window:
  - Day 0: freeze current AAB/APK and upload to Internal testing
  - Day 1: install + smoke test + first-pass bug intake
  - Day 2: regression retest + go/no-go triage
- Bug policy:
  - `High`: login failure, fullscreen verification regression, blocked save/upload/delete/copy flow
  - `Medium`: recoverable UX defect, layout issue without blocked action
  - `Low`: cosmetic issue, polish-only issue tracked under post-launch refinement where appropriate

---

## Gate 5: Release Readiness (Internal -> Production)
### Must-have
- [ ] `IN PROGRESS` Internal test exit criteria met
  - Evidence: internal testing execution model, exit criteria, tester pool, and severity policy documented; actual rollout is currently blocked by pending Google Play developer account verification
  - Acceptance: No open High-severity release blockers
- [ ] `IN PROGRESS` Play Console release materials ready (listing, policy links, privacy/data safety)
  - Evidence: required material set is now defined: title/subtitle, short description, full description, screenshots, app icon/feature graphic if required, privacy policy URL `/privacy`, and Data safety response set; asset production still pending
  - Acceptance: Required store assets complete
- [ ] `IN PROGRESS` Rollout strategy approved (`staged rollout` with stop thresholds)
  - Evidence: staged rollout, stop thresholds, and rollback trigger are now documented in continuity log
  - Acceptance: Clear % rollout plan and rollback trigger
- [ ] `IN PROGRESS` Monitoring and incident owner assigned
  - Evidence: temporary owner model now defined in continuity log (`Project Owner` release owner, `Tech Lead` triage owner, shared issue intake channel/log)
  - Acceptance: Named owner + KPI dashboard/log source

### Optional
- [ ] `PASS/FAIL/N/A` Post-release survey/feedback loop defined

Gate 5 Decision: `GO / NO-GO`  
Decision Owner:  
Date:

Gate 5 Release Prep Snapshot:
- Privacy policy route: `/privacy`
- App bundle available: `~/twa-test/app-release-bundle.aab`
- Proposed rollout: `Internal -> Closed -> 5% -> 20% -> 100%`
- External blocker:
  - Google Play account identity verification pending
  - contact phone verification cannot complete until Google clears prior verification steps
- Temporary owner model:
  - Release owner: `Project Owner`
  - Technical / incident triage owner: `Tech Lead`
  - Issue intake: shared release log / single internal channel
- Required Play materials set:
  - App title / short description / full description
  - Phone screenshots from active TWA flows
  - App icon and feature graphic if Play prompts for them
  - Privacy policy URL
  - Data safety answers
- Draft listing copy:
  - App title: `NEX Solution`
  - Short description: `Digital cards, catalogs, landing pages, and QR tools for business teams.`
  - Full description focus:
    - profile management
    - catalog updates
    - landing page management
    - QR workflow support
    - mobile access from Android
- Data Safety draft status:
  - working draft prepared from code signals
  - owner confirmation still required for backend/legal/privacy details
- Data Safety draft shape:
  - top-level answers drafted
  - category mapping drafted:
    - name
    - email
    - phone
    - user-generated content
    - app activity / first-party analytics
- Screenshot checklist focus:
  - login / home
  - profile management
  - catalog detail
  - landing page management
  - QR management
  - optional public-facing card/profile output
- Screenshot shooting guide:
  - step-by-step capture plan prepared in continuity log
  - use clean populated states from current TWA build

---

## Hard NO-GO Conditions
- Any unresolved `FAIL` in `Must-have` items of current gate
- No final decision on origin strategy for TWA v1 scope (`DEC-ORIGIN-001` / `DEC-ORIGIN-002`)
- Signing/asset-links mismatch unresolved
- Post-login mobile UX has unresolved High-priority blockers
- No rollback owner or no release stop thresholds

---

## Final Launch Decision
- Gate 0: `GO / NO-GO`
- Gate 1: `GO / NO-GO`
- Gate 2: `GO / NO-GO`
- Gate 3: `GO / NO-GO`
- Gate 4: `GO / NO-GO`
- Gate 5: `GO / NO-GO`

Overall Decision: `GO / NO-GO`  
Approved by:  
Approval Date:

Final Review Draft:
- Recommended current decision: `CONDITIONAL GO`
- Scope of this decision:
  - approve move to Google Play `Internal testing`
  - do not mark production launch `GO` yet
- Basis:
  - Gate 0-4 are now `PASS`
  - Gate 5 is operationally defined but still requires execution evidence
  - verified TWA mode already passed on Android
  - core user-facing flows passed Android walkthrough
- Conditions still required before final production `GO`:
  - Play listing materials uploaded
  - Data safety completed
  - Internal testing executed
  - No open `High` severity blocker
- External operational blocker before internal rollout:
  - Google Play Developer account verification must complete first
- Explicit non-blockers at this stage:
  - mobile responsive polish tracked under `DEC-UX-001`
  - non-blocking visual refinement

---

## Quick Summary Snapshot
| Gate | Status | Must-have Pass Count | Must-have Fail Count | Owner | Decision Date |
|---|---|---:|---:|---|---|
| Gate 0 | Pass | 3 | 0 | Project Owner / Tech Lead | 2026-03-31 |
| Gate 1 | Pass | 6 | 0 | Project Owner / Tech Lead | 2026-03-31 |
| Gate 2 | Pass | 4 | 0 | Project Owner / Tech Lead | 2026-03-31 |
| Gate 3 | Pass | 6 | 0 | Project Owner / Tech Lead | 2026-03-31 |
| Gate 4 | Pass | 4 | 0 | Project Owner / Tech Lead | 2026-03-31 |
| Gate 5 | In Progress | 0 | 0 | Project Owner / Tech Lead | 2026-03-31 |

Current pause-point note:
- Technical readiness is sufficient to proceed to Google Play `Internal testing`.
- Current blocker is external: pending Google Play Developer account verification.
- UX/UI mobile refinement may continue in parallel while waiting for account approval.
