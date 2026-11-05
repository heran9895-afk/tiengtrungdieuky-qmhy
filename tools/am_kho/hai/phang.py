import parselmouth,subprocess,sys,shutil
from parselmouth.praat import call
R='/home/claude/tiengtrungdieuky-qmhy/'
# (file, lo, hi, a, b, hz_dau, hz_cuoi)
J=[('assets/am/nu2/0479b80624.mp3',150,500,0.73,1.25,288,272),
   ('assets/am/nam2/05f4d89af2.mp3',70,300,1.11,1.57,176,168),
   ('assets/am/nam1/3512cc789f.mp3',70,300,2.86,3.34,236,244),
   ('assets/am/nu2/32dbb8349a.mp3',150,500,2.87,3.27,252,246)]
for f,lo,hi,a,b,h0,h1 in J:
    goc='ani/'+f.split('/')[-2]+'-'+f.split('/')[-1]
    import os
    if not os.path.exists(goc): shutil.copy(R+f,goc)
    s=parselmouth.Sound(goc).convert_to_mono()
    man=call(s,'To Manipulation',0.01,lo,hi)
    pt=call(man,'Extract pitch tier')
    call(pt,'Remove points between',a,b)
    n=12
    for i in range(n+1):
        t=a+(b-a)*i/n; call(pt,'Add point',t,h0+(h1-h0)*i/n)
    call([pt,man],'Replace pitch tier')
    o=call(man,'Get resynthesis (overlap-add)')
    o.save('ani/_o.wav','WAV')
    ra='ani/moi-'+goc.split('/')[-1]
    subprocess.run(['ffmpeg','-v','error','-y','-i','ani/_o.wav','-af','loudnorm=I=-16:TP=-1.5:LRA=11','-ac','1','-ar','24000','-b:a','48k',ra],check=True)
    print(ra)
