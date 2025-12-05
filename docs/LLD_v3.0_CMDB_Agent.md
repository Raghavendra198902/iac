# Low-Level Design: CMDB Agent v3.0

## 1. Overview

**Purpose**: Automated Configuration Management Database for infrastructure discovery, tracking, and relationship mapping  
**Technology**: Python 3.11 + Neo4j Graph Database + Redis Cache  
**Port**: 8200

## 2. Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    CMDB Agent v3.0                         │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ Discovery    │  │ Tracking     │  │ Relationship   │ │
│  │ Engine       │  │ Engine       │  │ Mapper         │ │
│  └──────────────┘  └──────────────┘  └────────────────┘ │
│         ↓                  ↓                  ↓           │
│  ┌────────────────────────────────────────────────────┐  │
│  │         Configuration Item (CI) Manager            │  │
│  └────────────────────────────────────────────────────┘  │
│         ↓                  ↓                  ↓           │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ Neo4j Graph  │  │ PostgreSQL   │  │ Redis Cache    │ │
│  │ (Relations)  │  │ (Metadata)   │  │ (Fast Lookup)  │ │
│  └──────────────┘  └──────────────┘  └────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

## 3. Data Models

### 3.1 Configuration Item (CI) Base Model

```python
# src/cmdb/models/ci.py

from enum import Enum
from pydantic import BaseModel, Field, validator
from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

class CIType(str, Enum):
    """Configuration Item Types"""
    # Infrastructure
    SERVER = "server"
    VIRTUAL_MACHINE = "virtual_machine"
    CONTAINER = "container"
    KUBERNETES_CLUSTER = "kubernetes_cluster"
    KUBERNETES_NODE = "kubernetes_node"
    KUBERNETES_POD = "kubernetes_pod"
    
    # Network
    LOAD_BALANCER = "load_balancer"
    FIREWALL = "firewall"
    VPC = "vpc"
    SUBNET = "subnet"
    NETWORK_INTERFACE = "network_interface"
    
    # Storage
    BLOCK_STORAGE = "block_storage"
    OBJECT_STORAGE = "object_storage"
    DATABASE = "database"
    CACHE = "cache"
    
    # Application
    SERVICE = "service"
    APPLICATION = "application"
    MICROSERVICE = "microservice"
    API = "api"
    
    # Cloud Resources
    AWS_EC2 = "aws_ec2"
    AWS_RDS = "aws_rds"
    AWS_S3 = "aws_s3"
    GCP_COMPUTE = "gcp_compute"
    AZURE_VM = "azure_vm"

class CIStatus(str, Enum):
    """CI Status"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    DEPRECATED = "deprecated"
    PLANNED = "planned"
    RETIRED = "retired"
    UNDER_MAINTENANCE = "under_maintenance"
    FAILED = "failed"

class CIEnvironment(str, Enum):
    """Environment Types"""
    PRODUCTION = "production"
    STAGING = "staging"
    DEVELOPMENT = "development"
    TEST = "test"
    QA = "qa"
    DR = "disaster_recovery"

class RelationType(str, Enum):
    """Relationship Types"""
    DEPENDS_ON = "depends_on"
    HOSTED_ON = "hosted_on"
    CONNECTS_TO = "connects_to"
    RUNS_ON = "runs_on"
    USES = "uses"
    COMMUNICATES_WITH = "communicates_with"
    PART_OF = "part_of"
    MANAGED_BY = "managed_by"
    MONITORS = "monitors"
    BACKS_UP = "backs_up"

class ConfigurationItem(BaseModel):
    """Base Configuration Item"""
    ci_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ci_type: CIType
    name: str
    display_name: str
    status: CIStatus = CIStatus.ACTIVE
    environment: CIEnvironment
    
    # Metadata
    provider: Optional[str] = None  # aws, gcp, azure, on-premise
    region: Optional[str] = None
    availability_zone: Optional[str] = None
    
    # Identification
    external_id: Optional[str] = None  # Provider-specific ID
    ip_address: Optional[str] = None
    hostname: Optional[str] = None
    fqdn: Optional[str] = None
    
    # Attributes
    attributes: Dict[str, Any] = Field(default_factory=dict)
    tags: Dict[str, str] = Field(default_factory=dict)
    
    # Ownership
    owner: Optional[str] = None
    team: Optional[str] = None
    cost_center: Optional[str] = None
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    discovered_at: datetime = Field(default_factory=datetime.now)
    last_seen_at: datetime = Field(default_factory=datetime.now)
    
    # Versioning
    version: int = 1
    change_history: List[Dict] = Field(default_factory=list)
    
    # Compliance
    compliance_status: Optional[str] = None
    security_posture: Optional[str] = None
    
    @validator('ci_id')
    def validate_ci_id(cls, v):
        if not v:
            return str(uuid.uuid4())
        return v

class ServerCI(ConfigurationItem):
    """Server Configuration Item"""
    ci_type: CIType = CIType.SERVER
    
    # Hardware
    cpu_cores: Optional[int] = None
    cpu_model: Optional[str] = None
    memory_gb: Optional[float] = None
    disk_gb: Optional[float] = None
    
    # Software
    os_type: Optional[str] = None  # linux, windows
    os_version: Optional[str] = None
    kernel_version: Optional[str] = None
    
    # Network
    mac_addresses: List[str] = Field(default_factory=list)
    network_interfaces: List[Dict] = Field(default_factory=list)
    
    # Installed Software
    installed_packages: List[str] = Field(default_factory=list)
    running_services: List[str] = Field(default_factory=list)

class DatabaseCI(ConfigurationItem):
    """Database Configuration Item"""
    ci_type: CIType = CIType.DATABASE
    
    # Database Info
    db_type: Optional[str] = None  # postgresql, mysql, mongodb
    db_version: Optional[str] = None
    db_engine: Optional[str] = None
    
    # Configuration
    port: Optional[int] = None
    connection_string: Optional[str] = None
    
    # Capacity
    storage_gb: Optional[float] = None
    max_connections: Optional[int] = None
    
    # Performance
    iops: Optional[int] = None
    backup_enabled: bool = False
    backup_retention_days: Optional[int] = None
    
    # Replication
    is_replica: bool = False
    master_db_id: Optional[str] = None
    replica_lag_seconds: Optional[float] = None

class KubernetesClusterCI(ConfigurationItem):
    """Kubernetes Cluster Configuration Item"""
    ci_type: CIType = CIType.KUBERNETES_CLUSTER
    
    # Cluster Info
    k8s_version: Optional[str] = None
    cluster_endpoint: Optional[str] = None
    
    # Nodes
    node_count: int = 0
    master_count: int = 0
    worker_count: int = 0
    
    # Capacity
    total_cpu_cores: Optional[int] = None
    total_memory_gb: Optional[float] = None
    
    # Networking
    network_plugin: Optional[str] = None  # calico, flannel, weave
    service_cidr: Optional[str] = None
    pod_cidr: Optional[str] = None
    
    # Features
    autoscaling_enabled: bool = False
    monitoring_enabled: bool = False
    logging_enabled: bool = False

class Relationship(BaseModel):
    """Relationship between CIs"""
    relationship_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    source_ci_id: str
    target_ci_id: str
    relationship_type: RelationType
    
    # Metadata
    attributes: Dict[str, Any] = Field(default_factory=dict)
    weight: float = 1.0  # Importance/strength of relationship
    
    # Lifecycle
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    discovered_at: datetime = Field(default_factory=datetime.now)
    
    # Validation
    is_valid: bool = True
    validation_timestamp: Optional[datetime] = None
```

