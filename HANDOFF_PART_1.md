# V3 · Bàn giao 01 — Tài khoản và tiến độ

## Trạng thái chạy

Mã nguồn hoàn chỉnh của phần 1 nằm trong gói này, có cả V2. Mở START_WINDOWS.bat để chạy thử. Chế độ khách mặc định hoạt động ngay. Đăng nhập bằng mã email và đồng bộ cần một dự án Supabase được cấu hình. Chưa có tài khoản dịch vụ, URL repo đích hoặc bản triển khai production được cung cấp cho phần này.

## Kích hoạt

1. Trong Supabase SQL Editor, chạy supabase/001_progress.sql. Bảng student_progress lưu một hàng cho mỗi UID, khóa ngoại tới auth.users, hồ sơ JSONB và revision. RLS ràng buộc hàng đọc và ghi theo UID của JWT. anon không có quyền truy cập bảng.
2. Bật nhà cung cấp Email trong Authentication. Cho phép đăng ký mới nếu muốn sinh viên tự tạo tài khoản. Trong mẫu Magic Link, dùng mã **{{ .Token }}** để email hiển thị mã có thể nhập trong app. Cấu hình gửi thư cho địa chỉ sinh viên thực tế và kiểm tra thư đến.
3. Trong site/cloud-config.js điền projectUrl và **publishableKey** công khai của dự án. Khóa service_role/secret có quyền quản trị không được đặt vào website. Mở app qua HTTP(S).
4. Chọn Tài khoản, nhập email, nhận và xác nhận mã. Trên máy dùng chung, sinh viên tự chọn có nhập hồ sơ khách hay không. Chỉ hồ sơ tài khoản trống được nhập qua nút này. Bản gốc của khách vẫn ở thiết bị.
5. Học xong một bài, mở Tài khoản và kiểm tra trạng thái “Đã đồng bộ lên tài khoản”. Đăng nhập cùng email trên thiết bị thứ hai và đối chiếu lịch sử, flashcard, bài đã đọc, bài code, nháp và kế hoạch. Phiên thi đang làm chỉ tiếp tục trong tab ban đầu.
6. Trên thiết bị khác đăng nhập email B, kiểm tra không có lịch sử của A. Thử đọc và sửa một UID khác bằng JWT sinh viên trong môi trường kiểm thử của trường. Kết quả mong đợi là không đọc hoặc cập nhật được hàng của người khác.

## Cách xử lý xung đột

Các thay đổi được gộp và đẩy tự động. Khi mất mạng, bản chờ ở sessionStorage của tab. Hãy giữ tab mở, kết nối lại và bấm Đồng bộ ngay. Khi hai thiết bị ghi từ cùng revision, yêu cầu sau bị chặn. Xuất bản JSON của tab nếu muốn giữ thay đổi, rồi chọn Tải hồ sơ từ máy chủ. Hiện chưa có gộp tự động hai nhánh lịch sử. Phiên đăng nhập dùng riêng cho mỗi tab. Bản ghi điểm do client tạo chỉ phục vụ học cá nhân.

## Kiểm thử và nghiệm thu

Chạy python tests/release.py. Bộ Node bổ sung tests/cloud.test.mjs chạy hàng đợi đồng bộ thật với service giả lập theo quy tắc revision. Bao phủ hai sinh viên, hai thiết bị, lỗi mạng, retry, xung đột và loại phiên thi dở khỏi dữ liệu đồng bộ. Đây là kiểm thử logic. Email thật, chính sách RLS trên PostgreSQL và chuyển thiết bị vật lý cần kiểm tra thêm trên dự án đích trước khi mời sinh viên.

## Điểm dừng và phần kế tiếp

Bản này chỉ triển khai phần 1. Việc tiếp theo sau nghiệm thu tài khoản là phần 2 — màn hình chữa bài theo lỗi từng sinh viên. Phần 3 — thử thách tuần và xếp hạng bằng điểm xác nhận phía máy chủ. Phần 4 — trang chủ có tin AI và repo nổi bật. Phần 5 — luồng tìm nguồn, tạo nháp câu hỏi, kiểm định và xuất bản. Đọc file này và QA.md khi chuyển phiên.
