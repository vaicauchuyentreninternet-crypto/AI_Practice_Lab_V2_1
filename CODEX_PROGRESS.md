# CODEX_PROGRESS

## Current phase
- Phase: P0-A, four-option bank conversion (in progress; module A complete, 19 batches complete).
- Source of truth: `AGENTS.md`, `CODEX_HANDOFF_NEXT.md`.
- Completed batches: A017–A160 and B017–B236 (364/384 objective questions without options; module A complete and eleven B batches complete).
- Remaining initial gaps: A=0, B=4, C=8, D=8, plus supplemental B-T01; 20 core items remain.
- All completed items have four unique choices, one correct integer key, four option-specific reasons, and answer positions distributed across 0/1/2/3 (each key position is balanced within every 20-item batch).

## Files changed
- `site/data/A.json`: converted all initially open numeric questions A017–A160.
- `site/data/B.json`: converted B017–B236, retaining original question-type metadata while making these objective items selectable.
- `tests/knowledge.py`: now verifies original computed answers against the keyed option after conversion.
- `site/data/revisions/2/`: original revision-2 A–D files and supplemental objective file restored from the attached ZIP, with SHA-256 manifest; verified 800 unique IDs and original module counts.
- `tests/bank_quality.py`: added targeted `--ids` / `--module` validation, UTF-8 reads, strict four-choice enforcement, and case-sensitive uniqueness for code-output strings.
- `CODEX_PROGRESS.md`, `QUALITY_REPORT.md`: tracking only.

## Tests
- PASS: `python tests/bank_quality.py --module A` PASS (160/160; no length flags).
- PASS: `python tests/content.py` (800 records; 100 exercises; 200 reference cases).
- PASS: `python tests/knowledge.py` (216 code outputs; 144 numerical keys; 18 lesson snippets).
- PASS: `node --test tests/engine.test.mjs` (17/17).
- NumPy is temporarily installed under `.codex-deps` for independent NumPy reference evaluation; remove this temporary folder after P0-A checks.
- Do not count the old full-bank result as current completion evidence: the validator now intentionally fails until all objective items are converted.

## Next action
- Continue P0-A in batches of at most 20–30 IDs. Next inspect and convert B237–B240, then C017–C024 and D017–D024, then run `python tests/bank_quality.py --ids <batch IDs>`.
- Keep P0-B (question-specific teaching on all 800 items) separate from this P0-A batch and track its own coverage.

## Blockers
- No current batch blocker. Python test dependencies are not installed globally; install `tests/requirements.txt` when running the Python suites.
- No staging credentials or configured target Git remote are present; those belong to P0-D/P1-B and are not needed for this batch.

## Trạng thái hiện tại sau lượt chạy tiếp

Đã chuyển đủ 384 câu lõi và B-T01. Bank có 800 câu lõi với bốn phương án. Đã sửa B029 để kết quả Python đứng đầu phương án và sửa khóa B227 để chọn đúng lập luận về năm nhuận. Bộ knowledge xác nhận 216 kết quả code, 144 khóa số và 18 ví dụ. Bộ release đạt 10/10 nhóm. Các số liệu tiến độ phía trên thuộc batch trước.

P0-A vẫn mở về chất lượng nội dung. Ví dụ A092 có hai phương án tương đương 2 và 2.000. Nhiều lời giải mới còn bằng tiếng Anh và vị trí khóa có mẫu lặp. Cần rà soát các lỗi này trước nghiệm thu. Tương thích phiên cũ, staging và phát hành chưa được xác minh.
