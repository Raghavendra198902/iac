---
**Document Type**: Multi-Cloud Implementation Guide  
**Audience**: Cloud Engineers, DevOps Engineers, Platform Architects  
**Classification**: Technical - Cloud Platforms  
**Version**: 2.0.0  
**Date**: December 3, 2025  
**Reading Time**: 40 minutes  
**Copyright**: © 2025 IAC Dharma. All rights reserved.

---

# Cloud Provider Guides

Provider-specific implementation guides for AWS, Azure, and GCP in IAC Dharma.

---

## 📋 Overview

This guide covers cloud-specific configurations, best practices, and examples for:

- **AWS** - Amazon Web Services
- **Azure** - Microsoft Azure
- **GCP** - Google Cloud Platform

---

## ☁️ Multi-Cloud Architecture

```mermaid
flowchart TD
    Start([IAC Dharma<br/>Platform]) --> Abstraction[Cloud Abstraction Layer<br/>Unified API]
    
    Abstraction --> Auth{Authentication<br/>Layer}
    
    Auth --> |AWS| AWSAuth[AWS Authentication]
    Auth --> |Azure| AzureAuth[Azure Authentication]
    Auth --> |GCP| GCPAuth[GCP Authentication]
    
    AWSAuth --> |IAM/STS| AWSCreds[AWS Credentials<br/>Access Key + Secret]
    AzureAuth --> |Service Principal| AzureCreds[Azure Credentials<br/>Client ID + Secret]
    GCPAuth --> |Service Account| GCPCreds[GCP Credentials<br/>JSON Key File]
    
    AWSCreds --> AWSProviders{AWS Services}
    AzureCreds --> AzureProviders{Azure Services}
    GCPCreds --> GCPProviders{GCP Services}
    
    AWSProviders --> AWSEC2[EC2<br/>Compute]
    AWSProviders --> AWSRDS[RDS<br/>Database]
    AWSProviders --> AWSS3[S3<br/>Storage]
    AWSProviders --> AWSEKS[EKS<br/>Kubernetes]
    
    AzureProviders --> AzureVM[Virtual Machines<br/>Compute]
    AzureProviders --> AzureSQL[SQL Database<br/>Database]
    AzureProviders --> AzureStorage[Storage Account<br/>Storage]
    AzureProviders --> AzureAKS[AKS<br/>Kubernetes]
    
    GCPProviders --> GCPCompute[Compute Engine<br/>Compute]
    GCPProviders --> GCPCloud SQL[Cloud SQL<br/>Database]
    GCPProviders --> GCPStorage[Cloud Storage<br/>Storage]
    GCPProviders --> GCPGKE[GKE<br/>Kubernetes]
    
    AWSEC2 --> Deployment[Resource Deployment]
    AWSRDS --> Deployment
    AWSS3 --> Deployment
    AWSEKS --> Deployment
    
    AzureVM --> Deployment
    AzureSQL --> Deployment
    AzureStorage --> Deployment
    AzureAKS --> Deployment
    
    GCPCompute --> Deployment
    GCPCloud SQL --> Deployment
    GCPStorage --> Deployment
    GCPGKE --> Deployment
    
    Deployment --> Monitor[Unified Monitoring<br/>Prometheus + Grafana]
    Monitor --> Cost[Cost Optimization<br/>AI Recommendations]
    Cost --> Success([Multi-Cloud<br/>Infrastructure Live])
    
    style Start fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style Abstraction fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style Auth fill:#fff9c4,stroke:#f9a825,stroke-width:2px
    style AWSProviders fill:#fff3e0,stroke:#ff9800,stroke-width:2px
    style AzureProviders fill:#e3f2fd,stroke:#2196f3,stroke-width:2px
    style GCPProviders fill:#fff9c4,stroke:#fbc02d,stroke-width:2px
    style Deployment fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px
    style Success fill:#c8e6c9,stroke:#388e3c,stroke-width:3px
```

---

## ☁️ Amazon Web Services (AWS)

### Authentication

**IAM User Credentials**:

```bash
# Configure AWS credentials
export AWS_ACCESS_KEY_ID="your-access-key"
export AWS_SECRET_ACCESS_KEY="your-secret-key"
export AWS_REGION="us-east-1"

# Or use AWS CLI configuration
aws configure
```

