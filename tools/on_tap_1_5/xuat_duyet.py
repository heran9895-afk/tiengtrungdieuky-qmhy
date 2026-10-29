# -*- coding: utf-8 -*-
"""Xuất file duyệt nội dung Ôn tập tổng hợp Bài 1–5 → claude/duyet-on-tap-tong-hop-bai-1-5.md (Project).
  python3 tools/on_tap_1_5/xuat_duyet.py <đường dẫn ra>
"""
import os, sys, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import von, kiem

D = kiem.nap('dich')
T = kiem.nap('on_tap')
NET = kiem.NET
out = []
w = out.append
py = von.pinyin_cau


def bo_ten(s):
    m = re.match(r'^([^：]{1,4})：(.*)$', s)
    return (m.group(1), m.group(2)) if m and m.group(1) in von.TEN_RIENG else ('', s)


loi_d, phu, np_phu, thieu_tu, thieu_np = kiem.kiem_dich()
loi_t = kiem.kiem_trac_nghiem()

w('# Duyệt nội dung · Ôn tập tổng hợp Bài 1–5 (HSK 3.0)\n')
w('*Soạn 30/10/2026 theo yêu cầu của cô Nhiên. **ĐÃ LÊN WEB 30/10/2026** theo yêu cầu (cô kiểm trên web rồi báo sửa): thẻ 📚 Ôn tập tổng hợp Bài 1–5 ở trang HSK 1, thư mục `chuong-trinh-hsk/hsk1/on-tap-1-5/`. Máy chủ điểm cần bản **2026-10-30a** (Project `claude/may-chu-diem-Code.gs`) để nhận bài làm và để chế độ giáo viên của Bài dịch hoạt động.*\n')
w('Nguồn soạn trong kho web: `tools/on_tap_1_5/` (`on_tap.py` các phần trắc nghiệm, `dich.py` bài dịch, `kiem.py` máy kiểm, `xuat_duyet.py` xuất file này).\n')

w('## 0. Tóm tắt\n')
w('- **Vị trí:** thẻ mới **📚 Ôn tập tổng hợp Bài 1–5** ở trang HSK 1 (Chương trình HSK 3.0), đứng sau thẻ Bài 5, ngang hàng các thẻ Bài 1 … Bài 5. Thư mục `chuong-trinh-hsk/hsk1/on-tap-1-5/`.')
w('- **8 phần** (mỗi phần một trang con, có nút trên trang chính của thẻ): 🔤 Ngữ âm · ✍️ Chữ Hán · 📚 Từ vựng · 📐 Ngữ pháp · 📖 Đọc hiểu · 🎧 Nghe · 🗣️ Nói *(chờ yêu cầu của cô, hiện \"Sắp có\")* · 🌏 Dịch Việt → Trung.')
w('- **Gửi bài làm về Sheet:** mọi phần (cả Bài dịch) gửi kết quả **từng câu** về Google Sheet của máy chủ điểm, cách gửi như Luyện ngữ pháp (lưu tạm trên máy khi mất mạng, không ghi trùng). **Không lên Bảng xếp hạng.**')
w('- **Vốn chữ, vốn từ:** mọi chữ Hán trong đề, đáp án, nhiễu thuộc Bài 1–5 (sổ tích lũy, 180 chữ) hoặc phần Chữ Hán của Nhập môn (chỉ dùng ở phần Chữ Hán). Câu tiếng Trung ở Ngữ pháp, Đọc hiểu, Nghe, Dịch được máy **tách từ theo bảng Từ vựng + Từ vựng mở rộng của 5 bài**: không còn chữ nào nằm ngoài một từ đã học.')
w(f'- **Máy kiểm hôm nay:** Bài dịch phủ **{len(von.TU_HOC) - len(thieu_tu)}/{len(von.TU_HOC)} từ** và **{len(kiem.NP_TEN) - len(thieu_np)}/{len(kiem.NP_TEN)} điểm ngữ pháp**; '
  f'{"không có lỗi chữ / từ ngoài 5 bài" if not (loi_d or loi_t) else str(len(loi_d) + len(loi_t)) + " lỗi"}. Số nét, nét có trong chữ, kết cấu đều đối chiếu hai bộ dữ liệu chữ Hán (hanzi-writer-data, cnchar).')
