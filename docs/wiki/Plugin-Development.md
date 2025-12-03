---
**Document Type**: Plugin Development Guide  
**Audience**: Plugin Developers, Platform Engineers, Extension Developers  
**Classification**: Technical - Development  
**Version**: 2.0.0  
**Date**: December 3, 2025  
**Reading Time**: 30 minutes  
**Copyright**: © 2025 IAC Dharma. All rights reserved.

---

# Plugin Development

Complete guide to developing custom plugins and extensions for IAC Dharma.

---

## 📋 Overview

IAC Dharma's plugin system allows you to extend platform functionality:

- **Custom Resource Providers**: Add support for new cloud services
- **Workflow Actions**: Create custom workflow steps
- **Blueprint Functions**: Add custom template functions
- **Authentication Providers**: Integrate new SSO providers
- **Cost Calculators**: Custom cost estimation logic
- **Policy Engines**: Custom compliance checks
- **UI Components**: Extend the dashboard

---

## 🏗️ Plugin Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     IAC Dharma Core                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             Plugin Registry                           │  │
│  │  • Discover plugins                                  │  │
│  │  • Load and initialize                               │  │
│  │  • Manage lifecycle                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │             Plugin API                                │  │
│  │  • Resource Provider API                             │  │
│  │  • Workflow Action API                               │  │
│  │  • Blueprint Function API                            │  │
│  │  • UI Extension API                                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Custom Plugins                             │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │ DigitalOcean  │  │   Custom      │  │     Slack     │  │
│  │   Provider    │  │   Workflow    │  │  Notifier     │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Plugin SDK Installation

```bash
# Install IAC Dharma Plugin SDK
npm install @iac-dharma/plugin-sdk

# Or with TypeScript types
npm install @iac-dharma/plugin-sdk @types/iac-dharma
```

### Create Plugin Scaffold

```bash
# Generate plugin template
npx iac-dharma-plugin create \
  --name my-custom-plugin \
  --type resource-provider \
  --language typescript

# Plugin structure created:
my-custom-plugin/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts            # Plugin entry point
│   ├── provider.ts         # Provider implementation
│   └── resources/
│       └── example.ts      # Resource definitions
├── tests/
│   └── provider.test.ts
└── README.md
```

---

## 🔧 Resource Provider Plugin

### Basic Resource Provider

**File: `src/provider.ts`**

