/* =========================================================
   TRANG GIÁO VIÊN — Tiếng Trung Diệu Kỳ (quy chuẩn 12, bổ sung 04/11/2026)
   Đọc / ghi qua máy chủ tài khoản (bản 2026-11-04a, lệnh gv…): chỉ email giáo viên gọi được.
   Điểm từng lượt lấy từ máy chủ điểm (QM_API ?action=attempts), ghép với hồ sơ theo họ tên + lớp.
   Danh sách bài / phần dựng tự động: cấp đang mở trong MENU (header.js) → thẻ bài ở trang cấp → data/…/bai-N.json.
   ========================================================= */
(function () {
  var app = document.getElementById('gv-app'); if (!app) return;
  var src = document.currentScript.src, ROOT = src.substring(0, src.indexOf('assets/js/giao-vien.js'));
  var V = (src.match(/\?v=([^&#]+)/) || [])[1] || '';
  var nutTaiLai = document.querySelector('.gv-tai-lai'), dongCapNhat = document.querySelector('.gv-cap-nhat');

  // ---------------- tiện ích ----------------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function hai(n) { return ('0' + n).slice(-2); }
  function ngayGio(t, coNam) {
    if (!t) return '—';
    var d = new Date(t), thu = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
    return hai(d.getHours()) + ':' + hai(d.getMinutes()) + ' ' + thu + ' ' + hai(d.getDate()) + '/' + hai(d.getMonth() + 1) + (coNam ? '/' + d.getFullYear() : '');
  }
  function truoc(t) {
    if (!t) return 'chưa học';
    var s = (Date.now() - t) / 1000;
    if (s < 60) return 'vừa xong';
    if (s < 3600) return Math.floor(s / 60) + ' phút trước';
    if (s < 86400) return Math.floor(s / 3600) + ' giờ trước';
    if (s < 86400 * 30) return Math.floor(s / 86400) + ' ngày trước';
    return ngayGio(t, true).slice(9);
  }
  function chuoiDL(t) { var d = new Date(t); return d.getFullYear() + '-' + hai(d.getMonth() + 1) + '-' + hai(d.getDate()) + 'T' + hai(d.getHours()) + ':' + hai(d.getMinutes()); }
  function boDau(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase(); }
  function khoaHs(hoTen, lop) { return String(hoTen || '').replace(/\s+/g, ' ').trim().toLowerCase() + '|' + String(lop || '').replace(/\s+/g, ' ').trim().toLowerCase(); }
  function tenGon(hoTen) { return String(hoTen || '').trim(); }
  var toastHen;
  function bao(t, loi) {
    var b = document.querySelector('.gv-toast'); if (!b) { b = document.createElement('div'); b.className = 'gv-toast'; document.body.appendChild(b); }
    b.textContent = t; b.classList.toggle('loi', !!loi); b.classList.add('on');
    clearTimeout(toastHen); toastHen = setTimeout(function () { b.classList.remove('on'); }, loi ? 6000 : 3200);
  }

  // Gọi máy chủ tài khoản; quá 45 giây chưa có phản hồi thì báo (máy chủ có thể đã lưu, chỉ là trả lời chậm)
  function goiMC(a, d) {
    return Promise.race([QM_TK.goi(a, d), new Promise(function (_, hong) {
      setTimeout(function () { hong(new Error('Máy chủ trả lời chậm. Cô bấm ↻ Làm mới để xem đã lưu chưa nhé.')); }, 45000);
    })]);
  }

  // ---------------- chờ tai-khoan.js nạp xong ----------------
  var lanCho = 0;
  (function cho() {
    if (window.QM_TK && (QM_TK.goi || typeof window.QM_TK_API !== 'undefined' && !window.QM_TK_API)) return batDau();
    if (++lanCho > 100) return manLoi('Không tải được phần tài khoản. Cô tải lại trang thử nhé.');
    setTimeout(cho, 100);
  })();

  function manLoi(html) { app.innerHTML = '<div class="gv-the gv-giua"><div class="gv-ico">⚠️</div><p>' + html + '</p></div>'; }
  function batDau() {
    if (!window.QM_TK_API || !window.QM_GOOGLE_CLIENT_ID || !QM_TK.goi) return manLoi('Web chưa nối máy chủ tài khoản (assets/js/cau-hinh.js: QM_TK_API, QM_GOOGLE_CLIENT_ID).');
    if (!QM_TK.phien()) {
      app.innerHTML = '<div class="gv-the gv-giua"><div class="gv-ico">🧑‍🏫</div><h2>Đăng nhập tài khoản giáo viên</h2>' +
        '<p>Trang này chỉ mở với email giáo viên. Cô đăng nhập bằng Google như học sinh, máy chủ sẽ nhận ra email của cô.</p>' +
        '<button type="button" class="gv-nut chinh gv-dn">Đăng nhập bằng Google</button></div>';
      app.querySelector('.gv-dn').addEventListener('click', function () { QM_TK.dangNhap('Đăng nhập bằng email giáo viên để vào trang giáo viên.'); });
      // đăng nhập xong (tai-khoan.js lưu phiên) thì tự vào
      var t = setInterval(function () { if (QM_TK.phien()) { clearInterval(t); taiDuLieu(); } }, 600);
      return;
    }
    taiDuLieu();
  }

  // ---------------- dữ liệu ----------------
  var D = null, CAT = null, DIEM = null, DIEM_DANG = null, TAB = 'tong-quan';
  var LOC = { lop: '', tim: '', xep: 'hoat-dong' };
  try { var tabCu = sessionStorage.getItem('gv-tab'); if (tabCu) TAB = tabCu; } catch (e) {}
  function taiDuLieu(imLang) {
    if (!imLang) app.innerHTML = '<p class="gv-cho">⏳ Đang tải dữ liệu lớp học…</p>';
    nutTaiLai.hidden = true;
    return Promise.all([goiMC('gvDuLieu', {}), CAT ? Promise.resolve(CAT) : taiMucLuc()]).then(function (kq) {
      D = kq[0]; CAT = kq[1]; QM_TK.laGiaoVien();
      lamChiMuc(); nutTaiLai.hidden = false;
      dongCapNhat.textContent = 'Cập nhật ' + ngayGio(Date.now()).slice(0, 5);
      ve();
    }).catch(function (e) {
      var m = String(e && e.message || e);
      if (/không phải tài khoản giáo viên/i.test(m)) return manLoi('Email <b>' + esc((QM_TK.nguoiDung() || {}).email || '') + '</b> không phải tài khoản giáo viên. Cô đăng xuất rồi đăng nhập bằng email giáo viên nhé.<br><br><button type="button" class="gv-nut" onclick="QM_TK.moTaiKhoan()">Tài khoản</button>');
      if (/Lệnh không hợp lệ/i.test(m)) return manLoi('Máy chủ tài khoản đang chạy bản cũ. Cô dán mã <b>Code.gs bản 2026-11-04a</b> vào Apps Script, chạy hàm <b>caiDat</b> một lần, rồi <b>Triển khai → Quản lý các bản triển khai → Phiên bản mới</b>.');
      if (!QM_TK.phien()) return batDau();
      manLoi('Chưa tải được dữ liệu: ' + esc(m) + '<br><br><button type="button" class="gv-nut" onclick="location.reload()">Thử lại</button>');
    });
  }
  nutTaiLai.addEventListener('click', function () { taiDuLieu(true); });

  // Mục lục bài: cấp đang mở trong MENU → thẻ bài ở trang cấp → phần của bài (cùng luật tai-khoan.js)
  var TEN_CT = { 'chuong-trinh-hsk': 'HSK 3.0', 'chuong-trinh-hsk-2': 'HSK 2.0' };
  var CT_DATA = { 'chuong-trinh-hsk': 'data/bai/', 'chuong-trinh-hsk-2': 'data/hsk2/' };
  function taiMucLuc() {
    var caps = [];
    (window.QM_MENU || []).forEach(function (m) {
      if (!TEN_CT[m.link.replace(/\/$/, '')]) return;
      (m.con || []).forEach(function (c) { var x = c.link.match(/^(chuong-trinh-hsk(?:-2)?)\/(hsk[^\/]+)\/$/); if (x && !c.sapCo) caps.push({ ct: x[1], cap: x[2], ten: TEN_CT[x[1]] + ' · ' + c.ten }); });
    });
    return Promise.all(caps.map(function (c) {
      return fetch(ROOT + c.ct + '/' + c.cap + '/index.html').then(function (r) { return r.text(); }).then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html'), ds = [];
        doc.querySelectorAll('a.card[href]').forEach(function (a) {
          var slug = (a.getAttribute('href').match(/^(bai-\d+(?:-\d+)?)\/?$/) || [])[1]; if (!slug) return;
          var h3 = a.querySelector('h3'), tag = a.querySelector('.tag');
          ds.push({ slug: slug, tenNgan: (tag ? tag.textContent.trim() : slug), tieuDe: h3 ? h3.textContent.trim() : '' });
        });
        return Promise.all(ds.map(function (b, i) {
          return fetch(ROOT + CT_DATA[c.ct] + b.slug + '.json' + (V ? '?v=' + V : '')).then(function (r) { return r.json(); }).catch(function () { return {}; }).then(function (d) {
            var tien = c.ct === 'chuong-trinh-hsk-2' ? 'h2/' : '', khoa = tien + c.cap + '/' + b.slug;
            var maBai = String(d.maBaiTap || '').replace(/-bai-tap$/, ''), so = b.slug.match(/\d+/g);
            var truocDo = i > 0 ? ds[i - 1] : null;
            b.khoa = khoa; b.ct = c.ct; b.cap = c.cap; b.ten = (c.ct === 'chuong-trinh-hsk-2' ? 'HSK 2.0 · ' : '') + b.tenNgan; b.tenDai = d.tenViet || b.tieuDe;
            b.phan = [];
            if (+so[0] > 1 && truocDo) b.phan.push({ p: 'test-dau-gio', ten: 'Test đầu giờ · ' + truocDo.tenNgan, ma: (tien ? 'h2-' : '') + 'test-dau-gio-' + truocDo.slug.replace('bai-', 'bai') });
            b.phan.push({ p: 'tu-vung', ten: 'Từ vựng', ma: '' });
            if ((d.nguPhap || []).length) b.phan.push({ p: 'ngu-phap', ten: 'Ngữ pháp', ma: '' });
            (d.chang || []).forEach(function (ch) { var s = String(ch.so).replace('.', '-'); b.phan.push({ p: 'on-tap-' + s, ten: ch.ten || 'Ôn tập từ vựng ' + ch.so, ma: maBai ? maBai + '-on-tap-tu-vung-' + s : '' }); });
            b.phan.push({ p: 'bai-tap', ten: 'Bài tập', ma: maBai ? maBai + '-bai-tap' : '' });
            b.phan.forEach(function (p) { p.k = khoa + '/' + p.p; p.tenDu = b.ten + ' · ' + p.ten; });
          });
        })).then(function () { c.bai = ds; return c; });
      }).catch(function () { c.bai = []; return c; });
    }));
  }

  // ---------------- chỉ mục ----------------
  var HS = {}, LOP = {}, TT = {}, HOAT = {}, PHAN_TEN = {}, BAI_THEO_KHOA = {};
  function lamChiMuc() {
    HS = {}; LOP = {}; TT = {}; HOAT = {}; PHAN_TEN = {}; BAI_THEO_KHOA = {};
    D.lop.forEach(function (l) { LOP[l.maLop] = l; });
    D.hocSinh.forEach(function (h) { HS[h.hoSoId] = h; });
    D.trangThai.forEach(function (r) {
      (TT[r.hoSoId] = TT[r.hoSoId] || {})[r.phan] = r;
      if (r.t > (HOAT[r.hoSoId] || 0)) HOAT[r.hoSoId] = r.t;
      PHAN_TEN[r.phan] = r.tenPhan;
    });
    CAT.forEach(function (c) { c.bai.forEach(function (b) { BAI_THEO_KHOA[b.khoa] = b; b.phan.forEach(function (p) { PHAN_TEN[p.k] = p.tenDu; }); }); });
  }
  function giaoCuaHs(h) {                  // bài lớp của em đang được giao (đã tới giờ bắt đầu); một phần giao nhiều lần: lấy hạn muộn nhất
    var m = {}, bayGio = Date.now();
    D.giaoBai.forEach(function (g) { if (h.maLop && g.maLop === h.maLop && (!g.batDau || g.batDau <= bayGio) && (!m[g.phan] || g.hanNop > m[g.phan].hanNop)) m[g.phan] = g; });
    return Object.keys(m).map(function (k) { return m[k]; });
  }
  function hsTrongLop(maLop) { return D.hocSinh.filter(function (h) { return h.maLop === maLop; }); }
  function trangThaiGiao(g, h) {           // một em với một bài được giao
    var x = (TT[h.hoSoId] || {})[g.phan], bayGio = Date.now();
    if (x && x.tt === 'xong') return x.t > g.hanNop ? 'muon' : 'xong';
    if (g.hanNop < bayGio) return 'qua';
    return x ? 'dang' : 'chua';
  }
  var NHAN_TT = { xong: '✓ Đã xong', muon: '✓ Xong muộn', dang: '● Đang làm', chua: 'Chưa làm', qua: '⏰ Quá hạn' };

  // ---------------- khung trang ----------------
  var TABS = [['tong-quan', '📊 Tổng quan'], ['hoc-sinh', '🧑‍🎓 Học sinh'], ['lop', '🏫 Lớp & mở bài'], ['giao-bai', '📋 Giao bài']];
  function ve() {
    app.innerHTML = '<nav class="gv-tabs" role="tablist">' + TABS.map(function (t) {
      return '<button type="button" role="tab" class="gv-tab' + (t[0] === TAB ? ' on' : '') + '" data-tab="' + t[0] + '" aria-selected="' + (t[0] === TAB) + '">' + t[1] + '</button>';
    }).join('') + '</nav><div class="gv-noi"></div>';
    app.querySelector('.gv-tabs').addEventListener('click', function (e) { var b = e.target.closest('[data-tab]'); if (b) moTab(b.dataset.tab); });
    veTab();
  }
  function moTab(t) { TAB = t; try { sessionStorage.setItem('gv-tab', t); } catch (e) {} ve(); window.scrollTo({ top: app.offsetTop - 90, behavior: 'smooth' }); }
  function veTab() {
    var noi = app.querySelector('.gv-noi');
    ({ 'tong-quan': veTongQuan, 'hoc-sinh': veHocSinh, 'lop': veLop, 'giao-bai': veGiaoBai })[TAB](noi);
  }

  // =====================================================================
  // TỔNG QUAN
  // =====================================================================
  function nhomGiao(conHan) {               // gộp các dòng giao theo (lớp, phần, hạn)
    var bayGio = Date.now(), m = {};
    D.giaoBai.forEach(function (g) {
      if (conHan && g.hanNop < bayGio - 7 * 864e5) return;
      var k = g.maLop + '|' + g.phan + '|' + g.hanNop;
      if (!m[k]) m[k] = g;
    });
    return Object.keys(m).map(function (k) { return m[k]; }).sort(function (a, b) { return a.hanNop - b.hanNop; });
  }
  function veTongQuan(noi) {
    var bayGio = Date.now(), tong = D.hocSinh.length, trongLop = D.hocSinh.filter(function (h) { return h.maLop; }).length;
    var hoc7 = D.hocSinh.filter(function (h) { return HOAT[h.hoSoId] > bayGio - 7 * 864e5; }).length;
    var dsGiao = nhomGiao(true), dangGiao = dsGiao.filter(function (g) { return g.hanNop >= bayGio; }).length;
    var quaHan = [], chuY = {};
    dsGiao.forEach(function (g) {
      hsTrongLop(g.maLop).forEach(function (h) {
        if (trangThaiGiao(g, h) === 'qua') { quaHan.push([g, h]); (chuY[h.hoSoId] = chuY[h.hoSoId] || { h: h, qua: [] }).qua.push(g); }
      });
    });
    D.hocSinh.forEach(function (h) {
      if (h.maLop && !(HOAT[h.hoSoId] > bayGio - 7 * 864e5)) (chuY[h.hoSoId] = chuY[h.hoSoId] || { h: h, qua: [] }).nghi = true;
    });
    var dsChuY = Object.keys(chuY).map(function (k) { return chuY[k]; }).sort(function (a, b) { return b.qua.length - a.qua.length || (HOAT[a.h.hoSoId] || 0) - (HOAT[b.h.hoSoId] || 0); });
    var ganDay = D.trangThai.slice().sort(function (a, b) { return b.t - a.t; }).slice(0, 12);

    noi.innerHTML =
      '<div class="gv-o-so">' +
        oSo('Học sinh', tong, trongLop + ' em trong ' + D.lop.filter(function (l) { return !l.dong; }).length + ' lớp', 'xanh') +
        oSo('Học trong 7 ngày', hoc7, tong ? Math.round(hoc7 / tong * 100) + '% số em' : '', 'vang') +
        oSo('Bài đang giao', dangGiao, 'còn hạn', 'lam') +
        oSo('Quá hạn chưa xong', quaHan.length, 'lượt em × bài', quaHan.length ? 'do' : 'xam') +
      '</div>' +
      '<div class="gv-hai-cot">' +
        '<div class="gv-the"><div class="gv-the-dau"><h3>📋 Bài đang giao</h3><button type="button" class="gv-nut nho" data-di="giao-bai">+ Giao bài</button></div>' +
          (dsGiao.length ? '<div class="gv-ds-giao">' + dsGiao.map(dongGiao).join('') + '</div>' : '<p class="gv-trong">Chưa giao bài nào. Bấm <b>+ Giao bài</b> để giao cho lớp.</p>') + '</div>' +
        '<div class="gv-the"><div class="gv-the-dau"><h3>⚠️ Cần chú ý</h3></div>' +
          (dsChuY.length ? '<ul class="gv-ds-chu-y">' + dsChuY.slice(0, 12).map(function (c) {
            return '<li><button type="button" class="gv-ten-hs" data-hs="' + esc(c.h.hoSoId) + '">' + esc(c.h.hoTen) + '</button> <small>' + esc(c.h.lop) + '</small>' +
              (c.qua.length ? '<span class="gv-chip do">' + c.qua.length + ' bài quá hạn</span>' : '') +
              (c.nghi ? '<span class="gv-chip xam">' + (HOAT[c.h.hoSoId] ? 'nghỉ học ' + truoc(HOAT[c.h.hoSoId]).replace(' trước', '') : 'chưa học lần nào') + '</span>' : '') + '</li>';
          }).join('') + '</ul>' + (dsChuY.length > 12 ? '<p class="gv-trong">… và ' + (dsChuY.length - 12) + ' em nữa</p>' : '')
            : '<p class="gv-trong">Không có em nào cần chú ý. 🎉</p>') +
          '<div class="gv-the-dau" style="margin-top:18px"><h3>🕒 Hoạt động gần đây</h3></div>' +
          (ganDay.length ? '<ul class="gv-ds-gan">' + ganDay.map(function (r) {
            var h = HS[r.hoSoId] || { hoTen: '?' };
            return '<li><span class="gv-dot ' + (r.tt === 'xong' ? 'xong' : 'dang') + '"></span><span><button type="button" class="gv-ten-hs" data-hs="' + esc(r.hoSoId) + '">' + esc(h.hoTen) + '</button> ' +
              (r.tt === 'xong' ? 'xong' : 'đang học') + ' <i>' + esc(PHAN_TEN[r.phan] || r.tenPhan) + '</i></span><small>' + truoc(r.t) + '</small></li>';
          }).join('') + '</ul>' : '<p class="gv-trong">Chưa có hoạt động.</p>') +
        '</div>' +
      '</div>';
    noi.addEventListener('click', function (e) {
      var di = e.target.closest('[data-di]'); if (di) return moTab(di.dataset.di);
      var hs = e.target.closest('[data-hs]'); if (hs) return moHocSinh(hs.dataset.hs);
      var g = e.target.closest('.gv-giao-dong > summary'); if (g) return;
    });
  }
  function oSo(nhan, so, phu, mau) { return '<div class="gv-o ' + mau + '"><small>' + nhan + '</small><b>' + so + '</b><span>' + esc(phu) + '</span></div>'; }
  function dongGiao(g) {
    var ds = hsTrongLop(g.maLop), dem = { xong: 0, muon: 0, dang: 0, chua: 0, qua: 0 }, l = LOP[g.maLop] || { tenLop: g.maLop };
    var hang = ds.map(function (h) { var t = trangThaiGiao(g, h); dem[t]++; return { h: h, t: t }; })
      .sort(function (a, b) { return 'qua chua dang muon xong'.indexOf(a.t) - 'qua chua dang muon xong'.indexOf(b.t) || a.h.hoTen.localeCompare(b.h.hoTen, 'vi'); });
    var xong = dem.xong + dem.muon, pt = ds.length ? Math.round(xong / ds.length * 100) : 0, het = g.hanNop < Date.now();
    return '<details class="gv-giao-dong"><summary><span class="gv-gd-chu"><b>' + esc(PHAN_TEN[g.phan] || g.tenPhan) + '</b>' +
      '<small>' + esc(l.tenLop) + ' · ' + (het ? 'Đã hết hạn ' : 'Hạn ') + ngayGio(g.hanNop) + '</small></span>' +
      '<span class="gv-gd-so"><b>' + xong + '/' + ds.length + '</b><i><em style="width:' + pt + '%"></em></i></span></summary>' +
      (hang.length ? '<ul class="gv-gd-hs">' + hang.map(function (x) {
        return '<li><button type="button" class="gv-ten-hs" data-hs="' + esc(x.h.hoSoId) + '">' + esc(x.h.hoTen) + '</button><span class="gv-chip ' + x.t + '">' + NHAN_TT[x.t] + '</span></li>';
      }).join('') + '</ul>' : '<p class="gv-trong">Lớp chưa có học sinh.</p>') + (g.ghiChu ? '<p class="gv-ghi">📝 ' + esc(g.ghiChu) + '</p>' : '') + '</details>';
  }

  // =====================================================================
  // HỌC SINH
  // =====================================================================
  function soLieuHs(h) {
    var t = TT[h.hoSoId] || {}, xong = 0, dang = 0;
    Object.keys(t).forEach(function (k) { t[k].tt === 'xong' ? xong++ : dang++; });
    var giao = giaoCuaHs(h);
    var gx = 0, gq = 0;
    giao.forEach(function (g) { var s = trangThaiGiao(g, h); if (s === 'xong' || s === 'muon') gx++; if (s === 'qua') gq++; });
    return { xong: xong, dang: dang, giao: giao.length, giaoXong: gx, quaHan: gq, hoat: HOAT[h.hoSoId] || 0 };
  }
  function locHs() {
    var tim = boDau(LOC.tim).trim();
    var ds = D.hocSinh.filter(function (h) {
      if (LOC.lop === '-' ? h.maLop : LOC.lop && h.maLop !== LOC.lop) return false;
      return !tim || boDau(h.hoTen + ' ' + h.email + ' ' + h.lop).indexOf(tim) >= 0;
    }).map(function (h) { return { h: h, s: soLieuHs(h) }; });
    var xep = { 'hoat-dong': function (a, b) { return b.s.hoat - a.s.hoat; }, 'ten': function (a, b) { return a.h.hoTen.split(' ').pop().localeCompare(b.h.hoTen.split(' ').pop(), 'vi') || a.h.hoTen.localeCompare(b.h.hoTen, 'vi'); },
      'xong': function (a, b) { return b.s.xong - a.s.xong; }, 'qua-han': function (a, b) { return b.s.quaHan - a.s.quaHan || b.s.hoat - a.s.hoat; } }[LOC.xep];
    return ds.sort(xep);
  }
  function chonLopHtml(giaTri, coTatCa, ten) {
    return '<select class="gv-chon" name="' + (ten || 'lop') + '">' + (coTatCa ? '<option value="">Tất cả lớp</option>' : '<option value="">— Không có lớp (tự học) —</option>') +
      D.lop.filter(function (l) { return !l.dong || l.maLop === giaTri; }).map(function (l) { return '<option value="' + esc(l.maLop) + '"' + (l.maLop === giaTri ? ' selected' : '') + '>' + esc(l.tenLop) + ' (' + esc(l.maLop) + ')</option>'; }).join('') +
      (coTatCa ? '<option value="-"' + (giaTri === '-' ? ' selected' : '') + '>Chưa vào lớp nào</option>' : '') + '</select>';
  }
  function veHocSinh(noi) {
    noi.innerHTML = '<div class="gv-the"><div class="gv-loc">' + chonLopHtml(LOC.lop, true) +
      '<input type="search" class="gv-tim" placeholder="🔎 Tìm tên, email…" value="' + esc(LOC.tim) + '">' +
      '<select class="gv-chon gv-xep"><option value="hoat-dong">Học gần nhất</option><option value="ten">Theo tên</option><option value="xong">Xong nhiều phần nhất</option><option value="qua-han">Nhiều bài quá hạn</option></select>' +
      '<button type="button" class="gv-nut nho gv-csv">⬇ Tải bảng (Excel)</button></div><div class="gv-bang-hs"></div></div>';
    noi.querySelector('.gv-xep').value = LOC.xep;
    var veBang = function () {
      var ds = locHs(), o = noi.querySelector('.gv-bang-hs');
      if (!ds.length) { o.innerHTML = '<p class="gv-trong">' + (D.hocSinh.length ? 'Không có em nào khớp bộ lọc.' : 'Chưa có học sinh nào tạo hồ sơ. Cô đưa mã lớp cho các em: đăng nhập Google → tạo hồ sơ → nhập mã lớp.') + '</p>'; return; }
      o.innerHTML = '<p class="gv-dem">' + ds.length + ' học sinh</p><table class="gv-bang"><thead><tr><th>Học sinh</th><th>Lớp</th><th>Đã xong</th><th>Đang học</th><th>Bài cô giao</th><th>Học gần nhất</th></tr></thead><tbody>' +
        ds.map(function (x) {
          var h = x.h, s = x.s;
          return '<tr data-hs="' + esc(h.hoSoId) + '" tabindex="0"><td data-n="Học sinh"><b>' + esc(h.hoTen) + '</b><small>' + esc(h.email) + '</small></td>' +
            '<td data-n="Lớp"><span>' + esc(h.lop) + (h.maLop ? '' : ' <span class="gv-chip xam">tự ghi</span>') + '</span></td>' +
            '<td data-n="Đã xong"><span><b class="gv-so-xong">' + s.xong + '</b> phần</span></td><td data-n="Đang học"><span>' + s.dang + ' phần</span></td>' +
            '<td data-n="Bài cô giao"><span>' + (s.giao ? s.giaoXong + '/' + s.giao + (s.quaHan ? ' <span class="gv-chip qua">' + s.quaHan + ' quá hạn</span>' : '') : '—') + '</span></td>' +
            '<td data-n="Học gần nhất">' + truoc(s.hoat) + '</td></tr>';
        }).join('') + '</tbody></table>';
    };
    veBang();
    noi.querySelector('select[name=lop]').addEventListener('change', function (e) { LOC.lop = e.target.value; veBang(); });
    noi.querySelector('.gv-tim').addEventListener('input', function (e) { LOC.tim = e.target.value; veBang(); });
    noi.querySelector('.gv-xep').addEventListener('change', function (e) { LOC.xep = e.target.value; veBang(); });
    noi.querySelector('.gv-csv').addEventListener('click', taiCsv);
    noi.querySelector('.gv-bang-hs').addEventListener('click', function (e) { var r = e.target.closest('[data-hs]'); if (r) moHocSinh(r.dataset.hs); });
    noi.querySelector('.gv-bang-hs').addEventListener('keydown', function (e) { var r = e.target.closest('[data-hs]'); if (r && e.key === 'Enter') moHocSinh(r.dataset.hs); });
  }
  function taiCsv() {
    var dong = [['Họ tên', 'Email', 'Lớp', 'Mã lớp', 'Phần đã xong', 'Phần đang học', 'Bài giao đã xong', 'Bài giao', 'Quá hạn', 'Học gần nhất']];
    locHs().forEach(function (x) { var h = x.h, s = x.s; dong.push([h.hoTen, h.email, h.lop, h.maLop, s.xong, s.dang, s.giaoXong, s.giao, s.quaHan, s.hoat ? ngayGio(s.hoat, true) : '']); });
    var csv = '﻿' + dong.map(function (r) { return r.map(function (c) { c = String(c == null ? '' : c); return /[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c; }).join(','); }).join('\r\n');
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = 'hoc-sinh-' + chuoiDL(Date.now()).slice(0, 10) + '.csv'; document.body.appendChild(a); a.click(); a.remove();
  }

  // ---------- Chi tiết một học sinh ----------
  function taiDiem() {
    if (DIEM) return Promise.resolve(DIEM);
    if (!window.QM_API) return Promise.resolve([]);
    return DIEM_DANG || (DIEM_DANG = fetch(window.QM_API + '?action=attempts').then(function (r) { return r.json(); })
      .then(function (d) { DIEM = d && d.ok ? d.attempts || [] : []; return DIEM; }).catch(function () { DIEM_DANG = null; return null; }));
  }
  var pop;
  function moBang(html) {
    if (!pop) {
      pop = document.createElement('div'); pop.className = 'gv-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-modal', 'true'); document.body.appendChild(pop);
      pop.addEventListener('click', function (e) { if (e.target === pop || e.target.closest('.gv-pop-x')) dongBang(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pop.classList.contains('on')) dongBang(); });
    }
    pop.innerHTML = '<div class="gv-pop-in"><button type="button" class="gv-pop-x" aria-label="Đóng">✕</button>' + html + '</div>';
    pop.classList.add('on'); document.body.classList.add('gv-mo'); pop.scrollTop = 0;
    return pop.querySelector('.gv-pop-in');
  }
  function dongBang() { if (pop) pop.classList.remove('on'); document.body.classList.remove('gv-mo'); }
  function moHocSinh(id) {
    var h = HS[id]; if (!h) return;
    var t = TT[id] || {}, s = soLieuHs(h);
    // tiến độ theo bài: mọi bài trong mục lục có ít nhất một phần đã động tới, cộng bài được giao
    var giao = giaoCuaHs(h).sort(function (a, b) { return b.hanNop - a.hanNop; });
    var baiCo = [];
    CAT.forEach(function (c) { c.bai.forEach(function (b) {
      if (b.phan.some(function (p) { return t[p.k]; }) || giao.some(function (g) { return g.phan.indexOf(b.khoa + '/') === 0; })) baiCo.push(b);
    }); });
    var khac = Object.keys(t).filter(function (k) { return !baiCo.some(function (b) { return k.indexOf(b.khoa + '/') === 0; }); });
    var b = moBang('<div class="gv-hs-dau"><div class="gv-hs-ava">' + esc(tenGon(h.hoTen).split(' ').pop().charAt(0)) + '</div><div><h3>' + esc(h.hoTen) + '</h3>' +
        '<small>' + esc(h.email) + ' · tạo hồ sơ ' + ngayGio(h.taoLuc, true).slice(9) + '</small></div></div>' +
      '<div class="gv-o-so nho">' + oSo('Đã xong', s.xong, 'phần', 'xanh') + oSo('Đang học', s.dang, 'phần', 'vang') + oSo('Bài cô giao', s.giao ? s.giaoXong + '/' + s.giao : '—', s.quaHan ? s.quaHan + ' quá hạn' : 'đã xong', s.quaHan ? 'do' : 'lam') + oSo('Học gần nhất', '', truoc(s.hoat), 'xam') + '</div>' +
      '<div class="gv-hs-lop"><label>Lớp ' + chonLopHtml(h.maLop, false, 'chuyen') + '</label><button type="button" class="gv-nut nho chinh gv-luu-lop">Chuyển lớp</button>' +
        (h.maLop ? '' : '<small>Hiện em tự ghi lớp: <b>' + esc(h.lop) + '</b></small>') + '</div>' +
      (giao.length ? '<h4>📋 Bài cô giao</h4><ul class="gv-gd-hs">' + giao.map(function (g) {
        var tt = trangThaiGiao(g, h); return '<li><span>' + esc(PHAN_TEN[g.phan] || g.tenPhan) + ' <small>· hạn ' + ngayGio(g.hanNop) + '</small></span><span class="gv-chip ' + tt + '">' + NHAN_TT[tt] + '</span></li>';
      }).join('') + '</ul>' : '') +
      '<h4>📚 Tiến độ từng bài</h4>' + (baiCo.length ? '<div class="gv-tien-do">' + baiCo.map(function (bai) {
        var xong = bai.phan.filter(function (p) { return t[p.k] && t[p.k].tt === 'xong'; }).length;
        return '<div class="gv-td-bai"><div class="gv-td-ten"><b>' + esc(bai.ten) + '</b><small>' + esc(bai.tenDai) + '</small><span>' + xong + '/' + bai.phan.length + '</span></div><div class="gv-td-phan">' +
          bai.phan.map(function (p) { var x = t[p.k]; return '<span class="gv-ph ' + (x ? (x.tt === 'xong' ? 'xong' : 'dang') : '') + '" title="' + esc(p.ten + (x ? ' · ' + (x.tt === 'xong' ? 'xong' : 'đang học') + ' ' + ngayGio(x.t) : ' · chưa mở')) + '">' + (x ? (x.tt === 'xong' ? '✓ ' : '● ') : '') + esc(p.ten.replace(/^Ôn tập từ vựng /, 'Ôn ').replace(/^Test đầu giờ.*/, 'Test')) + '</span>'; }).join('') + '</div></div>';
      }).join('') + '</div>' : '<p class="gv-trong">Em chưa mở phần nào của bài học.</p>') +
      (khac.length ? '<p class="gv-trong">Phần khác: ' + khac.map(function (k) { return esc(PHAN_TEN[k] || k) + (t[k].tt === 'xong' ? ' ✓' : ''); }).join(' · ') + '</p>' : '') +
      '<h4>🎯 Điểm các lượt làm</h4><div class="gv-diem"><p class="gv-cho">⏳ Đang tải điểm…</p></div>');
    b.querySelector('.gv-luu-lop').addEventListener('click', function (e) {
      var ma = b.querySelector('select[name=chuyen]').value, nut = e.target; nut.disabled = true;
      goiMC('gvChuyenLop', { hoSoId: [id], maLop: ma }).then(function () {
        bao(ma ? 'Đã chuyển ' + h.hoTen + ' sang lớp ' + LOP[ma].tenLop : 'Đã bỏ ' + h.hoTen + ' khỏi lớp'); dongBang(); taiDuLieu(true);
      }).catch(function (x) { nut.disabled = false; bao('⚠️ ' + x.message, true); });
    });
    taiDiem().then(function (ds) {
      var o = b.querySelector('.gv-diem'); if (!o) return;
      if (ds == null) { o.innerHTML = '<p class="gv-trong">Chưa tải được điểm từ máy chủ điểm.</p>'; return; }
      var k = khoaHs(h.hoTen, h.lop), cua = ds.filter(function (r) { return khoaHs(r.hoTen, r.lop) === k; }).sort(function (x, y) { return new Date(y.thoiDiem) - new Date(x.thoiDiem); });
      if (!cua.length) { o.innerHTML = '<p class="gv-trong">Chưa có lượt nộp nào mang tên <b>' + esc(h.hoTen) + '</b>, lớp <b>' + esc(h.lop) + '</b>.</p>'; return; }
      o.innerHTML = '<table class="gv-bang gon"><thead><tr><th>Bài</th><th>Lượt</th><th>Điểm</th><th>Thời gian</th><th>Lúc nộp</th></tr></thead><tbody>' + cua.slice(0, 60).map(function (r) {
        var pt = +r.total ? Math.round(+r.score / +r.total * 100) : 0;
        return '<tr><td data-n="Bài">' + esc(r.lessonTitle || r.lesson) + '</td><td data-n="Lượt">' + esc(r.attemptNo) + '</td>' +
          '<td data-n="Điểm"><b class="gv-diem-so ' + (pt >= 80 ? 'tot' : pt >= 50 ? 'kha' : 'yeu') + '">' + esc(r.score) + '/' + esc(r.total) + '</b></td>' +
          '<td data-n="Thời gian">' + Math.floor((+r.durationSeconds || 0) / 60) + ':' + hai((+r.durationSeconds || 0) % 60) + '</td><td data-n="Lúc nộp">' + ngayGio(new Date(r.thoiDiem).getTime()) + '</td></tr>';
      }).join('') + '</tbody></table>' + (cua.length > 60 ? '<p class="gv-trong">Hiện 60 lượt gần nhất / ' + cua.length + '.</p>' : '');
    });
  }

  // =====================================================================
  // LỚP & MỞ BÀI
  // =====================================================================
  var LOP_MO = '';
  function veLop(noi) {
    var ds = D.lop.slice().sort(function (a, b) { return (a.dong - b.dong) || b.taoLuc - a.taoLuc; });
    noi.innerHTML = '<div class="gv-the"><div class="gv-the-dau"><h3>➕ Tạo lớp mới</h3></div><form class="gv-tao-lop">' +
        '<label>Tên lớp<input name="tenLop" required maxlength="40" placeholder="VD: HSK1 tối 2-4-6"></label>' +
        '<label>Mã lớp <span class="gv-phu">(bỏ trống: tự tạo)</span><input name="maMoi" maxlength="16" placeholder="VD: HSK1T3" style="text-transform:uppercase"></label>' +
        '<label class="rong">Ghi chú<input name="ghiChu" maxlength="200" placeholder="Lịch học, phòng…"></label>' +
        '<button type="submit" class="gv-nut chinh">Tạo lớp</button></form>' +
        '<p class="gv-trong">Học sinh vào lớp bằng cách: đăng nhập Google → tạo / sửa hồ sơ → nhập <b>mã lớp</b>. Em trong lớp chỉ vào được các bài cô đã mở cho lớp.</p></div>' +
      (ds.length ? ds.map(theLop).join('') : '<div class="gv-the"><p class="gv-trong">Chưa có lớp nào.</p></div>');
    noi.querySelector('.gv-tao-lop').addEventListener('submit', function (e) {
      e.preventDefault(); var f = e.target, n = f.querySelector('button'); n.disabled = true; n.textContent = '⏳ Đang tạo…';
      goiMC('gvLuuLop', { tenLop: f.tenLop.value, maMoi: f.maMoi.value, ghiChu: f.ghiChu.value }).then(function (d) {
        bao('Đã tạo lớp · mã ' + d.maLop); LOP_MO = d.maLop;
        if (d.lop) { D.lop = d.lop; lamChiMuc(); ve(); }        // hiện lớp mới ngay, rồi tải lại toàn bộ ở nền
        taiDuLieu(true);
      }).catch(function (x) { n.disabled = false; n.textContent = 'Tạo lớp'; bao('⚠️ ' + x.message, true); });
    });
    noi.addEventListener('click', bamLop);
    noi.addEventListener('change', doiMoBai);
  }
  function theLop(l) {
    var ds = hsTrongLop(l.maLop), mo = D.moBai.filter(function (m) { return m.maLop === l.maLop; }).map(function (m) { return m.bai; });
    return '<div class="gv-the gv-lop' + (l.dong ? ' dong' : '') + '" data-lop="' + esc(l.maLop) + '">' +
      '<div class="gv-lop-dau"><div><h3>' + esc(l.tenLop) + (l.dong ? ' <span class="gv-chip xam">đã đóng</span>' : '') + '</h3>' +
        '<small>' + ds.length + ' học sinh' + (choLop(l.maLop).length ? ' · <b>' + choLop(l.maLop).length + ' email đang chờ</b>' : '') + ' · mở ' + mo.length + ' bài' + (l.ghiChu ? ' · ' + esc(l.ghiChu) : '') + '</small></div>' +
        '<button type="button" class="gv-ma" data-l="chep" title="Chép mã lớp"><small>Mã lớp</small><b>' + esc(l.maLop) + '</b><span>⧉ chép</span></button></div>' +
      '<div class="gv-lop-nut">' + (l.dong ? '' : '<button type="button" class="gv-nut nho chinh" data-l="them">➕ Thêm học sinh</button>') + '<button type="button" class="gv-nut nho" data-l="hs">🧑‍🎓 Xem học sinh</button><button type="button" class="gv-nut nho" data-l="sua">✏️ Đổi tên</button>' +
        '<button type="button" class="gv-nut nho' + (l.dong ? '' : ' nhe') + '" data-l="dong">' + (l.dong ? '↺ Mở lại lớp' : '🔒 Đóng lớp') + '</button></div>' +
      '<details class="gv-mo-bai"' + (LOP_MO === l.maLop ? ' open' : '') + '><summary>📖 Mở bài cho lớp <span class="gv-chip ' + (mo.length ? 'xong' : 'xam') + '">' + mo.length + ' bài đã mở</span></summary>' +
        CAT.map(function (c) {
          return '<div class="gv-mb-cap"><div class="gv-mb-cap-dau"><b>' + esc(c.ten) + '</b><span><button type="button" class="gv-lk" data-l="mo-het" data-cap="' + esc(c.ct + '/' + c.cap) + '">Mở cả cấp</button> · <button type="button" class="gv-lk" data-l="khoa-het" data-cap="' + esc(c.ct + '/' + c.cap) + '">Khoá cả cấp</button></span></div>' +
            '<div class="gv-mb-ds">' + c.bai.map(function (b) {
              var on = mo.indexOf(b.khoa) >= 0;
              return '<label class="gv-cong' + (on ? ' on' : '') + '"><input type="checkbox" data-bai="' + esc(b.khoa) + '"' + (on ? ' checked' : '') + '><span class="gv-cong-nut"></span><span><b>' + esc(b.tenNgan) + '</b><small>' + esc(b.tieuDe) + '</small></span></label>';
            }).join('') + '</div></div>';
        }).join('') + '<p class="gv-trong">Bật là mở ngay cho lớp (học sinh thấy sau tối đa vài phút, hoặc khi tải lại trang). Giao bài thuộc bài chưa mở thì bài đó tự mở.</p></details></div>';
  }
  function bamLop(e) {
    var n = e.target.closest('[data-l]'), the = e.target.closest('[data-lop]'); if (!n || !the) return;
    var ma = the.dataset.lop, l = LOP[ma];
    if (n.dataset.l === 'chep') {
      var xong = function () { bao('Đã chép mã lớp ' + ma); };
      if (navigator.clipboard) navigator.clipboard.writeText(ma).then(xong, function () { prompt('Mã lớp', ma); }); else prompt('Mã lớp', ma);
    } else if (n.dataset.l === 'hs') { LOC.lop = ma; moTab('hoc-sinh'); }
    else if (n.dataset.l === 'them') moThemHs(ma);
    else if (n.dataset.l === 'sua') {
      var ten = prompt('Tên mới của lớp (mã lớp giữ nguyên):', l.tenLop); if (!ten || ten.trim() === l.tenLop) return;
      goiMC('gvLuuLop', { maLop: ma, tenLop: ten }).then(function () { bao('Đã đổi tên lớp'); taiDuLieu(true); }).catch(function (x) { bao('⚠️ ' + x.message, true); });
    } else if (n.dataset.l === 'dong') {
      if (!l.dong && !confirm('Đóng lớp ' + l.tenLop + '? Học sinh mới không vào được bằng mã này nữa. Học sinh đã trong lớp vẫn giữ nguyên.')) return;
      goiMC('gvLuuLop', { maLop: ma, dong: !l.dong }).then(function () { bao(l.dong ? 'Đã mở lại lớp' : 'Đã đóng lớp'); taiDuLieu(true); }).catch(function (x) { bao('⚠️ ' + x.message, true); });
    } else if (n.dataset.l === 'mo-het' || n.dataset.l === 'khoa-het') {
      var c = CAT.filter(function (c) { return c.ct + '/' + c.cap === n.dataset.cap; })[0];
      guiMoBai(ma, c.bai.map(function (b) { return b.khoa; }), n.dataset.l === 'mo-het');
    }
  }
  function doiMoBai(e) {
    var i = e.target.closest('input[data-bai]'), the = e.target.closest('[data-lop]'); if (!i || !the) return;
    i.parentNode.classList.toggle('on', i.checked);
    guiMoBai(the.dataset.lop, [i.dataset.bai], i.checked);
  }
  function guiMoBai(ma, ds, mo) {
    var tenBai = {}; ds.forEach(function (k) { var b = BAI_THEO_KHOA[k]; if (b) tenBai[k] = b.ten + (b.tenDai ? ' · ' + b.tenDai : ''); });
    LOP_MO = ma;
    goiMC('gvMoBai', { maLop: ma, bai: ds, mo: mo, tenBai: tenBai }).then(function (d) {
      D.moBai = D.moBai.filter(function (m) { return m.maLop !== ma; }).concat(d.moBai.map(function (b) { return { maLop: ma, bai: b }; }));
      bao((mo ? 'Đã mở ' : 'Đã khoá ') + (ds.length > 1 ? ds.length + ' bài' : (BAI_THEO_KHOA[ds[0]] || {}).ten || ds[0]) + ' cho lớp ' + LOP[ma].tenLop);
      if (ds.length > 1) ve(); else { var c = app.querySelector('[data-lop="' + ma + '"] .gv-mo-bai summary .gv-chip'); if (c) { c.textContent = d.moBai.length + ' bài đã mở'; c.className = 'gv-chip ' + (d.moBai.length ? 'xong' : 'xam'); } }
    }).catch(function (x) { bao('⚠️ ' + x.message, true); taiDuLieu(true); });
  }

  // ---------- Thêm học sinh vào lớp: chọn em đã có hồ sơ · nhập trước email ----------
  function choLop(maLop) { return (D.moiLop || []).filter(function (m) { return m.maLop === maLop && !m.daNhan; }); }
  function moThemHs(ma) {
    var l = LOP[ma], ngoai = D.hocSinh.filter(function (h) { return h.maLop !== ma; })
      .sort(function (a, b) { return (a.maLop ? 1 : 0) - (b.maLop ? 1 : 0) || a.hoTen.localeCompare(b.hoTen, 'vi'); });
    var chon = {};
    var b = moBang('<h3 class="gv-pop-tieu">➕ Thêm học sinh vào lớp ' + esc(l.tenLop) + '</h3>' +
      '<div class="gv-tabs gv-tabs-nho" role="tablist"><button type="button" class="gv-tab on" data-th="co">Em đã có hồ sơ</button><button type="button" class="gv-tab" data-th="email">Nhập trước email</button></div>' +
      '<div class="gv-th" data-th="co">' + (ngoai.length ? '<input type="search" class="gv-tim gv-tim-th" placeholder="🔎 Tìm tên, email, lớp…" style="width:100%;margin-bottom:8px">' +
        '<div class="gv-ds-chon">' + ngoai.map(function (h) {
          return '<label class="gv-o-chon" data-tim="' + esc(boDau(h.hoTen + ' ' + h.email + ' ' + h.lop)) + '"><input type="checkbox" data-hs="' + esc(h.hoSoId) + '"><span><b>' + esc(h.hoTen) + '</b><small>' + esc(h.email) + ' · ' +
            (h.maLop ? 'đang ở lớp ' + esc(h.lop) : 'tự ghi: ' + esc(h.lop)) + '</small></span></label>';
        }).join('') + '</div><button type="button" class="gv-nut chinh to gv-xep" disabled>Xếp vào lớp</button>'
        : '<p class="gv-trong">Em nào cũng đã ở lớp này. Em chưa đăng nhập lần nào thì dùng tab <b>Nhập trước email</b>.</p>') + '</div>' +
      '<div class="gv-th" data-th="email" hidden><p class="gv-trong" style="margin-top:0">Mỗi dòng một em: <b>email, Họ tên</b> (có thể dán thẳng hai cột từ Excel). Email đã có hồ sơ thì vào lớp ngay; chưa có thì em đăng nhập Google lần đầu sẽ được điền sẵn họ tên + mã lớp.</p>' +
        '<textarea class="gv-dan" rows="6" placeholder="an.nguyen@gmail.com, Nguyễn Văn An&#10;binh123@gmail.com, Trần Thị Bình"></textarea>' +
        '<button type="button" class="gv-nut chinh to gv-gui-email">Thêm vào lớp</button><div class="gv-kq"></div>' +
        '<h4>📨 Email đang chờ <span class="gv-dem-cho"></span></h4><ul class="gv-gd-hs gv-ds-cho"></ul></div>');
    function veCho() {
      var ds = choLop(ma), o = b.querySelector('.gv-ds-cho');
      b.querySelector('.gv-dem-cho').textContent = ds.length ? '(' + ds.length + ')' : '';
      o.innerHTML = ds.length ? ds.map(function (m) { return '<li><span>' + esc(m.hoTen || '—') + ' <small>· ' + esc(m.email) + '</small></span><button type="button" class="gv-lk" data-xoa="' + esc(m.email) + '">Bỏ</button></li>'; }).join('')
        : '<li><span class="gv-trong">Không có email nào đang chờ.</span></li>';
    }
    veCho();
    b.addEventListener('click', function (e) {
      var t = e.target.closest('[data-th]');
      if (t && t.classList.contains('gv-tab')) {
        b.querySelectorAll('.gv-tab').forEach(function (x) { x.classList.toggle('on', x === t); });
        b.querySelectorAll('.gv-th').forEach(function (x) { x.hidden = x.dataset.th !== t.dataset.th; });
        return;
      }
      if (e.target.closest('.gv-xep')) {
        var ids = Object.keys(chon), n = e.target.closest('.gv-xep'); n.disabled = true; n.textContent = '⏳ Đang xếp…';
        return goiMC('gvChuyenLop', { hoSoId: ids, maLop: ma }).then(function (d) {
          bao('Đã xếp ' + d.soHs + ' em vào lớp ' + l.tenLop); dongBang(); LOP_MO = ''; taiDuLieu(true);
        }).catch(function (x) { n.disabled = false; n.textContent = 'Xếp vào lớp'; bao('⚠️ ' + x.message, true); });
      }
      if (e.target.closest('.gv-gui-email')) {
        var nut = e.target.closest('.gv-gui-email'), ds = docDanh(b.querySelector('.gv-dan').value);
        if (!ds.length) return bao('⚠️ Cô dán danh sách email trước nhé', true);
        nut.disabled = true; nut.textContent = '⏳ Đang thêm ' + ds.length + ' em…';
        return goiMC('gvMoiLop', { maLop: ma, ds: ds }).then(function (d) {
          nut.disabled = false; nut.textContent = 'Thêm vào lớp'; b.querySelector('.gv-dan').value = '';
          b.querySelector('.gv-kq').innerHTML = '<div class="gv-tom">' +
            (d.daXep.length ? '<p>✅ Vào lớp ngay (' + d.daXep.length + '): ' + d.daXep.map(esc).join(', ') + '</p>' : '') +
            (d.cho.length ? '<p>📨 Chờ em đăng nhập (' + d.cho.length + '): ' + d.cho.map(esc).join(', ') + '</p>' : '') +
            (d.canChon.length ? '<p>⚠️ Email dùng chung nhiều hồ sơ, chưa biết em nào: ' + d.canChon.map(esc).join(', ') + ' — cô ghi đúng họ tên của em hoặc xếp ở tab “Em đã có hồ sơ”.</p>' : '') +
            (d.sai.length ? '<p>❌ Không đọc được email: ' + d.sai.map(esc).join(', ') + '</p>' : '') + '</div>';
          return taiDuLieu(true).then(veCho);
        }).catch(function (x) { nut.disabled = false; nut.textContent = 'Thêm vào lớp'; bao('⚠️ ' + x.message, true); });
      }
      var xoa = e.target.closest('[data-xoa]');
      if (xoa) goiMC('gvXoaMoi', { email: xoa.dataset.xoa, maLop: ma }).then(function () {
        D.moiLop = D.moiLop.filter(function (m) { return !(m.email === xoa.dataset.xoa && m.maLop === ma); }); veCho(); bao('Đã bỏ ' + xoa.dataset.xoa);
      }).catch(function (x) { bao('⚠️ ' + x.message, true); });
    });
    b.addEventListener('change', function (e) {
      var i = e.target.closest('input[data-hs]'); if (!i) return;
      if (i.checked) chon[i.dataset.hs] = 1; else delete chon[i.dataset.hs];
      var n = Object.keys(chon).length, nut = b.querySelector('.gv-xep'); nut.disabled = !n; nut.textContent = n ? 'Xếp ' + n + ' em vào lớp' : 'Xếp vào lớp';
    });
    var tim = b.querySelector('.gv-tim-th');
    if (tim) tim.addEventListener('input', function () {
      var q = boDau(tim.value).trim(); b.querySelectorAll('.gv-ds-chon > label').forEach(function (x) { x.hidden = q && x.dataset.tim.indexOf(q) < 0; });
    });
  }
  function docDanh(txt) {                     // "email, Họ tên" · "Họ tên <tab> email" · chỉ email
    return String(txt || '').split(/\r?\n/).map(function (d) {
      d = d.trim(); if (!d) return null;
      var m = d.match(/[^\s,;<>\t]+@[^\s,;<>\t]+/), email = m ? m[0] : '';
      var ten = d.replace(email, '').replace(/[<>]/g, '').replace(/^[\s,;\t]+|[\s,;\t]+$/g, '').replace(/[\t;]+/g, ' ').replace(/\s+/g, ' ');
      return { email: email || d, hoTen: email ? ten : '' };
    }).filter(Boolean);
  }

  // =====================================================================
  // GIAO BÀI
  // =====================================================================
  var CHON = { lop: {}, phan: {}, cap: '' };
  function veGiaoBai(noi) {
    var lopMo = D.lop.filter(function (l) { return !l.dong; });
    if (!CHON.cap && CAT.length) CHON.cap = CAT[0].ct + '/' + CAT[0].cap;
    var bayGio = new Date(), han = new Date(bayGio.getTime() + 2 * 864e5); han.setHours(21, 0, 0, 0);
    noi.innerHTML = '<div class="gv-giao-luoi">' +
      '<div class="gv-giao-trai">' +
        '<div class="gv-the"><h3><span class="gv-buoc">1</span> Chọn lớp</h3>' + (lopMo.length ? '<div class="gv-chon-lop">' + lopMo.map(function (l) {
          return '<label class="gv-o-chon"><input type="checkbox" data-lop="' + esc(l.maLop) + '"' + (CHON.lop[l.maLop] ? ' checked' : '') + '><span><b>' + esc(l.tenLop) + '</b><small>' + hsTrongLop(l.maLop).length + ' học sinh</small></span></label>';
        }).join('') + '</div>' : '<p class="gv-trong">Chưa có lớp. <button type="button" class="gv-lk" data-di="lop">Tạo lớp</button> trước nhé.</p>') + '</div>' +
        '<div class="gv-the"><h3><span class="gv-buoc">2</span> Chọn bài</h3>' +
          '<div class="gv-loc"><select class="gv-chon gv-cap">' + CAT.map(function (c) { var v = c.ct + '/' + c.cap; return '<option value="' + esc(v) + '"' + (v === CHON.cap ? ' selected' : '') + '>' + esc(c.ten) + '</option>'; }).join('') + '</select></div>' +
          '<div class="gv-ds-bai"></div></div>' +
      '</div>' +
      '<div class="gv-giao-phai"><div class="gv-the gv-dinh"><h3><span class="gv-buoc">3</span> Thời gian</h3>' +
        '<form class="gv-tg"><label>Bắt đầu từ<input type="datetime-local" name="batDau" value="' + chuoiDL(bayGio) + '"></label>' +
        '<label>Hạn nộp<input type="datetime-local" name="hanNop" value="' + chuoiDL(han) + '" required></label>' +
        '<label>Lời nhắn cho học sinh <span class="gv-phu">(tuỳ chọn)</span><input name="ghiChu" maxlength="300" placeholder="VD: Làm trước buổi thứ Năm"></label>' +
        '<div class="gv-tom"></div><button type="submit" class="gv-nut chinh to">Giao bài</button>' +
        '<p class="gv-trong">“Xong” = học sinh làm trọn một lượt (Bài tập, Ôn tập, Test: lượt Trộn tất cả · Từ vựng: xem đủ mọi từ · Ngữ pháp: tới màn Hoàn thành).</p></form></div></div>' +
      '</div>' +
      '<div class="gv-the"><div class="gv-the-dau"><h3>🗂 Các đợt đã giao</h3></div><div class="gv-ds-dot"></div></div>';
    veDsBai(noi); veTom(noi); veDsDot(noi);
    noi.querySelector('.gv-cap').addEventListener('change', function (e) { CHON.cap = e.target.value; veDsBai(noi); });
    noi.addEventListener('change', function (e) {
      var l = e.target.closest('input[data-lop]'); if (l && e.target.closest('.gv-chon-lop')) { if (l.checked) CHON.lop[l.dataset.lop] = 1; else delete CHON.lop[l.dataset.lop]; veTom(noi); }
      var p = e.target.closest('input[data-phan]'); if (p) { if (p.checked) CHON.phan[p.dataset.phan] = 1; else delete CHON.phan[p.dataset.phan]; capNhatBai(p.closest('.gv-bai')); veTom(noi); }
      var cb = e.target.closest('input[data-ca-bai]'); if (cb) { cb.closest('.gv-bai').querySelectorAll('input[data-phan]').forEach(function (x) { x.checked = cb.checked; if (cb.checked) CHON.phan[x.dataset.phan] = 1; else delete CHON.phan[x.dataset.phan]; }); veTom(noi); }
    });
    noi.addEventListener('click', function (e) {
      var di = e.target.closest('[data-di]'); if (di) return moTab(di.dataset.di);
      var x = e.target.closest('[data-bo]'); if (x) { delete CHON.phan[x.dataset.bo]; var i = noi.querySelector('input[data-phan="' + x.dataset.bo + '"]'); if (i) { i.checked = false; capNhatBai(i.closest('.gv-bai')); } veTom(noi); }
      var d = e.target.closest('[data-dot]'); if (d) xuLyDot(d.dataset.dot, d.dataset.l, d);
    });
    noi.querySelector('.gv-tg').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, lops = Object.keys(CHON.lop), phans = Object.keys(CHON.phan), n = f.querySelector('button[type=submit]');
      if (!lops.length) return bao('⚠️ Cô chọn lớp ở bước 1', true);
      if (!phans.length) return bao('⚠️ Cô chọn bài ở bước 2', true);
      var bd = new Date(f.batDau.value).getTime() || Date.now(), hn = new Date(f.hanNop.value).getTime();
      if (!hn || hn <= bd) return bao('⚠️ Hạn nộp phải sau giờ bắt đầu', true);
      n.disabled = true; n.textContent = '⏳ Đang giao…';
      goiMC('gvGiaoBai', { maLop: lops, batDau: bd, hanNop: hn, ghiChu: f.ghiChu.value, phan: phans.map(function (k) {
        var b = BAI_THEO_KHOA[k.replace(/\/[^\/]+$/, '')] || {}; return { phan: k, ten: PHAN_TEN[k] || k, tenBai: (b.ten || '') + (b.tenDai ? ' · ' + b.tenDai : '') };
      }) }).then(function (d) {
        bao('Đã giao ' + phans.length + ' phần cho ' + lops.length + ' lớp' + (d.moThem ? ' · tự mở thêm ' + d.moThem + ' bài' : ''));
        CHON.phan = {}; taiDuLieu(true);
      }).catch(function (x) { n.disabled = false; n.textContent = 'Giao bài'; bao('⚠️ ' + x.message, true); });
    });
  }
  function veDsBai(noi) {
    var c = CAT.filter(function (c) { return c.ct + '/' + c.cap === CHON.cap; })[0], o = noi.querySelector('.gv-ds-bai');
    if (!c || !c.bai.length) { o.innerHTML = '<p class="gv-trong">Cấp này chưa có bài.</p>'; return; }
    o.innerHTML = c.bai.map(function (b) {
      return '<details class="gv-bai"><summary><span><b>' + esc(b.tenNgan) + '</b> <small>' + esc(b.tieuDe) + '</small></span><span class="gv-bai-dem"></span></summary>' +
        '<label class="gv-ca-bai"><input type="checkbox" data-ca-bai> Chọn cả bài</label><div class="gv-ds-phan">' + b.phan.map(function (p) {
          return '<label class="gv-o-chon nho"><input type="checkbox" data-phan="' + esc(p.k) + '"' + (CHON.phan[p.k] ? ' checked' : '') + '><span>' + esc(p.ten) + '</span></label>';
        }).join('') + '</div></details>';
    }).join('');
    o.querySelectorAll('.gv-bai').forEach(capNhatBai);
  }
  function capNhatBai(the) {
    if (!the) return;
    var ds = the.querySelectorAll('input[data-phan]'), n = 0; ds.forEach(function (x) { if (x.checked) n++; });
    the.querySelector('.gv-bai-dem').innerHTML = n ? '<span class="gv-chip xong">' + n + ' phần</span>' : '';
    the.querySelector('input[data-ca-bai]').checked = n === ds.length;
    if (n) the.open = true;
  }
  function veTom(noi) {
    var lops = Object.keys(CHON.lop), phans = Object.keys(CHON.phan), o = noi.querySelector('.gv-tom');
    var soHs = lops.reduce(function (s, m) { return s + hsTrongLop(m).length; }, 0);
    o.innerHTML = '<p><b>' + (lops.length ? lops.map(function (m) { return esc((LOP[m] || {}).tenLop || m); }).join(', ') : 'Chưa chọn lớp') + '</b>' + (lops.length ? ' · ' + soHs + ' học sinh' : '') + '</p>' +
      (phans.length ? '<ul>' + phans.map(function (k) { return '<li>' + esc(PHAN_TEN[k] || k) + ' <button type="button" class="gv-lk" data-bo="' + esc(k) + '" aria-label="Bỏ">✕</button></li>'; }).join('') + '</ul>' : '<p class="gv-trong">Chưa chọn bài.</p>');
    noi.querySelector('.gv-tg button[type=submit]').textContent = phans.length && lops.length ? 'Giao ' + phans.length + ' phần cho ' + lops.length + ' lớp' : 'Giao bài';
  }
  function veDsDot(noi) {
    var m = {};
    D.giaoBai.forEach(function (g) { (m[g.maDot] = m[g.maDot] || []).push(g); });
    var dots = Object.keys(m).map(function (k) { return { ma: k, ds: m[k], g: m[k][0] }; }).sort(function (a, b) { return b.g.taoLuc - a.g.taoLuc; });
    var o = noi.querySelector('.gv-ds-dot');
    if (!dots.length) { o.innerHTML = '<p class="gv-trong">Chưa giao bài nào.</p>'; return; }
    o.innerHTML = dots.slice(0, 40).map(function (d) {
      var lops = d.ds.map(function (g) { return g.maLop; }).filter(function (x, i, s) { return s.indexOf(x) === i; });
      var phans = d.ds.map(function (g) { return g.phan; }).filter(function (x, i, s) { return s.indexOf(x) === i; });
      var tong = 0, xong = 0;
      d.ds.forEach(function (g) { hsTrongLop(g.maLop).forEach(function (h) { tong++; var t = trangThaiGiao(g, h); if (t === 'xong' || t === 'muon') xong++; }); });
      var het = d.g.hanNop < Date.now(), chuaBd = d.g.batDau > Date.now();
      return '<div class="gv-dot-the"><div class="gv-dot-chu"><b>' + phans.map(function (k) { return esc(PHAN_TEN[k] || k); }).join(' · ') + '</b>' +
        '<small>' + lops.map(function (x) { return esc((LOP[x] || {}).tenLop || x); }).join(', ') + ' · giao ' + ngayGio(d.g.taoLuc) + (chuaBd ? ' · <b>bắt đầu ' + ngayGio(d.g.batDau) + '</b>' : '') + '</small>' +
        '<small class="' + (het ? 'gv-het' : '') + '">' + (het ? 'Đã hết hạn ' : 'Hạn ') + ngayGio(d.g.hanNop) + ' · xong ' + xong + '/' + tong + ' lượt' + (d.g.ghiChu ? ' · 📝 ' + esc(d.g.ghiChu) : '') + '</small></div>' +
        '<div class="gv-dot-nut"><button type="button" class="gv-nut nho" data-dot="' + esc(d.ma) + '" data-l="han">⏰ Đổi hạn</button><button type="button" class="gv-nut nho nhe" data-dot="' + esc(d.ma) + '" data-l="xoa">🗑 Xoá</button></div></div>';
    }).join('');
  }
  function xuLyDot(ma, l, nut) {
    var g = D.giaoBai.filter(function (x) { return x.maDot === ma; })[0]; if (!g) return;
    if (l === 'xoa') {
      if (!confirm('Xoá đợt giao này? Học sinh sẽ không thấy bài trong ô "Bài cô giao" nữa (tiến độ đã học vẫn giữ).')) return;
      goiMC('gvXoaGiao', { maDot: ma }).then(function () { bao('Đã xoá đợt giao'); taiDuLieu(true); }).catch(function (x) { bao('⚠️ ' + x.message, true); });
    } else if (l === 'han') {
      var o = nut.closest('.gv-dot-the'); if (o.querySelector('.gv-doi-han')) return;
      o.insertAdjacentHTML('beforeend', '<form class="gv-doi-han"><label>Hạn mới<input type="datetime-local" name="han" value="' + chuoiDL(g.hanNop) + '" required></label><button type="submit" class="gv-nut nho chinh">Lưu</button></form>');
      o.querySelector('.gv-doi-han').addEventListener('submit', function (e) {
        e.preventDefault(); var t = new Date(e.target.han.value).getTime();
        goiMC('gvSuaGiao', { maDot: ma, hanNop: t }).then(function () { bao('Đã đổi hạn nộp'); taiDuLieu(true); }).catch(function (x) { bao('⚠️ ' + x.message, true); });
      });
    }
  }

  // Mở chi tiết học sinh từ mọi nơi trên trang
  window.QM_GV = { moHocSinh: function (id) { moHocSinh(id); } };
})();
