# Kho Luyện ngữ pháp Bài 8 (HSK 3.0) — soạn 24/11/2026. Cùng quy ước với kho_bai7.py (mỗi ý + lưu ý của thẻ = một đặc điểm, ≥ 2 câu).
# Mã câu là khoá phân tích nghiên cứu: chỉ thêm câu vào cuối, câu thay thì đánh dấu bo.
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kho_bai2_4 import C, P, D, H, X

DD = {8: [
 ('fangwei', 'fw-dd', 'Danh từ + 上 / 下 / 里 / 外 / 前 / 后', 'y1-L1'),
 ('fangwei', 'fw-mian', 'Danh từ (+的) + ……面', 'y2-L2'),
 ('fangwei', 'fw-hoi', 'Hỏi và nói vị trí: 在哪儿 · 在……上', 'y3-L3'),
 ('liangci', 'lc-zhi', '只: con vật', 'y1-L1'),
 ('liangci', 'lc-zhang', '张: cái bàn…', 'y2'),
 ('liangci', 'lc-suo', '所: trường học, bệnh viện', 'y3-L3'),
 ('liangci', 'lc-liang', '两 + lượng từ (không nói 二)', 'L2'),
 ('mei', 'mei-you', '没有 + danh từ', 'y1'),
 ('mei', 'mei-hai', '(还)没 + ĐT (+呢): chưa…', 'y2'),
 ('mei', 'mei-bm', 'Phân biệt 不 và 没 (thời gian, ý nghĩa)', 'y3-y4-L4'),
 ('mei', 'mei-bu', 'Chỉ dùng 不: tính từ, 是, 认识…', 'y5-L2'),
 ('mei', 'mei-mei', 'Chỉ dùng 没: bổ ngữ kết quả; 有 → 没有', 'y6-L1-L3'),
 ('jieguo', 'jg-kd', 'Khẳng định: ĐT + BNKQ (+ O) (+了)', 'y1-L1'),
 ('jieguo', 'jg-pd', 'Phủ định: 没 + ĐT + BNKQ', 'y2-L2'),
 ('jieguo', 'jg-hoi', 'Nghi vấn: ĐT + BNKQ + 了吗 / 了没有', 'y3-L3'),
 ('neng', 'ne-sl', '能: có sức lực, khả năng', 'y1'),
 ('neng', 'ne-dk', '能: điều kiện cho phép; không → 不能', 'y2-L1'),
 ('neng', 'ne-xp', '能……吗: xin phép', 'y3'),
 ('neng', 'ne-hui', 'Phân biệt 会 và 能', 'L2'),
]}

