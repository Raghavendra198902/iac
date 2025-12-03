---
**Document Type**: Technical Integration Guide  
**Audience**: DevOps Engineers, System Administrators, Infrastructure Architects  
**Classification**: Technical  
**Version**: 2.0.0  
**Date**: December 3, 2025  
**Reading Time**: 25 minutes  
**Copyright**: © 2025 IAC Dharma. All rights reserved.

---

# CMDB Integration

Comprehensive guide to Configuration Management Database (CMDB) integration for infrastructure discovery and tracking in IAC Dharma.

---

## 📋 Overview

IAC Dharma's CMDB Agent provides automated infrastructure discovery and configuration management:

- **Auto-Discovery**: Automatic detection of cloud resources
- **Real-Time Sync**: Continuous synchronization with cloud providers
- **Dependency Mapping**: Visualize resource relationships
- **Change Tracking**: Historical configuration changes
- **Compliance Auditing**: Track configuration drift

---

## 🏗️ CMDB Architecture

```mermaid
flowchart TD
    Start([CMDB Agent Service<br/>:3008]) --> Discovery[Discovery Engine]
    
    Discovery --> |Scan Resources| CloudAPIs{Cloud Provider<br/>APIs}
    Discovery --> ResourceScanner[Resource Scanner]
    Discovery --> MetadataCollect[Metadata Collector]
    
    CloudAPIs --> |Connect| AWS[AWS API<br/>EC2, RDS, S3]
    CloudAPIs --> |Connect| Azure[Azure API<br/>VM, SQL, Storage]
    CloudAPIs --> |Connect| GCP[GCP API<br/>Compute, Cloud SQL]
    
    ResourceScanner --> DataProcessor[Data Processor]
    MetadataCollect --> DataProcessor
    
    DataProcessor --> Normalize[Normalization<br/>Standardize Format]
    DataProcessor --> RelDetect[Relationship Detection<br/>Map Dependencies]
    DataProcessor --> ChangeDetect[Change Detection<br/>Track Drift]
    
    Normalize --> Storage{Storage Layer}
    RelDetect --> Storage
    ChangeDetect --> Storage
    
    Storage --> PostgreSQL[(PostgreSQL<br/>CI Database)]
    Storage --> Redis[(Redis<br/>Cache Layer)]
    Storage --> Elastic[(Elasticsearch<br/>Search Index)]
    
    PostgreSQL --> Results([Configuration Items<br/>Stored & Indexed])
    
    style Start fill:#e3f2fd,stroke:#1976d2,stroke-width:3px
    style Discovery fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style CloudAPIs fill:#fff9c4,stroke:#f9a825,stroke-width:2px
    style DataProcessor fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    style Storage fill:#fff9c4,stroke:#f9a825,stroke-width:2px
    style PostgreSQL fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    style Redis fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    style Elastic fill:#e1f5fe,stroke:#0277bd,stroke-width:2px
    style Results fill:#c8e6c9,stroke:#388e3c,stroke-width:3px
```

---

## 🚀 Getting Started

### Enable CMDB Agent

**docker-compose.yml**:
```yaml
cmdb-agent:
  build: ./backend/cmdb-agent
  container_name: cmdb-agent
  ports:
    - "3008:3008"
  environment:
    # Discovery settings
    DISCOVERY_ENABLED: "true"
    DISCOVERY_INTERVAL: "3600"  # seconds (1 hour)
    DISCOVERY_PROVIDERS: "aws,azure,gcp"
    
    # AWS configuration
    AWS_ACCESS_KEY_ID: ${AWS_ACCESS_KEY_ID}
    AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY}
    AWS_REGIONS: "us-east-1,us-west-2,eu-west-1"
    
    # Azure configuration
    AZURE_SUBSCRIPTION_ID: ${AZURE_SUBSCRIPTION_ID}
    AZURE_TENANT_ID: ${AZURE_TENANT_ID}
    AZURE_CLIENT_ID: ${AZURE_CLIENT_ID}
    AZURE_CLIENT_SECRET: ${AZURE_CLIENT_SECRET}
    
    # GCP configuration
    GCP_PROJECT_ID: ${GCP_PROJECT_ID}
    GCP_CREDENTIALS: ${GCP_CREDENTIALS}
    
    # Database
    DATABASE_URL: postgresql://postgres:password@postgres:5432/iac_dharma
    REDIS_URL: redis://redis:6379
    
    # Features
    CHANGE_TRACKING_ENABLED: "true"
    RELATIONSHIP_MAPPING_ENABLED: "true"
    COMPLIANCE_CHECKS_ENABLED: "true"
  
  depends_on:
    - postgres
    - redis
  
  networks:
    - iac-network
```

