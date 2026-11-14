# Nội dung Bài 6 (HSK 2.0) — 第六课：我会说汉语 · soạn 14/11/2026 từ PPT của cô Nhiên (Bài_6.pptx, 19 slide, giáo trình HSK 标准教程)
# Nguồn câu: 'slide' = lấy từ PPT · 'moi' = bên soạn soạn mới (đưa vào file duyệt để cô kiểm)
# Mở rộng (吃 · 喝 · 好喝), chia chặng và các câu 'moi' là đề xuất của bên soạn; cô kiểm trên web rồi báo sửa.

TEN = '第六课：我会说汉语'
TEN_VIET = 'Bài 6: Tôi biết nói tiếng Trung'
PINYIN_TEN = 'Dì liù kè: Wǒ huì shuō Hànyǔ'
TEN_RIENG = ['李月']      # nhân vật bài đọc thêm; đã có ở sổ tích lũy từ Bài 3
TEN_CHANG = {1: 'Ôn tập từ vựng 1 · Nói, đọc, viết', 2: 'Ôn tập từ vựng 2 · Món ăn', 3: 'Ôn tập từ vựng 3'}

# Từ ngoài kho 9 cấp: nhãn "Ngoài khung" (NK), mã h26-<chữ Hán>
NGOAI_KHUNG = {'好喝': {'ma': 'h26-好喝', 'hv': 'HẢO HÁT', 'cap': 'NK'}}

