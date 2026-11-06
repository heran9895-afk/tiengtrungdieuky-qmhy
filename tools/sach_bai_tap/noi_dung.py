# -*- coding: utf-8 -*-
# Nội dung "Luyện theo dạng sách bài tập" — câu soạn mới (không chép đề sách), theo dạng bài và phạm vi ngữ âm của từng bài.
# Âm tiết: 'da4' (ü viết v). Phương án nhiễu: thanh mẫu / vận mẫu (không dấu, tự đặt dấu theo thanh của đáp án).
P_TM = {'ten': 'Nghe, chọn thanh mẫu', 'zh': '听录音，选出听到的声母', 'hd': 'Bấm loa nghe âm tiết, chọn thanh mẫu còn thiếu.'}
P_VM = {'ten': 'Nghe, chọn vận mẫu', 'zh': '听录音，选出听到的韵母', 'hd': 'Bấm loa nghe âm tiết, chọn vận mẫu còn thiếu (đã có dấu thanh).'}
P_TD = {'ten': 'Nghe, chọn thanh điệu', 'zh': '听录音，选出听到的声调', 'hd': 'Bấm loa nghe âm tiết, chọn cách viết có thanh điệu đúng.'}
P_TR = {'ten': 'Nghe hội thoại, chọn tranh', 'zh': '听对话，选择正确的图片', 'hd': 'Bấm loa nghe hội thoại, chọn tranh phù hợp.'}

def phan(mau, loai, cau, **k):
    d = dict(mau); d['loai'] = loai; d['cau'] = cau; d.update(k); return d

