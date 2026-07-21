from datetime import datetime
from typing import Any
from pydantic import BaseModel,Field
from .raw_document import Attachment

class SentenceUnit(BaseModel): no:int; text:str; translation:str=""; note:str=""

class NormalizedItem(BaseModel):
    id:str; sourceType:str="official_public"; sourceSubType:str=""; sourceName:str; sourceUrl:str; fileUrl:str|None=None
    detailUrl:str=""; postId:str=""; collectionName:str=""; boardName:str=""; collectedAt:datetime
    year:int|None=None; examName:str=""; session:str=""; subject:str="영어"; region:str|None=None
    section:str="reading"; questionNo:int|None=None; questionType:str="unknown"; title:str; registeredAt:str|None=None
    licenseStatus:str="unclear"; storeFullText:bool=False; copyrightNoticeDetected:bool=False
    passage:list[dict[str,Any]]=Field(default_factory=list); passageText:str=""; sentenceUnits:list[SentenceUnit]=Field(default_factory=list)
    questionText:str=""; choices:list[str]=Field(default_factory=list); answer:int|None=None; explanation:str=""
    attachments:list[Attachment]=Field(default_factory=list); metadata:dict[str,Any]=Field(default_factory=dict)
    derived:dict[str,Any]=Field(default_factory=dict); reusePolicy:dict[str,Any]=Field(default_factory=dict)
    todayCandidate:bool=False; recommendedReason:str=""; uiPreview:dict[str,Any]=Field(default_factory=dict)

