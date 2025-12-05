# Low-Level Design: Kafka Integration v3.0

## 1. Overview

**Purpose**: Event-driven architecture for real-time data streaming  
**Technology**: Apache Kafka 3.6  
**Ports**: 9092 (external), 9093 (internal)

## 2. Topic Architecture

### 2.1 Topic Structure

```
iac-dharma-v3/
├── metrics                    (Partitions: 10, Replication: 3)
├── logs                       (Partitions: 10, Replication: 3)
├── events                     (Partitions: 5, Replication: 3)
├── traces                     (Partitions: 5, Replication: 3)
├── predictions                (Partitions: 3, Replication: 3)
├── anomalies                  (Partitions: 3, Replication: 3)
├── remediations               (Partitions: 3, Replication: 3)
├── infrastructure_changes     (Partitions: 5, Replication: 3)
└── alerts                     (Partitions: 3, Replication: 3)
```

### 2.2 Topic Configuration

```bash
# metrics topic
kafka-topics.sh --create \
  --bootstrap-server localhost:9092 \
  --topic metrics \
  --partitions 10 \
  --replication-factor 3 \
  --config retention.ms=604800000 \      # 7 days
  --config compression.type=gzip \
  --config segment.ms=3600000            # 1 hour

# predictions topic  
kafka-topics.sh --create \
  --bootstrap-server localhost:9092 \
  --topic predictions \
  --partitions 3 \
  --replication-factor 3 \
  --config retention.ms=2592000000 \     # 30 days
  --config compression.type=gzip

# anomalies topic
kafka-topics.sh --create \
  --bootstrap-server localhost:9092 \
  --topic anomalies \
  --partitions 3 \
  --replication-factor 3 \
  --config retention.ms=2592000000 \     # 30 days
  --config cleanup.policy=compact
```

## 3. Message Schemas (Avro)

### 3.1 Metric Message Schema

```json
{
  "type": "record",
  "name": "Metric",
  "namespace": "com.iacdharma.v3.metrics",
  "fields": [
    {"name": "timestamp", "type": "long"},
    {"name": "service", "type": "string"},
    {"name": "metric_name", "type": "string"},
    {"name": "value", "type": "double"},
    {"name": "labels", "type": {"type": "map", "values": "string"}},
    {"name": "node", "type": ["null", "string"], "default": null},
    {"name": "unit", "type": ["null", "string"], "default": null}
  ]
}
```

### 3.2 Prediction Message Schema

```json
{
  "type": "record",
  "name": "Prediction",
  "namespace": "com.iacdharma.v3.predictions",
  "fields": [
    {"name": "id", "type": "string"},
    {"name": "prediction_type", "type": {
      "type": "enum",
      "name": "PredictionType",
      "symbols": ["FAILURE", "CAPACITY", "COST", "THREAT", "CHURN"]
    }},
    {"name": "service", "type": "string"},
    {"name": "probability", "type": "double"},
    {"name": "confidence", "type": "double"},
    {"name": "predicted_time", "type": ["null", "long"], "default": null},
    {"name": "timestamp", "type": "long"},
    {"name": "severity", "type": {
      "type": "enum",
      "name": "Severity",
      "symbols": ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INFO"]
    }},
    {"name": "affected_components", "type": {"type": "array", "items": "string"}},
    {"name": "recommended_actions", "type": {"type": "array", "items": "string"}},
    {"name": "details", "type": {"type": "map", "values": "string"}}
  ]
}
```

### 3.3 Anomaly Message Schema

```json
{
  "type": "record",
  "name": "Anomaly",
  "namespace": "com.iacdharma.v3.anomalies",
  "fields": [
    {"name": "id", "type": "string"},
    {"name": "service", "type": "string"},
    {"name": "timestamp", "type": "long"},
    {"name": "is_anomaly", "type": "boolean"},
    {"name": "anomaly_score", "type": "double"},
    {"name": "affected_metrics", "type": {"type": "array", "items": "string"}},
    {"name": "severity", "type": "string"},
    {"name": "root_cause", "type": ["null", "string"], "default": null},
    {"name": "remediation_suggested", "type": "boolean", "default": false}
  ]
}
```

