import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { buildQuestions, getDayWords, getDays, getWordById, SERIES } from "./vocabData.js";
import { loadProgress, saveProgress, todayKey } from "./storage.js";
import "./csat-vocab.css";

const TABS = [
  ["study", "빠른 학습"],
  ["test", "테스트"],
  ["review", "오답 복습"],
  ["progress", "진도 / 기록"],
];

export default function CsatVocabPage() {
  const requestedTab = new URLSearchParams(window.location.search).get("tab");
  const [seriesKey, setSeriesKey] = useState("csat2000");
  const [day, setDay] = useState(getDays("csat2000")[0] || 1);
  const [tab, setTab] = useState(TABS.some(([key]) => key === requestedTab) ? requestedTab : "study");
  const [progress, setProgress] = useState(loadProgress);

  const days = useMemo(() => getDays(seriesKey), [seriesKey]);
  const dayWords = useMemo(() => getDayWords(seriesKey, day), [seriesKey, day]);

  function updateProgress(updater) {
    setProgress((current) => {
      const next = updater(current);
      saveProgress(next);
      return next;
    });
  }

  function changeSeries(nextSeries) {
    setSeriesKey(nextSeries);
    setDay(getDays(nextSeries)[0] || 1);
    setTab("study");
  }

  return (
    <main className="csat-vocab-app">
      <header className="csat-vocab-header">
        <div>
          <Link to="/" className="csat-back">← 수능모드</Link>
          <span className="csat-mode-label">수능모드</span>
          <h1>Word Master 훈련</h1>
          <p>빠르게 확인하고, 바로 테스트하고, 틀린 단어만 반복하세요.</p>
        </div>
        <div className="csat-series" aria-label="단어 시리즈 선택">
          {Object.values(SERIES).map((series) => (
            <button
              type="button"
              className={seriesKey === series.key ? "active" : ""}
              onClick={() => changeSeries(series.key)}
              aria-pressed={seriesKey === series.key}
              key={series.key}
            >
              <b>{series.label}</b>
              <small>{series.description}</small>
            </button>
          ))}
        </div>
      </header>

      <section className="csat-vocab-toolbar">
        <label>
          학습 범위
          <select value={day} onChange={(event) => setDay(Number(event.target.value))}>
            {days.map((dayNumber) => <option value={dayNumber} key={dayNumber}>Day {dayNumber}</option>)}
          </select>
        </label>
        <span>{SERIES[seriesKey].label} · Day {day} · {dayWords.length}단어</span>
      </section>

      <nav className="csat-tabs" aria-label="수능 단어 훈련 메뉴">
        {TABS.map(([key, label]) => (
          <button type="button" className={tab === key ? "active" : ""} onClick={() => setTab(key)} aria-current={tab === key ? "page" : undefined} key={key}>
            {label}
            {key === "review" && Object.keys(progress.wrong).length > 0 ? <em>{Object.keys(progress.wrong).length}</em> : null}
          </button>
        ))}
      </nav>

      {tab === "study" && <QuickStudy words={dayWords.slice(0, 10)} progress={progress} updateProgress={updateProgress} startTest={() => setTab("test")} />}
      {tab === "test" && <TestPanel words={dayWords.slice(0, 10)} sourceWords={SERIES[seriesKey].words} seriesKey={seriesKey} day={day} progress={progress} updateProgress={updateProgress} openReview={() => setTab("review")} />}
      {tab === "review" && <ReviewPanel progress={progress} sourceWords={SERIES[seriesKey].words} seriesKey={seriesKey} day={day} updateProgress={updateProgress} />}
      {tab === "progress" && <ProgressPanel progress={progress} />}
    </main>
  );
}

