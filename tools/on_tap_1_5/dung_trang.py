# -*- coding: utf-8 -*-
"""Dựng các trang của thẻ Ôn tập tổng hợp Bài 1–5: python3 tools/on_tap_1_5/dung_trang.py"""
import os
GOC = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
THU = os.path.join(GOC, 'chuong-trinh-hsk', 'hsk1', 'on-tap-1-5')
V = '20261031e'
R = '../../../'
TEP = f"{R}data/bai/on-tap-1-5.json?v={V}"


def trang(ten_tep, tieu_de, mo_ta, kicker, h1, sub, than, js, them_head=''):
    html = f'''<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{tieu_de} · Ôn tập tổng hợp Bài 1–5 · HSK 1 · Tiếng Trung Diệu Kỳ</title>
<meta name="description" content="{mo_ta}">
<link rel="icon" href="{R}assets/img/logo.webp">
<link rel="stylesheet" href="{R}assets/css/style.css?v=20261029d">
<link rel="stylesheet" href="{R}assets/css/on-tap.css?v={V}">{them_head}
</head>
<body>

<section class="section">
  <div class="wrap">
    <p class="duong-dan"><a href="../../">Chương trình HSK 3.0</a> › <a href="../">HSK 1</a> › {'<a href="./">Ôn tập tổng hợp Bài 1–5</a> › ' + tieu_de if ten_tep != 'index.html' else 'Ôn tập tổng hợp Bài 1–5'}</p>
    <div class="sec-head">
      <div class="sec-kicker">{kicker}</div>
      <h1 class="sec-title">{h1}</h1>
      <p class="sec-sub">{sub}</p>
    </div>
{than}
  </div>
</section>

{js}
</body>
</html>
'''
    open(os.path.join(THU, ten_tep), 'w', encoding='utf-8').write(html)


JS_CHUNG = f'''<script>window.QM_OT_TEP = '{TEP}'; window.QM_LD_KEO = true;</script>
<script src="{R}assets/js/cau-hinh.js?v=20261028a"></script>
<script src="{R}assets/js/header.js?v={V}"></script>
<script src="{R}assets/js/tu-vung-chung.js?v=20261028a"></script>
<script src="{R}assets/js/on-tap-gui.js?v={V}"></script>
<script src="{R}assets/js/luot-do.js?v={V}"></script>'''
QUAY = '    <p class="lt-luu-y"><a href="./">‹ Về Ôn tập tổng hợp Bài 1–5</a></p>'


def phan(ten_tep, ten, kicker, h1, sub, mo_ta, phan_ma, mo_ta_luot):
    than = f'    <div id="on-tap" data-phan="{phan_ma}" data-ten="{ten}" data-tieu-de="{h1}" data-kicker="{kicker}" data-mo-ta="{mo_ta_luot}"></div>\n' + QUAY
    trang(ten_tep, ten, mo_ta, kicker, h1, sub, than, JS_CHUNG + f'\n<script src="{R}assets/js/on-tap-tong-hop.js?v={V}"></script>')


phan('ngu-am.html', 'Ngữ âm', '语音', '🔤 Ngữ âm', 'Thanh mẫu, vận mẫu dễ nhầm, thanh điệu, biến điệu 不 · 一 · hai thanh 3, thanh nhẹ, 儿 hóa, quy tắc viết pinyin.',
     'Ôn tập ngữ âm Bài 1–5 HSK 1: thanh mẫu, vận mẫu, thanh điệu, biến điệu, quy tắc viết pinyin.', 'ngu-am',
     'nghe chọn thanh mẫu, vận mẫu, chữ, phiên âm; biến điệu và quy tắc pinyin')
phan('chu-han.html', 'Chữ Hán', '汉字', '✍️ Chữ Hán', 'Số nét, nét cơ bản, loại hình chữ, kết cấu, quy tắc thuận bút, bộ thủ và ghép chữ — chữ của 5 bài và phần Chữ Hán ở Nhập môn.',
     'Ôn tập chữ Hán Bài 1–5 HSK 1: đếm nét, nét cơ bản, tượng hình, chỉ sự, hội ý, hình thanh, kết cấu, thuận bút, bộ thủ.', 'chu-han',
     'mỗi dạng tối đa 3 câu')
