# Nội dung Bài 7 (HSK 2.0) — 第七课：今天几号 · soạn 24/11/2026 từ PPT của cô Nhiên (Bài_7.pptx, 22 slide, giáo trình HSK 标准教程)
# Nguồn câu: 'slide' = lấy từ PPT · 'moi' = bên soạn soạn mới (đưa vào file duyệt để cô kiểm)
# Mở rộng (天 · 大学 · 中学 · 小学, slide 4–6 và 13), chia chặng và các câu 'moi' là đề xuất của bên soạn; cô kiểm trên web rồi báo sửa.
# 河内 đã là thẻ ở Bài 5 nên không lặp; 上个月 / 下个月 trên slide 5 và 7 dùng chữ 上 下 chưa có trong vốn chữ → chưa đưa vào thẻ.

TEN = '第七课：今天几号'
TEN_VIET = 'Bài 7: Hôm nay ngày mấy'
PINYIN_TEN = 'Dì qī kè: Jīntiān jǐ hào'
TEN_RIENG = ['小月']      # nhân vật bài đọc thêm (slide 21)
TEN_CHANG = {1: 'Ôn tập từ vựng 1 · Ngày tháng', 2: 'Ôn tập từ vựng 2 · Đi và hỏi', 3: 'Ôn tập từ vựng 3 · Trường học, sách'}

NGOAI_KHUNG = {}

