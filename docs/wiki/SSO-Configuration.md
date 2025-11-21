# SSO Configuration

Comprehensive guide to Single Sign-On (SSO) configuration with SAML 2.0 and OAuth 2.0 in IAC Dharma.

---

## 📋 Overview

IAC Dharma supports enterprise SSO for centralized authentication:

- **SAML 2.0**: Enterprise identity providers (Okta, Azure AD, OneLogin)
- **OAuth 2.0**: Social and cloud providers (Google, GitHub, Microsoft)
- **LDAP/Active Directory**: On-premises directory services
- **Multi-Factor Authentication**: Enhanced security with MFA
- **Just-in-Time Provisioning**: Automatic user creation

---

## 🏗️ SSO Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Identity Provider                       │
│                 (Okta, Azure AD, OneLogin)                   │
└────────────────────────┬────────────────────────────────────┘
                         │ SAML 2.0 / OAuth 2.0
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     SSO Service                              │
│                  http://localhost:3009                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SAML Handler                                         │  │
│  │  • Metadata parsing                                  │  │
│  │  • Assertion validation                              │  │
│  │  • Attribute mapping                                 │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  OAuth Handler                                        │  │
│  │  • Authorization flow                                │  │
│  │  • Token exchange                                    │  │
│  │  • User info retrieval                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  User Management                                      │  │
│  │  • JIT provisioning                                  │  │
│  │  • Role mapping                                      │  │
│  │  • Session management                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 SAML 2.0 Configuration

### Setup with Okta

**Step 1: Create Okta Application**:

1. Log in to Okta Admin Console
2. Navigate to Applications > Create App Integration
3. Select "SAML 2.0"
4. Configure application:
   - **App name**: IAC Dharma
   - **Single sign on URL**: `https://app.iac-dharma.com/api/auth/saml/callback`
   - **Audience URI (SP Entity ID)**: `https://app.iac-dharma.com`
   - **Name ID format**: EmailAddress
   - **Application username**: Email

**Step 2: Configure Attribute Statements**:
```
Name: email         Value: user.email
Name: firstName     Value: user.firstName
Name: lastName      Value: user.lastName
Name: groups        Value: appuser.groups
```

**Step 3: Download Metadata**:
- Download IdP metadata XML
- Save as `okta-metadata.xml`

**Step 4: Configure IAC Dharma**:

```yaml
# config/sso-config.yml
sso:
  enabled: true
  default_provider: saml
  
  saml:
    enabled: true
    providers:
      - name: okta
        entity_id: https://app.iac-dharma.com
        callback_url: https://app.iac-dharma.com/api/auth/saml/callback
        
        # Identity Provider settings
        idp_metadata_url: https://dev-12345.okta.com/app/abc123/sso/saml/metadata
        # OR use local file:
        idp_metadata_file: ./config/okta-metadata.xml
        
        # Certificate (for signing)
        cert_path: ./config/ssl/saml-cert.pem
        private_key_path: ./config/ssl/saml-key.pem
        
        # Attribute mapping
        attribute_mapping:
          email: email
          first_name: firstName
          last_name: lastName
          groups: groups
        
        # JIT provisioning
        jit_provisioning:
          enabled: true
          default_role: user
          update_on_login: true
        
        # Group to role mapping
        role_mapping:
          - group: "IAC-Admins"
            role: admin
          - group: "IAC-DevOps"
            role: devops
          - group: "IAC-Developers"
            role: developer
```

### Setup with Azure AD

**Step 1: Register Application**:

1. Navigate to Azure Portal > Azure Active Directory
2. Go to Enterprise Applications > New Application
3. Create a new application:
   - **Name**: IAC Dharma
   - **Type**: Non-gallery application

**Step 2: Configure SAML**:

1. Go to Single sign-on > SAML
2. Configure:
   - **Identifier (Entity ID)**: `https://app.iac-dharma.com`
   - **Reply URL**: `https://app.iac-dharma.com/api/auth/saml/callback`
   - **Sign on URL**: `https://app.iac-dharma.com/login`

**Step 3: Add Claims**:
```
email: user.mail
firstName: user.givenname
lastName: user.surname
groups: user.groups
```

**Step 4: Download Metadata**:
- Copy Federation Metadata URL
- Add to IAC Dharma config

