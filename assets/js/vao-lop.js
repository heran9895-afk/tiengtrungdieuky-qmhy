/* VÀO LỚP — phía học sinh (trang lop/). Có ?ma=1234: vào phòng lớp cô đang dạy (xem câu hỏi, được gọi thì trả lời).
   Không có mã: nhập mã + xem lại các buổi học của lớp (câu hỏi + đáp án đúng). Cần đăng nhập, đã chọn hồ sơ. */
(function () {
  'use strict';
  var el = document.getElementById('vao-lop'); if (!el) return;
  var QS = new URLSearchParams(location.search), MA = (QS.get('ma') || '').replace(/\D/g, '').slice(0, 4);
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };

  var CSS = '.lop-bao{padding:12px 14px;border-radius:14px;background:#eef6f0;border:1.5px solid #b9d8c2;margin-bottom:12px;font-weight:700;text-align:center}' +
    '.lop-bao.toi{background:#fff3c4;border-color:#e0b400;font-size:19px;animation:lopnhay 1s infinite}@keyframes lopnhay{50%{transform:scale(1.02)}}' +
    '.lop-bao small{display:block;font-weight:400;opacity:.8}' +
    '.lop-doc .lt-dap-o{pointer-events:none}.lop-toi .lt-dap-o{pointer-events:auto;cursor:pointer}' +
    '.lop-ma{display:flex;gap:8px;justify-content:center;margin:10px 0}.lop-ma input{font:800 26px/1 inherit;width:140px;text-align:center;letter-spacing:.2em;padding:10px;border-radius:12px;border:2px solid var(--line-soft,#cde)}' +
    '.lop-buoi{border:1px solid var(--line-soft,#dde);border-radius:14px;margin:10px 0;background:#fff}.lop-buoi>summary{padding:12px 14px;cursor:pointer;font-weight:700}' +
    '.lop-cau{padding:10px 14px;border-top:1px dashed var(--line-soft,#dde)}.lop-cau .de{font-weight:700;margin-bottom:6px}' +
    '.lop-cau ol{margin:4px 0 4px 20px;padding:0}.lop-cau li.dung{color:#14803c;font-weight:700}.lop-cau .giai{font-size:13px;opacity:.85;margin-top:4px}';
  if (MA.length === 4) CSS += '.sh-header{display:none!important}';          // trong phòng: bỏ biển hiệu lớn cho rộng chỗ trên điện thoại
  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  function cho(f) { var n = 0; (function t() { if (window.QM_TK && QM_TK.goi && QM_TK.phien) return f(); if (++n < 80) setTimeout(t, 150); else el.innerHTML = '<p class="lt-luu-y">Chưa tải được phần tài khoản, bạn tải lại trang nhé.</p>'; })(); }
  function can() {                                           // cần đăng nhập + hồ sơ
    if (!QM_TK.phien()) {
      el.innerHTML = '<div class="card" style="text-align:center"><h2>🏫 Vào lớp học</h2><p>Bạn đăng nhập tài khoản và chọn hồ sơ của mình để vào lớp nhé.</p><button type="button" class="btn solid" id="lopDn">Đăng nhập</button></div>';
      document.getElementById('lopDn').onclick = function () { QM_TK.dangNhap('Đăng nhập để vào lớp học.'); };
      var t = setInterval(function () { if (QM_TK.phien()) { clearInterval(t); khoiDong(); } }, 700); return false;
    }
    if (!QM_TK.hoSoId()) {
      el.innerHTML = '<div class="card" style="text-align:center"><h2>🏫 Chọn hồ sơ</h2><p>Bạn chọn hồ sơ học sinh của mình (nút tài khoản trên đầu trang) để vào lớp.</p><button type="button" class="btn solid" id="lopHs">Chọn hồ sơ</button></div>';
      document.getElementById('lopHs').onclick = function () { QM_TK.moTaiKhoan(); };
      var t2 = setInterval(function () { if (QM_TK.hoSoId()) { clearInterval(t2); khoiDong(); } }, 700); return false;
    }
    return true;
  }
  function khoiDong() { if (!can()) return; if (MA.length === 4) vaoPhong(MA); else trangChu(); }

  // ---------- trang chính: nhập mã + buổi học đã lưu ----------
  function trangChu() {
    el.innerHTML = '<div class="card" style="text-align:center"><h2>🏫 Vào lớp học</h2><p>Nhập mã 4 số trên màn chiếu của cô:</p>' +
      '<form class="lop-ma"><input inputmode="numeric" maxlength="4" placeholder="••••" id="lopMa" autocomplete="off"><button class="btn solid" type="submit">Vào</button></form></div>' +
      '<h2 style="margin-top:22px">📚 Các buổi học của lớp</h2><div id="lopBuoi"><p class="lt-luu-y">⏳ Đang tải…</p></div>';
    el.querySelector('form').onsubmit = function (e) { e.preventDefault(); var m = document.getElementById('lopMa').value.replace(/\D/g, ''); if (m.length === 4) location.href = 'index.html?ma=' + m; };
    QM_TK.goi('buoiHocCuaToi', { hoSoId: QM_TK.hoSoId() }).then(function (d) {
      var b = d.buoi || [], k = document.getElementById('lopBuoi');
      if (!b.length) { k.innerHTML = '<p class="lt-luu-y">Lớp chưa có buổi học nào được lưu.</p>'; return; }
      k.innerHTML = b.map(function (x) {
        return '<details class="lop-buoi"><summary>' + esc(x.tieuDe) + ' <small>(' + x.soCau + ' câu)</small></summary>' + (x.cau || []).map(function (c) {
          return '<div class="lop-cau"><div class="de">Câu ' + c.n + (c.kieu ? ' · ' + esc(c.kieu) : '') + ': ' + esc(c.de || '') + '</div><ol>' +
            (c.cacDap || []).map(function (t) { return '<li' + (t === c.dapAn ? ' class="dung"' : '') + '>' + esc(t) + (t === c.dapAn ? ' ✓' : '') + '</li>'; }).join('') + '</ol>' +
            (c.giai ? '<div class="giai">' + esc(c.giai) + '</div>' : '') + '</div>';
        }).join('') + '</details>';
      }).join('');
    }).catch(function (e) { document.getElementById('lopBuoi').innerHTML = '<p class="lt-luu-y">Chưa tải được: ' + esc(e.message || e) + '</p>'; });
  }

  // ---------- trong phòng ----------
  function vaoPhong(ma) {
    var cur = null, hoSoId = QM_TK.hoSoId(), me = -1, q = -1, ngung = false, daGui = '', lop = '', dangNhan = false;
    el.innerHTML = '<div class="lop-bao" id="lopBao">Đang vào phòng ' + esc(ma) + '…</div><div class="lt-bai lop-doc" id="lopDe"></div><p class="lt-luu-y"><a href="index.html">‹ Thoát phòng</a></p>';
    var bao = document.getElementById('lopBao'), de = document.getElementById('lopDe');

    function nhanO() {
      var hs = QM_TK.hoSoDang() || {}, bd = 0, k = 0, i;
      for (i = 0; i < hoSoId.length; i++) bd = (bd * 31 + hoSoId.charCodeAt(i)) % 60;
      return (function thu() {
        if (k >= 60) return Promise.reject(new Error('day'));
        var d = (bd + k++) % 60;
        return QM_PHONG.nhan(ma, d, hs.hoTen || 'Học sinh', hs.lop || '', hoSoId).then(function () { return d; }, function (e) { if (e && e.ma === 'co-nguoi') return thu(); throw e; });
      })();
    }
    function hienBao(h, toi) { bao.className = 'lop-bao' + (toi ? ' toi' : ''); bao.innerHTML = h; }
    function ve(s) {
      var toi = s.goi && s.goi.id === hoSoId && s.tt === 'cho';
      if (s.tt === 'ket') { de.innerHTML = ''; return hienBao('🏁 Buổi học đã kết thúc.<small>Các câu hỏi và đáp án được lưu ở trang “Các buổi học của lớp”.</small>'); }
      if (!s.html) return hienBao('Đã vào phòng ✅<small>Chờ cô hiện câu hỏi…</small>');
      var b = '';
      if (s.tt === 'cho-goi') b = 'Cô chưa gọi ai · Câu ' + s.n + '/' + s.tong;
      else if (s.tt === 'cho') b = toi ? '👉 ĐẾN LƯỢT BẠN! Chọn đáp án' : 'Bạn ' + esc(s.goi.ten) + ' đang trả lời · Câu ' + s.n + '/' + s.tong;
      else if (s.tt === 'dung') b = (s.goi && s.goi.id === hoSoId ? '🎉 Bạn trả lời đúng!' : '✅ ' + esc(s.goi ? s.goi.ten : '') + ' trả lời đúng');
      else if (s.tt === 'sai') b = (s.goi && s.goi.id === hoSoId ? '❌ Chưa đúng, cô sẽ gọi bạn khác' : '❌ ' + esc(s.goi ? s.goi.ten : '') + ' chọn chưa đúng · cô gọi bạn khác');
      else if (s.tt === 'hien') b = '💡 Cô hiện đáp án';
      hienBao(b + (me === -3 ? '<small>Phòng đã đủ chỗ nên bạn chỉ xem.</small>' : me === -2 ? '<small>Hồ sơ này không nằm trong danh sách lớp nên bạn chỉ xem.</small>' : ''), toi);
      de.className = 'lt-bai ' + (toi ? 'lop-toi' : 'lop-doc'); de.innerHTML = s.html;
      if (toi && navigator.vibrate) try { navigator.vibrate(200); } catch (e) {}
    }
    function gui(k) {
      if (!cur) return;
      var c = cur.ma; if (daGui === c) return; daGui = c;
      de.querySelectorAll('.lt-dap-o').forEach(function (b, i) { b.disabled = true; if (i === k) b.classList.add('chon'); });
      de.className = 'lt-bai lop-doc';
      hienBao('Đã gửi ✅<small>Chờ cô xem kết quả…</small>');
      QM_PHONG.gui(ma, me, 'dap', c, String(k)).catch(function () { daGui = ''; hienBao('Chưa gửi được, bạn bấm lại nhé.', true); de.className = 'lt-bai lop-toi'; de.querySelectorAll('.lt-dap-o').forEach(function (b) { b.disabled = false; }); });
    }
    de.addEventListener('click', function (e) { var o = e.target.closest('.lt-dap-o'); if (o && de.classList.contains('lop-toi')) gui(+o.dataset.k); });

    var hen;
    (function hoi() {
      if (ngung) return;
      QM_PHONG.xem(ma, me >= 0 ? me : null).then(function (o) {
        var s = null; try { s = o.s ? JSON.parse(o.s) : null; } catch (e) {}
        if (!s) { hienBao('Đã vào phòng ' + esc(ma) + ' ✅<small>Chờ cô bắt đầu…</small>'); }
        else {
          if (s.mo) {                                             // Phòng mở: tự giữ một ô (bắt đầu từ ô theo mã hồ sơ, ô có người khác thì thử ô kế)
            if (me === -1 && !dangNhan) { dangNhan = true; nhanO().then(function (d) { me = d; dangNhan = false; }).catch(function () { dangNhan = false; me = -3; }); }
          } else if (me < 0) { var i = (s.r || []).indexOf(hoSoId); if (i >= 0) { me = i; QM_PHONG.vao(ma, me).catch(function () {}); } else { me = -2; } }
          if (s.q !== q) { q = s.q; cur = s; ve(s); }
        }
        var nhanh = s && s.tt === 'cho' && s.goi && s.goi.id === hoSoId;
        hen = setTimeout(hoi, document.hidden ? 8000 : nhanh ? 1000 : 2500);
      }).catch(function (e) {
        if (e && e.ma === 'khong-co-phong') { ngung = true; return hienBao('Không tìm thấy phòng ' + esc(ma) + '.<small>Bạn kiểm tra lại mã trên màn chiếu nhé.</small>'); }
        hen = setTimeout(hoi, 3500);
      });
    })();
  }

  cho(function () { khoiDong(); });
})();
