/* =========================================================
   CẤU HÌNH CHUNG — Tiếng Trung Diệu Kỳ
   QM_API: địa chỉ Web app của Apps Script "máy chủ điểm" (kết thúc bằng /exec).
   Để trống thì trang Bài tập vẫn làm được, chỉ là không lưu điểm; Bảng xếp hạng báo "chưa nối".
   ========================================================= */
window.QM_API = 'https://script.google.com/macros/s/AKfycbx4bur__9sJBrGVRg_ujUFVysIigjffKQkMFnW1cvF4V1PwN9J43yicQEDmxFmLdQK9tA/exec';

/* Máy chủ TÀI KHOẢN (đăng nhập Google, hồ sơ, tiến độ, lượt truy cập) — Apps Script riêng, quy chuẩn 12.
   QM_TK_API: địa chỉ …/exec của máy chủ tài khoản. QM_GOOGLE_CLIENT_ID: mã ứng dụng OAuth (…apps.googleusercontent.com).
   Để trống cả hai: web chạy như cũ (không có nút đăng nhập; trạng thái từng phần vẫn lưu trên máy).
   Chỉ điền QM_TK_API: đếm lượt truy cập, chưa có đăng nhập. */
window.QM_TK_API = 'https://script.google.com/macros/s/AKfycbyG-GAzZtfnWdmRwJAzY5-FKruv1Bc1BXDQOcL8mYMkR_9sgF8ldfGzANWFeda5-wO6/exec';
window.QM_GOOGLE_CLIENT_ID = '652937304012-h7ijvhl27vkt0ffkkk1q5kt18tu5l7va.apps.googleusercontent.com';