### Initial Discovery

```bash
# Trigger manual discovery
curl -X POST http://localhost:3008/api/discovery/scan \
  -H "Content-Type: application/json" \
  -d '{
    "providers": ["aws", "azure", "gcp"],
    "force": true
  }'

# Check discovery status
curl http://localhost:3008/api/discovery/status

# Response
{
  "status": "running",
  "progress": 45,
  "startedAt": "2025-11-21T10:00:00Z",
  "estimatedCompletion": "2025-11-21T10:15:00Z",
  "discovered": {
    "aws": 324,
    "azure": 156,
    "gcp": 89
  }
}
```

---

## 📦 Configuration Items (CIs)

### CI Data Model

**Database Schema**:
```sql
CREATE TABLE cmdb.configuration_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Identification
    ci_type VARCHAR(100) NOT NULL,  -- e.g., 'ec2_instance', 'rds_database'
    ci_class VARCHAR(50) NOT NULL,  -- e.g., 'compute', 'database', 'network'
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Cloud provider info
    provider VARCHAR(20) NOT NULL,  -- aws, azure, gcp
    provider_id VARCHAR(500) NOT NULL,  -- Cloud-specific ID
    region VARCHAR(50) NOT NULL,
    account_id VARCHAR(100) NOT NULL,
    
    -- Status
    status VARCHAR(50) NOT NULL,  -- running, stopped, terminated
    health_status VARCHAR(20),  -- healthy, unhealthy, unknown
    
    -- Configuration
    configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
    tags JSONB DEFAULT '{}'::jsonb,
    
    -- Relationships
    parent_id UUID REFERENCES cmdb.configuration_items(id),
    dependencies JSONB DEFAULT '[]'::jsonb,
    
    -- Metadata
    discovered_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    last_modified_at TIMESTAMP WITH TIME ZONE,
    
    -- Change tracking
    change_count INTEGER DEFAULT 0,
    last_change_detected_at TIMESTAMP WITH TIME ZONE,
    
    CONSTRAINT ci_provider_id_unique UNIQUE (provider, provider_id)
);

-- Indexes
CREATE INDEX idx_ci_type ON cmdb.configuration_items(ci_type);
CREATE INDEX idx_ci_provider ON cmdb.configuration_items(provider);
CREATE INDEX idx_ci_status ON cmdb.configuration_items(status);
CREATE INDEX idx_ci_discovered_at ON cmdb.configuration_items(discovered_at);
CREATE INDEX idx_ci_configuration_gin ON cmdb.configuration_items USING GIN (configuration);
CREATE INDEX idx_ci_tags_gin ON cmdb.configuration_items USING GIN (tags);
```

### Supported Resource Types

**AWS Resources**:
```yaml
aws_resources:
  compute:
    - ec2_instance
    - autoscaling_group
    - lambda_function
    - ecs_service
    - eks_cluster
  
  database:
    - rds_instance
    - rds_cluster
    - dynamodb_table
    - elasticache_cluster
    - redshift_cluster
  
  storage:
    - s3_bucket
    - ebs_volume
    - efs_file_system
    - glacier_vault
  
  networking:
    - vpc
    - subnet
    - security_group
    - load_balancer
    - nat_gateway
    - internet_gateway
    - route_table
    - network_acl
  
  security:
    - iam_user
    - iam_role
    - iam_policy
    - kms_key
    - secrets_manager_secret
```

**Azure Resources**:
```yaml
azure_resources:
  compute:
    - virtual_machine
    - virtual_machine_scale_set
    - function_app
    - container_instance
    - kubernetes_service
  
  database:
    - sql_database
    - mysql_server
    - postgresql_server
    - cosmos_db_account
  
  storage:
    - storage_account
    - managed_disk
  
  networking:
    - virtual_network
    - network_security_group
    - load_balancer
    - application_gateway
```

