import { API_CONFIG, API_ENDPOINTS } from './api.config';
import {
  AIProject,
  GenerationRequest,
  OneClickInput,
  AdvancedInput,
  Artifact,
} from '../types/ai.types';

class AIOrchestratorService {
  private getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      ...API_CONFIG.HEADERS,
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Create new project
  async createProject(data: {
    name: string;
    description: string;
    mode: 'oneclick' | 'advanced';
  }): Promise<AIProject> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AI_PROJECT}`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create project');
    }

    return response.json();
  }

  // Start generation (One-Click mode)
  async startOneClickGeneration(
    projectId: string,
    input: OneClickInput
  ): Promise<GenerationRequest> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AI_GENERATE}`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          projectId,
          mode: 'oneclick',
          input,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to start generation');
    }

    return response.json();
  }

  // Start generation (Advanced mode)
  async startAdvancedGeneration(
    projectId: string,
    input: AdvancedInput
  ): Promise<GenerationRequest> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AI_GENERATE}`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({
          projectId,
          mode: 'advanced',
          input,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to start generation');
    }

    return response.json();
  }

  // Get generation status
  async getGenerationStatus(requestId: string): Promise<GenerationRequest> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AI_GENERATE}/${requestId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get generation status');
    }

    return response.json();
  }

  // Get artifacts
  async getArtifacts(requestId: string): Promise<Artifact[]> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AI_ARTIFACTS}?requestId=${requestId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get artifacts');
    }

    return response.json();
  }

  // Download artifact
  async downloadArtifact(artifactId: string): Promise<Blob> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AI_ARTIFACTS}/${artifactId}/download`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to download artifact');
    }

    return response.blob();
  }

  // List projects
  async listProjects(): Promise<AIProject[]> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AI_PROJECT}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to list projects');
    }

    return response.json();
  }

  // Get project
  async getProject(projectId: string): Promise<AIProject> {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_ENDPOINTS.AI_PROJECT}/${projectId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get project');
    }

    return response.json();
  }
}

export const aiOrchestratorService = new AIOrchestratorService();
