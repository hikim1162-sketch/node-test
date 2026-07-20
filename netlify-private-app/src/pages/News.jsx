import SiteShell from "../components/SiteShell.jsx";

const updates = [
  {
    title: "서비스 운영 안내",
    description: "서비스 이용에 필요한 기본 운영 기준과 변경 사항을 안내합니다.",
  },
  {
    title: "보안 및 계정 관리",
    description: "계정 보호를 위해 비밀번호와 로그인 상태를 정기적으로 확인해 주세요.",
  },
  {
    title: "정기 점검 안내",
    description: "점검이 예정된 경우 이용 가능 시간과 영향 범위를 이곳에 안내합니다.",
  },
  {
    title: "자료 이용 기준",
    description: "등록된 자료는 내부 이용 목적과 안내된 기준에 맞게 사용해 주세요.",
  },
  {
    title: "문의 처리 안내",
    description: "이용 중 문제가 발생하면 관리자에게 현상과 발생 시점을 전달해 주세요.",
  },
];

export default function News() {
  return (
    <SiteShell>
      <main className="news-page">
        <article className="reader" aria-labelledby="news-title">
          <p className="eyebrow">NEWS &amp; UPDATES</p>
          <h1 id="news-title">뉴스 및 업데이트</h1>
          <div className="meta">
            <span>내부 운영 안내</span>
            <span>{updates.length}개 항목</span>
          </div>
          <div className="progress">
            <span>서비스 운영과 이용에 필요한 안내를 확인하세요.</span>
          </div>
          <section className="article-body" aria-label="업데이트 목록">
            {updates.map((update, index) => (
              <article className="sentence-block" key={update.title}>
                <span>UPDATE {String(index + 1).padStart(2, "0")}</span>
                <h2>{update.title}</h2>
                <p>{update.description}</p>
              </article>
            ))}
          </section>
        </article>
      </main>
    </SiteShell>
  );
}
