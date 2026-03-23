import { GoogleGenAI, Type } from "@google/genai";
import { FormDefinition } from "../types";
import { DEFAULT_SYSTEM_INSTRUCTION } from "../constants";

export const createChatSession = (form: FormDefinition) => {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  
  const properties: Record<string, any> = {};
  const required: string[] = [];

  form.fields.forEach(field => {
    let type = Type.STRING;
    if (field.type === 'number') type = Type.NUMBER;
    
    properties[field.id] = {
      type,
      description: field.label
    };
    if (field.required) required.push(field.id);
  });

  const submitTool = {
    name: "submitForm",
    parameters: {
      type: Type.OBJECT,
      description: `Submit the ${form.title} form.`,
      properties,
      required,
    },
  };

  const grantExceptionTool = {
    name: "grantException",
    parameters: {
      type: Type.OBJECT,
      description: "Grant an exception for a field after a valid rationale is provided.",
      properties: {
        field: { type: Type.STRING, description: "The field name (e.g., Age, Score)" },
        rationale: { type: Type.STRING, description: "The 30+ character rationale containing keywords." }
      },
      required: ["field", "rationale"],
    },
  };

  const dynamicInstruction = `${DEFAULT_SYSTEM_INSTRUCTION}
You are collecting information for the form: "${form.title}".
Description: ${form.description}
Fields to collect:
${form.fields.map((f, i) => `${i+1}. ${f.label} (ID: ${f.id}, Type: ${f.type}${f.required ? ', required' : ''})`).join('\n')}

EXCEPTION HANDLING:
If a soft rule is hit (Age < 18 or > 35, Score < 60% or < 6.0 CGPA, Graduation Year < 2020), you MUST call 'grantException' ONLY AFTER the user provides a valid 30+ character rationale containing one of the mandatory keywords. Do NOT accept these values silently.

DOCUMENT SCANNING: If a user uploads a document (PDF, image, or text file), you MUST scan its content to extract relevant information for the form. Verify the extracted data with the user and ask for any missing or unclear details.
Remember: Summarize everything and get explicit confirmation before calling 'submitForm'.`;

  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: dynamicInstruction,
      tools: [{ functionDeclarations: [submitTool, grantExceptionTool] }],
    },
  });
};

export const prepareMessageContent = (input: string, fileData: { name: string, data: string } | null) => {
  if (!fileData) return input;

  const base64 = fileData.data.split(',')[1];
  const mimeType = fileData.data.split(';')[0].split(':')[1];
  
  const isMultimodal = 
    mimeType.startsWith('image/') || 
    mimeType === 'application/pdf' || 
    mimeType.startsWith('text/') ||
    mimeType === 'application/json' ||
    mimeType === 'application/xml';

  if (isMultimodal) {
    return [
      { text: input || `Scanning document: ${fileData.name}` },
      { inlineData: { data: base64, mimeType } }
    ];
  } else {
    return `[File Uploaded: ${fileData.name}]\n${input}\n(File Data URL: ${fileData.data})`;
  }
};
