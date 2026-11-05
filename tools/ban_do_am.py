"""Tạo bảng tra chữ → file ghi âm: assets/am/ban-do.json.
Giữ các mục đã có trong ban-do.json, thêm mọi cặp (chữ, file) có trong data/bai/bai-*.json.
Khóa chuẩn hóa giống chuanAm() trong assets/js/tu-vung-chung.js.
Chạy: python3 tools/ban_do_am.py"""
import json, re, glob, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(R, 'assets/am/ban-do.json')
FILE = re.compile(r'\.(mp3|m4a|wav|ogg)$')
def chuan(s):
    s = re.sub(r'\s+', '', str(s or ''))
    s = re.sub(r'(^|[。！？])[A-Z一-鿿]{1,4}[：:]', r'\1', s)
    return re.sub(r'[—–\-“”"]', '', s).replace('！', '。')
def tao(them=None):
    M = json.load(open(OUT)) if os.path.exists(OUT) else {}
    def add(t, f):
        # file giọng riêng của nhân vật (assets/am/nam1/, nu2/…) không đưa vào bảng tra chung: cùng câu ở chỗ khác vẫn đọc giọng Sulafat
        if t and isinstance(f, str) and FILE.search(f) and not re.match(r'assets/am/(nam|nu)\d/', f) and os.path.exists(os.path.join(R, f)): M.setdefault(chuan(t), f)
    for k, f in (them or {}).items(): add(k, f)
    for p in sorted(glob.glob(os.path.join(R, 'data/bai/bai-*.json'))):
        d = json.load(open(p))
        for w in d.get('tu', []):
            add(w.get('Chữ Hán'), w.get('Đọc từ'))
            for i in (1, 2): add(w.get('Câu %d' % i), w.get('Đọc câu %d' % i))
        for c in d.get('cauLuyen', []): add(c.get('han'), c.get('doc'))
        for h in d.get('hoiDap', []):
            for a in [h['hoi'], h['dap']] + h.get('nhieu', []):
                if len(a) > 3: add(a[0], a[3])
        for h in d.get('hoiThoai', []):
            for l in h.get('luot', []): add(l.get('han'), l.get('doc'))
            for v in (h.get('nhieu') or {}).values():
                for x in v: add(x.get('han'), x.get('doc'))
        for g in d.get('nguPhap', []):
            for y in g.get('y', []):
                for v in y.get('viDu', []):
                    if len(v) > 4: add(v[0], v[4])
        for c in d.get('nguPhapLuyen', {}).get('cau', []):
            add(c.get('dap'), c.get('docDap'))
            if c.get('doc'): pass
    M = {k: M[k] for k in sorted(M)}
    json.dump(M, open(OUT, 'w'), ensure_ascii=False, separators=(',', ':'))
    return M
if __name__ == '__main__':
    print(len(tao()), 'mục')
