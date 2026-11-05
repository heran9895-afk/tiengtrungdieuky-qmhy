/* =========================================================
   BÀI KIỂM TRA — Tiếng Trung Diệu Kỳ (05/11/2026)
   Đề + đáp án nằm ở máy chủ tài khoản (trang KiemTraDe), KHÔNG nằm trong web. Học sinh chỉ nhận đề (đã bỏ đáp án)
   khi lớp được giao và đang trong khung giờ; máy chủ giữ giờ, tự lưu, chấm bài (tools/may-chu/tai-khoan-Code.gs, kt…).
   Giao diện: cả đề trên một trang cuộn, làm câu nào trước cũng được, sửa đáp án tới khi nộp; đồng hồ đếm ngược luôn
   hiện ở đầu màn hình, phút cuối có tiếng tích tắc; nộp bài thì báo các câu chưa làm.
   Tài khoản giáo viên: chế độ xem thử (đủ đáp án, không ghi điểm).
   ========================================================= */
(function () {
  var app = document.getElementById('kt-app'); if (!app) return;
  var MA_DE = app.dataset.ma, KHOA_PHAN = app.dataset.phan, URL_PHAN = app.dataset.url;
  var LUOT_NGHE = 2;

  // ---------------- tiện ích ----------------
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function hai(n) { return ('0' + n).slice(-2); }
  function ngayGio(t) { var d = new Date(t), thu = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()]; return hai(d.getHours()) + ':' + hai(d.getMinutes()) + ' ' + thu + ' ' + hai(d.getDate()) + '/' + hai(d.getMonth() + 1); }
  function so(x) { return String(Math.round(x * 100) / 100).replace('.', ','); }
  function bam(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function tron(ds, hat) {                                   // đảo thứ tự cố định theo hồ sơ + câu (tải lại trang vẫn giữ thứ tự)
    var a = ds.slice(), x = hat || 1;
    var r = function () { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
    for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function chuan(s) { return String(s == null ? '' : s).replace(/[\s，。？！、；：,.?!;:“”"'‘’…—\-·（）()《》]/g, ''); }
  function goi(a, d) { return QM_TK.goi(a, Object.assign({ hoSoId: QM_TK.hoSoId(), maDe: MA_DE }, d || {})); }
  var toastHen;
  function bao(t, loi) {
    var b = document.querySelector('.kt-toast'); if (!b) { b = document.createElement('div'); b.className = 'kt-toast'; document.body.appendChild(b); }
    b.textContent = t; b.classList.toggle('loi', !!loi); b.classList.add('on');
    clearTimeout(toastHen); toastHen = setTimeout(function () { b.classList.remove('on'); }, loi ? 6000 : 3500);
  }
  function man(html) { app.innerHTML = '<div class="kt-the kt-giua">' + html + '</div>'; }

  // ---------------- chờ tai-khoan.js ----------------
  var lan = 0;
  (function cho() {
    if (window.QM_TK && QM_TK.goi && QM_TK.phien) return batDau();
    if (window.QM_TK && !QM_TK.goi) return man('<div class="kt-ico">⚠️</div><p>Web chưa nối máy chủ tài khoản.</p>');
    if (++lan > 150) return man('<div class="kt-ico">⚠️</div><p>Chưa tải được phần tài khoản. Bạn tải lại trang nhé.</p>');
    setTimeout(cho, 100);
  })();

  var DE = null, TL = {}, NGHE = {}, LECH = 0, HET = 0, GV = false, XEM_DA = false, THU = 1;
  var THONG_TIN = null;

  function batDau() {
    if (!QM_TK.phien()) {
      man('<div class="kt-ico">🔒</div><h2>Đăng nhập để làm bài kiểm tra</h2><p>Bài kiểm tra dành cho học viên lớp của cô. Bạn đăng nhập bằng Google (hồ sơ có mã lớp) rồi vào lại trang này.</p>' +
        '<button type="button" class="kt-nut chinh" data-l="dn">Đăng nhập bằng Google</button>');
      app.querySelector('[data-l=dn]').onclick = function () { QM_TK.dangNhap('Đăng nhập để làm bài kiểm tra.'); };
      var t = setInterval(function () { if (QM_TK.phien()) { clearInterval(t); batDau(); } }, 700);
      return;
    }
    if (QM_TK.giaoVien && QM_TK.giaoVien() && !QM_TK.hoSoId()) return xemThuGv();
    if (!QM_TK.hoSoId()) { man('<div class="kt-ico">🧑‍🎓</div><p>Bạn chọn hồ sơ học sinh (nút tài khoản ở đầu trang) rồi tải lại trang nhé.</p>'); return; }
    man('<p class="kt-cho">⏳ Đang kiểm tra bài được giao…</p>');
    goi('ktXem', {}).then(veTrangThai).catch(function (x) {
      if (QM_TK.giaoVien && QM_TK.giaoVien()) return xemThuGv();
      man('<div class="kt-ico">⚠️</div><p>' + esc(x.message) + '</p><button type="button" class="kt-nut" onclick="location.reload()">Tải lại</button>');
    });
  }

  // ---------------- màn trước khi làm ----------------
  function veTrangThai(d) {
    LECH = (d.bayGio || Date.now()) - Date.now();
    THONG_TIN = d.thongTin || null;
    var tt = d.trangThai, I = d.thongTin || {};
    if ((tt === 'chua-co-de' || tt === 'chua-giao') && QM_TK.giaoVien && QM_TK.giaoVien()) return xemThuGv();   // tài khoản cô đang chọn hồ sơ học sinh: vẫn xem thử
    if (tt === 'chua-co-de' || tt === 'chua-giao') return man('<div class="kt-ico">📝</div><h2>Bài kiểm tra chưa được giao</h2><p>Bài kiểm tra chỉ mở khi cô giao cho lớp của bạn. Tới giờ làm bài, bạn tải lại trang này nhé.</p>');
    if (tt === 'het-han') return man('<div class="kt-ico">⏰</div><h2>Đã hết hạn làm bài</h2><p>Hạn nộp: <b>' + ngayGio(I.hanNop) + '</b>. Bạn chưa làm bài này; nếu có lý do, bạn bấm 💬 Nhắn cô ở chân trang nhé.</p>');
    if (tt === 'da-nop') return veKetQua(d.ketQua);
    var dang = tt === 'dang-lam', con = dang ? Math.max(0, d.hetGioLuc - (Date.now() + LECH)) : 0;
    man('<div class="kt-ico">📝</div><h2>' + esc(I.ten || 'Bài kiểm tra') + '</h2>' +
      '<ul class="kt-tom"><li><b>' + I.soCau + '</b> câu</li><li><b>' + so(I.toiDa) + '</b> điểm</li><li><b>' + I.phut + '</b> phút</li></ul>' +
      '<p>Hạn nộp: <b>' + ngayGio(I.hanNop) + '</b>' + (I.ghiChu ? ' · ' + esc(I.ghiChu) : '') + '</p>' +
      '<ul class="kt-luat"><li>Cả đề hiện trên một trang: làm câu nào trước cũng được, <b>sửa đáp án thoải mái tới khi nộp</b>.</li>' +
      '<li>Đồng hồ chạy từ lúc bấm <b>Bắt đầu</b> và luôn hiện ở đầu màn hình. Phút cuối có tiếng tích tắc nhắc giờ; hết giờ bài tự nộp.</li>' +
      '<li>Bài làm tự lưu từng câu: mất mạng, tải lại trang hay đổi máy vẫn làm tiếp được, giờ vẫn tính tiếp.</li>' +
      '<li>Mỗi bài nghe phát tối đa <b>' + LUOT_NGHE + ' lần</b>. Câu gõ chữ, câu dịch: bật bộ gõ tiếng Trung và <b>chỉ gõ chữ Hán</b>.</li>' +
      '<li>Chỉ làm <b>một lượt</b>. Bật loa / đeo tai nghe trước khi bắt đầu.</li></ul>' +
      (dang ? '<p class="kt-nhan">Bạn đang làm dở · còn <b>' + Math.ceil(con / 60000) + ' phút</b></p>' : '') +
      '<button type="button" class="kt-nut chinh to" data-l="bd">' + (dang ? '▶ Làm tiếp' : '▶ Bắt đầu làm bài') + '</button>');
    app.querySelector('[data-l=bd]').onclick = function (e) {
      var n = e.currentTarget; n.disabled = true; n.textContent = '⏳ Đang tải đề…';
      moAmThanh();
      goi('ktBatDau', { thietBi: /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'dien-thoai' : 'may-tinh' }).then(function (d) {
        if (d.trangThai !== 'dang-lam' || !d.de) return veTrangThai(d);
        LECH = d.bayGio - Date.now(); HET = d.hetGioLuc; DE = d.de; NGHE = d.nghe || {};
        TL = Object.assign({}, docMay(), d.traLoi || {});      // bài trên máy (chưa kịp gửi) + bài máy chủ đã lưu
        veDe();
      }).catch(function (x) { n.disabled = false; n.textContent = '▶ Thử lại'; bao('⚠️ ' + x.message, true); });
    };
  }

  // ---------------- giáo viên: xem thử ----------------
  function xemThuGv() {
    GV = true;
    man('<p class="kt-cho">⏳ Đang tải đề (chế độ giáo viên)…</p>');
    QM_TK.goi('gvKtDe', { maDe: MA_DE }).then(function (d) {
      if (!d.de) return man('<div class="kt-ico">📝</div><h2>Chưa có đề trên máy chủ</h2><p>Cô vào <a href="' + QM_TV.ROOT + 'giao-vien/">Trang giáo viên → 📝 Kiểm tra</a> để nạp tệp đề.</p>');
      DE = d.de; TL = {}; NGHE = {}; HET = Date.now() + (+DE.phut || 60) * 60000; LECH = 0;
      moAmThanh(); veDe();
    }).catch(function (x) { man('<div class="kt-ico">⚠️</div><p>' + esc(x.message) + '</p>'); });
  }

  // ---------------- âm thanh: tiếng tích tắc phút cuối ----------------
  var AC = null;
  function moAmThanh() { try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) {} }
  function tich(cao) {
    if (!AC) return;
    try {
      var t = AC.currentTime, o = AC.createOscillator(), g = AC.createGain();
      o.type = 'square'; o.frequency.value = cao ? 1500 : 1000;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + 0.07);
    } catch (e) {}
  }
  function chuong() { [0, 0.25, 0.5].forEach(function (d) { setTimeout(function () { tich(true); }, d * 1000); }); }

  // ---------------- vẽ đề ----------------
  var CAU = [];                                            // danh sách câu theo thứ tự
  function hatCau(c) { return bam((QM_TK.hoSoId() || 'gv') + '|' + c.id); }
  function veDe() {
    CAU = []; DE.phan.forEach(function (p) { p.cau.forEach(function (c) { c._p = p; CAU.push(c); }); });
    var tongDiem = CAU.reduce(function (s, c) { return s + (+c.diem || 0); }, 0);
    app.innerHTML =
      '<div class="kt-thanh" role="region" aria-label="Đồng hồ và tiến độ">' +
        '<div class="kt-dh" aria-live="off"><span class="kt-dh-ico">⏱</span><b class="kt-gio">--:--</b></div>' +
        '<button type="button" class="kt-tien" data-l="ds"><b class="kt-da">0</b>/' + CAU.length + ' câu<span class="kt-tien-nho"> · Danh sách câu ▾</span></button>' +
        '<span class="kt-luu" aria-live="polite"></span>' +
        '<button type="button" class="kt-nut chinh" data-l="nop">' + (GV ? 'Xem kết quả thử' : 'Nộp bài') + '</button>' +
        '<div class="kt-bang-cau" hidden>' + DE.phan.map(function (p) {
          return '<div class="kt-bc-phan"><small>' + esc(p.ten) + '</small><div>' + p.cau.map(function (c) { return '<button type="button" class="kt-o" data-toi="' + c.id + '">' + c.so + '</button>'; }).join('') + '</div></div>';
        }).join('') + '<p class="kt-bc-chu"><span class="kt-o da">1</span> đã làm · <span class="kt-o">2</span> chưa làm · <span class="kt-o nua">3</span> làm chưa đủ</p></div>' +
      '</div>' +
      (GV ? '<div class="kt-gv-thanh">🧑‍🏫 <b>Chế độ giáo viên — xem thử</b>, không ghi điểm. <label><input type="checkbox" class="kt-hien-da"> Hiện đáp án</label>' +
        '<button type="button" class="kt-nut nho" data-l="thu-phut">⏩ Thử 1 phút cuối</button></div>' : '') +
      '<div class="kt-dau-de"><h2>' + esc(DE.ten) + '</h2><p>' + CAU.length + ' câu · ' + so(tongDiem) + ' điểm · ' + DE.phut + ' phút</p>' +
        '<nav class="kt-muc">' + DE.phan.map(function (p) { return '<a href="#kt-' + p.ma + '">' + esc(p.ten) + '</a>'; }).join('') + '</nav></div>' +
      DE.phan.map(vePhan).join('') +
      '<div class="kt-cuoi"><button type="button" class="kt-nut chinh to" data-l="nop">' + (GV ? 'Xem kết quả thử' : '📤 Nộp bài') + '</button><p>Trước khi nộp, bạn có thể kéo lên sửa bất kỳ câu nào.</p></div>';
    CAU.forEach(function (c) { capNhatCau(c); });
    app.addEventListener('click', bamApp);
    app.addEventListener('input', goApp);
    app.addEventListener('change', doiApp);
    app.addEventListener('compositionend', function (e) { if (e.target.matches('.kt-go')) nhacBoGo(e.target); });
    app.addEventListener('focusout', function (e) { if (e.target.matches('.kt-go')) nhacBoGo(e.target); });
    if (GV) app.querySelector('.kt-hien-da').addEventListener('change', function (e) { app.classList.toggle('kt-hien-dap-an', e.target.checked); });
    demDa(); chayDongHo(); datDinh();
    window.addEventListener('resize', datDinh);
    window.scrollTo({ top: app.offsetTop - 10 });
  }
  function vePhan(p) {
    var diem = p.cau.reduce(function (s, c) { return s + (+c.diem || 0); }, 0);
    return '<section class="kt-phan" id="kt-' + p.ma + '"><div class="kt-phan-dau"><h3>' + esc(p.ten) + '</h3><span>' + p.cau.length + ' câu · ' + so(diem) + ' điểm</span></div>' +
      (p.huongDan ? '<p class="kt-hd">' + esc(p.huongDan) + '</p>' : '') + p.cau.map(veCau).join('') + '</section>';
  }
  function chuTq(s) { return '<span class="kt-cn">' + esc(s) + '</span>'; }
  function coHan(s) { return /[一-鿿]/.test(s); }
  function deHtml(s) { return esc(s).replace(/([一-鿿〇＿，。？！：、“”…—　]+)/g, '<span class="kt-cn">$1</span>').replace(/\n/g, '<br>'); }
  function veCau(c) {
    var h = '';
    if (c.doan) h += '<div class="kt-doan"><b>' + esc(c.tenDoan || 'Bài đọc') + '</b><div class="kt-cn kt-doan-chu">' + esc(c.doan).replace(/\n/g, '<br>') + '</div></div>';
    h += '<div class="kt-cau" id="kt-' + c.id + '" data-id="' + c.id + '"><div class="kt-cau-dau"><span class="kt-so">Câu ' + c.so + '</span><span class="kt-diem">' + so(c.diem) + ' đ</span></div>';
    if (c.am && c.am.length) h += '<button type="button" class="kt-nghe" data-nghe="' + c.id + '">🔊 Nghe <small></small></button>';
    h += '<div class="kt-de">' + deHtml(c.de) + '</div>';
    if (c.hoi) h += '<div class="kt-hoi">' + chuTq(c.hoi) + '</div>';
    h += '<div class="kt-tl">' + veTraLoi(c) + '</div>';
    if (GV) h += '<div class="kt-dap-an">' + dapAnHtml(c) + '</div>';
    return h + '</div>';
  }
  function veTraLoi(c) {
    var hat = hatCau(c);
    if (c.dang === 'chon') return '<div class="kt-pa' + (c.pa.some(function (x) { return x.length > 14; }) ? ' doc' : '') + '">' + tron(c.pa.map(function (_, i) { return i; }), hat).map(function (i) {
      return '<button type="button" class="kt-chon" data-c="' + c.id + '" data-v="' + i + '">' + (coHan(c.pa[i]) ? chuTq(c.pa[i]) : esc(c.pa[i])) + '</button>'; }).join('') + '</div>';
    if (c.dang === 'dungsai') return '<div class="kt-pa"><button type="button" class="kt-chon" data-c="' + c.id + '" data-v="1">✓ Đúng</button><button type="button" class="kt-chon" data-c="' + c.id + '" data-v="0">✗ Sai</button></div>';
    if (c.dang === 'ghep') {
      var thu = tron(c.phai.map(function (_, i) { return i; }), hat);
      return '<div class="kt-ghep">' + c.trai.map(function (t, i) {
        return '<label class="kt-ghep-dong">' + chuTq(t) + '<select data-c="' + c.id + '" data-i="' + i + '"><option value="">— chọn —</option>' +
          thu.map(function (j) { return '<option value="' + j + '">' + esc(c.phai[j]) + '</option>'; }).join('') + '</select></label>';
      }).join('') + '</div>';
    }
    if (c.dang === 'nhom') return '<div class="kt-nhom">' + tron(c.tu.map(function (_, i) { return i; }), hat).map(function (i) {
      return '<div class="kt-nhom-dong" data-i="' + i + '">' + chuTq(c.tu[i]) + '<span>' + c.nhom.map(function (n, g) {
        return '<button type="button" class="kt-chon nho" data-c="' + c.id + '" data-i="' + i + '" data-v="' + g + '">' + esc(n) + '</button>'; }).join('') + '</span></div>';
    }).join('') + '</div>';
    if (c.dang === 'ghepBo') return '<div class="kt-pa">' + tron(c.o.map(function (_, i) { return i; }), hat).map(function (i) {
      return '<button type="button" class="kt-chon bo" data-c="' + c.id + '" data-bo="' + i + '">' + chuTq(c.o[i]) + '</button>'; }).join('') + '</div><p class="kt-nho">Bấm để chọn / bỏ chọn thành phần.</p>';
    if (c.dang === 'xep') return '<div class="kt-xep"><div class="kt-xep-cau" data-c="' + c.id + '"></div><div class="kt-xep-kho">' +
      tron(c.khoi.map(function (_, i) { return i; }), hat).map(function (i) { return '<button type="button" class="kt-khoi" data-c="' + c.id + '" data-k="' + i + '">' + chuTq(c.khoi[i]) + '</button>'; }).join('') +
      '</div><button type="button" class="kt-lk" data-xoa-xep="' + c.id + '">↺ Xếp lại</button></div>';
    if (c.dang === 'go') {
      var ph = c.kieu === 'dich' ? 'Gõ bản dịch bằng chữ Hán…' : c.kieu === 'chu' ? '' : c.kieu === 'cau' ? 'Gõ cả câu bằng chữ Hán…' : 'Gõ chữ Hán…';
      var o = c.kieu === 'dich' || c.kieu === 'cau'
        ? '<textarea class="kt-go kt-cn" rows="2" data-c="' + c.id + '" placeholder="' + ph + '" autocomplete="off" autocorrect="off" spellcheck="false"></textarea>'
        : '<input class="kt-go kt-cn' + (c.kieu === 'chu' ? ' mot' : '') + '" data-c="' + c.id + '" ' + (c.kieu === 'chu' ? 'maxlength="2" ' : '') + 'placeholder="' + ph + '" autocomplete="off" autocorrect="off" spellcheck="false">';
      return o + '<p class="kt-latinh" hidden>⌨️ Bạn đang gõ chữ Latinh. Bật bộ gõ tiếng Trung (pinyin) để gõ ra <b>chữ Hán</b> nhé.</p>';
    }
    return '';
  }
  function dapAnHtml(c) {                                  // giáo viên xem thử / học sinh xem lại khi đã công bố
    var d = c.dapAn; if (d == null) return '';
    var t;
    if (c.dang === 'chon') t = c.pa[d];
    else if (c.dang === 'dungsai') t = d ? 'Đúng' : 'Sai';
    else if (c.dang === 'ghep') t = c.trai.map(function (x, i) { return x + ' – ' + c.phai[d[i]]; }).join(' · ');
    else if (c.dang === 'nhom') t = c.nhom.map(function (n, g) { return n + ': ' + c.tu.filter(function (_, i) { return d[i] === g; }).join(' '); }).join(' · ');
    else if (c.dang === 'ghepBo') t = d.map(function (i) { return c.o[i]; }).join(' + ');
    else t = [].concat(d)[0] + (c.dang === 'xep' ? c.dauCuoi || '' : '');
    return '<b>Đáp án:</b> ' + deHtml(t) + (c.sua ? ' → câu đúng: ' + chuTq(c.sua) : '') + (c.py ? '<br><small class="kt-py">' + esc(c.py).replace(/\n/g, '<br>') + '</small>' : '') + (c.giai ? '<br><small>' + esc(c.giai) + '</small>' : '');
  }

  // ---------------- trả lời ----------------
  function cauTheoId(id) { for (var i = 0; i < CAU.length; i++) if (CAU[i].id === id) return CAU[i]; return null; }
  function tinhTrang(c) {                                  // 'da' · 'nua' · ''
    var x = TL[c.id];
    if (x == null || x === '') return '';
    if (c.dang === 'ghep' || c.dang === 'nhom') { var n = (c.dang === 'ghep' ? c.trai : c.tu).length, co = 0; for (var i = 0; i < n; i++) if (x[i] != null && x[i] !== '') co++; return co === n ? 'da' : co ? 'nua' : ''; }
    if (c.dang === 'xep') return x.length === c.khoi.length ? 'da' : x.length ? 'nua' : '';
    if (c.dang === 'ghepBo') return x.length ? 'da' : '';
    if (c.dang === 'go') return chuan(x) ? 'da' : '';
    return 'da';
  }
  function capNhatCau(c) {
    var o = document.getElementById('kt-' + c.id); if (!o) return;
    var x = TL[c.id];
    if (c.dang === 'chon') o.querySelectorAll('.kt-chon').forEach(function (b) { b.classList.toggle('on', x === +b.dataset.v); });
    else if (c.dang === 'dungsai') o.querySelectorAll('.kt-chon').forEach(function (b) { b.classList.toggle('on', x != null && x === (b.dataset.v === '1')); });
    else if (c.dang === 'ghep') o.querySelectorAll('select').forEach(function (s) { var v = (x || [])[+s.dataset.i]; s.value = v == null ? '' : String(v); s.classList.toggle('on', v != null); });
    else if (c.dang === 'nhom') o.querySelectorAll('.kt-chon').forEach(function (b) { b.classList.toggle('on', (x || [])[+b.dataset.i] === +b.dataset.v); });
    else if (c.dang === 'ghepBo') o.querySelectorAll('.kt-chon').forEach(function (b) { b.classList.toggle('on', (x || []).indexOf(+b.dataset.bo) >= 0); });
    else if (c.dang === 'xep') {
      var ds = x || [];
      o.querySelector('.kt-xep-cau').innerHTML = ds.length ? ds.map(function (k, vt) { return '<button type="button" class="kt-khoi dat" data-c="' + c.id + '" data-vt="' + vt + '">' + chuTq(c.khoi[k]) + '</button>'; }).join('') + '<span class="kt-cn kt-dau-cuoi">' + esc(c.dauCuoi || '') + '</span>' : '<span class="kt-nho">Bấm các khối bên dưới theo đúng thứ tự.</span>';
      o.querySelectorAll('.kt-xep-kho .kt-khoi').forEach(function (b) { b.disabled = ds.indexOf(+b.dataset.k) >= 0; });
    } else if (c.dang === 'go') { var i = o.querySelector('.kt-go'); if (i && document.activeElement !== i) i.value = x || ''; }
    if (c.am) veNghe(c);
    var tt = tinhTrang(c); o.classList.toggle('da-lam', tt === 'da'); o.classList.toggle('nua', tt === 'nua');
    var nut = app.querySelector('.kt-o[data-toi="' + c.id + '"]'); if (nut) { nut.classList.toggle('da', tt === 'da'); nut.classList.toggle('nua', tt === 'nua'); }
  }
  function datTL(c, v) { if (v == null || (Array.isArray(v) && !v.some(function (y) { return y != null; }))) delete TL[c.id]; else TL[c.id] = v; capNhatCau(c); demDa(); henLuu(); }
  function bamApp(e) {
    var n = e.target.closest('[data-l]');
    if (n) {
      if (n.dataset.l === 'nop') return hoiNop();
      if (n.dataset.l === 'ds') { var b = app.querySelector('.kt-bang-cau'); b.hidden = !b.hidden; return; }
      if (n.dataset.l === 'thu-phut') { HET = Date.now() + 65000; bao('Đồng hồ còn 65 giây: thử tiếng tích tắc phút cuối'); return; }
    }
    var toi = e.target.closest('[data-toi]');
    if (toi) { app.querySelector('.kt-bang-cau').hidden = true; denCau(toi.dataset.toi); return; }
    var ng = e.target.closest('[data-nghe]'); if (ng) return nghe(cauTheoId(ng.dataset.nghe), ng);
    var xx = e.target.closest('[data-xoa-xep]'); if (xx) return datTL(cauTheoId(xx.dataset.xoaXep), null);
    var b2 = e.target.closest('.kt-chon, .kt-khoi'); if (!b2 || b2.disabled) return;
    var c = cauTheoId(b2.dataset.c); if (!c) return;
    if (c.dang === 'chon') datTL(c, +b2.dataset.v);
    else if (c.dang === 'dungsai') datTL(c, b2.dataset.v === '1');
    else if (c.dang === 'nhom') { var a = (TL[c.id] || []).slice(); while (a.length < c.tu.length) a.push(null); a[+b2.dataset.i] = +b2.dataset.v; datTL(c, a); }
    else if (c.dang === 'ghepBo') { var s = (TL[c.id] || []).slice(), k = +b2.dataset.bo, vt = s.indexOf(k); if (vt >= 0) s.splice(vt, 1); else s.push(k); datTL(c, s.length ? s : null); }
    else if (c.dang === 'xep') {
      var x = (TL[c.id] || []).slice();
      if (b2.dataset.vt != null) x.splice(+b2.dataset.vt, 1); else x.push(+b2.dataset.k);
      datTL(c, x.length ? x : null);
    }
  }
  function doiApp(e) {
    var s = e.target.closest('select[data-c]'); if (!s) return;
    var c = cauTheoId(s.dataset.c), a = (TL[c.id] || []).slice(); while (a.length < c.trai.length) a.push(null);
    var v = s.value === '' ? null : +s.value, i = +s.dataset.i;
    if (v != null) a.forEach(function (y, j) { if (y === v && j !== i) a[j] = null; });   // một pinyin chỉ ghép với một chữ
    a[i] = v; datTL(c, a);
  }
  function goApp(e) {
    var i = e.target.closest('.kt-go'); if (!i) return;
    var c = cauTheoId(i.dataset.c), v = i.value;
    if (c.kieu === 'chu' && !e.isComposing && chuan(v).length > 1) { v = chuan(v).slice(-1); i.value = v; }
    if (v.trim()) TL[c.id] = v; else delete TL[c.id];
    var o = document.getElementById('kt-' + c.id), tt = tinhTrang(c);
    o.classList.toggle('da-lam', tt === 'da');
    var nut = app.querySelector('.kt-o[data-toi="' + c.id + '"]'); if (nut) nut.classList.toggle('da', tt === 'da');
    if (!/[a-z]/i.test(v)) o.querySelector('.kt-latinh').hidden = true;
    demDa(); henLuu();
  }
  function nhacBoGo(i) { var o = i.closest('.kt-cau'); if (o) o.querySelector('.kt-latinh').hidden = !/[a-z]/i.test(i.value); }
  function demDa() {
    var n = CAU.filter(function (c) { return tinhTrang(c) === 'da'; }).length, o = app.querySelector('.kt-da');
    if (o) o.textContent = n;
  }
  // Thanh đồng hồ dính ngay dưới header của web (header cũng dính, thu gọn khi cuộn): đo mép dưới header mỗi lần cuộn
  function caoDau() { var h = document.querySelector('.sh-header'); if (!h || getComputedStyle(h).position === 'static') return 0; return Math.max(0, Math.round(h.getBoundingClientRect().bottom)); }
  var henDinh = 0;
  function datDinh() { henDinh = 0; app.style.setProperty('--kt-dinh', caoDau() + 'px'); }
  window.addEventListener('scroll', function () { if (!henDinh) henDinh = requestAnimationFrame(datDinh); }, { passive: true });
  function denCau(id) {
    var o = document.getElementById('kt-' + id); if (!o) return;
    var thanh = app.querySelector('.kt-thanh'), y = o.getBoundingClientRect().top + window.pageYOffset - caoDau() - (thanh ? thanh.offsetHeight : 0) - 12;
    window.scrollTo({ top: Math.max(0, y), behavior: 'auto' });
    requestAnimationFrame(function () { requestAnimationFrame(function () {     // header có thể vừa thu gọn: chỉnh lại cho câu nằm ngay dưới thanh đồng hồ
      datDinh(); var lech = o.getBoundingClientRect().top - (caoDau() + (thanh ? thanh.offsetHeight : 0) + 12);
      if (Math.abs(lech) > 4) window.scrollBy(0, lech);
    }); });
    o.classList.add('nhay'); setTimeout(function () { o.classList.remove('nhay'); }, 1600);
  }

  // ---------------- nghe ----------------
  function conLuot(c) { return Math.max(0, LUOT_NGHE - (+NGHE[c.id] || 0)); }
  function veNghe(c) {
    var b = document.querySelector('[data-nghe="' + c.id + '"]'); if (!b) return;
    var n = conLuot(c); b.disabled = !GV && n <= 0;
    b.querySelector('small').textContent = GV ? '' : n > 0 ? '(còn ' + n + ' lần)' : '(đã hết lượt nghe)';
  }
  function nghe(c, b) {
    if (!c || (!GV && conLuot(c) <= 0) || b.classList.contains('dang-doc')) return;
    var coFile = c.am.every(function (a) { return a.f; });
    var txt = coFile ? c.am.map(function (a) { return a.f; }).join('|') : c.am.map(function (a) { return a.doc; }).join('　');
    if (!GV) { NGHE[c.id] = (+NGHE[c.id] || 0) + 1; henLuu(true); }
    veNghe(c);
    QM_TV.doc(txt, b);
  }

  // ---------------- lưu ----------------
  function kMay() { return 'qm-kt-' + MA_DE + '-' + QM_TK.hoSoId(); }
  function docMay() { try { var o = JSON.parse(localStorage.getItem(kMay()) || 'null'); return o && o.tl || {}; } catch (e) { return {}; } }
  function ghiMay() { try { localStorage.setItem(kMay(), JSON.stringify({ tl: TL, t: Date.now() })); } catch (e) {} }
  var henL = null, dangGui = false, canGui = false, lanLuuCuoi = 0;
  function baoLuu(t, loi) { var o = app.querySelector('.kt-luu'); if (o) { o.textContent = t; o.classList.toggle('loi', !!loi); } }
  function henLuu(ngay) {
    if (GV) return;
    ghiMay(); canGui = true; baoLuu('● Chưa lưu');
    clearTimeout(henL); henL = setTimeout(guiLuu, ngay ? 300 : 2500);
  }
  function guiLuu() {
    if (GV || NOP || !canGui) return Promise.resolve();
    if (dangGui) { clearTimeout(henL); henL = setTimeout(guiLuu, 1500); return Promise.resolve(); }
    dangGui = true; canGui = false; baoLuu('⏳ Đang lưu…');
    return goi('ktLuu', { traLoi: TL, nghe: NGHE }).then(function (d) {
      dangGui = false; lanLuuCuoi = Date.now();
      if (d.daNop) return xongNop(d);
      if (d.bayGio) LECH = d.bayGio - Date.now();
      if (d.hetGioLuc) HET = d.hetGioLuc;
      baoLuu(canGui ? '● Chưa lưu' : '✓ Đã lưu ' + hai(new Date().getHours()) + ':' + hai(new Date().getMinutes()));
    }, function (x) {
      dangGui = false; canGui = true; baoLuu('⚠️ Chưa lưu được (đã giữ trên máy)', true);
      clearTimeout(henL); henL = setTimeout(guiLuu, 8000);
    });
  }
  window.addEventListener('beforeunload', function (e) { if (!GV && DE && !NOP && canGui) { e.preventDefault(); e.returnValue = ''; } });
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') guiLuu(); });

  // ---------------- đồng hồ ----------------
  var henDH = null, NOP = false, daBaoPhut = false, daBao5 = false;
  function chayDongHo() {
    clearInterval(henDH);
    var gio = app.querySelector('.kt-gio'), thanh = app.querySelector('.kt-thanh');
    var buoc = function () {
      var con = HET - (Date.now() + LECH), s = Math.max(0, Math.ceil(con / 1000));
      gio.textContent = hai(Math.floor(s / 60)) + ':' + hai(s % 60);   // 60:00 → 00:00
      thanh.classList.toggle('sap-het', s <= 300 && s > 60);
      thanh.classList.toggle('phut-cuoi', s <= 60 && s > 0);
      if (s <= 300 && s > 60 && !daBao5) { daBao5 = true; bao('⏳ Còn 5 phút. Bạn soát lại bài nhé.'); }
      if (s <= 60 && s > 0) {
        if (!daBaoPhut) { daBaoPhut = true; chuong(); bao('⏰ Còn 1 phút! Hết giờ bài tự nộp.'); }
        else tich(s % 2 === 0);
      }
      if (s > 60) daBaoPhut = false;
      if (s <= 0) { clearInterval(henDH); if (GV) { bao('Hết giờ (xem thử): bài học sinh sẽ tự nộp ở đây.'); return; } nop(true); }
    };
    buoc(); henDH = setInterval(buoc, 1000);
  }

  // ---------------- nộp bài ----------------
  function hoiNop() {
    var chua = CAU.filter(function (c) { return tinhTrang(c) !== 'da'; });
    var nen = document.createElement('div'); nen.className = 'kt-nen';
    nen.innerHTML = '<div class="kt-hop" role="dialog" aria-modal="true">' +
      (chua.length ? '<div class="kt-ico">⚠️</div><h3>Còn ' + chua.length + ' câu chưa làm xong</h3><p>Bấm số câu để quay lại làm:</p><div class="kt-ds-chua">' +
        chua.map(function (c) { return '<button type="button" class="kt-o' + (tinhTrang(c) === 'nua' ? ' nua' : '') + '" data-toi="' + c.id + '" title="' + esc(c._p.ten) + '">' + c.so + '</button>'; }).join('') + '</div>' +
        '<p class="kt-nho">Câu chưa làm được 0 điểm. Câu cam: mới làm một phần.</p>'
        : '<div class="kt-ico">📤</div><h3>Nộp bài?</h3><p>Bạn đã làm đủ ' + CAU.length + ' câu. Sau khi nộp sẽ <b>không sửa được</b> nữa.</p>') +
      '<div class="kt-hop-nut"><button type="button" class="kt-nut" data-h="lai">← Quay lại làm tiếp</button><button type="button" class="kt-nut ' + (chua.length ? 'canh' : 'chinh') + '" data-h="nop">' + (chua.length ? 'Vẫn nộp bài' : '📤 Nộp bài') + '</button></div></div>';
    document.body.appendChild(nen);
    var dong = function () { nen.remove(); };
    nen.addEventListener('click', function (e) {
      var t = e.target.closest('[data-toi]'); if (t) { dong(); return denCau(t.dataset.toi); }
      var h = e.target.closest('[data-h]'); if (!h && e.target !== nen) return;
      dong(); if (h && h.dataset.h === 'nop') nop(false);
    });
  }
  function nop(hetGio) {
    if (GV) return ketQuaThu();
    if (NOP) return; NOP = true; clearTimeout(henL);
    var nen = document.createElement('div'); nen.className = 'kt-nen'; nen.innerHTML = '<div class="kt-hop"><div class="kt-ico">⏳</div><h3>' + (hetGio ? 'Hết giờ! Đang nộp bài…' : 'Đang nộp bài…') + '</h3><p>Bạn đừng đóng trang nhé.</p></div>';
    document.body.appendChild(nen);
    var thu = function (lan) {
      goi('ktNop', { traLoi: TL, nghe: NGHE }).then(function (d) { nen.remove(); xongNop(d); }).catch(function (x) {
        if (lan < 4) return setTimeout(function () { thu(lan + 1); }, 3000 * (lan + 1));
        nen.querySelector('.kt-hop').innerHTML = '<div class="kt-ico">⚠️</div><h3>Chưa nộp được</h3><p>' + esc(x.message) + '</p><p>Bài làm đã lưu trên máy này. Bạn kiểm tra mạng rồi bấm nộp lại.</p><button type="button" class="kt-nut chinh">Nộp lại</button>';
        nen.querySelector('button').onclick = function () { nen.querySelector('.kt-hop').innerHTML = '<div class="kt-ico">⏳</div><h3>Đang nộp bài…</h3>'; thu(0); };
      });
    };
    thu(0);
  }
  function xongNop(d) {
    NOP = true; clearInterval(henDH); clearTimeout(henL); canGui = false;
    try { localStorage.removeItem(kMay()); } catch (e) {}
    if (window.QM_PHAN && QM_PHAN.datPhan && KHOA_PHAN) QM_PHAN.datPhan(KHOA_PHAN, 'xong', (DE && DE.ten) || 'Bài kiểm tra', URL_PHAN);
    if (d.treGio) bao('Bài nộp sau khi hết giờ: máy chủ chấm bài đã lưu lúc hết giờ.');
    veKetQua(d.ketQua);
    window.scrollTo({ top: app.offsetTop - 10 });
  }

  // ---------------- kết quả ----------------
  function veKetQua(k) {
    if (!k) return man('<div class="kt-ico">✅</div><h2>Đã nộp bài</h2>');
    var html = '<div class="kt-the kt-kq"><div class="kt-ico">🎉</div><h2>Đã nộp bài</h2>' +
      '<div class="kt-tong"><b>' + so(k.tong) + '</b><span>/ ' + so(k.toiDa) + ' điểm' + (k.choCham ? ' · tạm tính' : '') + '</span></div>' +
      (k.choCham ? '<p class="kt-nhan">Còn <b>' + k.choCham + ' câu dịch / gõ</b> chờ cô chấm, điểm sẽ cập nhật sau.</p>' : '') +
      '<table class="kt-bang"><thead><tr><th>Phần</th><th>Đúng</th><th>Điểm</th></tr></thead><tbody>' + k.phan.map(function (p) {
        return '<tr><td>' + esc(p.ten) + '</td><td>' + p.dung + '/' + p.so + '</td><td><b>' + so(p.diem) + '</b> / ' + so(p.toiDa) + '</td></tr>'; }).join('') + '</tbody></table>' +
      (k.nopLuc ? '<p class="kt-nho">Nộp lúc ' + ngayGio(k.nopLuc) + '</p>' : '') +
      (k.xemDapAn ? '' : '<p>Đáp án và bài làm từng câu sẽ hiện ở trang này ' + (k.hanNop ? 'sau hạn nộp (<b>' + ngayGio(k.hanNop) + '</b>)' : 'khi cô công bố') + '.</p>') + '</div>';
    if (k.xemDapAn && k.de) html += xemLai(k.de, k.traLoi || {}, k.cau || {});
    app.innerHTML = html;
  }
  function tlHtml(c, x) {
    if (x == null || x === '') return '<i>(bỏ trống)</i>';
    if (c.dang === 'chon') return deHtml(c.pa[x] || '');
    if (c.dang === 'dungsai') return x ? 'Đúng' : 'Sai';
    if (c.dang === 'ghep') return c.trai.map(function (t, i) { return esc(t) + ' – ' + (x[i] == null ? '?' : esc(c.phai[x[i]])); }).join(' · ');
    if (c.dang === 'nhom') return c.tu.map(function (t, i) { return esc(t) + ': ' + (x[i] == null ? '?' : esc(c.nhom[x[i]])); }).join(' · ');
    if (c.dang === 'ghepBo') return x.map(function (i) { return chuTq(c.o[i]); }).join(' + ');
    if (c.dang === 'xep') return chuTq(x.map(function (i) { return c.khoi[i]; }).join(''));
    return chuTq(x);
  }
  function xemLai(de, tl, kq) {
    return '<div class="kt-xem-lai"><h3>📋 Xem lại bài</h3>' + de.phan.map(function (p) {
      return '<section class="kt-phan"><div class="kt-phan-dau"><h3>' + esc(p.ten) + '</h3></div>' + p.cau.map(function (c) {
        var k = kq[c.id] || {}, cls = k.d == null ? 'cho' : k.dung ? 'dung' : k.d > 0 ? 'nua' : 'sai';
        return (c.doan ? '<div class="kt-doan"><b>' + esc(c.tenDoan || '') + '</b><div class="kt-cn kt-doan-chu">' + esc(c.doan).replace(/\n/g, '<br>') + '</div></div>' : '') +
          '<div class="kt-cau xl ' + cls + '"><div class="kt-cau-dau"><span class="kt-so">Câu ' + c.so + '</span><span class="kt-diem">' + (k.d == null ? 'chờ cô chấm' : so(k.d) + ' / ' + so(c.diem) + ' đ') + '</span></div>' +
          '<div class="kt-de">' + deHtml(c.de) + (c.hoi ? ' ' + chuTq(c.hoi) : '') + '</div>' +
          (c.am && c.bai ? '<div class="kt-nho kt-cn">' + esc(c.bai).replace(/\n/g, '<br>') + '</div>' : c.am ? '<div class="kt-nho">Bài nghe: ' + chuTq(c.am.map(function (a) { return a.doc; }).join(' ')) + '</div>' : '') +
          '<p><b>Bạn làm:</b> ' + tlHtml(c, tl[c.id]) + '</p><div class="kt-dap-an hien">' + dapAnHtml(c) + '</div></div>';
      }).join('') + '</section>';
    }).join('') + '</div>';
  }
  function ketQuaThu() {                                   // giáo viên: chấm thử ngay trên máy (giống máy chủ)
    var tong = 0, toiDa = 0, phan = {};
    CAU.forEach(function (c) {
      var x = TL[c.id], d = 0, D = +c.diem;
      if (x != null && x !== '') {
        if (c.dang === 'chon' || c.dang === 'dungsai') d = x === c.dapAn ? D : 0;
        else if (c.dang === 'ghep' || c.dang === 'nhom') { var n = c.dapAn.length, k = 0; for (var i = 0; i < n; i++) if (x[i] === c.dapAn[i]) k++; d = D * k / n; }
        else if (c.dang === 'ghepBo') d = x.slice().sort().join() === c.dapAn.slice().sort().join() ? D : 0;
        else { var g = chuan(c.dang === 'xep' ? x.map(function (i) { return c.khoi[i]; }).join('') : x); d = [].concat(c.dapAn, c.chapNhan || []).map(chuan).indexOf(g) >= 0 ? D : 0; }
      }
      var p = phan[c._p.ma] || (phan[c._p.ma] = { ten: c._p.ten, d: 0, t: 0 }); p.d += d; p.t += D; tong += d; toiDa += D;
    });
    bao('Kết quả thử: ' + so(tong) + ' / ' + so(toiDa) + ' điểm · ' + Object.keys(phan).map(function (m) { return phan[m].ten.replace(/^\S+\s/, '') + ' ' + so(phan[m].d); }).join(' · '));
  }
})();
