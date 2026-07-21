import re
def year(text):
    m=re.search(r"(20\d{2})",text);return int(m.group(1)) if m else None
def month(text):
    m=re.search(r"(1[0-2]|[1-9])\s*월",text);return int(m.group(1)) if m else None
def grade(text):
    m=re.search(r"고\s*([123])",text);return int(m.group(1)) if m else None
def attachment_role(name):
    n=name.lower()
    if "해설" in n:return "answer_and_explanation"
    if "정답" in n:return "answer"
    if "대본" in n:return "listening_script"
    if "문제" in n:return "question_booklet"
    return "unknown_attachment"
