"""Kiểm kê lời hội thoại cần thu theo giọng. Ra: hai/ds.json"""
import json,glob,re,sys
sys.path.insert(0,'/home/claude/am')
R='/home/claude/tiengtrungdieuky-qmhy/'
BD=json.load(open(R+'assets/am/ban-do.json'))
def chuan(s):
    s=re.sub(r'\s+','',str(s or ''))
    s=re.sub(r'(^|[。！？])[A-Z一-鿿]{1,4}[：:]',r'\1',s)
    return re.sub(r'[—–\-“”"]','',s).replace('！','。')
N1,N2,N3,N4,F1,F2,F3,F4='nam1','nam2','nam3','nam4','nu1','nu2','nu3','nu4'
HT={  # giọng từng lượt; không có thì A/B xen kẽ nam1/nu1
 ('bai-1','Bài khóa · Chào cô Vương'):[F1,F4],
 ('bai-1','Bài khóa · Chào cả lớp'):[F1,N1,F1,N1],
 ('bai-1','Bài khóa · Cảm ơn và tạm biệt'):[N1,F1,F1,N1],
 ('bai-2','Làm quen'):[N1,F2,N1,F2],
 ('bai-2','Vào lớp'):[N2,F1,N2,F1],
 ('bai-2','Bài khóa · Hỏi tên'):[F1,N2],
 ('bai-2','Bài khóa · Nhầm tên'):[N2,F2,N2,F2],
 ('bai-2','Bài khóa · Làm quen'):[N1,F2,N1,F2],
 ('bai-3','Gọi điện'):[F3,N1,F3,N1],
 ('bai-3','Bài khóa · Bạn gái của Thiên Trung'):[N1,N2,N1,N2],
 ('bai-3','Bài khóa · Gọi điện cho em gái'):[F3,F1,F3,F1,F3,F1],
 ('bai-4','Bài khóa · Nhất Phi có bận không'):[N3,F3,N3,F3],
 ('bai-4','Bài khóa · Gia đình Đồng Lạc'):[F3,N3,F3,N3],
 ('bai-4','Bài khóa · Con của chị Nhất Tuyết'):[N3,F3,N3,F3,N3,F3],
 ('bai-5','Bài khóa · Hôm nay ngày mấy'):[N3,F3,N3,F3],
 ('bai-5','Bài khóa · Đồng Lạc biết nấu ăn'):[F3,N3,F3,N3],
 ('bai-5','Bài khóa · Máy tính mới'):[F3,N3,F3,N3],
 ('h2-bai-1-2','Chào hỏi'):[N1,F1,N1,F1],
 ('h2-bai-3','Làm quen'):[N2,F2,N2,F2],
 ('h2-bai-3','Hỏi họ'):[N1,F4,N1,F4],
 ('h2-bai-4','Đây là ai?'):[N1,F1,N1,F2,N1],
}
TEN={'安妮':F2,'陈天中':N2,'刘明':N3,'王一雪':F3,'白家月':F2,'杨同乐':N3,'李文':N1}
ds=[]  # {giong, han, noi: mô tả chỗ dùng}
def them(g,han,noi,py=''): ds.append({'giong':g,'han':han,'noi':noi,'py':py})
for f in sorted(glob.glob(R+'data/bai/bai-*.json')+glob.glob(R+'data/hsk2/bai-*.json')):
    b=('h2-' if '/hsk2/' in f else '')+f.split('/')[-1][:-5]
    d=json.load(open(f))
    for i,h in enumerate(d.get('hoiThoai',[])):
        gs=HT.get((b,h['ten'])) or [N1 if k%2==0 else F1 for k in range(len(h['luot']))]
        assert len(gs)==len(h['luot']),(b,h['ten'])
        for k,(l,g) in enumerate(zip(h['luot'],gs)): them(g,l['han'],{'f':f,'loai':'ht','i':i,'k':k},l.get('py',''))
    for i,q in enumerate(d.get('hoiDap',[])): them(N1,q['hoi'][0],{'f':f,'loai':'hd','i':i},q['hoi'][1])
    def ab(s,noi,py):
        pys=py.split('\n')
        for k,ln in enumerate(s.split('\n')):
            m=re.match(r'([AB])：(.*)',ln); assert m,(s,)
            p=re.sub(r'^[AB][:：]\s*','',pys[k]) if k<len(pys) else ''
            them(N1 if m.group(1)=='A' else F1, m.group(2), dict(noi,k=k),p)
    for i,t in enumerate(d.get('tu',[])):
        for c in ('Câu 1','Câu 2'):
            if re.search(r'^[AB]：',t.get(c) or ''): ab(t[c],{'f':f,'loai':'ab','i':i,'c':c,'goc':t[c],'doc':t.get('Đọc '+c.lower(),'')},t.get('Pinyin '+c.lower(),''))
    for i,c in enumerate(d.get('cauLuyen',[])):
        if re.search(r'^[AB]：',c.get('han','')): ab(c['han'],{'f':f,'loai':'ab','i':i,'c':'cauLuyen','goc':c['han'],'doc':c.get('doc','')},c.get('py',''))
