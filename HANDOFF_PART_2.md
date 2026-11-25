# AI Practice Lab V3 · Phần 2 — Chữa bài

Gói tích lũy gồm mã nguồn phần 1 và phần 2. Giải nén và chạy START_WINDOWS.bat hoặc dùng lệnh trong README.

## Cách thử

Vào Luyện thi, chọn Luyện tự chọn. Trả lời một câu, đánh dấu câu đó, để trống câu khác rồi nộp. Trong Kết quả của bạn, chọn Sai, Bỏ trống hoặc Đã đánh dấu. Mỗi câu giữ số thứ tự ban đầu. Mở câu để đối chiếu câu trả lời, đáp án và lời giải. Với trắc nghiệm sai, app giải thích riêng phương án đã chọn. Nút Luyện tiếp mở cấu hình bài tập cùng module và chủ đề.

Dữ liệu lịch sử mới lưu thêm thuộc tính flagged trên mỗi câu. Bài cũ vẫn xem được, kèm ghi chú khi thiếu dữ liệu đánh dấu. Không cần sửa bảng Supabase cho thay đổi này.

## Bằng chứng nghiệm thu

- python tests/release.py đã đạt 10/10 nhóm kiểm tra. Kiểm thử Node mới kiểm tra các bộ lọc, số thứ tự, lời giải từng lựa chọn, nhập văn bản và lịch sử cũ.
- Đã thao tác trên Chrome với bài thật 4 câu, chọn sai câu Python và đánh dấu, bỏ trống 3 câu rồi nộp. Kết quả hiển thị đúng các nhóm 1 sai, 3 bỏ trống, 1 đánh dấu. Tải lại vẫn đọc được lời giải lựa chọn sai. Bấm Luyện tiếp mở module B, chủ đề Python với 78 câu phù hợp.
- tests/corrections_browser.py bổ sung kịch bản cho GitHub Actions, gồm ba độ rộng màn hình. Phiên này chưa chạy được chính script đó vì thiếu Chromium cục bộ. Đã kiểm tra trực tiếp trên Chrome riêng như mô tả ở trên. Chưa có kết quả CI hoặc URL Pages cho bản này.

## Phiên kế tiếp

Nghiệm thu bố cục ở 390, 768 và 1440 px trên bản triển khai. Sau đó làm phần 3: thử thách chung theo tuần, chấm điểm phía máy chủ và xếp hạng sinh viên. Xem HANDOFF_PART_1.md để cấu hình tài khoản và kiểm tra đồng bộ trước khi mở cho lớp.