## 4. Producer Implementation

### 4.1 High-Performance Producer (Node.js)

```typescript
// src/kafka/producer.ts

import { Kafka, Producer, ProducerRecord } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

export class KafkaProducerService {
  private producer: Producer;
  private registry: SchemaRegistry;
  
  constructor() {
    const kafka = new Kafka({
      clientId: 'iac-dharma-v3-producer',
      brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
      retry: {
        initialRetryTime: 100,
        retries: 8,
      },
      compression: 'gzip',
    });
    
    this.producer = kafka.producer({
      allowAutoTopicCreation: false,
      transactionTimeout: 30000,
      idempotent: true, // Exactly-once semantics
      maxInFlightRequests: 5,
      compression: 'gzip',
    });
    
    this.registry = new SchemaRegistry({
      host: process.env.SCHEMA_REGISTRY_URL || 'http://localhost:8081',
    });
  }
  
  async connect(): Promise<void> {
    await this.producer.connect();
  }
  
  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }
  
  async sendMetric(metric: {
    service: string;
    metricName: string;
    value: number;
    labels?: Record<string, string>;
    node?: string;
  }): Promise<void> {
    const schemaId = await this.registry.getLatestSchemaId('metrics-value');
    
    const message = {
      timestamp: Date.now(),
      service: metric.service,
      metric_name: metric.metricName,
      value: metric.value,
      labels: metric.labels || {},
      node: metric.node || null,
      unit: null,
    };
    
    const encodedValue = await this.registry.encode(schemaId, message);
    
    await this.producer.send({
      topic: 'metrics',
      messages: [{
        key: `${metric.service}:${metric.metricName}`,
        value: encodedValue,
        timestamp: message.timestamp.toString(),
      }],
    });
  }
  
  async sendPrediction(prediction: any): Promise<void> {
    const schemaId = await this.registry.getLatestSchemaId('predictions-value');
    const encodedValue = await this.registry.encode(schemaId, prediction);
    
    await this.producer.send({
      topic: 'predictions',
      messages: [{
        key: prediction.id,
        value: encodedValue,
      }],
    });
  }
  
  async sendBatch(records: ProducerRecord[]): Promise<void> {
    const batch = this.producer.sendBatch({
      topicMessages: records,
      acks: -1, // Wait for all in-sync replicas
      timeout: 30000,
    });
    
    await batch;
  }
}
```

### 4.2 Transactional Producer (Python)

```python
# src/kafka/producer.py

from confluent_kafka import Producer
from confluent_kafka.schema_registry import SchemaRegistryClient
from confluent_kafka.schema_registry.avro import AvroSerializer
import json
from typing import Dict, Any

class KafkaProducerService:
    def __init__(self, bootstrap_servers: str = 'localhost:9092'):
        self.config = {
            'bootstrap.servers': bootstrap_servers,
            'client.id': 'iac-dharma-v3-aiops',
            'compression.type': 'gzip',
            'acks': 'all',
            'enable.idempotence': True,
            'max.in.flight.requests.per.connection': 5,
            'retries': 10,
        }
        
        self.producer = Producer(self.config)
        
        # Schema Registry
        self.schema_registry = SchemaRegistryClient({
            'url': 'http://localhost:8081'
        })
        
    def send_metric(self, service: str, metric_name: str, value: float, 
                   labels: Dict[str, str] = None):
        """Send metric to Kafka"""
        message = {
            'timestamp': int(time.time() * 1000),
            'service': service,
            'metric_name': metric_name,
            'value': value,
            'labels': labels or {},
            'node': None,
            'unit': None,
        }
        
        key = f"{service}:{metric_name}"
        
        self.producer.produce(
            topic='metrics',
            key=key.encode('utf-8'),
            value=json.dumps(message).encode('utf-8'),
            callback=self._delivery_callback
        )
        
        # Trigger delivery
        self.producer.poll(0)
    
    def send_prediction(self, prediction: Dict[str, Any]):
        """Send prediction to Kafka"""
        self.producer.produce(
            topic='predictions',
            key=prediction['id'].encode('utf-8'),
            value=json.dumps(prediction).encode('utf-8'),
            callback=self._delivery_callback
        )
        self.producer.poll(0)
    
    def _delivery_callback(self, err, msg):
        """Delivery callback"""
        if err:
            logger.error(f'Message delivery failed: {err}')
        else:
            logger.debug(f'Message delivered to {msg.topic()} [{msg.partition()}]')
    
    def flush(self, timeout: float = 10.0):
        """Flush pending messages"""
        remaining = self.producer.flush(timeout)
        if remaining > 0:
            logger.warning(f'{remaining} messages not delivered')
```

