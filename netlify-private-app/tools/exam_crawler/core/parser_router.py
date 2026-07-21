from pathlib import Path
from pypdf import PdfReader
from bs4 import BeautifulSoup
from models.parsed_item import ParsedItem
from core.text_utils import clean_text
def parse_document(raw,path=None):
    if not path:return ParsedItem(raw_id=raw.id,source_name=raw.source_name,title=raw.title,year=raw.year,exam_name=raw.exam_name,parse_status="metadata_only",parse_confidence=1)
    path=Path(path);warnings=[];pages=[]
    try:
        if path.suffix.lower()==".pdf":
            reader=PdfReader(str(path));pages=[p.extract_text() or "" for p in reader.pages];text="\n\n".join(pages);parser="pdf"
        elif path.suffix.lower() in {".html",".htm"}:
            soup=BeautifulSoup(path.read_text(encoding="utf-8",errors="ignore"),"html.parser")
            for n in soup.select("script,style,nav,header,footer,form"):n.decompose()
            text=soup.get_text("\n",strip=True);parser="html"
        else:text="";parser="unsupported";warnings.append("HWP는 메타데이터 fallback, HWPX 확장 가능")
        text=clean_text(text)
        return ParsedItem(raw_id=raw.id,source_name=raw.source_name,title=raw.title,year=raw.year,exam_name=raw.exam_name,file_type=raw.file_type,local_path=str(path),page_count=len(pages),raw_text=text,internal_extracted_text=text,parse_status="success" if text else "metadata_only",parse_confidence=.8 if text else 0,parse_warnings=warnings)
    except Exception as e:return ParsedItem(raw_id=raw.id,source_name=raw.source_name,title=raw.title,year=raw.year,exam_name=raw.exam_name,parse_status="failed",parse_warnings=[str(e)])
