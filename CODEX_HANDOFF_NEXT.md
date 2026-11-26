# AI Practice Lab — Codex handoff for remaining work

**Source audited:** `AI_Practice_Lab_Bank_RC2.zip`  
**Purpose:** finish the outstanding quality, compatibility, staging and release work with minimal token/context use.  
**Do not restart the project.** Continue in this repository and preserve the current architecture.

## 1. Current state — verified from the supplied ZIP

### Product and data
- Static web app under `site/`; no frontend build step is required for GitHub Pages.
- 800 core questions: A=160, B=240, C=220, D=180.
- 100 coding exercises: Python=40, NumPy=30, Pandas=30.
- 18 lessons, 18 flashcards, 7 projects, 4 essay prompts.
- The exam engine defaults to 90% objective points and 10% essay points; the ratio is by **points**, not question count. The app correctly distinguishes pending essay review from a confirmed zero in its scoring model.
- Weekly challenge target in the current code: 20 objective questions + 1 essay in 45 minutes; ranking should include only essays with confirmed rubric scores.
- Difficulty percentage allocation already exists in `site/difficulty.js` and the exam setup UI. Do not rebuild it unless a test demonstrates a defect.
- Reduced-motion CSS and keyboard focus styling already exist. Complete verification rather than replacing the motion system.

### Important question-bank gap
Independent data inspection found:

| Module | Total | Four-option questions | No-option questions |
|---|---:|---:|---:|
| A | 160 | 16 | 144 |
| B | 240 | 16 | 224 |
| C | 220 | 212 | 8 |
| D | 180 | 172 | 8 |
| **Total** | **800** | **416** | **384** |

The 384 no-option items are 160 numeric-answer questions, 216 code-reading questions, and 8 fill-in questions. Their `reasons` arrays contain one explanation each; the 416 four-option questions have four per-option reasons. The current `tests/bank_quality.py` deliberately accepts no-option questions and therefore does **not** enforce the user's four-option requirement across the bank.

There are also two supplemental objective questions in `site/extra-objectives.js`: `C-M01` has four options; `B-T01` currently has only two True/False options. Include these in the four-option quality gate or remove/replace them without losing the learning objective.

### Existing explanation limitation
`site/study-guide.js` selects from a small set of shared topic-family explanations and examples. It is useful as a fallback, but it is not a complete beginner-level explanation for every question. Do not claim all questions already teach a first-time learner adequately.

### Historical-data compatibility warning
- New exam sessions currently store `bankRevision: 2` in `site/exam.js`.
- `site/data/legacy-options.json` contains only 76 older question objects, not a complete snapshot of all 800 revision-2 questions.
- `site/exam.js` and `site/corrections.js` resolve historical answers against bank objects. If numeric/code/fill-in questions are converted to options without version-aware snapshots, old histories can be displayed or graded against the wrong answer format.
- Preserve old revision-1 and revision-2 results and any in-progress sessions. Do not silently rewrite historical scores or answer values.

### Supabase / GitHub status
- Migrations present: `supabase/001_progress.sql` through `supabase/006_weekly_options.sql`.
- `site/cloud-config.js` has empty `projectUrl` and `publishableKey`.
- No Supabase staging credentials/configuration, target Git remote, repository URL, or production Pages URL is included in this ZIP.
- `README.md` correctly says the package has not yet been published.
- **Stale documentation:** the existing `CODEX_DEPLOY.md` describes migrations 001–004 and says SQL tests focus on migration 002. The current handoff must use migrations 001–006 and add full-chain tests. Do not follow the old sequence as the final state.
- `.github/workflows/pages.yml` currently runs the weekly PostgreSQL test by injecting only migration 002 into `tests/weekly.sql`. It does not test migrations 003–006 as a chain.

## 2. Independent test results for this package

Commands run from the extracted project root:

