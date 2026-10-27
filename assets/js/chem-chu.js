/* =========================================================
   CHÉM CHỮ HÁN · Tiếng Trung Diệu Kỳ (trò của cô Nhiên, đưa lên web 28/10/2026)
   Đề là nghĩa tiếng Việt; quả mang chữ Hán bay lên, vuốt chém quả đúng nghĩa. 3 mạng, thời gian theo số từ.
   Dữ liệu: data/hsk2/tro-choi/bai-*.json (khoá "chem": P, CONF, MEAN, TRANH) — dựng bằng tools/tro_choi_du_lieu.py.
   Trang đặt cấu hình TRƯỚC khi nhúng: window.QM_TC = { maDiem, tenDiem, tongHop, tongHopDiem, bxh, nhom: [{ ma, ten, diem, tep }] }
   Điểm gửi lên máy chủ điểm của web (diem-tro-choi.js): mã <maDiem>-<bài>-tro-choi-chem-chu.
   ========================================================= */
(function () {
  const CF = window.QM_TC || {};
  const goc = document.getElementById('chem-chu');
  if (!goc) return;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const NHOM = (CF.nhom || []).slice();
  if (CF.tongHop && NHOM.length > 1) NHOM.push({ ma: 'tong-hop', ten: 'Tổng hợp', tongHop: true });
  const thamSo = new URLSearchParams(location.search).get('bai');
  let maNhom = NHOM.some(n => n.ma === thamSo) ? thamSo : (NHOM[0] || {}).ma;

  goc.innerHTML = `
    <div class="lt-thanh tc-thanh"><label class="lt-o"><span class="lt-o-nhan">Bài</span><select class="cc-chon-bai" aria-label="Chọn bài">${NHOM.map(n => `<option value="${esc(n.ma)}">${esc(n.ten)}</option>`).join('')}</select></label>
      <a class="lt-o tc-bxh" href="${esc(CF.bxh || 'bang-xep-hang.html')}?tro=chem-chu"><span class="lt-o-nhan">Xếp hạng</span><b>🏆 Xem bảng</b></a></div>
    <div class="cc-game">
      <div class="cc-hud">
        <span class="cc-lives" id="cc-lives"></span>
        <span class="cc-time" id="cc-time">60 giây</span>
        <span class="cc-score" id="cc-score">0 điểm</span>
        <button class="cc-mute" id="cc-mute" aria-label="Bật hoặc tắt âm thanh"></button>
      </div>
      <div class="cc-prompt" id="cc-prompt"></div>
      <p class="cc-ask">Chém quả có chữ Hán đúng nghĩa.</p>
      <div class="cc-field" id="cc-field">
        <canvas id="cc-cv"></canvas>
        <div class="cc-toast" id="cc-toast"></div>
        <div class="cc-layer" id="cc-start"></div>
        <div class="cc-layer" id="cc-end" hidden></div>
      </div>
    </div>`;
  const $ = id => document.getElementById(id);
  const selBai = goc.querySelector('.cc-chon-bai');
  selBai.value = maNhom;

  /* ===== DỮ LIỆU ===== */
  let P = {}, CONF = {}, MEAN = {}, TRANH = {}, KEYS = [], D = null, ROUND_TIME = 60;
  const DA_TAI = {};
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function tai(n) {
    const ds = n.tongHop ? NHOM.filter(x => !x.tongHop) : [n];
    return Promise.all(ds.map(x => DA_TAI[x.tep] || (DA_TAI[x.tep] = fetch(x.tep).then(r => { if (!r.ok) throw r; return r.json(); }))))
      .then(list => gop(list.map(d => d.chem)));
  }
  /* Gộp các bài: từ trùng lấy bản của bài đầu tiên, quả nhiễu thì gộp. Nhiễu không có trong lượt chơi thì bỏ;
     thiếu thì bù ngẫu nhiên cho đủ 3 — không bao giờ lấy từ trùng nghĩa (TRANH) làm nhiễu. */
  function gop(list) {
    const P = {}, CONF = {}, MEAN = {}, TRANH = {};
    list.forEach(d => Object.keys(d.P).forEach(k => {
      if (!P[k]) { P[k] = d.P[k]; MEAN[k] = d.MEAN[k]; CONF[k] = []; TRANH[k] = []; }
      (d.CONF[k] || []).forEach(c => { if (!CONF[k].includes(c)) CONF[k].push(c); });
      ((d.TRANH || {})[k] || []).forEach(c => { if (!TRANH[k].includes(c)) TRANH[k].push(c); });
    }));
    const keys = Object.keys(P);
    keys.forEach(k => {
      CONF[k] = CONF[k].filter(c => P[c] && c !== k && !TRANH[k].includes(c));
      if (CONF[k].length < 3) CONF[k].push(...shuffle(keys.filter(x => x !== k && !CONF[k].includes(x) && !TRANH[k].includes(x) && !(TRANH[x] || []).includes(k))).slice(0, 3 - CONF[k].length));
    });
    return { P, CONF, MEAN, TRANH };
  }

  /* ===== CÀI ĐẶT GAME ===== */
  /* Thời gian ván tính theo số từ của bài: 3 giây mỗi từ, làm tròn lên bội số của 5, ít nhất 60 giây. */
  const SEC_PER_WORD = 3, LIVES = 3;
  const FRUITS = [
    { rim: '#f08a24', hi: '#ffb45e', flesh: '#ffd59a' },
    { rim: '#7cb342', hi: '#a6d46a', flesh: '#e8f5c8' },
    { rim: '#8e44ad', hi: '#b277cc', flesh: '#f0d9f7' },
    { rim: '#f4c430', hi: '#ffe07a', flesh: '#fff3c4' },
    { rim: '#d9433a', hi: '#f07a6f', flesh: '#ffe0d6' }
  ];
  const cv = $('cc-cv'), ctx = cv.getContext('2d'), field = $('cc-field');
  let W = 0, H = 0, R = 36, dpr = 1;
  let state = 'idle', paused = false;
  let fruits = [], halves = [], parts = [], floats = [], trail = [];
  let cur = null, pid = 0, score = 0, lives = LIVES, timeLeft = 60, combo = 0;
  let maxCombo = 0, log = [], hs = null;
  let hits = 0, wrongs = 0, misses = 0, mistakes = [], nextWave = 0, lastT = 0, toastT = 0;
  const rand = (a, b) => a + Math.random() * (b - a);
  const bestKey = () => 'qmhy:chem-' + (CF.phamVi || 'h2') + '-' + maNhom + ':best';
  const readBest = () => { try { return +localStorage.getItem(bestKey()) || 0; } catch (e) { return 0; } };
  const saveBest = v => { try { localStorage.setItem(bestKey(), v); } catch (e) {} };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = field.clientWidth; H = field.clientHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.max(30, Math.min(44, W * 0.085));
  }
  new ResizeObserver(resize).observe(field);

  /* ===== ÂM THANH: tự tổng hợp bằng Web Audio, không cần file mp3 ===== */
  const MUTE_KEY = 'qm-am-hieu-ung';
  let AC = null, master = null, muted = (() => { try { return localStorage.getItem(MUTE_KEY) === '0'; } catch (e) { return false; } })();
  function ac() {
    if (!AC) {
      const C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
      AC = new C(); master = AC.createGain(); master.gain.value = muted ? 0 : 0.6; master.connect(AC.destination);
    }
    if (AC.state === 'suspended') AC.resume();
    return AC;
  }
  function tone(f, dur, type = 'sine', vol = .3, f2 = null, delay = 0) {
    const a = ac(); if (!a || muted) return;
    const t = a.currentTime + delay, o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(dur, vol = .3, f1 = 800, f2 = 3000, delay = 0) {
    const a = ac(); if (!a || muted) return;
    const t = a.currentTime + delay, n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    const src = a.createBufferSource(), bp = a.createBiquadFilter(), g = a.createGain();
    src.buffer = buf; bp.type = 'bandpass'; bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(f1, t); bp.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(bp); bp.connect(g); g.connect(master); src.start(t);
  }
  const sfx = {
    whoosh() { noise(.18, .25, 600, 4000); },
    splat() { noise(.12, .35, 1800, 400); tone(180, .1, 'triangle', .25, 90); },
    correct(c) { const k = Math.pow(2, Math.min(c - 1, 8) / 12); tone(660 * k, .12, 'triangle', .3); tone(990 * k, .22, 'triangle', .25, null, .08); },
    wrong() { tone(150, .35, 'sawtooth', .22, 80); tone(156, .35, 'square', .1, 82); },
    miss() { tone(130, .3, 'sine', .45, 45); noise(.15, .15, 300, 120); },
    tick(hi) { tone(hi ? 1320 : 990, .05, 'square', .12); },
    beat(fast) { tone(70, .14, 'sine', fast ? .55 : .4, 40); tone(62, .12, 'sine', fast ? .45 : .3, 38, .17); },
    start() { [523, 659, 784].forEach((f, i) => tone(f, .14, 'triangle', .28, null, i * .1)); },
    end(best) { (best ? [523, 659, 784, 1047] : [523, 440, 349, 262]).forEach((f, i) => tone(f, .22, 'triangle', .3, null, i * .15)); }
  };
  function setMute(m) {
    muted = m; try { localStorage.setItem(MUTE_KEY, m ? '0' : '1'); } catch (e) {}
    if (master) master.gain.value = m ? 0 : 0.6;
    $('cc-mute').textContent = m ? '🔇' : '🔊';
  }

  /* ===== ĐỀ BÀI ===== */
  const promptHTML = k => `<div class="vi">${esc(MEAN[k].vi)}</div><div class="note">${MEAN[k].note ? esc(MEAN[k].note) : '&nbsp;'}</div>`;
  let bag = [];
  function newPrompt() {
    if (!bag.length) {
      bag = shuffle(KEYS);
      if (cur && bag[bag.length - 1] === cur.k) [bag[0], bag[bag.length - 1]] = [bag[bag.length - 1], bag[0]];
    }
    const k = bag.pop();
    cur = { k };
    pid++;
    const p = $('cc-prompt');
    p.innerHTML = promptHTML(k);
    p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop');
    fruits.forEach(f => f.alive = false);
  }

  /* ===== TUNG QUẢ ===== */
  const level = () => Math.floor(hits / 4);
  const gravity = () => H * Math.min(1.5, 0.9 + 0.06 * level());
  function spawnWave() {
    const n = level() >= 3 ? 4 : 3;
    const keys = shuffle([cur.k, ...shuffle(CONF[cur.k]).slice(0, n - 1)]);
    const g = gravity();
    keys.forEach((k, i) => {
      const x = W * (0.14 + 0.72 * (i + 0.5) / n) + rand(-12, 12);
      const h = H * rand(0.52, 0.8);
      fruits.push({
        k, pid, x, y: H + R, r: R * (k.length >= 3 ? 1.22 : 1), vx: (W / 2 - x) * rand(0.1, 0.35), vy: -Math.sqrt(2 * g * h),
        wait: i * rand(0.12, 0.3), alive: true, fade: 0, wob: rand(0, 6),
        look: FRUITS[Math.floor(Math.random() * FRUITS.length)]
      });
    });
  }

  /* ===== CHÉM ===== */
  function segDist(px, py, ax, ay, bx, by) {
    const dx = bx - ax, dy = by - ay, L = dx * dx + dy * dy;
    let t = L ? ((px - ax) * dx + (py - ay) * dy) / L : 0; t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
  }
  function slice(f, ang) {
    f.dead = true;
    const ok = f.alive && f.k === cur.k && f.pid === pid;
    const nx = -Math.sin(ang), ny = Math.cos(ang);
    [-1, 1].forEach(side => halves.push({ x: f.x, y: f.y, vx: f.vx + nx * side * 90, vy: Math.min(f.vy, 0) * 0.3 + ny * side * 90,
      ang, rot: 0, vr: side * rand(2, 4), side, look: f.look, k: f.k, r: f.r, grey: !ok }));
    for (let i = 0; i < 12; i++) parts.push({ x: f.x, y: f.y, vx: rand(-220, 220), vy: rand(-260, 80), life: rand(.35, .6), t: 0,
      col: ok ? f.look.flesh : '#cfc6b6', r: rand(2, 5) });
    sfx.splat();
    if (!f.alive) return;
    if (ok) {
      combo++; hits++; maxCombo = Math.max(maxCombo, combo);
      logIt(cur.k, f.k, true);
      const gain = 10 + Math.min(combo - 1, 4) * 5;
      score += gain;
      floats.push({ x: f.x, y: f.y - R, text: '+' + gain, col: '#0b5a2a', t: 0 });
      sfx.correct(combo);
      newPrompt();
    } else {
      combo = 0; wrongs++; lives--;
      logIt(cur.k, f.k, false);
      mistakes.push({ k: cur.k, pick: f.k });
      floats.push({ x: f.x, y: f.y - R, text: 'Sai', col: '#b31916', t: 0 });
      sfx.wrong();
      toast(`“${esc(MEAN[cur.k].vi)}” là <span class="hanzi">${cur.k}</span> (${esc(P[cur.k].py)}), không phải <span class="hanzi">${f.k}</span>`);
    }
    hud();
  }
  function logIt(k, pick, ok) {
    log.push({ stt: log.length + 1, dang: 'Chém chữ Hán', cauHoi: MEAN[k].vi + (MEAN[k].note ? ' (' + MEAN[k].note + ')' : ''), dapAn: k, chon: pick || '(để rơi)', dung: ok });
  }
  function missed() {
    combo = 0; misses++; lives--; sfx.miss();
    logIt(cur.k, '', false);
    mistakes.push({ k: cur.k, pick: null });
    toast(`Để rơi mất <span class="hanzi">${cur.k}</span> (${esc(P[cur.k].py)})`);
    newPrompt(); hud();
  }
  let down = false, lx = 0, ly = 0, swung = false, sx0 = 0, sy0 = 0;
  function pt(e) { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
  cv.addEventListener('pointerdown', e => { down = true; swung = false; [sx0, sy0] = pt(e); [lx, ly] = pt(e); trail = [{ x: lx, y: ly, t: performance.now() }]; cv.setPointerCapture(e.pointerId); });
  cv.addEventListener('pointermove', e => {
    if (!down || state !== 'play' || paused) return;
    const [x, y] = pt(e), now = performance.now();
    trail.push({ x, y, t: now });
    if (!swung && Math.hypot(x - sx0, y - sy0) > 40) { swung = true; sfx.whoosh(); }
    if (Math.hypot(x - lx, y - ly) > 4) {
      const ang = Math.atan2(y - ly, x - lx);
      // cùng một nhát trúng cả quả đúng lẫn quả sai thì xét quả đúng trước, quả sai lúc đó đã tan nên không bị trừ mạng
      fruits.filter(f => !f.dead && f.wait <= 0 && segDist(f.x, f.y, lx, ly, x, y) < f.r)
        .sort((a, b) => (b.k === cur.k) - (a.k === cur.k))
        .forEach(f => slice(f, ang));
    }
    lx = x; ly = y;
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(n => cv.addEventListener(n, () => down = false));

  /* ===== VÒNG LẶP ===== */
  function step(t) {
    const dt = Math.min(0.033, (t - lastT) / 1000 || 0); lastT = t;
    if (state === 'play' && !paused) update(dt);
    draw(t);
    requestAnimationFrame(step);
  }
  let lastSec = 60, beatT = 0;
  function update(dt) {
    timeLeft -= dt;
    const sec = Math.ceil(timeLeft);
    if (sec !== lastSec) { lastSec = sec; if (sec <= 10 && sec > 0) sfx.tick(sec <= 3); }
    if ((beatT -= dt) <= 0) { const fast = timeLeft <= 10 || lives === 1; sfx.beat(fast); beatT = fast ? 0.5 : 0.85; }
    const g = gravity();
    fruits.forEach(f => {
      if (f.wait > 0) { f.wait -= dt; return; }
      f.x += f.vx * dt; f.y += f.vy * dt; f.vy += g * dt;
      if (!f.alive) f.fade += dt;
      if (f.alive && f.vy > 0 && f.y > H + R * 1.2) {
        f.dead = true;
        if (f.k === cur.k && f.pid === pid) missed();
      }
    });
    fruits = fruits.filter(f => !f.dead && f.fade < 0.3);
    halves.forEach(h => { h.x += h.vx * dt; h.y += h.vy * dt; h.vy += g * dt; h.rot += h.vr * dt; });
    halves = halves.filter(h => h.y < H + R * 2);
    parts.forEach(p => { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 600 * dt; });
    parts = parts.filter(p => p.t < p.life);
    floats.forEach(f => { f.t += dt; f.y -= 40 * dt; });
    floats = floats.filter(f => f.t < 0.8);
    if (!fruits.length) {
      nextWave -= dt;
      if (nextWave <= 0) { spawnWave(); nextWave = 0.45; }
    }
    if (toastT > 0 && (toastT -= dt) <= 0) $('cc-toast').classList.remove('show');
    if (lives <= 0 || timeLeft <= 0) { timeLeft = Math.max(0, timeLeft); end(); }
    hud();
  }
  function drawFruit(f) {
    const r = f.r;
    ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2);
    const gr = ctx.createRadialGradient(-r * .35, -r * .4, r * .1, 0, 0, r);
    gr.addColorStop(0, f.look.hi); gr.addColorStop(1, f.look.rim);
    ctx.fillStyle = gr; ctx.fill();
    ctx.save(); ctx.translate(r * .35, -r * .9); ctx.rotate(-.6);
    ctx.beginPath(); ctx.ellipse(0, 0, r * .28, r * .12, 0, 0, Math.PI * 2); ctx.fillStyle = '#3f8f3a'; ctx.fill(); ctx.restore();
    ctx.beginPath(); ctx.arc(0, 0, r * .72, 0, Math.PI * 2);
    ctx.fillStyle = '#fffaf0'; ctx.fill();
    ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(0,0,0,.08)'; ctx.stroke();
    const fs = r * ([0, .8, .52, .37, .3][f.k.length] || .26);
    ctx.font = `700 ${fs}px "Noto Serif SC", serif`;
    ctx.fillStyle = '#b31916'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(f.k, 0, r * .04);
  }
  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    fruits.forEach(f => {
      if (f.wait > 0) return;
      ctx.save(); ctx.globalAlpha = f.alive ? 1 : Math.max(0, 1 - f.fade / 0.3);
      ctx.translate(f.x, f.y); ctx.rotate(Math.sin(t / 400 + f.wob) * 0.08);
      drawFruit(f); ctx.restore();
    });
    halves.forEach(h => {
      ctx.save(); ctx.translate(h.x, h.y); ctx.rotate(h.rot);
      ctx.rotate(h.ang); ctx.beginPath(); ctx.rect(-h.r * 1.3, h.side < 0 ? -h.r * 1.3 : 0, h.r * 2.6, h.r * 1.3); ctx.clip();
      ctx.fillStyle = h.look.flesh; ctx.fillRect(-h.r, h.side < 0 ? -3 : 0, h.r * 2, 3);
      ctx.rotate(-h.ang);
      if (h.grey) ctx.filter = 'grayscale(1)';
      drawFruit(h); ctx.restore();
    });
    parts.forEach(p => { ctx.globalAlpha = 1 - p.t / p.life; ctx.fillStyle = p.col; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); });
    ctx.globalAlpha = 1;
    floats.forEach(f => { ctx.globalAlpha = 1 - f.t / 0.8; ctx.fillStyle = f.col; ctx.font = '800 22px Quicksand, sans-serif'; ctx.textAlign = 'center'; ctx.fillText(f.text, f.x, f.y); });
    ctx.globalAlpha = 1;
    const now = performance.now();
    trail = trail.filter(p => now - p.t < 140);
    for (let i = 1; i < trail.length; i++) {
      const a = trail[i - 1], b = trail[i], k = 1 - (now - b.t) / 140;
      ctx.strokeStyle = `rgba(226,173,40,${k})`; ctx.lineWidth = 2 + 6 * k; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
    }
  }

  /* ===== GIAO DIỆN ===== */
  function hud() {
    $('cc-lives').innerHTML = Array.from({ length: LIVES }, (_, i) => `<span class="${i < lives ? '' : 'lost'}">♥</span>`).join('');
    const s = Math.ceil(timeLeft); $('cc-time').textContent = s + ' giây';
    $('cc-time').classList.toggle('low', s <= 10);
    $('cc-score').textContent = score + ' điểm';
  }
  function toast(html) { const el = $('cc-toast'); el.innerHTML = html; el.classList.add('show'); toastT = 1.6; }
  let batDauLuc = 0;
  function start() {
    if (!D) return;
    const st = $('cc-start');
    if (!st.hidden && window.QM_DIEM) hs = QM_DIEM.docNhap(st);
    log = []; maxCombo = 0;
    fruits = []; halves = []; parts = []; floats = []; mistakes = [];
    score = 0; lives = LIVES; timeLeft = ROUND_TIME; combo = 0; hits = wrongs = misses = 0;
    cur = null; bag = []; newPrompt(); nextWave = 0.5;
    $('cc-start').hidden = true; $('cc-end').hidden = true;
    $('cc-toast').classList.remove('show');
    lastSec = ROUND_TIME; beatT = 0.6; batDauLuc = Date.now();
    ac(); sfx.start();
    state = 'play'; selBai.disabled = true; hud();
    const h = document.querySelector('.sh-header'), cao = h ? h.getBoundingClientRect().height : 0, r = goc.querySelector('.cc-game').getBoundingClientRect();
    if (r.top < cao || field.getBoundingClientRect().bottom > window.innerHeight) window.scrollTo({ top: r.top + window.scrollY - cao - 6, behavior: 'smooth' });
  }
  function end() {
    state = 'over'; selBai.disabled = false; $('cc-toast').classList.remove('show');
    const cu = readBest(), best = Math.max(cu, score), isNew = score > 0 && score > cu;
    saveBest(best);
    sfx.end(isNew);
    const seen = new Set(), list = mistakes.filter(m => { if (seen.has(m.k)) return false; seen.add(m.k); return true; });
    $('cc-end').innerHTML = `<div class="cc-panel">
      <p>${lives <= 0 ? 'Hết mạng' : 'Hết giờ'}</p>
      <div class="cc-big">${score}</div><p>điểm${hs && hs.hoTen ? ' · ' + esc(hs.hoTen) + (hs.lop ? ', lớp ' + esc(hs.lop) : '') : ''}</p>
      <div class="dd-khu"></div>
      <div class="cc-stats"><span><b>${hits}</b>chém đúng</span><span><b>${wrongs}</b>chém nhầm</span><span><b>${misses}</b>để rơi</span></div>
      <p class="cc-best">${isNew ? '🏆 Kỷ lục mới trên máy này!' : 'Kỷ lục trên máy này: ' + best + ' điểm'}</p>
      ${list.length ? `<ul class="cc-miss">${list.map(m => `<li>“${esc(MEAN[m.k].vi)}” là <span class="hanzi">${m.k}</span> (${esc(P[m.k].py)})${m.pick ? `, em chém <span class="hanzi">${m.pick}</span>` : ', em để rơi'}. ${esc(P[m.k].why)}</li>`).join('')}</ul>` : ''}
      <button class="btn solid" id="cc-again">↻ Chơi lại</button></div>`;
    $('cc-end').hidden = false;
    $('cc-again').onclick = start;
    const n = NHOM.find(x => x.ma === maNhom);
    if (window.QM_DIEM) QM_DIEM.gui({ lesson: QM_DIEM.maBai((CF.maDiem == null ? 'h2' : CF.maDiem), n.tongHop ? (CF.tongHopDiem || 'tong-hop-bai0') : n.diem, 'chem-chu'),
      lessonTitle: (CF.tenDiem || '') + n.ten + ' · Chém chữ Hán', score, total: ROUND_TIME * 30, bestStreak: maxCombo,
      durationSeconds: (Date.now() - batDauLuc) / 1000, chiTiet: log, hoTen: hs ? hs.hoTen : '', lop: hs ? hs.lop : '',
      linkBxh: (CF.bxh || 'bang-xep-hang.html') + '?tro=chem-chu&bai=' + maNhom }, $('cc-end').querySelector('.dd-khu'));
  }

  function manBatDau() {
    $('cc-end').hidden = true;
    $('cc-start').hidden = false;
    $('cc-start').innerHTML = `<div class="cc-panel">
      <h2>Chém chữ Hán · ${esc(D.ten)}</h2>
      <ul class="cc-rules">
        <li><svg width="40" height="40" viewBox="0 0 40 40"><rect x="3" y="8" width="34" height="24" rx="8" fill="#eaf8ef" stroke="#0b5a2a" stroke-width="2"/><text x="20" y="25" text-anchor="middle" font-size="12" font-weight="700" fill="#0b5a2a">Aa</text></svg><span>Đề là nghĩa tiếng Việt. Dòng chữ nhỏ giúp phân biệt các từ gần nghĩa.</span></li>
        <li><svg width="40" height="40" viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" fill="#f08a24"/><circle cx="20" cy="20" r="11" fill="#fffaf0"/><path d="M4 34 L36 6" stroke="#e2ad28" stroke-width="4" stroke-linecap="round"/></svg><span>Vuốt qua quả có chữ Hán đúng nghĩa để chém.</span></li>
        <li><svg width="40" height="40" viewBox="0 0 40 40"><text x="20" y="28" text-anchor="middle" font-size="24" fill="#b31916">♥</text></svg><span>${LIVES} mạng, ${ROUND_TIME} giây. Chém nhầm hoặc để rơi quả đúng thì mất 1 mạng.</span></li>
      </ul>
      ${window.QM_DIEM ? QM_DIEM.oNhap() : ''}
      ${readBest() ? `<p class="cc-best">Kỷ lục trên máy này: ${readBest()} điểm</p>` : ''}
      <button class="btn gold" id="cc-go">▶ Bắt đầu</button></div>`;
    $('cc-go').onclick = start;
    $('cc-start').querySelectorAll('input').forEach(i => i.addEventListener('keydown', e => { if (e.key === 'Enter') start(); }));
    $('cc-prompt').innerHTML = promptHTML(KEYS[0]);
    hud();
  }
  function moNhom() {
    state = 'idle';
    const n = NHOM.find(x => x.ma === maNhom);
    $('cc-start').hidden = false; $('cc-end').hidden = true;
    $('cc-start').innerHTML = '<div class="cc-panel"><div class="tv-trong">Đang tải từ vựng…</div></div>';
    tai(n).then(d => {
      if (maNhom !== n.ma) return;
      ({ P, CONF, MEAN, TRANH } = d); KEYS = Object.keys(P);
      D = { ten: n.ten };
      ROUND_TIME = Math.max(60, Math.ceil(KEYS.length * SEC_PER_WORD / 5) * 5); timeLeft = ROUND_TIME;
      fruits = []; halves = []; parts = []; floats = [];
      manBatDau();
    }).catch(() => { $('cc-start').innerHTML = '<div class="cc-panel"><div class="tv-trong">Chưa tải được dữ liệu, bạn kiểm tra mạng rồi thử lại nhé.</div></div>'; });
  }
  selBai.addEventListener('change', () => {
    if (state === 'play') return;
    maNhom = selBai.value;
    history.replaceState(null, '', '?bai=' + maNhom);
    moNhom();
  });

  setMute(muted);
  $('cc-mute').onclick = () => { ac(); setMute(!muted); };
  document.addEventListener('visibilitychange', () => { paused = document.hidden; });
  moNhom();
  (document.fonts ? document.fonts.load('700 40px "Noto Serif SC"', '我你他她它们') : Promise.resolve())
    .catch(() => {}).finally(() => requestAnimationFrame(t => { lastT = t; step(t); }));
})();
