# 🎨 IAC DHARMA - Branding Configuration Guide

## Overview

This guide helps you customize both **Platform Branding** (IAC DHARMA) and **Company/Personal Branding** (Your Brand) for the enterprise architecture platform.

---

## 🚀 Quick Start - Interactive Configuration

### Option 1: Run the Interactive Script (Recommended)

```bash
cd /home/rrd/iac
./configure-branding.sh
```

The script will guide you through:
1. **Company/Personal Branding** - Your business identity
2. **Platform Branding** - IAC DHARMA customization
3. **Contact Information** - Social links and contact details
4. **Brand Colors** - Custom color scheme
5. **Mission & Values** - Your mission statement

After configuration, it offers to automatically rebuild and deploy!

---

## 📋 Information You'll Need

### 1. Company/Personal Branding

| Field | Example | Description |
|-------|---------|-------------|
| **Company Name** | `RRD Technologies` | Your company or brand name |
| **Full Company Name** | `Raghavendra R D - Enterprise Solutions` | Extended/formal name |
| **Company Tagline** | `Innovating Infrastructure, Empowering Enterprises` | Your value proposition |
| **Founder Name** | `Raghavendra R D` | Founder/Owner name |
| **Established Year** | `2024` | Year founded/established |
| **Logo Text** | `RRD` | 2-4 character initials for logo |

### 2. Platform Branding

| Field | Example | Description |
|-------|---------|-------------|
| **Platform Name** | `IAC DHARMA` | Name of the platform |
| **Platform Version** | `v3.0` | Current version |
| **Platform Subtitle** | `Enterprise Architecture Platform` | Brief descriptor |
| **Platform Description** | `AI-Powered Infrastructure...` | Full description |

### 3. Contact Information

| Field | Example | Required |
|-------|---------|----------|
| **Email** | `contact@rrdtech.io` | ✅ Yes |
| **Website** | `https://rrdtech.io` | ✅ Yes |
| **GitHub** | `https://github.com/Raghavendra198902` | Recommended |
| **LinkedIn** | `https://linkedin.com/in/raghavendra-rd` | Recommended |
| **Twitter/X** | `https://twitter.com/raghavendra_rd` | Optional |

### 4. Brand Colors (Hex Format)

| Color | Default | Purpose |
|-------|---------|---------|
| **Primary** | `#667eea` | Main brand color (purple) |
| **Secondary** | `#764ba2` | Secondary color (magenta) |
| **Accent** | `#f093fb` | Accent highlights (pink) |

### 5. Mission Statement

Your company's mission - what you do and why. Example:
> "Empowering enterprises with intelligent infrastructure automation, comprehensive observability, and AI-driven insights to accelerate digital transformation."

---

## 🎯 Where Your Branding Appears

### Header (Navigation Bar)
- Logo with your initials (e.g., "RRD")
- Platform name: "IAC DHARMA"
- Company tagline in small text

### Hero Section (Home Page)
- Large logo icon
- Platform name with gradient effect
- Platform description
- **"Founded by [Your Name] • [Year]"**
- Mission statement

### Footer
- Company logo with name
- Full mission statement
- **Founder attribution**: "Founder: [Your Name]"
- **Establishment**: "Established: [Year]"
- Social media links (GitHub, LinkedIn, Twitter)
- Service links to all platform components
- **Copyright**: "© [Year] [Company Name]. All rights reserved."
- **Powered by**: "Powered by [Company Name]"

### Browser Tab
- **Title**: "[Platform] - [Subtitle] | [Company]"
- **Favicon**: Custom SVG with your logo text
- **Meta Description**: SEO-optimized with your branding

---

## 🛠️ Manual Configuration

If you prefer to edit directly:

### Edit Brand Config

```bash
nano /home/rrd/iac/frontend-v3-new/src/config/brand.js
```

Key sections to update:
```javascript
export const brandConfig = {
  company: {
    name: "Your Company Name",
    founder: "Your Name",
    tagline: "Your Tagline",
    established: "2024"
  },
  
  platform: {
    name: "IAC DHARMA",
    version: "v3.0",
    subtitle: "Enterprise Architecture Platform"
  },
  
  contact: {
    email: "your-email@example.com",
    website: "https://your-website.com",
    github: "https://github.com/your-username",
    linkedin: "https://linkedin.com/in/your-profile"
  },
  
  colors: {
    primary: "#667eea",
    secondary: "#764ba2",
    accent: "#f093fb"
  }
};
```

