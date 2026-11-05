import json,re,collections,hashlib
from kiemke_util import chuan
ds=json.load(open('ds.json'))
VAI={'nam1':'a warm, friendly young man','nam2':'a clear, friendly young man (a university student)',
 'nam3':'a calm, mature man in his thirties','nu1':'a warm, slightly smiling female Mandarin teacher',
 'nu2':'a cheerful young woman (a university student)','nu3':'a warm, mature woman in her thirties','nu4':'a calm, gentle young woman'}
TEN='Names: 李文 Lǐ Wén, 陈天中 Chén Tiānzhōng, 天中 Tiānzhōng, 安妮 Ānní, 白家月 Bái Jiāyuè, 王一飞 Wáng Yīfēi, 一飞 Yīfēi, 王一雪 Wáng Yīxuě, 刘明 Liú Míng, 杨同乐 Yáng Tónglè, 同乐 Tónglè, 小语 Xiǎoyǔ, 李月 Lǐ Yuè, 小明 Xiǎomíng, 大卫 Dàwèi, 阮何然 Ruǎn Hérán (阮 is Ruǎn).'
by=collections.defaultdict(dict)
for x in ds:
    if x['co']: continue
    k=chuan(x['han'])
    by[x['giong']].setdefault(k,(x['han'].strip(),x['py']))
luot=[]
for g,d in by.items():
    items=list(d.items()); n=(len(items)+39)//40; per=(len(items)+n-1)//n
    for b in range(n):
        part=items[b*per:(b+1)*per]; ten='h-%s-%d'%(g,b+1)
        lines=[v[0] for k,v in part]
        st=('Read as %s speaking to Mandarin beginner learners: slow, clear, standard Putonghua (Beijing), natural conversational sentence melody. '
            'Each line is one sentence of a dialogue; read every line exactly once, in order, with a clear pause after each line. Read ONLY the given text: do not add, skip, or repeat any words or sentences.\n'
            'Intonation: statements fall at the end; questions ending in 吗 rise gently; A不A questions rise gently; in questions with 什么, 哪, 几, 多少, 谁, 多大 put light stress on that question word. Short natural pause at commas.\n'
            'Tone sandhi: two third tones -> first becomes second; 一 is yí before 4th tone, yì before 1st/2nd/3rd tone; 不 is bú before 4th tone (不客气 bú kèqi, 不是 bú shì, 不大 bú dà). 多 is FIRST tone duō, never duó.\n'
            '%s\nUse exactly this pinyin for each line:\n%s') % (VAI[g], TEN, '\n'.join('%s = %s'%(v[0],v[1]) for k,v in part))
        luot.append({'ten':ten,'giong':g,'ds':lines,'typ':'cau','thu':'cau' if g=='nu1' else g,'style':st})
json.dump(luot,open('luot.json','w'),ensure_ascii=False,indent=1)
for l in luot: print(l['ten'],len(l['ds']),len(l['style']))
