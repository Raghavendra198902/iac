# Multi-Cloud Support

Comprehensive guide to IAC Dharma's multi-cloud capabilities across AWS, Azure, and Google Cloud Platform.

---

## Overview

IAC Dharma provides a unified interface for managing infrastructure across multiple cloud providers. This abstraction layer allows you to:

- Use a single blueprint format for all providers
- Switch between cloud providers with minimal code changes
- Deploy to multiple clouds simultaneously
- Maintain consistent security policies across clouds
- Centralize cost management and optimization

---

## Supported Cloud Providers

### Amazon Web Services (AWS)
**Status**: ✅ Fully Supported  
**Services**: 100+ AWS services  
**SDK**: AWS SDK for JavaScript v3  
**Authentication**: IAM roles, access keys, STS tokens

### Microsoft Azure
**Status**: ✅ Fully Supported  
**Services**: 80+ Azure services  
**SDK**: Azure SDK for JavaScript  
**Authentication**: Service principals, managed identities

### Google Cloud Platform (GCP)
**Status**: ✅ Fully Supported  
**Services**: 70+ GCP services  
**SDK**: Google Cloud Client Libraries  
**Authentication**: Service accounts, OAuth 2.0

### Coming Soon
- **Oracle Cloud (OCI)**: Q1 2026
- **IBM Cloud**: Q1 2026
- **Alibaba Cloud**: Q2 2026
- **DigitalOcean**: Q2 2026

---

## AWS Integration

### Supported Services

#### Compute
- **EC2**: Virtual machines, instances, AMIs
- **ECS**: Container orchestration
- **EKS**: Kubernetes service
- **Lambda**: Serverless functions
- **Elastic Beanstalk**: Application platform
- **Lightsail**: Simplified VPS

#### Networking
- **VPC**: Virtual private clouds
- **Route 53**: DNS service
- **CloudFront**: CDN
- **ELB**: Load balancers (ALB, NLB, CLB)
- **Direct Connect**: Dedicated connections
- **VPN**: Site-to-site and client VPN

#### Storage
- **S3**: Object storage
- **EBS**: Block storage
- **EFS**: File storage
- **Glacier**: Archive storage
- **Storage Gateway**: Hybrid storage

#### Databases
- **RDS**: Relational databases (MySQL, PostgreSQL, Oracle, SQL Server)
- **DynamoDB**: NoSQL database
- **ElastiCache**: In-memory cache (Redis, Memcached)
- **Redshift**: Data warehouse
- **Neptune**: Graph database
- **DocumentDB**: MongoDB-compatible

#### Security & Identity
- **IAM**: Identity and access management
- **KMS**: Key management
- **Secrets Manager**: Secrets storage
- **WAF**: Web application firewall
- **Shield**: DDoS protection
- **GuardDuty**: Threat detection

### Configuration

```yaml
# Blueprint example - AWS VPC
provider: aws
region: us-east-1
credentials:
  type: access_key
  access_key_id: ${AWS_ACCESS_KEY_ID}
  secret_access_key: ${AWS_SECRET_ACCESS_KEY}

resources:
  - type: aws_vpc
    name: production-vpc
    properties:
      cidr_block: 10.0.0.0/16
      enable_dns_hostnames: true
      enable_dns_support: true
      tags:
        Name: production-vpc
        Environment: production
```

### Authentication Methods

#### 1. Access Keys
```bash
# Set environment variables
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_DEFAULT_REGION="us-east-1"
```

#### 2. IAM Roles (Recommended for EC2)
```json
{
  "provider": "aws",
  "credentials": {
    "type": "iam_role",
    "role_arn": "arn:aws:iam::123456789012:role/MyRole"
  }
}
```

#### 3. AWS Profile
```json
{
  "provider": "aws",
  "credentials": {
    "type": "profile",
    "profile_name": "production"
  }
}
```

### Region Support

