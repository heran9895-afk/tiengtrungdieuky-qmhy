/* =========================================================
   ĐIỂM TRÒ CHƠI CÁ NHÂN — ô họ tên + lớp, gửi điểm lên máy chủ điểm của web (QM_API, quy chuẩn 09)
   Dùng chung cho Bắn bóng bay, Chém chữ Hán, Đỉnh luyện chữ. Họ tên + lớp nhớ chung với trang Bài tập (khoá qmhy:hoSo).
   Mã bài: <chương trình>-<bài>-tro-choi-<trò>[-<mức>], vd h2-bai3-tro-choi-bong-bay-tb (HSK 2.0) · bai3-tro-choi-bong-bay-tb (HSK 3.0, như mã Bài tập 3.0)
   Tổng hợp HSK 1: h2-hsk1-tong-hop-bai0-… / hsk1-tong-hop-bai0-…
   (máy chủ điểm chỉ nhận mã có "bai<số>", nên Tổng hợp dùng "bai0").
   ========================================================= */
(function () {
  var KHOA = 'qmhy:hoSo';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hoSo() { try { var h = JSON.parse(localStorage.getItem(KHOA) || '{}'); return { hoTen: h.hoTen || '', lop: h.lop || '' }; } catch (e) { return { hoTen: '', lop: '' }; } }
  function luu(hoTen, lop) { try { localStorage.setItem(KHOA, JSON.stringify({ hoTen: hoTen, lop: lop })); } catch (e) {} }
  function gon(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }

  // Ô nhập họ tên + lớp (đặt trong màn bắt đầu của trò)
  function oNhap(ghiChu) {
    var h = hoSo();
    return '<div class="dd-hs"><input type="text" class="dd-ten" placeholder="Họ tên đầy đủ" autocomplete="name" value="' + esc(h.hoTen) + '" aria-label="Họ tên đầy đủ">' +
      '<input type="text" class="dd-lop" placeholder="Lớp" value="' + esc(h.lop) + '" aria-label="Lớp"></div>' +
      '<p class="dd-ghi">' + (ghiChu || 'Điền họ tên và lớp để lên Bảng xếp hạng. Không điền vẫn chơi được, chỉ là không lưu điểm.') + '</p>';
  }
  function docNhap(khung) {
    var t = khung.querySelector('.dd-ten'), l = khung.querySelector('.dd-lop');
    if (!t) return hoSo();
    var h = { hoTen: gon(t.value), lop: gon(l.value) };
    luu(h.hoTen, h.lop);
    return h;
  }

  function maBai(goc, diem, tro, muc) { return [goc, diem, 'tro-choi', tro].concat(muc ? [muc] : []).filter(Boolean).join('-'); }   // HSK 3.0 không có tiền tố (bai1-tro-choi-…)

  // Gửi điểm. o = { lesson, lessonTitle, score, total, bestStreak, durationSeconds, chiTiet:[{stt,dang,cauHoi,dapAn,chon,dung}], hoTen, lop, linkBxh }
  // khu: phần tử hiện trạng thái (đang lưu / đã lưu / lỗi + Gửi lại / ô điền tên nếu thiếu)
  function gui(o, khu) {
    var api = window.QM_API;
    if (!khu) return;
    if (!api) { khu.innerHTML = '<p class="dd-bao">Bảng xếp hạng chưa được nối nên điểm chưa được lưu.</p>'; return; }
    if (!o.hoTen || !o.lop) {
      khu.innerHTML = '<div class="dd-luu"><p class="dd-bao">Điền họ tên và lớp để lưu điểm lần này lên Bảng xếp hạng:</p>' + oNhap(' ') +
        '<button type="button" class="btn solid dd-gui">Lưu điểm</button></div>';
      khu.querySelector('.dd-gui').addEventListener('click', function () {
        var h = docNhap(khu); if (!h.hoTen || !h.lop) { khu.querySelector(h.hoTen ? '.dd-lop' : '.dd-ten').focus(); return; }
        o.hoTen = h.hoTen; o.lop = h.lop; gui(o, khu);
      });
      return;
    }
    khu.innerHTML = '<p class="dd-bao">⏳ Đang lưu điểm lên Bảng xếp hạng…</p>';
    var goi = { action: 'submit', lesson: o.lesson, lessonTitle: o.lessonTitle || '', hoTen: o.hoTen, lop: o.lop,
      score: o.score, total: Math.max(o.total || 0, o.score), bestStreak: o.bestStreak || 0, durationSeconds: Math.round(o.durationSeconds || 0),
      hoSoId: window.QM_TK && QM_TK.hoSoId ? QM_TK.hoSoId() : '', chiTiet: o.chiTiet || [] };
    fetch(api, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(goi) })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.ok) throw new Error((d && d.loi) || 'Máy chủ không nhận điểm');
        khu.innerHTML = '<p class="dd-bao ok">✅ Đã lưu điểm (lượt ' + d.attemptNo + ').' + (o.linkBxh ? ' <a href="' + esc(o.linkBxh) + '">Xem Bảng xếp hạng ›</a>' : '') + '</p>';
      })
      .catch(function (e) {
        khu.innerHTML = '<p class="dd-bao loi">⚠️ Chưa lưu được điểm: ' + esc(e.message || 'lỗi mạng') + '</p><button type="button" class="btn dd-lai">Gửi lại</button>';
        khu.querySelector('.dd-lai').addEventListener('click', function () { gui(o, khu); });
      });
  }

  window.QM_DIEM = { hoSo: hoSo, luu: luu, oNhap: oNhap, docNhap: docNhap, maBai: maBai, gui: gui };
})();
