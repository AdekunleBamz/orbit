import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, resetClient } from "@/lib/gemini";

function extractJSON(text: string): unknown {
  try {
    return JSON.parse(text.trim());
  } catch {
    // ignore
  }
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch {
      // ignore
    }
  }
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
    const body = await request.json();
    const { papers, apiKey } = body;

    if (!papers || papers.length < 2) {
      return NextResponse.json(
        { error: "At least 2 papers are required for synthesis" },
        { status: 400 }
      );
    }

    if (apiKey) resetClient();
    const ai = getGeminiClient(apiKey || undefined);

    const paperSummaries = papers
      .map(
        (p: { id: string; title: string; summary: string; keyFindings: string[]; methodology: string; concepts: { name: string }[] }, i: number) =>
          `[Paper ${i + 1} - ID: ${p.id}]: "${p.title}"
Summary: ${p.summary}
Key Findings: ${p.keyFindings?.join("; ")}
Methodology: ${p.methodology}
Concepts: ${p.concepts?.map((c: { name: string }) => c.name).join(", ")}`
      )
      .join("\n\n---\n\n");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these papers together and identify connections, contradictions, and research gaps.

Papers:
${paperSummaries}`,
      config: {
        systemInstruction: `You are a research synthesis expert. Analyze the given papers together and identify connections, contradictions, and research gaps.

Return your synthesis as a JSON object with EXACTLY this structure (no markdown, no code fences, just raw JSON):
{
  "connections": [
    {
      "description": "Description of the connection",
      "paperIds": ["id1", "id2"],
      "strength": 0.85,
      "type": "supports|extends|applies|references"
    }
  ],
  "contradictions": [
    {
      "description": "Description of the contradiction",
      "paperIds": ["id1", "id2"],
      "severity": "minor|moderate|major"
    }
  ],
  "gaps": ["Research gap 1", "Research gap 2"],
  "hypotheses": [
    "Novel hypothesis 1 that could be tested based on these papers",
    "Novel hypothesis 2"
  ],
  "summary": "A comprehensive 300-word synthesis summary connecting all the papers"
}

Be thorough. Find at least 3 connections, look for any contradictions, identify 2+ research gaps, and generate 2+ novel hypotheses that could lead to new research directions.`,
        responseMimeType: "application/json",
      },
    });

    const text = response?.text || "";
    const synthesis = extractJSON(text);

    return NextResponse.json({ synthesis });
  } catch (error: unknown) {
    console.error("Synthesis error:", error);
    const message = error instanceof Error ? error.message : "Synthesis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
