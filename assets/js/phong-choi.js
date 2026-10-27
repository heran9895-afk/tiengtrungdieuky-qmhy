/* =========================================================
   PHÒNG CHƠI — nối màn chiếu và điện thoại các đội qua máy chủ Apps Script (QM_PHONG_API trong cau-hinh.js)
   Màn chiếu: tao → ghi (trạng thái) / doc (đội đã vào, bài các đội gửi). Điện thoại: xem / vao / gui.
   Giao thức xem đầu file may-chu-phong-choi (Project: claude/may-chu-phong-choi-Code.gs).
   ========================================================= */
(function () {
  function api() { return window.QM_PHONG_API || ''; }
  function goi(p, post) {
    var A = api();
    if (!A) return Promise.reject(new Error('chua-noi'));
    var url = A, opt;
    if (post) opt = { method: 'POST', body: JSON.stringify(p) };            // chuỗi → text/plain: không cần hỏi trước (CORS)
    else url += (A.indexOf('?') < 0 ? '?' : '&') + Object.keys(p).map(function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(p[k]); }).join('&');
    return fetch(url, opt).then(function (r) { return r.json(); }).then(function (o) {
      if (!o || !o.ok) { var e = new Error((o && o.loi) || 'loi'); e.ma = o && o.loi; throw e; }
      return o;
    });
  }
  // Ghi trạng thái: chỉ một lần ghi tại một thời điểm, lần ghi sau đè lần đang chờ (giữ bản mới nhất)
  var cho = null, dangGhi = false;
  function ghi(ma, khoa, s) {
    cho = { ma: ma, khoa: khoa, s: s };
    if (dangGhi) return;
    (function chay() {
      if (!cho) { dangGhi = false; return; }
      dangGhi = true;
      var x = cho; cho = null;
      goi({ a: 'ghi', ma: x.ma, khoa: x.khoa, s: JSON.stringify(x.s) }, true).catch(function () { if (!cho) cho = x; })
        .then(function () { setTimeout(chay, 120); });
    })();
  }
  function maMay() {   // mã riêng của máy (để đếm số máy mỗi đội)
    var k = 'qm-may-id', id = '';
    try { id = localStorage.getItem(k) || ''; if (!id) { id = Math.random().toString(36).slice(2, 12); localStorage.setItem(k, id); } } catch (e) { id = Math.random().toString(36).slice(2, 12); }
    return id;
  }
  window.QM_PHONG = {
    coMayChu: function () { return !!api(); },
    tao: function () { return goi({ a: 'tao' }); },
    ghi: ghi,
    doc: function (ma, khoa) { return goi({ a: 'doc', ma: ma, khoa: khoa }); },
    xem: function (ma, d) { return goi({ a: 'xem', ma: ma, d: d == null ? '' : d }); },
    vao: function (ma, d) { return goi({ a: 'vao', ma: ma, d: d, id: maMay() }); },
    gui: function (ma, d, k, c, x) { return goi({ a: 'gui', ma: ma, d: d, k: k, c: c, x: x }); },
    maMay: maMay
  };
})();
