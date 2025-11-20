#!/bin/bash

echo "🧪 Testing WebSocket Real-Time Updates"
echo "======================================"
echo ""
echo "✅ API Gateway: http://localhost:3000"
echo "✅ Frontend Dashboard: http://localhost:5173/security"
echo ""
echo "📡 Sending test enforcement event..."
echo ""

# Send enforcement event
curl -X POST http://localhost:3000/api/enforcement/events \
  -H "Content-Type: application/json" \
  -H "X-Agent-Name: rrd-VMware-Virtual-Platform" \
  -d '{
    "events": [{
      "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)'",
      "type": "policy_triggered",
      "policyId": "usb-device-block",
      "policyName": "USB Device Block - WebSocket Test",
      "severity": "high",
      "event": {
        "type": "usb_device_connected",
        "deviceType": "usb",
        "vendorId": "0xABCD",
        "productId": "0x1234",
        "deviceName": "Test USB Device"
      },
      "results": [{
        "actionType": "block",
        "success": true
      }],
      "metadata": {
        "reason": "Real-time WebSocket update demonstration"
      }
    }]
  }' 2>/dev/null | python3 -m json.tool

echo ""
echo ""
echo "⚡ Event sent! Check your dashboard at http://localhost:5173/security"
echo "   • Event should appear INSTANTLY (< 100ms)"
echo "   • Look for green 'Live' indicator showing WebSocket connection"
echo "   • No page refresh needed!"
echo ""
echo "🔄 Checking WebSocket connections..."
docker logs dharma-api-gateway 2>&1 | grep -E "Client connected|WebSocket" | tail -3
