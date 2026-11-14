/* =========================================================
   MÁY CHỦ TÀI KHOẢN — Tiếng Trung Diệu Kỳ (奇妙汉语)
   Đăng nhập Google · Hồ sơ học sinh · Tiến độ học · Lượt truy cập
   · (2026-11-04a) Lớp học · Mở bài theo lớp · Giao bài · Trang giáo viên.
   Chạy trên một Google Sheet RIÊNG, tách hẳn khỏi máy chủ điểm (quy chuẩn 12).

   CÀI ĐẶT (làm một lần):
   1. Tạo Google Sheet mới → Tiện ích mở rộng → Apps Script → dán toàn bộ file này → Lưu.
   2. Cài đặt dự án (bánh răng) → Thuộc tính tập lệnh → Thêm:
        CLIENT_ID = mã ứng dụng OAuth của web (…apps.googleusercontent.com)
        GIAO_VIEN = (tuỳ chọn) email giáo viên, nhiều email cách nhau dấu phẩy. Bỏ trống: chỉ GV_MAC_DINH bên dưới.
      (Khoá BI_MAT để ký phiên đăng nhập sẽ TỰ TẠO ở lần chạy đầu, không cần điền.)
   3. Chọn hàm "caiDat" ở thanh trên → Chạy → cấp quyền. Hàm tạo sẵn các trang tính.
   4. Triển khai → Triển khai mới → Loại: Ứng dụng web · Thực thi: Tôi · Truy cập: Bất kỳ ai → Triển khai.
      Chép địa chỉ …/exec gửi bên soạn (điền vào assets/js/cau-hinh.js, QM_TK_API).
   SỬA MÃ: dán lại, lưu, Triển khai → Quản lý các bản triển khai → bút chì → Phiên bản mới → Triển khai.
      (Giữ nguyên địa chỉ /exec. Sau khi dán bản 2026-11-04a nhớ chạy "caiDat" một lần để thêm trang tính mới.)

   2026-10-30a: đồng bộ thêm "luotDo" — lượt làm dở (Ôn tập tổng hợp…) để học sinh làm tiếp trên máy khác.
   2026-11-04a: lớp học có MÃ LỚP (học sinh nhập mã khi tạo / sửa hồ sơ), cô mở dần từng bài cho từng lớp,
     giao phần bài kèm hạn nộp; trang giáo viên đọc dữ liệu qua các lệnh gv… (chỉ email giáo viên mới gọi được).
   2026-11-04b: cô tự thêm học sinh vào lớp — xếp em đã có hồ sơ (gvChuyenLop) hoặc NHẬP TRƯỚC EMAIL (trang MoiLop):
     email đã có hồ sơ thì xếp vào lớp ngay; chưa có thì chờ, em đăng nhập lần đầu được điền sẵn họ tên + mã lớp.
   2026-11-04c: TIN NHẮN cho cô (xin mở bài, báo lỗi) — ai cũng gửi được (chưa đăng nhập thì ghi họ tên + cách liên hệ),
     cô trả lời trên trang giáo viên, em đã đăng nhập xem câu trả lời trong bảng tài khoản. Mở bài nhận mọi mục của cấp
     (vd "hsk1/on-tap-1-5", "hsk1/tro-choi"), không chỉ bài.
   2026-11-04d: nhanh hơn — lưu tiến độ ghi đè tại chỗ (không xoá / thêm dòng mỗi lần), bảng TrangThai thêm dòng một lượt,
     đọc trang tính gọn hơn; giữ khoá ghi ngắn hơn nên thao tác của cô ít phải xếp hàng sau học sinh.
   2026-11-04e: PHIÊN CHƠI (trò chơi cá nhân): cô tạo phiên trên trang giáo viên → mã 5 số + QR; học sinh đăng nhập,
     nhập / quét mã, chơi trò cô chọn (bài, mức cố định); điện thoại báo tiến trình vài giây một lần, cô xem trực tiếp.
     Trang PhienChoi lưu danh sách phiên; tiến trình để trong bộ nhớ đệm (6 giờ). Điểm vẫn gửi máy chủ điểm như cũ.
     Sau khi dán bản này nhớ chạy "caiDat" một lần để thêm trang tính PhienChoi.
   2026-11-05a: BÀI KIỂM TRA (Kiểm tra Bài 1–5…): đề + đáp án lưu ở trang KiemTraDe (không nằm trong mã web công khai),
     học sinh chỉ nhận đề khi lớp được giao "<mục>/bai-kiem-tra" và đang trong khung giờ; máy chủ giữ giờ, tự lưu bài,
     chấm khi nộp / hết giờ; cô chấm tay câu dịch, cho làm lại, công bố đáp án. Nhớ chạy "caiDat" một lần (thêm KiemTraDe,
     KiemTraBai, KiemTraCongBo).
   2026-11-14b: SỬA NỘI DUNG BÀI HỌC từ trang giáo viên (tab Bộ câu hỏi): chỗ cô sửa lưu ở trang NoiDungSua, web học sinh chồng lên tệp data/*.json khi tải.
     Lệnh mới: noiDungSua (ai cũng đọc được — là nội dung bài), gvSuaNoiDung (chỉ giáo viên). Nhớ chạy "caiDat" để tạo trang NoiDungSua.
   2026-11-14a: BUỔI HỌC TRÊN LỚP (Phòng lớp): cô bấm Kết thúc buổi → lưu bộ câu hỏi + đáp án đúng + (chỉ cô thấy) ai trả lời gì vào trang BuoiHoc;
     học sinh của lớp xem lại câu hỏi + đáp án đúng trong tài khoản. Lệnh mới: gvLuuBuoiHoc, gvDsBuoiHoc, buoiHocCuaToi.
     Trang tính BuoiHoc tự tạo khi dùng lần đầu (chạy "caiDat" cũng được).
   ========================================================= */

var PHIEN_BAN = '2026-11-14b';
var GV_MAC_DINH = 'heran9895@gmail.com';   // giáo viên mặc định khi chưa khai GIAO_VIEN
var NGAY_PHIEN = 30;                       // phiên đăng nhập giữ 30 ngày
var TU_MOI_DONG = 300;                     // tiến độ từng từ: chia nhiều ô, mỗi ô tối đa 300 từ (ô Sheet tối đa 50.000 ký tự)
var HAN_LUOT_DO = 14 * 864e5;              // lượt làm dở giữ tối đa 14 ngày
var TOI_DA_O = 45000;                      // một ô Sheet tối đa 50.000 ký tự
var GIAO_HIEN_NGAY = 45;                   // học sinh thấy bài được giao trong 45 ngày sau hạn nộp
var HAN_PHIEN = 21600;                     // phiên chơi: tiến trình giữ trong bộ nhớ đệm 6 giờ (tối đa của CacheService)

var TRANG = {
  Users:     ['sub', 'email', 'hoTen', 'anh', 'taoLuc', 'lanCuoi'],
  HoSo:      ['hoSoId', 'sub', 'email', 'hoTenHocSinh', 'lop', 'dongY', 'dongYLuc', 'taoLuc', 'maLop'],
  Progress:  ['sub', 'hoSoId', 'khoa', 'duLieu', 'capNhatLuc'],
  TrangThai: ['hoSoId', 'hoTenHocSinh', 'lop', 'phan', 'tenPhan', 'trangThai', 'capNhatLuc'],
  Visits:    ['thoiDiem', 'trang', 'sub', 'hoSoId', 'maPhien', 'thietBi'],
  Lop:       ['maLop', 'tenLop', 'ghiChu', 'taoLuc', 'dong'],
  MoBai:     ['maLop', 'bai', 'tenBai', 'moLuc'],
  GiaoBai:   ['maGiao', 'maDot', 'maLop', 'phan', 'tenPhan', 'batDau', 'hanNop', 'ghiChu', 'taoLuc'],
  MoiLop:    ['email', 'hoTen', 'maLop', 'taoLuc', 'daNhan'],
  TinNhan:   ['maTin', 'thoiDiem', 'loai', 'noiDung', 'trang', 'muc', 'hoTen', 'lienHe', 'email', 'sub', 'hoSoId', 'maLop', 'trangThai', 'traLoi', 'traLoiLuc'],
  KiemTraDe: ['maDe', 'phienBan', 'luuLuc', 'json1', 'json2', 'json3', 'json4', 'nguoiLuu'],
  KiemTraBai: ['maDe', 'hoSoId', 'sub', 'hoTenHocSinh', 'lop', 'maLop', 'maDot', 'batDauLuc', 'hetGioLuc', 'nopLuc', 'traLoi', 'nghe', 'chamTay', 'tong', 'trangThai', 'thietBi'],
  KiemTraCongBo: ['maDe', 'maLop', 'luc'],
  NoiDungSua: ['tep', 'duongDan', 'goc', 'moi', 'suaLuc', 'nguoi'],
  BuoiHoc:   ['maBuoi', 'taoLuc', 'maLop', 'tieuDe', 'phan', 'soCau', 'json'],
  PhienChoi: ['maPhien', 'taoLuc', 'maLop', 'tro', 'tenTro', 'tenBai', 'muc', 'lesson', 'trang', 'ketThucLuc', 'ghiChu', 'bai']
};

// ---------------- Cài đặt ----------------
function caiDat() {
  Object.keys(TRANG).forEach(function (ten) { trang(ten); });
  biMat();
  var p = PropertiesService.getScriptProperties().getProperty('CLIENT_ID');
  Logger.log(p ? 'Đã có CLIENT_ID.' : 'CHƯA có CLIENT_ID: vào Cài đặt dự án → Thuộc tính tập lệnh để thêm.');
  Logger.log('Giáo viên: ' + dsGiaoVien().join(', '));
}
function biMat() {
  var pr = PropertiesService.getScriptProperties(), k = pr.getProperty('BI_MAT');
  if (!k) { k = Utilities.getUuid() + Utilities.getUuid(); pr.setProperty('BI_MAT', k); }
  return k;
}
var DA_KIEM_COT = {};
function trang(ten) {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(ten), cot = TRANG[ten];
  if (!sh) sh = ss.insertSheet(ten);
  if (sh.getLastRow() === 0) { sh.appendRow(cot); sh.setFrozenRows(1); sh.getRange(1, 1, 1, cot.length).setFontWeight('bold'); }
  else if (!DA_KIEM_COT[ten]) {             // bản cũ thiếu cột mới (vd HoSo.maLop): thêm tiêu đề vào cuối
    var n = sh.getLastColumn();
    if (n < cot.length) sh.getRange(1, n + 1, 1, cot.length - n).setValues([cot.slice(n)]).setFontWeight('bold');
  }
  DA_KIEM_COT[ten] = true;
  return sh;
}
function bang(ten) {                        // mọi dòng dữ liệu, đủ số cột (ô thiếu = '') — một lần đọc cả trang tính
  var w = TRANG[ten].length;
  return trang(ten).getDataRange().getValues().slice(1).map(function (r) { while (r.length < w) r.push(''); return r; });
}

