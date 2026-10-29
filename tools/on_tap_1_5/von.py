# -*- coding: utf-8 -*-
"""Vốn đã học Bài 1–5 (HSK 3.0) cho phần Ôn tập tổng hợp: từ điển từ được phép, tách từ, pinyin theo dữ liệu bài.

Từ được phép = từ trong bảng Từ vựng + Từ vựng mở rộng của 5 bài (data/bai/bai-N.json → tu)
             + tên nhân vật + số đếm (Bài 4) + 星期一…六, 好喝, 了 (dạy trong thẻ ngữ pháp).
Câu nào còn chữ không tách được thành từ được phép → báo lỗi "ngoài 5 bài".
"""
import json, os, re, unicodedata

GOC = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

TEN_RIENG = {'小语': 'Xiǎoyǔ', '王一飞': 'Wáng Yīfēi', '一飞': 'Yīfēi', '陈天中': 'Chén Tiānzhōng', '安妮': 'Ānnī',
             '白家月': 'Bái Jiāyuè', '家月': 'Jiāyuè', '李文': 'Lǐ Wén', '王一雪': 'Wáng Yīxuě', '一雪': 'Yīxuě',
             '刘明': 'Liú Míng', '天中': 'Tiānzhōng', '杨同乐': 'Yáng Tónglè', '同乐': 'Tónglè', '王': 'Wáng'}
SO = {'〇': 'líng', '一': 'yī', '二': 'èr', '三': 'sān', '四': 'sì', '五': 'wǔ', '六': 'liù', '七': 'qī',
      '八': 'bā', '九': 'jiǔ', '十': 'shí', '百': 'bǎi', '千': 'qiān', '万': 'wàn', '零': 'líng', '两': 'liǎng'}
# dạy trong thẻ ngữ pháp (không có thẻ từ riêng) — nguồn ghi bên cạnh
THEM = {'星期一': 'xīngqīyī', '星期二': 'xīngqī\'èr', '星期三': 'xīngqīsān', '星期四': 'xīngqīsì',
        '星期五': 'xīngqīwǔ', '星期六': 'xīngqīliù',          # Bài 5 · thẻ ngayThang
        '好喝': 'hǎohē',                                        # Bài 5 · thẻ haoV
        '没': 'méi',                                            # Bài 4 · thẻ you: 没(有)
        '了': 'le',                                             # Bài 3 太…了 · Bài 4 …岁了
        }
# pinyin trong câu khác pinyin từ mục (quy chuẩn 03)
TRONG_CAU = {'个': 'ge', '谁': 'shéi', '做饭': 'zuò fàn', '下班': 'xiàbān', '上班': 'shàngbān'}


def nap_bai():
    bai = {}
    for n in range(1, 6):
        bai[n] = json.load(open(os.path.join(GOC, 'data', 'bai', f'bai-{n}.json'), encoding='utf-8'))
    return bai


BAI = nap_bai()
TU = {}          # chữ Hán → (pinyin, bài đầu tiên, nhóm)
for n, d in BAI.items():
    for t in d['tu']:
        h = t['Chữ Hán']
        if h not in TU:
            TU[h] = (t['Pinyin'].replace('∥', ''), n, t.get('_nhom'))
TU_HOC = list(TU)                                   # danh sách phải phủ (giữ thứ tự bài)
TU_DIEN = {h: v[0] for h, v in TU.items()}
TU_DIEN.update(THEM)
for k, v in TEN_RIENG.items(): TU_DIEN.setdefault(k, v)
for k, v in SO.items(): TU_DIEN.setdefault(k, v)
TU_DIEN.update(TRONG_CAU)
TU_DIEN['谁'] = 'shéi'
MAX = max(len(k) for k in TU_DIEN)

# vốn chữ theo sổ tích lũy (tools/ngu_phap_luyen.py, chuHanMoi từng bài)
CHU = "一三不个五们你八再吃同喝大天好学客家小师很您明气汉狗猫王生老见语谢飞" \
      "中么也事什俄关兴十口只叫名国坐女妮子字安对我文斯日是月本李没爱白系罗美英认识说请起进门问陈高" \
      "了人他作做南去友吗哥哪喂太奶她妈妹姐姥工弟忙想有朋法泰爷爸男的谁越还这那雪" \
      "〇七万丈两乐九二亿今位儿公六几刘千呢和四多夫妻婆孩少岁年杨百第米纪零" \
      "号星期休息会饭面条饺些菜下班新电脑真看喜欢它昨道包上旧台听"
VON = set(CHU) | set(''.join(TEN_RIENG))
DAU = set('，。？！：、“”；（）—…·「」 ')


def la_han(c): return '一' <= c <= '鿿' or c == '〇'


def tach(s):
    """Tách câu thành từ theo từ điển được phép (dài nhất trước). Trả (ds_tu, ds_loi)."""
    out, loi, i = [], [], 0
    while i < len(s):
        c = s[i]
        if not la_han(c):
            out.append(c); i += 1; continue
        for L in range(min(MAX, len(s) - i), 0, -1):
            w = s[i:i + L]
            if w in TU_DIEN:
                out.append(w); i += L; break
        else:
            loi.append(c); out.append(c); i += 1
    return out, loi


