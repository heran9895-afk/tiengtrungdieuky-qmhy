/* =========================================================
   LUYỆN THEO DẠNG SÁCH BÀI TẬP (HSK 3.0 · HSK 1)
   Câu soạn mới theo dạng bài của sách bài tập (không chép đề sách). Dữ liệu: data/bai/sach-bai-tap/bai-N.json
   (tạo bằng tools/sach_bai_tap/dung.py). Trình bày như sách: từng Phần, cả phần hiện một lượt, bấm chọn là chấm ngay.
   Phần loai 'am' (kieu tm | vm | td): nghe âm tiết, chọn thanh mẫu / vận mẫu / thanh điệu.
   Phần loai 'tranh': nghe hội thoại, chọn tranh (A, B, C…); chữ + pinyin hiện sau khi trả lời.
   Phần loai 'nghe' (模拟测练 · 听力): mỗi câu có `loi` (1 lời hoặc câu + 问), chọn tranh riêng `anh` hoặc phương án chữ `pa`.
   Phần loai 'doc-tranh' | 'doc-ghep' | 'doc-dien' | 'doc-hoi' (đọc hiểu): câu có pinyin trên chữ (nút Ẩn/Hiện pinyin);
   phương án là chữ cái chung của phần (tranh `anh` hoặc khung `luaChon`) hoặc phương án riêng của câu (`pa`); trả lời xong hiện nghĩa.
   Làm hết mọi câu thì hiện kết quả và gửi bài làm về Sheet (on-tap-gui.js, phan 'sbt-baiN'); không lên Bảng xếp hạng.
   Đặt <div id="luyen-sach"></div>; window.QM_SBT_TEP = đường dẫn file dữ liệu. Nạp sau tu-vung-chung.js, on-tap-gui.js.
   ========================================================= */
