"use client";

import { useAppStore } from "@/lib/store";
import LandingPage from "@/components/LandingPage";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import AnalysisView from "@/components/AnalysisView";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import ChatView from "@/components/ChatView";
import SynthesisView from "@/components/SynthesisView";

export default function Home() {
  const currentView = useAppStore((s) => s.currentView);

  if (currentView === "landing") {
    return <LandingPage />;
  }

  return (
    <div className="flex h-screen bg-dark-950">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {currentView === "dashboard" && <Dashboard />}
        {currentView === "analysis" && <AnalysisView />}
        {currentView === "graph" && <KnowledgeGraph />}
        {currentView === "chat" && <ChatView />}
        {currentView === "synthesis" && <SynthesisView />}
      </main>
    </div>
  );
}
