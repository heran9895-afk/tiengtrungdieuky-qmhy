/* =========================================================
   ÔN TẬP TỔNG HỢP BÀI 1–5 (HSK 3.0) — bộ máy trắc nghiệm dùng chung cho các phần
   Ngữ âm · Chữ Hán · Từ vựng (phân loại) · Ngữ pháp · Đọc hiểu · Nghe.
   Đặt <div id="on-tap" data-phan="ngu-am" data-ten="Ngữ âm"></div>; window.QM_OT_TEP = đường dẫn data/bai/on-tap-1-5.json.
   Nạp sau tu-vung-chung.js (đọc, nút loa) và on-tap-gui.js (gửi bài làm về Sheet).
   Mỗi câu (item): ma, nhom, dang ('chon' | 'dungSai' | 'xep'), hoi, de, cau, sau, goiY, tu, loa, anDe,
     dap, nhieu, pa ('han' | 'py' | 'vi' | 'cau'), dung, sua, khoi, dapXep, cauDung, py, giai, but, hienSau
   Một lượt: bốc ngẫu nhiên theo nhóm (mỗi nhóm tối đa "tran" câu). Ngữ pháp: mỗi thẻ Bài 2–5 một câu + "soMoi" câu tổng hợp.
   Đọc hiểu: chọn một bài đọc, làm hết câu hỏi của bài đó. Không lên Bảng xếp hạng.
   ========================================================= */
