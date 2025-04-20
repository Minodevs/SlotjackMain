#!/usr/bin/env node

/**
 * Custom build script for static export to Netlify
 * This script handles:
 * 1. Cleaning previous build artifacts
 * 2. Setting environment variables
 * 3. Running Next.js build with static export
 * 4. Post-processing the static export
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { apiExcludes } = require('./excludes');

// Configuration
const buildDir = path.resolve(__dirname, '.next');
const outDir = path.resolve(__dirname, 'out');
const cacheDir = path.resolve(__dirname, 'node_modules/.cache');

// Environment variables
const env = {
  NODE_ENV: 'production',
  NETLIFY: 'true',
  NEXT_EXPORT: 'true',
  NEXT_SKIP_ESLINT_DURING_BUILD: 'true',
  NEXT_SKIP_TYPE_CHECK: 'true',
  NEXT_TELEMETRY_DISABLED: '1',
};

console.log('🚀 Starting custom static build process');

// Clean up previous build artifacts
function cleanArtifacts() {
  console.log('🧹 Cleaning previous build artifacts');
  
  [buildDir, outDir, cacheDir].forEach(dir => {
    if (fs.existsSync(dir)) {
      console.log(`  Removing ${path.relative(__dirname, dir)}`);
      fs.rmSync(dir, { recursive: true, force: true });
    }
  });
}

// Execute command with proper environment variables
function executeCommand(command) {
  console.log(`🔄 Executing: ${command}`);
  
  const envString = Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join(' ');
  
  try {
    execSync(`${envString} ${command}`, {
      stdio: 'inherit',
      env: { ...process.env, ...env },
    });
  } catch (error) {
    console.error('❌ Command failed:', error.message);
    process.exit(1);
  }
}

// Delete unwanted API routes before build
function removeApiRoutes() {
  console.log('🚫 Removing API routes from source directory (temporarily)');
  
  const apiDir = path.resolve(__dirname, 'src/app/api');
  const apiBackupDir = path.resolve(__dirname, '.api-backup');
  
  // Create backup of API directory
  if (fs.existsSync(apiDir)) {
    console.log(`  Creating backup of API directory to ${path.relative(__dirname, apiBackupDir)}`);
    
    // Make sure backup directory exists and is empty
    if (fs.existsSync(apiBackupDir)) {
      fs.rmSync(apiBackupDir, { recursive: true, force: true });
    }
    
    fs.mkdirSync(apiBackupDir, { recursive: true });
    
    // Copy API directory to backup
    fs.cpSync(apiDir, apiBackupDir, { recursive: true });
    
    // Remove the original API directory
    fs.rmSync(apiDir, { recursive: true, force: true });
    
    // Create an empty API directory with a placeholder
    fs.mkdirSync(apiDir, { recursive: true });
    fs.writeFileSync(path.join(apiDir, 'placeholder.txt'), 'This directory is intentionally empty for static build.');
  }
  
  return apiBackupDir;
}

// Restore API routes after build
function restoreApiRoutes(apiBackupDir) {
  console.log('🔄 Restoring API routes from backup');
  
  const apiDir = path.resolve(__dirname, 'src/app/api');
  
  if (fs.existsSync(apiBackupDir)) {
    // Remove the empty API directory
    if (fs.existsSync(apiDir)) {
      fs.rmSync(apiDir, { recursive: true, force: true });
    }
    
    // Copy backup back to original location
    fs.cpSync(apiBackupDir, apiDir, { recursive: true });
    
    // Remove backup
    fs.rmSync(apiBackupDir, { recursive: true, force: true });
  }
}

// Main execution
async function main() {
  try {
    // Clean up previous build artifacts
    cleanArtifacts();
    
    // Temporarily remove API routes
    const apiBackupDir = removeApiRoutes();
    
    // Run Next.js build
    executeCommand('next build');
    
    // Post-process the build with our prepare-netlify script
    executeCommand('node scripts/prepare-netlify.js');
    
    // Restore API routes
    restoreApiRoutes(apiBackupDir);
    
    console.log('✅ Build completed successfully!');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

// Run the build process
main(); 