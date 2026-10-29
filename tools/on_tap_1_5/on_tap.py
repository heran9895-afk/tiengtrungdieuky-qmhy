# -*- coding: utf-8 -*-
"""Ôn tập tổng hợp Bài 1–5 (HSK 3.0) — nội dung các phần trắc nghiệm (trừ Bài dịch: xem dich.py).
Mọi chữ Hán trong đề / đáp án / nhiễu: vốn Bài 1–5 + chữ ở mục Chữ Hán của Nhập môn (Nét, Thuận bút, Kết cấu).
Kiểm: python3 tools/on_tap_1_5/kiem.py
"""

# =====================================================================
# A. NGỮ ÂM
# =====================================================================
# A1 · Nghe chữ, chọn thanh mẫu  (chữ, đáp án, [nhiễu])
THANH_MAU = [
    ('这', 'zh', ['z', 'j']), ('菜', 'c', ['ch', 'q']), ('是', 'sh', ['s', 'x']), ('认', 'r', ['l', 'zh']),
    ('去', 'q', ['ch', 'c']), ('谢', 'x', ['sh', 's']), ('再', 'z', ['zh', 'j']), ('叫', 'j', ['zh', 'z']),
    ('吃', 'ch', ['c', 'q']), ('岁', 's', ['sh', 'x']), ('朋', 'p', ['b', 'f']), ('哥', 'g', ['k', 'h']),
    ('他', 't', ['d', 'h']), ('弟', 'd', ['t', 'b']), ('客', 'k', ['g', 'h']), ('饭', 'f', ['h', 'p']),
]
# A2 · Nghe chữ, chọn vận mẫu (âm tiết không dấu, giữ chữ cái đầu)
VAN_MAU = [
    ('新', 'xin', ['xing', 'xian']), ('星', 'xing', ['xin', 'xiong']), ('忙', 'mang', ['man', 'meng']),
    ('饭', 'fan', ['fang', 'fen']), ('很', 'hen', ['heng', 'han']), ('朋', 'peng', ['pen', 'pang']),
    ('狗', 'gou', ['guo', 'gao']), ('多', 'duo', ['dou', 'du']), ('九', 'jiu', ['jie', 'jiao']),
    ('岁', 'sui', ['su', 'suo']), ('谢', 'xie', ['xue', 'xia']), ('学', 'xue', ['xie', 'xu']),
    ('女', 'nü', ['nu', 'niu']), ('月', 'yue', ['ye', 'you']), ('两', 'liang', ['lian', 'ling']),
    ('天', 'tian', ['tan', 'ting']),
]
# A3 · Nghe một chữ, chọn chữ đúng trong nhóm đọc gần giống (khác thanh / khác âm đầu)
NGHE_CHU = [
    ('号', ['好']), ('好', ['号']), ('十', ['是', '四']), ('四', ['是', '十']), ('是', ['十', '四']),
    ('哪', ['那']), ('那', ['哪']), ('太', ['台']), ('台', ['太']), ('文', ['问']), ('问', ['文']),
]
# A4 · Chọn pinyin đúng của từ (máy đọc từ)
PY_TU = [
    ('汉语', 'Hànyǔ', ['Hányǔ', 'Hànyù']), ('电脑', 'diànnǎo', ['diànnáo', 'diānnǎo']),
    ('喜欢', 'xǐhuan', ['xīhuan', 'xíhuan']), ('饺子', 'jiǎozi', ['jiāozi', 'jiàozi']),
    ('面条儿', 'miàntiáor', ['miāntiáor', 'miàntiāor']), ('星期', 'xīngqī', ['xíngqī', 'xīngqí']),
    ('休息', 'xiūxi', ['xiùxi', 'xiúxi']), ('生日', 'shēngrì', ['shèngrì', 'shēngrí']),
    ('昨天', 'zuótiān', ['zuǒtiān', 'zuòtiān']), ('女儿', "nǚ'ér", ["nǔ'ér", "nǚ'èr"]),
    ('认识', 'rènshi', ['rénshi', 'rěnshi']), ('高兴', 'gāoxìng', ['gàoxìng', 'gāoxīng']),
]
# A5 · Biến điệu 不 · 一: chọn cách ghi pinyin đúng (đúng, sai)
BIEN_DIEU = [
    ('不是', 'bú shì', 'bù shì'), ('不忙', 'bù máng', 'bú máng'), ('不会', 'bú huì', 'bù huì'),
    ('不好', 'bù hǎo', 'bú hǎo'), ('不客气', 'bú kèqi', 'bù kèqi'), ('不太', 'bú tài', 'bù tài'),
    ('不想', 'bù xiǎng', 'bú xiǎng'), ('不认识', 'bú rènshi', 'bù rènshi'),
    ('是不是', 'shì bu shì', 'shì bú shì'), ('会不会', 'huì bu huì', 'huì bú huì'),
    ('一个', 'yí ge', 'yì ge'), ('一些', 'yìxiē', 'yíxiē'), ('一百', 'yìbǎi', 'yíbǎi'),
    ('一万', 'yíwàn', 'yìwàn'), ('一台', 'yì tái', 'yí tái'), ('第一', 'dì-yī', 'dì-yí'),
    ('一月', 'yī yuè', 'yí yuè'), ('十一', 'shíyī', 'shíyí'),
]
# A6 · Câu hỏi quy tắc (đề, đáp án, [nhiễu], lời giải)
QUY_TAC_AM = [
    ('Trong các cụm sau, 不 đọc thanh 2 ở cụm nào?', '不对', ['不忙', '不好', '不吃'],
     '不 đứng trước chữ mang thanh 4 thì đọc thanh 2: 不对 bú duì.'),
    ('Trong các cụm sau, 一 đọc thanh 2 ở cụm nào?', '一个', ['一些', '一百', '一年'],
     '一 đứng trước thanh 4 (kể cả 个 đọc nhẹ, gốc thanh 4) đọc thanh 2: yí ge. Trước thanh 1, 2, 3 đọc thanh 4.'),
    ('Cụm nào có hiện tượng biến điệu hai thanh 3 khi đọc?', '很好', ['你们', '姥姥', '很忙'],
     '很 hěn + 好 hǎo: hai thanh 3 liền nhau, chữ trước đọc thành thanh 2. 你们, 姥姥 có âm tiết sau đọc nhẹ nên không đổi.'),
    ('Cụm nào có hiện tượng biến điệu hai thanh 3 khi đọc?', '很想', ['很忙', '很大', '很高兴'],
     '很 hěn + 想 xiǎng: hai thanh 3 liền nhau.'),
    ('Khi đọc 你好, chữ 你 đọc thanh mấy?', 'Thanh 2', ['Thanh 3', 'Thanh 1', 'Thanh 4'],
     'Hai thanh 3 đi liền nhau thì chữ đứng trước đọc thành thanh 2; khi viết pinyin vẫn ghi thanh gốc: nǐ hǎo.'),
    ('Viết pinyin của 你好 thế nào cho đúng?', 'nǐ hǎo', ['ní hǎo', 'nǐ háo'],
     'Biến điệu hai thanh 3 chỉ đổi khi đọc, không ghi lên pinyin (khác với 一, 不).'),
    ('Từ nào có âm tiết đọc thanh nhẹ?', '谢谢', ['老师', '同学', '汉语'], '谢谢 xièxie: chữ thứ hai đọc nhẹ.'),
    ('Từ nào có âm tiết đọc thanh nhẹ?', '名字', ['中国', '今天', '电脑'], '名字 míngzi.'),
    ('Từ nào có âm tiết đọc thanh nhẹ?', '喜欢', ['生日', '面包', '下班'], '喜欢 xǐhuan.'),
    ('Từ nào có âm tiết đọc thanh nhẹ?', '饺子', ['中文', '星期', '工作'], '饺子 jiǎozi: 子 làm hậu tố đọc nhẹ.'),
    ('Từ nào có âm tiết đọc thanh nhẹ?', '朋友', ['越南', '法国', '明年'], '朋友 péngyou.'),
    ('Từ nào có âm tiết đọc thanh nhẹ?', '休息', ['今年', '电脑', '生日'], '休息 xiūxi.'),
    ('Từ nào chữ 儿 KHÔNG đọc thành một âm tiết riêng?', '面条儿', ['女儿', '儿子'],
     '面条儿 miàntiáor: 儿 hóa vận, chỉ thêm r vào âm tiết trước. 女儿 nǚ\'ér, 儿子 érzi: 儿 mang nghĩa, đọc riêng.'),
    ('Pinyin đúng của 面条儿 là:', 'miàntiáor', ["miàntiáo'ér", 'miàntiáo ér'], '儿 hóa vận ghi r dính vào âm tiết trước.'),
    ('Pinyin đúng của 去 là:', 'qù', ['qǜ', 'qiù'], 'ü đứng sau j, q, x, y thì bỏ hai chấm: qù.'),
    ('Pinyin đúng của 女 là:', 'nǚ', ['nǔ', 'niǔ'], 'Sau n, l thì giữ hai chấm của ü: nǚ (khác nǔ).'),
    ('Pinyin đúng của 月 là:', 'yuè', ['yüè', 'üè'], 'Vận mẫu üe đứng một mình viết yue.'),
    ('Pinyin đúng của 有 là:', 'yǒu', ['iǒu', 'yiǒu'], 'Vận mẫu iou đứng một mình viết you.'),
    ('Pinyin đúng của 我 là:', 'wǒ', ['uǒ', 'wuǒ'], 'Vận mẫu uo đứng một mình viết wo.'),
    ('Pinyin đúng của 九 là:', 'jiǔ', ['jíu', 'jioǔ'], 'iou đứng sau thanh mẫu viết gọn thành iu, dấu thanh đặt trên u: jiǔ.'),
    ('Pinyin đúng của 对 là:', 'duì', ['dùi', 'duèi'], 'uei đứng sau thanh mẫu viết gọn thành ui, dấu thanh đặt trên i: duì.'),
    ('Pinyin đúng của 岁 là:', 'suì', ['sùi', 'suèi'], 'Dấu thanh của ui đặt trên i: suì.'),
    ('Pinyin đúng của 学 là:', 'xué', ['xüé', 'xuó'], 'ü sau x bỏ hai chấm: xué.'),
    ('Pinyin đúng của 女儿 là:', "nǚ'ér", ['nǚér', 'nǚ-ér'], 'Âm tiết bắt đầu bằng a, o, e đứng sau âm tiết khác thì có dấu cách âm \'.'),
    ('Pinyin đúng của 二十二 là:', "èrshí'èr", ['èrshíèr', 'èr shí èr'], 'Dấu cách âm \' trước âm tiết èr.'),
]

