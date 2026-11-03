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
    doc: function (ma, khoa, n) { return goi({ a: 'doc', ma: ma, khoa: khoa, n: n || 4 }); },
    // Cá nhân (máy chủ 2026-11-04): giữ ô người chơi d; ô có người khác → lỗi 'co-nguoi'
    nhan: function (ma, d, ten, lop, hs) { var p = { a: 'nhan', ma: ma, d: d, id: maMay(), ten: ten, lop: lop || '', hs: hs || '' }; return goi(p).catch(function (e) { if (e.ma) throw e; return goi(p, true); }); },
    xem: function (ma, d) { return goi({ a: 'xem', ma: ma, d: d == null ? '' : d }); },
    vao: function (ma, d) { var p = { a: 'vao', ma: ma, d: d, id: maMay() }; return goi(p).catch(function () { return goi(p, true); }); },
    ping: function () { return goi({ a: 'ping' }); },
    // Gửi bài: thử lại tối đa 3 lần (GET, rồi POST), lỗi máy chủ (ok:0) thì báo đúng mã lỗi
    gui: function (ma, d, k, c, x) {
      var p = { a: 'gui', ma: ma, d: d, k: k, c: c, x: x }, lan = 0;
      return (function thu() {
        lan++;
        return goi(p, lan === 2).catch(function (e) {
          if (lan >= 3 || e.ma === 'khong-co-phong' || e.ma === 'doi' || e.ma === 'loai') throw e;
          return new Promise(function (ok) { setTimeout(ok, 600 * lan); }).then(thu);
        });
      })();
    },
    maMay: maMay
  };
})();
