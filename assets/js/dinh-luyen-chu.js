/* =========================================================
   ĐỈNH LUYỆN CHỮ · Tiếng Trung Diệu Kỳ (trò của cô Nhiên, đưa lên web 28/10/2026)
   Mỗi câu cho phiên âm + nghĩa của một chữ, chọn các bộ phận ghép thành chữ đó. 15 giây mỗi câu.
   Dữ liệu: data/hsk2/tro-choi/bai-*.json (khoá "ghep": PART, CHARS) — bộ phận theo cấu tạo chữ đã duyệt (ghepChu của bài).
   Cấu hình trang giống Chém chữ Hán: window.QM_TC. Điểm: mã <maDiem>-<bài>-tro-choi-dinh-luyen-chu.
   ========================================================= */
(function () {
  const CF = window.QM_TC || {};
  const app = document.getElementById('dinh-luyen-chu');
  if (!app) return;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  const NHOM = (CF.nhom || []).slice();
  if (CF.tongHop && NHOM.length > 1) NHOM.push({ ma: 'tong-hop', ten: 'Tổng hợp', tongHop: true });
  const thamSo = new URLSearchParams(location.search).get('bai');
  let maNhom = NHOM.some(n => n.ma === thamSo) ? thamSo : (NHOM[0] || {}).ma;

  app.innerHTML = `<div class="lt-thanh tc-thanh"><label class="lt-o"><span class="lt-o-nhan">Bài</span><select class="dl-chon-bai" aria-label="Chọn bài">${NHOM.map(n => `<option value="${esc(n.ma)}">${esc(n.ten)}</option>`).join('')}</select></label>
    <a class="lt-o tc-bxh" href="${esc(CF.bxh || 'bang-xep-hang.html')}?tro=dinh-luyen-chu"><span class="lt-o-nhan">Xếp hạng</span><b>🏆 Xem bảng</b></a></div>
    <div class="dl-box" id="dl-app"></div>`;
  const selBai = app.querySelector('.dl-chon-bai'); selBai.value = maNhom;
  const box = document.getElementById('dl-app');
  const $ = id => document.getElementById(id);

  /* ===== DỮ LIỆU ===== */
  let PART = {}, CHARS = [], D = null;
  const DA_TAI = {};
  function tai(n) {
    const ds = n.tongHop ? NHOM.filter(x => !x.tongHop) : [n];
    return Promise.all(ds.map(x => DA_TAI[x.tep] || (DA_TAI[x.tep] = fetch(x.tep).then(r => { if (!r.ok) throw r; return r.json(); }))))
      .then(list => gop(list.map(d => d.ghep)));
  }
  /* Chữ trùng lấy bản của bài đầu tiên. Bộ phận nhiễu thiếu thì bù ngẫu nhiên từ các bộ phận khác cho đủ số ô. */
  function gop(list) {
    const PART = {}, CHARS = [];
    list.forEach(d => {
      Object.keys(d.PART).forEach(p => { if (!PART[p]) PART[p] = d.PART[p]; });
      d.CHARS.forEach(ch => { if (!CHARS.some(x => x.c === ch.c)) CHARS.push(ch); });
    });
    const all = Object.keys(PART);
    return { PART, CHARS: CHARS.map(ch => {
      const need = Math.max(4, ch.parts.length + 1) - ch.parts.length;
      let fake = (ch.fake || []).filter(p => PART[p] && !ch.parts.includes(p));
      if (fake.length < need) fake.push(...shuffle(all.filter(p => !ch.parts.includes(p) && !fake.includes(p))).slice(0, need - fake.length));
      return Object.assign({}, ch, { fake });
    }) };
  }
  const partPy = p => (PART[p] || ['', ''])[0];

  /* ===== CÀI ĐẶT ===== */
  const Q_TIME = 15, BASE = 50, PER_SEC = 10;   // đúng: 50 điểm + 10 điểm cho mỗi giây còn lại
  const MUTE_KEY = 'qm-am-hieu-ung';
  const bestKey = () => 'qmhy:dinh-luyen-chu-' + (CF.phamVi || 'h2') + '-' + maNhom + ':best';

  /* ===== ÂM THANH: máy tự tạo, không cần file mp3 ===== */
  let actx = null, muted = store.get(MUTE_KEY) === '0';
  function ac() { if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (actx && actx.state === 'suspended') actx.resume(); return actx; }
  function tone(f, d, type = 'sine', v = .18, at = 0) {
    if (muted) return; const c = ac(); if (!c) return;
    const o = c.createOscillator(), g = c.createGain(), t = c.currentTime + at;
    o.type = type; o.frequency.value = f; g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
    o.connect(g).connect(c.destination); o.start(t); o.stop(t + d);
  }
  const sfx = {
    tap() { tone(660, .06, 'triangle', .12); },
    ok(n) { const b = 523 * Math.pow(1.06, Math.min(n, 8)); tone(b, .12, 'triangle'); tone(b * 1.5, .18, 'triangle', .16, .08); },
    bad() { tone(180, .28, 'sawtooth', .12); },
    tick() { tone(1000, .04, 'square', .06); },
    end(win) { [523, 659, 784, win ? 1047 : 659].forEach((f, i) => tone(f, .22, 'triangle', .16, i * .13)); }
  };

  /* ===== TRẠNG THÁI ===== */
  let qs = [], idx = 0, score = 0, streak = 0, bestStreak = 0, answers = [], log = [];
  let sel = [], locked = false, tiles = [], timer = null, left = Q_TIME, qStart = 0, playStart = 0, hs = null;

  /* ===== MÀN BẮT ĐẦU ===== */
  function intro() {
    stop(); selBai.disabled = false;
    const best = +store.get(bestKey()) || 0;
    box.innerHTML = `<div class="dl-panel">
      <h2>Đỉnh luyện chữ · ${esc(D.ten)}</h2>
      <ol class="dl-rules">
        <li>Mỗi câu cho phiên âm và nghĩa của một chữ. Em chọn các bộ phận ghép thành chữ đó.</li>
        <li>Mỗi câu ghi rõ cần chọn mấy bộ phận. Chọn đủ là máy chấm ngay.</li>
        <li>Mỗi câu có ${Q_TIME} giây. Đúng được ${BASE} điểm, cộng thêm ${PER_SEC} điểm cho mỗi giây còn lại.</li>
      </ol>
      <p class="dd-ghi">${CHARS.length} chữ trong lượt này.</p>
      ${window.QM_DIEM ? QM_DIEM.oNhap() : ''}
      ${best ? `<p class="dl-send">Kỷ lục trên máy này: ${best} điểm</p>` : ''}
      <button class="btn gold" id="dl-go">▶ Bắt đầu</button></div>`;
    box.querySelectorAll('input').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') begin(); }));
    $('dl-go').onclick = begin;
  }
  function begin() {
    if (window.QM_DIEM) hs = QM_DIEM.docNhap(box);
    ac(); restart();
  }
  function restart() {
    qs = shuffle(CHARS); idx = 0; score = 0; streak = 0; bestStreak = 0; answers = []; log = [];
    playStart = Date.now(); selBai.disabled = true;
    ask();
    const h = document.querySelector('.sh-header'), cao = h ? h.getBoundingClientRect().height : 0, r = box.getBoundingClientRect();
    if (r.top < cao || r.top > window.innerHeight * .4) window.scrollTo({ top: r.top + window.scrollY - cao - 6, behavior: 'smooth' });
  }

  /* ===== MỘT CÂU ===== */
  function ask() {
    const q = qs[idx];
    const fakes = shuffle(q.fake).slice(0, Math.max(4, q.parts.length + 1) - q.parts.length);
    tiles = shuffle([...q.parts, ...fakes]);
    sel = []; locked = false; left = Q_TIME;
    const word = q.word
      ? `<div class="w">${[...q.word].map(x => x === '□' ? '<span class="hole"></span>' : esc(x)).join('')}</div>
         <div class="p">${esc(q.wpy)}</div><div class="v">${esc(q.vi)}</div>
         <div class="read">Chữ cần ghép đọc là <b>${esc(q.py)}</b></div>`
      : `<div class="p" style="font-size:22px">${esc(q.py)}</div><div class="v">${esc(q.vi)}</div>`;
    box.innerHTML = `
      <div class="dl-hud"><span>Câu <b>${idx + 1}</b>/${qs.length}</span><span>Chuỗi đúng: <b id="dl-stk">${streak}</b></span>
        <span class="sc" id="dl-sc">${score} điểm</span>
        <button class="dl-mute" id="dl-mute" aria-label="Bật hoặc tắt âm thanh">${muted ? '🔇' : '🔊'}</button></div>
      <div class="dl-timer" id="dl-tm"><i id="dl-bar"></i></div><div class="dl-secs" id="dl-secs">${Q_TIME} giây</div>
      <div class="dl-ask"><div class="dl-slot" id="dl-slot">?</div><div class="meta">${word}</div></div>
      <p class="dl-need">Chọn <b>${q.parts.length}</b> bộ phận ghép thành chữ này.</p>
      <div class="dl-tiles" id="dl-tiles" style="--n:${tiles.length}">${tiles.map((p, i) => `<button class="dl-tile" data-i="${i}" aria-pressed="false">
        <span class="hanzi">${esc(p)}</span><span class="py">${esc(partPy(p))}</span></button>`).join('')}</div>
      <div id="dl-after"></div>`;
    $('dl-tiles').querySelectorAll('.dl-tile').forEach(b => b.onclick = () => pick(+b.dataset.i));
    $('dl-mute').onclick = () => { muted = !muted; store.set(MUTE_KEY, muted ? '0' : '1'); $('dl-mute').textContent = muted ? '🔇' : '🔊'; };
    qStart = performance.now();
    stop(); timer = setInterval(tick, 100);
    requestAnimationFrame(drawBar);
  }
  function tick() {
    const el = (performance.now() - qStart) / 1000, before = Math.ceil(left);
    left = Math.max(0, Q_TIME - el);
    const now = Math.ceil(left);
    $('dl-secs').textContent = now + ' giây';
    $('dl-tm').classList.toggle('low', left <= 5);
    if (now < before && now <= 5 && now > 0) sfx.tick();
    if (left <= 0) check(true);
  }
  function drawBar() {
    if (locked || !$('dl-bar')) return;
    $('dl-bar').style.transform = `scaleX(${Math.max(0, 1 - (performance.now() - qStart) / 1000 / Q_TIME)})`;
    requestAnimationFrame(drawBar);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  function pick(i) {
    if (locked) return;
    const k = sel.indexOf(i);
    if (k >= 0) sel.splice(k, 1); else sel.push(i);
    sfx.tap();
    $('dl-tiles').querySelectorAll('.dl-tile').forEach((b, j) => { const on = sel.includes(j); b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); });
    if (sel.length === qs[idx].parts.length) check(false);
  }

  /* Chọn đủ bộ phận theo thứ tự nào cũng tính đúng; lời giải hiện cấu trúc chữ để học vị trí */
  function check(timeout) {
    if (locked) return;
    locked = true; stop();
    const q = qs[idx];
    const got = sel.map(i => tiles[i]);
    const ok = !timeout && got.length === q.parts.length && got.every(p => q.parts.includes(p));
    const secsLeft = Math.ceil(left);
    const gain = ok ? BASE + PER_SEC * secsLeft : 0;
    if (ok) { score += gain; streak++; bestStreak = Math.max(bestStreak, streak); sfx.ok(streak); }
    else { streak = 0; sfx.bad(); }
    answers.push({ c: q.c, ok, got: timeout && !got.length ? 'hết giờ' : got.join(' + ') });
    log.push({ stt: log.length + 1, dang: 'Ghép bộ phận thành chữ', cauHoi: `${q.py} – ${q.vi}`, dapAn: q.c + ' = ' + q.parts.join('+'),
      chon: timeout ? (got.join('+') || '(hết giờ)') : got.join('+'), dung: ok });
    document.querySelectorAll('#dl-app .meta .hole').forEach(h => h.outerHTML = `<span style="color:var(--red)">${esc(q.c)}</span>`);
    const slot = $('dl-slot');
    slot.textContent = q.c; slot.classList.add(ok ? 'ok' : 'bad');
    if (ok) slot.insertAdjacentHTML('beforeend', `<span class="pop">+${gain}</span>`);
    $('dl-tiles').querySelectorAll('.dl-tile').forEach((b, j) => {
      b.disabled = true;
      const isPart = q.parts.includes(tiles[j]), chosen = sel.includes(j);
      b.classList.remove('sel');
      if (isPart && chosen) b.classList.add('right');
      else if (chosen) b.classList.add('wrong');
      else if (isPart) b.classList.add('missed');
    });
    $('dl-sc').textContent = score + ' điểm'; $('dl-stk').textContent = streak;
    $('dl-secs').textContent = timeout ? 'Hết giờ' : secsLeft + ' giây';
    const mean = q.word ? `${q.vi} (trong từ ${q.word.replace(/□/g, q.c)})` : q.vi;
    const head = ok ? `Đúng rồi. +${gain} điểm` : timeout ? 'Hết giờ.' : `Chưa đúng. Em chọn ${got.join(' + ')}.`;
    $('dl-after').innerHTML = `<div class="dl-note ${ok ? 'ok' : 'bad'}" aria-live="polite"><strong>${esc(head)}</strong>
      ${q.parts.map(p => `<div class="row"><span class="hanzi">${esc(p)}</span><span class="p">${esc(partPy(p))}</span><span>${esc((PART[p] || ['', ''])[1])}</span></div>`).join('')}
      <div class="row whole"><span class="hanzi">${esc(q.c)}</span><span class="p">${esc(q.py)}</span><span>${esc(mean)}</span></div>
      ${q.st ? `<div class="struct">Cấu trúc: ${esc(q.st)}</div>` : ''}</div>
      <div class="dl-next"><button class="btn solid" id="dl-nx">${idx === qs.length - 1 ? 'Xem kết quả' : 'Câu tiếp theo ›'}</button></div>`;
    $('dl-nx').onclick = () => { idx++; idx < qs.length ? ask() : result(); };
    $('dl-nx').focus({ preventScroll: true });
  }

  /* ===== KẾT QUẢ ===== */
  function result() {
    stop(); selBai.disabled = false;
    const n = answers.filter(a => a.ok).length, t = answers.length;
    const best = +store.get(bestKey()) || 0, isNew = score > best;
    if (isNew) store.set(bestKey(), score);
    sfx.end(isNew);
    const msg = n === t ? 'Hoàn hảo, em ghép đúng tất cả.' : n >= t * 0.8 ? 'Rất tốt. Xem lại vài chữ sai bên dưới nhé.' : 'Xem lại các chữ sai rồi chơi lại nhé.';
    box.innerHTML = `<div class="dl-panel">
      <div class="dl-big">${score}</div><p>điểm${hs && hs.hoTen ? ' · ' + esc(hs.hoTen) + (hs.lop ? ', lớp ' + esc(hs.lop) : '') : ''}</p>
      <div class="dd-khu"></div>
      <div class="dl-stats"><span><b>${n}/${t}</b>câu đúng</span><span><b>${bestStreak}</b>chuỗi đúng dài nhất</span></div>
      <p>${msg}${isNew ? ' 🏆 Kỷ lục mới trên máy này!' : ''}</p>
      <ul class="dl-review">${answers.map(a => `<li><span class="hanzi">${esc(a.c)}</span>
        ${a.ok ? '' : `<span class="got hanzi" style="font-size:13px">${esc(a.got)}</span>`}
        <span class="mark ${a.ok ? 'y' : 'x'}">${a.ok ? 'Đúng' : 'Sai'}</span></li>`).join('')}</ul>
      <button class="btn solid" id="dl-again">↻ Chơi lại</button></div>`;
    $('dl-again').onclick = restart;
    const nh = NHOM.find(x => x.ma === maNhom);
    if (window.QM_DIEM) QM_DIEM.gui({ lesson: QM_DIEM.maBai(CF.maDiem || 'h2', nh.tongHop ? (CF.tongHopDiem || 'tong-hop-bai0') : nh.diem, 'dinh-luyen-chu'),
      lessonTitle: (CF.tenDiem || '') + nh.ten + ' · Đỉnh luyện chữ', score, total: qs.length * (BASE + PER_SEC * Q_TIME), bestStreak,
      durationSeconds: (Date.now() - playStart) / 1000, chiTiet: log, hoTen: hs ? hs.hoTen : '', lop: hs ? hs.lop : '',
      linkBxh: (CF.bxh || 'bang-xep-hang.html') + '?tro=dinh-luyen-chu&bai=' + maNhom }, box.querySelector('.dd-khu'));
  }

  function moNhom() {
    stop();
    const n = NHOM.find(x => x.ma === maNhom);
    box.innerHTML = '<div class="dl-panel"><div class="tv-trong">Đang tải chữ…</div></div>';
    tai(n).then(d => {
      if (maNhom !== n.ma) return;
      PART = d.PART; CHARS = d.CHARS; D = { ten: n.ten };
      intro();
    }).catch(() => { box.innerHTML = '<div class="dl-panel"><div class="tv-trong">Chưa tải được dữ liệu, bạn kiểm tra mạng rồi thử lại nhé.</div></div>'; });
  }
  selBai.addEventListener('change', () => { maNhom = selBai.value; history.replaceState(null, '', '?bai=' + maNhom); moNhom(); });
  moNhom();
})();