A = 'assets/img/sach-bai-tap/'
BAI = [
 {'bai': 1, 'ten': 'AI小语，你好！', 'tenViet': 'AI Tiểu Ngữ, chào bạn!', 'phienBan': '2026-11-05a', 'phan': [
  phan(P_TM, 'tm', [('bu4', ['p', 'm']), ('pa4', ['b', 'f']), ('mao1', ['n', 'b']), ('fan4', ['h', 'p']), ('da4', ['t', 'n']), ('ta1', ['d', 'l']),
                    ('ni3', ['l', 'm']), ('lao3', ['n', 'd']), ('gou3', ['k', 'h']), ('ke4', ['g', 'h']), ('hao3', ['f', 'k']), ('hen3', ['f', 'k'])]),
  phan(P_VM, 'vm', [('he1', ['a', 'ou']), ('di4', ['e', 'u']), ('bu4', ['o', 'ao']), ('lai2', ['ei', 'ao']), ('mei2', ['ai', 'ou']), ('mao1', ['ou', 'a']),
                    ('gou3', ['ao', 'e']), ('fan4', ['ang', 'en']), ('hen3', ['eng', 'an']), ('mang2', ['an', 'eng']), ('peng2', ['en', 'ang']), ('dong1', ['ou', 'ang'])]),
  phan(P_TD, 'td', [('hao3',), ('mao1',), ('gou3',), ('da4',), ('ni3',), ('ta1',), ('lai2',), ('mei2',), ('ke4',), ('he1',), ('fan4',), ('bu4',)]),
  phan(P_TR, 'tranh', [
    {'ma': 'tr1', 'giong': ['nam1', 'nu1'], 'dap': 'C', 'loi': [{'ai': 'A', 'han': '同学们好！', 'py': 'Tóngxuémen hǎo!'}, {'ai': 'B', 'han': '老师好！', 'py': 'Lǎoshī hǎo!'}], 'vi': 'A: Chào các em! — B: Chào thầy ạ!'},
    {'ma': 'tr2', 'giong': ['nam1', 'nu1'], 'dap': 'B', 'loi': [{'ai': 'A', 'han': '你们好！', 'py': 'Nǐmen hǎo!'}, {'ai': 'B', 'han': '你好！', 'py': 'Nǐ hǎo!'}], 'vi': 'A: Chào các bạn! — B: Chào bạn!'},
    {'ma': 'tr3', 'giong': ['nam1', 'nu1'], 'dap': 'A', 'loi': [{'ai': 'A', 'han': '谢谢您！', 'py': 'Xièxie nín!'}, {'ai': 'B', 'han': '不客气！', 'py': 'Bú kèqi!'}], 'vi': 'A: Cảm ơn anh! — B: Không có gì!'}],
    anh=[{'k': 'A', 'src': A + 'b1-qua.webp', 'alt': 'Một người đưa hộp quà'}, {'k': 'B', 'src': A + 'b1-chao.webp', 'alt': 'Hai bạn vẫy tay chào qua máy tính bảng'},
         {'k': 'C', 'src': A + 'b1-lop.webp', 'alt': 'Thầy giáo đứng trước lớp, học sinh giơ tay'}])]},
 {'bai': 2, 'ten': '我叫李文', 'tenViet': 'Mình tên là Lý Văn', 'phienBan': '2026-11-05a', 'phan': [
  phan(P_TM, 'tm', [('jia1', ['q', 'x']), ('qing3', ['j', 'x']), ('xie4', ['j', 'q']), ('jiao4', ['q', 'x']), ('qu4', ['j', 'x']), ('xue2', ['j', 'q']),
                    ('ji3', ['q', 'x']), ('qian2', ['j', 'x']), ('xin1', ['j', 'q']), ('jiu3', ['q', 'x']), ('qi1', ['j', 'x']), ('xiao3', ['j', 'q'])]),
  phan(P_VM, 'vm', [('jia1', ['ie', 'iao']), ('xie4', ['ia', 'ue']), ('jiao4', ['iu', 'ia']), ('jiu3', ['iao', 'ie']), ('xin1', ['ing', 'ian']), ('qing3', ['in', 'iang']),
                    ('jian4', ['iang', 'uan']), ('xiang3', ['ian', 'iong']), ('xiong2', ['iang', 'ing']), ('xue2', ['ie', 'uan']), ('quan2', ['ian', 'un']), ('qun2', ['in', 'uan'])]),
  phan(P_TD, 'td', [('xue2',), ('jiao4',), ('qun2',), ('jiu3',), ('xin1',), ('qing3',), ('xia4',), ('jia1',), ('qu4',), ('ji1',), ('xiao3',), ('jie3',)]),
  phan(P_TR, 'tranh', [
    {'ma': 'tr1', 'giong': ['nam1', 'nu1'], 'dap': 'C', 'loi': [{'ai': 'A', 'han': '对不起！', 'py': 'Duìbuqǐ!'}, {'ai': 'B', 'han': '没关系。', 'py': 'Méi guānxi.'}], 'vi': 'A: Xin lỗi! — B: Không sao.'},
    {'ma': 'tr2', 'giong': ['nam1', 'nu2'], 'dap': 'D', 'loi': [{'ai': 'A', 'han': '请问，你叫什么名字？', 'py': 'Qǐngwèn, nǐ jiào shénme míngzi?'}, {'ai': 'B', 'han': '我叫白家月。', 'py': 'Wǒ jiào Bái Jiāyuè.'}], 'vi': 'A: Xin hỏi, bạn tên là gì? — B: Mình tên là Bạch Gia Nguyệt.'},
    {'ma': 'tr3', 'giong': ['nam1', 'nu1'], 'dap': 'A', 'loi': [{'ai': 'A', 'han': '认识你很高兴！', 'py': 'Rènshi nǐ hěn gāoxìng!'}, {'ai': 'B', 'han': '我也很高兴。', 'py': 'Wǒ yě hěn gāoxìng.'}], 'vi': 'A: Rất vui được quen anh! — B: Tôi cũng rất vui.'},
    {'ma': 'tr4', 'giong': ['nu1', 'nam1'], 'dap': 'B', 'loi': [{'ai': 'A', 'han': '李文，再见！', 'py': 'Lǐ Wén, zàijiàn!'}, {'ai': 'B', 'han': '再见！', 'py': 'Zàijiàn!'}], 'vi': 'A: Lý Văn, tạm biệt! — B: Tạm biệt!'}],
    anh=[{'k': 'A', 'src': A + 'b2-bat-tay.webp', 'alt': 'Hai người bắt tay'}, {'k': 'B', 'src': A + 'b2-tambiet.webp', 'alt': 'Một bạn nữ vẫy tay'},
         {'k': 'C', 'src': A + 'b2-xinloi.webp', 'alt': 'Cốc cà phê bị đổ'}, {'k': 'D', 'src': A + 'b2-gioithieu.webp', 'alt': 'Một bạn nữ đứng nói với các bạn'}])]},
 {'bai': 3, 'ten': '我是中国人', 'tenViet': 'Mình là người Trung Quốc', 'phienBan': '2026-11-05a', 'phan': [
  phan(P_TM, 'tm', [('zhong1', ['z', 'j']), ('chi1', ['c', 'q']), ('shi4', ['s', 'x']), ('ren2', ['l', 'sh']), ('zai4', ['zh', 'j']), ('cai4', ['ch', 'q']),
                    ('san1', ['sh', 'x']), ('zou3', ['zh', 'j']), ('shui3', ['s', 'x']), ('chang4', ['c', 'q']), ('zi4', ['zh', 'j']), ('ri4', ['l', 'sh'])]),
  phan(P_VM, 'vm', [('zhi1', ['e', 'u']), ('zi4', ['u', 'e']), ('shuo1', ['ou', 'a']), ('hua1', ['uo', 'a']), ('kuai4', ['ai', 'ui']), ('shui3', ['ei', 'uo']),
                    ('chuan1', ['an', 'uang']), ('cun1', ['en', 'ong']), ('zhuang4', ['uan', 'ang']), ('shei2', ['ou', 'ai']), ('zhong1', ['ang', 'eng']), ('re4', ['i', 'u'])]),
  phan(P_TD, 'td', [('che1',), ('ren2',), ('chang4',), ('zao3',), ('shou3',), ('shui3',), ('zuo4',), ('chuang2',), ('shu1',), ('si4',), ('zhong1',), ('cai4',)]),
  phan(P_TR, 'tranh', [
    {'ma': 'tr1', 'giong': ['nu1', 'nam1'], 'dap': 'C', 'loi': [{'ai': 'A', 'han': '喂，你工作忙吗？', 'py': 'Wèi, nǐ gōngzuò máng ma?'}, {'ai': 'B', 'han': '太忙了！', 'py': 'Tài máng le!'}], 'vi': 'A: A lô, công việc của bạn có bận không? — B: Bận quá!'},
    {'ma': 'tr2', 'giong': ['nu1', 'nam1'], 'dap': 'D', 'loi': [{'ai': 'A', 'han': '她是谁？', 'py': 'Tā shì shéi?'}, {'ai': 'B', 'han': '她是我女朋友。', 'py': 'Tā shì wǒ nǚpéngyou.'}], 'vi': 'A: Cô ấy là ai? — B: Cô ấy là bạn gái mình.'},
    {'ma': 'tr3', 'giong': ['nam1', 'nu1'], 'dap': 'B', 'loi': [{'ai': 'A', 'han': '这是中文吗？', 'py': 'Zhè shì Zhōngwén ma?'}, {'ai': 'B', 'han': '对，这是中文。', 'py': 'Duì, zhè shì Zhōngwén.'}], 'vi': 'A: Đây là tiếng Trung à? — B: Đúng, đây là tiếng Trung.'},
    {'ma': 'tr4', 'giong': ['nam1', 'nu1'], 'dap': 'A', 'loi': [{'ai': 'A', 'han': '你想去中国吗？', 'py': 'Nǐ xiǎng qù Zhōngguó ma?'}, {'ai': 'B', 'han': '想！我很想去中国。', 'py': 'Xiǎng! Wǒ hěn xiǎng qù Zhōngguó.'}], 'vi': 'A: Bạn có muốn đi Trung Quốc không? — B: Muốn! Mình rất muốn đi Trung Quốc.'}],
    anh=[{'k': 'A', 'src': A + 'b3-truongthanh.webp', 'alt': 'Vạn Lý Trường Thành'}, {'k': 'B', 'src': A + 'b3-bang-chu.webp', 'alt': 'Bảng đen viết chữ Hán'},
         {'k': 'C', 'src': A + 'b3-dienthoai.webp', 'alt': 'Người đàn ông vừa nghe điện thoại vừa ghi chép'}, {'k': 'D', 'src': A + 'b3-bangai.webp', 'alt': 'Một đôi nam nữ gặp một người bạn'}])]},
]

