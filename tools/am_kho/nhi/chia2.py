import json,re
d=json.load(open('nhi/can.json'))
V='aeiouüāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ'
CHUNG=("Read as a warm, smiling Mandarin teacher for learners: slow, clear, standard Beijing Putonghua. Read every line exactly once, in order, with a clear pause after each line. Do not skip, repeat, or add anything.\n"
"ERHUA (most important): 儿 written after another character is NOT a separate syllable ér. Merge it into the previous syllable as a retroflex r-ending, curling the tongue at the end of that syllable, the Beijing way: 哪儿 nǎr, 这儿 zhèr, 那儿 nàr, 一点儿 yìdiǎnr, 有点儿 yǒudiǎnr, 玩儿 wánr, 一会儿 yíhuìr, 一块儿 yíkuàir, 面条儿 miàntiáor, 空儿 kòngr, 味儿 wèir, 画儿 huàr. Only 儿子 érzi, 女儿 nǚ'ér, 婴儿, 孤儿, 少儿, 儿童 keep a full ér syllable.\n"
"Tones: two third tones -> first becomes second; 一 is yí before 4th tone and yì before 1st/2nd/3rd tone; 不 is bú before 4th tone. 常常 is chángcháng (both full second tone, never neutral). 多 is first tone duō.\n")
def er_list(items):
    m={}
    for x in items:
        for t in re.findall(r"[a-zA-Z%s]+r\b"%V,x['py']):
            if not re.fullmatch(r'[eēéěè]r',t.lower()): m.setdefault(t.lower(),1)
    return ', '.join(sorted(m))
def chia(L,n):
    k=-(-len(L)//n); s=-(-len(L)//k); return [L[i:i+s] for i in range(0,len(L),s)]
out=[]
tu=d['tu']+[{'k':'常常','py':'chángcháng'},{'k':'常常来','py':'chángcháng lái'},{'k':'常常去','py':'chángcháng qù'}]
for i,b in enumerate(chia(tu,42),1):
    st=CHUNG+"Each line is one word or short phrase with falling statement intonation. Exact readings: "+'; '.join('%s %s'%(re.sub(r'（.*?）','',x['k']),x['py']) for x in b)
    out.append({'ten':'n%02d'%i,'typ':'tu','khoa':[x['k'] for x in b],'ds':[re.sub(r'（.*?）','',x['k']) for x in b],'style':st})
for j,b in enumerate(chia(d['cau'],44),len(out)+1):
    st=CHUNG+"Each line is one sentence with natural melody: statements fall, 吗-questions rise gently, stress the question word in 什么/哪儿/几/多少/谁/怎么 questions, short pause at commas. Erhua syllables in this list: "+er_list(b)
    out.append({'ten':'n%02d'%j,'typ':'cau','khoa':[x['k'] for x in b],'ds':[re.sub(r'（.*?）','',x['k']) for x in b],'style':st})
json.dump(out,open('nhi/luot.json','w'),ensure_ascii=False)
print([(b['ten'],b['typ'],len(b['ds']),len(b['style'])) for b in out])
