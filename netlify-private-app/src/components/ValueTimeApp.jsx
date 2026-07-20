import { useEffect, useState } from "react";
import valueTimeStylesUrl from "../../../styles/app.css?url";
import "../legacy-overrides.css";

export default function ValueTimeApp({ page }) {
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = valueTimeStylesUrl;
    stylesheet.dataset.valueTimeStyles = "true";
    document.head.appendChild(stylesheet);

    window.history.replaceState(
      { ...(window.history.state || {}), worthyLife: true, page, newsIndex: null },
      "",
    );

    function addCsatVocabularyNavigation() {
      if (document.documentElement.dataset.audience !== "suneung") return;

      const sidebarNavigation = document.querySelector("#app .sidebar nav");
      if (sidebarNavigation && !sidebarNavigation.querySelector("[data-csat-vocab-link]")) {
        const wordbookLink = document.createElement("a");
        wordbookLink.className = "nav-item csat-vocab-nav-link";
        wordbookLink.href = "/csat-vocab?tab=study";
        wordbookLink.dataset.csatVocabLink = "wordbook";
        wordbookLink.textContent = "수능 단어장";

        const testLink = document.createElement("a");
        testLink.className = "nav-item csat-vocab-nav-link";
        testLink.href = "/csat-vocab?tab=test";
        testLink.dataset.csatVocabLink = "test";
        testLink.textContent = "수능 단어시험";

        sidebarNavigation.append(wordbookLink, testLink);
      }

      const quickMenu = document.querySelector("#app .suneung-quick-menu");
      if (quickMenu && !quickMenu.querySelector("[data-csat-vocab-quick]")) {
        const wordbookLink = document.createElement("a");
        wordbookLink.href = "/csat-vocab?tab=study";
        wordbookLink.dataset.csatVocabQuick = "wordbook";
        wordbookLink.innerHTML = "<span>수능 단어장</span><small>Word Master 학습</small>";

        const testLink = document.createElement("a");
        testLink.href = "/csat-vocab?tab=test";
        testLink.dataset.csatVocabQuick = "test";
        testLink.innerHTML = "<span>수능 단어시험</span><small>학습 후 바로 확인</small>";

        quickMenu.append(wordbookLink, testLink);
      }
    }

    const observer = new MutationObserver(addCsatVocabularyNavigation);
    observer.observe(document.querySelector("#app"), { childList: true, subtree: true });
    import("../../../src/app.js").then(addCsatVocabularyNavigation).catch(() => setLoadError(true));

    return () => {
      observer.disconnect();
      stylesheet.remove();
    };
  }, [page]);

  if (loadError) return <div id="app" />;
  return <div id="app" />;
}
