# -*- coding: utf-8 -*-
"""Thu giọng Gemini (Sulafat) cho kho từ vựng 9 cấp — chạy trọn gói trên Google Colab.

Sổ dùng module này: tools/am_kho/colab/thu_am_kho.ipynb
Quy chuẩn: 14 (giọng đọc Gemini). Kế hoạch: Project claude/ke-hoach-thu-am-colab.md.

Mỗi "đợt" = một cấp + một khoảng mã (vd. HSK2 từ 1 đến 100). Mọi thứ của đợt lưu ở
<thư mục làm việc>/cap-<cấp>_<từ>-<đến>/ (Google Drive của cô), nên Colab ngắt giữa chừng
thì chạy lại ô là làm tiếp: lượt đã có file wav thì không gọi Gemini lại (không mất tiền hai lần).

  ds.json          danh sách mục cần thu (mỗi mục: chữ đọc, pinyin, loại, trạng thái…)
  luot.json        các lượt gửi Gemini (≤ 44 dòng, Style riêng từng lượt)
  wav/<lượt>.wav   âm thanh Gemini trả về (PCM 24 kHz)
  ketqua/<lượt>.json  kết quả cắt + nhận dạng
  mp3/tu|cau/…     file đã cắt, nén (chờ đẩy lên web)
Thư mục làm việc còn có nhat_ky.csv: mỗi lần gọi Gemini một dòng (số giây âm thanh, ước tiền).
"""
import os, re, json, time, wave, base64, hashlib, subprocess, difflib, csv, datetime, shutil, unicodedata, sys

CFG = dict(repo=None, work=None, asr=None, key=None, model=None, voice='Sulafat',
           usd_gio=0.81,        # giá ~0,81 USD / giờ âm thanh tới 31/12/2026 (gấp đôi từ 1/1/2027)
           vnd_usd=26000, tran_kho=80, max_dong=44, max_chu=40, so_lan_thu_lai=2, kho='heran9895-afk/tiengtrungdieuky-qmhy')
SR = 24000
API = 'https://generativelanguage.googleapis.com/v1beta/'


def cai_dat(repo, work, asr, key=None, model=None, **khac):
    """repo: thư mục kho web đã clone; work: thư mục lưu tiến độ (Drive); asr: thư mục model paraformer."""
    CFG.update(repo=repo.rstrip('/') + '/', work=work.rstrip('/') + '/', asr=asr.rstrip('/') + '/', key=key, model=model, **khac)
    os.makedirs(CFG['work'], exist_ok=True)


# ============ Chữ, pinyin ============
def chuan(s):  # giống chuanAm() trong assets/js/tu-vung-chung.js
    s = re.sub(r'\s+', '', str(s or ''))
    s = re.sub(r'(^|[。！？])[A-Z一-鿿]{1,4}[：:]', r'\1', s)
    return re.sub(r'[—–\-“”"]', '', s).replace('！', '。')


def gon(s): return re.sub(r'([。？！，])\1+', r'\1', str(s).strip())
def han(s): return ''.join(re.findall(r'[一-鿿]', s or ''))
def md10(s): return hashlib.md5(s.encode()).hexdigest()[:10]


def khong_dau(p):
    p = unicodedata.normalize('NFD', str(p or '').lower())
    p = ''.join(c for c in p if not unicodedata.combining(c)).replace('ü', 'u').replace('v', 'u')
    return re.sub(r'[^a-z]', '', p)


def py_asr(s):
    from pypinyin import lazy_pinyin
    s = re.sub(r'[呀哇]', '啊', s or '')   # 啊 biến âm (来啊 → lái ya) coi như đúng, cả hai phía
    return [p.replace('v', 'u').replace('ü', 'u') for p in lazy_pinyin(re.sub(r'[^一-鿿]|儿', '', s)) if p]


def cac_am(c):
    from pypinyin import pinyin, Style
    return list(dict.fromkeys(pinyin(c, heteronym=True, style=Style.TONE)[0]))


def da_am(c): return len(cac_am(c)) > 1


def chu_doc_khac(text):
    """Chữ đa âm đọc âm phụ mà âm phụ chỉ khác âm chính ở THANH (vd. 答应 dā/dá, 部分…): máy nhận dạng không phân biệt
    được thanh nên cô phải nghe. Chữ đa âm khác cả phụ âm / vần (重 chóng/zhòng, 便 pián/biàn) thì máy tự kiểm."""
    from pypinyin import pinyin, Style
    h = han(text)
    out = []
    for c, p in zip(h, [x[0] for x in pinyin(h, style=Style.TONE)]):
        if c in '了的地得着么吗呢吧啊个子们一不儿' or c in out: continue   # trợ từ, biến điệu: Style đã ghi luật chung
        if khong_dau(p) == p.replace('ü', 'u').replace('v', 'u'): continue   # thanh nhẹ: đọc nặng nhẹ đều chấp nhận
        rs = cac_am(c)
        if p != pinyin(c)[0][0] and any(khong_dau(r) == khong_dau(p) and r != p for r in rs): out.append(c)
    return out


TEN_QUEN = {'hanyu', 'hanzi', 'zhongguo', 'zhongwen', 'beijing', 'shanghai', 'chunjie', 'meiguo', 'yingguo', 'riben', 'hanguo',
            'faguo', 'deguo', 'yingyu', 'fayu', 'riyu', 'hanyu', 'zhongqiujie', 'yuenan', 'yuenanyu', 'xianggang', 'taiwan', 'changcheng',
            'changjiang', 'huanghe', 'yazhou', 'ouzhou', 'feizhou', 'zhongguoren', 'beijingren'}


def ten_rieng(py, typ):
    toks = re.findall(r"[A-Za-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüÜĀÁǍÀĒÉĚÈĪÍǏÌŌÓǑÒŪÚǓÙ·']+|[.!?。！？]", py or '')
    dau = True
    for t in toks:
        if t in '.!?。！？': dau = True; continue
        if t[0].isupper() and (typ != 'cau' or not dau) and khong_dau(t) not in TEN_QUEN: return True
        dau = False
    return False


# ============ 1. Gom danh sách ============
def tep_cap(cap): return CFG['repo'] + 'data/tu-vung/cap-%s.json' % cap


