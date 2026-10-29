#!/usr/bin/env python3
"""Câu bài khóa (slide của cô Nhiên) đưa vào kho bài tập HSK 3.0 — Nhiên chốt 29/10/2026.

Không đăng nguyên văn bài khóa lên web: chỉ dùng TỪNG CÂU (nguyên văn hoặc chuyển thể nhẹ) trong
  - cauLuyen  (Điền từ, Sắp xếp câu, Xếp câu theo nghĩa ở Bài tập / Ôn tập / Test)
  - hoiDap    (Hỏi – đáp: câu hỏi về nhân vật, nội dung bài khóa)
  - hoiThoai  (hội thoại bài khóa cắt thành cặp lượt thoại: chọn lượt đáp còn thiếu)
Câu luyện ngữ pháp từ bài khóa nằm ở tools/np_luyen/kho_bai2_4.py (phần "Bài khóa").

  python3 tools/bai_khoa.py kiem    # kiểm vốn chữ, pinyin
  python3 tools/bai_khoa.py gop     # kiểm rồi ghi vào data/bai/bai-N.json (chạy lại được: mục có "nguon":"baiKhoa" được thay mới)
"""
import json, os, re, sys, unicodedata

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(GOC, 'tools'))
from ngu_phap_luyen import CHU, strip, han   # vốn chữ theo sổ tích lũy, so pinyin

TEN_RIENG = '小语王一飞陈天中安妮白家月李文王一雪刘明杨同乐小明'