**GCP Resources**:
```yaml
gcp_resources:
  compute:
    - compute_instance
    - instance_group
    - cloud_function
    - cloud_run_service
    - gke_cluster
  
  database:
    - cloud_sql_instance
    - cloud_spanner_instance
    - firestore_database
  
  storage:
    - storage_bucket
    - persistent_disk
```

---

## 🔍 Resource Discovery

### Discovery Process

**Step 1: Authentication**:
```python
class CloudProviderAuthenticator:
    def authenticate_aws(self, credentials):
        """Authenticate with AWS"""
        session = boto3.Session(
            aws_access_key_id=credentials['access_key'],
            aws_secret_access_key=credentials['secret_key'],
            region_name=credentials['region']
        )
        return session
    
    def authenticate_azure(self, credentials):
        """Authenticate with Azure"""
        credential = ClientSecretCredential(
            tenant_id=credentials['tenant_id'],
            client_id=credentials['client_id'],
            client_secret=credentials['client_secret']
        )
        return credential
    
    def authenticate_gcp(self, credentials):
        """Authenticate with GCP"""
        credentials = service_account.Credentials.from_service_account_info(
            credentials['service_account']
        )
        return credentials
```

**Step 2: Resource Discovery**:
```python
class ResourceDiscovery:
    def discover_aws_resources(self, session, regions):
        """Discover AWS resources"""
        resources = []
        
        for region in regions:
            # Discover EC2 instances
            ec2_client = session.client('ec2', region_name=region)
            instances = ec2_client.describe_instances()
            
            for reservation in instances['Reservations']:
                for instance in reservation['Instances']:
                    resources.append({
                        'ci_type': 'ec2_instance',
                        'ci_class': 'compute',
                        'provider': 'aws',
                        'provider_id': instance['InstanceId'],
                        'region': region,
                        'name': self._get_name_tag(instance['Tags']),
                        'status': instance['State']['Name'],
                        'configuration': {
                            'instance_type': instance['InstanceType'],
                            'launch_time': instance['LaunchTime'].isoformat(),
                            'vpc_id': instance.get('VpcId'),
                            'subnet_id': instance.get('SubnetId'),
                            'private_ip': instance.get('PrivateIpAddress'),
                            'public_ip': instance.get('PublicIpAddress'),
                            'security_groups': [sg['GroupId'] for sg in instance['SecurityGroups']]
                        },
                        'tags': self._normalize_tags(instance.get('Tags', []))
                    })
            
            # Discover RDS databases
            rds_client = session.client('rds', region_name=region)
            databases = rds_client.describe_db_instances()
            
            for db in databases['DBInstances']:
                resources.append({
                    'ci_type': 'rds_instance',
                    'ci_class': 'database',
                    'provider': 'aws',
                    'provider_id': db['DBInstanceIdentifier'],
                    'region': region,
                    'name': db['DBInstanceIdentifier'],
                    'status': db['DBInstanceStatus'],
                    'configuration': {
                        'engine': db['Engine'],
                        'engine_version': db['EngineVersion'],
                        'instance_class': db['DBInstanceClass'],
                        'storage': db['AllocatedStorage'],
                        'multi_az': db['MultiAZ'],
                        'endpoint': db['Endpoint']['Address']
                    }
                })
            
            # Continue for other resource types...
        
        return resources
```

**Step 3: Relationship Mapping**:
```python
class RelationshipMapper:
    def map_relationships(self, resources):
        """Detect and map resource relationships"""
        relationships = []
        
        # Create lookup maps
        resource_map = {r['provider_id']: r for r in resources}
        
        for resource in resources:
            if resource['ci_type'] == 'ec2_instance':
                # Map to VPC
                vpc_id = resource['configuration'].get('vpc_id')
                if vpc_id and vpc_id in resource_map:
                    relationships.append({
                        'source_id': resource['id'],
                        'target_id': resource_map[vpc_id]['id'],
                        'relationship_type': 'belongs_to',
                        'description': 'Instance belongs to VPC'
                    })
                
                # Map to security groups
                for sg_id in resource['configuration'].get('security_groups', []):
                    if sg_id in resource_map:
                        relationships.append({
                            'source_id': resource['id'],
                            'target_id': resource_map[sg_id]['id'],
                            'relationship_type': 'uses',
                            'description': 'Instance uses security group'
                        })
        
        return relationships
```

