import axios, { AxiosInstance } from 'axios';
import logger from '../utils/logger';
import { CIData, SystemMetrics } from '../types';

export class CMDBClient {
  private client: AxiosInstance;
  private apiUrl: string;
  private apiKey: string;
  private tenantId: string;

  constructor(apiUrl: string, apiKey: string, tenantId: string) {
    this.apiUrl = apiUrl;
    this.apiKey = apiKey;
    this.tenantId = tenantId;

    this.client = axios.create({
      baseURL: apiUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Tenant-ID': tenantId,
      },
    });

    logger.info('CMDB Client initialized', { apiUrl, tenantId });
  }

  async registerCI(ciData: CIData): Promise<boolean> {
    try {
      logger.info('Registering CI in CMDB', { ciId: ciData.id, name: ciData.name });

      const response = await this.client.post('/ci', ciData);

      if (response.status === 200 || response.status === 201) {
        logger.info('CI registered successfully', { ciId: ciData.id });
        return true;
      }

      logger.warn('Unexpected response status', { status: response.status });
      return false;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('Failed to register CI', {
          ciId: ciData.id,
          status: error.response?.status,
          message: error.message,
        });
      } else {
        logger.error('Failed to register CI', { ciId: ciData.id, error });
      }
      return false;
    }
  }

  async updateCI(ciId: string, ciData: Partial<CIData>): Promise<boolean> {
    try {
      logger.debug('Updating CI in CMDB', { ciId });

      const response = await this.client.put(`/ci/${ciId}`, ciData);

      if (response.status === 200) {
        logger.debug('CI updated successfully', { ciId });
        return true;
      }

      return false;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('Failed to update CI', {
          ciId,
          status: error.response?.status,
          message: error.message,
        });
      } else {
        logger.error('Failed to update CI', { ciId, error });
      }
      return false;
    }
  }

  async sendMetrics(ciId: string, metrics: SystemMetrics): Promise<boolean> {
    try {
      logger.debug('Sending metrics to CMDB', { ciId });

      const response = await this.client.post(`/ci/${ciId}/metrics`, metrics);

      if (response.status === 200 || response.status === 201) {
        logger.debug('Metrics sent successfully', { ciId });
        return true;
      }

      return false;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('Failed to send metrics', {
          ciId,
          status: error.response?.status,
          message: error.message,
        });
      } else {
        logger.error('Failed to send metrics', { ciId, error });
      }
      return false;
    }
  }

  async getCIById(ciId: string): Promise<CIData | null> {
    try {
      const response = await this.client.get(`/ci/${ciId}`);

      if (response.status === 200) {
        return response.data;
      }

      return null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        logger.debug('CI not found', { ciId });
        return null;
      }

      logger.error('Failed to get CI', { ciId, error });
      return null;
    }
  }

  async listCIs(filters?: Record<string, string>): Promise<CIData[]> {
    try {
      const response = await this.client.get('/ci', { params: filters });

      if (response.status === 200) {
        return response.data;
      }

      return [];
    } catch (error) {
      logger.error('Failed to list CIs', { error });
      return [];
    }
  }

  async deleteCI(ciId: string): Promise<boolean> {
    try {
      logger.info('Deleting CI from CMDB', { ciId });

      const response = await this.client.delete(`/ci/${ciId}`);

      if (response.status === 200 || response.status === 204) {
        logger.info('CI deleted successfully', { ciId });
        return true;
      }

      return false;
    } catch (error) {
      logger.error('Failed to delete CI', { ciId, error });
      return false;
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      logger.error('CMDB health check failed', { error });
      return false;
    }
  }

  /**
   * Send security event to CMDB
   */
  async sendSecurityEvent(eventPayload: any): Promise<boolean> {
    try {
      logger.debug('Sending security event to CMDB', { 
        eventType: eventPayload.eventType,
        eventId: eventPayload.eventId,
      });

      const response = await this.client.post('/security/events', eventPayload);

      if (response.status === 200 || response.status === 201) {
        logger.debug('Security event sent successfully', { 
          eventId: eventPayload.eventId,
        });
        return true;
      }

      return false;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        logger.error('Failed to send security event', {
          eventId: eventPayload.eventId,
          status: error.response?.status,
          message: error.message,
        });
      } else {
        logger.error('Failed to send security event', { 
          eventId: eventPayload.eventId,
          error,
        });
      }
      return false;
    }
  }
}
