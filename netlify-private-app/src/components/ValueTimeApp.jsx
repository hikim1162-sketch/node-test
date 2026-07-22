import { useEffect, useState } from "react";
import valueTimeStylesUrl from "../../../styles/app.css?url";
import UserSelectorModal from "./UserSelectorModal.jsx";
import ArticleImportModal from "./ArticleImportModal.jsx";
import "../legacy-overrides.css";

export default function ValueTimeApp({ page }) {
  const [loadError, setLoadError] = useState(false);
  const [selectorMode, setSelectorMode] = useState(null);
  const [articleImportOpen, setArticleImportOpen] = useState(false);

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

    function registerCsatWordmaster() {
      if (!document.querySelector("#app csat-wordmaster-mode")) return;
      import("../features/csat-vocab/registerCsatWordmasterElement.jsx").catch(() => setLoadError(true));
    }

    const observer = new MutationObserver(registerCsatWordmaster);
    observer.observe(document.querySelector("#app"), { childList: true, subtree: true });
    import("../../../src/app.js").then(registerCsatWordmaster).catch(() => setLoadError(true));
    const openSelector = (event) => setSelectorMode(["normal", "middle", "suneung"].includes(event.detail?.mode) ? event.detail.mode : "normal");
    const openArticleImport = () => setArticleImportOpen(true);
    window.addEventListener("valuetime:request-user", openSelector);
    window.addEventListener("valuetime:request-article-import", openArticleImport);

    return () => {
      window.removeEventListener("valuetime:request-user", openSelector);
      window.removeEventListener("valuetime:request-article-import", openArticleImport);
      observer.disconnect();
      stylesheet.remove();
    };
  }, [page]);

  if (loadError) return <div id="app" />;
  return <><div id="app" /><UserSelectorModal mode={selectorMode} onClose={() => setSelectorMode(null)} /><ArticleImportModal open={articleImportOpen} onClose={() => setArticleImportOpen(false)} /></>;
}