### 3.2 Neo4j Graph Schema

```cypher
// Create CI Nodes
CREATE (ci:ConfigurationItem {
  ci_id: $ci_id,
  ci_type: $ci_type,
  name: $name,
  status: $status,
  environment: $environment,
  provider: $provider,
  created_at: datetime()
})

// Create Indexes
CREATE INDEX ci_id_index FOR (ci:ConfigurationItem) ON (ci.ci_id);
CREATE INDEX ci_type_index FOR (ci:ConfigurationItem) ON (ci.ci_type);
CREATE INDEX ci_name_index FOR (ci:ConfigurationItem) ON (ci.name);
CREATE INDEX ci_environment_index FOR (ci:ConfigurationItem) ON (ci.environment);

// Create Relationships
MATCH (source:ConfigurationItem {ci_id: $source_id})
MATCH (target:ConfigurationItem {ci_id: $target_id})
CREATE (source)-[r:DEPENDS_ON {
  relationship_id: $relationship_id,
  weight: $weight,
  created_at: datetime()
}]->(target)

// Relationship Types
CREATE (s)-[:DEPENDS_ON]->(t)
CREATE (s)-[:HOSTED_ON]->(t)
CREATE (s)-[:CONNECTS_TO]->(t)
CREATE (s)-[:RUNS_ON]->(t)
CREATE (s)-[:USES]->(t)
CREATE (s)-[:COMMUNICATES_WITH]->(t)
CREATE (s)-[:PART_OF]->(t)
CREATE (s)-[:MANAGED_BY]->(t)
```

## 4. Discovery Engine

### 4.1 Multi-Cloud Discovery

