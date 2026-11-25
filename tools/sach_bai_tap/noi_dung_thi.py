# -*- coding: utf-8 -*-
"""9 câu bổ sung cho tab "Thi thử trên máy" (HSK 3.0, Bài 4–9): 31 câu của sách bài tập (không tính ngữ âm) + 9 = 40 câu.
Câu soạn mới, chỉ dùng chữ đã học tới bài đó. Cô Nhiên duyệt trực tiếp trên web (25/11/2026).
Mỗi bài: n1..n4 = thêm vào 听力 phần 1–4, d4 = thêm vào 阅读 phần 4, anh3 = hai tranh E, F của 听力 phần 3.
"""
A = 'assets/img/sach-bai-tap/'
ALT = {'vd-doc-sach': 'Một cô gái đang đọc sách', 'b4-ong-ba': 'Hai ông bà', 'b4-vo-chong': 'Một đôi vợ chồng', 'b4-hai-be': 'Hai đứa trẻ',
 'b4-be-trai': 'Một bé trai đang cười', 'b4-dong-nghiep': 'Hai người làm việc ở văn phòng', 'b4-thay-giao': 'Thầy giáo đứng trên lớp',
 'b5-banh-mi': 'Bánh mì', 'b5-mi': 'Một bát mì', 'b5-goi-sui-cao': 'Gói sủi cảo', 'b5-nau-an': 'Một người đang nấu ăn', 'b5-may-tinh': 'Máy tính xách tay',
 'b5-nghi-ngoi': 'Một người đang nằm nghỉ', 'b5-sinh-nhat': 'Bánh sinh nhật cắm nến số 20', 'b6-taxi': 'Xe taxi', 'b6-xe-dap': 'Người đi xe đạp',
 'b6-tau-dien': 'Tàu điện ngầm', 'b6-sieu-thi': 'Xe đẩy hàng trong siêu thị', 'b6-dien-thoai': 'Một người đang gọi điện thoại',
 'b7-xem-phim': 'Rạp chiếu phim', 'b7-sach': 'Nhiều quyển sách', 'b7-truong': 'Một ngôi trường', 'b7-ly-tra': 'Một tách trà',
 'b8-ban': 'Cái bàn', 'b8-meo': 'Con mèo', 'b8-hieu-sach': 'Hiệu sách', 'b6-com': 'Một bát cơm', 'b9-ghe': 'Cái ghế', 'b9-tv': 'Cái ti vi',
 'b9-hat': 'Micro để hát'}

def an(ten, k): return {'k': k, 'src': A + ten + '.webp', 'alt': ALT[ten]}
def L(k, han, py): return {'k': k, 'han': han, 'py': py}
def l(han, py, ai=''): return {'ai': ai, 'han': han, 'py': py}
def N1(ma, han, py, ba, dap, vi):
    return {'ma': ma, 'loi': [l(han, py)], 'anh': [an(t, 'ABC'[i]) for i, t in enumerate(ba)], 'dap': dap, 'vi': vi}
def N2(ma, han, py, pa, dap, vi):
    return {'ma': ma, 'loi': [l(han, py)], 'pa': [L('ABC'[i], *p) for i, p in enumerate(pa)], 'dap': dap, 'vi': vi}
def N3(ma, a, b, dap, vi):
    return {'ma': ma, 'loi': [l(a[0], a[1], '男'), l(b[0], b[1], '女')], 'giong': ['nam1', 'nu1'], 'dap': dap, 'vi': vi}
def N4(ma, cau, hoi, pa, dap, vi):
    return {'ma': ma, 'loi': [l(*cau), l(hoi[0], hoi[1], '问')], 'giong': ['nam1', 'nu1'],
            'pa': [L('ABC'[i], *p) for i, p in enumerate(pa)], 'dap': dap, 'vi': vi}
def D4(ma, cau, hoi, pa, dap, vi):
    return {'ma': ma, 'han': cau[0], 'py': cau[1], 'hoi': {'han': hoi[0], 'py': hoi[1]},
            'pa': [L('ABC'[i], *p) for i, p in enumerate(pa)], 'dap': dap, 'vi': vi}

