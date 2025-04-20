#!/usr/bin/env node

/**
 * This script prepares the build output for Netlify deployment.
 * It ensures static API paths work correctly by:
 * 1. Creating redirect rules for API paths
 * 2. Setting up proper directory structure
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Preparing build for Netlify deployment...');

// Paths
const outDir = path.resolve(__dirname, '../out');
const apiMocksDir = path.resolve(outDir, 'mocks/api');

// Ensure directories exist
if (!fs.existsSync(apiMocksDir)) {
  console.log('Creating mocks/api directory...');
  fs.mkdirSync(apiMocksDir, { recursive: true });
}

// Function to copy mock data if needed
function ensureMockDataExists() {
  const marketItemsPath = path.join(apiMocksDir, 'market-items.json');
  const marketImagesPath = path.join(apiMocksDir, 'market-images.json');
  
  // If mock data doesn't exist in output, create it
  if (!fs.existsSync(marketItemsPath)) {
    console.log('Creating mock market-items.json data...');
    const marketItems = {
      "success": true,
      "items": [
        { 
          "id": "1", 
          "name": "Sterlinbet 1000₺", 
          "points": 3500,
          "category": "betting",
          "description": "Market üzerinden satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Sterlinbet kullanıcı adınızı iletmeniz Gerekmektedir.",
          "imageUrl": "/market-img/sterlinbet.png",
          "stock": -1,
          "featured": true,
          "virtual": true
        },
        { 
          "id": "2", 
          "name": "Siribet 1000₺", 
          "points": 3500,
          "category": "betting",
          "description": "Market üzerinden satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Siribet kullanıcı adınızı iletmeniz Gerekmektedir.",
          "imageUrl": "/market-img/siribet.png",
          "stock": -1,
          "featured": true,
          "virtual": true
        },
        { 
          "id": "3", 
          "name": "Risebet 20$", 
          "points": 3000,
          "category": "betting",
          "description": "Market üzerinden satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Risebet kullanıcı adınızı iletmeniz Gerekmektedir.",
          "imageUrl": "/market-img/risebet 20$.png",
          "stock": -1,
          "featured": true,
          "virtual": true
        },
        { 
          "id": "4", 
          "name": "Risebet 10$", 
          "points": 2500,
          "category": "betting",
          "description": "Market üzerinden satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Risebet kullanıcı adınızı iletmeniz Gerekmektedir.",
          "imageUrl": "/market-img/Risebet 10$.png",
          "stock": -1,
          "featured": false,
          "virtual": true
        },
        { 
          "id": "5", 
          "name": "Zlot 1000₺", 
          "points": 3500,
          "category": "betting",
          "description": "Market üzerinden satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Zlot kullanıcı adınızı iletmeniz Gerekmektedir.",
          "imageUrl": "/market-img/zlot 1000t.png",
          "stock": -1,
          "featured": true,
          "virtual": true
        },
        { 
          "id": "6", 
          "name": "Baywin 1000₺", 
          "points": 3500,
          "category": "betting",
          "description": "Market üzerinden satın alma işlemi gerçekleştirdikten sonra Telegram Grubu üzerinden bizlere Baywin kullanıcı adınızı iletmeniz Gerekmektedir.",
          "imageUrl": "/market-img/baywin.png",
          "stock": -1,
          "featured": true,
          "virtual": true
        }
      ]
    };
    fs.writeFileSync(marketItemsPath, JSON.stringify(marketItems, null, 2));
  }
  
  if (!fs.existsSync(marketImagesPath)) {
    console.log('Creating mock market-images.json data...');
    const marketImages = {
      "images": [
        "/market-img/sterlinbet.png",
        "/market-img/siribet.png",
        "/market-img/risebet 20$.png",
        "/market-img/Risebet 10$.png",
        "/market-img/zlot 1000t.png",
        "/market-img/baywin.png"
      ],
      "count": 6
    };
    fs.writeFileSync(marketImagesPath, JSON.stringify(marketImages, null, 2));
  }
}

// Create an API redirect file (_redirects)
function createRedirects() {
  const redirectsPath = path.join(outDir, '_redirects');
  const redirects = [
    '# Redirect API calls to static JSON files',
    '/api/market/items /mocks/api/market-items.json 200',
    '/api/market/items/* /mocks/api/market-items.json 200',
    '/api/list-market-images /mocks/api/market-images.json 200',
    '/api/market/items/image-refresh/* /mocks/api/market-items.json 200',
    '/api/market/items/delete/* /mocks/api/market-items.json 200',
    '/api/upload/market-images /mocks/api/upload-response.json 200',
    '/api/upload/market-images/* /mocks/api/upload-response.json 200',
    
    '# Ensure password reset with token parameter works (SPA routing)',
    '/sifre-sifirlama/* /index.html 200',
    
    '# Handle client-side routing',
    '/*    /index.html   200',
  ].join('\n');
  
  fs.writeFileSync(redirectsPath, redirects);
  console.log('Created Netlify _redirects file');
}

// Copy static assets
function copyStaticAssets() {
  // Ensure market-img directory exists in output
  const marketImgDir = path.resolve(outDir, 'market-img');
  if (!fs.existsSync(marketImgDir)) {
    console.log('Creating market-img directory...');
    fs.mkdirSync(marketImgDir, { recursive: true });
  }
}

// Main execution
try {
  ensureMockDataExists();
  createRedirects();
  copyStaticAssets();
  
  console.log('Successfully prepared build for Netlify deployment!');
} catch (error) {
  console.error('Error preparing Netlify build:', error);
  process.exit(1);
} 