def gom(cap, tu, den):
    if str(cap).startswith('bai'):
        import thu_am_bai; return thu_am_bai.gom_bai(sys.modules[__name__], cap)
    """Gom mục cần thu của mã thứ tu..den (đếm từ 1, gồm cả hai đầu). Giống gom2.py + thêm pinyin, cờ cần nghe."""
    d = json.load(open(tep_cap(cap)))
    B = json.load(open(CFG['repo'] + 'assets/am/ban-do.json'))
    out, seen, bo = [], set(), []

    def pick(doc, hien):  # chữ có 儿 đọc theo chữ hiển thị (quy chuẩn 14 §3.2)
        if '儿' in (hien or '') and doc != '-': return hien
        return doc or hien

    def add(text, py, typ, src, o=None, o_chu=None):
        """o: ô dữ liệu [Mã, tên ô] cần ghi thẳng đường dẫn file (ô '-'); o_chu: ô dùng nếu đây là chữ đa âm một chữ."""
        text = (text or '').strip()
        if not text or text.startswith('assets/') or text == '-': bo.append((src, text)); return
        k = chuan(text)
        if k in ('了', '么', '了。', '么。'): bo.append((src, text + ' (đứng riêng, để giọng máy)')); return
        if o_chu and len(han(k)) == 1 and da_am(han(k)): o, typ = o or o_chu, 'chu'   # chữ đa âm một chữ: ghi thẳng ô Đọc (§8)
        id_ = (k + '|' + khong_dau(py)) if o else k
        if not o and k in B: return
        if not k or id_ in seen: return
        seen.add(id_)
        it = dict(id=id_, k=k, text=gon(text), py=(py or '').replace('·', '').strip(), typ=typ, thu='cau' if typ == 'cau' else 'tu',
                  src=src, ten=md10(id_ if o else k), o=o, trang='cho')
        out.append(it)

    for w in d[tu - 1:den]:
        ma = w['Mã']; doc = (w.get('Đọc từ') or '').strip()
        if doc.startswith('assets/'): bo.append((ma + ' từ', 'đã có file'))
        else:
            o = [ma, 'Đọc từ'] if doc == '-' else None
            add(w['Chữ Hán'] if doc == '-' else pick(doc, w['Chữ Hán']), w.get('Pinyin'), 'tu', ma + ' từ', o, [ma, 'Đọc từ'])
        for l in (w.get('Cụm từ') or '').split('\n'):
            p = [x.strip() for x in l.split('|')]
            if p[0]: add(p[0], p[1] if len(p) > 1 else '', 'tu', ma + ' cụm')
    for w in d[tu - 1:den]:
        ma = w['Mã']
        for i in (1, 2):
            c = w.get('Câu %d' % i); doc = (w.get('Đọc câu %d' % i) or '').strip()
            if not c: continue
            if doc.startswith('assets/'): bo.append((ma + ' câu%d' % i, 'đã có file')); continue
            o = [ma, 'Đọc câu %d' % i] if doc == '-' else None
            add(c if doc == '-' else pick(doc, c), w.get('Pinyin câu %d' % i), 'cau', ma + ' câu%d' % i, o)
    # cờ "cô cần nghe" (nhận dạng không kiểm được thanh điệu, 儿化)
    for it in out:
        co = []
        dk = chu_doc_khac(it['py'] and it['text'])
        if it['typ'] == 'chu':
            c = han(it['text'])
            if khong_dau(it['py']) != khong_dau(cac_am(c)[0]) or it['py'] != cac_am(c)[0] and any(
                    khong_dau(r) == khong_dau(it['py']) and r != it['py'] for r in cac_am(c)): dk = [c]
        lech = it['typ'] == 'chu' or (it['py'] and '儿' not in it['text'] and khong_dau(it['py']) != ''.join(py_asr(it['text'])))
        if dk: co.append('đa âm ' + ''.join(dk))
        if re.search(r'.儿', it['text']): co.append('儿化')
        if ten_rieng(it['py'], it['typ']): co.append('tên riêng')
        it['co'] = co
        it['alt'] = khong_dau(it['py']) if lech else ''   # pypinyin đọc khác kho → nhận dạng đối chiếu theo pinyin của kho
    return out, bo


# ============ 2. Chia lượt + Style ============
NHIP = {
    'tu': "Read as a warm, smiling female Mandarin teacher for learners: slow, clear, standard Putonghua (Beijing). "
          "Each line is one word or short phrase; read every line exactly once, in order, with a clear pause after each line. "
          "Do not skip, repeat, or add anything. Say each line with a falling statement intonation.",
    'cau': "Read as a warm, slightly smiling female Mandarin teacher for learners: slow, clear, standard Putonghua (Beijing), natural sentence melody. "
           "Each line is one sentence; read every line exactly once, in order, with a clear pause after each line. "
           "Read ONLY the given text: do not add, skip, or repeat any words or sentences. "
           "Intonation: statements fall at the end; questions ending in 吗 rise gently; A不A questions (好不好, 是不是) rise gently; "
           "in questions with 什么, 谁, 哪, 哪儿, 怎么, 几, 多少, 为什么 put light stress on the question word; "
           "make a short natural pause at commas and between a question and its answer.",
    'chu': "Read like flipping flashcards: each line is ONE single Chinese character. Say ONLY that character, once, clearly, "
           "in the exact reading given below, with a clear pause after each line. Do not add any other word.",
}
LUAT = ("Tone sandhi: two third tones -> the first becomes second tone; 一 is yí before a 4th tone and yì before 1st/2nd/3rd tones (第一 dì-yī); "
        "不 is bú before a 4th tone, bù otherwise. "
        "Neutral tones: 的 了 吗 呢 吧 们 子 个(ge) 着(zhe) are light and short; reduplicated kinship words have a neutral second syllable "
        "(妈妈 māma, 哥哥 gēge); also 什么 shénme, 名字 míngzi, 朋友 péngyou, 认识 rènshi, 喜欢 xǐhuan, 休息 xiūxi, 没关系 méi guānxi, "
        "对不起 duìbuqǐ, 客气 kèqi, 谢谢 xièxie, 东西 dōngxi (thing), 地方 dìfang, 衣服 yīfu, 知道 zhīdao, 告诉 gàosu. "
        "常常 is chángcháng (both full second tones, never neutral). 多 in 多大 / 多高 / 多长 / 多久 is FIRST tone duō, never duó.")
ER = ("ERHUA: 儿 written after another character is NOT a separate syllable ér. Merge it into the previous syllable as a retroflex r-ending, "
      "curling the tongue at the end of that syllable, and stop cleanly right after the r, with no added vowel "
      "(哪儿 nǎr, 这儿 zhèr, 一点儿 yìdiǎnr, 玩儿 wánr, 一会儿 yíhuìr). Only 儿子 érzi, 女儿 nǚ'ér, 婴儿, 儿童, 儿科 keep a full ér syllable.")


def dong_py(it):
    """Cách đọc của một dòng: CHỈ pinyin, không chép lại chữ Hán (chép lại thì Gemini dễ đọc to cả danh sách này)."""
    s = it['py'] or '(standard reading)'
    if it['typ'] == 'chu':
        khac = [p for p in cac_am(han(it['text'])) if khong_dau(p) != khong_dau(it['py']) or p != it['py']][:3]
        if khac: s += ' (NOT %s)' % ', '.join(khac)
    return s


def tao_style(ds, typ, ghi_chu='', giong='Sulafat'):
    st = NHIP[typ]
    if GIONG_TA.get(giong, 'female') == 'male': st = st.replace('female Mandarin teacher', 'male Mandarin teacher')
    if typ != 'chu': st += '\n' + LUAT
    if any(re.search(r'.儿', it['text']) for it in ds): st += '\n' + ER
    st += ('\nPronunciation of the lines, in the same order: ' + '; '.join(dong_py(it).rstrip('.') for it in ds) + '.')
    if ghi_chu: st += '\n' + ghi_chu
    return st


def ban_doc(dong): return ' <long pause>\n'.join(gon(l) for l in dong)   # không nghỉ sau dòng cuối (đỡ tiếng "嗯" thừa)


# Cách gửi Style. Model 3.8: cổng `interactions`, Style ở annotations[].speech_metadata.style, ô text chỉ có lời đọc
# (ai.google.dev/gemini-api/docs/speech-generation). 'tuong_tac_gon': chỉ gửi câu đầu của Style (nhịp, sắc thái).
KIEU = ('tuong_tac', 'tuong_tac_gon', 'dao_dien')
PB_KIEU = 'v3'


