# Codex instructions — AI Practice Lab

1. Read `CODEX_HANDOFF_NEXT.md` first. It is the current source of truth for remaining work and supersedes stale deployment notes in earlier handoffs.
2. Do not re-read the entire repository or print large JSON/source files. Use `rg`, targeted `sed`, and small Python/Node summaries. Read only the files named for the active task.
3. Preserve the current architecture, working features, user data, and historical exam results. Do not create a new project or replace the app with a mockup.
4. Work in small, independently testable batches. For question content, process at most 20–30 IDs per batch and record completed IDs in `CODEX_PROGRESS.md`.
5. Run targeted tests after each batch; run the full release suite after each phase. Never weaken or delete tests to obtain PASS.
6. Never invent test results, sources, Supabase configuration, repository URLs, or production status. Do not put service-role keys, database passwords, or other secrets in source code, chat, logs, or commits.
7. Keep responses concise: report changed files, commands and test counts, unresolved blockers, and the single next action. Do not paste full files or generated datasets into chat.
