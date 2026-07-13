import { translations, applyLanguage } from "./i18n.js?v=3.2.0";
import { BLANK_BPMN } from "./blank-bpmn.js?v=3.0.0";
import { generateBpmn, auditBpmn, generateSop, chatWithPetros } from "./ai-service.js?v=3.2.0";
import { BpmnWorkspace } from "./bpmn-service.js?v=3.0.0";
import { extractBpmnXml, isEditInstruction, isWorkflowPrompt, renderMarkdown, safeFilename } from "./utils.js?v=3.2.0";
import { PROVIDERS, getProvider, providerOptions } from "./providers.js?v=3.0.0";
import { discoverModels, fallbackCatalog } from "./model-service.js?v=3.0.0";

const STORAGE = { config: "petros.ai.config", lang: "petros.language", xml: "petros.workflow.xml" };
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const storedValue = (key) => localStorage.getItem(STORAGE[key]);
let settingsDraft = null;
let settingsProvider = "openrouter";
let catalogRequest = 0;
let lastCatalog = fallbackCatalog("openrouter");
let catalogStatusKey = "modelLoading";

const state = {
  lang: storedValue("lang") || "en",
  config: loadConfig(),
  mode: "design",
  busy: false,
  workspace: null,
  documentName: "Untitled Workflow",
  elementCount: 0,
  resultType: "",
  chatHistory: []
};

function loadConfig() {
  const fallback = { version: 3, provider: "openrouter", models: {}, apiKeys: {}, customEndpoint: "", businessContext: "" };
  try {
    const saved = JSON.parse(storedValue("config")) || {};
    const provider = saved.version === 3 && PROVIDERS[saved.provider] ? saved.provider : "openrouter";
    const models = { ...(saved.models || {}) };
    const apiKeys = { ...(saved.apiKeys || {}) };
    if (saved.model && !models[provider]) models[provider] = saved.model;
    if (saved.apiKey && !apiKeys[provider]) apiKeys[provider] = saved.apiKey;
    return { version: 3, provider, models, apiKeys, customEndpoint: saved.customEndpoint || "", businessContext: saved.businessContext || "" };
  } catch { return fallback; }
}

function activeKey() { return state.config.apiKeys?.[state.config.provider] || ""; }
function activeModel() { return state.config.models?.[state.config.provider] || getProvider(state.config.provider).defaultModel; }
function activeAiConfig() { return { ...state.config, apiKey: activeKey(), model: activeModel() }; }
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

function setBusy(value, purpose = "workflow") {
  state.busy = value;
  $("#generateButton").disabled = value;
  $("#auditButton").disabled = value;
  $("#sopButton").disabled = value;
  $("#canvasLoader").hidden = !value;
  if (value) {
    $("#canvasLoader strong").textContent = t(purpose === "chat" ? "chatThinking" : "thinking");
    $("#canvasLoader small").textContent = t(purpose === "chat" ? "chatThinkingHint" : "thinkingHint");
  }
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
  const provider = getProvider(state.config.provider).label;
  status.querySelector("span").textContent = connected ? `${provider} · ${t("connected")}` : `${provider} · ${t("keyRequired")}`;
}

function displayDocumentName() {
  return ["Untitled Workflow", "گردش‌کار بدون عنوان", ""].includes(state.documentName) ? t("workflowTitle") : state.documentName;
}

function updateDocumentMeta() {
  $("#workflowTitle").textContent = displayDocumentName();
  const unit = state.elementCount === 1 ? t("elementSingular") : t("elementPlural");
  $("#elementCount").textContent = `${state.elementCount} ${unit}`;
}

function appendUserMessage(message) {
  const article = document.createElement("article");
  article.className = "message message-user";
  article.innerHTML = `<div class="message-body"><div class="message-meta"><strong></strong><span></span></div><p></p></div>`;
  article.querySelector("strong").textContent = t("you");
  article.querySelector("span").textContent = t("now");
  article.querySelector("p").textContent = message;
  $("#conversation").append(article);
  $("#conversation").scrollTop = $("#conversation").scrollHeight;
}

function appendAiMessage(markdown, type = "info") {
  const article = document.createElement("article");
  article.className = `message message-ai assistant-reply ${type === "error" ? "is-error" : ""}`;
  article.innerHTML = `<div class="message-avatar"><i data-lucide="bot"></i></div><div class="message-body"><div class="message-meta"><strong></strong><span></span></div><div class="assistant-copy"></div></div>`;
  article.querySelector("strong").textContent = t("petrosAi");
  article.querySelector(".message-meta span").textContent = t("now");
  article.querySelector(".assistant-copy").innerHTML = renderMarkdown(markdown);
  $("#conversation").append(article);
  window.lucide?.createIcons({ nodes: [article] });
  $("#conversation").scrollTop = $("#conversation").scrollHeight;
}

