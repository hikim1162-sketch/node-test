import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { buildQuestions, getDayWords, getDays, getWordById, SERIES } from "./vocabData.js";
import { loadProgress, resetLearningData, resolveDailyDay, saveProgress, setDailyDay, todayKey } from "./storage.js";
import { vocabularyExamples } from "../../../../data/vocabulary-examples.js";
import "./csat-vocab.css";

const TABS = [
  ["study", "① 빠른 학습"],
  ["saved", "② 저장 단어"],
  ["test", "③ 테스트"],
  ["review", "④ 오답 복습"],
  ["progress", "⑤ 진도/기록"],
];

const bundledNaverExamples = {
  emotion: ["He lost control of his emotions.", "그는 감정을 억제하지 못했다."],
  decrease: ["The number of new students decreased from 210 to 160 this year.", "올해는 신입생 수가 210명에서 160명으로 줄었다."],
  recycle: ["Denmark recycles nearly 85% of its paper.", "덴마크는 종이의 약 85%를 재활용한다."],
  desire: ["She had a strong desire to succeed.", "그녀는 성공하고자 하는 강한 열망이 있었다."],
  negative: ["The crisis had a negative effect on trade.", "그 위기가 무역에 부정적인 영향을 미쳤다."],
  follow: ["He followed her into the house.", "그는 그녀의 뒤를 따라 집 안으로 들어왔다."],
};

function getNaverWordExample(word) {
  const term = String(word?.word_display || "").trim().toLowerCase();
  const entry = vocabularyExamples[term];
  const examples = Array.isArray(entry?.examples) ? entry.examples.filter((item) => item?.exampleSentence) : [];
  const selected = examples.length ? examples[Math.abs(Number(word?.index) || 0) % examples.length] : null;
  const bundled = bundledNaverExamples[term];
  const originalSentence = selected?.exampleSentence || bundled?.[0] || word?.example || "";
  const generated = !originalSentence && Boolean(term);
  return {
    sentence: originalSentence || `The meaning of "${term}" becomes clear from the context.`,
    translation: selected?.exampleTranslation || bundled?.[1] || word?.exampleMeaning || (generated ? `문맥을 통해 "${term}"의 의미를 분명하게 이해할 수 있습니다.` : ""),
    source: selected || bundled ? "네이버 영어사전" : word?.example ? "단어장 기본 예문" : generated ? "수능 단어장 보조 예문" : "",
    sourceUrl: `https://en.dict.naver.com/#/search?query=${encodeURIComponent(term)}`,
    generated,
  };
}

function useNaverWordExample(word) {
  return { ...getNaverWordExample(word), loading: false };
}

