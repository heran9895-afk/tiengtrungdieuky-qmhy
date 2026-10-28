"""Vá nhanh một đợt: python3 tools/kho79/sua.py dot-x <<'J' {json} J
JSON: {"79-0311": {"1": ["câu","pinyin","nghĩa","đọc"] | {"v": "nghĩa", "d": "đọc"}, "cum": [...], ...}}"""
import json, sys, os
p = os.path.join(os.path.dirname(__file__), sys.argv[1] + '.jsonl')
L = [json.loads(l) for l in open(p, encoding='utf-8') if l.strip()]
S = json.load(sys.stdin)
for e in L:
    for k, v in S.get(e['m'], {}).items():
        if k in ('1', '2'):
            c = e['c'][int(k) - 1]
            if isinstance(v, list):
                e['c'][int(k) - 1] = (v + ['', '', '', ''])[:4]
            else:
                if 'v' in v: c[2] = v['v']
                if 'd' in v: c[3] = v['d']
        else:
            e[k] = v
open(p, 'w', encoding='utf-8').write(''.join(json.dumps(e, ensure_ascii=False) + '\n' for e in L))