def than_yeu_cau(style, dong, kieu):
    if kieu.startswith('tuong_tac'):
        if kieu == 'tuong_tac_gon': style = style.split('\n')[0]
        return {'model': CFG['model'].replace('models/', ''),
                'input': [{'type': 'user_input', 'content': [{'type': 'text', 'text': ban_doc(dong),
                                                              'annotations': [{'type': 'speech_metadata', 'style': style}]}]}],
                'response_format': {'type': 'audio'},
                'generation_config': {'speech_config': [{'voice': CFG['voice']}]}}
    ten = {'responseModalities': ['AUDIO'], 'speechConfig': {'voiceConfig': {'prebuiltVoiceConfig': {'voiceName': CFG['voice']}}}}
    if kieu == 'he_thong':
        return {'systemInstruction': {'parts': [{'text': 'You are a text-to-speech voice. Speak ONLY the user text, never these instructions. ' + style}]},
                'contents': [{'role': 'user', 'parts': [{'text': ban_doc(dong)}]}], 'generationConfig': ten}
    txt = ("# AUDIO PROFILE: a female Mandarin teacher recording vocabulary audio for learners.\n"
           "### DIRECTOR'S NOTES (instructions only — NEVER read these notes aloud)\n" + style +
           "\n#### TRANSCRIPT (speak ONLY the lines below, nothing else)\n" + ban_doc(dong))
    return {'contents': [{'role': 'user', 'parts': [{'text': txt}]}], 'generationConfig': ten}


