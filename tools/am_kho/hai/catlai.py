# catlai.py luot "câu" a b : cắt lại một câu từ a đến b giây (đè file tạm trong ra/)
import sys,subprocess,hashlib,json,re
sys.path.insert(0,'hai'); from kiemke_util import chuan
luot,cau,a,b=sys.argv[1],sys.argv[2],float(sys.argv[3]),float(sys.argv[4])
pcm='pcm/%s.wav'%luot; d=b-a
f='ra/%s/%s.mp3'%(luot,hashlib.md5(chuan(cau).encode()).hexdigest()[:10])
subprocess.run(['ffmpeg','-v','error','-y','-ss','%.3f'%a,'-t','%.3f'%d,'-i',pcm,'-af','afade=t=in:d=0.04,afade=t=out:st=%.3f:d=0.08,apad=pad_dur=0.3,loudnorm=I=-16:TP=-1.5:LRA=11'%max(0,d-0.08),'-ar','24000','pcm/_c.wav'],check=True)
subprocess.run(['ffmpeg','-v','error','-y','-i','pcm/_c.wav','-af','atrim=end=%.3f'%(d+0.05),'-ac','1','-ar','24000','-b:a','48k',f],check=True)
k=json.load(open('ketqua/%s.json'%luot)); k['kq'][chuan(cau)]['r']=1.0; json.dump(k,open('ketqua/%s.json'%luot,'w'),ensure_ascii=False,indent=1)
print('ok',f)
