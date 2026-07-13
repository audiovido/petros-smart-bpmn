import { translations, applyLanguage } from "./i18n.js?v=2.0.0";
import { DEMO_BPMN } from "./demo-bpmn.js?v=2.0.0";
import { generateBpmn, auditBpmn, generateSop } from "./ai-service.js?v=2.0.0";
import { BpmnWorkspace } from "./bpmn-service.js?v=2.0.0";
import { extractBpmnXml, isEditInstruction, renderMarkdown, safeFilename } from "./utils.js?v=2.0.0";
import { auditOfflineBpmn, generateOfflineBpmn, sopOfflineBpmn } from "./offline-service.js?v=2.0.0";
import { PROVIDERS, getProvider, providerOptions } from "./providers.js?v=2.0.0";

const STORAGE = { config: "petros.ai.config", lang: "petros.language", xml: "petros.workflow.xml" };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const storedValue = (key) => localStorage.getItem(STORAGE[key]);
let settingsDraft = null;
let settingsProvider = "openai";
const state = {
  lang: storedValue("lang") || "en",
  config: loadConfig(),
  mode: "design",
  busy: false,
  workspace: null,
  documentName: "Customer Onboarding",
  elementCount: 0
};

function loadConfig() {
  const fallback = { provider: "openai", models: {}, apiKeys: {}, customEndpoint: "", businessContext: "" };
  try {
    const saved = JSON.parse(storedValue("config")) || {};
    const provider = PROVIDERS[saved.provider] ? saved.provider : "openai";
    const models = { ...(saved.models || {}) };
    const apiKeys = { ...(saved.apiKeys || {}) };
    if (saved.model && !models[provider]) models[provider] = saved.model;
    if (saved.apiKey && !apiKeys[provider]) apiKeys[provider] = saved.apiKey;
    return { provider, models, apiKeys, customEndpoint: saved.customEndpoint || "", businessContext: saved.businessContext || "" };
  } catch { return fallback; }
}

function activeKey() { return state.config.apiKeys?.[state.config.provider] || ""; }
function activeModel() { return state.config.models?.[state.config.provider] || getProvider(state.config.provider).defaultModel; }
function activeAiConfig() {
  return { ...state.config, apiKey: activeKey(), model: activeModel() };
}

function t(key) { return translations[state.lang]?.[key] || translations.en[key] || key; }

function toast(title, body, type = "info") {
  const icon = type === "error" ? "circle-alert" : type === "success" ? "circle-check" : "sparkles";
  const node = document.createElement("div");
  node.className = `toast ${type}`;
  node.innerHTML = `<i data-lucide="${icon}"></i><div><strong></strong><p></p></div>`;
  node.querySelector("strong").textContent = title;
  node.querySelector("p").textContent = body;
  $("#toastRegion").append(node);
  window.lucide?.createIcons({ nodes: [node] });
  setTimeout(() => { node.classList.add("is-leaving"); setTimeout(() => node.remove(), 260); }, 4200);
}

function setBusy(value) {
  state.busy = value;
  $("#generateButton").disabled = value;
  $("#auditButton").disabled = value;
  $("#sopButton").disabled = value;
  $("#canvasLoader").hidden = !value;
}

function notifyApiError(error) {
  const message = String(error?.message || "").toLowerCase();
  let titleKey = "apiErrorTitle", bodyKey = "apiErrorBody";
  if (error?.status === 401 || error?.status === 403) [titleKey, bodyKey] = ["invalidKeyTitle", "invalidKeyBody"];
  else if (error?.status === 429 && (error?.code === "insufficient_quota" || message.includes("quota") || message.includes("billing"))) [titleKey, bodyKey] = ["quotaTitle", "quotaBody"];
  else if (error?.status === 429) [titleKey, bodyKey] = ["rateTitle", "rateBody"];
  else if (error?.status === 404 || message.includes("model")) [titleKey, bodyKey] = ["modelErrorTitle", "modelErrorBody"];
  else if (error instanceof TypeError || message.includes("failed to fetch") || message.includes("network")) [titleKey, bodyKey] = ["networkErrorTitle", "networkErrorBody"];
  toast(t(titleKey), t(bodyKey), "error");
}

function updateConnectionStatus() {
  const status = $("#aiStatus");
  const connected = Boolean(activeKey());
  status.classList.toggle("connected", connected);
  status.querySelector("span").textContent = connected ? `${getProvider(state.config.provider).label} · ${t("connected")}` : t("demoMode");
}

function updateDocumentMeta() {
  $("#workflowTitle").textContent = state.documentName || t("workflowTitle");
  const unit = state.elementCount === 1 ? t("elementSingular") : t("elementPlural");
  $("#elementCount").textContent = `${state.elementCount} ${unit}`;
}

function appendUserMessage(text) {
  const article = document.createElement("article");
  article.className = "message message-user";
  article.innerHTML = `<div class="message-body"><div class="message-meta"><strong>YOU</strong><span>${t("now")}</span></div><p></p></div>`;
  article.querySelector("p").textContent = text;
  $("#conversation").append(article);
  $("#conversation").scrollTop = $("#conversation").scrollHeight;
}

