#!/usr/bin/env python3
"""Dựng data/bai/bai-5.json từ noi_dung.py (từ vựng, bộ thủ, ghép chữ) + ngu_phap.py (7 thẻ) + kho câu luyện dưới đây.
Sau đó chạy: tools/bai_khoa.py gop (câu bài khóa) → tools/ngu_phap_luyen.py gop (Luyện ngữ pháp) → tools/cau_tao_truoc.py.
  python3 tools/bai5/dung.py kiem | ghi"""
import json, os, re, sys, glob
DAY = os.path.dirname(os.path.abspath(__file__)); GOC = os.path.dirname(os.path.dirname(DAY))
sys.path.insert(0, DAY); sys.path.insert(0, os.path.join(GOC, 'tools'))
import noi_dung as N
from ngu_phap import NGU_PHAP
from ngu_phap_luyen import CHU, TEN_RIENG, strip, han

DOC_TU = {'会': '汇', '面条儿': '面条'}          # đọc tách từ (TTS đọc sai âm đa âm / 儿化)
TEN_CHANG = {1: 'Ôn tập từ vựng 1', 2: 'Ôn tập từ vựng 2', 3: 'Ôn tập từ vựng 3'}

def L(h, p, v=''): return [h, p, v]

# ---------- Kho câu luyện (ngoài bài khóa): [chữ, pinyin, nghĩa, np, đọc] ----------
CAU = [
 ['今天十月二十二号，星期三。', "Jīntiān shí yuè èrshí'èr hào, xīngqīsān.", 'Hôm nay thứ tư, ngày 22 tháng 10.', 'ngayThang'],
 ['明天星期几？', 'Míngtiān xīngqī jǐ?', 'Ngày mai thứ mấy?', 'ngayThang'],
 ['昨天是八月八号。', 'Zuótiān shì bā yuè bā hào.', 'Hôm qua là ngày 8 tháng 8.', 'ngayThang'],
 ['我的生日是五月二十号。', 'Wǒ de shēngrì shì wǔ yuè èrshí hào.', 'Sinh nhật của tôi là ngày 20 tháng 5.', 'ngayThang'],
 ['你的生日是几月几号？', 'Nǐ de shēngrì shì jǐ yuè jǐ hào?', 'Sinh nhật của bạn là ngày mấy tháng mấy?', 'ngayThang'],
 ['昨天星期六，今天星期日。', 'Zuótiān xīngqīliù, jīntiān xīngqīrì.', 'Hôm qua thứ bảy, hôm nay chủ nhật.', 'vnDanhTu'],
 ['明天不是星期天，是星期一。', 'Míngtiān bú shì xīngqītiān, shì xīngqīyī.', 'Ngày mai không phải chủ nhật, là thứ hai.', 'vnDanhTu'],
 ['我女儿今年八岁。', "Wǒ nǚ'ér jīnnián bā suì.", 'Con gái tôi năm nay tám tuổi.', 'vnDanhTu'],
 ['我的猫很小，它两岁。', 'Wǒ de māo hěn xiǎo, tā liǎng suì.', 'Con mèo của tôi rất nhỏ, nó hai tuổi.', 'vnDanhTu'],
 ['星期天我们休息。', 'Xīngqītiān wǒmen xiūxi.', 'Chủ nhật chúng tôi nghỉ.', 'trangNgu'],
 ['我今天不上班。', 'Wǒ jīntiān bú shàngbān.', 'Hôm nay tôi không đi làm.', 'trangNgu'],
 ['爸爸星期六也上班。', 'Bàba xīngqīliù yě shàngbān.', 'Bố thứ bảy cũng đi làm.', 'trangNgu'],
 ['明天我想休息。', 'Míngtiān wǒ xiǎng xiūxi.', 'Ngày mai tôi muốn nghỉ.', 'trangNgu'],
 ['我们休息两天。', 'Wǒmen xiūxi liǎng tiān.', 'Chúng tôi nghỉ hai ngày.', 'trangNgu'],
 ['你们星期六上班吗？', 'Nǐmen xīngqīliù shàngbān ma?', 'Thứ bảy các bạn có đi làm không?', 'trangNgu'],
 ['星期天你想做什么？', 'Xīngqītiān nǐ xiǎng zuò shénme?', 'Chủ nhật bạn muốn làm gì?', 'trangNgu'],
 ['你会说汉语吗？', 'Nǐ huì shuō Hànyǔ ma?', 'Bạn biết nói tiếng Trung không?', 'hui'],
 ['我妈妈会做饺子。', 'Wǒ māma huì zuò jiǎozi.', 'Mẹ tôi biết làm sủi cảo.', 'hui'],
 ['我不会做饭，我姐姐会做。', 'Wǒ bú huì zuò fàn, wǒ jiějie huì zuò.', 'Tôi không biết nấu cơm, chị tôi biết nấu.', 'hui'],
 ['你会不会做面条儿？', 'Nǐ huì bu huì zuò miàntiáor?', 'Bạn có biết làm mì không?', 'hui', '你会不会做面条？'],
 ['他会说英语，也会说法语。', 'Tā huì shuō Yīngyǔ, yě huì shuō Fǎyǔ.', 'Anh ấy biết nói tiếng Anh, cũng biết nói tiếng Pháp.', 'hui'],
 ['我爷爷不会说汉语。', 'Wǒ yéye bú huì shuō Hànyǔ.', 'Ông nội tôi không biết nói tiếng Trung.', 'hui'],
 ['我想吃一些包子。', 'Wǒ xiǎng chī yìxiē bāozi.', 'Tôi muốn ăn một ít bánh bao.', 'yixie'],
 ['这些是我的新同学。', 'Zhèxiē shì wǒ de xīn tóngxué.', 'Đây là những bạn học mới của tôi.', 'yixie'],
 ['那些学生是越南人。', 'Nàxiē xué·shēng shì Yuènán rén.', 'Những học sinh kia là người Việt Nam.', 'yixie'],
 ['这些饺子很好吃。', 'Zhèxiē jiǎozi hěn hǎochī.', 'Những cái sủi cảo này rất ngon.', 'yixie'],
 ['那些面包是你的吗？', 'Nàxiē miànbāo shì nǐ de ma?', 'Những cái bánh mì kia là của bạn à?', 'yixie'],
 ['你的新电脑真好看！', 'Nǐ de xīn diànnǎo zhēn hǎokàn!', 'Máy tính mới của bạn đẹp thật!', 'zhen'],
 ['今天我真忙！', 'Jīntiān wǒ zhēn máng!', 'Hôm nay tôi bận thật!', 'zhen'],
 ['我真喜欢这个小狗。', 'Wǒ zhēn xǐhuan zhè ge xiǎo gǒu.', 'Tôi thật sự thích con chó nhỏ này.', 'zhen'],
 ['这个名字真好听！', 'Zhè ge míngzi zhēn hǎotīng!', 'Cái tên này hay thật!', 'zhen'],
 ['中国菜很好吃。', 'Zhōngguó cài hěn hǎochī.', 'Món Trung Quốc rất ngon.', 'haoV'],
 ['这个包子不好吃。', 'Zhè ge bāozi bù hǎochī.', 'Cái bánh bao này không ngon.', 'haoV'],
 ['汉语很好听。', 'Hànyǔ hěn hǎotīng.', 'Tiếng Trung nghe rất hay.', 'haoV'],
 ['她的小猫很好看。', 'Tā de xiǎo māo hěn hǎokàn.', 'Con mèo nhỏ của cô ấy rất đẹp.', 'haoV'],
 ['我很喜欢我的新电脑。', 'Wǒ hěn xǐhuan wǒ de xīn diànnǎo.', 'Tôi rất thích máy tính mới của tôi.', ''],
 ['我有一台新电脑。', 'Wǒ yǒu yì tái xīn diànnǎo.', 'Tôi có một cái máy tính mới.', ''],
 ['这台电脑很旧，那台电脑很新。', 'Zhè tái diànnǎo hěn jiù, nà tái diànnǎo hěn xīn.', 'Máy tính này rất cũ, máy tính kia rất mới.', ''],
 ['我想看你的电脑。', 'Wǒ xiǎng kàn nǐ de diànnǎo.', 'Tôi muốn xem máy tính của bạn.', ''],
 ['你喜欢吃面条儿吗？', 'Nǐ xǐhuan chī miàntiáor ma?', 'Bạn có thích ăn mì không?', '', '你喜欢吃面条吗？'],
 ['我喜欢饺子，也喜欢包子。', 'Wǒ xǐhuan jiǎozi, yě xǐhuan bāozi.', 'Tôi thích sủi cảo, cũng thích bánh bao.', ''],
 ['这道菜叫什么名字？', 'Zhè dào cài jiào shénme míngzi?', 'Món này tên là gì?', ''],
 ['明天是我的生日。', 'Míngtiān shì wǒ de shēngrì.', 'Ngày mai là sinh nhật của tôi.', ''],
 ['妈妈下班了。', 'Māma xiàbān le.', 'Mẹ tan làm rồi.', ''],
]

