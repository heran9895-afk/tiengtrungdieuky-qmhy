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
  var VD = '例如', SO_PHAN = ['一', '二', '三', '四', '五', '六', '七', '八'];

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
      function goi(c) { return { c: c, pa: p.loai === 'am' ? tron1([c.dap].concat(c.nhieu)) : (c.pa || c.anh || p.anh || p.luaChon).map(function (a) { return a.k; }) }; }
      return { p: p, cau: tron1(p.cau).map(goi), vd: p.vd ? goi(p.vd) : null };
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
  function tim(ds, kk) { return (ds || []).filter(function (a) { return a.k === kk; })[0]; }
  function anhNut(a, kk, j) {
    return '<button type="button" class="sbt-o sbt-o-anh" data-j="' + j + '" aria-label="Tranh ' + esc(kk) + '"><img src="' + esc(TV.ROOT + a.src) + '" alt="' + esc(a.alt || '') + '" loading="lazy" width="720" height="480"><span>' + esc(kk) + '</span></button>';
  }
  function chuNut(o, kk, j) { return '<button type="button" class="sbt-o" data-j="' + j + '"><b>' + esc(kk) + '</b>' + chuPy(o) + '</button>'; }
  // Câu đọc hiểu: pinyin trên chữ Hán như sách (ẩn được)
  function chuPy(o, lop) { return '<span class="sbt-chu ' + (lop || '') + '"><span class="sbt-py">' + esc(o.py) + '</span><span class="hanzi">' + esc(o.han) + '</span></span>'; }
  function soLi(c, k, lop, noi) { return '<li class="sbt-cau ' + (lop || '') + '" data-ma="' + esc(c.ma) + '"><div class="sbt-de"><span class="sbt-so">' + so(k) + '</span>' + noi; }
  // k là số thứ tự (0, 1, …) hoặc nhãn chữ ('例如') của câu ví dụ
  function so(k) { return typeof k === 'string' ? k : k + 1; }

  // ----- Câu nghe (hội thoại chọn tranh; 模拟测练 · 听力): gọn, KHÔNG hiện lời sau khi chọn — lời gom vào "Tài liệu nghe" cuối bài (cô chốt 06/11) -----
  function veCauNghe(x, k, p) {
    var c = x.c, anh = c.anh || p.anh, nut;
    if (anh) nut = '<div class="sbt-pa sbt-pa-anh sbt-pa-anh-' + x.pa.length + '">' + x.pa.map(function (kk, j) { return anhNut(tim(anh, kk), kk, j); }).join('') + '</div>';
    else nut = '<div class="sbt-pa sbt-pa-rieng sbt-pa-ngang sbt-pa-' + x.pa.length + '">' + x.pa.map(function (kk, j) { return chuNut(tim(c.pa, kk), kk, j); }).join('') + '</div>';
    return soLi(c, k, 'sbt-cau-nghe', TV.nutLoa(docHT(c)) + '</div>') + nut + '</li>';
  }
  // ----- Đọc câu, chọn tranh: tranh một lần ở đầu phần, câu xếp gọn với hàng chữ cái A–F -----
  function nutChu(x) { return '<div class="sbt-chip">' + x.pa.map(function (kk, j) { return '<button type="button" class="sbt-o" data-j="' + j + '">' + esc(kk) + '</button>'; }).join('') + '</div>'; }
  function veCauDocTranh(x, k) { var c = x.c; return soLi(c, k, 'sbt-cau-gon', chuPy(c, 'sbt-cau-chu') + '</div>') + nutChu(x) + '</li>'; }
  // ----- Chọn từ điền chỗ trống: ô chọn ngay tại chỗ trống -----
  function oChon(x) {
    return '<select class="sbt-sel" aria-label="Chọn đáp án"><option value="">—</option>' + x.pa.map(function (kk, j) { return '<option value="' + j + '">' + esc(kk) + '</option>'; }).join('') + '</select>';
  }
  function veCauDien(x, k) {
    var c = x.c, ps = esc(c.han).split('（　）');
    return soLi(c, k, 'sbt-cau-gon', '<span class="sbt-chu sbt-cau-chu"><span class="sbt-py">' + esc(c.py) + '</span><span class="hanzi">' +
      ps[0] + '（<span class="sbt-o-sel">' + oChon(x) + '</span>）' + (ps[1] || '') + '</span></span></div>') + '</li>';
  }
  // ----- Đọc câu + ★câu hỏi, chọn đáp án -----
  function veCauDoc(x, k) {
    var c = x.c;
    return soLi(c, k, 'sbt-cau-doc', '<div class="sbt-noi">' + chuPy(c, 'sbt-cau-chu') + (c.hoi ? '<div class="sbt-hoi"><b>★</b>' + chuPy(c.hoi) + '</div>' : '') + '</div></div>') +
      '<div class="sbt-pa sbt-pa-rieng sbt-pa-ngang sbt-pa-' + x.pa.length + '">' + x.pa.map(function (kk, j) { return chuNut(tim(c.pa, kk), kk, j); }).join('') + '</div></li>';
  }
  // ----- Nối câu: cột câu hỏi | cột câu trả lời A–F, hàng ô điền đáp án bên dưới -----
  function veGhep(x, p) {
    function ds(f) { return (x.vd ? f(x.vd, VD) : '') + x.cau.map(f).join(''); }
    return '<div class="sbt-ghep"><ol class="sbt-ghep-hoi">' + ds(function (y, k) {
        return '<li data-ma="' + esc(y.c.ma) + '"' + (k === VD ? ' class="sbt-cau-vd dung"' : '') + '><span class="sbt-so">' + so(k) + '</span>' + chuPy(y.c) + '</li>'; }) + '</ol>' +
      '<div class="sbt-khung sbt-ghep-dap">' + p.luaChon.map(function (o) { return '<div class="sbt-lc"><b>' + esc(o.k) + '</b>' + chuPy(o) + '</div>'; }).join('') + '</div></div>' +
      '<ol class="sbt-ds sbt-dap-hang">' + ds(function (y, k) {
        return '<li class="sbt-cau sbt-cau-o" data-ma="' + esc(y.c.ma) + '"><span class="sbt-so">' + so(k) + '</span><span class="sbt-o-sel">' + oChon(y) + '</span></li>'; }) + '</ol>';
  }
  function ve() {
    var hs = hoSo();
    el.innerHTML = '<div class="sbt-hs lt-hs"><label>Họ tên đầy đủ<input type="text" class="sbt-ten lt-hs-ten" autocomplete="name" placeholder="VD: Nguyễn Văn An" value="' + esc(hs.hoTen || '') + '"></label>' +
      '<label>Lớp<input type="text" class="sbt-lop lt-hs-lop" placeholder="VD: HSK1-K3" value="' + esc(hs.lop || '') + '"></label>' +
      '<p class="lt-hs-ghi">Làm xong cả bài, kết quả được gửi cho cô giáo để theo dõi. Phần này không xếp hạng.</p></div>' +
      (D.phan.some(function (p) { return /^doc/.test(p.loai) || p.loai === 'nghe'; }) ? '<div class="sbt-cong-cu"><button type="button" class="btn sbt-nut-py" aria-pressed="' + !anPy() + '">' + (anPy() ? 'Hiện pinyin' : 'Ẩn pinyin') + '</button></div>' : '') +
      L.phan.map(function (x, i) {
        var p = x.p, L2 = p.loai, than;
        function ds(f) { return (x.vd ? f(x.vd, VD, p) : '') + x.cau.map(function (y, k) { return f(y, k, p); }).join(''); }
        if (L2 === 'tranh' || L2 === 'nghe') than = '<ol class="sbt-ds sbt-ds-nghe">' + ds(veCauNghe) + '</ol>';
        else if (L2 === 'doc-tranh') than = '<div class="sbt-tranh sbt-tranh-' + p.anh.length + '">' + p.anh.map(function (a) {
            return '<figure><img src="' + esc(TV.ROOT + a.src) + '" alt="' + esc(a.alt || ('Tranh ' + a.k)) + '" loading="lazy" width="720" height="480"><figcaption>' + esc(a.k) + '</figcaption></figure>'; }).join('') + '</div>' +
          '<ol class="sbt-ds sbt-ds-2">' + ds(veCauDocTranh) + '</ol>';
        else if (L2 === 'doc-ghep') than = veGhep(x, p);
        else if (L2 === 'doc-dien') than = '<div class="sbt-khung sbt-khung-tu">' + p.luaChon.map(function (o) { return '<div class="sbt-lc"><b>' + esc(o.k) + '</b>' + chuPy(o) + '</div>'; }).join('') + '</div>' +
          '<ol class="sbt-ds sbt-ds-2">' + ds(veCauDien) + '</ol>';
        else if (L2 === 'doc-hoi') than = '<ol class="sbt-ds sbt-ds-tr">' + ds(veCauDoc) + '</ol>';
        else than = '<ol class="sbt-ds">' + x.cau.map(function (y, k) { return veCauAm(y, k, p); }).join('') + '</ol>';
        return '<section class="sbt-phan card sbt-l-' + L2 + '" data-i="' + i + '"><div class="sbt-phan-dau"><span class="sbt-phan-so">' + (i + 1) + '</span><div>' +
          '<h2 class="sbt-phan-ten">' + esc(p.ten) + '</h2><p class="sbt-phan-zh hanzi">' + esc(p.zh) + '</p></div>' +
          '<span class="sbt-dem" data-i="' + i + '">0 / ' + x.cau.length + '</span></div>' +
          '<p class="sbt-hd">' + esc(p.hd) + '</p>' + than + '</section>';
      }).join('') +
      '<div class="sbt-ket card" aria-live="polite"><p class="sbt-ket-dem">Đã làm <b>0</b> / ' + L.tong + ' câu</p></div><div class="sbt-tlnghe"></div>';
    danhDauVD();
  }
  // Câu ví dụ (例如, lấy từ sách): câu đầu của phần, cùng kiểu câu thường, hiện sẵn đáp án ✓, không chọn, không tính điểm;
  // bên dưới một dòng nhỏ: lời nghe (phần nghe) + nghĩa tiếng Việt
  function danhDauVD() {
    L.phan.forEach(function (x, i) {
      if (!x.vd) return;
      var sec = el.querySelector('.sbt-phan[data-i="' + i + '"]'), j = x.vd.pa.indexOf(x.vd.c.dap);
      sec.querySelectorAll('.sbt-cau[data-ma="vd"]').forEach(function (li) {
        li.classList.add('sbt-cau-vd', 'dung');
        li.querySelectorAll('.sbt-o').forEach(function (o) { o.disabled = true; if (+o.dataset.j === j) o.classList.add('dung'); });
        var sel = li.querySelector('.sbt-sel'); if (sel) { sel.value = String(j); sel.disabled = true; sel.closest('.sbt-o-sel').classList.add('dung'); }
        if (li.classList.contains('sbt-cau-o')) return;
        var v = x.vd.c, ghi = (v.loi ? v.loi.map(function (l) { return (l.ai ? l.ai + '：' : '') + l.han; }).join(' ') + ' — ' : '') + (v.vi || '');
        if (ghi) li.insertAdjacentHTML('beforeend', '<p class="sbt-vd-ghi">' + esc(ghi) + '</p>');
      });
      var hoi = sec.querySelector('.sbt-ghep-hoi li.sbt-cau-vd');
      if (hoi && x.vd.c.vi) hoi.insertAdjacentHTML('beforeend', '<span class="sbt-vd-ghi">' + esc(x.vd.c.vi) + '</span>');
    });
  }
  // Tài liệu nghe: hiện một lượt khi đã làm xong toàn bộ bài, đánh số theo thứ tự câu trên trang
  function veTaiLieuNghe() {
    var ds = L.phan.map(function (x, i) { return { x: x, i: i }; }).filter(function (o) { return o.x.p.loai === 'tranh' || o.x.p.loai === 'nghe'; });
    if (!ds.length) return '';
    return '<section class="sbt-phan card sbt-tl"><h2 class="sbt-phan-ten">🎧 Tài liệu nghe</h2>' + ds.map(function (o) {
      return '<h3 class="sbt-tl-phan">Phần ' + (o.i + 1) + ' · ' + esc(o.x.p.ten) + '</h3><ol class="sbt-tl-ds">' + o.x.cau.map(function (y) {
        return '<li><div>' + y.c.loi.map(function (l) { return '<p>' + (l.ai ? '<b>' + esc(l.ai) + '：</b>' : '') + chuPy(l) + '</p>'; }).join('') + '</div>' +
          '<span class="sbt-tl-dap ' + (y.dung ? 'dung' : 'sai') + '">' + esc(y.c.dap) + '</span>' + TV.nutLoa(docHT(y.c)) + '</li>'; }).join('') + '</ol>';
    }).join('') + '</section>';
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
    var tln = el.querySelector('.sbt-tlnghe'); if (tln) tln.innerHTML = veTaiLieuNghe();
    amThanh(tl >= 80 ? 'xong' : 'xongVua');
    if (window.QM_NK && L.nk) QM_NK.xongLuot(L.ma, L.giay);
    if (G) G.gui({ maLuot: L.ma, phan: 'sbt-bai' + D.bai, hoTen: L.hoTen, lop: L.lop, batDau: L.batDau, giay: L.giay, soCau: L.tong, soDung: dung, cau: L.kq },
      k.querySelector('.sbt-luu'), 'Luyện theo dạng sách bài tập Bài ' + D.bai);
  }

  // ---------- chấm ----------
  function timCau(sec, ma) { var x = L.phan[+sec.dataset.i]; return { x: x, y: x.cau.filter(function (z) { return z.c.ma === ma; })[0] }; }
  function cham(x, y, pc, li) {
    var c = y.c, dung = pc === c.dap;
    y.xong = true; y.dung = dung;
    li.classList.add(dung ? 'dung' : 'sai');
    var hoi = li.closest('.sbt-phan').querySelector('.sbt-ghep-hoi li[data-ma="' + c.ma + '"]'); if (hoi) hoi.classList.add(dung ? 'dung' : 'sai');
    var hs = hoSo(); L.hoTen = gon(hs.hoTen); L.lop = gon(hs.lop);
    L.kq.push({ stt: L.kq.length + 1, maCau: x.p.loai + (x.p.kieu ? '-' + x.p.kieu : '') + '/' + c.ma, dang: x.p.kieu || x.p.loai, nhom: x.p.ten,
      deBai: c.hien || (c.loi ? c.loi.map(function (v) { return (v.ai ? v.ai + '：' : '') + v.han; }).join(' ') : c.han + (c.hoi ? ' ★' + c.hoi.han : '')), dapAn: c.dap, chon: pc, dung: dung ? 1 : 0, thuTu: y.pa.join(' | ') });
    if (window.QM_NK) QM_NK.theoL(L, { phan: 'sbt-bai' + D.bai, bai: 'Luyện theo dạng sách bài tập · Bài ' + D.bai }, L.kq[L.kq.length - 1]);
    amThanh(dung ? 'dung' : 'sai');
    capNhatDem();
  }
  function chon(b) {
    var li = b.closest('.sbt-cau'), t = timCau(b.closest('.sbt-phan'), li.dataset.ma), y = t.y;
    if (!y || y.xong) return;
    var pc = y.pa[+b.dataset.j];
    li.querySelectorAll('.sbt-o').forEach(function (o) { o.disabled = true; var p = y.pa[+o.dataset.j]; if (p === y.c.dap) o.classList.add('dung'); else if (o === b) o.classList.add('sai'); });
    var a = li.querySelector('.sbt-am'), ad = li.querySelector('.sbt-am-dung'); if (a && ad) { a.hidden = true; ad.hidden = false; }
    cham(t.x, y, pc, li);
  }
  function chonSel(sel) {
    if (sel.value === '') return;
    var li = sel.closest('.sbt-cau'), t = timCau(sel.closest('.sbt-phan'), li.dataset.ma), y = t.y;
    if (!y || y.xong) return;
    var pc = y.pa[+sel.value], w = sel.closest('.sbt-o-sel');
    sel.disabled = true; w.classList.add(pc === y.c.dap ? 'dung' : 'sai');
    if (pc !== y.c.dap) w.insertAdjacentHTML('afterend', '<span class="sbt-sua">' + esc(y.c.dap) + '</span>');
    cham(t.x, y, pc, li);
  }

  // ---------- sự kiện ----------
  el.addEventListener('click', function (e) {
    var o = e.target.closest('.sbt-o'); if (o && !o.disabled) { luuHs(); return chon(o); }
    var nP = e.target.closest('.sbt-nut-py');
    if (nP) { var an = !anPy(); try { localStorage.setItem('qm-sbt-an-py', an ? '1' : '0'); } catch (er) {}
      el.classList.toggle('sbt-an-py', an); nP.textContent = an ? 'Hiện pinyin' : 'Ẩn pinyin'; nP.setAttribute('aria-pressed', String(!an)); return; }
    if (e.target.closest('.sbt-lai')) { TV.dungDoc(); dungLuot(); ve(); window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 90); }
  });
  el.addEventListener('change', function (e) {
    if (e.target.closest('.sbt-ten, .sbt-lop')) return luuHs();
    if (e.target.classList.contains('sbt-sel')) { luuHs(); chonSel(e.target); }
  });

  // ---------- nạp dữ liệu ----------
  el.innerHTML = '<div class="tv-trong">Đang tải bài luyện…</div>';
  fetch(window.QM_SBT_TEP).then(function (r) { if (!r.ok) throw r; return r.json(); }).then(function (d) { D = d; el.classList.toggle('sbt-an-py', anPy()); dungLuot(); ve(); })
    .catch(function () { el.innerHTML = '<div class="tv-trong">Chưa tải được bài luyện, bạn kiểm tra mạng rồi thử lại nhé.</div>'; });
})();