w('- **Đề không có nghĩa tiếng Việt** (luật 29/10) — trừ **Bài dịch** (đề bắt buộc là tiếng Việt) và các nhãn đáp án ở phần Nghe ngày tháng (xem điểm cần chốt 3).\n')

w('## 1. Điểm cần cô chốt\n')
w('1. **Bài dịch – cách chấm.** Học sinh gõ bản dịch từng câu → bấm *Nộp* → máy so với đáp án chính và các cách dịch chấp nhận (bỏ khoảng trắng; dấu câu phải đúng như quy chuẩn 03 §10). Khớp thì báo ✓, không khớp thì hiện đáp án để học sinh tự đối chiếu và đánh dấu *Em dịch giống ý* / *Em dịch sai*. Sheet ghi cả bài học sinh gõ, kết quả máy so và học sinh tự đánh giá. Phần này **không tính điểm**. Cô đồng ý cách này không?')
w('2. **Loại hình chữ Hán** (mục B3): bên soạn chỉ chọn chữ có cách phân loại **thống nhất** trong các sách văn tự học phổ thông. Đã **bỏ** các chữ còn tranh cãi: 天 (chỉ sự / hội ý), 十, 小, 家 (Thuyết văn xếp hình thanh), 字 (hình thanh kiêm hội ý), 他, 认, 欢, 汉 (giản thể làm mất phần biểu âm). Cô xem lại 大 (tượng hình), 见 (hội ý theo chữ phồn thể 見), 名 (hội ý), 本 (chỉ sự).')
w('3. **Nghe ngày tháng** (F2): đáp án ghi bằng số (8/9, 2026) và **Thứ 2 … Chủ nhật**. Nếu cô muốn tuyệt đối không có tiếng Việt thì đổi sang đáp án chữ Hán (nghe 星期三, chọn 星期三 / 星期四 / 星期二).')
w('4. **Kết cấu chữ** (B4): dùng đúng 13 tên kết cấu của mục *Kết cấu chữ Hán* ở Nhập môn. Không đưa 我 vào (Bài 2 dạy ghép 我 = 手 + 戈, còn quy chuẩn 11 coi 我 là độc thể), 年, 菜, 喜, 真 (các sách xếp khác nhau).')
w('5. **Từ vựng** (C1) dùng lại bộ máy Bài tập với toàn bộ 160 từ của 5 bài; một lượt **30 câu** bốc ngẫu nhiên (ưu tiên ⭐ từ khó, từ đang yếu), mỗi lượt khác nhau. Cô muốn số câu khác thì báo.')
w('6. **Ngữ pháp** (D): mỗi lượt = **mỗi thẻ ngữ pháp Bài 2–5 một câu** bốc từ kho Luyện ngữ pháp đã duyệt (28 thẻ) + **6 câu tổng hợp liên bài** bốc từ 36 câu mới ở mục D (cần cô duyệt). Câu sai trong dạng Đúng/Sai lấy đúng lỗi ghi ở ô *Lưu ý* của thẻ.')
w('7. **Tên nhân vật trong đề dịch tiếng Việt:** Lý Văn, Bạch Gia Nguyệt, Trần Thiên Trung, An Ni, cô Vương (王一飞 = Vương Nhất Phi), Vương Nhất Tuyết, Lưu Minh, Dương Đồng Lạc. Bên soạn giữ đúng các điều đã biết về nhân vật (王一雪 có con trai 5 tuổi, con gái 12 tuổi, hai anh trai; 杨同乐 nhà 4 người…). Những điều **mới thêm** để có ngữ cảnh: gia đình 李文 (bố, mẹ, em trai 7 tuổi; ông nội 80, bà nội 79), gia đình 陈天中 (6 người), gia đình 安妮 (4 người, người Anh), 刘明 có một chị gái, 白家月 có máy tính mới, em gái 杨同乐 20 tuổi. Cô thấy chỗ nào lệch với bài sau thì báo.')
w('8. **Thứ tự 8 phần** và tên nút như mục 0. Phần **Nói** để \"Sắp có\" đến khi cô gửi yêu cầu.\n')

