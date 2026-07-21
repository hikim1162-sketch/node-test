import re
RULES=[("main_idea",r"주제"),("title",r"제목"),("gist",r"요지"),("blank",r"빈칸"),("order",r"순서"),("insertion",r"삽입"),("summary",r"요약"),("vocabulary",r"어휘"),("grammar",r"어법"),("matching",r"일치|불일치"),("long_reading",r"장문")]
def classify(text:str)->str:
    return next((name for name,pattern in RULES if re.search(pattern,text)),"unknown")