# =====================================================================
# B. CHỮ HÁN
# =====================================================================
# B1 · Đếm số nét (số nét kiểm theo hanzi-writer-data + cnchar)
DEM_NET = ['九', '几', '儿', '女', '也', '门', '么', '万', '见', '认', '他', '号', '它', '电', '我', '你', '没', '这',
           '两', '那', '年', '岁', '爸', '姐', '国', '哪', '是', '星', '家', '谁', '息', '班', '菜', '第', '做', '喝',
           '谢', '期', '道', '新', '想', '口', '小', '回', '品', '医', '学']
# B2 · Tìm chữ có (hoặc không có) một nét cơ bản: (nét, có/không, đáp án, [nhiễu])
NET_CO_BAN = {'Chấm': '点', 'Ngang': '横', 'Sổ': '竖', 'Phẩy': '撇', 'Mác': '捺', 'Hất': '提', 'Gập': '折', 'Móc': '钩'}
TIM_NET = [
    ('Chấm', True, '门', ['中', '大', '九']), ('Chấm', True, '六', ['五', '七', '二']),
    ('Ngang', False, '人', ['大', '十', '天']), ('Ngang', False, '八', ['三', '口', '五']),
    ('Sổ', False, '八', ['十', '中', '口']), ('Sổ', False, '大', ['日', '中', '口']),
    ('Phẩy', True, '九', ['口', '三', '中']), ('Phẩy', True, '么', ['日', '五', '十']),
    ('Mác', True, '大', ['口', '中', '日']), ('Mác', True, '会', ['号', '电', '台']),
    ('Hất', True, '我', ['文', '天', '中']), ('Hất', True, '汉', ['口', '号', '五']),
    ('Gập', True, '日', ['文', '大', '十']), ('Gập', True, '国', ['人', '八', '大']),
    ('Móc', True, '小', ['口', '八', '天']), ('Móc', True, '你', ['四', '口', '日']),
]
# B2b · Nét đầu tiên của chữ (theo quy tắc thuận bút): (chữ, tên nét)
NET_DAU = [('你', 'Phẩy'), ('国', 'Sổ'), ('这', 'Chấm'), ('大', 'Ngang'), ('门', 'Chấm'), ('九', 'Phẩy'),
           ('月', 'Phẩy'), ('十', 'Ngang'), ('八', 'Phẩy'), ('三', 'Ngang'), ('文', 'Chấm'), ('口', 'Sổ')]