# ---------- Kho câu luyện: [chữ Hán, pinyin, nghĩa, np] ----------
CAU = {
1: [
 ['小语，你好！', 'Xiǎoyǔ, nǐ hǎo!', 'Chào Tiểu Ngữ!', ''],
 ['王老师，你好！', 'Wáng lǎoshī, nǐ hǎo!', 'Em chào cô Vương ạ!', ''],
 ['你好，小语！', 'Nǐ hǎo, Xiǎoyǔ!', 'Chào Tiểu Ngữ!', ''],
 ['老师，再见！', 'Lǎoshī, zàijiàn!', 'Em chào cô ạ!', ''],
 ['你们好！', 'Nǐmen hǎo!', 'Chào các bạn!', ''],
],
2: [
 ['你好，安妮！', 'Nǐ hǎo, Ānnī!', 'Chào Annie!', ''],
 ['我不是安妮，我是白家月。', 'Wǒ bú shì Ānnī, wǒ shì Bái Jiāyuè.', 'Mình không phải là Annie, mình là Bạch Gia Nguyệt.', 'shi'],
 ['你好！我叫李文。', 'Nǐ hǎo! Wǒ jiào Lǐ Wén.', 'Chào bạn! Mình tên là Lý Văn.', ''],
 ['很高兴认识你。', 'Hěn gāoxìng rènshi nǐ.', 'Rất vui được làm quen với bạn.', 'hen'],
 ['认识你我也很高兴。', 'Rènshi nǐ wǒ yě hěn gāoxìng.', 'Làm quen với bạn mình cũng rất vui.', 'ye'],
 ['请问，你叫什么名字？', 'Qǐngwèn, nǐ jiào shénme míngzi?', 'Xin hỏi, bạn tên là gì?', 'qing'],
],
3: [
 ['我是法国人。', 'Wǒ shì Fǎguó rén.', 'Tôi là người Pháp.', ''],
 ['我的中文老师也是中国人。', 'Wǒ de Zhōngwén lǎoshī yě shì Zhōngguó rén.', 'Giáo viên tiếng Trung của tôi cũng là người Trung Quốc.', 'de'],
 ['白家月的中文老师是中国人。', 'Bái Jiāyuè de Zhōngwén lǎoshī shì Zhōngguó rén.', 'Giáo viên tiếng Trung của Bạch Gia Nguyệt là người Trung Quốc.', 'de'],
 ['白家月不是中国人。', 'Bái Jiāyuè bú shì Zhōngguó rén.', 'Bạch Gia Nguyệt không phải là người Trung Quốc.', ''],
 ['你女朋友是哪国人？', 'Nǐ nǚpéngyou shì nǎ guó rén?', 'Bạn gái của bạn là người nước nào?', 'zhenana'],
 ['她也是泰国人。', 'Tā yě shì Tàiguó rén.', 'Cô ấy cũng là người Thái Lan.', ''],
 ['喂，一飞！', 'Wèi, Yīfēi!', 'A lô, Nhất Phi à!', ''],
 ['你工作还忙吗？', 'Nǐ gōngzuò hái máng ma?', 'Công việc của em vẫn bận à?', 'hai'],
 ['对，还很忙。', 'Duì, hái hěn máng.', 'Vâng, vẫn rất bận.', 'hai'],
 ['你也很忙吗？', 'Nǐ yě hěn máng ma?', 'Chị cũng rất bận à?', 'ma'],
 ['我不太忙。', 'Wǒ bú tài máng.', 'Chị không bận lắm.', 'tai'],
 ['我们很想你。', 'Wǒmen hěn xiǎng nǐ.', 'Mọi người rất nhớ em.', 'xiang'],
 ['我也想你们。', 'Wǒ yě xiǎng nǐmen.', 'Em cũng nhớ mọi người.', 'xiang'],
],
4: [
 ['一飞忙吗？', 'Yīfēi máng ma?', 'Nhất Phi có bận không?', ''],
 ['她有多少个学生？', 'Tā yǒu duōshao ge xué·shēng?', 'Cô ấy có bao nhiêu học sinh?', 'duoshao'],
 ['她有二十个学生。', 'Tā yǒu èrshí ge xué·shēng.', 'Cô ấy có hai mươi học sinh.', 'so'],
 ['王一雪有两个哥哥。', 'Wáng Yīxuě yǒu liǎng ge gēge.', 'Vương Nhất Tuyết có hai anh trai.', 'stlt'],
 ['我没有哥哥。', 'Wǒ méi·yǒu gēge.', 'Tôi không có anh trai.', 'you'],
 ['你家有几口人？', 'Nǐ jiā yǒu jǐ kǒu rén?', 'Nhà bạn có mấy người?', 'ji'],
 ['杨同乐家有四口人。', 'Yáng Tónglè jiā yǒu sì kǒu rén.', 'Nhà Dương Đồng Lạc có bốn người.', 'stlt'],
 ['这是您儿子吗？', 'Zhè shì nín érzi ma?', 'Đây là con trai chị à?', ''],
 ['我有两个孩子，一个儿子，一个女儿。', "Wǒ yǒu liǎng ge háizi, yí ge érzi, yí ge nǚ'ér.", 'Tôi có hai người con, một con trai, một con gái.', 'stlt'],
 ['您儿子几岁？', 'Nín érzi jǐ suì?', 'Con trai chị mấy tuổi?', 'hoiTuoi'],
 ['他今年五岁。', 'Tā jīnnián wǔ suì.', 'Năm nay cháu năm tuổi.', 'hoiTuoi'],
 ['您女儿多大？', "Nín nǚ'ér duō dà?", 'Con gái chị bao nhiêu tuổi?', 'hoiTuoi'],
],
}
# Câu cũ đề xuất bỏ khỏi kho câu luyện (không tự nhiên / thiếu ngữ cảnh), thay bằng câu bài khóa ở trên
BO_CAU = {1: ['小学生很好。'], 4: ['这个学生有两千个朋友。']}

