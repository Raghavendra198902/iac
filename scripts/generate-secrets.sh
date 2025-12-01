#!/bin/bash
# Generate secure random secrets for production

echo "🔐 Generating secure secrets for IAC Dharma Platform..."
echo ""

JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
SESSION_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 24)
REDIS_PASSWORD=$(openssl rand -base64 24)

cat > .env.generated << ENVEOF
# ============================================
# Generated Secrets - $(date)
# ============================================
# IMPORTANT: Review and move to .env, then DELETE this file
# NEVER commit these secrets to version control!
# ============================================

# Security Secrets
JWT_SECRET=${JWT_SECRET}
JWT_REFRESH_SECRET=${JWT_REFRESH_SECRET}
SESSION_SECRET=${SESSION_SECRET}

# Database
DB_PASSWORD=${DB_PASSWORD}

# Redis
REDIS_PASSWORD=${REDIS_PASSWORD}

# ============================================
# Next Steps:
# 1. Review the values above
# 2. Copy to your .env file
# 3. Fill in remaining configuration from .env.template
# 4. DELETE this .env.generated file
# 5. Verify .env is in .gitignore
# ============================================
ENVEOF

echo "✅ Secrets generated successfully!"
echo ""
echo "📄 Created file: .env.generated"
echo ""
echo "⚠️  NEXT STEPS:"
echo "   1. Review .env.generated"
echo "   2. Copy values to .env file"
echo "   3. DELETE .env.generated"
echo "   4. Complete remaining config in .env"
echo ""
echo "🔒 Security reminders:"
echo "   - These secrets are cryptographically random"
echo "   - Never commit .env to git"
echo "   - Rotate secrets regularly in production"
echo "   - Use different secrets per environment"
echo ""
