const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'iac_dharma',
  user: process.env.DB_USER || 'dharma',
  password: process.env.DB_PASSWORD || 'dharma123'
});

const roles = [
  {
    id: '00000000-0000-0000-0000-000000000001',
    name: 'Enterprise Architect',
    code: 'EA',
    description: 'Enterprise Architect - Defines overall enterprise architecture strategy, standards, and governance',
    permissions: ['create', 'read', 'update', 'delete', 'deploy', 'manage_users', 'manage_roles', 'system_config', 'audit_logs', 'reports', 'architecture_design', 'enterprise_strategy'],
    color: 'red'
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Solution Architect',
    code: 'SA',
    description: 'Solution Architect - Designs technical solutions aligned with business requirements',
    permissions: ['create', 'read', 'update', 'delete', 'deploy', 'architecture_design', 'solution_design', 'technical_specs', 'reports'],
    color: 'blue'
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Technical Architect',
    code: 'TA',
    description: 'Technical Architect - Focuses on technology stack, infrastructure, and technical implementation details',
    permissions: ['create', 'read', 'update', 'delete', 'deploy', 'technical_specs', 'infrastructure_design', 'technology_evaluation', 'code_review'],
    color: 'purple'
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Project Manager',
    code: 'PM',
    description: 'Project Manager - Manages architecture projects, timelines, resources, and stakeholder communication',
    permissions: ['read', 'create', 'update', 'project_management', 'resource_allocation', 'reports', 'audit_logs'],
    color: 'green'
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Software Engineer',
    code: 'SE',
    description: 'Software Engineer - Implements architecture designs, develops code, and maintains systems',
    permissions: ['read', 'create', 'update', 'delete', 'deploy', 'code_development', 'code_review', 'testing'],
    color: 'orange'
  }
];

async function setupRoles() {
  console.log('================================================');
  console.log('IAC Dharma - Default Roles Setup');
  console.log('================================================\n');
  console.log(`Database: ${process.env.DB_NAME || 'iac_dharma'}`);
  console.log(`Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '5432'}\n`);

  const client = await pool.connect();
  
  try {
    console.log('📋 Creating default roles...\n');

    for (const role of roles) {
      try {
        await client.query(
          `
          INSERT INTO roles (id, tenant_id, name, code, description, permissions, is_system, created_at, updated_at)
          VALUES ($1, NULL, $2, $3, $4, $5, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
          ON CONFLICT (tenant_id, code) 
          DO UPDATE SET 
            name = EXCLUDED.name,
            description = EXCLUDED.description,
            permissions = EXCLUDED.permissions,
            updated_at = CURRENT_TIMESTAMP
          `,
          [role.id, role.name, role.code, role.description, JSON.stringify(role.permissions)]
        );
        console.log(`✅ Created/Updated: ${role.code} - ${role.name}`);
      } catch (err) {
        console.error(`❌ Error creating role ${role.code}:`, err.message);
      }
    }

    // Create index if not exists
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_roles_code_system ON roles(code) WHERE is_system = true
    `);

    console.log('\n📊 Verifying roles in database...\n');
    const result = await client.query(
      'SELECT code, name, description, array_length(permissions, 1) as permission_count FROM roles WHERE is_system = true ORDER BY code'
    );

    console.table(result.rows);

    console.log('\n✅ Default roles setup completed successfully!\n');
    console.log('Roles created:');
    console.log('  1. EA - Enterprise Architect');
    console.log('  2. SA - Solution Architect');
    console.log('  3. TA - Technical Architect');
    console.log('  4. PM - Project Manager');
    console.log('  5. SE - Software Engineer');
    console.log('\n================================================');
    console.log('Setup complete!');
    console.log('================================================');

  } catch (error) {
    console.error('\n❌ Error setting up roles:', error.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupRoles().catch(console.error);
