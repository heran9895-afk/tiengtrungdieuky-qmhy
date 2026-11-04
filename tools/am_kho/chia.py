import json,re
d=json.load(open('ds.json'))
def chia(L,n):
    k=-(-len(L)//n); s=-(-len(L)//k); return [L[i:i+s] for i in range(0,len(L),s)]
L=[]
for typ,n in (('tu',44),('cau',44)):
    for b in chia(d[typ],n): L.append({'typ':typ,'ds':[x['k'] for x in b]})
for i,b in enumerate(L,1):
    b['ten']='l%02d'%i
    open(b['ten']+'.txt','w').write('\n'.join(re.sub(r'([。？！，])\1+',r'\1',x)+' <long pause>' for x in b['ds']))
json.dump(L,open('luot.json','w'),ensure_ascii=False)
print([(b['ten'],b['typ'],len(b['ds'])) for b in L])
