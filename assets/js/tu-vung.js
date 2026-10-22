/* =========================================================
   KHO TỪ VỰNG 9 CẤP — Tiếng Trung Diệu Kỳ
   Dữ liệu lấy từ Google Sheet (mỗi cấp một trang tính, đã "Xuất bản lên web" dạng CSV).
   Dán link CSV của từng cấp vào NGUON bên dưới. Cấp nào chưa có link thì đọc file data/tu-vung/cap-<cấp>.json.
   ========================================================= */
(function () {
  var src = document.currentScript && document.currentScript.src || '';
  var ROOT = src.indexOf('assets/js/tu-vung.js') >= 0 ? src.substring(0, src.indexOf('assets/js/tu-vung.js')) : '';
  var MOI_TRANG = 60;   // số thẻ hiện mỗi lần, bấm "Xem thêm" để hiện tiếp
  var NGUON = {
    '1': '', '2': '', '3': '', '4': '', '5': '', '6': '', '7-9': ''
  };
  var CAP = ['1', '2', '3', '4', '5', '6', '7-9', 'MR'];   // MR = Mở rộng (ngoài danh sách chuẩn, không phân cấp)
  function tenCap(c) { return c === 'MR' ? 'Mở rộng' : 'HSK ' + c; }

  var el = document.getElementById('kho-tu-vung');
  if (!el) return;

  // ---------- Đọc CSV (hỗ trợ ô có xuống dòng, dấu phẩy, dấu ngoặc kép) ----------
  function docCSV(txt) {
    var rows = [], row = [], o = '', q = false;
    for (var i = 0; i < txt.length; i++) {
      var c = txt[i];
      if (q) {
        if (c === '"') { if (txt[i + 1] === '"') { o += '"'; i++; } else q = false; }
        else o += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(o); o = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && txt[i + 1] === '\n') i++;
        row.push(o); rows.push(row); row = []; o = '';
      } else o += c;
    }
    if (o || row.length) { row.push(o); rows.push(row); }
    var dau = rows.shift() || [];
    return rows.filter(function (r) { return r.join('').trim(); }).map(function (r) {
      var d = {}; dau.forEach(function (k, j) { d[k.trim()] = (r[j] || '').trim(); }); return d;
    });
  }

  function chuanHoa(r) {
    return {
      ma: r['Mã'], han: r['Chữ Hán'], py: r['Pinyin'], hv: r['Âm Hán Việt'], loai: r['Từ loại'],
      doc: r['Đọc từ'] || '',
      nghia: r['Nghĩa tiếng Việt'], cap: r['Cấp HSK'], but: (r['Thuận bút'] || '').replace(/[^\u3400-\u9fff]/g, ''),
      cum: (r['Cụm từ'] || '').split(/\n+/).map(function (d) {
        var p = d.split('|').map(function (s) { return s.trim(); }); return { han: p[0], py: p[1] || '' };
      }).filter(function (c) { return c.han; }),
      cau: [[r['Câu 1'], r['Pinyin câu 1'], r['Nghĩa câu 1'], r['Đọc câu 1']], [r['Câu 2'], r['Pinyin câu 2'], r['Nghĩa câu 2'], r['Đọc câu 2']]]
        .filter(function (c) { return c[0]; }).map(function (c) { return { han: c[0], py: c[1] || '', viet: c[2] || '', doc: c[3] || '' }; })
    };
  }

  var KHO = {}, capDang = '1', ds = [], loc = '', hien = [], soHien = MOI_TRANG, luotTim = 0;
  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function boDau(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/\s+/g, ''); }

  function taiCap(cap) {
    if (KHO[cap]) return Promise.resolve(KHO[cap]);
    var url = NGUON[cap];
    var nhung = (window.TU_VUNG_MAU || {})[cap];
    if (!url && nhung) return Promise.resolve(KHO[cap] = chuanBi(cap, nhung.map(chuanHoa)));
    if (!url) return fetch(ROOT + 'data/tu-vung/cap-' + cap + '.json').then(function (r) { if (!r.ok) throw r; return r.json(); })
      .then(function (d) { return (KHO[cap] = chuanBi(cap, d.map(chuanHoa))); });
    return fetch(url).then(function (r) { return r.text(); }).then(function (t) { return (KHO[cap] = chuanBi(cap, docCSV(t).map(chuanHoa))); });
  }
  function chuanBi(cap, d) { d.forEach(function (w, i) { w.cap = w.cap || cap; w._i = i; w._tim = boDau([w.han, w.py, w.nghia, w.hv].join(' ')); }); return d; }
  // Tìm kiếm: luôn tìm trong toàn bộ các cấp (tải dần những cấp chưa mở)
  function taiTatCa() { return Promise.all(CAP.map(function (c) { return taiCap(c).catch(function () { return []; }); })); }

  // ---------- Phát âm ----------
  // Chỉ dùng giọng Phổ thông Đại lục (zh-CN). Không dùng giọng Hồng Kông (tiếng Quảng Đông) — đọc sai hoàn toàn.
  // Cột "Đọc từ" / "Đọc câu 1/2" (nếu có) là văn bản đưa cho máy đọc thay cho chữ Hán hiển thị:
  //   - chữ đa âm dễ bị đọc nhầm được thay bằng chữ đồng âm chỉ có 1 cách đọc (VD 干 gān → 肝);
  //   - hoặc là đường dẫn file ghi âm (.mp3/.m4a/.wav/.ogg) cho trường hợp máy không đọc chuẩn được (儿化…).
  var giong = null, giongDL = true;
  function chonGiong() {
    var v = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    var cn = v.filter(function (x) { return /^(zh[-_]CN|cmn[-_]Hans|cmn[-_]CN)/i.test(x.lang); });
    var tot = /Xiaoxiao|Xiaoyi|Yunxi|Yunyang|Google|Tingting|Ting-Ting|Lili|Yaoyao/i;
    giong = cn.filter(function (x) { return tot.test(x.name); })[0] || cn[0] || null;
    giongDL = !!giong;
    if (!giong) giong = v.filter(function (x) { return /^(zh[-_]TW|cmn)/i.test(x.lang); })[0] || null;
  }
  if (window.speechSynthesis) { chonGiong(); speechSynthesis.onvoiceschanged = chonGiong; }
  var amDang = null;
  function laFileAm(t) { return /\.(mp3|m4a|wav|ogg)(\?.*)?$/i.test(t); }
  function doc(txt, nut) {
    if (window.speechSynthesis) speechSynthesis.cancel();
    if (amDang) { amDang.pause(); amDang = null; }
    if (laFileAm(txt)) {
      var a = amDang = new Audio(txt);
      if (nut) { nut.classList.add('dang-doc'); a.onended = a.onerror = function () { nut.classList.remove('dang-doc'); }; }
      a.play().catch(function () { if (nut) nut.classList.remove('dang-doc'); baoLoi('Chưa phát được file âm thanh.'); });
      return;
    }
    if (!window.speechSynthesis) return baoLoi('Trình duyệt này chưa hỗ trợ đọc. Bạn thử mở bằng Chrome nhé.');
    var u = new SpeechSynthesisUtterance(txt);
    u.lang = 'zh-CN'; if (giong) u.voice = giong; u.rate = txt.length > 4 ? 0.85 : 0.75;
    if (nut) { nut.classList.add('dang-doc'); u.onend = u.onerror = function () { nut.classList.remove('dang-doc'); }; }
    speechSynthesis.speak(u);
    if (!giongDL && speechSynthesis.getVoices().length) baoLoi('Máy chưa có giọng đọc tiếng Phổ thông (Trung Quốc đại lục), âm thanh có thể chưa chuẩn.');
  }
  function baoLoi(t) {
    var b = document.createElement('div'); b.className = 'tv-toast'; b.textContent = t;
    document.body.appendChild(b); setTimeout(function () { b.remove(); }, 3500);
  }
  var LOA = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
  // Từ/câu có 儿化: loa đọc bỏ 儿 (cột "Đọc" ít chữ 儿 hơn chữ hiển thị) → hiện ghi chú cong lưỡi
  function demNhi(t) { return (String(t || '').match(/儿/g) || []).length; }
  function coNhiHoa(han, docThay) { return !!docThay && docThay !== '-' && !laFileAm(docThay) && demNhi(han) > demNhi(docThay); }
  var GHI_NHI = '<p class="tv-nhi">Do hạn chế của máy đọc, loa đọc âm không có đuôi 儿化. Khi đọc, các bạn chú ý <b>cong lưỡi ở cuối âm</b> nhé.</p>';
  // Cột "Đọc" = "-": máy đọc chưa chuẩn, đang chờ thu âm → không hiện nút loa
  function choCapNhat(to) { return '<span class="tv-loa-cho' + (to ? ' to' : '') + '" title="Phát âm đang cập nhật">' + (to ? 'Phát âm đang cập nhật' : '') + '</span>'; }
  function nutLoa(txt, to, docThay) {
    if (docThay === '-') return choCapNhat(to); return '<button type="button" class="tv-loa' + (to ? ' to' : '') + '" data-doc="' + esc(docThay || txt) + '" aria-label="Nghe phát âm">' + LOA + '</button>'; }

  // ---------- Giao diện ----------
  el.innerHTML =
    '<div class="tv-cap" role="tablist">' + CAP.map(function (c) {
      return '<button type="button" role="tab" data-cap="' + c + '"' + (c === 'MR' ? ' class="tv-cap-mr"' : '') + '>' + tenCap(c) + '</button>'; }).join('') + '</div>' +
    '<p class="tv-mr-note" hidden>Mục <b>Mở rộng</b>: từ và cụm từ hay gặp nằm ngoài danh sách chuẩn HSK 3.0, không chia cấp. Phiên âm theo tài liệu của cô.</p>' +
    '<div class="tv-thanh"><input type="search" class="tv-tim" placeholder="Tìm trong cả 9 cấp: chữ Hán, pinyin, nghĩa, Hán Việt…"><span class="tv-dem"></span></div>' +
    '<div class="tv-luoi"></div>';
  var luoi = el.querySelector('.tv-luoi'), dem = el.querySelector('.tv-dem'), tim = el.querySelector('.tv-tim');

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
  function dong() { hop.classList.remove('on'); document.body.style.overflow = ''; if (window.speechSynthesis) speechSynthesis.cancel(); }

  // ---------- Sự kiện ----------
  document.addEventListener('click', function (e) {
    var l = e.target.closest('.tv-loa'); if (l) { e.stopPropagation(); doc(l.dataset.doc, l); return; }
    var t = e.target.closest('.tv-the'); if (t && el.contains(t)) moTu(+t.dataset.i);
    var c = e.target.closest('.tv-cap button'); if (c) chonCap(c.dataset.cap);
  }, true);
  el.addEventListener('keydown', function (e) { var t = e.target.closest('.tv-the'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); moTu(+t.dataset.i); } });
  tim.addEventListener('input', function () { loc = tim.value; veLuoi(); });

  var h = (location.hash.match(/hsk([\dMR-]+)/) || [])[1];
  chonCap(CAP.indexOf(h) >= 0 ? h : '1');
})();
