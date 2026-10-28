#!/usr/bin/env python3
"""Bổ sung nội dung (cụm từ, câu ví dụ) cho kho HSK 7–9: kiểm tra + gộp + xuất file duyệt.

Dữ liệu soạn: tools/kho79/dot-<tên>.jsonl, mỗi dòng một từ:
  {"m": "79-0131", "cum": [["立碑", "lì bēi"], ...],
   "c": [["câu", "pinyin", "nghĩa (bỏ trống nếu câu không có từ mới)", "đọc (bỏ trống nếu không cần)"], [...]]}

Cách dùng:
  python3 tools/kho79.py kiem dot-b      # kiểm tra, in cảnh báo
  python3 tools/kho79.py gop dot-b       # gộp vào data/tu-vung/cap-7-9.json
  python3 tools/kho79.py duyet dot-b out.md   # xuất file duyệt

Luật (theo 130 từ đầu đã làm, đến 悲痛):
  - 2 câu hoàn chỉnh; câu 2 ưu tiên ôn lại một từ 7–9 đã học trước đó (đứng trước trong kho).
  - Nghĩa câu chỉ ghi khi câu có từ mới (từ ngoài HSK 1–6 và chưa học ở phần 7–9 phía trước).
  - Cụm từ 2 cụm; từ không có từ loại (li hợp, thành ngữ, cụm cố định) thì không có cụm.
  - "Đọc câu": văn bản cho máy đọc — bỏ 儿 hóa vận (点儿→点, 这儿→这), thay chữ đa âm dễ đọc nhầm
    bằng chữ đồng âm một cách đọc (好好→毫好, 一场→一厂, 强忍→抢忍, 剥→煲, 倒→岛, 中 zhòng→众...).
"""
import json, re, sys, os, unicodedata
from pypinyin import pinyin, Style

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KHO = os.path.join(GOC, 'data/tu-vung/cap-7-9.json')
THU = os.path.join(GOC, 'tools/kho79')
HAN = re.compile(r'[㐀-鿿]')
DAU = '，。！？、；：“”‘’…—（）《》·'

def doc_kho():
    with open(KHO, encoding='utf-8') as f:
        return json.load(f)

def ghi_kho(d):
    with open(KHO, 'w', encoding='utf-8') as f:
        json.dump(d, f, ensure_ascii=False, separators=(',', ':'))

def doc_dot(ten):
    p = os.path.join(THU, ten + '.jsonl')
    out = []
    with open(p, encoding='utf-8') as f:
        for i, l in enumerate(f, 1):
            l = l.strip()
            if not l or l.startswith('//'):
                continue
            try:
                out.append(json.loads(l))
            except Exception as e:
                sys.exit(f'{p}:{i}: JSON lỗi: {e}')
    return out

# ---------- pinyin ----------
DAUTHANH = {c: (b, t) for b, cs in {'a': 'āáǎà', 'e': 'ēéěè', 'i': 'īíǐì', 'o': 'ōóǒò', 'u': 'ūúǔù', 'ü': 'ǖǘǚǜ'}.items()
            for t, c in enumerate(cs, 1)}

def _bo_dau(s):
    out, thanh = '', []
    for ch in s:
        if ch in DAUTHANH:
            b, t = DAUTHANH[ch]
            out += b
            thanh.append((len(out) - 1, t))
        else:
            out += ch
    return out.replace('v', 'ü'), thanh

_AM = None
def am_hop_le():
    global _AM
    if _AM is None:
        from pypinyin.pinyin_dict import pinyin_dict
        A = set()
        for v in pinyin_dict.values():
            for p in v.split(','):
                A.add(_bo_dau(p)[0])
        A |= {x + 'r' for x in list(A)}
        _AM = A
    return _AM

def _tach_tu(tu):
    """Tách một từ pinyin (đã bỏ dấu) thành âm tiết; âm bắt đầu bằng nguyên âm chỉ được đứng đầu."""
    A = am_hop_le()
    n = len(tu)
    best = {n: []}
    for i in range(n - 1, -1, -1):
        for L in range(min(7, n - i), 0, -1):
            seg = tu[i:i + L]
            if seg in A and (i + L) in best and (i == 0 or seg[0] not in 'aeoü'):
                best[i] = [(i, i + L)] + best[i + L]
                break
    return best.get(0)

