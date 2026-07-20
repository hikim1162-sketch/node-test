import { Link } from "react-router-dom";
import SiteShell from "../components/SiteShell.jsx";

export default function Home() {
  return (
    <SiteShell>
      <main className="home-page">
        <section className="hero">
          <p className="eyebrow">TODAY'S FAMILY ENGLISH</p>
          <h1>작은 영어 한 걸음이<br />내일을 바꿔요.</h1>
          <p>매일 부담 없이 읽고, 듣고, 한 문장씩 익혀보세요.</p>
          <Link to="/news">Start Today →</Link>
        </section>
        <section className="learning-grid">
          <article>
            <span>01</span>
            <h2>오늘의 영어 뉴스</h2>
            <p>영어 원문을 먼저 읽고 필요한 문장의 뜻만 확인해요.</p>
            <Link to="/news">기사 읽기</Link>
          </article>
          <article>
            <span>02</span>
            <h2>오늘의 한 문장</h2>
            <p>가족이 함께 쓸 수 있는 짧은 표현을 익혀요.</p>
            <button type="button">준비 중</button>
          </article>
          <article>
            <span>03</span>
            <h2>저장한 표현</h2>
            <p>다시 보고 싶은 문장만 차분하게 복습해요.</p>
            <button type="button">준비 중</button>
          </article>
        </section>
      </main>
    </SiteShell>
  );
}
