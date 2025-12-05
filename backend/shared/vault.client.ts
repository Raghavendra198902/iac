import axios from 'axios';

/**
 * HashiCorp Vault client for secrets management
 */

interface VaultConfig {
  address: string;
  token: string;
  namespace?: string;
}

interface Secret {
  [key: string]: any;
}

class VaultClient {
  private config: VaultConfig;
  private baseUrl: string;

  constructor(config: VaultConfig) {
    this.config = config;
    this.baseUrl = `${config.address}/v1`;
  }

  /**
   * Read secret from Vault
   */
  async readSecret(path: string): Promise<Secret | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/secret/data/${path}`, {
        headers: {
          'X-Vault-Token': this.config.token,
          ...(this.config.namespace && { 'X-Vault-Namespace': this.config.namespace }),
        },
      });

      return response.data.data.data;
    } catch (error: any) {
      console.error(`Failed to read secret from Vault: ${path}`, error.message);
      return null;
    }
  }

  /**
   * Write secret to Vault
   */
  async writeSecret(path: string, data: Secret): Promise<boolean> {
    try {
      await axios.post(
        `${this.baseUrl}/secret/data/${path}`,
        { data },
        {
          headers: {
            'X-Vault-Token': this.config.token,
            ...(this.config.namespace && { 'X-Vault-Namespace': this.config.namespace }),
          },
        }
      );

      console.log(`✅ Secret written to Vault: ${path}`);
      return true;
    } catch (error: any) {
      console.error(`Failed to write secret to Vault: ${path}`, error.message);
      return false;
    }
  }

  /**
   * Delete secret from Vault
   */
  async deleteSecret(path: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/secret/data/${path}`, {
        headers: {
          'X-Vault-Token': this.config.token,
          ...(this.config.namespace && { 'X-Vault-Namespace': this.config.namespace }),
        },
      });

      console.log(`✅ Secret deleted from Vault: ${path}`);
      return true;
    } catch (error: any) {
      console.error(`Failed to delete secret from Vault: ${path}`, error.message);
      return false;
    }
  }

  /**
   * List secrets at path
   */
  async listSecrets(path: string): Promise<string[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/secret/metadata/${path}?list=true`, {
        headers: {
          'X-Vault-Token': this.config.token,
          ...(this.config.namespace && { 'X-Vault-Namespace': this.config.namespace }),
        },
      });

      return response.data.data.keys || [];
    } catch (error: any) {
      console.error(`Failed to list secrets from Vault: ${path}`, error.message);
      return [];
    }
  }

  /**
   * Generate database credentials
   */
  async generateDbCredentials(role: string): Promise<{ username: string; password: string } | null> {
    try {
      const response = await axios.get(`${this.baseUrl}/database/creds/${role}`, {
        headers: {
          'X-Vault-Token': this.config.token,
          ...(this.config.namespace && { 'X-Vault-Namespace': this.config.namespace }),
        },
      });

      return {
        username: response.data.data.username,
        password: response.data.data.password,
      };
    } catch (error: any) {
      console.error(`Failed to generate DB credentials for role: ${role}`, error.message);
      return null;
    }
  }

  /**
   * Renew token
   */
  async renewToken(): Promise<boolean> {
    try {
      await axios.post(
        `${this.baseUrl}/auth/token/renew-self`,
        {},
        {
          headers: {
            'X-Vault-Token': this.config.token,
            ...(this.config.namespace && { 'X-Vault-Namespace': this.config.namespace }),
          },
        }
      );

      console.log('✅ Vault token renewed');
      return true;
    } catch (error: any) {
      console.error('Failed to renew Vault token', error.message);
      return false;
    }
  }
}

// Singleton instance
let vaultClient: VaultClient | null = null;

/**
 * Initialize Vault client
 */
export const initVault = (): VaultClient => {
  if (!vaultClient) {
    const config: VaultConfig = {
      address: process.env.VAULT_ADDR || 'http://localhost:8200',
      token: process.env.VAULT_TOKEN || '',
      namespace: process.env.VAULT_NAMESPACE,
    };

    if (!config.token) {
      console.warn('⚠️  Vault token not configured. Secrets management disabled.');
    }

    vaultClient = new VaultClient(config);
    console.log('✅ Vault client initialized');
  }

  return vaultClient;
};

/**
 * Get Vault client instance
 */
export const getVault = (): VaultClient | null => {
  return vaultClient;
};

/**
 * Helper to get secret with fallback to environment variable
 */
export const getSecretOrEnv = async (vaultPath: string, envVar: string): Promise<string> => {
  const vault = getVault();
  
  if (vault && vaultPath) {
    const secret = await vault.readSecret(vaultPath);
    if (secret && secret.value) {
      return secret.value;
    }
  }

  return process.env[envVar] || '';
};
