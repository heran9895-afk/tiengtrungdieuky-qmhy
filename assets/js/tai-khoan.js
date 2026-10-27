/* =========================================================
   TÀI KHOẢN · TIẾN ĐỘ HỌC · LƯỢT TRUY CẬP — Tiếng Trung Diệu Kỳ (quy chuẩn 12)
   header.js tự nạp file này ở MỌI trang (kèm cau-hinh.js nếu trang chưa nạp).

   1. Trạng thái từng phần của bài (Từ vựng, Ngữ pháp, Ôn tập, Bài tập, Test): luôn chạy, lưu trên máy (khoá "qm-phan-v1").
      Trang bài: dấu ✓ trên phần đã xong · Trang HSK: "x/y phần đã xong" · Trang chủ: nút "Học tiếp".
   2. Đăng nhập Google + hồ sơ học sinh + đồng bộ tiến độ: chỉ bật khi cau-hinh.js có QM_TK_API và QM_GOOGLE_CLIENT_ID.
      Không chặn nội dung: chưa đăng nhập vẫn học, làm bài như cũ.
   3. Lượt truy cập: mỗi lần mở trang gửi một dòng lên máy chủ tài khoản (khi có QM_TK_API).
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
  function doc(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function ghi(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function ssDoc(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssGhi(k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
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
    PHAN.phan[k.khoa] = moi; luuPhan();
  }
  function xemTu(ma, tong) {                                 // Từ vựng: xem đủ mọi từ (bảng chi tiết hoặc thẻ lật) là xong
    if (!TRANG_NAY) return;
    var x = PHAN.phan[TRANG_NAY.khoa] || { tt: 'dang-hoc', t: Date.now(), url: TRANG_NAY.url, ten: tenTrangNay() };
    var xem = x.xem || [];
    if (xem.indexOf(ma) < 0) { xem.push(ma); x.xem = xem; PHAN.phan[TRANG_NAY.khoa] = x; }
    if (tong && xem.length >= tong) { danhDau('xong'); delete PHAN.phan[TRANG_NAY.khoa].xem; luuPhan(); }
    else luuPhan();
  }
  var cho = window.QM_PHAN && window.QM_PHAN.q || [];         // header.js đặt sẵn hàng đợi: lệnh gọi trước khi file này nạp xong
  window.QM_PHAN = { danhDau: danhDau, xemTu: xemTu, ds: function () { return PHAN.phan; } };
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
      s.textContent = x.tt === 'xong' ? '✓ Đã xong' : '● Đang học';
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
  function veTienDo() { veDauTich(); veTienDoCap(); veHocTiep(); }
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
    if (!nut) { nut = document.createElement('button'); nut.type = 'button'; nut.className = 'tk-nut'; bar.appendChild(nut); nut.addEventListener('click', function () { TK ? (hoSoDang() ? manTaiKhoan() : (TK.hoSo || []).length ? manChonHoSo() : manTaoHoSo()) : manDangNhap(); }); }
    var h = hoSoDang();
    nut.innerHTML = TK ? (TK.nguoiDung && TK.nguoiDung.anh ? '<img src="' + esc(TK.nguoiDung.anh) + '" alt="" referrerpolicy="no-referrer">' : '<span class="tk-nut-chu">' + esc(((h && h.hoTen) || 'A').trim().split(' ').pop().charAt(0)) + '</span>') +
      '<span class="tk-nut-ten">' + esc(h ? h.hoTen.trim().split(' ').pop() : 'Chọn hồ sơ') + '</span>' : '<span class="tk-nut-ico">👤</span><span class="tk-nut-ten">Đăng nhập</span>';
    nut.setAttribute('aria-label', TK ? 'Tài khoản' : 'Đăng nhập');
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
      TK = { phien: d.phien, nguoiDung: d.nguoiDung, hoSo: d.hoSo || [], hoSoId: '' }; luuTK(); veNut();
      if (!TK.hoSo.length) return manTaoHoSo(true);
      if (TK.hoSo.length === 1) return chonHoSo(TK.hoSo[0].hoSoId);
      manChonHoSo();
    }).catch(function (e) { if (bao) bao.textContent = '⚠️ ' + e.message; });
  }

  function manTaoHoSo(lanDau, sua) {
    var h = sua ? hoSoDang() : null;
    var b = moBang('<div class="tk-ico">' + (sua ? '✏️' : '🧑‍🎓') + '</div><h3>' + (sua ? 'Sửa hồ sơ' : lanDau ? 'Tạo hồ sơ học sinh' : 'Thêm hồ sơ học sinh') + '</h3>' +
      (lanDau ? '<p class="tk-loi-moi">Chào ' + esc(TK.nguoiDung.hoTen || TK.nguoiDung.email) + '! Điền một lần, các lần sau không phải gõ tên khi làm bài.</p>' : '') +
      (!sua && !lanDau ? '<p class="tk-loi-moi">Anh chị em dùng chung tài khoản này thì mỗi người một hồ sơ để điểm không bị dồn vào nhau.</p>' : '') +
      '<form class="tk-form"><label>Họ tên đầy đủ<input name="hoTen" required maxlength="80" autocomplete="name" placeholder="VD: Nguyễn Văn An" value="' + esc(h ? h.hoTen : '') + '"></label>' +
      '<label>Lớp<input name="lop" required maxlength="40" placeholder="VD: HSK1-K3" value="' + esc(h ? h.lop : '') + '"></label>' +
      (sua ? '' : '<label class="tk-dong-y"><input type="checkbox" name="dongY" required><span>Mình đồng ý để web lưu họ tên, lớp, điểm và tiến độ học của mình để phục vụ việc học.</span></label>') +
      '<button class="tk-btn chinh" type="submit">' + (sua ? 'Lưu' : 'Tạo hồ sơ') + '</button><p class="tk-bao" aria-live="polite"></p></form>' + (sua ? '' : DU_LIEU));
    b.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, bao = b.querySelector('.tk-bao'), nutL = f.querySelector('button');
      nutL.disabled = true; bao.textContent = '⏳ Đang lưu…';
      goi(sua ? 'suaHoSo' : 'taoHoSo', { hoSoId: sua ? h.hoSoId : undefined, hoTen: f.hoTen.value, lop: f.lop.value, dongY: sua ? undefined : f.dongY.checked })
        .then(function (d) { TK.hoSo = d.hoSo; luuTK(); if (sua) { ganBaiLam(); veNut(); dongBang(); baoNho('Đã lưu hồ sơ.'); } else chonHoSo(d.hoSoId); })
        .catch(function (x) { nutL.disabled = false; bao.textContent = '⚠️ ' + x.message; });
    });
  }
  function manChonHoSo() {
    var b = moBang('<div class="tk-ico">👋</div><h3>Hôm nay là ai học?</h3>' +
      '<div class="tk-ds-hs">' + TK.hoSo.map(function (h) { return '<button type="button" class="tk-hs" data-id="' + esc(h.hoSoId) + '"><b>' + esc(h.hoTen) + '</b><small>Lớp ' + esc(h.lop) + '</small></button>'; }).join('') + '</div>' +
      '<div class="tk-hang"><button type="button" class="tk-btn tk-them">➕ Thêm hồ sơ</button><button type="button" class="tk-btn tk-ra">Đăng xuất</button></div>');
    b.addEventListener('click', function (e) {
      var x = e.target.closest('.tk-hs'); if (x) return chonHoSo(x.dataset.id);
      if (e.target.closest('.tk-them')) return manTaoHoSo(false);
      if (e.target.closest('.tk-ra')) return dangXuat();
    });
  }
  function manTaiKhoan() {
    var h = hoSoDang(), nd = TK.nguoiDung || {};
    var b = moBang('<div class="tk-dau-tk">' + (nd.anh ? '<img src="' + esc(nd.anh) + '" alt="" referrerpolicy="no-referrer">' : '') + '<div><b>' + esc(nd.hoTen || '') + '</b><small>' + esc(nd.email || '') + '</small></div></div>' +
      '<div class="tk-dang-hs"><small>Đang học</small><b>' + esc(h.hoTen) + '</b><span>Lớp ' + esc(h.lop) + '</span></div>' +
      '<p class="tk-nho tk-dong-bo">' + (TK.dongBoLuc ? 'Tiến độ đã đồng bộ lúc ' + new Date(TK.dongBoLuc).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : 'Tiến độ đang được đồng bộ…') + '</p>' +
      '<div class="tk-menu">' + (TK.hoSo.length > 1 ? '<button type="button" class="tk-btn" data-l="doi">🔄 Đổi hồ sơ</button>' : '') +
      '<button type="button" class="tk-btn" data-l="them">➕ Thêm hồ sơ</button><button type="button" class="tk-btn" data-l="sua">✏️ Sửa họ tên, lớp</button>' +
      '<button type="button" class="tk-btn" data-l="ra">↪ Đăng xuất</button><button type="button" class="tk-btn nhe" data-l="xoa">🗑 Xoá dữ liệu của tôi</button></div>');
    b.addEventListener('click', function (e) {
      var l = (e.target.closest('[data-l]') || {}).dataset; if (!l) return;
      ({ doi: manChonHoSo, them: function () { manTaoHoSo(false); }, sua: function () { manTaoHoSo(false, true); }, ra: dangXuat, xoa: manXoa })[l.l]();
    });
  }
  function manXoa() {
    var h = hoSoDang();
    var b = moBang('<div class="tk-ico">🗑</div><h3>Xoá dữ liệu</h3><p class="tk-loi-moi">Xoá trên máy chủ tài khoản, không lấy lại được.</p>' +
      '<div class="tk-menu"><button type="button" class="tk-btn" data-x="hs">Xoá hồ sơ "' + esc(h.hoTen) + '" và tiến độ của hồ sơ này</button>' +
      '<button type="button" class="tk-btn do" data-x="tk">Xoá toàn bộ tài khoản: mọi hồ sơ, tiến độ, lượt truy cập</button>' +
      '<button type="button" class="tk-btn" data-x="thoi">Thôi, quay lại</button></div><p class="tk-bao" aria-live="polite"></p>' +
      '<p class="tk-nho">Điểm các bài đã nộp nằm ở Bảng xếp hạng (máy chủ điểm riêng). Muốn xoá điểm, bạn nhắn cô qua Zalo nhé.</p>');
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
    var hien = { td: doc(K_TD), phan: doc(K_PHAN) };
    if (chu) ghi('qm-luu@' + chu, hien);
    var cat = doc('qm-luu@' + id) || { td: null, phan: null };
    var co = chu ? cat : tronMay(hien, cat);                 // từ chưa đăng nhập → gộp với bản đã cất của hồ sơ (nếu có)
    ghi(K_TD, co.td); ghi(K_PHAN, co.phan); ghi('qm-luu@' + id, null);
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
    }); });
    return { td: { v: 1, tu: tu, kho: kho, capNhat: Date.now() }, phan: { v: 1, phan: ph } };
  }
  function boChu() {                                         // đăng xuất / xoá: cất bản của hồ sơ, máy trở về trạng thái chưa đăng nhập (trống)
    var chu = localStorage.getItem(K_CHU) || '';
    if (chu && TK && (TK.hoSo || []).some(function (h) { return h.hoSoId === chu; })) ghi('qm-luu@' + chu, { td: doc(K_TD), phan: doc(K_PHAN) });
    ghi(K_TD, null); ghi(K_PHAN, null); try { localStorage.removeItem(K_CHU); } catch (e) {}
    try { localStorage.removeItem('qmhy:hoSo'); } catch (e) {}   // họ tên, lớp đã nhớ cho trang Bài tập: máy dùng chung không để lộ tên người trước
  }
  function chonHoSo(id) {
    ssGhi('qm-tk-da-chon', '1');
    var canTaiLai = doiChu(id);
    TK.hoSoId = id; luuTK(); veNut(); ganBaiLam();
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
  function duLieuMay() { var td = doc(K_TD) || {}; return { tu: td.tu || {}, kho: td.kho || {}, phan: (doc(K_PHAN) || {}).phan || {} }; }
  function dongBo() {                                        // gửi bản trên máy, máy chủ trộn với bản đã lưu rồi trả về bản chung
    if (!TK || !TK.hoSoId) return Promise.resolve();
    ban = false;
    return goi('luuTienDo', { hoSoId: TK.hoSoId, duLieu: duLieuMay() }).then(function (d) {
      var m = d.duLieu || {}, td = { v: 1, tu: m.tu || {}, kho: m.kho || {}, capNhat: Date.now() };
      if (window.QM_TIENDO && QM_TIENDO.nap) QM_TIENDO.nap(td); else ghi(K_TD, td);
      PHAN = { v: 1, phan: m.phan || {} }; ghi(K_PHAN, PHAN);
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
      dong.innerHTML = '🎓 Đang học: <b>' + esc(h.hoTen) + '</b> · Lớp ' + esc(h.lop) + ' <button type="button" class="tk-doi">Đổi</button>';
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

  window.QM_TK = { hoSoId: function () { return TK && TK.hoSoId || ''; }, hoSoDang: hoSoDang, dangNhap: manDangNhap };

  function batDau() {
    veNut(); ganBaiLam();
    if (!TK) return;
    if (!TK.hoSoId) { if ((TK.hoSo || []).length) manChonHoSo(); else manTaoHoSo(true); return; }
    if ((TK.hoSo || []).length > 1 && !ssDoc('qm-tk-da-chon')) return manChonHoSo();   // một email nhiều hồ sơ: mỗi lần mở web hỏi ai học
    var lan = +localStorage.getItem(K_DB) || 0;
    if (Date.now() - lan > 5 * 60000) dongBo().catch(function () {});   // kéo tiến độ mới (từ máy khác) tối đa 5 phút một lần
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', batDau); else batDau();
})();
