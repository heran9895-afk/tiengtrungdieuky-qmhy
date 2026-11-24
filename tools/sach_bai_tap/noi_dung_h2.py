# -*- coding: utf-8 -*-
"""Nội dung "Luyện theo dạng sách bài tập" cho CHƯƠNG TRÌNH HSK 2.0 (giáo trình HSK 标准教程 1), Bài 3 trở đi.
Chỉ làm phần NGHE và phần ĐỌC của sách bài tập (bỏ phần viết chữ Hán, ngữ pháp). Câu soạn mới, không chép đề sách,
không dùng file nghe / ảnh của sách. Ảnh: kho ảnh Unsplash có sẵn ở assets/img/sach-bai-tap/.
Cách viết câu: các từ cách nhau bằng dấu cách (để tự sinh pinyin theo từ); dấu cách bị bỏ khỏi chữ Hán.
Vốn chữ: sổ tích lũy HSK 2.0 tới bài đó (kiểm bằng dung_h2.py kiem)."""
import os, sys, json, glob, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from noi_dung import (P_AT, P_N1, P_N3, P_N4, P_D1, P_D2, P_D3, L, C, T, N1, N3, N4, phan, VD, _ZH)

GOC = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# ------------------------------------------------------------------ pinyin tự sinh
_KHO = {}
for f in sorted(glob.glob(os.path.join(GOC, 'data/tu-vung/cap-*.json'))):
    for x in json.load(open(f, encoding='utf-8')):
        _KHO.setdefault(x['Chữ Hán'], x['Pinyin'])
OV = {'了': 'le', '的': 'de', '们': 'men', '吗': 'ma', '呢': 'ne', '个': 'ge', '什么': 'shénme', '谁': 'shéi', '哪': 'nǎ', '那': 'nà', '这': 'zhè',
      '两': 'liǎng', '几': 'jǐ', '不': 'bù', '一': 'yī', '好': 'hǎo', '会': 'huì', '都': 'dōu', '还': 'hái', '少': 'shǎo', '说': 'shuō', '读': 'dú',
      '美国': 'Měiguó', '越南': 'Yuènán', '英国': 'Yīngguó', '日本': 'Rìběn', '韩国': 'Hánguó', '李月': 'Lǐ Yuè', '大卫': 'Dàwèi', '小明': 'Xiǎomíng',
      '李老师': 'Lǐ lǎoshī', '多大': 'duō dà', '多少': 'duōshao', '哪儿': 'nǎr', '女儿': "nǚ'ér", '越南语': 'Yuènányǔ', '日语': 'Rìyǔ', '英语': 'Yīngyǔ',
      '中国': 'Zhōngguó', '汉语': 'Hànyǔ', '汉字': 'Hànzì', '中文': 'Zhōngwén', '韩语': 'Hányǔ', '学生': 'xuésheng', '没有': 'méiyǒu', '同学': 'tóngxué',
      '朋友': 'péngyou', '谢谢': 'xièxie', '没关系': 'méi guānxi', '不客气': 'bú kèqi', '对不起': 'duìbuqǐ', '客气': 'kèqi', '大学': 'dàxué',
      '大学生': 'dàxuésheng', '中学生': 'zhōngxuésheng', '小学生': 'xiǎoxuésheng', '中学': 'zhōngxué', '小学': 'xiǎoxué', '爸爸': 'bàba', '妈妈': 'māma',
      '哥哥': 'gēge', '姐姐': 'jiějie', '弟弟': 'dìdi', '妹妹': 'mèimei', '爷爷': 'yéye', '奶奶': 'nǎinai', '儿子': 'érzi', '名字': 'míngzi',
      '今天': 'jīntiān', '昨天': 'zuótiān', '明天': 'míngtiān', '年纪': 'niánjì', '好吃': 'hǎochī', '好喝': 'hǎohē', '汉语老师': 'Hànyǔ lǎoshī'}
PUN = '？！，。、：（）'
PUN_ASCII = {'？': '?', '！': '!', '，': ',', '。': '.', '、': ',', '：': ':'}
TONE = {'āēīōūǖ': 1, 'áéíóúǘ': 2, 'ǎěǐǒǔǚ': 3, 'àèìòùǜ': 4}


def _tone(py):
    for ch in py:
        for k, v in TONE.items():
            if ch in k: return v
    return 5


