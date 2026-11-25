# Phần 3 · Thử thách và xếp hạng tuần

Trên Supabase của lớp, hoàn tất hướng dẫn phần 1, rồi chạy supabase/002_weekly.sql. Khai báo hai giá trị công khai trong site/cloud-config.js. Từ trang chủ, sinh viên đăng nhập và chọn Làm thử thách tuần. Khách xem được bảng điểm khi đã kết nối dịch vụ.

Máy chủ chọn 5 câu từ 48 câu trắc nghiệm của 4 module, theo ngày thứ Hai đầu tuần ở Việt Nam. Mỗi tài khoản có một kết quả mỗi tuần. Gửi lại giữ nguyên điểm đầu tiên. Bảng hiển thị tối đa 10 bài, cùng điểm cùng hạng, đồng điểm ở ranh giới top 10 ưu tiên mã bài nhỏ hơn. Mã hiển thị được tạo theo bài nộp, không công khai email. Nguồn câu hiện trích từ ngân hàng luyện tập công khai, phù hợp thi đua học tập.

Đã chạy 10 nhóm kiểm tra phát hành tại máy phát triển. tests/weekly.sql bổ sung kiểm thử PostgreSQL cho quyền truy cập, đề, tuần hết hạn, bài thiếu, điểm, gửi lại, hai sinh viên và đồng hạng. Workflow chạy trên cơ sở dữ liệu thử độc lập trước khi deploy. Phiên bàn giao chưa có PostgreSQL, thông tin dự án Supabase hoặc URL Pages đích để xác minh end-to-end. Cần thử với hai tài khoản thật trước khi mở cho lớp.

Phần 4 dự kiến bổ sung tin AI và repo nổi bật trên trang chủ.

## Bản 45 phút

Sau migration 002, chạy thêm supabase/003_weekly_timer.sql một lần. Mỗi sinh viên bấm Bắt đầu để mở đề 5 câu. Máy chủ lưu hạn nộp riêng theo tài khoản và tuần, lấy mốc sớm hơn giữa 45 phút và đầu tuần kế tiếp. Tải lại trang giữ hạn nộp, các lựa chọn chưa nộp phải chọn lại. Hết giờ khóa lượt chưa nộp. Đề thi thử riêng vẫn dùng thời lượng cũ.

## Bản 20 câu trong 45 phút
Chạy 004_weekly_length.sql đúng một lần sau 003. Mỗi tuần mới có 5 câu cho từng module A–D. Tuần đã có lượt bắt đầu hoặc bài nộp trước khi nâng cấp giữ đề và thang điểm cũ để mọi sinh viên cùng thi một đề.
