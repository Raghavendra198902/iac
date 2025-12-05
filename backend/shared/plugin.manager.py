"""
Plugin Architecture for IAC Dharma v2.0
Enables extensibility through custom plugins
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional, Callable
import importlib
import inspect
import logging
import yaml
from pathlib import Path

logger = logging.getLogger(__name__)


class PluginBase(ABC):
    """
    Base class for all IAC Dharma plugins
    """
    
    def __init__(self):
        self.name = self.__class__.__name__
        self.version = "1.0.0"
        self.enabled = True
    
    @abstractmethod
    def initialize(self, config: Dict[str, Any]) -> bool:
        """
        Initialize plugin with configuration
        
        Args:
            config: Plugin configuration
            
        Returns:
            True if initialization successful
        """
        pass
    
    @abstractmethod
    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute plugin logic
        
        Args:
            context: Execution context
            
        Returns:
            Execution result
        """
        pass
    
    def cleanup(self) -> None:
        """Cleanup plugin resources"""
        pass


class ProviderPlugin(PluginBase):
    """
    Plugin for custom cloud providers
    """
    
    @abstractmethod
    def validate_credentials(self, credentials: Dict[str, str]) -> bool:
        """Validate provider credentials"""
        pass
    
    @abstractmethod
    def generate_iac(self, blueprint: Dict[str, Any]) -> str:
        """Generate IaC code for provider"""
        pass
    
    @abstractmethod
    def estimate_cost(self, blueprint: Dict[str, Any]) -> float:
        """Estimate infrastructure cost"""
        pass


class GeneratorPlugin(PluginBase):
    """
    Plugin for custom IaC generators
    """
    
    @abstractmethod
    def supports_format(self) -> str:
        """Return supported IaC format (e.g., 'terraform', 'ansible')"""
        pass
    
    @abstractmethod
    def generate(self, blueprint: Dict[str, Any]) -> str:
        """Generate IaC code"""
        pass


class ValidatorPlugin(PluginBase):
    """
    Plugin for custom validation rules
    """
    
    @abstractmethod
    def validate(self, blueprint: Dict[str, Any]) -> List[Dict[str, str]]:
        """
        Validate blueprint
        
        Returns:
            List of validation issues
        """
        pass


class NotificationPlugin(PluginBase):
    """
    Plugin for custom notification channels
    """
    
    @abstractmethod
    def send_notification(
        self,
        title: str,
        message: str,
        severity: str,
        data: Optional[Dict] = None
    ) -> bool:
        """Send notification"""
        pass


