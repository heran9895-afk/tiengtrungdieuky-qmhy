/* =========================================================
   TRÒ CHƠI BẮN BÓNG BAY · Tiếng Trung Diệu Kỳ
   Máy đọc một âm / một từ, bóng bay mang đáp án bay lên, bắn trúng quả đúng trước khi bóng bay mất.
   7 dạng: Trộn tất cả · Thanh mẫu · Vận mẫu · Thanh điệu · Vận mẫu + thanh điệu · Phiên âm · Chữ Hán.
   3 mức: Dễ (3 bóng, 10 giây) · Trung bình (4 bóng, 7 giây) · Khó (5 bóng, 5 giây, nhiễu là cặp dễ nhầm).

   Trang đặt cấu hình TRƯỚC khi nhúng file này (sau tu-vung-chung.js):
     window.QM_BB = {
       phamVi: 'h2-hsk1',                         // khoá lưu kỷ lục trên máy
       nhom: [ { ma: 'bai-1-2', ten: 'Bài 1–2', tep: ['<đường dẫn>/bai-1-2.json'] }, … ],
       tongHop: true                              // thêm mục "Tổng hợp" gồm mọi nhóm
     };
   File JSON: mảng từ, hoặc đối tượng có khoá "tu" (cùng định dạng kho 9 cấp / dữ liệu bài).
   Mở thẳng một nhóm: thêm ?bai=<mã nhóm> vào đường dẫn.
   Câu hỏi, pinyin, âm hiệu ứng: assets/js/cau-hoi-tro-choi.js (QM_CH), nhúng TRƯỚC file này.
   Âm thanh: QM_TV.doc (giọng máy zh-CN; cột "Đọc từ" là đường dẫn file ghi âm thì phát file).
   Không gửi điểm lên máy chủ; chỉ lưu kỷ lục trên máy.
   ========================================================= */