def chia(L, n):
    if not L: return []
    k = -(-len(L) // n); s = -(-len(L) // k)
    return [L[i:i + s] for i in range(0, len(L), s)]


def chia_luot(ds):
    out = []
    for gi in ['Sulafat'] + sorted({it.get('giong', 'Sulafat') for it in ds} - {'Sulafat'}):
      for typ in ('tu', 'chu', 'cau'):
        L = [it for it in ds if it['typ'] == typ and it.get('giong', 'Sulafat') == gi]
        for b in chia(L, CFG['max_chu'] if typ == 'chu' else CFG['max_dong']):
            ten = 'l%02d' % (len(out) + 1)
            out.append(dict(ten=ten, typ=typ, giong=gi, ids=[it['id'] for it in b], dong=[it['text'] for it in b], style=tao_style(b, typ, giong=gi)))
    return out


# ============ 3. Gọi Gemini TTS ============
def _rq():
    import requests
    return requests


def chon_model(in_ra=True):
    r = _rq().get(API + 'models', params={'pageSize': 1000}, headers={'x-goog-api-key': CFG['key']}, timeout=60)
    r.raise_for_status()
    ms = [m['name'] for m in r.json().get('models', []) if 'tts' in m['name'].lower()]

    def diem(n):
        v = re.search(r'gemini-(\d+(?:\.\d+)?)', n)
        return (float(v.group(1)) if v else 0, 'flash' in n and 'lite' not in n, 'preview' not in n, n)
    ms.sort(key=diem, reverse=True)
    if in_ra: print('Các model TTS mã API thấy được:', *ms, sep='\n  ')
    if not CFG['model']: CFG['model'] = next((m for m in ms if 'flash' in m), ms[0] if ms else None)
    if not CFG['model'].startswith('models/'): CFG['model'] = 'models/' + CFG['model']
    print('→ Dùng:', CFG['model'], '· giọng', CFG['voice'])
    return ms


def ghi_nhat_ky(dot, luot, giay, meta):
    f = CFG['work'] + 'nhat_ky.csv'
    moi = not os.path.exists(f)
    with open(f, 'a', newline='') as fh:
        w = csv.writer(fh)
        if moi: w.writerow(['thoi_gian', 'dot', 'luot', 'giay_am', 'tok_vao', 'tok_ra', 'usd_uoc', 'model'])
        w.writerow([datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S'), dot, luot, round(giay, 1),
                    meta.get('promptTokenCount', ''), meta.get('candidatesTokenCount', ''),
                    round(giay / 3600 * CFG['usd_gio'], 4), CFG['model']])


GIONG_DIR = {'Sulafat': None, 'Achird': 'nam1', 'Iapetus': 'nam2', 'Charon': 'nam3', 'Puck': 'nam4', 'Leda': 'nu2', 'Gacrux': 'nu3', 'Despina': 'nu4'}   # quy chuẩn 14 §4b
GIONG_TA = {'Sulafat': 'female', 'Achird': 'male', 'Iapetus': 'male', 'Charon': 'male', 'Puck': 'male', 'Leda': 'female', 'Gacrux': 'female', 'Despina': 'female'}


def doc_tts(t):
    """Chữ GỬI cho Gemini (chỉ ở khâu đọc; dữ liệu/hiển thị trên web giữ nguyên).
    - Dãy số điện thoại / số khẩn cấp: 一 đọc yāo -> viết 幺 (Gemini hay đọc 一 thành yī dù Style dặn).
    - 广 đứng một mình (bộ thủ) đọc yǎn -> gửi 眼 (cùng âm yǎn)."""
    t = str(t)
    if han(t) == '广' and len(t.strip()) <= 2: return '眼'
    def doi(m):
        g = m.group(0)
        return g.replace('一', '幺') if ('〇' in g or '零' in g or '一一' in g) else g
    return re.sub(r'[〇零一二三四五六七八九]{2,}', doi, t)


def luot_hom_nay():
    """Số lần đã gọi Gemini từ lúc hạn mức đặt lại gần nhất (0 giờ giờ Mỹ Thái Bình Dương ≈ 14–15 giờ VN), mọi đợt cộng lại."""
    import zoneinfo
    f = CFG['work'] + 'nhat_ky.csv'
    if not os.path.exists(f): return 0
    pt = datetime.datetime.now(zoneinfo.ZoneInfo('America/Los_Angeles'))
    moc = pt.replace(hour=0, minute=0, second=0, microsecond=0).astimezone(datetime.timezone.utc).replace(tzinfo=None)
    n = 0
    for r in csv.DictReader(open(f)):
        try:
            if datetime.datetime.strptime(r['thoi_gian'], '%Y-%m-%d %H:%M:%S') >= moc: n += 1
        except ValueError: pass
    return n


def goi_tts(style, dong, wav, dot, luot, kieu=None, giong=None):
    """giong: giọng khác Sulafat (hội thoại hai giọng, quy chuẩn 14 §4b)."""
    if re.match(r'cap-[0-9]', dot) and CFG.get('tran_kho'):   # kho 9 cấp: chừa lượt cho bài học (bác Nhiên 12/11/2026)
        n = luot_hom_nay()
        if n >= CFG['tran_kho']:
            raise HetHanMuc('Hôm nay đã gọi %d lần; kho từ vựng dừng ở %d để chừa %d lần cho bài học' % (n, CFG['tran_kho'], 100 - CFG['tran_kho']))
    dong = [doc_tts(l) for l in dong]
    v0 = CFG['voice']
    if giong: CFG['voice'] = giong
    try: return _goi_tts(style, dong, wav, dot, luot, kieu)
    finally: CFG['voice'] = v0


class HetHanMuc(RuntimeError):
    """Hết hạn mức số lần gọi Gemini trong ngày (Tier 1: 100 lần/ngày/model; đặt lại lúc 0 giờ giờ Mỹ Thái Bình Dương ≈ 15 giờ VN)."""


def _goi_tts(style, dong, wav, dot, luot, kieu=None):
    """Gọi Gemini một lần, ghi wav (PCM 16-bit mono). Thử lại khi lỗi mạng / 429 / 5xx. Trả về số giây âm thanh."""
    rq = _rq()
    kieu = kieu or CFG.get('kieu') or KIEU[0]
    body = than_yeu_cau(style, dong, kieu)
    url = API + ('interactions' if kieu.startswith('tuong_tac') else CFG['model'] + ':generateContent')
    loi_cuoi = ''
    for lan in range(7):
        if lan: time.sleep(min(20 * 2 ** (lan - 1), 300))
        try:
            r = rq.post(url, headers={'x-goog-api-key': CFG['key'], 'Content-Type': 'application/json'}, json=body, timeout=900)
        except rq.RequestException as e:
            loi_cuoi = 'mạng: %s' % e; print('   ⚠', loi_cuoi, '→ thử lại'); continue
        if r.status_code == 429 and re.search(r'per day|PerDay|requests_per_day|RPD', r.text):
            m = re.search(r'retry in ([\dhms.]+)', r.text)
            raise HetHanMuc('Hết hạn mức gọi Gemini hôm nay (100 lần/ngày)%s.' % (', mở lại sau ' + m.group(1) if m else ''))
        if r.status_code in (429, 500, 502, 503, 504):
            loi_cuoi = '%d %s' % (r.status_code, r.text[:200]); print('   ⚠', loi_cuoi, '→ thử lại')
            ra = r.headers.get('Retry-After')
            if ra and ra.isdigit(): time.sleep(min(int(ra), 300))
            continue
        if r.status_code != 200:
            raise RuntimeError('Gemini báo lỗi %d: %s' % (r.status_code, r.text[:800]))
        j = r.json()
        if 'steps' in j:   # cổng interactions: wav có sẵn header
            aud = [c for st in j['steps'] if st.get('type') == 'model_output' for c in st.get('content') or [] if c.get('type') == 'audio']
            if not aud:
                loi_cuoi = 'không có âm thanh (%s)' % str(j)[:200]; print('   ⚠', loi_cuoi, '→ thử lại'); continue
            os.makedirs(os.path.dirname(wav), exist_ok=True)
            open(wav + '.tmp', 'wb').write(base64.b64decode(aud[-1]['data']))
            with wave.open(wav + '.tmp') as w: giay = w.getnframes() / w.getframerate()
            os.replace(wav + '.tmp', wav)
            u = j.get('usage') or j.get('usageMetadata') or {}
            ghi_nhat_ky(dot, luot, giay, {'promptTokenCount': u.get('total_input_tokens', u.get('promptTokenCount', '')),
                                          'candidatesTokenCount': u.get('total_output_tokens', u.get('candidatesTokenCount', ''))})
            return giay
        parts = ((j.get('candidates') or [{}])[0].get('content') or {}).get('parts') or []
        aud = [p['inlineData'] for p in parts if 'inlineData' in p]
        if not aud:
            loi_cuoi = 'không có âm thanh (finishReason=%s)' % ((j.get('candidates') or [{}])[0].get('finishReason'))
            print('   ⚠', loi_cuoi, '→ thử lại'); continue
        pcm = b''.join(base64.b64decode(a['data']) for a in aud)
        m = re.search(r'rate=(\d+)', aud[0].get('mimeType', ''))
        rate = int(m.group(1)) if m else SR
        os.makedirs(os.path.dirname(wav), exist_ok=True)
        with wave.open(wav + '.tmp', 'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(pcm)
        os.replace(wav + '.tmp', wav)
        giay = len(pcm) / 2 / rate
        ghi_nhat_ky(dot, luot, giay, j.get('usageMetadata') or {})
        return giay
    raise RuntimeError('Gọi Gemini không được sau nhiều lần: ' + loi_cuoi)


# ============ 4. Cắt + kiểm (theo cat.py, quet2.py) ============
_REC = None


def rec():
    global _REC
    if _REC is None:
        import sherpa_onnx
        M = CFG['asr']
        _REC = sherpa_onnx.OfflineRecognizer.from_paraformer(paraformer=M + 'model.int8.onnx', tokens=M + 'tokens.txt', num_threads=4)
    return _REC


def asr_py(txt):
    """pinyin không dấu từ chữ máy nhận dạng (máy có lúc trả chữ La-tinh rời, vd. 上 → "s a n g")."""
    out = []
    txt = re.sub(r'啦$|啦(?=[，。？！])', '了', txt or '')   # 了 cuối câu máy hay nghe thành 啦
    for m in re.finditer(r'[一-鿿]+|[A-Za-z]+(?:\s[A-Za-z]+)*', txt):
        g = m.group(0)
        out += py_asr(g) if re.match(r'[一-鿿]', g) else [g.replace(' ', '').lower()]
    return out


def long(p): return re.sub(r'([zcs])h', r'\1', p)   # máy hay nhầm z/zh, c/ch, s/sh


def _nhan(x, sr=16000):
    import numpy as np
    s = rec().create_stream()
    s.accept_waveform(sr, np.concatenate([np.zeros(int(sr / 15), np.float32), x, np.zeros(int(sr / 7.5), np.float32)]))
    rec().decode_stream(s)
    return s.result.text


def _ratio(a, b): return difflib.SequenceMatcher(None, a, b).ratio() if a or b else 1.0


def cat_luot(wav, dong, ids, alt, ra_dir, ten_tep):
    """Cắt wav của một lượt thành từng dòng. dong: chữ; ids: khóa từng dòng; alt: pinyin kho (không dấu) hoặc '';
    ten_tep: tên file mp3 từng dòng. Trả về {id: {...}} + thông tin vùng."""
    import numpy as np
    os.makedirs(ra_dir, exist_ok=True)
    pcm = ra_dir + '_pcm.wav'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ignore_length', '1', '-i', wav, '-ac', '1', '-ar', str(SR), '-c:a', 'pcm_s16le', pcm], check=True)
    with wave.open(pcm) as w: x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    x16 = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', pcm, '-f', 's16le', '-ac', '1', '-ar', '16000', '-'],
                                       capture_output=True, check=True).stdout, np.int16).astype(np.float32) / 32768
    seg16 = lambda a, b: x16[int(a * 16000):int(b * 16000)]
    dur = len(x) / SR
    out = subprocess.run(['ffmpeg', '-v', 'info', '-i', pcm, '-af', 'silencedetect=n=-40dB:d=0.2', '-f', 'null', '-'], capture_output=True, text=True).stderr
    st = [float(v) for v in re.findall(r'silence_start: ([\d.]+)', out)]
    en = [float(v) for v in re.findall(r'silence_end: ([\d.]+)', out)]
    sil = list(zip(st, en + [dur] * (len(st) - len(en))))
    vung, t = [], 0.0
    for a, b in sil:
        if a - t > 0.08: vung.append([t, a])
        t = b
    if dur - t > 0.08: vung.append([t, dur])
    for v in vung: v.append(_nhan(seg16(v[0], v[1])))
    # bỏ vùng chỉ là tiếng thở / "嗯", "呃" ngắn (Gemini hay thêm ở cuối file)
    vung = [v for v in vung if not (v[1] - v[0] < 0.8 and v[2].strip() and re.fullmatch(r'[嗯呃额唔，。\s]*', v[2]))]
    n, m = len(dong), len(vung)
    P = [[long(p) for p in py_asr(l)] for l in dong]
    alt = [long(a) for a in alt]

    def r_dong(i, txt):
        p = [long(q) for q in asr_py(txt)]
        return _ratio(alt[i], ''.join(p)) if alt[i] else _ratio(P[i], p)
    NEG = -1e9
    dp = [[NEG] * (m + 1) for _ in range(n + 1)]; bk = [[None] * (m + 1) for _ in range(n + 1)]
    dp[0][0] = 0
    for i in range(n + 1):
        for j in range(m + 1):
            c = dp[i][j]
            if c == NEG: continue
            if j < m:   # bỏ vùng thừa: vùng ngắn / có 嗯 (tiếng thở, "ừm") bỏ rẻ hơn ghép vào dòng
                bo = 0.05 if '嗯' in vung[j][2] else (0.15 if vung[j][1] - vung[j][0] < 0.6 else 0.6)
                if c - bo > dp[i][j + 1]: dp[i][j + 1], bk[i][j + 1] = c - bo, ('bovung', i, j)
            if i < n and c - 0.8 > dp[i + 1][j]: dp[i + 1][j], bk[i + 1][j] = c - 0.8, ('bodong', i, j)
            if i < n:
                for k in range(1, 5):
                    if j + k > m: break
                    txt = ''.join(v[2] for v in vung[j:j + k])
                    r = r_dong(i, txt)
                    sc = c + r - 0.05 * (k - 1)
                    if sc > dp[i + 1][j + k]: dp[i + 1][j + k], bk[i + 1][j + k] = sc, ('ghep', i, j, k, r, txt)
    i, j, kq = n, m, {}
    while i or j:
        b = bk[i][j]
        if b[0] == 'ghep': kq[b[1]] = (b[2], b[3], b[4], b[5])
        i, j = b[1], b[2]
    res = {}
    for i, l in enumerate(dong):
        if i not in kq:
            res[ids[i]] = dict(r=0, asr='', loi=['thiếu (không tìm thấy trong file)']); continue
        j, k, r, txt = kq[i]
        a = max(0, vung[j][0] - 0.12); b = min(dur, vung[j + k - 1][1] + 0.15)
        if i + 1 in kq: b = min(b, vung[kq[i + 1][0]][0] - 0.02)
        if i - 1 in kq: a = max(a, vung[kq[i - 1][0] + kq[i - 1][1] - 1][1] + 0.02)
        d = b - a
        tmp = ra_dir + '_c.wav'
        dich = ra_dir + ten_tep[i] + '.mp3'
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '%.3f' % a, '-t', '%.3f' % d, '-i', pcm,
                        '-af', 'afade=t=in:d=0.04,afade=t=out:st=%.3f:d=0.08,apad=pad_dur=0.3,loudnorm=I=-16:TP=-1.5:LRA=11' % max(0, d - 0.08),
                        '-ar', str(SR), tmp], check=True)
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', 'atrim=end=%.3f' % (d + 0.05), '-ac', '1', '-ar', str(SR), '-b:a', '48k', dich], check=True)
        loi = []
        nc = max(1, len(han(re.sub(r'(?<=.)儿', '', l))))
        if nc == 1:   # chữ lẻ: lặp đoạn 3 lần cho máy nghe (quet2.py); đạt một trong hai cách kiểm là được
            seg = seg16(a, b); g = np.zeros(int(0.17 * 16000), np.float32)
            t3 = _nhan(np.concatenate([seg, g, seg, g, seg]))
            ref = alt[i] or ''.join(P[i])
            if ref and ref in long(''.join(asr_py(t3))): r = max(r, 1.0)
            elif r < 0.9: loi.append('chữ lẻ nghe khác (máy nghe: %s)' % t3)
            if d > 1.4: loi.append('âm tiết dài %.1f s' % d)
        else:
            if r < 0.9: loi.append('khớp thấp %.2f' % r)
            if d / nc > 0.75: loi.append('dài bất thường %.1f s' % d)
            elif d / nc < 0.17: loi.append('ngắn bất thường %.1f s' % d)
        res[ids[i]] = dict(r=round(r, 3), asr=txt, dai=round(d, 2), tam=dich, loi=loi)
    os.remove(pcm)
    return res, dict(vung=m, dong=n, thua=max(0, m - sum(kq[i][1] for i in kq)),
                     ds_vung=[[round(a, 2), round(b, 2), t] for a, b, t in vung])


