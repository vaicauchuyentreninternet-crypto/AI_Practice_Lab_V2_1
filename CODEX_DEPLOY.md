# Codex deployment entry point — AI Practice Lab

**Read `AGENTS.md` and `CODEX_HANDOFF_NEXT.md` first.** The latter is the current source of truth for unfinished work, test evidence, migration order 001–006, data-version compatibility, token-efficient execution and release gates. Older `HANDOFF_PART_1–4.md` files are historical context, not the final migration or release checklist.

## Deployment rules

- The repository root is the root of this package. Publish the static site from `site/` using `.github/workflows/pages.yml` and GitHub Pages → GitHub Actions.
- Inspect `git status`, branch and remote before writing. This ZIP does not provide a `.git` directory or a known target repository. Ask for the exact owner/repository if no remote is configured; do not create a duplicate.
- The Supabase schema in this package is migrations `001_progress.sql` through `006_weekly_options.sql`. Inspect the migration ledger and current data before applying anything. Apply each missing migration once, in order, to a staging branch/project first. Preserve active/legacy weeks and old scores.
- The current workflow only tests the old weekly migration 002 path. Extend it to test the full migration chain 001–006 as specified in `CODEX_HANDOFF_NEXT.md` before treating CI as release evidence.
- `site/cloud-config.js` currently contains empty public configuration. Only the project URL and publishable/anon key belong in the frontend. Never put service-role keys or database passwords in source code.
- Do not claim production-ready until the full bank, historical data, Supabase staging, browser/accessibility/performance checks and actual Pages URL satisfy the individual 9.5/10 release gate.

For token-efficient work, follow `AGENTS.md`; do not read or paste the entire repository or question bank into the conversation.
