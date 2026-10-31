# -*- coding: utf-8 -*-
"""Xuất dữ liệu Ôn tập tổng hợp Bài 1–5 cho web → data/bai/on-tap-1-5.json
  python3 tools/on_tap_1_5/xuat_json.py
Mỗi câu (item) dùng chung một khuôn cho assets/js/on-tap-tong-hop.js:
  ma, nhom, tenNhom, dang ('chon' | 'dungSai' | 'xep'), hoi, de, cau, sau, goiY, tu, loa, anDe,
  dap, nhieu, pa ('han' | 'py' | 'vi' | 'cau'), dung, sua, khoi, dapXep, cauDung, py, giai, but, hienSau
"""
import os, sys, json, random, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import von, kiem
from pypinyin import pinyin, Style

random.seed(20261030)
T = kiem.nap('on_tap')
D = kiem.nap('dich')
NET = kiem.NET
PHIEN_BAN = '2026-10-31a'
OUT = os.path.join(von.GOC, 'data', 'bai', 'on-tap-1-5.json')


def py1(c):
    return von.TU_DIEN.get(c) if c in von.TU_DIEN and ' ' not in von.TU_DIEN[c] else pinyin(c, style=Style.TONE)[0][0]


def pyc(s):
    return von.pinyin_cau(s)


def pyw(s):                                  # pinyin một từ / cụm (không phải câu): chữ đầu viết thường
    p = von.pinyin_cau(s)
    dau = von.tach(s)[0][0]
    return p if dau in von.TEN_RIENG or von.TU_DIEN.get(dau, 'a')[:1].isupper() else p[:1].lower() + p[1:]


def pa_kieu(ds):
    if all(re.fullmatch(r"[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜüê'·\- ]+", x) for x in ds): return 'py'
    if all(re.fullmatch(r'[㐀-鿿〇]+', x) for x in ds): return 'han'
    return 'vi'


# =========================== A. NGỮ ÂM ===========================
def ngu_am():
    ds = []
    for c, d, nh in T.THANH_MAU:
        ds.append(dict(ma=f'A1-{c}', nhom='A1', dang='chon', hoi='Nghe và chọn thanh mẫu của chữ vừa đọc', de=c, loa=c, anDe=True,
                       dap=d, nhieu=nh, pa='py', giai=f'{c} đọc là **{py1(c)}**: thanh mẫu **{d}**.'))
    for c, d, nh in T.VAN_MAU:
        ds.append(dict(ma=f'A2-{c}', nhom='A2', dang='chon', hoi='Nghe và chọn âm tiết đúng (không xét thanh điệu)', de=c, loa=c, anDe=True,
                       dap=d, nhieu=nh, pa='py', giai=f'{c} đọc là **{py1(c)}**.'))
    for c, nh in T.NGHE_CHU:
        ds.append(dict(ma=f'A3-{c}', nhom='A3', dang='chon', hoi='Nghe và chọn chữ vừa đọc', loa=c, dap=c, nhieu=nh, pa='han',
                       giai=' · '.join(f'{x} **{py1(x)}**' for x in [c] + nh)))
    for w, d, nh in T.PY_TU:
        it = dict(ma=f'A4-{w}', nhom='A4', dang='chon', hoi='Nghe và chọn phiên âm đúng của từ', de=w, loa=w, dap=d, nhieu=nh, pa='py',
                  giai=f'{w} **{d}**.')
        if '儿' in w and w != '女儿': it['loa'] = w.replace('儿', '')
        ds.append(it)
    for w, d, s in T.BIEN_DIEU:
        if '不' in w:
            g = ('不 kẹp giữa A 不 A đọc **nhẹ**: ' if w[0] == w[-1] else '不 đứng trước thanh 4 đọc **thanh 2** (bú); trước thanh 1, 2, 3 giữ **thanh 4** (bù): ') + f'{w} **{d}**.'
        else:
            g = (f'一 đứng sau 第, trong số đếm hoặc chỉ ngày tháng giữ **thanh 1**: {w} **{d}**.' if d.startswith(('dì', 'yī', 'shí'))
                 else f'一 trước thanh 4 (kể cả 个 đọc nhẹ) đọc **thanh 2**, trước thanh 1, 2, 3 đọc **thanh 4**: {w} **{d}**.')
        ds.append(dict(ma=f'A5-{w}', nhom='A5', dang='chon', hoi='Chọn cách ghi pinyin đúng', de=w, loa=w, dap=d, nhieu=[s], pa='py', giai=g))
    for k, q in enumerate(T.QUY_TAC_AM, 1):
        de = q[0]
        it = dict(ma=f'A6-{k:02d}', nhom='A6', dang='chon', hoi=de, dap=q[1], nhieu=q[2], pa=pa_kieu([q[1]] + q[2]), giai=q[3])
        m = re.search(r'của ([㐀-鿿]+)', de)
        if m: it['loa'] = m.group(1)
        ds.append(it)
    ten = {'A1': 'Thanh mẫu', 'A2': 'Vận mẫu', 'A3': 'Nghe phân biệt âm', 'A4': 'Thanh điệu của từ',
           'A5': 'Biến điệu 不 · 一', 'A6': 'Quy tắc đọc và viết pinyin'}
    return dict(soCau=20, tran=4, tenNhom=ten, cau=ds)