function workflowReply(xml, isUpdate) {
  const nodeTypes = new Set(["task", "userTask", "serviceTask", "manualTask", "businessRuleTask", "sendTask", "receiveTask", "callActivity", "subProcess", "exclusiveGateway", "parallelGateway", "inclusiveGateway"]);
  const document = new DOMParser().parseFromString(xml, "application/xml");
  const steps = [...document.querySelectorAll("*")]
    .filter((node) => nodeTypes.has(node.localName) && node.getAttribute("name"))
    .map((node) => node.getAttribute("name").trim())
    .filter((name, index, names) => name && names.indexOf(name) === index)
    .slice(0, 7);
  return t(isUpdate ? "updatedReply" : "generatedReply")
    .replace("{name}", displayDocumentName())
    .replace("{count}", state.elementCount)
    .replace("{steps}", steps.length ? steps.join(" → ") : t("structuredFlow"));
}

function showResult(type, markdown) {
  state.resultType = type;
  const isAudit = type === "audit";
  $("#resultEyebrow").textContent = t(isAudit ? "auditEyebrow" : "sopEyebrow");
  $("#resultTitle").textContent = t(isAudit ? "auditTitle" : "sopTitle");
  $("#resultOutput").innerHTML = renderMarkdown(markdown);
  $("#resultCard").hidden = false;
  $("#conversation").scrollTop = $("#conversation").scrollHeight;
}

function requireKey() {
  if (activeKey()) return true;
  toast(t("keyNeededTitle"), t("keyNeededBody"), "error");
  openSettings();
  return false;
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
  if (!requireKey()) return;
  appendUserMessage(instruction);
  input.value = "";
  const isChat = !isWorkflowPrompt(instruction);
  setBusy(true, isChat ? "chat" : "workflow");
  try {
    if (isChat) {
      const answer = await chatWithPetros(activeAiConfig(), instruction, await state.workspace.exportXml(), state.chatHistory);
      appendAiMessage(answer);
      state.chatHistory.push({ role: "user", content: instruction }, { role: "assistant", content: answer });
      state.chatHistory = state.chatHistory.slice(-8);
      return;
    }
    const currentXml = isEditInstruction(instruction) ? state.workspace.xml : "";
    const response = await generateBpmn(activeAiConfig(), instruction, currentXml);
    const xml = extractBpmnXml(response);
    const importedXml = await state.workspace.import(xml);
    appendAiMessage(workflowReply(importedXml, Boolean(currentXml)));
    toast(t("generatedTitle"), t("generatedBody"), "success");
  } catch (error) {
    console.error(error);
    if (/BPMN|definitions|XML|unparsable|parse/i.test(error.message)) {
      toast(t("invalidXmlTitle"), t("invalidXmlBody"), "error");
      appendAiMessage(t("invalidXmlReply"), "error");
    } else {
      notifyApiError(error);
      appendAiMessage(t("requestFailedReply"), "error");
    }
  } finally { setBusy(false); }
}

async function runAudit() {
  if (state.busy || !requireKey()) return;
  setBusy(true);
  try { showResult("audit", await auditBpmn(activeAiConfig(), await state.workspace.exportXml())); }
  catch (error) { console.error(error); notifyApiError(error); }
  finally { setBusy(false); }
}

async function runSop() {
  if (state.busy || !requireKey()) return;
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
    download(content, safeFilename(displayDocumentName(), format), isSvg ? "image/svg+xml" : "application/xml");
    $("#exportMenu").hidden = true;
  } catch (error) {
    console.error(error);
    $("#exportMenu").hidden = true;
    toast(t("exportErrorTitle"), t("exportErrorBody"), "error");
  }
}

function populateProviders() {
  const selected = $("#providerSelect").value || settingsProvider || state.config.provider;
  $("#providerSelect").replaceChildren(...providerOptions().map(({ value, label }) => Object.assign(document.createElement("option"), { value, textContent: value === "custom" ? t("customProvider") : label })));
  $("#providerSelect").value = selected;
}

function stashProviderFields() {
  if (!settingsDraft) return;
  settingsDraft.models[settingsProvider] = $("#modelInput").value.trim();
  settingsDraft.apiKeys[settingsProvider] = $("#apiKeyInput").value.trim();
  if (settingsProvider === "custom") settingsDraft.customEndpoint = $("#customEndpointInput").value.trim();
}

function markSelectedModel() {
  const selected = $("#modelInput").value.trim();
  $$("#modelCatalog .model-chip").forEach((button) => button.classList.toggle("is-selected", button.dataset.model === selected));
}