# ---------- Từ vựng ----------
# (chữ, pinyin, từ loại, nghĩa, nhóm, chặng, [cụm (chữ, pinyin)], câu 1, câu 2)
TU = [
 # ===== Bảng 生词 (theo thứ tự trên slide) =====
 ('会', 'huì', 'động từ năng nguyện', 'biết (làm gì, nhờ học mà biết)', 'tuVung', 1,
  [('会汉语', 'huì Hànyǔ'), ('会说汉语', 'huì shuō Hànyǔ'), ('不会说汉语', 'bú huì shuō Hànyǔ')],
  ('我们会汉语。', 'Wǒmen huì Hànyǔ.', 'Chúng tôi biết tiếng Trung.', 'slide'),
  ('我妈妈不会说英语。', 'Wǒ māma bú huì shuō Yīngyǔ.', 'Mẹ tôi không biết nói tiếng Anh.', 'slide')),
 ('说', 'shuō', 'động từ', 'nói', 'tuVung', 1,
  [('说汉语', 'shuō Hànyǔ'), ('说英语', 'shuō Yīngyǔ'), ('说越南语', 'shuō Yuènányǔ'), ('说什么', 'shuō shénme')],
  ('老师说汉语，我们说越南语。', 'Lǎoshī shuō Hànyǔ, wǒmen shuō Yuènányǔ.', 'Cô giáo nói tiếng Trung, chúng tôi nói tiếng Việt.', 'slide'),
  ('你们说汉语吗？', 'Nǐmen shuō Hànyǔ ma?', 'Các bạn nói tiếng Trung không?', 'slide')),
 ('妈妈', 'māma', 'danh từ', 'mẹ', 'tuVung', 3,
  [('我妈妈', 'wǒ māma'), ('你妈妈', 'nǐ māma'), ('妈妈的名字', 'māma de míngzi')],
  ('A：你妈妈会说汉语吗？\nB：她不会说。', 'A: Nǐ māma huì shuō Hànyǔ ma?\nB: Tā bú huì shuō.', 'A: Mẹ bạn biết nói tiếng Trung không?\nB: Mẹ mình không biết nói.', 'slide'),
  ('我妈妈会说汉语，也会说英语。', 'Wǒ māma huì shuō Hànyǔ, yě huì shuō Yīngyǔ.', 'Mẹ tôi biết nói tiếng Trung, cũng biết nói tiếng Anh.', 'moi')),
 ('菜', 'cài', 'danh từ', 'món ăn; rau', 'tuVung', 2,
  [('中国菜', 'Zhōngguó cài'), ('越南菜', 'Yuènán cài'), ('韩国菜', 'Hánguó cài'), ('吃菜', 'chī cài')],
  ('你们吃不吃韩国菜？', 'Nǐmen chī bu chī Hánguó cài?', 'Các bạn có ăn món Hàn Quốc không?', 'slide'),
  ('我爸爸会做越南菜。', 'Wǒ bàba huì zuò Yuènán cài.', 'Bố tôi biết nấu món Việt Nam.', 'moi')),
 ('很', 'hěn', 'phó từ', 'rất', 'tuVung', 3,
  [('很好', 'hěn hǎo'), ('很大', 'hěn dà'), ('很多', 'hěn duō')],
  ('这个字很大。', 'Zhè ge zì hěn dà.', 'Chữ này rất to.', 'moi'),
  ('我妈妈的汉语很好。', 'Wǒ māma de Hànyǔ hěn hǎo.', 'Tiếng Trung của mẹ tôi rất tốt.', 'moi')),
 ('好吃', 'hǎochī', 'tính từ', 'ngon (đồ ăn)', 'tuVung', 2,
  [('很好吃', 'hěn hǎochī'), ('不好吃', 'bù hǎochī'), ('好吃的菜', 'hǎochī de cài')],
  ('A：中国菜好吃吗？\nB：中国菜很好吃。', 'A: Zhōngguó cài hǎochī ma?\nB: Zhōngguó cài hěn hǎochī.', 'A: Món Trung Quốc có ngon không?\nB: Món Trung Quốc rất ngon.', 'slide'),
  ('越南菜很好吃。', 'Yuènán cài hěn hǎochī.', 'Món Việt Nam rất ngon.', 'slide')),
 ('做', 'zuò', 'động từ', 'làm; nấu (món ăn)', 'tuVung', 2,
  [('做中国菜', 'zuò Zhōngguó cài'), ('做越南菜', 'zuò Yuènán cài'), ('会做', 'huì zuò'), ('做什么', 'zuò shénme')],
  ('我奶奶会做中国菜，很好吃。', 'Wǒ nǎinai huì zuò Zhōngguó cài, hěn hǎochī.', 'Bà tôi biết nấu món Trung Quốc, rất ngon.', 'slide'),
  ('A：你会做中国菜吗？\nB：我不会做。', 'A: Nǐ huì zuò Zhōngguó cài ma?\nB: Wǒ bú huì zuò.', 'A: Bạn biết nấu món Trung Quốc không?\nB: Mình không biết nấu.', 'slide')),
 ('写', 'xiě', 'động từ', 'viết', 'tuVung', 1,
  [('写汉字', 'xiě Hànzì'), ('写名字', 'xiě míngzi'), ('会写', 'huì xiě'), ('不会写', 'bú huì xiě')],
  ('我会写我的名字。', 'Wǒ huì xiě wǒ de míngzi.', 'Tôi biết viết tên của tôi.', 'slide'),
  ('A：你会写汉字吗？\nB：我会写。', 'A: Nǐ huì xiě Hànzì ma?\nB: Wǒ huì xiě.', 'A: Bạn biết viết chữ Hán không?\nB: Mình biết viết.', 'slide')),
 ('汉字', 'Hànzì', 'danh từ', 'chữ Hán', 'tuVung', 1,
  [('三个汉字', 'sān ge Hànzì'), ('写汉字', 'xiě Hànzì'), ('读汉字', 'dú Hànzì')],
  ('汉字很美。', 'Hànzì hěn měi.', 'Chữ Hán rất đẹp.', 'slide'),
  ('弟弟会写三个汉字：你、我、他。', 'Dìdi huì xiě sān ge Hànzì: nǐ, wǒ, tā.', 'Em trai biết viết ba chữ Hán: 你, 我, 他.', 'slide')),
 ('字', 'zì', 'danh từ', 'chữ', 'tuVung', 1,
  [('一个字', 'yí ge zì'), ('这个字', 'zhè ge zì'), ('写字', 'xiě zì')],
  ('这个字我会读，不会写。', 'Zhè ge zì wǒ huì dú, bú huì xiě.', 'Chữ này tôi biết đọc, không biết viết.', 'slide'),
  ('他的名字有三个字。', 'Tā de míngzi yǒu sān ge zì.', 'Tên của anh ấy có ba chữ.', 'moi')),
 ('怎么', 'zěnme', 'đại từ', 'thế nào, làm sao', 'tuVung', 3,
  [('怎么读', 'zěnme dú'), ('怎么写', 'zěnme xiě'), ('怎么说', 'zěnme shuō'), ('怎么做', 'zěnme zuò')],
  ('这个汉字怎么读？', 'Zhè ge Hànzì zěnme dú?', 'Chữ Hán này đọc thế nào?', 'slide'),
  ('中国菜怎么做？', 'Zhōngguó cài zěnme zuò?', 'Món Trung Quốc nấu thế nào?', 'slide')),
 ('读', 'dú', 'động từ', 'đọc', 'tuVung', 1,
  [('读汉字', 'dú Hànzì'), ('读名字', 'dú míngzi'), ('会读', 'huì dú')],
  ('老师读，我们也读。', 'Lǎoshī dú, wǒmen yě dú.', 'Cô giáo đọc, chúng tôi cũng đọc.', 'slide'),
  ('你会读我的名字吗？', 'Nǐ huì dú wǒ de míngzi ma?', 'Bạn biết đọc tên tôi không?', 'moi')),
 # ===== Mở rộng (slide 7: 吃 · 喝 · 好喝) =====
 ('吃', 'chī', 'động từ', 'ăn', 'moRong', 2,
  [('吃菜', 'chī cài'), ('吃越南菜', 'chī Yuènán cài'), ('不吃', 'bù chī')],
  ('A：你吃什么？\nB：我吃越南菜。', 'A: Nǐ chī shénme?\nB: Wǒ chī Yuènán cài.', 'A: Bạn ăn gì?\nB: Mình ăn món Việt Nam.', 'slide'),
  ('我妹妹不吃中国菜。', 'Wǒ mèimei bù chī Zhōngguó cài.', 'Em gái tôi không ăn món Trung Quốc.', 'moi')),
 ('喝', 'hē', 'động từ', 'uống', 'moRong', 2,
  [('喝什么', 'hē shénme'), ('不喝', 'bù hē')],
  ('你喝什么？', 'Nǐ hē shénme?', 'Bạn uống gì?', 'moi'),
  ('我不吃，我喝。', 'Wǒ bù chī, wǒ hē.', 'Mình không ăn, mình uống.', 'moi')),
 ('好喝', 'hǎohē', 'tính từ', 'ngon (đồ uống)', 'moRong', 2,
  [('很好喝', 'hěn hǎohē'), ('不好喝', 'bù hǎohē')],
  ('这个很好喝。', 'Zhè ge hěn hǎohē.', 'Cái này rất ngon (đồ uống).', 'moi'),
  ('这个不好喝，那个很好喝。', 'Zhè ge bù hǎohē, nà ge hěn hǎohē.', 'Cái này không ngon, cái kia rất ngon (đồ uống).', 'moi')),
]

