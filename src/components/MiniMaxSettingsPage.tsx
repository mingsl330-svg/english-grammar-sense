import { useState } from "react";
import {
  defaultMiniMaxSettings,
  minimaxSettingsService,
  type MiniMaxSettings
} from "../services/minimaxSettingsService";
import { minimaxService, type MiniMaxConnectionResult } from "../services/minimaxService";

interface MiniMaxSettingsPageProps {
  onBack: () => void;
}

export function MiniMaxSettingsPage({ onBack }: MiniMaxSettingsPageProps) {
  const [settings, setSettings] = useState<MiniMaxSettings>(() => minimaxSettingsService.load());
  const [showKey, setShowKey] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [testResult, setTestResult] = useState<MiniMaxConnectionResult>();
  const [isTesting, setIsTesting] = useState(false);

  const update = (field: keyof MiniMaxSettings, value: string) => {
    setSettings((current) => ({ ...current, [field]: value }));
    setSavedMessage("");
    setTestResult(undefined);
  };

  const save = () => {
    minimaxSettingsService.save(settings);
    setSettings(minimaxSettingsService.load());
    setSavedMessage("Settings saved. New feedback requests will use this MiniMax configuration.");
  };

  const clear = () => {
    minimaxSettingsService.clear();
    setSettings(defaultMiniMaxSettings);
    setSavedMessage("Settings cleared. The app will use environment config or local fallback.");
    setTestResult(undefined);
  };

  const testConnection = async () => {
    setIsTesting(true);
    setSavedMessage("");
    minimaxSettingsService.save(settings);
    const currentSettings = minimaxSettingsService.load();
    setSettings(currentSettings);
    const result = await minimaxService.testConnection(currentSettings);
    setTestResult(result);
    setIsTesting(false);
  };

  return (
    <section className="mx-auto max-w-3xl rounded-lg border border-ocean/25 bg-white p-5 shadow-soft sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ocean">Settings</p>
          <h1 className="mt-2 text-2xl font-bold text-ink">MiniMax API</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Save a MiniMax key for this browser. It is used only when the app needs AI feedback; if the request fails,
            the learning flow continues with local fallback.
          </p>
        </div>
        <button
          className="rounded-md border border-line px-4 py-2 text-sm font-bold text-muted hover:border-ocean hover:text-ocean"
          onClick={onBack}
          type="button"
        >
          Back
        </button>
      </div>

      <div className="mt-5 rounded-lg border border-amber/25 bg-amber/10 p-4 text-sm leading-6 text-amber">
        For production, use a backend proxy instead of exposing an API key in the frontend. This page is suitable for
        local testing and private prototypes. If direct browser calls fail because of CORS, set a backend proxy URL.
      </div>

      <div className="mt-5 grid gap-4">
        <label className="block">
          <span className="text-sm font-bold text-ink">API key</span>
          <div className="mt-2 flex gap-2">
            <input
              autoComplete="off"
              className="min-w-0 flex-1 rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ocean"
              onChange={(event) => update("apiKey", event.target.value)}
              placeholder="MiniMax API key"
              type={showKey ? "text" : "password"}
              value={settings.apiKey}
            />
            <button
              className="rounded-md border border-line px-4 py-2 text-sm font-bold text-muted hover:border-ocean hover:text-ocean"
              onClick={() => setShowKey((current) => !current)}
              type="button"
            >
              {showKey ? "Hide" : "Show"}
            </button>
          </div>
          <span className="mt-2 block text-xs text-muted">
            Current: {minimaxSettingsService.maskKey(settings.apiKey)}
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-ink">Model</span>
          <input
            className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ocean"
            onChange={(event) => update("model", event.target.value)}
            value={settings.model}
          />
        </label>

        <label className="block">
          <span className="text-sm font-bold text-ink">Direct API URL</span>
          <input
            className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ocean"
            onChange={(event) => update("apiUrl", event.target.value)}
            value={settings.apiUrl}
          />
          <span className="mt-2 block text-xs text-muted">
            Recommended default: https://api.minimaxi.com/v1/chat/completions
          </span>
        </label>

        <label className="block">
          <span className="text-sm font-bold text-ink">Proxy URL</span>
          <input
            className="mt-2 w-full rounded-md border border-line px-3 py-2 text-sm outline-none focus:border-ocean"
            onChange={(event) => update("proxyUrl", event.target.value)}
            placeholder="/api/minimax/chat"
            value={settings.proxyUrl}
          />
          <span className="mt-2 block text-xs text-muted">
            If proxy URL is set, the browser sends requests to your backend and does not attach the API key directly.
          </span>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <button className="rounded-md bg-ocean px-5 py-3 text-sm font-bold text-white" onClick={save} type="button">
          Save settings
        </button>
        <button
          className="rounded-md border border-ocean px-5 py-3 text-sm font-bold text-ocean hover:bg-ocean hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={isTesting}
          onClick={() => void testConnection()}
          type="button"
        >
          {isTesting ? "Testing" : "Test connection"}
        </button>
        <button
          className="rounded-md border border-line px-5 py-3 text-sm font-bold text-muted hover:border-rose hover:text-rose"
          onClick={clear}
          type="button"
        >
          Clear local key
        </button>
      </div>

      {savedMessage && (
        <p className="mt-4 rounded-md bg-leaf/10 p-3 text-sm font-semibold leading-6 text-leaf">{savedMessage}</p>
      )}
      {testResult && (
        <div
          className={`mt-4 rounded-md p-3 text-sm leading-6 ${
            testResult.ok ? "bg-leaf/10 text-leaf" : "bg-rose/10 text-rose"
          }`}
        >
          <p className="font-bold">{testResult.ok ? "MiniMax connected" : "MiniMax connection failed"}</p>
          <p className="mt-1">{testResult.message}</p>
          <p className="mt-1 text-xs">
            Mode: {testResult.mode} · Endpoint: {testResult.endpoint}
            {testResult.status ? ` · HTTP ${testResult.status}` : ""}
          </p>
        </div>
      )}
    </section>
  );
}
