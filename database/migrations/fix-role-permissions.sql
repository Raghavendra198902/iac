-- Fix missing permissions for developer and auditor roles

-- Assign permissions to developer role
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'developer'
  AND p.name IN (
    'infrastructure.view',
    'infrastructure.manage',
    'infrastructure.deploy',
    'services.view',
    'services.manage',
    'monitoring.view',
    'users.view'
  )
ON CONFLICT DO NOTHING;

-- Assign permissions to auditor role  
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'auditor'
  AND p.name IN (
    'infrastructure.view',
    'services.view',
    'services.logs',
    'monitoring.view',
    'monitoring.configure',
    'audit.view',
    'audit.export',
    'users.view'
  )
ON CONFLICT DO NOTHING;

SELECT 'Permissions assigned successfully' AS status;