// ---------------- Cổng vào ----------------
function doGet(e) {
  return traVe({ ok: true, ten: 'Máy chủ tài khoản Tiếng Trung Diệu Kỳ', phienBan: PHIEN_BAN,
    coClientId: !!PropertiesService.getScriptProperties().getProperty('CLIENT_ID') });
}
function doPost(e) {
  var d;
  try { d = JSON.parse(e.postData.contents); } catch (x) { return traVe({ ok: false, loi: 'Dữ liệu gửi lên không đọc được' }); }
  try {
    switch (d.action) {
      case 'dangNhap':   return traVe(dangNhap(d));
      case 'taoHoSo':    return traVe(coKhoa(function () { return taoHoSo(xacPhien(d), d); }));
      case 'suaHoSo':    return traVe(coKhoa(function () { return suaHoSo(xacPhien(d), d); }));
      case 'xoaHoSo':    return traVe(coKhoa(function () { return xoaHoSo(xacPhien(d), d); }));
      case 'dsHoSo':     return traVe({ ok: true, hoSo: dsHoSo(xacPhien(d).sub) });
      case 'layTienDo':  return traVe(layTienDo(xacPhien(d), d));
      case 'luuTienDo':  return traVe(coKhoa(function () { return luuTienDo(xacPhien(d), d); }));
      case 'truyCap':    return traVe(truyCap(d));
      case 'xoaTaiKhoan':return traVe(coKhoa(function () { return xoaTaiKhoan(xacPhien(d)); }));
      case 'kiemMaLop':  xacPhien(d); return traVe(kiemMaLop(d.maLop));
      case 'lopCuaToi':  return traVe(lopCuaToi(xacPhien(d), d));
      // ----- giáo viên -----
      case 'gvDuLieu':   return traVe(gvDuLieu(xacGV(d)));
      case 'gvLuuLop':   return traVe(coKhoa(function () { return gvLuuLop(xacGV(d), d); }));
      case 'gvChuyenLop':return traVe(coKhoa(function () { return gvChuyenLop(xacGV(d), d); }));
      case 'gvMoBai':    return traVe(coKhoa(function () { return gvMoBai(xacGV(d), d); }));
      case 'gvGiaoBai':  return traVe(coKhoa(function () { return gvGiaoBai(xacGV(d), d); }));
      case 'gvSuaGiao':  return traVe(coKhoa(function () { return gvSuaGiao(xacGV(d), d); }));
      case 'gvXoaGiao':  return traVe(coKhoa(function () { return gvXoaGiao(xacGV(d), d); }));
      case 'guiTin':     return traVe(coKhoa(function () { return guiTin(d); }));
      case 'tinCuaToi':  return traVe(tinCuaToi(xacPhien(d)));
      case 'gvTraLoi':   return traVe(coKhoa(function () { return gvTraLoi(xacGV(d), d); }));
      case 'gvMoiLop':   return traVe(coKhoa(function () { return gvMoiLop(xacGV(d), d); }));
      case 'gvXoaMoi':   return traVe(coKhoa(function () { return gvXoaMoi(xacGV(d), d); }));
      // ----- phiên chơi (2026-11-04e) -----
      case 'gvTaoPhien': return traVe(coKhoa(function () { return gvTaoPhien(xacGV(d), d); }));
      case 'gvXemPhien': return traVe(gvXemPhien(xacGV(d), d));
      case 'gvKetThucPhien': return traVe(coKhoa(function () { return gvKetThucPhien(xacGV(d), d); }));
      case 'vaoPhien':   return traVe(vaoPhien(xacPhien(d), d));
      case 'baoPhien':   return traVe(baoPhien(d));
      // ----- bài kiểm tra (2026-11-05a) -----
      case 'ktXem':      return traVe(ktXem(xacPhien(d), d, false));
      case 'ktBatDau':   return traVe(ktXem(xacPhien(d), d, true));
      case 'ktLuu':      return traVe(coKhoa(function () { return ktLuuHoacNop(xacPhien(d), d, false); }));
      case 'ktNop':      return traVe(coKhoa(function () { return ktLuuHoacNop(xacPhien(d), d, true); }));
      case 'gvKtDe':     return traVe(coKhoa(function () { return gvKtDe(xacGV(d), d); }));
      case 'gvKtBang':   return traVe(gvKtBang(xacGV(d), d));
      case 'gvKtCham':   return traVe(coKhoa(function () { return gvKtCham(xacGV(d), d); }));
      case 'gvKtLamLai': return traVe(coKhoa(function () { return gvKtLamLai(xacGV(d), d); }));
      case 'gvKtCongBo': return traVe(coKhoa(function () { return gvKtCongBo(xacGV(d), d); }));
      case 'noiDungSua':   return traVe(ndsDoc(d.tep));
      case 'gvSuaNoiDung': return traVe(coKhoa(function () { return gvSuaNoiDung(xacGV(d), d); }));
      case 'gvLuuBuoiHoc': return traVe(coKhoa(function () { return gvLuuBuoiHoc(xacGV(d), d); }));
      case 'gvDsBuoiHoc':  xacGV(d); return traVe(buoiHocDs(d.maLop, true));
      case 'buoiHocCuaToi': { var p0 = xacPhien(d), hs0 = hoSoCua(p0, d.hoSoId); return traVe(buoiHocDs(hs0.maLop, false)); }
      default:           return traVe({ ok: false, loi: 'Lệnh không hợp lệ: ' + d.action });
    }
  } catch (x) {
    return traVe({ ok: false, loi: x.message || String(x), hetPhien: !!x.hetPhien, khongPhaiGV: !!x.khongPhaiGV });
  }
}
function traVe(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function coKhoa(f) {                       // nhiều em gửi cùng lúc: xếp hàng ghi, không mất dòng
  var k = LockService.getScriptLock(); k.waitLock(20000);
  try { return f(); } finally { SpreadsheetApp.flush(); k.releaseLock(); }   // ghi xong hẳn rồi mới nhả khoá
}
function ms(x) { return x instanceof Date ? x.getTime() : (+x || (x ? new Date(x).getTime() : 0) || 0); }

// ---------------- Đăng nhập ----------------
// Thẻ định danh do trình duyệt gửi lên PHẢI được kiểm tra lại với Google: đúng ứng dụng (aud), đúng nơi cấp (iss), còn hạn, email đã xác minh.
function kiemTheGoogle(idToken) {
  var clientId = PropertiesService.getScriptProperties().getProperty('CLIENT_ID');
  if (!clientId) throw new Error('Máy chủ chưa khai CLIENT_ID');
  var r = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken), { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error('Google không xác nhận thẻ đăng nhập');
  var t = JSON.parse(r.getContentText());
  if (t.aud !== clientId) throw new Error('Thẻ đăng nhập không dành cho web này');
  if (t.iss !== 'accounts.google.com' && t.iss !== 'https://accounts.google.com') throw new Error('Thẻ đăng nhập không do Google cấp');
  if (+t.exp * 1000 < Date.now()) throw new Error('Thẻ đăng nhập đã hết hạn, bạn đăng nhập lại nhé');
  if (String(t.email_verified) !== 'true') throw new Error('Email Google chưa được xác minh');
  return { sub: t.sub, email: t.email, hoTen: t.name || '', anh: t.picture || '' };
}
function dangNhap(d) {
  var g = kiemTheGoogle(d.idToken), bayGio = new Date();
  coKhoa(function () {
    var sh = trang('Users'), v = sh.getDataRange().getValues(), dong = -1;
    for (var i = 1; i < v.length; i++) if (String(v[i][0]) === g.sub) { dong = i + 1; break; }
    if (dong < 0) sh.appendRow([g.sub, g.email, g.hoTen, g.anh, bayGio, bayGio]);
    else sh.getRange(dong, 2, 1, 5).setValues([[g.email, g.hoTen, g.anh, v[dong - 1][4], bayGio]]);
  });
  return { ok: true, phien: kyPhien(g.sub), nguoiDung: { email: g.email, hoTen: g.hoTen, anh: g.anh },
    hoSo: dsHoSo(g.sub), giaoVien: laGiaoVien(g.email), moi: loiMoiCho(g.email) };
}
// Phiên đăng nhập của web: "sub.hạn.chữ-ký" (HMAC-SHA256 với khoá BI_MAT) — không cần lưu phiên trong Sheet
function kyPhien(sub) {
  var het = Date.now() + NGAY_PHIEN * 864e5, noiDung = sub + '.' + het;
  return noiDung + '.' + chuKy(noiDung);
}
function chuKy(s) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(s, biMat())).replace(/=+$/, ''); }
function xacPhien(d) {
  var p = String(d.phien || '').split('.');
  var loi = function (m) { var x = new Error(m); x.hetPhien = true; return x; };
  if (p.length !== 3 || chuKy(p[0] + '.' + p[1]) !== p[2]) throw loi('Phiên đăng nhập không hợp lệ, bạn đăng nhập lại nhé');
  if (+p[1] < Date.now()) throw loi('Phiên đăng nhập đã hết hạn, bạn đăng nhập lại nhé');
  return { sub: p[0] };
}

// ---------------- Giáo viên ----------------
function dsGiaoVien() {
  var s = PropertiesService.getScriptProperties().getProperty('GIAO_VIEN') || GV_MAC_DINH;
  return s.split(/[,;\s]+/).map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean);
}
function laGiaoVien(email) { return dsGiaoVien().indexOf(String(email || '').toLowerCase()) >= 0; }
function xacGV(d) {                        // phiên hợp lệ VÀ email của phiên nằm trong danh sách giáo viên
  var p = xacPhien(d), C = CacheService.getScriptCache(), email = C.get('gv:' + p.sub);   // nhớ 10 phút: trang theo dõi phiên chơi gọi liên tục
  if (!email) { email = emailCua(p.sub); if (email) C.put('gv:' + p.sub, email, 600); }
  if (!laGiaoVien(email)) { var x = new Error('Tài khoản này không phải tài khoản giáo viên'); x.khongPhaiGV = true; throw x; }
  p.email = email;
  return p;
}

