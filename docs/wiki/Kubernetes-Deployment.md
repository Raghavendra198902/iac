# Kubernetes Deployment

Deploy IAC Dharma on Kubernetes for production scalability.

---

## Prerequisites

```bash
# Kubernetes 1.28+
kubectl version --client

# Helm 3.12+
helm version

# kubectl installed and configured
kubectl cluster-info
```

---

## Quick Start

### Deploy with Helm

```bash
# Add Helm repository (when available)
helm repo add iac-dharma https://charts.iacdharma.io
helm repo update

# Install IAC Dharma
helm install iac-dharma iac-dharma/iac-dharma \
  --namespace iac-dharma \
  --create-namespace \
  --set ingress.enabled=true \
  --set ingress.hosts[0].host=iac.yourdomain.com
```

### Deploy with kubectl

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/base/
kubectl apply -f k8s/overlays/production/

# Verify deployment
kubectl get pods -n iac-dharma
```

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│               Ingress Controller                 │
│          (NGINX / Traefik / Kong)               │
└────────────┬────────────────────────────────────┘
             │
      ┌──────┴──────┐
      │   Service   │
      │  (ClusterIP)│
      └──────┬──────┘
             │
   ┌─────────┴─────────┐
   │   API Gateway     │
   │  (Deployment 3x)  │
   └─────────┬─────────┘
             │
   ┌─────────┴──────────────┬──────────────┐
   │                        │              │
   ▼                        ▼              ▼
┌─────────┐          ┌─────────┐    ┌──────────┐
│Blueprint│          │   IAC   │    │  Cloud   │
│ Service │          │Generator│    │ Provider │
│(Deploy) │          │(Deploy) │    │ (Deploy) │
└─────────┘          └─────────┘    └──────────┘
     │                     │              │
     └─────────────────────┴──────────────┘
                           │
         ┌─────────────────┴────────────────┐
         │                                  │
         ▼                                  ▼
   ┌──────────┐                      ┌──────────┐
   │PostgreSQL│                      │  Redis   │
   │StatefulSet│                      │StatefulSet│
   └──────────┘                      └──────────┘
```

---

## Namespace Setup

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: iac-dharma
  labels:
    app.kubernetes.io/name: iac-dharma
    app.kubernetes.io/version: "1.0.0"
```

```bash
kubectl apply -f namespace.yaml
```

---

## ConfigMaps & Secrets

### ConfigMap

```yaml
# configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: iac-dharma-config
  namespace: iac-dharma
data:
  NODE_ENV: "production"
  DB_HOST: "postgres"
  DB_PORT: "5432"
  DB_NAME: "iac_dharma"
  REDIS_HOST: "redis"
  REDIS_PORT: "6379"
  JAEGER_ENDPOINT: "http://jaeger:14268/api/traces"
```

### Secrets

```bash
# Create secrets
kubectl create secret generic iac-dharma-secrets \
  --from-literal=db-password=your_db_password \
  --from-literal=jwt-secret=your_jwt_secret \
  --from-literal=redis-password=your_redis_password \
  --namespace=iac-dharma

# Or from file
kubectl create secret generic iac-dharma-secrets \
  --from-env-file=.env.production \
  --namespace=iac-dharma
```

---

## Database Deployment

### PostgreSQL StatefulSet

```yaml
# postgres-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: iac-dharma
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:15-alpine
        ports:
        - containerPort: 5432
          name: postgres
        env:
        - name: POSTGRES_DB
          value: iac_dharma
        - name: POSTGRES_USER
          value: dharma_admin
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: iac-dharma-secrets
              key: db-password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 20Gi
```

### PostgreSQL Service

```yaml
# postgres-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: iac-dharma
spec:
  selector:
    app: postgres
  ports:
  - port: 5432
    targetPort: 5432
  clusterIP: None
```

---

## Redis Deployment

```yaml
# redis-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: redis
  namespace: iac-dharma
spec:
  serviceName: redis
  replicas: 1
  selector:
    matchLabels:
      app: redis
  template:
    metadata:
      labels:
        app: redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379
          name: redis
        volumeMounts:
        - name: redis-storage
          mountPath: /data
  volumeClaimTemplates:
  - metadata:
      name: redis-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
```

---

## Application Deployments

### API Gateway

```yaml
# api-gateway-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api-gateway
  namespace: iac-dharma
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api-gateway
  template:
    metadata:
      labels:
        app: api-gateway
    spec:
      containers:
      - name: api-gateway
        image: iacdharma/api-gateway:1.0.0
        ports:
        - containerPort: 3000
        envFrom:
        - configMapRef:
            name: iac-dharma-config
        env:
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: iac-dharma-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

### Service

```yaml
# api-gateway-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  namespace: iac-dharma
spec:
  selector:
    app: api-gateway
  ports:
  - port: 3000
    targetPort: 3000
  type: ClusterIP
```

---

## Ingress Configuration

### NGINX Ingress

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: iac-dharma
  namespace: iac-dharma
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - iac.yourdomain.com
    secretName: iac-dharma-tls
  rules:
  - host: iac.yourdomain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-gateway
            port:
              number: 3000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: frontend
            port:
              number: 80
```

---

## Monitoring Stack

### Prometheus

```yaml
# prometheus-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: prometheus
  namespace: iac-dharma
spec:
  replicas: 1
  selector:
    matchLabels:
      app: prometheus
  template:
    metadata:
      labels:
        app: prometheus
    spec:
      containers:
      - name: prometheus
        image: prom/prometheus:latest
        ports:
        - containerPort: 9090
        volumeMounts:
        - name: config
          mountPath: /etc/prometheus
        - name: storage
          mountPath: /prometheus
      volumes:
      - name: config
        configMap:
          name: prometheus-config
      - name: storage
        persistentVolumeClaim:
          claimName: prometheus-storage
```

---

## Autoscaling

### Horizontal Pod Autoscaler

```yaml
# hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
  namespace: iac-dharma
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

---

## Persistent Volumes

### Storage Class

```yaml
# storageclass.yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: iac-dharma-ssd
provisioner: kubernetes.io/aws-ebs
parameters:
  type: gp3
  iops: "3000"
  throughput: "125"
allowVolumeExpansion: true
```

---

## Deployment Commands

```bash
# Deploy everything
kubectl apply -k k8s/overlays/production/

# Check deployment status
kubectl rollout status deployment/api-gateway -n iac-dharma

# View logs
kubectl logs -f deployment/api-gateway -n iac-dharma

# Scale deployment
kubectl scale deployment api-gateway --replicas=5 -n iac-dharma

# Update image
kubectl set image deployment/api-gateway \
  api-gateway=iacdharma/api-gateway:1.1.0 \
  -n iac-dharma

# Rollback deployment
kubectl rollout undo deployment/api-gateway -n iac-dharma
```

---

## Troubleshooting

### Pod Issues

```bash
# Describe pod
kubectl describe pod <pod-name> -n iac-dharma

# Get events
kubectl get events -n iac-dharma --sort-by='.lastTimestamp'

# Check pod logs
kubectl logs <pod-name> -n iac-dharma --previous
```

### Service Discovery

```bash
# Test DNS resolution
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup postgres.iac-dharma.svc.cluster.local

# Test service connectivity
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- curl http://api-gateway:3000/health
```

---

Last Updated: November 21, 2025 | [Back to Home](Home)
