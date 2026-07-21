from typing import Any
from pydantic import BaseModel,Field

class ParsedItem(BaseModel):
    raw_id:str; source_name:str; title:str; year:int|None=None; exam_name:str=""; subject:str="영어"
    file_type:str=""; local_path:str|None=None; page_count:int=0; raw_text:str=""
    internal_extracted_text:str=""; internal_question_segments:list[dict[str,Any]]=Field(default_factory=list)
    internal_passage_candidates:list[str]=Field(default_factory=list); extracted_blocks:list[dict[str,Any]]=Field(default_factory=list)
    parse_status:str="metadata_only"; parse_confidence:float=0.0; parse_warnings:list[str]=Field(default_factory=list)

