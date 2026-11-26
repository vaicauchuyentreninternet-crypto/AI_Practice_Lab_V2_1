# Biên bản kiểm thử · 26/11/2026
Điểm dưới đây là tự đánh giá mức sẵn sàng nghiệm thu trên 10. Các phần còn thiếu bằng chứng được giữ dưới 9,5.

| Tiêu chí | Điểm | Kết quả |
|---|---:|---|
| Tỷ trọng và tổng điểm | 9,5 | Test Node chạy 9 cấu hình, phân biệt null với 0 và kiểm tra tổng khi chấm đủ. |
| Nộp, khôi phục, chấm tự luận | 9,5 | Chrome thử đề 90 phút tại 390 px, tải lại, nộp, xác nhận rubric và kiểm tra tổng 10/100 khi bỏ trống trắc nghiệm. |
| Chấm trắc nghiệm | 9 | Test chọn nhiều phủ chọn thiếu, chọn dư, chọn đủ và bỏ chọn. Ngân hàng cũ vẫn có câu 3 lựa chọn. |
| Thử thách tuần | 8,5 | PostgreSQL WASM chạy migration 002–005 với auth thử, bắt đầu 45 phút, nộp đúng 20 câu, chờ chấm, cập nhật rubric và xác nhận hạng 100 điểm. Chưa thử OTP, quyền giảng viên và đồng bộ trên Supabase đích. |
| Tương thích lịch sử | 8 | Bài cũ đi nhánh chấm cũ. Cần chạy thử migration trên bản sao dữ liệu lớp đang hoạt động. |
| Cấu hình đề | 8 | Có số câu, mức độ, trọng số module cho mock, tổng điểm và thời gian trong cấu hình. Chưa có trình chỉnh phân bố phần trăm theo từng độ khó. |
| Motion, hai theme, truy cập | 7 | Có chuyển trang, reveal, count-up, chart và reduced motion. Chưa hoàn tất ma trận thiết bị, bàn phím, hai theme và giảm chuyển động. |
| Hiệu năng | Chưa chấm | Thiếu phép đo CPU, bộ nhớ và frame time khi chuyển trang liên tục trên thiết bị đích. |

python tests/release.py: đạt 10/10 nhóm. tests/browser.py và tests/corrections_browser.py đã gọi nhưng thiếu Chromium Headless Shell nên chưa chạy xong. Kiểm thử Chrome riêng chỉ xác nhận các luồng nêu trên.

## Cập nhật nghiệm thu ngân hàng
- 416 câu một đáp án trong A–D: 416/416 có 4 phương án phân biệt, 1 chỉ số đáp án, lời giải riêng và đạt bộ lọc độ dài từ (vượt đồng thời 6 từ và 1,8 lần trung vị của phương án nhiễu thì bị chặn). 384 câu trả lời xác định bằng cách nhập giữ cơ chế chấm riêng. Hai câu bổ sung gồm một câu nhiều đáp án và một câu đúng/sai.
- Soạn thêm 76 phương án thứ tư, sửa các nhiễu yếu trong nhóm đầu, chỉnh 12 bài logic cần cả nhận định và lập luận. Kiến thức nền và ví dụ được dùng chung theo nhóm chủ đề, lời giải ứng dụng lấy từ từng câu. Chưa có kết quả thí điểm phân tích tần suất chọn mỗi phương án nhiễu.
- Cấu hình cấp độ theo tỷ lệ: test làm tròn phân bổ, kiểm tra tổng, báo thiếu câu phù hợp. 
- Chrome trên bản thử: tuyến ngân hàng bị khóa trong thi thử, tải lại giữ bài viết, không hiện tiêu chí gợi ý, nộp đủ hai phần mới có lời giải. Nộp thiếu không dựng phần hướng dẫn.
- 30 chuyển trang và thao tác cuộn tại 390/768/1440 px với hai theme. Phát hiện và sửa bộ chọn tràn ngang trên điện thoại. Chạy lại đạt toàn bộ 6 tổ hợp. Thử nghiệm không đo CPU/RAM trên thiết bị đích.
- PostgreSQL WASM: chạy migration 002–006 trên dữ liệu thử mới và lớp đã có bài nộp. Kiểm tra 4 phương án của đề tuần, 45 phút, 90/10, giữ đề và điểm của tuần đang hoạt động. Chưa chạy trên Supabase staging thật.

## Kiểm toán độc lập gói Bank RC2 và hướng dẫn tiếp tục — 26/11/2026

Đã mở và kiểm tra `AI_Practice_Lab_Bank_RC2.zip`, đọc các file dữ liệu và mã chấm điểm, chạy lại các test cục bộ. Kết quả độc lập: `tests/release.py` 10/10; `tests/engine.test.mjs` 17/17; `site/projects/projects_test.py` 7/7; `tests/content.py`, `tests/knowledge.py` và `tests/bank_quality.py` đều PASS.