# ---------------- Bài 4–5 ----------------
P_AT = {'ten': 'Nghe, chọn âm tiết', 'zh': '听录音，选择听到的音节', 'hd': 'Bấm loa nghe âm tiết, chọn âm tiết vừa nghe.'}
P_D1 = {'ten': 'Đọc câu, chọn tranh', 'zh': '阅读 · 第一部分：选择与句子最匹配的图片', 'hd': 'Đọc câu, chọn tranh phù hợp nhất. Có một tranh thừa.'}
P_D2 = {'ten': 'Nối câu hỏi với câu trả lời', 'zh': '阅读 · 第二部分：匹配句子', 'hd': 'Đọc câu hỏi, chọn câu trả lời phù hợp trong khung. Có một câu thừa.'}
P_D3 = {'ten': 'Chọn từ điền vào chỗ trống', 'zh': '阅读 · 第三部分：选词填空', 'hd': 'Chọn từ trong khung điền vào chỗ trống. Mỗi từ dùng một lần, có một từ thừa.'}
P_D4 = {'ten': 'Đọc câu, chọn đáp án đúng', 'zh': '阅读 · 第四部分：选择正确答案', 'hd': 'Đọc câu và câu hỏi ★, chọn đáp án đúng.'}

def L(k, han, py): return {'k': k, 'han': han, 'py': py}
def C(ma, han, py, dap, vi, **k):
    d = {'ma': ma, 'han': han, 'py': py, 'dap': dap, 'vi': vi}; d.update(k); return d