# ---------- Bộ thủ mới của bài (bộ đã có thẻ ở Bài 1–5: 亻 讠 口 人) ----------
BO_THU = [
 {'boThu': '艹', 'ten': 'Bộ thảo', 'pinyin': 'cǎo', 'nghia': 'cỏ, cây cỏ, thực vật', 'docAm': '草字头', 'tenGoi': '草字头', 'tenGoiPinyin': 'cǎozìtóu',
  'chuChua': [{'hanzi': '菜', 'pinyin': 'cài', 'nghia': 'rau; món ăn'}]},
 {'boThu': '冖', 'ten': 'Bộ mịch', 'pinyin': 'mì', 'nghia': 'trùm, che, phủ', 'docAm': '秃宝盖', 'tenGoi': '秃宝盖', 'tenGoiPinyin': 'tūbǎogài',
  'chuChua': [{'hanzi': '写', 'pinyin': 'xiě', 'nghia': 'viết'}]},
]
# ---------- Ghép chữ theo slide: (chữ, [thành phần], chặng) ----------
GHEP = [
 ('说', ['讠', '兑'], 1), ('会', ['人', '云'], 1), ('读', ['讠', '卖'], 1), ('写', ['冖', '与'], 1),
 ('菜', ['艹', '采'], 2), ('吃', ['口', '乞'], 2), ('做', ['亻', '故'], 2),
]
THANH_PHAN = {
 '兑': {'pinyin': 'duì', 'ten': 'Đoái', 'nghia': 'thành phần gợi âm (duì)'},
 '采': {'pinyin': 'cǎi', 'ten': 'Thái', 'nghia': 'hái, ngắt; thành phần gợi âm (cǎi)'},
 '乞': {'pinyin': 'qǐ', 'ten': 'Khất', 'nghia': 'xin; thành phần gợi âm (qǐ)'},
 '故': {'pinyin': 'gù', 'ten': 'Cố', 'nghia': 'cũ; thành phần gợi âm (gù)'},
 '与': {'pinyin': 'yǔ', 'ten': 'Chữ 与', 'nghia': 'với, cùng'},
}