def _core_py(core):
    if core in OV: return OV[core]
    k = _KHO.get(core)
    if k: return k.split('/')[0].replace('·', '').replace('’', "'")
    out, i = '', 0
    while i < len(core):
        for j in range(len(core), i, -1):
            seg = core[i:j]
            if seg in OV: out += OV[seg]; i = j; break
            if seg in _KHO: out += _KHO[seg].split('/')[0].replace('·', '').replace('’', "'"); i = j; break
        else:
            from pypinyin import lazy_pinyin, Style
            out += lazy_pinyin(core[i], style=Style.TONE)[0]; i += 1
    return out


def PY(s, cap=True):
    s = re.sub(r'([，、：？！。])', r'\1 ', s).replace('（　）', ' （　） ')
    toks = []
    for w in s.split(' '):
        if not w: continue
        pre = ''; suf = ''
        while w and w[0] in '（': pre += w[0]; w = w[1:]
        while w and w[-1] in PUN: suf = w[-1] + suf; w = w[:-1]
        toks.append([pre, w, suf])
    res = []
    for i, (pre, w, suf) in enumerate(toks):
        sf = ''.join(PUN_ASCII.get(c, '') for c in suf if c != '）')
        if '　' in w:                                       # ô trống
            res.append('(　)' + sf); continue
        if not w:                                           # chỉ có dấu câu: dính vào từ trước
            if res: res[-1] += sf
            continue
        if w[0] == '不' and len(w) > 1 and w not in OV:
            rest = _core_py(w[1:]); py = ('bú' if _tone(rest) == 4 else 'bù') + rest
        else:
            py = _core_py(w)
        if w in ('不', '一') and i + 1 < len(toks):
            nx = toks[i + 1][1]
            tn = _tone(_core_py(nx)) if nx and '　' not in nx else 4
            if w == '不' and tn == 4: py = 'bú'
            if w == '一':
                py = 'yí' if (tn == 4 or nx == '个') else 'yì'
                if nx in ('月', '号', '年'): py = 'yī'
        res.append(py + sf)
    out = ' '.join(res).strip()
    if cap: out = re.sub(r'([?!.]) ([a-zǎ-ǜ])', lambda m: m.group(1) + ' ' + m.group(2).upper(), out)
    return out[0].upper() + out[1:] if cap and out and out[0].isalpha() else out


def han(s): return s.replace(' ', '')
def HP(s, cap=True): return han(s), PY(s, cap)

# ------------------------------------------------------------------ dựng câu
def n1(ma, s, opts, dap, vi):
    h, p = HP(s)
    return N1(ma, h, p, [T(chr(65 + i), n, a) for i, (n, a) in enumerate(opts)], dap, vi)


def n3(ma, a, b, dap, vi):
    return N3(ma, HP(a), HP(b), dap, vi)


def n4(ma, cau, hoi, pas, dap, vi):
    return N4(ma, HP(cau), HP(hoi), [L(chr(65 + i), *HP(x, False)) for i, x in enumerate(pas)], dap, vi)


def d1(ma, s, dap): h, p = HP(s); return C(ma, h, p, dap, '')
def d2(ma, s, dap): h, p = HP(s); return C(ma, h, p, dap, '')
def d3(ma, s, dap): h, p = HP(s); return C(ma, h, p, dap, '')
def lc(items, cap=False): return [L(chr(65 + i), *HP(x, cap)) for i, x in enumerate(items)]
def anh(items): return [T(chr(65 + i), n, a) for i, (n, a) in enumerate(items)]
def hang(ma, tuples, f): return [f('%s-%d' % (ma, i + 1), *t) for i, t in enumerate(tuples)]


def D3x(ten_them, cau, tu):
    p = dict(P_D3); p['ten'] = P_D3['ten'] + ten_them
    return phan(p, 'doc-dien', cau, luaChon=lc(tu))


# ------------------------------------------------------------------ ảnh
TG = ('b4-thay-giao', 'Một thầy giáo viết bảng'); TCH = ('b3-truongthanh', 'Vạn Lý Trường Thành'); BT = ('b2-bat-tay', 'Hai người bắt tay')
GT = ('b2-gioithieu', 'Các bạn học sinh đứng cạnh nhau'); BA = ('b3-bangai', 'Ba người đứng cạnh nhau'); TB = ('b2-tambiet', 'Một bạn nữ vẫy tay chào')
DT = ('b3-dienthoai', 'Người đàn ông vừa nghe điện thoại vừa ghi chép'); BC = ('b3-bang-chu', 'Bảng đen viết chữ Hán'); CH = ('b1-chao', 'Hai bạn vẫy tay chào qua máy tính bảng')

BAI = []

