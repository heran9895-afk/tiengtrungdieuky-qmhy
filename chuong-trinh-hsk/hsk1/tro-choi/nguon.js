/* =========================================================
   NGUỒN BÀI CHO TRÒ CHƠI HSK 1 (HSK 3.0) — một chỗ cho mọi trò trong thư mục này
   Thêm bài mới: thêm MỘT dòng vào "bai" (ma = tên file trong data/bai/, diem = phần "bai<số>" của mã điểm).
   Chém chữ Hán và Đỉnh luyện chữ cần thêm file data/bai/tro-choi/<ma>.json (dựng bằng tools/tro_choi_du_lieu.py hsk3).
   ========================================================= */
(function () {
  var V = '?v=20261028a', D = '../../../data/bai/';
  var BAI = [
    { ma: 'bai-1', ten: 'Bài 1', diem: 'bai1' },
    { ma: 'bai-2', ten: 'Bài 2', diem: 'bai2' },
    { ma: 'bai-3', ten: 'Bài 3', diem: 'bai3' },
    { ma: 'bai-4', ten: 'Bài 4', diem: 'bai4' }
  ];
  var CHUNG = { phamVi: 'h3-hsk1', tongHop: true, maDiem: '', tenDiem: 'HSK 3.0 · ', tongHopDiem: 'hsk1-tong-hop-bai0', bxh: 'bang-xep-hang.html' };   // mã điểm HSK 3.0 không có tiền tố, như Bài tập 3.0
  function cauHinh(thuMuc) {
    var o = {}; Object.keys(CHUNG).forEach(function (k) { o[k] = CHUNG[k]; });
    o.nhom = BAI.map(function (b) { return { ma: b.ma, ten: b.ten, diem: b.diem, tep: thuMuc === 'tc' ? D + 'tro-choi/' + b.ma + '.json' + V : [D + b.ma + '.json' + V] }; });
    return o;
  }
  window.QM_NGUON_TC = { BAI: BAI, CHUNG: CHUNG, cauHinh: cauHinh };
  window.QM_BB = cauHinh('bai');     // Bắn bóng bay
  window.QM_TC = cauHinh('tc');      // Chém chữ Hán, Đỉnh luyện chữ
  var lop = cauHinh('bai'); lop.tro = (window.QM_LOP || {}).tro; window.QM_LOP = lop;   // trò chơi cả lớp (trang đặt QM_LOP = { tro } trước)
})();
