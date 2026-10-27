/* =========================================================
   CÂU HỎI DÙNG CHUNG CHO TRÒ CHƠI · Tiếng Trung Diệu Kỳ
   Bắn bóng bay (ban-bong-bay.js) và trò chơi cả lớp (tro-choi-lop.js) cùng dùng file này:
   tách pinyin, tải dữ liệu bài, sinh câu hỏi + đáp án nhiễu, âm thanh hiệu ứng.
   Nhúng SAU tu-vung-chung.js, TRƯỚC file trò chơi. Mọi thứ nằm trong window.QM_CH.
   ========================================================= */
(function () {
  var TV = window.QM_TV;
  if (!TV) return;
  var esc = TV.esc;
  // =========================================================
  // 1. PINYIN: tách âm tiết, thanh mẫu, vận mẫu, đặt dấu thanh
  // =========================================================
  // Bảng âm tiết hợp lệ (viết như chính tả, v = ü)
  var AM_TIET = ('a ai an ang ao e ei en eng er o ou ' +
    'ba bai ban bang bao bei ben beng bi bian biao bie bin bing bo bu ' +
    'pa pai pan pang pao pei pen peng pi pian piao pie pin ping po pou pu ' +
    'ma mai man mang mao me mei men meng mi mian miao mie min ming miu mo mou mu ' +
    'fa fan fang fei fen feng fo fou fu ' +
    'da dai dan dang dao de dei den deng di dian diao die ding diu dong dou du duan dui dun duo ' +
    'ta tai tan tang tao te teng ti tian tiao tie ting tong tou tu tuan tui tun tuo ' +
    'na nai nan nang nao ne nei nen neng ni nian niang niao nie nin ning niu nong nou nu nuan nuo nv nve ' +
    'la lai lan lang lao le lei leng li lia lian liang liao lie lin ling liu lo long lou lu luan lun luo lv lve ' +
    'ga gai gan gang gao ge gei gen geng gong gou gu gua guai guan guang gui gun guo ' +
    'ka kai kan kang kao ke kei ken keng kong kou ku kua kuai kuan kuang kui kun kuo ' +
    'ha hai han hang hao he hei hen heng hong hou hu hua huai huan huang hui hun huo ' +
    'ji jia jian jiang jiao jie jin jing jiong jiu ju juan jue jun ' +
    'qi qia qian qiang qiao qie qin qing qiong qiu qu quan que qun ' +
    'xi xia xian xiang xiao xie xin xing xiong xiu xu xuan xue xun ' +
    'zha zhai zhan zhang zhao zhe zhei zhen zheng zhi zhong zhou zhu zhua zhuai zhuan zhuang zhui zhun zhuo ' +
    'cha chai chan chang chao che chen cheng chi chong chou chu chua chuai chuan chuang chui chun chuo ' +
    'sha shai shan shang shao she shei shen sheng shi shou shu shua shuai shuan shuang shui shun shuo ' +
    'ra ran rang rao re ren reng ri rong rou ru rua ruan rui run ruo ' +
    'za zai zan zang zao ze zei zen zeng zi zong zou zu zuan zui zun zuo ' +
    'ca cai can cang cao ce cen ceng ci cong cou cu cuan cui cun cuo ' +
    'sa sai san sang sao se sen seng si song sou su suan sui sun suo ' +
    'ya yan yang yao ye yi yin ying yo yong you yu yuan yue yun ' +
    'wa wai wan wang wei wen weng wo wu').split(' ');
  var CO_AM = {}; AM_TIET.forEach(function (s) { CO_AM[s] = 1; });
  var THANH_MAU = ['b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'zh', 'ch', 'sh', 'r', 'z', 'c', 's'];
  // Thanh mẫu dễ nhầm với nhau (dùng cho mức Trung bình, Khó)
  var TM_NHAM = {
    b: ['p', 'm', 'd', 'f'], p: ['b', 'f', 't', 'm'], m: ['n', 'b', 'f'], f: ['h', 'p', 'b'],
    d: ['t', 'n', 'l', 'b'], t: ['d', 'n', 'l', 'p'], n: ['l', 'm', 'd'], l: ['n', 'r', 'd'],
    g: ['k', 'h', 'd'], k: ['g', 'h', 't'], h: ['f', 'k', 'g'],
    j: ['q', 'x', 'zh', 'z'], q: ['j', 'x', 'ch', 'c'], x: ['s', 'sh', 'q', 'j'],
    zh: ['z', 'ch', 'j', 'sh'], ch: ['c', 'zh', 'q', 'sh'], sh: ['s', 'x', 'zh', 'ch'], r: ['l', 'sh', 'zh'],
    z: ['zh', 'c', 'j', 's'], c: ['ch', 'z', 'q', 's'], s: ['sh', 'x', 'c', 'z']
  };
  var DAU = { 'ā': 'a1', 'á': 'a2', 'ǎ': 'a3', 'à': 'a4', 'ē': 'e1', 'é': 'e2', 'ě': 'e3', 'è': 'e4',
    'ī': 'i1', 'í': 'i2', 'ǐ': 'i3', 'ì': 'i4', 'ō': 'o1', 'ó': 'o2', 'ǒ': 'o3', 'ò': 'o4',
    'ū': 'u1', 'ú': 'u2', 'ǔ': 'u3', 'ù': 'u4', 'ǖ': 'v1', 'ǘ': 'v2', 'ǚ': 'v3', 'ǜ': 'v4', 'ü': 'v0',
    'ń': 'n2', 'ň': 'n3', 'ǹ': 'n4' };
  var CO_DAU = { a: 'āáǎà', e: 'ēéěè', i: 'īíǐì', o: 'ōóǒò', u: 'ūúǔù', v: 'ǖǘǚǜ' };
  // Đường nét thanh điệu (theo thang 5 độ: 55, 35, 214, 51) vẽ trên bóng ở dạng Thanh điệu
  var DUONG_THANH = ['', 'M4 5 H36', 'M4 21 L36 5', 'M4 13 L16 23 Q20 25 24 21 L36 8', 'M4 5 L36 23'].map(function (d) {
    return d ? '<svg viewBox="0 0 40 28" width="40" height="28"><path d="' + d + '" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' : '';
  });

  // Đặt dấu thanh lên âm tiết gốc (v = ü): a/e trước, "ou" đặt trên o, còn lại đặt trên nguyên âm cuối
  function datDau(goc, thanh) {
    var i;
    if (thanh >= 1 && thanh <= 4) {
      if (goc.indexOf('a') >= 0) i = goc.indexOf('a');
      else if (goc.indexOf('e') >= 0) i = goc.indexOf('e');
      else if (goc.indexOf('ou') >= 0) i = goc.indexOf('o');
      else { for (var k = goc.length - 1; k >= 0; k--) if ('iouv'.indexOf(goc[k]) >= 0) { i = k; break; } }
    }
    var s = '';
    for (var j = 0; j < goc.length; j++) {
      var c = goc[j];
      if (j === i) s += CO_DAU[c][thanh - 1];
      else s += c === 'v' ? 'ü' : c;
    }
    return s;
  }
  function vietHoa(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function laChuHan(c) { return /[㐀-鿿]/.test(c); }

  // Tách một chuỗi pinyin của từ thành các âm tiết, giữ lại dấu ngăn (khoảng trắng, ·, ', ∥) để dựng lại.
  // soAm: số chữ Hán của từ (để chọn đúng cách tách). Trả về null nếu không tách được.
  function tachPinyin(py, soAm) {
    py = String(py || '').normalize('NFC');
    if (!py || /\//.test(py)) return null;
    var phan = [], cum = py.split(/([\s·'’∥\-]+)/);
    var tong = 0, ketQua = [];
    for (var ci = 0; ci < cum.length; ci++) {
      var c = cum[ci];
      if (!c) continue;
      if (/^[\s·'’∥\-]+$/.test(c)) { ketQua.push({ ngan: c }); continue; }
      var chu = [], thanh = [];
      for (var k = 0; k < c.length; k++) {
        var ch = c[k], hoa = ch !== ch.toLowerCase(), t = DAU[ch.toLowerCase()];
        if (t) { chu.push({ c: t[0], t: +t[1], hoa: hoa }); }
        else if (/[a-zA-Z]/.test(ch)) chu.push({ c: ch.toLowerCase(), t: 0, hoa: hoa });
        else return null;
      }
      phan.push({ chu: chu, viTri: ketQua.length }); ketQua.push(null);
    }
    // Tách từng cụm bằng quy hoạch động: âm tiết hợp lệ; âm tiết không đứng đầu cụm không bắt đầu bằng a/o/e (quy tắc dấu cách âm)
    function tach(chu) {
      var s = chu.map(function (x) { return x.c; }).join(''), n = s.length, dp = [[[]]];
      for (var i = 1; i <= n; i++) dp[i] = [];
      for (var i2 = 0; i2 < n; i2++) {
        if (!dp[i2].length) continue;
        for (var L = 1; L <= 6 && i2 + L <= n; L++) {
          var am = s.substr(i2, L);
          if (!CO_AM[am]) continue;
          if (i2 > 0 && /^[aoe]/.test(am)) continue;
          var dau = chu.slice(i2, i2 + L).filter(function (x) { return x.t; });
          if (dau.length > 1) continue;
          dp[i2].forEach(function (cach) { if (dp[i2 + L].length < 8) dp[i2 + L].push(cach.concat([{ goc: am, thanh: dau.length ? dau[0].t : 0, hoa: chu[i2].hoa }])); });
        }
      }
      return dp[n];
    }
    var cachTach = phan.map(function (p) { return tach(p.chu); });
    if (cachTach.some(function (x) { return !x.length; })) return null;
    // Ghép các cụm, chọn cách tách có tổng số âm tiết = số chữ Hán
    var chon = null;
    (function thu(i, da, dem) {
      if (chon) return;
      if (i === cachTach.length) { if (!soAm || dem === soAm) chon = da; return; }
      cachTach[i].slice().sort(function (a, b) { return a.length - b.length; }).forEach(function (c) { thu(i + 1, da.concat([c]), dem + c.length); });
    })(0, [], 0);
    if (!chon) return null;
    phan.forEach(function (p, i) { ketQua[p.viTri] = { am: chon[i] }; });
    var am = [];
    ketQua.forEach(function (k) { if (k.am) k.am.forEach(function (a) { am.push(a); }); });
    return { phan: ketQua, am: am };
  }
  // Dựng lại chuỗi pinyin sau khi thay một âm tiết
  function dungPinyin(tach, thay) {
    var s = '', i = 0;
    tach.phan.forEach(function (k) {
      if (k.ngan) { s += k.ngan; return; }
      k.am.forEach(function (a) {
        var b = thay && thay[i] ? thay[i] : a, chu = datDau(b.goc, b.thanh);
        s += a.hoa ? vietHoa(chu) : chu; i++;
      });
    });
    return s;
  }
  function tachAm(goc) {
    var m = goc.match(/^(zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])?(.*)$/);
    return { dau: m[1] || '', van: m[2] };
  }
  function chuanHoaPy(s) { return String(s || '').normalize('NFC').toLowerCase().replace(/[\s·'’∥\-]/g, ''); }
  function boThanh(s) { return chuanHoaPy(s).normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  // Chữ không đọc riêng được đúng âm trong từ (biến điệu, đa âm, trợ từ)
  var KHONG_DOC_RIENG = '不一了的个么哪谁地着得儿们吗呢吧啊';
  // Chữ đa âm: chỉ đọc riêng khi âm trong từ là âm chính (máy đọc chữ đứng một mình theo âm này)
  var AM_CHINH = { '好': 'hao3', '中': 'zhong1', '几': 'ji3', '少': 'shao3', '大': 'da4', '长': 'chang2', '行': 'xing2', '还': 'hai2',
    '都': 'dou1', '只': 'zhi3', '重': 'zhong4', '为': 'wei4', '和': 'he2', '觉': 'jue2', '乐': 'le4', '便': 'bian4', '相': 'xiang1',
    '教': 'jiao4', '种': 'zhong3', '发': 'fa1', '看': 'kan4', '分': 'fen1', '处': 'chu4', '空': 'kong1', '数': 'shu4', '差': 'cha4',
    '当': 'dang1', '难': 'nan2', '正': 'zheng4', '没': 'mei2', '要': 'yao4', '会': 'hui4', '上': 'shang4', '那': 'na4', '也': 'ye3',
    '弟': 'di4', '朝': 'chao2', '奇': 'qi2', '血': 'xue4', '车': 'che1', '假': 'jia3', '间': 'jian1', '应': 'ying1', '着': 'zhe0' };


  // =========================================================
  // 2. DỮ LIỆU: tải file bài → { tu, am, cau }
  // =========================================================
  var DA_TAI = {};     // khoá (danh sách file) → dữ liệu đã dựng
  function layJson(u) { return fetch(u).then(function (r) { if (!r.ok) throw r; return r.json(); }); }
  // tep: danh sách đường dẫn file JSON (mảng từ, hoặc đối tượng dữ liệu bài có khoá "tu", "cauLuyen", "tenRieng")
  function taiNguon(tep) {
    var k = tep.join('|');
    if (DA_TAI[k]) return DA_TAI[k];
    return (DA_TAI[k] = Promise.all(tep.map(layJson)).then(function (ds) {
      var tu = [], daCo = {}, cauLuyen = [], tenRieng = [];
      ds.forEach(function (d) {
        (Array.isArray(d) ? d : d.tu || []).forEach(function (r) {
          var han = (r['Chữ Hán'] || '').trim();
          if (!han || daCo[han]) return; daCo[han] = 1;
          tu.push({ han: han, py: (r['Pinyin'] || '').trim(), doc: (r['Đọc từ'] || '').trim(), nghia: (r['Nghĩa tiếng Việt'] || '').trim(),
            loai: (r['Từ loại'] || '').trim(),
            cum: (r['Cụm từ'] || '').split(/\n+/).map(function (x) { return x.split('|')[0].trim(); }).filter(Boolean),
            cau: [1, 2].map(function (n) { return { han: (r['Câu ' + n] || '').trim(), py: r['Pinyin câu ' + n] || '', viet: r['Nghĩa câu ' + n] || '', doc: r['Đọc câu ' + n] || '' }; })
              .filter(function (c) { return c.han && c.han.indexOf('\n') < 0; }) });     // câu hội thoại A：…\nB：… không dùng làm đề
        });
        if (!Array.isArray(d)) {
          (d.cauLuyen || []).forEach(function (c) { if (c.han) cauLuyen.push({ han: c.han, py: c.py || '', viet: c.viet || '', doc: c.doc || '', tu: c.tu || [] }); });
          tenRieng = tenRieng.concat(d.tenRieng || []);
        }
      });
      var dl = dungCau(tu);
      dl.cauLuyen = cauLuyen; dl.tenRieng = tenRieng;
      return dl;
    }));
  }
  // Từ điển chặn nhiễu Điền từ (chữ ghép với hai bên ra từ có thật): kho HSK 1–3 + từ, cụm của bài
  var TU_DIEN_HSK = null;
  function taiTuDien() {
    return TU_DIEN_HSK || (TU_DIEN_HSK = Promise.all(['1', '2', '3'].map(function (c) { return layJson(TV.ROOT + 'data/tu-vung/cap-' + c + '.json').catch(function () { return []; }); }))
      .then(function (ds) { var o = {}; ds.forEach(function (d) { d.forEach(function (r) { if (r['Chữ Hán']) o[r['Chữ Hán'].trim()] = 1; }); }); return o; }));
  }

  function dungCau(tu) {
    var am = [], daCoAm = {};
    tu.forEach(function (w) {
      var chu = w.han.split('').filter(laChuHan);
      w.tach = tachPinyin(w.py, chu.length);
      w.choDoc = w.doc !== '-';                     // "-" = máy đọc chưa chuẩn, chờ thu âm
      w.docTxt = w.doc && w.doc !== '-' ? w.doc : w.han;
      w.khoa = chuanHoaPy(w.py);
      // Từ một chữ thanh nhẹ (的, 了, 吗…) hoặc chữ đa âm đọc khác âm chính: máy đọc riêng dễ sai → không làm câu nghe từ
      if (w.tach && chu.length === 1 && !w.doc) {
        var a0 = w.tach.am[0];
        if (!a0.thanh || (AM_CHINH[chu[0]] && AM_CHINH[chu[0]] !== a0.goc + a0.thanh)) w.khongDocRieng = true;
      }
      if (!w.tach || !w.choDoc) return;
      if (/[儿]/.test(w.han) && w.tach.am.length !== chu.length) return;
      w.tach.am.forEach(function (a, i) {
        var c = chu[i];
        if (!a.thanh || KHONG_DOC_RIENG.indexOf(c) >= 0) return;
        if (AM_CHINH[c] && AM_CHINH[c] !== a.goc + a.thanh) return;
        var k = c + a.goc + a.thanh;
        if (daCoAm[k]) return; daCoAm[k] = 1;
        var t = tachAm(a.goc);
        am.push({ chu: c, goc: a.goc, thanh: a.thanh, dau: t.dau, van: t.van, tu: w, py: datDau(a.goc, a.thanh) });
      });
    });
    return { tu: tu, am: am };
  }

  // ---------- Tiện ích ngẫu nhiên ----------
  function tron(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function boc(a) { return a[Math.floor(Math.random() * a.length)]; }
  function khoangCach(a, b) {   // khoảng cách chỉnh sửa (Levenshtein)
    var d = []; for (var i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (var j = 1; j <= b.length; j++) d[0][j] = j;
    for (var i2 = 1; i2 <= a.length; i2++) for (var j2 = 1; j2 <= b.length; j2++)
      d[i2][j2] = Math.min(d[i2 - 1][j2] + 1, d[i2][j2 - 1] + 1, d[i2 - 1][j2 - 1] + (a[i2 - 1] === b[j2 - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  // Cặp vận mẫu dễ nhầm: tính gần hơn khoảng cách chữ
  var VM_NHAM = [['an', 'ang'], ['en', 'eng'], ['in', 'ing'], ['ian', 'iang'], ['uan', 'uang'], ['un', 'ong'], ['en', 'an'], ['eng', 'ong'],
    ['ou', 'uo'], ['ao', 'ou'], ['ie', 'ue'], ['ui', 'ei'], ['ai', 'ei'], ['iu', 'ou'], ['e', 'o'], ['i', 'u'], ['u', 'v'], ['ue', 've'],
    ['ia', 'ie'], ['ua', 'uo'], ['an', 'ian'], ['ang', 'iang'], ['ao', 'iao'], ['un', 'ün'], ['e', 'ei'], ['i', 'ie']];
  function doGan(v1, v2) {
    for (var i = 0; i < VM_NHAM.length; i++) { var p = VM_NHAM[i]; if ((p[0] === v1 && p[1] === v2) || (p[1] === v1 && p[0] === v2)) return 0.5; }
    return khoangCach(v1, v2);
  }
  // Âm tiết cùng chữ cái đầu (kể cả y, w, không phụ âm), xếp từ gần đến xa theo vận mẫu
  function amCungDau(goc) {
    var t = tachAm(goc);
    return AM_TIET.filter(function (s) { return s !== goc && tachAm(s).dau === t.dau; })
      .map(function (s) { return { goc: s, gan: doGan(t.van, tachAm(s).van) + Math.random() * 0.3 }; })
      .sort(function (a, b) { return a.gan - b.gan; }).map(function (x) { return x.goc; });
  }
  // Chọn n phần tử: mức Dễ lấy từ nửa xa, Trung bình 1 gần + còn lại ngẫu nhiên, Khó lấy gần nhất
  function chonTheoMuc(dsGan, n, muc) {
    if (!dsGan.length) return [];
    if (muc === 'kho') return tron(dsGan.slice(0, Math.max(n, Math.min(dsGan.length, n + 1)))).slice(0, n);
    if (muc === 'tb') { var dau = dsGan.slice(0, 2), mot = boc(dau), con = dsGan.filter(function (x) { return x !== mot; }); return [mot].concat(tron(con).slice(0, n - 1)); }
    var xa = dsGan.slice(Math.floor(dsGan.length / 2)); if (xa.length < n) xa = dsGan;
    return tron(xa).slice(0, n);
  }

  // =========================================================
  // 3. CÁC DẠNG CÂU HỎI
  // Mỗi dạng: lay(dl) → danh sách mục; cau(mục, muc, dl) → { doc, de, dung: {nhan, khoa}, nhieu: [{nhan, khoa}], giai }
  // =========================================================
  var MUC = {
    de: { ten: 'Dễ', bong: 3, giay: 10 },
    tb: { ten: 'Trung bình', bong: 4, giay: 7 },
    kho: { ten: 'Khó', bong: 5, giay: 5 }
  };
  function nhanAm(goc) { return datDau(goc, 0); }
  function giaiAm(a) {
    var tu = a.tu, s = '<span class="hanzi">' + esc(a.chu) + '</span> <b>' + esc(a.py) + '</b>';
    if (tu.han !== a.chu) s += ' <span class="bb-giai-tu">trong <span class="hanzi">' + esc(tu.han) + '</span> ' + esc(tu.py) + '</span>';
    else if (tu.nghia) s += ' <span class="bb-giai-tu">' + esc(tu.nghia) + '</span>';
    return s;
  }
  function giaiTu(w) { return '<span class="hanzi">' + esc(w.han) + '</span> <b>' + esc(w.py) + '</b>' + (w.nghia ? ' <span class="bb-giai-tu">' + esc(w.nghia) + '</span>' : ''); }

  var DANG = {
    thanhMau: {
      ten: 'Thanh mẫu', ico: '🅱️', de: 'Bắn bóng có <b>thanh mẫu</b> đúng',
      lay: function (dl) { return dl.am.filter(function (a) { return a.dau && a.dau !== 'y' && a.dau !== 'w'; }); },
      cau: function (a, muc, n) {
        var nham = (TM_NHAM[a.dau] || []).filter(function (x) { return x !== a.dau; });
        var khac = THANH_MAU.filter(function (x) { return x !== a.dau && nham.indexOf(x) < 0; });
        var chon;
        if (muc === 'kho') chon = tron(nham).concat(tron(khac)).slice(0, n);
        else if (muc === 'tb') chon = [boc(nham)].concat(tron(khac)).slice(0, n);
        else chon = tron(khac).slice(0, n);
        return { doc: a.chu, dung: { nhan: a.dau, khoa: a.dau }, nhieu: chon.map(function (x) { return { nhan: x, khoa: x }; }), giai: giaiAm(a), nho: true };
      }
    },
    vanMau: {
      ten: 'Vận mẫu', ico: '🔡', de: 'Bắn bóng có <b>vận mẫu</b> đúng',
      lay: function (dl) { return dl.am; },
      cau: function (a, muc, n) {
        var chon = chonTheoMuc(amCungDau(a.goc), n, muc);
        return { doc: a.chu, dung: { nhan: nhanAm(a.goc), khoa: a.goc }, nhieu: chon.map(function (g) { return { nhan: nhanAm(g), khoa: g }; }), giai: giaiAm(a) };
      }
    },
    thanhDieu: {
      ten: 'Thanh điệu', ico: '〰️', de: 'Bắn bóng có <b>thanh điệu</b> đúng',
      lay: function (dl) { return dl.am; },
      cau: function (a, muc, n) {
        var khac = tron([1, 2, 3, 4].filter(function (t) { return t !== a.thanh; })).slice(0, Math.min(n, 3));
        function nhan(t) { return '<span class="bb-ky" aria-hidden="true">' + DUONG_THANH[t] + '</span><small>Thanh ' + t + '</small>'; }
        return { doc: a.chu, dung: { nhan: nhan(a.thanh), khoa: 't' + a.thanh, sx: a.thanh },
          nhieu: khac.map(function (t) { return { nhan: nhan(t), khoa: 't' + t, sx: t }; }), giai: giaiAm(a), xepThu: true };
      }
    },
    vanThanh: {
      ten: 'Vận mẫu + thanh điệu', ico: '🎵', de: 'Bắn bóng có <b>vận mẫu và thanh điệu</b> đúng',
      lay: function (dl) { return dl.am; },
      cau: function (a, muc, n) {
        var cungAm = tron([1, 2, 3, 4].filter(function (t) { return t !== a.thanh; })).map(function (t) { return { goc: a.goc, thanh: t }; });
        var gan = amCungDau(a.goc);
        var ganCung = gan.slice(0, 3).map(function (g) { return { goc: g, thanh: a.thanh }; });
        var xa = gan.slice(3).map(function (g) { return { goc: g, thanh: 1 + Math.floor(Math.random() * 4) }; });
        var chon;
        if (muc === 'kho') chon = tron(cungAm.slice(0, 2).concat(ganCung.slice(0, 2))).concat(tron(cungAm.slice(2).concat(ganCung.slice(2))));
        else if (muc === 'tb') chon = [cungAm[0], ganCung[0]].filter(Boolean).concat(tron(xa));
        else chon = tron(xa.concat(gan.slice(3).map(function (g) { return { goc: g, thanh: a.thanh }; })));
        var daCo = {}; daCo[a.goc + a.thanh] = 1;
        chon = chon.filter(function (x) { var k = x.goc + x.thanh; if (daCo[k]) return false; daCo[k] = 1; return true; }).slice(0, n);
        return { doc: a.chu, dung: { nhan: a.py, khoa: a.goc + a.thanh }, nhieu: chon.map(function (x) { return { nhan: datDau(x.goc, x.thanh), khoa: x.goc + x.thanh }; }), giai: giaiAm(a) };
      }
    },
    phienAm: {
      ten: 'Phiên âm', ico: '🔤', de: 'Bắn bóng có <b>phiên âm</b> đúng',
      lay: function (dl) { return dl.tu.filter(function (w) { return w.tach && w.choDoc && !w.khongDocRieng; }); },
      cau: function (w, muc, n, dl) {
        var bien = bienTheTu(w, muc);
        var khacTu = tron(dl.tu.filter(function (x) { return x !== w && x.py && x.khoa !== w.khoa && !/\//.test(x.py); }));
        khacTu.sort(function (a, b) { return Math.abs((a.tach ? a.tach.am.length : 9) - w.tach.am.length) - Math.abs((b.tach ? b.tach.am.length : 9) - w.tach.am.length); });
        var tuNhieu = khacTu.map(function (x) { return x.py; });
        var ds;
        if (muc === 'kho') ds = bien.concat(tuNhieu);
        else if (muc === 'tb') ds = bien.slice(0, 2).concat(tron(tuNhieu.slice(0, 6)));
        else ds = tron(tuNhieu.slice(0, 8));
        var daCo = {}; daCo[w.khoa] = 1;
        ds = ds.filter(function (p) { var k = chuanHoaPy(p); if (daCo[k]) return false; daCo[k] = 1; return true; }).slice(0, n);
        return { doc: w.docTxt, dung: { nhan: w.py, khoa: w.khoa }, nhieu: ds.map(function (p) { return { nhan: p, khoa: chuanHoaPy(p) }; }), giai: giaiTu(w), dai: true };
      }
    },
    chuHan: {
      ten: 'Chữ Hán', ico: '✍️', de: 'Bắn bóng có <b>chữ Hán</b> đúng',
      lay: function (dl) { return dl.tu.filter(function (w) { return w.choDoc && !w.khongDocRieng; }); },
      cau: function (w, muc, n, dl) {
        // Không để từ đọc giống hệt (他 / 她 / 它) làm nhiễu: hai đáp án cùng đúng
        var khac = dl.tu.filter(function (x) { return x !== w && x.han !== w.han && x.khoa !== w.khoa; });
        var chung = khac.filter(function (x) { return x.han.split('').some(function (c) { return w.han.indexOf(c) >= 0; }) || boThanh(x.py) === boThanh(w.py); });
        var cungDai = khac.filter(function (x) { return x.han.length === w.han.length && chung.indexOf(x) < 0; });
        var ds;
        if (muc === 'kho') ds = tron(chung).concat(tron(cungDai), tron(khac));
        else if (muc === 'tb') ds = tron(chung).slice(0, 1).concat(tron(cungDai.concat(khac)));
        else ds = tron(khac.filter(function (x) { return chung.indexOf(x) < 0; })).concat(tron(khac));
        var daCo = {}; daCo[w.han] = 1;
        ds = ds.filter(function (x) { if (daCo[x.han]) return false; daCo[x.han] = 1; return true; }).slice(0, n);
        return { doc: w.docTxt, dung: { nhan: '<span class="hanzi">' + esc(w.han) + '</span>', khoa: w.han },
          nhieu: ds.map(function (x) { return { nhan: '<span class="hanzi">' + esc(x.han) + '</span>', khoa: x.han }; }), giai: giaiTu(w), han: true };
      }
    }
  };
  var THU_TU_DANG = ['thanhMau', 'vanMau', 'thanhDieu', 'vanThanh', 'phienAm', 'chuHan'];

  // Biến thể sai của pinyin một từ: đổi thanh (hoặc đổi âm ở mức Khó) một âm tiết
  function bienTheTu(w, muc) {
    var am = w.tach.am, chu = w.han.split('').filter(laChuHan), kq = [];
    am.forEach(function (a, i) {
      if (!a.thanh) return;                          // không đổi thanh nhẹ
      if ('一不'.indexOf(chu[i]) >= 0) return;       // 一, 不 biến điệu: không lấy làm nhiễu
      [1, 2, 3, 4].forEach(function (t) {
        if (t === a.thanh) return;
        if (a.thanh === 3 && t === 2 && am[i + 1] && am[i + 1].thanh === 3) return;   // thanh 3 + thanh 3: nghe ra thanh 2, không lấy làm nhiễu
        var thay = {}; thay[i] = { goc: a.goc, thanh: t }; kq.push({ p: dungPinyin(w.tach, thay), loai: 'thanh' });
      });
      if (muc === 'kho') amCungDau(a.goc).slice(0, 2).forEach(function (g) {
        var thay = {}; thay[i] = { goc: g, thanh: a.thanh }; kq.push({ p: dungPinyin(w.tach, thay), loai: 'am' });
      });
    });
    return tron(kq).map(function (x) { return x.p; });
  }


  // =========================================================
  // 3b. DẠNG CÂU CHO TRÒ CHƠI CẢ LỚP (chiếu lên màn hình, các đội chọn trên điện thoại)
  // Mỗi dạng: lay(dl) → danh sách mục; cau(mục, muc, n, dl) → { de, dung, nhieu, giai }
  //   de = { html (màn chiếu), txt (điện thoại), doc (máy đọc, nếu có), viet (gợi ý nghĩa câu) }
  // =========================================================
  // Nghĩa: tách cụm nghĩa để biết hai từ có trùng nghĩa không (cùng cách với phần luyện tập)
  function gonNghia(s) { return String(s).normalize('NFC').replace(/[^\p{L}\p{N} ]/gu, ' ').replace(/\s+/g, ' ').trim(); }
  function cumNghia(w) {
    if (w._cn) return w._cn;
    var t = String(w.nghia || '').toLowerCase().replace(/\([^)]*\)|（[^）]*）|\[[^\]]*\]/g, ' ');
    var ds = t.split(/[,;，；/]|[①-⑳]|\bvà\b/).map(gonNghia).filter(function (x) { return x.length >= 2; });
    return (w._cn = ds.length ? ds : [gonNghia(t)]);
  }
  function trungNghia(a, b) { var cb = cumNghia(b); return cumNghia(a).some(function (x) { return cb.indexOf(x) >= 0; }); }
  function loaiChinh(w) { var l = String(w.loai || '').split(/[\/,;(]/)[0].trim().toLowerCase(); return /^(đại từ|danh từ)/.test(l) ? 'danh' : l; }
  function lopTu(x) { var l = loaiChinh(x); return l === 'danh' ? 'D' : l === 'phó từ' ? 'P' : l === 'trợ từ' ? 'T' : l === 'động từ' ? 'V' : l === 'tính từ' ? 'A' : ''; }
  var KHONG_NHIEU = ['们', '不', '没', '没有'];
  function bocHanzi(s) { return '<span class="hanzi">' + esc(s) + '</span>'; }
  function nhanTu(x) { return { nhan: bocHanzi(x.han), txt: x.han, khoa: x.han }; }

  // Điền từ: câu của từ (2 câu ví dụ + câu kho có từ đó), đục mọi chỗ có từ; nhiễu khác từ loại và không ghép được với hai bên chỗ trống
  function dapAnNhieuDien(w, kho, loc) {
    var hop = kho.filter(function (x) { return x.han !== w.han && x.nghia && KHONG_NHIEU.indexOf(x.han) < 0 && !trungNghia(x, w) && (!loc || loc(x)); });
    var lw = loaiChinh(w), chon = [], daCo = {};
    tron(hop.filter(function (x) { return !(lw && loaiChinh(x) === lw); })).some(function (x) {
      if (daCo[x.han] || chon.some(function (y) { return trungNghia(x, y); })) return false;
      daCo[x.han] = 1; chon.push(x); return chon.length === 3;
    });
    return chon;
  }
  function hopLyDien(cau, w, kho, tuDien) {
    var h = cau.han, i = h.indexOf(w.han), trai = h.slice(0, i).replace(/[，。？！、：\s]+$/, ''), phai = h.slice(i + w.han.length);
    var theoHan = {}; kho.forEach(function (x) { if (!theoHan[x.han]) theoHan[x.han] = x; });
    var tuTrai = null, tuPhai = null;
    for (var L = Math.min(4, trai.length); L > 0 && !tuTrai; L--) tuTrai = theoHan[trai.slice(-L)] || null;
    for (var R = Math.min(4, phai.length); R > 0 && !tuPhai; R--) tuPhai = theoHan[phai.slice(0, R)] || null;
    var dauCau = !trai || /[，。？！：]$/.test(h.slice(0, i));
    var lw = lopTu(w), lp = tuPhai ? lopTu(tuPhai) : '', motMinh = !phai || /^[，。！？、：]/.test(phai);
    return function (x) {
      var l = lopTu(x);
      if (motMinh && dauCau) return l === 'P' || l === 'T';
      if ((lw === 'V' || lw === 'A') && (l === 'V' || l === 'A')) return false;
      if (tuTrai && lopTu(tuTrai) === 'D' && l === 'D') return false;
      if (dauCau && l === 'P') return false;
      if ((lp === 'V' || lp === 'A' || lp === 'P') && l === 'P') return false;
      if ((lp === 'D' || phai.charAt(0) === '的') && l === 'A') return false;
      var g = [trai ? trai.slice(-1) + x.han : '', phai ? x.han + phai.charAt(0) : '', tuTrai ? tuTrai.han + x.han : '', tuPhai ? x.han + tuPhai.han : ''];
      return !g.some(function (s) { return s && tuDien[s]; });
    };
  }
  // Dựng sẵn các câu Điền từ của bộ dữ liệu (cần từ điển HSK 1–3 → gọi chuanBiDien trước)
  function chuanBiDien(dl) {
    if (dl.dien) return Promise.resolve(dl.dien);
    return taiTuDien().then(function (hsk) {
      var tuDien = Object.assign({}, hsk);
      dl.tu.forEach(function (w) { tuDien[w.han] = 1; (w.cum || []).forEach(function (c) { tuDien[c] = 1; }); });
      var cauTheoTu = {};
      dl.cauLuyen.forEach(function (c) { c.tu.forEach(function (h) { (cauTheoTu[h] = cauTheoTu[h] || []).push(c); }); });
      var ds = [];
      dl.tu.forEach(function (w) {
        if (KHONG_NHIEU.indexOf(w.han) >= 0) return;
        var dai = dl.tu.filter(function (x) { return x.han.length > w.han.length && x.han.indexOf(w.han) >= 0; }).map(function (x) { return x.han; });
        var cau = (w.cau || []).concat(cauTheoTu[w.han] || []).filter(function (c, i, a) {
          return c.han.indexOf(w.han) >= 0 && !dai.some(function (d) { return c.han.indexOf(d) >= 0; }) &&
            (c.han.split(w.han).join('').match(/[㐀-鿿]/g) || []).length >= 2 && a.findIndex(function (x) { return x.han === c.han; }) === i;
        });
        var hop = cau.map(function (c) { return { cau: c, nhieu: dapAnNhieuDien(w, dl.tu, hopLyDien(c, w, dl.tu, tuDien)) }; })
          .filter(function (x) { return x.nhieu.length >= 2; });
        if (hop.length) ds.push({ w: w, cau: hop });
      });
      return (dl.dien = ds);
    });
  }

  var LOP = {
    ngheChu: {
      ten: 'Nghe chọn chữ Hán', ico: '🎧',
      lay: function (dl) { return DANG.chuHan.lay(dl); },
      cau: function (w, muc, n, dl) {
        var c = DANG.chuHan.cau(w, muc, n, dl);
        return { de: { html: '<div class="tl-de-nghe">🎧 Nghe và chọn chữ Hán đúng</div>', txt: '🎧 Nghe cô đọc, chọn chữ Hán đúng', doc: c.doc },
          dung: { nhan: c.dung.nhan, txt: w.han, khoa: c.dung.khoa }, nhieu: c.nhieu.map(function (x) { return { nhan: x.nhan, txt: x.khoa, khoa: x.khoa }; }),
          giai: c.giai, han: true, docGiai: w.docTxt };
      }
    },
    nghiaChu: {
      ten: 'Nghĩa → chữ Hán', ico: '✍️',
      lay: function (dl) { return dl.tu.filter(function (w) { return w.nghia; }); },
      cau: function (w, muc, n, dl) {
        // Nhiễu không trùng nghĩa, không chứa nhau (国 / 国家), không trùng chữ
        var khac = dl.tu.filter(function (x) { return x.han !== w.han && x.nghia && !trungNghia(x, w) && x.han.indexOf(w.han) < 0 && w.han.indexOf(x.han) < 0; });
        var lw = loaiChinh(w), cung = tron(khac.filter(function (x) { return lw && loaiChinh(x) === lw; })), con = tron(khac.filter(function (x) { return !(lw && loaiChinh(x) === lw); }));
        var ds = muc === 'kho' ? cung.concat(con) : muc === 'tb' ? cung.slice(0, 1).concat(tron(cung.slice(1).concat(con))) : tron(khac);
        var chon = [];
        ds.some(function (x) { if (!chon.some(function (y) { return y.han === x.han || trungNghia(x, y); })) chon.push(x); return chon.length >= n; });
        return { de: { html: '<div class="tl-de-nghia">' + esc(w.nghia) + (w.loai ? ' <small>(' + esc(w.loai) + ')</small>' : '') + '</div>', txt: w.nghia },
          dung: nhanTu(w), nhieu: chon.map(nhanTu), giai: giaiTu(w), han: true, docGiai: w.choDoc ? w.docTxt : '' };
      }
    },
    chuPinyin: {
      ten: 'Chữ Hán → phiên âm', ico: '🔤',
      lay: function (dl) { return dl.tu.filter(function (w) { return w.tach; }); },
      cau: function (w, muc, n, dl) {
        var c = DANG.phienAm.cau(w, muc, n, dl);
        return { de: { html: '<div class="tl-de-chu">' + bocHanzi(w.han) + '</div>', txt: w.han, han: true },
          dung: { nhan: esc(w.py), txt: w.py, khoa: c.dung.khoa }, nhieu: c.nhieu.map(function (x) { return { nhan: esc(x.nhan), txt: x.nhan, khoa: x.khoa }; }),
          giai: giaiTu(w), docGiai: w.choDoc ? w.docTxt : '' };
      }
    },
    dienTu: {
      ten: 'Điền từ vào câu', ico: '🧱',
      lay: function (dl) { return dl.dien || []; },
      cau: function (m, muc, n) {
        var w = m.w, p = m.cau[Math.floor(Math.random() * m.cau.length)], c = p.cau;
        var o = '<span class="tl-o-trong">&nbsp;</span>';
        return { de: { html: '<div class="tl-de-cau hanzi">' + c.han.split(w.han).map(esc).join(o).replace(/\n/g, '<br>') + '</div>', txt: c.han.split(w.han).join('＿＿'), han: true, viet: c.viet },
          dung: nhanTu(w), nhieu: tron(p.nhieu).slice(0, n).map(nhanTu),
          giai: '<span class="hanzi">' + esc(c.han) + '</span>' + (c.py ? ' <span class="bb-giai-tu">' + esc(c.py) + '</span>' : '') + (c.viet ? ' <span class="bb-giai-tu">· ' + esc(c.viet) + '</span>' : ''),
          han: true, docGiai: c.doc || c.han };
      }
    }
  };
  var THU_TU_LOP = ['ngheChu', 'nghiaChu', 'chuPinyin', 'dienTu'];
  // Mức của trò cả lớp: số đáp án và giây mỗi câu
  var MUC_LOP = {
    de: { ten: 'Dễ', dap: 3, giay: 20 },
    tb: { ten: 'Trung bình', dap: 4, giay: 15 },
    kho: { ten: 'Khó', dap: 4, giay: 10 }
  };
  // Bốc một câu cho trò cả lớp: dạng k (hoặc luân phiên), mức nhiễu muc, số đáp án soDap. Tránh lặp mục trong cùng lượt (daDung).
  function bocCauLop(dl, ds, muc, soDap, daDung) {
    ds = ds.filter(function (k) { return LOP[k].lay(dl).length; });
    for (var lan = 0; lan < 30; lan++) {
      var k = ds[Math.floor(Math.random() * ds.length)], kho = LOP[k].lay(dl);
      var conLai = kho.filter(function (m) { return !daDung[(m.w || m).han]; });
      var m = (conLai.length ? conLai : kho)[Math.floor(Math.random() * (conLai.length ? conLai : kho).length)];
      var c = LOP[k].cau(m, muc, soDap - 1, dl);
      if (c.nhieu.length < 2) continue;
      daDung[(m.w || m).han] = 1;
      var dap = tron([c.dung].concat(c.nhieu.slice(0, soDap - 1)));
      return { dang: k, ten: LOP[k].ten, ico: LOP[k].ico, de: c.de, dap: dap.map(function (x) { return { html: x.nhan, txt: x.txt, khoa: x.khoa }; }),
        dung: dap.indexOf(c.dung), giai: c.giai, han: !!c.han, docGiai: c.docGiai || '' };
    }
    return null;
  }

  // =========================================================
  // 4. ÂM THANH HIỆU ỨNG (Web Audio, không dùng file; dùng chung khoá bật/tắt với phần luyện tập)
  // =========================================================
  var AM = { bat: true, ctx: null };
  try { AM.bat = localStorage.getItem('qm-am-hieu-ung') !== '0'; } catch (e) {}
  var NOT = {
    dung: [[880, .09], [1318.5, .16]], sai: [[233, .12], [196, .2]], ban: [[1200, .03], [700, .05]],
    vo: [[180, .05]], xong: [[523.3, .1], [659.3, .1], [784, .1], [1046.5, .28]], xongVua: [[523.3, .12], [659.3, .22]], dem: [[660, .08]], diBay: [[523.3, .14]]
  };
  function amThanh(loai) {
    if (!AM.bat || !NOT[loai]) return;
    try {
      var C = AM.ctx || (AM.ctx = new (window.AudioContext || window.webkitAudioContext)());
      if (C.state === 'suspended') C.resume();
      var t = C.currentTime + .01, to = loai === 'sai' || loai === 'vo' ? .07 : .08;
      NOT[loai].forEach(function (n) {
        var o = C.createOscillator(), g = C.createGain();
        o.type = loai === 'sai' || loai === 'vo' ? 'triangle' : 'sine'; o.frequency.value = n[0];
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(to, t + .01); g.gain.exponentialRampToValueAtTime(.0005, t + n[1]);
        o.connect(g); g.connect(C.destination); o.start(t); o.stop(t + n[1] + .02);
        t += n[1] * .85;
      });
    } catch (e) {}
  }

  window.QM_CH = {
    tachPinyin: tachPinyin, datDau: datDau, dungPinyin: dungPinyin, chuanHoaPy: chuanHoaPy, boThanh: boThanh, tachAm: tachAm,
    taiNguon: taiNguon, chuanBiDien: chuanBiDien,
    tron: tron, boc: boc, DANG: DANG, THU_TU_DANG: THU_TU_DANG, MUC: MUC, giaiAm: giaiAm, giaiTu: giaiTu,
    LOP: LOP, THU_TU_LOP: THU_TU_LOP, MUC_LOP: MUC_LOP, bocCauLop: bocCauLop, trungNghia: trungNghia,
    AM: AM, amThanh: amThanh, NOT: NOT
  };
})();
