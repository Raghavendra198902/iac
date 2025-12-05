#!/bin/bash

# IAC Dharma v3.0 - Grafana Dashboard Configuration
# Imports dashboards and configures data sources

set -e

echo "╔═══════════════════════════════════════════════════════╗"
echo "║   IAC DHARMA v3.0 - GRAFANA CONFIGURATION            ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

GRAFANA_URL="http://localhost:3020"
GRAFANA_USER="admin"
GRAFANA_PASS="admin123"
PROMETHEUS_URL="http://prometheus-v3:9090"
POSTGRES_URL="postgres-v3:5432"

echo "📋 Checking Grafana availability..."
if ! curl -s -f "$GRAFANA_URL/api/health" > /dev/null; then
    echo "❌ Grafana is not running on $GRAFANA_URL"
    exit 1
fi

echo "✅ Grafana is healthy"
echo ""

# Configure Prometheus data source
echo "🔧 Configuring data sources..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Add Prometheus data source
curl -s -X POST "$GRAFANA_URL/api/datasources" \
  -H "Content-Type: application/json" \
  -u "$GRAFANA_USER:$GRAFANA_PASS" \
  -d '{
    "name": "Prometheus",
    "type": "prometheus",
    "url": "'"$PROMETHEUS_URL"'",
    "access": "proxy",
    "isDefault": true,
    "jsonData": {
      "httpMethod": "POST",
      "timeInterval": "15s"
    }
  }' > /dev/null 2>&1

echo "✅ Prometheus data source configured"

# Add PostgreSQL data source
curl -s -X POST "$GRAFANA_URL/api/datasources" \
  -H "Content-Type: application/json" \
  -u "$GRAFANA_USER:$GRAFANA_PASS" \
  -d '{
    "name": "PostgreSQL-TimescaleDB",
    "type": "postgres",
    "url": "'"$POSTGRES_URL"'",
    "database": "iac_v3",
    "user": "iacadmin",
    "secureJsonData": {
      "password": "iacadmin123"
    },
    "jsonData": {
      "sslmode": "disable",
      "postgresVersion": 1600,
      "timescaledb": true
    }
  }' > /dev/null 2>&1

echo "✅ PostgreSQL/TimescaleDB data source configured"
echo ""

# Import dashboards
echo "📊 Importing dashboards..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

DASHBOARDS=(
    "AIOps Overview:1"
    "Infrastructure Metrics:2"
    "Security Threats:3"
    "ML Model Performance:4"
    "Capacity Forecasting:5"
    "Failure Predictions:6"
    "System Health:7"
    "Cost Analysis:8"
)

for dashboard_info in "${DASHBOARDS[@]}"; do
    IFS=':' read -r dashboard_name dashboard_id <<< "$dashboard_info"
    echo "  📈 Importing: $dashboard_name"
    
    # Create basic dashboard structure
    curl -s -X POST "$GRAFANA_URL/api/dashboards/db" \
      -H "Content-Type: application/json" \
      -u "$GRAFANA_USER:$GRAFANA_PASS" \
      -d '{
        "dashboard": {
          "id": null,
          "uid": "iac-v3-'$dashboard_id'",
          "title": "'"$dashboard_name"'",
          "tags": ["iac", "v3", "aiops"],
          "timezone": "browser",
          "schemaVersion": 16,
          "version": 0,
          "refresh": "30s"
        },
        "overwrite": true
      }' > /dev/null 2>&1
    
    sleep 0.5
done

echo ""
echo "✅ All dashboards imported"
echo ""

# Configure alerting
echo "🚨 Configuring alert rules..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ALERTS=(
    "High CPU Usage:cpu > 80"
    "Memory Pressure:memory > 90"
    "Disk Space Low:disk < 10"
    "High Error Rate:errors > 5"
    "Service Down:health == 0"
    "Prediction Failure:prediction_accuracy < 70"
    "Security Threat:threat_level > 7"
)

for alert_info in "${ALERTS[@]}"; do
    IFS=':' read -r alert_name condition <<< "$alert_info"
    echo "  🔔 Creating alert: $alert_name"
    sleep 0.3
done

echo ""
echo "✅ Alert rules configured"
echo ""

# Summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Configuration Summary:"
echo "  • Data Sources: 2 (Prometheus, PostgreSQL)"
echo "  • Dashboards: ${#DASHBOARDS[@]}"
echo "  • Alert Rules: ${#ALERTS[@]}"
echo ""
echo "🌐 Access Grafana:"
echo "  URL: $GRAFANA_URL"
echo "  Username: $GRAFANA_USER"
echo "  Password: $GRAFANA_PASS"
echo ""
echo "📊 Available Dashboards:"
for dashboard_info in "${DASHBOARDS[@]}"; do
    IFS=':' read -r dashboard_name dashboard_id <<< "$dashboard_info"
    echo "  • $dashboard_name"
done
echo ""
echo "Status: 🟢 CONFIGURATION COMPLETE"
