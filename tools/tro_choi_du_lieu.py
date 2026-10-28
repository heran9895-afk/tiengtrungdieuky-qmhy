#!/usr/bin/env python3
"""Dựng dữ liệu 2 trò Chém chữ Hán + Đỉnh luyện chữ (HSK 2.0) — quy chuẩn 13.

Nguồn:
  - data/hsk2/bai-*.json        dữ liệu bài đã duyệt trên web (từ, pinyin, nghĩa, từ loại, câu ví dụ, ghepChu, bộ thủ)
  - data/tu-vung/cau-tao.json   cấu tạo chữ chung (kết cấu, tên thành phần)
  - tools/tro-choi-du-lieu-cu.json  dữ liệu Nhiên soạn cho 2 trò bản cũ (Bài 1–2, Bài 3): GIỮ nghĩa đề, ghi chú,
                                    lời giải, quả nhiễu, bộ phận nhiễu đã soạn; phần còn thiếu máy dựng từ dữ liệu bài.
Kết quả: data/hsk2/tro-choi/bai-*.json = { chem: {P, CONF, MEAN, TRANH}, ghep: {PART, CHARS} }
  P[từ] = {py, why} · MEAN[từ] = {vi, note} · CONF[từ] = quả nhiễu · TRANH[từ] = từ trùng nghĩa, không bao giờ làm nhiễu
  PART[bộ phận] = [pinyin, "Tên, nghĩa"] · CHARS = [{c, py, vi, word?, wpy?, parts, st, fake}]
Chạy:  python3 tools/tro_choi_du_lieu.py [hsk2|hsk3]   (mặc định hsk2; in bảng đối chiếu: phần giữ / phần mới)
  hsk2: data/hsk2/bai-*.json → data/hsk2/tro-choi/   ·   hsk3: data/bai/bai-*.json → data/bai/tro-choi/
  Với hsk3, đề / lời giải Nhiên soạn (cho bản HSK 2.0) chỉ dùng lại cho cùng một từ khi lời giải không có chữ Hán
  ngoài vốn đã học của chương trình 3.0 tới bài đó; nếu có thì máy dựng lời giải mới từ dữ liệu bài.
"""
import sys
import json, os, random, re, unicodedata

GOC = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
CT_TRINH = (sys.argv[1] if len(sys.argv) > 1 else 'hsk2')
if CT_TRINH == 'hsk3':
    THU_MUC, BAI = 'data/bai', sorted([f[:-5] for f in os.listdir(os.path.join(GOC, 'data/bai')) if re.match(r'bai-\d+\.json$', f)], key=lambda x: int(x.split('-')[1]))
else:
    THU_MUC, BAI = 'data/hsk2', ['bai-1-2', 'bai-3', 'bai-4', 'bai-5']
random.seed(13)

def doc(p): return json.load(open(os.path.join(GOC, p), encoding='utf-8'))
CU = doc('tools/tro-choi-du-lieu-cu.json')
CT = doc('data/tu-vung/cau-tao.json')
WEB = {b: doc('%s/%s.json' % (THU_MUC, b)) for b in BAI}
# Vốn chữ đã học tới từng bài (chữ trong từ, câu ví dụ, kho câu, tên riêng của bài đó và các bài trước)
VON = {}
_von = set()
for _b in BAI:
    _d = WEB[_b]
    _t = json.dumps([_d.get('tu'), _d.get('cauLuyen'), _d.get('tenRieng'), _d.get('hoiDap')], ensure_ascii=False)
    _von |= set(re.findall(r'[\u3400-\u9fff]', _t))
    VON[_b] = set(_von)
BO_PHAN = set(CT['tp']) | {k for _b in BAI for k in (WEB[_b].get('thanhPhan') or {})} | {x['boThu'] for _b in BAI for x in WEB[_b].get('boThu', [])}
def ngoai_von(txt, b):   # chữ Hán ngoài vốn đã học (bộ thủ, thành phần chữ được nhắc tới thì không tính). HSK 2.0: dữ liệu cũ soạn đúng cho bài, không lọc
    if CT_TRINH == 'hsk2': return []
    return [c for c in re.findall(r'[\u3400-\u9fff]', txt or '') if c not in VON[b] and c not in BO_PHAN]

