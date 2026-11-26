begin;
create table apl_weekly.revised_options(id text primary key, options jsonb not null);
create table apl_weekly.options_cutover(first_week date not null);
lock table apl_weekly.starts, apl_weekly.entries in share row exclusive mode;
insert into apl_weekly.options_cutover
select apl_weekly.monday()+case when exists(select from apl_weekly.starts where week=apl_weekly.monday()) or exists(select from apl_weekly.entries where week=apl_weekly.monday()) then 7 else 0 end;
insert into apl_weekly.revised_options values
('A001','["50%", "20%", "26%", "28,9%"]'),
('A002','["28 phút", "1 phút", "3 phút", "2,8 phút"]'),
('A003','["9/108", "9/10", "9/1000", "99/108"]'),
('A004','["0", "3", "2", "1,5"]'),
('A005','["32×3", "5×3", "3×5", "5×32"]'),
('A006','["Độ lệch chuẩn", "Trung bình", "Trung vị", "Giá trị nhỏ nhất"]'),
('A007','["Tăng 5%", "Giảm 5%", "Bằng ban đầu", "Tăng 4%"]'),
('A008','["180°", "90°", "0°", "45°"]'),
('A009','["Sai lệch chọn mẫu", "Mẫu chắc chắn quá nhỏ", "Sai lệch do cách đặt câu hỏi", "Sai lệch do không phản hồi"]'),
('A010','["Mốc của nhóm chậm cũng giảm theo trung vị", "Nửa chậm nhất đều chậm hơn trước", "Đa số nhanh hơn trong khi đuôi chậm xấu đi", "Nhóm chậm nhất đã nhanh hơn"]'),
('A011','["0,02", "0,28", "0,30", "0,26"]'),
('A012','["5", "32", "6", "4"]'),
('B001','["[1]", "None", "[1, 2]", "[2]"]'),
('B002','["Danh sách được sao chép nông mỗi lần gọi", "Dữ liệu tích lũy giữa các lần gọi", "List mới được tạo mỗi lần gọi", "Danh sách được xóa khi hàm trả về"]'),
('B003','["[4, 6]", "[3, 7]", "10", "[[4, 6]]"]'),
('B004','["X - X.mean(axis=1)", "X - X.mean(axis=0)", "X - X.mean(axis=1, keepdims=True)", "X - X.mean()"]'),
('B005','["Khóa không khớp trong bảng tra cứu", "Khóa nối trùng phía bảng tra cứu", "Thứ tự các dòng sau khi nối", "Kiểm tra khóa bị thiếu ở phía đơn hàng trước"]'),
('B006','["df.iloc[0]", "df.loc[0]", "df[0]", "df.loc[:0]"]'),
('B007','["WHERE amount > 500", "WHERE SUM(amount) > 500", "HAVING SUM(amount) > 500", "HAVING AVG(amount) > 500"]'),
('B008','["CROSS JOIN", "customers LEFT JOIN orders", "customers INNER JOIN orders", "orders LEFT JOIN customers"]'),
('B009','["collections.deque.popleft()", "list.pop(0)", "set.pop()", "list.pop()"]'),
('B010','["Các khóa phải liên tiếp nhau", "Các giá trị phải cùng tần suất", "Dãy được sắp theo phép so sánh", "Các phần tử phải khác nhau"]'),
('B011','["[3]", "[]", "[0,1,2]", "[2]"]'),
('B012','["df.isna().mean()", "df.count()", "df.dropna()", "df.isna().sum()"]'),
('C001','["Accuracy toàn bộ", "Precision của lớp lỗi", "Recall lớp lỗi", "Precision của lớp tốt"]'),
('C002','["Thời gian kể từ khi đăng ký", "Ngày đóng tài khoản thực tế của tháng sau", "Số lần dùng tháng trước", "Số lần liên hệ hỗ trợ trước ngày dự báo"]'),
('C003','["Chunking, embedding và recall@20", "Đổi reranker cho 20 kết quả hiện tại", "Tối ưu prompt để trích đúng nguồn", "Tăng số token cho câu trả lời"]'),
('C004','["MAE", "Sai số tuyệt đối trung bình theo phần trăm", "MSE", "Sai số tuyệt đối trung vị"]'),
('C005','["Chạy mô hình mới trên bản ghi tuần trước", "Canary trên phần nhỏ lưu lượng kèm ngưỡng rollback", "Đổi toàn bộ lưu lượng rồi so sánh trước–sau", "So điểm kiểm thử của hai bản trước khi đưa vào chạy"]'),
('C006','["Bộ luật xác định với test biên", "Học bộ phân loại từ các quyết định cũ", "Truy xuất các quyết định hoàn tiền tương tự", "Cây quyết định học từ lịch sử hoàn tiền"]'),
('C007','["Chọn epoch có training loss nhỏ nhất", "Tối ưu trực tiếp trên test", "Early stopping dựa trên validation", "Chọn checkpoint có khoảng cách hai loss nhỏ nhất"]'),
('C008','["Vector chỉ báo từ xuất hiện", "Embedding ngữ nghĩa theo miền", "Vector số lần xuất hiện ký tự", "Vector tần suất từ đơn"]'),
('C009','["Yêu cầu phải chờ gom batch", "Giảm thời gian chờ để batch đầy hơn", "Tăng độ dài đầu ra của từng yêu cầu", "Số phép tính mỗi yêu cầu giảm về một nửa"]'),
('C010','["Kiểm tra cú pháp tham số lịch hẹn", "Thực thi rồi xin xác nhận", "Xác nhận đối tượng, quyền và tác động thay đổi", "Ghi log thay đổi sau khi cập nhật"]'),
('C011','["Dùng cùng tuần để train và test", "Huấn luyện trước, đánh giá sau theo thời gian", "Trộn toàn bộ ngày rồi chia", "Chia ngẫu nhiên theo mã đơn"]'),
('C012','["Mức độ bám bằng chứng", "Độ bao phủ tên tài liệu", "Chỉ ở định dạng trích dẫn", "Thiếu số lượng nguồn trích dẫn"]'),
('D001','["Mọi bản có biên bản đều được duyệt", "Bản đó có lỗi kỹ thuật", "Bản đó chưa được duyệt", "Bản đó đang chờ phê duyệt"]'),
('D002','["Bỏ mọi log ngay", "Giảm trường thu thập và đặt hạn lưu", "Ẩn tên nhưng giữ toàn văn vô hạn", "Mã hóa rồi lưu nguyên nội dung"]'),
('D003','["Đo lỗi gây hại trong từng nhóm", "So tỷ lệ dự đoán đúng toàn bộ", "So tỷ lệ hồ sơ bị từ chối", "Cân bằng số mẫu giữa các nhóm"]'),
('D004','["Chờ kỳ báo cáo sau", "Âm thầm sửa file duy nhất", "Báo ngay ảnh hưởng và đính chính", "Ghi chú trong báo cáo kỳ tới"]'),
('D005','["Giảm giá chắc chắn là nguyên nhân duy nhất", "Chưa tách được tác động riêng của màu nút", "Màu nút chắc chắn gây tăng trưởng", "Tăng trưởng chứng minh hai thay đổi cùng có tác dụng"]'),
('D006','["Nêu giới hạn, tra nguồn hiện hành hoặc chuyển người phụ trách", "Áp dụng bản gần nhất đã thuộc", "Đoán theo trường hợp phổ biến", "Trả lời theo chính sách phổ biến của ngành"]'),
('D007','["Báo cáo tổng lượt duyệt mỗi phút", "Hiển thị xác suất cạnh nút duyệt", "Khả năng giám sát và bác bỏ thực chất", "Thêm cảnh báo màu khi điểm tin cậy thấp"]'),
('D008','["Loại dữ liệu ngày cập nhật", "Đối chiếu sự kiện với giao dịch cùng giờ", "Đổi toàn bộ landing page", "So sánh lượt nhấp giữa hai tháng"]'),
('D009','["Thống nhất tiêu chí rồi kiểm tra các ca bất đồng cụ thể", "Chọn kết quả của tập có nhiều mẫu hơn", "Ưu tiên phản hồi thu được gần đây hơn", "Tăng kích thước tập kiểm thử hiện tại"]'),
('D010','["Cấp quyền chỉ đọc toàn bộ hồ sơ", "Cho xuất từng hồ sơ nhưng giới hạn số lượt", "Cấp quyền xem dữ liệu tổng hợp đúng nhu cầu", "Cấp dữ liệu chi tiết có che tên"]'),
('D011','["Độ phức tạp của phần mã cần sửa", "Hậu quả và khả năng phục hồi", "Thứ tự phát hiện duy nhất", "Tần suất xuất hiện trong lịch sử"]'),
('D012','["Phát hiện chủ đề trải nghiệm cần khảo sát thêm", "Ước tính tỷ lệ hài lòng toàn bộ", "Kết luận mọi phân khúc giống nhau", "Ước lượng tỷ lệ người dùng sẽ giới thiệu"]');
alter function apl_weekly.paper(date) rename to paper_original;
create function apl_weekly.paper(w date) returns setof apl_weekly.questions language sql stable set search_path='' as $$
 select q.id,q.prompt,case when w >= c.first_week then coalesce(r.options,q.options) else q.options end,q.answer
 from apl_weekly.paper_original(w) q cross join apl_weekly.options_cutover c left join apl_weekly.revised_options r on r.id=q.id
$$;
commit;
