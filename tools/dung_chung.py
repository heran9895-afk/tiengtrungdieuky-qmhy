#!/usr/bin/env python3
"""Máy dựng data/bai/bai-N.json cho bài HSK 3.0 từ 6 trở đi (cùng logic với tools/bai5/dung.py, dùng chung để Bài 6, 7… không chép lại).
Mỗi bài có thư mục tools/baiN/ gồm noi_dung.py (từ, bộ thủ, ghép chữ), ngu_phap.py (thẻ ngữ pháp), kho_cau.py (CAU, HD, HT, DOC_TU) và dung.py gọi:
    from dung_chung import chay; chay(N, __file__)
Sau đó chạy: tools/bai_khoa.py gop → tools/ngu_phap_luyen.py gop → tools/cau_tao_truoc.py → tools/tro_choi_du_lieu.py hsk3 → tools/ban_do_am.py
  python3 tools/baiN/dung.py kiem | ghi"""
import json, os, re, sys, glob, importlib

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(GOC, 'tools'))
from ngu_phap_luyen import CHU, TEN_RIENG, strip, han

TEN_CHANG = {1: 'Ôn tập từ vựng 1', 2: 'Ôn tập từ vựng 2', 3: 'Ôn tập từ vựng 3'}


def doc(p): return json.load(open(os.path.join(GOC, p), encoding='utf-8'))
def khong_nhan(s): return ''.join(re.sub(r'^[AB][：:]\s*', '', d) for d in s.split('\n'))


def kho_tra():
    kho = {}
    for f in sorted(glob.glob(os.path.join(GOC, 'data', 'tu-vung', 'cap-*.json'))):
        for x in doc(f):
            kho.setdefault(x['Chữ Hán'], []).append(x)
    return kho


def tim(kho, chu, py):
    ds = kho.get(chu, [])
    hop = [x for x in ds if strip(x['Pinyin']) == strip(py)] or ds
    return hop[0] if hop else None


