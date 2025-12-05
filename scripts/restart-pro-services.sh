#!/bin/bash

# Restart services with Pro Agent enhancements

echo "🔄 Restarting services with Pro Agent enhancements..."
echo ""

# Services to restart
services=(
    "dharma-automation-engine"
    "dharma-guardrails"
    "dharma-monitoring-service"
)

for service in "${services[@]}"; do
    echo "Restarting $service..."
    docker-compose restart "$service"
    
    # Wait for health check
    echo "Waiting for $service to be healthy..."
    for i in {1..30}; do
        health=$(docker inspect --format='{{.State.Health.Status}}' "$service" 2>/dev/null || echo "unknown")
        if [ "$health" == "healthy" ]; then
            echo "✅ $service is healthy"
            break
        fi
        echo -n "."
        sleep 2
    done
    echo ""
done

echo ""
echo "✅ All services restarted"
echo ""
echo "📊 Service Status:"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "dharma-(automation|guardrails|monitoring|ai-engine)"
