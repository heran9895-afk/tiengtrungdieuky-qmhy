#!/usr/bin/env python3
"""Dựng data/hsk2/bai-7.json (HSK 2.0, 第七课：今天几号): noi_dung.py + ngu_phap.py + kho_cau.py (qua tools/dung_chung_h2.py).
  python3 tools/hsk2_bai7/dung.py kiem | ghi"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from dung_chung_h2 import chay
chay(7, __file__)
