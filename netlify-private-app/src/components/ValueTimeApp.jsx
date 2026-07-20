import { useEffect, useState } from "react";
import valueTimeStylesUrl from "../../../styles/app.css?url";
import "../legacy-overrides.css";
import "../features/csat-vocab/entry.css";

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

    import("../../../src/app.js").catch(() => setLoadError(true));

    return () => {
      stylesheet.remove();
    };
  }, [page]);

  return (
    <>
      <div id="app" />
      {page === "home" ? <a className="general-to-csat-entry" href="/csat-vocab">수능 단어 훈련</a> : null}
    </>
  );
}