def tach_py(s):
    """Tách chuỗi pinyin thành [(âm không dấu, thanh)], thanh 0 = nhẹ, -1 = lỗi."""
    s = s.lower().replace('∥', '')
    out = []
    for tu in re.split(r"[\s\-'’·,.!?;:，。！？“”\"…()（）：]+", s):
        if not tu:
            continue
        tron, th = _bo_dau(tu)
        ds = _tach_tu(tron)
        if ds is None:
            out.append(('?' + tu, -1))
            continue
        for a, b in ds:
            t = [tt for (vi, tt) in th if a <= vi < b]
            out.append((tron[a:b], t[0] if t else 0))
    return out

def py_may(han):
    r = pinyin(han, style=Style.TONE3, neutral_tone_with_five=True, errors='ignore')
    out = []
    for (x,) in r:
        t = int(x[-1]) if x[-1].isdigit() else 0
        b = x[:-1] if x[-1].isdigit() else x
        out.append((b.replace('v', 'ü'), 0 if t == 5 else t))
    return out

def py_moi_cach(c):
    r = pinyin(c, style=Style.TONE3, heteronym=True, neutral_tone_with_five=True)[0]
    return {(x[:-1] if x[-1].isdigit() else x).replace('v', 'ü') for x in r}

def so_han(s):
    return HAN.findall(s)

OK_AM = {('教', 'jiao', 1), ('片', 'pian', 4), ('卷', 'juan', 3), ('觉', 'jiao', 4), ('长', 'chang', 2), ('都', 'dou', 1), ('地', 'de', 0), ('谁', 'shei', 2), ('了', 'le', 0), ('得', 'de', 0), ('着', 'zhe', 0), ('为', 'wei', 4), ('为', 'wei', 2), ('更', 'geng', 4), ('处', 'chu', 4), ('肚', 'du', 4), ('当', 'dang', 1), ('的', 'de', 0), ('和', 'he', 2), ('发', 'fa', 1), ('汗', 'han', 4), ('场', 'chang', 3), ('尽', 'jin', 4), ('划', 'hua', 2), ('假', 'jia', 4), ('铺', 'pu', 1), ('干', 'gan', 1), ('曲', 'qu', 3), ('种', 'zhong', 3), ('缝', 'feng', 2), ('切', 'qie', 1), ('磨', 'mo', 4)}

def kiem_py(han, py, nhan, canh):
    chu = so_han(han)
    am = tach_py(py)
    # 儿 hóa vận: chữ 儿 không thành âm tiết riêng khi âm trước kết thúc bằng r
    n_er = 0
    for i, c in enumerate(chu):
        if c == '儿' and i > 0:
            n_er += 1
    loi = [a for a in am if a[1] == -1]
    if loi:
        canh.append(f'{nhan}: pinyin không tách được "{loi[0][0]}" — {py}')
        return
    if len(am) != len(chu) and len(am) != len(chu) - n_er:
        canh.append(f'{nhan}: số âm tiết {len(am)} ≠ số chữ {len(chu)} — {han} | {py}')
        return
    if len(am) != len(chu):
        return  # có 儿 hóa vận, bỏ qua so khớp chi tiết
    may = py_may(''.join(chu))
    if len(may) != len(chu):
        return
    for i, (c, (a, t), (ma, mt)) in enumerate(zip(chu, am, may)):
        if (c, a, t) in OK_AM:
            continue
        if a != ma:
            if a not in py_moi_cach(c):
                canh.append(f'{nhan}: {c} ghi "{a}" — không phải âm của chữ này — {han}')
            else:
                canh.append(f'(đa âm) {nhan}: {c} ghi "{a}", máy đoán "{ma}" — {han}')
        elif t and mt and t != mt and c not in '一不':
            canh.append(f'{nhan}: {c} thanh {t} ≠ máy {mt} — {han}')
    # 一, 不 biến điệu trong câu
    for i, c in enumerate(chu):
        if c not in '一不' or i + 1 >= len(chu):
            continue
        t = am[i][1]
        sau = am[i + 1][1]
        if c == '不' and sau == 4 and t not in (2, 0):
            canh.append(f'{nhan}: 不 trước thanh 4 phải là bú — {han}')
        if c == '一' and sau == 4 and t not in (2, 0, 1):
            canh.append(f'{nhan}: 一 trước thanh 4 phải là yí — {han}')
        if c == '一' and sau in (1, 2, 3) and t not in (4, 0, 1):
            canh.append(f'{nhan}: 一 trước thanh {sau} thường là yì — {han}')