**IAM Role (Recommended for Production)**:

```yaml
# config/aws-config.yml
aws:
  auth_method: iam_role
  role_arn: arn:aws:iam::123456789012:role/IAC-Dharma-Role
  region: us-east-1
  
  # Session duration
  session_duration: 3600
  
  # Assume role with MFA
  mfa_serial: arn:aws:iam::123456789012:mfa/user
```

**AWS SSO**:

```bash
# Configure AWS SSO
aws sso configure

# Login via SSO
aws sso login --profile my-profile

# Use in IAC Dharma
export AWS_PROFILE=my-profile
iac-dharma deploy --provider aws
```

### Common AWS Resources

**VPC Blueprint**:

```yaml
apiVersion: v1
kind: Blueprint
metadata:
  name: aws-vpc-complete
  provider: aws

spec:
  parameters:
    - name: environment
      type: string
      required: true
    - name: cidr_block
      type: string
      default: 10.0.0.0/16
    - name: availability_zones
      type: array
      default: [us-east-1a, us-east-1b, us-east-1c]

  resources:
    # VPC
    - name: vpc
      type: aws::vpc
      properties:
        cidr_block: "{{ parameters.cidr_block }}"
        enable_dns_hostnames: true
        enable_dns_support: true
        tags:
          Name: "{{ parameters.environment }}-vpc"
    
    # Internet Gateway
    - name: igw
      type: aws::internet_gateway
      properties:
        vpc_id: "{{ resources.vpc.id }}"
    
    # Public Subnets
    - name: public_subnets
      type: aws::subnet
      count: 3
      properties:
        vpc_id: "{{ resources.vpc.id }}"
        cidr_block: "10.0.{{ count.index + 1 }}.0/24"
        availability_zone: "{{ parameters.availability_zones[count.index] }}"
        map_public_ip_on_launch: true
        tags:
          Name: "{{ parameters.environment }}-public-{{ count.index + 1 }}"
    
    # Private Subnets
    - name: private_subnets
      type: aws::subnet
      count: 3
      properties:
        vpc_id: "{{ resources.vpc.id }}"
        cidr_block: "10.0.{{ count.index + 11 }}.0/24"
        availability_zone: "{{ parameters.availability_zones[count.index] }}"
        tags:
          Name: "{{ parameters.environment }}-private-{{ count.index + 1 }}"
    
    # NAT Gateways
    - name: nat_eips
      type: aws::eip
      count: 3
      properties:
        domain: vpc
    
    - name: nat_gateways
      type: aws::nat_gateway
      count: 3
      properties:
        allocation_id: "{{ resources.nat_eips[count.index].id }}"
        subnet_id: "{{ resources.public_subnets[count.index].id }}"
```

**EKS Cluster**:

```yaml
resources:
  - name: eks_cluster
    type: aws::eks::cluster
    properties:
      name: "{{ parameters.environment }}-eks"
      version: "1.28"
      role_arn: "{{ resources.eks_role.arn }}"
      
      vpc_config:
        subnet_ids: "{{ resources.private_subnets[*].id }}"
        endpoint_private_access: true
        endpoint_public_access: true
        public_access_cidrs:
          - 0.0.0.0/0
      
      encryption_config:
        - resources: [secrets]
          provider:
            key_arn: "{{ resources.kms_key.arn }}"
      
      logging:
        cluster_logging:
          - types:
              - api
              - audit
              - authenticator
            enabled: true
  
  - name: node_group
    type: aws::eks::node_group
    properties:
      cluster_name: "{{ resources.eks_cluster.name }}"
      node_role_arn: "{{ resources.node_role.arn }}"
      subnet_ids: "{{ resources.private_subnets[*].id }}"
      
      scaling_config:
        desired_size: 3
        min_size: 1
        max_size: 10
      
      instance_types:
        - t3.medium
        - t3.large
      
      capacity_type: ON_DEMAND
```

**RDS Database**:

