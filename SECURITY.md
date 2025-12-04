# Security Hardening Guide

## Application Security

### 1. API Security

**Rate Limiting**
```python
# Add to main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.get("/api/projects")
@limiter.limit("100/minute")
async def list_projects(request: Request):
    ...
```

**Input Validation**
- All user inputs validated with Pydantic
- SQL injection prevention via ORM (SQLAlchemy)
- XSS prevention in frontend (React escapes by default)
- File upload restrictions (size, type, malware scanning)

**Authentication & Authorization**
```python
# JWT token validation
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt

security = HTTPBearer()

async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### 2. Secrets Management

**Never commit secrets to Git**
```bash
# Use git-secrets to prevent accidental commits
git secrets --install
git secrets --register-aws
```

**Use Kubernetes Secrets**
```bash
# Rotate secrets regularly
kubectl create secret generic new-secret \
  --from-literal=key=new-value \
  -n iac-platform

# Update deployment to use new secret
kubectl set env deployment/ai-orchestrator \
  --from=secret/new-secret \
  -n iac-platform
```

**External Secrets Operator (Recommended)**
```yaml
apiVersion: external-secrets.io/v1beta1
kind: ExternalSecret
metadata:
  name: ai-orchestrator-secrets
  namespace: iac-platform
spec:
  refreshInterval: 1h
  secretStoreRef:
    name: aws-secrets-manager
    kind: SecretStore
  target:
    name: ai-orchestrator-secrets
  data:
  - secretKey: OPENAI_API_KEY
    remoteRef:
      key: prod/iac/openai-key
```

### 3. Network Security

**Network Policies**
```yaml
# k8s/network-policy.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: ai-orchestrator-netpol
  namespace: iac-platform
spec:
  podSelector:
    matchLabels:
      app: ai-orchestrator
  policyTypes:
  - Ingress
  - Egress
  ingress:
  - from:
    - podSelector:
        matchLabels:
          app: frontend
    ports:
    - protocol: TCP
      port: 8000
  egress:
  - to:
    - podSelector:
        matchLabels:
          app: postgres
    ports:
    - protocol: TCP
      port: 5432
  - to:
    - podSelector:
        matchLabels:
          app: redis
    ports:
    - protocol: TCP
      port: 6379
```

**TLS/SSL Configuration**
```yaml
# Ingress with TLS
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ai-orchestrator-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/force-ssl-redirect: "true"
    nginx.ingress.kubernetes.io/ssl-protocols: "TLSv1.2 TLSv1.3"
spec:
  tls:
  - hosts:
    - api.iac.yourdomain.com
    secretName: api-tls-cert
```

### 4. Container Security

**Non-root User**
```dockerfile
# Already implemented in Dockerfile.prod
RUN useradd -m -u 1000 appuser
USER appuser
```

**Image Scanning**
```bash
# Scan with Trivy
trivy image your-registry/ai-orchestrator:latest

# Scan with Snyk
snyk container test your-registry/ai-orchestrator:latest
```

**Minimal Base Images**
- Use `python:3.11-slim` (already implemented)
- Remove unnecessary packages
- Multi-stage builds to reduce attack surface

**Pod Security Standards**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: ai-orchestrator
spec:
  securityContext:
    runAsNonRoot: true
    runAsUser: 1000
    fsGroup: 1000
    seccompProfile:
      type: RuntimeDefault
  containers:
  - name: fastapi
    securityContext:
      allowPrivilegeEscalation: false
      readOnlyRootFilesystem: true
      capabilities:
        drop:
        - ALL
```

### 5. Database Security

**Connection Security**
```python
# Use SSL for database connections
DATABASE_URL = "postgresql://user:pass@host:5432/db?sslmode=require"
```

**Encrypted Storage**
```yaml
# Use encrypted EBS volumes or similar
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-storage
spec:
  storageClassName: encrypted-gp3
```

**Access Control**
```sql
-- Limit permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO iacuser;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
```

### 6. API Security Headers

**CORS Configuration**
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://iac.yourdomain.com"],  # Specific domains only
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=3600,
)
```

**Security Headers**
```python
from fastapi.middleware.trustedhost import TrustedHostMiddleware

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["iac.yourdomain.com", "api.iac.yourdomain.com"]
)

@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response
```

### 7. Monitoring and Auditing

**Audit Logging**
```python
import logging

audit_logger = logging.getLogger("audit")

def log_audit_event(user_id: str, action: str, resource: str):
    audit_logger.info(
        "Audit event",
        extra={
            "user_id": user_id,
            "action": action,
            "resource": resource,
            "timestamp": datetime.utcnow().isoformat(),
            "ip_address": request.client.host,
        }
    )
```

**Security Scanning**
- SAST: SonarQube, Semgrep
- DAST: OWASP ZAP, Burp Suite
- Dependency scanning: Snyk, Dependabot
- Container scanning: Trivy, Clair

### 8. Compliance

**GDPR Compliance**
- Data encryption at rest and in transit
- Right to be forgotten (data deletion endpoints)
- Data portability (export endpoints)
- Consent management
- Data retention policies

**SOC2 Compliance**
- Access logging
- Change management
- Incident response procedures
- Regular security audits
- Vendor risk assessment

**HIPAA Compliance** (if applicable)
- PHI encryption
- Access controls
- Audit trails
- Business associate agreements
- Breach notification procedures

### 9. Incident Response

**Security Incident Checklist**
1. Detect: Alert triggered
2. Contain: Isolate affected systems
3. Investigate: Review logs, identify root cause
4. Remediate: Apply fixes, rotate credentials
5. Recover: Restore services
6. Document: Write post-mortem
7. Improve: Implement preventive measures

**Emergency Contacts**
- Security team: security@yourdomain.com
- On-call engineer: +1-XXX-XXX-XXXX
- Legal: legal@yourdomain.com

### 10. Security Checklist

**Pre-Production**
- [ ] All secrets stored in secrets manager
- [ ] SSL/TLS certificates configured
- [ ] Rate limiting enabled
- [ ] Authentication implemented
- [ ] Input validation comprehensive
- [ ] Security headers configured
- [ ] Network policies applied
- [ ] Container images scanned
- [ ] Dependency vulnerabilities resolved
- [ ] Audit logging enabled

**Regular Maintenance**
- [ ] Rotate secrets every 90 days
- [ ] Update dependencies monthly
- [ ] Security scanning weekly
- [ ] Penetration testing annually
- [ ] Access review quarterly
- [ ] Backup testing monthly
- [ ] Incident response drills quarterly

**Monitoring**
- [ ] Failed login attempts
- [ ] Unusual API usage patterns
- [ ] Privilege escalation attempts
- [ ] Data exfiltration indicators
- [ ] Resource exhaustion attacks
- [ ] SQL injection attempts
- [ ] XSS attempts
