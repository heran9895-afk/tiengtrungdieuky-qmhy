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
  // Chế độ BÀI HỌC (trang Bài tập của Chương trình HSK): trang đặt window.QM_BAI_TAP = { ma: 'bai1-bai-tap', ten: 'Bài 1', tang: 'so' }
  // và nạp kho riêng của bài qua tu-vung-chung.js (QM_CAP = ['BAI'], QM_TEP). Không đặt thì chạy như Thư viện.
  var BAI = window.QM_BAI_TAP || null;
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
    (BAI ? '<div class="lt-hs"><label>Họ tên đầy đủ<input type="text" class="lt-hs-ten" autocomplete="name" placeholder="VD: Nguyễn Văn An"></label>' +
      '<label>Lớp<input type="text" class="lt-hs-lop" placeholder="VD: HSK1-K3"></label>' +
      '<p class="lt-hs-ghi">Điền để lưu điểm lên Bảng xếp hạng. Không điền vẫn làm bài được, chỉ là không lưu điểm.</p></div>' : '') +
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
  if (BAI) {
    el.querySelector('.lt-cap').hidden = true;
    var oTen = el.querySelector('.lt-hs-ten'), oLop = el.querySelector('.lt-hs-lop');
    try { var hs = JSON.parse(localStorage.getItem('qmhy:hoSo') || '{}'); oTen.value = hs.hoTen || ''; oLop.value = hs.lop || ''; } catch (e) {}
    [oTen, oLop].forEach(function (o) { o.addEventListener('change', function () {
      try { localStorage.setItem('qmhy:hoSo', JSON.stringify({ hoTen: oTen.value.trim(), lop: oLop.value.trim() })); } catch (e) {}
    }); });
  }
  var daTuongTac = false;                                   // lần mở trang đầu: không tự cuộn
  function demKho() { var n = TD.dsKho().length; el.querySelector('.lt-so-kho').textContent = n ? '(' + n + ')' : ''; }

  // ---------- Cấp ----------
  var GHEP_BAI = [], BO_THU = {};                            // chữ ghép + bộ thủ của bài (chế độ bài học)
  var CT = { chu: {}, tp: {} };                              // cấu tạo chữ HSK 1–3 (Thư viện), dùng chung với trang tra cứu
  TV.taiCauTao().then(function (d) { CT = d; });
  function chonCap(c) {
    S.cap = c; S.pinyin = c === 'KHO' || c === 'BAI' || SO_CAP.indexOf(c) >= 0;
    el.querySelectorAll('.lt-cap button').forEach(function (b) { b.classList.toggle('on', b.dataset.cap === c); });
    khuBai.innerHTML = '<div class="tv-trong">Đang tải từ vựng…</div>'; khuTong.innerHTML = '';
    if (!BAI) try { history.replaceState(null, '', c === 'KHO' ? '#tu-kho' : '#hsk' + c); } catch (e) {}
    var tai = c === 'KHO' ? taiTuKho() : TV.taiCap(c).then(function (d) {
      if (BAI) {                                             // dữ liệu riêng của bài: chữ ghép, bộ thủ
        var raw = (TV.DL || {})[c] || {};
        GHEP_BAI = raw.ghepChu || []; BO_THU = {};
        (raw.boThu || []).forEach(function (b) { BO_THU[b.boThu] = b; });
      }
      return { kho: d, ds: d };
    });
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
    if (BAI) {
      selChang.innerHTML = '<option value="0">Toàn bài · ' + ds.length + ' từ' + (GHEP_BAI.length ? ' + ' + GHEP_BAI.length + ' chữ ghép' : '') + '</option>';
      selChang.disabled = true;
    } else if (kho) {
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
    if (S.dang === 'bo' && !coBo()) S.dang = 'tron';
    selDang.innerHTML = DANG_DS.filter(function (k) { return k !== 'bo' || coBo(); }).map(function (k) { return '<option value="' + k + '">' + DANG[k].ico + ' ' + DANG[k].ten + '</option>'; }).join('');
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
    if (BAI) return ds.slice();                               // bài học: làm hết kho của bài, không chia chặng 20 từ
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
    var boCau = BAI ? GHEP_BAI.map(function (g) { return { ma: 'bo:' + g.chu, han: g.chu, phan: g.phan, laBo: true }; }) : [];
    if (!BAI && coBo()) {                                    // Thư viện HSK 1–3: chữ trong các từ của lượt (trộn: tối đa 5 câu)
      var thay = {};
      ds.forEach(function (w) { if (w.laBo) return; Array.from(w.han).forEach(function (c) { if (CT.chu[c] && !thay[c]) { thay[c] = 1; boCau.push({ ma: 'bo:' + c, han: c, phan: CT.chu[c].p, laBo: true }); } }); });
      boCau = tron(boCau).slice(0, S.dang === 'bo' ? CHANG : 5);
    }
    if (!BAI && S.dang === 'bo' && !boCau.length) {
      khuBai.innerHTML = '<div class="tv-trong">Các từ trong lượt này chưa có chữ nào trong danh sách ghép bộ thủ đã duyệt. Bạn chọn chặng khác hoặc dạng khác nhé.</div>';
      return;
    }
    if (S.dang === 'bo') ds = dsRieng ? ds.filter(function (w) { return w.laBo; }) : tron(boCau);
    else if (S.dang === 'tron' && !dsRieng && boCau.length) { // rải đều câu ghép bộ thủ trong lượt (không dồn cục)
      var buoc = (ds.length + boCau.length) / (boCau.length + 1);
      tron(boCau).forEach(function (b, j) { ds.splice(Math.min(ds.length, Math.round((j + 1) * buoc)), 0, b); });
    }
    else if (S.dang !== 'tron') ds = ds.filter(function (w) { return !w.laBo; });
    B = { goc: ds, hang: ds.slice(), i: 0, dung: 0, sai: 0, daSai: {}, kieu: [], ct: [], chuoi: 0, chuoiMax: 0,
          luc: Date.now(), dayDu: !!BAI && S.dang === 'tron' && !dsRieng };
    TV.dungDoc(); veCau();
  }
  function kieuCau(i) {                                      // dạng của câu thứ i (trộn: bốc theo tỉ lệ của tầng, nhớ lại để không đổi khi vẽ lại)
    if (B.hang[i] && B.hang[i].laBo) return 'bo';
    if (S.dang !== 'tron') return S.dang;
    return B.kieu[i] || (B.kieu[i] = boc(B.hang[i], i));
  }
  function veCau() {
    if (B.i >= B.hang.length) return veKetQua();
    var w = B.hang[B.i], k = kieuCau(B.i);
    if (k === 'ghep') return veGhep();
    if (k === 'xep') return veXep(w);
    if (k === 'bo') return veBo(w);
    if (k === 'go') return veGo(w);
    veTracNghiem(w, k);
  }
  function dauCau(w, k) {                                    // hàng trên của mỗi câu: tiến độ lượt + dạng + nút ⭐
    var tong = B.hang.length;
    return '<div class="lt-dau-bai"><span class="lt-dem">' + (S.dang === 'tron' ? '🔀 ' : '') + DANG[k].ten + ' · ' + (B.i + 1) + '/' + tong +
      (BAI ? ' <span class="lt-diem-nho">Điểm ' + B.dung + (B.chuoi > 1 ? ' · 🔥 ' + B.chuoi : '') + '</span>' : '') + '</span><span class="lt-dau-nut">' + nutAm() + (w.laBo ? '' : nutSao(w)) + '</span></div>' +
      '<div class="lt-vach lt-vach-bai"><i class="thuoc" style="width:' + (B.i / tong * 100) + '%"></i></div>';
  }
  function nutSao(w, coMa) {
    var on = TD.laKho(w.ma);
    return '<button type="button" class="tv-sao lt-sao' + (on ? ' on' : '') + '"' + (coMa ? ' data-ma="' + esc(w.ma) + '"' : '') + ' aria-pressed="' + on + '" aria-label="' + (on ? 'Bỏ khỏi' : 'Thêm vào') + ' danh sách từ khó">' + (on ? '★' : '☆') + '<span>Từ khó</span></button>';
  }
  function tiep() { B.i++; TV.dungDoc(); veCau(); giuTrongManHinh(); }
  // ct: { dang, cauHoi, dapAn, chon } để gửi chi tiết từng câu lên Google Sheet (chế độ bài học)
  function ghiKetQua(w, dung, tuThemKho, ct) {
    if (dung) { B.chuoi++; B.chuoiMax = Math.max(B.chuoiMax, B.chuoi); } else B.chuoi = 0;
    if (ct) B.ct.push({ stt: B.ct.length + 1, dang: ct.dang, cauHoi: ct.cauHoi, dapAn: ct.dapAn, chon: ct.chon, dung: dung });
    if (!w.laBo) TD.ghi(w, dung);
    if (dung) B.dung++; else { B.sai++; B.daSai[w.ma] = w; if (tuThemKho && !w.laBo && !TD.laKho(w.ma)) { TD.datKho(w, true); return true; } }
    return false;
  }
  function chu(html) { var d = document.createElement('div'); d.innerHTML = html; return d.textContent.trim(); }
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
    xep: { ten: 'Sắp xếp câu', ico: '🪜', dungDuoc: function (w) { return !!cauXep(w); } },
    bo:  { ten: 'Ghép bộ thủ', ico: '🀄' },
    go:  { ten: 'Gõ chữ Hán', ico: '⌨️' }
  };
  var DANG_DS = ['tron', 'chu', 'nghe', 'py', 'ghep', 'dien', 'xep', 'bo', 'go'];
  var CAP_BO = ['1', '2', '3', 'KHO'];                       // Thư viện: Ghép bộ thủ chỉ áp dụng HSK 1–3 (và Từ khó)
  function coBo() { return BAI || CAP_BO.indexOf(S.cap) >= 0; }
  function giaiTu(w) { return '<div class="lt-giai-tu"><span class="hanzi">' + esc(w.han) + '</span>' + TV.nutLoa(w.han, false, w.doc) + '<span class="lt-tu-py">' + esc(w.py) + '</span></div>'; }

  // Trộn tất cả: tỉ lệ các dạng theo tầng (sơ cấp nặng phát âm, trung cấp nặng ngữ cảnh câu, cao cấp nặng mặt chữ)
  var TI_LE = {
    so:    { chu: 2, nghe: 3, py: 3, ghep: 1, dien: 2, xep: 2, go: 2 },
    trung: { chu: 2, nghe: 2, py: 2, ghep: 1, dien: 3, xep: 3, go: 2 },
    cao:   { chu: 3, nghe: 2, py: 2, ghep: 1, dien: 2, xep: 1, go: 1 },
    bai:   { chu: 2, nghe: 3, py: 3, ghep: 1, dien: 2, xep: 2, go: 2 }   // bài học (quy chuẩn Bài tập); Ghép bộ thủ đi riêng: mỗi chữ ghép một câu
  };
  function tang() { if (BAI) return 'bai'; return SO_CAP.indexOf(S.cap) >= 0 ? 'so' : ['4', '5', '6'].indexOf(S.cap) >= 0 ? 'trung' : 'cao'; }
  function boc(w, i) {
    var tl = TI_LE[tang()], tui = [];
    Object.keys(tl).forEach(function (k) {
      if (k === 'ghep' && B.hang.slice(i).filter(function (x) { return !x.laBo; }).length < 4) return;   // ghép cần ít nhất 4 từ còn lại
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
    var dungO = ds.filter(function (x) { return x.dung; })[0];
    var themKho = ghiKetQua(w, dung, true, { dang: D.ten, cauHoi: B.dap.kieu === 'chu' ? w.nghia : B.dap.kieu === 'dien' ? (cauDien(w) || {}).han : w.han,
      dapAn: chu(dungO.html), chon: chu(ds[+nut.dataset.k].html) });
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
    ghiKetQua(w, dung, false, { dang: 'Sắp xếp câu', cauHoi: Bx.X.cau.han, dapAn: goc + Bx.X.cuoi, chon: cua + Bx.X.cuoi });   // xếp câu có thể có nhiều cách đúng → sai không tự thêm vào Từ khó
    khuBai.querySelector('.lt-xep-dong').classList.add(dung ? 'dung' : 'sai');
    khuBai.querySelectorAll('.lt-khoi').forEach(function (b) { b.disabled = true; });
    var de = khuBai.querySelector('.lt-de-xep'); de.classList.add('xong');
    khuBai.querySelector('.lt-xep-kho').remove();
    de.querySelector('.lt-hoi').outerHTML = '<div class="lt-giai"><div class="lt-ket ' + (dung ? 'dung' : 'sai') + '">' + (dung ? '🎉 Chính xác!' : '❌ Chưa khớp với câu gốc') + '</div>' +
      (dung ? '' : '<p class="lt-xep-note">Câu gốc ở dưới. Có câu xếp được nhiều cách; thấy câu mình cũng đúng thì hỏi cô nhé.</p>') +
      cauDayDu(Bx.X.cau, w) + '</div>';
    hienNutTiep();
  }

  // ---------- Ghép bộ thủ (bài học): chọn đủ các thành phần ghép thành chữ ----------
  // Thành phần không phải bộ thủ (尔, 五, 你…) vẫn được giải thích ngắn trong lời giải.
  var THANH_PHAN = { '尔': { pinyin: 'ěr', ten: 'thành phần 尔', nghia: 'phần bên phải của 你' }, '五': { pinyin: 'wǔ', ten: 'chữ 五', nghia: 'số 5, gợi âm đọc' },
    '你': { pinyin: 'nǐ', ten: 'chữ 你', nghia: 'bạn' } };
  function moTaPhan(p) {
    var b = BO_THU[p], t = CT.tp[p] || {};
    if (b) return { pinyin: b.pinyin || '', ten: b.ten || '', nghia: b.nghia || '', ghiChu: t.ghiChu || '' };
    if (t.ten) return { pinyin: t.py || '', ten: t.ten, nghia: t.nghia || '', ghiChu: t.ghiChu || '' };
    b = THANH_PHAN[p] || {}; return { pinyin: b.pinyin || '', ten: b.ten || '', nghia: b.nghia || '', ghiChu: '' };
  }
  function veBo(w) {
    var tatCa = {};
    GHEP_BAI.forEach(function (g) { g.phan.forEach(function (p) { tatCa[p] = 1; }); });
    Object.keys(BO_THU).forEach(function (p) { tatCa[p] = 1; });
    if (!BAI) Object.keys(CT.tp).forEach(function (p) { tatCa[p] = 1; });
    var nhieu = tron(Object.keys(tatCa).filter(function (p) { return w.phan.indexOf(p) < 0; })).slice(0, Math.max(3, 6 - w.phan.length));
    var o = B.bo && B.bo.i === B.i ? B.bo.o : tron(w.phan.concat(nhieu));
    B.bo = { i: B.i, o: o, chon: [] };
    khuBai.innerHTML = dauCau(w, 'bo') +
      '<div class="lt-de"><div class="lt-de-chu"><span class="hanzi">' + esc(w.han) + '</span></div><p class="lt-hoi">Chọn đủ các thành phần ghép thành chữ này' + (CT.chu[w.han] ? ' <span class="tag">' + esc(CT.chu[w.han].k) + '</span>' : '') + '</p></div>' +
      '<div class="lt-bo">' + o.map(function (p, k) { return '<button type="button" class="lt-bo-o" data-p="' + esc(p) + '"><span class="hanzi">' + esc(p) + '</span></button>'; }).join('') + '</div>' +
      '<div class="lt-nut-the lt-nut-tiep"><button type="button" class="btn solid lt-bo-kt" disabled>Kiểm tra</button></div>';
  }
  function chamBo(nut) {
    var Bo = B.bo; if (!Bo || Bo.xong) return;
    var p = nut.dataset.p, k = Bo.chon.indexOf(p);
    if (k >= 0) Bo.chon.splice(k, 1); else Bo.chon.push(p);
    nut.classList.toggle('chon', k < 0); amThanh('cham');
    khuBai.querySelector('.lt-bo-kt').disabled = !Bo.chon.length;
  }
  function kiemTraBo() {
    var Bo = B.bo, w = B.hang[B.i]; if (!Bo || Bo.xong || !Bo.chon.length) return;
    Bo.xong = true;
    var dung = Bo.chon.length === w.phan.length && w.phan.every(function (p) { return Bo.chon.indexOf(p) >= 0; });
    khuBai.querySelectorAll('.lt-bo-o').forEach(function (b) {
      b.disabled = true; var co = w.phan.indexOf(b.dataset.p) >= 0;
      if (co) b.classList.add('dung'); else if (b.classList.contains('chon')) b.classList.add('sai');
    });
    amThanh(dung ? 'dung' : 'sai');
    ghiKetQua(w, dung, false, { dang: 'Ghép bộ thủ', cauHoi: w.han, dapAn: w.phan.join(' + '), chon: Bo.chon.join(' + ') });
    khuBai.querySelector('.lt-de').classList.add('xong', 'lt-de-bo');   // lời giải đã ghi lại chữ: ẩn chữ to ở đề cho gọn
    khuBai.querySelector('.lt-hoi').outerHTML = '<div class="lt-giai"><div class="lt-ket ' + (dung ? 'dung' : 'sai') + '">' + (dung ? '🎉 Chính xác!' : '❌ Chưa đúng') + '</div>' +
      '<div class="lt-bo-giai"><span class="hanzi">' + esc(w.han) + '</span> = ' + w.phan.map(function (p) { var m = moTaPhan(p);
        return '<span class="lt-bo-phan"><b class="hanzi">' + esc(p) + '</b><small>' + esc([m.pinyin, m.ten, m.nghia].filter(Boolean).join(' · ')) + '</small></span>'; }).join('<i>+</i>') + '</div>' +
      w.phan.map(function (p) { return moTaPhan(p).ghiChu; }).filter(function (g, i, a) { return g && a.indexOf(g) === i; }).map(function (g) { return '<p class="lt-bo-ghi">💡 ' + esc(g) + '</p>'; }).join('') + '</div>';
    khuBai.querySelector('.lt-nut-tiep').innerHTML = '';
    hienNutTiep();
  }

  // ---------- Gõ chữ Hán (bài học): nhìn phiên âm + nghĩa, gõ lại chữ Hán bằng bộ gõ tiếng Trung ----------
  var DAU_NUA = /[,.?!:;"'()]/, DAU_TOAN = /[，。？！：；“”‘’（）、…]/g;
  function chamGo(dapAn, go) {                                // đúng / sai chữ / thiếu dấu câu / dấu nửa chiều
    if (go === dapAn) return 'dung';
    var a = dapAn.replace(DAU_TOAN, ''), b = go.replace(DAU_TOAN, '').replace(/[,.?!:;"'()]/g, '');
    if (a !== b) return 'chu';
    return DAU_NUA.test(go) ? 'nua' : 'dau';
  }
  // Hai kiểu đề, máy chọn ngẫu nhiên: 🎧 Nghe rồi gõ (máy không có giọng đọc thì tự đổi sang kiểu nghĩa) · 📝 Nhìn nghĩa rồi gõ
  // (pinyin ở đề theo nút "Pinyin": người mới bật để có gợi ý). Chấm rộng tay: gõ một từ khác trong kho mà đọc y hệt (kiểu nghe)
  // hoặc chung nghĩa (kiểu nghĩa) vẫn tính đúng, vì đề không phân biệt được.
  function veGo(w) {
    var kieu = B.go && B.go.i === B.i ? B.go.kieu : (coAm(w) && Math.random() < .5 ? 'nghe' : 'nghia');
    var chuBai = {}; (BAI ? S.kho : tron(S.kho).slice(0, 60)).forEach(function (x) { Array.from(x.han).forEach(function (c) { chuBai[c] = 1; }); });
    var cua = Array.from(w.han), nhieu = tron(Object.keys(chuBai).filter(function (c) { return cua.indexOf(c) < 0; })).slice(0, Math.max(3, 6 - cua.length));
    var o = B.go && B.go.i === B.i ? B.go.o : tron(cua.concat(nhieu));
    B.go = { i: B.i, o: o, kieu: kieu };
    var de = kieu === 'nghe'
      ? '<div class="lt-de-nghe">' + nutNghe(w) + '<small>Bấm loa để nghe lại</small></div><p class="lt-hoi">🎧 Nghe rồi gõ chữ Hán (bật bộ gõ tiếng Trung Pinyin)</p>'
      : '<div class="lt-de-nghia">' + esc(w.nghia) + '</div><div class="lt-tu-py lt-py-de">' + esc(w.py) + '</div>' +
        '<p class="lt-hoi">📝 Gõ chữ Hán mang nghĩa này' + (w.loai ? ' <span class="tag">' + esc(w.loai) + '</span>' : '') + '</p>';
    khuBai.innerHTML = dauCau(w, 'go') + '<div class="lt-de">' + de + '</div>' +
      '<div class="lt-go"><input type="text" class="lt-go-o" lang="zh-CN" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Gõ chữ Hán">' +
        '<button type="button" class="btn solid lt-go-kt">Kiểm tra</button></div>' +
      '<p class="lt-go-bao" aria-live="polite"></p>' +
      '<div class="lt-go-phu"><button type="button" class="lt-go-giup">Không gõ được? Bấm chọn chữ</button>' +
        '<div class="lt-go-chu" hidden>' + o.map(function (c) { return '<button type="button" class="lt-go-c hanzi" data-c="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') +
        '<button type="button" class="lt-go-xoa" aria-label="Xoá một chữ">⌫</button></div></div>' +
      '<div class="lt-nut-the lt-nut-tiep" hidden><button type="button" class="btn solid lt-tiep"></button></div>';
    var inp = khuBai.querySelector('.lt-go-o');
    inp.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); kiemTraGo(); } });
    if (daTuongTac || B.i) setTimeout(function () { inp.focus({ preventScroll: true }); }, 50);
    if (kieu === 'nghe') setTimeout(function () { var n = khuBai.querySelector('.lt-nghe'); if (n) TV.doc(w.doc || w.han, n); }, 250);
  }
  function kiemTraGo() {
    var w = B.hang[B.i], inp = khuBai.querySelector('.lt-go-o'), bao = khuBai.querySelector('.lt-go-bao');
    if (!inp || inp.disabled) return;
    var go = inp.value.replace(/\s+/g, '');
    if (!go) { bao.textContent = 'Bạn chưa gõ gì cả.'; return; }
    if (/^[A-Za-z\u00C0-\u024F\u1E00-\u1EFF'·]+$/.test(go)) {   // đang gõ chữ cái Latinh: không tính sai, nhắc bật bộ gõ
      bao.innerHTML = '⌨️ Bạn đang gõ <b>chữ cái Latinh</b>. Hãy bật <b>bộ gõ tiếng Trung (Pinyin)</b> rồi gõ lại, hoặc bấm "Không gõ được?" để chọn chữ.'; return;
    }
    inp.disabled = true; khuBai.querySelector('.lt-go-kt').disabled = true;
    khuBai.querySelectorAll('.lt-go-c, .lt-go-xoa, .lt-go-giup').forEach(function (b) { b.disabled = true; });
    var kieu = B.go.kieu, kq = chamGo(w.han, go), khac = null;
    if (kq !== 'dung') {                                     // từ khác trong kho cũng khớp đề (đọc y hệt / chung nghĩa)
      khac = S.kho.filter(function (x) { return x.han === go.replace(DAU_TOAN, '') && x.ma !== w.ma &&
        (kieu === 'nghe' ? pyGon(x.py) === pyGon(w.py) : trungNghia(x, w)); })[0] || null;
      if (khac) kq = 'dung';
    }
    var dung = kq === 'dung';
    amThanh(dung ? 'dung' : 'sai');
    var themKho = ghiKetQua(w, dung, true, { dang: 'Gõ chữ Hán · ' + (kieu === 'nghe' ? 'nghe' : 'nhìn nghĩa'), cauHoi: kieu === 'nghe' ? '🎧 ' + w.py : w.nghia, dapAn: w.han, chon: go });
    khuBai.querySelector('.lt-sao').outerHTML = nutSao(w);
    inp.classList.add(dung ? 'dung' : 'sai');
    bao.innerHTML = '';
    khuBai.querySelector('.lt-de').classList.add('xong');
    khuBai.querySelector('.lt-hoi').outerHTML = '<div class="lt-giai"><div class="lt-ket ' + (dung ? 'dung' : 'sai') + '">' +
      (dung ? (khac ? '🎉 Cũng đúng! ' + esc(khac.han) + ' cũng ' + (kieu === 'nghe' ? 'đọc là ' + esc(khac.py) : 'mang nghĩa này') + '. Từ của câu này là:' : '🎉 Chính xác!') : '❌ ' + ({ chu: 'Sai chữ', dau: 'Đúng chữ nhưng thiếu hoặc thừa dấu câu', nua: 'Dấu câu phải là dấu tiếng Trung (toàn chiều), vd ，。？！' })[kq] + (themKho ? ' · đã thêm vào ⭐ Từ khó' : '')) + '</div>' + giaiTu(w) + '</div>';
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
    con.forEach(function (w) { if (!w.laBo && nhom.length < n && !nhom.some(function (x) { return dungNhau(x, w, K); })) nhom.push(w); else doi.push(w); });
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
    G.ds.forEach(function (w) { ghiKetQua(w, !G.sai[w.ma], true, { dang: 'Ghép cặp · ' + G.K.ten, cauHoi: w.han, dapAn: w.han + ' — ' + (G.K.phai === 'py' || G.K.trai === 'py' ? w.py : '') + (G.K.phai === 'ng' ? ' ' + w.nghia : ''), chon: G.sai[w.ma] ? 'ghép nhầm' : 'đúng ngay' }); });
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
    var coChangSau = !BAI && S.cap !== 'KHO' && S.chang >= 0 && (S.chang + 1) * CHANG < S.ds.length;
    veThanh();                                                // cập nhật số "thuộc x/20" trong ô chặng và thanh tổng
    khuBai.innerHTML = '<div class="lt-ket-qua card"><div class="lt-diem">' + tl + '%</div><p class="lt-loi">' + loi + '</p>' +
      '<p class="lt-goi-y">Đúng ' + B.dung + ' / ' + tong + ' câu' + (BAI ? ' · 🔥 Chuỗi dài nhất ' + B.chuoiMax + ' · ⏱ ' + thoiGian(B.giay = Math.round((Date.now() - B.luc) / 1000)) : '') + '</p>' +
      (BAI ? '<div class="lt-luu" aria-live="polite"></div>' : '') +
      (sai.length ? '<div class="lt-nhan">Từ cần ôn lại</div><ul class="lt-ds-sai">' + sai.map(function (w) {
        if (w.laBo) return '<li><span class="hanzi">' + esc(w.han) + '</span><span class="lt-ds-py"></span><span class="lt-ds-nghia">Ghép bộ thủ: ' + esc(w.phan.join(' + ')) + '</span><span></span></li>';
        return '<li><span class="hanzi">' + esc(w.han) + '</span><span class="lt-ds-py">' + esc(w.py) + '</span><span class="lt-ds-nghia">' + esc(w.nghia) + '</span>' + nutSao(w, true).replace('lt-sao', 'lt-sao lt-sao-ds') + '</li>';
      }).join('') + '</ul>' : '') +
      '<div class="lt-nut-kq">' + (sai.length ? '<button type="button" class="btn solid lt-lam-sai">Luyện lại ' + sai.length + ' từ sai</button>' : '') +
        (coChangSau ? '<button type="button" class="btn' + (sai.length ? '' : ' solid') + ' lt-chang-sau">Chặng ' + (S.chang + 2) + ' ›</button>' : '') +
        (BAI ? '<button type="button" class="btn lt-xem-lai">📋 Xem lại bài</button><button type="button" class="btn lt-luot-moi">Làm lượt mới</button>' : '<button type="button" class="btn lt-lai">Làm lại lượt này</button>') + '</div>' +
      (BAI ? '<div class="lt-xem-ct" hidden>' + B.ct.map(function (c) { return '<div class="lt-ct ' + (c.dung ? 'dung' : 'sai') + '"><b>' + c.stt + '. ' + esc(c.dang) + '</b> · ' + esc(c.cauHoi) +
        '<br>Đáp án: <span class="hanzi">' + esc(c.dapAn) + '</span>' + (c.dung ? ' ✓' : ' · Bạn chọn: <span class="hanzi">' + esc(c.chon || '—') + '</span>') + '</div>'; }).join('') + '</div>' : '') + '</div>';
    if (BAI) guiDiem();
    giuTrongManHinh();
  }

  // ---------- Gửi điểm lên Google Sheet (Apps Script) — chỉ lượt đầy đủ: dạng "Trộn tất cả", làm hết bài ----------
  function thoiGian(g) { var p = Math.floor(g / 60), q = g % 60; return (p ? p + ' phút ' : '') + q + ' giây'; }
  function guiDiem() {
    var khu = khuBai.querySelector('.lt-luu'); if (!khu) return;
    if (!B.dayDu) { khu.innerHTML = '<p class="lt-luu-ghi">Lượt luyện riêng (một dạng bài hoặc luyện lại từ sai) không tính lên Bảng xếp hạng. Chọn dạng <b>🔀 Trộn tất cả</b> để làm bài tính điểm.</p>'; return; }
    var api = window.QM_API;
    if (!api) { khu.innerHTML = '<p class="lt-luu-ghi">Bảng xếp hạng chưa được nối với Google Sheet nên kết quả chưa được lưu.</p>'; return; }
    var hoTen = (el.querySelector('.lt-hs-ten').value || '').trim(), lop = (el.querySelector('.lt-hs-lop').value || '').trim();
    if (!hoTen || !lop) {
      khu.innerHTML = '<div class="lt-luu-form"><p>Điền họ tên và lớp để lưu điểm lần này:</p><input type="text" class="lt-luu-ten" placeholder="Họ tên đầy đủ" value="' + esc(hoTen) + '">' +
        '<input type="text" class="lt-luu-lop" placeholder="Lớp" value="' + esc(lop) + '"><button type="button" class="btn solid lt-luu-gui">Lưu điểm</button></div>';
      return;
    }
    khu.innerHTML = '<p class="lt-luu-ghi">⏳ Đang lưu kết quả…</p>';
    var goi = { action: 'submit', lesson: BAI.ma, lessonTitle: BAI.ten || '', hoTen: hoTen, lop: lop, score: B.dung, total: B.dung + B.sai,
      bestStreak: B.chuoiMax, durationSeconds: B.giay, chiTiet: B.ct };
    fetch(api, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(goi) })   // text/plain: tránh bước kiểm tra CORS của trình duyệt
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.ok) throw new Error((d && d.loi) || 'Máy chủ không nhận kết quả');
        khu.innerHTML = '<p class="lt-luu-ok">✅ Đã lưu kết quả (lượt ' + d.attemptNo + ', ' + d.soCau + ' câu). <a href="bang-xep-hang.html">Xem Bảng xếp hạng ›</a></p>';
      })
      .catch(function (e) {
        khu.innerHTML = '<p class="lt-luu-loi">⚠️ Chưa lưu được kết quả: ' + esc(e.message || 'lỗi mạng') + '</p><button type="button" class="btn lt-luu-lai">Gửi lại</button>';
      });
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
    var bo = t.closest('.lt-bo-o'); if (bo) return chamBo(bo);
    if (t.closest('.lt-bo-kt')) return kiemTraBo();
    if (t.closest('.lt-go-kt')) return kiemTraGo();
    if (t.closest('.lt-go-giup')) { khuBai.querySelector('.lt-go-chu').hidden = false; t.closest('.lt-go-giup').hidden = true; return; }
    var gc = t.closest('.lt-go-c'); if (gc) { var ip = khuBai.querySelector('.lt-go-o'); ip.value += gc.dataset.c; amThanh('cham'); return; }
    if (t.closest('.lt-go-xoa')) { var ip2 = khuBai.querySelector('.lt-go-o'); ip2.value = Array.from(ip2.value).slice(0, -1).join(''); return; }
    if (t.closest('.lt-xem-lai')) { var xc = khuBai.querySelector('.lt-xem-ct'); xc.hidden = !xc.hidden; return; }
    if (t.closest('.lt-luot-moi')) { batDau(); return giuTrongManHinh(); }
    if (t.closest('.lt-luu-lai')) return guiDiem();
    if (t.closest('.lt-luu-gui')) {
      el.querySelector('.lt-hs-ten').value = khuBai.querySelector('.lt-luu-ten').value; el.querySelector('.lt-hs-lop').value = khuBai.querySelector('.lt-luu-lop').value;
      el.querySelector('.lt-hs-ten').dispatchEvent(new Event('change')); return guiDiem();
    }
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
      var kt = khuBai.querySelector('.lt-xep-kt:not(:disabled)'), tp = khuBai.querySelector('.lt-tiep'), bk = khuBai.querySelector('.lt-bo-kt:not(:disabled)');
      if (tp) { e.preventDefault(); return tiep(); }
      if (kt) { e.preventDefault(); return kiemTraXep(); }
      if (bk) { e.preventDefault(); return kiemTraBo(); }
      return;
    }
    var o = khuBai.querySelectorAll('.lt-dap-o'), n = +e.key;
    if (n >= 1 && n <= o.length && !khuBai.querySelector('.lt-dap.xong')) { e.preventDefault(); traLoi(o[n - 1]); }
  });

  el.querySelector('.lt-cap').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { daTuongTac = true; chonCap(b.dataset.cap); } });
  document.addEventListener('qm-tien-do', demKho);

  var h = location.hash;
  if (BAI) chonCap('BAI');
  else if (/^#tu-kho/.test(h)) chonCap('KHO');
  else { var c = (h.match(/hsk([\dMR-]+)/) || [])[1]; chonCap(CAP.indexOf(c) >= 0 ? c : '1'); }
})();
