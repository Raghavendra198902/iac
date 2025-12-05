"""
Istio Service Mesh Integration for IAC Dharma v2.0
Provides advanced traffic management, security, and observability
"""

from typing import Dict, List, Optional
import yaml
import logging

logger = logging.getLogger(__name__)


def generate_istio_virtualservice(
    name: str,
    namespace: str,
    hosts: List[str],
    routes: List[Dict],
    gateways: Optional[List[str]] = None
) -> Dict:
    """
    Generate Istio VirtualService for traffic routing
    
    Args:
        name: Service name
        namespace: Kubernetes namespace
        hosts: List of host names
        routes: HTTP route configurations
        gateways: List of gateway names
        
    Returns:
        VirtualService manifest
    """
    manifest = {
        "apiVersion": "networking.istio.io/v1beta1",
        "kind": "VirtualService",
        "metadata": {
            "name": name,
            "namespace": namespace
        },
        "spec": {
            "hosts": hosts,
            "http": routes
        }
    }
    
    if gateways:
        manifest["spec"]["gateways"] = gateways
    
    return manifest


def generate_istio_destinationrule(
    name: str,
    namespace: str,
    host: str,
    subsets: List[Dict],
    traffic_policy: Optional[Dict] = None
) -> Dict:
    """
    Generate Istio DestinationRule for traffic policies
    
    Args:
        name: Rule name
        namespace: Kubernetes namespace
        host: Service host
        subsets: Traffic subsets (versions)
        traffic_policy: Global traffic policy
        
    Returns:
        DestinationRule manifest
    """
    manifest = {
        "apiVersion": "networking.istio.io/v1beta1",
        "kind": "DestinationRule",
        "metadata": {
            "name": name,
            "namespace": namespace
        },
        "spec": {
            "host": host,
            "subsets": subsets
        }
    }
    
    if traffic_policy:
        manifest["spec"]["trafficPolicy"] = traffic_policy
    
    return manifest


def generate_canary_deployment(
    service_name: str,
    namespace: str,
    stable_version: str,
    canary_version: str,
    canary_weight: int = 10
) -> List[Dict]:
    """
    Generate Istio manifests for canary deployment
    
    Args:
        service_name: Service name
        namespace: Kubernetes namespace
        stable_version: Stable version label
        canary_version: Canary version label
        canary_weight: Percentage of traffic to canary (0-100)
        
    Returns:
        List of Istio manifests
    """
    # DestinationRule with version subsets
    destination_rule = generate_istio_destinationrule(
        name=f"{service_name}-destination",
        namespace=namespace,
        host=service_name,
        subsets=[
            {
                "name": "stable",
                "labels": {"version": stable_version}
            },
            {
                "name": "canary",
                "labels": {"version": canary_version}
            }
        ],
        traffic_policy={
            "connectionPool": {
                "tcp": {
                    "maxConnections": 100
                },
                "http": {
                    "http1MaxPendingRequests": 50,
                    "http2MaxRequests": 100,
                    "maxRequestsPerConnection": 2
                }
            },
            "loadBalancer": {
                "simple": "LEAST_REQUEST"
            }
        }
    )
    
    # VirtualService for traffic splitting
    virtual_service = generate_istio_virtualservice(
        name=f"{service_name}-route",
        namespace=namespace,
        hosts=[service_name],
        routes=[
            {
                "route": [
                    {
                        "destination": {
                            "host": service_name,
                            "subset": "stable"
                        },
                        "weight": 100 - canary_weight
                    },
                    {
                        "destination": {
                            "host": service_name,
                            "subset": "canary"
                        },
                        "weight": canary_weight
                    }
                ]
            }
        ]
    )
    
    return [destination_rule, virtual_service]


def generate_circuit_breaker(
    service_name: str,
    namespace: str,
    max_connections: int = 100,
    max_requests: int = 1000,
    consecutive_errors: int = 5,
    interval: str = "30s",
    base_ejection_time: str = "30s"
) -> Dict:
    """
    Generate circuit breaker configuration
    
    Args:
        service_name: Service name
        namespace: Kubernetes namespace
        max_connections: Maximum connections
        max_requests: Maximum requests
        consecutive_errors: Errors before ejection
        interval: Detection interval
        base_ejection_time: Ejection duration
        
    Returns:
        DestinationRule with circuit breaker
    """
    return generate_istio_destinationrule(
        name=f"{service_name}-circuit-breaker",
        namespace=namespace,
        host=service_name,
        subsets=[],
        traffic_policy={
            "connectionPool": {
                "tcp": {
                    "maxConnections": max_connections
                },
                "http": {
                    "http1MaxPendingRequests": max_requests,
                    "maxRequestsPerConnection": 2
                }
            },
            "outlierDetection": {
                "consecutiveErrors": consecutive_errors,
                "interval": interval,
                "baseEjectionTime": base_ejection_time,
                "maxEjectionPercent": 50,
                "minHealthPercent": 40
            }
        }
    )


