# NEX Agent Implementation Protocol v2

## 1) Purpose
This protocol defines how agents must implement NEX web work safely, consistently, and in a way that supports mobile-first migration without disrupting the live system.

This protocol exists to prevent:
- direct edits to live pages
- design drift from NEX standards
- unintended cross-page changes
- confusion between global standards and page-specific approved decisions
- silent reversion of owner-approved UI adjustments

---

## 2) Core Operating Principles
All implementation work must follow these principles:

1. Mobile-first is mandatory.
2. Work is page-by-page only.
3. The live route must remain untouched during testing.
4. New implementation must be created on a separate route first.
5. Approved page-specific decisions override global standards for that page.
6. Agents must not expand scope on their own.
7. Standards guide implementation, but must not erase approved real-world page decisions.

---

## 3) Mandatory Reading Order
Before starting any implementation, the agent must read in this order:

1. `NEX_MASTER_STANDARD_INDEX.md`
2. NEX UX/UI Standard
3. Brand Guideline
4. Color System
5. UI Rules
6. Tailwind Tokens
7. `NEX_MOBILE_WEB_STANDARD_v1.md`
8. `NEX_PAGE_TYPE_STANDARD_v1.md`
9. `NEX_COMPONENT_STANDARD_v1.md`
10. `NEX_CONTENT_DENSITY_STANDARD_v1.md`
11. `NEX_MOBILE_QA_CHECKLIST_v1.md`
12. Relevant page-specific brief
13. Relevant approved page decision log entries

If a page-specific brief or decision log exists, it must be read before implementation begins.

---

## 4) Authority Order
If documents conflict, the agent must follow this authority order:

1. Explicit owner instruction in the current task
2. Approved page-specific brief for the target page
3. Approved page-specific decision log for the target page
4. `NEX_AGENT_IMPLEMENTATION_PROTOCOL_v2.md`
5. `NEX_PAGE_TYPE_STANDARD_v1.md`
6. NEX UX/UI Standard
7. `NEX_COMPONENT_STANDARD_v1.md`
8. Color System / Tailwind Tokens / Brand Guideline / UI Rules
9. Archive or deprecated documents

Important:
- Page-specific approved decisions take priority over global standards for that page.
- Archive documents must never be used as primary implementation guidance.

---

## 5) Scope Control: Page-by-Page Only
All implementation work must be limited to the page explicitly requested.

The agent must assume:
- only the requested page is in scope
- all other pages are out of scope unless explicitly included
- a new standard does not automatically authorize full-site refactoring
- no cross-page cleanup is allowed unless explicitly requested

### In Scope
- the target page named in the task
- the new test route for that page
- directly related UI within that page
- page-specific mobile-first improvements for that page

### Out of Scope
- other pages not named in the task
- system-wide redesign
- global navigation rewrite unless explicitly included
- auth, backend, database, or business logic changes unless explicitly approved
- replacing old routes without approval

---

## 6) Existing Live System Protection
Agents must not directly modify the current live page during implementation.

Non-negotiable rules:
- do not overwrite the current live route
- do not remove the existing page during experimentation
- do not deploy replacement behavior to the old route before approval
- do not change business logic unless explicitly approved
- do not introduce breaking changes to active users

The live system must remain stable while new versions are tested separately.

---

## 7) New Route First Strategy
All new implementations must be built on a separate route first.

The default approach is:
- existing page remains unchanged
- new implementation is built on a test or preview route
- QA is performed on the new route
- replacement is proposed only after approval

### Example Route Pattern
- old route: `/manage/control`
- test route: `/manage/control-v2`
- preview route: `/preview/control-mobile`

The agent must not assume route replacement is allowed unless explicitly approved.

---

## 8) Page-Specific Override Rule
If the owner has already adjusted a page manually and that adjustment is approved, the agent must not revert it just because the global standard says something else.

The agent must:
- check whether a page brief exists
- check whether a decision log entry exists
- preserve approved page-specific decisions
- treat those decisions as approved exceptions for that page