Phát hiện cấu trúc bank: 800 câu gồm 416 câu có bốn lựa chọn và 384 câu không có lựa chọn (160 câu số, 216 câu đọc code, 8 câu điền đáp án). 416 câu hiện có bốn `reasons`; 384 câu còn lại chỉ có một. `study-guide.js` vẫn cung cấp kiến thức nền theo nhóm chủ đề, chưa phải giải thích riêng đầy đủ cho từng câu. `B-T01` trong `extra-objectives.js` hiện chỉ có hai lựa chọn. Do đó, yêu cầu bốn phương án và giải thích cho người mới chưa hoàn tất.

Tương thích dữ liệu: session mới đang ghi `bankRevision: 2`; `legacy-options.json` chỉ chứa 76 câu cũ. Nếu đổi kiểu đáp án của 384 câu mà không tạo snapshot version 2 và cập nhật bộ chọn bank theo version, lịch sử cũ có thể hiển thị sai. Cần tăng revision và kiểm thử revision 1/2/3 cùng phiên đang làm.

Supabase/GitHub: migrations 001–006 có trong gói, nhưng workflow hiện chỉ kiểm thử migration 002. `CODEX_DEPLOY.md` cũ đã được thay bằng lối vào mới; phải bổ sung kiểm thử chuỗi migration đầy đủ và chạy trên Supabase staging trước production. `site/cloud-config.js` còn trống; ZIP không có Git remote hoặc URL production.

Browser E2E: đã thử chạy hai bộ Playwright trong môi trường kiểm toán; không thể xác minh do thiếu Chromium Headless Shell và trình duyệt bị chặn khi điều hướng localhost (`ERR_BLOCKED_BY_ADMINISTRATOR`). Không tính là PASS. PostgreSQL/Supabase staging không được chạy trong lượt kiểm toán này.

Hướng dẫn thực thi tiết kiệm token nằm trong `AGENTS.md` và `CODEX_HANDOFF_NEXT.md`. Không coi điểm tự đánh giá cũ là bằng chứng cho những phần chưa kiểm thử.

## Cập nhật triển khai Codex — 26/11/2026

- P0-A đang thực hiện, chưa hoàn tất: Tám batch chuyển A017–A160 và ba batch chuyển B017–B076. Module A đạt 160/160 câu bốn lựa chọn; tổng cộng 364/384 câu ban đầu đã chuyển thành câu 4 phương án, một khóa đúng, 4 lời giải theo từng phương án. Vị trí khóa đúng trong batch được cân bằng 0/1/2/3.
- `tests/bank_quality.py` hiện hỗ trợ chọn `--ids` hoặc `--module`, đọc UTF-8 và từ chối câu thiếu đúng bốn lựa chọn.
- Bằng chứng: `python tests/bank_quality.py --module A` PASS (160 câu, không có cờ độ dài); `node --test tests/engine.test.mjs` PASS (17/17).
- `python tests/content.py` PASS (800 records, 100 coding exercises, 200 reference cases) và `python tests/knowledge.py` PASS (216 code outputs, 144 numerical keys, 18 lesson snippets) sau khi cài tạm dependency vào workspace; thư mục dependency tạm đã được xóa.
- Còn 20 câu lõi thiếu lựa chọn cùng B-T01; chưa đánh giá đạt P0-A, P0-B hay mức 9,5/10. Tiến độ/bước kế tiếp nằm trong `CODEX_PROGRESS.md`.

- Đã tạo `site/data/revisions/2/` từ dữ liệu nguyên gốc trong ZIP đính kèm (A–D, 800 ID duy nhất, đúng số lượng từng module và `extra-objectives.js`), có manifest SHA-256 để chuẩn bị P0-C. Snapshot đã được kiểm tra độc lập.
- `B017–B236`: 220 câu đọc code đã chuyển; mọi batch có 4 phương án phân biệt, khóa đúng được đối chiếu với biểu thức tham chiếu.

## Trạng thái hiện tại sau lượt chạy tiếp

Đã chuyển đủ 384 câu lõi và B-T01. Bank có 800 câu lõi với bốn phương án. Đã sửa B029 để kết quả Python đứng đầu phương án và sửa khóa B227 để chọn đúng lập luận về năm nhuận. Bộ knowledge xác nhận 216 kết quả code, 144 khóa số và 18 ví dụ. Bộ release đạt 10/10 nhóm. Các số liệu tiến độ phía trên thuộc batch trước.

P0-A vẫn mở về chất lượng nội dung. Ví dụ A092 có hai phương án tương đương 2 và 2.000. Nhiều lời giải mới còn bằng tiếng Anh và vị trí khóa có mẫu lặp. Cần rà soát các lỗi này trước nghiệm thu. Tương thích phiên cũ, staging và phát hành chưa được xác minh.
