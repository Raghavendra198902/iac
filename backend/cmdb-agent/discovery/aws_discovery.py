"""
AWS Infrastructure Discovery
Discovers EC2, RDS, EBS, VPC, and other AWS resources
"""

import boto3
from typing import List, Dict, Optional
from datetime import datetime
import time
from botocore.exceptions import ClientError, BotoCoreError

from ..models.infrastructure import (
    Provider, ResourceType, ResourceStatus,
    ComputeInstance, StorageVolume, DatabaseInstance,
    NetworkInterface, LoadBalancer, Relationship,
    DiscoveryResult
)


class AWSDiscovery:
    """AWS infrastructure discovery client"""
    
    def __init__(self, access_key: Optional[str] = None, 
                 secret_key: Optional[str] = None,
                 region: str = 'us-east-1',
                 session_token: Optional[str] = None):
        """
        Initialize AWS discovery client
        
        Args:
            access_key: AWS access key ID
            secret_key: AWS secret access key
            region: AWS region
            session_token: Temporary session token (for assumed roles)
        """
        self.region = region
        
        if access_key and secret_key:
            self.session = boto3.Session(
                aws_access_key_id=access_key,
                aws_secret_access_key=secret_key,
                aws_session_token=session_token,
                region_name=region
            )
        else:
            # Use IAM role or environment credentials
            self.session = boto3.Session(region_name=region)
        
        self.ec2_client = self.session.client('ec2')
        self.rds_client = self.session.client('rds')
        self.elb_client = self.session.client('elbv2')
        self.ecs_client = self.session.client('ecs')
    
    async def discover_all(self) -> DiscoveryResult:
        """
        Discover all AWS resources in the region
        
        Returns:
            DiscoveryResult with all discovered resources
        """
        start_time = time.time()
        resources = []
        relationships = []
        errors = []
        
        try:
            # Discover EC2 instances
            ec2_resources, ec2_rels, ec2_errors = await self._discover_ec2_instances()
            resources.extend(ec2_resources)
            relationships.extend(ec2_rels)
            errors.extend(ec2_errors)
            
            # Discover EBS volumes
            ebs_resources, ebs_rels, ebs_errors = await self._discover_ebs_volumes()
            resources.extend(ebs_resources)
            relationships.extend(ebs_rels)
            errors.extend(ebs_errors)
            
            # Discover RDS instances
            rds_resources, rds_rels, rds_errors = await self._discover_rds_instances()
            resources.extend(rds_resources)
            relationships.extend(rds_rels)
            errors.extend(rds_errors)
            
            # Discover Load Balancers
            elb_resources, elb_rels, elb_errors = await self._discover_load_balancers()
            resources.extend(elb_resources)
            relationships.extend(elb_rels)
            errors.extend(elb_errors)
            
            # Discover ECS Clusters
            ecs_resources, ecs_rels, ecs_errors = await self._discover_ecs_clusters()
            resources.extend(ecs_resources)
            relationships.extend(ecs_rels)
            errors.extend(ecs_errors)
            
        except Exception as e:
            errors.append(f"Discovery failed: {str(e)}")
        
        discovery_time = time.time() - start_time
        
        return DiscoveryResult(
            provider=Provider.AWS,
            region=self.region,
            resources_discovered=len(resources),
            resources=resources,
            relationships=relationships,
            errors=errors,
            discovery_time_seconds=discovery_time
        )
    
    async def _discover_ec2_instances(self) -> tuple:
        """Discover EC2 instances"""
        resources = []
        relationships = []
        errors = []
        
        try:
            response = self.ec2_client.describe_instances()
            
            for reservation in response.get('Reservations', []):
                for instance in reservation.get('Instances', []):
                    try:
                        # Parse instance data
                        instance_id = instance['InstanceId']
                        instance_type = instance['InstanceType']
                        state = instance['State']['Name']
                        
                        # Map AWS state to our status
                        status_map = {
                            'running': ResourceStatus.RUNNING,
                            'stopped': ResourceStatus.STOPPED,
                            'pending': ResourceStatus.PENDING,
                            'terminated': ResourceStatus.TERMINATED,
                            'stopping': ResourceStatus.STOPPED,
                            'shutting-down': ResourceStatus.STOPPED
                        }
                        status = status_map.get(state, ResourceStatus.UNKNOWN)
                        
                        # Get tags
                        tags = {}
                        for tag in instance.get('Tags', []):
                            tags[tag['Key']] = tag['Value']
                        
                        # Get instance name from tags
                        name = tags.get('Name', instance_id)
                        
                        # Get security groups
                        security_groups = [sg['GroupId'] for sg in instance.get('SecurityGroups', [])]
                        
                        # Parse instance type for CPU/memory (simplified)
                        cpu_cores, memory_gb = self._parse_instance_type(instance_type)
                        
                        compute = ComputeInstance(
                            id=instance_id,
                            name=name,
                            provider=Provider.AWS,
                            resource_type=ResourceType.COMPUTE,
                            status=status,
                            region=self.region,
                            availability_zone=instance.get('Placement', {}).get('AvailabilityZone'),
                            tags=tags,
                            instance_type=instance_type,
                            cpu_cores=cpu_cores,
                            memory_gb=memory_gb,
                            disk_gb=0.0,  # From volumes
                            public_ip=instance.get('PublicIpAddress'),
                            private_ip=instance.get('PrivateIpAddress'),
                            vpc_id=instance.get('VpcId'),
                            subnet_id=instance.get('SubnetId'),
                            security_groups=security_groups,
                            operating_system=instance.get('Platform', 'Linux'),
                            metadata={
                                'image_id': instance.get('ImageId'),
                                'key_name': instance.get('KeyName'),
                                'launch_time': str(instance.get('LaunchTime')),
                                'instance_lifecycle': instance.get('InstanceLifecycle', 'on-demand')
                            }
                        )
                        
                        resources.append(compute)
                        
                        # Create relationships to VPC and Subnet
                        if instance.get('VpcId'):
                            relationships.append(Relationship(
                                source_id=instance_id,
                                target_id=instance['VpcId'],
                                relationship_type='BELONGS_TO_VPC',
                                properties={'subnet_id': instance.get('SubnetId')}
                            ))
                        
                        # Create relationships to security groups
                        for sg_id in security_groups:
                            relationships.append(Relationship(
                                source_id=instance_id,
                                target_id=sg_id,
                                relationship_type='PROTECTED_BY',
                                properties={'type': 'security_group'}
                            ))
                        
                    except Exception as e:
                        errors.append(f"Error parsing EC2 instance {instance.get('InstanceId')}: {str(e)}")
                        
        except (ClientError, BotoCoreError) as e:
            errors.append(f"Error discovering EC2 instances: {str(e)}")
        
        return resources, relationships, errors
    
    async def _discover_ebs_volumes(self) -> tuple:
        """Discover EBS volumes"""
        resources = []
        relationships = []
        errors = []
        
        try:
            response = self.ec2_client.describe_volumes()
            
            for volume in response.get('Volumes', []):
                try:
                    volume_id = volume['VolumeId']
                    state = volume['State']
                    
                    status_map = {
                        'in-use': ResourceStatus.RUNNING,
                        'available': ResourceStatus.STOPPED,
                        'creating': ResourceStatus.PENDING,
                        'deleting': ResourceStatus.TERMINATED,
                        'deleted': ResourceStatus.TERMINATED,
                        'error': ResourceStatus.ERROR
                    }
                    status = status_map.get(state, ResourceStatus.UNKNOWN)
                    
                    # Get tags
                    tags = {}
                    for tag in volume.get('Tags', []):
                        tags[tag['Key']] = tag['Value']
                    name = tags.get('Name', volume_id)
                    
                    # Get attachment info
                    attachments = volume.get('Attachments', [])
                    attached_to = attachments[0]['InstanceId'] if attachments else None
                    mount_point = attachments[0]['Device'] if attachments else None
                    
                    storage = StorageVolume(
                        id=volume_id,
                        name=name,
                        provider=Provider.AWS,
                        resource_type=ResourceType.STORAGE,
                        status=status,
                        region=self.region,
                        availability_zone=volume['AvailabilityZone'],
                        tags=tags,
                        size_gb=float(volume['Size']),
                        volume_type=volume['VolumeType'],
                        iops=volume.get('Iops'),
                        throughput_mbps=volume.get('Throughput'),
                        encrypted=volume.get('Encrypted', False),
                        attached_to=attached_to,
                        mount_point=mount_point,
                        metadata={
                            'snapshot_id': volume.get('SnapshotId'),
                            'create_time': str(volume['CreateTime'])
                        }
                    )
                    
                    resources.append(storage)
                    
                    # Create relationship to attached instance
                    if attached_to:
                        relationships.append(Relationship(
                            source_id=volume_id,
                            target_id=attached_to,
                            relationship_type='ATTACHED_TO',
                            properties={'device': mount_point, 'state': attachments[0]['State']}
                        ))
                    
                except Exception as e:
                    errors.append(f"Error parsing EBS volume {volume.get('VolumeId')}: {str(e)}")
        
        except (ClientError, BotoCoreError) as e:
            errors.append(f"Error discovering EBS volumes: {str(e)}")
        
        return resources, relationships, errors
    
    async def _discover_rds_instances(self) -> tuple:
        """Discover RDS database instances"""
        resources = []
        relationships = []
        errors = []
        
        try:
            response = self.rds_client.describe_db_instances()
            
            for db in response.get('DBInstances', []):
                try:
                    db_id = db['DBInstanceIdentifier']
                    status = db['DBInstanceStatus']
                    
                    status_map = {
                        'available': ResourceStatus.RUNNING,
                        'stopped': ResourceStatus.STOPPED,
                        'creating': ResourceStatus.PENDING,
                        'deleting': ResourceStatus.TERMINATED,
                        'failed': ResourceStatus.ERROR
                    }
                    resource_status = status_map.get(status, ResourceStatus.UNKNOWN)
                    
                    # Get endpoint
                    endpoint = None
                    port = db.get('Endpoint', {}).get('Port', 3306)
                    if db.get('Endpoint'):
                        endpoint = f"{db['Endpoint']['Address']}:{port}"
                    
                    database = DatabaseInstance(
                        id=db['DbiResourceId'],
                        name=db_id,
                        provider=Provider.AWS,
                        resource_type=ResourceType.DATABASE,
                        status=resource_status,
                        region=self.region,
                        availability_zone=db.get('AvailabilityZone'),
                        tags={},
                        engine=db['Engine'],
                        engine_version=db['EngineVersion'],
                        instance_class=db['DBInstanceClass'],
                        allocated_storage_gb=float(db['AllocatedStorage']),
                        storage_type=db.get('StorageType', 'gp2'),
                        multi_az=db.get('MultiAZ', False),
                        endpoint=endpoint,
                        port=port,
                        database_names=[db.get('DBName')] if db.get('DBName') else [],
                        backup_retention_days=db.get('BackupRetentionPeriod'),
                        encrypted=db.get('StorageEncrypted', False),
                        metadata={
                            'master_username': db.get('MasterUsername'),
                            'publicly_accessible': db.get('PubliclyAccessible', False),
                            'instance_create_time': str(db.get('InstanceCreateTime'))
                        }
                    )
                    
                    resources.append(database)
                    
                except Exception as e:
                    errors.append(f"Error parsing RDS instance {db.get('DBInstanceIdentifier')}: {str(e)}")
        
        except (ClientError, BotoCoreError) as e:
            errors.append(f"Error discovering RDS instances: {str(e)}")
        
        return resources, relationships, errors
    
    async def _discover_load_balancers(self) -> tuple:
        """Discover Application and Network Load Balancers"""
        resources = []
        relationships = []
        errors = []
        
        try:
            response = self.elb_client.describe_load_balancers()
            
            for lb in response.get('LoadBalancers', []):
                try:
                    lb_arn = lb['LoadBalancerArn']
                    lb_name = lb['LoadBalancerName']
                    
                    status_map = {
                        'active': ResourceStatus.RUNNING,
                        'provisioning': ResourceStatus.PENDING,
                        'failed': ResourceStatus.ERROR
                    }
                    status = status_map.get(lb['State']['Code'], ResourceStatus.UNKNOWN)
                    
                    load_balancer = LoadBalancer(
                        id=lb_arn,
                        name=lb_name,
                        provider=Provider.AWS,
                        resource_type=ResourceType.LOAD_BALANCER,
                        status=status,
                        region=self.region,
                        tags={},
                        load_balancer_type=lb['Type'],
                        scheme=lb['Scheme'],
                        dns_name=lb['DNSName'],
                        availability_zones=[az['ZoneName'] for az in lb.get('AvailabilityZones', [])],
                        vpc_id=lb.get('VpcId'),
                        metadata={
                            'created_time': str(lb.get('CreatedTime')),
                            'ip_address_type': lb.get('IpAddressType'),
                            'security_groups': lb.get('SecurityGroups', [])
                        }
                    )
                    
                    resources.append(load_balancer)
                    
                except Exception as e:
                    errors.append(f"Error parsing Load Balancer {lb.get('LoadBalancerName')}: {str(e)}")
        
        except (ClientError, BotoCoreError) as e:
            errors.append(f"Error discovering Load Balancers: {str(e)}")
        
        return resources, relationships, errors
    
    async def _discover_ecs_clusters(self) -> tuple:
        """Discover ECS clusters"""
        resources = []
        relationships = []
        errors = []
        
        try:
            response = self.ecs_client.list_clusters()
            cluster_arns = response.get('clusterArns', [])
            
            if cluster_arns:
                clusters_detail = self.ecs_client.describe_clusters(clusters=cluster_arns)
                
                for cluster in clusters_detail.get('clusters', []):
                    try:
                        cluster_arn = cluster['clusterArn']
                        cluster_name = cluster['clusterName']
                        
                        status_map = {
                            'ACTIVE': ResourceStatus.RUNNING,
                            'PROVISIONING': ResourceStatus.PENDING,
                            'DEPROVISIONING': ResourceStatus.TERMINATED,
                            'FAILED': ResourceStatus.ERROR,
                            'INACTIVE': ResourceStatus.STOPPED
                        }
                        status = status_map.get(cluster['status'], ResourceStatus.UNKNOWN)
                        
                        # Note: Node count and resources would need additional API calls
                        container_cluster = ContainerCluster(
                            id=cluster_arn,
                            name=cluster_name,
                            provider=Provider.AWS,
                            resource_type=ResourceType.CONTAINER,
                            status=status,
                            region=self.region,
                            tags={},
                            orchestrator='ecs',
                            version='',  # ECS doesn't have versions
                            node_count=cluster.get('registeredContainerInstancesCount', 0),
                            total_cpu_cores=0,  # Would need to query tasks/services
                            total_memory_gb=0.0,
                            metadata={
                                'running_tasks_count': cluster.get('runningTasksCount', 0),
                                'pending_tasks_count': cluster.get('pendingTasksCount', 0),
                                'active_services_count': cluster.get('activeServicesCount', 0)
                            }
                        )
                        
                        resources.append(container_cluster)
                        
                    except Exception as e:
                        errors.append(f"Error parsing ECS cluster {cluster.get('clusterName')}: {str(e)}")
        
        except (ClientError, BotoCoreError) as e:
            errors.append(f"Error discovering ECS clusters: {str(e)}")
        
        return resources, relationships, errors
    
    def _parse_instance_type(self, instance_type: str) -> tuple:
        """
        Parse AWS instance type to estimate CPU and memory
        Simple heuristic - in production use AWS Price List API
        """
        # Instance type format: family.size (e.g., t3.medium)
        try:
            family, size = instance_type.split('.')
            
            # Simplified mapping (actual values vary)
            size_specs = {
                'nano': (1, 0.5),
                'micro': (1, 1),
                'small': (1, 2),
                'medium': (2, 4),
                'large': (2, 8),
                'xlarge': (4, 16),
                '2xlarge': (8, 32),
                '4xlarge': (16, 64),
                '8xlarge': (32, 128),
                '12xlarge': (48, 192),
                '16xlarge': (64, 256),
                '24xlarge': (96, 384)
            }
            
            return size_specs.get(size, (2, 4))  # Default to medium
        except:
            return (2, 4)  # Default fallback