## 5. Consumer Implementation

### 5.1 Metrics Consumer (TimescaleDB Sink)

```python
# src/kafka/consumers/metrics_consumer.py

from confluent_kafka import Consumer, KafkaError
import asyncpg
import asyncio
from typing import List

class MetricsConsumer:
    def __init__(self, db_pool: asyncpg.Pool):
        self.config = {
            'bootstrap.servers': 'localhost:9092',
            'group.id': 'metrics-timescaledb-sink',
            'auto.offset.reset': 'earliest',
            'enable.auto.commit': False,
            'max.poll.interval.ms': 300000,
        }
        
        self.consumer = Consumer(self.config)
        self.db_pool = db_pool
        self.batch_size = 1000
        self.batch_timeout = 5.0  # seconds
        
    async def start(self):
        """Start consuming metrics"""
        self.consumer.subscribe(['metrics'])
        
        batch = []
        last_commit = time.time()
        
        while True:
            msg = self.consumer.poll(timeout=1.0)
            
            if msg is None:
                continue
            
            if msg.error():
                if msg.error().code() == KafkaError._PARTITION_EOF:
                    continue
                else:
                    logger.error(f'Consumer error: {msg.error()}')
                    break
            
            # Parse message
            metric = json.loads(msg.value().decode('utf-8'))
            batch.append(metric)
            
            # Flush batch if size or timeout reached
            if len(batch) >= self.batch_size or \
               time.time() - last_commit > self.batch_timeout:
                await self._flush_batch(batch)
                batch = []
                
                # Commit offset
                self.consumer.commit(asynchronous=False)
                last_commit = time.time()
    
    async def _flush_batch(self, batch: List[Dict]):
        """Flush metrics batch to TimescaleDB"""
        if not batch:
            return
        
        query = """
            INSERT INTO metrics (time, service_name, metric_name, value, labels, node)
            VALUES ($1, $2, $3, $4, $5, $6)
        """
        
        async with self.db_pool.acquire() as conn:
            await conn.executemany(
                query,
                [(
                    datetime.fromtimestamp(m['timestamp'] / 1000),
                    m['service'],
                    m['metric_name'],
                    m['value'],
                    json.dumps(m['labels']),
                    m.get('node')
                ) for m in batch]
            )
        
        logger.info(f'Flushed {len(batch)} metrics to TimescaleDB')
```

### 5.2 Anomaly Consumer (Alert Handler)

```typescript
// src/kafka/consumers/anomalyConsumer.ts

import { Kafka, Consumer } from 'kafkajs';
import { AlertService } from '../../services/alertService';

export class AnomalyConsumer {
  private consumer: Consumer;
  private alertService: AlertService;
  
  constructor(alertService: AlertService) {
    const kafka = new Kafka({
      clientId: 'anomaly-alert-handler',
      brokers: ['localhost:9092'],
    });
    
    this.consumer = kafka.consumer({
      groupId: 'anomaly-alerts',
      sessionTimeout: 30000,
      heartbeatInterval: 3000,
    });
    
    this.alertService = alertService;
  }
  
  async start(): Promise<void> {
    await this.consumer.connect();
    await this.consumer.subscribe({ topic: 'anomalies', fromBeginning: false });
    
    await this.consumer.run({
      autoCommit: true,
      autoCommitInterval: 5000,
      eachMessage: async ({ topic, partition, message }) => {
        const anomaly = JSON.parse(message.value?.toString() || '{}');
        
        if (anomaly.is_anomaly && anomaly.severity in ['critical', 'high']) {
          // Send alert
          await this.alertService.sendAlert({
            type: 'anomaly',
            severity: anomaly.severity,
            service: anomaly.service,
            message: `Anomaly detected: ${anomaly.affected_metrics.join(', ')}`,
            details: anomaly,
          });
          
          // Check if auto-remediation needed
          if (anomaly.remediation_suggested) {
            await this.triggerRemediation(anomaly);
          }
        }
      },
    });
  }
  
  private async triggerRemediation(anomaly: any): Promise<void> {
    // Call AIOps Engine for auto-remediation
    await fetch('http://aiops-engine:8100/api/v3/aiops/remediate/auto', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        incident_id: anomaly.id,
        service_name: anomaly.service,
        issue_type: 'anomaly',
        severity: anomaly.severity,
        auto_execute: true,
      }),
    });
  }
}
```

