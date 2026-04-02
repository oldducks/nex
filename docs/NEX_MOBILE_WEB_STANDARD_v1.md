# NEX Mobile Web Standard v1

## 1) Purpose
This document defines the mobile-first rules for all new NEX web pages.
It exists to ensure that new pages are designed for mobile users first, then expanded for tablet and desktop.

This standard must be used together with:
- NEX UX/UI Standard v2
- brand-guideline_v2
- color-system_v2
- ui-rules_v2
- tailwind-tokens_v2


## 1.1 Status and Authority
This document is an **active mobile-first implementation standard**.
Use it together with:
- `NEX_UX_UI_STANDARD_V2.md`
- `NEX_PAGE_TYPE_STANDARD_v1.md`
- `NEX_COMPONENT_STANDARD_v1.md`
- `NEX_CONTENT_DENSITY_STANDARD_v1.md`
- `NEX_MOBILE_QA_CHECKLIST_v1.md`

If this document conflicts with page-specific approved decisions, follow:
1. explicit owner instruction
2. approved page brief
3. approved page decision log
4. implementation protocol
5. this document

## 2) Core Principle
Mobile-first is mandatory.
Do not design desktop first and shrink it later.
Start from the smallest practical viewport, define information priority, then scale upward.

## 3) Scope
Applies to:
- Public marketing pages
- Gateway pages
- Product explainers
- Registration and form pages
- Dashboard/control pages
- Any newly built replacement page for existing routes

Does not authorize changes to existing production pages directly.
New implementations must be built on separate test routes first.

## 4) Default Mobile Layout Rules
### 4.1 Single-column first
- Use single-column layout as the default on mobile.
- Do not rely on side-by-side blocks for primary content.
- Any multi-column layout must collapse cleanly into vertical stacking.

### 4.2 Vertical reading flow
Each page must support this reading sequence:
1. What is this page?
2. Why should the user care?
3. What can they do next?

### 4.3 First viewport clarity
Within the first mobile viewport, the page must make clear:
- Page purpose
- Main value or task
- Primary next action

### 4.4 No pinch-to-read UI
- Text must be readable without zooming.
- Important controls must be tappable without precision clicking.
- No horizontal scrolling for page content.

## 5) Mobile Content Priority
When laying out a page on mobile, prioritize in this order:
1. Headline / page identity
2. Primary CTA or primary task
3. Key supporting explanation
4. Trust/proof/supporting detail
5. Secondary actions
6. Deep detail / optional content

## 6) Section Rules for Mobile
- One section should serve one purpose.
- Do not combine multiple jobs into one dense block.
- Remove decorative sections that do not improve user understanding or action.
- Section transitions must be visually clear.
- Avoid long dark-heavy sequences unless the page type explicitly requires them.

## 7) Navigation Rules
### 7.1 Mobile navigation
- Keep navigation short.
- Prioritize the most important actions only.
- Use drawer/menu only when necessary.
- Do not overload top navigation with too many options.

### 7.2 Gateway pages
For gateway pages on mobile:
- Keep structure minimal.
- Use clear option cards.
- Avoid excessive explanatory text.
- Choice count must remain tightly controlled.

## 8) CTA Rules on Mobile
- Every page must have one clearly dominant primary CTA.
- Secondary CTAs must not visually compete with the primary CTA.
- Primary CTA placement must appear early in the scroll flow.
- Repeated CTAs are allowed only when the page is long and conversion-focused.
- Use sticky CTA only when it clearly improves mobile conversion and does not obstruct reading.

## 9) Typography Rules for Mobile
- Headings must be short and scannable.
- Body copy must be broken into short readable blocks.
- Avoid visually heavy paragraphs.
- Line length must stay comfortable for small screens.
- Text hierarchy must remain obvious without relying on color alone.

## 10) Spacing Rules for Mobile
- Use consistent spacing tokens only.
- Keep enough spacing between tappable elements.
- Keep card spacing generous enough to avoid crowding.
- Avoid desktop-style wide padding values copied directly into mobile layouts.

## 11) Forms on Mobile
- Use single-column forms.
- Ask only for necessary fields.
- Labels must remain clear and readable.
- Inputs must be easy to tap.
- Group related fields logically.
- Show primary submit action clearly.
- Avoid long uninterrupted forms where possible.

## 12) Cards and Surfaces on Mobile
- Card-based layouts are allowed when they improve scanning.
- Cards must not become too dense.
- Use white/light surfaces as the default for public pages unless page type requires otherwise.
- Do not stack too many visually equal cards without hierarchy.

## 13) Color Application for Mobile
Use color by role, not preference.
- Soft blue / light background: default page background for public pages
- White: default surface/card
- Navy: structure, emphasis, headings, selected branded sections
- Orange: primary CTA emphasis only
- Green: limited support/positive status use

Avoid:
- Dark panel on dark page as the default pattern for most public pages
- Too many high-emphasis elements in the same viewport
- Multiple strong orange actions competing together


## 13.1 Public Page Background Clarification
Default rule:
- Public **Marketing / Explainer / Product / Form** pages should start from:
  - soft blue / light background
  - white/light surface cards
  - navy used as structure and emphasis
  - orange reserved for primary CTA

Allowed exception:
- **Gateway public homepage** may use a navy-heavy panel or navy-led visual treatment when:
  - hierarchy remains clear
  - one primary action is still dominant
  - readability remains strong on mobile
  - the page still feels minimal and fast to scan

Logged-in pages:
- Dashboard / Control pages may use navy sections or stronger branded panels by role
- But should not default to dark-heavy treatment for every block across the whole page

## 14) Responsive Expansion Rule
After the mobile version is correct:
- Expand to tablet
- Expand to desktop
- Preserve content priority and CTA logic
- Do not introduce new layout complexity that breaks mobile clarity

## 15) Forbidden Patterns
- Desktop-first shrinking
- Horizontal scroll content areas
- Tiny tap targets
- Dense icon grids with equal visual weight when task priority differs
- Long text walls
- Multiple competing primary actions
- Decorative complexity that weakens clarity
- Dark-heavy UI everywhere without role-based justification

## 16) Acceptance Criteria
A page meets this standard when:
- It is understandable in the first viewport on mobile
- It has one clear primary action
- It reads vertically without confusion
- It uses approved color roles
- It works without zooming or sideways scrolling
- It scales upward cleanly to larger screens
