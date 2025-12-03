import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIProject, GenerationRequest } from '../types/ai.types';

interface AIProjectState {
  // Current project
  currentProject: AIProject | null;
  currentRequest: GenerationRequest | null;
  
  // Actions
  setCurrentProject: (project: AIProject | null) => void;
  setCurrentRequest: (request: GenerationRequest | null) => void;
  updateProject: (updates: Partial<AIProject>) => void;
  updateRequest: (updates: Partial<GenerationRequest>) => void;
  clearCurrentProject: () => void;
}

export const useAIProjectStore = create<AIProjectState>()(
  persist(
    (set) => ({
      currentProject: null,
      currentRequest: null,
      
      setCurrentProject: (project) => set({ currentProject: project }),
      setCurrentRequest: (request) => set({ currentRequest: request }),
      
      updateProject: (updates) =>
        set((state) => ({
          currentProject: state.currentProject
            ? { ...state.currentProject, ...updates }
            : null,
        })),
      
      updateRequest: (updates) =>
        set((state) => ({
          currentRequest: state.currentRequest
            ? { ...state.currentRequest, ...updates }
            : null,
        })),
      
      clearCurrentProject: () =>
        set({ currentProject: null, currentRequest: null }),
    }),
    {
      name: 'ai-project-storage',
    }
  )
);
