import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, resetClient } from "@/lib/gemini";

function extractJSON(text: string): unknown {
  // Try parsing the raw text first
  try {
    return JSON.parse(text.trim());
  } catch {
    // ignore
  }
  // Strip code fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // ignore
    }
  }
  // Try to find the first { ... } block
  const braceMatch = text.match(/\{[\s\S]*\}/);
  if (braceMatch) {
    try {
      return JSON.parse(braceMatch[0]);
    } catch {
      // ignore
    }
  }
  throw new Error("Failed to parse JSON from model response");
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const apiKey = formData.get("apiKey") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (apiKey) resetClient();
    const ai = getGeminiClient(apiKey || undefined);

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "application/pdf",
                data: base64,
              },
            },
            { text: "Analyze this research paper thoroughly. Extract all key information including text, figures, charts, tables, and equations." },
          ],
        },
      ],
      config: {
        systemInstruction: `You are a scientific research analyst. Analyze the given research paper (PDF) thoroughly.

Return your analysis as a JSON object with EXACTLY this structure (no markdown, no code fences, just raw JSON):
{
  "title": "paper title",
  "authors": ["author1", "author2"],
  "abstract": "brief abstract/summary",
  "keyFindings": ["finding 1", "finding 2", "finding 3"],
  "methodology": "description of the methodology used",
  "concepts": [
    {
      "id": "concept_id",
      "name": "Concept Name",
      "description": "What this concept is about",
      "category": "method|finding|theory|data|metric|tool",
      "importance": 0.8,
      "relatedConcepts": ["other_concept_id"]
    }
  ],
  "equations": ["equation 1 in LaTeX", "equation 2"],
  "limitations": ["limitation 1", "limitation 2"],
  "futureWork": ["suggestion 1", "suggestion 2"],
  "summary": "A comprehensive 200-word summary of the paper"
}

Extract AT LEAST 6-10 key concepts. For each concept, assign an importance score (0-1) and identify which other concepts it relates to. Categorize each as: method, finding, theory, data, metric, or tool.

Analyze ALL aspects: text content, figures, charts, tables, and equations. Be thorough and precise.`,
        responseMimeType: "application/json",
      },
    });

    const text = response?.text || "";
    const analysis = extractJSON(text);

    return NextResponse.json({ analysis });
  } catch (error: unknown) {
    console.error("Analysis error:", error);
    const message = error instanceof Error ? error.message : "Analysis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
