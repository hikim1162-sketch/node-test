import re,unicodedata
def clean_text(text:str)->str:
    text=unicodedata.normalize("NFKC",text.replace("\x00"," "))
    return "\n".join(v for line in text.splitlines() if (v:=re.sub(r"\s+"," ",line).strip()) and not re.fullmatch(r"\d+",v))

