import { create } from 'zustand';
import { AIAgent } from '../types/ai.types';

interface GenerationState {
  // Agent status
  agents: AIAgent[];
  overallProgress: number;
  isGenerating: boolean;
  error: string | null;
  
  // Actions
  setAgents: (agents: AIAgent[]) => void;
  updateAgent: (agentId: string, updates: Partial<AIAgent>) => void;
  setOverallProgress: (progress: number) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  resetGeneration: () => void;
}

export const useGenerationStore = create<GenerationState>((set) => ({
  agents: [],
  overallProgress: 0,
  isGenerating: false,
  error: null,
  
  setAgents: (agents) => set({ agents }),
  
  updateAgent: (agentId, updates) =>
    set((state) => ({
      agents: state.agents.map((agent) =>
        agent.id === agentId ? { ...agent, ...updates } : agent
      ),
    })),
  
  setOverallProgress: (progress) => set({ overallProgress: progress }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setError: (error) => set({ error }),
  
  resetGeneration: () =>
    set({
      agents: [],
      overallProgress: 0,
      isGenerating: false,
      error: null,
    }),
}));
