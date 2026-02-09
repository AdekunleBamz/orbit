import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface Paper {
  id: string;
  name: string;
  file?: File;
  pdfUrl?: string;
  content: string;
  figures: string[];
  analysis?: PaperAnalysis;
  uploadedAt: Date;
  status: "uploading" | "processing" | "analyzed" | "error";
  error?: string;
}

export interface PaperAnalysis {
  title: string;
  authors: string[];
  abstract: string;
  keyFindings: string[];
  methodology: string;
  concepts: Concept[];
  equations: string[];
  limitations: string[];
  futureWork: string[];
  summary: string;
}

export interface Concept {
  id: string;
  name: string;
  description: string;
  category: "method" | "finding" | "theory" | "data" | "metric" | "tool";
  importance: number; // 0-1
  relatedConcepts: string[];
  paperIds: string[];
}

export interface ConceptEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
  strength: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: Date;
}

export interface Citation {
  paperId: string;
  paperTitle: string;
  excerpt: string;
  relevance: number;
}

export interface Synthesis {
  id: string;
  paperIds: string[];
  connections: Connection[];
  contradictions: Contradiction[];
  gaps: string[];
  hypotheses: string[];
  summary: string;
  generatedAt: Date;
}

export interface Connection {
  description: string;
  paperIds: string[];
  strength: number;
  type: "supports" | "extends" | "applies" | "references";
}

export interface Contradiction {
  description: string;
  paperIds: string[];
  severity: "minor" | "moderate" | "major";
}

type View = "landing" | "dashboard" | "analysis" | "graph" | "chat" | "synthesis";

interface AppState {
  // Navigation
  currentView: View;
  setView: (view: View) => void;

  // Papers
  papers: Paper[];
  addPaper: (paper: Paper) => void;
  updatePaper: (id: string, updates: Partial<Paper>) => void;
  removePaper: (id: string) => void;
  selectedPaperId: string | null;
  setSelectedPaper: (id: string | null) => void;

  // Knowledge Graph
  concepts: Concept[];
  edges: ConceptEdge[];
  setConcepts: (concepts: Concept[]) => void;
  setEdges: (edges: ConceptEdge[]) => void;

  // Chat
  messages: ChatMessage[];
  addMessage: (message: ChatMessage) => void;
  clearMessages: () => void;
  isChatLoading: boolean;
  setChatLoading: (loading: boolean) => void;

  // Synthesis
  synthesis: Synthesis | null;
  setSynthesis: (synthesis: Synthesis | null) => void;
  isSynthesizing: boolean;
  setIsSynthesizing: (v: boolean) => void;

  // Global
  isProcessing: boolean;
  setIsProcessing: (v: boolean) => void;
  apiKeySet: boolean;
  setApiKeySet: (v: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      // Navigation
      currentView: "landing",
      setView: (view) => set({ currentView: view }),

      // Papers
      papers: [],
      addPaper: (paper) => set((s) => ({ papers: [...s.papers, paper] })),
      updatePaper: (id, updates) =>
        set((s) => ({
          papers: s.papers.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      removePaper: (id) =>
        set((s) => ({
          papers: s.papers.filter((p) => p.id !== id),
          selectedPaperId: s.selectedPaperId === id ? null : s.selectedPaperId,
          // Clean up related data
          concepts: s.concepts.filter((c) => !c.paperIds.includes(id)),
          edges: s.edges.filter(
            (e) => !s.concepts.find((c) => c.id === e.source || c.id === e.target)?.paperIds.includes(id)
          ),
          synthesis: s.synthesis
            ? {
                ...s.synthesis,
                paperIds: s.synthesis.paperIds.filter((pid) => pid !== id),
                connections: s.synthesis.connections.filter((c) => !c.paperIds.includes(id)),
                contradictions: s.synthesis.contradictions.filter((c) => !c.paperIds.includes(id)),
              }
            : null,
          // Clear messages if no papers remain
          messages: s.papers.length <= 1 ? [] : s.messages,
        })),
      selectedPaperId: null,
      setSelectedPaper: (id) => set({ selectedPaperId: id }),

      // Knowledge Graph
      concepts: [],
      edges: [],
      setConcepts: (concepts) => set({ concepts }),
      setEdges: (edges) => set({ edges }),

      // Chat
      messages: [],
      addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
      clearMessages: () => set({ messages: [] }),
      isChatLoading: false,
      setChatLoading: (loading) => set({ isChatLoading: loading }),

      // Synthesis
      synthesis: null,
      setSynthesis: (synthesis) => set({ synthesis }),
      isSynthesizing: false,
      setIsSynthesizing: (v) => set({ isSynthesizing: v }),

      // Global
      isProcessing: false,
      setIsProcessing: (v) => set({ isProcessing: v }),
      apiKeySet: false,
      setApiKeySet: (v) => set({ apiKeySet: v }),
    }),
    {
      name: "orbit-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        papers: state.papers.map((p) => ({ ...p, file: undefined })),
        concepts: state.concepts,
        edges: state.edges,
        messages: state.messages,
        synthesis: state.synthesis,
        selectedPaperId: state.selectedPaperId,
        apiKeySet: state.apiKeySet,
      }),
    }
  )
);
