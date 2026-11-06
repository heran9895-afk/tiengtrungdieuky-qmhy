# Video từ vựng cho Facebook / TikTok

Quy chuẩn: Project `quy-chuan/15-quy-chuan-video-tu-vung.md`.

```bash
# tại gốc kho
python3 -m http.server 8765 &                      # phục vụ web
(mkdir -p /tmp/hw && cd /tmp/hw && npm init -y >/dev/null && npm i hanzi-writer@3.5.0 hanzi-writer-data@2.0.1)
HW=/tmp/hw/node_modules node tools/video/quay.js 1-0002 /tmp/v/1-0002
python3 tools/video/ghep.py /tmp/v/1-0002 /tmp/v/1-0002-爱好.mp4
```

- `quay.js`: mở Kho từ vựng 9 cấp ở khung điện thoại 375×812 (ra 886×1920, đặt giữa nền mờ 1080×1920 để TikTok cắt hai bên không lẹm chữ), làm mờ logo / Zalo / Facebook / tài khoản / dòng tên cô ở chân trang, bấm lần lượt: thẻ từ → loa ×2 → từng ô thuận bút → từng cụm (hiện pinyin, đọc) → từng câu (hiện pinyin + nghĩa, đọc). Ghi khung hình (CDP screencast) và thời điểm phát từng file mp3.
- `ghep.py`: ghép khung hình theo đúng thời điểm, trộn các file mp3 vào đúng lúc bấm loa, xuất H.264 30 fps + AAC.
- CDN jsdelivr bị chặn trong máy chủ bên soạn → `quay.js` trả hanzi-writer và dữ liệu nét từ `node_modules` (biến `HW`).
