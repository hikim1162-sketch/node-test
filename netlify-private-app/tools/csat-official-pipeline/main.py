from __future__ import annotations

import argparse
from pathlib import Path

from csat_pipeline.pipeline import Pipeline, RunOptions


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="공식 수능 영어 자료 메타데이터 수집 파이프라인")
    parser.add_argument("command", choices=["discover", "download", "parse", "normalize", "report", "all"])
    parser.add_argument("--source", action="append", help="출처 adapter 이름. 여러 번 지정 가능")
    parser.add_argument("--year", type=int)
    parser.add_argument("--since", type=int)
    parser.add_argument("--limit", type=int)
    parser.add_argument("--resume", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--config", default="config/sources.json")
    return parser


def main() -> int:
    args = build_parser().parse_args()
    root = Path(__file__).resolve().parent
    options = RunOptions(
        sources=args.source or [], year=args.year, since=args.since,
        limit=args.limit, resume=args.resume, dry_run=args.dry_run,
    )
    pipeline = Pipeline(root=root, config_path=root / args.config, options=options)
    pipeline.run(args.command)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
