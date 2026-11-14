/* =========================================================
   NHẬT KÝ TỪNG LẦN LÀM + THỜI GIAN HỌC THỰC TẾ — Tiếng Trung Diệu Kỳ (2026-11-14)
   Mọi bộ luyện tập gọi QM_NK để ghi từng câu; web gửi gộp về máy chủ tài khoản (lệnh nhatKyGoi) mỗi ~25 giây và khi rời trang.
   Chưa gửi được (mất mạng) thì giữ trong hàng đợi trên máy (khoá qmhy:nkHang) và gửi lại; mỗi gói có maGoi nên máy chủ không ghi trùng.
   Lượt bỏ dở cũng có dữ liệu: từng câu đã làm được gửi ngay khi rời trang; lượt chưa "xong" được đánh dấu "dang" (bỏ dở).

   window.QM_NK = {
     hinhThuc: 'tu-hoc' | 'lop-co-gv'   (Phòng lớp đặt 'lop-co-gv' kèm maBoDe, maBuoi qua dat())
     batDauLuot({ phan, bai, nhomBo }) → maLuot      nhomBo: 'chung' | 'moRong' | 'tongHop'
     cau(maLuot, { stt, dang, maCau, deBai, dapAn, chon, dung, nhom, lanThu, giayDung })
     xongLuot(maLuot, giay)  ·  khach({ hoTen, lop })  ·  gui()
   }
   Thời gian học: chỉ tính khi tab đang hiển thị VÀ có thao tác trong 2 phút gần nhất; nghỉ quá 30 phút thì là lượt truy cập mới.
   ========================================================= */
