import SiteShell from "../components/SiteShell.jsx";

const sentences = [
  ["Small daily habits can create meaningful changes over time.", "매일의 작은 습관은 시간이 지나면서 의미 있는 변화를 만들 수 있습니다."],
  ["For language learners, consistency is often more valuable than long, irregular study sessions.", "언어 학습자에게는 길고 불규칙한 학습보다 꾸준함이 더 가치 있는 경우가 많습니다."],
  ["Reading one short article each day helps new words become familiar in context.", "매일 짧은 기사 하나를 읽으면 새로운 단어를 문맥 속에서 익숙하게 만들 수 있습니다."],
];

function Sentence({ number, english, korean }) {
  return (
    <section className="sentence-block">
      <span>SENTENCE {String(number).padStart(2, "0")}</span>
      <p>{english}</p>
      <details>
        <summary>Show Meaning</summary>
        <div><b>KOREAN MEANING</b><p>{korean}</p></div>
      </details>
      <details>
        <summary>Expression Note</summary>
        <div><b>LEARNING NOTE</b><p>핵심 표현을 문장 전체의 자연스러운 뜻과 함께 익혀보세요.</p></div>
      </details>
    </section>
  );
}

export default function News() {
  return (
    <SiteShell>
      <main className="news-page">
        <article className="reader">
          <p className="eyebrow">GUIDED READING</p>
          <h1>Why Small Steps Matter in Learning</h1>
          <div className="meta">
            <b>Value Time Learning Desk</b>
            <span>July 20, 2026</span><span>Easy</span><span>4 min</span>
          </div>
          <div className="progress">
            <span>English first · 뜻은 필요할 때만 확인하세요.</span>
            <i><b /></i>
          </div>
          <section className="article-body">
            {sentences.map(([english, korean], index) => (
              <Sentence key={english} number={index + 1} english={english} korean={korean} />
            ))}
          </section>
        </article>
      </main>
    </SiteShell>
  );
}
