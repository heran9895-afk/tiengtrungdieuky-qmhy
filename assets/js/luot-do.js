/* =========================================================
   LƯỢT LÀM DỞ — lưu để lần sau vào làm tiếp (Ôn tập tổng hợp và các phần làm dài)
   Lưu trên máy (khoá "qm-luot-do-v1"): { v:1, ds: { <khoá>: { t, ten, url, tom, du } | { t, xoa:true } } }
     khoá: "on-tap-1-5/ngu-phap", "on-tap-1-5/dich-cau"… · ten: tên phần · tom: "câu 12 / 33" · du: dữ liệu riêng của bộ máy.
   Làm xong / bỏ lượt: ghi dấu xoá (xoa:true) để máy khác cũng bỏ khi đồng bộ. Quá 14 ngày thì tự bỏ.
   Học sinh đăng nhập Google: tai-khoan.js đưa "ds" vào gói đồng bộ tiến độ (mới hơn thắng), nên làm tiếp được trên máy khác.
   Sự kiện: 'qm-luot-do' (vừa lưu / xoá trên máy này) · 'qm-luot-do-nap' (vừa nhận bản đồng bộ từ máy chủ).
   window.QM_LD = { luu(khoa, o), doc(khoa), xoa(khoa), tatCa(tienTo), keo(), luc(t) }
   ========================================================= */
(function () {
  if (window.QM_LD) return;
  var K = 'qm-luot-do-v1', HAN = 14 * 864e5;
  function docAll() { try { var d = JSON.parse(localStorage.getItem(K)); if (d && d.v === 1 && d.ds) return d; } catch (e) {} return { v: 1, ds: {} }; }
  function ghiAll(d) {
    var now = Date.now();
    Object.keys(d.ds).forEach(function (k) { if (now - (+d.ds[k].t || 0) > HAN) delete d.ds[k]; });
    try { localStorage.setItem(K, JSON.stringify(d)); } catch (e) {}
  }
  function bao() { try { document.dispatchEvent(new CustomEvent('qm-luot-do')); } catch (e) {} }
  function luu(khoa, o) {
    var d = docAll();
    d.ds[khoa] = { t: Date.now(), ten: o.ten || '', url: o.url || location.pathname, tom: o.tom || '', du: o.du };
    ghiAll(d); bao();
  }
  function doc(khoa) {
    var e = docAll().ds[khoa];
    return e && !e.xoa && Date.now() - (+e.t || 0) <= HAN ? e : null;
  }
  function xoa(khoa) { var d = docAll(); if (!d.ds[khoa] || d.ds[khoa].xoa) return; d.ds[khoa] = { t: Date.now(), xoa: true }; ghiAll(d); bao(); }
  function tatCa(tienTo) {
    var d = docAll(), kq = [];
    Object.keys(d.ds).forEach(function (k) { var e = d.ds[k]; if (!e.xoa && (!tienTo || k.indexOf(tienTo) === 0) && Date.now() - (+e.t || 0) <= HAN) kq.push(Object.assign({ khoa: k }, e)); });
    return kq.sort(function (a, b) { return b.t - a.t; });
  }
  function keo() { if (window.QM_TK && QM_TK.dongBo && QM_TK.hoSoId()) QM_TK.dongBo(); }   // đã đăng nhập: kéo bản mới nhất (có thể từ máy khác)
  function luc(t) {                                         // "lúc 20:15 hôm nay" / "lúc 20:15 hôm qua" / "ngày 28/10"
    var d = new Date(+t), nay = new Date(), hq = new Date(Date.now() - 864e5);
    var gio = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    if (d.toDateString() === nay.toDateString()) return 'lúc ' + gio + ' hôm nay';
    if (d.toDateString() === hq.toDateString()) return 'lúc ' + gio + ' hôm qua';
    return 'lúc ' + gio + ' ngày ' + d.getDate() + '/' + (d.getMonth() + 1);
  }
  window.QM_LD = { luu: luu, doc: doc, xoa: xoa, tatCa: tatCa, keo: keo, luc: luc, KHOA: K };
})();