(function () {
  var el = document.getElementById('on-tap'), TV = window.QM_TV, G = window.QM_OTG; if (!el || !TV || !G) return;
  var PHAN = el.dataset.phan, TEN = el.dataset.ten || PHAN, KHOA_HS = 'qmhy:hoSo';
  var esc = TV.esc, P = null, L = null, BAI_DOC = null;
  var TEN_DANG = { chon: '🎯 Chọn đáp án đúng', dungSai: '✅ Đúng hay sai', xep: '🧭 Xếp câu, thêm dấu câu' };
  var DAU_CAU = ['，', '。', '？', '！'];

  // ---------- âm thanh hiệu ứng (như Luyện ngữ pháp) ----------
  var AM = { bat: true, ctx: null };
  try { AM.bat = localStorage.getItem('qm-am-hieu-ung') !== '0'; } catch (e) {}
  var NOT = { dung: [[880, .09], [1318.5, .16]], sai: [[233, .12], [196, .2]], cham: [[660, .045]], dau: [[990, .04]],
    batDau: [[523.3, .07], [784, .12]], xong: [[523.3, .1], [659.3, .1], [784, .1], [1046.5, .28]], xongVua: [[523.3, .12], [659.3, .22]] };
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
        o.connect(g); g.connect(C.destination); o.start(t); o.stop(t + n[1] + .02); t += n[1] * .85;
      });
    } catch (e) {}
  }
  function nutAm() { return '<button type="button" class="lt-am ot-am' + (AM.bat ? ' on' : '') + '" aria-pressed="' + AM.bat + '" title="' + (AM.bat ? 'Tắt' : 'Bật') + ' âm thanh">' + (AM.bat ? '🔊' : '🔇') + '</button>'; }

  // ---------- tiện ích ----------
  function tron(t) { return esc(t).replace(/[㐀-鿿〇，。？！：、“”]+/g, function (m) { return '<span class="hanzi">' + m + '</span>'; }); }
  function dam(t) { return tron(t).replace(/\*\*(.+?)\*\*/g, '<strong class="np-nb">$1</strong>'); }
  function tron1(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function docLS(k, md) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : md; } catch (e) { return md; } }
  function ghiLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function gon(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function tren() { var h = document.querySelector('.sh-header'); return h ? Math.max(0, h.getBoundingClientRect().bottom) : 0; }
  function duoi() { var sf = document.querySelector('.sf'); return sf ? sf.getBoundingClientRect().top : innerHeight; }
  function veDau() { function d() { var r = el.getBoundingClientRect(); if (Math.abs(r.top - tren() - 8) > 12) window.scrollTo(0, Math.max(0, r.top + scrollY - tren() - 8)); } d(); setTimeout(d, 380); }
  function giuNut() {
    function d() { var b = el.querySelector('.ot-tiep'); if (!b) return; var r = b.getBoundingClientRect(), du = r.bottom - (duoi() - 10); if (du > 0) window.scrollBy(0, du); }
    d(); setTimeout(d, 380);
  }
  function tenNhom(c) { return (P.tenNhom || {})[c.nhom] || (BAI_DOC ? BAI_DOC.ten : c.nhom); }

  // ---------- thuận bút (Hanzi Writer, như trang Từ vựng) ----------
  var HW = null, hwCho = [];
  function taiHW(xong) {
    if (window.HanziWriter) return xong();
    hwCho.push(xong); if (HW) return;
    HW = document.createElement('script');
    HW.src = 'https://cdn.jsdelivr.net/npm/hanzi-writer@3.5.0/dist/hanzi-writer.min.js';
    HW.onload = function () { hwCho.splice(0).forEach(function (f) { f(); }); };
    document.head.appendChild(HW);
  }
  function veBut(box) {
    taiHW(function () {
      if (typeof HanziWriter === 'undefined' || !box.isConnected) return;
      box.innerHTML = '';
      var wr = HanziWriter.create(box, box.dataset.chu, { width: 96, height: 96, padding: 4, showOutline: true, strokeAnimationSpeed: 1, delayBetweenStrokes: 260,
        strokeColor: '#0b5a2a', outlineColor: '#e8e1cf', onLoadCharDataError: function () { box.innerHTML = '<span class="hanzi">' + esc(box.dataset.chu) + '</span>'; } });
      box.onclick = function () { wr.animateCharacter(); };
      wr.animateCharacter();
    });
  }

  // ---------- TRỘN TỔNG HỢP: gộp câu của 6 phần; câu luyện 160 từ dựng từ danh sách từ ----------
  var PHAN_GOC = [['ngu-am', '🔤 Ngữ âm'], ['chu-han', '✍️ Chữ Hán'], ['tu-vung', '📚 Từ vựng'], ['ngu-phap', '📐 Ngữ pháp'], ['doc-hieu', '📖 Đọc hiểu'], ['nghe', '🎧 Nghe']];
  function khongDau(s) { return String(s).normalize('NFD').replace(/[\u0300-\u036f·\s'’-]/g, '').toLowerCase(); }
  function tachNghia(v) { return String(v).toLowerCase().split(/[,;，；/()…]+/).map(function (x) { return x.trim(); }).filter(Boolean); }
  function giongNghia(a, b) {                                  // hai từ có nghĩa trùng / chứa nhau thì không làm nhiễu cho nhau
    if (b[2].indexOf(a[0]) >= 0 || a[2].indexOf(b[0]) >= 0) return true;
    var x = tachNghia(a[2]), y = tachNghia(b[2]); return x.some(function (s) { return y.indexOf(s) >= 0; });
  }
  function cauTu(k, t, ds) {
    var ung = ds.filter(function (u) { return u[0] !== t[0] && !giongNghia(t, u) && khongDau(u[1]) !== khongDau(t[1]) && u[2] !== t[2]; });
    var cung = ung.filter(function (u) { return u[0].length === t[0].length; }), nh = tron1(cung.length >= 2 ? cung : ung).slice(0, 2);
    if (nh.length < 2) return null;
    var giai = t[0] + ' **' + t[1] + '**: ' + t[2] + '.';
    if (k === 'T1') return { dang: 'chon', hoi: 'Từ nào có nghĩa là “' + t[2] + '”?', dap: t[0], nhieu: nh.map(function (u) { return u[0]; }), pa: 'han', giai: giai };
    if (k === 'T2') return { dang: 'chon', hoi: 'Nghe và chọn từ vừa đọc', de: t[0], loa: t[0], anDe: true, dap: t[0], nhieu: nh.map(function (u) { return u[0]; }), pa: 'han', giai: giai };
    if (k === 'T3') return { dang: 'chon', hoi: 'Chọn phiên âm đúng của từ này', de: t[0], dap: t[1], nhieu: nh.map(function (u) { return u[1]; }), pa: 'py', giai: giai };
    return { dang: 'chon', hoi: 'Từ này nghĩa là gì?', de: t[0], loa: t[0], dap: t[2], nhieu: nh.map(function (u) { return u[2]; }), pa: 'vi', giai: giai };
  }
  function tongHop(d) {
    var th = d.phan['tong-hop'], Q = { soCau: th.soCau || 30, tuLuyen: th.tuLuyen, tenNhom: {}, cau: [] };
    PHAN_GOC.forEach(function (pg) {
      var p = d.phan[pg[0]]; if (!p) return;
      function them(c, bai) {
        var o = Object.assign({}, c, { ma: pg[0] + '/' + c.ma, nhom: pg[0] + '/' + c.nhom, phanGoc: pg[0] }); if (bai) o.baiDoc = bai;
        Q.tenNhom[o.nhom] = pg[1] + ' · ' + (bai ? bai.ten : (p.tenNhom || {})[c.nhom] || 'Tổng hợp'); Q.cau.push(o);
      }
      (p.cau || []).forEach(function (c) { them(c); });
      (p.bai || []).forEach(function (b) { b.cau.forEach(function (c) { them(c, b); }); });
    });
    (th.tu || []).forEach(function (t) {
      ['T1', 'T2', 'T3', 'T4'].forEach(function (k) {
        var c = cauTu(k, t, th.tu); if (!c) return;
        c.ma = 'tu-vung/' + k + '-' + t[0]; c.nhom = 'tu-vung/' + k; c.phanGoc = 'tu-vung'; c.tuLuyen = 1;
        Q.tenNhom[c.nhom] = '📚 ' + th.tenNhom[k]; Q.cau.push(c);
      });
    });
    return Q;
  }

  // ---------- dựng lượt ----------
  // Rải đều theo nhóm: xoay vòng các nhóm, lấy n câu
  function layDeu(ds, n) {
    var nh = {}, thu = [], o = [], v = 0;
    ds.forEach(function (c) { if (!nh[c.nhom]) { nh[c.nhom] = []; thu.push(c.nhom); } nh[c.nhom].push(c); });
    thu = tron1(thu); thu.forEach(function (k) { nh[k] = tron1(nh[k]); });
    while (o.length < n && v < 60) { thu.forEach(function (k) { if (o.length < n && nh[k][v]) o.push(nh[k][v]); }); v++; }
    return o;
  }
  // TRỘN TỔNG HỢP: một bài đọc (các câu hỏi đi liền nhau) + phần còn lại chia đều cho Ngữ âm, Chữ Hán, Từ vựng, Ngữ pháp, Nghe; trộn lẫn ngẫu nhiên
  function dungLuotTron() {
    var theo = {}; P.cau.forEach(function (c) { (theo[c.phanGoc] || (theo[c.phanGoc] = [])).push(c); });
    var doc = theo['doc-hieu'] || [], bai = doc.length ? tron1(doc)[0].baiDoc : null, khoiDoc = doc.filter(function (c) { return c.baiDoc === bai; });
    var nam = ['ngu-am', 'chu-han', 'tu-vung', 'ngu-phap', 'nghe'], con = P.soCau - khoiDoc.length, chia = {}, ds = [];
    nam.forEach(function (k) { chia[k] = Math.floor(con / nam.length); });
    tron1(nam).slice(0, con - Math.floor(con / nam.length) * nam.length).forEach(function (k) { chia[k]++; });
    nam.forEach(function (k) {
      var ds0 = theo[k] || [];
      if (k === 'tu-vung') { var tl = Math.min(P.tuLuyen || 3, chia[k]); ds = ds.concat(layDeu(ds0.filter(function (c) { return c.tuLuyen; }), tl), layDeu(ds0.filter(function (c) { return !c.tuLuyen; }), chia[k] - tl)); }
      else ds = ds.concat(layDeu(ds0, chia[k]));
    });
    ds = tron1(ds);
    var vt = 1 + Math.floor(Math.random() * Math.max(1, ds.length - 1));
    return ds.slice(0, vt).concat(khoiDoc, ds.slice(vt));
  }
  function dungLuot() {
    var ds = [];
    if (PHAN === 'tong-hop') ds = dungLuotTron();
    else if (PHAN === 'doc-hieu') ds = BAI_DOC.cau.slice();
    else if (PHAN === 'ngu-phap') {
      var theo = {}, moi = [];
      P.cau.forEach(function (c) { if (c.nguon === 'moi') moi.push(c); else (theo[c.nhom] || (theo[c.nhom] = [])).push(c); });
      Object.keys(theo).forEach(function (k) { ds.push(tron1(theo[k])[0]); });
      ds = ds.concat(tron1(moi).slice(0, P.soMoi || 6));
      ds = tron1(ds);
      for (var k = 1; k < ds.length; k++) if (ds[k].nhom === ds[k - 1].nhom) { var j = (k + 3) % ds.length, t = ds[k]; ds[k] = ds[j]; ds[j] = t; }
    } else {
      var nhom = {}, thu = [];
      P.cau.forEach(function (c) { if (!nhom[c.nhom]) { nhom[c.nhom] = []; thu.push(c.nhom); } nhom[c.nhom].push(c); });
      thu.forEach(function (k) { nhom[k] = tron1(nhom[k]); });
      var tran = P.tran || 4, vong = 0;
      while (ds.length < P.soCau && vong < tran) {             // xoay vòng các nhóm: rải đều, mỗi nhóm tối đa "tran" câu
        tron1(thu).forEach(function (k) { if (ds.length < P.soCau && nhom[k][vong]) ds.push(nhom[k][vong]); });
        vong++;
      }
      ds = tron1(ds);
    }
    var hs = hoSo();
    L = { ds: ds.map(function (c) { return { c: c }; }), i: 0, kq: [], ma: G.maLuot(), luc: Date.now(), batDau: new Date().toISOString(), hoTen: gon(hs.hoTen), lop: gon(hs.lop) };
  }

  // ---------- màn bắt đầu ----------
  function hoSo() { var h = window.QM_TK && QM_TK.hoSoDang && QM_TK.hoSoDang(); return h ? { hoTen: h.hoTen, lop: h.lop } : docLS(KHOA_HS, {}); }
  function oHocSinh() {
    var hs = hoSo();
    return '<div class="lt-hs lnp-hs"><label>Họ tên đầy đủ<input type="text" class="ot-ten lt-hs-ten" autocomplete="name" placeholder="VD: Nguyễn Văn An" value="' + esc(hs.hoTen || '') + '"></label>' +
      '<label>Lớp<input type="text" class="ot-lop lt-hs-lop" placeholder="VD: HSK1-K3" value="' + esc(hs.lop || '') + '"></label>' +
      '<p class="lt-hs-ghi">Bài làm từng câu được gửi về cho cô giáo để theo dõi và cải tiến bài học. Phần này không xếp hạng.</p></div>';
  }
  // ---------- lượt làm dở: lưu sau mỗi câu, lần sau vào làm tiếp (luot-do.js; đăng nhập thì đồng bộ qua tài khoản) ----------
  var LD = window.QM_LD, TIEN_TO = 'on-tap-1-5/';
  function khoaLD(b) { return TIEN_TO + PHAN + (b ? '-' + b.ma : ''); }
  function luuDo() {
    if (!LD || !L) return;
    var n = L.kq.length;
    if (n >= L.ds.length) return;
    LD.luu(khoaLD(BAI_DOC), { ten: TEN + (BAI_DOC ? ' · ' + BAI_DOC.ten : ''), tom: 'câu ' + (n + 1) + ' / ' + L.ds.length,
      du: { ma: L.ma, ds: L.ds.map(function (x) { return x.c.ma; }), kq: L.kq, giay: Math.round((Date.now() - L.luc) / 1000), batDau: L.batDau, bai: BAI_DOC ? BAI_DOC.ma : '' } });
  }
  function oLamTiep() {
    if (!LD) return '';
    var ds = PHAN === 'doc-hieu' ? P.bai.map(function (b) { var e = LD.doc(khoaLD(b)); return e && { e: e, b: b }; }).filter(Boolean)
      : [LD.doc(khoaLD())].filter(Boolean).map(function (e) { return { e: e }; });
    return ds.map(function (x) {
      return '<div class="ot-lam-tiep"><div>📌 Bạn còn lượt làm dở' + (x.b ? ' <b>' + esc(x.b.ten) + '</b>' : '') + ': <b>' + esc(x.e.tom) + '</b> · lưu ' + esc(LD.luc(x.e.t)) + '</div>' +
        '<div class="ot-lam-tiep-nut"><button type="button" class="btn solid ot-ld-tiep"' + (x.b ? ' data-bai="' + esc(x.b.ma) + '"' : '') + '>▶ Làm tiếp</button>' +
        '<button type="button" class="btn ot-ld-bo"' + (x.b ? ' data-bai="' + esc(x.b.ma) + '"' : '') + '>Bỏ, làm lượt mới</button></div></div>';
    }).join('');
  }
  function khoiPhuc(maBai) {
    var b = maBai ? P.bai.filter(function (x) { return x.ma === maBai; })[0] : null, e = LD && LD.doc(khoaLD(b));
    if (!e || !e.du) return false;
    var nguon = b ? b.cau : P.cau, theoMa = {};
    nguon.forEach(function (c) { theoMa[c.ma] = c; });
    var ds = e.du.ds.map(function (m) { return theoMa[m]; });
    if (ds.some(function (c) { return !c; }) || e.du.kq.length >= ds.length) { LD.xoa(khoaLD(b)); TV.baoLoi('Bài ôn tập vừa được cô cập nhật nên lượt làm dở không dùng tiếp được. Bạn làm lượt mới nhé.'); return false; }
    BAI_DOC = b;
    var hs = hoSo();
    L = { ds: ds.map(function (c) { return { c: c }; }), i: e.du.kq.length, kq: e.du.kq, ma: e.du.ma, luc: Date.now() - (e.du.giay || 0) * 1000,
      batDau: e.du.batDau, hoTen: gon(hs.hoTen), lop: gon(hs.lop) };
    return true;
  }
  function veBatDau() {
    var moTa = el.dataset.moTa || '';
    if (PHAN === 'doc-hieu') {
      el.innerHTML = '<div class="lnp-dau card"><div class="sec-kicker">阅读</div><h2 class="lnp-tieu-de">📖 Đọc hiểu</h2>' +
        '<p class="lnp-mo-ta">Chọn một bài đọc. Đọc kỹ (bấm 🔊 để nghe, bấm <b>Hiện pinyin</b> nếu cần), rồi trả lời các câu hỏi bên dưới bài.</p>' + oLamTiep() + oHocSinh() +
        '<div class="ot-ds-bai">' + P.bai.map(function (b, k) {
          return '<button type="button" class="ot-chon-bai" data-k="' + k + '"><b>' + esc(b.ten) + '</b><span>' + b.cau.length + ' câu hỏi</span></button>'; }).join('') + '</div></div>';
      return;
    }
    var so = PHAN === 'ngu-phap' ? Object.keys(P.tenNhom).length + (P.soMoi || 6) : P.soCau;
    if (PHAN === 'ngu-phap') {
      var coNhom = {}; P.cau.forEach(function (c) { if (c.nguon !== 'moi') coNhom[c.nhom] = 1; }); so = Object.keys(coNhom).length + (P.soMoi || 6);
    }
    var nhom = []; P.cau.forEach(function (c) { var t = (P.tenNhom || {})[c.nhom]; if (t && nhom.indexOf(t) < 0 && PHAN !== 'ngu-phap') nhom.push(t); });
    if (PHAN === 'tong-hop') nhom = PHAN_GOC.map(function (p) { return p[1]; });
    el.innerHTML = '<div class="lnp-dau card"><div class="sec-kicker">' + esc(el.dataset.kicker || '复习') + '</div><h2 class="lnp-tieu-de">' + esc(el.dataset.tieuDe || TEN) + '</h2>' +
      '<p class="lnp-mo-ta">Mỗi lượt <b>' + so + ' câu</b> bốc ngẫu nhiên' + (moTa ? ': ' + moTa : '') + '. Lượt sau đổi câu.</p>' +
      (nhom.length ? '<p class="lnp-dang">' + nhom.map(function (t) { return '<span>' + tron(t) + '</span>'; }).join('') + '</p>' : '') +
      oLamTiep() + oHocSinh() + '<div class="lt-nut-kq"><button type="button" class="btn ' + (LD && LD.doc(khoaLD()) ? '' : 'solid ') + 'ot-bat-dau">' + (LD && LD.doc(khoaLD()) ? 'Bắt đầu lượt mới ›' : 'Bắt đầu ›') + '</button></div>' +
      (LD ? '<p class="lt-hs-ghi ot-ghi-luu">💾 Bài đang làm tự lưu sau mỗi câu. Thoát ra giữa chừng, lần sau vào bấm <b>▶ Làm tiếp</b>' + (window.QM_TK && QM_TK.hoSoId && QM_TK.hoSoId() ? ' (cả trên máy khác, vì bạn đã đăng nhập)' : '; đăng nhập Google để làm tiếp được trên máy khác') + '.</p>' : '') + '</div>';
  }
  function luuHs() {
    var t = el.querySelector('.ot-ten'), l = el.querySelector('.ot-lop'); if (!t) return;
    ghiLS(KHOA_HS, Object.assign({}, docLS(KHOA_HS, {}), { hoTen: gon(t.value), lop: gon(l.value) }));
  }

  // ---------- vẽ câu ----------
  function veBaiDoc() {
    var BD = BAI_DOC || (L && L.ds[L.i] && L.ds[L.i].c.baiDoc); if (!BD) return '';
    var docAll = BD.van.map(function (v) { return v.han; }).join('');
    return '<details class="ot-bai-doc card" open><summary>📖 ' + (BAI_DOC ? '' : 'Bài đọc: ') + esc(BD.ten) + '</summary><div class="ot-bai-doc-nut">' + TV.nutLoa(docAll) +
      '<button type="button" class="btn ot-hien-py">Hiện pinyin</button></div><div class="ot-van">' + BD.van.map(function (v) {
        return '<p>' + (v.ai ? '<b class="hanzi">' + esc(v.ai) + '：</b>' : '') + '<span class="hanzi">' + esc(v.han) + '</span><i class="ot-van-py" hidden>' + esc(v.py) + '</i></p>'; }).join('') + '</div></details>';
  }
  function veCau() {
    var x = L.ds[L.i], c = x.c, de = '', dap = '', pa;
    x.t0 = Date.now();
    var dau = '<div class="lnp-hang"><span class="lnp-ten-dang">' + TEN_DANG[c.dang] + '</span><span class="lnp-phai"><span class="lt-dem">' + (L.i + 1) + ' / ' + L.ds.length + '</span>' + nutAm() + '</span></div>' +
      '<div class="lnp-nhan">' + (PHAN === 'ngu-phap' ? '📐 ' : PHAN === 'tong-hop' ? '' : '🏷️ ') + tron(tenNhom(c)) + '</div>';
    var hoi = '<p class="lnp-hoi">' + tron(c.hoi || '') + '</p>';
    if (c.dang === 'chon') {
      var loa = c.loa ? '<div class="lt-de-nghe ot-nghe">' + TV.nutLoa(c.loa).replace('tv-loa', 'tv-loa lt-nghe') + '<small>Bấm để nghe lại</small></div>' : '';
      var chu = c.de ? '<div class="lt-de-chu' + (c.anDe ? ' ot-an' : '') + '"><span class="hanzi">' + esc(c.de) + '</span></div>' : '';
      var cau = '';
      if (c.cau) {
        var o = esc(c.cau).replace('＿', '<span class="lnp-trong">　　</span>');
        if (c.tu) o = o.replace(esc(c.tu), '<span class="lnp-tu">' + esc(c.tu) + '</span>');
        cau = c.sau ? '<div class="lt-de-cau lnp-hthoai"><div><b>A：</b><span class="hanzi">' + o + '</span></div><div><b>B：</b><span class="hanzi">' + esc(c.sau) + '</span></div></div>'
          : '<div class="lt-de-cau' + (c.anDe ? ' ot-an' : '') + '"><span class="hanzi">' + o + '</span></div>';
        if (c.goiY) cau += '<p class="lnp-goi-y">Số: <b>' + esc(c.goiY) + '</b></p>';
      }
      de = hoi + (c.hienSau ? loa + cau : (c.cau && c.loa && !c.de ? '<div class="lnp-de-loa">' + TV.nutLoa(c.loa) + cau + '</div>' : loa + chu + cau));
      pa = tron1([c.dap].concat(c.nhieu)); x.pa = pa;
      var kieu = c.pa === 'han' ? 'chu' : c.pa === 'py' ? 'py' : c.pa === 'cau' ? 'cau' : 'vi';
      var dai = pa.some(function (p) { return p.length > 4; }), coDai = pa.some(function (p) { return p.length > 2; });
      dap = '<div class="lt-dap ' + (kieu === 'vi' ? 'ot-vi' + (dai ? ' ot-1c' : '') : kieu === 'chu' && dai ? 'cau' : kieu) + ' lnp-dap' + (pa.length === 3 && kieu === 'chu' && !dai ? ' lnp-3' : '') + (pa.length === 2 ? ' ot-2' : '') + '">' +
        pa.map(function (p, k) {
          var nd = kieu === 'chu' && !dai ? '<span class="lt-dap-chu hanzi' + (coDai ? ' lnp-dai' : '') + '">' + esc(p) + '</span>'
            : kieu === 'cau' || (kieu === 'chu' && dai) ? '<span class="lt-dap-cau hanzi">' + esc(p) + '</span>' : kieu === 'vi' ? '<span>' + tron(p) + '</span>' : esc(p);
          return '<button type="button" class="lt-dap-o" data-k="' + k + '"><span class="lt-so">' + (k + 1) + '</span>' + nd + '</button>'; }).join('') + '</div>';
    } else if (c.dang === 'dungSai') {
      de = hoi + '<div class="lt-de-cau hanzi">' + esc(c.cau) + '</div>';
      pa = ['Đúng', 'Sai']; x.pa = pa;
      dap = '<div class="lt-dap lnp-dap lnp-ds">' + pa.map(function (p, k) { return '<button type="button" class="lt-dap-o" data-k="' + k + '"><span class="lt-so">' + (k + 1) + '</span>' + (k ? '❌ Sai' : '✅ Đúng') + '</button>'; }).join('') + '</div>';
    } else {                                                   // xep
      var kh = c.khoi.map(function (t, k) { return { t: t, k: k }; }), tt;
      do { tt = tron1(kh); } while (kh.length > 1 && tt.map(function (o) { return o.t; }).join('') === c.khoi.join(''));
      x.kh = tt; x.dat = [];
      de = hoi;
      dap = '<div class="lt-xep-dong lnp-xep-dong ot-xep-dong"><span class="lt-xep-cho">Bấm các khối bên dưới theo thứ tự</span></div>' +
        '<div class="lt-xep-kho">' + tt.map(function (o, k) { return '<button type="button" class="lt-khoi ot-khoi" data-k="' + k + '"><span class="hanzi">' + esc(o.t) + '</span></button>'; }).join('') + '</div>' +
        '<div class="lnp-dau-hang"><span>Dấu câu:</span>' + DAU_CAU.map(function (d) { return '<button type="button" class="lnp-dau-nut ot-dau-nut" data-d="' + d + '" aria-label="Thêm dấu ' + d + '">' + d + '</button>'; }).join('') + '</div>' +
        '<div class="lt-nut-kq"><button type="button" class="btn ot-xep-xoa">Xếp lại</button><button type="button" class="btn solid ot-xep-kt" disabled>Kiểm tra</button></div>';
    }
    el.innerHTML = veBaiDoc() + '<div class="lnp-khung ot-khung"><div class="lt-vach lt-vach-bai"><i class="thuoc" style="width:' + (L.i / L.ds.length * 100) + '%"></i></div>' +
      '<div class="lt-de lnp-de">' + dau + de + '</div>' + dap + '<div class="lnp-giai" aria-live="polite"></div></div>';
    if (c.loa && c.dang === 'chon' && (c.anDe || c.hienSau || !c.de && !c.cau)) setTimeout(function () { var b = el.querySelector('.ot-khung .tv-loa'); if (b && L && L.ds[L.i] === x) TV.doc(c.loa, b); }, 350);
  }
  function veDongXep() {
    var x = L.ds[L.i], dong = el.querySelector('.ot-xep-dong');
    dong.innerHTML = x.dat.length ? x.dat.map(function (k, j) {
      return typeof k === 'string' ? '<button type="button" class="lnp-dau-tren ot-tren" data-j="' + j + '" aria-label="Bỏ dấu ' + k + '">' + k + '</button>'
        : '<button type="button" class="lt-khoi tren ot-tren" data-j="' + j + '"><span class="hanzi">' + esc(x.kh[k].t) + '</span></button>'; }).join('') : '<span class="lt-xep-cho">Bấm các khối bên dưới theo thứ tự</span>';
    el.querySelectorAll('.ot-khoi').forEach(function (b) { b.classList.toggle('da-dat', x.dat.indexOf(+b.dataset.k) >= 0); });
    var soKhoi = x.dat.filter(function (k) { return typeof k === 'number'; }).length;
    el.querySelector('.ot-xep-kt').disabled = soKhoi !== x.kh.length;
    el.querySelectorAll('.ot-dau-nut').forEach(function (b) { b.classList.toggle('nhac', soKhoi === x.kh.length && !x.dat.some(function (k) { return typeof k === 'string'; })); });
  }

  // ---------- chấm ----------
  function ghiKetQua(x, chon, dung) {
    var c = x.c, deBai = c.dang === 'xep' ? c.khoi.join(' / ') : [c.hoi, c.de, c.cau].filter(Boolean).join(' · ');
    var dapAn = c.dang === 'dungSai' ? (c.dung ? 'Đúng' : 'Sai') : c.dang === 'xep' ? c.dapXep[0] : c.dap;
    L.kq.push({ stt: L.i + 1, maCau: c.ma, dang: c.dang, nhom: c.nhom, tenNhom: tenNhom(c), deBai: deBai, dapAn: dapAn, chon: chon, dung: dung ? 1 : 0,
      giay: Math.round((Date.now() - x.t0) / 100) / 10, thuTu: (x.pa || (x.kh || []).map(function (o) { return o.t; })).join(' | ') });
    luuDo();
  }
  function hienGiai(dung) {
    var x = L.ds[L.i], c = x.c;
    el.querySelector('.lt-de').classList.add('xong');
    el.querySelectorAll('.ot-an').forEach(function (a) { a.classList.remove('ot-an'); });
    var cd = c.cauDung ? '<div class="lnp-cau-dung">' + TV.nutLoa(c.cauDung.replace(/ — /g, '')) + '<div><div class="hanzi">' + esc(c.cauDung) + '</div>' + (c.py ? '<div class="lnp-py">' + esc(c.py) + '</div>' : '') + '</div></div>' : '';
    var hs = c.hienSau ? '<div class="ot-hien-sau">' + c.hienSau.map(function (v) { return '<p><b class="hanzi">' + esc(v.ai) + '：</b><span class="hanzi">' + esc(v.han) + '</span><br><i>' + esc(v.py) + '</i></p>'; }).join('') + '</div>' : '';
    el.querySelector('.lnp-giai').innerHTML = '<div class="lnp-giai-o ' + (dung ? 'dung' : 'sai') + '">' +
      '<div class="lt-ket ' + (dung ? 'dung' : 'sai') + '">' + (dung ? '✓ Đúng rồi!' : x.chiSaiDau ? '✗ Thứ tự đúng rồi, nhưng dấu câu chưa đúng' : '✗ Chưa đúng') + '</div>' +
      (c.dang === 'dungSai' && !c.dung && c.sua ? '<div class="lnp-nhan-nho">Câu đúng:</div>' : '') + hs + cd +
      (c.giai ? '<p class="lnp-gt">' + dam(c.giai) + '</p>' : '') +
      (c.but ? '<div class="ot-but"><button type="button" class="ot-but-o" data-chu="' + esc(c.but) + '" aria-label="Xem thứ tự viết chữ ' + esc(c.but) + '"><span class="hanzi">' + esc(c.but) + '</span></button><span>Bấm vào chữ để xem lại thứ tự nét</span></div>' : '') +
      (c.dang === 'xep' && !dung ? '<p class="lnp-ban">Bạn xếp: <span class="hanzi">' + esc(x.cua || '—') + '</span></p><p class="lt-xep-note">Có câu xếp được nhiều cách; thấy câu mình cũng đúng thì hỏi cô nhé.</p>' : '') +
      '</div><div class="lt-nut-kq"><button type="button" class="btn solid ot-tiep">' + (L.i < L.ds.length - 1 ? 'Câu tiếp ›' : 'Xem kết quả') + '</button></div>';
    var b = el.querySelector('.ot-but-o'); if (b) veBut(b);
    var t = el.querySelector('.ot-tiep'); if (t) t.focus({ preventScroll: true });
    amThanh(dung ? 'dung' : 'sai');
    if (AM.bat && c.cauDung) setTimeout(function () { var l = el.querySelector('.lnp-cau-dung .tv-loa'); if (l && L && L.ds[L.i] === x) TV.doc(c.cauDung.replace(/ — /g, ''), l); }, 650);
    giuNut();
  }
  function traLoi(o) {
    var x = L.ds[L.i], c = x.c, wrap = o.parentNode; if (wrap.classList.contains('xong')) return;
    var chon = x.pa[+o.dataset.k], dung = c.dang === 'dungSai' ? (chon === 'Đúng') === !!c.dung : chon === c.dap;
    wrap.classList.add('xong');
    wrap.querySelectorAll('.lt-dap-o').forEach(function (b) {
      var p = x.pa[+b.dataset.k], laDung = c.dang === 'dungSai' ? (p === 'Đúng') === !!c.dung : p === c.dap;
      b.disabled = true; if (laDung) b.classList.add('dung'); else if (b === o) b.classList.add('sai');
    });
    ghiKetQua(x, chon, dung); hienGiai(dung);
  }
  function chuanCau(s) { return String(s).replace(/！$/, '。'); }
  function boDau(s) { return String(s).replace(/[，。？！]/g, ''); }
  function kiemTraXep() {
    var x = L.ds[L.i], c = x.c, cua = x.dat.map(function (k) { return typeof k === 'string' ? k : x.kh[k].t; }).join('');
    x.cua = cua;
    var dung = c.dapXep.some(function (t) { return chuanCau(cua) === chuanCau(t); });
    x.chiSaiDau = !dung && c.dapXep.some(function (t) { return boDau(cua) === boDau(t); });
    el.querySelectorAll('.ot-khoi, .ot-tren, .ot-xep-xoa, .ot-xep-kt, .ot-dau-nut').forEach(function (b) { b.disabled = true; });
    el.querySelector('.ot-xep-dong').classList.add(dung ? 'dung' : 'sai');
    ghiKetQua(x, cua, dung); hienGiai(dung);
  }

  // ---------- kết quả ----------
  function veKetQua() {
    var tong = L.kq.length, dung = L.kq.filter(function (k) { return k.dung; }).length, tl = tong ? Math.round(dung / tong * 100) : 0;
    L.giay = Math.round((Date.now() - L.luc) / 1000);
    var sai = {}, thu = [];
    L.kq.forEach(function (k) { if (k.dung) return; if (!sai[k.tenNhom]) { sai[k.tenNhom] = 0; thu.push(k.tenNhom); } sai[k.tenNhom]++; });
    var loi = tl === 100 ? 'Xuất sắc! Đúng hết rồi 🎉' : tl >= 80 ? 'Rất tốt! Xem lại vài câu còn sai là chắc 💪' : tl >= 50 ? 'Khá rồi, xem lại lời giải rồi làm thêm một lượt nhé 🌱' : 'Xem lại bài cũ rồi làm lượt nữa nhé 🌱';
    el.innerHTML = '<div class="lt-ket-qua card lnp-kq"><div class="lt-diem">' + tl + '%</div><p class="lt-loi">' + loi + '</p>' +
      '<p class="lt-goi-y">Đúng ' + dung + ' / ' + tong + ' câu · ⏱ ' + (L.giay >= 60 ? Math.floor(L.giay / 60) + ' phút ' : '') + (L.giay % 60) + ' giây</p>' +
      (PHAN === 'tong-hop' ? '<ul class="ot-theo-phan">' + PHAN_GOC.map(function (p) {
        var ds = L.kq.filter(function (k) { return k.nhom.split('/')[0] === p[0]; }); if (!ds.length) return '';
        var d = ds.filter(function (k) { return k.dung; }).length;
        return '<li class="' + (d === ds.length ? 'dung' : '') + '"><span>' + esc(p[1]) + '</span><b>' + d + ' / ' + ds.length + '</b></li>'; }).join('') + '</ul>' : '') +
      '<div class="ot-luu" aria-live="polite"></div>' +
      (thu.length ? '<div class="lt-nhan">Nội dung cần xem lại</div><ul class="lnp-ds-sai">' + thu.map(function (t) { return '<li><div class="lnp-ds-ten">' + tron(t) + '</div><div>Sai ' + sai[t] + ' câu</div></li>'; }).join('') + '</ul>' : '') +
      '<div class="lt-nut-kq"><button type="button" class="btn ot-xem-lai">📋 Xem lại bài</button>' + (PHAN === 'doc-hieu' ? '<button type="button" class="btn ot-bai-khac">Chọn bài đọc khác</button>' : '') +
      '<button type="button" class="btn solid ot-luot-moi">' + (PHAN === 'doc-hieu' ? 'Làm lại bài này' : 'Làm lượt mới') + '</button></div>' +
      '<div class="lt-xem-ct" hidden>' + L.kq.map(function (k) {
        return '<div class="lt-ct ' + (k.dung ? 'dung' : 'sai') + '"><b>' + k.stt + '.</b> ' + tron(k.deBai) + '<br>Đáp án: ' + tron(k.dapAn) + (k.dung ? ' ✓' : ' · Bạn chọn: ' + tron(k.chon || '—')) + '</div>';
      }).join('') + '</div></div>';
    amThanh(tl >= 80 ? 'xong' : 'xongVua');
    if (LD) LD.xoa(khoaLD(BAI_DOC));
    G.gui({ maLuot: L.ma, phan: PHAN + (BAI_DOC ? '-' + BAI_DOC.ma : ''), hoTen: L.hoTen, lop: L.lop, batDau: L.batDau, giay: L.giay, soCau: tong, soDung: dung,
      cau: L.kq.map(function (k) { var o = Object.assign({}, k); delete o.tenNhom; return o; }) }, el.querySelector('.ot-luu'), TEN);
    veDau();
  }

  // ---------- sự kiện ----------
  el.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('.tv-loa')) return;
    if (t.closest('.ot-am')) { AM.bat = !AM.bat; try { localStorage.setItem('qm-am-hieu-ung', AM.bat ? '1' : '0'); } catch (er) {} if (!AM.bat) TV.dungDoc();
      el.querySelectorAll('.ot-am').forEach(function (b) { b.outerHTML = nutAm(); }); amThanh('cham'); return; }
    if (t.closest('.ot-hien-py')) { var an = el.querySelector('.ot-van-py').hidden; el.querySelectorAll('.ot-van-py').forEach(function (p) { p.hidden = !an; }); t.closest('.ot-hien-py').textContent = an ? 'Ẩn pinyin' : 'Hiện pinyin'; return; }
    var lt = t.closest('.ot-ld-tiep'); if (lt) { luuHs(); if (khoiPhuc(lt.dataset.bai)) { amThanh('batDau'); veCau(); veDau(); } else veBatDau(); return; }
    var lb = t.closest('.ot-ld-bo'); if (lb) { var bb = lb.dataset.bai ? P.bai.filter(function (x) { return x.ma === lb.dataset.bai; })[0] : null; if (LD) LD.xoa(khoaLD(bb)); veBatDau(); return; }
    var cb = t.closest('.ot-chon-bai'); if (cb) { luuHs(); if (LD && LD.doc(khoaLD(P.bai[+cb.dataset.k])) && khoiPhuc(P.bai[+cb.dataset.k].ma)) { amThanh('batDau'); veCau(); veDau(); return; }
      BAI_DOC = P.bai[+cb.dataset.k]; dungLuot(); luuDo(); amThanh('batDau'); veCau(); veDau(); return; }
    if (t.closest('.ot-bat-dau')) { luuHs(); if (LD) LD.xoa(khoaLD()); dungLuot(); luuDo(); amThanh('batDau'); veCau(); veDau(); return; }
    var dn = t.closest('.ot-dau-nut'); if (dn && !dn.disabled) { L.ds[L.i].dat.push(dn.dataset.d); amThanh('dau'); return veDongXep(); }
    var o = t.closest('.lt-dap-o'); if (o) return traLoi(o);
    var k = t.closest('.ot-khoi'); if (k && !k.disabled) { var x = L.ds[L.i]; if (x.dat.indexOf(+k.dataset.k) < 0) { x.dat.push(+k.dataset.k); amThanh('cham'); veDongXep(); } return; }
    var tr = t.closest('.ot-tren'); if (tr && !tr.disabled) { L.ds[L.i].dat.splice(+tr.dataset.j, 1); amThanh('cham'); return veDongXep(); }
    if (t.closest('.ot-xep-xoa')) { L.ds[L.i].dat = []; return veDongXep(); }
    if (t.closest('.ot-xep-kt')) return kiemTraXep();
    if (t.closest('.ot-tiep')) { TV.dungDoc(); amThanh('cham'); if (L.i < L.ds.length - 1) { L.i++; var mo = el.querySelector('.ot-bai-doc'); var dangMo = !mo || mo.open; veCau(); var m2 = el.querySelector('.ot-bai-doc'); if (m2) m2.open = dangMo; veDau(); } else veKetQua(); return; }
    if (t.closest('.ot-xem-lai')) { var xc = el.querySelector('.lt-xem-ct'); xc.hidden = !xc.hidden; return; }
    if (t.closest('.ot-luot-moi')) { dungLuot(); luuDo(); veCau(); veDau(); return; }
    if (t.closest('.ot-bai-khac')) { BAI_DOC = null; veBatDau(); veDau(); return; }
  });
  document.addEventListener('keydown', function (e) {
    if (!L || /INPUT|TEXTAREA|SELECT/.test(e.target.tagName) || !el.querySelector('.ot-khung')) return;
    if (e.key === 'Enter') { var tp = el.querySelector('.ot-tiep'), kt = el.querySelector('.ot-xep-kt:not(:disabled)'); if (tp) { e.preventDefault(); tp.click(); } else if (kt) { e.preventDefault(); kiemTraXep(); } return; }
    var os = el.querySelectorAll('.lnp-dap:not(.xong) .lt-dap-o'), n = +e.key;
    if (n >= 1 && n <= os.length) { e.preventDefault(); traLoi(os[n - 1]); }
  });

  document.addEventListener('qm-luot-do-nap', function () { if (P && !el.querySelector('.ot-khung') && !el.querySelector('.lt-ket-qua')) veBatDau(); });

  // ---------- nạp dữ liệu ----------
  el.innerHTML = '<div class="tv-trong">Đang tải bài ôn tập…</div>';
  fetch(window.QM_OT_TEP).then(function (r) { if (!r.ok) throw r; return r.json(); }).then(function (d) {
    P = PHAN === 'tong-hop' ? tongHop(d) : d.phan[PHAN]; if (!P) throw new Error('Không có phần ' + PHAN);
    veBatDau();
  }).catch(function () { el.innerHTML = '<div class="tv-trong">Chưa tải được bài ôn tập, bạn kiểm tra mạng rồi thử lại nhé.</div>'; });
})();