(function () {
  if (window.QM_NK) return;
  var KH = 'qmhy:nkHang', KP = 'qmhy:nkPhien', KM = 'qmhy:maMay', NGHI = 30 * 60000, DUNG_YEN = 120000, TOI_DA_DONG = 2000;
  function doc(k, md) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : md; } catch (e) { return md; } }
  function ghi(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function ngau() { return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
  function maMay() { var m = doc(KM, ''); if (!m) { m = 'm-' + ngau(); ghi(KM, m); } return m; }
  var thietBi = /iPad|Tablet/i.test(navigator.userAgent) ? 'may-tinh-bang' : /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'dien-thoai' : 'may-tinh';

  var hang = doc(KH, null); if (!hang || hang.v !== 1) hang = { v: 1, dong: [], luot: {}, tg: {}, thu: null };
  var khachAi = { hoTen: '', lop: '' }, dangGui = false, chiGuiLai = 0, luotCuoi = 0;
  function luu() { ghi(KH, hang); }

  var NK = window.QM_NK = { hinhThuc: 'tu-hoc', maBoDe: '', maBuoi: '' };
  NK.dat = function (o) { o = o || {}; if (o.hinhThuc) NK.hinhThuc = o.hinhThuc; if ('maBoDe' in o) NK.maBoDe = o.maBoDe || ''; if ('maBuoi' in o) NK.maBuoi = o.maBuoi || ''; };
  NK.khach = function (o) { if (o) { khachAi.hoTen = String(o.hoTen || '').slice(0, 60); khachAi.lop = String(o.lop || '').slice(0, 40); } };

  NK.batDauLuot = function (o) {
    try {
      o = o || {}; var ma = o.maLuot || ngau();
      hang.luot[ma] = { maLuot: ma, hinhThuc: NK.hinhThuc, nhomBo: o.nhomBo || 'tongHop', phan: o.phan || '', bai: o.bai || '', maBoDe: NK.maBoDe, maBuoi: NK.maBuoi,
        batDau: Date.now(), soCau: 0, soDung: 0, giay: 0, trangThai: 'dang', v: 1 };
      luu(); return ma;
    } catch (e) { return ''; }
  };
  NK.cau = function (ma, c) {
    try {
      if (!ma || !hang.luot[ma]) return; c = c || {};
      var l = hang.luot[ma];
      hang.dong.push({ t: Date.now(), maLuot: ma, hinhThuc: l.hinhThuc, nhom: c.nhom || 'chung', phan: l.phan, bai: l.bai, stt: c.stt || l.soCau + 1, dang: c.dang || '', maCau: c.maCau || '',
        deBai: c.deBai || '', dapAn: c.dapAn || '', chon: c.chon || '', dung: c.dung ? 1 : 0, lanThu: c.lanThu || 1, giayDung: c.giayDung || 0 });
      if (hang.dong.length > TOI_DA_DONG) hang.dong.splice(0, hang.dong.length - TOI_DA_DONG);
      l.soCau++; if (c.dung) l.soDung++; l.giay = Math.round((Date.now() - l.batDau) / 1000); l.v++;
      luu(); if (hang.dong.length >= 12) NK.gui();
    } catch (e) {}
  };
  // Dùng cho các bộ có sẵn đối tượng lượt L {ma, kq[]}: tự mở lượt nhật ký lần đầu (mã lượt = L.ma, dùng chung với bảng điểm), rồi ghi câu k
  NK.theoL = function (L, meta, k, nhom) {
    try {
      if (!L.nk) { L.nk = 1; NK.batDauLuot({ maLuot: L.ma, phan: meta.phan, bai: meta.bai || '', nhomBo: meta.nhomBo || 'tongHop' }); }
      NK.cau(L.ma, { stt: k.stt, dang: k.dang + (k.tenNhom ? ' · ' + k.tenNhom : (k.nhom && typeof k.nhom === 'string' && k.nhom !== 'moRong' && k.nhom !== 'chung' ? ' · ' + k.nhom : '')), maCau: k.maCau, deBai: k.deBai, dapAn: k.dapAn, chon: k.chon,
        dung: k.dung || k.tuDanhGia === 'dung' ? 1 : 0, nhom: nhom || 'chung', giayDung: k.giay });
    } catch (e) {}
  };
  NK.xongLuot = function (ma, giay) {
    try { var l = hang.luot[ma]; if (!l) return; l.trangThai = 'xong'; l.giay = giay != null ? Math.round(giay) : Math.round((Date.now() - l.batDau) / 1000); l.v++; luu(); NK.gui(); } catch (e) {}
  };

  // ---------- Gửi gộp ----------
  function coViec() { return hang.dong.length || Object.keys(hang.luot).length || Object.keys(hang.tg).some(function (k) { return hang.tg[k].giay > 0; }); }
  function chuanBi() {
    if (hang.thu) return hang.thu;                               // gói trước chưa gửi xong: gửi lại đúng gói đó (cùng maGoi)
    if (!coViec()) return null;
    var thu = { maGoi: ngau(), dong: hang.dong.splice(0, 60), luot: [], luotV: {}, tg: {} };
    Object.keys(hang.luot).slice(0, 30).forEach(function (k) { thu.luot.push(hang.luot[k]); thu.luotV[k] = hang.luot[k].v; });
    Object.keys(hang.tg).forEach(function (k) { var g = hang.tg[k]; if (g.giay > 0) { thu.tg[k] = { giay: g.giay, trang: g.trang, batDau: g.batDau }; g.giay = 0; g.trang = []; } });
    hang.thu = thu; luu(); return thu;
  }
  NK.gui = function (roiTrang) {
    try {
      if (dangGui || !window.QM_TK || !QM_TK.goi || Date.now() < chiGuiLai) return;
      chuyenGiay();
      var thu = chuanBi(); if (!thu) return;
      dangGui = true;
      var hs = QM_TK.hoSoDang ? QM_TK.hoSoDang() : null;
      QM_TK.goi('nhatKyGoi', { maGoi: thu.maGoi, dong: thu.dong, luot: thu.luot, tg: thu.tg, hoSoId: QM_TK.hoSoId ? QM_TK.hoSoId() : '',
        hoTen: khachAi.hoTen || (hs && hs.hoTen) || '', lop: khachAi.lop || (hs && hs.lop) || '', maMay: maMay(), thietBi: thietBi }, !!roiTrang)
        .then(function () {
          Object.keys(thu.luotV).forEach(function (k) { if (hang.luot[k] && hang.luot[k].v === thu.luotV[k]) delete hang.luot[k]; });
          hang.thu = null; luu(); dangGui = false;
          if (hang.dong.length > 60) NK.gui();
        }).catch(function () { dangGui = false; chiGuiLai = Date.now() + 60000; });
    } catch (e) { dangGui = false; }
  };
  setInterval(function () { if (hang.thu || hang.dong.length || Object.keys(hang.luot).length || (Date.now() - luotCuoi > 120000 && Object.keys(hang.tg).some(function (k) { return hang.tg[k].giay > 0; }))) { luotCuoi = Date.now(); NK.gui(); } }, 25000);

  // ---------- Thời gian học thực tế ----------
  var ganNhat = Date.now(), giayChua = 0, phien = doc(KP, null);
  ['pointerdown', 'keydown', 'touchstart', 'scroll', 'wheel', 'mousemove'].forEach(function (ev) { window.addEventListener(ev, function () { ganNhat = Date.now(); }, { passive: true, capture: true }); });
  function nhanTrang() { return location.pathname.replace(/^.*?(chuong-trinh-hsk|thu-vien|lop|giao-vien|index\.html|gioi-thieu\.html|$)/, '$1') || '/'; }
  function phienHienTai() {
    var bayGio = Date.now();
    if (!phien || bayGio - (phien.last || 0) > NGHI) phien = { id: 'tg-' + ngau(), batDau: bayGio, last: bayGio };
    return phien;
  }
  function chuyenGiay() {
    if (giayChua <= 0) return;
    var p = phienHienTai(), g = hang.tg[p.id] = hang.tg[p.id] || { giay: 0, trang: [], batDau: p.batDau };
    g.giay += giayChua; giayChua = 0;
    var t = nhanTrang(); if (g.trang.indexOf(t) < 0 && g.trang.length < 10) g.trang.push(t);
    luu();
  }
  var dem = 0;
  setInterval(function () {
    if (document.visibilityState !== 'visible' || Date.now() - ganNhat > DUNG_YEN) return;
    var p = phienHienTai(); p.last = Date.now(); giayChua++;
    if (++dem % 15 === 0) { ghi(KP, p); chuyenGiay(); }
  }, 1000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') { chuyenGiay(); ghi(KP, phien); NK.gui(true); } });
  window.addEventListener('pagehide', function () { chuyenGiay(); ghi(KP, phien); NK.gui(true); });
  setTimeout(NK.gui, 4000);                                     // gói tồn từ lần mở trước: gửi sớm
})();
