"""
CMDB Infrastructure Models
Data models for infrastructure components and relationships
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum


class Provider(str, Enum):
    """Cloud and on-premise providers"""
    AWS = "aws"
    AZURE = "azure"
    GCP = "gcp"
    DIGITALOCEAN = "digitalocean"
    ALIBABA = "alibaba"
    IBM = "ibm"
    ORACLE = "oracle"
    VMWARE = "vmware"
    KUBERNETES = "kubernetes"
    ONPREMISE = "onpremise"
    EDGE = "edge"


class ResourceType(str, Enum):
    """Infrastructure resource types"""
    COMPUTE = "compute"
    STORAGE = "storage"
    NETWORK = "network"
    DATABASE = "database"
    CONTAINER = "container"
    SERVERLESS = "serverless"
    LOAD_BALANCER = "load_balancer"
    CDN = "cdn"
    DNS = "dns"
    SECURITY_GROUP = "security_group"
    VPN = "vpn"
    FIREWALL = "firewall"


class ResourceStatus(str, Enum):
    """Resource operational status"""
    RUNNING = "running"
    STOPPED = "stopped"
    PENDING = "pending"
    TERMINATED = "terminated"
    ERROR = "error"
    UNKNOWN = "unknown"


class InfrastructureResource(BaseModel):
    """Base infrastructure resource"""
    id: str = Field(..., description="Unique resource identifier")
    name: str = Field(..., description="Resource name")
    provider: Provider
    resource_type: ResourceType
    status: ResourceStatus
    region: Optional[str] = None
    availability_zone: Optional[str] = None
    tags: Dict[str, str] = Field(default_factory=dict)
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_discovered: datetime = Field(default_factory=datetime.utcnow)


class ComputeInstance(InfrastructureResource):
    """Compute instance (VM, EC2, etc.)"""
    instance_type: str
    cpu_cores: int
    memory_gb: float
    disk_gb: float
    public_ip: Optional[str] = None
    private_ip: Optional[str] = None
    vpc_id: Optional[str] = None
    subnet_id: Optional[str] = None
    security_groups: List[str] = Field(default_factory=list)
    operating_system: Optional[str] = None
    kernel_version: Optional[str] = None
    uptime_seconds: Optional[int] = None


class StorageVolume(InfrastructureResource):
    """Storage volume (EBS, Azure Disk, etc.)"""
    size_gb: float
    volume_type: str
    iops: Optional[int] = None
    throughput_mbps: Optional[int] = None
    encrypted: bool = False
    attached_to: Optional[str] = None
    mount_point: Optional[str] = None
    filesystem_type: Optional[str] = None
    used_gb: Optional[float] = None
    available_gb: Optional[float] = None


class NetworkInterface(InfrastructureResource):
    """Network interface"""
    mac_address: Optional[str] = None
    private_ip: str
    public_ip: Optional[str] = None
    ipv6_address: Optional[str] = None
    subnet_id: str
    vpc_id: str
    security_groups: List[str] = Field(default_factory=list)
    bandwidth_gbps: Optional[float] = None
    attached_to: Optional[str] = None


class DatabaseInstance(InfrastructureResource):
    """Database instance"""
    engine: str
    engine_version: str
    instance_class: str
    allocated_storage_gb: float
    storage_type: str
    multi_az: bool = False
    endpoint: Optional[str] = None
    port: int
    database_names: List[str] = Field(default_factory=list)
    backup_retention_days: Optional[int] = None
    encrypted: bool = False


class ContainerCluster(InfrastructureResource):
    """Container orchestration cluster (ECS, AKS, GKE, K8s)"""
    orchestrator: str  # kubernetes, ecs, aks, gke, openshift
    version: str
    node_count: int
    total_cpu_cores: int
    total_memory_gb: float
    endpoint: Optional[str] = None
    namespaces: List[str] = Field(default_factory=list)


class LoadBalancer(InfrastructureResource):
    """Load balancer"""
    load_balancer_type: str  # application, network, classic
    scheme: str  # internet-facing, internal
    dns_name: str
    listeners: List[Dict[str, Any]] = Field(default_factory=list)
    target_groups: List[str] = Field(default_factory=list)
    availability_zones: List[str] = Field(default_factory=list)
    vpc_id: Optional[str] = None


class OnPremiseServer(InfrastructureResource):
    """On-premise physical or virtual server"""
    hostname: str
    fqdn: Optional[str] = None
    ip_addresses: List[str] = Field(default_factory=list)
    mac_addresses: List[str] = Field(default_factory=list)
    cpu_model: Optional[str] = None
    cpu_cores: int
    cpu_threads: int
    memory_gb: float
    disks: List[Dict[str, Any]] = Field(default_factory=list)
    network_interfaces: List[Dict[str, Any]] = Field(default_factory=list)
    operating_system: str
    os_version: str
    kernel_version: str
    architecture: str  # x86_64, arm64
    hypervisor: Optional[str] = None  # vmware, kvm, hyper-v, xen
    datacenter: Optional[str] = None
    rack_location: Optional[str] = None
    serial_number: Optional[str] = None
    bios_version: Optional[str] = None
    installed_packages: List[str] = Field(default_factory=list)
    running_services: List[str] = Field(default_factory=list)


class Relationship(BaseModel):
    """Resource relationship for graph database"""
    source_id: str
    target_id: str
    relationship_type: str
    properties: Dict[str, Any] = Field(default_factory=dict)
    discovered_at: datetime = Field(default_factory=datetime.utcnow)


class DiscoveryResult(BaseModel):
    """Discovery operation result"""
    provider: Provider
    region: Optional[str] = None
    resources_discovered: int
    resources: List[InfrastructureResource]
    relationships: List[Relationship]
    errors: List[str] = Field(default_factory=list)
    discovery_time_seconds: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
