const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const standalonePath = path.join('.next', 'standalone');
const staticPath = path.join('.next', 'static');
const outputDir = path.join('deployment');
const outputStaticDir = path.join(outputDir, '.next', 'static');

// Create readme with deployment instructions
const readmeContent = `# SlotJack Deployment Package

This package contains a standalone Next.js application ready for deployment.

## Deployment Instructions

1. Copy all contents of this folder to your server
2. Make sure Node.js 18.17.0 or later is installed
3. Run the following command to start the server:

\`\`\`
node server.js
\`\`\`

By default, the server will run on port 3000. You can change this by setting the PORT environment variable:

\`\`\`
PORT=8080 node server.js
\`\`\`

## Files and Directories

- \`server.js\` - The Node.js server that runs your application
- \`.next/\` - Contains application assets and server files
- \`public/\` - Contains static files like images and fonts
- \`node_modules/\` - Contains minimal dependencies required to run the server

## Environment Variables

If you need to set environment variables, you can create a \`.env\` file in the root directory or set them in your hosting environment.

## Mobile Optimizations

This build includes mobile responsive views that adapt to various screen sizes.
`;

// Main function
async function createDeploymentPackage() {
  console.log('Creating deployment package...');
  
  // Clean or create output directory
  if (fs.existsSync(outputDir)) {
    console.log('Cleaning existing deployment directory...');
    fs.rmSync(outputDir, { recursive: true, force: true });
  }
  
  // Create output directories
  fs.mkdirSync(path.join(outputDir, '.next'), { recursive: true });
  
  // Copy standalone directory
  console.log('Copying standalone build...');
  execSync(`xcopy "${standalonePath}" "${outputDir}" /E /I /H`);
  
  // Copy static directory
  console.log('Copying static assets...');
  fs.mkdirSync(outputStaticDir, { recursive: true });
  execSync(`xcopy "${staticPath}" "${outputStaticDir}" /E /I /H`);
  
  // Create README
  console.log('Creating README...');
  fs.writeFileSync(path.join(outputDir, 'README.md'), readmeContent);
  
  console.log('Creating .gitignore...');
  fs.writeFileSync(path.join(outputDir, '.gitignore'), 'node_modules\n');
  
  console.log('Deployment package created successfully!');
  console.log(`You can find it in the '${outputDir}' directory.`);
}

// Run the script
createDeploymentPackage().catch(err => {
  console.error('Error creating deployment package:', err);
  process.exit(1);
}); 