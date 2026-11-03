/* =========================================================
   VÀO PHÒNG CHƠI (điện thoại của đội) · Tiếng Trung Diệu Kỳ
   Nhập mã phòng (hoặc quét QR: choi/?ma=1234) → chọn đội → bấm đáp án theo câu hỏi trên màn chiếu.
   Đọc trạng thái phòng 1,2 giây một lần (QM_PHONG.xem), gửi bài bằng QM_PHONG.gui.
   ========================================================= */
(function () {
  var el = document.getElementById('vao-choi');
  var P = window.QM_PHONG;
  if (!el || !P) return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var CHU = ['A', 'B', 'C', 'D'];
  var TV = window.QM_TV || null;
  function moKhoaAm() {   // iPhone: lần đọc đầu phải nằm trong một lần bấm
    try { if (window.speechSynthesis) { var u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'zh-CN'; speechSynthesis.speak(u); } } catch (e) {}
  }
  document.addEventListener('click', function mo1() { moKhoaAm(); document.removeEventListener('click', mo1, true); }, true);
  function loaDT(s) { return s && s.loa !== 'chieu'; }   // câu nghe phát trên điện thoại (cô chọn ở màn cài đặt)
  function nutNghe(t, nhan) { return t && TV ? '<button type="button" class="vc-nghe" data-doc="' + esc(t) + '">🔊 ' + (nhan || 'Nghe') + '</button>' : ''; }
  el.addEventListener('click', function (e) { var b = e.target.closest('.vc-nghe'); if (b && TV) TV.doc(b.dataset.doc); });
  var DA_DOC = {};
  function tuDoc(khoa, t) { if (!t || !TV || DA_DOC[khoa]) return; DA_DOC[khoa] = 1; setTimeout(function () { TV.doc(t); }, 250); }
  var MAU = { do: 'do', xanh: 'xanh', vang: 'vang', lam: 'lam' };

  var R = { ma: (location.search.match(/[?&]ma=(\d{4,5})/) || [])[1] || '', d: null, s: null, toi: null, nhan: 0, khoaVe: '', daGui: {}, loi: 0, hen: null };
  function khoaDoi() { return 'qm-choi-doi-' + R.ma; }
  try { var cu = sessionStorage.getItem('qm-choi-ma'); if (!R.ma && cu) R.ma = cu; } catch (e) {}

  // ---------- Nhập mã phòng ----------
  function manMa(loi) {
    dung(); R.d = null; R.s = null;
    el.innerHTML = '<div class="vc-the">' +
      '<div class="vc-ico">🎮</div><h2>Vào phòng chơi</h2>' +
      '<p>Nhập mã cô cho: <b>4 số</b> (chơi cả lớp) hoặc <b>5 số</b> (phiên chơi một mình)</p>' +
      '<form class="vc-form-ma"><input class="vc-o-ma" inputmode="numeric" pattern="\\d{4,5}" maxlength="5" autocomplete="off" placeholder="1234" value="' + esc(R.ma) + '" aria-label="Mã phòng hoặc mã phiên chơi">' +
      '<button type="submit" class="btn gold">Vào phòng ›</button></form>' +
      (loi ? '<p class="vc-loi">' + esc(loi) + '</p>' : '') + '</div>';
    var f = el.querySelector('.vc-form-ma'), o = el.querySelector('.vc-o-ma');
    o.addEventListener('input', function () { o.value = o.value.replace(/\D/g, '').slice(0, 5); });
    f.addEventListener('submit', function (e) { e.preventDefault(); if (/^\d{4,5}$/.test(o.value)) { R.ma = o.value; moPhong(); } else o.focus(); });
  }

  // ---------- Chọn đội ----------
  function moPhong() {
    if (R.ma.length === 5) {                 // mã 5 số: phiên chơi một mình (phien-choi.js)
      if (window.QM_PC && QM_PC.vao) return QM_PC.vao(R.ma, el, function () { R.ma = ''; try { sessionStorage.removeItem('qm-choi-ma'); } catch (e) {} manMa(); });
      return manMa('Trang chưa tải xong phần phiên chơi, bạn tải lại trang nhé.');
    }
    try { sessionStorage.setItem('qm-choi-ma', R.ma); } catch (e) {}
    el.innerHTML = '<div class="vc-the"><div class="tv-trong">Đang vào phòng ' + esc(R.ma) + '…</div></div>';
    P.xem(R.ma).then(function (o) {
      R.s = docTT(o.s);
      if (R.s && R.s.caNhan) return manTen();
      var luu = null; try { luu = sessionStorage.getItem(khoaDoi()); } catch (e) {}
      if (luu != null && R.s && R.s.doi && R.s.doi[+luu]) return chonDoi(+luu);
      manDoi();
    }).catch(function (e) { manMa(e.ma === 'khong-co-phong' ? 'Không tìm thấy phòng ' + R.ma + '. Bạn xem lại mã trên màn chiếu nhé.' : 'Chưa kết nối được, bạn kiểm tra mạng rồi thử lại nhé.'); });
  }
  function docTT(s) { try { return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function manDoi() {
    var s = R.s || {};
    var ds = s.doi || [];
    el.innerHTML = '<div class="vc-the"><p class="vc-nho">Phòng <b>' + esc(R.ma) + '</b>' + (s.ten ? ' · ' + esc(s.ten) : '') + '</p><h2>Bạn ở đội nào?</h2>' +
      (ds.length ? '<div class="vc-doi-ds">' + ds.map(function (d, i) { return '<button type="button" class="vc-doi ' + (MAU[d.mau] || '') + '" data-i="' + i + '">' + esc(d.ico) + ' ' + esc(d.ten) + '</button>'; }).join('') + '</div>'
        : '<div class="tv-trong">Cô chưa mở phòng xong, chờ một chút nhé…</div>') +
      '<button type="button" class="vc-link vc-doi-ma">‹ Nhập mã khác</button></div>';
    el.querySelectorAll('.vc-doi').forEach(function (b) { b.addEventListener('click', function () { chonDoi(+b.dataset.i); }); });
    el.querySelector('.vc-doi-ma').addEventListener('click', function () { R.ma = ''; try { sessionStorage.removeItem('qm-choi-ma'); } catch (e) {} manMa(); });
    if (!ds.length) { dung(); R.hen = setTimeout(moPhong, 2000); }
  }
  // ---------- Cá nhân (Rung chuông vàng, mỗi máy một người): nhập tên → giữ một ô người chơi ----------
  function hoSoTK() { var T = window.QM_TK; var h = T && T.hoSoDang ? T.hoSoDang() : null; if (h) return { hoTen: h.hoTen, lop: h.lop, hs: h.hoSoId, tk: true };
    var n = T && T.nguoiDung ? T.nguoiDung() : null; if (n && T.giaoVien && T.giaoVien()) return { hoTen: n.hoTen || 'Cô giáo', lop: '', hs: '', tk: true }; return null; }
  function manTen(lan) {
    dung(); R.d = null;
    var h = hoSoTK();
    if (!h && (lan || 0) < 10 && !window.QM_TK) { el.innerHTML = '<div class="vc-the"><div class="tv-trong">Đang vào phòng…</div></div>'; R.hen = setTimeout(function () { manTen((lan || 0) + 1); }, 300); return; }
    var luu = {}; try { luu = JSON.parse(localStorage.getItem('qmhy:hoSo') || '{}'); } catch (e) {}
    el.innerHTML = '<div class="vc-the"><p class="vc-nho">Phòng <b>' + esc(R.ma) + '</b> · ' + esc((R.s || {}).ten || '') + ' · 👤 cá nhân</p>' +
      (h ? '<h2>' + esc(h.hoTen) + '</h2><p class="vc-nho">' + esc(h.lop || '') + '</p><button type="button" class="btn gold vc-vao-cn">▶ Vào chơi</button>'
        : '<h2>Tên của em</h2><form class="vc-form vc-form-ten"><input name="ten" required maxlength="40" placeholder="Họ tên đầy đủ" value="' + esc(luu.hoTen || '') + '" autocomplete="name">' +
          '<input name="lop" maxlength="40" placeholder="Lớp (ghi để lưu điểm)" value="' + esc(luu.lop || '') + '"><button type="submit" class="btn gold">▶ Vào chơi</button></form>' +
          '<p class="vc-nho">Đăng nhập thì tên, lớp tự điền và điểm lưu vào hồ sơ của em.</p>') +
      (R.loiTen ? '<p class="vc-loi">' + esc(R.loiTen) + '</p>' : '') +
      '<button type="button" class="vc-link vc-doi-ma">‹ Nhập mã khác</button></div>';
    el.querySelector('.vc-doi-ma').addEventListener('click', function () { R.ma = ''; try { sessionStorage.removeItem('qm-choi-ma'); } catch (e) {} manMa(); });
    var b = el.querySelector('.vc-vao-cn'); if (b) b.addEventListener('click', function () { R.toi1 = h; giuO(); });
    var f = el.querySelector('.vc-form-ten');
    if (f) f.addEventListener('submit', function (e) {
      e.preventDefault(); var ten = f.ten.value.replace(/\s+/g, ' ').trim(), lop = f.lop.value.replace(/\s+/g, ' ').trim(); if (!ten) return;
      try { localStorage.setItem('qmhy:hoSo', JSON.stringify({ hoTen: ten, lop: lop })); } catch (x) {}
      R.toi1 = { hoTen: ten, lop: lop, hs: '' }; giuO();
    });
    var luuO = null; try { luuO = sessionStorage.getItem(khoaDoi()); } catch (e) {}
    if (luuO != null && R.toi1) giuO();                    // tải lại trang: giữ lại ô cũ
  }
  function giuO() {
    moKhoaAm(); R.loiTen = '';
    var x = R.toi1, luuO = null; try { luuO = sessionStorage.getItem(khoaDoi()); } catch (e) {}
    var d = luuO != null ? +luuO : 0, lan = 0;
    el.innerHTML = '<div class="vc-the"><div class="tv-trong">Đang vào phòng…</div></div>';
    (function thu() {
      if (lan++ > 60 || d >= 60) { R.loiTen = 'Phòng đã đủ người.'; return manTen(); }
      P.nhan(R.ma, d, x.hoTen, x.lop, x.hs).then(function () {
        R.d = d; R.khoaVe = '';
        try { sessionStorage.setItem(khoaDoi(), d); } catch (e) {}
        el.innerHTML = '<div class="vc-dau"></div><div class="vc-noi"><div class="tv-trong">Đã vào phòng…</div></div>';
        vong();
      }).catch(function (e) {
        if (e.ma === 'co-nguoi') { d++; return thu(); }
        R.loiTen = e.ma === 'doi' ? 'Máy chủ phòng chơi chưa cập nhật chế độ cá nhân. Báo cô nhé.' : 'Chưa kết nối được, thử lại nhé.'; manTen();
      });
    })();
  }

  function chonDoi(i) {
    moKhoaAm();
    R.d = i; R.khoaVe = '';
    try { sessionStorage.setItem(khoaDoi(), i); } catch (e) {}
    P.vao(R.ma, i).catch(function () {});
    el.innerHTML = '<div class="vc-dau"></div><div class="vc-noi"><div class="tv-trong">Đang vào đội…</div></div>';
    vong();
  }

  // ---------- Đọc trạng thái định kỳ ----------
  function dung() { if (R.hen) clearTimeout(R.hen); R.hen = null; }
  function vong() {
    dung();
    P.xem(R.ma, R.d).then(function (o) {
      R.loi = 0;
      var s = docTT(o.s);
      if (s && s.caNhan && R.toi1 && o.nguoi && o.nguoi.id !== P.maMay()) { try { sessionStorage.removeItem(khoaDoi()); } catch (e) {} return giuO(); }   // ô bị máy khác giữ: tìm ô khác
      if (s && (!R.s || s.v !== R.s.v)) R.nhan = Date.now();
      R.s = s; R.toi = o.toi || {};
      ve();
    }).catch(function (e) {
      R.loi++;
      if (e.ma === 'khong-co-phong') return manMa('Phòng ' + R.ma + ' đã đóng.');
      if (R.loi >= 3) { var b = el.querySelector('.vc-mang'); if (!b) el.insertAdjacentHTML('afterbegin', '<div class="vc-mang">📶 Mạng chập chờn, đang thử kết nối lại…</div>'); }
    }).then(function () { R.hen = setTimeout(vong, 1200); });
  }
  setInterval(function () {   // đếm ngược trên điện thoại
    if (!R.s) return;
    el.querySelectorAll('.vc-giay, .vc-dem').forEach(function (t) {
      var con = Math.max(0, +t.dataset.con - Math.round((Date.now() - R.nhan) / 1000));
      t.textContent = con + (t.classList.contains('vc-giay') ? 's' : ''); t.classList.toggle('gap', con <= 3);
    });
  }, 250);

  function gui(k, c, x) {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    R.daGui[k + c] = x;
    R.khoaVe = '';
    ve();
    if (navigator.vibrate) try { navigator.vibrate(30); } catch (e) {}
    R.loiGui = '';
    P.gui(R.ma, R.d, k, c, x).then(function () { R.loiGui = ''; }).catch(function (e) {
      // Không dùng alert (alert chặn cả việc đọc câu hỏi). Bỏ chọn để bấm lại, báo lỗi ngay trên trang kèm mã lỗi.
      delete R.daGui[k + c]; R.khoaVe = '';
      R.loiGui = e && e.ma ? 'Máy chủ báo lỗi: ' + e.ma : 'Mạng chập chờn';
      ve();
      if (navigator.vibrate) try { navigator.vibrate([80, 60, 80]); } catch (x2) {}
    });
  }
  function daGui(k, c) {
    if (R.toi && R.toi[k] && R.toi[k].c === c) return R.toi[k].x;
    return R.daGui[k + c];
  }

  // ---------- Vẽ theo trạng thái ----------
  function ve() {
    var s = R.s, d = R.d;
    if (!s || !s.doi || !s.doi[d] || s.doi[d].vang) { el.querySelector('.vc-noi') && (el.querySelector('.vc-noi').innerHTML = '<div class="tv-trong">' + (s && s.caNhan && s.gd && s.gd !== 'sanh' ? 'Ván đang chơi, em chờ ván sau nhé…' : 'Chờ cô mở phòng…') + '</div>'); return; }
    var toi = s.doi[d];
    var dau = '<div class="vc-dau-o ' + (MAU[toi.mau] || '') + '"><span>' + esc(toi.ico) + ' <b>' + esc(toi.ten) + '</b></span>' +
      (s.diem ? '<span class="vc-diem">' + s.diem[d] + ' điểm' + (s.phu && s.phu[d] ? ' · ' + esc(s.phu[d]) : '') + '</span>' : '') +
      '<button type="button" class="vc-link vc-doi-lai">' + (s.caNhan ? 'Thoát' : 'Đổi đội') + '</button></div>';
    var view = noiDung(s, d);
    var khoa = view.khoa + '|' + (R.loiGui || '');
    if (khoa === R.khoaVe) { capNhatGiay(view); return; }
    R.khoaVe = khoa;
    // Giữ chữ đang gõ dở khi vẽ lại (ô cùng loại vẫn còn sau khi vẽ)
    var dangGo = document.activeElement && document.activeElement.tagName === 'INPUT' && el.contains(document.activeElement) ? document.activeElement : null;
    var goForm = dangGo && dangGo.form ? dangGo.form.className : '', goChu = dangGo ? dangGo.value : '';
    el.innerHTML = '<div class="vc-dau">' + dau + '</div>' +
      (R.loiGui ? '<div class="vc-mang vc-loi-gui">⚠️ Chưa gửi được đáp án (' + esc(R.loiGui) + '). Bạn bấm chọn lại nhé.</div>' : '') +
      '<div class="vc-noi">' + view.html + '</div>';
    el.querySelector('.vc-doi-lai').addEventListener('click', function () { if (!s.caNhan) { try { sessionStorage.removeItem(khoaDoi()); } catch (e) {} } dung(); R.d = null; R.toi1 = null; moPhong(); });
    if (view.gan) view.gan();
    if (goForm) {
      var f2 = el.querySelector('form[class="' + goForm + '"] input');
      if (f2) { f2.value = goChu; var dt = f2.closest('details'); if (dt) dt.open = true; f2.focus(); }
    }
    if (view.rung && navigator.vibrate) try { navigator.vibrate(view.rung); } catch (e) {}
  }
  function capNhatGiay(view) { var t = el.querySelector('.vc-giay'); if (t && view.con != null) t.dataset.con = view.con; }
  function giay(con) { return con != null ? '<span class="vc-giay" data-con="' + con + '">' + con + 's</span>' : ''; }
  function tenDoi(s, i) { var x = s.doi[i]; return x ? esc(x.ico + ' ' + x.ten) : ''; }

  function noiDung(s, d) {
    if (s.gd === 'sanh' || !s.gd) {
      if (s.cheDo === 'tu' && s.sanSang) return oSanSang(s, d, '<div class="vc-ico">✅</div><h2>' + (s.caNhan ? 'Đã vào phòng!' : 'Đã vào đội!') + '</h2><p class="vc-nho">' + esc(s.ten || '') + ' · tự luyện</p>', s.caNhan ? 'Em sẵn sàng' : 'Đội mình sẵn sàng');
      return { khoa: 'sanh' + s.v, html: '<div class="vc-cho"><div class="vc-ico">✅</div><h2>' + (s.caNhan ? 'Đã vào phòng!' : 'Đã vào đội!') + '</h2><p>Chờ cô bấm bắt đầu nhé.</p><p class="vc-nho">' + esc(s.ten || '') + '</p></div>' };
    }
    if (s.gd === 'ket' && s.ket) {
      var toi = (s.ket.thu || []).filter(function (x) { return x.i === d; })[0], h = toi ? toi.hang : 0;
      var ssK = s.cheDo === 'tu' && s.sanSang ? oSanSang(s, d, '', 'Chơi ván mới') : null;
      return { khoa: 'ket' + (ssK ? ssK.khoa : s.v), gan: ssK ? ssK.gan : null, rung: h === 1 ? [80, 60, 80, 60, 200] : null,
        html: '<div class="vc-cho"><div class="vc-ico">' + (['', '🥇', '🥈', '🥉', '🎖️'][h] || '🏁') + '</div><h2>' + (h === 1 ? (s.caNhan ? 'Em vô địch!' : 'Đội bạn vô địch!') : 'Hạng ' + h + (s.caNhan ? '/' + (s.ket.thu || []).length : '')) + '</h2>' +
          '<ol class="vc-xep">' + (s.ket.thu || []).filter(function (x, k) { return !s.caNhan || k < 10 || x.i === d; }).map(function (x) { return '<li' + (x.i === d ? ' class="toi"' : '') + ' value="' + x.hang + '">' + tenDoi(s, x.i) + ' · ' + s.diem[x.i] + ' điểm</li>'; }).join('') + '</ol>' +
          (s.cheDo === 'tu' && s.sanSang ? '' : '<p class="vc-nho">Chờ cô mở ván mới…</p>') + '</div>' +
          (ssK ? ssK.html : '') };
    }
    if (s.tro === 'oc' && s.oc) return noiDungOC(s, d);
    var c = s.cau; if (!c) return { khoa: 'cho' + s.v, html: '<div class="tv-trong">Chờ câu hỏi…</div>' };
    var loai = s.loai && s.loai[d];
    if (c.mo) {
      if (loai) return { khoa: 'loai' + c.id, html: '<div class="vc-cho"><div class="vc-ico">📣</div><h2>' + (s.caNhan ? 'Em đã bị loại' : 'Đội đã bị loại') + '</h2><p>Cổ vũ ' + (s.caNhan ? 'các bạn' : 'các đội') + ' còn lại nhé! Cô có thể dùng quyền cứu trợ đấy.</p></div>' };
      if ((c.ai || []).indexOf(d) < 0) return { khoa: 'xem' + c.id + c.an.join(), con: c.conLai, html: '<div class="vc-cho"><div class="vc-ico">👀</div><h2>' + tenDoi(s, s.luot) + ' đang trả lời</h2><p>Câu nấc tiếp theo · nhìn lên màn chiếu nhé.</p>' + giay(c.conLai) + '</div>' };
      var da = daGui('dap', c.id);
      var tg = '';
      if (s.tro === 'tp' && c.tg && da == null) {
        tg = '<div class="vc-tg">' + (c.tg.nam ? '<button type="button" data-tg="5050">50:50</button>' : '') + (c.tg.doi ? '<button type="button" data-tg="doi">🔄 Đổi câu</button>' : '') + (c.tg.gio ? '<button type="button" data-tg="gio">⏱ +15 giây</button>' : '') + '</div>';
        if (!(c.tg.nam || c.tg.doi || c.tg.gio)) tg = '';
      }
      return { khoa: 'cau' + c.id + '|' + (da == null ? '' : da) + '|' + (c.an || []).join() + JSON.stringify(c.tg || ''), con: c.conLai,
        html: '<div class="vc-cau-dau"><span>' + esc(c.ico || '') + ' Câu ' + c.so + (c.tong ? '/' + c.tong : '') + '</span>' + giay(c.conLai) + '</div>' +
          '<div class="vc-de' + (c.deHan ? ' hanzi' : '') + '">' + esc(c.txt).replace(/\n/g, '<br>') + (c.doc ? '<div>' + nutNghe(c.doc, 'Nghe lại') + '</div>' : '') + '</div>' +
          '<div class="vc-dap' + (c.han ? ' han' : '') + '">' + c.dap.map(function (x, i) {
            var an = (c.an || []).indexOf(i) >= 0;
            return '<button type="button" class="vc-dap-o' + (da != null && +da === i ? ' chon' : '') + (an ? ' an' : '') + '" data-i="' + i + '"' + (da != null || an ? ' disabled' : '') + '><b>' + CHU[i] + '</b><span>' + esc(x) + '</span></button>';
          }).join('') + '</div>' + tg +
          (da != null ? '<p class="vc-da-chon">Đã chọn <b>' + CHU[+da] + '</b> · chờ kết quả…</p>' : ''),
        gan: function () {
          if (c.doc && loaDT(s)) tuDoc('c' + c.id, c.doc);
          el.querySelectorAll('.vc-dap-o:not([disabled])').forEach(function (b) { b.addEventListener('click', function () { gui('dap', c.id, b.dataset.i); }); });
          el.querySelectorAll('.vc-tg button').forEach(function (b) { b.addEventListener('click', function () { if (confirm('Dùng quyền trợ giúp này? Mỗi quyền chỉ dùng được 1 lần.')) { b.disabled = true; P.gui(R.ma, R.d, 'tg', c.id, b.dataset.tg).catch(function () { b.disabled = false; }); } }); });
        } };
    }
    // Câu đã đóng: kết quả
    var kq = c.kq ? c.kq[d] : '', dung = c.dap[c.dung];
    var tieuDe = kq === 'dung' ? '🎉 Chính xác!' : kq === 'sai' ? '😅 Chưa đúng' : kq === 'trong' ? '⏰ Hết giờ' : '👀 Đáp án';
    var sg = oSang(s, d);
    return { khoa: 'kq' + c.id + kq + sg.khoa, rung: kq === 'dung' ? [60, 40, 60] : kq === 'sai' ? [200] : null,
      html: '<div class="vc-kq ' + (kq || 'xem') + '"><h2>' + tieuDe + '</h2><p>Đáp án: <b>' + CHU[c.dung] + '</b> <span class="' + (c.han ? 'hanzi' : '') + '">' + esc(dung) + '</span></p>' +
        (c.giai ? '<p class="vc-giai">' + esc(c.giai) + ' ' + nutNghe(c.docGiai) + '</p>' : '') + '</div>' + sg.html,
      gan: function () { if (c.docGiai && loaDT(s)) tuDoc('g' + c.id, c.docGiai); sg.gan(); } };
  }

  // ---------- Sang câu / sẵn sàng (tự sang câu, tự luyện) ----------
  function oSang(s, d) {
    var x = s.sang;
    if (!x) return { khoa: '', html: '<p class="vc-nho">Chờ câu tiếp theo…</p>', gan: function () {} };
    var da = (x.san || []).indexOf(d) >= 0 || daGui('tg', x.id) === 'tiep', so = (x.san || []).length;
    var html = '<div class="vc-sang">' +
      (x.dung ? '<p>⏸ Đang dừng để cô giảng, chờ chút nhé…</p>' : x.con != null ? '<p>' + (x.ket ? 'Xem kết quả' : 'Câu tiếp') + ' sau <b class="vc-dem" data-con="' + x.con + '">' + x.con + '</b> giây</p>' : '') +
      (da ? '<p class="vc-da-chon">✓ ' + (s.caNhan ? 'Em' : 'Đội bạn') + ' đã sẵn sàng' + (so ? ' (' + so + (s.caNhan ? ' người' : ' đội') + ')' : '') + '</p>'
        : '<button type="button" class="btn gold vc-tiep">' + (x.ket ? 'Xem kết quả 🏆' : 'Sẵn sàng câu tiếp ›') + '</button>' + (so ? '<p class="vc-nho">' + so + (s.caNhan ? ' người' : ' đội') + ' đã sẵn sàng</p>' : '')) + '</div>';
    return { khoa: '|s' + x.id + so + (da ? 'd' : '') + (x.dung ? 'p' : '') + (x.con == null ? '' : 'c'), html: html,
      gan: function () { var b = el.querySelector('.vc-tiep'); if (b) b.addEventListener('click', function () { gui('tg', x.id, 'tiep'); }); } };
  }
  function oSanSang(s, d, dau, nhan) {
    var x = s.sanSang, da = (x.san || []).indexOf(d) >= 0 || daGui('tg', x.id) === 'san-sang';
    var ds = (s.doi || []).map(function (z, i) { if (!z || z.vang) return ''; return '<li class="' + ((x.san || []).indexOf(i) >= 0 ? 'on' : '') + '">' + esc(z.ico + ' ' + z.ten) + ((x.san || []).indexOf(i) >= 0 ? ' ✋' : '') + '</li>'; }).join('');
    var html = '<div class="vc-cho">' + dau +
      (x.con != null ? '<h2>Bắt đầu sau <b class="vc-dem" data-con="' + x.con + '">' + x.con + '</b> giây!</h2>'
        : da ? '<p class="vc-da-chon">✓ ' + (s.caNhan ? 'Em đã sẵn sàng. Chờ các bạn khác…' : 'Đội bạn đã sẵn sàng. Chờ các đội khác…') + '</p>' : '<button type="button" class="btn gold vc-san-sang">✋ ' + esc(nhan) + '</button>') +
      '<ul class="vc-san-ds">' + ds + '</ul><p class="vc-nho">Mọi đội có điện thoại cùng sẵn sàng (ít nhất 2 đội) là tự bắt đầu.</p></div>';
    return { khoa: 'ss' + x.id + (x.san || []).join() + (da ? 'd' : '') + (x.con == null ? '' : 'c') + (s.gd || ''), html: html,
      gan: function () { var b = el.querySelector('.vc-san-sang'); if (b) b.addEventListener('click', function () { gui('tg', x.id, 'san-sang'); }); } };
  }

  // ---------- Ô chữ ----------
  function noiDungOC(s, d) {
    var O = s.oc, khoaDa = O.daDoan && O.daDoan[d];
    var doanKhoa = function (bat) {
      if (khoaDa || O.gd === 'het') return khoaDa ? '<p class="vc-nho">🔑 Đội bạn đã đoán từ khóa.</p>' : '';
      var da = daGui('khoa', O.khoaId);
      if (da != null) return '<p class="vc-da-chon">🔑 Đã gửi từ khóa: <b>' + esc(da) + '</b></p>';
      return (bat ? '' : '<details class="vc-khoa"><summary>🔑 Đoán từ khóa hàng dọc (1 lần)</summary>') +
        '<form class="vc-form vc-form-khoa"><input type="text" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="' + O.khoaDai + ' chữ cái, không dấu" aria-label="Từ khóa">' +
        '<button type="submit" class="btn gold">Gửi</button></form>' + (bat ? '' : '</details>');
    };
    var ganKhoa = function () {
      var f = el.querySelector('.vc-form-khoa'); if (!f) return;
      f.addEventListener('submit', function (e) { e.preventDefault(); var v = f.querySelector('input').value.trim(); if (!v) return;
        if (confirm('Gửi từ khóa "' + v + '"? Mỗi đội chỉ được đoán 1 lần.')) gui('khoa', O.khoaId, v); });
    };
    var html = '', gan = null, con = O.conLai || null, sg = null;
    var gy = O.goiY, goiYHtml = gy ? '<div class="vc-oc-goi-y">' + (gy.loai === 'nghia' ? '📖 ' + esc(gy.txt) : gy.loai === 'han' ? '<span class="hanzi">' + esc(gy.txt) + '</span>' : '🎧 ' + nutNghe(gy.doc, 'Nghe từ')) + '</div>' : '';
    if (gy && gy.doc && loaDT(s)) tuDoc('oc' + O.dapId, gy.doc);
    if (O.gd === 'chon') {
      if (O.luot === d) {
        html = '<h2 class="vc-h">Đội bạn chọn hàng ngang</h2><div class="vc-hang-ds">' + O.ds.map(function (h, r) {
          return h.tt ? '' : '<button type="button" data-r="' + r + '">Hàng ' + (r + 1) + '<small>' + h.dai + ' chữ cái</small></button>'; }).join('') + '</div>';
        if (daGui('hang', O.chonId) != null) html = '<div class="vc-cho"><h2>Đã chọn hàng ' + (+daGui('hang', O.chonId) + 1) + '</h2><p>Nhìn lên màn chiếu…</p></div>';
        gan = function () { el.querySelectorAll('.vc-hang-ds button').forEach(function (b) { b.addEventListener('click', function () { gui('hang', O.chonId, b.dataset.r); }); }); };
      } else html = '<div class="vc-cho"><div class="vc-ico">👀</div><h2>' + tenDoi(s, O.luot) + ' đang chọn hàng</h2></div>';
    } else if (O.gd === 'hang' || O.gd === 'gianh') {
      var duoc = O.gd === 'hang' ? O.luot === d : (O.choGianh || []).indexOf(d) >= 0;
      var da = daGui('dap', O.dapId), dai = O.ds[O.hang] ? O.ds[O.hang].dai : '';
      if (duoc && da == null) {
        html = '<div class="vc-cau-dau"><span>Hàng ' + (O.hang + 1) + ' · ' + dai + ' chữ cái' + (O.gd === 'gianh' ? ' · giành quyền!' : '') + '</span>' + giay(O.conLai) + '</div>' +
          goiYHtml + '<p class="vc-nho">Gõ <b>phiên âm không dấu</b> (ü gõ <b>v</b>).</p>' +
          '<form class="vc-form vc-form-dap"><input type="text" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="20" placeholder="' + dai + ' chữ cái" aria-label="Đáp án">' +
          '<button type="submit" class="btn gold">Gửi</button></form>';
        gan = function () { var f = el.querySelector('.vc-form-dap'), i = f.querySelector('input'); setTimeout(function () { i.focus(); }, 50);
          f.addEventListener('submit', function (e) { e.preventDefault(); var v = i.value.trim(); if (v) gui('dap', O.dapId, v); }); };
      } else if (da != null) html = '<div class="vc-cho"><h2>Đã gửi: <b>' + esc(da) + '</b></h2><p>Chờ kết quả trên màn chiếu…</p></div>';
      else html = '<div class="vc-cho"><div class="vc-ico">👀</div><h2>' + (O.gd === 'hang' ? tenDoi(s, O.luot) + ' đang trả lời hàng ' + (O.hang + 1) : 'Các đội khác đang giành quyền') + '</h2>' + goiYHtml + giay(O.conLai) + '</div>';
    } else if (O.gd === 'khoa') {
      html = '<h2 class="vc-h">🔑 Vòng cuối: đoán từ khóa</h2>' + (O.goiYKhoa ? '<div class="vc-oc-goi-y">💡 ' + esc(O.goiYKhoa) + '</div>' : '') + giay(O.conLai) + doanKhoa(true);
      gan = ganKhoa;
    } else if ((O.gd === 'xong' && O.giai) || (O.gd === 'het' && O.khoaDap)) {
      var w = O.gd === 'xong' ? O.giai : O.khoaDap;
      sg = oSang(s, d);
      html = '<div class="vc-kq xem"><h2>' + (O.gd === 'xong' ? 'Hàng ' + (O.hang + 1) : '🔑 Từ khóa') + '</h2><p><span class="hanzi">' + esc(w.han) + '</span> <b>' + esc(w.py) + '</b> · ' + esc(w.nghia) + ' ' + nutNghe(w.doc) + '</p></div>' + sg.html;
      if (O.gd === 'xong' && w.doc && loaDT(s)) tuDoc('ocx' + O.dapId, w.doc);
      gan = sg.gan;
    } else html = '<div class="vc-cho"><p>Nhìn lên màn chiếu nhé…</p></div>';
    if (O.gd !== 'khoa') html += doanKhoa(false);
    var g1 = gan;
    return { khoa: 'oc' + s.v, con: con, html: html, gan: function () { if (g1) g1(); if (O.gd !== 'khoa') ganKhoa(); } };
  }


  if (R.ma) moPhong(); else manMa();
})();