# Kết cấu chữ còn thiếu trong cấu tạo chung (theo cách tách đã duyệt ở ghepChu của bài)
KET_CAU_THEM = {'请': 'trái – phải', '忙': 'trái – phải', '的': 'trái – phải', '谁': 'trái – phải', '岁': 'trên – dưới', '爸': 'trên – dưới', '姐': 'trái – phải',
                '奶': 'trái – phải', '南': 'trên – dưới', '国': 'bao toàn bộ (囗 bao quanh)', '是': 'trên – dưới',
                '起': 'nửa bao (走 bao trái và dưới)', '越': 'nửa bao (走 bao trái và dưới)', '没': 'trái – phải',
                '我': 'trái – phải', '它': 'trên – dưới', '名': 'trên – dưới', '美': 'trên – dưới',
                '第': 'trên – dưới', '和': 'trái – phải'}

# ---------- Nghĩa: tách cụm nghĩa (cùng cách với web) ----------
def gon(s): return re.sub(r'\s+', ' ', re.sub(r'[^\w ]', ' ', unicodedata.normalize('NFC', s))).strip()
def cum_nghia(s):
    t = re.sub(r'\([^)]*\)|（[^）]*）|\[[^\]]*\]', ' ', (s or '').lower())
    ds = [gon(x) for x in re.split(r'[,;，；/]|[①-⑳]|\bvà\b', t)]
    ds = [x for x in ds if len(x) >= 2]
    return ds or [gon(t)]
def trung_nghia(a, b): return bool(set(cum_nghia(a)) & set(cum_nghia(b)))
def loai_chinh(l):
    l = re.split(r'[/,;(]', l or '')[0].strip().lower()
    return 'danh' if re.match(r'^(đại từ|danh từ)', l) else l
def tach_nghia(n):
    """'cô ấy, chị ấy (ngôi 3 số ít, nữ)' → ('cô ấy, chị ấy', 'ngôi 3 số ít, nữ'); '(cuối câu) đã… rồi' → ('đã… rồi', 'cuối câu').
    Ngoặc nằm giữa câu ('lớn; (tuổi) lớn') giữ nguyên; nghĩa chỉ có ngoặc thì lấy phần trong ngoặc làm đề."""
    n = n.strip(); note = []
    m = re.match(r'^\(([^)]*)\)\s*(.*)$', n)
    if m and m.group(2): note.append(m.group(1)); n = m.group(2)
    m = re.match(r'^(.*?)\s*\(([^)]*)\)$', n)
    if m and m.group(1): note.append(m.group(2)); n = m.group(1)
    if re.match(r'^\(([^)]*)\)$', n): n = n[1:-1]
    return re.sub(r'\s+', ' ', n).strip(' ,;'), '; '.join(note)

def cau_vi_du(w):
    for i in (1, 2):
        c, v = (w.get('Câu %d' % i) or '').strip(), (w.get('Nghĩa câu %d' % i) or '').strip()
        if c and '\n' not in c and v: return c, v
    return None

bao_cao = []

# =========================================================
# CHÉM CHỮ HÁN
# =========================================================
CU_CHEM = {'P': {}, 'CONF': {}, 'MEAN': {}}
for _b in BAI:
    for _t in ('P', 'CONF', 'MEAN'):
        for _k, _v in CU.get(_b, {}).get('chem', {}).get(_t, {}).items(): CU_CHEM[_t].setdefault(_k, _v)