// ---------------- Lớp học ----------------
function chuanMa(s) { return String(s || '').toUpperCase().replace(/\s+/g, '').slice(0, 16); }
function dsLop() {
  return bang('Lop').map(function (r) { return { maLop: String(r[0]), tenLop: String(r[1]), ghiChu: String(r[2]), taoLuc: ms(r[3]), dong: String(r[4]) === 'có' }; })
    .filter(function (l) { return l.maLop; });
}
function lopTheoMa(ma) { ma = chuanMa(ma); return dsLop().filter(function (l) { return l.maLop === ma; })[0] || null; }
function kiemMaLop(ma) {
  var l = lopTheoMa(ma);
  if (!l || l.dong) return { ok: false, loi: 'Mã lớp không đúng hoặc lớp đã đóng. Bạn hỏi lại cô mã lớp nhé.' };
  return { ok: true, maLop: l.maLop, tenLop: l.tenLop };
}
function moBaiCua(maLop) {
  return bang('MoBai').filter(function (r) { return String(r[0]) === maLop; }).map(function (r) { return String(r[1]); });
}
function giaoBaiCua(maLop, tatCa) {
  var bayGio = Date.now();
  return bang('GiaoBai').filter(function (r) { return String(r[2]) === maLop && (tatCa || ms(r[6]) + GIAO_HIEN_NGAY * 864e5 > bayGio); })
    .map(function (r) { return { maGiao: String(r[0]), maDot: String(r[1]), maLop: String(r[2]), phan: String(r[3]), tenPhan: String(r[4]),
      batDau: ms(r[5]), hanNop: ms(r[6]), ghiChu: String(r[7]), taoLuc: ms(r[8]) }; });
}
function thongTinLop(maLop) {
  var l = maLop ? lopTheoMa(maLop) : null;
  if (!l) return null;
  var bayGio = Date.now();
  return { maLop: l.maLop, tenLop: l.tenLop, dong: l.dong, moBai: moBaiCua(l.maLop),
    giaoBai: giaoBaiCua(l.maLop).filter(function (g) { return !g.batDau || g.batDau <= bayGio; }) };
}
function lopCuaToi(p, d) { var hs = hoSoCua(p, d.hoSoId); return { ok: true, lop: thongTinLop(hs.maLop) }; }

// ---------------- Hồ sơ học sinh (một email có thể có nhiều hồ sơ) ----------------
function dsHoSo(sub) {
  var v = bang('HoSo'), kq = [];
  for (var i = 0; i < v.length; i++) if (String(v[i][1]) === sub) kq.push({ hoSoId: String(v[i][0]), hoTen: String(v[i][3]), lop: String(v[i][4]), maLop: String(v[i][8] || '') });
  return kq;
}
function gon(s, n) { return String(s || '').replace(/\s+/g, ' ').trim().slice(0, n); }
function lopTuHoSo(d) {                    // có mã lớp: lớp = tên lớp của cô (đồng nhất để lọc); không mã: lớp tự ghi
  if (chuanMa(d.maLop)) {
    var k = kiemMaLop(d.maLop); if (!k.ok) throw new Error(k.loi);
    return { lop: k.tenLop, maLop: k.maLop };
  }
  var lop = gon(d.lop, 40); if (!lop) throw new Error('Cần điền lớp hoặc mã lớp cô đưa');
  return { lop: lop, maLop: '' };
}
function taoHoSo(p, d) {
  var hoTen = gon(d.hoTen, 80);
  if (!hoTen) throw new Error('Cần điền họ tên');
  var L = lopTuHoSo(d);
  if (d.dongY !== true) throw new Error('Cần xác nhận đồng ý trước khi tạo hồ sơ');
  if (dsHoSo(p.sub).length >= 10) throw new Error('Mỗi tài khoản tối đa 10 hồ sơ');
  var email = emailCua(p.sub), id = 'hs-' + Utilities.getUuid().slice(0, 8), bayGio = new Date();
  trang('HoSo').appendRow([id, p.sub, email, hoTen, L.lop, 'có', bayGio, bayGio, L.maLop]);
  if (L.maLop) danhDauDaNhan(email, L.maLop, id);
  return { ok: true, hoSoId: id, hoSo: dsHoSo(p.sub), lop: thongTinLop(L.maLop) };
}
function suaHoSo(p, d) {
  var hoTen = gon(d.hoTen, 80);
  if (!hoTen) throw new Error('Cần điền họ tên');
  var L = lopTuHoSo(d);
  var sh = trang('HoSo'), v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (String(v[i][0]) === d.hoSoId && String(v[i][1]) === p.sub) {
    sh.getRange(i + 1, 4, 1, 2).setValues([[hoTen, L.lop]]);
    sh.getRange(i + 1, 9).setValue(L.maLop);
    doiTenTrangThai(d.hoSoId, hoTen, L.lop);
    return { ok: true, hoSo: dsHoSo(p.sub), lop: thongTinLop(L.maLop) };
  }
  throw new Error('Không tìm thấy hồ sơ');
}
function doiTenTrangThai(hoSoId, hoTen, lop) {   // đổi tên / lớp: sửa luôn các dòng TrangThai cũ cho đồng nhất
  var sh = trang('TrangThai'), v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (String(v[i][0]) === hoSoId && (v[i][1] !== hoTen || v[i][2] !== lop)) sh.getRange(i + 1, 2, 1, 2).setValues([[hoTen, lop]]);
}
function xoaHoSo(p, d) {
  xoaDong('HoSo', function (r) { return String(r[0]) === d.hoSoId && String(r[1]) === p.sub; });
  xoaDong('Progress', function (r) { return String(r[1]) === d.hoSoId && String(r[0]) === p.sub; });
  xoaDong('TrangThai', function (r) { return String(r[0]) === d.hoSoId; });
  return { ok: true, hoSo: dsHoSo(p.sub) };
}
function xoaTaiKhoan(p) {                  // quyền xoá dữ liệu: bỏ hết mọi dòng của tài khoản này
  var ids = dsHoSo(p.sub).map(function (h) { return h.hoSoId; });
  xoaDong('TrangThai', function (r) { return ids.indexOf(String(r[0])) >= 0; });
  xoaDong('Progress', function (r) { return String(r[0]) === p.sub; });
  xoaDong('HoSo', function (r) { return String(r[1]) === p.sub; });
  anDanhVisits(p.sub);                     // lượt truy cập: giữ số lượt để thống kê, chỉ xoá danh tính (tài khoản, hồ sơ)
  xoaDong('Users', function (r) { return String(r[0]) === p.sub; });
  return { ok: true };
}
function xoaDong(ten, khop) {
  var sh = trang(ten), v = sh.getDataRange().getValues();
  for (var i = v.length - 1; i >= 1; i--) if (khop(v[i])) sh.deleteRow(i + 1);
}
function anDanhVisits(sub) {
  var sh = trang('Visits'), v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (String(v[i][2]) === sub) sh.getRange(i + 1, 3, 1, 2).setValues([['', '']]);
}
function emailCua(sub) {
  var v = bang('Users');
  for (var i = 0; i < v.length; i++) if (String(v[i][0]) === sub) return String(v[i][1]);
  return '';
}
function hoSoCua(p, hoSoId) {
  var ds = dsHoSo(p.sub);
  for (var i = 0; i < ds.length; i++) if (ds[i].hoSoId === hoSoId) return ds[i];
  throw new Error('Hồ sơ không thuộc tài khoản này');
}

// ---------------- Buổi học trên lớp (Phòng lớp) ----------------
// cau[] = { n, kieu, de, dapAn, giai?, cacDap?[], goi?: [{ten, chon, dung}] }  — "goi" (ai trả lời gì) chỉ trả cho giáo viên.
// ---- Sửa nội dung bài học (2026-11-14b) ----
// Mỗi dòng: tệp (vd bai/bai-5.json) · đường dẫn tới câu (vd cauLuyen/3) · bản gốc (JSON) · bản mới (JSON, hoặc "__xoa" = ẩn câu)
function ndsTep(t) { return String(t || '').replace(/[^a-zA-Z0-9\/._-]/g, '').slice(0, 80); }
function ndsDoc(ds) {
  var C = CacheService.getScriptCache(), kq = {}, can = [];
  [].concat(ds || []).slice(0, 12).forEach(function (t) {
    t = ndsTep(t); if (!t) return;
    var s = C.get('nds:' + t); if (s) kq[t] = JSON.parse(s); else { can.push(t); kq[t] = {}; }
  });
  if (can.length) {
    bang('NoiDungSua').forEach(function (r) {
      var t = String(r[0]); if (can.indexOf(t) < 0 || r[3] === '') return;
      kq[t][String(r[1])] = { m: String(r[3]), g: String(r[2]) };
    });
    can.forEach(function (t) { var s = JSON.stringify(kq[t]); if (s.length < 90000) C.put('nds:' + t, s, 21600); });
  }
  return { ok: true, sua: kq, bayGio: Date.now() };
}
function gvSuaNoiDung(gv, d) {
  var tep = ndsTep(d.tep), dd = String(d.duongDan || '').slice(0, 300);
  if (!/^[a-z0-9\/._-]+\.json$/.test(tep) || !dd) throw new Error('Thiếu tệp hoặc vị trí câu');
  var moi = d.moi == null ? '' : String(d.moi);
  if (moi.length > TOI_DA_O || String(d.goc || '').length > TOI_DA_O) throw new Error('Nội dung quá dài');
  if (moi && moi !== '__xoa') JSON.parse(moi);                       // phải là JSON hợp lệ
  var sh = trang('NoiDungSua'), v = sh.getDataRange().getValues(), dong = -1;
  for (var i = 1; i < v.length; i++) if (String(v[i][0]) === tep && String(v[i][1]) === dd) { dong = i + 1; break; }
  if (!moi) { if (dong > 0) sh.deleteRow(dong); }                    // khôi phục bản gốc = bỏ dòng sửa
  else if (dong > 0) sh.getRange(dong, 3, 1, 4).setValues([[String(d.goc || ''), moi, new Date(), gv.email]]);
  else sh.appendRow([tep, dd, String(d.goc || ''), moi, new Date(), gv.email]);
  CacheService.getScriptCache().remove('nds:' + tep);
  return ndsDoc([tep]);
}

function gvLuuBuoiHoc(gv, d) {
  var maLop = chuanMa(d.maLop);
  if (!maLop || !lopTheoMa(maLop)) throw new Error('Chưa chọn lớp hợp lệ');
  var cau = Array.isArray(d.cau) ? d.cau.slice(0, 80) : [];
  if (!cau.length) throw new Error('Buổi học chưa có câu nào');
  var js = JSON.stringify(cau);
  while (js.length > TOI_DA_O && cau.length > 1) { cau.pop(); js = JSON.stringify(cau); }   // ô Sheet tối đa 50.000 ký tự
  var ma = 'bh' + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36);
  trang('BuoiHoc').appendRow([ma, new Date(), maLop, gon(d.tieuDe, 120), gon(d.phan, 120), cau.length, js]);
  return { ok: true, maBuoi: ma, soCau: cau.length };
}
function buoiHocDs(maLop, laGV) {
  maLop = chuanMa(maLop);
  if (!maLop) return { ok: true, buoi: [] };
  var ds = bang('BuoiHoc').filter(function (r) { return r[0] && String(r[2]) === maLop; })
    .sort(function (a, b) { return ms(b[1]) - ms(a[1]); }).slice(0, 30).map(function (r) {
      var cau = []; try { cau = JSON.parse(r[6] || '[]'); } catch (e) {}
      if (!laGV) cau = cau.map(function (c) { delete c.goi; return c; });                // học sinh không thấy ai làm gì
      return { maBuoi: String(r[0]), taoLuc: ms(r[1]), maLop: String(r[2]), tieuDe: String(r[3]), phan: String(r[4]), soCau: +r[5] || cau.length, cau: cau };
    });
  return { ok: true, buoi: ds };
}