# ---------- Hỏi – đáp: hỏi, đáp, nhiễu (câu đúng ngữ pháp nhưng không trả lời câu hỏi) ----------
def L(h, p, v=''): return [h, p, v]
HD = {
2: [
 dict(hoi=L('请问，你是不是安妮？', 'Qǐngwèn, nǐ shì bu shì Ānnī?', 'Xin hỏi, bạn có phải là Annie không?'),
      dap=L('我不是安妮，我是白家月。', 'Wǒ bú shì Ānnī, wǒ shì Bái Jiāyuè.', 'Mình không phải là Annie, mình là Bạch Gia Nguyệt.'),
      nhieu=[L('没关系！', 'Méi guānxi!'), L('认识你我也很高兴。', 'Rènshi nǐ wǒ yě hěn gāoxìng.'), L('我们说汉语。', 'Wǒmen shuō Hànyǔ.')]),
],
3: [
 dict(hoi=L('李文是哪国人？', 'Lǐ Wén shì nǎ guó rén?', 'Lý Văn là người nước nào?'),
      dap=L('他是中国人。', 'Tā shì Zhōngguó rén.', 'Anh ấy là người Trung Quốc.'),
      nhieu=[L('他是我的中文老师。', 'Tā shì wǒ de Zhōngwén lǎoshī.'), L('他很忙。', 'Tā hěn máng.'), L('他想去中国。', 'Tā xiǎng qù Zhōngguó.')]),
 dict(hoi=L('白家月是哪国人？', 'Bái Jiāyuè shì nǎ guó rén?', 'Bạch Gia Nguyệt là người nước nào?'),
      dap=L('她是法国人。', 'Tā shì Fǎguó rén.', 'Cô ấy là người Pháp.'),
      nhieu=[L('她是我的同学。', 'Tā shì wǒ de tóngxué.'), L('她很忙。', 'Tā hěn máng.'), L('她叫白家月。', 'Tā jiào Bái Jiāyuè.')]),
 dict(hoi=L('白家月的中文老师是哪国人？', 'Bái Jiāyuè de Zhōngwén lǎoshī shì nǎ guó rén?', 'Giáo viên tiếng Trung của Bạch Gia Nguyệt là người nước nào?'),
      dap=L('她的中文老师是中国人。', 'Tā de Zhōngwén lǎoshī shì Zhōngguó rén.', 'Giáo viên tiếng Trung của cô ấy là người Trung Quốc.'),
      nhieu=[L('她的中文老师很忙。', 'Tā de Zhōngwén lǎoshī hěn máng.'), L('她是白家月。', 'Tā shì Bái Jiāyuè.'), L('她想去中国。', 'Tā xiǎng qù Zhōngguó.')]),
 dict(hoi=L('一飞的工作忙吗？', 'Yīfēi de gōngzuò máng ma?', 'Công việc của Nhất Phi có bận không?'),
      dap=L('她的工作还很忙。', 'Tā de gōngzuò hái hěn máng.', 'Công việc của cô ấy vẫn rất bận.'),
      nhieu=[L('她是王一雪的妹妹。', 'Tā shì Wáng Yīxuě de mèimei.'), L('她很想姐姐。', 'Tā hěn xiǎng jiějie.'), L('她是中国人。', 'Tā shì Zhōngguó rén.')]),
],
4: [
 dict(hoi=L('王一雪有几个哥哥？', 'Wáng Yīxuě yǒu jǐ ge gēge?', 'Vương Nhất Tuyết có mấy anh trai?'),
      dap=L('她有两个哥哥。', 'Tā yǒu liǎng ge gēge.', 'Cô ấy có hai anh trai.'),
      nhieu=[L('她是杨同乐的同事。', 'Tā shì Yáng Tónglè de tóngshì.'), L('她很忙。', 'Tā hěn máng.'), L('她是中国人。', 'Tā shì Zhōngguó rén.')]),
 dict(hoi=L('杨同乐家有几口人？', 'Yáng Tónglè jiā yǒu jǐ kǒu rén?', 'Nhà Dương Đồng Lạc có mấy người?'),
      dap=L('他家有四口人。', 'Tā jiā yǒu sì kǒu rén.', 'Nhà anh ấy có bốn người.'),
      nhieu=[L('他没有哥哥。', 'Tā méi·yǒu gēge.'), L('他是王一雪的同事。', 'Tā shì Wáng Yīxuě de tóngshì.'), L('他很忙。', 'Tā hěn máng.')]),
 dict(hoi=L('杨同乐有没有哥哥？', 'Yáng Tónglè yǒu méi·yǒu gēge?', 'Dương Đồng Lạc có anh trai không?'),
      dap=L('没有，他没有哥哥。', 'Méi·yǒu, tā méi·yǒu gēge.', 'Không, anh ấy không có anh trai.'),
      nhieu=[L('他家有四口人。', 'Tā jiā yǒu sì kǒu rén.'), L('他是王一雪的同事。', 'Tā shì Wáng Yīxuě de tóngshì.'), L('他很忙。', 'Tā hěn máng.')]),
 dict(hoi=L('王一雪的儿子几岁？', 'Wáng Yīxuě de érzi jǐ suì?', 'Con trai của Vương Nhất Tuyết mấy tuổi?'),
      dap=L('他今年五岁。', 'Tā jīnnián wǔ suì.', 'Năm nay cậu bé năm tuổi.'),
      nhieu=[L('王一雪有两个孩子。', 'Wáng Yīxuě yǒu liǎng ge háizi.'), L('他是王一雪的儿子。', 'Tā shì Wáng Yīxuě de érzi.'), L('他很好。', 'Tā hěn hǎo.')]),
 dict(hoi=L('一飞有多少个学生？', 'Yīfēi yǒu duōshao ge xué·shēng?', 'Nhất Phi có bao nhiêu học sinh?'),
      dap=L('她有二十个学生。', 'Tā yǒu èrshí ge xué·shēng.', 'Cô ấy có hai mươi học sinh.'),
      nhieu=[L('她很忙。', 'Tā hěn máng.'), L('她是中文老师。', 'Tā shì Zhōngwén lǎoshī.'), L('她的学生很好。', 'Tā de xué·shēng hěn hǎo.')]),
],
}

