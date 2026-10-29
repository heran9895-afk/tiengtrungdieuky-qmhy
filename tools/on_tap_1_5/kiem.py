# -*- coding: utf-8 -*-
"""Kiểm nội dung Ôn tập tổng hợp Bài 1–5.
  python3 tools/on_tap_1_5/kiem.py          # kiểm toàn bộ, in lỗi + bảng phủ
  python3 tools/on_tap_1_5/kiem.py py       # in pinyin tự sinh của đáp án dịch để soát
"""
import os, sys, importlib.util, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import von

DIR = os.path.dirname(os.path.abspath(__file__))


def nap(ten):
    sp = importlib.util.spec_from_file_location(ten, os.path.join(DIR, ten + '.py'))
    m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m


NP_TEN = {}
for n, d in von.BAI.items():
    for g in d.get('nguPhap', []):
        NP_TEN[g['id']] = (n, g['ten'])
NP_TEN.update({'b1-chao': (1, 'Chào hỏi: 你好 · 您好 · 大家好 · 老师好'), 'b1-men': (1, '们: hậu tố số nhiều (同学们, 你们)'),
               'b1-camon': (1, 'Cảm ơn – đáp lời: 谢谢 · 不客气'), 'b1-taobiet': (1, 'Tạm biệt: 再见 · 明天见'),
               'b1-nin': (1, '您: kính ngữ của 你')})


def cac_cau_dich(D):
    for c in D.CAU:
        yield c['ma'], c, c['zh']
    for h in D.HOI_THOAI:
        for i, l in enumerate(h['luot'], 1):
            yield f"{h['ma']}-{i}", l, l['zh']
    for d in D.DOAN_VAN:
        for i, l in enumerate(d['cau'], 1):
            yield f"{d['ma']}-{i}", l, l['zh']


def kiem_dich(in_py=False):
    D = nap('dich')
    loi, phu, np_phu = [], collections.defaultdict(list), collections.defaultdict(list)
    for ma, it, zh in cac_cau_dich(D):
        for k, s in enumerate(zh):
            ng = von.chu_ngoai(s)
            if ng: loi.append(f'{ma}: chữ ngoài vốn {ng} :: {s}')
            tu, l2 = von.tach(s)
            if l2: loi.append(f'{ma}: chữ không thuộc từ nào đã học {l2} :: {s}')
            if k == 0:
                for w in tu:
                    if w in von.TU: phu[w].append(ma)
        if in_py: print(ma, zh[0], '\n   ', von.pinyin_cau(zh[0]))
    for nhom in (D.CAU, D.HOI_THOAI, D.DOAN_VAN):
        for it in nhom:
            for p in it.get('np', []):
                if p not in NP_TEN: loi.append(f"{it['ma']}: mã ngữ pháp lạ {p}")
                np_phu[p].append(it['ma'])
    thieu_tu = [w for w in von.TU_HOC if w not in phu]
    thieu_np = [p for p in NP_TEN if p not in np_phu]
    return loi, phu, np_phu, thieu_tu, thieu_np


if __name__ == '__main__':
    loi, phu, np_phu, thieu_tu, thieu_np = kiem_dich('py' in sys.argv)
    print('== Bài dịch ==')
    for l in loi: print('  LỖI', l)
    print(f'  Phủ từ vựng: {len(von.TU_HOC) - len(thieu_tu)}/{len(von.TU_HOC)}; thiếu: {" ".join(thieu_tu)}')
    print(f'  Phủ ngữ pháp: {len(NP_TEN) - len(thieu_np)}/{len(NP_TEN)}; thiếu: {thieu_np}')


# ===================== các phần trắc nghiệm =====================
import json, re
NET = json.load(open(os.path.join(DIR, 'net_cnchar.json'), encoding='utf-8'))
NHAP_MON = set('口月十人八三你国小文半书太床包这山问医明谢字京回店远同凶品日水学好我息也中四很么女多有九号专没奶语院及六一汉大')
BO_THU = set()
for d in von.BAI.values():
    for b in d.get('boThu', []): BO_THU.add(b['boThu'])
    for k in d.get('thanhPhan', {}): BO_THU.add(k)
    for g in d.get('ghepChu', []): BO_THU.update(g['phan'])
CHO_PHEP_CHU = von.VON | NHAP_MON | BO_THU
KC = {'Độc thể': '独体结构', 'Trái phải': '左右结构', 'Trái giữa phải': '左中右结构', 'Trên dưới': '上下结构',
      'Trên giữa dưới': '上中下结构', 'Bao toàn phần': '全包围结构', 'Chữ phẩm': '品字结构'}


def co_net(c, ten_vi):
    key = {'Chấm': lambda n: n in ('点', '点2'), 'Ngang': lambda n: n == '横', 'Sổ': lambda n: n == '竖',
           'Phẩy': lambda n: n == '撇', 'Mác': lambda n: n == '捺', 'Hất': lambda n: n == '提',
           'Gập': lambda n: '折' in n, 'Móc': lambda n: '钩' in n}[ten_vi]
    ds = NET[c]['ten']
    co = any(key(n) for n in ds if '|' not in n)
    mo = any(any(key(x) for x in n.split('|')) for n in ds if '|' in n)
    return co, mo


