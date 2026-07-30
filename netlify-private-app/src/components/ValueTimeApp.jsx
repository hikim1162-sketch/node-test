import { useEffect, useState } from "react";
import valueTimeStylesUrl from "../../../styles/app.css?url";
import UserSelectorModal from "./UserSelectorModal.jsx";
import ArticleImportModal from "./ArticleImportModal.jsx";
import SettingsModal from "./SettingsModal.jsx";
import { applyStudyDisplayPreferences, loadUserSettings } from "../settings/settingsStorage.js";
import { applyUiLanguage, observeUiLanguage } from "../settings/uiLanguage.js";
import "../legacy-overrides.css";

export default function ValueTimeApp({ page }) {
  const [loadError, setLoadError] = useState(false);
  const [selectorMode, setSelectorMode] = useState(null);
  const [articleImportRequest, setArticleImportRequest] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = valueTimeStylesUrl;
    stylesheet.dataset.valueTimeStyles = "true";
    document.head.appendChild(stylesheet);

    const hashPage = window.location.hash.replace(/^#/, "").split("/")[0];
    const queryPage = new URLSearchParams(window.location.search).get("page") || "";
    const directCandidate = queryPage || hashPage;
    const directPage = ["calendar", "blog", "journal", "upgrade", "synonyms"].includes(directCandidate) ? directCandidate : page;
    window.history.replaceState(
      { ...(window.history.state || {}), worthyLife: true, page: directPage, newsIndex: null },
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
    const openArticleImport = (event) => setArticleImportRequest({
      requestId: Date.now(),
      sourceUrl: event.detail?.sourceUrl || "",
      sourceTitle: event.detail?.sourceTitle || "",
    });
    window.addEventListener("valuetime:request-user", openSelector);
    window.addEventListener("valuetime:request-article-import", openArticleImport);
    const openSettings = () => setSettingsOpen(true);
    window.addEventListener("valuetime:request-settings", openSettings);
    applyStudyDisplayPreferences(loadUserSettings());
    const stopLanguageObserver = observeUiLanguage(document.body);
    const syncLanguage = () => applyUiLanguage(document.body);
    window.addEventListener("valuetime:settings-changed", syncLanguage);

    return () => {
      window.removeEventListener("valuetime:request-user", openSelector);
      window.removeEventListener("valuetime:request-article-import", openArticleImport);
      window.removeEventListener("valuetime:request-settings", openSettings);
      window.removeEventListener("valuetime:settings-changed", syncLanguage);
      stopLanguageObserver();
      observer.disconnect();
      stylesheet.remove();
    };
  }, [page]);

  if (loadError) return <div id="app" />;
  return <><div id="app" /><UserSelectorModal mode={selectorMode} onClose={() => setSelectorMode(null)} /><ArticleImportModal open={Boolean(articleImportRequest)} request={articleImportRequest} onClose={() => setArticleImportRequest(null)} /><SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} /></>;
}
