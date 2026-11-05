"""Uốn âm tiết cuối (头儿 tóur) thành thanh 1 (偷儿 tōur): đổi đường cao độ của đoạn hữu thanh cuối cùng thành ngang cao."""
import json,subprocess,sys,numpy as np,parselmouth
from parselmouth.praat import call
MAU=json.load(open('mau.json'))
def lam(src,ra):
    s=parselmouth.Sound(src).convert_to_mono()
    p=s.to_pitch(time_step=0.01,pitch_floor=120,pitch_ceiling=450)
    f=p.selected_array['frequency']; t=p.xs()
    v=f>0; runs=[];st=None
    for i,x in enumerate(v):
        if x and st is None: st=i
        if not x and st is not None:
            if i-st>8: runs.append((st,i))
            st=None
    if st is not None and len(v)-st>8: runs.append((st,len(v)))
    a,b=runs[-1]; t0,t1=t[a],t[b-1]
    man=call(s,'To Manipulation',0.01,120,450)
    tier=call(man,'Extract pitch tier')
    call(tier,'Remove points between',t0-0.005,t1+0.05)
    c=MAU['1']
    for i,hz in enumerate(c): call(tier,'Add point',t0+(t1-t0)*i/(len(c)-1),hz)
    call([tier,man],'Replace pitch tier')
    o=call(man,'Get resynthesis (overlap-add)'); o.save('/tmp/claude-0/_t.wav','WAV')
    subprocess.run(['ffmpeg','-v','error','-y','-i','/tmp/claude-0/_t.wav','-af','loudnorm=I=-16:TP=-1.5:LRA=11','-ac','1','-ar','24000','-b:a','48k',ra],check=True)
    p2=parselmouth.Sound(ra).to_pitch(time_step=0.01,pitch_floor=120,pitch_ceiling=450).selected_array['frequency']
    print(ra,len(runs),round(t0,2),round(t1,2),[int(x) for x in p2[p2>0][::5]])
d=json.load(open('../ketqua/r02.json'))['kq']
lam(d['小头儿|tam']['tam'],'ra/xiaotour.mp3')
lam(d['抓小头儿|tam']['tam'],'ra/zhuaxiaotour.mp3')
