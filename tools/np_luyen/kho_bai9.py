# Kho Luyện ngữ pháp Bài 9 (HSK 3.0) — soạn 24/11/2026. Cùng quy ước với kho_bai7.py / kho_bai8.py.
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from kho_bai2_4 import C, P, D, H, X

DD = {9: [
 ('bian', 'bi-dd', 'DT + 前 / 后 / 左 / 右 / 里 / 外 / 上 / 下 + 边', 'y1-L1'),
 ('bian', 'bi-de', 'DT + 的 + ……边 · ……边 = ……面', 'y2-L2'),
 ('bian', 'bi-na', '那边: bên kia', 'y3'),
 ('cunxian', 'cx-zai', 'N + 在 + nơi chốn', 'y1'),
 ('cunxian', 'cx-shi', 'Nơi chốn + 是 + N', 'y2-L2'),
 ('cunxian', 'cx-you', 'Nơi chốn + 有 + Số + LT + N', 'y3-L2'),
 ('cunxian', 'cx-pd', 'Phủ định: 没有 · 不是', 'y4-L3'),
 ('liangci2', 'lc2-jia', '家: cửa hàng, nhà hàng', 'y1-L1'),
 ('liangci2', 'lc2-ben', '本: sách', 'y2'),
 ('liangci2', 'lc2-ba', '把: ghế', 'y3'),
 ('liangci2', 'lc2-shou', '首: bài hát', 'y4'),
 ('zhishi', 'zs-na', '那 + LT + DT', 'y1'),
 ('zhishi', 'zs-zhe', '这 + LT + DT', 'y2-L2'),
 ('zhishi', 'zs-ji', '哪 + LT + DT: hỏi lựa chọn', 'y3-L3'),
 ('di', 'di-sh', '第 + Số', 'y1-L2'),
 ('di', 'di-lt', '第 + Số + LT + DT', 'y2'),
 ('di', 'di-ji', 'Hỏi thứ tự: 第几', 'y3-L3'),
 ('zhuangyu', 'zy-1', 'S + thời gian + 在 + nơi chốn + ĐT', 'y1-L1'),
 ('zhuangyu', 'zy-2', 'Thời gian đứng đầu câu; thời gian trước nơi chốn', 'y2-L3'),
 ('he', 'he-lc', 'A 和 B: A và B', 'y1-L2'),
 ('he', 'he-gt', 'S + 和 + người + ĐT: cùng với…', 'y2-L1'),
 ('he', 'he-pd', 'Phủ định đặt trước 和', 'L3'),
]}