// ---------------- Tiến độ học ----------------
// duLieu = { tu: {mã: {h,d,s,c,t}}, kho: {mã: cấp}, phan: {"hsk1/bai-3/tu-vung": {tt, t, ten, url, xem?}},
//            luotDo: {"on-tap-1-5/ngu-phap": {t, ten, url, tom, du} | {t, xoa:true}} }
// Trộn: mỗi từ / mỗi phần / mỗi lượt dở lấy bản có thời điểm mới hơn; từ khó gộp cả hai bên; phần "xong" không bao giờ lùi về "đang học".
function docTienDo(sub, hoSoId, v) {
  v = v || trang('Progress').getDataRange().getValues();
  var kq = { tu: {}, kho: {}, phan: {}, luotDo: {} };
  for (var i = 1; i < v.length; i++) {
    if (String(v[i][0]) !== sub || String(v[i][1]) !== hoSoId) continue;
    var khoa = String(v[i][2]), o = {};
    try { o = JSON.parse(v[i][3] || '{}'); } catch (x) {}
    if (khoa.indexOf('tu:') === 0) Object.keys(o).forEach(function (k) { kq.tu[k] = o[k]; });
    else if (khoa === 'kho') kq.kho = o;
    else if (khoa === 'phan') kq.phan = o;
    else if (khoa === 'luotDo') kq.luotDo = o;
  }
  return kq;
}
function tron(a, b) {
  var kq = { tu: {}, kho: {}, phan: {}, luotDo: {} };
  [a.tu || {}, b.tu || {}].forEach(function (m) { Object.keys(m).forEach(function (k) {
    if (!kq.tu[k] || (+m[k].t || 0) > (+kq.tu[k].t || 0)) kq.tu[k] = m[k]; }); });
  [a.kho || {}, b.kho || {}].forEach(function (m) { Object.keys(m).forEach(function (k) { kq.kho[k] = m[k]; }); });
  [a.phan || {}, b.phan || {}].forEach(function (m) { Object.keys(m).forEach(function (k) {
    var cu = kq.phan[k], moi = m[k];
    if (!cu) { kq.phan[k] = moi; return; }
    var xem = (cu.xem || []).concat(moi.xem || []).filter(function (x, i, s) { return s.indexOf(x) === i; });
    var hon = (+moi.t || 0) > (+cu.t || 0) ? moi : cu;
    kq.phan[k] = { tt: cu.tt === 'xong' || moi.tt === 'xong' ? 'xong' : hon.tt, t: Math.max(+cu.t || 0, +moi.t || 0), ten: hon.ten || cu.ten, url: hon.url || cu.url };
    if (xem.length) kq.phan[k].xem = xem;
  }); });
  var bayGio = Date.now();
  [a.luotDo || {}, b.luotDo || {}].forEach(function (m) { Object.keys(m).forEach(function (k) {
    var x = m[k]; if (!x || bayGio - (+x.t || 0) > HAN_LUOT_DO || String(k).length > 80) return;
    if (!kq.luotDo[k] || (+x.t || 0) > (+kq.luotDo[k].t || 0)) kq.luotDo[k] = x;
  }); });
  return kq;
}
function gonLuotDo(ld) {                   // giữ vừa một ô: quá dài thì bỏ dấu xoá cũ trước, rồi đến lượt dở cũ nhất
  var ds = Object.keys(ld).sort(function (x, y) { return (ld[x].xoa ? 0 : 1) - (ld[y].xoa ? 0 : 1) || (+ld[x].t || 0) - (+ld[y].t || 0); });
  while (ds.length && JSON.stringify(ld).length > TOI_DA_O) delete ld[ds.shift()];
  return ld;
}
function layTienDo(p, d) { hoSoCua(p, d.hoSoId); return { ok: true, duLieu: docTienDo(p.sub, d.hoSoId) }; }
function luuTienDo(p, d) {
  var hs = hoSoCua(p, d.hoSoId), sh = trang('Progress'), v = sh.getDataRange().getValues();
  var cu = docTienDo(p.sub, d.hoSoId, v), moi = tron(cu, d.duLieu || {}), bayGio = new Date();
  moi.luotDo = gonLuotDo(moi.luotDo);
  var dong = [];
  var ma = Object.keys(moi.tu).sort();
  for (var i = 0; i < ma.length; i += TU_MOI_DONG) {
    var o = {}; ma.slice(i, i + TU_MOI_DONG).forEach(function (k) { o[k] = moi.tu[k]; });
    dong.push([p.sub, d.hoSoId, 'tu:' + (i / TU_MOI_DONG), JSON.stringify(o), bayGio]);
  }
  dong.push([p.sub, d.hoSoId, 'kho', JSON.stringify(moi.kho), bayGio]);
  dong.push([p.sub, d.hoSoId, 'phan', JSON.stringify(moi.phan), bayGio]);
  dong.push([p.sub, d.hoSoId, 'luotDo', JSON.stringify(moi.luotDo), bayGio]);
  // Ghi đè tại chỗ khi các dòng cũ của hồ sơ nằm liền nhau và đủ số dòng (trường hợp thường gặp): một lệnh ghi, không xoá dòng
  var cuDong = [];
  for (var j = 1; j < v.length; j++) if (String(v[j][0]) === p.sub && String(v[j][1]) === d.hoSoId) cuDong.push(j + 1);
  var lienNhau = cuDong.length && cuDong[cuDong.length - 1] - cuDong[0] === cuDong.length - 1;
  if (lienNhau && cuDong.length >= dong.length) {
    while (dong.length < cuDong.length) dong.push([p.sub, d.hoSoId, 'trong', '{}', bayGio]);   // dòng thừa: đánh dấu trống (docTienDo bỏ qua)
    sh.getRange(cuDong[0], 1, dong.length, 5).setValues(dong);
  } else {
    for (var k = cuDong.length - 1; k >= 0; k--) sh.deleteRow(cuDong[k]);
    sh.getRange(sh.getLastRow() + 1, 1, dong.length, 5).setValues(dong);
  }
  ghiTrangThai(hs, moi.phan);
  return { ok: true, duLieu: moi, lop: thongTinLop(hs.maLop) };   // kèm thông tin lớp: bài đã mở, bài được giao
}
// Trang tính TrangThai: bảng dễ đọc cho giáo viên — em nào, phần nào, xong hay đang học, lúc nào
function ghiTrangThai(hs, phan) {
  var sh = trang('TrangThai'), v = sh.getDataRange().getValues(), co = {}, them = [];
  for (var i = 1; i < v.length; i++) if (String(v[i][0]) === hs.hoSoId) co[String(v[i][3])] = i + 1;
  Object.keys(phan).forEach(function (k) {
    var x = phan[k], dong = [hs.hoSoId, hs.hoTen, hs.lop, k, x.ten || k, x.tt === 'xong' ? 'xong' : 'đang học', new Date(+x.t || Date.now())];
    if (co[k]) { var cu = v[co[k] - 1]; if (cu[5] !== dong[5] || cu[1] !== dong[1] || cu[2] !== dong[2]) sh.getRange(co[k], 1, 1, 7).setValues([dong]); }
    else them.push(dong);
  });
  if (them.length) sh.getRange(sh.getLastRow() + 1, 1, them.length, 7).setValues(them);   // phần mới: thêm một lượt
}

// ---------------- Lượt truy cập: mỗi lần mở trang một dòng ----------------
function truyCap(d) {
  var sub = '';
  if (d.phien) try { sub = xacPhien(d).sub; } catch (x) {}
  trang('Visits').appendRow([new Date(), gon(d.trang, 200), sub, gon(d.hoSoId, 20), gon(d.maPhien, 40), gon(d.thietBi, 20)]);
  return { ok: true };
}