### Rebuild After Changes

```bash
cd /home/rrd/iac/frontend-v3-new

# Build new image
docker build -t iac-frontend:v3-custom .

# Stop and remove old container
docker stop iac-frontend-v3-new
docker rm iac-frontend-v3-new

# Deploy new container
docker run -d \
  --name iac-frontend-v3-new \
  --network iac-v3-network \
  -p 3000:3000 \
  iac-frontend:v3-custom

# Test
curl http://localhost:3000/health
```

---

## 🎨 Customizing Colors

### Update CSS Variables

Edit `/home/rrd/iac/frontend-v3-new/src/styles/index.css`:

```css
:root {
  /* Update these with your brand colors */
  --brand-primary: #667eea;
  --brand-secondary: #764ba2;
  --brand-accent: #f093fb;
}
```

### Logo Colors

The logo automatically uses colors from `brandConfig.colors` in:
- `src/components/Logo.jsx`

---

## 🖼️ Custom Logo Design

### Replace Logo Component

Edit `/home/rrd/iac/frontend-v3-new/src/components/Logo.jsx`:

Current logo features:
- **RRD text** in center
- **Dharma wheel** overlay (8 spokes)
- **Infrastructure nodes** at bottom
- Gradient colors from brand config

To customize:
1. Update SVG paths in the `Logo.jsx` file
2. Change text to your initials
3. Modify geometric shapes as needed
4. Colors auto-sync with brand config

---

## 📊 Branding Checklist

Before going live, verify:

- [ ] Company name appears in header and footer
- [ ] Founder name shows in footer and hero
- [ ] All social media links are correct
- [ ] Email and website links work
- [ ] Logo displays properly in all sizes
- [ ] Favicon shows in browser tab
- [ ] Browser title includes your branding
- [ ] Colors match your brand guidelines
- [ ] Mission statement is accurate
- [ ] Copyright year is current
- [ ] Mobile view looks good

---

## 🔄 Quick Brand Updates

### Change Company Name Only
```bash
sed -i 's/name: ".*"/name: "Your New Name"/' \
  /home/rrd/iac/frontend-v3-new/src/config/brand.js
```

### Change Logo Text Only
```bash
sed -i 's/logoText: ".*"/logoText: "XYZ"/' \
  /home/rrd/iac/frontend-v3-new/src/config/brand.js
```

### Change Colors Only
```bash
# Edit colors in brand.js
nano /home/rrd/iac/frontend-v3-new/src/config/brand.js
```

After any change, rebuild and redeploy!

---

## 🎬 Video Walkthrough

### Interactive Script Demo

```bash
# Run the script
./configure-branding.sh

# Follow the prompts:
# 1. Enter company info
# 2. Enter platform details
# 3. Provide contact info
# 4. Set brand colors (or use defaults)
# 5. Write mission statement
# 6. Review and confirm
# 7. Auto-build and deploy (optional)
```

---

## 💡 Best Practices

1. **Keep Logo Text Short**: 2-4 characters work best (e.g., RRD, IBM, AWS)
2. **Mission Statement**: Keep under 200 characters for best display
3. **Colors**: Ensure good contrast for accessibility
4. **Test All Links**: Verify social media and contact links work
5. **Mobile First**: Check branding on mobile screens
6. **Consistent Tone**: Maintain consistent voice across all text
7. **Legal Review**: Ensure copyright and legal text is accurate

---

## 📞 Support

Need help with branding?

- **Documentation**: This file!
- **Interactive Script**: `./configure-branding.sh`
- **Manual Config**: `frontend-v3-new/src/config/brand.js`
- **Logo Component**: `frontend-v3-new/src/components/Logo.jsx`

---

## 🎉 Example Configurations

### Tech Startup
```javascript
company: {
  name: "CloudOps Pro",
  founder: "Jane Smith",
  tagline: "Simplifying Cloud Operations"
}
```

### Consulting Firm
```javascript
company: {
  name: "DevOps Consulting Group",
  founder: "John Doe & Partners",
  tagline: "Enterprise DevOps Excellence"
}
```

### Solo Consultant
```javascript
company: {
  name: "Mike Chen Solutions",
  founder: "Mike Chen",
  tagline: "Infrastructure Automation Expert"
}
```

---

## 📝 License

Your branding, your rules! The platform respects your intellectual property.

---

**Ready to brand your platform?** Run `./configure-branding.sh` now! 🚀
