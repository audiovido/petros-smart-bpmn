export const PROVIDERS = {
  openai: {
    label: "OpenAI",
    endpoint: "https://api.openai.com/v1/chat/completions",
    defaultModel: "gpt-4o-mini",
    modelsEndpoint: "https://api.openai.com/v1/models",
    keyPlaceholder: "sk-••••••••••••••••",
    keyPattern: /^sk-.{16,}$/,
    consoleUrl: "https://platform.openai.com/api-keys",
    adapter: "openai"
  },
  anthropic: {
    label: "Anthropic",
    endpoint: "https://api.anthropic.com/v1/messages",
    defaultModel: "claude-sonnet-4-20250514",
    modelsEndpoint: "https://api.anthropic.com/v1/models",
    fallbackBest: ["claude-opus-4-6"],
    keyPlaceholder: "sk-ant-••••••••••••",
    keyPattern: /^sk-ant-.{12,}$/,
    consoleUrl: "https://console.anthropic.com/settings/keys",
    adapter: "anthropic"
  },
  openrouter: {
    label: "OpenRouter",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    defaultModel: "openrouter/free",
    modelsEndpoint: "https://openrouter.ai/api/v1/models",
    fallbackFree: ["openrouter/free"],
    fallbackBest: ["~openai/gpt-latest", "~anthropic/claude-sonnet-latest", "openrouter/auto"],
    keyPlaceholder: "sk-or-v1-••••••••••",
    keyPattern: /^sk-or-.{12,}$/,
    consoleUrl: "https://openrouter.ai/settings/keys",
    adapter: "openai-compatible"
  },
  groq: {
    label: "Groq",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    defaultModel: "llama-3.3-70b-versatile",
    modelsEndpoint: "https://api.groq.com/openai/v1/models",
    keyPlaceholder: "gsk_••••••••••••••",
    keyPattern: /^gsk_.{12,}$/,
    consoleUrl: "https://console.groq.com/keys",
    adapter: "openai-compatible"
  },
  deepseek: {
    label: "DeepSeek",
    endpoint: "https://api.deepseek.com/chat/completions",
    defaultModel: "deepseek-v4-flash",
    modelsEndpoint: "https://api.deepseek.com/models",
    fallbackBest: ["deepseek-v4-pro"],
    keyPlaceholder: "sk-••••••••••••••••",
    keyPattern: /^sk-.{12,}$/,
    consoleUrl: "https://platform.deepseek.com/api_keys",
    adapter: "openai-compatible"
  },
  gemini: {
    label: "Google Gemini",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
    defaultModel: "gemini-3.5-flash",
    modelsEndpoint: "https://generativelanguage.googleapis.com/v1beta/models",
    fallbackBest: ["gemini-flash-latest"],
    keyPlaceholder: "AIza••••••••••••••",
    keyPattern: /^AIza.{16,}$/,
    consoleUrl: "https://aistudio.google.com/apikey",
    adapter: "gemini"
  },
  mistral: {
    label: "Mistral AI",
    endpoint: "https://api.mistral.ai/v1/chat/completions",
    defaultModel: "mistral-small-latest",
    modelsEndpoint: "https://api.mistral.ai/v1/models",
    fallbackBest: ["mistral-large-latest", "mistral-medium-latest"],
    keyPlaceholder: "••••••••••••••••••",
    keyPattern: /^.{20,}$/,
    consoleUrl: "https://console.mistral.ai/api-keys",
    adapter: "openai-compatible"
  },
  custom: {
    label: "Custom Compatible",
    endpoint: "",
    defaultModel: "",
    modelsEndpoint: "",
    keyPlaceholder: "Provider API key",
    keyPattern: /^.{8,}$/,
    consoleUrl: "",
    adapter: "openai-compatible"
  }
};

export function getProvider(id) { return PROVIDERS[id] || PROVIDERS.openai; }
export function providerOptions() { return Object.entries(PROVIDERS).map(([value, provider]) => ({ value, label: provider.label })); }
