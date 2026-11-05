"""Tạo đuôi tự nhiên cho đoạn cắt giữa câu: kéo dài 35% cuối ×1.6, hạ cao độ cuối ~10%, giảm âm lượng 0,14 s."""
import json,subprocess,numpy as np,parselmouth
from parselmouth.praat import call
SR=24000
TMP='/tmp/claude-0/-home-claude/2356be9b-fc49-5c58-8dc5-1fc0d379e79b/scratchpad/'
def rd(t): return np.frombuffer(subprocess.run(['ffmpeg','-v','error','-i',t,'-f','s16le','-ac','1','-ar',str(SR),'-'],capture_output=True).stdout,np.int16).astype(np.float32)/32768
def lam_duoi(x):
    s=parselmouth.Sound(x.astype(np.float64),SR)
    d=s.duration; t0=d*0.65
    man=call(s,'To Manipulation',0.01,120,450)
    dt=call('Create DurationTier','d',0,d); call(dt,'Add point',t0-0.01,1.0); call(dt,'Add point',t0+0.03,1.6); call(dt,'Add point',d,1.6)
    call([dt,man],'Replace duration tier')
    pt=call(man,'Extract pitch tier')
    f=s.to_pitch(time_step=0.01,pitch_floor=120,pitch_ceiling=450)
    hz=call(f,'Get value at time',t0,'Hertz','linear')
    if hz==hz:
        call(pt,'Remove points between',t0,d); call(pt,'Add point',t0,hz); call(pt,'Add point',d,hz*0.9)
        call([pt,man],'Replace pitch tier')
    o=call(man,'Get resynthesis (overlap-add)')
    y=o.values[0].astype(np.float32)
    n=int(0.14*SR); y[-n:]*=np.cos(np.linspace(0,np.pi/2,n))**2
    m=int(0.008*SR); y[:m]*=np.linspace(0,1,m)
    return y
def ghi(x,ra):
    pcm=(np.clip(x,-1,1)*32767).astype(np.int16).tobytes()
    subprocess.run(['ffmpeg','-v','error','-y','-f','s16le','-ar',str(SR),'-ac','1','-i','-','-af','apad=pad_dur=0.3,loudnorm=I=-16:TP=-1.5:LRA=11','-ar',str(SR),'-ac','1','-b:a','48k',ra],input=pcm,check=True)
sil=lambda s:np.zeros(int(s*SR),np.float32)
c1=rd(json.load(open('ketqua/n13.json'))['kq']['摄像头拍下了小偷儿的样子，警察很快就抓住了他。']['tam'])
xt=lam_duoi(c1[int(1.283*SR):int(1.675*SR)])
ghi(np.concatenate([sil(0.12),xt]),'praat/ra/xt_rieng.mp3')
zh=rd(json.load(open('ketqua/r02.json'))['kq']['抓小头儿|tam']['tam'])
a=zh[:int(0.405*SR)].copy(); k=int(0.012*SR); a[-k:]*=np.linspace(1,0,k)
ghi(np.concatenate([a,sil(0.015),xt]),'praat/ra/xt_zhua.mp3')
c2=rd(json.load(open('ketqua/n13.json'))['kq']['地铁上人很挤，要小心小偷儿。']['tam'])
b=c2[:int(2.275*SR)].copy(); k=int(0.012*SR); b[-k:]*=np.linspace(1,0,k)
ghi(np.concatenate([b,sil(0.01),xt]),'praat/ra/xt_cau2.mp3')
subprocess.run(['ffmpeg','-v','error','-y','-i','praat/ra/xt_rieng.mp3','-i','praat/ra/xt_zhua.mp3','-i','praat/ra/xt_cau2.mp3','-filter_complex','[0][1][2]concat=n=3:v=0:a=1','-b:a','48k','nghe-thu-tieu-thau-ghep-3.mp3'],check=True)
print(round(len(xt)/SR,2))
