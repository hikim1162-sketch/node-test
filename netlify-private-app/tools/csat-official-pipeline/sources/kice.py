from __future__ import annotations

from .base import SourceAdapter


class KiceAdapter(SourceAdapter):
    key = "kice"

    def discover(self):
        results = [self.resource(
            item["sourceUrl"], item["title"], item.get("fileUrl"),
            exam_name=item.get("examName", item["title"]), session=item.get("session", ""),
            configured_static=True,
        ) for item in self.config.get("staticResources", [])]
        for seed in self.config.get("seedUrls", []):
            try:
                results.extend(self.discover_links(seed, ("영어", "문제", "정답", "모의평가", "대학수학능력시험", ".pdf")))
            except Exception as exc:
                self.logger.write("seed_skipped", "평가원 seed 탐색을 생략하고 확인된 정적 메타데이터만 유지", source=self.key, url=seed, error=str(exc))
        return results
