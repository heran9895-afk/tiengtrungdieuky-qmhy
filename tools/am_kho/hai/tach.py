import sys,re,subprocess,wave,numpy as np,sherpa_onnx,json
M='/home/claude/asr/sherpa-onnx-paraformer-zh-small-2024-03-09/'
luot=sys.argv[1]; pcm='pcm/%s.wav'%luot
with wave.open(pcm) as w: x=np.frombuffer(w.readframes(w.getnframes()),np.int16).astype(np.float32)/32768
SR=24000; dur=len(x)/SR
def sil(db,d):
    out=subprocess.run(['ffmpeg','-v','info','-i',pcm,'-af','silencedetect=n=%sdB:d=%s'%(db,d),'-f','null','-'],capture_output=True,text=True).stderr
    st=[float(v) for v in re.findall(r'silence_start: ([\d.]+)',out)]; en=[float(v) for v in re.findall(r'silence_end: ([\d.]+)',out)]
    return list(zip(st,en))
rec=sherpa_onnx.OfflineRecognizer.from_paraformer(paraformer=M+'model.int8.onnx',tokens=M+'tokens.txt',num_threads=4)
def nhan(a,b):
    s=rec.create_stream(); s.accept_waveform(SR,np.concatenate([np.zeros(1600,np.float32),x[int(a*SR):int(b*SR)],np.zeros(3200,np.float32)])); rec.decode_stream(s); return s.result.text
S=sil(-40,0.2); vung=[]; t=0
for a,b in S:
    if a-t>0.08: vung.append((t,a))
    t=b
for v in vung:
    tx=nhan(*v)
    if sys.argv[2] in tx:
        print('vung',v,tx)
        for a,b in sil(-32,0.06):
            if v[0]<a<v[1]: print('  cat %.3f-%.3f'%(a,b), nhan(v[0],(a+b)/2),'|',nhan((a+b)/2,v[1]))
