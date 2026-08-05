export function isDictionaryLookupText(value) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text || text.length > 80 || !/^[A-Za-z][A-Za-z' -]*$/.test(text)) return false;
  return text.split(" ").length <= 4;
}