// =====================================================================
// TRANG GIÁO VIÊN (2026-11-04a) — mọi lệnh gv… đều qua xacGV
// =====================================================================
function gvDuLieu(gv) {
  var users = {};
  bang('Users').forEach(function (r) { users[String(r[0])] = { email: String(r[1]), lanCuoi: ms(r[5]) }; });
  var hocSinh = bang('HoSo').filter(function (r) { return r[0]; }).map(function (r) {
    var u = users[String(r[1])] || {};
    return { hoSoId: String(r[0]), email: String(r[2] || u.email || ''), hoTen: String(r[3]), lop: String(r[4]), maLop: String(r[8] || ''),
      taoLuc: ms(r[7]), dangNhapLuc: u.lanCuoi || 0 };
  });
  var trangThai = bang('TrangThai').filter(function (r) { return r[0]; }).map(function (r) {
    return { hoSoId: String(r[0]), phan: String(r[3]), tenPhan: String(r[4]), tt: String(r[5]) === 'xong' ? 'xong' : 'dang-hoc', t: ms(r[6]) };
  });
  var moBai = bang('MoBai').filter(function (r) { return r[0]; }).map(function (r) { return { maLop: String(r[0]), bai: String(r[1]), tenBai: String(r[2]), moLuc: ms(r[3]) }; });
  var giaoBai = bang('GiaoBai').filter(function (r) { return r[0]; }).map(function (r) {
    return { maGiao: String(r[0]), maDot: String(r[1]), maLop: String(r[2]), phan: String(r[3]), tenPhan: String(r[4]),
      batDau: ms(r[5]), hanNop: ms(r[6]), ghiChu: String(r[7]), taoLuc: ms(r[8]) };
  });
  var moiLop = bang('MoiLop').filter(function (r) { return r[0]; }).map(function (r) { return { email: String(r[0]), hoTen: String(r[1]), maLop: String(r[2]), taoLuc: ms(r[3]), daNhan: String(r[4] || '') }; });
  return { ok: true, phienBan: PHIEN_BAN, gv: gv.email, bayGio: Date.now(), lop: dsLop(), hocSinh: hocSinh, trangThai: trangThai, moBai: moBai, giaoBai: giaoBai, moiLop: moiLop, tinNhan: dsTin(function () { return true; }, 300),
    phienChoi: dsPhien().slice(0, 40) };
}
function taoMaLop() {
  var chu = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', co = {};
  dsLop().forEach(function (l) { co[l.maLop] = 1; });
  for (var lan = 0; lan < 50; lan++) {
    var m = ''; for (var i = 0; i < 6; i++) m += chu.charAt(Math.floor(Math.random() * chu.length));
    if (!co[m]) return m;
  }
  throw new Error('Không tạo được mã lớp, thử lại');
}
// Tạo lớp (không có maLop) hoặc sửa tên / ghi chú / đóng-mở lớp (có maLop)
function gvLuuLop(gv, d) {
  var ten = gon(d.tenLop, 40), ghiChu = gon(d.ghiChu, 200), sh = trang('Lop');
  if (!d.maLop) {
    if (!ten) throw new Error('Cần đặt tên lớp');
    if (dsLop().some(function (l) { return l.tenLop.toLowerCase() === ten.toLowerCase(); })) throw new Error('Đã có lớp tên "' + ten + '"');
    var ma = chuanMa(d.maMoi) || taoMaLop();
    if (!/^[A-Z0-9-]{3,16}$/.test(ma)) throw new Error('Mã lớp chỉ gồm chữ không dấu, số, gạch ngang (3–16 ký tự)');
    if (lopTheoMa(ma)) throw new Error('Mã lớp ' + ma + ' đã có');
    sh.appendRow([ma, ten, ghiChu, new Date(), '']);
    return { ok: true, maLop: ma, lop: dsLop() };
  }
  var v = sh.getDataRange().getValues(), maL = chuanMa(d.maLop);
  for (var i = 1; i < v.length; i++) if (String(v[i][0]) === maL) {
    var tenCu = String(v[i][1]);
    if (ten && ten !== tenCu && dsLop().some(function (l) { return l.maLop !== maL && l.tenLop.toLowerCase() === ten.toLowerCase(); })) throw new Error('Đã có lớp tên "' + ten + '"');
    sh.getRange(i + 1, 2, 1, 2).setValues([[ten || tenCu, d.ghiChu == null ? v[i][2] : ghiChu]]);
    if (d.dong != null) sh.getRange(i + 1, 5).setValue(d.dong ? 'có' : '');
    if (ten && ten !== tenCu) {             // đổi tên lớp: hồ sơ trong lớp đổi theo (điểm nộp từ nay mang tên mới)
      var hs = trang('HoSo'), hv = hs.getDataRange().getValues();
      for (var j = 1; j < hv.length; j++) if (String(hv[j][8] || '') === maL) { hs.getRange(j + 1, 5).setValue(ten); doiTenTrangThai(String(hv[j][0]), String(hv[j][3]), ten); }
    }
    return { ok: true, maLop: maL, lop: dsLop() };
  }
  throw new Error('Không tìm thấy lớp ' + maL);
}
// Chuyển học sinh sang lớp khác (maLop rỗng: bỏ khỏi lớp, giữ tên lớp cũ dạng tự ghi)
function gvChuyenLop(gv, d) {
  var ids = [].concat(d.hoSoId || []), maL = chuanMa(d.maLop), l = maL ? lopTheoMa(maL) : null;
  if (maL && !l) throw new Error('Không tìm thấy lớp ' + maL);
  var sh = trang('HoSo'), v = sh.getDataRange().getValues(), n = 0;
  for (var i = 1; i < v.length; i++) if (ids.indexOf(String(v[i][0])) >= 0) {
    var lopMoi = l ? l.tenLop : String(v[i][4]);
    sh.getRange(i + 1, 5).setValue(lopMoi); sh.getRange(i + 1, 9).setValue(l ? l.maLop : '');
    doiTenTrangThai(String(v[i][0]), String(v[i][3]), lopMoi); n++;
  }
  return { ok: true, soHs: n };
}
// Mở / khoá bài cho một lớp. bai: khoá mục của cấp ("hsk1/bai-3", "h2/hsk1/bai-1-2", "hsk1/on-tap-1-5", "hsk1/tro-choi")
function gvMoBai(gv, d) {
  var maL = chuanMa(d.maLop); if (!lopTheoMa(maL)) throw new Error('Không tìm thấy lớp ' + maL);
  var ds = [].concat(d.bai || []).map(function (b) { return String(b).slice(0, 60); }).filter(function (b) { return /^(h2\/)?hsk[0-9-]+\/[a-z0-9-]+$/.test(b); });
  var ten = d.tenBai || {};
  if (d.mo) {
    var co = moBaiCua(maL), them = ds.filter(function (b) { return co.indexOf(b) < 0; }).map(function (b) { return [maL, b, gon(ten[b], 120), new Date()]; });
    if (them.length) trang('MoBai').getRange(trang('MoBai').getLastRow() + 1, 1, them.length, 4).setValues(them);
  } else xoaDong('MoBai', function (r) { return String(r[0]) === maL && ds.indexOf(String(r[1])) >= 0; });
  return { ok: true, moBai: moBaiCua(maL) };
}
// Giao bài: nhiều phần × nhiều lớp trong một đợt. Phần thuộc bài chưa mở thì tự mở bài đó cho lớp.
function gvGiaoBai(gv, d) {
  var lops = [].concat(d.maLop || []).map(chuanMa), phans = [].concat(d.phan || []);
  if (!lops.length) throw new Error('Chưa chọn lớp');
  if (!phans.length) throw new Error('Chưa chọn bài');
  lops.forEach(function (m) { if (!lopTheoMa(m)) throw new Error('Không tìm thấy lớp ' + m); });
  var batDau = +d.batDau || Date.now(), han = +d.hanNop || 0;
  if (!han) throw new Error('Chưa đặt hạn nộp');
  if (han <= batDau) throw new Error('Hạn nộp phải sau giờ bắt đầu');
  var dot = 'd-' + Utilities.getUuid().slice(0, 8), bayGio = new Date(), dong = [], moThem = {};
  lops.forEach(function (m) {
    var daMo = moBaiCua(m);
    phans.forEach(function (p) {
      var k = String(p.phan || '').slice(0, 80); if (!/^(h2\/)?[a-z0-9-]+\/(bai-[0-9-]+|kiem-tra-[0-9-]+)\/[a-z0-9-]+$/.test(k)) throw new Error('Mã phần không hợp lệ: ' + k);
      dong.push(['g-' + Utilities.getUuid().slice(0, 8), dot, m, k, gon(p.ten, 120), new Date(batDau), new Date(han), gon(d.ghiChu, 300), bayGio]);
      var bai = k.replace(/\/[^\/]+$/, '');
      if (daMo.indexOf(bai) < 0) { (moThem[m] = moThem[m] || {})[bai] = gon(p.tenBai, 120); }
    });
  });
  var sh = trang('GiaoBai'); sh.getRange(sh.getLastRow() + 1, 1, dong.length, TRANG.GiaoBai.length).setValues(dong);
  var moDong = [];
  Object.keys(moThem).forEach(function (m) { Object.keys(moThem[m]).forEach(function (b) { moDong.push([m, b, moThem[m][b], bayGio]); }); });
  if (moDong.length) trang('MoBai').getRange(trang('MoBai').getLastRow() + 1, 1, moDong.length, 4).setValues(moDong);
  return { ok: true, maDot: dot, soDong: dong.length, moThem: moDong.length };
}
// Sửa hạn / giờ bắt đầu / ghi chú của một lượt giao (maGiao) hoặc cả đợt (maDot)
function gvSuaGiao(gv, d) {
  var sh = trang('GiaoBai'), v = sh.getDataRange().getValues(), n = 0;
  for (var i = 1; i < v.length; i++) {
    if (!(d.maGiao && String(v[i][0]) === d.maGiao) && !(d.maDot && String(v[i][1]) === d.maDot)) continue;
    var bd = d.batDau ? new Date(+d.batDau) : v[i][5], han = d.hanNop ? new Date(+d.hanNop) : v[i][6];
    if (ms(han) <= ms(bd)) throw new Error('Hạn nộp phải sau giờ bắt đầu');
    sh.getRange(i + 1, 6, 1, 3).setValues([[bd, han, d.ghiChu == null ? v[i][7] : gon(d.ghiChu, 300)]]); n++;
  }
  if (!n) throw new Error('Không tìm thấy bài đã giao');
  return { ok: true, soDong: n };
}
function gvXoaGiao(gv, d) {
  var n = 0;
  xoaDong('GiaoBai', function (r) { var k = (d.maGiao && String(r[0]) === d.maGiao) || (d.maDot && String(r[1]) === d.maDot); if (k) n++; return k; });
  return { ok: true, soDong: n };
}

// =====================================================================
// THÊM HỌC SINH BẰNG EMAIL (2026-11-04b) — trang MoiLop
// =====================================================================
function chuanEmail(s) { return String(s || '').trim().toLowerCase(); }
function boDau(s) { return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/\s+/g, ' ').trim(); }
// Lời mời đang chờ của một email (lớp còn mở, chưa nhận) — trả khi đăng nhập để điền sẵn hồ sơ
function loiMoiCho(email) {
  email = chuanEmail(email); if (!email) return null;
  var v = bang('MoiLop');
  for (var i = v.length - 1; i >= 0; i--) if (chuanEmail(v[i][0]) === email && !v[i][4]) {
    var l = lopTheoMa(v[i][2]); if (l && !l.dong) return { maLop: l.maLop, tenLop: l.tenLop, hoTen: String(v[i][1]) };
  }
  return null;
}
function danhDauDaNhan(email, maLop, hoSoId) {
  email = chuanEmail(email);
  var sh = trang('MoiLop'), v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (chuanEmail(v[i][0]) === email && String(v[i][2]) === maLop && !v[i][4]) sh.getRange(i + 1, 5).setValue(hoSoId);
}
// ds: [{email, hoTen}] — email đã có hồ sơ: xếp ngay (1 hồ sơ, hoặc hồ sơ trùng họ tên); chưa có: chờ em đăng nhập
function gvMoiLop(gv, d) {
  var maL = chuanMa(d.maLop), l = lopTheoMa(maL); if (!l) throw new Error('Không tìm thấy lớp ' + maL);
  var ds = [].concat(d.ds || []).slice(0, 200), sai = [], daXep = [], cho = [], canChon = [];
  var hs = trang('HoSo'), hv = hs.getDataRange().getValues(), moi = trang('MoiLop'), mv = moi.getDataRange().getValues(), bayGio = new Date();
  ds.forEach(function (x) {
    var email = chuanEmail(x.email), hoTen = gon(x.hoTen, 80);
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { if (email || hoTen) sai.push(x.email || hoTen); return; }
    var cua = [];
    for (var i = 1; i < hv.length; i++) if (chuanEmail(hv[i][2]) === email) cua.push(i);
    var khop = function (i) { var a = boDau(hv[i][3]), b = boDau(hoTen); return a === b || a.indexOf(b) >= 0 || b.indexOf(a) >= 0; };
    var chon = hoTen ? cua.filter(khop) : (cua.length === 1 ? cua : []);   // có họ tên: phải khớp tên (tránh xếp nhầm anh chị em dùng chung email)
    if (chon.length === 1) {
      var i = chon[0];
      hs.getRange(i + 1, 5).setValue(l.tenLop); hs.getRange(i + 1, 9).setValue(l.maLop); hv[i][4] = l.tenLop; hv[i][8] = l.maLop;
      doiTenTrangThai(String(hv[i][0]), String(hv[i][3]), l.tenLop);
      daXep.push(String(hv[i][3]));
      ghiMoi(email, hoTen || String(hv[i][3]), String(hv[i][0]));
    } else {
      if (cua.length > 1) canChon.push(email);
      cho.push(hoTen || email);
      ghiMoi(email, hoTen, '');
    }
  });
  function ghiMoi(email, hoTen, daNhan) {           // mỗi (email, lớp) một dòng: có rồi thì cập nhật
    for (var j = 1; j < mv.length; j++) if (chuanEmail(mv[j][0]) === email && String(mv[j][2]) === l.maLop) {
      moi.getRange(j + 1, 1, 1, 5).setValues([[email, hoTen || mv[j][1], l.maLop, mv[j][3], daNhan || mv[j][4]]]); mv[j][4] = daNhan || mv[j][4]; return;
    }
    moi.appendRow([email, hoTen, l.maLop, bayGio, daNhan]); mv.push([email, hoTen, l.maLop, bayGio, daNhan]);
  }
  return { ok: true, daXep: daXep, cho: cho, canChon: canChon, sai: sai };
}
function gvXoaMoi(gv, d) {
  var email = chuanEmail(d.email), maL = chuanMa(d.maLop), n = 0;
  xoaDong('MoiLop', function (r) { var k = chuanEmail(r[0]) === email && String(r[2]) === maL; if (k) n++; return k; });
  return { ok: true, soDong: n };
}