BAI += [
 {'bai': 4, 'ten': '我有两个孩子', 'tenViet': 'Tôi có hai đứa con', 'phienBan': '2026-11-05a', 'phan': [
  phan(P_AT, 'at', [('liang3', ['lian3', 'jiang3', 'liang4']), ('kou3', ['gou3', 'kou4', 'ke3']), ('sui4', ['shui4', 'cui4', 'sui2']), ('er2', ['e2', 'er4', 'ai2']),
                    ('qian1', ['qiang1', 'jian1', 'qian2']), ('wan4', ['wang4', 'wan3', 'huan4']), ('ling2', ['lin2', 'ning2', 'ling3']), ('bai3', ['pai3', 'bei3', 'bai2']),
                    ('nian2', ['niang2', 'lian2', 'nian4']), ('zhang4', ['chang4', 'zang4', 'zhang3'])]),
  phan(P_D1, 'doc-tranh', [
    C('d1-1', '我家有三口人：爸爸、妈妈和我。', 'Wǒ jiā yǒu sān kǒu rén: bàba, māma hé wǒ.', 'A', 'Nhà tôi có ba người: bố, mẹ và tôi.'),
    C('d1-2', '我女儿今年五岁。', 'Wǒ nǚ\'ér jīnnián wǔ suì.', 'B', 'Con gái tôi năm nay năm tuổi.'),
    C('d1-3', '他是我同事。', 'Tā shì wǒ tóngshì.', 'C', 'Anh ấy là đồng nghiệp của tôi.'),
    C('d1-4', '这是我老公，我们很好。', 'Zhè shì wǒ lǎogōng, wǒmen hěn hǎo.', 'D', 'Đây là chồng tôi, chúng tôi rất tốt.'),
    C('d1-5', '他有两个孩子。', 'Tā yǒu liǎng ge háizi.', 'E', 'Anh ấy có hai đứa con.')],
    anh=[{'k': 'A', 'src': A + 'b4-ba-nguoi.webp', 'alt': 'Bố, mẹ và con gái ngồi ăn'}, {'k': 'B', 'src': A + 'b4-be-gai.webp', 'alt': 'Một bé gái đang cười'},
         {'k': 'C', 'src': A + 'b4-dong-nghiep.webp', 'alt': 'Hai người làm việc cạnh nhau ở văn phòng'}, {'k': 'D', 'src': A + 'b4-vo-chong.webp', 'alt': 'Một đôi vợ chồng'},
         {'k': 'E', 'src': A + 'b4-bo-hai-con.webp', 'alt': 'Một người bố với hai đứa con'}, {'k': 'F', 'src': A + 'b4-ong-ba.webp', 'alt': 'Hai ông bà'}]),
  phan(P_D2, 'doc-ghep', [
    C('d2-1', '你家有几口人？', 'Nǐ jiā yǒu jǐ kǒu rén?', 'C', 'Nhà bạn có mấy người?'),
    C('d2-2', '你今年多大？', 'Nǐ jīnnián duō dà?', 'A', 'Năm nay bạn bao nhiêu tuổi?'),
    C('d2-3', '你有哥哥吗？', 'Nǐ yǒu gēge ma?', 'E', 'Bạn có anh trai không?'),
    C('d2-4', '你有几个孩子？', 'Nǐ yǒu jǐ ge háizi?', 'B', 'Bạn có mấy đứa con?'),
    C('d2-5', '他是谁？', 'Tā shì shéi?', 'F', 'Anh ấy là ai?')],
    luaChon=[L('A', '我今年二十岁。', 'Wǒ jīnnián èrshí suì.'), L('B', '我有一个儿子。', 'Wǒ yǒu yí ge érzi.'), L('C', '我家有五口人。', 'Wǒ jiā yǒu wǔ kǒu rén.'),
             L('D', '我爷爷今年八十岁。', 'Wǒ yéye jīnnián bāshí suì.'), L('E', '没有，我有两个妹妹。', 'Méiyǒu, wǒ yǒu liǎng ge mèimei.'), L('F', '他是我同事。', 'Tā shì wǒ tóngshì.')]),
  phan(P_D3, 'doc-dien', [
    C('d3-1', '我有（　）个哥哥。', 'Wǒ yǒu (　) ge gēge.', 'A', 'Tôi có hai anh trai.'),
    C('d3-2', '中国有（　）人？', 'Zhōngguó yǒu (　) rén?', 'B', 'Trung Quốc có bao nhiêu người?'),
    C('d3-3', '我儿子今年五（　）。', 'Wǒ érzi jīnnián wǔ (　).', 'C', 'Con trai tôi năm nay năm tuổi.'),
    C('d3-4', '我很好，你（　）？', 'Wǒ hěn hǎo, nǐ (　)?', 'D', 'Tôi rất khỏe, còn bạn?'),
    C('d3-5', '我有一（　）妹妹。', 'Wǒ yǒu yí (　) mèimei.', 'E', 'Tôi có một em gái.')],
    luaChon=[L('A', '两', 'liǎng'), L('B', '多少', 'duōshao'), L('C', '岁', 'suì'), L('D', '呢', 'ne'), L('E', '个', 'gè'), L('F', '口', 'kǒu')]),
  phan(P_D4, 'doc-hoi', [
    C('d4-1', '安妮家有爸爸、妈妈、姐姐和她。', 'Ānnī jiā yǒu bàba, māma, jiějie hé tā.', 'B', 'Nhà Annie có bố, mẹ, chị gái và cô ấy.',
      hoi={'han': '安妮家有：', 'py': 'Ānnī jiā yǒu:'}, pa=[L('A', '三口人', 'sān kǒu rén'), L('B', '四口人', 'sì kǒu rén'), L('C', '五口人', 'wǔ kǒu rén')]),
    C('d4-2', '我是王一雪，刘明是我丈夫。', 'Wǒ shì Wáng Yīxuě, Liú Míng shì wǒ zhàngfu.', 'B', 'Tôi là Vương Nhất Tuyết, Lưu Minh là chồng tôi.',
      hoi={'han': '刘明是王一雪的：', 'py': 'Liú Míng shì Wáng Yīxuě de:'}, pa=[L('A', '哥哥', 'gēge'), L('B', '老公', 'lǎogōng'), L('C', '儿子', 'érzi')]),
    C('d4-3', '杨同乐没有哥哥，他有一个妹妹。', 'Yáng Tónglè méiyǒu gēge, tā yǒu yí ge mèimei.', 'C', 'Dương Đồng Lạc không có anh trai, anh ấy có một em gái.',
      hoi={'han': '杨同乐有：', 'py': 'Yáng Tónglè yǒu:'}, pa=[L('A', '哥哥', 'gēge'), L('B', '姐姐', 'jiějie'), L('C', '妹妹', 'mèimei')]),
    C('d4-4', '小明今年五岁，他姐姐十二岁。', 'Xiǎomíng jīnnián wǔ suì, tā jiějie shí\'èr suì.', 'C', 'Tiểu Minh năm nay năm tuổi, chị gái cậu ấy mười hai tuổi.',
      hoi={'han': '小明的姐姐今年：', 'py': 'Xiǎomíng de jiějie jīnnián:'}, pa=[L('A', '五岁', 'wǔ suì'), L('B', '十岁', 'shí suì'), L('C', '十二岁', 'shí\'èr suì')])])]},
 {'bai': 5, 'ten': '今天我休息', 'tenViet': 'Hôm nay tôi nghỉ', 'phienBan': '2026-11-05a', 'phan': [
  phan(P_AT, 'at', [('tian1', ['dian1', 'tiao1', 'tian2']), ('hao4', ['hou4', 'gao4', 'hao3']), ('yue4', ['ye4', 'yu4', 'yue2']), ('xiu1', ['xiao1', 'shou1', 'xiu3']),
                    ('jiao3', ['qiao3', 'zhao3', 'jiu3']), ('cai4', ['chai4', 'zai4', 'cai3']), ('nao3', ['lao3', 'nao4', 'niao3']), ('zhen1', ['zheng1', 'zen1', 'zhen3']),
                    ('xi3', ['shi3', 'qi3', 'xu3']), ('bao1', ['pao1', 'bo1', 'bao3'])]),
  phan(P_D1, 'doc-tranh', [
    C('d1-1', '今天是我的生日。', 'Jīntiān shì wǒ de shēngrì.', 'A', 'Hôm nay là sinh nhật tôi.'),
    C('d1-2', '我妈妈会做饺子。', 'Wǒ māma huì zuò jiǎozi.', 'B', 'Mẹ tôi biết làm sủi cảo.'),
    C('d1-3', '我有一台新电脑。', 'Wǒ yǒu yì tái xīn diànnǎo.', 'C', 'Tôi có một chiếc máy tính mới.'),
    C('d1-4', '今天她休息，不上班。', 'Jīntiān tā xiūxi, bú shàngbān.', 'D', 'Hôm nay cô ấy nghỉ, không đi làm.'),
    C('d1-5', '我很喜欢吃面条儿。', 'Wǒ hěn xǐhuan chī miàntiáor.', 'E', 'Tôi rất thích ăn mì.')],
    anh=[{'k': 'A', 'src': A + 'b5-sinh-nhat.webp', 'alt': 'Bánh sinh nhật có nến'}, {'k': 'B', 'src': A + 'b5-goi-sui-cao.webp', 'alt': 'Tay đang gói sủi cảo'},
         {'k': 'C', 'src': A + 'b5-may-tinh.webp', 'alt': 'Máy tính xách tay trên bàn'}, {'k': 'D', 'src': A + 'b5-nghi-ngoi.webp', 'alt': 'Một người nằm nghỉ trên ghế sofa'},
         {'k': 'E', 'src': A + 'b5-mi.webp', 'alt': 'Một bát mì'}, {'k': 'F', 'src': A + 'b5-banh-bao.webp', 'alt': 'Bánh bao'}]),
  phan(P_D2, 'doc-ghep', [
    C('d2-1', '今天几月几号？', 'Jīntiān jǐ yuè jǐ hào?', 'B', 'Hôm nay là ngày mấy tháng mấy?'),
    C('d2-2', '明天星期几？', 'Míngtiān xīngqī jǐ?', 'D', 'Ngày mai là thứ mấy?'),
    C('d2-3', '你会做饭吗？', 'Nǐ huì zuò fàn ma?', 'A', 'Bạn có biết nấu cơm không?'),
    C('d2-4', '这些包子好吃吗？', 'Zhèxiē bāozi hǎochī ma?', 'F', 'Mấy cái bánh bao này có ngon không?'),
    C('d2-5', '你哪天上班？', 'Nǐ nǎ tiān shàngbān?', 'C', 'Bạn đi làm vào hôm nào?')],
    luaChon=[L('A', '会，我会做面条儿。', 'Huì, wǒ huì zuò miàntiáor.'), L('B', '今天十一月五号。', 'Jīntiān shíyī yuè wǔ hào.'), L('C', '我星期一上班。', 'Wǒ xīngqīyī shàngbān.'),
             L('D', '明天星期六。', 'Míngtiān xīngqīliù.'), L('E', '我昨天休息。', 'Wǒ zuótiān xiūxi.'), L('F', '真好吃！', 'Zhēn hǎochī!')]),
  phan(P_D3, 'doc-dien', [
    C('d3-1', '这（　）饺子是我妈妈做的。', 'Zhè (　) jiǎozi shì wǒ māma zuò de.', 'C', 'Mấy cái sủi cảo này là mẹ tôi làm.'),
    C('d3-2', '我有一（　）新电脑。', 'Wǒ yǒu yì (　) xīn diànnǎo.', 'E', 'Tôi có một chiếc máy tính mới.'),
    C('d3-3', '今天十月一（　）。', 'Jīntiān shí yuè yī (　).', 'D', 'Hôm nay là ngày mùng một tháng mười.'),
    C('d3-4', '你（　）做饭吗？', 'Nǐ (　) zuò fàn ma?', 'A', 'Bạn có biết nấu cơm không?'),
    C('d3-5', '这个面包（　）好吃！', 'Zhège miànbāo (　) hǎochī!', 'B', 'Cái bánh mì này ngon thật!')],
    luaChon=[L('A', '会', 'huì'), L('B', '真', 'zhēn'), L('C', '些', 'xiē'), L('D', '号', 'hào'), L('E', '台', 'tái'), L('F', '天', 'tiān')]),
  phan(P_D4, 'doc-hoi', [
    C('d4-1', '今天星期六，我休息，明天也休息。', 'Jīntiān xīngqīliù, wǒ xiūxi, míngtiān yě xiūxi.', 'B', 'Hôm nay thứ bảy, tôi nghỉ, ngày mai cũng nghỉ.',
      hoi={'han': '他明天：', 'py': 'Tā míngtiān:'}, pa=[L('A', '上班', 'shàngbān'), L('B', '休息', 'xiūxi'), L('C', '做饭', 'zuò fàn')]),
    C('d4-2', '我的生日是五月二十号。', 'Wǒ de shēngrì shì wǔ yuè èrshí hào.', 'B', 'Sinh nhật tôi là ngày 20 tháng 5.',
      hoi={'han': '他的生日是：', 'py': 'Tā de shēngrì shì:'}, pa=[L('A', '五月十二号', 'wǔ yuè shí\'èr hào'), L('B', '五月二十号', 'wǔ yuè èrshí hào'), L('C', '十二月五号', 'shí\'èr yuè wǔ hào')]),
    C('d4-3', '白家月很喜欢吃包子，不太喜欢吃面条儿。', 'Bái Jiāyuè hěn xǐhuan chī bāozi, bú tài xǐhuan chī miàntiáor.', 'B', 'Bạch Gia Nguyệt rất thích ăn bánh bao, không thích ăn mì lắm.',
      hoi={'han': '白家月喜欢吃：', 'py': 'Bái Jiāyuè xǐhuan chī:'}, pa=[L('A', '面条儿', 'miàntiáor'), L('B', '包子', 'bāozi'), L('C', '饺子', 'jiǎozi')]),
    C('d4-4', '这台电脑是新的，那台是旧的。我喜欢新电脑。', 'Zhè tái diànnǎo shì xīn de, nà tái shì jiù de. Wǒ xǐhuan xīn diànnǎo.', 'A', 'Chiếc máy tính này mới, chiếc kia cũ. Tôi thích máy tính mới.',
      hoi={'han': '他喜欢：', 'py': 'Tā xǐhuan:'}, pa=[L('A', '新电脑', 'xīn diànnǎo'), L('B', '旧电脑', 'jiù diànnǎo'), L('C', '新面包', 'xīn miànbāo')])])]},
]

