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

## Current Status (Production Verified, 2026-03-31)
- Gate 0: **PASS**
- Gate 1: **PASS**
- Gate 2: **PASS**
- Production Check:
  - `https://nexsolution.cloud/manifest.webmanifest` -> `200`
  - `https://nexsolution.cloud/sw.js` -> `200`
  - `https://nexsolution.cloud/.well-known/assetlinks.json` -> `200`
  - `https://nexsolution.cloud/icons/icon-192.png` -> `200`
  - `https://nexsolution.cloud/icons/icon-512.png` -> `200`

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
- [ ] `PASS` Verification behavior tested on device
  - Evidence: Pending on-device verification check
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
- [ ] `PASS/FAIL` Critical flows audited on mobile: login, form submit, dashboard, table usage, logout
  - Evidence:
  - Acceptance: Audit report complete with severity
- [ ] `PASS/FAIL` Form usability acceptable (field focus, keyboard overlap, validation clarity)
  - Evidence:
  - Acceptance: No High-priority blockers
- [ ] `PASS/FAIL` Dashboard/table responsive at target viewport(s)
  - Evidence:
  - Acceptance: No broken layout or blocked actions
- [ ] `PASS/FAIL` Loading states are clear and bounded
  - Evidence:
  - Acceptance: No indefinite spinner for core flows
- [ ] `PASS/FAIL` Error states actionable and readable
  - Evidence:
  - Acceptance: User can recover from common failure states
- [ ] `PASS/FAIL` Navigation/back behavior consistent with app expectations
  - Evidence:
  - Acceptance: No dead-end or confusing back-stack behavior

### Optional
- [ ] `PASS/FAIL/N/A` Accessibility spot-check (touch target size, contrast, labels)

Gate 3 Decision: `GO / NO-GO`  
Decision Owner:  
Date:

---

## Gate 4: Bubblewrap Build & Test Readiness
### Must-have
- [ ] `PASS/FAIL` Environment readiness confirmed (Node, JDK, Android SDK/Build Tools)
  - Evidence:
  - Acceptance: Toolchain versions documented and working
- [ ] `PASS/FAIL` Bubblewrap init inputs finalized from production manifest
  - Evidence:
  - Acceptance: Manifest and metadata freeze for build
- [ ] `PASS/FAIL` Build runbook approved (`init -> build -> install -> verify`)
  - Evidence:
  - Acceptance: Repeatable steps documented
- [ ] `PASS/FAIL` Internal testing plan approved (testers, scenarios, timeline, bug policy)
  - Evidence:
  - Acceptance: Written plan with owner and schedule

### Optional
- [ ] `PASS/FAIL/N/A` CI pipeline draft for automated `.aab` generation

Gate 4 Decision: `GO / NO-GO`  
Decision Owner:  
Date:

---

## Gate 5: Release Readiness (Internal -> Production)
### Must-have
- [ ] `PASS/FAIL` Internal test exit criteria met
  - Evidence:
  - Acceptance: No open High-severity release blockers
- [ ] `PASS/FAIL` Play Console release materials ready (listing, policy links, privacy/data safety)
  - Evidence:
  - Acceptance: Required store assets complete
- [ ] `PASS/FAIL` Rollout strategy approved (`staged rollout` with stop thresholds)
  - Evidence:
  - Acceptance: Clear % rollout plan and rollback trigger
- [ ] `PASS/FAIL` Monitoring and incident owner assigned
  - Evidence:
  - Acceptance: Named owner + KPI dashboard/log source

### Optional
- [ ] `PASS/FAIL/N/A` Post-release survey/feedback loop defined

Gate 5 Decision: `GO / NO-GO`  
Decision Owner:  
Date:

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

---

## Quick Summary Snapshot
| Gate | Status | Must-have Pass Count | Must-have Fail Count | Owner | Decision Date |
|---|---|---:|---:|---|---|
| Gate 0 | Pending | 0 | 0 |  |  |
| Gate 1 | Pending | 0 | 0 |  |  |
| Gate 2 | Pending | 0 | 0 |  |  |
| Gate 3 | Pending | 0 | 0 |  |  |
| Gate 4 | Pending | 0 | 0 |  |  |
| Gate 5 | Pending | 0 | 0 |  |  |
