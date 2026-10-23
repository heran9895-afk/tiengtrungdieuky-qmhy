/* =========================================================
   NGỮ PHÁP CỦA BÀI — Tiếng Trung Diệu Kỳ (theo Quy chuẩn Ngữ pháp)
   Đặt <div id="ngu-phap"></div>; dữ liệu: nhóm "nguPhap" trong file bài (nạp qua tu-vung-chung.js, QM_CAP = ['BAI']).
   Mỗi điểm một thẻ: tên cấu trúc · công thức tô màu theo loại từ · giải thích · ý + câu ví dụ (ẩn pinyin, có loa) · lưu ý.
   ========================================================= */
(function () {
  var el = document.getElementById('ngu-phap'), TV = window.QM_TV; if (!el || !TV) return;
  var esc = TV.esc, DS = [], i = 0, xong = false;
  var LOAI = { codinh: 'Từ cố định', dt: 'Danh từ, đại từ (DT)', dgt: 'Động từ (ĐT)', tt: 'Tính từ (TT)', st: 'Số từ, lượng từ (ST, LT)', pho: 'Phó từ, trợ từ' };
  function ve() {
    if (xong) {
      el.innerHTML = '<div class="np-xong card"><div class="np-xong-ico">🎉</div><h3>Hoàn thành ' + DS.length + ' điểm ngữ pháp!</h3><p>Ôn lại bất cứ lúc nào bằng các nút tròn phía trên.</p>' +
        '<div class="lt-nut-kq"><button type="button" class="btn np-lai">Xem lại từ đầu</button><a class="btn solid" href="bai-tap.html">Làm bài tập ›</a></div></div>';
      return;
    }
    var g = DS[i];
    el.innerHTML =
      '<div class="np-nut">' + DS.map(function (x, k) { return '<button type="button" class="np-tron' + (k === i ? ' on' : '') + (k < i ? ' qua' : '') + '" data-k="' + k + '" aria-label="Điểm ' + (k + 1) + ': ' + esc(x.ten) + '">' + (k + 1) + '</button>'; }).join('') + '</div>' +
      '<div class="lt-vach np-vach"><i class="thuoc" style="width:' + ((i + 1) / DS.length * 100) + '%"></i></div>' +
      '<article class="np-the card">' +
        '<div class="np-dau"><span class="np-so">' + (i + 1) + '</span><h3 class="np-ten hanzi">' + esc(g.ten) + '</h3></div>' +
        '<div class="np-ct">' + g.congThuc.map(function (dong) {
          return '<div class="np-dong">' + dong.map(function (o) { return '<span class="np-o np-' + o[1] + '" title="' + esc(LOAI[o[1]] || '') + '">' + esc(o[0]) + '</span>'; }).join('<i>+</i>') + '</div>'; }).join('') + '</div>' +
        '<p class="np-giai">' + esc(g.giaiThich) + '</p>' +
        g.y.map(function (y, k) {
          return '<div class="np-y">' + (g.y.length > 1 ? '<div class="np-y-nd"><b>' + String.fromCharCode(9312 + k) + '</b> ' + esc(y.noiDung) + '</div>' : '<div class="np-y-nd">' + esc(y.noiDung) + '</div>') +
            y.viDu.map(function (v) {
              return '<div class="np-vd">' + TV.nutLoa(v[0]) + '<div class="np-vd-chu"><div class="hanzi">' + esc(v[0]) + '</div><div class="np-vd-an" hidden><div class="np-vd-py">' + esc(v[1]) + '</div>' + (v[2] ? '<div class="np-vd-vi">' + esc(v[2]) + '</div>' : '') + '</div></div>' +
                '<button type="button" class="np-hien">Hiện pinyin</button></div>';
            }).join('') + '</div>';
        }).join('') +
        (g.luuY ? '<p class="np-luu-y">💡 ' + esc(g.luuY) + '</p>' : '') +
      '</article>' +
      '<div class="tv-fc-nut np-dieu-huong"><button type="button" class="btn np-truoc"' + (i ? '' : ' disabled') + '>‹ Trước</button>' +
        '<button type="button" class="btn solid np-tiep">' + (i < DS.length - 1 ? 'Tiếp theo ›' : 'Hoàn thành 🎉') + '</button></div>';
  }
  function den(k) { i = Math.max(0, Math.min(DS.length - 1, k)); xong = false; TV.dungDoc(); ve(); var t = el.getBoundingClientRect().top; if (t < 0) window.scrollBy(0, t - 120); }
  el.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('.tv-loa')) return;
    var n = t.closest('.np-tron'); if (n) return den(+n.dataset.k);
    var h = t.closest('.np-hien');
    if (h) { var a = h.parentNode.querySelector('.np-vd-an'); a.hidden = !a.hidden; h.textContent = a.hidden ? 'Hiện pinyin' : 'Ẩn pinyin'; return; }
    if (t.closest('.np-truoc')) return den(i - 1);
    if (t.closest('.np-tiep')) { if (i < DS.length - 1) return den(i + 1); xong = true; return ve(); }
    if (t.closest('.np-lai')) return den(0);
  });
  // Dòng chú giải viết tắt ở đầu phần
  var chuGiai = '<p class="np-chu-giai">' + Object.keys(LOAI).map(function (k) { return '<span class="np-o np-' + k + '">' + (k === 'codinh' ? '是' : k === 'dt' ? 'DT' : k === 'dgt' ? 'ĐT' : k === 'tt' ? 'TT' : k === 'st' ? 'ST' : 'PT') + '</span> ' + LOAI[k]; }).join(' · ') + '</p>';
  el.innerHTML = '<div class="tv-trong">Đang tải ngữ pháp…</div>';
  TV.taiCap(TV.CAP[0]).then(function () {
    DS = ((TV.DL || {})[TV.CAP[0]] || {}).nguPhap || [];
    if (!DS.length) { el.innerHTML = '<div class="tv-trong">Bài này chưa có phần ngữ pháp.</div>'; return; }
    el.insertAdjacentHTML('beforebegin', chuGiai); ve();
  }).catch(function () { el.innerHTML = '<div class="tv-trong">Chưa tải được dữ liệu, bạn kiểm tra mạng rồi thử lại nhé.</div>'; });
})();