# ---------- Hội thoại bài khóa: lượt [chữ, pinyin, nghĩa]; nhieu {chỉ số lượt đáp: [[chữ, pinyin]×3]} ----------
HT = {
1: [
 dict(ten='Bài khóa · Chào cô Vương', luot=[L('小语，你好！', 'Xiǎoyǔ, nǐ hǎo!', 'Chào Tiểu Ngữ!'), L('王老师，你好！', 'Wáng lǎoshī, nǐ hǎo!', 'Em chào cô Vương ạ!')],
      nhieu={1: [L('谢谢！', 'Xièxie!'), L('再见！', 'Zàijiàn!'), L('不客气！', 'Bú kèqi!')]}),
 dict(ten='Bài khóa · Chào cả lớp', luot=[L('大家好！', 'Dàjiā hǎo!', 'Chào mọi người!'), L('老师，您好！', 'Lǎoshī, nín hǎo!', 'Chúng em chào cô ạ!'),
      L('你们好！', 'Nǐmen hǎo!', 'Chào các bạn!'), L('你好，小语！', 'Nǐ hǎo, Xiǎoyǔ!', 'Chào Tiểu Ngữ!')],
      nhieu={1: [L('不客气！', 'Bú kèqi!'), L('再见！', 'Zàijiàn!'), L('谢谢你们！', 'Xièxie nǐmen!')], 3: [L('谢谢！', 'Xièxie!'), L('老师，再见！', 'Lǎoshī, zàijiàn!'), L('不客气！', 'Bú kèqi!')]}),
 dict(ten='Bài khóa · Cảm ơn và tạm biệt', luot=[L('谢谢！', 'Xièxie!', 'Cảm ơn!'), L('不客气！', 'Bú kèqi!', 'Không có gì!'),
      L('同学们，再见！', 'Tóngxuémen, zàijiàn!', 'Tạm biệt các em!'), L('老师，再见！', 'Lǎoshī, zàijiàn!', 'Chúng em chào cô ạ!')],
      nhieu={1: [L('你好！', 'Nǐ hǎo!'), L('再见！', 'Zàijiàn!'), L('大家好！', 'Dàjiā hǎo!')], 3: [L('不客气！', 'Bú kèqi!'), L('谢谢！', 'Xièxie!'), L('你们好！', 'Nǐmen hǎo!')]}),
],
2: [
 dict(ten='Bài khóa · Hỏi tên', luot=[L('请问，你叫什么名字？', 'Qǐngwèn, nǐ jiào shénme míngzi?', 'Xin hỏi, em tên là gì?'), L('我叫陈天中。', 'Wǒ jiào Chén Tiānzhōng.', 'Em tên là Trần Thiên Trung.')],
      nhieu={1: [L('我不认识陈天中。', 'Wǒ bú rènshi Chén Tiānzhōng.'), L('没关系！', 'Méi guānxi!'), L('我也很高兴。', 'Wǒ yě hěn gāoxìng.')]}),
 dict(ten='Bài khóa · Nhầm tên', luot=[L('你好，安妮！', 'Nǐ hǎo, Ānnī!', 'Chào Annie!'),
      L('你好，陈天中！我不是安妮，我是白家月。', 'Nǐ hǎo, Chén Tiānzhōng! Wǒ bú shì Ānnī, wǒ shì Bái Jiāyuè.', 'Chào Trần Thiên Trung! Mình không phải là Annie, mình là Bạch Gia Nguyệt.'),
      L('对不起！', 'Duìbuqǐ!', 'Xin lỗi!'), L('没关系！', 'Méi guānxi!', 'Không sao!')],
      nhieu={1: [L('没关系！', 'Méi guānxi!'), L('不客气！', 'Bú kèqi!'), L('请坐！', 'Qǐng zuò!')],
             3: [L('对不起！', 'Duìbuqǐ!'), L('很高兴认识你。', 'Hěn gāoxìng rènshi nǐ.'), L('我叫白家月。', 'Wǒ jiào Bái Jiāyuè.')]}),
 dict(ten='Bài khóa · Làm quen', luot=[L('你好！我叫李文。', 'Nǐ hǎo! Wǒ jiào Lǐ Wén.', 'Chào bạn! Mình tên là Lý Văn.'), L('你好！我叫白家月。', 'Nǐ hǎo! Wǒ jiào Bái Jiāyuè.', 'Chào bạn! Mình tên là Bạch Gia Nguyệt.'),
      L('很高兴认识你。', 'Hěn gāoxìng rènshi nǐ.', 'Rất vui được làm quen với bạn.'), L('认识你我也很高兴。', 'Rènshi nǐ wǒ yě hěn gāoxìng.', 'Làm quen với bạn mình cũng rất vui.')],
      nhieu={1: [L('没关系！', 'Méi guānxi!'), L('对不起！', 'Duìbuqǐ!'), L('不客气！', 'Bú kèqi!')],
             3: [L('对不起！', 'Duìbuqǐ!'), L('你叫什么名字？', 'Nǐ jiào shénme míngzi?'), L('我不是李文。', 'Wǒ bú shì Lǐ Wén.')]}),
],
3: [
 dict(ten='Bài khóa · Bạn gái của Thiên Trung', luot=[L('这是谁？', 'Zhè shì shéi?', 'Đây là ai?'), L('这是我女朋友。', 'Zhè shì wǒ nǚpéngyou.', 'Đây là bạn gái mình.'),
      L('你女朋友是哪国人？', 'Nǐ nǚpéngyou shì nǎ guó rén?', 'Bạn gái của bạn là người nước nào?'), L('她也是泰国人。', 'Tā yě shì Tàiguó rén.', 'Cô ấy cũng là người Thái Lan.')],
      nhieu={1: [L('我是中国人。', 'Wǒ shì Zhōngguó rén.'), L('她很忙。', 'Tā hěn máng.'), L('我想去泰国。', 'Wǒ xiǎng qù Tàiguó.')],
             3: [L('这是我女朋友。', 'Zhè shì wǒ nǚpéngyou.'), L('她很忙。', 'Tā hěn máng.'), L('她想去中国。', 'Tā xiǎng qù Zhōngguó.')]}),
 dict(ten='Bài khóa · Gọi điện cho em gái', luot=[L('喂，一飞！', 'Wèi, Yīfēi!', 'A lô, Nhất Phi à!'), L('姐姐！', 'Jiějie!', 'Chị ơi!'),
      L('你工作还忙吗？', 'Nǐ gōngzuò hái máng ma?', 'Công việc của em vẫn bận à?'), L('对，还很忙。你也很忙吗？', 'Duì, hái hěn máng. Nǐ yě hěn máng ma?', 'Vâng, vẫn rất bận. Chị cũng rất bận à?'),
      L('我不太忙。我们很想你。', 'Wǒ bú tài máng. Wǒmen hěn xiǎng nǐ.', 'Chị không bận lắm. Mọi người rất nhớ em.'), L('我也想你们。', 'Wǒ yě xiǎng nǐmen.', 'Em cũng nhớ mọi người.')],
      nhieu={1: [L('对，还很忙。', 'Duì, hái hěn máng.'), L('我也想你们。', 'Wǒ yě xiǎng nǐmen.'), L('不太忙。', 'Bú tài máng.')],
             3: [L('姐姐！', 'Jiějie!'), L('我也想你们。', 'Wǒ yě xiǎng nǐmen.'), L('我是中国人。', 'Wǒ shì Zhōngguó rén.')],
             4: [L('对，还很忙。', 'Duì, hái hěn máng.'), L('喂，一飞！', 'Wèi, Yīfēi!'), L('她是我姐姐。', 'Tā shì wǒ jiějie.')],
             5: [L('姐姐！', 'Jiějie!'), L('我不太忙。', 'Wǒ bú tài máng.'), L('你工作还忙吗？', 'Nǐ gōngzuò hái máng ma?')]}),
],
4: [
 dict(ten='Bài khóa · Nhất Phi có bận không', luot=[L('一飞忙吗？', 'Yīfēi máng ma?', 'Nhất Phi có bận không?'), L('她很忙。', 'Tā hěn máng.', 'Cô ấy rất bận.'),
      L('她有多少个学生？', 'Tā yǒu duōshao ge xué·shēng?', 'Cô ấy có bao nhiêu học sinh?'), L('她有二十个学生。', 'Tā yǒu èrshí ge xué·shēng.', 'Cô ấy có hai mươi học sinh.')],
      nhieu={1: [L('她有二十个学生。', 'Tā yǒu èrshí ge xué·shēng.'), L('她是我妹妹。', 'Tā shì wǒ mèimei.'), L('她是中文老师。', 'Tā shì Zhōngwén lǎoshī.')],
             3: [L('她很忙。', 'Tā hěn máng.'), L('她是中文老师。', 'Tā shì Zhōngwén lǎoshī.'), L('她没有孩子。', 'Tā méi·yǒu háizi.')]}),
 dict(ten='Bài khóa · Gia đình Đồng Lạc', luot=[L('我有两个哥哥，你呢？', 'Wǒ yǒu liǎng ge gēge, nǐ ne?', 'Tôi có hai anh trai, còn anh?'), L('我没有哥哥。', 'Wǒ méi·yǒu gēge.', 'Tôi không có anh trai.'),
      L('你家有几口人？', 'Nǐ jiā yǒu jǐ kǒu rén?', 'Nhà anh có mấy người?'), L('我家有四口人，爸爸、妈妈、妹妹和我。', 'Wǒ jiā yǒu sì kǒu rén, bàba, māma, mèimei hé wǒ.', 'Nhà tôi có bốn người: bố, mẹ, em gái và tôi.')],
      nhieu={1: [L('我家有四口人。', 'Wǒ jiā yǒu sì kǒu rén.'), L('我是中国人。', 'Wǒ shì Zhōngguó rén.'), L('我今年二十岁。', 'Wǒ jīnnián èrshí suì.')],
             3: [L('我没有哥哥。', 'Wǒ méi·yǒu gēge.'), L('我有一个妹妹。', 'Wǒ yǒu yí ge mèimei.'), L('我是王一雪的同事。', 'Wǒ shì Wáng Yīxuě de tóngshì.')]}),
 dict(ten='Bài khóa · Con của chị Nhất Tuyết', luot=[L('这是您儿子吗？', 'Zhè shì nín érzi ma?', 'Đây là con trai chị à?'),
      L('是的。我有两个孩子，一个儿子，一个女儿。', "Shì de. Wǒ yǒu liǎng ge háizi, yí ge érzi, yí ge nǚ'ér.", 'Đúng vậy. Tôi có hai người con, một con trai, một con gái.'),
      L('您儿子几岁？', 'Nín érzi jǐ suì?', 'Con trai chị mấy tuổi?'), L('他今年五岁。', 'Tā jīnnián wǔ suì.', 'Năm nay cháu năm tuổi.'),
      L('您女儿多大？', "Nín nǚ'ér duō dà?", 'Con gái chị bao nhiêu tuổi?'), L('她今年十二。', "Tā jīnnián shí'èr.", 'Năm nay cháu mười hai.')],
      nhieu={1: [L('他今年五岁。', 'Tā jīnnián wǔ suì.'), L('我没有哥哥。', 'Wǒ méi·yǒu gēge.'), L('我是老师。', 'Wǒ shì lǎoshī.')],
             3: [L('我有两个孩子。', 'Wǒ yǒu liǎng ge háizi.'), L('他是我儿子。', 'Tā shì wǒ érzi.'), L('他很好。', 'Tā hěn hǎo.')],
             5: [L('她是我女儿。', 'Tā shì wǒ nǚ\'ér.'), L('我有一个女儿。', 'Wǒ yǒu yí ge nǚ\'ér.'), L('她很好。', 'Tā hěn hǎo.')]}),
],
}


