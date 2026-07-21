import re
def split_sentences(text:str)->list[str]:
    protected=text
    for a,b in {"e.g.":"e§g§","i.e.":"i§e§","U.S.":"U§S§","Dr.":"Dr§","Mr.":"Mr§"}.items():protected=protected.replace(a,b)
    return [x.replace("§",".").strip() for x in re.split(r"(?<=[.!?])\s+(?=[A-Z\"'])",protected) if x.strip()]