# ---------- từ vựng các cấp ----------
def bang_cap():
    lv, vt = {}, {}
    for f in ['1', '2', '3', '4', '5', '6', '7-9', 'MR']:
        with open(os.path.join(GOC, f'data/tu-vung/cap-{f}.json'), encoding='utf-8') as fh:
            for i, x in enumerate(json.load(fh)):
                for w in re.split(r'[｜|/（(]', x['Chữ Hán'])[:1]:
                    w = w.strip()
                    if w and w not in lv:
                        lv[w] = f
                        if f == '7-9':
                            vt[w] = i
    return lv, vt

_jieba = None
CHU = set()
def cat(s, lv):
    global _jieba
    if _jieba is None:
        import jieba
        jieba.setLogLevel(60)
        for w in lv:
            jieba.add_word(w, freq=100000)
        _jieba = jieba
    return [t for t in _jieba.cut(re.sub(r'[%s\s]' % DAU, '', s)) if t]

BO_TACH = {'不理', '都会', '以', '不知', '从来不', '好心', '有机'}   # jieba cắt nhầm (不理解, 都会去)
DA_AM = {'好好': '毫好', '一场': '一厂', '指甲': '直甲', '待会': '呆会'}
CAM = ['大夫', '处在', '地上', '和气', '看门诊', '穿着', '结果']          # tránh (bản bàn giao 22/10)
CAM_PY = ['děi']                                          # 得 děi
HAN_CHE = ['起来', '下来', '下去']                         # hạn chế bổ ngữ
QUEN = ['熬夜', '癌症', '安稳']                            # đợt 1 đã dùng nhiều, đợt sau hạn chế
LOAI_CUM = ('danh từ', 'động từ', 'tính từ', 'phó từ')

def bo_chu():
    ch = set()
    for f in ['1', '2', '3', '4', '5', '6', '7-9']:
        with open(os.path.join(GOC, f'data/tu-vung/cap-{f}.json'), encoding='utf-8') as fh:
            for x in json.load(fh):
                ch |= set(HAN.findall(x['Chữ Hán']))
    return ch

def can_cum(x):
    loai = x.get('Từ loại', '') or ''
    return '∥' not in x['Pinyin'] and any(l in loai for l in LOAI_CUM)