# ================================================================== BÀI 3
BAI.append({'bai': 3, 'ten': '你叫什么名字？', 'tenViet': 'Bạn tên là gì?', 'phan': [
 phan(P_AT, 'at', [('jiao4', ['qiao4', 'xiao4', 'jiao3']), ('ming2', ['ning2', 'ming4', 'mian2']), ('zi4', ['zhi4', 'ci4', 'zi3']), ('shi4', ['si4', 'xi4', 'shi2']),
                   ('sheng1', ['shen1', 'cheng1', 'sheng2']), ('ren2', ['ren4', 'len2', 'reng2']), ('zhong1', ['zong1', 'zhong4', 'chong1']), ('guo2', ['gou2', 'guo3', 'kuo2']),
                   ('mei3', ['mai3', 'mei4', 'nei3']), ('yue4', ['yue1', 'ye4', 'yuan4'])]),
 phan(P_N1, 'nghe', [
   n1('n1-1', '中国', [DT, TCH, TG], 'B', 'Trung Quốc'),
   n1('n1-2', '老师', [GT, TG, TCH], 'B', 'giáo viên'),
   n1('n1-3', '学生们', [BA, GT, TG], 'B', 'các học sinh'),
   n1('n1-4', '三 个 人', [BT, BA, ('b4-be-gai', 'Một bé gái đang cười')], 'B', 'ba người')]),
 phan(P_N3, 'tranh', [
   n3('n3-1', '他 是 老师 吗？', '是，他 是 老师。', 'A', 'A: Anh ấy là giáo viên à? — B: Vâng, anh ấy là giáo viên.'),
   n3('n3-2', '李月，再见！', '再见！', 'B', 'A: Lý Nguyệt, tạm biệt! — B: Tạm biệt!'),
   n3('n3-3', '你们 是 同学 吗？', '是，我们 是 同学。', 'C', 'A: Các bạn là bạn học à? — B: Vâng, chúng mình là bạn học.')],
   anh=anh([TG, TB, GT])),
 phan(P_N4, 'nghe', [
   n4('n4-1', '我 叫 李月，我 是 越南 人。', '李月 是 中国 人 吗？', ['是', '不 是', '不 客气'], 'B', 'Tôi tên Lý Nguyệt, tôi là người Việt Nam. — Hỏi: Lý Nguyệt là người Trung Quốc à? — Không phải'),
   n4('n4-2', '我 叫 大卫，他 叫 小明。', '他 叫 什么 名字？', ['大卫', '小明', '李月'], 'B', 'Tôi tên Đại Vệ, anh ấy tên Tiểu Minh. — Hỏi: Anh ấy tên gì? — Tiểu Minh'),
   n4('n4-3', '我 是 美国 人，他 是 英国 人。', '他 是 美国 人 吗？', ['是', '不 是', '没关系'], 'B', 'Tôi là người Mỹ, anh ấy là người Anh. — Hỏi: Anh ấy là người Mỹ à? — Không phải'),
   n4('n4-4', '我们 三 个 人，我 是 老师，他们 是 学生。', '他们 是 什么 人？', ['老师', '学生', '中国 人'], 'B', 'Chúng tôi ba người, tôi là giáo viên, họ là học sinh. — Hỏi: Họ là ai? — Học sinh')]),
 phan(P_D1, 'doc-tranh', hang('d1', [('他 是 老师。', 'A'), ('李月，再见！', 'B'), ('中国 很 大。', 'C'), ('我们 三 个 人。', 'D'), ('你 好，我 叫 李月。', 'E')], d1),
   anh=anh([TG, TB, TCH, BA, BT, DT])),
 phan(P_D2, 'doc-ghep', hang('d2', [('你 叫 什么 名字？', 'A'), ('你 是 老师 吗？', 'B'), ('你 是 中国 人 吗？', 'C'), ('你们 是 学生 吗？', 'D'), ('谢谢！', 'E')], d2),
   luaChon=lc(cap=True, items=['我 叫 李月。', '是，我 是 老师。', '不 是，我 是 越南 人。', '是，我们 是 学生。', '不 客气。', '再见！'])),
 D3x(' (1)', hang('d3a', [('你 是 老师（　）？', 'A'), ('你 叫（　）名字？', 'B'), ('我 是 中（　）人。', 'C'), ('我（　）学生，不 是 老师。', 'D')], d3), ['吗', '什么', '国', '是', '名字']),
 D3x(' (2)', hang('d3b', [('他 是 学生，我（　）是 学生，我们 是 同学。', 'A'), ('我（　）是 老师，我 是 学生。', 'B'), ('你（　）好！', 'C'), ('我们 三（　）人。', 'D')], d3), ['也', '不', '们', '个', '老师']),
]})

