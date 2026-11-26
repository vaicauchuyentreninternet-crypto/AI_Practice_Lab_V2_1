# Biên bản tự kiểm

Bản ứng viên phát hành. 10 lượt đánh giá kỹ thuật có thể tái chạy bằng python tests/release.py. Điểm dưới đây là tự đánh giá theo phạm vi master prompt, không lấy điểm trung bình thay cho ngưỡng từng mục.

| Hạng mục | Điểm / 10 | Bằng chứng và phần còn thiếu |
| --- | ---: | --- |
| Số lượng, phân bổ và cấu trúc dữ liệu | 10 | 800 ID, đủ A 160 / B 240 / C 220 / D 180. Kiểm tra câu trùng đã chuẩn hóa, đáp án, giải thích. |
| Chiều sâu và đa dạng ngân hàng | 8,6 | 216 đoạn đọc code đã chạy; 144 đáp án số đối chiếu tự động. Cần tăng bài đa lựa chọn, tự luận có rubric và thêm giải thích riêng cho từng phương án trong các nhóm tình huống. Bộ dò trùng chưa phát hiện đầy đủ trùng nghĩa. |
| Bài code và runtime | 9,5 | 100 lời giải, 200 ca chạy bằng Python; trình duyệt chạy thật ba bài đại diện Python, NumPy và Pandas, mỗi bài 2/2. Cần kết nối để tải Pyodide. |
| Thi thử và lưu bài | 9,0 | Trên trình duyệt đã xác nhận đồng hồ 90 phút, giữ câu trả lời sau reload, chấm 25/100 cho 1 đúng, 3 bỏ trống. Đã sửa journal cho thao tác đánh dấu, còn cần xác nhận trên bản Pages. Chưa kiểm thử hết giờ thực tế và nhiều tab cùng ghi. |
| Chương trình học và dự án | 8,0 | 18 bài, 18 flashcard, 7 project test pass. Hỏi đáp dùng truy xuất từ khóa và trích đoạn. Trợ lý dữ liệu dùng quy tắc. Cần bổ sung project nâng cao dùng mô hình và dataset thực tế. |
| Tiến độ, lịch ôn và kế hoạch | 8,8 | Đã kiểm tra chuyển trạng thái, tái học sau trả lời sai, mốc ngày Việt Nam. Giờ học hiện đo thời gian làm câu hỏi, chưa đo đầy đủ thời gian đọc và lập trình. |
| Dataset Lab | 9,0 | CSV có trích dẫn, xuống dòng, dữ liệu thiếu, lọc, gộp, ghép và xuất. Đã test parser, round trip, tệp sai định dạng. Cần nghiệm thu toàn bộ thao tác trên thiết bị cảm ứng. |
| Trợ giảng | 8,0 | Lời giải offline và adapter Chat Completions. Chưa xác nhận endpoint LLM thật có xác thực hoặc chấm tự luận nhất quán bằng rubric. |
| UI và tương tác | 9,0 | Kiểm tra trực quan desktop; dùng font, màu và liquid ink của file tham chiếu, hiệu ứng chạm, hỗ trợ giảm chuyển động. Cần kiểm tra thiết bị di động thật và Safari. |
| GitHub Pages | 9,0 | Kiểm tra đường dẫn con, gói tĩnh, workflow và tài liệu. Đã kèm suite trình duyệt 3 kích thước để chạy trong CI. Chưa push repository hoặc xác minh URL production. |

## Kết quả chạy

Mười kiểm tra release đều pass. Bên trong có 11 bài test Node, 7 bài test dự án Python, kiểm tra output của 18 ví dụ bài học, 216 đoạn đọc code, 144 đáp án số và 200 ca thực hành. Kiểm thử trình duyệt thủ công và kiểm tra nguồn là hai loại bằng chứng riêng. Bộ Playwright CI chưa chạy trên GitHub-hosted runner trong lần bàn giao này.


## Cập nhật vòng 2

Đã triển khai trang Hỏi học liệu với truy xuất BM25 trong 18 bài, hiển thị nguồn gốc, adapter sinh trả lời và kiểm tra đoạn trích nguyên văn. Trang Luyện tự luận có 4 đề, 16 tiêu chí, tự đối chiếu, lưu nháp và adapter đánh giá có dẫn chứng. Kiểm thử Chrome tìm đúng bài Broadcasting, mở được rubric và khôi phục bài sau refresh. Các test Node kiểm tra từ chối nguồn giả, trích dẫn sai, rubric thiếu và điểm thiếu bằng chứng.

Tự đánh giá trang truy xuất 9,0/10, luồng tự luận 9,0/10. Chưa đo độ nhất quán của mô hình thật trên tập bài được giáo viên chấm, chưa chạy production GitHub Actions, chưa nghiệm thu Safari và điện thoại thật. Bảng điểm bên trên là mốc của vòng trước. Điểm và bằng chứng mới chỉ cập nhật cho hai luồng vừa bổ sung.

## V3 phần 1

Đăng nhập và đồng bộ được bàn giao riêng trong HANDOFF_PART_1.md. Đã vượt 10 kiểm tra release, gồm kiểm thử logic đồng bộ với dịch vụ giả lập. Tự đánh giá phần tài khoản 8,5/10 cho đến khi có kết quả OTP/email, RLS và chuyển thiết bị với dịch vụ thật. Điểm của các phần V2 ở trên thuộc lần bàn giao trước.

## Kiểm tra bản nâng cấp 90/10
Xem QUALITY_REPORT.md cho kết quả chạy hiện tại. Điểm của các phiên trước không đại diện cho bản nâng cấp.

## Rà soát ngân hàng và khóa gợi ý
Chạy python tests/bank_quality.py để kiểm tra số phương án, trùng nội dung, khóa đáp án, lời giải mỗi phương án và cảnh báo độ dài đáp án đúng. Chạy python tests/release.py để kiểm tra chức năng và phần học lại của ngân hàng. Chỉ số độ dài là phép sàng lọc, không đo được chất lượng ngữ nghĩa của phương án nhiễu.