The agent must not:
- silently revert owner-approved changes
- force the page back to a generic standard layout
- assume the current implementation is wrong without checking page-specific documents

---

## 9) What to Do When the Built Page and MD Do Not Match
If the actual page and the global MD standards do not fully match, the agent must not immediately "correct" the page.

The agent must follow this process:
1. Check whether a page brief exists.
2. Check whether a decision log entry exists.
3. If approved documentation exists, follow the page-specific decision.
4. If no approved documentation exists, treat it as an implementation discrepancy.
5. Flag the discrepancy clearly instead of reverting automatically.

Default rule:
- no auto-revert
- no silent normalization
- no assumption that the MD is always more current than the approved page state

---

## 10) Mobile-First Requirement
All implementation must begin from mobile logic first.

The agent must:
- design for mobile viewport first
- establish a clear first-screen purpose
- use single-column flow by default
- prioritize vertical decision flow
- ensure readable spacing and tappable controls
- scale up to tablet and desktop only after mobile structure is correct

The agent must not:
- design desktop first and then compress it down
- keep dense multi-column logic on small screens by default
- use interaction patterns that require pinch-zoom or precision tapping

---

## 11) Standard Compliance Rules
The agent must follow NEX standards unless there is an approved page-specific exception.

The agent must:
- use approved color roles and tokens
- preserve CTA hierarchy
- preserve page-type logic
- preserve component consistency
- respect content density limits
- keep the page aligned with NEX brand direction

The agent must not:
- invent new colors
- hard-code visual styles outside the system without approval
- redesign beyond the task scope
- rewrite business copy unless instructed

---

## 12) Required Implementation Flow
For every page task, follow this exact sequence:

1. Confirm target page and route.
2. Confirm that work is limited to the requested page only.
3. Read standards in the required order.
4. Read page-specific brief and decision log if available.
5. Identify page type.
6. Summarize page purpose.
7. Summarize mobile-first plan.
8. Define in-scope and out-of-scope boundaries.
9. Build the new page on a separate route.
10. Self-check using the mobile QA checklist.
11. Report conflicts, exceptions, and unresolved issues.
12. Present the result for review.
13. Only after approval, propose replacement of the old route.

---

## 13) Required Task Input Format
Each implementation request should define as many of the following as possible:

- existing route
- new test or preview route
- page type
- primary goal of the page
- primary CTA
- target users
- constraints
- what must not be changed
- whether page-specific decisions already exist

If some of these are not provided, the agent must still remain within page-by-page scope and must not expand the task.

---

## 14) Required Delivery Format
When submitting work, the agent should report:

1. Target page
2. Existing route
3. New route created
4. Page type implemented
5. Mobile-first logic used
6. Standards followed
7. Page-specific decisions followed
8. In-scope items completed
9. Out-of-scope items intentionally left unchanged
10. QA status
11. What still needs approval before replacement

---

## 15) Self-QA Before Submission
Before presenting work, the agent must check:

- page type alignment
- correct token usage
- CTA hierarchy
- mobile readability
- mobile tap usability
- form usability if applicable
- visual hierarchy
- density and clutter
- no direct impact on old route
- no unintended cross-page change
- no silent revert of approved page decisions

---

## 16) Approval Gate for Replacement
No old route may be replaced unless all of the following are true:

- the new route has been reviewed
- the new route passes QA
- page-specific conflicts are resolved or recorded
- the owner explicitly approves replacement

Until then:
- the old route stays in place
- the new route remains the testing/preview implementation

---

## 17) Prohibited Behaviors
The following are prohibited unless explicitly approved:

- editing the live route directly
- changing multiple pages when only one page was requested
- rewriting content beyond scope
- introducing new visual systems outside NEX standards
- silently reverting owner edits
- assuming global standards are always newer than page-specific approved decisions
- replacing the old route without approval

---

## 18) Short Operating Summary
The NEX agent must work like this:

- read the standards first
- work only on the page that was requested
- build the new version on a new route first
- follow mobile-first logic from the start
- respect page-specific approved decisions
- never touch the live route without approval
- never expand scope on its own
- QA before replacement
