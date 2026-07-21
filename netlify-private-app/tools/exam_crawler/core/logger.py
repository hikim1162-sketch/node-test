import json,logging
from datetime import datetime,timezone
from pathlib import Path
class AuditLogger:
    def __init__(self,root:Path):
        root.mkdir(parents=True,exist_ok=True);self.root=root
        logging.basicConfig(filename=root/"pipeline.log",level=logging.INFO,encoding="utf-8",format="%(asctime)s %(message)s")
    def event(self,stage,message,**details):
        row={"time":datetime.now(timezone.utc).isoformat(),"stage":stage,"message":message,**details}
        logging.info(json.dumps(row,ensure_ascii=False,default=str))
        with (self.root/f"{stage}.log").open("a",encoding="utf-8") as f:f.write(json.dumps(row,ensure_ascii=False,default=str)+"\n")

