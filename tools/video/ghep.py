"""Ghép khung hình + tiếng đọc thành mp4.  python3 tools/video/ghep.py <thư mục ra của quay.js> <file.mp4>  (chạy tại gốc kho)"""
import json,subprocess,sys,os
d=sys.argv[1]; out=sys.argv[2]
m=json.load(open(f'{d}/meta.json'))
fr=m['frames']; T0=fr[0]['t']; end=m['tEnd']
with open(f'{d}/list.txt','w') as f:
    for i,x in enumerate(fr):
        nxt = fr[i+1]['t'] if i+1<len(fr) else end
        f.write(f"file '{os.path.abspath(x['fn'])}'\nduration {max(nxt-x['t'],1)/1000:.4f}\n")
    f.write(f"file '{os.path.abspath(fr[-1]['fn'])}'\n")
ins=[];flt=[]
for k,a in enumerate(m['log']):
    path=a['src'].split('localhost:8765/')[1]
    dl=int(a['t']-T0)
    ins+=['-i',path]; flt.append(f"[{k+1}:a]aresample=48000,aformat=channel_layouts=stereo,adelay={dl}|{dl}[a{k}]")
    print(path, dl)
n=len(m['log'])
fc=';'.join(flt)+';'+''.join(f'[a{k}]' for k in range(n))+f"amix=inputs={n}:normalize=0,apad[aout]"
dur=(end-T0)/1000
cmd=['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i',f'{d}/list.txt']+ins+['-filter_complex',fc,
 '-map','0:v','-map','[aout]','-vf','fps=30,scale=1080:1920:flags=lanczos,format=yuv420p','-c:v','libx264','-preset','veryfast','-crf','18',
 '-c:a','aac','-b:a','160k','-t',f'{dur:.2f}','-movflags','+faststart',out]
subprocess.run(cmd,check=True); print('dur',dur)
