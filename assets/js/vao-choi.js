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
  var MAU = { do: 'do', xanh: 'xanh', vang: 'vang', lam: 'lam' };

  var R = { ma: (location.search.match(/[?&]ma=(\d{4})/) || [])[1] || '', d: null, s: null, toi: null, nhan: 0, khoaVe: '', daGui: {}, loi: 0, hen: null };
  function khoaDoi() { return 'qm-choi-doi-' + R.ma; }
  try { var cu = sessionStorage.getItem('qm-choi-ma'); if (!R.ma && cu) R.ma = cu; } catch (e) {}

  // ---------- Nhập mã phòng ----------
  function manMa(loi) {
    dung(); R.d = null; R.s = null;
    el.innerHTML = '<div class="vc-the">' +
      '<div class="vc-ico">🎮</div><h2>Vào phòng chơi</h2>' +
      '<p>Nhập mã phòng 4 số trên màn chiếu</p>' +
      '<form class="vc-form-ma"><input class="vc-o-ma" inputmode="numeric" pattern="\\d{4}" maxlength="4" autocomplete="off" placeholder="1234" value="' + esc(R.ma) + '" aria-label="Mã phòng">' +
      '<button type="submit" class="btn gold">Vào phòng ›</button></form>' +
      (loi ? '<p class="vc-loi">' + esc(loi) + '</p>' : '') + '</div>';
    var f = el.querySelector('.vc-form-ma'), o = el.querySelector('.vc-o-ma');
    o.addEventListener('input', function () { o.value = o.value.replace(/\D/g, '').slice(0, 4); });
    f.addEventListener('submit', function (e) { e.preventDefault(); if (/^\d{4}$/.test(o.value)) { R.ma = o.value; moPhong(); } else o.focus(); });
  }

  // ---------- Chọn đội ----------
  function moPhong() {
    try { sessionStorage.setItem('qm-choi-ma', R.ma); } catch (e) {}
    el.innerHTML = '<div class="vc-the"><div class="tv-trong">Đang vào phòng ' + esc(R.ma) + '…</div></div>';
    P.xem(R.ma).then(function (o) {
      R.s = docTT(o.s);
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
  function chonDoi(i) {
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
    var t = el.querySelector('.vc-giay'); if (!t || !R.s) return;
    var con = Math.max(0, +t.dataset.con - Math.round((Date.now() - R.nhan) / 1000));
    t.textContent = con + 's'; t.classList.toggle('gap', con <= 3);
  }, 250);

  function gui(k, c, x) {
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
    R.daGui[k + c] = x;
    R.khoaVe = '';
    ve();
    if (navigator.vibrate) try { navigator.vibrate(30); } catch (e) {}
    P.gui(R.ma, R.d, k, c, x).catch(function () {
      delete R.daGui[k + c]; R.khoaVe = ''; ve();
      alert('Chưa gửi được (mạng). Bạn bấm lại nhé.');
    });
  }
  function daGui(k, c) {
    if (R.toi && R.toi[k] && R.toi[k].c === c) return R.toi[k].x;
    return R.daGui[k + c];
  }

  // ---------- Vẽ theo trạng thái ----------
  function ve() {
    var s = R.s, d = R.d;
    if (!s || !s.doi || !s.doi[d]) { el.querySelector('.vc-noi') && (el.querySelector('.vc-noi').innerHTML = '<div class="tv-trong">Chờ cô mở phòng…</div>'); return; }
    var toi = s.doi[d];
    var dau = '<div class="vc-dau-o ' + (MAU[toi.mau] || '') + '"><span>' + esc(toi.ico) + ' <b>' + esc(toi.ten) + '</b></span>' +
      (s.diem ? '<span class="vc-diem">' + s.diem[d] + ' điểm' + (s.phu && s.phu[d] ? ' · ' + esc(s.phu[d]) : '') + '</span>' : '') +
      '<button type="button" class="vc-link vc-doi-lai">Đổi đội</button></div>';
    var view = noiDung(s, d);
    if (view.khoa === R.khoaVe) { capNhatGiay(view); return; }
    R.khoaVe = view.khoa;
    // Giữ chữ đang gõ dở khi vẽ lại (ô cùng loại vẫn còn sau khi vẽ)
    var dangGo = document.activeElement && document.activeElement.tagName === 'INPUT' && el.contains(document.activeElement) ? document.activeElement : null;
    var goForm = dangGo && dangGo.form ? dangGo.form.className : '', goChu = dangGo ? dangGo.value : '';
    el.innerHTML = '<div class="vc-dau">' + dau + '</div><div class="vc-noi">' + view.html + '</div>';
    el.querySelector('.vc-doi-lai').addEventListener('click', function () { try { sessionStorage.removeItem(khoaDoi()); } catch (e) {} dung(); R.d = null; moPhong(); });
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
    if (s.gd === 'sanh' || !s.gd) return { khoa: 'sanh' + s.v, html: '<div class="vc-cho"><div class="vc-ico">✅</div><h2>Đã vào đội!</h2><p>Nhìn lên màn chiếu, chờ cô bắt đầu nhé.</p><p class="vc-nho">' + esc(s.ten || '') + '</p></div>' };
    if (s.gd === 'ket' && s.ket) {
      var toi = (s.ket.thu || []).filter(function (x) { return x.i === d; })[0], h = toi ? toi.hang : 0;
      return { khoa: 'ket' + s.v, rung: h === 1 ? [80, 60, 80, 60, 200] : null,
        html: '<div class="vc-cho"><div class="vc-ico">' + (['', '🥇', '🥈', '🥉', '🎖️'][h] || '🏁') + '</div><h2>' + (h === 1 ? 'Đội bạn vô địch!' : 'Hạng ' + h) + '</h2>' +
          '<ol class="vc-xep">' + (s.ket.thu || []).map(function (x) { return '<li' + (x.i === d ? ' class="toi"' : '') + '>' + tenDoi(s, x.i) + ' · ' + s.diem[x.i] + ' điểm</li>'; }).join('') + '</ol>' +
          '<p class="vc-nho">Chờ cô mở ván mới…</p></div>' };
    }
    if (s.tro === 'oc' && s.oc) return noiDungOC(s, d);
    var c = s.cau; if (!c) return { khoa: 'cho' + s.v, html: '<div class="tv-trong">Chờ câu hỏi…</div>' };
    var loai = s.loai && s.loai[d];
    if (c.mo) {
      if (loai) return { khoa: 'loai' + c.id, html: '<div class="vc-cho"><div class="vc-ico">📣</div><h2>Đội đã bị loại</h2><p>Cổ vũ các đội còn lại nhé! Cô có thể dùng quyền cứu trợ đấy.</p></div>' };
      if ((c.ai || []).indexOf(d) < 0) return { khoa: 'xem' + c.id + c.an.join(), con: c.conLai, html: '<div class="vc-cho"><div class="vc-ico">👀</div><h2>' + tenDoi(s, s.luot) + ' đang trả lời</h2><p>Câu nấc tiếp theo · nhìn lên màn chiếu nhé.</p>' + giay(c.conLai) + '</div>' };
      var da = daGui('dap', c.id);
      var tg = '';
      if (s.tro === 'tp' && c.tg && da == null) {
        tg = '<div class="vc-tg">' + (c.tg.nam ? '<button type="button" data-tg="5050">50:50</button>' : '') + (c.tg.doi ? '<button type="button" data-tg="doi">🔄 Đổi câu</button>' : '') + (c.tg.gio ? '<button type="button" data-tg="gio">⏱ +15 giây</button>' : '') + '</div>';
        if (!(c.tg.nam || c.tg.doi || c.tg.gio)) tg = '';
      }
      return { khoa: 'cau' + c.id + '|' + (da == null ? '' : da) + '|' + (c.an || []).join() + JSON.stringify(c.tg || ''), con: c.conLai,
        html: '<div class="vc-cau-dau"><span>' + esc(c.ico || '') + ' Câu ' + c.so + (c.tong ? '/' + c.tong : '') + '</span>' + giay(c.conLai) + '</div>' +
          '<div class="vc-de' + (c.deHan ? ' hanzi' : '') + '">' + esc(c.txt).replace(/\n/g, '<br>') + '</div>' +
          '<div class="vc-dap' + (c.han ? ' han' : '') + '">' + c.dap.map(function (x, i) {
            var an = (c.an || []).indexOf(i) >= 0;
            return '<button type="button" class="vc-dap-o' + (da != null && +da === i ? ' chon' : '') + (an ? ' an' : '') + '" data-i="' + i + '"' + (da != null || an ? ' disabled' : '') + '><b>' + CHU[i] + '</b><span>' + esc(x) + '</span></button>';
          }).join('') + '</div>' + tg +
          (da != null ? '<p class="vc-da-chon">Đã chọn <b>' + CHU[+da] + '</b> · chờ kết quả…</p>' : ''),
        gan: function () {
          el.querySelectorAll('.vc-dap-o:not([disabled])').forEach(function (b) { b.addEventListener('click', function () { gui('dap', c.id, b.dataset.i); }); });
          el.querySelectorAll('.vc-tg button').forEach(function (b) { b.addEventListener('click', function () { if (confirm('Dùng quyền trợ giúp này? Mỗi quyền chỉ dùng được 1 lần.')) { b.disabled = true; P.gui(R.ma, R.d, 'tg', c.id, b.dataset.tg).catch(function () { b.disabled = false; }); } }); });
        } };
    }
    // Câu đã đóng: kết quả
    var kq = c.kq ? c.kq[d] : '', dung = c.dap[c.dung];
    var tieuDe = kq === 'dung' ? '🎉 Chính xác!' : kq === 'sai' ? '😅 Chưa đúng' : kq === 'trong' ? '⏰ Hết giờ' : '👀 Đáp án';
    return { khoa: 'kq' + c.id + kq + s.v, rung: kq === 'dung' ? [60, 40, 60] : kq === 'sai' ? [200] : null,
      html: '<div class="vc-kq ' + (kq || 'xem') + '"><h2>' + tieuDe + '</h2><p>Đáp án: <b>' + CHU[c.dung] + '</b> <span class="' + (c.han ? 'hanzi' : '') + '">' + esc(dung) + '</span></p></div>' +
        '<p class="vc-nho">Nhìn lên màn chiếu, chờ câu tiếp theo…</p>' };
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
    var html = '', gan = null, con = O.conLai || null;
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
          '<p class="vc-nho">Nhìn gợi ý trên màn chiếu, gõ <b>phiên âm không dấu</b> (ü gõ <b>v</b>).</p>' +
          '<form class="vc-form vc-form-dap"><input type="text" autocomplete="off" autocapitalize="none" spellcheck="false" maxlength="20" placeholder="' + dai + ' chữ cái" aria-label="Đáp án">' +
          '<button type="submit" class="btn gold">Gửi</button></form>';
        gan = function () { var f = el.querySelector('.vc-form-dap'), i = f.querySelector('input'); setTimeout(function () { i.focus(); }, 50);
          f.addEventListener('submit', function (e) { e.preventDefault(); var v = i.value.trim(); if (v) gui('dap', O.dapId, v); }); };
      } else if (da != null) html = '<div class="vc-cho"><h2>Đã gửi: <b>' + esc(da) + '</b></h2><p>Chờ kết quả trên màn chiếu…</p></div>';
      else html = '<div class="vc-cho"><div class="vc-ico">👀</div><h2>' + (O.gd === 'hang' ? tenDoi(s, O.luot) + ' đang trả lời hàng ' + (O.hang + 1) : 'Các đội khác đang giành quyền') + '</h2>' + giay(O.conLai) + '</div>';
    } else if (O.gd === 'khoa') {
      html = '<h2 class="vc-h">🔑 Vòng cuối: đoán từ khóa</h2>' + giay(O.conLai) + doanKhoa(true);
      gan = ganKhoa;
    } else html = '<div class="vc-cho"><p>Nhìn lên màn chiếu nhé…</p></div>';
    if (O.gd !== 'khoa') html += doanKhoa(false);
    var g1 = gan;
    return { khoa: 'oc' + s.v, con: con, html: html, gan: function () { if (g1) g1(); if (O.gd !== 'khoa') ganKhoa(); } };
  }


  if (R.ma) moPhong(); else manMa();
})();
