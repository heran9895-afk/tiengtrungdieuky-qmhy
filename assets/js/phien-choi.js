/* =========================================================
   PHIÊN CHƠI — trò chơi cá nhân có mã vào chơi (máy chủ tài khoản bản 2026-11-04e)
   Cô tạo phiên trên trang giáo viên (mã 5 số + QR trỏ tới choi/?ma=…). Học sinh đăng nhập, nhập / quét mã ở trang choi/
   → máy chủ trả cấu hình phiên (trò, bài, mức) → chuyển sang trang trò chơi với ?phien=<mã>&bai=…
   Trên trang trò chơi: bài, mức cố định theo phiên; họ tên + lớp lấy từ hồ sơ; tiến trình báo về máy chủ vài giây một lần
   (QM_PC.bat lúc bắt đầu lượt · QM_PC.cap sau mỗi câu · QM_PC.xong lúc hết lượt). Điểm vẫn gửi máy chủ điểm như cũ.
   Nhúng file này SAU diem-tro-choi.js, TRƯỚC file của trò chơi.
   ========================================================= */
(function () {
  var src = (document.currentScript || {}).src || '', ROOT = src.substring(0, src.indexOf('assets/js/phien-choi.js'));
  var KHOA = 'qm-pc', CHU_KY = 3000;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function docSS() { try { return JSON.parse(sessionStorage.getItem(KHOA) || 'null'); } catch (e) { return null; } }
  function ghiSS(o) { try { sessionStorage.setItem(KHOA, JSON.stringify(o)); } catch (e) {} }
  function api() { return window.QM_TK_API || ''; }
  function goiThang(o, giu) {               // baoPhien không cần phiên đăng nhập (đã có thẻ của phiên chơi)
    return fetch(api(), { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(o), keepalive: !!giu })
      .then(function (r) { return r.json(); });
  }
  var MUC_TEN = { de: 'Dễ', tb: 'Trung bình', kho: 'Khó' };
  function moTa(ph) { return [ph.tenTro, ph.tenBai, ph.muc ? MUC_TEN[ph.muc] || ph.muc : ''].filter(Boolean).join(' · '); }
  function linkChoi(x) { return ROOT + x.phien.trang + '?phien=' + x.ma + (x.phien.bai ? '&bai=' + encodeURIComponent(x.phien.bai) : ''); }

  // =====================================================================
  // 1. TRANG TRÒ CHƠI có ?phien=<mã>
  // =====================================================================
  var ma = (location.search.match(/[?&]phien=(\d{5})/) || [])[1];
  var PC = { on: false, ROOT: ROOT, moTa: moTa };
  window.QM_PC = PC;
  if (ma) {
    var x = docSS();
    if (!x || x.ma !== ma) { location.replace(ROOT + 'choi/?ma=' + ma); return; }   // chưa vào phiên trên máy này: qua trang nhập mã
    PC.on = true; PC.ma = ma; PC.phien = x.phien; PC.bai = x.phien.bai; PC.muc = x.phien.muc; PC.hoTen = x.hoTen; PC.lop = x.lop;

    // Họ tên + lớp: theo hồ sơ (cô ghép điểm theo đúng tên này), không cho sửa trong phiên
    if (window.QM_DIEM) {
      var D = window.QM_DIEM, hs = { hoTen: x.hoTen, lop: x.lop };
      D.luu(x.hoTen, x.lop);
      D.hoSo = function () { return { hoTen: hs.hoTen, lop: hs.lop }; };
      D.docNhap = function () { return { hoTen: hs.hoTen, lop: hs.lop }; };
      D.oNhap = function () { return '<p class="pc-em">🎓 <b>' + esc(hs.hoTen) + '</b> · ' + esc(hs.lop) + ' — điểm và tiến trình gửi cho cô.</p>'; };
    }

    // Băng phiên chơi trên đầu trò
    var bang = document.createElement('div');
    bang.className = 'pc-bang';
    bang.innerHTML = '<span class="pc-cham" aria-hidden="true"></span><span>📡 Phiên của cô · mã <b>' + esc(ma) + '</b></span><span class="pc-mo-ta">' + esc(moTa(x.phien)) + '</span>' +
      '<span class="pc-tt" aria-live="polite"></span>';
    function datBang() {
      var g = document.querySelector('#ban-bong-bay, #chem-chu, #dl-app, .tc-trang, main .wrap');
      if (g && g.parentNode) g.parentNode.insertBefore(bang, g); else document.body.insertBefore(bang, document.body.firstChild);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', datBang); else setTimeout(datBang, 0);
    var tt = function (t, loi) { var o = bang.querySelector('.pc-tt'); o.textContent = t; bang.classList.toggle('loi', !!loi); };

    // Báo tiến trình: gộp, tối đa một lần / 3 giây; hết lượt gửi ngay
    var hien = null, choGui = false, dangGui = false, hen = null, ketThuc = false, loiLien = 0;
    function gui(ngay) {
      if (!hien || ketThuc || !api()) return;
      choGui = true;
      if (dangGui) return;
      if (!ngay && hen) return;
      clearTimeout(hen);
      hen = setTimeout(chay, ngay ? 0 : CHU_KY);
    }
    function chay() {
      hen = null;
      if (!choGui || dangGui) return;
      choGui = false; dangGui = true;
      var goi = { action: 'baoPhien', ma: ma, id: x.id, the: x.the, hien: hien };
      goiThang(goi, hien.xong).then(function (d) {
        if (!d || !d.ok) throw new Error((d && d.loi) || 'loi');
        loiLien = 0;
        if (d.ketThuc) { ketThuc = true; tt('Cô đã kết thúc phiên — em vẫn chơi được, điểm vẫn lưu.'); return; }
        tt(hien.xong ? '✓ Cô đã nhận kết quả' : 'Cô đang theo dõi');
      }).catch(function () {
        loiLien++; choGui = true;
        tt('📶 Chưa gửi được tiến trình, đang thử lại…', true);
      }).then(function () {
        dangGui = false;
        if (choGui && !ketThuc) hen = setTimeout(chay, loiLien ? Math.min(15000, 2000 * loiLien) : CHU_KY);
      });
    }
    function tron(o) { Object.keys(o || {}).forEach(function (k) { hien[k] = o[k]; }); }
    PC.bat = function (o) { hien = { l: Date.now().toString(36).slice(-6) + Math.random().toString(36).slice(2, 5), c: 0, n: 0, d: 0, dg: 0, xong: false }; tron(o); gui(true); };
    PC.cap = function (o) { if (!hien || hien.xong) return; tron(o); gui(false); };
    PC.xong = function (o) { if (!hien || hien.xong) return; tron(o); hien.xong = true; gui(true); };
    window.addEventListener('pagehide', function () { if (choGui && hien) { var g = { action: 'baoPhien', ma: ma, id: x.id, the: x.the, hien: hien }; try { goiThang(g, true); } catch (e) {} } });
    tt('Bấm Bắt đầu để chơi');
    return;
  }

  // =====================================================================
  // 2. TRANG choi/: vào phiên bằng mã 5 số (vao-choi.js gọi QM_PC.vao)
  // =====================================================================
  function choTK(xong) {                   // tai-khoan.js do header.js nạp sau: chờ tối đa 10 giây
    var lan = 0;
    (function cho() { if (window.QM_TK && (QM_TK.goi || ++lan > 50)) return xong(); setTimeout(cho, 200); })();
  }
  PC.vao = function (maVao, el, quayLai) {
    var hoi = null;
    function the(html) { el.innerHTML = '<div class="vc-the">' + html + '<button type="button" class="vc-link pc-ve">‹ Nhập mã khác</button></div>'; el.querySelector('.pc-ve').addEventListener('click', function () { clearInterval(hoi); quayLai(); }); }
    function cho(dk, roi) { clearInterval(hoi); hoi = setInterval(function () { if (dk()) { clearInterval(hoi); roi(); } }, 700); }
    the('<div class="tv-trong">Đang vào phiên chơi ' + esc(maVao) + '…</div>');
    if (!api()) return the('<div class="vc-ico">⚠️</div><p>Web chưa nối máy chủ tài khoản nên chưa vào được phiên chơi.</p>');
    choTK(function buoc() {
      var TK = window.QM_TK;
      if (!TK || !TK.goi) return the('<div class="vc-ico">⚠️</div><p>Chưa tải được phần đăng nhập. Bạn kiểm tra mạng rồi tải lại trang nhé.</p>');
      if (!TK.phien()) {
        the('<div class="vc-ico">🔐</div><h2>Đăng nhập để vào chơi</h2><p>Phiên chơi <b>' + esc(maVao) + '</b> của cô cần đăng nhập để cô theo dõi tiến trình và điểm của em.</p>' +
          '<button type="button" class="btn gold pc-dn">Đăng nhập bằng Google</button>');
        el.querySelector('.pc-dn').addEventListener('click', function () { TK.dangNhap('Đăng nhập để vào phiên chơi ' + maVao + ' của cô.'); });
        TK.dangNhap('Đăng nhập để vào phiên chơi ' + maVao + ' của cô.');
        return cho(function () { return TK.phien(); }, buoc);
      }
      if (!TK.giaoVien() && !TK.hoSoId()) {
        the('<div class="vc-ico">🎓</div><h2>Chọn hồ sơ học sinh</h2><p>Em chọn (hoặc tạo) hồ sơ có họ tên của mình để cô biết ai đang chơi.</p>' +
          '<button type="button" class="btn gold pc-hs">Chọn hồ sơ</button>');
        el.querySelector('.pc-hs').addEventListener('click', function () { TK.moTaiKhoan(); });
        TK.moTaiKhoan();
        return cho(function () { return TK.hoSoId(); }, buoc);
      }
      the('<div class="tv-trong">Đang vào phiên chơi ' + esc(maVao) + '…</div>');
      TK.goi('vaoPhien', { ma: maVao, hoSoId: TK.hoSoId() }).then(function (d) {
        var o = { ma: maVao, phien: d.phien, id: d.id, the: d.the, hoTen: d.hoTen, lop: d.lop };
        ghiSS(o);
        the('<div class="vc-ico">🎮</div><h2>' + esc(d.phien.tenTro) + '</h2><p>' + esc(moTa(d.phien).replace(d.phien.tenTro + ' · ', '')) + '</p>' +
          '<p class="vc-nho">Em: <b>' + esc(d.hoTen) + '</b> · ' + esc(d.lop) + '</p>' +
          '<a class="btn gold pc-vao" href="' + esc(linkChoi(o)) + '">▶ Vào chơi</a>');
        setTimeout(function () { location.href = linkChoi(o); }, 900);
      }).catch(function (e) {
        var m = e.message || 'lỗi mạng';
        if (/Lệnh không hợp lệ/.test(m)) m = 'Máy chủ chưa cập nhật phiên chơi. Em báo cô nhé.';
        the('<div class="vc-ico">⚠️</div><p>' + esc(m) + '</p><button type="button" class="btn pc-lai">Thử lại</button>');
        el.querySelector('.pc-lai').addEventListener('click', buoc);
      });
    });
  };
})();
