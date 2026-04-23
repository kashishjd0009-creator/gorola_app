import type { ReactElement } from "react";

export function App(): ReactElement {
  const api = import.meta.env.VITE_API_BASE_URL ?? "";

  return (
    <div className="app-root">
      <div className="app-panel">
        <p className="app-kicker">GoRola</p>
        <h1 className="app-title">Mussoorie, delivered.</h1>
        <p className="app-copy">
          Buyer web (Phase 2) will live here. API base URL for this build:{" "}
          <code className="app-code">{api.length > 0 ? api : "— (set VITE_API_BASE_URL)"}</code>
        </p>
      </div>
    </div>
  );
}
