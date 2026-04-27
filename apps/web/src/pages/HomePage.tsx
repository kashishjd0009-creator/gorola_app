import type { ReactElement } from "react";
import { useEffect, useState } from "react";

type HealthJson = {
  success?: boolean;
  data?: { status?: string };
};

function normalizeApiBase(raw: string): string {
  return raw.replace(/\/+$/, "");
}

export type HomePageProps = {
  /** For tests; defaults to `import.meta.env.VITE_API_BASE_URL`. */
  apiBaseForDisplay?: string;
};

export function HomePage({ apiBaseForDisplay }: HomePageProps): ReactElement {
  const api = apiBaseForDisplay ?? (import.meta.env.VITE_API_BASE_URL ?? "");
  const base = normalizeApiBase(api);

  const [healthState, setHealthState] = useState<
    | { kind: "loading" }
    | { kind: "ok"; status: string; httpStatus: number }
    | { kind: "error"; message: string }
  >(() =>
    base.length === 0
      ? { kind: "error", message: "Set VITE_API_BASE_URL to call /api/health" }
      : { kind: "loading" }
  );

  useEffect(() => {
    if (base.length === 0) {
      return;
    }

    const url = `${base}/api/health`;
    const ac = new AbortController();
    setHealthState({ kind: "loading" });

    void (async (): Promise<void> => {
      try {
        const res = await fetch(url, { method: "GET", signal: ac.signal });
        const httpStatus = res.status;
        let body: unknown;
        try {
          body = (await res.json()) as unknown;
        } catch {
          setHealthState({
            kind: "error",
            message: `HTTP ${String(httpStatus)} — response was not JSON`
          });
          return;
        }
        const parsed = body as HealthJson;
        const status = parsed.data?.status ?? "unknown";
        if (!res.ok) {
          setHealthState({
            kind: "error",
            message: `HTTP ${String(httpStatus)} — ${status}`
          });
          return;
        }
        if (parsed.success === true && status === "ok") {
          setHealthState({ kind: "ok", status, httpStatus });
        } else {
          setHealthState({
            kind: "error",
            message: `HTTP ${String(httpStatus)} — data.status: ${status} (expected ok)`
          });
        }
      } catch (e: unknown) {
        if (e instanceof Error && e.name === "AbortError") {
          return;
        }
        const msg = e instanceof Error ? e.message : "Request failed";
        setHealthState({
          kind: "error",
          message: `Could not reach API (${url}). ${msg} — check URL, CORS, and that the server is up.`
        });
      }
    })();

    return () => {
      ac.abort();
    };
  }, [base]);

  return (
    <div className="app-root">
      <div className="app-panel">
        <p className="app-kicker">GoRola</p>
        <h1 className="app-title">Mussoorie, delivered.</h1>
        <p className="app-copy">
          Buyer web (Phase 2) will live here. API base URL for this build:{" "}
          <code className="app-code">{api.length > 0 ? api : "— (set VITE_API_BASE_URL)"}</code>
        </p>

        <div className="app-health" aria-live="polite">
          <p className="app-health-label">API connection</p>
          {healthState.kind === "loading" && (
            <p className="app-health-line app-health-pending">Checking GET /api/health…</p>
          )}
          {healthState.kind === "ok" && (
            <p className="app-health-line app-health-ok">
              Connected — <code className="app-code">data.status: {JSON.stringify(healthState.status)}</code>{" "}
              (HTTP {String(healthState.httpStatus)})
            </p>
          )}
          {healthState.kind === "error" && (
            <p className="app-health-line app-health-err">{healthState.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
