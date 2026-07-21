from __future__ import annotations

from .base import SourceAdapter


class EbsiAdapter(SourceAdapter):
    key = "ebsi"

    def discover(self):
        results = []
        for seed in self.config.get("seedUrls", []):
            try:
                results.extend(self.discover_links(seed, ("영어", "기출", "모의평가", "학력평가", "문제", "정답", ".pdf")))
            except Exception as exc:
                self.logger.write("seed_skipped", "EBSi seed 탐색 생략", source=self.key, url=seed, error=str(exc))
        return results
