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

    import("../../../src/app.js").catch(() => setLoadError(true));

    return () => {
      stylesheet.remove();
    };
  }, [page]);

  if (loadError) return <div id="app" />;
  return <div id="app" />;
}
