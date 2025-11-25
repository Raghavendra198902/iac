#!/bin/bash

# Script to insert default roles into the database
# This will create the 5 system roles: EA, SA, TA, PM, SE

set -e

# Database connection parameters
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-iac_dharma}"
DB_USER="${DB_USER:-dharma}"
DB_PASSWORD="${DB_PASSWORD:-dharma123}"

echo "================================================"
echo "IAC Dharma - Default Roles Setup"
echo "================================================"
echo ""
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo ""

# Check if PostgreSQL client is installed
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql (PostgreSQL client) is not installed"
    echo "Install it with: sudo apt-get install postgresql-client"
    exit 1
fi

echo "📋 Creating default roles..."
echo ""

# Run the migration
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f /home/rrd/iac/database/migrations/V002__insert_default_roles.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Default roles created successfully!"
    echo ""
    echo "Roles created:"
    echo "  1. EA - Enterprise Architect"
    echo "  2. SA - Solution Architect"
    echo "  3. TA - Technical Architect"
    echo "  4. PM - Project Manager"
    echo "  5. SE - Software Engineer"
    echo ""
    
    # Display the created roles
    echo "Verifying roles in database..."
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT code, name, description FROM roles WHERE is_system = true ORDER BY code;"
else
    echo ""
    echo "❌ Error: Failed to create roles"
    exit 1
fi

echo ""
echo "================================================"
echo "Setup complete!"
echo "================================================"
