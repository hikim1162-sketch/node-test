from urllib.parse import urljoin
from bs4 import BeautifulSoup
from .base_adapter import BaseAdapter
from core.metadata_extractor import year as infer_year,month,grade
class EducationOfficeBase(BaseAdapter):
    list_selector="a[href]";attachment_selector="a[href]"
    def discover(self,year=None):
        found=[]
        for url in self.config.get("list_urls",[]):
            try:
                r=self.client.get(url);s=BeautifulSoup(r.text,"html.parser")
                for a in s.select(self.list_selector):
                    href=urljoin(r.url,a.get("href",""));title=" ".join(a.stripped_strings) or a.get("title","");container=a.find_parent(["tr","li","article"]) or a.parent;context=container.get_text(" ",strip=True) if container else title
                    file_like=any(x in href.lower() for x in ["filedownload",".pdf",".hwp",".hwpx",".zip"])
                    if not self.domain_allowed(href) or not ("학력평가" in title or "전국연합" in title or (file_like and ("정답" in context or "학력평가" in context))):continue
                    y=infer_year(context)
                    if year and y!=year:continue
                    found.append(self.make(r.url,title or context[:100],href,year=y,exam_name="전국연합학력평가",session=f"{month(context) or ''}월",grade=grade(context),source_category="official_education_office"))
            except Exception as e:self.log.event("errors","교육청 탐색 실패",source=self.key,url=url,error=str(e))
        return found