## 6. Kafka Streams Processing

### 6.1 Metrics Aggregation Stream

```java
// src/kafka/streams/MetricsAggregationStream.java

import org.apache.kafka.streams.KafkaStreams;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.kstream.*;

public class MetricsAggregationStream {
    
    public static void main(String[] args) {
        Properties props = new Properties();
        props.put(StreamsConfig.APPLICATION_ID_CONFIG, "metrics-aggregation");
        props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        
        StreamsBuilder builder = new StreamsBuilder();
        
        // Read metrics stream
        KStream<String, Metric> metrics = builder.stream(
            "metrics",
            Consumed.with(Serdes.String(), new MetricSerde())
        );
        
        // Aggregate by service and metric (1-minute windows)
        KTable<Windowed<String>, MetricAggregate> aggregated = metrics
            .groupBy(
                (key, metric) -> metric.getService() + ":" + metric.getMetricName(),
                Grouped.with(Serdes.String(), new MetricSerde())
            )
            .windowedBy(TimeWindows.of(Duration.ofMinutes(1)))
            .aggregate(
                MetricAggregate::new,
                (key, metric, aggregate) -> {
                    aggregate.addValue(metric.getValue());
                    return aggregate;
                },
                Materialized.with(Serdes.String(), new MetricAggregateSerde())
            );
        
        // Write aggregated metrics
        aggregated
            .toStream()
            .map((key, aggregate) -> KeyValue.pair(
                key.key(),
                new AggregatedMetric(
                    key.key(),
                    aggregate.getMin(),
                    aggregate.getMax(),
                    aggregate.getAvg(),
                    aggregate.getP95(),
                    aggregate.getP99(),
                    key.window().start(),
                    key.window().end()
                )
            ))
            .to("metrics-aggregated", Produced.with(Serdes.String(), new AggregatedMetricSerde()));
        
        KafkaStreams streams = new KafkaStreams(builder.build(), props);
        streams.start();
        
        Runtime.getRuntime().addShutdownHook(new Thread(streams::close));
    }
}
```

## 7. Schema Registry Integration

### 7.1 Register Schemas

```bash
# Register Metric schema
curl -X POST http://localhost:8081/subjects/metrics-value/versions \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d @schemas/metric.avsc

# Register Prediction schema
curl -X POST http://localhost:8081/subjects/predictions-value/versions \
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \
  -d @schemas/prediction.avsc
```

### 7.2 Schema Evolution

```python
# src/kafka/schema_evolution.py

from confluent_kafka.schema_registry import SchemaRegistryClient

def evolve_metric_schema():
    """Add new field to metric schema (backward compatible)"""
    
    registry = SchemaRegistryClient({'url': 'http://localhost:8081'})
    
    new_schema = """
    {
      "type": "record",
      "name": "Metric",
      "namespace": "com.iacdharma.v3.metrics",
      "fields": [
        {"name": "timestamp", "type": "long"},
        {"name": "service", "type": "string"},
        {"name": "metric_name", "type": "string"},
        {"name": "value", "type": "double"},
        {"name": "labels", "type": {"type": "map", "values": "string"}},
        {"name": "node", "type": ["null", "string"], "default": null},
        {"name": "unit", "type": ["null", "string"], "default": null},
        {"name": "environment", "type": ["null", "string"], "default": null}
      ]
    }
    """
    
    # Register new version
    registry.register_schema('metrics-value', new_schema)
```