def kiem_trac_nghiem():
    T = nap('on_tap')
    loi = []

    def chu(s, nhan, cau=False):
        ng = [c for c in s if von.la_han(c) and c not in CHO_PHEP_CHU]
        if ng: loi.append(f'{nhan}: chữ ngoài vốn {ng} :: {s}')
        if cau:
            _, l2 = von.tach(s)
            if l2: loi.append(f'{nhan}: chữ không thuộc từ đã học {l2} :: {s}')

    for c, d, nh in T.THANH_MAU + T.VAN_MAU: chu(c, 'Ngữ âm')
    for c, nh in T.NGHE_CHU: chu(c + ''.join(nh), 'Nghe chữ')
    for w, d, nh in T.PY_TU:
        chu(w, 'Pinyin từ')
        if von.TU_DIEN.get(w, '').replace(' ', '') != d.replace(' ', ''): loi.append(f'Pinyin từ {w}: {d} ≠ dữ liệu bài {von.TU_DIEN.get(w)}')
    for q in T.QUY_TAC_AM: chu(q[0] + q[1] + ''.join(q[2]), 'Quy tắc âm')
    # đếm nét: hanzi-writer + cnchar phải khớp
    hw = '/tmp/claude-0/-home-claude/c1bbc46d-4a3a-56e8-9e64-f9eaa29dc6d4/scratchpad/hw/node_modules/hanzi-writer-data/'
    for c in T.DEM_NET:
        chu(c, 'Đếm nét')
        n1 = NET[c]['n']
        if os.path.exists(hw + c + '.json'):
            n2 = len(json.load(open(hw + c + '.json'))['strokes'])
            if n1 != n2: loi.append(f'Đếm nét {c}: cnchar {n1} ≠ hanzi-writer {n2}')
    for ten, co, dap, nh in T.TIM_NET:
        a, mo = co_net(dap, ten)
        if (mo and not a) or a != co: loi.append(f'Tìm nét {ten}: đáp án {dap} không chắc ({NET[dap]["ten"]})')
        for x in nh:
            b, mo2 = co_net(x, ten)
            if (mo2 and not b) or b == co: loi.append(f'Tìm nét {ten}: nhiễu {x} cũng đúng / không chắc ({NET[x]["ten"]})')
        chu(dap + ''.join(nh), 'Tìm nét')
    VI = {'点': 'Chấm', '点2': 'Chấm', '横': 'Ngang', '竖': 'Sổ', '撇': 'Phẩy', '捺': 'Mác', '提': 'Hất'}
    for c, t in T.NET_DAU:
        if VI.get(NET[c]['ten'][0]) != t: loi.append(f'Nét đầu {c}: {NET[c]["ten"][0]} ≠ {t}')
    for loai, v in T.LOAI_HINH.items():
        for c in v['chu']: chu(c, 'Loại hình')
    seen = {}
    for loai, ds in T.KET_CAU.items():
        for c in ds:
            chu(c, 'Kết cấu')
            if c in seen: loi.append(f'Kết cấu: {c} ở hai nhóm')
            seen[c] = loai
            kc = NET.get(c, {}).get('kc')
            ky = KC.get(loai, '半包围结构')
            if kc != ky: loi.append(f'Kết cấu {c}: ghi "{loai}", cnchar {kc}')
    for bo, dap, nh in T.TIM_BO:
        chu(dap + ''.join(nh), 'Tìm bộ')
    tu_nhom = {}
    for nhom, ds in T.NHOM_TU.items():
        for w in ds:
            if w not in von.TU: loi.append(f'Nhóm từ: {w} không phải từ của bài')
            if w in tu_nhom: loi.append(f'Nhóm từ: {w} ở hai nhóm')
            tu_nhom[w] = nhom
    for w, ds, g in T.KHAC_NHOM:
        for x in [w] + ds:
            if x not in von.TU: loi.append(f'Khác nhóm: {x} không phải từ của bài')
    for it in T.NGU_PHAP:
        for s in [it.get('de', ''), it.get('dap', '') if isinstance(it.get('dap'), str) else '', it.get('cau', ''), it.get('sua', '')] + \
                (it['dap'] if isinstance(it.get('dap'), list) else []) + it.get('nhieu', []) + it.get('khoi', []):
            if not s: continue
            if it['dang'] == 'dungSai' and s == it.get('cau') and not it['dung']:
                chu(s, it['ma'])          # câu sai có thể không tách được thành từ đúng
            else:
                chu(s.replace('＿', ''), it['ma'], cau=True)
        if it['np'] not in NP_TEN: loi.append(f"{it['ma']}: mã ngữ pháp lạ {it['np']}")
        if it['dang'] == 'xep':
            for d in it['dap']:
                if sorted(re.sub(r'[。？！，]', '', d)) != sorted(''.join(it['khoi'])): loi.append(f"{it['ma']}: khối không ghép ra {d}")
    for d in T.DOC_HIEU:
        for s in d['van']: chu(re.sub(r'^[^：]*：', '', s), d['ma'], cau=True)
        for h in d['hoi']:
            for s in [h['hoi'], h.get('dap', '')] + h.get('nhieu', []): chu(s, d['ma'], cau=True)
    for s, d, nh in T.NGHE_SO + T.NGHE_NGAY: chu(s, 'Nghe số', cau=True)
    for h in T.NGHE_HT:
        for s in h['luot']: chu(re.sub(r'^[^：]*：', '', s), h['ma'], cau=True)
        for s in [h['hoi'], h['dap']] + h['nhieu']: chu(s, h['ma'], cau=True)
    return loi


if __name__ == '__main__':
    print('== Trắc nghiệm ==')
    L = kiem_trac_nghiem()
    for l in L: print('  LỖI', l)
    print('  ', 'không lỗi' if not L else f'{len(L)} lỗi')