def dung_chem(b):
    web, cu0 = WEB[b], (CU.get(b, {}) if CT_TRINH == 'hsk2' else {}).get('chem', {'P': {}, 'CONF': {}, 'MEAN': {}})
    cu = {'P': dict(CU_CHEM['P']), 'CONF': dict(CU_CHEM['CONF']), 'MEAN': dict(CU_CHEM['MEAN'])}
    for t in ('P', 'CONF', 'MEAN'): cu[t].update(cu0[t])
    P, MEAN, LOAI, NGHIA = {}, {}, {}, {}
    tu_web = {w['Chữ Hán']: w for w in web['tu']}
    thu_tu = list(tu_web) + [k for k in cu0['P'] if k not in tu_web]          # từ của bài trước, rồi từ thêm của bản cũ
    for k in thu_tu:
        w = tu_web.get(k)
        if w and ('/' in w['Pinyin']): continue                                # 谁 shéi / shuí: hai cách đọc, không làm đề chém
        py = w['Pinyin'] if w else cu['P'][k]['py']
        if k in cu['P'] and w and cu['P'][k]['py'] != py: bao_cao.append('%s %s: pinyin cũ %s → %s (theo web)' % (b, k, cu['P'][k]['py'], py))
        if k in cu['MEAN'] and not ngoai_von(cu['P'][k]['why'] + cu['MEAN'][k]['vi'] + cu['MEAN'][k].get('note', ''), b):
            MEAN[k] = cu['MEAN'][k]; P[k] = {'py': py, 'why': cu['P'][k]['why']}
            if CT_TRINH != 'hsk2': bao_cao.append('%s %s: dùng lại đề cô soạn "%s"' % (b, k, MEAN[k]['vi']))
        else:
            vi, note = tach_nghia(w['Nghĩa tiếng Việt'])
            vd = cau_vi_du(w)
            why = '%s (%s): %s.' % (k, py, w['Nghĩa tiếng Việt'].rstrip('.'))
            if vd: why += ' Ví dụ: %s %s' % (vd[0], vd[1])
            MEAN[k] = {'vi': vi, 'note': note}; P[k] = {'py': py, 'why': why}
            bao_cao.append('%s %s: MỚI · đề "%s"%s' % (b, k, vi, (' (' + note + ')') if note else ''))
        LOAI[k] = w['Từ loại'] if w else ''
        NGHIA[k] = (w['Nghĩa tiếng Việt'] if w else '') + ', ' + MEAN[k]['vi']
    return P, MEAN, LOAI, NGHIA, cu

CHEM = {b: dung_chem(b) for b in BAI}
# Từ trùng nghĩa trên toàn bộ các bài: không bao giờ cùng xuất hiện (một đề có hai quả đúng)
TAT_CA = {}
for b in BAI:
    P, MEAN, LOAI, NGHIA, cu = CHEM[b]
    for k in P: TAT_CA.setdefault(k, (MEAN[k], NGHIA[k], LOAI[k]))
def tranh(k):
    """Từ không được làm quả nhiễu cho k: đề của k (nghĩa + ghi chú) cũng đúng với từ đó.
    Hai đề trùng cụm nghĩa mà một trong hai có ghi chú phân biệt (他们 'họ · nhóm nam…' / 姓 'họ là') thì vẫn cho làm nhiễu."""
    m, n, l = TAT_CA[k]
    kq = []
    for x, (m2, n2, l2) in TAT_CA.items():
        if x == k: continue
        if gon(m['vi'].lower()) == gon(m2['vi'].lower()) and m.get('note', '') == m2.get('note', ''): kq.append(x)
        elif trung_nghia(m['vi'], m2['vi']) and not (m.get('note') or m2.get('note')): kq.append(x)
    return sorted(kq)
def gan_nghia(k, x):   # dùng cho chọn nhiễu MỚI: chặt hơn, tránh mọi từ chung cụm nghĩa
    return trung_nghia(TAT_CA[k][0]['vi'], TAT_CA[x][0]['vi']) or trung_nghia(TAT_CA[k][1], TAT_CA[x][1])

