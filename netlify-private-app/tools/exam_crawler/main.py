from __future__ import annotations
import argparse
from pathlib import Path
from core.pipeline import ExamPipeline, RunOptions

def parser():
    p=argparse.ArgumentParser(description="공식 영어 시험자료 수집·정규화")
    p.add_argument("command",choices=["discover","download","parse","normalize","deduplicate","report","all"])
    p.add_argument("--source",action="append"); p.add_argument("--year",type=int); p.add_argument("--since",type=int)
    p.add_argument("--limit",type=int); p.add_argument("--resume",action="store_true"); p.add_argument("--dry-run",action="store_true")
    return p

def main():
    a=parser().parse_args(); root=Path(__file__).resolve().parent
    ExamPipeline(root,RunOptions(a.source or [],a.year,a.since,a.limit,a.resume,a.dry_run)).run(a.command)

if __name__=="__main__": main()