---

## 🔄 Change Tracking

### Configuration Change Detection

**Change Detection Table**:
```sql
CREATE TABLE cmdb.configuration_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ci_id UUID NOT NULL REFERENCES cmdb.configuration_items(id),
    
    change_type VARCHAR(50) NOT NULL,  -- created, modified, deleted
    field_name VARCHAR(255),
    old_value JSONB,
    new_value JSONB,
    
    detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    detected_by VARCHAR(100) DEFAULT 'cmdb_agent',
    
    -- Approval workflow
    requires_approval BOOLEAN DEFAULT false,
    approved BOOLEAN,
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_changes_ci_id ON cmdb.configuration_changes(ci_id);
CREATE INDEX idx_changes_detected_at ON cmdb.configuration_changes(detected_at);
CREATE INDEX idx_changes_type ON cmdb.configuration_changes(change_type);
```

**Change Detection Logic**:
```python
class ChangeDetector:
    def detect_changes(self, current_state, previous_state):
        """Detect configuration changes"""
        changes = []
        
        # Detect new resources
        current_ids = set(r['provider_id'] for r in current_state)
        previous_ids = set(r['provider_id'] for r in previous_state)
        
        new_resources = current_ids - previous_ids
        deleted_resources = previous_ids - current_ids
        
        for resource_id in new_resources:
            resource = next(r for r in current_state if r['provider_id'] == resource_id)
            changes.append({
                'ci_id': resource['id'],
                'change_type': 'created',
                'new_value': resource['configuration']
            })
        
        for resource_id in deleted_resources:
            resource = next(r for r in previous_state if r['provider_id'] == resource_id)
            changes.append({
                'ci_id': resource['id'],
                'change_type': 'deleted',
                'old_value': resource['configuration']
            })
        
        # Detect modifications
        common_ids = current_ids & previous_ids
        for resource_id in common_ids:
            current = next(r for r in current_state if r['provider_id'] == resource_id)
            previous = next(r for r in previous_state if r['provider_id'] == resource_id)
            
            # Deep comparison
            config_changes = self._compare_configurations(
                previous['configuration'],
                current['configuration']
            )
            
            for field, (old_val, new_val) in config_changes.items():
                changes.append({
                    'ci_id': current['id'],
                    'change_type': 'modified',
                    'field_name': field,
                    'old_value': old_val,
                    'new_value': new_val
                })
        
        return changes
    
    def _compare_configurations(self, old_config, new_config):
        """Deep comparison of configurations"""
        changes = {}
        
        all_keys = set(old_config.keys()) | set(new_config.keys())
        
        for key in all_keys:
            old_value = old_config.get(key)
            new_value = new_config.get(key)
            
            if old_value != new_value:
                changes[key] = (old_value, new_value)
        
        return changes
```

---

## 📊 CMDB Queries

### Common Queries

**Find All EC2 Instances**:
```sql
SELECT 
    id,
    name,
    provider_id,
    region,
    status,
    configuration->>'instance_type' AS instance_type,
    discovered_at
FROM cmdb.configuration_items
WHERE ci_type = 'ec2_instance'
  AND status = 'running'
ORDER BY discovered_at DESC;
```

**Find Resources by Tag**:
```sql
SELECT 
    ci_type,
    name,
    provider,
    region,
    tags
FROM cmdb.configuration_items
WHERE tags @> '{"Environment": "production"}'::jsonb;
```

**Find Orphaned Resources**:
```sql
-- Resources without parent
SELECT 
    ci_type,
    name,
    provider_id
FROM cmdb.configuration_items
WHERE parent_id IS NULL
  AND ci_type NOT IN ('vpc', 'virtual_network');
```