// =====================================================================
// TIN NHẮN CHO CÔ (2026-11-04c) — trang TinNhan
// =====================================================================
var LOAI_TIN = { 'mo-bai': 'Xin mở bài', 'bao-loi': 'Báo lỗi', 'khac': 'Khác' };
function guiTin(d) {
  var p = null; if (d.phien) try { p = xacPhien(d); } catch (x) {}
  var loai = LOAI_TIN[d.loai] ? d.loai : 'khac', noiDung = String(d.noiDung || '').trim().slice(0, 2000);
  if (noiDung.length < 3) throw new Error('Bạn viết nội dung tin nhắn nhé');
  var hoTen = gon(d.hoTen, 80), lienHe = gon(d.lienHe, 120), email = '', sub = '', hoSoId = '', maLop = '';
  if (p) {
    sub = p.sub; email = emailCua(p.sub);
    var hs = dsHoSo(p.sub).filter(function (h) { return h.hoSoId === d.hoSoId; })[0];
    if (hs) { hoSoId = hs.hoSoId; maLop = hs.maLop; hoTen = hs.hoTen; }
    if (!hoTen) hoTen = gon(d.hoTenGoogle, 80);
  } else if (!hoTen || !lienHe) throw new Error('Bạn ghi họ tên và cách liên hệ (Zalo / số điện thoại / email) để cô trả lời nhé');
  // chống gửi dồn: mỗi tài khoản / mỗi phiên trình duyệt tối đa 5 tin trong 10 phút; khách chưa đăng nhập cả web tối đa 40 tin / 10 phút
  var C = CacheService.getScriptCache(), k1 = 'tin:' + (sub || 'p:' + gon(d.maPhien, 40)), n1 = +(C.get(k1) || 0);
  if (n1 >= 5) throw new Error('Bạn gửi nhiều tin quá, chờ vài phút rồi gửi tiếp nhé');
  if (!sub) { var n2 = +(C.get('tin:khach') || 0); if (n2 >= 40) throw new Error('Hộp thư đang bận, bạn thử lại sau ít phút nhé'); C.put('tin:khach', String(n2 + 1), 600); }
  C.put(k1, String(n1 + 1), 600);
  var ma = 't-' + Utilities.getUuid().slice(0, 8);
  trang('TinNhan').appendRow([ma, new Date(), loai, noiDung, gon(d.trang, 200), gon(d.muc, 60), hoTen, lienHe, email, sub, hoSoId, maLop, 'mới', '', '']);
  return { ok: true, maTin: ma };
}
function dsTin(loc, toiDa) {
  var v = bang('TinNhan'), kq = [];
  for (var i = v.length - 1; i >= 0 && kq.length < toiDa; i--) {
    var r = v[i]; if (!r[0] || !loc(r)) continue;
    kq.push({ maTin: String(r[0]), thoiDiem: ms(r[1]), loai: String(r[2]), noiDung: String(r[3]), trang: String(r[4]), muc: String(r[5]), hoTen: String(r[6]),
      lienHe: String(r[7]), email: String(r[8]), coTaiKhoan: !!r[9], hoSoId: String(r[10]), maLop: String(r[11]), trangThai: String(r[12]), traLoi: String(r[13]), traLoiLuc: ms(r[14]) });
  }
  return kq;
}
function tinCuaToi(p) { return { ok: true, tin: dsTin(function (r) { return String(r[9]) === p.sub; }, 50) }; }
// Cô trả lời và / hoặc đổi trạng thái (mới · đã xem · xong)
function gvTraLoi(gv, d) {
  var sh = trang('TinNhan'), v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (String(v[i][0]) === d.maTin) {
    if (d.traLoi != null && String(d.traLoi).trim()) sh.getRange(i + 1, 14, 1, 2).setValues([[String(d.traLoi).trim().slice(0, 2000), new Date()]]);
    var tt = { moi: 'mới', 'da-xem': 'đã xem', xong: 'xong' }[d.trangThai];
    if (tt) sh.getRange(i + 1, 13).setValue(tt);
    return { ok: true };
  }
  throw new Error('Không tìm thấy tin nhắn');
}

// =====================================================================
// PHIÊN CHƠI (2026-11-04e) — trò chơi cá nhân có mã vào chơi, cô theo dõi trực tiếp
//   Bộ nhớ đệm: pcf:<mã> cấu hình phiên · pcd:<mã> danh sách em đã vào · pct:<mã>:<id> tiến trình một em
//   Tiến trình một em: { hien: lượt đang chơi {l, c (câu / giây đã chơi), n (tổng), d (điểm), dg (đúng), xong, t}, ds: [lượt đã xong] }
// =====================================================================
function dongPhien(r) {
  return { ma: String(r[0]), taoLuc: ms(r[1]), maLop: String(r[2] || ''), tro: String(r[3]), tenTro: String(r[4]), tenBai: String(r[5]),
    muc: String(r[6] || ''), lesson: String(r[7]), trang: String(r[8]), ketThuc: ms(r[9]), ghiChu: String(r[10] || ''), bai: String(r[11] || '') };
}
function dsPhien() { return bang('PhienChoi').filter(function (r) { return r[0]; }).map(dongPhien).sort(function (a, b) { return b.taoLuc - a.taoLuc; }); }
function cauHinhPhien(ma) {
  var C = CacheService.getScriptCache(), s = C.get('pcf:' + ma);
  if (s) return JSON.parse(s);
  var ph = dsPhien().filter(function (x) { return x.ma === ma; })[0] || null;
  if (ph) C.put('pcf:' + ma, JSON.stringify(ph), HAN_PHIEN);
  return ph;
}
function gvTaoPhien(gv, d) {
  var tro = gon(d.tro, 30), trangChoi = gon(d.trang, 200), lesson = gon(d.lesson, 120);
  if (!/^[a-z-]+$/.test(tro) || !/^[a-z0-9\/._-]+\.html$/.test(trangChoi) || !lesson) throw new Error('Thiếu trò chơi hoặc bài');
  var maLop = chuanMa(d.maLop);
  if (maLop && !lopTheoMa(maLop)) throw new Error('Không tìm thấy lớp ' + maLop);
  var co = {}, bayGio = Date.now();
  dsPhien().forEach(function (x) { if (bayGio - x.taoLuc < 2 * 864e5) co[x.ma] = 1; });   // mã của phiên 2 ngày gần đây không dùng lại
  var ma = '';
  for (var i = 0; i < 60 && !ma; i++) { var m = String(10000 + Math.floor(Math.random() * 90000)); if (!co[m]) ma = m; }
  if (!ma) throw new Error('Chưa tạo được mã, cô thử lại nhé');
  var r = [ma, new Date(), maLop, tro, gon(d.tenTro, 40), gon(d.tenBai, 80), gon(d.muc, 10), lesson, trangChoi, '', gon(d.ghiChu, 200), gon(d.bai, 30)];
  trang('PhienChoi').appendRow(r);
  var ph = dongPhien(r); ph.taoLuc = bayGio;
  CacheService.getScriptCache().put('pcf:' + ma, JSON.stringify(ph), HAN_PHIEN);
  return { ok: true, phien: ph };
}
function gvKetThucPhien(gv, d) {
  var ma = String(d.ma || ''), sh = trang('PhienChoi'), v = sh.getDataRange().getValues();
  for (var i = 1; i < v.length; i++) if (String(v[i][0]) === ma) {
    var luc = d.moLai ? '' : new Date();
    sh.getRange(i + 1, 10).setValue(luc);
    v[i][9] = luc;
    var ph = dongPhien(v[i]);
    CacheService.getScriptCache().put('pcf:' + ma, JSON.stringify(ph), HAN_PHIEN);
    return { ok: true, phien: ph };
  }
  throw new Error('Không tìm thấy phiên ' + ma);
}
function gvXemPhien(gv, d) {
  var ma = String(d.ma || ''), ph = cauHinhPhien(ma);
  if (!ph) throw new Error('Không tìm thấy phiên ' + ma);
  var C = CacheService.getScriptCache(), ds = JSON.parse(C.get('pcd:' + ma) || '{}'), ids = Object.keys(ds);
  var tt = ids.length ? C.getAll(ids.map(function (id) { return 'pct:' + ma + ':' + id; })) : {};
  var em = ids.map(function (id) {
    var x = ds[id], t = JSON.parse(tt['pct:' + ma + ':' + id] || '{}');
    return { id: id, hoSoId: x.hoSoId || '', hoTen: x.hoTen, lop: x.lop, vao: x.vao, hien: t.hien || null, ds: t.ds || [] };
  });
  return { ok: true, phien: ph, em: em, bayGio: Date.now() };
}
function vaoPhien(p, d) {
  var ma = String(d.ma || '').replace(/\D/g, '');
  if (!/^\d{5}$/.test(ma)) throw new Error('Mã vào chơi gồm 5 chữ số');
  var ph = cauHinhPhien(ma);
  if (!ph) throw new Error('Không tìm thấy mã ' + ma + '. Em xem lại mã cô cho nhé.');
  if (ph.ketThuc) throw new Error('Phiên chơi ' + ma + ' đã kết thúc.');
  if (Date.now() - ph.taoLuc > HAN_PHIEN * 1000) throw new Error('Mã ' + ma + ' đã hết hạn (quá 6 giờ). Em xin cô mã mới nhé.');
  var id, hoTen, lop, hoSoId = '';
  if (d.hoSoId) { var hs = hoSoCua(p, String(d.hoSoId)); hoSoId = hs.hoSoId; id = hs.hoSoId; hoTen = hs.hoTen; lop = hs.lop; }
  else {                                   // tài khoản giáo viên vào thử (không có hồ sơ học sinh)
    var u = bang('Users').filter(function (r) { return String(r[0]) === p.sub; })[0];
    id = 'u-' + p.sub.slice(-10); hoTen = u ? String(u[2] || u[1]) : 'Khách'; lop = 'Giáo viên';
  }
  coKhoa(function () {                     // danh sách em đã vào: nhiều em vào cùng lúc không mất tên
    var C = CacheService.getScriptCache(), k = 'pcd:' + ma, ds = JSON.parse(C.get(k) || '{}');
    ds[id] = { hoSoId: hoSoId, hoTen: hoTen, lop: lop, vao: (ds[id] && ds[id].vao) || Date.now() };
    C.put(k, JSON.stringify(ds), HAN_PHIEN);
  });
  return { ok: true, phien: ph, id: id, hoTen: hoTen, lop: lop, the: chuKy('pc|' + ma + '|' + id) };
}
function soNguyen(x, max) { x = Math.round(+x || 0); return Math.max(0, Math.min(max, x)); }
function baoPhien(d) {                     // điện thoại báo tiến trình — không đọc Sheet, không giữ khoá (mỗi em một ô nhớ riêng)
  var ma = String(d.ma || ''), id = String(d.id || '');
  if (!ma || !id || chuKy('pc|' + ma + '|' + id) !== String(d.the || '')) throw new Error('Thẻ phiên chơi không hợp lệ');
  var ph = cauHinhPhien(ma);
  if (!ph) throw new Error('Không tìm thấy phiên ' + ma);
  if (ph.ketThuc) return { ok: true, ketThuc: true };
  var h = d.hien || {}, C = CacheService.getScriptCache(), k = 'pct:' + ma + ':' + id, t = JSON.parse(C.get(k) || '{}');
  var hien = { l: String(h.l || '').slice(0, 16), c: soNguyen(h.c, 9999), n: soNguyen(h.n, 9999), d: soNguyen(h.d, 1e7), dg: soNguyen(h.dg, 9999),
    s: soNguyen(h.s, 9999), mang: h.mang == null ? null : soNguyen(h.mang, 9), xong: !!h.xong, tong: soNguyen(h.tong, 1e7), tg: soNguyen(h.tg, 1e5), t: Date.now() };
  t.ds = t.ds || [];
  if (hien.xong && !t.ds.some(function (x) { return x.l === hien.l; })) {
    t.ds.push({ l: hien.l, d: hien.d, tong: hien.tong, dg: hien.dg, n: hien.n, tg: hien.tg, t: hien.t });
    if (t.ds.length > 60) t.ds = t.ds.slice(-60);
  }
  t.hien = hien;
  C.put(k, JSON.stringify(t), HAN_PHIEN);
  return { ok: true };
}

