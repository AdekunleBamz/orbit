export function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function getConceptColor(category: string): string {
  const colors: Record<string, string> = {
    method: "#22d3ee",
    finding: "#34d399",
    theory: "#a78bfa",
    data: "#fbbf24",
    metric: "#f87171",
    tool: "#fb923c",
  };
  return colors[category] || "#94a3b8";
}

export function getConceptBg(category: string): string {
  const colors: Record<string, string> = {
    method: "bg-cyan-500/20 border-cyan-500/30 text-cyan-300",
    finding: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300",
    theory: "bg-violet-500/20 border-violet-500/30 text-violet-300",
    data: "bg-amber-500/20 border-amber-500/30 text-amber-300",
    metric: "bg-red-500/20 border-red-500/30 text-red-300",
    tool: "bg-orange-500/20 border-orange-500/30 text-orange-300",
  };
  return colors[category] || "bg-slate-500/20 border-slate-500/30 text-slate-300";
}

export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
  });
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportAnalysisAsMarkdown(analysis: {
  title: string;
  authors: string[];
  summary: string;
  keyFindings: string[];
  methodology: string;
  concepts: { name: string; category: string; importance: number }[];
  limitations: string[];
  futureWork: string[];
  equations: string[];
}) {
  const lines = [
    `# ${analysis.title}`,
    `**Authors:** ${analysis.authors.join(", ")}`,
    "",
    "## Summary",
    analysis.summary,
    "",
    "## Key Findings",
    ...analysis.keyFindings.map((f, i) => `${i + 1}. ${f}`),
    "",
    "## Methodology",
    analysis.methodology,
    "",
    "## Key Concepts",
    ...analysis.concepts.map(
      (c) => `- **${c.name}** (${c.category}, importance: ${Math.round(c.importance * 100)}%)`
    ),
    "",
    "## Limitations",
    ...analysis.limitations.map((l) => `- ${l}`),
    "",
    "## Future Work",
    ...analysis.futureWork.map((f) => `- ${f}`),
  ];

  if (analysis.equations.length > 0) {
    lines.push("", "## Equations");
    analysis.equations.forEach((eq) => lines.push(`- $${eq}$`));
  }

  const filename = analysis.title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_").substring(0, 50);
  downloadFile(lines.join("\n"), `${filename}_analysis.md`);
}

export function exportChatAsMarkdown(
  messages: { role: string; content: string; timestamp: Date }[]
) {
  const lines = [
    "# ORBIT Research Q&A Transcript",
    `*Exported on ${formatDate(new Date())}*`,
    "",
    "---",
    "",
  ];

  for (const msg of messages) {
    const role = msg.role === "user" ? "**You**" : "**ORBIT**";
    lines.push(`### ${role} — ${formatDate(new Date(msg.timestamp))}`);
    lines.push(msg.content);
    lines.push("");
  }

  downloadFile(lines.join("\n"), `orbit_chat_${Date.now()}.md`);
}

export function exportSynthesisAsMarkdown(synthesis: {
  summary: string;
  connections: { description: string; type: string; strength: number }[];
  contradictions: { description: string; severity: string }[];
  gaps: string[];
  hypotheses: string[];
}) {
  const lines = [
    "# ORBIT Cross-Paper Synthesis",
    `*Generated on ${formatDate(new Date())}*`,
    "",
    "## Summary",
    synthesis.summary,
    "",
  ];

  if (synthesis.connections.length > 0) {
    lines.push("## Connections");
    synthesis.connections.forEach((c) =>
      lines.push(`- **[${c.type}]** ${c.description} (strength: ${Math.round(c.strength * 100)}%)`)
    );
    lines.push("");
  }

  if (synthesis.contradictions.length > 0) {
    lines.push("## Contradictions");
    synthesis.contradictions.forEach((c) =>
      lines.push(`- **[${c.severity}]** ${c.description}`)
    );
    lines.push("");
  }

  if (synthesis.gaps.length > 0) {
    lines.push("## Research Gaps");
    synthesis.gaps.forEach((g) => lines.push(`- ${g}`));
    lines.push("");
  }

  if (synthesis.hypotheses.length > 0) {
    lines.push("## Novel Hypotheses");
    synthesis.hypotheses.forEach((h, i) => lines.push(`${i + 1}. ${h}`));
    lines.push("");
  }

  downloadFile(lines.join("\n"), `orbit_synthesis_${Date.now()}.md`);
}
