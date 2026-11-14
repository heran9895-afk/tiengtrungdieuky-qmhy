/* PHÒNG LỚP — phía giáo viên (trang Bài tập: luyen-tap.js). Chỉ hiện với tài khoản giáo viên.
   Cô mở phòng → học sinh quét mã, thấy đúng câu hỏi đang chiếu → cô gọi tên 1 bạn → bạn đó chọn đáp án trên máy mình.
   Đúng: hiện luôn đáp án + lời giải. Sai: chỉ tô đỏ ô bạn đã chọn (không lộ đáp án) để cô gọi bạn khác.
   Cuối buổi: 🏁 Kết thúc → lưu bộ câu hỏi + đáp án đúng vào lớp (máy chủ tài khoản: gvLuuBuoiHoc).
   Dùng lại máy chủ phòng chơi (QM_PHONG: tao / ghi / doc) — không cần sửa máy chủ đó. */
(function () {
  'use strict';
  if (window.QM_LT_LOP) return;
  var QS = new URLSearchParams(location.search);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var SS = 'qm-phong-lop';
  var R = { mo: false, bat: false, ma: '', khoa: '', lop: '', tenLop: '', ros: [], tt: 'bat', cau: null, log: [], dem: 0, vao: 0, hen: null, genP: 0 };

  var ROOT = (function () { var l = document.querySelector('script[src*="phong-lop-gv.js"]'); var u = l ? l.src : ''; return u.substring(0, u.indexOf('assets/js/phong-lop-gv.js')); })();

  // ---------- giao diện ----------
  var CSS = '.gtl{position:fixed;left:12px;bottom:12px;z-index:8500;width:min(340px,92vw);background:#0b5a2a;color:#fff;border-radius:14px;box-shadow:0 8px 24px rgba(0,0,0,.3);font-size:14px;overflow:hidden}' +
    '.gtl-dau{display:flex;gap:8px;align-items:center;padding:9px 12px;background:rgba(0,0,0,.2);font-weight:700;cursor:pointer}.gtl-dau span{flex:1}' +
    '.gtl-than{padding:10px 12px;display:flex;flex-direction:column;gap:8px}.gtl.gon .gtl-than{display:none}' +
    '.gtl button,.gtl select{font:700 13px/1.1 inherit;border:0;border-radius:9px;padding:8px 11px;cursor:pointer}' +
    '.gtl .nut{background:#ffd54a;color:#3b2b00}.gtl .phu{background:rgba(255,255,255,.18);color:#fff}.gtl .do{background:#e8455a;color:#fff}.gtl button:disabled{opacity:.5;cursor:default}' +
    '.gtl-hang{display:flex;gap:6px;flex-wrap:wrap}.gtl .ten{font-size:17px;font-weight:800;color:#ffd54a}.gtl small{opacity:.85}' +
    '.gtl-man{position:fixed;inset:0;z-index:9400;background:#0b3d1c;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:20px}' +
    '.gtl-man .ma{font:800 clamp(56px,14vw,150px)/1 inherit;letter-spacing:.12em;color:#ffd54a}.gtl-man #gtlQr{background:#fff;padding:12px;border-radius:12px}' +
    '.gtl-man .u{font-size:clamp(16px,2.4vw,24px)}.gtl-man button{font:700 15px/1 inherit;border:0;border-radius:10px;padding:10px 18px;background:#ffd54a;color:#3b2b00;cursor:pointer}' +
    '';

  function dungUi() {
    if ($('.gtl')) return;
    if (!document.getElementById('gtlCss')) { var st = document.createElement('style'); st.id = 'gtlCss'; st.textContent = CSS; document.head.appendChild(st); }
    var d = document.createElement('div'); d.className = 'gtl';
    d.innerHTML = '<div class="gtl-dau"><span>🏫 Phòng lớp</span><small id="gtlGon">thu gọn ▾</small></div><div class="gtl-than" id="gtlThan"></div>';
    document.body.appendChild(d);
    $('.gtl-dau', d).onclick = function () { d.classList.toggle('gon'); $('#gtlGon').textContent = d.classList.contains('gon') ? 'mở ▴' : 'thu gọn ▾'; };
    ve();
  }
  function ve() {
    var t = $('#gtlThan'); if (!t) return;
    if (!R.bat) {
      t.innerHTML = '<small>Dạy cả lớp: học sinh quét mã, thấy câu hỏi trên máy mình; cô gọi từng bạn trả lời. Hiện hỗ trợ các câu dạng chọn đáp án.</small>' +
        '<div class="gtl-hang"><select id="gtlLop"><option value="">Chọn lớp…</option></select><button class="nut" id="gtlMo" type="button">🏫 Mở phòng lớp</button></div><small id="gtlLoi"></small>';
      napLop();
      $('#gtlMo').onclick = moPhong;
      return;
    }
    var c = R.cau, cho = R.tt === 'cho';
    t.innerHTML = '<div class="gtl-hang"><span>Mã <b>' + esc(R.ma) + '</b> · ' + esc(R.tenLop) + ' · đã vào <b id="gtlVao">' + R.vao + '</b>' + (R.mo ? ' bạn' : '/' + R.ros.length) + '</span> <button class="phu" id="gtlMa" type="button">📱 Hiện mã cho lớp</button></div>' +
      (c ? '<div>Câu <b>' + c.n + '</b>: ' + (c.goi ? 'bạn <span class="ten">' + esc(c.goi.ten) + '</span> ' + (R.tt === 'cho' ? '<small>đang trả lời…</small>' : R.tt === 'dung' ? '✅ đúng' : R.tt === 'sai' ? '❌ chưa đúng' : '') : '<small>chưa gọi ai</small>') + '</div>' +
        '<div class="gtl-hang">' + (R.tt === 'dung' || R.tt === 'hien' ? '<small>Bấm “Câu tiếp ›” trên đề để sang câu sau.</small>' :
          '<button class="nut" id="gtlGoi" type="button">🎲 ' + (c.goi ? 'Gọi bạn khác' : 'Gọi tên') + '</button><button class="phu" id="gtlHien" type="button">💡 Hiện đáp án</button><button class="phu" id="gtlBo" type="button">⏭ Bỏ qua câu</button>') + '</div>' + (R.tt === 'dung' || R.tt === 'hien' ? '' : '<small>Cô cũng có thể bấm thẳng vào đáp án trên đề để tự chọn.</small>')
        : '<small>Chọn dạng bài rồi bấm bắt đầu để hiện câu đầu tiên.</small>') +
      '<div class="gtl-hang"><button class="do" id="gtlKet" type="button">🏁 Kết thúc buổi</button></div><small id="gtlLoi"></small>';
    $('#gtlMa').onclick = hienMa;
    var g = $('#gtlGoi'); if (g) g.onclick = goiTen;
    var h = $('#gtlHien'); if (h) h.onclick = hienDapAn;
    var bo = $('#gtlBo'); if (bo) bo.onclick = boQua;
    $('#gtlKet').onclick = ketThuc;
  }
  function loi(m) { var e = $('#gtlLoi'); if (e) e.textContent = m || ''; }

  var DL = null;
  function layDL() { return DL ? Promise.resolve(DL) : QM_TK.goi('gvDuLieu', {}).then(function (d) { DL = d; return d; }); }
  function napLop() {
    layDL().then(function (D) {
      var s = $('#gtlLop'); if (!s) return;
      var cac = (D.lop || []).filter(function (l) { return !l.dong; }), mac = QS.get('lop') || '';
      s.innerHTML = cac.map(function (l) { return '<option value="' + esc(l.maLop) + '"' + (l.maLop === mac ? ' selected' : '') + '>' + esc(l.tenLop || l.maLop) + '</option>'; }).join('') + '<option value="__mo">🌐 Phòng mở (học sinh nhiều lớp)</option>';
    }).catch(function (e) { loi('Chưa tải được danh sách lớp: ' + (e.message || e)); });
  }

  // ---------- mở phòng ----------
  function moPhong() {
    var ma = $('#gtlLop') && $('#gtlLop').value; if (!ma) return loi('Cô chọn lớp trước nhé.');
    if (!window.QM_PHONG || !QM_PHONG.coMayChu()) return loi('Web chưa nối máy chủ phòng chơi.');
    loi('⏳ Đang mở phòng…');
    Promise.all([layDL(), QM_PHONG.tao()]).then(function (kq) {
      var D = kq[0], p = kq[1], l = (D.lop || []).filter(function (x) { return x.maLop === ma; })[0] || {};
      var mo = ma === '__mo', ros = mo ? rongRos() : (D.hocSinh || []).filter(function (h) { return h.maLop === ma; }).slice(0, 60).map(function (h) { return { id: h.hoSoId, ten: String(h.hoTen || '').replace(/\s+/g, ' ').trim() }; });
      R.mo = mo; R.bat = true; R.ma = p.ma; R.khoa = p.khoa; R.lop = mo ? '' : ma; R.tenLop = mo ? 'Phòng mở' : (l.tenLop || ma); R.ros = ros; R.log = []; R.cau = null; R.tt = 'bat'; R.dem = 0;
      luuSS(); dangBai(); publish(); ve(); theoDoi(); hienMa();
      // đang đứng ở một câu trắc nghiệm thì đưa luôn lên phòng
      if (khu() && khu().querySelector('.lt-dap-o')) sauVeCau();
      else { var sd = $('.lt-chon-dang'); if (sd) sd.dispatchEvent(new Event('change', { bubbles: true })); }   // đang ở câu ghép / xếp…: làm lại lượt (phòng lớp bỏ các dạng này)
    }).catch(function (e) { loi('Không mở được phòng: ' + (e.message || e)); });
  }
  function rongRos() { var a = []; for (var i = 0; i < 60; i++) a.push({ id: '', ten: '' }); return a; }
  function luuSS() { try { sessionStorage.setItem(SS, JSON.stringify({ mo: R.mo, ma: R.ma, khoa: R.khoa, lop: R.lop, tenLop: R.tenLop, ros: R.ros, log: R.log })); } catch (e) {} }
  function khoiPhuc() {
    var o; try { o = JSON.parse(sessionStorage.getItem(SS) || 'null'); } catch (e) {}
    if (!o || !o.ma) return;
    R.mo = !!o.mo; R.bat = true; R.ma = o.ma; R.khoa = o.khoa; R.lop = o.lop; R.tenLop = o.tenLop; R.ros = o.ros || []; R.log = o.log || []; R.tt = 'bat';
    theoDoi();
  }
  function hienMa() {
    var m = document.createElement('div'); m.className = 'gtl-man';
    var url = ROOT + 'lop/?ma=' + R.ma, hien = url.replace(/^https?:\/\//, '');
    m.innerHTML = '<div class="u">Quét mã hoặc vào <b>' + esc(hien.replace(/\?.*$/, '')) + '</b> và nhập mã phòng</div><div class="ma">' + esc(R.ma) + '</div><div id="gtlQr"></div>' +
      '<div class="u">Các em đăng nhập hồ sơ của mình trước khi vào · Đã vào: <b id="gtlVao2">' + R.vao + '</b>' + (R.mo ? ' bạn' : '/' + R.ros.length) + '</div><button type="button">Xong, bắt đầu dạy</button>';
    document.body.appendChild(m);
    $('button', m).onclick = function () { m.remove(); };
    var vc = function () { if (!window.QRCode) return setTimeout(vc, 300); try { new QRCode($('#gtlQr', m), { text: url, width: 220, height: 220 }); } catch (e) {} };
    if (!window.QRCode) { var s = document.createElement('script'); s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'; document.head.appendChild(s); }
    vc();
  }

  // ---------- đồng bộ ----------
  function khu() { return window.QM_LT_API && QM_LT_API.khu; }
  function chup() {
    var k = khu(); if (!k) return '';
    var c = k.cloneNode(true);
    c.querySelectorAll('.lt-nut-tiep,.lt-nut-kq,.lt-sao,.lt-am,.ot-am,.lt-dau-nut,.lt-goi-y-nut,.ot-but,.ot-xem-lai').forEach(function (x) { x.remove(); });
    c.querySelectorAll('button.lt-dap-o').forEach(function (b) { b.removeAttribute('disabled'); });
    return c.innerHTML;
  }
  function publish() {
    if (!R.bat) return;
    var c = R.cau, o = { v: 1, q: ++R.dem, tt: R.tt, r: R.ros.map(function (x) { return x.id; }), lop: R.tenLop };
    if (R.mo) o.mo = 1;
    if (c) { o.n = c.n; o.tong = c.tong; o.kieu = c.kieu; o.html = c.html; o.goi = c.goi ? { id: c.goi.id, ten: c.goi.ten } : null; o.ma = c.ma; o.chon = c.chon; }
    QM_PHONG.ghi(R.ma, R.khoa, o);
  }
  function dangBai() { return !!(window.QM_LT_API); }

  function sauVeCau() {                                    // luyen-tap.js vừa vẽ xong một câu trắc nghiệm
    var A = QM_LT_API, B = A.B(); if (!B || !B.dap) return;
    chotCauTruoc();
    var dem = khu().querySelector('.lnp-ten-dang') || khu().querySelector('.lt-dem'), kieu = dem ? dem.textContent.split('·')[0].replace(/^[^\wÀ-ỹ]+/, '').trim() : '';
    R.cau = { i: B.i, n: B.i + 1, tong: B.hang.length, kieu: kieu, html: chup(), goi: null, lan: 0, ma: '', chon: null, tries: [], xong: false, de: deCau() };
    R.tt = 'cho-goi'; ve(); publish();
  }
  function chotCauTruoc() {                                // ghi câu vừa xong vào nhật ký buổi
    var c = R.cau; if (!c || c.daGhi || !c.xong) return; c.daGhi = true;
    R.log.push(c.nhatKy); luuSS();
  }
  function deCau() {                                       // chữ của đề lúc câu vừa hiện (trước khi trả lời, lời giải còn chưa chen vào)
    var A = QM_LT_API, de = khu().querySelector('.lt-de'); if (!de) return '';
    var cl = de.cloneNode(true); cl.querySelectorAll('.lt-o-trong,.lnp-trong').forEach(function (x) { x.textContent = '＿＿'; });
    cl.querySelectorAll('.lnp-hang,.lnp-nhan').forEach(function (x) { x.remove(); });
    cl.querySelectorAll('.tv-loa,.lt-nghe,.lt-goi-y-nut,small,.lt-hd-py,.lt-py-de,.lt-de-py').forEach(function (x) { x.remove(); });
    var hoi = cl.querySelector('.lt-hoi,.lnp-hoi'), h = hoi ? A.chu(hoi.innerHTML) : ''; if (hoi) hoi.remove();
    var t = A.chu(cl.innerHTML).replace(/\s+/g, ' ').trim();
    return (t ? t : '') + (h ? (t ? ' — ' : '') + h : '').slice(0, 300);
  }
  function opt(x) { return QM_LT_API.chu(String(x.html).replace(/<\/span><span/g, '</span> <span')).replace(/\s+/g, ' ').trim().slice(0, 100); }
  function nhatKy(dungChinh) {
    var A = QM_LT_API, B = A.B(), c = R.cau, ds = B.dap.ds, k = khu(), gi = k.querySelector('.lt-giai,.lnp-giai'), giai = '';
    if (gi) { var g2 = gi.cloneNode(true); g2.querySelectorAll('.lt-ket,.lt-nut-kq,.tv-loa,button').forEach(function (x) { x.remove(); }); giai = A.chu(g2.innerHTML.replace(/<\/(div|span|p)>/g, '</$1> ')).replace(/\s+/g, ' ').trim().slice(0, 300); }
    var dap = ds.filter(function (x) { return x.dung; })[0];
    return { n: c.n, kieu: c.kieu, de: c.de || (c.kieu ? '(' + c.kieu + ')' : ''), cacDap: ds.map(function (x) { return opt(x); }),
      dapAn: dap ? opt(dap) : '', giai: giai, goi: c.tries.slice() };
  }

  // ---------- gọi tên / nhận đáp án ----------
  function goiTen() {
    if (!window.QM_GOI_TEN || !QM_GOI_TEN.mo) return loi('Chưa nạp bảng Gọi tên.');
    stopCho();
    QM_GOI_TEN.mo({ lop: R.lop, ma: R.ma, ds: R.mo ? R.ros.filter(function (x) { return x.id; }).map(function (x) { return { hoTen: x.ten, hoSoId: x.id }; }) : null, khiChon: function (hs) {
      var c = R.cau; if (!c) return;
      var i = R.ros.map(function (x) { return x.id; }).indexOf(hs.hoSoId);
      if (i < 0) { loi('Bạn ' + hs.hoTen + ' chưa có hồ sơ trong lớp nên chưa trả lời bằng máy được. Cô gọi bạn khác nhé.'); return; }
      moLai(c); c.lan++; c.goi = { id: hs.hoSoId, ten: R.ros[i].ten, i: i }; c.ma = c.i + '-' + c.lan; c.chon = null;
      R.tt = 'cho'; c.html = chup(); ve(); publish(); choDapAn();
    } });
  }
  function moLai(c) {                                      // bỏ ô đỏ của bạn trước, mở lại cho bạn mới
    var k = khu(); k.querySelectorAll('.lt-dap-o.sai').forEach(function (b) { b.classList.remove('sai'); });
    k.querySelectorAll('.lt-dap-o').forEach(function (b) { b.disabled = false; });
    var hop = k.querySelector('.lt-dap'); if (hop) hop.classList.remove('xong');
  }
  function stopCho() { clearTimeout(R.hen); R.hen = null; R.genP++; }
  function choDapAn() {
    stopCho(); var g = R.genP, c = R.cau;
    (function hoi() {
      if (g !== R.genP || !R.bat || R.tt !== 'cho') return;
      QM_PHONG.doc(R.ma, R.khoa, (R.mo ? 60 : Math.max(4, R.ros.length))).then(function (o) {
        if (g !== R.genP) return;
        capNhatVao(o);
        var d = o.g && o.g.dap && o.g.dap[c.goi.i];
        if (d && d.c === c.ma) return nhanDapAn(+d.x);
        R.hen = setTimeout(hoi, 900);
      }).catch(function () { R.hen = setTimeout(hoi, 1800); });
    })();
  }
  function nhanDapAn(k) {
    var A = QM_LT_API, B = A.B(), c = R.cau, nut = khu().querySelectorAll('.lt-dap-o')[k];
    if (!nut || !B.dap.ds[k]) return choDapAn();
    var dung = !!B.dap.ds[k].dung;
    c.tries.push({ ten: c.goi.ten, chon: opt(B.dap.ds[k]), dung: dung });
    c.chon = k;
    if (dung) {
      A.traLoi(nut); c.xong = true; R.tt = 'dung'; c.nhatKy = nhatKy(true);
    } else {
      nut.classList.add('sai'); nut.disabled = true; R.tt = 'sai';        // chỉ tô đỏ ô đã chọn, không lộ đáp án
    }
    c.html = chup(); ve(); publish();
  }
  function boQua() {                                       // cô sang câu sau luôn: hiện đáp án rồi bấm "Câu tiếp"
    hienDapAn();
    setTimeout(function () { var n = khu().querySelector('.lt-nut-tiep:not([hidden]) .lt-tiep, .ot-tiep'); if (n) n.click(); }, 350);
  }
  function coChon(k) {                                     // cô tự bấm đáp án trên đề: đúng thì hiện, sai thì chỉ tô đỏ ô đó
    var A = QM_LT_API, B = A.B(), c = R.cau, nut = khu().querySelectorAll('.lt-dap-o')[k];
    if (!c || c.xong || !nut || !B.dap.ds[k] || nut.disabled) return;
    stopCho(); moLai(c);
    var dung = !!B.dap.ds[k].dung;
    c.tries.push({ ten: 'Cô', chon: opt(B.dap.ds[k]), dung: dung }); c.chon = k;
    if (dung) { A.traLoi(nut); c.xong = true; R.tt = 'dung'; c.nhatKy = nhatKy(true); }
    else { nut.classList.add('sai'); nut.disabled = true; R.tt = 'sai'; }
    c.html = chup(); ve(); publish();
  }
  function hienDapAn() {
    var A = QM_LT_API, B = A.B(), c = R.cau; if (!c) return;
    stopCho(); moLai(c);
    var ds = B.dap.ds, k = 0; ds.forEach(function (x, i) { if (x.dung) k = i; });
    var nut = khu().querySelectorAll('.lt-dap-o')[k];
    A.traLoi(nut); var kq = khu().querySelector('.lt-ket'); if (kq) { kq.className = 'lt-ket'; kq.textContent = '💡 Đáp án'; }
    c.xong = true; c.nhatKy = nhatKy(false); c.chon = null; R.tt = 'hien'; c.html = chup(); ve(); publish();
  }

  function capNhatVao(o) {
    var n = 0;
    if (R.mo) {                                            // Phòng mở: danh sách = các bạn đã giữ ô (id = mã hồ sơ, gửi lúc vào)
      (o.nguoi || []).forEach(function (g, i) { if (i >= 60) return; if (g && g.hs) { R.ros[i] = { id: g.hs, ten: g.ten || '', lop: g.lop || '' }; n++; } });
      R.vao = n; var e0 = $('#gtlVao'); if (e0) e0.textContent = n; var e3 = $('#gtlVao2'); if (e3) e3.textContent = n; return;
    }
    (o.v || []).forEach(function (m, i) { if (i < R.ros.length && m && Object.keys(m).length) n++; });
    R.vao = n; var e = $('#gtlVao'); if (e) e.textContent = n; var e2 = $('#gtlVao2'); if (e2) e2.textContent = n;
  }
  function theoDoi() {                                     // đếm số em đã vào phòng (chậm), khi đang chờ đáp án thì choDapAn lo
    (function lap() {
      if (!R.bat) return;
      if (R.tt !== 'cho') QM_PHONG.doc(R.ma, R.khoa, (R.mo ? 60 : Math.max(4, R.ros.length))).then(capNhatVao).catch(function () {});
      setTimeout(lap, 5000);
    })();
  }

  // ---------- kết thúc ----------
  function ketThuc() {
    var c = R.cau; if (c && c.xong) chotCauTruoc();
    if (!R.log.length) { if (!confirm('Buổi này chưa có câu nào hoàn thành. Đóng phòng, không lưu?')) return; return dongPhong(); }
    if (!confirm('Kết thúc buổi và lưu ' + R.log.length + ' câu vào ' + (R.mo ? 'phòng mở (' + R.vao + ' bạn)' : 'lớp ' + R.tenLop) + '?')) return;
    loi('⏳ Đang lưu…');
    var tieu = (QM_LT_API.tenBai() || document.title.split('·')[0]).trim();
    QM_TK.goi('gvLuuBuoiHoc', { maLop: R.lop, dsHs: R.mo ? R.ros.filter(function (x) { return x.id; }).map(function (x) { return x.id; }) : null, tieuDe: tieu + ' · ' + new Date().toLocaleDateString('vi-VN'), phan: document.title.split('·')[0].trim(), cau: R.log })
      .then(function (d) { loi('✅ Đã lưu ' + d.soCau + ' câu. Học sinh xem lại trong trang “Buổi học” của lớp.'); dongPhong(true); })
      .catch(function (e) { loi('Chưa lưu được: ' + (e.message || e) + '. Cô bấm Kết thúc lại nhé (dữ liệu vẫn còn).'); });
  }
  function dongPhong(daLuu) {
    stopCho(); R.tt = 'ket'; publish();
    setTimeout(function () { R.bat = false; R.cau = null; R.log = []; try { sessionStorage.removeItem(SS); } catch (e) {} if (!daLuu) ve(); else { ve(); loi('✅ Đã lưu buổi học.'); } }, 1200);
  }

  document.addEventListener('click', function (e) {
    if (!R.bat) return; var o = e.target.closest && e.target.closest('.lt-dap-o'); if (!o || !khu() || !khu().contains(o)) return;
    var k = Array.prototype.indexOf.call(khu().querySelectorAll('.lt-dap-o'), o); if (k >= 0) coChon(k);
  });
  window.QM_LT_LOP = { dangBat: function () { return R.bat; }, sauVeCau: sauVeCau };

  // chỉ hiện với giáo viên (không phải chế độ xem như học sinh)
  var lan = 0;
  (function cho() {
    if (window.QM_TK && QM_TK.giaoVien && QM_TK.giaoVien()) { khoiPhuc(); return dungUi(); }
    if (++lan < 40) setTimeout(cho, 500);
  })();
})();