def von(n): return set(''.join(CHU[k] for k in CHU if k <= n)) | set(TEN_RIENG)


def kiem():
    from pypinyin import lazy_pinyin
    loi = []
    def ck(n, s, py=None, nhan=''):
        ng = [c for c in han(s) if c not in von(n)]
        if ng: loi.append(f'B{n} {nhan}: chữ ngoài vốn {ng} :: {s}')
        if py is not None:
            a = strip(''.join(lazy_pinyin(c)[0] for c in han(s)))
            if a != strip(py): loi.append(f'B{n} {nhan}: pinyin lệch :: {s} | {py}')
    for n, ds in CAU.items():
        for c in ds: ck(n, c[0], c[1], 'câu')
    for n, ds in HD.items():
        for h in ds:
            ck(n, h['hoi'][0], h['hoi'][1], 'hỏi'); ck(n, h['dap'][0], h['dap'][1], 'đáp')
            for x in h['nhieu']: ck(n, x[0], x[1], 'nhiễu')
    for n, ds in HT.items():
        for h in ds:
            for x in h['luot']: ck(n, x[0], x[1], 'lượt')
            for k, xs in h['nhieu'].items():
                if k >= len(h['luot']): loi.append(f'B{n}: lượt nhiễu {k} ngoài hội thoại {h["ten"]}')
                for x in xs:
                    ck(n, x[0], x[1], 'nhiễu HT')
                    if x[0] == h['luot'][k][0]: loi.append(f'B{n}: nhiễu trùng đáp án {x[0]}')
    for l in loi: print('  ✗', l)
    print('Lỗi:', len(loi)); return loi


