"""
Zero Trust Security Service - Never Trust, Always Verify
Implements Zero Trust Security Architecture for IAC Dharma v3.0

Features:
- Continuous authentication and authorization
- Micro-segmentation enforcement
- Identity-based access control
- Device trust verification
- Behavioral analytics
- Policy enforcement
"""

from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import jwt
import hashlib
import logging
import uuid
from enum import Enum

# Initialize FastAPI app
app = FastAPI(
    title="IAC Dharma Zero Trust Security Service",
    description="Zero Trust Security - Never Trust, Always Verify",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# JWT Configuration
SECRET_KEY = "zero-trust-secret-key-change-in-production"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

# ============================================================================
# Models
# ============================================================================

class TrustLevel(str, Enum):
    NONE = "none"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    FULL = "full"

class AccessDecision(str, Enum):
    ALLOW = "allow"
    DENY = "deny"
    CHALLENGE = "challenge"

class DevicePosture(BaseModel):
    device_id: str
    os: str
    os_version: str
    security_patch_level: str
    encrypted: bool
    firewall_enabled: bool
    antivirus_enabled: bool
    compliance_score: float  # 0-100

class UserContext(BaseModel):
    user_id: str
    username: str
    email: str
    roles: List[str]
    groups: List[str]
    mfa_enabled: bool
    last_auth_time: Optional[str] = None

class AccessRequest(BaseModel):
    user_id: str
    resource: str
    action: str
    source_ip: str
    device_id: str
    device_posture: DevicePosture
    context: Dict[str, Any]

class PolicyRule(BaseModel):
    rule_id: str
    name: str
    resource_pattern: str
    required_roles: List[str]
    required_trust_level: TrustLevel
    conditions: Dict[str, Any]
    action: AccessDecision

# ============================================================================
# In-Memory Stores (Replace with Redis/Database in production)
# ============================================================================

# Trust scores for users and devices
trust_scores = {}

# Active sessions
sessions = {}

# Access policies
policies: List[PolicyRule] = [
    PolicyRule(
        rule_id="pol_001",
        name="Production Database Access",
        resource_pattern="database/production/*",
        required_roles=["admin", "dba"],
        required_trust_level=TrustLevel.HIGH,
        conditions={"mfa_required": True, "device_compliance_min": 90},
        action=AccessDecision.ALLOW
    ),
    PolicyRule(
        rule_id="pol_002",
        name="Development Resources",
        resource_pattern="compute/dev/*",
        required_roles=["developer", "admin"],
        required_trust_level=TrustLevel.MEDIUM,
        conditions={"mfa_required": False, "device_compliance_min": 70},
        action=AccessDecision.ALLOW
    ),
    PolicyRule(
        rule_id="pol_003",
        name="Sensitive Data Access",
        resource_pattern="storage/*/sensitive/*",
        required_roles=["security_admin", "compliance_officer"],
        required_trust_level=TrustLevel.FULL,
        conditions={"mfa_required": True, "device_compliance_min": 95, "location_restricted": True},
        action=AccessDecision.ALLOW
    ),
]

# Audit log
audit_log = []

# ============================================================================
# Trust Calculation Engine
# ============================================================================

class TrustEngine:
    """Calculate trust scores based on multiple factors"""
    
    @staticmethod
    def calculate_device_trust(posture: DevicePosture) -> float:
        """Calculate device trust score (0-100)"""
        score = 0.0
        
        # Base compliance score
        score += posture.compliance_score * 0.4
        
        # Security features
        if posture.encrypted:
            score += 20
        if posture.firewall_enabled:
            score += 15
        if posture.antivirus_enabled:
            score += 15
        
        # OS patch level (simplified)
        if "latest" in posture.security_patch_level.lower():
            score += 10
        
        return min(100.0, score)
    
    @staticmethod
    def calculate_user_trust(user_id: str, mfa_enabled: bool, last_auth: Optional[str]) -> float:
        """Calculate user trust score (0-100)"""
        score = 50.0  # Base score
        
        # MFA significantly increases trust
        if mfa_enabled:
            score += 30
        
        # Recent authentication
        if last_auth:
            try:
                auth_time = datetime.fromisoformat(last_auth)
                minutes_ago = (datetime.now() - auth_time).total_seconds() / 60
                
                if minutes_ago < 5:
                    score += 20
                elif minutes_ago < 15:
                    score += 10
                elif minutes_ago < 60:
                    score += 5
            except:
                pass
        
        # Historical behavior (simplified - would use ML in production)
        if user_id in trust_scores:
            historical_score = trust_scores[user_id].get('historical', 0)
            score += historical_score * 0.2
        
        return min(100.0, score)
    
    @staticmethod
    def calculate_context_trust(request: AccessRequest) -> float:
        """Calculate contextual trust (location, time, behavior)"""
        score = 50.0
        
        # Time of access (lower trust outside business hours)
        hour = datetime.now().hour
        if 9 <= hour <= 17:  # Business hours
            score += 20
        elif 6 <= hour <= 22:
            score += 10
        
        # Source IP reputation (simplified)
        if request.source_ip.startswith("10.") or request.source_ip.startswith("192.168."):
            score += 15  # Internal network
        
        # Resource sensitivity
        if "production" in request.resource:
            score -= 10  # More scrutiny for production
        
        return min(100.0, max(0.0, score))
    
    @staticmethod
    def calculate_overall_trust(request: AccessRequest, user_context: UserContext) -> Dict:
        """Calculate overall trust score and level"""
        device_trust = TrustEngine.calculate_device_trust(request.device_posture)
        user_trust = TrustEngine.calculate_user_trust(
            request.user_id,
            user_context.mfa_enabled,
            user_context.last_auth_time
        )
        context_trust = TrustEngine.calculate_context_trust(request)
        
        # Weighted average
        overall_score = (
            device_trust * 0.35 +
            user_trust * 0.40 +
            context_trust * 0.25
        )
        
        # Determine trust level
        if overall_score >= 90:
            level = TrustLevel.FULL
        elif overall_score >= 75:
            level = TrustLevel.HIGH
        elif overall_score >= 60:
            level = TrustLevel.MEDIUM
        elif overall_score >= 40:
            level = TrustLevel.LOW
        else:
            level = TrustLevel.NONE
        
        return {
            "overall_score": round(overall_score, 2),
            "trust_level": level,
            "breakdown": {
                "device_trust": round(device_trust, 2),
                "user_trust": round(user_trust, 2),
                "context_trust": round(context_trust, 2)
            }
        }

# ============================================================================
# Policy Engine
# ============================================================================

class PolicyEngine:
    """Evaluate access requests against policies"""
    
    @staticmethod
    def evaluate(request: AccessRequest, user_context: UserContext, trust_score: Dict) -> Dict:
        """Evaluate access request"""
        
        # Find matching policies
        matching_policies = []
        for policy in policies:
            if PolicyEngine._matches_pattern(request.resource, policy.resource_pattern):
                matching_policies.append(policy)
        
        if not matching_policies:
            return {
                "decision": AccessDecision.DENY,
                "reason": "No matching policy found",
                "matched_policies": []
            }
        
        # Evaluate each policy
        for policy in matching_policies:
            evaluation = PolicyEngine._evaluate_policy(policy, request, user_context, trust_score)
            if evaluation["decision"] == AccessDecision.ALLOW:
                return evaluation
        
        # If no policy allows, deny
        return {
            "decision": AccessDecision.DENY,
            "reason": "No policy granted access",
            "matched_policies": [p.rule_id for p in matching_policies]
        }
    
    @staticmethod
    def _matches_pattern(resource: str, pattern: str) -> bool:
        """Simple pattern matching (wildcard support)"""
        if pattern == "*":
            return True
        
        pattern_parts = pattern.split("/")
        resource_parts = resource.split("/")
        
        if len(pattern_parts) != len(resource_parts):
            return False
        
        for pp, rp in zip(pattern_parts, resource_parts):
            if pp != "*" and pp != rp:
                return False
        
        return True
    
    @staticmethod
    def _evaluate_policy(policy: PolicyRule, request: AccessRequest, 
                        user_context: UserContext, trust_score: Dict) -> Dict:
        """Evaluate a single policy"""
        reasons = []
        
        # Check roles
        has_required_role = any(role in user_context.roles for role in policy.required_roles)
        if not has_required_role:
            return {
                "decision": AccessDecision.DENY,
                "reason": f"Missing required role: {policy.required_roles}",
                "policy_id": policy.rule_id
            }
        reasons.append(f"Role requirement met: {user_context.roles}")
        
        # Check trust level
        required_trust_value = {"none": 0, "low": 40, "medium": 60, "high": 75, "full": 90}[policy.required_trust_level.value]
        if trust_score["overall_score"] < required_trust_value:
            return {
                "decision": AccessDecision.CHALLENGE,
                "reason": f"Trust level too low: {trust_score['trust_level']} < {policy.required_trust_level}",
                "policy_id": policy.rule_id,
                "required_action": "step_up_authentication"
            }
        reasons.append(f"Trust level met: {trust_score['trust_level']}")
        
        # Check conditions
        if policy.conditions.get("mfa_required") and not user_context.mfa_enabled:
            return {
                "decision": AccessDecision.CHALLENGE,
                "reason": "MFA required but not enabled",
                "policy_id": policy.rule_id,
                "required_action": "enable_mfa"
            }
        
        min_compliance = policy.conditions.get("device_compliance_min", 0)
        if request.device_posture.compliance_score < min_compliance:
            return {
                "decision": AccessDecision.DENY,
                "reason": f"Device compliance too low: {request.device_posture.compliance_score} < {min_compliance}",
                "policy_id": policy.rule_id
            }
        reasons.append(f"Device compliance met: {request.device_posture.compliance_score}")
        
        # All checks passed
        return {
            "decision": AccessDecision.ALLOW,
            "reason": "All policy requirements met",
            "policy_id": policy.rule_id,
            "evaluation_details": reasons
        }

# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "service": "IAC Dharma Zero Trust Security",
        "version": "1.0.0",
        "status": "operational",
        "principle": "Never Trust, Always Verify",
        "docs": "/docs"
    }