All AWS regions supported:
- **US East**: us-east-1, us-east-2
- **US West**: us-west-1, us-west-2
- **Europe**: eu-west-1, eu-west-2, eu-west-3, eu-central-1, eu-north-1
- **Asia Pacific**: ap-south-1, ap-southeast-1, ap-southeast-2, ap-northeast-1, ap-northeast-2, ap-northeast-3
- **South America**: sa-east-1
- **Canada**: ca-central-1
- **Middle East**: me-south-1
- **Africa**: af-south-1
- **GovCloud**: us-gov-east-1, us-gov-west-1

---

## Azure Integration

### Supported Services

#### Compute
- **Virtual Machines**: Windows and Linux VMs
- **AKS**: Azure Kubernetes Service
- **Container Instances**: Serverless containers
- **Functions**: Serverless compute
- **App Service**: Web apps and APIs
- **Batch**: Large-scale computing

#### Networking
- **Virtual Network**: VNets and subnets
- **Load Balancer**: Layer 4 load balancing
- **Application Gateway**: Layer 7 load balancing
- **Traffic Manager**: DNS-based routing
- **ExpressRoute**: Dedicated connections
- **VPN Gateway**: Site-to-site VPN

#### Storage
- **Blob Storage**: Object storage
- **File Storage**: SMB file shares
- **Queue Storage**: Message queuing
- **Table Storage**: NoSQL storage
- **Disk Storage**: Managed disks

#### Databases
- **SQL Database**: Managed SQL Server
- **PostgreSQL**: Managed PostgreSQL
- **MySQL**: Managed MySQL
- **Cosmos DB**: Multi-model database
- **Redis Cache**: Managed Redis

#### Security & Identity
- **Active Directory**: Identity services
- **Key Vault**: Secrets management
- **Security Center**: Unified security
- **Sentinel**: SIEM and SOAR

### Configuration

```yaml
# Blueprint example - Azure VNet
provider: azure
subscription_id: ${AZURE_SUBSCRIPTION_ID}
location: eastus
credentials:
  type: service_principal
  tenant_id: ${AZURE_TENANT_ID}
  client_id: ${AZURE_CLIENT_ID}
  client_secret: ${AZURE_CLIENT_SECRET}

resources:
  - type: azure_virtual_network
    name: production-vnet
    properties:
      address_space:
        - 10.0.0.0/16
      location: eastus
      tags:
        environment: production
```

### Authentication Methods

#### 1. Service Principal
```bash
# Set environment variables
export AZURE_SUBSCRIPTION_ID="your-subscription-id"
export AZURE_TENANT_ID="your-tenant-id"
export AZURE_CLIENT_ID="your-client-id"
export AZURE_CLIENT_SECRET="your-client-secret"
```

#### 2. Managed Identity
```json
{
  "provider": "azure",
  "credentials": {
    "type": "managed_identity"
  }
}
```

#### 3. Azure CLI
```bash
az login
# Credentials stored in ~/.azure
```

### Region Support

All Azure regions supported including:
- **Americas**: East US, West US, Central US, Canada Central
- **Europe**: North Europe, West Europe, UK South, France Central
- **Asia Pacific**: Southeast Asia, East Asia, Australia East, Japan East
- **Middle East**: UAE North
- **Africa**: South Africa North

---

## GCP Integration

### Supported Services

#### Compute
- **Compute Engine**: Virtual machines
- **GKE**: Google Kubernetes Engine
- **Cloud Run**: Serverless containers
- **Cloud Functions**: Serverless functions
- **App Engine**: Application platform

#### Networking
- **VPC**: Virtual private cloud
- **Cloud Load Balancing**: Global load balancing
- **Cloud CDN**: Content delivery
- **Cloud Interconnect**: Dedicated connections
- **Cloud VPN**: IPsec VPN

#### Storage
- **Cloud Storage**: Object storage
- **Persistent Disk**: Block storage
- **Filestore**: Managed NFS

#### Databases
- **Cloud SQL**: Managed MySQL, PostgreSQL, SQL Server
- **Cloud Spanner**: Globally distributed database
- **Firestore**: NoSQL document database
- **Bigtable**: NoSQL wide-column database
- **Memorystore**: Managed Redis and Memcached

#### Security & Identity
- **IAM**: Identity and access management
- **Cloud KMS**: Key management
- **Secret Manager**: Secrets storage
- **Security Command Center**: Security monitoring

