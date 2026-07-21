import re
from urllib.parse import urljoin,urlsplit
from pathlib import Path
from bs4 import BeautifulSoup
from .base_adapter import BaseAdapter
from models.raw_document import Attachment
from core.metadata_extractor import year as infer_year,attachment_role
class KiceCsatArchiveAdapter(BaseAdapter):
    key="kice_csat_archive"
    def discover(self,year=None):
        found=[]
        for list_url in self.config.get("list_urls",[]):
            for page in range(1,int(self.config.get("max_pages",50))+1):
                url=list_url.format(page=page,year=year or "")
                try:r=self.client.get(url)
                except Exception as e:self.log.event("errors","KICE archive 목록 실패",url=url,error=str(e));break
                soup=BeautifulSoup(r.text,"html.parser");rows=soup.select("table tbody tr") or soup.select("tr")
                page_count=0
                for row in rows:
                    text=row.get_text(" ",strip=True);y=infer_year(text)
                    if "영어" not in text or (year and y!=year):continue
                    detail_anchor=row.select_one("a[href]");detail=urljoin(r.url,detail_anchor.get("href")) if detail_anchor else r.url
                    post_match=re.search(r"(?:post|board|cnt|seq|idx|id)[^=]*=(\d+)",detail,re.I);post_id=post_match.group(1) if post_match else ""
                    try:detail_response=self.client.get(detail);detail_soup=BeautifulSoup(detail_response.text,"html.parser")
                    except Exception:detail_soup=soup
                    attachments=[]
                    for a in detail_soup.select("a[href]"):
                        href=urljoin(detail,a.get("href"));name=" ".join(a.stripped_strings) or Path(urlsplit(href).path).name
                        if any(x in href.lower()+name.lower() for x in [".pdf",".hwp",".hwpx","filedownload"]):attachments.append(Attachment(file_url=href,file_name=name,file_type=Path(urlsplit(href).path).suffix.lstrip(".") or "unknown",attachment_role=attachment_role(name)))
                    item=self.make(r.url,detail_anchor.get_text(" ",strip=True) if detail_anchor else text[:100],attachments[0].file_url if attachments else None,year=y,source_category="official_exam_archive",source_sub_type="kice_csat_archive",detail_url=detail,post_id=post_id,collection_name="대학수학능력시험 기출문제",board_name="기출문제",registered_at=(re.search(r"20\d{2}[.-]\d{2}[.-]\d{2}",text).group(0) if re.search(r"20\d{2}[.-]\d{2}[.-]\d{2}",text) else None),copyright_notice_detected=True)
                    item.attachments=attachments;item.file_urls=[a.file_url for a in attachments];item.file_types=[a.file_type for a in attachments];item.post_id=post_id;item.collection_name="대학수학능력시험 기출문제";item.board_name="기출문제";found.append(item);page_count+=1
                if page_count==0:break
        return found
