# Bản làm việc · nâng cấp đề thi và Liquid Motion
Mã thi: site/assessment.js, site/exam.js, site/core.js, site/extra-objectives.js, site/corrections.js, site/data/essays.json. Điều hướng và báo cáo: site/app.js. Motion: site/assets/style.css. Thi tuần: site/weekly.js, supabase/005_weekly_essay.sql. Test: tests/engine.test.mjs. Báo cáo: README.md, QA.md, QUALITY_REPORT.md, HANDOFF.md.

Đối với staging, áp dụng 005 sau 004 một lần. Tuần đã có lượt bắt đầu hoặc nộp được đánh dấu legacy. Bài đầu tuần mới giữ 20 câu khách quan và thêm 1 câu tự luận trong cùng 45 phút. Tài khoản sinh viên gửi bài qua RPC; việc chấm tuần dùng cột rubric của apl_weekly.essays, đúng bốn số nguyên 0–2, do người có quyền quản trị cập nhật trong môi trường tin cậy. Không cấp quyền cập nhật bảng cho sinh viên. Bài đang chờ chưa xếp hạng. Chấm trên thiết bị trong đề cá nhân là thao tác luyện tập, không chứng thực danh tính giảng viên.

Xem QUALITY_REPORT.md trước khi phát hành. Cần kết nối staging để kiểm thử xác thực và xếp hạng thực, chạy bộ browser đầy đủ và đo hiệu năng. Chưa phát hành.

## Cập nhật kế tiếp
Chạy migration 006_weekly_options.sql sau 005 trên staging. Các tuần đang hoạt động dùng cấu trúc cũ. File legacy-options.json cung cấp nội dung trước lần sửa cho đề cũ. Cấu hình tỷ lệ độ khó có ở trang Luyện thi. Nghiệm thu mới nằm cuối QUALITY_REPORT.md. Đề thi thử nộp thiếu chỉ hiển thị điểm và trạng thái, phần gợi ý mở khi đã trả lời đủ cả khách quan và tự luận rồi nộp.

## Codex continuation
`AGENTS.md` and `CODEX_HANDOFF_NEXT.md` are the current instructions for the remaining work. Read them before making changes. They supersede older phase notes where migration order, bank revision, browser evidence or release status differs. The next priority is converting the 384 no-option bank items to four-option questions while preserving revision-1/2 history, then completing full migration-chain tests and staging verification.