def kiem(ten):
    d = doc_kho()
    idx = {x['Mã']: i for i, x in enumerate(d)}
    lv, vt = bang_cap()
    dot = doc_dot(ten)
    canh = []
    da_co = {}
    for i, x in enumerate(d):
        for n in (1, 2):
            s = x.get('Câu %d' % n)
            if s:
                da_co.setdefault(s, x['Chữ Hán'])
    thay = set()
    CHU.update(bo_chu())
    for e in dot:
        m = e['m']
        if m not in idx:
            canh.append(f'{m}: không có trong kho'); continue
        i = idx[m]
        x = d[i]
        w = x['Chữ Hán']
        if m in thay:
            canh.append(f'{m} {w}: lặp trong đợt')
        thay.add(m)
        cum = e.get('cum', [])
        if can_cum(x) and not cum:
            canh.append(f'{m} {w}: là danh/động/tính/phó từ nhưng chưa có cụm')
        if not can_cum(x) and cum:
            canh.append(f'{m} {w}: không làm cụm (li hợp / không từ loại / liên từ, giới từ...)')
        goc = w.replace('儿', '') if w.endswith('儿') else w
        for h, p in cum:
            tam = []
            kiem_py(h, p, f'{m} {w} cụm {h}', tam)
            if e.get('doctu'):
                tam = [t for t in tam if 'thanh' not in t]
            canh.extend(tam)
            if '∥' in p:
                canh.append(f'{m} {w}: cụm có ∥')
            if not all(c in h for c in goc.replace('…', '')) and goc not in h:
                canh.append(f'{m} {w}: cụm "{h}" không chứa từ')
        c = e.get('c', [])
        if len(c) != 2:
            canh.append(f'{m} {w}: cần đúng 2 câu'); continue
        for n, (s, p, v, dd) in enumerate(c, 1):
            nh = f'{m} {w} câu {n}'
            if s[-1] not in '。！？…”':
                canh.append(f'{nh}: thiếu dấu cuối câu — {s}')
            if '∥' in p:
                canh.append(f'{nh}: có ∥')
            tam = []
            kiem_py(s, p, nh, tam)
            if dd:
                tam = [t for t in tam if 'thanh' not in t and '(đa âm)' not in t]
            canh.extend(tam)
            if not all(ch in s for ch in goc if HAN.match(ch)) and not (len(goc) <= 4 and goc[0] in s):
                canh.append(f'{nh}: câu không chứa từ {w} — {s}')
            if s in da_co and da_co[s] != w:
                canh.append(f'{nh}: trùng câu của {da_co[s]} — {s}')
            da_co[s] = w
            nc = len(so_han(s))
            if not 16 <= nc <= 40:
                canh.append(f'{nh}: dài {nc} chữ (HSK 7–9: 16–40) — {s}')
            ngoai = sorted(set(so_han(s)) - CHU)
            if ngoai:
                canh.append(f'{nh}: chữ ngoài phạm vi HSK {ngoai} — {s}')
            for k in CAM:
                if k in s and k not in w:
                    canh.append(f'{nh}: có "{k}" (tránh) — {s}')
            if 'děi' in p.lower():
                canh.append(f'{nh}: có 得 děi (tránh) — {s}')
            for k in HAN_CHE:
                if k in s and k not in w:
                    canh.append(f'(gợi ý) {nh}: có bổ ngữ {k} (hạn chế) — {s}')
            for k in QUEN:
                if k in s and k != w:
                    canh.append(f'{nh}: dùng lại "{k}" (đợt 1 đã dùng nhiều, hạn chế) — {s}')
            toks = cat(s, lv)
            moi = [t for t in toks if t != w and t not in BO_TACH and HAN.match(t) and
                   (lv.get(t) == '7-9' and vt.get(t, 0) > i)]
            la = [t for t in toks if t != w and len(t) > 1 and t not in lv and not set(t) <= set(w)]
            hoc = [u for u in vt if len(u) > 1 and vt[u] < i]
            ontap = [t for t in toks if t != w and len(t) > 1 and ((lv.get(t) == '7-9' and vt.get(t, 1e9) < i) or any(u in t for u in hoc if len(t) > len(u)))]
            e.setdefault('_ontap', []).append(ontap)
            def ghep_duoc(t):
                ok = {0}
                for j in range(1, len(t) + 1):
                    for k in list(ok):
                        if k < j and (t[k:j] in lv and lv[t[k:j]] in ('1','2','3','4','5','6','MR') or (lv.get(t[k:j]) == '7-9' and vt.get(t[k:j], 1e9) <= i) or t[k:j] in w):
                            ok.add(j); break
                return len(t) in ok
            la2 = [t for t in la if not ghep_duoc(t)]
            if la2 and not moi and not v:
                canh.append(f'(gợi ý dịch) {nh}: từ ngoài danh sách {la2} — {s}')
            e.setdefault('_bo', [False, False])
            if v and not moi and not la2:
                e['_bo'][n - 1] = True      # câu không có từ mới: khi gộp bỏ nghĩa (luật cô chốt 28/10)
            if moi and not v:
                canh.append(f'{nh}: có từ 7–9 chưa học {moi} mà chưa dịch — {s}')
            if '儿' in s and not dd and re.search(r'(点|这|那|哪|会|块|一下)儿', s):
                canh.append(f'{nh}: có 儿 hóa vận, cần "Đọc câu" — {s}')
            for k in DA_AM:
                if k in s and (not dd or k in dd):
                    canh.append(f'{nh}: có "{k}", cần "Đọc câu" thay {DA_AM[k]} — {s}')
            if dd and dd != '-' and len(so_han(dd)) != len(so_han(s)) - s.count('儿') + dd.count('儿') and abs(len(dd) - len(s)) > 3:
                canh.append(f'{nh}: "Đọc câu" lệch độ dài — {dd}')
        cum_on = [h for h, _ in cum for t in cat(h, lv) if t != w and len(t) > 1 and lv.get(t) == '7-9' and vt.get(t, 1e9) < i]
        if not any(e['_ontap']) and not cum_on:
            canh.append(f'{m} {w}: chưa dùng lại từ 7–9 (nhiều chữ) đã học trong cụm hoặc câu')
    # đếm mức dùng lại các từ 7–9 trong toàn cấp (câu đã có + đợt này)
    from collections import Counter
    dem = Counter()
    cau_dot = {cc[0] for e in dot for cc in e['c']}
    tat = [x.get('Câu %d' % n) for x in d for n in (1, 2) if x.get('Câu %d' % n) and x.get('Câu %d' % n) not in cau_dot]
    for s in tat + list(cau_dot):
        for t in set(cat(s, lv)):
            if lv.get(t) == '7-9' and len(t) > 1:
                dem[t] += 1
    for t, n in dem.most_common():
        if n > 20:
            canh.append(f'{t}: dùng {n} câu trong cấp (> 20)')
    canh.append('(gợi ý) dùng nhiều nhất: ' + ', '.join(f'{t} {n}' for t, n in dem.most_common(12)))
    return dot, canh