function QuickStudy({ words, progress, updateProgress, startTest }) {
  const [index, setIndex] = useState(0);
  const [meaningVisible, setMeaningVisible] = useState(false);
  const word = words[index];
  const completed = words.filter((item) => progress.statuses[item.id]).length;

  if (!word) return <EmptyState title="이 Day에는 표시할 단어가 없습니다." />;

  function rate(status) {
    updateProgress((current) => ({
      ...current,
      statuses: { ...current.statuses, [word.id]: { status, date: todayKey(), updatedAt: new Date().toISOString() } },
    }));
    if (index < words.length - 1) {
      setIndex(index + 1);
      setMeaningVisible(false);
    }
  }

  return (
    <section className="csat-workspace">
      <div className="csat-section-head">
        <div><span>QUICK STUDY</span><h2>오늘의 10단어</h2></div>
        <b>{completed} / {words.length}</b>
      </div>
      <div className="csat-progress-track"><i style={{ width: `${words.length ? (completed / words.length) * 100 : 0}%` }} /></div>
      <article className="csat-word-card">
        <small>{index + 1} / {words.length}</small>
        <h3>{word.word_display}</h3>
        {word.is_corrected ? <p className="csat-correction">원본 표기: {word.word_raw} · 교정 표시</p> : null}
        <button type="button" className="csat-meaning-toggle" onClick={() => setMeaningVisible((visible) => !visible)} aria-expanded={meaningVisible}>
          {meaningVisible ? "뜻 숨기기" : "뜻 보기"}
        </button>
        {meaningVisible ? <p>{word.meaning_display}</p> : <p className="csat-meaning-covered">먼저 단어의 뜻을 떠올려 보세요.</p>}
        {word.example ? <details className="csat-example"><summary>예문 보기</summary><p>{word.example}</p>{word.exampleMeaning ? <small>{word.exampleMeaning}</small> : null}</details> : null}
        <div className="csat-rating-actions">
          <button type="button" onClick={() => rate("known")}>암기함</button>
          <button type="button" onClick={() => rate("confused")}>헷갈림</button>
          <button type="button" onClick={() => rate("unknown")}>모름</button>
        </div>
      </article>
      <div className="csat-card-navigation">
        <button type="button" onClick={() => { setIndex(Math.max(0, index - 1)); setMeaningVisible(false); }} disabled={index === 0}>이전</button>
        <div>{words.map((item, itemIndex) => <button type="button" className={`${itemIndex === index ? "active" : ""} ${progress.statuses[item.id] ? "rated" : ""}`} onClick={() => { setIndex(itemIndex); setMeaningVisible(false); }} aria-label={`${itemIndex + 1}번 단어`} key={item.id} />)}</div>
        {completed === words.length ? <button type="button" className="primary" onClick={startTest}>이 범위 시험 보기</button> : <button type="button" onClick={() => { setIndex(Math.min(words.length - 1, index + 1)); setMeaningVisible(false); }} disabled={index === words.length - 1}>다음</button>}
      </div>
    </section>
  );
}