# ============ 5. Đợt: chạy, thu lại, nghe, đẩy ============
def thu_muc(cap, tu, den): return CFG['work'] + 'cap-%s_%04d-%04d/' % (cap, tu, den)


def _doc(f, mac=None):
    return json.load(open(f)) if os.path.exists(f) else mac


def _ghi(f, o):
    json.dump(o, open(f + '.tmp', 'w'), ensure_ascii=False, indent=0); os.replace(f + '.tmp', f)


def chon_kieu(ds, D, dot):
    """Thử các cách gói Style trên 8 dòng (vài giây âm thanh), chọn cách Gemini chỉ đọc đúng danh sách. Lưu vào Drive."""
    f = CFG['work'] + 'kieu.json'
    k = _doc(f, {})
    khoa = str(CFG['model']) + '|' + PB_KIEU
    if k.get(khoa): CFG['kieu'] = k[khoa]; return
    mau = [it for it in ds if it['typ'] == 'tu'][:6] + [it for it in ds if it['typ'] == 'cau'][:2]
    print('🔎 Thử cách gửi Style cho %s (%d dòng mẫu)…' % (CFG['model'], len(mau)))
    for kieu in KIEU:
        for typ in ('tu', 'cau'):
            m = [it for it in mau if it['typ'] == typ]
            if not m: continue
            wav = D + 'wav/_thu_%s_%s.wav' % (kieu, typ)
            try:
                if not os.path.exists(wav): goi_tts(tao_style(m, typ), [it['text'] for it in m], wav, dot, '_thu_' + kieu, kieu)
            except RuntimeError as e:
                print('   %s: không dùng được (%s)' % (kieu, str(e)[:160])); break
            res, meta = cat_luot(wav, [it['text'] for it in m], [it['id'] for it in m], [it['alt'] for it in m],
                                 D + 'tam/_thu_%s_%s/' % (kieu, typ), [it['ten'] for it in m])
            dat = sum(1 for r in res.values() if not r['loi'])
            print('   %s · %s: %d vùng / %d dòng · đạt %d · máy nghe: %s' % (kieu, typ, meta['vung'], len(m), dat,
                  ' | '.join(v[2] for v in meta['ds_vung'][:10])))
            for it in m:
                r = res[it['id']]
                if r['loi']: print('      ✗ %s → máy nghe "%s" · %s' % (it['text'], r.get('asr', ''), ', '.join(r['loi'])))
            if dat < len(m) - (1 if typ == 'tu' else 0) or meta['vung'] > len(m) + (1 if typ == 'tu' else 2): break
        else:
            CFG['kieu'] = k[khoa] = kieu; _ghi(f, k)
            print('→ Chọn cách:', kieu); return
    raise RuntimeError('Chưa cách gửi nào làm Gemini chỉ đọc đúng danh sách. Cô chụp màn hình phần trên gửi bên soạn.')


