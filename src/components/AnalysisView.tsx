"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  BookOpen,
  Beaker,
  Lightbulb,
  AlertTriangle,
  ArrowRight,
  Tag,
  Network,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { getConceptBg, exportAnalysisAsMarkdown } from "@/lib/utils";

function EquationBlock({ math }: { math: string }) {
  try {
    // Dynamically require to avoid build errors if not installed yet
    const { BlockMath } = require("react-katex");
    require("katex/dist/katex.min.css");
    return <BlockMath math={math.replace(/^\$+|\$+$/g, "")} />;
  } catch {
    return <span className="font-mono text-sm">{math}</span>;
  }
}

export default function AnalysisView() {
  const { papers, selectedPaperId, setSelectedPaper, setView } = useAppStore();
  const paper = papers.find((p) => p.id === selectedPaperId);
  const analyzedPapers = papers.filter((p) => p.status === "analyzed");
  const [showPdf, setShowPdf] = useState(false);

  if (!paper || !paper.analysis) {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          <h1 className="text-3xl font-bold text-white mb-2">Paper Analysis</h1>
          <p className="text-dark-400 mb-8">
            Select an analyzed paper to view its detailed breakdown.
          </p>

          {analyzedPapers.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center">
              <FileText className="w-12 h-12 text-dark-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-300 mb-2">
                No Papers Analyzed Yet
              </h3>
              <p className="text-dark-500 text-sm mb-6">
                Upload papers from the Dashboard to get started
              </p>
              <button
                onClick={() => setView("dashboard")}
                className="px-5 py-2.5 rounded-xl bg-orbit-600 text-white text-sm font-medium hover:bg-orbit-500 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analyzedPapers.map((p) => (
                <motion.button
                  key={p.id}
                  whileHover={{ y: -2 }}
                  onClick={() => setSelectedPaper(p.id)}
                  className="glass rounded-xl p-5 text-left hover:glow-border transition-all"
                >
                  <h3 className="font-medium text-white mb-2 text-sm">
                    {p.analysis?.title}
                  </h3>
                  <p className="text-xs text-dark-500 line-clamp-2">
                    {p.analysis?.abstract}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-xs text-orbit-400">
                      {p.analysis?.concepts?.length} concepts
                    </span>
                    <span className="text-dark-700">·</span>
                    <span className="text-xs text-emerald-400">
                      {p.analysis?.keyFindings?.length} findings
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const a = paper.analysis;

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* PDF Side Panel */}
      {showPdf && paper.pdfUrl && (
        <div className="w-1/2 border-r border-white/5 flex flex-col">
          <div className="p-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-xs text-dark-400 font-medium">PDF Preview</span>
            <button
              onClick={() => setShowPdf(false)}
              className="text-xs text-dark-500 hover:text-white transition-colors"
            >
              <EyeOff className="w-3.5 h-3.5" />
            </button>
          </div>
          <iframe
            src={paper.pdfUrl}
            className="flex-1 w-full bg-white"
            title="PDF Preview"
          />
        </div>
      )}

      <div className={`flex-1 overflow-y-auto ${showPdf && paper.pdfUrl ? 'w-1/2' : ''}`}>
      <div className="max-w-5xl mx-auto p-8">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs text-dark-500">
              <button
                onClick={() => setSelectedPaper(null)}
                className="hover:text-orbit-400 transition-colors"
              >
                All Papers
              </button>
              <ArrowRight className="w-3 h-3" />
              <span className="text-dark-300">Analysis</span>
            </div>
            {paper.pdfUrl && (
              <button
                onClick={() => setShowPdf(!showPdf)}
                className="flex items-center gap-1.5 text-xs text-dark-500 hover:text-orbit-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5"
              >
                {showPdf ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPdf ? "Hide PDF" : "View PDF"}
              </button>
            )}
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">{a.title}</h1>
          {a.authors.length > 0 && (
            <p className="text-sm text-dark-400">
              {a.authors.join(", ")}
            </p>
          )}
        </div>

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-orbit-400" />
            <h2 className="text-lg font-semibold text-white">Summary</h2>
          </div>
          <p className="text-dark-300 leading-relaxed text-sm">{a.summary}</p>
        </motion.div>

        {/* Key Findings */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-semibold text-white">Key Findings</h2>
          </div>
          <div className="space-y-3">
            {a.keyFindings.map((finding, i) => (
              <div key={i} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center mt-0.5">
                  <span className="text-xs font-bold text-amber-400">
                    {i + 1}
                  </span>
                </div>
                <p className="text-dark-300 text-sm leading-relaxed">
                  {finding}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Methodology */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <Beaker className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Methodology</h2>
          </div>
          <p className="text-dark-300 leading-relaxed text-sm">
            {a.methodology}
          </p>
        </motion.div>

        {/* Concepts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-white">
                Key Concepts
              </h2>
            </div>
            <button
              onClick={() => setView("graph")}
              className="flex items-center gap-1 text-xs text-orbit-400 hover:text-orbit-300 transition-colors"
            >
              <Network className="w-3 h-3" />
              View Graph
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {a.concepts.map((concept) => (
              <div
                key={concept.id}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${getConceptBg(
                  concept.category
                )}`}
              >
                {concept.name}
                <span className="ml-1 opacity-60">
                  ({Math.round(concept.importance * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Limitations */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
              <h2 className="text-lg font-semibold text-white">Limitations</h2>
            </div>
            <ul className="space-y-2">
              {a.limitations.map((lim, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm text-dark-400"
                >
                  <span className="text-orange-400 mt-1">•</span>
                  {lim}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Future Work */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-semibold text-white">Future Work</h2>
            </div>
            <ul className="space-y-2">
              {a.futureWork.map((fw, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm text-dark-400"
                >
                  <span className="text-emerald-400 mt-1">→</span>
                  {fw}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Equations */}
        {a.equations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass rounded-2xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-3">
              Key Equations
            </h2>
            <div className="space-y-3">
              {a.equations.map((eq, i) => (
                <div
                  key={i}
                  className="px-4 py-3 bg-dark-800/50 rounded-lg text-dark-200 overflow-x-auto"
                >
                  {(() => {
                    try {
                      return <EquationBlock math={eq} />;
                    } catch {
                      return <span className="font-mono text-sm">{eq}</span>;
                    }
                  })()}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Export */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex justify-end"
        >
          <button
            onClick={() => exportAnalysisAsMarkdown(a)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass text-sm text-dark-400 hover:text-white hover:glow-border transition-all"
          >
            <Download className="w-4 h-4" />
            Export as Markdown
          </button>
        </motion.div>
      </div>
      </div>
    </div>
  );
}
