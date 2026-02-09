"use client";

import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  Brain,
  Network,
  MessageSquare,
  GitBranch,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Key,
  X,
} from "lucide-react";
import { useAppStore } from "@/lib/store";
import { generateId } from "@/lib/utils";

export default function Dashboard() {
  const { papers, addPaper, updatePaper, setView, setSelectedPaper, setConcepts, setEdges, apiKeySet, setApiKeySet } =
    useAppStore();
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    // Check localStorage first
    const stored = localStorage.getItem("orbit_gemini_key");
    if (stored) {
      setHasKey(true);
      setApiKeySet(true);
      return;
    }
    // Also check if server has GEMINI_API_KEY in .env.local
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.hasKey) {
          setHasKey(true);
          setApiKeySet(true);
        }
      })
      .catch(() => {});
  }, [setApiKeySet]);

  const saveApiKey = () => {
    if (keyInput.trim()) {
      localStorage.setItem("orbit_gemini_key", keyInput.trim());
      setHasKey(true);
      setApiKeySet(true);
      setShowKeyModal(false);
      setKeyInput("");
    }
  };

  const analyzePaper = useCallback(
    async (paper: { id: string; file: File }) => {
      try {
        updatePaper(paper.id, { status: "processing" });

        const formData = new FormData();
        formData.append("file", paper.file);

        const apiKey = localStorage.getItem("orbit_gemini_key");
        if (apiKey) formData.append("apiKey", apiKey);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120000);

        const res = await fetch("/api/analyze", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "Analysis failed");
        }

        const { analysis } = await res.json();

        updatePaper(paper.id, {
          status: "analyzed",
          analysis,
          content: analysis.summary,
        });

        // Update global concepts
        if (analysis.concepts) {
          const store = useAppStore.getState();
          const existingConcepts = store.concepts;
          const newConcepts = analysis.concepts.map((c: { id: string; name: string; description: string; category: string; importance: number; relatedConcepts: string[] }) => ({
            ...c,
            paperIds: [paper.id],
          }));
          setConcepts([...existingConcepts, ...newConcepts]);

          // Build edges from relatedConcepts
          const newEdges: { id: string; source: string; target: string; relationship: string; strength: number }[] = [];
          for (const concept of analysis.concepts) {
            for (const relatedId of concept.relatedConcepts || []) {
              const edgeId = `${concept.id}-${relatedId}`;
              newEdges.push({
                id: edgeId,
                source: concept.id,
                target: relatedId,
                relationship: "related",
                strength: 0.7,
              });
            }
          }
          setEdges([...store.edges, ...newEdges]);
        }
      } catch (error) {
        console.error("Analysis error:", error);
        updatePaper(paper.id, {
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    },
    [updatePaper, setConcepts, setEdges]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        const pdfUrl = URL.createObjectURL(file);
        const paper = {
          id: generateId(),
          name: file.name,
          file,
          pdfUrl,
          content: "",
          figures: [],
          uploadedAt: new Date(),
          status: "uploading" as const,
        };
        addPaper(paper);
        analyzePaper({ id: paper.id, file });
      }
    },
    [addPaper, analyzePaper]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
  });

  const analyzedCount = papers.filter((p) => p.status === "analyzed").length;
  const processingCount = papers.filter((p) => p.status === "processing").length;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Research Dashboard
          </h1>
          <p className="text-dark-400">
            Upload research papers and let Gemini 3 analyze them multimodally.
          </p>
        </div>

        {/* API Key Banner */}
        {!hasKey && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                <Key className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-amber-200">Gemini API Key Required</h3>
                <p className="text-xs text-amber-400/70 mt-0.5">
                  Add your Google Gemini API key to start analyzing papers.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowKeyModal(true)}
              className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-300 text-sm font-medium hover:bg-amber-500/30 transition-colors"
            >
              Add Key
            </button>
          </motion.div>
        )}

        {/* API Key Modal */}
        <AnimatePresence>
          {showKeyModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setShowKeyModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="glass-strong rounded-2xl p-6 w-full max-w-md mx-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">Set Gemini API Key</h2>
                  <button
                    onClick={() => setShowKeyModal(false)}
                    className="p-1 rounded-lg hover:bg-white/10 text-dark-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-dark-400 mb-4">
                  Get a free API key from{" "}
                  <a
                    href="https://aistudio.google.com/apikey"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-orbit-400 hover:text-orbit-300 underline"
                  >
                    Google AI Studio
                  </a>
                </p>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveApiKey()}
                  placeholder="AIza..."
                  className="w-full px-4 py-3 rounded-xl bg-dark-800 border border-white/10 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-orbit-500/50 mb-4"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button
                    onClick={saveApiKey}
                    disabled={!keyInput.trim()}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-orbit-600 text-white text-sm font-medium hover:bg-orbit-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    Save Key
                  </button>
                  <button
                    onClick={() => setShowKeyModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-dark-800 text-dark-400 text-sm hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 hover:scale-[1.005] ${
            isDragActive
              ? "border-orbit-400 bg-orbit-500/10"
              : "border-white/10 hover:border-orbit-500/30 hover:bg-white/[0.02]"
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center">
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all ${
                isDragActive
                  ? "bg-orbit-500/20 scale-110"
                  : "bg-white/5"
              }`}
            >
              <Upload
                className={`w-8 h-8 ${
                  isDragActive ? "text-orbit-400" : "text-dark-500"
                }`}
              />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              {isDragActive
                ? "Drop your papers here"
                : "Upload Research Papers"}
            </h3>
            <p className="text-dark-500 text-sm mb-4">
              Drag & drop PDF files, or click to browse
            </p>
            <div className="flex items-center gap-2 text-xs text-dark-600">
              <Sparkles className="w-3 h-3" />
              <span>
                Gemini 3 analyzes text, figures, charts, equations &
                tables
              </span>
            </div>
          </div>
        </div>

        {/* Stats */}
        {papers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-4 mt-8"
          >
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-orbit-400" />
                <span className="text-xs text-dark-500">Total Papers</span>
              </div>
              <span className="text-2xl font-bold text-white">
                {papers.length}
              </span>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-xs text-dark-500">Analyzed</span>
              </div>
              <span className="text-2xl font-bold text-white">
                {analyzedCount}
              </span>
            </div>
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Brain className="w-4 h-4 text-violet-400" />
                <span className="text-xs text-dark-500">Concepts Found</span>
              </div>
              <span className="text-2xl font-bold text-white">
                {useAppStore.getState().concepts.length}
              </span>
            </div>
          </motion.div>
        )}

        {/* Paper List */}
        <AnimatePresence>
          {papers.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 space-y-3"
            >
              <h2 className="text-lg font-semibold text-white mb-4">
                Uploaded Papers
              </h2>
              {papers.map((paper, i) => (
                <motion.div
                  key={paper.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-xl p-4 flex items-center gap-4 group hover:glow-border transition-all cursor-pointer"
                  onClick={() => {
                    if (paper.status === "analyzed") {
                      setSelectedPaper(paper.id);
                      setView("analysis");
                    }
                  }}
                >
                  {/* Status Icon */}
                  <div className="flex-shrink-0">
                    {paper.status === "processing" ? (
                      <div className="w-10 h-10 rounded-xl bg-orbit-500/20 flex items-center justify-center">
                        <Loader2 className="w-5 h-5 text-orbit-400 animate-spin" />
                      </div>
                    ) : paper.status === "error" ? (
                      <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      </div>
                    ) : paper.status === "analyzed" ? (
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                        <Upload className="w-5 h-5 text-dark-500" />
                      </div>
                    )}
                  </div>

                  {/* Paper Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white truncate">
                      {paper.analysis?.title || paper.name}
                    </h3>
                    <p className="text-xs text-dark-500 mt-0.5">
                      {paper.status === "processing"
                        ? "Analyzing with Gemini 3..."
                        : paper.status === "error"
                        ? paper.error
                        : paper.status === "analyzed"
                        ? `${paper.analysis?.concepts?.length || 0} concepts · ${paper.analysis?.keyFindings?.length || 0} findings`
                        : "Uploading..."}
                    </p>
                  </div>

                  {/* Action */}
                  {paper.status === "analyzed" && (
                    <ArrowRight className="w-4 h-4 text-dark-600 group-hover:text-orbit-400 transition-colors" />
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Actions */}
        {analyzedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <button
              onClick={() => setView("graph")}
              className="glass rounded-xl p-5 text-left hover:glow-border transition-all group"
            >
              <Network className="w-6 h-6 text-violet-400 mb-3" />
              <h3 className="font-medium text-white text-sm mb-1">
                View Knowledge Graph
              </h3>
              <p className="text-xs text-dark-500">
                Explore concept relationships visually
              </p>
            </button>
            <button
              onClick={() => setView("chat")}
              className="glass rounded-xl p-5 text-left hover:glow-border transition-all group"
            >
              <MessageSquare className="w-6 h-6 text-emerald-400 mb-3" />
              <h3 className="font-medium text-white text-sm mb-1">
                Ask Research Questions
              </h3>
              <p className="text-xs text-dark-500">
                Query papers with AI-powered Q&A
              </p>
            </button>
            {analyzedCount >= 2 && (
              <button
                onClick={() => setView("synthesis")}
                className="glass rounded-xl p-5 text-left hover:glow-border transition-all group"
              >
                <GitBranch className="w-6 h-6 text-amber-400 mb-3" />
                <h3 className="font-medium text-white text-sm mb-1">
                  Synthesize Papers
                </h3>
                <p className="text-xs text-dark-500">
                  Discover connections & generate hypotheses
                </p>
              </button>
            )}
          </motion.div>
        )}

        {/* Processing indicator */}
        {processingCount > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-6 right-6 glass-strong rounded-2xl px-5 py-3 flex items-center gap-3"
          >
            <Loader2 className="w-4 h-4 text-orbit-400 animate-spin" />
            <span className="text-sm text-dark-300">
              Analyzing {processingCount} paper{processingCount > 1 ? "s" : ""}
              ...
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
