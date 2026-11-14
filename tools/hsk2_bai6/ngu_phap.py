# Thẻ ngữ pháp Bài 6 (HSK 2.0): 会 + ĐT · 不会 · 会不会  ·  怎么 + ĐT
# Danh sách điểm ngữ pháp là đề xuất của bên soạn từ slide 6 và 11 (会 + V (+ O) · 怎么 + V ?); cô Nhiên chốt.
# Đoạn màu: [chữ, loại] — loại: codinh · dt · dgt (động từ) · tt · st · pho · None (không tô)

NGU_PHAP = [
 {'id': 'hui', 'ten': '会 + ĐT · 不会 · 会不会',
  'congThuc': [[['会', 'codinh'], ['ĐT', 'dgt']], [['不会', 'codinh'], ['ĐT', 'dgt']], [['会不会', 'codinh'], ['ĐT', 'dgt'], ['？', 'codinh']]],
  'giaiThich': '会 là **động từ năng nguyện**, đặt **trước động từ**, nghĩa là **"biết (làm gì)"**, chỉ khả năng có được **nhờ học**. Phủ định **不会**; hỏi **会…吗？** hoặc **会不会…？**',
  'y': [
   {'noiDung': '会 + ĐT: biết làm gì',
    'cum': [['会说汉语', 'huì shuō Hànyǔ', '', [['会', 'codinh'], ['说汉语', 'dgt']]],
            ['会写汉字', 'huì xiě Hànzì', '', [['会', 'codinh'], ['写汉字', 'dgt']]],
            ['会做中国菜', 'huì zuò Zhōngguó cài', '', [['会', 'codinh'], ['做中国菜', 'dgt']]]],
    'viDu': [['我奶奶会做越南菜。', 'Wǒ nǎinai huì zuò Yuènán cài.', '', [['我奶奶', None], ['会', 'codinh'], ['做越南菜', 'dgt'], ['。', None]]]]},
   {'noiDung': '不会 + ĐT: không biết làm gì',
    'cum': [['不会说英语', 'bú huì shuō Yīngyǔ', '', [['不会', 'codinh'], ['说英语', 'dgt']]],
            ['不会写汉字', 'bú huì xiě Hànzì', '', [['不会', 'codinh'], ['写汉字', 'dgt']]]],
    'viDu': [['我不会读这个字。', 'Wǒ bú huì dú zhè ge zì.', '', [['我', None], ['不会', 'codinh'], ['读这个字', 'dgt'], ['。', None]]]]},
   {'noiDung': 'Hỏi: 会…吗？ / 会不会…？',
    'cum': [['会不会说汉语', 'huì bu huì shuō Hànyǔ', '', [['会不会', 'codinh'], ['说汉语', 'dgt']]],
            ['会不会写汉字', 'huì bu huì xiě Hànzì', '', [['会不会', 'codinh'], ['写汉字', 'dgt']]]],
    'viDu': [['你会不会说英语？', 'Nǐ huì bu huì shuō Yīngyǔ?', '', [['你', None], ['会不会', 'codinh'], ['说英语', 'dgt'], ['？', 'codinh']]]]},
  ],
  'luuY': ['Trả lời ngắn: **会。/ 不会。**',
           'Phủ định dùng **不会**, không nói 没会.',
           '不会 đọc **bú huì**; trong 会不会, 不 đọc nhẹ: **huì bu huì**.',
           'Câu đã dùng **会不会** thì **không thêm 吗**.',
           '会 có thể đi **thẳng với tên ngôn ngữ**: 会汉语 = 会说汉语 (biết tiếng Trung).']},
 {'id': 'zenme', 'ten': '怎么 + ĐT',
  'congThuc': [[['怎么', 'codinh'], ['ĐT', 'dgt'], ['？', 'codinh']], [['DT', 'dt'], ['怎么', 'codinh'], ['ĐT', 'dgt'], ['？', 'codinh']]],
  'giaiThich': '**怎么 + ĐT** hỏi **cách thức** ("làm thế nào, bằng cách nào"): 怎么读? 怎么写? 怎么说? 怎么做?',
  'y': [
   {'noiDung': '怎么 + ĐT: hỏi cách thức',
    'cum': [['怎么读', 'zěnme dú', '', [['怎么', 'codinh'], ['读', 'dgt']]],
            ['怎么写', 'zěnme xiě', '', [['怎么', 'codinh'], ['写', 'dgt']]],
            ['怎么说', 'zěnme shuō', '', [['怎么', 'codinh'], ['说', 'dgt']]],
            ['怎么做', 'zěnme zuò', '', [['怎么', 'codinh'], ['做', 'dgt']]]],
    'viDu': [['你的名字怎么读？', 'Nǐ de míngzi zěnme dú?', '', [['你的名字', 'dt'], ['怎么', 'codinh'], ['读', 'dgt'], ['？', 'codinh']]]]},
   {'noiDung': 'DT + 怎么 + ĐT: hỏi cách làm với một đối tượng',
    'viDu': [['越南菜怎么做？', 'Yuènán cài zěnme zuò?', '', [['越南菜', 'dt'], ['怎么', 'codinh'], ['做', 'dgt'], ['？', 'codinh']]]]},
  ],
  'luuY': ['**怎么 đứng trước động từ**: 怎么读, 怎么写; câu hỏi đã có 怎么 thì **không thêm 吗**.',
           'Phân biệt: **怎么 + ĐT** hỏi **cách làm**, **什么** hỏi **cái gì**: 你说什么？(nói cái gì) ≠ 这个字怎么说？(nói như thế nào).']},
]
