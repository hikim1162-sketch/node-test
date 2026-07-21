from __future__ import annotations

import time
from collections import defaultdict
from urllib.parse import urlsplit
from urllib.robotparser import RobotFileParser

import requests
import truststore

truststore.inject_into_ssl()

from .logging_utils import AuditLogger


class RespectfulHttpClient:
    def __init__(self, user_agent: str, delay: float, timeout: int, retries: int, logger: AuditLogger) -> None:
        self.user_agent = user_agent
        self.delay = max(0.5, delay)
        self.timeout = timeout
        self.retries = retries
        self.logger = logger
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": user_agent})
        self.last_request: dict[str, float] = defaultdict(float)
        self.robots: dict[str, RobotFileParser] = {}

    def _robot(self, url: str) -> RobotFileParser:
        parts = urlsplit(url)
        origin = f"{parts.scheme}://{parts.netloc}"
        if origin not in self.robots:
            robots_url = f"{origin}/robots.txt"
            parser = RobotFileParser(robots_url)
            try:
                response = self.session.get(robots_url, timeout=self.timeout, allow_redirects=True)
                if response.status_code == 404:
                    parser.parse(["User-agent: *", "Disallow:"])
                    self.logger.write("robots_missing", "robots.txt가 없어 표준 규칙에 따라 공개 URL 접근 허용", url=robots_url)
                else:
                    response.raise_for_status()
                    parser.parse(response.text.splitlines())
            except Exception as exc:
                self.logger.write("robots_error", "robots.txt 확인 실패: 보수적으로 접근 중단", url=url, error=str(exc))
                parser = RobotFileParser()
                parser.set_url(robots_url)
                parser.parse(["User-agent: *", "Disallow: /"])
            self.robots[origin] = parser
        return self.robots[origin]

    def allowed(self, url: str) -> bool:
        allowed = self._robot(url).can_fetch(self.user_agent, url)
        if not allowed:
            self.logger.write("robots_denied", "robots.txt에 따라 요청 생략", url=url)
        return allowed

    def get(self, url: str) -> requests.Response:
        if not self.allowed(url):
            raise PermissionError(f"robots.txt disallows {url}")
        host = urlsplit(url).netloc
        wait = self.delay - (time.monotonic() - self.last_request[host])
        if wait > 0:
            time.sleep(wait)
        last_error: Exception | None = None
        for attempt in range(1, self.retries + 1):
            try:
                response = self.session.get(url, timeout=self.timeout, allow_redirects=True)
                self.last_request[host] = time.monotonic()
                response.raise_for_status()
                return response
            except (requests.RequestException, PermissionError) as exc:
                last_error = exc
                self.logger.write("request_retry", "요청 실패", url=url, attempt=attempt, error=str(exc))
                if attempt < self.retries:
                    time.sleep(min(8, 2 ** attempt))
        raise RuntimeError(f"request failed: {url}: {last_error}")
