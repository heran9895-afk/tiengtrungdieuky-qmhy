/* =========================================================
   LỘ TRÌNH HSK 3.0 — Tiếng Trung Diệu Kỳ
   Dựng các ô Nhập môn, HSK 1 … HSK 7–9 vào chỗ có <div id="lo-trinh-hsk"></div>.
   Danh sách cấp và trạng thái "Sắp có" lấy từ MENU trong assets/js/header.js
   (mở một cấp: xoá "sapCo: true" ở đó, menu và mọi trang lộ trình tự cập nhật).
   Nhúng SAU header.js.
   ========================================================= */
(function () {
  var hop = document.getElementById('lo-trinh-hsk');
  if (!hop || !window.QM_MENU) return;
  var src = document.currentScript.src;
  var ROOT = src.substring(0, src.indexOf('assets/js/lo-trinh.js'));

  var muc = window.QM_MENU.filter(function (m) { return m.link === 'chuong-trinh-hsk/'; })[0];
  var CAP = {};                                    // 'hsk1' -> mục trong menu
  muc.con.forEach(function (c) { CAP[c.link.split('/')[1]] = c; });

  // Chia tầng: tên tầng, nhãn nhỏ, màu nhãn (lớp của .tag), các cấp thuộc tầng
  var TANG = [
    { ten: 'Khởi đầu',  nho: 'Từ con số 0', mau: '',     cap: ['nhap-mon'] },
    { ten: 'Sơ cấp',    nho: 'Cấp 1 – 3',   mau: '',     cap: ['hsk1', 'hsk2', 'hsk3'] },
    { ten: 'Trung cấp', nho: 'Cấp 4 – 6',   mau: 'gold', cap: ['hsk4', 'hsk5', 'hsk6'] },
    { ten: 'Cao cấp',   nho: 'Cấp 7 – 9',   mau: 'red',  cap: ['hsk7-9'] }
  ];

  hop.innerHTML = TANG.map(function (t) {
    var o = t.cap.filter(function (k) { return CAP[k]; }).map(function (k) {
      var c = CAP[k], ben = '<div class="lv-num">' + c.ico + '</div><div><b>' + c.ten + '</b>';
      return c.sapCo
        ? '<div class="lv soon" aria-disabled="true">' + ben + '<span>Sắp có</span></div></div>'
        : '<a class="lv" href="' + ROOT + c.link + '">' + ben + '<span>Vào học →</span></div></a>';
    }).join('');
    return '<div class="band' + (t.cap.length === 1 ? ' mot' : '') + '">' +
      '<div class="band-name"><span class="tag' + (t.mau ? ' ' + t.mau : '') + '">' + t.ten + '</span><small>' + t.nho + '</small></div>' +
      '<div class="levels">' + o + '</div></div>';
  }).join('');
})();