```python
# src/cmdb/discovery/multi_cloud_discovery.py

import asyncio
from typing import List, Dict, Any
import boto3
from google.cloud import compute_v1
from azure.identity import DefaultAzureCredential
from azure.mgmt.compute import ComputeManagementClient

class MultiCloudDiscovery:
    """Discover resources across multiple cloud providers"""
    
    def __init__(self):
        self.aws_session = None
        self.gcp_client = None
        self.azure_client = None
        
    async def discover_all(self) -> List[ConfigurationItem]:
        """Discover resources from all providers"""
        
        tasks = [
            self.discover_aws(),
            self.discover_gcp(),
            self.discover_azure(),
            self.discover_kubernetes(),
            self.discover_on_premise(),  # Added on-premise discovery
            self.discover_vmware(),       # Added VMware
            self.discover_openstack(),    # Added OpenStack
            self.discover_bare_metal(),   # Added bare metal servers
        ]
        
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Flatten results
        all_cis = []
        for result in results:
            if isinstance(result, list):
                all_cis.extend(result)
            elif isinstance(result, Exception):
                logger.error(f"Discovery failed: {result}")
        
        return all_cis
    
    async def discover_aws(self) -> List[ConfigurationItem]:
        """Discover AWS resources"""
        cis = []
        
        # Initialize AWS clients
        ec2 = boto3.client('ec2')
        rds = boto3.client('rds')
        s3 = boto3.client('s3')
        
        # Discover EC2 instances
        ec2_instances = ec2.describe_instances()
        for reservation in ec2_instances['Reservations']:
            for instance in reservation['Instances']:
                ci = ServerCI(
                    ci_type=CIType.AWS_EC2,
                    name=instance['InstanceId'],
                    display_name=self._get_tag_value(instance, 'Name', instance['InstanceId']),
                    status=self._map_ec2_status(instance['State']['Name']),
                    environment=self._detect_environment(instance),
                    provider="aws",
                    region=instance['Placement']['AvailabilityZone'][:-1],
                    availability_zone=instance['Placement']['AvailabilityZone'],
                    external_id=instance['InstanceId'],
                    ip_address=instance.get('PrivateIpAddress'),
                    hostname=instance.get('PrivateDnsName'),
                    os_type=self._detect_os_type(instance),
                    cpu_cores=self._get_cpu_cores(instance['InstanceType']),
                    memory_gb=self._get_memory_gb(instance['InstanceType']),
                    tags=self._extract_tags(instance.get('Tags', [])),
                    attributes={
                        'instance_type': instance['InstanceType'],
                        'ami_id': instance['ImageId'],
                        'vpc_id': instance.get('VpcId'),
                        'subnet_id': instance.get('SubnetId'),
                        'launch_time': instance['LaunchTime'].isoformat(),
                    }
                )
                cis.append(ci)
        
        # Discover RDS databases
        rds_instances = rds.describe_db_instances()
        for db in rds_instances['DBInstances']:
            ci = DatabaseCI(
                ci_type=CIType.AWS_RDS,
                name=db['DBInstanceIdentifier'],
                display_name=db['DBInstanceIdentifier'],
                status=self._map_rds_status(db['DBInstanceStatus']),
                environment=self._detect_environment_from_name(db['DBInstanceIdentifier']),
                provider="aws",
                region=db['AvailabilityZone'][:-1],
                availability_zone=db['AvailabilityZone'],
                external_id=db['DBInstanceArn'],
                hostname=db.get('Endpoint', {}).get('Address'),
                port=db.get('Endpoint', {}).get('Port'),
                db_type=db['Engine'],
                db_version=db['EngineVersion'],
                storage_gb=db['AllocatedStorage'],
                backup_enabled=db['BackupRetentionPeriod'] > 0,
                backup_retention_days=db['BackupRetentionPeriod'],
                is_replica=db.get('ReadReplicaSourceDBInstanceIdentifier') is not None,
                attributes={
                    'instance_class': db['DBInstanceClass'],
                    'multi_az': db['MultiAZ'],
                    'storage_type': db['StorageType'],
                    'iops': db.get('Iops'),
                }
            )
            cis.append(ci)
        
        # Discover S3 buckets
        buckets = s3.list_buckets()
        for bucket in buckets['Buckets']:
            ci = ConfigurationItem(
                ci_type=CIType.AWS_S3,
                name=bucket['Name'],
                display_name=bucket['Name'],
                status=CIStatus.ACTIVE,
                environment=self._detect_environment_from_name(bucket['Name']),
                provider="aws",
                external_id=bucket['Name'],
                attributes={
                    'creation_date': bucket['CreationDate'].isoformat(),
                }
            )
            cis.append(ci)
        
        return cis
    
    async def discover_gcp(self) -> List[ConfigurationItem]:
        """Discover GCP resources"""
        cis = []
        
        # Initialize GCP client
        instances_client = compute_v1.InstancesClient()
        project = 'your-project-id'
        
        # List all zones
        zones_client = compute_v1.ZonesClient()
        zones = zones_client.list(project=project)
        
        for zone in zones:
            # Get instances in zone
            request = compute_v1.ListInstancesRequest(
                project=project,
                zone=zone.name
            )
            
            instances = instances_client.list(request=request)
            
            for instance in instances:
                ci = ServerCI(
                    ci_type=CIType.GCP_COMPUTE,
                    name=instance.name,
                    display_name=instance.name,
                    status=self._map_gcp_status(instance.status),
                    environment=self._detect_environment_from_labels(instance.labels),
                    provider="gcp",
                    region=zone.name[:-2],
                    availability_zone=zone.name,
                    external_id=str(instance.id),
                    hostname=instance.hostname,
                    cpu_cores=self._get_gcp_cpu_cores(instance.machine_type),
                    memory_gb=self._get_gcp_memory_gb(instance.machine_type),
                    attributes={
                        'machine_type': instance.machine_type,
                        'creation_timestamp': instance.creation_timestamp,
                    }
                )
                cis.append(ci)
        
        return cis
    
    async def discover_kubernetes(self) -> List[ConfigurationItem]:
        """Discover Kubernetes resources"""
        cis = []
        
        from kubernetes import client, config
        
        # Load kubeconfig
        config.load_kube_config()
        
        v1 = client.CoreV1Api()
        apps_v1 = client.AppsV1Api()
        
        # Discover nodes
        nodes = v1.list_node()
        for node in nodes.items:
            ci = ConfigurationItem(
                ci_type=CIType.KUBERNETES_NODE,
                name=node.metadata.name,
                display_name=node.metadata.name,
                status=self._map_k8s_node_status(node.status.conditions),
                environment=CIEnvironment.PRODUCTION,
                provider="kubernetes",
                hostname=node.metadata.name,
                attributes={
                    'cpu_capacity': node.status.capacity['cpu'],
                    'memory_capacity': node.status.capacity['memory'],
                    'pod_capacity': node.status.capacity['pods'],
                    'kubelet_version': node.status.node_info.kubelet_version,
                    'os_image': node.status.node_info.os_image,
                }
            )
            cis.append(ci)
        
        # Discover pods
        pods = v1.list_pod_for_all_namespaces()
        for pod in pods.items:
            ci = ConfigurationItem(
                ci_type=CIType.KUBERNETES_POD,
                name=f"{pod.metadata.namespace}/{pod.metadata.name}",
                display_name=pod.metadata.name,
                status=self._map_k8s_pod_status(pod.status.phase),
                environment=self._detect_k8s_environment(pod.metadata.namespace),
                provider="kubernetes",
                hostname=pod.spec.node_name,
                ip_address=pod.status.pod_ip,
                attributes={
                    'namespace': pod.metadata.namespace,
                    'containers': [c.name for c in pod.spec.containers],
                    'restart_count': sum(cs.restart_count for cs in pod.status.container_statuses or []),
                }
            )
            cis.append(ci)
        
        return cis
    
    async def discover_on_premise(self) -> List[ConfigurationItem]:
        """Discover on-premise infrastructure"""
        cis = []
        
        # Use multiple discovery methods for on-premise
        discovery_methods = [
            self._discover_via_ssh(),
            self._discover_via_snmp(),
            self._discover_via_ipmi(),
            self._discover_via_agent(),
            self._discover_network_scan(),
        ]
        
        results = await asyncio.gather(*discovery_methods, return_exceptions=True)
        for result in results:
            if isinstance(result, list):
                cis.extend(result)
        
        return cis
    
    async def _discover_via_ssh(self) -> List[ConfigurationItem]:
        """Discover servers via SSH"""
        cis = []
        
        # Get list of servers from inventory
        servers = await self._get_ssh_inventory()
        
        for server_info in servers:
            try:
                # Connect via SSH
                ssh_client = await self._ssh_connect(
                    host=server_info['host'],
                    username=server_info['username'],
                    key_file=server_info.get('key_file')
                )
                
                # Collect system information
                hostname = await self._ssh_exec(ssh_client, "hostname")
                os_info = await self._ssh_exec(ssh_client, "cat /etc/os-release")
                cpu_info = await self._ssh_exec(ssh_client, "lscpu")
                mem_info = await self._ssh_exec(ssh_client, "free -g")
                disk_info = await self._ssh_exec(ssh_client, "df -h")
                network_info = await self._ssh_exec(ssh_client, "ip addr")
                
                # Parse information
                ci = ServerCI(
                    ci_type=CIType.SERVER,
                    name=hostname.strip(),
                    display_name=hostname.strip(),
                    status=CIStatus.ACTIVE,
                    environment=self._detect_environment_from_name(hostname),
                    provider="on-premise",
                    hostname=hostname.strip(),
                    ip_address=server_info['host'],
                    os_type=self._parse_os_type(os_info),
                    os_version=self._parse_os_version(os_info),
                    cpu_cores=self._parse_cpu_cores(cpu_info),
                    memory_gb=self._parse_memory_gb(mem_info),
                    disk_gb=self._parse_disk_gb(disk_info),
                    network_interfaces=self._parse_network_interfaces(network_info),
                    attributes={
                        'datacenter': server_info.get('datacenter', 'unknown'),
                        'rack': server_info.get('rack', 'unknown'),
                        'management_type': 'ssh',
                        'ssh_port': server_info.get('port', 22),
                    },
                    tags={
                        'location': server_info.get('location', 'unknown'),
                        'owner': server_info.get('owner', 'unknown'),
                    }
                )
                
                # Get installed packages
                if 'ubuntu' in os_info.lower() or 'debian' in os_info.lower():
                    packages = await self._ssh_exec(ssh_client, "dpkg -l | grep '^ii' | awk '{print $2}'")
                    ci.installed_packages = packages.strip().split('\n')[:100]  # Limit to 100
                elif 'centos' in os_info.lower() or 'rhel' in os_info.lower():
                    packages = await self._ssh_exec(ssh_client, "rpm -qa")
                    ci.installed_packages = packages.strip().split('\n')[:100]
                
                # Get running services
                services = await self._ssh_exec(ssh_client, "systemctl list-units --type=service --state=running --no-pager | grep '.service' | awk '{print $1}'")
                ci.running_services = services.strip().split('\n')[:50]  # Limit to 50
                
                cis.append(ci)
                await ssh_client.close()
                
            except Exception as e:
                logger.error(f"Failed to discover {server_info['host']}: {e}")
        
        return cis
    
    async def _discover_via_snmp(self) -> List[ConfigurationItem]:
        """Discover network devices via SNMP"""
        cis = []
        
        from pysnmp.hlapi.asyncio import *
        
        # Get list of SNMP-enabled devices
        devices = await self._get_snmp_inventory()
        
        for device in devices:
            try:
                # SNMP queries
                iterator = getCmd(
                    SnmpEngine(),
                    CommunityData(device.get('community', 'public')),
                    UdpTransportTarget((device['host'], device.get('port', 161))),
                    ContextData(),
                    ObjectType(ObjectIdentity('SNMPv2-MIB', 'sysDescr', 0)),
                    ObjectType(ObjectIdentity('SNMPv2-MIB', 'sysName', 0)),
                    ObjectType(ObjectIdentity('SNMPv2-MIB', 'sysUpTime', 0)),
                )
                
                errorIndication, errorStatus, errorIndex, varBinds = await iterator
                
                if not errorIndication and not errorStatus:
                    sys_desc = str(varBinds[0][1])
                    sys_name = str(varBinds[1][1])
                    sys_uptime = str(varBinds[2][1])
                    
                    # Determine device type from sysDescr
                    if 'switch' in sys_desc.lower():
                        ci_type = CIType.NETWORK_INTERFACE
                    elif 'router' in sys_desc.lower():
                        ci_type = CIType.LOAD_BALANCER
                    elif 'firewall' in sys_desc.lower():
                        ci_type = CIType.FIREWALL
                    else:
                        ci_type = CIType.SERVER
                    
                    ci = ConfigurationItem(
                        ci_type=ci_type,
                        name=sys_name,
                        display_name=sys_name,
                        status=CIStatus.ACTIVE,
                        environment=self._detect_environment_from_name(sys_name),
                        provider="on-premise",
                        hostname=sys_name,
                        ip_address=device['host'],
                        attributes={
                            'system_description': sys_desc,
                            'uptime': sys_uptime,
                            'snmp_version': device.get('version', 'v2c'),
                            'management_type': 'snmp',
                            'datacenter': device.get('datacenter', 'unknown'),
                        }
                    )
                    cis.append(ci)
                    
            except Exception as e:
                logger.error(f"Failed SNMP discovery for {device['host']}: {e}")
        
        return cis
    
    async def _discover_via_ipmi(self) -> List[ConfigurationItem]:
        """Discover bare metal servers via IPMI"""
        cis = []
        
        import pyipmi
        import pyipmi.interfaces
        
        # Get IPMI-enabled servers
        servers = await self._get_ipmi_inventory()
        
        for server in servers:
            try:
                # Connect to BMC
                interface = pyipmi.interfaces.create_interface('ipmitool', interface_type='lanplus')
                ipmi = pyipmi.create_connection(interface)
                ipmi.target = pyipmi.Target(
                    ipmb_address=server.get('ipmb_address', 0x20)
                )
                ipmi.session.set_session_type_rmcp(
                    host=server['bmc_ip'],
                    port=server.get('bmc_port', 623)
                )
                ipmi.session.set_auth_type_user(
                    username=server['username'],
                    password=server['password']
                )
                ipmi.session.establish()
                
                # Get system information
                fru_info = ipmi.get_fru_inventory()
                sensor_data = ipmi.get_sensor_data_repository()
                
                ci = ServerCI(
                    ci_type=CIType.SERVER,
                    name=fru_info.get('product_name', server['bmc_ip']),
                    display_name=fru_info.get('product_name', server['bmc_ip']),
                    status=CIStatus.ACTIVE,
                    environment=self._detect_environment_from_name(server.get('name', '')),
                    provider="on-premise",
                    ip_address=server.get('host_ip'),
                    attributes={
                        'bmc_ip': server['bmc_ip'],
                        'manufacturer': fru_info.get('manufacturer', 'unknown'),
                        'product_name': fru_info.get('product_name', 'unknown'),
                        'serial_number': fru_info.get('serial_number', 'unknown'),
                        'management_type': 'ipmi',
                        'datacenter': server.get('datacenter', 'unknown'),
                        'rack': server.get('rack', 'unknown'),
                        'rack_position': server.get('rack_position', 'unknown'),
                    },
                    tags={
                        'hardware_type': 'bare_metal',
                        'location': server.get('location', 'unknown'),
                    }
                )
                
                cis.append(ci)
                ipmi.session.close()
                
            except Exception as e:
                logger.error(f"Failed IPMI discovery for {server['bmc_ip']}: {e}")
        
        return cis
    
    async def _discover_via_agent(self) -> List[ConfigurationItem]:
        """Discover servers via CMDB agent installed on hosts"""
        cis = []
        
        # Query agent registry
        agents = await self._get_registered_agents()
        
        for agent in agents:
            try:
                # Call agent API
                response = await self._http_get(
                    f"http://{agent['host']}:{agent.get('port', 8201)}/api/v1/system-info"
                )
                
                if response.status == 200:
                    data = await response.json()
                    
                    ci = ServerCI(
                        ci_type=CIType.SERVER,
                        name=data['hostname'],
                        display_name=data['hostname'],
                        status=CIStatus.ACTIVE,
                        environment=CIEnvironment(data.get('environment', 'development')),
                        provider="on-premise",
                        hostname=data['hostname'],
                        ip_address=data.get('ip_address'),
                        fqdn=data.get('fqdn'),
                        os_type=data['os']['type'],
                        os_version=data['os']['version'],
                        kernel_version=data['os'].get('kernel_version'),
                        cpu_cores=data['cpu']['cores'],
                        cpu_model=data['cpu'].get('model'),
                        memory_gb=data['memory']['total_gb'],
                        disk_gb=data['disk']['total_gb'],
                        network_interfaces=data.get('network_interfaces', []),
                        installed_packages=data.get('packages', [])[:100],
                        running_services=data.get('services', [])[:50],
                        attributes={
                            'agent_version': data.get('agent_version'),
                            'management_type': 'agent',
                            'datacenter': data.get('datacenter', 'unknown'),
                            'rack': data.get('rack', 'unknown'),
                            'uptime_seconds': data.get('uptime'),
                        },
                        tags=data.get('tags', {})
                    )
                    
                    cis.append(ci)
                    
            except Exception as e:
                logger.error(f"Failed agent discovery for {agent['host']}: {e}")
        
        return cis
    
    async def _discover_network_scan(self) -> List[ConfigurationItem]:
        """Discover devices via network scanning (nmap)"""
        cis = []
        
        import nmap
        
        # Get network ranges to scan
        network_ranges = await self._get_network_ranges()
        
        nm = nmap.PortScanner()
        
        for network_range in network_ranges:
            try:
                # Scan network
                nm.scan(
                    hosts=network_range['cidr'],
                    arguments='-sn -PE -PP -PS22,80,443 -PA80,443'  # Ping scan
                )
                
                for host in nm.all_hosts():
                    if nm[host].state() == 'up':
                        # Try to identify device type
                        device_type = CIType.SERVER
                        
                        # Additional port scan for identification
                        nm.scan(host, arguments='-sV -p 22,80,443,3389,161')
                        
                        open_ports = []
                        for proto in nm[host].all_protocols():
                            ports = nm[host][proto].keys()
                            open_ports.extend(ports)
                        
                        ci = ConfigurationItem(
                            ci_type=device_type,
                            name=host,
                            display_name=nm[host].hostname() or host,
                            status=CIStatus.ACTIVE,
                            environment=CIEnvironment.PRODUCTION,  # Default
                            provider="on-premise",
                            hostname=nm[host].hostname(),
                            ip_address=host,
                            attributes={
                                'discovery_method': 'network_scan',
                                'open_ports': open_ports,
                                'mac_address': nm[host].get('addresses', {}).get('mac'),
                                'vendor': nm[host].get('vendor', {}).get(nm[host].get('addresses', {}).get('mac', ''), 'unknown'),
                                'datacenter': network_range.get('datacenter', 'unknown'),
                            }
                        )
                        
                        cis.append(ci)
                        
            except Exception as e:
                logger.error(f"Failed network scan for {network_range['cidr']}: {e}")
        
        return cis
    
    async def discover_vmware(self) -> List[ConfigurationItem]:
        """Discover VMware vSphere infrastructure"""
        cis = []
        
        from pyVim.connect import SmartConnect
        from pyVmomi import vim
        
        # Get vCenter credentials
        vcenters = await self._get_vmware_inventory()
        
        for vcenter in vcenters:
            try:
                # Connect to vCenter
                si = SmartConnect(
                    host=vcenter['host'],
                    user=vcenter['username'],
                    pwd=vcenter['password'],
                    port=vcenter.get('port', 443)
                )
                
                content = si.RetrieveContent()
                
                # Discover VMs
                container = content.viewManager.CreateContainerView(
                    content.rootFolder,
                    [vim.VirtualMachine],
                    True
                )
                
                for vm in container.view:
                    if vm.runtime.powerState == "poweredOn":
                        status = CIStatus.ACTIVE
                    elif vm.runtime.powerState == "poweredOff":
                        status = CIStatus.INACTIVE
                    else:
                        status = CIStatus.UNDER_MAINTENANCE
                    
                    ci = ServerCI(
                        ci_type=CIType.VIRTUAL_MACHINE,
                        name=vm.name,
                        display_name=vm.name,
                        status=status,
                        environment=self._detect_environment_from_name(vm.name),
                        provider="vmware",
                        hostname=vm.guest.hostName if vm.guest else None,
                        ip_address=vm.guest.ipAddress if vm.guest else None,
                        cpu_cores=vm.config.hardware.numCPU,
                        memory_gb=vm.config.hardware.memoryMB / 1024,
                        disk_gb=sum(device.capacityInKB / 1024 / 1024 
                                   for device in vm.config.hardware.device 
                                   if isinstance(device, vim.vm.device.VirtualDisk)),
                        os_type=vm.guest.guestFamily if vm.guest else None,
                        os_version=vm.guest.guestFullName if vm.guest else None,
                        attributes={
                            'vm_id': vm._moId,
                            'vcenter': vcenter['host'],
                            'datacenter': vm.runtime.host.parent.parent.parent.name if vm.runtime.host else 'unknown',
                            'cluster': vm.runtime.host.parent.name if vm.runtime.host else 'unknown',
                            'host': vm.runtime.host.name if vm.runtime.host else 'unknown',
                            'power_state': vm.runtime.powerState,
                            'tools_status': vm.guest.toolsStatus if vm.guest else 'unknown',
                            'vm_path': vm.config.files.vmPathName,
                        }
                    )
                    
                    cis.append(ci)
                
                # Discover ESXi hosts
                host_container = content.viewManager.CreateContainerView(
                    content.rootFolder,
                    [vim.HostSystem],
                    True
                )
                
                for host in host_container.view:
                    ci = ServerCI(
                        ci_type=CIType.SERVER,
                        name=host.name,
                        display_name=host.name,
                        status=CIStatus.ACTIVE if host.runtime.connectionState == "connected" else CIStatus.INACTIVE,
                        environment=CIEnvironment.PRODUCTION,
                        provider="vmware-esxi",
                        hostname=host.name,
                        cpu_cores=host.hardware.cpuInfo.numCpuCores,
                        memory_gb=host.hardware.memorySize / 1024 / 1024 / 1024,
                        attributes={
                            'host_id': host._moId,
                            'vcenter': vcenter['host'],
                            'version': host.config.product.version,
                            'build': host.config.product.build,
                            'cpu_model': host.hardware.cpuPkg[0].description if host.hardware.cpuPkg else None,
                            'vendor': host.hardware.systemInfo.vendor,
                            'model': host.hardware.systemInfo.model,
                        }
                    )
                    cis.append(ci)
                
            except Exception as e:
                logger.error(f"Failed VMware discovery for {vcenter['host']}: {e}")
        
        return cis
    
    async def discover_openstack(self) -> List[ConfigurationItem]:
        """Discover OpenStack infrastructure"""
        cis = []
        
        from openstack import connection
        
        # Get OpenStack credentials
        clouds = await self._get_openstack_inventory()
        
        for cloud_config in clouds:
            try:
                conn = connection.Connection(
                    auth_url=cloud_config['auth_url'],
                    project_name=cloud_config['project_name'],
                    username=cloud_config['username'],
                    password=cloud_config['password'],
                    region_name=cloud_config.get('region_name'),
                    user_domain_name=cloud_config.get('user_domain_name', 'Default'),
                    project_domain_name=cloud_config.get('project_domain_name', 'Default'),
                )
                
                # Discover compute instances
                for server in conn.compute.servers():
                    ci = ServerCI(
                        ci_type=CIType.VIRTUAL_MACHINE,
                        name=server.name,
                        display_name=server.name,
                        status=self._map_openstack_status(server.status),
                        environment=self._detect_environment_from_name(server.name),
                        provider="openstack",
                        external_id=server.id,
                        hostname=server.name,
                        ip_address=self._get_openstack_ip(server),
                        attributes={
                            'flavor': server.flavor['id'],
                            'image': server.image['id'],
                            'availability_zone': server.availability_zone,
                            'project_id': server.project_id,
                            'created_at': server.created_at,
                            'cloud_name': cloud_config['name'],
                        }
                    )
                    cis.append(ci)
                
            except Exception as e:
                logger.error(f"Failed OpenStack discovery for {cloud_config['name']}: {e}")
        
        return cis
    
    async def discover_bare_metal(self) -> List[ConfigurationItem]:
        """Discover bare metal servers from datacenter inventory"""
        cis = []
        
        # Get physical server inventory (from DCIM/asset management)
        servers = await self._get_bare_metal_inventory()
        
        for server in servers:
            ci = ServerCI(
                ci_type=CIType.SERVER,
                name=server['asset_tag'],
                display_name=server['name'],
                status=CIStatus(server.get('status', 'active')),
                environment=CIEnvironment(server.get('environment', 'production')),
                provider="on-premise",
                hostname=server.get('hostname'),
                ip_address=server.get('ip_address'),
                cpu_cores=server.get('cpu_cores'),
                cpu_model=server.get('cpu_model'),
                memory_gb=server.get('memory_gb'),
                disk_gb=server.get('disk_gb'),
                attributes={
                    'asset_tag': server['asset_tag'],
                    'serial_number': server.get('serial_number'),
                    'manufacturer': server.get('manufacturer'),
                    'model': server.get('model'),
                    'datacenter': server.get('datacenter'),
                    'rack': server.get('rack'),
                    'rack_position': server.get('rack_position'),
                    'power_supply_count': server.get('power_supply_count'),
                    'nic_count': server.get('nic_count'),
                    'warranty_expiry': server.get('warranty_expiry'),
                    'purchase_date': server.get('purchase_date'),
                    'bmc_ip': server.get('bmc_ip'),
                },
                tags={
                    'hardware_type': 'bare_metal',
                    'owner': server.get('owner'),
                    'cost_center': server.get('cost_center'),
                }
            )
            cis.append(ci)
        
        return cis
    
    def _get_tag_value(self, resource: Dict, key: str, default: str) -> str:
        """Extract tag value from AWS resource"""
        tags = resource.get('Tags', [])
        for tag in tags:
            if tag['Key'] == key:
                return tag['Value']
        return default
    
    def _extract_tags(self, aws_tags: List[Dict]) -> Dict[str, str]:
        """Convert AWS tags to dict"""
        return {tag['Key']: tag['Value'] for tag in aws_tags}
    
    def _detect_environment(self, resource: Dict) -> CIEnvironment:
        """Detect environment from tags"""
        env_tag = self._get_tag_value(resource, 'Environment', '').lower()
        
        if 'prod' in env_tag:
            return CIEnvironment.PRODUCTION
        elif 'stag' in env_tag:
            return CIEnvironment.STAGING
        elif 'dev' in env_tag:
            return CIEnvironment.DEVELOPMENT
        elif 'test' in env_tag or 'qa' in env_tag:
            return CIEnvironment.TEST
        else:
            return CIEnvironment.DEVELOPMENT
    
    def _map_ec2_status(self, state: str) -> CIStatus:
        """Map EC2 state to CI status"""
        mapping = {
            'running': CIStatus.ACTIVE,
            'stopped': CIStatus.INACTIVE,
            'terminated': CIStatus.RETIRED,
            'stopping': CIStatus.UNDER_MAINTENANCE,
            'pending': CIStatus.PLANNED,
        }
        return mapping.get(state, CIStatus.ACTIVE)
```