# =========================== B. CHỮ HÁN ===========================
NET_VI = {'点': 'Chấm', '点2': 'Chấm', '横': 'Ngang', '竖': 'Sổ', '撇': 'Phẩy', '捺': 'Mác', '提': 'Hất'}


def vi_tri_net(c, ten):
    key = {'Chấm': lambda n: n in ('点', '点2'), 'Ngang': lambda n: n == '横', 'Sổ': lambda n: n == '竖', 'Phẩy': lambda n: n == '撇',
           'Mác': lambda n: n == '捺', 'Hất': lambda n: n == '提', 'Gập': lambda n: '折' in n, 'Móc': lambda n: '钩' in n}[ten]
    return [i + 1 for i, n in enumerate(NET[c]['ten']) if key(n.split('|')[0]) or ('|' not in n and key(n))]


def chu_han():
    ds = []
    for c in T.DEM_NET:
        n = NET[c]['n']
        nh = [str(n + 1), str(n - 1) if n > 1 else str(n + 2)]
        ds.append(dict(ma=f'B1-{c}', nhom='B1', dang='chon', hoi='Chữ này có mấy nét?', de=c, dap=str(n), nhieu=nh, pa='vi',
                       giai=f'{c} có **{n} nét**. Bấm ô chữ để xem lại thứ tự viết.', but=c))
    for k, (ten, co, dap, nh) in enumerate(T.TIM_NET, 1):
        if co:
            vt = vi_tri_net(dap, ten)
            g = f'{dap} có nét **{ten.lower()}** (nét thứ {", ".join(map(str, vt))}); {", ".join(nh)} không có nét này.'
        else:
            g = f'{dap} **không** có nét {ten.lower()}; {", ".join(nh)} đều có.'
        ds.append(dict(ma=f'B2-{k:02d}', nhom='B2', dang='chon', hoi=f'Chữ nào {"có" if co else "KHÔNG có"} nét {ten}?', dap=dap, nhieu=nh,
                       pa='han', giai=g, but=dap))
    for c, t in T.NET_DAU:
        khac = [x for x in ['Chấm', 'Ngang', 'Sổ', 'Phẩy'] if x != t]
        random.shuffle(khac)
        ds.append(dict(ma=f'B2b-{c}', nhom='B2b', dang='chon', hoi='Nét viết đầu tiên của chữ này là nét gì?', de=c, dap=t, nhieu=khac[:2],
                       pa='vi', giai=f'Nét đầu tiên của {c} là nét **{t.lower()}**.', but=c))
    loai = list(T.LOAI_HINH)
    for L, v in T.LOAI_HINH.items():
        for c, g in v['chu'].items():
            ds.append(dict(ma=f'B3-{c}', nhom='B3', dang='chon', hoi='Chữ này thuộc loại chữ nào?', de=c, dap=L, nhieu=[x for x in loai if x != L],
                           pa='vi', giai=f'{c} là chữ **{L.lower()}**: {g}. {v["dn"]}'))
        for k in range(2):
            dung = random.choice([c for c in v['chu'] if c in kiem.CHO_PHEP_CHU])
            nh = [random.choice(list(T.LOAI_HINH[x]['chu'])) for x in loai if x != L]
            ds.append(dict(ma=f'B3n-{L}-{k + 1}', nhom='B3', dang='chon', hoi=f'Chữ nào là chữ {L.lower()}?', dap=dung, nhieu=nh, pa='han',
                           giai=f'{dung}: {v["chu"][dung]}. ' + ' · '.join(f'{x}: {next(l for l in loai if x in T.LOAI_HINH[l]["chu"]).lower()}' for x in nh)))
    for c, am, ng in T.BIEU_AM:
        ds.append(dict(ma=f'B3b-{c}', nhom='B3b', dang='chon', hoi='Chữ hình thanh này: bộ phận nào biểu âm?', de=c, dap=am, nhieu=[ng], pa='han',
                       giai=f'{c} = {ng} (biểu nghĩa) + **{am}** (biểu âm): {T.LOAI_HINH["Hình thanh"]["chu"][c]}.'))
    nhan = list(T.KET_CAU)
    bao = [x for x in nhan if x.startswith('Bao')]
    for K, cs in T.KET_CAU.items():
        for c in cs:
            pool = [x for x in (bao if K.startswith('Bao') else nhan) if x != K]
            if len(pool) < 3: pool += [x for x in nhan if x != K and x not in pool]
            random.shuffle(pool)
            ds.append(dict(ma=f'B4-{c}', nhom='B4', dang='chon', hoi='Chữ này có kết cấu gì?', de=c, dap=K, nhieu=pool[:3], pa='vi',
                           giai=f'{c}: kết cấu **{K.lower()}**.'))
        if len(cs) >= 2 or K.startswith('Bao'):
            dung = random.choice(cs)
            khac = [x for x in nhan if x != K and not (K.startswith('Bao') and x.startswith('Bao'))]
            nh = [random.choice(T.KET_CAU[x]) for x in random.sample(khac, 3)]
            ds.append(dict(ma=f'B4n-{K}', nhom='B4', dang='chon', hoi=f'Chữ nào có kết cấu {K.lower()}?', dap=dung, nhieu=nh, pa='han',
                           giai=f'{dung}: {K.lower()}. ' + ' · '.join(f'{x}: {next(k for k in nhan if x in T.KET_CAU[k]).lower()}' for x in nh)))
    quy = sorted(set(r for _, r in T.THUAN_BUT))
    for c, r in T.THUAN_BUT:
        nh = random.sample([x for x in quy if x != r], 2)
        ds.append(dict(ma=f'B5-{c}', nhom='B5', dang='chon', hoi='Chữ này viết theo quy tắc thuận bút nào?', de=c, dap=r, nhieu=nh, pa='vi',
                       giai=f'{c}: **{r}**. Bấm ô chữ để xem thứ tự viết.', but=c))
    ten_bo = {}
    for d in von.BAI.values():
        for b in d.get('boThu', []): ten_bo[b['boThu']] = b['ten']
    for bo, dap, nh in T.TIM_BO:
        ds.append(dict(ma=f'B6-{bo}', nhom='B6', dang='chon', hoi=f'Chữ nào có bộ {bo}?', dap=dap, nhieu=nh, pa='han',
                       giai=f'{dap} có bộ **{bo}**' + (f' ({ten_bo[bo]})' if bo in ten_bo else '') + '.'))
    ghep = []
    for d in von.BAI.values():
        for g in d.get('ghepChu', []):
            if g['chu'] not in [x['chu'] for x in ghep]: ghep.append(g)
    phan = sorted(set(p for g in ghep for p in g['phan']))
    for g in ghep:
        dung = ' + '.join(g['phan'])
        nh = set()
        while len(nh) < 2:
            p = list(g['phan']); i = random.randrange(len(p)); p[i] = random.choice([x for x in phan if x not in g['phan']])
            nh.add(' + '.join(p))
        ds.append(dict(ma=f'B7-{g["chu"]}', nhom='B7', dang='chon', hoi='Chữ này ghép từ những bộ phận nào?', de=g['chu'], dap=dung, nhieu=sorted(nh),
                       pa='han', giai=f'{g["chu"]} = **{dung}**.', but=g['chu']))
    ten = {'B1': 'Số nét', 'B2': 'Nét cơ bản', 'B2b': 'Nét viết đầu tiên', 'B3': 'Loại hình chữ Hán', 'B3b': 'Bộ phận biểu âm',
           'B4': 'Kết cấu chữ Hán', 'B5': 'Quy tắc thuận bút', 'B6': 'Bộ thủ', 'B7': 'Ghép bộ thủ'}
    return dict(soCau=20, tran=3, tenNhom=ten, cau=ds)


