import { Link } from "react-router-dom";
import SiteShell from "../components/SiteShell.jsx";

const notices = [
  "보호된 메뉴는 로그인한 사용자만 이용할 수 있습니다.",
  "공용 기기에서는 이용 후 반드시 로그아웃해 주세요.",
  "서비스 관련 변경 사항은 업데이트 메뉴에서 확인할 수 있습니다.",
];

export default function Home() {
  return (
    <SiteShell>
      <main className="home-page">
        <section className="hero" aria-labelledby="home-title">
          <p className="eyebrow">INTERNAL PORTAL</p>
          <h1 id="home-title">업무 지원 포털</h1>
          <p>필요한 메뉴와 운영 안내를 한곳에서 확인하세요.</p>
          <Link to="/news">업데이트 확인</Link>
        </section>

        <section aria-labelledby="quick-links-title">
          <h2 id="quick-links-title">빠른가기</h2>
          <div className="learning-grid">
            <article>
              <span>01</span>
              <h2>뉴스 및 업데이트</h2>
              <p>서비스 운영과 관련된 최신 안내를 확인합니다.</p>
              <Link to="/news">목록 보기</Link>
            </article>
            <article>
              <span>02</span>
              <h2>주요 공지</h2>
              <p>현재 확인이 필요한 공지와 이용 기준을 살펴봅니다.</p>
              <a href="#notices">공지 확인</a>
            </article>
            <article>
              <span>03</span>
              <h2>이용 안내</h2>
              <p>계정 보호와 안전한 서비스 이용 방법을 확인합니다.</p>
              <a href="#notices">안내 확인</a>
            </article>
          </div>
        </section>

        <section id="notices" className="reader" aria-labelledby="notices-title">
          <p className="eyebrow">NOTICE</p>
          <h1 id="notices-title">공지 및 이용 안내</h1>
          <div className="article-body">
            <ul>
              {notices.map((notice) => <li key={notice}>{notice}</li>)}
            </ul>
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
