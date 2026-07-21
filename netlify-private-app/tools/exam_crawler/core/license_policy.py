def decide(source_key:str,config:dict,copyright_detected=False)->dict:
    archive=source_key=="kice_csat_archive"
    permitted=config.get("license_status")=="permitted" and config.get("store_full_text") is True
    return {"licenseStatus":"restricted_or_unclear" if archive or copyright_detected else config.get("license_status","unclear"),"storeFullText":bool(permitted and not copyright_detected),"reason":"KICE copyright notice present; do not persist full copyrighted exam text without explicit reuse permission." if archive or copyright_detected else "Reuse scope is not explicitly confirmed." if not permitted else "Explicit reuse permission configured.","allowInternalParsing":bool(config.get("allow_internal_parsing",False)),"allowPublicRedisplay":bool(permitted and not copyright_detected)}

