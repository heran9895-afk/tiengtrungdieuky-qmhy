# -*- coding: utf-8 -*-
"""Dựng data/hsk2/sach-bai-tap/bai-N.json — "Luyện theo dạng sách bài tập" của Chương trình HSK 2.0 (Bài 3 trở đi; chỉ Nghe + Đọc).
   python3 tools/sach_bai_tap/dung_h2.py kiem   -> kiểm file âm, ảnh, vốn chữ, pinyin
   python3 tools/sach_bai_tap/dung_h2.py ghi    -> ghi data/hsk2/sach-bai-tap/bai-N.json
"""
import json, os, sys, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from dung import dung, kiem, GOC
import noi_dung_h2 as H
sys.path.insert(0, os.path.join(GOC, 'tools'))
from dung_chung_h2 import CHU2, TEN_RIENG2

CHU2 = dict(CHU2); CHU2['7'] = '请问号星期昨校看书'          # chữ mới Bài 7 (sổ tích lũy HSK 2.0 chưa ghi): 今 天 月 去 大 中 小 学 生 đã có từ trước
THU_TU = ['1-2', '3', '4', '5', '6', '7']

def von(n):
    s = ''
    for k in THU_TU:
        s += CHU2[k]
        if k == str(n): break
    return set(s) | set(TEN_RIENG2) | set('〇')

def chu_trong(d):
    for p in d['phan']:
        if p['loai'] == 'am': continue
        for c in p['cau']:
            for l in c.get('loi', []): yield p['ten'], l['han']
            if 'han' in c: yield p['ten'], c['han']
            for o in c.get('pa', []): yield p['ten'], o['han']
            if c.get('hoi'): yield p['ten'], c['hoi']['han']
        for o in p.get('luaChon', []):
            if o['han'] != '好的，谢谢！': yield p['ten'], o['han']      # 例如 của sách (đã cho dùng)

def kiem_chu(n, d):
    ok = von(n); loi = []
    for ten, t in chu_trong(d):
        for ch in t:
            if '一' <= ch <= '鿿' and ch not in ok: loi.append('chữ ngoài vốn Bài %d: %s trong "%s" (%s)' % (n, ch, t, ten))
    return loi

if __name__ == '__main__':
    lenh = sys.argv[1] if len(sys.argv) > 1 else 'kiem'
    tong = []
    for b in H.BAI:
        d = dung(b)
        d.update(nhan='HSK 2.0 · Bài %d' % b['bai'], maPhan='h2-sbt-bai%d' % b['bai'], ct='hsk2')
        l = kiem(b, d) + kiem_chu(b['bai'], d); tong += l
        print('Bài %d: %s' % (b['bai'], ', '.join('%s %d' % (p['ten'], len(p['cau'])) for p in d['phan'])))
        for x in sorted(set(l)): print('  ⚠', x)
        if lenh == 'ghi':
            os.makedirs(os.path.join(GOC, 'data/hsk2/sach-bai-tap'), exist_ok=True)
            with open(os.path.join(GOC, 'data/hsk2/sach-bai-tap/bai-%d.json' % b['bai']), 'w', encoding='utf-8') as f:
                json.dump(d, f, ensure_ascii=False, indent=1)
    print('Lỗi:', len(tong))