# Ôn tập: câu có tên
f=R+'data/bai/on-tap-1-5.json'; s=json.load(open(f))
def walk(o):
    if isinstance(o,dict):
        if isinstance(o.get('loa'),str) and o.get('hienSau') and any(x.get('ai') for x in o['hienSau']):
            for k,x in enumerate(o['hienSau']): them(TEN[x['ai']],x['han'],{'f':f,'loai':'ot','ma':o['ma'],'k':k,'goc':o['loa']},x.get('py',''))
        for v in o.values(): walk(v)
    elif isinstance(o,list):
        for v in o: walk(v)
walk(s)
for x in ds: x['co']= x['giong']=='nu1' and chuan(x['han']) in BD
json.dump(ds,open('/home/claude/am/hai/ds.json','w'),ensure_ascii=False,indent=0)
import collections
c=collections.Counter((x['giong'],x['co']) for x in ds); print(sorted(c.items()))
can=collections.defaultdict(set)
for x in ds:
    if not x['co']: can[x['giong']].add(chuan(x['han']))
print({g:len(v) for g,v in can.items()})
# Theo nội dung (luật A/B: nội dung rõ giới tính thì theo nội dung)
SUA={('A：同乐，下班吗？\nB：下班。',0):F3, ('A：同乐，下班吗？\nB：下班。',1):N3,
     ('A：你叫什么名字？\nB：我叫李月。',1):F2, ('A：你叫什么？\nB：我叫小明。',1):N2,
     ('A：您贵姓？\nB：我姓阮。',1):F4, ('A：老师，您贵姓？\nB：我姓阮，叫阮何然。',1):F4,
     ('A：李文，对不起你。\nB：没事。',0):N2, ('A：李文，对不起你。\nB：没事。',1):N1}
dung=set()
for x in ds:
    n=x['noi']
    if n['loai']=='ab' and (n['goc'],n['k']) in SUA:
        x['giong']=SUA[(n['goc'],n['k'])]; dung.add((n['goc'],n['k']))
assert dung==set(SUA),set(SUA)-dung
for x in ds: x['co']= x['giong']=='nu1' and chuan(x['han']) in BD
json.dump(ds,open('/home/claude/am/hai/ds.json','w'),ensure_ascii=False,indent=0)
can=collections.defaultdict(set)
for x in ds:
    if not x['co']: can[x['giong']].add(chuan(x['han']))
print('sau sua',{g:len(v) for g,v in can.items()}, sum(len(v) for v in can.values()))
# Câu nhiễu của Hỏi – đáp lấy từ hội thoại: cùng giọng với lượt đáp (không để lộ đáp án qua giọng)
gv={(x['noi']['f'],x['noi']['i'],x['noi']['k']):x['giong'] for x in ds if x['noi']['loai']=='ht'}
for f in sorted(set(k[0] for k in gv)):
    d=json.load(open(f))
    for i,h in enumerate(d.get('hoiThoai',[])):
        for k,lst in (h.get('nhieu') or {}).items():
            v=gv[(f,i,int(k))]
            for j,x in enumerate(lst): them(v,x['han'],{'f':f,'loai':'nh','i':i,'k':k,'j':j},x.get('py',''))
for x in ds: x['co']= x['giong']=='nu1' and chuan(x['han']) in BD
json.dump(ds,open('/home/claude/am/hai/ds.json','w'),ensure_ascii=False,indent=0)
