# Publish Process Documentation

This document describes the complete process for testing, building, and releasing the OBS Timer Electron app.

## Quick Publish Command

For a streamlined release process, run this single command:

```bash
npm run release:patch:github
```

This automated command handles version bumping, testing (unit + e2e), linting, type checks, building, and GitHub release creation.

## Manual Publish Process

If you need to run the publish process manually, follow these steps:

### 1. Test and Validate

Run tests and linting to ensure code quality:

```bash
# Run unit tests
npm test

# Run linting (warnings are acceptable, errors must be fixed)
npm run lint

# Optional: Fix auto-fixable lint issues
npm run lint:fix

# TypeScript type checks (no emit)
npm run typecheck

# End-to-end (Playwright) tests
npm run test:e2e
```

### 2. Build Production Version

Build the application for the current platform:

```bash
# Full production build (includes tests + lint)
npm run build:prod

# Or build without pre-checks (faster)
npm run build
```

### 3. Version Management

Bump the version using semantic versioning:

```bash
# Patch version (1.0.7 → 1.0.8)
npm run version:patch

# Minor version (1.0.7 → 1.1.0)
npm run version:minor

# Or manually edit package.json version field
```

### 4. Commit Changes

Commit all changes including version bump:

```bash
git add -A
git commit -m "chore: bump version to x.x.x and prepare for release

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 5. Build New Version

After version bump, rebuild with the new version:

```bash
npm run build
```

### 6. Deploy to GitHub

Push changes and create release:

```bash
# Push commits to main branch
git push origin main

# Create GitHub release with build artifacts
gh release create vX.X.X dist/*.dmg dist/*.blockmap \
  --title "Release vX.X.X" \
  --notes "Release description here"
```

## Build Outputs

The build process creates these artifacts in the `dist/` directory:

- `OBS Timer-X.X.X.dmg` - Intel (x64) macOS installer
- `OBS Timer-X.X.X-arm64.dmg` - Apple Silicon (ARM64) macOS installer
- `*.blockmap` files - Update verification files
- `mac/` and `mac-arm64/` - Unpacked app bundles

## Platform-Specific Builds

For other platforms:

```bash
# macOS only
npm run build:mac

# Windows (requires Windows or Wine)
npm run build:win

# Linux
npm run build:linux
```

## Development vs Production Builds

- **Development builds** (`npm run build:*`): Skip tests and linting for faster iteration
- **Production builds** (`npm run build:prod:*`): Include full test suite and linting

## Troubleshooting

### Common Issues

1. **Build timeout**: Electron-builder can take 2+ minutes on first run due to framework downloads
2. **Code signing**: macOS builds are signed but not notarized (requires Apple Developer account)
3. **Version conflicts**: Check for existing GitHub releases with same tag

### Prerequisites

- Node.js >= 18.0.0
- Git configured with GitHub access
- `gh` CLI tool installed and authenticated
- macOS for building .dmg files

## Automated Release Workflow

The `npm run release:patch:github` command combines all steps:

1. Runs tests and linting
2. Bumps patch version
3. Commits changes
4. Builds production version
5. Pushes to GitHub
6. Creates GitHub release with artifacts

This is the recommended approach for regular releases.
