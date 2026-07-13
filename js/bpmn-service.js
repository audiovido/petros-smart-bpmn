import { isLikelyBpmn } from "./utils.js?v=2.0.0";

export class BpmnWorkspace {
  constructor(container, onChange) {
    if (!window.BpmnJS) throw new Error("bpmn-js failed to load");
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
  }

  async import(xml) {
    if (!isLikelyBpmn(xml)) throw new Error("Missing BPMN 2.0 process or diagram interchange data");
    await this.modeler.importXML(xml);
    const saved = await this.modeler.saveXML({ format: true });
    this.xml = saved.xml;
    this.fit();
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
