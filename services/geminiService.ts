
import { GoogleGenAI } from "@google/genai";
import { GEMINI_PROMPT_PREAMBLE } from "../constants";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function generateReport(userQuery: string, fileStructure: string): Promise<string> {
  const model = 'gemini-2.5-pro';

  const fullPrompt = `
${GEMINI_PROMPT_PREAMBLE}

------------------------------------------------------------
CONTEXT
------------------------------------------------------------
I am analyzing an IMS dataset with the following structure. The content is in an Excel file with multiple sheets. Here is a summary of the sheets and their columns (headers):

${fileStructure}

------------------------------------------------------------
USER REQUEST
------------------------------------------------------------
Based on the data structure provided, please perform the following analysis:

${userQuery}

------------------------------------------------------------
INSTRUCTIONS
------------------------------------------------------------
Generate a complete report based on the request and the provided data context. Follow the specified "OUTPUT STRUCTURE TEMPLATE" precisely. Ensure the output is a single, well-formatted Markdown document.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: fullPrompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a response from the AI model.");
  }
}
