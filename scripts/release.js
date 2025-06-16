#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const RELEASE_TYPES = ['patch', 'minor', 'major'];

function log(message) {
  console.log(`🚀 ${message}`);
}

function error(message) {
  console.error(`❌ ${message}`);
  process.exit(1);
}

function run(command, description) {
  log(description);
  try {
    const output = execSync(command, { stdio: 'inherit', cwd: process.cwd() });
    return output;
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    error(`Failed: ${description}\nCommand: ${command}\nError: ${err.message}`);
  }
}

function getVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  return packageJson.version;
}

function validateGitStatus() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
      error('Working directory is not clean. Please commit or stash your changes first.');
    }
  // eslint-disable-next-line no-unused-vars
  } catch (err) {
    error('Failed to check git status. Make sure you\'re in a git repository.');
  }
}

function validateReleaseType(type) {
  if (!RELEASE_TYPES.includes(type)) {
    error(`Invalid release type: ${type}. Must be one of: ${RELEASE_TYPES.join(', ')}`);
  }
}

function createGitHubRelease(version) {
  log('Creating GitHub release...');
  
  const releaseNotes = `# Release v${version}

## What's New
- Automated release with comprehensive testing
- Built with tests passing and linting clean

## Download
Download the appropriate installer for your platform from the assets below.

## Installation
- **macOS**: Download and install the .dmg file
- **Windows**: Download and run the .exe installer
- **Linux**: Download and run the .AppImage file

---
*This release was automatically generated and tested.*`;

  // Save release notes to a temporary file
  const notesFile = path.join(__dirname, '../release-notes.md');
  fs.writeFileSync(notesFile, releaseNotes);

  try {
    // Check if we have the GitHub CLI
    execSync('gh --version', { stdio: 'pipe' });
    
    // Create the release with GitHub CLI
    // Use glob patterns that match actual build artifacts
    const distFiles = [
      `dist/OBS Timer-${version}.dmg`,
      `dist/OBS Timer-${version}-arm64.dmg`,
      'dist/*.exe', 
      'dist/*.AppImage',
      'dist/*.zip'
    ].filter(file => {
      // Only include files that exist for current build
      if (file.includes('*.')) return true; // Keep glob patterns for potential future builds
      return fs.existsSync(file);
    }).join(' ');

    const releaseCommand = `gh release create v${version} ${distFiles} --title "Release v${version}" --notes-file "${notesFile}" --draft=false`;
    
    run(releaseCommand, 'Creating GitHub release with artifacts');
    
    // Clean up
    fs.unlinkSync(notesFile);
    
    log(`✅ GitHub release v${version} created successfully!`);
    log(`🔗 View at: https://github.com/$(git config --get remote.origin.url | sed 's/.*:///' | sed 's/.git$//')/releases/tag/v${version}`);
    
  } catch (err) {
    log('⚠️  GitHub CLI not available or not authenticated.');
    log('📝 Manual steps to create GitHub release:');
    log(`   1. Go to your GitHub repository's Releases page`);
    log(`   2. Click "Create a new release"`);
    log(`   3. Tag: v${version}`);
    log(`   4. Title: Release v${version}`);
    log(`   5. Upload files from dist/ folder as assets`);
    log(`   6. Publish the release`);
    
    // Still clean up the notes file
    if (fs.existsSync(notesFile)) {
      fs.unlinkSync(notesFile);
    }
  }
}

function main() {
  const args = process.argv.slice(2);
  const releaseType = args[0];
  const shouldCreateGitHubRelease = args.includes('--github') || args.includes('-g');

  if (!releaseType) {
    error(`Usage: node scripts/release.js <patch|minor|major> [--github|-g]
    
Examples:
  node scripts/release.js patch           # Create a patch release
  node scripts/release.js minor --github # Create a minor release and GitHub release
  node scripts/release.js major -g       # Create a major release and GitHub release`);
  }

  validateReleaseType(releaseType);
  validateGitStatus();

  const oldVersion = getVersion();
  log(`Starting ${releaseType} release from version ${oldVersion}`);

  // Bump version
  run(`npm version ${releaseType} --no-git-tag-version`, `Bumping ${releaseType} version`);
  
  const newVersion = getVersion();
  log(`Version bumped to ${newVersion}`);

  // Run tests and build
  run('npm run test', 'Running tests');
  run('npm run lint', 'Running linter');
  run('npm run build', 'Building application');

  // Git operations
  run('git add package.json', 'Staging version change');
  run(`git commit -m "chore: bump version to ${newVersion}"`, 'Committing version bump');
  run(`git tag v${newVersion}`, 'Creating git tag');
  run('git push origin', 'Pushing to origin');
  run('git push origin --tags', 'Pushing tags');

  log(`✅ Release v${newVersion} completed successfully!`);

  if (shouldCreateGitHubRelease) {
    createGitHubRelease(newVersion);
  } else {
    log('💡 To create a GitHub release with built artifacts, run:');
    log(`   node scripts/release.js ${releaseType} --github`);
  }
}

if (require.main === module) {
  main();
} 