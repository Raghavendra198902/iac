#!/bin/bash

# Interactive Branding Configuration Script
# This script collects branding information and updates the frontend

echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║     IAC DHARMA - Interactive Branding Configuration          ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""
echo "This script will help you customize the branding for both:"
echo "  1. Platform Branding (IAC DHARMA)"
echo "  2. Company/Personal Branding (Your Brand)"
echo ""
read -p "Press Enter to continue..."
clear

echo "════════════════════════════════════════════════════════════════"
echo "  SECTION 1: COMPANY/PERSONAL BRANDING"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Company Name
read -p "Enter your company name (e.g., 'RRD Technologies'): " COMPANY_NAME
COMPANY_NAME=${COMPANY_NAME:-"RRD Technologies"}

# Company Full Name
read -p "Enter full company name (e.g., 'Raghavendra R D - Enterprise Solutions'): " COMPANY_FULLNAME
COMPANY_FULLNAME=${COMPANY_FULLNAME:-"$COMPANY_NAME"}

# Company Tagline
read -p "Enter company tagline (e.g., 'Innovating Infrastructure, Empowering Enterprises'): " COMPANY_TAGLINE
COMPANY_TAGLINE=${COMPANY_TAGLINE:-"Innovating Infrastructure, Empowering Enterprises"}

# Founder Name
read -p "Enter founder/owner name (e.g., 'Raghavendra R D'): " FOUNDER_NAME
FOUNDER_NAME=${FOUNDER_NAME:-"Raghavendra R D"}

# Established Year
read -p "Enter year established (e.g., '2024'): " ESTABLISHED_YEAR
ESTABLISHED_YEAR=${ESTABLISHED_YEAR:-"2024"}

# Logo Text (2-4 characters recommended)
read -p "Enter logo text/initials (e.g., 'RRD'): " LOGO_TEXT
LOGO_TEXT=${LOGO_TEXT:-"RRD"}

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  SECTION 2: PLATFORM BRANDING"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Platform Name
read -p "Enter platform name [IAC DHARMA]: " PLATFORM_NAME
PLATFORM_NAME=${PLATFORM_NAME:-"IAC DHARMA"}

# Platform Version
read -p "Enter platform version [v3.0]: " PLATFORM_VERSION
PLATFORM_VERSION=${PLATFORM_VERSION:-"v3.0"}

# Platform Subtitle
read -p "Enter platform subtitle [Enterprise Architecture Platform]: " PLATFORM_SUBTITLE
PLATFORM_SUBTITLE=${PLATFORM_SUBTITLE:-"Enterprise Architecture Platform"}

# Platform Description
read -p "Enter platform description (or press Enter for default): " PLATFORM_DESCRIPTION
PLATFORM_DESCRIPTION=${PLATFORM_DESCRIPTION:-"AI-Powered Infrastructure as Code with Real-time Monitoring & Automated Operations"}

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  SECTION 3: CONTACT INFORMATION"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Email
read -p "Enter contact email (e.g., 'contact@yourcompany.com'): " CONTACT_EMAIL
CONTACT_EMAIL=${CONTACT_EMAIL:-"contact@example.com"}

# Website
read -p "Enter website URL (e.g., 'https://yourcompany.com'): " CONTACT_WEBSITE
CONTACT_WEBSITE=${CONTACT_WEBSITE:-"https://example.com"}

# GitHub
read -p "Enter GitHub URL (e.g., 'https://github.com/yourusername'): " CONTACT_GITHUB
CONTACT_GITHUB=${CONTACT_GITHUB:-"https://github.com"}

# LinkedIn
read -p "Enter LinkedIn URL (e.g., 'https://linkedin.com/in/yourprofile'): " CONTACT_LINKEDIN
CONTACT_LINKEDIN=${CONTACT_LINKEDIN:-"https://linkedin.com"}

# Twitter
read -p "Enter Twitter/X URL (e.g., 'https://twitter.com/yourusername'): " CONTACT_TWITTER
CONTACT_TWITTER=${CONTACT_TWITTER:-"https://twitter.com"}

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  SECTION 4: BRAND COLORS (Optional - Press Enter for defaults)"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Colors
read -p "Enter primary brand color [#667eea]: " COLOR_PRIMARY
COLOR_PRIMARY=${COLOR_PRIMARY:-"#667eea"}

