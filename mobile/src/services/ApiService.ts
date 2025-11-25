/**
 * API Service
 * Centralized API client for backend communication
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Config from 'react-native-config';

const API_BASE_URL = Config.API_BASE_URL || 'http://localhost:3000';
const ML_API_URL = Config.ML_API_URL || 'http://localhost:5000';
const API_TIMEOUT = 30000;

class ApiService {
  private client: AxiosInstance;
  private mlClient: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.mlClient = axios.create({
      baseURL: ML_API_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.mlClient.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('auth_token');
          // Trigger logout
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(email: string, password: string) {
    const response = await this.client.post('/api/auth/login', { email, password });
    if (response.data.token) {
      await AsyncStorage.setItem('auth_token', response.data.token);
    }
    return response.data;
  }

  async logout() {
    await this.client.post('/api/auth/logout');
    await AsyncStorage.removeItem('auth_token');
  }

  async getMe() {
    const response = await this.client.get('/api/auth/me');
    return response.data;
  }

  // Projects
  async getProjects(filters?: any) {
    const response = await this.client.get('/api/projects', { params: filters });
    return response.data;
  }

  async getProject(id: string) {
    const response = await this.client.get(`/api/projects/${id}`);
    return response.data;
  }

  async createProject(projectData: any) {
    const response = await this.client.post('/api/projects', projectData);
    return response.data;
  }

  async updateProject(id: string, projectData: any) {
    const response = await this.client.put(`/api/projects/${id}`, projectData);
    return response.data;
  }

  async deleteProject(id: string) {
    const response = await this.client.delete(`/api/projects/${id}`);
    return response.data;
  }

  // Blueprints
  async getBlueprints(filters?: any) {
    const response = await this.client.get('/api/blueprints', { params: filters });
    return response.data;
  }

  async getBlueprint(id: string) {
    const response = await this.client.get(`/api/blueprints/${id}`);
    return response.data;
  }

  async createBlueprint(blueprintData: any) {
    const response = await this.client.post('/api/blueprints', blueprintData);
    return response.data;
  }

  // Monitoring
  async getMetrics(filters?: any) {
    const response = await this.client.get('/api/monitoring/metrics', { params: filters });
    return response.data;
  }

  async getAlerts(filters?: any) {
    const response = await this.client.get('/api/monitoring/alerts', { params: filters });
    return response.data;
  }

  // Cost Analytics
  async getCostEstimate(blueprintId: string) {
    const response = await this.client.post('/api/costing/estimate', { blueprintId });
    return response.data;
  }

  async getCostForecast(filters?: any) {
    const response = await this.client.get('/api/costing/forecast', { params: filters });
    return response.data;
  }

  // ML API - Cost Forecasting
  async mlForecastCost(historicalData: any[], forecastDays: number = 30) {
    const response = await this.mlClient.post('/api/forecast', {
      historical_data: historicalData,
      forecast_days: forecastDays,
    });
    return response.data;
  }

  // ML API - Anomaly Detection
  async mlDetectAnomalies(metrics: any[], method: string = 'isolation_forest') {
    const response = await this.mlClient.post('/api/detect-anomalies', {
      metrics,
      method,
    });
    return response.data;
  }

  // ML API - Recommendations
  async mlGetRecommendations(resourceData: any) {
    const response = await this.mlClient.post('/api/recommendations', resourceData);
    return response.data;
  }

  async mlGetCostRecommendations(resourceMetrics: any[]) {
    const response = await this.mlClient.post('/api/recommendations/cost', {
      resource_metrics: resourceMetrics,
    });
    return response.data;
  }

  // Notifications
  async getNotifications() {
    const response = await this.client.get('/api/notifications');
    return response.data;
  }

  async markNotificationRead(id: string) {
    const response = await this.client.put(`/api/notifications/${id}/read`);
    return response.data;
  }
}

export default new ApiService();