```typescript
import { ResourceProvider, Resource, ProviderConfig } from '@iac-dharma/plugin-sdk';

interface DigitalOceanConfig extends ProviderConfig {
  apiToken: string;
  region: string;
}

export class DigitalOceanProvider implements ResourceProvider {
  name = 'digitalocean';
  version = '1.0.0';
  
  private config: DigitalOceanConfig;
  private client: any;
  
  constructor(config: DigitalOceanConfig) {
    this.config = config;
    this.client = this.createClient();
  }
  
  private createClient() {
    // Initialize DigitalOcean API client
    return new DigitalOceanAPI(this.config.apiToken);
  }
  
  async validateConfig(): Promise<boolean> {
    try {
      await this.client.account.get();
      return true;
    } catch (error) {
      throw new Error(`Invalid DigitalOcean credentials: ${error.message}`);
    }
  }
  
  async listResourceTypes(): Promise<string[]> {
    return [
      'digitalocean::droplet',
      'digitalocean::kubernetes_cluster',
      'digitalocean::database_cluster',
      'digitalocean::load_balancer',
      'digitalocean::volume',
      'digitalocean::vpc'
    ];
  }
  
  async createResource(type: string, properties: any): Promise<Resource> {
    switch (type) {
      case 'digitalocean::droplet':
        return this.createDroplet(properties);
      case 'digitalocean::kubernetes_cluster':
        return this.createKubernetesCluster(properties);
      default:
        throw new Error(`Unsupported resource type: ${type}`);
    }
  }
  
  async readResource(type: string, id: string): Promise<Resource> {
    switch (type) {
      case 'digitalocean::droplet':
        return this.readDroplet(id);
      default:
        throw new Error(`Unsupported resource type: ${type}`);
    }
  }
  
  async updateResource(type: string, id: string, properties: any): Promise<Resource> {
    switch (type) {
      case 'digitalocean::droplet':
        return this.updateDroplet(id, properties);
      default:
        throw new Error(`Unsupported resource type: ${type}`);
    }
  }
  
  async deleteResource(type: string, id: string): Promise<void> {
    switch (type) {
      case 'digitalocean::droplet':
        return this.deleteDroplet(id);
      default:
        throw new Error(`Unsupported resource type: ${type}`);
    }
  }
  
  private async createDroplet(properties: any): Promise<Resource> {
    const droplet = await this.client.droplets.create({
      name: properties.name,
      region: properties.region || this.config.region,
      size: properties.size,
      image: properties.image,
      tags: properties.tags || []
    });
    
    return {
      id: droplet.id.toString(),
      type: 'digitalocean::droplet',
      properties: {
        name: droplet.name,
        region: droplet.region.slug,
        size: droplet.size.slug,
        image: droplet.image.slug,
        ip_address: droplet.networks.v4[0]?.ip_address,
        status: droplet.status
      },
      metadata: {
        created_at: droplet.created_at,
        tags: droplet.tags
      }
    };
  }
  
  private async readDroplet(id: string): Promise<Resource> {
    const droplet = await this.client.droplets.getById(parseInt(id));
    
    return {
      id: droplet.id.toString(),
      type: 'digitalocean::droplet',
      properties: {
        name: droplet.name,
        region: droplet.region.slug,
        size: droplet.size.slug,
        image: droplet.image.slug,
        ip_address: droplet.networks.v4[0]?.ip_address,
        status: droplet.status
      }
    };
  }
  
  private async updateDroplet(id: string, properties: any): Promise<Resource> {
    // DigitalOcean doesn't support direct updates
    // Implement resize, rename, etc. as needed
    if (properties.name) {
      await this.client.droplets.rename(parseInt(id), properties.name);
    }
    
    if (properties.size) {
      await this.client.droplets.resize(parseInt(id), properties.size);
    }
    
    return this.readDroplet(id);
  }
  
  private async deleteDroplet(id: string): Promise<void> {
    await this.client.droplets.delete(parseInt(id));
  }
  
  private async createKubernetesCluster(properties: any): Promise<Resource> {
    const cluster = await this.client.kubernetes.createCluster({
      name: properties.name,
      region: properties.region || this.config.region,
      version: properties.version,
      node_pools: properties.node_pools.map((pool: any) => ({
        name: pool.name,
        size: pool.size,
        count: pool.count,
        auto_scale: pool.auto_scale || false,
        min_nodes: pool.min_nodes,
        max_nodes: pool.max_nodes
      }))
    });
    
    return {
      id: cluster.id,
      type: 'digitalocean::kubernetes_cluster',
      properties: {
        name: cluster.name,
        region: cluster.region,
        version: cluster.version,
        endpoint: cluster.endpoint,
        status: cluster.status
      }
    };
  }
}
```

### Resource Schema Definition

**File: `src/resources/droplet.ts`**

```typescript
import { ResourceSchema } from '@iac-dharma/plugin-sdk';

export const dropletSchema: ResourceSchema = {
  type: 'digitalocean::droplet',
  version: '1.0.0',
  
  properties: {
    name: {
      type: 'string',
      required: true,
      description: 'Droplet name',
      validation: {
        pattern: '^[a-z][a-z0-9-]{1,63}$'
      }
    },
    
    region: {
      type: 'string',
      required: true,
      description: 'Region slug',
      allowed_values: ['nyc1', 'nyc3', 'sfo1', 'sfo2', 'lon1', 'ams3', 'sgp1']
    },
    
    size: {
      type: 'string',
      required: true,
      description: 'Droplet size',
      allowed_values: ['s-1vcpu-1gb', 's-1vcpu-2gb', 's-2vcpu-2gb', 's-2vcpu-4gb']
    },
    
    image: {
      type: 'string',
      required: true,
      description: 'Operating system image',
      examples: ['ubuntu-22-04-x64', 'debian-11-x64', 'centos-stream-9-x64']
    },
    
    tags: {
      type: 'array',
      required: false,
      description: 'Resource tags',
      item_type: 'string'
    }
  },
  
  outputs: {
    id: {
      type: 'string',
      description: 'Droplet ID'
    },
    
    ip_address: {
      type: 'string',
      description: 'Public IPv4 address'
    },
    
    status: {
      type: 'string',
      description: 'Droplet status'
    }
  }
};
```

### Plugin Entry Point

**File: `src/index.ts`**

