/* =========================================================
   TRÒ CHƠI BẮN BÓNG BAY · Tiếng Trung Diệu Kỳ
   Máy đọc một âm / một từ, bóng bay mang đáp án bay lên, bắn trúng quả đúng trước khi bóng bay mất.
   7 dạng: Trộn tất cả · Thanh mẫu · Vận mẫu · Thanh điệu · Vận mẫu + thanh điệu · Phiên âm · Chữ Hán.
   3 mức: Dễ (3 bóng, 10 giây) · Trung bình (4 bóng, 7 giây) · Khó (5 bóng, 5 giây, nhiễu là cặp dễ nhầm).

   Trang đặt cấu hình TRƯỚC khi nhúng file này (sau tu-vung-chung.js):
     window.QM_BB = {
       phamVi: 'h2-hsk1',                         // khoá lưu kỷ lục trên máy
       nhom: [ { ma: 'bai-1-2', ten: 'Bài 1–2', tep: ['<đường dẫn>/bai-1-2.json'] }, … ],
       tongHop: true                              // thêm mục "Tổng hợp" gồm mọi nhóm
     };
   File JSON: mảng từ, hoặc đối tượng có khoá "tu" (cùng định dạng kho 9 cấp / dữ liệu bài).
   Mở thẳng một nhóm: thêm ?bai=<mã nhóm> vào đường dẫn.
   Âm thanh: QM_TV.doc (giọng máy zh-CN; cột "Đọc từ" là đường dẫn file ghi âm thì phát file).
   Không gửi điểm lên máy chủ; chỉ lưu kỷ lục trên máy.
   ========================================================= */
