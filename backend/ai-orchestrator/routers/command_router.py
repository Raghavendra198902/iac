"""
Command Router
Routes NLP intents to appropriate backend services
"""

import httpx
import logging
from typing import Dict, Any, Optional
from datetime import datetime

from models.schemas import (
    Intent, IntentType, Entity, EntityType, ServiceRequest, ServiceResponse,
    GraphQLQueryRequest, AIOpsRequest, CMDBRequest
)

logger = logging.getLogger(__name__)


class CommandRouter:
    """Routes commands to appropriate backend services"""
    
    def __init__(
        self,
        graphql_url: str = "http://localhost:4000/graphql",
        aiops_url: str = "http://localhost:8100/api/v3/aiops",
        cmdb_url: str = "http://localhost:8200/api/v3/cmdb"
    ):
        self.graphql_url = graphql_url
        self.aiops_url = aiops_url
        self.cmdb_url = cmdb_url
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def route_command(self, intent: Intent) -> ServiceResponse:
        """Route command based on intent to appropriate service"""
        start_time = datetime.utcnow()
        
        try:
            # Route based on intent type
            if intent.type in self._graphql_intents():
                response = await self._route_to_graphql(intent)
            elif intent.type in self._aiops_intents():
                response = await self._route_to_aiops(intent)
            elif intent.type in self._cmdb_intents():
                response = await self._route_to_cmdb(intent)
            else:
                response = ServiceResponse(
                    success=False,
                    service="none",
                    operation=intent.type.value,
                    error=f"No service found for intent: {intent.type}",
                    execution_time_ms=0
                )
            
            execution_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            response.execution_time_ms = execution_time
            return response
            
        except Exception as e:
            logger.error(f"Error routing command: {str(e)}")
            execution_time = (datetime.utcnow() - start_time).total_seconds() * 1000
            return ServiceResponse(
                success=False,
                service="router",
                operation=intent.type.value,
                error=str(e),
                execution_time_ms=execution_time
            )
    
    def _graphql_intents(self) -> set:
        """Get intent types that should route to GraphQL API"""
        return {
            IntentType.CREATE_INFRASTRUCTURE,
            IntentType.UPDATE_INFRASTRUCTURE,
            IntentType.DELETE_INFRASTRUCTURE,
            IntentType.LIST_INFRASTRUCTURE,
            IntentType.DESCRIBE_INFRASTRUCTURE,
            IntentType.DEPLOY,
            IntentType.SCALE,
            IntentType.ROLLBACK,
            IntentType.DELETE_DEPLOYMENT,
            IntentType.LIST_DEPLOYMENTS,
        }
    
    def _aiops_intents(self) -> set:
        """Get intent types that should route to AIOps Engine"""
        return {
            IntentType.PREDICT_FAILURE,
            IntentType.FORECAST_CAPACITY,
            IntentType.DETECT_THREAT,
            IntentType.DETECT_ANOMALY,
        }
    
    def _cmdb_intents(self) -> set:
        """Get intent types that should route to CMDB Agent"""
        return {
            IntentType.DISCOVER_RESOURCES,
            IntentType.LIST_RESOURCES,
            IntentType.DESCRIBE_RESOURCE,
            IntentType.QUERY_GRAPH,
            IntentType.GET_STATISTICS,
        }
    
    async def _route_to_graphql(self, intent: Intent) -> ServiceResponse:
        """Route command to GraphQL API"""
        query, variables = self._build_graphql_query(intent)
        
        try:
            response = await self.client.post(
                self.graphql_url,
                json={"query": query, "variables": variables}
            )
            response.raise_for_status()
            data = response.json()
            
            if "errors" in data:
                return ServiceResponse(
                    success=False,
                    service="graphql",
                    operation=intent.type.value,
                    error=str(data["errors"]),
                    execution_time_ms=0
                )
            
            return ServiceResponse(
                success=True,
                service="graphql",
                operation=intent.type.value,
                data=data.get("data"),
                execution_time_ms=0
            )
            
        except httpx.HTTPError as e:
            logger.error(f"GraphQL request failed: {str(e)}")
            return ServiceResponse(
                success=False,
                service="graphql",
                operation=intent.type.value,
                error=f"GraphQL service error: {str(e)}",
                execution_time_ms=0
            )
    
    async def _route_to_aiops(self, intent: Intent) -> ServiceResponse:
        """Route command to AIOps Engine"""
        endpoint, payload = self._build_aiops_request(intent)
        
        try:
            response = await self.client.post(
                f"{self.aiops_url}/{endpoint}",
                json=payload
            )
            response.raise_for_status()
            data = response.json()
            
            return ServiceResponse(
                success=True,
                service="aiops",
                operation=intent.type.value,
                data=data,
                execution_time_ms=0
            )
            
        except httpx.HTTPError as e:
            logger.error(f"AIOps request failed: {str(e)}")
            return ServiceResponse(
                success=False,
                service="aiops",
                operation=intent.type.value,
                error=f"AIOps service error: {str(e)}",
                execution_time_ms=0
            )
    
    async def _route_to_cmdb(self, intent: Intent) -> ServiceResponse:
        """Route command to CMDB Agent"""
        endpoint, method, params = self._build_cmdb_request(intent)
        
        try:
            if method == "GET":
                response = await self.client.get(
                    f"{self.cmdb_url}/{endpoint}",
                    params=params
                )
            else:
                response = await self.client.post(
                    f"{self.cmdb_url}/{endpoint}",
                    json=params
                )
            
            response.raise_for_status()
            data = response.json()
            
            return ServiceResponse(
                success=True,
                service="cmdb",
                operation=intent.type.value,
                data=data,
                execution_time_ms=0
            )
            
        except httpx.HTTPError as e:
            logger.error(f"CMDB request failed: {str(e)}")
            return ServiceResponse(
                success=False,
                service="cmdb",
                operation=intent.type.value,
                error=f"CMDB service error: {str(e)}",
                execution_time_ms=0
            )
    
    def _build_graphql_query(self, intent: Intent) -> tuple[str, Dict[str, Any]]:
        """Build GraphQL query from intent"""
        entities_dict = {e.type: e.value for e in intent.entities}
        
        if intent.type == IntentType.LIST_INFRASTRUCTURE:
            provider = entities_dict.get(EntityType.PROVIDER)
            status = entities_dict.get(EntityType.STATUS)
            
            query = """
                query ListInfrastructures($provider: Provider, $status: Status, $first: Int) {
                    listInfrastructures(provider: $provider, status: $status, first: $first) {
                        edges {
                            node {
                                id
                                name
                                provider
                                region
                                status
                                createdAt
                                computeResources {
                                    id
                                    resourceType
                                    cpu
                                    memory
                                    status
                                }
                            }
                        }
                        pageInfo {
                            hasNextPage
                            endCursor
                        }
                    }
                }
            """
            variables = {
                "first": 20
            }
            if provider:
                variables["provider"] = provider.upper()
            if status:
                variables["status"] = status.upper()
            
            return query, variables
        
        elif intent.type == IntentType.DESCRIBE_INFRASTRUCTURE:
            infra_name = entities_dict.get(EntityType.INFRASTRUCTURE_NAME, "")
            
            query = """
                query GetInfrastructure($id: ID!) {
                    infrastructure(id: $id) {
                        id
                        name
                        provider
                        region
                        status
                        configuration
                        createdAt
                        updatedAt
                        computeResources {
                            id
                            resourceType
                            cpu
                            memory
                            storage
                            status
                        }
                        deployments {
                            id
                            version
                            status
                            replicas
                            deployedAt
                        }
                    }
                }
            """
            return query, {"id": infra_name}
        
        elif intent.type == IntentType.LIST_DEPLOYMENTS:
            query = """
                query ListDeployments($first: Int) {
                    listDeployments(first: $first) {
                        edges {
                            node {
                                id
                                version
                                status
                                replicas
                                infrastructure {
                                    id
                                    name
                                }
                                deployedAt
                            }
                        }
                    }
                }
            """
            return query, {"first": 20}
        
        elif intent.type == IntentType.SCALE:
            deployment_id = entities_dict.get(EntityType.DEPLOYMENT_ID, "")
            count = entities_dict.get(EntityType.COUNT, "3")
            
            query = """
                mutation ScaleDeployment($id: ID!, $replicas: Int!) {
                    scaleDeployment(id: $id, replicas: $replicas) {
                        id
                        replicas
                        status
                    }
                }
            """
            return query, {"id": deployment_id, "replicas": int(count)}
        
        # Default fallback
        return "{ __typename }", {}
    
    def _build_aiops_request(self, intent: Intent) -> tuple[str, Dict[str, Any]]:
        """Build AIOps request from intent"""
        entities_dict = {e.type: e.value for e in intent.entities}
        
        if intent.type == IntentType.PREDICT_FAILURE:
            return "predict/failure", {
                "infrastructure_id": entities_dict.get(EntityType.INFRASTRUCTURE_NAME, "unknown"),
                "metrics": {
                    "cpu_usage": [75.0, 80.0, 85.0],
                    "memory_usage": [60.0, 65.0, 70.0],
                    "error_rate": [0.01, 0.02, 0.03]
                },
                "time_window_hours": 24
            }
        
        elif intent.type == IntentType.FORECAST_CAPACITY:
            return "predict/capacity", {
                "infrastructure_id": entities_dict.get(EntityType.INFRASTRUCTURE_NAME, "unknown"),
                "current_capacity": {
                    "cpu": 80.0,
                    "memory": 70.0,
                    "storage": 60.0
                },
                "forecast_days": 7
            }
        
        elif intent.type == IntentType.DETECT_THREAT:
            return "detect/threat", {
                "infrastructure_id": entities_dict.get(EntityType.INFRASTRUCTURE_NAME, "unknown"),
                "logs": [],
                "events": []
            }
        
        elif intent.type == IntentType.DETECT_ANOMALY:
            return "detect/anomaly", {
                "metrics": {
                    "cpu": [45.0, 50.0, 55.0, 90.0, 52.0],
                    "memory": [60.0, 62.0, 61.0, 85.0, 63.0]
                }
            }
        
        return "", {}
    
    def _build_cmdb_request(self, intent: Intent) -> tuple[str, str, Dict[str, Any]]:
        """Build CMDB request from intent (endpoint, method, params)"""
        entities_dict = {e.type: e.value for e in intent.entities}
        
        if intent.type == IntentType.DISCOVER_RESOURCES:
            provider = entities_dict.get(EntityType.PROVIDER, "aws")
            region = entities_dict.get(EntityType.REGION, "us-east-1")
            
            return "discover/aws", "POST", {
                "credentials": {
                    "regions": [region]
                },
                "store_in_graph": True
            }
        
        elif intent.type == IntentType.LIST_RESOURCES:
            params = {}
            if EntityType.PROVIDER in entities_dict:
                params["provider"] = entities_dict[EntityType.PROVIDER]
            if EntityType.RESOURCE_TYPE in entities_dict:
                params["resource_type"] = entities_dict[EntityType.RESOURCE_TYPE].upper()
            if EntityType.STATUS in entities_dict:
                params["status"] = entities_dict[EntityType.STATUS].upper()
            if EntityType.REGION in entities_dict:
                params["region"] = entities_dict[EntityType.REGION]
            params["limit"] = 50
            
            return "resources", "GET", params
        
        elif intent.type == IntentType.DESCRIBE_RESOURCE:
            resource_id = entities_dict.get(EntityType.RESOURCE_ID, "")
            return f"resources/{resource_id}", "GET", {}
        
        elif intent.type == IntentType.QUERY_GRAPH:
            resource_id = entities_dict.get(EntityType.RESOURCE_ID, "")
            return f"graph/{resource_id}", "GET", {"depth": 3}
        
        elif intent.type == IntentType.GET_STATISTICS:
            return "statistics", "GET", {}
        
        return "", "GET", {}
    
    async def close(self):
        """Close HTTP client"""
        await self.client.aclose()