```yaml
resources:
  - name: db_subnet_group
    type: aws::db_subnet_group
    properties:
      name: "{{ parameters.environment }}-db-subnet"
      subnet_ids: "{{ resources.private_subnets[*].id }}"
  
  - name: rds_cluster
    type: aws::rds::cluster
    properties:
      cluster_identifier: "{{ parameters.environment }}-postgres"
      engine: aurora-postgresql
      engine_version: "15.3"
      master_username: admin
      master_password: "{{ secrets.db_password }}"
      
      db_subnet_group_name: "{{ resources.db_subnet_group.name }}"
      vpc_security_group_ids:
        - "{{ resources.db_sg.id }}"
      
      backup_retention_period: 7
      preferred_backup_window: "03:00-04:00"
      
      storage_encrypted: true
      kms_key_id: "{{ resources.kms_key.arn }}"
      
      enabled_cloudwatch_logs_exports:
        - postgresql
```

### AWS Best Practices

**Tagging Strategy**:

```yaml
locals:
  common_tags:
    Environment: "{{ parameters.environment }}"
    ManagedBy: IAC-Dharma
    Owner: "{{ parameters.owner }}"
    CostCenter: "{{ parameters.cost_center }}"
    Project: "{{ parameters.project }}"
    Compliance: "{{ parameters.compliance_level }}"
```

**Security Groups**:

```yaml
# Layered security groups
resources:
  # ALB security group
  - name: alb_sg
    type: aws::security_group
    properties:
      name: alb-sg
      vpc_id: "{{ resources.vpc.id }}"
      
      ingress:
        - from_port: 443
          to_port: 443
          protocol: tcp
          cidr_blocks: [0.0.0.0/0]
      
      egress:
        - from_port: 0
          to_port: 0
          protocol: -1
          cidr_blocks: [0.0.0.0/0]
  
  # Application security group
  - name: app_sg
    type: aws::security_group
    properties:
      name: app-sg
      vpc_id: "{{ resources.vpc.id }}"
      
      ingress:
        - from_port: 8080
          to_port: 8080
          protocol: tcp
          source_security_group_id: "{{ resources.alb_sg.id }}"
      
      egress:
        - from_port: 0
          to_port: 0
          protocol: -1
          cidr_blocks: [0.0.0.0/0]
  
  # Database security group
  - name: db_sg
    type: aws::security_group
    properties:
      name: db-sg
      vpc_id: "{{ resources.vpc.id }}"
      
      ingress:
        - from_port: 5432
          to_port: 5432
          protocol: tcp
          source_security_group_id: "{{ resources.app_sg.id }}"
```

---

## 🔵 Microsoft Azure

### Authentication

**Service Principal**:

```bash
# Create service principal
az ad sp create-for-rbac \
  --name iac-dharma-sp \
  --role Contributor \
  --scopes /subscriptions/{subscription-id}

# Set environment variables
export AZURE_CLIENT_ID="app-id"
export AZURE_CLIENT_SECRET="password"
export AZURE_TENANT_ID="tenant-id"
export AZURE_SUBSCRIPTION_ID="subscription-id"
```

**Managed Identity**:

```yaml
# config/azure-config.yml
azure:
  auth_method: managed_identity
  subscription_id: "your-subscription-id"
  resource_group: iac-dharma-rg
  location: eastus
```

### Common Azure Resources

**Virtual Network**:

```yaml
apiVersion: v1
kind: Blueprint
metadata:
  name: azure-vnet-complete
  provider: azure

spec:
  parameters:
    - name: environment
      type: string
      required: true
    - name: location
      type: string
      default: eastus

  resources:
    # Resource Group
    - name: rg
      type: azure::resource_group
      properties:
        name: "{{ parameters.environment }}-rg"
        location: "{{ parameters.location }}"
    
    # Virtual Network
    - name: vnet
      type: azure::virtual_network
      properties:
        name: "{{ parameters.environment }}-vnet"
        resource_group_name: "{{ resources.rg.name }}"
        location: "{{ parameters.location }}"
        address_space:
          - 10.0.0.0/16
    
    # Subnets
    - name: public_subnet
      type: azure::subnet
      properties:
        name: public-subnet
        resource_group_name: "{{ resources.rg.name }}"
        virtual_network_name: "{{ resources.vnet.name }}"
        address_prefixes:
          - 10.0.1.0/24
    
    - name: private_subnet
      type: azure::subnet
      properties:
        name: private-subnet
        resource_group_name: "{{ resources.rg.name }}"
        virtual_network_name: "{{ resources.vnet.name }}"
        address_prefixes:
          - 10.0.2.0/24
    
    # Network Security Group
    - name: nsg
      type: azure::network_security_group
      properties:
        name: "{{ parameters.environment }}-nsg"
        resource_group_name: "{{ resources.rg.name }}"
        location: "{{ parameters.location }}"
        
        security_rules:
          - name: allow-https
            priority: 100
            direction: Inbound
            access: Allow
            protocol: Tcp
            source_port_range: "*"
            destination_port_range: "443"
            source_address_prefix: "*"
            destination_address_prefix: "*"
```

