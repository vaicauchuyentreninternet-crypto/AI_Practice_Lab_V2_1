export const extraObjectives=[
 {id:'C-M01',module:'C',topic:'Đánh giá',level:3,seconds:90,type:'Chọn nhiều',prompt:'Một bộ phân loại bỏ sót khách hàng đủ điều kiện. Chọn đủ hai phép đo giúp xác định nhóm nào bị bỏ sót nhiều hơn.',options:['Tỷ lệ âm giả theo nhóm','Số người thực sự đủ điều kiện theo nhóm','Độ chính xác chung của cả bộ dữ liệu','Tổng số người được duyệt trên toàn bộ mẫu'],key:'0,1',reasons:['Tỷ lệ âm giả đo phần người đủ điều kiện nhưng bị từ chối trong từng nhóm.','Mẫu số nhỏ làm tỷ lệ dễ dao động. Cần biết mỗi nhóm có bao nhiêu người đủ điều kiện.','Điểm chung có thể che khuất chênh lệch giữa các nhóm.','Tổng duyệt không cho biết những người bị bỏ sót thuộc nhóm nào.']},
 {id:'B-T01',module:'B',topic:'Dữ liệu',level:2,seconds:60,type:'Đúng / Sai',prompt:'Một LEFT JOIN có thể làm tăng số dòng ngay cả khi bảng bên trái có khóa duy nhất.',options:['Đúng','Sai'],key:0,reasons:['Một dòng bên trái khớp hai dòng bên phải sẽ xuất hiện hai lần.','Khóa duy nhất bên trái không giới hạn số bản ghi khớp ở bảng phải.']}
];
export function toggleChoice(value,index){
 const picked=new Set(value===-1?[]:String(value).split(',').map(Number));
 if(picked.has(index))picked.delete(index);else picked.add(index);
 return [...picked].sort((a,b)=>a-b).join(',')||-1;
}
