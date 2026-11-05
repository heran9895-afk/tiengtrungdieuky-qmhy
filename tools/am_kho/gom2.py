import json,re,sys
R='/home/claude/tiengtrungdieuky-qmhy/'
cap,a,b=sys.argv[1],int(sys.argv[2]),int(sys.argv[3])
d=json.load(open(R+'data/tu-vung/cap-%s.json'%cap))
B=json.load(open(R+'assets/am/ban-do.json'))
def chuan(s):
    s = re.sub(r'\s+', '', str(s or ''))
    s = re.sub(r'(^|[。！？])[A-Z一-鿿]{1,4}[：:]', r'\1', s)
    return re.sub(r'[—–\-“”"]', '', s).replace('！', '。')
tu=[];cau=[];seen=set();bo=[]
def pick(doc,hien):
    if '儿' in (hien or '') and doc!='-': return hien
    return doc or hien
def add(L,t,src):
    if not t or t=='-' or str(t).startswith('assets/'): bo.append((src,t)); return
    k=chuan(t)
    if not k or k in B or k in seen: return
    seen.add(k); L.append({'k':k,'src':src})
for w in d[a:b]:
    add(tu,pick(w.get('Đọc từ'),w['Chữ Hán']),w['Mã']+' từ')
    for l in (w.get('Cụm từ') or '').split('\n'):
        h=l.split('|')[0].strip()
        if h: add(tu,h,w['Mã']+' cụm')
for w in d[a:b]:
    for i in (1,2):
        c=pick(w.get('Đọc câu %d'%i),w.get('Câu %d'%i))
        if w.get('Câu %d'%i): add(cau,c,w['Mã']+' câu%d'%i)
json.dump({'tu':tu,'cau':cau},open('ds.json','w'),ensure_ascii=False,indent=0)
print(len(tu),len(cau),'bo:',bo)
