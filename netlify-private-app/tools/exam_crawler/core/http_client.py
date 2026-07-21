import time
from collections import defaultdict
from urllib.parse import urlsplit
from urllib.robotparser import RobotFileParser
import requests,truststore
truststore.inject_into_ssl()
class HttpClient:
    def __init__(self,settings,logger):
        self.s=requests.Session();self.s.headers["User-Agent"]=settings["user_agent"];self.ua=settings["user_agent"]
        self.delay=float(settings.get("request_delay_seconds",2));self.timeout=int(settings.get("timeout_seconds",25));self.retries=int(settings.get("retries",3));self.last=defaultdict(float);self.robots={};self.log=logger
    def allowed(self,url):
        p=urlsplit(url);origin=f"{p.scheme}://{p.netloc}"
        if origin not in self.robots:
            rp=RobotFileParser(origin+"/robots.txt")
            try:
                r=self.s.get(origin+"/robots.txt",timeout=self.timeout)
                if r.status_code==404:rp.parse(["User-agent: *","Disallow:"])
                else:r.raise_for_status();rp.parse(r.text.splitlines())
            except Exception as e:rp.parse(["User-agent: *","Disallow: /"]);self.log.event("errors","robots 확인 실패, 접근 중단",url=url,error=str(e))
            self.robots[origin]=rp
        return self.robots[origin].can_fetch(self.ua,url)
    def get(self,url):
        if not self.allowed(url):raise PermissionError(f"robots denied: {url}")
        host=urlsplit(url).netloc;wait=self.delay-(time.monotonic()-self.last[host]);time.sleep(max(0,wait))
        error=None
        for attempt in range(1,self.retries+1):
            try:r=self.s.get(url,timeout=self.timeout,allow_redirects=True);self.last[host]=time.monotonic();r.raise_for_status();return r
            except requests.RequestException as e:error=e;self.log.event("errors","요청 재시도",url=url,attempt=attempt,error=str(e));time.sleep(min(8,2**attempt))
        raise RuntimeError(error)

