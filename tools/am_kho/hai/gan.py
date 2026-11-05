"""Gắn file giọng vào dữ liệu web sau khi cắt xong. Chạy: python3 gan.py [--ghi]"""
import json,sys,hashlib,os,collections,re
from kiemke_util import chuan
R='/home/claude/tiengtrungdieuky-qmhy/'
BD=json.load(open(R+'assets/am/ban-do.json'))
ds=json.load(open('ds.json'))
def fp(x):
    k=chuan(x['han']); 
    if x['giong']=='nu1': return BD.get(k) or 'assets/am/cau/%s.mp3'%hashlib.md5(k.encode()).hexdigest()[:10]
    return 'assets/am/%s/%s.mp3'%(x['giong'],hashlib.md5(k.encode()).hexdigest()[:10])
thieu=[x for x in ds if not os.path.exists(R+fp(x))]
print('thiếu file:',len(thieu)); [print('  ',x['giong'],x['han']) for x in thieu[:30]]
if '--ghi' not in sys.argv or thieu: sys.exit()
files={}
def F(f):
    if f not in files: files[f]=json.load(open(f))
    return files[f]
nhom=collections.defaultdict(list)
bdmoi={}
for x in ds:
    n=x['noi']; d=F(n['f'])
    if n['loai']=='ht': d['hoiThoai'][n['i']]['luot'][n['k']]['doc']=fp(x)
    elif n['loai']=='nh': d['hoiThoai'][n['i']]['nhieu'][n['k']][n['j']]['doc']=fp(x)
    elif n['loai']=='hd':
        h=d['hoiDap'][n['i']]['hoi']
        while len(h)<4: h.append('')
        h[3]=fp(x)
    else: nhom[(n['f'],n['loai'],n.get('i'),n.get('c'),n.get('ma'),n['goc'])].append((n['k'],fp(x),n))
for (f,loai,i,c,ma,goc),lst in nhom.items():
    ds_=('|'.join(p for k,p,n in sorted(lst,key=lambda t:t[0])))
    d=F(f)
    if loai=='ab':
        if c=='cauLuyen': d['cauLuyen'][i]['doc']=ds_
        else: d['tu'][i]['Đọc '+c.lower()]=ds_
        bdmoi[chuan(goc)]=ds_
        bdmoi[chuan(goc.replace('\n',''))]=ds_
    elif loai=='ot': bdmoi[chuan(goc)]=ds_   # Ôn tập: giữ nguyên ô loa, phát qua bảng tra
for f,d in files.items():
    s=open(f).read()
    out=json.dumps(d,ensure_ascii=False,indent=1) if s.startswith('{\n') else json.dumps(d,ensure_ascii=False,separators=(',',':'))
    open(f,'w').write(out+('\n' if s.endswith('\n') else ''))
M=json.load(open(R+'assets/am/ban-do.json')); M.update(bdmoi); M={k:M[k] for k in sorted(M)}
json.dump(M,open(R+'assets/am/ban-do.json','w'),ensure_ascii=False,separators=(',',':'))
print('ghi bảng tra (hội thoại nhiều giọng):',len(bdmoi))
