import { GoogleGenAI, FunctionDeclaration, Type, Tool } from "@google/genai";
import { MockBackend } from "./mockBackend";

const apiKey = process.env.API_KEY || ''; 
const ai = new GoogleGenAI({ apiKey });

const checkAvailabilityTool: FunctionDeclaration = { name: 'checkAvailability', description: 'Verifica horários', parameters: { type: Type.OBJECT, properties: { date: { type: Type.STRING } }, required: ['date'] } };
const bookAppointmentTool: FunctionDeclaration = { name: 'bookAppointment', description: 'Agendar', parameters: { type: Type.OBJECT, properties: { date: { type: Type.STRING }, time: { type: Type.STRING }, service: { type: Type.STRING } }, required: ['date','time','service'] } };
const tools: Tool[] = [{ functionDeclarations: [checkAvailabilityTool, bookAppointmentTool] }];

export const generateAIResponse = async (history: any[], lastMessage: string, customerId: string): Promise<string> => {
  if (!apiKey) return "ERRO: API Key não configurada.";
  const ctx = await MockBackend.getCustomerContext(customerId);
  const model = "gemini-3-flash-preview";
  const systemInstruction = `Você é a Luna do AgendaPet+. Contexto: ${ctx}. Verifique disponibilidade antes de agendar. Hoje: ${new Date().toISOString().split('T')[0]}`;
  
  const contents = history.map(h => ({ role: h.role, parts: h.parts }));

  try {
    const result = await ai.models.generateContent({ model, contents, config: { systemInstruction, tools, temperature: 0.3 } });
    const candidate = result.candidates?.[0];
    if (!candidate || !candidate.content) return "Erro.";
    
    for (const part of candidate.content.parts) {
        if (part.functionCall) {
            const fc = part.functionCall;
            const args = fc.args as any;
            let res: any;
            if (fc.name === 'checkAvailability') res = { slots: await MockBackend.getAvailableSlots(args.date) };
            if (fc.name === 'bookAppointment') res = await MockBackend.bookAppointment(customerId, args.date, args.time, args.service);
            
            const newContents = [...contents];
            newContents.push({ role: 'model', parts: candidate.content.parts });
            newContents.push({ role: 'user', parts: [{ functionResponse: { name: fc.name, response: { result: res } } }] });

            const result2 = await ai.models.generateContent({ model, contents: newContents, config: { systemInstruction, tools } });
            return result2.text || "Processado.";
        }
    }
    return result.text || "";
  } catch (e) { console.error(e); return "Erro técnico."; }
};