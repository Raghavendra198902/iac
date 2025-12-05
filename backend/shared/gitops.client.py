"""
ArgoCD GitOps Integration for IAC Dharma v2.0
Automates deployment synchronization with Git repositories
"""

from typing import Dict, List, Optional
import yaml
import requests
import logging
from datetime import datetime

logger = logging.getLogger(__name__)


class ArgoCDIntegration:
    """
    ArgoCD integration for GitOps-based deployments
    """
    
    def __init__(
        self,
        argocd_url: str,
        argocd_token: str,
        namespace: str = "argocd"
    ):
        self.argocd_url = argocd_url.rstrip('/')
        self.argocd_token = argocd_token
        self.namespace = namespace
        self.headers = {
            "Authorization": f"Bearer {argocd_token}",
            "Content-Type": "application/json"
        }
    
    def create_application(
        self,
        name: str,
        project: str,
        repo_url: str,
        path: str,
        destination_namespace: str,
        destination_server: str = "https://kubernetes.default.svc",
        sync_policy: Optional[Dict] = None
    ) -> Dict:
        """
        Create an ArgoCD application
        
        Args:
            name: Application name
            project: ArgoCD project name
            repo_url: Git repository URL
            path: Path within repository
            destination_namespace: Target K8s namespace
            destination_server: Target K8s cluster
            sync_policy: Sync policy configuration
            
        Returns:
            Created application details
        """
        try:
            if sync_policy is None:
                sync_policy = {
                    "automated": {
                        "prune": True,
                        "selfHeal": True,
                        "allowEmpty": False
                    },
                    "syncOptions": [
                        "CreateNamespace=true"
                    ]
                }
            
            application = {
                "apiVersion": "argoproj.io/v1alpha1",
                "kind": "Application",
                "metadata": {
                    "name": name,
                    "namespace": self.namespace
                },
                "spec": {
                    "project": project,
                    "source": {
                        "repoURL": repo_url,
                        "targetRevision": "HEAD",
                        "path": path
                    },
                    "destination": {
                        "server": destination_server,
                        "namespace": destination_namespace
                    },
                    "syncPolicy": sync_policy
                }
            }
            
            response = requests.post(
                f"{self.argocd_url}/api/v1/applications",
                headers=self.headers,
                json=application,
                timeout=30
            )
            response.raise_for_status()
            
            logger.info(f"Created ArgoCD application: {name}")
            return response.json()
            
        except Exception as e:
            logger.error(f"Failed to create ArgoCD application: {e}")
            raise
    
    def sync_application(self, name: str, prune: bool = True) -> Dict:
        """
        Trigger application synchronization
        
        Args:
            name: Application name
            prune: Whether to prune resources
            
        Returns:
            Sync operation details
        """
        try:
            sync_request = {
                "prune": prune,
                "dryRun": False,
                "strategy": {
                    "hook": {
                        "force": True
                    }
                }
            }
            
            response = requests.post(
                f"{self.argocd_url}/api/v1/applications/{name}/sync",
                headers=self.headers,
                json=sync_request,
                timeout=30
            )
            response.raise_for_status()
            
            logger.info(f"Triggered sync for application: {name}")
            return response.json()
            
        except Exception as e:
            logger.error(f"Failed to sync application: {e}")
            raise
    
    def get_application_status(self, name: str) -> Dict:
        """
        Get application sync status
        
        Args:
            name: Application name
            
        Returns:
            Application status details
        """
        try:
            response = requests.get(
                f"{self.argocd_url}/api/v1/applications/{name}",
                headers=self.headers,
                timeout=30
            )
            response.raise_for_status()
            
            app_data = response.json()
            
            return {
                "name": name,
                "sync_status": app_data["status"]["sync"]["status"],
                "health_status": app_data["status"]["health"]["status"],
                "revision": app_data["status"]["sync"]["revision"],
                "resources": len(app_data["status"]["resources"]),
                "conditions": app_data["status"].get("conditions", [])
            }
            
        except Exception as e:
            logger.error(f"Failed to get application status: {e}")
            raise
    
    def delete_application(self, name: str, cascade: bool = True) -> bool:
        """
        Delete ArgoCD application
        
        Args:
            name: Application name
            cascade: Whether to delete K8s resources
            
        Returns:
            True if successful
        """
        try:
            params = {"cascade": str(cascade).lower()}
            
            response = requests.delete(
                f"{self.argocd_url}/api/v1/applications/{name}",
                headers=self.headers,
                params=params,
                timeout=30
            )
            response.raise_for_status()
            
            logger.info(f"Deleted ArgoCD application: {name}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete application: {e}")
            raise
    
    def rollback_application(self, name: str, revision: str) -> Dict:
        """
        Rollback application to specific revision
        
        Args:
            name: Application name
            revision: Git revision to rollback to
            
        Returns:
            Rollback operation details
        """
        try:
            rollback_request = {
                "revision": revision,
                "prune": True
            }
            
            response = requests.post(
                f"{self.argocd_url}/api/v1/applications/{name}/rollback",
                headers=self.headers,
                json=rollback_request,
                timeout=30
            )
            response.raise_for_status()
            
            logger.info(f"Rolled back application {name} to revision {revision}")
            return response.json()
            
        except Exception as e:
            logger.error(f"Failed to rollback application: {e}")
            raise


