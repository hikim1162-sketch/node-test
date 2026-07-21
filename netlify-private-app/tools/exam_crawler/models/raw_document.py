from datetime import datetime,timezone
from typing import Any
from pydantic import BaseModel,ConfigDict,Field

class Attachment(BaseModel):
    model_config = ConfigDict(populate_by_name=True)
    file_url:str=Field(alias="fileUrl"); file_name:str=Field(default="",alias="fileName")
    file_type:str=Field(default="unknown",alias="fileType"); attachment_role:str=Field(default="unknown_attachment",alias="attachmentRole")
    local_path:str|None=Field(default=None,alias="localPath"); sha256:str=""; file_size:int=Field(default=0,alias="fileSize")

class RawDocument(BaseModel):
    id:str; source_name:str; source_category:str="official_exam"; source_sub_type:str=""
    collection_name:str=""; board_name:str=""; page_url:str; detail_url:str=""; post_id:str=""
    title:str; year:int|None=None; exam_name:str=""; session:str=""; subject:str="영어"; region:str|None=None
    file_type:str="html"; published_at:str|None=None; registered_at:str|None=None
    file_url:str|None=None; file_urls:list[str]=Field(default_factory=list); file_types:list[str]=Field(default_factory=list)
    attachments:list[Attachment]=Field(default_factory=list)
    discovered_at:datetime=Field(default_factory=lambda:datetime.now(timezone.utc)); metadata:dict[str,Any]=Field(default_factory=dict)
    license_status:str="unclear"; store_full_text:bool=False; allow_download:bool=False
