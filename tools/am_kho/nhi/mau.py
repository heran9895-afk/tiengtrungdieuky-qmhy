"""Đo đường thanh điệu trung bình (Hz) của giọng Sulafat theo 4 thanh, 20 điểm trên phần hữu thanh."""
import json,glob,os,re,numpy as np,parselmouth
R='/home/claude/tiengtrungdieuky-qmhy/assets/am/py/'
ds=json.load(open(R+'ds.json'))
M={t:[] for t in '1234'}
for k in ds:
    t=k[-1]
    if t not in M or len(M[t])>=120: continue
    s=parselmouth.Sound(R+k+'.mp3'); p=s.to_pitch(time_step=0.01,pitch_floor=120,pitch_ceiling=450)
    f=p.selected_array['frequency']; v=np.where(f>0)[0]
    if len(v)<8: continue
    f=f[v[0]:v[-1]+1]; idx=np.where(f>0)[0]
    f=np.interp(np.arange(len(f)),idx,f[idx])
    M[t].append(np.interp(np.linspace(0,len(f)-1,20),np.arange(len(f)),f))
out={t:np.median(np.array(v),axis=0).round(1).tolist() for t,v in M.items()}
json.dump(out,open('mau.json','w'))
for t,v in out.items(): print(t,len(M[t]),[int(x) for x in v[::3]])