# ---------------- Bài dịch ----------------
w('## 2. 🌏 Dịch Việt → Trung (soạn mới — cần duyệt kỹ)\n')
w(f'Ba phần: **Dịch câu** ({len(D.CAU)} câu, trọng tâm ngữ pháp) · **Dịch hội thoại** (5 hội thoại) · **Dịch đoạn văn** (3 đoạn). '
  'Mỗi dòng: đề tiếng Việt → **đáp án chính** (+ pinyin) → *chấp nhận thêm*. Cô sửa được tất cả ở chế độ giáo viên (mục 9).\n')
w('### 2.1 Dịch câu\n')
w('| # | Tiếng Việt | Đáp án | Chấp nhận thêm | Ngữ pháp |')
w('|---|---|---|---|---|')
for c in D.CAU:
    them = ' · '.join(c['zh'][1:]) or '—'
    gc = f"<br>*{c['ghiChu']}*" if c.get('ghiChu') else ''
    w(f"| {c['ma']} | {c['vi']}{gc} | **{c['zh'][0]}**<br>{py(c['zh'][0])} | {them} | {', '.join(c['np'])} |")
w('')
w('### 2.2 Dịch hội thoại\n')
for h in D.HOI_THOAI:
    w(f"#### {h['ma'].upper()} · {h['ten']}\n")
    w('| # | Người nói | Tiếng Việt | Đáp án | Chấp nhận thêm |')
    w('|---|---|---|---|---|')
    for i, l in enumerate(h['luot'], 1):
        them = ' · '.join(l['zh'][1:]) or '—'
        w(f"| {i} | {l['ai']} | {l['vi']} | **{l['zh'][0]}**<br>{py(l['zh'][0])} | {them} |")
    w(f"\n*Ngữ pháp trọng tâm:* {', '.join(h['np'])}\n")
w('### 2.3 Dịch đoạn văn\n')
w('Học sinh dịch cả đoạn trong một ô; máy so từng câu theo dấu 。？！.\n')
for d in D.DOAN_VAN:
    w(f"#### {d['ma'].upper()} · {d['ten']}\n")
    w('**Đề:** ' + ' '.join(c['vi'] for c in d['cau']) + '\n')
    w('| # | Đáp án | Chấp nhận thêm |')
    w('|---|---|---|')
    for i, c in enumerate(d['cau'], 1):
        them = ' · '.join(c['zh'][1:]) or '—'
        w(f"| {i} | **{c['zh'][0]}**<br>{py(c['zh'][0])} | {them} |")
    w(f"\n*Ngữ pháp trọng tâm:* {', '.join(d['np'])}\n")

w('### 2.4 Bảng phủ từ vựng và ngữ pháp (máy đếm theo đáp án chính)\n')
w('**Ngữ pháp** — điểm nào được luyện ở câu / hội thoại / đoạn nào:\n')
w('| Bài | Điểm ngữ pháp | Có ở |')
w('|---|---|---|')
for k, (n, ten) in sorted(kiem.NP_TEN.items(), key=lambda x: x[1][0]):
    w(f"| {n} | {ten} (`{k}`) | {', '.join(np_phu.get(k, [])) or '**THIẾU**'} |")
