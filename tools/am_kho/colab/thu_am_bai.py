# -*- coding: utf-8 -*-
"""Thu giọng Gemini cho MỘT BÀI HSK 3.0 (Bài 6, 7…) — mở rộng của thu_am.py (cùng sổ Colab).

  CAP = 'bai6' hoặc 'bai7' (TU = 1, DEN = 9999).
Gom mọi thứ loa của bài đọc (quy chuẩn 14 §2): từ, cụm, câu ví dụ, kho câu luyện, hỏi – đáp, hội thoại, ví dụ ngữ pháp,
Luyện ngữ pháp, chữ lẻ (chữ trong từ của bài, ghép chữ, bộ thủ). Hội thoại hai giọng (§4b):
  A nam Achird · B nữ Sulafat; nhân vật bài khóa theo giọng riêng (李文 Achird, 白家月 Leda, 安妮 Gacrux, 刘明 Charon, 王一雪 Gacrux).
File giọng khác Sulafat không vào bảng tra chung mà ghi thẳng vào ô dữ liệu của bài (xem day_len_bai).
"""
import os, re, json, shutil, sys

# giọng từng lượt thoại của hội thoại bài khóa (bên soạn đọc từ slide; cô Nhiên xác nhận trong file duyệt)
VAI = {
    (6, 'Bài khóa · Hỏi số điện thoại'): ['Achird', 'Leda', 'Achird'],
    (6, 'Bài khóa · Ngày mai đi siêu thị'): ['Achird', 'Leda', 'Achird', 'Leda'],
    (7, 'Bài khóa · Hẹn gặp lúc 2 giờ chiều'): ['Leda', 'Gacrux', 'Leda', 'Gacrux'],
    (7, 'Bài khóa · Xem phim hay còn việc'): ['Achird', 'Leda', 'Achird', 'Leda'],
    (7, 'Bài khóa · Đang ở đâu thế'): ['Gacrux', 'Charon', 'Gacrux', 'Gacrux', 'Charon'],
}


DA_AM_THAT = set('行都分车看号差间还没长得着重背为乐种应数传量薄露调'
                 '好会假空教觉率便处调的了')   # chữ đa âm thật hay gặp (pypinyin liệt kê cả âm hiếm nên không dùng được)


def da_that(T, c):
    """Chữ đa âm thật (đọc khác nhau tùy từ): danh sách chọn tay, chữ khác một âm (biến thể thanh nhẹ, âm hiếm) thì không."""
    return c in DA_AM_THAT


def so_bai(cap): return int(re.sub(r'\D', '', str(cap)))


