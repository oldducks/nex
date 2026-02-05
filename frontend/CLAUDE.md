# CLAUDE.md
## Project Context
A premium, high-converting landing page for "Mind" to showcase personal brand, share digital assets, and enable direct email contact.

## Tech Stack
- Framework: Next.js (App Router)
- Language: TypeScript
- Database: None (Static/API-driven)
- Styling: Tailwind CSS
- Assets: VCF (vCard), PDF (Catalog)

## Key Directories
- `src/app` — Application routes and pages
- `src/components` — Reusable UI components
- `public` — Static assets (images, vcf, catalog)

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Build for production
- `npm test` — Run tests (if any)
- `npm run lint` — Run linter

---

## How I Want You to Work

### Before Coding
- Ask clarifying questions before starting
- Draft a plan for complex work and confirm before coding
- If unsure, ask — don't assume

### While Coding
- Write complete, working code — no placeholders, no TODOs
- Keep it simple and readable over clever
- Follow existing patterns in the codebase
- One change at a time, verify as you go

### After Coding
- Run tests to verify your changes work
- Run linter/formatter before finishing
- Summarize what you changed and why

---

## Code Style
- Use ES modules (import/export)
- Functional components with hooks
- Type hints on all functions
- Descriptive variable names
- No commented-out code

## Do Not
- Edit files in `node_modules` or `.next`
- Commit directly to main (if using Git)
- Leave placeholder code or TODOs
- Make changes outside the scope of the task
- Assume — ask if unclear

---

## Verification Loop
After completing a task, verify:
1. Code compiles without errors
2. Tests pass (if applicable)
3. No linting warnings
4. Changes match the original request

If any fail, fix before marking complete.

---

## Quick Commands
When I type these shortcuts, do the following:

**"plan"** — Analyze the task, draft an approach, ask clarifying questions, don't write code yet

**"build"** — Implement the plan, run tests, verify it works

**"check"** — Review your changes like a skeptical senior dev. Check for bugs, edge cases, and code quality

**"verify"** — Run all tests and linting, summarize results

**"done"** — Summarize what changed, what was tested, and any notes for me

---

## Success Criteria
A task is complete when:
- [ ] Code works as requested
- [ ] Tests pass
- [ ] No errors or warnings
- [ ] Changes are minimal and focused
- [ ] I can understand what you did without explanation

---

## Notes
- Focus on premium aesthetics: smooth gradients, micro-animations, and glassmorphism.
- Ensure the digital name card (.vcf) and catalog are easily downloadable.
