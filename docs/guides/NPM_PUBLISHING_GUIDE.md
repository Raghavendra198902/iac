# 📦 NPM Package Publishing Guide

## Package Details

**Package Name**: `@raghavendra198902/iac-dharma`  
**Version**: 1.0.0  
**Registry**: npm (https://www.npmjs.com)  
**Scope**: @raghavendra198902

---

## Prerequisites

1. **npm Account**: Create at https://www.npmjs.com/signup
2. **npm CLI**: Already installed with Node.js
3. **Authentication**: Login to npm

---

## Step-by-Step Publishing

### 1. Login to npm

```bash
npm login
```

Enter your npm credentials:
- Username
- Password
- Email
- One-time password (if 2FA enabled)

### 2. Verify Login

```bash
npm whoami
```

Should display: `raghavendra198902` (or your npm username)

### 3. Test Package Locally (Optional)

```bash
# Create a test tarball
npm pack

# This creates: raghavendra198902-iac-dharma-1.0.0.tgz
# Test install locally:
npm install -g ./raghavendra198902-iac-dharma-1.0.0.tgz

# Test the CLI
iac-dharma info

# Uninstall test
npm uninstall -g @raghavendra198902/iac-dharma
```

### 4. Verify Package Contents

```bash
# See what will be included in the package
npm pack --dry-run
```

Expected files:
- cli/index.js
- QUICK_START.md
- RELEASE_NOTES.md
- CHANGELOG.md
- README.md (copied from README.npm.md)
- .env.example
- docker-compose.yml
- LICENSE
- package.json

### 5. Publish to npm

```bash
# Publish as public scoped package
npm publish --access public
```

Output should show:
```
+ @raghavendra198902/iac-dharma@1.0.0
```

### 6. Verify Publication

```bash
# Check package page
npm view @raghavendra198902/iac-dharma

# View on npm website
# https://www.npmjs.com/package/@raghavendra198902/iac-dharma
```

---

## Installation & Usage

Once published, users can install:

```bash
# Global installation (recommended)
npm install -g @raghavendra198902/iac-dharma

# Use the CLI
iac-dharma info
iac-dharma init --name my-project
iac-dharma start
```

---

## Publishing Updates

### Patch Release (1.0.1)
```bash
npm version patch
git push && git push --tags
npm publish
```

### Minor Release (1.1.0)
```bash
npm version minor
git push && git push --tags
npm publish
```

### Major Release (2.0.0)
```bash
npm version major
git push && git push --tags
npm publish
```

---

## Unpublishing (Use with Caution)

```bash
# Unpublish specific version
npm unpublish @raghavendra198902/iac-dharma@1.0.0

# Unpublish entire package (only within 72 hours)
npm unpublish @raghavendra198902/iac-dharma --force
```

⚠️ **Warning**: Unpublishing is permanent and can break dependent packages!

---

## Package Statistics

After publishing, you can track:

- **Downloads**: https://npm-stat.com/charts.html?package=@raghavendra198902/iac-dharma
- **Dependencies**: https://npmgraph.js.org/?q=@raghavendra198902/iac-dharma
- **Bundle Size**: https://bundlephobia.com/package/@raghavendra198902/iac-dharma

---

## Troubleshooting

### Error: 402 Payment Required
This error occurs for private packages on free accounts. Solution:
```bash
npm publish --access public
```

### Error: 403 Forbidden
- Check if package name is available
- Verify you're logged in: `npm whoami`
- Check organization/scope permissions

### Error: ENEEDAUTH
```bash
npm logout
npm login
```

### Package Name Already Exists
- Use scoped package: `@yourusername/package-name`
- Choose a different name

---

## Security Best Practices

1. **Enable 2FA**: https://www.npmjs.com/settings/~/tfa
2. **Use npm tokens** for CI/CD instead of passwords
3. **Audit dependencies**: `npm audit`
4. **Keep dependencies updated**: `npm outdated`
5. **Review before publishing**: `npm pack --dry-run`

---

## Automation with GitHub Actions

Create `.github/workflows/publish.yml`:

```yaml
name: Publish to npm

on:
  release:
    types: [created]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          registry-url: 'https://registry.npmjs.org'
      - run: npm ci
      - run: npm publish --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Post-Publishing Checklist

- [ ] Verify package appears on npm: https://www.npmjs.com/package/@raghavendra198902/iac-dharma
- [ ] Test global installation: `npm install -g @raghavendra198902/iac-dharma`
- [ ] Test CLI commands: `iac-dharma info`
- [ ] Update GitHub README with npm badge
- [ ] Announce release on GitHub Discussions
- [ ] Tweet about the release
- [ ] Update documentation with npm installation instructions

---

## Support & Issues

- **npm Profile**: https://www.npmjs.com/~raghavendra198902
- **Package Page**: https://www.npmjs.com/package/@raghavendra198902/iac-dharma
- **GitHub Issues**: https://github.com/Raghavendra198902/iac/issues
- **npm Support**: https://npmjs.com/support

---

## Quick Reference

```bash
# Login
npm login

# Test locally
npm pack && npm install -g ./raghavendra198902-iac-dharma-1.0.0.tgz

# Publish
npm publish --access public

# View published package
npm view @raghavendra198902/iac-dharma

# Install globally
npm install -g @raghavendra198902/iac-dharma

# Use CLI
iac-dharma info
```

---

**Ready to publish your first package!** 🚀

Run: `npm publish --access public`
