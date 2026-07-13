import { getProvider } from "./providers.js?v=3.0.0";

const EXCLUDED_MODEL = /(embed|moderation|whisper|tts|speech|audio|image|dall-e|realtime|transcri|guard|rerank)/i;

function unique(models) {
  const seen = new Set();
  return models.filter((model) => model.id && !seen.has(model.id) && seen.add(model.id));
}

function modelCard(item, providerId) {
  const rawId = item.id || item.name || item.baseModelId || "";
  const id = providerId === "gemini" ? rawId.replace(/^models\//, "") : rawId;
  return {
    id,
    name: item.display_name || item.displayName || item.name || id,
    created: Date.parse(item.created_at || "") / 1000 || Number(item.created || 0),
    context: Number(item.context_length || item.max_context_length || item.inputTokenLimit || item.max_input_tokens || 0),
    pricing: item.pricing || null,
    item
  };
}

function supportsChat(model, providerId) {
  if (!model.id || EXCLUDED_MODEL.test(model.id)) return false;
  if (providerId === "gemini") return model.item.supportedGenerationMethods?.includes("generateContent");
  if (providerId === "mistral") return model.item.archived !== true && model.item.capabilities?.completion_chat !== false;
  return true;
}

function isVerifiedFree(model) {
  if (model.id.endsWith(":free") || model.id === "openrouter/free") return true;
  if (!model.pricing) return false;
  return ["prompt", "completion", "request"].every((key) => Number(model.pricing[key] || 0) === 0);
}

export function rankModelPayload(payload, providerId, limit = 5, preserveOrder = false) {
  const source = payload.data || payload.models || (Array.isArray(payload) ? payload : []);
  const models = unique(source.map((item) => modelCard(item, providerId)).filter((model) => supportsChat(model, providerId)));
  const ordered = !preserveOrder && models.some((model) => model.created) ? [...models].sort((a, b) => b.created - a.created) : models;
  return {
    free: ordered.filter(isVerifiedFree).slice(0, limit),
    best: ordered.filter((model) => !isVerifiedFree(model)).slice(0, limit)
  };
}

function authHeaders(providerId, apiKey) {
  if (!apiKey) return {};
  if (providerId === "anthropic") return {
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true"
  };
  if (providerId === "gemini") return { "x-goog-api-key": apiKey };
  return { Authorization: `Bearer ${apiKey}` };
}

function customModelsEndpoint(endpoint) {
  if (!/^https:\/\//i.test(endpoint || "")) return "";
  if (/\/chat\/completions\/?$/i.test(endpoint)) return endpoint.replace(/\/chat\/completions\/?$/i, "/models");
  return `${endpoint.replace(/\/$/, "")}/models`;
}

async function readModels(url, headers) {
  const response = await fetch(url, { headers });
  if (!response.ok) {
    const error = new Error(`Model catalog request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return response.json();
}

export async function discoverModels({ providerId, apiKey = "", customEndpoint = "" }) {
  const provider = getProvider(providerId);
  if (providerId === "openrouter") {
    const headers = authHeaders(providerId, apiKey);
    const [popular, intelligent] = await Promise.all([
      readModels(`${provider.modelsEndpoint}?sort=most-popular`, headers),
      readModels(`${provider.modelsEndpoint}?sort=intelligence-high-to-low`, headers)
    ]);
    const free = rankModelPayload(popular, providerId, 100, true).free.slice(0, 5);
    const best = rankModelPayload(intelligent, providerId, 25, true).best.slice(0, 5);
    return { free, best, live: true };
  }

  const endpoint = providerId === "custom" ? customModelsEndpoint(customEndpoint) : provider.modelsEndpoint;
  if (!endpoint || !apiKey) return fallbackCatalog(providerId, false);
  const suffix = providerId === "anthropic" ? "?limit=100" : providerId === "gemini" ? "?pageSize=1000" : "";
  const payload = await readModels(`${endpoint}${suffix}`, authHeaders(providerId, apiKey));
  return { ...rankModelPayload(payload, providerId), live: true };
}

export function fallbackCatalog(providerId, live = false) {
  const provider = getProvider(providerId);
  const free = (provider.fallbackFree || []).map((id) => ({ id, name: id }));
  const best = unique([provider.defaultModel, ...(provider.fallbackBest || [])].filter(Boolean).map((id) => ({ id, name: id }))).slice(0, 5);
  return { free, best, live };
}
