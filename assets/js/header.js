/* =========================================================
   HEADER + CHÂN TRANG CHUNG — Tiếng Trung Diệu Kỳ
   Mọi trang chỉ cần nhúng file này, header tự hiện ở đầu trang, chân trang tự hiện ở cuối.
   Muốn thêm/sửa mục menu: chỉ sửa danh sách MENU bên dưới.
   ========================================================= */
(function () {
  // Tự tìm thư mục gốc của web dựa vào vị trí file này (…/assets/js/header.js)
  var src = document.currentScript.src;
  var ROOT = src.substring(0, src.indexOf('assets/js/header.js'));

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
    { ten: 'Thư viện', link: 'thu-vien/', con: [
      { ten: 'Kho từ vựng 9 cấp',       link: 'thu-vien/tu-vung/',   ico: '📚' },
      { ten: 'Tiếng Trung theo chủ đề', link: 'thu-vien/chu-de/',    ico: '🗂️' },
      { ten: 'Phân biệt từ',            link: 'thu-vien/phan-biet/', ico: '⚖️' },
      { ten: 'Sách hay',                link: 'thu-vien/sach-hay/',  ico: '📖' },
      { ten: 'Chơi vui, học thật',      link: 'thu-vien/tro-choi/',  ico: '🎮' }
    ]},
    { ten: 'Chương trình HSK 3.0', link: 'chuong-trinh-hsk/' },
    { ten: 'Giới thiệu & Liên hệ', link: 'gioi-thieu.html' }
  ];

  // Đánh dấu mục đang mở
  var here = location.href.split('#')[0].split('?')[0].replace(/index\.html$/, '');
  function dangO(link) {
    var full = (ROOT + link).replace(/index\.html$/, '');
    if (link === 'index.html') return here === full;
    return here.indexOf(full) === 0;
  }

  var navHTML = MENU.map(function (m) {
    if (!m.con) {
      return '<a class="sh-link' + (dangO(m.link) ? ' active' : '') + '" href="' + ROOT + m.link + '">' + m.ten + '</a>';
    }
    var conHTML = m.con.map(function (c) {
      return '<a href="' + ROOT + c.link + '"' + (dangO(c.link) ? ' class="active"' : '') + '>' +
             '<span class="sh-ico">' + c.ico + '</span>' + c.ten + '</a>';
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
    '<div class="sf-end">© ' + new Date().getFullYear() + ' Tiếng Trung Diệu Kỳ · Giáo viên Nguyễn Hà Nhiên</div>' +
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
  function thuGon() {
    var y = window.scrollY;
    if (y > 120) hdr.classList.add('sh-compact');
    else if (y < 20) hdr.classList.remove('sh-compact');
  }
  window.addEventListener('scroll', thuGon, { passive: true });
  thuGon();

  // Nút menu trên điện thoại
  var nav = wrap.querySelector('.sh-nav');
  wrap.querySelector('.sh-burger').addEventListener('click', function () { nav.classList.toggle('open'); });
  // Bấm "Thư viện" để mở/đóng danh sách con (cần cho điện thoại)
  wrap.querySelectorAll('.sh-drop > button').forEach(function (b) {
    b.addEventListener('click', function () { b.parentNode.classList.toggle('open'); });
  });
})();
