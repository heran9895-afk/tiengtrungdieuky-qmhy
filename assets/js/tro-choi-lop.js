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
    rung: { ten: 'Rung chuông vàng', ico: '🔔', moTa: 'Các đội cùng trả lời. Sai hoặc không trả lời mất 1 chuông, hết chuông bị loại. 3 câu cuối bảng điểm đóng băng, trước câu cuối các đội cược điểm.',
      tuyChon: { nhan: 'Số câu', ds: [10, 15, 20, 30], mac: 20 } },
    xe: { ten: 'Đua xe theo đội', ico: '🏎️', moTa: 'Các đội cùng trả lời. Đúng tiến 1 ô, nhanh nhất tiến 2 ô và được chặn một đội. Đường đua có ô ⚡ tăng tốc, 🕳️ ổ gà; đội cuối đúng được đẩy thêm 1 ô; 3 ô trước đích là câu Khó.',
      tuyChon: { nhan: 'Đường đua', ds: [8, 12, 16], mac: 12, donVi: 'ô' } },
    tp: { ten: 'Ai là triệu phú', ico: '💰', moTa: 'Các đội lần lượt trả lời câu hỏi khó dần, các đội khác trả lời ngầm: đội lượt sai thì đội ngầm đúng nhanh nhất cướp 1 nấc. Đội được dừng cuộc chơi để chốt tiền. 3 quyền trợ giúp.',
      tuyChon: { nhan: 'Lượt mỗi đội', ds: [5, 8, 10], mac: 8 } },
    oc: { ten: 'Ô chữ', ico: '🧩', moTa: 'Các đội lần lượt chọn hàng ngang, các đội khác trả lời ngầm để cướp điểm. Đoán từ khóa càng sớm điểm càng cao, đoán sai mất lượt. Trước vòng cuối các đội cược điểm.',
      tuyChon: null }
  };
  var T = TRO[CF.tro] || TRO.rung, MA_TRO = TRO[CF.tro] ? CF.tro : 'rung';
  var DOI_MAC = [{ ten: 'Rồng', ico: '🐉', mau: 'do' }, { ten: 'Gấu trúc', ico: '🐼', mau: 'xanh' }, { ten: 'Hổ', ico: '🐯', mau: 'vang' }, { ten: 'Cá heo', ico: '🐬', mau: 'lam' }];
  var CHU = ['A', 'B', 'C', 'D'];
  var MAU4 = ['do', 'xanh', 'vang', 'lam'], CN_TOI_DA = 60;   // chế độ cá nhân (Rung chuông vàng): mỗi máy một người, tối đa 60
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
  // cheDo: 'co' cô điều khiển trên lớp (cô bấm Bắt đầu) · 'tu' tự luyện (các đội bấm Sẵn sàng là tự bắt đầu)
  // tuSang: số giây tự sang câu sau khi hiện đáp án (0 = bấm tay) · loa: câu nghe phát ở 'dt' điện thoại các đội · 'chieu' màn chiếu · 'ca-hai'
  var S = { nhom: NHOM[0] ? NHOM[0].ma : '', muc: 'tb', soDoi: 4, tenDoi: DOI_MAC.map(function (d) { return d.ten; }), tuyChon: {}, cheDo: 'co', tuSang: 8, loa: 'dt', kieu: 'doi' };
  try { var luu = JSON.parse(localStorage.getItem(KHOA_CAI) || '{}'); Object.keys(luu).forEach(function (k) { S[k] = luu[k]; }); } catch (e) {}
  var thamSo = (location.search.match(/[?&]bai=([^&]+)/) || [])[1];
  if (thamSo && NHOM.some(function (n) { return n.ma === thamSo; })) S.nhom = thamSo;
  if (!NHOM.some(function (n) { return n.ma === S.nhom; })) S.nhom = NHOM[0] ? NHOM[0].ma : '';
  if (!CH.MUC_LOP[S.muc]) S.muc = 'tb';
  S.soDoi = Math.min(4, Math.max(2, +S.soDoi || 4));
  if (S.cheDo !== 'tu') S.cheDo = 'co';
  if (S.kieu !== 'canhan') S.kieu = 'doi';
  if ([0, 5, 8, 12].indexOf(+S.tuSang) < 0) S.tuSang = 8; S.tuSang = +S.tuSang;
  if (['dt', 'chieu', 'ca-hai'].indexOf(S.loa) < 0) S.loa = 'dt';
  var SANG_DS = [[0, 'Tắt · bấm Câu tiếp'], [5, '5 giây'], [8, '8 giây'], [12, '12 giây']];
  var LOA_DS = [['dt', '📱 Điện thoại các đội'], ['chieu', '🖥️ Màn chiếu'], ['ca-hai', 'Cả hai']];
  function loaChieu() { return !PH || !PH.may || S.loa !== 'dt'; }
  function docChieu(t) { if (t && loaChieu()) TV.doc(t); }   // máy chiếu chỉ tự đọc khi chọn phát ở màn chiếu (hoặc chơi không điện thoại)
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

  // ---------- Đội / người chơi ----------
  var NGUOI = [];          // cá nhân: người giữ từng ô { id, ten, lop, hs } (máy chủ phòng chơi 2026-11-04)
  function laCN() { return MA_TRO === 'rung' && S.kieu === 'canhan'; }
  function soO() { return laCN() ? NGUOI.length : S.soDoi; }
  function dsO() { var n = G ? G.doi.length : soO(), a = []; for (var i = 0; i < n; i++) a.push(i); return a; }
  function dm(i) { return laCN() ? { ten: (NGUOI[i] && NGUOI[i].ten) || 'Người chơi ' + (i + 1), ico: '👤', mau: MAU4[i % 4] } : DOI_MAC[i]; }
  function tenDoi(i) { return laCN() ? dm(i).ten.slice(0, 24) : (S.tenDoi[i] || DOI_MAC[i].ten).slice(0, 18); }
  function doiHtml(i, nho) { return '<span class="tl-doi-ten ' + dm(i).mau + (nho ? ' nho' : '') + '">' + dm(i).ico + ' ' + esc(tenDoi(i)) + '</span>'; }
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
        (MA_TRO === 'rung' ? '<label class="lt-o"><span class="lt-o-nhan">Chơi theo</span><select class="tl-chon-kieu"><option value="doi">👥 Đội (2–4 đội)</option><option value="canhan">👤 Cá nhân · mỗi máy một người</option></select></label>' : '') +
        '<label class="lt-o tl-o-so-doi"><span class="lt-o-nhan">Số đội</span><select class="tl-chon-doi">' + [2, 3, 4].map(function (n) { return '<option value="' + n + '">' + n + ' đội</option>'; }).join('') + '</select></label>' +
        (t ? '<label class="lt-o"><span class="lt-o-nhan">' + esc(t.nhan) + '</span><select class="tl-chon-tuy">' + t.ds.map(function (n) { return '<option value="' + n + '">' + n + (t.donVi ? ' ' + t.donVi : '') + '</option>'; }).join('') + '</select></label>' : '') +
      '</div>' +
      '<div class="tl-che-do" role="radiogroup" aria-label="Chế độ chơi">' +
        '<label class="tl-che-o"><input type="radio" name="tl-che" value="co"><span><b>👩‍🏫 Cô điều khiển</b><small>Cô tạo phòng, bấm Bắt đầu. Các câu tự chạy.</small></span></label>' +
        '<label class="tl-che-o"><input type="radio" name="tl-che" value="tu"><span><b>🧑‍🤝‍🧑 Tự luyện</b><small>Học sinh tự tạo phòng. Các đội bấm “Sẵn sàng” là tự bắt đầu, hết ván bấm “Sẵn sàng” để chơi ván mới.</small></span></label>' +
      '</div>' +
      '<div class="tl-cai-luoi">' +
        '<label class="lt-o"><span class="lt-o-nhan">Tự sang câu</span><select class="tl-chon-sang">' + SANG_DS.map(function (x) { return '<option value="' + x[0] + '">' + x[1] + '</option>'; }).join('') + '</select></label>' +
        '<label class="lt-o"><span class="lt-o-nhan">Câu nghe phát ở</span><select class="tl-chon-loa">' + LOA_DS.map(function (x) { return '<option value="' + x[0] + '">' + x[1] + '</option>'; }).join('') + '</select></label>' +
      '</div>' +
      '<div class="tl-ten-doi"></div>' +
      (MA_TRO === 'rung' ? '<p class="tl-ghi-chu tl-ghi-cn" hidden>👤 Cá nhân: mỗi em vào phòng bằng điện thoại của mình (tối đa ' + CN_TOI_DA + ' em), tên lấy theo tài khoản. Hết ván, điểm từng em lưu về Sheet (em có ghi lớp) và hiện ở trang giáo viên.</p>' : '') +
      '<div class="tl-cai-nut">' +
        '<button type="button" class="btn gold tl-tao">📱 Tạo phòng · các đội vào bằng điện thoại</button>' +
        '<button type="button" class="btn tl-khong-may">✋ Chơi không dùng điện thoại</button>' +
      '</div>' +
      (P && P.coMayChu() ? '' : '<p class="tl-ghi-chu">Máy chủ phòng chơi chưa được nối: hiện chỉ chơi được chế độ cô bấm chấm cho các đội.</p>') +
      '<p class="tl-ghi-chu">Câu hỏi trộn 4 dạng: nghe chọn chữ Hán · nghĩa → chữ Hán · chữ Hán → phiên âm · điền từ vào câu' + (MA_TRO === 'oc' ? ' (Ô chữ: gõ phiên âm không dấu)' : '') + '.</p>' +
    '</div>';
    var sN = noi.querySelector('.tl-chon-nhom'), sM = noi.querySelector('.tl-chon-muc'), sD = noi.querySelector('.tl-chon-doi'), sT = noi.querySelector('.tl-chon-tuy');
    sN.value = S.nhom; sM.value = S.muc; sD.value = S.soDoi; if (sT) sT.value = tuyChon();
    var sS = noi.querySelector('.tl-chon-sang'), sL = noi.querySelector('.tl-chon-loa'), sK = noi.querySelector('.tl-chon-kieu');
    if (sK) sK.value = S.kieu;
    sS.value = S.tuSang; sL.value = S.loa;
    noi.querySelector('input[name=tl-che][value=' + S.cheDo + ']').checked = true;
    function veTen() {
      var cn = laCN();
      noi.querySelector('.tl-o-so-doi').hidden = cn; noi.querySelector('.tl-ten-doi').hidden = cn;
      var km = noi.querySelector('.tl-khong-may'); if (km) km.hidden = cn;
      var gc = noi.querySelector('.tl-ghi-cn'); if (gc) gc.hidden = !cn;
      noi.querySelector('.tl-ten-doi').innerHTML = DOI_MAC.slice(0, S.soDoi).map(function (d, i) {
        return '<label class="tl-o-ten ' + d.mau + '"><span>' + d.ico + '</span><input type="text" maxlength="18" value="' + esc(tenDoi(i)) + '" data-i="' + i + '" aria-label="Tên đội ' + (i + 1) + '"></label>'; }).join('');
    }
    veTen();
    noi.addEventListener('change', function (e) {
      if (e.target === sN) S.nhom = sN.value;
      else if (e.target === sM) S.muc = sM.value;
      else if (e.target === sD) { S.soDoi = +sD.value; veTen(); }
      else if (e.target === sT) S.tuyChon[MA_TRO] = +sT.value;
      else if (e.target === sS) S.tuSang = +sS.value;
      else if (e.target === sK) { S.kieu = sK.value; veTen(); }
      else if (e.target === sL) S.loa = sL.value;
      else if (e.target.name === 'tl-che') S.cheDo = e.target.value;
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
        VAO = [{}, {}, {}, {}]; NGUOI = [];
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
        '<p class="tl-ghi-chu">Mỗi đội một hoặc nhiều điện thoại; trong một đội, máy bấm đáp án trước được tính. Đội chưa có máy: bấm vào ô của đội để chấm thay.</p>' +
        (S.cheDo === 'tu' ? '<p class="tl-tu-bd" aria-live="polite"></p>' : '') +
        '<div class="tl-cai-nut"><button type="button" class="btn gold tl-bat-dau">▶ Bắt đầu' + (S.cheDo === 'tu' ? ' ngay' : '') + '</button><button type="button" class="btn tl-ve-cai">‹ Đổi cài đặt</button></div>' +
      '</div></div>';
    veQR(noi.querySelector('.tl-qr'), link);
    kiemMayChu();
    noi.querySelector('.tl-bat-dau').addEventListener('click', function () { vaoToanMan(); batDauVan(); });
    noi.querySelector('.tl-ve-cai').addEventListener('click', manCai);
    SAN_SANG = S.cheDo === 'tu' ? { id: 'sanh-' + Math.random().toString(36).slice(2, 7), san: {}, het: 0 } : null;
    veSanhDoi();
    dayLen({ gd: 'sanh' });
    batDauDoc(1500);
  }
  // ---------- Tự luyện: các đội có máy bấm "Sẵn sàng" đủ (≥ 2 đội) → đếm 5 giây rồi tự bắt đầu ván ----------
  var SAN_SANG = null;
  function doiCoMay() {
    if (laCN()) return dsO().filter(function (i) { return NGUOI[i] && (!G || (G.doi[i] && !G.doi[i].vang)); });
    return DOI_MAC.slice(0, S.soDoi).map(function (d, i) { return i; }).filter(function (i) { return Object.keys(VAO[i] || {}).length; });
  }
  function nhanSanSang(d, b) {
    if (S.cheDo !== 'tu' || !SAN_SANG || b.x !== 'san-sang' || b.c !== SAN_SANG.id || SAN_SANG.san[d]) return;
    SAN_SANG.san[d] = 1; amThanh('cham'); kiemSanSang(true);
  }
  function kiemSanSang(doiMoi) {
    if (!SAN_SANG) return;
    var co = doiCoMay(), du = co.length >= 2 && co.every(function (i) { return SAN_SANG.san[i]; }), truoc = !!SAN_SANG.het;
    if (du && !SAN_SANG.het) {
      SAN_SANG.het = Date.now() + 5000;
      var x = SAN_SANG;
      x.hen = setTimeout(function () { if (SAN_SANG === x && x.het) { if (!G || G.gd === 'ket') batDauVan(); } }, 5000);
    } else if (!du && SAN_SANG.het) { clearTimeout(SAN_SANG.hen); SAN_SANG.het = 0; }
    veSanSang(); veSanhDoi(true);
    if (doiMoi || truoc !== !!SAN_SANG.het) dayLen(G ? null : { gd: 'sanh' });
  }
  function veSanSang() {
    var k = noi.querySelector('.tl-tu-bd'); if (!k || !SAN_SANG) return;
    var co = doiCoMay(), so = co.filter(function (i) { return SAN_SANG.san[i]; }).length;
    k.innerHTML = SAN_SANG.het ? '⏳ Đủ ' + (laCN() ? 'người' : 'đội') + ' sẵn sàng: bắt đầu sau <b class="tl-dem-bd" data-het="' + SAN_SANG.het + '">5</b> giây…'
      : co.length < 2 ? '🧑‍🤝‍🧑 Tự luyện: cần ít nhất 2 ' + (laCN() ? 'người' : 'đội có điện thoại') + '. ' + (laCN() ? 'Mỗi em' : 'Mỗi đội') + ' bấm <b>✋ Sẵn sàng</b> trên điện thoại, đủ là tự bắt đầu.'
      : '✋ Sẵn sàng: <b>' + so + '/' + co.length + '</b> ' + (laCN() ? 'người' : 'đội') + '. Đủ tất cả là tự bắt đầu.';
  }
  setInterval(function () { var b = noi.querySelector('.tl-dem-bd'); if (b) b.textContent = Math.max(0, Math.ceil((+b.dataset.het - Date.now()) / 1000)); }, 250);
  // Máy chủ phòng chơi phải là bản 2026-11-01 trở lên (bản cũ dùng LockService, học sinh không gửi được đáp án)
  var PHIEN_BAN_CAN = '2026-11-01';
  function kiemMayChu() {
    P.ping().then(function (o) { if (!o.phienBan || o.phienBan < (laCN() ? '2026-11-04' : PHIEN_BAN_CAN)) throw 0; })
      .catch(function () {
        var k = noi.querySelector('.tl-sanh-phai'); if (!k || k.querySelector('.tl-canh-bao')) return;
        k.insertAdjacentHTML('afterbegin', '<p class="tl-canh-bao">⚠️ Máy chủ phòng chơi đang chạy <b>bản cũ</b>: ' + (laCN() ? 'chưa chơi được chế độ cá nhân, cô chọn chơi theo đội nhé. ' : 'điện thoại có thể không gửi được đáp án. ') +
          'Cô mở Apps Script <b>TTDK - Phong choi</b>, dán mã mới rồi <b>Triển khai → Quản lý triển khai → ✏️ → Phiên bản mới</b>. ' +
          'Trong lúc chờ, cô bấm vào ô của đội để chấm thay.</p>');
      });
  }
  function veSanhDoi(chiVe) {
    if (!chiVe && SAN_SANG && !G) kiemSanSang();          // số máy đổi (đội mới vào / rời) thì xét lại điều kiện tự bắt đầu
    var k = noi.querySelector('.tl-sanh-doi'); if (!k) return;
    if (laCN()) {
      var co = dsO().filter(function (i) { return NGUOI[i]; });
      k.innerHTML = '<div class="tl-cn-dem">👤 <b>' + co.length + '</b> người đã vào</div><div class="tl-cn-ds">' + co.map(function (i) {
        return '<span class="tl-cn-ten ' + dm(i).mau + '">' + esc(tenDoi(i)) + (SAN_SANG && SAN_SANG.san[i] ? ' ✋' : '') + '</span>'; }).join('') + '</div>';
      return;
    }
    k.innerHTML = DOI_MAC.slice(0, S.soDoi).map(function (d, i) {
      var n = Object.keys(VAO[i] || {}).length, ss = SAN_SANG && SAN_SANG.san[i];
      return '<div class="tl-sanh-o ' + d.mau + (n ? ' co' : '') + '">' + doiHtml(i) + '<span>' + (n ? '📱 ' + n + ' máy' : 'Chưa có máy') + (ss ? ' · ✋ sẵn sàng' : '') + '</span></div>'; }).join('');
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
        P.doc(PH.ma, PH.khoa, laCN() ? CN_TOI_DA : 4).then(function (o) { if (o.t) PH.lech = o.t - Date.now(); xuLyDoc(o); }).catch(function () {})
          .then(function () { dangDoc = false; if (hen.doc) vong(); });
      }, docKhoang);
    })();
  }
  function dungTatCa() {
    if (hen.doc) clearTimeout(hen.doc); hen.doc = null;
    if (hen.dem) clearInterval(hen.dem); hen.dem = null;
    dungSang(); dungCuoc();
    TV.dungDoc();
  }
  function xuLyDoc(o) {
    (o.v || []).forEach(function (v, i) { VAO[i] = v || {}; });
    if (laCN() && o.nguoi) {
      var ng = o.nguoi.slice(); while (ng.length && !ng[ng.length - 1]) ng.pop();
      var doi = JSON.stringify(ng.map(function (x) { return x ? x.id + x.ten : ''; })) !== JSON.stringify(NGUOI.map(function (x) { return x ? x.id + x.ten : ''; }));
      NGUOI = ng;
      if (doi && !G) dayLen({ gd: 'sanh' });            // có người mới vào: điện thoại thấy danh sách
    }
    var g0 = o.g || {};
    if (!G) { (g0.tg || []).forEach(function (b, d) { if (b) nhanSanSang(d, b); }); veSanhDoi(); return; }
    if (G.gd === 'ket' && SAN_SANG) kiemSanSang();
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
    var s = { v: Date.now(), tro: MA_TRO, ten: T.ten, doi: dsO().map(function (i) { return laCN() && (!NGUOI[i] || (G && G.doi[i].vang)) ? { vang: 1, ten: '', ico: '', mau: '' } : { ten: tenDoi(i), ico: dm(i).ico, mau: dm(i).mau }; }),
      cheDo: S.cheDo, loa: S.loa, caNhan: laCN() };
    if (SAN_SANG) s.sanSang = { id: SAN_SANG.id, san: Object.keys(SAN_SANG.san).map(Number), con: SAN_SANG.het ? Math.max(0, Math.ceil((SAN_SANG.het - Date.now()) / 1000)) : null };
    if (G && G.sang) s.sang = { id: G.sang.id, san: Object.keys(G.sang.san).map(Number), con: G.sang.het && !G.sang.dung ? Math.max(0, Math.ceil((G.sang.het - Date.now()) / 1000)) : null, dung: !!G.sang.dung, ket: !!G.sang.ket };
    if (G) {
      s.gd = G.gd; s.id = G.id; s.diem = G.doi.map(function (d) { return an() ? null : d.diem; });
      if (an()) s.dongBang = 1;
      if (G.lat) s.gd = 'lat';                                  // đang công bố kết quả trên màn chiếu: điện thoại chờ
      if (G.gd === 'cuoc' && G.cuoc) s.cuoc = { id: G.cuoc.id, ai: G.cuoc.ai, da: Object.keys(G.cuoc.muc).map(Number), con: Math.max(0, Math.ceil((G.cuoc.het - Date.now()) / 1000)), vong: G.cuoc.vong };
      if (G.chanCho) s.chan = { id: G.chanCho.id, doi: G.chanCho.doi, da: G.chanCho.da, con: G.doi[G.chanCho.doi].chan };
      s.phu = G.doi.map(function (d) { return phuDoi(d); });
      s.loai = G.doi.map(function (d) { return !!d.loai; });
      s.luot = G.luot;
      if (G.cau) {
        var C = G.cau, q = C.q;
        s.cau = { id: C.id, so: G.soCau, tong: tongCauHien(), txt: q.de.txt, deHan: !!q.de.han, han: q.han, dap: q.dap.map(function (x) { return x.txt; }),
          mo: C.mo, ai: C.ai, an: C.an || [], conLai: C.mo ? Math.max(0, Math.round((C.het - Date.now()) / 1000)) : 0, ten: q.ten, ico: q.ico, doc: q.de.doc || '' };
        if (!C.mo) { s.cau.dung = q.dung; s.cau.kq = G.doi.map(function (d, i) { return C.kq ? C.kq[i] : ''; }); s.cau.docGiai = q.docGiai || ''; s.cau.giai = String(q.giai || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 200);
          s.cau.loi = String(C.loiKet || '').replace(/<br\s*\/?>/g, ' · ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 300); }
        if (MA_TRO === 'tp') { s.cau.tg = G.doi[G.luot].tg; s.cau.chinh = G.luot; s.cau.ngam = C.ai.length > 1; s.cau.dungDuoc = G.doi[G.luot].nac >= 1 && !C.tl[G.luot]; s.cau.so = G.doi[G.luot].luotDa + 1; s.cau.tong = G.luotMoiDoi; }
        if (MA_TRO === 'xe' && G.nuocRut) s.cau.rut = 1;
        if (C.cuoc) s.cau.cuoc = 1;
      }
      if (G.oc) s.oc = ocChoDienThoai();
      if (G.ket) s.ket = G.ket;
    }
    if (them) Object.keys(them).forEach(function (k) { s[k] = them[k]; });
    P.ghi(PH.ma, PH.khoa, s);
  }
  function phuDoi(d) {   // dòng phụ dưới tên đội trên điện thoại
    if (MA_TRO === 'rung') return d.loai ? 'Bị loại' : '🔔 ' + d.chuong;
    if (MA_TRO === 'xe') return '🏁 ' + d.o + '/' + G.dich + ' ô' + (d.tang ? ' · ⚡' : '') + (d.ga ? ' · 🕳️' : '') + (d.biChan ? ' · 🚧 bị chặn' : '');
    if (MA_TRO === 'tp') return (an() ? 'Nấc ❓' : 'Nấc ' + d.nac + (d.nac ? ' · ' + NAC[d.nac - 1] : '')) + (d.chot ? ' · 🛑 đã chốt' : '');
    if (MA_TRO === 'oc' && d.matLuot) return '⏭ mất lượt kế tiếp';
    return '';
  }
  // Đóng băng bảng điểm (3 câu / lượt / hàng cuối): màn chiếu và điện thoại ẩn điểm tới khi công bố kết quả
  function an() { return !!(G && G.dongBang && (G.gd !== 'ket' || G.lat)); }
  function soAn(v) { return an() ? '❓' : v; }
  function tongCauHien() { return MA_TRO === 'rung' ? G.tong : MA_TRO === 'tp' ? G.tong : 0; }

  // =========================================================
  // VÁN CHƠI
  // =========================================================
  function batDauVan() {
    if (laCN() && !NGUOI.some(Boolean)) { TV.baoLoi('Chưa có ai vào phòng. Các em nhập mã phòng trên điện thoại trước nhé.'); return; }
    dungTatCa();
    if (SAN_SANG && SAN_SANG.hen) clearTimeout(SAN_SANG.hen);
    SAN_SANG = null;
    noi.innerHTML = '<div class="tl-the"><div class="tv-trong">Đang chuẩn bị câu hỏi…</div></div>';
    taiNhom(S.nhom).then(function (dl) {
      G = { dl: dl, id: Math.random().toString(36).slice(2, 7), gd: 'cho', soCau: 0, daDung: {}, luot: 0, cau: null, ket: null,
        batDauLuc: Date.now(),
        doi: dsO().map(function (i) { var vang = laCN() && !NGUOI[i]; return { i: i, diem: 0, chuong: 3, o: 0, nac: 0, loai: vang, vang: vang, dung: 0, tg: { nam: 1, doi: 1, gio: 1 }, daDoanKhoa: false,
          luotDa: 0, chot: false, matLuot: false, tang: false, ga: false, biChan: false, chan: 2 }; }),
        dongBang: false, lat: false, daCuoc: false, cuoc: null, danDau: null, chanCho: null, nuocRut: false };
      if (laCN() && !G.doi.some(function (d) { return !d.vang; })) { G = null; TV.baoLoi('Chưa có ai vào phòng. Các em nhập mã phòng trên điện thoại trước nhé.'); return manSanh(); }
      if (MA_TRO === 'rung') { G.tong = tuyChon(); G.cuuTro = 1; }
      if (MA_TRO === 'xe') { G.dich = tuyChon(); G.oDB = taoODacBiet(G.dich); }
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
    if (laCN()) {
      k.classList.add('cn');
      var dsCn = G.doi.filter(function (d) { return !d.vang; }), conLai = dsCn.filter(function (d) { return !d.loai; }).length;
      k.innerHTML = '<div class="tl-cn-dem">👤 Còn <b>' + conLai + '</b>/' + dsCn.length + ' người</div>' + dsCn.map(function (d) {
        var i = d.i, C = G.cau, tt = '';
        if (C && C.mo && C.ai.indexOf(i) >= 0) tt = C.tl[i] ? '✓' : '…';
        else if (C && !C.mo && C.kq) tt = C.kq[i] === 'dung' ? '✓' : C.kq[i] === 'sai' ? '✗' : C.kq[i] === 'trong' ? '—' : '';
        return '<div class="tl-cn-o ' + dm(i).mau + (d.loai ? ' loai' : '') + (tt === '✓' && C && !C.mo ? ' dung' : '') + (tt === '✗' || tt === '—' ? ' sai' : '') + '">' +
          '<b>' + esc(tenDoi(i)) + '</b><span>' + (d.loai ? '❌' : '🔔'.repeat(d.chuong)) + ' · ' + soAn(d.diem) + (G.cuoc && G.cuoc.muc[i] != null && G.gd === 'cuoc' ? ' · 🎲' : '') + '</span><i>' + tt + '</i></div>';
      }).join('');
      return;
    }
    k.classList.remove('cn');
    k.innerHTML = G.doi.map(function (d, i) {
      var tt = '', C = G.cau;
      var ngam = MA_TRO === 'tp' && C && C.ai.length > 1 && i !== G.luot;
      if (C && C.mo && C.ai.indexOf(i) >= 0) tt = C.tl[i] ? (C.tl[i].chot ? '<b class="tl-sai">🛑 Dừng</b>' : '<b class="tl-da">✓ ' + (ngam ? '🕵️ Đã chọn ngầm' : 'Đã chọn') + '</b>') : '<span class="tl-nghi">… ' + (ngam ? '🕵️ trả lời ngầm' : 'đang nghĩ') + '</span>';
      else if (C && !C.mo && C.kq) tt = C.kq[i] === 'dung' ? '<b class="tl-dung">✓ Đúng</b>' : C.kq[i] === 'sai' ? '<b class="tl-sai">✗ Sai</b>' : C.kq[i] === 'trong' ? '<b class="tl-sai">— Không trả lời</b>' : C.kq[i] === 'chot' ? '<b class="tl-sai">🛑 Dừng cuộc chơi</b>' : '';
      if (G.oc) tt = ocTrangThaiDoi(i);
      if (G.gd === 'cuoc' && G.cuoc) tt = G.cuoc.ai.indexOf(i) < 0 ? '' : G.cuoc.muc[i] != null ? '<b class="tl-da">🎲 Đã cược</b>' : '<span class="tl-nghi">🎲 đang cược…</span>';
      if (G.chanCho && G.chanCho.doi === i && G.chanCho.da == null) tt = '<span class="tl-nghi">🚧 đang chọn đội để chặn…</span>';
      var phu = MA_TRO === 'rung' ? (d.loai ? '<span class="tl-loai-chu">Bị loại</span>' : '<span class="tl-chuong">' + '🔔'.repeat(d.chuong) + '<i>' + '🔔'.repeat(3 - d.chuong) + '</i></span>')
        : MA_TRO === 'xe' ? '<span>🏁 ' + d.o + '/' + G.dich + (d.tang ? ' ⚡' : '') + (d.ga ? ' 🕳️' : '') + (d.biChan ? ' 🚧' : '') + '</span><span class="tl-tg-nho">🚧 chặn ×' + d.chan + '</span>'
        : MA_TRO === 'tp' ? '<span>' + (an() ? 'Nấc ❓' : 'Nấc ' + d.nac + ' · ' + (d.nac ? NAC[d.nac - 1] : '0')) + (d.chot ? ' · 🛑 chốt' : '') + '</span>' + '<span class="tl-tg-nho">' + (d.tg.nam ? '½' : '<s>½</s>') + ' ' + (d.tg.doi ? '🔄' : '<s>🔄</s>') + ' ' + (d.tg.gio ? '⏱' : '<s>⏱</s>') + '</span>'
        : MA_TRO === 'oc' && d.matLuot ? '<span class="tl-tg-nho">⏭ mất lượt kế tiếp</span>' : '';
      var may = PH.may ? Object.keys(VAO[i] || {}).length : 0;
      return '<button type="button" class="tl-doi ' + dm(i).mau + (d.loai || d.chot ? ' loai' : '') + (G.luot === i && (MA_TRO === 'tp' || MA_TRO === 'oc') ? ' luot' : '') + '" data-i="' + i + '" title="Bấm để chấm thay cho đội">' +
        '<span class="tl-doi-dau">' + dm(i).ico + ' ' + esc(tenDoi(i)) + (PH.may ? '<small class="tl-may">' + (may ? '📱' + may : '📵') + '</small>' : '') + '</span>' +
        '<span class="tl-doi-diem">' + soAn(d.diem) + '<small> điểm</small></span>' + phu + '<span class="tl-doi-tt">' + tt + '</span></button>';
    }).join('');
  }

  // ---------- Câu hỏi (Rung chuông vàng, Đua xe, Triệu phú) ----------
  function mucCau() {
    if (MA_TRO === 'xe' && G.nuocRut) return 'kho';      // Đua xe: chặng nước rút (3 ô trước đích) luôn là câu Khó
    if (MA_TRO !== 'tp') return S.muc;
    var n = G.doi[G.luot].nac + 1;                       // Triệu phú: khó dần theo nấc
    return n <= 3 ? 'de' : n <= 7 ? 'tb' : 'kho';
  }
  function soDapCau() { return MA_TRO === 'tp' ? 4 : CH.MUC_LOP[mucCau()].dap; }
  // Bảng điểm đóng băng: Rung chuông vàng 3 câu cuối · Triệu phú 3 lượt cuối · Ô chữ khi còn ≤ 2 hàng ngang
  NOT.dongBang = [[1568, .06], [1175, .06], [880, .14]];
  NOT.cuop = [[784, .07], [988, .07], [1318.5, .16]];
  function kiemDongBang() {
    if (!G || G.dongBang || MA_TRO === 'xe') return '';
    var den = MA_TRO === 'rung' ? G.soCau > G.tong - 3
      : MA_TRO === 'tp' ? G.doi.reduce(function (t, d) { return t + (d.chot ? 0 : Math.max(0, G.luotMoiDoi - d.luotDa)); }, 0) <= 3
      : MA_TRO === 'oc' ? G.oc.hangDs.filter(function (h) { return !h.tt; }).length <= 2 : false;
    if (!den) return '';
    G.dongBang = true; setTimeout(function () { amThanh('dongBang'); }, 400);
    return '<div class="tl-bao-lon bang">🧊 Bảng điểm đã đóng băng! Kết quả công bố khi hết trò.</div>';
  }
  function kiemNuocRut() {
    if (G.nuocRut || !G.doi.some(function (d) { return G.dich - d.o <= 3; })) return '';
    G.nuocRut = true;
    return '<div class="tl-bao-lon rut">🏁 Chặng nước rút: từ giờ câu hỏi mức Khó!</div>';
  }
  function moCau(giuLuot) {
    var bao = MA_TRO === 'xe' ? kiemNuocRut() : '';
    var q = CH.bocCauLop(G.dl, CH.THU_TU_LOP, mucCau(), soDapCau(), G.daDung);
    if (!q) { TV.baoLoi('Không bốc được câu hỏi.'); return ketThuc(); }
    G.soCau++;
    bao += kiemDongBang();
    // Triệu phú: đội đến lượt trả lời chính, các đội khác (chưa chốt) trả lời ngầm trên điện thoại để cướp nấc
    var ai = MA_TRO === 'tp' ? [G.luot].concat(PH.may ? G.doi.filter(function (d) { return d.i !== G.luot && !d.chot && Object.keys(VAO[d.i] || {}).length; }).map(function (d) { return d.i; }) : [])
      : G.doi.filter(function (d) { return !d.loai; }).map(function (d) { return d.i; });
    var giay = giayCau();
    G.cau = { id: G.id + '-' + G.soCau, q: q, mo: true, ai: ai, tl: {}, kq: null, an: [], het: Date.now() + giay * 1000, giay: giay, nac: G.doi[G.luot].nac + 1,
      bao: bao + (G.cuocCau ? '<div class="tl-bao-lon cuoc">🎲 Câu cược! Đúng được cộng, sai bị trừ số điểm đã cược.</div>' : ''), cuoc: G.cuocCau || null };
    G.cuocCau = null; G.chanCho = null;
    G.gd = 'cau';
    amThanh('mo');
    veCau(); veDoi(); veBang(); veTienDo();
    if (q.de.doc) setTimeout(function () { if (G && G.cau && G.cau.q === q) docChieu(q.de.doc); }, 350);
    G.sang = null; dungSang();
    chayDem();
    dayLen();
    batDauDoc(1000);
  }
  function veTienDo() {
    var t = noi.querySelector('.tl-tien-do'); if (!t || !G) return;
    t.innerHTML = MA_TRO === 'rung' ? 'Câu <b>' + G.soCau + '</b>/' + G.tong
      : MA_TRO === 'tp' ? 'Vòng <b>' + Math.min(G.doi[G.luot].luotDa + 1, G.luotMoiDoi) + '</b>/' + G.luotMoiDoi
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
    var luot = MA_TRO === 'tp' ? '<div class="tl-luot">' + doiHtml(G.luot) + ' trả lời · ' + (an() ? 'câu nấc tiếp theo' : 'câu nấc ' + C.nac + ' (' + NAC[C.nac - 1] + ')') +
      (C.ai.length > 1 && C.mo ? '<small class="tl-ngam-chu">🕵️ Các đội khác trả lời ngầm: ' + esc(tenDoi(G.luot)) + ' sai hoặc dừng thì đội ngầm đúng nhanh nhất cướp 1 nấc</small>' : '') + '</div>' : '';
    k.innerHTML = (C.mo ? C.bao || '' : '') + luot +
      '<div class="tl-de"><div class="tl-de-dau"><span class="tl-dang">' + q.ico + ' ' + esc(q.ten) + (MA_TRO === 'xe' && G.nuocRut ? ' · 🏁 Khó' : '') + (C.cuoc ? ' · 🎲 Câu cược' : '') + '</span>' + (C.mo ? dongHo() : '') + '</div>' +
        '<div class="tl-de-noi">' + q.de.html + (q.de.doc && C.mo ? '<button type="button" class="tl-nghe-to">🔊 Nghe lại</button>' : '') + '</div>' +
        (q.de.viet && C.mo ? '<button type="button" class="tl-goi-y">💡 Gợi ý nghĩa câu</button>' : '') +
      '</div>' +
      '<div class="tl-dap' + (q.han ? ' han' : '') + ' so' + q.dap.length + '">' + q.dap.map(function (x, i) {
        var cls = 'tl-dap-o', ai = '';
        if ((C.an || []).indexOf(i) >= 0) cls += ' an';
        if (!C.mo) {
          cls += i === q.dung ? ' dung' : ' mo';
          var chon = G.doi.filter(function (d) { return C.tl[d.i] && +C.tl[d.i].x === i; });
          ai = laCN() ? (chon.length ? '<span class="tl-ai-so">👤 ' + chon.length + '</span>' : '') : chon.map(function (d) { return '<span class="tl-ai ' + dm(d.i).mau + '">' + dm(d.i).ico + '</span>'; }).join('');
        }
        return '<button type="button" class="' + cls + '" data-i="' + i + '"><b>' + CHU[i] + '</b><span class="tl-dap-chu">' + x.html + '</span><span class="tl-ai-ds">' + ai + '</span></button>';
      }).join('') + '</div>' +
      (!C.mo ? '<div class="tl-giai">' + TV.nutLoa(q.docGiai || '') + '<span>' + q.giai + '</span>' + veKetCau() + '</div>' : '') +
      '<div class="tl-hanh-dong">' + (C.mo ? (MA_TRO === 'tp' && G.doi[G.luot].nac >= 1 && !C.tl[G.luot] ? '<button type="button" class="btn tl-chot" title="Đội đến lượt dừng cuộc chơi, giữ số tiền đang có">🛑 ' + esc(tenDoi(G.luot)) + ' dừng cuộc chơi</button>' : '') +
        '<button type="button" class="btn tl-mo-dap">Hiện đáp án</button>' : nutSang(ketThucChua() ? 'Xem kết quả 🏆' : 'Câu tiếp ›')) + '</div>';
    var nt = k.querySelector('.tl-nghe-to'); if (nt) nt.addEventListener('click', docLai);
    var gy = k.querySelector('.tl-goi-y'); if (gy) gy.addEventListener('click', function () { gy.outerHTML = '<div class="tl-goi-y-chu">' + esc(q.de.viet) + '</div>'; });
    var md = k.querySelector('.tl-mo-dap'); if (md) md.addEventListener('click', function () { if (G.cau.mo) dongCau(); });
    var ch = k.querySelector('.tl-chot'); if (ch) ch.addEventListener('click', function () { if (confirm(tenDoi(G.luot) + ' dừng cuộc chơi, chốt số tiền đang có? Đội sẽ không còn lượt.')) troGiup('dung'); });
    ganSang(k);
    // Triệu phú / không điện thoại: cô bấm đáp án thay cho đội đang trả lời
    k.querySelector('.tl-dap').addEventListener('click', function (e) {
      var b = e.target.closest('.tl-dap-o'); if (!b || !G.cau.mo) return;
      if (MA_TRO === 'tp') nhanDap(G.luot, +b.dataset.i, Date.now() + PH.lech, true);
    });
    if (C.mo) chayDem();
  }
  function veKetCau() {
    var X = G.chanCho, chan = !X ? '' : X.da == null ? '<div class="tl-loi-ket tl-chan">🚧 ' + doiHtml(X.doi, true) + ' được chặn một đội (còn ' + G.doi[X.doi].chan + ' lượt): chọn trên điện thoại, hoặc cô bấm vào ô của đội bị chặn.</div>'
      : '<div class="tl-loi-ket tl-chan">🚧 ' + doiHtml(X.doi, true) + ' chặn ' + doiHtml(X.da, true) + ': câu sau đội này chỉ tiến tối đa 1 ô!</div>';
    return (G.cau.loiKet ? '<div class="tl-loi-ket">' + G.cau.loiKet + '</div>' : '') + chan;
  }

  // Đội gửi bài (điện thoại hoặc cô chấm thay)
  function nhanBai(d, loai, b) {
    if (!G || d >= G.doi.length) return;
    if (loai === 'tg' && b.x === 'tiep') return nhanTiep(d, b);
    if (loai === 'tg' && b.x === 'san-sang') return nhanSanSang(d, b);
    if (loai === 'tg' && G.cuoc && G.gd === 'cuoc' && b.c === G.cuoc.id) return nhanCuoc(d, +b.x);
    if (loai === 'tg' && G.chanCho && b.c === G.chanCho.id) { if (d === G.chanCho.doi) datChan(+b.x); return; }
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
    rutGioNgam(C, d);
    veDoi();
    if (C.ai.every(function (i) { return C.tl[i]; })) setTimeout(function () { if (G && G.cau === C && C.mo) dongCau(); }, 500);
  }
  // Triệu phú: đội lượt đã trả lời (hoặc dừng) → các đội ngầm chỉ còn tối đa 5 giây
  function rutGioNgam(C, d) {
    if (MA_TRO !== 'tp' || d !== G.luot || C.ai.length < 2 || C.het - Date.now() <= 5000) return;
    C.het = Date.now() + 5000; C.giay = Math.max(5, C.giay);
    dayLen();
  }
  NOT.cham = [[660, .045]];
  function amThanh(l) { CH.amThanh(l); }

  // Hết giờ hoặc mọi đội đã chọn: chấm, hiện đáp án
  function dongCau() {
    var C = G.cau; if (!C || !C.mo) return;
    C.mo = false; G.gd = 'dap';
    if (hen.dem) { clearInterval(hen.dem); hen.dem = null; }
    var q = C.q;
    C.kq = G.doi.map(function (d) { if (C.ai.indexOf(d.i) < 0) return ''; var t = C.tl[d.i]; return !t ? 'trong' : t.chot ? 'chot' : t.x === q.dung ? 'dung' : 'sai'; });
    var dungDs = C.ai.filter(function (i) { return C.kq[i] === 'dung'; }).sort(function (a, b) { return C.tl[a].t - C.tl[b].t; });
    C.nhanh = dungDs[0];
    CHAM[MA_TRO](C, dungDs);
    if (C.cuoc) tinhCuoc(C);
    themLoi(C, baoDanDau());
    amThanh(dungDs.length ? 'dung' : 'sai');
    batSang(C.id, cauSau, ketThucChua());
    if (G.chanCho && G.sang && G.sang.het) G.sang.het = Math.max(G.sang.het, Date.now() + 12000);   // chờ đội chọn đội để chặn
    veCau(); veDoi(); veBang();
    if (q.docGiai) setTimeout(function () { docChieu(q.docGiai); }, 300);
    dayLen();
  }
  function cauSau() {
    if (!G) return;
    if (ketThucChua()) return ketThuc();
    if (MA_TRO === 'tp') { G.luot = luotTiep(G.luot); }
    if (MA_TRO === 'rung' && !G.daCuoc && G.soCau === G.tong - 1) {          // trước câu cuối: các đội / người còn chuông cược điểm
      var ai = G.doi.filter(function (d) { return !d.loai && !d.vang; }).map(function (d) { return d.i; });
      if (ai.length >= 2) { G.daCuoc = true; return moCuoc(ai, function () { G.cuocCau = G.cuoc; moCau(); }, 'cau'); }
    }
    moCau();
  }
  // Lượt kế tiếp: Triệu phú bỏ qua đội đã chốt / hết lượt; Ô chữ bỏ qua đội bị mất lượt (đoán sai từ khóa) một lần
  function luotTiep(i) {
    var n = G.doi.length; G.boQua = [];
    for (var k = 1; k <= n * 2; k++) {
      var j = (i + k) % n, d = G.doi[j];
      if (MA_TRO === 'tp' && (d.chot || d.luotDa >= G.luotMoiDoi)) continue;
      if (MA_TRO === 'oc' && d.matLuot) { d.matLuot = false; G.boQua.push(j); continue; }
      return j;
    }
    return (i + 1) % n;
  }
  function themLoi(C, t) { if (t) C.loiKet = (C.loiKet ? C.loiKet + '<br>' : '') + t; }
  // Báo lật kèo: đội dẫn đầu (một mình) đổi so với lần trước. Không báo khi bảng điểm đang đóng băng.
  function khoaHang(d) { return [d.loai ? 1 : 0, -d.chuong, -d.o, -d.nac, -d.diem].join('|'); }
  function baoDanDau() {
    if (!G || an()) return '';
    var ds = xepHang(); if (ds.length < 2) return '';
    if (MA_TRO === 'rung' ? khoaHang(ds[0]) === khoaHang(ds[1]) : (MA_TRO === 'xe' ? ds[0].o === ds[1].o : MA_TRO === 'tp' ? ds[0].nac === ds[1].nac : ds[0].diem === ds[1].diem)) return '';
    var cu = G.danDau; G.danDau = ds[0].i;
    if (cu == null || cu === ds[0].i) return '';
    setTimeout(function () { amThanh('chuong'); }, 500);
    return '<b class="tl-lat-keo">🔥 ' + doiHtml(ds[0].i, true) + ' vượt lên dẫn đầu!</b>';
  }

  // ---------- Câu cược (Rung chuông vàng: trước câu cuối · Ô chữ: trước vòng đoán từ khóa) ----------
  //   Mỗi đội / người chọn cược 0%, 25%, 50% số điểm đang có; đúng được cộng, sai (hoặc không trả lời) bị trừ.
  var CUOC_GIAY = 20;
  function moCuoc(ai, tiep, vong) {
    dungSang(); G.sang = null;
    if (hen.dem) { clearInterval(hen.dem); hen.dem = null; }
    G.gd = 'cuoc'; G.cuoc = { id: 'cuoc-' + G.id, ai: ai, muc: {}, tien: {}, daTinh: {}, het: Date.now() + CUOC_GIAY * 1000, tiep: tiep, vong: vong };
    amThanh('mo');
    veCuoc(); veDoi(); dayLen();
    dungCuoc();
    hen.cuoc = setInterval(function () {
      if (!G || G.gd !== 'cuoc' || !G.cuoc) return dungCuoc();
      var b = noi.querySelector('.tl-cuoc-dem'); if (b) b.textContent = Math.max(0, Math.ceil((G.cuoc.het - Date.now()) / 1000));
      if (Date.now() >= G.cuoc.het) xongCuoc();
    }, 250);
  }
  function dungCuoc() { if (hen.cuoc) { clearInterval(hen.cuoc); hen.cuoc = null; } }
  function veCuoc() {
    var k = noi.querySelector('.tl-cau-khu'), X = G.cuoc; if (!k || !X) return;
    var so = X.ai.filter(function (i) { return X.muc[i] != null; }).length;
    k.innerHTML = '<div class="tl-bao-lon cuoc">🎲 ' + (X.vong === 'khoa' ? 'Cược trước vòng đoán từ khóa!' : 'Câu cược: câu cuối cùng!') + '</div>' +
      '<p class="tl-ghi-chu tl-to">Mỗi ' + (laCN() ? 'em' : 'đội') + ' chọn trên điện thoại cược <b>0%</b> · <b>25%</b> · <b>50%</b> số điểm đang có.<br>' +
        (X.vong === 'khoa' ? 'Đoán đúng từ khóa: cộng thêm điểm cược. Đoán sai hoặc hết giờ chưa đoán: trừ điểm cược.' : 'Trả lời đúng: cộng điểm cược. Sai hoặc không trả lời: trừ điểm cược.') + '</p>' +
      (X.ai.length > 12 ? '<div class="tl-cn-dem">🎲 <b>' + so + '</b>/' + X.ai.length + ' người đã cược</div>'
        : '<div class="tl-cuoc-ds">' + X.ai.map(function (i) { return '<span class="tl-doi-ten ' + dm(i).mau + '">' + dm(i).ico + ' ' + esc(tenDoi(i)) + (X.muc[i] != null ? ' ✓' : ' …') + '</span>'; }).join('') + '</div>') +
      '<p class="tl-sang">⏳ Còn <b class="tl-cuoc-dem">' + Math.max(0, Math.ceil((X.het - Date.now()) / 1000)) + '</b> giây · ' + (PH.may ? 'chưa chọn tính là 0%' : 'cô bấm vào ô của đội để chọn mức cược') + '</p>' +
      '<div class="tl-hanh-dong"><button type="button" class="btn gold tl-cuoc-xong">' + (X.vong === 'khoa' ? 'Vào vòng cuối ›' : 'Vào câu cuối ›') + '</button></div>';
    k.querySelector('.tl-cuoc-xong').addEventListener('click', xongCuoc);
  }
  function nhanCuoc(d, v) {
    var X = G.cuoc; if (!X || G.gd !== 'cuoc' || X.ai.indexOf(d) < 0 || X.muc[d] != null || [0, 25, 50].indexOf(v) < 0) return;
    X.muc[d] = v; amThanh('cham');
    veCuoc(); veDoi(); dayLen();
    if (X.ai.every(function (i) { return X.muc[i] != null; })) setTimeout(function () { if (G && G.cuoc === X && G.gd === 'cuoc') xongCuoc(); }, 900);
  }
  function xongCuoc() {
    var X = G && G.cuoc; if (!X || G.gd !== 'cuoc') return;
    dungCuoc();
    X.ai.forEach(function (i) { var p = X.muc[i] || 0; X.muc[i] = p; X.tien[i] = Math.round(G.doi[i].diem * p / 100); });
    G.gd = 'cho';
    X.tiep();
  }
  function tinhCuoc(C) {   // Rung chuông vàng: câu cược đã chấm xong
    var X = C.cuoc;
    X.ai.forEach(function (i) { var t = X.tien[i] || 0, d = G.doi[i]; if (!t) return; d.diem = Math.max(0, d.diem + (C.kq[i] === 'dung' ? t : -t)); });
    themLoi(C, '🎲 Đã tính điểm cược' + (an() ? ', xem khi công bố kết quả!' : ''));
  }

  // ---------- Đua xe: ô đặc biệt trên đường đua (⚡ tăng tốc, 🕳️ ổ gà), quyền chặn ----------
  function taoODacBiet(dich) {
    var vt = []; for (var k = 2; k <= dich - 4; k++) vt.push(k);
    vt = tron(vt);
    var n = Math.max(1, Math.round(dich / 6)), m = {};
    vt.slice(0, n).forEach(function (k) { m[k] = 'tang'; });
    vt.slice(n, 2 * n).forEach(function (k) { m[k] = 'ga'; });
    return m;
  }
  function datChan(x) {
    var X = G && G.chanCho; if (!X || X.da != null || !(x >= 0 && x < G.doi.length) || x === X.doi) return;
    X.da = x; G.doi[x].biChan = true; G.doi[X.doi].chan = Math.max(0, G.doi[X.doi].chan - 1);
    amThanh('sai');
    if (G.cau && !G.cau.mo) veCau();
    veDoi(); veBang(); dayLen();
    if (G.sang) { var co = doiCoMay(); if (co.length && co.every(function (i) { return G.sang.san[i]; })) diTiep(); }
  }

  // ---------- Tự sang câu: hiện đáp án xong đếm S.tuSang giây rồi tự đi tiếp ----------
  //   Các đội có máy đều bấm "Câu tiếp" trên điện thoại thì đi luôn; ⏸ trên màn chiếu dừng đếm để giảng.
  function batSang(id, tiep, ket) {
    dungSang();
    G.sang = { id: id, tiep: tiep, ket: !!ket, san: {}, dung: false, het: S.tuSang ? Date.now() + S.tuSang * 1000 : 0 };
    hen.sang = setInterval(function () {
      var x = G && G.sang; if (!x) return dungSang();
      veDemSang();
      if (x.het && !x.dung && Date.now() >= x.het) diTiep();
    }, 250);
  }
  function dungSang() { if (hen.sang) { clearInterval(hen.sang); hen.sang = null; } }
  function diTiep() { var x = G && G.sang; if (!x) return; G.sang = null; dungSang(); x.tiep(); }
  function nhanTiep(d, b) {
    var x = G.sang; if (!x || b.c !== x.id || x.san[d]) return;
    x.san[d] = 1;
    var co = doiCoMay();
    if (co.length && co.every(function (i) { return x.san[i]; })) return diTiep();
    veDemSang(); dayLen();
  }
  function nutSang(nhan) {
    return '<span class="tl-sang" aria-live="polite"></span>' +
      (S.tuSang ? '<button type="button" class="btn tl-dung-sang" title="Dừng đếm để giảng">⏸ Dừng</button>' : '') +
      '<button type="button" class="btn gold tl-tiep">' + nhan + '</button>';
  }
  function ganSang(k) {
    if (!k) return;
    var tp = k.querySelector('.tl-tiep'); if (tp) tp.addEventListener('click', diTiep);
    var dg = k.querySelector('.tl-dung-sang');
    if (dg) {
      if (G && G.sang && G.sang.dung) dg.textContent = '▶ Đếm tiếp';
      dg.addEventListener('click', function () {
        var x = G && G.sang; if (!x) return;
        x.dung = !x.dung;
        if (!x.dung) x.het = Date.now() + S.tuSang * 1000;
        dg.textContent = x.dung ? '▶ Đếm tiếp' : '⏸ Dừng';
        veDemSang(); dayLen();
      });
    }
    veDemSang();
  }
  function veDemSang() {
    var k = noi.querySelector('.tl-sang'), x = G && G.sang; if (!k || !x) return;
    var co = doiCoMay(), so = co.filter(function (i) { return x.san[i]; }).length;
    var dem = x.het && !x.dung ? '⏭ Tự sang sau <b>' + Math.max(0, Math.ceil((x.het - Date.now()) / 1000)) + '</b>s' : x.dung ? '⏸ Đã dừng đếm' : '';
    var san = co.length ? (dem ? ' · ' : '') + '<span class="tl-sang-so">✋ ' + so + '/' + co.length + (laCN() ? ' người' : ' đội') + '</span>' : '';
    var h = dem + san;
    if (k.innerHTML !== h) k.innerHTML = h;
  }

  // Chấm điểm từng trò
  var CHAM = {
    rung: function (C, dungDs) {
      var biTru = C.ai.filter(function (i) { return C.kq[i] !== 'dung'; });
      dungDs.forEach(function (i, k) { G.doi[i].diem += 10 + (k === 0 ? 5 : 0); G.doi[i].dung++; });
      if (biTru.length === C.ai.length && C.ai.length > 1) { C.loiKet = 'Cả lớp cùng chưa đúng: không ' + (laCN() ? 'ai' : 'đội nào') + ' mất chuông 🙌'; return; }
      var bias = [];
      biTru.forEach(function (i) { var d = G.doi[i]; d.chuong--; if (d.chuong <= 0) { d.chuong = 0; d.loai = true; bias.push(i); } });
      if (bias.length) { amThanh('sai'); C.loiKet = bias.slice(0, 6).map(function (i) { return doiHtml(i, true); }).join(' ') + (bias.length > 6 ? ' và ' + (bias.length - 6) + ' người khác' : '') + ' hết chuông, bị loại!'; }
      else if (dungDs.length) C.loiKet = doiHtml(dungDs[0], true) + ' trả lời đúng nhanh nhất (+5)';
    },
    // Đua xe: đúng +1, nhanh nhất +2; đội cuối (khi chưa đều nhau) đúng thêm +1 💨; ⚡ nhân đôi; 🚧 bị chặn tối đa 1 ô;
    //   🕳️ ổ gà: câu sau sai / không trả lời lùi 1 ô. Dừng (tiến) đúng ô ⚡ / 🕳️ thì có hiệu lực ở câu sau.
    xe: function (C, dungDs) {
      var os = G.doi.map(function (d) { return d.o; }), mn = Math.min.apply(null, os), mx = Math.max.apply(null, os), dong = [], su = [];
      G.doi.forEach(function (d) {
        var i = d.i, b = 0, ky = '';
        if (C.kq[i] === 'dung') {
          b = i === dungDs[0] ? 2 : 1;
          if (mn < mx && d.o === mn) { b += 1; ky += '💨'; }
          if (d.tang) { b *= 2; ky += '⚡'; }
          if (d.biChan) { b = Math.min(b, 1); ky += '🚧'; }
          d.dung++;
        } else if (d.ga) { b = -1; ky += '🕳️'; }
        d.tang = d.ga = d.biChan = false;
        var cu = d.o; d.o = Math.max(0, Math.min(G.dich, d.o + b)); b = d.o - cu; d.diem = d.o * 10; d.buoc = b;
        if (b) dong.push(dm(i).ico + ' ' + (b > 0 ? '+' : '−') + Math.abs(b) + (ky ? ' ' + ky : ''));
        var o = b > 0 && d.o < G.dich ? G.oDB[d.o] : '';
        if (o === 'tang') { d.tang = true; su.push(doiHtml(i, true) + ' vào ô ⚡ tăng tốc: câu sau đúng được nhân đôi!'); }
        if (o === 'ga') { d.ga = true; su.push(doiHtml(i, true) + ' sập ổ gà 🕳️: câu sau sai sẽ lùi 1 ô!'); }
      });
      var txt = [];
      if (dungDs.length) txt.push(doiHtml(dungDs[0], true) + ' đúng nhanh nhất 🚀');
      if (dong.length) txt.push(dong.join(' · '));
      C.loiKet = txt.concat(su).join('<br>');
      G.chanCho = null;
      var nh = dungDs[0];
      if (nh != null && G.doi[nh].chan > 0 && G.doi.length > 1 && !G.doi.some(function (d) { return d.o >= G.dich; })) G.chanCho = { id: 'chan-' + C.id, doi: nh, da: null };
    },
    // Triệu phú: đội lượt đúng leo 1 nấc; sai / hết giờ rơi về mốc; dừng thì chốt. Đội lượt không đúng (sai, hết giờ, dừng)
    //   → đội trả lời ngầm đúng nhanh nhất cướp 1 nấc.
    tp: function (C, dungDs) {
      var L = G.luot, d = G.doi[L], kq = C.kq[L], txt = [];
      var ngam = dungDs.filter(function (i) { return i !== L && !G.doi[i].chot; });
      if (kq === 'chot') { d.chot = true; txt.push(doiHtml(L, true) + ' dừng cuộc chơi, chốt ' + (an() ? 'số tiền đang có' : 'nấc ' + d.nac + ' · ' + NAC[d.nac - 1]) + ' 🛑'); }
      else if (kq === 'dung') { d.nac = Math.min(10, d.nac + 1); d.dung++; txt.push(doiHtml(L, true) + (an() ? ' trả lời đúng: leo lên 1 nấc ⬆️' : ' leo lên nấc ' + d.nac + ' · ' + NAC[d.nac - 1] + (MOC.indexOf(d.nac) >= 0 ? ' 🛡️ (mốc an toàn)' : ''))); }
      else { var cu = d.nac; d.nac = d.nac >= 5 ? 5 : 0; txt.push(doiHtml(L, true) + (kq === 'trong' ? ' hết giờ' : ' trả lời chưa đúng') + (an() ? (cu === d.nac ? ', giữ nấc' : ', rơi về mốc an toàn') : (cu === d.nac ? ', giữ nấc ' + d.nac : ', rơi về ' + (d.nac ? 'mốc nấc 5' : 'nấc 0')))); }
      if (kq !== 'dung' && ngam.length) {
        var c = G.doi[ngam[0]]; c.nac = Math.min(10, c.nac + 1); c.dung++;
        setTimeout(function () { amThanh('cuop'); }, 350);
        txt.push('<b class="tl-lat-keo">🕵️ ' + doiHtml(ngam[0], true) + ' trả lời ngầm đúng nhanh nhất: cướp 1 nấc' + (an() ? '' : ' → nấc ' + c.nac + ' · ' + NAC[c.nac - 1]) + '!</b>');
      } else if (kq === 'dung' && ngam.length) txt.push('<small>🕵️ ' + ngam.length + ' đội khác cũng trả lời đúng ngầm</small>');
      else if (kq !== 'dung' && C.ai.length > 1) txt.push('<small>🕵️ Không đội nào trả lời ngầm đúng</small>');
      d.luotDa++;
      G.doi.forEach(function (x) { x.diem = x.nac ? +NAC[x.nac - 1].replace(/\./g, '') : 0; });
      C.loiKet = txt.join('<br>');
    }
  };
  function ketThucChua() {
    if (MA_TRO === 'rung') { var con = G.doi.filter(function (d) { return !d.loai; }); return G.soCau >= G.tong || con.length <= (G.doi.filter(function (d) { return !d.vang; }).length > 1 ? 1 : 0); }
    if (MA_TRO === 'xe') return G.doi.some(function (d) { return d.o >= G.dich; }) || G.soCau >= 60;
    if (MA_TRO === 'tp') return G.doi.some(function (d) { return d.nac >= 10; }) || G.doi.every(function (d) { return d.chot || d.luotDa >= G.luotMoiDoi; });
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
    } else if (k === 'dung' && d.nac >= 1 && !C.tl[G.luot]) {        // dừng cuộc chơi: chốt tiền, câu này thành câu cướp cho các đội ngầm
      C.tl[G.luot] = { x: -1, chot: true, t: Date.now() + PH.lech };
      rutGioNgam(C, G.luot);
      amThanh('chuong'); veCau(); veDoi(); dayLen();
      if (C.ai.every(function (i) { return C.tl[i]; })) setTimeout(function () { if (G && G.cau === C && C.mo) dongCau(); }, 500);
    }
  }

  // Cô bấm vào ô đội: chọn đáp án thay đội (khi đội không có điện thoại / mạng lỗi)
  function moChamTay(i, o) {
    if (!G || laCN()) return;
    var cu = noi.querySelector('.tl-pop'); if (cu) cu.remove();
    var html = '';
    if (G.gd === 'cuoc' && G.cuoc && G.cuoc.ai.indexOf(i) >= 0 && G.cuoc.muc[i] == null)
      html = '<p>🎲 ' + doiHtml(i, true) + ' cược</p><div class="tl-pop-nut">' + [0, 25, 50].map(function (v) { return '<button type="button" data-cuoc="' + v + '">' + v + '%</button>'; }).join('') + '</div>';
    else if (G.chanCho && G.chanCho.da == null && i !== G.chanCho.doi)
      html = '<p>🚧 ' + doiHtml(G.chanCho.doi, true) + ' chặn đội này?</p><div class="tl-pop-nut"><button type="button" data-chan="1">🚧 Chặn ' + esc(tenDoi(i)) + '</button></div>';
    else if (G.oc) html = ocChamTayHtml(i);
    else if (G.cau && G.cau.mo && G.cau.ai.indexOf(i) >= 0 && !G.cau.tl[i]) {
      html = '<p>Chọn thay ' + doiHtml(i, true) + '</p><div class="tl-pop-nut">' + G.cau.q.dap.map(function (x, k) { return (G.cau.an || []).indexOf(k) >= 0 ? '' : '<button type="button" data-x="' + k + '">' + CHU[k] + '</button>'; }).join('') + '</div>' +
        (MA_TRO === 'tp' && i === G.luot ? '<div class="tl-pop-nut tg">' + (G.doi[i].nac >= 1 ? '<button type="button" data-tg="dung">🛑 Dừng</button>' : '') + (G.doi[i].tg.nam ? '<button type="button" data-tg="5050">50:50</button>' : '') + (G.doi[i].tg.doi ? '<button type="button" data-tg="doi">🔄 Đổi câu</button>' : '') + (G.doi[i].tg.gio ? '<button type="button" data-tg="gio">⏱ +15 giây</button>' : '') + '</div>' : '');
    }
    if (!html) return;
    var p = document.createElement('div'); p.className = 'tl-pop'; p.innerHTML = html + '<button type="button" class="tl-pop-x" aria-label="Đóng">✕</button>';
    o.appendChild(p);
    p.addEventListener('click', function (e) {
      e.stopPropagation();
      var b = e.target.closest('button'); if (!b) return;
      if (b.dataset.x != null) nhanDap(i, +b.dataset.x, Date.now() + PH.lech, true);
      if (b.dataset.tg) troGiup(b.dataset.tg);
      if (b.dataset.cuoc != null) nhanCuoc(i, +b.dataset.cuoc);
      if (b.dataset.chan) datChan(i);
      if (b.dataset.oc) ocChamTay(i, b.dataset.oc);
      p.remove();
    });
  }

  // ---------- Bảng riêng của từng trò ----------
  function veBang() {
    var b = noi.querySelector('.tl-bang'); if (!b || !G) return;
    if (MA_TRO === 'xe') {
      b.innerHTML = '<div class="tl-duong">' + G.doi.map(function (d, i) {
        var o = ''; for (var k = 0; k <= G.dich; k++) { var db = G.oDB[k]; o += '<i class="' + (k === G.dich ? 'dich' : k > G.dich - 4 && k ? 'rut' : '') + (db ? ' ' + db : '') + '">' + (db === 'tang' ? '⚡' : db === 'ga' ? '🕳️' : '') + '</i>'; }
        return '<div class="tl-lan ' + dm(i).mau + '"><span class="tl-lan-ten">' + dm(i).ico + '</span><div class="tl-lan-o" style="--n:' + (G.dich + 1) + '">' + o +
          '<span class="tl-xe" style="--vt:' + d.o + '">🏎️<small class="tl-xe-co">' + (d.tang ? '⚡' : '') + (d.ga ? '🕳️' : '') + (d.biChan ? '🚧' : '') + '</small></span></div></div>';
      }).join('') + '</div><div class="tl-duong-chu">⚡ tăng tốc: câu sau đúng ×2 · 🕳️ ổ gà: câu sau sai lùi 1 ô · 💨 đội cuối đúng +1 · 🏁 3 ô cuối: câu Khó</div>';
    } else if (MA_TRO === 'tp') {
      b.innerHTML = '<ol class="tl-thang">' + NAC.map(function (n, k) {
        var nac = 10 - k, o = an() ? '' : G.doi.filter(function (d) { return d.nac === nac; }).map(function (d) { return '<span class="tl-ai ' + dm(d.i).mau + '">' + dm(d.i).ico + '</span>'; }).join('');
        return '<li class="' + (MOC.indexOf(nac) >= 0 ? 'moc' : '') + (G.cau && G.cau.nac === nac && !an() ? ' dang' : '') + '"><b>' + nac + '</b><span>' + NAC[nac - 1] + '</span><em>' + o + '</em></li>';
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
    '<div class="tl-oc-khoa">🔑 Từ khóa hàng dọc: <b>' + O.khoaChu.length + ' chữ cái</b>' + (xongHet ? '' : ' · đoán ' + (O.gd === 'khoa' ? 'đúng' : 'ngay') + ': <b class="tl-oc-thuong">+' + ocDiemKhoa() + '</b>' + (O.gd === 'khoa' ? '' : ', sai mất lượt')) + (O.hangDs.filter(function (h) { return h.tt; }).length * 2 >= O.hangDs.length ? ' · gợi ý: <i>' + esc(O.khoa.nghia) + '</i>' : '') +
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
      daDoan: G.doi.map(function (d) { return d.daDoanKhoa; }), choGianh: (O.choGianh || []).filter(function (i) { return !(O.daGianh || {})[i]; }),
      ngam: !!(PH.may && O.gd === 'hang'), daNgam: Object.keys(O.ngam || {}).map(Number), khoaDiem: ocDiemKhoa(),
      goiY: O.hang != null && (O.gd === 'hang' || O.gd === 'gianh') ? (function (h) { return { loai: h.goiY, txt: h.goiY === 'nghia' ? h.w.nghia : h.goiY === 'han' ? h.w.han : '', doc: h.goiY === 'nghe' ? h.w.docTxt : '' }; })(O.hangDs[O.hang]) : null,
      giai: O.gd === 'xong' && O.hang != null ? (function (h) { return { han: h.w.han, py: h.w.py, nghia: h.w.nghia, doc: h.w.docTxt }; })(O.hangDs[O.hang]) : null,
      khoaDap: O.gd === 'het' ? { han: O.khoa.han, py: O.khoa.py, nghia: O.khoa.nghia } : null, goiYKhoa: O.gd === 'khoa' ? O.khoa.nghia : '' };
  }
  function ocTrangThaiDoi(i) {
    var O = G.oc, d = G.doi[i], s = '';
    if (O.gd === 'chon' && G.luot === i) s = '<span class="tl-nghi">đang chọn hàng…</span>';
    if (O.gd === 'hang' && G.luot === i) s = '<span class="tl-nghi">đang trả lời…</span>';
    if (O.gd === 'hang' && G.luot !== i && PH.may) s = O.ngam && O.ngam[i] ? '<b class="tl-da">🕵️ đã trả lời ngầm</b>' : '<span class="tl-nghi">🕵️ trả lời ngầm…</span>';
    if (O.gd === 'gianh' && (O.choGianh || []).indexOf(i) >= 0) s = O.daGianh && O.daGianh[i] ? '<b class="tl-sai">✗</b>' : '<span class="tl-nghi">giành quyền…</span>';
    if (O.gd === 'khoa') s = d.daDoanKhoa ? '<b class="tl-sai">đã đoán</b>' : '<span class="tl-nghi">đoán từ khóa…</span>';
    if (d.daDoanKhoa && O.gd !== 'khoa') s += ' <small class="tl-sai">🔑✗</small>';
    return s;
  }
  function ocCau(r) { return 'oc' + G.id + '-' + r + '-' + G.oc.lanThu; }
  function ocChonHang() {
    var O = G.oc;
    var con = O.hangDs.filter(function (h) { return !h.tt; });
    if (!con.length) {
      if (!G.daCuoc) {                                    // trước vòng cuối: các đội chưa đoán từ khóa cược điểm
        var ai = G.doi.filter(function (d) { return !d.daDoanKhoa; }).map(function (d) { return d.i; });
        if (ai.length) { G.daCuoc = true; return moCuoc(ai, ocVongKhoa, 'khoa'); }
      }
      return ocVongKhoa();
    }
    O.gd = 'chon'; O.hang = null; O.het = 0; G.gd = 'oc'; G.sang = null; dungSang();
    var k = noi.querySelector('.tl-cau-khu'), bao = kiemDongBang(), bo = (G.boQua || []).filter(function (i) { return i !== G.luot; });
    G.boQua = [];
    k.innerHTML = bao + (bo.length ? '<p class="tl-loi-ket">⏭ ' + bo.map(function (i) { return doiHtml(i, true); }).join(' ') + ' mất lượt (đoán sai từ khóa)</p>' : '') +
      '<div class="tl-luot">' + doiHtml(G.luot) + ' chọn một hàng ngang</div>' +
      '<p class="tl-ghi-chu tl-to">Đội chọn trên điện thoại, hoặc cô bấm vào hàng trên ô chữ.</p>' +
      '<p class="tl-ghi-chu">' + (PH.may ? 'Các đội khác <b>trả lời ngầm</b>: đội lượt sai thì đội ngầm đúng nhanh nhất được +5. ' : '') +
        'Đội nào cũng có thể <b>đoán từ khóa</b> bất cứ lúc nào (mỗi đội 1 lần): càng sớm điểm càng cao, đoán sai mất lượt kế tiếp.</p>';
    veBang(); veDoi(); dayLen();
  }
  function ocMoHang(r) {
    var O = G.oc, h = O.hangDs[r]; if (!h || h.tt || O.gd !== 'chon') return;
    O.hang = r; O.gd = 'hang'; O.lanThu = 'a'; O.giay = giayCau(); O.het = Date.now() + O.giay * 1000; O.choGianh = []; O.daGianh = {}; O.ngam = {};
    amThanh('mo');
    ocVeGoiY(); veBang(); veDoi(); chayDem(); dayLen();
    if (h.goiY === 'nghe') setTimeout(function () { docChieu(h.w.docTxt); }, 300);
  }
  function ocVeGoiY(them) {
    var O = G.oc, h = O.hangDs[O.hang], w = h.w;
    var goiY = h.goiY === 'nghia' ? '<div class="tl-de-nghia">' + esc(w.nghia) + '</div>'
      : h.goiY === 'han' ? '<div class="tl-de-chu"><span class="hanzi">' + esc(w.han) + '</span></div>'
      : '<div class="tl-de-nghe">🎧 Nghe cô đọc</div><button type="button" class="tl-nghe-to">🔊 Nghe lại</button>';
    var ai = O.gd === 'hang' ? doiHtml(G.luot) + ' trả lời' + (PH.may && G.doi.length > 1 ? ' · 🕵️ các đội khác trả lời ngầm' : '') : O.gd === 'gianh' ? 'Các đội còn lại giành quyền trả lời!' : '';
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
      else if (O.gd === 'hang' && PH.may && !O.ngam[d]) {          // trả lời ngầm: giữ lại, chỉ xét khi đội lượt sai / hết giờ
        O.ngam[d] = { x: b.x, t: b.t || Date.now(), dung: chuanDap(b.x) === O.hangDs[O.hang].chu };
        amThanh('cham'); veDoi(); dayLen();
      }
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
  function ocGianh(lyDo) {   // đội lượt trả lời sai / hết giờ → đội ngầm đúng nhanh nhất ăn +5; không có thì các đội chưa trả lời ngầm giành quyền
    var O = G.oc, ng = O.ngam || {};
    var dungNgam = Object.keys(ng).map(Number).filter(function (i) { return ng[i].dung; }).sort(function (a, b) { return ng[a].t - ng[b].t; });
    if (dungNgam.length) { O.cuop = true; return ocXongHang(dungNgam[0], 5, lyDo); }
    O.choGianh = G.doi.map(function (d) { return d.i; }).filter(function (i) { return i !== G.luot && !ng[i]; });
    if (!O.choGianh.length) return ocXongHang(-1, 0, lyDo);
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
  function ocXongHang(d, diem, lyDo) {
    var O = G.oc, h = O.hangDs[O.hang], cuop = O.cuop; O.cuop = false;
    if (hen.dem) { clearInterval(hen.dem); hen.dem = null; }
    O.het = 0; h.tt = d >= 0 ? 'mo' : 'hong'; O.gd = 'xong';
    if (d >= 0) { G.doi[d].diem += diem; G.doi[d].dung++; amThanh(cuop ? 'cuop' : 'dung'); } else amThanh('sai');
    veBang(); veDoi();
    var k = noi.querySelector('.tl-cau-khu');
    k.innerHTML = '<div class="tl-luot">Hàng ' + (O.hang + 1) + '</div>' +
      '<div class="tl-giai to">' + TV.nutLoa(h.w.docTxt) + '<span><span class="hanzi">' + esc(h.w.han) + '</span> <b>' + esc(h.w.py) + '</b> · ' + esc(h.w.nghia) + '</span></div>' +
      '<p class="tl-loi-ket">' + (cuop ? doiHtml(G.luot, true) + (lyDo && lyDo.het ? ' hết giờ' : ' trả lời chưa đúng' + (lyDo && lyDo.sai ? ': <s>' + esc(lyDo.sai) + '</s>' : '')) + '<br><b class="tl-lat-keo">🕵️ ' + doiHtml(d, true) + ' trả lời ngầm đúng nhanh nhất: cướp +' + diem + ' điểm!</b>'
        : d >= 0 ? doiHtml(d, true) + ' giải đúng: +' + diem + ' điểm 🎉' : 'Chưa đội nào giải được hàng này.') + '</p>' + (function () { var t = baoDanDau(); return t ? '<p class="tl-loi-ket">' + t + '</p>' : ''; })() +
      '<div class="tl-hanh-dong">' + nutSang('Tiếp ›') + '</div>';
    setTimeout(function () { docChieu(h.w.docTxt); }, 300);
    batSang('oc' + G.id + '-x' + O.hang, function () { G.luot = luotTiep(G.luot); ocChonHang(); });
    ganSang(k);
    dayLen();
  }
  // Điểm đoán từ khóa: 20 + 5 × số hàng ngang chưa giải (vòng cuối: 20)
  function ocDiemKhoa() { var O = G.oc; return O.gd === 'khoa' ? 20 : 20 + 5 * O.hangDs.filter(function (h) { return !h.tt; }).length; }
  function ocTienCuoc(d) { var X = G.cuoc; return X && X.vong === 'khoa' && X.ai.indexOf(d) >= 0 && !X.daTinh[d] ? X.tien[d] || 0 : 0; }
  function ocTinhCuocCon() {   // hết vòng cuối: đội cược mà chưa đoán (hoặc không kịp) bị trừ điểm cược
    var X = G.cuoc; if (!X || X.vong !== 'khoa') return;
    X.ai.forEach(function (i) { if (X.daTinh[i]) return; X.daTinh[i] = 1; G.doi[i].diem = Math.max(0, G.doi[i].diem - (X.tien[i] || 0)); });
  }
  function ocDoanKhoa(d, x) {
    var O = G.oc; G.doi[d].daDoanKhoa = true;
    var dung = x === true || chuanDap(x) === O.khoaChu, cuoc = ocTienCuoc(d);
    if (G.cuoc && G.cuoc.vong === 'khoa') G.cuoc.daTinh[d] = 1;
    if (dung) {
      var them = ocDiemKhoa() + cuoc;
      G.doi[d].diem += them;
      ocTinhCuocCon();
      if (hen.dem) { clearInterval(hen.dem); hen.dem = null; }
      O.gd = 'het'; O.het = 0; amThanh('chuong');
      veBang(); veDoi();
      noi.querySelector('.tl-cau-khu').innerHTML = '<div class="tl-luot">🔑 ' + doiHtml(d, true) + ' đoán đúng từ khóa: +' + them + ' điểm!</div>' +
        '<div class="tl-giai to">' + TV.nutLoa(O.khoa.docTxt) + '<span><span class="hanzi">' + esc(O.khoa.han) + '</span> <b>' + esc(O.khoa.py) + '</b> · ' + esc(O.khoa.nghia) + '</span></div>' +
        '<div class="tl-hanh-dong">' + nutSang('Xem kết quả 🏆') + '</div>';
      batSang('oc' + G.id + '-ket', ketThuc, true); ganSang(noi.querySelector('.tl-cau-khu'));
      setTimeout(function () { docChieu(O.khoa.docTxt); }, 300);
      dayLen();
    } else {
      var vongCuoi = O.gd === 'khoa';
      if (cuoc) G.doi[d].diem = Math.max(0, G.doi[d].diem - cuoc);
      if (!vongCuoi) G.doi[d].matLuot = true;
      amThanh('sai'); TV.baoLoi(tenDoi(d) + ' đoán từ khóa chưa đúng' + (typeof x === 'string' && x ? ': ' + x : '') + (vongCuoi ? (cuoc ? ' · mất điểm cược' : '') : ' · mất lượt kế tiếp') + '.');
      veDoi(); veBang(); dayLen();
      if (O.gd === 'khoa' && G.doi.every(function (z) { return z.daDoanKhoa; })) ocHetKhoa();
    }
  }
  function ocVongKhoa() {   // hết hàng ngang: mọi đội chưa đoán cùng đoán từ khóa
    var O = G.oc;
    if (G.doi.every(function (d) { return d.daDoanKhoa; })) return ocHetKhoa();
    O.gd = 'khoa'; O.hang = null; O.giay = 30; O.het = Date.now() + 30000; G.sang = null; dungSang(); G.gd = 'oc';
    noi.querySelector('.tl-cau-khu').innerHTML = kiemDongBang() + '<div class="tl-luot">🔑 Vòng cuối: các đội đoán từ khóa hàng dọc (' + O.khoaChu.length + ' chữ cái) · đúng +20' + (G.cuoc ? ' + điểm cược' : '') + '</div>' +
      '<div class="tl-de"><div class="tl-de-dau"><span class="tl-dang">Gợi ý: ' + esc(O.khoa.nghia) + '</span>' + dongHo() + '</div></div>' +
      '<div class="tl-hanh-dong"><button type="button" class="btn tl-oc-bo">Hết giờ</button></div>';
    noi.querySelector('.tl-oc-bo').addEventListener('click', ocHetKhoa);
    veBang(); veDoi(); chayDem(); dayLen();
  }
  function ocHetKhoa() {
    var O = G.oc; if (O.gd === 'het') return;
    if (hen.dem) { clearInterval(hen.dem); hen.dem = null; }
    O.gd = 'het'; O.het = 0;
    ocTinhCuocCon();
    veBang(); veDoi();
    noi.querySelector('.tl-cau-khu').innerHTML = '<div class="tl-luot">🔑 Từ khóa là</div>' +
      '<div class="tl-giai to">' + TV.nutLoa(O.khoa.docTxt) + '<span><span class="hanzi">' + esc(O.khoa.han) + '</span> <b>' + esc(O.khoa.py) + '</b> · ' + esc(O.khoa.nghia) + '</span></div>' +
      '<div class="tl-hanh-dong">' + nutSang('Xem kết quả 🏆') + '</div>';
    batSang('oc' + G.id + '-ket', ketThuc, true); ganSang(noi.querySelector('.tl-cau-khu'));
    setTimeout(function () { docChieu(O.khoa.docTxt); }, 300);
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
    var ds = G.doi.filter(function (d) { return !d.vang; });
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
    G.sang = null; G.chanCho = null;
    // Bảng điểm đã đóng băng: công bố từ từ, từ hạng 5 (hoặc hạng thấp nhất) lên hạng 1; điện thoại chờ tới khi xong
    var K = G.dongBang ? Math.min(5, thu.length) : 0;
    G.lat = false;                      // dựng bảng với số thật; bật lại ngay sau khi dựng xong
    function lat(k) { return k < K ? ' tl-lat" data-lat="' + k : ''; }
    SAN_SANG = S.cheDo === 'tu' && PH && PH.may ? { id: 'moi-' + G.id, san: {}, het: 0 } : null;
    if (G.oc) G.oc.gd = 'het';
    if (!K) amThanh('xong');
    var huy = ['🥇', '🥈', '🥉', '🎖️'];
    var bangVang = laCN() ? '<ol class="tl-cn-xep">' + thu.map(function (x, k) {
        var d = x.d;
        return '<li class="h' + Math.min(x.hang, 4) + (d.loai ? ' loai' : '') + lat(k) + '"><span class="tl-huy">' + (x.hang <= 3 ? huy[x.hang - 1] : x.hang) + '</span><b>' + esc(tenDoi(d.i)) + '</b><small>' + esc((NGUOI[d.i] || {}).lop || '') + '</small>' +
          '<span>' + (d.loai ? '❌ bị loại' : '🔔 ' + d.chuong) + ' · ' + d.diem + ' điểm · ' + d.dung + ' câu đúng</span></li>';
      }).join('') + '</ol><p class="tl-ghi-chu tl-luu-diem" aria-live="polite"></p>' : '';
    noi.innerHTML = '<div class="tl-the tl-ket-the">' +
      '<div class="tl-ket-dau">🏆 ' + esc(T.ten) + '</div>' + bangVang +
      '<div class="tl-bang-vang"' + (laCN() ? ' hidden' : '') + '>' + thu.map(function (x, k) {
        var d = x.d;
        if (laCN()) return '';
        return '<div class="tl-hang-doi ' + dm(d.i).mau + ' h' + x.hang + lat(k) + '"><span class="tl-huy">' + huy[x.hang - 1] + '</span>' + doiHtml(d.i) +
          '<span class="tl-ket-so">' + phuDoi(d).replace('Bị loại', '❌ Bị loại') + ' · ' + d.diem + ' điểm · ' + d.dung + ' câu đúng</span></div>';
      }).join('') + '</div>' +
      (K ? '<p class="tl-loi-ket tl-cong-bo">🥁 Công bố kết quả…</p>' : '') +
      '<p class="tl-loi-ket tl-chuc"' + (K ? ' hidden' : '') + '>Chúc mừng ' + thu.filter(function (x) { return x.hang === 1; }).map(function (x) { return doiHtml(x.d.i, true); }).join(' và ') + '! 🎉</p>' +
      (SAN_SANG ? '<p class="tl-tu-bd" aria-live="polite"></p>' : '') +
      '<div class="tl-cai-nut"><button type="button" class="btn gold tl-van-moi">↻ Chơi ván mới (giữ phòng)</button><button type="button" class="btn tl-ve-cai">‹ Đổi cài đặt</button></div>' +
    '</div>';
    G.lat = K > 0;
    noi.querySelector('.tl-van-moi').addEventListener('click', batDauVan);
    veSanSang();
    noi.querySelector('.tl-ve-cai').addEventListener('click', function () { PH = null; manCai(); });
    dayLen();
    if (PH && PH.may) batDauDoc(S.cheDo === 'tu' ? 1500 : 3000);
    if (nhat && !G.lat) setTimeout(function () { amThanh('chuong'); }, 700);
    if (G.lat) {
      var Gx = G;
      for (var j = K - 1; j >= 0; j--) (function (j, t) {
        setTimeout(function () {
          if (G !== Gx) return;
          var e = noi.querySelector('[data-lat="' + j + '"]'); if (e) e.classList.add('hien');
          amThanh(j ? 'dem' : 'xong');
          if (j === 0) {
            Gx.lat = false;
            var c = noi.querySelector('.tl-chuc'), cb = noi.querySelector('.tl-cong-bo'); if (c) c.hidden = false; if (cb) cb.remove();
            setTimeout(function () { amThanh('chuong'); }, 600);
            dayLen();
          }
        }, t);
      })(j, 1200 + (K - 1 - j) * 1500);
    }
    if (laCN()) luuDiemCN();
  }

  // Cá nhân: lưu điểm từng em lên máy chủ điểm (như Bài tập / trò chơi cá nhân) — em có họ tên + lớp mới lưu được
  function luuDiemCN() {
    var o = noi.querySelector('.tl-luu-diem'), api = window.QM_API, Gx = G;
    var n = NHOM.filter(function (x) { return x.ma === S.nhom; })[0];
    if (!o || !n) return;
    if (!api) { o.textContent = 'Bảng xếp hạng chưa được nối nên điểm chưa được lưu.'; return; }
    var lesson = [CF.maDiem == null ? 'h2' : CF.maDiem, n.tongHop ? (CF.tongHopDiem || 'tong-hop-bai0') : n.diem, 'tro-choi', 'rung-chuong-vang', S.muc].filter(Boolean).join('-');
    var ten = (CF.tenDiem || '') + n.ten + ' · Rung chuông vàng (cá nhân) · ' + CH.MUC_LOP[S.muc].ten;
    var ds = Gx.doi.filter(function (d) { return !d.vang && NGUOI[d.i] && NGUOI[d.i].ten && NGUOI[d.i].lop; }), xong = 0, loi = 0, tong = Gx.doi.filter(function (d) { return !d.vang; }).length;
    var bao = function () { o.textContent = '💾 Lưu điểm: ' + xong + '/' + ds.length + ' em' + (loi ? ' · ' + loi + ' em chưa lưu được' : '') + (tong > ds.length ? ' · ' + (tong - ds.length) + ' em không ghi lớp nên không lưu' : '') + '.'; };
    bao();
    var giay = Math.round((Date.now() - (Gx.batDauLuc || Date.now())) / 1000);
    (function tiep(k) {
      if (k >= ds.length) return;
      var d = ds[k], ng = NGUOI[d.i];
      fetch(api, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'submit', lesson: lesson, lessonTitle: ten, hoTen: ng.ten, lop: ng.lop,
        score: d.diem, total: Math.max(d.diem, Gx.tong * 15), bestStreak: 0, durationSeconds: giay, hoSoId: ng.hs || '', chiTiet: [] }) })
        .then(function (r) { return r.json(); }).then(function (x) { if (x && x.ok) xong++; else loi++; }, function () { loi++; })
        .then(function () { bao(); tiep(k + 1); });
    })(0);
  }

  function moKhoaAm() {   // trình duyệt chỉ cho đọc / phát âm sau một lần bấm của người dùng
    try { if (window.speechSynthesis) { var u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'zh-CN'; speechSynthesis.speak(u); } } catch (e) {}
    try { var C = CH.AM.ctx || (CH.AM.ctx = new (window.AudioContext || window.webkitAudioContext)()); if (C.state === 'suspended') C.resume(); } catch (e) {}
  }
  window.addEventListener('beforeunload', function (e) { if (G && G.gd !== 'ket') { e.preventDefault(); e.returnValue = ''; } });

  manCai();
  window.QM_LOP_KIEM = { taoOChu: taoOChu, chuanDap: chuanDap, G: function () { return G; }, PH: function () { return PH; } };
})();
