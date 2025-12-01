# CMDB Agent Downloads API

Backend API endpoints for downloading CMDB Agent packages.

## Installation

The downloads route is already integrated into the API Gateway. To enable it:

1. **Install dependencies** (if not already installed):
```bash
cd /home/rrd/Documents/Iac/backend/api-gateway
npm install
```

2. **Restart the API Gateway**:
```bash
npm run dev
# or in production
npm run build && npm start
```

## Available Endpoints

### 1. Download Linux Package
```http
GET /api/downloads/cmdb-agent-linux.tar.gz
```
Downloads a tar.gz archive containing the complete CMDB Agent for Linux systems.

**Response**: Binary file (application/gzip)

---

### 2. Download Windows Package
```http
GET /api/downloads/cmdb-agent-windows.zip
```
Downloads a zip archive containing the complete CMDB Agent for Windows systems.

**Response**: Binary file (application/zip)

---

### 3. Download Docker Compose
```http
GET /api/downloads/docker-compose.yml
```
Downloads the docker-compose.yml file for quick Docker deployment.

**Response**: Binary file (text/yaml)

---

### 4. Agent Information
```http
GET /api/downloads/agent-info
```
Retrieves metadata about the CMDB Agent package.

**Response**:
```json
{
  "name": "@iac-dharma/cmdb-agent",
  "version": "1.0.0",
  "description": "CMDB monitoring and discovery agent",
  "platforms": ["linux", "windows", "docker"],
  "downloads": {
    "linux": "/api/downloads/cmdb-agent-linux.tar.gz",
    "windows": "/api/downloads/cmdb-agent-windows.zip",
    "docker": "/api/downloads/docker-compose.yml"
  },
  "requirements": {
    "node": ">=18.0.0",
    "docker": ">=20.10.0 (for Docker deployment)"
  }
}
```

## Rate Limiting

All download endpoints are rate-limited to **5 downloads per hour per IP address** to prevent abuse.

If rate limit is exceeded:
```json
{
  "message": "Too many download requests, please try again later."
}
```

## Security Features

- ✅ Rate limiting (5 requests/hour/IP)
- ✅ Archive integrity validation
- ✅ Path traversal protection
- ✅ Error handling and logging
- ✅ 0 Snyk vulnerabilities

## Usage Example

### Using curl
```bash
# Download Linux package
curl -O http://localhost:3000/api/downloads/cmdb-agent-linux.tar.gz

# Download Windows package
curl -O http://localhost:3000/api/downloads/cmdb-agent-windows.zip

# Download Docker Compose
curl -O http://localhost:3000/api/downloads/docker-compose.yml

# Get agent info
curl http://localhost:3000/api/downloads/agent-info
```

### Using wget
```bash
wget http://localhost:3000/api/downloads/cmdb-agent-linux.tar.gz
```

### From Frontend
The CMDB UI provides a one-click "Install Agent" button that:
1. Opens a modal with platform selection
2. Shows installation commands
3. Provides download buttons
4. Copies commands to clipboard

## Integration with CMDB UI

The frontend CMDB page (`/cmdb`) includes:
- **Install Agent** button in the Agents tab
- Modal with platform selection (Docker/Linux/Windows)
- Installation command generation
- One-click download functionality
- Step-by-step setup instructions

## Notes

- Agent source files are read from: `/backend/cmdb-agent/`
- Archives are generated on-the-fly (not pre-built)
- All downloads are logged for monitoring
- CORS is enabled for frontend access