# B3 · Loại hình chữ Hán (4 loại cô dạy). Lời giải: phân tích theo Thuyết văn giải tự / giáo trình văn tự học phổ thông.
LOAI_HINH = {
    'Tượng hình': dict(dn='Vẽ phác hình dáng sự vật.', chu={
        '人': 'hình người đứng nghiêng', '口': 'hình cái miệng', '日': 'hình mặt trời', '月': 'hình trăng khuyết',
        '女': 'hình người phụ nữ ngồi khoanh tay', '子': 'hình đứa trẻ quấn tã, giơ tay', '山': 'hình ba ngọn núi',
        '门': 'hình hai cánh cửa (門)', '目': 'hình con mắt (dựng đứng)', '木': 'hình cái cây có cành và rễ',
        '心': 'hình trái tim', '手': 'hình bàn tay năm ngón', '大': 'hình người đứng dang tay chân'}),
    'Chỉ sự': dict(dn='Dùng nét, kí hiệu trừu tượng (hoặc thêm kí hiệu vào chữ tượng hình) để chỉ ý.', chu={
        '一': 'một vạch chỉ số một', '二': 'hai vạch chỉ số hai', '三': 'ba vạch chỉ số ba',
        '上': 'nét ngắn ở trên vạch ngang: phía trên', '下': 'nét ngắn ở dưới vạch ngang: phía dưới',
        '本': 'thêm vạch vào gốc chữ 木: gốc cây → gốc, vốn'}),
    'Hội ý': dict(dn='Ghép hai (hoặc nhiều) chữ để hợp nghĩa thành nghĩa mới; không có phần biểu âm.', chu={
        '休': '亻 (người) dựa vào 木 (cây): nghỉ', '好': '女 (phụ nữ) + 子 (con): tốt, đẹp',
        '明': '日 (mặt trời) + 月 (mặt trăng): sáng', '看': '手 (tay, viết 龵) che trên 目 (mắt): nhìn',
        '男': '田 (ruộng) + 力 (sức): người đàn ông', '安': '女 (phụ nữ) dưới 宀 (mái nhà): yên ổn',
        '品': 'ba 口: nhiều người, nhiều thứ → phẩm', '名': '夕 (tối) + 口 (miệng): tối không thấy mặt nên gọi tên',
        '见': '見 = 目 (mắt) + 儿 (người): nhìn thấy (见 là dạng giản thể)', '位': '亻 (người) + 立 (đứng): chỗ đứng → vị trí'}),
    'Hình thanh': dict(dn='Một phần biểu nghĩa (hình bàng) + một phần biểu âm (thanh bàng). Phần lớn chữ Hán thuộc loại này.', chu={
        '妈': '女 (nghĩa) + 马 mǎ (âm)', '吗': '口 (nghĩa) + 马 mǎ (âm)', '们': '亻 (nghĩa) + 门 mén (âm)',
        '问': '口 (nghĩa) + 门 mén (âm)', '请': '讠 (nghĩa) + 青 qīng (âm)', '忙': '忄 (nghĩa) + 亡 wáng (âm)',
        '想': '心 (nghĩa) + 相 xiāng (âm)', '期': '月 (nghĩa) + 其 qí (âm)', '星': '日 (nghĩa) + 生 shēng (âm)',
        '饭': '饣 (nghĩa) + 反 fǎn (âm)', '饺': '饣 (nghĩa) + 交 jiāo (âm)', '菜': '艹 (nghĩa) + 采 cǎi (âm)',
        '爸': '父 (nghĩa) + 巴 bā (âm)', '姐': '女 (nghĩa) + 且 qiě (âm)', '妹': '女 (nghĩa) + 未 wèi (âm)',
        '姥': '女 (nghĩa) + 老 lǎo (âm)', '呢': '口 (nghĩa) + 尼 ní (âm)', '哪': '口 (nghĩa) + 那 nà (âm)',
        '零': '雨 (nghĩa) + 令 lìng (âm)', '语': '讠 (nghĩa) + 吾 wú (âm)', '你': '亻 (nghĩa) + 尔 ěr (âm)'}),
}
# B3b · Chữ hình thanh: bộ phận nào biểu âm? (chữ, phần âm, phần nghĩa) — cả hai phần đều đã học
BIEU_AM = [('妈', '马', '女'), ('吗', '马', '口'), ('们', '门', '亻'), ('问', '门', '口'), ('姥', '老', '女'),
           ('哪', '那', '口'), ('星', '生', '日'), ('请', '青', '讠'), ('期', '其', '月')]