def bo_sung_moi(cap, tu, den, D, ds):
    """Bài đã thu rồi mà dữ liệu bài có thêm chữ / câu mới: gom lại, chỉ THÊM mục chưa có vào ds và thêm lượt mới (không thu lại mục cũ)."""
    ds2, bo2 = gom(cap, tu, den)
    co = {it['id'] for it in ds}
    moi = [it for it in ds2 if it['id'] not in co]
    if not moi: return
    L = _doc(D + 'luot.json')
    Lm = chia_luot(moi)
    if L is None: return   # chưa chia lượt: chay_dot sẽ chia từ ds đã có thêm mục mới
    for i, b in enumerate(Lm): b['ten'] = 'l%02d' % (len(L) + i + 1)
    ds.extend(moi); L.extend(Lm)
    _ghi(D + 'ds.json', ds); _ghi(D + 'luot.json', L); _ghi(D + 'bo.json', bo2)
    print('Bổ sung %d mục mới vào bài đã thu: %s' % (len(moi), ' '.join(it['text'] for it in moi[:12])))


def chay_dot(cap, tu, den, gioi_han_luot=None):
    """Gom → chia lượt → gọi Gemini → cắt, kiểm → tự thu lại mục lỗi. Chạy lại được bất cứ lúc nào."""
    D = thu_muc(cap, tu, den); os.makedirs(D + 'ketqua', exist_ok=True)
    t0 = time.time()
    ds = _doc(D + 'ds.json')
    if ds is None:
        ds, bo = gom(cap, tu, den)
        _ghi(D + 'ds.json', ds); _ghi(D + 'bo.json', bo)
        print('Gom HSK%s %d → %d: %d từ/cụm, %d chữ đa âm (ghi thẳng ô Đọc), %d câu · bỏ %d mục (了/么 riêng, đã có file)' % (
            cap, tu, den, sum(it['typ'] == 'tu' for it in ds), sum(it['typ'] == 'chu' for it in ds), sum(it['typ'] == 'cau' for it in ds), len(bo)))
    elif str(cap).startswith('bai'): bo_sung_moi(cap, tu, den, D, ds)
    L = _doc(D + 'luot.json')
    if L is None:
        L = chia_luot(ds); _ghi(D + 'luot.json', L)
    print('%d mục · %d lượt: %s' % (len(ds), len(L), ', '.join('%s(%s %s %d)' % (b['ten'], b['typ'], b.get('giong', ''), len(b['dong'])) for b in L)))
    by = {it['id']: it for it in ds}
    dot = 'cap-%s_%04d-%04d' % (cap, tu, den)
    chon_kieu(ds, D, dot)
    for b in L:   # Style luôn tạo lại theo mã mới nhất; lượt thu bằng cách gửi cũ thì thu lại
        b['style'] = tao_style([by[i] for i in b['ids']], b['typ'], giong=b.get('giong', 'Sulafat'))
        kf = D + 'ketqua/%s.json' % b['ten']
        if os.path.exists(kf) and _doc(kf)['meta'].get('kieu') != CFG['kieu']:
            for f in (kf, D + 'wav/%s.wav' % b['ten']):
                if os.path.exists(f): os.remove(f)
            print('   (%s thu lại vì lần trước gửi Style kiểu cũ)' % b['ten'])
    _ghi(D + 'luot.json', L)
    try:
        giay = _chay_cac_luot(cap, tu, den, D, L, by, ds, dot, gioi_han_luot)
    except HetHanMuc as e:
        _ghi(D + 'ds.json', ds); bao_cao(cap, tu, den, giay_chay=time.time() - t0); bao_het_han_muc(e); return
    if giay is None: return
    bao_cao(cap, tu, den, giay_moi=giay, giay_chay=time.time() - t0)


def _chay_cac_luot(cap, tu, den, D, L, by, ds, dot, gioi_han_luot):
    giay = 0
    for b in L[:gioi_han_luot]:
        wav = D + 'wav/%s.wav' % b['ten']
        if not os.path.exists(wav):
            print('▶ %s: gọi Gemini (%d dòng)…' % (b['ten'], len(b['dong'])), end=' ', flush=True)
            t1 = time.time(); g = goi_tts(b['style'], b['dong'], wav, dot, b['ten'], giong=b.get('giong')); giay += g
            print('%.0f s âm thanh, %.0f s chờ' % (g, time.time() - t1))
        kf = D + 'ketqua/%s.json' % b['ten']
        if os.path.exists(kf): continue
        its = [by[i] for i in b['ids']]
        res, meta = cat_luot(wav, b['dong'], b['ids'], [it['alt'] for it in its], D + 'tam/%s/' % b['ten'], [it['ten'] for it in its])
        for it in its: _nhan_ket_qua(D, it, res[it['id']])
        meta['kieu'] = CFG['kieu']
        _ghi(kf, dict(meta=meta, res=res)); _ghi(D + 'ds.json', ds)
        nl = sum(1 for it in its if it['loi'])
        print('   ✂ %s: %d vùng / %d dòng%s · đạt %d · lỗi %d' % (b['ten'], meta['vung'], meta['dong'],
              ' (thừa %d vùng)' % meta['thua'] if meta['thua'] else '', len(its) - nl, nl))
        if nl > 0.4 * len(its):   # chốt an toàn: Gemini đọc bất thường (đọc cả Style, bỏ dòng…) → dừng, khỏi tốn tiền
            print('\n⛔ Lượt %s lỗi %d/%d dòng — Gemini đọc bất thường. Dừng lại để khỏi tốn tiền.\n'
                  '   Bác gửi bên soạn đoạn chữ này + file %s để xem.' % (b['ten'], nl, len(its), wav))
            print('   Máy nghe được ở các vùng đầu:', [v[2] for v in meta['ds_vung'][:6]])
            return None
    giay += thu_lai_tu_dong(cap, tu, den, ds)
    return giay


def _nhan_ket_qua(D, it, r):
    it['r'], it['asr'], it['loi'] = r.get('r', 0), r.get('asr', ''), r.get('loi', [])
    it['dai'] = r.get('dai')
    if r.get('tam'):
        it['da_day'] = False; it['tts2'] = True   # file mới: lần "Đẩy lên web" sau phải đẩy lại
        dich = D + 'mp3/%s/%s.mp3' % (it['thu'], it['ten'])
        os.makedirs(os.path.dirname(dich), exist_ok=True); shutil.copy(r['tam'], dich)
        it['file'] = dich
    it['trang'] = 'loi' if it['loi'] else 'xong'


