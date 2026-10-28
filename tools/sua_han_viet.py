"""Sửa âm Hán Việt theo bảng (chữ, âm cũ) -> âm mới, và thống nhất cách bỏ dấu
HÓA · THỦY · KHÓA cho mọi từ trong kho + dữ liệu bài.  python3 tools/sua_han_viet.py [--thu]"""
import json,re,sys,glob,unicodedata
SUA={  # (chữ, âm sai) : âm đúng — đối chiếu Hán Việt tự điển Thiều Chửu
('冷','LẠNH'):'LÃNH',('丝','TƠ'):'TI',('读','ĐỌC'):'ĐỘC',('幕','MÀN'):'MẠC',('油','DẦU'):'DU',
('割','CẮT'):'CÁT',('箱','RƯƠNG'):'TƯƠNG',('狭','HẸP'):'HIỆP',('爬','BÀ'):'BA',('爬','BÒ'):'BA',
('哭','KHÓC'):'KHỐC',('炉','LÒ'):'LÔ',('桶','THÙNG'):'DŨNG',('捧','BƯNG'):'PHỦNG',
('喝','HÚP'):'HÁT',('喝','HÉT'):'HÁT',('慰','ỦI'):'UÝ',('慰','UỶ'):'UÝ',('煎','CHIÊN'):'TIÊN',
('橘','QUÝT'):'QUẤT',('卷','CUỘN'):'QUYỂN',('扛','KHIÊNG'):'GIANG',('喷','PHUN'):'PHÚN',
('赎','CHUỘC'):'THỤC',('缚','BUỘC'):'PHƯỢC',('跌','TRƯỢT'):'ĐIỆT',('椰','DỪA'):'GIA',
('饵','NHỬ'):'NHỊ',('蘸','CHẤM'):'TRÁM',('笨','ĐẦN'):'BỔN',('号','GÀO'):'HIỆU',('摸','MÒ'):'MÔ',
('框','KHUNG'):'KHUÔNG',('笼','LỒNG'):'LUNG',('粪','PHÂN'):'PHẨN',('腔','KHOANG'):'XOANG',
('叨','ĐAO'):'THAO',('炸','TRÁC'):'TẠC',('幸','HÃNH'):'HẠNH',('喊','HÁM'):'HẢM',('胖','BÀNG'):'BÀN',
('氛','PHẬN'):'PHÂN',('挖','OA'):'OẠT',('供','CÚNG'):'CUNG',('歹','TỒI'):'ĐÃI',('禁','CẦM'):'CẤM',
('帖','THIỆP'):'THIẾP',('刹','SA'):'SÁT',('奥','ẢO'):'ÁO',('具','CÂU'):'CỤ',('从','TÙNG'):'TÒNG',
('摆','BÀI'):'BÃI',('旋','HOÀN'):'TOÀN',('晃','HOÀNG'):'HOẢNG',('撑','SANH'):'XANH',('傻','SỌA'):'XOẠ',
}
T={'̀','́','̃','̉','̣'}
def kieu_dau(s):
    """Nhiên chốt 28/10/2026: bỏ dấu kiểu HÓA · THỦY · KHÓA (dấu trên nguyên âm đầu của
    vần oa/oe/uy không có phụ âm cuối). hoá->hóa, thuỷ->thủy, khoả->khỏa. Không đụng QUY, GIA."""
    d=unicodedata.normalize('NFD',s); tone=[c for c in d if c in T]
    if len(tone)!=1: return s
    base=unicodedata.normalize('NFC',''.join(c for c in d if c not in T))
    if base.startswith(('QU','GI')): return s
    m=re.match(r'^(.*?)(OA|OE|UY)$',base)
    if not m: return s
    return m.group(1)+unicodedata.normalize('NFC',m.group(2)[0]+tone[0])+m.group(2)[1]
HAN=re.compile(r'[㐀-鿿]')
def sua(w,log,f):
    hv=w.get('Âm Hán Việt'); 
    if not hv: return
    cs=HAN.findall(w['Chữ Hán']); toks=hv.split(' ')
    if len(cs)!=len(toks): cs=['']*len(toks)
    out=[]
    for c,t in zip(cs,toks):
        core=t.strip('()（）'); n=kieu_dau(SUA.get((c,core),core))
        out.append(t.replace(core,n) if core else t)
    new=' '.join(out)
    if new!=hv: log.append((f,w.get('Mã'),w['Chữ Hán'],hv,new)); w['Âm Hán Việt']=new
thu='--thu' in sys.argv; log=[]
for f in sorted(glob.glob('data/tu-vung/cap-*.json')):
    raw=open(f).read(); d=json.loads(raw)
    for w in d: sua(w,log,f)
    if not thu: open(f,'w').write(json.dumps(d,ensure_ascii=False,separators=(',',':'))+('\n' if raw.endswith('\n') else ''))
for f in sorted(glob.glob('data/bai/*.json')+glob.glob('data/hsk2/*.json')):
    raw=open(f).read(); d=json.loads(raw)
    for w in d.get('tu',[]): sua(w,log,f)
    if not thu: open(f,'w').write(json.dumps(d,ensure_ascii=False,indent=1)+('\n' if raw.endswith('\n') else ''))
for l in log: print(*l,sep='\t')
print(len(log),'mục')