THEM = {
4: {
 'n1': [N1('n1-4', '爷爷和奶奶', 'yéye hé nǎinai', ['b4-ong-ba', 'b4-vo-chong', 'b4-hai-be'], 'A', 'ông nội và bà nội'),
        N1('n1-5', '我们老师', 'wǒmen lǎoshī', ['b4-be-trai', 'b4-dong-nghiep', 'b4-thay-giao'], 'C', 'thầy giáo của chúng tôi')],
 'n2': [N2('n2-4', '你叫什么名字？', 'Nǐ jiào shénme míngzi?', [('我叫李文。', 'Wǒ jiào Lǐ Wén.'), ('我是中国人。', 'Wǒ shì Zhōngguórén.'), ('我很好。', 'Wǒ hěn hǎo.')], 'A', 'Bạn tên là gì?'),
        N2('n2-5', '你爸爸做什么工作？', 'Nǐ bàba zuò shénme gōngzuò?', [('他今年四十岁。', 'Tā jīnnián sìshí suì.'), ('他是中国人。', 'Tā shì Zhōngguórén.'), ('他是老师。', 'Tā shì lǎoshī.')], 'C', 'Bố bạn làm nghề gì?')],
 'anh3': ['b4-be-trai', 'b4-vo-chong'],
 'n3': [N3('n3-4', ('你有儿子吗？', 'Nǐ yǒu érzi ma?'), ('有，我儿子今年两岁。', 'Yǒu, wǒ érzi jīnnián liǎng suì.'), 'E', 'Nam: Chị có con trai không? — Nữ: Có, con trai tôi năm nay hai tuổi.'),
        N3('n3-5', ('这是谁？', 'Zhè shì shéi?'), ('这是我和我老公。', 'Zhè shì wǒ hé wǒ lǎogōng.'), 'F', 'Nam: Đây là ai? — Nữ: Đây là tôi và chồng tôi.')],
 'n4': [N4('n4-4', ('我姐姐是老师，我是学生。', 'Wǒ jiějie shì lǎoshī, wǒ shì xué·shēng.'), ('他姐姐做什么工作？', 'Tā jiějie zuò shénme gōngzuò?'), [('老师', 'lǎoshī'), ('学生', 'xué·shēng'), ('没有工作', 'méiyǒu gōngzuò')], 'A', 'Chị gái tôi là giáo viên, tôi là học sinh. — Hỏi: Chị gái anh ấy làm nghề gì?'),
        N4('n4-5', ('我儿子今年九岁，明年他十岁。', 'Wǒ érzi jīnnián jiǔ suì, míngnián tā shí suì.'), ('他儿子明年几岁？', 'Tā érzi míngnián jǐ suì?'), [('九岁', 'jiǔ suì'), ('十岁', 'shí suì'), ('十九岁', 'shíjiǔ suì')], 'B', 'Con trai tôi năm nay chín tuổi, sang năm cháu mười tuổi. — Hỏi: Sang năm con trai anh ấy mấy tuổi?')],
 'd4': [D4('d4-5', ('李文的妈妈今年四十五岁，爸爸今年四十七岁。', 'Lǐ Wén de māma jīnnián sìshíwǔ suì, bàba jīnnián sìshíqī suì.'), ('李文的妈妈今年：', 'Lǐ Wén de māma jīnnián:'), [('四十五岁', 'sìshíwǔ suì'), ('四十七岁', 'sìshíqī suì'), ('五十七岁', 'wǔshíqī suì')], 'A', 'Mẹ Lý Văn năm nay 45 tuổi, bố năm nay 47 tuổi.')]},
5: {
 'n1': [N1('n1-4', '饺子', 'jiǎozi', ['b5-banh-mi', 'b5-goi-sui-cao', 'b5-mi'], 'B', 'sủi cảo'),
        N1('n1-5', '休息', 'xiūxi', ['b5-nau-an', 'b5-may-tinh', 'b5-nghi-ngoi'], 'C', 'nghỉ ngơi')],
 'n2': [N2('n2-4', '你喜欢吃什么？', 'Nǐ xǐhuan chī shénme?', [('我喜欢吃面条儿。', 'Wǒ xǐhuan chī miàntiáor.'), ('今天星期二。', 'Jīntiān xīngqī’èr.'), ('我今天休息。', 'Wǒ jīntiān xiūxi.')], 'A', 'Bạn thích ăn gì?'),
        N2('n2-5', '你的生日是几月几号？', 'Nǐ de shēngrì shì jǐ yuè jǐ hào?', [('今天星期六。', 'Jīntiān xīngqīliù.'), ('我的生日是五月八号。', 'Wǒ de shēngrì shì wǔyuè bā hào.'), ('我今年八岁。', 'Wǒ jīnnián bā suì.')], 'B', 'Sinh nhật bạn là ngày mấy tháng mấy?')],
 'anh3': ['b5-sinh-nhat', 'b5-banh-mi'],
 'n3': [N3('n3-4', ('今天是你的生日吗？', 'Jīntiān shì nǐ de shēngrì ma?'), ('对，今天我二十岁。', 'Duì, jīntiān wǒ èrshí suì.'), 'E', 'Nam: Hôm nay là sinh nhật bạn à? — Nữ: Đúng, hôm nay mình tròn hai mươi tuổi.'),
        N3('n3-5', ('这是什么？', 'Zhè shì shénme?'), ('是面包，很好吃。', 'Shì miànbāo, hěn hǎochī.'), 'F', 'Nam: Đây là gì? — Nữ: Là bánh mì, ngon lắm.')],
 'n4': [N4('n4-4', ('明天是星期六，我不上班。', 'Míngtiān shì xīngqīliù, wǒ bú shàng bān.'), ('明天星期几？', 'Míngtiān xīngqī jǐ?'), [('星期五', 'xīngqīwǔ'), ('星期六', 'xīngqīliù'), ('星期天', 'xīngqītiān')], 'B', 'Ngày mai là thứ Bảy, tôi không đi làm. — Hỏi: Ngày mai là thứ mấy?'),
        N4('n4-5', ('这是我妈妈做的面包，很好吃。', 'Zhè shì wǒ māma zuò de miànbāo, hěn hǎochī.'), ('什么很好吃？', 'Shénme hěn hǎochī?'), [('面包', 'miànbāo'), ('包子', 'bāozi'), ('面条儿', 'miàntiáor')], 'A', 'Đây là bánh mì mẹ tôi làm, rất ngon. — Hỏi: Cái gì rất ngon?')],
 'd4': [D4('d4-5', ('王一飞今天上班，明天休息。', 'Wáng Yīfēi jīntiān shàng bān, míngtiān xiūxi.'), ('王一飞哪天休息？', 'Wáng Yīfēi nǎ tiān xiūxi?'), [('昨天', 'zuótiān'), ('今天', 'jīntiān'), ('明天', 'míngtiān')], 'C', 'Vương Nhất Phi hôm nay đi làm, ngày mai nghỉ.')]},
6: {
 'n1': [N1('n1-4', '坐地铁', 'zuò dìtiě', ['b6-taxi', 'b6-xe-dap', 'b6-tau-dien'], 'C', 'đi tàu điện ngầm'),
        N1('n1-5', '打电话', 'dǎ diànhuà', ['b6-sieu-thi', 'b6-dien-thoai', 'b5-may-tinh'], 'B', 'gọi điện thoại')],
 'n2': [N2('n2-4', '你想喝什么？', 'Nǐ xiǎng hē shénme?', [('我想喝奶茶。', 'Wǒ xiǎng hē nǎichá.'), ('我想吃米饭。', 'Wǒ xiǎng chī mǐfàn.'), ('我坐地铁去。', 'Wǒ zuò dìtiě qù.')], 'A', 'Bạn muốn uống gì?'),
        N2('n2-5', '你早饭想吃什么？', 'Nǐ zǎofàn xiǎng chī shénme?', [('我坐车去。', 'Wǒ zuò chē qù.'), ('我想吃面包。', 'Wǒ xiǎng chī miànbāo.'), ('他给我打电话。', 'Tā gěi wǒ dǎ diànhuà.')], 'B', 'Bữa sáng bạn muốn ăn gì?')],
 'anh3': ['b6-taxi', 'b6-sieu-thi'],
 'n3': [N3('n3-4', ('我们怎么去饭店？', 'Wǒmen zěnme qù fàndiàn?'), ('我们坐出租车去。', 'Wǒmen zuò chūzūchē qù.'), 'E', 'Nam: Mình đến nhà hàng bằng cách nào? — Nữ: Mình đi taxi.'),
        N3('n3-5', ('你明天去哪儿？', 'Nǐ míngtiān qù nǎr?'), ('我去超市买一些菜。', 'Wǒ qù chāoshì mǎi yìxiē cài.'), 'F', 'Nam: Ngày mai bạn đi đâu? — Nữ: Mình đi siêu thị mua ít rau.')],
 'n4': [N4('n4-4', ('我爸爸开车去上班，我妈妈坐地铁去。', 'Wǒ bàba kāi chē qù shàng bān, wǒ māma zuò dìtiě qù.'), ('他妈妈怎么去上班？', 'Tā māma zěnme qù shàng bān?'), [('开车', 'kāi chē'), ('坐地铁', 'zuò dìtiě'), ('骑自行车', 'qí zìxíngchē')], 'B', 'Bố tôi lái xe đi làm, mẹ tôi đi tàu điện ngầm. — Hỏi: Mẹ anh ấy đi làm bằng gì?'),
        N4('n4-5', ('这家饭店的饺子非常好吃，我很喜欢。', 'Zhè jiā fàndiàn de jiǎozi fēicháng hǎochī, wǒ hěn xǐhuan.'), ('这家饭店的什么非常好吃？', 'Zhè jiā fàndiàn de shénme fēicháng hǎochī?'), [('米饭', 'mǐfàn'), ('面条儿', 'miàntiáor'), ('饺子', 'jiǎozi')], 'C', 'Sủi cảo của nhà hàng này ngon vô cùng, tôi rất thích. — Hỏi: Món gì của nhà hàng này rất ngon?')],
 'd4': [D4('d4-5', ('白家月的手机很旧，明天她去商店买新手机。', 'Bái Jiāyuè de shǒujī hěn jiù, míngtiān tā qù shāngdiàn mǎi xīn shǒujī.'), ('她明天买什么？', 'Tā míngtiān mǎi shénme?'), [('新手机', 'xīn shǒujī'), ('新电脑', 'xīn diànnǎo'), ('自行车', 'zìxíngchē')], 'A', 'Điện thoại của Bạch Gia Nguyệt đã cũ, ngày mai cô ấy ra cửa hàng mua điện thoại mới.')]},
7: {
 'n1': [N1('n1-4', '去学校', 'qù xuéxiào', ['b7-xem-phim', 'b7-truong', 'b7-sach'], 'B', 'đến trường'),
        N1('n1-5', '很多书', 'hěn duō shū', ['b7-sach', 'b7-xem-phim', 'b7-ly-tra'], 'A', 'rất nhiều sách')],
 'n2': [N2('n2-4', '你晚上做什么？', 'Nǐ wǎnshang zuò shénme?', [('现在八点。', 'Xiànzài bā diǎn.'), ('我在家看书。', 'Wǒ zài jiā kàn shū.'), ('我六点下班。', 'Wǒ liù diǎn xià bān.')], 'B', 'Buổi tối bạn làm gì?'),
        N2('n2-5', '你几点上班？', 'Nǐ jǐ diǎn shàng bān?', [('我在医院。', 'Wǒ zài yīyuàn.'), ('他八点下课。', 'Tā bā diǎn xià kè.'), ('我早上八点上班。', 'Wǒ zǎoshang bā diǎn shàng bān.')], 'C', 'Mấy giờ bạn đi làm?')],
 'anh3': ['b7-xem-phim', 'b7-ly-tra'],
 'n3': [N3('n3-4', ('我们晚上去看电影吧。', 'Wǒmen wǎnshang qù kàn diànyǐng ba.'), ('好，几点去？', 'Hǎo, jǐ diǎn qù?'), 'E', 'Nam: Tối nay mình đi xem phim đi. — Nữ: Được, mấy giờ đi?'),
        N3('n3-5', ('请喝茶。', 'Qǐng hē chá.'), ('好的，谢谢！', 'Hǎo de, xièxie!'), 'F', 'Nam: Mời chị uống trà. — Nữ: Vâng, cảm ơn!')],
 'n4': [N4('n4-4', ('现在差十分八点，我们八点上课。', 'Xiànzài chà shí fēn bā diǎn, wǒmen bā diǎn shàng kè.'), ('现在几点？', 'Xiànzài jǐ diǎn?'), [('七点五十分', 'qī diǎn wǔshí fēn'), ('八点', 'bā diǎn'), ('八点十分', 'bā diǎn shí fēn')], 'A', 'Bây giờ là tám giờ kém mười, tám giờ chúng tôi vào học. — Hỏi: Bây giờ là mấy giờ?'),
        N4('n4-5', ('我哥哥在学校学习，我姐姐在医院工作。', 'Wǒ gēge zài xuéxiào xuéxí, wǒ jiějie zài yīyuàn gōngzuò.'), ('他姐姐在哪儿工作？', 'Tā jiějie zài nǎr gōngzuò?'), [('学校', 'xuéxiào'), ('商店', 'shāngdiàn'), ('医院', 'yīyuàn')], 'C', 'Anh trai tôi học ở trường, chị gái tôi làm việc ở bệnh viện. — Hỏi: Chị gái anh ấy làm việc ở đâu?')],
 'd4': [D4('d4-5', ('王一飞中午十二点吃午饭，下午一点上课。', 'Wáng Yīfēi zhōngwǔ shí’èr diǎn chī wǔfàn, xiàwǔ yì diǎn shàng kè.'), ('王一飞几点上课？', 'Wáng Yīfēi jǐ diǎn shàng kè?'), [('十二点', 'shí’èr diǎn'), ('下午一点', 'xiàwǔ yì diǎn'), ('下午两点', 'xiàwǔ liǎng diǎn')], 'B', 'Vương Nhất Phi ăn trưa lúc 12 giờ, 1 giờ chiều vào học.')]},
8: {
 'n1': [N1('n1-4', '去书店', 'qù shūdiàn', ['b8-ban', 'b8-meo', 'b8-hieu-sach'], 'C', 'đi hiệu sách'),
        N1('n1-5', '吃米饭', 'chī mǐfàn', ['b6-com', 'b5-mi', 'b5-banh-mi'], 'A', 'ăn cơm')],
 'n2': [N2('n2-4', '房间里有什么？', 'Fángjiān li yǒu shénme?', [('我在房间里。', 'Wǒ zài fángjiān li.'), ('有一张桌子。', 'Yǒu yì zhāng zhuōzi.'), ('很漂亮。', 'Hěn piàoliang.')], 'B', 'Trong phòng có gì?'),
        N2('n2-5', '你看见我的书了吗？', 'Nǐ kànjiàn wǒ de shū le ma?', [('看见了，在桌子上。', 'Kànjiàn le, zài zhuōzi shang.'), ('我喜欢看书。', 'Wǒ xǐhuan kàn shū.'), ('书店在前面。', 'Shūdiàn zài qiánmiàn.')], 'A', 'Bạn có thấy sách của mình không?')],
 'anh3': ['b8-ban', 'b6-com'],
 'n3': [N3('n3-4', ('这张桌子怎么样？', 'Zhè zhāng zhuōzi zěnmeyàng?'), ('很漂亮，我很喜欢。', 'Hěn piàoliang, wǒ hěn xǐhuan.'), 'E', 'Nam: Cái bàn này thế nào? — Nữ: Rất đẹp, mình rất thích.'),
        N3('n3-5', ('米饭好吃吗？', 'Mǐfàn hǎochī ma?'), ('很好吃。', 'Hěn hǎochī.'), 'F', 'Nam: Cơm ngon không? — Nữ: Ngon lắm.')],
 'n4': [N4('n4-4', ('我的房间很大，我弟弟的房间很小。', 'Wǒ de fángjiān hěn dà, wǒ dìdi de fángjiān hěn xiǎo.'), ('弟弟的房间怎么样？', 'Dìdi de fángjiān zěnmeyàng?'), [('很大', 'hěn dà'), ('很小', 'hěn xiǎo'), ('很漂亮', 'hěn piàoliang')], 'B', 'Phòng của tôi rất rộng, phòng của em trai rất nhỏ. — Hỏi: Phòng của em trai thế nào?'),
        N4('n4-5', ('今天病人很多，我妈妈很忙，晚上八点能到家。', 'Jīntiān bìngrén hěn duō, wǒ māma hěn máng, wǎnshang bā diǎn néng dào jiā.'), ('他妈妈几点能到家？', 'Tā māma jǐ diǎn néng dào jiā?'), [('六点', 'liù diǎn'), ('七点', 'qī diǎn'), ('八点', 'bā diǎn')], 'C', 'Hôm nay đông bệnh nhân, mẹ tôi rất bận, tám giờ tối mới về đến nhà được. — Hỏi: Mấy giờ mẹ anh ấy về đến nhà?')],
 'd4': [D4('d4-5', ('学校前面有一家书店，我下课后去书店看书。', 'Xuéxiào qiánmiàn yǒu yì jiā shūdiàn, wǒ xià kè hòu qù shūdiàn kàn shū.'), ('他下课后去哪儿？', 'Tā xià kè hòu qù nǎr?'), [('书店', 'shūdiàn'), ('超市', 'chāoshì'), ('医院', 'yīyuàn')], 'A', 'Trước trường có một hiệu sách, tan học tôi đến hiệu sách đọc sách.')]},
9: {
 'n1': [N1('n1-4', '很多书', 'hěn duō shū', ['b9-ghe', 'b7-sach', 'b9-tv'], 'B', 'rất nhiều sách'),
        N1('n1-5', '唱歌', 'chàng gē', ['b9-tv', 'b9-ghe', 'b9-hat'], 'C', 'hát')],
 'n2': [N2('n2-4', '桌子上有什么？', 'Zhuōzi shang yǒu shénme?', [('在桌子左边。', 'Zài zhuōzi zuǒbian.'), ('我喜欢读书。', 'Wǒ xǐhuan dú shū.'), ('有两本书。', 'Yǒu liǎng běn shū.')], 'C', 'Trên bàn có gì?'),
        N2('n2-5', '那个人是谁？', 'Nàge rén shì shéi?', [('他在外边。', 'Tā zài wàibian.'), ('他是我朋友。', 'Tā shì wǒ péngyou.'), ('他喜欢唱歌。', 'Tā xǐhuan chàng gē.')], 'B', 'Người kia là ai?')],
 'anh3': ['b9-ghe', 'b7-sach'],
 'n3': [N3('n3-4', ('这把椅子是新的吗？', 'Zhè bǎ yǐzi shì xīn de ma?'), ('对，是新的。', 'Duì, shì xīn de.'), 'E', 'Nam: Cái ghế này mới à? — Nữ: Đúng, ghế mới.'),
        N3('n3-5', ('这些书是你的吗？', 'Zhèxiē shū shì nǐ de ma?'), ('对，我很喜欢读书。', 'Duì, wǒ hěn xǐhuan dú shū.'), 'F', 'Nam: Mấy quyển sách này của bạn à? — Nữ: Đúng, mình rất thích đọc sách.')],
 'n4': [N4('n4-4', ('我家左边是一家书店，右边是一家饭店。', 'Wǒ jiā zuǒbian shì yì jiā shūdiàn, yòubian shì yì jiā fàndiàn.'), ('他家右边是什么？', 'Tā jiā yòubian shì shénme?'), [('书店', 'shūdiàn'), ('饭店', 'fàndiàn'), ('超市', 'chāoshì')], 'B', 'Bên trái nhà tôi là một hiệu sách, bên phải là một nhà hàng. — Hỏi: Bên phải nhà anh ấy là gì?'),
        N4('n4-5', ('我朋友家有一只小狗，我很喜欢和它玩。', 'Wǒ péngyou jiā yǒu yì zhī xiǎo gǒu, wǒ hěn xǐhuan hé tā wán.'), ('谁家有小狗？', 'Shéi jiā yǒu xiǎo gǒu?'), [('他家', 'tā jiā'), ('老师家', 'lǎoshī jiā'), ('他朋友家', 'tā péngyou jiā')], 'C', 'Nhà bạn tôi có một chú chó con, tôi rất thích chơi với nó. — Hỏi: Nhà ai có chó con?')],
 'd4': [D4('d4-5', ('我有三本中文书，两本在桌子上，一本在椅子上。', 'Wǒ yǒu sān běn Zhōngwén shū, liǎng běn zài zhuōzi shang, yì běn zài yǐzi shang.'), ('椅子上有几本书？', 'Yǐzi shang yǒu jǐ běn shū?'), [('一本', 'yì běn'), ('两本', 'liǎng běn'), ('三本', 'sān běn')], 'A', 'Tôi có ba quyển sách tiếng Trung, hai quyển trên bàn, một quyển trên ghế.')]},
}
