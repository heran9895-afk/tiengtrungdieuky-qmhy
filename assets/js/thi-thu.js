/* =========================================================
   THI THỬ TRÊN MÁY (HSK 3.0 · HSK 1) — tab thứ hai của trang "Luyện theo dạng sách bài tập"
   Đề 40 câu: 听力 20 (4 phần) + 阅读 20 (4 phần), không có bài ngữ âm.
   Dữ liệu: data/bai/sach-bai-tap/thi-N.json (tools/sach_bai_tap/dung.py; câu bổ sung ở noi_dung_thi.py).
   Cách thi: phần nghe tự phát lần lượt, mỗi câu 2 lần; hết phần nghe sang phần đọc 20 phút, không quay lại;
   đổi đáp án được tới khi nộp; hết giờ tự nộp; nộp xong mới hiện điểm, đáp án, lời nghe.
   Nút Tạm dừng chỉ hiện khi cô đang bật chế độ Dạy trên lớp. Không đụng tới tab Luyện tập (luyen-sach.js).
   Đặt window.QM_THI_TEP = đường dẫn file đề. Nạp sau tu-vung-chung.js, on-tap-gui.js, luyen-sach.js.
   ========================================================= */
(function () {
  var khuLuyen = document.getElementById('luyen-sach'), TV = window.QM_TV, G = window.QM_OTG;
  if (!khuLuyen || !TV || !window.QM_THI_TEP) return;
  var esc = TV.esc, KHOA_HS = 'qmhy:hoSo', KHOA_PY = 'qmhy-thi-an-py';
  var PHUT_DOC = 20, GIAY_XEM_LAI_NGHE = 60, NGHI_HAI_LAN = 2500, NGHI_SAU_CAU = [6000, 6000, 6000, 8000];
  var BO = [{ ten: '听力', tv: 'Nghe', so: ['第一部分', '第二部分', '第三部分', '第四部分'] }, { ten: '阅读', tv: 'Đọc', so: ['第一部分', '第二部分', '第三部分', '第四部分'] }];
  var D = null, S = null, man = null;

  function docLS(k, md) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : md; } catch (e) { return md; } }
  function ghiLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function gon(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function hoSo() { var h = window.QM_TK && QM_TK.hoSoDang && QM_TK.hoSoDang(); return h ? { hoTen: h.hoTen, lop: h.lop } : docLS(KHOA_HS, {}); }
  function anPy() { return docLS(KHOA_PY, 0) === 1; }
  function dayHoc() { return !!(window.QM_LT_LOP && QM_LT_LOP.dangBat()); }
  function tron(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function tim(ds, k) { return (ds || []).filter(function (a) { return a.k === k; })[0]; }
  function laNghe(i) { return i < 4; }

  // ---------- hai tab ----------
  var tab = document.createElement('div');
  tab.className = 'thi-tab'; tab.setAttribute('role', 'tablist');
  tab.innerHTML = '<button type="button" role="tab" data-t="luyen" aria-selected="true">✏️ Luyện tập</button>' +
    '<button type="button" role="tab" data-t="thi" aria-selected="false">🖥️ Thi thử trên máy</button>';
  var khu = document.createElement('div'); khu.id = 'thi-thu'; khu.hidden = true;
  khuLuyen.parentNode.insertBefore(tab, khuLuyen); khuLuyen.parentNode.insertBefore(khu, khuLuyen.nextSibling);
  function chonTab(t) {
    var thi = t === 'thi';
    tab.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.t === t)); });
    khuLuyen.hidden = thi; khu.hidden = !thi; TV.dungDoc();
    var phu = document.querySelector('.sec-head .sec-sub'); if (phu) phu.hidden = thi;   // câu giới thiệu là của tab Luyện tập
    if (thi) veCho();
  }
  tab.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    chonTab(b.dataset.t);
    try { history.replaceState(null, '', b.dataset.t === 'thi' ? '#thi-thu' : location.pathname + location.search); } catch (er) {}
  });

  // ---------- màn chờ ----------
  function veCho() {
    if (!D) { khu.innerHTML = '<div class="tv-trong">Đang tải đề thi thử…</div>'; return; }
    var hs = hoSo();
    khu.innerHTML = '<div class="thi-cho card"><h2>Thi thử trên máy · Bài ' + D.bai + '</h2>' +
      '<p class="thi-cho-zh hanzi">模拟考试 · 共计 40 题</p>' +
      '<table class="thi-bang"><thead><tr><th>Phần</th><th>Số câu</th><th>Thời gian</th></tr></thead><tbody>' +
      '<tr><td>听力 · Nghe</td><td>20</td><td>theo bài nghe, khoảng 6–7 phút</td></tr>' +
      '<tr><td>阅读 · Đọc</td><td>20</td><td>' + PHUT_DOC + ' phút</td></tr></tbody></table>' +
      '<ul class="thi-luat"><li>Phần nghe <b>tự phát lần lượt, mỗi câu 2 lần</b>, không bấm nghe lại được.</li>' +
      '<li>Hết phần nghe có ' + GIAY_XEM_LAI_NGHE + ' giây xem lại. <b>Đã sang phần đọc thì không quay lại phần nghe.</b></li>' +
      '<li>Chưa nộp thì đổi đáp án thoải mái. Bấm ☆ để đánh dấu câu cần xem lại. Hết giờ máy tự nộp bài.</li>' +
      '<li>Nộp bài xong mới hiện điểm, đáp án và lời của phần nghe.</li></ul>' +
      '<div class="sbt-hs lt-hs"><label>Họ tên đầy đủ<input type="text" class="thi-ten lt-hs-ten" autocomplete="name" placeholder="VD: Nguyễn Văn An" value="' + esc(hs.hoTen || '') + '"></label>' +
      '<label>Lớp<input type="text" class="thi-lop lt-hs-lop" placeholder="VD: HSK1-K3" value="' + esc(hs.lop || '') + '"></label>' +
      '<p class="lt-hs-ghi">Nộp bài xong, kết quả được gửi cho cô giáo. Phần này không xếp hạng.</p></div>' +
      '<div class="thi-cho-nut"><button type="button" class="btn thi-nghe-thu">🔊 Kiểm tra âm thanh</button>' +
      '<button type="button" class="btn solid thi-bat-dau">Bắt đầu thi ›</button></div></div>';
  }
  khu.addEventListener('click', function (e) {
    if (e.target.closest('.thi-nghe-thu')) { moAm(); var v = D.phan[0].vd || D.phan[0].cau[0]; phatCau(v, ++luot, function () {}); }
    if (e.target.closest('.thi-bat-dau')) batDau();
  });
  khu.addEventListener('change', function (e) {
    if (!e.target.closest('.thi-ten, .thi-lop')) return;
    ghiLS(KHOA_HS, Object.assign({}, docLS(KHOA_HS, {}), { hoTen: gon(khu.querySelector('.thi-ten').value), lop: gon(khu.querySelector('.thi-lop').value) }));
  });

  // ---------- âm thanh: một trình phát duy nhất, mở khóa ngay trong cú bấm của học sinh ----------
  var may = new Audio(), luot = 0, hen = [], ctx = null;
  function dungAm() { luot++; hen.forEach(clearTimeout); hen = []; may.onended = may.onerror = null; may.pause(); if (window.speechSynthesis) speechSynthesis.cancel(); }
  function moAm() {
    TV.dungDoc(); dungAm();
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); if (ctx.state === 'suspended') ctx.resume(); } catch (e) {}
    if (window.speechSynthesis) { var u = new SpeechSynthesisUtterance(' '); u.volume = 0; speechSynthesis.speak(u); }
  }
  function sau(ms, l, fn) { hen.push(setTimeout(function () { if (l === luot) fn(); }, ms)); }
  function bip() {
    if (!ctx) return;
    try { var o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + .01; o.frequency.value = 740;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.08, t + .02); g.gain.exponentialRampToValueAtTime(.0005, t + .22);
      o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + .25); } catch (e) {}
  }
  function docMay(han, l, xong) {                                   // chưa có file giọng: đọc bằng giọng của máy
    var roi = false; function het() { if (roi || l !== luot) return; roi = true; xong(); }
    if (!window.speechSynthesis) { baoAm('Trình duyệt này chưa đọc được câu này. Bạn thử mở bằng Chrome nhé.'); return sau(2500, l, het); }
    var u = new SpeechSynthesisUtterance(han); u.lang = 'zh-CN'; u.rate = .8; u.onend = u.onerror = het;
    speechSynthesis.cancel(); speechSynthesis.speak(u); sau(han.length * 550 + 3000, l, het);
  }
  function phatLoi(url, han, l, xong, biChan) {
    var roi = false; function het() { if (roi || l !== luot) return; roi = true; may.onended = may.onerror = null; xong(); }
    function hong() { if (roi || l !== luot) return; roi = true; may.onended = may.onerror = null; docMay(han, l, xong); }
    may.onended = het; may.onerror = hong; may.src = TV.ROOT + url;
    var p = may.play();
    if (p && p.catch) p.catch(function (e) { if (l !== luot) return; if (e && e.name === 'NotAllowedError' && biChan) biChan(); else hong(); });
  }
  function phatCau(c, l, xong, biChan) {
    var i = 0;
    (function tiep() {
      if (i >= c.loi.length) return xong();
      var j = i++; phatLoi(c.am[j], c.loi[j].han, l, function () { sau(j + 1 < c.loi.length ? 700 : 0, l, tiep); }, biChan);
    })();
  }
  function baoAm(t) { var e = man && man.querySelector('.thi-bao'); if (e) { e.textContent = t; e.hidden = false; } else TV.baoLoi(t); }

  // ---------- một lượt thi ----------
  function batDau() {
    moAm();
    var hs = { hoTen: gon(khu.querySelector('.thi-ten').value), lop: gon(khu.querySelector('.thi-lop').value) };
    var so = 0;
    S = { pha: 'nghe', phan: D.phan.map(function (p, i) {
      return { p: p, i: i, cau: tron(p.cau).map(function (c) { return { c: c, so: ++so, i: i, chon: null, dau: false }; }) };
    }), dang: 0, hoTen: hs.hoTen, lop: hs.lop, ma: G ? G.maLuot() : String(Date.now()), luc: Date.now(), batDau: new Date().toISOString(),
      phat: null, dungLai: false, het: 0, dongHo: null, hangNghe: null };
    S.tat = []; S.phan.forEach(function (x) { S.tat = S.tat.concat(x.cau); });
    // thứ tự phát của phần nghe: mỗi phần phát câu ví dụ một lần, rồi từng câu hai lần
    S.hangNghe = [];
    S.phan.slice(0, 4).forEach(function (x, i) {
      if (x.p.vd) S.hangNghe.push({ i: i, vd: true, c: x.p.vd });
      x.cau.forEach(function (y) { S.hangNghe.push({ i: i, y: y, c: y.c }); });
    });
    S.viTri = 0;
    moMan(); veMan();
    var l = luot; sau(1500, l, function () { ngheMuc(); });
    window.addEventListener('beforeunload', canThoat);
  }
  function canThoat(e) { if (S && S.pha !== 'xem') { e.preventDefault(); e.returnValue = ''; } }

  function ngheMuc() {
    if (!S || S.pha !== 'nghe' || S.dungLai) return;
    var m = S.hangNghe[S.viTri];
    if (!m) return hetNghe();
    var l = ++luot; S.phat = m;
    if (S.dang !== m.i) sangPhan(m.i);
    toSang(); veDau();
    function chan() {                                   // trình duyệt chặn tự phát: nhờ học sinh bấm một lần
      hop('<p>Trình duyệt đang chặn tự phát âm thanh.</p>', [{ chu: '▶ Tiếp tục nghe', chinh: true, lam: function () { moAm(); ngheMuc(); } }]);
    }
    bip();
    sau(900, l, function () {
      phatCau(m.c, l, function () {
        if (m.vd) return sau(2500, l, tiep);
        trangNghe('Nghỉ giữa hai lần đọc');
        sau(NGHI_HAI_LAN, l, function () {
          trangNghe('Đang đọc lần 2');
          phatCau(m.c, l, function () { trangNghe('Chọn đáp án'); sau(NGHI_SAU_CAU[m.i], l, tiep); }, chan);
        });
      }, chan);
    });
    trangNghe(m.vd ? 'Đang đọc câu ví dụ' : 'Đang đọc lần 1');
    function tiep() { S.viTri++; ngheMuc(); }
  }
  function trangNghe(t) { if (S) { S.chuNghe = t; var e = man.querySelector('.thi-chu-nghe'); if (e) e.textContent = t; } }
  function hetNghe() {
    S.phat = null; S.pha = 'choDoc'; dungAm(); var con = GIAY_XEM_LAI_NGHE;
    veDau(); toSang();
    var b = man.querySelector('.thi-bang-cho'); b.hidden = false;
    b.innerHTML = '<span><b>Hết phần nghe.</b> Bạn còn <b class="thi-dem-cho">' + con + '</b> giây xem lại đáp án nghe.</span><button type="button" class="btn solid" data-l="vao-doc">Vào phần đọc ›</button>';
    clearInterval(S.dongHo);
    S.dongHo = setInterval(function () { if (S.dungLai) return; con--; var e = b.querySelector('.thi-dem-cho'); if (e) e.textContent = Math.max(con, 0); if (con <= 0) vaoDoc(); }, 1000);
  }
  function vaoDoc() {
    dongHop(); clearInterval(S.dongHo); S.pha = 'doc'; S.dang = 4; S.het = Date.now() + PHUT_DOC * 60000;
    man.querySelector('.thi-bang-cho').hidden = true;
    veMan();
    S.dongHo = setInterval(function () {
      if (S.dungLai) return;
      var con = S.het - Date.now(); veGio();
      if (con <= 0) nopBai(true);
    }, 500);
  }
  function tamDung() {
    S.dungLai = !S.dungLai;
    if (S.dungLai) { if (S.pha === 'nghe') dungAm(); if (S.pha === 'doc') S.conLai = S.het - Date.now(); }
    else { if (S.pha === 'doc') S.het = Date.now() + S.conLai; if (S.pha === 'nghe') { moAm(); ngheMuc(); } }
    veDau();
  }

  // ---------- khung màn thi ----------
  function moMan() {
    if (man) man.remove();
    man = document.createElement('div'); man.className = 'thi-man' + (anPy() ? ' sbt-an-py' : '');
    man.innerHTML = '<header class="thi-dau"></header><div class="thi-bao" hidden></div><div class="thi-bang-cho" hidden></div>' +
      '<div class="thi-giua"><div class="thi-cot"><nav class="thi-nav"></nav><main class="thi-than"></main></div><aside class="thi-the"></aside></div>' +
      '<footer class="thi-chan"></footer><div class="thi-phu" hidden></div>';
    document.body.appendChild(man); document.documentElement.classList.add('thi-mo');
    man.addEventListener('click', bam);
  }
  function dongMan() {
    dungAm(); if (S) clearInterval(S.dongHo); window.removeEventListener('beforeunload', canThoat);
    if (man) man.remove(); man = null; S = null; document.documentElement.classList.remove('thi-mo');
  }
  function veMan() { veDau(); veNav(); veThan(); veThe(); }
  function phanHien() { if (S.pha === 'xem') return [0, 1, 2, 3, 4, 5, 6, 7]; return S.pha === 'doc' ? [4, 5, 6, 7] : [0, 1, 2, 3]; }
  function veDau() {
    if (!S) return;
    var h = man.querySelector('.thi-dau'), pha = S.pha === 'doc' ? '阅读 · Đọc' : (S.pha === 'xem' ? 'Xem lại bài' : '听力 · Nghe'), giua = '';
    if (S.pha === 'nghe') {
      var dang = S.phat && S.phat.y ? 'Câu ' + S.phat.y.so + ' / 20' : (S.phat ? '例如' : 'Chuẩn bị nghe');
      giua = '<span class="thi-loa-song" aria-hidden="true">🔊</span><b>' + dang + '</b><span class="thi-chu-nghe">' + esc(S.dungLai ? 'Đang tạm dừng' : (S.chuNghe || '')) + '</span>';
    } else if (S.pha === 'doc') giua = '<span class="thi-gio" aria-label="Thời gian còn lại"></span>';
    h.innerHTML = '<div class="thi-ten-de"><b>Bài ' + D.bai + '</b><span>' + pha + '</span></div><div class="thi-dau-giua">' + giua + '</div>' +
      '<div class="thi-dau-nut">' + (dayHoc() && (S.pha === 'nghe' || S.pha === 'doc') ? '<button type="button" data-l="dung">' + (S.dungLai ? '▶ Tiếp tục' : '⏸ Tạm dừng') + '</button>' : '') +
      '<button type="button" data-l="py" aria-pressed="' + !anPy() + '">' + (anPy() ? 'Hiện pinyin' : 'Ẩn pinyin') + '</button><button type="button" data-l="thoat">✕ Thoát</button></div>';
    veGio();
  }
  function veGio() {
    var e = man && man.querySelector('.thi-gio'); if (!e || !S || S.pha !== 'doc') return;
    var con = Math.max(0, Math.ceil((S.dungLai ? S.conLai : S.het - Date.now()) / 1000));
    e.textContent = '⏱ ' + ('0' + Math.floor(con / 60)).slice(-2) + ':' + ('0' + con % 60).slice(-2);
    e.classList.toggle('gap', con <= 300);
  }
  function veNav() {
    man.querySelector('.thi-nav').innerHTML = phanHien().map(function (i) {
      return '<button type="button" data-l="phan" data-i="' + i + '" aria-current="' + (i === S.dang) + '"><b>' + BO[i < 4 ? 0 : 1].ten + '</b> ' + BO[i < 4 ? 0 : 1].so[i % 4] + '</button>';
    }).join('');
    var cur = man.querySelector('.thi-nav [aria-current="true"]'), nav = man.querySelector('.thi-nav');
    if (cur) nav.scrollLeft = Math.max(0, cur.offsetLeft - nav.offsetLeft - 40);
  }

  // ---------- nội dung một phần ----------
  function chuPy(o, lop) { return '<span class="sbt-chu ' + (lop || '') + '"><span class="sbt-py">' + esc(o.py) + '</span><span class="hanzi">' + esc(o.han) + '</span></span>'; }
  function lopO(y, k, vd) {
    var c = y ? y.c : vd;
    if (!y) return k === c.dap ? ' dung' : '';
    if (S.pha !== 'xem') return y.chon === k ? ' chon' : '';
    return k === c.dap ? ' dung' : (y.chon === k ? ' sai chon' : '');
  }
  function nut(y, vd, k, noi, lop) {
    var khoa = !y || S.pha === 'xem';
    return '<button type="button" class="thi-o ' + (lop || '') + lopO(y, k, vd) + '"' + (khoa ? ' disabled' : ' data-l="chon" data-k="' + esc(k) + '"') +
      ' aria-pressed="' + (y ? y.chon === k : k === vd.dap) + '">' + noi + '</button>';
  }
  function luaChonCau(p, y, vd) {
    var c = y ? y.c : vd;
    if (p.loai === 'nghe' && c.anh) return '<div class="thi-pa-anh">' + c.anh.map(function (a) {
      return nut(y, vd, a.k, '<img src="' + esc(TV.ROOT + a.src) + '" alt="' + esc(a.alt) + '" width="720" height="480"><span>' + esc(a.k) + '</span>', 'thi-o-anh'); }).join('') + '</div>';
    if (c.pa) return '<div class="thi-pa-chu">' + c.pa.map(function (a) { return nut(y, vd, a.k, '<b>' + esc(a.k) + '</b>' + chuPy(a), 'thi-o-chu'); }).join('') + '</div>';
    var ds = p.anh || p.luaChon;
    return '<div class="thi-chip">' + ds.map(function (a) { return nut(y, vd, a.k, esc(a.k), 'thi-o-chip'); }).join('') + '</div>';
  }
  function deCau(p, y, vd) {
    var c = y ? y.c : vd;
    if (p.loai === 'nghe' || p.loai === 'tranh') return '';
    if (p.loai === 'doc-dien') {
      var ch = y ? (S.pha === 'xem' ? c.dap : y.chon) : c.dap, o = ch && tim(p.luaChon, ch), ps = c.han.split('（　）');
      return '<div class="thi-de"><span class="sbt-chu"><span class="sbt-py">' + esc(c.py) + '</span><span class="hanzi">' + esc(ps[0]) +
        '（<span class="thi-trong">' + (o ? esc(o.han) : '　　') + '</span>）' + esc(ps[1] || '') + '</span></span></div>';
    }
    return '<div class="thi-de">' + chuPy(c) + (c.hoi ? '<div class="thi-hoi"><b>★</b>' + chuPy(c.hoi) + '</div>' : '') + '</div>';
  }
  function loiNghe(c) {
    return c.loi.map(function (v) { return '<p>' + (v.ai ? '<b>' + esc(v.ai) + '：</b>' : '') + chuPy(v) + '</p>'; }).join('');
  }
  function theCau(p, y, vd) {
    var c = y ? y.c : vd, xem = y && S.pha === 'xem';
    var dau = y ? '<span class="thi-so">' + y.so + '</span>' : '<span class="thi-so thi-so-vd">例如</span>';
    var sao = y && !xem ? '<button type="button" class="thi-sao" data-l="sao" aria-pressed="' + y.dau + '" aria-label="Đánh dấu câu ' + y.so + '">' + (y.dau ? '★' : '☆') + '</button>' : '';
    var giai = '';
    if (xem) {
      var kq = y.chon === c.dap ? '<span class="thi-kq dung">✓ Đúng</span>' : '<span class="thi-kq sai">✗ ' + (y.chon ? 'Bạn chọn ' + esc(y.chon) : 'Chưa làm') + ' · Đáp án ' + esc(c.dap) + '</span>';
      giai = '<div class="thi-giai">' + kq + (c.loi ? '<div class="thi-loi">' + loiNghe(c) + '<button type="button" class="btn thi-loa" data-l="nghe-lai">🔊 Nghe lại</button></div>' : '') +
        (c.vi ? '<p class="thi-vi">' + esc(c.vi) + '</p>' : '') + '</div>';
    }
    return '<li class="thi-cau' + (y ? '' : ' thi-cau-vd') + (xem ? (y.chon === c.dap ? ' dung' : ' sai') : '') + '"' + (y ? ' id="thi-c' + y.so + '" data-so="' + y.so + '"' : ' data-vd="1"') + '>' +
      '<div class="thi-cau-dau">' + dau + deCau(p, y, vd) + sao + '</div>' + luaChonCau(p, y, vd) + giai + '</li>';
  }
  function veThan() {
    if (!S) return;
    var x = S.phan[S.dang], p = x.p, than = man.querySelector('.thi-than');
    var ds = '<ol class="thi-ds thi-ds-' + p.loai + '">' + (p.vd ? theCau(p, null, p.vd) : '') + x.cau.map(function (y) { return theCau(p, y); }).join('') + '</ol>';
    var chung = '';
    if (p.anh) chung = '<div class="thi-kho thi-kho-anh">' + p.anh.map(function (a) {
      return '<figure><img src="' + esc(TV.ROOT + a.src) + '" alt="' + esc(a.alt || ('Tranh ' + a.k)) + '" width="720" height="480"><figcaption>' + esc(a.k) + '</figcaption></figure>'; }).join('') + '</div>';
    else if (p.luaChon) chung = '<div class="thi-kho thi-kho-chu thi-kho-' + p.loai + '">' + p.luaChon.map(function (o) { return '<div class="thi-lc"><b>' + esc(o.k) + '</b>' + chuPy(o) + '</div>'; }).join('') + '</div>';
    var hd = laNghe(S.dang) ? p.hd.replace(/^Bấm loa nghe/, 'Nghe') : p.hd;
    than.innerHTML = '<div class="thi-phan-dau"><h2 class="hanzi">' + esc(p.zh) + '</h2><p>' + esc(hd) + '</p></div>' +
      (chung ? '<div class="thi-doi ' + (p.anh ? 'thi-doi-anh' : 'thi-doi-chu') + '">' + chung + ds + '</div>' : ds);
    than.scrollTop = 0; toSang();
  }
  function toSang() {
    if (!man || !S) return;
    man.querySelectorAll('.thi-cau.dang-nghe').forEach(function (e) { e.classList.remove('dang-nghe'); });
    var m = S.pha === 'nghe' && S.phat; if (!m || m.i !== S.dang) return;
    var e = m.vd ? man.querySelector('.thi-cau-vd') : man.querySelector('#thi-c' + m.y.so);
    if (e) { e.classList.add('dang-nghe'); cuonToi(e); }
  }
  function cuonToi(e) {
    var than = man.querySelector('.thi-than'), kho = than.querySelector('.thi-kho'), che = 0;
    if (kho && getComputedStyle(kho).position === 'sticky' && getComputedStyle(kho.parentNode).display === 'block') che = kho.offsetHeight;
    var y = e.getBoundingClientRect().top - than.getBoundingClientRect().top + than.scrollTop - che - 10;
    than.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  }

  // ---------- thẻ trả lời 答题卡 ----------
  function daLam() { return S.tat.filter(function (y) { return y.chon; }).length; }
  function veThe() {
    if (!S) return;
    var n = daLam(), xem = S.pha === 'xem';
    var h = '<div class="thi-the-dau"><b class="hanzi">答题卡</b><span class="hanzi">共计40题</span><button type="button" data-l="dong-the" class="thi-the-dong" aria-label="Đóng thẻ trả lời">✕</button></div>' +
      '<p class="thi-the-dem">' + (xem ? 'Đúng <b>' + S.tat.filter(function (y) { return y.chon === y.c.dap; }).length + '</b> / 40' : 'Đã làm <b>' + n + '</b> / 40') + '</p>' +
      '<div class="thi-thanh"><i style="width:' + (n / 40 * 100) + '%"></i></div>' +
      '<p class="thi-chu-giai">' + (xem ? '<span class="o dung"></span>Đúng <span class="o sai"></span>Sai / bỏ trống' : '<span class="o lam"></span>Đã làm <span class="o"></span>Chưa làm <span class="o dau"></span>Đánh dấu') + '</p>';
    h += S.phan.map(function (x, i) {
      var duoc = phanHien().indexOf(i) >= 0;
      return '<div class="thi-nhom"><p class="hanzi">' + BO[i < 4 ? 0 : 1].ten + ' ' + BO[i < 4 ? 0 : 1].so[i % 4] + '</p><div>' + x.cau.map(function (y) {
        var lop = xem ? (y.chon === y.c.dap ? 'dung' : 'sai') : ((y.chon ? 'lam' : '') + (y.dau ? ' dau' : ''));
        return '<button type="button" data-l="toi" data-so="' + y.so + '" class="' + lop + '"' + (duoc ? '' : ' disabled') + '>' + y.so + '</button>';
      }).join('') + '</div></div>';
    }).join('');
    if (!xem) h += '<button type="button" class="btn thi-chua" data-l="chua">Tới câu chưa làm</button>' +
      (S.pha === 'doc' ? '<button type="button" class="btn solid thi-nop" data-l="nop">提交 · Nộp bài</button>' : '<p class="thi-ghi-nop">Nút nộp bài hiện ở phần đọc.</p>');
    var the = man.querySelector('.thi-the'), cuon = the.scrollTop; the.innerHTML = h; the.scrollTop = cuon;
    veChan();
  }
  function veChan() {
    var ds = phanHien(), j = ds.indexOf(S.dang), cuoi = j === ds.length - 1;
    var phai = !cuoi ? '<button type="button" class="btn solid" data-l="sau">Phần sau ›</button>'
      : (S.pha === 'doc' ? '<button type="button" class="btn solid" data-l="nop">提交 · Nộp bài</button>' : (S.pha === 'xem' ? '<button type="button" class="btn solid" data-l="ket">Xem điểm</button>' : '<button type="button" class="btn" disabled>Phần sau ›</button>'));
    man.querySelector('.thi-chan').innerHTML = '<button type="button" class="btn" data-l="truoc"' + (j <= 0 ? ' disabled' : '') + '>‹ Phần trước</button>' +
      '<button type="button" class="btn thi-mo-the" data-l="mo-the"><span class="hanzi">答题卡</span> ' + daLam() + '/40</button>' + phai;
  }
  function sangPhan(i) { S.dang = i; veNav(); veThan(); veChan(); }

  // ---------- hộp hỏi ----------
  function hop(noi, nuts, lop) {
    var e = man.querySelector('.thi-phu'); e.hidden = false;
    e.innerHTML = '<div class="thi-hop card ' + (lop || '') + '" role="dialog" aria-modal="true">' + noi + '<div class="thi-hop-nut"></div></div>';
    var k = e.querySelector('.thi-hop-nut');
    nuts.forEach(function (n) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'btn' + (n.chinh ? ' solid' : ''); b.textContent = n.chu;
      b.onclick = function (ev) { ev.stopPropagation(); dongHop(); if (n.lam) n.lam(); }; k.appendChild(b);
    });
  }
  function dongHop() { var e = man && man.querySelector('.thi-phu'); if (e) { e.hidden = true; e.innerHTML = ''; } }

  // ---------- bấm ----------
  function bam(e) {
    var b = e.target.closest('[data-l]'); if (!b || !S || b.disabled) return;
    var l = b.dataset.l, li = b.closest('.thi-cau'), y = li && li.dataset.so ? S.tat[+li.dataset.so - 1] : null;
    if (l === 'chon' && y) {
      y.chon = b.dataset.k;
      var moi = document.createElement('ol'); moi.innerHTML = theCau(S.phan[y.i].p, y); var n = moi.firstChild;
      if (li.classList.contains('dang-nghe')) n.classList.add('dang-nghe');
      li.replaceWith(n); veThe();
    } else if (l === 'sao' && y) { y.dau = !y.dau; b.textContent = y.dau ? '★' : '☆'; b.setAttribute('aria-pressed', String(y.dau)); veThe(); }
    else if (l === 'phan') sangPhan(+b.dataset.i);
    else if (l === 'truoc' || l === 'sau') { var ds = phanHien(), j = ds.indexOf(S.dang) + (l === 'sau' ? 1 : -1); if (ds[j] != null) sangPhan(ds[j]); }
    else if (l === 'toi') toiCau(+b.dataset.so);
    else if (l === 'chua') {
      var c = S.tat.filter(function (z) { return !z.chon && phanHien().indexOf(z.i) >= 0; })[0];
      if (c) toiCau(c.so); else hop('<p>Bạn đã làm hết các câu của phần này.</p>', [{ chu: 'Đóng', chinh: true }]);
    }
    else if (l === 'mo-the') man.classList.add('hien-the');
    else if (l === 'dong-the') man.classList.remove('hien-the');
    else if (l === 'py') { var an = !anPy(); ghiLS(KHOA_PY, an ? 1 : 0); man.classList.toggle('sbt-an-py', an); b.textContent = an ? 'Hiện pinyin' : 'Ẩn pinyin'; b.setAttribute('aria-pressed', String(!an)); }
    else if (l === 'dung') tamDung();
    else if (l === 'vao-doc') vaoDoc();
    else if (l === 'nop') {
      var conLai = 40 - daLam();
      hop('<h3>Nộp bài?</h3><p>' + (conLai ? 'Bạn còn <b>' + conLai + '</b> câu chưa làm.' : 'Bạn đã làm đủ 40 câu.') + ' Nộp rồi thì không sửa được nữa.</p>',
        [{ chu: 'Làm tiếp' }, { chu: 'Nộp bài', chinh: true, lam: function () { nopBai(false); } }]);
    } else if (l === 'thoat') {
      if (S.pha === 'xem') { dongMan(); veCho(); }
      else hop('<h3>Thoát khỏi bài thi?</h3><p>Bài đang làm sẽ bị bỏ và không được gửi cho cô.</p>', [{ chu: 'Làm tiếp', chinh: true }, { chu: 'Thoát', lam: function () { dongMan(); veCho(); } }]);
    } else if (l === 'nghe-lai' && y) { moAm(); phatCau(y.c, ++luot, function () {}); }
    else if (l === 'ket') veKetQua();
  }
  function toiCau(so) {
    var y = S.tat[so - 1]; man.classList.remove('hien-the');
    if (S.dang !== y.i) sangPhan(y.i);
    var e = man.querySelector('#thi-c' + so);
    if (e) { cuonToi(e); e.classList.add('nhay'); setTimeout(function () { e.classList.remove('nhay'); }, 1400); }
  }

  // ---------- nộp bài ----------
  function nopBai(hetGio) {
    if (!S || S.pha === 'xem') return;
    dungAm(); clearInterval(S.dongHo); dongHop(); man.classList.remove('hien-the');
    S.pha = 'xem'; S.hetGio = hetGio; S.giay = Math.round((Date.now() - S.luc) / 1000); S.dang = 0;
    window.removeEventListener('beforeunload', canThoat);
    veMan(); veKetQua();
    if (G) G.gui({ maLuot: S.ma, phan: 'thi-sbt-bai' + D.bai, hoTen: S.hoTen, lop: S.lop, batDau: S.batDau, giay: S.giay, soCau: 40,
      soDung: S.tat.filter(function (y) { return y.chon === y.c.dap; }).length,
      cau: S.tat.map(function (y) {
        var c = y.c, x = S.phan[y.i];
        return { stt: y.so, maCau: 'thi-' + x.p.loai + '/' + c.ma, dang: x.p.loai, nhom: BO[y.i < 4 ? 0 : 1].tv + ' · ' + x.p.ten,
          deBai: c.loi ? c.loi.map(function (v) { return (v.ai ? v.ai + '：' : '') + v.han; }).join(' ') : c.han + (c.hoi ? ' ★' + c.hoi.han : ''),
          dapAn: c.dap, chon: y.chon || '', dung: y.chon === c.dap ? 1 : 0, thuTu: '' };
      }) }, S.khuGui, 'Thi thử trên máy · Bài ' + D.bai);
  }
  function veKetQua() {
    var dung = function (ds) { return ds.filter(function (y) { return y.chon === y.c.dap; }).length; };
    var n = dung(S.tat), nghe = dung(S.tat.slice(0, 20)), docD = dung(S.tat.slice(20));
    if (!S.khuGui) { S.khuGui = document.createElement('div'); S.khuGui.className = 'sbt-luu'; }
    hop((S.hetGio ? '<p class="thi-het-gio">⏰ Hết giờ, máy đã tự nộp bài.</p>' : '') + '<h3>Kết quả thi thử · Bài ' + D.bai + '</h3>' +
      '<div class="thi-diem"><b>' + n + '</b><span>/ 40 câu đúng</span></div>' +
      '<p class="thi-diem-phu">听力 Nghe: <b>' + nghe + ' / 20</b> &nbsp;·&nbsp; 阅读 Đọc: <b>' + docD + ' / 20</b><br>⏱ ' + Math.floor(S.giay / 60) + ' phút ' + (S.giay % 60) + ' giây</p>' +
      '<ul class="ot-theo-phan">' + S.phan.map(function (x) {
        var d = dung(x.cau); return '<li class="' + (d === 5 ? 'dung' : '') + '"><span>' + BO[x.i < 4 ? 0 : 1].tv + ' ' + (x.i % 4 + 1) + ' · ' + esc(x.p.ten) + '</span><b>' + d + ' / 5</b></li>'; }).join('') + '</ul>' +
      '<div class="thi-cho-gui"></div>',
      [{ chu: 'Xem lại bài làm', chinh: true }, { chu: 'Làm lại', lam: function () { dongMan(); veCho(); window.scrollTo(0, 0); } }, { chu: 'Thoát', lam: function () { dongMan(); veCho(); } }], 'thi-hop-kq');
    man.querySelector('.thi-cho-gui').appendChild(S.khuGui);
  }

  // ---------- nạp đề ----------
  fetch(window.QM_THI_TEP).then(function (r) { if (!r.ok) throw r; return r.json(); }).then(function (d) { D = d; if (!khu.hidden) veCho(); })
    .catch(function () { khu.innerHTML = '<div class="tv-trong">Chưa tải được đề thi thử, bạn kiểm tra mạng rồi tải lại trang nhé.</div>'; });
  if (location.hash === '#thi-thu') chonTab('thi');
})();
