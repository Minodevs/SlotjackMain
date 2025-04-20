/**
 * Script to physically remove unnecessary files from function bundles
 * This runs post-build to keep function size under Netlify's 250MB limit
 */

const fs = require('fs');
const path = require('path');

// Directories to look for function bundles
const FUNCTION_DIRS = [
  '.netlify/functions-internal',
  '.netlify/functions',
];

// File patterns to remove (heavy and unnecessary files)
const REMOVE_PATTERNS = [
  /\.git/,
  /\.github/,
  /\.map$/,
  /\.d\.ts$/,
  /test\.js$/,
  /tests\//,
  /\.spec\.js$/,
  /\/__tests__\//,
  /\/doc(s)?\//,
  /\/example(s)?\//,
  /\/LICENSE/,
  /\.md$/,
  /package-lock\.json$/,
  /yarn\.lock$/,
  /\.DS_Store$/,
  /tsconfig\.json$/,
  /Makefile$/,
  /\.editorconfig$/,
  /\.eslint/,
  /\.prettier/,
  /sharp\/vendor\/lib\/libvips-cpp\.42\.dylib/, // macOS-specific sharp files
  /sharp\/vendor\/lib\/libvips-cpp\.so\.42/, // Linux-specific sharp files
  /sharp\/vendor\/lib\/libvips-cpp\.42\.dll/, // Windows-specific sharp files
];

// Extra large packages to check and remove unnecessary parts
const LARGE_PACKAGES = [
  'sharp',
  'puppeteer',
  'chrome-aws-lambda',
  'opencv',
  'image-js',
  'canvas',
];

function getDirectorySize(dir) {
  let size = 0;
  try {
    const files = fs.readdirSync(dir, { withFileTypes: true });
    for (const file of files) {
      const filePath = path.join(dir, file.name);
      if (file.isDirectory()) {
        size += getDirectorySize(filePath);
      } else {
        const stats = fs.statSync(filePath);
        size += stats.size;
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err.message);
  }
  return size;
}

function bytesToMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2);
}

function shouldRemove(filePath) {
  return REMOVE_PATTERNS.some(pattern => pattern.test(filePath));
}

function removeUnnecessaryFiles(dir) {
  try {
    if (!fs.existsSync(dir)) return 0;
    
    let filesRemoved = 0;
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stats = fs.statSync(itemPath);
      
      if (stats.isDirectory()) {
        filesRemoved += removeUnnecessaryFiles(itemPath);
      } else if (shouldRemove(itemPath)) {
        fs.unlinkSync(itemPath);
        filesRemoved++;
      }
    }
    
    return filesRemoved;
  } catch (err) {
    console.error(`Error in removeUnnecessaryFiles for ${dir}:`, err.message);
    return 0;
  }
}

function findAndOptimizeFunctions() {
  for (const functionDir of FUNCTION_DIRS) {
    const fullFunctionDir = path.join(process.cwd(), functionDir);
    
    if (!fs.existsSync(fullFunctionDir)) {
      console.log(`Directory ${functionDir} not found, skipping`);
      continue;
    }
    
    const initialSize = getDirectorySize(fullFunctionDir);
    console.log(`\nChecking functions in ${functionDir}`);
    console.log(`Initial total size: ${bytesToMB(initialSize)} MB`);
    
    // Find all function directories
    const functions = fs.readdirSync(fullFunctionDir);
    
    for (const func of functions) {
      const funcPath = path.join(fullFunctionDir, func);
      
      if (!fs.statSync(funcPath).isDirectory()) continue;
      
      const beforeSize = getDirectorySize(funcPath);
      console.log(`\n- Function ${func}: ${bytesToMB(beforeSize)} MB`);
      
      if (beforeSize > 200 * 1024 * 1024) {
        console.log(`  ⚠️ Function approaching size limit, optimizing...`);
        
        // Check for node_modules directory
        const nodeModulesPath = path.join(funcPath, 'node_modules');
        if (fs.existsSync(nodeModulesPath)) {
          // Find and remove unnecessary files
          const filesRemoved = removeUnnecessaryFiles(nodeModulesPath);
          
          // Check large packages specifically
          for (const pkg of LARGE_PACKAGES) {
            const pkgPath = path.join(nodeModulesPath, pkg);
            if (fs.existsSync(pkgPath)) {
              const pkgSizeBefore = getDirectorySize(pkgPath);
              console.log(`  - Found ${pkg}: ${bytesToMB(pkgSizeBefore)} MB`);
              
              // Extra optimization for specific packages
              if (pkg === 'sharp') {
                const vendorPath = path.join(pkgPath, 'vendor');
                if (fs.existsSync(vendorPath)) {
                  const vendorSizeBefore = getDirectorySize(vendorPath);
                  const vendorFilesRemoved = removeUnnecessaryFiles(vendorPath);
                  const vendorSizeAfter = getDirectorySize(vendorPath);
                  console.log(`    - Optimized sharp/vendor: ${bytesToMB(vendorSizeBefore)} MB → ${bytesToMB(vendorSizeAfter)} MB (-${bytesToMB(vendorSizeBefore - vendorSizeAfter)} MB)`);
                }
              }
              
              const pkgSizeAfter = getDirectorySize(pkgPath);
              if (pkgSizeBefore !== pkgSizeAfter) {
                console.log(`    - Optimized ${pkg}: ${bytesToMB(pkgSizeBefore)} MB → ${bytesToMB(pkgSizeAfter)} MB (-${bytesToMB(pkgSizeBefore - pkgSizeAfter)} MB)`);
              }
            }
          }
          
          const afterSize = getDirectorySize(funcPath);
          console.log(`  - Size after optimization: ${bytesToMB(afterSize)} MB (-${bytesToMB(beforeSize - afterSize)} MB)`);
          console.log(`  - Removed ${filesRemoved} unnecessary files`);
        } else {
          console.log(`  - No node_modules directory found in function`);
        }
      }
    }
    
    const finalSize = getDirectorySize(fullFunctionDir);
    console.log(`\nFinal total size: ${bytesToMB(finalSize)} MB (-${bytesToMB(initialSize - finalSize)} MB)`);
  }
}

console.log('🔍 Starting function size optimization...');
findAndOptimizeFunctions();
console.log('✅ Function size optimization complete'); 