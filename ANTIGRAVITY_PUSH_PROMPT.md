# Prompt for Antigravity: Push UX Update (Home CTA + Public Profile Logo)

Repo:
- `/root/nex namecard`

Objective:
- Push latest UX updates for landing page CTA arrangement/color and public profile logo sizing
- Include updated handover log

## Scope (stage only these files)
1. `AGENT_HANDOVER.md`
2. `frontend/src/app/page.tsx`
3. `frontend/src/app/[prefix]/[uid]/page.tsx`

## Tasks
1. `cd /root/nex namecard`
2. Run `git status --porcelain=v1` and verify many unrelated files may exist.
3. Stage only the 3 files in Scope above.
4. Commit with message:
   - `feat(ux): align home CTAs and increase public profile logo visibility`
5. Push current branch to `origin`.

## Return format
- branch name
- commit hash
- pushed remote ref
- exact files in commit

## Constraints
- Do not reset/revert/stash unrelated files.
- If push is rejected: run `git pull --rebase` then retry push.
- If conflicts happen: stop and report conflicted file paths.
