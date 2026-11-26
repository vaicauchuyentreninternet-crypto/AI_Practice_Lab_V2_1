# Bắt đầu với Codex

Nếu tiếp tục phát triển bằng Codex, hãy đọc `AGENTS.md` và `CODEX_HANDOFF_NEXT.md` trước. Đây là hướng dẫn hiện hành, ghi rõ phần đã xác minh, các thiếu sót, thứ tự xử lý, migration 001–006, cách giữ lịch sử và cách tiết kiệm token. `CODEX_DEPLOY.md` là lối vào cho bước GitHub Pages.

# AI Practice Lab

Phần 3 có thử thách tuần và bảng xếp hạng. Xem HANDOFF_PART_3.md để kích hoạt.
Bản V3 phần 2 bổ sung chữa bài theo đáp án và luyện tiếp theo chủ đề. Xem HANDOFF_PART_2.md cho kết quả kiểm thử và điểm bàn giao.

Bản V3 phần 1 bổ sung tài khoản sinh viên và đồng bộ. Xem HANDOFF_PART_1.md để cấu hình dịch vụ và nghiệm thu.
Phòng học AI cá nhân bằng tiếng Việt. Mở trên máy Windows bằng cách chạy START_WINDOWS.bat ở thư mục đã giải nén. Cần Python 3.10 trở lên. Trên macOS hoặc Linux chạy lệnh sau rồi mở http://localhost:8000.

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory site
```

## GitHub Pages

Đưa nội dung thư mục này vào nhánh main, gồm cả .github/workflows/pages.yml. Trong Settings → Pages → Build and deployment chọn GitHub Actions. Chọn Actions → Verify and deploy AI Practice Lab → Run workflow hoặc push lên main. Job verify kiểm tra dữ liệu, logic, dự án và trình duyệt trước khi deploy. Mở địa chỉ mà job deploy trả về. Bản bàn giao chưa xuất bản lên repository công khai.

## Kiến trúc

Giao diện HTML/CSS → router app.js → exam.js, learn.js, python.js, dataset.js → dữ liệu JSON theo module và IndexedDB. Trình chạy Python tải Pyodide 0.27.7 từ jsDelivr trong worker của iframe sandbox. Sau khi sẵn sàng, mỗi lần chạy có tối đa 8 giây. Trợ giảng dùng lời giải đã biên soạn, tùy chọn endpoint LLM tương thích Chat Completions. Người dùng tự điền endpoint và khóa cho phiên hiện tại.

IndexedDB lưu object store personal, khóa profile, gồm lịch sử, câu trả lời, bài đang làm, lịch ôn, bài đọc đã hoàn thành, bài code, bản nháp và kế hoạch. Một bản ghi phiên nhỏ trong localStorage hỗ trợ khôi phục khi tải lại nhanh. Hồ sơ phân biệt theo đường dẫn dự án. Cài đặt cho xuất và nhập JSON. Nên dùng một tab học cho cùng một hồ sơ.

## Nội dung và tính năng

800 câu gồm A 160, B 240, C 220, D 180. Có 18 bài đọc và 18 flashcard, 100 bài lập trình gồm 40 Python, 30 NumPy và 30 Pandas, 7 dự án nhỏ dùng mã nguồn Python. Bảng đơn hàng CSV là dữ liệu minh họa. Hai track dùng chung tiến độ. Chế độ thi mô phỏng có bốn module, 90 phút, 100 điểm, cấu hình trọng số, đánh dấu, lưu bài và phân tích kết quả. Cấu trúc luyện chi tiết và trọng số do ứng dụng đặt. Xem QA.md để biết giới hạn của bản bàn giao.

## Chạy kiểm thử

```sh
python -m pip install -r tests/requirements.txt
python -m playwright install chromium
python tests/content.py
python tests/knowledge.py
python site/projects/projects_test.py
node --test tests/engine.test.mjs
python tests/browser.py
```

Bộ kiểm thử dùng Python 3.12 và Node 22 trở lên. Browser suite cần internet để tải runtime Python. Site triển khai chỉ cần các file tĩnh trong site/.

## Hỏi học liệu và luyện tự luận

Từ Tổng quan chọn Hỏi học liệu hoặc Luyện tự luận. Tìm kiếm nguồn và tự đánh giá rubric hoạt động không cần dịch vụ AI. Để sử dụng mô hình, mở mục Kết nối mô hình, điền endpoint Chat Completions và tên model do bạn quản lý. Endpoint cần cho phép CORS từ địa chỉ app. Mỗi bài tự luận có bốn tiêu chí chấm từ 0 đến 2. Bản sao JSON bao gồm bài nháp và điểm tự đối chiếu. Kiểm tra trích nguyên văn xác nhận nguồn tồn tại; người đọc cần đối chiếu thêm xem kết luận có thật sự được nguồn hỗ trợ.

## Đề thi hỗn hợp
Thi thử, Practice Test, tạo đề từ ngân hàng và kiểm tra tổng kết dùng cấu hình điểm mặc định 90% khách quan, 10% tự luận của ứng dụng. VinUni chưa công bố tỷ trọng này trong tài liệu của dự án. Kết quả hiển thị Pending Review cho tới khi phần tự luận được chấm. Dữ liệu thi cũ dùng cấu trúc cũ.

Thi thử khóa điều hướng sang học liệu trong phiên. Trả lời đủ các phần và nộp đề để mở hướng dẫn từng câu. Mục Phân bổ độ khó cho phép chọn tỷ lệ phần trăm cho năm cấp, hệ thống báo khi ngân hàng đã lọc không đủ câu. Mã nguồn hiện dùng migration Supabase 001–006 cho môi trường mới.
