"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Send,
  Loader2,
  Bot,
  User,
  FileText,
  Sparkles,
  Eraser,
  Download,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useAppStore } from "@/lib/store";
import { generateId, formatDate, exportChatAsMarkdown } from "@/lib/utils";

const suggestedQuestions = [
  "What are the key findings across all uploaded papers?",
  "How do the methodologies compare between the papers?",
  "What are the main limitations of these studies?",
  "Suggest potential research directions based on these papers.",
  "Explain the core concepts in simple terms.",
  "What gaps exist in the current research?",
];

export default function ChatView() {
  const {
    messages,
    addMessage,
    clearMessages,
    isChatLoading,
    setChatLoading,
    papers,
    setView,
  } = useAppStore();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const analyzedPapers = papers.filter((p) => p.status === "analyzed");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isChatLoading) return;

    const userMessage = {
      id: generateId(),
      role: "user" as const,
      content: messageText,
      timestamp: new Date(),
    };
    addMessage(userMessage);
    setInput("");
    setChatLoading(true);

    try {
      const apiKey = localStorage.getItem("orbit_gemini_key");
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          message: messageText,
          papers: analyzedPapers.map((p) => ({
            id: p.id,
            title: p.analysis?.title,
            summary: p.analysis?.summary,
            keyFindings: p.analysis?.keyFindings,
            methodology: p.analysis?.methodology,
            concepts: p.analysis?.concepts?.map((c) => c.name),
          })),
          chatHistory: messages.slice(-10).map((m) => ({
            role: m.role,
            content: m.content,
          })),
          apiKey,
        }),
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error (${res.status})`);
      }

      const { response, citations } = await res.json();

      addMessage({
        id: generateId(),
        role: "assistant",
        content: response,
        citations,
        timestamp: new Date(),
      });
    } catch (error) {
      const isTimeout = error instanceof DOMException && error.name === "AbortError";
      const isNetwork = error instanceof TypeError && (error.message === "Load failed" || error.message === "Failed to fetch");
      let errorContent: string;
      if (isTimeout) {
        errorContent = "The request timed out. The server may still be warming up — please try again in a moment.";
      } else if (isNetwork) {
        errorContent = "Could not reach the server. Please check that the dev server is running and try again.";
      } else {
        errorContent = `Error: ${error instanceof Error ? error.message : "Unknown error"}. Make sure your Gemini API key is set in the sidebar settings.`;
      }
      addMessage({
        id: generateId(),
        role: "assistant",
        content: errorContent,
        timestamp: new Date(),
      });
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (analyzedPapers.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-dark-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-dark-300 mb-2">
            Research Q&A
          </h2>
          <p className="text-dark-500 text-sm mb-6 max-w-md">
            Upload and analyze papers first, then ask questions grounded in your
            research.
          </p>
          <button
            onClick={() => setView("dashboard")}
            className="px-5 py-2.5 rounded-xl bg-orbit-600 text-white text-sm font-medium hover:bg-orbit-500 transition-colors"
          >
            Upload Papers
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Research Q&A</h1>
          <p className="text-dark-500 text-sm mt-1">
            Ask questions about {analyzedPapers.length} analyzed paper
            {analyzedPapers.length > 1 ? "s" : ""}. Answers are grounded in
            your research.
          </p>
        </div>
        {messages.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportChatAsMarkdown(messages)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-dark-500 hover:text-dark-300 hover:bg-white/5 transition-all"
            >
              <Download className="w-3 h-3" />
              Export
            </button>
            <button
              onClick={clearMessages}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-dark-500 hover:text-dark-300 hover:bg-white/5 transition-all"
            >
              <Eraser className="w-3 h-3" />
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orbit-500 to-violet-500 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Hi! I&apos;m ORBIT
              </h2>
              <p className="text-dark-400 text-sm">
                I&apos;ve analyzed your papers and I&apos;m ready to help. Ask me
                anything about the research.
              </p>
            </div>

            {/* Paper context badges */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {analyzedPapers.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-dark-400"
                >
                  <FileText className="w-3 h-3 text-orbit-400" />
                  {p.analysis?.title?.substring(0, 40)}...
                </div>
              ))}
            </div>

            {/* Suggested Questions */}
            <div className="space-y-2">
              <p className="text-xs text-dark-600 text-center mb-3">
                Try asking:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {suggestedQuestions.map((q, i) => (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => sendMessage(q)}
                    className="text-left glass rounded-xl px-4 py-3 text-sm text-dark-400 hover:text-dark-200 hover:glow-border transition-all"
                  >
                    <Sparkles className="w-3 h-3 text-orbit-400 inline mr-2" />
                    {q}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-3xl ${
                  msg.role === "user" ? "ml-auto" : ""
                }`}
              >
                {msg.role === "assistant" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-orbit-500 to-violet-500 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`flex-1 ${
                    msg.role === "user" ? "text-right" : ""
                  }`}
                >
                  <div
                    className={`inline-block text-left rounded-2xl px-4 py-3 text-sm ${
                      msg.role === "user"
                        ? "bg-orbit-600/30 text-white"
                        : "glass"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="markdown-content">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-dark-200">{msg.content}</p>
                    )}
                  </div>
                  {/* Citations */}
                  {msg.citations && msg.citations.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.citations.map((c, i) => (
                        <span
                          key={i}
                          className="text-[10px] px-2 py-0.5 rounded bg-orbit-600/10 text-orbit-400 border border-orbit-500/20"
                        >
                          📄 {c.paperTitle?.substring(0, 30)}...
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-dark-700 mt-1">
                    {formatDate(new Date(msg.timestamp))}
                  </p>
                </div>
                {msg.role === "user" && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center">
                    <User className="w-4 h-4 text-dark-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {/* Loading */}
        {isChatLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex gap-3"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orbit-500 to-violet-500 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="glass rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-orbit-400 animate-spin" />
              <span className="text-sm text-dark-400">
                Analyzing with Gemini 3...
              </span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <div className="flex-1 glass rounded-2xl p-1">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your research papers..."
              rows={1}
              className="w-full px-4 py-3 bg-transparent text-sm text-white placeholder-dark-500 focus:outline-none resize-none"
              style={{ minHeight: "44px", maxHeight: "120px" }}
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => sendMessage()}
            disabled={!input.trim() || isChatLoading}
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-orbit-600 hover:bg-orbit-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
