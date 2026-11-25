# Bàn giao cho Codex · AI Practice Lab

Mục tiêu: triển khai bản tích lũy phần 1–4 lên GitHub Pages của repo người dùng chỉ định. Thư mục gốc của ZIP chính là gốc repo. Giữ cả thư mục ẩn .github. Thư mục xuất bản là site/. Không cần bước build frontend.

1. Kiểm tra origin và nhánh đích. Nếu chưa có đích, hỏi chủ sở hữu và tên repo. Với repo có sẵn, kiểm tra khác biệt và giữ các thay đổi riêng của người dùng.
2. Đọc README.md và HANDOFF_PART_1.md. Với dịch vụ lớp học mới, áp dụng supabase/001_progress.sql đến 004_weekly_length.sql theo thứ tự. Với dịch vụ đang hoạt động, đối chiếu lịch sử triển khai và chỉ chạy migration còn thiếu. Cấu hình Email OTP theo hướng dẫn phần 1. Chỉ điền URL dự án và publishable key công khai vào site/cloud-config.js. Nếu thiếu cấu hình, trang vẫn phục vụ chế độ khách.
3. Cài phụ thuộc trong tests/requirements.txt, chạy python tests/release.py. Cấu hình Pages dùng GitHub Actions. Workflow .github/workflows/pages.yml chạy khi push vào main hoặc kích hoạt thủ công. Kiểm tra quyền Pages và môi trường github-pages khi triển khai.
4. Theo dõi job verify và deploy đến khi hoàn tất. Mở URL thực tế của deployment, thử tải lại từ đường dẫn con của repo, kiểm tra tin AI, repo và bố cục điện thoại. Dùng hai tài khoản kiểm thử để xác minh tiến độ riêng, đồng bộ và xếp hạng. Thử đề tuần 20 câu/45 phút, nộp lại, hết giờ và tuần chuyển tiếp từ đề 5 câu. Ghi lại URL, commit, kết quả CI và hạng mục còn thiếu.
5. Các tệp HANDOFF_PART_1–4.md ghi quyết định và giới hạn từng phần. Cơ chế tự tìm nguồn và sinh câu hỏi mới là phần 5 chưa triển khai. Bộ kiểm tra SQL hiện có tập trung vào migration 002; cần nghiệm thu 003 và 004 trên dịch vụ đích.