(function () {
  var el = document.getElementById('luyen-sach'), TV = window.QM_TV, G = window.QM_OTG; if (!el || !TV) return;
  var esc = TV.esc, D = null, L = null, KHOA_HS = 'qmhy:hoSo';
  var SO_PHAN = ['一', '二', '三', '四', '五', '六', '七', '八'];

  // ---------- âm thanh hiệu ứng ----------
  var AM = { bat: true, ctx: null };
  try { AM.bat = localStorage.getItem('qm-am-hieu-ung') !== '0'; } catch (e) {}
  var NOT = { dung: [[880, .09], [1318.5, .16]], sai: [[233, .12], [196, .2]], xong: [[523.3, .1], [659.3, .1], [784, .1], [1046.5, .28]], xongVua: [[523.3, .12], [659.3, .22]] };
  function amThanh(loai) {
    if (!AM.bat || !NOT[loai]) return;
    try {
      var C = AM.ctx || (AM.ctx = new (window.AudioContext || window.webkitAudioContext)());
      if (C.state === 'suspended') C.resume();
      var t = C.currentTime + .01, to = loai === 'sai' ? .07 : .09;
      NOT[loai].forEach(function (n) {
        var o = C.createOscillator(), g = C.createGain();
        o.type = loai === 'sai' ? 'triangle' : 'sine'; o.frequency.value = n[0];
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(to, t + .012); g.gain.exponentialRampToValueAtTime(.0005, t + n[1]);
        o.connect(g); g.connect(C.destination); o.start(t); o.stop(t + n[1] + .02); t += n[1] * .85;
      });
    } catch (e) {}
  }

  // ---------- tiện ích ----------
  function tron1(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function docLS(k, md) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : md; } catch (e) { return md; } }
  function ghiLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function gon(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function hoSo() { var h = window.QM_TK && QM_TK.hoSoDang && QM_TK.hoSoDang(); return h ? { hoTen: h.hoTen, lop: h.lop } : docLS(KHOA_HS, {}); }
  function luuHs() {
    var t = el.querySelector('.sbt-ten'), l = el.querySelector('.sbt-lop'); if (!t) return;
    ghiLS(KHOA_HS, Object.assign({}, docLS(KHOA_HS, {}), { hoTen: gon(t.value), lop: gon(l.value) }));
  }
  function anPy() { try { return localStorage.getItem('qm-sbt-an-py') === '1'; } catch (e) { return false; } }
  function hienAm(s) { return esc(s).replace('＿', '<span class="sbt-trong">＿</span>'); }
  // Loa hội thoại: file ghi âm (A|B) nếu đã thu, chưa có thì máy đọc cả hai lời
  function docHT(c) { return c.doc || c.loi.map(function (v) { return v.han; }).join(''); }

  // ---------- dựng lượt ----------
  function dungLuot() {
    var hs = hoSo();
    L = { phan: D.phan.map(function (p) {
      return { p: p, cau: tron1(p.cau).map(function (c) { return { c: c, pa: p.loai === 'am' ? tron1([c.dap].concat(c.nhieu)) : (c.pa || c.anh || p.anh || p.luaChon).map(function (a) { return a.k; }) }; }) };
    }), kq: [], ma: G ? G.maLuot() : String(Date.now()), luc: Date.now(), batDau: new Date().toISOString(), hoTen: gon(hs.hoTen), lop: gon(hs.lop) };
    L.tong = L.phan.reduce(function (s, x) { return s + x.cau.length; }, 0);
  }

  // ---------- vẽ ----------
  function veCauAm(x, k, p) {
    var c = x.c;
    return '<li class="sbt-cau" data-ma="' + esc(c.ma) + '"><div class="sbt-de"><span class="sbt-so">' + (k + 1) + '</span>' +
      TV.nutLoa(c.loa) + '<span class="sbt-am">' + hienAm(c.hien) + '</span><span class="sbt-am-dung" hidden>' + esc(c.py) + '</span></div>' +
      '<div class="sbt-pa sbt-pa-' + x.pa.length + '">' + x.pa.map(function (o, j) {
        return '<button type="button" class="sbt-o" data-j="' + j + '">' + esc(o) + '</button>'; }).join('') + '</div></li>';
  }
  function veCauTranh(x, k) {
    var c = x.c;
    return '<li class="sbt-cau sbt-cau-tr" data-ma="' + esc(c.ma) + '"><div class="sbt-de"><span class="sbt-so">' + (k + 1) + '</span>' +
      TV.nutLoa(docHT(c)) + '<span class="sbt-goi">Nghe hội thoại</span></div>' +
      '<div class="sbt-pa sbt-pa-chu sbt-pa-' + x.pa.length + '">' + x.pa.map(function (o, j) { return '<button type="button" class="sbt-o" data-j="' + j + '">' + esc(o) + '</button>'; }).join('') + '</div>' +
      '<div class="sbt-loi" hidden>' + c.loi.map(function (v) {
        return '<p><b>' + esc(v.ai) + '：</b><span class="hanzi">' + esc(v.han) + '</span><i>' + esc(v.py) + '</i></p>'; }).join('') +
      (c.vi ? '<p class="sbt-vi">' + esc(c.vi) + '</p>' : '') + '</div></li>';
  }
  // Câu đọc hiểu: pinyin trên chữ Hán như sách (ẩn được), ★câu hỏi, phương án riêng của câu hoặc chữ cái chung của phần
  function chuPy(o, lop) { return '<span class="sbt-chu ' + (lop || '') + '"><span class="sbt-py">' + esc(o.py) + '</span><span class="hanzi">' + esc(o.han) + '</span></span>'; }
  function veCauDoc(x, k) {
    var c = x.c, rieng = !!c.pa;
    return '<li class="sbt-cau sbt-cau-doc" data-ma="' + esc(c.ma) + '"><div class="sbt-de sbt-de-doc"><span class="sbt-so">' + (k + 1) + '</span><div class="sbt-noi">' +
      chuPy(c, 'sbt-cau-chu') + (c.hoi ? '<div class="sbt-hoi"><b>★</b>' + chuPy(c.hoi) + '</div>' : '') + '</div></div>' +
      '<div class="sbt-pa ' + (rieng ? 'sbt-pa-rieng' : 'sbt-pa-chu') + ' sbt-pa-' + x.pa.length + '">' + x.pa.map(function (kk, j) {
        var o = rieng ? c.pa.filter(function (a) { return a.k === kk; })[0] : null;
        return '<button type="button" class="sbt-o" data-j="' + j + '">' + (o ? '<b>' + esc(kk) + '</b>' + chuPy(o) : esc(kk)) + '</button>'; }).join('') + '</div>' +
      (c.vi ? '<div class="sbt-loi" hidden><p class="sbt-vi">' + esc(c.vi) + '</p></div>' : '') + '</li>';
  }
  // Câu nghe (模拟测练 · 听力): loa phát cụm / câu hỏi / câu + câu hỏi; chọn tranh riêng của câu (c.anh) hoặc phương án chữ (c.pa)
  function loiHtml(c) {
    return '<div class="sbt-loi" hidden>' + c.loi.map(function (v) {
      return '<p>' + (v.ai ? '<b>' + esc(v.ai) + '：</b>' : '') + '<span class="hanzi">' + esc(v.han) + '</span><i>' + esc(v.py) + '</i></p>'; }).join('') +
      (c.vi ? '<p class="sbt-vi">' + esc(c.vi) + '</p>' : '') + '</div>';
  }
  function veCauNghe(x, k) {
    var c = x.c, nut;
    if (c.anh) nut = '<div class="sbt-pa sbt-pa-anh sbt-pa-' + x.pa.length + '">' + x.pa.map(function (kk, j) {
      var a = c.anh.filter(function (z) { return z.k === kk; })[0];
      return '<button type="button" class="sbt-o sbt-o-anh" data-j="' + j + '" aria-label="Tranh ' + esc(kk) + '"><img src="' + esc(TV.ROOT + a.src) + '" alt="' + esc(a.alt || '') + '" loading="lazy" width="720" height="480"><span>' + esc(kk) + '</span></button>'; }).join('') + '</div>';
    else nut = '<div class="sbt-pa sbt-pa-rieng sbt-pa-' + x.pa.length + '">' + x.pa.map(function (kk, j) {
      var o = c.pa.filter(function (a) { return a.k === kk; })[0];
      return '<button type="button" class="sbt-o" data-j="' + j + '"><b>' + esc(kk) + '</b>' + chuPy(o) + '</button>'; }).join('') + '</div>';
    return '<li class="sbt-cau sbt-cau-tr" data-ma="' + esc(c.ma) + '"><div class="sbt-de"><span class="sbt-so">' + (k + 1) + '</span>' +
      TV.nutLoa(docHT(c)) + '<span class="sbt-goi">' + (c.loi.length > 1 ? 'Nghe câu và câu hỏi' : 'Nghe') + '</span></div>' + nut + loiHtml(c) + '</li>';
  }
  function ve() {
    var hs = hoSo();
    el.innerHTML = '<div class="sbt-hs lt-hs"><label>Họ tên đầy đủ<input type="text" class="sbt-ten lt-hs-ten" autocomplete="name" placeholder="VD: Nguyễn Văn An" value="' + esc(hs.hoTen || '') + '"></label>' +
      '<label>Lớp<input type="text" class="sbt-lop lt-hs-lop" placeholder="VD: HSK1-K3" value="' + esc(hs.lop || '') + '"></label>' +
      '<p class="lt-hs-ghi">Làm xong cả bài, kết quả được gửi cho cô giáo để theo dõi. Phần này không xếp hạng.</p></div>' +
      (D.phan.some(function (p) { return /^doc/.test(p.loai) || p.loai === 'nghe'; }) ? '<div class="sbt-cong-cu"><button type="button" class="btn sbt-nut-py" aria-pressed="' + !anPy() + '">' + (anPy() ? 'Hiện pinyin' : 'Ẩn pinyin') + '</button></div>' : '') +
      L.phan.map(function (x, i) {
        var p = x.p, tranh = p.loai === 'tranh', doc = /^doc/.test(p.loai), nghe = p.loai === 'nghe';
        return '<section class="sbt-phan card" data-i="' + i + '"><div class="sbt-phan-dau"><span class="sbt-phan-so">' + (i + 1) + '</span><div>' +
          '<h2 class="sbt-phan-ten">' + esc(p.ten) + '</h2><p class="sbt-phan-zh hanzi">' + esc(p.zh) + '</p></div>' +
          '<span class="sbt-dem" data-i="' + i + '">0 / ' + x.cau.length + '</span></div>' +
          '<p class="sbt-hd">' + esc(p.hd) + '</p>' +
          (tranh ? '<div class="sbt-tranh sbt-tranh-' + p.anh.length + '">' + p.anh.map(function (a) {
            return '<figure><img src="' + esc(TV.ROOT + a.src) + '" alt="' + esc(a.alt || ('Tranh ' + a.k)) + '" loading="lazy" width="720" height="480"><figcaption>' + esc(a.k) + '</figcaption></figure>'; }).join('') + '</div>' : '') +
          (p.luaChon ? '<div class="sbt-khung' + (p.loai === 'doc-dien' ? ' sbt-khung-tu' : '') + '">' + p.luaChon.map(function (o) {
            return '<div class="sbt-lc"><b>' + esc(o.k) + '</b>' + chuPy(o) + '</div>'; }).join('') + '</div>' : '') +
          '<ol class="sbt-ds' + (tranh || doc || nghe ? ' sbt-ds-tr' : '') + '">' + x.cau.map(function (y, k) { return tranh ? veCauTranh(y, k) : doc ? veCauDoc(y, k) : nghe ? veCauNghe(y, k) : veCauAm(y, k, p); }).join('') + '</ol></section>';
      }).join('') +
      '<div class="sbt-ket card" aria-live="polite"><p class="sbt-ket-dem">Đã làm <b>0</b> / ' + L.tong + ' câu</p></div>';
  }
  function capNhatDem() {
    L.phan.forEach(function (x, i) {
      var n = x.cau.filter(function (y) { return y.xong; }).length, d = x.cau.filter(function (y) { return y.dung; }).length;
      var e = el.querySelector('.sbt-dem[data-i="' + i + '"]'); if (!e) return;
      e.textContent = n < x.cau.length ? n + ' / ' + x.cau.length : '✓ ' + d + ' / ' + x.cau.length; e.classList.toggle('xong', n === x.cau.length);
    });
    var n = L.kq.length; if (n < L.tong) { el.querySelector('.sbt-ket').innerHTML = '<p class="sbt-ket-dem">Đã làm <b>' + n + '</b> / ' + L.tong + ' câu</p>'; return; }
    veKetQua();
  }
  function veKetQua() {
    var dung = L.kq.filter(function (k) { return k.dung; }).length, tl = Math.round(dung / L.tong * 100);
    L.giay = Math.round((Date.now() - L.luc) / 1000);
    var loi = tl === 100 ? 'Xuất sắc! Đúng hết rồi 🎉' : tl >= 80 ? 'Rất tốt! Xem lại vài câu còn sai là chắc 💪' : tl >= 50 ? 'Khá rồi, xem lại câu sai rồi làm thêm một lượt nhé 🌱' : 'Ôn lại từ vựng và ngữ âm của bài rồi làm lượt nữa nhé 🌱';
    var k = el.querySelector('.sbt-ket');
    k.innerHTML = '<div class="lt-diem">' + tl + '%</div><p class="lt-loi">' + loi + '</p>' +
      '<p class="lt-goi-y">Đúng ' + dung + ' / ' + L.tong + ' câu · ⏱ ' + (L.giay >= 60 ? Math.floor(L.giay / 60) + ' phút ' : '') + (L.giay % 60) + ' giây</p>' +
      '<ul class="ot-theo-phan">' + L.phan.map(function (x) {
        var d = x.cau.filter(function (y) { return y.dung; }).length;
        return '<li class="' + (d === x.cau.length ? 'dung' : '') + '"><span>' + esc(x.p.ten) + '</span><b>' + d + ' / ' + x.cau.length + '</b></li>'; }).join('') + '</ul>' +
      '<div class="sbt-luu"></div><div class="lt-nut-kq"><button type="button" class="btn solid sbt-lai">Làm lượt mới</button></div>';
    amThanh(tl >= 80 ? 'xong' : 'xongVua');
    if (G) G.gui({ maLuot: L.ma, phan: 'sbt-bai' + D.bai, hoTen: L.hoTen, lop: L.lop, batDau: L.batDau, giay: L.giay, soCau: L.tong, soDung: dung, cau: L.kq },
      k.querySelector('.sbt-luu'), 'Luyện theo dạng sách bài tập Bài ' + D.bai);
  }

  // ---------- chấm ----------
  function chon(b) {
    var li = b.closest('.sbt-cau'), sec = b.closest('.sbt-phan'), x = L.phan[+sec.dataset.i], y = x.cau.filter(function (z) { return z.c.ma === li.dataset.ma; })[0];
    if (!y || y.xong) return;
    var c = y.c, pc = y.pa[+b.dataset.j], dung = pc === c.dap;
    y.xong = true; y.dung = dung;
    li.querySelectorAll('.sbt-o').forEach(function (o) { o.disabled = true; var p = y.pa[+o.dataset.j]; if (p === c.dap) o.classList.add('dung'); else if (o === b) o.classList.add('sai'); });
    li.classList.add(dung ? 'dung' : 'sai');
    var a = li.querySelector('.sbt-am'), ad = li.querySelector('.sbt-am-dung'); if (a && ad) { a.hidden = true; ad.hidden = false; }
    var lo = li.querySelector('.sbt-loi'); if (lo) lo.hidden = false;
    var hs = hoSo(); L.hoTen = gon(hs.hoTen); L.lop = gon(hs.lop);
    L.kq.push({ stt: L.kq.length + 1, maCau: x.p.loai + (x.p.kieu ? '-' + x.p.kieu : '') + '/' + c.ma, dang: x.p.kieu || x.p.loai, nhom: x.p.ten,
      deBai: c.hien || (c.loi ? c.loi.map(function (v) { return (v.ai ? v.ai + '：' : '') + v.han; }).join(' ') : c.han + (c.hoi ? ' ★' + c.hoi.han : '')), dapAn: c.dap, chon: pc, dung: dung ? 1 : 0, thuTu: y.pa.join(' | ') });
    amThanh(dung ? 'dung' : 'sai');
    capNhatDem();
  }

  // ---------- sự kiện ----------
  el.addEventListener('click', function (e) {
    var o = e.target.closest('.sbt-o'); if (o && !o.disabled) { luuHs(); return chon(o); }
    var nP = e.target.closest('.sbt-nut-py');
    if (nP) { var an = !anPy(); try { localStorage.setItem('qm-sbt-an-py', an ? '1' : '0'); } catch (er) {}
      el.classList.toggle('sbt-an-py', an); nP.textContent = an ? 'Hiện pinyin' : 'Ẩn pinyin'; nP.setAttribute('aria-pressed', String(!an)); return; }
    if (e.target.closest('.sbt-lai')) { TV.dungDoc(); dungLuot(); ve(); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 90); }
  });
  el.addEventListener('change', function (e) { if (e.target.closest('.sbt-ten, .sbt-lop')) luuHs(); });

  // ---------- nạp dữ liệu ----------
  el.innerHTML = '<div class="tv-trong">Đang tải bài luyện…</div>';
  fetch(window.QM_SBT_TEP).then(function (r) { if (!r.ok) throw r; return r.json(); }).then(function (d) { D = d; el.classList.toggle('sbt-an-py', anPy()); dungLuot(); ve(); })
    .catch(function () { el.innerHTML = '<div class="tv-trong">Chưa tải được bài luyện, bạn kiểm tra mạng rồi thử lại nhé.</div>'; });
})();