w('')
w('**Từ vựng** — mỗi từ của 5 bài (từ vựng + mở rộng) xuất hiện ở đâu (tối đa 4 chỗ):\n')
for n in range(1, 6):
    ds = [h for h in von.TU_HOC if von.TU[h][1] == n]
    w(f"- **Bài {n}** ({len(ds)} từ): " + ' · '.join(f"{h} ({', '.join(sorted(set(phu.get(h, [])))[:4]) or 'THIẾU'})" for h in ds))
w('')

# ---------------- Ngữ âm ----------------
w('## 3. 🔤 Ngữ âm (soạn mới)\n')
w('Một lượt **20 câu** bốc ngẫu nhiên, mỗi dạng tối đa 4 câu. Dạng nghe: máy tự đọc, có nút 🔊 nghe lại.\n')
w('**A1 · Nghe chữ, chọn thanh mẫu** (đáp án / nhiễu): ' + ' · '.join(f"{c} **{d}** / {', '.join(n)}" for c, d, n in T.THANH_MAU) + '\n')
w('**A2 · Nghe chữ, chọn vận mẫu** (âm tiết không dấu, giữ chữ cái đầu): ' + ' · '.join(f"{c} **{d}** / {', '.join(n)}" for c, d, n in T.VAN_MAU) + '\n')
w('**A3 · Nghe một chữ, chọn chữ đúng** (cặp đọc gần giống): ' + ' · '.join(f"đọc **{c}** → chọn trong {c} {' '.join(n)}" for c, n in T.NGHE_CHU) + '\n')
w('**A4 · Nghe từ, chọn pinyin đúng thanh điệu:** ' + ' · '.join(f"{c} **{d}** / {', '.join(n)}" for c, d, n in T.PY_TU) + '\n')
w('**A5 · Biến điệu 不, 一 — chọn cách ghi pinyin đúng:** ' + ' · '.join(f"{c} **{d}** / {s}" for c, d, s in T.BIEN_DIEU) + '\n')
w('**A6 · Quy tắc đọc và viết pinyin**\n')
w('| Đề | Đáp án | Nhiễu | Lời giải |')
w('|---|---|---|---|')
for q in T.QUY_TAC_AM:
    w(f"| {q[0]} | **{q[1]}** | {' · '.join(q[2])} | {q[3]} |")
w('')

# ---------------- Chữ Hán ----------------
w('## 4. ✍️ Chữ Hán (soạn mới)\n')
w('Chữ lấy từ 5 bài và các mục **Nét trong chữ Hán · Quy tắc thuận bút · Kết cấu chữ Hán** của Nhập môn. Một lượt **20 câu**, mỗi dạng tối đa 4 câu. '
  'Lời giải có hình động viết chữ (dùng lại bộ máy Thuận bút của web) để học sinh xem lại thứ tự nét.\n')
w('**B1 · Đếm số nét** (\"Chữ X có mấy nét?\", 3 phương án: đúng ± 1): ' + ' · '.join(f"{c} {NET[c]['n']}" for c in T.DEM_NET) + '\n')
w('**B2 · Tìm chữ có / không có nét cơ bản** (8 nét cơ bản theo Nhập môn)\n')
w('| Đề | Đáp án | Nhiễu | Các nét của đáp án |')
w('|---|---|---|---|')
for ten, co, dap, nh in T.TIM_NET:
    de = f"Chữ nào {'có' if co else '**không** có'} nét {ten}?"
    w(f"| {de} | **{dap}** | {' · '.join(nh)} | {' · '.join(NET[dap]['ten'])} |")
w('')
w('**B2b · Nét viết đầu tiên của chữ:** ' + ' · '.join(f"{c} → {t}" for c, t in T.NET_DAU) + '\n')
w('**B3 · Loại hình chữ Hán** — đề: \"Chữ X thuộc loại nào?\" (4 phương án là 4 loại) và \"Chữ nào là chữ hình thanh / hội ý…?\"\n')
w('| Loại | Định nghĩa (hiện ở lời giải) | Chữ · cách giải thích |')
w('|---|---|---|')
for loai, v in T.LOAI_HINH.items():
    w(f"| **{loai}** | {v['dn']} | {' · '.join(f'{c}: {g}' for c, g in v['chu'].items())} |")