class PluginManager:
    """
    Manages plugin lifecycle and execution
    """
    
    def __init__(self, plugin_dir: str = "./plugins"):
        self.plugin_dir = Path(plugin_dir)
        self.plugins: Dict[str, PluginBase] = {}
        self.hooks: Dict[str, List[Callable]] = {}
    
    def discover_plugins(self) -> List[str]:
        """
        Discover available plugins in plugin directory
        
        Returns:
            List of plugin names
        """
        discovered = []
        
        if not self.plugin_dir.exists():
            logger.warning(f"Plugin directory not found: {self.plugin_dir}")
            return discovered
        
        for plugin_file in self.plugin_dir.glob("*.py"):
            if plugin_file.name.startswith("_"):
                continue
            
            plugin_name = plugin_file.stem
            discovered.append(plugin_name)
            logger.info(f"Discovered plugin: {plugin_name}")
        
        return discovered
    
    def load_plugin(self, plugin_name: str, config: Dict[str, Any]) -> bool:
        """
        Load and initialize a plugin
        
        Args:
            plugin_name: Name of plugin to load
            config: Plugin configuration
            
        Returns:
            True if loaded successfully
        """
        try:
            # Import plugin module
            module_path = f"plugins.{plugin_name}"
            module = importlib.import_module(module_path)
            
            # Find plugin class (should inherit from PluginBase)
            plugin_class = None
            for name, obj in inspect.getmembers(module, inspect.isclass):
                if issubclass(obj, PluginBase) and obj != PluginBase:
                    plugin_class = obj
                    break
            
            if not plugin_class:
                logger.error(f"No valid plugin class found in {plugin_name}")
                return False
            
            # Instantiate and initialize
            plugin = plugin_class()
            if plugin.initialize(config):
                self.plugins[plugin_name] = plugin
                logger.info(f"Loaded plugin: {plugin_name} v{plugin.version}")
                return True
            else:
                logger.error(f"Failed to initialize plugin: {plugin_name}")
                return False
                
        except Exception as e:
            logger.error(f"Failed to load plugin {plugin_name}: {e}")
            return False
    
    def unload_plugin(self, plugin_name: str) -> bool:
        """
        Unload a plugin
        
        Args:
            plugin_name: Name of plugin to unload
            
        Returns:
            True if unloaded successfully
        """
        if plugin_name in self.plugins:
            try:
                self.plugins[plugin_name].cleanup()
                del self.plugins[plugin_name]
                logger.info(f"Unloaded plugin: {plugin_name}")
                return True
            except Exception as e:
                logger.error(f"Failed to unload plugin {plugin_name}: {e}")
                return False
        return False
    
    def execute_plugin(
        self,
        plugin_name: str,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Execute a specific plugin
        
        Args:
            plugin_name: Name of plugin to execute
            context: Execution context
            
        Returns:
            Plugin execution result
        """
        if plugin_name not in self.plugins:
            raise ValueError(f"Plugin not loaded: {plugin_name}")
        
        plugin = self.plugins[plugin_name]
        
        if not plugin.enabled:
            logger.warning(f"Plugin is disabled: {plugin_name}")
            return {"success": False, "error": "Plugin disabled"}
        
        try:
            result = plugin.execute(context)
            return {"success": True, "result": result}
        except Exception as e:
            logger.error(f"Plugin execution failed {plugin_name}: {e}")
            return {"success": False, "error": str(e)}
    
    def register_hook(self, hook_name: str, callback: Callable) -> None:
        """
        Register a hook callback
        
        Args:
            hook_name: Name of hook (e.g., 'before_deployment')
            callback: Function to call
        """
        if hook_name not in self.hooks:
            self.hooks[hook_name] = []
        self.hooks[hook_name].append(callback)
        logger.info(f"Registered hook: {hook_name}")
    
    def execute_hooks(
        self,
        hook_name: str,
        context: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Execute all callbacks for a hook
        
        Args:
            hook_name: Name of hook to execute
            context: Hook context
            
        Returns:
            List of hook results
        """
        if hook_name not in self.hooks:
            return []
        
        results = []
        for callback in self.hooks[hook_name]:
            try:
                result = callback(context)
                results.append({"success": True, "result": result})
            except Exception as e:
                logger.error(f"Hook execution failed {hook_name}: {e}")
                results.append({"success": False, "error": str(e)})
        
        return results
    
    def list_plugins(self) -> List[Dict[str, Any]]:
        """
        List all loaded plugins
        
        Returns:
            List of plugin info
        """
        return [
            {
                "name": name,
                "version": plugin.version,
                "enabled": plugin.enabled,
                "type": type(plugin).__bases__[0].__name__
            }
            for name, plugin in self.plugins.items()
        ]


# Example Plugin Implementations

class DigitalOceanProvider(ProviderPlugin):
    """
    Example: DigitalOcean cloud provider plugin
    """
    
    def initialize(self, config: Dict[str, Any]) -> bool:
        self.api_token = config.get("api_token")
        self.version = "1.0.0"
        return self.api_token is not None
    
    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        action = context.get("action")
        
        if action == "generate_iac":
            return {"code": self.generate_iac(context.get("blueprint"))}
        elif action == "estimate_cost":
            return {"cost": self.estimate_cost(context.get("blueprint"))}
        
        return {}
    
    def validate_credentials(self, credentials: Dict[str, str]) -> bool:
        # Validate DigitalOcean API token
        return "api_token" in credentials
    
    def generate_iac(self, blueprint: Dict[str, Any]) -> str:
        # Generate Terraform code for DigitalOcean
        return """
resource "digitalocean_droplet" "web" {
  image  = "ubuntu-22-04-x64"
  name   = "web-server"
  region = "nyc3"
  size   = "s-1vcpu-1gb"
}
"""
    
    def estimate_cost(self, blueprint: Dict[str, Any]) -> float:
        # Estimate DigitalOcean costs
        droplet_cost = 6.00  # $6/month for basic droplet
        return droplet_cost


class AnsibleGenerator(GeneratorPlugin):
    """
    Example: Ansible playbook generator plugin
    """
    
    def initialize(self, config: Dict[str, Any]) -> bool:
        self.version = "1.0.0"
        return True
    
    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        blueprint = context.get("blueprint")
        return {"code": self.generate(blueprint)}
    
    def supports_format(self) -> str:
        return "ansible"
    
    def generate(self, blueprint: Dict[str, Any]) -> str:
        # Generate Ansible playbook
        return """
---
- name: Deploy Infrastructure
  hosts: localhost
  tasks:
    - name: Create EC2 instance
      amazon.aws.ec2_instance:
        name: web-server
        instance_type: t3.medium
        image_id: ami-0c55b159cbfafe1f0
        region: us-east-1
        state: running
"""


class ComplianceValidator(ValidatorPlugin):
    """
    Example: GDPR compliance validator plugin
    """
    
    def initialize(self, config: Dict[str, Any]) -> bool:
        self.rules = config.get("rules", [])
        self.version = "1.0.0"
        return True
    
    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        blueprint = context.get("blueprint")
        return {"issues": self.validate(blueprint)}
    
    def validate(self, blueprint: Dict[str, Any]) -> List[Dict[str, str]]:
        issues = []
        
        # Check data residency
        if blueprint.get("region") not in ["eu-west-1", "eu-central-1"]:
            issues.append({
                "severity": "error",
                "message": "Data must be stored in EU regions for GDPR compliance"
            })
        
        # Check encryption
        resources = blueprint.get("resources", [])
        for resource in resources:
            if resource.get("type") == "database" and not resource.get("encryption"):
                issues.append({
                    "severity": "error",
                    "message": f"Database {resource['name']} must be encrypted"
                })
        
        return issues


class TeamsNotification(NotificationPlugin):
    """
    Example: Microsoft Teams notification plugin
    """
    
    def initialize(self, config: Dict[str, Any]) -> bool:
        self.webhook_url = config.get("webhook_url")
        self.version = "1.0.0"
        return self.webhook_url is not None
    
    def execute(self, context: Dict[str, Any]) -> Dict[str, Any]:
        success = self.send_notification(
            title=context.get("title"),
            message=context.get("message"),
            severity=context.get("severity"),
            data=context.get("data")
        )
        return {"sent": success}
    
    def send_notification(
        self,
        title: str,
        message: str,
        severity: str,
        data: Optional[Dict] = None
    ) -> bool:
        # Send notification to Microsoft Teams
        import requests
        
        color = {
            "info": "0078D4",
            "warning": "FFA500",
            "error": "FF0000",
            "success": "00FF00"
        }.get(severity, "808080")
        
        payload = {
            "@type": "MessageCard",
            "themeColor": color,
            "title": title,
            "text": message
        }
        
        try:
            response = requests.post(self.webhook_url, json=payload)
            return response.status_code == 200
        except Exception as e:
            logger.error(f"Failed to send Teams notification: {e}")
            return False


# Example usage
if __name__ == "__main__":
    # Initialize plugin manager
    manager = PluginManager()
    
    # Load plugins
    manager.load_plugin("digitalocean_provider", {
        "api_token": "your-token-here"
    })
    
    # Execute plugin
    result = manager.execute_plugin("digitalocean_provider", {
        "action": "estimate_cost",
        "blueprint": {"resources": [{"type": "droplet"}]}
    })
    
    print(f"Plugin result: {result}")
    
    # List all plugins
    plugins = manager.list_plugins()
    print(f"Loaded plugins: {plugins}")
