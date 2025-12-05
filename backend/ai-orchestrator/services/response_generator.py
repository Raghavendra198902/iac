"""
Response Generator
Generates natural language responses from service results
"""

import logging
from typing import Dict, Any, Optional
from datetime import datetime

from models.schemas import Intent, IntentType, ServiceResponse, CommandResponse

logger = logging.getLogger(__name__)


class ResponseGenerator:
    """Generates user-friendly responses from service results"""
    
    def generate_response(
        self,
        intent: Intent,
        service_response: ServiceResponse,
        execution_time_ms: float
    ) -> CommandResponse:
        """Generate natural language response from service result"""
        
        # Generate message based on intent and service response
        if not service_response.success:
            message = self._generate_error_message(intent, service_response)
            return CommandResponse(
                success=False,
                intent=intent,
                message=message,
                data=None,
                execution_time_ms=execution_time_ms,
                suggestions=self._generate_error_suggestions(intent, service_response)
            )
        
        # Success responses
        message = self._generate_success_message(intent, service_response)
        
        return CommandResponse(
            success=True,
            intent=intent,
            message=message,
            data=service_response.data,
            execution_time_ms=execution_time_ms,
            suggestions=self._generate_next_steps(intent)
        )
    
    def _generate_success_message(self, intent: Intent, response: ServiceResponse) -> str:
        """Generate success message based on intent"""
        data = response.data or {}
        
        # Infrastructure Management
        if intent.type == IntentType.LIST_INFRASTRUCTURE:
            infrastructures = data.get("listInfrastructures", {}).get("edges", [])
            count = len(infrastructures)
            if count == 0:
                return "No infrastructures found."
            
            infra_list = []
            for edge in infrastructures[:5]:  # Show first 5
                node = edge.get("node", {})
                infra_list.append(
                    f"- **{node.get('name')}** ({node.get('provider')}, {node.get('status')})"
                )
            
            message = f"Found {count} infrastructure(s):\n" + "\n".join(infra_list)
            if count > 5:
                message += f"\n\n_... and {count - 5} more_"
            return message
        
        elif intent.type == IntentType.DESCRIBE_INFRASTRUCTURE:
            infra = data.get("infrastructure", {})
            if not infra:
                return "Infrastructure not found."
            
            compute_count = len(infra.get("computeResources", []))
            deployment_count = len(infra.get("deployments", []))
            
            return f"""**{infra.get('name')}**

📍 Provider: {infra.get('provider')}
🌍 Region: {infra.get('region')}
⚡ Status: {infra.get('status')}
💻 Compute Resources: {compute_count}
🚀 Deployments: {deployment_count}
📅 Created: {infra.get('createdAt', 'N/A')}

{self._format_compute_resources(infra.get('computeResources', []))}
"""
        
        elif intent.type == IntentType.LIST_DEPLOYMENTS:
            deployments = data.get("listDeployments", {}).get("edges", [])
            count = len(deployments)
            if count == 0:
                return "No deployments found."
            
            deploy_list = []
            for edge in deployments[:5]:
                node = edge.get("node", {})
                infra = node.get("infrastructure", {})
                deploy_list.append(
                    f"- **{node.get('version')}** on {infra.get('name', 'N/A')} - "
                    f"{node.get('status')} ({node.get('replicas')} replicas)"
                )
            
            message = f"Found {count} deployment(s):\n" + "\n".join(deploy_list)
            if count > 5:
                message += f"\n\n_... and {count - 5} more_"
            return message
        
        elif intent.type == IntentType.SCALE:
            deployment = data.get("scaleDeployment", {})
            return f"✅ Scaled deployment to {deployment.get('replicas')} replicas. Status: {deployment.get('status')}"
        
        # CMDB Operations
        elif intent.type == IntentType.DISCOVER_RESOURCES:
            task_id = data.get("task_id", "N/A")
            provider = data.get("provider", "N/A")
            return f"🔍 Started {provider.upper()} discovery (Task ID: `{task_id}`)\n\nDiscovery is running in the background. Use the task ID to check progress."
        
        elif intent.type == IntentType.LIST_RESOURCES:
            resources = data.get("resources", [])
            count = data.get("total", len(resources))
            if count == 0:
                return "No resources found."
            
            resource_list = []
            for resource in resources[:5]:
                resource_list.append(
                    f"- **{resource.get('name')}** ({resource.get('resource_type')}) - "
                    f"{resource.get('status')} in {resource.get('region')}"
                )
            
            message = f"Found {count} resource(s):\n" + "\n".join(resource_list)
            if count > 5:
                message += f"\n\n_... and {count - 5} more_"
            return message
        
        elif intent.type == IntentType.DESCRIBE_RESOURCE:
            resource = data.get("resource", data)
            if not resource:
                return "Resource not found."
            
            metadata = resource.get("metadata", {})
            return f"""**{resource.get('name')}**

🔖 ID: `{resource.get('id')}`
📦 Type: {resource.get('resource_type')}
☁️ Provider: {resource.get('provider')}
🌍 Region: {resource.get('region')}
⚡ Status: {resource.get('status')}
🏷️ Tags: {', '.join(f"{k}={v}" for k, v in resource.get('tags', {}).items()) or 'None'}

**Metadata:**
{self._format_metadata(metadata)}
"""
        
        elif intent.type == IntentType.QUERY_GRAPH:
            nodes = data.get("nodes", [])
            relationships = data.get("relationships", [])
            return f"""🗺️ Infrastructure Graph

📦 Nodes: {len(nodes)}
🔗 Relationships: {len(relationships)}

The graph shows the infrastructure topology and relationships between resources.
"""
        
        elif intent.type == IntentType.GET_STATISTICS:
            total = data.get("total_resources", 0)
            by_provider = data.get("by_provider", {})
            by_type = data.get("by_type", {})
            by_status = data.get("by_status", {})
            
            return f"""📊 CMDB Statistics

**Total Resources:** {total}

**By Provider:**
{self._format_dict(by_provider)}

**By Type:**
{self._format_dict(by_type)}

**By Status:**
{self._format_dict(by_status)}

**Total Relationships:** {data.get('total_relationships', 0)}
"""
        
        # AI/ML Operations
        elif intent.type == IntentType.PREDICT_FAILURE:
            prediction = data.get("prediction", {})
            risk_level = prediction.get("risk_level", "unknown")
            probability = prediction.get("probability", 0) * 100
            
            emoji = "🔴" if risk_level == "high" else "🟡" if risk_level == "medium" else "🟢"
            
            return f"""{emoji} **Failure Prediction**

Risk Level: **{risk_level.upper()}**
Failure Probability: {probability:.1f}%
Time Window: {prediction.get('time_window_hours', 24)} hours

**Contributing Factors:**
{self._format_list(prediction.get('factors', []))}

**Recommendations:**
{self._format_list(prediction.get('recommendations', []))}
"""
        
        elif intent.type == IntentType.FORECAST_CAPACITY:
            forecast = data.get("forecast", {})
            return f"""📈 **Capacity Forecast**

Forecast Period: {forecast.get('forecast_days', 7)} days

**Predicted Usage:**
- CPU: {forecast.get('predicted_cpu', 0):.1f}%
- Memory: {forecast.get('predicted_memory', 0):.1f}%
- Storage: {forecast.get('predicted_storage', 0):.1f}%

**Recommendation:** {forecast.get('recommendation', 'No action needed')}
"""
        
        elif intent.type == IntentType.DETECT_THREAT:
            threats = data.get("threats", [])
            count = len(threats)
            if count == 0:
                return "🟢 No threats detected. Your infrastructure is secure."
            
            severity_emoji = {"critical": "🔴", "high": "🟠", "medium": "🟡", "low": "🔵"}
            threat_list = []
            for threat in threats[:5]:
                emoji = severity_emoji.get(threat.get("severity", "low"), "⚪")
                threat_list.append(
                    f"{emoji} **{threat.get('type')}** - {threat.get('description')}"
                )
            
            return f"⚠️ **Detected {count} Threat(s)**\n\n" + "\n".join(threat_list)
        
        elif intent.type == IntentType.DETECT_ANOMALY:
            anomalies = data.get("anomalies", [])
            count = len(anomalies)
            if count == 0:
                return "✅ No anomalies detected. All metrics are within normal ranges."
            
            return f"⚠️ **Detected {count} Anomaly(ies)**\n\nUnusual patterns detected in your infrastructure metrics."
        
        # Conversation
        elif intent.type == IntentType.GREETING:
            return "👋 Hello! I'm your AI Infrastructure Assistant. How can I help you today?"
        
        elif intent.type == IntentType.HELP:
            return """🤖 **AI Infrastructure Assistant - Help**

I can help you with:

**Infrastructure Management**
- List, create, update, delete infrastructures
- View infrastructure details

**Deployments**
- Deploy applications
- Scale deployments
- List and manage deployments

**Discovery & CMDB**
- Discover cloud resources
- List and describe resources
- Query infrastructure graph
- View statistics

**AI/ML Operations**
- Predict failures
- Forecast capacity
- Detect security threats
- Detect anomalies

**Examples:**
- "List all AWS infrastructures"
- "Discover resources in us-east-1"
- "Predict failure for prod-app"
- "Show infrastructure graph"
- "Get statistics"

Try a command or ask me a question!
"""
        
        # Default
        return f"✅ Command executed successfully. Service: {response.service}"
    
    def _generate_error_message(self, intent: Intent, response: ServiceResponse) -> str:
        """Generate error message"""
        error = response.error or "Unknown error"
        return f"❌ Error executing command: {error}"
    
    def _generate_error_suggestions(self, intent: Intent, response: ServiceResponse) -> Optional[list]:
        """Generate suggestions for error recovery"""
        return [
            "Check if the service is running",
            "Verify your input parameters",
            "Try 'get health' to check system status",
            "Type 'help' for available commands"
        ]
    
    def _generate_next_steps(self, intent: Intent) -> Optional[list]:
        """Generate suggestions for next steps"""
        suggestions = {
            IntentType.LIST_INFRASTRUCTURE: [
                "Try: 'describe infrastructure <name>'",
                "Try: 'list deployments'",
            ],
            IntentType.DISCOVER_RESOURCES: [
                "Try: 'list resources'",
                "Try: 'get statistics'",
            ],
            IntentType.LIST_RESOURCES: [
                "Try: 'describe resource <id>'",
                "Try: 'show infrastructure graph'",
            ],
            IntentType.PREDICT_FAILURE: [
                "Try: 'forecast capacity'",
                "Try: 'detect threats'",
            ],
        }
        return suggestions.get(intent.type)
    
    def _format_compute_resources(self, resources: list) -> str:
        """Format compute resources for display"""
        if not resources:
            return ""
        
        lines = ["**Compute Resources:**"]
        for resource in resources[:3]:
            lines.append(
                f"- {resource.get('resourceType')}: {resource.get('cpu')} CPU, "
                f"{resource.get('memory')} GB RAM - {resource.get('status')}"
            )
        
        if len(resources) > 3:
            lines.append(f"_... and {len(resources) - 3} more_")
        
        return "\n".join(lines)
    
    def _format_metadata(self, metadata: dict) -> str:
        """Format metadata dictionary"""
        if not metadata:
            return "_No metadata_"
        
        lines = []
        for key, value in list(metadata.items())[:5]:
            if isinstance(value, (dict, list)):
                continue  # Skip complex types
            lines.append(f"- {key}: {value}")
        
        return "\n".join(lines) if lines else "_No metadata_"
    
    def _format_dict(self, d: dict) -> str:
        """Format dictionary for display"""
        if not d:
            return "_None_"
        return "\n".join(f"- {k}: {v}" for k, v in d.items())
    
    def _format_list(self, items: list) -> str:
        """Format list for display"""
        if not items:
            return "_None_"
        return "\n".join(f"- {item}" for item in items)
