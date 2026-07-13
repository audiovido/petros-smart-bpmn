export const translations = {
  en: {
    brandSubtitle: "PROCESS INTELLIGENCE", workspaceLive: "Workspace live", autosaved: "Autosaved", settings: "Settings",
    controlEyebrow: "AI CONTROL CENTER", controlTitle: "Build with intent.", demoMode: "Demo mode", connected: "AI connected",
    design: "Design", audit: "Audit", sop: "SOP", now: "NOW",
    welcomeMessage: "Describe a business process or tell me how to refine the canvas. I’ll translate your intent into a production-ready BPMN 2.0 workflow.",
    suggestionOne: "Customer refund process", suggestionTwo: "Add manager approval", promptLabel: "Describe your process",
    promptPlaceholder: "Describe a process or request a change…", sendHint: "to generate", generate: "Generate",
    runAudit: "Run AI audit", auditHint: "Find risks & bottlenecks", generateSop: "Generate SOP", sopHint: "Create operating guide",
    workflowTitle: "Customer Onboarding", elementSingular: "element", elementPlural: "elements", bpmnDocument: "BPMN 2.0 document", fit: "Fit", export: "Export",
    editableFile: "Editable source file", vectorImage: "Vector image", thinking: "Architecting your workflow…", thinkingHint: "Validating BPMN 2.0 structure",
    canvasTip: "Drag to pan · Scroll to zoom", syntaxValid: "BPMN syntax valid", editedNow: "Edited just now", localOnly: "Local only",
    connectionEyebrow: "AI CONNECTION", settingsTitle: "Connect your intelligence layer", settingsDescription: "Petros stores a separate key for every provider. Keys stay in this browser and are sent only to the selected provider.",
    provider: "Provider", model: "Model", apiKey: "API key", customEndpoint: "Compatible endpoint", getProviderKey: "Get a provider API key", privacyNote: "Stored locally on this device. Never sent to Petros servers.", clearKey: "Clear current key", saveConnection: "Save connection",
    businessContext: "Business context", businessContextPlaceholder: "Describe your company, customers, policies, roles, systems, risks, and operational goals…", businessContextNote: "Used in every AI request so Petros responds with senior, business-aware engineering guidance.",
    demoTitle: "Demo workspace ready", demoBody: "Add an API key in Settings to generate custom workflows. A premium demo is loaded for now.",
    offlineGeneratedTitle: "Offline workflow generated", offlineGeneratedBody: "A local BPMN workflow was created instantly. Connect an AI key for deeper process interpretation.",
    savedTitle: "Connection saved", savedBody: "Your selected AI provider and business context are ready.", clearedTitle: "Key removed", clearedBody: "Petros is back in safe offline mode for this provider.",
    keyFormatTitle: "Invalid key format", keyFormatBody: "Enter a complete key that matches the selected provider.",
    missingPromptTitle: "Describe your process", missingPromptBody: "Enter a workflow or editing instruction first.",
    generatedTitle: "Workflow generated", generatedBody: "The new BPMN 2.0 model is live on the canvas.",
    invalidXmlTitle: "Invalid BPMN response", invalidXmlBody: "The AI response was not valid BPMN 2.0 XML. Your current diagram is unchanged.",
    apiErrorTitle: "AI request failed", apiErrorBody: "Check your key, model, provider access, and connection, then try again.",
    invalidKeyTitle: "API key rejected", invalidKeyBody: "The provider did not accept this key. Clear it in Settings and add a valid project key.",
    quotaTitle: "API quota unavailable", quotaBody: "The key is valid, but this API project has no available credits or billing quota.",
    rateTitle: "Rate limit reached", rateBody: "The provider is receiving too many requests. Wait briefly and try again.",
    modelErrorTitle: "Model unavailable", modelErrorBody: "This project cannot access the selected model. Choose another model in Settings.",
    endpointErrorTitle: "Endpoint required", endpointErrorBody: "Enter the full HTTPS chat-completions endpoint for the custom provider.",
    networkErrorTitle: "Connection blocked", networkErrorBody: "The browser could not reach the AI provider. Check connectivity, extensions, and provider availability.",
    auditTitle: "AI process audit", auditEyebrow: "RISK & OPTIMIZATION", sopTitle: "Standard Operating Procedure", sopEyebrow: "GENERATED DOCUMENT",
    exportTitle: "Export complete", exportBody: "Your workflow file has been downloaded.", exportErrorTitle: "Export failed", exportErrorBody: "The browser could not prepare this workflow file. Try again after reloading the diagram.", mockAudit: "### Process health: Strong\n- The happy path is complete from start to finish.\n- Add a **timeout boundary event** to the compliance review.\n- Define an escalation owner for rejected applications.\n- Track cycle time between document review and activation.",
    mockSop: "## 1. Purpose\nStandardize customer onboarding from application receipt through account activation.\n\n## 2. Roles\n- **Applicant:** Submits required information.\n- **Operations:** Reviews documentation.\n- **Compliance:** Performs risk checks.\n- **Account team:** Activates the approved account.\n\n## 3. Procedure\n1. Receive the application and validate required fields.\n2. Review customer documents.\n3. Perform compliance checks.\n4. If approved, activate the account and notify the customer.\n5. If rejected, notify the customer with the reason and close the case."
  },
  fa: {
    brandSubtitle: "هوشمندی فرایند", workspaceLive: "فضای کار فعال", autosaved: "ذخیره خودکار", settings: "تنظیمات",
    controlEyebrow: "مرکز کنترل هوش مصنوعی", controlTitle: "هدفمند طراحی کنید.", demoMode: "حالت نمایشی", connected: "هوش مصنوعی متصل",
    design: "طراحی", audit: "ممیزی", sop: "دستورالعمل", now: "اکنون",
    welcomeMessage: "فرایند کسب‌وکار را شرح دهید یا بگویید نمودار چگونه تغییر کند. من خواسته شما را به یک گردش‌کار استاندارد BPMN 2.0 تبدیل می‌کنم.",
    suggestionOne: "فرایند بازپرداخت مشتری", suggestionTwo: "افزودن تأیید مدیر", promptLabel: "شرح فرایند",
    promptPlaceholder: "یک فرایند یا تغییر موردنظر را شرح دهید…", sendHint: "برای تولید", generate: "تولید",
    runAudit: "اجرای ممیزی هوشمند", auditHint: "یافتن ریسک و گلوگاه", generateSop: "تولید دستورالعمل", sopHint: "ساخت راهنمای اجرایی",
    workflowTitle: "پذیرش مشتری جدید", elementSingular: "عنصر", elementPlural: "عنصر", bpmnDocument: "سند BPMN 2.0", fit: "تطبیق", export: "خروجی",
    editableFile: "فایل منبع قابل ویرایش", vectorImage: "تصویر برداری", thinking: "در حال معماری گردش‌کار…", thinkingHint: "اعتبارسنجی ساختار BPMN 2.0",
    canvasTip: "برای جابه‌جایی بکشید · برای زوم اسکرول کنید", syntaxValid: "ساختار BPMN معتبر است", editedNow: "همین حالا ویرایش شد", localOnly: "فقط محلی",
    connectionEyebrow: "اتصال هوش مصنوعی", settingsTitle: "لایه هوشمندی را متصل کنید", settingsDescription: "پتروس برای هر ارائه‌دهنده یک کلید جدا ذخیره می‌کند. کلیدها در همین مرورگر می‌مانند و فقط به ارائه‌دهنده منتخب ارسال می‌شوند.",
    provider: "ارائه‌دهنده", model: "مدل", apiKey: "کلید API", customEndpoint: "نشانی سازگار", getProviderKey: "دریافت کلید API ارائه‌دهنده", privacyNote: "به‌صورت محلی روی این دستگاه ذخیره می‌شود و به سرورهای پتروس ارسال نمی‌شود.", clearKey: "حذف کلید فعلی", saveConnection: "ذخیره اتصال",
    businessContext: "زمینه کسب‌وکار", businessContextPlaceholder: "شرکت، مشتریان، سیاست‌ها، نقش‌ها، سامانه‌ها، ریسک‌ها و اهداف عملیاتی را شرح دهید…", businessContextNote: "در همه درخواست‌های هوش مصنوعی استفاده می‌شود تا پتروس پاسخ مهندسی ارشد و متناسب با کسب‌وکار ارائه کند.",
    demoTitle: "فضای نمایشی آماده است", demoBody: "برای ساخت گردش‌کار اختصاصی، کلید API را در تنظیمات وارد کنید. فعلاً یک نمونه حرفه‌ای بارگذاری شد.",
    offlineGeneratedTitle: "گردش‌کار آفلاین ساخته شد", offlineGeneratedBody: "یک گردش‌کار BPMN به‌صورت محلی ساخته شد. برای تحلیل عمیق‌تر، کلید هوش مصنوعی را متصل کنید.",
    savedTitle: "اتصال ذخیره شد", savedBody: "ارائه‌دهنده هوش مصنوعی و زمینه کسب‌وکار آماده است.", clearedTitle: "کلید حذف شد", clearedBody: "پتروس برای این ارائه‌دهنده به حالت آفلاین امن بازگشت.",
    keyFormatTitle: "قالب کلید نامعتبر است", keyFormatBody: "یک کلید کامل و متناسب با ارائه‌دهنده انتخاب‌شده وارد کنید.",
    missingPromptTitle: "فرایند را شرح دهید", missingPromptBody: "ابتدا یک گردش‌کار یا دستور ویرایش وارد کنید.",
    generatedTitle: "گردش‌کار ساخته شد", generatedBody: "مدل جدید BPMN 2.0 روی بوم فعال است.",
    invalidXmlTitle: "پاسخ BPMN نامعتبر", invalidXmlBody: "پاسخ هوش مصنوعی XML معتبر BPMN 2.0 نبود. نمودار فعلی بدون تغییر باقی ماند.",
    apiErrorTitle: "درخواست هوش مصنوعی ناموفق بود", apiErrorBody: "کلید، مدل، سطح دسترسی و اتصال خود را بررسی و دوباره تلاش کنید.",
    invalidKeyTitle: "کلید API پذیرفته نشد", invalidKeyBody: "ارائه‌دهنده این کلید را نپذیرفت. آن را در تنظیمات حذف و یک کلید پروژه معتبر اضافه کنید.",
    quotaTitle: "سهمیه API در دسترس نیست", quotaBody: "کلید معتبر است، اما این پروژه API اعتبار یا سهمیه صورتحساب ندارد.",
    rateTitle: "محدودیت تعداد درخواست", rateBody: "درخواست‌های زیادی به ارائه‌دهنده ارسال شده است. کمی صبر کنید و دوباره تلاش کنید.",
    modelErrorTitle: "مدل در دسترس نیست", modelErrorBody: "این پروژه به مدل انتخاب‌شده دسترسی ندارد. مدل دیگری را در تنظیمات انتخاب کنید.",
    endpointErrorTitle: "نشانی سرویس لازم است", endpointErrorBody: "نشانی کامل HTTPS سرویس Chat Completions را برای ارائه‌دهنده سفارشی وارد کنید.",
    networkErrorTitle: "اتصال مسدود است", networkErrorBody: "مرورگر نتوانست به ارائه‌دهنده هوش مصنوعی متصل شود. اینترنت، افزونه‌ها و وضعیت سرویس را بررسی کنید.",
    auditTitle: "ممیزی هوشمند فرایند", auditEyebrow: "ریسک و بهینه‌سازی", sopTitle: "دستورالعمل استاندارد عملیات", sopEyebrow: "سند تولیدشده",
    exportTitle: "خروجی آماده شد", exportBody: "فایل گردش‌کار شما دانلود شد.", exportErrorTitle: "خروجی ناموفق بود", exportErrorBody: "مرورگر نتوانست فایل گردش‌کار را آماده کند. پس از بارگذاری مجدد نمودار دوباره تلاش کنید.", mockAudit: "### سلامت فرایند: مطلوب\n- مسیر اصلی از شروع تا پایان کامل است.\n- برای بررسی تطبیق، **رویداد مرزی زمان** اضافه کنید.\n- برای درخواست‌های ردشده، مسئول ارجاع مشخص کنید.\n- زمان چرخه بین بررسی مدارک و فعال‌سازی را اندازه‌گیری کنید.",
    mockSop: "## ۱. هدف\nاستانداردسازی پذیرش مشتری از دریافت درخواست تا فعال‌سازی حساب.\n\n## ۲. نقش‌ها\n- **متقاضی:** اطلاعات لازم را ارسال می‌کند.\n- **عملیات:** مدارک را بررسی می‌کند.\n- **تطبیق:** کنترل‌های ریسک را انجام می‌دهد.\n- **تیم حساب:** حساب تأییدشده را فعال می‌کند.\n\n## ۳. روش اجرا\n1. درخواست را دریافت و فیلدهای الزامی را کنترل کنید.\n2. مدارک مشتری را بررسی کنید.\n3. کنترل‌های تطبیق را انجام دهید.\n4. در صورت تأیید، حساب را فعال و مشتری را مطلع کنید.\n5. در صورت رد، دلیل را به مشتری اعلام و پرونده را ببندید."
  }
};

export function applyLanguage(lang) {
  const dictionary = translations[lang] || translations.en;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  document.body.dir = document.documentElement.dir;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    const value = dictionary[node.dataset.i18n];
    if (value) node.textContent = value;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((node) => {
    const value = dictionary[node.dataset.i18nPlaceholder];
    if (value) node.placeholder = value;
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((node) => {
    const value = dictionary[node.dataset.i18nAria];
    if (value) node.setAttribute("aria-label", value);
  });
  return dictionary;
}
