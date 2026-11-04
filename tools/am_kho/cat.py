"""Cắt file wav Gemini của một lượt thành từng mục, kiểm bằng nhận dạng giọng nói, nén mp3.
Dùng: python3 cat.py <file.wav> <ten-luot, vd l01>
Kết quả: assets/am/tu|cau/<md5[:10]>.mp3 trong kho web + báo cáo ra màn hình và ketqua/<luot>.json"""
import sys, os, re, json, hashlib, subprocess, difflib, wave
import numpy as np, sherpa_onnx
from pypinyin import lazy_pinyin
R = '/home/claude/tiengtrungdieuky-qmhy/'
M = '/home/claude/asr/sherpa-onnx-paraformer-zh-small-2024-03-09/'
SR = 24000

def chuan(s):
    s = re.sub(r'\s+', '', str(s or ''))
    s = re.sub(r'(^|[。！？])[A-Z一-鿿]{1,4}[：:]', r'\1', s)
    return re.sub(r'[—–\-“”"]', '', s).replace('！', '。')

def py(s): return [p for p in lazy_pinyin(re.sub(r'[^一-鿿]|儿', '', s)) if p]

def ratio(a, b):
    return difflib.SequenceMatcher(None, a, b).ratio() if a or b else 1.0

wav, luot = sys.argv[1], sys.argv[2]
LS = json.load(open('/home/claude/am/luot.json')) + (json.load(open('/home/claude/am/nhi/luot.json')) if os.path.exists('/home/claude/am/nhi/luot.json') else [])
L = {b['ten']: b for b in LS}[luot]
lines, typ = L['ds'], L['typ']
khoa = L.get('khoa', lines)
os.makedirs('/home/claude/am/pcm', exist_ok=True)
pcm = '/home/claude/am/pcm/%s.wav' % luot
# 1. PCM sạch 24 kHz mono (bỏ qua header lỗi: -ignore_length)
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ignore_length', '1', '-i', wav, '-ac', '1', '-ar', str(SR), '-c:a', 'pcm_s16le', pcm], check=True)
with wave.open(pcm) as w: x = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
dur = len(x) / SR
# 2. Khoảng lặng −40 dB ≥ 0,2 s
out = subprocess.run(['ffmpeg', '-v', 'info', '-i', pcm, '-af', 'silencedetect=n=-40dB:d=0.2', '-f', 'null', '-'], capture_output=True, text=True).stderr
st = [float(v) for v in re.findall(r'silence_start: ([\d.]+)', out)]
en = [float(v) for v in re.findall(r'silence_end: ([\d.]+)', out)]
sil = list(zip(st, en + [dur] * (len(st) - len(en))))
vung, t = [], 0.0
for a, b in sil:
    if a - t > 0.08: vung.append([t, a])
    t = b
if dur - t > 0.08: vung.append([t, dur])
# 3. Nhận dạng từng vùng
rec = sherpa_onnx.OfflineRecognizer.from_paraformer(paraformer=M + 'model.int8.onnx', tokens=M + 'tokens.txt', num_threads=4)
def nhan(a, b):
    s = rec.create_stream(); seg = x[int(a * SR):int(b * SR)]
    s.accept_waveform(SR, np.concatenate([np.zeros(1600, np.float32), seg, np.zeros(3200, np.float32)])); rec.decode_stream(s)
    return s.result.text
for v in vung: v.append(nhan(v[0], v[1]))
# 4. Ghép vùng vào dòng theo pinyin (DP): mỗi dòng ăn 1–4 vùng liên tiếp; cho bỏ vùng thừa; từ/cụm cho bỏ dòng
n, m = len(lines), len(vung)
P = [py(l) for l in lines]
NEG = -1e9
dp = [[NEG] * (m + 1) for _ in range(n + 1)]; bk = [[None] * (m + 1) for _ in range(n + 1)]
dp[0][0] = 0
for i in range(n + 1):
    for j in range(m + 1):
        c = dp[i][j]
        if c == NEG: continue
        if j < m and c - 0.6 > dp[i][j + 1]: dp[i][j + 1], bk[i][j + 1] = c - 0.6, ('bovung', i, j)
        if i < n and c - 0.8 > dp[i + 1][j]: dp[i + 1][j], bk[i + 1][j] = c - 0.8, ('bodong', i, j)
        if i < n:
            for k in range(1, 5):
                if j + k > m: break
                txt = ''.join(v[2] for v in vung[j:j + k])
                r = ratio(P[i], py(txt))
                sc = c + r - 0.05 * (k - 1)
                if sc > dp[i + 1][j + k]: dp[i + 1][j + k], bk[i + 1][j + k] = sc, ('ghep', i, j, k, r, txt)
i, j, kq = n, m, {}
while i or j:
    b = bk[i][j]
    if b[0] == 'ghep': kq[b[1]] = (b[2], b[3], b[4], b[5])
    i, j = b[1], b[2]
# 5. Cắt rộng 0,12 s đầu / 0,15 s cuối, vuốt, −16 LUFS, mp3 48 kbps 24 kHz mono
thu = 'tu' if typ == 'tu' else 'cau'
od = R + 'assets/am/%s/' % thu
bc, xong, bo = [], {}, []
for i, l in enumerate(lines):
    if i not in kq: bo.append(l); bc.append((l, None, '', 'THIẾU')); continue
    j, k, r, txt = kq[i]
    a = max(0, vung[j][0] - 0.12); b = min(dur, vung[j + k - 1][1] + 0.15)
    if i + 1 in kq: b = min(b, vung[kq[i + 1][0]][0] - 0.02)
    if i - 1 in kq: a = max(a, vung[kq[i - 1][0] + kq[i - 1][1] - 1][1] + 0.02)
    ok = r >= 0.9
    bc.append((l, round(r, 2), txt, 'ok' if ok else 'SOI'))
    f = od + hashlib.md5(chuan(khoa[i]).encode()).hexdigest()[:10] + '.mp3'
    tmp = '/home/claude/am/pcm/_c.wav'
    d = b - a
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', '%.3f' % a, '-t', '%.3f' % d, '-i', pcm,
                    '-af', 'afade=t=in:d=0.04,afade=t=out:st=%.3f:d=0.08,apad=pad_dur=0.3,loudnorm=I=-16:TP=-1.5:LRA=11' % max(0, d - 0.08),
                    '-ar', str(SR), tmp], check=True)
    os.makedirs('/home/claude/am/ra/' + luot, exist_ok=True)
    dich = ('/home/claude/am/ra/%s/' % luot) + os.path.basename(f)   # để ở thư mục tạm; ok mới chép vào web
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', 'atrim=end=%.3f' % (d + 0.05), '-ac', '1', '-ar', str(SR), '-b:a', '48k', dich], check=True)
    xong[chuan(khoa[i])] = {'file': 'assets/am/%s/' % thu + os.path.basename(f), 'tam': dich, 'r': r, 'asr': txt}
json.dump({'luot': luot, 'vung': len(vung), 'dong': n, 'kq': xong, 'thieu': bo}, open('/home/claude/am/ketqua/%s.json' % luot if os.makedirs('/home/claude/am/ketqua', exist_ok=True) is None else '', 'w'), ensure_ascii=False, indent=1)
print('%s: %d vùng, %d dòng, khớp ≥0,9: %d, soi: %d, thiếu: %d' % (luot, m, n, sum(1 for b in bc if b[3] == 'ok'), sum(1 for b in bc if b[3] == 'SOI'), len(bo)))
for b in bc:
    if b[3] != 'ok': print('  ', b)
