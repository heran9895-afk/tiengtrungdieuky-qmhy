/* =========================================================
   BẢNG XẾP HẠNG — Tiếng Trung Diệu Kỳ (theo quy chuẩn Bảng xếp hạng)
   Đặt <div id="bang-xep-hang" data-lesson="bai1-bai-tap"></div>. Địa chỉ máy chủ: window.QM_API (assets/js/cau-hinh.js).
   Chỉ tải dữ liệu khi bấm "Cập nhật". Một học sinh (họ tên + lớp) một dòng: lượt đầu, lượt tốt nhất, số lượt.
   Xếp hạng: điểm cao trước; bằng điểm thì chuỗi đúng dài hơn; rồi ai nhanh hơn; vẫn bằng thì ai nộp sớm hơn.
   Trò chơi (trang tro-choi/bang-xep-hang.html): data-co-dinh="1" ẩn ô chọn mã bài, trang tự chọn bằng el.qmBxh.chon(mã, tên);
   data-kieu="game" hiện điểm trò chơi (không có "/tổng").
   ========================================================= */
(function () {
  var el = document.getElementById('bang-xep-hang'); if (!el) return;
  var API = window.QM_API, macDinh = el.dataset.lesson || '';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function gon(s) { return String(s == null ? '' : s).replace(/\s+/g, ' ').trim(); }
  function giay(g) { g = +g || 0; var p = Math.floor(g / 60); return (p ? p + "'" : '') + (g % 60) + '"'; }
  el.innerHTML =
    '<div class="bxh-thanh"><label class="lt-o"><span class="lt-o-nhan">Bài</span><select class="bxh-bai"><option value="' + esc(macDinh) + '">' + esc(macDinh) + '</option></select></label>' +
      '<div class="bxh-xep" role="group" aria-label="Xếp theo"><button type="button" data-x="dau" class="on">Xếp theo lượt đầu</button><button type="button" data-x="tot">Xếp theo lượt tốt nhất</button></div>' +
      '<button type="button" class="btn solid bxh-cap-nhat">🔄 Cập nhật</button></div>' +
    '<div class="bxh-bang"><p class="tv-trong">Bấm "Cập nhật" để tải bảng xếp hạng.</p></div>' +
    '<details class="bxh-gv"><summary>Dành cho giáo viên: xoá điểm của bài này</summary>' +
      '<div class="bxh-gv-in"><input type="password" class="bxh-mk" placeholder="Mật khẩu giáo viên" autocomplete="off"><button type="button" class="btn bxh-xoa">Xoá điểm bài này</button></div><p class="bxh-gv-bao"></p></details>';
  var selBai = el.querySelector('.bxh-bai'), bang = el.querySelector('.bxh-bang'), xepTheo = 'dau', DL = [];
  var coDinh = !!el.dataset.coDinh, laGame = el.dataset.kieu === 'game';
  if (coDinh) selBai.closest('.lt-o').style.display = 'none';
  el.qmBxh = { chon: function (lesson, ten) {
    selBai.innerHTML = '<option value="' + esc(lesson) + '">' + esc(lesson) + (ten ? ' · ' + esc(ten) : '') + '</option>';
    selBai.value = lesson; DL = []; bang.innerHTML = '<p class="tv-trong">Bấm "Cập nhật" để tải bảng xếp hạng.</p>';
  } };
  if (!API) { bang.innerHTML = '<p class="tv-trong">Bảng xếp hạng chưa được nối với Google Sheet.</p>'; el.querySelector('.bxh-cap-nhat').disabled = true; return; }

  function taiDsBai() {                                       // danh sách mã bài lấy từ dữ liệu đang có
    fetch(API + '?action=lessons').then(function (r) { return r.json(); }).then(function (d) {
      if (!d.ok) return;
      var ds = d.lessons.map(function (x) { return x.lesson; }); if (macDinh && ds.indexOf(macDinh) < 0) ds.unshift(macDinh);
      var ten = {}; d.lessons.forEach(function (x) { ten[x.lesson] = x.lessonTitle; });
      selBai.innerHTML = ds.map(function (l) { return '<option value="' + esc(l) + '">' + esc(l) + (ten[l] ? ' · ' + esc(ten[l]) : '') + '</option>'; }).join('');
      selBai.value = macDinh || ds[0];
    }).catch(function () {});
  }
  function hon(a, b) {                                        // a tốt hơn b? điểm → chuỗi đúng → thời gian → nộp sớm
    if (+a.score !== +b.score) return +a.score > +b.score;
    if ((+a.bestStreak || 0) !== (+b.bestStreak || 0)) return (+a.bestStreak || 0) > (+b.bestStreak || 0);
    if (+a.durationSeconds !== +b.durationSeconds) return +a.durationSeconds < +b.durationSeconds;
    return String(a.thoiDiem) < String(b.thoiDiem);
  }
  function gop(ds) {                                          // gộp theo cặp họ tên + lớp
    var m = {};
    ds.forEach(function (r) {
      var k = gon(r.hoTen).toLowerCase() + '|' + gon(r.lop).toLowerCase(), x = m[k];
      if (!x) x = m[k] = { hoTen: gon(r.hoTen), lop: gon(r.lop), dau: r, tot: r, soLuot: 0 };
      x.soLuot++;
      if (+r.attemptNo < +x.dau.attemptNo || (+r.attemptNo === +x.dau.attemptNo && String(r.thoiDiem) < String(x.dau.thoiDiem))) x.dau = r;
      if (hon(r, x.tot)) x.tot = r;
    });
    return Object.keys(m).map(function (k) { return m[k]; });
  }
  function ve() {
    if (!DL.length) { bang.innerHTML = '<p class="tv-trong">Chưa có ai nộp bài này.</p>'; return; }
    var hs = gop(DL).sort(function (a, b) { return hon(a[xepTheo], b[xepTheo]) ? -1 : hon(b[xepTheo], a[xepTheo]) ? 1 : 0; });
    var o = function (r) { return '<b>' + r.score + (laGame ? ' điểm' : '/' + r.total) + '</b><small>' + giay(r.durationSeconds) + ' · 🔥' + (r.bestStreak || 0) + '</small>'; };
    bang.innerHTML = '<div class="bxh-cuon"><table><thead><tr><th>Hạng</th><th>Học sinh</th><th>Lớp</th><th' + (xepTheo === 'dau' ? ' class="on"' : '') + '>Lượt đầu</th><th' + (xepTheo === 'tot' ? ' class="on"' : '') + '>Lượt tốt nhất</th><th>Số lượt</th></tr></thead><tbody>' +
      hs.map(function (x, i) { return '<tr' + (i < 3 ? ' class="top top' + (i + 1) + '"' : '') + '><td>' + (['🥇', '🥈', '🥉'][i] || i + 1) + '</td><td>' + esc(x.hoTen) + '</td><td>' + esc(x.lop) + '</td><td>' + o(x.dau) + '</td><td>' + o(x.tot) + '</td><td>' + x.soLuot + '</td></tr>'; }).join('') +
      '</tbody></table></div><p class="bxh-ghi">' + hs.length + ' học sinh · ' + DL.length + ' lượt nộp</p>';
  }
  function capNhat() {
    bang.innerHTML = '<p class="tv-trong">⏳ Đang tải…</p>';
    fetch(API + '?action=attempts&lesson=' + encodeURIComponent(selBai.value)).then(function (r) { return r.json(); })
      .then(function (d) { if (!d.ok) throw new Error(d.loi); DL = d.attempts; ve(); })
      .catch(function (e) { bang.innerHTML = '<p class="tv-trong">⚠️ Chưa tải được bảng xếp hạng (' + esc(e.message || 'lỗi mạng') + ').</p>'; });
  }
  el.querySelector('.bxh-cap-nhat').addEventListener('click', capNhat);
  el.querySelector('.bxh-xep').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return; xepTheo = b.dataset.x;
    el.querySelectorAll('.bxh-xep button').forEach(function (x) { x.classList.toggle('on', x === b); });
    if (DL.length) ve();
  });
  el.querySelector('.bxh-xoa').addEventListener('click', function () {
    var bao = el.querySelector('.bxh-gv-bao'), bai = selBai.value;
    fetch(API + '?action=attempts&lesson=' + encodeURIComponent(bai)).then(function (r) { return r.json(); }).catch(function () { return {}; }).then(function (d) {
      var n = d && d.attempts ? d.attempts.length : '?';
      if (!confirm('Xoá ' + n + ' lượt nộp của bài "' + bai + '"? Không khôi phục được.')) return;
      xoa(bai, bao);
    });
  });
  function xoa(bai, bao) {
    bao.textContent = '⏳ Đang xoá…';
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'reset', lesson: bai, matKhau: el.querySelector('.bxh-mk').value }) })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (!d.ok) throw new Error(d.loi); bao.textContent = '✅ Đã xoá ' + d.soDongXoa + ' lượt nộp của bài ' + bai + '.'; DL = []; ve(); })
      .catch(function (e) { bao.textContent = '⚠️ ' + (e.message || 'Lỗi mạng'); });
  }
  if (!coDinh) taiDsBai();
})();
