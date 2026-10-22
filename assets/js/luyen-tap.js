/* =========================================================
   LUYỆN TỪ VỰNG — Tiếng Trung Diệu Kỳ
   Thanh điều khiển 3 ô ngang nhau: Chặng · Dạng bài · Pinyin. Đổi ô nào bài tự bắt đầu lại.
   Dạng bài: Flashcard · Chọn nghĩa · Chọn chữ Hán · Trộn 3 dạng.
   Dữ liệu + phát âm: tu-vung-chung.js · Tiến độ + từ khó: tien-do.js (nhúng cả hai TRƯỚC file này).
   Thêm dạng bài mới: thêm một mục vào DANG (cùng khuôn với 'the' / 'nghia' / 'chu') và tên vào DANG_DS.
   ========================================================= */
(function () {
  var TV = window.QM_TV, TD = window.QM_TIENDO, el = document.getElementById('luyen-tap');
  if (!TV || !TD || !el) return;
  var esc = TV.esc, CHANG = 20;
  var CAP = TV.CAP;                                         // HSK 1 … 7-9, Mở rộng
  var SO_CAP = ['1', '2', '3'];                             // sơ cấp: mặc định hiện pinyin ở đề bài

  // ---------- Tiện ích ----------
  function tron(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function nghiaGon(w) { return TV.boDau(String(w.nghia || '').split(/[,;，；]/)[0]); }   // nghĩa chính, để không có 2 đáp án trùng nghĩa
  // 3 đáp án nhiễu: cùng cấp, ưu tiên cùng từ loại; không trùng chữ, không trùng nghĩa chính
  function dapAnNhieu(w, kho) {
    var hop = kho.filter(function (x) { return x.ma !== w.ma && x.han !== w.han && x.nghia && nghiaGon(x) !== nghiaGon(w); });
    var cung = tron(hop.filter(function (x) { return w.loai && x.loai === w.loai; })), khac = tron(hop.filter(function (x) { return !(w.loai && x.loai === w.loai); }));
    var chon = [], daCo = {};
    cung.concat(khac).some(function (x) {
      var k = nghiaGon(x) + '|' + x.han; if (daCo[k]) return false;
      daCo[k] = 1; chon.push(x); return chon.length === 3;
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
      var soChang = Math.ceil(ds.length / CHANG);
      selChang.disabled = false;
      selChang.innerHTML = '<option value="-1">🎲 Ngẫu nhiên (từ chưa thuộc)</option>' +
        Array.apply(null, Array(soChang)).map(function (_, i) {
          var phan = ds.slice(i * CHANG, (i + 1) * CHANG), d = TD.dem(phan);
          return '<option value="' + i + '">Chặng ' + (i + 1) + (d.thuoc === phan.length ? ' ✓' : ' · ' + d.thuoc + '/' + phan.length) + ' · ' + phan.slice(0, 3).map(function (w) { return w.han; }).join(' ') + '</option>';
        }).join('');
    }
    selChang.value = kho ? '0' : String(S.chang);
    selDang.innerHTML = DANG_DS.map(function (k) { return '<option value="' + k + '">' + DANG[k].ico + ' ' + DANG[k].ten + '</option>'; }).join('');
    selDang.value = S.dang;
    capNhatPy();
    // tổng tiến độ của cấp
    var d = TD.dem(ds), n = ds.length || 1;
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

  function dsLuot() {
    var ds = S.ds;
    if (S.cap === 'KHO') return tron(ds).sort(function (a, b) { return TD.hop(a.ma) - TD.hop(b.ma); }).slice(0, CHANG);
    if (S.chang === -1) {
      var chua = ds.filter(function (w) { return TD.trangThai(w.ma) !== 'thuoc'; });
      return tron(chua.length ? chua : ds).slice(0, CHANG);
    }
    return ds.slice(S.chang * CHANG, (S.chang + 1) * CHANG);
  }

  // ---------- Làm bài ----------
  var B = null;   // lượt đang làm: hàng đợi, vị trí, đúng/sai, dạng của từng câu (khi trộn)
  function batDau(dsRieng) {
    if (!S.ds.length) {
      khuBai.innerHTML = '<div class="tv-trong">' + (S.cap === 'KHO' ? 'Bạn chưa có từ khó nào. Làm trắc nghiệm sai, từ đó sẽ tự vào đây; hoặc bấm ☆ ở trang tra cứu để tự thêm. 🌱'
        : 'Cấp này đang được cô cập nhật, bạn quay lại sau nhé! 🌱') + '</div>';
      return;
    }
    var ds = tron(dsRieng || dsLuot());
    var D = DANG[S.dang];
    if (D.dungDuoc) {
      var truoc = ds.length; ds = ds.filter(D.dungDuoc);
      if (!ds.length) {
        khuBai.innerHTML = '<div class="tv-trong">' + (S.dang === 'nghe' ? 'Máy này chưa có giọng đọc tiếng Trung nên chưa làm được dạng Nghe. Bạn thử mở bằng Chrome hoặc chọn dạng bài khác nhé.' : 'Các từ trong chặng này chưa có dữ liệu cho dạng bài này, bạn chọn dạng khác nhé.') + '</div>';
        return;
      }
      if (ds.length < truoc) TV.baoLoi('Đã bỏ qua ' + (truoc - ds.length) + ' từ chưa có dữ liệu cho dạng bài này.');
    }
    B = { goc: ds, hang: ds.slice(), i: 0, dung: 0, sai: 0, daSai: {}, lapLai: {}, kieu: [] };
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
    if (DANG[k].ve) DANG[k].ve(w, k); else veTracNghiem(w, k);
  }
  function dauCau(w, k) {                                    // hàng trên của mỗi câu: tiến độ lượt + dạng + nút ⭐
    var tong = B.hang.length;
    return '<div class="lt-dau-bai"><span class="lt-dem">' + (S.dang === 'tron' ? '🔀 ' : '') + DANG[k].ten + ' · ' + (B.i + 1) + '/' + tong + '</span>' + nutSao(w) + '</div>' +
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
  // Học sinh đang làm mà khung bài bị cuộn khuất (vd sau câu tiếp) thì đưa thanh điều khiển lên ngay dưới header
  // (header chung tự thu gọn khi cuộn nên căn lại thêm một lần sau khi header đổi chiều cao)
  function giuTrongManHinh() {
    var hdr = document.querySelector('.sh-header');
    function day() {
      var tren = hdr ? hdr.getBoundingClientRect().bottom : 0, sf = document.querySelector('.sf');
      var duoi = sf ? sf.getBoundingClientRect().top : innerHeight;
      // đủ chỗ thì giữ cả thanh điều khiển trong tầm nhìn; màn nhỏ thì ưu tiên khung bài
      var moc = (khuBai.getBoundingClientRect().bottom - thanh.getBoundingClientRect().top) <= duoi - tren - 12 ? thanh : khuBai;
      var r = moc.getBoundingClientRect();
      if (Math.abs(r.top - tren - 8) > 12) window.scrollTo(0, Math.max(0, r.top + scrollY - tren - 8));
    }
    var r = khuBai.getBoundingClientRect(), tren = hdr ? hdr.getBoundingClientRect().bottom : 0;
    var sf = document.querySelector('.sf'), duoi = sf ? sf.getBoundingClientRect().top : innerHeight;
    if (r.top < tren || r.bottom > duoi) { day(); setTimeout(day, 380); }
  }

  // ---------- Các dạng bài ----------
  // Dạng trắc nghiệm khai báo theo một khuôn: de (đề) · hoi (câu hỏi) · dap (4 đáp án, đáp án đúng có dung:true) · giai (lời giải) · lop (kiểu ô đáp án)
  // dungDuoc(w): từ này có đủ dữ liệu cho dạng bài không (thiếu thì dạng Trộn tự bỏ qua, dạng riêng tự lọc khỏi lượt)
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
  function nhieuHV(w) {
    var hv = String(w.hv).toUpperCase(), n = soChu(w);
    var hop = S.kho.filter(function (x) { return x.hv && x.han !== w.han && String(x.hv).toUpperCase() !== hv; });
    var chon = [], daCo = {}; daCo[hv] = 1;
    tron(hop.filter(function (x) { return soChu(x) === n; })).concat(tron(hop)).some(function (x) {
      var k = String(x.hv).toUpperCase(); if (daCo[k]) return false; daCo[k] = 1; chon.push(k); return chon.length === 3; });
    return chon;
  }
  function coAm(w) { return w.doc !== '-' && TV.coGiong(w.doc); }
  function nutNghe(w) { return '<button type="button" class="tv-loa lt-nghe" data-doc="' + esc(w.doc || w.han) + '" aria-label="Nghe lại">' + TV.LOA + '</button>'; }
  var dA = function (k, html, dung) { return { k: k, html: html, dung: !!dung }; };   // một ô đáp án
  var hanO = function (x) { return '<span class="lt-dap-chu hanzi">' + esc(x.han) + '</span><span class="lt-dap-py">' + esc(x.py) + '</span>'; };

  var DANG = {
    tron:  { ten: 'Trộn tất cả', ico: '🔀' },
    the: {
      ten: 'Flashcard', ico: '🃏',
      ve: function (w, k) {
        khuBai.innerHTML = dauCau(w, k) +
          '<div class="lt-the" tabindex="0" role="button" aria-label="Lật thẻ (bấm để xem mặt kia)"><div class="lt-the-trong">' +
            '<div class="lt-mat truoc"><span class="hanzi lt-the-han">' + esc(w.han) + '</span><span class="lt-the-py lt-py-de">' + esc(w.py) + '</span><small>Bấm vào thẻ để lật</small></div>' +
            '<div class="lt-mat sau"><div class="lt-tu-chu"><span class="hanzi">' + esc(w.han) + '</span>' + TV.nutLoa(w.han, true, w.doc) + '</div>' +
              '<div class="lt-tu-py">' + esc(w.py) + '</div><div class="lt-tu-nghia">' + esc(w.nghia) + '</div><div class="tv-the-tag">' + tags(w) + '</div>' +
              '<small>Bấm vào thẻ để lật lại</small></div>' +
          '</div></div>' +
          '<div class="lt-nut-the"><button type="button" class="btn solid lt-lat">Lật thẻ</button></div>';
      },
      // Bấm thẻ: lật qua lại thoải mái. Lần lật đầu tiên mới hiện nút tự chấm.
      latThe: function () {
        var t = khuBai.querySelector('.lt-the'); if (!t) return;
        t.classList.toggle('lat');
        var nut = khuBai.querySelector('.lt-nut-the');
        if (!nut.querySelector('.lt-nho')) { nut.innerHTML = NUT_CHAM; if (nut.getBoundingClientRect().bottom > khuatDuoi()) giuTrongManHinh(); }
      },
      cham: function (nho) {
        var w = B.hang[B.i]; ghiKetQua(w, nho, false);
        if (!nho && (B.lapLai[w.ma] || 0) < 2) {                  // thẻ chưa nhớ quay lại cuối lượt (tối đa 2 lần)
          B.lapLai[w.ma] = (B.lapLai[w.ma] || 0) + 1; B.hang.push(w);
          if (S.dang === 'tron') B.kieu[B.hang.length - 1] = 'the';
        }
        tiep();
      }
    },
    nghia: { ten: 'Chọn nghĩa', ico: '📝', lop: 'chu-viet',
      de: function (w) { return '<div class="lt-de-chu"><span class="hanzi">' + esc(w.han) + '</span>' + TV.nutLoa(w.han, false, w.doc) + '</div><div class="lt-tu-py lt-py-de">' + esc(w.py) + '</div>'; },
      hoi: function () { return 'Nghĩa của từ này là gì?'; },
      dap: function (w) { return [dA(w.ma, esc(w.nghia), 1)].concat(dapAnNhieu(w, S.kho).map(function (x) { return dA(x.ma, esc(x.nghia)); })); },
      giai: function (w) { return '<div class="tv-the-tag"><span class="lt-giai-py">' + esc(w.py) + '</span>' + tags(w) + '</div>'; } },
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
    hv: { ten: 'Chọn âm Hán Việt', ico: '📜', lop: 'hv', dungDuoc: function (w) { return !!w.hv; },
      de: function (w) { return '<div class="lt-de-chu"><span class="hanzi">' + esc(w.han) + '</span>' + TV.nutLoa(w.han, false, w.doc) + '</div><div class="lt-tu-py lt-py-de">' + esc(w.py) + '</div>'; },
      hoi: function () { return 'Âm Hán Việt của từ này là gì?'; },
      dap: function (w) { var hv = String(w.hv).toUpperCase(); return [dA(hv, esc(hv), 1)].concat(nhieuHV(w).map(function (h) { return dA(h, esc(h)); })); },
      giai: function (w) { return '<div class="lt-tu-nghia nho">' + esc(w.nghia) + '</div>'; } },
    ghep: { ten: 'Ghép cặp', ico: '🧩', nhom: 5 }
  };
  var DANG_DS = ['tron', 'the', 'nghia', 'chu', 'nghe', 'py', 'hv', 'ghep'];
  var NUT_CHAM = '<button type="button" class="btn lt-chua">😕 Chưa nhớ</button><button type="button" class="btn solid lt-nho">😊 Đã nhớ</button>';
  function giaiTu(w) { return '<div class="lt-giai-tu"><span class="hanzi">' + esc(w.han) + '</span>' + TV.nutLoa(w.han, false, w.doc) + '<span class="lt-tu-py">' + esc(w.py) + '</span></div>'; }

  // Trộn tất cả: tỉ lệ các dạng theo tầng (sơ cấp nặng phát âm, cao cấp nặng Hán Việt)
  var TI_LE = {
    so:    { the: 1, nghia: 2, chu: 2, nghe: 2, py: 2, hv: 1, ghep: 1 },
    trung: { the: 1, nghia: 2, chu: 2, nghe: 1, py: 1, hv: 1, ghep: 1 },
    cao:   { the: 1, nghia: 2, chu: 2, nghe: 1, py: 1, hv: 2, ghep: 1 }
  };
  function tang() { return SO_CAP.indexOf(S.cap) >= 0 ? 'so' : ['4', '5', '6'].indexOf(S.cap) >= 0 ? 'trung' : 'cao'; }
  function boc(w, i) {
    var tl = TI_LE[tang()], tui = [];
    Object.keys(tl).forEach(function (k) {
      if (k === 'ghep' && B.hang.length - i < 4) return;               // ghép cần ít nhất 4 từ còn lại
      if (DANG[k].dungDuoc && !DANG[k].dungDuoc(w)) return;
      for (var n = 0; n < tl[k]; n++) tui.push(k);
    });
    return tui[Math.floor(Math.random() * tui.length)] || 'the';
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
    var themKho = ghiKetQua(w, dung, true);
    khuBai.querySelector('.lt-sao').outerHTML = nutSao(w);
    khuBai.querySelector('.lt-de').classList.add('xong');            // thu gọn đề để lời giải không đẩy nút Câu tiếp xuống
    khuBai.querySelector('.lt-hoi').outerHTML = '<div class="lt-giai"><div class="lt-ket ' + (dung ? 'dung' : 'sai') + '">' +
      (dung ? '🎉 Chính xác!' : '❌ Chưa đúng' + (themKho ? ' · đã thêm vào ⭐ Từ khó' : '')) + '</div>' + D.giai(w) + '</div>';
    hienNutTiep();
  }
  function hienNutTiep() {
    var nt = khuBai.querySelector('.lt-nut-tiep'); nt.hidden = false;
    nt.querySelector('.lt-tiep').textContent = B.i + 1 < B.hang.length ? 'Câu tiếp ›' : 'Xem kết quả ›';
    nt.querySelector('.lt-tiep').focus({ preventScroll: true });
    if (nt.getBoundingClientRect().bottom > khuatDuoi()) giuTrongManHinh();   // nút Câu tiếp bị khuất thì đưa khung bài lên
  }

  // ---------- Ghép cặp: một lượt 4–5 từ, chạm chữ Hán rồi chạm nghĩa tương ứng (thứ tự nào cũng được) ----------
  function veGhep() {
    var n = Math.min(DANG.ghep.nhom, B.hang.length - B.i);
    var ds = B.hang.slice(B.i, B.i + n);
    B.ghep = { ds: ds, sai: {}, xong: 0, a: null, b: null };
    var trai = ds.map(function (w, i) { return '<button type="button" class="lt-gh-o trai" data-i="' + i + '"><span class="hanzi">' + esc(w.han) + '</span><span class="lt-gh-py lt-py-de">' + esc(w.py) + '</span></button>'; });
    var phai = tron(ds.map(function (w, i) { return '<button type="button" class="lt-gh-o phai" data-i="' + i + '">' + esc(w.nghia) + '</button>'; }));
    khuBai.innerHTML = '<div class="lt-dau-bai"><span class="lt-dem">' + (S.dang === 'tron' ? '🔀 ' : '') + 'Ghép cặp · từ ' + (B.i + 1) + '–' + (B.i + n) + '/' + B.hang.length + '</span><span></span></div>' +
      '<div class="lt-vach lt-vach-bai"><i class="thuoc" style="width:' + (B.i / B.hang.length * 100) + '%"></i></div>' +
      '<p class="lt-hoi lt-hoi-ghep">Chạm một chữ Hán rồi chạm nghĩa đúng của nó</p>' +
      '<div class="lt-ghep"><div class="lt-gh-cot">' + trai.join('') + '</div><div class="lt-gh-cot">' + phai.join('') + '</div></div>' +
      '<div class="lt-nut-the lt-nut-tiep" hidden><button type="button" class="btn solid lt-tiep"></button></div>';
  }
  function chamGhep(nut) {
    var G = B.ghep; if (!G || nut.disabled) return;
    var ben = nut.classList.contains('trai') ? 'a' : 'b';
    if (G[ben]) G[ben].classList.remove('chon');
    G[ben] = nut; nut.classList.add('chon');
    if (!G.a || !G.b) return;
    var wa = G.ds[+G.a.dataset.i], wb = G.ds[+G.b.dataset.i], a = G.a, b = G.b;
    G.a = G.b = null; a.classList.remove('chon'); b.classList.remove('chon');
    if (wa === wb || nghiaGon(wa) === nghiaGon(wb)) {                  // đúng (hai từ trùng nghĩa chính cũng tính đúng)
      a.disabled = b.disabled = true; a.classList.add('dung'); b.classList.add('dung');
      if (++G.xong === G.ds.length) xongGhep();
    } else {
      G.sai[wa.ma] = 1;
      [a, b].forEach(function (x) { x.classList.add('sai'); setTimeout(function () { x.classList.remove('sai'); }, 650); });
    }
  }
  function xongGhep() {
    var G = B.ghep;
    G.ds.forEach(function (w) { ghiKetQua(w, !G.sai[w.ma], true); });
    var soSai = Object.keys(G.sai).length;
    khuBai.querySelector('.lt-hoi-ghep').outerHTML = '<div class="lt-ket ' + (soSai ? 'sai' : 'dung') + ' lt-hoi-ghep">' + (soSai ? '🧩 Xong! Ghép nhầm ' + soSai + ' từ (đã thêm vào ⭐ Từ khó)' : '🎉 Ghép đúng hết ngay lần đầu!') + '</div>';
    khuBai.querySelectorAll('.lt-gh-o.trai').forEach(function (x) { x.classList.add('hien-py'); });
    B.i += G.ds.length - 1;                                            // nhóm ghép tính là nhiều từ; tiep() cộng thêm 1
    hienNutTiep();
  }

  // ---------- Kết quả ----------
  function veKetQua() {
    var tong = B.dung + B.sai, sai = Object.keys(B.daSai).map(function (k) { return B.daSai[k]; });
    var tl = tong ? Math.round(B.dung / tong * 100) : 0;
    var loi = tl === 100 ? 'Xuất sắc! Bạn nhớ hết rồi 🎉' : tl >= 80 ? 'Rất tốt! Ôn lại vài từ còn sai là chắc 💪' : tl >= 50 ? 'Khá rồi, luyện thêm một lượt nữa nhé 🌱' : 'Từ mới mà, cứ từ từ. Làm lại lượt nữa sẽ nhớ hơn 🌱';
    var coChangSau = S.cap !== 'KHO' && S.chang >= 0 && (S.chang + 1) * CHANG < S.ds.length;
    veThanh();                                                // cập nhật số "thuộc x/20" trong ô chặng và thanh tổng
    khuBai.innerHTML = '<div class="lt-ket-qua card"><div class="lt-diem">' + tl + '%</div><p class="lt-loi">' + loi + '</p>' +
      '<p class="lt-goi-y">Đúng / nhớ ' + B.dung + ' · sai / chưa nhớ ' + B.sai + '</p>' +
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
    if (t.closest('.lt-the') || t.closest('.lt-lat')) return DANG.the.latThe();
    if (t.closest('.lt-nho')) return DANG.the.cham(true);
    if (t.closest('.lt-chua')) return DANG.the.cham(false);
    var o = t.closest('.lt-dap-o'); if (o) return traLoi(o);
    var g = t.closest('.lt-gh-o'); if (g) return chamGhep(g);
    if (t.closest('.lt-tiep')) return tiep();
    if (t.closest('.lt-lam-sai')) { batDau(Object.keys(B.daSai).map(function (k) { return B.daSai[k]; })); return giuTrongManHinh(); }
    if (t.closest('.lt-lai')) { batDau(B.goc); return giuTrongManHinh(); }
    if (t.closest('.lt-chang-sau')) { S.chang++; selChang.value = String(S.chang); batDau(); return giuTrongManHinh(); }
  });
  // Bàn phím: Space lật thẻ (qua lại) · ← chưa nhớ · → đã nhớ · 1–4 chọn đáp án · Enter câu tiếp
  document.addEventListener('keydown', function (e) {
    if (!B || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    var the = khuBai.querySelector('.lt-the');
    if (the) {
      if (e.key === ' ') { e.preventDefault(); DANG.the.latThe(); }
      else if (khuBai.querySelector('.lt-nho') && (e.key === 'ArrowRight' || e.key === 'Enter')) { e.preventDefault(); DANG.the.cham(true); }
      else if (khuBai.querySelector('.lt-chua') && e.key === 'ArrowLeft') DANG.the.cham(false);
      return;
    }
    var o = khuBai.querySelectorAll('.lt-dap-o'), n = +e.key;
    if (n >= 1 && n <= o.length && !khuBai.querySelector('.lt-dap.xong')) { e.preventDefault(); traLoi(o[n - 1]); }
    else if (e.key === 'Enter' && khuBai.querySelector('.lt-nut-tiep:not([hidden])')) { e.preventDefault(); tiep(); }
  });

  el.querySelector('.lt-cap').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { daTuongTac = true; chonCap(b.dataset.cap); } });
  document.addEventListener('qm-tien-do', demKho);

  var h = location.hash;
  if (/^#tu-kho/.test(h)) chonCap('KHO');
  else { var c = (h.match(/hsk([\dMR-]+)/) || [])[1]; chonCap(CAP.indexOf(c) >= 0 ? c : '1'); }
})();
