# NEX Page Type Standard v1

## 1) Purpose
This document defines the approved page types for NEX and the expected structure of each type.
It prevents agents and builders from mixing different page intents into one layout.

## 2) General Rule
Before designing any page, identify the page type first.
Do not design until page type is explicitly confirmed.


## 2.1 Public vs Logged-in Clarification
When defining page type, also define user state:
- Public
- Logged-in
- Evaluating
- Registering

This matters because visual weight and layout behavior may differ between:
- public gateway pages
- public marketing/explainer pages
- logged-in dashboard/control pages

Default rule:
- Public marketing-like pages should not use dark-heavy UI as their default pattern
- Logged-in dashboard pages may use stronger branded sections when task structure remains clear

## 3) Approved NEX Page Types
### A. Gateway Page
**Goal**
Quickly direct users to the correct path.

**Typical use**
- Main entry page
- Product selection hub
- Route selection hub

**Mobile structure**
1. Brand/logo/header
2. Short orientation statement
3. Limited option cards
4. Optional highlighted recommended path

**CTA pattern**
- Usually multiple route choices
- Still requires hierarchy
- No more choices than necessary


**Visual guidance**
- Public gateway pages may use navy-heavy panels or navy-led hero treatment
- Still keep the page minimal, fast, and hierarchy-led
- One highlighted recommended path is allowed
- Do not make every option equally loud

**Do not**
- Turn it into a full explainer page
- Add excessive paragraphs
- Make every card equally aggressive without guidance

---
### B. Marketing Landing Page
**Goal**
Persuade, explain value, and drive conversion.

**Typical use**
- Product introduction
- Sales pages
- Campaign pages

**Mobile structure**
1. Hook / value statement
2. Problem / pain
3. Solution
4. Benefits / features
5. Trust / proof
6. Closing CTA

**CTA pattern**
- One primary CTA
- Optional secondary CTA
- Repeated CTA allowed on long pages

**Do not**
- Overload hero with too much text
- Create equal emphasis for all sections
- Turn page into a menu hub

---
### C. Explainer / Education Page
**Goal**
Help users understand a concept before taking action.

**Typical use**
- What is NEX?
- What is NEX Digital Asset?
- Framework / mindset pages

**Mobile structure**
1. Clear definition
2. Context / pain / misconception
3. Explanation flow
4. Why it matters
5. Next-step CTA

**CTA pattern**
- Softer early CTA acceptable
- Stronger CTA near later sections

**Do not**
- Skip explanation and jump only to features
- Add too many parallel narratives

---
### D. Product Page
**Goal**
Present one product, one offer, or one product group clearly.

**Typical use**
- Product overview
- Module page
- Feature bundle page

**Mobile structure**
1. Product identity
2. Product purpose
3. Key features
4. Benefits or outcomes
5. Usage path / next step
6. CTA

**CTA pattern**
- One product-related primary CTA

**Do not**
- Mix unrelated products heavily on one page
- Present features without outcome framing

---
### E. Form / Registration Page
**Goal**
Capture user input with minimal friction.

**Typical use**
- Sign up
- Enquiry
- Contact
- Apply / register

**Mobile structure**
1. Short heading
2. Short explanation
3. Form block
4. Submission CTA
5. Minimal support/help

**CTA pattern**
- One submit action
- Minimal distractions

**Do not**
- Add unnecessary sections before form
- Use dense two-column forms on mobile

---
### F. Dashboard / Control Page
**Goal**
Help logged-in users act efficiently.

**Typical use**
- Control center
- Manage area
- Settings overview

**Mobile structure**
1. Page title / status
2. Key actions / quick tasks
3. Main tools or core content
4. Secondary tools
5. Support/status/help if needed

**CTA pattern**
- Priority actions must be visually ranked
- Not all tools should look equally primary


**Visual guidance**
- Logged-in dashboard pages may use navy sections, status panels, or branded control blocks
- But should not become a visually flat dark grid where all tools look equally primary
- Quick actions must remain more prominent than secondary tools

**Do not**
- Use marketing landing structure
- Dump all tools into one visually flat grid
- Treat dashboard like a public gateway unless intentionally designed as such

## 4) Page-Type Decision Rule
For every new page brief, define:
- Page type
- User state (public / logged-in / evaluating / registering)
- Primary job of page
- Primary CTA
- Secondary CTA if any

## 5) Conflict Rule
If a page seems to need multiple page types, split the experience into multiple pages or separate sections with clear priority.
Do not merge everything into one confused page.

## 6) Acceptance Rule
A page passes this standard when:
- Its page type is explicit
- Its structure matches its purpose
- Its CTA pattern matches its page type
- It avoids behaviors forbidden for that page type
