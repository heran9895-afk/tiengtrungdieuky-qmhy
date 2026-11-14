/* Gọi tên 点名 — chỉ hiện cho tài khoản giáo viên (2026-11-14: gọn lại).
   Nút nổi 🎲 → thẻ nhỏ ở góc màn hình: các tên chạy nhanh khoảng 1–2 giây (có tiếng tích-tắc dồn dập, trống, rồi nhạc hiện tên)
   → hiện tên bạn được gọi ngay trên thẻ (cả lớp cùng nhìn thấy trên màn chiếu). Gọi tiếp / Đổi bạn khác / Bạn vắng / Vòng mới ngay trên thẻ.
   Danh sách học sinh tự nạp theo lớp cô chọn. Phòng lớp gọi QM_GOI_TEN.mo({khiChon(hs), khiHuy}) để chọn một bạn trả lời bằng máy. */
(function () {
  'use strict';
  if (window.QM_GOI_TEN) return;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var rnd = function (n) { return Math.floor(Math.random() * n); };
  var ls = {
    get: function (k, d) { try { var v = localStorage.getItem('gt_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('gt_' + k, JSON.stringify(v)); } catch (e) {} }
  };

  // ---------- âm thanh (kiểu vòng quay: tích-tắc dồn dập → trống → nhạc hiện tên) ----------
  var AC = null, TIENG = ls.get('tieng', true);
  function ac() { if (!AC) { try { AC = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (AC && AC.state === 'suspended') AC.resume(); return AC; }
  function tone(f, d, type, v, t0) {
    if (!TIENG) return; var a = ac(); if (!a) return;
    var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + (t0 || 0);
    o.type = type || 'square'; o.frequency.value = f; g.gain.setValueAtTime(v || .05, t); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + d + .02);
  }
  var SFX = {
    tick: function () { tone(900, .04, 'square', .035); },
    drum: function () { tone(110, .1, 'triangle', .12); },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, .22, 'triangle', .08, i * .11); }); }
  };

  // ---------- trạng thái ----------
  var CH = null;                                   // chế độ CHỌN MỘT BẠN cho Phòng lớp: { lop, khiChon(hs), khiHuy }
  var QS = new URLSearchParams(location.search);
  var S = { lop: [], maLop: (QS.get('lop') || ls.get('lop', '')), ds: [], khongLap: ls.get('khongLap', true), daGoi: [], vang: [], tam: [], chon: '' };
  var TM = [], GEN = 0, card = null;
  function sau(fn, ms) { var g = GEN, t = setTimeout(function () { if (g === GEN) fn(); }, ms); TM.push(t); }
  function dung() { GEN++; TM.forEach(clearTimeout); TM = []; }
  function khoaLop() { return 'goi_' + (S.maLop || 'tay'); }
  function napLuu() { var o = ls.get(khoaLop(), {}); S.daGoi = o.daGoi || []; S.vang = o.vang || []; }
  function luu() { ls.set(khoaLop(), { daGoi: S.daGoi, vang: S.vang }); }
  function hoc() { return S.ds.filter(function (n) { return S.vang.indexOf(n) < 0; }); }
  function kho() { return hoc().filter(function (n) { return S.tam.indexOf(n) < 0 && (!S.khongLap || S.daGoi.indexOf(n) < 0); }); }

  var CSS = '.gt-fab{position:fixed;right:16px;bottom:16px;z-index:9000;border:0;border-radius:999px;padding:12px 18px;font:700 15px/1 inherit;background:#e8455a;color:#fff;box-shadow:0 6px 18px rgba(0,0,0,.28);cursor:pointer}' +
    '.gt-cx{position:fixed;right:16px;bottom:70px;z-index:9001;width:min(360px,92vw);background:#173f2a;color:#fff;border-radius:16px;box-shadow:0 12px 34px rgba(0,0,0,.4);font:15px/1.4 inherit;overflow:hidden}' +
    '.gt-cx[hidden]{display:none}.gt-cx-hd{display:flex;gap:6px;align-items:center;padding:8px 10px;background:rgba(0,0,0,.22)}' +
    '.gt-cx-hd select{flex:1;min-width:0;padding:4px 6px;border-radius:7px;border:0;font:inherit;font-size:13px}' +
    '.gt-cx-hd button{border:0;background:rgba(255,255,255,.15);color:#fff;border-radius:7px;padding:4px 9px;cursor:pointer;font:inherit;font-size:13px}' +
    '.gt-cx-bd{padding:14px 14px 12px;text-align:center}.gt-cx-zh{font-size:14px;letter-spacing:.2em;color:#ffd96a;min-height:20px}' +
    '.gt-cx-ten{font-size:34px;font-weight:800;line-height:1.25;min-height:86px;display:flex;align-items:center;justify-content:center;word-break:break-word}' +
    '.gt-cx-ten.chay{opacity:.8;font-size:30px}.gt-cx-ten.ra{color:#ffe27a;animation:gtRa .55s ease-out}' +
    '@keyframes gtRa{0%{transform:scale(.5);opacity:0}60%{transform:scale(1.18)}100%{transform:scale(1);opacity:1}}' +
    '.gt-cx-nut{display:flex;flex-wrap:wrap;gap:7px;justify-content:center;margin-top:8px}' +
    '.gt-cx-nut button{border:0;border-radius:10px;padding:9px 13px;font:700 14px/1 inherit;cursor:pointer;background:#ffd96a;color:#3b2d00}' +
    '.gt-cx-nut button.p{background:rgba(255,255,255,.16);color:#fff;font-weight:600}.gt-cx-nut button:disabled{opacity:.5}' +
    '.gt-cx-dem{font-size:12px;opacity:.75;margin-top:8px}' +
    '.gt-cx-cd{padding:8px 12px 12px;background:rgba(0,0,0,.18);max-height:240px;overflow:auto;font-size:13px}' +
    '.gt-cx-cd label{display:inline-flex;gap:4px;align-items:center;background:rgba(255,255,255,.12);border-radius:999px;padding:3px 10px;margin:0 4px 5px 0;cursor:pointer}' +
    '.gt-cx-cd textarea{width:100%;box-sizing:border-box;min-height:90px;border-radius:8px;border:0;padding:6px;font:inherit}' +
    '.gt-cx-cd .hang{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 8px;align-items:center}.gt-cx-cd button{border:0;border-radius:8px;padding:5px 11px;cursor:pointer;font:inherit}';

  // ---------- nạp lớp ----------
  function taiLop() {
    if (S.lop.length) return Promise.resolve();
    if (!(window.QM_TK && QM_TK.goi)) return Promise.reject(new Error('Chưa đăng nhập'));
    return QM_TK.goi('gvDuLieu', {}).then(function (D) {
      var cac = (D.lop || []).filter(function (l) { return !l.dong; });
      S.lop = cac.map(function (l) {
        var ids = {}, hs = (D.hocSinh || []).filter(function (h) { return h.maLop === l.maLop; }).map(function (h) {
          var ten = String(h.hoTen || '').replace(/\s+/g, ' ').trim(); if (ten && !ids[ten]) ids[ten] = h.hoSoId; return ten; }).filter(Boolean);
        return { maLop: l.maLop, tenLop: l.tenLop || l.maLop, hs: hs, ids: ids };
      });
    });
  }
  function doiLop(ma) {
    if (ma !== 'tay' && !S.lop.some(function (l) { return l.maLop === ma; })) ma = S.lop[0] ? S.lop[0].maLop : 'tay';
    S.maLop = ma === 'tay' ? '' : ma; if (ma.indexOf('__phong') !== 0) ls.set('lop', S.maLop); S.tam = []; S.chon = '';
    S.ds = ma === 'tay' ? (ls.get('tay', []) || []).slice() : S.lop.filter(function (l) { return l.maLop === ma; })[0].hs.slice();
    napLuu();
  }

  // ---------- thẻ ở góc màn hình ----------
  function dungThe() {
    if (card) return;
    if (!document.getElementById('gtFabCss')) { var s = document.createElement('style'); s.id = 'gtFabCss'; s.textContent = CSS; document.head.appendChild(s); }
    card = document.createElement('div'); card.className = 'gt-cx'; card.hidden = true;
    card.innerHTML = '<div class="gt-cx-hd"><select id="gtLop"></select><button type="button" id="gtTieng" title="Bật/tắt tiếng"></button><button type="button" id="gtCd" title="Cài đặt: bạn vắng, vòng mới">⚙</button><button type="button" id="gtX" title="Đóng">✕</button></div>' +
      '<div class="gt-cx-bd"><div class="gt-cx-zh" id="gtZh"></div><div class="gt-cx-ten" id="gtTen">🎲</div><div class="gt-cx-nut" id="gtNut"></div><div class="gt-cx-dem" id="gtDem"></div></div>' +
      '<div class="gt-cx-cd" id="gtCdBd" hidden></div>';
    document.body.appendChild(card);
    $('#gtLop', card).onchange = function () { dung(); doiLop(this.value); veCd(); veDem(); datNut(false); hienTen('🎲', ''); };
    $('#gtTieng', card).onclick = function () { TIENG = !TIENG; ls.set('tieng', TIENG); veTieng(); };
    $('#gtCd', card).onclick = function () { var b = $('#gtCdBd', card); b.hidden = !b.hidden; if (!b.hidden) veCd(); };
    $('#gtX', card).onclick = dongThe;
    document.addEventListener('keydown', function (e) { if (card && !card.hidden && e.key === 'Escape') dongThe(); });
  }
  function veTieng() { $('#gtTieng', card).textContent = TIENG ? '🔊' : '🔇'; }
  function veLopSel() {
    $('#gtLop', card).innerHTML = S.lop.map(function (l) { return '<option value="' + esc(l.maLop) + '">' + esc(l.tenLop) + ' (' + l.hs.length + ' em)</option>'; }).join('') + '<option value="tay">✍️ Nhập tay</option>';
    $('#gtLop', card).value = S.maLop || 'tay';
  }
  function veDem() {
    var tong = hoc().length, da = S.daGoi.filter(function (n) { return S.ds.indexOf(n) >= 0 && S.vang.indexOf(n) < 0; }).length;
    $('#gtDem', card).textContent = S.ds.length ? 'Đã gọi ' + da + '/' + tong + (S.vang.length ? ' · vắng ' + S.vang.length : '') : 'Chưa có học sinh: bấm ⚙ nhập tên.';
  }
  function hienTen(t, zh, cls) { var e = $('#gtTen', card); e.textContent = t; e.className = 'gt-cx-ten' + (cls ? ' ' + cls : ''); $('#gtZh', card).textContent = zh || ''; }
  function datNut(coKq) {
    var n = $('#gtNut', card);
    if (!coKq) { n.innerHTML = '<button type="button" id="gtGoi">🎲 Gọi tên</button>'; $('#gtGoi', card).onclick = quay; return; }
    n.innerHTML = (CH ? '<button type="button" id="gtOk">✅ Gọi bạn này</button>' : '<button type="button" id="gtGoi">🎲 Gọi tiếp</button>') +
      '<button type="button" class="p" id="gtDoi">🔁 Đổi bạn khác</button><button type="button" class="p" id="gtVang">🚫 Vắng</button>';
    if (CH) $('#gtOk', card).onclick = xacNhan; else $('#gtGoi', card).onclick = function () { S.tam = []; quay(); };
    $('#gtDoi', card).onclick = function () {      // trả lại bạn vừa gọi, bỏ qua bạn đó trong lượt này
      var c = S.chon; S.daGoi = S.daGoi.filter(function (x) { return x !== c; }); if (c && S.tam.indexOf(c) < 0) S.tam.push(c); luu(); quay();
    };
    $('#gtVang', card).onclick = function () {
      var c = S.chon; if (c && S.vang.indexOf(c) < 0) S.vang.push(c); S.daGoi = S.daGoi.filter(function (x) { return x !== c; }); luu(); veCd(); quay();
    };
  }
  function veCd() {
    var b = $('#gtCdBd', card); if (!b || b.hidden) return;
    b.innerHTML = '<div class="hang"><label><input type="checkbox" id="gtKl"' + (S.khongLap ? ' checked' : '') + '> Không gọi lại bạn đã gọi</label><button type="button" id="gtVong">↺ Vòng mới</button></div>' +
      (S.maLop === '' && !S.lop.length ? '' : '') +
      (S.maLop === '' ? '<div>Nhập tên (mỗi dòng một bạn):</div><textarea id="gtTay">' + esc(S.ds.join('\n')) + '</textarea><div class="hang"><button type="button" id="gtLuuTay">Lưu danh sách</button></div>' : '') +
      (S.ds.length ? '<div style="margin:6px 0 4px">Tích bạn <b>vắng</b> hôm nay (không bị gọi):</div>' + S.ds.map(function (n) { return '<label><input type="checkbox" class="gtV" value="' + esc(n) + '"' + (S.vang.indexOf(n) >= 0 ? ' checked' : '') + '> ' + esc(n) + '</label>'; }).join('') : '');
    $('#gtKl', b).onchange = function () { S.khongLap = this.checked; ls.set('khongLap', S.khongLap); };
    $('#gtVong', b).onclick = function () { S.daGoi = []; S.tam = []; luu(); veDem(); };
    var lt = $('#gtLuuTay', b); if (lt) lt.onclick = function () {
      var v = $('#gtTay', b).value.split('\n').map(function (s) { return s.replace(/^\s*\d+[.)]\s*/, '').trim(); }).filter(Boolean);
      ls.set('tay', v); S.ds = v; napLuu(); veDem(); veCd();
    };
    Array.prototype.forEach.call(b.querySelectorAll('.gtV'), function (c) {
      c.onchange = function () { S.vang = Array.prototype.map.call(b.querySelectorAll('.gtV:checked'), function (i) { return i.value; }); luu(); veDem(); };
    });
  }

  // ---------- quay nhanh 1–2 giây ----------
  function quay() {
    dung();
    if (!S.ds.length) { hienTen('Chưa có tên', ''); $('#gtCdBd', card).hidden = false; veCd(); return; }
    var ung = kho();
    if (!ung.length) {                               // hết vòng: tự bắt đầu vòng mới (trừ bạn vắng)
      S.daGoi = []; S.tam = []; luu(); ung = kho();
      if (!ung.length) { hienTen('Cả lớp vắng?', ''); return; }
    }
    var chon = ung[rnd(ung.length)], pool = hoc(), t = 0, buoc = 0, tong = 16;
    S.chon = chon; datNut(false); $('#gtGoi', card).disabled = true;
    (function nhay() {
      if (buoc >= tong) {
        S.daGoi.indexOf(chon) < 0 && S.daGoi.push(chon); luu(); veDem();
        SFX.drum(); setTimeout(SFX.win, 160);
        hienTen(chon, '请你来！', 'ra'); datNut(true); return;
      }
      var ten = buoc === tong - 1 ? chon : pool[rnd(pool.length)];
      hienTen(ten, '', 'chay'); SFX.tick(); buoc++;
      t = 55 + Math.pow(buoc / tong, 2.2) * 210;      // chạy nhanh rồi chậm dần, tổng khoảng 1,6 giây
      sau(nhay, t);
    })();
  }
  function xacNhan() {                               // chế độ Phòng lớp: gọi bạn này trả lời bằng máy
    var l = S.lop.filter(function (x) { return x.maLop === S.maLop; })[0], f = CH && CH.khiChon; CH = null;
    if (f) f({ hoTen: S.chon, hoSoId: l && l.ids ? l.ids[S.chon] || '' : '' });
    dongThe(true);
  }
  function dongThe(daChon) { dung(); if (card) card.hidden = true; if (CH && !daChon) { var h = CH.khiHuy; CH = null; if (h) h(); } else if (daChon) CH = null; }

  function moThe(autoQuay) {
    dungThe(); card.hidden = false; veTieng();
    if (CH && CH.ds) {                               // Phòng mở: gọi trong số các bạn đang có mặt (không theo lớp)
      var ids = {}, hs = CH.ds.map(function (x) { var t = String(x.hoTen || '').replace(/\s+/g, ' ').trim(); if (t && !ids[t]) ids[t] = x.hoSoId; return t; }).filter(Boolean);
      var mp = '__phong' + (CH.ma || '');
      S.lop = [{ maLop: mp, tenLop: 'Phòng này', hs: hs, ids: ids }]; S.phong = true;
      veLopSel(); doiLop(mp); $('#gtLop', card).value = mp; veDem(); veCd(); datNut(false); hienTen('🎲', ''); if (autoQuay) quay(); return;
    }
    if (S.phong) { S.lop = []; S.phong = false; }
    taiLop().then(function () { veLopSel(); doiLop(S.maLop || (S.lop[0] && S.lop[0].maLop) || 'tay'); $('#gtLop', card).value = S.maLop || 'tay'; })
      .catch(function () { S.lop = []; veLopSel(); doiLop('tay'); })
      .then(function () { veDem(); veCd(); datNut(false); hienTen('🎲', ''); if (autoQuay) quay(); });
  }

  // ---------- nút nổi (chỉ giáo viên) ----------
  function gan() {
    if ($('.gt-fab')) return;
    if (!document.getElementById('gtFabCss')) { var s = document.createElement('style'); s.id = 'gtFabCss'; s.textContent = CSS; document.head.appendChild(s); }
    var b = document.createElement('button'); b.type = 'button'; b.className = 'gt-fab'; b.textContent = '🎲 Gọi tên'; b.title = 'Gọi tên ngẫu nhiên';
    b.onclick = function () { if (card && !card.hidden) { dongThe(); } else moThe(true); };
    document.body.appendChild(b);
  }
  window.QM_GOI_TEN = { mo: function (o) { CH = o || null; moThe(true); }, daSan: true };
  var lan = 0;
  (function cho() {
    if (window.QM_TK && QM_TK.giaoVien && QM_TK.giaoVien()) return gan();
    if (++lan < 40) setTimeout(cho, 500);
  })();
})();