| Command | Result |
|---|---|
| `python tests/bank_quality.py` | PASS; 800 records, 416 four-option single-choice items; no length flags. The script is currently too permissive for the 384 no-option records. |
| `python tests/release.py` | PASS; 10/10 release checks. |
| `python tests/content.py` | PASS; module counts and 100 coding exercises / 200 reference cases. |
| `python tests/knowledge.py` | PASS; 216 code outputs, 144 numerical keys, 18 lesson snippets. |
| `python site/projects/projects_test.py` | PASS; 7 tests. |
| `node --test tests/engine.test.mjs` | PASS; 17/17 tests. |
| `python tests/browser.py` | NOT VERIFIED; Playwright headless shell unavailable and browser navigation was blocked by the execution environment. |
| `python tests/corrections_browser.py` | NOT VERIFIED; same environment restriction. |
| PostgreSQL / Supabase staging | NOT RUN in this audit; `psql` and staging configuration were not available. |

The supplied `QUALITY_REPORT.md` also records manual Chrome and PostgreSQL-WASM tests performed by the prior author. Treat those as prior-reported evidence, not as a substitute for reproducible CI or a real Supabase staging run.

## 3. Execution order — do only these remaining tasks

### P0-A — Convert the 800-question bank to four-option objective questions

**User requirement:** every objective question in the Question Bank / generated exams must present exactly four options A/B/C/D. The 100 coding exercises remain genuine code-writing exercises; the separate essay component remains free response.

1. Convert the 384 no-option bank questions into four-option single-choice questions:
   - Numeric items: retain the exact correct numeric value; create three plausible numeric distractors from realistic calculation mistakes (wrong denominator, wrong unit, population/sample variance, percentage-point vs percent, rounding, etc.).
   - Code-reading items: retain the exact correct output; create three plausible outputs from realistic Python/NumPy/Pandas misconceptions (mutation vs reassignment, aliasing, axis, broadcasting, indexing, grouping, join cardinality, off-by-one, SQL clause order, etc.).
   - Fill-in items: preserve the learning objective and create four parallel choices.
2. Keep exactly one correct option for single-choice items. Store a stable integer key `0..3`; keep all four options unique and the same semantic type/unit/format.
3. Rewrite `B-T01` to four plausible choices or remove it from the selectable bank and explain why. Keep `C-M01` as a four-option multiple-select item if its exact-match grading remains correct; no partial credit unless explicitly designed and tested.
4. Keep the total core bank at exactly 800 unique IDs and the same A/B/C/D counts. Do not count a number-only rewording as a new question.
5. Keep coding exercises separate: do not turn the 100 actual coding labs into multiple-choice questions.

**Distractor standard — difficult but unambiguous:**
- Each wrong option must correspond to a plausible misconception or a specific incorrect reasoning path.
- All four choices should be parallel in grammar, unit, precision, and level of detail.
- Avoid obviously absurd values, mismatched units, giveaway length, absolute wording, “all/none of the above”, and options that are duplicates or logically equivalent.
- Exactly one best answer must be defensible from the question's stated assumptions. “Hard to eliminate” must never mean ambiguous or trick wording.
- Balance answer-key positions across A/B/C/D globally and within modules as far as counts allow. The runtime may shuffle display order, but the bank should not encode a predictable key pattern.

### P0-B — Make explanations teach a complete beginner

For every objective question, keep four per-option explanations (`reasons[0..3]`) and add question-specific teaching content using one stable schema, for example:

```json
"teaching": {
  "prerequisite": "Kiến thức cần biết trước, giải thích thuật ngữ bằng lời đơn giản.",
  "concept": "Bản chất kiến thức mà câu hỏi đang kiểm tra.",
  "steps": ["Bước 1...", "Bước 2..."],
  "workedExample": "Một ví dụ nhỏ có lời giải và kết quả.",
  "commonMistake": "Lỗi người mới thường mắc và cách tránh."
}
```

