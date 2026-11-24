# -*- coding: utf-8 -*-
"""python3 tools/sach_bai_tap/them_trang_h2.py N  — tạo chuong-trinh-hsk-2/hsk1/bai-N/sach-bai-tap.html (khung Bài 5 HSK 3.0, đổi cho HSK 2.0) và thẻ ở trang bài."""
import re, sys, os, json
G = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
N = int(sys.argv[1]); H2 = os.path.join(G, 'chuong-trinh-hsk-2/hsk1')
d = json.load(open(os.path.join(G, 'data/hsk2/sach-bai-tap/bai-%d.json' % N), encoding='utf-8'))
s = open(os.path.join(G, 'chuong-trinh-hsk/hsk1/bai-5/sach-bai-tap.html'), encoding='utf-8').read()
so = '一二三四五六七八九十'[N - 1]
s = s.replace('Bài 5', 'Bài %d' % N).replace('第五课：今天我休息', '第%s课：%s' % (so, d['ten'])).replace('第五课', '第%s课' % so)
s = s.replace('HSK 1 · Tiếng Trung Diệu Kỳ', 'HSK 2.0 · HSK 1 · Tiếng Trung Diệu Kỳ')
s = s.replace('luyện nghe chọn âm tiết và bốn phần đọc hiểu theo dạng sách bài tập HSK 1.', 'luyện nghe và đọc hiểu theo dạng sách bài tập HSK 1 (giáo trình HSK 标准教程).')
s = s.replace('Chương trình HSK 3.0', 'Chương trình HSK 2.0')
s = s.replace('Các dạng bài của sách bài tập HSK 1, câu soạn mới theo bài 5.', 'Phần Nghe và phần Đọc theo dạng bài của sách bài tập HSK 1 (giáo trình HSK 标准教程), câu soạn mới theo bài %d.' % N)
s = s.replace('data/bai/sach-bai-tap/bai-5.json?v=20261107b', 'data/hsk2/sach-bai-tap/bai-%d.json?v=%s' % (N, d['phienBan'].replace('-', '')))
open(os.path.join(H2, 'bai-%d/sach-bai-tap.html' % N), 'w', encoding='utf-8').write(s)
ip = os.path.join(H2, 'bai-%d/index.html' % N); t = open(ip, encoding='utf-8').read()
if 'sach-bai-tap.html' not in t:
    the = ('\n      <a class="card" href="sach-bai-tap.html"><div class="ico-big">📒</div><h3>6. Luyện theo dạng sách bài tập</h3>\n'
           '        <p>Phần Nghe (nghe âm tiết, chọn tranh, nghe hội thoại, nghe câu hỏi) và phần Đọc (chọn tranh, nối câu, điền từ) theo dạng bài của sách bài tập.</p><span class="go">Làm bài →</span></a>')
    t2 = re.sub(r'(<a class="card" href="bai-tap\.html">.*?</a>)', lambda m: m.group(1) + the, t, count=1, flags=re.S)
    assert t2 != t
    open(ip, 'w', encoding='utf-8').write(t2)
print('ok', N)
