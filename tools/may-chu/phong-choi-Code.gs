/* =========================================================
   MÁY CHỦ PHÒNG CHƠI — Tiếng Trung Diệu Kỳ (trò chơi cả lớp: theo đội, hoặc cá nhân mỗi máy một người)
   Apps Script độc lập, KHÔNG cần Google Sheet: dữ liệu phòng để tạm trong bộ nhớ đệm (CacheService), tự xoá sau 6 giờ.

   Cài đặt:
   1. script.google.com → Dự án mới → đặt tên "TTDK - Phong choi" → xoá hết mã có sẵn, dán toàn bộ file này → Lưu.
   2. Triển khai → Tùy chọn triển khai mới → loại "Ứng dụng web"
        Thực thi với tư cách: Tôi · Người có quyền truy cập: Bất kỳ ai → Triển khai → cấp quyền.
   3. Chép địa chỉ "Ứng dụng web" (kết thúc bằng /exec) gửi cho bên soạn (điền vào QM_PHONG_API trong assets/js/cau-hinh.js).
   Sửa mã sau này: Triển khai → Quản lý triển khai → ✏️ → Phiên bản: Phiên bản mới → Triển khai (địa chỉ giữ nguyên).

   Bản 2026-11-01: bỏ LockService (trên máy chủ thật làm lệnh gui / vao bị từ chối → học sinh không chọn được đáp án);
   thêm a=ping để kiểm tra bản đang chạy.
   Bản 2026-11-04: chế độ CÁ NHÂN (Rung chuông vàng, mỗi máy một người): ô d nhận 0–59 (đội vẫn 0–3);
   thêm a=nhan (điện thoại giữ một ô người chơi), doc nhận n = số ô cần đọc và trả thêm "nguoi".
   Giao thức (GET hoặc POST JSON dạng text/plain), tham số a = hành động:
     ping                      → { ok, phienBan }
     tao                       → { ma (4 số), khoa }               màn chiếu tạo phòng
     ghi  ma, khoa, s          → ghi trạng thái phòng (chuỗi JSON) màn chiếu
     doc  ma, khoa, n?         → { v: [máy đã vào từng ô], g: {loại: [bài gửi từng ô]}, nguoi: [người giữ ô] }   màn chiếu đọc (n mặc định 4, tối đa 60)
     xem  ma, d, id            → { s: trạng thái, toi: {loại: bài gửi của ô d}, nguoi: người giữ ô d }       điện thoại đọc
     vao  ma, d, id            → ghi nhận điện thoại id vào đội d
     nhan ma, d, id, ten, lop, hs → điện thoại giữ ô người chơi d (ô đã có người khác: loi = 'co-nguoi')
     gui  ma, d, k, c, x       → ô d gửi: k = dap | khoa | hang | tg, c = mã câu, x = nội dung
                                  dap, khoa: mỗi mã câu chỉ nhận LẦN ĐẦU (bấm sau không đổi được)
   ========================================================= */
var PHIEN_BAN = '2026-11-04';                      // mở /exec?a=ping để xem bản đang chạy
var HAN = 21600;                                    // 6 giờ (tối đa của CacheService)
var LOAI = ['dap', 'khoa', 'hang', 'tg'];
var KHOA_CHAT = { dap: 1, khoa: 1 };                // chỉ nhận lần gửi đầu tiên cho mỗi mã câu
var TOI_DA_O = 60;                                  // chế độ cá nhân: tối đa 60 người chơi