# ---------- Hỏi – đáp (ngoài bài khóa) ----------
HD = [
 dict(hoi=L('今天几号？', 'Jīntiān jǐ hào?', 'Hôm nay ngày mấy?'), dap=L('今天十月八号。', 'Jīntiān shí yuè bā hào.', 'Hôm nay ngày 8 tháng 10.'),
      nhieu=[L('今天星期三。', 'Jīntiān xīngqīsān.'), L('我今天休息。', 'Wǒ jīntiān xiūxi.'), L('今天很忙。', 'Jīntiān hěn máng.')]),
 dict(hoi=L('今天星期几？', 'Jīntiān xīngqī jǐ?', 'Hôm nay thứ mấy?'), dap=L('今天星期五。', 'Jīntiān xīngqīwǔ.', 'Hôm nay thứ sáu.'),
      nhieu=[L('今天九月五号。', 'Jīntiān jiǔ yuè wǔ hào.'), L('我很喜欢星期五。', 'Wǒ hěn xǐhuan xīngqīwǔ.'), L('今天不忙。', 'Jīntiān bù máng.')]),
 dict(hoi=L('你的生日是几月几号？', 'Nǐ de shēngrì shì jǐ yuè jǐ hào?', 'Sinh nhật bạn là ngày mấy tháng mấy?'), dap=L('我的生日是三月二十号。', 'Wǒ de shēngrì shì sān yuè èrshí hào.', 'Sinh nhật mình là ngày 20 tháng 3.'),
      nhieu=[L('我今年二十岁。', 'Wǒ jīnnián èrshí suì.'), L('今天是星期三。', 'Jīntiān shì xīngqīsān.'), L('我有三个朋友。', 'Wǒ yǒu sān ge péngyou.')]),
 dict(hoi=L('你星期天休息吗？', 'Nǐ xīngqītiān xiūxi ma?', 'Chủ nhật bạn có nghỉ không?'), dap=L('休息，星期天我不上班。', 'Xiūxi, xīngqītiān wǒ bú shàngbān.', 'Nghỉ, chủ nhật mình không đi làm.'),
      nhieu=[L('我会做饭。', 'Wǒ huì zuò fàn.'), L('今天星期天。', 'Jīntiān xīngqītiān.'), L('我有一台电脑。', 'Wǒ yǒu yì tái diànnǎo.')]),
 dict(hoi=L('你们今天上班吗？', 'Nǐmen jīntiān shàngbān ma?', 'Hôm nay các bạn có đi làm không?'), dap=L('不上班，今天星期日。', 'Bú shàngbān, jīntiān xīngqīrì.', 'Không đi làm, hôm nay chủ nhật.'),
      nhieu=[L('我们是同事。', 'Wǒmen shì tóngshì.'), L('我们是中国人。', 'Wǒmen shì Zhōngguó rén.'), L('我们会做饭。', 'Wǒmen huì zuò fàn.')]),
 dict(hoi=L('你会做饭吗？', 'Nǐ huì zuò fàn ma?', 'Bạn biết nấu cơm không?'), dap=L('我会做，我会做面条儿。', 'Wǒ huì zuò, wǒ huì zuò miàntiáor.', 'Mình biết, mình biết làm mì.'),
      nhieu=[L('我很喜欢吃饭。', 'Wǒ hěn xǐhuan chī fàn.'), L('我不想吃饭。', 'Wǒ bù xiǎng chī fàn.'), L('我是中国人。', 'Wǒ shì Zhōngguó rén.')]),
 dict(hoi=L('你会做什么菜？', 'Nǐ huì zuò shénme cài?', 'Bạn biết nấu món gì?'), dap=L('我会做一些越南菜。', 'Wǒ huì zuò yìxiē Yuènán cài.', 'Mình biết nấu vài món Việt Nam.'),
      nhieu=[L('这些菜很好吃。', 'Zhèxiē cài hěn hǎochī.'), L('我会说汉语。', 'Wǒ huì shuō Hànyǔ.'), L('我有很多朋友。', 'Wǒ yǒu hěn duō péngyou.')]),
 dict(hoi=L('你会说法语吗？', 'Nǐ huì shuō Fǎyǔ ma?', 'Bạn biết nói tiếng Pháp không?'), dap=L('不会，我会说英语。', 'Bú huì, wǒ huì shuō Yīngyǔ.', 'Không biết, mình biết nói tiếng Anh.'),
      nhieu=[L('我是法国人。', 'Wǒ shì Fǎguó rén.'), L('我想去法国。', 'Wǒ xiǎng qù Fǎguó.'), L('我有法国朋友。', 'Wǒ yǒu Fǎguó péngyou.')]),
 dict(hoi=L('这是谁的电脑？', 'Zhè shì shéi de diànnǎo?', 'Đây là máy tính của ai?'), dap=L('这是我的新电脑。', 'Zhè shì wǒ de xīn diànnǎo.', 'Đây là máy tính mới của mình.'),
      nhieu=[L('这台电脑很好看。', 'Zhè tái diànnǎo hěn hǎokàn.'), L('我有两台电脑。', 'Wǒ yǒu liǎng tái diànnǎo.'), L('我喜欢电脑。', 'Wǒ xǐhuan diànnǎo.')]),
 dict(hoi=L('你喜欢吃什么？', 'Nǐ xǐhuan chī shénme?', 'Bạn thích ăn gì?'), dap=L('我喜欢吃饺子。', 'Wǒ xǐhuan chī jiǎozi.', 'Mình thích ăn sủi cảo.'),
      nhieu=[L('我会做饺子。', 'Wǒ huì zuò jiǎozi.'), L('饺子很好吃。', 'Jiǎozi hěn hǎochī.'), L('我妈妈会做饭。', 'Wǒ māma huì zuò fàn.')]),
 dict(hoi=L('你的新电脑好看吗？', 'Nǐ de xīn diànnǎo hǎokàn ma?', 'Máy tính mới của bạn có đẹp không?'), dap=L('很好看，我很喜欢它。', 'Hěn hǎokàn, wǒ hěn xǐhuan tā.', 'Rất đẹp, mình rất thích nó.'),
      nhieu=[L('我有电脑。', 'Wǒ yǒu diànnǎo.'), L('这是我的电脑。', 'Zhè shì wǒ de diànnǎo.'), L('我会说汉语。', 'Wǒ huì shuō Hànyǔ.')]),
 dict(hoi=L('这些饺子好吃吗？', 'Zhèxiē jiǎozi hǎochī ma?', 'Những cái sủi cảo này có ngon không?'), dap=L('真好吃！', 'Zhēn hǎochī!', 'Ngon thật!'),
      nhieu=[L('这些是饺子。', 'Zhèxiē shì jiǎozi.'), L('我会做饺子。', 'Wǒ huì zuò jiǎozi.'), L('我想吃面条儿。', 'Wǒ xiǎng chī miàntiáor.')]),
 dict(hoi=L('那些人是谁？', 'Nàxiē rén shì shéi?', 'Những người kia là ai?'), dap=L('那些人是我的同事。', 'Nàxiē rén shì wǒ de tóngshì.', 'Những người kia là đồng nghiệp của mình.'),
      nhieu=[L('他们很忙。', 'Tāmen hěn máng.'), L('那些菜很好吃。', 'Nàxiē cài hěn hǎochī.'), L('我有很多同事。', 'Wǒ yǒu hěn duō tóngshì.')]),
 dict(hoi=L('你的小猫几岁了？', 'Nǐ de xiǎo māo jǐ suì le?', 'Con mèo nhỏ của bạn mấy tuổi rồi?'), dap=L('它两岁了。', 'Tā liǎng suì le.', 'Nó hai tuổi rồi.'),
      nhieu=[L('它很好看。', 'Tā hěn hǎokàn.'), L('它是我的猫。', 'Tā shì wǒ de māo.'), L('我有一只猫。', 'Wǒ yǒu yì zhī māo.')]),
]

