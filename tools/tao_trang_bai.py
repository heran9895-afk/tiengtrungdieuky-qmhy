#!/usr/bin/env python3
"""Tạo bộ trang chuong-trinh-hsk/hsk1/bai-N/ từ khung Bài 5 (bài đã duyệt). Dùng cho Bài 6, 7…
  python3 tools/tao_trang_bai.py 6        # đọc data/bai/bai-6.json (ten, tenViet, pinyinTen, nguPhap, tu)
Trang tạo: index, tu-vung, ngu-phap, on-tap-1..3, bai-tap, bang-xep-hang, test-dau-gio (kiểm Bài N-1).
Chưa tạo: sach-bai-tap.html (cần giọng âm tiết + tranh, làm riêng).
Quy ước: bai-tap / on-tap nạp mọi bài trước làm TRUOC; test đầu giờ kiểm Bài N-1 (TRUOC = mọi bài trước N-1)."""
import json, os, re, sys

GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAU = os.path.join(GOC, 'chuong-trinh-hsk', 'hsk1', 'bai-5')
SO = {1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九'}
V = '20261111a'                                           # đổi khi sửa data để trình duyệt nạp lại
TRANG = ['index', 'tu-vung', 'ngu-phap', 'on-tap-1', 'on-tap-2', 'on-tap-3', 'bai-tap', 'bang-xep-hang', 'test-dau-gio']
# Mô tả ngắn từng điểm ngữ pháp trên thẻ ở trang bài (sửa cho khớp bài)
NP_MOTA = {
 6: ('Cách đọc số điện thoại · <span class="hanzi">给</span>…打电话 · <span class="hanzi">想</span> · <span class="hanzi">哪些 / 些 · 非常 · 怎么 / 怎么样</span> · câu liên động · lượng từ',
     'cách đọc số điện thoại, 给……打电话, 想, 哪些 / 些, 非常, 怎么 / 怎么样, câu liên động, lượng từ'),
 7: ('Cách nói giờ · <span class="hanzi">前 / 后</span> · <span class="hanzi">吧 · 呢</span> · vị trí phó từ và từ chỉ thời gian · <span class="hanzi">在</span> + nơi chốn · <span class="hanzi">在</span> + nơi chốn + ĐT · lượng từ',
     'cách nói giờ, 前 / 后, 吧, 呢, vị trí phó từ và từ chỉ thời gian, 在 + nơi chốn, 在 + nơi chốn + ĐT, lượng từ'),
}


def doc(p): return json.load(open(os.path.join(GOC, p), encoding='utf-8'))


def tep(n): return f'../../../data/bai/bai-{n}.json?v={V}'


def tao(N):
    d = doc(f'data/bai/bai-{N}.json'); han = d['ten'].split('：', 1)[1]
    ten_han, viet, pyin = d['ten'], d['tenViet'], d['pinyinTen']
    tp = doc(f'data/bai/bai-{N-1}.json'); han_truoc = tp['ten'].split('：', 1)[1]
    nTu = sum(1 for w in d['tu'] if w['_nhom'] == 'tuVung'); nMr = sum(1 for w in d['tu'] if w['_nhom'] == 'moRong')
    mota_html, mota_meta = NP_MOTA[N]
    out = os.path.join(GOC, 'chuong-trinh-hsk', 'hsk1', f'bai-{N}'); os.makedirs(out, exist_ok=True)
    for t in TRANG:
        s = open(os.path.join(MAU, t + '.html'), encoding='utf-8').read()
        if t == 'test-dau-gio':
            s = s.replace('Bài 5', f'Bài {N}')                       # đường dẫn + tiêu đề trang thuộc Bài N
            s = s.replace('Bài 4', f'Bài {N-1}').replace('bai4', f'bai{N-1}').replace('bai-4.json', f'bai-{N-1}.json').replace('我有两个孩子', han_truoc)
            s = s.replace(f'Test đầu giờ · Bài {N-1}</p>', f'Test đầu giờ · Bài {N-1}</p>')
            s = re.sub(r"TRUOC: \[[^\]]*\]", 'TRUOC: [' + ', '.join(f"'{tep(k)}'" for k in range(1, N - 1)) + ']', s)
            s = re.sub(r"BAI: '[^']*bai-\d+\.json\?v=[^']*'", f"BAI: '{tep(N-1)}'", s)
        else:
            s = s.replace('第五课：今天我休息', ten_han).replace('Bài 5: 今天我休息', f'Bài {N}: {han}')
            s = s.replace('Bài 5: Hôm nay tôi nghỉ', viet).replace('Dì wǔ kè: Jīntiān wǒ xiūxi', pyin)
            s = s.replace('第五课', f'第{SO[N]}课').replace('<span class="hanzi">今天我休息</span>', f'<span class="hanzi">{han}</span>')
            s = s.replace('Bài 5', f'Bài {N}').replace('bai5-', f'bai{N}-').replace('data-bai="5"', f'data-bai="{N}"')
            s = re.sub(r"(BAI: ')[^']*bai-5\.json\?v=[^']*(')", r"\g<1>" + tep(N) + r"\g<2>", s)
            s = re.sub(r"TRUOC: \[[^\]]*\]", 'TRUOC: [' + ', '.join(f"'{tep(k)}'" for k in range(1, N)) + ']', s)
        if t == 'ngu-phap':
            s = re.sub(r'(<meta name="description" content=")[^"]*(")', rf'\g<1>Ngữ pháp Bài {N} {ten_han} — {mota_meta}, có cụm từ, câu ví dụ và luyện tập.\2', s)
        if t == 'tu-vung':
            s = re.sub(r'(<meta name="description" content=")[^"]*(")', rf'\g<1>Từ vựng Bài {N} {ten_han} — tra cứu, nghe phát âm, thẻ lật, thẻ bộ thủ, thuận bút.\2', s)
        if t == 'index':
            s = re.sub(r'<h3>Test đầu giờ · Bài \d+</h3>', f'<h3>Test đầu giờ · Bài {N-1}</h3>', s)
            s = re.sub(r'<p>\d+ từ trong 词语表 và \d+ từ mở rộng', f'<p>{nTu} từ trong 词语表 và {nMr} từ mở rộng', s)
            s = re.sub(r'<p>\d+ điểm: .*?, có cụm từ, câu ví dụ và luyện tập\.</p>',
                       f'<p>{len(d["nguPhap"])} điểm: {mota_html}, có cụm từ, câu ví dụ và luyện tập.</p>', s, flags=re.S)
            # chưa có Luyện theo dạng sách bài tập cho bài này
            s = re.sub(r'\s*<a class="card" href="sach-bai-tap\.html">.*?</a>', '', s, flags=re.S)
            s = s.replace('7. Bảng xếp hạng', '6. Bảng xếp hạng')
        open(os.path.join(out, t + '.html'), 'w', encoding='utf-8').write(s)
    print(f'Đã tạo {len(TRANG)} trang ở chuong-trinh-hsk/hsk1/bai-{N}/ ({nTu} từ 词语表 + {nMr} mở rộng, {len(d["nguPhap"])} điểm NP)')


if __name__ == '__main__':
    tao(int(sys.argv[1]))
