---
name: git-pushing
description: Stage, commit, and push git changes with conventional commit messages. Use when the user wants to commit and push changes, mentions pushing to remote, or asks to save and push their work. Also activates when the user says "push changes", "commit and push", "push this", "push to github", or similar git workflow requests.
---

# Git Push Workflow

Stage all changes, create a conventional commit with a pirate-style message written by the Claude Code CLI, and push the current branch.

## When to Use

Activate when the user:

- Explicitly asks to push changes ("push this", "commit and push", "push to remote")
- Mentions saving work to the remote ("save to github", "push to remote")
- Completes a feature and wants to share it
- Says phrases like "let's push this up" or "commit these changes"

## Workflow

1. Run `git status --short` and tell the user which files will be committed.
2. **Use the script. Do not run manual git commands for this workflow:**

   ```bash
   bash .claude/skills/git-pushing/scripts/smart_commit.sh
   ```

   With a custom message (skips Claude):

   ```bash
   bash .claude/skills/git-pushing/scripts/smart_commit.sh "feat: add feature"
   ```

3. Report what the script printed (the commit hash, message and branch). If it fails, say why and stop. Do not work around a refusal about secret-looking files.

The script handles: staging, the secret check, a pirate-style conventional message from `claude -p` (with a plain `chore: update N file(s)` fallback), the Claude footer, and the push with `-u`. It does nothing when the tree is clean, and never force-pushes.

## Rules

- Only run this when the user asks to commit or push.
- The staged diff is sent to Claude to write the message. Tell the user if the diff might contain anything sensitive.
- Never commit `.env` files, keys or credentials. The script refuses them; do not bypass it.
- Do not amend, rebase, reset, or force-push.