- `reasons[i]` for the correct option must show why it is correct, not merely restate it.
- Each incorrect option's reason must explain the likely misconception and the exact step that makes it wrong.
- Use plain Vietnamese first; introduce English technical terms in parentheses where useful.
- Include intermediate calculations or trace code line by line when relevant.
- A shared topic guide may remain as supplementary background, but it cannot replace question-specific reasoning and worked steps.
- In mock exams, do not reveal explanations, hints, or rubric before submission. In practice/review mode, show the beginner explanation after the learner checks or submits.

### P0-C — Version the bank and preserve all old learning data

Before changing question data:
1. Create a complete immutable snapshot of the current revision-2 bank (all 800 records and any supplemental items that affect history), separate from the current live bank.
2. Preserve the existing 76-item `legacy-options.json` data for revision-1 compatibility; do not overwrite it with revision-2 data.
3. Increment the live bank revision (currently 2) to 3.
4. Update in-progress session restore and result/correction rendering to resolve question data by the session/history `bankRevision`.
5. Verify revision-1 history, revision-2 history, revision-3 history, and an in-progress revision-2 session all render the original question, options, answer and explanation correctly.
6. Never recalculate or overwrite previously confirmed scores as a side effect of changing question data.

### P0-D — Full Supabase migration and weekly-challenge verification

1. Build reproducible PostgreSQL tests for the full migration sequence 001–006, not just 002.
2. Test two database scenarios:
   - Fresh database: apply all migrations in order; verify a new 20-question / 45-minute weekly challenge, 90 objective points + 10 essay points, pending review, rubric confirmation and leaderboard inclusion only after confirmed review.
   - Upgrade database: seed a pre-005 active week and prior submissions before applying 005 and 006; prove the active/legacy week's question set, deadline and scores are unchanged, and the cutover applies only to the intended next week.
3. Cover two students, private progress/RLS, student cannot directly edit rubric, admin/trusted grading path, missing/duplicate submission, expired deadline, retry/idempotency, empty/oversized essay, and leaderboard ties.
4. Update `.github/workflows/pages.yml` so CI runs the full migration-chain test on a disposable PostgreSQL database before deployment.
5. Update `CODEX_DEPLOY.md` and `README.md` so they agree with the 001–006 migration order and current weekly rules.
6. On the actual Supabase staging project, run migrations only after checking the migration ledger and taking a backup/branch. Apply each migration exactly once. Never run staging commands against production by assumption.
7. Keep service-role keys and database passwords in environment secrets only. `site/cloud-config.js` may contain only the public project URL and publishable/anon key.

If staging access is not configured, finish the local migration tests and report the exact missing access needed. Do not fabricate a successful staging result and do not ask the user to paste a service-role key into chat.

### P1-A — Browser, accessibility, theme and performance release gate

The code already has focus-visible styles, reduced-motion CSS, theme switching and liquid motion. Verify and fix rather than replacing them wholesale.

- Run both Playwright suites in GitHub Actions with installed Chromium; fix any real failures.
- Test keyboard-only navigation: menu, routes, question choices, flag, previous/next, submit confirmation, forms, dialogs/details, and focus restoration.
- Test Light and Dark themes at 390, 768 and 1440 px; test `prefers-reduced-motion` and touch interaction.
- Check horizontal overflow, readable contrast, visible focus, semantic labels, live status announcements and timer accessibility.
- Measure route transitions and scrolling under repeated navigation. Record CPU/long tasks/frame timing where supported; do not claim performance PASS without measurements.
- Avoid generating raster images or expensive canvas textures every frame. Preserve the portfolio-inspired liquid look while keeping exam screens calm and readable.

### P1-B — GitHub release

- Inspect `git status`, current branch and `git remote -v` before any write. The ZIP itself does not include a `.git` directory or a known remote.
- If no target repository is configured, ask for the exact owner/repository before creating or pushing anything. Do not create a duplicate repo.
- Confirm the intended repo is safe to make public before publishing student-facing content. Do not commit student data, local backups, secrets or `.env` files.
- After P0 and P1 tests pass, push to the agreed branch, wait for the `Verify and deploy AI Practice Lab` workflow, and open the exact URL returned by the deployment job.
- Verify the app under the repository subpath, reload deep links, confirm assets return 200, and test guest mode. Test login/sync/weekly ranking only if staging is configured.
- Report repository URL, commit SHA, workflow run, Pages URL and remaining blockers. “Workflow green” alone is not proof of full production readiness.

