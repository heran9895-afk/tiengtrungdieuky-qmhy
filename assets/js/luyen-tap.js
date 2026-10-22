/* =========================================================
   LUYỆN TỪ VỰNG (giai đoạn 1) — Tiếng Trung Diệu Kỳ
   Flashcard · Chọn nghĩa · Chọn chữ Hán, theo cấp → chặng 20 từ, hoặc danh sách ⭐ Từ khó.
   Dữ liệu + phát âm: tu-vung-chung.js · Tiến độ + từ khó: tien-do.js (nhúng cả hai TRƯỚC file này).
   Thêm dạng bài mới: viết một hàm vào DANG (cùng khuôn với 'the' / 'nghia' / 'chu').
   ========================================================= */
(function () {
  var TV = window.QM_TV, TD = window.QM_TIENDO, el = document.getElementById('luyen-tap');
  if (!TV || !TD || !el) return;
  var esc = TV.esc, CHANG = 20;
  var CAP = TV.CAP;                                         // HSK 1 … 7-9, Mở rộng
  var SO_CAP = ['1', '2', '3'];                             // sơ cấp: mặc định hiện pinyin ở đề bài

  // ---------- Tiện ích ----------
  function tron(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function nghiaGon(w) { return TV.boDau(String(w.nghia || '').split(/[,;，；]/)[0]); }   // so nghĩa chính để không đưa 2 đáp án trùng nghĩa
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
  var TEN_TT = { moi: 'Mới', dang: 'Đang học', thuoc: 'Đã thuộc' };

  // ---------- Khung trang ----------
  el.innerHTML =
    '<div class="tv-cap lt-cap" role="tablist">' + CAP.map(function (c) {
      return '<button type="button" role="tab" data-cap="' + c + '"' + (c === 'MR' ? ' class="tv-cap-mr"' : '') + '>' + TV.tenCap(c) + '</button>'; }).join('') +
      '<button type="button" role="tab" data-cap="KHO" class="lt-cap-kho">⭐ Từ khó <span class="lt-so-kho"></span></button></div>' +
    '<div class="lt-chon"></div>' +
    '<div class="lt-bai" hidden></div>';
  var khuChon = el.querySelector('.lt-chon'), khuBai = el.querySelector('.lt-bai');

  var S = { cap: '1', chang: 0, dang: 'the', pinyin: true, kho: [], dsChon: [] };   // lựa chọn hiện tại
  function demKho() { var n = TD.dsKho().length; el.querySelector('.lt-so-kho').textContent = n ? '(' + n + ')' : ''; }

  // ---------- Bước 1: chọn cấp → chặng → dạng bài ----------
  function chonCap(c) {
    S.cap = c; S.chang = 0; S.pinyin = c === 'KHO' || SO_CAP.indexOf(c) >= 0;
    el.querySelectorAll('.lt-cap button').forEach(function (b) { b.classList.toggle('on', b.dataset.cap === c); });
    khuChon.innerHTML = '<div class="tv-trong">Đang tải từ vựng…</div>';
    try { history.replaceState(null, '', c === 'KHO' ? '#tu-kho' : '#hsk' + c); } catch (e) {}
    var tai = c === 'KHO' ? taiTuKho() : TV.taiCap(c).then(function (d) { return { kho: d, ds: d }; });
    tai.then(function (r) { if (S.cap !== c) return; S.kho = r.kho; S.ds = r.ds; veChon(); })
      .catch(function () { khuChon.innerHTML = '<div class="tv-trong">Chưa tải được dữ liệu, bạn kiểm tra mạng rồi thử lại nhé.</div>'; });
  }
  // Từ khó có thể nằm ở nhiều cấp: tải đúng những cấp cần
  function taiTuKho() {
    var ds = TD.dsKho(), caps = {};
    ds.forEach(function (x) { caps[x.cap] = 1; });
    return Promise.all(Object.keys(caps).map(function (c) { return TV.taiCap(c).catch(function () { return []; }); })).then(function (nhom) {
      var tatCa = [].concat.apply([], nhom), theoMa = {};
      tatCa.forEach(function (w) { theoMa[w.ma] = w; });
      return { kho: tatCa, ds: ds.map(function (x) { return theoMa[x.ma]; }).filter(Boolean) };
    });
  }

  function thanhTienDo(ds) {
    var d = TD.dem(ds), n = ds.length || 1;
    return '<div class="lt-tong"><div class="lt-vach"><i class="thuoc" style="width:' + (d.thuoc / n * 100) + '%"></i><i class="dang" style="width:' + (d.dang / n * 100) + '%"></i></div>' +
      '<div class="lt-chu-thich"><span><i class="thuoc"></i>Đã thuộc ' + d.thuoc + '</span><span><i class="dang"></i>Đang học ' + d.dang + '</span><span><i class="moi"></i>Mới ' + d.moi + '</span></div></div>';
  }

  function veChon() {
    demKho();
    var ds = S.ds, kho = S.cap === 'KHO';
    if (!ds.length) {
      khuChon.innerHTML = '<div class="tv-trong">' + (kho ? 'Bạn chưa có từ khó nào. Khi làm bài sai, từ đó sẽ tự vào đây; hoặc bấm ☆ ở trang tra cứu để tự thêm. 🌱'
        : 'Cấp này đang được cô cập nhật, bạn quay lại sau nhé! 🌱') + '</div>';
      return;
    }
    var soChang = Math.ceil(ds.length / CHANG);
    var htmlChang = kho ? '<p class="lt-goi-y">Bạn có <b>' + ds.length + '</b> từ khó. Mỗi lượt luyện tối đa ' + CHANG + ' từ, ưu tiên từ còn yếu.</p>' :
      '<div class="lt-nhan">1. Chọn chặng <small>(' + CHANG + ' từ mỗi chặng)</small></div><div class="lt-chang">' +
      '<button type="button" class="lt-chang-o lt-ngau' + (S.chang === -1 ? ' on' : '') + '" data-c="-1"><b>🎲 Ngẫu nhiên</b><small>' + CHANG + ' từ chưa thuộc</small></button>' +
      Array.apply(null, Array(soChang)).map(function (_, i) {
        var phan = ds.slice(i * CHANG, (i + 1) * CHANG), d = TD.dem(phan);
        return '<button type="button" class="lt-chang-o' + (i === S.chang ? ' on' : '') + (d.thuoc === phan.length ? ' xong' : '') + '" data-c="' + i + '">' +
          '<b>Chặng ' + (i + 1) + (d.thuoc === phan.length ? ' ✓' : '') + '</b><small>' + phan.map(function (w) { return w.han; }).slice(0, 3).join(' · ') + '…</small>' +
          '<span class="lt-vach mini"><i class="thuoc" style="width:' + (d.thuoc / phan.length * 100) + '%"></i><i class="dang" style="width:' + (d.dang / phan.length * 100) + '%"></i></span></button>';
      }).join('') + '</div>';
    khuChon.innerHTML = thanhTienDo(ds) + htmlChang +
      '<div class="lt-nhan">' + (kho ? '1' : '2') + '. Chọn dạng bài</div><div class="lt-dang">' +
        DANG_DS.map(function (k) { var d = DANG[k]; return '<button type="button" class="lt-dang-o' + (S.dang === k ? ' on' : '') + '" data-d="' + k + '"><span class="lt-dang-ico">' + d.ico + '</span><b>' + d.ten + '</b><small>' + d.mota + '</small></button>'; }).join('') +
      '</div>' +
      '<label class="lt-bat"><input type="checkbox" class="lt-bat-py"' + (S.pinyin ? ' checked' : '') + '> Hiện pinyin ở đề bài <small>(gợi ý cho người mới)</small></label>' +
      '<div class="lt-bat-dau"><button type="button" class="btn solid lt-go">Bắt đầu luyện ›</button></div>';
  }

  khuChon.addEventListener('click', function (e) {
    var c = e.target.closest('.lt-chang-o'); if (c) { S.chang = +c.dataset.c; khuChon.querySelectorAll('.lt-chang-o').forEach(function (b) { b.classList.toggle('on', b === c); }); return; }
    var d = e.target.closest('.lt-dang-o'); if (d) { S.dang = d.dataset.d; khuChon.querySelectorAll('.lt-dang-o').forEach(function (b) { b.classList.toggle('on', b === d); }); return; }
    if (e.target.closest('.lt-go')) batDau();
  });
  khuChon.addEventListener('change', function (e) { if (e.target.classList.contains('lt-bat-py')) S.pinyin = e.target.checked; });

  function dsLuot() {
    var ds = S.ds;
    if (S.cap === 'KHO') return tron(ds).sort(function (a, b) { return TD.hop(a.ma) - TD.hop(b.ma); }).slice(0, CHANG);
    if (S.chang === -1) {
      var chua = ds.filter(function (w) { return TD.trangThai(w.ma) !== 'thuoc'; });
      return tron(chua.length ? chua : ds).slice(0, CHANG);
    }
    return ds.slice(S.chang * CHANG, (S.chang + 1) * CHANG);
  }

  // ---------- Bước 2: làm bài ----------
  var B = null;   // lượt đang làm: { ds, hang (hàng đợi), i, dung, sai, daSai{} }
  function batDau(dsRieng) {
    var ds = tron(dsRieng || dsLuot());
    if (!ds.length) return TV.baoLoi('Chưa có từ để luyện.');
    B = { goc: ds, hang: ds.slice(), i: 0, dung: 0, sai: 0, daSai: {}, lapLai: {} };
    khuChon.hidden = true; el.querySelector('.lt-cap').hidden = true; khuBai.hidden = false;
    veCau(); el.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
  function veKhung(noiDung, w) {
    var tong = B.hang.length, xong = B.i;
    khuBai.innerHTML = '<div class="lt-dau-bai"><button type="button" class="lt-thoat">‹ Chọn lại</button>' +
      '<span class="lt-dem">' + DANG[S.dang].ten + ' · ' + Math.min(xong + 1, tong) + ' / ' + tong + '</span>' + nutSao(w) + '</div>' +
      '<div class="lt-vach lt-vach-bai"><i class="thuoc" style="width:' + (xong / tong * 100) + '%"></i></div>' + noiDung;
  }
  function nutSao(w) {
    if (!w) return '<span></span>';
    var on = TD.laKho(w.ma);
    return '<button type="button" class="tv-sao lt-sao' + (on ? ' on' : '') + '" aria-pressed="' + on + '" aria-label="' + (on ? 'Bỏ khỏi' : 'Thêm vào') + ' danh sách từ khó">' + (on ? '★' : '☆') + '<span>Từ khó</span></button>';
  }
  function veCau() {
    if (B.i >= B.hang.length) return veKetQua();
    DANG[S.dang].ve(B.hang[B.i]);
  }
  function tiep() { B.i++; TV.dungDoc(); veCau(); }
  function ghiKetQua(w, dung, tuThemKho) {
    TD.ghi(w, dung);
    if (dung) B.dung++; else { B.sai++; B.daSai[w.ma] = w; if (tuThemKho && !TD.laKho(w.ma)) { TD.datKho(w, true); return true; } }
    return false;
  }
  function nhanTu(w, to) {   // khối hiện đáp án: chữ, pinyin, loa, nghĩa, Hán Việt, từ loại
    return '<div class="lt-tu' + (to ? ' to' : '') + '"><div class="lt-tu-chu"><span class="hanzi">' + esc(w.han) + '</span>' + TV.nutLoa(w.han, to, w.doc) + '</div>' +
      '<div class="lt-tu-py">' + esc(w.py) + '</div><div class="lt-tu-nghia">' + esc(w.nghia) + '</div>' +
      '<div class="tv-the-tag">' + (w.hv ? '<span class="tag gold">Hán Việt: ' + esc(w.hv) + '</span>' : '') + (w.loai ? '<span class="tag">' + esc(w.loai) + '</span>' : '') + '</div></div>';
  }

  // ---------- Các dạng bài ----------
  var DANG = {
    the: {
      ten: 'Flashcard', ico: '🃏', mota: 'Lật thẻ, tự chấm nhớ / chưa nhớ',
      ve: function (w) {
        veKhung('<div class="lt-the" tabindex="0" role="button" aria-label="Lật thẻ"><div class="lt-the-trong">' +
          '<div class="lt-mat truoc"><span class="hanzi lt-the-han">' + esc(w.han) + '</span>' + (S.pinyin ? '<span class="lt-the-py">' + esc(w.py) + '</span>' : '') + '<small>Bấm để lật thẻ</small></div>' +
          '<div class="lt-mat sau">' + nhanTu(w, true) + '</div></div></div>' +
          '<div class="lt-nut-the"><button type="button" class="btn solid lt-lat">Lật thẻ</button></div>', w);
      },
      latThe: function () {
        var t = khuBai.querySelector('.lt-the'); if (!t || t.classList.contains('lat')) return;
        t.classList.add('lat');
        khuBai.querySelector('.lt-nut-the').innerHTML = '<button type="button" class="btn lt-chua">😕 Chưa nhớ</button><button type="button" class="btn solid lt-nho">😊 Đã nhớ</button>';
      },
      cham: function (nho) {
        var w = B.hang[B.i]; ghiKetQua(w, nho, false);
        if (!nho && (B.lapLai[w.ma] || 0) < 2) { B.lapLai[w.ma] = (B.lapLai[w.ma] || 0) + 1; B.hang.push(w); }   // thẻ chưa nhớ quay lại cuối lượt
        tiep();
      }
    },
    nghia: {
      ten: 'Chọn nghĩa', ico: '📝', mota: 'Nhìn chữ Hán, chọn nghĩa đúng',
      ve: function (w) { veTracNghiem(w, 'nghia'); }
    },
    chu: {
      ten: 'Chọn chữ Hán', ico: '✍️', mota: 'Nhìn nghĩa, chọn chữ Hán đúng',
      ve: function (w) { veTracNghiem(w, 'chu'); }
    }
  };
  var DANG_DS = ['the', 'nghia', 'chu'];

  function veTracNghiem(w, kieu) {
    var dap = tron([w].concat(dapAnNhieu(w, S.kho)));
    var de = kieu === 'nghia'
      ? '<div class="lt-de"><div class="lt-de-chu"><span class="hanzi">' + esc(w.han) + '</span>' + TV.nutLoa(w.han, true, w.doc) + '</div>' + (S.pinyin ? '<div class="lt-tu-py">' + esc(w.py) + '</div>' : '') + '<p class="lt-hoi">Nghĩa của từ này là gì?</p></div>'
      : '<div class="lt-de"><div class="lt-de-nghia">' + esc(w.nghia) + '</div>' + (w.loai ? '<div class="tv-the-tag"><span class="tag">' + esc(w.loai) + '</span></div>' : '') + '<p class="lt-hoi">Chữ Hán nào mang nghĩa này?</p></div>';
    veKhung(de + '<div class="lt-dap ' + kieu + '">' + dap.map(function (x, k) {
      return '<button type="button" class="lt-dap-o" data-ma="' + esc(x.ma) + '"><span class="lt-so">' + (k + 1) + '</span>' +
        (kieu === 'nghia' ? '<span class="lt-dap-chu">' + esc(x.nghia) + '</span>' : '<span class="lt-dap-chu hanzi">' + esc(x.han) + '</span><span class="lt-dap-py">' + esc(x.py) + '</span>') + '</button>';
    }).join('') + '</div><div class="lt-phan-hoi"></div>', w);
  }
  function traLoi(nut) {
    var w = B.hang[B.i], hop = khuBai.querySelector('.lt-dap');
    if (!hop || hop.classList.contains('xong')) return;
    hop.classList.add('xong');
    var dung = nut.dataset.ma === w.ma;
    hop.querySelectorAll('.lt-dap-o').forEach(function (b) { b.disabled = true; if (b.dataset.ma === w.ma) b.classList.add('dung'); });
    if (!dung) nut.classList.add('sai');
    var themKho = ghiKetQua(w, dung, true);
    khuBai.querySelector('.lt-sao').outerHTML = nutSao(w);
    khuBai.querySelector('.lt-phan-hoi').innerHTML = '<div class="lt-ket ' + (dung ? 'dung' : 'sai') + '">' + (dung ? '🎉 Chính xác!' : '❌ Chưa đúng rồi' + (themKho ? ' · đã thêm vào ⭐ Từ khó' : '')) + '</div>' +
      nhanTu(w) + '<div class="lt-nut-the"><button type="button" class="btn solid lt-tiep">' + (B.i + 1 < B.hang.length ? 'Câu tiếp ›' : 'Xem kết quả ›') + '</button></div>';
    khuBai.querySelector('.lt-tiep').focus({ preventScroll: true });
  }

  // ---------- Kết quả ----------
  function veKetQua() {
    var tong = B.dung + B.sai, sai = Object.keys(B.daSai).map(function (k) { return B.daSai[k]; });
    var tl = tong ? Math.round(B.dung / tong * 100) : 0;
    var loi = tl === 100 ? 'Xuất sắc! Bạn nhớ hết rồi 🎉' : tl >= 80 ? 'Rất tốt! Ôn lại vài từ còn sai là chắc 💪' : tl >= 50 ? 'Khá rồi, luyện thêm một lượt nữa nhé 🌱' : 'Từ mới mà, cứ từ từ. Làm lại lượt nữa sẽ nhớ hơn 🌱';
    var coChangSau = S.cap !== 'KHO' && S.chang >= 0 && (S.chang + 1) * CHANG < S.ds.length;
    khuBai.innerHTML = '<div class="lt-ket-qua card"><div class="lt-diem">' + tl + '%</div><p class="lt-loi">' + loi + '</p>' +
      '<p class="lt-goi-y">' + (S.dang === 'the' ? 'Nhớ ' + B.dung + ' lần · chưa nhớ ' + B.sai + ' lần' : 'Đúng ' + B.dung + ' / ' + tong + ' câu') + '</p>' +
      (sai.length ? '<div class="lt-nhan">Từ cần ôn lại</div><ul class="lt-ds-sai">' + sai.map(function (w) {
        return '<li><span class="hanzi">' + esc(w.han) + '</span><span class="lt-ds-py">' + esc(w.py) + '</span><span class="lt-ds-nghia">' + esc(w.nghia) + '</span>' + nutSao(w).replace('lt-sao', 'lt-sao lt-sao-ds').replace('<button', '<button data-ma="' + esc(w.ma) + '"') + '</li>';
      }).join('') + '</ul>' : '') +
      '<div class="lt-nut-kq">' + (sai.length ? '<button type="button" class="btn solid lt-lam-sai">Luyện lại ' + sai.length + ' từ sai</button>' : '') +
        (coChangSau ? '<button type="button" class="btn' + (sai.length ? '' : ' solid') + ' lt-chang-sau">Chặng ' + (S.chang + 2) + ' ›</button>' : '') +
        '<button type="button" class="btn lt-lai">Làm lại lượt này</button><button type="button" class="btn lt-thoat">‹ Chọn lại</button></div></div>';
  }

  function veLaiChon() { khuBai.hidden = true; khuChon.hidden = false; el.querySelector('.lt-cap').hidden = false; TV.dungDoc(); veChon(); }

  khuBai.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('.lt-thoat')) return veLaiChon();
    var sao = t.closest('.lt-sao');
    if (sao) {
      var w = sao.dataset.ma ? (B.daSai[sao.dataset.ma]) : B.hang[B.i];
      if (w) { TD.datKho(w, !TD.laKho(w.ma)); var moi = nutSao(w); if (sao.dataset.ma) moi = moi.replace('lt-sao', 'lt-sao lt-sao-ds').replace('<button', '<button data-ma="' + esc(w.ma) + '"'); sao.outerHTML = moi; }
      return;
    }
    if (t.closest('.tv-loa')) return;
    if (t.closest('.lt-the') || t.closest('.lt-lat')) return DANG.the.latThe();
    if (t.closest('.lt-nho')) return DANG.the.cham(true);
    if (t.closest('.lt-chua')) return DANG.the.cham(false);
    var o = t.closest('.lt-dap-o'); if (o) return traLoi(o);
    if (t.closest('.lt-tiep')) return tiep();
    if (t.closest('.lt-lam-sai')) return batDau(Object.keys(B.daSai).map(function (k) { return B.daSai[k]; }));
    if (t.closest('.lt-lai')) return batDau(B.goc);
    if (t.closest('.lt-chang-sau')) { S.chang++; return batDau(); }
  });
  // Bàn phím: Space lật thẻ · ← chưa nhớ · → đã nhớ · 1–4 chọn đáp án · Enter câu tiếp
  document.addEventListener('keydown', function (e) {
    if (khuBai.hidden || !B || /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (S.dang === 'the') {
      var t = khuBai.querySelector('.lt-the');
      if (!t) return;
      if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); if (!t.classList.contains('lat')) DANG.the.latThe(); else DANG.the.cham(true); }
      else if (t.classList.contains('lat') && e.key === 'ArrowRight') DANG.the.cham(true);
      else if (t.classList.contains('lat') && e.key === 'ArrowLeft') DANG.the.cham(false);
      return;
    }
    var o = khuBai.querySelectorAll('.lt-dap-o'), n = +e.key;
    if (n >= 1 && n <= o.length && !khuBai.querySelector('.lt-dap.xong')) { e.preventDefault(); traLoi(o[n - 1]); }
    else if (e.key === 'Enter' && khuBai.querySelector('.lt-tiep')) { e.preventDefault(); tiep(); }
  });

  el.querySelector('.lt-cap').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) chonCap(b.dataset.cap); });
  document.addEventListener('qm-tien-do', function () { demKho(); });

  var h = location.hash;
  if (/^#tu-kho/.test(h)) chonCap('KHO');
  else { var c = (h.match(/hsk([\dMR-]+)/) || [])[1]; chonCap(CAP.indexOf(c) >= 0 ? c : '1'); }
})();
