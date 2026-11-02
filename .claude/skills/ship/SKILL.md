---
name: ship
description: Move finished work through the branch flow (feature -> dev -> preview -> main) with verification and pull requests, without ever pushing to main directly. Use when the user says ship it, promote, open a PR, or release.
argument-hint: "[to-dev | to-preview | to-production]"
disable-model-invocation: true
allowed-tools: Bash(git status*) Bash(git log*) Bash(git diff*) Bash(git branch --show-current) Bash(npm run verify) Bash(gh pr view *) Bash(gh pr list *) Bash(gh pr checks *)
---

# Ship: $ARGUMENTS

Current branch: !`git branch --show-current`
Uncommitted changes: !`git status --short`
Ahead of dev / preview / main: !`git rev-list --count origin/dev..HEAD 2>/dev/null || echo ?` / !`git rev-list --count origin/preview..HEAD 2>/dev/null || echo ?` / !`git rev-list --count origin/main..HEAD 2>/dev/null || echo ?`

## The flow

| Step | From | To | How |
| --- | --- | --- | --- |
| to-dev | `feature/*`, `chore/*` | `dev` | PR (squash is fine) or direct push for small experiments |
| to-preview | `dev` | `preview` | PR with a merge commit; the client reviews on the preview domain |
| to-production | `preview` | `main` | PR with a merge commit; CI `verify` must pass; merging deploys to production |

## Steps

1. Refuse to continue if the current branch is `main`. Tell the user to switch branches.
2. Run `npm run verify`. Stop and fix failures first.
3. Show the user what will ship: `git log --oneline <target>..HEAD` and a one-paragraph summary. List any deleted code separately and confirm it was approved.
4. Commit outstanding work with a conventional message (`feat:`, `fix:`, `chore:`, `docs:`) only after the user agrees to the message.
5. Push the source branch (never force). The guard hook blocks pushes to `main` and force pushes to protected branches.
6. Open the pull request with `gh pr create --base <target> --head <source>` and a body containing: what changed, why, how it was verified, screenshots or the Vercel preview URL for UI work, and deletions needing approval.
7. For to-production, also run `gh pr checks` and wait for `verify` and the Vercel preview deployment to pass. Do not merge; the user merges production PRs themselves (merging asks for confirmation).
8. Report the PR URL and the next promotion step.
