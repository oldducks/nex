# NEX Component Standard v1

## 1) Purpose
This document defines the standard behavior and usage rules of reusable UI components for NEX.
Components must support the NEX brand system and mobile-first implementation.

## 2) General Component Rules
- Use design tokens only.
- Do not hard-code ad hoc colors, spacing, or radius.
- Components must remain consistent across pages.
- Mobile behavior must be defined before tablet/desktop variants.

## 3) Buttons
### Primary Button
**Use for**
- Main conversion action
- Main submission
- Main next-step action

**Visual role**
- Orange emphasis
- Strong contrast

**Rules**
- Only one primary CTA should dominate a viewport/section when possible.
- Label must be direct and action-oriented.

### Secondary Button
**Use for**
- Alternative action
- Learn more
- Supporting flow

**Visual role**
- Navy, outline, or neutral depending on context

### Forbidden
- Multiple primary buttons competing in the same block
- Unclear labels like “Click here” without context

## 4) Cards
### Standard Card
**Use for**
- Feature grouping
- Navigation option
- Summary block
- Content chunking

**Rules**
- Use white/light surface by default on public pages.
- Content inside card must remain focused.
- Card should not contain too many unrelated actions.

### Option Card
**Use for**
- Gateway choices
- Tool choices

**Rules**
- Must show clear label
- Optional short helper text
- Hierarchy among options must still be visible

## 5) Inputs and Form Fields
**Use for**
- Registration
- Contact forms
- Settings

**Rules**
- Single-column on mobile
- Clear labels
- Consistent spacing
- Inputs must be easy to tap
- Validation must be understandable

## 6) Navbar / Mobile Header
**Rules**
- Keep actions limited
- Logo/title should not compete with too many actions
- Avoid overloading header icons
- Use drawer/menu when options exceed practical space

## 7) Drawer / Mobile Menu
**Use for**
- Secondary navigation
- Extended route lists

**Rules**
- Group links logically
- Keep top-priority actions easily accessible
- Avoid mixing unrelated utility links and primary journey links without grouping

## 8) Section Header
**Use for**
- Introduce a content block
- Clarify what section is about

**Rules**
- Must be short and scannable
- Support text should remain concise

## 9) CTA Block
**Use for**
- Strong end-of-section action
- Conversion moment

**Rules**
- One dominant action
- Minimal distraction
- Must not feel like just another content card

## 10) Status Badge / Status Panel
**Use for**
- Account state
- Activation state
- Notification state

**Rules**
- Must be readable at a glance
- Use role-based colors, not decorative colors
- Keep message short and factual

## 11) Dashboard Tool Grid
**Use for**
- Logged-in tool access

**Rules**
- Prioritize actions visually
- Break large tool sets into groups if needed
- Do not place every tool at the same emphasis level
- Must remain tappable and readable on mobile

## 12) Footer
**Use for**
- Secondary navigation
- Contact
- Policy/support links

**Rules**
- Keep compact on mobile
- Do not let footer become the only place where key actions exist

## 13) Empty State / Placeholder
**Use for**
- New users
- No data
- No result states

**Rules**
- Explain what happened
- Explain what to do next
- Include a helpful next action when relevant

## 14) Component Acceptance Criteria
A component passes this standard when:
- It uses approved tokens
- It supports mobile usability
- Its purpose is clear
- Its emphasis level matches its role
- It does not break page hierarchy
