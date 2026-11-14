/* =========================================================
   TÀI KHOẢN · TIẾN ĐỘ HỌC · LƯỢT TRUY CẬP — Tiếng Trung Diệu Kỳ (quy chuẩn 12)
   header.js tự nạp file này ở MỌI trang (kèm cau-hinh.js nếu trang chưa nạp).

   1. Trạng thái từng phần của bài (Từ vựng, Ngữ pháp, Ôn tập, Bài tập, Test): luôn chạy, lưu trên máy (khoá "qm-phan-v1").
      Trang bài: dấu ✓ trên phần đã xong · Trang HSK: "x/y phần đã xong" · Trang chủ: nút "Học tiếp".
   2. Đăng nhập Google + hồ sơ học sinh + đồng bộ tiến độ: chỉ bật khi cau-hinh.js có QM_TK_API và QM_GOOGLE_CLIENT_ID.
      Không chặn nội dung: chưa đăng nhập vẫn học, làm bài như cũ.
   3. Lượt truy cập: mỗi lần mở trang gửi một dòng lên máy chủ tài khoản (khi có QM_TK_API).
   4. (04/11/2026, máy chủ 2026-11-04a) Lớp học: hồ sơ nhập MÃ LỚP cô đưa; em trong lớp chỉ vào được bài cô đã mở cho lớp
      (bài chưa mở: thẻ khoá, vào thẳng thì che trang); ô "📋 Bài cô giao" ở trang chủ / trang chương trình / trang cấp.
      Tài khoản giáo viên (email trong GIAO_VIEN của máy chủ): không bị khoá, có nút vào giao-vien/.
   Lưu ở máy trước, đồng bộ sau: 30 giây một lần nếu có thay đổi, khi rời trang, khi vừa đăng nhập / đổi hồ sơ.
   ========================================================= */