**Configuration**:
```yaml
saml:
  providers:
    - name: azure_ad
      entity_id: https://app.iac-dharma.com
      callback_url: https://app.iac-dharma.com/api/auth/saml/callback
      idp_metadata_url: https://login.microsoftonline.com/tenant-id/federationmetadata/2007-06/federationmetadata.xml
      
      attribute_mapping:
        email: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"
        first_name: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname"
        last_name: "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname"
        groups: "http://schemas.microsoft.com/ws/2008/06/identity/claims/groups"
```

### Setup with OneLogin

**Step 1: Add Application**:

1. Log in to OneLogin admin
2. Applications > Add App
3. Search for "SAML Test Connector (IdP w/attr)"
4. Configure:
   - **Display Name**: IAC Dharma
   - **ACS URL**: `https://app.iac-dharma.com/api/auth/saml/callback`
   - **Audience**: `https://app.iac-dharma.com`

**Step 2: Configure Parameters**:
```
email -> Email
firstName -> First Name
lastName -> Last Name
groups -> User Roles
```

**Step 3: Download Certificate**:
- Download X.509 certificate
- Get Issuer URL and SAML 2.0 Endpoint

**Configuration**:
```yaml
saml:
  providers:
    - name: onelogin
      entity_id: https://app.iac-dharma.com
      callback_url: https://app.iac-dharma.com/api/auth/saml/callback
      
      idp_metadata_url: https://app.onelogin.com/saml/metadata/your-app-id
      
      idp_issuer: https://app.onelogin.com/saml/metadata/your-app-id
      idp_sso_url: https://app.onelogin.com/trust/saml2/http-post/sso/your-app-id
      idp_cert_path: ./config/onelogin-cert.pem
```

---

## 🔑 OAuth 2.0 Configuration

### Google OAuth

**Step 1: Create OAuth Credentials**:

1. Go to Google Cloud Console
2. APIs & Services > Credentials
3. Create OAuth 2.0 Client ID:
   - **Application type**: Web application
   - **Name**: IAC Dharma
   - **Authorized redirect URIs**: `https://app.iac-dharma.com/api/auth/google/callback`

**Configuration**:
```yaml
oauth:
  enabled: true
  
  providers:
    google:
      enabled: true
      client_id: your-google-client-id.apps.googleusercontent.com
      client_secret: your-google-client-secret
      callback_url: https://app.iac-dharma.com/api/auth/google/callback
      
      scopes:
        - openid
        - email
        - profile
      
      # Domain restriction (optional)
      hosted_domain: company.com
      
      jit_provisioning:
        enabled: true
        default_role: user
```

### GitHub OAuth

**Step 1: Register OAuth App**:

1. GitHub Settings > Developer settings > OAuth Apps
2. New OAuth App:
   - **Application name**: IAC Dharma
   - **Homepage URL**: `https://app.iac-dharma.com`
   - **Authorization callback URL**: `https://app.iac-dharma.com/api/auth/github/callback`

**Configuration**:
```yaml
oauth:
  providers:
    github:
      enabled: true
      client_id: your-github-client-id
      client_secret: your-github-client-secret
      callback_url: https://app.iac-dharma.com/api/auth/github/callback
      
      scopes:
        - user:email
        - read:org
      
      # Organization restriction (optional)
      allowed_organizations:
        - your-org-name
```

### Microsoft OAuth

**Step 1: Register Application**:

1. Azure Portal > App registrations
2. New registration:
   - **Name**: IAC Dharma
   - **Redirect URI**: `https://app.iac-dharma.com/api/auth/microsoft/callback`

**Configuration**:
```yaml
oauth:
  providers:
    microsoft:
      enabled: true
      client_id: your-microsoft-client-id
      client_secret: your-microsoft-client-secret
      tenant_id: your-tenant-id
      callback_url: https://app.iac-dharma.com/api/auth/microsoft/callback
      
      scopes:
        - openid
        - email
        - profile
```

---

## 👥 LDAP / Active Directory

### LDAP Configuration

