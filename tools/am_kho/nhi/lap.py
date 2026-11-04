import json,re,collections
from pypinyin import lazy_pinyin
R='/home/claude/tiengtrungdieuky-qmhy/'
B=json.load(open(R+'assets/am/ban-do.json'))
def chuan(s):
    s = re.sub(r'\s+', '', str(s or ''))
    s = re.sub(r'(^|[。！？])[A-Z一-鿿]{1,4}[：:]', r'\1', s)
    return re.sub(r'[—–\-“”"]', '', s).replace('！', '。')
V='aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ'
ds=json.load(open('nhi/ds.json'))
tu,cau,seen,nhiPy=[],[],set(),{}
for o in ds:
    k=re.sub(r'([。？！，])\1+',r'\1',chuan(o['han']))
    # ghi cặp chữ+儿 → pinyin r
    toks=re.findall(r"[a-zA-Z%s]+r\b"%V,o['py'])
    for t in toks:
        if re.fullmatch(r'[eēéěè]r',t.lower()): continue
    if k in seen or k in B: continue
    seen.add(k); (tu if o['loai'] in ('từ','cụm') else cau).append({'k':k,'py':o['py']})
# bắt cặp "X儿" ↔ "...r" để đưa vào Style
for o in ds:
    for m in re.finditer(r'([一-鿿]{1,2})儿',o['han']): pass
print(len(tu),len(cau))
json.dump({'tu':tu,'cau':cau},open('nhi/can.json','w'),ensure_ascii=False,indent=0)