# =========================== C. TỪ VỰNG (phân loại) ===========================
def tu_vung():
    ds = []
    nhom = list(T.NHOM_TU)
    for N, ws in T.NHOM_TU.items():
        for w in ws:
            nh = random.sample([x for x in nhom if x != N], 2)
            ds.append(dict(ma=f'C2-{w}', nhom='C2', dang='chon', hoi='Từ này thuộc nhóm nào?', de=w, loa=w.replace('儿', '') if w == '面条儿' else w,
                           dap=N, nhieu=nh, pa='vi', giai=f'{w} **{von.TU_DIEN.get(w, "")}**: {N.lower()}.'))
    for k, (a, ws, g) in enumerate(T.KHAC_NHOM, 1):
        ds.append(dict(ma=f'C3-{k:02d}', nhom='C3', dang='chon', hoi='Từ nào khác nhóm với ba từ còn lại?', dap=a, nhieu=ws, pa='han', giai=g))
    return dict(soCau=12, tran=8, tenNhom={'C2': 'Xếp từ vào nhóm', 'C3': 'Tìm từ khác nhóm'}, cau=ds)


# =========================== D. NGỮ PHÁP ===========================
def ngu_phap():
    ds, ten = [], {}
    for n in (2, 3, 4, 5):
        d = von.BAI[n]
        for g in d.get('nguPhap', []): ten[g['id']] = f'{g["ten"]} (Bài {n})'
        for c in d['nguPhapLuyen']['cau']:
            if c.get('bo'): continue
            it = dict(ma=c['ma'], nhom=c['np'], nguon='kho', bai=n, giai=c.get('gt', ''))
            if c['dang'] == 'chon' and c.get('kieu') == 'py':
                it.update(dang='chon', hoi=f'Chọn phiên âm đúng của {c["tu"]} trong câu:', cau=c['cau'], tu=c['tu'], dap=c['dap'], nhieu=c['nhieu'],
                          pa='py', cauDung=c['cau'], py=c['py'])
            elif c['dang'] == 'chon':
                it.update(dang='chon', hoi='Chọn từ đúng điền vào chỗ trống:', cau=c['cau'], sau=c.get('sau', ''), goiY=c.get('goiY', ''),
                          dap=c['dap'], nhieu=c['nhieu'], pa='han', cauDung=c['cau'].replace('＿', c['dap']) + (' — ' + c['sau'] if c.get('sau') else ''), py=c['py'])
            elif c['dang'] == 'dungSai':
                it.update(dang='dungSai', hoi='Câu này đúng hay sai?', cau=c['cau'], dung=bool(c['dung']), sua=c.get('sua', ''),
                          cauDung=c['cau'] if c['dung'] else c.get('sua', ''), py=c['py'] if c['dung'] else c.get('pySua', ''))
            elif c['dang'] == 'hoi':
                it.update(dang='chon', hoi='Câu hỏi nào hợp với câu trả lời này?', cau=c['dap'], loa=c['dap'], dap=c['hoi'], nhieu=c['nhieu'], pa='cau',
                          cauDung=c['hoi'] + ' — ' + c['dap'], py=c.get('pyHoi', '') + ' — ' + c.get('pyDap', ''))
            else:
                it.update(dang='xep', hoi='Xếp các khối thành câu đúng, rồi thêm dấu câu vào đúng chỗ.', khoi=c['khoi'],
                          dapXep=[c['cau']] + c.get('khac', []), cauDung=c['cau'], py=c['py'])
            ds.append(it)
    for c in T.NGU_PHAP:
        it = dict(ma=c['ma'], nhom=c['np'], nguon='moi', giai=c['giai'])
        if c['dang'] == 'chon':
            cd = c['de'].replace('＿＿', c['dap'])
            it.update(dang='chon', hoi='Chọn từ đúng điền vào chỗ trống:', cau=c['de'].replace('＿＿', '＿'), dap=c['dap'], nhieu=c['nhieu'], pa='han',
                      cauDung=cd, py=pyc(cd))
        elif c['dang'] == 'xep':
            it.update(dang='xep', hoi='Xếp các khối thành câu đúng, rồi thêm dấu câu vào đúng chỗ.', khoi=c['khoi'], dapXep=c['dap'],
                      cauDung=c['dap'][0], py=pyc(c['dap'][0]))
        else:
            cd = c['cau'] if c['dung'] else c['sua']
            it.update(dang='dungSai', hoi='Câu này đúng hay sai?', cau=c['cau'], dung=c['dung'], sua=c.get('sua', ''), cauDung=cd, py=pyc(cd))
        ds.append(it)
    for n in (2, 3, 4, 5):
        for g in von.BAI[n].get('nguPhap', []): ten.setdefault(g['id'], g['ten'])
    return dict(soMoi=6, tenNhom=ten, cau=ds)