## 5. Relationship Discovery

### 5.1 Automatic Relationship Mapper

```python
# src/cmdb/relationships/mapper.py

class RelationshipMapper:
    """Automatically discover and map relationships between CIs"""
    
    def __init__(self, neo4j_driver):
        self.driver = neo4j_driver
        
    async def discover_relationships(self, cis: List[ConfigurationItem]) -> List[Relationship]:
        """Discover relationships between configuration items"""
        
        relationships = []
        
        # Build lookup indexes
        ci_by_id = {ci.ci_id: ci for ci in cis}
        ci_by_ip = {}
        ci_by_hostname = {}
        
        for ci in cis:
            if ci.ip_address:
                ci_by_ip[ci.ip_address] = ci
            if ci.hostname:
                ci_by_hostname[ci.hostname] = ci
        
        # Discover different types of relationships
        relationships.extend(await self._discover_hosting_relationships(cis, ci_by_id))
        relationships.extend(await self._discover_network_relationships(cis, ci_by_ip))
        relationships.extend(await self._discover_dependency_relationships(cis, ci_by_id))
        relationships.extend(await self._discover_k8s_relationships(cis, ci_by_id))
        
        return relationships
    
    async def _discover_hosting_relationships(
        self,
        cis: List[ConfigurationItem],
        ci_by_id: Dict
    ) -> List[Relationship]:
        """Discover hosting relationships (e.g., pod runs on node)"""
        relationships = []
        
        for ci in cis:
            # Kubernetes pods run on nodes
            if ci.ci_type == CIType.KUBERNETES_POD:
                node_hostname = ci.hostname
                # Find the node
                for potential_node in cis:
                    if (potential_node.ci_type == CIType.KUBERNETES_NODE and
                        potential_node.hostname == node_hostname):
                        relationships.append(Relationship(
                            source_ci_id=ci.ci_id,
                            target_ci_id=potential_node.ci_id,
                            relationship_type=RelationType.RUNS_ON,
                            weight=1.0
                        ))
                        break
            
            # Applications hosted on servers
            if ci.ci_type == CIType.APPLICATION:
                server_id = ci.attributes.get('server_id')
                if server_id and server_id in ci_by_id:
                    relationships.append(Relationship(
                        source_ci_id=ci.ci_id,
                        target_ci_id=server_id,
                        relationship_type=RelationType.HOSTED_ON,
                        weight=1.0
                    ))
        
        return relationships
    
    async def _discover_network_relationships(
        self,
        cis: List[ConfigurationItem],
        ci_by_ip: Dict
    ) -> List[Relationship]:
        """Discover network communication relationships"""
        relationships = []
        
        # Analyze network connections (would use netstat, tcpdump, flow logs, etc.)
        # For demonstration, using placeholder logic
        
        for ci in cis:
            # Check if CI has connection attributes
            connections = ci.attributes.get('network_connections', [])
            
            for conn in connections:
                remote_ip = conn.get('remote_ip')
                if remote_ip and remote_ip in ci_by_ip:
                    target_ci = ci_by_ip[remote_ip]
                    relationships.append(Relationship(
                        source_ci_id=ci.ci_id,
                        target_ci_id=target_ci.ci_id,
                        relationship_type=RelationType.COMMUNICATES_WITH,
                        weight=conn.get('connection_count', 1) / 100.0,
                        attributes={
                            'port': conn.get('port'),
                            'protocol': conn.get('protocol'),
                            'connection_count': conn.get('connection_count'),
                        }
                    ))
        
        return relationships
    
    async def _discover_dependency_relationships(
        self,
        cis: List[ConfigurationItem],
        ci_by_id: Dict
    ) -> List[Relationship]:
        """Discover dependency relationships"""
        relationships = []
        
        for ci in cis:
            # Services depend on databases
            if ci.ci_type in [CIType.SERVICE, CIType.MICROSERVICE]:
                db_dependencies = ci.attributes.get('database_dependencies', [])
                for db_id in db_dependencies:
                    if db_id in ci_by_id:
                        relationships.append(Relationship(
                            source_ci_id=ci.ci_id,
                            target_ci_id=db_id,
                            relationship_type=RelationType.DEPENDS_ON,
                            weight=1.0
                        ))
            
            # Applications use caches
            if ci.ci_type == CIType.APPLICATION:
                cache_id = ci.attributes.get('cache_id')
                if cache_id and cache_id in ci_by_id:
                    relationships.append(Relationship(
                        source_ci_id=ci.ci_id,
                        target_ci_id=cache_id,
                        relationship_type=RelationType.USES,
                        weight=0.8
                    ))
        
        return relationships
    
    async def _discover_k8s_relationships(
        self,
        cis: List[ConfigurationItem],
        ci_by_id: Dict
    ) -> List[Relationship]:
        """Discover Kubernetes-specific relationships"""
        relationships = []
        
        # Group CIs by namespace
        namespace_cis = {}
        for ci in cis:
            if ci.ci_type == CIType.KUBERNETES_POD:
                namespace = ci.attributes.get('namespace')
                if namespace:
                    if namespace not in namespace_cis:
                        namespace_cis[namespace] = []
                    namespace_cis[namespace].append(ci)
        
        # Pods in same namespace communicate
        for namespace, pods in namespace_cis.items():
            for i, pod1 in enumerate(pods):
                for pod2 in pods[i+1:]:
                    relationships.append(Relationship(
                        source_ci_id=pod1.ci_id,
                        target_ci_id=pod2.ci_id,
                        relationship_type=RelationType.PART_OF,
                        weight=0.5,
                        attributes={'namespace': namespace}
                    ))
        
        return relationships
```

