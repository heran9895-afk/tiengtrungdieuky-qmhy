#!/usr/bin/env python3
"""Dựng data/bai/bai-7.json: noi_dung.py + ngu_phap.py + kho_cau.py (qua tools/dung_chung.py).
  python3 tools/bai7/dung.py kiem | ghi"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
from dung_chung import chay
chay(7, __file__)
