import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CONTENT_STATUSES,
  CONTENT_TYPES,
  deleteLearningContent,
  loadLearningContents,
  upsertLearningContent,
  validateLearningContent,
} from "../learning/contentStorage.js";
import "./admin-contents.css";

const blankContent = {
  id: "",
  type: "daily_sentence",
  title: "",
  publishDate: new Date().toISOString().slice(0, 10),
  status: "draft",
  estimatedTime: 1,
  expressionEn: "",
  expressionKo: "",
  mainSentenceEn: "",
  mainSentenceKo: "",
  descriptionText: "",
  nuanceText: "",
  usageText: "",
  tedTitle: "",
  tedSummary: "",
  speakerName: "",
  speakerDesc: "",
  thumbnailUrl: "",
  videoUrl: "",
  contextText: "",
  keySentenceEn: "",
  keySentenceKo: "",
  expressionNote: "",
  messageNote: "",
  previousFlow: "",
  nextFlow: "",
  takeawayText: "",
  examples: [],
  quizzes: [],
};

const dailyFields = [
  ["expressionEn", "핵심 표현 영문"],
  ["expressionKo", "핵심 표현 한글"],
  ["mainSentenceEn", "대표 문장 영문"],
  ["mainSentenceKo", "대표 문장 해석"],
  ["descriptionText", "의미 설명"],
  ["nuanceText", "뉘앙스 설명"],
  ["usageText", "사용 상황"],
];

const tedFields = [
  ["tedTitle", "강연 제목"],
  ["tedSummary", "주제 요약"],
  ["speakerName", "화자명"],
  ["speakerDesc", "화자 소개"],
  ["thumbnailUrl", "썸네일 URL"],
  ["videoUrl", "영상 URL"],
  ["contextText", "장면 맥락"],
  ["keySentenceEn", "핵심 문장 영문"],
  ["keySentenceKo", "핵심 문장 해석"],
  ["expressionNote", "표현 설명"],
  ["messageNote", "메시지 해설"],
  ["previousFlow", "앞 흐름"],
  ["nextFlow", "뒤 흐름"],
  ["takeawayText", "Takeaway"],
];

