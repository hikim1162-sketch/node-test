import { useState } from "react";
import { extractFromUrl } from "../articles/articleImportService.js";
import { MIN_ARTICLE_LENGTH, createArticleRecord, saveArticle, toNewsArticle } from "../articles/articleStorage.js";

export default function ArticleImportModal({ open, onClose }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [manualText, setManualText] = useState("");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [savedArticle, setSavedArticle] = useState(null);
  if (!open) return null;

  function store(record) {
    try { return saveArticle(record); }
    catch (error) {
      if (error.code !== "DUPLICATE_URL" || !window.confirm("이미 저장된 URL입니다. 기존 원문을 덮어쓸까요?")) throw error;
      return saveArticle(record, { overwrite: true });
    }
  }

  async function importUrl(event) {
    event.preventDefault();
    if (!url.trim()) { setMessage("뉴스 URL을 입력해 주세요."); return; }
    setStatus("loading"); setMessage(""); setSavedArticle(null);
    try {
      const extracted = await extractFromUrl(url);
      const saved = store(createArticleRecord({ sourceUrl: extracted.sourceUrl || url, sourceTitle: extracted.sourceTitle || title, fullText: extracted.fullText, importMethod: "auto" }));
      setTitle(saved.sourceTitle); setSavedArticle(saved); setStatus("success"); setMessage("기사 원문을 가져와 개인 학습 다이어리에 저장했습니다.");
    } catch (error) {
      setStatus("manual"); setMessage(error.code === "DUPLICATE_URL" ? error.message : "자동으로 기사 본문을 가져오지 못했습니다.");
    }
  }

  function saveManual(event) {
    event.preventDefault();
    try {
      const saved = store(createArticleRecord({ sourceUrl: url, sourceTitle: title, fullText: manualText, importMethod: "manual" }));
      setSavedArticle(saved); setStatus("success"); setMessage("붙여넣은 원문을 개인 학습 다이어리에 저장했습니다.");
    } catch (error) { setMessage(error.message); }
  }

  function startLearning() {
    if (!savedArticle?.fullText) { setMessage("학습할 원문이 없습니다."); return; }
    window.dispatchEvent(new CustomEvent("valuetime:article-imported", { detail: { article: toNewsArticle(savedArticle) } }));
    onClose();
  }

  return <div className="article-import-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="article-import-modal" role="dialog" aria-modal="true" aria-labelledby="article-import-title"><button className="article-import-close" type="button" onClick={onClose} aria-label="닫기">×</button><span>PERSONAL LEARNING DIARY</span><h2 id="article-import-title">뉴스 원문 가져오기</h2><p>자동 추출이 되지 않아도 원문을 직접 붙여넣어 같은 방식으로 학습할 수 있습니다.</p><form onSubmit={importUrl}><label>뉴스 URL<input type="url" value={url} onChange={event => setUrl(event.target.value)} placeholder="https://example.com/news/article" /></label><label>제목 <small>선택사항</small><input value={title} onChange={event => setTitle(event.target.value)} placeholder="자동 추출되며 직접 입력해도 됩니다" /></label><button className="article-import-primary" type="submit" disabled={status === "loading"}>{status === "loading" ? "원문을 가져오는 중…" : "원문 가져오기"}</button></form>{message ? <div className={`article-import-message ${status}`} role="status">{message}</div> : null}{status === "manual" ? <form className="article-manual-form" onSubmit={saveManual}><b>원문을 직접 붙여넣어 주세요</b><p>원문 페이지에서 필요한 부분을 복사해 붙여넣어 주세요. 붙여넣은 텍스트도 동일하게 학습할 수 있습니다.</p><textarea value={manualText} onChange={event => setManualText(event.target.value)} placeholder={`영문 기사 원문을 ${MIN_ARTICLE_LENGTH}자 이상 붙여넣어 주세요.`} rows="9" /><small>{manualText.trim().length.toLocaleString()} / 최소 {MIN_ARTICLE_LENGTH}자</small><button className="article-import-primary" type="submit" disabled={manualText.trim().length < MIN_ARTICLE_LENGTH}>붙여넣은 원문 저장</button></form> : null}{status === "success" ? <div className="article-import-success"><b>{savedArticle?.sourceTitle || "저장된 개인 기사"}</b><button className="article-import-primary" type="button" onClick={startLearning}>바로 학습 시작</button></div> : null}</section></div>;
}