def thu_lai_nhom(D, its, dot, ep=False):
    """Thu lại NHIỀU mục trong MỘT lần gọi (đỡ tốn hạn mức 100 lần/ngày): mỗi mục đọc 2 lần (danh sách lặp 2 vòng),
    Style chỉ nói về các mục đó (+ ghi chú của cô). Mỗi mục chọn bản tốt hơn. its: cùng loại, cùng giọng, ≤ 12 mục."""
    it0 = its[0]; typ = 'chu' if it0['typ'] == 'chu' else it0['typ']; giong = it0.get('giong', 'Sulafat')
    st = tao_style(its, typ, giong=giong).replace('Pronunciation of the lines, in the same order:',
                                                    'The list is read twice (two rounds). Pronunciation of the lines of each round, in order:')
    dk = sorted({c for it in its for c in chu_doc_khac(it['text'])})
    if dk: st += '\nPay attention to: ' + ', '.join(dk) + ' (read as in the pinyin above).'
    gc = [(it['text'], it.get('ghi_chu', '').strip()) for it in its if it.get('ghi_chu', '').strip()]
    if gc: st += '\nTeacher notes (follow exactly): ' + '; '.join('%s: %s' % x for x in gc)
    ngan = [it for it in its if len(han(it['text'])) <= 4]
    if ngan: st += '\nShort lines: say exactly the written syllables, never repeat a syllable.'
    lan = max(it.get('lan', 0) for it in its) + 1
    ten = 'r-%s-%d-n%d' % (it0['ten'], lan, len(its))
    wav = D + 'wav/%s.wav' % ten
    dong = [it['text'] for it in its] * 2
    g = 0
    if not os.path.exists(wav): g = goi_tts(st, dong, wav, dot, ten, giong=it0.get('giong'))
    for it in its: it['lan'] = it.get('lan', 0) + 1
    ids = ['%s#%d' % (it['id'], v) for v in range(2) for it in its]
    res, meta = cat_luot(wav, dong, ids, [it['alt'] for it in its] * 2, D + 'tam/%s/' % ten,
                         ['%s_%d' % (it['ten'], v) for v in range(2) for it in its])
    for it in its:
        tot = sorted((r for k, r in res.items() if k.rsplit('#', 1)[0] == it['id'] and r.get('tam')), key=lambda r: (len(r['loi']), -r['r']))
        cu = dict(r=it.get('r', 0), loi=it.get('loi', []))
        # ep=True (cô bấm Thu lại): luôn nhận bản mới, vì máy nghe không phân biệt được yāo/yī, dā/dá… nên điểm không nói bản nào đúng hơn
        if tot and (ep or (len(tot[0]['loi']), -tot[0]['r']) <= (len(cu['loi']) if it.get('file') else 99, -cu['r'])):
            _nhan_ket_qua(D, it, tot[0])
    return g


def _nhom(its, n=12):
    out = {}
    for it in its: out.setdefault((it['typ'], it.get('giong', 'Sulafat')), []).append(it)
    return [g[i:i + n] for g in out.values() for i in range(0, len(g), n)]


def thu_lai_muc(D, it, dot, ghi_chu='', ep=False):
    if ghi_chu: it['ghi_chu'] = it.get('ghi_chu') or ghi_chu
    return thu_lai_nhom(D, [it], dot, ep)


def thu_lai_tu_dong(cap, tu, den, ds=None):
    D = thu_muc(cap, tu, den); ds = ds or _doc(D + 'ds.json'); dot = 'cap-%s_%04d-%04d' % (cap, tu, den)
    g = 0
    for vong in range(CFG['so_lan_thu_lai']):
        can = [it for it in ds if it.get('loi') and it.get('lan', 0) < CFG['so_lan_thu_lai'] and it.get('quyet') != 'dat']   # bác đã nghe, chọn Đạt thì giữ
        if not can: break
        nh = _nhom(can)
        print('↻ Tự thu lại %d mục lỗi, gộp %d lần gọi (vòng %d)…' % (len(can), len(nh), vong + 1))
        for its in nh:
            g += thu_lai_nhom(D, its, dot); _ghi(D + 'ds.json', ds)
            for it in its: print('   %s %s · %s' % ('✓' if not it['loi'] else '✗', it['text'], ', '.join(it['loi']) or 'đạt'))
    return g


def bao_het_han_muc(e):
    print('\n⏸ %s\n   Phần đã thu vẫn lưu trong Drive. Sau khoảng 15 giờ chiều (giờ VN) chạy lại ô 2 → ô 3: sổ làm tiếp, không thu lại phần đã có.\n'
          '   Trong lúc chờ có thể chạy ô 4 (nghe) và ô 6 (đẩy phần đạt lên web).' % e)


def can_nghe(it): return (it.get('co') or it.get('loi')) and it.get('quyet') != 'dat'


def bao_cao(cap, tu, den, giay_moi=0, giay_chay=0):
    D = thu_muc(cap, tu, den); ds = _doc(D + 'ds.json')
    nk = []
    if os.path.exists(CFG['work'] + 'nhat_ky.csv'):
        nk = [r for r in csv.DictReader(open(CFG['work'] + 'nhat_ky.csv')) if r['dot'] == 'cap-%s_%04d-%04d' % (cap, tu, den)]
    g = sum(float(r['giay_am']) for r in nk)
    usd = g / 3600 * CFG['usd_gio']
    xong = sum(1 for it in ds if it['trang'] == 'xong')
    nghe = [it for it in ds if can_nghe(it)]
    bc = dict(muc=len(ds), dat_tu_dong=sum(1 for it in ds if it['trang'] == 'xong' and not it.get('co')),
              can_co_nghe=len(nghe), con_loi=sum(1 for it in ds if it.get('loi')), luot_goi=len(nk),
              giay_am=round(g), usd=round(usd, 3), vnd=round(usd * CFG['vnd_usd']), giay_chay_lan_nay=round(giay_chay))
    _ghi(D + 'bao_cao.json', bc)
    print('\n══ Báo cáo đợt HSK%s %d → %d ══' % (cap, tu, den))
    print('Mục: %d · cắt đạt: %d · máy tự kiểm đạt, không cần nghe: %d · bác cần nghe: %d (còn lỗi sau thu lại: %d)' % (
        len(ds), xong, bc['dat_tu_dong'], len(nghe), bc['con_loi']))
    print('Gemini: %d lần gọi · %.1f phút âm thanh · ước %.3f USD ≈ %s đ' % (len(nk), g / 60, usd, format(bc['vnd'], ',').replace(',', '.')))
    if giay_chay: print('Thời gian chạy lần này: %.1f phút' % (giay_chay / 60))


def bang_nghe(cap, tu, den, tat_ca=False):
    """Bảng nghe trong Colab: chỉ các mục cần cô nghe. Tick Đạt / Thu lại (lưu ngay vào Drive)."""
    import ipywidgets as W
    from IPython.display import display, Audio, HTML
    D = thu_muc(cap, tu, den); ds = _doc(D + 'ds.json')
    hien = [it for it in ds if (tat_ca or can_nghe(it) or it.get('quyet') == 'thu_lai') and it.get('file')]
    thieu = [it for it in ds if not it.get('file')]
    display(HTML('<b>%d mục cần nghe</b> (đa âm, 儿化, tên riêng, máy khớp thấp). Bấm ▶ nghe, rồi chọn <b>Đạt</b> hoặc <b>Thu lại</b> '
                 '(có thể ghi cách đọc đúng vào ô ghi chú, vd. <i>长 = zhǎng</i>). Lựa chọn tự lưu.%s' % (
                     len(hien), '<br>⚠ %d mục chưa có file (thiếu): %s' % (len(thieu), '、'.join(it['text'] for it in thieu)) if thieu else '')))

    def luu(): _ghi(D + 'ds.json', ds)
    for n, it in enumerate(hien, 1):
        ly_do = ', '.join((it.get('co') or []) + (it.get('loi') or []))
        nh = W.HTML('<div style="font-size:15px;line-height:1.5"><b>%d.</b> <span style="font-size:22px">%s</span> &nbsp; <i>%s</i><br>'
                    '<span style="color:#b45309">%s</span> <span style="color:#888">· máy nghe: %s · khớp %.2f</span></div>' % (
                        n, it['text'], it['py'], ly_do or '—', it.get('asr', ''), it.get('r', 0)))
        au = W.Output()
        with au: display(Audio(it['file']))
        tb = W.ToggleButtons(options=[('Chưa chọn', None), ('Đạt', 'dat'), ('Thu lại', 'thu_lai')], value=it.get('quyet'))
        gc = W.Text(value=it.get('ghi_chu', ''), placeholder='ghi chú cách đọc (khi Thu lại)', layout=W.Layout(width='320px'))

        def doi(ch, it=it): it['quyet'] = ch['new']; luu()

        def doi_gc(ch, it=it): it['ghi_chu'] = ch['new']; luu()
        tb.observe(doi, 'value'); gc.observe(doi_gc, 'value')
        display(W.VBox([nh, au, W.HBox([tb, gc])], layout=W.Layout(border='1px solid #ddd', padding='6px', margin='4px 0')))