phan('ngu-phap.html', 'Ngữ pháp', '语法', '📐 Ngữ pháp', 'Mỗi điểm ngữ pháp Bài 2–5 một câu, cộng các câu tổng hợp so sánh giữa các bài (不 / 没, 几 / 多少, 二 / 两, 吗 / 呢, 太 / 真…).',
     'Ôn tập ngữ pháp Bài 1–5 HSK 1: chọn từ, đúng hay sai, xếp câu.', 'ngu-phap',
     'mỗi điểm ngữ pháp Bài 2–5 một câu, thêm 6 câu tổng hợp liên bài')
phan('doc-hieu.html', 'Đọc hiểu', '阅读', '📖 Đọc hiểu', 'Ba bài đọc ngắn (đoạn văn, hội thoại, tin nhắn) chỉ dùng từ và ngữ pháp của 5 bài.',
     'Đọc hiểu Bài 1–5 HSK 1: đoạn văn, hội thoại, tin nhắn và câu hỏi.', 'doc-hieu', '')
phan('nghe.html', 'Nghe', '听力', '🎧 Nghe', 'Nghe số, ngày tháng, thứ và hội thoại ngắn (giọng đọc máy). Chữ của bài nghe hiện sau khi bạn trả lời.',
     'Luyện nghe Bài 1–5 HSK 1: số, ngày tháng, thứ, hội thoại ngắn.', 'nghe', 'nghe số, ngày tháng, thứ và hội thoại ngắn')

# ---- Từ vựng: bộ máy Bài tập (30 câu bốc ngẫu nhiên) + phân loại từ ----
bai = f"'{R}data/bai/on-tap-1-5-tu.json?v={V}'"
than_tv = '''    <div id="luyen-tap"></div>
    <div id="on-tap" class="ot-khoi-2" data-phan="tu-vung" data-ten="Từ vựng · Phân loại từ" data-tieu-de="🗂️ Phân loại từ" data-kicker="词语分类" data-mo-ta="xếp từ vào nhóm và tìm từ khác nhóm"></div>
''' + QUAY
js_tv = f'''<script>
  // Kho từ của cả 5 bài (gộp), thay cho 9 cấp. Phải đặt TRƯỚC tu-vung-chung.js.
  window.QM_CAP = ['BAI'];
  window.QM_TEN_CAP = {{ BAI: 'Bài 1–5' }};
  window.QM_TEP = {{ BAI: {bai} }};
  window.QM_BAI_TAP = {{ ma: 'on-tap-1-5-tu-vung', ten: 'Từ vựng', tenLuot: 'Bài 1–5', onTap: 'tu-vung', nhanh: {{ soCau: 30, phut: 30 }} }};
  window.QM_OT_TEP = '{TEP}'; window.QM_LD_KEO = true;
</script>
<script src="{R}assets/js/cau-hinh.js?v=20261028a"></script>
<script src="{R}assets/js/header.js?v={V}"></script>
<script src="{R}assets/js/tu-vung-chung.js?v=20261028a"></script>
<script src="{R}assets/js/tien-do.js?v=20261028a"></script>
<script src="{R}assets/js/on-tap-gui.js?v={V}"></script>
<script src="{R}assets/js/luot-do.js?v={V}"></script>
<script src="{R}assets/js/luyen-tap.js?v={V}"></script>
<script src="{R}assets/js/on-tap-tong-hop.js?v={V}"></script>'''
trang('tu-vung.html', 'Từ vựng', 'Ôn tập từ vựng Bài 1–5 HSK 1: 160 từ, 30 câu mỗi lượt, phân loại từ.', '词语', '📚 Từ vựng',
      'Phần trên: luyện tổng hợp 160 từ của 5 bài (30 câu mỗi lượt, bốc ngẫu nhiên). Phần dưới: phân loại từ theo nhóm.', than_tv, js_tv)

# ---- Dịch ----
trang('dich.html', 'Dịch Việt → Trung', 'Bài dịch Việt – Trung Bài 1–5 HSK 1: dịch câu, hội thoại, đoạn văn.', '翻译', '🌏 Dịch Việt → Trung',
      'Dịch câu, hội thoại và đoạn văn chỉ dùng từ vựng, ngữ pháp của 5 bài.', '    <div id="dich"></div>\n' + QUAY,
      JS_CHUNG + f'\n<script src="{R}assets/js/dich.js?v={V}"></script>')

