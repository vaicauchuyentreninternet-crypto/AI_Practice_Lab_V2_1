begin;
create schema if not exists apl_weekly;
revoke all on schema apl_weekly from public, anon, authenticated;
create table if not exists apl_weekly.questions(id text primary key, prompt text not null, options jsonb not null, answer int not null);
create table if not exists apl_weekly.entries(week date not null, student uuid references auth.users on delete cascade, points int not null, alias bigint generated always as identity, primary key(week,student));
create or replace function apl_weekly.monday() returns date language sql stable as $$
 select date_trunc('week',now() at time zone 'Asia/Ho_Chi_Minh')::date
$$;
create or replace function apl_weekly.paper(w date) returns setof apl_weekly.questions language sql stable as $$
 select q.* from apl_weekly.questions q order by md5(w::text || q.id),q.id limit 5
$$;
create or replace function public.weekly_status() returns jsonb language sql security definer stable set search_path='' as $$
 select jsonb_build_object('week',w,'mine',(select points from apl_weekly.entries where week=w and student=auth.uid()),
 'questions',(select jsonb_agg(jsonb_build_object('id',id,'prompt',prompt,'options',options) order by id) from apl_weekly.paper(w)),
 'leaders',coalesce((select jsonb_agg(to_jsonb(t) order by t.points desc,t.alias) from
 (select alias,points,rank() over(order by points desc) as rank from apl_weekly.entries where week=w order by points desc,alias limit 10)t),'[]'::jsonb))
 from apl_weekly.monday() w
$$;
create or replace function public.weekly_submit(w date, answers jsonb) returns int language plpgsql security definer set search_path='' as $$
declare score int; valid int;
begin
 if auth.uid() is null or w is distinct from apl_weekly.monday() then raise exception 'Tuần thi hoặc phiên đăng nhập đã thay đổi'; end if;
 if jsonb_typeof(answers) is distinct from 'object' then raise exception 'Đáp án không hợp lệ'; end if;
 select count(*) filter(where exists(select 1 from generate_series(0,jsonb_array_length(q.options)-1) i where answers->q.id=to_jsonb(i))),
 count(*) filter(where answers->q.id=to_jsonb(q.answer)) into valid,score from apl_weekly.paper(w) q;
 if valid<>5 or (select count(*) from jsonb_object_keys(answers))<>5 then raise exception 'Cần trả lời đúng định dạng cả 5 câu'; end if;
 insert into apl_weekly.entries(week,student,points) values(w,auth.uid(),score) on conflict do nothing;
 select points into score from apl_weekly.entries where week=w and student=auth.uid();
 return score;
