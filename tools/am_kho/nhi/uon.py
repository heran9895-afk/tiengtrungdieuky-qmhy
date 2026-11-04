"""Tạo âm tiết thiếu bằng cách uốn thanh điệu bản thu cùng vần (Praat PSOLA)."""
import json,re,sys,subprocess,numpy as np,parselmouth
from parselmouth.praat import call
R='/home/claude/tiengtrungdieuky-qmhy/assets/am/py/'
ds=json.load(open(R+'ds.json')); MAU=json.load(open('mau.json'))
UU={'1':['4','2','3'],'2':['3','1','4'],'3':['2','1','4'],'4':['1','2','3']}  # thanh nguồn ưu tiên
def lam(k,ra):
    seg,t=k[:-1],k[-1]
    nguon=next((seg+u for u in UU[t] if seg+u in ds),None)
    if not nguon: return None
    s=parselmouth.Sound(R+nguon+'.mp3').convert_to_mono()
    p=s.to_pitch(time_step=0.01,pitch_floor=120,pitch_ceiling=450)
    f=p.selected_array['frequency']; tt=p.xs(); v=np.where(f>0)[0]
    t0,t1=tt[v[0]],tt[v[-1]]
    man=call(s,'To Manipulation',0.01,120,450)
    tier=call('Create PitchTier','x',s.xmin,s.xmax)
    c=MAU[t]
    for i,hz in enumerate(c): call(tier,'Add point',t0+(t1-t0)*i/(len(c)-1),hz)
    call([tier,man],'Replace pitch tier')
    if t=='3':  # thanh 3 dài hơn một chút
        dt=call('Create DurationTier','d',s.xmin,s.xmax); call(dt,'Add point',t0,1.15); call(dt,'Add point',t1,1.15)
        call([dt,man],'Replace duration tier')
    o=call(man,'Get resynthesis (overlap-add)')
    o.save('/tmp/claude-0/_u.wav','WAV')
    subprocess.run(['ffmpeg','-v','error','-y','-i','/tmp/claude-0/_u.wav','-af','loudnorm=I=-16:TP=-1.5:LRA=11','-ac','1','-ar','24000','-b:a','48k',ra],check=True)
    return nguon
if __name__=='__main__':
    for k in sys.argv[1:]:
        print(k,'←',lam(k,'ra/%s.mp3'%k))
