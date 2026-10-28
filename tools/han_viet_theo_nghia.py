import json,re,glob,sys,unicodedata
sys.path.insert(0,'tools')
from da_am_seg import seg
TM='̣̀́̃̉'
def nv(s):
    d=unicodedata.normalize('NFD',s.upper()); t=[c for c in d if c in TM]
    return unicodedata.normalize('NFC',''.join(c for c in d if c not in TM)).replace('Y','I')+''.join(t)
# chữ: {pinyin (tone3, hoặc không số = mọi thanh): âm đúng (âm đầu là âm sẽ dùng khi sửa)}
R={
'好':{'hao3':['HẢO'],'hao4':['HIẾU']},'处':{'chu3':['XỬ'],'chu4':['XỨ']},
'重':{'zhong4':['TRỌNG'],'chong2':['TRÙNG']},'要':{'yao4':['YẾU'],'yao1':['YÊU']},
'调':{'diao4':['ĐIỆU'],'tiao2':['ĐIỀU']},'降':{'jiang4':['GIÁNG'],'xiang2':['HÀNG']},
'当':{'dang1':['ĐƯƠNG'],'dang4':['ĐÁNG']},'散':{'san3':['TẢN'],'san4':['TÁN']},
'舍':{'she3':['XẢ'],'she4':['XÁ']},'朝':{'chao2':['TRIỀU'],'zhao1':['TRIÊU']},
'应':{'ying1':['ƯNG'],'ying4':['ỨNG']},'假':{'jia3':['GIẢ'],'jia4':['GIÁ']},
'分':{'fen1':['PHÂN'],'fen4':['PHẬN','PHẦN']},'难':{'nan2':['NAN'],'nan4':['NẠN']},
'和':{'he2':['HÒA'],'he4':['HỌA'],'huo':['HÒA'],'hu2':['HÒA'],'he':['HÒA']},
'恶':{'e4':['ÁC'],'e3':['ÁC'],'wu4':['Ố']},'乐':{'le4':['LẠC'],'yue4':['NHẠC']},
'行':{'xing2':['HÀNH','HẠNH'],'hang2':['HÀNG']},'长':{'chang2':['TRƯỜNG'],'zhang3':['TRƯỞNG']},
'传':{'chuan2':['TRUYỀN'],'zhuan4':['TRUYỆN']},'少':{'shao3':['THIỂU'],'shao4':['THIẾU']},
'数':{'shu4':['SỐ'],'shu3':['SỔ'],'shuo4':['SÁC']},'种':{'zhong3':['CHỦNG'],'zhong4':['CHÚNG']},
'中':{'zhong1':['TRUNG'],'zhong4':['TRÚNG']},'为':{'wei2':['VI'],'wei4':['VỊ']},
'相':{'xiang1':['TƯƠNG'],'xiang4':['TƯỚNG']},'量':{'liang4':['LƯỢNG'],'liang2':['LƯƠNG'],'liang':['LƯỢNG']},
'将':{'jiang1':['TƯƠNG'],'jiang4':['TƯỚNG']},'号':{'hao4':['HIỆU'],'hao2':['HÀO']},
'度':{'du4':['ĐỘ'],'duo2':['ĐẠC']},'参':{'can1':['THAM'],'shen1':['SÂM'],'cen1':['SÂM']},
'宿':{'su4':['TÚC'],'xiu4':['TÚ'],'xiu3':['TÚC']},'曾':{'ceng2':['TẰNG'],'zeng1':['TĂNG']},
'藏':{'cang2':['TÀNG'],'zang4':['TẠNG']},'识':{'shi2':['THỨC'],'shi':['THỨC'],'zhi4':['CHÍ']},
'更':{'geng1':['CANH'],'geng4':['CÁNH']},'创':{'chuang4':['SÁNG'],'chuang1':['SANG']},
'强':{'qiang2':['CƯỜNG'],'qiang3':['CƯỠNG'],'jiang4':['CƯỜNG']},'兴':{'xing1':['HƯNG'],'xing4':['HỨNG']},
'会':{'hui4':['HỘI'],'kuai4':['CỐI'],'hui':['HỘI']},'称':{'cheng1':['XƯNG'],'chen4':['XỨNG'],'cheng4':['XỨNG']},
'占':{'zhan4':['CHIẾM'],'zhan1':['CHIÊM']},'奇':{'qi2':['KỲ','KÌ'],'ji1':['CƠ']},
'盛':{'sheng4':['THỊNH'],'cheng2':['THÌNH']},'铺':{'pu1':['PHÔ'],'pu4':['PHỐ']},
'只':{'zhi3':['CHỈ'],'zhi1':['CHÍCH']},'干':{'gan1':['CAN'],'gan4':['CÁN']},
'与':{'yu3':['DỮ'],'yu4':['DỰ'],'yu2':['DƯ']},'斗':{'dou4':['ĐẤU'],'dou3':['ĐẨU']},
'丑':{'chou3':['XÚ','SỬU']},'什':{'shen2':['THẬP'],'shi2':['THẬP']},'哪':{'na3':['NA'],'na':['NA'],'nei3':['NA']},
'够':{'gou4':['CÚ']},'做':{'zuo4':['TỐ']},'上':{'shang4':['THƯỢNG'],'shang3':['THƯỢNG'],'shang':['THƯỢNG']},
'倒':{'dao3':['ĐẢO'],'dao4':['ĐẢO','ĐÁO']},'吃':{'chi1':['KHIẾT','CẬT']},
}
# Từ Hán Việt đã thành từ tiếng Việt cùng nghĩa: giữ âm quen dùng
KEEP={'将军','当天','当晚','散步','调查','调动','调度','调研','测量','刁难'}
sua='--sua' in sys.argv; log=[]
def lam(w,f):
    han=w.get('Chữ Hán',''); hv=w.get('Âm Hán Việt') or ''
    if not re.fullmatch(r'[㐀-鿿]+',han): return
    toks=hv.split()
    if len(toks)!=len(han) or han in KEEP: return
    sg=seg(han,w['Pinyin'])
    if not sg: return
    ch=False
    for i,c in enumerate(han):
        if c not in R: continue
        core=toks[i].strip('()'); 
        if core=='_': continue
        p=sg[i]; ok=R[c].get(p) or R[c].get(re.sub(r'\d','',p))
        if not ok: log.append(('?',f,w['Mã'],han,w['Pinyin'],hv,c,p,'')); continue
        if nv(core) in {nv(x) for x in ok}: continue
        log.append(('SUA',f,w['Mã'],han,w['Pinyin'],hv,c,p,ok[0]))
        toks[i]=toks[i].replace(core,ok[0]); ch=True
    if ch and sua: w['Âm Hán Việt']=' '.join(toks)
for f in sorted(glob.glob('data/tu-vung/cap-*.json')):
    raw=open(f).read(); d=json.loads(raw)
    for w in d: lam(w,f)
    if sua: open(f,'w').write(json.dumps(d,ensure_ascii=False,separators=(',',':'))+('\n' if raw.endswith('\n') else ''))
for f in sorted(glob.glob('data/bai/*.json')+glob.glob('data/hsk2/*.json')):
    raw=open(f).read(); d=json.loads(raw)
    for w in d.get('tu',[]): lam(w,f)
    if sua: open(f,'w').write(json.dumps(d,ensure_ascii=False,indent=1)+('\n' if raw.endswith('\n') else ''))
for l in log: print(*l,sep='\t')
