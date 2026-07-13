export const PROVIDERS = {
  openai: {
    label: "OpenAI",
    endpoint: "https://api.openai.com/v1/chat/completions",
    defaultModel: "gpt-4o-mini",
    keyPlaceholder: "sk-••••••••••••••••",
    keyPattern: /^sk-.{16,}$/,
    consoleUrl: "https://platform.openai.com/api-keys",
    adapter: "openai"
  },
  anthropic: {
    label: "Anthropic",
    endpoint: "https://api.anthropic.com/v1/messages",
    defaultModel: "claude-sonnet-4-20250514",
    keyPlaceholder: "sk-ant-••••••••••••",
    keyPattern: /^sk-ant-.{12,}$/,
    consoleUrl: "https://console.anthropic.com/settings/keys",
    adapter: "anthropic"
  },
  openrouter: {
    label: "OpenRouter",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    defaultModel: "~openai/gpt-latest",
    keyPlaceholder: "sk-or-v1-••••••••••",
    keyPattern: /^sk-or-.{12,}$/,
    consoleUrl: "https://openrouter.ai/settings/keys",
    adapter: "openai-compatible"
  },
  groq: {
    label: "Groq",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    defaultModel: "llama-3.3-70b-versatile",
    keyPlaceholder: "gsk_••••••••••••••",
    keyPattern: /^gsk_.{12,}$/,
    consoleUrl: "https://console.groq.com/keys",
    adapter: "openai-compatible"
  },
  deepseek: {
    label: "DeepSeek",
    endpoint: "https://api.deepseek.com/chat/completions",
    defaultModel: "deepseek-v4-flash",
    keyPlaceholder: "sk-••••••••••••••••",
    keyPattern: /^sk-.{12,}$/,
    consoleUrl: "https://platform.deepseek.com/api_keys",
    adapter: "openai-compatible"
  },
  gemini: {
    label: "Google Gemini",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
    defaultModel: "gemini-3.5-flash",
    keyPlaceholder: "AIza••••••••••••••",
    keyPattern: /^AIza.{16,}$/,
    consoleUrl: "https://aistudio.google.com/apikey",
    adapter: "gemini"
  },
  mistral: {
    label: "Mistral AI",
    endpoint: "https://api.mistral.ai/v1/chat/completions",
    defaultModel: "mistral-small-latest",
    keyPlaceholder: "••••••••••••••••••",
    keyPattern: /^.{20,}$/,
    consoleUrl: "https://console.mistral.ai/api-keys",
    adapter: "openai-compatible"
  },
  custom: {
    label: "Custom Compatible",
    endpoint: "",
    defaultModel: "",
    keyPlaceholder: "Provider API key",
    keyPattern: /^.{8,}$/,
    consoleUrl: "",
    adapter: "openai-compatible"
  }
};

export function getProvider(id) { return PROVIDERS[id] || PROVIDERS.openai; }
export function providerOptions() { return Object.entries(PROVIDERS).map(([value, provider]) => ({ value, label: provider.label })); }
