"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch,
  Loader2,
  Lightbulb,
  AlertTriangle,
  Link2,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Zap,
  Download,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { generateId, exportSynthesisAsMarkdown } from "@/lib/utils";

export default function SynthesisView() {
  const {
    papers,
    synthesis,
    setSynthesis,
    isSynthesizing,
    setIsSynthesizing,
    setView,
  } = useAppStore();
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const analyzedPapers = papers.filter((p) => p.status === "analyzed");

  const togglePaper = (id: string) => {
    setSelectedPaperIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const runSynthesis = async () => {
    if (selectedPaperIds.length < 2) return;
    setIsSynthesizing(true);

    try {
      const apiKey = localStorage.getItem("orbit_gemini_key");
      const selectedPapers = analyzedPapers
        .filter((p) => selectedPaperIds.includes(p.id))
        .map((p) => ({
          id: p.id,
          title: p.analysis?.title,
          summary: p.analysis?.summary,
          keyFindings: p.analysis?.keyFindings,
          methodology: p.analysis?.methodology,
          concepts: p.analysis?.concepts?.map((c) => ({ name: c.name })),
        }));

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const res = await fetch("/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ papers: selectedPapers, apiKey }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Synthesis failed");
      }

      const { synthesis: result } = await res.json();

      setSynthesis({
        id: generateId(),
        paperIds: selectedPaperIds,
        connections: result.connections || [],
        contradictions: result.contradictions || [],
        gaps: result.gaps || [],
        hypotheses: result.hypotheses || [],
        summary: result.summary || "",
        generatedAt: new Date(),
      });
    } catch (error) {
      console.error("Synthesis error:", error);
    } finally {
      setIsSynthesizing(false);
    }
  };

  if (analyzedPapers.length < 2) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <GitBranch className="w-16 h-16 text-dark-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-dark-300 mb-2">
            Cross-Paper Synthesis
          </h2>
          <p className="text-dark-500 text-sm mb-6 max-w-md">
            Upload and analyze at least 2 papers to discover connections,
            contradictions, and generate novel hypotheses.
          </p>
          <button
            onClick={() => setView("dashboard")}
            className="px-5 py-2.5 rounded-xl bg-orbit-600 text-white text-sm font-medium hover:bg-orbit-500 transition-colors"
          >
            Upload More Papers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Cross-Paper Synthesis
          </h1>
          <p className="text-dark-400">
            Select papers to synthesize and discover hidden connections.
          </p>
        </div>

        {/* Paper Selection */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            Select Papers to Synthesize
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analyzedPapers.map((paper) => (
              <motion.button
                key={paper.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => togglePaper(paper.id)}
                className={`text-left rounded-xl p-4 transition-all border ${
                  selectedPaperIds.includes(paper.id)
                    ? "bg-orbit-600/10 border-orbit-500/30 glow-border"
                    : "glass hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-5 h-5 rounded-md border-2 mt-0.5 flex items-center justify-center transition-all ${
                      selectedPaperIds.includes(paper.id)
                        ? "border-orbit-500 bg-orbit-500"
                        : "border-dark-600"
                    }`}
                  >
                    {selectedPaperIds.includes(paper.id) && (
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {paper.analysis?.title}
                    </h3>
                    <p className="text-xs text-dark-500 mt-1 line-clamp-2">
                      {paper.analysis?.abstract}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={runSynthesis}
              disabled={selectedPaperIds.length < 2 || isSynthesizing}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-orbit-600 to-violet-600 text-white font-medium text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:from-orbit-500 hover:to-violet-500 transition-all shadow-lg shadow-orbit-500/20 flex items-center gap-2"
            >
              {isSynthesizing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Synthesizing with Gemini 3...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Synthesize {selectedPaperIds.length} Papers
                </>
              )}
            </motion.button>
            <span className="text-xs text-dark-600">
              {selectedPaperIds.length < 2
                ? `Select ${2 - selectedPaperIds.length} more paper${
                    2 - selectedPaperIds.length > 1 ? "s" : ""
                  }`
                : `${selectedPaperIds.length} papers selected`}
            </span>
          </div>
        </div>

        {/* Synthesis Results */}
        <AnimatePresence>
          {synthesis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Summary */}
              <div className="glass rounded-2xl p-6 glow-border">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orbit-400" />
                    <h2 className="text-lg font-semibold text-white">
                      Synthesis Summary
                    </h2>
                  </div>
                  <button
                    onClick={() => exportSynthesisAsMarkdown(synthesis)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-dark-500 hover:text-dark-300 hover:bg-white/5 transition-all"
                  >
                    <Download className="w-3 h-3" />
                    Export
                  </button>
                </div>
                <p className="text-dark-300 leading-relaxed text-sm">
                  {synthesis.summary}
                </p>
              </div>

              {/* Connections */}
              {synthesis.connections.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Link2 className="w-5 h-5 text-emerald-400" />
                    <h2 className="text-lg font-semibold text-white">
                      Connections Found ({synthesis.connections.length})
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {synthesis.connections.map((conn, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm text-dark-200">
                            {conn.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 capitalize">
                              {conn.type}
                            </span>
                            <span className="text-[10px] text-dark-600">
                              Strength:{" "}
                              {Math.round((conn.strength || 0) * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contradictions */}
              {synthesis.contradictions.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-orange-400" />
                    <h2 className="text-lg font-semibold text-white">
                      Contradictions ({synthesis.contradictions.length})
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {synthesis.contradictions.map((contra, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-3 rounded-xl bg-orange-500/5 border border-orange-500/10"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                          <XCircle className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                          <p className="text-sm text-dark-200">
                            {contra.description}
                          </p>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 capitalize mt-1 inline-block">
                            {contra.severity} severity
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Research Gaps */}
              {synthesis.gaps.length > 0 && (
                <div className="glass rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg font-semibold text-white">
                      Research Gaps ({synthesis.gaps.length})
                    </h2>
                  </div>
                  <div className="space-y-2">
                    {synthesis.gaps.map((gap, i) => (
                      <div
                        key={i}
                        className="flex gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10"
                      >
                        <span className="text-amber-400 flex-shrink-0">
                          ⚠
                        </span>
                        <p className="text-sm text-dark-300">{gap}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hypotheses */}
              {synthesis.hypotheses.length > 0 && (
                <div className="glass rounded-2xl p-6 glow-border-strong">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-yellow-400" />
                    <h2 className="text-lg font-semibold text-white">
                      Novel Hypotheses ({synthesis.hypotheses.length})
                    </h2>
                  </div>
                  <div className="space-y-3">
                    {synthesis.hypotheses.map((hyp, i) => (
                      <div
                        key={i}
                        className="flex gap-3 p-4 rounded-xl bg-gradient-to-r from-yellow-500/5 to-amber-500/5 border border-yellow-500/10"
                      >
                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                          <Lightbulb className="w-4 h-4 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-sm text-dark-200 font-medium">
                            Hypothesis {i + 1}
                          </p>
                          <p className="text-sm text-dark-300 mt-1">{hyp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
