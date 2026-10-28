/* =========================================================
   LUYỆN NGỮ PHÁP — khối 🎯 cuối trang Ngữ pháp của bài (quy chuẩn 05, bổ sung 29/10/2026)
   Đặt <div id="luyen-ngu-phap" data-bai="4"></div> SAU <div id="ngu-phap">; nạp sau tu-vung-chung.js.
   Dữ liệu: "nguPhapLuyen" trong bai-N.json = { dacDiem:[{ma,np,ten,nguon}], cau:[{ma,dang,dd,…}] }
     dang: chon (kieu 'py' = chọn phiên âm) · dungSai · hoi (chọn câu hỏi hợp câu trả lời) · xep (xếp câu theo nghĩa)
   Một lượt: mỗi đặc điểm (ý + lưu ý của thẻ) của bài đúng 1 câu bốc ngẫu nhiên + 3 câu "↺ Ôn ngữ pháp bài trước".
   Kết quả từng câu gửi về máy chủ điểm (QM_API, action 'npLuot') để giáo viên phân tích; không lên Bảng xếp hạng.
   Gửi không được thì giữ hàng đợi trên máy (khoá qmhy:npHang) và tự gửi lại lần sau. Máy chủ bỏ qua lượt trùng mã.
   ========================================================= */
(function () {
  var el = document.getElementById('luyen-ngu-phap'), TV = window.QM_TV; if (!el || !TV) return;
  var PHIEN_BAN = '2026-10-29a', SO_ON = 3, KHOA_HANG = 'qmhy:npHang', KHOA_HS = 'qmhy:hoSo', KHOA_MAY = 'qmhy:maMay';
  var BAI = +el.dataset.bai || 0, MA_BAI = 'bai' + BAI;
  var esc = TV.esc, KHO = null, DD = {}, TEN_NP = {}, CHI_SO_NP = {}, SO_NP = 0, KHO_ON = [], L = null;
  var TEN_DANG = { chon: '🎯 Chọn đúng', py: '🔤 Chọn phiên âm đúng', dungSai: '✅ Đúng hay sai', hoi: '💬 Hỏi gì để có câu trả lời này?', xep: '🧭 Xếp câu, thêm dấu câu' };

  // ---------- âm thanh: hiệu ứng tự tạo (Web Audio, như trang Bài tập) + tự đọc câu đúng sau khi trả lời ----------
  var AM = { bat: true, ctx: null }, DAU_CAU = ['，', '。', '？', '！'];
  try { AM.bat = localStorage.getItem('qm-am-hieu-ung') !== '0'; } catch (e) {}
  var NOT = { dung: [[880, .09], [1318.5, .16]], sai: [[233, .12], [196, .2]], cham: [[660, .045]], dau: [[990, .04]],
    batDau: [[523.3, .07], [784, .12]], xong: [[523.3, .1], [659.3, .1], [784, .1], [1046.5, .28]], xongVua: [[523.3, .12], [659.3, .22]] };
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
  function nutAm() { return '<button type="button" class="lt-am lnp-am' + (AM.bat ? ' on' : '') + '" aria-pressed="' + AM.bat + '" title="' + (AM.bat ? 'Tắt' : 'Bật') + ' âm thanh">' + (AM.bat ? '🔊' : '🔇') + '</button>'; }
  function docSau(txt) {                                      // trả lời xong: đọc câu đúng (sau tiếng đúng / sai)
    if (!AM.bat || !txt) return;
    setTimeout(function () { if (L && el.querySelector('.lnp-giai-o')) TV.doc(txt, el.querySelector('.lnp-cau-dung .tv-loa')); }, 650);
  }

  // ---------- tiện ích ----------
  function tron(t) { return esc(t).replace(/[㐀-鿿〇，。？！：、]+/g, function (m) { return '<span class="hanzi">' + m + '</span>'; }); }
  function dam(t) { return tron(t).replace(/\*\*(.+?)\*\*/g, '<strong class="np-nb">$1</strong>'); }
  function tron1(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function boc(a) { return a[Math.floor(Math.random() * a.length)]; }
  function docLS(k, md) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : md; } catch (e) { return md; } }
  function ghiLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function gon(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function maNgauNhien() { return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8); }
  function maMay() { var m = docLS(KHOA_MAY, ''); if (!m) { m = 'm-' + maNgauNhien(); ghiLS(KHOA_MAY, m); } return m; }
  // Giữ trong màn hình: header chung ở trên (.sh-header, tự thu gọn khi cuộn), thanh cố định ở dưới (.sf)
  function tren() { var h = document.querySelector('.sh-header'); return h ? Math.max(0, h.getBoundingClientRect().bottom) : 0; }
  function duoi() { var sf = document.querySelector('.sf'); return sf ? sf.getBoundingClientRect().top : innerHeight; }
  function veDau() { function d() { var r = el.getBoundingClientRect(); if (Math.abs(r.top - tren() - 8) > 12) window.scrollTo(0, Math.max(0, r.top + scrollY - tren() - 8)); } d(); setTimeout(d, 380); }
  function giuNut() {                                         // sau khi trả lời: nút Câu tiếp phải nằm trên thanh cuối trang
    function d() { var b = el.querySelector('.lnp-tiep'); if (!b) return; var r = b.getBoundingClientRect(), du = r.bottom - (duoi() - 10); if (du > 0) window.scrollBy(0, du); }
    d(); setTimeout(d, 380);
  }

  // ---------- dựng lượt ----------
  function dungLuot() {
    var dsDD = KHO.dacDiem, theoDD = {}, dem = { chon: 0, dungSai: 0, hoi: 0, xep: 0 }, ds = [];
    KHO.cau.forEach(function (c) { (theoDD[c.dd] || (theoDD[c.dd] = [])).push(c); });
    tron1(dsDD).forEach(function (d) {                       // mỗi đặc điểm 1 câu; ưu tiên dạng đang ít để lượt đủ 4 dạng
      var ung = theoDD[d.ma] || []; if (!ung.length) return;
      var it = Math.min.apply(null, ung.map(function (c) { return dem[c.dang]; }));
      var c = boc(ung.filter(function (x) { return dem[x.dang] === it; }));
      dem[c.dang]++; ds.push({ c: c, nguon: 'bai', bai: BAI });
    });
    var on = tron1(KHO_ON), daDD = {};
    on.forEach(function (x) { if (ds.filter(function (y) { return y.nguon === 'on'; }).length < SO_ON && !daDD[x.c.dd]) { daDD[x.c.dd] = 1; ds.push(x); } });
    ds = tron1(ds);
    for (var k = 2; k < ds.length; k++) {                    // tránh 3 câu liền cùng một điểm ngữ pháp
      if (ds[k].c.np === ds[k - 1].c.np && ds[k].c.np === ds[k - 2].c.np) { var j = (k + 3) % ds.length, t = ds[k]; ds[k] = ds[j]; ds[j] = t; }
    }
    var hs = docLS(KHOA_HS, {});
    L = { ds: ds, i: 0, kq: [], ma: maNgauNhien(), luc: Date.now(), batDau: new Date().toISOString(), hoTen: gon(hs.hoTen), lop: gon(hs.lop) };
  }

  // ---------- vẽ ----------
  function veBatDau(thongBao) {
    var hs = docLS(KHOA_HS, {}), soDD = KHO.dacDiem.length, soNP = SO_NP, coOn = KHO_ON.length ? Math.min(SO_ON, KHO_ON.length) : 0;
    el.innerHTML = '<div class="lnp-dau card">' +
      '<div class="sec-kicker">语法练习</div><h2 class="lnp-tieu-de">🎯 Luyện ngữ pháp Bài ' + BAI + '</h2>' +
      '<p class="lnp-mo-ta">Mỗi lượt <b>' + (soDD + coOn) + ' câu</b>: đủ <b>' + soDD + ' ý và lưu ý</b> của ' + soNP + ' điểm ngữ pháp' + (coOn ? ', thêm ' + coOn + ' câu ôn ngữ pháp bài trước' : '') + '. Lượt sau đổi câu.</p>' +
      '<p class="lnp-dang">' + ['chon', 'dungSai', 'hoi', 'xep'].map(function (d) { return '<span>' + TEN_DANG[d] + '</span>'; }).join('') + '</p>' +
      '<div class="lt-hs lnp-hs"><label>Họ tên đầy đủ<input type="text" class="lnp-ten" autocomplete="name" placeholder="VD: Nguyễn Văn An" value="' + esc(hs.hoTen || '') + '"></label>' +
        '<label>Lớp<input type="text" class="lnp-lop" placeholder="VD: HSK1-K3" value="' + esc(hs.lop || '') + '"></label>' +
        '<p class="lt-hs-ghi">Kết quả từng câu được gửi về cho cô giáo để theo dõi và cải tiến bài học. Phần này không xếp hạng.</p></div>' +
      (thongBao ? '<p class="lnp-ghi lnp-loi">' + thongBao + '</p>' : '') +
      '<div class="lt-nut-kq"><button type="button" class="btn solid lnp-bat-dau">Bắt đầu luyện ›</button></div></div>';
  }
  function veVach() { return '<div class="lt-vach lt-vach-bai"><i class="thuoc" style="width:' + (L.i / L.ds.length * 100) + '%"></i></div>'; }
  function veCau() {
    var x = L.ds[L.i], c = x.c, kieu = c.kieu === 'py' ? 'py' : c.dang, de = '', dap = '', pa;
    x.t0 = Date.now();
    var dau = '<div class="lnp-hang"><span class="lnp-ten-dang">' + TEN_DANG[kieu] + '</span><span class="lnp-phai"><span class="lt-dem">' + (L.i + 1) + ' / ' + L.ds.length + '</span>' + nutAm() + '</span></div>' +
      '<div class="lnp-nhan">📐 ' + tron(TEN_NP[c.np] || c.np) + (x.nguon === 'on' ? ' · <b>↺ Ôn Bài ' + x.bai + '</b>' : '') + '</div>';
    if (c.dang === 'chon' && c.kieu === 'py') {
      de = '<p class="lnp-hoi">Chọn phiên âm đúng của <span class="hanzi lnp-tu">' + esc(c.tu) + '</span> trong câu:</p>' +
        '<div class="lt-de-cau hanzi">' + esc(c.cau).replace(esc(c.tu), '<span class="lnp-tu">' + esc(c.tu) + '</span>') + '</div>';
      pa = tron1([c.dap].concat(c.nhieu)); x.pa = pa;
      dap = '<div class="lt-dap py lnp-dap">' + pa.map(function (p, k) { return '<button type="button" class="lt-dap-o" data-k="' + k + '"><span class="lt-so">' + (k + 1) + '</span>' + esc(p) + '</button>'; }).join('') + '</div>';
    } else if (c.dang === 'chon') {
      var o = '<span class="hanzi">' + esc(c.cau).replace('＿', '<span class="lnp-trong">　　</span>') + '</span>';   // đề không có nghĩa: ngữ cảnh (câu B, con số) dẫn tới đáp án
      de = '<p class="lnp-hoi">Chọn từ đúng điền vào chỗ trống:</p>' +
        (c.sau ? '<div class="lt-de-cau lnp-hthoai"><div><b>A：</b>' + o + '</div><div><b>B：</b><span class="hanzi">' + esc(c.sau) + '</span></div></div>' : '<div class="lt-de-cau">' + o + '</div>') +
        (c.goiY ? '<p class="lnp-goi-y">Số: <b>' + esc(c.goiY) + '</b></p>' : '');
      pa = tron1([c.dap].concat(c.nhieu)); x.pa = pa;
      dap = '<div class="lt-dap chu lnp-dap lnp-3">' + pa.map(function (p, k) { return '<button type="button" class="lt-dap-o" data-k="' + k + '"><span class="lt-so">' + (k + 1) + '</span><span class="lt-dap-chu hanzi' + (p.length > 3 ? ' lnp-dai' : '') + '">' + esc(p) + '</span></button>'; }).join('') + '</div>';
    } else if (c.dang === 'dungSai') {
      de = '<p class="lnp-hoi">Câu này đúng hay sai?</p><div class="lt-de-cau hanzi">' + esc(c.cau) + '</div>';
      pa = ['Đúng', 'Sai']; x.pa = pa;
      dap = '<div class="lt-dap lnp-dap lnp-ds">' + pa.map(function (p, k) { return '<button type="button" class="lt-dap-o" data-k="' + k + '"><span class="lt-so">' + (k + 1) + '</span>' + (k ? '❌ Sai' : '✅ Đúng') + '</button>'; }).join('') + '</div>';
    } else if (c.dang === 'hoi') {
      de = '<p class="lnp-hoi">Câu trả lời:</p><div class="lt-de-cau lnp-de-loa">' + TV.nutLoa(c.dap) + '<span class="hanzi">' + esc(c.dap) + '</span></div><p class="lnp-hoi">Câu hỏi nào hợp với câu trả lời này?</p>';
      pa = tron1([c.hoi].concat(c.nhieu)); x.pa = pa;
      dap = '<div class="lt-dap cau lnp-dap">' + pa.map(function (p, k) { return '<button type="button" class="lt-dap-o" data-k="' + k + '"><span class="lt-so">' + (k + 1) + '</span><span class="lt-dap-cau hanzi">' + esc(p) + '</span></button>'; }).join('') + '</div>';
    } else {                                                  // xep
      var kh = c.khoi.map(function (t, k) { return { t: t, k: k }; }), tt;
      do { tt = tron1(kh); } while (kh.length > 1 && tt.map(function (o) { return o.t; }).join('') === c.khoi.join(''));
      x.kh = tt; x.dat = [];
      de = '<p class="lnp-hoi">Xếp các khối thành câu đúng, rồi <b>thêm dấu câu</b> vào đúng chỗ.</p>';
      dap = '<div class="lt-xep-dong lnp-xep-dong"><span class="lt-xep-cho">Bấm các khối bên dưới theo thứ tự</span></div>' +
        '<div class="lt-xep-kho">' + tt.map(function (o, k) { return '<button type="button" class="lt-khoi lnp-khoi" data-k="' + k + '"><span class="hanzi">' + esc(o.t) + '</span></button>'; }).join('') + '</div>' +
        '<div class="lnp-dau-hang"><span>Dấu câu:</span>' + DAU_CAU.map(function (d) { return '<button type="button" class="lnp-dau-nut" data-d="' + d + '" aria-label="Thêm dấu ' + d + '">' + d + '</button>'; }).join('') + '</div>' +
        '<div class="lt-nut-kq"><button type="button" class="btn lnp-xep-xoa">Xếp lại</button><button type="button" class="btn solid lnp-xep-kt" disabled>Kiểm tra</button></div>';
    }
    el.innerHTML = '<div class="lnp-khung">' + veVach() + '<div class="lt-de lnp-de">' + dau + de + '</div>' + dap + '<div class="lnp-giai" aria-live="polite"></div></div>';
  }
  function veDongXep() {
    var x = L.ds[L.i], dong = el.querySelector('.lnp-xep-dong');
    dong.innerHTML = x.dat.length ? x.dat.map(function (k, j) {
      return typeof k === 'string' ? '<button type="button" class="lnp-tren lnp-dau-tren" data-j="' + j + '" aria-label="Bỏ dấu ' + k + '">' + k + '</button>'
        : '<button type="button" class="lt-khoi tren lnp-tren" data-j="' + j + '"><span class="hanzi">' + esc(x.kh[k].t) + '</span></button>'; }).join('') : '<span class="lt-xep-cho">Bấm các khối bên dưới theo thứ tự</span>';
    el.querySelectorAll('.lnp-khoi').forEach(function (b) { b.classList.toggle('da-dat', x.dat.indexOf(+b.dataset.k) >= 0); });
    var soKhoi = x.dat.filter(function (k) { return typeof k === 'number'; }).length;
    el.querySelector('.lnp-xep-kt').disabled = soKhoi !== x.kh.length;
    el.querySelectorAll('.lnp-dau-nut').forEach(function (b) { b.classList.toggle('nhac', soKhoi === x.kh.length && !x.dat.some(function (k) { return typeof k === 'string'; })); });
  }

  // ---------- chấm ----------
  function cauDung(c) {                                       // câu đúng đầy đủ + pinyin, hiện sau khi trả lời
    if (c.dang === 'chon' && c.kieu !== 'py') return [c.cau.replace('＿', c.dap) + (c.sau ? ' — ' + c.sau : ''), c.py];
    if (c.dang === 'dungSai') return c.dung ? [c.cau, c.py] : [c.sua, c.pySua];
    if (c.dang === 'hoi') return [c.hoi + ' — ' + c.dap, c.pyHoi + ' — ' + c.pyDap];
    return [c.cau, c.py];
  }
  function ghiKetQua(x, chon, dung) {
    var c = x.c, deBai = c.dang === 'chon' ? (c.kieu === 'py' ? c.cau + ' [' + c.tu + ']' : c.cau) : c.dang === 'hoi' ? c.dap : c.dang === 'xep' ? c.khoi.join(' / ') : c.cau;
    var dapAn = c.dang === 'dungSai' ? (c.dung ? 'Đúng' : 'Sai') : c.dang === 'hoi' ? c.hoi : c.dang === 'xep' ? c.cau : c.dap;
    L.kq.push({ stt: L.i + 1, maCau: c.ma, dang: c.dang, kieu: c.kieu || '', np: c.np, dd: c.dd, nguon: x.nguon, baiCau: x.bai,
      deBai: deBai, dapAn: dapAn, chon: chon, dung: dung ? 1 : 0, giay: Math.round((Date.now() - x.t0) / 100) / 10,
      thuTu: (x.pa || (x.kh || []).map(function (o) { return o.t; })).join(' | ') });
  }
  function hienGiai(dung) {
    var x = L.ds[L.i], c = x.c, cd = cauDung(c), dd = DD[c.dd];
    el.querySelector('.lt-de').classList.add('xong');
    el.querySelector('.lnp-giai').innerHTML = '<div class="lnp-giai-o ' + (dung ? 'dung' : 'sai') + '">' +
      '<div class="lt-ket ' + (dung ? 'dung' : 'sai') + '">' + (dung ? '✓ Đúng rồi!' : x.chiSaiDau ? '✗ Thứ tự đúng rồi, nhưng dấu câu chưa đúng' : '✗ Chưa đúng') + '</div>' +
      (c.dang === 'dungSai' && !c.dung ? '<div class="lnp-nhan-nho">Câu đúng:</div>' : '') +
      '<div class="lnp-cau-dung">' + TV.nutLoa(c.dang === 'hoi' ? c.hoi + c.dap : cd[0]) + '<div><div class="hanzi">' + esc(cd[0]) + '</div><div class="lnp-py">' + esc(cd[1]) + '</div></div></div>' +
      (c.gt ? '<p class="lnp-gt">' + dam(c.gt) + '</p>' : dd ? '<p class="lnp-dd">Ghi nhớ: ' + dam(dd.ten) + '</p>' : '') +
      '</div><div class="lt-nut-kq"><button type="button" class="btn solid lnp-tiep">' + (L.i < L.ds.length - 1 ? 'Câu tiếp ›' : 'Xem kết quả') + '</button></div>';
    var t = el.querySelector('.lnp-tiep'); if (t) t.focus({ preventScroll: true });
    amThanh(dung ? 'dung' : 'sai'); docSau(c.dang === 'hoi' ? c.hoi + c.dap : cd[0]);
    giuNut();
  }
  function traLoi(o) {
    var x = L.ds[L.i], c = x.c, wrap = o.parentNode; if (wrap.classList.contains('xong')) return;
    var chon = x.pa[+o.dataset.k], dung;
    if (c.dang === 'dungSai') dung = (chon === 'Đúng') === !!c.dung;
    else dung = chon === (c.dang === 'hoi' ? c.hoi : c.dap);
    wrap.classList.add('xong');
    wrap.querySelectorAll('.lt-dap-o').forEach(function (b) {
      var p = x.pa[+b.dataset.k], laDung = c.dang === 'dungSai' ? (p === 'Đúng') === !!c.dung : p === (c.dang === 'hoi' ? c.hoi : c.dap);
      b.disabled = true; if (laDung) b.classList.add('dung'); else if (b === o) b.classList.add('sai');
    });
    ghiKetQua(x, chon, dung); hienGiai(dung);
  }
  function chuanCau(s) { return String(s).replace(/！$/, '。'); }      // cuối câu kể: 。 hay ！ đều được
  function boDau(s) { return String(s).replace(/[，。？！]/g, ''); }
  function kiemTraXep() {
    var x = L.ds[L.i], c = x.c, cua = x.dat.map(function (k) { return typeof k === 'string' ? k : x.kh[k].t; }).join('');
    var dungCau = [c.cau].concat(c.khac || []);
    var dung = dungCau.some(function (t) { return chuanCau(cua) === chuanCau(t); });
    x.chiSaiDau = !dung && dungCau.some(function (t) { return boDau(cua) === boDau(t); });
    el.querySelectorAll('.lnp-khoi, .lnp-tren, .lnp-xep-xoa, .lnp-xep-kt, .lnp-dau-nut').forEach(function (b) { b.disabled = true; });
    el.querySelector('.lnp-xep-dong').classList.add(dung ? 'dung' : 'sai');
    ghiKetQua(x, cua, dung); hienGiai(dung);
  }

  // ---------- kết quả ----------
  function veKetQua() {
    var tong = L.kq.length, dung = L.kq.filter(function (k) { return k.dung; }).length, tl = tong ? Math.round(dung / tong * 100) : 0;
    L.giay = Math.round((Date.now() - L.luc) / 1000);
    var sai = {}, thuTu = [];
    L.kq.forEach(function (k) { if (k.dung) return; if (!sai[k.np]) { sai[k.np] = { ds: [], bai: k.baiCau }; thuTu.push(k.np); } if (DD[k.dd] && sai[k.np].ds.indexOf(DD[k.dd].ten) < 0) sai[k.np].ds.push(DD[k.dd].ten); });
    var loi = tl === 100 ? 'Xuất sắc! Nắm chắc mọi điểm ngữ pháp 🎉' : tl >= 80 ? 'Rất tốt! Xem lại vài ý còn sai là chắc 💪' : tl >= 50 ? 'Khá rồi, xem lại thẻ rồi luyện thêm một lượt nhé 🌱' : 'Xem lại các thẻ ngữ pháp bên trên rồi làm lượt nữa nhé 🌱';
    el.innerHTML = '<div class="lt-ket-qua card lnp-kq"><div class="lt-diem">' + tl + '%</div><p class="lt-loi">' + loi + '</p>' +
      '<p class="lt-goi-y">Đúng ' + dung + ' / ' + tong + ' câu · ⏱ ' + (L.giay >= 60 ? Math.floor(L.giay / 60) + ' phút ' : '') + (L.giay % 60) + ' giây</p>' +
      '<div class="lnp-luu" aria-live="polite"></div>' +
      (thuTu.length ? '<div class="lt-nhan">Ý ngữ pháp cần xem lại</div><ul class="lnp-ds-sai">' + thuTu.map(function (np) {
        var s = sai[np], laBaiNay = s.bai === BAI;
        return '<li><div class="lnp-ds-ten">📐 ' + tron(TEN_NP[np] || np) + (laBaiNay ? '' : ' <small>(Bài ' + s.bai + ')</small>') + '</div><ul>' + s.ds.map(function (t) { return '<li>' + dam(t) + '</li>'; }).join('') + '</ul>' +
          (laBaiNay && CHI_SO_NP[np] != null ? '<button type="button" class="btn lnp-xem-the" data-np="' + esc(np) + '">Xem lại thẻ ›</button>' : '<a class="btn" href="../bai-' + s.bai + '/ngu-phap.html">Xem thẻ Bài ' + s.bai + ' ›</a>') + '</li>';
      }).join('') + '</ul>' : '') +
      '<div class="lt-nut-kq"><button type="button" class="btn lnp-xem-lai">📋 Xem lại bài</button><button type="button" class="btn solid lnp-luot-moi">Làm lượt mới</button></div>' +
      '<div class="lt-xem-ct lnp-xem-ct" hidden>' + L.kq.map(function (k) {
        return '<div class="lt-ct ' + (k.dung ? 'dung' : 'sai') + '"><b>' + k.stt + '. ' + esc(TEN_DANG[k.kieu === 'py' ? 'py' : k.dang]) + '</b> · ' + tron(k.deBai) + '<br>Đáp án: ' + tron(k.dapAn) + (k.dung ? ' ✓' : ' · Bạn chọn: ' + tron(k.chon || '—')) + '</div>';
      }).join('') + '</div></div>';
    amThanh(tl >= 80 ? 'xong' : 'xongVua'); guiLuot(); veDau();
  }

  // ---------- gửi kết quả cho nghiên cứu ----------
  function goi() {
    var tong = L.kq.length, dung = L.kq.filter(function (k) { return k.dung; }).length;
    return { action: 'npLuot', phienBan: PHIEN_BAN, maLuot: L.ma, chuongTrinh: 'hsk3', bai: MA_BAI, hoTen: L.hoTen, lop: L.lop,
      hoSoId: window.QM_TK && QM_TK.hoSoId ? QM_TK.hoSoId() : '', maMay: maMay(), batDau: L.batDau, giay: L.giay,
      soCau: tong, soDung: dung, thietBi: (window.matchMedia && matchMedia('(pointer:coarse)').matches ? 'cam-ung' : 'chuot') + ' ' + window.innerWidth + 'x' + window.innerHeight,
      cau: L.kq };
  }
  function guiMot(p) {
    return fetch(window.QM_API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(p) })
      .then(function (r) { return r.json(); }).then(function (d) { if (!d || !d.ok) throw new Error((d && d.loi) || 'Máy chủ không nhận'); return d; });
  }
  function boKhoiHang(ma) { ghiLS(KHOA_HANG, docLS(KHOA_HANG, []).filter(function (p) { return p.maLuot !== ma; })); }
  function guiHang() {                                        // gửi lại các lượt còn kẹt trên máy (mỗi lần mở trang)
    if (!window.QM_API) return Promise.resolve();
    var hang = docLS(KHOA_HANG, []);
    return hang.reduce(function (pr, p) { return pr.then(function () { return guiMot(p).then(function () { boKhoiHang(p.maLuot); }).catch(function () {}); }); }, Promise.resolve());
  }
  function guiLuot() {
    var khu = el.querySelector('.lnp-luu'), p = goi(), hang = docLS(KHOA_HANG, []);
    hang.push(p); ghiLS(KHOA_HANG, hang.slice(-30));         // giữ tối đa 30 lượt chờ gửi
    if (!window.QM_API) { khu.innerHTML = '<p class="lt-luu-ghi">Kết quả đã lưu trên máy này.</p>'; return; }
    khu.innerHTML = '<p class="lt-luu-ghi">⏳ Đang gửi kết quả…</p>';
    guiMot(p).then(function (d) {
      boKhoiHang(p.maLuot);
      khu.innerHTML = '<p class="lt-luu-ok">✅ Đã gửi kết quả cho cô' + (d.lanLam ? ' (lượt luyện thứ ' + d.lanLam + ' của Bài ' + BAI + ')' : '') + '.</p>';
    }).catch(function (e) {
      khu.innerHTML = '<p class="lt-luu-ghi">💾 Kết quả đã lưu tạm trên máy, web sẽ tự gửi cho cô vào lần mở trang sau.<br><small class="lnp-ly-do">Lý do: ' + esc(e.message || 'lỗi mạng') + '</small></p>';
      fetch(window.QM_API).then(function (r) { return r.json(); }).then(function (d) {   // cho giáo viên biết máy chủ đang chạy bản nào
        var lyDo = khu.querySelector('.lnp-ly-do'); if (lyDo && d && d.phienBan && d.phienBan < PHIEN_BAN) lyDo.textContent += ' · Máy chủ điểm đang chạy bản ' + d.phienBan + ', cần bản ' + PHIEN_BAN + ' trở lên.';
      }).catch(function () {});
    });
  }

  // ---------- sự kiện ----------
  el.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('.tv-loa')) return;
    if (t.closest('.lnp-am')) { AM.bat = !AM.bat; try { localStorage.setItem('qm-am-hieu-ung', AM.bat ? '1' : '0'); } catch (e) {} if (!AM.bat) TV.dungDoc();
      el.querySelectorAll('.lnp-am').forEach(function (b) { b.outerHTML = nutAm(); }); amThanh('cham'); return; }
    var dn = t.closest('.lnp-dau-nut'); if (dn && !dn.disabled) { L.ds[L.i].dat.push(dn.dataset.d); amThanh('dau'); return veDongXep(); }
    if (t.closest('.lnp-bat-dau')) {
      var ten = gon(el.querySelector('.lnp-ten').value), lop = gon(el.querySelector('.lnp-lop').value), cu = docLS(KHOA_HS, {});
      ghiLS(KHOA_HS, Object.assign({}, cu, { hoTen: ten, lop: lop }));
      dungLuot(); amThanh('batDau'); veCau(); veDau(); return;
    }
    var o = t.closest('.lt-dap-o'); if (o) return traLoi(o);
    var k = t.closest('.lnp-khoi'); if (k && !k.disabled) { var x = L.ds[L.i]; if (x.dat.indexOf(+k.dataset.k) < 0) { x.dat.push(+k.dataset.k); amThanh('cham'); veDongXep(); } return; }
    var tr = t.closest('.lnp-tren'); if (tr && !tr.disabled) { L.ds[L.i].dat.splice(+tr.dataset.j, 1); amThanh('cham'); return veDongXep(); }
    if (t.closest('.lnp-xep-xoa')) { L.ds[L.i].dat = []; return veDongXep(); }
    if (t.closest('.lnp-xep-kt')) return kiemTraXep();
    if (t.closest('.lnp-tiep')) { TV.dungDoc(); amThanh('cham'); if (L.i < L.ds.length - 1) { L.i++; veCau(); veDau(); } else veKetQua(); return; }
    if (t.closest('.lnp-xem-lai')) { var xc = el.querySelector('.lnp-xem-ct'); xc.hidden = !xc.hidden; return; }
    if (t.closest('.lnp-luot-moi')) { dungLuot(); veCau(); veDau(); return; }
    var xt = t.closest('.lnp-xem-the'); if (xt && window.QM_NP) { QM_NP.den(CHI_SO_NP[xt.dataset.np]); return; }
  });
  document.addEventListener('keydown', function (e) {
    if (!L || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || !el.querySelector('.lnp-khung')) return;
    if (e.key === 'Enter') { var tp = el.querySelector('.lnp-tiep'), kt = el.querySelector('.lnp-xep-kt:not(:disabled)'); if (tp) { e.preventDefault(); tp.click(); } else if (kt) { e.preventDefault(); kiemTraXep(); } return; }
    var os = el.querySelectorAll('.lnp-dap:not(.xong) .lt-dap-o'), n = +e.key;
    if (n >= 1 && n <= os.length) { e.preventDefault(); traLoi(os[n - 1]); }
  });

  // ---------- nạp dữ liệu ----------
  el.innerHTML = '<div class="tv-trong">Đang tải bài luyện…</div>';
  TV.taiCap(TV.CAP[0]).then(function () {
    var dl = (TV.DL || {})[TV.CAP[0]] || {};
    KHO = dl.nguPhapLuyen;
    if (!KHO || !(KHO.cau || []).length) { el.innerHTML = ''; return; }
    (dl.nguPhap || []).forEach(function (g, k) { TEN_NP[g.id] = g.ten; CHI_SO_NP[g.id] = k; }); SO_NP = (dl.nguPhap || []).length;
    KHO.dacDiem.forEach(function (d) { DD[d.ma] = d; });
    var tep = (window.QM_TEP || {})[TV.CAP[0]] || '', truoc = [];
    for (var b = 2; b < BAI; b++) truoc.push(b);
    return Promise.all(truoc.map(function (b) {
      return fetch(tep.replace(/bai-\d+\.json/, 'bai-' + b + '.json')).then(function (r) { if (!r.ok) throw r; return r.json(); })
        .then(function (d) {
          (d.nguPhap || []).forEach(function (g) { if (!TEN_NP[g.id]) TEN_NP[g.id] = g.ten; });
          ((d.nguPhapLuyen || {}).dacDiem || []).forEach(function (x) { if (!DD[x.ma]) DD[x.ma] = x; });
          ((d.nguPhapLuyen || {}).cau || []).forEach(function (c) { KHO_ON.push({ c: c, nguon: 'on', bai: b }); });
        }).catch(function () {});
    })).then(function () {
      Object.keys(TEN_NP).forEach(function (k) { if (CHI_SO_NP[k] == null) delete CHI_SO_NP[k]; });
      veBatDau(); setTimeout(guiHang, 4000);   // đợi header.js nạp xong cau-hinh.js (QM_API)
    });
  }).catch(function () { el.innerHTML = '<div class="tv-trong">Chưa tải được bài luyện, bạn kiểm tra mạng rồi thử lại nhé.</div>'; });
})();
