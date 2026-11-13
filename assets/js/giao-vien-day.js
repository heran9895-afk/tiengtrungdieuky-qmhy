/* Tab "🏫 Dạy trên lớp" của trang giáo viên.
   Chọn lớp → chọn bài → bấm phần muốn dạy → mở toàn màn hình (khung iframe, ẩn header/chân trang).
   Các phần có 🎲 sẵn nút Gọi tên. Nút "👁 Xem như học sinh" mở lại đúng trang đó mà không có công cụ của giáo viên. */
(function () {
  'use strict';
  var HSK = 'chuong-trinh-hsk/hsk1/';
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  function phanBai(n) {
    var d = 'bai-' + n + '/', L = [];
    L.push(['📚 Từ vựng', d + 'tu-vung.html']);
    if (n > 1) L.push(['📐 Ngữ pháp', d + 'ngu-phap.html']);
    if (n > 1) {
      if (n === 3) { L.push(['⚡ Ôn tập 1', d + 'on-tap-1.html'], ['⚡ Ôn tập 2', d + 'on-tap-2.html'], ['⚡ Ôn tập 3.1', d + 'on-tap-3-1.html'], ['⚡ Ôn tập 3.2', d + 'on-tap-3-2.html']); }
      else L.push(['⚡ Ôn tập 1', d + 'on-tap-1.html'], ['⚡ Ôn tập 2', d + 'on-tap-2.html'], ['⚡ Ôn tập 3', d + 'on-tap-3.html']);
    }
    L.push(['🎯 Bài tập', d + 'bai-tap.html', 1], ['📒 Luyện theo sách bài tập', d + 'sach-bai-tap.html', 1]);
    if (n > 1) L.push(['📝 Test đầu giờ', d + 'test-dau-gio.html']);
    return L;
  }
  var MUC = [];
  for (var i = 1; i <= 7; i++) MUC.push({ k: 'bai-' + i, ten: 'Bài ' + i, phan: phanBai(i) });
  MUC.push({ k: 'on-tap-1-5', ten: 'Ôn tập tổng hợp Bài 1–5', phan: [
    ['📚 Từ vựng', 'on-tap-1-5/tu-vung.html'], ['🔤 Ngữ âm', 'on-tap-1-5/ngu-am.html'], ['✍️ Chữ Hán', 'on-tap-1-5/chu-han.html'], ['📐 Ngữ pháp', 'on-tap-1-5/ngu-phap.html'],
    ['🎧 Nghe', 'on-tap-1-5/nghe.html'], ['📖 Đọc hiểu', 'on-tap-1-5/doc-hieu.html'], ['🌏 Dịch Việt → Trung', 'on-tap-1-5/dich.html', 1], ['🔀 Trộn tổng hợp', 'on-tap-1-5/tong-hop.html', 1]] });

  var CSS = '.gvd-hang{display:flex;flex-wrap:wrap;gap:10px 14px;align-items:flex-end;margin-bottom:14px}' +
    '.gvd-hang label{display:flex;flex-direction:column;gap:4px;font-size:13px;font-weight:700;color:var(--muted,#667)}' +
    '.gvd-bai{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}' +
    '.gvd-bai button{border:2px solid var(--line-soft,#dde);background:#fff;border-radius:999px;padding:7px 14px;font:700 14px/1 inherit;cursor:pointer}' +
    '.gvd-bai button.on{background:#0b5a2a;color:#fff;border-color:#0b5a2a}' +
    '.gvd-luoi{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:10px}' +
    '.gvd-the{display:flex;flex-direction:column;gap:8px;border:1px solid var(--line-soft,#dde);border-radius:14px;padding:12px 14px;background:#fff}' +
    '.gvd-the b{font-size:15px}.gvd-the small{color:#b8860b;font-weight:700}' +
    '.gvd-nut{display:flex;gap:6px;flex-wrap:wrap}' +
    '.gvd-on{position:fixed;inset:0;z-index:8000;background:#101;display:flex;flex-direction:column}' +
    '.gvd-top{display:flex;gap:8px;align-items:center;padding:6px 10px;background:#0b5a2a;color:#fff;font-size:14px;flex-wrap:wrap}' +
    '.gvd-top .tieu{font-weight:700;flex:1;min-width:140px}' +
    '.gvd-top button,.gvd-top a{border:0;border-radius:8px;padding:6px 11px;font:700 13px/1.1 inherit;background:rgba(255,255,255,.18);color:#fff;cursor:pointer;text-decoration:none}' +
    '.gvd-top button.on{background:#ffd54a;color:#3b2b00}' +
    '.gvd-on iframe{flex:1;border:0;width:100%;background:#fff}';

  function ve(noi, D, ROOT) {
    if (!document.getElementById('gvdCss')) { var st = document.createElement('style'); st.id = 'gvdCss'; st.textContent = CSS; document.head.appendChild(st); }
    var lop = D.lop.filter(function (l) { return !l.dong; }), luu = {};
    try { luu = JSON.parse(sessionStorage.getItem('gvd') || '{}'); } catch (e) {}
    var cur = { lop: luu.lop || (lop[0] && lop[0].maLop) || '', bai: luu.bai || 'bai-1' };
    if (!lop.some(function (l) { return l.maLop === cur.lop; })) cur.lop = lop[0] ? lop[0].maLop : '';
    function nho() { try { sessionStorage.setItem('gvd', JSON.stringify(cur)); } catch (e) {} }

    function ten(ma) { var l = lop.filter(function (x) { return x.maLop === ma; })[0]; return l ? l.tenLop : ''; }
    function dem(ma) { return D.hocSinh.filter(function (h) { return h.maLop === ma; }).length; }
    function url(path, hs) { return ROOT + HSK + path + '?day=1' + (cur.lop ? '&lop=' + encodeURIComponent(cur.lop) : '') + (hs ? '&xemhs=1' : ''); }

    function mo(path, tieu, hs) {
      var cu = document.querySelector('.gvd-on'); if (cu) cu.remove();
      var o = document.createElement('div'); o.className = 'gvd-on';
      o.innerHTML = '<div class="gvd-top"><span class="tieu">' + esc(tieu) + (cur.lop ? ' · ' + esc(ten(cur.lop)) : '') + (hs ? ' · 👁 đang xem như học sinh' : '') + '</span>' +
        '<button type="button" data-a="hs" class="' + (hs ? 'on' : '') + '">' + (hs ? '🧑‍🏫 Về chế độ cô' : '👁 Xem như học sinh') + '</button>' +
        '<button type="button" data-a="fs">⛶ Toàn màn hình</button><a href="' + esc(url(path, hs).replace('?day=1&', '?').replace('?day=1', '')) + '" target="_blank" rel="noopener">↗ Tab riêng</a>' +
        '<button type="button" data-a="x">✕ Đóng</button></div><iframe src="' + esc(url(path, hs)) + '" allow="autoplay; fullscreen"></iframe>';
      document.body.appendChild(o); document.body.style.overflow = 'hidden';
      o.querySelector('.gvd-top').addEventListener('click', function (e) {
        var b = e.target.closest('button[data-a]'); if (!b) return;
        if (b.dataset.a === 'x') { o.remove(); document.body.style.overflow = ''; }
        else if (b.dataset.a === 'hs') mo(path, tieu, !hs);
        else if (b.dataset.a === 'fs') { try { (o.requestFullscreen || o.webkitRequestFullscreen).call(o); } catch (er) {} }
      });
    }

    function render() {
      var m = MUC.filter(function (x) { return x.k === cur.bai; })[0] || MUC[0];
      noi.innerHTML = '<div class="gv-the"><div class="gv-the-dau"><h3>🏫 Dạy trên lớp</h3></div>' +
        '<p class="gv-phu" style="margin:0 0 12px">Chọn lớp và bài, bấm <b>▶ Dạy</b> để mở toàn màn hình cho cả lớp xem. Các phần có <b>🎲</b> có sẵn nút Gọi tên (tự nạp học sinh của lớp đã chọn).</p>' +
        '<div class="gvd-hang"><label>Lớp<select class="gv-chon gvd-lop">' + (lop.length ? lop.map(function (l) { return '<option value="' + esc(l.maLop) + '"' + (l.maLop === cur.lop ? ' selected' : '') + '>' + esc(l.tenLop) + ' (' + dem(l.maLop) + ' em)</option>'; }).join('') : '<option value="">(chưa có lớp)</option>') + '</select></label></div>' +
        '<div class="gvd-bai">' + MUC.map(function (x) { return '<button type="button" data-b="' + x.k + '" class="' + (x.k === cur.bai ? 'on' : '') + '">' + esc(x.ten) + '</button>'; }).join('') + '</div>' +
        '<div class="gvd-luoi">' + m.phan.map(function (p, i) {
          return '<div class="gvd-the"><b>' + esc(p[0]) + '</b>' + (p[2] ? '<small>🎲 có Gọi tên</small>' : '') +
            '<div class="gvd-nut"><button type="button" class="gv-nut chinh" data-m="' + i + '">▶ Dạy</button><button type="button" class="gv-nut" data-h="' + i + '">👁 Như học sinh</button></div></div>';
        }).join('') + '</div></div>';
      noi.querySelector('.gvd-lop').onchange = function () { cur.lop = this.value; nho(); };
      noi.querySelector('.gvd-bai').onclick = function (e) { var b = e.target.closest('button[data-b]'); if (b) { cur.bai = b.dataset.b; nho(); render(); } };
      noi.querySelector('.gvd-luoi').onclick = function (e) {
        var b = e.target.closest('button[data-m],button[data-h]'); if (!b) return;
        var i = +(b.dataset.m != null ? b.dataset.m : b.dataset.h), p = m.phan[i];
        mo(p[1], m.ten + ' · ' + p[0].replace(/^\S+\s/, ''), b.dataset.h != null);
      };
    }
    render();
  }
  window.QM_GV_DAY = { ve: ve };
})();
