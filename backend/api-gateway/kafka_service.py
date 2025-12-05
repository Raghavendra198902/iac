"""
Kafka Integration for IAC Dharma v3.0

Provides message streaming for:
- Real-time metrics
- Event processing
- AIOps predictions
- Infrastructure changes
"""

from aiokafka import AIOKafkaProducer, AIOKafkaConsumer
from aiokafka.errors import KafkaError
import json
import logging
from typing import Dict, Any, Callable, List
from datetime import datetime
import asyncio

logger = logging.getLogger(__name__)

# ============================================================================
# Kafka Topics
# ============================================================================

class KafkaTopics:
    """Kafka topic names"""
    METRICS = "metrics"
    LOGS = "logs"
    EVENTS = "events"
    TRACES = "traces"
    PREDICTIONS = "predictions"
    ANOMALIES = "anomalies"
    REMEDIATIONS = "remediations"
    INFRASTRUCTURE_CHANGES = "infrastructure_changes"
    ALERTS = "alerts"

# ============================================================================
# Kafka Producer
# ============================================================================

class KafkaProducerService:
    """Kafka producer for publishing messages"""
    
    def __init__(self, bootstrap_servers: str = "localhost:9092"):
        self.bootstrap_servers = bootstrap_servers
        self.producer: AIOKafkaProducer = None
        
    async def start(self):
        """Start Kafka producer"""
        try:
            self.producer = AIOKafkaProducer(
                bootstrap_servers=self.bootstrap_servers,
                value_serializer=lambda v: json.dumps(v).encode('utf-8'),
                compression_type='gzip',
                acks='all',  # Wait for all replicas
                retries=3
            )
            await self.producer.start()
            logger.info(f"Kafka producer started: {self.bootstrap_servers}")
        except Exception as e:
            logger.error(f"Failed to start Kafka producer: {e}")
            raise
    
    async def stop(self):
        """Stop Kafka producer"""
        if self.producer:
            await self.producer.stop()
            logger.info("Kafka producer stopped")
    
    async def send_message(
        self,
        topic: str,
        message: Dict[str, Any],
        key: str = None
    ):
        """Send message to Kafka topic"""
        try:
            # Add timestamp
            message['timestamp'] = datetime.now().isoformat()
            
            # Send to Kafka
            key_bytes = key.encode('utf-8') if key else None
            await self.producer.send_and_wait(
                topic,
                value=message,
                key=key_bytes
            )
            
            logger.debug(f"Message sent to {topic}: {message.get('id', 'N/A')}")
            
        except KafkaError as e:
            logger.error(f"Failed to send message to {topic}: {e}")
            raise
    
    async def send_metric(
        self,
        service_name: str,
        metric_name: str,
        value: float,
        labels: Dict[str, str] = None
    ):
        """Send metric to Kafka"""
        message = {
            "type": "metric",
            "service": service_name,
            "metric": metric_name,
            "value": value,
            "labels": labels or {},
        }
        await self.send_message(KafkaTopics.METRICS, message, key=service_name)
    
    async def send_event(
        self,
        event_type: str,
        service_name: str,
        details: Dict[str, Any]
    ):
        """Send event to Kafka"""
        message = {
            "type": event_type,
            "service": service_name,
            "details": details,
        }
        await self.send_message(KafkaTopics.EVENTS, message, key=service_name)
    
    async def send_prediction(
        self,
        prediction_id: str,
        prediction_type: str,
        service_name: str,
        probability: float,
        details: Dict[str, Any]
    ):
        """Send AI prediction to Kafka"""
        message = {
            "id": prediction_id,
            "type": prediction_type,
            "service": service_name,
            "probability": probability,
            "details": details,
        }
        await self.send_message(KafkaTopics.PREDICTIONS, message, key=prediction_id)
    
    async def send_anomaly(
        self,
        anomaly_id: str,
        service_name: str,
        severity: str,
        description: str,
        affected_metrics: List[str]
    ):
        """Send anomaly alert to Kafka"""
        message = {
            "id": anomaly_id,
            "service": service_name,
            "severity": severity,
            "description": description,
            "affected_metrics": affected_metrics,
        }
        await self.send_message(KafkaTopics.ANOMALIES, message, key=anomaly_id)
    
    async def send_remediation(
        self,
        remediation_id: str,
        incident_id: str,
        action: str,
        status: str,
        details: Dict[str, Any]
    ):
        """Send remediation action to Kafka"""
        message = {
            "id": remediation_id,
            "incident_id": incident_id,
            "action": action,
            "status": status,
            "details": details,
        }
        await self.send_message(KafkaTopics.REMEDIATIONS, message, key=remediation_id)

