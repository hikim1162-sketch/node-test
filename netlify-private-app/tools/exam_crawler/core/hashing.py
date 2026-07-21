import hashlib,re
def sha256_bytes(v:bytes)->str:return hashlib.sha256(v).hexdigest()
def text_hash(v:str)->str:return hashlib.sha256(re.sub(r"\s+"," ",v).strip().lower().encode()).hexdigest()
def stable_id(*v)->str:return hashlib.sha256("|".join(map(str,v)).encode()).hexdigest()[:20]