function renderModelCatalog(catalog = lastCatalog) {
  lastCatalog = catalog;
  $("#modelCatalogStatus").textContent = t(catalogStatusKey);
  const catalogNode = $("#modelCatalog");
  catalogNode.replaceChildren();
  const groups = [["freeModels", catalog.free || [], "noFreeModels"], ["bestModels", catalog.best || [], null]];
  groups.forEach(([titleKey, models, emptyKey]) => {
    const section = document.createElement("section");
    section.className = "model-group";
    const title = document.createElement("strong");
    title.className = "model-group-title";
    title.textContent = t(titleKey);
    section.append(title);
    if (!models.length && emptyKey) {
      const empty = document.createElement("p");
      empty.className = "model-empty";
      empty.textContent = t(emptyKey);
      section.append(empty);
    }
    models.forEach((model) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "model-chip";
      button.dataset.model = model.id;
      button.title = `${t("selectModel")}: ${model.id}`;
      const name = document.createElement("span");
      name.textContent = model.name || model.id;
      const id = document.createElement("small");
      id.textContent = model.id;
      button.append(name, id);
      button.addEventListener("click", () => { $("#modelInput").value = model.id; markSelectedModel(); });
      section.append(button);
    });
    catalogNode.append(section);
  });
  markSelectedModel();
}

async function loadModelCatalog(providerId = settingsProvider) {
  const requestId = ++catalogRequest;
  catalogStatusKey = "modelLoading";
  $("#modelCatalogStatus").textContent = t(catalogStatusKey);
  $("#refreshModels").disabled = true;
  try {
    const key = settingsDraft?.apiKeys?.[providerId] || "";
    const catalog = await discoverModels({ providerId, apiKey: key, customEndpoint: settingsDraft?.customEndpoint || "" });
    if (requestId !== catalogRequest) return;
    catalogStatusKey = catalog.live ? "modelLive" : key ? "modelFallback" : "modelKeyNeeded";
    renderModelCatalog(catalog);
  } catch (error) {
    if (requestId !== catalogRequest) return;
    console.warn("Model catalog unavailable", error?.status || error?.name || "error");
    catalogStatusKey = "modelFallback";
    renderModelCatalog(fallbackCatalog(providerId));
  } finally {
    if (requestId === catalogRequest) $("#refreshModels").disabled = false;
  }
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
  loadModelCatalog(providerId);
}

function openSettings() {
  settingsDraft = JSON.parse(JSON.stringify(state.config));
  settingsDraft.models ||= {};
  settingsDraft.apiKeys ||= {};
  renderProviderFields(settingsDraft.provider || "openrouter");
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
  settingsDraft.version = 3;
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
  $("#providerSelect").addEventListener("change", (event) => { stashProviderFields(); settingsDraft.provider = event.target.value; renderProviderFields(event.target.value); });
  $("#modelInput").addEventListener("input", markSelectedModel);
  $("#apiKeyInput").addEventListener("change", () => { if (settingsDraft) settingsDraft.apiKeys[settingsProvider] = $("#apiKeyInput").value.trim(); });
  $("#refreshModels").addEventListener("click", () => { stashProviderFields(); loadModelCatalog(settingsProvider); });
  $("#toggleKey").addEventListener("click", () => { const input = $("#apiKeyInput"); input.type = input.type === "password" ? "text" : "password"; });
  $("#clearKey").addEventListener("click", () => {
    stashProviderFields();
    settingsDraft.apiKeys[settingsProvider] = "";
    state.config = settingsDraft;
    localStorage.setItem(STORAGE.config, JSON.stringify(state.config));
    $("#apiKeyInput").value = "";
    updateConnectionStatus();
    loadModelCatalog(settingsProvider);
    toast(t("clearedTitle"), t("clearedBody"));
  });
  $("#languageToggle").addEventListener("click", () => {
    state.lang = state.lang === "en" ? "fa" : "en";
    localStorage.setItem(STORAGE.lang, state.lang);
    applyLanguage(state.lang);
    $("#languageLabel").textContent = state.lang === "en" ? "FA" : "EN";
    updateConnectionStatus();
    updateDocumentMeta();
    populateProviders();
    state.workspace?.setLanguage(state.lang);
    renderModelCatalog(lastCatalog);
    if (state.resultType && !$("#resultCard").hidden) {
      const isAudit = state.resultType === "audit";
      $("#resultEyebrow").textContent = t(isAudit ? "auditEyebrow" : "sopEyebrow");
      $("#resultTitle").textContent = t(isAudit ? "auditTitle" : "sopTitle");
    }
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
  }, state.lang);
  const saved = storedValue("xml");
  try { await state.workspace.import(saved || BLANK_BPMN); }
  catch { await state.workspace.import(BLANK_BPMN); }
  $("#zoomLevel").textContent = `${Math.round(state.workspace.zoom() * 100)}%`;
}

init().catch((error) => { console.error(error); toast(t("initializationTitle"), t("initializationBody"), "error"); });