# B4 · Kết cấu chữ Hán (tên theo mục Kết cấu chữ Hán của Nhập môn)
KET_CAU = {
    'Độc thể': ['人', '大', '中', '女', '子', '不', '电', '九', '生', '门', '口'],
    'Trái phải': ['你', '好', '妈', '明', '叫', '很', '吃', '喝', '饭', '欢', '期', '新', '和', '汉', '他', '哪'],
    'Trái giữa phải': ['谢', '班', '做'],
    'Trên dưới': ['字', '您', '是', '想', '息', '爸', '星', '岁', '第', '名', '男', '些', '安', '家', '会', '号', '它', '看'],
    'Trên giữa dưới': ['京'],
    'Bao toàn phần': ['国', '四', '回'],
    'Bao trên trái': ['店', '床'],
    'Bao trên phải': ['包'],
    'Bao trái dưới': ['这', '还', '进', '道', '远', '越'],
    'Bao ba mặt, hở dưới': ['同', '问'],
    'Bao ba mặt, hở trên': ['凶'],
    'Bao ba mặt, hở phải': ['医'],
    'Chữ phẩm': ['品'],
}
# B5 · Quy tắc thuận bút: chữ được viết theo quy tắc nào (tên quy tắc như ở Nhập môn)
THUAN_BUT = [
    ('十', 'Ngang trước, sổ sau'), ('八', 'Phẩy trước, mác sau'), ('人', 'Phẩy trước, mác sau'),
    ('三', 'Trên trước, dưới sau'), ('你', 'Trái trước, phải sau'), ('明', 'Trái trước, phải sau'),
    ('月', 'Ngoài trước, trong sau'), ('国', 'Vào trước, đóng sau'), ('四', 'Vào trước, đóng sau'),
    ('小', 'Giữa trước, hai bên sau'), ('文', 'Chấm ở trên hoặc trên bên trái: viết chấm trước'),
    ('六', 'Chấm ở trên hoặc trên bên trái: viết chấm trước'), ('门', 'Chấm ở trên hoặc trên bên trái: viết chấm trước'),
    ('我', 'Chấm ở trên bên phải hoặc trong lòng chữ: viết chấm sau'), ('太', 'Chấm ở trên bên phải hoặc trong lòng chữ: viết chấm sau'),
    ('这', 'Khung bao trái và dưới: trong trước, ngoài sau'), ('还', 'Khung bao trái và dưới: trong trước, ngoài sau'),
    ('进', 'Khung bao trái và dưới: trong trước, ngoài sau'), ('问', 'Khung bao trái, trên, phải: ngoài trước, trong sau'),
    ('同', 'Khung bao trái, trên, phải: ngoài trước, trong sau'), ('包', 'Khung bao phía trên: ngoài trước, trong sau'),
    ('医', 'Khung bao trên, trái, dưới: trên, rồi trong, rồi trái dưới'), ('山', 'Khung bao trái, dưới, phải: trong trước, ngoài sau'),
]
# B6 · Chữ nào có bộ …? (bộ, đáp án, [nhiễu]) — bộ thủ đã có thẻ ở Bài 1–5
TIM_BO = [
    ('女', '妈', ['吗', '们', '请']), ('讠', '谁', ['姐', '吃', '忙']), ('口', '喝', ['你', '妹', '这']),
    ('亻', '做', ['好', '明', '汉']), ('宀', '字', ['李', '是', '会']), ('氵', '没', ['认', '岁', '饭']),
    ('忄', '忙', ['想', '您', '还']), ('辶', '进', ['同', '问', '国']), ('艹', '菜', ['第', '家', '星']),
    ('⺮', '第', ['菜', '字', '爸']), ('日', '星', ['看', '岁', '饭']), ('目', '看', ['星', '是', '明']),
    ('门', '们', ['你', '他', '好']), ('心', '想', ['忙', '做', '休']),
]
# B7 · Ghép bộ thủ: dùng lại ghepChu của Bài 1–5 (36 chữ, đã duyệt) — không soạn mới.

