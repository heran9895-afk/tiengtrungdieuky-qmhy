/* Sửa nội dung bài học (2026-11-14): chỗ cô sửa ở trang giáo viên (tab Bộ câu hỏi) được chồng lên các tệp data/*.json lúc tải.
   An toàn: máy chủ chậm / lỗi / bản gốc đã đổi → dùng bản gốc, trang không hỏng. Địa chỉ máy chủ = QM_TK_API (cau-hinh.js), có bản dự phòng vì header.js chạy trước. */
(function () {
  try {
    if (window.QM_SUA || !window.fetch) return;
    var GOC = window.fetch.bind(window), KHOA = 'qm-nds-v1', HAN = 5 * 60000, CHO = 2000;
    var DU_PHONG = 'https://script.google.com/macros/s/AKfycbyG-GAzZtfnWdmRwJAzY5-FKruv1Bc1BXDQOcL8mYMkR_9sgF8ldfGzANWFeda5-wO6/exec';
    function api() { return window.QM_TK_API || DU_PHONG; }
    function docLS() { try { return JSON.parse(localStorage.getItem(KHOA) || '{}'); } catch (e) { return {}; } }
    function ghiLS(o) { try { localStorage.setItem(KHOA, JSON.stringify(o)); } catch (e) {} }
    function tepCua(u) { var m = String(u).split('?')[0].match(/(?:^|\/)data\/(.+\.json)$/); return m ? m[1] : null; }
    var DANG = {};
    function tai(tep, ep) {                         // → Promise<{đường dẫn: {m, g}}>
      var ls = docLS(), c = ls[tep];
      if (!ep && c && Date.now() - c.t < HAN) return Promise.resolve(c.d);
      var p = DANG[tep];
      if (!p || ep) p = DANG[tep] = GOC(api(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'noiDungSua', tep: [tep] }) })
        .then(function (r) { return r.json(); })
        .then(function (o) { if (!o || !o.ok) throw 0; var d = (o.sua && o.sua[tep]) || {}, l = docLS(); l[tep] = { t: Date.now(), d: d }; ghiLS(l); delete DANG[tep]; return d; })
        .catch(function () { delete DANG[tep]; throw 0; });
      var cho = new Promise(function (_, no) { setTimeout(no, CHO); });
      return Promise.race([p, cho]).catch(function () { return c ? c.d : {}; });
    }
    function di(goc, duong) {                       // đi theo đường dẫn "a/3/b" → {cha, khoa} hoặc null
      var ks = duong.split('/').map(decodeURIComponent), cur = goc;
      for (var i = 0; i < ks.length - 1; i++) { if (cur == null || typeof cur !== 'object') return null; cur = cur[ks[i]]; }
      return cur != null && typeof cur === 'object' ? { cha: cur, khoa: ks[ks.length - 1] } : null;
    }
    function ap(goc, sua) {                         // chồng bản sửa lên dữ liệu; câu "__xoa" gỡ ra sau cùng (từ chỉ số lớn xuống nhỏ)
      var xoa = [];
      Object.keys(sua || {}).forEach(function (dd) {
        try {
          var x = sua[dd], v = di(goc, dd); if (!v || v.cha[v.khoa] === undefined) return;
          if (JSON.stringify(v.cha[v.khoa]) !== x.g) return;     // bản gốc đã đổi: bỏ bản sửa cũ
          if (x.m === '__xoa') xoa.push(v); else v.cha[v.khoa] = JSON.parse(x.m);
        } catch (e) {}
      });
      xoa.sort(function (a, b) { return (+b.khoa || 0) - (+a.khoa || 0); }).forEach(function (v) {
        if (Array.isArray(v.cha)) v.cha.splice(+v.khoa, 1); else delete v.cha[v.khoa];
      });
      return goc;
    }
    window.QM_SUA = { tai: function (t) { return tai(t, true).catch(function () { return {}; }); }, ap: ap, ghiNho: function (t, d) { var l = docLS(); l[t] = { t: Date.now(), d: d }; ghiLS(l); }, tepCua: tepCua };
    window.fetch = function (u, o) {
      try {
        var url = typeof u === 'string' ? u : (u && u.url) || '', tep = tepCua(url);
        if (!tep || /[?&]goc=1/.test(url) || (o && o.method && o.method !== 'GET')) return GOC(u, o);
        return GOC(u, o).then(function (r) {
          if (!r.ok) return r;
          return r.clone().json().then(function (d) {
            return tai(tep).then(function (sua) {
              if (!sua || !Object.keys(sua).length) return r;
              return new Response(JSON.stringify(ap(d, sua)), { status: 200, headers: { 'Content-Type': 'application/json' } });
            });
          }).catch(function () { return r; });
        });
      } catch (e) { return GOC(u, o); }
    };
  } catch (e) {}
})();
/* Chế độ dạy trên lớp (mở từ tab "Dạy trên lớp" của trang giáo viên, trong khung iframe): ?day=1 ẩn header/chân trang cho rộng màn hình;
   &xemhs=1 = xem như học sinh (ẩn công cụ giáo viên). */