**AKS Cluster**:

```yaml
resources:
  - name: aks_cluster
    type: azure::kubernetes_cluster
    properties:
      name: "{{ parameters.environment }}-aks"
      resource_group_name: "{{ resources.rg.name }}"
      location: "{{ parameters.location }}"
      dns_prefix: "{{ parameters.environment }}-aks"
      
      kubernetes_version: "1.28"
      
      default_node_pool:
        name: default
        node_count: 3
        vm_size: Standard_D2s_v3
        availability_zones: [1, 2, 3]
        enable_auto_scaling: true
        min_count: 1
        max_count: 10
      
      identity:
        type: SystemAssigned
      
      network_profile:
        network_plugin: azure
        network_policy: azure
        service_cidr: 10.1.0.0/16
        dns_service_ip: 10.1.0.10
      
      addon_profile:
        oms_agent:
          enabled: true
          log_analytics_workspace_id: "{{ resources.log_analytics.id }}"
```

**Azure SQL Database**:

```yaml
resources:
  - name: sql_server
    type: azure::sql_server
    properties:
      name: "{{ parameters.environment }}-sqlserver"
      resource_group_name: "{{ resources.rg.name }}"
      location: "{{ parameters.location }}"
      version: "12.0"
      
      administrator_login: sqladmin
      administrator_login_password: "{{ secrets.sql_password }}"
      
      minimum_tls_version: "1.2"
  
  - name: sql_database
    type: azure::sql_database
    properties:
      name: "{{ parameters.environment }}-db"
      resource_group_name: "{{ resources.rg.name }}"
      location: "{{ parameters.location }}"
      server_name: "{{ resources.sql_server.name }}"
      
      sku_name: S1
      max_size_gb: 250
      
      threat_detection_policy:
        state: Enabled
        email_addresses:
          - security@company.com
```

### Azure Best Practices

**Naming Conventions**:

```yaml
# Azure naming standards
locals:
  naming:
    resource_group: "{{ env }}-{{ project }}-rg"
    vnet: "{{ env }}-{{ project }}-vnet"
    subnet: "{{ env }}-{{ project }}-{{ tier }}-subnet"
    nsg: "{{ env }}-{{ project }}-{{ tier }}-nsg"
    vm: "{{ env }}-{{ project }}-{{ purpose }}-vm"
    storage: "{{ env }}{{ project }}st"  # No hyphens, lowercase only
```

---

## 🟢 Google Cloud Platform (GCP)

### Authentication

**Service Account**:

```bash
# Create service account
gcloud iam service-accounts create iac-dharma-sa \
  --display-name="IAC Dharma Service Account"

# Grant roles
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:iac-dharma-sa@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/editor"

# Create key
gcloud iam service-accounts keys create key.json \
  --iam-account=iac-dharma-sa@PROJECT_ID.iam.gserviceaccount.com

# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
```

### Common GCP Resources

**VPC Network**:

```yaml
apiVersion: v1
kind: Blueprint
metadata:
  name: gcp-vpc-complete
  provider: gcp

spec:
  parameters:
    - name: environment
      type: string
      required: true
    - name: project_id
      type: string
      required: true
    - name: region
      type: string
      default: us-central1

  resources:
    # VPC Network
    - name: vpc
      type: gcp::compute_network
      properties:
        name: "{{ parameters.environment }}-vpc"
        project: "{{ parameters.project_id }}"
        auto_create_subnetworks: false
        routing_mode: REGIONAL
    
    # Subnets
    - name: public_subnet
      type: gcp::compute_subnetwork
      properties:
        name: "{{ parameters.environment }}-public-subnet"
        project: "{{ parameters.project_id }}"
        region: "{{ parameters.region }}"
        network: "{{ resources.vpc.id }}"
        ip_cidr_range: 10.0.1.0/24
        
        secondary_ip_range:
          - range_name: pods
            ip_cidr_range: 10.1.0.0/16
          - range_name: services
            ip_cidr_range: 10.2.0.0/16
    
    # Firewall Rules
    - name: allow_internal
      type: gcp::compute_firewall
      properties:
        name: "{{ parameters.environment }}-allow-internal"
        project: "{{ parameters.project_id }}"
        network: "{{ resources.vpc.id }}"
        
        allow:
          - protocol: tcp
            ports: [0-65535]
          - protocol: udp
            ports: [0-65535]
          - protocol: icmp
        
        source_ranges:
          - 10.0.0.0/8
```

**GKE Cluster**:

```yaml
resources:
  - name: gke_cluster
    type: gcp::container_cluster
    properties:
      name: "{{ parameters.environment }}-gke"
      project: "{{ parameters.project_id }}"
      location: "{{ parameters.region }}"
      
      min_master_version: "1.28"
      
      network: "{{ resources.vpc.id }}"
      subnetwork: "{{ resources.public_subnet.id }}"
      
      ip_allocation_policy:
        cluster_secondary_range_name: pods
        services_secondary_range_name: services
      
      private_cluster_config:
        enable_private_nodes: true
        enable_private_endpoint: false
        master_ipv4_cidr_block: 172.16.0.0/28
      
      master_authorized_networks_config:
        cidr_blocks:
          - cidr_block: 0.0.0.0/0
            display_name: all
      
      addons_config:
        http_load_balancing:
          disabled: false
        horizontal_pod_autoscaling:
          disabled: false
        network_policy_config:
          disabled: false
      
      workload_identity_config:
        workload_pool: "{{ parameters.project_id }}.svc.id.goog"
  
  - name: node_pool
    type: gcp::container_node_pool
    properties:
      name: default-pool
      project: "{{ parameters.project_id }}"
      location: "{{ parameters.region }}"
      cluster: "{{ resources.gke_cluster.name }}"
      
      initial_node_count: 3
      
      autoscaling:
        min_node_count: 1
        max_node_count: 10
      
      node_config:
        machine_type: n1-standard-2
        disk_size_gb: 100
        disk_type: pd-standard
        
        oauth_scopes:
          - https://www.googleapis.com/auth/cloud-platform
        
        metadata:
          disable-legacy-endpoints: "true"
```

**Cloud SQL**:

```yaml
resources:
  - name: sql_instance
    type: gcp::sql_database_instance
    properties:
      name: "{{ parameters.environment }}-postgres"
      project: "{{ parameters.project_id }}"
      region: "{{ parameters.region }}"
      database_version: POSTGRES_15
      
      settings:
        tier: db-custom-2-7680  # 2 vCPU, 7.68 GB RAM
        
        backup_configuration:
          enabled: true
          start_time: "03:00"
          point_in_time_recovery_enabled: true
        
        ip_configuration:
          ipv4_enabled: false
          private_network: "{{ resources.vpc.id }}"
        
        maintenance_window:
          day: 7  # Sunday
          hour: 3
        
        database_flags:
          - name: max_connections
            value: "100"
  
  - name: sql_database
    type: gcp::sql_database
    properties:
      name: "{{ parameters.environment }}_db"
      project: "{{ parameters.project_id }}"
      instance: "{{ resources.sql_instance.name }}"
      charset: UTF8
      collation: en_US.UTF8
```

### GCP Best Practices

**Organization & Projects**:

```yaml
# Project structure
organization:
  - folder: production
    projects:
      - prod-app
      - prod-data
  - folder: non-production
    projects:
      - dev-app
      - staging-app
```

---

## 📚 Related Documentation

- [Multi-Cloud-Support](Multi-Cloud-Support) - Multi-cloud architecture
- [Terraform-Templates](Terraform-Templates) - Provider modules
- [Security-Best-Practices](Security-Best-Practices) - Cloud security
- [Cost-Optimization](Cost-Optimization) - Cost management

---

**Next Steps**: Review [FAQ](FAQ) for common questions.