export default function CsatVocabPage({ embedded = false, mode = "suneung" }) {
  const isMiddle = mode === "middle";
  const modeLabel = isMiddle ? "중등" : "수능";
  const initialSeries = isMiddle ? "basic" : "csat2000";
  const requestedTab = new URLSearchParams(window.location.search).get("tab");
  const [seriesKey, setSeriesKey] = useState(initialSeries);
  const [day, setDay] = useState(() => resolveDailyDay(initialSeries, getDays(initialSeries), mode));
  const [tab, setTab] = useState(TABS.some(([key]) => key === requestedTab) ? requestedTab : "study");
  const [progress, setProgress] = useState(() => loadProgress(mode));
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [monthlyTest, setMonthlyTest] = useState(null);
  const [monthlyFlowWrongIds, setMonthlyFlowWrongIds] = useState([]);

  const days = useMemo(() => getDays(seriesKey), [seriesKey]);
  const availableSeries = useMemo(() => isMiddle ? [SERIES.basic] : Object.values(SERIES), [isMiddle]);
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

  useEffect(() => {
    const syncDayWithDate = () => {
      const nextDay = resolveDailyDay(seriesKey, days, mode);
      setDay((currentDay) => currentDay === nextDay ? currentDay : nextDay);
    };
    syncDayWithDate();
    const timer = window.setInterval(syncDayWithDate, 60000);
    return () => window.clearInterval(timer);
  }, [seriesKey, days, mode]);

  function updateProgress(updater) {
    setProgress((current) => {
      const next = updater(current);
      saveProgress(next, mode);
      return next;
    });
  }

  function changeSeries(nextSeries) {
    const nextDays = getDays(nextSeries);
    setSeriesKey(nextSeries);
    setDay(resolveDailyDay(nextSeries, nextDays, mode));
    setTab("study");
  }

  function changeDay(nextDay) {
    if (!days.includes(Number(nextDay))) return;
    setDay(Number(nextDay));
    setDailyDay(seriesKey, Number(nextDay), mode);
    setTab("study");
  }

  function resetAllLearning() {
    setResetConfirmOpen(true);
  }

  function confirmResetAllLearning() {
    const firstDay = days[0] || 1;
    setProgress(resetLearningData(mode));
    setDay(firstDay);
    setDailyDay(seriesKey, firstDay, mode);
    setTab("study");
    setResetConfirmOpen(false);
  }

  function openMonthlyTest(nextProgress = progress) {
    const today = todayKey();
    const monthStart = `${today.slice(0, 7)}-01`;
    const yesterday = new Date(`${today}T12:00:00`);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toLocaleDateString("sv-SE");
    const sourceWords = availableSeries.flatMap((series) => series.words);
    const monthlyWords = Object.entries(nextProgress.statuses)
      .filter(([, status]) => status.date >= monthStart && status.date <= today && status.status !== "known")
      .map(([id]) => getWordById(id))
      .filter((word) => word && availableSeries.some((series) => series.key === word.series));
    const yesterdayWrong = Object.entries(nextProgress.wrong)
      .filter(([, history]) => !history.resolvedAt && history.lastWrongAt?.startsWith(yesterdayKey))
      .map(([id]) => getWordById(id))
      .filter(Boolean);
    const savedReviewWords = Object.entries(nextProgress.wrong)
      .filter(([, history]) => !history.resolvedAt)
      .map(([id]) => getWordById(id))
      .filter(Boolean);
    const bookmarkedWords = nextProgress.savedWords
      .map((id) => getWordById(id))
      .filter((word) => word && nextProgress.statuses[word.id]?.date >= monthStart && nextProgress.statuses[word.id]?.status !== "known");
    const priorityIds = new Set([...yesterdayWrong, ...bookmarkedWords, ...savedReviewWords].map((word) => word.id));
    const shuffle = (items) => [...items].sort(() => Math.random() - 0.5);
    const candidates = [
      ...shuffle(yesterdayWrong),
      ...shuffle(bookmarkedWords),
      ...shuffle(savedReviewWords),
      ...shuffle(monthlyWords.filter((word) => !priorityIds.has(word.id))),
    ].filter((word, index, items) => items.findIndex((item) => item.id === word.id) === index);
    const targets = candidates.slice(0, 20);
    if (!targets.length) {
      setTab("progress");
      return;
    }
    setMonthlyTest({
      questions: buildQuestions(shuffle(targets), sourceWords),
      index: 0,
      answers: [],
      selected: null,
      revealed: false,
      finished: false,
    });
  }

  function completeQuickStudy() {
    setTab("saved");
  }

  function completeMonthlyTestFlow(completedTest) {
    const wrongIds = completedTest.answers.filter((answer) => !answer.correct).map((answer) => answer.id);
    setMonthlyTest(null);
    setMonthlyFlowWrongIds(wrongIds);
    setTab(wrongIds.length ? "review" : "progress");
  }

  return (
    <main className="csat-vocab-app">
      <header className="csat-vocab-header">
        <div>
          {embedded ? <span className="csat-back">{modeLabel} 영어 · 단어장</span> : <Link to="/" className="csat-back">← {modeLabel}모드</Link>}
          <span className="csat-mode-label">{modeLabel}모드</span>
        </div>
        <div className="csat-series" aria-label="단어 시리즈 선택">
          {availableSeries.map((series) => (
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
        <button type="button" className="csat-reset-learning" onClick={resetAllLearning}>※ 전체 학습 내용 초기화</button>
        <span>{SERIES[seriesKey].label} · Day {day} · {dayWords.length}단어</span>
      </section>

      <nav className="csat-tabs" aria-label={`${modeLabel} 단어 훈련 메뉴`}>
        {TABS.map(([key, label]) => (
          <button type="button" className={tab === key ? "active" : ""} onClick={() => setTab(key)} aria-current={tab === key ? "page" : undefined} key={key}>
            {label}
            {key === "review" && pendingWrongCount > 0 ? <em>{pendingWrongCount}</em> : null}
          </button>
        ))}
      </nav>

      {tab === "study" && <QuickStudy key={`${seriesKey}-${day}`} words={dayWords.slice(0, 10)} progress={progress} updateProgress={updateProgress} startTest={() => setTab("test")} onDayComplete={completeQuickStudy} />}
      {tab === "test" && <TestPanel key={`${seriesKey}-${day}`} words={dayWords.slice(0, 10)} sourceWords={SERIES[seriesKey].words} seriesKey={seriesKey} day={day} progress={progress} updateProgress={updateProgress} openReview={() => setTab("review")} />}
      {tab === "saved" && <SavedWordsPanel progress={progress} updateProgress={updateProgress} onComplete={() => openMonthlyTest(progress)} />}
      {tab === "review" && <ReviewPanel progress={progress} sourceWords={SERIES[seriesKey].words} seriesKey={seriesKey} day={day} updateProgress={updateProgress} focusIds={monthlyFlowWrongIds} onReviewComplete={() => { setMonthlyFlowWrongIds([]); setTab("progress"); }} />}
      {tab === "progress" && <ProgressPanel progress={progress} seriesList={availableSeries} />}
      <DayPagination days={days} day={day} onChange={changeDay} />
      {resetConfirmOpen ? (
        <div className="csat-reset-dialog-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setResetConfirmOpen(false)}>
          <section className="csat-reset-dialog" role="alertdialog" aria-modal="true" aria-labelledby="csat-reset-title" aria-describedby="csat-reset-description">
            <span aria-hidden="true">!</span>
            <h2 id="csat-reset-title">전체 삭제하시겠습니까?</h2>
            <p id="csat-reset-description">{modeLabel} 단어장의 암기 상태, 오답, 테스트 기록과 Day 진행이 모두 삭제되며 복구할 수 없습니다.</p>
            <div>
              <button type="button" className="cancel" onClick={() => setResetConfirmOpen(false)}>취소</button>
              <button type="button" className="confirm" onClick={confirmResetAllLearning}>전체 삭제</button>
            </div>
          </section>
        </div>
      ) : null}
      {monthlyTest ? <MonthlyVocabularyTest test={monthlyTest} setTest={setMonthlyTest} progress={progress} updateProgress={updateProgress} seriesKey={seriesKey} day={day} retry={() => openMonthlyTest(progress)} completeFlow={completeMonthlyTestFlow} /> : null}
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

function QuickStudy({ words, progress, updateProgress, startTest, onDayComplete }) {
  const [index, setIndex] = useState(0);
  const [meaningVisible, setMeaningVisible] = useState(false);
  const [exampleMeaningVisible, setExampleMeaningVisible] = useState(false);
  const word = words[index];
  const completed = words.filter((item) => progress.statuses[item.id]).length;
  const saved = progress.savedWords.includes(word?.id);
  const example = useNaverWordExample(word);

  useEffect(() => {
    setIndex(0);
    setMeaningVisible(false);
    setExampleMeaningVisible(false);
  }, [words[0]?.id]);

  if (!word) return <EmptyState title="이 Day에는 표시할 단어가 없습니다." />;

  function rate(status) {
    const nextProgress = {
      ...progress,
      statuses: { ...progress.statuses, [word.id]: { status, date: todayKey(), updatedAt: new Date().toISOString() } },
      savedWords: status === "known" || progress.savedWords.includes(word.id)
        ? progress.savedWords
        : [...progress.savedWords, word.id],
    };
    const completesDay = !progress.statuses[word.id] && completed + 1 >= words.length;
    updateProgress(() => nextProgress);
    if (completesDay) onDayComplete(nextProgress);
    if (index < words.length - 1) {
      setIndex(index + 1);
      setMeaningVisible(false);
      setExampleMeaningVisible(false);
    }
  }

  function toggleSaved() {
    updateProgress((current) => ({
      ...current,
      savedWords: current.savedWords.includes(word.id)
        ? current.savedWords.filter((id) => id !== word.id)
        : [...current.savedWords, word.id],
    }));
  }

  return (
    <section className="csat-workspace">
      <div className="csat-section-head">
        <div><span>QUICK STUDY</span><h2>오늘의 10단어</h2></div>
        <b>{completed} / {words.length}</b>
      </div>
      <div className="csat-progress-track"><i style={{ width: `${words.length ? (completed / words.length) * 100 : 0}%` }} /></div>
      <article className="csat-word-card">
        <div className="csat-word-card-top"><small>{index + 1} / {words.length}</small><button type="button" className={`csat-save-word ${saved ? "saved" : ""}`} onClick={toggleSaved} aria-pressed={saved}>{saved ? "✓ 저장됨" : "＋ 저장"}</button></div>
        <h3>{word.word_display}</h3>
        {word.is_corrected ? <p className="csat-correction">원본 표기: {word.word_raw} · 교정 표시</p> : null}
        <button type="button" className="csat-meaning-toggle" onClick={() => setMeaningVisible((visible) => !visible)} aria-expanded={meaningVisible}>
          {meaningVisible ? "뜻 숨기기" : "뜻 보기"}
        </button>
        {meaningVisible ? <p>{word.meaning_display}</p> : <p className="csat-meaning-covered">먼저 단어의 뜻을 떠올려 보세요.</p>}
        {example.sentence ? <blockquote className="csat-quick-example"><span>EXAMPLE · {example.source}</span><b>{example.sentence}</b>{example.translation ? <button type="button" onClick={() => setExampleMeaningVisible((visible) => !visible)} aria-expanded={exampleMeaningVisible}>{exampleMeaningVisible ? "해석 숨기기" : "해석 보기"}</button> : null}{exampleMeaningVisible && example.translation ? <p>{example.translation}</p> : null}<a href={example.sourceUrl} target="_blank" rel="noopener noreferrer">네이버에서 더 보기</a></blockquote> : <p className="csat-example-empty">네이버 사전에 등록된 예문이 없습니다.</p>}
        <div className="csat-rating-actions">
          <button type="button" onClick={() => rate("known")}>암기함</button>
          <button type="button" onClick={() => rate("confused")}>헷갈림</button>
          <button type="button" onClick={() => rate("unknown")}>모름</button>
        </div>
      </article>
      <div className="csat-card-navigation">
        <button type="button" onClick={() => { setIndex(Math.max(0, index - 1)); setMeaningVisible(false); setExampleMeaningVisible(false); }} disabled={index === 0}>이전</button>
        <div>{words.map((item, itemIndex) => <button type="button" className={`${itemIndex === index ? "active" : ""} ${progress.statuses[item.id] ? "rated" : ""}`} onClick={() => { setIndex(itemIndex); setMeaningVisible(false); setExampleMeaningVisible(false); }} aria-label={`${itemIndex + 1}번 단어`} key={item.id} />)}</div>
        {completed === words.length ? <button type="button" className="primary" onClick={() => onDayComplete(progress)}>저장 단어로</button> : <button type="button" onClick={() => { setIndex(Math.min(words.length - 1, index + 1)); setMeaningVisible(false); }} disabled={index === words.length - 1}>다음</button>}
      </div>
    </section>
  );
}

function MonthlyVocabularyTest({ test, setTest, progress, updateProgress, seriesKey, day, retry, completeFlow }) {
  const question = test.questions[test.index];
  const score = test.answers.filter((answer) => answer.correct).length;

  function choose(choiceIndex) {
    if (test.revealed) return;
    if (!question) return;
    const correct = choiceIndex === question.answerIndex;
    const nextAnswers = [...test.answers, { id: question.word.id, correct }];
    setTest({ ...test, selected: choiceIndex, answers: nextAnswers, revealed: true });
    if (!correct) {
      updateProgress((current) => ({
        ...current,
        wrong: {
          ...current.wrong,
          [question.word.id]: {
            ...current.wrong[question.word.id],
            count: (current.wrong[question.word.id]?.count || 0) + 1,
            lastWrongAt: new Date().toISOString(),
            resolvedAt: null,
            reviewedAt: null,
            word: question.word.word_display,
            meaning: question.word.meaning_display,
            series: question.word.series,
            day: question.word.day,
            source: "monthly-auto-test",
          },
        },
      }));
    }
  }

  function nextQuestion() {
    if (!test.revealed) return;
    if (test.index === test.questions.length - 1) {
      const finalScore = test.answers.filter((answer) => answer.correct).length;
      updateProgress((current) => ({
        ...current,
        tests: [...current.tests, { date: todayKey(), series: seriesKey, day, score: finalScore, total: test.questions.length, mode: "monthly-auto" }].slice(-100),
      }));
      completeFlow({ ...test, finished: true });
      return;
    }
    setTest({ ...test, index: test.index + 1, selected: null, revealed: false });
  }

  if (test.finished) {
    return (
      <div className="csat-monthly-test-backdrop">
        <section className="csat-monthly-test result" role="dialog" aria-modal="true" aria-labelledby="csat-monthly-test-title">
          <button type="button" className="close" onClick={() => completeFlow(test)} aria-label="닫기">×</button>
          <span>MONTHLY WORD TEST</span>
          <h2 id="csat-monthly-test-title">오늘의 누적 단어 시험 완료</h2>
          <strong>{score}<small> / {test.questions.length}</small></strong>
          <p>틀린 단어는 저장했으며 다음 날 시험에 먼저 출제됩니다.</p>
          <div><button type="button" onClick={retry}>새 문제로 다시 풀기</button><button type="button" className="primary" onClick={() => completeFlow(test)}>{test.answers.some((answer) => !answer.correct) ? "오답 복습으로" : "진도/기록 보기"}</button></div>
        </section>
      </div>
    );
  }

  const correctChoice = test.revealed ? question.answerIndex : -1;
  return (
    <div className="csat-monthly-test-backdrop">
      <section className="csat-monthly-test" role="dialog" aria-modal="true" aria-labelledby="csat-monthly-test-title">
        <button type="button" className="close" onClick={() => setTest(null)} aria-label="닫기">×</button>
        <header><div><span>MONTHLY WORD TEST</span><h2 id="csat-monthly-test-title">수능 누적 단어 시험</h2></div><b>{test.index + 1} / {test.questions.length}</b></header>
        <div className="progress"><i style={{ width: `${((test.index + 1) / test.questions.length) * 100}%` }} /></div>
        <p className="range">{new Date().getMonth() + 1}월 1일–오늘 · 암기 완료 제외 · 오답 우선</p>
        <article><small>{question.label}</small><h3>{question.prompt}</h3></article>
        <div className="choices">{question.choices.map((choice, choiceIndex) => {
          const className = [
            test.selected === choiceIndex ? "selected" : "",
            correctChoice === choiceIndex ? "correct" : "",
            test.revealed && test.selected === choiceIndex && choiceIndex !== question.answerIndex ? "wrong" : "",
          ].filter(Boolean).join(" ");
          return <button type="button" className={className} onClick={() => choose(choiceIndex)} key={`${choice}-${choiceIndex}`}><i>{choiceIndex + 1}</i>{choice}</button>;
        })}</div>
        {test.revealed ? <p className={test.selected === question.answerIndex ? "feedback correct" : "feedback wrong"}>{test.selected === question.answerIndex ? "정답입니다." : `정답: ${question.choices[question.answerIndex]}`}</p> : null}
        {test.revealed ? <WordAnswerExample word={question.word} /> : null}
        <footer><span>{test.revealed ? "오답은 내일 다시 출제됩니다." : "보기를 누르면 바로 정답이 표시됩니다."}</span>{test.revealed ? <button type="button" className="primary" onClick={nextQuestion}>{test.index === test.questions.length - 1 ? test.answers.some((answer) => !answer.correct) ? "오답 복습으로" : "진도/기록 보기" : "다음 문제"}</button> : null}</footer>
      </section>
    </div>
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

  function confirmAnswer(choiceIndex = selected) {
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
    if (choiceIndex === null) return;
    const correct = choiceIndex === question.answerIndex;
    if (!correct) {
      setSelected(choiceIndex);
      setRevealed({ correct: false, selected: choiceIndex });
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
    setSelected(choiceIndex);
    setRevealed({ correct: true, selected: choiceIndex });
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
          return <button type="button" className={className} onClick={() => confirmAnswer(choiceIndex)} disabled={Boolean(revealed)} key={`${choice}-${choiceIndex}`}><i>{choiceIndex + 1}</i>{choice}</button>;
        })}</div>
        {revealed ? <div className={`csat-answer-feedback ${revealed.correct ? "correct" : "wrong"}`} role="status"><b>{revealed.correct ? "정답입니다." : "오답입니다."}</b><span>{revealed.correct ? `정답: ${question.answerIndex + 1}번 · ${question.choices[question.answerIndex]}` : "다시 풀어보세요."}</span></div> : null}
        {revealed ? <WordAnswerExample word={question.word} /> : null}
        {revealed ? <button type="button" className="csat-submit" onClick={() => confirmAnswer()}>{!revealed.correct ? "다시 풀기" : answers.length === questions.length ? "결과 보기" : "다음 문제"}</button> : <p className="csat-instant-answer-guide">보기를 누르면 바로 정답이 표시됩니다.</p>}
      </article>
    </section>
  );
}

function WordAnswerExample({ word }) {
  const example = useNaverWordExample(word);
  if (example.loading) return <section className="csat-answer-example empty"><span>EXAMPLE</span><p>네이버 예문을 불러오는 중...</p></section>;
  if (!example.sentence) return <section className="csat-answer-example empty"><span>EXAMPLE</span><p>네이버 사전에 등록된 예문이 없습니다.</p></section>;
  return (
    <section className="csat-answer-example">
      <span>EXAMPLE · {example.source}</span>
      <b>{example.sentence}</b>
      {example.translation ? <p>{example.translation}</p> : null}
      <a href={example.sourceUrl} target="_blank" rel="noopener noreferrer">네이버에서 더 보기</a>
    </section>
  );
}

function TestModeSwitch({ mode, reset, hasWrong }) {
  return <div className="csat-test-switch"><button type="button" className={mode === "day" ? "active" : ""} onClick={() => reset("day")}>현재 Day</button><button type="button" className={mode === "learned" ? "active" : ""} onClick={() => reset("learned")}>오늘 학습</button><button type="button" className={mode === "wrong" ? "active" : ""} onClick={() => reset("wrong")} disabled={!hasWrong}>오답</button><button type="button" className={mode === "random" ? "active" : ""} onClick={() => reset("random")}>랜덤</button></div>;
}

function SavedWordsPanel({ progress, updateProgress, onComplete }) {
  const savedWords = progress.savedWords.map(getWordById).filter(Boolean);
  const [openMeanings, setOpenMeanings] = useState(() => new Set());
  const [openExamples, setOpenExamples] = useState(() => new Set());

  function toggleSet(setter, id) {
    setter((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <section className="csat-workspace">
      <div className="csat-section-head"><div><span>MY SAVED WORDS</span><h2>저장한 단어</h2></div><b>{savedWords.length}개</b></div>
      {savedWords.length ? <div className="csat-saved-word-list">{savedWords.map((word) => (
        <SavedWordCard key={word.id} word={word} updateProgress={updateProgress} openMeanings={openMeanings} openExamples={openExamples} toggleSet={toggleSet} setOpenMeanings={setOpenMeanings} setOpenExamples={setOpenExamples} />
      ))}</div> : <EmptyState title="저장한 단어가 없습니다." description="이번 Day를 모두 기억한 경우 바로 테스트로 진행할 수 있습니다." />}
      <section className="csat-saved-complete"><div><b>저장 단어 확인을 마쳤나요?</b><p>학습 완료를 누르면 이번 달 누적 단어 테스트가 시작됩니다.</p></div><button type="button" className="primary" onClick={onComplete}>저장 단어 학습 완료</button></section>
    </section>
  );
}

function SavedWordCard({ word, updateProgress, openMeanings, openExamples, toggleSet, setOpenMeanings, setOpenExamples }) {
  const example = useNaverWordExample(word);
  return (
    <article>
      <header><div><span>{SERIES[word.series]?.label} · Day {word.day}</span><h3>{word.word_display}</h3></div><button type="button" onClick={() => updateProgress((current) => ({ ...current, savedWords: current.savedWords.filter((id) => id !== word.id) }))}>저장 해제</button></header>
      <button type="button" className="meaning" onClick={() => toggleSet(setOpenMeanings, word.id)}>{openMeanings.has(word.id) ? word.meaning_display : "뜻 보기"}</button>
      {example.loading ? <blockquote><small>네이버 예문을 불러오는 중...</small></blockquote> : null}
      {example.sentence ? <blockquote><small>{example.source}</small><b>{example.sentence}</b>{example.translation ? <button type="button" onClick={() => toggleSet(setOpenExamples, word.id)}>{openExamples.has(word.id) ? "해석 숨기기" : "해석 보기"}</button> : null}{openExamples.has(word.id) ? <p>{example.translation}</p> : null}<a href={example.sourceUrl} target="_blank" rel="noopener noreferrer">네이버에서 더 보기</a></blockquote> : null}
      {!example.loading && !example.sentence ? <blockquote><small>등록된 네이버 예문이 없습니다.</small><a href={example.sourceUrl} target="_blank" rel="noopener noreferrer">네이버에서 검색하기</a></blockquote> : null}
    </article>
  );
}

function ReviewPanel({ progress, sourceWords, seriesKey, day, updateProgress, focusIds = [], onReviewComplete }) {
  const reviewWords = Object.keys(progress.wrong).map(getWordById).filter(Boolean);
  const statusWords = Object.entries(progress.statuses).filter(([, value]) => value.status !== "known").map(([id]) => getWordById(id)).filter(Boolean);
  const allReviewWords = [...reviewWords, ...statusWords].filter((word, index, words) => words.findIndex((item) => item.id === word.id) === index);
  const combined = focusIds.length ? allReviewWords.filter((word) => focusIds.includes(word.id)) : allReviewWords;
  const [visibleMeanings, setVisibleMeanings] = useState(() => new Set());

  function toggleMeaning(wordId) {
    setVisibleMeanings((current) => {
      const next = new Set(current);
      if (next.has(wordId)) next.delete(wordId);
      else next.add(wordId);
      return next;
    });
  }

  function toggleReviewed(word) {
    updateProgress((current) => {
      const wrong = { ...current.wrong };
      const previous = wrong[word.id] || { count: 0, word: word.word_display, meaning: word.meaning_display, series: word.series, day: word.day };
      wrong[word.id] = previous.reviewedAt
        ? { ...previous, reviewedAt: null }
        : { ...previous, reviewedAt: new Date().toISOString(), reviewCount: (previous.reviewCount || 0) + 1 };
      if (
        focusIds.length
        && focusIds.every((id) => id === word.id ? Boolean(wrong[id]?.reviewedAt) : Boolean(current.wrong[id]?.reviewedAt))
      ) {
        queueMicrotask(() => onReviewComplete?.());
      }
      return { ...current, wrong };
    });
  }

  if (!combined.length) return <section className="csat-workspace"><EmptyState title="아직 복습할 단어가 없습니다." description="테스트 오답과 ‘헷갈림·모름’ 단어가 여기에 자동으로 모입니다." /></section>;

  return (
    <section className="csat-workspace">
      <div className="csat-section-head"><div><span>WEAK WORDS</span><h2>오답과 헷갈린 단어</h2></div><b>{combined.length}개</b></div>
      <div className="csat-review-list">{combined.map((word) => (
        <article className={`${progress.wrong[word.id]?.reviewedAt ? "reviewed" : ""} ${progress.wrong[word.id]?.resolvedAt ? "resolved" : ""}`} key={word.id}><div><span>{SERIES[word.series].label} · Day {word.day}</span><h3>{word.word_display}</h3><div className="csat-review-meaning"><p className={visibleMeanings.has(word.id) ? "" : "covered"}>{visibleMeanings.has(word.id) ? word.meaning_display : "뜻을 먼저 떠올려 보세요."}</p><button type="button" onClick={() => toggleMeaning(word.id)} aria-expanded={visibleMeanings.has(word.id)}>{visibleMeanings.has(word.id) ? "뜻 숨기기" : "뜻 보기"}</button></div></div><em>{progress.wrong[word.id]?.resolvedAt ? `해결됨 · 오답 ${progress.wrong[word.id].count}회` : progress.wrong[word.id] ? `오답 ${progress.wrong[word.id].count}회` : progress.statuses[word.id]?.status === "unknown" ? "모름" : "헷갈림"}</em><button type="button" aria-pressed={Boolean(progress.wrong[word.id]?.reviewedAt)} onClick={() => toggleReviewed(word)}>{progress.wrong[word.id]?.reviewedAt ? "복습 확인됨" : "복습 완료"}</button></article>
      ))}</div>
    </section>
  );
}

function ProgressPanel({ progress, seriesList = Object.values(SERIES) }) {
  const today = todayKey();
  const learnedToday = Object.values(progress.statuses).filter((item) => item.date === today || item.updatedAt?.startsWith(today)).length;
  const testsToday = progress.tests.filter((test) => test.date === today);
  const latest = testsToday.at(-1);

  return (
    <section className="csat-workspace">
      <div className="csat-section-head"><div><span>MY PROGRESS</span><h2>오늘의 훈련 기록</h2></div></div>
      <div className="csat-stats"><article><span>오늘 학습</span><b>{learnedToday}</b><small>단어</small></article><article><span>최근 점수</span><b>{latest ? `${latest.score}/${latest.total}` : "-"}</b><small>오늘 테스트</small></article><article><span>오답</span><b>{Object.values(progress.wrong).filter((history) => !history.resolvedAt).length}</b><small>복습 대기</small></article></div>
      <h3 className="csat-progress-title">시리즈별 진행률</h3>
      <div className="csat-series-progress">{seriesList.map((series) => { const learned = series.words.filter((word) => progress.statuses[word.id]).length; const percent = Math.round((learned / series.words.length) * 100); return <article key={series.key}><div><b>{series.label}</b><span>{learned} / {series.words.length}</span></div><i><b style={{ width: `${percent}%` }} /></i><small>{percent}%</small></article>; })}</div>
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
