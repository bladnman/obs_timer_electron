# Release Workflow

This document explains how to create releases for the OBS Timer application.

## Overview

The release process automatically:
1. ✅ **Runs all tests** - Ensures code quality
2. 🔍 **Runs linting + typecheck** - ESLint + TypeScript checks
3. 🧪 **Runs e2e tests** - Playwright browser tests
4. 📦 **Builds the application** - Creates distributables
5. 🏷️ **Bumps version** - Updates package.json
6. 📝 **Commits & tags** - Creates git commit and tag
7. 🚀 **Pushes to GitHub** - Uploads changes and tags
8. 🎯 **Creates GitHub release** (optional) - With built artifacts

## Prerequisites

### Required
- Clean git working directory (no uncommitted changes)
- All tests passing
- No linting errors

### Optional (for GitHub releases)
- [GitHub CLI](https://cli.github.com/) installed and authenticated
- Configured to push to your GitHub repository

## Quick Start

### Simple Release (Git only)
```bash
# Patch release (1.0.1 -> 1.0.2)
npm run release:patch

# Minor release (1.0.1 -> 1.1.0)  
npm run release:minor

# Major release (1.0.1 -> 2.0.0)
npm run release:major
```

### Full GitHub Release (with artifacts)
```bash
# Patch release + GitHub release with built files
npm run release:patch:github

# Minor release + GitHub release  
npm run release:minor:github

# Major release + GitHub release
npm run release:major:github
```

## Manual Release Script

You can also run the release script directly for more control:

```bash
# Basic releases
node scripts/release.js patch
node scripts/release.js minor  
node scripts/release.js major

# With GitHub release creation
node scripts/release.js patch --github
node scripts/release.js minor -g
node scripts/release.js major --github
```

## What Gets Built

The release process creates these artifacts in the `dist/` folder:
- **macOS**: `.dmg` installer (universal: x64 + arm64)
- **Windows**: `.exe` NSIS installer (x64)
- **Linux**: `.AppImage` portable app (x64)

## GitHub Release Features

When using the GitHub release option (`--github` or `:github` scripts):

- 📦 **Automatic artifact upload** - All built files are attached
- 📝 **Generated release notes** - Professional changelog
- 🏷️ **Proper versioning** - Semantic version tags
- 🔗 **Direct download links** - Easy distribution

## Semantic Versioning

We follow [semantic versioning](https://semver.org/):

- **Patch** (1.0.1 → 1.0.2): Bug fixes, small improvements
- **Minor** (1.0.1 → 1.1.0): New features, backward compatible
- **Major** (1.0.1 → 2.0.0): Breaking changes, major redesigns

## Release Process Details

### 1. Pre-flight Checks
- Validates git working directory is clean
- Ensures you're in a git repository
- Validates release type (patch/minor/major)

### 2. Testing & Quality
- Runs ESLint (`npm run lint`)
- Runs TypeScript type checks (`npm run typecheck`)
- Runs Jest unit tests (`npm run test`)
- Runs Playwright e2e tests (`npm run test:e2e`)
- Stops immediately if any step fails

### 3. Building
- Cleans previous builds
- Builds client-side code with Vite
- Creates Electron packages for all platforms
- Uses existing `prebuild` scripts for consistency

### 4. Version Management
- Updates `package.json` version
- Creates descriptive commit message
- Tags commit with version (e.g., `v1.0.2`)

### 5. Git Operations
- Commits version bump
- Pushes to origin branch
- Pushes tags to origin

### 6. GitHub Release (Optional)
- Creates GitHub release with proper title
- Uploads all built artifacts as release assets
- Includes auto-generated release notes
- Links to installation instructions

## Troubleshooting

### "Working directory is not clean"
```bash
# Check what files are changed
git status

# Either commit your changes
git add . && git commit -m "your changes"

# Or stash them temporarily  
git stash
```

### "Tests failed"
Fix any failing tests before releasing:
```bash
npm run test
```

### "Linting errors"
Fix code style issues:
```bash
npm run lint:fix
```

### GitHub CLI not available
If you see "GitHub CLI not available":
1. Install it: https://cli.github.com/
2. Authenticate: `gh auth login`
3. Or create releases manually in GitHub web interface

### Build failures
Check that all dependencies are installed:
```bash
npm install
```

## Example Workflow

```bash
# 1. Make sure you're ready
git status
npm run verify

# 2. Create a patch release with GitHub artifacts
npm run release:patch:github

# 3. Verify the release
# - Check GitHub releases page
# - Download and test an installer
# - Verify version numbers match
```

## Best Practices

1. **Always test locally first**: Run `npm run build:prod` before releasing
2. **Use semantic versioning**: Choose the right release type
3. **Keep changelogs**: Consider maintaining a CHANGELOG.md
4. **Test installers**: Download and verify the built packages work
5. **Coordinate with team**: Announce releases in appropriate channels

## GitHub Release Example

After a successful release with `--github`, your GitHub repository will have:

- 🏷️ New tag: `v1.0.2`
- 📝 Release page with download links
- 📦 Attached installers: 
  - `OBS-Timer-1.0.2.dmg` (macOS)
  - `OBS-Timer-Setup-1.0.2.exe` (Windows)  
  - `OBS-Timer-1.0.2.AppImage` (Linux)

Users can then easily download and install the latest version! 