### Configuration

```yaml
# Blueprint example - GCP VPC
provider: gcp
project_id: my-project-123456
region: us-central1
credentials:
  type: service_account
  credentials_file: ${GOOGLE_APPLICATION_CREDENTIALS}

resources:
  - type: gcp_compute_network
    name: production-network
    properties:
      auto_create_subnetworks: false
      routing_mode: REGIONAL
```

### Authentication Methods

#### 1. Service Account Key
```bash
# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
```

#### 2. Application Default Credentials
```bash
gcloud auth application-default login
```

#### 3. Workload Identity (GKE)
```json
{
  "provider": "gcp",
  "credentials": {
    "type": "workload_identity"
  }
}
```

### Region Support

All GCP regions supported including:
- **Americas**: us-central1, us-east1, us-west1, northamerica-northeast1, southamerica-east1
- **Europe**: europe-west1, europe-west2, europe-west3, europe-north1
- **Asia Pacific**: asia-east1, asia-southeast1, australia-southeast1, asia-northeast1

---

## Multi-Cloud Blueprints

### Cross-Cloud Resources

Create resources across multiple clouds in a single blueprint:

```yaml
name: Multi-Cloud Infrastructure
version: 1.0.0

providers:
  aws:
    region: us-east-1
    credentials: ${AWS_CREDENTIALS}
  
  azure:
    location: eastus
    credentials: ${AZURE_CREDENTIALS}
  
  gcp:
    region: us-central1
    credentials: ${GCP_CREDENTIALS}

resources:
  # AWS Resources
  - provider: aws
    type: aws_vpc
    name: aws-vpc
    properties:
      cidr_block: 10.1.0.0/16
  
  # Azure Resources
  - provider: azure
    type: azure_virtual_network
    name: azure-vnet
    properties:
      address_space: ["10.2.0.0/16"]
  
  # GCP Resources
  - provider: gcp
    type: gcp_compute_network
    name: gcp-vpc
    properties:
      auto_create_subnetworks: false
```

### Cross-Cloud Networking

Connect VPCs across cloud providers:

```yaml
# AWS-Azure VPN Connection
resources:
  - type: aws_vpn_gateway
    name: aws-vpn-gw
    properties:
      vpc_id: ${aws_vpc.id}
  
  - type: azure_vpn_gateway
    name: azure-vpn-gw
    properties:
      virtual_network_name: ${azure_vnet.name}
      
  - type: cross_cloud_vpn
    name: aws-azure-vpn
    properties:
      side_a:
        provider: aws
        gateway_id: ${aws_vpn_gw.id}
      side_b:
        provider: azure
        gateway_id: ${azure_vpn_gw.id}
```

---

## Provider-Agnostic Resources

Use abstract resource types that work across all providers:

### Virtual Machine

```yaml
resources:
  - type: virtual_machine
    name: web-server
    provider: ${CLOUD_PROVIDER}  # aws, azure, or gcp
    properties:
      instance_type: medium  # Mapped to provider-specific types
      image: ubuntu-20.04
      disk_size: 50
      network: ${network.id}
```

**Provider Mapping**:
- AWS: `t3.medium`
- Azure: `Standard_B2s`
- GCP: `n1-standard-2`

### Database

```yaml
resources:
  - type: managed_database
    name: app-database
    provider: ${CLOUD_PROVIDER}
    properties:
      engine: postgresql
      version: "14"
      instance_class: medium
      storage: 100
```

**Provider Mapping**:
- AWS: RDS PostgreSQL
- Azure: Azure Database for PostgreSQL
- GCP: Cloud SQL for PostgreSQL

---

## Cost Comparison

### Automated Cost Estimation

Get cost estimates across all providers:

```bash
curl -X POST http://localhost:3000/api/costing/compare \
  -H "Content-Type: application/json" \
  -d '{
    "blueprintId": "blueprint-uuid",
    "providers": ["aws", "azure", "gcp"],
    "region": {
      "aws": "us-east-1",
      "azure": "eastus",
      "gcp": "us-central1"
    }
  }'
```