end $$;
revoke all on function public.weekly_submit(date,jsonb),public.weekly_status() from public,anon,authenticated;
grant execute on function public.weekly_status() to anon,authenticated;
grant execute on function public.weekly_submit(date,jsonb) to authenticated;
insert into apl_weekly.questions values
('A001','Hai nhóm có 8/10 và 18/90 người hoàn thành. Tỷ lệ hoàn thành chung là bao nhiêu?','["50%", "20%", "26%"]',2),
('A002','Một lần rà soát tốn 2 phút, phát hiện lỗi với xác suất 0,1 và mỗi lỗi sửa sớm tiết kiệm 30 phút. Kỳ vọng tiết kiệm ròng?','["28 phút", "1 phút", "3 phút"]',1),
('A003','Trong 1.000 mẫu có 10 lỗi. Bộ lọc báo đúng 9 lỗi và báo nhầm 99 mẫu tốt. Xác suất có lỗi khi bị báo?','["9/108", "9/10", "9/1000"]',0),
('A004','Với L(w)=(w−3)², tại w=1, bước gradient descent với tốc độ 0,25 đưa w đến đâu?','["0", "3", "2"]',2),
('A005','X có kích thước 32×5; cần đầu ra 32×3. Ma trận W trong XW có kích thước nào?','["32×3", "5×3", "3×5"]',1),
('A006','Tất cả thời gian phản hồi đều tăng đúng 20 ms. Đại lượng nào giữ nguyên?','["Độ lệch chuẩn", "Trung bình", "Trung vị"]',0),
('A007','Mức sử dụng giảm 20% rồi tăng 25% trên mức mới. So với ban đầu kết quả thế nào?','["Tăng 5%", "Giảm 5%", "Bằng ban đầu"]',2),
('A008','Hai embedding khác 0 có tích vô hướng bằng 0. Góc giữa chúng bằng bao nhiêu?','["180°", "90°", "0°"]',1),
('A009','Chỉ khảo sát người đã mua gói cao cấp để ước tính nhu cầu toàn bộ người dùng. Vấn đề chính là gì?','["Sai lệch chọn mẫu", "Mẫu chắc chắn quá nhỏ", "Sai số làm tròn"]',0),
('A010','Độ trễ trung vị giảm nhưng p99 tăng. Điều nào có thể xảy ra?','["Tất cả yêu cầu đều nhanh hơn", "Hai số liệu mâu thuẫn", "Đa số nhanh hơn trong khi đuôi chậm xấu đi"]',2),
('A011','Hai máy độc lập có xác suất dừng lần lượt 0,1 và 0,2. Xác suất ít nhất một máy dừng?','["0,02", "0,28", "0,30"]',1),
('A012','Lượng dữ liệu tăng gấp đôi mỗi tuần. Từ 3 GB lên 96 GB cần mấy tuần?','["5", "32", "6"]',0),
('B001','Sau a=[1]; b=a; b.append(2), a bằng gì?','["[1]", "None", "[1, 2]"]',2),
('B002','Điều gì xảy ra với danh sách mặc định trong def add(x, buf=[]), nếu hàm append x vào buf và được gọi nhiều lần không truyền buf?','["Python cấm list mặc định", "Dữ liệu tích lũy giữa các lần gọi", "List mới được tạo mỗi lần gọi"]',1),
('B003','Với a=np.array([[1,2],[3,4]]), a.sum(axis=0).tolist() cho kết quả nào?','["[4, 6]", "[3, 7]", "10"]',0),
('B004','Muốn trừ trung bình riêng của mỗi hàng trong X có shape (12,5). Biểu thức phù hợp?','["X - X.mean(axis=1)", "X - X.mean(axis=0)", "X - X.mean(axis=1, keepdims=True)"]',2),
('B005','Sau left merge, bảng đơn hàng tăng từ 100 lên 120 dòng. Nên kiểm tra gì trước?','["Kiểu ngày ở cột không dùng nối", "Khóa nối trùng phía bảng tra cứu", "Thiếu index liên tục"]',1),
('B006','DataFrame có index [10,20,30]. Cách lấy hàng đầu tiên theo vị trí?','["df.iloc[0]", "df.loc[0]", "df[0]"]',0),
('B007','Muốn lấy nhóm khách có tổng chi tiêu trên 500 sau GROUP BY. Đặt điều kiện ở đâu?','["WHERE amount > 500", "ORDER BY amount", "HAVING SUM(amount) > 500"]',2),
('B008','Cần giữ tất cả khách hàng kể cả người chưa mua khi ghép với orders. Phép nối phù hợp?','["CROSS JOIN", "customers LEFT JOIN orders", "customers INNER JOIN orders"]',1),
('B009','Hàng đợi xử lý ticket theo thứ tự đến. Với Python nên dùng gì để lấy đầu hàng hiệu quả?','["collections.deque.popleft()", "list.pop(0)", "set.pop()"]',0),
('B010','Binary search không tìm thấy giá trị dù có trong danh sách chưa sắp. Điều kiện nào bị vi phạm?','["Dãy phải dài chẵn", "Dãy phải gồm số dương", "Dãy phải có thứ tự phù hợp với phép so sánh"]',2),
('B011','g=(i for i in range(3)); list(g); list(g) lần thứ hai trả gì?','["[3]", "[]", "[0,1,2]"]',1),
('B012','Tính tỷ lệ thiếu của từng cột bằng cách nào?','["df.isna().mean()", "df.count()", "df.dropna()"]',0),
('C001','Có 990 giao dịch tốt và 10 giao dịch lỗi. Máy luôn báo tốt đạt 99% accuracy. Chỉ số nào cho thấy bỏ sót hết lỗi?','["Accuracy toàn bộ", "Thời gian dự đoán", "Recall lớp lỗi"]',2),
('C002','Dự báo khách rời dịch vụ tháng sau. Cột nào phải loại trước khi huấn luyện?','["Thời gian kể từ khi đăng ký", "Ngày đóng tài khoản thực tế của tháng sau", "Số lần dùng tháng trước"]',1),
('C003','Tài liệu đúng chưa từng xuất hiện trong top 20 truy xuất. Nên kiểm tra gì trước khi đổi LLM?','["Chunking, embedding và recall@20", "Chỉ tăng độ dài trả lời", "Chỉ đổi giọng văn"]',0),
('C004','Sai số dự báo doanh số lớn hiếm gặp gây chi phí cao. Chỉ số nào phạt mạnh các sai số lớn?','["MAE", "Accuracy", "MSE"]',2),
('C005','Cần giảm rủi ro khi thay model phục vụ. Cách kiểm nghiệm trực tuyến phù hợp?','["Chỉ xem loss huấn luyện", "Canary trên phần nhỏ lưu lượng kèm ngưỡng rollback", "Thay 100% rồi mới đặt metric"]',1),
('C006','Quy tắc hoàn tiền có bốn điều kiện xác định và phải giải thích được. Baseline thích hợp?','["Bộ luật xác định với test biên", "Huấn luyện LLM từ đầu", "Chọn ngẫu nhiên để giảm thiên lệch"]',0),
('C007','Training loss giảm còn validation loss tăng qua nhiều epoch. Can thiệp đầu tiên có cơ sở?','["Chọn epoch có training loss nhỏ nhất", "Tối ưu trực tiếp trên test", "Early stopping dựa trên validation"]',2),
('C008','Cần tìm bình luận có nghĩa gần nhau dù khác từ. Biểu diễn phù hợp?','["ID bản ghi", "Embedding ngữ nghĩa đã đánh giá trên miền dữ liệu", "Độ dài bình luận"]',1),
('C009','Batch lớn hơn tăng throughput nhưng p95 latency tăng. Lý do nào hợp lý?','["Yêu cầu phải chờ gom batch", "Throughput và latency luôn nghịch đảo chính xác", "Model chắc chắn kém chính xác hơn"]',0),
('C010','Trợ lý muốn ghi đè lịch hẹn của khách. Bước nào cần đặt trước lời gọi công cụ?','["Chỉ tăng temperature", "Thực thi rồi xin xác nhận", "Xác nhận đối tượng, quyền và tác động thay đổi"]',2),
('C011','Dự báo lượng đơn tuần sau. Cách chia validation phù hợp nhất?','["Dùng cùng tuần để train và test", "Train trên quá khứ và đánh giá trên giai đoạn sau", "Trộn toàn bộ ngày rồi chia"]',1),
('C012','Câu trả lời RAG có trích dẫn đúng tên tài liệu nhưng tài liệu không hỗ trợ kết luận. Đang lỗi ở đâu?','["Mức độ bám bằng chứng", "Chỉ ở tốc độ retrieval", "Chỉ ở định dạng trích dẫn"]',0),
('D001','Mọi bản phát hành được duyệt đều có biên bản. Một bản không có biên bản. Kết luận nào tất yếu?','["Mọi bản có biên bản đều được duyệt", "Bản đó có lỗi kỹ thuật", "Bản đó chưa được duyệt"]',2),
('D002','Báo cáo lỗi chỉ cần mã phiên và thời điểm. Log hiện lưu cả tin nhắn khách. Thay đổi phù hợp nhất?','["Bỏ mọi log ngay", "Giữ trường tối thiểu cần cho chẩn đoán và quy định thời gian lưu", "Ẩn tên nhưng giữ toàn văn vô hạn"]',1),
('D003','Hai nhóm có accuracy ngang nhau nhưng một nhóm bị từ chối nhầm nhiều hơn. Phân tích nên làm gì?','["So sánh tỷ lệ lỗi liên quan đến tác hại theo nhóm", "Công bố đã công bằng", "Xóa tên nhóm khỏi báo cáo"]',0),
('D004','Sau khi gửi báo cáo, bạn phát hiện sai mẫu số ảnh hưởng quyết định sắp tới. Ưu tiên nào phù hợp?','["Chờ kỳ báo cáo sau", "Âm thầm sửa file duy nhất", "Báo sớm phạm vi ảnh hưởng rồi gửi bản sửa có đối chiếu"]',2),
('D005','Sau khi đổi màu nút, doanh thu tăng cùng lúc với đợt giảm giá. Kết luận đúng nhất?','["Giảm giá chắc chắn là nguyên nhân duy nhất", "Chưa tách được tác động riêng của màu nút", "Màu nút chắc chắn gây tăng trưởng"]',1),
('D006','Chatbot không biết chính sách mới nhưng khách cần quyết định ngay. Nên phản hồi thế nào?','["Nêu giới hạn, tra nguồn hiện hành hoặc chuyển người phụ trách", "Đưa chính sách cũ như chắc chắn", "Đoán theo trường hợp phổ biến"]',0),
('D007','Nhân viên phải duyệt 300 dự đoán/phút và chỉ có nút đồng ý. Điều gì thiếu?','["Một nhãn giao diện mới", "Một model lớn hơn", "Khả năng giám sát và bác bỏ thực chất"]',2),
('D008','Conversion giảm sau cập nhật tracking. Bước đầu có giá trị thông tin cao nhất?','["Loại dữ liệu ngày cập nhật", "Đối chiếu sự kiện với giao dịch nguồn theo cùng khoảng giờ", "Đổi toàn bộ landing page"]',1),
('D009','Hai người bất đồng vì metric offline và phản hồi thực tế trái ngược. Nên làm gì?','["Thống nhất tiêu chí rồi kiểm tra các ca bất đồng cụ thể", "Để người thâm niên quyết định mọi vấn đề", "Lấy trung bình hai ý kiến"]',0),
('D010','Một quản lý cần xem thống kê tuần nhưng được cấp toàn bộ bản ghi cá nhân. Cấu hình phù hợp?','["Gửi bản sao đầy đủ qua email", "Cho dùng tài khoản admin chung", "Cấp quyền xem dữ liệu tổng hợp đúng nhu cầu"]',2),
('D011','Hai lỗi có cùng xác suất xảy ra. Một lỗi chỉ đổi màu nút, lỗi kia gửi nhầm hồ sơ khách. Ưu tiên theo yếu tố nào?','["Số dòng code liên quan", "Hậu quả và khả năng phục hồi", "Thứ tự phát hiện duy nhất"]',1),
('D012','Có 50 lời khen được chọn từ người dùng tích cực. Có thể dùng để làm gì?','["Phát hiện chủ đề trải nghiệm cần khảo sát thêm", "Ước tính tỷ lệ hài lòng toàn bộ", "Kết luận mọi phân khúc giống nhau"]',0) on conflict do nothing;
commit;
