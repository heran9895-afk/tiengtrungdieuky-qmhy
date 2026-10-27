/* =========================================================
   TRÒ CHƠI CẢ LỚP (màn chiếu) · Tiếng Trung Diệu Kỳ
   4 trò: Rung chuông vàng (rung) · Đua xe theo đội (xe) · Ai là triệu phú (tp) · Ô chữ (oc). 2–4 đội.
   Mỗi đội một điện thoại vào trang choi/ bằng mã phòng (máy chủ QM_PHONG_API). Không có máy chủ hoặc mạng lỗi:
   cô bấm vào ô của đội để chấm thay (chế độ không điện thoại).

   Trang đặt cấu hình TRƯỚC khi nhúng file này:
     window.QM_LOP = { tro: 'rung', phamVi: 'h2-hsk1', tongHop: true, nhom: [ { ma, ten, tep: [...] }, … ] };
   Nhúng theo thứ tự: header.js, cau-hinh.js, tu-vung-chung.js, cau-hoi-tro-choi.js, phong-choi.js, tro-choi-lop.js.
   Không gửi điểm lên Bảng xếp hạng; kết quả hiện trên màn chiếu khi hết trò.
   ========================================================= */
(function () {
  var CF = window.QM_LOP || {};
  var el = document.getElementById('tro-choi-lop');
  if (!el || !window.QM_TV || !window.QM_CH) return;
  var TV = window.QM_TV, CH = window.QM_CH, P = window.QM_PHONG, esc = TV.esc, tron = CH.tron;
  var NOT = CH.NOT; NOT.mo = [[523.3, .08], [784, .12]]; NOT.chuong = [[1046.5, .12], [1318.5, .12], [1046.5, .2]]; NOT.dem = [[660, .08]];

  var TRO = {
    rung: { ten: 'Rung chuông vàng', ico: '🔔', moTa: 'Các đội cùng trả lời. Sai hoặc không trả lời mất 1 chuông, hết chuông bị loại. Đội trụ lại cuối cùng thắng.',
      tuyChon: { nhan: 'Số câu', ds: [10, 15, 20, 30], mac: 20 } },
    xe: { ten: 'Đua xe theo đội', ico: '🏎️', moTa: 'Các đội cùng trả lời. Đúng tiến 1 ô, đội đúng nhanh nhất tiến 2 ô. Đội về đích trước thắng.',
      tuyChon: { nhan: 'Đường đua', ds: [8, 12, 16], mac: 12, donVi: 'ô' } },
    tp: { ten: 'Ai là triệu phú', ico: '💰', moTa: 'Các đội lần lượt trả lời câu hỏi khó dần. Đúng leo 1 nấc, sai rơi về mốc an toàn. Mỗi đội có 3 quyền trợ giúp.',
      tuyChon: { nhan: 'Lượt mỗi đội', ds: [5, 8, 10], mac: 8 } },
    oc: { ten: 'Ô chữ', ico: '🧩', moTa: 'Các đội lần lượt chọn hàng ngang, gõ phiên âm không dấu. Đoán được từ khóa hàng dọc trước thì thắng lớn.',
      tuyChon: null }
  };
  var T = TRO[CF.tro] || TRO.rung, MA_TRO = TRO[CF.tro] ? CF.tro : 'rung';
  var DOI_MAC = [{ ten: 'Rồng', ico: '🐉', mau: 'do' }, { ten: 'Gấu trúc', ico: '🐼', mau: 'xanh' }, { ten: 'Hổ', ico: '🐯', mau: 'vang' }, { ten: 'Cá heo', ico: '🐬', mau: 'lam' }];
  var CHU = ['A', 'B', 'C', 'D'];
  var NAC = ['100', '200', '300', '500', '1.000', '2.000', '4.000', '8.000', '16.000', '32.000'], MOC = [5, 10];   // Triệu phú: 10 nấc, mốc an toàn nấc 5 và 10

  // ---------- Nhóm từ (bài) ----------
  var NHOM = (CF.nhom || []).slice();
  if (CF.tongHop && NHOM.length > 1) NHOM.push({ ma: 'tong-hop', ten: 'Tổng hợp', tongHop: true });
  function taiNhom(ma) {
    var n = NHOM.filter(function (x) { return x.ma === ma; })[0] || NHOM[0];
    var ds = n.tongHop ? NHOM.filter(function (x) { return !x.tongHop; }) : [n], tep = [];
    ds.forEach(function (x) { tep = tep.concat(x.tep); });
    return CH.taiNguon(tep).then(function (dl) { return CH.chuanBiDien(dl).then(function () { return dl; }); });
  }

  // ---------- Cài đặt (nhớ trên máy) ----------
  var KHOA_CAI = 'qm-lop-cai';
  var S = { nhom: NHOM[0] ? NHOM[0].ma : '', muc: 'tb', soDoi: 4, tenDoi: DOI_MAC.map(function (d) { return d.ten; }), tuyChon: {} };
  try { var luu = JSON.parse(localStorage.getItem(KHOA_CAI) || '{}'); Object.keys(luu).forEach(function (k) { S[k] = luu[k]; }); } catch (e) {}
  var thamSo = (location.search.match(/[?&]bai=([^&]+)/) || [])[1];
  if (thamSo && NHOM.some(function (n) { return n.ma === thamSo; })) S.nhom = thamSo;
  if (!NHOM.some(function (n) { return n.ma === S.nhom; })) S.nhom = NHOM[0] ? NHOM[0].ma : '';
  if (!CH.MUC_LOP[S.muc]) S.muc = 'tb';
  S.soDoi = Math.min(4, Math.max(2, +S.soDoi || 4));
  function luuCai() { try { localStorage.setItem(KHOA_CAI, JSON.stringify(S)); } catch (e) {} }
  function tuyChon() { var t = T.tuyChon; if (!t) return 0; var v = +S.tuyChon[MA_TRO]; return t.ds.indexOf(v) >= 0 ? v : t.mac; }

  // =========================================================
  // KHUNG
  // =========================================================
  el.innerHTML = '<div class="tl-khung"><div class="tl-noi"></div></div>';
  var khung = el.querySelector('.tl-khung'), noi = el.querySelector('.tl-noi');
  var PH = null;          // phòng: { ma, khoa, may: bool (có điện thoại), lech: lệch giờ máy chủ − máy này }
  var G = null;           // ván đang chơi
  var VAO = [{}, {}, {}, {}];   // máy đã vào từng đội

  function tenDoi(i) { return (S.tenDoi[i] || DOI_MAC[i].ten).slice(0, 18); }
  function doiHtml(i, nho) { return '<span class="tl-doi-ten ' + DOI_MAC[i].mau + (nho ? ' nho' : '') + '">' + DOI_MAC[i].ico + ' ' + esc(tenDoi(i)) + '</span>'; }
  function linkChoi() { return TV.ROOT + 'choi/' + (PH && PH.ma ? '?ma=' + PH.ma : ''); }

  // ---------- 1. Màn cài đặt ----------
  function manCai() {
    dungTatCa(); G = null;
    var t = T.tuyChon;
    noi.innerHTML = '<div class="tl-the tl-cai">' +
      '<div class="tl-cai-dau"><span class="tl-cai-ico">' + T.ico + '</span><div><h2>' + esc(T.ten) + '</h2><p>' + esc(T.moTa) + '</p></div></div>' +
      '<div class="tl-cai-luoi">' +
        '<label class="lt-o"><span class="lt-o-nhan">Bài</span><select class="tl-chon-nhom">' + NHOM.map(function (n) { return '<option value="' + esc(n.ma) + '">' + esc(n.ten) + '</option>'; }).join('') + '</select></label>' +
        '<label class="lt-o"><span class="lt-o-nhan">Mức độ</span><select class="tl-chon-muc">' + Object.keys(CH.MUC_LOP).map(function (k) { var m = CH.MUC_LOP[k]; return '<option value="' + k + '">' + m.ten + ' · ' + m.dap + ' đáp án · ' + giayCau(k) + ' giây</option>'; }).join('') + '</select></label>' +
        '<label class="lt-o"><span class="lt-o-nhan">Số đội</span><select class="tl-chon-doi">' + [2, 3, 4].map(function (n) { return '<option value="' + n + '">' + n + ' đội</option>'; }).join('') + '</select></label>' +
        (t ? '<label class="lt-o"><span class="lt-o-nhan">' + esc(t.nhan) + '</span><select class="tl-chon-tuy">' + t.ds.map(function (n) { return '<option value="' + n + '">' + n + (t.donVi ? ' ' + t.donVi : '') + '</option>'; }).join('') + '</select></label>' : '') +
      '</div>' +
      '<div class="tl-ten-doi"></div>' +
      '<div class="tl-cai-nut">' +
        '<button type="button" class="btn gold tl-tao">📱 Tạo phòng · các đội vào bằng điện thoại</button>' +
        '<button type="button" class="btn tl-khong-may">✋ Chơi không dùng điện thoại</button>' +
      '</div>' +
      (P && P.coMayChu() ? '' : '<p class="tl-ghi-chu">Máy chủ phòng chơi chưa được nối: hiện chỉ chơi được chế độ cô bấm chấm cho các đội.</p>') +
      '<p class="tl-ghi-chu">Câu hỏi trộn 4 dạng: nghe chọn chữ Hán · nghĩa → chữ Hán · chữ Hán → phiên âm · điền từ vào câu' + (MA_TRO === 'oc' ? ' (Ô chữ: gõ phiên âm không dấu)' : '') + '.</p>' +
    '</div>';
    var sN = noi.querySelector('.tl-chon-nhom'), sM = noi.querySelector('.tl-chon-muc'), sD = noi.querySelector('.tl-chon-doi'), sT = noi.querySelector('.tl-chon-tuy');
    sN.value = S.nhom; sM.value = S.muc; sD.value = S.soDoi; if (sT) sT.value = tuyChon();
    function veTen() {
      noi.querySelector('.tl-ten-doi').innerHTML = DOI_MAC.slice(0, S.soDoi).map(function (d, i) {
        return '<label class="tl-o-ten ' + d.mau + '"><span>' + d.ico + '</span><input type="text" maxlength="18" value="' + esc(tenDoi(i)) + '" data-i="' + i + '" aria-label="Tên đội ' + (i + 1) + '"></label>'; }).join('');
    }
    veTen();
    noi.addEventListener('change', function (e) {
      if (e.target === sN) S.nhom = sN.value;
      else if (e.target === sM) S.muc = sM.value;
      else if (e.target === sD) { S.soDoi = +sD.value; veTen(); }
      else if (e.target === sT) S.tuyChon[MA_TRO] = +sT.value;
      luuCai();
    });
    noi.addEventListener('input', function (e) { if (e.target.dataset.i != null) { S.tenDoi[+e.target.dataset.i] = e.target.value.trim() || DOI_MAC[+e.target.dataset.i].ten; luuCai(); } });
    var nutTao = noi.querySelector('.tl-tao');
    if (!(P && P.coMayChu())) { nutTao.disabled = true; nutTao.classList.add('sap-co'); }
    nutTao.addEventListener('click', function () {
      moKhoaAm(); vaoToanMan();
      nutTao.disabled = true; nutTao.textContent = 'Đang tạo phòng…';
      P.tao().then(function (o) {
        PH = { ma: o.ma, khoa: o.khoa, may: true, lech: o.t ? o.t - Date.now() : 0 };
        VAO = [{}, {}, {}, {}];
        manSanh();
      }).catch(function () {
        nutTao.disabled = false; nutTao.textContent = '📱 Tạo phòng · các đội vào bằng điện thoại';
        TV.baoLoi('Chưa tạo được phòng (mạng hoặc máy chủ). Cô thử lại, hoặc chơi không dùng điện thoại.');
      });
    });
    noi.querySelector('.tl-khong-may').addEventListener('click', function () { moKhoaAm(); vaoToanMan(); PH = { ma: '', may: false, lech: 0 }; batDauVan(); });
  }
  function giayCau(muc) { var g = CH.MUC_LOP[muc || S.muc].giay; return MA_TRO === 'oc' ? Math.round(g * 1.5) : MA_TRO === 'tp' ? Math.round(g * 1.5) : g; }

  // ---------- 2. Sảnh chờ: mã phòng + mã QR, các đội vào ----------
  function manSanh() {
    dungTatCa();
    var link = linkChoi();
    noi.innerHTML = '<div class="tl-the tl-sanh">' +
      '<div class="tl-sanh-trai">' +
        '<p class="tl-sanh-nhan">Mở điện thoại, quét mã hoặc vào</p>' +
        '<p class="tl-sanh-link">' + esc(link.replace(/^https?:\/\//, '').replace(/\?ma=\d+$/, '')) + '</p>' +
        '<p class="tl-sanh-nhan">rồi nhập mã phòng</p>' +
        '<div class="tl-ma-phong">' + esc(PH.ma) + '</div>' +
        '<div class="tl-qr" aria-label="Mã QR vào phòng"></div>' +
      '</div>' +
      '<div class="tl-sanh-phai">' +
        '<h3>' + T.ico + ' ' + esc(T.ten) + '</h3>' +
        '<div class="tl-sanh-doi"></div>' +
        '<p class="tl-ghi-chu">Mỗi đội một điện thoại (có thể nhiều máy, đáp án bấm trước được tính). Đội chưa có máy: cô bấm vào ô của đội để chấm thay.</p>' +
        '<div class="tl-cai-nut"><button type="button" class="btn gold tl-bat-dau">▶ Bắt đầu</button><button type="button" class="btn tl-ve-cai">‹ Đổi cài đặt</button></div>' +
      '</div></div>';
    veQR(noi.querySelector('.tl-qr'), link);
    noi.querySelector('.tl-bat-dau').addEventListener('click', function () { vaoToanMan(); batDauVan(); });
    noi.querySelector('.tl-ve-cai').addEventListener('click', manCai);
    veSanhDoi();
    dayLen({ gd: 'sanh' });
    batDauDoc(2000);
  }
  function veSanhDoi() {
    var k = noi.querySelector('.tl-sanh-doi'); if (!k) return;
    k.innerHTML = DOI_MAC.slice(0, S.soDoi).map(function (d, i) {
      var n = Object.keys(VAO[i] || {}).length;
      return '<div class="tl-sanh-o ' + d.mau + (n ? ' co' : '') + '">' + doiHtml(i) + '<span>' + (n ? '📱 ' + n + ' máy' : 'Chưa có máy') + '</span></div>'; }).join('');
  }
  function veQR(o, link) {
    if (window.QRCode) { try { new window.QRCode(o, { text: link, width: 200, height: 200, correctLevel: window.QRCode.CorrectLevel.M }); return; } catch (e) {} }
    o.innerHTML = '<a href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(link) + '</a>';
  }

  // =========================================================
  // LIÊN LẠC VỚI ĐIỆN THOẠI
  // =========================================================
  var hen = { doc: null, dem: null };
  var docKhoang = 0, dangDoc = false;
  function batDauDoc(ms) {
    docKhoang = ms;
    if (!PH || !PH.may || hen.doc) return;
    (function vong() {
      hen.doc = setTimeout(function () {
        if (!PH || !PH.may) { hen.doc = null; return; }
        if (dangDoc) return vong();
        dangDoc = true;
        P.doc(PH.ma, PH.khoa).then(function (o) { if (o.t) PH.lech = o.t - Date.now(); xuLyDoc(o); }).catch(function () {})
          .then(function () { dangDoc = false; if (hen.doc) vong(); });
      }, docKhoang);
    })();
  }
  function dungTatCa() {
    if (hen.doc) clearTimeout(hen.doc); hen.doc = null;
    if (hen.dem) clearInterval(hen.dem); hen.dem = null;
    TV.dungDoc();
  }
  function xuLyDoc(o) {
    (o.v || []).forEach(function (v, i) { VAO[i] = v || {}; });
    if (!G) { veSanhDoi(); return; }
    veDoi();
    var g = o.g || {};
    (g.dap || []).forEach(function (b, d) { if (b) nhanBai(d, 'dap', b); });
    (g.tg || []).forEach(function (b, d) { if (b) nhanBai(d, 'tg', b); });
    (g.hang || []).forEach(function (b, d) { if (b) nhanBai(d, 'hang', b); });
    (g.khoa || []).forEach(function (b, d) { if (b) nhanBai(d, 'khoa', b); });
  }
  // Trạng thái gửi cho điện thoại (không chứa đáp án đúng khi câu đang mở)
  function dayLen(them) {
    if (!PH || !PH.may) return;
    var s = { v: Date.now(), tro: MA_TRO, ten: T.ten, doi: DOI_MAC.slice(0, S.soDoi).map(function (d, i) { return { ten: tenDoi(i), ico: d.ico, mau: d.mau }; }) };
    if (G) {
      s.gd = G.gd; s.id = G.id; s.diem = G.doi.map(function (d) { return d.diem; });
      s.phu = G.doi.map(function (d) { return phuDoi(d); });
      s.loai = G.doi.map(function (d) { return !!d.loai; });
      s.luot = G.luot;
      if (G.cau) {
        var C = G.cau, q = C.q;
        s.cau = { id: C.id, so: G.soCau, tong: tongCauHien(), txt: q.de.txt, deHan: !!q.de.han, han: q.han, dap: q.dap.map(function (x) { return x.txt; }),
          mo: C.mo, ai: C.ai, an: C.an || [], conLai: C.mo ? Math.max(0, Math.round((C.het - Date.now()) / 1000)) : 0, ten: q.ten, ico: q.ico };
        if (!C.mo) { s.cau.dung = q.dung; s.cau.kq = G.doi.map(function (d, i) { return C.kq ? C.kq[i] : ''; }); }
        if (MA_TRO === 'tp') s.cau.tg = G.doi[G.luot].tg;
      }
      if (G.oc) s.oc = ocChoDienThoai();
      if (G.ket) s.ket = G.ket;
    }
    if (them) Object.keys(them).forEach(function (k) { s[k] = them[k]; });
    P.ghi(PH.ma, PH.khoa, s);
  }
  function phuDoi(d) {   // dòng phụ dưới tên đội trên điện thoại
    if (MA_TRO === 'rung') return d.loai ? 'Bị loại' : '🔔 ' + d.chuong;
    if (MA_TRO === 'xe') return '🏁 ' + d.o + '/' + G.dich + ' ô';
    if (MA_TRO === 'tp') return 'Nấc ' + d.nac + (d.nac ? ' · ' + NAC[d.nac - 1] : '');
    return '';
  }
  function tongCauHien() { return MA_TRO === 'rung' ? G.tong : MA_TRO === 'tp' ? G.tong : 0; }

  // =========================================================
  // VÁN CHƠI
  // =========================================================
  function batDauVan() {
    dungTatCa();
    noi.innerHTML = '<div class="tl-the"><div class="tv-trong">Đang chuẩn bị câu hỏi…</div></div>';
    taiNhom(S.nhom).then(function (dl) {
      G = { dl: dl, id: Math.random().toString(36).slice(2, 7), gd: 'cho', soCau: 0, daDung: {}, luot: 0, cau: null, ket: null,
        doi: DOI_MAC.slice(0, S.soDoi).map(function (d, i) { return { i: i, diem: 0, chuong: 3, o: 0, nac: 0, loai: false, dung: 0, tg: { nam: 1, doi: 1, gio: 1 }, daDoanKhoa: false }; }) };
      if (MA_TRO === 'rung') { G.tong = tuyChon(); G.cuuTro = 1; }
      if (MA_TRO === 'xe') G.dich = tuyChon();
      if (MA_TRO === 'tp') { G.luotMoiDoi = tuyChon(); G.tong = G.luotMoiDoi * S.soDoi; }
      if (MA_TRO === 'oc') { G.oc = taoOChu(dl); if (!G.oc) { noi.innerHTML = '<div class="tl-the"><div class="tv-trong">Bài này chưa đủ từ để dựng ô chữ. Cô chọn Tổng hợp hoặc bài khác nhé.</div><button type="button" class="btn tl-ve-cai">‹ Đổi cài đặt</button></div>'; noi.querySelector('.tl-ve-cai').addEventListener('click', manCai); return; } }
      veSan();
      setTimeout(cuonToiKhung, 50);
      if (MA_TRO === 'oc') ocChonHang(); else moCau();
      batDauDoc(1000);
    }).catch(function () {
      noi.innerHTML = '<div class="tl-the"><div class="tv-trong">Chưa tải được dữ liệu, cô kiểm tra mạng rồi thử lại nhé.</div><button type="button" class="btn tl-ve-cai">‹ Đổi cài đặt</button></div>';
      noi.querySelector('.tl-ve-cai').addEventListener('click', manCai);
    });
  }

  // ---------- Khung sân chơi ----------
  function veSan() {
    noi.innerHTML =
      '<div class="tl-san tro-' + MA_TRO + '">' +
        '<div class="tl-thanh-tren">' +
          '<span class="tl-tieu-de">' + T.ico + ' ' + esc(T.ten) + '</span>' +
          (PH.may ? '<span class="tl-ma-nho">Mã phòng <b>' + esc(PH.ma) + '</b></span>' : '<span class="tl-ma-nho">✋ Cô chấm</span>') +
          '<span class="tl-tien-do"></span>' +
          '<span class="tl-nut-tren">' +
            '<button type="button" class="tl-nut tl-nghe" title="Nghe lại">🔊</button>' +
            (MA_TRO === 'rung' ? '<button type="button" class="tl-nut tl-cuu" title="Cứu trợ: các đội bị loại được 1 chuông (1 lần)">🛟 Cứu trợ</button>' : '') +
            '<button type="button" class="tl-nut tl-am" title="Bật / tắt âm hiệu ứng"></button>' +
            '<button type="button" class="tl-nut tl-toan" title="Toàn màn hình">⛶</button>' +
            '<button type="button" class="tl-nut tl-ket" title="Kết thúc trò">✕</button>' +
          '</span>' +
        '</div>' +
        '<div class="tl-doi-ds"></div>' +
        '<div class="tl-giua"><div class="tl-bang"></div><div class="tl-cau-khu"></div></div>' +
        '<div class="tl-chan"></div>' +
      '</div>';
    noi.querySelector('.tl-nghe').addEventListener('click', docLai);
    noi.querySelector('.tl-toan').addEventListener('click', toanManHinh);
    noi.querySelector('.tl-ket').addEventListener('click', function () { if (confirm('Kết thúc trò và xem kết quả?')) ketThuc(); });
    var nutAm = noi.querySelector('.tl-am');
    function veAm() { nutAm.textContent = CH.AM.bat ? '🔔' : '🔕'; }
    veAm();
    nutAm.addEventListener('click', function () { CH.AM.bat = !CH.AM.bat; try { localStorage.setItem('qm-am-hieu-ung', CH.AM.bat ? '1' : '0'); } catch (e) {} veAm(); });
    var cuu = noi.querySelector('.tl-cuu');
    if (cuu) cuu.addEventListener('click', cuuTro);
    noi.querySelector('.tl-doi-ds').addEventListener('click', function (e) { var o = e.target.closest('.tl-doi'); if (o) moChamTay(+o.dataset.i, o); });
    veDoi(); veBang();
  }
  // Màn chiếu: vào toàn màn hình khi cô bấm tạo phòng / bắt đầu (trình duyệt chỉ cho khi có thao tác bấm);
  // không vào được thì cuộn khung chơi lên sát dưới thanh menu
  function vaoToanMan() {
    var f = document.fullscreenElement || document.webkitFullscreenElement;
    if (!f) { try { var r = (khung.requestFullscreen || khung.webkitRequestFullscreen).call(khung); if (r && r.catch) r.catch(function () {}); } catch (e) {} }
    setTimeout(cuonToiKhung, 300);
  }
  function cuonToiKhung() {
    if (document.fullscreenElement || document.webkitFullscreenElement) return;
    var h = document.querySelector('.sh-header'), cao = h ? h.getBoundingClientRect().height : 0;
    window.scrollTo({ top: khung.getBoundingClientRect().top + window.scrollY - cao - 6, behavior: 'smooth' });
  }
  function toanManHinh() {
    var f = document.fullscreenElement || document.webkitFullscreenElement;
    if (f) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    else (khung.requestFullscreen || khung.webkitRequestFullscreen || function () {}).call(khung);
  }
  function docLai() {
    if (!G) return;
    if (G.cau && G.cau.q.de.doc && G.cau.mo) TV.doc(G.cau.q.de.doc);
    else if (G.cau && !G.cau.mo && G.cau.q.docGiai) TV.doc(G.cau.q.docGiai);
    else if (G.oc && G.oc.hang != null) { var r = G.oc.hangDs[G.oc.hang]; if (r) TV.doc(r.w.docTxt); }
  }

  // Ô các đội: tên, điểm / chuông / vị trí, trạng thái trả lời, số máy
  function veDoi() {
    var k = noi.querySelector('.tl-doi-ds'); if (!k || !G) return;
    k.innerHTML = G.doi.map(function (d, i) {
      var tt = '', C = G.cau;
      if (C && C.mo && C.ai.indexOf(i) >= 0) tt = C.tl[i] ? '<b class="tl-da">✓ Đã chọn</b>' : '<span class="tl-nghi">… đang nghĩ</span>';
      else if (C && !C.mo && C.kq) tt = C.kq[i] === 'dung' ? '<b class="tl-dung">✓ Đúng</b>' : C.kq[i] === 'sai' ? '<b class="tl-sai">✗ Sai</b>' : C.kq[i] === 'trong' ? '<b class="tl-sai">— Không trả lời</b>' : '';
      if (G.oc) tt = ocTrangThaiDoi(i);
      var phu = MA_TRO === 'rung' ? (d.loai ? '<span class="tl-loai-chu">Bị loại</span>' : '<span class="tl-chuong">' + '🔔'.repeat(d.chuong) + '<i>' + '🔔'.repeat(3 - d.chuong) + '</i></span>')
        : MA_TRO === 'xe' ? '<span>🏁 ' + d.o + '/' + G.dich + '</span>'
        : MA_TRO === 'tp' ? '<span>Nấc ' + d.nac + ' · ' + (d.nac ? NAC[d.nac - 1] : '0') + '</span>' + '<span class="tl-tg-nho">' + (d.tg.nam ? '½' : '<s>½</s>') + ' ' + (d.tg.doi ? '🔄' : '<s>🔄</s>') + ' ' + (d.tg.gio ? '⏱' : '<s>⏱</s>') + '</span>'
        : '';
      var may = PH.may ? Object.keys(VAO[i] || {}).length : 0;
      return '<button type="button" class="tl-doi ' + DOI_MAC[i].mau + (d.loai ? ' loai' : '') + (G.luot === i && (MA_TRO === 'tp' || MA_TRO === 'oc') ? ' luot' : '') + '" data-i="' + i + '" title="Bấm để chấm thay cho đội">' +
        '<span class="tl-doi-dau">' + DOI_MAC[i].ico + ' ' + esc(tenDoi(i)) + (PH.may ? '<small class="tl-may">' + (may ? '📱' + may : '📵') + '</small>' : '') + '</span>' +
        '<span class="tl-doi-diem">' + d.diem + '<small> điểm</small></span>' + phu + '<span class="tl-doi-tt">' + tt + '</span></button>';
    }).join('');
  }

  // ---------- Câu hỏi (Rung chuông vàng, Đua xe, Triệu phú) ----------
  function mucCau() {
    if (MA_TRO !== 'tp') return S.muc;
    var n = G.doi[G.luot].nac + 1;                       // Triệu phú: khó dần theo nấc
    return n <= 3 ? 'de' : n <= 7 ? 'tb' : 'kho';
  }
  function soDapCau() { return MA_TRO === 'tp' ? 4 : CH.MUC_LOP[S.muc].dap; }
  function moCau(giuLuot) {
    var q = CH.bocCauLop(G.dl, CH.THU_TU_LOP, mucCau(), soDapCau(), G.daDung);
    if (!q) { TV.baoLoi('Không bốc được câu hỏi.'); return ketThuc(); }
    G.soCau++;
    var ai = MA_TRO === 'tp' ? [G.luot] : G.doi.filter(function (d) { return !d.loai; }).map(function (d) { return d.i; });
    var giay = giayCau();
    G.cau = { id: G.id + '-' + G.soCau, q: q, mo: true, ai: ai, tl: {}, kq: null, an: [], het: Date.now() + giay * 1000, giay: giay, nac: G.doi[G.luot].nac + 1 };
    G.gd = 'cau';
    amThanh('mo');
    veCau(); veDoi(); veBang(); veTienDo();
    if (q.de.doc) setTimeout(function () { if (G && G.cau && G.cau.q === q) TV.doc(q.de.doc); }, 350);
    chayDem();
    dayLen();
    batDauDoc(1000);
  }
  function veTienDo() {
    var t = noi.querySelector('.tl-tien-do'); if (!t || !G) return;
    t.innerHTML = MA_TRO === 'rung' ? 'Câu <b>' + G.soCau + '</b>/' + G.tong
      : MA_TRO === 'tp' ? 'Lượt <b>' + Math.min(G.soCau, G.tong) + '</b>/' + G.tong
      : MA_TRO === 'xe' ? 'Câu <b>' + G.soCau + '</b>' : '';
  }
  function chayDem() {
    if (hen.dem) clearInterval(hen.dem);
    hen.dem = setInterval(function () {
      if (!G) return clearInterval(hen.dem);
      var het = G.cau && G.cau.mo ? G.cau.het : G.oc && G.oc.het ? G.oc.het : 0;
      if (!het) return;
      var con = Math.max(0, het - Date.now()), tong = (G.cau && G.cau.mo ? G.cau.giay : G.oc.giay) * 1000;
      var v = noi.querySelector('.tl-dong-ho');
      if (v) { v.style.setProperty('--p', (con / tong * 100).toFixed(1)); v.querySelector('b').textContent = Math.ceil(con / 1000); v.classList.toggle('gap', con < 4000); }
      if (con <= 0) { clearInterval(hen.dem); hen.dem = null; if (G.cau && G.cau.mo) dongCau(); else if (G.oc) ocHetGio(); }
    }, 200);
  }
  function dongHo() { return '<div class="tl-dong-ho"><b></b></div>'; }

  function veCau() {
    var k = noi.querySelector('.tl-cau-khu'), C = G.cau, q = C.q;
    var luot = MA_TRO === 'tp' ? '<div class="tl-luot">' + doiHtml(G.luot) + ' trả lời · câu nấc ' + C.nac + ' (' + NAC[C.nac - 1] + ')</div>' : '';
    k.innerHTML = luot +
      '<div class="tl-de"><div class="tl-de-dau"><span class="tl-dang">' + q.ico + ' ' + esc(q.ten) + '</span>' + (C.mo ? dongHo() : '') + '</div>' +
        '<div class="tl-de-noi">' + q.de.html + (q.de.doc && C.mo ? '<button type="button" class="tl-nghe-to">🔊 Nghe lại</button>' : '') + '</div>' +
        (q.de.viet && C.mo ? '<button type="button" class="tl-goi-y">💡 Gợi ý nghĩa câu</button>' : '') +
      '</div>' +
      '<div class="tl-dap' + (q.han ? ' han' : '') + ' so' + q.dap.length + '">' + q.dap.map(function (x, i) {
        var cls = 'tl-dap-o', ai = '';
        if ((C.an || []).indexOf(i) >= 0) cls += ' an';
        if (!C.mo) {
          cls += i === q.dung ? ' dung' : ' mo';
          ai = G.doi.filter(function (d) { return C.tl[d.i] && +C.tl[d.i].x === i; }).map(function (d) { return '<span class="tl-ai ' + DOI_MAC[d.i].mau + '">' + DOI_MAC[d.i].ico + '</span>'; }).join('');
        }
        return '<button type="button" class="' + cls + '" data-i="' + i + '"><b>' + CHU[i] + '</b><span class="tl-dap-chu">' + x.html + '</span><span class="tl-ai-ds">' + ai + '</span></button>';
      }).join('') + '</div>' +
      (!C.mo ? '<div class="tl-giai">' + TV.nutLoa(q.docGiai || '') + '<span>' + q.giai + '</span>' + veKetCau() + '</div>' : '') +
      '<div class="tl-hanh-dong">' + (C.mo ? '<button type="button" class="btn tl-mo-dap">Hiện đáp án</button>' : '<button type="button" class="btn gold tl-tiep">Câu tiếp ›</button>') + '</div>';
    var nt = k.querySelector('.tl-nghe-to'); if (nt) nt.addEventListener('click', docLai);
    var gy = k.querySelector('.tl-goi-y'); if (gy) gy.addEventListener('click', function () { gy.outerHTML = '<div class="tl-goi-y-chu">' + esc(q.de.viet) + '</div>'; });
    var md = k.querySelector('.tl-mo-dap'); if (md) md.addEventListener('click', function () { if (G.cau.mo) dongCau(); });
    var tp = k.querySelector('.tl-tiep'); if (tp) tp.addEventListener('click', cauSau);
    // Triệu phú / không điện thoại: cô bấm đáp án thay cho đội đang trả lời
    k.querySelector('.tl-dap').addEventListener('click', function (e) {
      var b = e.target.closest('.tl-dap-o'); if (!b || !G.cau.mo) return;
      if (MA_TRO === 'tp') nhanDap(G.luot, +b.dataset.i, Date.now() + PH.lech, true);
    });
    if (C.mo) chayDem();
  }
  function veKetCau() { return G.cau.loiKet ? '<div class="tl-loi-ket">' + G.cau.loiKet + '</div>' : ''; }

  // Đội gửi bài (điện thoại hoặc cô chấm thay)
  function nhanBai(d, loai, b) {
    if (!G || d >= G.doi.length) return;
    if (G.oc) return ocNhanBai(d, loai, b);
    var C = G.cau; if (!C) return;
    if (loai === 'dap' && b.c === C.id) nhanDap(d, +b.x, b.t);
    if (loai === 'tg' && MA_TRO === 'tp' && b.c === C.id && d === G.luot) troGiup(b.x);
  }
  function nhanDap(d, x, t, tay) {
    var C = G.cau;
    if (!C || !C.mo || C.ai.indexOf(d) < 0 || C.tl[d] || !(x >= 0 && x < C.q.dap.length) || (C.an || []).indexOf(x) >= 0) return;
    C.tl[d] = { x: x, t: t || Date.now() + PH.lech, tay: !!tay };
    CH.amThanh('cham');
    veDoi();
    if (C.ai.every(function (i) { return C.tl[i]; })) setTimeout(function () { if (G && G.cau === C && C.mo) dongCau(); }, 500);
  }
  NOT.cham = [[660, .045]];
  function amThanh(l) { CH.amThanh(l); }

  // Hết giờ hoặc mọi đội đã chọn: chấm, hiện đáp án
  function dongCau() {
    var C = G.cau; if (!C || !C.mo) return;
    C.mo = false; G.gd = 'dap';
    if (hen.dem) { clearInterval(hen.dem); hen.dem = null; }
    var q = C.q;
    C.kq = G.doi.map(function (d) { if (C.ai.indexOf(d.i) < 0) return ''; var t = C.tl[d.i]; return !t ? 'trong' : t.x === q.dung ? 'dung' : 'sai'; });
    var dungDs = C.ai.filter(function (i) { return C.kq[i] === 'dung'; }).sort(function (a, b) { return C.tl[a].t - C.tl[b].t; });
    C.nhanh = dungDs[0];
    CHAM[MA_TRO](C, dungDs);
    amThanh(dungDs.length ? 'dung' : 'sai');
    veCau(); veDoi(); veBang();
    if (q.docGiai) setTimeout(function () { TV.doc(q.docGiai); }, 300);
    dayLen();
    if (ketThucChua()) {
      var tp = noi.querySelector('.tl-tiep'); if (tp) tp.textContent = 'Xem kết quả 🏆';
    }
  }
  function cauSau() {
    if (!G) return;
    if (ketThucChua()) return ketThuc();
    if (MA_TRO === 'tp') { G.luot = luotTiep(G.luot); }
    moCau();
  }
  function luotTiep(i) { return (i + 1) % G.doi.length; }

  // Chấm điểm từng trò
  var CHAM = {
    rung: function (C, dungDs) {
      var biTru = C.ai.filter(function (i) { return C.kq[i] !== 'dung'; });
      dungDs.forEach(function (i, k) { G.doi[i].diem += 10 + (k === 0 ? 5 : 0); G.doi[i].dung++; });
      if (biTru.length === C.ai.length && C.ai.length > 1) { C.loiKet = 'Cả lớp cùng chưa đúng: không đội nào mất chuông 🙌'; return; }
      var bias = [];
      biTru.forEach(function (i) { var d = G.doi[i]; d.chuong--; if (d.chuong <= 0) { d.chuong = 0; d.loai = true; bias.push(i); } });
      if (bias.length) { amThanh('sai'); C.loiKet = bias.map(function (i) { return doiHtml(i, true); }).join(' ') + ' hết chuông, bị loại!'; }
      else if (dungDs.length) C.loiKet = doiHtml(dungDs[0], true) + ' trả lời đúng nhanh nhất (+5)';
    },
    xe: function (C, dungDs) {
      dungDs.forEach(function (i, k) { var d = G.doi[i]; d.o = Math.min(G.dich, d.o + (k === 0 ? 2 : 1)); d.diem = d.o * 10; d.dung++; });
      if (dungDs.length) C.loiKet = doiHtml(dungDs[0], true) + ' đúng nhanh nhất: tiến 2 ô! 🚀';
    },
    tp: function (C, dungDs) {
      var d = G.doi[G.luot];
      if (dungDs.length) { d.nac = Math.min(10, d.nac + 1); d.dung++; C.loiKet = doiHtml(G.luot, true) + ' leo lên nấc ' + d.nac + ' · ' + NAC[d.nac - 1] + (MOC.indexOf(d.nac) >= 0 ? ' 🛡️ (mốc an toàn)' : ''); }
      else { var cu = d.nac; d.nac = d.nac >= 5 ? 5 : 0; C.loiKet = doiHtml(G.luot, true) + (cu === d.nac ? ' giữ nấc ' + d.nac : ' rơi về ' + (d.nac ? 'mốc nấc 5' : 'nấc 0')); }
      d.diem = d.nac ? +NAC[d.nac - 1].replace(/\./g, '') : 0;
    }
  };
  function ketThucChua() {
    if (MA_TRO === 'rung') { var con = G.doi.filter(function (d) { return !d.loai; }); return G.soCau >= G.tong || con.length <= 1; }
    if (MA_TRO === 'xe') return G.doi.some(function (d) { return d.o >= G.dich; }) || G.soCau >= 60;
    if (MA_TRO === 'tp') return G.soCau >= G.tong || G.doi.some(function (d) { return d.nac >= 10; });
    return false;
  }
  function cuuTro() {
    if (!G || MA_TRO !== 'rung') return;
    if (!G.cuuTro) return TV.baoLoi('Đã dùng quyền cứu trợ rồi.');
    var bi = G.doi.filter(function (d) { return d.loai; });
    if (!bi.length) return TV.baoLoi('Chưa có đội nào bị loại.');
    if (!confirm('Cứu trợ: ' + bi.length + ' đội bị loại được quay lại với 1 chuông (chỉ dùng 1 lần)?')) return;
    G.cuuTro = 0; bi.forEach(function (d) { d.loai = false; d.chuong = 1; });
    amThanh('chuong'); veDoi(); dayLen();
    var c = noi.querySelector('.tl-cuu'); if (c) c.disabled = true;
  }

  // Triệu phú: quyền trợ giúp (50:50, đổi câu, thêm 15 giây), mỗi đội mỗi quyền 1 lần
  function troGiup(k) {
    var C = G.cau, d = G.doi[G.luot]; if (!C || !C.mo) return;
    if (k === '5050' && d.tg.nam) {
      d.tg.nam = 0;
      C.an = tron(C.q.dap.map(function (x, i) { return i; }).filter(function (i) { return i !== C.q.dung; })).slice(0, 2);
      amThanh('mo'); veCau(); veDoi(); dayLen();
    } else if (k === 'doi' && d.tg.doi) {
      d.tg.doi = 0; G.soCau--; amThanh('mo'); moCau();
    } else if (k === 'gio' && d.tg.gio) {
      d.tg.gio = 0; C.het += 15000; C.giay += 15; amThanh('mo'); veDoi(); dayLen();
    }
  }

  // Cô bấm vào ô đội: chọn đáp án thay đội (khi đội không có điện thoại / mạng lỗi)
  function moChamTay(i, o) {
    if (!G) return;
    var cu = noi.querySelector('.tl-pop'); if (cu) cu.remove();
    var html = '';
    if (G.oc) html = ocChamTayHtml(i);
    else if (G.cau && G.cau.mo && G.cau.ai.indexOf(i) >= 0 && !G.cau.tl[i]) {
      html = '<p>Chọn thay ' + doiHtml(i, true) + '</p><div class="tl-pop-nut">' + G.cau.q.dap.map(function (x, k) { return (G.cau.an || []).indexOf(k) >= 0 ? '' : '<button type="button" data-x="' + k + '">' + CHU[k] + '</button>'; }).join('') + '</div>' +
        (MA_TRO === 'tp' ? '<div class="tl-pop-nut tg">' + (G.doi[i].tg.nam ? '<button type="button" data-tg="5050">50:50</button>' : '') + (G.doi[i].tg.doi ? '<button type="button" data-tg="doi">🔄 Đổi câu</button>' : '') + (G.doi[i].tg.gio ? '<button type="button" data-tg="gio">⏱ +15 giây</button>' : '') + '</div>' : '');
    }
    if (!html) return;
    var p = document.createElement('div'); p.className = 'tl-pop'; p.innerHTML = html + '<button type="button" class="tl-pop-x" aria-label="Đóng">✕</button>';
    o.appendChild(p);
    p.addEventListener('click', function (e) {
      e.stopPropagation();
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.x != null) nhanDap(i, +b.dataset.x, Date.now() + PH.lech, true);
      if (b.dataset.tg) troGiup(b.dataset.tg);
      if (b.dataset.oc) ocChamTay(i, b.dataset.oc);
      p.remove();
    });
  }

  // ---------- Bảng riêng của từng trò ----------
  function veBang() {
    var b = noi.querySelector('.tl-bang'); if (!b || !G) return;
    if (MA_TRO === 'xe') {
      b.innerHTML = '<div class="tl-duong">' + G.doi.map(function (d, i) {
        var o = ''; for (var k = 0; k <= G.dich; k++) o += '<i class="' + (k === G.dich ? 'dich' : '') + '"></i>';
        return '<div class="tl-lan ' + DOI_MAC[i].mau + '"><span class="tl-lan-ten">' + DOI_MAC[i].ico + '</span><div class="tl-lan-o" style="--n:' + (G.dich + 1) + '">' + o +
          '<span class="tl-xe" style="--vt:' + d.o + '">🏎️</span></div></div>';
      }).join('') + '</div>';
    } else if (MA_TRO === 'tp') {
      b.innerHTML = '<ol class="tl-thang">' + NAC.map(function (n, k) {
        var nac = 10 - k, o = G.doi.filter(function (d) { return d.nac === nac; }).map(function (d) { return '<span class="tl-ai ' + DOI_MAC[d.i].mau + '">' + DOI_MAC[d.i].ico + '</span>'; }).join('');
        return '<li class="' + (MOC.indexOf(nac) >= 0 ? 'moc' : '') + (G.cau && G.cau.nac === nac ? ' dang' : '') + '"><b>' + nac + '</b><span>' + NAC[nac - 1] + '</span><em>' + o + '</em></li>';
      }).join('') + '</ol>';
    } else if (MA_TRO === 'oc') ocVeLuoi();
    else b.innerHTML = '';
  }

  // =========================================================
  // Ô CHỮ
  // =========================================================
  function chuCai(w) { return w.tach ? w.tach.am.map(function (a) { return a.goc; }).join('') : ''; }   // phiên âm không dấu, ü = v
  function hienChu(c) { return c === 'v' ? 'ü' : c; }
  function taoOChu(dl) {
    var tu = dl.tu.filter(function (w) { var c = chuCai(w); return c.length >= 2 && c.length <= 11 && w.nghia; });
    var theoChu = {}; tu.forEach(function (w) { theoChu[chuCai(w)] = theoChu[chuCai(w)] || w; });
    tu = Object.keys(theoChu).map(function (k) { return theoChu[k]; });
    var ungVien = tron(tu.filter(function (w) { var n = chuCai(w).length; return n >= 4 && n <= 8; }));
    ungVien.sort(function (a, b) { return Math.abs(chuCai(a).length - 6) - Math.abs(chuCai(b).length - 6) + (Math.random() - .5); });
    for (var u = 0; u < ungVien.length && u < 60; u++) {
      var k = ungVien[u], kc = chuCai(k), da = {}, hang = [], ok = true;
      da[kc] = 1;
      for (var j = 0; j < kc.length && ok; j++) {
        var ch = kc[j], hop = tron(tu.filter(function (w) { var c = chuCai(w); return !da[c] && c.indexOf(ch) >= 0 && c.length >= 2 && w.han !== k.han && k.han.indexOf(w.han) < 0; }));
        hop.sort(function (a, b) { return (chuCai(b).length >= 3) - (chuCai(a).length >= 3); });
        if (!hop.length) { ok = false; break; }
        var w = hop[0], c = chuCai(w), vt = [];
        for (var x = 0; x < c.length; x++) if (c[x] === ch) vt.push(x);
        da[c] = 1;
        var goiY = tron(['nghia', 'han'].concat(w.choDoc && !w.khongDocRieng ? ['nghe'] : []))[0];
        hang.push({ w: w, chu: c, vt: vt[Math.floor(Math.random() * vt.length)], goiY: goiY, tt: '' });   // tt: '' chưa mở · 'mo' đã giải · 'hong' không đội nào giải được
      }
      if (ok) {
        var trai = Math.max.apply(null, hang.map(function (h) { return h.vt; })), phai = Math.max.apply(null, hang.map(function (h) { return h.chu.length - 1 - h.vt; }));
        return { khoa: k, khoaChu: kc, hangDs: hang, trai: trai, rong: trai + 1 + phai, gd: 'chon', hang: null, het: 0, giay: 0, lanThu: '' };
      }
    }
    return null;
  }
  function ocVeLuoi() {
    var b = noi.querySelector('.tl-bang'), O = G.oc; if (!b) return;
    var xongHet = G.gd === 'ket' || O.gd === 'het';
    b.innerHTML = '<div class="tl-oc" style="--cot:' + O.rong + '">' + O.hangDs.map(function (h, r) {
      var o = '', lech = O.trai - h.vt;
      for (var c = 0; c < O.rong; c++) {
        var k = c - lech, coO = k >= 0 && k < h.chu.length, khoa = c === O.trai;
        var hien = coO && (h.tt === 'mo' || xongHet) ? hienChu(h.chu[k]) : '';
        o += coO ? '<i class="' + (khoa ? 'khoa ' : '') + (h.tt === 'hong' ? 'hong ' : '') + (hien ? 'lo' : '') + '">' + hien + '</i>' : '<i class="trong"></i>';
      }
      return '<button type="button" class="tl-oc-hang' + (O.hang === r ? ' dang' : '') + (h.tt ? ' ' + h.tt : '') + '" data-r="' + r + '"><span class="tl-oc-so">' + (r + 1) + '</span><span class="tl-oc-o">' + o + '</span></button>';
    }).join('') + '</div>' +
    '<div class="tl-oc-khoa">🔑 Từ khóa hàng dọc: <b>' + O.khoaChu.length + ' chữ cái</b>' + (O.hangDs.filter(function (h) { return h.tt; }).length * 2 >= O.hangDs.length ? ' · gợi ý: <i>' + esc(O.khoa.nghia) + '</i>' : '') +
      (xongHet ? '<div class="tl-oc-dap"><span class="hanzi">' + esc(O.khoa.han) + '</span> <b>' + esc(O.khoa.py) + '</b> · ' + esc(O.khoa.nghia) + '</div>' : '') + '</div>';
    b.querySelector('.tl-oc').addEventListener('click', function (e) {
      var h = e.target.closest('.tl-oc-hang'); if (!h || O.gd !== 'chon') return;
      ocMoHang(+h.dataset.r);
    });
  }
  function ocChoDienThoai() {
    var O = G.oc;
    var soXong = O.hangDs.filter(function (h) { return h.tt; }).length;
    return { gd: O.gd, luot: G.luot, hang: O.hang, so: O.hangDs.length,
      chonId: 'chon' + G.id + '-' + soXong, dapId: O.hang != null ? ocCau(O.hang) : '', khoaId: 'k' + G.id,
      ds: O.hangDs.map(function (h) { return { dai: h.chu.length, tt: h.tt }; }), khoaDai: O.khoaChu.length, lanThu: O.lanThu,
      conLai: O.het ? Math.max(0, Math.round((O.het - Date.now()) / 1000)) : 0,
      daDoan: G.doi.map(function (d) { return d.daDoanKhoa; }), choGianh: O.choGianh || [] };
  }
  function ocTrangThaiDoi(i) {
    var O = G.oc, d = G.doi[i], s = '';
    if (O.gd === 'chon' && G.luot === i) s = '<span class="tl-nghi">đang chọn hàng…</span>';
    if (O.gd === 'hang' && G.luot === i) s = '<span class="tl-nghi">đang trả lời…</span>';
    if (O.gd === 'gianh' && (O.choGianh || []).indexOf(i) >= 0) s = O.daGianh && O.daGianh[i] ? '<b class="tl-sai">✗</b>' : '<span class="tl-nghi">giành quyền…</span>';
    if (O.gd === 'khoa') s = d.daDoanKhoa ? '<b class="tl-sai">đã đoán</b>' : '<span class="tl-nghi">đoán từ khóa…</span>';
    if (d.daDoanKhoa && O.gd !== 'khoa') s += ' <small class="tl-sai">🔑✗</small>';
    return s;
  }
  function ocCau(r) { return 'oc' + G.id + '-' + r + '-' + G.oc.lanThu; }
  function ocChonHang() {
    var O = G.oc;
    var con = O.hangDs.filter(function (h) { return !h.tt; });
    if (!con.length) return ocVongKhoa();
    O.gd = 'chon'; O.hang = null; O.het = 0; G.gd = 'oc';
    var k = noi.querySelector('.tl-cau-khu');
    k.innerHTML = '<div class="tl-luot">' + doiHtml(G.luot) + ' chọn một hàng ngang</div>' +
      '<p class="tl-ghi-chu tl-to">Đội chọn trên điện thoại, hoặc cô bấm vào hàng trên ô chữ.</p>' +
      '<p class="tl-ghi-chu">Đội nào cũng có thể <b>đoán từ khóa</b> bất cứ lúc nào trên điện thoại (mỗi đội 1 lần).</p>';
    veBang(); veDoi(); dayLen();
  }
  function ocMoHang(r) {
    var O = G.oc, h = O.hangDs[r]; if (!h || h.tt || O.gd !== 'chon') return;
    O.hang = r; O.gd = 'hang'; O.lanThu = 'a'; O.giay = giayCau(); O.het = Date.now() + O.giay * 1000; O.choGianh = []; O.daGianh = {};
    amThanh('mo');
    ocVeGoiY(); veBang(); veDoi(); chayDem(); dayLen();
    if (h.goiY === 'nghe') setTimeout(function () { TV.doc(h.w.docTxt); }, 300);
  }
  function ocVeGoiY(them) {
    var O = G.oc, h = O.hangDs[O.hang], w = h.w;
    var goiY = h.goiY === 'nghia' ? '<div class="tl-de-nghia">' + esc(w.nghia) + '</div>'
      : h.goiY === 'han' ? '<div class="tl-de-chu"><span class="hanzi">' + esc(w.han) + '</span></div>'
      : '<div class="tl-de-nghe">🎧 Nghe cô đọc</div><button type="button" class="tl-nghe-to">🔊 Nghe lại</button>';
    var ai = O.gd === 'hang' ? doiHtml(G.luot) + ' trả lời' : O.gd === 'gianh' ? 'Các đội còn lại giành quyền trả lời!' : '';
    noi.querySelector('.tl-cau-khu').innerHTML = '<div class="tl-luot">Hàng ' + (O.hang + 1) + ' · ' + h.chu.length + ' chữ cái · ' + ai + '</div>' +
      '<div class="tl-de"><div class="tl-de-dau"><span class="tl-dang">' + (h.goiY === 'nghia' ? '📖 Nghĩa' : h.goiY === 'han' ? '✍️ Chữ Hán' : '🎧 Nghe') + ' → gõ phiên âm không dấu</span>' + (O.het ? dongHo() : '') + '</div>' +
      '<div class="tl-de-noi">' + goiY + '</div></div>' + (them || '') +
      '<div class="tl-hanh-dong">' + (O.het ? '<button type="button" class="btn tl-oc-bo">Hết giờ</button>' : '') + '</div>';
    var nt = noi.querySelector('.tl-nghe-to'); if (nt) nt.addEventListener('click', function () { TV.doc(w.docTxt); });
    var bo = noi.querySelector('.tl-oc-bo'); if (bo) bo.addEventListener('click', ocHetGio);
  }
  function chuanDap(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/ü|ü/g, 'v').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, ''); }
  function ocNhanBai(d, loai, b) {
    var O = G.oc; if (G.gd === 'ket' || O.gd === 'het') return;
    if (loai === 'hang' && O.gd === 'chon' && d === G.luot && b.c === 'chon' + G.id + '-' + O.hangDs.filter(function (h) { return h.tt; }).length) ocMoHang(+b.x);
    if (loai === 'dap' && b.c === ocCau(O.hang)) {
      if (O.gd === 'hang' && d === G.luot) ocTraLoi(d, b.x);
      else if (O.gd === 'gianh' && O.choGianh.indexOf(d) >= 0 && !O.daGianh[d]) ocTraLoi(d, b.x);
    }
    if (loai === 'khoa' && b.c === 'k' + G.id && !G.doi[d].daDoanKhoa) ocDoanKhoa(d, b.x);
  }
  function ocTraLoi(d, x) {
    var O = G.oc, h = O.hangDs[O.hang], dung = x === true || chuanDap(x) === h.chu;
    if (O.gd === 'hang') {
      if (dung) return ocXongHang(d, 10);
      amThanh('sai'); ocGianh({ sai: typeof x === 'string' ? x : '' });
    } else if (O.gd === 'gianh') {
      O.daGianh[d] = true;
      if (dung) return ocXongHang(d, 5);
      amThanh('sai'); veDoi();
      if (O.choGianh.every(function (i) { return O.daGianh[i]; })) ocXongHang(-1, 0);
    }
  }
  function ocGianh(lyDo) {   // đội lượt trả lời sai / hết giờ → các đội còn lại giành quyền
    var O = G.oc;
    O.choGianh = G.doi.map(function (d) { return d.i; }).filter(function (i) { return i !== G.luot; });
    if (!O.choGianh.length) return ocXongHang(-1, 0);
    O.gd = 'gianh'; O.lanThu = 'b'; O.giay = Math.max(10, Math.round(giayCau() * .7)); O.het = Date.now() + O.giay * 1000; O.daGianh = {};
    ocVeGoiY('<p class="tl-loi-ket">' + doiHtml(G.luot, true) + (lyDo.het ? ' hết giờ' : ' trả lời chưa đúng' + (lyDo.sai ? ': <s>' + esc(lyDo.sai) + '</s>' : '')) + '</p>');
    veDoi(); chayDem(); dayLen();
  }
  function ocHetGio() {
    var O = G.oc; if (!O) return;
    if (hen.dem) { clearInterval(hen.dem); hen.dem = null; }
    if (O.gd === 'hang') return ocGianh({ het: true });
    if (O.gd === 'gianh') return ocXongHang(-1, 0);
    if (O.gd === 'khoa') return ocHetKhoa();
  }
  function ocXongHang(d, diem) {
    var O = G.oc, h = O.hangDs[O.hang];
    if (hen.dem) { clearInterval(hen.dem); hen.dem = null; }
    O.het = 0; h.tt = d >= 0 ? 'mo' : 'hong'; O.gd = 'xong';
    if (d >= 0) { G.doi[d].diem += diem; G.doi[d].dung++; amThanh('dung'); } else amThanh('sai');
    veBang(); veDoi();
    var k = noi.querySelector('.tl-cau-khu');
    k.innerHTML = '<div class="tl-luot">Hàng ' + (O.hang + 1) + '</div>' +
      '<div class="tl-giai to">' + TV.nutLoa(h.w.docTxt) + '<span><span class="hanzi">' + esc(h.w.han) + '</span> <b>' + esc(h.w.py) + '</b> · ' + esc(h.w.nghia) + '</span></div>' +
      '<p class="tl-loi-ket">' + (d >= 0 ? doiHtml(d, true) + ' giải đúng: +' + diem + ' điểm 🎉' : 'Chưa đội nào giải được hàng này.') + '</p>' +
      '<div class="tl-hanh-dong"><button type="button" class="btn gold tl-tiep">Tiếp ›</button></div>';
    setTimeout(function () { TV.doc(h.w.docTxt); }, 300);
    k.querySelector('.tl-tiep').addEventListener('click', function () { G.luot = luotTiep(G.luot); ocChonHang(); });
    dayLen();
  }
  function ocDoanKhoa(d, x) {
    var O = G.oc; G.doi[d].daDoanKhoa = true;
    var dung = x === true || chuanDap(x) === O.khoaChu;
    if (dung) {
      var them = O.gd === 'khoa' ? 20 : 30;
      G.doi[d].diem += them;
      if (hen.dem) { clearInterval(hen.dem); hen.dem = null; }
      O.gd = 'het'; O.het = 0; amThanh('chuong');
      veBang(); veDoi();
      noi.querySelector('.tl-cau-khu').innerHTML = '<div class="tl-luot">🔑 ' + doiHtml(d, true) + ' đoán đúng từ khóa: +' + them + ' điểm!</div>' +
        '<div class="tl-giai to">' + TV.nutLoa(O.khoa.docTxt) + '<span><span class="hanzi">' + esc(O.khoa.han) + '</span> <b>' + esc(O.khoa.py) + '</b> · ' + esc(O.khoa.nghia) + '</span></div>' +
        '<div class="tl-hanh-dong"><button type="button" class="btn gold tl-tiep">Xem kết quả 🏆</button></div>';
      noi.querySelector('.tl-tiep').addEventListener('click', ketThuc);
      setTimeout(function () { TV.doc(O.khoa.docTxt); }, 300);
      dayLen();
    } else {
      amThanh('sai'); TV.baoLoi(tenDoi(d) + ' đoán từ khóa chưa đúng' + (typeof x === 'string' && x ? ': ' + x : '') + '.');
      veDoi(); dayLen();
      if (O.gd === 'khoa' && G.doi.every(function (z) { return z.daDoanKhoa; })) ocHetKhoa();
    }
  }
  function ocVongKhoa() {   // hết hàng ngang: mọi đội chưa đoán cùng đoán từ khóa
    var O = G.oc;
    if (G.doi.every(function (d) { return d.daDoanKhoa; })) return ocHetKhoa();
    O.gd = 'khoa'; O.hang = null; O.giay = 30; O.het = Date.now() + 30000;
    noi.querySelector('.tl-cau-khu').innerHTML = '<div class="tl-luot">🔑 Vòng cuối: các đội đoán từ khóa hàng dọc (' + O.khoaChu.length + ' chữ cái)</div>' +
      '<div class="tl-de"><div class="tl-de-dau"><span class="tl-dang">Gợi ý: ' + esc(O.khoa.nghia) + '</span>' + dongHo() + '</div></div>' +
      '<div class="tl-hanh-dong"><button type="button" class="btn tl-oc-bo">Hết giờ</button></div>';
    noi.querySelector('.tl-oc-bo').addEventListener('click', ocHetKhoa);
    veBang(); veDoi(); chayDem(); dayLen();
  }
  function ocHetKhoa() {
    var O = G.oc; if (O.gd === 'het') return;
    if (hen.dem) { clearInterval(hen.dem); hen.dem = null; }
    O.gd = 'het'; O.het = 0;
    veBang(); veDoi();
    noi.querySelector('.tl-cau-khu').innerHTML = '<div class="tl-luot">🔑 Từ khóa là</div>' +
      '<div class="tl-giai to">' + TV.nutLoa(O.khoa.docTxt) + '<span><span class="hanzi">' + esc(O.khoa.han) + '</span> <b>' + esc(O.khoa.py) + '</b> · ' + esc(O.khoa.nghia) + '</span></div>' +
      '<div class="tl-hanh-dong"><button type="button" class="btn gold tl-tiep">Xem kết quả 🏆</button></div>';
    noi.querySelector('.tl-tiep').addEventListener('click', ketThuc);
    setTimeout(function () { TV.doc(O.khoa.docTxt); }, 300);
    dayLen();
  }
  function ocChamTayHtml(i) {
    var O = G.oc, s = '';
    if (O.gd === 'hang' && G.luot === i) s = '<button type="button" data-oc="dung">✓ Đúng</button><button type="button" data-oc="sai">✗ Sai</button>';
    if (O.gd === 'gianh' && O.choGianh.indexOf(i) >= 0 && !O.daGianh[i]) s = '<button type="button" data-oc="dung">✓ Giành đúng</button><button type="button" data-oc="sai">✗ Sai</button>';
    if (O.gd !== 'het' && !G.doi[i].daDoanKhoa) s += '<button type="button" data-oc="khoa-dung">🔑 Đoán đúng từ khóa</button><button type="button" data-oc="khoa-sai">🔑 Đoán sai</button>';
    return s ? '<p>Chấm thay ' + doiHtml(i, true) + '</p><div class="tl-pop-nut">' + s + '</div>' : '';
  }
  function ocChamTay(i, k) {
    if (k === 'dung') ocTraLoi(i, true);
    else if (k === 'sai') ocTraLoi(i, false);
    else if (k === 'khoa-dung') ocDoanKhoa(i, true);
    else if (k === 'khoa-sai') ocDoanKhoa(i, false);
  }

  // =========================================================
  // KẾT THÚC
  // =========================================================
  function xepHang() {
    var ds = G.doi.slice();
    ds.sort(function (a, b) {
      if (MA_TRO === 'rung' && a.loai !== b.loai) return a.loai ? 1 : -1;
      if (MA_TRO === 'rung' && a.chuong !== b.chuong) return b.chuong - a.chuong;
      if (MA_TRO === 'xe' && a.o !== b.o) return b.o - a.o;
      if (MA_TRO === 'tp' && a.nac !== b.nac) return b.nac - a.nac;
      if (a.diem !== b.diem) return b.diem - a.diem;
      return b.dung - a.dung;
    });
    return ds;
  }
  function ketThuc() {
    if (!G) return;
    dungTatCa();
    if (G.cau) G.cau.mo = false;
    var ds = xepHang(), nhat = ds[0];
    var hang = 0, truoc = null;
    var thu = ds.map(function (d, k) {
      var gt = [d.loai ? 1 : 0, d.chuong, d.o, d.nac, d.diem].join('|');
      if (gt !== truoc) { hang = k + 1; truoc = gt; }
      return { d: d, hang: hang };
    });
    G.gd = 'ket'; G.ket = { thu: thu.map(function (x) { return { i: x.d.i, hang: x.hang }; }) };
    if (G.oc) G.oc.gd = 'het';
    amThanh('xong');
    var huy = ['🥇', '🥈', '🥉', '🎖️'];
    noi.innerHTML = '<div class="tl-the tl-ket-the">' +
      '<div class="tl-ket-dau">🏆 ' + esc(T.ten) + '</div>' +
      '<div class="tl-bang-vang">' + thu.map(function (x) {
        var d = x.d;
        return '<div class="tl-hang-doi ' + DOI_MAC[d.i].mau + ' h' + x.hang + '"><span class="tl-huy">' + huy[x.hang - 1] + '</span>' + doiHtml(d.i) +
          '<span class="tl-ket-so">' + phuDoi(d).replace('Bị loại', '❌ Bị loại') + ' · ' + d.diem + ' điểm · ' + d.dung + ' câu đúng</span></div>';
      }).join('') + '</div>' +
      '<p class="tl-loi-ket">Chúc mừng ' + thu.filter(function (x) { return x.hang === 1; }).map(function (x) { return doiHtml(x.d.i, true); }).join(' và ') + '! 🎉</p>' +
      '<div class="tl-cai-nut"><button type="button" class="btn gold tl-van-moi">↻ Chơi ván mới (giữ phòng)</button><button type="button" class="btn tl-ve-cai">‹ Đổi cài đặt</button></div>' +
    '</div>';
    noi.querySelector('.tl-van-moi').addEventListener('click', batDauVan);
    noi.querySelector('.tl-ve-cai').addEventListener('click', function () { PH = null; manCai(); });
    dayLen();
    if (PH && PH.may) batDauDoc(3000);
    if (nhat) setTimeout(function () { amThanh('chuong'); }, 700);
  }

  function moKhoaAm() {   // trình duyệt chỉ cho đọc / phát âm sau một lần bấm của người dùng
    try { if (window.speechSynthesis) { var u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'zh-CN'; speechSynthesis.speak(u); } } catch (e) {}
    try { var C = CH.AM.ctx || (CH.AM.ctx = new (window.AudioContext || window.webkitAudioContext)()); if (C.state === 'suspended') C.resume(); } catch (e) {}
  }
  window.addEventListener('beforeunload', function (e) { if (G && G.gd !== 'ket') { e.preventDefault(); e.returnValue = ''; } });

  manCai();
  window.QM_LOP_KIEM = { taoOChu: taoOChu, chuanDap: chuanDap, G: function () { return G; }, PH: function () { return PH; } };
})();
