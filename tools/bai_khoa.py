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
5: [
 ['今天九月八号。', 'Jīntiān jiǔ yuè bā hào.', 'Hôm nay ngày 8 tháng 9.', 'ngayThang'],
 ['今天星期日，刘明休息。', 'Jīntiān xīngqīrì, Liú Míng xiūxi.', 'Hôm nay chủ nhật, Lưu Minh nghỉ.', 'vnDanhTu'],
 ['杨同乐会做面条儿和饺子。', 'Yáng Tónglè huì zuò miàntiáor hé jiǎozi.', 'Dương Đồng Lạc biết làm mì và sủi cảo.', 'hui', '杨同乐会做面条和饺子。'],
 ['我会做面条儿、饺子，也会做一些菜。', 'Wǒ huì zuò miàntiáor, jiǎozi, yě huì zuò yìxiē cài.', 'Tôi biết làm mì, sủi cảo, cũng biết nấu vài món.', 'yixie', '我会做面条、饺子，也会做一些菜。'],
 ['星期天杨同乐也做饭。', 'Xīngqītiān Yáng Tónglè yě zuò fàn.', 'Chủ nhật Dương Đồng Lạc cũng nấu cơm.', 'trangNgu'],
 ['同乐，下班吗？', 'Tónglè, xiàbān ma?', 'Đồng Lạc, tan làm chưa?', ''],
 ['这是你的新电脑吗？', 'Zhè shì nǐ de xīn diànnǎo ma?', 'Đây là máy tính mới của anh à?', ''],
 ['是的，是我的新电脑。', 'Shì de, shì wǒ de xīn diànnǎo.', 'Đúng vậy, là máy tính mới của tôi.', ''],
 ['同乐的新电脑真好看！', 'Tónglè de xīn diànnǎo zhēn hǎokàn!', 'Máy tính mới của Đồng Lạc đẹp thật!', 'zhen'],
 ['我也很喜欢它。', 'Wǒ yě hěn xǐhuan tā.', 'Tôi cũng rất thích nó.', ''],
],
6: [
 ['家月，你的手机号是多少？', 'Jiāyuè, nǐ de shǒujī hào shì duōshao?', 'Gia Nguyệt, số điện thoại di động của bạn là bao nhiêu?', 'soDT'],
 ['家月，明天你去哪儿？', 'Jiāyuè, míngtiān nǐ qù nǎr?', 'Gia Nguyệt, ngày mai bạn đi đâu?', ''],
 ['我想去超市买东西。', 'Wǒ xiǎng qù chāoshì mǎi dōngxi.', 'Tôi muốn đi siêu thị mua đồ.', 'lienDong'],
 ['白家月想去超市买牛奶。', 'Bái Jiāyuè xiǎng qù chāoshì mǎi niúnǎi.', 'Bạch Gia Nguyệt muốn đi siêu thị mua sữa.', 'lienDong'],
 ['我想买些牛奶。', 'Wǒ xiǎng mǎi xiē niúnǎi.', 'Tôi muốn mua một ít sữa.', 'xie'],
 ['星期天我们去哪儿吃晚饭？', 'Xīngqītiān wǒmen qù nǎr chī wǎnfàn?', 'Chủ nhật chúng ta đi đâu ăn tối?', 'lienDong'],
 ['那边的包子非常好吃，我想吃包子。', 'Nàbiān de bāozi fēicháng hǎochī, wǒ xiǎng chī bāozi.', 'Bánh bao ở bên kia vô cùng ngon, con muốn ăn bánh bao.', 'feichang'],
 ['好的。我们怎么去？', 'Hǎo de. Wǒmen zěnme qù?', 'Được rồi. Chúng ta đi bằng cách nào?', 'zenme'],
 ['坐出租车去。', 'Zuò chūzūchē qù.', 'Đi bằng taxi.', 'lienDong'],
 ['刘小明想吃米饭，不想吃包子。', 'Liú Xiǎomíng xiǎng chī mǐfàn, bù xiǎng chī bāozi.', 'Lưu Tiểu Minh muốn ăn cơm, không muốn ăn bánh bao.', 'xiang'],
],
7: [
 ['现在几点？', 'Xiànzài jǐ diǎn?', 'Bây giờ là mấy giờ?', 'gio'],
 ['现在早上八点四十。', 'Xiànzài zǎoshang bā diǎn sìshí.', 'Bây giờ là 8 giờ 40 sáng.', 'gio'],
 ['我上午十点十分有课。', 'Wǒ shàngwǔ shí diǎn shí fēn yǒu kè.', 'Sáng nay 10 giờ 10 phút tôi có tiết.', 'gio'],
 ['白家月上午十点有课。', 'Bái Jiāyuè shàngwǔ shí diǎn yǒu kè.', 'Sáng nay 10 giờ Bạch Gia Nguyệt có tiết.', 'gio'],
 ['好的，我们下午两点见吧。', 'Hǎo de, wǒmen xiàwǔ liǎng diǎn jiàn ba.', 'Được, chúng ta 2 giờ chiều gặp nhau nhé.', 'ba'],
 ['下午我想去电影院看电影，你去吗？', 'Xiàwǔ wǒ xiǎng qù diànyǐngyuàn kàn diànyǐng, nǐ qù ma?', 'Chiều nay mình muốn đi rạp xem phim, bạn đi không?', ''],
 ['我不想去，下午还有事。', 'Wǒ bù xiǎng qù, xiàwǔ hái yǒu shì.', 'Mình không muốn đi, chiều còn có việc.', ''],
 ['我明天下午两点还上课呢，四点半下课。', 'Wǒ míngtiān xiàwǔ liǎng diǎn hái shàngkè ne, sì diǎn bàn xiàkè.', 'Hai giờ chiều mai mình còn có tiết đấy, 4 rưỡi tan học.', 'ne'],
 ['喂，你在哪儿呢？', 'Wèi, nǐ zài nǎr ne?', 'A lô, bạn đang ở đâu thế?', 'zaiDong'],
 ['我在家里呢。', 'Wǒ zài jiā li ne.', 'Mình đang ở nhà đây.', 'zaiDong'],
 ['我八点去医院上班，我晚上六点半下班。', 'Wǒ bā diǎn qù yīyuàn shàngbān, wǒ wǎnshang liù diǎn bàn xiàbān.', 'Mình 8 giờ đến bệnh viện làm việc, 6 rưỡi tối tan làm.', 'gio'],
 ['好的，你去店里买些菜吧。', 'Hǎo de, nǐ qù diàn li mǎi xiē cài ba.', 'Được, bạn vào tiệm mua ít rau đi.', 'ba'],
 ['好，我十分钟后去。', 'Hǎo, wǒ shí fēnzhōng hòu qù.', 'Được, 10 phút nữa mình đi.', 'qianhou'],
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
5: [
 dict(hoi=L('刘明今天休息吗？', 'Liú Míng jīntiān xiūxi ma?', 'Hôm nay Lưu Minh có nghỉ không?'), dap=L('休息，今天星期日。', 'Xiūxi, jīntiān xīngqīrì.', 'Có nghỉ, hôm nay chủ nhật.'),
      nhieu=[L('他是刘明。', 'Tā shì Liú Míng.'), L('他会做饭。', 'Tā huì zuò fàn.'), L('他是王一雪的同事。', 'Tā shì Wáng Yīxuě de tóngshì.')]),
 dict(hoi=L('杨同乐会做什么？', 'Yáng Tónglè huì zuò shénme?', 'Dương Đồng Lạc biết làm gì?'), dap=L('他会做面条儿、饺子，也会做一些菜。', 'Tā huì zuò miàntiáor, jiǎozi, yě huì zuò yìxiē cài.', 'Anh ấy biết làm mì, sủi cảo, cũng biết nấu vài món.'),
      nhieu=[L('他星期天也做饭。', 'Tā xīngqītiān yě zuò fàn.'), L('他喜欢吃饺子。', 'Tā xǐhuan chī jiǎozi.'), L('他是王一雪的同事。', 'Tā shì Wáng Yīxuě de tóngshì.')]),
 dict(hoi=L('杨同乐星期天做饭吗？', 'Yáng Tónglè xīngqītiān zuò fàn ma?', 'Chủ nhật Dương Đồng Lạc có nấu cơm không?'), dap=L('做，星期天他也做饭。', 'Zuò, xīngqītiān tā yě zuò fàn.', 'Có, chủ nhật anh ấy cũng nấu cơm.'),
      nhieu=[L('他是杨同乐。', 'Tā shì Yáng Tónglè.'), L('今天星期天。', 'Jīntiān xīngqītiān.'), L('他有新电脑。', 'Tā yǒu xīn diànnǎo.')]),
 dict(hoi=L('他们下班吗？', 'Tāmen xiàbān ma?', 'Họ tan làm chưa?'), dap=L('他们下班。', 'Tāmen xiàbān.', 'Họ tan làm.'),
      nhieu=[L('他们是同事。', 'Tāmen shì tóngshì.'), L('他们有电脑。', 'Tāmen yǒu diànnǎo.'), L('他们是中国人。', 'Tāmen shì Zhōngguó rén.')]),
 dict(hoi=L('这是谁的新电脑？', 'Zhè shì shéi de xīn diànnǎo?', 'Đây là máy tính mới của ai?'), dap=L('这是同乐的新电脑。', 'Zhè shì Tónglè de xīn diànnǎo.', 'Đây là máy tính mới của Đồng Lạc.'),
      nhieu=[L('这是电脑。', 'Zhè shì diànnǎo.'), L('电脑真好看！', 'Diànnǎo zhēn hǎokàn!'), L('同乐很喜欢电脑。', 'Tónglè hěn xǐhuan diànnǎo.')]),
 dict(hoi=L('同乐喜欢他的电脑吗？', 'Tónglè xǐhuan tā de diànnǎo ma?', 'Đồng Lạc có thích máy tính của mình không?'), dap=L('他很喜欢。', 'Tā hěn xǐhuan.', 'Anh ấy rất thích.'),
      nhieu=[L('他有电脑。', 'Tā yǒu diànnǎo.'), L('这是他的电脑。', 'Zhè shì tā de diànnǎo.'), L('他会说汉语。', 'Tā huì shuō Hànyǔ.')]),
],
6: [
 dict(hoi=L('李文问白家月什么？', 'Lǐ Wén wèn Bái Jiāyuè shénme?', 'Lý Văn hỏi Bạch Gia Nguyệt điều gì?'), dap=L('他问白家月的手机号是多少。', 'Tā wèn Bái Jiāyuè de shǒujī hào shì duōshao.', 'Anh ấy hỏi số điện thoại di động của Bạch Gia Nguyệt là bao nhiêu.'),
      nhieu=[L('他是白家月的同学。', 'Tā shì Bái Jiāyuè de tóngxué.'), L('他想去超市。', 'Tā xiǎng qù chāoshì.'), L('他有一个新手机。', 'Tā yǒu yí ge xīn shǒujī.')]),
 dict(hoi=L('白家月明天去哪儿？', 'Bái Jiāyuè míngtiān qù nǎr?', 'Ngày mai Bạch Gia Nguyệt đi đâu?'), dap=L('她想去超市买东西。', 'Tā xiǎng qù chāoshì mǎi dōngxi.', 'Cô ấy muốn đi siêu thị mua đồ.'),
      nhieu=[L('她是法国人。', 'Tā shì Fǎguó rén.'), L('明天星期六。', 'Míngtiān xīngqīliù.'), L('她喜欢喝牛奶。', 'Tā xǐhuan hē niúnǎi.')]),
 dict(hoi=L('白家月想买什么？', 'Bái Jiāyuè xiǎng mǎi shénme?', 'Bạch Gia Nguyệt muốn mua gì?'), dap=L('她想买些牛奶。', 'Tā xiǎng mǎi xiē niúnǎi.', 'Cô ấy muốn mua một ít sữa.'),
      nhieu=[L('她去超市。', 'Tā qù chāoshì.'), L('她很喜欢超市。', 'Tā hěn xǐhuan chāoshì.'), L('她是陈天中的同学。', 'Tā shì Chén Tiānzhōng de tóngxué.')]),
 dict(hoi=L('他们星期天去哪儿吃晚饭？', 'Tāmen xīngqītiān qù nǎr chī wǎnfàn?', 'Chủ nhật họ đi đâu ăn tối?'), dap=L('他们去西安饭店吃晚饭。', "Tāmen qù Xī'ān Fàndiàn chī wǎnfàn.", 'Họ đến nhà hàng Tây An ăn tối.'),
      nhieu=[L('他们星期天休息。', 'Tāmen xīngqītiān xiūxi.'), L('他们是一家人。', 'Tāmen shì yì jiā rén.'), L('他们想吃饺子。', 'Tāmen xiǎng chī jiǎozi.')]),
 dict(hoi=L('西安饭店的包子好吃吗？', "Xī'ān Fàndiàn de bāozi hǎochī ma?", 'Bánh bao của nhà hàng Tây An có ngon không?'), dap=L('非常好吃。', 'Fēicháng hǎochī.', 'Rất ngon.'),
      nhieu=[L('他们想吃米饭。', 'Tāmen xiǎng chī mǐfàn.'), L('那边有一家饭店。', 'Nàbiān yǒu yì jiā fàndiàn.'), L('我会做包子。', 'Wǒ huì zuò bāozi.')]),
 dict(hoi=L('刘小明想吃什么？', 'Liú Xiǎomíng xiǎng chī shénme?', 'Lưu Tiểu Minh muốn ăn gì?'), dap=L('他想吃米饭，不想吃包子。', 'Tā xiǎng chī mǐfàn, bù xiǎng chī bāozi.', 'Cậu ấy muốn ăn cơm, không muốn ăn bánh bao.'),
      nhieu=[L('他是刘明的儿子。', 'Tā shì Liú Míng de érzi.'), L('他很喜欢包子。', 'Tā hěn xǐhuan bāozi.'), L('他今年五岁。', 'Tā jīnnián wǔ suì.')]),
 dict(hoi=L('他们怎么去西安饭店？', "Tāmen zěnme qù Xī'ān Fàndiàn?", 'Họ đến nhà hàng Tây An bằng cách nào?'), dap=L('他们坐出租车去。', 'Tāmen zuò chūzūchē qù.', 'Họ đi taxi.'),
      nhieu=[L('他们去吃晚饭。', 'Tāmen qù chī wǎnfàn.'), L('西安饭店很大。', "Xī'ān Fàndiàn hěn dà."), L('他们很喜欢饭店。', 'Tāmen hěn xǐhuan fàndiàn.')]),
],
7: [
 dict(hoi=L('现在几点？', 'Xiànzài jǐ diǎn?', 'Bây giờ là mấy giờ?'), dap=L('现在早上八点四十。', 'Xiànzài zǎoshang bā diǎn sìshí.', 'Bây giờ là 8 giờ 40 sáng.'),
      nhieu=[L('现在是星期六。', 'Xiànzài shì xīngqīliù.'), L('我现在在家。', 'Wǒ xiànzài zài jiā.'), L('我有两节课。', 'Wǒ yǒu liǎng jié kè.')]),
 dict(hoi=L('白家月上午几点有课？', 'Bái Jiāyuè shàngwǔ jǐ diǎn yǒu kè?', 'Sáng nay mấy giờ Bạch Gia Nguyệt có tiết?'), dap=L('她上午十点有课。', 'Tā shàngwǔ shí diǎn yǒu kè.', 'Cô ấy 10 giờ sáng có tiết.'),
      nhieu=[L('她是美国人。', 'Tā shì Měiguó rén.'), L('她下午有事。', 'Tā xiàwǔ yǒu shì.'), L('她很喜欢上课。', 'Tā hěn xǐhuan shàngkè.')]),
 dict(hoi=L('她们几点见？', 'Tāmen jǐ diǎn jiàn?', 'Mấy giờ hai bạn ấy gặp nhau?'), dap=L('她们下午两点见。', 'Tāmen xiàwǔ liǎng diǎn jiàn.', 'Hai bạn ấy 2 giờ chiều gặp nhau.'),
      nhieu=[L('她们是同学。', 'Tāmen shì tóngxué.'), L('她们都有课。', 'Tāmen dōu yǒu kè.'), L('她们想去超市。', 'Tāmen xiǎng qù chāoshì.')]),
 dict(hoi=L('李文下午想去哪儿？', 'Lǐ Wén xiàwǔ xiǎng qù nǎr?', 'Chiều nay Lý Văn muốn đi đâu?'), dap=L('他想去电影院看电影。', 'Tā xiǎng qù diànyǐngyuàn kàn diànyǐng.', 'Anh ấy muốn đi rạp xem phim.'),
      nhieu=[L('他想去超市。', 'Tā xiǎng qù chāoshì.'), L('他是中国人。', 'Tā shì Zhōngguó rén.'), L('他明天有课。', 'Tā míngtiān yǒu kè.')]),
 dict(hoi=L('白家月明天下午几点下课？', 'Bái Jiāyuè míngtiān xiàwǔ jǐ diǎn xiàkè?', 'Chiều mai mấy giờ Bạch Gia Nguyệt tan học?'), dap=L('她四点半下课。', 'Tā sì diǎn bàn xiàkè.', 'Cô ấy 4 rưỡi tan học.'),
      nhieu=[L('她下午两点上课。', 'Tā xiàwǔ liǎng diǎn shàngkè.'), L('她很喜欢上课。', 'Tā hěn xǐhuan shàngkè.'), L('她是学生。', 'Tā shì xuésheng.')]),
 dict(hoi=L('刘明现在在哪儿？', 'Liú Míng xiànzài zài nǎr?', 'Bây giờ Lưu Minh ở đâu?'), dap=L('他在家里。', 'Tā zài jiā li.', 'Anh ấy ở nhà.'),
      nhieu=[L('他在医院。', 'Tā zài yīyuàn.'), L('他是医生。', 'Tā shì yīshēng.'), L('他想去店里。', 'Tā xiǎng qù diàn li.')]),
 dict(hoi=L('刘明几点去医院上班？', 'Liú Míng jǐ diǎn qù yīyuàn shàngbān?', 'Lưu Minh mấy giờ đến bệnh viện làm việc?'), dap=L('他八点去医院上班。', 'Tā bā diǎn qù yīyuàn shàngbān.', 'Anh ấy 8 giờ đến bệnh viện làm việc.'),
      nhieu=[L('他在家里。', 'Tā zài jiā li.'), L('他晚上下班。', 'Tā wǎnshang xiàbān.'), L('他有一个朋友。', 'Tā yǒu yí ge péngyou.')]),
 dict(hoi=L('王一雪几点下班？', 'Wáng Yīxuě jǐ diǎn xiàbān?', 'Vương Nhất Tuyết mấy giờ tan làm?'), dap=L('她晚上六点半下班。', 'Tā wǎnshang liù diǎn bàn xiàbān.', 'Cô ấy 6 rưỡi tối tan làm.'),
      nhieu=[L('她早上八点上班。', 'Tā zǎoshang bā diǎn shàngbān.'), L('她在家里。', 'Tā zài jiā li.'), L('她很忙。', 'Tā hěn máng.')]),
 dict(hoi=L('刘明十分钟后去做什么？', 'Liú Míng shí fēnzhōng hòu qù zuò shénme?', 'Mười phút nữa Lưu Minh đi làm gì?'), dap=L('他去店里买菜。', 'Tā qù diàn li mǎi cài.', 'Anh ấy vào tiệm mua rau.'),
      nhieu=[L('他去医院上班。', 'Tā qù yīyuàn shàngbān.'), L('他在家里做饭。', 'Tā zài jiā li zuò fàn.'), L('他想去看电影。', 'Tā xiǎng qù kàn diànyǐng.')]),
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
5: [
 dict(ten='Bài khóa · Hôm nay ngày mấy', luot=[L('今天几号？', 'Jīntiān jǐ hào?', 'Hôm nay ngày mấy?'), L('今天九月八号。', 'Jīntiān jiǔ yuè bā hào.', 'Hôm nay ngày 8 tháng 9.'),
      L('星期几？', 'Xīngqī jǐ?', 'Thứ mấy?'), L('星期日。今天我休息。', 'Xīngqīrì. Jīntiān wǒ xiūxi.', 'Chủ nhật. Hôm nay tôi nghỉ.')],
      nhieu={1: [L('今天星期日。', 'Jīntiān xīngqīrì.'), L('今天我休息。', 'Jīntiān wǒ xiūxi.'), L('我很好。', 'Wǒ hěn hǎo.')],
             3: [L('九月八号。', 'Jiǔ yuè bā hào.'), L('我会做饭。', 'Wǒ huì zuò fàn.'), L('我今年二十岁。', 'Wǒ jīnnián èrshí suì.')]}),
 dict(ten='Bài khóa · Đồng Lạc biết nấu ăn', luot=[L('你会做饭吗？', 'Nǐ huì zuò fàn ma?', 'Anh biết nấu cơm không?'), L('我会做。', 'Wǒ huì zuò.', 'Tôi biết nấu.'),
      L('你会做什么？', 'Nǐ huì zuò shénme?', 'Anh biết làm món gì?'),
      L('我会做面条儿、饺子，也会做一些菜。', 'Wǒ huì zuò miàntiáor, jiǎozi, yě huì zuò yìxiē cài.', 'Tôi biết làm mì, sủi cảo, cũng biết nấu vài món.')],
      nhieu={1: [L('我喜欢吃饭。', 'Wǒ xǐhuan chī fàn.'), L('我是杨同乐。', 'Wǒ shì Yáng Tónglè.'), L('我不想吃。', 'Wǒ bù xiǎng chī.')],
             3: [L('我会做。', 'Wǒ huì zuò.'), L('星期天我休息。', 'Xīngqītiān wǒ xiūxi.'), L('这些菜很好吃。', 'Zhèxiē cài hěn hǎochī.')]}),
 dict(ten='Bài khóa · Máy tính mới', luot=[L('这是你的新电脑吗？', 'Zhè shì nǐ de xīn diànnǎo ma?', 'Đây là máy tính mới của anh à?'),
      L('是的，是我的新电脑。', 'Shì de, shì wǒ de xīn diànnǎo.', 'Đúng vậy, là máy tính mới của tôi.'),
      L('真好看！', 'Zhēn hǎokàn!', 'Đẹp thật!'), L('我也很喜欢它。', 'Wǒ yě hěn xǐhuan tā.', 'Tôi cũng rất thích nó.')],
      nhieu={1: [L('我下班。', 'Wǒ xiàbān.'), L('我会做饭。', 'Wǒ huì zuò fàn.'), L('今天星期日。', 'Jīntiān xīngqīrì.')],
             3: [L('我不会做饭。', 'Wǒ bú huì zuò fàn.'), L('这是电脑。', 'Zhè shì diànnǎo.'), L('今天我休息。', 'Jīntiān wǒ xiūxi.')]}),
],
6: [
 dict(ten='Bài khóa · Hỏi số điện thoại', luot=[L('家月，你的手机号是多少？', 'Jiāyuè, nǐ de shǒujī hào shì duōshao?', 'Gia Nguyệt, số điện thoại di động của bạn là bao nhiêu?'),
      L('我的手机号是九八七六五四三二。', 'Wǒ de shǒujī hào shì jiǔ bā qī liù wǔ sì sān èr.', 'Số điện thoại di động của mình là 98765432.'), L('好的。', 'Hǎo de.', 'Được rồi.')],
      nhieu={1: [L('我的手机很新。', 'Wǒ de shǒujī hěn xīn.'), L('我想去超市。', 'Wǒ xiǎng qù chāoshì.'), L('明天星期六。', 'Míngtiān xīngqīliù.')]}),
 dict(ten='Bài khóa · Ngày mai đi siêu thị', luot=[L('家月，明天你去哪儿？', 'Jiāyuè, míngtiān nǐ qù nǎr?', 'Gia Nguyệt, ngày mai bạn đi đâu?'), L('我想去超市买东西。', 'Wǒ xiǎng qù chāoshì mǎi dōngxi.', 'Mình muốn đi siêu thị mua đồ.'),
      L('你去超市买什么？', 'Nǐ qù chāoshì mǎi shénme?', 'Bạn đi siêu thị mua gì?'), L('我想买些牛奶。', 'Wǒ xiǎng mǎi xiē niúnǎi.', 'Mình muốn mua một ít sữa.')],
      nhieu={1: [L('我想去中国。', 'Wǒ xiǎng qù Zhōngguó.'), L('明天我休息。', 'Míngtiān wǒ xiūxi.'), L('我很喜欢超市。', 'Wǒ hěn xǐhuan chāoshì.')],
             3: [L('我去超市。', 'Wǒ qù chāoshì.'), L('超市很大。', 'Chāoshì hěn dà.'), L('我不喝牛奶。', 'Wǒ bù hē niúnǎi.')]}),
 dict(ten='Bài khóa · Ăn tối ở nhà hàng', luot=[L('星期天我们去哪儿吃晚饭？', 'Xīngqītiān wǒmen qù nǎr chī wǎnfàn?', 'Chủ nhật chúng ta đi đâu ăn tối?'), L('我还想去西安饭店。', "Wǒ hái xiǎng qù Xī'ān Fàndiàn.", 'Con còn muốn đến nhà hàng Tây An.'),
      L('好的。我们怎么去？', 'Hǎo de. Wǒmen zěnme qù?', 'Được rồi. Chúng ta đi bằng cách nào?'), L('坐出租车去。', 'Zuò chūzūchē qù.', 'Đi bằng taxi.')],
      nhieu={1: [L('我想吃饺子。', 'Wǒ xiǎng chī jiǎozi.'), L('晚饭很好吃。', 'Wǎnfàn hěn hǎochī.'), L('我不想去。', 'Wǒ bù xiǎng qù.')],
             3: [L('我们去吃晚饭。', 'Wǒmen qù chī wǎnfàn.'), L('出租车很新。', 'Chūzūchē hěn xīn.'), L('饭店很大。', 'Fàndiàn hěn dà.')]}),
],
7: [
 dict(ten='Bài khóa · Hẹn gặp lúc 2 giờ chiều', luot=[L('现在几点？', 'Xiànzài jǐ diǎn?', 'Bây giờ là mấy giờ?'), L('现在早上八点四十。', 'Xiànzài zǎoshang bā diǎn sìshí.', 'Bây giờ là 8 giờ 40 sáng.'),
      L('我上午十点十分有课。', 'Wǒ shàngwǔ shí diǎn shí fēn yǒu kè.', 'Sáng nay 10 giờ 10 phút mình có tiết.'), L('好的，我们下午两点见吧。', 'Hǎo de, wǒmen xiàwǔ liǎng diǎn jiàn ba.', 'Được, chúng ta 2 giờ chiều gặp nhau nhé.')],
      nhieu={1: [L('现在是星期六。', 'Xiànzài shì xīngqīliù.'), L('我现在在家。', 'Wǒ xiànzài zài jiā.'), L('我想去超市。', 'Wǒ xiǎng qù chāoshì.')],
             3: [L('我很喜欢汉语课。', 'Wǒ hěn xǐhuan Hànyǔ kè.'), L('我不想去。', 'Wǒ bù xiǎng qù.'), L('明天我休息。', 'Míngtiān wǒ xiūxi.')]}),
 dict(ten='Bài khóa · Xem phim hay còn việc', luot=[L('下午我想去电影院看电影，你去吗？', 'Xiàwǔ wǒ xiǎng qù diànyǐngyuàn kàn diànyǐng, nǐ qù ma?', 'Chiều nay mình muốn đi rạp xem phim, bạn đi không?'),
      L('我不想去，下午还有事。', 'Wǒ bù xiǎng qù, xiàwǔ hái yǒu shì.', 'Mình không muốn đi, chiều còn có việc.'), L('好的。明天呢？', 'Hǎo de. Míngtiān ne?', 'Được. Còn ngày mai thì sao?'),
      L('我明天下午两点还上课呢，四点半下课。', 'Wǒ míngtiān xiàwǔ liǎng diǎn hái shàngkè ne, sì diǎn bàn xiàkè.', 'Hai giờ chiều mai mình còn có tiết đấy, 4 rưỡi tan học.')],
      nhieu={1: [L('我很喜欢看电影。', 'Wǒ hěn xǐhuan kàn diànyǐng.'), L('电影院很大。', 'Diànyǐngyuàn hěn dà.'), L('我在学校。', 'Wǒ zài xuéxiào.')],
             3: [L('明天我想去超市。', 'Míngtiān wǒ xiǎng qù chāoshì.'), L('明天是星期六。', 'Míngtiān shì xīngqīliù.'), L('我很想去。', 'Wǒ hěn xiǎng qù.')]}),
 dict(ten='Bài khóa · Đang ở đâu thế', luot=[L('喂，你在哪儿呢？', 'Wèi, nǐ zài nǎr ne?', 'A lô, bạn đang ở đâu thế?'), L('我在家里呢。我八点去医院上班。', 'Wǒ zài jiā li ne. Wǒ bā diǎn qù yīyuàn shàngbān.', 'Mình đang ở nhà. 8 giờ mình đến bệnh viện làm việc.'),
      L('我晚上六点半下班。', 'Wǒ wǎnshang liù diǎn bàn xiàbān.', 'Mình 6 rưỡi tối tan làm.'), L('好的，你去店里买些菜吧。', 'Hǎo de, nǐ qù diàn li mǎi xiē cài ba.', 'Được, bạn vào tiệm mua ít rau đi.'),
      L('好，我十分钟后去。', 'Hǎo, wǒ shí fēnzhōng hòu qù.', 'Được, 10 phút nữa mình đi.')],
      nhieu={1: [L('我在医院里呢。', 'Wǒ zài yīyuàn li ne.'), L('我不在家。', 'Wǒ bú zài jiā.'), L('我想去电影院。', 'Wǒ xiǎng qù diànyǐngyuàn.')],
             3: [L('我想吃饺子。', 'Wǒ xiǎng chī jiǎozi.'), L('我晚上还上课呢。', 'Wǒ wǎnshang hái shàngkè ne.'), L('我不想去。', 'Wǒ bù xiǎng qù.')]}),
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
            a = strip(''.join('ling' if c == '〇' else lazy_pinyin(c)[0] for c in han(s)))
            r = strip(''.join('ling' if c == '〇' else 'r' if c == '儿' else lazy_pinyin(c)[0] for c in han(s)))
            if strip(py) not in (a, r): loi.append(f'B{n} {nhan}: pinyin lệch :: {s} | {py}')
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


def gop(chi=None):
    # chi = danh sách bài cần ghi (python3 tools/bai_khoa.py gop 6 7); bỏ trống = mọi bài. Bài đã có giọng đọc (doc) thì CHỈ ghi lại khi cần,
    # vì ghi lại xoá trường doc đã ánh xạ giọng.
    if kiem(): sys.exit('Còn lỗi, chưa ghi.')
    for n in (chi or (1, 2, 3, 4, 5, 6, 7)):
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
        for h, py, vi, np, *dc in CAU.get(n, []):
            if boDau(h) in daCo: continue
            o = {'han': h, 'py': py, 'viet': vi, 'tu': tuTrong(h), 'nguon': 'baiKhoa'}
            if np: o['np'] = np
            if dc: o['doc'] = dc[0]                                # câu có 儿: bản đọc không 儿
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
    if len(sys.argv) > 1 and sys.argv[1] == 'gop': gop([int(x) for x in sys.argv[2:]] or None)
    else: kiem()