**Response**:
```json
{
  "comparison": {
    "aws": {
      "monthly_cost": 1250.00,
      "breakdown": {...}
    },
    "azure": {
      "monthly_cost": 1180.00,
      "breakdown": {...}
    },
    "gcp": {
      "monthly_cost": 1320.00,
      "breakdown": {...}
    }
  },
  "cheapest": "azure",
  "savings": 70.00
}
```

---

## Best Practices

### 1. Cloud-Agnostic Design
- Use provider-agnostic resource types when possible
- Abstract cloud-specific details behind interfaces
- Design for portability from day one

### 2. Tagging Strategy
- Use consistent tagging across all providers
- Include: environment, project, cost-center, owner
- Enables unified cost allocation

### 3. Security Consistency
- Apply same security policies across clouds
- Use centralized secret management
- Implement consistent network segmentation

### 4. Monitoring
- Centralize logs and metrics from all providers
- Use IAC Dharma's unified dashboard
- Set up cross-cloud alerts

### 5. Cost Optimization
- Use IAC Dharma's AI recommendations
- Compare costs across providers
- Consider workload-specific provider strengths

---

## Migration Strategies

### Cloud-to-Cloud Migration

**Step 1: Discover existing infrastructure**
```bash
iac-dharma discover --provider aws --region us-east-1
```

**Step 2: Generate blueprint**
```bash
iac-dharma blueprint create --from-discovery discovery-id
```

**Step 3: Modify for target provider**
```bash
iac-dharma blueprint convert \
  --from aws \
  --to azure \
  --blueprint blueprint-id
```

**Step 4: Deploy to new provider**
```bash
iac-dharma deploy \
  --blueprint converted-blueprint-id \
  --provider azure
```

---

## Limitations

### Provider-Specific Features

Some features are provider-specific and cannot be abstracted:

**AWS-Only**:
- Availability Zones (concept doesn't exist in GCP)
- ECS Fargate (Azure has Container Instances, GCP has Cloud Run)
- DynamoDB (NoSQL structure differs across providers)

**Azure-Only**:
- Availability Sets
- Service Fabric
- Azure AD integration

**GCP-Only**:
- Preemptible VMs (similar to AWS Spot)
- Global Load Balancing
- Cloud Spanner (globally distributed)

---

## Troubleshooting

### Credential Issues

**AWS**:
```bash
# Verify credentials
aws sts get-caller-identity

# Test with IAC Dharma
iac-dharma provider test --provider aws
```

**Azure**:
```bash
# Verify subscription
az account show

# Test with IAC Dharma
iac-dharma provider test --provider azure
```

**GCP**:
```bash
# Verify credentials
gcloud auth list

# Test with IAC Dharma
iac-dharma provider test --provider gcp
```

### API Rate Limiting

All providers have rate limits. IAC Dharma handles this automatically with:
- Exponential backoff
- Request queuing
- Parallel request optimization

### Region Availability

Not all services available in all regions:

```bash
# Check service availability
iac-dharma provider services \
  --provider aws \
  --region eu-north-1
```

---

## Examples

Complete examples available in the repository:

- [Multi-Cloud VPC Setup](https://github.com/Raghavendra198902/iac/tree/master/examples/multi-cloud-vpc)
- [Cross-Cloud Database Replication](https://github.com/Raghavendra198902/iac/tree/master/examples/cross-cloud-db)
- [Hybrid Cloud Architecture](https://github.com/Raghavendra198902/iac/tree/master/examples/hybrid-cloud)
- [Multi-Cloud Kubernetes](https://github.com/Raghavendra198902/iac/tree/master/examples/multi-cloud-k8s)

---

## Next Steps

- [Cost Optimization](Cost-Optimization) - Reduce multi-cloud costs
- [Security Best Practices](Security-Best-Practices) - Secure multi-cloud
- [Networking Guide](Networking-Guide) - Cross-cloud connectivity
- [Migration Guide](Migration-Guide) - Move between clouds

---

**Questions?** Open an [issue](https://github.com/Raghavendra198902/iac/issues) or check [Discussions](https://github.com/Raghavendra198902/iac/discussions).