# ---- Trang chính của thẻ ----
THE = [('ngu-am.html', '🔤', 'Ngữ âm', 'Thanh mẫu, vận mẫu, thanh điệu, biến điệu 不 · 一, thanh nhẹ, 儿 hóa, quy tắc viết pinyin. 20 câu mỗi lượt.'),
       ('chu-han.html', '✍️', 'Chữ Hán', 'Đếm nét, nét cơ bản, loại hình chữ, kết cấu, thuận bút, bộ thủ, ghép chữ. 20 câu mỗi lượt.'),
       ('tu-vung.html', '📚', 'Từ vựng', '160 từ của 5 bài: chọn chữ, nghe, pinyin, ghép cặp, điền từ, xếp câu; phân loại từ.'),
       ('ngu-phap.html', '📐', 'Ngữ pháp', 'Mọi điểm ngữ pháp Bài 2–5 và câu tổng hợp so sánh giữa các bài.'),
       ('doc-hieu.html', '📖', 'Đọc hiểu', 'Ba bài đọc: đoạn văn, hội thoại, tin nhắn.'),
       ('nghe.html', '🎧', 'Nghe', 'Nghe số, ngày tháng, thứ, hội thoại ngắn. 15 câu mỗi lượt.'),
       ('', '🗣️', 'Nói', 'Phần luyện nói đang được cô soạn.'),
       ('dich.html', '🌏', 'Dịch Việt → Trung', '150 câu, 5 hội thoại, 3 đoạn văn. Gõ bản dịch rồi so với đáp án.')]
the = '\n'.join((f'      <a class="card ot-the" href="{h}"><div class="ico-big">{i}</div><h3>{k + 1}. {t}</h3>\n        <p>{m}</p><span class="go">Vào ôn →</span></a>' if h else
                 f'      <div class="card ot-the sap-co"><div class="ico-big">{i}</div><h3>{k + 1}. {t}</h3>\n        <p>{m}</p><span class="go">Sắp có</span></div>')
                for k, (h, i, t, m) in enumerate(THE))
trang('index.html', 'Ôn tập tổng hợp Bài 1–5', 'Ôn tập tổng hợp Bài 1–5 HSK 1 (HSK 3.0): ngữ âm, chữ Hán, từ vựng, ngữ pháp, đọc hiểu, nghe, dịch.',
      '复习 · 第一课 — 第五课', 'Ôn tập tổng hợp Bài 1–5',
      'Ôn lại toàn bộ 5 bài đầu theo từng kỹ năng. Bài làm được gửi về cho cô để theo dõi, phần này không xếp hạng.',
      '    <div class="sec-orn"><i></i><b></b><i></i></div>\n    <div class="grid g4">\n' + the + '\n    </div>',
      f'''<script>window.QM_LD_KEO = true;</script>
<script src="{R}assets/js/header.js?v={V}"></script>
<script src="{R}assets/js/luot-do.js?v={V}"></script>
<script>
  // Thẻ nào còn lượt làm dở (luot-do.js; đăng nhập thì đồng bộ từ máy khác): ghi "📌 Đang làm dở" trên thẻ
  (function () {{
    var PHAN = {{ 'ngu-am.html': ['ngu-am'], 'chu-han.html': ['chu-han'], 'tu-vung.html': ['tu-vung'], 'ngu-phap.html': ['ngu-phap'],
      'doc-hieu.html': ['doc-hieu-'], 'nghe.html': ['nghe'], 'dich.html': ['dich-'] }};
    function ve() {{
      if (!window.QM_LD) return;
      var ds = QM_LD.tatCa('on-tap-1-5/');
      document.querySelectorAll('a.ot-the').forEach(function (a) {{
        var cu = a.querySelector('.ot-the-do'); if (cu) cu.remove();
        var tt = (PHAN[a.getAttribute('href')] || []), co = ds.filter(function (e) {{ var k = e.khoa.slice(11); return tt.some(function (t) {{ return t.slice(-1) === '-' ? k.indexOf(t) === 0 : k === t || k === t + '-luyen'; }}); }});
        if (!co.length) return;
        var p = document.createElement('p'); p.className = 'ot-the-do';
        p.textContent = '📌 Đang làm dở: ' + co.map(function (e) {{ return (e.du && e.du.ten) || e.ten ? ((e.du && e.du.ten) || e.ten) + ' · ' + e.tom : e.tom; }}).join(' — ');
        a.insertBefore(p, a.querySelector('.go'));
      }});
    }}
    ve(); document.addEventListener('qm-luot-do-nap', ve);
  }})();
</script>''')
print('đã dựng', sorted(os.listdir(THU)))
