/* =========================================================
   TỪ VỰNG — PHẦN DÙNG CHUNG · Tiếng Trung Diệu Kỳ
   Tải dữ liệu 9 cấp + phát âm. Trang tra cứu (tu-vung.js) và trang luyện tập (luyen-tap.js) cùng dùng.
   Dữ liệu lấy từ Google Sheet (mỗi cấp một trang tính, đã "Xuất bản lên web" dạng CSV):
   dán link CSV của từng cấp vào NGUON. Cấp nào chưa có link thì đọc file data/tu-vung/cap-<cấp>.json.
   Nhúng TRƯỚC tu-vung.js / luyen-tap.js.
   ========================================================= */
(function () {
  var src = document.currentScript && document.currentScript.src || '';
  var ROOT = src.indexOf('assets/js/tu-vung-chung.js') >= 0 ? src.substring(0, src.indexOf('assets/js/tu-vung-chung.js')) : '';
  var NGUON = {
    '1': '', '2': '', '3': '', '4': '', '5': '', '6': '', '7-9': ''
  };
  // Trang bài học (Chương trình HSK) đặt TRƯỚC khi nhúng file này:
  //   window.QM_CAP = ['BAI']; window.QM_TEN_CAP = { BAI: 'Bài 1' }; window.QM_TEP = { BAI: '<đường dẫn>/data/bai/bai-1.json' };
  // để dùng kho từ riêng của bài thay cho 9 cấp. Không đặt thì chạy y như cũ.
  var CAP = window.QM_CAP || ['1', '2', '3', '4', '5', '6', '7-9', 'MR'];   // MR = Mở rộng (ngoài danh sách chuẩn, không phân cấp)
  var TEP = window.QM_TEP || {};                             // cấp → file JSON riêng (mảng từ, hoặc đối tượng có khoá "tu")
  var NHAN = { MR: 'Mở rộng', NK: 'Ngoài khung', TR: 'Tên riêng' };   // nhãn ngoài thang HSK (TR: tên nước… không có trong kho)
  function tenCap(c) { return (window.QM_TEN_CAP || {})[c] || NHAN[c] || 'HSK ' + c; }

  // ---------- Đọc CSV (hỗ trợ ô có xuống dòng, dấu phẩy, dấu ngoặc kép) ----------
  function docCSV(txt) {
    var rows = [], row = [], o = '', q = false;
    for (var i = 0; i < txt.length; i++) {
      var c = txt[i];
      if (q) {
        if (c === '"') { if (txt[i + 1] === '"') { o += '"'; i++; } else q = false; }
        else o += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(o); o = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && txt[i + 1] === '\n') i++;
        row.push(o); rows.push(row); row = []; o = '';
      } else o += c;
    }
    if (o || row.length) { row.push(o); rows.push(row); }
    var dau = rows.shift() || [];
    return rows.filter(function (r) { return r.join('').trim(); }).map(function (r) {
      var d = {}; dau.forEach(function (k, j) { d[k.trim()] = (r[j] || '').trim(); }); return d;
    });
  }

  function chuanHoa(r) {
    return {
      ma: r['Mã'], nhom: r['_nhom'] || '', han: r['Chữ Hán'], py: r['Pinyin'], hv: r['Âm Hán Việt'], loai: r['Từ loại'],
      doc: r['Đọc từ'] || '',
      nghia: r['Nghĩa tiếng Việt'], cap: r['Cấp HSK'], but: (r['Thuận bút'] || '').replace(/[^\u3400-\u9fff]/g, ''),
      cum: (r['Cụm từ'] || '').split(/\n+/).map(function (d) {
        var p = d.split('|').map(function (s) { return s.trim(); }); return { han: p[0], py: p[1] || '' };
      }).filter(function (c) { return c.han; }),
      cau: [[r['Câu 1'], r['Pinyin câu 1'], r['Nghĩa câu 1'], r['Đọc câu 1']], [r['Câu 2'], r['Pinyin câu 2'], r['Nghĩa câu 2'], r['Đọc câu 2']]]
        .filter(function (c) { return c[0]; }).map(function (c) { return { han: c[0], py: c[1] || '', viet: c[2] || '', doc: c[3] || '' }; })
    };
  }

  function esc(s) { return String(s || '').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // Phiên âm từ mục để hiển thị: dấu li hợp ∥ (phông chữ không có, hiện thành hai vạch xấu) vẽ bằng CSS (.py-lh);
  // dữ liệu gốc vẫn giữ ∥. Dùng cho mọi chỗ hiện phiên âm của TỪ (không dùng cho câu, cụm — ở đó không có ∥).
  function pyHtml(s) { return esc(s).replace(/\u2225/g, '<span class="py-lh" title="Từ li hợp: có thể tách ra, chen thành phần vào giữa" aria-hidden="true"></span>'); }
  function boDau(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/\s+/g, ''); }

  var KHO = {}, DL = {};                                     // DL: dữ liệu gốc của bài (bộ thủ, chữ ghép…) khi file là đối tượng
  function chuanBi(cap, d) { d.forEach(function (w, i) { w.cap = w.cap || cap; w._i = i; w._tim = boDau([w.han, w.py, w.nghia, w.hv].join(' ')); }); return d; }
  function taiCap(cap) {
    if (KHO[cap]) return Promise.resolve(KHO[cap]);
    var url = NGUON[cap];
    var nhung = (window.TU_VUNG_MAU || {})[cap];
    if (!url && nhung) return Promise.resolve(KHO[cap] = chuanBi(cap, nhung.map(chuanHoa)));
    if (Array.isArray(TEP[cap])) return Promise.all(TEP[cap].map(function (u) { return fetch(u).then(function (r) { if (!r.ok) throw r; return r.json(); }); }))
      .then(function (ds) {
        var gop = { tu: [], boThu: [], ghepChu: [], thanhPhan: {}, cauLuyen: [], tenRieng: [] };
        ds.forEach(function (d) { gop.tu = gop.tu.concat(d.tu || []); gop.boThu = gop.boThu.concat(d.boThu || []); gop.ghepChu = gop.ghepChu.concat(d.ghepChu || []); Object.assign(gop.thanhPhan, d.thanhPhan || {});
          gop.cauLuyen = gop.cauLuyen.concat(d.cauLuyen || []); gop.tenRieng = gop.tenRieng.concat(d.tenRieng || []); });
        DL[cap] = gop; return (KHO[cap] = chuanBi(cap, gop.tu.map(chuanHoa)));
      });
    if (TEP[cap]) return fetch(TEP[cap]).then(function (r) { if (!r.ok) throw r; return r.json(); })
      .then(function (d) { if (!Array.isArray(d)) DL[cap] = d; return (KHO[cap] = chuanBi(cap, (Array.isArray(d) ? d : d.tu).map(chuanHoa))); });
    if (!url) return fetch(ROOT + 'data/tu-vung/cap-' + cap + '.json').then(function (r) { if (!r.ok) throw r; return r.json(); })
      .then(function (d) { return (KHO[cap] = chuanBi(cap, d.map(chuanHoa))); });
    return fetch(url).then(function (r) { return r.text(); }).then(function (t) { return (KHO[cap] = chuanBi(cap, docCSV(t).map(chuanHoa))); });
  }
  // Cấu tạo chữ HSK 1–3 (data/tu-vung/cau-tao.json): { chu: {字: {k: kết cấu, p: [thành phần], cap}}, tp: {thành phần: {py, ten, nghia, ghiChu}} }
  var CT = null;
  function taiCauTao() {
    return CT || (CT = fetch(ROOT + 'data/tu-vung/cau-tao.json').then(function (r) { if (!r.ok) throw r; return r.json(); }).catch(function () { return { chu: {}, tp: {} }; }));
  }
  function taiTatCa() { return Promise.all(CAP.map(function (c) { return taiCap(c).catch(function () { return []; }); })); }

  // ---------- Phát âm ----------
  // Chỉ dùng giọng Phổ thông Đại lục (zh-CN). Không dùng giọng Hồng Kông (tiếng Quảng Đông) — đọc sai hoàn toàn.
  // Cột "Đọc từ" / "Đọc câu 1/2" (nếu có) là văn bản đưa cho máy đọc thay cho chữ Hán hiển thị:
  //   - chữ đa âm dễ bị đọc nhầm được thay bằng chữ đồng âm chỉ có 1 cách đọc (VD 干 gān → 肝);
  //   - hoặc là đường dẫn file ghi âm (.mp3/.m4a/.wav/.ogg) cho trường hợp máy không đọc chuẩn được (儿化…).
  var giong = null, giongDL = true;
  function chonGiong() {
    var v = window.speechSynthesis ? speechSynthesis.getVoices() : [];
    var cn = v.filter(function (x) { return /^(zh[-_]CN|cmn[-_]Hans|cmn[-_]CN)/i.test(x.lang); });
    var tot = /Xiaoxiao|Xiaoyi|Yunxi|Yunyang|Google|Tingting|Ting-Ting|Lili|Yaoyao/i;
    giong = cn.filter(function (x) { return tot.test(x.name); })[0] || cn[0] || null;
    giongDL = !!giong;
    if (!giong) giong = v.filter(function (x) { return /^(zh[-_]TW|cmn)/i.test(x.lang); })[0] || null;
  }
  if (window.speechSynthesis) { chonGiong(); speechSynthesis.onvoiceschanged = chonGiong; }
  var amDang = null;
  function laFileAm(t) { return /\.(mp3|m4a|wav|ogg)(\?.*)?$/i.test(t); }
  function dungDoc() { if (window.speechSynthesis) speechSynthesis.cancel(); if (amDang) { amDang.pause(); amDang = null; } }
  function doc(txt, nut) {
    dungDoc();
    if (laFileAm(txt)) {
      var a = amDang = new Audio(txt);
      if (nut) { nut.classList.add('dang-doc'); a.onended = a.onerror = function () { nut.classList.remove('dang-doc'); }; }
      a.play().catch(function () { if (nut) nut.classList.remove('dang-doc'); baoLoi('Chưa phát được file âm thanh.'); });
      return;
    }
    if (!window.speechSynthesis) return baoLoi('Trình duyệt này chưa hỗ trợ đọc. Bạn thử mở bằng Chrome nhé.');
    var u = new SpeechSynthesisUtterance(txt);
    u.lang = 'zh-CN'; if (giong) u.voice = giong; u.rate = txt.length > 4 ? 0.85 : 0.75;
    if (nut) { nut.classList.add('dang-doc'); u.onend = u.onerror = function () { nut.classList.remove('dang-doc'); }; }
    speechSynthesis.speak(u);
    if (!giongDL && speechSynthesis.getVoices().length) baoLoi('Máy chưa có giọng đọc tiếng Phổ thông (Trung Quốc đại lục), âm thanh có thể chưa chuẩn.');
  }
  function baoLoi(t) {
    var b = document.createElement('div'); b.className = 'tv-toast'; b.textContent = t;
    document.body.appendChild(b); setTimeout(function () { b.remove(); }, 3500);
  }
  var LOA = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
  // Từ/câu có 儿化: loa đọc bỏ 儿 (cột "Đọc" ít chữ 儿 hơn chữ hiển thị) → hiện ghi chú cong lưỡi
  function demNhi(t) { return (String(t || '').match(/儿/g) || []).length; }
  function coNhiHoa(han, docThay) { return !!docThay && docThay !== '-' && !laFileAm(docThay) && demNhi(han) > demNhi(docThay); }
  var GHI_NHI = '<p class="tv-nhi">Do hạn chế của máy đọc, loa đọc âm không có đuôi 儿化. Khi đọc, các bạn chú ý <b>cong lưỡi ở cuối âm</b> nhé.</p>';
  // Cột "Đọc" = "-": máy đọc chưa chuẩn, đang chờ thu âm → không hiện nút loa
  function choCapNhat(to) { return '<span class="tv-loa-cho' + (to ? ' to' : '') + '" title="Phát âm đang cập nhật">' + (to ? 'Phát âm đang cập nhật' : '') + '</span>'; }
  function nutLoa(txt, to, docThay) {
    if (docThay === '-') return choCapNhat(to); return '<button type="button" class="tv-loa' + (to ? ' to' : '') + '" data-doc="' + esc(docThay || txt) + '" aria-label="Nghe phát âm">' + LOA + '</button>'; }
  // Bấm nút loa ở bất kỳ đâu trên trang
  document.addEventListener('click', function (e) {
    var l = e.target.closest('.tv-loa'); if (l) { e.stopPropagation(); doc(l.dataset.doc, l); }
  }, true);

  // Máy có đọc được từ này không: file ghi âm thì luôn được; giọng máy thì cần giọng tiếng Trung
  // (danh sách giọng chưa tải xong thì tạm coi là có, tránh chặn nhầm)
  function coGiong(docThay) {
    if (docThay && laFileAm(docThay)) return true;
    if (!window.speechSynthesis) return false;
    var v = speechSynthesis.getVoices();
    return !v.length || v.some(function (x) { return /^(zh|cmn)/i.test(x.lang); });
  }

  window.QM_TV = {
    ROOT: ROOT, CAP: CAP, tenCap: tenCap, taiCap: taiCap, taiTatCa: taiTatCa, taiCauTao: taiCauTao, KHO: KHO, DL: DL,
    esc: esc, pyHtml: pyHtml, boDau: boDau, doc: doc, dungDoc: dungDoc, baoLoi: baoLoi, nutLoa: nutLoa,
    coNhiHoa: coNhiHoa, GHI_NHI: GHI_NHI, LOA: LOA, coGiong: coGiong
  };
})();
