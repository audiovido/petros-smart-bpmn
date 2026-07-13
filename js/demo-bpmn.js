export const DEMO_BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_Petros" targetNamespace="http://petros.local/bpmn">
  <bpmn:process id="Process_Onboarding" name="Customer Onboarding" isExecutable="false">
    <bpmn:startEvent id="StartEvent_Application" name="Application received"><bpmn:outgoing>Flow_1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:userTask id="Task_Review" name="Review documents"><bpmn:incoming>Flow_1</bpmn:incoming><bpmn:outgoing>Flow_2</bpmn:outgoing></bpmn:userTask>
    <bpmn:serviceTask id="Task_Compliance" name="Run compliance check"><bpmn:incoming>Flow_2</bpmn:incoming><bpmn:outgoing>Flow_3</bpmn:outgoing></bpmn:serviceTask>
    <bpmn:exclusiveGateway id="Gateway_Approved" name="Approved?"><bpmn:incoming>Flow_3</bpmn:incoming><bpmn:outgoing>Flow_4</bpmn:outgoing><bpmn:outgoing>Flow_5</bpmn:outgoing></bpmn:exclusiveGateway>
    <bpmn:serviceTask id="Task_Activate" name="Activate account"><bpmn:incoming>Flow_4</bpmn:incoming><bpmn:outgoing>Flow_6</bpmn:outgoing></bpmn:serviceTask>
    <bpmn:sendTask id="Task_Reject" name="Send rejection notice"><bpmn:incoming>Flow_5</bpmn:incoming><bpmn:outgoing>Flow_7</bpmn:outgoing></bpmn:sendTask>
    <bpmn:endEvent id="EndEvent_Active" name="Customer active"><bpmn:incoming>Flow_6</bpmn:incoming></bpmn:endEvent>
    <bpmn:endEvent id="EndEvent_Rejected" name="Application closed"><bpmn:incoming>Flow_7</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_1" sourceRef="StartEvent_Application" targetRef="Task_Review" />
    <bpmn:sequenceFlow id="Flow_2" sourceRef="Task_Review" targetRef="Task_Compliance" />
    <bpmn:sequenceFlow id="Flow_3" sourceRef="Task_Compliance" targetRef="Gateway_Approved" />
    <bpmn:sequenceFlow id="Flow_4" name="Yes" sourceRef="Gateway_Approved" targetRef="Task_Activate" />
    <bpmn:sequenceFlow id="Flow_5" name="No" sourceRef="Gateway_Approved" targetRef="Task_Reject" />
    <bpmn:sequenceFlow id="Flow_6" sourceRef="Task_Activate" targetRef="EndEvent_Active" />
    <bpmn:sequenceFlow id="Flow_7" sourceRef="Task_Reject" targetRef="EndEvent_Rejected" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_Onboarding"><bpmndi:BPMNPlane id="BPMNPlane_Onboarding" bpmnElement="Process_Onboarding">
    <bpmndi:BPMNShape id="Shape_Start" bpmnElement="StartEvent_Application"><dc:Bounds x="120" y="260" width="36" height="36" /><bpmndi:BPMNLabel><dc:Bounds x="91" y="303" width="95" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Shape_Review" bpmnElement="Task_Review"><dc:Bounds x="220" y="238" width="110" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Shape_Compliance" bpmnElement="Task_Compliance"><dc:Bounds x="395" y="238" width="120" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Shape_Gateway" bpmnElement="Gateway_Approved" isMarkerVisible="true"><dc:Bounds x="585" y="253" width="50" height="50" /><bpmndi:BPMNLabel><dc:Bounds x="581" y="310" width="60" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Shape_Activate" bpmnElement="Task_Activate"><dc:Bounds x="705" y="155" width="110" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Shape_Reject" bpmnElement="Task_Reject"><dc:Bounds x="705" y="330" width="110" height="80" /></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Shape_EndActive" bpmnElement="EndEvent_Active"><dc:Bounds x="885" y="177" width="36" height="36" /><bpmndi:BPMNLabel><dc:Bounds x="857" y="220" width="92" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNShape>
    <bpmndi:BPMNShape id="Shape_EndRejected" bpmnElement="EndEvent_Rejected"><dc:Bounds x="885" y="352" width="36" height="36" /><bpmndi:BPMNLabel><dc:Bounds x="852" y="395" width="104" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNShape>
    <bpmndi:BPMNEdge id="Edge_1" bpmnElement="Flow_1"><di:waypoint x="156" y="278" /><di:waypoint x="220" y="278" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Edge_2" bpmnElement="Flow_2"><di:waypoint x="330" y="278" /><di:waypoint x="395" y="278" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Edge_3" bpmnElement="Flow_3"><di:waypoint x="515" y="278" /><di:waypoint x="585" y="278" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Edge_4" bpmnElement="Flow_4"><di:waypoint x="610" y="253" /><di:waypoint x="610" y="195" /><di:waypoint x="705" y="195" /><bpmndi:BPMNLabel><dc:Bounds x="637" y="174" width="18" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Edge_5" bpmnElement="Flow_5"><di:waypoint x="610" y="303" /><di:waypoint x="610" y="370" /><di:waypoint x="705" y="370" /><bpmndi:BPMNLabel><dc:Bounds x="640" y="378" width="16" height="14" /></bpmndi:BPMNLabel></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Edge_6" bpmnElement="Flow_6"><di:waypoint x="815" y="195" /><di:waypoint x="885" y="195" /></bpmndi:BPMNEdge>
    <bpmndi:BPMNEdge id="Edge_7" bpmnElement="Flow_7"><di:waypoint x="815" y="370" /><di:waypoint x="885" y="370" /></bpmndi:BPMNEdge>
  </bpmndi:BPMNPlane></bpmndi:BPMNDiagram>
</bpmn:definitions>`;