(function () {
  var q = location.search + ' ' + (window.name || ''); if (!/[?&]day=1/.test(q) && !/^qm-day/.test(window.name || '')) return;   // window.name giữ chế độ khi cô bấm sang trang khác ngay trong khung
  var css = '.sh-header,.sh-nav-bar,.sf,.sf-end{display:none!important}body{padding-bottom:0!important}';
  if (/[?&]xemhs=1/.test(q) || window.name === 'qm-day-hs') css += '.dc-gv,.dc-khu-gv,.gt-fab{display:none!important}';
  var st = document.createElement('style'); st.textContent = css; (document.head || document.documentElement).appendChild(st);
})();
/* =========================================================
   HEADER + CHÂN TRANG CHUNG — Tiếng Trung Diệu Kỳ
   Mọi trang chỉ cần nhúng file này, header tự hiện ở đầu trang, chân trang tự hiện ở cuối.
   Muốn thêm/sửa mục menu: chỉ sửa danh sách MENU bên dưới.
   ========================================================= */
(function () {
  // Tự tìm thư mục gốc của web dựa vào vị trí file này (…/assets/js/header.js)
  var src = document.currentScript.src;
  var ROOT = src.substring(0, src.indexOf('assets/js/header.js'));
  // Trạng thái từng phần của bài: các trang gọi QM_PHAN.danhDau / xemTu bất cứ lúc nào; tai-khoan.js nạp xong sẽ xử lý hàng đợi này
  window.QM_PHAN = window.QM_PHAN || { q: [],
    danhDau: function () { this.q.push(['danhDau', [].slice.call(arguments)]); },
    xemTu: function () { this.q.push(['xemTu', [].slice.call(arguments)]); } };

  var ZALO = 'https://zalo.me/0973754714';
  var FACEBOOK = 'https://www.facebook.com/profile.php?id=61595601028689';

  // Ủng hộ cô một cốc trà sữa: ảnh QR đặt trong assets/img/, điền thông tin tài khoản nếu muốn hiện chữ bên dưới QR
  var UNG_HO = {
    loiMoi: 'Nếu thấy kiến thức hữu ích, có thể mời cô một cốc trà sữa tại đây nhé',
    anhQR: 'assets/img/qr-ung-ho.jpg',
    nganHang: 'Techcombank',
    soTK: '19034329264011',
    chuTK: 'NGUYEN HA NHIEN'
  };

  var MENU = [
    { ten: 'Trang chủ', link: 'index.html' },
    // Mục nào chưa có trang: để "sapCo: true" (menu hiện mờ "Sắp có", mọi nút/thẻ trỏ tới mục đó trên web tự khoá lại).
    // Có trang rồi: xoá "sapCo: true" là mở ở mọi nơi. "mota" là dòng mô tả hiện trên thẻ ở trang Thư viện và trang chủ.
    { ten: 'Thư viện', link: 'thu-vien/', con: [
      { ten: 'Kho từ vựng 9 cấp',       link: 'thu-vien/tu-vung/',   ico: '📚', mota: 'Toàn bộ từ vựng HSK 3.0: tra cứu, nghe phát âm.' },
      { ten: 'Luyện từ vựng',           link: 'thu-vien/tu-vung/luyen-tap/', ico: '🧠', mota: 'Nghe chọn từ, chọn pinyin, ghép cặp, điền từ, sắp xếp câu, gõ chữ Hán theo từng cấp.' },
      { ten: 'Tiếng Trung theo chủ đề', link: 'thu-vien/chu-de/',    ico: '🗂️', mota: 'Từ vựng và mẫu câu cho từng tình huống trong đời sống, công việc.', sapCo: true },
      { ten: 'Phân biệt từ',            link: 'thu-vien/phan-biet/', ico: '⚖️', mota: 'Gỡ rối những cặp từ dễ nhầm, có ví dụ và bài luyện kèm theo.', sapCo: true },
      { ten: 'Sách hay',                link: 'thu-vien/sach-hay/',  ico: '📖', mota: 'Những cuốn sách cô chọn lọc giới thiệu, giúp học tiếng Trung hiệu quả hơn.', sapCo: true },
      { ten: 'Chơi vui, học thật',      link: 'thu-vien/tro-choi/',  ico: '🎮', mota: 'Trò chơi ôn từ vựng, vừa giải trí vừa nhớ bài lâu hơn.', sapCo: true }
    ]},
    // Cấp nào chưa có bài: để "sapCo: true" (hiện mờ, chữ "Sắp có"). Có bài rồi: xoá "sapCo: true" là mở.
    { ten: 'Chương trình HSK 3.0', link: 'chuong-trinh-hsk/', con: [
      { ten: 'Nhập môn tiếng Trung', link: 'chuong-trinh-hsk/nhap-mon/', ico: '🌱' },
      { ten: 'HSK 1',   link: 'chuong-trinh-hsk/hsk1/',   ico: '1' },
      { ten: 'HSK 2',   link: 'chuong-trinh-hsk/hsk2/',   ico: '2',   sapCo: true },
      { ten: 'HSK 3',   link: 'chuong-trinh-hsk/hsk3/',   ico: '3',   sapCo: true },
      { ten: 'HSK 4',   link: 'chuong-trinh-hsk/hsk4/',   ico: '4',   sapCo: true },
      { ten: 'HSK 5',   link: 'chuong-trinh-hsk/hsk5/',   ico: '5',   sapCo: true },
      { ten: 'HSK 6',   link: 'chuong-trinh-hsk/hsk6/',   ico: '6',   sapCo: true },
      { ten: 'HSK 7–9', link: 'chuong-trinh-hsk/hsk7-9/', ico: '7–9', sapCo: true }
    ]},
    // HSK 2.0: giáo trình HSK 标准教程, cho các lớp còn học theo khung 2.0. Cấp nào có bài thì xoá "sapCo: true".
    { ten: 'Chương trình HSK 2.0', link: 'chuong-trinh-hsk-2/', con: [
      { ten: 'HSK 1', link: 'chuong-trinh-hsk-2/hsk1/', ico: '1' },
      { ten: 'HSK 2', link: 'chuong-trinh-hsk-2/hsk2/', ico: '2', sapCo: true },
      { ten: 'HSK 3', link: 'chuong-trinh-hsk-2/hsk3/', ico: '3', sapCo: true },
      { ten: 'HSK 4', link: 'chuong-trinh-hsk-2/hsk4/', ico: '4', sapCo: true },
      { ten: 'HSK 5', link: 'chuong-trinh-hsk-2/hsk5/', ico: '5', sapCo: true },
      { ten: 'HSK 6', link: 'chuong-trinh-hsk-2/hsk6/', ico: '6', sapCo: true }
    ]},
    { ten: 'Giới thiệu & Liên hệ', link: 'gioi-thieu.html' }
  ];
  window.QM_MENU = MENU;   // dùng chung: assets/js/lo-trinh.js đọc danh sách cấp HSK từ đây, chỉ cần sửa một chỗ

  // Đánh dấu mục đang mở
  var here = location.href.split('#')[0].split('?')[0].replace(/index\.html$/, '');
  function dangO(link, laCon) {
    var full = (ROOT + link).replace(/index\.html$/, '');
    if (link === 'index.html') return here === full;
    if (here.indexOf(full) !== 0) return false;
    if (!laCon) return true;
    // mục con: có mục con khác dài hơn cũng khớp (vd "Luyện từ vựng" nằm trong "Kho từ vựng") thì nhường cho mục đó
    return !MENU.some(function (m) { return (m.con || []).some(function (c) {
      var f = (ROOT + c.link).replace(/index\.html$/, ''); return f.length > full.length && here.indexOf(f) === 0 && f.indexOf(full) === 0; }); });
  }


  var navHTML = MENU.map(function (m) {
    if (!m.con) {
      return '<a class="sh-link' + (dangO(m.link) ? ' active' : '') + '" href="' + ROOT + m.link + '">' + m.ten + '</a>';
    }
    var conHTML = m.con.map(function (c) {
      var ico = '<span class="sh-ico' + (c.ico.length > 2 ? ' nho' : '') + '">' + c.ico + '</span>';
      if (c.sapCo) return '<span class="sh-soon" aria-disabled="true">' + ico + c.ten + '<em class="sh-pill">Sắp có</em></span>';
      return '<a href="' + ROOT + c.link + '"' + (dangO(c.link, true) ? ' class="active"' : '') + '>' + ico + c.ten + '</a>';
    }).join('');
    return '<div class="sh-drop">' +
      '<button class="sh-link' + (dangO(m.link) ? ' active' : '') + '" type="button">' + m.ten + '<span class="sh-caret">▼</span></button>' +
      '<div class="sh-menu">' + conHTML + '</div></div>';
  }).join('');

  var html =
    '<div class="sh-header"><header class="sh-banner"><div class="header-top">' +
      '<a class="logo-block" href="' + ROOT + 'index.html">' +
        '<div class="logo-img-wrap"><img src="' + ROOT + 'assets/img/logo.webp" alt="Logo 奇妙汉语"></div>' +
        '<div class="logo-text"><div class="logo-chinese">奇妙汉语</div>' +
          '<div class="logo-divider"><div class="logo-divider-line"></div><div class="logo-divider-dot"></div><div class="logo-divider-dot"></div><div class="logo-divider-dot"></div><div class="logo-divider-line"></div></div>' +
          '<div class="logo-viet">Tiếng Trung Diệu Kỳ</div></div>' +
      '</a>' +
      '<div class="slogan-block">' +
        '<div class="slogan-wrap"><span class="slogan-deco">❧</span><span class="slogan-main">奇妙汉语，学语言悟人生</span><span class="slogan-deco flip">❧</span></div>' +
        '<div class="slogan-line"><div class="slogan-line-bar"></div><div class="slogan-line-dot"></div><div class="slogan-line-bar"></div></div>' +
        '<div class="slogan-teacher"><span class="teacher-badge">Giáo viên</span><div class="teacher-sep"></div><span class="teacher-name">Nguyễn Hà Nhiên</span></div>' +
      '</div>' +
      '<div class="contact-block">' +
        '<a class="contact-btn btn-zalo" href="' + ZALO + '" target="_blank" rel="noopener"><div class="btn-icon">Z</div><div class="btn-label"><small>Liên hệ qua</small>Zalo: 0973754714</div></a>' +
        '<a class="contact-btn btn-facebook" href="' + FACEBOOK + '" target="_blank" rel="noopener"><div class="btn-icon">f</div><div class="btn-label"><small>Theo dõi trên</small>Facebook</div></a>' +
      '</div>' +
    '</div></header>' +
    '<div class="sh-nav-bar">' +
      '<button class="sh-burger" type="button">☰ &nbsp;Menu</button>' +
      '<nav class="sh-nav">' + navHTML + '</nav>' +
    '</div></div>';

  // Chèn thẳng vào đầu <body> (để thanh menu dính được khi cuộn)
  var wrap = document.createElement('div');
  wrap.innerHTML = html;
  var first = document.body.firstChild;
  while (wrap.firstChild) document.body.insertBefore(wrap.firstChild, first);
  wrap = document.body;

  // ================= THANH CUỐI TRANG (luôn hiện, giống header) =================
  var soDep = UNG_HO.soTK.replace(/(\d{4})(?=\d)/g, '$1 ');
  var footer =
    '<div class="sf-end">© ' + new Date().getFullYear() + ' Tiếng Trung Diệu Kỳ · Giáo viên Nguyễn Hà Nhiên<br><small>Dữ liệu học tập (kết quả làm bài, thời gian học) được dùng để theo dõi tiến độ, cải thiện bài giảng và có thể dùng cho nghiên cứu giáo dục.</small></div>' +
    '<footer class="sf"><div class="sf-in">' +
      '<a class="sf-brand" href="' + ROOT + 'index.html"><img src="' + ROOT + 'assets/img/logo.webp" alt="Logo 奇妙汉语">' +
        '<span class="sf-name"><b>奇妙汉语</b><small>Tiếng Trung Diệu Kỳ</small></span></a>' +
      '<button class="sf-tea" type="button">' +
        '<span class="sf-orn">❧</span>' +
        '<span class="sf-tea-txt">Ủng hộ cô tại đây nhé</span>' +
        '<span class="sf-cup">🧋</span>' +
        '<span class="sf-orn lat">❧</span>' +
      '</button>' +
      '<span class="sf-social">' +
        '<a class="sf-ic" href="' + ZALO + '" target="_blank" rel="noopener" aria-label="Zalo">Z</a>' +
        '<a class="sf-ic" href="' + FACEBOOK + '" target="_blank" rel="noopener" aria-label="Facebook">f</a>' +
      '</span>' +
    '</div></footer>';
  document.body.insertAdjacentHTML('beforeend', footer);

  // Mọi nút / thẻ trên trang trỏ tới mục còn "Sắp có" thì tự khoá lại (không bấm vào trang 404)
  var SAP_CO = {};
  MENU.forEach(function (m) { (m.con || []).forEach(function (c) { if (c.sapCo) SAP_CO[(ROOT + c.link).replace(/index\.html$/, '')] = 1; }); });
  document.querySelectorAll('a[href]').forEach(function (a) {
    if (!SAP_CO[a.href.split('#')[0].split('?')[0].replace(/index\.html$/, '')]) return;
    a.removeAttribute('href'); a.classList.add('sap-co'); a.setAttribute('aria-disabled', 'true'); a.title = 'Sắp có';
    var go = a.querySelector('.go');
    if (go) go.textContent = 'Sắp có';
    else if (a.classList.contains('card')) a.insertAdjacentHTML('beforeend', '<span class="go">Sắp có</span>');
    else a.insertAdjacentHTML('beforeend', ' <small>(Sắp có)</small>');
  });
  document.body.classList.add('co-sf');

  // Bảng ủng hộ (bấm nút trà sữa mới hiện)
  var bang;
  document.querySelector('.sf-tea').addEventListener('click', function () {
    if (!bang) {
      bang = document.createElement('div'); bang.className = 'sf-pop';
      bang.innerHTML = '<div class="sf-pop-in">' +
        '<button class="sf-pop-x" type="button" aria-label="Đóng">✕</button>' +
        '<div class="sf-pop-ico">🧋</div>' +
        '<p class="sf-pop-loi">' + UNG_HO.loiMoi + '</p>' +
        '<img class="sf-pop-qr" src="' + ROOT + UNG_HO.anhQR + '" alt="Mã QR ủng hộ cô Hà Nhiên">' +
        '<div class="sf-bank"><b>' + UNG_HO.nganHang + '</b><span>' + soDep + '</span><span>' + UNG_HO.chuTK + '</span></div>' +
        '<div class="sf-pop-btns"><a class="sf-dl" href="' + ROOT + UNG_HO.anhQR + '" download="QR-ung-ho-co-Ha-Nhien.jpg">⬇ Lưu ảnh QR</a>' +
        '<button class="sf-dl sf-chep" type="button">⧉ Chép số tài khoản</button></div>' +
        '<small>Dùng điện thoại? Lưu ảnh QR rồi mở ứng dụng ngân hàng, chọn quét mã từ ảnh.</small>' +
        '<div class="sf-pop-cam">Cảm ơn bạn đã ủng hộ cô! 💚</div></div>';
      document.body.appendChild(bang);
      bang.addEventListener('click', function (e) { if (e.target === bang || e.target.closest('.sf-pop-x')) bang.classList.remove('on'); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') bang.classList.remove('on'); });
      var cp = bang.querySelector('.sf-chep');
      cp.addEventListener('click', function () {
        if (navigator.clipboard) navigator.clipboard.writeText(UNG_HO.soTK).then(function () {
          cp.textContent = '✓ Đã chép'; setTimeout(function () { cp.textContent = '⧉ Chép số tài khoản'; }, 2000);
        });
      });
    }
    bang.classList.add('on');
  });

  // Khi cuộn xuống: header vẫn dính trên đầu nhưng thu gọn lại cho đỡ chiếm chỗ
  var hdr = document.querySelector('.sh-header');
  // Thu gọn làm header thấp đi một đoạn (gọi là "co"). Chỉ thu gọn khi đã cuộn quá đoạn co đó và trang còn đủ dài,
  // nếu không: header co lại -> trình duyệt kéo trang về sát đầu -> header mở ra -> lại co... thành vòng nhấp nháy.
  var caoGon = 100;                                        // chiều cao khi thu gọn, đo lại sau lần thu gọn đầu tiên
  function thuGon() {
    var y = window.scrollY, cuonDuoc = document.documentElement.scrollHeight - window.innerHeight;
    if (hdr.classList.contains('sh-compact')) {
      caoGon = hdr.offsetHeight;
      if (y < 20) hdr.classList.remove('sh-compact');
    } else {
      var co = hdr.offsetHeight - caoGon;
      if (y > co + 40 && cuonDuoc - co > 60) hdr.classList.add('sh-compact');
    }
  }
  window.addEventListener('scroll', thuGon, { passive: true });
  thuGon();

  // Nút menu trên điện thoại
  var nav = wrap.querySelector('.sh-nav');
  wrap.querySelector('.sh-burger').addEventListener('click', function () { nav.classList.toggle('open'); });
  // Bấm "Thư viện" / "Chương trình HSK 3.0" để mở/đóng danh sách con (cần cho điện thoại)
  wrap.querySelectorAll('.sh-drop > button').forEach(function (b) {
    b.addEventListener('click', function () { b.parentNode.classList.toggle('open'); });
  });

  // Tài khoản, tiến độ từng phần, lượt truy cập (quy chuẩn 12): nạp ở MỌI trang; trang chưa nạp cấu hình thì nạp cau-hinh.js trước
  var phienBan = (src.match(/\?v=[^&#]+/) || [''])[0];
  function napJs(ten, xong) { var s = document.createElement('script'); s.src = ROOT + 'assets/js/' + ten + phienBan; s.onload = s.onerror = xong || null; document.body.appendChild(s); }
  var napNhatKy = function () { napJs('nhat-ky.js'); };            // nhật ký từng lần làm + thời gian học (cần QM_TK của tai-khoan.js)
  if (typeof window.QM_TK_API === 'undefined') napJs('cau-hinh.js', function () { napJs('tai-khoan.js', napNhatKy); }); else napJs('tai-khoan.js', napNhatKy);
})();