## 6. CMDB Manager

### 6.1 CI Lifecycle Manager

```python
# src/cmdb/manager.py

from neo4j import GraphDatabase
import asyncpg
import redis.asyncio as redis

class CMDBManager:
    """Central CMDB management"""
    
    def __init__(
        self,
        neo4j_uri: str,
        neo4j_user: str,
        neo4j_password: str,
        postgres_dsn: str,
        redis_url: str
    ):
        self.neo4j_driver = GraphDatabase.driver(
            neo4j_uri,
            auth=(neo4j_user, neo4j_password)
        )
        self.postgres_dsn = postgres_dsn
        self.redis_client = None
        self.discovery_engine = MultiCloudDiscovery()
        self.relationship_mapper = RelationshipMapper(self.neo4j_driver)
        
    async def initialize(self):
        """Initialize connections"""
        self.db_pool = await asyncpg.create_pool(self.postgres_dsn)
        self.redis_client = await redis.from_url(self.redis_url)
        
    async def full_discovery(self) -> Dict[str, int]:
        """Perform full discovery"""
        logger.info("Starting full CMDB discovery...")
        
        # Discover all CIs
        cis = await self.discovery_engine.discover_all()
        logger.info(f"Discovered {len(cis)} configuration items")
        
        # Save CIs
        saved_count = 0
        for ci in cis:
            await self.save_ci(ci)
            saved_count += 1
        
        # Discover relationships
        relationships = await self.relationship_mapper.discover_relationships(cis)
        logger.info(f"Discovered {len(relationships)} relationships")
        
        # Save relationships
        for rel in relationships:
            await self.save_relationship(rel)
        
        return {
            "cis_discovered": len(cis),
            "cis_saved": saved_count,
            "relationships_discovered": len(relationships),
            "relationships_saved": len(relationships)
        }
    
    async def save_ci(self, ci: ConfigurationItem):
        """Save CI to database and graph"""
        
        # Check if CI exists
        existing = await self.get_ci(ci.ci_id)
        
        if existing:
            # Update existing CI
            ci.version = existing.version + 1
            ci.change_history.append({
                "version": ci.version,
                "timestamp": datetime.now().isoformat(),
                "changes": self._calculate_changes(existing, ci)
            })
        
        # Save to PostgreSQL (metadata)
        async with self.db_pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO configuration_items (
                    ci_id, ci_type, name, display_name, status, environment,
                    provider, region, external_id, attributes, tags, version,
                    created_at, updated_at, last_seen_at
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
                ON CONFLICT (ci_id) DO UPDATE SET
                    status = EXCLUDED.status,
                    attributes = EXCLUDED.attributes,
                    tags = EXCLUDED.tags,
                    version = EXCLUDED.version,
                    updated_at = EXCLUDED.updated_at,
                    last_seen_at = EXCLUDED.last_seen_at
            """,
                ci.ci_id, ci.ci_type.value, ci.name, ci.display_name,
                ci.status.value, ci.environment.value, ci.provider, ci.region,
                ci.external_id, json.dumps(ci.attributes), json.dumps(ci.tags),
                ci.version, ci.created_at, ci.updated_at, ci.last_seen_at
            )
        
        # Save to Neo4j (graph)
        with self.neo4j_driver.session() as session:
            session.run("""
                MERGE (ci:ConfigurationItem {ci_id: $ci_id})
                SET ci.ci_type = $ci_type,
                    ci.name = $name,
                    ci.status = $status,
                    ci.environment = $environment,
                    ci.provider = $provider,
                    ci.updated_at = datetime()
            """,
                ci_id=ci.ci_id,
                ci_type=ci.ci_type.value,
                name=ci.name,
                status=ci.status.value,
                environment=ci.environment.value,
                provider=ci.provider
            )
        
        # Cache in Redis
        await self.redis_client.setex(
            f"ci:{ci.ci_id}",
            3600,  # 1 hour TTL
            ci.json()
        )
    
    async def save_relationship(self, rel: Relationship):
        """Save relationship to graph"""
        
        with self.neo4j_driver.session() as session:
            session.run(f"""
                MATCH (source:ConfigurationItem {{ci_id: $source_id}})
                MATCH (target:ConfigurationItem {{ci_id: $target_id}})
                MERGE (source)-[r:{rel.relationship_type.value.upper()} {{
                    relationship_id: $rel_id
                }}]->(target)
                SET r.weight = $weight,
                    r.updated_at = datetime()
            """,
                source_id=rel.source_ci_id,
                target_id=rel.target_ci_id,
                rel_id=rel.relationship_id,
                weight=rel.weight
            )
    
    async def get_ci(self, ci_id: str) -> Optional[ConfigurationItem]:
        """Get CI by ID"""
        
        # Try cache first
        cached = await self.redis_client.get(f"ci:{ci_id}")
        if cached:
            return ConfigurationItem.parse_raw(cached)
        
        # Query database
        async with self.db_pool.acquire() as conn:
            row = await conn.fetchrow("""
                SELECT * FROM configuration_items WHERE ci_id = $1
            """, ci_id)
            
            if row:
                ci = ConfigurationItem(**dict(row))
                # Cache it
                await self.redis_client.setex(
                    f"ci:{ci_id}",
                    3600,
                    ci.json()
                )
                return ci
        
        return None
    
    async def query_cis(
        self,
        ci_type: Optional[CIType] = None,
        environment: Optional[CIEnvironment] = None,
        status: Optional[CIStatus] = None,
        provider: Optional[str] = None,
        tags: Optional[Dict[str, str]] = None,
        limit: int = 100
    ) -> List[ConfigurationItem]:
        """Query CIs with filters"""
        
        conditions = ["1=1"]
        params = []
        param_count = 1
        
        if ci_type:
            conditions.append(f"ci_type = ${param_count}")
            params.append(ci_type.value)
            param_count += 1
        
        if environment:
            conditions.append(f"environment = ${param_count}")
            params.append(environment.value)
            param_count += 1
        
        if status:
            conditions.append(f"status = ${param_count}")
            params.append(status.value)
            param_count += 1
        
        if provider:
            conditions.append(f"provider = ${param_count}")
            params.append(provider)
            param_count += 1
        
        query = f"""
            SELECT * FROM configuration_items
            WHERE {' AND '.join(conditions)}
            ORDER BY created_at DESC
            LIMIT ${param_count}
        """
        params.append(limit)
        
        async with self.db_pool.acquire() as conn:
            rows = await conn.fetch(query, *params)
            return [ConfigurationItem(**dict(row)) for row in rows]
    
    async def get_dependencies(self, ci_id: str, depth: int = 1) -> Dict:
        """Get dependency tree for a CI"""
        
        with self.neo4j_driver.session() as session:
            result = session.run("""
                MATCH path = (ci:ConfigurationItem {ci_id: $ci_id})
                             -[:DEPENDS_ON*1..$depth]->(dep)
                RETURN ci, collect(dep) as dependencies
            """, ci_id=ci_id, depth=depth)
            
            record = result.single()
            if record:
                return {
                    "ci": dict(record["ci"]),
                    "dependencies": [dict(dep) for dep in record["dependencies"]]
                }
        
        return {}
    
    async def get_impact_analysis(self, ci_id: str) -> Dict:
        """Analyze impact if CI fails"""
        
        with self.neo4j_driver.session() as session:
            # Find all CIs that depend on this CI
            result = session.run("""
                MATCH (ci:ConfigurationItem {ci_id: $ci_id})
                      <-[:DEPENDS_ON*1..3]-(dependent)
                RETURN ci, collect(DISTINCT dependent) as impacted_cis
            """, ci_id=ci_id)
            
            record = result.single()
            if record:
                impacted = [dict(dep) for dep in record["impacted_cis"]]
                
                # Calculate criticality
                critical_count = sum(
                    1 for ci in impacted 
                    if ci.get('environment') == 'production'
                )
                
                return {
                    "target_ci": dict(record["ci"]),
                    "total_impacted": len(impacted),
                    "critical_impacted": critical_count,
                    "impacted_cis": impacted,
                    "risk_level": "critical" if critical_count > 0 else "medium"
                }
        
        return {}
```

