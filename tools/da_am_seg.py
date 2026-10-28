import re,unicodedata
from pypinyin import pinyin,Style
TM='̣̀́̃̉'
def nv(s):
    d=unicodedata.normalize('NFD',s.upper()); t=[c for c in d if c in TM]
    return unicodedata.normalize('NFC',''.join(c for c in d if c not in TM)).replace('Y','I')+''.join(t)
def p3(s):  # diacritic syllable -> tone3 like hao3
    return pinyin(s,style=Style.TONE3,heteronym=False)[0][0]
PYT={'ā':'a1','á':'a2','ǎ':'a3','à':'a4','ē':'e1','é':'e2','ě':'e3','è':'e4','ī':'i1','í':'i2','ǐ':'i3','ì':'i4','ō':'o1','ó':'o2','ǒ':'o3','ò':'o4','ū':'u1','ú':'u2','ǔ':'u3','ù':'u4','ǖ':'v1','ǘ':'v2','ǚ':'v3','ǜ':'v4','ü':'v'}
def to3(sy):
    t='';o=''
    for ch in sy:
        if ch in PYT: v=PYT[ch]; o+=v[0]; t=v[1:] or t
        else: o+=ch
    return o+t
def seg(word,py):
    s=re.sub(r"[\s·∥'\-]",'',py.lower())
    out=[]
    for c in word:
        cands=set(x.lower() for x in pinyin(c,style=Style.TONE,heteronym=True)[0])
        best=None
        for cd in sorted(cands,key=len,reverse=True):
            if s.startswith(cd): best=cd;break
        if best is None:
            # neutral tone
            for cd in sorted(cands,key=len,reverse=True):
                plain=''.join(unicodedata.normalize('NFD',x)[0] for x in cd)
                if s.startswith(plain): best=plain;break
        if best is None: return None
        out.append(to3(best)); s=s[len(best):]
    return out