function TestPanel({ words, sourceWords, seriesKey, day, progress, updateProgress, openReview }) {
  const reviewWords = Object.keys(progress.wrong).map(getWordById).filter(Boolean);
  const studiedToday = sourceWords.filter((word) => progress.statuses[word.id]?.date === todayKey()).slice(0, 10);
  const randomWords = useMemo(() => [...sourceWords].sort((a, b) => ((a.index * 37) % 101) - ((b.index * 37) % 101)).slice(0, 10), [sourceWords]);
  const [mode, setMode] = useState("day");
  const targets = mode === "wrong" ? reviewWords.slice(0, 10) : mode === "learned" ? studiedToday : mode === "random" ? randomWords : words;
  const questions = useMemo(() => buildQuestions(targets, sourceWords), [targets.map((word) => word.id).join("|"), sourceWords]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const finished = questions.length > 0 && answers.length === questions.length;
  const score = answers.filter((answer) => answer.correct).length;
  const question = questions[index];

  function reset(nextMode = mode) {
    setMode(nextMode);
    setIndex(0);
    setAnswers([]);
    setSelected(null);
  }

  function confirmAnswer() {
    if (selected === null || !question) return;
    const correct = selected === question.answerIndex;
    const nextAnswers = [...answers, { id: question.word.id, correct }];
    setAnswers(nextAnswers);
    updateProgress((current) => {
      const wrong = { ...current.wrong };
      if (correct && mode === "wrong") delete wrong[question.word.id];
      if (!correct) wrong[question.word.id] = { count: (wrong[question.word.id]?.count || 0) + 1, lastWrongAt: new Date().toISOString() };
      const tests = nextAnswers.length === questions.length
        ? [...current.tests, { date: todayKey(), series: seriesKey, day, score: nextAnswers.filter((answer) => answer.correct).length, total: questions.length, mode }].slice(-100)
        : current.tests;
      return { ...current, wrong, tests };
    });
    if (nextAnswers.length < questions.length) {
      setIndex(index + 1);
      setSelected(null);
    }
  }

  if (!questions.length) return <section className="csat-workspace"><TestModeSwitch mode={mode} reset={reset} hasWrong={reviewWords.length > 0} /><EmptyState title={mode === "wrong" ? "복습할 오답이 없습니다." : "테스트할 단어가 없습니다."} /></section>;

  if (finished) {
    const wrongAnswers = answers.filter((answer) => !answer.correct).map((answer) => getWordById(answer.id)).filter(Boolean);
    return (
      <section className="csat-workspace csat-result">
        <span>TEST COMPLETE</span><h2>{score} / {questions.length}</h2><p>총 {questions.length}문제 · 정답 {score}개 · 오답 {questions.length - score}개</p>
        {wrongAnswers.length ? <section className="csat-result-wrong"><h3>틀린 단어</h3>{wrongAnswers.map((word) => <article key={word.id}><b>{word.word_display}</b><span>{word.meaning_display}</span></article>)}</section> : <p className="csat-perfect">모든 문제를 맞혔습니다.</p>}
        <div><button type="button" onClick={() => reset()}>다시 풀기</button><button type="button" className="primary" onClick={openReview}>오답 다시 보기</button></div>
      </section>
    );
  }

  return (
    <section className="csat-workspace">
      <TestModeSwitch mode={mode} reset={reset} hasWrong={reviewWords.length > 0} />
      <div className="csat-question-meta"><span>{question.label}</span><b>{index + 1} / {questions.length}</b></div>
      <article className="csat-question">
        <h2>{question.prompt}</h2>
        <div>{question.choices.map((choice, choiceIndex) => <button type="button" className={selected === choiceIndex ? "selected" : ""} onClick={() => setSelected(choiceIndex)} key={`${choice}-${choiceIndex}`}><i>{choiceIndex + 1}</i>{choice}</button>)}</div>
        <button type="button" className="csat-submit" onClick={confirmAnswer} disabled={selected === null}>정답 확인</button>
      </article>
    </section>
  );
}

function TestModeSwitch({ mode, reset, hasWrong }) {
  return <div className="csat-test-switch"><button type="button" className={mode === "day" ? "active" : ""} onClick={() => reset("day")}>현재 Day</button><button type="button" className={mode === "learned" ? "active" : ""} onClick={() => reset("learned")}>오늘 학습</button><button type="button" className={mode === "wrong" ? "active" : ""} onClick={() => reset("wrong")} disabled={!hasWrong}>오답</button><button type="button" className={mode === "random" ? "active" : ""} onClick={() => reset("random")}>랜덤</button></div>;
}

function ReviewPanel({ progress, sourceWords, seriesKey, day, updateProgress }) {
  const reviewWords = Object.keys(progress.wrong).map(getWordById).filter(Boolean);
  const statusWords = Object.entries(progress.statuses).filter(([, value]) => value.status !== "known").map(([id]) => getWordById(id)).filter(Boolean);
  const combined = [...reviewWords, ...statusWords].filter((word, index, words) => words.findIndex((item) => item.id === word.id) === index);

  if (!combined.length) return <section className="csat-workspace"><EmptyState title="아직 복습할 단어가 없습니다." description="테스트 오답과 ‘헷갈림·모름’ 단어가 여기에 자동으로 모입니다." /></section>;

  return (
    <section className="csat-workspace">
      <div className="csat-section-head"><div><span>WEAK WORDS</span><h2>오답과 헷갈린 단어</h2></div><b>{combined.length}개</b></div>
      <div className="csat-review-list">{combined.map((word) => (
        <article key={word.id}><div><span>{SERIES[word.series].label} · Day {word.day}</span><h3>{word.word_display}</h3><p>{word.meaning_display}</p></div><em>{progress.wrong[word.id] ? `오답 ${progress.wrong[word.id].count}회` : progress.statuses[word.id]?.status === "unknown" ? "모름" : "헷갈림"}</em><button type="button" onClick={() => updateProgress((current) => { const wrong = { ...current.wrong }; const statuses = { ...current.statuses }; delete wrong[word.id]; delete statuses[word.id]; return { ...current, wrong, statuses }; })}>복습 완료</button></article>
      ))}</div>
    </section>
  );
}

function ProgressPanel({ progress }) {
  const today = todayKey();
  const learnedToday = Object.values(progress.statuses).filter((item) => item.date === today || item.updatedAt?.startsWith(today)).length;
  const testsToday = progress.tests.filter((test) => test.date === today);
  const latest = testsToday.at(-1);

  return (
    <section className="csat-workspace">
      <div className="csat-section-head"><div><span>MY PROGRESS</span><h2>오늘의 훈련 기록</h2></div></div>
      <div className="csat-stats"><article><span>오늘 학습</span><b>{learnedToday}</b><small>단어</small></article><article><span>최근 점수</span><b>{latest ? `${latest.score}/${latest.total}` : "-"}</b><small>오늘 테스트</small></article><article><span>오답</span><b>{Object.keys(progress.wrong).length}</b><small>복습 대기</small></article></div>
      <h3 className="csat-progress-title">시리즈별 진행률</h3>
      <div className="csat-series-progress">{Object.values(SERIES).map((series) => { const learned = series.words.filter((word) => progress.statuses[word.id]).length; const percent = Math.round((learned / series.words.length) * 100); return <article key={series.key}><div><b>{series.label}</b><span>{learned} / {series.words.length}</span></div><i><b style={{ width: `${percent}%` }} /></i><small>{percent}%</small></article>; })}</div>
      <h3 className="csat-progress-title">최근 테스트</h3>
      {progress.tests.length ? <ul className="csat-history">{[...progress.tests].reverse().slice(0, 8).map((test, index) => <li key={`${test.date}-${index}`}><span>{test.date}</span><b>{SERIES[test.series]?.label || test.series} · Day {test.day}</b><em>{test.score} / {test.total}</em></li>)}</ul> : <EmptyState title="아직 테스트 기록이 없습니다." />}
    </section>
  );
}

function EmptyState({ title, description }) {
  return <div className="csat-empty"><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>;
}
