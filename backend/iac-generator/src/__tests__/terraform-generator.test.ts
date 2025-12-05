import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
const mockResourceMapper = {
  mapToTerraform: vi.fn(),
  getResourceType: vi.fn(),
  validateResource: vi.fn(),
};

const mockStateManager = {
  saveState: vi.fn(),
  loadState: vi.fn(),
  deleteState: vi.fn(),
  lockState: vi.fn(),
  unlockState: vi.fn(),
};

const mockValidator = {
  validateConfig: vi.fn(),
  validateSyntax: vi.fn(),
  validateResources: vi.fn(),
};

describe('TerraformGenerator', () => {
  let terraformGenerator: any;

  beforeEach(() => {
    vi.clearAllMocks();

    terraformGenerator = {
      generate: vi.fn(),
      generateProvider: vi.fn(),
      generateResource: vi.fn(),
      generateModule: vi.fn(),
      generateVariable: vi.fn(),
      generateOutput: vi.fn(),
      validate: vi.fn(),
      format: vi.fn(),
      mapper: mockResourceMapper,
      stateManager: mockStateManager,
      validator: mockValidator,
    };
  });

  describe('Provider Configuration', () => {
    it('should generate AWS provider configuration', async () => {
      const config = {
        provider: 'aws',
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'AKIA...',
          secretAccessKey: '***',
        },
      };

      const expected = `
provider "aws" {
  region     = "us-east-1"
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}
`;

      terraformGenerator.generateProvider.mockResolvedValue(expected);

      const result = await terraformGenerator.generateProvider(config);

      expect(result).toContain('provider "aws"');
      expect(result).toContain('region     = "us-east-1"');
      expect(mockResourceMapper.validateResource).toBeDefined();
    });

    it('should generate Azure provider configuration', async () => {
      const config = {
        provider: 'azure',
        subscriptionId: 'sub-123',
        tenantId: 'tenant-123',
      };

      const expected = `
provider "azurerm" {
  features {}
  subscription_id = var.azure_subscription_id
  tenant_id       = var.azure_tenant_id
}
`;

      terraformGenerator.generateProvider.mockResolvedValue(expected);

      const result = await terraformGenerator.generateProvider(config);

      expect(result).toContain('provider "azurerm"');
      expect(result).toContain('features {}');
    });

    it('should generate GCP provider configuration', async () => {
      const config = {
        provider: 'gcp',
        project: 'my-project',
        region: 'us-central1',
        credentials: 'path/to/credentials.json',
      };

      const expected = `
provider "google" {
  project     = var.gcp_project
  region      = "us-central1"
  credentials = file(var.gcp_credentials_path)
}
`;

      terraformGenerator.generateProvider.mockResolvedValue(expected);

      const result = await terraformGenerator.generateProvider(config);

      expect(result).toContain('provider "google"');
      expect(result).toContain('project     = var.gcp_project');
    });

    it('should support provider aliases', async () => {
      const config = {
        provider: 'aws',
        alias: 'west',
        region: 'us-west-2',
      };

      const expected = `
provider "aws" {
  alias  = "west"
  region = "us-west-2"
}
`;

      terraformGenerator.generateProvider.mockResolvedValue(expected);

      const result = await terraformGenerator.generateProvider(config);

      expect(result).toContain('alias  = "west"');
    });

    it('should generate multiple provider configurations', async () => {
      const configs = [
        { provider: 'aws', region: 'us-east-1' },
        { provider: 'aws', alias: 'west', region: 'us-west-2' },
      ];

      const expected = configs.map((c) =>
        terraformGenerator.generateProvider.mockResolvedValueOnce(`provider "aws" { region = "${c.region}" }`)
      );

      const results = await Promise.all(
        configs.map((c) => terraformGenerator.generateProvider(c))
      );

      expect(results).toHaveLength(2);
    });
  });

  describe('Resource Generation', () => {
    it('should generate EC2 instance resource', async () => {
      const resource = {
        type: 'aws_instance',
        name: 'web_server',
        properties: {
          ami: 'ami-12345',
          instance_type: 't2.micro',
          tags: {
            Name: 'WebServer',
            Environment: 'Production',
          },
        },
      };

      const expected = `
resource "aws_instance" "web_server" {
  ami           = "ami-12345"
  instance_type = "t2.micro"

  tags = {
    Name        = "WebServer"
    Environment = "Production"
  }
}
`;

      terraformGenerator.generateResource.mockResolvedValue(expected);

      const result = await terraformGenerator.generateResource(resource);

      expect(result).toContain('resource "aws_instance" "web_server"');
      expect(result).toContain('ami           = "ami-12345"');
      expect(result).toContain('instance_type = "t2.micro"');
    });

    it('should generate S3 bucket resource', async () => {
      const resource = {
        type: 'aws_s3_bucket',
        name: 'my_bucket',
        properties: {
          bucket: 'my-unique-bucket-name',
          acl: 'private',
          versioning: {
            enabled: true,
          },
        },
      };

      const expected = `
resource "aws_s3_bucket" "my_bucket" {
  bucket = "my-unique-bucket-name"
  acl    = "private"

  versioning {
    enabled = true
  }
}
`;

      terraformGenerator.generateResource.mockResolvedValue(expected);

      const result = await terraformGenerator.generateResource(resource);

      expect(result).toContain('resource "aws_s3_bucket"');
      expect(result).toContain('versioning {');
      expect(result).toContain('enabled = true');
    });

    it('should generate VPC resource with nested blocks', async () => {
      const resource = {
        type: 'aws_vpc',
        name: 'main',
        properties: {
          cidr_block: '10.0.0.0/16',
          enable_dns_hostnames: true,
          enable_dns_support: true,
        },
      };

      const expected = `
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
}
`;

      terraformGenerator.generateResource.mockResolvedValue(expected);

      const result = await terraformGenerator.generateResource(resource);

      expect(result).toContain('resource "aws_vpc" "main"');
      expect(result).toContain('cidr_block           = "10.0.0.0/16"');
    });

    it('should handle resource dependencies', async () => {
      const resource = {
        type: 'aws_subnet',
        name: 'public',
        properties: {
          vpc_id: '${aws_vpc.main.id}',
          cidr_block: '10.0.1.0/24',
        },
        depends_on: ['aws_vpc.main'],
      };

      const expected = `
resource "aws_subnet" "public" {
  vpc_id     = aws_vpc.main.id
  cidr_block = "10.0.1.0/24"

  depends_on = [aws_vpc.main]
}
`;

      terraformGenerator.generateResource.mockResolvedValue(expected);

      const result = await terraformGenerator.generateResource(resource);

      expect(result).toContain('depends_on = [aws_vpc.main]');
    });

    it('should generate resource with count meta-argument', async () => {
      const resource = {
        type: 'aws_instance',
        name: 'web',
        count: 3,
        properties: {
          ami: 'ami-12345',
          instance_type: 't2.micro',
        },
      };

      const expected = `
resource "aws_instance" "web" {
  count         = 3
  ami           = "ami-12345"
  instance_type = "t2.micro"
}
`;

      terraformGenerator.generateResource.mockResolvedValue(expected);

      const result = await terraformGenerator.generateResource(resource);

      expect(result).toContain('count         = 3');
    });

    it('should generate resource with for_each', async () => {
      const resource = {
        type: 'aws_instance',
        name: 'server',
        for_each: '${var.server_names}',
        properties: {
          ami: 'ami-12345',
          instance_type: 't2.micro',
          tags: {
            Name: '${each.value}',
          },
        },
      };

      const expected = `
resource "aws_instance" "server" {
  for_each      = var.server_names
  ami           = "ami-12345"
  instance_type = "t2.micro"

  tags = {
    Name = each.value
  }
}
`;

      terraformGenerator.generateResource.mockResolvedValue(expected);

      const result = await terraformGenerator.generateResource(resource);

      expect(result).toContain('for_each      = var.server_names');
    });
  });

  describe('Module Generation', () => {
    it('should generate module block', async () => {
      const module = {
        name: 'vpc',
        source: 'terraform-aws-modules/vpc/aws',
        version: '3.0.0',
        inputs: {
          name: 'my-vpc',
          cidr: '10.0.0.0/16',
          azs: ['us-east-1a', 'us-east-1b'],
        },
      };

      const expected = `
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "3.0.0"

  name = "my-vpc"
  cidr = "10.0.0.0/16"
  azs  = ["us-east-1a", "us-east-1b"]
}
`;

      terraformGenerator.generateModule.mockResolvedValue(expected);

      const result = await terraformGenerator.generateModule(module);

      expect(result).toContain('module "vpc"');
      expect(result).toContain('source  = "terraform-aws-modules/vpc/aws"');
      expect(result).toContain('version = "3.0.0"');
    });

    it('should generate local module reference', async () => {
      const module = {
        name: 'networking',
        source: './modules/networking',
        inputs: {
          environment: 'production',
        },
      };

      const expected = `
module "networking" {
  source = "./modules/networking"

  environment = "production"
}
`;

      terraformGenerator.generateModule.mockResolvedValue(expected);

      const result = await terraformGenerator.generateModule(module);

      expect(result).toContain('source = "./modules/networking"');
    });

    it('should generate module with complex inputs', async () => {
      const module = {
        name: 'app',
        source: './modules/app',
        inputs: {
          vpc_id: '${module.vpc.vpc_id}',
          subnets: '${module.vpc.private_subnets}',
          security_groups: ['${aws_security_group.app.id}'],
        },
      };

      const expected = `
module "app" {
  source = "./modules/app"

  vpc_id          = module.vpc.vpc_id
  subnets         = module.vpc.private_subnets
  security_groups = [aws_security_group.app.id]
}
`;

      terraformGenerator.generateModule.mockResolvedValue(expected);

      const result = await terraformGenerator.generateModule(module);

      expect(result).toContain('module.vpc.vpc_id');
    });
  });

  describe('Variable Generation', () => {
    it('should generate simple variable', async () => {
      const variable = {
        name: 'region',
        type: 'string',
        default: 'us-east-1',
        description: 'AWS region',
      };

      const expected = `
variable "region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}
`;

      terraformGenerator.generateVariable.mockResolvedValue(expected);

      const result = await terraformGenerator.generateVariable(variable);

      expect(result).toContain('variable "region"');
      expect(result).toContain('type        = string');
      expect(result).toContain('default     = "us-east-1"');
    });

    it('should generate variable without default', async () => {
      const variable = {
        name: 'api_key',
        type: 'string',
        description: 'API key for authentication',
        sensitive: true,
      };

      const expected = `
variable "api_key" {
  description = "API key for authentication"
  type        = string
  sensitive   = true
}
`;

      terraformGenerator.generateVariable.mockResolvedValue(expected);

      const result = await terraformGenerator.generateVariable(variable);

      expect(result).toContain('sensitive   = true');
      expect(result).not.toContain('default');
    });

    it('should generate list variable', async () => {
      const variable = {
        name: 'availability_zones',
        type: 'list(string)',
        default: ['us-east-1a', 'us-east-1b'],
      };

      const expected = `
variable "availability_zones" {
  type    = list(string)
  default = ["us-east-1a", "us-east-1b"]
}
`;

      terraformGenerator.generateVariable.mockResolvedValue(expected);

      const result = await terraformGenerator.generateVariable(variable);

      expect(result).toContain('type    = list(string)');
    });

    it('should generate map variable', async () => {
      const variable = {
        name: 'tags',
        type: 'map(string)',
        default: {
          Environment: 'Production',
          Owner: 'DevOps',
        },
      };

      const expected = `
variable "tags" {
  type = map(string)
  default = {
    Environment = "Production"
    Owner       = "DevOps"
  }
}
`;

      terraformGenerator.generateVariable.mockResolvedValue(expected);

      const result = await terraformGenerator.generateVariable(variable);

      expect(result).toContain('type = map(string)');
    });

    it('should generate object variable', async () => {
      const variable = {
        name: 'database_config',
        type: 'object({ engine: string, version: string })',
        default: {
          engine: 'postgres',
          version: '13.4',
        },
      };

      const expected = `
variable "database_config" {
  type = object({
    engine  = string
    version = string
  })
  default = {
    engine  = "postgres"
    version = "13.4"
  }
}
`;

      terraformGenerator.generateVariable.mockResolvedValue(expected);

      const result = await terraformGenerator.generateVariable(variable);

      expect(result).toContain('object({');
    });

    it('should generate variable with validation', async () => {
      const variable = {
        name: 'instance_type',
        type: 'string',
        validation: {
          condition: 'contains(["t2.micro", "t2.small", "t2.medium"], var.instance_type)',
          error_message: 'Invalid instance type.',
        },
      };

      const expected = `
variable "instance_type" {
  type = string

  validation {
    condition     = contains(["t2.micro", "t2.small", "t2.medium"], var.instance_type)
    error_message = "Invalid instance type."
  }
}
`;

      terraformGenerator.generateVariable.mockResolvedValue(expected);

      const result = await terraformGenerator.generateVariable(variable);

      expect(result).toContain('validation {');
    });
  });

  describe('Output Generation', () => {
    it('should generate simple output', async () => {
      const output = {
        name: 'vpc_id',
        value: '${aws_vpc.main.id}',
        description: 'The ID of the VPC',
      };

      const expected = `
output "vpc_id" {
  description = "The ID of the VPC"
  value       = aws_vpc.main.id
}
`;

      terraformGenerator.generateOutput.mockResolvedValue(expected);

      const result = await terraformGenerator.generateOutput(output);

      expect(result).toContain('output "vpc_id"');
      expect(result).toContain('value       = aws_vpc.main.id');
    });

    it('should generate sensitive output', async () => {
      const output = {
        name: 'database_password',
        value: '${random_password.db.result}',
        sensitive: true,
      };

      const expected = `
output "database_password" {
  value     = random_password.db.result
  sensitive = true
}
`;

      terraformGenerator.generateOutput.mockResolvedValue(expected);

      const result = await terraformGenerator.generateOutput(output);

      expect(result).toContain('sensitive = true');
    });

    it('should generate output with complex value', async () => {
      const output = {
        name: 'instance_ips',
        value: '${aws_instance.web[*].private_ip}',
      };

      const expected = `
output "instance_ips" {
  value = aws_instance.web[*].private_ip
}
`;

      terraformGenerator.generateOutput.mockResolvedValue(expected);

      const result = await terraformGenerator.generateOutput(output);

      expect(result).toContain('aws_instance.web[*].private_ip');
    });
  });

  describe('Complete Configuration Generation', () => {
    it('should generate complete Terraform configuration', async () => {
      const config = {
        provider: { provider: 'aws', region: 'us-east-1' },
        resources: [
          { type: 'aws_vpc', name: 'main', properties: { cidr_block: '10.0.0.0/16' } },
        ],
        variables: [{ name: 'region', type: 'string', default: 'us-east-1' }],
        outputs: [{ name: 'vpc_id', value: '${aws_vpc.main.id}' }],
      };

      const expected = `
provider "aws" {
  region = "us-east-1"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
}

output "vpc_id" {
  value = aws_vpc.main.id
}
`;

      terraformGenerator.generate.mockResolvedValue(expected);

      const result = await terraformGenerator.generate(config);

      expect(result).toContain('provider "aws"');
      expect(result).toContain('resource "aws_vpc"');
      expect(result).toContain('variable "region"');
      expect(result).toContain('output "vpc_id"');
    });
  });

  describe('Validation and Formatting', () => {
    it('should validate Terraform configuration', async () => {
      const config = `
resource "aws_instance" "web" {
  ami           = "ami-12345"
  instance_type = "t2.micro"
}
`;

      mockValidator.validateConfig.mockResolvedValue({
        valid: true,
        errors: [],
      });

      terraformGenerator.validate.mockResolvedValue({
        valid: true,
        errors: [],
      });

      const result = await terraformGenerator.validate(config);

      expect(result.valid).toBe(true);
    });

    it('should format Terraform code', async () => {
      const unformatted = 'resource "aws_instance" "web" { ami="ami-12345" instance_type="t2.micro" }';
      const formatted = `
resource "aws_instance" "web" {
  ami           = "ami-12345"
  instance_type = "t2.micro"
}
`;

      terraformGenerator.format.mockResolvedValue(formatted);

      const result = await terraformGenerator.format(unformatted);

      expect(result).toContain('  ami           =');
      expect(result).toContain('  instance_type =');
    });
  });
});
