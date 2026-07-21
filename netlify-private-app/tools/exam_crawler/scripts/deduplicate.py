def deduplicate(rows):
    output = []
    seen = set()
    for item in rows:
        derived = item.get("derived", {})
        metadata = item.get("metadata", {})
        question_no = item.get("questionNo")
        keys = []
        if item.get("fileUrl"):
            keys.append(("file", item["fileUrl"], question_no))
        if metadata.get("sha256"):
            keys.append(("sha256", metadata["sha256"], question_no))
        if derived.get("textHash"):
            keys.append(("text", derived["textHash"], question_no))
        keys.append(("identity", item.get("title"), item.get("year"), question_no))
        if any(key in seen for key in keys):
            continue
        seen.update(keys)
        output.append(item)
    return output