```yaml
ldap:
  enabled: true
  
  # Server settings
  url: ldap://ldap.company.com:389
  # For LDAPS (SSL):
  # url: ldaps://ldap.company.com:636
  
  # Bind credentials
  bind_dn: cn=admin,dc=company,dc=com
  bind_password: ${LDAP_BIND_PASSWORD}
  
  # Search settings
  base_dn: dc=company,dc=com
  user_search_base: ou=users,dc=company,dc=com
  user_search_filter: (uid={{username}})
  
  group_search_base: ou=groups,dc=company,dc=com
  group_search_filter: (member={{dn}})
  
  # Attribute mapping
  attributes:
    username: uid
    email: mail
    first_name: givenName
    last_name: sn
    display_name: displayName
    member_of: memberOf
  
  # Connection settings
  timeout: 5000  # ms
  connect_timeout: 10000  # ms
  idle_timeout: 300000  # 5 minutes
  
  # TLS settings (for LDAPS)
  tls:
    enabled: true
    reject_unauthorized: true
    ca_cert_path: ./config/ssl/ldap-ca.pem
```

### Active Directory Configuration

```yaml
active_directory:
  enabled: true
  
  # AD server
  url: ldap://ad.company.com:389
  domain: company.com
  
  # Service account
  bind_dn: cn=IAC Service,ou=Service Accounts,dc=company,dc=com
  bind_password: ${AD_BIND_PASSWORD}
  
  # Search settings
  base_dn: dc=company,dc=com
  user_search_base: ou=Users,dc=company,dc=com
  user_search_filter: (&(objectClass=user)(sAMAccountName={{username}}))
  
  group_search_base: ou=Groups,dc=company,dc=com
  group_search_filter: (member:1.2.840.113556.1.4.1941:={{dn}})
  
  # Attribute mapping (AD-specific)
  attributes:
    username: sAMAccountName
    email: mail
    first_name: givenName
    last_name: sn
    display_name: displayName
    user_principal_name: userPrincipalName
    groups: memberOf
  
  # Group to role mapping
  group_mapping:
    - ad_group: "CN=IAC Admins,OU=Groups,DC=company,DC=com"
      role: admin
    - ad_group: "CN=IAC DevOps,OU=Groups,DC=company,DC=com"
      role: devops
```

---

## 🔒 Multi-Factor Authentication (MFA)

### TOTP Configuration

```yaml
mfa:
  enabled: true
  required: false  # Make optional or required
  
  totp:
    enabled: true
    issuer: IAC Dharma
    algorithm: SHA1
    digits: 6
    period: 30
    window: 1
  
  # Backup codes
  backup_codes:
    enabled: true
    count: 10
    length: 8
  
  # Remember device
  remember_device:
    enabled: true
    duration: 30  # days
```

### Supported MFA Methods

**Time-based OTP (TOTP)**:
- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password

**SMS (optional)**:
```yaml
mfa:
  sms:
    enabled: true
    provider: twilio
    twilio:
      account_sid: ${TWILIO_ACCOUNT_SID}
      auth_token: ${TWILIO_AUTH_TOKEN}
      from_number: "+1234567890"
```

**Email OTP**:
```yaml
mfa:
  email_otp:
    enabled: true
    code_length: 6
    expiry: 600  # 10 minutes
```

---

## 👤 Just-in-Time (JIT) Provisioning

### Auto User Creation

```yaml
jit_provisioning:
  enabled: true
  
  # User creation
  create_users: true
  update_existing: true
  
  # Default settings
  defaults:
    role: user
    status: active
    email_verified: true
  
  # Required attributes
  required_attributes:
    - email
    - first_name
    - last_name
  
  # Username generation
  username_format: "{email}"  # or "{first_name}.{last_name}"
  
  # Deactivation
  deactivate_on_sso_removal: true
```

### Group/Role Mapping

```yaml
role_mapping:
  # Map SSO groups to IAC Dharma roles
  mapping:
    - sso_group: "IAC-Admins"
      role: admin
      permissions:
        - "*"
    
    - sso_group: "IAC-DevOps"
      role: devops
      permissions:
        - "blueprints:*"
        - "deployments:*"
        - "monitoring:read"
    
    - sso_group: "IAC-Developers"
      role: developer
      permissions:
        - "blueprints:read"
        - "blueprints:create"
        - "deployments:read"
    
    - sso_group: "IAC-Auditors"
      role: auditor
      permissions:
        - "audit:read"
        - "compliance:read"
  
  # Default role if no groups match
  default_role: user
  
  # Multiple groups handling
  multi_group_strategy: highest_privilege  # or first_match, merge
```

