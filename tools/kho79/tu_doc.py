"""Câu chữ Hán ngắn hơn cột Đọc (đã viết đủ vế): lấy phần đuôi của Đọc nối vào câu. python3 tu_doc.py dot-x"""
import json, sys, os, re
p = os.path.join(os.path.dirname(__file__), sys.argv[1] + '.jsonl')
L = [json.loads(l) for l in open(p, encoding='utf-8') if l.strip()]
HAN = re.compile(r'[㐀-鿿]')
n = 0
for e in L:
    for c in e['c']:
        h, d = c[0], c[3]
        if d and d != '-' and len(d) > len(h) + 2 and d[len(h) - 1] in '，、；：':
            duoi = d[len(h) - 1:]
            for a, b in [('荡', '当'), ('岛', '倒'), ('毫好', '好好'), ('一厂', '一场'), ('虫', '重'), ('众', '种'), ('杯着', '背着'), ('歹', '逮'), ('到属', '倒数'), ('到计', '倒计')]:
                duoi = duoi.replace(a, b)
            c[0] = h[:-1] + duoi
            n += 1
            print(e['m'], c[0])
open(p, 'w', encoding='utf-8').write(''.join(json.dumps(e, ensure_ascii=False) + '\n' for e in L))
print('sửa', n)
