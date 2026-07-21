from collections import Counter
from datetime import datetime, timezone

from core.file_store import write_json


def _ratio_bucket(value):
    value = float(value or 0)
    if value < 0.25:
        return "0-0.24"
    if value < 0.5:
        return "0.25-0.49"
    if value < 0.75:
        return "0.50-0.74"
    return "0.75-1.00"


def create_report(root, discovered, downloaded, parsed, normalized):
    parse_success = sum(x.get("parsed", {}).get("parse_status") == "success" for x in parsed)
    parse_failed = [
        {
            "id": x.get("raw", {}).get("id"),
            "title": x.get("raw", {}).get("title"),
            "warnings": x.get("parsed", {}).get("parse_warnings", []),
        }
        for x in parsed
        if x.get("parsed", {}).get("parse_status") == "failed"
    ]
    download_success = sum(bool(x.get("local_path")) for x in downloaded)
    policy_skipped = sum(
        not x.get("local_path") and not x.get("raw", {}).get("allow_download", False)
        for x in downloaded
    )
    download_failed = len(downloaded) - download_success - policy_skipped
    parse_metadata_only = sum(
        x.get("parsed", {}).get("parse_status") == "metadata_only" for x in parsed
    )
    report = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "discovered": len(discovered),
        "downloads": {
            "total": len(downloaded),
            "success": download_success,
            "failed": download_failed,
            "policySkipped": policy_skipped,
        },
        "parse": {
            "total": len(parsed),
            "success": parse_success,
            "metadataOnly": parse_metadata_only,
            "successRate": round(parse_success / len(parsed), 4) if parsed else 0.0,
            "failureSamples": parse_failed[:10],
        },
        "normalized": len(normalized),
        "fullText": sum(bool(x.get("storeFullText")) for x in normalized),
        "metadataOnly": sum(not bool(x.get("storeFullText")) for x in normalized),
        "bySource": dict(Counter(x.get("sourceName") or "unknown" for x in normalized)),
        "byYear": dict(Counter(str(x.get("year") or "unknown") for x in normalized)),
        "byQuestionType": dict(Counter(x.get("questionType") or "unknown" for x in normalized)),
        "englishRatioDistribution": dict(
            Counter(_ratio_bucket(x.get("derived", {}).get("englishRatio")) for x in normalized)
        ),
    }
    report_dir = root / "data/reports"
    write_json(report_dir / "summary.json", report)
    lines = [
        "# Exam crawler quality report",
        "",
        f"- Generated: {report['generatedAt']}",
        f"- Discovered: {report['discovered']}",
        f"- Download success: {download_success}/{len(downloaded)}",
        f"- Download failed: {download_failed}",
        f"- Download policy-skipped: {policy_skipped}",
        f"- Parse success: {parse_success}/{len(parsed)} ({report['parse']['successRate']:.1%})",
        f"- Normalized: {report['normalized']}",
        f"- Full text: {report['fullText']}",
        f"- Metadata only: {report['metadataOnly']}",
        "",
        "## By source",
        *[f"- {key}: {value}" for key, value in report["bySource"].items()],
        "",
        "## By year",
        *[f"- {key}: {value}" for key, value in report["byYear"].items()],
        "",
        "## By question type",
        *[f"- {key}: {value}" for key, value in report["byQuestionType"].items()],
        "",
        "## English ratio distribution",
        *[f"- {key}: {value}" for key, value in report["englishRatioDistribution"].items()],
    ]
    report_dir.mkdir(parents=True, exist_ok=True)
    (report_dir / "summary.md").write_text("\n".join(lines), encoding="utf-8")