function showResult(type, markdown) {
  const card = $("#resultCard");
  const isAudit = type === "audit";
  $("#resultEyebrow").textContent = t(isAudit ? "auditEyebrow" : "sopEyebrow");
  $("#resultTitle").textContent = t(isAudit ? "auditTitle" : "sopTitle");
  $("#resultOutput").innerHTML = renderMarkdown(markdown);
  card.hidden = false;
  $("#conversation").scrollTop = $("#conversation").scrollHeight;
}

function setMode(mode) {
  state.mode = mode;
  $$(".mode-tab").forEach((button) => button.classList.toggle("is-active", button.dataset.mode === mode));
  if (mode === "audit") runAudit();
  if (mode === "sop") runSop();
}

async function handleGenerate(event) {
  event.preventDefault();
  if (state.busy) return;
  const input = $("#promptInput");
  const instruction = input.value.trim();
  if (!instruction) { toast(t("missingPromptTitle"), t("missingPromptBody")); return; }
  appendUserMessage(instruction);
  input.value = "";
  if (!activeKey()) {
    setBusy(true);
    try {
      await state.workspace.import(generateOfflineBpmn(instruction, state.documentName));
      toast(t("offlineGeneratedTitle"), t("offlineGeneratedBody"), "success");
    } catch (error) {
      console.error(error);
      toast(t("invalidXmlTitle"), t("invalidXmlBody"), "error");
    } finally { setBusy(false); }
    return;
  }
  setBusy(true);
  try {
    const currentXml = isEditInstruction(instruction) ? state.workspace.xml : "";
    const response = await generateBpmn(activeAiConfig(), instruction, currentXml);
    const xml = extractBpmnXml(response);
    await state.workspace.import(xml);
    toast(t("generatedTitle"), t("generatedBody"), "success");
  } catch (error) {
    console.error(error);
    const malformed = /BPMN|definitions|XML|unparsable|parse/i.test(error.message);
    if (malformed) toast(t("invalidXmlTitle"), t("invalidXmlBody"), "error");
    else notifyApiError(error);
  } finally { setBusy(false); }
}

async function runAudit() {
  if (state.busy) return;
  if (!activeKey()) { showResult("audit", auditOfflineBpmn(await state.workspace.exportXml(), state.lang)); return; }
  setBusy(true);
  try { showResult("audit", await auditBpmn(activeAiConfig(), await state.workspace.exportXml())); }
  catch (error) { console.error(error); notifyApiError(error); }
  finally { setBusy(false); }
}

async function runSop() {
  if (state.busy) return;
  if (!activeKey()) { showResult("sop", sopOfflineBpmn(await state.workspace.exportXml(), state.lang)); return; }
  setBusy(true);
  try { showResult("sop", await generateSop(activeAiConfig(), await state.workspace.exportXml())); }
  catch (error) { console.error(error); notifyApiError(error); }
  finally { setBusy(false); }
}

function download(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = Object.assign(document.createElement("a"), { href: url, download: filename });
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(t("exportTitle"), t("exportBody"), "success");
}

async function exportWorkflow(format) {
  try {
    const isSvg = format === "svg";
    const content = isSvg ? await state.workspace.exportSvg() : await state.workspace.exportXml();
    download(content, safeFilename($("#workflowTitle").textContent, format), isSvg ? "image/svg+xml" : "application/xml");
    $("#exportMenu").hidden = true;
  } catch (error) {
    console.error(error);
    $("#exportMenu").hidden = true;
    toast(t("exportErrorTitle"), t("exportErrorBody"), "error");
  }
}

function populateProviders() {
  $("#providerSelect").replaceChildren(...providerOptions().map(({ value, label }) => Object.assign(document.createElement("option"), { value, textContent: label })));
}

function stashProviderFields() {
  if (!settingsDraft) return;
  settingsDraft.models[settingsProvider] = $("#modelInput").value.trim();
  settingsDraft.apiKeys[settingsProvider] = $("#apiKeyInput").value.trim();
  if (settingsProvider === "custom") settingsDraft.customEndpoint = $("#customEndpointInput").value.trim();
}

function renderProviderFields(providerId) {
  const provider = getProvider(providerId);
  settingsProvider = providerId;
  $("#providerSelect").value = providerId;
  $("#modelInput").value = settingsDraft.models[providerId] || provider.defaultModel;
  $("#apiKeyInput").value = settingsDraft.apiKeys[providerId] || "";
  $("#apiKeyInput").placeholder = provider.keyPlaceholder;
  $("#customEndpointGroup").hidden = providerId !== "custom";
  $("#customEndpointInput").value = settingsDraft.customEndpoint || "";
  $("#providerKeyLink").hidden = !provider.consoleUrl;
  $("#providerKeyLink").href = provider.consoleUrl || "#";
}

function openSettings() {
  settingsDraft = JSON.parse(JSON.stringify(state.config));
  settingsDraft.models ||= {};
  settingsDraft.apiKeys ||= {};
  renderProviderFields(settingsDraft.provider || "openai");
  $("#businessContextInput").value = settingsDraft.businessContext || "";
  $("#settingsModal").hidden = false;
  setTimeout(() => $("#apiKeyInput").focus(), 80);
}

