# Default Roles Setup Guide

## Quick Setup via Web Interface

The easiest way to create the default roles is through the web interface:

1. **Open your browser and go to:**
   ```
   http://localhost:3001/public/setup-roles.html
   ```

2. **Click the "Create Default Roles" button**

3. **Done!** The following 5 system roles will be created:
   - **EA** - Enterprise Architect
   - **SA** - Solution Architect
   - **TA** - Technical Architect
   - **PM** - Project Manager
   - **SE** - Software Engineer

## Alternative: API Endpoint

You can also seed roles programmatically:

```bash
curl -X POST http://localhost:3001/api/users/roles/seed \
  -H "Content-Type: application/json"
```

## What Gets Created

Each role includes:
- Unique system ID
- Role code (EA, SA, TA, PM, SE)
- Full role name
- Detailed description
- Specific permissions array
- System role flag (is_system = true)

## Roles Details

### 1. Enterprise Architect (EA)
- **Permissions:** Full access including enterprise strategy and governance
- **Color:** Red

### 2. Solution Architect (SA)
- **Permissions:** Solution design, architecture, technical specs
- **Color:** Blue

### 3. Technical Architect (TA)
- **Permissions:** Infrastructure design, technology evaluation, code review
- **Color:** Purple

### 4. Project Manager (PM)
- **Permissions:** Project management, resource allocation, reports
- **Color:** Green

### 5. Software Engineer (SE)
- **Permissions:** Code development, testing, code review
- **Color:** Orange

## Verification

After setup, you can verify the roles were created:

```sql
SELECT code, name, description FROM roles WHERE is_system = true ORDER BY code;
```

Or check via the User Management page in the frontend at `/users`.

## Note

The seed operation is idempotent - running it multiple times will update existing roles rather than creating duplicates.