# ================================================================== BÀI 4
BAI.append({'bai': 4, 'ten': '她是我的汉语老师', 'tenViet': 'Cô ấy là giáo viên tiếng Trung của tôi', 'phan': [
 phan(P_AT, 'at', [('ta1', ['da1', 'ka1', 'ta2']), ('shei2', ['shui2', 'zhei2', 'shei3']), ('na3', ['la3', 'nu3', 'na4']), ('han4', ['han2', 'hang4', 'huan4']),
                   ('yu3', ['yu4', 'yi3', 'qu3']), ('peng2', ['beng2', 'pen2', 'feng2']), ('you3', ['yu3', 'you4', 'xiu3']), ('xue2', ['xie2', 'xue4', 'que2']),
                   ('tong2', ['dong2', 'tang2', 'tong3']), ('wen2', ['wen4', 'weng2', 'men2'])]),
 phan(P_N1, 'nghe', [
   n1('n1-1', '学 汉语', [BC, DT, TCH], 'A', 'học tiếng Trung'),
   n1('n1-2', '好 朋友', [CH, TG, TCH], 'A', 'bạn tốt'),
   n1('n1-3', '我 的 老师', [TCH, DT, TG], 'C', 'giáo viên của tôi'),
   n1('n1-4', '同学们', [TCH, GT, DT], 'B', 'các bạn học')]),
 phan(P_N3, 'tranh', [
   n3('n3-1', '你 是 哪 国 人？', '我 是 中国 人。', 'A', 'A: Bạn là người nước nào? — B: Tôi là người Trung Quốc.'),
   n3('n3-2', '她 是 谁？', '她 是 我 的 朋友。', 'B', 'A: Cô ấy là ai? — B: Cô ấy là bạn của tôi.'),
   n3('n3-3', '你 学 汉语 吗？', '学，我 学 汉语。', 'C', 'A: Bạn có học tiếng Trung không? — B: Có, tôi học tiếng Trung.'),
   n3('n3-4', '他 是 谁？', '他 是 我 的 老师。', 'D', 'A: Anh ấy là ai? — B: Anh ấy là giáo viên của tôi.')],
   anh=anh([TCH, CH, BC, TG])),
 phan(P_N4, 'nghe', [
   n4('n4-1', '她 是 我 的 汉语 老师，她 是 中国 人。', '她 是 哪 国 人？', ['中国 人', '美国 人', '越南 人'], 'A', 'Cô ấy là giáo viên tiếng Trung của tôi, cô ấy là người Trung Quốc. — Hỏi: Cô ấy là người nước nào? — Trung Quốc'),
   n4('n4-2', '他 是 我 的 同学，他 叫 大卫，是 美国 人。', '他 叫 什么 名字？', ['大卫', '小明', '李月'], 'A', 'Anh ấy là bạn học của tôi, tên Đại Vệ, là người Mỹ. — Hỏi: Anh ấy tên gì? — Đại Vệ'),
   n4('n4-3', '我 学 汉语，也 学 英语，不 学 日语。', '他 不 学 什么？', ['汉语', '日语', '英语'], 'B', 'Tôi học tiếng Trung, cũng học tiếng Anh, không học tiếng Nhật. — Hỏi: Anh ấy không học gì? — Tiếng Nhật'),
   n4('n4-4', '李月 是 我 的 朋友，大卫 是 我 的 同学。', '谁 是 他 的 朋友？', ['李月', '大卫', '小明'], 'A', 'Lý Nguyệt là bạn của tôi, Đại Vệ là bạn học của tôi. — Hỏi: Ai là bạn của anh ấy? — Lý Nguyệt')]),
 phan(P_D1, 'doc-tranh', hang('d1', [('他 是 我 的 老师。', 'A'), ('我 学 汉语。', 'B'), ('我们 是 好 朋友。', 'C'), ('她们 是 我 的 同学。', 'D'), ('中国 很 大。', 'E')], d1),
   anh=anh([TG, BC, CH, GT, TCH, DT])),
 phan(P_D2, 'doc-ghep', hang('d2', [('你 是 哪 国 人？', 'A'), ('他 是 谁？', 'B'), ('你 学 什么？', 'C'), ('你 的 老师 是 中国 人 吗？', 'D'), ('我 是 学生，你 呢？', 'E')], d2),
   luaChon=lc(cap=True, items=['我 是 越南 人。', '他 是 我 的 同学。', '我 学 汉语。', '是，她 是 中国 人。', '我 也 是 学生。', '不 客气。'])),
 D3x(' (1)', hang('d3a', [('他 是（　）？他 是 我 同学。', 'A'), ('你 是（　）国 人？', 'B'), ('她 是 我（　）汉语 老师。', 'C'), ('我 学 汉语，你（　）？', 'D')], d3), ['谁', '哪', '的', '呢', '吗']),
 D3x(' (2)', hang('d3b', [('我 是 学生，我（　）汉语。', 'A'), ('他 是 我 的 好（　）。', 'B'), ('我 学 汉语，他（　）学 汉语。', 'C'), ('我 是 越南 人，他 是 中（　）人。', 'D')], d3), ['学', '朋友', '也', '国', '汉语']),
]})