def chu_ngoai(s): return [c for c in s if la_han(c) and c not in VON]


# ---------- pinyin câu ----------
THANH = {'ā': 1, 'á': 2, 'ǎ': 3, 'à': 4, 'ē': 1, 'é': 2, 'ě': 3, 'è': 4, 'ī': 1, 'í': 2, 'ǐ': 3, 'ì': 4,
         'ō': 1, 'ó': 2, 'ǒ': 3, 'ò': 4, 'ū': 1, 'ú': 2, 'ǔ': 3, 'ù': 4, 'ǖ': 1, 'ǘ': 2, 'ǚ': 3, 'ǜ': 4}
GOC_THANH = {'ge': 4, 'le': 0, 'ma': 0, 'ne': 0, 'de': 0, 'men': 0}


def thanh_dau(py):
    p = py.strip().split()[0] if py.strip() else ''
    for ch in p:
        if ch in THANH: return THANH[ch]
    return GOC_THANH.get(re.sub(r'[^a-z]', '', p.lower()), 0)


def so_py(chuoi):
    """Pinyin một số (chuỗi chữ số Hán) — tách sau 百/千/万, 零 đứng riêng."""
    phan, cur = [], ''
    for c in chuoi:
        if c == '零':
            if cur: phan.append(cur); cur = ''
            phan.append('零'); continue
        cur += c
        if c in '百千万': phan.append(cur); cur = ''
    if cur: phan.append(cur)
    res = []
    for p in phan:
        am = [SO[c] for c in p]
        s = am[0]
        for a in am[1:]:
            s += ("'" + a) if a[0] in 'aeoāáǎàēéěèōóǒò' else a
        res.append(s)
    return res


def pinyin_cau(s):
    tu, _ = tach(s)
    # gộp chuỗi số liền nhau thành một token
    g = []
    for w in tu:
        if w in SO and g and isinstance(g[-1], list):
            g[-1].append(w)
        elif w in SO:
            g.append([w])
        else:
            g.append(w)
    toks = []   # (chữ, pinyin)
    for k, w in enumerate(g):
        if isinstance(w, list):
            chuoi = ''.join(w)
            nxt = g[k + 1] if k + 1 < len(g) else ''
            nxt = nxt if isinstance(nxt, str) else ''
            prv = g[k - 1] if k > 0 and isinstance(g[k - 1], str) else ''
            if chuoi in ('一', '两') or (chuoi == '一' and nxt):
                pass
            if chuoi == '一' and nxt and nxt not in ('月', '号', '日') and prv != '第' and la_han(nxt[0]):
                t = thanh_dau(TU_DIEN.get(nxt, ''))
                toks.append((chuoi, 'yí' if t == 4 else 'yì')); continue
            if chuoi.startswith('一') and len(chuoi) > 1 and chuoi[1] in '百千万':
                # 一百, 一千, 一万 …
                ps = so_py(chuoi)
                ps[0] = ('yí' if chuoi[1] == '万' else 'yì') + ps[0][2:]
                toks.append((chuoi, ' '.join(ps))); continue
            toks.append((chuoi, ' '.join(so_py(chuoi)))); continue
        if not la_han(w[0]):
            toks.append((w, w)); continue
        toks.append((w, TU_DIEN[w]))
    # 不 biến điệu; A不A
    out = []
    for k, (w, p) in enumerate(toks):
        if w == '不':
            prv = toks[k - 1][0] if k else ''
            nxt = toks[k + 1] if k + 1 < len(toks) else ('', '')
            if prv and nxt[0] and nxt[0] == prv:
                p = 'bu'
            elif la_han(nxt[0][:1] or 'a') and thanh_dau(nxt[1]) == 4:
                p = 'bú'
        if w == '们' and out:
            out[-1] = (out[-1][0] + w, out[-1][1] + 'men'); continue
        if w == '第' and k + 1 < len(toks):
            nw, npy = toks[k + 1]
            toks[k + 1] = (w + nw, 'dì-' + npy); continue
        if w == '是' and k + 1 < len(toks) and toks[k + 1][0] == '的' and (k + 2 >= len(toks) or not la_han(toks[k + 2][0][:1] or 'a')):
            p = 'shì'
        out.append((w, p))
    # ghép chuỗi: dấu câu toàn chiều → nửa chiều + khoảng
    s_out, dau_cau = '', True
    DOI = {'，': ',', '。': '.', '？': '?', '！': '!', '：': ':', '、': ',', '“': '"', '”': '"', '—': '—', '；': ';'}
    for w, p in out:
        if not la_han(w[0]) and w not in SO:
            s_out = s_out.rstrip() + (' "' if w == '“' else DOI.get(w, w) + ' ')
            if w in '。？！“':
                dau_cau = True
            continue
        if dau_cau:
            p = p[:1].upper() + p[1:]
            dau_cau = False
        s_out += p + ' '
    s_out = re.sub(r'\s*—\s*—\s*', ' — ', s_out)
    return s_out.strip()
