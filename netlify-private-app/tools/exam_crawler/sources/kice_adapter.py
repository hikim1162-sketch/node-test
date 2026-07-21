from .base_adapter import BaseAdapter
class KiceAdapter(BaseAdapter):
    key="kice"
    def discover(self,year=None):
        found=[]
        for url in self.config.get("list_urls",[]):
            try:
                r=self.client.get(url);from bs4 import BeautifulSoup;s=BeautifulSoup(r.text,"html.parser")
                for a in s.select("a[href]"):
                    href=__import__('urllib.parse',fromlist=['urljoin']).urljoin(r.url,a.get('href'));title=" ".join(a.stripped_strings)
                    if self.domain_allowed(href) and ("영어" in (title+a.parent.get_text(" ",strip=True))):found.append(self.make(r.url,title or "영어영역 공개자료",href,session="모의평가",copyright_notice_detected="저작권" in s.get_text()))
            except Exception as e:self.log.event("errors","KICE 탐색 생략",url=url,error=str(e))
        return found