# ================================================================== BÀI 5
BO = ('b4-ba-nguoi', 'Bố, mẹ và con gái ngồi ăn cùng nhau'); OB = ('b4-ong-ba', 'Hai ông bà'); SN = ('b5-sinh-nhat', 'Bánh sinh nhật có nến số 20')
BG = ('b4-be-gai', 'Một bé gái đang cười'); BTR = ('b4-be-trai', 'Một bé trai đang cười'); VC = ('b4-vo-chong', 'Một đôi nam nữ ôm nhau'); EB = ('b4-em-be', 'Một em bé')
BAI.append({'bai': 5, 'ten': '她女儿今年二十岁', 'tenViet': 'Con gái cô ấy năm nay 20 tuổi', 'phan': [
 phan(P_AT, 'at', [('jia1', ['jie1', 'xia1', 'jia2']), ('you3', ['yu3', 'you4', 'xiu3']), ('kou3', ['gou3', 'kou4', 'ke3']), ('ji3', ['qi3', 'ji4', 'xi3']),
                   ('sui4', ['shui4', 'cui4', 'sui2']), ('jin1', ['qin1', 'jin3', 'jing1']), ('nian2', ['lian2', 'nian4', 'niang2']), ('duo1', ['tuo1', 'duo3', 'dou1']),
                   ('ge1', ['ke1', 'ge4', 'he1']), ('mei4', ['mai4', 'mei3', 'nei4'])]),
 phan(P_N1, 'nghe', [
   n1('n1-1', '爷爷 奶奶', [OB, BO, VC], 'A', 'ông bà nội'),
   n1('n1-2', '三 口 人', [BO, OB, EB], 'A', 'ba người (trong gia đình)'),
   n1('n1-3', '二十 岁', [SN, BO, OB], 'A', '20 tuổi'),
   n1('n1-4', '我 女儿', [BTR, BG, OB], 'B', 'con gái tôi')]),
 phan(P_N3, 'tranh', [
   n3('n3-1', '你 家 有 几 口 人？', '我 家 有 三 口 人。', 'A', 'A: Nhà bạn có mấy người? — B: Nhà tôi có ba người.'),
   n3('n3-2', '他们 是 你 的 爷爷 奶奶 吗？', '是，他们 是 我 的 爷爷 奶奶。', 'B', 'A: Họ là ông bà nội của bạn à? — B: Vâng, họ là ông bà nội của tôi.'),
   n3('n3-3', '你 今年 多 大？', '我 今年 二十 岁。', 'C', 'A: Năm nay bạn bao nhiêu tuổi? — B: Năm nay tôi 20 tuổi.'),
   n3('n3-4', '你 有 男朋友 吗？', '有，这 是 我 男朋友。', 'D', 'A: Bạn có bạn trai chưa? — B: Có, đây là bạn trai của tôi.')],
   anh=anh([BO, OB, SN, VC])),
 phan(P_N4, 'nghe', [
   n4('n4-1', '我 家 有 四 口 人：爸爸、妈妈、姐姐，还 有 我。', '他 家 有 几 口 人？', ['三 口 人', '四 口 人', '五 口 人'], 'B', 'Nhà tôi có bốn người: bố, mẹ, chị gái và tôi. — Hỏi: Nhà anh ấy có mấy người? — Bốn người'),
   n4('n4-2', '我 哥哥 今年 二十 岁，我 妹妹 八 岁。', '他 妹妹 今年 几 岁？', ['二十 岁', '八 岁', '十八 岁'], 'B', 'Anh trai tôi năm nay 20 tuổi, em gái tôi 8 tuổi. — Hỏi: Em gái anh ấy năm nay mấy tuổi? — 8 tuổi'),
   n4('n4-3', '我 有 两 个 弟弟，没有 妹妹。', '他 有 几 个 弟弟？', ['一 个', '两 个', '三 个'], 'B', 'Tôi có hai em trai, không có em gái. — Hỏi: Anh ấy có mấy em trai? — Hai'),
   n4('n4-4', '今年 我 二十 岁，明年 我 二十一 岁。', '他 明年 多 大？', ['二十 岁', '二十一 岁', '十一 岁'], 'B', 'Năm nay tôi 20 tuổi, sang năm tôi 21 tuổi. — Hỏi: Sang năm anh ấy bao nhiêu tuổi? — 21 tuổi')]),
 phan(P_D1, 'doc-tranh', hang('d1', [('我 家 有 三 口 人。', 'A'), ('这 是 我 爷爷 奶奶。', 'B'), ('我 今年 二十 岁。', 'C'), ('我 有 一 个 女儿。', 'D'), ('这 是 我 男朋友。', 'E')], d1),
   anh=anh([BO, OB, SN, BG, VC, BTR])),
 phan(P_D2, 'doc-ghep', hang('d2', [('你 家 有 几 口 人？', 'A'), ('你 今年 多 大？', 'B'), ('你 有 姐姐 吗？', 'C'), ('你 女儿 几 岁 了？', 'D'), ('你们 班 有 多少 个 学生？', 'E')], d2),
   luaChon=lc(cap=True, items=['我 家 有 五 口 人。', '我 今年 二十 岁。', '没有，我 有 一 个 妹妹。', '她 两 岁 了。', '我们 班 有 二十 个 学生。', '没关系。'])),
 D3x(' (1)', hang('d3a', [('你 家（　）几 口 人？', 'A'), ('你 有（　）个 哥哥？', 'B'), ('你 今年（　）大？', 'C'), ('我 今年 二十（　）。', 'D')], d3), ['有', '几', '多', '岁', '没有']),
 D3x(' (2)', hang('d3b', [('我 家 有 三（　）人。', 'A'), ('我 有（　）个 哥哥。', 'B'), ('今（　）我 二十 岁。', 'C'), ('我们（　）有 二十 个 学生。', 'D')], d3), ['口', '两', '年', '班', '少']),
]})

