#!/usr/bin/env python3
"""Bài tập ngữ pháp (khối 🎯 Luyện ngữ pháp trên trang Ngữ pháp) — quy chuẩn 05, bổ sung 29/10/2026.

Nguồn soạn: tools/np_luyen/kho_bai2_4.py (DD = đặc điểm mỗi bài, CAU = câu). Bài mới: thêm file kho_*.py và nạp ở KHO bên dưới.
  python3 tools/ngu_phap_luyen.py kiem        # kiểm vốn chữ, pinyin, khối xếp câu, mỗi đặc điểm >= 2 câu
  python3 tools/ngu_phap_luyen.py gop         # kiểm rồi ghi "nguPhapLuyen" vào data/bai/bai-N.json

Mã câu (ma) = b<bài>-<đặc điểm>-<thứ tự trong đặc điểm>: là khoá phân tích kết quả nghiên cứu,
nên chỉ THÊM câu vào cuối nhóm đặc điểm, không chèn giữa / xoá (câu bỏ đi thì đánh dấu bo=True).
Cần: pip install pypinyin --break-system-packages
"""
import json, os, re, sys, unicodedata, importlib.util

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PHIEN_BAN = '2026-10-29a'
# Vốn chữ theo sổ tích lũy (Project claude/so-tich-luy.json, chuHanMoi từng bài) — bài mới nhớ thêm dòng
TEN_RIENG = '小语王一飞陈天中安妮白家月李文王一雪刘明杨同乐小明'
CHU = {1: "一三不个五们你八再吃同喝大天好学客家小师很您明气汉狗猫王生老见语谢飞",
       2: "中么也事什俄关兴十口只叫名国坐女妮子字安对我文斯日是月本李没爱白系罗美英认识说请起进门问陈高",
       3: "了人他作做南去友吗哥哪喂太奶她妈妹姐姥工弟忙想有朋法泰爷爸男的谁越还这那雪",
       4: "〇七万丈两乐九二亿今位儿公六几刘千呢和四多夫妻婆孩少岁年杨百第米纪零",
       5: "号星期休息会饭面条饺些菜下班新电脑真看喜欢它昨道包上旧台听"}
NGUON = {'luuY': 'lưu ý thẻ', 'quyChuan': 'quy chuẩn 05', 'deXuat': 'cô duyệt 29/10/2026'}


def nap(tep):
    sp = importlib.util.spec_from_file_location('kho', os.path.join(GOC, 'tools', 'np_luyen', tep))
    m = importlib.util.module_from_spec(sp); sp.loader.exec_module(m); return m

KHO = [nap('kho_bai2_4.py'), nap('kho_bai5.py')]


def strip(p):
    p = unicodedata.normalize('NFD', p).replace('ü', 'v').replace('Ü', 'v')
    p = ''.join(c for c in p if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z]', '', p.lower()).replace('shui', 'shei')


def han(s): return [c for c in s if '一' <= c <= '鿿' or c == '〇']


