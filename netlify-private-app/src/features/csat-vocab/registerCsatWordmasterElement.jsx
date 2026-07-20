import React from "react";
import ReactDOM from "react-dom/client";
import CsatVocabPage from "./CsatVocabPage.jsx";

class CsatWordmasterElement extends HTMLElement {
  connectedCallback() {
    if (this.root) return;
    this.root = ReactDOM.createRoot(this);
    this.root.render(<CsatVocabPage embedded />);
  }

  disconnectedCallback() {
    queueMicrotask(() => {
      if (this.isConnected || !this.root) return;
      this.root.unmount();
      this.root = null;
    });
  }
}

if (!customElements.get("csat-wordmaster-mode")) {
  customElements.define("csat-wordmaster-mode", CsatWordmasterElement);
}
