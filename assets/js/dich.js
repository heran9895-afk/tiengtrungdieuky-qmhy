/* =========================================================
   ÔN TẬP TỔNG HỢP BÀI 1–5 — BÀI DỊCH VIỆT → TRUNG
   <div id="dich"></div>; window.QM_OT_TEP = data/bai/on-tap-1-5.json (khoá "dich" = bộ đề gốc).
   Bộ đề đang dùng: bản cô lưu mới nhất trên máy chủ điểm (GET ?action=baiDich); máy chủ lỗi thì dùng bộ đề gốc.
   Ba cách luyện: Dịch câu (bốc ngẫu nhiên soCauMoiLuot câu) · Dịch hội thoại · Dịch đoạn văn.
   Chấm: so bài gõ với đáp án chính + các cách dịch chấp nhận (bỏ khoảng trắng; 。 hay ！ cuối câu như nhau; bỏ dấu —).
   Không khớp: hiện đáp án, học sinh tự đánh giá "dịch đúng ý" / "dịch sai". Không tính điểm, không lên Bảng xếp hạng;
   bài làm từng câu gửi về Sheet (on-tap-gui.js, phan 'dich').
   🔒 Chế độ giáo viên: mật khẩu kiểm ở máy chủ (MAT_KHAU_GV, chưa đặt thì dùng MAT_KHAU) → sửa / thêm / xoá đề và đáp án,
   lưu thành bản mới (giữ lịch sử, khôi phục được).
   ========================================================= */