(function () {
  if (window.QM_TK_DA_NAP) return; window.QM_TK_DA_NAP = true;
  var src = document.currentScript ? document.currentScript.src : '';
  var ROOT = src.indexOf('assets/js/tai-khoan.js') >= 0 ? src.substring(0, src.indexOf('assets/js/tai-khoan.js')) : '';
  var V = (src.match(/\?v=([^&#]+)/) || [])[1] || '';
  var API = window.QM_TK_API || '', CID = window.QM_GOOGLE_CLIENT_ID || '';
  var BAT = !!(API && CID);

  // ---------------- Lưu trên máy ----------------
  var K_TK = 'qm-tk-v1', K_PHAN = 'qm-phan-v1', K_TD = 'qm-tien-do-v1', K_CHU = 'qm-tk-chu', K_DB = 'qm-tk-dong-bo';
  var K_LD = 'qm-luot-do-v1';                                // lượt làm dở (luot-do.js), đồng bộ cùng tiến độ (2026-10-30)
  function doc(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function ghi(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function ssDoc(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssGhi(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  function lopDu(t) { t = String(t || ''); return /^lớp(\s|$)/i.test(t) ? t : 'Lớp ' + t; }   // "Lớp tiếng Trung…" không thành "Lớp Lớp …"
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // =====================================================================
  // 1. TRẠNG THÁI TỪNG PHẦN CỦA BÀI
  // =====================================================================
  var PHAN = doc(K_PHAN); if (!PHAN || PHAN.v !== 1) PHAN = { v: 1, phan: {} };
  var TEN_PHAN = { 'test-dau-gio': 'Test đầu giờ', 'tu-vung': 'Từ vựng', 'ngu-phap': 'Ngữ pháp', 'bai-tap': 'Bài tập' };
  // Trang thuộc phần nào: <chương trình>/<cấp>/bai-<N>/<phần>.html
  //   HSK 3.0: chuong-trinh-hsk/hsk1/bai-3/tu-vung.html    →  khoá "hsk1/bai-3/tu-vung"
  //   HSK 2.0: chuong-trinh-hsk-2/hsk1/bai-1-2/tu-vung.html →  khoá "h2/hsk1/bai-1-2/tu-vung"
  var CT_KHOA = { 'chuong-trinh-hsk': '', 'chuong-trinh-hsk-2': 'h2/' };
  var CT_DATA = { 'chuong-trinh-hsk': 'data/bai/', 'chuong-trinh-hsk-2': 'data/hsk2/' };
  var RE_BAI = 'bai-\\d+(?:-\\d+)?';
  function khoaTuDuongDan(p) {
    var m = String(p).split('#')[0].split('?')[0].match(new RegExp('(chuong-trinh-hsk(?:-2)?)\\/(hsk[^\\/]+)\\/(' + RE_BAI + ')\\/([a-z0-9-]+)\\.html$'));
    if (!m || m[4] === 'index' || m[4] === 'bang-xep-hang') return null;
    var tien = CT_KHOA[m[1]];
    return { khoa: tien + m[2] + '/' + m[3] + '/' + m[4], bai: tien + m[2] + '/' + m[3], phan: m[4], ct: m[1], cap: m[2], slug: m[3],
      url: m[1] + '/' + m[2] + '/' + m[3] + '/' + m[4] + '.html' };
  }
  function urlTuKhoa(k) { return (k.indexOf('h2/') === 0 ? 'chuong-trinh-hsk-2/' + k.slice(3) : 'chuong-trinh-hsk/' + k) + '.html'; }
  function soBai(slug, cuoi) { var so = slug.match(/\d+/g) || ['0']; return +(cuoi ? so[so.length - 1] : so[0]); }
  function tenBai(slug) { return 'Bài ' + slug.slice(4).replace('-', '–'); }
  function tenCap(ct, cap) { return (ct === 'chuong-trinh-hsk-2' ? 'HSK 2.0 · ' : '') + cap.toUpperCase().replace('HSK', 'HSK '); }
  var TRANG_NAY = khoaTuDuongDan(location.pathname);
  function tenTrangNay() {                                   // "HSK 1 · Bài 3 · Ôn tập từ vựng 2" từ dòng đường dẫn
    var dd = document.querySelector('.duong-dan'); if (!dd) return '';
    var t = dd.textContent.split('›').map(function (x) { return x.trim(); }).filter(Boolean);
    return (/chuong-trinh-hsk-2\//.test(location.pathname) ? 'HSK 2.0 · ' : '') + t.slice(1).join(' · ');
  }
  function tenPhan(phan) { return TEN_PHAN[phan] || (/^on-tap-/.test(phan) ? 'Ôn tập từ vựng ' + phan.slice(7).replace('-', '.') : phan); }
  var phanBan = false;
  function luuPhan() { ghi(K_PHAN, PHAN); phanBan = true; document.dispatchEvent(new CustomEvent('qm-phan')); }
  function danhDau(tt, khoa) {
    var k = khoa ? khoaTuDuongDan(khoa) : TRANG_NAY; if (!k) return;
    var cu = PHAN.phan[k.khoa] || {}, moi = { tt: cu.tt === 'xong' ? 'xong' : tt, t: Date.now(), ten: (k === TRANG_NAY && tenTrangNay()) || cu.ten || tenPhan(k.phan), url: k.url };
    if (cu.xem) moi.xem = cu.xem;
    if (cu.xemMR) moi.xemMR = cu.xemMR;
    if (cu.mr) moi.mr = cu.mr;
    PHAN.phan[k.khoa] = moi; luuPhan();
  }
  // Từ vựng / Ngữ pháp: "xong" khi đã xem đủ KIẾN THỨC CHUNG (dsChung = mã các mục chung). Nội dung mở rộng không bắt buộc:
  // ghi riêng x.mr ('dang' | 'xong') để cô và học sinh thấy ai có học thêm. ma: mã mục vừa xem · nhom: 'moRong' hoặc khác (chung)
  function xemTu(ma, nhom, dsChung, dsMR) {
    if (!TRANG_NAY) return;
    dsChung = dsChung || []; dsMR = dsMR || [];
    var kh = TRANG_NAY.khoa, x = PHAN.phan[kh] || { tt: 'dang-hoc', t: Date.now(), url: TRANG_NAY.url, ten: tenTrangNay() };
    var laMR = nhom === 'moRong';
    if (laMR ? x.mr === 'xong' : x.tt === 'xong') return;     // đã xong phần này: không ghi lại nữa
    var xem = x.xem || [], xemMR = x.xemMR || [];
    if (laMR) { if (xemMR.indexOf(ma) >= 0 || xem.indexOf(ma) >= 0) return; xemMR.push(ma); x.xemMR = xemMR; }
    else { if (xem.indexOf(ma) >= 0) return; xem.push(ma); x.xem = xem; }
    PHAN.phan[kh] = x;
    var chungXong = dsChung.length > 0 && dsChung.every(function (m) { return xem.indexOf(m) >= 0; });
    var mrXong = dsMR.length > 0 && dsMR.every(function (m) { return xem.indexOf(m) >= 0 || xemMR.indexOf(m) >= 0; });
    if (dsMR.length && x.mr !== 'xong') { if (mrXong) { x.mr = 'xong'; delete x.xemMR; } else if (xemMR.length) x.mr = 'dang'; }
    if (chungXong) { danhDau('xong'); delete PHAN.phan[kh].xem; luuPhan(); }
    else luuPhan();
  }
  var cho = window.QM_PHAN && window.QM_PHAN.q || [];         // header.js đặt sẵn hàng đợi: lệnh gọi trước khi file này nạp xong
  function datPhan(khoa, tt, ten, url) {                     // phần không theo mẫu bai-N (bài kiểm tra): ghi thẳng theo khoá
    var cu = PHAN.phan[khoa] || {}; PHAN.phan[khoa] = { tt: cu.tt === 'xong' ? 'xong' : tt, t: Date.now(), ten: ten || cu.ten || khoa, url: url || cu.url || '' }; luuPhan();
  }
  function danhDauMR() {                                    // làm trọn một lượt luyện tập Nội dung mở rộng: chỉ ghi dấu riêng, không đổi trạng thái chính
    if (!TRANG_NAY) return; var x = PHAN.phan[TRANG_NAY.khoa]; if (!x) { danhDau('dang-hoc'); x = PHAN.phan[TRANG_NAY.khoa]; if (!x) return; }
    x.mr = 'xong'; x.t = Date.now(); luuPhan();
  }
  window.QM_PHAN = { danhDau: danhDau, danhDauMR: danhDauMR, xemTu: xemTu, datPhan: datPhan, ds: function () { return PHAN.phan; } };
  cho.forEach(function (a) { window.QM_PHAN[a[0]].apply(null, a[1]); });
  if (TRANG_NAY) danhDau('dang-hoc');

  // Danh sách phần của một bài, theo dữ liệu bài (không phải khai tay ở đâu khác)
  var DL_BAI = {};
  function taiBai(ct, cap, slug) {
    var k = ct + '/' + cap + '/' + slug;
    return DL_BAI[k] || (DL_BAI[k] = fetch(ROOT + CT_DATA[ct] + slug + '.json' + (V ? '?v=' + V : '')).then(function (r) { if (!r.ok) throw r; return r.json(); })
      .then(function (d) {
        var ds = [];
        if (soBai(slug) > 1) ds.push('test-dau-gio');
        ds.push('tu-vung');
        if ((d.nguPhap || []).length) ds.push('ngu-phap');
        (d.chang || []).forEach(function (c) { ds.push('on-tap-' + String(c.so).replace('.', '-')); });
        ds.push('bai-tap');
        return { slug: slug, ten: d.tenViet || tenBai(slug), ds: ds };
      }).catch(function () { return null; }));
  }
  function demXong(baiKhoa, ds) { return ds.filter(function (p) { var x = PHAN.phan[baiKhoa + '/' + p]; return x && x.tt === 'xong'; }).length; }

  // Trang bài (…/bai-N/): dấu trạng thái trên từng thẻ / liên kết phần
  function veDauTich() {
    if (!new RegExp('\\/' + RE_BAI + '\\/(index\\.html)?$').test(location.pathname)) return;
    document.querySelectorAll('.grid a[href]').forEach(function (a) {
      var k = khoaTuDuongDan(a.pathname); if (!k) return;
      var x = PHAN.phan[k.khoa], cu = a.querySelector('.tk-dau'); if (cu) cu.remove();
      if (!x) return;
      var s = document.createElement('span');
      s.className = 'tk-dau' + (x.tt === 'xong' ? ' xong' : '');
      s.textContent = (x.tt === 'xong' ? '✓ Đã xong' : '● Đang học') + (x.mr === 'xong' ? ' · Mở rộng ✓' : x.mr === 'dang' ? ' · Mở rộng ●' : '');
      if (a.classList.contains('card')) a.insertBefore(s, a.firstChild); else a.appendChild(s);
    });
  }
  // Trang một cấp (…/hsk1/): mỗi bài "x/y phần đã xong"
  function veTienDoCap() {
    var m = location.pathname.match(/(chuong-trinh-hsk(?:-2)?)\/(hsk[^\/]+)\/(index\.html)?$/); if (!m) return;
    document.querySelectorAll('.grid a.card[href]').forEach(function (a) {
      var slug = ((a.getAttribute('href') || '').match(new RegExp('^(' + RE_BAI + ')\\/?$')) || [])[1]; if (!slug) return;
      var baiKhoa = CT_KHOA[m[1]] + m[2] + '/' + slug;
      taiBai(m[1], m[2], slug).then(function (b) {
        if (!b) return;
        var xong = demXong(baiKhoa, b.ds), cu = a.querySelector('.tk-tien'); if (cu) cu.remove();
        var dang = b.ds.some(function (p) { return PHAN.phan[baiKhoa + '/' + p]; });
        if (!dang) return;
        var o = document.createElement('div'); o.className = 'tk-tien' + (xong === b.ds.length ? ' xong' : '');
        o.innerHTML = '<span>' + (xong === b.ds.length ? '✓ Đã xong cả ' + xong + ' phần' : xong + '/' + b.ds.length + ' phần đã xong') + '</span><i><b style="width:' + Math.round(xong / b.ds.length * 100) + '%"></b></i>';
        var go = a.querySelector('.go'); a.insertBefore(o, go || null);
      });
    });
  }
  // Trang chủ, trang chương trình, trang cấp: nút "Học tiếp" — phần đang dở gần nhất; xong rồi thì phần kế tiếp của bài, hết bài thì sang bài sau
  function veHocTiep() {
    var laChu = !!document.querySelector('.hero-btns') && !!document.getElementById('lo-trinh-hsk');
    var mCt = location.pathname.match(/(chuong-trinh-hsk(?:-2)?)\/(?:(hsk[^\/]+)\/)?(index\.html)?$/);
    if (!laChu && !mCt) return;
    var loc = function (k) {
      if (!mCt) return true;
      var h2 = k.indexOf('h2/') === 0;
      if ((mCt[1] === 'chuong-trinh-hsk-2') !== h2) return false;
      return !mCt[2] || (h2 ? k.slice(3) : k).indexOf(mCt[2] + '/') === 0;
    };
    var ds = Object.keys(PHAN.phan).filter(loc).map(function (k) { return { k: k, x: PHAN.phan[k] }; })
      .sort(function (a, b) { return (b.x.t || 0) - (a.x.t || 0); });
    if (!ds.length) return;
    var moi = ds[0], k = khoaTuDuongDan(urlTuKhoa(moi.k)); if (!k) return;
    var hien = function (url, ten, ghiChu) {
      var cu = document.querySelector('.tk-hoc-tiep'); if (cu) cu.remove();
      var o = document.createElement('a'); o.className = 'tk-hoc-tiep'; o.href = ROOT + url;
      o.innerHTML = '<span class="tk-ht-ico">📌</span><span class="tk-ht-chu"><small>' + esc(ghiChu) + '</small><b>' + esc(ten) + '</b></span><span class="tk-ht-go">Học tiếp →</span>';
      var cho = laChu ? document.querySelector('.hero-btns') : document.querySelector('.sec-head');
      if (cho) cho.parentNode.insertBefore(o, cho.nextSibling);
    };
    if (moi.x.tt !== 'xong') return hien(moi.x.url, moi.x.ten || tenPhan(k.phan), 'Đang học dở');
    taiBai(k.ct, k.cap, k.slug).then(function (b) {
      if (!b) return;
      var con = b.ds.filter(function (p) { var x = PHAN.phan[k.bai + '/' + p]; return !x || x.tt !== 'xong'; })[0];
      if (con) return hien(k.ct + '/' + k.cap + '/' + k.slug + '/' + con + '.html', tenCap(k.ct, k.cap) + ' · ' + tenBai(k.slug) + ' · ' + tenPhan(con), 'Phần tiếp theo');
      var sau = 'bai-' + (soBai(k.slug, true) + 1);
      taiBai(k.ct, k.cap, sau).then(function (b2) {
        if (b2) hien(k.ct + '/' + k.cap + '/' + sau + '/', tenCap(k.ct, k.cap) + ' · ' + tenBai(sau), 'Xong ' + tenBai(k.slug) + ' rồi 🎉 Sang bài mới');
      });
    });
  }
  function veTienDo() { veDauTich(); veTienDoCap(); veHocTiep(); if (window.QM_TK && QM_TK.veLop) QM_TK.veLop(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', veTienDo); else veTienDo();
  window.addEventListener('pageshow', function (e) { if (e.persisted) { PHAN = doc(K_PHAN) || PHAN; veTienDo(); } });   // bấm "quay lại": vẽ lại dấu

  // =====================================================================
  // 3. LƯỢT TRUY CẬP — mỗi lần mở trang một dòng (không cần đăng nhập)
  // =====================================================================
  var TK = BAT ? doc(K_TK) : null;
  function goi(action, data, giuKetNoi) {
    var body = JSON.stringify(Object.assign({ action: action, phien: TK && TK.phien }, data || {}));
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: body, keepalive: !!giuKetNoi })
      .then(function (r) { return r.json(); })
      .then(function (d) { if (!d || !d.ok) { if (d && d.hetPhien) hetPhien(); throw new Error((d && d.loi) || 'Máy chủ không phản hồi'); } return d; });
  }
  if (API) {
    var maPhien = ssDoc('qm-ma-phien'); if (!maPhien) { maPhien = Math.random().toString(36).slice(2, 10) + Date.now().toString(36); ssGhi('qm-ma-phien', maPhien); }
    var thietBi = /iPad|Tablet/i.test(navigator.userAgent) ? 'may-tinh-bang' : /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'dien-thoai' : 'may-tinh';
    goi('truyCap', { trang: location.pathname.replace(/^.*?(chuong-trinh-hsk|thu-vien|index\.html|gioi-thieu\.html|$)/, '$1') || '/', maPhien: maPhien, thietBi: thietBi,
      hoSoId: TK && TK.hoSoId || '' }, true).catch(function () {});
  }
  if (!BAT) { window.QM_TK = { hoSoId: function () { return ''; }, hoSoDang: function () { return null; }, dangNhap: function () {} }; return; }

  // =====================================================================
  // 2. TÀI KHOẢN
  // =====================================================================
  function luuTK() { ghi(K_TK, TK); }
  function hoSoDang() { return TK && TK.hoSoId ? (TK.hoSo || []).filter(function (h) { return h.hoSoId === TK.hoSoId; })[0] || null : null; }
  function hetPhien() { if (!TK) return; TK = null; luuTK(); baoNho('Phiên đăng nhập đã hết hạn. Bạn đăng nhập lại để tiếp tục lưu tiến độ nhé.'); veNut(); ganBaiLam(); }
  function baoNho(t) { var b = document.createElement('div'); b.className = 'tk-toast'; b.textContent = t; document.body.appendChild(b); setTimeout(function () { b.remove(); }, 4200); }

  // ---------- Nút tài khoản trên thanh menu ----------
  var nut;
  function veNut() {
    var bar = document.querySelector('.sh-nav-bar'); if (!bar) return;
    if (!nut) { nut = document.createElement('button'); nut.type = 'button'; nut.className = 'tk-nut'; bar.appendChild(nut); nut.addEventListener('click', moNut); }
    var h = hoSoDang();
    nut.innerHTML = TK ? (TK.nguoiDung && TK.nguoiDung.anh ? '<img src="' + esc(TK.nguoiDung.anh) + '" alt="" referrerpolicy="no-referrer">' : '<span class="tk-nut-chu">' + esc(((h && h.hoTen) || 'A').trim().split(' ').pop().charAt(0)) + '</span>') +
      '<span class="tk-nut-ten">' + esc(h ? h.hoTen.trim().split(' ').pop() : 'Chọn hồ sơ') + '</span>' : '<span class="tk-nut-ico">👤</span><span class="tk-nut-ten">Đăng nhập</span>';
    if (TK && TK.giaoVien && !h) nut.innerHTML = nut.innerHTML.replace('Chọn hồ sơ', 'Cô giáo');
    if (TK && TK.tinMoi) nut.insertAdjacentHTML('beforeend', '<i class="tk-nut-cham" title="Cô đã trả lời tin nhắn"></i>');
    nut.setAttribute('aria-label', TK ? 'Tài khoản' : 'Đăng nhập');
  }
  function moNut() {
    if (!TK) return manDangNhap();
    if (hoSoDang()) return manTaiKhoan();
    if (TK.giaoVien) return manGiaoVien();
    return (TK.hoSo || []).length ? manChonHoSo() : manTaoHoSo();
  }

  // ---------- Bảng nổi ----------
  var pop;
  function moBang(html) {
    if (!pop) {
      pop = document.createElement('div'); pop.className = 'tk-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-modal', 'true');
      document.body.appendChild(pop);
      pop.addEventListener('click', function (e) { if (e.target === pop || e.target.closest('.tk-x')) dongBang(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && pop.classList.contains('on')) dongBang(); });
    }
    pop.innerHTML = '<div class="tk-pop-in"><button class="tk-x" type="button" aria-label="Đóng">✕</button>' + html + '</div>';
    pop.classList.add('on'); document.body.classList.add('tk-mo');
    return pop.querySelector('.tk-pop-in');
  }
  function dongBang() { if (pop) pop.classList.remove('on'); document.body.classList.remove('tk-mo'); }
  var DU_LIEU = '<p class="tk-nho">Web lưu: tên, email, ảnh đại diện Google; họ tên và lớp bạn điền; điểm, tiến độ học; lượt mở trang. Không lấy danh bạ, thư hay bất cứ thứ gì khác trong tài khoản Google. <a href="' + ROOT + 'index.html#du-lieu">Xem chi tiết</a></p>';

  function manDangNhap(loiMoi) {
    var b = moBang('<div class="tk-ico">🎓</div><h3>Đăng nhập</h3><p class="tk-loi-moi">' + esc(loiMoi || 'Đăng nhập để lưu điểm và tiến độ học. Đổi máy, đổi điện thoại vẫn học tiếp được.') + '</p>' +
      '<div class="tk-gbtn"><span class="tk-cho">Đang tải nút đăng nhập Google…</span></div><p class="tk-bao" aria-live="polite"></p>' + DU_LIEU +
      '<p class="tk-nho">Không đăng nhập vẫn xem bài, làm bài bình thường.</p>');
    taiGIS(function () {
      var o = b.querySelector('.tk-gbtn'); if (!o) return; o.innerHTML = '';
      google.accounts.id.renderButton(o, { theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill', locale: 'vi', width: Math.min(300, o.clientWidth || 280) });
    }, function () { var o = b.querySelector('.tk-gbtn'); if (o) o.innerHTML = '<span class="tk-loi">Chưa tải được nút đăng nhập Google. Bạn kiểm tra mạng rồi thử lại nhé.</span>'; });
  }
  var gis = null;
  function taiGIS(xong, loi) {
    if (window.google && google.accounts && google.accounts.id) return xong();
    if (!gis) gis = new Promise(function (ok, hong) {
      var s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
      s.onload = function () {
        google.accounts.id.initialize({ client_id: CID, callback: nhanThe, auto_select: false, cancel_on_tap_outside: true, ux_mode: 'popup' });
        ok();
      };
      s.onerror = function () { gis = null; hong(); };
      document.head.appendChild(s);
    });
    gis.then(xong, loi || function () {});
  }
  function nhanThe(resp) {
    var bao = pop && pop.querySelector('.tk-bao'); if (bao) bao.textContent = '⏳ Đang đăng nhập…';
    goi('dangNhap', { idToken: resp.credential }).then(function (d) {
      TK = { phien: d.phien, nguoiDung: d.nguoiDung, hoSo: d.hoSo || [], hoSoId: '', giaoVien: !!d.giaoVien, moi: d.moi || null }; luuTK(); veNut(); veLop();
      if (!TK.hoSo.length) return TK.giaoVien ? manGiaoVien(true) : manTaoHoSo(true);
      if (TK.hoSo.length === 1) return chonHoSo(TK.hoSo[0].hoSoId);
      manChonHoSo();
    }).catch(function (e) { if (bao) bao.textContent = '⚠️ ' + e.message; });
  }

  function manTaoHoSo(lanDau, sua) {
    var h = sua ? hoSoDang() : null;
    var moi = !sua && TK.moi && !(TK.hoSo || []).some(function (x) { return x.maLop === TK.moi.maLop; }) ? TK.moi : null;   // cô đã thêm email này vào lớp: điền sẵn
    var b = moBang('<div class="tk-ico">' + (sua ? '✏️' : '🧑‍🎓') + '</div><h3>' + (sua ? 'Sửa hồ sơ' : lanDau ? 'Tạo hồ sơ học sinh' : 'Thêm hồ sơ học sinh') + '</h3>' +
      (lanDau ? '<p class="tk-loi-moi">Chào ' + esc(TK.nguoiDung.hoTen || TK.nguoiDung.email) + '! Điền một lần, các lần sau không phải gõ tên khi làm bài.</p>' : '') +
      (moi ? '<p class="tk-moi-lop">🎓 Cô đã thêm bạn vào lớp <b>' + esc(moi.tenLop) + '</b>. Bạn kiểm tra họ tên rồi bấm Tạo hồ sơ nhé.</p>' : '') +
      (!sua && !lanDau ? '<p class="tk-loi-moi">Anh chị em dùng chung tài khoản này thì mỗi người một hồ sơ để điểm không bị dồn vào nhau.</p>' : '') +
      '<form class="tk-form"><label>Họ tên đầy đủ<input name="hoTen" required maxlength="80" autocomplete="name" placeholder="VD: Nguyễn Văn An" value="' + esc(h ? h.hoTen : moi ? moi.hoTen : '') + '"></label>' +
      '<label>Mã lớp <span class="tk-phu">(cô đưa trên lớp)</span><input name="maLop" maxlength="16" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="VD: K3HN7Q" value="' + esc(h ? h.maLop || '' : moi ? moi.maLop : '') + '"></label>' +
      '<details class="tk-tu-hoc"' + (h && !h.maLop && h.lop ? ' open' : '') + '><summary>Tự học, không có mã lớp?</summary>' +
        '<label>Lớp / nơi học <span class="tk-phu">(tự ghi)</span><input name="lop" maxlength="40" placeholder="VD: Tự học" value="' + esc(h && !h.maLop ? h.lop : '') + '"></label></details>' +
      (sua ? '' : '<label class="tk-dong-y"><input type="checkbox" name="dongY" required><span>Mình đồng ý để web lưu họ tên, lớp, điểm và tiến độ học của mình để phục vụ việc học. Dữ liệu học tập của mình (kết quả làm bài, thời gian học) được cô Nhiên dùng để theo dõi tiến độ, cải thiện bài giảng và có thể dùng cho nghiên cứu giáo dục.</span></label>') +
      '<button class="tk-btn chinh" type="submit">' + (sua ? 'Lưu' : 'Tạo hồ sơ') + '</button><p class="tk-bao" aria-live="polite"></p></form>' + (sua ? '' : DU_LIEU));
    b.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, bao = b.querySelector('.tk-bao'), nutL = f.querySelector('button.chinh');
      var maLop = f.maLop.value.replace(/\s+/g, '').toUpperCase();
      if (!maLop && !f.lop.value.trim()) { f.querySelector('.tk-tu-hoc').open = true; bao.textContent = '⚠️ Bạn điền mã lớp cô đưa, hoặc tự ghi tên lớp nếu tự học nhé.'; f.maLop.focus(); return; }
      nutL.disabled = true; bao.textContent = '⏳ Đang lưu…';
      goi(sua ? 'suaHoSo' : 'taoHoSo', { hoSoId: sua ? h.hoSoId : undefined, hoTen: f.hoTen.value, maLop: maLop, lop: maLop || f.lop.value,   /* máy chủ bản cũ chưa biết maLop: vẫn tạo được hồ sơ */ dongY: sua ? undefined : f.dongY.checked })
        .then(function (d) {
          TK.hoSo = d.hoSo; if ('lop' in d) { TK.lop = d.lop; TK.lopLuc = Date.now(); } luuTK();
          if (sua) { ganBaiLam(); veNut(); veLop(); dongBang(); baoNho(d.lop ? 'Đã lưu hồ sơ · Lớp ' + d.lop.tenLop + '.' : 'Đã lưu hồ sơ.'); } else chonHoSo(d.hoSoId);
        })
        .catch(function (x) { nutL.disabled = false; bao.textContent = '⚠️ ' + x.message; });
    });
  }
  function manChonHoSo() {
    var b = moBang('<div class="tk-ico">👋</div><h3>Hôm nay là ai học?</h3>' +
      '<div class="tk-ds-hs">' + TK.hoSo.map(function (h) { return '<button type="button" class="tk-hs" data-id="' + esc(h.hoSoId) + '"><b>' + esc(h.hoTen) + '</b><small>' + esc(lopDu(h.lop)) + '</small></button>'; }).join('') + '</div>' +
      '<div class="tk-hang"><button type="button" class="tk-btn tk-them">➕ Thêm hồ sơ</button><button type="button" class="tk-btn tk-ra">Đăng xuất</button></div>' +
      (TK.giaoVien ? '<div class="tk-menu"><a class="tk-btn chinh" href="' + ROOT + 'giao-vien/">🧑‍🏫 Vào trang giáo viên</a></div>' : ''));
    b.addEventListener('click', function (e) {
      var x = e.target.closest('.tk-hs'); if (x) return chonHoSo(x.dataset.id);
      if (e.target.closest('.tk-them')) return manTaoHoSo(false);
      if (e.target.closest('.tk-ra')) return dangXuat();
    });
  }
  function manTaiKhoan() {
    var h = hoSoDang(), nd = TK.nguoiDung || {};
    var b = moBang('<div class="tk-dau-tk">' + (nd.anh ? '<img src="' + esc(nd.anh) + '" alt="" referrerpolicy="no-referrer">' : '') + '<div><b>' + esc(nd.hoTen || '') + '</b><small>' + esc(nd.email || '') + '</small></div></div>' +
      '<div class="tk-dang-hs"><small>Đang học</small><b>' + esc(h.hoTen) + '</b><span>' + esc(lopDu(h.lop)) + (h.maLop ? ' · mã ' + esc(h.maLop) : '') + '</span></div>' +
      (TK.giaoVien ? '<div class="tk-menu"><a class="tk-btn chinh" href="' + ROOT + 'giao-vien/">🧑‍🏫 Vào trang giáo viên</a></div>' : '') +
      '<p class="tk-nho tk-dong-bo">' + (TK.dongBoLuc ? 'Tiến độ đã đồng bộ lúc ' + new Date(TK.dongBoLuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Tiến độ đang được đồng bộ…') + '</p>' +
      '<div class="tk-menu">' + (TK.hoSo.length > 1 ? '<button type="button" class="tk-btn" data-l="doi">🔄 Đổi hồ sơ</button>' : '') +
      '<button type="button" class="tk-btn" data-l="tin">💬 Tin nhắn với cô' + (TK.tinMoi ? ' <span class="tk-cham">' + TK.tinMoi + ' mới</span>' : '') + '</button><button type="button" class="tk-btn" data-l="them">➕ Thêm hồ sơ</button><button type="button" class="tk-btn" data-l="sua">✏️ Sửa họ tên, mã lớp</button>' +
      '<button type="button" class="tk-btn" data-l="ra">↪ Đăng xuất</button><button type="button" class="tk-btn nhe" data-l="xoa">🗑 Xoá dữ liệu của tôi</button></div>');
    b.addEventListener('click', function (e) {
      var l = (e.target.closest('[data-l]') || {}).dataset; if (!l) return;
      ({ tin: manTinCuaToi, doi: manChonHoSo, them: function () { manTaoHoSo(false); }, sua: function () { manTaoHoSo(false, true); }, ra: dangXuat, xoa: manXoa })[l.l]();
    });
  }
  function manXoa() {
    var h = hoSoDang();
    var b = moBang('<div class="tk-ico">🗑</div><h3>Xoá dữ liệu</h3><p class="tk-loi-moi">Xoá trên máy chủ tài khoản, không lấy lại được.</p>' +
      '<div class="tk-menu"><button type="button" class="tk-btn" data-x="hs">Xoá hồ sơ "' + esc(h.hoTen) + '" và tiến độ của hồ sơ này</button>' +
      '<button type="button" class="tk-btn do" data-x="tk">Xoá toàn bộ tài khoản: mọi hồ sơ, tiến độ, lượt truy cập</button>' +
      '<button type="button" class="tk-btn" data-x="thoi">Thôi, quay lại</button></div><p class="tk-bao" aria-live="polite"></p>' +
      '<p class="tk-nho">Điểm các bài đã nộp do cô xem trong trang quản lý (máy chủ điểm riêng). Muốn xoá điểm, bạn nhắn cô qua Zalo nhé.</p>');
    b.addEventListener('click', function (e) {
      var x = (e.target.closest('[data-x]') || {}).dataset; if (!x) return;
      if (x.x === 'thoi') return manTaiKhoan();
      var bao = b.querySelector('.tk-bao'); bao.textContent = '⏳ Đang xoá…';
      (x.x === 'hs' ? goi('xoaHoSo', { hoSoId: h.hoSoId }) : goi('xoaTaiKhoan')).then(function (d) {
        if (x.x === 'hs') { TK.hoSo = d.hoSo; TK.hoSoId = ''; luuTK(); ghi('qm-luu@' + h.hoSoId, null); boChu(); }
        else { (TK.hoSo || []).forEach(function (k) { ghi('qm-luu@' + k.hoSoId, null); }); TK = null; luuTK(); boChu(); }
        dongBang(); baoNho('Đã xoá dữ liệu.'); setTimeout(function () { location.reload(); }, 900);
      }).catch(function (er) { bao.textContent = '⚠️ ' + er.message; });
    });
  }

  // ---------- Chọn hồ sơ: đổi bản tiến độ trên máy cho đúng người ----------
  // Bản tiến độ đang dùng (qm-tien-do-v1 + qm-phan-v1) thuộc về hồ sơ ghi ở "qm-tk-chu" ("" = chưa đăng nhập).
  // Lần đầu đăng nhập trên máy: tiến độ đang có (lúc chưa đăng nhập) GỘP vào hồ sơ được chọn.
  function doiChu(id) {
    var chu = localStorage.getItem(K_CHU) || '';
    if (chu === id) return false;
    var hien = { td: doc(K_TD), phan: doc(K_PHAN), ld: doc(K_LD) };
    if (chu) ghi('qm-luu@' + chu, hien);
    var cat = doc('qm-luu@' + id) || { td: null, phan: null, ld: null };
    var co = chu ? cat : tronMay(hien, cat);                 // từ chưa đăng nhập → gộp với bản đã cất của hồ sơ (nếu có)
    ghi(K_TD, co.td); ghi(K_PHAN, co.phan); ghi(K_LD, co.ld || null); ghi('qm-luu@' + id, null);
    try { localStorage.setItem(K_CHU, id); } catch (e) {}
    return !!chu;
  }
  function tronMay(a, b) {                                   // cùng luật trộn với máy chủ: mới hơn thắng, từ khó gộp, "xong" không lùi
    var ta = a.td || {}, tb = b.td || {}, tu = {}, kho = {}, ph = {};
    [ta.tu || {}, tb.tu || {}].forEach(function (m) { Object.keys(m).forEach(function (k) { if (!tu[k] || (+m[k].t || 0) > (+tu[k].t || 0)) tu[k] = m[k]; }); });
    [ta.kho || {}, tb.kho || {}].forEach(function (m) { Object.keys(m).forEach(function (k) { kho[k] = m[k]; }); });
    [(a.phan || {}).phan || {}, (b.phan || {}).phan || {}].forEach(function (m) { Object.keys(m).forEach(function (k) {
      var cu = ph[k], x = m[k]; if (!cu) { ph[k] = x; return; }
      var hon = (+x.t || 0) > (+cu.t || 0) ? x : cu; ph[k] = Object.assign({}, hon, { tt: cu.tt === 'xong' || x.tt === 'xong' ? 'xong' : hon.tt, t: Math.max(+cu.t || 0, +x.t || 0) });
      var hopXem = function (f) { return (cu[f] || []).concat(x[f] || []).filter(function (v, q, a) { return a.indexOf(v) === q; }); };
      var xe = hopXem('xem'), xm = hopXem('xemMR'); delete ph[k].xem; delete ph[k].xemMR;
      if (ph[k].tt !== 'xong' && xe.length) ph[k].xem = xe;
      if ((cu.mr === 'xong' || x.mr === 'xong') ? false : xm.length) ph[k].xemMR = xm;
      if (cu.mr === 'xong' || x.mr === 'xong') ph[k].mr = 'xong'; else if (cu.mr || x.mr) ph[k].mr = 'dang';
    }); });
    var ld = {};                                             // lượt làm dở: mỗi khoá lấy bản mới hơn (kể cả dấu xoá)
    [((a.ld || {}).ds) || {}, ((b.ld || {}).ds) || {}].forEach(function (m) { Object.keys(m).forEach(function (k) { if (!ld[k] || (+m[k].t || 0) > (+ld[k].t || 0)) ld[k] = m[k]; }); });
    return { td: { v: 1, tu: tu, kho: kho, capNhat: Date.now() }, phan: { v: 1, phan: ph }, ld: { v: 1, ds: ld } };
  }
  function boChu() {                                         // đăng xuất / xoá: cất bản của hồ sơ, máy trở về trạng thái chưa đăng nhập (trống)
    var chu = localStorage.getItem(K_CHU) || '';
    if (chu && TK && (TK.hoSo || []).some(function (h) { return h.hoSoId === chu; })) ghi('qm-luu@' + chu, { td: doc(K_TD), phan: doc(K_PHAN), ld: doc(K_LD) });
    ghi(K_TD, null); ghi(K_PHAN, null); ghi(K_LD, null); try { localStorage.removeItem(K_CHU); } catch (e) {}
    try { localStorage.removeItem('qmhy:hoSo'); } catch (e) {}   // họ tên, lớp đã nhớ cho trang Bài tập: máy dùng chung không để lộ tên người trước
  }
  function chonHoSo(id) {
    ssGhi('qm-tk-da-chon', '1');
    var canTaiLai = doiChu(id);
    TK.hoSoId = id; if (TK.lop && TK.lop.maLop !== (hoSoDang() || {}).maLop) TK.lop = null;
    luuTK(); veNut(); ganBaiLam(); veLop();
    var b = moBang('<div class="tk-ico">⏳</div><h3>Đang đồng bộ tiến độ…</h3>');
    dongBo().then(function () {
      dongBang(); baoNho('Chào ' + hoSoDang().hoTen + '! Tiến độ học đã được đồng bộ.');
      if (canTaiLai) location.reload(); else { PHAN = doc(K_PHAN) || PHAN; veTienDo(); }
    }).catch(function (e) { b.innerHTML = '<button class="tk-x" type="button">✕</button><div class="tk-ico">⚠️</div><h3>Chưa đồng bộ được</h3><p class="tk-loi-moi">' + esc(e.message) + '</p><p class="tk-nho">Tiến độ vẫn lưu trên máy và sẽ tự đồng bộ lại sau.</p>';
      if (canTaiLai) setTimeout(function () { location.reload(); }, 1500); });
  }
  function dangXuat() {
    dayLen(true); boChu(); TK = null; luuTK(); dongBang(); baoNho('Đã đăng xuất.');
    setTimeout(function () { location.reload(); }, 700);
  }

  // ---------- Đồng bộ tiến độ ----------
  var ban = false;                                           // có thay đổi chưa gửi
  document.addEventListener('qm-tien-do', function (e) { if (!(e.detail && e.detail.nap)) ban = true; });
  document.addEventListener('qm-phan', function () { ban = true; });
  document.addEventListener('qm-luot-do', function () { ban = true; });
  function duLieuMay() { var td = doc(K_TD) || {}; return { tu: td.tu || {}, kho: td.kho || {}, phan: (doc(K_PHAN) || {}).phan || {}, luotDo: (doc(K_LD) || {}).ds || {} }; }
  function dongBo() {                                        // gửi bản trên máy, máy chủ trộn với bản đã lưu rồi trả về bản chung
    if (!TK || !TK.hoSoId) return Promise.resolve();
    ban = false;
    return goi('luuTienDo', { hoSoId: TK.hoSoId, duLieu: duLieuMay() }).then(function (d) {
      var m = d.duLieu || {}, td = { v: 1, tu: m.tu || {}, kho: m.kho || {}, capNhat: Date.now() };
      if (window.QM_TIENDO && QM_TIENDO.nap) QM_TIENDO.nap(td); else ghi(K_TD, td);
      PHAN = { v: 1, phan: m.phan || {} }; ghi(K_PHAN, PHAN);
      if (m.luotDo) {                                        // máy chủ bản cũ không trả luotDo: giữ nguyên bản trên máy
        var ldMay = (doc(K_LD) || {}).ds || {}, ldMoi = Object.assign({}, m.luotDo);
        Object.keys(ldMay).forEach(function (k) { if (!ldMoi[k] || (+ldMay[k].t || 0) > (+ldMoi[k].t || 0)) ldMoi[k] = ldMay[k]; });   // vừa lưu trên máy trong lúc chờ phản hồi
        ghi(K_LD, { v: 1, ds: ldMoi });
        try { document.dispatchEvent(new CustomEvent('qm-luot-do-nap')); } catch (e) {}
      }
      if ('lop' in d) apLop(d.lop);                          // máy chủ 2026-11-04a: kèm bài đã mở, bài được giao của lớp
      TK.dongBoLuc = Date.now(); luuTK(); try { localStorage.setItem(K_DB, String(Date.now())); } catch (e) {}
      veTienDo();
    }).catch(function (e) { ban = true; throw e; });
  }
  function dayLen(roiTrang) {                                // rời trang: gửi kèm keepalive, không chờ phản hồi
    if (!TK || !TK.hoSoId || !ban) return;
    ban = false;
    goi('luuTienDo', { hoSoId: TK.hoSoId, duLieu: duLieuMay() }, roiTrang).catch(function () { ban = true; });
  }
  setInterval(function () { if (ban) dongBo().catch(function () {}); }, 30000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') dayLen(true); });
  window.addEventListener('pagehide', function () { dayLen(true); });

  // ---------- Trang có chấm điểm: dùng hồ sơ thay hai ô họ tên, lớp ----------
  function ganBaiLam() {
    var hs = document.querySelector('.lt-hs'); if (!hs) return;
    var h = hoSoDang(), ten = hs.querySelector('.lt-hs-ten'), lop = hs.querySelector('.lt-hs-lop'), dong = hs.querySelector('.tk-hs-dong');
    if (!dong) { dong = document.createElement('div'); dong.className = 'tk-hs-dong'; hs.appendChild(dong); }
    if (h) {
      ten.value = h.hoTen; lop.value = h.lop; ten.dispatchEvent(new Event('change'));
      hs.classList.add('tk-co-hs');
      dong.innerHTML = '🎓 Đang học: <b>' + esc(h.hoTen) + '</b> · ' + esc(lopDu(h.lop)) + ' <button type="button" class="tk-doi">Đổi</button>';
    } else {
      hs.classList.remove('tk-co-hs');
      dong.innerHTML = TK ? '<button type="button" class="tk-moi">Chọn hồ sơ</button> để tự điền họ tên, lớp và lưu tiến độ học.'
        : '<button type="button" class="tk-moi">Đăng nhập bằng Google</button> để lưu điểm và tiến độ học, không phải gõ tên mỗi lần.';
    }
    dong.onclick = function (e) {
      if (e.target.closest('.tk-doi')) return TK.hoSo.length > 1 ? manChonHoSo() : manTaiKhoan();
      if (e.target.closest('.tk-moi')) return TK ? manChonHoSo() : manDangNhap('Đăng nhập để lưu điểm và tiến độ học.');
    };
  }

  // =====================================================================
  // 4. LỚP HỌC (máy chủ 2026-11-04a): bài cô đã mở cho lớp · bài cô giao · trang giáo viên
  //    Chỉ áp cho hồ sơ có MÃ LỚP. Chưa đăng nhập / tự học / tài khoản giáo viên: mọi bài vẫn mở như cũ.
  // =====================================================================
  function manGiaoVien(lanDau) {
    var nd = TK.nguoiDung || {};
    var b = moBang('<div class="tk-dau-tk">' + (nd.anh ? '<img src="' + esc(nd.anh) + '" alt="" referrerpolicy="no-referrer">' : '') + '<div><b>' + esc(nd.hoTen || '') + '</b><small>' + esc(nd.email || '') + '</small></div></div>' +
      (lanDau ? '<p class="tk-loi-moi">Chào cô! Tài khoản này là tài khoản giáo viên.</p>' : '') +
      '<div class="tk-menu"><a class="tk-btn chinh" href="' + ROOT + 'giao-vien/">🧑‍🏫 Vào trang giáo viên</a>' +
      '<button type="button" class="tk-btn" data-l="hs">🧑‍🎓 ' + ((TK.hoSo || []).length ? 'Học như học sinh (chọn hồ sơ)' : 'Tạo hồ sơ học sinh để thử') + '</button>' +
      '<button type="button" class="tk-btn" data-l="ra">↪ Đăng xuất</button></div>');
    b.addEventListener('click', function (e) {
      var l = (e.target.closest('[data-l]') || {}).dataset; if (!l) return;
      if (l.l === 'ra') return dangXuat();
      (TK.hoSo || []).length ? manChonHoSo() : manTaoHoSo(false);
    });
  }
  function lopDang() { var h = hoSoDang(); return h && h.maLop && TK.lop && TK.lop.maLop === h.maLop ? TK.lop : null; }
  // Mục của một cấp: bai-N, on-tap-1-5, tro-choi… Khoá mục "hsk1/bai-3", "h2/hsk1/tro-choi".
  // MỞ CHO MỌI NGƯỜI (Nhiên chốt 04/11/2026): Thư viện, Nhập môn (không thuộc cấp nào) và các mục dưới đây.
  // Mọi mục khác của chương trình: chỉ vào được khi cô đã mở cho lớp của hồ sơ đang chọn (tài khoản giáo viên: mở hết).
  var DA_HOI_LOP = false;                                   // trang này đã hỏi máy chủ lớp của hồ sơ chưa
  var MO_TU_DO = window.QM_MO_TU_DO = ['hsk1/bai-1', 'hsk1/bai-2', 'h2/hsk1/bai-1-2'];
  var RE_MUC = /(chuong-trinh-hsk(?:-2)?)\/(hsk[^\/]+)\/([a-z0-9-]+)(?:\/|$)/;
  function mucTuDuongDan(p) { var m = String(p || '').match(RE_MUC); return m ? { muc: CT_KHOA[m[1]] + m[2] + '/' + m[3], cap: m[1] + '/' + m[2] + '/' } : null; }
  function lyDoKhoa(muc) {                                   // null = được vào; 'khach' · 'chua-lop' · 'cho' (đang tải thông tin lớp) · 'chua-mo'
    if (MO_TU_DO.indexOf(muc) >= 0) return null;
    if (window.QM_PC && QM_PC.on && /\/tro-choi$/.test(muc)) return null;   // vào bằng mã phiên chơi cô tạo: cô đã cho chơi
    if (TK && TK.giaoVien) return null;
    if (!TK) return 'khach';
    var h = hoSoDang(); if (!h) return 'chua-lop';
    if (!h.maLop) return DA_HOI_LOP ? 'chua-lop' : 'cho';   // cô có thể vừa xếp em vào lớp: chờ hỏi máy chủ xong mới kết luận
    var L = lopDang(); if (!L) return 'cho';
    if (laMucKt(muc)) return ktDuocGiao(L, muc) ? null : 'chua-giao';
    return L.moBai.indexOf(muc) >= 0 ? null : 'chua-mo';
  }
  // Bài kiểm tra (2026-11-05): chỉ hiện khi lớp được GIAO (đã tới giờ bắt đầu), không theo "mở bài"; chưa giao thì thẻ ẩn hẳn
  function laMucKt(muc) { return /\/kiem-tra-[0-9-]+$/.test(muc); }
  function ktDuocGiao(L, muc) {
    var bayGio = Date.now();
    return (L.giaoBai || []).some(function (g) { return g.phan.indexOf(muc + '/') === 0 && (!g.batDau || g.batDau <= bayGio); });
  }
  function ngayGio(t) {
    var d = new Date(t), thu = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
    return ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ' ' + thu + ' ' + ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth() + 1)).slice(-2);
  }
  function tenTrang() { return document.title.split(' · ').filter(function (x) { return !/Tiếng Trung Diệu Kỳ/.test(x); }).join(' · '); }
  function veKhoa() {
    // Thẻ mục trên trang cấp: chưa được vào thì khoá thẻ (bỏ liên kết), được vào thì trả lại liên kết
    document.querySelectorAll('a.card[href], a.card[data-tk-href]').forEach(function (a) {
      var url = a.getAttribute('data-tk-href') ? new URL(a.getAttribute('data-tk-href'), location.href).pathname : a.pathname;
      var m = mucTuDuongDan(url); if (!m) return;
      var ly = lyDoKhoa(m.muc), nhanCu = a.querySelector('.tk-khoa-nhan');
      if (laMucKt(m.muc)) { a.hidden = !!ly; a.style.display = ly ? 'none' : ''; return; }     // bài kiểm tra: chưa giao thì ẩn thẻ (không hiện thẻ khoá)
      if (ly && ly !== 'cho') {
        if (!a.hasAttribute('data-tk-href')) { a.setAttribute('data-tk-href', a.getAttribute('href')); a.removeAttribute('href'); }
        var nhan = ly === 'chua-mo' ? '🔒 Cô chưa mở' : '🔒 Dành cho học viên lớp';
        a.classList.add('tk-khoa'); a.setAttribute('aria-disabled', 'true'); a.title = nhan.slice(3);
        if (nhanCu) nhanCu.textContent = nhan; else a.insertAdjacentHTML('afterbegin', '<span class="tk-khoa-nhan">' + nhan + '</span>');
      } else if (!ly && a.hasAttribute('data-tk-href')) {
        a.setAttribute('href', a.getAttribute('data-tk-href')); a.removeAttribute('data-tk-href');
        a.classList.remove('tk-khoa'); a.removeAttribute('aria-disabled'); a.removeAttribute('title');
        if (nhanCu) nhanCu.remove();
      }
    });
    // Đang ở trong một mục không được vào: che trang
    var m = mucTuDuongDan(location.pathname), ly = m ? lyDoKhoa(m.muc) : null, man = document.querySelector('.tk-khoa-man');
    if (!ly) { if (man) { man.remove(); document.body.classList.remove('tk-bi-khoa'); } return; }
    if (!man) { man = document.createElement('div'); man.className = 'tk-khoa-man'; man.setAttribute('role', 'alertdialog'); document.body.appendChild(man); }
    if (man.dataset.ly === ly) return;
    man.dataset.ly = ly;
    var L = lopDang(), h = TK && hoSoDang();
    var noi = {
      cho: '<div class="tk-ico">⏳</div><h3>Đang kiểm tra lớp của bạn…</h3>',
      khach: '<div class="tk-ico">🔒</div><h3>Bài này dành cho học viên lớp của cô</h3><p>Thư viện, Nhập môn và Bài 1–2 mở cho mọi người. Các bài khác cô mở cho từng lớp: bạn đăng nhập bằng Google rồi nhập <b>mã lớp</b> cô đưa nhé.</p>' +
        '<div class="tk-menu"><button type="button" class="tk-btn chinh" data-l="dn">Đăng nhập bằng Google</button><button type="button" class="tk-btn" data-l="nhan">💬 Nhắn cô xin học bài này</button>',
      'chua-lop': '<div class="tk-ico">🎓</div><h3>Bạn chưa vào lớp nào</h3><p>Bài này cô mở cho từng lớp. Bạn nhập <b>mã lớp</b> cô đưa vào hồ sơ' + (h ? ' <b>' + esc(h.hoTen) + '</b>' : '') + ', hoặc nhắn cô để được thêm vào lớp.</p>' +
        '<div class="tk-menu"><button type="button" class="tk-btn chinh" data-l="ma">Nhập mã lớp</button><button type="button" class="tk-btn" data-l="nhan">💬 Nhắn cô xin vào lớp</button>',
      'chua-giao': '<div class="tk-ico">📝</div><h3>Bài kiểm tra chưa được giao</h3><p>Bài kiểm tra chỉ mở khi cô giao cho <b>' + esc(lopDu(L ? L.tenLop : '')) + '</b>. Tới giờ làm bài, bạn tải lại trang này nhé.</p>' +
        '<div class="tk-menu">',
      'chua-mo': '<div class="tk-ico">🔒</div><h3>Bài này cô chưa mở</h3><p><b>' + esc(lopDu(L ? L.tenLop : '')) + '</b> sẽ học bài này khi cô mở trên lớp. Trong lúc chờ, bạn ôn lại các bài đã học nhé.</p>' +
        '<div class="tk-menu"><button type="button" class="tk-btn" data-l="nhan">💬 Nhắn cô xin mở bài</button>'
    }[ly];
    man.innerHTML = '<div class="tk-khoa-in">' + noi + (ly === 'cho' ? '' : '<a class="tk-btn nhe" href="' + ROOT + m.cap + '">← Về danh sách bài</a>' +
      (TK && ly !== 'khach' ? '<button type="button" class="tk-btn nhe" data-l="tk">Đổi hồ sơ / tài khoản</button>' : '') + '</div>') + '</div>';
    document.body.classList.add('tk-bi-khoa');
    man.onclick = function (e) {
      var l = (e.target.closest('[data-l]') || {}).dataset; if (!l) return;
      if (l.l === 'dn') return manDangNhap('Đăng nhập rồi nhập mã lớp cô đưa để vào học bài này.');
      if (l.l === 'ma') return hoSoDang() ? manTaoHoSo(false, true) : moNut();
      if (l.l === 'tk') return moNut();
      if (l.l === 'nhan') return manNhanCo('mo-bai', m.muc, ly === 'chua-lop' ? 'Em xin cô thêm em vào lớp để học "' + tenTrang() + '" ạ.' : 'Em xin cô mở "' + tenTrang() + '"' + (L ? ' cho lớp ' + L.tenLop : '') + ' ạ.');
    };
  }

  // ---------- Nhắn cô: xin mở bài, báo lỗi (máy chủ 2026-11-04c) ----------
  function manNhanCo(loai, muc, goiY) {
    var h = TK && hoSoDang();
    var b = moBang('<div class="tk-ico">💬</div><h3>Nhắn cô</h3><p class="tk-loi-moi">Xin mở bài, báo lỗi trên web, hay hỏi gì cũng được. Cô đọc và trả lời trong thời gian sớm nhất.</p>' +
      '<form class="tk-form"><label>Bạn muốn<select name="loai"><option value="mo-bai">Xin mở bài / vào lớp</option><option value="bao-loi">Báo lỗi trên web</option><option value="khac">Việc khác</option></select></label>' +
      (TK ? '<p class="tk-nho" style="margin:0">Gửi từ: <b>' + esc(h ? h.hoTen : (TK.nguoiDung || {}).hoTen || '') + '</b> · ' + esc((TK.nguoiDung || {}).email || '') + '. Cô trả lời thì bạn xem ở nút tài khoản → 💬 Tin nhắn với cô.</p>'
        : '<label>Họ tên<input name="hoTen" required maxlength="80" autocomplete="name"></label><label>Zalo / số điện thoại / email<input name="lienHe" required maxlength="120" placeholder="để cô liên hệ lại"></label>') +
      '<label>Nội dung<textarea name="noiDung" required maxlength="2000" rows="4"></textarea></label>' +
      '<p class="tk-nho" style="margin:0">Kèm theo: trang <b>' + esc(tenTrang() || location.pathname) + '</b></p>' +
      '<button class="tk-btn chinh" type="submit">Gửi cho cô</button><p class="tk-bao" aria-live="polite"></p></form>');
    var f = b.querySelector('form'); f.loai.value = loai || 'khac'; f.noiDung.value = goiY || '';
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var bao = b.querySelector('.tk-bao'), n = f.querySelector('button.chinh');
      n.disabled = true; bao.textContent = '⏳ Đang gửi…';
      goi('guiTin', { loai: f.loai.value, noiDung: f.noiDung.value, trang: location.pathname.replace(/^.*?(chuong-trinh-hsk|thu-vien|giao-vien|choi\/|index\.html|gioi-thieu\.html)/, '$1') + location.hash + ' · ' + tenTrang(),
        muc: muc || '', hoTen: f.hoTen ? f.hoTen.value : '', lienHe: f.lienHe ? f.lienHe.value : '', hoSoId: h ? h.hoSoId : '', hoTenGoogle: TK ? (TK.nguoiDung || {}).hoTen : '', maPhien: maPhien })
        .then(function () { dongBang(); baoNho('Đã gửi tin cho cô. Cảm ơn bạn!'); })
        .catch(function (x) { n.disabled = false; bao.textContent = '⚠️ ' + x.message; });
    });
  }
  function manTinCuaToi() {
    var b = moBang('<div class="tk-ico">💬</div><h3>Tin nhắn với cô</h3><div class="tk-ds-tin"><p class="tk-nho">⏳ Đang tải…</p></div>' +
      '<div class="tk-menu"><button type="button" class="tk-btn chinh" data-l="moi">✏️ Nhắn tin mới</button></div>');
    b.querySelector('[data-l=moi]').addEventListener('click', function () { manNhanCo('khac'); });
    goi('tinCuaToi', {}).then(function (d) {
      TK.xemTinLuc = Date.now(); TK.tinMoi = 0; luuTK(); veNut();
      var o = b.querySelector('.tk-ds-tin'); if (!o) return;
      o.innerHTML = d.tin.length ? d.tin.map(function (t) {
        return '<div class="tk-tin"><small>' + ngayGio(t.thoiDiem) + ' · ' + esc({ 'mo-bai': 'Xin mở bài', 'bao-loi': 'Báo lỗi' }[t.loai] || 'Tin nhắn') + '</small><p>' + esc(t.noiDung) + '</p>' +
          (t.traLoi ? '<div class="tk-tl"><b>Cô trả lời</b> <small>' + ngayGio(t.traLoiLuc) + '</small><p>' + esc(t.traLoi) + '</p></div>' : '<span class="tk-gn' + (t.trangThai === 'xong' ? ' xong">✓ Cô đã xử lý' : '">Cô chưa trả lời') + '</span>') + '</div>';
      }).join('') : '<p class="tk-nho">Bạn chưa nhắn cô lần nào.</p>';
    }).catch(function (x) { var o = b.querySelector('.tk-ds-tin'); if (o) o.innerHTML = '<p class="tk-loi">' + esc(x.message) + '</p>'; });
  }
  function keoTin() {                                        // có câu trả lời mới của cô: chấm đỏ trên nút tài khoản (hỏi tối đa 10 phút một lần)
    if (!TK || TK.giaoVien || Date.now() - (TK.tinLuc || 0) < 10 * 60000) return;
    TK.tinLuc = Date.now(); luuTK();
    goi('tinCuaToi', {}).then(function (d) {
      TK.tinMoi = d.tin.filter(function (t) { return t.traLoiLuc > (TK.xemTinLuc || 0); }).length; luuTK(); veNut();
    }).catch(function () {});
  }
  // Thông báo dùng dữ liệu học tập cho theo dõi + nghiên cứu: hiện một lần cho mỗi hồ sơ trên mỗi máy, bấm "Đã hiểu" thì ghi nhận (máy chủ lưu thời điểm)
  function thongBaoNghienCuu(lan) {
    var h = hoSoDang(); lan = lan || 0;
    if (!h) { if (lan < 12) setTimeout(function () { thongBaoNghienCuu(lan + 1); }, 4000); return; }
    var kh = 'qmhy:daDocTB:' + h.hoSoId; try { if (localStorage.getItem(kh)) return; } catch (e) {}
    if (document.querySelector('.tk-tb-nc')) return;
    var d = document.createElement('div'); d.className = 'tk-tb-nc'; d.setAttribute('role', 'status');
    d.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:9998;max-width:560px;margin:0 auto;background:#fff;border:1px solid #d9c9a8;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.18);padding:12px 14px;font-size:14px;line-height:1.45;color:#3b2f20';
    d.innerHTML = '<div>📌 Dữ liệu học tập của bạn (kết quả làm bài, thời gian học) được cô Nhiên dùng để theo dõi tiến độ, cải thiện bài giảng và có thể dùng cho nghiên cứu giáo dục.</div><div style="text-align:right;margin-top:8px"><button type="button" class="btn solid" style="padding:6px 16px">Đã hiểu</button></div>';
    d.querySelector('button').addEventListener('click', function () {
      try { localStorage.setItem(kh, '1'); } catch (e) {}
      d.remove(); try { goi('daDocThongBao', { hoSoId: h.hoSoId }).catch(function () {}); } catch (e) {}
    });
    document.body.appendChild(d);
  }
  setTimeout(thongBaoNghienCuu, 3500);
  function veNutNhan() {                                     // nút "💬 Nhắn cô" ở chân trang, mọi trang
    var o = document.querySelector('.sf-social'); if (!o || o.querySelector('.tk-nhan-co')) return;
    var n = document.createElement('button'); n.type = 'button'; n.className = 'tk-nhan-co'; n.innerHTML = '💬 <span>Nhắn cô</span>';
    n.addEventListener('click', function () { manNhanCo('khac'); });
    o.insertBefore(n, o.firstChild);
  }
  function veGiao() {
    var cu = document.querySelector('.tk-giao'), L = lopDang();
    var laChu = !!document.querySelector('.hero-btns') && !!document.getElementById('lo-trinh-hsk');
    var laCt = /chuong-trinh-hsk(?:-2)?\/(?:hsk[^\/]+\/)?(index\.html)?$/.test(location.pathname);
    var bayGio = Date.now();
    var theoPhan = {};                                       // cùng một phần giao nhiều lần: giữ lượt có hạn muộn nhất
    (L ? L.giaoBai || [] : []).forEach(function (g) { if ((!g.batDau || g.batDau <= bayGio) && (!theoPhan[g.phan] || g.hanNop > theoPhan[g.phan].hanNop)) theoPhan[g.phan] = g; });
    var ds = Object.keys(theoPhan).map(function (k) { return theoPhan[k]; });
    if (!(laChu || laCt) || !ds.length) { if (cu) cu.remove(); return; }
    ds = ds.map(function (g) {
      var x = PHAN.phan[g.phan], xong = !!(x && x.tt === 'xong');
      return { g: g, xong: xong, dang: !!x && !xong, qua: !xong && g.hanNop < bayGio };
    }).filter(function (o) { return !o.xong || bayGio - o.g.hanNop < 3 * 864e5; })   // đã xong: chỉ giữ tới 3 ngày sau hạn
      .sort(function (a, b) { return (a.xong - b.xong) || (a.g.hanNop - b.g.hanNop); });
    if (!ds.length) { if (cu) cu.remove(); return; }
    var conLai = ds.filter(function (o) { return !o.xong; }).length;
    var o = cu || document.createElement('div'); o.className = 'tk-giao';
    o.innerHTML = '<div class="tk-giao-dau"><b>📋 Bài cô giao</b><span>' + (conLai ? conLai + ' bài chưa xong' : 'Đã xong hết, giỏi lắm! 🎉') + '</span></div>' +
      '<ul>' + ds.map(function (x, i) {
        var g = x.g, nhan = x.xong ? '<span class="tk-gn xong">✓ Đã xong</span>' : x.qua ? '<span class="tk-gn qua">⏰ Quá hạn</span>' : x.dang ? '<span class="tk-gn dang">● Đang làm</span>' : '<span class="tk-gn">Chưa làm</span>';
        return '<li' + (i >= 5 ? ' class="tk-an"' : '') + '><a href="' + ROOT + urlTuKhoa(g.phan) + '"><span class="tk-gt"><b>' + esc(g.tenPhan || g.phan) + '</b>' +
          '<small>Hạn: ' + ngayGio(g.hanNop) + (g.ghiChu ? ' · ' + esc(g.ghiChu) : '') + '</small></span>' + nhan + '</a></li>';
      }).join('') + '</ul>' + (ds.length > 5 ? '<button type="button" class="tk-giao-them">Xem cả ' + ds.length + ' bài</button>' : '');
    if (!cu) {
      var cho = document.querySelector('.tk-hoc-tiep') || (laChu ? document.querySelector('.hero-btns') : document.querySelector('.sec-head'));
      if (!cho) return;
      cho.parentNode.insertBefore(o, cho.nextSibling);
      o.addEventListener('click', function (e) { if (e.target.closest('.tk-giao-them')) { o.classList.add('tk-mo-het'); e.target.remove(); } });
    }
  }
  function veLop() { veKhoa(); if (TK) veGiao(); }
  // Thông tin lớp từ máy chủ là chuẩn: cô có thể vừa xếp / chuyển / bỏ lớp cho hồ sơ này (bản hồ sơ trên máy có từ lúc đăng nhập)
  function apLop(L) {
    TK.lop = L || null; TK.lopLuc = Date.now(); DA_HOI_LOP = true;
    var h = hoSoDang();
    if (h) { var ma = L ? L.maLop : ''; if (h.maLop !== ma) { h.maLop = ma; if (L) h.lop = L.tenLop; ganBaiLam(); veNut(); } }
    luuTK(); veLop();
  }
  function keoLop(epBuoc) {                                 // hỏi máy chủ lớp của hồ sơ (tối đa 3 phút một lần, trừ khi trang đang bị khoá)
    var h = hoSoDang(); if (!h) return;
    if (!epBuoc && Date.now() - (TK.lopLuc || 0) < 3 * 60000) { DA_HOI_LOP = true; return veLop(); }
    goi('lopCuaToi', { hoSoId: h.hoSoId }).then(function (d) { apLop(d.lop); }).catch(function () {
      DA_HOI_LOP = true;
      var man = document.querySelector('.tk-khoa-man[data-ly=cho] .tk-khoa-in');   // không hỏi được máy chủ: báo thay vì chờ mãi
      if (man) man.innerHTML = '<div class="tk-ico">⚠️</div><h3>Chưa kiểm tra được lớp của bạn</h3><p>Bạn kiểm tra mạng rồi tải lại trang nhé.</p><div class="tk-menu"><button type="button" class="tk-btn chinh" onclick="location.reload()">Tải lại trang</button></div>';
    });
  }

  window.QM_TK = { hoSoId: function () { return TK && TK.hoSoId || ''; }, hoSoDang: hoSoDang, dangNhap: manDangNhap,
    dongBo: function () { return dongBo().catch(function () {}); }, veLop: veLop,
    // trang giáo viên dùng chung phiên đăng nhập
    giaoVien: function () { return !!(TK && TK.giaoVien) && !/[?&]xemhs=1/.test(location.search) && window.name !== 'qm-day-hs'; }, nguoiDung: function () { return TK && TK.nguoiDung || null; },
    goi: function (a, d, k) { return goi(a, d, k); }, moTaiKhoan: moNut, phien: function () { return TK && TK.phien || ''; },
    laGiaoVien: function () { if (TK && !TK.giaoVien) { TK.giaoVien = true; luuTK(); veNut(); } } };
  var LA_TRANG_GV = /\/giao-vien\/(index\.html)?$/.test(location.pathname);

  function batDau() {
    veNut(); ganBaiLam(); veLop(); veNutNhan();
    if (!TK || LA_TRANG_GV) return;
    keoTin();                          // trang giáo viên: không hỏi hồ sơ học sinh
    if (!TK.hoSoId) { if (TK.giaoVien) return; if ((TK.hoSo || []).length) manChonHoSo(); else manTaoHoSo(true); return; }
    var mTrang = mucTuDuongDan(location.pathname);
    keoLop(!!(mTrang && MO_TU_DO.indexOf(mTrang.muc) < 0) || !(hoSoDang() || {}).maLop);   // đang ở mục cần quyền, hoặc hồ sơ chưa có lớp: hỏi ngay
    if ((TK.hoSo || []).length > 1 && !ssDoc('qm-tk-da-chon')) return manChonHoSo();   // một email nhiều hồ sơ: mỗi lần mở web hỏi ai học
    var lan = +localStorage.getItem(K_DB) || 0;
    if (window.QM_LD_KEO || Date.now() - lan > 5 * 60000) dongBo().catch(function () {});   // trang có lượt làm dở: luôn kéo bản mới (có thể từ máy khác)   // kéo tiến độ mới (từ máy khác) tối đa 5 phút một lần
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', batDau); else batDau();
})();
