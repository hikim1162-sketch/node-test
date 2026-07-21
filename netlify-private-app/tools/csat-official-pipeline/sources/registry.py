from __future__ import annotations

from .ebsi import EbsiAdapter
from .kice import KiceAdapter
from .sen import SenAdapter

ADAPTERS = {"kice": KiceAdapter, "sen": SenAdapter, "ebsi": EbsiAdapter}

