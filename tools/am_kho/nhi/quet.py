"""Quét mọi mục có 儿化 (儿 không đọc thành âm tiết riêng) trong dữ liệu web."""
import json,glob,re,collections,sys
R='/home/claude/tiengtrungdieuky-qmhy/'
B=json.load(open(R+'assets/am/ban-do.json'))
def chuan(s):
    s = re.sub(r'\s+', '', str(s or ''))
    s = re.sub(r'(^|[。！？])[A-Z一-鿿]{1,4}[：:]', r'\1', s)
    return re.sub(r'[—–\-“”"]', '', s).replace('！', '。')
V='aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ'
def nhihoa(han,py):
    if '儿' not in (han or ''): return False
    toks=re.findall(r"[a-zA-Z%s·]+"%V, (py or '').replace("'"," ").replace('’',' '))
    return any(re.search(r'[%sn]r$|ngr$'%V,t.lower()) and not re.fullmatch(r'[eēéěè]r',t.lower()) for t in toks)
out=[]
def add(f,ma,loai,han,py,doc):
    if not nhihoa(han,py): return
    out.append(dict(f=f[len(R):],ma=ma,loai=loai,han=han,py=py,doc=doc or '',coFile=chuan(han) in B))
for f in sorted(glob.glob(R+'data/**/*.json',recursive=True)):
    try: d=json.load(open(f))
    except Exception: continue
    rows=d if isinstance(d,list) else (d.get('tu') if isinstance(d,dict) else None)
    if not isinstance(rows,list): continue
    for w in rows:
        if not isinstance(w,dict): continue
        ma=w.get('Mã','')
        add(f,ma,'từ',w.get('Chữ Hán'),w.get('Pinyin'),w.get('Đọc từ'))
        for i in (1,2): add(f,ma,'câu%d'%i,w.get('Câu %d'%i),w.get('Pinyin câu %d'%i),w.get('Đọc câu %d'%i))
        for l in (w.get('Cụm từ') or '').split('\n'):
            p=[x.strip() for x in l.split('|')]
            if len(p)>1: add(f,ma,'cụm',p[0],p[1],'')
json.dump(out,open('/home/claude/am/nhi/ds.json','w'),ensure_ascii=False,indent=0)
c=collections.Counter((o['f'],o['loai'][:3]) for o in out)
for k,v in sorted(c.items()): print(k,v)
print('tổng',len(out),'văn bản khác nhau',len({chuan(o['han']) for o in out}),'đã có file Gemini đúng chữ',sum(o['coFile'] for o in out))
