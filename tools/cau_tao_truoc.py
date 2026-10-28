#!/usr/bin/env python3
"""Dữ liệu "cấu tạo đã có ở từ trước" (quy chuẩn 11, bổ sung 28/10/2026).
- Thư viện: thêm `tuDau` vào data/tu-vung/cau-tao.json: {chữ: [mã, chữ Hán của từ, cấp]} = từ đầu tiên (theo thứ tự kho, chữ có ô Thuận bút) hiện cấu tạo chữ đó.
- Trang bài: thêm `ctTruoc` vào từng data/bai/bai-N.json, data/hsk2/bai-*.json: {chữ: {ma, han, bai, url}} cho chữ của bài mà cấu tạo đã hiện ở bài TRƯỚC (trong cùng bài thì tu-vung.js tự tìm).
Chạy lại mỗi khi thêm bài, sửa Thuận bút hoặc cau-tao.json."""
import json, re, glob, os
GOC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HAN = re.compile(r'[㐀-鿿]')
def doc(p): return json.load(open(os.path.join(GOC, p), encoding='utf-8'))
def ghi(p, d, gon=False):
    with open(os.path.join(GOC, p), 'w', encoding='utf-8') as f:
        if gon: json.dump(d, f, ensure_ascii=False, separators=(',', ':'))
        else: json.dump(d, f, ensure_ascii=False, indent=1); f.write('\n')

ct = doc('data/tu-vung/cau-tao.json')
tuDau = {}
for cap in ['1', '2', '3', '4', '5', '6', '7-9', 'MR']:
    for x in doc(f'data/tu-vung/cap-{cap}.json'):
        for c in HAN.findall(x.get('Thuận bút') or ''):
            if c in ct['chu'] and c not in tuDau:
                tuDau[c] = [x['Mã'], x['Chữ Hán'], cap]
ct['tuDau'] = tuDau
p_ct = 'data/tu-vung/cau-tao.json'
raw = open(os.path.join(GOC, p_ct), encoding='utf-8').read()
ghi(p_ct, ct, gon=not raw.lstrip().startswith('{\n'))
print('Thư viện: tuDau', len(tuDau))

def so(f): return [int(n) for n in re.findall(r'\d+', os.path.basename(f))]
for thu, trang in [('data/bai', 'chuong-trinh-hsk/hsk1'), ('data/hsk2', 'chuong-trinh-hsk-2/hsk1')]:
    files = sorted(glob.glob(os.path.join(GOC, thu, 'bai-*.json')), key=so)
    da = {}   # chữ -> thông tin từ đầu tiên hiện cấu tạo
    for f in files:
        d = json.load(open(f, encoding='utf-8'))
        slug = os.path.basename(f)[:-5]
        nhan = 'Bài ' + str(d.get('bai'))
        gh = {g['chu'] for g in d.get('ghepChu') or []}
        truoc = {}
        for x in d['tu']:
            for c in set(HAN.findall(x['Chữ Hán'])):
                if c in da and c not in (x.get('Thuận bút') or '') and da[c]['bai'] != nhan:
                    truoc[c] = da[c]
        moi = {}
        for x in d['tu']:
            for c in HAN.findall(x.get('Thuận bút') or ''):
                if (c in ct['chu'] or c in gh) and c not in da and c not in moi:
                    moi[c] = {'ma': x['Mã'], 'han': x['Chữ Hán'], 'bai': nhan, 'url': f'{trang}/{slug}/tu-vung.html'}
        da.update(moi)
        raw = open(f, encoding='utf-8').read()
        if truoc: d['ctTruoc'] = truoc
        else: d.pop('ctTruoc', None)
        with open(f, 'w', encoding='utf-8') as fh:
            if raw.lstrip().startswith('{\n'): json.dump(d, fh, ensure_ascii=False, indent=1)
            else: json.dump(d, fh, ensure_ascii=False, separators=(',', ':'))
        print(os.path.relpath(f, GOC), 'ctTruoc', len(truoc))
