from __future__ import annotations

from .base import SourceAdapter


class SenAdapter(SourceAdapter):
    key = "sen"

    def discover(self):
        results = []
        for seed in self.config.get("seedUrls", []):
            try:
                results.extend(self.discover_links(seed, ("전국연합", "학력평가", "영어", "정답", "해설", "첨부")))
            except Exception as exc:
                self.logger.write("seed_skipped", "교육청 seed 탐색 생략", source=self.key, url=seed, error=str(exc))
        return results