def conf_moi(k, P, LOAI):
    ung = []
    for x in P:
        if x == k or x in tranh(k) or gan_nghia(k, x): continue
        # cùng chữ (我 / 我们), cùng từ loại, chung một tiếng trong nghĩa (bà nội / bà ngoại, tiếng Anh / tiếng Nhật), cùng dạng lặp (爸爸 / 妈妈)
        tk = lambda w: set(gon(TAT_CA[w][0]['vi'].lower()).split()) - {'của', 'và', 'là', 'chỉ', 'dùng', 'để', 'người'}
        diem = (2 if set(x) & set(k) else 0) + (1 if loai_chinh(LOAI.get(x)) == loai_chinh(LOAI.get(k)) and LOAI.get(k) else 0) + random.random()
        diem += 1.5 if tk(x) & tk(k) else 0
        diem += 1.5 if len(x) == 2 and len(k) == 2 and x[0] == x[1] and k[0] == k[1] else 0
        ung.append((diem, x))
    ung.sort(reverse=True)
    return [x for _, x in ung[:4]]

def xuat_chem(b):
    P, MEAN, LOAI, NGHIA, cu = CHEM[b]
    CONF, TR = {}, {}
    for k in P:
        TR[k] = tranh(k)
        cu_ds = [c for c in cu['CONF'].get(k, []) if c not in TR[k] and c != k]
        bo = [c for c in cu['CONF'].get(k, []) if c in TR[k]]
        if bo: bao_cao.append('%s %s: bỏ quả nhiễu trùng nghĩa %s' % (b, k, ' '.join(bo)))
        trong_bai = [c for c in cu_ds if c in P]
        if len(trong_bai) < 3:
            them = [x for x in conf_moi(k, P, LOAI) if x not in cu_ds][:max(0, 4 - len(trong_bai))]
            cu_ds += them
        CONF[k] = cu_ds
    return {'P': P, 'CONF': CONF, 'MEAN': MEAN, 'TRANH': TR}

# =========================================================
# ĐỈNH LUYỆN CHỮ
# =========================================================
PART = {}
def them_part(k, py, mo_ta, uu_tien):
    if k not in PART or uu_tien: PART[k] = [py, mo_ta]
for k, v in CT['tp'].items(): them_part(k, v.get('py', ''), ', '.join(x for x in [v.get('ten', ''), v.get('nghia', '')] if x), False)
for b in CU:
    for k, v in (CU.get(b, {}).get('ghep', {}).get('PART', {}) or {}).items():
        if k not in PART: them_part(k, v[0], v[1], False)
for b in BAI:
    for k, v in (WEB[b].get('thanhPhan') or {}).items(): them_part(k, v.get('pinyin', ''), ', '.join(x for x in [v.get('ten', ''), v.get('nghia', '')] if x), True)
    for v in WEB[b]['boThu']: them_part(v['boThu'], v.get('pinyin', ''), ', '.join(x for x in [v.get('ten', ''), v.get('nghia', '')] if x), True)