read -p "Enter secondary brand color [#764ba2]: " COLOR_SECONDARY
COLOR_SECONDARY=${COLOR_SECONDARY:-"#764ba2"}

read -p "Enter accent color [#f093fb]: " COLOR_ACCENT
COLOR_ACCENT=${COLOR_ACCENT:-"#f093fb"}

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  SECTION 5: MISSION & VALUES"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Mission Statement
echo "Enter your mission statement (press Enter twice when done):"
MISSION_LINES=()
while IFS= read -r line; do
    [[ -z "$line" ]] && break
    MISSION_LINES+=("$line")
done

if [ ${#MISSION_LINES[@]} -eq 0 ]; then
    MISSION_STATEMENT="Empowering enterprises with intelligent infrastructure automation, comprehensive observability, and AI-driven insights to accelerate digital transformation."
else
    MISSION_STATEMENT="${MISSION_LINES[*]}"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  REVIEW YOUR BRANDING CONFIGURATION"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "COMPANY BRANDING:"
echo "  Company Name: $COMPANY_NAME"
echo "  Full Name: $COMPANY_FULLNAME"
echo "  Tagline: $COMPANY_TAGLINE"
echo "  Founder: $FOUNDER_NAME"
echo "  Established: $ESTABLISHED_YEAR"
echo "  Logo Text: $LOGO_TEXT"
echo ""
echo "PLATFORM BRANDING:"
echo "  Name: $PLATFORM_NAME"
echo "  Version: $PLATFORM_VERSION"
echo "  Subtitle: $PLATFORM_SUBTITLE"
echo "  Description: $PLATFORM_DESCRIPTION"
echo ""
echo "CONTACT INFO:"
echo "  Email: $CONTACT_EMAIL"
echo "  Website: $CONTACT_WEBSITE"
echo "  GitHub: $CONTACT_GITHUB"
echo "  LinkedIn: $CONTACT_LINKEDIN"
echo "  Twitter: $CONTACT_TWITTER"
echo ""
echo "BRAND COLORS:"
echo "  Primary: $COLOR_PRIMARY"
echo "  Secondary: $COLOR_SECONDARY"
echo "  Accent: $COLOR_ACCENT"
echo ""
echo "MISSION:"
echo "  $MISSION_STATEMENT"
echo ""
echo "════════════════════════════════════════════════════════════════"
read -p "Does this look correct? (y/n): " CONFIRM

if [[ ! "$CONFIRM" =~ ^[Yy]$ ]]; then
    echo "Configuration cancelled. Please run the script again."
    exit 1
fi

echo ""
echo "Updating branding configuration..."

# Create the brand config file
cat > /home/rrd/iac/frontend-v3-new/src/config/brand.js << EOF
// Brand Configuration
// Auto-generated by configure-branding.sh

export const brandConfig = {
  // Company Information
  company: {
    name: "$COMPANY_NAME",
    fullName: "$COMPANY_FULLNAME",
    tagline: "$COMPANY_TAGLINE",
    founder: "$FOUNDER_NAME",
    established: "$ESTABLISHED_YEAR"
  },
  
  // Platform Information
  platform: {
    name: "$PLATFORM_NAME",
    version: "$PLATFORM_VERSION",
    subtitle: "$PLATFORM_SUBTITLE",
    description: "$PLATFORM_DESCRIPTION"
  },
  
  // Brand Colors
  colors: {
    primary: "$COLOR_PRIMARY",
    secondary: "$COLOR_SECONDARY",
    accent: "$COLOR_ACCENT",
    gradient: "linear-gradient(135deg, $COLOR_PRIMARY 0%, $COLOR_SECONDARY 100%)"
  },
  
  // Contact Information
  contact: {
    email: "$CONTACT_EMAIL",
    website: "$CONTACT_WEBSITE",
    github: "$CONTACT_GITHUB",
    linkedin: "$CONTACT_LINKEDIN",
    twitter: "$CONTACT_TWITTER"
  },
  
  // Branding Assets
  assets: {
    logoText: "$LOGO_TEXT",
    platformLogo: "$PLATFORM_NAME",
    poweredBy: "Powered by $COMPANY_NAME"
  },
  
  // Features & Values
  values: [
    "Innovation-Driven Architecture",
    "Enterprise-Grade Security",
    "AI-Powered Automation",
    "Cloud-Native Excellence"
  ],
  
  // Copyright
  copyright: \`© \${new Date().getFullYear()} $COMPANY_NAME. All rights reserved.\`,
  
  // Mission Statement
  mission: "$MISSION_STATEMENT"
};

export default brandConfig;
EOF

echo "✓ Brand configuration updated successfully!"
echo ""

# Update HTML title
sed -i "s|<title>.*</title>|<title>$PLATFORM_NAME - $PLATFORM_SUBTITLE | $COMPANY_NAME</title>|g" \
    /home/rrd/iac/frontend-v3-new/index.html

# Update meta description
if grep -q 'name="description"' /home/rrd/iac/frontend-v3-new/index.html; then
    sed -i "s|<meta name=\"description\" content=\".*\" />|<meta name=\"description\" content=\"$PLATFORM_NAME - $PLATFORM_SUBTITLE by $COMPANY_NAME. $PLATFORM_DESCRIPTION\" />|g" \
        /home/rrd/iac/frontend-v3-new/index.html
fi

# Update meta author
if grep -q 'name="author"' /home/rrd/iac/frontend-v3-new/index.html; then
    sed -i "s|<meta name=\"author\" content=\".*\" />|<meta name=\"author\" content=\"$FOUNDER_NAME\" />|g" \
        /home/rrd/iac/frontend-v3-new/index.html
fi

echo "✓ HTML metadata updated successfully!"
echo ""

# Create custom favicon with logo text
cat > /home/rrd/iac/frontend-v3-new/public/favicon.svg << EOF
<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="faviconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="$COLOR_PRIMARY" />
      <stop offset="100%" stop-color="$COLOR_SECONDARY" />
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="6" fill="url(#faviconGradient)"/>
  <text x="16" y="22" font-size="14" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial, sans-serif">$LOGO_TEXT</text>
</svg>
EOF

echo "✓ Custom favicon created successfully!"
echo ""
echo "════════════════════════════════════════════════════════════════"
echo "  BRANDING UPDATE COMPLETE!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "Next steps:"
echo "  1. Review the generated config: frontend-v3-new/src/config/brand.js"
echo "  2. Rebuild the Docker image:"
echo "     cd /home/rrd/iac/frontend-v3-new"
echo "     docker build -t iac-frontend:v3-custom ."
echo "  3. Redeploy the container:"
echo "     docker stop iac-frontend-v3-new"
echo "     docker rm iac-frontend-v3-new"
echo "     docker run -d --name iac-frontend-v3-new --network iac-v3-network -p 3000:3000 iac-frontend:v3-custom"
echo ""
echo "Would you like to rebuild and deploy now? (y/n)"
read -p "> " DEPLOY_NOW

if [[ "$DEPLOY_NOW" =~ ^[Yy]$ ]]; then
    echo ""
    echo "Building Docker image..."
    cd /home/rrd/iac/frontend-v3-new
    docker build --no-cache -t iac-frontend:v3-custom . 2>&1 | tail -20
    
    echo ""
    echo "Deploying container..."
    docker stop iac-frontend-v3-new 2>/dev/null
    docker rm iac-frontend-v3-new 2>/dev/null
    docker run -d --name iac-frontend-v3-new --network iac-v3-network -p 3000:3000 iac-frontend:v3-custom
    
    echo ""
    echo "Waiting for container to start..."
    sleep 3
    
    echo ""
    echo "Testing frontend..."
    curl -s http://localhost:3000/health
    echo ""
    
    echo ""
    echo "════════════════════════════════════════════════════════════════"
    echo "  🎉 DEPLOYMENT COMPLETE!"
    echo "════════════════════════════════════════════════════════════════"
    echo ""
    echo "  🌐 Frontend URL: http://localhost:3000"
    echo "  ✅ Status: Running"
    echo ""
    echo "  Your custom branding is now live!"
    echo ""
else
    echo ""
    echo "Configuration saved. Run the rebuild commands manually when ready."
fi
