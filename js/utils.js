export function extractBpmnXml(response) {
  if (typeof response !== "string") throw new Error("Empty AI response");
  let value = response.trim();
  try {
    const parsed = JSON.parse(value);
    value = parsed.bpmn_xml || parsed.xml || parsed.content || value;
  } catch { /* The response may intentionally be plain XML or a fenced block. */ }
  const fenced = value.match(/```(?:xml|bpmn)?\s*([\s\S]*?)```/i);
  if (fenced) value = fenced[1].trim();
  const start = value.indexOf("<?xml");
  const definitionsStart = value.indexOf("<bpmn:definitions");
  const actualStart = start >= 0 ? start : definitionsStart;
  const endTag = "</bpmn:definitions>";
  const end = value.lastIndexOf(endTag);
  if (actualStart < 0 || end < 0) throw new Error("No BPMN definitions found");
  return value.slice(actualStart, end + endTag.length).trim();
}

export function isLikelyBpmn(xml) {
  return typeof xml === "string" && /<bpmn:definitions\b/.test(xml) && /<bpmn:process\b/.test(xml) && /<bpmndi:BPMNDiagram\b/.test(xml);
}

export function isEditInstruction(instruction) {
  const text = String(instruction || "").trim().toLowerCase();
  if (!text) return false;
  return /\b(add|append|insert|remove|delete|change|modify|move|rename|replace|connect|disconnect|update|edit|after|before)\b|(?:اضافه|افزودن|حذف|تغییر|ویرایش|جابه[‌ ]?جا|قبل|بعد|وصل|قطع|نام.*عوض)/iu.test(text);
}

export function isConversationalPrompt(instruction) {
  const text = String(instruction || "").trim().toLowerCase();
  if (!text) return false;
  if (/^(?:hi|hello|hey|hiya|good\s+(?:morning|afternoon|evening)|سلام|درود|صبح\s*بخیر|عصر\s*بخیر|شب\s*بخیر)[!,.؟?\s]*$/iu.test(text)) return true;
  if (/^(?:thanks?|thank\s+you|bye|goodbye|خداحافظ|ممنون|متشکرم)[!,.؟?\s]*$/iu.test(text)) return true;
  return /\b(?:who are you|what can you do|how (?:do i|to) use (?:petros|this (?:site|app|platform))|help me use (?:petros|this (?:site|app|platform))|explain (?:petros|this (?:site|app|platform)))\b|(?:تو کی هستی|چه کار(?:ی|هایی) می‌توانی|چطور از (?:پتروس|این (?:سایت|برنامه|پلتفرم)) استفاده|راهنمای استفاده از (?:پتروس|این (?:سایت|برنامه|پلتفرم)))/iu.test(text);
}

export function isWorkflowPrompt(instruction) {
  const text = String(instruction || "").trim().toLowerCase();
  if (!text) return false;
  if (isEditInstruction(text)) return true;
  if (/\b(?:bpmn|business process|workflow|process flow|process map|operating procedure|approval flow|onboarding flow|refund process)\b|(?:فرایند|فرآیند|گردش[‌ ]?کار|نمودار\s*bpmn|رویه\s*عملیاتی|فلوچارت)/iu.test(text)) return true;
  if (/\b(?:create|build|design|draw|map|model|generate)\b[\s\S]{0,80}\b(?:approval|onboarding|refund|invoice|procurement|support ticket|leave request|order|claim|request)\b/iu.test(text)) return true;
  if (/(?:بساز|طراحی|ترسیم|مدل|ایجاد)[\s\S]{0,80}(?:تأیید|تایید|پذیرش|بازپرداخت|فاکتور|خرید|درخواست|مرخصی|شکایت)/iu.test(text)) return true;
  const englishSteps = text.match(/\b(?:submit|receive|review|approve|reject|verify|validate|notify|escalate|pay|close|archive|assign)\b/giu) || [];
  const persianSteps = text.match(/(?:ارسال|دریافت|بررسی|تأیید|تایید|رد|اعتبارسنجی|اعلام|ارجاع|پرداخت|بستن|تخصیص)/gu) || [];
  return englishSteps.length >= 2 || persianSteps.length >= 2;
}

export function safeFilename(name, extension) {
  const base = (name || "workflow").trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g, "-").replace(/^-|-$/g, "") || "workflow";
  return `${base}.${extension}`;
}

export function renderMarkdown(markdown) {
  const escaped = String(markdown || "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/^### (.*)$/gm, "<h3>$1</h3>").replace(/^## (.*)$/gm, "<h2>$1</h2>").replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code>$1</code>");
  const lines = escaped.split("\n");
  let html = "", list = null;
  for (const line of lines) {
    const bullet = line.match(/^[-*] (.*)$/), number = line.match(/^\d+[.)] (.*)$/);
    if (bullet || number) {
      const type = bullet ? "ul" : "ol";
      if (list !== type) { if (list) html += `</${list}>`; html += `<${type}>`; list = type; }
      html += `<li>${(bullet || number)[1]}</li>`;
    } else {
      if (list) { html += `</${list}>`; list = null; }
      if (/^<h[1-3]>/.test(line)) html += line;
      else if (line.trim()) html += `<p>${line}</p>`;
    }
  }
  if (list) html += `</${list}>`;
  return html;
}