class FluxCDIntegration:
    """
    FluxCD integration for GitOps-based deployments
    """
    
    def __init__(self, kubectl_context: Optional[str] = None):
        self.kubectl_context = kubectl_context
    
    def create_git_repository(
        self,
        name: str,
        namespace: str,
        url: str,
        branch: str = "main",
        interval: str = "1m",
        secret_ref: Optional[str] = None
    ) -> Dict:
        """
        Create FluxCD GitRepository resource
        
        Args:
            name: Repository name
            namespace: Kubernetes namespace
            url: Git repository URL
            branch: Git branch
            interval: Sync interval
            secret_ref: Secret for authentication
            
        Returns:
            Created GitRepository manifest
        """
        manifest = {
            "apiVersion": "source.toolkit.fluxcd.io/v1",
            "kind": "GitRepository",
            "metadata": {
                "name": name,
                "namespace": namespace
            },
            "spec": {
                "interval": interval,
                "url": url,
                "ref": {
                    "branch": branch
                }
            }
        }
        
        if secret_ref:
            manifest["spec"]["secretRef"] = {
                "name": secret_ref
            }
        
        return manifest
    
    def create_kustomization(
        self,
        name: str,
        namespace: str,
        source_ref: str,
        path: str,
        prune: bool = True,
        interval: str = "5m"
    ) -> Dict:
        """
        Create FluxCD Kustomization resource
        
        Args:
            name: Kustomization name
            namespace: Kubernetes namespace
            source_ref: GitRepository source reference
            path: Path within repository
            prune: Whether to prune resources
            interval: Sync interval
            
        Returns:
            Created Kustomization manifest
        """
        manifest = {
            "apiVersion": "kustomize.toolkit.fluxcd.io/v1",
            "kind": "Kustomization",
            "metadata": {
                "name": name,
                "namespace": namespace
            },
            "spec": {
                "interval": interval,
                "sourceRef": {
                    "kind": "GitRepository",
                    "name": source_ref
                },
                "path": path,
                "prune": prune,
                "targetNamespace": namespace
            }
        }
        
        return manifest
    
    def create_helm_release(
        self,
        name: str,
        namespace: str,
        chart: str,
        version: str,
        values: Dict,
        source_ref: str,
        interval: str = "5m"
    ) -> Dict:
        """
        Create FluxCD HelmRelease resource
        
        Args:
            name: Release name
            namespace: Kubernetes namespace
            chart: Chart name
            version: Chart version
            values: Helm values
            source_ref: HelmRepository source reference
            interval: Sync interval
            
        Returns:
            Created HelmRelease manifest
        """
        manifest = {
            "apiVersion": "helm.toolkit.fluxcd.io/v2beta1",
            "kind": "HelmRelease",
            "metadata": {
                "name": name,
                "namespace": namespace
            },
            "spec": {
                "interval": interval,
                "chart": {
                    "spec": {
                        "chart": chart,
                        "version": version,
                        "sourceRef": {
                            "kind": "HelmRepository",
                            "name": source_ref
                        }
                    }
                },
                "values": values
            }
        }
        
        return manifest


def generate_gitops_manifests(
    app_name: str,
    namespace: str,
    repo_url: str,
    path: str,
    tool: str = "argocd"
) -> List[Dict]:
    """
    Generate GitOps manifests for IAC Dharma deployment
    
    Args:
        app_name: Application name
        namespace: Target namespace
        repo_url: Git repository URL
        path: Path within repository
        tool: GitOps tool (argocd or flux)
        
    Returns:
        List of manifest dictionaries
    """
    manifests = []
    
    if tool == "argocd":
        # ArgoCD Application manifest
        manifests.append({
            "apiVersion": "argoproj.io/v1alpha1",
            "kind": "Application",
            "metadata": {
                "name": app_name,
                "namespace": "argocd"
            },
            "spec": {
                "project": "default",
                "source": {
                    "repoURL": repo_url,
                    "targetRevision": "HEAD",
                    "path": path
                },
                "destination": {
                    "server": "https://kubernetes.default.svc",
                    "namespace": namespace
                },
                "syncPolicy": {
                    "automated": {
                        "prune": True,
                        "selfHeal": True
                    }
                }
            }
        })
    
    elif tool == "flux":
        flux = FluxCDIntegration()
        
        # GitRepository
        manifests.append(flux.create_git_repository(
            name=f"{app_name}-repo",
            namespace=namespace,
            url=repo_url
        ))
        
        # Kustomization
        manifests.append(flux.create_kustomization(
            name=app_name,
            namespace=namespace,
            source_ref=f"{app_name}-repo",
            path=path
        ))
    
    return manifests


# Example usage
if __name__ == "__main__":
    # ArgoCD example
    argocd = ArgoCDIntegration(
        argocd_url="https://argocd.example.com",
        argocd_token="your-token-here"
    )
    
    # Create application
    app = argocd.create_application(
        name="iac-dharma-production",
        project="default",
        repo_url="https://github.com/your-org/iac-manifests",
        path="k8s/production",
        destination_namespace="iac-dharma"
    )
    
    print(f"Created application: {app['metadata']['name']}")
    
    # Check status
    status = argocd.get_application_status("iac-dharma-production")
    print(f"Sync Status: {status['sync_status']}")
    print(f"Health Status: {status['health_status']}")