## 8. Monitoring & Observability

### 8.1 Kafka Metrics Exporter

```yaml
# prometheus-kafka-exporter.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: kafka-exporter-config
data:
  config.yml: |
    kafka:
      brokers:
        - kafka-0.kafka-headless:9092
        - kafka-1.kafka-headless:9092
        - kafka-2.kafka-headless:9092
      version: 3.6.0
    
    metrics:
      - name: kafka_topic_partition_current_offset
        help: Current offset of a partition
        type: gauge
        labels:
          - topic
          - partition
      
      - name: kafka_consumer_group_lag
        help: Current lag of a consumer group
        type: gauge
        labels:
          - group
          - topic
          - partition
```

### 8.2 Consumer Lag Monitoring

```python
# src/kafka/monitoring/lag_monitor.py

from confluent_kafka.admin import AdminClient

def monitor_consumer_lag():
    """Monitor consumer lag for all groups"""
    
    admin = AdminClient({'bootstrap.servers': 'localhost:9092'})
    
    # Get consumer groups
    groups = admin.list_consumer_groups()
    
    for group in groups:
        # Get group offsets
        offsets = admin.list_consumer_group_offsets(group.group_id)
        
        for topic_partition, offset in offsets.items():
            # Get high water mark
            watermarks = admin.get_watermark_offsets(topic_partition)
            
            lag = watermarks.high - offset.offset
            
            # Alert if lag > threshold
            if lag > 10000:
                logger.warning(
                    f'High lag detected: group={group.group_id}, '
                    f'topic={topic_partition.topic}, '
                    f'partition={topic_partition.partition}, '
                    f'lag={lag}'
                )
```

## 9. Performance Tuning

### 9.1 Producer Configuration

```properties
# High-throughput producer
acks=1
compression.type=snappy
batch.size=32768
linger.ms=10
buffer.memory=67108864

# Low-latency producer
acks=1
compression.type=lz4
batch.size=16384
linger.ms=0
buffer.memory=33554432
```

### 9.2 Consumer Configuration

```properties
# High-throughput consumer
fetch.min.bytes=1048576
fetch.max.wait.ms=500
max.partition.fetch.bytes=2097152

# Real-time consumer
fetch.min.bytes=1
fetch.max.wait.ms=100
max.partition.fetch.bytes=1048576
```

## 10. Disaster Recovery

### 10.1 Backup Strategy

```bash
#!/bin/bash
# backup-kafka-topics.sh

TOPICS="metrics logs events predictions anomalies"
BACKUP_DIR="/backup/kafka/$(date +%Y%m%d)"

mkdir -p $BACKUP_DIR

for topic in $TOPICS; do
  kafka-console-consumer \
    --bootstrap-server localhost:9092 \
    --topic $topic \
    --from-beginning \
    --max-messages 1000000 \
    --timeout-ms 10000 > "$BACKUP_DIR/$topic.json"
done
```

### 10.2 Replay Messages

```python
# src/kafka/replay.py

async def replay_messages(topic: str, start_offset: int, end_offset: int):
    """Replay messages from specific offset range"""
    
    consumer = Consumer({
        'bootstrap.servers': 'localhost:9092',
        'group.id': f'replay-{uuid.uuid4()}',
        'auto.offset.reset': 'earliest',
        'enable.auto.commit': False,
    })
    
    # Assign specific partition and seek
    partition = TopicPartition(topic, 0, start_offset)
    consumer.assign([partition])
    consumer.seek(partition)
    
    replayed = 0
    while replayed < (end_offset - start_offset):
        msg = consumer.poll(1.0)
        if msg and not msg.error():
            # Process message
            await process_message(msg)
            replayed += 1
    
    consumer.close()
```

---

**Document Version**: 1.0  
**Last Updated**: December 5, 2025  
**Status**: Ready for Implementation