w('')
w('**B3b · Chữ hình thanh: bộ phận nào biểu âm?** (đáp án / nhiễu là bộ phận biểu nghĩa): ' +
  ' · '.join(f"{c}: **{a}** / {n}" for c, a, n in T.BIEU_AM) + '\n')
w('**B4 · Kết cấu chữ Hán** — đề: \"Chữ X có kết cấu gì?\" và \"Chữ nào có kết cấu …?\"\n')
w('| Kết cấu | Chữ |')
w('|---|---|')
for k, ds in T.KET_CAU.items():
    w(f"| {k} | {' '.join(ds)} |")
w('')
w('**B5 · Quy tắc thuận bút** — đề: \"Chữ X viết theo quy tắc nào?\" (nhiễu là quy tắc khác):\n')
for c, r in T.THUAN_BUT:
    w(f'- {c} → {r}')
w('')
w('**B6 · Chữ nào có bộ …?** ' + ' · '.join(f"bộ {b}: **{d}** / {' '.join(n)}" for b, d, n in T.TIM_BO) + '\n')
w('**B7 · Ghép bộ thủ:** dùng lại 36 chữ ghép đã duyệt của Bài 1–5 (không soạn mới).\n')

# ---------------- Từ vựng ----------------
w('## 5. 📚 Từ vựng\n')
w('**C1 · Luyện tổng hợp** — dùng lại bộ máy Bài tập (Chọn chữ Hán, Nghe chọn từ, Chọn pinyin, Ghép cặp, Ghép cụm từ, Điền từ, Sắp xếp câu) với 160 từ của 5 bài, câu ví dụ và kho câu đã duyệt. Không soạn câu mới.\n')
w('**C2 · Xếp từ vào nhóm** (soạn mới; mỗi lượt bốc 3 nhóm × 3 từ, một từ chỉ thuộc một nhóm):\n')
for k, ds in T.NHOM_TU.items():
    w(f"- **{k}:** {' '.join(ds)}")
w('')
w('**C3 · Tìm từ khác nhóm** (soạn mới):\n')
w('| Đáp án | Ba từ cùng nhóm | Lời giải |')
w('|---|---|---|')
for a, ds, g in T.KHAC_NHOM:
    w(f"| **{a}** | {' '.join(ds)} | {g} |")
w('')

# ---------------- Ngữ pháp ----------------
w('## 6. 📐 Ngữ pháp — câu tổng hợp liên bài (soạn mới)\n')
w('Ngoài 36 câu dưới đây, mỗi lượt lấy thêm mỗi thẻ Bài 2–5 một câu từ kho Luyện ngữ pháp đã duyệt.\n')
w('| Mã | Dạng | Đề | Đáp án | Nhiễu / câu sửa | Thẻ | Lời giải |')
w('|---|---|---|---|---|---|---|')
for it in T.NGU_PHAP:
    if it['dang'] == 'chon':
        w(f"| {it['ma']} | Chọn từ | {it['de']} | **{it['dap']}** | {' · '.join(it['nhieu'])} | {it['np']} | {it['giai']} |")
    elif it['dang'] == 'xep':
        w(f"| {it['ma']} | Xếp câu | {' / '.join(it['khoi'])} | **{' · '.join(it['dap'])}** | — | {it['np']} | {it['giai']} |")
    else:
        w(f"| {it['ma']} | Đúng / sai | {it['cau']} | **{'Đúng' if it['dung'] else 'Sai'}** | {it.get('sua', '—')} | {it['np']} | {it['giai']} |")
w('')

