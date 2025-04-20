#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const BUILD_DIR = '.next';
const DEPLOYMENT_DIR = 'deployment';

console.log('📦 Starting Netlify build process...');

// Clean previous builds
console.log('🧹 Cleaning previous builds...');
try {
  // Use PowerShell for Windows compatibility
  execSync('if (Test-Path .next) { Remove-Item -Recurse -Force .next }', { shell: 'powershell.exe' });
  execSync('if (Test-Path node_modules\\.cache) { Remove-Item -Recurse -Force node_modules\\.cache }', { shell: 'powershell.exe' });
  console.log('✅ Cleaned .next directory and build cache');
} catch (error) {
  console.error('Failed to clean directories:', error);
}

// Run Next.js build with full export
console.log('🏗️ Building Next.js application with full page export...');
try {
  // Set environment variables to skip TypeScript and ESLint checks
  // and ensure full static export
  const env = {
    ...process.env,
    NEXT_TELEMETRY_DISABLED: '1',
    NEXT_SKIP_ESLINT_DURING_BUILD: 'true',
    NEXT_SKIP_TYPE_CHECK: 'true',
    NODE_ENV: 'production',
    NEXT_EXPORT: 'true',
    NEXT_PUBLIC_DEPLOY_ENV: 'production',
  };
  
  // Force complete rebuild with all pages
  execSync('next build', { 
    stdio: 'inherit', 
    env,
    maxBuffer: 10 * 1024 * 1024 // 10MB buffer to handle larger outputs
  });
  
  console.log('✅ Build completed successfully');
  
  // Generate sitemap
  console.log('📍 Generating sitemap...');
  execSync('next-sitemap', { stdio: 'inherit' });
  
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

// Create the deployment directory if it doesn't exist
console.log('📂 Setting up deployment directory...');
if (!fs.existsSync(DEPLOYMENT_DIR)) {
  fs.mkdirSync(DEPLOYMENT_DIR, { recursive: true });
}

// Copy necessary files to deployment directory
console.log('📋 Copying files to deployment directory...');
try {
  // Use PowerShell for Windows compatibility
  execSync(`if (Test-Path ${BUILD_DIR}) { Copy-Item -Path ${BUILD_DIR}/* -Destination ${DEPLOYMENT_DIR}/ -Recurse -Force }`, 
    { shell: 'powershell.exe' });
  
  // Copy public folder to ensure all static assets are included
  execSync(`if (Test-Path public) { Copy-Item -Path public/* -Destination ${DEPLOYMENT_DIR}/ -Recurse -Force }`, 
    { shell: 'powershell.exe' });
  
  // Copy additional files needed for Netlify
  const filesToCopy = [
    'netlify.toml',
    '.nvmrc',
    'package.json',
    'package-lock.json',
    'next.config.js',
    'public/robots.txt',
    'public/sitemap.xml',
    'public/sitemap-0.xml'
  ];
  
  for (const file of filesToCopy) {
    if (fs.existsSync(file)) {
      // Create directory structure if needed
      const targetPath = path.join(DEPLOYMENT_DIR, file);
      const targetDir = path.dirname(targetPath);
      
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      fs.copyFileSync(file, targetPath);
      console.log(`Copied ${file} to ${targetPath}`);
    }
  }
  
  console.log('✅ Files copied successfully');
  
  // Create a verification file to ensure the build is fresh
  const buildInfo = {
    timestamp: new Date().toISOString(),
    commit: process.env.COMMIT_REF || 'local-build',
    buildId: Math.random().toString(36).substring(2, 15)
  };
  
  fs.writeFileSync(
    path.join(DEPLOYMENT_DIR, 'build-info.json'), 
    JSON.stringify(buildInfo, null, 2)
  );
  
} catch (error) {
  console.error('❌ Copy failed:', error);
  process.exit(1);
}

console.log('🚀 Netlify build ready for deployment!');
console.log(`📁 Deployment folder: ${DEPLOYMENT_DIR}`);
console.log('Run "npm run deploy" to deploy to Netlify'); 