def generate_mutual_tls(
    namespace: str,
    mode: str = "STRICT"
) -> Dict:
    """
    Generate mTLS policy for namespace
    
    Args:
        namespace: Kubernetes namespace
        mode: TLS mode (STRICT, PERMISSIVE, DISABLE)
        
    Returns:
        PeerAuthentication manifest
    """
    return {
        "apiVersion": "security.istio.io/v1beta1",
        "kind": "PeerAuthentication",
        "metadata": {
            "name": "default",
            "namespace": namespace
        },
        "spec": {
            "mtls": {
                "mode": mode
            }
        }
    }


def generate_authorization_policy(
    name: str,
    namespace: str,
    selector: Dict,
    rules: List[Dict]
) -> Dict:
    """
    Generate Istio authorization policy
    
    Args:
        name: Policy name
        namespace: Kubernetes namespace
        selector: Pod selector
        rules: Authorization rules
        
    Returns:
        AuthorizationPolicy manifest
    """
    return {
        "apiVersion": "security.istio.io/v1beta1",
        "kind": "AuthorizationPolicy",
        "metadata": {
            "name": name,
            "namespace": namespace
        },
        "spec": {
            "selector": selector,
            "rules": rules
        }
    }


def generate_iac_dharma_service_mesh() -> List[Dict]:
    """
    Generate complete service mesh configuration for IAC Dharma
    
    Returns:
        List of Istio manifests
    """
    manifests = []
    namespace = "iac-dharma"
    
    # Gateway for external traffic
    gateway = {
        "apiVersion": "networking.istio.io/v1beta1",
        "kind": "Gateway",
        "metadata": {
            "name": "iac-dharma-gateway",
            "namespace": namespace
        },
        "spec": {
            "selector": {
                "istio": "ingressgateway"
            },
            "servers": [
                {
                    "port": {
                        "number": 80,
                        "name": "http",
                        "protocol": "HTTP"
                    },
                    "hosts": ["*"]
                },
                {
                    "port": {
                        "number": 443,
                        "name": "https",
                        "protocol": "HTTPS"
                    },
                    "hosts": ["iacdharma.example.com"],
                    "tls": {
                        "mode": "SIMPLE",
                        "credentialName": "iac-dharma-tls"
                    }
                }
            ]
        }
    }
    manifests.append(gateway)
    
    # VirtualService for API Gateway
    api_vs = generate_istio_virtualservice(
        name="api-gateway",
        namespace=namespace,
        hosts=["iacdharma.example.com"],
        routes=[
            {
                "match": [{"uri": {"prefix": "/api"}}],
                "route": [{
                    "destination": {
                        "host": "api-gateway",
                        "port": {"number": 3000}
                    }
                }],
                "timeout": "30s",
                "retries": {
                    "attempts": 3,
                    "perTryTimeout": "10s",
                    "retryOn": "5xx,reset,connect-failure,refused-stream"
                }
            }
        ],
        gateways=["iac-dharma-gateway"]
    )
    manifests.append(api_vs)
    
    # Circuit breakers for all services
    services = [
        "api-gateway", "blueprint-service", "iac-generator",
        "cost-analyzer", "ai-engine", "deployment-manager"
    ]
    
    for service in services:
        cb = generate_circuit_breaker(
            service_name=service,
            namespace=namespace,
            max_connections=100,
            max_requests=1000,
            consecutive_errors=5
        )
        manifests.append(cb)
    
    # mTLS for entire namespace
    mtls = generate_mutual_tls(namespace=namespace, mode="STRICT")
    manifests.append(mtls)
    
    # Authorization policy - only allow authenticated requests
    auth_policy = generate_authorization_policy(
        name="require-auth",
        namespace=namespace,
        selector={"matchLabels": {"app": "api-gateway"}},
        rules=[
            {
                "from": [{
                    "source": {
                        "requestPrincipals": ["*"]
                    }
                }],
                "to": [{
                    "operation": {
                        "methods": ["GET", "POST", "PUT", "DELETE"]
                    }
                }]
            }
        ]
    )
    manifests.append(auth_policy)
    
    return manifests


# Example: Generate and save manifests
if __name__ == "__main__":
    manifests = generate_iac_dharma_service_mesh()
    
    for manifest in manifests:
        filename = f"{manifest['kind'].lower()}-{manifest['metadata']['name']}.yaml"
        with open(filename, 'w') as f:
            yaml.dump(manifest, f, default_flow_style=False)
        print(f"Generated: {filename}")