# ---------- Từ vựng ----------
# (chữ, pinyin, từ loại, nghĩa, nhóm, chặng, [cụm (chữ, pinyin)], câu 1, câu 2)
TU = [
 # ===== Bảng 生词 (xếp theo cụm liên kết) =====
 ('今天', 'jīntiān', 'danh từ', 'hôm nay', 'tuVung', 1,
  [('今天几号', 'jīntiān jǐ hào'), ('今天星期几', 'jīntiān xīngqī jǐ'), ('今天不去', 'jīntiān bú qù')],
  ('今天几月几号？', 'Jīntiān jǐ yuè jǐ hào?', 'Hôm nay là ngày mấy tháng mấy?', 'slide'),
  ('今天我妈妈做中国菜。', 'Jīntiān wǒ māma zuò Zhōngguó cài.', 'Hôm nay mẹ tôi nấu món Trung Quốc.', 'moi')),
 ('昨天', 'zuótiān', 'danh từ', 'hôm qua', 'tuVung', 1,
  [('昨天星期几', 'zuótiān xīngqī jǐ'), ('昨天几号', 'zuótiān jǐ hào'), ('昨天不去', 'zuótiān bú qù')],
  ('昨天星期几？', 'Zuótiān xīngqī jǐ?', 'Hôm qua là thứ mấy?', 'slide'),
  ('昨天是八月三十一号，星期二。', 'Zuótiān shì bā yuè sānshíyī hào, xīngqī èr.', 'Hôm qua là ngày 31 tháng 8, thứ Ba.', 'slide')),
 ('明天', 'míngtiān', 'danh từ', 'ngày mai', 'tuVung', 1,
  [('明天星期几', 'míngtiān xīngqī jǐ'), ('明天几号', 'míngtiān jǐ hào'), ('明天不去', 'míngtiān bú qù')],
  ('明天星期三。', 'Míngtiān xīngqī sān.', 'Ngày mai là thứ Tư.', 'slide'),
  ('明天是九月二号，星期四。', 'Míngtiān shì jiǔ yuè èr hào, xīngqī sì.', 'Ngày mai là ngày 2 tháng 9, thứ Năm.', 'slide')),
 ('号', 'hào', 'danh từ, lượng từ', 'ngày (trong tháng); số', 'tuVung', 1,
  [('几号', 'jǐ hào'), ('九月一号', 'jiǔ yuè yī hào'), ('三月二号', 'sān yuè èr hào')],
  ('A：大卫的生日是几月几号？\nB：他的生日是三月二号。', 'A: Dàwèi de shēngrì shì jǐ yuè jǐ hào?\nB: Tā de shēngrì shì sān yuè èr hào.', 'A: Sinh nhật của David là ngày mấy tháng mấy?\nB: Sinh nhật anh ấy là ngày 2 tháng 3.', 'slide'),
  ('今天九月一号。', 'Jīntiān jiǔ yuè yī hào.', 'Hôm nay là ngày 1 tháng 9.', 'slide')),
 ('月', 'yuè', 'danh từ', 'tháng; mặt trăng', 'tuVung', 1,
  [('几月', 'jǐ yuè'), ('三月', 'sān yuè'), ('两个月', 'liǎng ge yuè'), ('这个月', 'zhè ge yuè')],
  ('一年有十二个月。', 'Yì nián yǒu shí\'èr ge yuè.', 'Một năm có mười hai tháng.', 'slide'),
  ('他去中国七个月。', 'Tā qù Zhōngguó qī ge yuè.', 'Anh ấy đi Trung Quốc bảy tháng.', 'slide')),
 ('星期', 'xīngqī', 'danh từ', 'tuần; thứ', 'tuVung', 1,
  [('星期几', 'xīngqī jǐ'), ('星期六', 'xīngqī liù'), ('星期天', 'xīngqītiān'), ('这个星期', 'zhè ge xīngqī')],
  ('这个星期六我们学汉语。', 'Zhè ge xīngqīliù wǒmen xué Hànyǔ.', 'Thứ Bảy tuần này chúng tôi học tiếng Trung.', 'slide'),
  ('星期天妈妈做中国菜。', 'Xīngqītiān māma zuò Zhōngguó cài.', 'Chủ nhật mẹ nấu món Trung Quốc.', 'slide')),
 ('请', 'qǐng', 'động từ', 'mời; xin', 'tuVung', 2,
  [('请问', 'qǐngwèn'), ('请说', 'qǐng shuō'), ('请读', 'qǐng dú')],
  ('请问，你叫什么名字？', 'Qǐngwèn, nǐ jiào shénme míngzi?', 'Xin hỏi, bạn tên là gì?', 'slide'),
  ('老师说：请读这个字。', 'Lǎoshī shuō: qǐng dú zhè ge zì.', 'Cô giáo nói: Mời đọc chữ này.', 'moi')),
 ('问', 'wèn', 'động từ', 'hỏi', 'tuVung', 2,
  [('问老师', 'wèn lǎoshī'), ('问朋友', 'wèn péngyou'), ('问名字', 'wèn míngzi')],
  ('我问老师：这个字怎么读？', 'Wǒ wèn lǎoshī: zhè ge zì zěnme dú?', 'Tôi hỏi cô giáo: Chữ này đọc thế nào?', 'slide'),
  ('她问我：你会说汉语吗？', 'Tā wèn wǒ: nǐ huì shuō Hànyǔ ma?', 'Cô ấy hỏi tôi: Bạn biết nói tiếng Trung không?', 'moi')),
 ('去', 'qù', 'động từ', 'đi', 'tuVung', 2,
  [('去中国', 'qù Zhōngguó'), ('去朋友家', 'qù péngyou jiā'), ('不去', 'bú qù'), ('去哪儿', 'qù nǎr')],
  ('A：明天你去哪儿？\nB：我去朋友家。', 'A: Míngtiān nǐ qù nǎr?\nB: Wǒ qù péngyou jiā.', 'A: Ngày mai bạn đi đâu?\nB: Mình đến nhà bạn.', 'slide'),
  ('我妈妈不去中国，她去美国。', 'Wǒ māma bú qù Zhōngguó, tā qù Měiguó.', 'Mẹ tôi không đi Trung Quốc, bà đi Mỹ.', 'slide')),
 ('学校', 'xuéxiào', 'danh từ', 'trường học', 'tuVung', 2,
  [('去学校', 'qù xuéxiào'), ('我的学校', 'wǒ de xuéxiào'), ('学校的老师', 'xuéxiào de lǎoshī')],
  ('A：你去学校吗？\nB：明天星期六，我不去学校。', 'A: Nǐ qù xuéxiào ma?\nB: Míngtiān xīngqīliù, wǒ bú qù xuéxiào.', 'A: Bạn có đến trường không?\nB: Ngày mai thứ Bảy, mình không đến trường.', 'slide'),
  ('我的学校很大。', 'Wǒ de xuéxiào hěn dà.', 'Trường của tôi rất to.', 'moi')),
 ('看', 'kàn', 'động từ', 'nhìn, xem, đọc', 'tuVung', 3,
  [('看书', 'kàn shū'), ('看朋友', 'kàn péngyou'), ('看什么', 'kàn shénme')],
  ('A：你看什么？\nB：我看汉语书。', 'A: Nǐ kàn shénme?\nB: Wǒ kàn Hànyǔ shū.', 'A: Bạn đọc gì thế?\nB: Mình đọc sách tiếng Trung.', 'slide'),
  ('我去朋友家看书。', 'Wǒ qù péngyou jiā kàn shū.', 'Tôi đến nhà bạn đọc sách.', 'slide')),
 ('书', 'shū', 'danh từ', 'sách', 'tuVung', 3,
  [('汉语书', 'Hànyǔ shū'), ('中国书', 'Zhōngguó shū'), ('一本书', 'yì běn shū')],
  ('我有三本汉语书。', 'Wǒ yǒu sān běn Hànyǔ shū.', 'Tôi có ba quyển sách tiếng Trung.', 'slide'),
  ('这本书很好。', 'Zhè běn shū hěn hǎo.', 'Quyển sách này rất hay.', 'moi')),
 # ===== Mở rộng (slide 4–6: 天 · slide 13: 大学 · 中学 · 小学) =====
 ('天', 'tiān', 'danh từ, lượng từ', 'ngày (khoảng thời gian); trời', 'moRong', 1,
  [('一天', 'yì tiān'), ('几天', 'jǐ tiān'), ('十五天', 'shíwǔ tiān')],
  ('一个月有多少天？', 'Yí ge yuè yǒu duōshao tiān?', 'Một tháng có bao nhiêu ngày?', 'slide'),
  ('他去中国十五天。', 'Tā qù Zhōngguó shíwǔ tiān.', 'Anh ấy đi Trung Quốc mười lăm ngày.', 'moi')),
 ('大学', 'dàxué', 'danh từ', 'đại học', 'moRong', 3,
  [('大学生', 'dàxuéshēng'), ('我的大学', 'wǒ de dàxué'), ('去大学', 'qù dàxué')],
  ('我哥哥是大学生。', 'Wǒ gēge shì dàxuéshēng.', 'Anh trai tôi là sinh viên đại học.', 'moi'),
  ('我的大学很大。', 'Wǒ de dàxué hěn dà.', 'Trường đại học của tôi rất to.', 'moi')),
 ('中学', 'zhōngxué', 'danh từ', 'trung học', 'moRong', 3,
  [('中学生', 'zhōngxuéshēng'), ('我的中学', 'wǒ de zhōngxué'), ('去中学', 'qù zhōngxué')],
  ('我们的中学不大。', 'Wǒmen de zhōngxué bú dà.', 'Trường trung học của chúng tôi không to.', 'slide'),
  ('我妹妹是中学生。', 'Wǒ mèimei shì zhōngxuéshēng.', 'Em gái tôi là học sinh trung học.', 'moi')),
 ('小学', 'xiǎoxué', 'danh từ', 'tiểu học', 'moRong', 3,
  [('小学生', 'xiǎoxuéshēng'), ('我的小学', 'wǒ de xiǎoxué'), ('去小学', 'qù xiǎoxué')],
  ('我弟弟是小学生。', 'Wǒ dìdi shì xiǎoxuéshēng.', 'Em trai tôi là học sinh tiểu học.', 'moi'),
  ('小学的老师是我妈妈。', 'Xiǎoxué de lǎoshī shì wǒ māma.', 'Cô giáo trường tiểu học là mẹ tôi.', 'moi')),
]

# ---------- Bộ thủ mới của bài (bộ đã có thẻ ở Bài 1–6: 讠 门 口 日 木 手) ----------
BO_THU = [
 {'boThu': '目', 'ten': 'Bộ mục', 'pinyin': 'mù', 'nghia': 'mắt', 'docAm': '目',
  'chuChua': [{'hanzi': '看', 'pinyin': 'kàn', 'nghia': 'nhìn, xem, đọc'}]},
 {'boThu': '厶', 'ten': 'Bộ khư', 'pinyin': 'sī', 'nghia': 'riêng', 'docAm': '厶',
  'chuChua': [{'hanzi': '去', 'pinyin': 'qù', 'nghia': 'đi'}]},
]
# ---------- Ghép chữ theo slide 12–14: (chữ, [thành phần], chặng) ----------
GHEP = [
 ('去', ['土', '厶'], 2), ('校', ['木', '交'], 2), ('看', ['手', '目'], 3),
]
THANH_PHAN = {}