```typescript
import { Plugin, PluginManifest } from '@iac-dharma/plugin-sdk';
import { DigitalOceanProvider } from './provider';
import { dropletSchema } from './resources/droplet';

export class DigitalOceanPlugin implements Plugin {
  manifest: PluginManifest = {
    name: 'digitalocean',
    version: '1.0.0',
    description: 'DigitalOcean cloud provider plugin',
    author: 'Your Name',
    license: 'MIT',
    
    requires: {
      'iac-dharma': '^1.0.0'
    },
    
    capabilities: [
      'resource-provider',
      'cost-calculator'
    ],
    
    config_schema: {
      api_token: {
        type: 'string',
        required: true,
        sensitive: true,
        description: 'DigitalOcean API token'
      },
      region: {
        type: 'string',
        required: false,
        default: 'nyc1',
        description: 'Default region'
      }
    }
  };
  
  async initialize(config: any): Promise<void> {
    // Plugin initialization logic
    console.log('DigitalOcean plugin initialized');
  }
  
  async shutdown(): Promise<void> {
    // Cleanup logic
    console.log('DigitalOcean plugin shutting down');
  }
  
  getProvider(config: any): DigitalOceanProvider {
    return new DigitalOceanProvider(config);
  }
  
  getResourceSchemas(): any[] {
    return [dropletSchema];
  }
}

// Export plugin instance
export default new DigitalOceanPlugin();
```

---

## 🔄 Workflow Action Plugin

### Custom Workflow Action

**File: `src/actions/slack-notify.ts`**

```typescript
import { WorkflowAction, ActionContext, ActionResult } from '@iac-dharma/plugin-sdk';

export class SlackNotifyAction implements WorkflowAction {
  name = 'slack.notify';
  version = '1.0.0';
  
  schema = {
    parameters: {
      webhook_url: {
        type: 'string',
        required: true,
        sensitive: true,
        description: 'Slack webhook URL'
      },
      message: {
        type: 'string',
        required: true,
        description: 'Message to send'
      },
      channel: {
        type: 'string',
        required: false,
        description: 'Override channel'
      },
      username: {
        type: 'string',
        required: false,
        default: 'IAC Dharma',
        description: 'Bot username'
      },
      icon_emoji: {
        type: 'string',
        required: false,
        default: ':robot_face:',
        description: 'Bot emoji icon'
      }
    }
  };
  
  async execute(context: ActionContext): Promise<ActionResult> {
    const { webhook_url, message, channel, username, icon_emoji } = context.parameters;
    
    const payload = {
      text: message,
      username: username,
      icon_emoji: icon_emoji,
      ...(channel && { channel })
    };
    
    try {
      const response = await fetch(webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error(`Slack API error: ${response.statusText}`);
      }
      
      return {
        success: true,
        output: {
          sent_at: new Date().toISOString(),
          message: message
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async validate(parameters: any): Promise<boolean> {
    if (!parameters.webhook_url || !parameters.webhook_url.startsWith('https://hooks.slack.com/')) {
      throw new Error('Invalid Slack webhook URL');
    }
    
    if (!parameters.message || parameters.message.length === 0) {
      throw new Error('Message cannot be empty');
    }
    
    return true;
  }
}
```

---

## 🎨 Blueprint Function Plugin

### Custom Template Function

**File: `src/functions/crypto.ts`**

```typescript
import { BlueprintFunction } from '@iac-dharma/plugin-sdk';
import * as crypto from 'crypto';

export class CryptoFunctions implements BlueprintFunction {
  name = 'crypto';
  version = '1.0.0';
  
  functions = {
    // Generate random string
    random: (length: number = 16, charset: string = 'alphanumeric'): string => {
      const charsets = {
        alphanumeric: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        alpha: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        numeric: '0123456789',
        hex: '0123456789abcdef'
      };
      
      const chars = charsets[charset] || charsets.alphanumeric;
      let result = '';
      
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      return result;
    },
    
    // Generate UUID
    uuid: (): string => {
      return crypto.randomUUID();
    },
    
    // Hash string
    hash: (input: string, algorithm: string = 'sha256'): string => {
      return crypto.createHash(algorithm).update(input).digest('hex');
    },
    
    // HMAC
    hmac: (input: string, key: string, algorithm: string = 'sha256'): string => {
      return crypto.createHmac(algorithm, key).update(input).digest('hex');
    },
    
    // Base64 encode
    base64encode: (input: string): string => {
      return Buffer.from(input).toString('base64');
    },
    
    // Base64 decode
    base64decode: (input: string): string => {
      return Buffer.from(input, 'base64').toString('utf-8');
    }
  };
}
```