---

## 🔧 Session Management

### Session Configuration

```yaml
session:
  # Session storage
  store: redis
  redis_url: redis://redis:6379
  
  # Session settings
  secret: ${SESSION_SECRET}
  name: iac_dharma_session
  
  # Cookie settings
  cookie:
    secure: true  # HTTPS only
    http_only: true
    same_site: lax
    domain: .iac-dharma.com
    path: /
  
  # Expiry
  max_age: 86400000  # 24 hours (ms)
  rolling: true  # Refresh on activity
  
  # Timeout
  idle_timeout: 3600000  # 1 hour (ms)
  absolute_timeout: 43200000  # 12 hours (ms)
```

### Session Security

```yaml
session_security:
  # IP binding
  bind_to_ip: false  # Can cause issues with mobile
  
  # User agent binding
  bind_to_user_agent: true
  
  # Concurrent sessions
  max_concurrent_sessions: 3
  enforce_single_session: false
  
  # Session invalidation
  invalidate_on_password_change: true
  invalidate_on_permission_change: true
```

---

## 🧪 Testing SSO

### Test SAML Flow

```bash
# Test SAML metadata endpoint
curl https://app.iac-dharma.com/api/auth/saml/metadata

# Initiate SAML login
curl -X GET https://app.iac-dharma.com/api/auth/saml/login \
  -H "Accept: application/json"

# This will redirect to IdP login page
```

### Test OAuth Flow

```bash
# Initiate Google OAuth
curl -X GET https://app.iac-dharma.com/api/auth/google/login

# Initiate GitHub OAuth
curl -X GET https://app.iac-dharma.com/api/auth/github/login
```

### Debugging

**Enable Debug Logging**:
```yaml
logging:
  level: debug
  
  loggers:
    sso:
      level: trace
      file: ./logs/sso-debug.log
```

**SAML Response Validation**:
```bash
# Decode SAML response
echo "BASE64_SAML_RESPONSE" | base64 -d | xmllint --format -

# Validate assertion
curl -X POST http://localhost:3009/api/auth/saml/validate \
  -d @saml-response.xml
```

---

## 📊 SSO Monitoring

### Metrics to Track

```yaml
sso_metrics:
  - sso_login_attempts_total
  - sso_login_success_total
  - sso_login_failures_total
  - sso_login_duration_seconds
  - sso_jit_user_creations_total
  - sso_session_duration_seconds
  - sso_mfa_challenges_total
  - sso_mfa_success_rate
```

### Grafana Dashboard

**Login Success Rate Panel**:
```promql
rate(sso_login_success_total[5m]) / 
rate(sso_login_attempts_total[5m]) * 100
```

**Average Login Duration**:
```promql
rate(sso_login_duration_seconds_sum[5m]) / 
rate(sso_login_duration_seconds_count[5m])
```

---

## 🔍 Troubleshooting

### SAML Issues

**Invalid Signature**:
- Verify IdP certificate
- Check clock synchronization (NTP)
- Ensure correct SP entity ID

**Attribute Mapping**:
```bash
# Check received attributes
curl http://localhost:3009/api/auth/saml/debug/last-response
```

### OAuth Issues

**Redirect URI Mismatch**:
- Verify callback URL matches exactly
- Check for trailing slashes
- Ensure HTTPS in production

**Token Exchange Failure**:
- Verify client secret
- Check token expiry
- Review OAuth provider logs

### LDAP Issues

**Connection Timeout**:
```bash
# Test LDAP connection
ldapsearch -H ldap://ldap.company.com:389 \
  -D "cn=admin,dc=company,dc=com" \
  -w password \
  -b "dc=company,dc=com" \
  "(uid=testuser)"
```

---

## 📚 Related Documentation

- [Security Best Practices](Security-Best-Practices) - Authentication security
- [Compliance and Governance](Compliance-and-Governance) - Access control
- [API Reference](API-Reference) - SSO API endpoints
- [Troubleshooting](Troubleshooting) - Common SSO issues

---

**Next Steps**: Learn about [Custom-Blueprints](Custom-Blueprints) for infrastructure templates.