def gom_bai(T, cap):
    n = so_bai(cap); R = T.CFG['repo']
    d = json.load(open(R + 'data/bai/bai-%d.json' % n))
    B = json.load(open(R + 'assets/am/ban-do.json'))
    out, by, bo = [], {}, []

    def add(text, py, typ, src, giong='Sulafat', tg=None, alt_text=None):
        text = (text or '').strip()
        if not text or text == '-' or text.startswith('assets/'): return None
        k = T.chuan(text)
        if k in ('了', '么', '了。', '么。'): bo.append((src, text + ' (đứng riêng, để giọng máy)')); return None
        py = (py or '').replace('·', '').replace('∥', '').strip()
        rieng = giong != 'Sulafat' or (tg and any(t[0] == 'tu' for t in tg))   # giọng khác, hoặc chữ đa âm ghi thẳng ô
        if not rieng and k in B:
            if tg: bo.append(['san', [list(t) for t in tg], B[k]])
            return None
        id_ = k + '|' + giong + ('|' + T.khong_dau(py) if tg and tg[0][0] == 'tu' else '') if rieng else k
        if id_ in by:
            if tg: by[id_]['tg'] += [list(t) for t in tg]
            return by[id_]
        it = dict(id=id_, k=k, text=T.gon(text), py=py, typ=typ, thu=(T.GIONG_DIR.get(giong) or ('cau' if typ == 'cau' else 'tu')),
                  src=src, ten=T.md10(id_ if rieng else k), o=None, trang='cho', giong=giong, tg=[list(t) for t in (tg or [])])
        by[id_] = it; out.append(it); return it

    thu_tu = {}
    # ---------- 1. Từ, cụm, câu của thẻ từ vựng ----------
    for w in d['tu']:
        ma, han = w['Mã'], w['Chữ Hán']; py = w['Pinyin']
        if len(T.han(han)) == 1 and da_that(T, T.han(han)):
            add(han, py, 'chu', ma + ' từ', tg=[('tu', ma, 'Đọc từ')])
        else:
            add(han, py, 'tu', ma + ' từ')
        for l in (w.get('Cụm từ') or '').split('\n'):
            p = [x.strip() for x in l.split('|')]
            if p[0]: add(p[0], p[1] if len(p) > 1 else '', 'tu', ma + ' cụm')
        for i in (1, 2):
            c = w.get('Câu %d' % i); pc = w.get('Pinyin câu %d' % i) or ''
            if not c: continue
            if '\n' in c:   # hội thoại A / B trong câu ví dụ: mỗi lời một file, A nam, B nữ
                ls = c.split('\n'); ps = pc.split('\n')
                for j, (lh, lp) in enumerate(zip(ls, ps)):
                    vai = lh[:1]; lh2 = re.sub(r'^[AB][：:]', '', lh); lp2 = re.sub(r'^[AB]:\s*', '', lp)
                    gi = 'Achird' if vai == 'A' else 'Sulafat'
                    add(lh2, lp2, 'cau', ma + ' câu%d%s' % (i, vai), giong=gi, tg=[('tuP', ma, 'Đọc câu %d' % i, j)])
            else:
                add(c, pc, 'cau', ma + ' câu%d' % i)
    # ---------- 2. Kho câu luyện ----------
    for c in d.get('cauLuyen', []): add(c['han'], c.get('py'), 'cau', 'cauLuyen')
    # ---------- 3. Hỏi – đáp (hỏi nam Achird, đáp và câu nhiễu nữ Sulafat) ----------
    for i, h in enumerate(d.get('hoiDap', [])):
        add(h['hoi'][0], h['hoi'][1], 'cau', 'hoiDap%d hỏi' % i, giong='Achird', tg=[('hd', i, 'hoi')])
        add(h['dap'][0], h['dap'][1], 'cau', 'hoiDap%d đáp' % i)
        for a in h.get('nhieu', []): add(a[0], a[1], 'cau', 'hoiDap%d nhiễu' % i)
    # ---------- 4. Hội thoại ----------
    for i, h in enumerate(d.get('hoiThoai', [])):
        vai = VAI.get((n, h['ten']))
        for j, l in enumerate(h['luot']):
            gi = vai[j] if vai else ('Achird' if j % 2 == 0 else 'Sulafat')
            add(l['han'], l.get('py'), 'cau', 'hoiThoai%d.%d' % (i, j), giong=gi, tg=[('ht', i, j)] if gi != 'Sulafat' else None)
        for v in (h.get('nhieu') or {}).values():
            for x in v: add(x['han'], x.get('py'), 'cau', 'hoiThoai%d nhiễu' % i)
    # ---------- 5. Ngữ pháp: cụm, ví dụ ----------
    for g in d.get('nguPhap', []):
        for y in g.get('y', []):
            for c in y.get('cum', []): add(c[0], c[1], 'tu', 'NP ' + g['id'] + ' cụm')
            for v in y.get('viDu', []): add(v[0], v[1], 'cau', 'NP ' + g['id'] + ' ví dụ')
    # ---------- 6. Luyện ngữ pháp ----------
    npl = d.get('nguPhapLuyen', {})
    for c in npl.get('cau', []):
        dang = c.get('dang')
        if dang == 'chon' and c.get('kieu') != 'py' and c.get('dap') and '＿' in c.get('cau', ''): add(c['cau'].replace('＿', c['dap']), c.get('py'), 'cau', 'NPL chọn')
        elif dang == 'chon' and c.get('kieu') == 'py': add(c['cau'], c.get('py'), 'cau', 'NPL py')
        elif dang == 'dungSai':
            add(c['cau'], c.get('py'), 'cau', 'NPL đúng/sai')
            if c.get('sua'): add(c['sua'], c.get('pySua'), 'cau', 'NPL sửa')
        elif dang == 'hoi':
            add(c['dap'], c.get('pyDap'), 'cau', 'NPL đáp'); add(c['hoi'], c.get('pyHoi'), 'cau', 'NPL hỏi')
        elif dang == 'xep': add(c['cau'], c.get('py'), 'cau', 'NPL xếp')
    # ---------- 7. Chữ lẻ: chữ trong từ của bài, ghép chữ, bộ thủ ----------
    AM = {'超': 'chāo', '市': 'shì', '晚': 'wǎn', '边': 'biān', '免': 'miǎn', '走': 'zǒu'}
    chu = []
    for w in d['tu']:
        for c in T.han(w['Chữ Hán']):
            if c not in chu: chu.append(c)
    for g in d.get('ghepChu', []):
        if g['chu'] not in chu: chu.append(g['chu'])
    for b in d.get('boThu', []):
        da = b.get('docAm', '')
        if len(T.han(da)) == 1 and da not in chu: chu.append(da)
    for c in chu:
        if c in '了么' or not ('一' <= c <= '鿿'): continue
        card = [w for w in d['tu'] if w['Chữ Hán'] == c]
        py = ''
        bt = [b for b in d.get('boThu', []) if b.get('docAm') == c]
        if card: continue   # chữ đứng riêng đã thu ở thẻ
        if bt: py = bt[0]['pinyin'] if c != '头' else 'tóu'
        elif c in AM: py = AM[c]
        else: py = T.cac_am(c)[0]
        add(c, py, 'chu', 'chữ lẻ')
    # cờ "cô cần nghe" (giống gom): thanh điệu đa âm, 儿化, tên riêng
    for it in out:
        co = []
        dk = T.chu_doc_khac(it['py'] and it['text'])
        lech = it['typ'] == 'chu' or (it['py'] and '儿' not in it['text'] and T.khong_dau(it['py']) != ''.join(T.py_asr(it['text'])))
        if it['typ'] == 'chu' and da_that(T, it['text']): co.append('chữ lẻ đa âm ' + it['text'])
        elif dk: co.append('đa âm ' + ''.join(dk))
        if re.search(r'.儿', it['text']): co.append('儿化')
        if T.ten_rieng(it['py'], it['typ']): co.append('tên riêng')
        if it['giong'] not in ('Sulafat',) and it['typ'] != 'chu': pass
        it['co'] = co
        it['alt'] = T.khong_dau(it['py']) if lech else ''
    return out, bo