# ================================================================== BÀI 6
BAI.append({'bai': 6, 'ten': '我会说汉语', 'tenViet': 'Tôi biết nói tiếng Trung', 'phan': [
 phan(P_AT, 'at', [('hui4', ['hei4', 'fui4', 'hui3']), ('shuo1', ['suo1', 'zhuo1', 'shuo2']), ('cai4', ['cai3', 'chai4', 'sai4']), ('chi1', ['qi1', 'zhi1', 'chi2']),
                   ('zuo4', ['zou4', 'cuo4', 'zuo3']), ('xie3', ['xue3', 'xie4', 'jie3']), ('zen3', ['zeng3', 'zhen3', 'cen3']), ('du2', ['tu2', 'du3', 'dou2']),
                   ('he1', ['hei1', 'ke1', 'he2']), ('zi4', ['zhi4', 'ci4', 'zi3'])]),
 phan(P_N1, 'nghe', [
   n1('n1-1', '写 汉字', [BC, ('b5-nau-an', 'Người phụ nữ đang nấu ăn'), ('b6-tra-sua', 'Ly trà sữa')], 'A', 'viết chữ Hán'),
   n1('n1-2', '做 菜', [('b5-nau-an', 'Người phụ nữ đang nấu ăn'), BC, BO], 'A', 'nấu món ăn'),
   n1('n1-3', '吃 菜', [BC, BO, ('b5-nau-an', 'Người phụ nữ đang nấu ăn')], 'B', 'ăn cơm (ăn món ăn)'),
   n1('n1-4', '好喝', [('b5-banh-bao', 'Bánh bao'), ('b5-nau-an', 'Người phụ nữ đang nấu ăn'), ('b6-tra-sua', 'Ly trà sữa')], 'C', 'ngon (đồ uống)')]),
 phan(P_N3, 'tranh', [
   n3('n3-1', '你 会 写 汉字 吗？', '会，我 会 写。', 'A', 'A: Bạn biết viết chữ Hán không? — B: Biết, tôi biết viết.'),
   n3('n3-2', '你 妈妈 会 做 菜 吗？', '会，她 做 的 菜 很 好吃。', 'B', 'A: Mẹ bạn có biết nấu ăn không? — B: Biết, món mẹ nấu rất ngon.'),
   n3('n3-3', '这个 好喝 吗？', '很 好喝！', 'C', 'A: Cái này có ngon không (đồ uống)? — B: Ngon lắm!'),
   n3('n3-4', '这个 好吃 吗？', '很 好吃！', 'D', 'A: Cái này có ngon không (đồ ăn)? — B: Ngon lắm!')],
   anh=anh([BC, ('b5-nau-an', 'Người phụ nữ đang nấu ăn'), ('b6-tra-sua', 'Ly trà sữa'), ('b5-banh-bao', 'Bánh bao')])),
 phan(P_N4, 'nghe', [
   n4('n4-1', '我 妈妈 会 做 中国 菜，菜 很 好吃。', '他 妈妈 会 做 什么 菜？', ['中国 菜', '越南 菜', '韩国 菜'], 'A', 'Mẹ tôi biết nấu món Trung Quốc, món rất ngon. — Hỏi: Mẹ anh ấy biết nấu món gì? — Món Trung Quốc'),
   n4('n4-2', '我 会 说 汉语，不 会 说 日语。', '他 不 会 说 什么？', ['汉语', '日语', '好吃'], 'B', 'Tôi biết nói tiếng Trung, không biết nói tiếng Nhật. — Hỏi: Anh ấy không biết nói gì? — Tiếng Nhật'),
   n4('n4-3', '这个 字 我 会 读，不 会 写。', '他 不 会 什么？', ['读', '写', '说'], 'B', 'Chữ này tôi biết đọc, không biết viết. — Hỏi: Anh ấy không biết gì? — Viết'),
   n4('n4-4', '这个 菜 很 好吃，那个 菜 不 好吃。', '哪个 菜 好吃？', ['这个', '那个', '两 个'], 'A', 'Món này rất ngon, món kia không ngon. — Hỏi: Món nào ngon? — Món này')]),
 phan(P_D1, 'doc-tranh', hang('d1', [('我 会 写 汉字。', 'A'), ('妈妈 会 做 菜。', 'B'), ('这个 很 好吃。', 'C'), ('这个 很 好喝。', 'D'), ('一 家 人 吃 菜。', 'E')], d1),
   anh=anh([BC, ('b5-nau-an', 'Người phụ nữ đang nấu ăn'), ('b5-banh-bao', 'Bánh bao'), ('b6-tra-sua', 'Ly trà sữa'), BO, DT])),
 phan(P_D2, 'doc-ghep', hang('d2', [('你 会 说 汉语 吗？', 'A'), ('你 会 写 汉字 吗？', 'B'), ('这个 菜 好吃 吗？', 'C'), ('你 吃 什么？', 'D'), ('你 会 做 菜 吗？', 'E')], d2),
   luaChon=lc(cap=True, items=['会，我 会 说 汉语。', '我 不 会 写 汉字。', '很 好吃！', '我 吃 中国 菜。', '会，我 会 做 越南 菜。', '没关系。'])),
 D3x(' (1)', hang('d3a', [('他（　）说 汉语。', 'A'), ('这个 字（　）读？', 'B'), ('这个 菜（　）好吃。', 'C'), ('我 不 会（　）汉字。', 'D')], d3), ['会', '怎么', '很', '写', '喝']),
 D3x(' (2)', hang('d3b', [('我 会（　）汉语。', 'A'), ('这个 字 我 会（　），不 会 写。', 'B'), ('我（　）中国 菜，很 好吃。', 'C'), ('这个（　）很 好吃。', 'D')], d3), ['说', '读', '吃', '菜', '喝']),
]})

