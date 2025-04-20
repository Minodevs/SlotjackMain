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
if (fs.existsSync(BUILD_DIR)) {
  try {
    execSync(`rm -rf ${BUILD_DIR}`);
  } catch (error) {
    console.error(`Failed to remove ${BUILD_DIR} directory:`, error);
    // Try alternative method for Windows
    try {
      execSync(`rd /s /q ${BUILD_DIR}`);
    } catch (winError) {
      console.error('Failed with Windows command too:', winError);
    }
  }
}

// Run Next.js build
console.log('🏗️ Building Next.js application...');
try {
  execSync('next build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error);
  process.exit(1);
}

// Create the deployment directory
console.log('📂 Setting up deployment directory...');
if (!fs.existsSync(DEPLOYMENT_DIR)) {
  fs.mkdirSync(DEPLOYMENT_DIR, { recursive: true });
}

// Copy necessary files to deployment directory
console.log('📋 Copying files to deployment directory...');
try {
  // Copy the .next folder
  execSync(`cp -r ${BUILD_DIR}/* ${DEPLOYMENT_DIR}/`);
  
  // Copy other necessary files
  const filesToCopy = [
    'netlify.toml',
    '.nvmrc',
    'package.json',
    'package-lock.json',
    'next.config.js'
  ];
  
  filesToCopy.forEach(file => {
    if (fs.existsSync(file)) {
      fs.copyFileSync(file, path.join(DEPLOYMENT_DIR, file));
    }
  });
  
  console.log('✅ Files copied successfully');
} catch (error) {
  console.error('❌ Copy failed:', error);
  // Try alternative Windows commands
  try {
    execSync(`xcopy /E /I /Y ${BUILD_DIR}\\* ${DEPLOYMENT_DIR}\\`);
    console.log('✅ Files copied successfully using Windows command');
  } catch (winError) {
    console.error('Failed with Windows command too:', winError);
    process.exit(1);
  }
}

console.log('🚀 Netlify build ready for deployment!');
console.log(`📁 Deployment folder: ${DEPLOYMENT_DIR}`);
console.log('Run "npm run deploy" to deploy to Netlify'); 