def gop(ten):
    dot, canh = kiem(ten)
    nang = [c for c in canh if 'gợi ý' not in c and not c.startswith('(đa âm)')]
    if nang:
        print('\n'.join(nang))
        sys.exit(f'Còn {len(nang)} cảnh báo, chưa gộp.')
    d = doc_kho()
    idx = {x['Mã']: i for i, x in enumerate(d)}
    for e in dot:
        x = d[idx[e['m']]]
        moi = {}
        for k, v in x.items():
            moi[k] = v
            if k == 'Nghĩa tiếng Việt':
                pass
        if e.get('nghia'):
            x['Nghĩa tiếng Việt'] = e['nghia']
        if e.get('doctu'):
            x['Đọc từ'] = e['doctu']
        if e.get('hv'):
            x['Âm Hán Việt'] = e['hv']
        if e.get('cum'):
            x['Cụm từ'] = '\n'.join(f'{h} | {p}' for h, p in e['cum'])
        for n, (s, p, v, dd) in enumerate(e['c'], 1):
            x['Câu %d' % n] = s
            x['Pinyin câu %d' % n] = p
            if v and not e.get('_bo', [False, False])[n - 1]:
                x['Nghĩa câu %d' % n] = v
            else:
                x.pop('Nghĩa câu %d' % n, None)
            if dd:
                x['Đọc câu %d' % n] = dd
            else:
                x.pop('Đọc câu %d' % n, None)
        # sắp lại khoá theo thứ tự chuẩn
        thu_tu = ['Mã', 'Chữ Hán', 'Pinyin', 'Âm Hán Việt', 'Từ loại', 'Nghĩa tiếng Việt', 'Thuận bút', 'Cụm từ',
                  'Câu 1', 'Pinyin câu 1', 'Nghĩa câu 1', 'Câu 2', 'Pinyin câu 2', 'Nghĩa câu 2',
                  'Đọc từ', 'Đọc câu 1', 'Đọc câu 2']
        y = {k: x[k] for k in thu_tu if k in x}
        y.update({k: v for k, v in x.items() if k not in y})
        d[idx[e['m']]] = y
    ghi_kho(d)
    print(f'Đã gộp {len(dot)} từ vào cap-7-9.json')

def duyet(ten, out):
    import subprocess
    goc = {x['Mã']: x for x in json.loads(subprocess.check_output(['git', '-C', GOC, 'show', 'origin/main:data/tu-vung/cap-7-9.json']))}
    d = doc_kho()
    idx = {x['Mã']: i for i, x in enumerate(d)}
    dot = doc_dot(ten)
    L = []
    for e in dot:
        x = d[idx[e['m']]]
        L.append(f"### {x['Mã']} · {x['Chữ Hán']} `{x['Pinyin']}` {x.get('Âm Hán Việt','')} — {x['Nghĩa tiếng Việt']}")
        sua = []
        g = goc.get(x['Mã'], {})
        if g.get('Nghĩa tiếng Việt') != x.get('Nghĩa tiếng Việt'):
            sua.append(f"nghĩa cũ: {g.get('Nghĩa tiếng Việt')}")
        if g.get('Âm Hán Việt') != x.get('Âm Hán Việt'):
            sua.append(f"Hán Việt cũ: {g.get('Âm Hán Việt')}")
        if e.get('gc'):
            sua.append(e['gc'])
        if sua:
            L.append('- ⚠️ **Cần cô xác nhận** — ' + '; '.join(sua))
        if e.get('cum'):
            L.append('- Cụm: ' + ' · '.join(f'{h} `{p}`' for h, p in e['cum']))
        for n, (s, p, v, dd) in enumerate(e['c'], 1):
            L.append(f'- ({n}) {s}  \n  `{p}`' + (f'  \n  → {v}' if v else '') + (f'  \n  🔊 đọc: {dd}' if dd else ''))
        L.append('')
    with open(out, 'w', encoding='utf-8') as f:
        f.write('\n'.join(L))

if __name__ == '__main__':
    lenh, ten = sys.argv[1], sys.argv[2]
    if lenh == 'kiem':
        _, canh = kiem(ten)
        print('\n'.join(canh) or 'Không có cảnh báo.')
        print(f'— {len(canh)} cảnh báo')
    elif lenh == 'gop':
        gop(ten)
    elif lenh == 'duyet':
        duyet(ten, sys.argv[3])