# =====================================================================
# C. TỪ VỰNG
# =====================================================================
# C1 · Dùng lại bộ máy Bài tập (luyen-tap.js) với toàn bộ từ Bài 1–5 — không soạn mới.
# C2 · Xếp từ vào nhóm (mỗi lượt bốc 3 nhóm × 3 từ). Một từ chỉ thuộc một nhóm.
NHOM_TU = {
    'Người trong gia đình': ['爸爸', '妈妈', '哥哥', '姐姐', '弟弟', '妹妹', '爷爷', '奶奶', '姥姥', '姥爷',
                             '儿子', '女儿', '丈夫', '妻子', '老公', '老婆'],
    'Quốc gia': ['中国', '法国', '泰国', '越南', '英国', '美国', '日本'],
    'Thời gian': ['今天', '昨天', '明天', '今年', '去年', '明年', '星期日', '星期天'],
    'Món ăn': ['饺子', '面条儿', '面包', '包子'],
    'Lượng từ': ['个', '口', '位', '台', '道'],
    'Đại từ để hỏi': ['谁', '什么', '哪', '几', '多少'],
    'Tính từ': ['高兴', '忙', '新', '旧', '好看', '好吃', '好听'],
    'Động từ': ['叫', '认识', '说', '问', '进', '坐', '去', '休息', '喜欢', '下班', '上班'],
}
# C3 · Tìm từ khác nhóm (từ đúng, [3 từ cùng nhóm], lời giải)
KHAC_NHOM = [
    ('老师', ['爸爸', '妈妈', '哥哥'], '老师 là nghề nghiệp, ba từ còn lại là người trong gia đình.'),
    ('中文', ['中国', '法国', '越南'], '中文 là ngôn ngữ, ba từ còn lại là tên nước.'),
    ('面条儿', ['今天', '明天', '昨天'], '面条儿 là món ăn, ba từ còn lại chỉ thời gian.'),
    ('喜欢', ['好吃', '好看', '好听'], '喜欢 là động từ, ba từ còn lại là tính từ 好 + ĐT.'),
    ('菜', ['个', '口', '台'], '菜 là danh từ, ba từ còn lại là lượng từ.'),
    ('同事', ['儿子', '女儿', '孩子'], '同事 là người cùng chỗ làm, ba từ còn lại là con cái.'),
    ('电脑', ['饺子', '包子', '面包'], '电脑 là đồ vật, ba từ còn lại là món ăn.'),
    ('新', ['休息', '下班', '上班'], '新 là tính từ, ba từ còn lại là động từ.'),
]

