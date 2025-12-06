import { create } from 'zustand';
import { Artifact } from '../types/ai.types';

interface ArtifactsState {
  artifacts: Artifact[];
  selectedArtifact: Artifact | null;
  
  // Actions
  setArtifacts: (artifacts: Artifact[]) => void;
  addArtifact: (artifact: Artifact) => void;
  setSelectedArtifact: (artifact: Artifact | null) => void;
  clearArtifacts: () => void;
}

export const useArtifactsStore = create<ArtifactsState>((set) => ({
  artifacts: [],
  selectedArtifact: null,
  
  setArtifacts: (artifacts) => set({ artifacts }),
  addArtifact: (artifact) =>
    set((state) => ({ artifacts: [...state.artifacts, artifact] })),
  setSelectedArtifact: (artifact) => set({ selectedArtifact: artifact }),
  clearArtifacts: () => set({ artifacts: [], selectedArtifact: null }),
}));