(function () {
  var CF = window.QM_BB || {};
  var el = document.getElementById('ban-bong-bay');
  if (!el || !window.QM_TV) return;
  var TV = window.QM_TV, esc = TV.esc;

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
  // 2. DỮ LIỆU: từ → câu hỏi
  // =========================================================
  var NHOM = (CF.nhom || []).slice();
  if (CF.tongHop && NHOM.length > 1) NHOM.push({ ma: 'tong-hop', ten: 'Tổng hợp', tongHop: true });
  var DU_LIEU = {};    // mã nhóm → { tu: [...], am: [...] }

  function taiNhom(n) {
    if (DU_LIEU[n.ma]) return Promise.resolve(DU_LIEU[n.ma]);
    var ds = n.tongHop ? NHOM.filter(function (x) { return !x.tongHop; }) : [n];
    return Promise.all(ds.map(function (x) {
      return Promise.all([].concat(x.tep).map(function (u) { return fetch(u).then(function (r) { if (!r.ok) throw r; return r.json(); }); }));
    })).then(function (ketQua) {
      var tu = [], daCo = {};
      ketQua.forEach(function (tepNhom) { tepNhom.forEach(function (d) {
        (Array.isArray(d) ? d : d.tu || []).forEach(function (r) {
          var han = (r['Chữ Hán'] || '').trim();
          if (!han || daCo[han]) return; daCo[han] = 1;
          tu.push({ han: han, py: (r['Pinyin'] || '').trim(), doc: (r['Đọc từ'] || '').trim(), nghia: (r['Nghĩa tiếng Việt'] || '').trim() });
        });
      }); });
      return (DU_LIEU[n.ma] = dungCau(tu));
    });
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

  // =========================================================
  // 5. GIAO DIỆN
  // =========================================================
  var SO_CAU = 15;
  var KHOA_KL = 'qm-bb-ky-luc';
  function docKL() { try { return JSON.parse(localStorage.getItem(KHOA_KL) || '{}'); } catch (e) { return {}; } }
  function ghiKL(k, d) { try { var o = docKL(); o[k] = d; localStorage.setItem(KHOA_KL, JSON.stringify(o)); } catch (e) {} }
  var S = { nhom: NHOM[0] ? NHOM[0].ma : '', dang: 'tron', muc: 'de' };
  try { var luu = JSON.parse(localStorage.getItem('qm-bb-chon') || '{}'); ['dang', 'muc'].forEach(function (k) { if (luu[k]) S[k] = luu[k]; }); } catch (e) {}
  var thamSo = (location.search.match(/[?&]bai=([^&]+)/) || [])[1];
  if (thamSo && NHOM.some(function (n) { return n.ma === thamSo; })) S.nhom = thamSo;
  if (!DANG[S.dang] && S.dang !== 'tron') S.dang = 'tron';
  if (!MUC[S.muc]) S.muc = 'de';
  function khoaKL() { return (CF.phamVi || 'bb') + '|' + S.nhom + '|' + S.dang + '|' + S.muc; }

  el.innerHTML =
    '<div class="lt-thanh bb-thanh">' +
      '<label class="lt-o"><span class="lt-o-nhan">' + esc(CF.nhanNhom || 'Bài') + '</span><select class="bb-chon-nhom" aria-label="Chọn bài"></select></label>' +
      '<label class="lt-o"><span class="lt-o-nhan">Dạng</span><select class="bb-chon-dang" aria-label="Chọn dạng"></select></label>' +
      '<label class="lt-o"><span class="lt-o-nhan">Mức độ</span><select class="bb-chon-muc" aria-label="Chọn mức độ"></select></label>' +
    '</div>' +
    '<div class="bb-khung">' +
      '<div class="bb-hud" hidden>' +
        '<span class="bb-hud-o bb-so-cau"></span><span class="bb-hud-o bb-diem"></span><span class="bb-hud-o bb-chuoi" hidden></span>' +
        '<span class="bb-hud-nut"><button type="button" class="bb-nghe" aria-label="Nghe lại" title="Nghe lại (phím cách)">🔊 <span>Nghe lại</span></button>' +
        '<button type="button" class="bb-dung" aria-label="Tạm dừng" title="Tạm dừng">⏸</button>' +
        '<button type="button" class="bb-am" title="Bật / tắt âm thanh hiệu ứng"></button></span>' +
      '</div>' +
      '<div class="bb-de-bai" hidden></div>' +
      '<div class="bb-troi" tabindex="-1">' +
        '<div class="bb-may m1"></div><div class="bb-may m2"></div><div class="bb-may m3"></div>' +
        '<div class="bb-vach"><i></i></div>' +
        '<div class="bb-bong-ds"></div>' +
        '<div class="bb-sung" aria-hidden="true"><i></i></div>' +
        '<div class="bb-giai" aria-live="polite"></div>' +
        '<div class="bb-man"></div>' +
      '</div>' +
    '</div>';
  var selNhom = el.querySelector('.bb-chon-nhom'), selDang = el.querySelector('.bb-chon-dang'), selMuc = el.querySelector('.bb-chon-muc');
  var thanh = el.querySelector('.bb-thanh'), hud = el.querySelector('.bb-hud'), deBai = el.querySelector('.bb-de-bai'), troi = el.querySelector('.bb-troi'),
      dsBong = el.querySelector('.bb-bong-ds'), man = el.querySelector('.bb-man'), giai = el.querySelector('.bb-giai'), sung = el.querySelector('.bb-sung'),
      vach = el.querySelector('.bb-vach i'), nutAm = el.querySelector('.bb-am');

  selNhom.innerHTML = NHOM.map(function (n) { return '<option value="' + esc(n.ma) + '">' + esc(n.ten) + '</option>'; }).join('');
  selDang.innerHTML = '<option value="tron">🔀 Trộn tất cả</option>' + THU_TU_DANG.map(function (k) { return '<option value="' + k + '">' + DANG[k].ico + ' ' + DANG[k].ten + '</option>'; }).join('');
  selMuc.innerHTML = Object.keys(MUC).map(function (k) { return '<option value="' + k + '">' + MUC[k].ten + '</option>'; }).join('');
  selNhom.value = S.nhom; selDang.value = S.dang; selMuc.value = S.muc;
  function veNutAm() { nutAm.textContent = AM.bat ? '🔔' : '🔕'; nutAm.setAttribute('aria-label', (AM.bat ? 'Tắt' : 'Bật') + ' âm thanh hiệu ứng'); }
  veNutAm();
  nutAm.addEventListener('click', function () { AM.bat = !AM.bat; try { localStorage.setItem('qm-am-hieu-ung', AM.bat ? '1' : '0'); } catch (e) {} veNutAm(); });

  [selNhom, selDang, selMuc].forEach(function (s) { s.addEventListener('change', function () {
    S.nhom = selNhom.value; S.dang = selDang.value; S.muc = selMuc.value;
    try { localStorage.setItem('qm-bb-chon', JSON.stringify({ dang: S.dang, muc: S.muc })); } catch (e) {}
    if (!G || G.xong) manChao();
  }); });

  function nhomDangChon() { return NHOM.filter(function (n) { return n.ma === S.nhom; })[0]; }

  // ---------- Màn chào: cách chơi + Bắt đầu ----------
  function manChao() {
    G = null; dungVong();
    hud.hidden = true; deBai.hidden = true; thanh.classList.remove('khoa'); giai.innerHTML = ''; dsBong.innerHTML = ''; vach.style.width = '0';
    var m = MUC[S.muc], kl = docKL()[khoaKL()];
    var soBong = S.dang === 'thanhDieu' ? Math.min(m.bong, 4) : m.bong;
    man.className = 'bb-man on';
    man.innerHTML = '<div class="bb-the">' +
      '<div class="bb-the-ico">🎈</div>' +
      '<h3>Bắn bóng bay</h3>' +
      '<p>Nghe máy đọc, rồi bắn trúng quả bóng mang đáp án đúng trước khi bóng bay mất.</p>' +
      '<div class="bb-chip"><span>' + (S.dang === 'tron' ? '🔀 Trộn tất cả' : DANG[S.dang].ico + ' ' + DANG[S.dang].ten) + '</span>' +
        '<span>' + soBong + ' bóng</span><span>' + m.giay + ' giây / câu</span><span>' + SO_CAU + ' câu</span></div>' +
      (kl ? '<p class="bb-kl">🏆 Kỷ lục của bạn: <b>' + kl + '</b> điểm</p>' : '') +
      '<button type="button" class="btn gold bb-bat-dau">▶ Bắt đầu</button>' +
      '<p class="bb-meo">Máy tính: bấm phím <b>1–5</b> để bắn bóng theo thứ tự từ trái sang, phím <b>cách</b> để nghe lại.</p>' +
    '</div>';
    man.querySelector('.bb-bat-dau').addEventListener('click', batDau);
  }

  // =========================================================
  // 6. LƯỢT CHƠI
  // =========================================================
  var G = null, vong = null;
  function dungVong() { if (vong) cancelAnimationFrame(vong); vong = null; }

  function moKhoaAm() {   // iPhone: lần đọc đầu phải nằm trong thao tác bấm
    try { if (window.speechSynthesis) { var u = new SpeechSynthesisUtterance(' '); u.volume = 0; u.lang = 'zh-CN'; speechSynthesis.speak(u); } } catch (e) {}
    try { var C = AM.ctx || (AM.ctx = new (window.AudioContext || window.webkitAudioContext)()); if (C.state === 'suspended') C.resume(); } catch (e) {}
  }

  function batDau(dsLai) {
    moKhoaAm();
    if (!TV.coGiong()) {
      man.innerHTML = '<div class="bb-the"><div class="bb-the-ico">🔇</div><h3>Máy chưa có giọng đọc tiếng Trung</h3>' +
        '<p>Trò này cần nghe máy đọc. Bạn thử mở trang bằng <b>Chrome</b> hoặc <b>Edge</b>, hoặc cài giọng đọc tiếng Trung (Trung Quốc đại lục) cho máy nhé.</p>' +
        '<button type="button" class="btn bb-ve">‹ Quay lại</button></div>';
      man.querySelector('.bb-ve').addEventListener('click', manChao);
      return;
    }
    man.innerHTML = '<div class="bb-the"><div class="tv-trong">Đang chuẩn bị…</div></div>';
    taiNhom(nhomDangChon()).then(function (dl) {
      var ds = Array.isArray(dsLai) ? dsLai : taoLuot(dl);
      if (!ds.length) {
        man.innerHTML = '<div class="bb-the"><div class="bb-the-ico">🌱</div><h3>Chưa đủ dữ liệu</h3><p>Bài này chưa có đủ âm để chơi dạng này. Bạn chọn dạng khác nhé.</p>' +
          '<button type="button" class="btn bb-ve">‹ Quay lại</button></div>';
        man.querySelector('.bb-ve').addEventListener('click', manChao);
        return;
      }
      G = { dl: dl, ds: ds, i: -1, diem: 0, dung: 0, chuoi: 0, chuoiMax: 0, sai: [], dangChay: false, xong: false, laLai: Array.isArray(dsLai) };
      thanh.classList.add('khoa');
      hud.hidden = false; deBai.hidden = false;
      capNhatHud();
      cuonToiKhung(); setTimeout(cuonToiKhung, 400);
      demNguoc(3);
    }).catch(function () {
      man.innerHTML = '<div class="bb-the"><div class="bb-the-ico">⚠️</div><h3>Chưa tải được dữ liệu</h3><p>Bạn kiểm tra mạng rồi thử lại nhé.</p><button type="button" class="btn bb-ve">‹ Quay lại</button></div>';
      man.querySelector('.bb-ve').addEventListener('click', manChao);
    });
  }

  // Bốc câu cho một lượt: mỗi câu một mục khác nhau; Trộn thì luân phiên các dạng
  function taoLuot(dl) {
    var dsDang = S.dang === 'tron' ? THU_TU_DANG : [S.dang], kho = {};
    dsDang.forEach(function (d) { kho[d] = tron(DANG[d].lay(dl)); });
    dsDang = dsDang.filter(function (d) { return kho[d].length; });
    var ds = [], daDung = {}, vongDang = [];
    for (var lan = 0; ds.length < SO_CAU && lan < SO_CAU * 6; lan++) {
      if (!vongDang.length) vongDang = tron(dsDang);
      if (!vongDang.length) break;
      var d = vongDang.shift(), muc = kho[d].shift();
      if (!muc) continue;
      var k = d + '|' + (muc.chu ? muc.chu + muc.goc + muc.thanh : muc.han);
      if (daDung[k]) continue; daDung[k] = 1;
      ds.push({ dang: d, muc: muc });
    }
    return ds;
  }

  function cuonToiKhung() {
    var h = document.querySelector('.sh-header'), cao = h ? h.getBoundingClientRect().height : 0;
    var dich = hud.getBoundingClientRect().top + window.scrollY - cao - 6;
    if (Math.abs(dich - window.scrollY) > 4) window.scrollTo({ top: dich, behavior: 'smooth' });
  }
  function demNguoc(n) {
    man.className = 'bb-man on trong';
    man.innerHTML = '<div class="bb-dem">' + n + '</div>';
    amThanh('dem');
    setTimeout(function () { if (!G) return; if (n > 1) demNguoc(n - 1); else { man.className = 'bb-man'; man.innerHTML = ''; cauTiep(); } }, 650);
  }

  function capNhatHud() {
    el.querySelector('.bb-so-cau').innerHTML = 'Câu <b>' + Math.min(G.i + 1, G.ds.length) + '</b>/' + G.ds.length;
    el.querySelector('.bb-diem').innerHTML = '⭐ <b>' + G.diem + '</b>';
    var c = el.querySelector('.bb-chuoi'); c.hidden = G.chuoi < 2; c.innerHTML = '🔥 <b>' + G.chuoi + '</b>';
  }

  var MAU = ['do', 'vang', 'xanh', 'lam', 'hong'];
  function cauTiep() {
    if (!G) return;
    G.i++;
    giai.innerHTML = '';
    if (G.i >= G.ds.length) return ketThuc();
    var q = G.ds[G.i], D = DANG[q.dang], m = MUC[S.muc];
    var soBong = q.dang === 'thanhDieu' ? Math.min(m.bong, 4) : m.bong;
    var c = D.cau(q.muc, S.muc, soBong - 1, G.dl);
    var dap = [c.dung].concat(c.nhieu);
    dap = c.xepThu ? dap.sort(function (a, b) { return a.sx - b.sx; }) : tron(dap);
    G.cau = { q: q, c: c, dap: dap, batDau: 0, troiQua: 0, giay: m.giay, xong: false };
    capNhatHud();
    deBai.innerHTML = '<span class="bb-de-ico">' + D.ico + '</span> 🎧 ' + D.de;
    veBong(dap, c);
    docCau();
    G.cau.batDau = performance.now();
    G.dangChay = true;
    dungVong(); vong = requestAnimationFrame(chay);
  }

  function docCau() { if (G && G.cau) TV.doc(G.cau.c.doc); }

  function veBong(dap, c) {
    var W = troi.clientWidth, n = dap.length;
    var hep = W / n < 96;                                   // màn hẹp: bóng so le hai tầng để chữ dài vẫn vừa
    var mau = tron(MAU);
    dsBong.innerHTML = dap.map(function (d, i) {
      var cls = 'bb-bong ' + mau[i % MAU.length] + (c.han ? ' han' : '') + (c.dai ? ' dai' : '') + (c.nho ? ' nho' : '');
      return '<button type="button" class="' + cls + '" data-i="' + i + '" aria-label="Đáp án ' + (i + 1) + '"><span class="bb-bong-chu">' + d.nhan + '</span><i class="bb-day"></i></button>';
    }).join('');
    var bong = dsBong.querySelectorAll('.bb-bong');
    var cot = W / n;
    G.cau.bong = [].map.call(bong, function (b, i) {
      var rong = hep ? Math.min(cot * 1.32, 100) : Math.min(cot - 14, 128);
      b.style.width = rong + 'px'; b.style.height = Math.round(rong * 1.18) + 'px';
      var chu = b.querySelector('.bb-bong-chu');
      var co = c.han ? Math.min(rong * .42, 44) : c.dai ? (rong > 110 ? 18 : 15) : (rong > 110 ? 23 : 19);
      if (c.han && dap[i].khoa.length > 2) co = Math.min(co, rong * .8 / dap[i].khoa.length * 1.05);
      chu.style.fontSize = co + 'px';
      if (!c.han && chu.scrollWidth > rong * .86) chu.style.fontSize = Math.max(11, co * rong * .86 / chu.scrollWidth) + 'px';
      var x = Math.max(4, Math.min(W - rong - 4, cot * i + cot / 2 - rong / 2));
      return { el: b, x: x, lech: hep ? (i % 2) * rong * 1.18 * .78 : Math.random() * 24, pha: Math.random() * 6.28, cao: rong * 1.18 };
    });
    G.cau.bong.forEach(function (o) { o.el.style.transform = 'translate(' + o.x + 'px,' + troi.clientHeight + 'px)'; });
  }

  // Bóng bay lên: hết giờ thì bóng ra khỏi khung trên
  function chay(t) {
    if (!G || !G.dangChay) return;
    var C = G.cau, H = troi.clientHeight, troiQua = C.troiQua + (t - C.batDau) / 1000;
    var tile = troiQua / C.giay;
    vach.style.width = Math.max(0, 100 - tile * 100) + '%';
    vach.className = tile > .7 ? 'gap' : '';
    C.bong.forEach(function (o) {
      if (o.vo) return;
      var y = H - o.cao * .35 - Math.min(1, tile) * (H + o.cao * .75) - o.lech;
      var x = o.x + Math.sin(troiQua * 1.6 + o.pha) * 6;
      o.y = y;
      o.el.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) rotate(' + (Math.sin(troiQua * 1.3 + o.pha) * 4).toFixed(1) + 'deg)';
    });
    if (tile >= 1) { traLoi(-1); return; }
    vong = requestAnimationFrame(chay);
  }

  function tamDung() {
    if (!G || !G.dangChay) return;
    G.dangChay = false; dungVong(); TV.dungDoc();
    G.cau.troiQua += (performance.now() - G.cau.batDau) / 1000;
    man.className = 'bb-man on';
    man.innerHTML = '<div class="bb-the"><div class="bb-the-ico">⏸</div><h3>Tạm dừng</h3>' +
      '<button type="button" class="btn gold bb-tiep-tuc">▶ Chơi tiếp</button> <button type="button" class="btn bb-thoat">Thoát</button></div>';
    man.querySelector('.bb-tiep-tuc').addEventListener('click', chayTiep);
    man.querySelector('.bb-thoat').addEventListener('click', manChao);
  }
  function chayTiep() {
    if (!G || G.dangChay || !G.cau || G.cau.xong) return;
    man.className = 'bb-man'; man.innerHTML = '';
    G.cau.batDau = performance.now(); G.dangChay = true; docCau();
    vong = requestAnimationFrame(chay);
  }
  el.querySelector('.bb-dung').addEventListener('click', function () { if (G && G.dangChay) tamDung(); else chayTiep(); });
  el.querySelector('.bb-nghe').addEventListener('click', function () { if (G && G.dangChay) docCau(); else if (G && G.cau) docCau(); });
  document.addEventListener('visibilitychange', function () { if (document.hidden) tamDung(); });

  // Bắn: mũi tên bay từ súng tới bóng rồi nổ
  dsBong.addEventListener('click', function (e) {
    var b = e.target.closest('.bb-bong'); if (!b || !G || !G.dangChay || G.cau.xong) return;
    ban(+b.dataset.i);
  });
  document.addEventListener('keydown', function (e) {
    if (!G || G.xong || !G.cau || /input|select|textarea/i.test((e.target.tagName || ''))) return;
    if (e.key === ' ' || e.code === 'Space') { if (G.dangChay) { e.preventDefault(); docCau(); } return; }
    var so = +e.key;
    if (so >= 1 && so <= 5 && G.dangChay && !G.cau.xong && so <= G.cau.dap.length) ban(so - 1);
    if (e.key === 'Enter' && G.cau.xong && G.choTiep) { e.preventDefault(); G.choTiep(); }
  });

  function ban(i) {
    var C = G.cau, o = C.bong[i]; if (!o) return;
    C.xong = true;
    amThanh('ban');
    var R = troi.getBoundingClientRect(), r = o.el.getBoundingClientRect();
    var tx = r.left - R.left + r.width / 2, ty = r.top - R.top + r.height * .45;
    var sx = R.width / 2, sy = R.height - 18, goc = Math.atan2(ty - sy, tx - sx) * 180 / Math.PI;
    sung.style.transform = 'translateX(-50%) rotate(' + (goc + 90) + 'deg)';
    var mui = document.createElement('div'); mui.className = 'bb-mui';
    mui.style.transform = 'translate(' + sx + 'px,' + sy + 'px) rotate(' + goc + 'deg)';
    troi.appendChild(mui);
    requestAnimationFrame(function () { requestAnimationFrame(function () {
      mui.style.transform = 'translate(' + tx + 'px,' + ty + 'px) rotate(' + goc + 'deg)';
    }); });
    setTimeout(function () { mui.remove(); traLoi(i); }, 170);
  }

  function no(o, dung) {
    o.vo = true;
    o.el.classList.add(dung ? 'no' : 'no-sai');
    var R = troi.getBoundingClientRect(), r = o.el.getBoundingClientRect();
    if (dung) for (var k = 0; k < 12; k++) {
      var h = document.createElement('i'); h.className = 'bb-hat ' + MAU[k % MAU.length];
      var a = k / 12 * 6.28, d = 40 + Math.random() * 40;
      h.style.left = (r.left - R.left + r.width / 2) + 'px'; h.style.top = (r.top - R.top + r.height * .45) + 'px';
      h.style.setProperty('--dx', Math.cos(a) * d + 'px'); h.style.setProperty('--dy', Math.sin(a) * d + 'px');
      troi.appendChild(h); setTimeout(h.remove.bind(h), 700);
    }
  }
  function bayDiem(o, txt) {
    var R = troi.getBoundingClientRect(), r = o.el.getBoundingClientRect(), s = document.createElement('div');
    s.className = 'bb-cong'; s.textContent = txt;
    s.style.left = (r.left - R.left + r.width / 2) + 'px'; s.style.top = (r.top - R.top + r.height * .3) + 'px';
    troi.appendChild(s); setTimeout(s.remove.bind(s), 1100);
  }

  // i = -1: hết giờ, bóng bay mất
  function traLoi(i) {
    var C = G.cau; if (!C) return;
    C.xong = true; G.dangChay = false; dungVong();
    C.troiQua += (performance.now() - C.batDau) / 1000;
    var iDung = C.dap.indexOf(C.c.dung), dung = i === iDung;
    if (dung) {
      var conLai = Math.max(0, 1 - C.troiQua / C.giay);
      G.chuoi++; G.chuoiMax = Math.max(G.chuoiMax, G.chuoi); G.dung++;
      var cong = 100 + Math.round(conLai * 50) + (G.chuoi >= 3 ? 20 : 0);
      G.diem += cong;
      no(C.bong[i], true); bayDiem(C.bong[i], '+' + cong); amThanh('dung');
    } else {
      G.chuoi = 0;
      G.sai.push(C.q);
      if (i >= 0) { no(C.bong[i], false); amThanh('sai'); }
      else amThanh('diBay');
      var od = C.bong[iDung];
      od.el.classList.add('la-dap-an');
      // Bóng đúng đã bay mất hoặc đang nằm thấp (lời giải che): kéo về phần trên khung cho học sinh thấy
      var Ht = troi.clientHeight;
      if (i < 0 || od.y > Ht * .42 || od.y < 0) {
        od.el.classList.add('ve-lai');
        od.el.style.transform = 'translate(' + od.x + 'px,' + Math.round(Ht * .2) + 'px)';
      }
    }
    C.bong.forEach(function (o, k) { if (k !== i && k !== iDung) o.el.classList.add('mo'); });
    capNhatHud();
    var nhan = dung ? '<b class="bb-dung-r">✓ Chính xác!</b>' : i < 0 ? '<b class="bb-sai-r">⏰ Bóng bay mất rồi!</b>' : '<b class="bb-sai-r">✗ Chưa đúng</b>';
    giai.innerHTML = '<div class="bb-giai-o ' + (dung ? 'dung' : 'sai') + '">' + nhan +
      '<span class="bb-giai-nd">' + (dung ? '' : 'Đáp án: ') + C.c.giai + '</span>' +
      '<span class="bb-giai-nut">' + TV.nutLoa(C.c.doc) + '<button type="button" class="btn solid bb-tiep">Tiếp ›</button></span></div>';
    var hen = setTimeout(tiep, dung ? 1300 : 2800);
    function tiep() { clearTimeout(hen); G.choTiep = null; if (G && G.cau === C) cauTiep(); }
    G.choTiep = tiep;
    giai.querySelector('.bb-tiep').addEventListener('click', tiep);
    // Bấm loa nghe lại thì dừng tự chuyển câu
    giai.querySelector('.tv-loa') && giai.querySelector('.tv-loa').addEventListener('click', function () { clearTimeout(hen); });
  }

  function ketThuc() {
    G.xong = true; G.dangChay = false; dungVong();
    hud.hidden = true; deBai.hidden = true; dsBong.innerHTML = ''; vach.style.width = '0'; thanh.classList.remove('khoa');
    var tong = G.ds.length, tl = G.dung / tong, sao = tl >= .9 ? 3 : tl >= .7 ? 2 : tl >= .4 ? 1 : 0;
    var k = khoaKL(), cu = docKL()[k] || 0, moi = !G.laLai && G.diem > cu;
    if (moi) ghiKL(k, G.diem);
    amThanh(sao >= 2 ? 'xong' : 'xongVua');
    var loi = sao === 3 ? 'Xuất sắc! Tai bạn thính quá 👏' : sao === 2 ? 'Giỏi lắm! Còn chút xíu nữa thôi 💪' : sao === 1 ? 'Khá rồi! Luyện thêm vài lượt nhé 🌱' : 'Đừng nản, nghe lại các câu bên dưới rồi chơi tiếp nhé 🌱';
    var dsSai = {}, hangSai = '';
    G.sai.forEach(function (q) {
      var m = q.muc, key = m.chu ? m.chu + m.goc + m.thanh : m.han;
      if (dsSai[key]) return; dsSai[key] = 1;
      hangSai += '<li>' + TV.nutLoa(m.chu ? m.chu : m.docTxt) + (m.chu ? giaiAm(m) : giaiTu(m)) + '</li>';
    });
    man.className = 'bb-man on';
    man.innerHTML = '<div class="bb-the bb-ket">' +
      '<div class="bb-sao">' + [1, 2, 3].map(function (s) { return '<span class="' + (s <= sao ? 'on' : '') + '">★</span>'; }).join('') + '</div>' +
      '<div class="bb-tong-diem">' + G.diem + ' <small>điểm</small></div>' +
      (moi ? '<div class="bb-moi">🏆 Kỷ lục mới!</div>' : cu && !G.laLai ? '<p class="bb-kl">Kỷ lục: ' + cu + ' điểm</p>' : '') +
      '<p class="bb-loi">' + loi + '</p>' +
      '<div class="bb-chip"><span>✓ Đúng ' + G.dung + '/' + tong + '</span><span>🔥 Chuỗi dài nhất ' + G.chuoiMax + '</span></div>' +
      (G.laLai ? '<p class="bb-kl">Lượt luyện lại câu sai không tính kỷ lục.</p>' : '') +
      '<div class="bb-nut-ket"><button type="button" class="btn gold bb-choi-lai">↻ Chơi lượt mới</button>' +
      (G.sai.length ? '<button type="button" class="btn bb-luyen-sai">🎯 Luyện lại ' + Object.keys(dsSai).length + ' câu sai</button>' : '') + '</div>' +
      (hangSai ? '<div class="bb-on-lai"><b>Cần ôn lại</b><ul>' + hangSai + '</ul></div>' : '') +
    '</div>';
    var sai = G.sai.slice();
    man.querySelector('.bb-choi-lai').addEventListener('click', function () { batDau(); });
    var ls = man.querySelector('.bb-luyen-sai');
    if (ls) ls.addEventListener('click', function () {
      var gap = [], da = {};
      sai.forEach(function (q) { var key = q.dang + (q.muc.chu ? q.muc.chu + q.muc.goc + q.muc.thanh : q.muc.han); if (!da[key]) { da[key] = 1; gap.push(q); } });
      batDau(tron(gap));
    });
  }

  manChao();

  // Cho phần kiểm tra tự động
  window.QM_BB_KIEM = { tachPinyin: tachPinyin, datDau: datDau, taiNhom: taiNhom, DANG: DANG, THU_TU_DANG: THU_TU_DANG, MUC: MUC, NHOM: NHOM, taoLuot: taoLuot, S: S, chuanHoaPy: chuanHoaPy };
})();