CAU = {9: [
 # 边
 C('bi-dd', '学校＿边是医院。', 'Xuéxiào hòubian shì yīyuàn.', 'Phía sau trường là bệnh viện.', '后', ['第', '很'], 'Phía sau: **后边**.'),
 C('bi-dd', '桌子＿边有一本书。', 'Zhuōzi zuǒbian yǒu yì běn shū.', 'Bên trái bàn có một quyển sách.', '左', ['很', '第'], 'Bên trái: **左边**.'),
 X('bi-dd', ['bian'], '医院在学校后边。', 'Yīyuàn zài xuéxiào hòubian.', 'Bệnh viện ở phía sau trường.', ['医院', '在', '学校后边']),
 D('bi-de', '医院的右边是超市。', 'Yīyuàn de yòubian shì chāoshì.', 'A 的 + ……边: phía … của A.'),
 D('bi-de', '电影院的前边是一家饭店。', 'Diànyǐngyuàn de qiánbian shì yì jiā fàndiàn.', '**前边** = **前面**.'),
 C('bi-na', '＿边有超市和饭店。', 'Nàbian yǒu chāoshì hé fàndiàn.', 'Bên kia có siêu thị và nhà hàng.', '那', ['很', '第'], '**那边** = bên kia.'),
 H('bi-na', '那边有一家书店。', 'Nàbian yǒu yì jiā shūdiàn.', '书店在哪儿？', 'Shūdiàn zài nǎr?', ['你想买什么书？', '书店大吗？'], 'Chỉ chỗ xa: **那边**.'),
 # 存现句
 C('cx-zai', '医院＿学校后边。', 'Yīyuàn zài xuéxiào hòubian.', 'Bệnh viện ở phía sau trường.', '在', ['有', '很'], '**N + 在 + nơi chốn**.'),
 D('cx-zai', '我的书在椅子上。', 'Wǒ de shū zài yǐzi shang.', '**在**: vật xác định ở đâu.'),
 C('cx-shi', '学校后边＿医院。', 'Xuéxiào hòubian shì yīyuàn.', 'Phía sau trường là bệnh viện.', '是', ['在', '很'], '**Nơi chốn + 是 + N**.'),
 D('cx-shi', '书店前边是一家超市。', 'Shūdiàn qiánbian shì yì jiā chāoshì.', 'Câu tồn hiện: nơi chốn + **是**.'),
 C('cx-you', '桌子上＿一本书和一台电脑。', 'Zhuōzi shang yǒu yì běn shū hé yì tái diànnǎo.', 'Trên bàn có một quyển sách và một cái máy tính.', '有', ['在', '很'], 'Liệt kê, có số lượng dùng **有**.'),
 D('cx-you', '一本书在桌子上。', 'Yì běn shū zài zhuōzi shang.', 'Vật chưa xác định, có số lượng: đặt nơi chốn đầu câu với **有**.', '桌子上有一本书。', 'Zhuōzi shang yǒu yì běn shū.', 'luuY'),
 C('cx-pd', '桌子上＿有手机。', 'Zhuōzi shang méiyǒu shǒujī.', 'Trên bàn không có điện thoại.', '没', ['不', '很'], 'Phủ định của **有** là **没有**.'),
 D('cx-pd', '学校后边不有医院。', 'Xuéxiào hòubian bù yǒu yīyuàn.', '**有** phủ định bằng **没有**.', '学校后边没有医院。', 'Xuéxiào hòubian méiyǒu yīyuàn.', 'luuY'),
 # 量词
 C('lc2-jia', '学校前边有一＿书店。', 'Xuéxiào qiánbian yǒu yì jiā shūdiàn.', 'Phía trước trường có một hiệu sách.', '家', ['本', '把'], 'Cửa hàng dùng **家**.'),
 D('lc2-jia', '这家饭店的菜真好吃！', 'Zhè jiā fàndiàn de cài zhēn hǎochī!', 'Nhà hàng dùng **家**.'),
 C('lc2-ben', '我有两＿中文书。', 'Wǒ yǒu liǎng běn Zhōngwén shū.', 'Tôi có hai quyển sách tiếng Trung.', '本', ['家', '把'], 'Sách dùng **本**.'),
 D('lc2-ben', '我想买一个书。', 'Wǒ xiǎng mǎi yí ge shū.', 'Sách dùng **本**.', '我想买一本书。', 'Wǒ xiǎng mǎi yì běn shū.', 'luuY'),
 C('lc2-ba', '房间里有两＿椅子。', 'Fángjiān li yǒu liǎng bǎ yǐzi.', 'Trong phòng có hai cái ghế.', '把', ['本', '家'], 'Ghế dùng **把**.'),
 D('lc2-ba', '这把椅子很新。', 'Zhè bǎ yǐzi hěn xīn.', 'Ghế dùng **把**.'),
 C('lc2-shou', '我会唱一＿中文歌。', 'Wǒ huì chàng yì shǒu Zhōngwén gē.', 'Tôi biết hát một bài hát tiếng Trung.', '首', ['本', '家'], 'Bài hát dùng **首**.'),
 D('lc2-shou', '这首歌很好听。', 'Zhè shǒu gē hěn hǎotīng.', 'Bài hát dùng **首**.'),
 # 这 / 那 / 哪
 C('zs-na', '我想去＿家书店买书。', 'Wǒ xiǎng qù nà jiā shūdiàn mǎi shū.', 'Tôi muốn đến hiệu sách kia mua sách.', '那', ['很', '第'], '**那 + 家 + DT** = hiệu sách kia.'),
 H('zs-na', '是我们的老师。', 'Shì wǒmen de lǎoshī.', '那个人是谁？', 'Nàge rén shì shéi?', ['你是老师吗？', '这个人有几个孩子？'], 'Hỏi người kia dùng **那个**.'),
 C('zs-zhe', '＿本书是我的。', 'Zhè běn shū shì wǒ de.', 'Quyển sách này là của tôi.', '这', ['很', '第'], '**这 + 本 + 书**.'),
 D('zs-zhe', '这个人是我同学。', 'Zhè ge rén shì wǒ tóngxué.', '**这个** = người này.'),
 C('zs-ji', '你喜欢＿本书？', 'Nǐ xǐhuan nǎ běn shū?', 'Bạn thích quyển sách nào?', '哪', ['第', '很'], 'Hỏi "… nào" dùng **哪 + LT + DT**.'),
 D('zs-ji', '你想去哪家饭店？', 'Nǐ xiǎng qù nǎ jiā fàndiàn?', '**哪家** = nhà hàng nào.'),
 # 第
 C('di-sh', '我是＿三个。', 'Wǒ shì dì-sān ge.', 'Tôi là người thứ ba.', '第', ['很', '不'], '**第 + Số**.'),
 D('di-sh', '他是第一个学生。', 'Tā shì dì-yī ge xuésheng.', '**第一个** = người thứ nhất.'),
 C('di-lt', '这是我的第＿本中文书。', 'Zhè shì wǒ de dì-èr běn Zhōngwén shū.', 'Đây là quyển sách tiếng Trung thứ hai của tôi.', '二', ['两', '很'], 'Số thứ tự dùng **二**.'),
 X('di-lt', ['di'], '这是第三本书。', 'Zhè shì dì-sān běn shū.', 'Đây là quyển sách thứ ba.', ['这是', '第三本', '书']),
 H('di-ji', '我是第三个。', 'Wǒ shì dì-sān ge.', '你是第几个？', 'Nǐ shì dì-jǐ ge?', ['你是学生吗？', '你有几个朋友？'], 'Hỏi thứ tự: **第几**.'),
 C('di-ji', '你是第＿个学生？', 'Nǐ shì dì-jǐ ge xuésheng?', 'Bạn là học sinh thứ mấy?', '几', ['很', '不'], 'Hỏi thứ tự: **第几**.'),
 # Thời gian + nơi chốn
 C('zy-1', '我明天上午＿学校学习。', 'Wǒ míngtiān shàngwǔ zài xuéxiào xuéxí.', 'Sáng mai tôi học ở trường.', '在', ['有', '很'], 'Thời gian + **在 + nơi chốn** + ĐT.'),
 X('zy-1', ['zhuangyu'], '我们七点在电影院外边见。', 'Wǒmen qī diǎn zài diànyǐngyuàn wàibian jiàn.', 'Bảy giờ chúng ta gặp ở bên ngoài rạp phim.', ['我们', '七点', '在电影院外边', '见']),
 D('zy-2', '明天中午陈天中在学校吃午饭。', 'Míngtiān zhōngwǔ Chén Tiānzhōng zài xuéxiào chī wǔfàn.', 'Thời gian có thể đứng đầu câu.'),
 D('zy-2', '我在学校明天上午学习。', 'Wǒ zài xuéxiào míngtiān shàngwǔ xuéxí.', 'Thời gian đứng **trước** nơi chốn.', '我明天上午在学校学习。', 'Wǒ míngtiān shàngwǔ zài xuéxiào xuéxí.', 'luuY'),
 # 和
 C('he-lc', '房间里有桌子＿椅子。', 'Fángjiān li yǒu zhuōzi hé yǐzi.', 'Trong phòng có bàn và ghế.', '和', ['在', '很'], '**和** nối hai danh từ.'),
 D('he-lc', '我家有一只猫和一只狗。', 'Wǒ jiā yǒu yì zhī māo hé yì zhī gǒu.', '**和** nối hai danh từ.'),
 C('he-gt', '晚上我＿朋友们去外边唱歌。', 'Wǎnshang wǒ hé péngyoumen qù wàibian chàng gē.', 'Buổi tối tôi cùng các bạn ra ngoài hát.', '和', ['在', '很'], '**和 + người + ĐT**: cùng với.'),
 X('he-gt', ['he'], '孩子们和小狗玩。', 'Háizimen hé xiǎo gǒu wán.', 'Bọn trẻ chơi với chú chó nhỏ.', ['孩子们', '和小狗', '玩']),
 D('he-pd', '我不和朋友去。', 'Wǒ bù hé péngyou qù.', '**不** đứng trước **和**.'),
 D('he-pd', '我不和妈妈在家做饭。', 'Wǒ bù hé māma zài jiā zuò fàn.', '**不** đặt trước **和**.'),
]}
