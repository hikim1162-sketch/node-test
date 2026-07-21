import { useEffect, useMemo, useState } from "react";
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

export default function CsatVocabPage({ embedded = false }) {
  const requestedTab = new URLSearchParams(window.location.search).get("tab");
  const [seriesKey, setSeriesKey] = useState("csat2000");
  const [day, setDay] = useState(getDays("csat2000")[0] || 1);
  const [tab, setTab] = useState(TABS.some(([key]) => key === requestedTab) ? requestedTab : "study");
  const [progress, setProgress] = useState(loadProgress);

  const days = useMemo(() => getDays(seriesKey), [seriesKey]);
  const dayWords = useMemo(() => getDayWords(seriesKey, day), [seriesKey, day]);
  const pendingWrongCount = Object.values(progress.wrong).filter((history) => !history.resolvedAt).length;

  useEffect(() => {
    updateProgress((current) => {
      let changed = false;
      const wrong = { ...current.wrong };
      Object.entries(wrong).forEach(([id, history]) => {
        if (history.word && history.meaning) return;
        const word = getWordById(id);
        if (!word) return;
        wrong[id] = { ...history, word: word.word_display, meaning: word.meaning_display, series: word.series, day: word.day };
        changed = true;
      });
      return changed ? { ...current, wrong } : current;
    });
  }, []);

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

  function changeDay(nextDay) {
    if (!days.includes(Number(nextDay))) return;
    setDay(Number(nextDay));
    setTab("study");
  }

  return (
    <main className="csat-vocab-app">
      <header className="csat-vocab-header">
        <div>
          {embedded ? <span className="csat-back">수능 영어 · 단어장</span> : <Link to="/" className="csat-back">← 수능모드</Link>}
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
          <select value={day} onChange={(event) => changeDay(event.target.value)}>
            {days.map((dayNumber) => <option value={dayNumber} key={dayNumber}>Day {dayNumber}</option>)}
          </select>
        </label>
        <span>{SERIES[seriesKey].label} · Day {day} · {dayWords.length}단어</span>
      </section>

      <nav className="csat-tabs" aria-label="수능 단어 훈련 메뉴">
        {TABS.map(([key, label]) => (
          <button type="button" className={tab === key ? "active" : ""} onClick={() => setTab(key)} aria-current={tab === key ? "page" : undefined} key={key}>
            {label}
            {key === "review" && pendingWrongCount > 0 ? <em>{pendingWrongCount}</em> : null}
          </button>
        ))}
      </nav>

      {tab === "study" && <QuickStudy words={dayWords.slice(0, 10)} progress={progress} updateProgress={updateProgress} startTest={() => setTab("test")} />}
      {tab === "test" && <TestPanel words={dayWords.slice(0, 10)} sourceWords={SERIES[seriesKey].words} seriesKey={seriesKey} day={day} progress={progress} updateProgress={updateProgress} openReview={() => setTab("review")} />}
      {tab === "review" && <ReviewPanel progress={progress} sourceWords={SERIES[seriesKey].words} seriesKey={seriesKey} day={day} updateProgress={updateProgress} />}
      {tab === "progress" && <ProgressPanel progress={progress} />}
      <DayPagination days={days} day={day} onChange={changeDay} />
    </main>
  );
}

function DayPagination({ days, day, onChange }) {
  const currentIndex = days.indexOf(day);
  const visibleDays = days.filter((dayNumber, index) => (
    index === 0
    || index === days.length - 1
    || Math.abs(index - currentIndex) <= 2
  ));

  return (
    <nav className="csat-day-pagination" aria-label="단어장 Day 이동">
      <button type="button" onClick={() => onChange(days[currentIndex - 1])} disabled={currentIndex <= 0}>← 이전 Day</button>
      <div>
        {visibleDays.map((dayNumber, index) => {
          const previousVisible = visibleDays[index - 1];
          const hasGap = previousVisible && dayNumber - previousVisible > 1;
          return (
            <span key={dayNumber}>
              {hasGap ? <i aria-hidden="true">…</i> : null}
              <button type="button" className={dayNumber === day ? "active" : ""} onClick={() => onChange(dayNumber)} aria-current={dayNumber === day ? "page" : undefined} aria-label={`Day ${dayNumber} 학습`}>{dayNumber}</button>
            </span>
          );
        })}
      </div>
      <button type="button" onClick={() => onChange(days[currentIndex + 1])} disabled={currentIndex < 0 || currentIndex >= days.length - 1}>다음 Day →</button>
    </nav>
  );
}