def dung_ghep(b):
    web = WEB[b]
    cu_chu = {c['c']: c for c in (CU.get(b, {}) if CT_TRINH == 'hsk2' else {}).get('ghep', {}).get('CHARS', [])}
    for bb in BAI:
        for c in CU.get(bb, {}).get('ghep', {}).get('CHARS', []): cu_chu.setdefault(c['c'], c)
    tu = web['tu']
    ds, phan_bai = [], set()
    for g in web.get('ghepChu', []): phan_bai.update(g['phan'])
    for g in web.get('ghepChu', []):
        c, parts = g['chu'], g['phan']
        o = dict(cu_chu.get(c, {}))
        if o and CT_TRINH != 'hsk2' and (ngoai_von(o.get('word', '') + o.get('vi', ''), b) or (o.get('word') and o['word'].replace('□', c) not in [w['Chữ Hán'] for w in tu])):
            o = {}                                                            # từ chứa chữ trong bản cũ không có ở bài này: dựng lại
        if o and o.get('parts') != parts: bao_cao.append('%s ghép %s: bộ phận cũ %s → %s (theo cấu tạo đã duyệt)' % (b, c, '+'.join(o['parts']), '+'.join(parts)))
        if not o:
            mot = [w for w in tu if w['Chữ Hán'] == c]
            if mot: w = mot[0]; o = {'c': c, 'py': w['Pinyin'], 'vi': w['Nghĩa tiếng Việt']}
            elif not [w for w in tu if c in w['Chữ Hán']]:
                # chữ chỉ có trong tên nhân vật (安妮, 李文): đề là tên với ô trống, phiên âm tên lấy theo câu ví dụ đã duyệt
                ten = [t for t in web.get('tenRieng', []) if c in t][0]
                i = ten.index(c)
                o = {'c': c, 'py': '', 'vi': 'tên nhân vật trong bài', 'word': ten[:i] + '□' + ten[i + 1:], 'wpy': TEN_PY.get(ten, '')}
                if not o['wpy']: bao_cao.append('THIẾU phiên âm tên ' + ten)
            else:
                w = sorted([w for w in tu if c in w['Chữ Hán']], key=lambda x: len(x['Chữ Hán']))[0]
                i = w['Chữ Hán'].index(c)
                o = {'c': c, 'py': '', 'vi': w['Nghĩa tiếng Việt'], 'word': w['Chữ Hán'][:i] + '□' + w['Chữ Hán'][i + 1:], 'wpy': w['Pinyin']}
            bao_cao.append('%s ghép %s: MỚI · %s %s' % (b, c, o.get('word', c), o['vi']))
        o['parts'] = parts
        k = (CT['chu'].get(c) or {}).get('k')
        o['st'] = o.get('st') or (k[0].lower() + k[1:] if k else KET_CAU_THEM.get(c, ''))
        fake = [p for p in o.get('fake', []) if p in PART and p not in parts]
        can = max(4, len(parts) + 1) - len(parts)
        if len(fake) < can:
            pool = [p for p in sorted(phan_bai) if p not in parts and p not in fake] + [p for p in PART if p not in parts and p not in fake and p not in phan_bai and len(p) == 1]
            uu = pool[:len([p for p in pool if p in phan_bai])]
            random.shuffle(uu)
            fake += (uu + pool[len(uu):])[:can - len(fake) + 1]
        o['fake'] = fake
        ds.append(o)
    return ds

# Âm đọc của chữ nằm trong từ nhiều chữ (khi bài không có thẻ chữ đó đứng riêng): lấy từ thẻ chữ đứng riêng ở bài khác,
# còn thiếu thì tra bảng dưới (âm đọc khi đứng riêng, theo 等级标准)
TEN_PY = {'李文': 'Lǐ Wén', '安妮': 'Ānnī', '李月': 'Lǐ Yuè'}   # theo pinyin câu ví dụ đã duyệt
AM_RIENG = {'安': 'ān', '请': 'qǐng', '认': 'rèn', '识': 'shí', '语': 'yǔ', '法': 'fǎ', '谢': 'xiè', '对': 'duì', '起': 'qǐ', '没': 'méi', '什': 'shén', '名': 'míng', '字': 'zì', '李': 'lǐ', '越': 'yuè',
            '南': 'nán', '爸': 'bà', '姐': 'jiě', '奶': 'nǎi'}
MOT_CHU = {}
for b in BAI:
    for w in WEB[b]['tu']:
        if len(w['Chữ Hán']) == 1 and '/' not in w['Pinyin']: MOT_CHU.setdefault(w['Chữ Hán'], w['Pinyin'])

out = {}
for b in BAI:
    chem = xuat_chem(b)
    chars = dung_ghep(b)
    for o in chars:
        if not o.get('py'):
            o['py'] = MOT_CHU.get(o['c']) or AM_RIENG.get(o['c'], '')
            if not o['py']: bao_cao.append('THIẾU âm đọc chữ ' + o['c'])
    PART_BAI = {p: PART[p] for o in chars for p in o['parts'] + o['fake'] if p in PART}
    out[b] = {'chem': chem, 'ghep': {'PART': PART_BAI, 'CHARS': chars}}
    os.makedirs(os.path.join(GOC, THU_MUC, 'tro-choi'), exist_ok=True)
    json.dump(out[b], open(os.path.join(GOC, THU_MUC, 'tro-choi', '%s.json' % b), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

print('\n'.join(bao_cao))
for b in BAI:
    print(b, 'chém', len(out[b]['chem']['P']), 'từ · ghép', len(out[b]['ghep']['CHARS']), 'chữ')
