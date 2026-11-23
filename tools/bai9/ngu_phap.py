# Ngữ pháp Bài 9 (HSK 3.0) — 7 thẻ, theo slide của cô Nhiên (slide 4-5, 7-9, 14, 21) · soạn 24/11/2026
# Cú pháp ghi nhanh: C(chữ có đánh dấu, pinyin, nghĩa) — đoạn màu viết [chữ:loại]; phần không đánh dấu là chữ thường.
# loại: codinh dt dgt tt st pho cau.   Ví dụ  C('学校[后边:codinh]是医院。', 'Xuéxiào hòubian shì yīyuàn.')
import re

def C(mk, py, nghia=''):
    doan, han, pos = [], '', 0
    for m in re.finditer(r'\[([^\]:]+):(\w+)\]', mk):
        if m.start() > pos: doan.append([mk[pos:m.start()], None]); han += mk[pos:m.start()]
        doan.append([m.group(1), m.group(2)]); han += m.group(1); pos = m.end()
    if pos < len(mk): doan.append([mk[pos:], None]); han += mk[pos:]
    return [han, py, nghia, doan]

NGU_PHAP = [
 dict(id='bian', ten='Từ chỉ phương vị + 边: 前边 · 后边 · 左边 · 右边 · 里边 · 外边 · 上边 · 下边',
  congThuc=[[['DT (+的)', 'dt'], ['前 / 后 / 左 / 右 / 里 / 外 / 上 / 下', 'codinh'], ['边', 'codinh']]],
  giaiThich='**边** ghép sau **từ chỉ phương vị** tạo thành **前边, 后边, 左边, 右边, 里边, 外边, 上边, 下边**. Đặt sau danh từ chỉ nơi chốn hoặc vật: **学校后边** (phía sau trường), **桌子左边** (bên trái bàn). Công thức: **A (的) + ……边** = "phía … của A". **边** và **面** dùng thay nhau: 前边 = 前面. Chỉ nơi xa người nói dùng **那边** (bên kia).',
  y=[
   dict(noiDung='DT + 前 / 后 / 左 / 右 / 里 / 外 / 上 / 下 + 边',
    cum=[C('学校[前边:codinh]', 'xuéxiào qiánbian'), C('医院[后边:codinh]', 'yīyuàn hòubian'), C('桌子[左边:codinh]', 'zhuōzi zuǒbian'), C('桌子[右边:codinh]', 'zhuōzi yòubian'), C('超市[里边:codinh]', 'chāoshì lǐbian')],
    viDu=[C('学校[后边:codinh]有一家超市。', 'Xuéxiào hòubian yǒu yì jiā chāoshì.'), C('书在桌子[上边:codinh]。', 'Shū zài zhuōzi shàngbian.')]),
   dict(noiDung='DT + 的 + ……边',
    cum=[C('医院[的:codinh][右边:codinh]', 'yīyuàn de yòubian'), C('饭店[的:codinh][外边:codinh]', 'fàndiàn de wàibian')],
    viDu=[C('电影院[的:codinh][前边:codinh]是一家饭店。', 'Diànyǐngyuàn de qiánbian shì yì jiā fàndiàn.')]),
   dict(noiDung='那边: bên kia',
    cum=[C('去[那边:codinh]', 'qù nàbian'), C('在[那边:codinh]', 'zài nàbian')],
    viDu=[C('[那边:codinh]有超市和饭店。', 'Nàbian yǒu chāoshì hé fàndiàn.')]),
  ],
  luuY=['**边** đọc **nhẹ** (bian) khi đứng sau: 前边 (qiánbian), 后边 (hòubian).',
        '**……边** và **……面** nghĩa như nhau: 前边 = 前面, 后边 = 后面.',
        '**里边, 外边** chỉ **bên trong, bên ngoài**: 超市里边 = 超市里面.']),

 dict(id='cunxian', ten='Câu tồn hiện: nơi chốn + 有 / 是 + người, vật',
  congThuc=[[['N', 'dt'], ['在', 'codinh'], ['Nơi chốn', 'dt']], [['Nơi chốn', 'dt'], ['有 / 是', 'codinh'], ['(Số + LT) + N', 'dt']]],
  giaiThich='Có hai cách nói cùng một vị trí. **N + 在 + nơi chốn**: nói người, vật **ở đâu** (医院在学校后边). **Nơi chốn + 有 / 是 + (Số + LT) + N**: nói **ở nơi đó có gì** (学校后边是医院). Đây là **câu tồn hiện**, biểu thị người hoặc vật **tồn tại** ở một nơi hay vị trí nào đó, thường có **有** hoặc **是**. Phủ định: **没有** (có → không có), **不是** (là → không phải là).',
  y=[
   dict(noiDung='N + 在 + nơi chốn',
    cum=[C('[医院:dt][在:codinh]学校后边', 'yīyuàn zài xuéxiào hòubian')],
    viDu=[C('[医院:dt][在:codinh]学校后边。', 'Yīyuàn zài xuéxiào hòubian.'), C('[我的手机:dt][在:codinh]椅子上。', 'Wǒ de shǒujī zài yǐzi shang.')]),
   dict(noiDung='Nơi chốn + 是 / 有 + N',
    cum=[],
    viDu=[C('学校后边[是:codinh]医院。', 'Xuéxiào hòubian shì yīyuàn.'), C('饭店左边[有:codinh]一所学校。', 'Fàndiàn zuǒbian yǒu yì suǒ xuéxiào.'), C('电影院的右边是学校和饭店。', 'Diànyǐngyuàn de yòubian shì xuéxiào hé fàndiàn.')]),
   dict(noiDung='有 + Số + LT + N: chưa xác định, liệt kê',
    cum=[C('[有:codinh]一本书', 'yǒu yì běn shū'), C('[有:codinh]两把椅子', 'yǒu liǎng bǎ yǐzi')],
    viDu=[C('桌子上[有:codinh]一本书。', 'Zhuōzi shang yǒu yì běn shū.'), C('房间里[有:codinh]一张桌子和两把椅子。', 'Fángjiān li yǒu yì zhāng zhuōzi hé liǎng bǎ yǐzi.')]),
   dict(noiDung='Phủ định: 没有 · 不是',
    cum=[C('[没有:codinh]椅子', 'méiyǒu yǐzi'), C('[不是:codinh]学校', 'bú shì xuéxiào')],
    viDu=[C('桌子上[没有:codinh]书。', 'Zhuōzi shang méiyǒu shū.'), C('学校后边[不是:codinh]医院。', 'Xuéxiào hòubian bú shì yīyuàn.')]),
  ],
  luuY=['**在** nói người, vật **xác định** ở đâu: 我的手机在椅子上. **有 / 是** đặt **nơi chốn lên đầu**: 椅子上有一本书.',
        '**是** chỉ ra vật **duy nhất, xác định**: 学校后边是医院. **有** nói **có** (một hoặc vài vật, thường kèm số lượng): 桌子上有一本书.',
        'Phủ định của **有** là **没有**, của **是** là **不是**: 桌子上没有书, 学校后边不是医院.']),

 dict(id='liangci2', ten='Lượng từ: 家 · 本 · 把 · 首',
  congThuc=[[['Số / 这 / 那 / 几', 'st'], ['家 / 本 / 把 / 首', 'codinh'], ['DT', 'dt']]],
  giaiThich='**家** cho cửa hàng, nhà hàng, bệnh viện… (一家超市), **本** cho sách (一本书), **把** cho vật có tay cầm, như cái ghế (一把椅子), **首** cho bài hát (一首歌). Công thức: **Số / 这 / 那 / 几 + lượng từ + danh từ**.',
  y=[
   dict(noiDung='家: cửa hàng, nhà hàng, rạp phim',
    cum=[C('一[家:codinh]电影院', 'yì jiā diànyǐngyuàn'), C('这[家:codinh]饭店', 'zhè jiā fàndiàn'), C('那[家:codinh]书店', 'nà jiā shūdiàn')],
    viDu=[C('学校前边有一[家:codinh]电影院。', 'Xuéxiào qiánbian yǒu yì jiā diànyǐngyuàn.')]),
   dict(noiDung='本: sách',
    cum=[C('一[本:codinh]书', 'yì běn shū'), C('这[本:codinh]书', 'zhè běn shū'), C('两[本:codinh]中文书', 'liǎng běn Zhōngwén shū')],
    viDu=[C('这[本:codinh]书是我同学的书。', 'Zhè běn shū shì wǒ tóngxué de shū.')]),
   dict(noiDung='把: ghế',
    cum=[C('一[把:codinh]椅子', 'yì bǎ yǐzi'), C('这[把:codinh]椅子', 'zhè bǎ yǐzi'), C('几[把:codinh]椅子', 'jǐ bǎ yǐzi')],
    viDu=[C('房间里有两[把:codinh]椅子。', 'Fángjiān li yǒu liǎng bǎ yǐzi.')]),
   dict(noiDung='首: bài hát',
    cum=[C('一[首:codinh]歌', 'yì shǒu gē'), C('这[首:codinh]歌', 'zhè shǒu gē')],
    viDu=[C('老师请他们唱几[首:codinh]中文歌。', 'Lǎoshī qǐng tāmen chàng jǐ shǒu Zhōngwén gē.')]),
  ],
  luuY=['**家** làm lượng từ chỉ nơi kinh doanh, bệnh viện; làm danh từ là **nhà**: 我家, 在家.',
        '**两** đứng trước lượng từ (không nói 二本): 两本书, 两把椅子.',
        'Mỗi danh từ có lượng từ riêng: sách → **本**, ghế → **把**, bài hát → **首**, siêu thị → **家**.']),

 dict(id='zhishi', ten='Đại từ chỉ định: 这 / 那 / 哪 + (Số) + lượng từ + DT',
  congThuc=[[['这 / 那 / 哪', 'codinh'], ['(Số)', 'st'], ['LT', 'codinh'], ['DT', 'dt']]],
  giaiThich='**这** là "này", **那** là "kia, đó", **哪** là "nào". Đứng trước **lượng từ + danh từ**: **那个人** (người kia), **那本书** (quyển sách đó), **那家书店** (hiệu sách kia). Số từ **一** thường bỏ. **那个** vừa là "cái kia" vừa dùng thay cho cả danh từ khi đã rõ. Chỉ nơi chốn dùng **那边** (bên kia).',
  y=[
   dict(noiDung='那 + LT + DT',
    cum=[C('[那个:codinh]人', 'nàge rén'), C('[那:codinh]本书', 'nà běn shū'), C('[那:codinh]家书店', 'nà jiā shūdiàn')],
    viDu=[C('[那个:codinh]老师是中国人。', 'Nàge lǎoshī shì Zhōngguó rén.'), C('我们去[那:codinh]家书店买书吧。', 'Wǒmen qù nà jiā shūdiàn mǎi shū ba.')]),
   dict(noiDung='这 + LT + DT',
    cum=[C('[这个:codinh]人', 'zhège rén'), C('[这:codinh]本书', 'zhè běn shū')],
    viDu=[C('[这:codinh]本书是我的。', 'Zhè běn shū shì wǒ de.')]),
   dict(noiDung='哪 + LT + DT: hỏi lựa chọn',
    cum=[C('[哪个:codinh]人', 'nǎge rén'), C('[哪:codinh]本书', 'nǎ běn shū'), C('[哪:codinh]家饭店', 'nǎ jiā fàndiàn')],
    viDu=[C('你想去[哪:codinh]家饭店？', 'Nǐ xiǎng qù nǎ jiā fàndiàn?')]),
  ],
  luuY=['**这个** đọc zhège, **那个** đọc nàge, **哪个** đọc nǎge (khi nói nhanh còn đọc zhèi, nèi, něi).',
        '**这 / 那 / 哪 + lượng từ + danh từ**; không nói 这书, mà nói 这本书.',
        '**哪** hỏi chọn lựa, đứng trước lượng từ: 哪本书？ (quyển sách nào?).']),

 dict(id='di', ten='Số thứ tự: 第 + Số + lượng từ + DT',
  congThuc=[[['第', 'codinh'], ['Số', 'st'], ['(LT)', 'codinh'], ['(DT)', 'dt']]],
  giaiThich='**第** đặt **trước số từ** để tạo **số thứ tự**: **第一** (thứ nhất), **第二** (thứ hai), **第三** (thứ ba). Công thức: **第 + Số + lượng từ + danh từ** = "… thứ …": **第二本书** (quyển sách thứ hai). Hỏi thứ tự dùng **第几**.',
  y=[
   dict(noiDung='第 + Số',
    cum=[C('[第一:codinh]', 'dì-yī'), C('[第二:codinh]', 'dì-èr'), C('[第三:codinh]', 'dì-sān')],
    viDu=[C('我是[第三:codinh]个。', 'Wǒ shì dì-sān ge.')]),
   dict(noiDung='第 + Số + lượng từ + DT',
    cum=[C('[第一个:codinh]学生', 'dì-yī ge xuésheng'), C('[第二本:codinh]书', 'dì-èr běn shū')],
    viDu=[C('这是我的[第二本:codinh]中文书。', 'Zhè shì wǒ de dì-èr běn Zhōngwén shū.'), C('他的[第一个:codinh]女朋友是法国人。', 'Tā de dì-yī ge nǚ péngyou shì Fǎguó rén.')]),
   dict(noiDung='Hỏi thứ tự: 第几',
    cum=[C('[第几:codinh]个', 'dì-jǐ ge'), C('[第几:codinh]本', 'dì-jǐ běn')],
    viDu=[C('A：你是[第几:codinh]个？\nB：我是第三个。', 'A: Nǐ shì dì-jǐ ge?\nB: Wǒ shì dì-sān ge.')]),
  ],
  luuY=['**第** luôn đứng **trước số từ**: 第一, 第二; viết hay đọc đều nối bằng gạch ngang trong phiên âm: dì-yī.',
        'Số thứ tự dùng **二** (không dùng 两): **第二** (dì-èr), không nói 第两.',
        'Hỏi thứ tự: **第几 + lượng từ**; hỏi số lượng là **几 + lượng từ** (几本书 = mấy quyển sách).']),

 dict(id='zhuangyu', ten='Thời gian + 在 + nơi chốn + ĐT',
  congThuc=[[['S', 'dt'], ['Thời gian', 'dt'], ['在', 'codinh'], ['Nơi chốn', 'dt'], ['ĐT (+ O)', 'dgt']], [['Thời gian', 'dt'], ['S', 'dt'], ['在', 'codinh'], ['Nơi chốn', 'dt'], ['ĐT (+ O)', 'dgt']]],
  giaiThich='Khi **từ chỉ thời gian** và **từ chỉ nơi chốn** cùng làm **trạng ngữ**, từ chỉ thời gian đứng **trước** từ chỉ nơi chốn: **S + thời gian + 在 + nơi chốn + ĐT**. Thời gian cũng có thể đứng **đầu câu**, trước chủ ngữ.',
  y=[
   dict(noiDung='S + Thời gian + 在 + Nơi chốn + ĐT',
    cum=[C('[七点:codinh]在电影院外边见', 'qī diǎn zài diànyǐngyuàn wàibian jiàn'), C('[明天上午:codinh]在学校学习', 'míngtiān shàngwǔ zài xuéxiào xuéxí')],
    viDu=[C('我们[七点:codinh]在电影院外边见。', 'Wǒmen qī diǎn zài diànyǐngyuàn wàibian jiàn.'), C('我[明天上午:codinh]在学校学习。', 'Wǒ míngtiān shàngwǔ zài xuéxiào xuéxí.')]),
   dict(noiDung='Thời gian + S + 在 + Nơi chốn + ĐT',
    cum=[],
    viDu=[C('[明天中午:codinh]陈天中在学校吃午饭。', 'Míngtiān zhōngwǔ Chén Tiānzhōng zài xuéxiào chī wǔfàn.'), C('[白天:codinh]他在医院工作。', 'Báitiān tā zài yīyuàn gōngzuò.')]),
  ],
  luuY=['**Thời gian đứng trước nơi chốn**: 我明天上午在学校学习, không nói 我在学校明天上午学习.',
        'Cả hai đều đứng **trước động từ**: thời gian + 在 + nơi chốn + ĐT.',
        'Thời gian có thể đứng **đầu câu** hoặc **sau chủ ngữ**, nơi chốn luôn đứng **ngay trước động từ**.']),

 dict(id='he', ten='和: liên từ "và" · giới từ "cùng với"',
  congThuc=[[['A', 'dt'], ['和', 'codinh'], ['B', 'dt']], [['S', 'dt'], ['和', 'codinh'], ['người', 'dt'], ['ĐT (+ O)', 'dgt']]],
  giaiThich='**和** có hai cách dùng. **(1) Liên từ**, nối hai danh từ: **A 和 B** = "A và B" (桌子和椅子). **(2) Giới từ**, nghĩa **"cùng với"**: **S + 和 + người + ĐT** (我和朋友们去外边唱歌), **和** đứng **trước động từ**.',
  y=[
   dict(noiDung='A 和 B: A và B',
    cum=[C('桌子[和:codinh]椅子', 'zhuōzi hé yǐzi'), C('米饭[和:codinh]菜', 'mǐfàn hé cài')],
    viDu=[C('房间里有桌子[和:codinh]椅子。', 'Fángjiān li yǒu zhuōzi hé yǐzi.')]),
   dict(noiDung='S + 和 + người + ĐT: cùng với…',
    cum=[C('[和:codinh]朋友玩', 'hé péngyou wán'), C('[和:codinh]妈妈做饭', 'hé māma zuò fàn'), C('[和:codinh]小狗玩', 'hé xiǎo gǒu wán')],
    viDu=[C('晚上我[和:codinh]朋友们去外边唱歌。', 'Wǎnshang wǒ hé péngyoumen qù wàibian chàng gē.'), C('孩子们[和:codinh]小狗玩。', 'Háizimen hé xiǎo gǒu wán.')]),
  ],
  luuY=['**和** làm giới từ đứng **trước động từ**: 我和朋友去 (tôi cùng bạn đi), khác tiếng Việt "đi cùng bạn".',
        '**和** chỉ nối **danh từ** (hoặc đại từ), không nối hai câu, hai động từ.',
        'Phủ định đặt **不 / 没** **trước 和**: 我不和他去 (tôi không đi cùng anh ấy).']),
]
