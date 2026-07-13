import { isLikelyBpmn } from "./utils.js?v=3.0.0";

const BPMN_FA = {
  "Activate hand tool": "فعال‌سازی ابزار جابه‌جایی",
  "Activate lasso tool": "فعال‌سازی ابزار انتخاب",
  "Activate create/remove space tool": "فعال‌سازی ابزار ایجاد یا حذف فضا",
  "Activate global connect tool": "فعال‌سازی ابزار اتصال",
  "Create start event": "ایجاد رویداد آغاز",
  "Create intermediate/boundary event": "ایجاد رویداد میانی یا مرزی",
  "Create end event": "ایجاد رویداد پایان",
  "Create gateway": "ایجاد دروازه",
  "Create task": "ایجاد فعالیت",
  "Create expanded sub-process": "ایجاد زیرفرایند بازشده",
  "Create data object reference": "ایجاد مرجع شیء داده",
  "Create data store reference": "ایجاد مرجع مخزن داده",
  "Create pool/participant": "ایجاد استخر یا مشارکت‌کننده",
  "Create group": "ایجاد گروه",
  "Append task": "افزودن فعالیت",
  "Append gateway": "افزودن دروازه",
  "Append end event": "افزودن رویداد پایان",
  "Change element": "تغییر عنصر",
  "Connect using sequence/message flow or association": "اتصال با جریان توالی، پیام یا ارتباط",
  "Remove": "حذف"
};

export class BpmnWorkspace {
  constructor(container, onChange, lang = "en") {
    if (!window.BpmnJS) throw new Error("bpmn-js failed to load");
    this.container = container;
    this.lang = lang;
    this.modeler = new window.BpmnJS({ container });
    this.xml = "";
    this.onChange = onChange;
    this.modeler.on("commandStack.changed", async () => {
      try {
        const { xml } = await this.modeler.saveXML({ format: true });
        this.xml = xml;
        this.onChange?.(xml, this.elementCount(), this.processName());
      } catch { /* Keep the last valid serialized state. */ }
    });
    this.translationObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => mutation.addedNodes.forEach((node) => this.translateControls(node)));
    });
    this.translationObserver.observe(container, { childList: true, subtree: true });
  }

  translateControls(root = this.container) {
    if (!(root instanceof Element)) return;
    const nodes = root.matches("[title]") ? [root, ...root.querySelectorAll("[title]")] : [...root.querySelectorAll("[title]")];
    nodes.forEach((node) => {
      const original = node.dataset.petrosTitle || node.getAttribute("title") || "";
      if (!node.dataset.petrosTitle) node.dataset.petrosTitle = original;
      node.setAttribute("title", this.lang === "fa" ? BPMN_FA[original] || original : original);
    });
  }

  setLanguage(lang) { this.lang = lang; this.translateControls(); }

  async import(xml) {
    if (!isLikelyBpmn(xml)) throw new Error("Missing BPMN 2.0 process or diagram interchange data");
    await this.modeler.importXML(xml);
    const saved = await this.modeler.saveXML({ format: true });
    this.xml = saved.xml;
    this.fit();
    this.translateControls();
    this.onChange?.(this.xml, this.elementCount(), this.processName());
    return this.xml;
  }

  fit() { this.modeler.get("canvas").zoom("fit-viewport", "auto"); }
  zoom() { return this.modeler.get("canvas").zoom(); }
  elementCount() {
    return this.modeler.get("elementRegistry").filter((element) => !element.labelTarget && element.businessObject?.$instanceOf?.("bpmn:FlowNode")).length;
  }
  processName() {
    const definitions = this.modeler.get("canvas").getRootElement()?.businessObject?.$parent;
    const process = definitions?.rootElements?.find((element) => element.$type === "bpmn:Process");
    return process?.name || "Untitled Workflow";
  }
  async exportSvg() { return (await this.modeler.saveSVG()).svg; }
  async exportXml() { return (await this.modeler.saveXML({ format: true })).xml; }
}