**Usage in Blueprint**:

```yaml
resources:
  - name: db_password
    type: aws::secretsmanager::secret
    properties:
      name: database-password
      secret_string: "{{ crypto.random(32, 'alphanumeric') }}"
  
  - name: api_key
    type: aws::secretsmanager::secret
    properties:
      name: api-key
      secret_string: "{{ crypto.uuid() }}"
  
  - name: config_hash
    type: aws::s3::object
    properties:
      key: config-{{ crypto.hash(parameters.environment) }}.json
```

---

## 📦 Publishing Plugin

### Package Configuration

**File: `package.json`**

```json
{
  "name": "@your-org/iac-dharma-plugin-digitalocean",
  "version": "1.0.0",
  "description": "DigitalOcean provider plugin for IAC Dharma",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  
  "keywords": [
    "iac-dharma",
    "plugin",
    "digitalocean",
    "infrastructure"
  ],
  
  "iac-dharma": {
    "plugin": true,
    "type": "resource-provider",
    "entry": "dist/index.js"
  },
  
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "prepublishOnly": "npm run build"
  },
  
  "peerDependencies": {
    "@iac-dharma/plugin-sdk": "^1.0.0"
  },
  
  "devDependencies": {
    "@iac-dharma/plugin-sdk": "^1.0.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0"
  }
}
```

### Publish to npm

```bash
# Build plugin
npm run build

# Run tests
npm test

# Publish to npm
npm publish --access public
```

---

## 🔧 Installing Plugins

### Install from npm

```bash
# Install plugin globally
npm install -g @your-org/iac-dharma-plugin-digitalocean

# Or install in project
npm install @your-org/iac-dharma-plugin-digitalocean
```

### Register Plugin

```bash
# Register plugin with IAC Dharma
iac-dharma plugin install @your-org/iac-dharma-plugin-digitalocean

# Configure plugin
iac-dharma plugin config digitalocean \
  --api-token $DIGITALOCEAN_TOKEN \
  --region nyc1

# List installed plugins
iac-dharma plugin list

# Output:
# ┌──────────────────┬─────────┬───────────────────┬──────────┐
# │ Name             │ Version │ Type              │ Status   │
# ├──────────────────┼─────────┼───────────────────┼──────────┤
# │ digitalocean     │ 1.0.0   │ resource-provider │ active   │
# │ slack-notify     │ 1.0.0   │ workflow-action   │ active   │
# └──────────────────┴─────────┴───────────────────┴──────────┘
```

---

## 🧪 Testing Plugins

### Unit Tests

**File: `tests/provider.test.ts`**

```typescript
import { DigitalOceanProvider } from '../src/provider';

describe('DigitalOceanProvider', () => {
  let provider: DigitalOceanProvider;
  
  beforeEach(() => {
    provider = new DigitalOceanProvider({
      apiToken: process.env.DO_TOKEN || 'test-token',
      region: 'nyc1'
    });
  });
  
  test('validates config with valid token', async () => {
    const result = await provider.validateConfig();
    expect(result).toBe(true);
  });
  
  test('lists resource types', async () => {
    const types = await provider.listResourceTypes();
    expect(types).toContain('digitalocean::droplet');
    expect(types).toContain('digitalocean::kubernetes_cluster');
  });
  
  test('creates droplet', async () => {
    const resource = await provider.createResource('digitalocean::droplet', {
      name: 'test-droplet',
      region: 'nyc1',
      size: 's-1vcpu-1gb',
      image: 'ubuntu-22-04-x64'
    });
    
    expect(resource.id).toBeDefined();
    expect(resource.type).toBe('digitalocean::droplet');
    expect(resource.properties.name).toBe('test-droplet');
  });
});
```

---

## 📚 Related Documentation

- [Custom-Blueprints](Custom-Blueprints) - Blueprint system
- [Workflow-Automation](Workflow-Automation) - Workflow integration
- [API-Reference](API-Reference) - Plugin API details
- [Contributing-Guide](Contributing-Guide) - Contributing plugins

---

**Next Steps**: Review [Cloud-Provider-Guides](Cloud-Provider-Guides) for provider-specific details.