# =========================== E. ĐỌC HIỂU ===========================
def doc_hieu():
    bai = []
    for d in T.DOC_HIEU:
        van = []
        for s in d['van']:
            m = re.match(r'^([^：]{1,4})：(.*)$', s)
            if m and m.group(1) in von.TEN_RIENG: van.append(dict(ai=m.group(1), han=m.group(2), py=pyc(m.group(2))))
            else: van.append(dict(ai='', han=s, py=pyc(s)))
        cau = []
        for k, h in enumerate(d['hoi'], 1):
            if h['dang'] == 'chon':
                cau.append(dict(ma=f'{d["ma"]}-{k}', nhom=d['ma'], dang='chon', hoi='Đọc bài rồi trả lời câu hỏi:', cau=h['hoi'], dap=h['dap'],
                                nhieu=h['nhieu'], pa='han', cauDung=h['hoi'] + ' — ' + h['dap'], py=pyc(h['hoi']) + ' — ' + pyw(h['dap'])))
            else:
                cau.append(dict(ma=f'{d["ma"]}-{k}', nhom=d['ma'], dang='dungSai', hoi='Theo bài đọc, câu này đúng hay sai?', cau=h['hoi'],
                                dung=h['dung'], theoBai=True, cauDung=h['hoi'], py=pyc(h['hoi'])))
        bai.append(dict(ma=d['ma'], ten=d['ten'], kieu=d['kieu'], van=van, cau=cau))
    return dict(bai=bai)