# ---------- Hội thoại (ngoài bài khóa) ----------
HT = [
 dict(ten='Hỏi ngày sinh nhật', luot=[L('你的生日是几月几号？', 'Nǐ de shēngrì shì jǐ yuè jǐ hào?', 'Sinh nhật bạn là ngày mấy tháng mấy?'),
      L('我的生日是十月二十二号。你呢？', "Wǒ de shēngrì shì shí yuè èrshí'èr hào. Nǐ ne?", 'Sinh nhật mình là ngày 22 tháng 10. Còn bạn?'),
      L('我的生日是十二月一号。', "Wǒ de shēngrì shì shí'èr yuè yī hào.", 'Sinh nhật mình là ngày 1 tháng 12.')],
      nhieu={1: [L('我今年二十岁。', 'Wǒ jīnnián èrshí suì.'), L('今天星期三。', 'Jīntiān xīngqīsān.'), L('我是越南人。', 'Wǒ shì Yuènán rén.')],
             2: [L('我不会做饭。', 'Wǒ bú huì zuò fàn.'), L('我很喜欢你的电脑。', 'Wǒ hěn xǐhuan nǐ de diànnǎo.'), L('明天星期五。', 'Míngtiān xīngqīwǔ.')]}),
 dict(ten='Chủ nhật ai nấu cơm', luot=[L('星期天你做饭吗？', 'Xīngqītiān nǐ zuò fàn ma?', 'Chủ nhật bạn có nấu cơm không?'),
      L('做，我会做饺子。', 'Zuò, wǒ huì zuò jiǎozi.', 'Có, mình biết làm sủi cảo.'),
      L('真好！我不会做饭。', 'Zhēn hǎo! Wǒ bú huì zuò fàn.', 'Hay thật! Mình không biết nấu cơm.')],
      nhieu={1: [L('我是学生。', 'Wǒ shì xué·shēng.'), L('今天星期天。', 'Jīntiān xīngqītiān.'), L('我有一台新电脑。', 'Wǒ yǒu yì tái xīn diànnǎo.')],
             2: [L('我会说汉语。', 'Wǒ huì shuō Hànyǔ.'), L('你是哪国人？', 'Nǐ shì nǎ guó rén?'), L('这是我的电脑。', 'Zhè shì wǒ de diànnǎo.')]}),
 dict(ten='Máy tính của ai', luot=[L('这是谁的电脑？', 'Zhè shì shéi de diànnǎo?', 'Đây là máy tính của ai?'),
      L('是我姐姐的，是她的新电脑。', 'Shì wǒ jiějie de, shì tā de xīn diànnǎo.', 'Của chị mình, là máy tính mới của chị ấy.'),
      L('真好看！', 'Zhēn hǎokàn!', 'Đẹp thật!')],
      nhieu={1: [L('这是电脑。', 'Zhè shì diànnǎo.'), L('我很忙。', 'Wǒ hěn máng.'), L('我会做饭。', 'Wǒ huì zuò fàn.')],
             2: [L('我会做面条儿。', 'Wǒ huì zuò miàntiáor.'), L('今天星期几？', 'Jīntiān xīngqī jǐ?'), L('她是中国人。', 'Tā shì Zhōngguó rén.')]}),
]