def dung(N, N_, NP, K):
    kho = kho_tra()
    daCo = set()                                              # chữ đã có Thuận bút ở thẻ các bài trước
    for n in range(1, N):
        for w in doc(f'data/bai/bai-{n}.json')['tu']: daCo |= set(han(w.get('Thuận bút') or ''))
    tu, loi = [], []
    for (chu, py, loai, nghia, nhom, chang, cum, c1, c2) in N_.TU:
        x = tim(kho, chu, py.replace('∥', '').replace('·', ''))
        if not x: loi.append(f'không có trong kho: {chu}')
        tb = ''.join(c for c in dict.fromkeys(chu) if c not in daCo); daCo |= set(chu)
        w = {'Mã': x['Mã'] if x else '', 'Chữ Hán': chu, 'Pinyin': py, 'Âm Hán Việt': (x or {}).get('Âm Hán Việt', ''),
             'Từ loại': loai, 'Nghĩa tiếng Việt': nghia, 'Cấp HSK': (x['Mã'].split('-')[0] if x else ''), 'Thuận bút': tb,
             'Cụm từ': '\n'.join(f'{a} | {b}' for a, b in cum), 'Đọc từ': K.DOC_TU.get(chu, ''), '_nhom': nhom}
        for i, c in ((1, c1), (2, c2)):
            w[f'Câu {i}'], w[f'Pinyin câu {i}'], w[f'Nghĩa câu {i}'] = c[0], c[1], c[2]
            w[f'Đọc câu {i}'] = c[4] if len(c) > 4 else (khong_nhan(c[0]) if '\n' in c[0] else '')
            if '\n' in c[0] and len(c) > 4: w[f'Đọc câu {i}'] = khong_nhan(c[4])
        w['_chang'] = chang
        tu.append(w)
    chang = []
    for so in (1, 2, 3):
        chang.append({'so': so, 'ten': TEN_CHANG[so], 'tu': [w['Chữ Hán'] for w in tu if w['_chang'] == so],
                      'ghepChu': [g[0] for g in N_.GHEP if g[2] == so]})
    for w in tu: del w['_chang']
    tuBai = [w['Chữ Hán'] for w in tu]

    def tuTrong(s):
        co = [t for t in tuBai if t in s]
        return [t for t in co if not any(t != u and t in u and s.count(t) == s.count(u) for u in co)]

    def changCua(*cau):
        s = ''.join(cau); can = [t for t in tuBai if t in s]; hoc = []
        for c in chang:
            hoc += c['tu']
            if all(t in hoc for t in can): return str(c['so'])
        return '3'
    cl = []
    for c in K.CAU:
        o = {'han': c[0], 'py': c[1], 'viet': c[2], 'tu': tuTrong(c[0])}
        if c[3]: o['np'] = c[3]
        if len(c) > 4: o['doc'] = c[4]
        cl.append(o)
    hd = [dict(h, chang=changCua(h['hoi'][0], h['dap'][0])) for h in K.HD]
    ht = []
    for h in K.HT:
        ht.append({'ten': h['ten'], 'luot': [{'han': x[0], 'py': x[1], 'viet': x[2]} for x in h['luot']],
                   'nhieu': {str(k): [{'han': x[0], 'py': x[1]} for x in v] for k, v in h['nhieu'].items()},
                   'chang': changCua(*[x[0] for x in h['luot']])})
    tp = dict(N_.THANH_PHAN); coBo = {b['boThu'] for b in N_.BO_THU}
    truoc = {}
    for n in range(1, N):
        for b in doc(f'data/bai/bai-{n}.json')['boThu']: truoc.setdefault(b['boThu'], b)
    for g in N_.GHEP:                                          # thành phần ghép đã có thẻ ở bài trước: mang tên, nghĩa sang để hiện nhãn
        for p in g[1]:
            if p not in coBo and p not in tp:
                if p in truoc: tp[p] = {'pinyin': truoc[p]['pinyin'], 'ten': truoc[p]['ten'], 'nghia': truoc[p]['nghia']}
                else:
                    ct = doc('data/tu-vung/cau-tao.json')['tp'].get(p)
                    if ct: tp[p] = ct
                    else: loi.append(f'thành phần {p} của {g[0]} chưa có thông tin')
    d = {'bai': N, 'ten': N_.TEN, 'tenViet': N_.TEN_VIET, 'pinyinTen': N_.PINYIN_TEN, 'tenRieng': N_.TEN_RIENG,
         'maBaiTap': f'bai{N}-bai-tap', 'tu': tu, 'boThu': N_.BO_THU, 'thanhPhan': tp,
         'ghepChu': [{'chu': g[0], 'phan': g[1]} for g in N_.GHEP], 'chang': chang, 'nguPhap': NP.NGU_PHAP,
         'hoiDap': hd, 'cauLuyen': cl, 'hoiThoai': ht}
    return d, loi


