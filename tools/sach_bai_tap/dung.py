# -*- coding: utf-8 -*-
"""Dựng dữ liệu mục "Luyện theo dạng sách bài tập" (HSK 3.0, HSK 1).
   Câu soạn mới theo dạng bài của sách bài tập HSK 1 (3.0), không chép đề sách.
   python3 tools/sach_bai_tap/dung.py kiem   -> kiểm tra file âm, ảnh, phạm vi
   python3 tools/sach_bai_tap/dung.py ghi    -> ghi data/bai/sach-bai-tap/bai-N.json
"""
import json, os, sys, unicodedata, hashlib
GOC = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from noi_dung import BAI
import re
BAN_DO = json.load(open(os.path.join(GOC, 'assets/am/ban-do.json'), encoding='utf-8'))
def chuan(t): return re.sub(r'\s+', '', t).replace('！', '。')

DAU = {'a': 'āáǎà', 'o': 'ōóǒò', 'e': 'ēéěè', 'i': 'īíǐì', 'u': 'ūúǔù', 'ü': 'ǖǘǚǜ'}

def danh_dau(van, t):
    """Đặt dấu thanh t (1–4) lên vần viết (không số)."""
    if t == 5 or t == 0:
        return van
    v = van
    for k in 'ae':
        if k in v:
            i = v.index(k); return v[:i] + DAU[k][t-1] + v[i+1:]
    if 'ou' in v:
        i = v.index('o'); return v[:i] + DAU['o'][t-1] + v[i+1:]
    for i in range(len(v)-1, -1, -1):
        if v[i] in 'oiuü':
            return v[:i] + DAU[v[i]][t-1] + v[i+1:]
    return v

THANH_MAU = ['zh', 'ch', 'sh', 'b', 'p', 'm', 'f', 'd', 't', 'n', 'l', 'g', 'k', 'h', 'j', 'q', 'x', 'r', 'z', 'c', 's', 'y', 'w']

def tach(am):
    """'xue2' -> ('x', 'ue', 2)  (viết theo chính tả: j q x + ü viết u)"""
    t = int(am[-1]); s = am[:-1].replace('v', 'ü')
    for tm in THANH_MAU:
        if s.startswith(tm) and len(s) > len(tm):
            return tm, s[len(tm):], t
    return '', s, t

def py(am):
    tm, van, t = tach(am)
    return tm + danh_dau(van, t)

def file_am(am):
    return 'assets/am/py/' + am + '.mp3'

def dung_cau_am(loai, bai, k, am, nhieu):
    tm, van, t = tach(am)
    c = {'ma': '%s-%s' % (loai, am), 'loa': file_am(am), 'py': py(am)}
    if loai == 'tm':
        c.update(hien='＿' + danh_dau(van, t), dap=tm, nhieu=nhieu)
    elif loai == 'vm':
        c.update(hien=tm + '＿', dap=danh_dau(van, t), nhieu=[danh_dau(n, t) for n in nhieu])
    elif loai == 'at':   # chọn cả âm tiết
        c.update(hien='', dap=py(am), nhieu=[py(n) for n in nhieu])
    else:  # tđ
        c.update(hien=tm + van, dap=py(am), nhieu=[tm + danh_dau(van, x) for x in (1, 2, 3, 4) if x != t])
    return c

def dung(bai):
    out = {'bai': bai['bai'], 'ten': bai['ten'], 'tenViet': bai['tenViet'], 'phienBan': bai['phienBan'], 'phan': []}
    for p in bai['phan']:
        q = {k: v for k, v in p.items() if k != 'cau'}
        if p['loai'] in ('tm', 'vm', 'td', 'at'):
            q['cau'] = [dung_cau_am(p['loai'], bai['bai'], i, c[0], c[1] if len(c) > 1 else []) for i, c in enumerate(p['cau'])]
            q['loai'] = 'am'; q['kieu'] = p['loai']
        else:
            q['cau'] = [dict(c) for c in p['cau']]
            for c in [c for c in q['cau'] if 'loi' in c]:   # hội thoại: lời nào cũng đã có file giọng Gemini thì phát lần lượt (A|B)
                # hai giọng theo quy chuẩn 14 §4b: nu1 = Sulafat (bảng tra / cau/), giọng khác ở assets/am/<giọng>/
                gs = c.pop('giong', None) or ['nu1'] * len(c['loi'])
                fs = []
                for v, g in zip(c['loi'], gs):
                    k = chuan(v['han']); h = hashlib.md5(k.encode()).hexdigest()[:10]
                    f = (BAN_DO.get(k) or 'assets/am/cau/%s.mp3' % h) if g == 'nu1' else 'assets/am/%s/%s.mp3' % (g, h)
                    fs.append(f if os.path.exists(os.path.join(GOC, f)) else None)
                if 'doc' not in c and all(fs): c['doc'] = '|'.join(fs)
                elif not all(fs): print('  ⚠ thiếu file giọng:', c['ma'], [v['han'] for v, f in zip(c['loi'], fs) if not f])
        out['phan'].append(q)
    return out

def kiem(bai, d):
    loi = []
    for p in d['phan']:
        for c in p['cau']:
            if p['loai'] == 'am':
                if not os.path.exists(os.path.join(GOC, c['loa'])):
                    loi.append('thiếu âm ' + c['loa'])
                pa = [c['dap']] + c['nhieu']
                if len(set(pa)) != len(pa): loi.append('trùng phương án ' + c['ma'])
            if p['loai'] != 'am':
                ks = [a['k'] for a in (c.get('pa') or p.get('anh') or p.get('luaChon') or [])]
                if c['dap'] not in ks: loi.append('đáp án lạ ' + c['ma'])
        if p['loai'] in ('doc-ghep', 'doc-dien', 'doc-tranh'):
            dung_ = [c['dap'] for c in p['cau']]
            if len(set(dung_)) != len(dung_): loi.append('hai câu trùng đáp án ở ' + p['ten'])
        for a in p.get('anh', []):
            if not os.path.exists(os.path.join(GOC, a['src'])): loi.append('thiếu ảnh ' + a['src'])
    return loi

if __name__ == '__main__':
    lenh = sys.argv[1] if len(sys.argv) > 1 else 'kiem'
    tong = []
    for b in BAI:
        d = dung(b); l = kiem(b, d); tong += l
        print('Bài %d: %s' % (b['bai'], ', '.join('%s %d câu' % (p['ten'], len(p['cau'])) for p in d['phan'])))
        for x in l: print('  ⚠', x)
        if lenh == 'ghi':
            os.makedirs(os.path.join(GOC, 'data/bai/sach-bai-tap'), exist_ok=True)
            with open(os.path.join(GOC, 'data/bai/sach-bai-tap/bai-%d.json' % b['bai']), 'w', encoding='utf-8') as f:
                json.dump(d, f, ensure_ascii=False, indent=1)
    print('Lỗi:', len(tong))
