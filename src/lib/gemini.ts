import { GoogleGenAI } from "@google/genai";

let genaiClient: GoogleGenAI | null = null;

export function getGeminiClient(apiKey?: string): GoogleGenAI {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  if (!genaiClient) {
    genaiClient = new GoogleGenAI({ apiKey: key });
  }
  return genaiClient;
}

export function resetClient() {
  genaiClient = null;
}