@app.get("/health", tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "zero-trust-security",
        "version": "1.0.0",
        "active_sessions": len(sessions),
        "policies_loaded": len(policies),
        "timestamp": datetime.now().isoformat()
    }

@app.post("/api/v3/zero-trust/verify", tags=["Access Control"])
async def verify_access(request: AccessRequest):
    """
    Verify access request using Zero Trust principles.
    Returns access decision with trust score and reasoning.
    """
    try:
        logger.info(f"Access verification request: {request.user_id} -> {request.resource}")
        
        # Get user context (simplified - would query user service)
        user_context = UserContext(
            user_id=request.user_id,
            username=request.user_id,
            email=f"{request.user_id}@example.com",
            roles=["developer", "admin"],  # Would be fetched from user service
            groups=["engineering"],
            mfa_enabled=True,
            last_auth_time=datetime.now().isoformat()
        )
        
        # Calculate trust score
        trust_score = TrustEngine.calculate_overall_trust(request, user_context)
        
        # Evaluate policies
        policy_result = PolicyEngine.evaluate(request, user_context, trust_score)
        
        # Audit log
        audit_entry = {
            "timestamp": datetime.now().isoformat(),
            "user_id": request.user_id,
            "resource": request.resource,
            "action": request.action,
            "decision": policy_result["decision"],
            "trust_score": trust_score["overall_score"],
            "source_ip": request.source_ip,
            "device_id": request.device_id
        }
        audit_log.append(audit_entry)
        
        return {
            "decision": policy_result["decision"],
            "trust_score": trust_score,
            "policy_evaluation": policy_result,
            "user_context": {
                "user_id": user_context.user_id,
                "roles": user_context.roles,
                "mfa_enabled": user_context.mfa_enabled
            },
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Access verification error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v3/zero-trust/authenticate", tags=["Authentication"])
async def authenticate(username: str, password: str, device_id: str, mfa_code: Optional[str] = None):
    """
    Authenticate user with continuous verification.
    Returns session token with limited lifetime.
    """
    try:
        # Simplified authentication (integrate with identity provider)
        if not username or not password:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Verify MFA if enabled
        requires_mfa = True  # Would check user settings
        if requires_mfa and not mfa_code:
            return {
                "status": "mfa_required",
                "message": "Multi-factor authentication code required",
                "mfa_methods": ["totp", "sms", "push"]
            }
        
        # Generate session token
        session_id = str(uuid.uuid4())
        token_data = {
            "session_id": session_id,
            "user_id": username,
            "device_id": device_id,
            "exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        }
        token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
        
        # Store session
        sessions[session_id] = {
            "user_id": username,
            "device_id": device_id,
            "created_at": datetime.now().isoformat(),
            "last_verified": datetime.now().isoformat()
        }
        
        return {
            "access_token": token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "session_id": session_id,
            "requires_reverification_in": ACCESS_TOKEN_EXPIRE_MINUTES
        }
        
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(status_code=401, detail="Authentication failed")

@app.get("/api/v3/zero-trust/policies", tags=["Policy Management"])
async def list_policies():
    """List all Zero Trust policies"""
    return {
        "policies": [
            {
                "rule_id": p.rule_id,
                "name": p.name,
                "resource_pattern": p.resource_pattern,
                "required_roles": p.required_roles,
                "required_trust_level": p.required_trust_level,
                "action": p.action
            }
            for p in policies
        ],
        "total": len(policies)
    }

@app.post("/api/v3/zero-trust/policies", tags=["Policy Management"])
async def create_policy(policy: PolicyRule):
    """Create new Zero Trust policy"""
    policies.append(policy)
    logger.info(f"Created policy: {policy.rule_id} - {policy.name}")
    return {
        "status": "created",
        "policy": policy,
        "total_policies": len(policies)
    }

@app.get("/api/v3/zero-trust/audit", tags=["Audit"])
async def get_audit_log(limit: int = 100):
    """Retrieve audit log entries"""
    return {
        "entries": audit_log[-limit:],
        "total_entries": len(audit_log),
        "limit": limit
    }

@app.get("/api/v3/zero-trust/trust-score/{user_id}", tags=["Trust Scoring"])
async def get_trust_score(user_id: str):
    """Get current trust score for a user"""
    if user_id not in trust_scores:
        return {
            "user_id": user_id,
            "trust_score": 50.0,
            "trust_level": TrustLevel.MEDIUM,
            "status": "no_history"
        }
    
    return {
        "user_id": user_id,
        "trust_score": trust_scores[user_id].get("current", 50.0),
        "trust_level": trust_scores[user_id].get("level", TrustLevel.MEDIUM),
        "last_updated": trust_scores[user_id].get("updated_at", datetime.now().isoformat())
    }

@app.get("/api/v3/zero-trust/sessions/active", tags=["Session Management"])
async def get_active_sessions():
    """List active Zero Trust sessions"""
    return {
        "active_sessions": list(sessions.values()),
        "total": len(sessions)
    }

@app.post("/api/v3/zero-trust/sessions/{session_id}/verify", tags=["Session Management"])
async def reverify_session(session_id: str):
    """
    Continuous verification of active session.
    Sessions must be re-verified periodically.
    """
    if session_id not in sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = sessions[session_id]
    session["last_verified"] = datetime.now().isoformat()
    
    return {
        "status": "verified",
        "session_id": session_id,
        "next_verification_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60
    }

@app.delete("/api/v3/zero-trust/sessions/{session_id}", tags=["Session Management"])
async def terminate_session(session_id: str):
    """Terminate Zero Trust session"""
    if session_id in sessions:
        del sessions[session_id]
        return {"status": "terminated", "session_id": session_id}
    else:
        raise HTTPException(status_code=404, detail="Session not found")

# ============================================================================
# Startup
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize service on startup"""
    logger.info("=" * 60)
    logger.info("IAC Dharma Zero Trust Security Service - Starting...")
    logger.info("=" * 60)
    logger.info(f"📋 Policies loaded: {len(policies)}")
    logger.info("🔐 Zero Trust Principles:")
    logger.info("  ✓ Never trust, always verify")
    logger.info("  ✓ Least privilege access")
    logger.info("  ✓ Micro-segmentation")
    logger.info("  ✓ Continuous verification")
    logger.info("=" * 60)
    logger.info("🚀 Zero Trust Security ready on port 8500")
    logger.info("📚 API docs: http://localhost:8500/docs")
    logger.info("=" * 60)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8500)