// =====================================================================
// BÀI KIỂM TRA (2026-11-05a) — đề + đáp án chỉ nằm ở Sheet này (trang KiemTraDe), không nằm trong mã web công khai.
// Học sinh chỉ nhận đề (đã bỏ đáp án) khi lớp của em được giao phần "<mục>/bai-kiem-tra" và đang trong khung giờ.
// Máy chủ giữ giờ bắt đầu, tự lưu bài làm, chấm khi nộp / hết giờ. Câu dịch không khớp đáp án: chờ cô chấm tay.
// =====================================================================
var KT_PHAN = 'bai-kiem-tra';
var KT_DU_GIO = 90000;                     // nộp trễ tối đa 90 giây sau khi hết giờ (mạng chậm)
function ktMa(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40); }
function ktMucTuMa(maDe) { return String(maDe).replace(/^(h2-)?(hsk[0-9]+)-/, function (_, h, c) { return (h ? 'h2/' : '') + c + '/'; }); }   // hsk1-kiem-tra-1-5 → hsk1/kiem-tra-1-5
function ktDocDe(maDe) {
  var v = bang('KiemTraDe');
  for (var i = v.length - 1; i >= 0; i--) if (String(v[i][0]) === maDe) {
    try { return JSON.parse(String(v[i][3]) + String(v[i][4]) + String(v[i][5]) + String(v[i][6])); } catch (x) { throw new Error('Đề trong Sheet bị hỏng, cô nạp lại đề nhé'); }
  }
  return null;
}
function ktBoDapAn(de) {                   // đề gửi cho học sinh: bỏ đáp án, lời giải, biến thể chấm
  var o = JSON.parse(JSON.stringify(de));
  (o.phan || []).forEach(function (p) { (p.cau || []).forEach(function (c) { delete c.dapAn; delete c.chapNhan; delete c.giai; delete c.py; delete c.sua; }); });
  return o;
}
function ktDsCau(de) { var ds = []; (de.phan || []).forEach(function (p) { (p.cau || []).forEach(function (c) { c._phan = p.ma; ds.push(c); }); }); return ds; }
function ktChuan(s) { return String(s == null ? '' : s).replace(/[\s，。？！、；：,.?!;:“”"'‘’…—\-·（）()《》]/g, ''); }
function ktCham(c, tl) {                   // → { d: điểm | null (chờ cô chấm), dung: true/false/null }
  var D = +c.diem || 0;
  if (tl == null || tl === '' || (Array.isArray(tl) && !tl.some(function (x) { return x != null && x !== ''; }))) return { d: 0, dung: false, trong: true };
  if (c.dang === 'chon') return tl === c.dapAn ? { d: D, dung: true } : { d: 0, dung: false };
  if (c.dang === 'dungsai') return tl === c.dapAn ? { d: D, dung: true } : { d: 0, dung: false };
  if (c.dang === 'ghep' || c.dang === 'nhom') {
    var n = c.dapAn.length, dung = 0;
    for (var i = 0; i < n; i++) if (tl[i] === c.dapAn[i]) dung++;
    return { d: Math.round(D * dung / n * 100) / 100, dung: dung === n };
  }
  if (c.dang === 'ghepBo') {
    var a = [].concat(tl).map(Number).sort().join(','), b = [].concat(c.dapAn).map(Number).sort().join(',');
    return a === b ? { d: D, dung: true } : { d: 0, dung: false };
  }
  if (c.dang === 'xep' || c.dang === 'go') {
    var g = ktChuan(c.dang === 'xep' ? [].concat(tl).map(function (i) { return (c.khoi || [])[i] || ''; }).join('') : tl), ds = [].concat(c.dapAn, c.chapNhan || []).map(ktChuan);
    if (ds.indexOf(g) >= 0) return { d: D, dung: true };
    return c.chamTay ? { d: null, dung: null } : { d: 0, dung: false };
  }
  return { d: 0, dung: false };
}
function ktChamBai(de, traLoi, chamTay) {
  var tong = 0, toiDa = 0, cho = 0, theoPhan = {}, cau = {};
  ktDsCau(de).forEach(function (c) {
    var k = ktCham(c, traLoi[c.id]);
    if (c.chamTay && chamTay && chamTay[c.id] != null) k = {   // câu cô chấm tay: điểm của cô thay điểm máy (kể cả câu máy đã chấm khớp)
      d: +chamTay[c.id], dung: +chamTay[c.id] >= +c.diem, tay: true };
    if (k.d === null) cho++;
    var p = theoPhan[c._phan] || (theoPhan[c._phan] = { diem: 0, toiDa: 0, dung: 0, so: 0 });
    p.toiDa += +c.diem; p.so++; toiDa += +c.diem;
    if (k.d != null) { p.diem += k.d; tong += k.d; } if (k.dung) p.dung++;
    cau[c.id] = k;
  });
  Object.keys(theoPhan).forEach(function (m) { theoPhan[m].diem = Math.round(theoPhan[m].diem * 100) / 100; });
  return { tong: Math.round(tong * 100) / 100, toiDa: toiDa, choCham: cho, phan: theoPhan, cau: cau };
}
function ktGiaoCua(maLop, muc) {           // lượt giao còn hiệu lực gần nhất (đã tới giờ bắt đầu) của lớp cho bài kiểm tra
  var k = muc + '/' + KT_PHAN, bayGio = Date.now(), ds = giaoBaiCua(maLop, true).filter(function (g) { return g.phan === k && (!g.batDau || g.batDau <= bayGio); });
  ds.sort(function (a, b) { return b.hanNop - a.hanNop; });
  return ds[0] || null;
}
function ktTimBai(v, maDe, hoSoId) { for (var i = 0; i < v.length; i++) if (String(v[i][0]) === maDe && String(v[i][1]) === hoSoId) return i; return -1; }
function ktDongBai(r) {
  var j = function (x, mac) { try { return JSON.parse(x || mac); } catch (e) { return JSON.parse(mac); } };
  return { maDe: String(r[0]), hoSoId: String(r[1]), sub: String(r[2]), hoTen: String(r[3]), lop: String(r[4]), maLop: String(r[5]), maDot: String(r[6]),
    batDauLuc: ms(r[7]), hetGioLuc: ms(r[8]), nopLuc: ms(r[9]), traLoi: j(r[10], '{}'), nghe: j(r[11], '{}'), chamTay: j(r[12], '{}'),
    tong: r[13] === '' ? null : +r[13], trangThai: String(r[14]), thietBi: String(r[15]) };
}
function ktCongBo(maDe, maLop) { return bang('KiemTraCongBo').some(function (r) { return String(r[0]) === maDe && String(r[1]) === maLop; }); }
function ktKetQuaHs(de, b, giao) {         // điều học sinh được xem sau khi nộp
  var kq = ktChamBai(de, b.traLoi, b.chamTay);
  var xemDapAn = ktCongBo(de.maDe, b.maLop) || (giao && giao.hanNop < Date.now());
  var o = { tong: kq.tong, toiDa: kq.toiDa, choCham: kq.choCham, nopLuc: b.nopLuc, xemDapAn: xemDapAn, hanNop: giao ? giao.hanNop : 0,
    phan: (de.phan || []).map(function (p) { var x = kq.phan[p.ma] || {}; return { ma: p.ma, ten: p.ten, diem: x.diem || 0, toiDa: x.toiDa || 0, dung: x.dung || 0, so: x.so || 0 }; }) };
  if (xemDapAn) { o.de = de; o.traLoi = b.traLoi; o.cau = kq.cau; }
  return o;
}
function ktNopDong(sh, i, b, de, hs) {     // chấm + ghi "đã nộp" cho một dòng bài làm
  var kq = ktChamBai(de, b.traLoi, b.chamTay), nop = new Date(Math.min(Date.now(), b.hetGioLuc || Date.now()));
  sh.getRange(i + 2, 10).setValue(nop); sh.getRange(i + 2, 14, 1, 2).setValues([[kq.tong, 'nop']]);
  b.nopLuc = nop.getTime(); b.tong = kq.tong; b.trangThai = 'nop';
  var phan = {}; phan[ktMucTuMa(b.maDe) + '/' + KT_PHAN] = { tt: 'xong', t: b.nopLuc, ten: de.ten || 'Bài kiểm tra' };
  ghiTrangThai(hs || { hoSoId: b.hoSoId, hoTen: b.hoTen, lop: b.lop }, phan);
  return kq;
}
// Học sinh mở trang: trạng thái (được giao chưa, đã làm chưa); batDau: true → bắt đầu / làm tiếp, trả đề không có đáp án
function ktXem(p, d, batDau) {
  var hs = hoSoCua(p, d.hoSoId), maDe = ktMa(d.maDe), muc = ktMucTuMa(maDe);
  var giao = hs.maLop ? ktGiaoCua(hs.maLop, muc) : null, bayGio = Date.now();
  var sh = trang('KiemTraBai'), v = bang('KiemTraBai'), i = ktTimBai(v, maDe, hs.hoSoId), b = i >= 0 ? ktDongBai(v[i]) : null;
  var de = ktDocDe(maDe);
  if (!de) return { ok: true, bayGio: bayGio, trangThai: 'chua-co-de' };
  if (b && b.trangThai === 'dang' && bayGio > b.hetGioLuc + KT_DU_GIO) coKhoa(function () { ktNopDong(sh, i, b, de, hs); });   // hết giờ khi em không mở trang: tự nộp bài đã lưu
  var thongTin = { ten: de.ten, phut: de.phut, soCau: ktDsCau(de).length, toiDa: ktDsCau(de).reduce(function (s, c) { return s + (+c.diem || 0); }, 0),
    batDau: giao ? giao.batDau : 0, hanNop: giao ? giao.hanNop : 0, ghiChu: giao ? giao.ghiChu : '' };
  if (b && b.trangThai === 'nop') return { ok: true, bayGio: bayGio, trangThai: 'da-nop', thongTin: thongTin, ketQua: ktKetQuaHs(de, b, giao) };
  if (!giao) return { ok: true, bayGio: bayGio, trangThai: 'chua-giao' };
  if (!b && bayGio > giao.hanNop) return { ok: true, bayGio: bayGio, trangThai: 'het-han', thongTin: thongTin };
  if (!batDau) return { ok: true, bayGio: bayGio, trangThai: b ? 'dang-lam' : 'chua-lam', thongTin: thongTin, hetGioLuc: b ? b.hetGioLuc : 0 };
  if (!b) {
    var het = Math.min(bayGio + (+de.phut || 60) * 60000, giao.hanNop);
    b = { maDe: maDe, hoSoId: hs.hoSoId, batDauLuc: bayGio, hetGioLuc: het, traLoi: {}, nghe: {}, chamTay: {}, trangThai: 'dang' };
    coKhoa(function () {
      var v2 = bang('KiemTraBai'); if (ktTimBai(v2, maDe, hs.hoSoId) >= 0) return;   // hai máy bấm cùng lúc
      sh.appendRow([maDe, hs.hoSoId, p.sub, hs.hoTen, hs.lop, hs.maLop, giao.maDot, new Date(bayGio), new Date(het), '', '{}', '{}', '{}', '', 'dang', gon(d.thietBi, 20)]);
    });
    var v3 = bang('KiemTraBai'), i3 = ktTimBai(v3, maDe, hs.hoSoId); b = ktDongBai(v3[i3]);
  }
  return { ok: true, bayGio: bayGio, trangThai: 'dang-lam', thongTin: thongTin, de: ktBoDapAn(de), batDauLuc: b.batDauLuc, hetGioLuc: b.hetGioLuc, traLoi: b.traLoi, nghe: b.nghe };
}
function ktGonTraLoi(de, tl) {             // chỉ nhận câu có trong đề, giá trị gọn
  var o = {}; tl = tl || {};
  ktDsCau(de).forEach(function (c) {
    var x = tl[c.id]; if (x == null || x === '') return;
    if (c.dang === 'go') x = String(x).slice(0, 300);
    else if (c.dang === 'chon') x = +x;
    else if (c.dang === 'dungsai') x = x === true || x === 'true';
    else if (Array.isArray(x)) x = x.slice(0, 20).map(function (y) { return y == null || y === '' ? null : +y; });
    else return;
    o[c.id] = x;
  });
  return o;
}
function ktLuuHoacNop(p, d, nop) {
  var hs = hoSoCua(p, d.hoSoId), maDe = ktMa(d.maDe), de = ktDocDe(maDe); if (!de) throw new Error('Chưa có đề');
  var sh = trang('KiemTraBai'), v = bang('KiemTraBai'), i = ktTimBai(v, maDe, hs.hoSoId);
  if (i < 0) throw new Error('Bạn chưa bắt đầu bài kiểm tra');
  var b = ktDongBai(v[i]), bayGio = Date.now();
  if (b.trangThai === 'nop') return { ok: true, daNop: true, ketQua: ktKetQuaHs(de, b, ktGiaoCua(hs.maLop, ktMucTuMa(maDe))) };
  var conGio = bayGio <= b.hetGioLuc + KT_DU_GIO;
  if (conGio) {
    b.traLoi = ktGonTraLoi(de, d.traLoi);
    var nghe = {}; Object.keys(d.nghe || {}).slice(0, 100).forEach(function (k) { nghe[String(k).slice(0, 20)] = Math.min(9, +d.nghe[k] || 0); });
    Object.keys(b.nghe).forEach(function (k) { nghe[k] = Math.max(nghe[k] || 0, +b.nghe[k] || 0); });   // số lần nghe không bao giờ giảm
    b.nghe = nghe;
    sh.getRange(i + 2, 11, 1, 2).setValues([[JSON.stringify(b.traLoi), JSON.stringify(b.nghe)]]);
  }
  if (nop || !conGio) {
    ktNopDong(sh, i, b, de, hs);
    return { ok: true, daNop: true, treGio: !conGio, ketQua: ktKetQuaHs(de, b, ktGiaoCua(hs.maLop, ktMucTuMa(maDe))) };
  }
  return { ok: true, bayGio: bayGio, hetGioLuc: b.hetGioLuc };
}

// ----- giáo viên -----
function gvKtDe(gv, d) {                   // không có json: đọc đề; có json: lưu đề mới (giữ bản cũ ở dòng trên)
  var maDe = ktMa(d.maDe);
  if (d.json == null) return { ok: true, de: ktDocDe(maDe) };
  var de = typeof d.json === 'string' ? JSON.parse(d.json) : d.json;
  if (ktMa(de.maDe) !== maDe) throw new Error('Mã đề trong tệp (' + de.maDe + ') khác mã đề đang nạp (' + maDe + ')');
  var loi = [];
  ktDsCau(de).forEach(function (c) { if (!c.id || !c.dang || c.dapAn == null || !(+c.diem >= 0)) loi.push(c.id || '?'); });
  if (loi.length) throw new Error('Câu thiếu mã / dạng / đáp án / điểm: ' + loi.slice(0, 10).join(', '));
  var s = JSON.stringify(de), phan = [s.slice(0, 45000), s.slice(45000, 90000), s.slice(90000, 135000), s.slice(135000, 180000)];
  if (s.length > 180000) throw new Error('Đề quá dài');
  trang('KiemTraDe').appendRow([maDe, String(de.phienBan || ''), new Date(), phan[0], phan[1], phan[2], phan[3], gv.email]);
  return { ok: true, soCau: ktDsCau(de).length };
}
function gvKtBang(gv, d) {
  var maDe = ktMa(d.maDe), de = ktDocDe(maDe), sh = trang('KiemTraBai'), v = bang('KiemTraBai'), ds = [];
  for (var i = 0; i < v.length; i++) {
    if (String(v[i][0]) !== maDe) continue;
    var b = ktDongBai(v[i]);
    if (de && b.trangThai === 'dang' && Date.now() > b.hetGioLuc + KT_DU_GIO) coKhoa(function () { ktNopDong(sh, i, b, de, null); });
    var kq = de ? ktChamBai(de, b.traLoi, b.chamTay) : null;
    ds.push({ hoSoId: b.hoSoId, hoTen: b.hoTen, lop: b.lop, maLop: b.maLop, batDauLuc: b.batDauLuc, hetGioLuc: b.hetGioLuc, nopLuc: b.nopLuc,
      trangThai: b.trangThai, traLoi: b.traLoi, chamTay: b.chamTay, kq: kq, thietBi: b.thietBi });
  }
  var congBo = bang('KiemTraCongBo').filter(function (r) { return String(r[0]) === maDe; }).map(function (r) { return String(r[1]); });
  return { ok: true, de: de, bai: ds, congBo: congBo, bayGio: Date.now() };
}
function gvKtCham(gv, d) {                 // cô chấm tay một câu (câu dịch / gõ không khớp đáp án); diem rỗng: bỏ điểm đã chấm
  var maDe = ktMa(d.maDe), de = ktDocDe(maDe), sh = trang('KiemTraBai'), v = bang('KiemTraBai'), i = ktTimBai(v, maDe, String(d.hoSoId));
  if (i < 0) throw new Error('Không tìm thấy bài làm');
  var b = ktDongBai(v[i]), c = ktDsCau(de).filter(function (x) { return x.id === d.id; })[0];
  if (!c) throw new Error('Không có câu ' + d.id);
  if (d.diem === '' || d.diem == null) delete b.chamTay[c.id];
  else { var x = +d.diem; if (!(x >= 0 && x <= +c.diem)) throw new Error('Điểm câu này từ 0 đến ' + c.diem); b.chamTay[c.id] = x; }
  var kq = ktChamBai(de, b.traLoi, b.chamTay);
  sh.getRange(i + 2, 13).setValue(JSON.stringify(b.chamTay));
  if (b.trangThai === 'nop') sh.getRange(i + 2, 14).setValue(kq.tong);
  return { ok: true, kq: kq, chamTay: b.chamTay };
}
function gvKtLamLai(gv, d) {               // xoá bài làm của một em: em làm lại từ đầu (còn trong hạn giao)
  var maDe = ktMa(d.maDe), n = 0;
  xoaDong('KiemTraBai', function (r) { var k = String(r[0]) === maDe && String(r[1]) === String(d.hoSoId); if (k) n++; return k; });
  return { ok: true, soDong: n };
}
function gvKtCongBo(gv, d) {
  var maDe = ktMa(d.maDe), maL = chuanMa(d.maLop);
  xoaDong('KiemTraCongBo', function (r) { return String(r[0]) === maDe && String(r[1]) === maL; });
  if (d.bat) trang('KiemTraCongBo').appendRow([maDe, maL, new Date()]);
  return { ok: true };
}