### P2 — Later feature, not a release blocker for the current RC

The original handoff identifies Phase 5 as not yet implemented: discover authoritative sources, extract knowledge, draft new questions, validate answer keys/distractors, detect duplicates, request human approval, and publish versioned items. Keep this separate from the current release-hardening work. Do not begin it until P0/P1 are complete unless the user explicitly reprioritizes it.

## 4. Token- and context-efficient Codex workflow

1. `AGENTS.md` is the short always-on instruction. Read this file once, then inspect only the active phase's named files.
2. Do not load or print all 800 JSON records. Generate compact counts/samples with scripts; inspect 5–10 representative questions per module and then only the IDs in the current batch.
3. For question writing, process 20–30 IDs per batch. Edit JSON with a script or structured patch; do not paste full JSON into chat. Keep the batch list in `CODEX_PROGRESS.md`.
4. For each batch, run only the targeted validator for that module. After all four modules, run the complete bank, content, knowledge and engine tests.
5. Do not rerun every test after every CSS or copy edit. Run relevant tests after a change; run the full release suite at the end of each phase and before release.
6. Use `rg -n` to find symbols and `sed -n 'start,endp'` to inspect a narrow code range. Never ask the model to summarize files it does not need to modify.
7. Do not paste complete test logs. Capture output to a file and report pass/fail counts plus only the first actionable failure.
8. Do not create duplicate reports. Update `QUALITY_REPORT.md`, `QA.md`, `HANDOFF.md` and `README.md` only when the related phase changes; keep one current score table and move old results to a dated history section.
9. If context is running low or the work must continue in another Codex session, write/update `CODEX_PROGRESS.md` with: phase, completed ID ranges, files changed, last passing commands, first failing test, exact next command, and blockers. The next session reads only `AGENTS.md`, this handoff, and `CODEX_PROGRESS.md`.
10. Keep user-facing Codex updates concise. Do not print generated question content or full diffs unless asked.

## 5. Minimal command sequence

Run from the repository root. Use targeted tests while working, then this final sequence:

```bash
python tests/bank_quality.py
python tests/content.py
python tests/knowledge.py
python site/projects/projects_test.py
node --test tests/engine.test.mjs tests/cloud.test.mjs
python tests/release.py
python tests/browser.py
python tests/corrections_browser.py
```

Run the full PostgreSQL migration-chain suite added in P0-D separately. A browser or staging test that cannot run must be reported as **NOT VERIFIED**, never PASS.

## 6. Definition of done

Do not mark the project release-ready until all are true:
- Every objective item in the 800-question bank and supplemental selectable bank has exactly four plausible options, one unambiguous correct answer (or a tested exact-match multiple-select key), and four option-specific explanations.
- Every question has beginner-friendly, question-specific teaching content with steps and a worked example where relevant.
- Revision-1 and revision-2 histories and active sessions remain correct after the revision-3 bank update.
- 90/10 point allocation is correct in all graded exam modes; essay remains Pending Review until an authorized rubric score is recorded.
- Full migrations 001–006 pass reproducible PostgreSQL tests; actual Supabase staging is verified before production.
- Browser, keyboard, reduced-motion, both themes, responsive and performance checks have evidence.
- GitHub Actions verifies the exact final source and the deployed Pages URL is opened and checked.
- Every criterion is at least 9.5/10 individually, with no Critical/High issue. If any dependency is unavailable, report the project as **not ready**, list the blocker and stop before production claims.

## 7. Start command for Codex

Read `AGENTS.md` and this file. Start with P0-A and P0-B using small batches, then P0-C, P0-D, P1-A and P1-B. Do not ask the user to repeat requirements already stated here. Ask only for the missing staging/repository access when that phase is reached.