**Configuration Drift Detection**:
```sql
SELECT 
    ci.name,
    ci.ci_type,
    cc.field_name,
    cc.old_value,
    cc.new_value,
    cc.detected_at
FROM cmdb.configuration_changes cc
JOIN cmdb.configuration_items ci ON cc.ci_id = ci.id
WHERE cc.detected_at > NOW() - INTERVAL '24 hours'
  AND cc.change_type = 'modified'
ORDER BY cc.detected_at DESC;
```

### API Endpoints

**Get Configuration Items**:
```bash
# List all CIs
curl http://localhost:3008/api/cmdb/items

# Filter by type
curl http://localhost:3008/api/cmdb/items?type=ec2_instance

# Filter by provider and region
curl "http://localhost:3008/api/cmdb/items?provider=aws&region=us-east-1"

# Search by name
curl "http://localhost:3008/api/cmdb/items?search=web-server"
```

**Get CI Details**:
```bash
curl http://localhost:3008/api/cmdb/items/550e8400-e29b-41d4-a716-446655440000
```

**Get CI Relationships**:
```bash
curl http://localhost:3008/api/cmdb/items/550e8400-e29b-41d4-a716-446655440000/relationships
```

**Get Change History**:
```bash
curl http://localhost:3008/api/cmdb/items/550e8400-e29b-41d4-a716-446655440000/changes?days=30
```

---

## 📈 Reporting & Analytics

### Built-in Reports

**Inventory Report**:
```bash
curl http://localhost:3008/api/cmdb/reports/inventory \
  -o inventory.json

# Response
{
  "total_items": 1543,
  "by_provider": {
    "aws": 892,
    "azure": 421,
    "gcp": 230
  },
  "by_type": {
    "ec2_instance": 245,
    "rds_instance": 34,
    "s3_bucket": 156,
    "lambda_function": 89
  },
  "by_status": {
    "running": 1204,
    "stopped": 287,
    "terminated": 52
  }
}
```

**Cost Attribution Report**:
```bash
curl http://localhost:3008/api/cmdb/reports/cost-attribution?group_by=tag:Project
```

**Compliance Report**:
```bash
curl http://localhost:3008/api/cmdb/reports/compliance?framework=hipaa
```

---

## 🔧 Configuration

### Discovery Settings

```yaml
discovery:
  # Schedule
  enabled: true
  interval: 3600  # seconds
  schedule_cron: "0 */6 * * *"  # Every 6 hours
  
  # Providers
  providers:
    aws:
      enabled: true
      regions:
        - us-east-1
        - us-west-2
        - eu-west-1
      resource_types:
        - ec2_instance
        - rds_instance
        - s3_bucket
        - lambda_function
    
    azure:
      enabled: true
      subscriptions:
        - subscription-id-1
      resource_types:
        - virtual_machine
        - sql_database
    
    gcp:
      enabled: true
      projects:
        - project-id-1
      resource_types:
        - compute_instance
        - cloud_sql_instance
  
  # Performance
  parallel_workers: 5
  batch_size: 100
  timeout: 300  # seconds
  
  # Change detection
  change_tracking:
    enabled: true
    snapshot_retention_days: 90
    
  # Notifications
  notifications:
    on_discovery_complete: true
    on_new_resources: true
    on_configuration_changes: true
    channels:
      - email
      - slack
```

---

## 🔍 Troubleshooting

### Discovery Not Running

```bash
# Check CMDB agent status
docker logs cmdb-agent --tail 50

# Verify credentials
curl http://localhost:3008/api/cmdb/health

# Trigger manual scan
curl -X POST http://localhost:3008/api/discovery/scan -d '{"force": true}'
```

### Missing Resources

**Check discovery scope**:
```bash
curl http://localhost:3008/api/cmdb/config/discovery
```

**Verify permissions**:
- AWS: `ec2:Describe*`, `rds:Describe*`, `s3:ListAllMyBuckets`
- Azure: Reader role
- GCP: Viewer role

---

## 📚 Related Documentation

- [Multi-Cloud Support](Multi-Cloud-Support) - Cloud provider setup
- [API Reference](API-Reference) - CMDB API endpoints
- [Compliance and Governance](Compliance-and-Governance) - Compliance tracking
- [Cost Optimization](Cost-Optimization) - Cost attribution

---

**Next Steps**: Configure [SSO-Configuration](SSO-Configuration) for enterprise authentication.