CAU = {8: [
 # 方位词
 C('fw-dd', '书在桌子＿。', 'Shū zài zhuōzi shang.', 'Sách ở trên bàn.', '上', ['里', '前'], 'Trên bàn: **桌子上**.'),
 C('fw-dd', '小猫在房间＿，不在房间外。', 'Xiǎo māo zài fángjiān li, bú zài fángjiān wài.', 'Con mèo nhỏ ở trong phòng, không ở ngoài phòng.', '里', ['上', '下'], 'Trong phòng: **房间里**.'),
 D('fw-dd', '手机在书下。', 'Shǒujī zài shū xià.', 'Dưới sách: **书下**; phương vị đứng sau danh từ.'),
 X('fw-dd', ['fangwei'], '超市前有一家饭店。', 'Chāoshì qián yǒu yì jiā fàndiàn.', 'Phía trước siêu thị có một nhà hàng.', ['超市前', '有', '一家', '饭店']),
 C('fw-mian', '医院的前＿是饭店。', 'Yīyuàn de qiánmiàn shì fàndiàn.', 'Phía trước bệnh viện là nhà hàng.', '面', ['外', '上'], '**前面** = phía trước.'),
 D('fw-mian', '桌子下面有一只小猫。', 'Zhuōzi xiàmiàn yǒu yì zhī xiǎo māo.', '**下面** = phía dưới.'),
 X('fw-mian', ['fangwei'], '学校的后面是医院。', 'Xuéxiào de hòumiàn shì yīyuàn.', 'Phía sau trường là bệnh viện.', ['学校的', '后面', '是', '医院']),
 H('fw-hoi', '我的手机在桌子上。', 'Wǒ de shǒujī zài zhuōzi shang.', '你的手机在哪儿？', 'Nǐ de shǒujī zài nǎr?', ['你有手机吗？', '你的手机是新的吗？'], 'Hỏi vị trí dùng **在哪儿**, đáp **在 + vị trí**.'),
 H('fw-hoi', '小猫在桌子下。', 'Xiǎo māo zài zhuōzi xià.', '小猫在哪儿？', 'Xiǎo māo zài nǎr?', ['你喜欢小猫吗？', '你有几只小猫？'], 'Đáp vị trí: **在 + danh từ + 下**.'),
 # 量词
 C('lc-zhi', '我家有一＿小狗。', 'Wǒ jiā yǒu yì zhī xiǎo gǒu.', 'Nhà tôi có một con chó nhỏ.', '只', ['张', '所'], 'Con vật dùng **只**.'),
 D('lc-zhi', '我想买一个猫。', 'Wǒ xiǎng mǎi yí ge māo.', 'Con vật dùng **只**.', '我想买一只猫。', 'Wǒ xiǎng mǎi yì zhī māo.', 'luuY'),
 C('lc-zhang', '房间里有一＿桌子。', 'Fángjiān li yǒu yì zhāng zhuōzi.', 'Trong phòng có một cái bàn.', '张', ['只', '所'], 'Cái bàn dùng **张**.'),
 D('lc-zhang', '这张桌子很新。', 'Zhè zhāng zhuōzi hěn xīn.', 'Cái bàn dùng **张**.'),
 C('lc-suo', '那＿学校的学生很多。', 'Nà suǒ xuéxiào de xuésheng hěn duō.', 'Trường kia có rất nhiều học sinh.', '所', ['只', '张'], 'Trường học dùng **所**.'),
 D('lc-suo', '我家前面有一所医院。', 'Wǒ jiā qiánmiàn yǒu yì suǒ yīyuàn.', 'Bệnh viện dùng **所** (hoặc **家**).'),
 D('lc-liang', '我家有二只猫。', 'Wǒ jiā yǒu èr zhī māo.', 'Trước lượng từ nói **两**, không nói 二.', '我家有两只猫。', 'Wǒ jiā yǒu liǎng zhī māo.', 'luuY'),
 C('lc-liang', '房间里有＿张桌子。', 'Fángjiān li yǒu liǎng zhāng zhuōzi.', 'Trong phòng có hai cái bàn.', '两', ['二', '很'], '**两** đứng trước lượng từ.'),
 # 没
 C('mei-you', '他们家只有猫，＿有狗。', 'Tāmen jiā zhǐ yǒu māo, méiyǒu gǒu.', 'Nhà họ chỉ có mèo, không có chó.', '没', ['不', '很'], '**有** phủ định bằng **没有**.'),
 D('mei-you', '我不有手机。', 'Wǒ bù yǒu shǒujī.', '**有** phủ định bằng **没有**.', '我没有手机。', 'Wǒ méiyǒu shǒujī.', 'luuY'),
 C('mei-hai', '现在六点，爸爸还＿下班呢。', 'Xiànzài liù diǎn, bàba hái méi xiàbān ne.', 'Bây giờ 6 giờ, bố vẫn chưa tan làm đấy.', '没', ['不', '很'], 'Chưa làm: **还没……呢**.'),
 X('mei-hai', ['mei'], '我还没吃午饭呢。', 'Wǒ hái méi chī wǔfàn ne.', 'Tôi vẫn chưa ăn trưa đấy.', ['我', '还', '没', '吃午饭', '呢']),
 H('mei-hai', '还没吃呢。', 'Hái méi chī ne.', '你吃午饭了没有？', 'Nǐ chī wǔfàn le méiyǒu?', ['你想吃什么？', '你在哪儿吃午饭？'], 'Hỏi **了没有**, đáp **还没……呢**.'),
 C('mei-bm', '我昨天＿去学校。', 'Wǒ zuótiān méi qù xuéxiào.', 'Hôm qua tôi không đến trường.', '没', ['不', '很'], 'Việc **đã qua** dùng **没**.'),
 C('mei-bm', '我明天＿去学校。', 'Wǒ míngtiān bú qù xuéxiào.', 'Ngày mai tôi không đến trường.', '不', ['没', '很'], 'Việc ở **tương lai** dùng **不**.'),
 D('mei-bm', '我明天没去学校。', 'Wǒ míngtiān méi qù xuéxiào.', '**没** không dùng cho tương lai.', '我明天不去学校。', 'Wǒ míngtiān bú qù xuéxiào.', 'luuY'),
 C('mei-bu', '这个房间＿大。', 'Zhè ge fángjiān bú dà.', 'Căn phòng này không lớn.', '不', ['没', '有'], 'Tính từ phủ định bằng **不**.'),
 D('mei-bu', '我没认识他。', 'Wǒ méi rènshi tā.', '**认识** phủ định bằng **不**.', '我不认识他。', 'Wǒ bú rènshi tā.', 'luuY'),
 C('mei-mei', '我们＿看见那只小猫。', 'Wǒmen méi kànjiàn nà zhī xiǎo māo.', 'Chúng tôi không nhìn thấy con mèo đó.', '没', ['不', '很'], 'Bổ ngữ kết quả phủ định bằng **没**.'),
 D('mei-mei', '我不看见他。', 'Wǒ bú kànjiàn tā.', 'Bổ ngữ kết quả phủ định bằng **没**.', '我没看见他。', 'Wǒ méi kànjiàn tā.', 'luuY'),
 # 结果补语
 C('jg-kd', '妈妈做＿午饭了。', 'Māma zuòhǎo wǔfàn le.', 'Mẹ nấu xong cơm trưa rồi.', '好', ['见', '能'], '**做好** = làm xong.'),
 C('jg-kd', '我看＿小猫了。', 'Wǒ kànjiàn xiǎo māo le.', 'Tôi nhìn thấy con mèo nhỏ rồi.', '见', ['好', '能'], '**看见** = nhìn thấy.'),
 X('jg-kd', ['jieguo'], '李文买到那本书了。', 'Lǐ Wén mǎidào nà běn shū le.', 'Lý Văn mua được quyển sách đó rồi.', ['李文', '买到', '那本书', '了']),
 C('jg-pd', '他＿买到新电脑。', 'Tā méi mǎidào xīn diànnǎo.', 'Anh ấy không mua được máy tính mới.', '没', ['不', '很'], 'Phủ định bổ ngữ kết quả: **没 + ĐT + BNKQ**.'),
 D('jg-pd', '我们不做好早饭。', 'Wǒmen bú zuòhǎo zǎofàn.', 'Phủ định bổ ngữ kết quả dùng **没**.', '我们没做好早饭。', 'Wǒmen méi zuòhǎo zǎofàn.', 'luuY'),
 H('jg-hoi', '我没看见。', 'Wǒ méi kànjiàn.', '你们看见我的手机了吗？', 'Nǐmen kànjiàn wǒ de shǒujī le ma?', ['你们有手机吗？', '你的手机在哪儿？'], 'Hỏi **了吗**, đáp **没看见**.'),
 C('jg-hoi', '你看见我的新电脑了＿？', 'Nǐ kànjiàn wǒ de xīn diànnǎo le méiyǒu?', 'Bạn có nhìn thấy máy tính mới của tôi không?', '没有', ['没', '不'], 'Hỏi bằng **了没有**.'),
 # 能
 C('ne-sl', '我＿喝三杯牛奶。', 'Wǒ néng hē sān bēi niúnǎi.', 'Tôi có thể uống ba cốc sữa.', '能', ['在', '很'], '**能** chỉ sức lực, khả năng.'),
 D('ne-sl', '他一天能吃七碗米饭。', 'Tā yì tiān néng chī qī wǎn mǐfàn.', '**能** chỉ sức lực, khả năng.'),
 C('ne-dk', '我下午有课，＿去看电影。', 'Wǒ xiàwǔ yǒu kè, bù néng qù kàn diànyǐng.', 'Chiều tôi có tiết, không thể đi xem phim.', '不能', ['不在', '很能'], 'Điều kiện không cho phép → **不能**.'),
 D('ne-dk', '明天我有时间，能去书店。', 'Míngtiān wǒ yǒu shíjiān, néng qù shūdiàn.', 'Có điều kiện cho phép thì dùng **能**.'),
 H('ne-xp', '不能。', 'Bù néng.', '我能在这里吃午饭吗？', 'Wǒ néng zài zhèlǐ chī wǔfàn ma?', ['你想吃什么？', '你在哪儿吃午饭？'], 'Xin phép: **能……吗？**, từ chối: **不能**.'),
 X('ne-xp', ['neng'], '你能到学校吗？', 'Nǐ néng dào xuéxiào ma?', 'Bạn có thể đến trường không?', ['你', '能', '到学校', '吗']),
 C('ne-hui', '我今天有课，不＿做饭。', 'Wǒ jīntiān yǒu kè, bù néng zuò fàn.', 'Hôm nay tôi có tiết, không thể nấu cơm.', '能', ['很', '在'], 'Điều kiện không cho phép → **不能**.'),
 D('ne-hui', '我会做饭。', 'Wǒ huì zuò fàn.', '**会** = biết làm nhờ học.'),
]}
