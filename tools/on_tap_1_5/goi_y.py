# -*- coding: utf-8 -*-
"""Từ gợi ý cho câu dịch có nhiều đáp án (cô Nhiên yêu cầu 31/10/2026).
Câu nào các đáp án khác nhau ở CHỌN TỪ (汉语/中文, 你们/大家, 吗/是不是, 个/位, 号/日…) thì đề hiện "💡 Dùng: …" bằng từ của đáp án chính,
và chỉ giữ các cách dịch có đủ từ gợi ý. Khác nhau chỉ ở phần tuỳ chọn về ngữ pháp (có / không 的, 是 trong câu vị ngữ danh từ,
vị trí từ chỉ thời gian, 们, 了, dấu câu) thì không gợi ý và vẫn chấp nhận cả hai, vì đều đúng.
"""
import von

DONG_NGHIA = [('汉语', '中文'), ('你们', '大家'), ('你', '您'), ('个', '位'), ('个', '道'), ('日', '号'), ('星期日', '星期天'),
              ('丈夫', '老公'), ('很', '真'), ('他', '她'), ('家月', '白家月'), ('也', '和'), ('老师', '您'), ('他们', '爸爸')]
HOI = ('吗',)                       # hỏi bằng 吗 ↔ A不A / 有没有
# Câu cô đã chọn đáp án chính khác (theo chế độ giáo viên 31/10/2026)
DAP_CHINH = {'c06': '请大家说汉语。'}


def tok(s):
    t = [w for w in von.tach(s)[0] if von.la_han(w[0])]
    o, i = [], 0
    while i < len(t):
        if i + 2 < len(t) and t[i + 1] == '不' and t[i] == t[i + 2]: o.append(t[i] + '不' + t[i]); i += 3
        elif t[i] == '有' and i + 1 < len(t) and t[i + 1] == '没有': o.append('有没有'); i += 2
        else: o.append(t[i]); i += 1
    return o


def la_ab(w): return w == '有没有' or (len(w) == 3 and w[1] in '不没' and w[0] == w[2])


def goi_y(ma, zh):
    """→ (goiY: list, zh mới)"""
    if ma in DAP_CHINH:
        c = DAP_CHINH[ma]; zh = [c] + [z for z in zh if z != c]
    if len(zh) < 2: return [], zh
    a0 = tok(zh[0]); s0 = set(a0); gy = []
    for alt in zh[1:]:
        s1 = set(tok(alt))
        for x, y in DONG_NGHIA:
            for a, b in ((x, y), (y, x)):
                if a in s0 and b in s1 and a not in s1 and a not in gy: gy.append(a)
        ab0 = [w for w in a0 if la_ab(w)]; ab1 = [w for w in s1 if la_ab(w)]
        if ab0 and '吗' in s1 and '吗' not in s0 and ab0[0] not in gy: gy.append(ab0[0])
        if '吗' in s0 and ab1 and not [w for w in a0 if la_ab(w)] and '吗' not in gy: gy.append('吗')
    gy = sorted(gy, key=lambda w: a0.index(w) if w in a0 else 99)
    giu = [zh[0]] + [z for z in zh[1:] if all(w in tok(z) for w in gy)]
    return gy, giu