# ============================================================================
# Kafka Consumer
# ============================================================================

class KafkaConsumerService:
    """Kafka consumer for processing messages"""
    
    def __init__(
        self,
        bootstrap_servers: str = "localhost:9092",
        group_id: str = "iac-dharma"
    ):
        self.bootstrap_servers = bootstrap_servers
        self.group_id = group_id
        self.consumers: Dict[str, AIOKafkaConsumer] = {}
        self.handlers: Dict[str, Callable] = {}
        self.running = False
        
    async def start(self):
        """Start Kafka consumer"""
        self.running = True
        logger.info(f"Kafka consumer service started: {self.group_id}")
    
    async def stop(self):
        """Stop Kafka consumer"""
        self.running = False
        
        # Stop all consumers
        for topic, consumer in self.consumers.items():
            await consumer.stop()
            logger.info(f"Consumer stopped for topic: {topic}")
        
        logger.info("Kafka consumer service stopped")
    
    async def subscribe(
        self,
        topic: str,
        handler: Callable[[Dict[str, Any]], None]
    ):
        """Subscribe to Kafka topic with handler"""
        try:
            # Create consumer for topic
            consumer = AIOKafkaConsumer(
                topic,
                bootstrap_servers=self.bootstrap_servers,
                group_id=self.group_id,
                value_deserializer=lambda m: json.loads(m.decode('utf-8')),
                auto_offset_reset='latest',
                enable_auto_commit=True
            )
            
            await consumer.start()
            self.consumers[topic] = consumer
            self.handlers[topic] = handler
            
            logger.info(f"Subscribed to topic: {topic}")
            
            # Start consuming messages
            asyncio.create_task(self._consume_messages(topic))
            
        except Exception as e:
            logger.error(f"Failed to subscribe to {topic}: {e}")
            raise
    
    async def _consume_messages(self, topic: str):
        """Consume messages from topic"""
        consumer = self.consumers[topic]
        handler = self.handlers[topic]
        
        try:
            async for message in consumer:
                if not self.running:
                    break
                
                try:
                    # Process message
                    await handler(message.value)
                    
                except Exception as e:
                    logger.error(f"Error processing message from {topic}: {e}")
                    # Continue processing other messages
                    
        except Exception as e:
            logger.error(f"Consumer error for {topic}: {e}")

# ============================================================================
# Message Handlers (Examples)
# ============================================================================

async def handle_metric(message: Dict[str, Any]):
    """Handle metric message"""
    logger.info(f"Metric received: {message.get('service')}.{message.get('metric')} = {message.get('value')}")
    # TODO: Store in TimescaleDB
    
async def handle_event(message: Dict[str, Any]):
    """Handle event message"""
    logger.info(f"Event received: {message.get('type')} from {message.get('service')}")
    # TODO: Process event
    
async def handle_prediction(message: Dict[str, Any]):
    """Handle AI prediction"""
    logger.info(f"Prediction received: {message.get('type')} for {message.get('service')}")
    # TODO: Store prediction, trigger alerts if needed
    
async def handle_anomaly(message: Dict[str, Any]):
    """Handle anomaly alert"""
    logger.warning(f"Anomaly detected: {message.get('service')} - {message.get('description')}")
    # TODO: Trigger remediation if needed
    
async def handle_remediation(message: Dict[str, Any]):
    """Handle remediation action"""
    logger.info(f"Remediation: {message.get('action')} - {message.get('status')}")
    # TODO: Update remediation status

# ============================================================================
# Kafka Service Factory
# ============================================================================

class KafkaService:
    """Unified Kafka service"""
    
    def __init__(self, bootstrap_servers: str = "localhost:9092"):
        self.producer = KafkaProducerService(bootstrap_servers)
        self.consumer = KafkaConsumerService(bootstrap_servers)
    
    async def start(self):
        """Start Kafka services"""
        await self.producer.start()
        await self.consumer.start()
        
        # Subscribe to topics with handlers
        await self.consumer.subscribe(KafkaTopics.METRICS, handle_metric)
        await self.consumer.subscribe(KafkaTopics.EVENTS, handle_event)
        await self.consumer.subscribe(KafkaTopics.PREDICTIONS, handle_prediction)
        await self.consumer.subscribe(KafkaTopics.ANOMALIES, handle_anomaly)
        await self.consumer.subscribe(KafkaTopics.REMEDIATIONS, handle_remediation)
        
        logger.info("Kafka service fully started")
    
    async def stop(self):
        """Stop Kafka services"""
        await self.consumer.stop()
        await self.producer.stop()
        logger.info("Kafka service stopped")

# Global Kafka service instance
kafka_service = KafkaService()