(function () {
  var el = document.getElementById('dich'), TV = window.QM_TV, G = window.QM_OTG; if (!el || !TV || !G) return;
  var esc = TV.esc, GOC = null, DE = null, NGUON = 'goc', L = null, CHE = 'cau', MK = '', SUA = null, KHOA_HS = 'qmhy:hoSo';
  var DAU = ['，', '。', '？', '！', '、', '：'];

  function docLS(k, md) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : md; } catch (e) { return md; } }
  function ghiLS(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function gon(s) { return String(s || '').replace(/\s+/g, ' ').trim(); }
  function tron1(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function tron(t) { return esc(t).replace(/[㐀-鿿〇，。？！：、“”—]+/g, function (m) { return '<span class="hanzi">' + m + '</span>'; }); }
  function sao(o) { return JSON.parse(JSON.stringify(o)); }
  function oGoiY(gy, nho) { return gy && gy.length ? '<p class="dc-goi-y' + (nho ? ' nho' : '') + '">💡 Dùng từ: ' + gy.map(function (w) { return '<b class="hanzi">' + esc(w) + '</b>'; }).join(' · ') + '</p>' : ''; }
  function tenViet(ai) { return (DE.tenViet || {})[ai] || ''; }
  function giuNut() {                                          // sau khi kiểm tra: kéo lời giải + nút Câu tiếp vào tầm nhìn (trên thanh cuối trang)
    function d() {
      var g = el.querySelector('.dc-khu-giai'), n = el.querySelector('.dc-tiep'); if (!g || !n) return;
      var sf = document.querySelector('.sf'), day = sf ? sf.getBoundingClientRect().top : innerHeight, h = document.querySelector('.sh-header'), tr = h ? Math.max(0, h.getBoundingClientRect().bottom) : 0;
      var du = n.getBoundingClientRect().bottom - (day - 10), conCho = g.getBoundingClientRect().top - tr - 8;
      if (du > 0) window.scrollBy(0, Math.min(du, Math.max(0, conCho)));
    }
    d(); setTimeout(d, 380);
  }
  function veDau() { var h = document.querySelector('.sh-header'), t = h ? Math.max(0, h.getBoundingClientRect().bottom) : 0, r = el.getBoundingClientRect(); window.scrollTo(0, Math.max(0, r.top + scrollY - t - 8)); }

  // ---------- chuẩn hoá để so đáp án ----------
  // Nhãn vai "A：", "B：" (đầu câu hoặc ngay sau dấu kết câu) không tính khi so đáp án
  function boVai(s) { return String(s || '').replace(/(^|[。？！，、\s—–-])\s*[A-ZＡ-Ｚ]\s*[：:]\s*/g, '$1'); }
  function chuan(s) { return boVai(String(s || '').replace(/\s+/g, '')).replace(/[—–-]+/g, '').replace(/！/g, '。').replace(/[“”"]/g, ''); }
  // Đáp án nhập theo từng vai ("A：…" một dòng, "B：…" dòng sau) là MỘT cách dịch, không phải hai cách dịch: gộp lại
  function gopVai(zh) {
    zh = (zh || []).map(function (z) { return String(z || '').trim(); }).filter(Boolean);
    if (zh.length < 2 || !zh.every(function (z) { return /^[A-ZＡ-Ｚ]\s*[：:]/.test(z); })) return zh;
    var kq = [], cur = '';
    zh.forEach(function (z) { if (/^[AＡ]\s*[：:]/.test(z) && cur) { kq.push(cur); cur = ''; } cur += boVai(z); });
    if (cur) kq.push(cur);
    return kq;
  }
  // Câu hỏi – đáp A/B trong phần Dịch câu (cô chốt 31/10/2026): 2 vế, mỗi vế một ô, chấm riêng từng vế, cả câu đúng khi đủ 2 vế.
  // Bộ đề lưu theo kiểu cũ (một ô đáp án có "——", hoặc từng dòng "A：…" / "B：…") được tách tự động.
  function tachVe(c) {
    if (c.ve && c.ve.length) return c;
    var zh = (c.zh || []).map(function (z) { return String(z || '').trim(); }).filter(Boolean), ph = [[], []];
    var nhan = zh.length > 1 && zh.every(function (z) { return /^[ABＡＢ]\s*[：:]/.test(z); });
    if (nhan) zh.forEach(function (z) { var k = /^[BＢ]/.test(z) ? 1 : 0, v = boVai(z); if (ph[k].indexOf(v) < 0) ph[k].push(v); });
    else if (zh.length && zh.every(function (z) { return z.indexOf('——') > 0; })) zh.forEach(function (z) { var t = z.split('——'); [0, 1].forEach(function (k) { var v = boVai((t[k] || '').trim()); if (v && ph[k].indexOf(v) < 0) ph[k].push(v); }); });
    else return c;
    if (!ph[0].length || !ph[1].length) return c;
    var vi = String(c.vi || ''), vv = vi.split(/\s+[—–]\s+/);
    if (vv.length !== 2) vv = vi.split(/\s+(?=[BＢ]\s*[:：])/);
    if (vv.length !== 2) vv = [vi, ''];
    vv = vv.map(function (x) { return x.replace(/^\s*[ABＡＢ]\s*[:：]\s*/, '').trim(); });
    c.ve = [0, 1].map(function (k) {
      var gy = (c.goiY || []).filter(function (w) { return ph[k][0].indexOf(w) >= 0; });
      return { vai: 'AB'[k], vi: vv[k], zh: ph[k], py: '', goiY: gy };
    });
    c.vi = vv.join(' — '); c.zh = [ph[0][0] + ph[1][0]]; c.py = ''; delete c.goiY;
    return c;
  }
  function chuanDe(de) {                                        // sửa dữ liệu đã lưu theo kiểu A / B mỗi dòng
    if (!de) return de;
    (de.cau || []).forEach(function (c) { tachVe(c); c.zh = gopVai(c.zh); });
    (de.hoiThoai || []).forEach(function (h) { h.luot.forEach(function (l) { l.zh = gopVai(l.zh); }); });
    (de.doanVan || []).forEach(function (d) { d.cau.forEach(function (l) { l.zh = gopVai(l.zh); }); });
    return de;
  }
  function khop(cua, ds) { var c = chuan(cua); return ds.some(function (a) { return chuan(a) === c; }); }
  function tachCau(s) { return (String(s || '').replace(/\s+/g, '').match(/[^。？！]+[。？！]?/g) || []).filter(function (x) { return x.replace(/[，、：]/g, ''); }); }
  function kiemGo(s) {                                            // trả về lời nhắc nếu bài gõ có vấn đề hình thức
    if (/[A-Za-zÀ-ỹ]/.test(s.replace(/[A-Za-z]：/g, ''))) return '⌨️ Bài dịch có <b>chữ cái Latinh</b>. Hãy bật <b>bộ gõ tiếng Trung (Pinyin)</b> rồi gõ chữ Hán.';
    if (/[,.?!:]/.test(s)) return '✗ Dấu câu phải là dấu tiếng Trung (，。？！：), không dùng dấu , . ? ! :';
    return '';
  }

  // ---------- nạp đề ----------
  function napDe() {
    return fetch(window.QM_OT_TEP).then(function (r) { if (!r.ok) throw r; return r.json(); }).then(function (d) {
      GOC = chuanDe(d.dich); DE = sao(GOC); NGUON = 'goc';
      if (!window.QM_API) return;
      var hoan = new Promise(function (_, tu) { setTimeout(function () { tu(new Error('het-gio')); }, 7000); });
      return Promise.race([fetch(window.QM_API + '?action=baiDich').then(function (r) { return r.json(); }), hoan]).then(function (s) {
        if (s && s.ok && s.deBai && Array.isArray(s.deBai.cau)) { DE = chuanDe(s.deBai); NGUON = 'may-chu'; if (!DE.tenViet) DE.tenViet = GOC.tenViet; }
      }).catch(function () {});
    });
  }

  // ---------- màn bắt đầu ----------
  // ---------- lượt làm dở (luot-do.js): lưu sau mỗi câu + chữ đang gõ; đăng nhập thì đồng bộ qua tài khoản ----------
  var LD = window.QM_LD, TIEN_TO = 'on-tap-1-5/dich-', HEN_LUU = null;
  function hoSo() { var h = window.QM_TK && QM_TK.hoSoDang && QM_TK.hoSoDang(); return h ? { hoTen: h.hoTen, lop: h.lop } : docLS(KHOA_HS, {}); }
  function khoaLD() { return TIEN_TO + (L.che === 'cau' ? 'cau' : L.nguonMa); }
  function luuDo() {
    if (!LD || !L) return;
    var n = L.kq.length; if (n >= L.ds.length) return;
    var o = el.querySelector('.dc-o'), ht = L.che === 'hoiThoai' ? nhapHT() : null;
    LD.luu(khoaLD(), { ten: 'Dịch · ' + L.ten, tom: L.ds[0].doan ? 'đang dịch đoạn văn' : ht ? 'đã kiểm tra ' + L.capXong.filter(Boolean).length + ' / ' + L.caps.length + ' cặp thoại' : 'câu ' + (n + 1) + ' / ' + L.ds.length,
      du: { che: L.che, nguonMa: L.nguonMa, ds: L.ds.map(function (x) { return x.ma; }), kq: L.kq, ma: L.ma, batDau: L.batDau,
        giay: Math.round((Date.now() - L.luc) / 1000), nhap: o && !o.disabled ? o.value : '', nhapHT: ht, capXong: ht ? L.capXong : null, tuDG: ht ? L.ds.map(function (x) { return x.tuDanhGia || ''; }) : null, ten: L.ten,
        nhapVe: Array.prototype.map.call(el.querySelectorAll('.dc-ve-o:not(:disabled)'), function (b) { return b.value; }) } });
  }
  function oLamTiep() {
    if (!LD) return '';
    return LD.tatCa(TIEN_TO).map(function (e) {
      return '<div class="ot-lam-tiep"><div>📌 Bạn còn lượt làm dở <b>' + esc((e.du && e.du.ten) || e.ten) + '</b>: <b>' + esc(e.tom) + '</b> · lưu ' + esc(LD.luc(e.t)) + '</div>' +
        '<div class="ot-lam-tiep-nut"><button type="button" class="btn solid dc-ld-tiep" data-khoa="' + esc(e.khoa) + '">▶ Làm tiếp</button>' +
        '<button type="button" class="btn dc-ld-bo" data-khoa="' + esc(e.khoa) + '">Bỏ lượt này</button></div></div>';
    }).join('');
  }
  function khoiPhuc(khoa) {
    var e = LD && LD.doc(khoa); if (!e || !e.du) return false;
    var d = e.du, ds = [];
    if (d.che === 'cau') {
      var theo = {}; DE.cau.forEach(function (c) { theo[c.ma] = c; });
      d.ds.forEach(function (m) { var c = theo[m]; ds.push(c ? { ma: c.ma, nhom: 'cau', vi: c.vi, zh: c.zh, py: c.py, ghiChu: c.ghiChu, goiY: c.goiY, ve: c.ve } : null); });
    } else if (d.che === 'hoiThoai') {
      var h = DE.hoiThoai.filter(function (x) { return x.ma === d.nguonMa; })[0];
      if (h && h.luot.length === d.ds.length) ds = h.luot.map(function (l, i) { return { ma: h.ma + '-' + (i + 1), nhom: h.ma, ai: l.ai, vi: l.vi, zh: l.zh, py: l.py, goiY: l.goiY, ht: h, i: i }; });
    } else {
      var dv = DE.doanVan.filter(function (x) { return x.ma === d.nguonMa; })[0];
      if (dv) ds = [{ ma: dv.ma, nhom: dv.ma, doan: dv, vi: dv.cau.map(function (c) { return c.vi; }).join(' '), zh: [], py: '' }];
    }
    if (!ds.length || ds.some(function (x) { return !x; }) || d.kq.length >= ds.length) {
      LD.xoa(khoa); TV.baoLoi('Bài dịch vừa được cô cập nhật nên lượt làm dở không dùng tiếp được. Bạn làm lượt mới nhé.'); return false;
    }
    var hs = hoSo(); CHE = d.che;
    L = { ds: ds, i: d.kq.length, kq: d.kq, ma: d.ma, luc: Date.now() - (d.giay || 0) * 1000, batDau: d.batDau, hoTen: gon(hs.hoTen), lop: gon(hs.lop),
      ten: d.ten, che: d.che, nguonMa: d.nguonMa };
    veCau(); veDau();
    var o = el.querySelector('.dc-o'); if (o && d.nhap) { o.value = d.nhap; el.querySelector('.dc-kt').disabled = false; }
    if (d.nhapVe && d.nhapVe.length) { el.querySelectorAll('.dc-ve-o').forEach(function (b) { b.value = d.nhapVe[+b.dataset.k] || ''; }); el.querySelector('.dc-kt').disabled = !d.nhapVe.some(function (v) { return v.trim(); }); }
    if (d.che === 'hoiThoai' && d.nhapHT) {
      L.ds.forEach(function (x, i) {
        var v = d.nhapHT[i], ds2 = Array.isArray(v) ? v : (x.cau.length > 1 ? tachCau(v) : [v || '']);   // bản lưu cũ: cả thoại một chuỗi
        x.cau.forEach(function (_, j) { var b = el.querySelector('.dc-ht-o[data-i="' + i + '"][data-j="' + j + '"]'); if (b) { b.value = ds2[j] || ''; if (b.value) { b.style.height = 'auto'; b.style.height = b.scrollHeight + 'px'; } } });
        if (d.tuDG) x.tuDanhGia = d.tuDG[i] || '';
      });
      (d.capXong || []).forEach(function (ok, c) { if (ok && c < L.caps.length) kiemCap(c, true); });
    }
    return true;
  }
  function veBatDau() {
    var hs = hoSo();
    el.innerHTML = '<div class="lnp-dau card"><div class="sec-kicker">翻译</div><h2 class="lnp-tieu-de">🌏 Dịch Việt → Trung</h2>' +
      '<p class="lnp-mo-ta">Gõ bản dịch bằng <b>chữ Hán</b>, có <b>dấu câu tiếng Trung</b>. Câu có <b>💡 Dùng từ</b> thì dịch bằng đúng các từ đó. Bấm <b>Kiểm tra</b> để so với đáp án; câu chưa khớp thì xem đáp án rồi tự đánh giá. Phần này không tính điểm.</p>' +
      '<div class="dc-che" role="group" aria-label="Chọn cách luyện">' +
        '<button type="button" data-che="cau"' + (CHE === 'cau' ? ' class="on"' : '') + '>✏️ Dịch câu</button>' +
        '<button type="button" data-che="hoiThoai"' + (CHE === 'hoiThoai' ? ' class="on"' : '') + '>💬 Dịch hội thoại</button>' +
        '<button type="button" data-che="doanVan"' + (CHE === 'doanVan' ? ' class="on"' : '') + '>📄 Dịch đoạn văn</button></div>' +
      oLamTiep() +
      '<div class="dc-mo-ta-che">' + moTaChe() + '</div>' +
      '<div class="lt-hs lnp-hs"><label>Họ tên đầy đủ<input type="text" class="dc-ten lt-hs-ten" autocomplete="name" placeholder="VD: Nguyễn Văn An" value="' + esc(hs.hoTen || '') + '"></label>' +
        '<label>Lớp<input type="text" class="dc-lop lt-hs-lop" placeholder="VD: HSK1-K3" value="' + esc(hs.lop || '') + '"></label>' +
        '<p class="lt-hs-ghi">Bài dịch từng câu được gửi về cho cô giáo để theo dõi và cải tiến bài học. Phần này không xếp hạng.</p>' +
        (LD ? '<p class="lt-hs-ghi ot-ghi-luu">💾 Bài đang dịch tự lưu sau mỗi câu (cả chữ đang gõ). Lần sau vào bấm <b>▶ Làm tiếp</b>' + (window.QM_TK && QM_TK.hoSoId && QM_TK.hoSoId() ? ' (cả trên máy khác, vì bạn đã đăng nhập)' : '; đăng nhập Google để làm tiếp được trên máy khác') + '.</p>' : '') + '</div>' +
      '</div><div class="dc-gv"><button type="button" class="btn dc-mo-gv">🔒 Chế độ giáo viên</button></div><div class="dc-khu-gv"></div>';
  }
  function moTaChe() {
    if (CHE === 'cau') return '<p class="lnp-mo-ta">Mỗi lượt <b>' + Math.min(DE.soCauMoiLuot || 20, DE.cau.length) + ' câu</b> bốc ngẫu nhiên trong ' + DE.cau.length + ' câu, lượt sau đổi câu.</p>' +
      '<div class="lt-nut-kq"><button type="button" class="btn solid dc-bat-dau">Bắt đầu ›</button></div>';
    var ds = DE[CHE] || [];
    return '<div class="dc-chon">' + ds.map(function (h, k) {
      var so = CHE === 'hoiThoai' ? h.luot.length + ' thoại' : h.cau.length + ' câu';
      return '<button type="button" class="ot-chon-bai dc-chon-bai" data-k="' + k + '"><b>' + esc(h.ten) + '</b><span>' + so + '</span></button>'; }).join('') + '</div>';
  }
  function luuHs() { var t = el.querySelector('.dc-ten'), l = el.querySelector('.dc-lop'); if (t) ghiLS(KHOA_HS, Object.assign({}, docLS(KHOA_HS, {}), { hoTen: gon(t.value), lop: gon(l.value) })); }

  // ---------- dựng lượt ----------
  function batDau(k) {
    luuHs();
    var hs = hoSo(), ds = [];
    if (CHE === 'cau') ds = tron1(DE.cau).slice(0, DE.soCauMoiLuot || 20).map(function (c) { return { ma: c.ma, nhom: 'cau', vi: c.vi, zh: c.zh, py: c.py, ghiChu: c.ghiChu, goiY: c.goiY, ve: c.ve }; });
    else if (CHE === 'hoiThoai') { var h = DE.hoiThoai[k]; ds = h.luot.map(function (l, i) { return { ma: h.ma + '-' + (i + 1), nhom: h.ma, ai: l.ai, vi: l.vi, zh: l.zh, py: l.py, goiY: l.goiY, ht: h, i: i }; }); }
    else { var d = DE.doanVan[k]; ds = [{ ma: d.ma, nhom: d.ma, doan: d, vi: d.cau.map(function (c) { return c.vi; }).join(' '), zh: [], py: '' }]; }
    L = { ds: ds, i: 0, kq: [], ma: G.maLuot(), luc: Date.now(), batDau: new Date().toISOString(), hoTen: gon(hs.hoTen), lop: gon(hs.lop),
      ten: CHE === 'cau' ? 'Dịch câu' : (CHE === 'hoiThoai' ? DE.hoiThoai[k].ten : DE.doanVan[k].ten),
      che: CHE, nguonMa: CHE === 'cau' ? '' : (CHE === 'hoiThoai' ? DE.hoiThoai[k].ma : DE.doanVan[k].ma) };
    if (LD) LD.xoa(khoaLD());
    veCau(); veDau(); luuDo();
  }

  // ---------- vẽ một câu ----------
  // ---------- DẠNG HỘI THOẠI: cả đoạn trên một màn, mỗi thoại (A, B…) một ô dịch, chấm riêng từng thoại ----------
  var CHU_VAI = 'ABCDEFGH', O_CUOI = null;
  // Chia hội thoại thành từng cặp thoại A – B theo thứ tự, kể cả bài có hơn 2 người nói: thoại sau là B của cặp nếu do người khác nói;
  // hai thoại liền nhau cùng một người nói thì thoại trước đứng riêng (chỉ có A). Trả về ['A','B','A',…]
  function chiaCap(ds) {
    var v = [];
    for (var i = 0; i < ds.length; i++) {
      if (v[i - 1] === 'A' && ds[i].ai !== ds[i - 1].ai) v.push('B'); else v.push('A');
    }
    return v;
  }
  function vaiThoai(i) { return chiaCap(L.ds)[i]; }
  function tachVi(s) { return (String(s || '').match(/[^.!?。！？]+[.!?。！？…"”]*/g) || []).map(function (x) { return x.trim(); }).filter(function (x) { return /[^\s.!?。！？…"”]/.test(x); }); }
  // Thoại có nhiều câu (VD 不客气。大家好！请大家坐！) chia thành từng câu nhỏ, mỗi câu một ô; không chia được khớp (số câu Việt ≠ số câu Trung) thì để nguyên một ô
  function tachThoai(x) {
    var vi = tachVi(x.vi), z0 = tachCau(x.zh[0] || '');
    if (vi.length < 2 || vi.length !== z0.length) return [{ vi: x.vi, zh: x.zh, py: x.py, goiY: x.goiY }];
    var py = tachVi(x.py); if (py.length !== vi.length) py = [];
    var cau = vi.map(function (v, j) {
      var alts = []; x.zh.forEach(function (a) { var ac = tachCau(a); if (ac.length === vi.length && alts.indexOf(ac[j]) < 0) alts.push(ac[j]); });
      return { vi: v, zh: alts, py: py[j] || '', goiY: (x.goiY || []).filter(function (w) { return alts.some(function (a) { return a.indexOf(w) >= 0; }); }) };
    });
    (x.goiY || []).forEach(function (w) { if (!cau.some(function (c) { return c.goiY.indexOf(w) >= 0; })) cau[0].goiY.push(w); });
    return cau;
  }
  function nhapHT() { return L.ds.map(function (x, i) { return x.cau.map(function (_, j) { var b = el.querySelector('.dc-ht-o[data-i="' + i + '"][data-j="' + j + '"]'); return b ? b.value : ''; }); }); }
  function oCap(c) { return el.querySelector('.dc-ht-cap[data-c="' + c + '"]'); }
  function veHoiThoai() {
    var t0 = Date.now(), vai = chiaCap(L.ds), caps = [];
    L.ds.forEach(function (x, i) { x.t0 = t0; x.cau = tachThoai(x); x.tuDanhGia = ''; x.daKiem = false; if (vai[i] === 'A' || !caps.length) caps.push([]); caps[caps.length - 1].push(i); });
    L.caps = caps; L.capXong = caps.map(function () { return false; }); L.nhacCap = [];
    el.innerHTML = '<div class="lnp-khung dc-ht"><div class="dc-de"><div class="lnp-hang"><span class="lnp-ten-dang">💬 ' + esc(L.ten) + '</span><span class="lt-dem">' + L.ds.length + ' thoại · ' + caps.length + ' cặp</span></div>' +
      '<p class="lnp-dd">Hội thoại chia thành từng cặp thoại <b>A – B</b>. Mỗi câu một ô: gõ bản dịch vào ô bên cạnh câu đó. Dịch xong một cặp thì bấm <b>Kiểm tra cặp</b> ngay dưới cặp đó.</p>' +
      caps.map(function (cap, c) {
        return '<div class="dc-ht-cap" data-c="' + c + '"><div class="dc-ht-cap-ten">Cặp thoại ' + (c + 1) + '</div>' +
          cap.map(function (i) {
            var x = L.ds[i], v = vai[i], ten = '<span class="hanzi">' + esc(x.ai) + '</span>' + (tenViet(x.ai) ? ' (' + esc(tenViet(x.ai)) + ')' : '');
            return '<div class="dc-ht-dong" data-i="' + i + '"><div class="dc-ht-ai">' + ten + (x.cau.length > 1 ? ' · ' + x.cau.length + ' câu' : '') + '</div>' +
              x.cau.map(function (cc, j) {
                return '<div class="dc-ve dc-ht-hang"><div class="dc-ve-de"><span class="dc-ht-vai v' + (v === 'B' ? 1 : 0) + (j ? ' an' : '') + '"' + (j ? ' aria-hidden="true"' : '') + '>' + v + '</span><div><div class="dc-ht-vi">' + esc(cc.vi) + '</div>' + oGoiY(cc.goiY, true) + '</div></div>' +
                  '<div class="dc-ve-o-hop"><textarea class="dc-ht-o" data-i="' + i + '" data-j="' + j + '" data-c="' + c + '" rows="1" lang="zh-CN" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Bản dịch ' + (x.cau.length > 1 ? 'câu ' + (j + 1) + ' – ' : '') + 'thoại ' + v + '"></textarea>' +
                  '<p class="dc-bao dc-ht-bao" aria-live="polite"></p><div class="dc-ht-giai" aria-live="polite"></div></div></div>';
              }).join('') + '<div class="dc-ht-kq-thoai" data-i="' + i + '" aria-live="polite"></div></div>';
          }).join('') +
          '<p class="dc-bao dc-cap-bao" aria-live="polite"></p><div class="lt-nut-kq dc-cap-nut"><button type="button" class="btn solid dc-cap-kt" data-c="' + c + '">Kiểm tra cặp ' + (c + 1) + '</button></div></div>';
      }).join('') +
      '<div class="dc-dau dc-ht-dau-cau"><span>Dấu câu:</span>' + DAU.map(function (d) { return '<button type="button" data-d="' + d + '" aria-label="Thêm dấu ' + d + '">' + d + '</button>'; }).join('') + '</div>' +
      '<div class="lt-nut-kq dc-ht-nut"></div></div></div>';
    capNhatTong();
  }
  function giaiCauHT(cc, cua, ok, mot) {                       // lời giải một ô (một câu trong thoại)
    var ten = mot ? 'Thoại' : 'Câu';
    return '<div class="dc-giai' + (ok ? '' : ' sai') + '"><div class="lt-ket ' + (ok ? 'dung' : 'sai') + '">' + (ok ? '✓ Khớp đáp án' : cua ? '✗ Chưa khớp đáp án' : '✗ ' + ten + ' bỏ trống') + '</div>' +
      (ok ? '' : '<div class="dc-dap">' + TV.nutLoa(chuan(cc.zh[0])) + '<div><div class="hanzi">' + esc(cc.zh[0]) + '</div>' + (cc.py ? '<div class="dc-py">' + esc(cc.py) + '</div>' : '') + '</div></div>' +
        (cc.zh.length > 1 ? '<div class="dc-khac">Cũng đúng: ' + cc.zh.slice(1).map(tron).join(' · ') + '</div>' : '')) + '</div>';
  }
  function kiemCap(c, tuDong) {
    var hop = oCap(c), o = hop.querySelectorAll('.dc-ht-o'), bao = hop.querySelector('.dc-cap-bao'), loi = false, trong = 0;
    if (!tuDong) {
      o.forEach(function (b) { var v = b.value.trim(), nh = v ? kiemGo(v) : ''; b.parentNode.querySelector('.dc-ht-bao').innerHTML = nh; if (nh) loi = true; if (!v) trong++; });
      if (loi) { bao.innerHTML = 'Sửa các ô có nhắc đỏ rồi bấm Kiểm tra lại.'; return; }
      if (trong && !L.nhacCap[c]) { L.nhacCap[c] = true; bao.innerHTML = 'Còn <b>' + trong + ' ô</b> chưa dịch. Bấm <b>Kiểm tra</b> lần nữa nếu vẫn muốn nộp (ô bỏ trống tính sai).'; return; }
    }
    bao.innerHTML = '';
    var khopN = 0;
    L.caps[c].forEach(function (i) {
      var x = L.ds[i], cuaCau = [], okCau = [];
      x.cau.forEach(function (cc, j) {
        var b = hop.querySelector('.dc-ht-o[data-i="' + i + '"][data-j="' + j + '"]'), cua = b.value.trim(), ok = !!cua && khop(cua, cc.zh);
        b.disabled = true; b.classList.add(ok ? 'dung' : 'sai'); cuaCau.push(cua); okCau.push(ok);
        b.parentNode.querySelector('.dc-ht-giai').innerHTML = giaiCauHT(cc, cua, ok, x.cau.length === 1);
      });
      x.cua = cuaCau.some(Boolean) ? cuaCau.map(function (s) { return s || '(bỏ trống)'; }).join(x.cau.length > 1 ? ' ' : '') : '';
      x.soKhop = okCau.filter(Boolean).length; x.khop = x.soKhop === x.cau.length; x.daKiem = true; if (x.khop) khopN++;
      var canTu = !x.khop && !!x.cua, tu = x.tuDanhGia;
      hop.querySelector('.dc-ht-kq-thoai[data-i="' + i + '"]').innerHTML = (x.cau.length > 1 || canTu ? '<div class="dc-giai' + (x.khop ? '' : ' sai') + '">' +
        (x.cau.length > 1 ? '<div class="lt-ket ' + (x.khop ? 'dung' : 'sai') + '">' + (x.khop ? '✓ Cả thoại ' + vaiThoai(i) + ' khớp đáp án' : 'Thoại ' + vaiThoai(i) + ': khớp ' + x.soKhop + ' / ' + x.cau.length + ' câu. Thoại đúng khi đủ cả ' + x.cau.length + ' câu.') + '</div>' : '') +
        (canTu ? '<p class="lnp-dd">Có câu dịch được nhiều cách. Bạn so với đáp án rồi tự đánh giá thoại ' + vaiThoai(i) + ' này nhé:</p><div class="dc-tu dc-ht-tu" data-i="' + i + '">' +
          ['dung', 'sai'].map(function (v) { return '<button type="button" class="btn dc-tu-chon' + (tu === v ? ' on' : '') + '" data-v="' + v + '"' + (tu ? ' disabled' : '') + '>' + (v === 'dung' ? '✓ Em dịch đúng ý' : '✗ Em dịch sai') + '</button>'; }).join('') + '</div>' : '') + '</div>' : '');
    });
    hop.querySelector('.dc-cap-nut').innerHTML = '<p class="lt-ket ' + (khopN === L.caps[c].length ? 'dung' : 'sai') + '">Cặp ' + (c + 1) + ': khớp ' + khopN + ' / ' + L.caps[c].length + ' thoại</p>';
    L.capXong[c] = true; capNhatTong();
    if (!tuDong) {
      luuDo();
      var sau = el.querySelector('.dc-ht-o:not(:disabled)'); if (sau) sau.focus({ preventScroll: true });
    }
  }
  function capNhatTong() {
    var n = L.caps.length, xong = L.capXong.filter(Boolean).length, nut = el.querySelector('.dc-ht-nut'); if (!nut) return;
    var con = L.ds.filter(function (x) { return x.daKiem && !x.khop && x.cua && !x.tuDanhGia; }).length;
    el.querySelector('.dc-ht-dau-cau').hidden = xong === n;
    if (xong < n) { nut.innerHTML = '<p class="lnp-dd">Đã kiểm tra <b>' + xong + ' / ' + n + '</b> cặp thoại.</p>'; return; }
    var khopN = L.ds.filter(function (x) { return x.khop; }).length;
    nut.innerHTML = '<p class="lt-ket ' + (khopN === L.ds.length ? 'dung' : 'sai') + '">Cả bài: khớp đáp án ' + khopN + ' / ' + L.ds.length + ' thoại.</p>' +
      (con ? '<p class="lnp-dd dc-ht-con">Còn <b>' + con + '</b> thoại chưa tự đánh giá.</p>' : '') +
      '<button type="button" class="btn solid dc-ht-xong"' + (con ? ' disabled' : '') + '>Xem kết quả</button>';
  }
  function xongHT() {
    L.kq = L.ds.map(function (x, i) {
      return { stt: i + 1, maCau: x.ma, dang: 'dich', nhom: x.nhom, deBai: vaiThoai(i) + ' (' + x.ai + '): ' + x.vi, dapAn: x.zh[0],
        chon: x.cua || '(bỏ trống)', dung: x.khop ? 1 : 0, tuDanhGia: x.tuDanhGia || '', giay: Math.round((Date.now() - x.t0) / 100) / 10,
        thuTu: x.cau && x.cau.length > 1 ? 'khớp ' + x.soKhop + '/' + x.cau.length + ' câu' : '' };
    });
    veKetQua();
  }

  function veCau() {
    if (L.che === 'hoiThoai') return veHoiThoai();
    var x = L.ds[L.i]; x.t0 = Date.now();
    var truoc = '';
    el.innerHTML = '<div class="lnp-khung"><div class="lt-vach lt-vach-bai"><i class="thuoc" style="width:' + (L.i / L.ds.length * 100) + '%"></i></div>' +
      '<div class="dc-de"><div class="lnp-hang"><span class="lnp-ten-dang">🌏 ' + esc(L.ten) + '</span><span class="lt-dem">' + (L.i + 1) + ' / ' + L.ds.length + '</span></div>' + truoc +
        (x.ai ? '<div class="dc-ai"><span class="hanzi">' + esc(x.ai) + '</span>' + (tenViet(x.ai) ? ' (' + esc(tenViet(x.ai)) + ')' : '') + ' nói:</div>' : '') +
        (x.ve ? '<div class="dc-ve-ds">' + x.ve.map(function (v, k) {
            return '<div class="dc-ve" data-k="' + k + '"><div class="dc-ve-de"><span class="dc-ht-vai v' + k + '">' + v.vai + '</span><div><div class="dc-ht-vi">' + esc(v.vi) + '</div>' + oGoiY(v.goiY, true) + '</div></div>' +
              '<div class="dc-ve-o-hop"><textarea class="dc-ve-o dc-ht-o" data-k="' + k + '" rows="1" lang="zh-CN" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Bản dịch vế ' + v.vai + '"></textarea>' +
              '<p class="dc-bao dc-ve-bao" aria-live="polite"></p><div class="dc-ve-giai" aria-live="polite"></div></div></div>'; }).join('') + '</div>' :
        x.doan ? '<div class="dc-vi dai">' + x.doan.cau.map(function (c) { return esc(c.vi) + (c.goiY && c.goiY.length ? ' <span class="dc-goi-y-chen">(💡 ' + c.goiY.map(function (w) { return '<b class="hanzi">' + esc(w) + '</b>'; }).join(', ') + ')</span>' : ''); }).join(' ') + '</div>'
          : '<div class="dc-vi">' + esc(x.vi) + '</div>' + oGoiY(x.goiY)) +
        (x.ghiChu ? '<p class="lnp-dd">' + tron(x.ghiChu) + '</p>' : '') +
        (x.ve ? '' : '<textarea class="dc-o' + (x.doan ? ' dai' : '') + '" lang="zh-CN" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Gõ bản dịch bằng chữ Hán, có dấu câu"></textarea>') +
        '<div class="dc-dau">' + DAU.map(function (d) { return '<button type="button" data-d="' + d + '" aria-label="Thêm dấu ' + d + '">' + d + '</button>'; }).join('') + '</div>' +
        '<p class="dc-bao" aria-live="polite"></p>' +
        '<div class="lt-nut-kq"><button type="button" class="btn dc-bo-qua">Không biết, xem đáp án</button><button type="button" class="btn solid dc-kt" disabled>Kiểm tra</button></div></div>' +
      '<div class="dc-khu-giai" aria-live="polite"></div></div>';
  }
  function kiemTraVe(boQua) {
    var x = L.ds[L.i], o = el.querySelectorAll('.dc-ve-o'), loi = false, coChu = false, bao = el.querySelector('.dc-bao');
    if (!boQua) {
      o.forEach(function (b) { var v = b.value.trim(), nh = v ? kiemGo(v) : ''; b.parentNode.querySelector('.dc-ve-bao').innerHTML = nh; if (nh) loi = true; if (v) coChu = true; });
      if (loi || !coChu) return;
      var trong = Array.prototype.filter.call(o, function (b) { return !b.value.trim(); }).length;
      if (trong && !x.daNhacTrong) { x.daNhacTrong = true; bao.innerHTML = 'Còn ' + trong + ' vế chưa dịch. Bấm <b>Kiểm tra</b> lần nữa nếu vẫn muốn nộp (vế bỏ trống tính sai).'; return; }
    }
    bao.innerHTML = '';
    el.querySelectorAll('.dc-dau button, .dc-kt, .dc-bo-qua').forEach(function (b) { b.disabled = true; });
    var cuaVe = [], khopVe = [];
    x.ve.forEach(function (v, k) {
      var b = o[k], cua = boQua ? '' : b.value.trim(), ok = !!cua && khop(cua, v.zh);
      b.disabled = true; if (!boQua) b.classList.add(ok ? 'dung' : 'sai');
      cuaVe.push(cua); khopVe.push(ok);
      b.parentNode.querySelector('.dc-ve-giai').innerHTML = '<div class="dc-giai' + (ok ? '' : ' sai') + '"><div class="lt-ket ' + (ok ? 'dung' : 'sai') + '">' + (ok ? '✓ Vế ' + v.vai + ' khớp đáp án' : boQua ? 'Đáp án vế ' + v.vai + ':' : (cua ? '✗ Vế ' + v.vai + ' chưa khớp đáp án' : '✗ Vế ' + v.vai + ' bỏ trống')) + '</div>' +
        (ok ? '' : '<div class="dc-dap">' + TV.nutLoa(chuan(v.zh[0])) + '<div><div class="hanzi">' + esc(v.zh[0]) + '</div>' + (v.py ? '<div class="dc-py">' + esc(v.py) + '</div>' : '') + '</div></div>' +
          (v.zh.length > 1 ? '<div class="dc-khac">Cũng đúng: ' + v.zh.slice(1).map(tron).join(' · ') + '</div>' : '')) + '</div>';
    });
    x.cua = cuaVe.some(Boolean) ? cuaVe.map(function (c, k) { return x.ve[k].vai + '：' + (c || '(bỏ trống)'); }).join(' | ') : '';
    x.khop = khopVe.every(Boolean); x.soKhop = khopVe.filter(Boolean).length;
    var canTu = !x.khop && cuaVe.some(Boolean);
    el.querySelector('.dc-khu-giai').innerHTML = '<div class="dc-giai' + (x.khop ? '' : ' sai') + '"><div class="lt-ket ' + (x.khop ? 'dung' : 'sai') + '">' +
      (x.khop ? '✓ Cả câu khớp đáp án!' : boQua ? 'Đáp án từng vế ở trên.' : 'Khớp ' + x.soKhop + ' / ' + x.ve.length + ' vế. Cả câu đúng khi đủ cả hai vế.') + '</div>' +
      (canTu ? '<p class="lnp-dd">Có câu dịch được nhiều cách. Bạn so kỹ đáp án từng vế rồi tự đánh giá cả câu nhé (chọn xong mới sang câu tiếp):</p><div class="dc-tu"><button type="button" class="btn dc-tu-chon" data-v="dung">✓ Em dịch đúng ý</button><button type="button" class="btn dc-tu-chon" data-v="sai">✗ Em dịch sai</button></div>' : '') +
      '</div><div class="lt-nut-kq"><button type="button" class="btn solid dc-tiep"' + (canTu ? ' disabled' : '') + '>' + (L.i < L.ds.length - 1 ? 'Câu tiếp ›' : 'Xem kết quả') + '</button></div>';
    giuNut();
    x.tuDanhGia = '';
    if (!canTu) ghi(x);
  }
  function kiemTra(boQua) {
    if (L.ds[L.i].ve) return kiemTraVe(boQua);
    var x = L.ds[L.i], o = el.querySelector('.dc-o'), cua = boQua ? '' : o.value.trim(), bao = el.querySelector('.dc-bao');
    if (!boQua) { var nhac = kiemGo(cua); if (nhac) { bao.innerHTML = nhac; return; } if (!cua) return; }
    o.disabled = true; el.querySelectorAll('.dc-dau button, .dc-kt, .dc-bo-qua').forEach(function (b) { b.disabled = true; });
    x.cua = cua;
    var giai = '';
    if (x.doan) {
      var cuaCau = tachCau(cua), dung = 0;
      giai = '<table class="dc-bang"><tbody>' + x.doan.cau.map(function (c, i) {
        var bai = cuaCau[i] || '', ok = !!bai && khop(bai, c.zh); if (ok) dung++;
        return '<tr><td>' + (ok ? '✅' : '🔸') + '</td><td><div>' + esc(c.vi) + '</div><div class="hanzi">' + esc(c.zh[0]) + '</div><div class="dc-py">' + esc(c.py || '') + '</div>' +
          (c.zh.length > 1 ? '<div class="dc-khac">Cũng đúng: ' + c.zh.slice(1).map(tron).join(' · ') + '</div>' : '') +
          (!ok && bai ? '<div class="dc-cua">Bạn dịch: ' + tron(bai) + '</div>' : '') + '</td></tr>';
      }).join('') + '</tbody></table>';
      x.khop = dung === x.doan.cau.length; x.soKhop = dung;
      giai = '<div class="dc-giai' + (x.khop ? '' : ' sai') + '"><div class="lt-ket ' + (x.khop ? 'dung' : 'sai') + '">' + (x.khop ? '✓ Khớp đáp án cả đoạn!' : 'Khớp ' + dung + ' / ' + x.doan.cau.length + ' câu. Xem đáp án từng câu:') + '</div>' + giai;
    } else {
      x.khop = !!cua && khop(cua, x.zh);
      giai = '<div class="dc-giai' + (x.khop ? '' : ' sai') + '"><div class="lt-ket ' + (x.khop ? 'dung' : 'sai') + '">' + (x.khop ? '✓ Khớp đáp án!' : boQua ? 'Đáp án:' : 'Chưa khớp đáp án. So bài của bạn với đáp án:') + '</div>' +
        '<div class="dc-dap">' + TV.nutLoa(chuan(x.zh[0])) + '<div><div class="hanzi">' + esc(x.zh[0]) + '</div>' + (x.py ? '<div class="dc-py">' + esc(x.py) + '</div>' : '') + '</div></div>' +
        (x.zh.length > 1 ? '<div class="dc-khac">Cũng đúng: ' + x.zh.slice(1).map(tron).join(' · ') + '</div>' : '') +
        (!x.khop && cua ? '<div class="dc-cua">Bạn dịch: ' + tron(cua) + '</div>' : '');
    }
    var canTu = !x.khop && cua;
    giai += (canTu ? '<p class="lnp-dd">Có câu dịch được nhiều cách. Bạn so kỹ rồi tự đánh giá nhé (chọn xong mới sang câu tiếp):</p><div class="dc-tu"><button type="button" class="btn dc-tu-chon" data-v="dung">✓ Em dịch đúng ý</button><button type="button" class="btn dc-tu-chon" data-v="sai">✗ Em dịch sai</button></div>' : '') +
      '</div><div class="lt-nut-kq"><button type="button" class="btn solid dc-tiep"' + (canTu ? ' disabled' : '') + '>' + (L.i < L.ds.length - 1 ? 'Câu tiếp ›' : 'Xem kết quả') + '</button></div>';
    el.querySelector('.dc-khu-giai').innerHTML = giai;
    giuNut();
    x.tuDanhGia = '';
    if (!canTu) ghi(x);
  }
  function ghi(x) {
    L.kq.push({ stt: L.i + 1, maCau: x.ma, dang: 'dich', nhom: x.nhom, deBai: x.ve ? x.ve.map(function (v) { return v.vai + ': ' + v.vi; }).join(' | ') : x.vi,
      dapAn: x.ve ? x.ve.map(function (v) { return v.vai + '：' + v.zh[0]; }).join(' | ') : x.doan ? x.doan.cau.map(function (c) { return c.zh[0]; }).join('') : x.zh[0],
      chon: x.cua || '(bỏ qua)', dung: x.khop ? 1 : 0, tuDanhGia: x.tuDanhGia || '', giay: Math.round((Date.now() - x.t0) / 100) / 10,
      thuTu: x.doan ? 'khớp ' + x.soKhop + '/' + x.doan.cau.length : x.ve ? 'khớp ' + x.soKhop + '/' + x.ve.length + ' vế' : '' });
    luuDo();
  }

  // ---------- kết quả ----------
  function veKetQua() {
    var tong = L.kq.length, khop = L.kq.filter(function (k) { return k.dung; }).length, dungY = L.kq.filter(function (k) { return k.dung || k.tuDanhGia === 'dung'; }).length;
    L.giay = Math.round((Date.now() - L.luc) / 1000);
    el.innerHTML = '<div class="lt-ket-qua card lnp-kq"><div class="lt-diem">' + dungY + ' / ' + tong + '</div><p class="lt-loi">' + (dungY === tong ? 'Tuyệt vời! Dịch đúng hết 🎉' : 'Xem lại các câu chưa đúng rồi luyện thêm nhé 🌱') + '</p>' +
      '<p class="lt-goi-y">Khớp đáp án ' + khop + (L.che === 'hoiThoai' ? ' thoại' : ' câu') + (dungY > khop ? ' · tự đánh giá đúng ý ' + (dungY - khop) + (L.che === 'hoiThoai' ? ' thoại' : ' câu') : '') + ' · ⏱ ' + (L.giay >= 60 ? Math.floor(L.giay / 60) + ' phút ' : '') + (L.giay % 60) + ' giây</p>' +
      '<div class="ot-luu" aria-live="polite"></div>' +
      '<div class="lt-nut-kq"><button type="button" class="btn dc-xem-lai">📋 Xem lại bài</button><button type="button" class="btn dc-ve">Chọn cách luyện khác</button><button type="button" class="btn solid dc-lai">Luyện lượt mới</button></div>' +
      '<div class="lt-xem-ct" hidden>' + L.kq.map(function (k) {
        return '<div class="lt-ct ' + (k.dung || k.tuDanhGia === 'dung' ? 'dung' : 'sai') + '"><b>' + k.stt + '.</b> ' + esc(k.deBai) + '<br>Đáp án: ' + tron(k.dapAn) + '<br>Bạn dịch: ' + tron(k.chon) + '</div>'; }).join('') + '</div></div>';
    if (LD) LD.xoa(khoaLD());
    G.gui({ maLuot: L.ma, phan: 'dich', che: CHE, phienBanDe: DE.phienBanDe || '', hoTen: L.hoTen, lop: L.lop, batDau: L.batDau, giay: L.giay, soCau: tong, soDung: dungY,
      cau: L.kq.map(function (k) { return Object.assign({ phienBanDe: DE.phienBanDe || '' }, k); }) }, el.querySelector('.ot-luu'), 'Dịch Việt → Trung');
    veDau();
  }

  // =================== CHẾ ĐỘ GIÁO VIÊN ===================
  function goiMayChu(p) {
    if (!window.QM_API) return Promise.reject(new Error('Web chưa nối máy chủ điểm'));
    return fetch(window.QM_API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(p) })
      .then(function (r) { return r.json(); }).then(function (d) {
        if (!d || !d.ok) {
          var m = (d && d.loi) || 'Máy chủ không nhận';
          if (/Lệnh không hợp lệ/.test(m)) m = 'Máy chủ điểm chưa cập nhật. Cô dán mã Code.gs bản ' + G.PHIEN_BAN + ' và triển khai phiên bản mới nhé.';
          throw new Error(m);
        }
        return d;
      });
  }
  function veMoKhoa(tb) {
    var khu = el.querySelector('.dc-khu-gv');
    khu.innerHTML = '<div class="card dc-sua"><h2>🔒 Chế độ giáo viên</h2><p class="lnp-mo-ta">Nhập mật khẩu để sửa đề và đáp án Bài dịch. Mật khẩu được kiểm ở máy chủ, không lưu trên máy này.</p>' +
      '<div class="dc-sua-hang"><input type="password" class="dc-mk" autocomplete="current-password" placeholder="Mật khẩu"><button type="button" class="btn solid dc-mk-mo">Mở</button><button type="button" class="btn dc-mk-dong">Đóng</button></div>' +
      (tb ? '<p class="dc-thong-bao loi">' + esc(tb) + '</p>' : '') + '</div>';
    khu.querySelector('.dc-mk').focus();
  }
  function moKhoa() {
    var o = el.querySelector('.dc-mk'), mk = o.value; if (!mk) return;
    el.querySelector('.dc-mk-mo').disabled = true;
    goiMayChu({ action: 'baiDichKiem', matKhau: mk }).then(function () { MK = mk; SUA = sao(DE); veSua('Đã mở. Bộ đề đang dùng: ' + (NGUON === 'may-chu' ? 'bản lưu trên máy chủ (' + (DE.phienBanDe || '') + ')' : 'bộ đề gốc') + '.'); })
      .catch(function (e) { veMoKhoa(e.message); });
  }
  var TAB = 'cau';
  function oChu(ten, gt, han) { return '<textarea class="' + (han ? 'hanzi-o' : '') + '" data-f="' + ten + '" rows="' + (han ? 2 : 2) + '">' + esc(gt) + '</textarea>'; }
  function veMucCau(c, k) {
    var dau = '<div class="dc-muc" data-k="' + k + '"><div class="dc-muc-dau"><span>' + esc(c.ma || 'mới') + (c.ve ? ' · câu hỏi – đáp A/B' : '') + '</span><span><button type="button" class="btn dc-len" title="Đưa lên">↑</button> <button type="button" class="btn dc-xuong" title="Đưa xuống">↓</button> <button type="button" class="btn dc-xoa">Xoá</button></span></div>';
    if (c.ve) return dau + c.ve.map(function (v, j) {
      return '<div class="dc-luot dc-ve-sua" data-j="' + j + '"><div class="dc-muc-dau"><span>Vế ' + v.vai + '</span></div><label>Đề tiếng Việt vế ' + v.vai + '</label>' + oChu('vi', v.vi) + oDapAn(v.zh) + oGoiYSua(v) + '</div>'; }).join('') + '</div>';
    return dau +
      '<label>Đề tiếng Việt</label>' + oChu('vi', c.vi) +
      oDapAn(c.zh) + oGoiYSua(c) + '</div>';
  }
  function oDapAn(zh) {                                         // đáp án chính + các cách dịch khác, mỗi cách dịch một ô riêng
    zh = (zh && zh.length ? zh : ['']);
    return '<label>✅ Đáp án chính</label>' +
      '<div class="dc-zh-ds">' + zh.map(function (z, i) { return oZh(z, i); }).join('') + '</div>' +
      '<button type="button" class="btn dc-them-zh">+ Thêm cách dịch khác cũng đúng</button>';
  }
  function oZh(z, i) {
    return '<div class="dc-zh-hang">' + (i ? '<span class="dc-zh-nhan">Cách khác</span>' : '') + '<input type="text" class="hanzi-o dc-zh-o" value="' + esc(z) + '" placeholder="' + (i ? 'Một cách dịch khác, trọn cả câu' : 'Đáp án chính, trọn cả câu') + '">' +
      (i ? '<button type="button" class="btn dc-xoa-zh" title="Bỏ cách dịch này">✕</button>' : '') + '</div>';
  }
  function docZh(o) { return gopVai(Array.prototype.map.call(o.querySelectorAll(':scope > .dc-zh-ds .dc-zh-o'), function (x) { return x.value; })); }
  function oGoiYSua(c) { return '<label>💡 Từ gợi ý hiện ở đề (cách nhau bằng dấu phẩy; để trống nếu không cần)</label><input type="text" class="hanzi-o dc-gy-o" data-f="goiY" value="' + esc((c.goiY || []).join(', ')) + '">'; }
  function docGoiY(o) { return o ? o.value.split(/[,，、;；\s]+/).map(function (w) { return w.trim(); }).filter(Boolean) : []; }
  function veMucLuot(l, j) {
    return '<div class="dc-luot" data-j="' + j + '"><div class="dc-muc-dau"><span>Lượt ' + (j + 1) + '</span><span><button type="button" class="btn dc-xoa-luot">Xoá lượt</button></span></div>' +
      (l.ai !== undefined ? '<label>Người nói (chữ Hán)</label><input type="text" class="hanzi-o" data-f="ai" value="' + esc(l.ai) + '">' : '') +
      '<label>Đề tiếng Việt</label>' + oChu('vi', l.vi) + oDapAn(l.zh) + oGoiYSua(l) + '</div>';
  }
  function veMucNhom(h, k, coAi) {
    var ds = coAi ? h.luot : h.cau;
    return '<div class="dc-muc" data-k="' + k + '"><div class="dc-muc-dau"><span>' + esc(h.ma || 'mới') + '</span><span><button type="button" class="btn dc-xoa">Xoá cả bài</button></span></div>' +
      '<label>Tên bài</label><input type="text" data-f="ten" value="' + esc(h.ten) + '" style="width:100%">' +
      ds.map(function (l, j) { return veMucLuot(coAi ? l : Object.assign({}, l, { ai: undefined }), j); }).join('') +
      '<button type="button" class="btn dc-them-luot">+ Thêm ' + (coAi ? 'lượt lời' : 'câu') + '</button></div>';
  }
  function veSua(tb, loi) {
    var khu = el.querySelector('.dc-khu-gv'), ds = SUA[TAB] || [];
    khu.innerHTML = '<div class="card dc-sua"><h2>✏️ Sửa đề Bài dịch</h2>' +
      '<p class="lnp-mo-ta">Sửa xong bấm <b>💾 Lưu bản mới</b>: học sinh mở trang sẽ nhận bản này. Câu nào cô sửa đáp án chính thì web sẽ không hiện pinyin cho câu đó.</p>' +
      (tb ? '<p class="dc-thong-bao ' + (loi ? 'loi' : 'ok') + '">' + esc(tb) + '</p>' : '') +
      '<div class="dc-che">' + [['cau', 'Dịch câu (' + SUA.cau.length + ')'], ['hoiThoai', 'Hội thoại (' + SUA.hoiThoai.length + ')'], ['doanVan', 'Đoạn văn (' + SUA.doanVan.length + ')']].map(function (t) {
        return '<button type="button" data-tab="' + t[0] + '"' + (TAB === t[0] ? ' class="on"' : '') + '>' + t[1] + '</button>'; }).join('') + '</div>' +
      (TAB === 'cau' ? '<div class="dc-sua-hang"><label>Số câu mỗi lượt <input type="text" data-f="soCauMoiLuot" value="' + esc(SUA.soCauMoiLuot || 20) + '" size="3"></label></div>' : '') +
      '<div class="dc-ds-sua">' + ds.map(function (c, k) { return TAB === 'cau' ? veMucCau(c, k) : veMucNhom(c, k, TAB === 'hoiThoai'); }).join('') + '</div>' +
      '<button type="button" class="btn dc-them">+ Thêm ' + (TAB === 'cau' ? 'câu' : TAB === 'hoiThoai' ? 'hội thoại' : 'đoạn văn') + '</button>' +
      (TAB === 'cau' ? ' <button type="button" class="btn dc-them dc-them-ab">+ Thêm câu hỏi – đáp A/B</button>' : '') +
      '<div class="dc-lich-su"></div>' +
      '<div class="dc-sua-thanh"><button type="button" class="btn dc-ls">🕘 Các bản đã lưu</button><button type="button" class="btn dc-ve-goc">Nạp lại bộ đề gốc</button><button type="button" class="btn dc-ap-gy">💡 Áp từ gợi ý mới</button>' +
        '<button type="button" class="btn dc-thoat">Thoát</button><button type="button" class="btn solid dc-luu">💾 Lưu bản mới</button></div></div>';
  }
  function docForm() {                                          // chép nội dung ô nhập của tab đang mở vào SUA
    var khu = el.querySelector('.dc-khu-gv'); if (!SUA || !khu.querySelector('.dc-ds-sua')) return;
    var so = khu.querySelector('[data-f="soCauMoiLuot"]'); if (so) SUA.soCauMoiLuot = Math.max(1, parseInt(so.value, 10) || 20);
    function dong(t) { return String(t || '').split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean); }
    khu.querySelectorAll('.dc-ds-sua > .dc-muc').forEach(function (m) {
      var k = +m.dataset.k, it = SUA[TAB][k];
      if (TAB === 'cau' && it.ve) {
        m.querySelectorAll('.dc-ve-sua').forEach(function (lo) {
          var v = it.ve[+lo.dataset.j], z = docZh(lo);
          if (z[0] !== (v.zh || [])[0]) v.py = '';
          v.vi = lo.querySelector('[data-f="vi"]').value.trim(); v.zh = z; v.goiY = docGoiY(lo.querySelector('[data-f="goiY"]'));
        });
        it.vi = it.ve.map(function (v) { return v.vi; }).join(' — '); it.zh = [it.ve.map(function (v) { return v.zh[0] || ''; }).join('')];
      } else if (TAB === 'cau') {
        var zh = docZh(m);
        if (zh[0] !== (it.zh || [])[0]) it.py = '';
        it.vi = m.querySelector('[data-f="vi"]').value.trim(); it.zh = zh; it.goiY = docGoiY(m.querySelector('[data-f="goiY"]'));
      } else {
        it.ten = m.querySelector('[data-f="ten"]').value.trim();
        var ds = TAB === 'hoiThoai' ? it.luot : it.cau;
        m.querySelectorAll('.dc-luot').forEach(function (lo) {
          var l = ds[+lo.dataset.j], zh2 = docZh(lo);
          if (zh2[0] !== (l.zh || [])[0]) l.py = '';
          l.vi = lo.querySelector('[data-f="vi"]').value.trim(); l.zh = zh2; l.goiY = docGoiY(lo.querySelector('[data-f="goiY"]'));
          var ai = lo.querySelector('[data-f="ai"]'); if (ai) l.ai = ai.value.trim();
        });
      }
    });
  }
  // Áp từ gợi ý của bộ đề gốc (31/10/2026) vào bản đang sửa: chỉ những câu cô CHƯA sửa (đề và đáp án còn y như bản gốc trước khi có gợi ý)
  function apGoiY() {
    docForm();
    var ap = 0, bo = [];
    function giong(a, b) { return JSON.stringify(a || []) === JSON.stringify(b || []); }
    function apMot(dich, goc, nhan) {
      if (!dich || !goc || !goc.goiY || !goc.goiY.length || (dich.goiY && dich.goiY.length)) return;
      if (dich.vi === goc.vi && (giong(dich.zh, goc.zhCu) || giong(dich.zh, goc.zh))) { dich.goiY = goc.goiY.slice(); dich.zh = goc.zh.slice(); dich.py = goc.py; ap++; }
      else bo.push(nhan);
    }
    var theo = {}; GOC.cau.forEach(function (c) { theo[c.ma] = c; });
    SUA.cau.forEach(function (c) { var g = theo[c.ma]; if (c.ve && g && g.ve) c.ve.forEach(function (v, i) { apMot(v, g.ve[i], c.ma + ' vế ' + v.vai); }); else apMot(c, g, c.ma); });
    SUA.hoiThoai.forEach(function (h) { var g = GOC.hoiThoai.filter(function (x) { return x.ma === h.ma; })[0]; if (g) h.luot.forEach(function (l, i) { apMot(l, g.luot[i], h.ma + ' thoại ' + (i + 1)); }); });
    SUA.doanVan.forEach(function (d) { var g = GOC.doanVan.filter(function (x) { return x.ma === d.ma; })[0]; if (g) d.cau.forEach(function (l, i) { apMot(l, g.cau[i], d.ma + ' câu ' + (i + 1)); }); });
    veSua('Đã thêm từ gợi ý cho ' + ap + ' câu (chưa lưu, cô xem rồi bấm 💾 Lưu bản mới).' + (bo.length ? ' Bỏ qua ' + bo.length + ' câu cô đã sửa: ' + bo.join(', ') + '.' : ''));
  }
  function maMoi(tien, ds) { var n = 0; ds.forEach(function (x) { var m = String(x.ma || '').match(/(\d+)$/); if (m) n = Math.max(n, +m[1]); }); return tien + (n + 1 < 10 && tien === 'c' ? '0' : '') + (n + 1); }
  function kiemSua() {                                          // trước khi lưu: không để câu trống
    var loi = [];
    SUA.cau.forEach(function (c, i) { if (c.ve ? c.ve.some(function (v) { return !v.vi || !v.zh.length; }) : (!c.vi || !c.zh.length)) loi.push('Dịch câu ' + (c.ma || '#' + (i + 1))); });
    SUA.hoiThoai.forEach(function (h) { h.luot.forEach(function (l, j) { if (!l.vi || !l.zh.length) loi.push((h.ten || h.ma) + ' lượt ' + (j + 1)); }); });
    SUA.doanVan.forEach(function (d) { d.cau.forEach(function (l, j) { if (!l.vi || !l.zh.length) loi.push((d.ten || d.ma) + ' câu ' + (j + 1)); }); });
    return loi;
  }
  function luu() {
    docForm();
    var loi = kiemSua(); if (loi.length) return veSua('Còn trống đề hoặc đáp án: ' + loi.slice(0, 5).join(', ') + (loi.length > 5 ? '…' : ''), true);
    var nut = el.querySelector('.dc-luu'); nut.disabled = true; nut.textContent = '⏳ Đang lưu…';
    var goi = sao(SUA); delete goi.phienBanDe;
    goiMayChu({ action: 'baiDichLuu', matKhau: MK, deBai: goi }).then(function (d) {
      SUA.phienBanDe = d.phienBanDe; DE = sao(SUA); NGUON = 'may-chu';
      veSua('✅ Đã lưu bản ' + d.phienBanDe + '. Học sinh mở (hoặc tải lại) trang sẽ nhận bản này.');
    }).catch(function (e) { veSua('Chưa lưu được: ' + e.message, true); });
  }
  function lichSu() {
    var khu = el.querySelector('.dc-lich-su'); khu.innerHTML = '<p class="lt-luu-ghi">⏳ Đang tải…</p>';
    goiMayChu({ action: 'baiDichDs', matKhau: MK }).then(function (d) {
      khu.innerHTML = '<div class="dc-muc"><div class="dc-muc-dau"><span>Các bản đã lưu (mới nhất ở trên)</span></div>' + (d.ds.length ? d.ds.map(function (b) {
        return '<div class="dc-sua-hang"><span>' + esc(b.phienBanDe) + ' · ' + esc(String(b.thoiDiem).replace('T', ' ').slice(0, 16)) + ' · ' + esc(b.soCau) + ' câu</span><button type="button" class="btn dc-lay" data-v="' + esc(b.phienBanDe) + '">Mở bản này</button></div>'; }).join('')
        : '<p>Chưa có bản nào được lưu; web đang dùng bộ đề gốc.</p>') + '</div>';
    }).catch(function (e) { khu.innerHTML = '<p class="dc-thong-bao loi">' + esc(e.message) + '</p>'; });
  }
  function layBan(v) {
    goiMayChu({ action: 'baiDichLay', matKhau: MK, phienBanDe: v }).then(function (d) { SUA = chuanDe(d.deBai); SUA.phienBanDe = v; if (!SUA.tenViet) SUA.tenViet = GOC.tenViet;
      veSua('Đã mở bản ' + v + ' để xem / sửa. Bấm 💾 Lưu bản mới nếu muốn học sinh dùng lại bản này.'); })
      .catch(function (e) { veSua(e.message, true); });
  }

  // ---------- sự kiện ----------
  el.addEventListener('click', function (e) {
    var t = e.target;
    if (t.closest('.tv-loa')) return;
    var ch = t.closest('.dc-che button[data-che]'); if (ch) { CHE = ch.dataset.che; el.querySelectorAll('.dc-che button[data-che]').forEach(function (b) { b.classList.toggle('on', b === ch); }); el.querySelector('.dc-mo-ta-che').innerHTML = moTaChe(); return; }
    var lt = t.closest('.dc-ld-tiep'); if (lt) { luuHs(); if (!khoiPhuc(lt.dataset.khoa)) veBatDau(); return; }
    var lb = t.closest('.dc-ld-bo'); if (lb) { LD.xoa(lb.dataset.khoa); veBatDau(); return; }
    if (t.closest('.dc-bat-dau')) return batDau();
    var cb = t.closest('.dc-chon-bai'); if (cb) { var kk = TIEN_TO + (DE[CHE][+cb.dataset.k] || {}).ma; if (LD && LD.doc(kk)) { luuHs(); if (khoiPhuc(kk)) return; } return batDau(+cb.dataset.k); }
    var kc = t.closest('.dc-cap-kt'); if (kc) return kiemCap(+kc.dataset.c);
    if (t.closest('.dc-ht-xong')) return xongHT();
    var tuh = t.closest('.dc-ht-tu .dc-tu-chon'); if (tuh && !tuh.disabled) {
      var hop = tuh.parentNode, xh = L.ds[+hop.dataset.i]; xh.tuDanhGia = tuh.dataset.v;
      hop.querySelectorAll('.dc-tu-chon').forEach(function (b) { b.disabled = true; b.classList.toggle('on', b === tuh); });
      capNhatTong(); luuDo();
      return;
    }
    var dh = t.closest('.dc-ht-dau-cau button'); if (dh && !dh.disabled) {
      var oh = O_CUOI && O_CUOI.isConnected && !O_CUOI.disabled ? O_CUOI : el.querySelector('.dc-ht-o:not(:disabled)'); if (!oh) return;
      var ph = oh.selectionStart != null ? oh.selectionStart : oh.value.length; oh.value = oh.value.slice(0, ph) + dh.dataset.d + oh.value.slice(oh.selectionEnd || ph);
      oh.focus(); oh.selectionStart = oh.selectionEnd = ph + 1; clearTimeout(HEN_LUU); HEN_LUU = setTimeout(luuDo, 800); return;
    }
    var dv = t.closest('.dc-dau button'); if (dv && !dv.disabled && el.querySelector('.dc-ve-o')) {
      var ov = O_CUOI && O_CUOI.isConnected && O_CUOI.classList.contains('dc-ve-o') && !O_CUOI.disabled ? O_CUOI : el.querySelector('.dc-ve-o:not(:disabled)'); if (!ov) return;
      var pv = ov.selectionStart != null ? ov.selectionStart : ov.value.length; ov.value = ov.value.slice(0, pv) + dv.dataset.d + ov.value.slice(ov.selectionEnd || pv);
      ov.focus(); ov.selectionStart = ov.selectionEnd = pv + 1; el.querySelector('.dc-kt').disabled = false; return;
    }
    var d = t.closest('.dc-dau button'); if (d && !d.disabled) { var o = el.querySelector('.dc-o'), p = o.selectionStart || o.value.length; o.value = o.value.slice(0, p) + d.dataset.d + o.value.slice(o.selectionEnd || p); o.focus(); o.selectionStart = o.selectionEnd = p + 1; el.querySelector('.dc-kt').disabled = !o.value.trim(); return; }
    if (t.closest('.dc-kt')) return kiemTra(false);
    if (t.closest('.dc-bo-qua')) return kiemTra(true);
    var tu = t.closest('.dc-tu-chon'); if (tu && !tu.disabled) { var x = L.ds[L.i]; x.tuDanhGia = tu.dataset.v; ghi(x); el.querySelectorAll('.dc-tu-chon').forEach(function (b) { b.disabled = true; b.classList.toggle('on', b === tu); }); el.querySelector('.dc-tiep').disabled = false; el.querySelector('.dc-tiep').focus(); return; }
    if (t.closest('.dc-tiep')) { TV.dungDoc(); if (L.i < L.ds.length - 1) { L.i++; veCau(); veDau(); } else veKetQua(); return; }
    if (t.closest('.dc-xem-lai')) { var xc = el.querySelector('.lt-xem-ct'); xc.hidden = !xc.hidden; return; }
    if (t.closest('.dc-ve')) { L = null; veBatDau(); veDau(); return; }
    if (t.closest('.dc-lai')) { if (CHE === 'cau') batDau(); else { L = null; veBatDau(); veDau(); } return; }
    // giáo viên
    if (t.closest('.dc-mo-gv')) return veMoKhoa();
    if (t.closest('.dc-mk-mo')) return moKhoa();
    if (t.closest('.dc-mk-dong') || t.closest('.dc-thoat')) { MK = ''; SUA = null; el.querySelector('.dc-khu-gv').innerHTML = ''; veBatDau(); return; }
    var tab = t.closest('.dc-che button[data-tab]'); if (tab) { docForm(); TAB = tab.dataset.tab; return veSua(); }
    if (t.closest('.dc-luu')) return luu();
    if (t.closest('.dc-ls')) { docForm(); return lichSu(); }
    var lb = t.closest('.dc-lay'); if (lb) return layBan(lb.dataset.v);
    if (t.closest('.dc-ap-gy')) return apGoiY();
    var tz = t.closest('.dc-them-zh'); if (tz) { var dsz = tz.previousElementSibling; dsz.insertAdjacentHTML('beforeend', oZh('', dsz.children.length)); dsz.lastElementChild.querySelector('input').focus(); return; }
    var xz = t.closest('.dc-xoa-zh'); if (xz) { xz.parentNode.remove(); return; }
    if (t.closest('.dc-ve-goc')) { SUA = sao(GOC); return veSua('Đã nạp bộ đề gốc vào khung sửa (chưa lưu). Bấm 💾 Lưu bản mới để học sinh dùng lại bộ đề gốc.'); }
    var muc = t.closest('.dc-muc[data-k]'), k = muc ? +muc.dataset.k : -1;
    if (t.closest('.dc-them')) { docForm();
      if (TAB === 'cau' && t.closest('.dc-them-ab')) SUA.cau.push({ ma: maMoi('c', SUA.cau), vi: '', zh: [], py: '', np: [], ve: [{ vai: 'A', vi: '', zh: [], py: '' }, { vai: 'B', vi: '', zh: [], py: '' }] });
      else if (TAB === 'cau') SUA.cau.push({ ma: maMoi('c', SUA.cau), vi: '', zh: [], py: '', np: [] });
      else if (TAB === 'hoiThoai') SUA.hoiThoai.push({ ma: maMoi('h', SUA.hoiThoai), ten: 'Hội thoại mới', np: [], luot: [{ ai: '', vi: '', zh: [], py: '' }] });
      else SUA.doanVan.push({ ma: maMoi('d', SUA.doanVan), ten: 'Đoạn văn mới', np: [], cau: [{ vi: '', zh: [], py: '' }] });
      veSua(); var ds = el.querySelectorAll('.dc-ds-sua > .dc-muc'); if (ds.length) ds[ds.length - 1].scrollIntoView({ block: 'center' }); return; }
    if (t.closest('.dc-xoa') && k >= 0) { docForm(); if (confirm('Xoá mục này khỏi bộ đề? (chỉ mất hẳn khi cô bấm Lưu bản mới)')) { SUA[TAB].splice(k, 1); veSua(); } return; }
    if (t.closest('.dc-len') && k > 0) { docForm(); var a = SUA[TAB]; a.splice(k - 1, 0, a.splice(k, 1)[0]); return veSua(); }
    if (t.closest('.dc-xuong') && k >= 0 && k < SUA[TAB].length - 1) { docForm(); var b2 = SUA[TAB]; b2.splice(k + 1, 0, b2.splice(k, 1)[0]); return veSua(); }
    if (t.closest('.dc-them-luot') && k >= 0) { docForm(); var it = SUA[TAB][k]; (TAB === 'hoiThoai' ? it.luot : it.cau).push(TAB === 'hoiThoai' ? { ai: '', vi: '', zh: [], py: '' } : { vi: '', zh: [], py: '' }); return veSua(); }
    var xl = t.closest('.dc-xoa-luot'); if (xl && k >= 0) { docForm(); var it2 = SUA[TAB][k], arr = TAB === 'hoiThoai' ? it2.luot : it2.cau; if (arr.length > 1) { arr.splice(+xl.closest('.dc-luot').dataset.j, 1); veSua(); } return; }
  });
  el.addEventListener('input', function (e) {
    if (e.target.classList.contains('dc-o')) { el.querySelector('.dc-kt').disabled = !e.target.value.trim(); el.querySelector('.dc-bao').textContent = '';
      clearTimeout(HEN_LUU); HEN_LUU = setTimeout(luuDo, 1200); }                // chữ đang gõ: lưu sau 1,2 giây ngừng gõ
    if (e.target.classList.contains('dc-ve-o')) { e.target.parentNode.querySelector('.dc-ve-bao').textContent = ''; L.ds[L.i].daNhacTrong = false;
      el.querySelector('.dc-kt').disabled = !Array.prototype.some.call(el.querySelectorAll('.dc-ve-o'), function (b) { return b.value.trim(); });
      e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px';
      clearTimeout(HEN_LUU); HEN_LUU = setTimeout(luuDo, 1200); return; }
    if (e.target.classList.contains('dc-ht-o')) { e.target.parentNode.querySelector('.dc-ht-bao').textContent = ''; L.nhacCap[+e.target.dataset.c] = false;
      e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px';
      clearTimeout(HEN_LUU); HEN_LUU = setTimeout(luuDo, 1200); }
  });
  el.addEventListener('focusin', function (e) { if (e.target.classList.contains('dc-ht-o') || e.target.classList.contains('dc-ve-o')) O_CUOI = e.target; });
  el.addEventListener('keydown', function (e) {
    if (e.target.classList.contains('dc-ve-o') && e.key === 'Enter' && !e.shiftKey && !e.isComposing) {   // Enter: sang vế B, ở vế B thì kiểm tra
      e.preventDefault(); var vs = el.querySelector('.dc-ve-o[data-k="' + (+e.target.dataset.k + 1) + '"]'); if (vs) vs.focus(); else if (!el.querySelector('.dc-kt').disabled) kiemTra(false); return; }
    if (e.target.classList.contains('dc-ht-o') && !e.target.classList.contains('dc-ve-o') && e.key === 'Enter' && !e.shiftKey && !e.isComposing) {   // Enter: sang ô thoại kế tiếp
      e.preventDefault(); var cHt = e.target.dataset.c, dsO = oCap(cHt).querySelectorAll('.dc-ht-o'), vt = Array.prototype.indexOf.call(dsO, e.target);
      if (vt < dsO.length - 1) dsO[vt + 1].focus(); else kiemCap(+cHt); return; }
    if (e.target.classList.contains('dc-mk') && e.key === 'Enter') { e.preventDefault(); moKhoa(); }
    if (e.target.classList.contains('dc-o') && e.key === 'Enter' && !e.shiftKey && !e.isComposing && L && L.ds[L.i] && !L.ds[L.i].doan) { e.preventDefault(); if (e.target.value.trim()) kiemTra(false); }
  });

  el.innerHTML = '<div class="tv-trong">Đang tải bài dịch…</div>';
  // đợi cau-hinh.js (QM_API) rồi mới hỏi máy chủ bản đề mới nhất
  setTimeout(function () {
    document.addEventListener('qm-luot-do-nap', function () { if (DE && !L && !SUA) veBatDau(); });
    napDe().then(veBatDau).catch(function () { el.innerHTML = '<div class="tv-trong">Chưa tải được bài dịch, bạn kiểm tra mạng rồi thử lại nhé.</div>'; });
  }, window.QM_API ? 0 : 600);
})();
