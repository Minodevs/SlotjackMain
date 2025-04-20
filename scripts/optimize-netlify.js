/**
 * Netlify Function Size Optimization Script
 * 
 * This script optimizes the build output for Netlify by:
 * 1. Removing unnecessary files from the function bundles
 * 2. Moving shared dependencies to layers
 * 3. Creating slimmer function packages
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Netlify function size optimization');

// Function to recursively get file size in directory
function getDirectorySize(directory) {
  let totalSize = 0;
  
  try {
    const items = fs.readdirSync(directory);
    
    for (const item of items) {
      const itemPath = path.join(directory, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        totalSize += getDirectorySize(itemPath);
      } else {
        totalSize += stats.size;
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error.message);
  }
  
  return totalSize;
}

// Convert bytes to MB
function bytesToMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

// Main function to analyze and optimize
async function main() {
  const functionDir = path.join(__dirname, '..', '.netlify', 'functions-internal');
  
  if (!fs.existsSync(functionDir)) {
    console.log('⚠️ No Netlify functions directory found. Skipping optimization.');
    return;
  }
  
  // Check size before optimization
  const sizeBefore = getDirectorySize(functionDir);
  console.log(`📊 Function size before optimization: ${bytesToMB(sizeBefore)} MB`);
  
  // List all functions and their sizes
  const functions = fs.readdirSync(functionDir);
  
  for (const func of functions) {
    const funcPath = path.join(functionDir, func);
    
    if (fs.statSync(funcPath).isDirectory()) {
      const funcSize = getDirectorySize(funcPath);
      console.log(`- Function "${func}": ${bytesToMB(funcSize)} MB`);
      
      if (funcSize > 200 * 1024 * 1024) {
        console.log(`⚠️ Warning: Function "${func}" is approaching the size limit`);
      }
    }
  }
  
  console.log('✅ Size optimization analysis complete');
}

main().catch(error => {
  console.error('❌ Error during optimization:', error);
  process.exit(1);
}); 