def day_len_bai(T, cap, tu, den, token, ten, email):
    """Đẩy mục đã đạt lên nhánh CFG['nhanh'] (Bài mới: nhánh riêng, chưa vào main)."""
    n = so_bai(cap); R = T.CFG['repo']; nhanh = T.CFG.get('nhanh') or 'main'
    D = T.thu_muc(cap, tu, den); ds = T._doc(D + 'ds.json'); bo = T._doc(D + 'bo.json', [])
    di = [it for it in ds if it.get('file') and not it.get('da_day') and not T.can_nghe(it) and it.get('quyet') != 'thu_lai']
    cho = [it for it in ds if not it.get('da_day') and it not in di]
    if not di: print('Không có mục mới để đẩy. Còn chờ: %d' % len(cho)); return
    url = 'https://x-access-token:%s@github.com/%s.git' % (token, T.CFG['kho'])
    T._git('config', 'user.name', ten); T._git('config', 'user.email', email)
    for lan in range(3):
        T._git('fetch', '--depth', '1', url, nhanh, an=token); T._git('reset', '--hard', 'FETCH_HEAD')
        them, tep, duong = {}, [], {}
        for it in ds:   # đường dẫn của mọi mục đã có file (cả mục đẩy từ lần trước)
            if it.get('file') and (it in di or it.get('da_day')): duong[it['id']] = 'assets/am/%s/%s.mp3' % (it['thu'], it['ten'])
        for it in di:
            p = duong[it['id']]; os.makedirs(os.path.dirname(R + p), exist_ok=True); shutil.copy(it['file'], R + p); tep.append(p)
            if it['giong'] == 'Sulafat' and not any(t[0] == 'tu' for t in it['tg']): them[it['k']] = p
        f = R + 'data/bai/bai-%d.json' % n; s = open(f, encoding='utf-8').read(); d = json.loads(s)
        vt = {w['Mã']: w for w in d['tu']}
        parts = {}
        for b in bo:
            if b and b[0] == 'san':
                for t in b[1]: parts.setdefault((t[1], t[2]), {})[t[3]] = b[2]
        for it in ds:
            p = duong.get(it['id'])
            if not p: continue
            for t in it['tg']:
                if t[0] == 'tu': vt[t[1]][t[2]] = p
                elif t[0] == 'tuP': parts.setdefault((t[1], t[2]), {})[t[3]] = p
                elif t[0] == 'hd':
                    h = d['hoiDap'][t[1]][t[2]]; h[3:] = [p]
                elif t[0] == 'ht': d['hoiThoai'][t[1]]['luot'][t[2]]['doc'] = p
        for (ma, o), pp in parts.items():
            soLoi = len([l for l in vt[ma]['Câu ' + o[-1]].split('\n')])
            if all(j in pp for j in range(soLoi)): vt[ma][o] = '|'.join(pp[j] for j in range(soLoi))
        open(f, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1) + ('\n' if s.endswith('\n') else ''))
        sys.path.insert(0, R + 'tools'); import importlib, ban_do_am; importlib.reload(ban_do_am)
        n0 = len(json.load(open(R + 'assets/am/ban-do.json'))); ban_do_am.tao(them)
        n1 = len(json.load(open(R + 'assets/am/ban-do.json')))
        nhom = [tep[i:i + 1900] for i in range(0, len(tep), 1900)]
        for k, g in enumerate(nhom, 1):
            T._git('add', *g)
            if k == len(nhom): T._git('add', 'assets/am/ban-do.json', 'data/bai/bai-%d.json' % n)
            T._git('commit', '-q', '-m', 'Giọng Gemini Bài %d: %d file' % (n, len(di)) + (' (phần %d/%d)' % (k, len(nhom)) if len(nhom) > 1 else ''))
        try:
            T._git('push', url, 'HEAD:' + nhanh, an=token); break
        except RuntimeError as e:
            print('Đẩy chưa được, thử lại…', e)
    else:
        raise RuntimeError('Đẩy không được sau 3 lần.')
    for it in di: it['da_day'] = True
    T._ghi(D + 'ds.json', ds)
    print('✓ Đã đẩy %d file lên nhánh %s; bảng tra %d → %d mục. Còn chờ nghe / thu lại: %d.' % (len(di), nhanh, n0, n1, len(cho)))
