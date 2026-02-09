import { NextRequest, NextResponse } from "next/server";
import { getGeminiClient, resetClient } from "@/lib/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, papers, chatHistory, apiKey } = body;

    if (!message) {
      return NextResponse.json({ error: "No message provided" }, { status: 400 });
    }

    if (apiKey) resetClient();
    const ai = getGeminiClient(apiKey || undefined);

    const paperList = papers || [];
    const paperContext = paperList.length > 0
      ? paperList
          .map(
            (p: { title: string; summary: string; keyFindings: string[]; methodology: string; concepts: string[] }, i: number) =>
              `[Paper ${i + 1}: "${p.title}"]\nSummary: ${p.summary}\nKey Findings: ${p.keyFindings?.join("; ")}\nMethodology: ${p.methodology || "N/A"}\nConcepts: ${p.concepts?.join(", ") || "N/A"}`
          )
          .join("\n\n")
      : "";

    // Build multi-turn conversation contents
    const contents: { role: string; parts: { text: string }[] }[] = [];

    // Add chat history as proper multi-turn messages
    if (chatHistory && chatHistory.length > 0) {
      for (const msg of chatHistory.slice(-10)) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
    }

    // Add the current user message
    contents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
      config: {
        systemInstruction: paperContext
          ? `You are ORBIT, an AI research assistant powered by Gemini 3. You help researchers understand papers deeply.

Analyzed papers:
${paperContext}

Instructions:
- Answer questions about the uploaded papers with precision
- Cite specific papers using [Paper N] format
- Identify connections between papers when asked
- Generate scientifically grounded hypotheses when asked
- Use markdown formatting`
          : `You are ORBIT, an AI research assistant powered by Gemini 3. No papers have been uploaded yet. Let the user know they should upload PDFs first for paper-specific analysis, but you can still answer general research questions.`,
      },
    });

    const text = response?.text || "I'm sorry, I couldn't generate a response.";

    // Extract citations
    const citations: { paperId: string; paperTitle: string; excerpt: string; relevance: number }[] = [];
    const citationRegex = /\[Paper (\d+)\]/g;
    let match;
    const seen = new Set<number>();
    while ((match = citationRegex.exec(text)) !== null) {
      const paperIndex = parseInt(match[1]) - 1;
      if (papers && papers[paperIndex] && !seen.has(paperIndex)) {
        seen.add(paperIndex);
        citations.push({
          paperId: papers[paperIndex].id || `paper-${paperIndex}`,
          paperTitle: papers[paperIndex].title,
          excerpt: papers[paperIndex].keyFindings?.[0] || "",
          relevance: 0.9,
        });
      }
    }

    return NextResponse.json({ response: text, citations });
  } catch (error: unknown) {
    console.error("Chat error:", error);
    const message = error instanceof Error ? error.message : "Chat failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
