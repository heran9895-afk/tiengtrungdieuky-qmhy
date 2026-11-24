#!/usr/bin/env python3
"""Tạo chuong-trinh-hsk-2/hsk1/bai-7/ (trang bài HSK 2.0) từ khuôn Bài 6 đã duyệt. Chạy: python3 tools/tao_trang_h2_bai7.py"""
import os, re
GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
H2 = os.path.join(GOC, 'chuong-trinh-hsk-2/hsk1'); V = '20261124b'
T = ['index', 'tu-vung', 'ngu-phap', 'on-tap-1', 'on-tap-2', 'on-tap-3', 'bai-tap', 'test-dau-gio', 'bang-xep-hang']
DS1 = '今天、昨天、明天、号、月、星期、天'; DS2 = '请、问、去、学校'; DS3 = '看、书、大学、中学、小学'
os.makedirs(os.path.join(H2, 'bai-7'), exist_ok=True)
for t in T:
    s = open(os.path.join(H2, 'bai-6', t + '.html'), encoding='utf-8').read()
    if t == 'test-dau-gio':
        s = s.replace('Bài 5', '@@6').replace('Bài 6', 'Bài 7').replace('@@6', 'Bài 6').replace('bai5', 'bai6').replace('bai-5.json', 'bai-6.json')
        s = s.replace('第五课', '第六课').replace('Bài 4', 'Bài 5') if False else s.replace('第五课', '第六课')
        s = re.sub(r"TRUOC: \[[^\]]*\]", "TRUOC: ['../../../data/hsk2/bai-1-2.json?v=20261114a', '../../../data/hsk2/bai-3.json?v=20261114a', '../../../data/hsk2/bai-4.json?v=20261114a', '../../../data/hsk2/bai-5.json?v=20261114a']", s)
        s = s.replace('data/hsk2/bai-6.json?v=20261114a', 'data/hsk2/bai-6.json?v=20261114a')
    else:
        s = s.replace('第六课：我会说汉语', '第七课：今天几号').replace('第六课', '第七课').replace('Bài 6: Tôi biết nói tiếng Trung', 'Bài 7: Hôm nay ngày mấy')
        s = s.replace('Dì liù kè: Wǒ huì shuō Hànyǔ', 'Dì qī kè: Jīntiān jǐ hào').replace('Bài 6', 'Bài 7').replace('bai6', 'bai7')
        s = s.replace('Test đầu giờ · Bài 7', 'Test đầu giờ · Bài 6')
        s = re.sub(r"(BAI: '\.\./\.\./\.\./data/hsk2/bai-)6(\.json\?v=)[^']*", r"\g<1>7\g<2>" + V, s)
        s = re.sub(r"TRUOC: \[([^\]]*)\]", lambda m: "TRUOC: [" + m.group(1) + ", '../../../data/hsk2/bai-6.json?v=20261114a']", s)
    if t == 'on-tap-1':
        s = s.replace(' · Nói, đọc, viết', ' · Ngày tháng'); s = re.sub(r'(Các từ <span class="hanzi">)[^<]*', r'\g<1>' + DS1, s)
    if t == 'on-tap-2':
        s = s.replace(' · Món ăn', ' · Đi và hỏi'); s = re.sub(r'(Các từ <span class="hanzi">)[^<]*', r'\g<1>' + DS2, s)
    if t == 'on-tap-3':
        s = s.replace('Ôn tập từ vựng 3', 'Ôn tập từ vựng 3 · Trường học, sách'); s = re.sub(r'(Các từ <span class="hanzi">)[^<]*', r'\g<1>' + DS3, s)
    if t == 'ngu-phap': s = s.replace('2 cấu trúc cần nhớ', '3 cấu trúc cần nhớ')
    if t == 'index':
        s = s.replace('12 từ trong bảng 生词 và 3 từ mở rộng', '12 từ trong bảng 生词 và 4 từ mở rộng')
        s = re.sub(r'<p>2 điểm: .*?, có cụm từ, câu ví dụ\.</p>', '<p>3 điểm: Ngày, tháng, thứ · <span class="hanzi">几月几号 · 星期几</span> · Câu vị ngữ danh từ · <span class="hanzi">去</span> + nơi chốn · câu liên động, có cụm từ, câu ví dụ.</p>', s, flags=re.S)
        s = s.replace('<a href="on-tap-1.html">Ôn tập 1</a><a href="on-tap-2.html">Ôn tập 2 · Món ăn</a><a href="on-tap-3.html">Ôn tập 3</a>',
                      '<a href="on-tap-1.html">Ôn tập 1 · Ngày tháng</a><a href="on-tap-2.html">Ôn tập 2 · Đi và hỏi</a><a href="on-tap-3.html">Ôn tập 3 · Trường học, sách</a>')
    open(os.path.join(H2, 'bai-7', t + '.html'), 'w', encoding='utf-8').write(s)
# thẻ Bài 7 ở trang HSK 1 (HSK 2.0)
ip = os.path.join(H2, 'index.html'); h = open(ip, encoding='utf-8').read()
if 'href="bai-7/"' not in h:
    the = '''      <a class="card" href="bai-7/">
        <div class="meta"><span class="tag red">Bài 7</span></div>
        <h3><span class="hanzi">第七课：今天几号</span></h3>
        <p>Bài 7: Hôm nay ngày mấy · 16 từ vựng, test đầu giờ, ngữ pháp, ôn tập, bài tập, luyện theo dạng sách bài tập.</p>
        <span class="go">Vào học →</span>
      </a>
'''
    h = h.replace('      <a class="card" href="tro-choi/">', the + '      <a class="card" href="tro-choi/">', 1); open(ip, 'w', encoding='utf-8').write(h)
print('ok')