# =====================================================================
# D. NGỮ PHÁP · câu tổng hợp liên bài (ngoài kho Luyện ngữ pháp Bài 2–5 đã duyệt)
# dang: chon (chọn từ điền) · dungSai (câu đúng hay sai; sai thì có câu sửa) · xep (xếp câu; có thể nhiều đáp án)
# =====================================================================
NGU_PHAP = [
    dict(ma='np01', dang='chon', np='you', de='我＿＿有弟弟。', dap='没', nhieu=['不', '很'], giai='Phủ định của 有 là 没(有), không nói 不有.'),
    dict(ma='np02', dang='chon', np='hui', de='我妈妈＿＿会做饭。', dap='不', nhieu=['没', '吗'], giai='Phủ định của 会 là 不会, không nói 没会.'),
    dict(ma='np03', dang='chon', np='vnDanhTu', de='今天＿＿星期日，是星期六。', dap='不是', nhieu=['不', '没有'],
         giai='Câu vị ngữ danh từ: khẳng định không cần 是, phủ định phải có 是 → 不是.'),
    dict(ma='np04', dang='chon', np='duoshao', de='你有＿＿朋友？', dap='多少', nhieu=['几', '吗'],
         giai='Sau 几 bắt buộc có lượng từ (几个朋友); 多少 có thể bỏ lượng từ.'),
    dict(ma='np05', dang='chon', np='stlt', de='她有＿＿个孩子，一个儿子，一个女儿。', dap='两', nhieu=['二', '第'],
         giai='Số 2 đứng trước lượng từ dùng 两.'),
    dict(ma='np06', dang='chon', np='di', de='这是我的第＿＿个中国朋友。', dap='二', nhieu=['两', '几'],
         giai='Thứ tự dùng 二: 第二个. 两 chỉ số lượng.'),
    dict(ma='np07', dang='chon', np='ne', de='我是越南人，你＿＿？', dap='呢', nhieu=['吗', '的'],
         giai='Điều muốn hỏi đã nói ở trước → B呢？ (còn bạn?).'),
    dict(ma='np08', dang='chon', np='tai', de='这道菜＿＿好吃了！', dap='太', nhieu=['真', '不太'],
         giai='Khung 太……了. 真 và 不太 không đi với 了 ở cuối.'),
    dict(ma='np09', dang='chon', np='zhen', de='你的电脑＿＿新吗？', dap='很', nhieu=['真', '的'],
         giai='真 dùng để cảm thán, không dùng trong câu hỏi; hỏi thì dùng 很.'),
    dict(ma='np10', dang='chon', np='trangNgu', de='我们休息＿＿。', dap='两天', nhieu=['今天', '星期天'],
         giai='Khoảng thời gian (两天) đứng sau động từ; thời điểm (今天, 星期天) đứng trước động từ.'),
    dict(ma='np11', dang='chon', np='haoV', de='这个菜很＿＿。', dap='好吃', nhieu=['好喝', '好听'],
         giai='Đồ ăn dùng 好吃; 好喝 cho đồ uống, 好听 cho âm thanh.'),
    dict(ma='np12', dang='chon', np='ma', de='你是中国人＿＿？', dap='吗', nhieu=['呢', '的'],
         giai='Câu trần thuật + 吗 thành câu hỏi có/không.'),
    dict(ma='np13', dang='xep', np='trangNgu', khoi=['我', '今天', '休息'], dap=['我今天休息。', '今天我休息。'],
         giai='Từ chỉ thời gian đứng trước chủ ngữ hoặc giữa chủ ngữ và động từ; không đặt ở cuối câu.'),
    dict(ma='np14', dang='xep', np='stlt', khoi=['我', '有', '两个', '哥哥'], dap=['我有两个哥哥。'], giai='ST + LT + DT.'),
    dict(ma='np15', dang='xep', np='hui', khoi=['你', '会不会', '做', '饺子'], dap=['你会不会做饺子？'], giai='Hỏi khả năng: 会不会 + ĐT, không thêm 吗.'),
    dict(ma='np16', dang='xep', np='ye', khoi=['我', '也', '是', '越南人'], dap=['我也是越南人。'], giai='也 đứng sau chủ ngữ, trước động từ.'),
    dict(ma='np17', dang='xep', np='hai', khoi=['我', '姐姐', '还', '很忙'], dap=['我姐姐还很忙。'], giai='还 đứng sau chủ ngữ.'),
    dict(ma='np18', dang='xep', np='ngayThang', khoi=['你的', '生日', '是', '几月', '几号'], dap=['你的生日是几月几号？'], giai='Hỏi ngày: 几月几号.'),
    dict(ma='np19', dang='xep', np='yixie', khoi=['我', '想', '吃', '一些', '面包'], dap=['我想吃一些面包。'], giai='想 + ĐT; 一些 + DT, không thêm lượng từ.'),
    dict(ma='np20', dang='xep', np='de', khoi=['那个', '男人', '是', '我', '爸爸'], dap=['那个男人是我爸爸。'], giai='Đại từ nhân xưng + người thân: lược 的.'),
    dict(ma='np21', dang='dungSai', np='you', cau='我不有妹妹。', dung=False, sua='我没有妹妹。', giai='Phủ định của 有 là 没有.'),
    dict(ma='np22', dang='dungSai', np='hoiTuoi', cau='他是二十岁。', dung=False, sua='他二十岁。', giai='Nói tuổi không cần 是.'),
    dict(ma='np23', dang='dungSai', np='stlt', cau='我有二个哥哥。', dung=False, sua='我有两个哥哥。', giai='Số 2 trước lượng từ dùng 两.'),
    dict(ma='np24', dang='dungSai', np='ngayThang', cau='今天八号九月。', dung=False, sua='今天九月八号。', giai='Tháng trước, ngày sau.'),
    dict(ma='np25', dang='dungSai', np='yixie', cau='这些个人是谁？', dung=False, sua='这些人是谁？', giai='Sau 这些 không thêm lượng từ.'),
    dict(ma='np26', dang='dungSai', np='ji', cau='你有几朋友？', dung=False, sua='你有几个朋友？', giai='Sau 几 bắt buộc có lượng từ.'),
    dict(ma='np27', dang='dungSai', np='ye', cau='也我是学生。', dung=False, sua='我也是学生。', giai='也 đứng sau chủ ngữ.'),
    dict(ma='np28', dang='dungSai', np='hui', cau='你会不会做饭吗？', dung=False, sua='你会不会做饭？', giai='Đã dùng 会不会 thì không thêm 吗.'),
    dict(ma='np29', dang='dungSai', np='vnDanhTu', cau='今天不星期日。', dung=False, sua='今天不是星期日。', giai='Phủ định câu vị ngữ danh từ phải có 是.'),
    dict(ma='np30', dang='dungSai', np='zhen', cau='你的名字真好听了！', dung=False, sua='你的名字真好听！', giai='真 + TT không thêm 了.'),
    dict(ma='np31', dang='dungSai', np='trangNgu', cau='我休息今天。', dung=False, sua='我今天休息。', giai='Không đặt thời gian ở cuối câu.'),
    dict(ma='np32', dang='dungSai', np='ma', cau='你是不是学生吗？', dung=False, sua='你是不是学生？', giai='Đã dùng dạng chính phản thì không thêm 吗.'),
    dict(ma='np33', dang='dungSai', np='tai', cau='我妈妈不太忙。', dung=True, giai='不太 + TT: không … lắm.'),
    dict(ma='np34', dang='dungSai', np='trangNgu', cau='我们休息两天。', dung=True, giai='Khoảng thời gian đứng sau động từ.'),
    dict(ma='np35', dang='dungSai', np='di', cau='他是我的第二个中文老师。', dung=True, giai='第 + 二 + LT + DT.'),
    dict(ma='np36', dang='dungSai', np='yixie', cau='这些包子很好吃。', dung=True, giai='这些 + DT.'),
]

