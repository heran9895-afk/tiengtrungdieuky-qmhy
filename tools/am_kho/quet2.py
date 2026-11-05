import json,glob,subprocess,re,numpy as np,sherpa_onnx
from pypinyin import lazy_pinyin
M='/home/claude/asr/sherpa-onnx-paraformer-zh-small-2024-03-09/'
rec=sherpa_onnx.OfflineRecognizer.from_paraformer(paraformer=M+'model.int8.onnx',tokens=M+'tokens.txt',num_threads=4)
def load(f):
    r=subprocess.run(['ffmpeg','-v','error','-i',f,'-f','s16le','-ac','1','-ar','16000','-'],capture_output=True).stdout
    return np.frombuffer(r,np.int16).astype(np.float32)/32768
def nhan(x):
    s=rec.create_stream(); s.accept_waveform(16000,np.concatenate([np.zeros(1600,np.float32),x,np.zeros(3200,np.float32)])); rec.decode_stream(s); return s.result.text
for f in sorted(glob.glob('ketqua/l*.json')):
    d=json.load(open(f))
    for k,v in d['kq'].items():
        x=load(v['tam']); dur=len(x)/16000; n=len(re.sub(r'[^一-鿿]','',k))
        if n==1:
            g=np.zeros(4000,np.float32); t=nhan(np.concatenate([x,g,x,g,x]))
            flag = dur>1.4 or ''.join(lazy_pinyin(k)) not in ''.join(lazy_pinyin(t))
            if flag: print(d['luot'],k,round(dur,2),t)
        elif dur/n>0.75 or dur/n<0.22: print(d['luot'],'DÀI/NGẮN',k,round(dur,2),round(dur/n,2))
