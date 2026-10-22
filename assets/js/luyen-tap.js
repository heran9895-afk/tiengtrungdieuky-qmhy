/* =========================================================
   LUYỆN TỪ VỰNG — Tiếng Trung Diệu Kỳ
   Thanh điều khiển 3 ô ngang nhau: Chặng · Dạng bài · Pinyin. Đổi ô nào bài tự bắt đầu lại.
   Dạng bài: Chọn chữ Hán · Nghe chọn từ · Chọn pinyin · Ghép cặp · Điền từ vào câu · Sắp xếp câu · Trộn tất cả.
   Chặng đặc biệt: 🧠 Ôn thông minh (từ hay sai, lâu chưa ôn) · 🎲 Ngẫu nhiên (từ chưa thuộc).
   Dữ liệu + phát âm: tu-vung-chung.js · Tiến độ + từ khó: tien-do.js (nhúng cả hai TRƯỚC file này).
   Thêm dạng bài trắc nghiệm mới: thêm một mục vào DANG theo khuôn de/hoi/dap/giai, thêm tên vào DANG_DS và TI_LE.
   ========================================================= */
(function () {
  var TV = window.QM_TV, TD = window.QM_TIENDO, el = document.getElementById('luyen-tap');
  if (!TV || !TD || !el) return;
  var esc = TV.esc, CHANG = 20;
  var CAP = TV.CAP;                                         // HSK 1 … 7-9, Mở rộng
  var SO_CAP = ['1', '2', '3'];                             // sơ cấp: mặc định hiện pinyin ở đề bài
  var ON_TM = -2, NGAU = -1;                                // giá trị ô Chặng cho Ôn thông minh / Ngẫu nhiên

  // ---------- Tiện ích ----------
  function tron(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  // Tách nghĩa thành các cụm nghĩa: bỏ phần ghi chú trong ngoặc, cắt theo dấu phẩy / chấm phẩy / số ①②…
  function cumNghia(w) {
    if (w._cn) return w._cn;
    var t = String(w.nghia || '').toLowerCase().replace(/\([^)]*\)|（[^）]*）|\[[^\]]*\]/g, ' ');
    var ds = t.split(/[,;，；/]|[\u2460-\u2473]|\bvà\b/).map(function (x) { return gonNghia(x); }).filter(function (x) { return x.length >= 2; });
    return (w._cn = ds.length ? ds : [gonNghia(t)]);
  }
  function gonNghia(s) { return String(s).normalize('NFC').replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim(); }   // GIỮ dấu tiếng Việt: "chờ" ≠ "chỗ", "đại sư" ≠ "đại sứ"
  // Hai từ trùng nghĩa nếu có chung ít nhất một cụm nghĩa (北 "phương bắc" và 北边 "phía bắc, phương bắc")
  function trungNghia(a, b) { var cb = cumNghia(b); return cumNghia(a).some(function (x) { return cb.indexOf(x) >= 0; }); }
  // 3 đáp án nhiễu: cùng cấp, ưu tiên cùng từ loại; không trùng chữ, không trùng nghĩa chính
  function dapAnNhieu(w, kho) {
    var hop = kho.filter(function (x) { return x.ma !== w.ma && x.han !== w.han && x.nghia && !trungNghia(x, w); });   // loại từ có chung nghĩa (北 / 北边)
    var cung = tron(hop.filter(function (x) { return w.loai && x.loai === w.loai; })), khac = tron(hop.filter(function (x) { return !(w.loai && x.loai === w.loai); }));
    var chon = [], daCo = {};
    cung.concat(khac).some(function (x) {
      if (daCo[x.han] || chon.some(function (y) { return trungNghia(x, y); })) return false;
      daCo[x.han] = 1; chon.push(x); return chon.length === 3;
    });
    return chon;
  }

  // ---------- Khung trang ----------
  el.innerHTML =
    '<div class="tv-cap lt-cap" role="tablist">' + CAP.map(function (c) {
      return '<button type="button" role="tab" data-cap="' + c + '"' + (c === 'MR' ? ' class="tv-cap-mr"' : '') + '>' + TV.tenCap(c) + '</button>'; }).join('') +
      '<button type="button" role="tab" data-cap="KHO" class="lt-cap-kho">⭐ Từ khó <span class="lt-so-kho"></span></button></div>' +
    '<div class="lt-thanh" id="lt-thanh">' +
      '<label class="lt-o"><span class="lt-o-nhan">Chặng</span><select class="lt-chon-chang" aria-label="Chọn chặng"></select></label>' +
      '<label class="lt-o"><span class="lt-o-nhan">Dạng bài</span><select class="lt-chon-dang" aria-label="Chọn dạng bài"></select></label>' +
      '<button type="button" class="lt-o lt-o-py" aria-pressed="true" title="Hiện / ẩn pinyin ở đề bài"><span class="lt-o-nhan">Pinyin</span><b class="lt-py-tt"></b></button>' +
    '</div>' +
    '<div class="lt-tong"></div>' +
    '<div class="lt-bai" aria-live="polite"><div class="tv-trong">Đang tải từ vựng…</div></div>';
  var thanh = el.querySelector('.lt-thanh'), selChang = el.querySelector('.lt-chon-chang'), selDang = el.querySelector('.lt-chon-dang'),
      nutPy = el.querySelector('.lt-o-py'), khuTong = el.querySelector('.lt-tong'), khuBai = el.querySelector('.lt-bai');

  var S = { cap: '1', chang: 0, dang: 'tron', pinyin: true, kho: [], ds: [] };
  var daTuongTac = false;                                   // lần mở trang đầu: không tự cuộn
  function demKho() { var n = TD.dsKho().length; el.querySelector('.lt-so-kho').textContent = n ? '(' + n + ')' : ''; }

  // ---------- Cấp ----------
  function chonCap(c) {
    S.cap = c; S.pinyin = c === 'KHO' || SO_CAP.indexOf(c) >= 0;
    el.querySelectorAll('.lt-cap button').forEach(function (b) { b.classList.toggle('on', b.dataset.cap === c); });
    khuBai.innerHTML = '<div class="tv-trong">Đang tải từ vựng…</div>'; khuTong.innerHTML = '';
    try { history.replaceState(null, '', c === 'KHO' ? '#tu-kho' : '#hsk' + c); } catch (e) {}
    var tai = c === 'KHO' ? taiTuKho() : TV.taiCap(c).then(function (d) { return { kho: d, ds: d }; });
    tai.then(function (r) {
      if (S.cap !== c) return;
      S.kho = r.kho; S.ds = r.ds;
      // mở sẵn chặng đầu tiên chưa thuộc hết
      S.chang = 0;
      for (var i = 0; i * CHANG < S.ds.length; i++) { if (TD.dem(S.ds.slice(i * CHANG, (i + 1) * CHANG)).thuoc < Math.min(CHANG, S.ds.length - i * CHANG)) { S.chang = i; break; } }
      veThanh(); batDau(); if (daTuongTac) giuTrongManHinh();
    }).catch(function () { khuBai.innerHTML = '<div class="tv-trong">Chưa tải được dữ liệu, bạn kiểm tra mạng rồi thử lại nhé.</div>'; });
  }
  function taiTuKho() {                                     // từ khó có thể nằm ở nhiều cấp: tải đúng những cấp cần
    var ds = TD.dsKho(), caps = {};
    ds.forEach(function (x) { caps[x.cap] = 1; });
    return Promise.all(Object.keys(caps).map(function (c) { return TV.taiCap(c).catch(function () { return []; }); })).then(function (nhom) {
      var tatCa = [].concat.apply([], nhom), theoMa = {};
      tatCa.forEach(function (w) { theoMa[w.ma] = w; });
      return { kho: tatCa, ds: ds.map(function (x) { return theoMa[x.ma]; }).filter(Boolean) };
    });
  }

  // ---------- Thanh điều khiển: Chặng · Dạng bài · Pinyin ----------
  function veThanh() {
    demKho();
    var ds = S.ds, kho = S.cap === 'KHO';
    if (kho) {
      selChang.innerHTML = '<option value="0">⭐ ' + ds.length + ' từ khó · ' + Math.min(CHANG, ds.length) + ' từ/lượt</option>';
      selChang.disabled = true;
    } else {
      var soChang = Math.ceil(ds.length / CHANG), daHoc = ds.some(function (w) { return TD.chiTiet(w.ma); });
      selChang.disabled = false;
      selChang.innerHTML = (daHoc ? '<option value="' + ON_TM + '">🧠 Ôn thông minh (từ hay sai, lâu chưa ôn)</option>' : '') +
        '<option value="' + NGAU + '">🎲 Ngẫu nhiên (từ chưa thuộc)</option>' +
        Array.apply(null, Array(soChang)).map(function (_, i) {
          var phan = ds.slice(i * CHANG, (i + 1) * CHANG), d = TD.dem(phan);
          return '<option value="' + i + '">Chặng ' + (i + 1) + (d.thuoc === phan.length ? ' ✓' : ' · ' + d.thuoc + '/' + phan.length) + ' · ' + phan.slice(0, 3).map(function (w) { return w.han; }).join(' ') + '</option>';
        }).join('');
      if (S.chang === ON_TM && !daHoc) S.chang = 0;
    }
    selChang.value = kho ? '0' : String(S.chang);
    selDang.innerHTML = DANG_DS.map(function (k) { return '<option value="' + k + '">' + DANG[k].ico + ' ' + DANG[k].ten + '</option>'; }).join('');
    selDang.value = S.dang;
    capNhatPy();
    var d = TD.dem(ds), n = ds.length || 1;                  // tổng tiến độ của cấp
    khuTong.innerHTML = ds.length ? '<div class="lt-vach"><i class="thuoc" style="width:' + (d.thuoc / n * 100) + '%"></i><i class="dang" style="width:' + (d.dang / n * 100) + '%"></i></div>' +
      '<div class="lt-chu-thich"><span><i class="thuoc"></i>Đã thuộc ' + d.thuoc + '</span><span><i class="dang"></i>Đang học ' + d.dang + '</span><span><i class="moi"></i>Mới ' + d.moi + '</span></div>' : '';
  }
  function capNhatPy() {
    nutPy.setAttribute('aria-pressed', S.pinyin); nutPy.classList.toggle('on', S.pinyin);
    nutPy.querySelector('.lt-py-tt').textContent = S.pinyin ? 'Hiện' : 'Ẩn';
    khuBai.classList.toggle('an-py', !S.pinyin);
  }
  selChang.addEventListener('change', function () { S.chang = +selChang.value; batDau(); giuTrongManHinh(); });
  selDang.addEventListener('change', function () { S.dang = selDang.value; batDau(); giuTrongManHinh(); });
  nutPy.addEventListener('click', function () { S.pinyin = !S.pinyin; capNhatPy(); });   // chỉ ẩn/hiện, không làm lại bài

  // Ôn thông minh: điểm ưu tiên = còn yếu (hộp thấp) + hay sai + lâu chưa ôn; thiếu thì bù bằng từ mới
  function onThongMinh(ds) {
    var bayGio = Date.now();
    var hoc = ds.map(function (w) {
      var t = TD.chiTiet(w.ma); if (!t) return null;
      var ngay = (bayGio - (t.t || bayGio)) / 864e5;
      return { w: w, diem: (4 - t.h) * 3 + t.s * 2 - t.d * 0.5 + Math.min(ngay, 30) / 3 + Math.random() * 1.5 };
    }).filter(Boolean).sort(function (a, b) { return b.diem - a.diem; }).map(function (x) { return x.w; });
    var luot = hoc.slice(0, CHANG);
    if (luot.length < CHANG) luot = luot.concat(ds.filter(function (w) { return !TD.chiTiet(w.ma); }).slice(0, CHANG - luot.length));
    return luot;
  }
  function dsLuot() {
    var ds = S.ds;
    if (S.cap === 'KHO') return tron(ds).sort(function (a, b) { return TD.hop(a.ma) - TD.hop(b.ma); }).slice(0, CHANG);
    if (S.chang === ON_TM) return onThongMinh(ds);
    if (S.chang === NGAU) {
      var chua = ds.filter(function (w) { return TD.trangThai(w.ma) !== 'thuoc'; });
      return tron(chua.length ? chua : ds).slice(0, CHANG);
    }
    return ds.slice(S.chang * CHANG, (S.chang + 1) * CHANG);
  }

  // ---------- Âm thanh hiệu ứng: tự tạo bằng trình duyệt (Web Audio), không dùng file, nhẹ và không lo bản quyền ----------
  // Nút 🔊/🔇 trên mỗi câu để tắt/bật; trang nhớ lựa chọn trên máy.
  var AM = { bat: true, ctx: null };
  try { AM.bat = localStorage.getItem('qm-am-hieu-ung') !== '0'; } catch (e) {}
  var NOT = {   // mỗi âm là chuỗi nốt [tần số Hz, thời lượng giây]
    dung: [[880, .09], [1318.5, .16]],                  // ting–ting vui
    sai:  [[233, .12], [196, .2]],                      // "bụp" trầm nhẹ
    cham: [[660, .045]],                                // chạm chọn ô
    ghep: [[784, .07], [1046.5, .12]],                  // ghép đúng một cặp
    xong: [[523.3, .1], [659.3, .1], [784, .1], [1046.5, .28]],   // hoàn thành lượt (điểm cao)
    xongVua: [[523.3, .12], [659.3, .22]]                         // hoàn thành lượt (điểm vừa)
  };
  function amThanh(loai) {
    if (!AM.bat || !NOT[loai]) return;
    try {
      var C = AM.ctx || (AM.ctx = new (window.AudioContext || window.webkitAudioContext)());
      if (C.state === 'suspended') C.resume();
      var t = C.currentTime + .01, to = loai === 'sai' ? .07 : .09;
      NOT[loai].forEach(function (n) {
        var o = C.createOscillator(), g = C.createGain();
        o.type = loai === 'sai' ? 'triangle' : 'sine'; o.frequency.value = n[0];
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(to, t + .012); g.gain.exponentialRampToValueAtTime(.0005, t + n[1]);
        o.connect(g); g.connect(C.destination); o.start(t); o.stop(t + n[1] + .02);
        t += n[1] * .85;
      });
    } catch (e) {}                                     // trình duyệt không hỗ trợ: im lặng, không ảnh hưởng bài
  }
  function nutAm() { return '<button type="button" class="lt-am' + (AM.bat ? ' on' : '') + '" aria-pressed="' + AM.bat + '" aria-label="' + (AM.bat ? 'Tắt' : 'Bật') + ' âm thanh hiệu ứng" title="' + (AM.bat ? 'Tắt' : 'Bật') + ' âm thanh hiệu ứng">' + (AM.bat ? '🔊' : '🔇') + '</button>'; }
  function doiAm(nut) {
    AM.bat = !AM.bat; try { localStorage.setItem('qm-am-hieu-ung', AM.bat ? '1' : '0'); } catch (e) {}
    khuBai.querySelectorAll('.lt-am').forEach(function (b) { b.outerHTML = nutAm(); });
    if (AM.bat) amThanh('cham');
  }

  // ---------- Làm bài ----------
  var B = null;   // lượt đang làm: hàng đợi, vị trí, đúng/sai, dạng của từng câu (khi trộn)
  function batDau(dsRieng) {
    if (!S.ds.length) {
      khuBai.innerHTML = '<div class="tv-trong">' + (S.cap === 'KHO' ? 'Bạn chưa có từ khó nào. Làm bài sai, từ đó sẽ tự vào đây; hoặc bấm ☆ ở trang tra cứu để tự thêm. 🌱'
        : 'Cấp này đang được cô cập nhật, bạn quay lại sau nhé! 🌱') + '</div>';
      return;
    }
    var ds = tron(dsRieng || dsLuot());
    var D = DANG[S.dang];
    if (D.dungDuoc) {
      var truoc = ds.length; ds = ds.filter(D.dungDuoc);
      if (!ds.length) {
        khuBai.innerHTML = '<div class="tv-trong">' + (S.dang === 'nghe' ? 'Máy này chưa có giọng đọc tiếng Trung nên chưa làm được dạng Nghe. Bạn thử mở bằng Chrome hoặc chọn dạng bài khác nhé.'
          : 'Các từ trong lượt này chưa có câu ví dụ phù hợp cho dạng bài này (cấp cao đang được cô bổ sung câu). Bạn chọn dạng khác nhé.') + '</div>';
        return;
      }
      if (ds.length < truoc) TV.baoLoi('Đã bỏ qua ' + (truoc - ds.length) + ' từ chưa có dữ liệu cho dạng bài này.');
    }
    B = { goc: ds, hang: ds.slice(), i: 0, dung: 0, sai: 0, daSai: {}, kieu: [] };
    TV.dungDoc(); veCau();
  }
  function kieuCau(i) {                                      // dạng của câu thứ i (trộn: bốc theo tỉ lệ của tầng, nhớ lại để không đổi khi vẽ lại)
    if (S.dang !== 'tron') return S.dang;
    return B.kieu[i] || (B.kieu[i] = boc(B.hang[i], i));
  }
  function veCau() {
    if (B.i >= B.hang.length) return veKetQua();
    var w = B.hang[B.i], k = kieuCau(B.i);
    if (k === 'ghep') return veGhep();
    if (k === 'xep') return veXep(w);
    veTracNghiem(w, k);
  }
  function dauCau(w, k) {                                    // hàng trên của mỗi câu: tiến độ lượt + dạng + nút ⭐
    var tong = B.hang.length;
    return '<div class="lt-dau-bai"><span class="lt-dem">' + (S.dang === 'tron' ? '🔀 ' : '') + DANG[k].ten + ' · ' + (B.i + 1) + '/' + tong + '</span><span class="lt-dau-nut">' + nutAm() + nutSao(w) + '</span></div>' +
      '<div class="lt-vach lt-vach-bai"><i class="thuoc" style="width:' + (B.i / tong * 100) + '%"></i></div>';
  }
  function nutSao(w, coMa) {
    var on = TD.laKho(w.ma);
    return '<button type="button" class="tv-sao lt-sao' + (on ? ' on' : '') + '"' + (coMa ? ' data-ma="' + esc(w.ma) + '"' : '') + ' aria-pressed="' + on + '" aria-label="' + (on ? 'Bỏ khỏi' : 'Thêm vào') + ' danh sách từ khó">' + (on ? '★' : '☆') + '<span>Từ khó</span></button>';
  }
  function tiep() { B.i++; TV.dungDoc(); veCau(); giuTrongManHinh(); }
  function ghiKetQua(w, dung, tuThemKho) {
    TD.ghi(w, dung);
    if (dung) B.dung++; else { B.sai++; B.daSai[w.ma] = w; if (tuThemKho && !TD.laKho(w.ma)) { TD.datKho(w, true); return true; } }
    return false;
  }
  function tags(w) { return (w.hv ? '<span class="tag gold">Hán Việt: ' + esc(w.hv) + '</span>' : '') + (w.loai ? '<span class="tag">' + esc(w.loai) + '</span>' : ''); }
  function khuatDuoi() { var sf = document.querySelector('.sf'); return sf ? sf.getBoundingClientRect().top : innerHeight; }   // mép trên thanh cuối trang
  // Khung bài bị cuộn khuất thì đưa lên ngay dưới header (đủ chỗ thì giữ cả thanh điều khiển, màn nhỏ thì ưu tiên khung bài).
  // Header chung tự thu gọn khi cuộn nên căn lại thêm một lần sau khi header đổi chiều cao.
  function giuTrongManHinh() {
    var hdr = document.querySelector('.sh-header');
    function day() {
      var tren = hdr ? hdr.getBoundingClientRect().bottom : 0, duoi = khuatDuoi();
      var moc = (khuBai.getBoundingClientRect().bottom - thanh.getBoundingClientRect().top) <= duoi - tren - 12 ? thanh : khuBai;
      var r = moc.getBoundingClientRect();
      if (Math.abs(r.top - tren - 8) > 12) window.scrollTo(0, Math.max(0, r.top + scrollY - tren - 8));
    }
    var r = khuBai.getBoundingClientRect(), tren = hdr ? hdr.getBoundingClientRect().bottom : 0;
    if (r.top < tren || r.bottom > khuatDuoi()) { day(); setTimeout(day, 380); }
  }

  // ---------- Các dạng bài ----------
  var TONE = { 'ā': ['a', 1], 'á': ['a', 2], 'ǎ': ['a', 3], 'à': ['a', 4], 'ē': ['e', 1], 'é': ['e', 2], 'ě': ['e', 3], 'è': ['e', 4], 'ī': ['i', 1], 'í': ['i', 2], 'ǐ': ['i', 3], 'ì': ['i', 4],
    'ō': ['o', 1], 'ó': ['o', 2], 'ǒ': ['o', 3], 'ò': ['o', 4], 'ū': ['u', 1], 'ú': ['u', 2], 'ǔ': ['u', 3], 'ù': ['u', 4], 'ǖ': ['ü', 1], 'ǘ': ['ü', 2], 'ǚ': ['ü', 3], 'ǜ': ['ü', 4],
    'Ā': ['A', 1], 'Á': ['A', 2], 'Ǎ': ['A', 3], 'À': ['A', 4], 'Ē': ['E', 1], 'É': ['E', 2], 'Ě': ['E', 3], 'È': ['E', 4], 'Ō': ['O', 1], 'Ó': ['O', 2], 'Ǒ': ['O', 3], 'Ò': ['O', 4] };
  var DAU = {};                                              // ngược lại: 'a3' -> 'ǎ'
  Object.keys(TONE).forEach(function (k) { DAU[TONE[k][0] + TONE[k][1]] = k; });
  function pyGon(py) { return String(py || '').toLowerCase().replace(/[\s·'’-]/g, ''); }
  // Đổi thanh điệu: giữ nguyên âm, thay dấu thanh ở một âm tiết → ra các phương án "gần đúng" để luyện tai, luyện mắt
  function bienThePy(py) {
    var ch = Array.from(py), vt = [];
    ch.forEach(function (c, i) { if (TONE[c]) vt.push(i); });
    var kq = [], daCo = {}; daCo[py] = 1;
    tron(vt).forEach(function (i) {
      var goc = TONE[ch[i]];
      tron([1, 2, 3, 4].filter(function (t) { return t !== goc[1]; })).forEach(function (t) {
        var moi = ch.slice(); moi[i] = DAU[goc[0] + t] || ch[i];
        var s = moi.join(''); if (!daCo[s]) { daCo[s] = 1; kq.push(s); }
      });
    });
    // nhiều âm tiết: xen phương án đổi 2 âm tiết cho đa dạng
    if (vt.length > 1) {
      var m2 = ch.slice(); vt.slice(0, 2).forEach(function (i) { var g = TONE[ch[i]]; m2[i] = DAU[g[0] + (g[1] % 4 + 1)] || ch[i]; });
      var s2 = m2.join(''); if (!daCo[s2]) kq.unshift(s2);
    }
    return kq;
  }
  function soChu(w) { return Array.from(w.han || '').length; }
  // Đáp án nhiễu cho dạng Nghe: ưu tiên từ đọc gần giống (cùng phụ âm/vần, khác thanh); loại hẳn từ đọc y hệt (他/她/它 đều là tā)
  function nhieuNghe(w) {
    var goc = TV.boDau(w.py), dau = goc.slice(0, 2), pg = pyGon(w.py);
    var hop = S.kho.filter(function (x) { return x.ma !== w.ma && x.han !== w.han && pyGon(x.py) !== pg && x.doc !== '-'; });
    var gan = tron(hop.filter(function (x) { return TV.boDau(x.py) === goc || (TV.boDau(x.py).slice(0, 2) === dau && soChu(x) === soChu(w)); }));
    var cungDo = tron(hop.filter(function (x) { return soChu(x) === soChu(w); }));
    var chon = [], daCo = {};
    gan.concat(cungDo, tron(hop)).some(function (x) { if (daCo[x.ma] || daCo[pyGon(x.py)]) return false; daCo[x.ma] = daCo[pyGon(x.py)] = 1; chon.push(x); return chon.length === 3; });
    return chon;
  }
  function coAm(w) { return w.doc !== '-' && TV.coGiong(w.doc); }
  function nutNghe(w) { return '<button type="button" class="tv-loa lt-nghe" data-doc="' + esc(w.doc || w.han) + '" aria-label="Nghe lại">' + TV.LOA + '</button>'; }
  var dA = function (k, html, dung) { return { k: k, html: html, dung: !!dung }; };   // một ô đáp án
  var hanO = function (x) { return '<span class="lt-dap-chu hanzi">' + esc(x.han) + '</span><span class="lt-dap-py">' + esc(x.py) + '</span>'; };

  // ---------- Tách câu ví dụ thành các khối (dùng pinyin có dấu cách theo từ để biết chỗ cắt chữ Hán) ----------
  var TRO_TU = '的了吗呢吧啊呀哦着过得地们';                          // trợ từ đứng lẻ thì gộp vào khối phía trước
  var LUONG_TU = '个本只张件位条次块口家种双些点辆杯瓶岁';               // lượng từ đi sau số / 这 那 thì gộp làm một khối
  var SO_CHI = '一二三四五六七八九十两几这那哪每半';
  var TOI_DA_KHOI = 8;                                           // câu dài hơn thì gộp bớt các khối ngắn liền nhau
  function laHan(c) { return /[\u3400-\u9fff]/.test(c); }
  function demAmTiet(tu) {                                       // số âm tiết = số cụm nguyên âm (dấu ' và - ngắt âm tiết)
    var s = tu.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/ü|u\u0308/g, 'v');
    return (s.match(/[aeiouv]+/g) || []).length;
  }
  function tachKhoi(cau) {
    var han = Array.from(cau.han), py = String(cau.py || '');
    var tuPy = py.split(/[\s，。？！、,.?!；;：:“”"‘’（）()…—]+/).filter(function (x) { return /[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/.test(x); });
    var khoi = [], j = 0;
    function boQuaDau() { var d = ''; while (j < han.length && !laHan(han[j])) d += han[j++]; return d; }
    var dauCau = boQuaDau();
    if (dauCau.trim()) return null;                              // câu mở đầu bằng ký tự lạ (số, chữ Latin…): bỏ
    for (var k = 0; k < tuPy.length; k++) {
      var n = demAmTiet(tuPy[k]); if (!n) return null;
      var chu = '';
      for (var m = 0; m < n; m++) { if (j >= han.length || !laHan(han[j])) return null; chu += han[j++]; }
      if (han[j] === '儿' && /r$/i.test(tuPy[k]) && !/^[eé]r$/i.test(tuPy[k].normalize('NFD').replace(/[\u0300-\u036f]/g, ''))) chu += han[j++];   // 儿化: wánr = 玩儿
      var dau = boQuaDau();
      khoi.push({ han: chu, py: tuPy[k], dau: dau.trim() });
    }
    if (j !== han.length) return null;                           // không khớp hết câu: không dùng
    // gộp trợ từ đứng lẻ vào khối trước
    var gop = [];
    khoi.forEach(function (x) {
      var truoc = gop[gop.length - 1];
      var soLuong = truoc && !truoc.dau && x.han.length === 1 && LUONG_TU.indexOf(x.han) >= 0 && SO_CHI.indexOf(truoc.han.slice(-1)) >= 0;   // 一 + 个 → 一个
      if (truoc && !truoc.dau && x.han.length === 1 && (TRO_TU.indexOf(x.han) >= 0 || soLuong)) { truoc.han += x.han; truoc.py += ' ' + x.py; truoc.dau = x.dau; }
      else gop.push(x);
    });
    // quá nhiều khối: gộp cặp liền nhau ngắn nhất (không gộp qua dấu câu)
    var ep = 0;                                                  // số lần phải gộp ép (càng ít càng tự nhiên)
    while (gop.length > TOI_DA_KHOI) {
      var tot = -1, ngan = 1e9;
      for (var i = 0; i < gop.length - 1; i++) { if (gop[i].dau) continue; var d = gop[i].han.length + gop[i + 1].han.length; if (d < ngan) { ngan = d; tot = i; } }
      if (tot < 0) break;
      gop.splice(tot, 2, { han: gop[tot].han + gop[tot + 1].han, py: gop[tot].py + ' ' + gop[tot + 1].py, dau: gop[tot + 1].dau }); ep++;
    }
    if (gop.length < 3 || gop.length > TOI_DA_KHOI) return null;
    var cuoi = gop[gop.length - 1].dau; gop[gop.length - 1].dau = '';
    // dấu câu giữa câu (dấu phẩy…) đi theo khối đứng trước nó
    return { khoi: gop.map(function (x) { return { han: x.han + x.dau, py: x.py }; }), cuoi: cuoi, ep: ep };
  }

  // Câu ví dụ dùng cho dạng câu (nhớ lại để lần sau không tính lại)
  var CAU_DIEN = {}, CAU_XEP = {};
  function cauDien(w) {
    if (!(w.ma in CAU_DIEN)) CAU_DIEN[w.ma] = (w.cau || []).filter(function (c) { return c.han.indexOf(w.han) >= 0; })[0] || null;
    return CAU_DIEN[w.ma];
  }
  function cauXep(w) {
    if (!(w.ma in CAU_XEP)) {
      CAU_XEP[w.ma] = null;
      (w.cau || []).forEach(function (c) {                       // có 2 câu thì chọn câu tách tự nhiên hơn (ít phải gộp ép)
        var t = tachKhoi(c); if (t && (!CAU_XEP[w.ma] || t.ep < CAU_XEP[w.ma].ep)) { t.cau = c; CAU_XEP[w.ma] = t; }
      });
    }
    return CAU_XEP[w.ma];
  }
  function nutGoiY(c) { return c && c.viet ? '<button type="button" class="lt-goi-y-nut" data-viet="' + esc(c.viet) + '">💡 Gợi ý nghĩa câu</button>' : ''; }
  function cauDayDu(c, w) {                                   // câu hoàn chỉnh sau khi trả lời: chữ (tô từ đang học) + loa + pinyin + nghĩa
    var han = c.han.split(w.han).map(esc).join('<b>' + esc(w.han) + '</b>');
    return '<div class="lt-cau-du"><div class="lt-cau-han">' + TV.nutLoa(c.han, false, c.doc) + '<span class="hanzi">' + han + '</span></div>' +
      (c.py ? '<div class="lt-cau-py">' + esc(c.py) + '</div>' : '') + (c.viet ? '<div class="lt-cau-viet">' + esc(c.viet) + '</div>' : '') + '</div>';
  }

  var DANG = {
    tron:  { ten: 'Trộn tất cả', ico: '🔀' },
    chu: { ten: 'Chọn chữ Hán', ico: '✍️', lop: 'chu',
      de: function (w) { return '<div class="lt-de-nghia">' + esc(w.nghia) + '</div>'; },
      hoi: function (w) { return 'Chữ Hán nào mang nghĩa này?' + (w.loai ? ' <span class="tag">' + esc(w.loai) + '</span>' : ''); },
      dap: function (w) { return [dA(w.ma, hanO(w), 1)].concat(dapAnNhieu(w, S.kho).map(function (x) { return dA(x.ma, hanO(x)); })); },
      giai: function (w) { return giaiTu(w); } },
    nghe: { ten: 'Nghe chọn từ', ico: '🎧', lop: 'chu', dungDuoc: coAm,
      de: function (w) { return '<div class="lt-de-nghe">' + nutNghe(w) + '<small>Bấm loa để nghe lại</small></div>'; },
      hoi: function () { return 'Bạn nghe thấy từ nào?'; },
      dap: function (w) { return [dA(w.ma, hanO(w), 1)].concat(nhieuNghe(w).map(function (x) { return dA(x.ma, hanO(x)); })); },
      giai: function (w) { return giaiTu(w) + '<div class="lt-tu-nghia nho">' + esc(w.nghia) + '</div>'; },
      sauKhiVe: function (w) { setTimeout(function () { var n = khuBai.querySelector('.lt-nghe'); if (n) TV.doc(w.doc || w.han, n); }, 250); } },
    py: { ten: 'Chọn pinyin', ico: '🔤', lop: 'py',
      de: function (w) { return '<div class="lt-de-chu"><span class="hanzi">' + esc(w.han) + '</span></div><div class="lt-de-phu">' + esc(w.nghia) + '</div>'; },
      hoi: function () { return 'Chọn phiên âm đúng (chú ý thanh điệu)'; },
      dap: function (w) {
        var bt = bienThePy(w.py).slice(0, 3);
        if (bt.length < 3) dapAnNhieu(w, S.kho).some(function (x) { if (bt.indexOf(x.py) < 0 && x.py !== w.py) bt.push(x.py); return bt.length === 3; });
        return [dA(w.py, esc(w.py), 1)].concat(bt.map(function (p) { return dA(p, esc(p)); }));
      },
      giai: function (w) { return '<div class="lt-giai-tu">' + TV.nutLoa(w.han, false, w.doc) + '<span class="lt-tu-py">' + esc(w.py) + '</span></div>'; } },
    dien: { ten: 'Điền từ vào câu', ico: '🧱', lop: 'chu', dungDuoc: function (w) { return !!cauDien(w); },
      de: function (w) { var c = cauDien(w); return '<div class="lt-de-cau hanzi">' + c.han.split(w.han).map(esc).join('<span class="lt-o-trong">？</span>') + '</div>'; },
      hoi: function (w) { return 'Chọn từ điền vào chỗ trống' + nutGoiY(cauDien(w)); },
      dap: function (w) { return [dA(w.ma, hanO(w), 1)].concat(dapAnNhieu(w, S.kho).map(function (x) { return dA(x.ma, hanO(x)); })); },
      giai: function (w) { return cauDayDu(cauDien(w), w); },
      anDeKhiXong: true },
    ghep: { ten: 'Ghép cặp', ico: '🧩', nhom: 5 },
    xep: { ten: 'Sắp xếp câu', ico: '🪜', dungDuoc: function (w) { return !!cauXep(w); } }
  };
  var DANG_DS = ['tron', 'chu', 'nghe', 'py', 'ghep', 'dien', 'xep'];
  function giaiTu(w) { return '<div class="lt-giai-tu"><span class="hanzi">' + esc(w.han) + '</span>' + TV.nutLoa(w.han, false, w.doc) + '<span class="lt-tu-py">' + esc(w.py) + '</span></div>'; }

  // Trộn tất cả: tỉ lệ các dạng theo tầng (sơ cấp nặng phát âm, trung cấp nặng ngữ cảnh câu, cao cấp nặng mặt chữ)
  var TI_LE = {
    so:    { chu: 2, nghe: 3, py: 3, ghep: 1, dien: 2, xep: 2 },
    trung: { chu: 2, nghe: 2, py: 2, ghep: 1, dien: 3, xep: 3 },
    cao:   { chu: 3, nghe: 2, py: 2, ghep: 1, dien: 2, xep: 1 }
  };
  function tang() { return SO_CAP.indexOf(S.cap) >= 0 ? 'so' : ['4', '5', '6'].indexOf(S.cap) >= 0 ? 'trung' : 'cao'; }
  function boc(w, i) {
    var tl = TI_LE[tang()], tui = [];
    Object.keys(tl).forEach(function (k) {
      if (k === 'ghep' && B.hang.length - i < 4) return;               // ghép cần ít nhất 4 từ còn lại
      if (DANG[k].dungDuoc && !DANG[k].dungDuoc(w)) return;
      for (var n = 0; n < tl[k]; n++) tui.push(k);
    });
    return tui[Math.floor(Math.random() * tui.length)] || 'chu';
  }

  // Trắc nghiệm gọn: đề + 4 đáp án 2×2 + nút "Câu tiếp" ngay dưới; lời giải hiện ngay trong khung đề
  function veTracNghiem(w, kieu) {
    var D = DANG[kieu];
    var dap = B.dap && B.dap.i === B.i ? B.dap.ds : tron(D.dap(w));
    B.dap = { i: B.i, ds: dap, kieu: kieu };
    khuBai.innerHTML = dauCau(w, kieu) +
      '<div class="lt-de">' + D.de(w) + '<p class="lt-hoi">' + D.hoi(w) + '</p></div>' +
      '<div class="lt-dap ' + D.lop + '">' + dap.map(function (x, k) {
        return '<button type="button" class="lt-dap-o" data-k="' + k + '"><span class="lt-so">' + (k + 1) + '</span>' + x.html + '</button>';
      }).join('') + '</div>' +
      '<div class="lt-nut-the lt-nut-tiep" hidden><button type="button" class="btn solid lt-tiep"></button></div>';
    if (D.sauKhiVe) D.sauKhiVe(w);
  }
  function traLoi(nut) {
    var w = B.hang[B.i], hop = khuBai.querySelector('.lt-dap');
    if (!hop || hop.classList.contains('xong')) return;
    hop.classList.add('xong');
    var ds = B.dap.ds, D = DANG[B.dap.kieu], dung = ds[+nut.dataset.k].dung;
    hop.querySelectorAll('.lt-dap-o').forEach(function (b) { b.disabled = true; if (ds[+b.dataset.k].dung) b.classList.add('dung'); });
    if (!dung) nut.classList.add('sai');
    amThanh(dung ? 'dung' : 'sai');
    var themKho = ghiKetQua(w, dung, true);
    khuBai.querySelector('.lt-sao').outerHTML = nutSao(w);
    var de = khuBai.querySelector('.lt-de'); de.classList.add('xong');   // thu gọn đề để lời giải không đẩy nút Câu tiếp xuống
    if (D.anDeKhiXong) de.querySelector('.lt-de-cau').remove();          // điền câu: câu hoàn chỉnh trong lời giải thay cho câu có chỗ trống
    khuBai.querySelector('.lt-hoi').outerHTML = '<div class="lt-giai"><div class="lt-ket ' + (dung ? 'dung' : 'sai') + '">' +
      (dung ? '🎉 Chính xác!' : '❌ Chưa đúng' + (themKho ? ' · đã thêm vào ⭐ Từ khó' : '')) + '</div>' + D.giai(w) + '</div>';
    hienNutTiep();
  }
  function hienNutTiep() {
    var nt = khuBai.querySelector('.lt-nut-tiep'); nt.hidden = false;
    nt.innerHTML = '<button type="button" class="btn solid lt-tiep">' + (B.i + 1 < B.hang.length ? 'Câu tiếp ›' : 'Xem kết quả ›') + '</button>';
    nt.querySelector('.lt-tiep').focus({ preventScroll: true });
    if (nt.getBoundingClientRect().bottom > khuatDuoi()) giuTrongManHinh();   // nút Câu tiếp bị khuất thì đưa khung bài lên
  }

  // ---------- Sắp xếp câu: chạm khối bên dưới để đưa lên dòng trả lời, chạm khối trên dòng để trả về ----------
  function veXep(w) {
    var X = cauXep(w), n = X.khoi.length, thuTu;
    do { thuTu = tron(X.khoi.map(function (_, i) { return i; })); } while (n > 1 && thuTu.every(function (v, i) { return v === i; }));   // không để trùng thứ tự gốc
    B.xep = { X: X, dat: [] };
    khuBai.innerHTML = dauCau(w, 'xep') +
      '<div class="lt-de lt-de-xep"><p class="lt-hoi">Sắp xếp các khối thành câu đúng' + nutGoiY(X.cau) + '</p>' +
        '<div class="lt-xep-dong" aria-label="Câu của bạn"><span class="lt-xep-cho">Chạm các khối bên dưới theo thứ tự</span></div></div>' +
      '<div class="lt-xep-kho">' + thuTu.map(function (i) {
        return '<button type="button" class="lt-khoi" data-i="' + i + '"><span class="hanzi">' + esc(X.khoi[i].han) + '</span><span class="lt-khoi-py lt-py-de">' + esc(X.khoi[i].py) + '</span></button>'; }).join('') + '</div>' +
      '<div class="lt-nut-the lt-nut-tiep"><button type="button" class="btn lt-xep-xoa">↺ Xếp lại</button><button type="button" class="btn solid lt-xep-kt" disabled>Kiểm tra</button></div>';
  }
  function veDongXep() {
    var Bx = B.xep, dong = khuBai.querySelector('.lt-xep-dong');
    dong.innerHTML = Bx.dat.length ? Bx.dat.map(function (i) { return '<button type="button" class="lt-khoi tren" data-i="' + i + '"><span class="hanzi">' + esc(Bx.X.khoi[i].han) + '</span></button>'; }).join('') +
      (Bx.dat.length === Bx.X.khoi.length ? '<span class="lt-xep-cuoi hanzi">' + esc(Bx.X.cuoi) + '</span>' : '') : '<span class="lt-xep-cho">Chạm các khối bên dưới theo thứ tự</span>';
    khuBai.querySelectorAll('.lt-xep-kho .lt-khoi').forEach(function (b) { b.classList.toggle('da-dat', Bx.dat.indexOf(+b.dataset.i) >= 0); });
    khuBai.querySelector('.lt-xep-kt').disabled = Bx.dat.length !== Bx.X.khoi.length;
  }
  function chamXep(nut) {
    var Bx = B.xep; if (!Bx || Bx.xong) return;
    var i = +nut.dataset.i;
    if (nut.classList.contains('tren')) Bx.dat.splice(Bx.dat.indexOf(i), 1);
    else if (Bx.dat.indexOf(i) < 0) Bx.dat.push(i);
    amThanh('cham'); veDongXep();
  }
  function kiemTraXep() {
    var Bx = B.xep, w = B.hang[B.i]; if (!Bx || Bx.xong) return;
    Bx.xong = true;
    var cua = Bx.dat.map(function (i) { return Bx.X.khoi[i].han; }).join(''), goc = Bx.X.khoi.map(function (k) { return k.han; }).join('');
    var dung = cua === goc;                                         // so theo chữ: hai khối giống nhau đổi chỗ vẫn tính đúng
    amThanh(dung ? 'dung' : 'sai');
    ghiKetQua(w, dung, false);                                      // xếp câu có thể có nhiều cách đúng → sai không tự thêm vào Từ khó
    khuBai.querySelector('.lt-xep-dong').classList.add(dung ? 'dung' : 'sai');
    khuBai.querySelectorAll('.lt-khoi').forEach(function (b) { b.disabled = true; });
    var de = khuBai.querySelector('.lt-de-xep'); de.classList.add('xong');
    khuBai.querySelector('.lt-xep-kho').remove();
    de.querySelector('.lt-hoi').outerHTML = '<div class="lt-giai"><div class="lt-ket ' + (dung ? 'dung' : 'sai') + '">' + (dung ? '🎉 Chính xác!' : '❌ Chưa khớp với câu gốc') + '</div>' +
      (dung ? '' : '<p class="lt-xep-note">Câu gốc ở dưới. Có câu xếp được nhiều cách; thấy câu mình cũng đúng thì hỏi cô nhé.</p>') +
      cauDayDu(Bx.X.cau, w) + '</div>';
    hienNutTiep();
  }

  // ---------- Ghép cặp 2 cột: mỗi lượt 4–5 từ, ngẫu nhiên một trong 3 kiểu, lượt sau không lặp kiểu lượt trước ----------
  // Chạm một ô bên trái rồi một ô bên phải (thứ tự nào cũng được). Từ trùng pinyin / trùng nghĩa chính vẫn tính đúng.
  var KIEU_GHEP = [
    { trai: 'han', phai: 'ng', ten: 'Chữ Hán ↔ Nghĩa' },
    { trai: 'han', phai: 'py', ten: 'Chữ Hán ↔ Pinyin' },
    { trai: 'py',  phai: 'ng', ten: 'Pinyin ↔ Nghĩa' }
  ];
  var TEN_COT = { han: 'Chữ Hán', py: 'Pinyin', ng: 'Nghĩa' }, TEN_COT_NHO = { han: 'chữ Hán', py: 'pinyin', ng: 'nghĩa' };
  var kieuGhepTruoc = -1;
  function noiDungO(w, loai) { return loai === 'han' ? '<span class="hanzi">' + esc(w.han) + '</span>' : loai === 'py' ? esc(w.py) : esc(w.nghia); }
  function giongNhau(a, b, loai) { return a === b || (loai === 'han' ? a.han === b.han : loai === 'py' ? pyGon(a.py) === pyGon(b.py) : trungNghia(a, b)); }
  // Hai từ "đụng nhau" trong một lượt ghép: cùng chữ, hoặc cùng pinyin (khi có cột pinyin), hoặc chung nghĩa (khi có cột nghĩa)
  // → nối kiểu nào cũng hợp lý, không chấm được. Chọn nhóm từ không đụng nhau, từ bị đụng dời xuống sau trong lượt.
  function dungNhau(a, b, K) {
    var cot = [K.trai, K.phai];
    return a.han === b.han || (cot.indexOf('py') >= 0 && pyGon(a.py) === pyGon(b.py)) || (cot.indexOf('ng') >= 0 && trungNghia(a, b));
  }
  function chonNhomGhep(n, K) {
    var con = B.hang.slice(B.i), nhom = [], doi = [];
    con.forEach(function (w) { if (nhom.length < n && !nhom.some(function (x) { return dungNhau(x, w, K); })) nhom.push(w); else doi.push(w); });
    B.hang = B.hang.slice(0, B.i).concat(nhom, doi);
    return nhom;
  }
  function veGhep() {
    var chon = [0, 1, 2].filter(function (k) { return k !== kieuGhepTruoc; }), ki = chon[Math.floor(Math.random() * chon.length)];
    kieuGhepTruoc = ki;
    var K = KIEU_GHEP[ki];
    var ds = chonNhomGhep(Math.min(DANG.ghep.nhom, B.hang.length - B.i), K), n = ds.length;
    if (S.dang === 'tron' && n < 3) { B.kieu[B.i] = 'chu'; return veTracNghiem(B.hang[B.i], 'chu'); }   // trộn: không đủ từ để ghép thì đổi sang dạng khác
    B.ghep = { ds: ds, K: K, sai: {}, xong: 0, a: null, b: null };
    // Một lưới duy nhất, xếp xen kẽ ô trái – ô phải theo từng hàng: hai ô cùng hàng luôn cao bằng nhau, tiêu đề thẳng cột với ô
    var trai = ds.map(function (_, i) { return i; }), phai = tron(trai);
    function o(ben, loai, i) { return '<button type="button" class="lt-gh-o ' + loai + '" data-ben="' + ben + '" data-i="' + i + '">' + noiDungO(ds[i], loai) + '</button>'; }
    var hang = trai.map(function (i, r) { return o('a', K.trai, i) + o('b', K.phai, phai[r]); }).join('');
    khuBai.innerHTML = '<div class="lt-dau-bai"><span class="lt-dem">' + (S.dang === 'tron' ? '🔀 ' : '') + 'Ghép cặp · ' + K.ten + ' · từ ' + (B.i + 1) + '–' + (B.i + n) + '/' + B.hang.length + '</span><span class="lt-dau-nut">' + nutAm() + '</span></div>' +
      '<div class="lt-vach lt-vach-bai"><i class="thuoc" style="width:' + (B.i / B.hang.length * 100) + '%"></i></div>' +
      '<p class="lt-hoi lt-hoi-ghep">Ghép mỗi <b>' + TEN_COT_NHO[K.trai] + '</b> với <b>' + TEN_COT_NHO[K.phai] + '</b> tương ứng</p>' +
      '<div class="lt-ghep k-' + K.trai + '-' + K.phai + '"><div class="lt-gh-nhan ' + K.trai + '">' + TEN_COT[K.trai] + '</div><div class="lt-gh-nhan ' + K.phai + '">' + TEN_COT[K.phai] + '</div>' + hang + '</div>' +
      '<div class="lt-nut-the lt-nut-tiep" hidden><button type="button" class="btn solid lt-tiep"></button></div>';
  }
  function chamGhep(nut) {
    var G = B.ghep; if (!G || nut.disabled) return;
    var ben = nut.dataset.ben;
    if (G[ben] === nut) { nut.classList.remove('chon'); G[ben] = null; return; }   // chạm lại ô đang chọn: bỏ chọn
    if (G[ben]) G[ben].classList.remove('chon');
    G[ben] = nut; nut.classList.add('chon');
    if (!G.a || !G.b) return amThanh('cham');
    var a = G.a, b = G.b; G.a = G.b = null; a.classList.remove('chon'); b.classList.remove('chon');
    var wa = G.ds[+a.dataset.i], wb = G.ds[+b.dataset.i];
    if (giongNhau(wa, wb, G.K.phai) && giongNhau(wa, wb, G.K.trai)) {
      a.disabled = b.disabled = true; a.classList.add('dung'); b.classList.add('dung'); amThanh('ghep');
      setTimeout(function () { a.classList.add('an'); b.classList.add('an'); }, 450);   // mờ đi nhưng giữ chỗ để ô khác không nhảy vị trí
      if (++G.xong === G.ds.length) xongGhep();
    } else {
      G.sai[wa.ma] = 1; amThanh('sai');
      [a, b].forEach(function (x) { x.classList.add('sai'); setTimeout(function () { x.classList.remove('sai'); }, 650); });
    }
  }
  function xongGhep() {
    var G = B.ghep;
    G.ds.forEach(function (w) { ghiKetQua(w, !G.sai[w.ma], true); });
    var soSai = Object.keys(G.sai).length;
    khuBai.querySelector('.lt-hoi-ghep').outerHTML = '<div class="lt-ket ' + (soSai ? 'sai' : 'dung') + ' lt-hoi-ghep">' + (soSai ? '🧩 Xong! Ghép nhầm ' + soSai + ' từ (đã thêm vào ⭐ Từ khó)' : '🎉 Ghép đúng hết ngay lần đầu!') + '</div>';
    B.i += G.ds.length - 1;                                            // nhóm ghép tính là nhiều từ; tiep() cộng thêm 1
    hienNutTiep();
  }

  // ---------- Kết quả ----------
  function veKetQua() {
    var tong = B.dung + B.sai, sai = Object.keys(B.daSai).map(function (k) { return B.daSai[k]; });
    var tl = tong ? Math.round(B.dung / tong * 100) : 0;
    var loi = tl === 100 ? 'Xuất sắc! Đúng hết rồi 🎉' : tl >= 80 ? 'Rất tốt! Ôn lại vài từ còn sai là chắc 💪' : tl >= 50 ? 'Khá rồi, luyện thêm một lượt nữa nhé 🌱' : 'Từ mới mà, cứ từ từ. Làm lại lượt nữa sẽ nhớ hơn 🌱';
    amThanh(tl >= 80 ? 'xong' : 'xongVua');
    var coChangSau = S.cap !== 'KHO' && S.chang >= 0 && (S.chang + 1) * CHANG < S.ds.length;
    veThanh();                                                // cập nhật số "thuộc x/20" trong ô chặng và thanh tổng
    khuBai.innerHTML = '<div class="lt-ket-qua card"><div class="lt-diem">' + tl + '%</div><p class="lt-loi">' + loi + '</p>' +
      '<p class="lt-goi-y">Đúng ' + B.dung + ' · sai ' + B.sai + '</p>' +
      (sai.length ? '<div class="lt-nhan">Từ cần ôn lại</div><ul class="lt-ds-sai">' + sai.map(function (w) {
        return '<li><span class="hanzi">' + esc(w.han) + '</span><span class="lt-ds-py">' + esc(w.py) + '</span><span class="lt-ds-nghia">' + esc(w.nghia) + '</span>' + nutSao(w, true).replace('lt-sao', 'lt-sao lt-sao-ds') + '</li>';
      }).join('') + '</ul>' : '') +
      '<div class="lt-nut-kq">' + (sai.length ? '<button type="button" class="btn solid lt-lam-sai">Luyện lại ' + sai.length + ' từ sai</button>' : '') +
        (coChangSau ? '<button type="button" class="btn' + (sai.length ? '' : ' solid') + ' lt-chang-sau">Chặng ' + (S.chang + 2) + ' ›</button>' : '') +
        '<button type="button" class="btn lt-lai">Làm lại lượt này</button></div></div>';
    giuTrongManHinh();
  }

  // ---------- Sự kiện ----------
  khuBai.addEventListener('click', function (e) {
    var t = e.target;
    var sao = t.closest('.lt-sao');
    if (sao) {
      var w = sao.dataset.ma ? B.daSai[sao.dataset.ma] : B.hang[B.i];
      if (w) { TD.datKho(w, !TD.laKho(w.ma)); sao.outerHTML = sao.dataset.ma ? nutSao(w, true).replace('lt-sao', 'lt-sao lt-sao-ds') : nutSao(w); }
      return;
    }
    if (t.closest('.tv-loa')) return;
    var am = t.closest('.lt-am'); if (am) return doiAm(am);
    var gy = t.closest('.lt-goi-y-nut'); if (gy) { gy.outerHTML = '<span class="lt-goi-y-viet">' + esc(gy.dataset.viet) + '</span>'; return; }
    var o = t.closest('.lt-dap-o'); if (o) return traLoi(o);
    var g = t.closest('.lt-gh-o'); if (g) return chamGhep(g);
    var k = t.closest('.lt-khoi'); if (k) return chamXep(k);
    if (t.closest('.lt-xep-xoa')) { B.xep.dat = []; return veDongXep(); }
    if (t.closest('.lt-xep-kt')) return kiemTraXep();
    if (t.closest('.lt-tiep')) return tiep();
    if (t.closest('.lt-lam-sai')) { batDau(Object.keys(B.daSai).map(function (k) { return B.daSai[k]; })); return giuTrongManHinh(); }
    if (t.closest('.lt-lai')) { batDau(B.goc); return giuTrongManHinh(); }
    if (t.closest('.lt-chang-sau')) { S.chang++; selChang.value = String(S.chang); batDau(); return giuTrongManHinh(); }
  });
  // Bàn phím: 1–4 chọn đáp án · Enter kiểm tra / câu tiếp
  document.addEventListener('keydown', function (e) {
    if (!B || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    if (e.key === 'Enter') {
      var kt = khuBai.querySelector('.lt-xep-kt:not(:disabled)'), tp = khuBai.querySelector('.lt-tiep');
      if (tp) { e.preventDefault(); return tiep(); }
      if (kt) { e.preventDefault(); return kiemTraXep(); }
      return;
    }
    var o = khuBai.querySelectorAll('.lt-dap-o'), n = +e.key;
    if (n >= 1 && n <= o.length && !khuBai.querySelector('.lt-dap.xong')) { e.preventDefault(); traLoi(o[n - 1]); }
  });

  el.querySelector('.lt-cap').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { daTuongTac = true; chonCap(b.dataset.cap); } });
  document.addEventListener('qm-tien-do', demKho);

  var h = location.hash;
  if (/^#tu-kho/.test(h)) chonCap('KHO');
  else { var c = (h.match(/hsk([\dMR-]+)/) || [])[1]; chonCap(CAP.indexOf(c) >= 0 ? c : '1'); }
})();