def thu_lai_da_chon(cap, tu, den):
    D = thu_muc(cap, tu, den); ds = _doc(D + 'ds.json'); dot = 'cap-%s_%04d-%04d' % (cap, tu, den)
    # Mục có dãy số (一→幺) hoặc 广 thu từ trước khi có cách gửi mới mà máy cho qua: tự thu lại một lần
    DA_SUA = {'一三八〇', '一一〇', '一一九', '一二〇', '一一〇是什么电话？', '广'}
    for it in ds:
        if it.get('file') and not it.get('tts2') and it.get('text') not in DA_SUA and doc_tts(it['text']) != it['text'] and it.get('quyet') != 'thu_lai':
            it['quyet'] = 'thu_lai'; it['ghi_chu'] = it.get('ghi_chu') or ''
    can = [it for it in ds if it.get('quyet') == 'thu_lai']
    nh = _nhom(can, 8)
    print('Thu lại %d mục bác chọn, gộp %d lần gọi…' % (len(can), len(nh)))
    try:
        for its in nh:
            thu_lai_nhom(D, its, dot, ep=True)
            for it in its:
                it['quyet'] = None; it['lan_co'] = it.get('lan_co', 0) + 1
                print('   ', it['text'], '→ bản mới, khớp %.2f' % it.get('r', 0), '· ' + ', '.join(it['loi']) if it['loi'] else '')
            _ghi(D + 'ds.json', ds)
    except HetHanMuc as e:
        _ghi(D + 'ds.json', ds); bao_het_han_muc(e); return
    print('Xong. Chạy lại ô "Nghe" để nghe bản mới.')


def _git(*a, an=None):
    r = subprocess.run(['git', '-C', CFG['repo']] + list(a), capture_output=True, text=True)
    out = (r.stdout + r.stderr)
    if an: out = out.replace(an, '***')
    if r.returncode: raise RuntimeError('git %s: %s' % (a[0], out[-800:]))
    return out


def day_len(cap, tu, den, token, ten='Nhiên (Colab)', email='heran9895@gmail.com'):
    """Đẩy mục đã đạt (máy tự kiểm đạt + cô tick Đạt) lên main. Mục còn chờ nghe / thu lại để lần sau."""
    if str(cap).startswith('bai'):
        import thu_am_bai; return thu_am_bai.day_len_bai(sys.modules[__name__], cap, tu, den, token, ten, email)
    D = thu_muc(cap, tu, den); ds = _doc(D + 'ds.json')
    R = CFG['repo']
    di = [it for it in ds if it.get('file') and not it.get('da_day') and not can_nghe(it) and it.get('quyet') != 'thu_lai']
    cho = [it for it in ds if not it.get('da_day') and it not in di]
    if not di: print('Không có mục mới để đẩy. Còn chờ: %d' % len(cho)); return
    url = 'https://x-access-token:%s@github.com/%s.git' % (token, CFG['kho'])
    _git('config', 'user.name', ten); _git('config', 'user.email', email)
    for lan in range(3):
        _git('fetch', '--depth', '1', url, 'main', an=token); _git('reset', '--hard', 'FETCH_HEAD')
        them, o_cap, tep = {}, [], []
        for it in di:
            p = 'assets/am/%s/%s.mp3' % (it['thu'], it['ten'])
            shutil.copy(it['file'], R + p); tep.append(p)
            if it.get('o'): o_cap.append((it['o'], p))
            else: them[it['k']] = p
        if o_cap:
            f = tep_cap(cap); s = open(f).read(); d = json.loads(s)
            vt = {w['Mã']: w for w in d}
            for (ma, o), p in o_cap: vt[ma][o] = p
            out = json.dumps(d, ensure_ascii=False, indent=1) if s.startswith('[\n') else json.dumps(d, ensure_ascii=False, separators=(',', ':'))
            open(f, 'w').write(out + ('\n' if s.endswith('\n') else ''))
        sys.path.insert(0, R + 'tools'); import importlib, ban_do_am; importlib.reload(ban_do_am)
        n0 = len(json.load(open(R + 'assets/am/ban-do.json'))); ban_do_am.tao(them)
        n1 = len(json.load(open(R + 'assets/am/ban-do.json')))
        nhom = [tep[i:i + 1900] for i in range(0, len(tep), 1900)]
        for k, g in enumerate(nhom, 1):
            _git('add', *g)
            if k == len(nhom): _git('add', 'assets/am/ban-do.json', 'data/tu-vung/')
            _git('commit', '-q', '-m', 'Giọng Gemini kho HSK%s %d→%d: %d từ/cụm + %d câu%s' % (
                cap, tu, den, sum(it['thu'] == 'tu' for it in di), sum(it['thu'] == 'cau' for it in di),
                ' (phần %d/%d)' % (k, len(nhom)) if len(nhom) > 1 else ''))
        try:
            _git('push', url, 'HEAD:main', an=token); break
        except RuntimeError as e:
            print('Đẩy chưa được (có thể main vừa đổi), thử lại…', e)
    else:
        raise RuntimeError('Đẩy không được sau 3 lần.')
    for it in di: it['da_day'] = True
    _ghi(D + 'ds.json', ds)
    print('✓ Đã đẩy %d file (%d từ/cụm, %d câu); bảng tra %d → %d mục. Còn chờ nghe / thu lại: %d.' % (
        len(di), sum(it['thu'] == 'tu' for it in di), sum(it['thu'] == 'cau' for it in di), n0, n1, len(cho)))
    print('Web cập nhật sau vài phút: https://github.com/%s/actions' % CFG['kho'])


def tong_tien():
    f = CFG['work'] + 'nhat_ky.csv'
    if not os.path.exists(f): print('Chưa gọi Gemini lần nào.'); return
    nk = list(csv.DictReader(open(f)))
    g = sum(float(r['giay_am']) for r in nk); usd = g / 3600 * CFG['usd_gio']
    print('Tổng: %d lần gọi · %.1f giờ âm thanh · ước %.2f USD ≈ %s đ (giá %.2f USD/giờ)' % (
        len(nk), g / 3600, usd, format(round(usd * CFG['vnd_usd']), ',').replace(',', '.'), CFG['usd_gio']))
