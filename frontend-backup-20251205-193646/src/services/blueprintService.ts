import api from '../lib/api';
import type { Blueprint } from '../types';

export const blueprintService = {
  // Get all blueprints
  async getBlueprints(filters?: {
    cloud?: string;
    environment?: string;
    search?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.cloud) params.append('cloud', filters.cloud);
    if (filters?.environment) params.append('environment', filters.environment);
    if (filters?.search) params.append('search', filters.search);
    
    const response = await api.get<Blueprint[]>(`/blueprints?${params.toString()}`);
    return response.data;
  },

  // Get single blueprint
  async getBlueprint(id: string) {
    const response = await api.get<Blueprint>(`/blueprints/${id}`);
    return response.data;
  },

  // Get single blueprint (alias for consistency)
  async getById(id: string) {
    return this.getBlueprint(id);
  },

  // Create blueprint
  async createBlueprint(blueprint: Partial<Blueprint>) {
    const response = await api.post<Blueprint>('/blueprints', blueprint);
    return response.data;
  },

  // Update blueprint
  async updateBlueprint(id: string, blueprint: Partial<Blueprint>) {
    const response = await api.put<Blueprint>(`/blueprints/${id}`, blueprint);
    return response.data;
  },

  // Delete blueprint
  async deleteBlueprint(id: string) {
    await api.delete(`/blueprints/${id}`);
  },

  // Delete blueprint (alias for consistency)
  async delete(id: string) {
    return this.deleteBlueprint(id);
  },

  // Generate IaC from blueprint
  async generateIaC(id: string, options: { format: 'terraform' | 'arm' | 'cloudformation' }) {
    const response = await api.post<{ code: string; filename: string }>(
      `/blueprints/${id}/generate`,
      options
    );
    return response.data;
  },
};
