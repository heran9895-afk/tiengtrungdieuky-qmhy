"""Nối thêm vế vào cuối câu chữ Hán (thay dấu cuối bằng '，' + vế): python3 duoi.py dot-x <<J {"79-0498:1": "一点也不像老人。"} J"""
import json, sys, os
p = os.path.join(os.path.dirname(__file__), sys.argv[1] + '.jsonl')
L = [json.loads(l) for l in open(p, encoding='utf-8') if l.strip()]
S = json.load(sys.stdin)
for e in L:
    for n in (1, 2):
        k = f"{e['m']}:{n}"
        if k in S:
            c = e['c'][n - 1]
            c[0] = c[0][:-1] + '，' + S[k]
            if c[3] and c[3] != '-' and len(c[3]) < len(c[0]) - 2:
                c[3] = c[3][:-1] + '，' + S[k]
open(p, 'w', encoding='utf-8').write(''.join(json.dumps(e, ensure_ascii=False) + '\n' for e in L))