def boDau(s): return re.sub(r'[，。？！、：\s]', '', s)


def gop():
    if kiem(): sys.exit('Còn lỗi, chưa ghi.')
    for n in (1, 2, 3, 4):
        tep = os.path.join(GOC, 'data', 'bai', f'bai-{n}.json')
        d = json.load(open(tep, encoding='utf-8'))
        tuBai = [w['Chữ Hán'] for w in d['tu']]
        chang = d.get('chang') or []
        def changCua(*cau):                                        # chặng sớm nhất mà mọi từ của bài trong câu đã học
            s = ''.join(cau); can = [t for t in tuBai if t in s]
            for c in chang:
                pass
            hoc = []
            for c in chang:
                hoc += c['tu']
                if all(t in hoc for t in can): return str(c['so'])
            return None
        def tuTrong(s):                                            # từ của bài có trong câu (bỏ từ chỉ nằm trong từ dài hơn)
            co = [t for t in tuBai if t in s]
            return [t for t in co if not any(t != u and t in u and s.count(t) == s.count(u) for u in co)]
        # kho câu luyện: bỏ câu cũ đề xuất bỏ + câu bài khóa lần trước, thêm lại (không trùng câu đã có ở thẻ, kho)
        cl = [c for c in d.get('cauLuyen', []) if c.get('nguon') != 'baiKhoa' and c['han'] not in BO_CAU.get(n, [])]
        daCo = {boDau(c['han']) for c in cl}
        for w in d['tu']:
            for k in ('Câu 1', 'Câu 2'):
                for dong in (w.get(k) or '').split('\n'): daCo.add(boDau(re.sub(r'^[AB]：', '', dong)))
        for g in d.get('nguPhap', []):
            for y in g['y']:
                for v in y['viDu']: daCo.add(boDau(v[0]))
        them = 0
        for h, py, vi, np in CAU.get(n, []):
            if boDau(h) in daCo: continue
            o = {'han': h, 'py': py, 'viet': vi, 'tu': tuTrong(h), 'nguon': 'baiKhoa'}
            if np: o['np'] = np
            cl.append(o); daCo.add(boDau(h)); them += 1
        d['cauLuyen'] = cl
        # hỏi – đáp
        hd = [h for h in d.get('hoiDap', []) if h.get('nguon') != 'baiKhoa']
        hoiCo = {h['hoi'][0] for h in hd}
        for h in HD.get(n, []):
            if h['hoi'][0] in hoiCo: continue
            o = dict(h, nguon='baiKhoa'); c = changCua(h['hoi'][0], h['dap'][0])
            if c: o['chang'] = c
            hd.append(o)
        d['hoiDap'] = hd
        # hội thoại
        ht = [h for h in d.get('hoiThoai', []) if h.get('nguon') != 'baiKhoa']
        for h in HT.get(n, []):
            o = {'ten': h['ten'], 'luot': [{'han': x[0], 'py': x[1], 'viet': x[2]} for x in h['luot']],
                 'nhieu': {str(k): [{'han': x[0], 'py': x[1]} for x in v] for k, v in h['nhieu'].items()}, 'nguon': 'baiKhoa'}
            c = changCua(*[x[0] for x in h['luot']])
            if c: o['chang'] = c
            ht.append(o)
        d['hoiThoai'] = ht
        open(tep, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n')
        print(f'Bài {n}: +{them} câu luyện, +{len(HD.get(n, []))} hỏi – đáp, +{len(HT.get(n, []))} hội thoại (bỏ {len(BO_CAU.get(n, []))} câu cũ)')


if __name__ == '__main__':
    {'kiem': kiem, 'gop': gop}.get(sys.argv[1] if len(sys.argv) > 1 else 'kiem', kiem)()