def doc(p): return json.load(open(os.path.join(GOC, p), encoding='utf-8'))
def khong_nhan(s): return ''.join(re.sub(r'^[AB][：:]\s*', '', d) for d in s.split('\n'))


def kho_tra():
    kho = {}
    for f in sorted(glob.glob(os.path.join(GOC, 'data', 'tu-vung', 'cap-*.json'))):
        for x in doc(f):
            kho.setdefault(x['Chữ Hán'], []).append(x)
    return kho


def tim(kho, chu, py):
    ds = kho.get(chu, [])
    hop = [x for x in ds if strip(x['Pinyin']) == strip(py)] or ds
    return hop[0] if hop else None


def dung():
    kho = kho_tra()
    daCo = set()                                              # chữ đã có Thuận bút ở thẻ các bài trước
    for n in (1, 2, 3, 4):
        for w in doc(f'data/bai/bai-{n}.json')['tu']: daCo |= set(han(w.get('Thuận bút') or ''))
    tu, loi = [], []
    for (chu, py, loai, nghia, nhom, chang, cum, c1, c2) in N.TU:
        x = tim(kho, chu, py.replace('∥', ''))
        if not x: loi.append(f'không có trong kho: {chu}')
        tb = ''.join(c for c in dict.fromkeys(chu) if c not in daCo); daCo |= set(chu)
        w = {'Mã': x['Mã'] if x else '', 'Chữ Hán': chu, 'Pinyin': py, 'Âm Hán Việt': (x or {}).get('Âm Hán Việt', ''),
             'Từ loại': loai, 'Nghĩa tiếng Việt': nghia, 'Cấp HSK': (x['Mã'].split('-')[0] if x else ''), 'Thuận bút': tb,
             'Cụm từ': '\n'.join(f'{a} | {b}' for a, b in cum), 'Đọc từ': DOC_TU.get(chu, ''), '_nhom': nhom}
        for i, c in ((1, c1), (2, c2)):
            w[f'Câu {i}'], w[f'Pinyin câu {i}'], w[f'Nghĩa câu {i}'] = c[0], c[1], c[2]
            w[f'Đọc câu {i}'] = c[4] if len(c) > 4 else (khong_nhan(c[0]) if '\n' in c[0] else '')
            if '\n' in c[0] and len(c) > 4: w[f'Đọc câu {i}'] = khong_nhan(c[4])
        w['_chang'] = chang
        tu.append(w)
    chang = []
    for so in (1, 2, 3):
        chang.append({'so': so, 'ten': TEN_CHANG[so], 'tu': [w['Chữ Hán'] for w in tu if w['_chang'] == so],
                      'ghepChu': [g[0] for g in N.GHEP if g[2] == so]})
    for w in tu: del w['_chang']
    tuBai = [w['Chữ Hán'] for w in tu]

    def tuTrong(s):
        co = [t for t in tuBai if t in s]
        return [t for t in co if not any(t != u and t in u and s.count(t) == s.count(u) for u in co)]

    def changCua(*cau):
        s = ''.join(cau); can = [t for t in tuBai if t in s]; hoc = []
        for c in chang:
            hoc += c['tu']
            if all(t in hoc for t in can): return str(c['so'])
        return '3'
    cl = []
    for c in CAU:
        o = {'han': c[0], 'py': c[1], 'viet': c[2], 'tu': tuTrong(c[0])}
        if c[3]: o['np'] = c[3]
        if len(c) > 4: o['doc'] = c[4]
        cl.append(o)
    hd = [dict(h, chang=changCua(h['hoi'][0], h['dap'][0])) for h in HD]
    ht = []
    for h in HT:
        ht.append({'ten': h['ten'], 'luot': [{'han': x[0], 'py': x[1], 'viet': x[2]} for x in h['luot']],
                   'nhieu': {str(k): [{'han': x[0], 'py': x[1]} for x in v] for k, v in h['nhieu'].items()},
                   'chang': changCua(*[x[0] for x in h['luot']])})
    tp = dict(N.THANH_PHAN); coBo = {b['boThu'] for b in N.BO_THU}
    truoc = {}
    for n in (1, 2, 3, 4):
        for b in doc(f'data/bai/bai-{n}.json')['boThu']: truoc.setdefault(b['boThu'], b)
    for g in N.GHEP:                                          # thành phần ghép đã có thẻ ở bài trước: mang tên, nghĩa sang để hiện nhãn
        for p in g[1]:
            if p not in coBo and p not in tp:
                if p in truoc: tp[p] = {'pinyin': truoc[p]['pinyin'], 'ten': truoc[p]['ten'], 'nghia': truoc[p]['nghia']}
                else: loi.append(f'thành phần {p} của {g[0]} chưa có thông tin')
    d = {'bai': 5, 'ten': N.TEN, 'tenViet': N.TEN_VIET, 'pinyinTen': N.PINYIN_TEN, 'tenRieng': N.TEN_RIENG,
         'maBaiTap': 'bai5-bai-tap', 'tu': tu, 'boThu': N.BO_THU, 'thanhPhan': tp,
         'ghepChu': [{'chu': g[0], 'phan': g[1]} for g in N.GHEP], 'chang': chang, 'nguPhap': NGU_PHAP,
         'hoiDap': hd, 'cauLuyen': cl, 'hoiThoai': ht}
    return d, loi


