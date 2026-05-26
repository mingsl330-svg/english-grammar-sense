const STORAGE_KEY = "english-grammar-sense-minimax-settings";
const LEGACY_API_URL = "https://api.minimax.io/v1/chat/completions";
const UNSUPPORTED_DEFAULT_MODEL = "MiniMax-M2.7-highspeed";

export interface MiniMaxSettings {
  apiKey: string;
  apiUrl: string;
  model: string;
  proxyUrl: string;
}

export const defaultMiniMaxSettings: MiniMaxSettings = {
  apiKey: "",
  apiUrl: "https://api.minimaxi.com/v1/chat/completions",
  model: "MiniMax-M2.7",
  proxyUrl: ""
};

export const minimaxSettingsService = {
  load(): MiniMaxSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultMiniMaxSettings;
      const settings = {
        ...defaultMiniMaxSettings,
        ...JSON.parse(raw)
      };
      if (settings.apiUrl === LEGACY_API_URL || settings.model === UNSUPPORTED_DEFAULT_MODEL) {
        const migrated = {
          ...settings,
          apiUrl: settings.apiUrl === LEGACY_API_URL ? defaultMiniMaxSettings.apiUrl : settings.apiUrl,
          model: settings.model === UNSUPPORTED_DEFAULT_MODEL ? defaultMiniMaxSettings.model : settings.model
        };
        this.save(migrated);
        return migrated;
      }
      return settings;
    } catch {
      return defaultMiniMaxSettings;
    }
  },

  save(settings: MiniMaxSettings) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        apiKey: settings.apiKey.trim(),
        apiUrl: settings.apiUrl.trim() || defaultMiniMaxSettings.apiUrl,
        model: settings.model.trim() || defaultMiniMaxSettings.model,
        proxyUrl: settings.proxyUrl.trim()
      })
    );
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },

  maskKey(apiKey: string) {
    if (!apiKey) return "Not set";
    if (apiKey.length <= 8) return "********";
    return `${apiKey.slice(0, 4)}••••••${apiKey.slice(-4)}`;
  }
};
