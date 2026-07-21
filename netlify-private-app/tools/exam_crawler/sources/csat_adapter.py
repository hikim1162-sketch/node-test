from .base_adapter import BaseAdapter
class CsatAdapter(BaseAdapter):
    key="csat"
    def discover(self,year=None):
        return [self.make(x["page_url"],x["title"],x.get("file_url"),year=x.get("year"),session="본시험",attachment_role=x.get("attachment_role")) for x in self.config.get("static_resources",[]) if not year or x.get("year")==year]

