import re
def chuan(s):
    s=re.sub(r'\s+','',str(s or ''))
    s=re.sub(r'(^|[。！？])[A-Z一-鿿]{1,4}[：:]',r'\1',s)
    return re.sub(r'[—–\-“”"]','',s).replace('！','。')
