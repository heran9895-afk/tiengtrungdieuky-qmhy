const { chromium } = require('playwright');
const fs = require('fs');
// Cách dùng: node tools/video/quay.js <mã từ, vd 1-0002> <thư mục ra>
// Chạy khi web đang phục vụ ở http://localhost:8765 (python3 -m http.server 8765 tại gốc kho)
const MA = process.argv[2]; const OUT = process.argv[3];
const CAP = MA.split('-')[0] === '79' ? '7-9' : MA.split('-')[0];
const VI_TRI = parseInt(MA.split('-')[1], 10) - 1;
const KHO = JSON.parse(require('fs').readFileSync(require('path').resolve(__dirname, '../../data/tu-vung/cap-' + CAP + '.json')));
const TU = KHO.find(w => w['Mã'] === MA); if (!TU) { console.error('Không có mã', MA); process.exit(1); }
const HAN = TU['Chữ Hán'];
fs.mkdirSync(OUT + '/frames', { recursive: true });
const BLUR = `
.logo-block,.contact-block,.tk-nut,.slogan-teacher,.sf-brand,.sf-social,.tk-nhan-co,.sf-end{filter:blur(9px)!important;pointer-events:none}
body::after{filter:blur(10px)!important}
#tap{position:fixed;width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(30,30,30,.28);border:2px solid rgba(255,255,255,.85);z-index:99999;pointer-events:none;transform:scale(.4);opacity:0;transition:transform .18s ease-out,opacity .35s ease-out}
#tap.on{transform:scale(1);opacity:1}
`;
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 1920 / 812, isMobile: true, hasTouch: true });
  await ctx.addInitScript(() => {
    window.__log = []; window.__busy = false;
    const O = window.Audio;
    window.Audio = function (u) { const a = new O(u); window.__busy = true;
      a.addEventListener('playing', () => window.__log.push({ src: a.src, t: Date.now() }));
      ['ended', 'error', 'pause'].forEach(ev => a.addEventListener(ev, () => { window.__busy = false; }));
      return a; };
    window.Audio.prototype = O.prototype;
  });
  const HW = process.env.HW || require('path').resolve('hw/node_modules');  // npm i hanzi-writer@3.5.0 hanzi-writer-data@2.0.1
  await ctx.route(/cdn\.jsdelivr\.net\/npm\/hanzi-writer/, r => {
    const u = decodeURIComponent(r.request().url());
    if (u.includes('hanzi-writer-data')) { const ch = u.split('/').pop(); return r.fulfill({ path: HW + '/hanzi-writer-data/' + ch, contentType: 'application/json' }); }
    return r.fulfill({ path: HW + '/hanzi-writer/dist/hanzi-writer.min.js', contentType: 'application/javascript' });
  });
  const p = await ctx.newPage();
  await p.goto('http://localhost:8765/thu-vien/tu-vung/index.html', { waitUntil: 'networkidle' });
  await p.addStyleTag({ content: BLUR });
  await p.evaluate(() => { const d = document.createElement('div'); d.id = 'tap'; document.body.appendChild(d); });
  // chọn cấp, cuộn tới hàng nút cấp như video mẫu
  if (CAP !== '1') { await p.click(`[data-cap="${CAP}"]`); await p.waitForTimeout(800); }
  await p.evaluate(() => { const n = document.querySelector('.tv-note'); window.scrollTo(0, n.getBoundingClientRect().top + scrollY - 70); });
  await p.waitForTimeout(1200);

  const cdp = await ctx.newCDPSession(p);
  const frames = [];
  cdp.on('Page.screencastFrame', async f => {
    const i = frames.length; const fn = `${OUT}/frames/${String(i).padStart(5, '0')}.jpg`;
    fs.writeFileSync(fn, Buffer.from(f.data, 'base64'));
    frames.push({ fn, t: f.metadata.timestamp * 1000 });
    try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }); } catch (e) {}
  });
  const t0 = Date.now();
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 888, maxHeight: 1920 });
  // keep frames flowing even when static
  await p.evaluate(() => { const k = document.createElement('div'); k.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;opacity:.01;z-index:99999'; document.body.appendChild(k); let x = 0; setInterval(() => { x ^= 1; k.style.background = x ? '#000' : '#fff'; }, 33); });

  const W = ms => p.waitForTimeout(ms);
  async function tap(loc) {
    await loc.scrollIntoViewIfNeeded().catch(() => {});
    const bb = await loc.boundingBox(); const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
    await p.evaluate(([x, y]) => { const d = document.getElementById('tap'); d.style.left = x + 'px'; d.style.top = y + 'px'; d.classList.add('on'); setTimeout(() => d.classList.remove('on'), 380); }, [x, y]);
    await W(150);
    await loc.click({ force: true });
  }
  async function waitAudio(extra) {
    await W(250);
    await p.waitForFunction(() => !window.__busy, null, { timeout: 8000 }).catch(() => {});
    await W(extra);
  }
  // cuộn phần tử ra giữa CHỈ trong khung cuộn của thẻ (thẻ ngắn không cuộn thì để yên, không xê dịch trang)
  const cuonGiua = (el) => p.evaluate(e => {
    let c = e.parentElement; while (c && !(c.scrollHeight > c.clientHeight + 2 && /auto|scroll/.test(getComputedStyle(c).overflowY))) c = c.parentElement;
    if (!c) return; const r = e.getBoundingClientRect(), rc = c.getBoundingClientRect();
    c.scrollBy({ top: (r.top + r.height / 2) - (rc.top + rc.height / 2), behavior: 'smooth' });
  }, el);
  async function smoothTo(sel) {
    await cuonGiua(await p.$(sel));
    await W(900);
  }

  await W(1500);
  let the;
  if (VI_TRI <= 3) the = p.locator(`.tv-the[data-i="${VI_TRI}"]`);
  else {   // từ nằm sâu trong danh sách: gõ vào ô tìm rồi bấm thẻ
    await tap(p.locator('.tv-tim')); await W(300);
    await p.locator('.tv-tim').pressSequentially(HAN, { delay: 180 }); await W(1200);
    the = p.locator('.tv-the').filter({ has: p.locator('.tv-han', { hasText: new RegExp('^' + HAN + '$') }) }).first();
  }
  await tap(the);                                    // mở thẻ từ
  await W(1500);
  const hop = p.locator('.tv-hop');
  await tap(hop.locator('.tv-loa').first()); await waitAudio(700);   // big speaker
  await tap(hop.locator('.tv-loa').first()); await waitAudio(900);   // again
  const but = hop.locator('.tv-but-o');                                  // thuận bút: bấm từng ô
  for (let i = 0; i < await but.count(); i++) { await tap(but.nth(i)); await W(4600); }
  const cum = hop.locator('.tv-cum li');
  for (let i = 0; i < await cum.count(); i++) {
    await tap(cum.nth(i).locator('.tv-mo-py')); await W(350);
    await tap(cum.nth(i).locator('.tv-loa')); await waitAudio(700);
  }
  await smoothTo('.tv-hop .tv-cau');
  const cau = hop.locator('.tv-cau li');
  for (let i = 0; i < await cau.count(); i++) {
    await tap(cau.nth(i).locator('.tv-mo-py')); await W(250);
    await cuonGiua(await cau.nth(i).elementHandle()); await W(600);
    await tap(cau.nth(i).locator('.tv-loa')); await waitAudio(1300);
  }
  await W(1200);
  await cdp.send('Page.stopScreencast');
  const tEnd = Date.now();
  const log = await p.evaluate(() => window.__log);
  fs.writeFileSync(`${OUT}/meta.json`, JSON.stringify({ t0, tEnd, frames, log }, null, 1));
  console.log('frames', frames.length, 'dur', (tEnd - t0) / 1000, 'audio', log.length);
  await b.close();
})();
