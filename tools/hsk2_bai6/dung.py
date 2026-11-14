#!/usr/bin/env python3
"""Dựng data/hsk2/bai-6.json (HSK 2.0, 第六课：我会说汉语): noi_dung.py + ngu_phap.py + kho_cau.py (qua tools/dung_chung_h2.py).
  python3 tools/hsk2_bai6/dung.py kiem | ghi"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from dung_chung_h2 import chay
chay(6, __file__)
