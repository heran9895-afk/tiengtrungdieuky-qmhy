/* =========================================================
   TAB "📚 BỘ CÂU HỎI" của trang giáo viên (2026-11-14)
   Cô xem toàn bộ nội dung từng bài / từng phần và SỬA TRỰC TIẾP. Chỗ sửa lưu ở máy chủ tài khoản (trang NoiDungSua),
   web học sinh chồng lên tệp data/*.json lúc tải (xem đoạn "Sửa nội dung bài học" đầu header.js).
   Câu được nhận diện bằng ĐƯỜNG DẪN trong tệp (vd cauLuyen/3) + bản gốc; tệp gốc đổi chỗ đó thì bản sửa cũ tự bỏ.
   Chưa có: thêm câu mới, đổi thứ tự (nhờ bên soạn). Giọng đọc (assets/…mp3) không sửa ở đây.
   ========================================================= */
(function () {
  if (window.QM_GV_BO) return;
  var CSS = '.bc{font-size:15px}.bc-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 10px}' +
    '.bc select,.bc input[type=search]{padding:7px 10px;border:1px solid #cbbf9b;border-radius:8px;font:inherit;background:#fff}' +
    '.bc input[type=search]{flex:1;min-width:160px}' +
    '.bc-chips{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}.bc-chip{border:1px solid #cbbf9b;background:#fff;border-radius:999px;padding:5px 12px;cursor:pointer;font:inherit}' +
    '.bc-chip.on{background:#0e5a2c;color:#fff;border-color:#0e5a2c}.bc-chip small{opacity:.75;margin-left:4px}' +
    '.bc-it{border:1px solid #e0d6b6;border-radius:10px;background:#fff;margin:0 0 6px;overflow:hidden}' +
    '.bc-hd{display:flex;gap:8px;align-items:baseline;padding:8px 12px;cursor:pointer}.bc-hd:hover{background:#faf6e8}' +
    '.bc-so{color:#8a7a45;min-width:34px;font-size:13px}.bc-tt{flex:1;line-height:1.4}.bc-tt.xoa{text-decoration:line-through;color:#999}' +
    '.bc-tag{font-size:12px;border-radius:6px;padding:1px 7px;background:#fff1c2;color:#7a5b00;white-space:nowrap}.bc-tag.x{background:#fde0e0;color:#a02020}' +
    '.bc-bd{padding:10px 12px 12px;border-top:1px dashed #e0d6b6;background:#fffdf5}' +
    '.bc-f{margin:0 0 8px}.bc-f>label{display:block;font-size:12px;color:#6b5b2a;margin:0 0 2px}' +
    '.bc-f textarea,.bc-f input[type=text],.bc-f input[type=number]{width:100%;box-sizing:border-box;padding:6px 9px;border:1px solid #cbbf9b;border-radius:8px;font:inherit;background:#fff}' +
    '.bc-f textarea{resize:vertical;min-height:38px}.bc-f .ro{background:#f1eee3;color:#666}' +
    '.bc-g{border-left:3px solid #e6d9a6;padding-left:10px;margin:0 0 8px}' +
    '.bc-nut{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;align-items:center}.bc-nut button{border:0;border-radius:8px;padding:7px 14px;font:inherit;cursor:pointer}' +
    '.bc-luu{background:#0e5a2c;color:#fff}.bc-kp{background:#efe6c4}.bc-an{background:#fde0e0;color:#a02020}.bc-tb{font-size:13px;color:#555}.bc-tb.l{color:#a02020}' +
    '.bc-lu{font-size:13px;background:#fff7dd;border-radius:8px;padding:6px 10px;margin:0 0 8px;color:#6b5200}.bc-cho{padding:18px;color:#777}';
  var LABEL = { tu: 'Từ vựng', hoiDap: 'Hỏi đáp', cauLuyen: 'Câu luyện', hoiThoai: 'Hội thoại', nguPhap: 'Ngữ pháp', boThu: 'Bộ thủ', ghepChu: 'Chữ ghép', chang: 'Chặng ôn tập' };
  var THU_TU = ['tu', 'hoiDap', 'cauLuyen', 'hoiThoai', 'nguPhap', 'boThu', 'ghepChu', 'chang'];
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function sao(x) { return JSON.parse(JSON.stringify(x)); }
  function lay(g, path) { var c = g; for (var i = 0; i < path.length; i++) { if (c == null) return undefined; c = c[path[i]]; } return c; }
  function khoaDuong(path) { return path.map(function (x) { return encodeURIComponent(String(x)); }).join('/'); }
  function tomTat(v) {
    var kq = [];
    (function di(x, sau) { if (kq.length >= 3 || sau > 5) return; if (typeof x === 'string') { if (x && !/^assets\//.test(x) && !/^[\d-]+$/.test(x) && x.length < 400) kq.push(x.replace(/\s+/g, ' ')); } else if (Array.isArray(x)) x.forEach(function (y) { di(y, sau + 1); }); else if (x && typeof x === 'object') Object.keys(x).forEach(function (k) { di(x[k], sau + 1); }); })(v, 0);
    var s = kq.join(' · '); return s.length > 120 ? s.slice(0, 118) + '…' : (s || '(trống)');
  }
  function coAm(v) { return JSON.stringify(v).indexOf('"assets/') >= 0; }

  function ve(node, D, ROOT) {
    if (!document.getElementById('bcCss')) { var st = document.createElement('style'); st.id = 'bcCss'; st.textContent = CSS; document.head.appendChild(st); }
    var S = { bai: '5', muc: 0, tim: '', tep: {} };     // tep[tên] = {goc, sua, mucs}
    node.innerHTML = '<div class="bc"><div class="bc-bar"><select id="bcBai"></select><input type="search" id="bcTim" placeholder="Tìm trong phần này…"></div>' +
      '<div class="bc-chips" id="bcChips"></div><div id="bcDs"><div class="bc-cho">Đang tải…</div></div></div>';
    var sel = node.querySelector('#bcBai'), ds = node.querySelector('#bcDs'), chips = node.querySelector('#bcChips'), tim = node.querySelector('#bcTim');
    var opts = [1, 2, 3, 4, 5, 6, 7].map(function (n) { return '<option value="' + n + '">Bài ' + n + '</option>'; });
    opts.push('<option value="on-tap">Ôn tập tổng hợp Bài 1–5</option>'); sel.innerHTML = opts.join(''); sel.value = S.bai;
    sel.onchange = function () { S.bai = sel.value; S.muc = 0; S.tim = ''; tim.value = ''; tai(); };
    tim.oninput = function () { S.tim = tim.value.trim().toLowerCase(); veDs(); };

    function tepCua(b) { return b === 'on-tap' ? ['bai/on-tap-1-5-tu.json'] : ['bai/bai-' + b + '.json', 'bai/sach-bai-tap/bai-' + b + '.json']; }
    function xayMuc(tep, g) {
      var ms = [];
      if (/sach-bai-tap/.test(tep)) (g.phan || []).forEach(function (p, i) { ms.push({ ten: 'Sách BT · ' + (p.ten || ('phần ' + (i + 1))), tep: tep, cha: ['phan', i, 'cau'], n: (p.cau || []).length }); });
      else THU_TU.forEach(function (k) { if (Array.isArray(g[k]) && g[k].length) ms.push({ ten: LABEL[k], tep: tep, cha: [k], n: g[k].length }); });
      return ms;
    }
    function tai() {
      ds.innerHTML = '<div class="bc-cho">Đang tải…</div>'; chips.innerHTML = '';
      var dsTep = tepCua(S.bai);
      Promise.all(dsTep.map(function (t) {
        return fetch(ROOT + 'data/' + t + '?goc=1&t=' + Date.now()).then(function (r) { if (!r.ok) throw r; return r.json(); })
          .then(function (g) { return window.QM_SUA.tai(t).then(function (sua) { S.tep[t] = { goc: g, sua: sua, mucs: xayMuc(t, g) }; }); })
          .catch(function () { S.tep[t] = { goc: null, sua: {}, mucs: [] }; });
      })).then(function () {
        S.dsMuc = []; dsTep.forEach(function (t) { S.tep[t].mucs.forEach(function (m) { S.dsMuc.push(m); }); });
        if (!S.dsMuc.length) { ds.innerHTML = '<div class="bc-cho">Chưa đọc được dữ liệu bài này (tệp trống hoặc mạng lỗi).</div>'; return; }
        veChips(); veDs();
      });
    }
    function daSua(m) { var n = 0, T = S.tep[m.tep], tg = khoaDuong(m.cha) + '/'; Object.keys(T.sua).forEach(function (k) { if (k.indexOf(tg) === 0) n++; }); return n; }
    function veChips() {
      chips.innerHTML = S.dsMuc.map(function (m, i) { var n = daSua(m); return '<button type="button" class="bc-chip' + (i === S.muc ? ' on' : '') + '" data-i="' + i + '">' + esc(m.ten) + '<small>' + m.n + (n ? ' · ✏️' + n : '') + '</small></button>'; }).join('');
      chips.querySelectorAll('.bc-chip').forEach(function (b) { b.onclick = function () { S.muc = +b.dataset.i; S.tim = ''; tim.value = ''; veChips(); veDs(); }; });
    }
    function veDs() {
      var m = S.dsMuc[S.muc]; if (!m) return;
      var T = S.tep[m.tep], arr = lay(T.goc, m.cha) || [], html = [];
      for (var i = 0; i < arr.length; i++) {
        var path = m.cha.concat([i]), dd = khoaDuong(path), x = T.sua[dd], xoa = x && x.m === '__xoa';
        var hienTai = x && !xoa ? safeParse(x.m, arr[i]) : arr[i], tt = tomTat(hienTai);
        if (S.tim && (tt + ' ' + JSON.stringify(hienTai)).toLowerCase().indexOf(S.tim) < 0) continue;
        html.push('<div class="bc-it" data-i="' + i + '"><div class="bc-hd"><span class="bc-so">' + (i + 1) + '</span><span class="bc-tt' + (xoa ? ' xoa' : '') + '">' + esc(tt) + '</span>' +
          (xoa ? '<span class="bc-tag x">đã ẩn</span>' : x ? '<span class="bc-tag">✏️ đã sửa</span>' : '') + '</div></div>');
      }
      ds.innerHTML = '<div class="bc-tb" style="margin:0 0 8px">' + esc(m.ten) + ': ' + arr.length + ' mục' + (S.tim ? ' · đang lọc' : '') + '. Bấm vào mục để xem và sửa.</div>' + (html.join('') || '<div class="bc-cho">Không có mục nào khớp.</div>');
      ds.querySelectorAll('.bc-it').forEach(function (it) { it.querySelector('.bc-hd').onclick = function () { moMuc(it, m, +it.dataset.i); }; });
    }
    function safeParse(s, mac) { try { return JSON.parse(s); } catch (e) { return mac; } }

    function moMuc(it, m, i) {
      var bd = it.querySelector('.bc-bd'); if (bd) { bd.remove(); return; }
      var T = S.tep[m.tep], path = m.cha.concat([i]), dd = khoaDuong(path), goc = lay(T.goc, path), x = T.sua[dd], xoa = x && x.m === '__xoa';
      var W = sao(x && !xoa ? safeParse(x.m, goc) : goc);
      bd = document.createElement('div'); bd.className = 'bc-bd'; it.appendChild(bd);
      if (coAm(goc)) bd.insertAdjacentHTML('beforeend', '<div class="bc-lu">🔊 Câu này có giọng đọc thu sẵn. Cô sửa chữ xong thì giọng đọc vẫn là giọng cũ; cô báo tui, tui đưa vào đợt thu âm lại.</div>');
      var form = document.createElement('div'); bd.appendChild(form);
      form.appendChild(truong(W, null, ''));
      var nut = document.createElement('div'); nut.className = 'bc-nut';
      nut.innerHTML = '<button type="button" class="bc-luu">💾 Lưu</button><button type="button" class="bc-kp">↩ Khôi phục bản gốc</button><button type="button" class="bc-an">' + (xoa ? '👁 Hiện lại' : '🚫 Ẩn mục này') + '</button><span class="bc-tb"></span>';
      bd.appendChild(nut);
      var tb = nut.querySelector('.bc-tb');
      function gui(moi, thongBao) {
        tb.className = 'bc-tb'; tb.textContent = 'Đang lưu…';
        QM_TK.goi('gvSuaNoiDung', { tep: m.tep, duongDan: dd, goc: JSON.stringify(goc), moi: moi }).then(function (o) {
          T.sua = (o.sua && o.sua[m.tep]) || {}; window.QM_SUA.ghiNho(m.tep, T.sua);
          veChips(); var cu = S.muc; veDs(); if (cu === S.muc) { var it2 = ds.querySelector('.bc-it[data-i="' + i + '"]'); if (it2) { var t2 = it2.querySelector('.bc-hd'); t2.insertAdjacentHTML('beforeend', '<span class="bc-tag" style="background:#d9f2df;color:#0e5a2c">' + esc(thongBao) + '</span>'); } }
        }).catch(function (e) { tb.className = 'bc-tb l'; tb.textContent = 'Chưa lưu được: ' + (e.message || e); });
      }
      nut.querySelector('.bc-luu').onclick = function () { gui(JSON.stringify(W) === JSON.stringify(goc) ? null : JSON.stringify(W), '✓ đã lưu'); };
      nut.querySelector('.bc-kp').onclick = function () { if (confirm('Trả mục này về bản gốc?')) gui(null, '✓ đã khôi phục'); };
      nut.querySelector('.bc-an').onclick = function () { gui(xoa ? null : '__xoa', xoa ? '✓ đã hiện lại' : '✓ đã ẩn'); };
    }

    // Ô nhập đệ quy: chuỗi → ô chữ; số; đúng/sai; mảng và đối tượng → khung con. Sửa thẳng vào bản sao W.
    function truong(cha, khoa, nhan) {
      var v = khoa === null ? cha : cha[khoa], box = document.createElement('div');
      if (typeof v === 'string') {
        box.className = 'bc-f'; var lb = document.createElement('label'); lb.textContent = nhan; if (nhan) box.appendChild(lb);
        if (/^assets\//.test(v)) {
          var r = document.createElement('input'); r.type = 'text'; r.value = v; r.readOnly = true; r.className = 'ro'; box.appendChild(r);
          var pl = document.createElement('button'); pl.type = 'button'; pl.textContent = '▶ nghe'; pl.style.cssText = 'margin-top:4px;border:0;border-radius:6px;padding:3px 10px;cursor:pointer';
          pl.onclick = function () { try { new Audio(ROOT + v).play(); } catch (e) {} }; box.appendChild(pl);
        } else {
          var t = document.createElement('textarea'); t.value = v; t.rows = Math.min(8, Math.max(1, Math.ceil(v.length / 70) + (v.split('\n').length - 1)));
          t.oninput = function () { cha[khoa] = t.value; }; box.appendChild(t);
        }
      } else if (typeof v === 'number') {
        box.className = 'bc-f'; box.innerHTML = '<label>' + esc(nhan) + '</label>'; var n = document.createElement('input'); n.type = 'number'; n.value = v; n.oninput = function () { cha[khoa] = +n.value; }; box.appendChild(n);
      } else if (typeof v === 'boolean') {
        box.className = 'bc-f'; var c = document.createElement('input'); c.type = 'checkbox'; c.checked = v; c.onchange = function () { cha[khoa] = c.checked; };
        var l2 = document.createElement('label'); l2.appendChild(c); l2.appendChild(document.createTextNode(' ' + nhan)); box.appendChild(l2);
      } else if (v && typeof v === 'object') {
        box.className = nhan ? 'bc-g' : ''; if (nhan) { var h = document.createElement('div'); h.className = 'bc-tb'; h.style.fontWeight = '600'; h.textContent = nhan; box.appendChild(h); }
        var kk = Array.isArray(v) ? v.map(function (_, i) { return i; }) : Object.keys(v);
        kk.forEach(function (k) { box.appendChild(truong(v, k, Array.isArray(v) ? '#' + (+k + 1) : k)); });
      }
      return box;
    }
    tai();
  }
  window.QM_GV_BO = { ve: ve };
})();