# =========================== F. NGHE ===========================
def nghe():
    ds = []
    for s, d, nh in T.NGHE_SO:
        ds.append(dict(ma=f'F1-{s}', nhom='F1', dang='chon', hoi='Nghe và chọn số vừa đọc', de=s, loa=s, anDe=True, dap=d, nhieu=nh, pa='vi',
                       giai=f'{s} **{pyw(s)}** = {d}'))
    for s, d, nh in T.NGHE_NGAY:
        ds.append(dict(ma=f'F2-{s}', nhom='F2', dang='chon', hoi='Nghe và chọn ngày / thứ / năm vừa đọc', de=s, loa=s, anDe=True, dap=d, nhieu=nh,
                       pa='vi', giai=f'{s} **{pyw(s)}** = {d}'))
    for h in T.NGHE_HT:
        loi = []
        for s in h['luot']:
            ai, nd = s.split('：', 1)
            loi.append(dict(ai=ai, han=nd, py=pyc(nd)))
        ds.append(dict(ma=h['ma'], nhom='F3', dang='chon', hoi='Nghe đoạn hội thoại rồi trả lời câu hỏi:', cau=h['hoi'],
                       loa='。'.join(s for s in h['luot']), dap=h['dap'], nhieu=h['nhieu'], pa='han', hienSau=loi,
                       cauDung=h['hoi'] + ' — ' + h['dap'], py=pyc(h['hoi']) + ' — ' + pyw(h['dap'])))
    return dict(soCau=15, tran=5, tenNhom={'F1': 'Nghe số', 'F2': 'Nghe ngày tháng, thứ', 'F3': 'Nghe hội thoại ngắn'}, cau=ds)


# =========================== BÀI DỊCH ===========================
def muc_dich(ma, vi, zh, **them):
    import goi_y
    gy, moi = goi_y.goi_y(ma, zh)
    o = dict(vi=vi, zh=moi, py=pyc(moi[0]), **them)
    if gy: o.update(goiY=gy, zhCu=zh)                  # zhCu: đáp án trước khi thêm gợi ý (để chế độ giáo viên nhận ra câu cô chưa sửa)
    return o