## 7. API Endpoints

```python
# src/cmdb/api.py

from fastapi import FastAPI, HTTPException, Query
from typing import Optional

app = FastAPI(title="CMDB Agent API")

@app.post("/api/v3/cmdb/discover")
async def trigger_discovery():
    """Trigger full discovery"""
    cmdb = get_cmdb_manager()
    result = await cmdb.full_discovery()
    return result

@app.get("/api/v3/cmdb/ci/{ci_id}")
async def get_ci(ci_id: str):
    """Get configuration item by ID"""
    cmdb = get_cmdb_manager()
    ci = await cmdb.get_ci(ci_id)
    if not ci:
        raise HTTPException(status_code=404, detail="CI not found")
    return ci

@app.get("/api/v3/cmdb/cis")
async def query_cis(
    ci_type: Optional[str] = None,
    environment: Optional[str] = None,
    status: Optional[str] = None,
    provider: Optional[str] = None,
    limit: int = Query(100, le=1000)
):
    """Query configuration items"""
    cmdb = get_cmdb_manager()
    
    cis = await cmdb.query_cis(
        ci_type=CIType(ci_type) if ci_type else None,
        environment=CIEnvironment(environment) if environment else None,
        status=CIStatus(status) if status else None,
        provider=provider,
        limit=limit
    )
    
    return {"total": len(cis), "items": cis}

@app.get("/api/v3/cmdb/ci/{ci_id}/dependencies")
async def get_dependencies(ci_id: str, depth: int = Query(1, ge=1, le=5)):
    """Get CI dependencies"""
    cmdb = get_cmdb_manager()
    deps = await cmdb.get_dependencies(ci_id, depth)
    return deps

@app.get("/api/v3/cmdb/ci/{ci_id}/impact")
async def get_impact_analysis(ci_id: str):
    """Get impact analysis if CI fails"""
    cmdb = get_cmdb_manager()
    impact = await cmdb.get_impact_analysis(ci_id)
    return impact

@app.get("/api/v3/cmdb/stats")
async def get_stats():
    """Get CMDB statistics"""
    cmdb = get_cmdb_manager()
    
    stats = {
        "total_cis": await cmdb.count_cis(),
        "by_type": await cmdb.count_by_type(),
        "by_environment": await cmdb.count_by_environment(),
        "by_provider": await cmdb.count_by_provider(),
        "by_status": await cmdb.count_by_status(),
    }
    
    return stats
```

---

**Document Version**: 1.0  
**Last Updated**: December 5, 2025  
**Status**: Ready for Implementation
