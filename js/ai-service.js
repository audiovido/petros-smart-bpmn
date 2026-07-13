import { getProvider } from "./providers.js?v=2.0.0";

const SENIOR_CORE = `You are Petros Senior Process Intelligence, a principal-level business process engineer, BPMN 2.0 architect, operations strategist, controls specialist, and digital-transformation advisor. Work with executive judgment and implementation-level precision. Ground every decision in the supplied business context and current workflow. Never give generic junior advice. Identify assumptions explicitly, protect compliance and customer experience, design measurable controls, and optimize for ownership, cycle time, quality, cost, risk, and automation readiness.`;

const BPMN_RULES = `Return ONLY one complete, valid BPMN 2.0 XML document. Do not add conversational prose, markdown fences, or XML comments. The document MUST include bpmn:definitions, exactly one primary bpmn:process, correct incoming/outgoing sequence-flow references, and complete bpmndi:BPMNDiagram geometry with BPMNShape Bounds and BPMNEdge waypoints so bpmn-js renders immediately. Use standard BPMN 2.0 elements supported by bpmn-js. Every flow node must be connected. Model realistic roles, decisions, exceptions, controls, and automation opportunities when supported by the request. Use concise names in the user's language. The first bytes must be <?xml and the final tag must be </bpmn:definitions>.`;

const AUDIT_RULES = `Act as the senior assurance lead. Audit the BPMN XML for unreachable or isolated nodes, missing end states, deadlocks, ambiguous gateways, exception and timeout gaps, ownership gaps, segregation-of-duties concerns, compliance exposure, bottlenecks, weak controls, poor customer experience, and measurable automation opportunities. Return executive-ready Markdown with: health rating, critical findings, business impact, prioritized recommendations, control/KPI proposals, and a pragmatic next action. Do not return XML.`;

const SOP_RULES = `Act as the senior operations architect. Convert the BPMN XML into an implementation-ready Standard Operating Procedure in Markdown. Include: purpose, business outcome, scope, roles/RACI, prerequisites, numbered procedure, decision rules, exceptions and escalation, controls, systems/data, SLAs, KPIs, records/evidence, and continuous-improvement cadence. Preserve the diagram's language. Be specific to the supplied business context. Do not mention XML.`;

function systemPrompt(config, taskRules) {
  const business = String(config.businessContext || "").trim();
  return `${SENIOR_CORE}\n\nBUSINESS CONTEXT:\n${business || "No organization-specific context was supplied. Infer conservatively from the workflow and clearly avoid invented policies."}\n\nTASK CONTRACT:\n${taskRules}`;
}

function normalizeContent(content) {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.map((part) => part?.text || part?.content || "").join("");
  return "";
}

async function throwProviderError(response, provider) {
  let payload = {};
  try { payload = await response.json(); } catch { /* Non-JSON provider error. */ }
  const detail = payload.error || payload;
  const error = new Error(detail.message || `${provider} request failed with status ${response.status}`);
  error.name = "ProviderError";
  error.provider = provider;
  error.status = response.status;
  error.code = detail.code || detail.type || detail.status || "";
  throw error;
}

function ensureComplete(choice) {
  const reason = choice?.finish_reason || choice?.finishReason;
  if (reason === "length" || reason === "MAX_TOKENS") throw new Error("AI response was truncated before the requested document completed");
}

async function openAICompatibleRequest(config, system, user) {
  const provider = getProvider(config.provider);
  const endpoint = config.provider === "custom" ? config.customEndpoint : provider.endpoint;
  if (!/^https:\/\//i.test(endpoint || "")) throw new Error("A secure HTTPS compatible endpoint is required");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${config.apiKey}` };
  if (config.provider === "openrouter") {
    headers["HTTP-Referer"] = window.location.origin;
    headers["X-OpenRouter-Title"] = "Petros Process Intelligence";
  }
  const response = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.model,
      max_tokens: 8000,
      messages: [{ role: "system", content: system }, { role: "user", content: user }]
    })
  });
  if (!response.ok) await throwProviderError(response, provider.label);
  const data = await response.json();
  const choice = data.choices?.[0];
  ensureComplete(choice);
  return normalizeContent(choice?.message?.content);
}

async function anthropicRequest(config, system, user) {
  const provider = getProvider(config.provider);
  const response = await fetch(provider.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": config.apiKey,
      "anthropic-version": "2023-06-01",
      "anthropic-dangerous-direct-browser-access": "true"
    },
    body: JSON.stringify({ model: config.model, max_tokens: 8000, temperature: 0.1, system, messages: [{ role: "user", content: user }] })
  });
  if (!response.ok) await throwProviderError(response, provider.label);
  const data = await response.json();
  if (data.stop_reason === "max_tokens") throw new Error("AI response was truncated before the requested document completed");
  return data.content?.filter((part) => part.type === "text").map((part) => part.text).join("") || "";
}

async function geminiRequest(config, system, user) {
  const provider = getProvider(config.provider);
  const model = encodeURIComponent(config.model);
  const response = await fetch(`${provider.endpoint}/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": config.apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: user }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: 8192 }
    })
  });
  if (!response.ok) await throwProviderError(response, provider.label);
  const data = await response.json();
  const candidate = data.candidates?.[0];
  ensureComplete(candidate);
  if (!candidate && data.promptFeedback?.blockReason) throw new Error(`Gemini blocked the request: ${data.promptFeedback.blockReason}`);
  return candidate?.content?.parts?.map((part) => part.text || "").join("") || "";
}

async function request(config, taskRules, user) {
  const provider = getProvider(config.provider);
  const system = systemPrompt(config, taskRules);
  let output;
  if (provider.adapter === "anthropic") output = await anthropicRequest(config, system, user);
  else if (provider.adapter === "gemini") output = await geminiRequest(config, system, user);
  else output = await openAICompatibleRequest(config, system, user);
  if (!String(output || "").trim()) throw new Error(`${provider.label} returned an empty response`);
  return output;
}

export function generateBpmn(config, instruction, currentXml = "") {
  const user = currentXml
    ? `Modify the CURRENT BPMN according to the INSTRUCTION. Preserve unrelated valid structure and return the complete updated XML.\n\nINSTRUCTION:\n${instruction}\n\nCURRENT BPMN:\n${currentXml}`
    : `Create a complete senior-grade BPMN 2.0 workflow for this process description:\n${instruction}`;
  return request(config, BPMN_RULES, user);
}

export function auditBpmn(config, xml) { return request(config, AUDIT_RULES, `Audit this current BPMN workflow:\n\n${xml}`); }
export function generateSop(config, xml) { return request(config, SOP_RULES, `Create the SOP for this current BPMN workflow:\n\n${xml}`); }
