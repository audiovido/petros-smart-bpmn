function escapeXml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

function decodeXml(value) {
  return String(value || "").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
}

function isPersian(value) { return /[\u0600-\u06ff]/u.test(value); }

function processTitle(instruction, currentName = "") {
  let title = String(instruction || "").trim().replace(/[.!؟]+$/u, "");
  title = title.replace(/^(?:please\s+)?(?:create|build|design|make|generate)\s+(?:a|an|the)?\s*/i, "");
  title = title.replace(/^(?:لطفاً\s*)?(?:یک\s*)?(?:فرایند|فرآیند|گردش.?کار)\s*/u, "");
  if (/\b(add|append|insert|remove|delete|change|modify|move|rename|update|edit)\b|(?:اضافه|افزودن|حذف|تغییر|ویرایش)/iu.test(title) && currentName) return `${currentName} — Revised`;
  if (!title || title.length > 64) return currentName || (isPersian(instruction) ? "فرایند هوشمند" : "Smart Process");
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export function generateOfflineBpmn(instruction, currentName = "") {
  const fa = isPersian(instruction);
  const title = escapeXml(processTitle(instruction, currentName));
  const labels = fa ? {
    start: "درخواست دریافت شد", submit: "ثبت اطلاعات درخواست", review: "بررسی درخواست", approved: "تأیید شد؟",
    complete: "اجرای درخواست", reject: "اعلام نتیجه رد", done: "فرایند تکمیل شد", closed: "پرونده بسته شد", yes: "بله", no: "خیر"
  } : {
    start: "Request received", submit: "Capture request details", review: "Review request", approved: "Approved?",
    complete: "Complete request", reject: "Send rejection notice", done: "Process completed", closed: "Case closed", yes: "Yes", no: "No"
  };
  const l = Object.fromEntries(Object.entries(labels).map(([key, value]) => [key, escapeXml(value)]));

  return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_Offline" targetNamespace="http://petros.local/offline">
  <bpmn:process id="Process_Offline" name="${title}" isExecutable="false">
    <bpmn:startEvent id="StartEvent_Request" name="${l.start}"><bpmn:outgoing>Flow_1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:userTask id="Task_Capture" name="${l.submit}"><bpmn:incoming>Flow_1</bpmn:incoming><bpmn:outgoing>Flow_2</bpmn:outgoing></bpmn:userTask>
    <bpmn:userTask id="Task_Review" name="${l.review}"><bpmn:incoming>Flow_2</bpmn:incoming><bpmn:outgoing>Flow_3</bpmn:outgoing></bpmn:userTask>
    <bpmn:exclusiveGateway id="Gateway_Approved" name="${l.approved}"><bpmn:incoming>Flow_3</bpmn:incoming><bpmn:outgoing>Flow_4</bpmn:outgoing><bpmn:outgoing>Flow_5</bpmn:outgoing></bpmn:exclusiveGateway>
    <bpmn:serviceTask id="Task_Complete" name="${l.complete}"><bpmn:incoming>Flow_4</bpmn:incoming><bpmn:outgoing>Flow_6</bpmn:outgoing></bpmn:serviceTask>
    <bpmn:sendTask id="Task_Reject" name="${l.reject}"><bpmn:incoming>Flow_5</bpmn:incoming><bpmn:outgoing>Flow_7</bpmn:outgoing></bpmn:sendTask>
    <bpmn:endEvent id="EndEvent_Done" name="${l.done}"><bpmn:incoming>Flow_6</bpmn:incoming></bpmn:endEvent>
    <bpmn:endEvent id="EndEvent_Closed" name="${l.closed}"><bpmn:incoming>Flow_7</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_Request" targetRef="Task_Capture" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_Capture" targetRef="Task_Review" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_Review" targetRef="Gateway_Approved" />
    <bpmn:sequenceFlow id="Flow_4" name="${l.yes}" sourceRef="Gateway_Approved" targetRef="Task_Complete" />
    <bpmn:sequenceFlow id="Flow_5" name="${l.no}" sourceRef="Gateway_Approved" targetRef="Task_Reject" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_Complete" targetRef="EndEvent_Done" />
    <bpmn:sequenceFlow id="Flow_7" sourceRef="Task_Reject" targetRef="EndEvent_Closed" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_Offline"><bpmndi:BPMNPlane id="BPMNPlane_Offline" bpmnElement="Process_Offline">
    <bpmndi:BPMNShape id="Shape_Start" bpmnElement="StartEvent_Request"><dc:Bounds x="90" y="262" width="36" height="36" /><bpmndi:BPMNLabel><dc:Bounds x="62" y="305" width="92" height="28" /></bpmndi:BPMNLabel></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Shape_Capture" bpmnElement="Task_Capture"><dc:Bounds x="185" y="240" width="120" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Shape_Review" bpmnElement="Task_Review"><dc:Bounds x="365" y="240" width="120" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Shape_Gateway" bpmnElement="Gateway_Approved" isMarkerVisible="true"><dc:Bounds x="555" y="255" width="50" height="50" /><bpmndi:BPMNLabel><dc:Bounds x="540" y="312" width="80" height="20" /></bpmndi:BPMNLabel></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Shape_Complete" bpmnElement="Task_Complete"><dc:Bounds x="675" y="155" width="120" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Shape_Reject" bpmnElement="Task_Reject"><dc:Bounds x="675" y="330" width="120" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Shape_EndDone" bpmnElement="EndEvent_Done"><dc:Bounds x="865" y="177" width="36" height="36" /><bpmndi:BPMNLabel><dc:Bounds x="833" y="220" width="100" height="28" /></bpmndi:BPMNLabel></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Shape_EndClosed" bpmnElement="EndEvent_Closed"><dc:Bounds x="865" y="352" width="36" height="36" /><bpmndi:BPMNLabel><dc:Bounds x="833" y="395" width="100" height="28" /></bpmndi:BPMNLabel></bpmndi:BPMNShape>
    <bpmndi:BPMNEdge id="Edge_1" bpmnElement="Flow_1"><di:waypoint x="126" y="280" /><di:waypoint x="185" y="280" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Edge_2" bpmnElement="Flow_2"><di:waypoint x="305" y="280" /><di:waypoint x="365" y="280" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Edge_3" bpmnElement="Flow_3"><di:waypoint x="485" y="280" /><di:waypoint x="555" y="280" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Edge_4" bpmnElement="Flow_4"><di:waypoint x="580" y="255" /><di:waypoint x="580" y="195" /><di:waypoint x="675" y="195" /><bpmndi:BPMNLabel><dc:Bounds x="615" y="174" width="25" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Edge_5" bpmnElement="Flow_5"><di:waypoint x="580" y="305" /><di:waypoint x="580" y="370" /><di:waypoint x="675" y="370" /><bpmndi:BPMNLabel><dc:Bounds x="615" y="378" width="25" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Edge_6" bpmnElement="Flow_6"><di:waypoint x="795" y="195" /><di:waypoint x="865" y="195" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Edge_7" bpmnElement="Flow_7"><di:waypoint x="795" y="370" /><di:waypoint x="865" y="370" /></bpmndi:BPMNEdge>
  </bpmndi:BPMNPlane></bpmndi:BPMNDiagram>
</bpmn:definitions>`;
}

function diagramSummary(xml) {
  const process = decodeXml(xml.match(/<bpmn:process\b[^>]*\bname="([^"]+)"/i)?.[1] || "Workflow");
  const nodePattern = /<bpmn:(?:userTask|serviceTask|sendTask|manualTask|businessRuleTask|scriptTask)\b[^>]*\bname="([^"]+)"/gi;
  const tasks = [...xml.matchAll(nodePattern)].map((match) => decodeXml(match[1]));
  const gateways = (xml.match(/<bpmn:(?:exclusive|parallel|inclusive)Gateway\b/gi) || []).length;
  const starts = (xml.match(/<bpmn:startEvent\b/gi) || []).length;
  const ends = (xml.match(/<bpmn:endEvent\b/gi) || []).length;
  return { process, tasks, gateways, starts, ends };
}

export function auditOfflineBpmn(xml, lang = "en") {
  const { process, tasks, gateways, starts, ends } = diagramSummary(xml);
  if (lang === "fa") return `### سلامت فرایند: قابل اجرا\n- فرایند **${process}** شامل ${tasks.length} فعالیت و ${gateways} نقطه تصمیم است.\n- ${starts === 1 ? "نقطه شروع یکتا و مشخص است." : "تعداد نقاط شروع را بازبینی کنید."}\n- ${ends > 0 ? `${ends} مسیر پایان تعریف شده است.` : "برای فرایند نقطه پایان تعریف کنید."}\n- برای هر فعالیت مسئول، زمان هدف و شاخص کنترل تعریف کنید.\n- مسیرهای خطا، مهلت زمانی و ارجاع مدیریتی را قبل از اجرا مستند کنید.`;
  return `### Process health: Operational\n- **${process}** contains ${tasks.length} activities and ${gateways} decision point${gateways === 1 ? "" : "s"}.\n- ${starts === 1 ? "A single, clear start point is defined." : "Review the number of start points."}\n- ${ends > 0 ? `${ends} completion path${ends === 1 ? " is" : "s are"} defined.` : "Add at least one end event."}\n- Assign an owner, target duration, and control metric to every activity.\n- Document failure paths, timeouts, and escalation rules before execution.`;
}

export function sopOfflineBpmn(xml, lang = "en") {
  const { process, tasks, gateways } = diagramSummary(xml);
  const taskLines = tasks.map((task, index) => `${index + 1}. ${task}.`).join("\n");
  if (lang === "fa") return `## ۱. هدف\nاجرای یکپارچه و قابل اندازه‌گیری فرایند **${process}**.\n\n## ۲. دامنه و نقش‌ها\nاین دستورالعمل برای مالکان فرایند، مجریان فعالیت‌ها و تأییدکنندگان تصمیم‌ها کاربرد دارد. مسئول هر مرحله باید پیش از اجرا تعیین شود.\n\n## ۳. روش اجرا\n${taskLines || "1. مراحل فرایند را در نمودار تعریف کنید."}\n\n## ۴. تصمیم‌ها و استثناها\n${gateways ? `${gateways} نقطه تصمیم طبق شرایط ثبت‌شده در نمودار اجرا می‌شود.` : "نقطه تصمیمی تعریف نشده است."} موارد ناموفق باید ثبت، ارجاع و تا بسته‌شدن پیگیری شوند.\n\n## ۵. کنترل و شاخص‌ها\n- زمان چرخه کل\n- درصد تکمیل موفق\n- نرخ بازگشت یا رد\n- تعداد موارد خارج از SLA`;
  return `## 1. Purpose\nExecute the **${process}** process consistently and measurably.\n\n## 2. Scope and roles\nThis procedure applies to process owners, activity performers, and decision approvers. Assign an accountable owner before execution.\n\n## 3. Procedure\n${taskLines || "1. Define process activities on the diagram."}\n\n## 4. Decisions and exceptions\n${gateways ? `${gateways} decision point${gateways === 1 ? " is" : "s are"} executed using the conditions shown on the diagram.` : "No decision point is defined."} Log, escalate, and track failed cases through closure.\n\n## 5. Controls and KPIs\n- Total cycle time\n- Successful completion rate\n- Rework or rejection rate\n- Cases outside SLA`;
}