# ================================================================== BÀI 7
TR = ('b7-truong', 'Trường học'); SA = ('b7-sach', 'Những cuốn sách mở'); DS = ('vd-doc-sach', 'Một cô gái đang đọc sách')
BAI.append({'bai': 7, 'ten': '今天几号', 'tenViet': 'Hôm nay ngày mấy', 'phan': [
 phan(P_AT, 'at', [('qing3', ['qin3', 'qiang3', 'jing3']), ('wen4', ['wen2', 'wan4', 'weng4']), ('hao4', ['hao3', 'gao4', 'hou4']), ('yue4', ['yue1', 'ye4', 'yuan4']),
                   ('xing1', ['xin1', 'xiang1', 'qing1']), ('qi1', ['qi2', 'ji1', 'xi1']), ('qu4', ['qu3', 'xu4', 'ju4']), ('kan4', ['kan3', 'gan4', 'han4']),
                   ('shu1', ['su1', 'zhu1', 'shu2']), ('xiao4', ['xiao3', 'jiao4', 'qiao4'])]),
 phan(P_N1, 'nghe', [
   n1('n1-1', '去 学校', [TR, SA, TG], 'A', 'đi đến trường'),
   n1('n1-2', '看 书', [DS, TR, TCH], 'A', 'đọc sách'),
   n1('n1-3', '书', [SA, TR, ('b5-nau-an', 'Người phụ nữ đang nấu ăn')], 'A', 'sách'),
   n1('n1-4', '老师', [TR, SA, TG], 'C', 'giáo viên')]),
 phan(P_N3, 'tranh', [
   n3('n3-1', '你 去 学校 吗？', '去，我 去 学校。', 'A', 'A: Bạn có đi học không? — B: Có, mình đi đến trường.'),
   n3('n3-2', '你 看 什么？', '我 看 书。', 'B', 'A: Bạn đang xem gì thế? — B: Mình đọc sách.'),
   n3('n3-3', '请问，这 是 你 的 书 吗？', '是，这 是 我 的 书。', 'C', 'A: Xin hỏi, đây là sách của bạn à? — B: Vâng, đây là sách của tôi.')],
   anh=anh([TR, DS, SA])),
 phan(P_N4, 'nghe', [
   n4('n4-1', '今天 是 十 月 二十三 号，星期五。', '今天 星期 几？', ['星期四', '星期五', '星期六'], 'B', 'Hôm nay là ngày 23 tháng 10, thứ Sáu. — Hỏi: Hôm nay thứ mấy? — Thứ Sáu'),
   n4('n4-2', '明天 是 星期六，我 去 学校 看 书。', '他 明天 做 什么？', ['看 书', '学 汉语', '去 中国'], 'A', 'Ngày mai là thứ Bảy, tôi đến trường đọc sách. — Hỏi: Ngày mai anh ấy làm gì? — Đọc sách'),
   n4('n4-3', '昨天 是 五 月 六 号，今天 是 五 月 七 号。', '今天 几 号？', ['五 月 六 号', '五 月 七 号', '五 月 八 号'], 'B', 'Hôm qua là mùng 6 tháng 5, hôm nay là mùng 7 tháng 5. — Hỏi: Hôm nay ngày mấy? — Mùng 7 tháng 5'),
   n4('n4-4', '我 是 大学生，我 哥哥 是 中学生，我 妹妹 是 小学生。', '他 哥哥 是 什么 学生？', ['大学生', '中学生', '小学生'], 'B', 'Tôi là sinh viên đại học, anh trai tôi là học sinh cấp hai, em gái tôi là học sinh tiểu học. — Hỏi: Anh trai anh ấy là học sinh gì? — Cấp hai')]),
 phan(P_D1, 'doc-tranh', hang('d1', [('我 去 学校。', 'A'), ('你 好，我 叫 李月。', 'B'), ('我们 去 中国。', 'C'), ('他 是 我 的 老师。', 'D'), ('李月，再见！', 'E')], d1),
   anh=anh([TR, BT, TCH, TG, TB, DT])),
 phan(P_D2, 'doc-ghep', hang('d2', [('今天 几 号？', 'A'), ('今天 星期 几？', 'B'), ('明天 你 去 学校 吗？', 'C'), ('请问，你 叫 什么 名字？', 'D'), ('你 看 什么 书？', 'E')], d2),
   luaChon=lc(cap=True, items=['今天 五 月 二十 号。', '今天 星期三。', '去，我 明天 去 学校。', '我 叫 李月。', '我 看 汉语 书。', '不 客气。'])),
 D3x(' (1)', hang('d3a', [('今天 是 五（　）七 号。', 'A'), ('今天 是 五 月 八（　）。', 'B'), ('今天（　）几？', 'C'), ('明（　）我 去 学校。', 'D')], d3), ['月', '号', '星期', '天', '几']),
 D3x(' (2)', hang('d3b', [('（　）问，这 是 你 的 书 吗？', 'A'), ('请（　），你 叫 什么 名字？', 'B'), ('我 明天（　）学校。', 'C'), ('我 明天（　）书。', 'D')], d3), ['请', '问', '去', '看', '书']),
]})

# ------------------------------------------------------------------ gắn câu ví dụ (例如) như khuôn HSK 3.0 (cùng ví dụ của sách; file giọng, ảnh đã có)
for _b in BAI:
    _b['phienBan'] = '2026-11-24a'
    _seen = set()
    for _p in _b['phan']:
        k = _ZH.get(_p['zh'])
        if k and k not in _seen:
            _p['vd'] = dict(VD[k], ma='vd'); _seen.add(k)