# ---------------- Bài 4–5: Nghe (模拟测练 · 听力) ----------------
P_N1 = {'ten': 'Nghe, chọn tranh đúng', 'zh': '听力 · 第一部分：听短语，选择图片', 'hd': 'Bấm loa nghe cụm từ, chọn tranh đúng trong ba tranh.'}
P_N2 = {'ten': 'Nghe câu hỏi, chọn câu trả lời', 'zh': '听力 · 第二部分：听问题，选择正确回答', 'hd': 'Bấm loa nghe câu hỏi, chọn câu trả lời đúng.'}
P_N3 = {'ten': 'Nghe hội thoại, chọn tranh', 'zh': '听力 · 第三部分：听对话，选择最匹配的图片', 'hd': 'Bấm loa nghe hội thoại, chọn tranh phù hợp. Có một tranh thừa.'}
P_N4 = {'ten': 'Nghe câu và câu hỏi, chọn đáp án', 'zh': '听力 · 第四部分：听句子和问题，选择正确答案', 'hd': 'Bấm loa nghe một câu và câu hỏi, chọn đáp án đúng.'}

def T(k, ten, alt): return {'k': k, 'src': A + ten + '.webp', 'alt': alt}
def N1(ma, han, py, anh, dap, vi): return {'ma': ma, 'giong': ['nu1'], 'loi': [{'ai': '', 'han': han, 'py': py}], 'anh': anh, 'dap': dap, 'vi': vi}
def N2(ma, han, py, pa, dap, vi): return {'ma': ma, 'giong': ['nu1'], 'loi': [{'ai': '', 'han': han, 'py': py}], 'pa': pa, 'dap': dap, 'vi': vi}
def N3(ma, a, b, dap, vi, giong=('nam1', 'nu1')):
    return {'ma': ma, 'giong': list(giong), 'loi': [{'ai': 'A', 'han': a[0], 'py': a[1]}, {'ai': 'B', 'han': b[0], 'py': b[1]}], 'dap': dap, 'vi': vi}