function QuickStudy({ words, progress, updateProgress, startTest }) {
  const [index, setIndex] = useState(0);
  const [meaningVisible, setMeaningVisible] = useState(false);
  const word = words[index];
  const completed = words.filter((item) => progress.statuses[item.id]).length;

  useEffect(() => {
    setIndex(0);
    setMeaningVisible(false);
  }, [words[0]?.id]);

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
  const reviewWords = Object.entries(progress.wrong).filter(([, history]) => !history.resolvedAt).map(([id]) => getWordById(id)).filter(Boolean);
  const studiedToday = sourceWords.filter((word) => progress.statuses[word.id]?.date === todayKey()).slice(0, 10);
  const randomWords = useMemo(() => [...sourceWords].sort((a, b) => ((a.index * 37) % 101) - ((b.index * 37) % 101)).slice(0, 10), [sourceWords]);
  const [mode, setMode] = useState("day");
  const targets = mode === "wrong" ? reviewWords.slice(0, 10) : mode === "learned" ? studiedToday : mode === "random" ? randomWords : words;
  const questions = useMemo(() => buildQuestions(targets, sourceWords), [targets.map((word) => word.id).join("|"), sourceWords]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(null);
  const [finished, setFinished] = useState(false);
  const [hadWrongAttempt, setHadWrongAttempt] = useState(false);
  const score = answers.filter((answer) => answer.correct).length;
  const question = questions[index];

  function reset(nextMode = mode) {
    setMode(nextMode);
    setIndex(0);
    setAnswers([]);
    setSelected(null);
    setRevealed(null);
    setFinished(false);
    setHadWrongAttempt(false);
  }

  function confirmAnswer() {
    if (!question) return;
    if (revealed) {
      if (!revealed.correct) {
        setSelected(null);
        setRevealed(null);
        setHadWrongAttempt(true);
        return;
      }
      if (answers.length === questions.length) {
        setFinished(true);
      } else {
        setIndex(index + 1);
        setSelected(null);
        setRevealed(null);
        setHadWrongAttempt(false);
      }
      return;
    }
    if (selected === null) return;
    const correct = selected === question.answerIndex;
    if (!correct) {
      setRevealed({ correct: false, selected });
      updateProgress((current) => ({
        ...current,
        wrong: {
          ...current.wrong,
          [question.word.id]: {
            count: (current.wrong[question.word.id]?.count || 0) + 1,
            lastWrongAt: new Date().toISOString(),
            resolvedAt: null,
            word: question.word.word_display,
            meaning: question.word.meaning_display,
            series: question.word.series,
            day: question.word.day,
          },
        },
      }));
      return;
    }

    const scoredCorrect = !hadWrongAttempt;
    const nextAnswers = [...answers, { id: question.word.id, correct: scoredCorrect }];
    setAnswers(nextAnswers);
    setRevealed({ correct: true, selected });
    updateProgress((current) => {
      const wrong = { ...current.wrong };
      if (scoredCorrect && mode === "wrong" && wrong[question.word.id]) {
        wrong[question.word.id] = {
          ...wrong[question.word.id],
          lastCorrectAt: new Date().toISOString(),
          correctAfterWrong: (wrong[question.word.id].correctAfterWrong || 0) + 1,
          resolvedAt: new Date().toISOString(),
        };
      }
      const tests = nextAnswers.length === questions.length
        ? [...current.tests, { date: todayKey(), series: seriesKey, day, score: nextAnswers.filter((answer) => answer.correct).length, total: questions.length, mode }].slice(-100)
        : current.tests;
      return { ...current, wrong, tests };
    });
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
        <div>{question.choices.map((choice, choiceIndex) => {
          const isCorrectChoice = revealed?.correct && choiceIndex === question.answerIndex;
          const isWrongChoice = revealed && choiceIndex === revealed.selected && !revealed.correct;
          const className = [selected === choiceIndex ? "selected" : "", isCorrectChoice ? "correct" : "", isWrongChoice ? "wrong" : ""].filter(Boolean).join(" ");
          return <button type="button" className={className} onClick={() => setSelected(choiceIndex)} disabled={Boolean(revealed)} key={`${choice}-${choiceIndex}`}><i>{choiceIndex + 1}</i>{choice}</button>;
        })}</div>
        {revealed ? <div className={`csat-answer-feedback ${revealed.correct ? "correct" : "wrong"}`} role="status"><b>{revealed.correct ? "정답입니다." : "오답입니다."}</b><span>{revealed.correct ? `정답: ${question.answerIndex + 1}번 · ${question.choices[question.answerIndex]}` : "다시 풀어보세요."}</span></div> : null}
        <button type="button" className="csat-submit" onClick={confirmAnswer} disabled={!revealed && selected === null}>{revealed ? (!revealed.correct ? "다시 풀기" : answers.length === questions.length ? "결과 보기" : "다음 문제") : "정답 확인"}</button>
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
        <article className={`${progress.wrong[word.id]?.reviewedAt ? "reviewed" : ""} ${progress.wrong[word.id]?.resolvedAt ? "resolved" : ""}`} key={word.id}><div><span>{SERIES[word.series].label} · Day {word.day}</span><h3>{word.word_display}</h3><p>{word.meaning_display}</p></div><em>{progress.wrong[word.id]?.resolvedAt ? `해결됨 · 오답 ${progress.wrong[word.id].count}회` : progress.wrong[word.id] ? `오답 ${progress.wrong[word.id].count}회` : progress.statuses[word.id]?.status === "unknown" ? "모름" : "헷갈림"}</em><button type="button" aria-pressed={Boolean(progress.wrong[word.id]?.reviewedAt)} onClick={() => updateProgress((current) => { const wrong = { ...current.wrong }; const previous = wrong[word.id] || { count: 0, word: word.word_display, meaning: word.meaning_display, series: word.series, day: word.day }; wrong[word.id] = previous.reviewedAt ? { ...previous, reviewedAt: null } : { ...previous, reviewedAt: new Date().toISOString(), reviewCount: (previous.reviewCount || 0) + 1 }; return { ...current, wrong }; })}>{progress.wrong[word.id]?.reviewedAt ? "복습 확인됨" : "복습 완료"}</button></article>
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
      <div className="csat-stats"><article><span>오늘 학습</span><b>{learnedToday}</b><small>단어</small></article><article><span>최근 점수</span><b>{latest ? `${latest.score}/${latest.total}` : "-"}</b><small>오늘 테스트</small></article><article><span>오답</span><b>{Object.values(progress.wrong).filter((history) => !history.resolvedAt).length}</b><small>복습 대기</small></article></div>
      <h3 className="csat-progress-title">시리즈별 진행률</h3>
      <div className="csat-series-progress">{Object.values(SERIES).map((series) => { const learned = series.words.filter((word) => progress.statuses[word.id]).length; const percent = Math.round((learned / series.words.length) * 100); return <article key={series.key}><div><b>{series.label}</b><span>{learned} / {series.words.length}</span></div><i><b style={{ width: `${percent}%` }} /></i><small>{percent}%</small></article>; })}</div>
      <h3 className="csat-progress-title">최근 테스트</h3>
      {progress.tests.length ? <ul className="csat-history">{[...progress.tests].reverse().slice(0, 8).map((test, index) => <li key={`${test.date}-${index}`}><span>{test.date}</span><b>{SERIES[test.series]?.label || test.series} · Day {test.day}</b><em>{test.score} / {test.total}</em></li>)}</ul> : <EmptyState title="아직 테스트 기록이 없습니다." />}
    </section>
  );
}

function CsatReviewCoach({ progress, updateProgress }) {
  const wrongEntries = Object.entries(progress.wrong)
    .map(([id, history]) => ({ word: getWordById(id), history }))
    .filter((item) => item.word)
    .sort((a, b) => new Date(b.history.lastWrongAt || 0) - new Date(a.history.lastWrongAt || 0));
  const [open, setOpen] = useState(false);
  const [queueIndex, setQueueIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState("");
  const current = wrongEntries[queueIndex % Math.max(1, wrongEntries.length)];
  const question = useMemo(() => current ? buildQuestions([current.word], SERIES[current.word.series].words)[0] : null, [current?.word.id]);

  useEffect(() => {
    if (!wrongEntries.length) return undefined;
    const timer = window.setInterval(() => setOpen(true), 60000);
    return () => window.clearInterval(timer);
  }, [wrongEntries.length]);

  function answer() {
    if (selected === null || !question) return;
    const correct = selected === question.answerIndex;
    if (!correct) {
      setFeedback("아직 아니에요. 다시 풀어보세요.");
      updateProgress((currentProgress) => ({
        ...currentProgress,
        wrong: {
          ...currentProgress.wrong,
          [question.word.id]: {
            ...currentProgress.wrong[question.word.id],
            count: (currentProgress.wrong[question.word.id]?.count || 0) + 1,
            lastWrongAt: new Date().toISOString(),
          },
        },
      }));
      setSelected(null);
      return;
    }

    setFeedback("정답이에요. 오답 이력은 다음 반복 학습을 위해 보관할게요.");
    updateProgress((currentProgress) => ({
      ...currentProgress,
      wrong: {
        ...currentProgress.wrong,
        [question.word.id]: {
          ...currentProgress.wrong[question.word.id],
          lastCoachCorrectAt: new Date().toISOString(),
          coachCorrectCount: (currentProgress.wrong[question.word.id]?.coachCorrectCount || 0) + 1,
        },
      },
    }));
  }

  function nextQuestion() {
    setQueueIndex((index) => (index + 1) % wrongEntries.length);
    setSelected(null);
    setFeedback("");
  }

  if (!wrongEntries.length || !question) return null;

  return (
    <aside className={`csat-review-coach ${open ? "open" : ""}`} aria-label="수능 오답 복습 코치">
      <button type="button" className="csat-coach-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span>오답 코치</span><em>{wrongEntries.length}</em>
      </button>
      {open ? <section>
        <header><div><small>REVIEW COACH</small><b>잠깐, 오답 한 문제 풀어볼까요?</b></div><button type="button" onClick={() => setOpen(false)} aria-label="오답 코치 닫기">×</button></header>
        <p>{question.label}</p>
        <h3>{question.prompt}</h3>
        <div className="csat-coach-choices">{question.choices.map((choice, index) => <button type="button" className={selected === index ? "selected" : ""} onClick={() => { setSelected(index); setFeedback(""); }} key={`${choice}-${index}`}>{index + 1}. {choice}</button>)}</div>
        {feedback ? <p className={selected === question.answerIndex ? "success" : "retry"} role="status">{feedback}</p> : null}
        <footer><button type="button" onClick={answer} disabled={selected === null}>확인</button>{feedback.startsWith("정답") ? <button type="button" onClick={nextQuestion}>다음 오답</button> : null}</footer>
      </section> : null}
    </aside>
  );
}

function EmptyState({ title, description }) {
  return <div className="csat-empty"><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>;
}
