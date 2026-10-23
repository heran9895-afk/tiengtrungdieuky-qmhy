/* =========================================================
   BẢNG TỔNG KẾT LỚP — Test đầu giờ (theo Quy chuẩn Test đầu giờ)
   Đặt <div id="tong-ket" data-lesson="test-dau-gio-bai1"></div>. Địa chỉ máy chủ: window.QM_API.
   Lấy các lượt ĐẦU TIÊN (attemptNo = 1) từ mốc thời gian (mặc định 2 tiếng trước) tới giờ.
   Sắp theo điểm; bằng điểm thì chuỗi đúng dài hơn trước; rồi tới thời gian nhanh hơn. Tải về được (CSV mở bằng Excel).
   ========================================================= */
(function () {
  var el = document.getElementById('tong-ket'); if (!el) return;
  var API = window.QM_API, bai = el.dataset.lesson, DL = [];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function gio(g) { g = +g || 0; return Math.floor(g / 60) + ':' + ('0' + g % 60).slice(-2); }
  function mocMacDinh() { var d = new Date(Date.now() - 2 * 3600e3); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); }
  el.innerHTML = '<details class="tk-hop"><summary>📊 Bảng tổng kết lớp (dành cho giáo viên)</summary>' +
    '<p class="tk-ghi">Chỉ tính <b>lượt làm đầu tiên</b> của mỗi bạn. Mặc định lấy các bài nộp trong <b>2 tiếng gần nhất</b>; ngày dạy hai ca sát nhau thì chỉnh lại mốc.</p>' +
    '<div class="tk-thanh"><label>Tính từ lúc <input type="datetime-local" class="tk-moc" value="' + mocMacDinh() + '"></label>' +
      '<button type="button" class="btn solid tk-xem">Xem tổng kết</button><button type="button" class="btn tk-tai" disabled>⬇ Tải về</button></div>' +
    '<div class="tk-bang"></div></details>';
  var bang = el.querySelector('.tk-bang'), nutTai = el.querySelector('.tk-tai');
  if (!API) { bang.innerHTML = '<p class="tv-trong">Chưa nối với Google Sheet.</p>'; return; }
  function xep(a, b) { return (+b.score - +a.score) || ((+b.bestStreak || 0) - (+a.bestStreak || 0)) || ((+a.durationSeconds || 0) - (+b.durationSeconds || 0)); }
  el.querySelector('.tk-xem').addEventListener('click', function () {
    bang.innerHTML = '<p class="tv-trong">⏳ Đang tải…</p>';
    var moc = new Date(el.querySelector('.tk-moc').value).getTime() || (Date.now() - 2 * 3600e3);
    fetch(API + '?action=attempts&lesson=' + encodeURIComponent(bai)).then(function (r) { return r.json(); }).then(function (d) {
      if (!d.ok) throw new Error(d.loi);
      DL = d.attempts.filter(function (r) { return +r.attemptNo === 1 && new Date(r.thoiDiem).getTime() >= moc; }).sort(xep);
      nutTai.disabled = !DL.length;
      if (!DL.length) { bang.innerHTML = '<p class="tv-trong">Chưa có bạn nào nộp bài trong khoảng thời gian này.</p>'; return; }
      var tb = DL.reduce(function (s, r) { return s + +r.score / +r.total; }, 0) / DL.length;
      bang.innerHTML = '<p class="tk-tom">' + DL.length + ' bạn đã làm · điểm trung bình ' + Math.round(tb * 100) + '%</p><div class="bxh-cuon"><table><thead><tr><th>Hạng</th><th>Học sinh</th><th>Lớp</th><th>Điểm</th><th>Chuỗi đúng</th><th>Thời gian</th></tr></thead><tbody>' +
        DL.map(function (r, i) { return '<tr' + (i < 3 ? ' class="top top' + (i + 1) + '"' : '') + '><td>' + (['🥇', '🥈', '🥉'][i] || i + 1) + '</td><td>' + esc(r.hoTen) + '</td><td>' + esc(r.lop) + '</td><td><b>' + r.score + '/' + r.total + '</b></td><td>🔥 ' + (r.bestStreak || 0) + '</td><td>' + gio(r.durationSeconds) + '</td></tr>'; }).join('') + '</tbody></table></div>';
    }).catch(function (e) { bang.innerHTML = '<p class="tv-trong">⚠️ Chưa tải được (' + esc(e.message || 'lỗi mạng') + ').</p>'; });
  });
  nutTai.addEventListener('click', function () {                // CSV có BOM để Excel đọc đúng tiếng Việt
    var dong = [['Hạng', 'Họ tên', 'Lớp', 'Điểm', 'Tổng câu', 'Chuỗi đúng', 'Thời gian (giây)', 'Nộp lúc']].concat(DL.map(function (r, i) { return [i + 1, r.hoTen, r.lop, r.score, r.total, r.bestStreak || 0, r.durationSeconds, new Date(r.thoiDiem).toLocaleString('vi-VN')]; }));
    var csv = '\ufeff' + dong.map(function (d) { return d.map(function (x) { return '"' + String(x).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); a.download = 'tong-ket-' + bai + '.csv'; a.click();
  });
})();
