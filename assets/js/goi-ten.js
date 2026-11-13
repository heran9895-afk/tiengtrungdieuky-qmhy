/* Bảng gọi tên 点名 — chỉ hiện cho tài khoản giáo viên.
   Nút nổi 🎲 → chọn lớp (tự nạp học sinh của lớp) → chọn 1 trong 5 trò hồi hộp → hiện bạn được gọi.
   Không có ảnh nặng: mọi hình đều là emoji/CSS, chỉ nạp khi cô bấm mở. */
(function () {
  'use strict';
  if (window.QM_GOI_TEN) return; window.QM_GOI_TEN = 1;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var rnd = function (n) { return Math.floor(Math.random() * n); };
  var shuf = function (a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = rnd(i + 1), t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
  var ls = {
    get: function (k, d) { try { var v = localStorage.getItem('gt_' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('gt_' + k, JSON.stringify(v)); } catch (e) {} }
  };
  function ngan(ten) { var w = String(ten).trim().split(/\s+/); return w.length > 2 ? w.slice(-2).join(' ') : w.join(' '); }

  // ---------- âm thanh ----------
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
    tock: function () { tone(500, .06, 'square', .04); },
    pop: function () { tone(180, .12, 'sawtooth', .09); tone(90, .2, 'square', .08, .02); },
    drum: function () { tone(110, .1, 'triangle', .12); },
    win: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, .22, 'triangle', .08, i * .11); }); },
    boom: function () { tone(70, .5, 'sawtooth', .14); tone(140, .35, 'square', .08, .03); }
  };

  // ---------- trạng thái ----------
  var S = { lop: [], maLop: ls.get('lop', ''), ds: [], game: ls.get('game', 'quay'), soBan: 1, khongLap: ls.get('khongLap', true),
    daGoi: [], vang: [], tam: [], dangChay: false, ketQua: [] };
  var TM = [], RAF = 0, GEN = 0;
  function sau(fn, ms) { var g = GEN, t = setTimeout(function () { if (g === GEN) fn(); }, ms); TM.push(t); return t; }
  function dung() { GEN++; TM.forEach(clearTimeout); TM = []; cancelAnimationFrame(RAF); S.dangChay = false; }

  function khoaLop() { return 'goi_' + (S.maLop || 'tay'); }
  function napLuu() { var o = ls.get(khoaLop(), {}); S.daGoi = o.daGoi || []; S.vang = o.vang || []; }
  function luu() { ls.set(khoaLop(), { daGoi: S.daGoi, vang: S.vang }); }
  function hoc() { return S.ds.filter(function (n) { return S.vang.indexOf(n) < 0; }); }
  function kho() {
    return hoc().filter(function (n) { return S.tam.indexOf(n) < 0 && (!S.khongLap || S.daGoi.indexOf(n) < 0); });
  }

  // ---------- giao diện ----------
  var CSS = '.gt-fab{position:fixed;right:16px;bottom:16px;z-index:9000;border:0;border-radius:999px;padding:12px 18px;font:700 15px/1 inherit;background:#e8455a;color:#fff;box-shadow:0 6px 18px rgba(0,0,0,.28);cursor:pointer}' +
    '.gt-fab:hover{filter:brightness(1.08)}' +
    '.gt-bg{position:fixed;inset:0;z-index:9500;background:#17382b;color:#fff;display:flex;flex-direction:column;font-family:inherit}' +
    '.gt-bg[hidden]{display:none}' +
    '.gt-top{display:flex;flex-wrap:wrap;gap:8px 12px;align-items:center;padding:10px 14px;background:rgba(0,0,0,.28)}' +
    '.gt-top h2{margin:0;font-size:20px;color:#ffd54a}.gt-top select,.gt-top input[type=number]{font:inherit;padding:6px 8px;border-radius:8px;border:0}' +
    '.gt-top label{font-size:14px;display:flex;align-items:center;gap:5px}' +
    '.gt-btn{border:0;border-radius:10px;padding:8px 14px;font:700 14px/1.1 inherit;background:#ffd54a;color:#3b2b00;cursor:pointer}' +
    '.gt-btn.gt-phu{background:rgba(255,255,255,.16);color:#fff}.gt-btn:disabled{opacity:.5;cursor:default}' +
    '.gt-games{display:flex;flex-wrap:wrap;gap:8px;padding:8px 14px}' +
    '.gt-games button{border:2px solid transparent;border-radius:12px;padding:8px 12px;font:700 14px/1.2 inherit;background:rgba(255,255,255,.12);color:#fff;cursor:pointer}' +
    '.gt-games button.on{border-color:#ffd54a;background:rgba(255,213,74,.2)}' +
    '.gt-stage{flex:1;position:relative;overflow:hidden;margin:0 14px;border-radius:16px;background:radial-gradient(circle at 50% 30%,#245a43,#133126);display:flex;align-items:center;justify-content:center;min-height:240px}' +
    '.gt-start{font:800 clamp(22px,4vw,34px)/1.2 inherit;border:0;border-radius:18px;padding:18px 34px;background:#e8455a;color:#fff;cursor:pointer;box-shadow:0 8px 0 #9b2335}' +
    '.gt-start:active{transform:translateY(4px);box-shadow:0 4px 0 #9b2335}' +
    '.gt-mo{position:absolute;left:0;right:0;top:10px;text-align:center;font-size:15px;opacity:.85;pointer-events:none}' +
    '.gt-da{display:flex;flex-wrap:wrap;gap:6px;padding:8px 14px 12px;font-size:13px;max-height:84px;overflow:auto}' +
    '.gt-da span{background:rgba(255,255,255,.14);border-radius:999px;padding:3px 10px}.gt-da span.me{background:rgba(255,213,74,.28)}' +
    '.gt-rong{padding:24px;text-align:center;font-size:18px;line-height:1.6}' +
    /* vòng quay */
    '.gt-wheel{position:relative;width:min(88vw,62vh,520px);aspect-ratio:1}.gt-wheel canvas{width:100%;height:100%;display:block}' +
    '.gt-kim{position:absolute;top:-6px;left:50%;transform:translateX(-50%);font-size:34px;filter:drop-shadow(0 3px 2px rgba(0,0,0,.4))}' +
    /* chuyền bom */
    '.gt-vong{position:absolute;inset:0}.gt-chip{position:absolute;transform:translate(-50%,-50%);padding:4px 9px;border-radius:999px;background:rgba(255,255,255,.16);font-size:clamp(11px,1.7vw,16px);white-space:nowrap;transition:background .1s,transform .1s}' +
    '.gt-chip.on{background:#ffd54a;color:#3b2b00;transform:translate(-50%,-50%) scale(1.3);z-index:2;font-weight:700}' +
    '.gt-chip.no{background:#e8455a;color:#fff;transform:translate(-50%,-50%) scale(1.55);z-index:3;font-weight:800}' +
    '.gt-bom{position:absolute;font-size:46px;transform:translate(-50%,-130%);transition:left .12s,top .12s;z-index:4}' +
    /* đèn sân khấu */
    '.gt-luoi{display:flex;flex-wrap:wrap;gap:8px;justify-content:center;align-content:center;padding:18px;max-width:100%}' +
    '.gt-luoi .gt-chip{position:relative;transform:none;left:auto;top:auto;opacity:.35}' +
    '.gt-luoi .gt-chip.on{opacity:1;transform:scale(1.25);box-shadow:0 0 22px 8px rgba(255,213,74,.7)}.gt-luoi .gt-chip.no{opacity:1;transform:scale(1.6)}' +
    /* đua vịt */
    '.gt-dua{width:100%;padding:34px 18px 14px;display:flex;flex-direction:column;gap:7px;position:relative}' +
    '.gt-lan{position:relative;height:clamp(32px,6.4vh,52px);background:rgba(120,200,255,.18);border-radius:10px}' +
    '.gt-lan b{position:absolute;left:8px;top:50%;transform:translateY(-50%);font-size:13px;opacity:.9;z-index:1}' +
    '.gt-vit{position:absolute;top:50%;left:0;font-size:clamp(24px,4.6vh,38px);transform:translate(0,-50%) scaleX(-1)}' +
    '.gt-dich{position:absolute;right:30px;top:30px;bottom:10px;width:6px;background:repeating-linear-gradient(#fff 0 8px,#222 8px 16px);border-radius:3px}' +
    /* bong bóng */
    '.gt-bb{display:flex;flex-wrap:wrap;gap:12px;justify-content:center;align-content:center;padding:20px}' +
    '.gt-bong{min-width:78px;padding:12px 10px 16px;border-radius:50% 50% 48% 48%;color:#222;font:700 clamp(12px,1.8vw,17px)/1.1 inherit;text-align:center;animation:gtlac 2.4s ease-in-out infinite;transition:transform .25s,opacity .25s}' +
    '.gt-bong.mat{transform:scale(1.8);opacity:0}.gt-bong.song{outline:4px solid #fff;transform:scale(1.25)}' +
    '@keyframes gtlac{0%,100%{transform:translateY(0) rotate(-3deg)}50%{transform:translateY(-7px) rotate(3deg)}}' +
    /* kết quả */
    '.gt-kq{position:absolute;inset:0;background:rgba(10,30,22,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;padding:16px;animation:gtvao .35s}' +
    '@keyframes gtvao{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}' +
    '.gt-kq .zh{font:700 clamp(22px,4vw,36px)/1 inherit;color:#ffd54a}' +
    '.gt-kq .ten{font:800 clamp(34px,8vw,84px)/1.1 inherit;color:#fff;text-shadow:0 4px 0 #e8455a}' +
    '.gt-kq .vi{font-size:clamp(15px,2.2vw,22px);opacity:.9}.gt-kq .hang{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:8px}' +
    '.gt-hoa{position:absolute;inset:0;pointer-events:none;overflow:hidden}.gt-hoa i{position:absolute;top:-20px;font-style:normal;animation:gtroi linear forwards}' +
    '@keyframes gtroi{to{transform:translateY(110vh) rotate(540deg)}}';

  var GAMES = [
    { id: 'quay', ten: '🎡 Vòng quay', mo: 'Vòng quay chậm dần… ai sẽ dừng ở kim?' },
    { id: 'bom', ten: '💣 Chuyền bom', mo: 'Quả bom nhảy từ bạn này sang bạn khác — nổ ở ai?' },
    { id: 'den', ten: '🔦 Đèn sân khấu', mo: 'Đèn rọi lướt qua… rồi dừng lại ở ai?' },
    { id: 'vit', ten: '🦆 Đua vịt', mo: 'Các bạn đại diện chạy đua — về nhất được gọi!' },
    { id: 'bong', ten: '🎈 Nổ bong bóng', mo: 'Bong bóng nổ dần, ai còn lại cuối cùng được gọi.' }
  ];

  var bg, stage, daEl, lopSel, soSel, chkLap, tmcss = 0;
  function dung_ui() {
    if (bg) return;
    if (!document.getElementById('gtFabCss')) { var st = document.createElement('style'); st.id = 'gtFabCss'; st.textContent = CSS; document.head.appendChild(st); }
    bg = document.createElement('div'); bg.className = 'gt-bg'; bg.hidden = true;
    bg.innerHTML = '<div class="gt-top"><h2>🎲 点名 Gọi tên</h2>' +
      '<label>Lớp <select id="gtLop"></select></label>' +
      '<label>Gọi <select id="gtSo"><option>1</option><option>2</option><option>3</option><option>4</option></select> bạn</label>' +
      '<label><input type="checkbox" id="gtLap"> không gọi lại bạn đã gọi</label>' +
      '<button class="gt-btn gt-phu" id="gtTieng" type="button"></button>' +
      '<button class="gt-btn gt-phu" id="gtVang" type="button">🚫 Bạn vắng</button>' +
      '<button class="gt-btn gt-phu" id="gtReset" type="button">↺ Vòng mới</button>' +
      '<button class="gt-btn" id="gtDong" type="button" style="margin-left:auto">✕ Đóng</button></div>' +
      '<div class="gt-games" id="gtGames"></div><div class="gt-stage" id="gtStage"></div><div class="gt-da" id="gtDa"></div>';
    document.body.appendChild(bg);
    stage = $('#gtStage'); daEl = $('#gtDa'); lopSel = $('#gtLop'); soSel = $('#gtSo'); chkLap = $('#gtLap');
    chkLap.checked = S.khongLap;
    $('#gtGames').innerHTML = GAMES.map(function (g) { return '<button type="button" data-g="' + g.id + '">' + g.ten + '</button>'; }).join('');
    $('#gtGames').onclick = function (e) { var b = e.target.closest('button[data-g]'); if (!b) return; dung(); S.game = b.dataset.g; ls.set('game', S.game); veGames(); veNen(); };
    lopSel.onchange = function () { dung(); doiLop(lopSel.value); };
    soSel.onchange = function () { S.soBan = +soSel.value; dung(); veNen(); };
    chkLap.onchange = function () { S.khongLap = chkLap.checked; ls.set('khongLap', S.khongLap); dung(); veNen(); };
    $('#gtTieng').onclick = function () { TIENG = !TIENG; ls.set('tieng', TIENG); veTieng(); };
    $('#gtDong').onclick = dongBang;
    $('#gtReset').onclick = function () { if (confirm('Bắt đầu vòng mới: ai cũng được gọi lại?')) { S.daGoi = []; luu(); dung(); veNen(); } };
    $('#gtVang').onclick = veBanVang;
    document.addEventListener('keydown', function (e) { if (!bg.hidden && e.key === 'Escape') dongBang(); });
    veTieng();
  }
  function veTieng() { $('#gtTieng').textContent = TIENG ? '🔊 Có tiếng' : '🔇 Tắt tiếng'; }
  function veGames() { Array.prototype.forEach.call($('#gtGames').children, function (b) { b.classList.toggle('on', b.dataset.g === S.game); }); }

  function moBang() {
    dung_ui(); bg.hidden = false; document.body.style.overflow = 'hidden';
    stage.innerHTML = '<div class="gt-rong">⏳ Đang nạp danh sách lớp…</div>'; veGames();
    taiLop().then(function () { veLopSel(); doiLop(S.maLop || (S.lop[0] && S.lop[0].maLop) || 'tay'); })
      .catch(function (e) { S.lop = []; veLopSel(); doiLop('tay'); });
  }
  function dongBang() { dung(); bg.hidden = true; document.body.style.overflow = ''; }

  function taiLop() {
    if (S.lop.length) return Promise.resolve();
    if (!(window.QM_TK && QM_TK.goi)) return Promise.reject(new Error('Chưa đăng nhập'));
    return QM_TK.goi('gvDuLieu', {}).then(function (D) {
      var cac = (D.lop || []).filter(function (l) { return !l.dong; });
      S.lop = cac.map(function (l) {
        return { maLop: l.maLop, tenLop: l.tenLop || l.maLop, hs: (D.hocSinh || []).filter(function (h) { return h.maLop === l.maLop; })
          .map(function (h) { return String(h.hoTen || '').replace(/\s+/g, ' ').trim(); }).filter(Boolean) };
      });
    });
  }
  function veLopSel() {
    lopSel.innerHTML = S.lop.map(function (l) { return '<option value="' + esc(l.maLop) + '">' + esc(l.tenLop) + ' (' + l.hs.length + ' em)</option>'; }).join('') +
      '<option value="tay">✍️ Nhập tay</option>';
  }
  function doiLop(ma) {
    if (ma !== 'tay' && !S.lop.some(function (l) { return l.maLop === ma; })) ma = S.lop[0] ? S.lop[0].maLop : 'tay';
    S.maLop = ma === 'tay' ? '' : ma; ls.set('lop', S.maLop); lopSel.value = ma; S.tam = [];
    if (ma === 'tay') { S.ds = (ls.get('tay', []) || []).slice(); }
    else { S.ds = S.lop.filter(function (l) { return l.maLop === ma; })[0].hs.slice(); }
    napLuu(); veNen();
  }

  function veDaGoi() {
    var tong = hoc().length, da = S.daGoi.filter(function (n) { return S.ds.indexOf(n) >= 0; });
    daEl.innerHTML = '<b style="align-self:center">Đã gọi ' + da.length + '/' + tong + (S.vang.length ? ' · vắng ' + S.vang.length : '') + ':</b>' +
      da.slice().reverse().map(function (n, i) { return '<span class="' + (i < S.ketQua.length ? 'me' : '') + '">' + esc(ngan(n)) + '</span>'; }).join('');
  }

  // màn chờ của mỗi trò
  function veNen() {
    dung(); S.ketQua = []; S.tam = [];
    var g = GAMES.filter(function (x) { return x.id === S.game; })[0];
    veDaGoi();
    if (!S.ds.length) {
      stage.innerHTML = '<div class="gt-rong">' + (S.maLop ? 'Lớp này chưa có học sinh nào.' : 'Dán danh sách học sinh (mỗi dòng một tên):') +
        '<br><textarea id="gtTay" rows="8" style="width:min(520px,90%);margin:10px 0;border-radius:10px;padding:8px;font:inherit" placeholder="Nguyễn Văn An&#10;Trần Thị Bình"></textarea><br>' +
        '<button class="gt-btn" id="gtLuuTay" type="button">Lưu danh sách</button></div>';
      $('#gtLuuTay').onclick = function () {
        var v = $('#gtTay').value.split('\n').map(function (s) { return s.replace(/^\s*\d+[.)]\s*/, '').trim(); }).filter(Boolean);
        ls.set('tay', Array.from(new Set(v))); lopSel.value = 'tay'; doiLop('tay');
      };
      return;
    }
    if (!kho().length) {
      stage.innerHTML = '<div class="gt-rong"><div style="font-size:42px">🎉 全班都来过了！</div>Cả lớp đã được gọi hết.<br><br><button class="gt-btn" id="gtVong" type="button">↺ Bắt đầu vòng mới</button></div>';
      $('#gtVong').onclick = function () { S.daGoi = []; luu(); veNen(); };
      return;
    }
    stage.innerHTML = '<div class="gt-mo">' + g.mo + '</div><button class="gt-start" id="gtGo" type="button">' + g.ten.split(' ')[0] + ' Bắt đầu!</button>';
    $('#gtGo').onclick = batDau;
  }

  function batDau() {
    ac();
    var ct = kho(), k = Math.min(S.soBan, ct.length);
    if (!ct.length) return veNen();
    dung(); S.dangChay = true; S.ketQua = [];
    var xong = function (ds) { S.dangChay = false; hienKetQua(ds); };
    var g = S.game;
    if (g === 'vit') return troVit(ct, k, xong);
    if (g === 'bong') return troBong(ct, k, xong);
    // các trò chọn từng bạn một
    var out = [], con = ct.slice();
    (function lap() {
      var chon = con[rnd(con.length)];
      var fn = g === 'quay' ? troQuay : g === 'bom' ? troBom : troDen;
      fn(con, chon, function () {
        out.push(chon); con = con.filter(function (n) { return n !== chon; });
        if (out.length >= k || !con.length) return xong(out);
        sau(lap, 1100);
      }, out);
    })();
  }

  // ---------- 1. Vòng quay ----------
  function troQuay(cuc, chon, xong, truoc) {
    var hien = [chon].concat(shuf(cuc.filter(function (n) { return n !== chon; })).slice(0, 15)); hien = shuf(hien);
    var n = hien.length, idx = hien.indexOf(chon);
    stage.innerHTML = '<div class="gt-mo">' + (truoc.length ? 'Bạn tiếp theo…' : 'Vòng quay chọn bạn…') + (cuc.length > 16 ? ' (hiện 16 bạn, chọn ngẫu nhiên trong cả lớp)' : '') + '</div><div class="gt-wheel"><canvas width="640" height="640"></canvas><div class="gt-kim">🔻</div></div>';
    var cv = $('canvas', stage), c = cv.getContext('2d'), R = 320, MAU = ['#ff8fa8', '#7cc8f2', '#ffd54a', '#8ee07a', '#ffab5e', '#c9a7ff'];
    var ve = function (a) {
      c.clearRect(0, 0, 640, 640); c.save(); c.translate(R, R); c.rotate(a);
      for (var i = 0; i < n; i++) {
        c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, R - 6, i * 2 * Math.PI / n, (i + 1) * 2 * Math.PI / n); c.closePath();
        c.fillStyle = MAU[i % MAU.length]; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 3; c.stroke();
        c.save(); c.rotate((i + .5) * 2 * Math.PI / n); c.fillStyle = '#222'; c.textAlign = 'right'; c.font = '700 ' + (n > 10 ? 24 : 30) + 'px sans-serif';
        c.fillText(ngan(hien[i]), R - 26, 9); c.restore();
      }
      c.restore(); c.beginPath(); c.arc(R, R, 22, 0, 7); c.fillStyle = '#fff'; c.fill();
    };
    // kim ở trên cùng (góc -90°). Ô idx cần có tâm tại -90° sau khi quay.
    var tam = (idx + .5) * 2 * Math.PI / n, ban = Math.PI * 2 * (5 + rnd(3)), dich = ban + (-Math.PI / 2 - tam) + (Math.random() - .5) * (2 * Math.PI / n) * .7;
    dich = ((dich % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) + ban;
    var t0 = performance.now(), dur = 5200 + rnd(1500), g = GEN, last = -1;
    (function buoc(now) {
      if (g !== GEN) return;
      var k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3.4), a = dich * e;
      ve(a);
      var o = Math.floor((((-Math.PI / 2 - a) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI / n));
      if (o !== last) { last = o; SFX.tick(); }
      if (k < 1) RAF = requestAnimationFrame(buoc); else { SFX.drum(); sau(xong, 700); }
    })(t0);
  }

  // ---------- 2. Chuyền bom ----------
  function troBom(cuc, chon, xong, truoc) {
    var ds = cuc.length > 28 ? [chon].concat(shuf(cuc.filter(function (n) { return n !== chon; })).slice(0, 27)) : cuc.slice();
    ds = shuf(ds); var n = ds.length;
    var h = '<div class="gt-mo">' + (cuc.length > 28 ? 'Hiện 28 bạn, chọn ngẫu nhiên trong cả lớp · ' : '') + 'Quả bom đang chuyền…</div><div class="gt-vong" id="gtV">';
    stage.innerHTML = h + '</div>';
    var V = $('#gtV'), W = stage.clientWidth, H = stage.clientHeight, cx = W / 2, cy = H / 2 + 10, rx = W / 2 - 80, ry = H / 2 - 50, pos = [];
    ds.forEach(function (nm, i) {
      var a = i / n * Math.PI * 2 - Math.PI / 2, x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a); pos.push([x, y]);
      var d = document.createElement('div'); d.className = 'gt-chip'; d.style.left = x + 'px'; d.style.top = y + 'px'; d.textContent = ngan(nm); V.appendChild(d);
    });
    var chips = V.children, bom = document.createElement('div'); bom.className = 'gt-bom'; bom.textContent = '💣'; V.appendChild(bom);
    var dich = ds.indexOf(chon), vt = rnd(n), buoc = 14 + rnd(10), i = 0;
    // dựng đường đi: lùi từ đích để chắc chắn dừng đúng chỗ
    var duong = [vt]; for (var s = 1; s < buoc; s++) duong.push((duong[s - 1] + 1 + rnd(Math.max(1, n - 1))) % n);
    if (duong[buoc - 1] === dich) duong[buoc - 1] = dich; else duong.push(dich);
    if (duong[duong.length - 1] !== dich) duong.push(dich);
    (function nhay() {
      var p = duong[i], tong = duong.length;
      Array.prototype.forEach.call(chips, function (c) { c.classList && c.classList.remove('on'); });
      chips[p].classList.add('on'); bom.style.left = pos[p][0] + 'px'; bom.style.top = pos[p][1] + 'px'; (i % 2 ? SFX.tick : SFX.tock)();
      if (i >= tong - 1) {
        chips[p].classList.remove('on'); chips[p].classList.add('no'); bom.textContent = '💥'; SFX.boom();
        return sau(xong, 1100);
      }
      i++; var kk = i / tong, ms = 90 + 520 * kk * kk + (i > tong - 4 ? 180 : 0);
      sau(nhay, ms);
    })();
  }

  // ---------- 3. Đèn sân khấu ----------
  function troDen(cuc, chon, xong, truoc) {
    var ds = shuf(cuc.length > 32 ? [chon].concat(shuf(cuc.filter(function (n) { return n !== chon; })).slice(0, 31)) : cuc.slice());
    stage.innerHTML = '<div class="gt-mo">' + (cuc.length > 32 ? 'Hiện 32 bạn, chọn ngẫu nhiên trong cả lớp · ' : '') + 'Đèn rọi đang tìm…</div><div class="gt-luoi" id="gtL">' +
      ds.map(function (n) { return '<div class="gt-chip">' + esc(ngan(n)) + '</div>'; }).join('') + '</div>';
    var L = $('#gtL').children, n = ds.length, dich = ds.indexOf(chon), i = 0, p = rnd(n), tong = 16 + rnd(8), gia = [];
    // vài lần "tưởng dừng nhưng chưa": dừng gần đích rồi lướt tiếp
    var dsB = []; for (var s = 0; s < tong; s++) dsB.push(rnd(n));
    dsB.push((dich + 1) % n); dsB.push((dich - 1 + n) % n); dsB.push(dich);
    (function lia() {
      Array.prototype.forEach.call(L, function (c) { c.classList.remove('on'); });
      var q = dsB[i]; L[q].classList.add('on'); SFX.tick();
      if (i >= dsB.length - 1) { L[q].classList.add('no'); SFX.drum(); return sau(xong, 1000); }
      i++; var nho = i >= dsB.length - 3, ms = nho ? 700 + rnd(300) : 80 + 420 * Math.pow(i / dsB.length, 2);
      if (nho) SFX.drum();
      sau(lia, ms);
    })();
  }

  // ---------- 4. Đua vịt ----------
  function troVit(cuc, k, xong) {
    var so = Math.min(cuc.length, Math.max(6, k + 3), 8), ds = shuf(cuc).slice(0, so), g = GEN;
    stage.innerHTML = '<div class="gt-mo">Đua vịt! ' + (so < cuc.length ? 'Các bạn đại diện được bốc ngẫu nhiên · ' : '') + 'về nhất được gọi</div><div class="gt-dua"><div class="gt-dich"></div>' +
      ds.map(function (n) { return '<div class="gt-lan"><b>' + esc(ngan(n)) + '</b><span class="gt-vit">🦆</span></div>'; }).join('') + '</div>';
    var vit = Array.prototype.map.call(stage.querySelectorAll('.gt-vit'), function (e) { return e; });
    var W = stage.querySelector('.gt-lan').clientWidth - 90, x = ds.map(function () { return 0; }), v = ds.map(function () { return 0; }), den = [], t0 = performance.now(), last = t0, dem = 0;
    (function chay(now) {
      if (g !== GEN) return;
      var dt = Math.min(50, now - last); last = now; dem += dt;
      ds.forEach(function (_, i) {
        if (den.indexOf(i) >= 0) return;
        if (Math.random() < dt / 380) v[i] = (Math.random() < .35 ? 1.6 : Math.random() < .5 ? .5 : 1) * (W / 4400);      // lúc nước rút, lúc chậm lại
        x[i] += v[i] * dt; if (x[i] >= W) { x[i] = W; den.push(i); SFX.win(); }
        vit[i].style.left = (90 + x[i]) + 'px'; vit[i].style.transform = 'translate(-100%,-50%) scaleX(-1)';
      });
      if (dem > 300) { dem = 0; SFX.tick(); }
      if (den.length >= k) { var kq = den.slice(0, k).map(function (i) { return ds[i]; }); return sau(function () { xong(kq); }, 900); }
      RAF = requestAnimationFrame(chay);
    })(t0);
  }

  // ---------- 5. Nổ bong bóng ----------
  function troBong(cuc, k, xong) {
    var ds = cuc.length > 30 ? shuf(cuc).slice(0, 30) : shuf(cuc.slice()), MAU = ['#ff8fa8', '#7cc8f2', '#ffd54a', '#8ee07a', '#ffab5e', '#c9a7ff'];
    // chọn người thắng từ cả lớp, rồi dựng thêm bong bóng đệm
    var thang = shuf(cuc).slice(0, k); ds = shuf(thang.concat(shuf(cuc.filter(function (n) { return thang.indexOf(n) < 0; })).slice(0, Math.max(0, 29 - k + 1))));
    stage.innerHTML = '<div class="gt-mo">Bong bóng nổ dần… ai còn lại cuối cùng?' + (cuc.length > ds.length ? ' (hiện ' + ds.length + ' bạn, bốc ngẫu nhiên trong cả lớp)' : '') + '</div><div class="gt-bb" id="gtB">' +
      ds.map(function (n, i) { return '<div class="gt-bong" style="background:' + MAU[i % MAU.length] + ';animation-delay:' + (i % 7) * -.35 + 's">' + esc(ngan(n)) + '</div>'; }).join('') + '</div>';
    var B = $('#gtB').children, con = ds.map(function (_, i) { return i; }), loai = shuf(con.filter(function (i) { return thang.indexOf(ds[i]) < 0; })), tong = loai.length, d = 0;
    (function no() {
      if (!loai.length) { Array.prototype.forEach.call(B, function (b, i) { if (thang.indexOf(ds[i]) >= 0) b.classList.add('song'); }); SFX.win(); return sau(function () { xong(thang); }, 1100); }
      var i = loai.shift(); B[i].classList.add('mat'); SFX.pop(); d++;
      var con_l = loai.length, ms = con_l < 3 ? 900 : 380 - 300 * (d / tong) + 60;
      sau(no, Math.max(110, ms));
    })();
  }

  // ---------- kết quả ----------
  function phao(el) {
    var h = document.createElement('div'), E = ['🎉', '⭐', '✨', '🎊', '🌟', '🏮']; h.className = 'gt-hoa';
    for (var i = 0; i < 28; i++) h.innerHTML += '<i style="left:' + rnd(100) + '%;font-size:' + (16 + rnd(20)) + 'px;animation-duration:' + (2 + Math.random() * 2) + 's;animation-delay:' + Math.random() + 's">' + E[rnd(E.length)] + '</i>';
    el.appendChild(h);
  }
  function hienKetQua(ds) {
    S.ketQua = ds.slice(); ds.forEach(function (n) { if (S.daGoi.indexOf(n) < 0) S.daGoi.push(n); }); luu(); veDaGoi(); SFX.win();
    var nhieu = ds.length > 1;
    var k = document.createElement('div'); k.className = 'gt-kq';
    k.innerHTML = '<div class="zh">' + (nhieu ? '请你们来！' : '请你来！') + '</div>' +
      ds.map(function (n) { return '<div class="ten">' + esc(n) + '</div>'; }).join('') +
      '<div class="vi">' + (nhieu ? 'Mời các bạn trả lời nhé!' : 'Mời bạn trả lời nhé!') + '</div>' +
      '<div class="hang"><button class="gt-btn" id="gtTiep" type="button">✅ Gọi tiếp</button>' +
      '<button class="gt-btn gt-phu" id="gtDoi" type="button">🔁 Đổi bạn khác</button>' +
      '<button class="gt-btn gt-phu" id="gtVv" type="button">🚫 Bạn vắng</button></div>';
    stage.appendChild(k); phao(k);
    $('#gtTiep', k).onclick = function () { S.tam = []; veNen(); };
    $('#gtDoi', k).onclick = function () {       // trả lại các bạn vừa gọi, bỏ qua họ trong lần quay này
      ds.forEach(function (n) { S.daGoi = S.daGoi.filter(function (x) { return x !== n; }); if (S.tam.indexOf(n) < 0) S.tam.push(n); });
      luu(); var tam = S.tam.slice(); veNen(); S.tam = tam; if (kho().length) batDau(); else { S.tam = []; veNen(); }
    };
    $('#gtVv', k).onclick = function () {
      ds.forEach(function (n) { if (S.vang.indexOf(n) < 0) S.vang.push(n); S.daGoi = S.daGoi.filter(function (x) { return x !== n; }); });
      luu(); veNen(); if (kho().length) batDau();
    };
  }

  function veBanVang() {
    dung();
    if (!S.ds.length) return;
    stage.innerHTML = '<div class="gt-rong" style="max-height:100%;overflow:auto"><b>Tích những bạn vắng hôm nay</b> (không bị gọi):<div style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin:12px 0">' +
      S.ds.map(function (n) { return '<label style="background:rgba(255,255,255,.14);border-radius:999px;padding:5px 12px;cursor:pointer"><input type="checkbox" value="' + esc(n) + '"' + (S.vang.indexOf(n) >= 0 ? ' checked' : '') + '> ' + esc(n) + '</label>'; }).join('') +
      '</div><button class="gt-btn" id="gtOkV" type="button">Xong</button></div>';
    $('#gtOkV').onclick = function () { S.vang = Array.prototype.map.call(stage.querySelectorAll('input:checked'), function (i) { return i.value; }); luu(); veNen(); };
  }

  // ---------- nút nổi (chỉ giáo viên) ----------
  function gan() {
    if ($('.gt-fab')) return;
    if (!document.getElementById('gtFabCss')) { var s = document.createElement('style'); s.id = 'gtFabCss'; s.textContent = CSS; document.head.appendChild(s); }
    var b = document.createElement('button'); b.type = 'button'; b.className = 'gt-fab'; b.textContent = '🎲 Gọi tên'; b.title = 'Bảng gọi tên (chỉ cô thấy)';
    b.onclick = moBang; document.body.appendChild(b);
  }
  var lan = 0;
  (function cho() {
    if (window.QM_TK && QM_TK.giaoVien && QM_TK.giaoVien()) return gan();
    if (++lan < 40) setTimeout(cho, 500);
  })();
})();
