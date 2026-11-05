# -*- coding: utf-8 -*-
# Nội dung "Luyện theo dạng sách bài tập" — câu soạn mới (không chép đề sách), theo dạng bài và phạm vi ngữ âm của từng bài.
# Âm tiết: 'da4' (ü viết v). Phương án nhiễu: thanh mẫu / vận mẫu (không dấu, tự đặt dấu theo thanh của đáp án).
P_TM = {'ten': 'Nghe, chọn thanh mẫu', 'zh': '听录音，选出听到的声母', 'hd': 'Bấm loa nghe âm tiết, chọn thanh mẫu còn thiếu.'}
P_VM = {'ten': 'Nghe, chọn vận mẫu', 'zh': '听录音，选出听到的韵母', 'hd': 'Bấm loa nghe âm tiết, chọn vận mẫu còn thiếu (đã có dấu thanh).'}
P_TD = {'ten': 'Nghe, chọn thanh điệu', 'zh': '听录音，选出听到的声调', 'hd': 'Bấm loa nghe âm tiết, chọn cách viết có thanh điệu đúng.'}
P_TR = {'ten': 'Nghe hội thoại, chọn tranh', 'zh': '听对话，选择正确的图片', 'hd': 'Bấm loa nghe hội thoại, chọn tranh phù hợp. Nghe xong mới hiện chữ.'}

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
    {'ma': 'tr1', 'dap': 'C', 'loi': [{'ai': 'A', 'han': '同学们好！', 'py': 'Tóngxuémen hǎo!'}, {'ai': 'B', 'han': '老师好！', 'py': 'Lǎoshī hǎo!'}], 'vi': 'A: Chào các em! — B: Chào thầy ạ!'},
    {'ma': 'tr2', 'dap': 'B', 'loi': [{'ai': 'A', 'han': '你们好！', 'py': 'Nǐmen hǎo!'}, {'ai': 'B', 'han': '你好！', 'py': 'Nǐ hǎo!'}], 'vi': 'A: Chào các bạn! — B: Chào bạn!'},
    {'ma': 'tr3', 'dap': 'A', 'loi': [{'ai': 'A', 'han': '谢谢您！', 'py': 'Xièxie nín!'}, {'ai': 'B', 'han': '不客气！', 'py': 'Bú kèqi!'}], 'vi': 'A: Cảm ơn anh! — B: Không có gì!'}],
    anh=[{'k': 'A', 'src': A + 'b1-qua.webp', 'alt': 'Một người đưa hộp quà'}, {'k': 'B', 'src': A + 'b1-chao.webp', 'alt': 'Hai bạn vẫy tay chào qua máy tính bảng'},
         {'k': 'C', 'src': A + 'b1-lop.webp', 'alt': 'Thầy giáo đứng trước lớp, học sinh giơ tay'}])]},
 {'bai': 2, 'ten': '我叫李文', 'tenViet': 'Mình tên là Lý Văn', 'phienBan': '2026-11-05a', 'phan': [
  phan(P_TM, 'tm', [('jia1', ['q', 'x']), ('qing3', ['j', 'x']), ('xie4', ['j', 'q']), ('jiao4', ['q', 'x']), ('qu4', ['j', 'x']), ('xue2', ['j', 'q']),
                    ('ji3', ['q', 'x']), ('qian2', ['j', 'x']), ('xin1', ['j', 'q']), ('jiu3', ['q', 'x']), ('qi1', ['j', 'x']), ('xiao3', ['j', 'q'])]),
  phan(P_VM, 'vm', [('jia1', ['ie', 'iao']), ('xie4', ['ia', 'ue']), ('jiao4', ['iu', 'ia']), ('jiu3', ['iao', 'ie']), ('xin1', ['ing', 'ian']), ('qing3', ['in', 'iang']),
                    ('jian4', ['iang', 'uan']), ('xiang3', ['ian', 'iong']), ('xiong2', ['iang', 'ing']), ('xue2', ['ie', 'uan']), ('quan2', ['ian', 'un']), ('qun2', ['in', 'uan'])]),
  phan(P_TD, 'td', [('xue2',), ('jiao4',), ('qun2',), ('jiu3',), ('xin1',), ('qing3',), ('xia4',), ('jia1',), ('qu4',), ('ji1',), ('xiao3',), ('jie3',)]),
  phan(P_TR, 'tranh', [
    {'ma': 'tr1', 'dap': 'C', 'loi': [{'ai': 'A', 'han': '对不起！', 'py': 'Duìbuqǐ!'}, {'ai': 'B', 'han': '没关系。', 'py': 'Méi guānxi.'}], 'vi': 'A: Xin lỗi! — B: Không sao.'},
    {'ma': 'tr2', 'dap': 'D', 'loi': [{'ai': 'A', 'han': '请问，你叫什么名字？', 'py': 'Qǐngwèn, nǐ jiào shénme míngzi?'}, {'ai': 'B', 'han': '我叫白家月。', 'py': 'Wǒ jiào Bái Jiāyuè.'}], 'vi': 'A: Xin hỏi, bạn tên là gì? — B: Mình tên là Bạch Gia Nguyệt.'},
    {'ma': 'tr3', 'dap': 'A', 'loi': [{'ai': 'A', 'han': '认识你很高兴！', 'py': 'Rènshi nǐ hěn gāoxìng!'}, {'ai': 'B', 'han': '我也很高兴。', 'py': 'Wǒ yě hěn gāoxìng.'}], 'vi': 'A: Rất vui được quen anh! — B: Tôi cũng rất vui.'},
    {'ma': 'tr4', 'dap': 'B', 'loi': [{'ai': 'A', 'han': '李文，再见！', 'py': 'Lǐ Wén, zàijiàn!'}, {'ai': 'B', 'han': '再见！', 'py': 'Zàijiàn!'}], 'vi': 'A: Lý Văn, tạm biệt! — B: Tạm biệt!'}],
    anh=[{'k': 'A', 'src': A + 'b2-bat-tay.webp', 'alt': 'Hai người bắt tay'}, {'k': 'B', 'src': A + 'b2-tambiet.webp', 'alt': 'Một bạn nữ vẫy tay'},
         {'k': 'C', 'src': A + 'b2-xinloi.webp', 'alt': 'Cốc cà phê bị đổ'}, {'k': 'D', 'src': A + 'b2-gioithieu.webp', 'alt': 'Một bạn nữ đứng nói với các bạn'}])]},
 {'bai': 3, 'ten': '我是中国人', 'tenViet': 'Mình là người Trung Quốc', 'phienBan': '2026-11-05a', 'phan': [
  phan(P_TM, 'tm', [('zhong1', ['z', 'j']), ('chi1', ['c', 'q']), ('shi4', ['s', 'x']), ('ren2', ['l', 'sh']), ('zai4', ['zh', 'j']), ('cai4', ['ch', 'q']),
                    ('san1', ['sh', 'x']), ('zou3', ['zh', 'j']), ('shui3', ['s', 'x']), ('chang4', ['c', 'q']), ('zi4', ['zh', 'j']), ('ri4', ['l', 'sh'])]),
  phan(P_VM, 'vm', [('zhi1', ['e', 'u']), ('zi4', ['u', 'e']), ('shuo1', ['ou', 'a']), ('hua1', ['uo', 'a']), ('kuai4', ['ai', 'ui']), ('shui3', ['ei', 'uo']),
                    ('chuan1', ['an', 'uang']), ('cun1', ['en', 'ong']), ('zhuang4', ['uan', 'ang']), ('shei2', ['ou', 'ai']), ('zhong1', ['ang', 'eng']), ('re4', ['i', 'u'])]),
  phan(P_TD, 'td', [('che1',), ('ren2',), ('chang4',), ('zao3',), ('shou3',), ('shui3',), ('zuo4',), ('chuang2',), ('shu1',), ('si4',), ('zhong1',), ('cai4',)]),
  phan(P_TR, 'tranh', [
    {'ma': 'tr1', 'dap': 'C', 'loi': [{'ai': 'A', 'han': '喂，你工作忙吗？', 'py': 'Wèi, nǐ gōngzuò máng ma?'}, {'ai': 'B', 'han': '太忙了！', 'py': 'Tài máng le!'}], 'vi': 'A: A lô, công việc của bạn có bận không? — B: Bận quá!'},
    {'ma': 'tr2', 'dap': 'D', 'loi': [{'ai': 'A', 'han': '她是谁？', 'py': 'Tā shì shéi?'}, {'ai': 'B', 'han': '她是我女朋友。', 'py': 'Tā shì wǒ nǚpéngyou.'}], 'vi': 'A: Cô ấy là ai? — B: Cô ấy là bạn gái mình.'},
    {'ma': 'tr3', 'dap': 'B', 'loi': [{'ai': 'A', 'han': '这是中文吗？', 'py': 'Zhè shì Zhōngwén ma?'}, {'ai': 'B', 'han': '对，这是中文。', 'py': 'Duì, zhè shì Zhōngwén.'}], 'vi': 'A: Đây là tiếng Trung à? — B: Đúng, đây là tiếng Trung.'},
    {'ma': 'tr4', 'dap': 'A', 'loi': [{'ai': 'A', 'han': '你想去中国吗？', 'py': 'Nǐ xiǎng qù Zhōngguó ma?'}, {'ai': 'B', 'han': '想！我很想去中国。', 'py': 'Xiǎng! Wǒ hěn xiǎng qù Zhōngguó.'}], 'vi': 'A: Bạn có muốn đi Trung Quốc không? — B: Muốn! Mình rất muốn đi Trung Quốc.'}],
    anh=[{'k': 'A', 'src': A + 'b3-truongthanh.webp', 'alt': 'Vạn Lý Trường Thành'}, {'k': 'B', 'src': A + 'b3-bang-chu.webp', 'alt': 'Bảng đen viết chữ Hán'},
         {'k': 'C', 'src': A + 'b3-dienthoai.webp', 'alt': 'Người đàn ông vừa nghe điện thoại vừa ghi chép'}, {'k': 'D', 'src': A + 'b3-bangai.webp', 'alt': 'Một đôi nam nữ gặp một người bạn'}])]},
]