# ---------------- Đọc hiểu ----------------
w('## 7. 📖 Đọc hiểu (soạn mới)\n')
w('Ba bài; học sinh chọn bài, đọc (nút Hiện pinyin, 🔊 nghe cả bài), rồi trả lời. Câu hỏi và đáp án đều bằng tiếng Trung.\n')
for d in T.DOC_HIEU:
    w(f"### {d['ten']}\n")
    for s in d['van']:
        ai, nd = bo_ten(s)
        w(f"> {s}  \n> *{(von.TEN_RIENG.get(ai, ai) + ': ') if ai else ''}{py(nd)}*\n>")
    w('')
    for i, h in enumerate(d['hoi'], 1):
        if h['dang'] == 'chon':
            w(f"{i}. {h['hoi']} → **{h['dap']}** / {' · '.join(h['nhieu'])}")
        else:
            w(f"{i}. Đúng hay sai: {h['hoi']} → **{'Đúng' if h['dung'] else 'Sai'}**")
    w('')

# ---------------- Nghe ----------------
w('## 8. 🎧 Nghe (soạn mới, giọng đọc máy)\n')
w('Một lượt **15 câu**. Câu hỏi và chữ của bài nghe ẩn, hiện sau khi trả lời.\n')
w('**F1 · Nghe số:** ' + ' · '.join(f"{s} **{d}** / {', '.join(n)}" for s, d, n in T.NGHE_SO) + '\n')
w('**F2 · Nghe ngày tháng, thứ:** ' + ' · '.join(f"{s} **{d}** / {', '.join(n)}" for s, d, n in T.NGHE_NGAY) + '\n')
w('**F3 · Nghe hội thoại ngắn:**\n')
for h in T.NGHE_HT:
    w(f"- {' '.join(h['luot'])}  \n  Hỏi: {h['hoi']} → **{h['dap']}** / {' · '.join(h['nhieu'])}")
w('')

# ---------------- Thiết kế + mật khẩu ----------------
w('## 9. Chế độ giáo viên của Bài dịch và hướng dẫn đặt mật khẩu\n')
w('### 9.1 Cách hoạt động\n')
w('- Đề và đáp án Bài dịch lưu ở trang tính **BaiDich** trong Google Sheet của máy chủ điểm. Trang Bài dịch luôn tải **bản cô lưu mới nhất**; máy chủ lỗi thì dùng bộ đề gốc (bản cô duyệt ở file này).')
w('- Cuối trang có nút **🔒 Chế độ giáo viên**. Cô nhập mật khẩu → **máy chủ** kiểm tra (mật khẩu không nằm trong mã web). Đúng thì mở khung sửa: thêm / xóa / sửa đề tiếng Việt, đáp án chính, các cách dịch chấp nhận, đổi thứ tự câu; bấm **💾 Lưu** → học sinh mở trang sẽ nhận ngay bản mới.')
w('- Mỗi lần lưu giữ lại bản cũ (ghi giờ lưu), cô có thể **khôi phục** bản trước nếu lỡ tay. Bài làm của học sinh ghi kèm số phiên bản đề để biết em đó làm theo bản nào.')
w('- Nhập sai mật khẩu 5 lần liên tiếp thì khóa 10 phút (chống dò mật khẩu).\n')
w('### 9.2 Đặt mật khẩu (làm một lần, khoảng 2 phút)\n')
w('**Cô chốt 30/10/2026: dùng luôn mật khẩu `MAT_KHAU` đang có** (mật khẩu xoá điểm) — không cần làm gì thêm. Nếu sau này muốn mật khẩu sửa đề riêng (ví dụ giao cho trợ giảng mà không cho xoá điểm), thêm khoá `MAT_KHAU_GV` theo các bước dưới; máy chủ tự ưu tiên `MAT_KHAU_GV` khi có.\n')
w('1. Mở **Google Sheet của máy chủ điểm** (Sheet có các trang Scores, Answers, NguPhapLuot…).')
w('2. Trên thanh menu chọn **Tiện ích mở rộng → Apps Script** (*Extensions → Apps Script*). Trang soạn mã mở ra ở tab mới.')
w('3. Ở cột biểu tượng bên trái, bấm **⚙️ Cài đặt dự án** (*Project Settings*).')
w('4. Kéo xuống cuối trang, phần **Thuộc tính tập lệnh** (*Script properties*). Cô sẽ thấy dòng `MAT_KHAU` đã có. Bấm **Chỉnh sửa thuộc tính tập lệnh** (*Edit script properties*) → **Thêm thuộc tính tập lệnh** (*Add script property*).')
w('5. Ô **Thuộc tính** (*Property*) gõ đúng: `MAT_KHAU_GV` (chữ in hoa, gạch dưới). Ô **Giá trị** (*Value*) gõ mật khẩu cô chọn — nên từ 8 ký tự trở lên, **không** dùng lại mật khẩu Gmail.')
w('6. Bấm **Lưu thuộc tính tập lệnh** (*Save script properties*). Xong.\n')
w('- **Đổi mật khẩu:** làm lại bước 1–4, sửa ô Giá trị của `MAT_KHAU_GV`, bấm Lưu. Có hiệu lực ngay, **không cần triển khai lại**.')
w('- **Quên mật khẩu:** mở lại bước 1–4 để xem.')
w('- **Lưu ý:** khi dựng xong, bên soạn gửi bản `Code.gs` mới (thêm lệnh lưu / tải Bài dịch và ghi bài làm Ôn tập tổng hợp). Cô dán mã và **triển khai phiên bản mới** như mọi lần (*Triển khai → Quản lý các bản triển khai → bút chì → Phiên bản mới → Triển khai*); thuộc tính `MAT_KHAU_GV` đã đặt không mất khi dán mã mới. Cô có thể đặt mật khẩu ngay bây giờ.\n')

