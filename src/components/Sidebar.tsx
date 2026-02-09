"use client";

import { motion } from "framer-motion";
import {
  Brain,
  FileText,
  Network,
  MessageSquare,
  GitBranch,
  Upload,
  Trash2,
  ChevronRight,
  Settings,
} from "lucide-react";
import { useAppStore, Paper } from "@/lib/store";
import { truncateText } from "@/lib/utils";
import { useState } from "react";

const navItems = [
  { id: "dashboard" as const, label: "Dashboard", icon: Upload },
  { id: "analysis" as const, label: "Analysis", icon: FileText },
  { id: "graph" as const, label: "Knowledge Graph", icon: Network },
  { id: "chat" as const, label: "Research Q&A", icon: MessageSquare },
  { id: "synthesis" as const, label: "Synthesis", icon: GitBranch },
];

export default function Sidebar() {
  const {
    currentView,
    setView,
    papers,
    selectedPaperId,
    setSelectedPaper,
    removePaper,
  } = useAppStore();
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const { setApiKeySet } = useAppStore();

  const handleSaveKey = () => {
    if (apiKeyInput.trim()) {
      localStorage.setItem("orbit_gemini_key", apiKeyInput.trim());
      setApiKeySet(true);
      setShowSettings(false);
    }
  };

  return (
    <div className="w-72 h-screen bg-dark-900/50 backdrop-blur-xl border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <button
          onClick={() => setView("landing")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orbit-500 to-violet-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight">ORBIT</span>
            <p className="text-[10px] text-dark-500 -mt-0.5">
              Research Intelligence
            </p>
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.97 }}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              currentView === item.id
                ? "bg-orbit-600/20 text-orbit-300 border border-orbit-500/20"
                : "text-dark-400 hover:text-dark-200 hover:bg-white/5"
            }`}
          >
            <item.icon className="w-4.5 h-4.5" />
            {item.label}
          </motion.button>
        ))}
      </nav>

      {/* Papers List */}
      <div className="flex-1 overflow-y-auto border-t border-white/5 mt-2">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-dark-500 uppercase tracking-wider">
              Papers ({papers.length})
            </span>
          </div>
          {papers.length === 0 ? (
            <div className="text-center py-8 px-4">
              <FileText className="w-8 h-8 text-dark-700 mx-auto mb-2" />
              <p className="text-xs text-dark-600">
                Upload papers from the Dashboard to get started
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {papers.map((paper: Paper) => (
                <motion.button
                  key={paper.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSelectedPaper(paper.id);
                    if (paper.status === "analyzed") setView("analysis");
                  }}
                  className={`w-full group flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-all ${
                    selectedPaperId === paper.id
                      ? "bg-orbit-600/10 border border-orbit-500/20"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-dark-200 truncate">
                      {truncateText(
                        paper.analysis?.title || paper.name,
                        40
                      )}
                    </p>
                    <p className="text-[10px] text-dark-500 mt-0.5">
                      {paper.status === "processing" ? (
                        <span className="text-orbit-400">Processing...</span>
                      ) : paper.status === "error" ? (
                        <span className="text-red-400">Error</span>
                      ) : paper.status === "analyzed" ? (
                        <span className="text-emerald-400">Analyzed</span>
                      ) : (
                        "Uploading..."
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePaper(paper.id);
                      }}
                      className="p-1 hover:bg-red-500/20 rounded text-dark-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <ChevronRight className="w-3 h-3 text-dark-600" />
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings */}
      <div className="border-t border-white/5 p-3">
        {showSettings ? (
          <div className="space-y-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="Enter Gemini API key..."
              className="w-full px-3 py-2 rounded-lg bg-dark-800 border border-white/10 text-sm text-white placeholder-dark-500 focus:outline-none focus:border-orbit-500/50"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveKey}
                className="flex-1 px-3 py-1.5 rounded-lg bg-orbit-600 text-white text-xs font-medium hover:bg-orbit-500"
              >
                Save
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-3 py-1.5 rounded-lg bg-dark-800 text-dark-400 text-xs hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-dark-500 hover:text-dark-300 hover:bg-white/5 transition-all text-sm"
          >
            <Settings className="w-4 h-4" />
            API Settings
          </button>
        )}
      </div>
    </div>
  );
}