function closeSettings() { $("#settingsModal").hidden = true; }

function saveSettings(event) {
  event.preventDefault();
  stashProviderFields();
  const providerId = settingsDraft.provider;
  const provider = getProvider(providerId);
  const apiKey = settingsDraft.apiKeys[providerId] || "";
  const model = settingsDraft.models[providerId] || "";
  if (apiKey && !provider.keyPattern.test(apiKey)) { toast(t("keyFormatTitle"), t("keyFormatBody"), "error"); return; }
  if (apiKey && !model) { toast(t("modelErrorTitle"), t("modelErrorBody"), "error"); return; }
  if (providerId === "custom" && apiKey && !/^https:\/\//i.test(settingsDraft.customEndpoint || "")) { toast(t("endpointErrorTitle"), t("endpointErrorBody"), "error"); return; }
  settingsDraft.businessContext = $("#businessContextInput").value.trim();
  state.config = settingsDraft;
  localStorage.setItem(STORAGE.config, JSON.stringify(state.config));
  updateConnectionStatus();
  closeSettings();
  toast(t("savedTitle"), t("savedBody"), "success");
}

function bindEvents() {
  $("#promptForm").addEventListener("submit", handleGenerate);
  $("#promptInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); $("#promptForm").requestSubmit(); }
  });
  $$(".mode-tab").forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
  $("#auditButton").addEventListener("click", () => setMode("audit"));
  $("#sopButton").addEventListener("click", () => setMode("sop"));
  $("#fitButton").addEventListener("click", () => { state.workspace.fit(); $("#zoomLevel").textContent = `${Math.round(state.workspace.zoom() * 100)}%`; });
  $("#settingsButton").addEventListener("click", openSettings);
  $("#settingsClose").addEventListener("click", closeSettings);
  $("#settingsModal").addEventListener("click", (event) => { if (event.target === $("#settingsModal")) closeSettings(); });
  $("#settingsForm").addEventListener("submit", saveSettings);
  $("#providerSelect").addEventListener("change", (event) => {
    stashProviderFields();
    settingsDraft.provider = event.target.value;
    renderProviderFields(event.target.value);
  });
  $("#toggleKey").addEventListener("click", () => { const input = $("#apiKeyInput"); input.type = input.type === "password" ? "text" : "password"; });
  $("#clearKey").addEventListener("click", () => {
    stashProviderFields();
    settingsDraft.apiKeys[settingsProvider] = "";
    state.config = settingsDraft;
    localStorage.setItem(STORAGE.config, JSON.stringify(state.config));
    $("#apiKeyInput").value = "";
    updateConnectionStatus(); closeSettings(); toast(t("clearedTitle"), t("clearedBody"));
  });
  $("#languageToggle").addEventListener("click", () => {
    state.lang = state.lang === "en" ? "fa" : "en"; localStorage.setItem(STORAGE.lang, state.lang); applyLanguage(state.lang); $("#languageLabel").textContent = state.lang === "en" ? "FA" : "EN"; updateConnectionStatus(); updateDocumentMeta();
  });
  $$("#promptSuggestions button").forEach((button) => button.addEventListener("click", () => { $("#promptInput").value = t(button.dataset.promptKey); $("#promptInput").focus(); }));
  $("#closeResult").addEventListener("click", () => { $("#resultCard").hidden = true; });
  $("#exportButton").addEventListener("click", (event) => { event.stopPropagation(); $("#exportMenu").hidden = !$("#exportMenu").hidden; });
  document.addEventListener("click", (event) => { if (!event.target.closest(".export-wrap")) $("#exportMenu").hidden = true; });
  $("#exportBpmn").addEventListener("click", () => exportWorkflow("bpmn"));
  $("#exportSvg").addEventListener("click", () => exportWorkflow("svg"));
  document.addEventListener("keydown", (event) => { if (event.key === "Escape") { closeSettings(); $("#exportMenu").hidden = true; } });
}

async function init() {
  applyLanguage(state.lang);
  $("#languageLabel").textContent = state.lang === "en" ? "FA" : "EN";
  window.lucide?.createIcons();
  populateProviders();
  bindEvents();
  updateConnectionStatus();
  state.workspace = new BpmnWorkspace($("#bpmnCanvas"), (xml, count, name) => {
    localStorage.setItem(STORAGE.xml, xml);
    state.documentName = name;
    state.elementCount = count;
    updateDocumentMeta();
    $("#autosaveLabel").textContent = t("autosaved");
  });
  const saved = storedValue("xml");
  try { await state.workspace.import(saved || DEMO_BPMN); }
  catch { await state.workspace.import(DEMO_BPMN); }
  $("#zoomLevel").textContent = `${Math.round(state.workspace.zoom() * 100)}%`;
  if (!activeKey()) setTimeout(() => toast(t("demoTitle"), t("demoBody")), 650);
}

init().catch((error) => { console.error(error); toast("Initialization failed", "Refresh the page and verify CDN access.", "error"); });
