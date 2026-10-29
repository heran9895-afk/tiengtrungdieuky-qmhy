/* =========================================================
   ÔN TẬP TỔNG HỢP — GỬI BÀI LÀM VỀ SHEET (dùng chung cho mọi phần của thẻ Ôn tập tổng hợp)
   Lệnh máy chủ điểm: POST {action:'otLuot', maLuot, phan, …, cau:[…]} → trang tính OnTapLuot / OnTapCau.
   Không lên Bảng xếp hạng. Gửi không được thì giữ hàng đợi trên máy (khoá qmhy:otHang, tối đa 30 lượt)
   và tự gửi lại lần mở trang sau. Máy chủ bỏ qua lượt trùng mã.
   window.QM_OTG = { gui(goi, khu, ten), guiHang(), maLuot(), maMay(), thietBi(), PHIEN_BAN }
   ========================================================= */
(function () {
  var PHIEN_BAN = '2026-10-30a', KHOA_HANG = 'qmhy:otHang', KHOA_MAY = 'qmhy:maMay';
  function docLS(k, md) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : md; } catch (e) { return md; } }
  function ghiLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function maNgauNhien() { return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
  function maMay() { var m = docLS(KHOA_MAY, ''); if (!m) { m = 'm-' + maNgauNhien(); ghiLS(KHOA_MAY, m); } return m; }
  function thietBi() { return (window.matchMedia && matchMedia('(pointer:coarse)').matches ? 'cam-ung' : 'chuot') + ' ' + window.innerWidth + 'x' + window.innerHeight; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function guiMot(p) {
    return fetch(window.QM_API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(p) })
      .then(function (r) { return r.json(); }).then(function (d) { if (!d || !d.ok) throw new Error((d && d.loi) || 'Máy chủ không nhận'); return d; });
  }
  function boKhoiHang(ma) { ghiLS(KHOA_HANG, docLS(KHOA_HANG, []).filter(function (p) { return p.maLuot !== ma; })); }
  function guiHang() {
    if (!window.QM_API) return Promise.resolve();
    return docLS(KHOA_HANG, []).reduce(function (pr, p) {
      return pr.then(function () { return guiMot(p).then(function () { boKhoiHang(p.maLuot); }).catch(function () {}); });
    }, Promise.resolve());
  }
  // goi: đã có maLuot, phan, cau…; khu: phần tử hiện trạng thái gửi; ten: tên phần để báo ("Ngữ âm")
  function gui(goi, khu, ten) {
    goi.action = 'otLuot'; goi.phienBan = goi.phienBan || PHIEN_BAN; goi.chuongTrinh = 'hsk3';
    goi.maMay = maMay(); goi.thietBi = thietBi();
    goi.hoSoId = window.QM_TK && QM_TK.hoSoId ? QM_TK.hoSoId() : '';
    var hang = docLS(KHOA_HANG, []); hang.push(goi); ghiLS(KHOA_HANG, hang.slice(-30));
    if (!khu) return;
    if (!window.QM_API) { khu.innerHTML = '<p class="lt-luu-ghi">Kết quả đã lưu trên máy này.</p>'; return; }
    khu.innerHTML = '<p class="lt-luu-ghi">⏳ Đang gửi bài làm cho cô…</p>';
    guiMot(goi).then(function (d) {
      boKhoiHang(goi.maLuot);
      khu.innerHTML = '<p class="lt-luu-ok">✅ Đã gửi bài làm cho cô' + (d.lanLam ? ' (lượt thứ ' + d.lanLam + ' của phần ' + esc(ten || goi.phan) + ')' : '') + '.</p>';
    }).catch(function (e) {
      khu.innerHTML = '<p class="lt-luu-ghi">💾 Bài làm đã lưu tạm trên máy, web sẽ tự gửi cho cô vào lần mở trang sau.<br><small class="ot-ly-do">Lý do: ' + esc(e.message || 'lỗi mạng') + '</small></p>';
      fetch(window.QM_API).then(function (r) { return r.json(); }).then(function (d) {
        var lyDo = khu.querySelector('.ot-ly-do');
        if (lyDo && d && d.phienBan && d.phienBan < PHIEN_BAN) lyDo.textContent += ' · Máy chủ điểm đang chạy bản ' + d.phienBan + ', cần bản ' + PHIEN_BAN + ' trở lên.';
      }).catch(function () {});
    });
  }
  window.QM_OTG = { gui: gui, guiHang: guiHang, maLuot: maNgauNhien, maMay: maMay, thietBi: thietBi, PHIEN_BAN: PHIEN_BAN };
  setTimeout(guiHang, 4000);                                  // đợi header.js nạp xong cau-hinh.js (QM_API)
})();
