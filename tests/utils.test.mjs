import assert from "node:assert/strict";
import { extractBpmnXml, isLikelyBpmn, isEditInstruction, safeFilename, renderMarkdown } from "../js/utils.js";
import { BLANK_BPMN } from "../js/blank-bpmn.js";
import { rankModelPayload, fallbackCatalog } from "../js/model-service.js";
import { PROVIDERS, getProvider, providerOptions } from "../js/providers.js";

const xml = `<?xml version="1.0"?><bpmn:definitions><bpmn:process></bpmn:process><bpmndi:BPMNDiagram></bpmndi:BPMNDiagram></bpmn:definitions>`;
assert.equal(extractBpmnXml(`\`\`\`xml\n${xml}\n\`\`\``), xml);
assert.equal(extractBpmnXml(JSON.stringify({ bpmn_xml: xml })), xml);
assert.equal(isLikelyBpmn(xml), true);
assert.equal(isLikelyBpmn("<xml />"), false);
assert.equal(isLikelyBpmn(BLANK_BPMN), true);
assert.match(BLANK_BPMN, /name="Untitled Workflow"/);
assert.equal(safeFilename("Customer Onboarding!", "bpmn"), "customer-onboarding.bpmn");
assert.equal(isEditInstruction("Add an approval task after review"), true);
assert.equal(isEditInstruction("افزودن مرحله تایید مدیر بعد از بررسی"), true);
assert.equal(isEditInstruction("Customer refund process"), false);
assert.equal(isEditInstruction("فرایند بازپرداخت مشتری"), false);
assert.match(renderMarkdown("## Health\n- Strong\n- **Fast**"), /<h2>Health<\/h2><ul><li>Strong<\/li><li><strong>Fast<\/strong><\/li><\/ul>/);

const ranked = rankModelPayload({ data: [
  { id: "paid-old", created: 10, pricing: { prompt: "1", completion: "1" } },
  { id: "free-new:free", created: 30, pricing: { prompt: "0", completion: "0" } },
  { id: "paid-new", created: 20, pricing: { prompt: "1", completion: "1" } },
  { id: "audio-new", created: 40, pricing: { prompt: "0", completion: "0" } }
] }, "openrouter");
assert.deepEqual(ranked.free.map(({ id }) => id), ["free-new:free"]);
assert.deepEqual(ranked.best.map(({ id }) => id), ["paid-new", "paid-old"]);
const preserved = rankModelPayload({ data: [
  { id: "rank-one", created: 1, pricing: { prompt: "1", completion: "1" } },
  { id: "rank-two", created: 2, pricing: { prompt: "1", completion: "1" } }
] }, "openrouter", 5, true);
assert.deepEqual(preserved.best.map(({ id }) => id), ["rank-one", "rank-two"]);
assert.equal(fallbackCatalog("openrouter").free[0].id, "openrouter/free");

assert.deepEqual(Object.keys(PROVIDERS), ["openai", "anthropic", "openrouter", "groq", "deepseek", "gemini", "mistral", "custom"]);
assert.equal(providerOptions().length, 8);
assert.equal(getProvider("unknown"), PROVIDERS.openai);
assert.match(PROVIDERS.openrouter.endpoint, /^https:\/\/openrouter\.ai\/api\/v1\/chat\/completions$/);
assert.match(PROVIDERS.groq.endpoint, /^https:\/\/api\.groq\.com\/openai\/v1\/chat\/completions$/);
assert.match(PROVIDERS.deepseek.endpoint, /^https:\/\/api\.deepseek\.com\/chat\/completions$/);
assert.equal(PROVIDERS.gemini.adapter, "gemini");
assert.equal(PROVIDERS.anthropic.adapter, "anthropic");
console.log("utils tests passed");