def dich():
    cau = [dict(ma=c['ma'], **muc_dich(c['ma'], c['vi'], c['zh'], np=c.get('np', []), ghiChu=c.get('ghiChu', ''))) for c in D.CAU]
    ht = [dict(ma=h['ma'], ten=h['ten'], np=h['np'], luot=[dict(ai=l['ai'], **muc_dich(f"{h['ma']}-{i}", l['vi'], l['zh'])) for i, l in enumerate(h['luot'], 1)])
          for h in D.HOI_THOAI]
    dv = [dict(ma=d['ma'], ten=d['ten'], np=d['np'], cau=[muc_dich(f"{d['ma']}-{i}", l['vi'], l['zh']) for i, l in enumerate(d['cau'], 1)]) for d in D.DOAN_VAN]
    ten_viet = {'王老师': 'Cô Vương', '同学们': 'Các bạn học', '白家月': 'Bạch Gia Nguyệt', '李文': 'Lý Văn', '陈天中': 'Trần Thiên Trung',
                '王一飞': 'Vương Nhất Phi', '王一雪': 'Vương Nhất Tuyết', '杨同乐': 'Dương Đồng Lạc', '刘明': 'Lưu Minh', '安妮': 'An Ni'}
    return dict(phienBanDe='goc-' + PHIEN_BAN, soCauMoiLuot=20, tenViet=ten_viet, cau=cau, hoiThoai=ht, doanVan=dv)


if __name__ == '__main__':
    loi = kiem.kiem_trac_nghiem() + kiem.kiem_dich()[0]
    if loi:
        print('\n'.join(loi)); sys.exit('Còn lỗi, chưa xuất')
    data = dict(phienBan=PHIEN_BAN, phan={'ngu-am': ngu_am(), 'chu-han': chu_han(), 'tu-vung': tu_vung(), 'ngu-phap': ngu_phap(),
                                          'doc-hieu': doc_hieu(), 'nghe': nghe()}, dich=dich())
    # kiểm: mọi phương án khác nhau, đáp án không nằm trong nhiễu
    for k, p in data['phan'].items():
        for it in p.get('cau', []) + [c for b in p.get('bai', []) for c in b['cau']]:
            if it['dang'] == 'chon':
                pa = [it['dap']] + it['nhieu']
                assert len(set(pa)) == len(pa), (k, it['ma'], pa)
    json.dump(data, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    # Kho từ gộp 5 bài cho trang Từ vựng (luyen-tap.js): mỗi từ một lần (lấy lần xuất hiện đầu), câu luyện, chữ ghép, bộ thủ của cả 5 bài
    gop = dict(bai='1-5', ten='Ôn tập tổng hợp Bài 1–5', tu=[], boThu=[], ghepChu=[], thanhPhan={}, cauLuyen=[], tenRieng=[])
    da = set()
    for n in range(1, 6):
        b = von.BAI[n]
        for t in b['tu']:
            if t['Chữ Hán'] not in da: da.add(t['Chữ Hán']); gop['tu'].append(t)
        for x in b.get('boThu', []):
            if x['boThu'] not in [y['boThu'] for y in gop['boThu']]: gop['boThu'].append(x)
        for x in b.get('ghepChu', []):
            if x['chu'] not in [y['chu'] for y in gop['ghepChu']]: gop['ghepChu'].append(x)
        gop['thanhPhan'].update(b.get('thanhPhan', {}))
        gop['cauLuyen'] += b.get('cauLuyen', [])
        gop['tenRieng'] += [x for x in b.get('tenRieng', []) if x not in gop['tenRieng']]
    json.dump(gop, open(OUT.replace('.json', '-tu.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('kho từ gộp:', len(gop['tu']), 'từ ·', len(gop['ghepChu']), 'chữ ghép ·', len(gop['cauLuyen']), 'câu luyện')
    tong = {k: len(p.get('cau', [])) or sum(len(b['cau']) for b in p['bai']) for k, p in data['phan'].items()}
    print('đã xuất', OUT, os.path.getsize(OUT), 'byte ·', tong, '· dịch', len(data['dich']['cau']), 'câu')
