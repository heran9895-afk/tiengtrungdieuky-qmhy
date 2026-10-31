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
  function chuan(s) { return String(s || '').replace(/\s+/g, '').replace(/[—–-]+/g, '').replace(/！/g, '。').replace(/[“”"]/g, ''); }
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
      GOC = d.dich; DE = sao(GOC); NGUON = 'goc';
      if (!window.QM_API) return;
      var hoan = new Promise(function (_, tu) { setTimeout(function () { tu(new Error('het-gio')); }, 7000); });
      return Promise.race([fetch(window.QM_API + '?action=baiDich').then(function (r) { return r.json(); }), hoan]).then(function (s) {
        if (s && s.ok && s.deBai && Array.isArray(s.deBai.cau)) { DE = s.deBai; NGUON = 'may-chu'; if (!DE.tenViet) DE.tenViet = GOC.tenViet; }
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
    LD.luu(khoaLD(), { ten: 'Dịch · ' + L.ten, tom: L.ds[0].doan ? 'đang dịch đoạn văn' : ht ? 'đã dịch ' + ht.filter(function (v) { return v.trim(); }).length + ' / ' + L.ds.length + ' thoại' : 'câu ' + (n + 1) + ' / ' + L.ds.length,
      du: { che: L.che, nguonMa: L.nguonMa, ds: L.ds.map(function (x) { return x.ma; }), kq: L.kq, ma: L.ma, batDau: L.batDau,
        giay: Math.round((Date.now() - L.luc) / 1000), nhap: o && !o.disabled ? o.value : '', nhapHT: ht, ten: L.ten } });
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
      d.ds.forEach(function (m) { var c = theo[m]; ds.push(c ? { ma: c.ma, nhom: 'cau', vi: c.vi, zh: c.zh, py: c.py, ghiChu: c.ghiChu } : null); });
    } else if (d.che === 'hoiThoai') {
      var h = DE.hoiThoai.filter(function (x) { return x.ma === d.nguonMa; })[0];
      if (h && h.luot.length === d.ds.length) ds = h.luot.map(function (l, i) { return { ma: h.ma + '-' + (i + 1), nhom: h.ma, ai: l.ai, vi: l.vi, zh: l.zh, py: l.py, ht: h, i: i }; });
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
    if (d.che === 'hoiThoai' && d.nhapHT) el.querySelectorAll('.dc-ht-o').forEach(function (b) { b.value = d.nhapHT[+b.dataset.i] || ''; });
    return true;
  }
  function veBatDau() {
    var hs = hoSo();
    el.innerHTML = '<div class="lnp-dau card"><div class="sec-kicker">翻译</div><h2 class="lnp-tieu-de">🌏 Dịch Việt → Trung</h2>' +
      '<p class="lnp-mo-ta">Gõ bản dịch bằng <b>chữ Hán</b>, có <b>dấu câu tiếng Trung</b>. Bấm <b>Kiểm tra</b> để so với đáp án; câu chưa khớp thì xem đáp án rồi tự đánh giá. Phần này không tính điểm.</p>' +
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
    if (CHE === 'cau') ds = tron1(DE.cau).slice(0, DE.soCauMoiLuot || 20).map(function (c) { return { ma: c.ma, nhom: 'cau', vi: c.vi, zh: c.zh, py: c.py, ghiChu: c.ghiChu }; });
    else if (CHE === 'hoiThoai') { var h = DE.hoiThoai[k]; ds = h.luot.map(function (l, i) { return { ma: h.ma + '-' + (i + 1), nhom: h.ma, ai: l.ai, vi: l.vi, zh: l.zh, py: l.py, ht: h, i: i }; }); }
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
  function vaiCua(h) { var v = {}, n = 0; h.luot.forEach(function (l) { if (!(l.ai in v)) v[l.ai] = CHU_VAI[n++] || '?'; }); return v; }
  function nhapHT() { return Array.prototype.map.call(el.querySelectorAll('.dc-ht-o'), function (b) { return b.value; }); }
  function veHoiThoai() {
    var h = L.ds[0].ht, vai = vaiCua(h), t0 = Date.now();
    L.ds.forEach(function (x) { x.t0 = t0; });
    el.innerHTML = '<div class="lnp-khung dc-ht"><div class="dc-de"><div class="lnp-hang"><span class="lnp-ten-dang">💬 ' + esc(L.ten) + '</span><span class="lt-dem">' + L.ds.length + ' thoại</span></div>' +
      '<p class="lnp-dd">Dịch từng thoại sang tiếng Trung, gõ vào ô ngay dưới thoại đó. Dịch xong cả bài thì bấm <b>Kiểm tra</b>: máy chấm riêng từng thoại.</p>' +
      '<div class="dc-vai">' + Object.keys(vai).map(function (ai) { return '<span><b>' + vai[ai] + '</b> = <span class="hanzi">' + esc(ai) + '</span>' + (tenViet(ai) ? ' (' + esc(tenViet(ai)) + ')' : '') + '</span>'; }).join('') + '</div>' +
      L.ds.map(function (x, i) {
        return '<div class="dc-ht-dong" data-i="' + i + '"><div class="dc-ht-dau"><span class="dc-ht-vai v' + (vai[x.ai].charCodeAt(0) - 65) % 4 + '">' + vai[x.ai] + '</span><div class="dc-ht-vi">' + esc(x.vi) + '</div></div>' +
          '<textarea class="dc-ht-o" data-i="' + i + '" rows="1" lang="zh-CN" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Bản dịch thoại ' + vai[x.ai] + '"></textarea>' +
          '<p class="dc-bao dc-ht-bao" aria-live="polite"></p><div class="dc-ht-giai" aria-live="polite"></div></div>';
      }).join('') +
      '<div class="dc-dau dc-ht-dau-cau"><span>Dấu câu:</span>' + DAU.map(function (d) { return '<button type="button" data-d="' + d + '" aria-label="Thêm dấu ' + d + '">' + d + '</button>'; }).join('') + '</div>' +
      '<p class="dc-bao dc-ht-chung" aria-live="polite"></p>' +
      '<div class="lt-nut-kq dc-ht-nut"><button type="button" class="btn solid dc-ht-kt">Kiểm tra</button></div></div></div>';
  }
  function giaiThoai(x, cua) {                                    // lời giải một thoại: khớp cả thoại; không khớp thì chỉ rõ câu nào trong thoại lệch
    var dsCau = tachCau(cua), tot = null;
    x.zh.forEach(function (a) {                                   // chọn cách dịch có nhiều câu trùng nhất để so
      var ac = tachCau(a), n = 0; ac.forEach(function (c, i) { if (dsCau[i] && khop(dsCau[i], [c])) n++; });
      if (!tot || n > tot.n) tot = { n: n, ac: ac };
    });
    var chiTiet = cua && tot.ac.length > 1 ? '<div class="dc-cua">Bạn dịch: ' + dsCau.map(function (c, i) {
      var ok = tot.ac[i] && khop(c, [tot.ac[i]]); return '<span class="dc-ht-cau ' + (ok ? 'dung' : 'sai') + '">' + (ok ? '✅' : '🔸') + '<span class="hanzi">' + esc(c) + '</span></span>'; }).join(' ') + '</div>'
      : (cua ? '<div class="dc-cua">Bạn dịch: ' + tron(cua) + '</div>' : '<div class="dc-cua">Bạn để trống thoại này.</div>');
    return '<div class="dc-giai' + (x.khop ? '' : ' sai') + '"><div class="lt-ket ' + (x.khop ? 'dung' : 'sai') + '">' + (x.khop ? '✓ Khớp đáp án' : '✗ Chưa khớp đáp án') + '</div>' +
      (x.khop ? '' : chiTiet) +
      '<div class="dc-dap">' + TV.nutLoa(chuan(x.zh[0])) + '<div><div class="hanzi">' + esc(x.zh[0]) + '</div>' + (x.py ? '<div class="dc-py">' + esc(x.py) + '</div>' : '') + '</div></div>' +
      (x.zh.length > 1 ? '<div class="dc-khac">Cũng đúng: ' + x.zh.slice(1).map(tron).join(' · ') + '</div>' : '') +
      (!x.khop && cua ? '<div class="dc-tu dc-ht-tu" data-i="' + x.i + '"><button type="button" class="btn dc-tu-chon" data-v="dung">✓ Em dịch đúng ý</button><button type="button" class="btn dc-tu-chon" data-v="sai">✗ Em dịch sai</button></div>' : '') + '</div>';
  }
  function kiemTraHT() {
    var o = el.querySelectorAll('.dc-ht-o'), loi = false, trong = 0;
    o.forEach(function (b) {
      var v = b.value.trim(), nhac = v ? kiemGo(v) : '', bao = b.parentNode.querySelector('.dc-ht-bao');
      bao.innerHTML = nhac; if (nhac) loi = true; if (!v) trong++;
    });
    var chung = el.querySelector('.dc-ht-chung');
    if (loi) { chung.innerHTML = 'Sửa các ô có nhắc đỏ rồi bấm Kiểm tra lại.'; return; }
    if (trong && !L.daNhacTrong) { L.daNhacTrong = true; chung.innerHTML = 'Còn <b>' + trong + ' thoại</b> chưa dịch. Bấm <b>Kiểm tra</b> lần nữa nếu vẫn muốn nộp (thoại bỏ trống tính sai).'; return; }
    chung.innerHTML = '';
    var canTu = 0;
    L.ds.forEach(function (x, i) {
      var b = o[i], cua = b.value.trim();
      b.disabled = true; x.cua = cua; x.khop = !!cua && khop(cua, x.zh); x.tuDanhGia = '';
      b.classList.add(x.khop ? 'dung' : 'sai');
      b.parentNode.querySelector('.dc-ht-giai').innerHTML = giaiThoai(x, cua);
      if (!x.khop && cua) canTu++;
    });
    var khopN = L.ds.filter(function (x) { return x.khop; }).length;
    el.querySelector('.dc-ht-dau-cau').hidden = true;
    el.querySelector('.dc-ht-nut').innerHTML = '<p class="lt-ket ' + (khopN === L.ds.length ? 'dung' : 'sai') + '">Khớp đáp án ' + khopN + ' / ' + L.ds.length + ' thoại.</p>' +
      (canTu ? '<p class="lnp-dd dc-ht-con">Còn <b>' + canTu + '</b> thoại chưa khớp đáp án: bạn so với đáp án rồi tự đánh giá từng thoại nhé.</p>' : '') +
      '<button type="button" class="btn solid dc-ht-xong"' + (canTu ? ' disabled' : '') + '>Xem kết quả</button>';
  }
  function xongHT() {
    L.kq = L.ds.map(function (x, i) {
      return { stt: i + 1, maCau: x.ma, dang: 'dich', nhom: x.nhom, deBai: (vaiCua(x.ht)[x.ai] || '') + ' (' + x.ai + '): ' + x.vi, dapAn: x.zh[0],
        chon: x.cua || '(bỏ trống)', dung: x.khop ? 1 : 0, tuDanhGia: x.tuDanhGia || '', giay: Math.round((Date.now() - x.t0) / 100) / 10, thuTu: '' };
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
        '<div class="dc-vi' + (x.doan ? ' dai' : '') + '">' + esc(x.vi) + '</div>' +
        (x.ghiChu ? '<p class="lnp-dd">' + tron(x.ghiChu) + '</p>' : '') +
        '<textarea class="dc-o' + (x.doan ? ' dai' : '') + '" lang="zh-CN" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Gõ bản dịch bằng chữ Hán, có dấu câu"></textarea>' +
        '<div class="dc-dau">' + DAU.map(function (d) { return '<button type="button" data-d="' + d + '" aria-label="Thêm dấu ' + d + '">' + d + '</button>'; }).join('') + '</div>' +
        '<p class="dc-bao" aria-live="polite"></p>' +
        '<div class="lt-nut-kq"><button type="button" class="btn dc-bo-qua">Không biết, xem đáp án</button><button type="button" class="btn solid dc-kt" disabled>Kiểm tra</button></div></div>' +
      '<div class="dc-khu-giai" aria-live="polite"></div></div>';
  }
  function kiemTra(boQua) {
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
    L.kq.push({ stt: L.i + 1, maCau: x.ma, dang: 'dich', nhom: x.nhom, deBai: x.vi, dapAn: x.doan ? x.doan.cau.map(function (c) { return c.zh[0]; }).join('') : x.zh[0],
      chon: x.cua || '(bỏ qua)', dung: x.khop ? 1 : 0, tuDanhGia: x.tuDanhGia || '', giay: Math.round((Date.now() - x.t0) / 100) / 10,
      thuTu: x.doan ? 'khớp ' + x.soKhop + '/' + x.doan.cau.length : '' });
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
    return '<div class="dc-muc" data-k="' + k + '"><div class="dc-muc-dau"><span>' + esc(c.ma || 'mới') + '</span><span><button type="button" class="btn dc-len" title="Đưa lên">↑</button> <button type="button" class="btn dc-xuong" title="Đưa xuống">↓</button> <button type="button" class="btn dc-xoa">Xoá</button></span></div>' +
      '<label>Đề tiếng Việt</label>' + oChu('vi', c.vi) +
      '<label>Đáp án (mỗi dòng một cách dịch; dòng đầu là đáp án chính)</label>' + oChu('zh', (c.zh || []).join('\n'), true) + '</div>';
  }
  function veMucLuot(l, j) {
    return '<div class="dc-luot" data-j="' + j + '"><div class="dc-muc-dau"><span>Lượt ' + (j + 1) + '</span><span><button type="button" class="btn dc-xoa-luot">Xoá lượt</button></span></div>' +
      (l.ai !== undefined ? '<label>Người nói (chữ Hán)</label><input type="text" class="hanzi-o" data-f="ai" value="' + esc(l.ai) + '">' : '') +
      '<label>Đề tiếng Việt</label>' + oChu('vi', l.vi) + '<label>Đáp án (mỗi dòng một cách dịch)</label>' + oChu('zh', (l.zh || []).join('\n'), true) + '</div>';
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
      '<div class="dc-lich-su"></div>' +
      '<div class="dc-sua-thanh"><button type="button" class="btn dc-ls">🕘 Các bản đã lưu</button><button type="button" class="btn dc-ve-goc">Nạp lại bộ đề gốc</button>' +
        '<button type="button" class="btn dc-thoat">Thoát</button><button type="button" class="btn solid dc-luu">💾 Lưu bản mới</button></div></div>';
  }
  function docForm() {                                          // chép nội dung ô nhập của tab đang mở vào SUA
    var khu = el.querySelector('.dc-khu-gv'); if (!SUA || !khu.querySelector('.dc-ds-sua')) return;
    var so = khu.querySelector('[data-f="soCauMoiLuot"]'); if (so) SUA.soCauMoiLuot = Math.max(1, parseInt(so.value, 10) || 20);
    function dong(t) { return String(t || '').split(/\n+/).map(function (x) { return x.trim(); }).filter(Boolean); }
    khu.querySelectorAll('.dc-ds-sua > .dc-muc').forEach(function (m) {
      var k = +m.dataset.k, it = SUA[TAB][k];
      if (TAB === 'cau') {
        var zh = dong(m.querySelector('[data-f="zh"]').value);
        if (zh[0] !== (it.zh || [])[0]) it.py = '';
        it.vi = m.querySelector('[data-f="vi"]').value.trim(); it.zh = zh;
      } else {
        it.ten = m.querySelector('[data-f="ten"]').value.trim();
        var ds = TAB === 'hoiThoai' ? it.luot : it.cau;
        m.querySelectorAll('.dc-luot').forEach(function (lo) {
          var l = ds[+lo.dataset.j], zh2 = dong(lo.querySelector('[data-f="zh"]').value);
          if (zh2[0] !== (l.zh || [])[0]) l.py = '';
          l.vi = lo.querySelector('[data-f="vi"]').value.trim(); l.zh = zh2;
          var ai = lo.querySelector('[data-f="ai"]'); if (ai) l.ai = ai.value.trim();
        });
      }
    });
  }
  function maMoi(tien, ds) { var n = 0; ds.forEach(function (x) { var m = String(x.ma || '').match(/(\d+)$/); if (m) n = Math.max(n, +m[1]); }); return tien + (n + 1 < 10 && tien === 'c' ? '0' : '') + (n + 1); }
  function kiemSua() {                                          // trước khi lưu: không để câu trống
    var loi = [];
    SUA.cau.forEach(function (c, i) { if (!c.vi || !c.zh.length) loi.push('Dịch câu ' + (c.ma || '#' + (i + 1))); });
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
    goiMayChu({ action: 'baiDichLay', matKhau: MK, phienBanDe: v }).then(function (d) { SUA = d.deBai; SUA.phienBanDe = v; if (!SUA.tenViet) SUA.tenViet = GOC.tenViet;
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
    if (t.closest('.dc-ht-kt')) return kiemTraHT();
    if (t.closest('.dc-ht-xong')) return xongHT();
    var tuh = t.closest('.dc-ht-tu .dc-tu-chon'); if (tuh && !tuh.disabled) {
      var hop = tuh.parentNode, xh = L.ds[+hop.dataset.i]; xh.tuDanhGia = tuh.dataset.v;
      hop.querySelectorAll('.dc-tu-chon').forEach(function (b) { b.disabled = true; b.classList.toggle('on', b === tuh); });
      var con = L.ds.filter(function (x) { return !x.khop && x.cua && !x.tuDanhGia; }).length, nx = el.querySelector('.dc-ht-xong');
      nx.disabled = con > 0; var ghiCon = el.querySelector('.dc-ht-con'); if (ghiCon) ghiCon.innerHTML = con ? 'Còn <b>' + con + '</b> thoại chưa tự đánh giá.' : 'Đã đánh giá xong, bấm <b>Xem kết quả</b>.';
      return;
    }
    var dh = t.closest('.dc-ht-dau-cau button'); if (dh && !dh.disabled) {
      var oh = O_CUOI && O_CUOI.isConnected && !O_CUOI.disabled ? O_CUOI : el.querySelector('.dc-ht-o:not(:disabled)'); if (!oh) return;
      var ph = oh.selectionStart != null ? oh.selectionStart : oh.value.length; oh.value = oh.value.slice(0, ph) + dh.dataset.d + oh.value.slice(oh.selectionEnd || ph);
      oh.focus(); oh.selectionStart = oh.selectionEnd = ph + 1; clearTimeout(HEN_LUU); HEN_LUU = setTimeout(luuDo, 800); return;
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
    if (t.closest('.dc-ve-goc')) { SUA = sao(GOC); return veSua('Đã nạp bộ đề gốc vào khung sửa (chưa lưu). Bấm 💾 Lưu bản mới để học sinh dùng lại bộ đề gốc.'); }
    var muc = t.closest('.dc-muc[data-k]'), k = muc ? +muc.dataset.k : -1;
    if (t.closest('.dc-them')) { docForm();
      if (TAB === 'cau') SUA.cau.push({ ma: maMoi('c', SUA.cau), vi: '', zh: [], py: '', np: [] });
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
    if (e.target.classList.contains('dc-ht-o')) { e.target.parentNode.querySelector('.dc-ht-bao').textContent = ''; L.daNhacTrong = false;
      e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px';
      clearTimeout(HEN_LUU); HEN_LUU = setTimeout(luuDo, 1200); }
  });
  el.addEventListener('focusin', function (e) { if (e.target.classList.contains('dc-ht-o')) O_CUOI = e.target; });
  el.addEventListener('keydown', function (e) {
    if (e.target.classList.contains('dc-ht-o') && e.key === 'Enter' && !e.shiftKey && !e.isComposing) {   // Enter: sang ô thoại kế tiếp
      e.preventDefault(); var sau = el.querySelector('.dc-ht-o[data-i="' + (+e.target.dataset.i + 1) + '"]'); if (sau) sau.focus(); else el.querySelector('.dc-ht-kt').focus(); return; }
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