export default function AdminContents() {
  const [contents, setContents] = useState(loadLearningContents);
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [errors, setErrors] = useState({});
  const [notice, setNotice] = useState("");

  const filtered = useMemo(() => contents.filter((content) => {
    const matchesType = typeFilter === "all" || content.type === typeFilter;
    const matchesStatus = statusFilter === "all" || content.status === statusFilter;
    const searchText = [content.title, content.expressionEn, content.tedTitle, content.speakerName].join(" ").toLowerCase();
    return matchesType && matchesStatus && searchText.includes(query.trim().toLowerCase());
  }), [contents, query, statusFilter, typeFilter]);

  function startCreate(type = "daily_sentence") {
    setEditing({ ...blankContent, type, estimatedTime: type === "ted_learning" ? 3 : 1 });
    setErrors({});
    setNotice("");
  }

  function updateField(field, value) {
    setEditing((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function submit(event) {
    event.preventDefault();
    const nextErrors = validateLearningContent(editing);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setNotice("필수 입력 항목을 확인해 주세요.");
      return;
    }
    const saved = upsertLearningContent({
      ...editing,
      id: editing.id || `${editing.type}-${Date.now()}`,
      estimatedTime: Number(editing.estimatedTime),
    });
    setContents(loadLearningContents());
    setEditing(saved);
    setNotice("콘텐츠를 저장했습니다.");
  }

  function remove(content) {
    if (!window.confirm(`“${content.title}” 콘텐츠를 삭제하시겠습니까?`)) return;
    deleteLearningContent(content.id);
    setContents(loadLearningContents());
    if (editing?.id === content.id) setEditing(null);
    setNotice("콘텐츠를 삭제했습니다.");
  }

  return (
    <main className="admin-contents-page">
      <header className="admin-topbar">
        <div>
          <span>VALUETIME INTERNAL</span>
          <h1>학습 콘텐츠 관리</h1>
          <p>매일 1문장과 TED 학습의 공개 일정과 학습 내용을 관리합니다.</p>
        </div>
        <Link to="/">사용자 화면으로</Link>
      </header>

      <section className="admin-toolbar" aria-label="콘텐츠 검색과 필터">
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="제목, 표현, 화자 검색" aria-label="콘텐츠 검색" />
        <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)} aria-label="콘텐츠 타입">
          <option value="all">전체 타입</option>
          {Object.entries(CONTENT_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="공개 상태">
          <option value="all">전체 상태</option>
          {Object.entries(CONTENT_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <button type="button" onClick={() => startCreate()}>새 콘텐츠 등록</button>
      </section>

      <div className="admin-workspace">
        <section className="admin-content-list" aria-label="콘텐츠 목록">
          <div className="admin-section-title"><h2>콘텐츠 목록</h2><span>{filtered.length}개</span></div>
          {filtered.length ? filtered.map((content) => (
            <article key={content.id} className={editing?.id === content.id ? "active" : ""}>
              <div>
                <span className={`status ${content.status}`}>{CONTENT_STATUSES[content.status]}</span>
                <small>{CONTENT_TYPES[content.type]} · {content.publishDate}</small>
                <h3>{content.title}</h3>
                <p>{content.type === "daily_sentence" ? `${content.expressionEn} · ${content.expressionKo}` : `${content.tedTitle} · ${content.speakerName}`}</p>
              </div>
              <nav>
                <button type="button" onClick={() => { setEditing(structuredClone(content)); setErrors({}); setNotice(""); }}>수정</button>
                <button className="danger" type="button" onClick={() => remove(content)}>삭제</button>
              </nav>
            </article>
          )) : <div className="admin-empty"><b>조건에 맞는 콘텐츠가 없습니다.</b><p>검색 조건을 바꾸거나 새 콘텐츠를 등록해 주세요.</p></div>}
        </section>

        <section className="admin-editor">
          {editing ? (
            <form onSubmit={submit} noValidate>
              <header>
                <div><span>{editing.id ? "EDIT CONTENT" : "NEW CONTENT"}</span><h2>{editing.id ? "콘텐츠 수정" : "콘텐츠 등록"}</h2></div>
                <button type="button" onClick={() => setEditing(null)} aria-label="편집 닫기">닫기</button>
              </header>
              <div className="admin-form-grid">
                <label>콘텐츠 타입
                  <select value={editing.type} onChange={(event) => updateField("type", event.target.value)}>
                    {Object.entries(CONTENT_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label>상태
                  <select value={editing.status} onChange={(event) => updateField("status", event.target.value)}>
                    {Object.entries(CONTENT_STATUSES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <Field label="제목" field="title" value={editing.title} error={errors.title} onChange={updateField} wide />
                <Field label="노출일" field="publishDate" value={editing.publishDate} error={errors.publishDate} onChange={updateField} type="date" />
                <Field label="예상 학습 시간(분)" field="estimatedTime" value={editing.estimatedTime} onChange={updateField} type="number" />
              </div>
              <div className="admin-field-section">
                <h3>{CONTENT_TYPES[editing.type]} 상세 정보</h3>
                {(editing.type === "daily_sentence" ? dailyFields : tedFields).map(([field, label]) => (
                  <Field key={field} label={label} field={field} value={editing[field]} error={errors[field]} onChange={updateField} textarea={field.toLowerCase().includes("text") || ["tedSummary", "contextText", "expressionNote", "messageNote", "previousFlow", "nextFlow", "takeawayText"].includes(field)} />
                ))}
              </div>
              <footer>
                <p role="status" className={Object.keys(errors).length ? "error" : ""}>{notice}</p>
                <button type="button" onClick={() => setEditing(null)}>취소</button>
                <button className="primary" type="submit">저장</button>
              </footer>
            </form>
          ) : (
            <div className="admin-editor-empty">
              <span>+</span><h2>콘텐츠를 선택하거나 등록하세요</h2>
              <p>타입에 따라 필요한 학습 정보만 입력할 수 있습니다.</p>
              <div><button type="button" onClick={() => startCreate("daily_sentence")}>매일 1문장 등록</button><button type="button" onClick={() => startCreate("ted_learning")}>TED 학습 등록</button></div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Field({ label, field, value, error, onChange, type = "text", textarea = false, wide = false }) {
  const control = textarea
    ? <textarea value={value || ""} onChange={(event) => onChange(field, event.target.value)} rows="3" />
    : <input type={type} min={type === "number" ? "1" : undefined} value={value || ""} onChange={(event) => onChange(field, event.target.value)} />;
  return <label className={`${wide ? "wide" : ""} ${error ? "invalid" : ""}`}>{label}{control}{error && <small>{error}</small>}</label>;
}