def kiem(N, d, loi):
    from pypinyin import lazy_pinyin
    von = set(''.join(CHU[k] for k in CHU if k <= N)) | set(TEN_RIENG)
    def ck(s, py, nhan):
        s2 = re.sub(r'\b[AB][：:]', '', s); py2 = re.sub(r'\b[AB]:', '', py or '')
        ng = [c for c in han(s2) if c not in von]
        if ng: loi.append(f'{nhan}: chữ ngoài vốn {ng} :: {s}')
        if py is None: return
        def doc_(yao, er):
            return strip(''.join('ling' if c == '〇' else 'yao' if (yao and c == '一') else 'r' if (er and c == '儿') else lazy_pinyin(c)[0] for c in han(s2)))
        if strip(py2) not in {doc_(a, b) for a in (False, True) for b in (False, True)}: loi.append(f'{nhan}: pinyin lệch :: {s} | {py}')
    for w in d['tu']:
        ck(w['Chữ Hán'], w['Pinyin'].replace('·', ''), 'từ')
        for dong in w['Cụm từ'].split('\n'):
            a, b = dong.split(' | '); ck(a, b, f'cụm {w["Chữ Hán"]}')
        for i in (1, 2):
            ck(w[f'Câu {i}'], w[f'Pinyin câu {i}'], f'câu {w["Chữ Hán"]}')
            if w[f'Câu {i}'].count('\n') != w[f'Pinyin câu {i}'].count('\n') or w[f'Câu {i}'].count('\n') != w[f'Nghĩa câu {i}'].count('\n'):
                loi.append(f'số dòng lệch: {w["Chữ Hán"]} câu {i}')
    for g in d['nguPhap']:
        for y in g['y']:
            for k in ('cum', 'viDu'):
                for c in y.get(k, []):
                    ck(c[0], c[1], f'NP {g["id"]}')
                    if ''.join(x[0] for x in c[3]) != c[0]: loi.append(f'NP {g["id"]}: đoạn màu không ghép lại đúng :: {c[0]}')
    for c in d['cauLuyen']: ck(c['han'], c['py'], 'câu luyện')
    for h in d['hoiDap']:
        for x in [h['hoi'], h['dap']] + h['nhieu']: ck(x[0], x[1], 'hỏi đáp')
    for h in d['hoiThoai']:
        for x in h['luot']: ck(x['han'], x['py'], 'hội thoại')
        for k, xs in h['nhieu'].items():
            for x in xs:
                ck(x['han'], x['py'], 'nhiễu HT')
                if x['han'] == h['luot'][int(k)]['han']: loi.append('nhiễu trùng đáp án')
    # mỗi chữ mới của bài (chuHanMoi) phải nằm trong một thẻ từ; chữ chưa có thẻ thì báo để cô quyết
    moi = CHU[N]; trong = set(''.join(w['Chữ Hán'] for w in d['tu']))
    chua = [c for c in moi if c not in trong]
    if chua: print('Chữ mới chưa nằm trong thẻ từ nào (chỉ có trên slide):', ''.join(chua))
    tb = [w['Chữ Hán'] + ':' + w['Thuận bút'] for w in d['tu']]
    print('Thuận bút:', ' '.join(tb))
    print('Chặng:', [(c['so'], len(c['tu']), c['ghepChu']) for c in d['chang']])
    print(f"{len(d['tu'])} thẻ · {len(d['nguPhap'])} NP · {len(d['cauLuyen'])} câu luyện · {len(d['hoiDap'])} hỏi đáp · {len(d['hoiThoai'])} hội thoại")
    for l in loi: print('  ✗', l)
    print('Lỗi:', len(loi)); return loi


def chay(N, tep):
    day = os.path.dirname(os.path.abspath(tep)); sys.path.insert(0, day)
    N_ = importlib.import_module('noi_dung'); NP = importlib.import_module('ngu_phap'); K = importlib.import_module('kho_cau')
    d, loi = dung(N, N_, NP, K)
    if kiem(N, d, loi): sys.exit(1)
    if len(sys.argv) > 1 and sys.argv[1] == 'ghi':
        out = os.path.join(GOC, 'data', 'bai', f'bai-{N}.json')
        if os.path.exists(out):                               # giữ phần do công cụ khác ghi (ctTruoc, nguPhapLuyen, câu bài khóa)
            cu = json.load(open(out, encoding='utf-8'))
            for k in ('ctTruoc', 'nguPhapLuyen'):
                if k in cu: d[k] = cu[k]
            d['cauLuyen'] += [c for c in cu.get('cauLuyen', []) if c.get('nguon') == 'baiKhoa']
            d['hoiDap'] += [c for c in cu.get('hoiDap', []) if c.get('nguon') == 'baiKhoa']
            d['hoiThoai'] += [c for c in cu.get('hoiThoai', []) if c.get('nguon') == 'baiKhoa']
        open(out, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n')
        print('Đã ghi', out)