def N4(ma, cau, hoi, pa, dap, vi):
    return {'ma': ma, 'giong': ['nam1', 'nu1'], 'loi': [{'ai': '', 'han': cau[0], 'py': cau[1]}, {'ai': '问', 'han': hoi[0], 'py': hoi[1]}], 'pa': pa, 'dap': dap, 'vi': vi}

NGHE = {
 4: [
  phan(P_N1, 'nghe', [
    N1('n1-1', '两个孩子', 'liǎng ge háizi', [T('A', 'b4-em-be', 'Một em bé'), T('B', 'b4-hai-be', 'Hai đứa trẻ'), T('C', 'b4-ong-ba', 'Hai ông bà')], 'B', 'hai đứa trẻ'),
    N1('n1-2', '我女儿', 'wǒ nǚ\'ér', [T('A', 'b4-be-trai', 'Một bé trai'), T('B', 'b4-dong-nghiep', 'Hai người ở văn phòng'), T('C', 'b4-be-gai', 'Một bé gái')], 'C', 'con gái tôi'),
    N1('n1-3', '三口人', 'sān kǒu rén', [T('A', 'b4-ba-nguoi', 'Bố, mẹ và con gái'), T('B', 'b4-hai-be', 'Hai đứa trẻ'), T('C', 'b4-em-be', 'Một em bé')], 'A', 'ba người')]),
  phan(P_N2, 'nghe', [
    N2('n2-1', '你家有几口人？', 'Nǐ jiā yǒu jǐ kǒu rén?', [L('A', '五岁', 'wǔ suì'), L('B', '四口人', 'sì kǒu rén'), L('C', '两个', 'liǎng ge')], 'B', 'Nhà bạn có mấy người?'),
    N2('n2-2', '你女儿今年多大？', 'Nǐ nǚ\'ér jīnnián duō dà?', [L('A', '八岁', 'bā suì'), L('B', '三个', 'sān ge'), L('C', '一百', 'yìbǎi')], 'A', 'Con gái bạn năm nay bao nhiêu tuổi?'),
    N2('n2-3', '你有没有妹妹？', 'Nǐ yǒu méiyǒu mèimei?', [L('A', '有，我有一个妹妹。', 'Yǒu, wǒ yǒu yí ge mèimei.'), L('B', '他是我哥哥。', 'Tā shì wǒ gēge.'), L('C', '我今年二十岁。', 'Wǒ jīnnián èrshí suì.')], 'A', 'Bạn có em gái không?')]),
  phan(P_N3, 'tranh', [
    N3('n3-1', ('这是你女儿吗？', 'Zhè shì nǐ nǚ\'ér ma?'), ('对，她今年六岁。', 'Duì, tā jīnnián liù suì.'), 'B', 'A: Đây là con gái chị à? — B: Đúng, năm nay cháu sáu tuổi.'),
    N3('n3-2', ('你老公做什么工作？', 'Nǐ lǎogōng zuò shénme gōngzuò?'), ('他是老师。', 'Tā shì lǎoshī.'), 'D', 'A: Chồng chị làm nghề gì? — B: Anh ấy là giáo viên.'),
    N3('n3-3', ('他们是谁？', 'Tāmen shì shéi?'), ('他们是我爷爷、奶奶。', 'Tāmen shì wǒ yéye, nǎinai.'), 'A', 'A: Họ là ai? — B: Họ là ông bà nội của tôi.')],
    anh=[T('A', 'b4-ong-ba', 'Hai ông bà'), T('B', 'b4-be-gai', 'Một bé gái'), T('C', 'b4-dong-nghiep', 'Hai người ở văn phòng'), T('D', 'b4-thay-giao', 'Một thầy giáo đứng trên lớp')]),
  phan(P_N4, 'nghe', [
    N4('n4-1', ('我有两个哥哥，没有姐姐。', 'Wǒ yǒu liǎng ge gēge, méiyǒu jiějie.'), ('他有几个哥哥？', 'Tā yǒu jǐ ge gēge?'),
       [L('A', '一个', 'yí ge'), L('B', '两个', 'liǎng ge'), L('C', '三个', 'sān ge')], 'B', 'Tôi có hai anh trai, không có chị gái. — Hỏi: Anh ấy có mấy anh trai?'),
    N4('n4-2', ('我有一个儿子和一个女儿。', 'Wǒ yǒu yí ge érzi hé yí ge nǚ\'ér.'), ('他有几个孩子？', 'Tā yǒu jǐ ge háizi?'),
       [L('A', '一个', 'yí ge'), L('B', '两个', 'liǎng ge'), L('C', '三个', 'sān ge')], 'B', 'Tôi có một con trai và một con gái. — Hỏi: Anh ấy có mấy đứa con?'),
    N4('n4-3', ('我爷爷今年八十岁，奶奶七十八岁。', 'Wǒ yéye jīnnián bāshí suì, nǎinai qīshíbā suì.'), ('他奶奶今年多大年纪？', 'Tā nǎinai jīnnián duō dà niánjì?'),
       [L('A', '七十八岁', 'qīshíbā suì'), L('B', '八十岁', 'bāshí suì'), L('C', '十八岁', 'shíbā suì')], 'A', 'Ông tôi năm nay 80 tuổi, bà 78 tuổi. — Hỏi: Bà anh ấy năm nay bao nhiêu tuổi?')])],
 5: [
  phan(P_N1, 'nghe', [
    N1('n1-1', '面包', 'miànbāo', [T('A', 'b5-mi', 'Một bát mì'), T('B', 'b5-banh-mi', 'Bánh mì'), T('C', 'b5-goi-sui-cao', 'Gói sủi cảo')], 'B', 'bánh mì'),
    N1('n1-2', '新电脑', 'xīn diànnǎo', [T('A', 'b5-sinh-nhat', 'Bánh sinh nhật'), T('B', 'b5-banh-bao', 'Bánh bao'), T('C', 'b5-may-tinh', 'Máy tính xách tay')], 'C', 'máy tính mới'),
    N1('n1-3', '做饭', 'zuò fàn', [T('A', 'b5-nau-an', 'Nấu ăn trong bếp'), T('B', 'b5-nghi-ngoi', 'Nằm nghỉ trên sofa'), T('C', 'b4-dong-nghiep', 'Làm việc ở văn phòng')], 'A', 'nấu cơm')]),
  phan(P_N2, 'nghe', [
    N2('n2-1', '今天几号？', 'Jīntiān jǐ hào?', [L('A', '星期三', 'xīngqīsān'), L('B', '十五号', 'shíwǔ hào'), L('C', '三个', 'sān ge')], 'B', 'Hôm nay ngày mấy?'),
    N2('n2-2', '你会做饭吗？', 'Nǐ huì zuò fàn ma?', [L('A', '会，我会做饺子。', 'Huì, wǒ huì zuò jiǎozi.'), L('B', '我很喜欢。', 'Wǒ hěn xǐhuan.'), L('C', '今天是我的生日。', 'Jīntiān shì wǒ de shēngrì.')], 'A', 'Bạn có biết nấu cơm không?'),
    N2('n2-3', '明天星期几？', 'Míngtiān xīngqī jǐ?', [L('A', '星期五', 'xīngqīwǔ'), L('B', '五月', 'wǔ yuè'), L('C', '五个', 'wǔ ge')], 'A', 'Ngày mai thứ mấy?')]),
  phan(P_N3, 'tranh', [
    N3('n3-1', ('这是你的新电脑吗？', 'Zhè shì nǐ de xīn diànnǎo ma?'), ('对，是新的。', 'Duì, shì xīn de.'), 'C', 'A: Đây là máy tính mới của bạn à? — B: Đúng, máy mới.'),
    N3('n3-2', ('今天你上班吗？', 'Jīntiān nǐ shàngbān ma?'), ('不上班，我今天休息。', 'Bú shàngbān, wǒ jīntiān xiūxi.'), 'A', 'A: Hôm nay bạn có đi làm không? — B: Không, hôm nay tôi nghỉ.'),
    N3('n3-3', ('这些包子真好吃！', 'Zhèxiē bāozi zhēn hǎochī!'), ('是我做的。', 'Shì wǒ zuò de.'), 'D', 'A: Mấy cái bánh bao này ngon thật! — B: Tôi làm đấy.')],
    anh=[T('A', 'b5-nghi-ngoi', 'Nằm nghỉ trên sofa'), T('B', 'b5-sinh-nhat', 'Bánh sinh nhật'), T('C', 'b5-may-tinh', 'Máy tính xách tay'), T('D', 'b5-banh-bao', 'Bánh bao')]),
  phan(P_N4, 'nghe', [
    N4('n4-1', ('今天是十月一号，星期三。', 'Jīntiān shì shí yuè yī hào, xīngqīsān.'), ('今天星期几？', 'Jīntiān xīngqī jǐ?'),
       [L('A', '星期一', 'xīngqīyī'), L('B', '星期三', 'xīngqīsān'), L('C', '星期天', 'xīngqītiān')], 'B', 'Hôm nay là ngày 1 tháng 10, thứ Tư. — Hỏi: Hôm nay thứ mấy?'),
    N4('n4-2', ('我妈妈会做面条儿，不会做饺子。', 'Wǒ māma huì zuò miàntiáor, bú huì zuò jiǎozi.'), ('他妈妈会做什么？', 'Tā māma huì zuò shénme?'),
       [L('A', '饺子', 'jiǎozi'), L('B', '面包', 'miànbāo'), L('C', '面条儿', 'miàntiáor')], 'C', 'Mẹ tôi biết làm mì, không biết làm sủi cảo. — Hỏi: Mẹ anh ấy biết làm gì?'),
    N4('n4-3', ('昨天是我的生日，我很高兴。', 'Zuótiān shì wǒ de shēngrì, wǒ hěn gāoxìng.'), ('他的生日是哪天？', 'Tā de shēngrì shì nǎ tiān?'),
       [L('A', '今天', 'jīntiān'), L('B', '昨天', 'zuótiān'), L('C', '明天', 'míngtiān')], 'B', 'Hôm qua là sinh nhật tôi, tôi rất vui. — Hỏi: Sinh nhật anh ấy là hôm nào?')])]}