function doGet(e) { return xuLy((e && e.parameter) || {}); }
function doPost(e) {
  var p = {};
  try { p = JSON.parse(e.postData.contents); } catch (x) { p = (e && e.parameter) || {}; }
  return xuLy(p);
}
function tra(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function soDoi(d) { d = parseInt(d, 10); return d >= 0 && d < TOI_DA_O ? d : -1; }
function cat(s, n) { return String(s == null ? '' : s).slice(0, n); }

function xuLy(p) {
  var C = CacheService.getScriptCache(), a = String(p.a || ''), ma = String(p.ma || '');
  try {
    if (a === 'ping' || a === '') return tra({ ok: 1, phienBan: PHIEN_BAN, ten: 'Máy chủ phòng chơi Tiếng Trung Diệu Kỳ' });
    if (a === 'tao') {
      for (var i = 0; i < 40; i++) {
        var m = String(1000 + Math.floor(Math.random() * 9000));
        if (!C.get('p:' + m)) {
          var k = Utilities.getUuid().replace(/-/g, '').slice(0, 16);
          C.put('p:' + m, k, HAN);
          return tra({ ok: 1, ma: m, khoa: k, t: Date.now() });
        }
      }
      return tra({ ok: 0, loi: 'het-phong' });
    }
    if (!/^\d{4}$/.test(ma)) return tra({ ok: 0, loi: 'ma' });
    var khoa = C.get('p:' + ma);
    if (!khoa) return tra({ ok: 0, loi: 'khong-co-phong' });

    if (a === 'ghi') {
      if (p.khoa !== khoa) return tra({ ok: 0, loi: 'khoa' });
      var s = String(p.s || '');
      if (s.length > 95000) return tra({ ok: 0, loi: 'qua-dai' });
      var ghi = {}; ghi['s:' + ma] = s; ghi['p:' + ma] = khoa;   // ghi lại khoá để phòng không hết hạn giữa giờ
      C.putAll(ghi, HAN);
      return tra({ ok: 1, t: Date.now() });
    }

    if (a === 'doc') {
      if (p.khoa !== khoa) return tra({ ok: 0, loi: 'khoa' });
      var n = Math.max(4, Math.min(TOI_DA_O, parseInt(p.n, 10) || 4)), keys = [];
      for (var d = 0; d < n; d++) { keys.push('v:' + ma + ':' + d, 'n:' + ma + ':' + d); LOAI.forEach(function (l) { keys.push(l + ':' + ma + ':' + d); }); }
      var all = C.getAll(keys), v = [], g = {}, nguoi = [];
      LOAI.forEach(function (l) { g[l] = []; });
      for (var d2 = 0; d2 < n; d2++) {
        v.push(docJson(all['v:' + ma + ':' + d2]) || {});
        nguoi.push(docJson(all['n:' + ma + ':' + d2]));
        LOAI.forEach(function (l) { g[l].push(docJson(all[l + ':' + ma + ':' + d2])); });
      }
      return tra({ ok: 1, v: v, g: g, nguoi: nguoi, t: Date.now() });
    }

    var d3 = soDoi(p.d);
    if (a === 'xem') {
      var o = { ok: 1, s: C.get('s:' + ma) || '', t: Date.now() };
      if (d3 >= 0) {
        var ks = LOAI.map(function (l) { return l + ':' + ma + ':' + d3; }).concat(['n:' + ma + ':' + d3]), got = C.getAll(ks);
        o.toi = {}; LOAI.forEach(function (l) { o.toi[l] = docJson(got[l + ':' + ma + ':' + d3]); });
        o.nguoi = docJson(got['n:' + ma + ':' + d3]);
      }
      return tra(o);
    }
    if (d3 < 0) return tra({ ok: 0, loi: 'doi' });

    if (a === 'vao') {
      var id = cat(p.id, 24);
      var kv = 'v:' + ma + ':' + d3, cu = docJson(C.get(kv)) || {};
      cu[id] = Date.now();
      C.put(kv, JSON.stringify(cu), HAN);
      return tra({ ok: 1, t: Date.now() });
    }

    if (a === 'nhan') {                               // cá nhân: một ô = một người; ô đã có máy khác giữ thì trả 'co-nguoi'
      var id2 = cat(p.id, 24), kn = 'n:' + ma + ':' + d3, giu = docJson(C.get(kn));
      if (giu && giu.id !== id2) return tra({ ok: 0, loi: 'co-nguoi' });
      var nguoiMoi = { id: id2, ten: cat(p.ten, 40), lop: cat(p.lop, 40), hs: cat(p.hs, 40), t: Date.now() }, ghi2 = {};
      ghi2[kn] = JSON.stringify(nguoiMoi);
      var vo = {}; vo[id2] = Date.now(); ghi2['v:' + ma + ':' + d3] = JSON.stringify(vo);
      C.putAll(ghi2, HAN);
      return tra({ ok: 1, nguoi: nguoiMoi, t: Date.now() });
    }

    if (a === 'gui') {
      var l = String(p.k || '');
      if (LOAI.indexOf(l) < 0) return tra({ ok: 0, loi: 'loai' });
      var bai = { c: cat(p.c, 40), x: cat(p.x, 80), t: Date.now() }, key = l + ':' + ma + ':' + d3;
      var truoc = docJson(C.get(key));                  // cùng câu đã có bài gửi trước (máy khác của đội) thì giữ bài đầu
      if (KHOA_CHAT[l] && truoc && truoc.c === bai.c) return tra({ ok: 1, cu: 1, bai: truoc });
      C.put(key, JSON.stringify(bai), HAN);
      return tra({ ok: 1, bai: bai });
    }
    return tra({ ok: 0, loi: 'hanh-dong' });
  } catch (err) {
    return tra({ ok: 0, loi: String(err && err.message || err) });
  }
}
function docJson(s) { if (!s) return null; try { return JSON.parse(s); } catch (e) { return null; } }
