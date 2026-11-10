# -*- coding: utf-8 -*-
"""python3 tools/sach_bai_tap/them_trang.py N  — tạo bai-N/sach-bai-tap.html (từ khung Bài 5) và thẻ ở trang bài."""
import re, sys, os, json
G = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
N = int(sys.argv[1]); H = os.path.join(G, 'chuong-trinh-hsk/hsk1')
d = json.load(open(os.path.join(G, 'data/bai/sach-bai-tap/bai-%d.json' % N), encoding='utf-8'))
s = open(os.path.join(H, 'bai-5/sach-bai-tap.html'), encoding='utf-8').read()
s = s.replace('Bài 5', 'Bài %d' % N).replace('第五课：今天我休息', '第%s课：%s' % ('一二三四五六七八九十'[N-1], d['ten'])).replace('第五课', '第%s课' % '一二三四五六七八九十'[N-1])
s = s.replace('sach-bai-tap/bai-5.json', 'sach-bai-tap/bai-%d.json' % N)
open(os.path.join(H, 'bai-%d/sach-bai-tap.html' % N), 'w', encoding='utf-8').write(s)
ip = os.path.join(H, 'bai-%d/index.html' % N); t = open(ip, encoding='utf-8').read()
if 'sach-bai-tap.html' not in t:
    c5 = re.search(r'\s*<a class="card" href="sach-bai-tap\.html">.*?</a>', open(os.path.join(H, 'bai-5/index.html'), encoding='utf-8').read(), flags=re.S).group(0)
    t = re.sub(r'(<a class="card" href="bai-tap\.html">.*?</a>)', lambda m: m.group(1) + c5, t, count=1, flags=re.S)
    t = t.replace('6. Bảng xếp hạng', '7. Bảng xếp hạng')
    open(ip, 'w', encoding='utf-8').write(t)
print('ok', N)