w('## 10. Dữ liệu gửi về Sheet\n')
w('Máy chủ tự tạo 2 trang tính mới (giống NguPhapLuot / NguPhapCau):\n')
w('- **OnTapLuot** — mỗi lượt một dòng: thoiDiem, maLuot, maHs (mã ẩn danh), hoTen, lop, hoSoId, maMay, phan (`ngu-am`, `chu-han`, `tu-vung`, `ngu-phap`, `doc-hieu`, `nghe`, `dich`), lanLam, soCau, soDung, tiLe, giay, thietBi, phienBan.')
w('- **OnTapCau** — mỗi câu một dòng: thoiDiem, maLuot, maHs, hoTen, lop, phan, stt, maCau (mã cố định như `A1-这`, `np05`, `c17`, `h3-6`), dang, nhom (thẻ ngữ pháp / loại nét / loại hình…), deBai, dapAn, hocSinhChon (bài dịch: nguyên văn học sinh gõ), dung (1/0; bài dịch: máy so khớp), tuDanhGia (bài dịch: học sinh tự đánh giá), giay, thuTuPhuongAn, phienBanDe.')
w('- Xem nhanh tỉ lệ đúng theo nhóm: `…/exec?action=otThongKe&phan=chu-han`.\n')

w('## 11. Chạy kiểm\n')
w('```')
w('python3 tools/on_tap_1_5/kiem.py        # chữ / từ ngoài 5 bài, phủ từ vựng, phủ ngữ pháp, số nét, nét, kết cấu')
w('python3 tools/on_tap_1_5/kiem.py py     # in pinyin tự sinh của đáp án dịch')
w('```')
if loi_d or loi_t:
    w('\n**Lỗi còn lại:**\n')
    for l in loi_d + loi_t: w(f'- {l}')

open(sys.argv[1] if len(sys.argv) > 1 else 'duyet.md', 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print('đã xuất', len(out), 'dòng')