(function () {
  var CF = window.QM_BB || {};
  var el = document.getElementById('ban-bong-bay');
  if (!el || !window.QM_TV) return;
  var TV = window.QM_TV, esc = TV.esc;

  var CH = window.QM_CH;
  if (!CH) return;
  var DANG = CH.DANG, THU_TU_DANG = CH.THU_TU_DANG, MUC = CH.MUC, tron = CH.tron, giaiAm = CH.giaiAm, giaiTu = CH.giaiTu,
      AM = CH.AM, amThanh = CH.amThanh, NOT = CH.NOT, chuanHoaPy = CH.chuanHoaPy, tachPinyin = CH.tachPinyin, datDau = CH.datDau;
  NOT.ban = [[1200, .03], [700, .05]]; NOT.vo = [[180, .05]]; NOT.dem = [[660, .08]]; NOT.diBay = [[523.3, .14]];

  // Nhóm từ (bài) của trang; "Tổng hợp" gộp mọi bài
  var NHOM = (CF.nhom || []).slice();
  if (CF.tongHop && NHOM.length > 1) NHOM.push({ ma: 'tong-hop', ten: 'Tổng hợp', tongHop: true });
  function taiNhom(n) {
    var ds = n.tongHop ? NHOM.filter(function (x) { return !x.tongHop; }) : [n], tep = [];
    ds.forEach(function (x) { tep = tep.concat(x.tep); });
    return CH.taiNguon(tep);
  }

  // =========================================================
  // 5. GIAO DIỆN
  // =========================================================
  var SO_CAU = 15;
  var KHOA_KL = 'qm-bb-ky-luc';
  function docKL() { try { return JSON.parse(localStorage.getItem(KHOA_KL) || '{}'); } catch (e) { return {}; } }
  function ghiKL(k, d) { try { var o = docKL(); o[k] = d; localStorage.setItem(KHOA_KL, JSON.stringify(o)); } catch (e) {} }
  var S = { nhom: NHOM[0] ? NHOM[0].ma : '', dang: 'tron', muc: 'de' };
  try { var luu = JSON.parse(localStorage.getItem('qm-bb-chon') || '{}'); ['dang', 'muc'].forEach(function (k) { if (luu[k]) S[k] = luu[k]; }); } catch (e) {}
  var thamSo = (location.search.match(/[?&]bai=([^&]+)/) || [])[1];
  if (thamSo && NHOM.some(function (n) { return n.ma === thamSo; })) S.nhom = thamSo;
  if (!DANG[S.dang] && S.dang !== 'tron') S.dang = 'tron';
  if (!MUC[S.muc]) S.muc = 'de';
  function khoaKL() { return (CF.phamVi || 'bb') + '|' + S.nhom + '|' + S.dang + '|' + S.muc; }

  el.innerHTML =
    '<div class="lt-thanh bb-thanh">' +
      '<label class="lt-o"><span class="lt-o-nhan">' + esc(CF.nhanNhom || 'Bài') + '</span><select class="bb-chon-nhom" aria-label="Chọn bài"></select></label>' +
      '<label class="lt-o"><span class="lt-o-nhan">Dạng</span><select class="bb-chon-dang" aria-label="Chọn dạng"></select></label>' +
      '<label class="lt-o"><span class="lt-o-nhan">Mức độ</span><select class="bb-chon-muc" aria-label="Chọn mức độ"></select></label>' +
    '</div>' +
    '<div class="bb-khung">' +
      '<div class="bb-hud" hidden>' +
        '<span class="bb-hud-o bb-so-cau"></span><span class="bb-hud-o bb-diem"></span><span class="bb-hud-o bb-chuoi" hidden></span>' +
        '<span class="bb-hud-nut"><button type="button" class="bb-nghe" aria-label="Nghe lại" title="Nghe lại (phím cách)">🔊 <span>Nghe lại</span></button>' +
        '<button type="button" class="bb-dung" aria-label="Tạm dừng" title="Tạm dừng">⏸</button>' +
        '<button type="button" class="bb-am" title="Bật / tắt âm thanh hiệu ứng"></button></span>' +
      '</div>' +
      '<div class="bb-de-bai" hidden></div>' +
      '<div class="bb-troi" tabindex="-1">' +
        '<div class="bb-may m1"></div><div class="bb-may m2"></div><div class="bb-may m3"></div>' +
        '<div class="bb-vach"><i></i></div>' +
        '<div class="bb-bong-ds"></div>' +
        '<div class="bb-sung" aria-hidden="true"><i></i></div>' +
        '<div class="bb-giai" aria-live="polite"></div>' +
        '<div class="bb-man"></div>' +
      '</div>' +
    '</div>';
  var selNhom = el.querySelector('.bb-chon-nhom'), selDang = el.querySelector('.bb-chon-dang'), selMuc = el.querySelector('.bb-chon-muc');
  var thanh = el.querySelector('.bb-thanh'), hud = el.querySelector('.bb-hud'), deBai = el.querySelector('.bb-de-bai'), troi = el.querySelector('.bb-troi'),
      dsBong = el.querySelector('.bb-bong-ds'), man = el.querySelector('.bb-man'), giai = el.querySelector('.bb-giai'), sung = el.querySelector('.bb-sung'),
      vach = el.querySelector('.bb-vach i'), nutAm = el.querySelector('.bb-am');

  selNhom.innerHTML = NHOM.map(function (n) { return '<option value="' + esc(n.ma) + '">' + esc(n.ten) + '</option>'; }).join('');
  selDang.innerHTML = '<option value="tron">🔀 Trộn tất cả</option>' + THU_TU_DANG.map(function (k) { return '<option value="' + k + '">' + DANG[k].ico + ' ' + DANG[k].ten + '</option>'; }).join('');
  selMuc.innerHTML = Object.keys(MUC).map(function (k) { return '<option value="' + k + '">' + MUC[k].ten + '</option>'; }).join('');
  selNhom.value = S.nhom; selDang.value = S.dang; selMuc.value = S.muc;
  function veNutAm() { nutAm.textContent = AM.bat ? '🔔' : '🔕'; nutAm.setAttribute('aria-label', (AM.bat ? 'Tắt' : 'Bật') + ' âm thanh hiệu ứng'); }
  veNutAm();
  nutAm.addEventListener('click', function () { AM.bat = !AM.bat; try { localStorage.setItem('qm-am-hieu-ung', AM.bat ? '1' : '0'); } catch (e) {} veNutAm(); });

  [selNhom, selDang, selMuc].forEach(function (s) { s.addEventListener('change', function () {
    S.nhom = selNhom.value; S.dang = selDang.value; S.muc = selMuc.value;
    try { localStorage.setItem('qm-bb-chon', JSON.stringify({ dang: S.dang, muc: S.muc })); } catch (e) {}
    if (!G || G.xong) manChao();
  }); });

  function nhomDangChon() { return NHOM.filter(function (n) { return n.ma === S.nhom; })[0]; }

  // ---------- Màn chào: cách chơi + Bắt đầu ----------
  function manChao() {
    G = null; dungVong();
    hud.hidden = true; deBai.hidden = true; thanh.classList.remove('khoa'); giai.innerHTML = ''; dsBong.innerHTML = ''; vach.style.width = '0';
    var m = MUC[S.muc], kl = docKL()[khoaKL()];
    var soBong = S.dang === 'thanhDieu' ? Math.min(m.bong, 4) : m.bong;
    man.className = 'bb-man on';
    man.innerHTML = '<div class="bb-the">' +
      '<div class="bb-the-ico">🎈</div>' +
      '<h3>Bắn bóng bay</h3>' +
      '<p>Nghe máy đọc, rồi bắn trúng quả bóng mang đáp án đúng trước khi bóng bay mất.</p>' +
      '<div class="bb-chip"><span>' + (S.dang === 'tron' ? '🔀 Trộn tất cả' : DANG[S.dang].ico + ' ' + DANG[S.dang].ten) + '</span>' +
        '<span>' + soBong + ' bóng</span><span>' + m.giay + ' giây / câu</span><span>' + SO_CAU + ' câu</span></div>' +
      (kl ? '<p class="bb-kl">🏆 Kỷ lục của bạn: <b>' + kl + '</b> điểm</p>' : '') +
      (window.QM_DIEM ? (S.dang === 'tron' ? QM_DIEM.oNhap() : '<p class="dd-ghi">Chỉ dạng <b>🔀 Trộn tất cả</b> tính điểm lên Bảng xếp hạng. Dạng riêng để luyện thêm.</p>') : '') +
      '<button type="button" class="btn gold bb-bat-dau">▶ Bắt đầu</button>' +
      '<p class="bb-meo">Máy tính: bấm phím <b>1–5</b> để bắn bóng theo thứ tự từ trái sang, phím <b>cách</b> để nghe lại.</p>' +
    '</div>';
    man.querySelector('.bb-bat-dau').addEventListener('click', function () { if (window.QM_DIEM) HS = QM_DIEM.docNhap(man); batDau(); });
  }
  var HS = null;   // họ tên + lớp lúc bấm Bắt đầu

  // =========================================================
  // 6. LƯỢT CHƠI
  // =========================================================
  var G = null, vong = null;
  function dungVong() { if (vong) cancelAnimationFrame(vong); vong = null; }

  function moKhoaAm() {   // iPhone: lần đọc đầu phải nằm trong thao tác bấm
    try { if (window.speechSynthesis) { var u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'zh-CN'; speechSynthesis.speak(u); } } catch (e) {}
    try { var C = AM.ctx || (AM.ctx = new (window.AudioContext || window.webkitAudioContext)()); if (C.state === 'suspended') C.resume(); } catch (e) {}
  }

  function batDau(dsLai) {
    moKhoaAm();
    if (!TV.coGiong()) {
      man.innerHTML = '<div class="bb-the"><div class="bb-the-ico">🔇</div><h3>Máy chưa có giọng đọc tiếng Trung</h3>' +
        '<p>Trò này cần nghe máy đọc. Bạn thử mở trang bằng <b>Chrome</b> hoặc <b>Edge</b>, hoặc cài giọng đọc tiếng Trung (Trung Quốc đại lục) cho máy nhé.</p>' +
        '<button type="button" class="btn bb-ve">‹ Quay lại</button></div>';
      man.querySelector('.bb-ve').addEventListener('click', manChao);
      return;
    }
    man.innerHTML = '<div class="bb-the"><div class="tv-trong">Đang chuẩn bị…</div></div>';
    taiNhom(nhomDangChon()).then(function (dl) {
      var ds = Array.isArray(dsLai) ? dsLai : taoLuot(dl);
      if (!ds.length) {
        man.innerHTML = '<div class="bb-the"><div class="bb-the-ico">🌱</div><h3>Chưa đủ dữ liệu</h3><p>Bài này chưa có đủ âm để chơi dạng này. Bạn chọn dạng khác nhé.</p>' +
          '<button type="button" class="btn bb-ve">‹ Quay lại</button></div>';
        man.querySelector('.bb-ve').addEventListener('click', manChao);
        return;
      }
      G = { dl: dl, ds: ds, i: -1, diem: 0, dung: 0, chuoi: 0, chuoiMax: 0, sai: [], dangChay: false, xong: false, laLai: Array.isArray(dsLai), batDauLuc: Date.now(), ct: [] };
      thanh.classList.add('khoa');
      hud.hidden = false; deBai.hidden = false;
      capNhatHud();
      cuonToiKhung(); setTimeout(cuonToiKhung, 400);
      demNguoc(3);
    }).catch(function () {
      man.innerHTML = '<div class="bb-the"><div class="bb-the-ico">⚠️</div><h3>Chưa tải được dữ liệu</h3><p>Bạn kiểm tra mạng rồi thử lại nhé.</p><button type="button" class="btn bb-ve">‹ Quay lại</button></div>';
      man.querySelector('.bb-ve').addEventListener('click', manChao);
    });
  }

  // Bốc câu cho một lượt: mỗi câu một mục khác nhau; Trộn thì luân phiên các dạng
  function taoLuot(dl) {
    var dsDang = S.dang === 'tron' ? THU_TU_DANG : [S.dang], kho = {};
    dsDang.forEach(function (d) { kho[d] = tron(DANG[d].lay(dl)); });
    dsDang = dsDang.filter(function (d) { return kho[d].length; });
    var ds = [], daDung = {}, vongDang = [];
    for (var lan = 0; ds.length < SO_CAU && lan < SO_CAU * 6; lan++) {
      if (!vongDang.length) vongDang = tron(dsDang);
      if (!vongDang.length) break;
      var d = vongDang.shift(), muc = kho[d].shift();
      if (!muc) continue;
      var k = d + '|' + (muc.chu ? muc.chu + muc.goc + muc.thanh : muc.han);
      if (daDung[k]) continue; daDung[k] = 1;
      ds.push({ dang: d, muc: muc });
    }
    return ds;
  }

  function cuonToiKhung() {
    var h = document.querySelector('.sh-header'), cao = h ? h.getBoundingClientRect().height : 0;
    var dich = hud.getBoundingClientRect().top + window.scrollY - cao - 6;
    if (Math.abs(dich - window.scrollY) > 4) window.scrollTo({ top: dich, behavior: 'smooth' });
  }
  function demNguoc(n) {
    man.className = 'bb-man on trong';
    man.innerHTML = '<div class="bb-dem">' + n + '</div>';
    amThanh('dem');
    setTimeout(function () { if (!G) return; if (n > 1) demNguoc(n - 1); else { man.className = 'bb-man'; man.innerHTML = ''; cauTiep(); } }, 650);
  }

  function capNhatHud() {
    el.querySelector('.bb-so-cau').innerHTML = 'Câu <b>' + Math.min(G.i + 1, G.ds.length) + '</b>/' + G.ds.length;
    el.querySelector('.bb-diem').innerHTML = '⭐ <b>' + G.diem + '</b>';
    var c = el.querySelector('.bb-chuoi'); c.hidden = G.chuoi < 2; c.innerHTML = '🔥 <b>' + G.chuoi + '</b>';
  }

  var MAU = ['do', 'vang', 'xanh', 'lam', 'hong'];
  function cauTiep() {
    if (!G) return;
    G.i++;
    giai.innerHTML = '';
    if (G.i >= G.ds.length) return ketThuc();
    var q = G.ds[G.i], D = DANG[q.dang], m = MUC[S.muc];
    var soBong = q.dang === 'thanhDieu' ? Math.min(m.bong, 4) : m.bong;
    var c = D.cau(q.muc, S.muc, soBong - 1, G.dl);
    var dap = [c.dung].concat(c.nhieu);
    dap = c.xepThu ? dap.sort(function (a, b) { return a.sx - b.sx; }) : tron(dap);
    G.cau = { q: q, c: c, dap: dap, batDau: 0, troiQua: 0, giay: m.giay, xong: false };
    capNhatHud();
    deBai.innerHTML = '<span class="bb-de-ico">' + D.ico + '</span> 🎧 ' + D.de;
    veBong(dap, c);
    docCau();
    G.cau.batDau = performance.now();
    G.dangChay = true;
    dungVong(); vong = requestAnimationFrame(chay);
  }

  function docCau() { if (G && G.cau) TV.doc(G.cau.c.doc); }

  function veBong(dap, c) {
    var W = troi.clientWidth, n = dap.length;
    var hep = W / n < 96;                                   // màn hẹp: bóng so le hai tầng để chữ dài vẫn vừa
    var mau = tron(MAU);
    dsBong.innerHTML = dap.map(function (d, i) {
      var cls = 'bb-bong ' + mau[i % MAU.length] + (c.han ? ' han' : '') + (c.dai ? ' dai' : '') + (c.nho ? ' nho' : '');
      return '<button type="button" class="' + cls + '" data-i="' + i + '" aria-label="Đáp án ' + (i + 1) + '"><span class="bb-bong-chu">' + d.nhan + '</span><i class="bb-day"></i></button>';
    }).join('');
    var bong = dsBong.querySelectorAll('.bb-bong');
    var cot = W / n;
    G.cau.bong = [].map.call(bong, function (b, i) {
      var rong = hep ? Math.min(cot * 1.32, 100) : Math.min(cot - 14, 128);
      b.style.width = rong + 'px'; b.style.height = Math.round(rong * 1.18) + 'px';
      var chu = b.querySelector('.bb-bong-chu');
      var co = c.han ? Math.min(rong * .42, 44) : c.dai ? (rong > 110 ? 18 : 15) : (rong > 110 ? 23 : 19);
      if (c.han && dap[i].khoa.length > 2) co = Math.min(co, rong * .8 / dap[i].khoa.length * 1.05);
      chu.style.fontSize = co + 'px';
      if (!c.han && chu.scrollWidth > rong * .86) chu.style.fontSize = Math.max(11, co * rong * .86 / chu.scrollWidth) + 'px';
      var x = Math.max(4, Math.min(W - rong - 4, cot * i + cot / 2 - rong / 2));
      return { el: b, x: x, lech: hep ? (i % 2) * rong * 1.18 * .78 : Math.random() * 24, pha: Math.random() * 6.28, cao: rong * 1.18 };
    });
    G.cau.bong.forEach(function (o) { o.el.style.transform = 'translate(' + o.x + 'px,' + troi.clientHeight + 'px)'; });
  }

  // Bóng bay lên: hết giờ thì bóng ra khỏi khung trên
  function chay(t) {
    if (!G || !G.dangChay) return;
    var C = G.cau, H = troi.clientHeight, troiQua = C.troiQua + (t - C.batDau) / 1000;
    var tile = troiQua / C.giay;
    vach.style.width = Math.max(0, 100 - tile * 100) + '%';
    vach.className = tile > .7 ? 'gap' : '';
    C.bong.forEach(function (o) {
      if (o.vo) return;
      var y = H - o.cao * .35 - Math.min(1, tile) * (H + o.cao * .75) - o.lech;
      var x = o.x + Math.sin(troiQua * 1.6 + o.pha) * 6;
      o.y = y;
      o.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + (Math.sin(troiQua * 1.3 + o.pha) * 4).toFixed(1) + 'deg)';
    });
    if (tile >= 1) { traLoi(-1); return; }
    vong = requestAnimationFrame(chay);
  }

  function tamDung() {
    if (!G || !G.dangChay) return;
    G.dangChay = false; dungVong(); TV.dungDoc();
    G.cau.troiQua += (performance.now() - G.cau.batDau) / 1000;
    man.className = 'bb-man on';
    man.innerHTML = '<div class="bb-the"><div class="bb-the-ico">⏸</div><h3>Tạm dừng</h3>' +
      '<button type="button" class="btn gold bb-tiep-tuc">▶ Chơi tiếp</button> <button type="button" class="btn bb-thoat">Thoát</button></div>';
    man.querySelector('.bb-tiep-tuc').addEventListener('click', chayTiep);
    man.querySelector('.bb-thoat').addEventListener('click', manChao);
  }
  function chayTiep() {
    if (!G || G.dangChay || !G.cau || G.cau.xong) return;
    man.className = 'bb-man'; man.innerHTML = '';
    G.cau.batDau = performance.now(); G.dangChay = true; docCau();
    vong = requestAnimationFrame(chay);
  }
  el.querySelector('.bb-dung').addEventListener('click', function () { if (G && G.dangChay) tamDung(); else chayTiep(); });
  el.querySelector('.bb-nghe').addEventListener('click', function () { if (G && G.dangChay) docCau(); else if (G && G.cau) docCau(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) tamDung(); });

  // Bắn: mũi tên bay từ súng tới bóng rồi nổ
  dsBong.addEventListener('click', function (e) {
    var b = e.target.closest('.bb-bong'); if (!b || !G || !G.dangChay || G.cau.xong) return;
    ban(+b.dataset.i);
  });
  document.addEventListener('keydown', function (e) {
    if (!G || G.xong || !G.cau || /input|select|textarea/i.test((e.target.tagName || ''))) return;
    if (e.key === ' ' || e.code === 'Space') { if (G.dangChay) { e.preventDefault(); docCau(); } return; }
    var so = +e.key;
    if (so >= 1 && so <= 5 && G.dangChay && !G.cau.xong && so <= G.cau.dap.length) ban(so - 1);
    if (e.key === 'Enter' && G.cau.xong && G.choTiep) { e.preventDefault(); G.choTiep(); }
  });

  function ban(i) {
    var C = G.cau, o = C.bong[i]; if (!o) return;
    C.xong = true;
    amThanh('ban');
    var R = troi.getBoundingClientRect(), r = o.el.getBoundingClientRect();
    var tx = r.left - R.left + r.width / 2, ty = r.top - R.top + r.height * .45;
    var sx = R.width / 2, sy = R.height - 18, goc = Math.atan2(ty - sy, tx - sx) * 180 / Math.PI;
    sung.style.transform = 'translateX(-50%) rotate(' + (goc + 90) + 'deg)';
    var mui = document.createElement('div'); mui.className = 'bb-mui';
    mui.style.transform = 'translate(' + sx + 'px,' + sy + 'px) rotate(' + goc + 'deg)';
    troi.appendChild(mui);
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      mui.style.transform = 'translate(' + tx + 'px,' + ty + 'px) rotate(' + goc + 'deg)';
    }); });
    setTimeout(function () { mui.remove(); traLoi(i); }, 170);
  }

  function no(o, dung) {
    o.vo = true;
    o.el.classList.add(dung ? 'no' : 'no-sai');
    var R = troi.getBoundingClientRect(), r = o.el.getBoundingClientRect();
    if (dung) for (var k = 0; k < 12; k++) {
      var h = document.createElement('i'); h.className = 'bb-hat ' + MAU[k % MAU.length];
      var a = k / 12 * 6.28, d = 40 + Math.random() * 40;
      h.style.left = (r.left - R.left + r.width / 2) + 'px'; h.style.top = (r.top - R.top + r.height * .45) + 'px';
      h.style.setProperty('--dx', Math.cos(a) * d + 'px'); h.style.setProperty('--dy', Math.sin(a) * d + 'px');
      troi.appendChild(h); setTimeout(h.remove.bind(h), 700);
    }
  }
  function bayDiem(o, txt) {
    var R = troi.getBoundingClientRect(), r = o.el.getBoundingClientRect(), s = document.createElement('div');
    s.className = 'bb-cong'; s.textContent = txt;
    s.style.left = (r.left - R.left + r.width / 2) + 'px'; s.style.top = (r.top - R.top + r.height * .3) + 'px';
    troi.appendChild(s); setTimeout(s.remove.bind(s), 1100);
  }

  // i = -1: hết giờ, bóng bay mất
  function traLoi(i) {
    var C = G.cau; if (!C) return;
    C.xong = true; G.dangChay = false; dungVong();
    C.troiQua += (performance.now() - C.batDau) / 1000;
    var iDung = C.dap.indexOf(C.c.dung), dung = i === iDung;
    var bo = function (h) { return String(h || '').replace(/<[^>]+>/g, ''); };
    G.ct.push({ stt: G.ct.length + 1, dang: DANG[C.q.dang].ten, cauHoi: '🎧 ' + (C.q.muc.chu || C.q.muc.han), dapAn: bo(C.c.dung.nhan), chon: i >= 0 ? bo(C.dap[i].nhan) : '(hết giờ)', dung: dung });
    if (dung) {
      var conLai = Math.max(0, 1 - C.troiQua / C.giay);
      G.chuoi++; G.chuoiMax = Math.max(G.chuoiMax, G.chuoi); G.dung++;
      var cong = 100 + Math.round(conLai * 50) + (G.chuoi >= 3 ? 20 : 0);
      G.diem += cong;
      no(C.bong[i], true); bayDiem(C.bong[i], '+' + cong); amThanh('dung');
    } else {
      G.chuoi = 0;
      G.sai.push(C.q);
      if (i >= 0) { no(C.bong[i], false); amThanh('sai'); }
      else amThanh('diBay');
      var od = C.bong[iDung];
      od.el.classList.add('la-dap-an');
      // Bóng đúng đã bay mất hoặc đang nằm thấp (lời giải che): kéo về phần trên khung cho học sinh thấy
      var Ht = troi.clientHeight;
      if (i < 0 || od.y > Ht * .42 || od.y < 0) {
        od.el.classList.add('ve-lai');
        od.el.style.transform = 'translate(' + od.x + 'px,' + Math.round(Ht * .2) + 'px)';
      }
    }
    C.bong.forEach(function (o, k) { if (k !== i && k !== iDung) o.el.classList.add('mo'); });
    capNhatHud();
    var nhan = dung ? '<b class="bb-dung-r">✓ Chính xác!</b>' : i < 0 ? '<b class="bb-sai-r">⏰ Bóng bay mất rồi!</b>' : '<b class="bb-sai-r">✗ Chưa đúng</b>';
    giai.innerHTML = '<div class="bb-giai-o ' + (dung ? 'dung' : 'sai') + '">' + nhan +
      '<span class="bb-giai-nd">' + (dung ? '' : 'Đáp án: ') + C.c.giai + '</span>' +
      '<span class="bb-giai-nut">' + TV.nutLoa(C.c.doc) + '<button type="button" class="btn solid bb-tiep">Tiếp ›</button></span></div>';
    var hen = setTimeout(tiep, dung ? 1300 : 2800);
    function tiep() { clearTimeout(hen); G.choTiep = null; if (G && G.cau === C) cauTiep(); }
    G.choTiep = tiep;
    giai.querySelector('.bb-tiep').addEventListener('click', tiep);
    // Bấm loa nghe lại thì dừng tự chuyển câu
    giai.querySelector('.tv-loa') && giai.querySelector('.tv-loa').addEventListener('click', function () { clearTimeout(hen); });
  }

  function ketThuc() {
    G.xong = true; G.dangChay = false; dungVong();
    hud.hidden = true; deBai.hidden = true; dsBong.innerHTML = ''; vach.style.width = '0'; thanh.classList.remove('khoa');
    var tong = G.ds.length, tl = G.dung / tong, sao = tl >= .9 ? 3 : tl >= .7 ? 2 : tl >= .4 ? 1 : 0;
    var k = khoaKL(), cu = docKL()[k] || 0, moi = !G.laLai && G.diem > cu;
    if (moi) ghiKL(k, G.diem);
    amThanh(sao >= 2 ? 'xong' : 'xongVua');
    var loi = sao === 3 ? 'Xuất sắc! Tai bạn thính quá 👏' : sao === 2 ? 'Giỏi lắm! Còn chút xíu nữa thôi 💪' : sao === 1 ? 'Khá rồi! Luyện thêm vài lượt nhé 🌱' : 'Đừng nản, nghe lại các câu bên dưới rồi chơi tiếp nhé 🌱';
    var dsSai = {}, hangSai = '';
    G.sai.forEach(function (q) {
      var m = q.muc, key = m.chu ? m.chu + m.goc + m.thanh : m.han;
      if (dsSai[key]) return; dsSai[key] = 1;
      hangSai += '<li>' + TV.nutLoa(m.chu ? m.chu : m.docTxt) + (m.chu ? giaiAm(m) : giaiTu(m)) + '</li>';
    });
    man.className = 'bb-man on';
    man.innerHTML = '<div class="bb-the bb-ket">' +
      '<div class="bb-sao">' + [1, 2, 3].map(function (s) { return '<span class="' + (s <= sao ? 'on' : '') + '">★</span>'; }).join('') + '</div>' +
      '<div class="bb-tong-diem">' + G.diem + ' <small>điểm</small></div>' +
      (moi ? '<div class="bb-moi">🏆 Kỷ lục mới!</div>' : cu && !G.laLai ? '<p class="bb-kl">Kỷ lục: ' + cu + ' điểm</p>' : '') +
      '<p class="bb-loi">' + loi + '</p>' +
      '<div class="bb-chip"><span>✓ Đúng ' + G.dung + '/' + tong + '</span><span>🔥 Chuỗi dài nhất ' + G.chuoiMax + '</span></div>' +
      (G.laLai ? '<p class="bb-kl">Lượt luyện lại câu sai không tính kỷ lục.</p>' : '') +
      '<div class="dd-khu"></div>' +
      '<div class="bb-nut-ket"><button type="button" class="btn gold bb-choi-lai">↻ Chơi lượt mới</button>' +
      (G.sai.length ? '<button type="button" class="btn bb-luyen-sai">🎯 Luyện lại ' + Object.keys(dsSai).length + ' câu sai</button>' : '') + '</div>' +
      (hangSai ? '<div class="bb-on-lai"><b>Cần ôn lại</b><ul>' + hangSai + '</ul></div>' : '') +
    '</div>';
    var sai = G.sai.slice();
    // Bảng xếp hạng: chỉ lượt Trộn tất cả (không phải luyện lại câu sai), mỗi bài × mức một bảng
    var khuDiem = man.querySelector('.dd-khu');
    if (window.QM_DIEM && S.dang === 'tron' && !G.laLai) {
      var n = nhomDangChon();
      QM_DIEM.gui({ lesson: QM_DIEM.maBai((CF.maDiem == null ? 'h2' : CF.maDiem), n.tongHop ? (CF.tongHopDiem || 'tong-hop-bai0') : n.diem, 'bong-bay', S.muc),
        lessonTitle: (CF.tenDiem || '') + n.ten + ' · Bắn bóng bay · ' + MUC[S.muc].ten,
        score: G.diem, total: G.ds.length * 170, bestStreak: G.chuoiMax, durationSeconds: (Date.now() - G.batDauLuc) / 1000,
        chiTiet: G.ct, hoTen: HS ? HS.hoTen : '', lop: HS ? HS.lop : '',
        linkBxh: (CF.bxh || 'bang-xep-hang.html') + '?tro=bong-bay&bai=' + n.ma + '&muc=' + S.muc }, khuDiem);
    }
    man.querySelector('.bb-choi-lai').addEventListener('click', function () { batDau(); });
    var ls = man.querySelector('.bb-luyen-sai');
    if (ls) ls.addEventListener('click', function () {
      var gap = [], da = {};
      sai.forEach(function (q) { var key = q.dang + (q.muc.chu ? q.muc.chu + q.muc.goc + q.muc.thanh : q.muc.han); if (!da[key]) { da[key] = 1; gap.push(q); } });
      batDau(tron(gap));
    });
  }

  manChao();

  // Cho phần kiểm tra tự động
  window.QM_BB_KIEM = { tachPinyin: tachPinyin, datDau: datDau, taiNhom: taiNhom, DANG: DANG, THU_TU_DANG: THU_TU_DANG, MUC: MUC, NHOM: NHOM, taoLuot: taoLuot, S: S, chuanHoaPy: chuanHoaPy };
})();