# =====================================================================
# E. ĐỌC HIỂU
# =====================================================================
DOC_HIEU = [
    dict(ma='doc1', ten='Đoạn văn · 安妮', kieu='doanVan', van=[
        '你们好！我叫安妮，我是英国人。', '我是学生，我的中文老师是王老师。', '王老师是中国人，她很好，也很忙。她有二十个学生。',
        '李文是我的同学，他是中国人。白家月也是我的同学，她是法国人。',
        '我家有四口人：爸爸、妈妈、哥哥和我。我哥哥今年二十二岁，他会做饭。他会做饺子，也会做面条儿。'],
     hoi=[
        dict(dang='chon', hoi='安妮是哪国人？', dap='英国人', nhieu=['美国人', '法国人', '中国人']),
        dict(dang='chon', hoi='王老师有多少个学生？', dap='二十个', nhieu=['十二个', '两个', '二百个']),
        dict(dang='dungSai', hoi='白家月是安妮的同学。', dung=True),
        dict(dang='dungSai', hoi='安妮家有五口人。', dung=False),
        dict(dang='dungSai', hoi='安妮的哥哥不会做饭。', dung=False),
     ]),
    dict(ma='doc2', ten='Hội thoại · 明天你上班吗？', kieu='hoiThoai', van=[
        '王一雪：明天几号？', '刘明：明天十一月一号，星期六。', '王一雪：你上班吗？', '刘明：不上班，明天我休息。',
        '王一雪：我们去看爸爸妈妈，好不好？', '刘明：好！你妈妈会做饺子，她的饺子真好吃！',
        '王一雪：我也想吃饺子。我们的儿子喜欢吃包子，女儿喜欢吃面条儿。'],
     hoi=[
        dict(dang='chon', hoi='明天星期几？', dap='星期六', nhieu=['星期日', '星期一', '星期五']),
        dict(dang='chon', hoi='谁会做饺子？', dap='王一雪的妈妈', nhieu=['刘明', '王一雪', '他们的女儿']),
        dict(dang='dungSai', hoi='明天刘明不上班。', dung=True),
        dict(dang='dungSai', hoi='他们的女儿喜欢吃包子。', dung=False),
     ]),
    dict(ma='doc3', ten='Tin nhắn · 李文', kieu='tinNhan', van=[
        '家月，你好！', '明天是我的生日，我休息。我想请你和天中吃饺子。', '我妈妈会做饺子，她的饺子很好吃。',
        '你会不会做菜？你会做法国菜吗？我很想吃法国菜！', '——李文'],
     hoi=[
        dict(dang='chon', hoi='李文想请谁吃饺子？', dap='白家月和陈天中', nhieu=['王老师', '安妮和白家月', '他妈妈']),
        dict(dang='chon', hoi='明天是谁的生日？', dap='李文', nhieu=['白家月', '陈天中', '李文的妈妈']),
        dict(dang='dungSai', hoi='李文的妈妈会做饺子。', dung=True),
        dict(dang='dungSai', hoi='李文不想吃法国菜。', dung=False),
     ]),
]

