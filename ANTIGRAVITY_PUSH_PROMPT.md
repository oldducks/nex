# Prompt for Antigravity: Push Latest Landing + Handover Update to GitHub

Important: this workspace has **two separate Git repos**.
- Repo A (main): `/root/nex namecard`
- Repo B (landing): `/root/nex namecard/40-nex-landing-page-2`

Objective:
- Push latest handover update from Repo A.
- Push latest landing UX/conversion changes from Repo B.

## Step 1: Push Repo A (`/root/nex namecard`)
Scope:
- `AGENT_HANDOVER.md`

Tasks:
1. `cd /root/nex namecard`
2. Check status for `AGENT_HANDOVER.md` only.
3. Stage only that file.
4. Commit message:
   - `docs(handover): add 2026-03-03 landing improvement and deploy record`
5. Push current branch to origin.

## Step 2: Push Repo B (`/root/nex namecard/40-nex-landing-page-2`)
Scope:
- `src/components/LeadForm.tsx`
- `src/components/sections/Hero.tsx`

Tasks:
1. `cd /root/nex namecard/40-nex-landing-page-2`
2. Check status for the two files above.
3. Stage only those two files.
4. Commit message:
   - `feat(landing): improve hero/form conversion UX and client validation`
5. Push current branch to origin.

## Return format
For each repo, report:
- branch name
- commit hash
- pushed remote ref
- files included in commit

Constraints:
- Do not reset, stash, or revert unrelated modified files.
- If push is rejected, run `git pull --rebase` then retry push.
- If conflicts occur, stop and report conflicted files with paths.