def kiem(d, loi):
    from pypinyin import lazy_pinyin
    von = set(''.join(CHU.values())) | set(TEN_RIENG)
    def ck(s, py, nhan):
        s2 = re.sub(r'\b[AB][：:]', '', s); py2 = re.sub(r'\b[AB]:', '', py or '')
        ng = [c for c in han(s2) if c not in von]
        if ng: loi.append(f'{nhan}: chữ ngoài vốn {ng} :: {s}')
        if py is None: return
        a = strip(''.join('ling' if c == '〇' else lazy_pinyin(c)[0] for c in han(s2)))
        r = strip(''.join('ling' if c == '〇' else 'r' if c == '儿' else lazy_pinyin(c)[0] for c in han(s2)))
        if strip(py2) not in (a, r): loi.append(f'{nhan}: pinyin lệch :: {s} | {py}')
    for w in d['tu']:
        ck(w['Chữ Hán'], w['Pinyin'], 'từ')
        for dong in w['Cụm từ'].split('\n'):
            a, b = dong.split(' | '); ck(a, b, f'cụm {w["Chữ Hán"]}')
        for i in (1, 2):
            ck(w[f'Câu {i}'], w[f'Pinyin câu {i}'], f'câu {w["Chữ Hán"]}')
            if w[f'Câu {i}'].count('\n') != w[f'Pinyin câu {i}'].count('\n') or w[f'Câu {i}'].count('\n') != w[f'Nghĩa câu {i}'].count('\n'):
                loi.append(f'số dòng lệch: {w["Chữ Hán"]} câu {i}')
    for g in d['nguPhap']:
        for y in g['y']:
            for k in ('cum', 'viDu'):
                for c in y.get(k, []):
                    ck(c[0], c[1], f'NP {g["id"]}')
                    if ''.join(x[0] for x in c[3]) != c[0]: loi.append(f'NP {g["id"]}: đoạn màu không ghép lại đúng :: {c[0]}')
    for c in d['cauLuyen']: ck(c['han'], c['py'], 'câu luyện')
    for h in d['hoiDap']:
        for x in [h['hoi'], h['dap']] + h['nhieu']: ck(x[0], x[1], 'hỏi đáp')
    for h in d['hoiThoai']:
        for x in h['luot']: ck(x['han'], x['py'], 'hội thoại')
        for k, xs in h['nhieu'].items():
            for x in xs:
                ck(x['han'], x['py'], 'nhiễu HT')
                if x['han'] == h['luot'][int(k)]['han']: loi.append('nhiễu trùng đáp án')
    tb = [w['Chữ Hán'] + ':' + w['Thuận bút'] for w in d['tu']]
    print('Thuận bút:', ' '.join(tb))
    print('Chặng:', [(c['so'], len(c['tu']), c['ghepChu']) for c in d['chang']])
    print(f"{len(d['tu'])} thẻ · {len(d['nguPhap'])} NP · {len(d['cauLuyen'])} câu luyện · {len(d['hoiDap'])} hỏi đáp · {len(d['hoiThoai'])} hội thoại")
    for l in loi: print('  ✗', l)
    print('Lỗi:', len(loi)); return loi


if __name__ == '__main__':
    d, loi = dung()
    if kiem(d, loi): sys.exit(1)
    if len(sys.argv) > 1 and sys.argv[1] == 'ghi':
        tep = os.path.join(GOC, 'data', 'bai', 'bai-5.json')
        if os.path.exists(tep):                               # giữ phần do công cụ khác ghi (ctTruoc, nguPhapLuyen, câu bài khóa)
            cu = json.load(open(tep, encoding='utf-8'))
            for k in ('ctTruoc', 'nguPhapLuyen'):
                if k in cu: d[k] = cu[k]
            d['cauLuyen'] += [c for c in cu.get('cauLuyen', []) if c.get('nguon') == 'baiKhoa']
            d['hoiDap'] += [c for c in cu.get('hoiDap', []) if c.get('nguon') == 'baiKhoa']
            d['hoiThoai'] += [c for c in cu.get('hoiThoai', []) if c.get('nguon') == 'baiKhoa']
        open(tep, 'w', encoding='utf-8').write(json.dumps(d, ensure_ascii=False, indent=1) + '\n')
        print('Đã ghi', tep)
