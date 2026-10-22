/* =========================================================
   KHO TỪ VỰNG 9 CẤP (trang tra cứu) — Tiếng Trung Diệu Kỳ
   Tải dữ liệu, phát âm: assets/js/tu-vung-chung.js (nguồn dữ liệu Google Sheet / file JSON khai báo ở đó).
   Từ khó ⭐: assets/js/tien-do.js. Nhúng hai file đó TRƯỚC file này.
   ========================================================= */
(function () {
  var TV = window.QM_TV, TD = window.QM_TIENDO;
  if (!TV) return;
  var ROOT = TV.ROOT, CAP = TV.CAP, tenCap = TV.tenCap, taiCap = TV.taiCap, taiTatCa = TV.taiTatCa, KHO = TV.KHO;
  var esc = TV.esc, boDau = TV.boDau, nutLoa = TV.nutLoa, coNhiHoa = TV.coNhiHoa, GHI_NHI = TV.GHI_NHI;
  var MOI_TRANG = 60;   // số thẻ hiện mỗi lần, bấm "Xem thêm" để hiện tiếp

  var el = document.getElementById('kho-tu-vung');
  if (!el) return;

  var capDang = '1', ds = [], loc = '', hien = [], soHien = MOI_TRANG, luotTim = 0;

  // ---------- Giao diện ----------
  el.innerHTML =
    '<div class="tv-cap" role="tablist">' + CAP.map(function (c) {
      return '<button type="button" role="tab" data-cap="' + c + '"' + (c === 'MR' ? ' class="tv-cap-mr"' : '') + '>' + tenCap(c) + '</button>'; }).join('') + '</div>' +
    '<p class="tv-mr-note" hidden>Mục <b>Mở rộng</b>: từ và cụm từ hay gặp nằm ngoài danh sách chuẩn HSK 3.0, không chia cấp. Phiên âm theo tài liệu của cô.</p>' +
    '<div class="tv-thanh"><input type="search" class="tv-tim" placeholder="Tìm trong cả 9 cấp: chữ Hán, pinyin, nghĩa, Hán Việt…"><span class="tv-dem"></span>' +
      '<a class="btn solid tv-luyen" href="' + ROOT + 'thu-vien/tu-vung/luyen-tap/">✍️ Luyện tập</a></div>' +
    '<div class="tv-luoi"></div>';
  var luoi = el.querySelector('.tv-luoi'), dem = el.querySelector('.tv-dem'), tim = el.querySelector('.tv-tim'), nutLuyen = el.querySelector('.tv-luyen');
  // Nút ⭐ từ khó (dùng chung bộ lưu tiến độ với trang luyện tập)
  function nutSao(w) {
    if (!TD) return '';
    var on = TD.laKho(w.ma);
    return '<button type="button" class="tv-sao' + (on ? ' on' : '') + '" data-ma="' + esc(w.ma) + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Bỏ khỏi' : 'Thêm vào') + ' danh sách từ khó">' + (on ? '★' : '☆') + '<span>' + (on ? 'Từ khó' : 'Đánh dấu từ khó') + '</span></button>';
  }

  function veLuoi(them) {
    var k = boDau(loc);
    if (!them) {
      soHien = MOI_TRANG;
      if (!k) hien = ds;
      else {
        var luot = ++luotTim;
        if (CAP.some(function (c) { return !KHO[c]; })) {
          luoi.innerHTML = '<div class="tv-trong">Đang tìm trong tất cả các cấp…</div>'; dem.textContent = '';
          taiTatCa().then(function () { if (luot === luotTim) veLuoi(); });
          return;
        }
        var q = loc.trim(), tatCa = [];
        CAP.forEach(function (c) { tatCa = tatCa.concat(KHO[c] || []); });
        hien = tatCa.filter(function (w) { return w._tim.indexOf(k) >= 0; });
        // đúng chữ Hán đưa lên đầu, rồi đến từ bắt đầu bằng chữ cần tìm; giữ thứ tự cấp
        hien = hien.map(function (w, j) { return [w.han === q ? 0 : w.han.indexOf(q) === 0 ? 1 : 2, j, w]; })
          .sort(function (a, b) { return a[0] - b[0] || a[1] - b[1]; }).map(function (x) { return x[2]; });
      }
    }
    dem.textContent = k ? hien.length + ' từ · cả 9 cấp' : hien.length + ' từ';
    if (!k && !ds.length) { luoi.innerHTML = '<div class="tv-trong">Cấp này đang được cô cập nhật, bạn quay lại sau nhé! 🌱</div>'; return; }
    if (!hien.length) { luoi.innerHTML = '<div class="tv-trong">Không tìm thấy từ nào phù hợp.</div>'; return; }
    luoi.innerHTML = hien.slice(0, soHien).map(function (w, j) {
      return '<div class="tv-the" role="button" tabindex="0" data-i="' + j + '">' +
        nutLoa(w.han, false, w.doc) + (k ? '<span class="tv-the-cap">' + esc(tenCap(w.cap)) + '</span>' : '') +
        (TD && TD.laKho(w.ma) ? '<span class="tv-sao-nho" title="Từ khó">★</span>' : '') +
        '<div class="tv-han hanzi">' + esc(w.han) + '</div><div class="tv-py">' + esc(w.py) + '</div>' +
        '<div class="tv-nghia">' + esc(w.nghia) + '</div></div>';
    }).join('') + (hien.length > soHien ? '<button type="button" class="tv-them">Xem thêm ' + Math.min(MOI_TRANG, hien.length - soHien) + ' từ (còn ' + (hien.length - soHien) + ')</button>' : '');
  }
  luoi.addEventListener('click', function (e) { if (e.target.closest('.tv-them')) { soHien += MOI_TRANG; veLuoi(true); } });

  function chonCap(c) {
    capDang = c;
    el.querySelector('.tv-mr-note').hidden = c !== 'MR';
    el.querySelectorAll('.tv-cap button').forEach(function (b) { b.classList.toggle('on', b.dataset.cap === c); });
    luoi.innerHTML = '<div class="tv-trong">Đang tải từ vựng…</div>';
    if (loc) { loc = ''; tim.value = ''; }
    taiCap(c).then(function (d) { ds = d; veLuoi(); })
      .catch(function () { ds = []; luoi.innerHTML = '<div class="tv-trong">Chưa tải được dữ liệu, bạn kiểm tra mạng rồi thử lại nhé.</div>'; });
    if (nutLuyen) nutLuyen.href = ROOT + 'thu-vien/tu-vung/luyen-tap/' + (c === 'MR' ? '#hskMR' : '#hsk' + c);
    try { history.replaceState(null, '', '#hsk' + c); } catch (e) {}
  }

  // ---------- Bảng chi tiết một từ ----------
  var hop, viTri = 0;
  function moTu(i) {
    viTri = (i + hien.length) % hien.length; var w = hien[viTri];
    if (!hop) {
      hop = document.createElement('div'); hop.className = 'tv-hop';
      document.body.appendChild(hop);
      hop.addEventListener('click', function (e) {
        if (e.target === hop || e.target.closest('.tv-x')) return dong();
        if (e.target.closest('.tv-truoc')) return moTu(viTri - 1);
        if (e.target.closest('.tv-sau')) return moTu(viTri + 1);
        var o = e.target.closest('.tv-but-o');
        if (o && butHienTai[+o.dataset.k]) { butHienTai[+o.dataset.k].animateCharacter(); return; }
        var m = e.target.closest('.tv-mo-py'); if (m) { m.classList.toggle('hien'); return; }
        var sao = e.target.closest('.tv-sao');
        if (sao && TD) { var w0 = hien[viTri]; TD.datKho(w0, !TD.laKho(w0.ma)); sao.outerHTML = nutSao(w0); veLuoiGiuCho(); return; }
      });
      document.addEventListener('keydown', function (e) {
        if (!hop.classList.contains('on')) return;
        if (e.key === 'Escape') dong(); if (e.key === 'ArrowLeft') moTu(viTri - 1); if (e.key === 'ArrowRight') moTu(viTri + 1);
        var m = e.target.closest && e.target.closest('.tv-mo-py'); if (m && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); m.classList.toggle('hien'); }
      });
    }
    var coCauViet = w.cau.some(function (c) { return c.viet; });
    hop.innerHTML = '<div class="tv-ct">' +
      '<button type="button" class="tv-x" aria-label="Đóng">✕</button>' +
      // Đầu: chữ + loa | pinyin, nghĩa, nhãn
      '<div class="tv-dau">' +
        '<div class="tv-dau-chu"><div class="tv-ct-han hanzi">' + esc(w.han) + '</div>' + nutLoa(w.han, true, w.doc) + '</div>' +
        '<div class="tv-dau-tt"><div class="tv-ct-py">' + esc(w.py) + '</div>' +
          '<div class="tv-ct-nghia">' + esc(w.nghia) + '</div>' +
          '<div class="tv-the-tag">' + (w.hv ? '<span class="tag gold">Hán Việt: ' + esc(w.hv) + '</span>' : '') +
            (w.loai ? '<span class="tag">' + esc(w.loai) + '</span>' : '') + '<span class="tag red">' + esc(tenCap(w.cap || capDang)) + '</span></div>' +
          '<div class="tv-sao-hang">' + nutSao(w) + '</div>' +
        '</div>' +
      '</div>' +
      (coNhiHoa(w.han, w.doc) ? GHI_NHI : '') +
      (w.but ? '<div class="tv-muc tv-muc-but"><span class="tv-nhan">Thuận bút</span>' +
        '<div class="tv-but">' + w.but.split('').map(function (c, k) { return '<button type="button" class="tv-but-o" data-k="' + k + '" data-chu="' + c + '" aria-label="Xem lại thuận bút chữ ' + c + '"><span class="hanzi">' + c + '</span></button>'; }).join('') + '</div></div>' : '') +
      (!w.cum.length && !w.cau.length ? '<p class="tv-cho-nd">Cụm kết hợp và câu ví dụ của từ này đang được cô cập nhật 🌱</p>' : '') +
      (w.cum.length ? '<div class="tv-muc"><span class="tv-nhan">Cụm kết hợp</span><ul class="tv-cum">' + w.cum.map(function (c) {
        return '<li class="tv-mo-py" tabindex="0"><span class="hanzi">' + esc(c.han) + '</span>' + (c.py ? '<i class="tv-py-an">' + esc(c.py) + '</i>' : '') + '</li>'; }).join('') + '</ul></div>' : '') +
      (w.cau.length ? '<div class="tv-muc"><span class="tv-nhan">Câu ví dụ</span><ol class="tv-cau">' + w.cau.map(function (c) {
          return '<li>' + nutLoa(c.han, false, c.doc) + '<div class="tv-mo-py" tabindex="0"><div class="hanzi">' + esc(c.han) + '</div>' + (c.py ? '<div class="tv-cau-py tv-py-an">' + esc(c.py) + '</div>' : '') + (c.viet ? '<div class="tv-cau-viet tv-py-an">' + esc(c.viet) + '</div>' : '') + '</div></li>'; }).join('') + '</ol></div>' +
        (!coNhiHoa(w.han, w.doc) && w.cau.some(function (c) { return coNhiHoa(c.han, c.doc); }) ? GHI_NHI : '') : '') +
      (w.cum.length || w.cau.length ? '<p class="tv-goi-y">👆 Bấm vào cụm từ, câu để xem phiên âm' + (coCauViet ? ' và nghĩa' : '') + (w.but ? ' · bấm ô chữ để xem lại thuận bút' : '') + '</p>' : '') +
      '<div class="tv-dieu-huong"><button type="button" class="tv-truoc">‹ Từ trước</button><span>' + (viTri + 1) + ' / ' + hien.length + '</span><button type="button" class="tv-sau">Từ sau ›</button></div>' +
      '</div>';
    hop.classList.add('on'); document.body.style.overflow = 'hidden';
    if (w.but) veThuanBut();
  }

  // ---------- Thuận bút động (thư viện Hanzi Writer) ----------
  var HW = null, hwCho = [];
  function taiHW(xong) {
    if (window.HanziWriter) return xong();
    hwCho.push(xong); if (HW) return;
    HW = document.createElement('script');
    HW.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js';
    HW.onload = function () { hwCho.splice(0).forEach(function (f) { f(); }); };
    document.head.appendChild(HW);
  }
  var butHienTai = [];
  function veThuanBut() {
    taiHW(function () {
      var o = hop.querySelectorAll('.tv-but-o'); butHienTai = [];
      if (typeof HanziWriter === 'undefined') return;   // mạng chặn thư viện: giữ chữ tĩnh
      o.forEach(function (box) {
        box.innerHTML = '';
        var wr = HanziWriter.create(box, box.dataset.chu, {
          width: box.clientWidth || 64, height: box.clientWidth || 64, padding: 3, showOutline: true, strokeAnimationSpeed: 1, delayBetweenStrokes: 220,
          strokeColor: '#0b5a2a', radicalColor: '#b31916', outlineColor: '#e8e1cf', drawingColor: '#0b5a2a',
          onLoadCharDataError: function () { box.innerHTML = '<span class="hanzi">' + box.dataset.chu + '</span>'; }
        });
        butHienTai.push(wr);
      });
      chayLanLuot();
    });
  }
  function chayLanLuot() {
    var i = 0;
    (function tiep() { if (i < butHienTai.length) butHienTai[i++].animateCharacter({ onComplete: tiep }); })();
  }
  function veLuoiGiuCho() { var n = soHien; veLuoi(true); soHien = n; }
  function dong() { hop.classList.remove('on'); document.body.style.overflow = ''; TV.dungDoc(); }

  // ---------- Sự kiện ----------
  document.addEventListener('click', function (e) {
    if (e.target.closest('.tv-loa')) return;   // nút loa: tu-vung-chung.js đã phát âm
    var t = e.target.closest('.tv-the'); if (t && el.contains(t)) moTu(+t.dataset.i);
    var c = e.target.closest('.tv-cap button'); if (c) chonCap(c.dataset.cap);
  }, true);
  el.addEventListener('keydown', function (e) { var t = e.target.closest('.tv-the'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); moTu(+t.dataset.i); } });
  tim.addEventListener('input', function () { loc = tim.value; veLuoi(); });

  var h = (location.hash.match(/hsk([\dMR-]+)/) || [])[1];
  chonCap(CAP.indexOf(h) >= 0 ? h : '1');
})();
