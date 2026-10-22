/* =========================================================
   TIẾN ĐỘ HỌC TỪ VỰNG + TỪ KHÓ ⭐ · Tiếng Trung Diệu Kỳ
   Lưu ngay trên trình duyệt của học sinh (localStorage), không cần đăng nhập.
   Mọi dữ liệu gói trong MỘT bản ghi (khoá "qm-tien-do-v1") để sau này gắn đăng nhập
   chỉ cần đồng bộ đúng bản ghi này lên máy chủ, không phải làm lại.

   Mỗi từ (theo Mã) có một "hộp" từ 0 đến 4 (kiểu hộp thẻ Leitner):
     đúng → lên 1 hộp; sai → về hộp 1.  Hộp 0 = mới  ·  hộp 1–2 = đang học  ·  hộp 3–4 = đã thuộc.
   ========================================================= */
(function () {
  var KHOA = 'qm-tien-do-v1', THUOC = 3, TOI_DA = 4;
  var D = { v: 1, tu: {}, kho: {}, capNhat: 0 };
  try { var cu = JSON.parse(localStorage.getItem(KHOA)); if (cu && cu.v === 1) D = cu; } catch (e) {}
  D.tu = D.tu || {}; D.kho = D.kho || {};

  function luu(ma) {
    D.capNhat = Date.now();
    try { localStorage.setItem(KHOA, JSON.stringify(D)); } catch (e) {}   // máy chặn lưu: vẫn học được, chỉ không nhớ lâu
    document.dispatchEvent(new CustomEvent('qm-tien-do', { detail: { ma: ma } }));
  }
  function hop(ma) { return (D.tu[ma] || {}).h || 0; }
  function trangThai(ma) { var h = hop(ma); return h >= THUOC ? 'thuoc' : D.tu[ma] ? 'dang' : 'moi'; }

  window.QM_TIENDO = {
    hop: hop,
    trangThai: trangThai,
    // Ghi một lần trả lời. w: từ (cần .ma, .cap). dung: đúng/sai.
    ghi: function (w, dung) {
      var t = D.tu[w.ma] || (D.tu[w.ma] = { h: 0, d: 0, s: 0, c: w.cap });
      if (dung) { t.d++; t.h = Math.min(TOI_DA, t.h + 1); } else { t.s++; t.h = 1; }
      t.t = Date.now(); luu(w.ma);
    },
    laKho: function (ma) { return !!D.kho[ma]; },
    datKho: function (w, bat) {                    // bật/tắt ⭐ từ khó; lưu kèm cấp để biết tải dữ liệu cấp nào
      if (bat) D.kho[w.ma] = w.cap; else delete D.kho[w.ma];
      luu(w.ma);
    },
    dsKho: function () { return Object.keys(D.kho).map(function (ma) { return { ma: ma, cap: D.kho[ma] }; }); },
    // Đếm trạng thái của một danh sách từ
    dem: function (ds) {
      var r = { moi: 0, dang: 0, thuoc: 0 };
      ds.forEach(function (w) { r[trangThai(w.ma)]++; }); return r;
    },
    xoaHet: function () { D = { v: 1, tu: {}, kho: {}, capNhat: Date.now() }; luu(null); }
  };
})();
