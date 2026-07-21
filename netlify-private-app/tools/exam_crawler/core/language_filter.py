import re
def english_ratio(text:str)->float:
    chars=re.findall(r"[A-Za-z가-힣]",text); return round(sum(c.isascii() for c in chars)/max(1,len(chars)),4)
def is_quality_passage(text:str,min_length=80,min_ratio=.35)->bool:return len(text)>=min_length and english_ratio(text)>=min_ratio