def kiem():
    from pypinyin import lazy_pinyin
    loi, ds = [], {}
    for m in KHO:
        for n, cau in m.CAU.items():
            von = set(''.join(CHU[k] for k in CHU if k <= n)) | set(TEN_RIENG)
            dds = {d[1]: d for d in m.DD[n]}; dem = {k: 0 for k in dds}

            def ck(s, py, nhan):
                ng = [c for c in han(s) if c not in von]
                if ng: loi.append(f'B{n} {nhan}: chữ ngoài vốn {ng} :: {s}')
                if py is not None:
                    a = strip(''.join('ling' if c == '〇' else lazy_pinyin(c)[0] for c in han(s)))
                    r = strip(''.join('ling' if c == '〇' else 'r' if c == '儿' else lazy_pinyin(c)[0] for c in han(s)))   # 面条儿 miàntiáor
                    if strip(py) not in (a, r): loi.append(f'B{n} {nhan}: pinyin lệch :: {s} | {py}')
            for it in cau:
                if it['dd'] not in dds: loi.append(f'B{n}: đặc điểm lạ {it["dd"]}'); continue
                if not it.get('bo'): dem[it['dd']] += 1
                d = it['dang']
                if d == 'chon':
                    pa = [it['dap']] + it['nhieu']
                    if len(set(pa)) != len(pa): loi.append(f'B{n}: phương án trùng {it}')
                    if it.get('kieu') == 'py':
                        ck(it['cau'], it['py'], 'py')
                        if it['tu'] not in it['cau']: loi.append(f'B{n}: từ hỏi không có trong câu {it["cau"]}')
                    else:
                        if it['cau'].count('＿') != 1: loi.append(f'B{n}: số ô trống {it["cau"]}')
                        ck(it['cau'].replace('＿', it['dap']), it['py'], 'chọn')
                        if it.get('sau'): ck(it['sau'], None, 'câu B')
                        for x in it['nhieu']: ck(x, None, 'nhiễu')
                elif d == 'dungSai':
                    ck(it['cau'], it['py'], 'đúng/sai')
                    if not it['dung']: ck(it['sua'], it['pySua'], 'câu sửa')
                elif d == 'hoi':
                    ck(it['dap'], it['pyDap'], 'câu đáp'); ck(it['hoi'], it['pyHoi'], 'câu hỏi')
                    if it['hoi'] in it['nhieu']: loi.append(f'B{n}: nhiễu trùng câu hỏi đúng {it["hoi"]}')
                    for x in it['nhieu']: ck(x, None, 'nhiễu')
                elif d == 'xep':
                    ck(it['cau'], it['py'], 'xếp')
                    if ''.join(it['khoi']) != ''.join(han(it['cau'])): loi.append(f'B{n}: khối không ghép đúng câu {it["cau"]}')
                    for k in it.get('khac', []):                     # câu xếp khác vẫn đúng: cùng bộ chữ, có dấu câu cuối
                        if sorted(han(k)) != sorted(han(it['cau'])) or k[-1] not in '。？！': loi.append(f'B{n}: câu khác không khớp khối {k}')
            for k, v in dem.items():
                if v < 2: loi.append(f'B{n}: đặc điểm {k} chỉ có {v} câu (cần >= 2)')
            ds[n] = (m.DD[n], cau)
            print(f'Bài {n}: {len(cau)} câu · {len(dds)} đặc điểm')
    for l in loi: print('  ✗', l)
    print('Lỗi:', len(loi))
    return ds, loi


def gop():
    ds, loi = kiem()
    if loi: sys.exit('Còn lỗi, chưa ghi.')
    for n, (dd, cau) in ds.items():
        np_cua = {d[1]: d[0] for d in dd}; stt = {}; out = []
        for it in cau:
            o = dict(it); stt[o['dd']] = stt.get(o['dd'], 0) + 1
            if o['dang'] == 'xep': o['npPhu'] = o.pop('np')
            o = {'ma': f"b{n}-{o['dd']}-{stt[o['dd']]}", 'np': np_cua[o['dd']], **o}
            if o.get('nguon'): o['nguon'] = NGUON.get(o['nguon'], o['nguon'])
            out.append(o)
        tep = os.path.join(GOC, 'data', 'bai', f'bai-{n}.json')
        d = json.load(open(tep, encoding='utf-8'))
        d['nguPhapLuyen'] = {'phienBan': PHIEN_BAN,
                             'dacDiem': [{'ma': x[1], 'np': x[0], 'ten': x[2], 'nguon': x[3]} for x in dd],
                             'cau': out}
        open(tep, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n')
        print(f'Đã ghi {tep}: {len(out)} câu')


if __name__ == '__main__':
    {'kiem': kiem, 'gop': gop}.get(sys.argv[1] if len(sys.argv) > 1 else 'kiem', kiem)()