for b in BAI:
    if b['bai'] in NGHE:
        b['phan'] = [b['phan'][0]] + NGHE[b['bai']] + b['phan'][1:]

# ---------------- Câu ví dụ (例如) của 模拟测练 — chữ lấy đúng sách (cô cho dùng 06/11/2026), tranh Unsplash, giọng thu mới ----------------
VD = {
 'P_N1': {'giong': ['nu1'], 'loi': [{'ai': '', 'han': '三个苹果', 'py': 'sān ge píngguǒ'}],
          'anh': [T('A', 'vd-sach', 'Chồng sách'), T('B', 'b5-may-tinh', 'Máy tính xách tay'), T('C', 'vd-tao', 'Ba quả táo')], 'dap': 'C', 'vi': 'ba quả táo'},
 'P_N2': {'giong': ['nu1'], 'loi': [{'ai': '', 'han': '今天天气怎么样？', 'py': 'Jīntiān tiānqì zěnmeyàng?'}],
          'pa': [L('A', '非常热', 'fēicháng rè'), L('B', '很好听', 'hěn hǎotīng'), L('C', '在喝水', 'zài hē shuǐ')], 'dap': 'A', 'vi': 'Hôm nay thời tiết thế nào? — rất nóng'},
 'P_N3': {'giong': ['nu1', 'nam1'], 'loi': [{'ai': '女', 'han': '你好！', 'py': 'Nǐ hǎo!'}, {'ai': '男', 'han': '你好！很高兴认识你。', 'py': 'Nǐ hǎo! Hěn gāoxìng rènshi nǐ.'}],
          'chen': T('A', 'b2-bat-tay', 'Hai người bắt tay'), 'dap': 'A', 'vi': 'Nữ: Xin chào! — Nam: Xin chào! Rất vui được gặp bạn.'},
 'P_N4': {'giong': ['nam1', 'nu1'], 'loi': [{'ai': '', 'han': '下午我去超市，我想买一些水果。', 'py': 'Xiàwǔ wǒ qù chāoshì, wǒ xiǎng mǎi yìxiē shuǐguǒ.'}, {'ai': '问', 'han': '说话人下午去哪里？', 'py': 'Shuōhuàrén xiàwǔ qù nǎlǐ?'}],
          'pa': [L('A', '超市', 'chāoshì'), L('B', '医院', 'yīyuàn'), L('C', '学校', 'xuéxiào')], 'dap': 'A', 'vi': 'Buổi chiều tôi đi siêu thị, tôi muốn mua một ít trái cây. — Hỏi: Buổi chiều người nói đi đâu? — siêu thị'},
 'P_D1': {'han': '我很喜欢这本书。', 'py': 'Wǒ hěn xǐhuan zhè běn shū.', 'chen': T('A', 'vd-doc-sach', 'Một cô gái đang đọc sách'), 'dap': 'A', 'vi': 'Tôi rất thích cuốn sách này.'},
 'P_D2': {'han': '你喝水吗？', 'py': 'Nǐ hē shuǐ ma?', 'chen': L('A', '好的，谢谢！', 'Hǎo de, xièxie!'), 'dap': 'A', 'vi': 'Bạn có uống nước không? — Vâng, cảm ơn!'},
 'P_D3': {'han': '你叫什么（　）？', 'py': 'Nǐ jiào shénme (　)?', 'chen': L('A', '名字', 'míngzi'), 'dap': 'A', 'vi': 'Bạn tên là gì?'},
 'P_D4': {'han': '请问现在几点了？', 'py': 'Qǐngwèn xiànzài jǐ diǎn le?', 'hoi': {'han': '说话人想知道什么？', 'py': 'Shuōhuàrén xiǎng zhīdào shénme?'},
          'pa': [L('A', '时间', 'shíjiān'), L('B', '名字', 'míngzi'), L('C', '房间号', 'fángjiānhào')], 'dap': 'A', 'vi': 'Xin hỏi bây giờ là mấy giờ rồi? — Hỏi: Người nói muốn biết điều gì? — thời gian'},
}
_ZH = {P_N1['zh']: 'P_N1', P_N2['zh']: 'P_N2', P_N3['zh']: 'P_N3', P_N4['zh']: 'P_N4', P_D1['zh']: 'P_D1', P_D2['zh']: 'P_D2', P_D3['zh']: 'P_D3', P_D4['zh']: 'P_D4'}
for b in BAI:
    for p in b['phan']:
        if p['zh'] in _ZH: p['vd'] = dict(VD[_ZH[p['zh']]], ma='vd')
