"""
Neo4j Graph Database Client
Stores infrastructure resources and relationships in graph database
"""

from neo4j import GraphDatabase, Driver
from typing import List, Dict, Optional, Any
import logging
from datetime import datetime

from ..models.infrastructure import (
    InfrastructureResource, Relationship,
    Provider, ResourceType, ResourceStatus
)

logger = logging.getLogger(__name__)


class Neo4jClient:
    """Neo4j client for CMDB graph database operations"""
    
    def __init__(self, uri: str = "bolt://localhost:7687",
                 username: str = "neo4j",
                 password: str = "neo4j123"):
        """
        Initialize Neo4j connection
        
        Args:
            uri: Neo4j connection URI
            username: Neo4j username
            password: Neo4j password
        """
        self.driver: Driver = GraphDatabase.driver(uri, auth=(username, password))
        logger.info(f"Connected to Neo4j at {uri}")
    
    def close(self):
        """Close Neo4j connection"""
        self.driver.close()
        logger.info("Neo4j connection closed")
    
    def verify_connectivity(self) -> bool:
        """Verify Neo4j connection"""
        try:
            with self.driver.session() as session:
                result = session.run("RETURN 1 AS num")
                return result.single()[0] == 1
        except Exception as e:
            logger.error(f"Neo4j connectivity check failed: {e}")
            return False
    
    def create_indexes(self):
        """Create Neo4j indexes for performance"""
        with self.driver.session() as session:
            indexes = [
                "CREATE INDEX resource_id IF NOT EXISTS FOR (r:Resource) ON (r.id)",
                "CREATE INDEX resource_provider IF NOT EXISTS FOR (r:Resource) ON (r.provider)",
                "CREATE INDEX resource_type IF NOT EXISTS FOR (r:Resource) ON (r.resource_type)",
                "CREATE INDEX resource_status IF NOT EXISTS FOR (r:Resource) ON (r.status)",
                "CREATE INDEX resource_region IF NOT EXISTS FOR (r:Resource) ON (r.region)",
                "CREATE INDEX resource_name IF NOT EXISTS FOR (r:Resource) ON (r.name)"
            ]
            
            for index_query in indexes:
                try:
                    session.run(index_query)
                    logger.info(f"Created index: {index_query}")
                except Exception as e:
                    logger.warning(f"Index creation failed (may already exist): {e}")
    
    def store_resource(self, resource: InfrastructureResource) -> bool:
        """
        Store or update a resource in Neo4j
        
        Args:
            resource: Infrastructure resource to store
            
        Returns:
            bool: Success status
        """
        with self.driver.session() as session:
            try:
                # Convert resource to dict
                resource_dict = resource.dict()
                
                # Convert datetime objects to strings
                for key, value in resource_dict.items():
                    if isinstance(value, datetime):
                        resource_dict[key] = value.isoformat()
                
                # Create or merge resource node
                query = """
                MERGE (r:Resource {id: $id})
                SET r.name = $name,
                    r.provider = $provider,
                    r.resource_type = $resource_type,
                    r.status = $status,
                    r.region = $region,
                    r.availability_zone = $availability_zone,
                    r.tags = $tags,
                    r.metadata = $metadata,
                    r.created_at = $created_at,
                    r.last_discovered = $last_discovered,
                    r.properties = $properties
                RETURN r
                """
                
                # Add type-specific label
                type_label = resource.resource_type.value.upper()
                query = query.replace("Resource", f"Resource:{type_label}")
                
                params = {
                    'id': resource.id,
                    'name': resource.name,
                    'provider': resource.provider.value,
                    'resource_type': resource.resource_type.value,
                    'status': resource.status.value,
                    'region': resource.region,
                    'availability_zone': resource.availability_zone,
                    'tags': resource.tags,
                    'metadata': resource.metadata,
                    'created_at': resource.created_at.isoformat(),
                    'last_discovered': resource.last_discovered.isoformat(),
                    'properties': resource_dict
                }
                
                session.run(query, params)
                return True
                
            except Exception as e:
                logger.error(f"Failed to store resource {resource.id}: {e}")
                return False
    
    def store_resources_batch(self, resources: List[InfrastructureResource]) -> Dict[str, int]:
        """
        Store multiple resources in batch
        
        Args:
            resources: List of resources to store
            
        Returns:
            dict: Statistics (success, failed counts)
        """
        success_count = 0
        failed_count = 0
        
        for resource in resources:
            if self.store_resource(resource):
                success_count += 1
            else:
                failed_count += 1
        
        logger.info(f"Batch store completed: {success_count} success, {failed_count} failed")
        return {'success': success_count, 'failed': failed_count}
    
    def create_relationship(self, relationship: Relationship) -> bool:
        """
        Create a relationship between two resources
        
        Args:
            relationship: Relationship to create
            
        Returns:
            bool: Success status
        """
        with self.driver.session() as session:
            try:
                # Convert properties
                props = relationship.properties.copy()
                props['discovered_at'] = relationship.discovered_at.isoformat()
                
                query = f"""
                MATCH (source:Resource {{id: $source_id}})
                MATCH (target:Resource {{id: $target_id}})
                MERGE (source)-[r:{relationship.relationship_type}]->(target)
                SET r += $properties
                RETURN r
                """
                
                params = {
                    'source_id': relationship.source_id,
                    'target_id': relationship.target_id,
                    'properties': props
                }
                
                session.run(query, params)
                return True
                
            except Exception as e:
                logger.error(f"Failed to create relationship: {e}")
                return False
    
    def create_relationships_batch(self, relationships: List[Relationship]) -> Dict[str, int]:
        """
        Create multiple relationships in batch
        
        Args:
            relationships: List of relationships to create
            
        Returns:
            dict: Statistics (success, failed counts)
        """
        success_count = 0
        failed_count = 0
        
        for relationship in relationships:
            if self.create_relationship(relationship):
                success_count += 1
            else:
                failed_count += 1
        
        logger.info(f"Batch relationships created: {success_count} success, {failed_count} failed")
        return {'success': success_count, 'failed': failed_count}
    
    def get_resource(self, resource_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a resource by ID
        
        Args:
            resource_id: Resource ID
            
        Returns:
            dict: Resource properties or None
        """
        with self.driver.session() as session:
            try:
                query = "MATCH (r:Resource {id: $id}) RETURN r"
                result = session.run(query, {'id': resource_id})
                record = result.single()
                
                if record:
                    return dict(record['r'])
                return None
                
            except Exception as e:
                logger.error(f"Failed to get resource {resource_id}: {e}")
                return None
    
    def get_resource_relationships(self, resource_id: str, 
                                   direction: str = 'both') -> List[Dict[str, Any]]:
        """
        Get all relationships for a resource
        
        Args:
            resource_id: Resource ID
            direction: 'outgoing', 'incoming', or 'both'
            
        Returns:
            list: List of relationships with connected resources
        """
        with self.driver.session() as session:
            try:
                if direction == 'outgoing':
                    query = """
                    MATCH (source:Resource {id: $id})-[r]->(target:Resource)
                    RETURN type(r) as rel_type, properties(r) as rel_props, 
                           target.id as target_id, target.name as target_name,
                           target.resource_type as target_type
                    """
                elif direction == 'incoming':
                    query = """
                    MATCH (source:Resource)-[r]->(target:Resource {id: $id})
                    RETURN type(r) as rel_type, properties(r) as rel_props,
                           source.id as source_id, source.name as source_name,
                           source.resource_type as source_type
                    """
                else:  # both
                    query = """
                    MATCH (r1:Resource {id: $id})-[rel]-(r2:Resource)
                    RETURN type(rel) as rel_type, properties(rel) as rel_props,
                           r2.id as related_id, r2.name as related_name,
                           r2.resource_type as related_type,
                           CASE WHEN startNode(rel).id = $id THEN 'outgoing' ELSE 'incoming' END as direction
                    """
                
                result = session.run(query, {'id': resource_id})
                return [dict(record) for record in result]
                
            except Exception as e:
                logger.error(f"Failed to get relationships for {resource_id}: {e}")
                return []
    
    def query_resources(self, filters: Dict[str, Any], limit: int = 100) -> List[Dict[str, Any]]:
        """
        Query resources with filters
        
        Args:
            filters: Query filters (provider, resource_type, status, region, etc.)
            limit: Maximum results to return
            
        Returns:
            list: List of matching resources
        """
        with self.driver.session() as session:
            try:
                # Build WHERE clause
                where_conditions = []
                params = {'limit': limit}
                
                if 'provider' in filters:
                    where_conditions.append("r.provider = $provider")
                    params['provider'] = filters['provider']
                
                if 'resource_type' in filters:
                    where_conditions.append("r.resource_type = $resource_type")
                    params['resource_type'] = filters['resource_type']
                
                if 'status' in filters:
                    where_conditions.append("r.status = $status")
                    params['status'] = filters['status']
                
                if 'region' in filters:
                    where_conditions.append("r.region = $region")
                    params['region'] = filters['region']
                
                where_clause = " AND ".join(where_conditions) if where_conditions else "1=1"
                
                query = f"""
                MATCH (r:Resource)
                WHERE {where_clause}
                RETURN r
                ORDER BY r.last_discovered DESC
                LIMIT $limit
                """
                
                result = session.run(query, params)
                return [dict(record['r']) for record in result]
                
            except Exception as e:
                logger.error(f"Failed to query resources: {e}")
                return []
    
    def get_infrastructure_graph(self, root_id: str, depth: int = 3) -> Dict[str, Any]:
        """
        Get infrastructure graph starting from a root resource
        
        Args:
            root_id: Root resource ID
            depth: Maximum depth to traverse
            
        Returns:
            dict: Graph with nodes and relationships
        """
        with self.driver.session() as session:
            try:
                query = f"""
                MATCH path = (root:Resource {{id: $root_id}})-[*1..{depth}]-(connected:Resource)
                WITH root, connected, relationships(path) as rels
                RETURN 
                    collect(DISTINCT root) + collect(DISTINCT connected) as nodes,
                    collect(DISTINCT rels) as relationships
                """
                
                result = session.run(query, {'root_id': root_id})
                record = result.single()
                
                if record:
                    nodes = [dict(node) for node in record['nodes']]
                    rels = []
                    for rel_list in record['relationships']:
                        for rel in rel_list:
                            rels.append({
                                'type': rel.type,
                                'properties': dict(rel),
                                'start': rel.start_node.id,
                                'end': rel.end_node.id
                            })
                    
                    return {'nodes': nodes, 'relationships': rels}
                
                return {'nodes': [], 'relationships': []}
                
            except Exception as e:
                logger.error(f"Failed to get infrastructure graph: {e}")
                return {'nodes': [], 'relationships': []}
    
    def execute_cypher(self, query: str, params: Dict[str, Any] = None) -> List[Dict[str, Any]]:
        """
        Execute raw Cypher query
        
        Args:
            query: Cypher query string
            params: Query parameters
            
        Returns:
            list: Query results
        """
        with self.driver.session() as session:
            try:
                result = session.run(query, params or {})
                return [dict(record) for record in result]
            except Exception as e:
                logger.error(f"Failed to execute Cypher query: {e}")
                raise
    
    def get_statistics(self) -> Dict[str, Any]:
        """
        Get CMDB statistics
        
        Returns:
            dict: Statistics about stored resources
        """
        with self.driver.session() as session:
            try:
                stats = {}
                
                # Total resources
                result = session.run("MATCH (r:Resource) RETURN count(r) as total")
                stats['total_resources'] = result.single()['total']
                
                # Resources by provider
                result = session.run("""
                    MATCH (r:Resource)
                    RETURN r.provider as provider, count(r) as count
                    ORDER BY count DESC
                """)
                stats['by_provider'] = {record['provider']: record['count'] for record in result}
                
                # Resources by type
                result = session.run("""
                    MATCH (r:Resource)
                    RETURN r.resource_type as type, count(r) as count
                    ORDER BY count DESC
                """)
                stats['by_type'] = {record['type']: record['count'] for record in result}
                
                # Resources by status
                result = session.run("""
                    MATCH (r:Resource)
                    RETURN r.status as status, count(r) as count
                    ORDER BY count DESC
                """)
                stats['by_status'] = {record['status']: record['count'] for record in result}
                
                # Total relationships
                result = session.run("MATCH ()-[r]->() RETURN count(r) as total")
                stats['total_relationships'] = result.single()['total']
                
                return stats
                
            except Exception as e:
                logger.error(f"Failed to get statistics: {e}")
                return {}
    
    def clear_all_data(self) -> bool:
        """
        Clear all data from CMDB (use with caution!)
        
        Returns:
            bool: Success status
        """
        with self.driver.session() as session:
            try:
                session.run("MATCH (n) DETACH DELETE n")
                logger.warning("All CMDB data cleared!")
                return True
            except Exception as e:
                logger.error(f"Failed to clear data: {e}")
                return False
