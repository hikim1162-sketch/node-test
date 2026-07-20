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

    function registerCsatWordmaster() {
      if (!document.querySelector("#app csat-wordmaster-mode")) return;
      import("../features/csat-vocab/registerCsatWordmasterElement.jsx").catch(() => setLoadError(true));
    }

    const observer = new MutationObserver(registerCsatWordmaster);
    observer.observe(document.querySelector("#app"), { childList: true, subtree: true });
    import("../../../src/app.js").then(registerCsatWordmaster).catch(() => setLoadError(true));

    return () => {
      observer.disconnect();
      stylesheet.remove();
    };
  }, [page]);

  if (loadError) return <div id="app" />;
  return <div id="app" />;
}