# =====================================================================
# F. NGHE (giọng đọc máy, như các phần nghe khác của web)
# =====================================================================
# F1 · Nghe số, chọn chữ số
NGHE_SO = [('二十二', '22', ['12', '20']), ('一百零八', '108', ['180', '118']), ('两千', '2000', ['200', '20000']),
           ('一千零五', '1005', ['1050', '1500']), ('两万', '20000', ['2000', '200']), ('九十九', '99', ['19', '90']),
           ('一百一十', '110', ['101', '111']), ('十四', '14', ['40', '4']), ('四十', '40', ['14', '4'])]
# F2 · Nghe ngày tháng / thứ (đáp án ghi bằng số, không dùng nghĩa tiếng Việt)
NGHE_NGAY = [('九月八号', '8/9', ['9/8', '8/10']), ('十月一号', '1/10', ['10/1', '1/11']),
             ('五月二十号', '20/5', ['20/6', '25/5']), ('十二月二十五号', '25/12', ['25/2', '25/11']),
             ('星期三', 'Thứ 4', ['Thứ 3', 'Thứ 5']), ('星期一', 'Thứ 2', ['Thứ 3', 'Chủ nhật']),
             ('星期日', 'Chủ nhật', ['Thứ 7', 'Thứ 2']), ('二〇二六年', '2026', ['2006', '2062'])]
# F3 · Nghe hội thoại ngắn, chọn câu trả lời (câu hỏi đọc + hiện chữ sau khi trả lời)
NGHE_HT = [
    dict(ma='nht1', luot=['安妮：天中，你家有几口人？', '陈天中：我家有六口人：爸爸、妈妈、两个哥哥、一个妹妹和我。'],
         hoi='陈天中有几个哥哥？', dap='两个', nhieu=['一个', '六个']),
    dict(ma='nht2', luot=['安妮：你会做饭吗？', '李文：我不会做饭，我妈妈会做。'],
         hoi='谁会做饭？', dap='李文的妈妈', nhieu=['李文', '安妮']),
    dict(ma='nht3', luot=['刘明：今天几号？', '王一雪：今天十一月三号，星期一。'],
         hoi='今天星期几？', dap='星期一', nhieu=['星期三', '星期日']),
    dict(ma='nht4', luot=['陈天中：那个人是谁？', '白家月：那是我的中文老师，她是中国人。'],
         hoi='白家月的中文老师是哪国人？', dap='中国人', nhieu=['法国人', '泰国人']),
    dict(ma='nht5', luot=['王一雪：同乐，你工作忙吗？', '杨同乐：我不太忙。'],
         hoi='杨同乐忙吗？', dap='不太忙', nhieu=['很忙', '太忙了']),
    dict(ma='nht6', luot=['王一雪：同乐，你的新电脑真好看！', '杨同乐：谢谢！我也很喜欢它。'],
         hoi='杨同乐喜欢他的新电脑吗？', dap='很喜欢', nhieu=['不喜欢', '不太喜欢']),
    dict(ma='nht7', luot=['白家月：李文，你奶奶多大年纪？', '李文：她今年七十九岁。'],
         hoi='李文的奶奶多大年纪？', dap='七十九岁', nhieu=['十九岁', '九十七岁']),
    dict(ma='nht8', luot=['王一雪：明天你上班吗？', '刘明：明天星期六，我不上班，我休息。'],
         hoi='刘明明天上班吗？', dap='不上班', nhieu=['上班', '不休息']),
]
